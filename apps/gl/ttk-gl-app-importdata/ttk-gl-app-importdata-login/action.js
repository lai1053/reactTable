import React from 'react'
import ReactDOM from 'react-dom'
import { Spin } from 'antd'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import md5 from 'md5'
import {Carousel, Toast} from 'edf-component'
import { Base64, path, string, environment } from 'edf-utils'
import { consts } from 'edf-consts'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = async ({ component, injections }) => {
        this.component = component
        this.injections = injections
        let props = this.component.props
        //删除打点存储信息
        let info = { mobile: '', password: '', remember: false }
        injections.reduce('init', info)
        this.load()
        //绑定回车事件
        this.bindEnter()
    }
    load= async () => {
        let props = this.component.props
        //删除打点存储信息
        delete sessionStorage['jchlRecord']
        let info = { mobile: '', password: '', remember: false }
        let currentTimestamp = (new Date()).getTime()
        if (props.appParams && props.appParams.mobile) {
            info.mobile = props.appParams.mobile
        } else {
            if (currentTimestamp < localStorage.remember&&localStorage['importdatamobile']) {
                info.remember = true
                info.mobile = localStorage['importdatamobile']
                info.password = localStorage['importdatapassword']
                info.selectTimeTitle = localStorage['importdataselectTimeTitle']
                info.enterprise = localStorage['importdataenterprise']
            } else {
                localStorage.removeItem('importdatamobile')
                localStorage.removeItem('importdatapassword')
                localStorage.removeItem('importdataselectTimeTitle')
                localStorage.removeItem('importdataenterprise')
            }
        }
        let querySofttype=await this.webapi.importapi.botImpInit()
        this.injections.reduce('load', info,querySofttype.softList)   
    }
    bindEnter = () => {
        let that = this
        document.onkeydown = function (e) {
            let keyCode = e.keyCode
            if (keyCode !== 13) return
            let form = that.metaAction.gf('data.form').toJS()
            that.fieldChange('data.form.mobile', form.mobile)
            that.fieldChange('data.form.password', form.password)

            that.login()
        }
    }
   
    login = async () => {
        //this.metaAction.toast('error','不建议手机端登录，请前往PC端','close')
        let form = this.metaAction.gf('data.form').toJS()
        let other = this.metaAction.gf('data.other').toJS()
        //登录前校验
        const basicInfo = await this.check([{
            path: 'data.form.mobile', value: form.mobile
        }, {
            path: 'data.form.password', value: form.password
        }], 'login')
        if (!basicInfo) return
        //判断是否保存登录信息
        if (form.remember) {
            let time = (new Date()).getTime() + 7 * 24 * 60 * 60 * 1000
            localStorage.remember = time
            localStorage['importdatamobile'] = form.mobile
            localStorage['importdatapassword'] = form.password
            localStorage['importdataselectTimeTitle'] = form.selectTimeTitle
            localStorage['importdataenterprise'] = form.enterprise
        } else {
            localStorage.removeItem('importdatamobile')
            localStorage.removeItem('importdatapassword')
            localStorage.removeItem('importdataselectTimeTitle')
            localStorage.removeItem('importdataenterprise')
        }
        //用户登录接口
        let reqlist={
            user:form.mobile,     
            password:form.password, 
            softType:"",    
            verType:"",  
            qyId:form.enterprise,
            task:"Login",
            softName:form.selectTimeTitle,
            isRecord:form.remember?form.remember:false              
        }
        let list = this.metaAction.gf('data.selectTimeData').toJS()
        list.forEach(item=>{
            if(item.name==form.selectTimeTitle){
                reqlist.softType=item.softtype
                reqlist.verType=item.vertype
            }
        })
        let createTask=await this.webapi.importapi.createTask(reqlist)
        if(createTask){
            reqlist.name=form.selectTimeTitle
            const ret = this.metaAction.modal('show', {
                title: '导账',
                width: 700,
                footer: null,
                closeModal: this.handleOk,
                closeBack: (back) => { this.closeTip = back },
                children: this.metaAction.loadApp('ttk-gl-app-importdata-login-list', {
                    store: this.component.props.store,
                    reqlist:reqlist,
                    id:JSON.parse(createTask).taskId
                })
            })
        }
        

    }
    handleOk = (ret) => {
        this.closeTip()
        this.component.props.closeModal()
	}
    fieldChange = async (fieldPath, value, operate) => {
        value = fieldPath.indexOf('mobile') > -1 ?  string.trim(value) : value
        this.metaAction.sf(fieldPath, value)
        await this.check([{ path: fieldPath, value }], operate)
    }

    check = async (fieldPathAndValues, operate) => {
        if (!fieldPathAndValues)
            return

        var checkResults = []

        for (var o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == 'data.form.mobile') {
                Object.assign(r, await this.checkMobile(o.value, operate))
            }
            else if (o.path == 'data.form.password') {
                Object.assign(r, await this.checkPassword(o.value))
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
        mobile = string.trim(mobile)
        if (operate && operate == 'login') {
            if (!mobile)
                message = '请输入账号'
        } else {
            if (!mobile)
                message = '请输入账号'
        }
        return { errorPath: 'data.other.error.mobile', message }
    }
    checkPassword = async (password) => {
        var message

        if (!password)
            message = '请输入密码'

        return { errorPath: 'data.other.error.password', message }
    }
    checkentErprise= () => {
        let selectTimeTitle = this.metaAction.gf('data.form.selectTimeTitle')
        if(selectTimeTitle&&selectTimeTitle.indexOf('云代账')>-1){
            return true
        }else{
            return false
        }
    }
    //检查是否要置灰登录
    checkLogin = () => {
        let data = this.metaAction.gf('data').toJS()
        return !((data.form.mobile && !data.other.error.mobile) && (data.form.password && !data.other.error.password)&& data.form.selectTimeTitle )

    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
