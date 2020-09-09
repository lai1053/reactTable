import React from 'react'
import { Menu, Dropdown, Icon, Notification } from 'edf-component'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import { history, fetch, environment, xml } from 'edf-utils'
import { consts } from 'edf-consts'
import config from './config'
import { log } from 'util';
import moment from 'moment'
import debounce from 'lodash.debounce'
import isEqual from 'lodash.isequal'

let { changeTheme, changeThemeforIE } = window.changeTheme
let loadSplitCss = false

const borwserVersion = environment.getBrowserVersion()
if (borwserVersion.ie && borwserVersion.version < 10) {
    loadSplitCss = true
}

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections

        injections.reduce('init')

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        //没有token跳转到登录
        if (!sessionStorage.getItem('_accessToken')) {
            this.component.props.onRedirect(this.config.goAfterLogout)
            return
        }

        //history增加
        history.listen('ttk-es-app-glmanage', this.listen)
        //定义回调
        this.tabCloseListens = {}
        this.tabChangeListens = {}

        this.load()

    }


    //history增加
    listen = (childApp, location, action) => {
        const currentAppName = this.metaAction.gf('data.content.appName')
        const targetAppName = childApp
        if (!targetAppName) {
            this.injections.reduce('closeAll')
            return
        }

        if (targetAppName == currentAppName) {
            return
        }

        //this.setContent('', targetAppName, {})
        if (targetAppName.includes('from=pay')) {
            window.location.reload()
        }
    }

    componentWillUnmount = () => {
        history.unlisten('ttk-es-app-glmanage', this.listen)
    }


    onMenuMouseOver = (e) => {
        let flag = this.metaAction.gf('data').toJS()
        this.injections.reduce('updateObj', {
            'data.width': !flag.width,
            'data.menuMathRandom': Math.random()
        })
        if (flag.width) {
            //this.metaAction.sf('data.currentMenuType', 2)
            this.injections.reduce('changeMenuType', [])
        } else {
            this.injections.reduce('changeMenuType', [1])
        }

    }

    onScrollMouseOver = (e) => {
        this.injections.reduce('updateSingle', 'data.currentMenuStyle','menuscroll')
    }
    onScrollMouseLeave = () => {
        this.injections.reduce('updateSingle', 'data.currentMenuStyle','nomenuscroll')
    }
    componentWillReceiveProps = async (nextProps) => {
        if(!isEqual(nextProps.isRefresh,  this.component.props.isRefresh)) {
            this.load()
        }
    }


    load = async (option) => {
        // await this.webapi.portal.init()
        let response = await this.webapi.portal.portal();//获取左侧菜单接口
        let menuStyle = response.menuTreeMemory.state ? 1 : 1

        //以下为模拟的菜单======================Begin
        let menu = []
        let userRoles = await this.webapi.user.getUserDetail();
        let roles = userRoles?userRoles.role.map(item=>item.code.toString()):[]
        // console.info(roles)
        if(roles.includes('100000')){
            menu.push({
                appName: "",
                code: "200",
                expireIsOpen: false,
                iconFont: "xdzdaohang-bumenrenyuan",
                id: 200,
                isCheck: false,
                isFolded: 0,
                isVisible: 1,
                isWrite: 100,
                key: "200",
                name: "部门人员",
                parentId: 0,
                requestType: 0,
                showOrder: 200,
                children:[{
                    appName: "ttk-es-app-institutional-settings",
                    children: [],
                    code: "20000",
                    expireIsOpen: false,
                    id: 20000,
                    isCheck: false,
                    isFolded: 0,
                    isVisible: 1,
                    isWrite: 100,
                    key: "20000",
                    name: "机构设置",
                    parentId: 200,
                    requestType: 0,
                    showOrder: 200,
                    versionTag: 0
                },{
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
                },{
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
                },{
                    appName: "ttk-es-app-rolemanage",
                    children: [],
                    code: "20030",
                    expireIsOpen: false,
                    id: 20030,
                    isCheck: false,
                    isFolded: 0,
                    isVisible: 1,
                    isWrite: 100,
                    key: "20030",
                    name: "岗位管理",
                    parentId: 200,
                    requestType: 0,
                    showOrder: 230,
                    versionTag: 0
                },{
                    appName: "ttk-es-app-postauthority",
                    children: [],
                    code: "20040",
                    expireIsOpen: false,
                    id: 20040,
                    isCheck: false,
                    isFolded: 0,
                    isVisible: 1,
                    isWrite: 100,
                    key: "20040",
                    name: "岗位权限",
                    parentId: 200,
                    requestType: 0,
                    showOrder: 240,
                    versionTag: 0
                },
                    // {
                    //     appName: "ttk-es-app-personaltaxcode",
                    //     children: [],
                    //     code: "20050",
                    //     expireIsOpen: false,
                    //     id: 20050,
                    //     isCheck: false,
                    //     isFolded: 0,
                    //     isVisible: 1,
                    //     isWrite: 100,
                    //     key: "20050",
                    //     name: "个税密码测试",
                    //     parentId: 200,
                    //     requestType: 0,
                    //     showOrder: 250,
                    //     versionTag: 0
                    // }
                ],
                versionTag: 0
            })
        }else{
            menu.push({
                appName: "",
                code: "200",
                expireIsOpen: false,
                iconFont: "xdzdaohang-bumenrenyuan",
                id: 200,
                isCheck: false,
                isFolded: 0,
                isVisible: 1,
                isWrite: 100,
                key: "200",
                name: "部门人员",
                parentId: 0,
                requestType: 0,
                showOrder: 200,
                children:[{
                    appName: "ttk-es-app-institutional-settings",
                    children: [],
                    code: "20000",
                    expireIsOpen: false,
                    id: 20000,
                    isCheck: false,
                    isFolded: 0,
                    isVisible: 1,
                    isWrite: 100,
                    key: "20000",
                    name: "机构设置",
                    parentId: 200,
                    requestType: 0,
                    showOrder: 200,
                    versionTag: 0
                },{
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
                },{
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
                //     {
                //     appName: "ttk-es-app-rolemanage",
                //     children: [],
                //     code: "20030",
                //     expireIsOpen: false,
                //     id: 20030,
                //     isCheck: false,
                //     isFolded: 0,
                //     isVisible: 1,
                //     isWrite: 100,
                //     key: "20030",
                //     name: "岗位管理",
                //     parentId: 200,
                //     requestType: 0,
                //     showOrder: 230,
                //     versionTag: 0
                // },{
                //     appName: "ttk-es-app-postauthority",
                //     children: [],
                //     code: "20040",
                //     expireIsOpen: false,
                //     id: 20040,
                //     isCheck: false,
                //     isFolded: 0,
                //     isVisible: 1,
                //     isWrite: 100,
                //     key: "20040",
                //     name: "岗位权限",
                //     parentId: 200,
                //     requestType: 0,
                //     showOrder: 240,
                //     versionTag: 0
                // },
                    // {
                    //     appName: "ttk-es-app-personaltaxcode",
                    //     children: [],
                    //     code: "20050",
                    //     expireIsOpen: false,
                    //     id: 20050,
                    //     isCheck: false,
                    //     isFolded: 0,
                    //     isVisible: 1,
                    //     isWrite: 100,
                    //     key: "20050",
                    //     name: "个税密码测试",
                    //     parentId: 200,
                    //     requestType: 0,
                    //     showOrder: 250,
                    //     versionTag: 0
                    // }
                ],
                versionTag: 0
            })
        }

       /*//新增商务平台页面
       menu.push({
        appName: "",
        code: "300",
        expireIsOpen: false,
        iconFont: "xdzdaohang-wodezhanghu",
        id: 300,
        isCheck: false,
        isFolded: 0,
        isVisible: 1,
        isWrite: 100,
        key: "300",
        name: "我的账户",
        parentId: 0,
        requestType: 0,
        showOrder: 200,
        children:[{
            appName: "ttk-edf-app-iframe",
            isIframe:true, //增加判断字段
            children: [],
            code: "30000",
            expireIsOpen: false,
            id: 30000,
            isCheck: false,
            isFolded: 0,
            isVisible: 1,
            isWrite: 100,
            key: "30000",
            name: "账户详情",
            parentId: 300,
            requestType: 0,
            showOrder: 200,
            versionTag: 0
        },{
            appName: "ttk-edf-app-iframe",
            isIframe:true, //增加判断字段
            children: [],
            code: "30010",
            expireIsOpen: false,
            id: 30010,
            isCheck: false,
            isFolded: 0,
            isVisible: 1,
            isWrite: 100,
            key: "30010",
            name: "消费明细",
            parentId: 300,
            requestType: 0,
            showOrder: 200,
            versionTag: 0
        }
       ],
        versionTag: 0
   })*/
        this.injections.reduce('load', {
            menu: menu,
            vatTaxpayer: response.org.vatTaxpayer,
            yy:this.component.props.yy,
        }, menuStyle)
        if(this.component.props.yy){
            if(this.component.props.yy == 1){
                this.injections.reduce('updateSingle', 'data.selectedKeys',["20010"])
            }else if(this.component.props.yy == 2){
                this.injections.reduce('updateSingle', 'data.selectedKeys',["20020"])
            }
        }else {
            this.injections.reduce('updateSingle', 'data.selectedKeys',["20000"])
        }
        //=======================================End

        //以下为动态获取菜单信息，请勿删除
        // console.log(response.menu, 'response.menu')
        // if (response.menu) {
        //     this.injections.reduce('load', {
        //         menu: response.menu,
        //         vatTaxpayer: response.org.vatTaxpayer,
        //     }, menuStyle)
        // }

        this.injections.reduce('changeMenuType', [10])
        this.injections.reduce('updateObj', {
            'data.menuMathRandom': Math.random(),
            'data.headCtrl': true,
            'data.isShowSearch': false,
        })

    }

    handleKeyDown(e, index) {
        if (e.ctrlKey && e.altKey) {
        }
    }

    handleVisibleChange = (visible) => {
        this.injections.reduce('updateSingle', 'data.visible',visible)
    }
    userVisibleChange = (visible) => {
        this.injections.reduce('updateSingle', 'data.userMenuVisible',visible)
    }
    menuControl = async (e) => { //帮助中心控制面板
        if (this.metaAction.gf('data.showPanel') == 'block') {
            this.injections.reduce('updateObj', {
                'data.animation':'in',
                'data.showPanel':'none'
            })
        } else {
            this.injections.reduce('updateObj', {
                'data.animation':'in',
                'data.showPanel':'block'
            })
        }
    }
    hidePanel = () => {
        this.injections.reduce('updateObj', {
            'data.animation':'out',
            'data.showPanel':'none'
        })
    }
    animationEnd = () => {
        this.metaAction.gf('data.animation') == 'out' &&
            this.injections.reduce('updateSingle', 'data.showPanel','none')
    }
    goLanding = async () => {   //跳转着陆页
        let newWindow
        if (location.href.indexOf(consts.DOMAIN_DEV_INNER) != -1 ||
            location.href.indexOf(consts.DOMAIN_DEV_OUTER) != -1 ||
            location.href.indexOf(consts.DOMAIN_LOCALHOST) != -1 ||
            location.href.indexOf(consts.DOMAIN_LOCALHOST_IP) != -1 ||
            location.href.indexOf(consts.DOMAIN_DEBUG_INNER) != -1 ||
            location.href.indexOf(consts.DOMAIN_DEBUG_OUTER) != -1) {
            newWindow = window.open(consts.DOMAIN_GJ_DEV);
        } else if (location.href.indexOf(consts.DOMAIN_DEMO) != -1) {
            newWindow = window.open(consts.DOMAIN_GJ_DEMO);
        } else if (location.href.indexOf(consts.DOMAIN_ONLINE) != -1) {
            newWindow = window.open(consts.DOMAIN_GJ_ONLINE);
        }
        let landing = await this.webapi.landing.code()
        if (location.href.indexOf(consts.DOMAIN_DEV_INNER) != -1 ||
            location.href.indexOf(consts.DOMAIN_DEV_OUTER) != -1 ||
            location.href.indexOf(consts.DOMAIN_LOCALHOST) != -1 ||
            location.href.indexOf(consts.DOMAIN_LOCALHOST_IP) != -1 ||
            location.href.indexOf(consts.DOMAIN_DEBUG_INNER) != -1 ||
            location.href.indexOf(consts.DOMAIN_DEBUG_OUTER) != -1) {
            newWindow.location = consts.DOMAIN_GJ_DEV + '/?' + landing;
        } else if (location.href.indexOf(consts.DOMAIN_DEMO) != -1) {
            newWindow.location = consts.DOMAIN_GJ_DEMO + '?' + landing
        } else if (location.href.indexOf(consts.DOMAIN_ONLINE) != -1) {
            newWindow.location = consts.DOMAIN_GJ_ONLINE + '?' + landing
        }
    }

    getPortalStyle = () => {
        let skin = localStorage['skin'] || '#0066B3'
        return {
            backgroundColor: skin
        }
    }

    getPhoto = () => {
        const user = this.getCurrentUser()
        if (user) {
            if (user.sex == 1) {
                return male
            } else if (user.sex == 2) {
                return female;
            } else {
                return other
            }
        }
        return other
    }

    getCurrentUser = () => this.metaAction.context.get('currentUser') || {}

    getCurrentOrg = () => this.metaAction.context.get('currentOrg') || {}

    getUserNickName = () => {
        const user = this.getCurrentUser()
        if (user && user.nickname) {
            return user.nickname;
        } else {
            return sessionStorage.getItem('username')
        }
        return ""
    }

    getOrgName = () => {
        const org = this.getCurrentOrg()
        if (org) {
            return org.name;
        }
        return ""
    }

    resize = () => {
        // let __data = this.metaAction.gf('data')
        // if (__data) {
        //     let data = __data.toJS()
        //     window.onresize = () => {
        //         if (data.widthPersonStatus == false) {
        //             let width = window.innerWidth > 1024 ? true : true;
        //             this.metaAction.sf('data.width', width);
        //         }
        //     }
        //     this.metaAction.sf('data.service.mathRandom', Math.random())
        // }

    }
    switchMenu = () => {
        let flag = this.metaAction.gf('data').toJS()
        // this.metaAction.sf('data.width', !flag.width)
        // this.metaAction.sf('data.widthPersonStatus', true)
        // this.metaAction.sf('data.menuMathRandom', Math.random())
        this.injections.reduce('updateObj', {
            'data.width': !flag.width,
            'data.widthPersonStatus': true,
            'data.menuMathRandom': Math.random(),
        })
        if (flag.width) {
            //this.metaAction.sf('data.currentMenuType', 2)
            this.injections.reduce('changeMenuType', [])
        } else {
            this.injections.reduce('changeMenuType', [1])
        }
    }
    getMenuChildren = () => {
        const menu = this.metaAction.gf('data.menu').toJS()

        let currentURI = location.href.toUpperCase().indexOf('DEVELOP') > -1

        if (currentURI) {
            let menuPro1 = {
                appName: 'ttk-edf-app-iframe',
                appParams: {
                    'src': ''
                },
                code: '5030',
                id: 5030,
                isFolded: 0,
                isVisible: 1,
                children: [],
                key: '5030',
                name: '测试菜单1',
                parentId: 50,
                requestType: 0,
                showOrder: 909,
                versionTag: 0,
                ts: "2018-07-24 10:03:52.0"
            }
            let menuPro2 = {
                appName: 'ttk-edf-app-iframe',
                appParams: {
                    'src': ''
                },
                code: '5040',
                id: 5040,
                isFolded: 0,
                isVisible: 1,
                children: [],
                key: '5040',
                name: '测试菜单2',
                parentId: 50,
                requestType: 0,
                showOrder: 910,
                versionTag: 0,
                ts: "2018-07-24 10:03:52.0"
            }
            if (menu[6].children) {
                menu[6].children.push(menuPro1)
                menu[6].children.push(menuPro2)
            }
        }
        const loop = (children, num) => {
            const ret = [];
            if (num == 1) {
                children.forEach(child => {
                    if (child.id != "1") {
                        ret.push({
                            name: child.key,
                            key: child.key,
                            className: "{{data.currentMenuType==2?(data.width ? 'level-first show-content' : 'level-first hide-content'):(data.width ? 'level-first2 show-content' : 'level-first2 hide-content')}}",
                            title: child.children.length !== 0 && [{
                                name: 'title',
                                component: '::span',
                                className: 'leftNavMenu',

                                children: [{
                                    name: 'icon',
                                    component: 'Icon',
                                    fontFamily: 'edficon',
                                    className: 'menu-icon',
                                    type: child.iconFont
                                }, {
                                    name: 'title',
                                    component: '::span',
                                    className: 'menu-content',

                                    key: Math.random(),
                                    children: child.name
                                }, {
                                    name: 'badgeImg',
                                    component: '::img',
                                    _visible: child.versionTag == 1,
                                    className: "{{data.width ? 'right_beta' : 'top_beta'}}",
                                    src: "{{$getBeta()}}",
                                }]
                            }],
                            component: child.children.length == 0 ? 'Menu.Item' : 'Menu.SubMenu',
                            children: child.children.length == 0 ? [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                className: 'menu-icon',
                                type: child.iconFont //'link'
                            }, {
                                name: 'title',
                                component: '::span',
                                className: 'menu-content',
                                children: child.name
                            }] : loop(child.children, 2)
                        })
                    }
                })
            } else {
                children.forEach(child => {

                    if (!child.children || child.children.length == 0) {
                        ret.push({
                            name: child.key,
                            key: child.key,
                            //className: child.appName == this.metaAction.gf('data.selectCurrentMenu') ? 'left-menu-submenu-menuitem moji ant-menu-item-selected' : 'left-menu-submenu-menuitem moji',
                            className: 'left-menu-submenu-menuitem moji',
                            component: 'Menu.Item',
                            children: [child.name, {
                                name: 'badgeImg',
                                component: '::img',
                                _visible: child.versionTag == 1,
                                className: "{{data.width ? 'right_beta' : 'top_beta'}}",
                                src: "{{$getBeta()}}",
                            }],
                        })
                    } else {
                        if (child.name.length > 4) {
                            ret.push({
                                name: child.key,
                                key: child.key,
                                // className: 'left-menu-itemgroup',
                                className: "{{data.currentMenuType==1 ? 'left-menu-itemgroup jchlLongGroup' : 'left-menu-itemgroup'}}",
                                title: {
                                    name: 'title',
                                    component: '::span',
                                    children: child.name
                                },
                                component: "{{data.currentMenuType==1 ? 'Menu.SubMenu' : 'Menu.ItemGroup'}}",
                                children: loop(child.children, 2)
                            })
                        } else {
                            ret.push({
                                name: child.key,
                                key: child.key,
                                className: 'left-menu-itemgroup',
                                title: {
                                    name: 'title',
                                    component: '::span',
                                    children: child.name
                                },
                                component: "{{data.currentMenuType==1 ? 'Menu.SubMenu' : 'Menu.ItemGroup'}}",
                                children: loop(child.children, 2)
                            })
                        }
                    }
                })
            }
            return ret
        }

        return {
            _isMeta: true,
            value: loop(menu, 1)
        }
    }
    //获取beta图片
    getBeta = () => {
        return this.metaAction.gf('data.width') ? beta_right : beta_top
    }

    onOpenChange = (item) => {
        let newItem = [],
            lastSubMenu = []
        if (item) {
            if (item.length > 0) {
                item.map((i) => {
                    if (i.length == 4) {
                        lastSubMenu = new Array(i)
                    } else {
                        newItem.push(i)
                    }
                })
            }
        }
        if (newItem.length > 0) {
            newItem = newItem.concat(lastSubMenu)
            let updateArrList = {
                'data.menuMathRandom': Math.random(),
                'data.defaultOpenKeys': newItem
            }
            this.injections.reduce('updateObj', updateArrList)
            /*控制MENU滚动条位置 */
            let pageY = window.event.pageY || 0,
                currentY = $('.mk-layout ttk-es-app-glmanage-content-left .menuscroll').scrollTop() || 0

            if (currentY > 100) {
                window.setTimeout(function () {
                    $('.mk-layout ttk-es-app-glmanage-content-left .menuscroll').scrollTop(parseInt(pageY) + 100)
                }, 10)
            }


            /*
            domAlign(document.getElementsByClassName('ant-menu-submenu-open')[3].childNodes[1].childNodes[2].childNodes[0], document.getElementById('menucontainer'), {
                offsetTop: 100,
                offsetBottom: 0,
                offsetLeft: 0,
                offsetRight: 0
            })*/
        }

    }
    createLink = () => {
        let element = document.head.querySelector('.el-element')
        // if(element){

        //     element.parentNode.removeChild(element)
        // }

        let origin = location.origin
        let link = document.createElement('link')
        link.className = 'el-element'
        link.rel = 'stylesheet'
        link.type = 'text/css'
        link.id = 'skin'
        return link
    }


    menuClick = async (e) => {
        // console.log(e, 'eeeee')
        // debugger
        if (e.domEvent) {
            e.domEvent.stopPropagation()
        }
        const menu = this.metaAction.gf('data.menu').toJS()

        let currentURI = location.href.toUpperCase().indexOf('DEVELOP') > -1

        if (currentURI) {
            let menuPro1 = {
                appName: 'ttk-edf-app-iframe',
                appParams: {
                    'src': 'http://140.143.151.71:8081/index.html'
                },
                code: '5030',
                id: 5030,
                isFolded: 0,
                isVisible: 1,
                children: [],
                key: '5030',
                name: '测试菜单1',
                parentId: 50,
                requestType: 0,
                showOrder: 909,
                versionTag: 0,
                ts: "2018-07-24 10:03:52.0"
            }
            let menuPro2 = {
                appName: 'ttk-edf-app-iframe',
                appParams: {
                    'src': 'http://124.193.174.170:20000/tplus/view/login.html'
                },
                code: '5040',
                id: 5040,
                isFolded: 0,
                isVisible: 1,
                children: [],
                key: '5040',
                name: '测试菜单2',
                parentId: 50,
                requestType: 0,
                showOrder: 910,
                versionTag: 0,
                ts: "2018-07-24 10:03:52.0"
            }
            if (menu[6].children) {
                menu[6].children.push(menuPro1)
                menu[6].children.push(menuPro2)
            }
        }


        const find = (children) => {
            for (let child of children) {
                if (child.key == e.key) {
                    return child
                }

                if (e.key == '1030010' && child.key == '1030') {
                    if (child.children) {
                        if (child.children.length > 0) {
                            if (child.children[0].children) {
                                if (child["code"] == '1030') {
                                    child["name"] = child.children[0].name || '存货台账'
                                    child["code"] = child.children[0].code || '1030010'
                                    child["key"] = child.children[0].key || '1030010'
                                    child["appName"] = child["appName"] + "?key=1030010"
                                    //后面优化
                                }
                            }
                        }
                    }
                    return child
                }
                if (child.children) {
                    let o = find(child.children)
                    if (o) return o
                }
            }
        }

        const hit = find(menu)
        if (hit.appParams) {
            hit.appParams.accessType = 0
            hit.appParams.isFolded = hit.isFolded
            hit.appParams.isGuide = hit.isGuide || false
            hit.appParams.isMenuCode = hit.code
            hit.appParams.openType = 'menu'
        } else {
            hit.appParams = {
                accessType: 0,
                isFolded: hit.isFolded,
                isGuide: hit.isGuide || false,
                isMenuCode: hit.code,
                openType: 'menu'
            }
        }
        if (!!hit.appProps) {
            Object.assign(hit.appParams, JSON.parse(hit.appProps))
        }
        //拼接appname
        if (hit.appParams.linkCode) {
            hit.appName = hit.appName + '?linkcode=' + hit.appParams.linkCode
        }

        let needFolded = this.metaAction.gf('data.currentMenuType') == 2
        if (needFolded) {
            hit.isFolded && hit.isFolded == 1 ? this.metaAction.sf('data.width', false) : this.metaAction.sf('data.width', true)
        }
        //requestType为1时 浏览器新页签打开
        // console.log(appBasicInfo, hit)
        if (hit.requestType == 1) {
            let url = hit.appProps && JSON.parse(hit.appProps).url
            window.open(url)
        }else if(appBasicInfo && (appBasicInfo.runningMode == 1 && hit.appName == 'edfx-app-org') || (appBasicInfo.runningMode == 1 && hit.appName == 'ttk-taxapply-app-taxlist')) {
            let appName = 'ttk-edf-app-iframe?code=' + hit.code
            let appkey = appBasicInfo.publicCloudAppKey
            let src = await this.webapi.getOwnCode()
            let skin = encodeURIComponent(localStorage['skin'])
            src = src.replace('edfx-app-org', hit.appName) + '&sourceType=oem&theme=' + skin
            // src = src.replace('http://test.aierp.cn:8089', 'http://localhost:8083')
            console.log(src)
            this.setContent(hit.name, appName, {src})
        } else if(hit.isIframe){
            let src;
            if('30000' === hit.code){
                src = await this.webapi.orderCenter.getInfo()
            }else if('30010' === hit.code){
                src = await this.webapi.orderCenter.getConsume()
            }
            this.setContent(hit.name, 'ttk-edf-app-iframe?code=' + hit.code, {src})
        }else {   
            this.setContent(hit.name, hit.appName, hit.appParams)
            //埋点
            //_hmt && _hmt.push(['_trackEvent', '系统管理', '菜单',hit.name])
        }

        /*末级点击时二级全部收缩*/
        /*点击三级时，二级不收缩 */
        if (!needFolded) {
            let menuItem = this.metaAction.gf('data.defaultOpenKeys'),
                newItem = []
            const lastSubMenu = new Array(hit.key)
            let parentId = String(hit.parentId)
            if (menuItem) {
                if (menuItem.length > 0) {
                    menuItem.map((i) => {
                        if (i.length == 2) {
                            newItem.push(i)
                        }

                        if (i.length == 4) {
                            if (lastSubMenu.toString().substr(0, 4) == i) {
                                newItem.push(i)
                            } else if (parentId.substr(0, 4) == i) {
                                newItem.push(i)
                            }
                        }
                    })
                }
            }
            if (newItem.length > 0) {
                newItem = newItem.concat(lastSubMenu)
                // this.metaAction.sf('data.menuMathRandom', Math.random())
                //
                // this.metaAction.sf('data.selectedKeys', lastSubMenu)
                // this.metaAction.sf('data.defaultOpenKeys', newItem)

                this.injections.reduce('updateObj', {
                    'data.menuMathRandom': Math.random(),
                    'data.selectedKeys': lastSubMenu,
                    'data.defaultOpenKeys': newItem,
                })
            }
        }

        this.injections.reduce('updateSingle', 'data.selectedKeys',fromJS([e.key]))
    }

    tabChange = async (key) => {

        if (key == 'more') return
        let appName = this.metaAction.gf('data.content').get('appName')
        let cb = this.tabChangeListens[appName] && this.tabChangeListens[appName]()
        if (cb) {
            const ret = await this.metaAction.modal('confirm', {
                title: '是否离开',
                content: `当前数据尚未保存，还要离开吗？`,
            })
            if (!ret) {
                return
            } else {
                this.removeTabChangeListen(appName)
            }
        }
        const openTabs = this.metaAction.gf('data.openTabs')
        let curr = openTabs.find(o => o.get('name') == key)
        let _app = curr.toJS()
        if (_app.appProps) {
            _app.appProps.accessType = 0
            _app.appProps.openType = 'tabChange'
        } else {
            _app.appProps = {
                accessType: 0,
                openType: 'tabChange'
            }
        }

        let needFolded = this.metaAction.gf('data.currentMenuType') == 2
        if (needFolded) {
            _app.appProps.isFolded && _app.appProps.isFolded == 1 ? this.metaAction.sf('data.width', false) : this.metaAction.sf('data.width', true)
        }
        curr = fromJS(_app)
        this.setContent(curr.get('name'), curr.get('appName'), curr.get('appProps'))

        /**set default menu select status */

        if (!needFolded) {
            let menuItem = this.metaAction.gf('data.defaultOpenKeys'),
                newItem = []
            if (menuItem) {
                let hitKey = curr.get('appProps').get('isMenuCode')
                const lastSubMenu = new Array(hitKey)
                if (hitKey && hitKey.length > 4) {
                    let parentId = String(hitKey.substr(0, 4))
                    if (menuItem.length > 0) {
                        menuItem.map((i) => {
                            if (i.length == 2) {
                                newItem.push(i)
                            }

                            if (i.length == 4) {
                                if (lastSubMenu.toString().substr(0, 4) == i) {
                                    newItem.push(i)
                                } else if (parentId.substr(0, 4) == i) {
                                    newItem.push(i)
                                }
                            }
                        })
                    }

                    if (newItem.length > 0) {
                        newItem = newItem.concat(lastSubMenu)
                        newItem = newItem.concat(parentId)

                        this.injections.reduce('updateObj', {
                            'data.menuMathRandom': Math.random(),
                            'data.selectedKeys': lastSubMenu,
                            'data.defaultOpenKeys': newItem,
                        })
                    }
                }
                else {
                    this.injections.reduce('updateObj', {
                        'data.selectedKeys': [curr.get('appProps').get('isMenuCode')],
                        'data.menuMathRandom': Math.random()
                    })
                }

            }


            // this.metaAction.sfs({
            //     'data.selectedKeys': [curr.get('appProps').get('isMenuCode')],
            // })
            //this.metaAction.sf('data.selectCurrentMenu', curr.get('appName'))
        }
    }


    tabEdit = async (key, action) => {
        if (key == 'more') return
        //key不存在，则返回
        let hasApp = false,
            openTabs = this.metaAction.gf('data.openTabs').toJS(),
            status = false
        let that = this

        let appName = null
        openTabs.forEach(o => {
            if (o.name == key || o.appName == key) {
                status = o.editing
                appName = o.appName
                hasApp = true
            }
        })
        if (!hasApp) return
        let cb = this.tabCloseListens[appName] && this.tabCloseListens[appName]()
        if (action == 'remove') {
            if (cb || status) {
                const ret = await this.metaAction.modal('confirm', {
                    title: '是否离开',
                    content: `${key}尚未保存，还要离开吗？`,
                    onOk() {
                        that.injections.reduce('closeContent', key)
                        that.injections.reduce('updateSingle', 'data.mathRandom',Math.random())
                        that.removeTabsCloseListen(appName)
                        return
                    },
                    onCancel() {
                        return
                    }
                })
            } else {
                // console.log(key, 'key')
                this.injections.reduce('closeContent', key)
                this.injections.reduce('updateSingle', 'data.mathRandom',Math.random())
            }
        }
    }

    closeTabs = (e) => {
        let key = e.key,
            name = null,
            status = false,
            that = this,
            content = this.metaAction.gf('data.content').toJS(),
            openTabs = this.metaAction.gf('data.openTabs').toJS()
        for (let i = 0; i < openTabs.length; i++) {
            if (key == 'all') {
                if (openTabs[i].editing) {
                    status = true
                    name = openTabs[i].name
                    break
                }
            } else {
                if (openTabs[i].appName == content.appName) {
                    status = openTabs[i].editing
                    if (status) name = content.name
                    break
                }
            }
        }

        if (status) {
            const ret = this.metaAction.modal('confirm', {
                title: '是否离开',
                content: `${name}尚未保存，还要离开吗？`,
                onOk() {
                    if (key == 'all') {
                        that.injections.reduce('closeContent', 'all')
                        that.injections.reduce('updateSingle', 'data.mathRandom',Math.random())
                    } else {
                        that.injections.reduce('closeContent', content.name)
                        that.injections.reduce('updateSingle', 'data.mathRandom',Math.random())
                    }
                    return
                },
                onCancel() {
                    return
                }
            })
        } else {
            if (e.key == 'all') {
                this.injections.reduce('closeContent', 'all')
                this.injections.reduce('updateSingle', 'data.mathRandom',Math.random())
            } else {
                if (content && content.appName != 'edfx-app-home') {
                    this.injections.reduce('closeContent', content.name)
                    this.injections.reduce('updateSingle', 'data.mathRandom',Math.random())
                }
            }
        }
    }
    //获取extraMenuWidth
    getExtraMenuWidth = () => {
        let style = {}
        let content = this.metaAction.gf('data.content').toJS()
        if (content.appName == "edfx-app-home") {
            style.width = environment.isDevMode() ? "120px" : "auto"
        } else {
            style.width = environment.isDevMode() ? "auto" : "38px"
        }
        return style
    }
    //panel控制
    showControlPanel = async () => {
        this.injections.reduce('updateObj', {
            'data.showControlPanel': 'block',
            'data.panelAnimation': 'in'
        })
        //请求appList
        let response = await this.webapi.desktop.queryAppList()
        if (response) {
            this.injections.reduce('updateSingle', 'data.ctrlPanel',response)
            this.injections.reduce('appList', response)
        }
    }

    getOrgs = async () => {
        let manageList = await this.webapi.org.queryList()
        this.injections.reduce('manageList', {
            manageList
        })
    }


    //切换选中状态
    panelCheckChange = (e, index) => {
        let appList = this.metaAction.gf('data.desktopAppList').toJS()
        appList[index].checked = !appList[index].checked
        this.injections.reduce('appList', appList)
    }
    hidePanelEnd = () => {
        let animation = this.metaAction.gf('data.panelAnimation')
        if (animation == 'in') return
        this.injections.reduce('updateSingle', 'data.showControlPanel','none')
    }
    hideCtrlPanel = async (str) => {
        this.injections.reduce('updateSingle', 'data.panelAnimation','out')
        if (str == 'save') {
            let appList = this.metaAction.gf('data.desktopAppList').toJS()
            let response = await this.webapi.desktop.saveAppList(appList)
            this.injections.reduce('appList', appList, 'reload')
            this.injections.reduce('updateSingle', 'data.ctrlPanel',appList)
        } else if (str == 'cancel') {
            let appList = this.metaAction.gf('data.ctrlPanel')
            this.injections.reduce('appList', appList)
        }
    }
    /**
     * reinit时调用
     * 记录当前打开的所有页签
     * 关闭所有后重新打开
     */
    reInitContent = async () => {
        let content = this.metaAction.gf('data.content')
        let openTabs = this.metaAction.gf('data.openTabs')
        this.injections.reduce('closeAll')
        setTimeout(() => {
            this.injections.reduce('reInit', content, openTabs)
        }, 0)
    }
    //从企业管理和创建企业返回时调用
    setContent = (name, appName, appProps = {}) => {
        this.injections.reduce('setContent', name, appName, appProps)
    }
    deleteOpenTabsAppProps = (name, appName, appProps = {}) => {
        this.injections.reduce('deleteOpenTabsAppProps', name, appName, appProps)
    }

    //判断页面是否处于编辑状态
    editing = (name, status) => {
        this.injections.reduce('editing', name, status)
    }


    /**
     * dev模式下才显示开发帮助
     */
    isDevMode = () => {
        return environment.isDevMode()
    }



    fold = () => {
        if (this.metaAction.gf('data.fold') == 'zhankai') {
            let reduceArr = {
                'data.isShowMenu': false,
                'data.fold': 'shouhui'
            }
            this.injections.reduce('fold', reduceArr)
        } else {
            let reduceArr = {
                'data.isShowMenu': true,
                'data.fold': 'zhankai'
            }
            this.injections.reduce('fold', reduceArr)
        }
    }


   //添加tab关闭监听事件
    addTabsCloseListen = (appName, fn) => {
        this.tabCloseListens[appName] = fn
    }
    //移除tab关闭监听事件
    removeTabsCloseListen = (appName) => {
        this.tabCloseListens[appName] && delete this.tabCloseListens[appName]
    }
    //添加tab切换监听事件
    addTabChangeListen = (appName, fn) => {
        this.tabChangeListens[appName] = fn
    }
    //移除tab切换监听事件
    removeTabChangeListen = (appName) => {
        this.tabChangeListens[appName] && delete this.tabChangeListens[appName]
    }
}


export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })
    return ret
}
