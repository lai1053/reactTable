import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import config from './config'
import {FormDecorator} from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.voucherAction = option.voucherAction
		this.webapi = this.config.webapi
	}

	onInit = ({component, injections}) => {
		this.voucherAction.onInit({component, injections})
		this.component = component
		this.injections = injections
		this.clickStatus = false
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		injections.reduce('init', {
			isPop: this.component.props.isPop
		})
		this.load()
	}

	load = async () => {
		let data = {}, response = '', code, account, currentOrg = this.metaAction.context.get("currentOrg")
		let accountAttr =  this.webapi.bankaccount.accountAttr()
		if (this.component.props.bankAccountTypeId) {
			let bankAccountTypeId = this.component.props.bankAccountTypeId
			this.metaAction.sf('data.form.bankAccountType', accountAttr.filter(function(data){return data.id == bankAccountTypeId})[0])
		}
		if (this.component.props.personId || this.component.props.personId === 0) {
			response = this.webapi.bankaccount.query(this.component.props.personId)
		} else {
			code = this.webapi.bankaccount.getCode()
		}
		let haveMonthlyClosing = this.webapi.bankaccount.haveMonthlyClosing({})
        account = await this.webapi.bankaccount.account()
		data.haveMonthlyClosing = await haveMonthlyClosing
        if (await accountAttr)data.accountAttr = await accountAttr
		if (await code) data.code = await code
		if (await response) data.response = await response
        if (await account && account.glAccounts) data.glAccounts = await account.glAccounts
		data.enabledTime = currentOrg.enabledYear + '-' + currentOrg.enabledMonth
		this.injections.reduce('load', data)
	}

	onOk = async () => {
		return await this.save()
	}
	updateDisabled = () => {
		let status = false
		if (this.component.props.personId || this.component.props.personId === 0) {
			status = true
		}
		return status
	}

	save = async () => {
		if (this.clickStatus) return
		this.clickStatus = true
		const form = this.metaAction.gf('data.form').toJS(),
			{id} = this.component.props,
			ok = await this.voucherAction.check([{
				path: 'data.form.bankAccountType', value: form.bankAccountType
			}, {
				path: 'data.form.code', value: form.code
			}, {
				path: 'data.form.name', value: form.name
			}, {
				path: 'data.form.beginningBalance', value: form.beginningBalance
			}, {
				path: 'data.form.accountId', value: form.accountId
			}], this.check)
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}
		let response, option = {
			bankAccountTypeId: form.bankAccountType.id,
			isDefault: form.isDefault,
			isEnable: form.isEnable
		}
		option.code = form.code ? form.code.trim() : ''
		option.name = form.name ? form.name.trim() : ''
		option.bankName = form.bankName ? form.bankName : ''
		option.ts = form.ts ? form.ts : ''
        option.accountId = form.accountId ? form.accountId : ''
		option.beginningBalance = (form.beginningBalance || form.beginningBalance == 0 || form.beginningBalance == '') ? form.beginningBalance : ''
		if (form.bankAccountType) delete form.bankAccountType
		option.isReturnValue = true
		option.isLoadingDefaultAccount = false
		if (this.component.props.personId || this.component.props.personId === 0) {
			option.id = this.component.props.personId
			response = await this.webapi.bankaccount.update(option)
		} else {
			response = await this.webapi.bankaccount.create(option)
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
		}
	}

	check = (option) => {
        const form = this.metaAction.gf('data.form').toJS()
		if (!option || !option.path) return
		if (option.path == 'data.form.bankAccountType') {
			return {
				errorPath: 'data.other.error.bankAccountType',
				message: option.value && option.value.id ? '' : '请录入账户类型'
			}
		} else if (option.path == 'data.form.code') {
			return {errorPath: 'data.other.error.code', message: option.value && option.value.trim() ? (option.value.trim().length > 50 ? '编码最大长度为50个字符' : "") : '请录入编码'}
		} else if (option.path == 'data.form.name') {
			return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '名称最大长度为100个字符' : "") : '请录入名称'}
		} else if (option.path == 'data.form.beginningBalance') {
			if (option.value) {
				return {
					errorPath: 'data.other.error.beginningBalance',
					message: option.value > 999999999999.999999 || option.value < -999999999999.999999 ? '最大整数位为12位' : ''
				}
			}
		} else if (option.path == 'data.form.accountId') {
            // if(form.bankAccountType && form.bankAccountType.id && form.bankAccountType.id == 3000050002){
                return {
                    errorPath: 'data.other.error.accountId',
                    message: option.value ? '' : '请选择对应科目'
                }
            // }
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
            let account = await this.webapi.bankaccount.account(),
                arg = {},
                code = await this.webapi.bankaccount.getCode()
            arg.glAccounts = account.glAccounts
            arg.addItem = ret
            arg.str = str
            this.injections.reduce('glAccounts', arg)
            this.injections.reduce('codeChange', code)
            this.beginningBalance(ret.id)
        }
    }

    subjectListOption = () => {
        const data = this.metaAction.gf('data.other.glAccounts') && this.metaAction.gf('data.other.glAccounts').toJS()

        if (data) {
            return data.map(d => <Option title={d.code+' '+d.name} key={d.id} value={d.id} style={{'font-size': '12px', 'height': '36px', 'line-height': '26px'}}>{d.code+' '+d.name}</Option>)
        }
    }

    beginningBalance = async (id) => {
        let  getAccountBeginBalance = await this.webapi.bankaccount.getAccountBeginBalance({accountId: id})
        this.injections.reduce('beginningBalance', getAccountBeginBalance)
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
