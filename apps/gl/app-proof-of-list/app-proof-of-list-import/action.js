import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { FormDecorator, LoadingMask } from 'edf-component'
import {fetch, history} from 'edf-utils'


class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
		this.webapi = this.config.webapi
		this.beforeLoad = option.voucherAction.excelbeforeUpload
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        injections.reduce('init', {
            isPop: this.component.props.isPop
        })

        this.load()
    }

    load = async (response) => {
		let props = this.component.props
		this.injections.reduce('load', response)
	}
	
	importTemplate = async () => {
		let res = await this.webapi.beginImport.downloadTemplate()
		if(res){
			history.redirect(res)
			this.metaAction.toast('success', '下载模版成功')
		}
	}

	uploadChange = (info) =>{
		if(!info.file.status) {
            this.metaAction.toast('error', '仅支持上传Excel格式的文件')
            return
        }
		this.metaAction.sf('data.loading', true)
		if (info.file.status === 'done') {
			this.metaAction.sf('data.loading', false)
			if (info.file.response.error && info.file.response.error.message) {
				this.metaAction.toast('error', info.file.response.error.message)
			}else if (info.file.response.result && info.file.response.value) {
				this.injections.reduce('upload', info.file.response.value)
			}
		} else if (info.file.status === 'error') {
			this.metaAction.sf('data.loading', false)
			this.metaAction.toast('error', '上传失败')
		}
	}
	
	getAccessToken = () => {
		let token = fetch.getAccessToken()
		return {token}
	}

    onOk = async () => {
		this.save()
		return false
    }

    save = async () => {
		let file = this.metaAction.gf('data.file'),
			isOk = this.metaAction.gf('data.isOk'),
			year = this.component.props.initData.year,
			period = this.component.props.initData.period
			
	    if(file){
			
			this.metaAction.sf('data.loading', true)
			let fileInfo = {
				fileId: file.toJS().id,
				year,
				period
			}//
			let importAsync = await this.webapi.beginImport.importDocFromExcelAsync(fileInfo),
			asyncStatus,
			ret
			if(importAsync){
				this.timer = setInterval(async () => {
					asyncStatus = await this.webapi.beginImport.getImportDocFromExcelStatus({sequenceNo: importAsync})
					if(asyncStatus && asyncStatus.importState == 'STATUS_RESPONSE'){
						//执行成功
						clearInterval(this.timer)
						this.metaAction.sf('data.loading', false)
						if(asyncStatus.importResponseDto){
							ret = await this.metaAction.modal('confirm', {
								title: '导入反馈',
								width: 360,
								className: 'import-tip',
								content: this.getContent(asyncStatus.importResponseDto)
							})
							if(ret){
								this.component.props.closeModal(true)
							}
						}
					}else if(!asyncStatus){
						clearInterval(this.timer)
						this.metaAction.sf('data.loading', false)
						this.component.props.closeModal(true)
                    }
				},2000)
			}else {
				this.metaAction.sf('data.loading', false)
				return
			}
	    }else{
		    this.metaAction.toast('warning', '请选择文件')
		    return false
		}

	}
	getContent = (res) => {
		return (
			<div>
				<span style={{marginRight:'15px'}}>{`导入成功${res.successCount}张凭证`}</span>
				<span>{`导入失败${res.failCount}张凭证`}</span>
				{
					res.fileDto && res.fileDto.accessUrl?
					<div >请<a onClick={()=> this.redirect(res.fileDto.accessUrl)}>下载错误模板</a>查看提示信息</div>:null
				}
			</div>
		)
    }
    redirect = (url) => {
        history.redirect(url)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({...option, metaAction,voucherAction}),
		ret = {...metaAction,...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}