import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS } from 'immutable'
import moment from 'moment'
import utils, { fetch } from 'edf-utils'
import extend from './extend'
import { consts, common } from 'edf-constant'
import { FormDecorator, Select, Checkbox, Form, DatePicker, Button, Input, Icon, ColumnsSetting } from 'edf-component'

const Option = Select.Option
const FormItem = Form.Item

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
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        this.metaAction.sf('data.other.vatOrEntry', this.component.props.vatOrEntry)
        this.metaAction.sf('data.other.loading', true)
        let selectedOption = this.component.props.selectedOption
        if (this.component.props.vatOrEntry == 0) {
            this.voucherAction.getBankAccount({ entity: { isEnable: true },attributeList:["3000050001","3000050002","3000050009"] }, `data.other.account`)
        }
        if (this.component.props.vatOrEntry == 1) {
            this.voucherAction.getBankAccount({ entity: { isEnable: true },attributeList:["3000050001","3000050002","3000050010"] }, `data.other.account`)
        }

        if (selectedOption) {
            let newArr = []
            selectedOption.map((item, index) => {
                if (item.accountStatus == 4000140001 && item.notSettleAmount) newArr.push(item)
            })
            console.log(newArr);
            this.injections.reduce('load', newArr)
        }
        this.metaAction.sf('data.other.loading', false)
    }
    deleteDetail = async (id) => {
        let details = this.metaAction.gf('data.form.details').toJS()
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '将删除该条记录'
        })
        if (ret) {
            details.map((item, index) => {
                if (item.id == id) details.splice(index, 1)
            })
            this.metaAction.sf('data.form.details', fromJS(details))
            this.metaAction.toast('success', '删除成功')
        }
    }

    fieldChange = (path, value) => {
        this.injections.reduce('upDate', { path, value: value.id })
    }

    changeAmount = (v, index) => {
        if (Number(v) > 9999999999.99) {
            v = 9999999999.99
        }
        this.injections.reduce('upDate', { path: `data.form.details.${index}.amount`, value: v })
    }
    quantityFormat = (quantity, decimals, isFocus) => {
        if (quantity) {
            return this.voucherAction.numberFormat(quantity, decimals, isFocus)
        }
    }
    //数字的转化
    transformThoundsNumber = (text, key) => {
        const arr = ['quantity', 'amount', 'detailAmount', 'detailTaxInclusiveAmount', 'notSettleAmount', 'price', 'tax', 'taxInclusiveAmount', 'totalAmount', 'totalTax']
        // text = -0.01
        if (arr.includes(key)) {
            if (!text || parseFloat(text) == 0 || isNaN(parseInt(text))) {
                return ''
            }
            if (key == 'price' || key == 'quantity') {
                return utils.number.format(text, 6)
            } else {
                return utils.number.format(text, 2)
            }
        } else {
            return text
        }
    }
    onFieldChange = (v) => {
        let accountArr = this.metaAction.gf('data.other.account').toJS()
        let account = accountArr.find(item => item.id == v)
        this.metaAction.sf('data.other.accountId', fromJS(account.id))
    }

    onOk = async () => {
        let details = this.metaAction.gf('data.form.details').toJS()
        let vatOrEntry = this.metaAction.gf('data.other.vatOrEntry');

        let bankAccountId = this.metaAction.gf('data.form.account'), noAmount = false
        details.map(item => {
            if (!parseFloat(item.amount)) noAmount = true
        })
        if (!details.length) {
            this.metaAction.toast('error', '请选择数据')
            return false
        } if (!bankAccountId) {
            this.metaAction.toast('error', '请选择结算账户')
            return false
        } if (noAmount) {
            if (vatOrEntry == 0) {
                this.metaAction.toast('error', '收款金额不能为0')
            } else {
                this.metaAction.toast('error', '付款金额不能为0')
            }
            return false
        } else {
            this.metaAction.sf('data.other.loading', true)
            let filter = []
            details.map(item => {
                filter.push({
                    id: item.id,
                    bankAccountId,
                    amount: item.amount,
                    ts: item.ts
                })
            })
            let res = await this.component.props.settleOnOk(filter)
            //  let res = await this.webapi.currentAccount.settleBatch(filter)
            this.metaAction.sf('data.other.loading', false)
            return res;
        }
    }

}

// export default function creator(option) {
//     const metaAction = new MetaAction(option),
//         extendAction = extend.actionCreator({ ...option, metaAction }),
//         voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
//         // voucherActionG = GridDecorator.actionCreator({ ...option, metaAction }),
//         o = new action({ ...option, metaAction, extendAction, voucherAction }),
//         ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

//     metaAction.config({ metaHandlers: ret })

//     return ret
// }

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
