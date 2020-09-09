import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS } from 'immutable'
import moment from 'moment'
import config from './config'
import md5 from 'md5'
import { userInfo } from 'os';
import { path, string } from 'edf-utils'
import { consts } from 'edf-consts'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        let info = {}
        info.version = path.getVersion()
        injections.reduce('init', info)
        this.load()
        let sourceTpye = this.component.props.appParams.sourceType
        if(sourceTpye && sourceTpye == 'zsbj') {
            this.metaAction.sf('data.other.title', '免费试用30天，不限用户')
        }
        //注册打点
	    if (typeof (gio) == "function") {
		    if(this.component.props.appParams.areacode && this.component.props.appParams.sourceType){
		    	gio('track', 'userRegisterLoad_'+this.component.props.appParams.sourceType+'_'+this.component.props.appParams.areacode);
	        }else {
			    gio('track', 'userRegisterLoad_jcgj');
		    }
        }

        this.handleCreate = false
    }

    onOk = async () => {
        return await this.save()
    }

    load = async () => {
        //行业
        const industry = await this.webapi.enumDetail.findByEnumId({ enumId: 200003 })
        //纳税人身份
        const vatTaxpayer = await this.webapi.enumDetail.findByEnumId({ enumId: 200001 })

        //企业会计准则
        const accountingStandards = await this.webapi.enumDetail.findByEnumId({ enumId: 200002 })
        //系统时间
        // const date = await this.webapi.enableDate.getServerDate()
        const date = new Date().getFullYear() + '-01'
        this.injections.reduce('load', industry, vatTaxpayer, accountingStandards, date)
    }

    userregister = async () => {
        const other = this.metaAction.gf('data.other').toJS();
        const form = this.metaAction.gf('data.form').toJS();
        if (other.step === 1) {

            const basicInfo = await this.check([{
                path: 'data.form.mobile', value: form.mobile
            }, {
                path: 'data.form.password', value: form.password
            }, {
                path: 'data.form.captcha', value: form.captcha
            }], 'next')
            if (!basicInfo) return
            this.clearTimer(false, '获取验证码')
            this.metaAction.sf('data.other.step', 2)
            //埋点
            _hmt && _hmt.push(['_trackEvent', '系统管理', '企业注册', '下一步'])
	        //用户信息打点
	        if (typeof (gio) == "function") {
		        if(this.component.props.appParams.areacode && this.component.props.appParams.sourceType){
			        gio('track', 'userRegisterUser_'+this.component.props.appParams.sourceType+'_'+this.component.props.appParams.areacode);
		        }else {
			        gio('track', 'userRegisterUser_jcgj');
		        }
	        }
        } else if (other.step === 2) {

            const companyInfo = await this.check([{
                path: 'data.form.org', value: form.org
            }, {
                path: 'data.form.industry', value: form.industry
            }, {
                path: 'data.form.vatTaxpayer', value: form.vatTaxpayer
            }])
            if (!companyInfo) return

            this.metaAction.sf('data.other.step', 3)
	        //企业信息打点
	        if (typeof (gio) == "function") {
		        if(this.component.props.appParams.areacode && this.component.props.appParams.sourceType){
			        gio('track', 'userRegisterOrg_'+this.component.props.appParams.sourceType+'_'+this.component.props.appParams.areacode);
		        }else {
			        gio('track', 'userRegisterOrg_jcgj');
		        }
	        }
        } else if (other.step === 3) {
            if(this.handleCreate) return
            this.handleCreate = true
            const baseInfo = await this.check([{
                path: 'data.form.enableDate', value: form.enableDate
            }, {
                path: 'data.form.accountingStandard', value: form.accountingStandard
            }])
            if (!baseInfo) {
                this.handleCreate = false
                return
            }
            let user = { mobile: form.mobile, password: md5(form.password + '*the3Kingdom*'), clearText: Base64.encode(form.password) };
            let sysOrg = { name: form.org.trim(), industry: form.industry, vatTaxpayer: form.vatTaxpayer }
            sysOrg.enabledYear = form.enableDate.split('-')[0]
            sysOrg.enabledMonth = form.enableDate.split('-')[1]
            sysOrg.accountingStandards = form.accountingStandard
            if (sysOrg.vatTaxpayer == '2000010002') {
                sysOrg.isSignAndRetreat = false
            } else if (sysOrg.vatTaxpayer == '2000010001') {
                sysOrg.isSignAndRetreat = true
            }
            user.sysOrg = sysOrg
            let opt = {}
            opt.user = user
            opt.captcha = form.captcha
            opt.sign = form.sign
            opt.user.passwordStrength = this.pwdLevel(form.password)
            opt.user.requestUrl = location.hostname
            if(/^127.|^172.|^192./.test(location.hostname)) {
                opt.user.requestUrl = 'localhost'
            }
            const response = await this.webapi.user.create(opt)
	        //完成注册打点
	        if (typeof (gio) == "function") {
		        if(this.component.props.appParams.areacode && this.component.props.appParams.sourceType){
			        gio('track', 'userRegisterFinish_'+this.component.props.appParams.sourceType+'_'+this.component.props.appParams.areacode);
		        }else {
			        gio('track', 'userRegisterFinish_jcgj');
		        }
	        }
            //跳转到门户
            if (form.password) {
                form.password = md5(form.password + '*the3Kingdom*')
            }
            sessionStorage['mobile'] = form.mobile
            sessionStorage['username'] = response.value.nickname
            sessionStorage['_accessToken'] = response.token
            sessionStorage['password'] = form.password
            sessionStorage['currentOrgStatus'] = null
            //判断着陆页注册还是正常注册
            if (this.component.props && this.component.props.appParams && this.component.props.appParams.source == 'landingPage') {
                let key = Object.keys(response.value), landingPage = ''
                for (let i = 0; i < key.length; i++) {
                    if (key[i] != 'token') {
                        landingPage = landingPage + key[i] + '=' + response.value[key[i]] + '&'
                    } else {
                        let tokenKey = Object.keys(response.value.token)
                        for (let q = 0; q < tokenKey.length; q++) {
                            landingPage = landingPage + tokenKey[q] + '=' + response.value.token[tokenKey[q]] + '&'
                        }
                    }
                }
                window.name = `_accessToken=${response.token}&${landingPage.slice(0, landingPage.length - 1)}`
                this.handleCreate = false
                window.location.href = `http://gj.aierp.cn:8089`
            } else {
                if (this.component.props.onRedirect && this.config.goAfterLogin) {
	                //完成注册进入首页打点
	                if (typeof (gio) == "function") {
		                if(this.component.props.appParams.areacode && this.component.props.appParams.sourceType){
			                gio('track', 'userRegisterEnterPortal_'+this.component.props.appParams.sourceType+'_'+this.component.props.appParams.areacode);
		                }else {
			                gio('track', 'userRegisterEnterPortal_jcgj');
		                }
                    }
                    this.handleCreate = false
                    this.component.props.onRedirect(this.config.goAfterLogin)
                    //埋点
                    _hmt && _hmt.push(['_trackEvent', '系统管理', '企业注册', '立即体验'])
                }
            }
        }

        //TODO
        // const user = await this.webapi.user.create(form)
        // await this.webapi.sysOrgUser.create({ sysOrgDto: {userId: user.id ,orgId:10001}})

        // this.goOrgRegister(form);
    }

    pwdLevel = (pwd) => {
        let level = 0;
        let regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
        if ((/[0-9]/).test(pwd)) {
            level++
        }
        if ((/[a-zA-Z]/).test(pwd)) {
            level++
        }
        if (/[`~!@#$%^&*()_\-=+<>?:"{},.\/;'[\] ]/.test(pwd) || regCn.test(pwd)) {
            level++
        }
        return level
    }

    getBar = () => this.config.bar

    countDown = 60   //倒计时
    timer = null
    getCaptchaing = false
    getCaptcha = async () => {
        const captchaInput = document.querySelector('.captchaInput')
        if(!!captchaInput) {
            captchaInput.focus()
        }
        let mobile = this.metaAction.gf('data.form.mobile')
        mobile = string.trim(mobile)
        if (mobile && !(/^1[3|4|5|6|7|8|9][0-9]\d{8}$/.test(mobile))) {
            this.metaAction.sfs({ 'data.form.mobile': mobile, 'data.other.error.mobile': "请输入正确的手机号" })
            return false
        }
        if (this.getCaptchaing) return
        this.getCaptchaing = true
        this.metaAction.sf('data.timeStaus', false)
        let that = this
        this.timer = setInterval(function () {
            if (that.countDown == 0) {
                that.clearTimer(true, '重新获取')
                return
            }
            that.metaAction.sf('data.time', (--that.countDown) + 's')
        }, 1000)
        let params = {}
        params.mobile = this.metaAction.gf('data.form.mobile')
        //1: 注册 2:找回密码 3:修改手机号
        params.smsType = 1
        params.requestUrl = location.hostname
        if(/^127.|^172.|^192./.test(location.hostname)) {
            params.requestUrl = 'localhost'
        }
        const captcha = await this.webapi.captcha.fetch(params)
        if (captcha) {
            this.metaAction.sf('data.form.sign', captcha)
            this.metaAction.toast('success', `验证码已经发送到您的手机`)
        }
    }
    //清除定时器
    clearTimer = function (staus, remind) {
        this.metaAction.sf('data.timeStaus', true)
        this.metaAction.sf('data.time', remind)
        this.countDown = 60
        this.getCaptchaing = false
        clearInterval(this.timer)
    }

    fieldChange = async (fieldPath, value, operation) => {
        await this.check([{ path: fieldPath, value }], operation)
    }
    //返回上一步
    backLastStep = () => {
        let step = this.metaAction.gf('data.other.step')
        this.metaAction.sf('data.other.step', step - 1)
    }
    showAgreement = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '用户协议条款',
            width: 700,
            bodyStyle: { height: 400, overflow: 'auto' },
            okText: '同意',
            cancelText: '不同意',
            className: 'userProtocol',
            children: this.metaAction.loadApp('edfx-app-agreement', {
                store: this.component.props.store,
                initData: {
                    name: appBasicInfo.name,
                    companyName: appBasicInfo.companyName,
                    companyNameShort: appBasicInfo.companyNameShort 
                }
            })
        })

        this.metaAction.sf('data.form.agree', !!ret)
    }

    goOrgRegister = (user) => {
        if (this.component.props.onRedirect && this.config.goOrgRegister) {
            this.config.goOrgRegister.appName = 'edfx-app-orgregister?user=' + JSON.stringify(user)
            this.component.props.onRedirect(this.config.goOrgRegister)
        }
    }

    goLogin = () => {
        this.clearTimer(false, '获取验证码')
        let mobile = this.metaAction.gf('data.form.mobile')

        if (this.component.props.onRedirect && this.config.goLogin) {
            if (typeof mobile == 'string') {
                this.config.goLogin.appParams.mobile = mobile;
                this.config.goLogin.appName = 'edfx-app-login?mobile=' + mobile
            }

            this.component.props.onRedirect(this.config.goLogin)
        }
    }

    goForgot = () => {
        let mobile = this.metaAction.gf('data.form.mobile')
        if (this.component.props.onRedirect && this.config.goForgot) {
            if (!!mobile && typeof mobile == 'string') {
                this.config.goForgot.appParams.mobile = mobile;
                this.config.goForgot.appName = 'edfx-app-forgot-password?mobile=' + mobile
            }
            this.component.props.onRedirect(this.config.goForgot)
            //埋点
            _hmt && _hmt.push(['_trackEvent', '系统管理', '企业登录', '忘记密码'])
        }
    }

    goLanding = async () => {   //跳转着陆页
        if (location.href.indexOf(consts.DOMAIN_DEV_INNER) != -1 ||
			location.href.indexOf(consts.DOMAIN_DEV_OUTER) != -1 ||
			location.href.indexOf(consts.DOMAIN_LOCALHOST) != -1 ||
			location.href.indexOf(consts.DOMAIN_LOCALHOST_IP) != -1 ||
			location.href.indexOf(consts.DOMAIN_DEBUG_INNER) != -1 ||
			location.href.indexOf(consts.DOMAIN_DEBUG_OUTER) != -1) {
			window.location.href = consts.DOMAIN_GJ_DEV
		} else if (location.href.indexOf(consts.DOMAIN_DEMO) != -1) {
			window.location.href = consts.DOMAIN_GJ_DEMO
		} else if (location.href.indexOf(consts.DOMAIN_ONLINE) != -1) {
			window.location.href = consts.DOMAIN_GJ_ONLINE
		}
    }

    check = async (fieldPathAndValues, operation) => {
        if (!fieldPathAndValues)
            return

        let checkResults = []

        for (let o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == 'data.form.mobile') {
                Object.assign(r, await this.checkMobile(o.value, operation))
            } else if (o.path == 'data.form.password') {
                Object.assign(r, await this.checkPassword(o.value, operation))
            } else if (o.path == 'data.form.captcha') {
                Object.assign(r, await this.checkCaptcha(o.value, operation))
            } else if (o.path == 'data.form.org') {
                Object.assign(r, await this.checkOrg(o.value))
            } else if (o.path == 'data.form.vatTaxpayer') {
                Object.assign(r, await this.checkVatTaxpayer(o.value))
            } else if (o.path == 'data.form.enableDate') {
                Object.assign(r, await this.checkEnableDate(o.value))
            } else if (o.path == 'data.form.accountingStandard') {
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


    checkMobile = async (mobile, operation) => {
        var message
        mobile = string.trim(mobile)
        if (operation && operation == 'next') {
            if (!mobile)
                message = '请输入手机号'
            else if (mobile.length != 11)
                message = '请输入正确的手机号'
            else {
                let flag = await this.webapi.user.existsMobile(mobile)
                message = this.messageContent(flag)
            }
        } else {
            if (!mobile)
                message = '请输入手机号'
            else if (mobile.length == 1 && !(mobile == '1'))
                message = '请输入正确的手机号'
            else if (mobile.length > 1 && mobile.length < 11 && !/^1[3|4|5|6|7|8|9]/.test(mobile))
                message = '请输入正确的手机号'
            else if (mobile.length > 11) {
                message = '请输入正确的手机号'
            } else if (mobile.length == 11) {
                if (!/^1[3|4|5|6|7|8|9]/.test(mobile)) {
                    message = '请输入正确的手机号'
                    return { errorPath: 'data.other.error.mobile', message }
                }
                let flag = await this.webapi.user.existsMobile(mobile)
                message = this.messageContent(flag)
            }
        }
        return { errorPath: 'data.other.error.mobile', message }
    }
    messageContent = (flag) => {
        if (flag.errorCode == 1) {
            return undefined
        } else if (flag.errorCode == 2) {
            return (
                <div>
                    <span>{flag.errorMsg + '，'}</span>
                    <span className="explaiLink" style={{ color: '#333', textDecoration: 'underline', cursor: 'pointer' }} onClick={this.goLogin.bind(this)}>请登录</span>
                    <span> 或 </span>
                    <span className="explaiLink" style={{ color: '#333', textDecoration: 'underline', cursor: 'pointer' }} onClick={this.goForgot.bind(this)}>找回密码</span>
                </div>
            )
        } else if (flag.errorCode == 3) {
            return (
                <div>
                    <span>{flag.errorMsg + '，'}</span>
                    <span className="explaiLink" style={{ color: '#333', textDecoration: 'underline', cursor: 'pointer' }} onClick={this.goLogin.bind(this)}>请登录</span>
                    <span> 或 </span>
                    <span className="explaiLink" style={{ color: '#333', textDecoration: 'underline', cursor: 'pointer' }} onClick={this.goForgot.bind(this)}>找回密码</span>
                </div>
            )
        }
    }

    checkPassword = async (password) => {
        var message
        if (!password)
            message = '请输入密码'
        else if (!/(?=^.{6,20}$)((?=.*[A-Z]){1})((?=.*[a-z]){1})((?=.*[0-9]){1})/.test(password))
            message = '6-20位必须包含大写字母、小写字母和数字'
        return { errorPath: 'data.other.error.password', message }
    }

    checkCaptcha = async (captcha, operation) => {
        var message
        let sign = this.metaAction.gf('data.form.sign')
        let mobile = this.metaAction.gf('data.form.mobile')
        let params = {
            sign: sign,
            mobile: mobile,
            captcha: captcha
        }
        if (operation && operation == 'next') {
            if (!captcha)
                message = '请输入验证码'
            else if (!(await this.webapi.captcha.validate(params)))
                message = '验证码输入错误'
        }


        return { errorPath: 'data.other.error.captcha', message }
    }

    checkOrg = async (org) => {
        var message

        if (!org) {
            message = '请输入企业名称'
        } else if (org.length > 200) {
            message = '企业名称不要超过200个字符'
        }
        return { errorPath: 'data.other.error.org', message }
    }
    checkVatTaxpayer = async (vatTaxpayer) => {
        var message
        if (!vatTaxpayer) {
            message = '纳税人身份不能为空'
        }
        return { errorPath: 'data.other.error.vatTaxpayer', message }
    }
    checkEnableDate = async (enableDate) => {
        var message
        if (!enableDate) {
            message = '启用日期不能为空'
        }
        return { errorPath: 'data.other.error.enableDate', message }
    }
    checkAccountingStandards = async (accountingStandards) => {
        var message
        if (!accountingStandards) {
            message = '会计准则不能为空'
        }
        return { errorPath: 'data.other.error.accountingStandards', message }
    }
    //切换编辑状态
    changeDateState = () => {
        let state = this.metaAction.gf('data.other').toJS().editDate
        this.metaAction.sf('data.other.editDate', !state)
    }
    changeStandardState = () => {
        let state = this.metaAction.gf('data.other').toJS().editStandard
        this.metaAction.sf('data.other.editStandard', !state)
    }
    //检查是否要置灰下一步按钮
    checkNext = () => {
        let data = this.metaAction.gf('data').toJS()
        let step = this.metaAction.gf('data.other').toJS().step
        if (step == 1) {
            return !((data.form.mobile && !data.other.error.mobile) && (data.form.password && !data.other.error.password) && (data.form.captcha && !data.other.error.captcha) && data.form.agree)
        } else if (step == 2) {
            return !((data.form.org && !data.other.error.org) && (data.form.vatTaxpayer && !data.other.error.vatTaxpayer))
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
