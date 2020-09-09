import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import {Card, Button} from 'edf-component'
import {consts} from 'edf-consts'
import {FormDecorator} from 'edf-component'
import moment from 'moment'
import { date, number } from 'edf-utils'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.voucherAction = option.voucherAction
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({component, injections})
        this.component = component
        this.injections = injections
        injections.reduce('init')
        if(this.component.props.initData) {
            this.init(this.component.props.initData)
        }else {
            this.load()
        }
        
    }

    init = async (id) => {
        this.metaAction.sf('data.loading', true)
        const response = await this.webapi.queryById({id: id})
        this.metaAction.sf('data.loading', false)
        if(response) {
            let {enableDate, bankTransfer, bankAccountList} = response
            let {businessDate, code, bankAccountId, inBankAccountId, amount, remark} = bankTransfer
            let data = this.metaAction.gf('data').toJS()
            let { form, other } = data
            other.accountList = bankAccountList
            other.disabledDate = date.transformMomentDate(enableDate)
            form.code = code
            form.businessDate = date.transformMomentDate(businessDate)
            form.bankAccountId = bankAccountId
            form.inBankAccountId = inBankAccountId
            form.amount = amount
            form.remark = remark
            data.form = form
            data.other = other
            data.oldData = bankTransfer
            data.other.type = 'edit'
            this.injections.reduce('load', data)
        }
    }

    load = async () => {
        this.metaAction.sf('data.loading', true)
        const response = await this.webapi.init()
        this.metaAction.sf('data.loading', false)
        if(response) {
            let bankAccountId = this.component.props.bankAccountId
            let {enableDate, code, bankAccountList, systemDate, defaultAccount} = response
            let data = this.metaAction.gf('data').toJS()
            let { form, other } = data

            let contextDate = systemDate,
                currentOrg = this.metaAction.context.get("currentOrg")
            if(currentOrg.periodDate){
                contextDate = moment(currentOrg.periodDate).endOf('month')
            }

            other.accountList = bankAccountList
            other.disabledDate = date.transformMomentDate(enableDate)
            form.code = code
            form.businessDate = date.transformMomentDate(contextDate)
            form.bankAccountId = bankAccountId ? bankAccountId : defaultAccount.id
            form.inBankAccountId = ''
            form.amount = ''
            form.remark = ''
            data.form = form
            data.other = other
            data.oldData = undefined
            this.injections.reduce('load', data)
        }
    }

    check = (option) => {
		if (!option || !option.path)
			return
		if (option.path == 'data.form.inBankAccountId') {
			return {errorPath: 'data.other.error.inBankAccount', message: option.value ? '' : '请选择转入账户'}
		}
		else if (option.path == 'data.form.amount') {
            let message
            if(option.value && (option.value != 0.00 || option.value != 0)) {
                message = ''
                if(number.clearThousPos(option.value)>9999999999.99) {
                    message = '金额不能大于9,999,999,999.99'
                }else if(number.clearThousPos(option.value)<0){
                    message = '请录入大于0的金额'
                }
            }else {
                message = '请录入金额'
            }
			return {errorPath: 'data.other.error.amount', message: message}
		}
    }
    
    addAccount = async (type) => {
        const ret = await this.metaAction.modal('show', {
			title: '账户',
			width: 400,
			children: this.metaAction.loadApp('app-card-bankaccount', {
				store: this.component.props.store
			}),
		})
		if (ret) {
			this.injections.reduce("addAccount", ret, type)
		}
    }

    fieldChange = async(path, value) => {
        await this.voucherAction.fieldChange(path, value, this.check)
        if(path == 'data.form.inBankAccountId' || path == 'data.form.bankAccountId') {
            let {inBankAccountId, bankAccountId} = this.metaAction.gf('data.form').toJS()
            let accountList = this.metaAction.gf('data.other.accountList').toJS(),
                remark = this.metaAction.gf('data.form.remark')
            let id = accountList.filter((item) => {return item.bankAccountTypeId == consts.BANKACCOUNTTYPE_cash})[0].id

            if(remark && remark !== '提现' && remark !== '存现' && remark !== '内部转账') return
            
            if(inBankAccountId == id) {
                this.metaAction.sf('data.form.remark', '提现')
            }else if(bankAccountId == id) {
                this.metaAction.sf('data.form.remark', '存现')        
            }else if(inBankAccountId) {
                this.metaAction.sf('data.form.remark', '内部转账')
            }
        }
        
    }

    //取消
    cancel = () => {
        let isSaveAndNew = this.metaAction.gf('data.other.isSaveAndNew'), option = false
        if(isSaveAndNew) option = true
        this.component.props.closeModal(option)
    }

    //保存
    save = async(e, type) => {
        let isEnable = this.metaAction.gf('data.other.isEnable')
        if(isEnable) {
            this.component.props.closeModal(false)
            return
        }

        if(this.metaAction.gf('data.loading')) return
        let option = {...this.metaAction.gf('data.form').toJS()}
        option.businessDate = option.businessDate.format('YYYY-MM-DD')
        
        const ok = await this.voucherAction.check([{
			path: 'data.form.inBankAccountId', value: option.inBankAccountId
		}, {
			path: 'data.form.amount', value: option.amount
        }], this.check)
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			return false
        }
        if(option.inBankAccountId == option.bankAccountId) {
            this.metaAction.toast('warning', '转出账户与转入账户不能相同')
			return false
        }
        option.amount = number.clearThousPos(option.amount)
      
        this.create(option, type)
    }

    amountValue = (path, value) => {
        if(path == 'data.form.amount' && value>9999999999.99) {
            value = 99999999999.99
            this.metaAction.toast('warning', '金额不能大于9,999,999,999.99，请调整')
            this.metaAction.sf('data.other.error.amount', '金额过大')
        }else if(path == 'data.form.amount' && value && value != 0) {
            this.metaAction.sf('data.other.error.amount', '')
        }else if(path == 'data.form.amount' && value && value < 0) {
            this.metaAction.sf('data.other.error.amount', '请录入大于0的金额')
        }else {
            this.metaAction.sf('data.other.error.amount', '请录入金额')
        }
        this.amountFieldChange(path, value)
    }

    create = async(option, type) => {
        let response
        if(this.metaAction.gf('data.oldData')){
            let oldData = this.metaAction.gf('data.oldData').toJS()
            option.id = oldData.id
            option.ts = oldData.ts
            response = await this.webapi.update(option)
        }else{
            response = await this.webapi.create(option)
        }
        if(response) {
            if(!!type) {
                this.metaAction.sf('data.other.isSaveAndNew', true)
                this.load()
                //this.component.props.loadList()
            }else {
                this.component.props.closeModal(true)
            }
        }
    }

    //添加千分位
	addThousandsPosition = (value) => {
        if(!Number(value)) return value
        value = (value).toFixed(2)
		let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g
		return value.replace(regex, "$1,")
    }
    
    amountFieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check)
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