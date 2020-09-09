import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { fetch, environment } from 'edf-utils'
import { fromJS, toJS } from 'immutable'
import { LoadingMask, Icon } from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        // 导出下载所需两个字段
        this.exportCompanyName = this.component.props.exportCompanyName
        this.periodDate = this.component.props.periodDate
        // console.log(this.component.props.okCallback)
        // console.log(this.component.props.setOkListener)
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(() => {
                // console.log('&&&&&&&&&&&',this.component.props.okCallback)
                this.component.props.okCallback && this.component.props.okCallback()
                return 'hahahhah'
            })  
        }

        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
            // this.component.props.setCancelLister(()=>{
            //     this.component.props.cancelCallback && this.component.props.cancelCallback()
            // })
        }
    }
    btnClick = () => {
        this.injections.reduce('modifyContent')
    }
    tooMuchData = () => {
        this.metaAction.modal('show', {
            width: 220,
            className: "ttk-stock-inventory-earlyStage-import-card-export-toast",
            footer: '',
			children: (
                <div className="ttk-stock-inventory-earlyStage-import-card-export-toast-div">
                    <div className="ttk-stock-inventory-earlyStage-import-card-export-toast-img"></div>
                    <div style={{ verticalAlign: 'middle',display:"inline-block" }}>导出文件过大，请稍等</div>
                </div>
            ),
        }, 100)
    }
    export = async() => {
        const obj = {
            guiGe: this.exportCompanyName,
            period: this.periodDate
        }
        await this.webapi.operation.export(obj)
        // LoadingMask.show()
        // if(response) {
        //     LoadingMask.hide()
        //     this.metaAction.toast('success', '导出成功')
        // }
        // if(response && flag) {
        //     let node = document.querySelector('.ttk-stock-inventory-earlyStage-import-card-export-toast').parentNode.parentNode
        //     node.parentNode.removeChild(node)
        // }
    }
    onCancel = async() => {
        this.component.props.closeModal && this.component.props.closeModal()
    }
    onOk = async() => {
        let file = this.metaAction.gf('data.file').toJS(), res
		if (file) {
            res = await this.webapi.operation.importQc({
                id: file.id,         //文件流对象id
                period: this.periodDate
            })
            if (res && res.stateCode == 1) {
                const ret = await this.metaAction.modal('confirm', {
                    width: 380,
                    className: "",
                    footer: '',
                    content: (
                        <div>导入文件中数据有误，请下载文件查看详情</div>
                    ),
                    okText: "下载",
                }, 100)
                if (ret) {
                    window.open(res.message)
                }
            } else if (res && res.stateCode == 0) {
                this.component.props.closeModal(res)
                this.metaAction.toast('success', '导入成功')
            } else {
                this.metaAction.toast('error', '导入失败')
            }
        }
	}
    // 上传必须发送的token
    getAccessToken = () => {
        let token = fetch.getAccessToken()
        return {
            token
        }
    }
    // 文件改变触发的回调
    uploadChange = (info) => {
        const file = info.file              
        if (!file.status) return
        if (!this.metaAction.gf('data.canUpload')) return
        if (file.status === 'done') {
            this.metaAction.sf('data.loading', false)
            const response = file.response
            if (response.error && response.error.message) {
                this.metaAction.toast('error', response.error.message)
            } else if (response.result && response.value) {
                this.metaAction.sf('data.file', fromJS(response.value))
                this.metaAction.sf('data.originalName', fromJS(response.value.originalName))
            }
        } else if (info.file.status === 'error') {
            this.metaAction.toast('error', '上传失败')
        }
    }
    // 上传文件前的回调
    beforeUpload = async(file) => {
        let isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows") || (navigator.platform == "MacIntel" && navigator.userAgent.toLowerCase().indexOf('chrome') < 0)
        if (!isWin) return
        let type = file.type ? file.type : 'application/vnd.ms-excel'
        let mode = file.name.substr(file.name.length - 4, 4)
        if (!(type == 'application/vnd.ms-excel'
            || type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mode.indexOf('xls') > -1)) {
            if (LoadingMask) {
                LoadingMask.hide()
            }    
            this.metaAction.modal('error',{
                okText:'确定',
                content:'当前系统仅支持Excel格式（xls  xlsx），请检查后重新导入！'
            })
            return false
        }
        this.fileSizeJudge(file)       
    }
    // 校验文件大小
    fileSizeJudge = async(file) => {
        const isLt3M = file.size / 1024 / 1024 > 3;
        if (file.size && isLt3M) {
            this.metaAction.sf('data.canUpload', false)
            await this.metaAction.modal('info', {
                title: '导入',
                className: '',
                okText: '确定',
                content: (
                    <div>导入文件过大，请分拆后再导入。</div>
                )
            })
            return false
        }
        this.metaAction.sf('data.canUpload', true)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

