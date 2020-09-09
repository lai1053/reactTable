import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { FormDecorator, LoadingMask } from 'edf-component'
import { fetch } from 'edf-utils'
import { bankaccount } from '../../ba/app-card-bankaccount/webapi'
import { trimExt } from 'upath';

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
		this.voucherAction = option.voucherAction
		this.beforeLoad = option.voucherAction.excelbeforeUpload
	}

	onInit = ({ component, injections }) => {
		this.component = component
		this.injections = injections
		this.voucherAction.onInit({ component, injections })

		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}

		injections.reduce('init')

		this.load()
	}

	load = async () => {
		let obj = {}
		if(this.component.props.accountlist){
			obj['data.accountList'] = this.component.props.accountlist
		}
		if (this.component.props.main && this.component.props.main.warn) {
			obj['data.message'] = this.component.props.main.warn
		}
		if (this.component.props.main && this.component.props.main.other) {
			obj['data.other'] = this.component.props.main.other
		}
		if(this.component.props.fileAccount){
			obj['data.account'] = this.component.props.fileAccount
		}
		this.injections.reduce('load', obj)
	}

	importTemplate = async () => {
		let res = await this.component.props.exporttemplate()
		if (res) {
			this.metaAction.toast('success', '下载模版成功')
		}
	}

	// 	beforeUpload = (file) => {
	//         var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows")
	//         if(!isWin) return
	//         let type = file.type
	//         if(!(type == 'application/vnd.ms-excel'
	//                 || type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
	//             LoadingMask.hide()
	//             return false
	//         }
	// 	}

	uploadChange = (info) => {
		if (!info.file.status) {
			this.metaAction.toast('error', '仅支持上传Excel格式的文件')
			return
		}
		this.metaAction.sf('data.loading', true)
		if (info.file.status === 'done') {
			this.metaAction.sf('data.loading', false)
			if (info.file.response.error && info.file.response.error.message) {
				this.metaAction.toast('error', info.file.response.error.message)
			} else if (info.file.response.result && info.file.response.value) {
				this.injections.reduce('upload', info.file.response.value)
			}
		} else if (info.file.status === 'error') {
			this.metaAction.sf('data.loading', false)
			this.metaAction.toast('error', '上传失败')
		}
	}

	getAccessToken = () => {
		let token = fetch.getAccessToken()
		return { token }
	}

	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		let file = this.metaAction.gf('data.file'),
			isOk = this.metaAction.gf('data.isOk')
		if (file) {
			if (!isOk) {
				// this.metaAction.sf('data.isOk', true)
				return false
			}
			let account = this.metaAction.gf('data.account')

			this.metaAction.sf('data.isOk', false)
			this.metaAction.sf('data.loading', true)
			// file = file.toJS()
			// file.isReturnValue = true
			let response = await this.component.props.imports(file, account)
			this.metaAction.sf('data.loading', false)
			this.metaAction.sf('data.isOk', true)

			if (response) {
				if(this.component.props.statement){
					if(response.error){
						this.metaAction.toast('error', response.error.message)
						return false
					}
					if(response.fail && response.fail.length){
						this.metaAction.toast('warning', this.getContent(response))
					}else{
						this.metaAction.toast('success', `导入成功`)
					}
				}else{
					if (!response.successCount) response.successCount = 0
					if (!response.errorCount) response.errorCount = 0
	
					if (response.exceptionCode && response.exceptionCode == '50030') {
						this.metaAction.toast('warning', response.exceptionMessage)
						return false
					} else if (response.error) {
						this.metaAction.toast('warning', response.error.message)
						return false
					} else {
	
						if (response.errorCount == 0) {
							this.metaAction.toast('success', `导入成功`)
						} else {
							this.metaAction.toast('success', this.getContent(response))
						}
						return response
					}
				}
			}

		} else {
			this.metaAction.toast('warning', '请选择文件')
			return false
		}
	}

	getContent = (res) => {
		if(this.component.props.statement&&res.fail&&res.fail.length){
			return <div style={{ textAlign: 'left' }}>
				{
					res.fail.map(item => {
						return <p style={{ marginBottom: '0' }}>{item.message}</p>
					})
				}
			</div>
		}
		return <div style={{ textAlign: 'left', display: 'inline-block', verticalAlign: 'top' }}>
			<p style={{ marginBottom: '0' }}>{`1.导入成功${res.successCount}条`}</p>
			<p style={{ marginBottom: '0' }}>{`2.导入失败${res.errorCount}条`}</p>
		</div>
	}

	accountChange = (path, value) => {
		this.injections.reduce('accountChange', path, value)
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, voucherAction }),
		ret = { ...metaAction, ...voucherAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}