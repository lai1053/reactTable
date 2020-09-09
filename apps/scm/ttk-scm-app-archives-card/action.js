import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon } from 'edf-component'
import config from './config'
import { Tree } from 'edf-component'
import { FormDecorator } from 'edf-component'
import extend from './extend'
import moment from 'moment'
import utils from 'edf-utils'

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
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        let res = await this.webapi.dateCard.getMaxMonthlyClosingPeriod()
        if (res) this.injections.reduce('load', res)
    }

    checkBoxChange = (path, v) => {
        this.metaAction.sf(path, v)
    }
    //确定
    onOk = async () => {
        let value = this.metaAction.gf('data.other.beginDate')
        let form = this.metaAction.gf('data.form').toJS(), productionAccounting = 0

        if (form.productionId == 1) {
            productionAccounting = 0
        } else if (form.productionId == 2 && form.costId == 1) {
            productionAccounting = 1
        } else if (form.productionId == 2 && form.costId == 2) {
            productionAccounting = 2
        }

        const res = await this.webapi.dateCard.createDate({ paramValue: value, mode: form.methodId, productionAccounting })
        // const ret = await this.webapi.dateCard.updateCalcMode({mode: modeId})
        let response = { beginDate: value, mode: form.methodId, productionAccounting }
        return response
    }

    // 关闭弹框和页面
    onCancel = () => {
        if (this.component.props.tabEdit) {
            if (this.component.props.appNames == 'beginning') {
                this.component.props.tabEdit('存货期初', 'remove')
            } else {
                this.component.props.tabEdit('存货', 'remove')
                this.component.props.tabEdit('存货台账', 'remove')
            }
        }
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