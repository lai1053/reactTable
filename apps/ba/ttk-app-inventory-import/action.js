import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import config from './config'
import {FormDecorator} from 'edf-component'
import { fetch } from 'edf-utils'
import {Spin, Icon, Input } from 'edf-component'
import { fromJS } from 'immutable'

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
		injections.reduce('init')
		this.load()
	}

	load = async () => {
		// const initPeriod = await this.webapi.initPeriod()
		// if(initPeriod){
		// 	const period = await this.webapi.getInvSetByPeroid({period: initPeriod.thisPeriod})
		// 	if(period){
		// 		this.metaAction.sf('data.other.isGenVoucher', period.isGenVoucher)
		// 	}
		// }
		
	}

	beforeUpload = async (info, infoList) => {
        this.injections.reduce('updateState', 'data.other.isLt3M', false)
        const isLt3M = info.size / 1024 / 1024 < 3
        if (!isLt3M) {
            this.metaAction.toast('warning', '文件内容超出3M，不能导入')
            this.injections.reduce('updateState', 'data.other.isLt3M', true)
            return 
        }
    }

	uploadChange = (info) => {
		const isLt3M = this.metaAction.gf('data.other.isLt3M')
        if (isLt3M) {
            return
        }
		if (!info.file.status) {
			this.metaAction.toast('error', '仅支持上传Excel格式的文件')
			return
		}
		this.metaAction.sf('data.loading', true)
		if (info.file && info.file.status === 'done') {
			this.metaAction.sf('data.loading', false)
			if (info.file.response.error && info.file.response.error.message) {
				this.metaAction.toast('error', info.file.response.error.message)
			} else if (info.file.response.result && info.file.response.value) {
				this.injections.reduce('upload', info.file.response.value)
			}
		} else if (info.file && info.file.status === 'error') {
			this.metaAction.sf('data.loading', false)
			this.metaAction.toast('error', '上传失败')
		}
	}

	getAccessToken = () => {
		let token = fetch.getAccessToken()
		return { token }
	}

	onCancel = () => {
		this.component.props.closeModal()
	}

	onOk = async () => {
		let file = this.metaAction.gf('data.file'), res
		let check = this.metaAction.gf('data.check')
		if(file){
			file = file.toJS()
			if(check){
				res = await this.webapi.importTong(file)
			}else{
				res = await this.webapi.import(file)
			}
			if(res && res.state == 2) {
				const ret = await this.metaAction.modal('confirm',{
					title: '',
					width: 400,
					okText: '下载',
					bodyStyle: { padding: 24, fontSize: 12 },
					content: '导入文件中数据有误，请下载文件查看详情'
				})
				if(ret) {
					window.open(res.fileUrl)
				}
			}else if(res && res.state == 0){
				this.metaAction.toast('success', '导入成功')
				return true
			}else {
				return false
			}
		}
	}

	downLoad = async() => {
		let check = this.metaAction.gf('data.check'), res
		// console.log(check, 'check////////')
		if(check){
			res = await this.webapi.downloadExt()
		}else{
			res = await this.webapi.download()
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