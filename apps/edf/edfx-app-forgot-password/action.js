import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'
import md5 from 'md5'
import { Base64,path } from 'edf-utils'
import { consts } from 'edf-consts'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({component, injections}) => {
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        let info = {}
        info.version = path.getVersion()
        if(this.component.props.appParams && this.component.props.appParams.mobile) {
            info.mobile = this.component.props.appParams.mobile
        }
        injections.reduce('init',info)
    }


    onOk = async () => {
        return await this.save()
    }

    next = async () => {
        const form = this.metaAction.gf('data.form').toJS()
        const ok = await this.check([{
            path: 'data.form.mobile', value: form.mobile
        }, {
            path: 'data.form.captcha', value: form.captcha
        }], 'next')

        if (!ok) return

        this.clearTimer(false, '获取验证码')

        this.metaAction.sf('data.other.step', 2)
    }

    prev = async () => {
        this.metaAction.sf('data.other.step', 1)
    }

    modify = async () => {
        const form = this.metaAction.gf('data.form').toJS()
        const ok = await this.check([{
            path: 'data.form.mobile', value: form.mobile
        }, {
            path: 'data.form.captcha', value: form.captcha
        }, {
            path: 'data.form.password', value: form.password
        }, {
            path: 'data.form.confirmPassword', value: form.confirmPassword
        }],'next')

        if (!ok) return

        this.clearTimer(false, '获取验证码')

        let password = form.password
        let passwordStrength = this.pwdLevel(password)
        let bkpwd = form.password
        form.password = md5(form.password + '*the3Kingdom*')

        let response = await this.webapi.user.resetPassword({
            mobile: form.mobile,
            password: form.password,
            passwordStrength: passwordStrength,
            clearText: Base64.encode(bkpwd),
            captcha: form.captcha,
            isReturnValue:true
        })
        if (response && response.error) {
            this.metaAction.toast('error', response.error.message);
            this.metaAction.sf('data.other.error.captcha', '验证码输入错误')
		} else {
            this.metaAction.toast('success', `重置密码成功`)
            this.metaAction.sf('data.other.step', 3)
            this.countFive()
		}
    }
    reLoginTime = null
    countFive = () => {
        let t = 5
        this.reLoginTimer = setInterval(() => {
            t--
            this.metaAction.sf('data.reLoginTime', t)
            if(t == 0) {
                clearInterval(this.reLoginTimer)
                this.goLogin()
            }
        }, 1000)
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

    countDown = 60   //倒计时
    timer = null
    getCaptchaing = false
    getCaptcha = async () => {
        const captchaInput = document.querySelector('.captchaInput')
        if(!!captchaInput) {
            captchaInput.focus()
        }
        const mobile = this.metaAction.gf('data.form.mobile')
        if(mobile && !(/^1[3|4|5|6|7|8|9][0-9]\d{8}$/.test(mobile))){
            this.metaAction.sfs({'data.form.mobile': mobile, 'data.other.error.mobile': "请输入正确的手机号"})
            return false
        }
        if(this.getCaptchaing) return
        this.getCaptchaing = true
        this.metaAction.sf('data.timeStaus',false)
        let that = this
        this.timer = setInterval(function() {
            if(that.countDown == 0) {
                that.clearTimer(true, '重新获取')
                return
            }
            that.metaAction.sf('data.time', (--that.countDown)+'s')
        }, 1000)
        let params = {}
        params.mobile = this.metaAction.gf('data.form.mobile')
        //1: 注册 2:找回密码 3:修改手机号
        params.smsType = 2
        params.requestUrl = location.hostname
        if(/^127.|^172.|^192./.test(location.hostname)) {
            params.requestUrl = 'localhost'
        }
        const captcha = await this.webapi.captcha.fetch(params)
        if(captcha) {
            this.metaAction.sf('data.form.sign', captcha)
            this.metaAction.toast('success', `验证码已经发送到您的手机`)
        }
    }
    //清除定时器
    clearTimer = function(staus, remind) {
        this.metaAction.sf('data.timeStaus',true)
        this.metaAction.sf('data.time', remind)
        this.countDown = 60
        this.getCaptchaing = false
        clearInterval(this.timer)
    }

    fieldChange = async (fieldPath, value, operate) => {
        this.metaAction.sf(fieldPath, value)
        await this.check([{path: fieldPath, value}], operate)
    }

    goLogin = () => {
        clearInterval(this.reLoginTime)
        this.clearTimer(false, '获取验证码')
        if (this.component.props.onRedirect && this.config.goLogin) {
            this.component.props.onRedirect(this.config.goLogin)
        }
    }

    check = async (fieldPathAndValues, operate) => {
        if (!fieldPathAndValues)
            return

        var checkResults = []

        for (var o of fieldPathAndValues) {
            let r = {...o}
            if (o.path == 'data.form.mobile') {
                Object.assign(r, await this.checkMobile(o.value, operate))
            }
            else if (o.path == 'data.form.captcha') {
                Object.assign(r, await this.checkCaptcha(o.value))
            }
            else if (o.path == 'data.form.password') {
                Object.assign(r, await this.checkPassword(o.value))
                const confirmPassword = this.metaAction.gf('data.form.confirmPassword')
                if (confirmPassword)
                    checkResults.push(await this.checkConfirmPassword(confirmPassword, o.value))
            }
            else if (o.path == 'data.form.confirmPassword') {
                Object.assign(r, await this.checkConfirmPassword(o.value, this.metaAction.gf('data.form.password'), action))
            }

            checkResults.push(r)

        }

        var json = {}
        var hasError = true
        checkResults.forEach(o => {
            // json[o.path] = o.value
            json[o.errorPath] = o.message
            if (o.message)
                hasError = false
        })
        this.metaAction.sfs(json)
        return hasError
    }


    checkMobile = async (mobile, operate) => {
        var message
        if (operate && operate == 'next') {
            if (!mobile)
                message = '请输入手机号'
            else if (mobile.length != 11)
                message = '请输入正确的手机号'
            else {
                let flag = await this.webapi.user.existsMobile(mobile)
                !flag && (message = '该手机号未注册，请重新输入')
            }
        }else {
            if (!mobile)
                message = '请输入手机号'
            else if (mobile.length == 1 && !(mobile == '1'))
                message = '请输入正确的手机号'
            else if (mobile.length > 1 && mobile.length < 11 && !/^1[3|4|5|6|7|8|9]/.test(mobile))
                message = '请输入正确的手机号'
            else if (mobile.length > 11) {
                message = '请输入正确的手机号'
            } else if (mobile.length == 11) {
                if(!/^1[3|4|5|6|7|8|9]/.test(mobile)) {
                    message = '请输入正确的手机号'
                    return { errorPath: 'data.other.error.mobile', message }
                }
                let flag = await this.webapi.user.existsMobile(mobile)
                !flag && (message = '该手机号未注册，请重新输入')
            }
        }

        return {errorPath: 'data.other.error.mobile', message}
    }

    checkCaptcha = async (captcha) => {
        var message
        let sign = this.metaAction.gf('data.form.sign')
        let mobile = this.metaAction.gf('data.form.mobile')
        let params = {
            sign: sign,
            mobile: mobile,
            captcha: captcha
        }

        if (!captcha)
            message = '请输入验证码'
        else if (!(await this.webapi.captcha.validate(params)))
            message = '验证码输入错误'

        return {errorPath: 'data.other.error.captcha', message}
    }

    checkPassword = async (password) => {
        var message
        if (!password)
            message = '请录入密码'
        else if(!/(?=^.{6,20}$)((?=.*[A-Z]){1})((?=.*[a-z]){1})((?=.*[0-9]){1})/.test(password))
            message = '6-20位必须包含大写字母、小写字母和数字'
        return {errorPath: 'data.other.error.password', message}
    }

    checkConfirmPassword = async (confirmPassword, password) => {
        var message
        if (!confirmPassword)
            message = '请再次输入新密码'
        else if (password != confirmPassword)
            message = '两次密码输入不一致，请确认'
        else if(!/(?=^.{6,20}$)((?=.*[A-Z]){1})((?=.*[a-z]){1})((?=.*[0-9]){1})/.test(confirmPassword))
            message = '6-20位必须包含大写字母、小写字母和数字'
        return {errorPath: 'data.other.error.confirmPassword', message}
    }

    checkNext = () => {
        let data = this.metaAction.gf('data').toJS()
        let step = this.metaAction.gf('data.other').toJS().step
        if(step == 1) {
            return !((data.form.password && !data.other.error.password) && (data.form.confirmPassword && !data.other.error.confirmPassword)&&(data.form.mobile && !data.other.error.mobile) && (data.form.captcha && !data.other.error.captcha))
        }else if(step == 2) {
            return !((data.form.password && !data.other.error.password) && (data.form.confirmPassword && !data.other.error.confirmPassword))
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
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}

    metaAction.config({metaHandlers: ret})

    return ret
}
