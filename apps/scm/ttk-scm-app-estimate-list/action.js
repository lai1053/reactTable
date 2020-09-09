import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import config from './config'
import extend from './extend'
import { parse } from 'querystring';
import { number } from 'edf-utils'
import { normalize } from 'path';

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
		this.extendAction = option.extendAction
		this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({component, injections})
        this.component = component
        this.injections = injections

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        injections.reduce('init')
        this.load()
    }

    load = async() => {
        const res = await this.webapi.list.getBussinessType({inventoryPropertyId: ''})
        const date = await this.webapi.list.getEnableDate()
        let dd = this.component.props, oldDate

        if(dd.accessType && dd.date) oldDate = dd.date
        this.injections.reduce('initOption', { inventoryPropertyOption: res, enableDate: date, oldDate })
        this.loadList()
    }

    onTabFocus = async (props) => {
        let query = await this.webapi.list.query()
        if(query == '0'){
            this.metaAction.toast(error, '存货核算未启用')
            return false
        }
        props = props.size ? props.toJS() : props
        let formList = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS()
        if(props.accessType && props.date){
            this.injections.reduce('initOption', { oldDate: props.date })
        }
        this.loadList(formList)
    }

    dateChange = (value) => {
        this.metaAction.sf('data.form.accountingPeriod', fromJS(value))
        this.loadList()
    }

    handleDisabledDate = (current) => {
        if (current) {
            let enableTime = this.metaAction.gf('data.other.enableDate'), currentDate = current.format('YYYY-MM')
            if (enableTime) enableTime = enableTime.replace(/-/g, '')
            if (currentDate) currentDate = currentDate.replace(/-/g, '')
            return currentDate && currentDate < enableTime
        }
    }

    autoCreate = async() => {
        this.isOk = false
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid')
        if(!selectedArrInfo.length){
            this.metaAction.toast('warn', '请选择要自动生成暂估单的数据')
            return false
        }
        if(this.isOk) return false
        const list = this.metaAction.gf('data.list').toJS()
        let noAmountArr = [], noPriceArr = []
        selectedArrInfo.forEach((item, index) => {
            list.map((o,indexs) =>{
                if(!item.amount && o.inventoryCode == item.inventoryCode) {
                    noAmountArr.push(indexs+1)
                }
            })
        })
        noAmountArr = Array.from(new Set(noAmountArr))
        if( noAmountArr.length > 0 ) {
            return this.metaAction.toast('warn', `第${noAmountArr.join('、')}行的暂估金额不能为空`)
        }
        
        selectedArrInfo.map((item,index)=>{
            const amount =  number.clearThousPos(item.amount)
            const price = number.clearThousPos(amount/item.temporaryEstimationQty).toFixed(6)
            if(Number(price) == 0) noPriceArr.push(index+1)
        })
        noPriceArr = Array.from(new Set(noPriceArr))
        if( noPriceArr.length > 0 ) {
            return this.metaAction.toast('warn', `第${noPriceArr.join('、')}行的暂估金额/暂估数量不能为0`)
        }
        let date = this.metaAction.gf('data.form.accountingPeriod')
        const prefix = await this.webapi.list.getCode({
            businessDate: date.format('YYYY-MM-DD'),
            codePrefix: 'ZR'
        })

        let obj = {
            attachments: [],
            businessTypeId: 5001001004,
            businessDate: date.format('YYYY-MM-DD'),
            codePrefix: 'ZR',
            sourceVoucherCode: prefix,
            isEnable: true,
            manufacturCost: [],
            laborCost: null,
            materialCost: null,
            autoTempBill: true,
            details: selectedArrInfo.map(item =>{
                const amount =  number.clearThousPos(item.amount)
                const price =  number.clearThousPos(amount/item.temporaryEstimationQty).toFixed(6)
                return {
                    ...item,
                    quantity: item.temporaryEstimationQty,
                    amount: amount,
                    price:  Number(price)
                }
            })
        }
        const res = await this.webapi.list.create(obj)
        this.isOk = true
        if(res) {
            this.metaAction.toast("success", '生成暂估单成功')
            this.isOk = false
            this.loadList()
        }
    }

    selectChange = (value) => {
        this.metaAction.sf('data.form.inventoryPropertyId', value)
        this.loadList()
    }

    loadList = async(formList) => {
        const params =  this.metaAction.gf('data.form').toJS()
        let obj = {
            inventoryPropertyId: params.inventoryPropertyId ? params.inventoryPropertyId : '',
            accountingYear: params.accountingPeriod.format('YYYY'),
            accountingPeriod: params.accountingPeriod.format('M')
        }
        const res = await this.webapi.list.getList(obj)
        if(formList && formList.length){
            res.map((item,index)=>{
                let listItem = formList.find(i=> i.inventoryId == item.inventoryId)
                if(listItem){
                    res[index].amount = listItem.amount
                }
            })
        }
        this.metaAction.sf('data.list', fromJS(res))
    }
    btnTipsClick = () => {
        this.metaAction.sf('data.stepsEnabled',true)
    }

    onExit = () => {
        this.injections.reduce('modifyContent')
    }

    isSelectAll = (gridName) => {
		return this.extendAction.gridAction.isSelectAll(gridName)
    }

    selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
	}
    

    renderQuantity = (a, b, c) => {
        if(a && b && c){
            let value = parseFloat(a) + parseFloat(b) - parseFloat(c)
            return number.format(value,6)
        }else{
            if(a){
                return number.format(a,6)
            }else{
                return 
            }
        }
    }


    formatAmount = (value) => {
        if (value) {
            return number.format(value, 2)
        }
        return null
    }

    amountChange = (value, index) => {
        const list = this.metaAction.gf('data.list').toJS()
        list[index].amount = value
        this.metaAction.sf('data.list', fromJS(list))
    }

    amountBlur = (value, index) => {
        const list = this.metaAction.gf('data.list').toJS()
        value = (value == 0) ? '' : number.format(value, 2)
        list[index].amount = value 
        this.metaAction.sf('data.list', fromJS(list))
    }
    // 导出
    export = async() => {
        let list = this.metaAction.gf('data.list').toJS(), partInventoryDtos = []
        const params =  this.metaAction.gf('data.form').toJS()
        list.map(item=> {
            partInventoryDtos.push({
                inventoryId: item.inventoryId,
                temporaryEstimationQty: item.temporaryEstimationQty,
                temporaryEstimationAmount: item.amount
            })
        })
        let filter = {
            inventoryPropertyId: params.inventoryPropertyId ? params.inventoryPropertyId : '',
            accountingYear: params.accountingPeriod.format('YYYY'),
            accountingPeriod: params.accountingPeriod.format('M'),
            partInventoryDtos
        }
        if(!list.length){
			this.metaAction.toast('warning', '当前没有可导出数据')
			return false
		}else{
            let res = await this.webapi.list.export(filter)
            if(res) this.metaAction.toast('success', '导出成功')
        }
    }
    // 打印
    print = async() => {  
        let list = this.metaAction.gf('data.list').toJS(), partInventoryDtos = []
        const params =  this.metaAction.gf('data.form').toJS()
        list.map(item=> {
            partInventoryDtos.push({
                inventoryId: item.inventoryId,
                temporaryEstimationQty: item.temporaryEstimationQty,
                temporaryEstimationAmount: item.amount
            })
        })
        let filter = {
            inventoryPropertyId: params.inventoryPropertyId ? params.inventoryPropertyId : '',
            accountingYear: params.accountingPeriod.format('YYYY'),
            accountingPeriod: params.accountingPeriod.format('M'),
            partInventoryDtos
        }
        if(!list.length){
			this.metaAction.toast('warning', '当前没有可打印数据')
			return false
		}else{
            let res = await this.webapi.list.print(filter)
            if(res) this.metaAction.toast('success', '打印成功')
        }
    }
    changeNumber = (value, name) => {
        if(name == 'quantity'){
            return number.format(value,6)
        }else{
            return number.format(value,2)
        }
    }
    
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({...option, metaAction}),
		o = new action({...option, metaAction, extendAction}),
		ret = {...metaAction, ...extendAction.gridAction, ...o}

	metaAction.config({metaHandlers: ret})

	return ret
}