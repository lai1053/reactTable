import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS } from 'immutable'
import moment from 'moment'
import config from './config'
import md5 from 'md5'
import { path, string } from 'edf-utils'

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
        //行业
        const res = await this.webapi.enumDetail.findByEnumId({ enumId: 700001 })
        //系统时间
        // const date = await this.webapi.enableDate.getServerDate()
        this.metaAction.sfs({
            'data.other.selectOption': fromJS(res),
            'data.form.select': res[0] ? res[0].id : ''
        })
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

    getLogo = () => this.config.logo

    getBar = () => this.config.bar

    goLogin = () => {
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

    goRegister = () => {
        if (this.component.props.onRedirect && this.config.goDzglRegister) {
            this.component.props.onRedirect(this.config.goDzglRegister)
        }
    }

    submitClick = async () => {
        if (this.handleCreate) return
        this.handleCreate = true
        const data = this.metaAction.gf('data').toJS(),
              form = data.form,
              other = data.other
        // if (!form.agree) {
        //     return this.metaAction.toast('warn', '请同意《用户协议条款》')
        // }
        if(other.choose == 2) {
            this.component.props.onRedirect({
                appName: 'ttk-dzgl-app-register',
                appParams: {}
            })
            return
        }
        const res = await this.check([{
            path: 'data.form.mobile',
            value: form.mobile
        }, {
            path: 'data.form.password',
            value: form.password
        }])
        if (!res) {
            this.handleCreate = false
            return false
        }
        if (res) {
            this.handleCreate = false
            if (other.choose == 1) {
                const result = await this.webapi.dzgl.login({mobile: form.mobile, clearText: Base64.encode(form.password), password: md5(form.password + '*the3Kingdom*')})
                if(result === true) {
                    sessionStorage['dzglMobile'] = form.mobile
                    sessionStorage['clearText'] = Base64.encode(form.password)
                    this.component.props.onRedirect({
                        appName: 'ttk-dzgl-app-register-organization',
                        appParams: {}
                    })
                }else {
                    this.metaAction.toast('error', '登陆失败')
                }
                return
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

    radioChange = (e) => {
        this.fieldChange("data.other.choose", e.target.value)
        if(e.target.value == 2){
            this.metaAction.sf('data.other.error', fromJS({mobile: undefined, password: undefined}))
        }
    }
    checkSingleFormItem = async (path, value) => {
        let obj
        const key = path.match(/\.(\w+)$/)[1]
        value = string.trim(value)
        switch (key) {
            case 'mobile':
                obj = await this.checkMobile(value)
                break
            case 'password':
                obj = await this.checkPassword(value)
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

    messageContent = (flag) => {
        if (flag == true) {
            return undefined
        } else {
            return (
                <div>
                    <span>{'该手机号已注册，'}</span>
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
            // else {
            //     let flag = await this.webapi.user.existsMobile(mobile)
            //     message = this.messageContent(flag)
            // }
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
