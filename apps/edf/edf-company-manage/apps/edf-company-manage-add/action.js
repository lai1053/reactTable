import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'
import {consts} from 'edf-consts'
import {fetch as fetchUtil} from 'edf-utils'
import {LoadingMask} from 'edf-component'

import {FormDecorator} from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({component, injections}) => {
        this.voucherAction.onInit({component, injections})
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init', {
            isPop: this.component.props.isPop
        })
        this.loadSelect()
        let availableOrg = sessionStorage.getItem('currentOrgStatus')
        //用户登录，无绑定企业,创建企业打点
        if (typeof (gio) == "function") {
            if (sessionStorage['currentOrgStatus'] == 2) {
                if (sessionStorage['jchlRecord']) {
                    gio('track', 'createOrgLoad_' + sessionStorage['jchlRecord']);
                } else {
                    gio('track', 'createOrgLoad_jcgj');
                }
            }
        }
        if (availableOrg == 1 || availableOrg == 2) {
            return
        }
        this.load()
        //标识是否正在处理创建事件
        this.handleCreate = false
    }

    load = async (option) => {
        let payload = await this.GetPropertyList()
        this.injections.reduce('load', payload)
    }
    loadSelect = async () => {
        let arr = []
        //纳税人身份
        arr.push(consts.enum.VATTAXPAYER)
        //企业会计准则
        arr.push(consts.enum.ACCOUNTINGSTANDARDS)
        const enumList = await this.webapi.enumDetail.batchQuery(arr)
        //系统时间
        const date = new Date().getFullYear() + '-01'
        this.injections.reduce('loadSelect', enumList[consts.enum.VATTAXPAYER], enumList[consts.enum.ACCOUNTINGSTANDARDS], date)
    }
    GetPropertyList = async () => {
        return {
            list: [
                {enumId: consts.VATTAXPAYER_generalTaxPayer, name: '一般纳税人'},
                {enumId: consts.VATTAXPAYER_smallScaleTaxPayer, name: '小规模纳税人'}
            ]
        }
    }

    create = async () => {//新建企业
        if(this.handleCreate) return
        this.handleCreate = true
        let form = this.metaAction.gf('data.form').toJS()
        let user = this.metaAction.context.get('currentUser') || {}
        form = Object.assign(form, {creator: user.id})
        const ok = await this.check([{
            path: 'data.form.name', value: form.name
        }, {
            path: 'data.form.vatTaxpayer', value: form.vatTaxpayer
        }, {
            path: 'data.form.enabledDate', value: form.enabledDate
        }, {
            path: 'data.form.accountingStandards', value: form.accountingStandards
        }], 'create')
        if (!ok) {
            this.handleCreate = false
            return false
        }
        let params = {
            creator: form.creator,
            name: form.name.trim(),
            vatTaxpayer: form.vatTaxpayer,
            enabledYear: form.enabledDate.split('-')[0],
            enabledMonth: form.enabledDate.split('-')[1],
            accountingStandards: form.accountingStandards,
            industry: 2000030001,
        }
        params.requestUrl = location.hostname
        if(/^127.|^172.|^192./.test(location.hostname)) {
            params.requestUrl = 'localhost'
        }
        if(params.vatTaxpayer == '2000010002') {
            params.isSignAndRetreat = false
        }else if(params.vatTaxpayer == '2000010001'){
            params.isSignAndRetreat = true
        }
        LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
        let response = await this.webapi.org.create(params)
        let org = await this.webapi.org.updateCurrentOrg({orgId: response.id})
        //解决ie10下没有updateCurrentOrg接口异步问题，阻塞1s
        await new Promise(function(resolve){ setTimeout(function(){resolve(1)},1300)})
        if (response) {
        // if (response && org) {
            this.handleCreate = false
            localStorage.removeItem('thirdPartyOrgName')
	        //用户登录，无绑定企业,创建企业成功打点
	        if (typeof (gio) == "function") {
		        if (sessionStorage['currentOrgStatus'] == 2) {
			        if (sessionStorage['jchlRecord']) {
				        gio('track', 'createOrgFinish_' + sessionStorage['jchlRecord']);
			        } else {
				        gio('track', 'createOrgFinish_jcgj');
			        }
		        }
	        }
            this.component.props.onPortalReload && await this.component.props.onPortalReload()
            this.metaAction.toast('success', '创建成功')
            LoadingMask.hide()
	        //用户登录，无绑定企业,跳转首页打点
	        if (typeof (gio) == "function") {
		        if (sessionStorage['currentOrgStatus'] == 2) {
			        if (sessionStorage['jchlRecord']) {
				        gio('track', 'createOrgEnterPortal_' + sessionStorage['jchlRecord']);
			        } else {
				        gio('track', 'createOrgEnterPortal_jcgj');
			        }
		        }
	        }
            sessionStorage['currentOrgStatus'] = null
            this.component.props.setPortalContent('门户首页', 'edfx-app-portal', {
                isShowMenu: false,
                isTabsStyle: false
            })
        }else {
            this.handleCreate = false
            return false
        }
    }

    cancel = async () => {
        this.component.props.setPortalContent('企业管理', 'edf-company-manage')
    }

    goRegister = (e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }
        this.component.props.onRedirect({appName: 'edf-company-manage-add'})
    }
    goCompanyManage = (e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }

        this.component.props.onRedirect({appName: 'edf-company-manage'})
    }

    searchVisibleToogle = () => {
        this.metaAction.sf('data.isShowSearch', !this.metaAction.gf('data.isShowSearch'));
    }

    getSearchVisible = () => {
        return this.metaAction.gf('data.isShowSearch')
    }
    fieldChange = async (fieldPath, value, operate) => {
        await this.check([{path: fieldPath, value}], operate)
    }
    check = async (fieldPathAndValues, operate) => {
        if (!fieldPathAndValues)
            return

        let checkResults = []

        for (let o of fieldPathAndValues) {
            let r = {...o}
            if (o.path == 'data.form.name') {
                Object.assign(r, await this.checkName(o.value, operate))
            } else if (o.path == 'data.form.vatTaxpayer') {
                Object.assign(r, await this.checkVatTaxpayer(o.value))
            } else if (o.path == 'data.form.enabledDate') {
                Object.assign(r, await this.checkEnableDate(o.value))
            } else if (o.path == 'data.form.accountingStandards') {
                Object.assign(r, await this.checkAccountingStandards(o.value))
            }
            checkResults.push(r)
        }

        var json = {}
        var hasError = true
        checkResults.forEach(o => {
            json[o.path] = o.value
            json[o.errorPath] = o.message
            if (o.message)
                hasError = false
        })

        this.metaAction.sfs(json)
        return hasError
    }
    checkName = async (org, operate) => {
        var message
        if(operate && operate == 'create') {
            if(await this.webapi.org.existsSysOrg({'name':org.trim()}))
                return { errorPath: 'data.other.error.name', message:"该企业名称已注册"}
        }
        if(!org)
            message = '请输入企业名称'
        else if(org.length > 200)
            message = "企业名称不能超过200个字"
        return { errorPath: 'data.other.error.name', message }
    }
    checkVatTaxpayer = async (vatTaxpayer) => {
        var message
        if (!vatTaxpayer) {
            message = '纳税人性质不能为空'
        }
        return {errorPath: 'data.other.error.vatTaxpayer', message}
    }
    checkEnableDate = async (enableDate) => {
        var message
        if (!enableDate) {
            message = '启用日期不能为空'
        }
        return {errorPath: 'data.other.error.enableDate', message}
    }
    checkAccountingStandards = async (accountingStandards) => {
        var message
        if (!accountingStandards) {
            message = '会计准则不能为空'
        }
        return {errorPath: 'data.other.error.accountingStandards', message}
    }
    topMenuClick = async (e) => {

        switch (e.key) {
            case 'mySetting':
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
        }
    }
    setField = async (path, value) => {
        this.voucherAction.fieldChange(path, value)
    }
    checkOrg = async (option) => {
        let res = await this.webapi.enumDetail.checkOrg({name: option})
    }
    changeDateState = () => {
        let state = this.metaAction.gf('data.other').toJS().editDate
        this.metaAction.sf('data.other.editDate', !state)
    }
    changeStandardState = () => {
        let state = this.metaAction.gf('data.other').toJS().editStandard
        this.metaAction.sf('data.other.editStandard', !state)
    }
    //选择创建企业
    toAddCompany = () => {
        this.metaAction.sf('data.showAdd', !(this.metaAction.gf('data.showAdd')))
    }
    //导入企业
    importCompany = () => {
        //this.component.props.setPortalContent('凭证管理', 'ttk-access-app-tranreport')
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({...option, metaAction}),
        o = new action({...option, metaAction, voucherAction}),
        ret = {...metaAction, ...voucherAction, ...o}

    metaAction.config({metaHandlers: ret})

    return ret
}



