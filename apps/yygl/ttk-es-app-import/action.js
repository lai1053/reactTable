import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import config from './config'
import {FormDecorator, LoadingMask} from 'edf-component';
import {fetch} from 'edf-utils'
import throttle from 'lodash.throttle'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
		this.beforeLoad = option.voucherAction.excelbeforeUpload
		this.onOkThrottle = throttle(this.onOk,2000,{
            leading: true,
            trailing: false
        })
	}

	onInit = ({component, injections}) => {
		this.component = component
		this.injections = injections
		this.path = this.component.props.path
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOkThrottle)
		}
		injections.reduce('init', {
			isPop: this.component.props.isPop
		})
	}

	importTemplate = async () => {
		let path = '/v1/yygl/khzl/download', res = await this.webapi.customerImport.exporttemplate(path)
		if (res) {
			this.metaAction.toast('success', '下载模版成功')
		}
	}

	uploadChange = (info) => {
		if (!info.file.status) {
			this.metaAction.toast('error', '仅支持上传Excel格式的文件')
			return
		}
		LoadingMask.show()
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
			let path = '/v1/yygl/khzl/importNew';
			let res = await this.webapi.customerImport.import(path,file.toJS())
			if(res){
                return res
			}else{
				return false
			}
			// debugger
			/*if (res.state == 0) {
				this.metaAction.toast('success', `导入成功`)
				return res
			} else if ((res.state == 1)) {
				this.metaAction.toast('warning', res.exceptionMessage)
				return false
			} else if ((res.state == 2)) {
				this.injections.reduce('downUrl', res.exceptionData)
				this.metaAction.toast('warning', res.exceptionMessage)
				return false
			}else if((res.state == 3)){
				let rr = await this.webapi.customerImport.getImportAsyncStatus({ sequenceNo: res.orgId }, 5000)
				let result_b = false;
				let e_msg = "导入失败！";
				if (rr) {
					if(rr[0]){
						if(rr[0].error){
							if(rr[0].error==''){
								result_b =true;
							}else{
								e_msg = rr[0].error
							}
						}
					}else{
						result_b =true;
					}
				}
				if(!result_b){
					this.injections.reduce('downUrl', res.exceptionData)
					this.metaAction.sf('data.url',res.exceptionData)
					this.metaAction.toast('warning', e_msg)
				}
				return result_b
			}*/
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
