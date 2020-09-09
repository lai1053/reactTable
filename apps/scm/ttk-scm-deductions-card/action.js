import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, FormDecorator } from 'edf-component'
import config from './config'
import extend from './extend'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')
        this.load()
    }

    load = async () => {

    }

    //取消
    onCancel = () => {
       
    }

    //保存
    onOk = async (type) => {
        return await this.save()
    }

    save = async () => {
        let money = this.metaAction.gf('data.money')
        if (money == undefined || money == '') {
            this.metaAction.sf('data.codeErr', false)
            this.metaAction.toast('error', '扣除额不能为空')
            return false
        }
        return money
    }

    fieldChange = (e) => {
        let value = Number(e).toFixed(2)
        this.metaAction.sfs({
            'data.money': value,
            'data.codeErr': true
        })
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })
    return ret
}