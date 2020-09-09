import React from 'react'
import { Icon, Notification } from 'edf-component'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import { history, fetch, environment, xml } from 'edf-utils'
import { consts } from 'edf-consts'
import config from './config'
import moment from 'moment'
import debounce from 'lodash.debounce'
import female from './img/female_t.png'
import male from './img/male_t.png'
import other from './img/other_t.png'
import beta_top from './img/beta_top.png'
import beta_right from './img/beta_right.png'
import qrcodeImg from './img/qrcode.jpg'
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
        this.manageListShow = debounce(this.manageListShow, 500);
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.expireDate = 30    // 距离多少天提示要购买
        this.companyBuyInfo = '' //当前企业订购详情
        injections.reduce('init')

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        //如果是新代账；注册 message 事件
       // if(this.component.props.source == 'xdz'){
            if (window.addEventListener) {
                window.addEventListener('message', this.onMessage, false)
            } else if (window.attachEvent) {
                window.attachEvent('onmessage', this.onMessage)
            } else {
                window.onmessage = this.onmessage
            }
        //}
        //没有token跳转到登录
        if (!sessionStorage.getItem('_accessToken')) {
            this.component.props.onRedirect(this.config.goAfterLogout)
            return
        }
        //更新皮肤
        this.toggleColor(localStorage.getItem('skin') || '#0066B3')

        //history增加
        history.listen('edfx-app-portal', this.listen)
        //定义回调
        this.tabCloseListens = {}
        this.tabChangeListens = {}
        //根据账号下企业list的情况做跳转
        let availableOrg = sessionStorage.getItem('currentOrgStatus')
        if (availableOrg == 1 || availableOrg == 2) {
            this.metaAction.sf('data.headCtrl', false)
            return
        }
        // 新代账设置公司logo
        if(sessionStorage.getItem('registerInfo')){
            let registerInfo = JSON.parse(sessionStorage['registerInfo'])
            this.metaAction.sf('data.logoImg',registerInfo.companyLogoUrl)
        }
        this.load()

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
                    this.setContent('新建企业', 'edf-company-manage', { tabState: 2 })
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

    componentWillUnmount = () => {
        history.unlisten('edfx-app-portal', this.listen)
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
            case 'taxOpenSecondTab':
                let org = this.metaAction.gf('data.org') && this.metaAction.gf('data.org').toJS() || {},
                    currentOrg = this.metaAction.context.get('currentOrg');
                if(currentOrg.id == org.id){
                    this.setContent(appData.title, 'ttk-edf-app-iframe?linkcode=' + new Date().getTime(), { 'src': appData.url })
                }
                break;
        }
    }

    windowClick = (e) => {
        if (!document.getElementById('edfx-app-portal-search-id')) return
        const dom = document.getElementById('edfx-app-portal-search-id').parentNode
        if (!dom.contains(e.target)) {
            this.metaAction.sfs({
                'data.animation1': 'out',
                'data.showPanel': 'none'
            })
        }
    }
    onMenuMouseOver = (e) => {
        let flag = this.metaAction.gf('data').toJS()
        this.metaAction.sfs({
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
        this.metaAction.sf('data.currentMenuStyle', 'menuscroll')
    }
    onScrollMouseLeave = () => {
        this.metaAction.sf('data.currentMenuStyle', 'nomenuscroll')
    }
    componentWillReceiveProps = async (nextProps) => {
        if(!isEqual(nextProps.isRefresh,  this.component.props.isRefresh)) {
            this.load()
        }
    }

    load = async (option) => {
        await this.webapi.portal.init()
        let response = await this.webapi.portal.portal()
        let appId = null
        if (response.app) {
            appId = response.app.id
            this.metaAction.sf('data.appVersion', response.app.id)
        }
        if (response) {
            let indexOrg = response.org
            this.companyBuyInfo = indexOrg
            if (response.isExpire) {
                // this.expireRemind()   //原本弹窗提示过期的方法
                this.metaAction.sfs({
                    'data.other.isExpire': true,
                    'data.other.isExpireStatus': 2,
                    'data.other.isExpireText': `亲，您的订购已到期，只能查询不能操作，请尽快购买/续费！${appId == 104 ? '' : "如有疑问，请联系客服热线：400-99-12366"}`,
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
                                'data.other.isExpireText': `亲，您的试用期今天是最后1天!如果使用还不错，现在就购买吧。${appId == 104 ? '' : "客服热线：400-99-12366"}`,
                            })
                        } else {
                            this.metaAction.sfs({
                                'data.other.isExpire': false,
                                'data.other.isExpireStatus': 1,
                                'data.other.isExpireText': `亲，您的试用期还有${expireDay}天，如果使用还不错，现在就购买吧。${appId == 104 ? '' : "客服热线：400-99-12366"}`,
                            })
                        }
                    } else if (indexOrg.status == 1000070006 && expireDay < this.expireDate && expireDay >= 0) {
                        if (expireDay == 0) {
                            this.metaAction.sfs({
                                'data.other.isExpire': false,
                                'data.other.isExpireStatus': 1,
                                'data.other.isExpireText': `亲，您购买的产品今天是最后1天!为了不影响您的正常业务，请您及时进行续购操作。${appId == 104 ? '' : "客服热线：400-99-12366"}`,
                            })
                        } else {
                            this.metaAction.sfs({
                                'data.other.isExpire': false,
                                'data.other.isExpireStatus': 1,
                                'data.other.isExpireText': `亲，您购买的产品还有${expireDay}天将过期，为了不影响您的正常业务，请您及时进行续购操作。${appId == 104 ? '' : "如有疑问，请联系客服热线：400-99-12366"}`,
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
        if (option && option != 'noReloadTplus') {
            response.org = Object.assign(response.org, option)
        }

        if (response.user) {
            //新代账---审核人
            response.user.financeAuditor = response.org && response.org.financeAuditor || response.user.nickname
            //新代账---制单人
            if(response.org && response.org.financeCreator){
                response.user.nickname = response.org.financeCreator
            }
            this.metaAction.context.set('currentUser', response.user)
        } else {
            this.metaAction.context.set('currentUser', undefined)
            if (this.component.props.onRedirect && this.config.goAfterLogout) {
                this.component.props.onRedirect(this.config.goAfterLogout)
            }
        }
        if (response.org) {
            //设置在gio上的id，以便后续跟进
            if (typeof (gio) == "function") {
                gio('setUserId', response.org.id);
            }
            // 金财助手打点统计 设置企业名称
            _maq && _maq.push(['_setCompany', response.org.id, response.org.name])

            let currentOrg = this.metaAction.context.get("currentOrg")
            let month = response.periodDate.periodDate.split('-')[1]
            if(month < 10) {
                month = '0' + Number(month)
            }
            response.periodDate.periodDate = response.periodDate.periodDate.split('-')[0] + '-' + month
            response.org.periodDate = response.periodDate.periodDate
            if(response.periodDate.systemDate) response.org.systemDate = response.periodDate.systemDate
            response.org.maxClosingPeriod = response.periodDate.maxClosingPeriod
            if(response.areaRule) {
                response.org.areaCode = response.areaRule.areaCode
                response.org.invoiceVersion = response.areaRule.invoiceVersion
                response.org.uploadType = response.areaRule.uploadType
            }

            this.metaAction.context.set('currentOrg', response.org)
            this.metaAction.sf('data.org', fromJS(response.org))
        } else {
            this.metaAction.context.set('currentOrg', undefined)
            if (this.component.props.onRedirect && this.config.goAfterLogout) {
                this.component.props.onRedirect(this.config.goAfterLogout)
            }
        }
        if (response.linkConfig) {
            const { dbHost, dbPort, dbUsername, dbPassword, appVersion, appName, dbVersion, bsAppHost, bsAppPort, foreseeClientHost, appUserName, appPassword, appAccountNumber, databaseName, appAccountName, appLoginDate, ttkOrgId, ttkLoginDate } = response.linkConfig;
            this.metaAction.context.set('linkConfig', {
                ...response.linkConfig,
                appName: /Tplus/.test(appName) ? 'T+' : appName
            });

            if (option != 'noReloadTplus') {
                const options = {
                    headers: {
                        token: response.org.id
                    }
                }

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
                            isReturnValue: true,
                            appVersion
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
        let menuStyle = response.menuTreeMemory.state ? 1 : 1
        //let defaultOpenKeys = this.getMenuSelectKeys()
        if (response.menu) {
            this.injections.reduce('load', {
                menu: response.menu,
                originMenu:response.originMenu,
                vatTaxpayer: response.org.vatTaxpayer,
            }, menuStyle)
        }
        if (response.periodDate) {
            let month = response.periodDate.periodDate.split('-')[1]
            if(month < 10) {
                month = '0' + Number(month)
            }
            response.periodDate.periodDate = response.periodDate.periodDate.split('-')[0] + '-' + month
            let obj = {
                maxClosingPeriod: response.periodDate.maxClosingPeriod,
                periodDate: moment(response.periodDate.periodDate)
            }
            this.metaAction.sf('data.periodDate', obj)
        }
        this.injections.reduce('changeMenuType', [10])
        this.metaAction.sfs({
            'data.menuMathRandom': Math.random(),
            'data.headCtrl': true,
            'data.isShowSearch': false,
        })

        //直接打开App
        this.defaultAppOpen(response)
        //用户ca临近一个月过期提醒
        if(response.message && response.message.caExpireDate && new Date(response.message.caExpireDate.slice(0,10)).getTime() - Date.now() < 2592000000){
            setTimeout(function(Notification){
                let date = new Date(response.message.caExpireDate.slice(0,10))
                Notification.warn({
                    key: 'caExpireDateShowInPortal',
                    message: '尊敬的用户：',
                    description: <div>您的一证通到期时间为{date.getFullYear()}年{date.getMonth()+1}月{date.getDate()}日，为不影响您的正常使用，请及时更新证书（若已更新请插上一证通重新读取企业信息）！一证通数字证书自助服务网址：<a target='_blank' href="http://help.bjca.org.cn/">help.bjca.org.cn</a></div>,
                    duration: 5,
                    onClick: () => {
                        // console.log('点击窗口');
                    },
                });
            }.bind(null,Notification),5000)
        }
    }

    defaultAppOpen = (response) => {
        let joinsource = sessionStorage['joinsource'] || sessionStorage['thirdPartysourceType'], appInfo = null, dzglInfo = this.component.props.dzglInfo, openApp = {}, appId = response.app && response.app.id
        if (sessionStorage['appInfo'])  appInfo = JSON.parse(sessionStorage['appInfo'])
        if (joinsource == 'newjcgj' || joinsource == 'qygl' || joinsource == 'bsgzt') {
            openApp = { name: appInfo.name, appName: appInfo.appName }
        }else if(joinsource == 'xdz' && appInfo.page == 'ysdjsbjk') {
            openApp = { name: '申报缴款', appName: 'ttk-taxapply-app-electronic-tax', appProps: {linkCode: 12010, linkType: 'ysdj', requestType: 0} }
        }else if(joinsource == 'xdz' && appInfo.page == 'ysdjsbse') {
            openApp = { name: '申报税额', appName: 'ttk-taxapply-app-electronic-tax', appProps: {linkCode: 12030, requestType: 0} }
        }else if(appId == 114 && dzglInfo && dzglInfo.appName){
            let menuSelect = response.originMenu.filter( (data) => data.appName == dzglInfo.appName && data.name == dzglInfo.name)
            dzglInfo.name = menuSelect.length > 0 ? menuSelect[0].name : dzglInfo.name
            openApp = { name: dzglInfo.name, appName: dzglInfo.appName }
        }
        if(Object.keys(openApp).length > 0){
            this.setContent(openApp.name, openApp.appName, openApp.appProps)
            let menuSelect = response.originMenu.filter( (data) => data.appName == openApp.appName && data.name == dzglInfo.name)
            // if(menuSelect.length > 0) this.menuSelectChange(menuSelect[0].id)
            if(menuSelect.length > 0){
                let id = String(menuSelect[0].id)
                if(id.length == 3){
                    this.metaAction.sf('data.selectedKeys', [id])
                }else if(id.length > 3){
                    let num = (id.length - 3)/2, arr = []
                    for(let i =0; i < num; i++){
                        arr.push(id.slice(0,id.length - i * 2))
                    }
                    arr.push(id.slice(0,3))
                    this.injections.reduce('stateChange', 'data.selectedKeys', arr)
                    let arrCopy =JSON.parse(JSON.stringify(arr))
                    arrCopy.shift()
                    this.injections.reduce('stateChange', 'data.defaultOpenKeys', arrCopy)
                }
            }
        }
        sessionStorage.removeItem('joinsource')
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
            list = data.manageList
        } else {
            data.manageList.forEach(function (listData) {
                if (listData.helpCode&&listData.helpCode.includes(text.toUpperCase() + '') || listData.name.includes(text + '') || (listData.vatTaxpayerNum && listData.vatTaxpayerNum.includes(text + ''))) {
                    // if(listData.name.indexOf(text) > -1){
                    list.push(listData)
                }
            })
        };
        // $manageListShow(list)
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
        this.setContent('门户首页', 'edfx-app-portal', {
            isShowMenu: false,
            isTabsStyle: false
        })
        this.injections.reduce('closeContentReally', 'toggleManage')
        if (data.manageList.length >= 8) {
            document.getElementsByClassName('edfx-app-portal-header-right-menu-deptSearch')[0].children[0].value = ''
        }

        this.metaAction.sfs({
            'data.selectedKeys': ''
        })
    }
    handleVisibleChange = (visible) => {
        this.metaAction.sf('data.visible', visible)
    }
    userVisibleChange = (visible) => {
        this.metaAction.sf('data.userMenuVisible', visible)
    }
    menuControl = async (e) => { //帮助中心控制面板
        if (this.metaAction.gf('data.showPanel') == 'block') {
            this.metaAction.sfs({
                'data.showPanel': 'none',
                'data.animation': 'in'
            })
        } else {
            this.metaAction.sfs({
                'data.showPanel': 'block',
                'data.animation': 'in'
            })
        }
    }
    hidePanel = () => {
        this.metaAction.sfs({
            'data.animation': 'out',
            'data.showPanel': 'none'
        })
    }
    animationEnd = () => {
        this.metaAction.gf('data.animation') == 'out' &&
            this.metaAction.sf('data.showPanel', 'none')
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

    resize = () => {}

    switchMenu = () => {
        let flag = this.metaAction.gf('data').toJS()
        this.metaAction.sfs({
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
        let isExpire = this.metaAction.gf('data.other.isExpire')
        const loop = (children, num) => {
            const ret = [];
            if (num == 1) {
                children.forEach(child => {
                    if (child.id != "1") {
                        ret.push({
                            name: child.key,
                            key: child.key,
                            // disabled: "{{data.currentMenuType==1?true:false}}",
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
                        // console.log(data.isExpire, child.expireIsOpen, child.key)
                        ret.push({
                            name: child.key,
                            key: child.key,
                            disabled: isExpire ? (!child.expireIsOpen) : false,
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
        let newItem = item,
            lastSubMenu = [],
            data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS(),
            menu = data.menu,
            openKeys = data.defaultOpenKeys
        const latestOpenKey = item.find(key => openKeys.indexOf(key) === -1);
        //原全部展开
        // if (item) {
        //     if (item.length > 0) {
        //         item.map((i) => {
        //             if (i.length == 4) {
        //                 lastSubMenu = new Array(i)
        //             } else {
        //                 newItem.push(i)
        //             }
        //         })
        //     }
        // }
        //现只展开一个
        if(latestOpenKey < 1000){
            newItem = [ latestOpenKey ]
        }else if(newItem.length > 0 && newItem[0].length > 3){
            newItem = [ ]
        }
        if (newItem.length == 0 || newItem.length > 0 && (newItem[0].length == 2 || newItem[0].length == 3)) {
            // newItem = newItem.concat(lastSubMenu)
            let updateArrList = {
                'data.menuMathRandom': Math.random(),
                'data.defaultOpenKeys': newItem
            }
            this.metaAction.sfs(updateArrList)
            /*控制MENU滚动条位置 */
            let pageY = window.event.pageY || 0,
                currentY = $('.mk-layout edfx-app-portal-content-left .menuscroll').scrollTop() || 0

            if (currentY > 100) {
                window.setTimeout(function () {
                    $('.mk-layout edfx-app-portal-content-left .menuscroll').scrollTop(parseInt(pageY) + 100)
                }, 10)
            }
        }

    }
    createLink = () => {
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
            case '#FF913A':
                link.href = origin + '/yellowTheme' + '.css'
                break;
            case '#00B38A':
                link.href = origin + '/greenTheme' + '.css'
                break;
            case '#0066B3':
                link.href = origin + '/blueTheme' + '.css'
                break;
            case '#1EB5AD':
                link.href = origin + '/businessBlueTheme' + '.css'
                break;
            case '#B4A074':
                link.href = origin + '/orangeTheme' + '.css'
                break;
            case '#414141':
                link.href = origin + '/blackTheme' + '.css'
                break;
            default:
                link.href = origin + '/blueTheme' + '.css'
                break;
        }
        //各个子模块主题颜色加载
        changeTheme(origin, color)

        if (action && action == 'change') {
            this.webapi.user.updateSkin(color)
            localStorage['skin'] = color
        }
    }

    toggleColorforIe = async (color, action) => {
        //let hash = (__webpack_hash__).slice(0, 8)
        //link.href = origin + '/splitcss/yellowTheme' + `-${i}` + '.css'
        let theme = null
        switch (color) {
            case '#FF913A':
                theme = '/splitcss/yellowTheme'
                break;
            case '#00B38A':
                theme = '/splitcss/greenTheme'
                break;
            case '#0066B3':
                theme = '/splitcss/blueTheme'
                break;
            case '#1EB5AD':
                theme = '/splitcss/businessBlueTheme'
                break;
            case '#B4A074':
                theme = '/splitcss/orangeTheme'
                break;
            case '#414141':
                theme = '/splitcss/blackTheme'
                break;
            default:
                theme = '/splitcss/blueTheme'
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
        this.metaAction.sf('data.userMenuVisible', false)
        switch (e.key) {
            case 'mySetting':
                this.currentStatus()
                this.setContent('个人设置', 'edfx-app-my-setting')
                break;
            case 'logout':
                if (this.component.props.onRedirect && this.config.goAfterLogout) {
                    let res = await this.webapi.user.logout()
                    if (res) {
                        this.metaAction.context.set('currentUser', undefined)
                        this.metaAction.context.set('currentOrg', undefined)
                        sessionStorage.removeItem('mobile')
                        sessionStorage.removeItem('username')
                        sessionStorage.removeItem('_accessToken')
                        sessionStorage.removeItem('password')
                        this.component.props.onRedirect(this.config.goAfterLogout)
                    }
                }
                break;
            case 'newGuide':
                this.currentStatus()
                this.setContent('新手引导', 'ttk-edf-app-beginner-guidance')
                break;
            case 'helpDoc':
                this.currentStatus()
                this.setContent('帮助中心', 'ttk-edf-app-help-center')
                break;
            default:
                return
        }
        let selectedKeys = this.metaAction.gf('data.selectedKeys')

        if (selectedKeys && selectedKeys.toJS) {
            selectedKeys = selectedKeys.toJS()
            selectedKeys[0] = e.key
            this.metaAction.sf('data.selectedKeys', fromJS(selectedKeys))
        }

    }
    //点击上方菜单跳转到新app前判断菜单和tab是否处于隐藏状态
    currentStatus = () => {
        let appArr = ['edf-company-manage', 'edf-company-manage-add', 'ttk-gl-app-importdata-enterprise']
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
        this.setContent('新建企业', 'edf-company-manage-add')
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

        this.setContent('企业管理', 'edf-company-manage')
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
        let searchContainer = document.querySelector('.edfx-app-portal-search-container')
        searchContainer.className = searchContainer.className.replace('slideInRight', 'fadeOutRight')
    }

    searchAnimationEnd = (e) => {
        let searchContainer = document.querySelector('.edfx-app-portal-search-container')
        let flag = searchContainer.className.indexOf('slideInRight') != -1 ? true : false
        if (flag) {
            let searchInput = document.querySelector('#edfx-app-portal-search-id')
            searchInput.focus()
        } else {
            this.metaAction.sf('data.isShowSearch', false)
        }
    }

    menuClick = async (e) => {
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
        if (hit.requestType == 1) {
            let url = hit.appProps && JSON.parse(hit.appProps).url
            window.open(url)
        }else if(appBasicInfo && (appBasicInfo.runningMode == 1 && hit.appName == 'edfx-app-org') || (appBasicInfo.runningMode == 1 && hit.appName == 'ttk-taxapply-app-taxlist')) {
            let appName = 'ttk-edf-app-iframe?code=' + hit.code
            let appkey = appBasicInfo.publicCloudAppKey
            let src = await this.webapi.getOwnCode()
            let skin = encodeURIComponent(localStorage['skin'])
            src = src.replace('edfx-app-org', hit.appName) + '&sourceType=oem&theme=' + skin
            this.setContent(hit.name, appName, {src})
        } else {
            this.setContent(hit.name, hit.appName, hit.appParams)
        }
        this.metaAction.sfs({
            'data.selectedKeys': e && e.keyPath,
        })
        /*末级点击时二级全部收缩*/
        /*点击三级时，二级不收缩 */
        // if (!needFolded) {
        //     let menuItem = this.metaAction.gf('data.defaultOpenKeys'),
        //         newItem = []
        //     const lastSubMenu = new Array(hit.key)
        //     let parentId = String(hit.parentId)
        //     if (menuItem) {
        //         if (menuItem.length > 0) {
        //             menuItem.map((i) => {
        //                 if (i.length == 2) {
        //                     newItem.push(i)
        //                 }
        //
        //                 if (i.length == 4) {
        //                     if (lastSubMenu.toString().substr(0, 4) == i) {
        //                         newItem.push(i)
        //                     } else if (parentId.substr(0, 4) == i) {
        //                         newItem.push(i)
        //                     }
        //                 }
        //             })
        //         }
        //     }
        //     if (newItem.length > 0) {
        //         debugger
        //         newItem = newItem.concat(lastSubMenu)
        //         this.metaAction.sfs({
        //             'data.menuMathRandom': Math.random(),
        //             'data.selectedKeys': lastSubMenu,
        //             'data.defaultOpenKeys': newItem,
        //         })
        //     }
        // }
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
                // this.reInitContent()
            }
        }
    }

    closeTabs = (e) => {
        let content = this.metaAction.gf('data.content')
        if(content.size == 0) return false
        let key = e.key,
        name = null,
        status = false,
        that = this,
        openTabs = this.metaAction.gf('data.openTabs').toJS();
        content = content.toJS()


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
                if (content && content.appName != 'edfx-app-home') {
                    this.injections.reduce('closeContent', content.name)
                    this.metaAction.sf('data.mathRandom', Math.random())
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
        this.metaAction.sfs({
            'data.showControlPanel': 'block',
            'data.panelAnimation': 'in'
        })
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
        this.metaAction.sfs({
            'data.currentMenuType': selectItem,
            'data.menuMathRandom':Math.random()
        })
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
    deleteOpenTabsAppProps = (name, appName, appProps = {}) => {
        this.injections.reduce('deleteOpenTabsAppProps', name, appName, appProps)
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
    //获取页面编辑状态
    getEditingStatus = (name, cb) => {
        let openTabs = this.metaAction.gf('data.openTabs'), status

        for (var i = 0; i < openTabs.size; i++) {
            if (openTabs.get(i).get('appName') == name) {
                status = openTabs.get(i).get('editing')
                break
            }
        }

        cb(status)
        cb(status)
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
    //关闭popover时取消选中menu
    cancelCheckStatus = (visible) => {
        if (!visible) {
            this.metaAction.sf('data.selectedKeys', fromJS([]))
        }
    }
    foldMenu = () => { }
    /**
     * dev模式下才显示开发帮助
     */
    isDevMode = () => {
        return environment.isDevMode()
    }
    //develop开发管理链接
    batchMenuClick = (e) => {
        let links = {
            'axure': 'http://prototype.aierp.cn:8089',
            'jira': 'http://jira.aierp.cn:8089/',
            'dictionary': 'http://dic.aierp.cn:8089/',
            'Jenkins': 'http://builder.aierp.cn:8089/',
            'ued': 'http://ued.aierp.cn:8089/',
            'k8s': 'http://k8s.aierp.cn:8089/',
            'sonar': 'http://sonar.aierp.cn:8089/',
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
        } else {
            window.open(links[e.key])
        }
    }
    openWebApi = () => {
        this.setContent('api', 'app-common-iframe')
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
        if(sessionStorage['appId'] == 114){
            const res = await this.metaAction.modal('confirm', {
                width: 450,
                okText: '切换',
                content: '将关闭全部已打开的页签，确定要切换吗？',
            })
            if(!res) {
                this.injections.reduce('stateChange', 'data.refresh', {})
                return false
            }
        }

        // let currentOrg = this.metaAction.context.get("currentOrg")
        // currentOrg.periodDate = str
        // this.metaAction.context.set('currentOrg', currentOrg)
        let response = await this.webapi.periodDate({
            periodDate: str
        })
        if (response) {
            // this.closeTabs({ key: 'all' })
            // this.load()
            //
            let currentOrg = this.metaAction.context.get('currentOrg') || {}
            let month = response.periodDate.split('-')[1]
            if(month < 10) {
                month = '0' + Number(month)
            }
            response.periodDate = response.periodDate.split('-')[0] + '-' + month
            currentOrg.periodDate = response.periodDate
            this.metaAction.context.set('currentOrg', currentOrg)
            // this.setContent('门户首页', 'edfx-app-portal', {
            //     isShowMenu: false,
            //     isTabsStyle: false
            // })
            this.closeTabs({ key: 'all' })
            this.load()
        }
    }

    //月份渲染
    monthCellCustom = (date) => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        if(parseInt(currentOrg.enabledMonth) < 10) currentOrg.enabledMonth =  '0' + parseInt(currentOrg.enabledMonth)
        let enableTime = currentOrg.enabledYear + '-' + currentOrg.enabledMonth,
            maxClosingPeriod = currentOrg.maxClosingPeriod
        return <DateCellCustom enableTime={enableTime} maxClosingPeriod={maxClosingPeriod} nowTime={date.format('YYYY-MM')}></DateCellCustom>
    }

    //控制已结账图标
    isSettle = () => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            enableTime,
            periodDate = this.metaAction.gf('data.periodDate'),
            headCtrl = this.metaAction.gf('data.headCtrl')
        if (!!currentOrg) {
            if(parseInt(currentOrg.enabledMonth) < 10) currentOrg.enabledMonth =  '0' + parseInt(currentOrg.enabledMonth)
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
                this.setContent('新建企业', 'edf-company-manage', { tabState: 2 })
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
                this.setContent('新建企业', 'edf-company-manage', { tabState: 2 })
            } else {
                return
            }
        } else {
            this.setContent('产品激活', 'ttk-edf-app-org-activate', { company: this.companyBuyInfo, activateSource: 'edfx-app-portal' })
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
    //返回代账
    backToDz = async () => {
        const appId = this.metaAction.gf('data.appVersion')
        const dzglInfo = this.component.props.dzglInfo
        if(appId == 114) {
            const res = await this.webapi.dzgl.getDzgl()
            if(res.result && res.value.token) {
                if(res.value.token.appId == 114 && res.value.token.orgType == 1) {
                    sessionStorage['_accessGlToken'] = res.token
                }
            }
            this.component.props.onRedirect(this.config.goDzgl)
        }else {
            let code = await this.webapi.dzCode()

            if(!!code) {
                //判断环境
                let domain = location.host
                if(domain.indexOf('debug-dz') != -1) {
                    window.location.href = consts.JCYY_TEST_DOMAIN + '?code=' + code
                }else if(domain.indexOf('demo-erp') != -1) {
                    window.location.href = consts.JCYY_DEMO_DOMAIN_HTTP + '?code=' + code
                }else if(domain.indexOf('dzdemo') != -1) {
                    window.location.href = consts.JCYY_DEMO_DOMAIN_HTTPS + '?code=' + code
                }else if(domain.indexOf('dz.jchl') != -1) {
                    window.location.href = consts.JCYY_ONLINE_DOMAIN + '?code=' + code
                }

            }else {
                this.metaAction.toast('error', 'code获取错误')
            }
        }

    }
    //查询税务linkcode
    queryLinkCode = (name, appName,cb) => {
        let menus = this.metaAction.gf('data.menu').toJS()
        let ret = {}
        function getLinkCode(item, name, appName) {
            if(item.name == name && item.appName == appName) {
                ret = item
                return true
            }else if(item.children && item.children.length > 0) {
                for(let i = 0 ; i < item.children.length; i++) {
                    let r = getLinkCode(item.children[i], name, appName)
                    if(r) return true
                }
            }
        }
        for(let i = 0 ; i < menus.length; i++ ){
            let r = getLinkCode(menus[i], name, appName)
            if(r) break
        }

        cb(ret)
    }

    openMySet = () => {
        this.setContent('个人设置', 'edfx-app-my-setting')
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
