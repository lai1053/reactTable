import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS } from 'immutable'
import config from './config'
import md5 from 'md5'

import { Toast } from "edf-component";
import { Base64, path, string, environment } from 'edf-utils'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.handleCreate = false
        let appParams = this.component.props.appParams
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        let info = {}
        info.version = path.getVersion()
        injections.reduce('init', info)
        //注册机构状态
        if(appParams&&appParams.step&&appParams.mobile){
            this.metaAction.sfs({
                'data.other.step':appParams.step,
                'data.form.contactsPhone':appParams.mobile
            });
        }
        this.load()
    }

    onOk = async () => {
        return await this.save()
    }

    load = async () => {
        //行业
        const res = await this.webapi.enumDetail.findByEnumId({ enumId: 700001 })
        //系统时间
        // const date = await this.webapi.enableDate.getServerDate()
        this.metaAction.sfs({
            'data.other.selectOption': fromJS(res),
            'data.form.select': res[0] ? res[0].id : ''
        })
        console.log('yessss')
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

    openRuleContent = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '用户协议条款',
            width: 700,
            bodyStyle: { height: 400, overflow: 'auto' },
            okText: '同意',
            cancelText: '不同意',
            className: 'userProtocol',
            children: this.metaAction.loadApp('ttk-dzgl-app-agreement', {
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

    countdown = () => {
        this.countdownTimer = setInterval(() => {
            let time = parseInt(this.metaAction.gf('data.time'))
            if (isNaN(time)) {
                time = 60
            }
            time--
            if (time < 0) {
                clearInterval(this.countdownTimer)
                this.metaAction.sf('data.timeStaus', true)
                this.metaAction.sf('data.time', '重新获取')
            } else {
                this.metaAction.sf('data.time', `${time}s`)
            }

        }, 1000)
    }

    getCaptcha = async () => {
        console.log('获取验证码')
        document.querySelector('.captchaInput input').focus()
        let mobile = this.metaAction.gf('data.form.mobile')
        mobile = string.trim(mobile)
        if (mobile && !(/^1[3|4|5|6|7|8|9][0-9]\d{8}$/.test(mobile))) {
            this.metaAction.sfs({ 'data.form.mobile': mobile, 'data.other.error.mobile': "请输入正确的手机号" })
            return false
        }
        if (this.getCaptchaing) return

        this.metaAction.sf('data.timeStaus', false)
        this.countdown()
        let params = {}
        params.mobile = this.metaAction.gf('data.form.mobile')
        //1: 注册 2:找回密码 3:修改手机号
        params.smsType = 1
        params.requestUrl = location.hostname
        const captcha = await this.webapi.captcha.fetch(params)
        if (captcha) {
            this.metaAction.sf('data.form.sign', captcha)
            this.metaAction.toast('success', `验证码已经发送到您的手机`)
        }
    }

    getLogo = () => this.config.logo

    getBar = () => this.config.bar

    goLogin = () => {
        // this.clearTimer(false, '获取验证码')
        let mobile = this.metaAction.gf('data.form.mobile')

        if (this.component.props.onRedirect && this.config.goLogin) {
            this.component.props.onRedirect(this.config.goLogin)
        }
    }
    goReLogin = () => {
        if (this.component.props.onRedirect && this.config.registerChoose) {
            this.component.props.onRedirect(this.config.registerChoose)
        }
    }

    goForgot = () => {
        let mobile = this.metaAction.gf('data.form.mobile')
        if (this.component.props.onRedirect && this.config.goForgot) {
            if (!!mobile && typeof mobile == 'string') {
                this.config.goForgot.appParams.mobile = mobile;
                this.config.goForgot.appName = 'ttk-dzgl-app-forget-password?mobile=' + mobile
            }
            this.component.props.onRedirect(this.config.goForgot)
        }
    }
    //用户登录
    login = async () => {
        //this.metaAction.toast('error','不建议手机端登录，请前往PC端','close')
        let forms = this.metaAction.gf('data.form').toJS()
        const {  userMobile, userPassword } = forms
        let form={
            mobile:userMobile,
            password:userPassword
        }
        let other = this.metaAction.gf('data.other').toJS()
        //登录前校验
        const basicInfo = await this.loginCheck([{
            path: 'data.form.userMobile', value: form.mobile
        }, {
            path: 'data.form.userPassword', value: form.password
        }], 'login')
        if (!basicInfo) return

        let props = this.component.props
        if (props != null && props.appParams != null) {
            let appkey = props.appParams.appkey
            if (appkey != null) {
                form.appKey = appkey;
            }
        }
        if (other.userInput) {
            if (form.password) {
                form.clearText = Base64.encode(form.password)
                form.password = md5(form.password + '*the3Kingdom*')

            }
        }

        if (form) {
            form.requestUrl = location.hostname
            if(/^127.|^192./.test(location.hostname)) {
                form.requestUrl = 'localhost'
            }
        }
        const response = await this.webapi.user.login(Object.assign({ isReturnValue: true }, form))
        //登录新代账管理端存储管理端token
        if(response.result && response.value.token) {
            if(response.value.token.appId == 114 && response.value.token.orgType == 1) {
                sessionStorage['_accessGlToken'] = response.token
            }
            sessionStorage['dzglMobile'] = form.mobile
            sessionStorage['clearText'] = form.clearText
            this.metaAction.sf('data.form.contactsName', response.value.nickname)
            this.metaAction.sf('data.form.contactsPhone', form.mobile)
            this.metaAction.sf('data.other.step',2)
            return
        }
        if (!response.result) {
            if(response.error.code == "50136"){
                let clearText = form.clearText
                if (other.userInput) {
                    if (form.password) {
                        clearText = Base64.encode(form.password)
                    }
                }
                sessionStorage['dzglMobile'] = form.mobile
                sessionStorage['clearText'] = form.clearText
                this.metaAction.sf('data.form.contactsPhone', form.mobile)
                this.metaAction.sf('data.other.step',2)
                return
            }
            let errorCode = ["50107", "50111", "50112", "50109", "50133", "50110"]
            if (errorCode.indexOf(response.error.code) > -1) {
                this.metaAction.sf('data.other.error.userPassword', response.error.message)
                // this.metaAction.sf('data.other.error.userPassword','账号密码错误')
                this.metaAction.toast('error', response.error.message)
            }else {
                this.metaAction.sf('data.other.error.userPassword', '密码不正确,请重新输入!')
                this.metaAction.toast('error', '密码不正确,请重新输入!')
            }
            return
        }
    }
    //设置地址
    setAddress = (e) => {
        let address = e.toJS()
        this.metaAction.sf('data.form.registeredProvincial', address.provinces)
        this.metaAction.sf('data.form.registeredCity', address.citys)
        this.metaAction.sf('data.form.registeredCounty', address.districts)
        this.metaAction.sf('data.form.registeredAddress', address.text)
    }
    //机构注册
    registerOrg = async () => {
        if (this.handleCreate) return
        this.handleCreate = true
        const form = this.metaAction.gf('data.form').toJS()
        if (!form.agree) {
            return this.metaAction.toast('warn', '请同意《服务协议》')
        }
        LoadingMask.show({
            wrapperClassName: 'dljgRegister'
        })
        const res = await this.check([{
            path: 'data.form.contactsName',
            value: form.contactsName
        }, {
            path: 'data.form.contactsPhone',
            value: form.contactsPhone
        }, {
            path: 'data.form.componyAddress',
            value: form.registeredCounty
        }, {
            path: 'data.form.rgComponyName',
            value: form.rgComponyName
        }, {
            path: 'data.form.componyAddressInfoForm',
            value: form.componyAddressInfoForm
        }])
        if (!res) {
            LoadingMask.hide()
            this.handleCreate = false
            return false
        }
        if (res) {
            const { contactsName, contactsPhone, componyAddress, rgComponyName, componyAddressInfoForm } = form
            let request = {
                user: {
                    mobile: sessionStorage['dzglMobile'],
                    clearText: sessionStorage['clearText'],
                    sysOrg: {
                        name: rgComponyName,
                        xzqhdm: form.registeredCounty,
                        contactsAddress: componyAddressInfoForm,
                        contactsName: contactsName,
                        contactsPhone: contactsPhone,
                    },
                    requestUrl: location.hostname,
                }
            }
            const response = await this.webapi.user.createOrg(request)
            LoadingMask.hide()
            this.handleCreate = false
            if (response && response.value.token) {
                this.metaAction.toast('success', '注册成功，请登录系统')
                this.metaAction.sf('data.other.step',3)

            } else {
                if (response.error && response.error.message){
                     Toast.error(response.error.message)
                }else{
                    this.metaAction.toast('error', '注册失败')
                }
            }
        }
    }
    // 账号注册
    submitClick = async () => {
        if (this.handleCreate) return
        this.handleCreate = true
        const form = this.metaAction.gf('data.form').toJS()
        if (!form.agree) {
            return this.metaAction.toast('warn', '请同意《服务协议》')
        }
        const res = await this.check([{
            path: 'data.form.name',
            value: form.name
        }, {
            path: 'data.form.mobile',
            value: form.mobile
        }, {
            path: 'data.form.mail',
            value: form.mail
        }, {
            path: 'data.form.captcha',
            value: form.captcha
        }, {
            path: 'data.form.password',
            value: form.password
        }, {
            path: 'data.form.passwordAgain',
            value: form.passwordAgain
        }])
        if (!res) {
            this.handleCreate = false
            return false
        }
        if (res) {
            const { name, mail, componyname, select, mobile, captcha, password, sign } = form
            let request = {
                user: {
                    nickname: name,
                    mobile,
                    email: mail,
                    password: md5(password + '*the3Kingdom*'),
                    clearText: Base64.encode(password),
                    requestUrl: location.hostname,
                    passwordStrength :this.pwdLevel(password),
                    sysOrg: {
                        name: componyname
                    }
                },
                captcha,
                sign
            }
            const response = await this.webapi.user.create(request)
            this.handleCreate = false
            if (!!response) {
                sessionStorage['dzglMobile'] = request.user.mobile
                sessionStorage['clearText'] = request.user.clearText
                this.metaAction.sf('data.form.contactsPhone', form.mobile)
                this.metaAction.sf('data.form.contactsName',name)
                this.metaAction.sf('data.other.step',2)
            } else {
                if (response.error && response.error.message) Toast.error(response.error.message)
            }
        }
    }

    loginCheck = async (fieldPathAndValues, operate) => {
        if (!fieldPathAndValues)
            return

        var checkResults = []

        for (var o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == 'data.form.userMobile') {
                Object.assign(r, await this.checkMobile(o.value, operate))
            }
            else if (o.path == 'data.form.userPassword') {
                Object.assign(r, await this.checkUserPassword(o.value))
            }
            checkResults.push(r)
        }

        var json = {}
        var hasError = true
        checkResults.forEach(o => {
            json[o.errorPath] = o.message
            if (o.message)
                hasError = false
        })

        this.metaAction.sfs(json)

        return hasError
    }
    check = async (form) => {
        const allPro = form.map(item => {
            return this.checkSingleFormItem(item.path, item.value)
        })
        const res = await Promise.all(allPro)
        let flag = res.every(item => item.message == undefined)
        return flag
    }

    fieldChange = (path, value, type) => {
        this.metaAction.sf(path, value)
        if (type == 'next') {
            this.checkSingleFormItem(path, value)
        }else if(type == 'login'){
            this.checkSingleFormItem(path, value,'login')
        }
    }


    checkSingleFormItem = async (path, value,type) => {
        let obj
        const key = path.match(/\.(\w+)$/)[1]
        if(typeof value == 'string')value = string.trim(value)
        switch (key) {
            case 'contactsName':
            case 'name':
                obj = await this.checkSimple(key, value, '请输入联系人名称')
                if (value.length > 200) {
                    obj = {
                        errorPath: `data.other.error.${key}`, message: `联系人最大长度为200个字符`
                    }
                }
                break
            case 'mail':
                obj = await this.checkMail(value)
                break
            case 'mobile':
                obj = await this.checkMobile(value,key)
                break
            case 'userMobile':
                obj = await this.checkMobile(value,key)
                break
            case 'contactsPhone':
                obj = await this.checkMobile(value,key)
                break
            case 'captcha':
                obj = await this.checkCaptcha(value)
                break
            case 'password':
                obj = await this.checkPassword(value)
                break;
            case 'userPassword':
                obj = await this.checkUserPassword(value)
                break;
            case 'passwordAgain':
                obj = await this.checkPasswordAgain(value)
                break;
            case 'componyAddressInfoForm':
                // obj = await this.checkSimple(key, value, '请输入机构的详细地址')
                if (value.length > 200) {
                    obj = {
                        errorPath: `data.other.error.${key}`, message: `详细地址最大长度为200个字符`
                    }
                }else{
                    obj = {
                        errorPath: `data.other.error.${key}`, message: undefined
                    }
                }
                break
            case 'rgComponyName':
                obj = await this.checkSimple(key, value, '请输入机构名称')
                if (value.length > 200) {
                    obj = {
                        errorPath: `data.other.error.${key}`, message: `机构名称最大长度为200个字符`
                    }
                }else if( value.length > 0) {
                    let arg = {
                        mobile: sessionStorage['dzglMobile'],
                        sysOrg:{
                            name: value
                        }

                    }
                    const flag = await this.webapi.user.cheackDljgIsExist(arg)
                    // debugger
                    const message = this.orgMessageContent(!flag)
                    obj = {
                        errorPath: `data.other.error.${key}`, message
                    }
                }
                break;
            case 'componyAddress':
                // obj = await this.checkSimple(key, value, '请选择所属区域')
                if(!value){
                    obj = {
                        errorPath: `data.other.error.${key}`, message: `请选择所属区域`
                    }
                }else {
                    obj = {
                        errorPath: `data.other.error.${key}`, message: undefined
                    }
                }
                break;
            default:
                break
        }
        if (obj && obj instanceof Promise) {
            obj.then(res => {
                this.metaAction.sf(res.errorPath, res.message)
            })
        } else if (obj) {
            this.metaAction.sf(obj.errorPath, obj.message)
            return obj
        }

    }

    checkCaptcha = async (value) => {
        var message
        value = string.trim(value)
        const mobile = this.metaAction.gf('data.form.mobile')
        if (!value) {
            return {
                errorPath: `data.other.error.captcha`, message: '请输入验证码'
            }
        }
        const sign = this.metaAction.gf('data.form.sign')
        const res = await this.webapi.captcha.validate({
            captcha: value,
            mobile,
            sign
        })
        if (!res) {
            return {
                errorPath: `data.other.error.captcha`, message: '验证码输入错误'
            }
        } else {
            return {
                errorPath: `data.other.error.captcha`, message: undefined
            }
        }

    }

    checkSimple = async (key, value, message) => {
        value = string.trim(value)
        if (!value) {
            return { errorPath: `data.other.error.${key}`, message}
        } else {
            return {errorPath: `data.other.error.${key}`, message: undefined }
        }
    }

    checkMail = async (mail) => {
        var message
        mail = string.trim(mail)
        if (!mail) {
            message = '请输入邮箱'
        }
        else if (!/^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/.test(mail)) {
            message = '请输入正确的邮箱'
        }
        return { errorPath: 'data.other.error.mail', message }
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
    orgMessageContent = (flag) => {
        if (flag == true) {
            return undefined
        } else {
            return (
                <div>
                    <span>{'已存在代理机构，'}</span>
                    <span className="explaiLink" style={{ color: '#333', textDecoration: 'underline', cursor: 'pointer' }} onClick={this.goLogin.bind(this)}>请登录</span>
                </div>
            )
        }
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
        }else if(operation && operation == 'userMobile'){
            if (!mobile)
                message = '请输入手机号'
            else if (mobile.length != 11)
                message = '请输入正确的手机号'
            else {
                let flag = await this.webapi.user.existsMobileForLogin(mobile)
                !flag && (message = '该手机号未注册，请重新输入')
            }
        } else {
            if (!mobile)
                message = '请输入手机号'
            else if (mobile.length == 1)
                message = '请输入正确的手机号'
            else if (mobile.length > 1 && mobile.length < 11 && !/^1[3|4|5|6|7|8|9]/.test(mobile))
                message = '请输入正确的手机号'
            else if (mobile.length > 11) {
                message = '请输入正确的手机号'
            } else if (mobile.length == 11) {
                if (!/^1[3|4|5|6|7|8|9]/.test(mobile)) {
                    message = '请输入正确的手机号'
                    return { errorPath: `data.other.error.${operation}`, message }
                }
                if(operation && operation == 'mobile'){
                    let flag = await this.webapi.user.existsMobile(mobile)
                    message = this.messageContent(flag)
                }
            }
        }
        return { errorPath: `data.other.error.${operation}`, message }
    }

    checkUserPassword = async (password) => {
        var message
        if (!password)
            message = '请输入密码'
        return { errorPath: 'data.other.error.userPassword', message }
    }

    checkPassword = async (password) => {
        var message
        if (!password)
            message = '请输入密码'
        else if (!/(?=^.{6,20}$)((?=.*[A-Z]){1})((?=.*[a-z]){1})((?=.*[0-9]){1})/.test(password))
            message = '6-20位必须包含大写字母、小写字母和数字'
        return { errorPath: 'data.other.error.password', message }
    }
    checkPasswordAgain = async (password) => {
        let psw = this.metaAction.gf('data.form.password')
        var message
        if (!password)
            message = '请再次输入密码'
        else if (psw != password)
            message = '两次密码输入不一致，请重新输入'
        return { errorPath: 'data.other.error.passwordAgain', message }
    }
    //检查是否要置灰登录
    checkDisabled = (type) => {
        let data = this.metaAction.gf('data').toJS()
        switch (type) {
            case 'login':
                return !((data.form.userMobile && !data.other.error.userMobile) && (data.form.userPassword && !data.other.error.userPassword))
                break;
            case 'register':
                return !((data.form.userAgree&&data.form.passwordAgain && !data.other.error.passwordAgain)&&(data.form.password && !data.other.error.password)&&(data.form.mail && !data.other.error.mail)&&(data.form.captcha && !data.other.error.captcha)&&(data.form.name && !data.other.error.name)&&(data.form.name && !data.other.error.name) && (data.form.mobile && !data.other.error.mobile))
                break;
            case 'registerOrg':
                return !((data.form.agree&&data.form.rgComponyName && !data.other.error.rgComponyName)&& (data.form.registeredCounty && !data.other.error.registeredCounty)&&(data.form.contactsName && !data.other.error.contactsName) && (data.form.contactsPhone && !data.other.error.contactsPhone))
                break;
            default:
                break
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
