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
    }
    onOk = async () => {
        if(this.okDown) return
        this.okDown = true
        let form = this.metaAction.gf('data.form').toJS()
        let password = ''
        let clearText = ''
        let flag = this.checkpassword(form.password)
        if(!flag) return
        if (form.password) {
            clearText = Base64.encode(form.password)
            password = md5(form.password + '*the3Kingdom*')
        }else {
	        this.okDown = false
            return false
        }
        let res = await this.webapi.periodBegin.checkPassword({password, clearText})
        if(res){
            LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
            let response = await this.webapi.periodBegin.reInitPeriodBegin({})
            this.okDown = false
            LoadingMask.hide()

            this.metaAction.toast('success', '重新初始化成功')
            return true
        }else{
            this.okDown = false
            this.metaAction.sf('data.error.password', '密码错误，请重新输入')
            return false
        }
        // if(password == sessionStorage.getItem('password')) {
        //     LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
        //     let response = await this.webapi.periodBegin.reInitPeriodBegin({})
        //     this.okDown = false
        //     LoadingMask.hide()

        //     this.metaAction.toast('success', '重新初始化成功')
        //     return true
        // }else {
        //     this.okDown = false
        //     this.metaAction.sf('data.error.password', '密码错误，请重新输入')
        //     return false
        // }
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
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
