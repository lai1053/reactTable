import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { FormDecorator } from 'edf-component'
import extend from './extend'
import { fromJS } from 'immutable'
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

        this.metaAction.sf('data.other.loading', true)
        let res = await this.webapi.handleRule.getMatchingRule();

        //销项
        let inventory = await this.webapi.handleRule.inventory();
        inventory = inventory.list.filter(item => item.isEnable == true);
        let response = { res, inventory };


        if (res) {
            this.metaAction.sf('data.other.loading', false)
            this.injections.reduce('load', response)
        }
    }

    // renderCustomer = () => {

    //     return '生成客户档案'

    // }
    // renderChild = () => {

    //     return '发票采集/导入后，按"购方名称"作为"客户名称"新增客户档案'

    // }

    setInventory = (path, value) => {
        this.injections.reduce('upDate', { path, value })
    }

    onFieldChange = (value, index) => {

        if (!value) {
            this.injections.reduce('upDateSfs', {
                [`data.form.details.${index}.inventoryId`]: null,
                [`data.form.details.${index}.name`]: null,
                [`data.form.details.${index}.businessTypeId`]: null,
                [`data.form.details.${index}.businessTypeName`]: null,
            })
        } else {
            let detail = this.metaAction.gf('data.other.inventory').toJS()
            let { id, name } = detail.find(item => item.id == value);
            this.injections.reduce('upDateSfs', {
                [`data.form.details.${index}.inventoryId`]: id,
                [`data.form.details.${index}.name`]: name,
                [`data.form.details.${index}.businessTypeId`]: null,
                [`data.form.details.${index}.businessTypeName`]: null,
            })
        }
    }

    //新增档案
    addRecordClick = async (index) => {

        const ret = await this.metaAction.modal('show', {
            title: '新增存货',
            width: 750,
            children: this.metaAction.loadApp(
                'app-card-inventory', {
                    store: this.component.props.store
                }
            )
        })
        if (ret) {
            if (!ret.isEnable) {
                return
            }

            const inventory = this.metaAction.gf('data.other.inventory').toJS();
            inventory.push(ret);

            this.injections.reduce('upDateSfs', {
                [`data.form.details.${index}.inventoryId`]: ret.id,
                [`data.form.details.${index}.name`]: ret.name,
                ['data.other.inventory']: fromJS(inventory),
                [`data.form.details.${index}.businessTypeId`]: null,
                [`data.form.details.${index}.businessTypeName`]: null
            })
        }
    }
    //支持搜索
    filterOption = (inputValue, option, name) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) return false

        let parmasName = null, parmasNameCode = null
        if (name.currentPath) {
            parmasName = name.currentPath
        }
        if (parmasName.indexOf('supplier') != -1) {
            parmasName = 'supplier'
        } else if (parmasName.indexOf('inventoryCode') != -1) {
            parmasName = 'inventory'
            parmasNameCode = 'inventoryCode'
        } else if (parmasName.indexOf('inventory') != -1) {
            parmasName = 'inventory'
        } else if (parmasName.indexOf('department') != -1) {
            parmasName = 'department'
        } else if (parmasName.indexOf('project') != -1) {
            parmasName = 'project'
        } else if (parmasName.indexOf('purchasePerson') != -1) {
            parmasName = 'purchasePerson'
        }
        const paramsValues = this.metaAction.gf(`data.other.${parmasName}`),
            value = option.props.value
        let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)
        if (!paramsValue) {
            return false
        }
        if (parmasNameCode && parmasNameCode.indexOf('inventoryCode') != -1) {
            let regExp = new RegExp(inputValue, 'i')
            return paramsValue.get('code').search(regExp) != -1
        }
        let regExp = new RegExp(inputValue, 'i')
        return paramsValue.get('name').search(regExp) != -1
            || paramsValue.get('helpCode').search(regExp) != -1
            || paramsValue.get('helpCodeFull').search(regExp) != -1

    }

    onOk = async () => {
        this.metaAction.sf('data.other.loading', true)
        let { details: detail, id, ts, accountSet } = this.metaAction.gf('data.form').toJS();

        detail.forEach((el) => {
            if (el.businessTypeId) {
                el.name = null
                el.inventoryId = null
            }

            if (el.inventoryId) {
                el.businessTypeName = null
                el.businessTypeId = null
            }
            if (!el.businessTypeId && !el.inventoryId) {
                el.name = null
                el.inventoryId = null
                el.businessTypeName = null
                el.businessTypeId = null
            }
        })

        let filter = {
            invoiceInventoryList: detail,
            vatOrEntry: 0,
            achivalRuleDto: {
                accountSet: accountSet ? 1 : 0,
                id,
                ts
            }
        }
        let res = await this.webapi.handleRule.updateMatchingRule(filter)
        if (res.result) {
            this.metaAction.toast('success', '保存成功')
        } else {
            this.metaAction.toast('error', '保存失败')
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