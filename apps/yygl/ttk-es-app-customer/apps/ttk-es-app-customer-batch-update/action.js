import React from 'react'
import config from './config'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {FormDecorator, Icon, Checkbox} from 'edf-component'
import { fromJS } from 'immutable'
import debounce from 'lodash.debounce'

class action{
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.nameChange = debounce(this.nameChange, 400);
    }

    onInit = ({component, injections}) => {
        this.voucherAction.onInit({component, injections})
        this.component = component
        this.injections = injections

        console.info(this.component.props)

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        injections.reduce('init', {
            isPop: this.component.props.isPop
        })
        this.load()
    }

    load = async ()=>{

    }

    onOk = async () => {
        return await this.save()
    }
    save = async () => {
        if (this.clickStatus) return
        this.clickStatus = true
        const payMode = this.metaAction.gf('data.payMode')
        const prepayment = this.metaAction.gf('data.prepayment')
        const approval = this.metaAction.gf('data.approval')
        const payType = this.metaAction.gf('data.payType')

        const ok = await this.voucherAction.check([
            {
                path: 'data.payMode', value: payMode
            }
        ], this.check)
        if (!ok) {
            this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
            this.clickStatus = false
            return false
        }

        let params = {
            id:this.component.props.ids,
            payMode:payMode ? payMode.trim() : '',
            prepayment:payMode=='1'?(prepayment ? prepayment.trim() : ''):'',
            approval:payMode=='2'?(approval ? approval.trim() : ''):'',
            payType:payType ? payType.trim() : '',
        }
        console.info(params)
        //let response = await this.webapi.customer.getNsrxxOther(params)

        this.clickStatus = false
        // if (response){
        //     if (response.success) {
        //         this.metaAction.toast('success', '保存成功、下载纳税人信息成功')
        //         return response
        //     } else {
        //         if(response.message=='客户名称、纳税人识别号、助记码不能重复，请确认！！'){
        //             this.metaAction.toast('error', '客户名称、纳税人识别号、助记码不能重复，请确认！！')
        //         }else{
        //             this.metaAction.toast('error', form.dlfs=='1'?'保存失败，请检查CA证书是否已采集':'保存失败，请检查登录账号和密码')
        //         }
        //         return false
        //     }
        // }
    }

    selectChangeCheck = (str) => {
        const payMode = this.metaAction.gf('data.payMode')
        switch (str){
            case 'payMode'://旧纳税人识别号
                this.voucherAction.check([{
                    path: 'data.payMode', value: payMode
                }], this.check);
                break;
        }
        let error = this.metaAction.gf('data.error')
        console.info(error)
    }
    check = async (option) => {
        console.info(option)
        if (!option || !option.path)
            return
        if (option.path == 'data.payMode') {
            return {
                errorPath: 'data.error.payMode',
                message: option.value ?'': '请选择企业所得税征收方式'
            }
        }
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