import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import config from './config'
import { FormDecorator, LoadingMask } from 'edf-component';
import { fetch } from 'edf-utils'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
		this.beforeLoad = option.voucherAction.excelbeforeUpload
	}

	onInit = ({component, injections}) => {
		this.component = component
		this.injections = injections
		this.path = this.component.props.path
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		injections.reduce('init', {
			isPop: this.component.props.isPop
		})
	}

	importTemplate = async() => {
		let path = this.path, res = await this.webapi.assetImport.exporttemplate(path)
		if (res) {
			this.metaAction.toast('success', '下载模版成功')
		}
	}

	uploadChange = (info) => {
		if (!info.file.status) {
			this.metaAction.toast('error', '仅支持上传Excel格式的文件')
			return
		}
		//LoadingMask.show()
		if (info.file.status === 'done') {
			LoadingMask.hide()
			if (info.file.response.error && info.file.response.error.message) {
				this.metaAction.toast('error', info.file.response.error.message)
			} else if (info.file.response.result && info.file.response.value) {
				this.injections.reduce('upload', info.file.response.value)
			}
		} else if (info.file.status === 'error') {
			LoadingMask.hide()
			this.metaAction.toast('error', '上传失败')
		}
	}

	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		let file = this.metaAction.gf('data.file')
		if (file) {
			let path = this.path, res = await this.webapi.assetImport.import(path,file.toJS())
			if (res.state == 0) {
				this.metaAction.toast('success', `导入成功`)
				return res
			} else if ((res.state == 1)) {
				this.metaAction.toast('warning', res.exceptionMessage)
				return false
			} else if ((res.state == 2)) {
				this.injections.reduce('downUrl', res.exceptionData)
				this.metaAction.toast('warning', res.exceptionMessage)
				return false
			}
		} else {
			this.metaAction.toast('warning', '请选择文件')
			return false
		}
	}
	getAccessToken = () => {
		let token = fetch.getAccessToken()
		return {token: token}
	}
	downloadTemplate = () => {
		let url = this.metaAction.gf('data.url')
		window.open(url)
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
