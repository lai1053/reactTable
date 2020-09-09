import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { history } from 'edf-utils'

var listeners = Map()
let guideMenuList = {}
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.webapi = this.config.webapi
    }

    init = (state) => {
        let initState = getInitState()

        initState.data.other.username = sessionStorage['username']
        state = this.metaReducer.init(state, getInitState())

        return state
    }

    load = (state, { menu, org, token }, menuStyle) => {
        if (!menu || menu.length == 0)
            return state

        var defaultMenuItem, firstMenuItem, defaultOpens = [], menuKeyNameMap = {}, menuAppNameMap = {}

        const loop = (children) => {
            const ret = []
            children.forEach(child => {
                if(child.appProps && typeof JSON.parse(child.appProps) === 'object') {
                    child.appProps = JSON.parse(child.appProps)
                    child.appProps.dzgl = true
                }
                menuKeyNameMap[child.name] = child.key

                //history增加
                if (child.appName) {
                    menuAppNameMap[child.appName] = {
                        name: child.name,
                        props: child.appParams || {}
                    }
                    if (child.hasOwnProperty('isGuide')) {
                        guideMenuList[child.appName] = {
                            status: child.isGuide,
                            menuId: child.code
                        }
                    }
                    menuAppNameMap[child.appName].props.accessType = 0
                    menuAppNameMap[child.appName].props.isFolded = child.isFolded
                }

                if (!child.children) {
                    if (!firstMenuItem) {
                        firstMenuItem = child
                    }


                    if (child.isDefault) {
                        defaultMenuItem = child
                    }
                }
                else {
                    if (child.isExpand) {
                        defaultOpens.push(child)
                    }

                    loop(child.children)
                }
            })
            return ret
        }

        loop(menu)

        defaultMenuItem = defaultMenuItem || firstMenuItem
        //note 默认展现的APP
        if (!defaultMenuItem) {
            defaultMenuItem = menu ? menu[0] : {}
        }

        const menuSelectedKeys = fromJS(defaultMenuItem ? [defaultMenuItem.key] : [])
        const menuDefaultOpenKeys = fromJS(defaultOpens.map(o => o.key))
        let defaultContent = defaultMenuItem ? defaultMenuItem : {}
        defaultContent.orgId = org.id
        defaultContent.token = token
        state = this.metaReducer.sf(state, 'data.content', fromJS(defaultContent))
        //系统管理员时只显示管理菜单
        if(menu.length == 2 && menu[0].id == '150' && menu[1].id == '500'){ menu = [menu[1]]}
        state = this.metaReducer.sf(state, 'data.menu', fromJS(menu))
        return state
        // //console.log(menuStyle)
        // let fieldValueSetter = {
        //     'data.currentMenuType': menuStyle, // 写死
        //     'data.width': menuStyle == 2 ? false : true,
        //     'data.menu': fromJS(menu),
        //     'data.menuKeyNameMap': fromJS(menuKeyNameMap),
        //     'data.menuAppNameMap': fromJS(menuAppNameMap),
        //     'data.menuSelectedKeys': menuSelectedKeys,
        //     'data.menuDefaultOpenKeys': menuDefaultOpenKeys
        // }

        // state = this.metaReducer.sfs(state, fieldValueSetter)
        // let _defaultOpenKeys = this.getMenuSelectKeys(state, fromJS(menu))

        // state = this.metaReducer.sf(state, 'data.defaultOpenKeys', _defaultOpenKeys)
        // const childApp = history.getChildApp('ttk-dz-app-portal')

        // if (childApp)
        //     return this.setContent(state, '', childApp, {})
        // else {
        //     state = this.metaReducer.sf(state, 'data.isTabsStyle', true)
        //     state = this.metaReducer.sf(state, 'data.isShowMenu', true)
        //     state = this.metaReducer.sf(state, 'data.visible', false)
        //     return this.setContent(state, defaultContent.name, defaultContent.appName, defaultContent.appProps)
        // }
    }

    changeMenuType = (state, list, tabChangeWithMenu) => {
        let _currentMenuType = this.metaReducer.gf(state, 'data.currentMenuType')
        if (_currentMenuType == 2) list = []
        if (list && list.length > 0) {
            list = this.getMenuSelectKeys(state, fromJS(this.metaReducer.gf(state, 'data.menu')))
            if (tabChangeWithMenu) {
                list.push(tabChangeWithMenu)
            }
            state = this.metaReducer.sf(state, 'data.defaultOpenKeys', list)
        }
        else {
            state = this.metaReducer.sf(state, 'data.defaultOpenKeys', list)
        }
        return state
    }

    getMenuSelectKeys = (state, menuItem) => {
        //如果是收缩则不显示下级菜单
        let expendMenuKeys = []
        let _currentMenuType = this.metaReducer.gf(state, 'data.currentMenuType')
        let _fold = this.metaReducer.gf(state, 'data.width')
        if (_currentMenuType == 1) {
            //const menuItem = this.metaAction.gf('data.menu')
            if (menuItem.size > 0) {
                menuItem.map((item, index) => {
                    if (item.get('appName') == 'ttk-dz-app-home') return false
                    if (item.get('code').length == 2) {
                        //expendMenuKeys.push(item.get('key'))
                    }
                })
            }
        }

        //expendMenuKeys.push("1011")
        return expendMenuKeys
    }

    manageList = (state, { manageList }) => {
        if (!manageList) {
            manageList = []
            manageList.push({ name: '无' })
        }
        if (manageList) {
            state = this.metaReducer.sf(state, 'data.manageList', fromJS(manageList))
            state = this.metaReducer.sf(state, 'data.manageListShow', fromJS(manageList))
        }
        return state
    }
    setContent = (state, name, appName, appProps) => {
        //判断当前显示页签appName和要新打开的是否一致
        const currContent = this.metaReducer.gf(state, 'data.content')
        let appArr = ['ttk-edf-app-iframe', 'ttk-access-app-tranreport', 'edfx-business-subject-manage', 'ttk-taxapply-app-electronic-tax']
        if (currContent && appName == currContent.get('appName') && appArr.indexOf(appName) == -1)
            return state

        //如果要打开的app在map中，则修改props，反之添加到map中
        let menuAppNameMap = this.metaReducer.gf(state, 'data.menuAppNameMap')
        if (name && appName && appProps && menuAppNameMap.getIn([appName, 'name']) != name) {
            menuAppNameMap = menuAppNameMap.set(appName, fromJS({ name, props: appProps }))
            state = this.metaReducer.sf(state, 'data.menuAppNameMap', menuAppNameMap)
        } else if (name && appName && appProps && menuAppNameMap.getIn([appName, 'name']) == name) {
            menuAppNameMap = menuAppNameMap.updateIn([appName, 'props'], () => {
                return appProps.toJS ? appProps : fromJS(appProps)
            })
            state = this.metaReducer.sf(state, 'data.menuAppNameMap', menuAppNameMap)
        }
        /**
         * 参数问题，zhaoyun@ttk.com
         * 更新app对应的appProps
         */
        let _appProps = menuAppNameMap.getIn([appName, 'props'])
        if (_appProps && _appProps.size > 0) {
            appProps = _appProps
        }
        //更新content
        let content = null
        if (appProps && appProps.size) {
            content = fromJS({ name, appName, appProps: appProps.toJS(), editing: false })
        } else {
            content = fromJS({ name, appName, appProps, editing: false })
        }
        state = this.metaReducer.sf(state, 'data.content', content)
        //hit为true说明将要打开的app已经打开
        var openTabs = this.metaReducer.gf(state, 'data.openTabs') || List()
        var hit = openTabs.findIndex(o => o.get('name') == name || o.get('appName') == appName) != -1

        let orgSign = false

        if (appProps !== undefined && appProps.size > 0 && appProps !== '{}') {
            //从企业管理和创建企业返回才会执行
            if (appProps.get('isTabsStyle') == false && appProps.get('isShowMenu') == false) {
                state = this.metaReducer.sf(state, 'data.isTabsStyle', true)
                state = this.metaReducer.sf(state, 'data.isShowMenu', true)
                hit = false
                orgSign = false
                content = fromJS({ name: '首页', appName: 'ttk-dz-app-home', appProps: { isFolded: 0 } })
                openTabs = List()
                state = this.metaReducer.sf(state, 'data.content', content)
                let listener = listeners.get(`onTabFocus_ttk-dz-app-home`)
                if (listener) {
                    setTimeout(() => listener(), 16)
                }
            }

        }
        const isTabsStyle = this.metaReducer.gf(state, 'data.isTabsStyle')

        if (!hit) {

            if (isTabsStyle && openTabs.size > 0) {
                openTabs = openTabs.push(content)
            }

            else {
                openTabs = List().push(content)
            }
            state = this.metaReducer.sf(state, 'data.openTabs', openTabs)
        }
        else {
            if (!isTabsStyle) {
                openTabs = List().push(content)
                state = this.metaReducer.sf(state, 'data.openTabs', openTabs)
            }
            else {
                // 如果name相同，appName不同，则更新content和openTabs
                if(openTabs.findIndex(o => o.get('name') == name) != -1) {
                    let oldAppName = openTabs.getIn([openTabs.findIndex(o => o.get('name') == name), 'appName'])
                    if (oldAppName != appName) {
                        openTabs = openTabs.updateIn([openTabs.findIndex(o => o.get('name') == name), 'appName'], () => {
                            return appName
                        })
                        openTabs = openTabs.updateIn([openTabs.findIndex(o => o.get('appName') == appName), 'appProps'], () => {
                            return appProps
                        })
                        state = this.metaReducer.sf(state, 'data.openTabs', openTabs)
                        return state
                    }
                }
                //appName相同，但name不相同的情况下，更新opentabs，执行ontabfocus事件
                if (openTabs.findIndex(o => o.get('name') != name && o.get('appName') == appName) != -1) {
                    openTabs = openTabs.updateIn([openTabs.findIndex(o => o.get('appName') == appName), 'name'], () => {
                        return name
                    })
                }
                //更新openTab的appprops
                openTabs = openTabs.updateIn([openTabs.findIndex(o => o.get('appName') == appName), 'appProps'], () => {
                    return appProps
                })
                state = this.metaReducer.sf(state, 'data.openTabs', openTabs)
                let listener = listeners.get(`onTabFocus_${appName}`)
                if (listener) {
                    setTimeout(() => listener(appProps), 16)
                }
            }
        }


        // if (orgSign) {
        //     setTimeout(() => {
        //         history.pushChildApp('ttk-dz-app-portal')
        //     }, 0)
        // }
        // else {
        //     setTimeout(() => {
        //         history.pushChildApp('ttk-dz-app-portal', content.get('appName'))
        //     }, 0)
        // }

        return state
    }

    setGlobalContent = (state, tabInfo) => {
        //判断是否已有页签
        let globalTabs = this.metaReducer.gf(state, 'data.globalTabs').toJS()
        const flag = globalTabs.findIndex(o => o.orgId == tabInfo.orgId && o.name == tabInfo.name && o.appName == tabInfo.appName)
        if(flag != -1) {
            globalTabs[flag].refresh = new Date().getTime()
            globalTabs[flag].params = tabInfo.params
            state = this.metaReducer.sfs(state, {
                'data.currentIndex': globalTabs[flag].key,
                'data.content': fromJS(globalTabs[flag]),
                'data.globalTabs': fromJS(globalTabs)
            })
            return state
        }
        globalTabs.push(tabInfo)
        state = this.metaReducer.sfs(state, {
            'data.currentIndex': tabInfo.key,
            'data.content': fromJS(tabInfo),
            'data.globalTabs': fromJS(globalTabs)
        })
        return state
    }

    globalTabChange = (state, app = {}) => {
        let listener = listeners.get(`onTabFocus_${app.appName}`)
        if (listener) {
            setTimeout(() => listener(app.params), 16)
        }
        return state
    }

    closeContent = (state, name) => {
        const curContent = this.metaReducer.gf(state, 'data.content')
        const appName = curContent.get('appName')
        return this.closeContentReally(state, name)
    }

    onlyCloseContent = (state, appName) => {
        let openTabs = this.metaReducer.gf(state, 'data.openTabs').toJS()
        let index = null
        for (let i = 0; i < openTabs.length; i++) {
            if (openTabs[i].appName.indexOf(appName) > -1) {
                index = i
                break
            }
        }
        openTabs.splice(index, 1)
        state = this.metaReducer.sf(state, 'data.openTabs', fromJS(openTabs))
        return state
    }

    closeContentReally = (state, name, fun, res, appName = "ttk-dz-app-home") => {
        var openTabs = this.metaReducer.gf(state, 'data.openTabs') || List()
        let desktop = openTabs.toJS().slice(0, 1)
        var hitIndex = openTabs.findIndex(o => o.get('name') == name)
        if (name == 'all' || name == 'toggleManage') {
            state = this.metaReducer.sf(state, 'data.width', true)
            state = this.metaReducer.sf(state, 'data.openTabs', fromJS(desktop))
            state = this.metaReducer.sf(state, 'data.content', openTabs.get(0))
            if (name == 'toggleManage') {
                // history.pullChildApp(appName, fromJS(desktop))
                return state
            }
            let listener = listeners.get(`onTabFocus_ttk-dz-app-home`)
            if (listener) {
                setTimeout(() => listener(name == 'toggleManage' ? { action: 'toggleManage' } : {}), 16)
            }
            return state
        }
        state = this.removeEventListener(state, name)
        openTabs = openTabs.remove(hitIndex)
        state = this.metaReducer.sf(state, 'data.openTabs', openTabs)

        state = this.metaReducer.sf(state, 'data.content', openTabs.get(openTabs.size - 1))
        //判断左树状态
        let currentApp = openTabs.get(openTabs.size - 1).toJS(),
            currentMenuStyle = this.metaReducer.gf(state, 'data.currentMenuType')

        if (currentMenuStyle == 2) {
            if (currentApp.appProps.isFolded == 1) {
                state = this.metaReducer.sf(state, 'data.width', false)
            } else {
                state = this.metaReducer.sf(state, 'data.width', true)
            }
        }
        let activeApp = this.metaReducer.gf(state, 'data.content').toJS()
        activeApp.appProps.accessType = 0
        let listener = listeners.get(`onTabFocus_${activeApp.appName}`)
        if (listener) {
            setTimeout(() => listener(Map.isMap(activeApp.appProps) ? activeApp.appProps : Map(activeApp.appProps) || {}), 16)
            //去掉延时器，避免当连续卸载APP时，回调函数将卸载掉的app的state重新写入reduxstate中，导致再次打开时报错
            // listener(Map.isMap(activeApp.appProps) ? activeApp.appProps : Map(activeApp.appProps) || {})
        }
        // history.pullChildApp(appName, openTabs)
        return state
    }

    closeAll = (state) => {
        state = this.metaReducer.sf(state, 'data.openTabs', new List())
        return this.metaReducer.sf(state, 'data.content', new Map())
    }
    reInit = (state, content, openTabs) => {
        state = this.metaReducer.sf(state, 'data.openTabs', openTabs)
        return this.metaReducer.sf(state, 'data.content', content)
    }
    addEventListener = (state, eventName, handler) => {
        const currContent = this.metaReducer.gf(state, 'data.content')
        const appName = currContent.get('appName')

        eventName = eventName + '_' + appName
        if (!listeners.get(eventName)) {
            listeners = listeners.set(eventName, handler)
        }

        return state
    }

    removeEventListener = (state, name) => {
        if (name == 'all') { // 删除所有页签的listener
            listeners = Map()
            return state
        }
        let appName
        const openTabs = this.metaReducer.gf(state, 'data.openTabs').toJS() || []
        for (let i = 0; i < openTabs.length; i++) {
            if (openTabs[i].name == name) {
                appName = openTabs[i].appName
            }
        }

        // 删除当前页签的listener
        let listenersKey = Object.keys(listeners.toJS())
        for (let i = 0; i < listenersKey.length; i++) {
            if (listenersKey[i].indexOf('_' + appName) > -1 &&
                listeners.get(listenersKey[i])) {

                listeners = listeners.remove(listenersKey[i])
            }
        }

        return state
    }
    //判断页面是否处于编辑状态
    editing = (state, appName, status) => {
        let openTabs = this.metaReducer.gf(state, 'data.openTabs').toJS()
        openTabs.forEach(o => {
            if (o.appName == appName) {
                o.editing = status
            }
        })
        state = this.metaReducer.sf(state, 'data.openTabs', fromJS(openTabs))
        return state
    }
    appList = (state, response, action) => {
        if (action && action == "reload") {
            let listener = listeners.get(`onTabFocus_ttk-dz-app-home`)
            if (listener) {
                // 1:更新桌面applist
                setTimeout(() => listener(), 16)
            }
        }
        state = this.metaReducer.sf(state, 'data.desktopAppList', fromJS(response))
        return state
    }

    //企业列表搜索
    manageListShow = (state, list) => {
        if (list.length == 0) {
            return state = this.metaReducer.sf(state, 'data.manageListShow', fromJS([{ name: '无匹配项', disabled: true }]))
        }
        return state = this.metaReducer.sf(state, 'data.manageListShow', fromJS(list))
    }
    //resize事件
    resize = (state) => {
        let listener = listeners.toJS()
        let keys = Object.keys(listener)
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].indexOf('onResize') != -1) {
                setTimeout(() => listener[keys[i]](), 16)
            }
        }
        return state
    }
    //客服、二维码
    weixin = (state, status) => {
        state = this.metaReducer.sf(state, 'data.service.qrcodeVisible', status)
        return state
    }
    //content放大缩小事件
    fold = (state, option) => {
        let status = option['data.isShowMenu'] ? 1 : 0
        //通知app放大缩小状态
        let listener = listeners.toJS()
        let keys = Object.keys(listener)
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].indexOf('enlargeClick') != -1) {
                setTimeout(() => listener[keys[i]](status), 16)
            }
        }
        return this.metaReducer.sfs(state, option)
    }
    //关闭app内的Guide
    closeGuide = (state, appName) => {
        guideMenuList[appName].status = false
        console.log(guideMenuList)
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
