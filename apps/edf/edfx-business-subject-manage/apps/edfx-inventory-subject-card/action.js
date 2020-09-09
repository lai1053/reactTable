import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, FormDecorator } from 'edf-component'
import config from './config'
import extend from './extend'
import { Map, fromJS } from 'immutable'

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
        let res = await this.webapi.inventoryCard.list()
        this.injections.reduce('load', res)
    }

    //保存
    onOk = async (type) => {
        return await this.save(type)
    }

    save = async (type) => {
        let form = this.metaAction.gf('data.form').toJS()

        if(!form.parentRevenueAccount) {
            this.metaAction.toast('error', '请选择上级科目')
            this.metaAction.sf('data.redBorder', true)
            return false
        }

        let invoiceInventoryList = []

        for(var i= 0;i<this.component.props.accountList.length;i++) {
            let a = {inventoryId : this.component.props.accountList[i].templateUserId}
            invoiceInventoryList.push(a)
        }
        // console.log(invoiceInventoryList)
        let filter = {}
        filter.invoiceInventoryList = invoiceInventoryList
        filter.parentRevenueAccount = form.parentRevenueAccount
        filter.isCalcQuantity = form.isCalcQuantity
        filter.stockAccountSetInvoking = form.stockAccountSetInvoking
        filter.isReturnValue = true
        let res = await this.webapi.inventoryCard.generateInventoryAccount(filter)
        return res
    }

    fieldChange = (path, value) => {
        if (path == 'data.form.parentRevenueAccount') {
            this.metaAction.sfs({
                'data.form.parentRevenueAccount': value,
                'data.redBorder': false
            })
        }
    }

    handleCheckboxChange = () => {
        let isCalcQuantity = this.metaAction.gf('data.form.isCalcQuantity')
        this.metaAction.sf('data.form.isCalcQuantity', !isCalcQuantity)
    }

     //新增收入类型（包括末级非末级）
     addArchive = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '新增收入科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                createRevenueAccount: true,//是否为新增收入科目
                columnCode: "subjects",
                active: 'archives'
            })
        })
        if (ret) {
            let parentRevenueAccounts = this.metaAction.gf('data.other.parentRevenueAccounts').toJS()
            parentRevenueAccounts.push(ret)

            let res = await this.webapi.inventoryCard.list()

            this.metaAction.sfs({
                'data.other.parentRevenueAccounts': fromJS(parentRevenueAccounts),
                'data.form.parentRevenueAccount': ret.id,
                'data.redBorder': false,
            })
        }
    }

    filterOption = (inputValue, option) => {
        inputValue = inputValue.replace(/\\/g, "\\\\");
        if (!option || !option.props || !option.props.value) return false;
        let parentRevenueAccounts = this.metaAction.gf('data.other.parentRevenueAccounts').toJS()
        let regExp = new RegExp(inputValue, 'i');
        let paramsValue = parentRevenueAccounts.find(item => item.id == option.props.value)

        if (!paramsValue) {
            return false
        }

        if (paramsValue.name && paramsValue.name.search(regExp) != -1) {
            return true
        }
        if (paramsValue.fullname&& paramsValue.fullname.search(regExp) != -1) {
            return true
        }
        if (paramsValue.codeAndName && paramsValue.codeAndName.search(regExp) != -1) {
            return true
        }
        if (paramsValue.helpCode && paramsValue.helpCode.search(regExp) != -1) {
            return true
        }
        if (paramsValue.helpCodeFull && paramsValue.helpCodeFull.search(regExp) != -1) {
            return true
        }

        return false;

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