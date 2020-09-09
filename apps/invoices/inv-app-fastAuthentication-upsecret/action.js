import React from 'react'
import {
    action as MetaAction
} from 'edf-meta-engine'
import config from './config'
import {
    FormDecorator
} from 'edf-component'
import {
    fetch
} from 'edf-utils'


class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.beforeLoad = option.voucherAction.excelbeforeUpload
    }

    onInit = ({
        component,
        injections
    }) => {
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        injections.reduce('init', {
            isPop: this.component.props.isPop
        })

        //this.load()
    }

    load = async () => {}

    importTemplate = async () => {
        let res = await this.webapi.assetImport.exporttemplate()
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
            this.metaAction.toast('error', '仅支持上传.dat格式的文件')
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
        return {
            token
        }

    }

    onOk = async () => {
        let file = this.metaAction.gf('data.file')
        if (file !== '') {
            return await this.save()
        } else {
            this.metaAction.toast('warning', '请选择文件')
            return false
        }


    }

    save = async () => {
        let file = this.metaAction.gf('data.file').toJS(),
            isOk = this.metaAction.gf('data.isOk')
        if (file) {
            if (!isOk) {
                // this.metaAction.sf('data.isOk', true)
                return false
            }

            this.metaAction.sf('data.isOk', false)
            this.metaAction.sf('data.loading', true)
            // file = file.toJS()
            // file.isReturnValue = true
            let res = await this.webapi.assetImport.import({
                fileId: file.id,
                fileName: file.originalName
            })
            this.metaAction.sf('data.loading', false);
            if (res) {
                this.metaAction.toast('success', '上传成功!')
                this.metaAction.sf('data.isOk', true)
                //return res
                this.component.props.queryGxfpList()
                return {
                    ret: res,
                    file
                };

            }

            // if (res) {
            // 	if (!res.successCount) res.successCount = 0
            // 	if (!res.errorCount) res.errorCount = 0
            // 	if (!res.successDrafCount) res.successDrafCount = 0

            // 	if (res.successDrafCount || res.errorCount) {
            // 		const ret = await this.metaAction.modal('confirm', {
            // 			title: '导入提示',
            // 			className: 'import-tip',
            // 			width: 360,
            // 			content: this.getContent(res)
            // 		})
            // 	} else if (res.successCount == 0 && res.errorCount == 0 && res.successDrafCount == 0 && res.erro && res.erro[1]) {
            // 		this.metaAction.toast('warning', res.erro[1])
            // 		this.metaAction.sf('data.isOk', true)
            // 		return false
            // 	} else {
            // 		this.metaAction.toast('success', `导入成功!`)
            // 		this.metaAction.sf('data.isOk', true)
            // 		return res
            // 	}
            // }


        } else {
            this.metaAction.toast('warning', '请选择文件')
            return false
        }
    }

    // getContent = (res) => {
    // 	return <div>
    // 		<p> {
    // 			`1.导入成功${res.successCount + res.successDrafCount}条，其中正常状态${res.successCount}条`
    // 		} </p>
    // 		<p> {
    // 			`2.草稿状态${res.successDrafCount}条，请在卡片上完善`
    // 		} < /p> <
    // 	p > {
    // 					res.errorCount ? `3.导入失败${res.errorCount}条，请完善必填信息` : `3.导入失败${res.errorCount}条`
    // 				} < /p> < /
    // 		div >
    // 		}
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({
            ...option,
            metaAction
        }),
        o = new action({
            ...option,
            metaAction,
            voucherAction
        }),
        ret = {
            ...metaAction,
            ...voucherAction,
            ...o
        }

    metaAction.config({
        metaHandlers: ret
    })

    return ret
}