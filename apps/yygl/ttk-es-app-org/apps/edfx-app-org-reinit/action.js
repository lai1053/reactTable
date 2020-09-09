import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import md5 from 'md5'
import {LoadingMask} from 'edf-component'
import { Base64 } from 'edf-utils'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        this.injections = injections
        this.okDown = false
        injections.reduce('init')

        let origin = this.component.props.origin
        if(!!origin) {
            this.metaAction.sf('data.origin', origin)
        }

        const currentUser = this.getCurrentUser()
        if(!!currentUser && currentUser.mobile) {
            this.metaAction.sf('data.form.mobile', currentUser.mobile)
        }
        const currentOrg = this.getCurrentOrg()
        if(!!currentUser && currentUser.mobile) {
            this.metaAction.sf('data.orgName', currentOrg.name)
        }
    }

    getCurrentUser = () => this.metaAction.context.get('currentUser') || {}
    getCurrentOrg = () => this.metaAction.context.get('currentOrg') || {}

    countDown = 60   //倒计时
    timer = null
    getCaptchaing = false
    getCaptcha = async () => {
        const captchaInput = document.querySelector('.captchaInput')
        if(!!captchaInput) {
            captchaInput.focus()
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

    // onOk = async () => {
    //     if(this.okDown) return
    //     this.okDown = true
    //     let form = this.metaAction.gf('data.form').toJS()
    //     let password = ''
    //     let clearText = ''
    //     let flag = this.checkpassword(form.password)
    //     if(!flag) return
    //     if (form.password) {
    //         clearText = Base64.encode(form.password)
    //         password = md5(form.password + '*the3Kingdom*')
    //     }else {
	//         this.okDown = false
    //         return false
    //     }
    //     let res = await this.webapi.org.checkPassword({password, clearText})
    //     if(res) {
    //         LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
    //         let response = await this.webapi.org.reinit()
    //         this.okDown = false
    //         LoadingMask.hide()
    //         if(response !== true) {
    //             this.metaAction.toast('error', '重新初始化失败')
    //             return false
    //         }
    //         this.metaAction.toast('success', '重新初始化成功')
    //         //埋点
    //         _hmt && _hmt.push(['_trackEvent', '系统管理', '企业信息', '重新初始化'])
    //         return {canModify: true}
    //     }else {
    //         this.okDown = false
    //         this.metaAction.sf('data.error.password', '密码错误，请重新输入')
    //         return false
    //     }
    // }
    onOk = async () => {
        const step = this.metaAction.gf('data.step')
        if(step == 1) {
            const captcha = this.metaAction.gf('data.form.captcha')
            const flag = await this.checkCaptcha(captcha, 'next')
            if(!flag) return false
            this.metaAction.sf('data.step', 2)
            return false
        }else if(step == 2) {
            const origin = this.metaAction.gf('data.origin')
            if(origin == 'org') {
                LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
                let response = await this.webapi.org.reinit()
                this.okDown = false
                LoadingMask.hide()
                if(response !== true) {
                    this.metaAction.toast('error', '重新初始化失败')
                    return false
                }
                this.metaAction.toast('success', '重新初始化成功')
                //埋点
                _hmt && _hmt.push(['_trackEvent', '系统管理', '企业信息', '重新初始化'])
                return {canModify: true}
            }
        }
    }
    checkpassword = async (password) => {
        let message
        if (!password)
            message = '请输入密码'
        // else if(!/(?=^.{6,20}$)((?=.*[A-Z]){1})((?=.*[a-z]){1})((?=.*[0-9]){1})/.test(password))
        //     message = '6-20位必须包含大写字母、小写字母和数字'
        this.metaAction.sf('data.error.password', message)
        this.metaAction.sf('data.form.password', password)
        if(message) return false
    }
    checkCaptcha = async (captcha, operation) => {
        var message
        let sign = this.metaAction.gf('data.form.sign')
        let mobile = this.metaAction.gf('data.form.mobile')
        let params = {
            sign: sign,
            mobile: mobile,
            smsCode: captcha
        }
        if (operation && operation == 'next') {
            if (!captcha)
                message = '请输入验证码'
            else if (!(await this.webapi.captcha.validate(params)))
                message = '验证码输入错误'
        }

        this.metaAction.sf('data.other.error.captcha', message)
        return !!message ? false : true
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
