import React from 'react'
import { Icon, Notification } from 'edf-component'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import { history, fetch, environment, xml } from 'edf-utils'
import config from './config'
import moment from 'moment'
import debounce from 'lodash.debounce'
import female from './img/female_t.png'
import male from './img/male_t.png'
import other from './img/other_t.png'
import beta_top from './img/beta_top.png'
import beta_right from './img/beta_right.png'
import qrcodeImg from './img/qrcodecopy.jpg'
import { Base64 } from 'edf-utils'
import { consts } from 'edf-consts'


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
        this.manageListShow = debounce(this.manageListShow, 500);
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.expireDate = 30    // 距离多少天提示要购买
        this.companyBuyInfo = '' //当前企业订购详情
        //设置token
        sessionStorage['_accessToken'] = sessionStorage['_accessGlToken']
        injections.reduce('init')

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        //没有token跳转到登录
        if (!sessionStorage.getItem('_accessToken')) {
            this.component.props.onRedirect(this.config.goAfterLogout)
            return
        }
        //更新皮肤
        let skin = localStorage.getItem('skin') || '#058BB3'
        this.toggleColor(skin)

        //history增加
        history.listen('ttk-dz-app-portal', this.listen)
        //定义回调
        this.tabCloseListens = {}
        this.tabChangeListens = {}
        //设置企业logo和页面title
        if(sessionStorage['registerInfo']){
            let registerInfo = JSON.parse(sessionStorage['registerInfo'])
            this.metaAction.sf('data.logoImg',registerInfo.companyLogoUrl)
            document.title = registerInfo.companyName
        }
        this.load()
    }

    getPortalStyle = (attr, skin) => {
        let obj = {}
        if (attr == 'border') {
            obj[attr] = `1px solid ${skin}`
        } else {
            obj[attr] = skin
        }
        return obj
    }

    toggleColorItem = (color) => {
        this.metaAction.sf('data.color', color)
        this.toggleColor(color, 'change')
    }

    setType = async (value) => {
        this.metaAction.sf('data.type', value)
        const res = await this.webapi.user.updatePageStyle({
            style: value
        })

        let currentUser = this.metaAction.context.get('currentUser')

        currentUser.pageStyle = value
        this.metaAction.context.set('currentUser', currentUser)
    }


    NotificationFunc = (message) => {
        Notification.info({
            message: '提示',
            duration: null,
            description: (
                <div>
                    <p>{message}</p>
                    <p>北京用户请<span className="ttk-dz-app-portal-isExpire-buyBotton" onClick={this.productActivate}>激活</span></p>
                    <p>其他省市用户请<span className="ttk-dz-app-portal-isExpire-buyBotton" onClick={this.productBuy}>购买</span></p>
                </div>
            )
        })
    }


    expireRemind = async () => {
        const res = await this.metaAction.modal('show', {
            title: '试用已到期',
            children: (
                <div style={{ height: "125px", paddingTop: '28px', margin: '0 auto', width: '280px', overflow: 'hidden' }}>
                    <Icon fontFamily="edficon" type="jinggao" style={{ color: '#FA954C', fontSize: '30px', float: 'left' }} />
                    <div style={{ color: '#515151', fontSize: '14px', float: 'right', lineHeight: '20px' }}>
                        <p style={{ marginBottom: '0' }}>您的试用已到期，只能查询不能操作！</p>
                        <p style={{ marginBottom: '0', textAlign: 'center' }}>请尽快购买/续费！</p>
                    </div>
                </div>
            ),
            cancelText: '取消',
            okText: '立即购买',
            width: 500,
            height: 250
        })
        if (res) {
            let org = this.getCurrentOrg()
            let manageList = await this.webapi.org.queryList()
            let data = manageList.find((item) => {
                return org.id == item.id
            })
            if (!!data.unpaidOrderId) {
                const res = await this.metaAction.modal('confirm', {
                    title: '提示',
                    content: '此企业存在未支付的订单，请到“我的订单”进行处理！',
                })
                if (res) {
                    this.setContent('新建企业', 'ttk-dz-app-company-manage', { tabState: 2 })
                }
            } else {
                this.setContent('产品订购', 'ttk-edf-app-buy', { company: data })
            }
            this.metaAction.sfs({
                'data.isTabsStyle': false,
                'data.isShowMenu': false,
                'data.visible': false,
            })
        }
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

    windowClick = (e) => {
        if (!document.getElementById('ttk-dz-app-portal-search-id')) return
        const dom = document.getElementById('ttk-dz-app-portal-search-id').parentNode
        if (!dom.contains(e.target)) {
            this.metaAction.sf('data.animation1', 'out')
            this.metaAction.sf('data.showPanel', 'none')
        }
    }
    onMenuMouseOver = (e) => {
        let flag = this.metaAction.gf('data').toJS()
        //this.metaAction.sf('data.width', !flag.width)
        this.metaAction.sf('data.menuMathRandom', Math.random())
        if (flag.width) {
            //this.metaAction.sf('data.currentMenuType', 2)
            this.injections.reduce('changeMenuType', [])
        } else {
            this.injections.reduce('changeMenuType', [1])
        }

    }

    onScrollMouseOver = (e) => {
        this.metaAction.sf('data.currentMenuStyle', 'menuscroll')
    }
    onScrollMouseLeave = () => {
        this.metaAction.sf('data.currentMenuStyle', 'nomenuscroll')
    }

    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('message', this.onMessage, false)
        } else if (window.attachEvent) {
            window.attachEvent('onmessage', this.onMessage)
        } else {
            window.onmessage = this.onmessage
        }
    }

    componentWillUnmount = () => {
        history.unlisten('ttk-dz-app-portal', this.listen)
        if (window.removeEventListener) {
            window.removeEventListener('message', this.onMessage, false)
        } else if (window.detachEvent) {
            window.detachEvent('onmessage', this.onMessage)
        } else {
            window.onmessage = undefined
        }
    }

    onMessage = (e) => {
        let data = e.data || {},
            appData = data.data || {}
        switch (data.method) {
            case 'taxOpenFirstTab':
                this.taxOpenFirstTab({name: appData.title, appName: 'ttk-edf-app-iframe', params: { 'src': appData.url, openKey: 'taxOpenFirstTab', orgId: appData.orgId }})
                break;
        }
    }

    taxOpenFirstTab = async (info) => {
        const {name, appName, params, token} = info
        const { orgId } = params
        let globalTabs = this.metaAction.gf('data.globalTabs').toJS()
        let res = false
        if(!token) {
            res = await this.webapi.dzgl.getDanhuInfo({orgId})
        }else {
            res = true
        }

        if(res) {
            const tab = {
                name,
                orgId,
                appName: appName + "?orgId="+orgId+"&name="+name,
                params,
                closable: true,
                key: String(globalTabs.length),
                token: sessionStorage.getItem('_accessToken'),
            }
            //解决导账一半，进入企业跳转进入企业列表问题
            sessionStorage['currentOrgStatus'] = null
            this.injections.reduce('setGlobalContent', tab)
            //这是添加按钮
            this.setAddTab()
        }else {
            console.log('获取token出错')
        }
    }

    openToolBox = () => {
        this.metaAction.sf('data.showTop3', !this.metaAction.gf('data.showTop3'))
    }

    load = async (option) => {
        await this.webapi.portal.init()
        let response = await this.webapi.portal.portal()
        if (response) {
            // let manageList = await this.webapi.org.queryList()
            // let indexOrg = manageList.filter(function (data) {
            //     return data.id == response.org.id
            // })[0]
            let indexOrg = response.org
            this.companyBuyInfo = indexOrg
            if (response.isExpire && false) {
                // this.expireRemind()   //原本弹窗提示过期的方法
                this.metaAction.sfs({
                    'data.other.isExpire': true,
                    'data.other.isExpireStatus': 2,
                    'data.other.isExpireText': '亲，您的订购已到期，只能查询不能操作，请尽快购买/续费！如有疑问，请联系客服热线：400-99-12366',
                })
            } else {
                if (response && response.org) {
                    let millisecond = new Date(indexOrg.expireTime).getTime() - new Date().getTime()
                    let expireDay = parseInt(millisecond / (1000 * 60 * 60 * 24))
                    if (indexOrg.status == 1000070003 && expireDay < this.expireDate && expireDay >= 0) {
                        if (expireDay == 0) {
                            this.metaAction.sfs({
                                'data.other.isExpire': false,
                                'data.other.isExpireStatus': 1,
                                'data.other.isExpireText': `亲，您的试用期今天是最后1天!如果使用还不错，现在就购买吧。客服热线：400-99-12366`,
                            })
                        } else {
                            this.metaAction.sfs({
                                'data.other.isExpire': false,
                                'data.other.isExpireStatus': 1,
                                'data.other.isExpireText': `亲，您的试用期还有${expireDay}天，如果使用还不错，现在就购买吧。客服热线：400-99-12366`,
                            })
                        }
                    } else if (indexOrg.status == 1000070006 && expireDay < this.expireDate && expireDay >= 0) {
                        if (expireDay == 0) {
                            this.metaAction.sfs({
                                'data.other.isExpire': false,
                                'data.other.isExpireStatus': 1,
                                'data.other.isExpireText': `亲，您购买的产品今天是最后1天!为了不影响您的正常业务，请您及时进行续购操作。客服热线：400-99-12366`,
                            })
                        } else {
                            this.metaAction.sfs({
                                'data.other.isExpire': false,
                                'data.other.isExpireStatus': 1,
                                'data.other.isExpireText': `亲，您购买的产品还有${expireDay}天将过期，为了不影响您的正常业务，请您及时进行续购操作。如有疑问，请联系客服热线：400-99-12366`,
                            })
                        }
                    } else {
                        this.metaAction.sfs({
                            'data.other.isExpireStatus': 0,
                            'data.other.isExpire': false,
                        })
                    }
                }
            }
        }
        if (response.message) {
            this.metaAction.sf('data.msgNum', response.message.msgNum)
            if (response.message.sysMessage) {
                this.openMessage(response.message.sysMessage)
            }
        }
        if (response.app) {
            this.metaAction.sf('data.appVersion', response.app.id)
        }
        // let manageList = await this.webapi.org.queryList()
        // response.manageList = manageList
        if (option && option != 'noReloadTplus') {
            // let periodDate = response.periodDate
            response.org = Object.assign(response.org, option)
            // response.org.periodDate = periodDate.periodDate
            // response.org.maxClosingPeriod = periodDate.maxClosingPeriod
        }

        if (response.user) {
            this.metaAction.context.set('currentUser', response.user)
            //this.metaAction.sf('data.other.currentUser', fromJS(response.user))
        } else {
            this.metaAction.context.set('currentUser', '')
            if (this.component.props.onRedirect && this.config.goAfterLogout) {
                this.component.props.onRedirect(this.config.goAfterLogout)
            }
        }
        if (response.org) {
            //设置在gio上的id，以便后续跟进
            if (typeof (gio) == "function") {
                gio('setUserId', response.org.id);
            }
            if(response.periodDate){
                response.org.periodDate = response.periodDate.periodDate
                response.org.maxClosingPeriod = response.periodDate.maxClosingPeriod
            }
            if(response.areaRule){
                response.org.areaCode = response.areaRule.areaCode
                response.org.invoiceVersion = response.areaRule.invoiceVersion
            }

            this.metaAction.context.set('currentOrg', response.org)
            this.metaAction.sf('data.dzglOrg', fromJS(response.org))

            //给首页菜单添加orgId
            let globalTab = this.metaAction.gf('data.globalTabs').toJS()
            globalTab[0].orgId = response.org.id
            globalTab[0].token = sessionStorage.getItem('_accessToken')
            this.metaAction.sf('data.globalTabs', fromJS(globalTab))
        } else {
            this.metaAction.context.set('currentOrg', undefined)
            if (this.component.props.onRedirect && this.config.goAfterLogout) {
                this.component.props.onRedirect(this.config.goAfterLogout)
            }
        }
        if (response.linkConfig) {
            if (response.linkConfig.appName && /Tplus/.test(response.linkConfig.appName)) response.linkConfig.appName = 'T+'
            this.metaAction.context.set('linkConfig', response.linkConfig);
            if (option != 'noReloadTplus') {
                const options = {
                    headers: {
                        token: response.org.id
                    }
                }
                const { dbHost, dbPort, dbUsername, dbPassword, appName, dbVersion, bsAppHost, bsAppPort, foreseeClientHost, appUserName, appPassword, appAccountNumber, databaseName, appAccountName, appLoginDate, ttkOrgId, ttkLoginDate } = response.linkConfig;

                this.webapi.tplus.common(`${document.location.protocol}//${foreseeClientHost}/common/config/isExist`, {}, options).then((hasTplusConfig) => {
                    //console.log(hasTplusConfig)
                    if (hasTplusConfig && hasTplusConfig.value && hasTplusConfig.value.result == false) {
                        const parms = {
                            dbHost,
                            dbPort,
                            dbUsername,
                            dbPassword,
                            appName,
                            dbVersion,
                            bsAppHost,
                            bsAppPort,
                            foreseeClientHost,
                            appUserName,
                            appPassword,
                            appAccountNumber,
                            databaseName,
                            appAccountName,
                            appLoginDate,
                            ttkUserName: null,
                            ttkPassword: null,
                            ttkOrgId,
                            ttkLoginDate,
                            isReturnValue: true
                        };
                        this.webapi.tplus.common(`${document.location.protocol}//${foreseeClientHost}/common/config/save`, parms, options);
                    }
                });

            }


        } else {
            this.metaAction.context.set('linkConfig', undefined)
        }
        if (response.appSource) {
            this.metaAction.context.set('appSource', response.appSource);
        } else {
            this.metaAction.context.set('appSource', undefined)
        }
        let menuStyle = response.menuTreeMemory.state ? 1 : 2
        if (response.menu) {
            this.injections.reduce('load', {
                menu: response.menu,
                org: response.org,
                token: sessionStorage.getItem('_accessToken'),
            }, menuStyle)
        }
        if (response.periodDate) {
            let obj = {
                maxClosingPeriod: response.periodDate.maxClosingPeriod,
                periodDate: moment(response.periodDate.periodDate)
            }
            this.metaAction.sf('data.periodDate', obj)
        }
        if (response.appSource) {
            this.metaAction.sf('data.appLogo', response.appSource.appLogo)
        }
        this.injections.reduce('changeMenuType', [10])
        this.metaAction.sfs({
            'data.menuMathRandom': Math.random(),
            'data.headCtrl': true,
            'data.isShowSearch': false,
        })

        if (response.user && response.user.pageStyle) {
            // 固定布局
            // this.metaAction.sf('data.type', response.user.pageStyle)
            this.metaAction.sf('data.type', 1)
        }

        if (response.user && response.user.skin) {
            // 默认肤色
            this.metaAction.sf('data.color', response.user.skin)
        }
        if(response.user && response.user.imgAccessUrl) {
            this.metaAction.sf('data.imgAccessUrl', response.user.imgAccessUrl)
        }

        //直接打开app
        let joinsource = sessionStorage['joinsource']
        if (!!joinsource && (joinsource == 'newjcgj' || joinsource == 'qygl')) {
            let appInfo = null
            if (sessionStorage['appInfo']) {
                appInfo = JSON.parse(sessionStorage['appInfo'])
            }
            this.setContent(appInfo.name, appInfo.appName)
            sessionStorage.removeItem('joinsource')
        }
        //用户ca临近一个月过期提醒
        if (response.message && response.message.caExpireDate && new Date(response.message.caExpireDate.slice(0, 10)).getTime() - Date.now() < 2592000000) {
            setTimeout(function (Notification) {
                let date = new Date(response.message.caExpireDate.slice(0, 10))
                Notification.warn({
                    message: '尊敬的用户：',
                    description: <div>您的一证通到期时间为{date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日，为不影响您的正常使用，请及时更新证书（若已更新请插上一证通重新读取企业信息）！一证通数字证书自助服务网址：<a target='_blank' href="http://help.bjca.org.cn/">help.bjca.org.cn</a></div>,
                    duration: 5,
                    onClick: () => {
                        // console.log('点击窗口');
                    },
                });
            }.bind(null, Notification), 5000)
        }

        this.loadEsOrgList()
        this.loadDljgOrgList()

    }

    handleKeyDown(e, index) {
        if (e.ctrlKey && e.altKey) {

        }
    }
    getOrgs = async () => {
        let manageList = await this.webapi.org.queryList()
        this.injections.reduce('manageList', {
            manageList
        })
    }
    manageListShow = (text) => {
        let data = this.metaAction.gf('data').toJS(),
            list = []
        if (text == '') {
            list = data.esOrgList
        } else {
            data.esOrgList.forEach(function (listData) {
                if (listData.name.includes(text + '')) {
                    // if(listData.name.indexOf(text) > -1){
                    list.push(listData)
                }
            })
        };
        // $manageListShow(list)
        // console.log('挑选出的',list)
        this.injections.reduce('manageListShow', list)
    }
    toggleManage = async (e) => { //切换企业
        let data = this.metaAction.gf('data').toJS()
        let setManage = data.manageList.filter((data) => {
            return e.key == data.id
        })
        this.metaAction.sf('data.visible', false)
        let response = await this.webapi.org.updateCurrentOrg({
            "orgId": setManage[0].id
        })
        // this.metaAction.context.set('currentOrg', setManage[0])
        await this.load(setManage[0])
        this.setContent('门户首页', 'ttk-dz-app-portal', {
            isShowMenu: false,
            isTabsStyle: false
        })
        this.injections.reduce('closeContentReally', 'toggleManage')
        if (data.manageList.length >= 8) {
            document.getElementsByClassName('ttk-dz-app-portal-header-right-menu-deptSearch')[0].children[0].value = ''
        }

        this.metaAction.sfs({
            'data.selectedKeys': ''
        })
    }
    handleVisibleChange = (visible) => {
        this.metaAction.sf('data.visible', visible)
    }
    handleDljgVisibleChange = (visible) => {
        this.metaAction.sf('data.dljgVisible', visible)
    }
    userVisibleChange = (visible) => {
        this.metaAction.sf('data.userMenuVisible', visible)
    }
    menuControl = async (e) => { //帮助中心控制面板
        if (this.metaAction.gf('data.showPanel') == 'block') {
            this.metaAction.sf('data.showPanel', 'none')
        } else {
            this.metaAction.sf('data.showPanel', 'block')
        }
        this.metaAction.sf('data.animation', 'in')
    }
    hidePanel = () => {
        this.metaAction.sf('data.animation', 'out')
        this.metaAction.sf('data.showPanel', 'none')
    }
    animationEnd = () => {
        this.metaAction.gf('data.animation') == 'out' &&
            this.metaAction.sf('data.showPanel', 'none')
    }
    goLanding = () => {   //跳转着陆页

    }
    getLogo = () => {
        var applogo = this.metaAction.gf('data.appSource.appLogo')
        const width = this.metaAction.gf('data.width')
        if (!width) {
            return this.config.logo_min
        }
        if (applogo == "logo_zc.png") {
            return this.config.logo_zc
        } else {
            return this.config.logo_erp
        }
    }

    /*getPortalStyle = () => {
        let skin = localStorage['skin'] || '#FF913A'
        return {
            backgroundColor: skin
        }
    }*/

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
            return sessionStorage.getItem('username') == 'undefined' ? '' : sessionStorage.getItem('username')
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

        let data = this.metaAction.gf('data').toJS()
        window.onresize = () => {
            if (data.widthPersonStatus == false) {
                let width = window.innerWidth > 1024 ? true : false;
                this.metaAction.sf('data.width', width);
            }
        }
        this.metaAction.sf('data.service.mathRandom', Math.random())
    }



    switchMenu = () => {
        let flag = this.metaAction.gf('data').toJS()
        // this.metaAction.sf('data.width', !flag.width)
        // this.metaAction.sf('data.widthPersonStatus', true)
        // this.metaAction.sf('data.menuMathRandom', Math.random())
        this.metaAction.sfs({
            'data.width': !flag.width,
            'data.widthPersonStatus': true,
            'data.menuMathRandom': Math.random(),
            'data.currentMenuType': !flag.width ? 1 : 2
        })
        if (flag.width) {
            this.injections.reduce('changeMenuType', [])
        } else {
            this.injections.reduce('changeMenuType', [1])
        }
    }
    firstMenuClick = () => {
        this.injections.reduce('setContent', '流程引导', 'ttk-edf-app-beginner-guidance', {})
    }

    getMenuChildren = () => {
        let menu = this.metaAction.gf('data.menu').toJS()
        //menu = this.menuFilter()
        let currentURI = this.isDevMode() || this.isTestMode()
        if (menu && menu.length > 0 && currentURI) {
            let extraMenu = {
                appName: '',
                code: '99',
                expireIsOpen: false,
                id: 99,
                isFolded: 0,
                isVisible: 1,
                children: [],
                key: '99',
                name: '开发管理',
                parentId: 0,
                requestType: 0,
                showOrder: 99,
                versionTag: 0,
                ts: "2018-07-24 10:03:52.0"
            }
            menu.push(extraMenu)

            let menuIndex = parseInt(menu.length) - 1
            if (menu[menuIndex]) {
                menu[menuIndex].children = []
            }
            let menuPro6 = {
                appName: 'ttk-edf-app-iframe',
                appParams: {
                    'delAccount': true
                },
                code: '9906',
                id: 9906,
                isFolded: 0,
                isVisible: 1,
                children: [],
                key: 'deleteAccount',
                name: '删除账套',
                parentId: 99,
                requestType: 0,
                showOrder: 9906,
                versionTag: 0,
                ts: "2018-07-24 10:03:52.0"
            }
            let menuPro7 = {
                appName: 'ttk-edf-app-iframe',
                appParams: {
                    'openDanhu': true
                },
                code: '9907',
                id: 9907,
                isFolded: 0,
                isVisible: 1,
                children: [],
                key: 'openDanhu',
                name: '打开单户',
                parentId: 99,
                requestType: 0,
                showOrder: 9907,
                versionTag: 0,
                ts: "2018-07-24 10:03:52.0"
            }
            menu[menuIndex].children.push(menuPro6)
            menu[menuIndex].children.push(menuPro7)
        }
        let isExpire = this.metaAction.gf('data.other.isExpire')
        const loop = (children, num) => {
            const ret = [];
            if (num == 1) {
                children.forEach(child => {
                    // if (child.name == '首页') return false
                    // if (child.id != 60) {
                    ret.push({
                        name: child.key,
                        key: child.key,
                        //disabled: "{{data.currentMenuType==1?true:false}}",
                        className: "{{data.currentMenuType==1?(data.width ? (data.fold == 'shouhui' ? 'dzglmanage-level-first show-content shouhui' : 'dzglmanage-level-first show-content zhankai') : 'dzglmanage-level-first hide-content'):(data.width ? 'dzglmanage-level-first2 show-content' : 'dzglmanage-level-first2 hide-content')}}",
                        title: child.children.length !== 0 && [{
                            name: 'title',
                            component: '::span',
                            className: 'leftNavMenu',

                            children: child.children.length == 0 ? [
                                    {
                                    name: 'icon',
                                    component: 'Icon',
                                    fontFamily: 'edficon',
                                    className: 'menu-icon',
                                    type: 'link'
                                },
                                {
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
                                }] : [
                                    {
                                        name: 'icon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        className: 'menu-icon',
                                        type: child.iconFont
                                    },
                                    {
                                        name: 'title',
                                        component: '::span',
                                        className: 'menu-content',

                                        key: Math.random(),
                                        children: child.name
                                    },
                                    {
                                        name: 'icon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        className: 'headermenu-icon',
                                        type: 'bumenrenyuanxialakai'
                                    },
                                    {
                                        name: 'badgeImg',
                                        component: '::img',
                                        _visible: child.versionTag == 1,
                                        className: "{{data.width ? 'right_beta' : 'top_beta'}}",
                                        src: "{{$getBeta()}}",
                                    }
                                ]
                        }],
                        component: child.children.length == 0 ? 'Menu.Item' : 'Menu.SubMenu',
                        children: child.children.length == 0 ? [
                                {
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                className: 'menu-icon',
                                type: child.iconFont
                            },
                            {
                                name: 'title',
                                component: '::span',
                                className: 'menu-content',
                                children: child.name
                            }] : loop(child.children, 2)
                    })
                    // }
                })
            } else {
                children.forEach(child => {

                    if (!child.children || child.children.length == 0) {
                        // console.log(data.isExpire, child.expireIsOpen, child.key)
                        ret.push({
                            name: child.key,
                            key: child.key,
                            disabled: isExpire ? (!child.expireIsOpen) : false,
                            //className: child.appName == this.metaAction.gf('data.selectCurrentMenu') ? 'left-menu-submenu-menuitem moji ant-menu-item-selected' : 'left-menu-submenu-menuitem moji',
                            className: 'left-menu-submenu-menuitem moji',
                            component: 'Menu.Item',
                            children: child.name,
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
            if (newItem.length > 1) {
                newItem.splice(0, 1)
            }
            newItem = newItem.concat(lastSubMenu)
            let updateArrList = {
                'data.menuMathRandom': Math.random(),
                'data.defaultOpenKeys': newItem
            }
            this.metaAction.sfs(updateArrList)
            /*控制MENU滚动条位置 */
            let pageY = window.event && window.event.pageY || 0,
                currentY = $('.mk-layout ttk-dz-app-portal-content-left .menuscroll').scrollTop() || 0

            if (currentY > 100) {
                window.setTimeout(function () {
                    $('.mk-layout ttk-dz-app-portal-content-left .menuscroll').scrollTop(parseInt(pageY) + 100)
                }, 10)
            }


            /*
            domAlign(document.getElementsByClassName('ant-menu-submenu-open')[3].childNodes[1].childNodes[2].childNodes[0], document.getElementById('menucontainer'), {
                offsetTop: 100,
                offsetBottom: 0,
                offsetLeft: 0,
                offsetRight: 0
            })*/
        } else {
            this.metaAction.sf('data.defaultOpenKeys', [])
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

    toggleColor = async (color, action) => {
        let win = document.getElementById('ttkIframe')
        if (!!win) {
            if (!!window.postMessage) {
                win.contentWindow.postMessage(JSON.stringify({ result: true, method: 'changeTheme', value: { color } }), "*")
            }
        }
        if (loadSplitCss) {
            return this.toggleColorforIe(color, action)
        }
        let origin = location.origin
        let link = null
        if (document.querySelector("#skin")) {
            link = document.querySelector("#skin")
            link.id = "refSkin"
        } else {
            link = this.createLink()
            link.id = "refSkin"
            document.head.appendChild(link)
        }
        // 公共模块主题颜色加载
        switch (color) {
            case '#222E47':
                link.href = origin + '/grayTheme' + '.css'
                break;
            case '#189977':
                link.href = origin + '/greenTheme' + '.css'
                break;
            // case '#058BB3':
            //     link.href = origin + '/blueTheme' + '.css'
            //     break;
            case '#0066B3':
                link.href = origin + '/blueTheme' + '.css'
                break;
            case '#FF913A':
                link.href = origin + '/orangeTheme' + '.css'
                break;
            case '#B4A074':
                link.href = origin + '/brownTheme' + '.css'
                break;
            case '#E978AD':
                link.href = origin + '/pinkTheme' + '.css'
                break;
            case '#5046A1':
                link.href = origin + '/yellowTheme' + '.css'
                break;
            case '#3A3A3A':
                link.href = origin + '/darkgreyTheme' + '.css'
                break;
            case '#1EB5AD':
                link.href = origin + '/peppermintgreenTheme' + '.css'
                break;
            default:
                link.href = origin + '/grayTheme' + '.css'
                break;
        }
        //各个子模块主题颜色加载
        changeTheme(origin, color)

        if (action && action == 'change') {
            this.webapi.user.updateSkin(color)
            localStorage['skin'] = color
        }
    }

    returnMenuStyle = () => {
        let menuWidth = this.metaAction.gf('data.width'),
            styleMenu = '',
            menuStyle = this.metaAction.gf('data.type')
        if (menuWidth) {
            styleMenu = 'menu-switch2'
        }
        else {
            styleMedia = 'menu-switchcenter2'
        }

        if (menuStyle == '2') {

        }
        else {
            styleMenu = styleMenu + ' clear-switch2'
        }
        return styleMenu
        //className: "{{data.width ?'menu-switch2':'menu-switchcenter2'}}",
        //className: '{{data.type == "2" ? "ttk-dz-app-portal type-2" :  "ttk-dz-app-portal"}}',

    }

    toggleColorforIe = async (color, action) => {
        //let hash = (__webpack_hash__).slice(0, 8)
        //link.href = origin + '/splitcss/yellowTheme' + `-${i}` + '.css'
        let theme = null
        switch (color) {
            case '#222E47':
                theme = '/splitcss/grayTheme'
                break;
            case '#189977':
                theme = '/splitcss/greenTheme'
                break;
            // case '#6262F5':
            //     theme = '/splitcss/blueTheme'
            //     break;
            case '#0066B3':
                theme = '/splitcss/blueTheme'
                break;
            case '#FA8C16':
                theme = '/splitcss/orangeTheme'
                break;
            case '#B4A074':
                theme = '/splitcss/brownTheme'
                break;
            case '#E978AD':
                theme = '/splitcss/pinkTheme'
                break;
            case '#5046A1':
                theme = '/splitcss/yellowTheme'
                break;
            default:
                theme = '/splitcss/grayTheme'
                break;
        }
        for (let i = 1; i < 3; i++) {
            let origin = location.origin
            let link = null
            if (document.querySelector("#skin")) {
                link = document.querySelector("#skin")
            } else {
                link = this.createLink()
                document.head.appendChild(link)
            }
            link.href = origin + theme + `-${i}` + '.css'
            if (action && action == 'change') {
                this.webapi.user.updateSkin(color)
                localStorage['skin'] = color
            }
        }
        changeThemeforIE(color)
    }

    topMenuClick = async (e) => {
        this.metaAction.sf('data.showTop3', false)
        if (e.key != 'personal') this.metaAction.sf('data.userMenuVisible', false)
        switch (e.key) {
            case 'mySetting':
                const ret = await this.metaAction.modal('show', {
                    title: '个人设置',
                    // okText: '立即缴款',
                    width: 934,
                    footer: '',
                    style: { top: 40 },
                    bodyStyle: { height: 505 },
                    wrapClassName: 'edfx-app-my-setting-xdz-model',
                    closeModal: this.close,
                    closeBack: (back) => { this.closeTip = back },
                    onCancel:( back ) => { back() },
                    children: this.metaAction.loadApp('edfx-app-my-setting-xdz', {
                        store: this.component.props.store,
                        dljgOrgSelect: this.dljgOrgSelect
                    }),
                })
                break;
            case 'logout':
                if (this.component.props.onRedirect && this.config.goAfterLogout) {
                    let res = await this.webapi.user.logout()
                    if (res) {
                        this.metaAction.context.set('currentUser', '')
                        this.metaAction.context.set('currentOrg', undefined)
                        sessionStorage.removeItem('mobile')
                        sessionStorage.removeItem('username')
                        sessionStorage.removeItem('_accessToken')
                        sessionStorage.removeItem('password')
                        //sessionStorage.removeItem('skin')
                        //window.location.href = location.origin + '/'
                        //localStorage.removeItem('skin')
                        this.component.props.onRedirect(this.config.goAfterLogout)
                    }
                }
                break;
            case 'newGuide':
                this.openBeginnerGuidance()
                break;
            case 'personal':
                /*document.getElementsByClassName('pagestyle-app-close').length > 0 && document.getElementsByClassName('pagestyle-app-close')[0].click()

                setTimeout(() => {
                    this.openPersonal()
                }, 500)*/
                break;
            case 'kaifaguali':
                let name = prompt("Please enter your mobile", "")
                if (name != null && name != "") {
                    this.webapi.user.deleteUser({
                        mobile: name
                    })
                }
                break;
            default:
                return
        }
        // let selectedKeys = this.metaAction.gf('data.selectedKeys')
        //
        // if (selectedKeys && selectedKeys.toJS) {
        //     selectedKeys = selectedKeys.toJS()
        //     selectedKeys[0] = e.key
        //     this.metaAction.sf('data.selectedKeys', fromJS(selectedKeys))
        // }

    }
    menuSelectClear = () => {
        $('.dzglmanage-level-first.show-content.zhankai.ant-menu-item-selected,.manualSelected').removeClass('ant-menu-item-selected')
        $('.dzglmanage-level-first.show-content.zhankai.ant-menu-submenu-selected').removeClass('ant-menu-submenu-selected')
    }
    menuSelectAdd = (cls) => {
        switch (cls) {
            case 'headerMenuMessage':
                $('.headerMenuMessage').addClass('ant-menu-item-selected manualSelected');
                break;
        }

    }
    //点击上方菜单跳转到新app前判断菜单和tab是否处于隐藏状态
    currentStatus = () => {
        let appArr = ['ttk-dz-app-company-manage', 'ttk-gl-app-importdata-enterprise']
        let currentOpenAppName = this.metaAction.gf('data.content').toJS().appName
        if (appArr.indexOf(currentOpenAppName) != -1) {
            this.closeTabs({ key: 'all' })
        }
        this.metaAction.sfs({
            'data.isTabsStyle': true,
            'data.isShowMenu': true
        })
    }
    goRegister = (e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }
        //this.setContent('新建企业', 'edf-company-manage-add')
        // this.metaAction.sf('data.isTabsStyle', false)
        // this.metaAction.sf('data.isShowMenu', false)
        // this.metaAction.sf('data.visible', false)
        // this.setContent('新建企业', 'edf-company-manage-add', { mark: 'home' })
        this.metaAction.sfs({
            'data.isTabsStyle': false,
            'data.isShowMenu': false,
            'data.visible': false,
        })
    }
    goCompanyManage = (e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }

        this.setContent('企业管理', 'ttk-dz-app-company-manage')
        // this.metaAction.sf('data.isTabsStyle', false)
        // this.metaAction.sf('data.isShowMenu', false)
        // this.metaAction.sf('data.visible', false)
        this.metaAction.sfs({
            'data.isTabsStyle': false,
            'data.isShowMenu': false,
            'data.visible': false,
        })
    }

    searchVisibleToogle = (show) => {
        this.metaAction.sf('data.isShowSearch', show)
    }

    searchHidden = () => {
        let searchContainer = document.querySelector('.ttk-dz-app-portal-search-container')
        searchContainer.className = searchContainer.className.replace('slideInRight', 'fadeOutRight')
    }

    searchAnimationEnd = (e) => {
        let searchContainer = document.querySelector('.ttk-dz-app-portal-search-container')
        let flag = searchContainer.className.indexOf('slideInRight') != -1 ? true : false
        if (flag) {
            let searchInput = document.querySelector('#ttk-dz-app-portal-search-id')
            searchInput.focus()
        } else {
            this.metaAction.sf('data.isShowSearch', false)
        }
    }

    openJcyy = async() => {
        // let newWindow
        // if(consts.XDZ_DEMO.includes(location.host)){
        //     newWindow = window.open(consts.JCYY_DEMO_DOMAIN_HTTPS);
        // }else
        // if(consts.XDZ_ONLINE.includes(location.host)){
        //     newWindow = window.open(consts.JCYY_ONLINE_DOMAIN);
        // }else{
        //     newWindow = window.open(consts.JCYY_TEST_DOMAIN);
        // }
        // let code = await this.webapi.dzCode()
        // if(consts.XDZ_DEMO.includes(location.host)){
        //     newWindow.location = `${consts.JCYY_DEMO_DOMAIN_HTTPS}/dzapi.jsp?code=${code}`;
        // }else if(consts.XDZ_ONLINE.includes(location.host)){
        //     newWindow.location = `${consts.JCYY_ONLINE_DOMAIN}/dzapi.jsp?code=${code}`;
        // }else{
        //     newWindow.location = `${consts.JCYY_TEST_DOMAIN}/dzapi.jsp?code=${code}`;
        // }
        let newWindow
        if(consts.XDZ_ONLINE.includes(location.host)){
            newWindow = window.open(consts.JCYY_ONLINE_DOMAIN);
        }else if(consts.XDZ_DEV == location.origin){
            newWindow = window.open(consts.JCYY_TEST_DOMAIN);
        }else{
            newWindow = window.open(consts.JCYY_DEMO_DOMAIN_HTTPS);
        }
        let code = await this.webapi.dzCode()
        if(consts.XDZ_ONLINE.includes(location.host)){
            newWindow.location = `${consts.JCYY_ONLINE_DOMAIN}/dzapi.jsp?code=${code}`;
        }else if(consts.XDZ_DEV == location.origin){
            newWindow.location = `${consts.JCYY_TEST_DOMAIN}/dzapi.jsp?code=${code}`;
        }else{
            newWindow.location = `${consts.JCYY_DEMO_DOMAIN_HTTPS}/dzapi.jsp?code=${code}`;
        }
    }

    menuClick = async (e) => {
        if (e.domEvent) {
            e.domEvent.stopPropagation()
        }
        //设置token
        sessionStorage['_accessToken'] = sessionStorage['_accessGlToken']
        $('.manualSelected').removeClass('ant-menu-item-selected')
        const menu = this.metaAction.gf('data.menu').toJS()
        //运营按钮点击事件
        if(e.key == '600'){
            this.openJcyy()
            return false
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
        if (hit == null && (this.isDevMode() || this.isTestMode())) {
            //开发模式
            this.batchMenuClick(e)
            return
        }
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
            Object.assign(hit.appParams, hit.appProps)
        }
        //拼接appname
        hit.appName = hit.appName

        let needFolded = this.metaAction.gf('data.currentMenuType') == 2

        /*if (needFolded) {
            hit.isFolded && hit.isFolded == 1 ? this.metaAction.sf('data.width', false) : this.metaAction.sf('data.width', true)
        }*/
        if (hit && hit.requestType == 1) {
            let url = hit.appProps && JSON.parse(hit.appProps).url
            window.open(url)
        } else if (hit.appName.indexOf('ttk-dz-app-batchdeclaration') != -1 && this.metaAction.gf('data.appVersion') != 114) {
            let orgIds = await this.webapi.getCustomerOrgIdList()
            if (orgIds && orgIds.length <= 0) {
                this.metaAction.toast('error', '未创建任何企业，无法进行批量申报！')
            } else {
                let response = await this.webapi.getWebUrlForShenBaoBatch({ orgIdList: orgIds, isReturnValue: true })
                if (response && response.result === false) {
                    let message = response.error.message.trim().replace(/^[0-9]+/, '')
                    this.metaAction.toast('error', message)
                } else if (!!response) {
                    let skin = encodeURIComponent(localStorage['skin'])
                    let appName = 'ttk-edf-app-iframe?code=' + hit.code
                    let src = response + '&sourceType=jcdz&theme=' + skin
                    src = src.replace(/\&orgIds(.)*\&code=/g, () => {
                        let orgIds = decodeURIComponent(src.match(/\%5B(.)*\%5D/g)[0]).replace(/(\[|\]|\+)/g, '').split(',')
                        this.metaAction.sf('data.other.orgIds', fromJS(orgIds))
                        return '&code='
                    })
                    // src = src.replace('http://dev.aierp.cn:8089', 'http://localhost:8082')
                    this.setContent(hit.name, appName, { src })
                }
            }
        } else {
            const org = this.getCurrentOrg()
            this.setGlobalContent({
                name: hit.name,
                appName: hit.appName,
                params: hit.appParams,
                orgId: org.id,
                token: sessionStorage.getItem('_accessToken')
            })
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
                this.metaAction.sfs({
                    'data.menuMathRandom': Math.random(),
                    'data.selectedKeys': lastSubMenu,
                    'data.defaultOpenKeys': newItem,
                })
            }
        }
        let selectArr = [e.key]
        let selectMenu = menu.filter((menuItem) => e.key == menuItem.key)
        if (selectMenu.parentId != 0) {
            let parent = menu.filter((menuItem) => selectMenu.parentId == menuItem.parentId)
            if (parent && parent.key) {
                selectArr.push(key)
            }
        }
        this.metaAction.sfs({
            'data.selectedKeys': selectArr,
        })
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
        /*if (needFolded) {
            _app.appProps.isFolded && _app.appProps.isFolded == 1 ? this.metaAction.sf('data.width', false) : this.metaAction.sf('data.width', true)
        }*/
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
                        this.metaAction.sfs({
                            'data.menuMathRandom': Math.random(),
                            'data.selectedKeys': lastSubMenu,
                            'data.defaultOpenKeys': newItem,
                        })
                    }
                }
                else {
                    this.metaAction.sfs({
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

    onlyCloseContent = (appName) => {
        //判断app是否打开
        let openTabs = this.metaAction.gf('data.openTabs').toJS()
        let hasApp = false
        for (let i = 0; i < openTabs.length; i++) {
            if (openTabs[i].appName.indexOf(appName) != -1) {
                hasApp = true
                break
            }
        }
        if (hasApp) {
            this.injections.reduce('onlyCloseContent', appName)
        }
    }

    tabEdit = async (key, action) => {
        let width = this.metaAction.gf('data.width')
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
                        that.metaAction.sf('data.mathRandom', Math.random())
                        that.metaAction.sf('data.width', width)
                        that.removeTabsCloseListen(appName)
                        return
                    },
                    onCancel() {
                        return
                    }
                })
            } else {
                this.injections.reduce('closeContent', key)
                this.metaAction.sf('data.mathRandom', Math.random())
                this.metaAction.sf('data.width', width)
                // this.reInitContent()
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
            // if (key == 'all') {
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
                        that.metaAction.sf('data.mathRandom', Math.random())
                    } else {
                        that.injections.reduce('closeContent', content.name)
                        that.metaAction.sf('data.mathRandom', Math.random())
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
                this.metaAction.sf('data.mathRandom', Math.random())
            } else {
                this.injections.reduce('closeContent', content.name)
                this.metaAction.sf('data.mathRandom', Math.random())
            }
        }
    }
    //获取extraMenuWidth
    getExtraMenuWidth = () => {
        let style = {}
        let content = this.metaAction.gf('data.content').toJS()
        // if (content.appName == "ttk-dz-app-home") {
        //     style.width = environment.isDevMode() ? "180px" : "auto"
        // } else {
        //     style.width = environment.isDevMode() ? "auto" : "38px"
        // }
        style.width = "180px"
        return style
    }
    //panel控制
    showControlPanel = async () => {
        this.metaAction.sf('data.showControlPanel', 'block')
        this.metaAction.sf('data.panelAnimation', 'in')
        //请求appList
        let response = await this.webapi.desktop.queryAppList()
        if (response) {
            this.metaAction.sf('data.ctrlPanel', response)
            this.injections.reduce('appList', response)
        }
    }

    menuSelectChange = (selectItem) => {
        if (selectItem == 1) {
            selectItem = 2
            this.metaAction.sf('data.defaultOpenKeys', [])
        } else {
            selectItem = 1
        }
        this.metaAction.sf('data.currentMenuType', selectItem)
        this.metaAction.sf('data.menuMathRandom', Math.random())
        this.injections.reduce('changeMenuType', [10])

        // localStorage.setItem('menuStyle', selectItem)
        this.webapi.portal.menu({
            state: selectItem == 1 ? true : false
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
        this.metaAction.sf('data.showControlPanel', 'none')
    }
    hideCtrlPanel = async (str) => {
        this.metaAction.sf('data.panelAnimation', 'out')
        if (str == 'save') {
            let appList = this.metaAction.gf('data.desktopAppList').toJS()
            let response = await this.webapi.desktop.saveAppList(appList)
            this.injections.reduce('appList', appList, 'reload')
            this.metaAction.sf('data.ctrlPanel', appList)
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
    //完全重置 portal
    resetPortal = async (name, appName, appProps = {}) => {
        await this.load()
        this.injections.reduce('setContent', name, appName, appProps)
    }
    //判断页面是否处于编辑状态
    editing = (name, status) => {
        this.injections.reduce('editing', name, status)
    }
    //在线客服，二维码
    showQrcode = () => {
        this.injections.reduce('weixin', true)
    }
    hideQrcode = () => {
        this.injections.reduce('weixin', false)
    }
    getQrcode = () => {
        return qrcodeImg
    }
    //获取消息数
    getMsgNum = async () => {
        let num = await this.webapi.getMsgNum()
        this.metaAction.sf('data.msgNum', num)
    }

    openIMCenter = () => {
        window.open('http://p.qiao.baidu.com/cps/chat?siteId=13012949&userId=27228178', '_blank')
    }
    //跳转到对接页面
    jumpToUrl = async (title, url, requestType) => {
        this.currentStatus()
        // let xhr = new XMLHttpRequest()
        // xhr.open('post', '/v1/edf/connector/getcodefromuc', false)
        // xhr.setRequestHeader('Accept', 'application/json')
        // xhr.setRequestHeader('Content-Type', 'application/json')
        // xhr.setRequestHeader('token', sessionStorage.getItem('_accessToken'))
        // xhr.onreadystatechange = (function () {
        //     if (xhr.readyState == 4 && xhr.status == 200) {
        //         let param = JSON.parse(xhr.responseText)
        //         let ts = new Date().getTime()
        //         if (param.value == null) {
        //             this.setContent(title, 'ttk-edf-app-iframe?linkcode=' + ts, {
        //                 'src': url
        //             })
        //         } else {
        //             // window.open(url + '?' + param.value.replace('&', ''))
        //             this.setContent(title, 'ttk-edf-app-iframe?linkcode=' + ts, {
        //                 'src': (url + '?' + param.value.replace('&', ''))
        //             })
        //         }
        //     }
        // }).bind(this)
        // xhr.send(JSON.stringify({type: title == '咨询' ? 'zx' : 'px'}))
        let params = { type: title == '咨询' ? 'zx' : 'px' }
        xml('/v1/edf/connector/getcodefromuc', params, (req) => {
            let param = JSON.parse(req)
            let ts = new Date().getTime()
            if (requestType == 1) {
                if (param.value == null) {
                    window.open(url)
                } else {
                    window.open(url + '?' + param.value.replace('&', ''))
                }
            } else {
                if (param.value == null) {
                    this.setContent(title, 'ttk-edf-app-iframe?linkcode=' + ts, {
                        'src': url
                    })
                } else {
                    this.setContent(title, 'ttk-edf-app-iframe?linkcode=' + ts, {
                        'src': (url + '?' + param.value.replace('&', ''))
                    })
                }
            }
        }, () => {
            this.metaAction.toast('error', '请求失败')
        })
    }
    //打开新手引导
    openBeginnerGuidance = () => {
        this.setContent('新手引导', 'ttk-edf-app-beginner-guidance')
    }

    openPersonal = async () => {
        const skin = localStorage.getItem('skin') || '#058BB3'
        const type = this.metaAction.gf('data.type')
        const ret = await this.metaAction.modal('show', {
            title: '风格设置',
            width: 276,
            bodyStyle: { overflow: 'auto' },
            footer: '',
            closable: false,
            wrapClassName: 'pagestyle',
            closeModal: this.close,
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('ttk-dz-app-pagestyle', {
                store: this.component.props.store,
                setType: this.setType,
                changeColor: this.toggleColor,
                type,
                skin
            })
        })

    }

    close = (ret) => {
        this.closeTip()
    }

    //关闭popover时取消选中menu
    cancelCheckStatus = (visible) => {
        if (!visible) {
            this.metaAction.sf('data.selectedKeys', fromJS([]))
        }
    }
    foldMenu = () => {
        this.metaAction.sf('data.isShowMenu', !this.metaAction.gf('data.isShowMenu'))
        setTimeout(function () {
            var event = document.createEvent('HTMLEvents')
            event.initEvent("resize", true, true)
            window.dispatchEvent(event)
        }, 0)
    }
    /**
     * dev模式下才显示开发帮助
     */

    isTestMode = () => {
        return environment.isTestMode()
    }
    isDevMode = () => {
        return environment.isDevMode()
    }
    //develop开发管理链接
    batchMenuClick = (e) => {
        let links = {
            'axure': 'http://prototype.aitaxer.com:8089',
            'prototype': 'http://prototype.aitaxer.com:8089/',
            'jira': 'http://jira.aitaxer.com:8089/',
            'dictionary': 'http://dic.aitaxer.com:8089/',
            'Jenkins': 'http://builder.aitaxer.com:8089/',
            'ued': 'http://ued.aitaxer.com:8089/',
            'k8s': 'http://k8s.aitaxer.com:8089/',
            'sonar': 'http://sonar.aitaxer.com:8089/',
        }
        if (e.key == 'webapi') {
            this.openWebApi()
        } else if (e.key == 'deleteAccount') {
            let name = prompt("Please enter your mobile", "")
            if (name != null && name != "") {
                this.webapi.user.deleteUser({
                    mobile: name
                })
            }
        } else if(e.key == 'openDanhu') {
            this.openDanhu()
        }else {
            window.open(links[e.key])
        }
    }
    //打开单户
    openDanhu = async (orgId = '6749597581230080', appName, name) => {
        const currentOrg = this.getCurrentOrg()
        this.component.props.setDzInfo({orgId: currentOrg.id, appName, name})
        const danhuInfo = await this.webapi.dzgl.getDanhuInfo({orgId})
        this.component.props.onRedirect(this.config.goDanhu)
    }
    //避免因为切换导致name闪烁
    dzglOrgNameKeeping = () => this.metaAction.context.set('currentOrg', Object.assign(this.metaAction.context.get('currentOrg') || {}, this.metaAction.gf('data.dzglOrg').toJS() || {}))
    danhuOrgNameKeeping = (menuItem, soure) => {
        let currentOrg = this.metaAction.context.get('currentOrg') || {}
        currentOrg.name = soure ?  menuItem : menuItem.name
        this.metaAction.context.set('currentOrg', currentOrg)
    }
    //切换最顶部tab事件
    globalTabChange = (activeKey) => {
        if(activeKey == 'add') {
            this.metaAction.sf('data.visible', true)
        }else {
            let globalTabs = this.metaAction.gf('data.globalTabs').toJS()
            //首先更新token
            const token = globalTabs[activeKey].token
            sessionStorage['_accessToken'] = token
            //刷新app
            globalTabs[activeKey].refresh = new Date().getTime()
            if(activeKey == 0) {
                this.dzglOrgNameKeeping()
                this.load()
            }else {
                this.danhuOrgNameKeeping(globalTabs[activeKey])
            }
            this.metaAction.sfs({
                'data.currentIndex': activeKey,
                'data.content': fromJS(globalTabs[activeKey]),
                'data.globalTabs': fromJS(globalTabs)
            })
            this.injections.reduce('globalTabChange', globalTabs[activeKey])
        }
    }
    //最顶部tab新增和删除页签的回调
    globalTabEdit = async (key) => {
        let globalTabs = this.metaAction.gf('data.globalTabs').toJS()
        let currentIndex = this.metaAction.gf('data.currentIndex')
        globalTabs.splice(key, 1)
        for(let i = 0 ; i < globalTabs.length; i++) {
            globalTabs[i].key = String(i)
        }
        this.metaAction.sfs({
            'data.globalTabs': fromJS(globalTabs),
            'data.currentIndex': currentIndex >= key ? String(currentIndex - 1) : currentIndex,
        })

        if(currentIndex == key) {
            const currentTab = globalTabs[key - 1]
            const token = currentTab.token
            sessionStorage['_accessToken'] = token
            if(key - 1 == 0) {
                this.dzglOrgNameKeeping()
                await this.webapi.portal.init()
                let response = await this.webapi.portal.portal()
                if(response) {
                    this.metaAction.context.set('currentUser', response.user)
                    this.metaAction.context.set('currentOrg', response.org)
                }
            }else {
                this.danhuOrgNameKeeping(currentTab.name, 'globalTabEdit')
            }
            this.injections.reduce('setGlobalContent', globalTabs[key - 1])
        }
        this.setAddTab()
    }
    //添加新页签
    setGlobalContent = async (info) => {
        const {name, appName, params, orgId, token, showHeader} = info
        let globalTabs = this.metaAction.gf('data.globalTabs').toJS()
        let res = false
        if(!token) {
            res = await this.webapi.dzgl.getDanhuInfo({orgId})
        }else {
            res = true
        }

        if(res) {
            const tab = {
                name,
                orgId,
                appName: showHeader ? "ttk-dzgl-app-frame?orgId="+orgId+'&name='+ Base64.encode(name) : (appName != "ttk-es-app-yyhome" ? appName + "?orgId="+orgId : appName),
                params,
                closable: true,
                key: String(globalTabs.length),
                token: sessionStorage.getItem('_accessToken'),
            }
            //解决导账一半，进入企业跳转进入企业列表问题
            sessionStorage['currentOrgStatus'] = null
            //加 props 标志来源新代账
            tab.params.source = 'xdz'
            if(showHeader) tab.params.targetAppName = appName
            this.danhuOrgNameKeeping(name, 'setGlobalContent')
            this.injections.reduce('setGlobalContent', tab)
            //这是添加按钮
            this.setAddTab()
        }else {
            console.log('获取token出错')
        }
    }

    setGlobalContentWithDanhuMenu = async (info) => {
        const {name, appName, pageName, params, orgId, token} = info
        let globalTabs = this.metaAction.gf('data.globalTabs').toJS()
        let res = false
        if(!token) {
            res = await this.webapi.dzgl.getDanhuInfo({orgId})
        }else {
            res = true
        }

        if(res) {
            const tab = {
                name: pageName,
                orgId,
                appName: `edfx-app-portal?orgId=${orgId}`,
                params: {appProps: params, dzglInfo: {name, appName, pageName}, source: 'xdz' },
                closable: true,
                key: String(globalTabs.length),
                token: sessionStorage.getItem('_accessToken'),
            }
            //解决导账一半，进入企业跳转进入企业列表问题
            sessionStorage['currentOrgStatus'] = null
            // sessionStorage['joinsource'] = 'newjcgj'
            // sessionStorage['appInfo'] = JSON.stringify({name, appName})
            this.danhuOrgNameKeeping(pageName, 'setGlobalContentWithDanhuMenu')
            this.injections.reduce('setGlobalContent', tab)
            //这是添加按钮
            this.setAddTab()
        }else {
            console.log('获取token出错')
        }
    }

    setAddTab = () => {
        //判断当前是否出现左右按钮
        const length = $('.globalTab .ant-tabs-tab-arrow-show').length
        this.metaAction.sfs({'data.extra': length != 0 ? true : false})
        if(length != 0) {
            this.metaAction.sf('data.visible', false)
        }
    }
    //判断是否需要渲染
    renderCondition = (tab) => {
        let current = this.metaAction.gf('data.content').toJS()
        const flag = current.name === tab.name && current.appName === tab.appName && current.orgId === tab.orgId
        return !flag
    }
    //获取被代账公司列表
    loadEsOrgList = async () => {
        const list = await this.webapi.dzgl.getEsOrgList({orgType: 0})
        if (list.length == 0) {
            list.push({ name: '无', id: ''})
        }
        this.metaAction.sfs({
            'data.esOrgList': fromJS(list),
            'data.manageListShow': fromJS(list)
        })
    }
      //获取代理机构公司列表
    loadDljgOrgList = async () => {
        const list = await this.webapi.dzgl.getEsOrgList({orgType: 1})
        // const list = [JSON.parse('{"orgStatus":1,"enabledYear":"2019","financeStatus":0,"orgName":"惠州万通药业有限公司","enabledMonth":"5","createTime":"2019-06-05 11:28:11","bizStatus":0,"orgId":6749597581230080,"periodDate":"2019-06","taxStatus":0}'), JSON.parse('{"orgStatus":1,"enabledYear":"2019","financeStatus":0,"orgName":"潮州市广播电视台","enabledMonth":"5","createTime":"2019-06-05 17:40:11","bizStatus":0,"orgId":6751060330625024,"periodDate":"2019-06","taxStatus":0}'), JSON.parse('{"orgStatus":1,"enabledYear":"2019","financeStatus":0,"orgName":"广州金住酒店管理有限公司","enabledMonth":"5","createTime":"2019-06-05 21:56:48","bizStatus":0,"orgId":6752069374051328,"periodDate":"2019-06","taxStatus":0}')]
        if (list.length == 0) {
            list.push({ name: '无', id: ''})
        }
        this.metaAction.sfs({
            'data.dljgListShow': fromJS(list)
        })
    }
    esOrgSelect = (e) => {
        if (e.domEvent) {
            e.domEvent.stopPropagation()
        }
        this.metaAction.sf('data.visible', false)
        const esOrgList = this.metaAction.gf('data.esOrgList').toJS()
        const org = esOrgList.find(o => o.id == e.key)
        this.setGlobalContent({
            name: org.name,
            appName: 'edfx-app-portal',
            params: {},
            orgId: org.id,
        })
    }
    dljgOrgSelect = async (e) => {
        if (e.domEvent) {
            e.domEvent.stopPropagation()
        }
        let response = await this.webapi.org.updateCurrentOrg({
            "orgId": e.key
        })
        if(!!response) {
            if(response.registerInfo){
                sessionStorage['registerInfo'] = JSON.stringify(response.registerInfo)
                this.metaAction.sf('data.logoImg',response.registerInfo.companyLogoUrl)
                document.title = response.registerInfo.companyName
            }else{
                sessionStorage['registerInfo'] = ''
                this.metaAction.sf('data.logoImg','')
                document.title = '金财代账'
            }
            await this.load()
            let globalTabs = this.metaAction.gf('data.globalTabs').toJS()
            globalTabs[0].token = sessionStorage['_accessToken']
            sessionStorage['_accessGlToken'] = sessionStorage['_accessToken']
            globalTabs[0].refresh = new Date().getTime()
            globalTabs[0].orgId = e.key
            this.metaAction.sfs({
                'data.content': fromJS(globalTabs[0]),
                'data.globalTabs': fromJS(globalTabs.splice(0,1)),
                'data.dljgVisible': false,
            })
        }
    }
    openWebApi = () => {
        this.setContent('api', 'app-common-iframe')
        //window.open('http://172.16.10.26/webapi/')
    }

    addEventListener = (eventName, handler) => {
        this.injections.reduce('addEventListener', eventName, handler)
    }

    removeEventListener = (eventName) => {
        this.injections.reduce('removeEventListener', eventName)
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

    //更改期间日期
    periodDate = () => {
        let day = moment().format("DD"),
            month = moment().format("MM"),
            year = moment().format("YYYY"),
            now = moment(),
            date
        if (day < 15) {
            date = moment().set('month', month == 0 ? 11 : month - 1);
        }
        let currentOrg = this.metaAction.context.get("currentOrg")
        if (currentOrg && !currentOrg.periodDate) {
            currentOrg.periodDate = year + '-' + month
            this.metaAction.context.set('currentOrg', currentOrg)
        }
        if (currentOrg && (moment() < moment(currentOrg.enabledYear + '-' + currentOrg.enabledMonth))) {
            date = moment(currentOrg.enabledYear + '-' + currentOrg.enabledMonth)
        }
        return date
    }
    //关闭app内的guide
    closeGuide = (appName) => {
        this.injections.reduce('closeGuide', appName)
    }

    //期间日期置灰日期比较
    disabledPeriodDate = (current) => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        return current && current < moment(currentOrg.enabledYear + '-' + currentOrg.enabledMonth)
    }

    //期间日期更改
    periodDateChange = async (moment, str) => {
        // let currentOrg = this.metaAction.context.get("currentOrg")
        // currentOrg.periodDate = str
        // this.metaAction.context.set('currentOrg', currentOrg)
        let response = await this.webapi.periodDate({
            periodDate: str
        })
        if (response) {
            await this.load()
            this.setContent('门户首页', 'ttk-dz-app-portal', {
                isShowMenu: false,
                isTabsStyle: false
            })
        }
    }

    //月份渲染
    monthCellCustom = (date) => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            enableTime = currentOrg.enabledYear + '-' + currentOrg.enabledMonth,
            maxClosingPeriod = currentOrg.maxClosingPeriod
        // console.log('输出时间0',date.format('YYYY-MM'))
        return <DateCellCustom enableTime={enableTime} maxClosingPeriod={maxClosingPeriod} nowTime={date.format('YYYY-MM')}></DateCellCustom>
    }

    //控制已结账图标
    isSettle = () => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            enableTime,
            periodDate = this.metaAction.gf('data.periodDate'),
            headCtrl = this.metaAction.gf('data.headCtrl')
        if (!!currentOrg) {
            enableTime = currentOrg.enabledYear + '-' + currentOrg.enabledMonth
            return (moment(periodDate.periodDate) <= moment(periodDate.maxClosingPeriod)) && (moment(periodDate.periodDate) >= moment(enableTime)) && headCtrl
        } else {
            return false
        }
    }

    //顶部购买
    productBuy = async () => {
        let unpaidOrderId = this.companyBuyInfo.unpaidOrderId
        if (!!unpaidOrderId) {
            const res = await this.metaAction.modal('confirm', {
                title: '提示',
                content: '此企业存在未支付的订单，请到“我的订单”进行处理！',
            })
            if (res) {
                this.setContent('新建企业', 'ttk-dz-app-company-manage', { tabState: 2 })
            } else {
                return
            }
        } else {
            this.setContent('产品订购', 'ttk-edf-app-buy', { company: this.companyBuyInfo })
        }
        this.metaAction.sfs({
            'data.isTabsStyle': false,
            'data.isShowMenu': false,
            'data.visible': false
        });
    }
    //顶部激活
    productActivate = async () => {
        let unpaidOrderId = this.companyBuyInfo.unpaidOrderId
        if (!!unpaidOrderId) {
            const res = await this.metaAction.modal('confirm', {
                title: '提示',
                content: '此企业存在未支付的订单，请到“我的订单”进行处理！',
            })
            if (res) {
                this.setContent('新建企业', 'ttk-dz-app-company-manage', { tabState: 2 })
            } else {
                return
            }
        } else {
            this.setContent('产品激活', 'ttk-edf-app-org-activate', { company: this.companyBuyInfo, activateSource: 'ttk-dz-app-portal' })
        }
        this.metaAction.sfs({
            'data.isTabsStyle': false,
            'data.isShowMenu': false,
            'data.visible': false,
        })
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
    //弹出维护信息
    openMessage = async (message) => {
        await this.metaAction.modal('show', {
            title: message.title,
            // wrapClassName: 'portalMessageModal',
            wrapClassName: 'portalMessageModalReplace',
            children: this.getMessageContent(message.content),
            okText: '关闭',
            centered: true,
            width: 570,
            height: 320
        })
        await this.webapi.markRead([{ messageId: message.id }])
        let num = this.metaAction.gf('data.msgNum')
        this.metaAction.sf('data.msgNum', num - 1)
    }
    getMessageContent = (content) => {
        return (
            <div id={'portalDetailMessage'} dangerouslySetInnerHTML={{ __html: content }}></div>
        )
    }
    menusearchChange = (e) => {
        const value = e.target.value
        this.metaAction.sf('data.other.menusearch', value)
    }

    clearMenusearch = () => {
        this.metaAction.sf('data.other.menusearch', '')
    }

    menuFilterForString = (data, string) => {
        if (!string) {
            return data
        }
        if (data.length == 0) {
            return []
        }
        let arr = []
        data.forEach(a => {
            if (a.name && a.name.includes(string)) {
                arr.push(a)
            } else {
                let b = this.menuFilterForString(a.children, string)
                if (b.length > 0) {
                    arr.push({
                        ...a,
                        children: b
                    })
                }
            }
        })
        return arr
    }

    menuFilter = () => {
        const value = this.metaAction.gf('data.other.menusearch'),
            menu = this.metaAction.gf('data.menu').toJS()
        const result = this.menuFilterForString(menu, value)
        return result
    }

    openHelpCenter = () => {
        let url = window.location.href;
        let arr = url.split('/')
        // arr.splice(arr.length - 2, 1);
        arr[arr.length - 1] = 'ttk-dz-app-help'
        let str = arr.join('/')
        window.open(str, '_blank')
    }
}

class DateCellCustom extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        // console.log('时间',this.props.nowTime,this.props.maxClosingPeriod,this.props.enableTime,(moment(this.props.nowTime) < moment(this.props.maxClosingPeriod)) && (moment(this.props.nowTime) > moment(this.props.enableTime)))
        if (!this.props.maxClosingPeriod) {
            return (<div>{Number(moment(this.props.nowTime).format('MM'))}月</div>)
        } else {
            if ((moment(this.props.nowTime) <= moment(this.props.maxClosingPeriod)) && (moment(this.props.nowTime) >= moment(this.props.enableTime))) {
                return (<div style={{ position: 'relative' }}>{Number(moment(this.props.nowTime).format('MM'))}
                    月 <Icon type="duigou"
                        fontFamily='edficon'
                        className='iconCustom'
                        style={{
                            fontSize: '17px',
                            float: 'right',
                            position: 'absolute',
                            top: '-4px',
                            right: '-12px'
                        }}
                    /></div>
                )
            } else {
                return (
                    <div>{Number(moment(this.props.nowTime).format('MM'))}月</div>
                )
            }
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })
    return ret
}
