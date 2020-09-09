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
        // console.log(this.config.menu, 'this.config.menu')
        if (this.config.menu && !this.config.webapi.getMenu) {
            return this.load(state, { menu: this.config.menu })
        }
        var defaultMenuItem, firstMenuItem, defaultOpens = [], menuKeyNameMap = [], menuAppNameMap = []
        state = this.metaReducer.sfs(state, {
            'data.menuKeyNameMap': fromJS(menuKeyNameMap),
            'data.menuAppNameMap': fromJS(menuAppNameMap)
        })
        let availableOrg = sessionStorage.getItem('currentOrgStatus')
        if (availableOrg == 1) {
            state = this.metaReducer.sfs(state, {
                'data.isTabsStyle': false,
                'data.isShowMenu': false,
                'data.visible': false
            })
            return this.setContent(state, '企业管理', 'edf-company-manage')
        } else if (availableOrg == 2) {
            state = this.metaReducer.sfs(state, {
                'data.isTabsStyle': false,
                'data.isShowMenu': false,
                'data.visible': false
            })

            return this.setContent(state, '新建企业', 'edf-company-manage-add')
        }
        return state
    }


    load = (state, { menu, vatTaxpayer ,yy}, menuStyle) => {
        if (!menu || menu.length == 0)
            return state
        
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
        let k1 = {
            appName: "ttk-es-app-department-manage",
            children: [],
            code: "20010",
            expireIsOpen: false,
            id: 20010,
            isCheck: false,
            isFolded: 0,
            isVisible: 1,
            isWrite: 100,
            key: "20010",
            name: "部门管理",
            parentId: 200,
            requestType: 0,
            showOrder: 210,
            versionTag: 0
        };
        let k2 = {
            appName: "ttk-es-app-usermanage",
            children: [],
            code: "20020",
            expireIsOpen: false,
            id: 20020,
            isCheck: false,
            isFolded: 0,
            isVisible: 1,
            isWrite: 100,
            key: "20020",
            name: "人员管理",
            parentId: 200,
            requestType: 0,
            showOrder: 220,
            versionTag: 0
        }
        if(yy == 1){
            defaultMenuItem = k1
        }else if(yy == 2) {
            defaultMenuItem = k2
        }

        const menuSelectedKeys = fromJS(defaultMenuItem ? [defaultMenuItem.key] : [])
        const menuDefaultOpenKeys = fromJS(defaultOpens.map(o => o.key))
        const defaultContent = defaultMenuItem ? defaultMenuItem : {}
        //menuStyle
        let fieldValueSetter = {
            'data.currentMenuType': 1,
            'data.menu': fromJS(menu),
            'data.menuKeyNameMap': fromJS(menuKeyNameMap),
            'data.menuAppNameMap': fromJS(menuAppNameMap),
            'data.menuSelectedKeys': menuSelectedKeys,
            'data.menuDefaultOpenKeys': menuDefaultOpenKeys
        }

        state = this.metaReducer.sfs(state, fieldValueSetter)
        let _defaultOpenKeys = this.getMenuSelectKeys(state, fromJS(menu))

        state = this.metaReducer.sf(state, 'data.defaultOpenKeys', _defaultOpenKeys)
        const childApp = history.getChildApp('ttk-es-app-glmanage')

        if (childApp)
            return this.setContent(state, '', childApp, {})
        else {
            state = this.metaReducer.sfs(state, {
                'data.isTabsStyle': true,
                'data.isShowMenu': true,
                'data.visible': false
            })
            return this.setContent(state, defaultContent.name, defaultContent.appName, defaultContent.appProps)
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
        if (_currentMenuType == 1) {
            //const menuItem = this.metaAction.gf('data.menu')
            if (menuItem.size > 0) {
                menuItem.map((item, index) => {
                    if (item.get('appName') == 'ttk-es-app-institutional-settings') return false
                    if (item.get('children').size > 0) {
                        expendMenuKeys.push(item.get('key'))
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
            state = this.metaReducer.sfs(state, {
                'data.manageList': fromJS(manageList),
                'data.manageListShow': fromJS(manageList)
            })
        }
        return state
    }
    setContent = (state, name, appName, appProps) => {
        //判断是否需要打开app内的引导
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
        // console.log(List().toJS(), openTabs.toJS(), ' List()')

        var hit = openTabs.findIndex(o => o.get('name') == name || o.get('appName') == appName) != -1

        let orgSign = false

        if (appProps !== undefined && appProps.size > 0 && appProps !== '{}') {
            //从企业管理和创建企业返回才会执行
            if (appProps.get('isTabsStyle') == false && appProps.get('isShowMenu') == false) {
                state = this.metaReducer.sfs(state, {
                    'data.isTabsStyle': true,
                    'data.isShowMenu': true
                })
                hit = false
                orgSign = false
                content = fromJS({ name: '我的桌面', appName: 'ttk-es-app-institutional-settings', appProps: { isFolded: 0 } })
                openTabs = List()
                state = this.metaReducer.sf(state, 'data.content', content)
                let listener = listeners.get(`onTabFocus_ttk-es-app-institutional-settings`)
                if (listener) {
                    setTimeout(() => listener(), 16)
                }
            }

        }
        const isTabsStyle = this.metaReducer.gf(state, 'data.isTabsStyle')
        const appId = this.metaReducer.gf(state, 'data.appVersion')

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
                        if(appId != 114) {
                            setTimeout(() => {
                                history.pushChildApp('ttk-es-app-glmanage', content.get('appName'))
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

        if(appId != 114) {
            if (orgSign) {
                setTimeout(() => {
                    history.pushChildApp('ttk-es-app-glmanage')
                }, 0)
            }
            else {
                setTimeout(() => {
                    history.pushChildApp('ttk-es-app-glmanage', content.get('appName'))
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

    closeContentReally = (state, name, fun, res, appName = "ttk-es-app-institutional-settings") => {
        var openTabs = this.metaReducer.gf(state, 'data.openTabs') || List()
        let desktop = openTabs.toJS().slice(0, 1)
        var hitIndex = openTabs.findIndex(o => o.get('name') == name)
        if (name == 'all' || name == 'toggleManage') {
            state = this.metaReducer.sfs(state, {
                'data.width': true,
                'data.openTabs': fromJS(desktop),
                'data.content': openTabs.get(0)
            })
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
        state = this.metaReducer.sfs(state, {
            'data.openTabs': openTabs,
            'data.content': openTabs.get(openTabs.size - 1)
        })

        //判断左树状态
        let currentApp = openTabs.get(openTabs.size - 1).toJS(),
            currentMenuStyle = this.metaReducer.gf(state, 'data.currentMenuType')

        if (currentMenuStyle == 2) {
            if (currentApp.appProps.isFolded == 1) {
                state = this.metaReducer.sf(state, 'data.width', true)
            } else {
                state = this.metaReducer.sf(state, 'data.width', true)
            }
        }
        // let activeApp = this.metaReducer.gf(state, 'data.content').toJS()
        // activeApp.appProps.accessType = 0
        // let listener = listeners.get(`onTabFocus_${activeApp.appName}`)
        // if (listener) {
        //     setTimeout(() => listener(Map.isMap(activeApp.appProps) ? activeApp.appProps : Map(activeApp.appProps) || {}), 16)
        //     //去掉延时器，避免当连续卸载APP时，回调函数将卸载掉的app的state重新写入reduxstate中，导致再次打开时报错
        //     // listener(Map.isMap(activeApp.appProps) ? activeApp.appProps : Map(activeApp.appProps) || {})
        // }
        // history.pullChildApp(appName, openTabs)
        return state
    }

    closeAll = (state) => {
        return this.metaReducer.sfs(state, {
            'data.openTabs': new List(),
            'data.content': new Map()
        })
    }
    reInit = (state, content, openTabs) => {
        return this.metaReducer.sfs(state, {
            'data.openTabs': openTabs,
            'data.content': content
        })
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
            let listener = listeners.get(`onTabFocus_edfx-app-home`)
            if (listener) {
                // 1:更新桌面applist
                setTimeout(() => listener(), 16)
            }
        }
        state = this.metaReducer.sf(state, 'data.desktopAppList', fromJS(response))
        return state
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

    updateObj = (state,obj) => {
        return this.metaReducer.sfs(state,obj)
    }

    updateSingle = (state,path,value) => {
        return this.metaReducer.sf(state,path,value)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
