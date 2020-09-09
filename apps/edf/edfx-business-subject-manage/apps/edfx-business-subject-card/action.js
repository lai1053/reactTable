import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {Icon} from 'edf-component'
import config from './config'
import {Tree} from 'edf-component'
import { FormDecorator } from 'edf-component'
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
	    let response = {}, influenceList = []
		let {influencetitArr,influenceArr,subject,accountCode, glAccountId, assetCardId, 
			assetId,isAutoAccount, treeSelectedKey} = this.component.props.initButtionValue

		let {isBatch} = this.component.props.initButtionValue

		if(influenceArr && influencetitArr){
			influenceArr = influenceArr.reverse()
			influencetitArr.map((item,index)=>{
				if(influenceArr[index] != '-'){
					influenceList.push({
						influence: influencetitArr[index],
						influenceValue: influenceArr[index]
					})
				}
			})
		}

		if(accountCode) this.metaAction.sf('data.other.subjectCode', accountCode)
		
		this.metaAction.sf('data.other.loading', true)
		let autoAccountRes
		if(isAutoAccount){
			autoAccountRes = await this.webapi.accountCard.getById({cardId: assetCardId, id: assetId})
		}else{
			response = await this.webapi.accountCard.getSubject()
		}
		let res = {response, influenceList, subject, glAccountId, isBatch, 
			assetCardId, assetId, isAutoAccount, autoAccountRes, treeSelectedKey}
        if(res){
            this.injections.reduce('load', res)
		}
		this.metaAction.sf('data.other.loading', false)
    }

	//修改科目select
	fieldChange = (path, value) => {	
		this.voucherAction.fieldChange(path, value, this.check)
	}
	filterOptionSubject = (input, option) => {
		if (option && option.props && option.props.children) {
			return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
		}
		return true
	}
	selectSubject = (v)=>{
		v = Number(v)
		let subjectList = this.metaAction.gf('data.other.subjectList')
		if(subjectList){
			this.fieldChange('data.form.glAccountId', v)
			
			let subjectCode
			subjectList.toJS().map((item, index)=>{
				if(item.value == v) {
					subjectCode = item.code 
					this.metaAction.sfs({
						'data.other.subjectCode': subjectCode,
						'data.other.subjectId': v
					})
				}
			})
		}
	}

	addSubject = async() => {
		const ret = await this.metaAction.modal('show', {
			title: '新增科目',
			width: 450,
			okText: '保存',
			bodyStyle: { padding: 24, fontSize: 12 },
			children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
				store: this.component.props.store,
				columnCode: "subjects",
				active: 'archives'
			})
		})
		if(ret){
			let response, autoAccountRes
			let isAutoAccount = this.metaAction.gf('data.other.isAutoAccount')
			if(isAutoAccount) {
				this.metaAction.sf('data.other.loading', true)
				let assetCardId = this.metaAction.gf('data.other.assetCardId')
				let assetId = this.metaAction.gf('data.other.assetId')
				autoAccountRes = this.webapi.accountCard.getById({cardId: assetCardId, id: assetId})
				this.metaAction.sf('data.other.loading', false)
			}else{
				response = await this.webapi.accountCard.getSubject()
			}
			let res = {response, autoAccountRes}
			if(response) this.injections.reduce('load', res)

			if(isAutoAccount){
				let subjectList = this.metaAction.gf('data.other.subjectList').toJS()
				const addObj = subjectList.filter(v=>v.value == ret.id)
				if(addObj) this.selectSubject(ret.id)
			}
			this.selectSubject(ret.id)
		}
	}
    
    //确定修改科目
	onOk =  () => {
        return this.saveSubject({})
    }
	
	saveSubject = async () => {
		let {templateUserId, templateAccountTypeId, accountCode,influence,influenceValue,ts, 
			isBatch, selectedOption,accountList} = this.component.props.initButtionValue
		let subjectCodes = this.metaAction.gf('data.other.subjectCode'),
		accountId = this.metaAction.gf('data.other.subjectId'),
		isAutoAccount = this.metaAction.gf('data.other.isAutoAccount')
		if(accountCode == subjectCodes) return   
		
		const ret = await this.metaAction.modal('confirm', {
			title: '提示',
			content: '您手工改动了科目设置，将会影响到以后生成的相关凭证哦，请确认修改'
		})

		if(ret){
			let response ,filter = [], opt={}, selectItem
			if(isBatch){  // 批量
				selectedOption.map((item, index)=>{
					selectItem = accountList[index]
					if(selectItem.templateUserId){
						opt = {
							id: selectItem.templateUserId,
							templateAccountTypeId: selectItem.templateAccountTypeId,
							influence: selectItem.influence,
							influenceValue: selectItem.influenceValue,
							accountId,
							accountCode: subjectCodes,
							ts: selectItem.ts
						}
					}else{
						opt = {
							templateAccountTypeId: selectItem.templateAccountTypeId,
							influence: selectItem.influence,
							influenceValue: selectItem.influenceValue,
							accountId,
							accountCode: subjectCodes,
						}
					}
					filter.push(opt)
				})
				response = await this.webapi.accountCard.saveBatch(filter)
			}else{
				if(isAutoAccount){
					
					let glAccountIdOld = this.metaAction.gf('data.form.glAccountIdOld')
					if(glAccountIdOld == accountId) return true

					let assetFilter = this.metaAction.gf('data.other.filter').toJS()
					let treeSelectedKey = this.metaAction.gf('data.other.treeSelectedKey')
					treeSelectedKey = treeSelectedKey.size ? treeSelectedKey.toJS():treeSelectedKey
					if(treeSelectedKey == '4000080001'){
						assetFilter.chargeVsAccountId = accountId
					}else if(treeSelectedKey == '4000080002'){
						assetFilter.depreciationVsAccountId = accountId
					}else{
						assetFilter.assetClassVsAccountId = accountId
					}
					response = await this.webapi.accountCard.updateAsset(assetFilter)
				}else{
					if(templateUserId){
						response = await this.webapi.accountCard.saveAccountType({
							id:templateUserId,
							templateAccountTypeId,
							influence,
							influenceValue,
							accountId,
							accountCode: subjectCodes,
							ts
						})
					}else{
						response = await this.webapi.accountCard.saveAccountType({
							templateAccountTypeId,
							influence,
							influenceValue,
							accountId,
							accountCode: subjectCodes,
						})
					}
				}
			}
			
			if (response && response.result == false) {
				this.metaAction.toast('error', response.error.message)
			} else if(response){
				this.metaAction.toast('success', '修改成功')
				return response
			}
		}
	}	
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction,voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction,...voucherAction, ...o }
	
	metaAction.config({ metaHandlers: ret })
	
	return ret

}