import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS } from 'immutable'
import moment from 'moment'
import utils, { fetch } from 'edf-utils'
import extend from './extend'
import { consts, common } from 'edf-constant'
import changeToOption from './utils/changeToOption'
import {FormDecorator, Select, Checkbox, Form, DatePicker, Button, Input, Icon, ColumnsSetting} from 'edf-component'

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
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
		}
		if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
		}
        injections.reduce('init')
        this.initLoad(this.component.props.parameter)
    }
        
    initLoad = async (parameter) => {
		const result = await this.webapi.init(parameter)
		let getCalcObject =  await this.webapi.getCalcObject()

		if (getCalcObject) {
            getCalcObject = changeToOption(getCalcObject, 'name', 'id')
        }
       
        let getCalcObjects = []
        if(getCalcObject) {
            for(var i=0; i<getCalcObject[0].children.length;i++) {
                getCalcObjects.push(getCalcObject[0].children[i])
            }
            for(var i=0; i<getCalcObject[1].children.length;i++) {
                getCalcObjects.push(getCalcObject[1].children[i])
            }
            for(var i=0; i<getCalcObject[2].children.length;i++) {
                getCalcObjects.push(getCalcObject[2].children[i])
            }
        }
        result.getCalcObject = getCalcObject
		result.getCalcObjects = getCalcObjects
		
        this.injections.reduce('initLoad', result)
    }

    onFilderChange = (rowIndex,value) => () => {
        const details = this.metaAction.gf('data.form.details').toJS()
        details[rowIndex].amount = value
        this.metaAction.sf('data.form.details', fromJS(details))
	}
	
	onOk = async () => {
		const form = this.metaAction.gf('data.form').toJS()
		const other = this.metaAction.gf('data.other').toJS()
		
		if (!this.checkForSave()) return false
		let params = {}
		//往来单位或个人情况处理
		if(form.supplierId){
			let sss
			other.getCalcObject.map(item => {
				return {
					children: item.children.map(items => {
						if(items.value == form.supplierId) {
							sss = item.value
						}
					})
				}
			})
			if(sss == '1'){
				params.supplierId = form.supplierId
			}else if(sss == '2'){
				params.customerId = form.supplierId
			}else if(sss == '3'){
				params.personId = form.supplierId
			}
		}else {
			params.supplierId = form.supplierId
			params.customerId = form.supplierId
			params.personId = form.supplierId			
		}

		params.accountDate = other.SystemDate
		params.id = other.bankReconciliatio.id
		params.bankAccountId = other.bankAccount.bankAccountTypeId

		let reconciliatioBatchMaintenanceDtos = []
		//收入金额时
		if(other.bankReconciliatio.inAmount){
			reconciliatioBatchMaintenanceDtos = form.details.map((item,index) => {
				return {
					departmentId : item.departmentId,
					projectId : item.projectId,
					businessTypeId : item.businessTypeId,
					inAmount : item.amount,
					remark : item.remark,
				}
			})	
		}

		if(other.bankReconciliatio.outAmount){
			reconciliatioBatchMaintenanceDtos = form.details.map((item,index) => {
				return {
					departmentId : item.departmentId,
					projectId : item.projectId,
					businessTypeId : item.businessTypeId,
					outAmount : item.amount,
					remark : item.remark,
				}
			})	
		}
		
		params.reconciliatioBatchMaintenanceDtos = reconciliatioBatchMaintenanceDtos
		let res =  await this.webapi.create(params)
		if(res) {
			this.metaAction.toast('success', '保存成功')
		}
	}

	onFieldDataChanges = (field, storeField) => (value) => {
        if (!field || !storeField) return
        let values = this.metaAction.gf(storeField).find(o => o.get('value') == value)
        if (values) {
            Object.keys(field).forEach(key => {
                this.metaAction.sf(field[key], values.get(key))
            })
        }
	}
	
	moneyChange = (index,value) => {
		let details = this.metaAction.gf('data.form.details').toJS()
		let other = this.metaAction.gf('data.other').toJS()

		details[index].amount = value
		this.metaAction.sf('data.form.details', fromJS(details))

		let money = other.bankReconciliatio.inAmount || other.bankReconciliatio.outAmount
		let newDifference = 0
		for(var i=0;i<details.length;i++){
			money -= details[i].amount
		}
		for(var i=0;i<details.length;i++){
			newDifference +=Number(details[i].amount)
		}
		this.metaAction.sf('data.other.total', fromJS(money))
		this.metaAction.sf('data.other.difference', fromJS(newDifference))
    }

    onFieldChange = (field, storeField, rowIndex, rowData, index) => (id,selectedOptions) => {
		if (!field || !storeField) return
		let that = this, value
		if(storeField != 'data.other.businessTypes'){
			value = this.metaAction.gf(storeField).find(o => o.get('id') == id)
			if (value) {
				Object.keys(field).forEach(key => {
					this.metaAction.sf(field[key], value.get(key))
				})
			}
		}else {
			Object.keys(field).forEach(key => {
				if (key != 'arrName') {
					this.metaAction.sf(field[key], selectedOptions[1][key]);
				} else {
					this.metaAction.sf(field[key], id);
				}
			})
		}

		if (storeField == 'data.other.businessTypes') { //当改变存货名称或编码时以下数据也要发生更改
			let data = this.metaAction.gf('data').toJS(), str = ''
			data.form.details.forEach(function(data){
				if(data.businessTypeFatherName != null){
					str = str + data.businessTypeFatherName + '-' + data.businessTypeName + '；'
				}
			})
			this.metaAction.sfs({
				'data.form.summary': str,
			})
		}
		if (storeField == 'data.other.deptPersonList') {
			value = value.toJS()
			if(rowData.calcObject == "customer"){
				this.metaAction.sf(`data.form.details.${rowIndex}.customerId`, value.id)
			}else if(rowData.calcObject == "person"){
				this.metaAction.sf(`data.form.details.${rowIndex}.personId`, value.id)
			}else if(rowData.calcObject == "supplier"){
				this.metaAction.sf(`data.form.details.${rowIndex}.supplierId`, value.id)
			}
			["customer","person","supplier"].forEach(function(data){
				if(rowData.calcObject != data){
					that.metaAction.sf(`data.form.details.${rowIndex}.${data}Id`, null)
				}
			})
			let data = this.metaAction.gf('data').toJS()
		}
		if (storeField == 'data.other.bankAccount') {
			if (value) {
				let settles = this.metaAction.gf('data.form.settles')
				settles = settles ? settles.toJS() : []
				const id = value.toJS().id, name = value.toJS().name,
					amount = this.metaAction.gf('data.form.paymentAmount')
				if (settles.length == 0) {
					const obj = {
						bankAccountId: id,
						amount: '',
						bankAccountName: name,
					}
					settles.push(obj)
				} else {
					settles[index].bankAccountId = id
					settles[index].bankAccountName = name
				}
				this.metaAction.sf('data.form.settles', fromJS(settles))
			}
		}
    }
    
    cardFocus = () => {
		this.extendAction.gridAction.cellAutoFocus()
	}

	checkForSave = () => {
        const form = this.metaAction.gf('data.form').toJS()
        const other = this.metaAction.gf('data.other').toJS()
        let msg = []

		for(var i=0;i<form.details.length;i++){
			if(!form.details[i].businessTypeArrName){
				msg.push('收款类型不能为空')
			}
			if(!form.details[i].amount){
				msg.push('金额不能为空')
			}
		}

		if(other.total != 0){
			msg.push('请保证收支金额和金额保持相等')
		}

        if (msg.length > 0) {
            this.metaAction.toast('error', this.getDisplayErrorMSg(msg))
            return false
        }

        return true
    }

    getDisplayErrorMSg = (msg) => {
        return <div style={{ display: 'inline-table' }}>{msg.map(item => <div>{item}<br /></div>)}</div>
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        // voucherActionG = GridDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
