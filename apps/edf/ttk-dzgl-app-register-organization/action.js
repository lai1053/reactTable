import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { path, string } from 'edf-utils'
import { Toast, LoadingMask } from "edf-component"

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
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        let info = {}
        info.version = path.getVersion()
        injections.reduce('init', info)
        this.load()
    }

    onOk = async () => {
        return await this.save()
    }

    load = async () => {
        // //行业
        // const res = await this.webapi.enumDetail.findByEnumId({ enumId: 700001 })
        // //系统时间
        // // const date = await this.webapi.enableDate.getServerDate()
        // this.metaAction.sfs({
        //     'data.other.selectOption': fromJS(res),
        //     'data.form.select': res[0] ? res[0].id : ''
        // })
        // console.log('yessss')
    }

    setField = (path, value) => {

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
    //设置地址
    setAddress = (e) => {
        let address = e.toJS()
        this.metaAction.sf('data.form.registeredProvincial', address.provinces)
        this.metaAction.sf('data.form.registeredCity', address.citys)
        this.metaAction.sf('data.form.registeredCounty', address.districts)
        this.metaAction.sf('data.form.registeredAddress', address.text)
    }

    submitClick = async () => {
        if (this.handleCreate) return
        this.handleCreate = true
        const form = this.metaAction.gf('data.form').toJS()
        if (!form.agree) {
            return this.metaAction.toast('warn', '请同意《用户协议条款》')
        }
        LoadingMask.show({
            wrapperClassName: 'dljgRegister'
        })
        const res = await this.check([{
            path: 'data.form.name',
            value: form.name
        }, {
            path: 'data.form.mobile',
            value: form.mobile
        }, {
            path: 'data.form.componyAddress',
            value: form.registeredCounty
        }, {
            path: 'data.form.componyName',
            value: form.componyName
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
            const { name, mobile, componyAddress, componyName, componyAddressInfoForm } = form
            let request = {
                user: {
                    mobile: sessionStorage['dzglMobile'],
                    clearText: sessionStorage['clearText'],
                    sysOrg: {
                        name: componyName,
                        xzqhdm: form.registeredCounty,
                        contactsAddress: componyAddressInfoForm,
                        contactsName: name,
                        contactsPhone: mobile,
                    },
                    requestUrl: location.hostname,
                }
            }
            const response = await this.webapi.user.create(request)
            LoadingMask.hide()
            this.handleCreate = false
            if (response && response.result) {
                this.metaAction.toast('success', '注册成功，请登录系统')
                if (this.component.props.onRedirect && this.config.goLogin) {
                    this.component.props.onRedirect(this.config.goLogin)
                }
            } else {
                if (response.error && response.error.message) Toast.error(response.error.message)
            }
        }
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
        }
    }


    checkSingleFormItem = async (path, value) => {
        let obj
        const key = path.match(/\.(\w+)$/)[1]
        if(typeof value == 'string')value = string.trim(value)
        switch (key) {
            case 'name':
                obj = await this.checkSimple(key, value, '请输入联系人名称')
                if (value.length > 200) {
                    obj = {
                        errorPath: `data.other.error.${key}`, message: `联系人最大长度为200个字符`
                    }
                }
                break
            case 'componyAddressInfoForm':
                obj = await this.checkSimple(key, value, '请输入机构的详细地址')
                if (value.length > 200) {
                    obj = {
                        errorPath: `data.other.error.${key}`, message: `详细地址最大长度为200个字符`
                    }
                }
                break
            case 'componyName':
                obj = await this.checkSimple(key, value, '请输入机构名称')
                if (value.length > 200) {
                    obj = {
                        errorPath: `data.other.error.${key}`, message: `机构名称最大长度为200个字符`
                    }
                }else {
                    let arg = {
                        mobile: sessionStorage['dzglMobile'],
                        sysOrg:{
                            name: value
                        }

                    }
                    const flag = await this.webapi.user.cheackDljgIsExist(arg)
                    debugger
                    const message = this.messageContent(!flag)
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
            case 'mobile':
                obj = await this.checkMobile(value)
                break
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

    checkSimple = async (path, value, message) => {
        value = string.trim(value)
        if (!value) {
            return {
                errorPath: `data.other.error.${path}`, message
            }
        } else {
            return {
                errorPath: `data.other.error.${path}`, message: undefined
            }
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
                // let flag = await this.webapi.user.existsMobile(mobile)
                // message = this.messageContent(flag)
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
                // let flag = await this.webapi.user.existsMobile(mobile)
                // message = this.messageContent(flag)
            }
        }
        return { errorPath: 'data.other.error.mobile', message }
    }

    checkPassword = async (password) => {
        var message
        if (!password)
            message = '请输入密码'
        else if (!/(?=^.{6,20}$)((?=.*[A-Z]){1})((?=.*[a-z]){1})((?=.*[0-9]){1})/.test(password))
            message = '6-20位必须包含大写字母、小写字母和数字'
        return { errorPath: 'data.other.error.password', message }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
