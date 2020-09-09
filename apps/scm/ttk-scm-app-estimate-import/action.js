import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { FormDecorator, LoadingMask } from 'edf-component'
import {fetch, history} from 'edf-utils'
import { trimExt } from 'upath';

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
		if(this.component.props.isMonthlyClosed){
			return this.metaAction.toast('warning', '已经进行过月末结转，不能导入暂估期初')
		}
		// let propertyId = this.component.props.propertyId,
		// rate = this.component.props.rate
		// if(!(propertyId && rate)) {
		// 	return this.metaAction.toast('warning', '请选择列表上具体的存货分类')
		// }
		return this.save()
    }

    save = async () => {
		let file = this.metaAction.gf('data.file'),
			isOk = this.metaAction.gf('data.isOk')
	    if(file){
			this.metaAction.sf('data.loading', true)
			// let propertyId = this.component.props.propertyId,
			// rate = this.component.props.rate

			let fileInfo = {
				id: file.toJS().id
				// propertyId: propertyId ? propertyId : '',
				// rate: rate ? rate : '',
			}
			let res = await this.webapi.beginImport.import(fileInfo)
			this.metaAction.sf('data.loading', false)
		    if(res){
				const ret = await this.metaAction.modal('confirm', {
					title: '导入反馈',
					width: 360,
					className: 'import-tip',
					content: this.getContent(res)
				})
		    }
	    }else{
		    this.metaAction.toast('warning', '请选择文件')
		    return false
	    }
	}
	
	getContent = (res) => {
		console.log(res)
        if(!res.downloadUrl){
            return <div>
                    <p>{`${res.sucessCount}条存货数据`}</p>
                    <p>{`导入成功`}</p>
                </div>
        }else{
            return <div>
                    <p>{`导入失败:`}</p>
                    <a onClick={()=> this.redirect(res.downloadUrl)}>{`请下载失败清单！`}</a>
                    <p>{`具体失败原因，请在失败清单中查看！`}</p>
                    <p>{`修改正确后，再进行导入！`}</p>
                </div>
        }
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