import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { history } from 'edf-utils'

var listeners = Map()
//存放需要guide的menu及状态
let guideMenuList = {}
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.webapi = this.config.webapi
    }

    init = (state, option) => {
        let initState = getInitState()


        initState.data.other.username = sessionStorage['username']
        state = this.metaReducer.init(state, getInitState())

        if (this.config.menu && !this.config.webapi.getMenu) {
            return this.load(state, { menu: this.config.menu })
        }
        var defaultMenuItem, firstMenuItem, defaultOpens = [], menuKeyNameMap = [], menuAppNameMap = []
        state = this.metaReducer.sf(state, 'data.menuKeyNameMap', fromJS(menuKeyNameMap))
        state = this.metaReducer.sf(state, 'data.menuAppNameMap', fromJS(menuAppNameMap))
        let availableOrg = sessionStorage.getItem('currentOrgStatus')
        if (availableOrg == 1) {
            state = this.metaReducer.sf(state, 'data.isTabsStyle', false)
            state = this.metaReducer.sf(state, 'data.isShowMenu', false)
            state = this.metaReducer.sf(state, 'data.visible', false)
            return this.setContent(state, '企业管理', 'edf-company-manage')
        } else if (availableOrg == 2) {
            state = this.metaReducer.sf(state, 'data.isTabsStyle', false)
            state = this.metaReducer.sf(state, 'data.isShowMenu', false)
            state = this.metaReducer.sf(state, 'data.visible', false)

            return this.setContent(state, '新建企业', 'edf-company-manage-add')
        }
        return state
    }


    load = (state, { menu, originMenu, vatTaxpayer }, menuStyle) => {
        if (!menu || menu.length == 0)
            return state
        //办税工作台对接
        if (sessionStorage['thirdPartysourceType'] == 'bsgzt' && !!sessionStorage['appInfo']) {
            const appInfo = JSON.parse(sessionStorage['appInfo'])
            if (appInfo.appName == 'ttk-taxapply-app-taxlist') {
                menu = menu.filter(m => m.id == 18 || m.id == 10)
                menu.forEach(m => {
                    if (m.code == 10) {
                        m.name = "发票管理"
                        let newArr = m.children.filter(c => {
                            if (c.code == 1010) {
                                c.name = "销项发票"
                            } else if (c.code == 1011) {
                                c.name = "进项发票"
                            }
                            return c.code == 1010 || c.code == 1011
                        })
                        m.children = newArr
                    }
                    if (m.code == 18) {
                        m.children.forEach(c => {
                            if (c.code == 1810) {
                                c.isDefault = true
                            }
                        })
                    }
                })
            } else if (appInfo.appName == 'ttk-scm-app-sa-invoice-list') {
                //三方对接，办税工作台，有发票菜单则加入发票菜单
                let menuItem = menu.filter( (i) => i.id == '18'), fprz
                if(menuItem.length > 0){
                    fprz = menuItem[0].children.filter( (i) => i.id == '1808')
                    fprz = fprz && fprz[0]
                }
                const invoiceCert = []
                for (let i = 0; i < menu.length; i++) {
                    if (menu[i].id == 1012) {
                        invoiceCert.push(menu[i])
                    } else if (menu[i].children && menu[i].children.length > 0) {
                        let cmenu = menu[i].children
                        for (let j = 0; j < cmenu.length; j++) {
                            if (cmenu[j].id == 1012) {
                                invoiceCert.push(cmenu[j])
                            }
                        }
                    }
                }
                menu = menu.filter(m => m.id == 10)
                menu.forEach(m => {
                    if (m.code == 10) {
                        m.name = "发票管理"
                        let newArr = m.children.filter(c => {
                            if (c.code == 1010) {
                                c.name = "销项发票"
                            } else if (c.code == 1011) {
                                c.name = "进项发票"
                            }
                            return c.code == 1010 || c.code == 1011
                        })
                        const menu1 = {
                            "id": 1014,
                            "name": "进项台账",
                            "code": "1014",
                            "appName": "ttk-scm-app-pu-invoice-ledger",
                            "requestType": 0,
                            "parentId": 10,
                            "versionTag": 0,
                            "showOrder": 202,
                            "isVisible": 1,
                            "isFolded": 0,
                            "expireIsOpen": false,
                            "ts": "2019-05-30 10:32:54.0",
                            children: [],
                            key: '1014'
                        }
                        const menu2 = {
                            "id": 1013,
                            "name": "销项台账",
                            "code": "1013",
                            "appName": "ttk-scm-app-sa-invoice-ledger",
                            "requestType": 0,
                            "parentId": 10,
                            "versionTag": 0,
                            "showOrder": 201,
                            "isVisible": 1,
                            "isFolded": 0,
                            "expireIsOpen": false,
                            "ts": "2019-05-30 10:32:54.0",
                            children: [],
                            key: '1013'
                        }
                        if (vatTaxpayer == 2000010001) {
                            newArr.push(menu1, menu2)
                        } else if (vatTaxpayer == 2000010002) {
                            newArr.push(menu2)
                        }
                        if (invoiceCert.length > 0) {
                            newArr = newArr.concat(invoiceCert)
                        }
                        m.children = newArr.sort((a, b) => a.id - b.id)
                    }
                })
                if(fprz) menu.push(fprz)
            }
        }
        var defaultMenuItem, firstMenuItem, defaultOpens = [], menuKeyNameMap = {}, menuAppNameMap = {}

        const loop = (children) => {
            const ret = []
            children.forEach(child => {
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
                if (!child.children || child.children.length == 0) {
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
        const defaultContent = defaultMenuItem ? defaultMenuItem : {}
        //menuStyle
        let fieldValueSetter = {
            'data.currentMenuType': '1',// 当值为1时全部展开；当值为2时只展开第一个
            'data.menu': fromJS(menu),
            'data.menuKeyNameMap': fromJS(menuKeyNameMap),
            'data.menuAppNameMap': fromJS(menuAppNameMap),
            'data.menuSelectedKeys': menuSelectedKeys,
            'data.menuDefaultOpenKeys': menuDefaultOpenKeys
        }
        state = this.metaReducer.sfs(state, fieldValueSetter)
        let _defaultOpenKeys = this.getMenuSelectKeys(state, fromJS(menu))

        state = this.metaReducer.sf(state, 'data.defaultOpenKeys', _defaultOpenKeys)
        const currentContent = this.metaReducer.gf(state, 'data.content').toJS()
        let childApp = history.getChildApp('edfx-app-portal') || currentContent.appName

        if (childApp) {
            let appId = this.metaReducer.gf(state, 'data.appVersion')
            if (appId == 114) {
                if (childApp == 'inv-app-single-custom-list') childApp = 'inv-app-single-custom-small-list'
                let listener = listeners.get(`onTabFocus_${childApp}`)
                if (listener) {

                    setTimeout(() => listener(), 16)
                }
            }
            let name = this.getAppName(originMenu,childApp)
            return this.setContent(state, name, childApp, {})
        }
        else {
            state = this.metaReducer.sf(state, 'data.isTabsStyle', true)
            state = this.metaReducer.sf(state, 'data.isShowMenu', true)
            state = this.metaReducer.sf(state, 'data.visible', false)
            //新代账第一个页签不是首页不开启
            return (sessionStorage['appId'] != 114 || sessionStorage['appId'] == 114 && (defaultContent.name == '首页' || defaultContent.name == '我的桌面')) ?
                this.setContent(state, defaultContent.name, defaultContent.appName, defaultContent.appProps) : state
        }
    }

    //根据appname获取name
    getAppName = (menu,appName) =>{
        if(menu.length == 0) return ''
        for(var i=0,len=menu.length;i<len;i++){
            if(menu[i].appName == appName){
                return menu[i].name
            }
        }  
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
        //let _fold = this.metaReducer.gf(state, 'data.width')
        if (_currentMenuType === 1) {
            //const menuItem = this.metaAction.gf('data.menu')
            if (menuItem.size > 0) {
                menuItem.map((item) => {
                    if (item.get('appName') == 'edfx-app-home') return false
                    if (item.get('children').size > 0) {
                        expendMenuKeys.push(item.get('key'))
                    }
                })
            }
        } else if(_currentMenuType === '1') {
            //const menuItem = this.metaAction.gf('data.menu')
            if (menuItem.size > 0) {
                menuItem.forEach((item) => {
                    if (item.get('children').size > 0) {
                        expendMenuKeys.push(item.get('key'))
                        return false
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
        //判断是否需要打开app内的引导
        const appId = this.metaReducer.gf(state, 'data.appVersion')
        if (appId == 114 && appName.indexOf("orgId") == -1) {
            let currentOrg = this.metaReducer.context.get("currentOrg")
            if (appName.indexOf("?") > -1) {

                appName = appName + "&orgId=" + currentOrg.id
            }
            else {
                appName = appName + "?orgId=" + currentOrg.id
            }
        }
        let keys = Object.keys(guideMenuList)
        if (keys.indexOf(appName) != -1) {
            if (!appProps) {
                appProps = {}
            }
            appProps.isGuide = guideMenuList[appName].status
            appProps.isMenuCode = guideMenuList[appName].menuId
        }
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
        //先兼容 edfx-app-home 因为添加 org 无法取出 props 问题
        if(!_appProps && appName.includes('edfx-app-home')){
            appProps = menuAppNameMap.getIn(['edfx-app-home', 'props'])
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
                content = fromJS({ name: '我的桌面', appName: 'edfx-app-home', appProps: { isFolded: 0 } })
                openTabs = List()
                state = this.metaReducer.sf(state, 'data.content', content)
                let listener = listeners.get(`onTabFocus_edfx-app-home`)
                if (listener) {
                    setTimeout(() => listener(), 16)
                }
            }

        }
        const isTabsStyle = this.metaReducer.gf(state, 'data.isTabsStyle')
        // const appId = this.metaReducer.gf(state, 'data.appVersion')

        if (!hit) {
            if (openTabs.size > 0) {
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
                let listener = listeners.get(`onTabFocus_${appName}`)
                if (listener) {
                    setTimeout(() => listener(appProps), 16)
                }
            }
            else {
                // 如果name相同，appName不同，则更新content和openTabs
                if (openTabs.findIndex(o => o.get('name') == name) != -1) {
                    let oldAppName = openTabs.getIn([openTabs.findIndex(o => o.get('name') == name), 'appName'])
                    if (oldAppName != appName) {
                        openTabs = openTabs.updateIn([openTabs.findIndex(o => o.get('name') == name), 'appName'], () => {
                            return appName
                        })
                        openTabs = openTabs.updateIn([openTabs.findIndex(o => o.get('appName') == appName), 'appProps'], () => {
                            return appProps
                        })
                        state = this.metaReducer.sf(state, 'data.openTabs', openTabs)
                        if (appId != 114) {
                            setTimeout(() => {
                                history.pushChildApp('edfx-app-portal', content.get('appName'))
                            }, 0)
                        }

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

        if (appId != 114) {
            if (orgSign) {
                setTimeout(() => {
                    history.pushChildApp('edfx-app-portal')
                }, 0)
            }
            else {
                setTimeout(() => {
                    history.pushChildApp('edfx-app-portal', content.get('appName'))
                }, 0)
            }
        }

        return state
    }
    //删除已经打开的卡片页的id
    deleteOpenTabsAppProps = (state, name, appName, appProps) => {
        //hit为true说明将要打开的app已经打开
        var openTabs = this.metaReducer.gf(state, 'data.openTabs') || List()
        var hit = openTabs.findIndex(o => o.get('name') == name || o.get('appName') == appName) != -1
        if (hit) {
            let oldAppProps = openTabs.getIn([openTabs.findIndex(o => o.get('name') == name || o.get('appName') == appName), 'appProps']);
            if (appProps instanceof Object) {
                Object.keys(appProps).forEach(item => {
                    if (oldAppProps.get(item) === appProps[item]) {
                        oldAppProps.delete(item)
                    }
                })
                //更新openTab的appprops
                openTabs = openTabs.updateIn([openTabs.findIndex(o => o.get('appName') == appName), 'appProps'], () => {
                    return oldAppProps
                })
                state = this.metaReducer.sf(state, 'data.openTabs', openTabs)
            } else if (appProps instanceof Array) {
                Object.keys(oldAppProps.toJS()).forEach(item => {
                    if (appProps.filter(o => o[item] === oldAppProps.get(item)).length) {
                        oldAppProps.delete(item)
                    }
                })
                //更新openTab的appprops
                openTabs = openTabs.updateIn([openTabs.findIndex(o => o.get('appName') == appName), 'appProps'], () => {
                    return oldAppProps
                })
                state = this.metaReducer.sf(state, 'data.openTabs', openTabs)
            }
        }
        return state;
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

    closeContentReally = (state, name, fun, res, appName = "edfx-app-home") => {
        var openTabs = this.metaReducer.gf(state, 'data.openTabs') || List()
        let desktop = openTabs.toJS().slice(0, 1)
        var hitIndex = openTabs.findIndex(o => o.get('name') == name)
        if (name == 'all' || name == 'toggleManage') {
            state = this.metaReducer.sf(state, 'data.width', true)
            state = this.metaReducer.sf(state, 'data.openTabs', fromJS(desktop))
            state = this.metaReducer.sf(state, 'data.content', openTabs.get(0))
            if (name == 'toggleManage') {
                history.pullChildApp(appName, fromJS(desktop))
                return state
            }
            let listener = listeners.get(`onTabFocus_edfx-app-home`)
            if (listener) {
                setTimeout(() => listener(name == 'toggleManage' ? { action: 'toggleManage' } : {}), 16)
            }
            return state
        }
        state = this.removeEventListener(state, name)
        openTabs = openTabs.remove(hitIndex)
        state = this.metaReducer.sf(state, 'data.openTabs', openTabs)
        //兼容单页签关闭
        let openApp = openTabs.size == 0 ? {appProps: {}} : openTabs.get(openTabs.size - 1)
        state = this.metaReducer.sf(state, 'data.content', fromJS(openApp))
        //判断左树状态
        let currentApp = openApp,
            currentMenuStyle = this.metaReducer.gf(state, 'data.currentMenuType')

        if (currentMenuStyle == 2) {
            if (currentApp.appProps.isFolded == 1) {
                state = this.metaReducer.sf(state, 'data.width', true)
            } else {
                state = this.metaReducer.sf(state, 'data.width', true)
            }
        }
        let activeApp = this.metaReducer.gf(state, 'data.content').toJS()
        activeApp.appProps.accessType = 0
        let listener = activeApp.appName && listeners.get(`onTabFocus_${activeApp.appName}`)
        if (listener) {
            setTimeout(() => listener(Map.isMap(activeApp.appProps) ? activeApp.appProps : Map(activeApp.appProps) || {}), 16)
            //去掉延时器，避免当连续卸载APP时，回调函数将卸载掉的app的state重新写入reduxstate中，导致再次打开时报错
            // listener(Map.isMap(activeApp.appProps) ? activeApp.appProps : Map(activeApp.appProps) || {})
        }

        const appId = this.metaReducer.gf(state, 'data.appVersion')
        if (appId != 114) {
            history.pullChildApp(appName, openTabs)
        }
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
        if (!currContent) return state
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
        const openTabs = this.metaReducer.gf(state, 'data.openTabs').toJS()
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
        let openTabs = this.metaReducer.gf(state, 'data.openTabs')

        for (var i = 0; i < openTabs.size; i++) {
            if (openTabs.get(i).get('appName') == appName) {
                openTabs = openTabs.update(i, item => item.set('editing', status))
                break
            }
        }

        state = this.metaReducer.sf(state, 'data.openTabs', openTabs)
        return state
    }
    appList = (state, response, action) => {
        if (action && action == "reload") {
            let listener = listeners.get(`onTabFocus_edfx-app-home`)
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
    stateChange = (state, address, data) => {
        return state = this.metaReducer.sf(state, address, data)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
