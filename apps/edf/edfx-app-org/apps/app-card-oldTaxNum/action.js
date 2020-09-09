import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'
import debounce from 'lodash.debounce'

import {FormDecorator} from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
        this.changeCheck = debounce(this.changeCheck, 800);
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
        if(this.component.props.oldTaxNum) this.injections.reduce('load', this.component.props.oldTaxNum)
	}

	onOk = async () => {
        const oldTaxNum = this.metaAction.gf('data.form.oldTaxNum')
        // const ok = await this.voucherAction.check([{
        //     path: 'data.form.oldTaxNum', value: oldTaxNum
        // }], this.check)
        //
        // if (!ok) {
        //     return false
        // }
        if(oldTaxNum && String(this.component.props.vatTaxpayerNum).substr(2,15) != oldTaxNum) {
            const ret = await this.metaAction.modal('confirm', {
                title: '提示',
                content: `您录入的旧税号为${oldTaxNum}，采集发票时，将按照旧税号+纳税人识别号采集，是否确定修改旧税号?`
            })
            if (ret) {
                return this.metaAction.gf('data.form.oldTaxNum')
            }else{
                return false
            }
        }else {
            return this.metaAction.gf('data.form.oldTaxNum')
        }
	}

	changeCheck = (str) => {
		const oldTaxNum = this.metaAction.gf('data.form.oldTaxNum')
		switch (str){
			case 'oldTaxNum':
				this.voucherAction.check([{
					path: 'data.form.oldTaxNum', value: oldTaxNum
				}], this.check);
				break;
		}
	}

	check = async (option) => {
		if (!option || !option.path) return
		if (option.path == 'data.form.oldTaxNum') {
            let oldTaxNum = option.value && option.value.trim()
            if (!oldTaxNum) {
                return { errorPath: 'data.error.oldTaxNum', undefined }
            }
            if(String(this.component.props.vatTaxpayerNum).substr(2,15) != oldTaxNum){
                return { errorPath: 'data.error.oldTaxNum', message: '旧税号与纳税人识别号不相符，无法保存' }
            }
            return { errorPath: 'data.error.oldTaxNum', undefined }
		}
	}

	fieldChange = (path, value) => {
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
