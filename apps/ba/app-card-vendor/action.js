import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import config from './config'
import debounce from 'lodash.debounce'
import {FormDecorator, Icon, Checkbox} from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.voucherAction = option.voucherAction
		this.webapi = this.config.webapi
		this.nameChange = debounce(this.nameChange, 400);
	}

	onInit = ({component, injections}) => {
		this.voucherAction.onInit({component, injections})
		this.component = component
		this.injections = injections
		this.clickStatus = false    //供应商档案创建按钮状态控制
		this.noPointStatus = 1      //供应商档案自动生成二级科目不在显示控制
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		injections.reduce('init', {
			isPop: this.component.props.isPop
		})
		this.load()
	}

	load = async () => {
		const linkConfig = this.metaAction.context.get('linkConfig');
		if (linkConfig) {
			this.metaAction.sf('data.linkT',false);
		}

		let data = {}, response = {}, code, account,category;
		if (this.component.props.personId || this.component.props.personId === 0) {
			response = await this.webapi.vendor.query(this.component.props.personId)
		} else {
			code = await this.webapi.vendor.getCode()
		}
		//获取分类
		let requestCats = {
			"baseArchiveType": 3000160002
		}
		category =  await this.webapi.vendor.cats(requestCats)
		if(category) data.category = category;
		account = await this.webapi.vendor.account()
		if (code) data.code = code
		if (response) data.response = response
		if (account && account.glAccounts) data.glAccounts = account.glAccounts
		this.injections.reduce('load', data)
		let noPointStatusQuery= await this.webapi.vendor.queryByparamKeys({paramKeys: ["PromptGenerateSpecificAccount4Supplier"]})
		this.noPointStatus = noPointStatusQuery && noPointStatusQuery[0] && noPointStatusQuery[0].paramValue
	}

	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		if (this.clickStatus) return
		this.clickStatus = true
		const form = this.metaAction.gf('data.form').toJS()
		const ok = await this.voucherAction.check([{
			path: 'data.form.code', value: form.code
		}, {
			path: 'data.form.name', value: form.name
		},{
			path: 'data.form.payableAccountId', value: form.payableAccountId
		}, {
			path: 'data.form.taxNumber', value: form.taxNumber
		}], this.check)
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}
		if(!form.payableAccountId && !(this.component.props.personId || this.component.props.personId === 0)){
			let subjectCreate = await this.webapi.vendor.canGenerateAccount({name: form.name.trim()})
			if(subjectCreate.length > 0 && this.noPointStatus == 1){
				let noPointSelectStatus
				const ret = await this.metaAction.modal('confirm', {
					title: '提示',
					width: 400,
					bodyStyle: { padding: 24, fontSize: 12 },
					content: (
						<div style={{margin: '0 auto',overflow: 'hidden' }}>
							<div style={{ color: '#515151', fontSize: '14px', lineHeight: '20px' }}>
								<p style={{ marginBottom: '20px' }}>是否生成同名的{subjectCreate[0]}{subjectCreate[1]?'、'+subjectCreate[1]:''}二级科目</p>
								<Checkbox onChange={function(data){ noPointSelectStatus = data && data.target && data.target.checked }.bind(this)} style={{ marginBottom: '0', textAlign: 'center' }}>不再提示此项目</Checkbox>
							</div>
						</div>
					)
				})
				if(ret) {
					form.isGenerateAccount = true
				}
				if(noPointSelectStatus){
					this.webapi.vendor.updateBatchByparamKey([{paramKey: ["PromptGenerateSpecificAccount4Supplier"],paramValue: "0"}])
				}
			}
		}
		let response
		form.code = form.code ? form.code.trim() : ''
		form.name = form.name ? form.name.trim() : ''
		form.taxNumber = form.taxNumber ? form.taxNumber.trim() : ''
		form.linkman = form.linkman ? form.linkman.trim() : ''
		form.contactNumber = form.contactNumber ? form.contactNumber.trim() : ''
		form.openingBank = form.openingBank ? form.openingBank.trim() : ''
		form.bankAccout = form.bankAccout ? form.bankAccout.trim() : ''
		form.addressAndTel = form.addressAndTel ? form.addressAndTel.trim() : ''
		form.categoryId = form.categoryId ? form.categoryId : ''
		form.payableInAdvanceAccountId = form.payableInAdvanceAccountId ? form.payableInAdvanceAccountId : ''
		form.otherPayableAccountId = form.otherPayableAccountId ? form.otherPayableAccountId : ''
		form.payableAccountId = form.payableAccountId ? form.payableAccountId : ''
		form.remark = form.remark ? form.remark.trim() : ''
		form.isReturnValue = true
		form.isLoadingDefaultAccount = false
		if (this.component.props.personId || this.component.props.personId === 0) {
			form.id = this.component.props.personId
			response = await this.webapi.vendor.update(form)
		} else {
			response = await this.webapi.vendor.create(form)
		}
		this.clickStatus = false
		if (response && response.error) {
			this.metaAction.toast('error', response.error.message)
			return false
		} else {
			this.metaAction.toast('success', '保存成功')
			return response
		}
	}

	changeCheck = (str) => {
		const form = this.metaAction.gf('data.form').toJS()
		switch (str){
			case 'code':
				this.voucherAction.check([{
					path: 'data.form.code', value: form.code
				}], this.check);
				break;
			case 'name':
				this.voucherAction.check([{
					path: 'data.form.name', value: form.name
				}], this.check);
				break;
			case 'taxNumber':
				this.voucherAction.check([{
					path: 'data.form.taxNumber', value: form.taxNumber
				}], this.check);
				break;
			case 'linkman':
				this.voucherAction.check([{
					path: 'data.form.linkman', value: form.linkman
				}], this.check);
				break;
			case 'contactNumber':
				this.voucherAction.check([{
					path: 'data.form.contactNumber', value: form.contactNumber
				}], this.check);
				break;
			case 'openingBank':
				this.voucherAction.check([{
					path: 'data.form.openingBank', value: form.openingBank
				}], this.check);
				break;
			case 'bankAccout':
				this.voucherAction.check([{
					path: 'data.form.bankAccout', value: form.bankAccout
				}], this.check);
				break;
			case 'addressAndTel':
				this.voucherAction.check([{
					path: 'data.form.addressAndTel', value: form.addressAndTel
				}], this.check);
				break;
			case 'remark':
				this.voucherAction.check([{
					path: 'data.form.remark', value: form.remark
				}], this.check);
				break;
			case 'categoryId':
				this.voucherAction.check([{
					path: 'data.form.categoryId', value: form.categoryId
				}], this.check);
				break;	
			case 'payableAccountId':
				this.voucherAction.check([{
					path: 'data.form.payableAccountId', value: form.payableAccountId
				}], this.check);
				break;
		}
	}

	check = (option) => {
		if (!option || !option.path) return
		if (option.path == 'data.form.code') {
			return {errorPath: 'data.other.error.code', message: option.value && option.value.trim() ? (option.value.trim().length > 50 ? '编码最大长度为50个字符' : "") : '请录入编码'}
		} else if (option.path == 'data.form.name') {
			return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : '请录入名称'}
		} else if (option.path == 'data.form.taxNumber') {
			if (option.value) {return { errorPath: 'data.other.error.taxNumber', message: option.value && (option.value.length == 20 || option.value.length == 15 || option.value.length == 18) ? '' : '税号应为15，18或20位' }}
		} else if (option.path == 'data.form.linkman') {
			return {errorPath: 'data.other.error.linkman', message: option.value && option.value.trim().length > 50 ? '联系人最大长度为50个字符' : ""}
		} else if (option.path == 'data.form.contactNumber') {
			return {errorPath: 'data.other.error.contactNumber', message: option.value && option.value.trim().length > 50 ? '联系电话最大长度为50个字符' : ""}
		} else if (option.path == 'data.form.openingBank') {
			return {errorPath: 'data.other.error.openingBank', message: option.value && option.value.trim().length > 50 ? '开户银行最大长度为50个字符' : ""}
		} else if (option.path == 'data.form.bankAccout') {
			return {errorPath: 'data.other.error.bankAccout', message: option.value && option.value.trim().length > 50 ? '账户最大长度为50个字符' : ""}
		} else if (option.path == 'data.form.addressAndTel') {
			return {errorPath: 'data.other.error.addressAndTel', message: option.value && option.value.trim().length > 200 ? '地址及电话最大长度为200个字符' : ""}
		} else if (option.path == 'data.form.remark') {
			return {errorPath: 'data.other.error.remark', message: option.value && option.value.trim().length > 200 ? '备注最大长度为200个字符' : ""}
		}
	}

	fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check)
	}

	//新增科目
	addSubject = async (str) => {
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
		if (ret) {
			let account = await this.webapi.vendor.account(),arg = {}
			arg.glAccounts = account.glAccounts
			arg.addItem = ret
			arg.str = str
			this.injections.reduce('glAccounts', arg)
		}
	}
	//管理分类
	managerItem = async (str) => {
		const ret = await this.metaAction.modal('show', {
			title: '分类设置',
			className: 'app-list-customer-modal',
			wrapClassName: 'card-archive',
			width: 690,
			height: 600,
			okText: '保存',
			bodyStyle: { padding: 24, fontSize: 12 },
			children: this.metaAction.loadApp('app-card-customer-category', {
				store: this.component.props.store,
				baseArchiveType: 3000160002,
			})
		})
		let requestCats = {
			baseArchiveType: 3000160002
		},cats;
		cats =  await this.webapi.vendor.cats(requestCats)
		this.injections.reduce('glCats', cats)

	}
	nameChange =  (name) => {
		this.metaAction.sf('data.form.name',name);
		this.changeCheck('name');
		this.payableAccountChange(name)
	}

	//应付科目随名称变更
	payableAccountChange = (name) => {
		let data = this.metaAction.gf('data').toJS(),
			changeItem = { noChild:false, id: data.form.payableAccountId ? data.form.payableAccountId: ''  },
			saveItem = {
				payableAccount:[],
				payableInAdvanceAccount:[],
				otherPayableAccount:[],
				receivableAccount:[],
				receivableInAdvanceAccount:[],
				otherReceivableAccount:[],
			};
		if(data.other.glAccounts){
			for(let accountIndex = 1; accountIndex < data.other.glAccounts.length; accountIndex++){
				let Item = data.other.glAccounts[accountIndex]
				if(!changeItem.id){
					if(Item.code == 2202){
						changeItem.noChild = true
						changeItem.id = Item.id
					}
				}
				if (Item.name == name) {
					if(Item.code.includes(2202)){
						saveItem.payableAccount.push(Item)
					}else if(Item.code.includes(1123)){
						saveItem.payableInAdvanceAccount.push(Item)
					}else if(Item.code.includes(2241)){
						saveItem.otherPayableAccount.push(Item)
					}else if(Item.code.includes(1122)){
						saveItem.receivableAccount.push(Item)
					}else if(Item.code.includes(2203)){
						saveItem.receivableInAdvanceAccount.push(Item)
					}else if(Item.code.includes(1221)){
						saveItem.otherReceivableAccount.push(Item)
					}
				}
			}
			if(saveItem.payableAccount.length){
				changeItem.id = saveItem.payableAccount[0].id
			}else if(saveItem.payableInAdvanceAccount.length){
				changeItem.id = saveItem.payableInAdvanceAccount[0].id
			}else if(saveItem.otherPayableAccount.length){
				changeItem.id = saveItem.otherPayableAccount[0].id
			}else if(saveItem.receivableAccount.length){
				changeItem.id = saveItem.receivableAccount[0].id
			}else if(saveItem.receivableInAdvanceAccount.length){
				changeItem.id = saveItem.receivableInAdvanceAccount[0].id
			}else if(saveItem.otherReceivableAccount.length){
				changeItem.id = saveItem.otherReceivableAccount[0].id
			}
		}
		this.injections.reduce('payableAccountChange', changeItem.id)
		// this.changeCheck('payableAccountId')
	}

    payableAccountOption = () => {
        const data = this.metaAction.gf('data.other.glAccounts') && this.metaAction.gf('data.other.glAccounts').toJS()
        if (data) {
            return data.map(d => <Option title={d.codeAndName} key={d.id} value={d.id} style={{'font-size': '12px', 'height': '36px', 'line-height': '26px'}}>{d.codeAndName}</Option>)
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
