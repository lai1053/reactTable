import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon } from 'edf-component'
import config from './config'
import { Tree } from 'edf-component'
import { FormDecorator, Button } from 'edf-component'
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
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        injections.reduce('init')
        this.load()
    }

    load = async () => {
        this.metaAction.sf('data.other.loading', true)

        let invoiceInventoryList = this.component.props.invoiceInventoryList
        let inventoryType = this.component.props.inventoryType  // delivery 销项 
        if (invoiceInventoryList) {
            if (inventoryType != 'delivery') {
                //进项处理费用
                invoiceInventoryList.forEach(ele => {
                    if (ele.businessTypeName && !ele.name) {
                        ele.name = ele.businessTypeName
                    }
                })
            }
            this.injections.reduce('load', invoiceInventoryList)
        }
        this.getInventory()
        this.metaAction.sf('data.other.loading', false)
    }

    getInventory = async () => {
        let inventoryType = this.component.props.inventoryType  // delivery 销项 
        let inventory;
        if (inventoryType == 'delivery') {
            let res = await this.webapi.matchInventory.inventory();//查询存货 销项
            if (res) inventory = res.list.filter(item => item.isEnable == true)
        } else {
            inventory = await this.webapi.matchInventory.queryInventory();// 进项
            if (inventory) {
                inventory.forEach(el => {
                    el.name = el.code + " " + el.name;
                });
            }
        }
        if (inventory) this.injections.reduce('upDate', { path: 'data.other.inventory', value: inventory })
    }

    onFieldChange = (value, index) => {
        let inventoryType = this.component.props.inventoryType  // delivery 销项 
        if (!value) {
            if (inventoryType == 'delivery') {
                this.injections.reduce('upDate', { path: `data.form.details.${index}.inventoryId`, value: null })
                this.injections.reduce('upDate', { path: `data.form.details.${index}.name`, value: null })
            } else {
                //进项费用置空
                this.injections.reduce('upDate', { path: `data.form.details.${index}.inventoryId`, value: null })
                this.injections.reduce('upDate', { path: `data.form.details.${index}.name`, value: null })
                this.injections.reduce('upDate', { path: `data.form.details.${index}.businessTypeId`, value: null })
                this.injections.reduce('upDate', { path: `data.form.details.${index}.businessTypeName`, value: null })
            }
        } else {
            let detail = this.metaAction.gf('data.other.inventory').toJS()
            let inventory = detail.find(item => item.id == value)
            if (inventoryType == 'delivery') {
                this.injections.reduce('upDate', { path: `data.form.details.${index}.inventoryId`, value: null })
                this.injections.reduce('upDate', { path: `data.form.details.${index}.name`, value: inventory.name })
            } else {
                //进项考虑费用
                if (inventory.propertyId == 4001001) {
                    this.injections.reduce('upDate', { path: `data.form.details.${index}.businessTypeId`, value: inventory.id })
                    this.injections.reduce('upDate', { path: `data.form.details.${index}.businessTypeName`, value: inventory.name })
                    this.injections.reduce('upDate', { path: `data.form.details.${index}.inventoryId`, value: null })
                    this.injections.reduce('upDate', { path: `data.form.details.${index}.name`, value: inventory.name })
                } else {
                    this.injections.reduce('upDate', { path: `data.form.details.${index}.businessTypeId`, value: null })
                    this.injections.reduce('upDate', { path: `data.form.details.${index}.businessTypeName`, value: null })
                    this.injections.reduce('upDate', { path: `data.form.details.${index}.inventoryId`, value: inventory.id })
                    this.injections.reduce('upDate', { path: `data.form.details.${index}.name`, value: inventory.name })
                }
            }
            //   this.injections.reduce('upDate', { path: `data.form.details.${index}.propertyName`, value: inventory.propertyName })
        }
    }

    isDelivery = (id) => {
        let inventoryType = this.component.props.inventoryType
        if (inventoryType == id) {
            return true
        } else {
            return false
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
                //新增的存货必须为有效的
                return
            }
            let inventoryType = this.component.props.inventoryType  // delivery 销项 
            if (inventoryType == 'delivery') {
                this.injections.reduce('upDate', { path: `data.form.details.${index}.inventoryId`, value: ret.id })
                this.injections.reduce('upDate', { path: `data.form.details.${index}.name`, value: ret.name })
            } else {
                //进项删除bussnessType
                this.injections.reduce('upDate', { path: `data.form.details.${index}.inventoryId`, value: ret.id })
                this.injections.reduce('upDate', { path: `data.form.details.${index}.name`, value: ret.name })
                this.injections.reduce('upDate', { path: `data.form.details.${index}.businessTypeId`, value: null })
                this.injections.reduce('upDate', { path: `data.form.details.${index}.businessTypeName`, value: null })
            }
            // this.injections.reduce('upDate', { path: `data.form.details.${index}.propertyId`, value: ret.propertyId })
            this.getInventory()

            //  this.injections.reduce('upDate', { path: `data.form.details.${index}.propertyName`, value: ret.propertyName })

            //this.load()
            // let inventoryType = this.component.props.inventoryType  // delivery 销项 
            // let inventory
            // if (inventoryType == 'delivery') {
            //     inventory = await this.webapi.handleRule.inventory()
            // } else {
            //     // 进项
            //     inventory = await this.webapi.handleRule.queryInventory()
            // }
            // this.injections.reduce('upDate', { path: 'data.other.inventory', value: inventory.list })
        }
        // if (ret) this.getInventory()
    }
    //支持搜索
    filterOption = (inputValue, option, name) => {
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
        } else if (parmasName.indexOf('name') != -1) {
            parmasName = 'inventory'
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
            || paramsValue.get('helpCode').search(regExp) != -1 // TODO 只支持助记码搜索，简拼
    }
    onOk = async () => {
        let invoiceInventoryList = this.component.props.invoiceInventoryList
        let invoice = this.component.props.invoice
        let inventoryType = this.component.props.inventoryType
        let detail = this.metaAction.gf('data.form.details').toJS()
        // detail.map(item => {
        //     let businessTypeId, inventoryId
        //     if (item.propertyId == 4001001) {
        //         businessTypeId = item.inventoryId;
        //         inventoryId = null
        //     } else {
        //         businessTypeId = null
        //         inventoryId = item.inventoryId
        //     }
        //     list.push({
        //         taxClassificationCode: item.taxClassificationCode,
        //         inventoryName: item.inventoryName,
        //         inventoryId: inventoryId,
        //         businessTypeId: businessTypeId
        //     })
        // })
        if (inventoryType != 'delivery') {
            //进项删除name
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
        }
        let filter = {
            invoice,
            invoiceInventoryList: detail
        }
        if (inventoryType == 'delivery') {
            filter.vatOrEntry = 0
        } else {
            filter.vatOrEntry = 1
        }
        const res = await this.webapi.matchInventory.save(filter)
        if (res) {
            this.metaAction.toast('success', '匹配成功')
        }
        return res;
    }
    onCancel = async () => {
        let invoiceInventoryList = this.component.props.invoiceInventoryList
        let invoice = this.component.props.invoice
        let detail = this.metaAction.gf('data.form.details').toJS(), list = []
        detail.map(item => {
            list.push({
                taxClassificationCode: item.taxClassificationCode,
                inventoryName: item.inventoryName,
                inventoryId: null
            })
        })
        let filter = {
            invoice,
            invoiceInventoryList: list
        }
        let inventoryType = this.component.props.inventoryType  // delivery 销项 
        if (inventoryType == 'delivery') {
            filter.vatOrEntry = 0
        } else {
            filter.vatOrEntry = 1
        }
        const res = await this.webapi.matchInventory.save(filter);
        return true;

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