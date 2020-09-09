import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { Button, Upload, Icon, Modal, FormDecorator} from 'edf-component'
import {fetch} from 'edf-utils'
import { LoadingMask } from 'edf-component'

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

        injections.reduce('init')    
    }
    // // 模板点击选择
    // handleOnClick = (item) => {
    //    let value = this.metaAction.gf('data.tagValue')
    //    if (value && value.name == item.name) {
    //         value = null
    //         this.metaAction.sf('data.tagValue', value)
    //    } else {
    //         this.metaAction.sf('data.tagValue', item)
    //    }
    // }
    // 按钮遍历渲染
    // returnButton = (buttonArr) => {
    //     const value = this.metaAction.gf('data.tagValue')
        
    //     const res = buttonArr.map((item) => {
    //         const aboutClass = value && value.name == item.name ? 'app-account-beginbalance-leadin-labelBut2' : 'app-account-beginbalance-leadin-labelBut1'
    //         return <Tag className={aboutClass} onClick={this.handleOnClick.bind(null,item)}>{item.name}</Tag>
    //     })
        
    //     return res
    // }
    getAccessToken = () => {
        let token = fetch.getAccessToken()
		return {token}
	}
    // 动态生成模板
    renderRadioDiv = () => {
        
        const arr = [
            // {label: '用友', chriden: [{type: '1', name: 'T3'}, {type: '2', name: 'T+'}, {type: '3', name: '好会计'}]},
            // {label: '金蝶', chriden: [{type: '4', name: '筋斗云'},{type: '5', name: 'KIS'}]},
            // {label: '金财', chriden: [{type: '0', name: '金财模板'}]}
            {label: '用友', chriden: [{type: '1', name: 'T3'}, {type: '2', name: 'T+'}, {type: '3', name: '好会计'}]},
            {label: '金蝶', chriden: [{type: '4', name: '筋斗云'},{type: '5', name: 'KIS'}]}
        ]
        const newArr = []
        for (let i = 0 ; i< arr.length; i++) {
            
            const res = <div className='app-account-beginbalance-leadin-renderRadioDiv'>
                    <span className='app-account-beginbalance-leadin-labelSpan'>{arr[i].label}</span>{this.returnButton(arr[i].chriden)}
                </div>
            
             newArr.push(res)
        }
        return newArr
    }
    
    // 导入模板
    leadInModle = async () => {
        const data = await this.webapi.exportTemplate()

        this.metaAction.toast('success', '下载成功')
    }

    // beforeUpload = (file) => {
	// 	var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows")
	// 	if(!isWin) return
	// 	let type = file.type
	// 	if(!(type == 'application/vnd.ms-excel'
	// 			|| type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
	// 		LoadingMask.hide()
	// 		return false
	// 	}
    // }
    
    // 渲染选择文件
    renderUpload = () => {
        const file = this.metaAction.gf('data.uploadFile')

        const props = {
            action : 'v1/edf/file/upload',
            headers: {
                token: fetch.getAccessToken()
            },
            showUploadList: false,
            accept:'.xls, .xlsx'
        }
        const originalName = file && file.toJS().originalName
        return(
            // <div style={{margin: '30px 0 10px 15px'}}>
            // <div style={{margin: '30px 0 10px 2px',display:'flex',lineHeight:'30px'}}>
            <div style={{display:'flex',lineHeight:'28px'}}>
                <Upload onChange={this.handleOnChange} {...props} beforeUpload={this.beforeLoad}> 
                    {/* <Button type='primary'>选择文件</Button> */}
                    <span className='app-account-beginbalance-leadin-uploadBut'>{originalName ? '重选文件' : '选择文件'}</span>
                </Upload>
                {/* <Button title={originalName}
                style={{display: originalName ? 'inline-block' : 'none',marginLeft: '15px'}} 
                className='app-account-beginbalance-leadin-fileNameBut'>{originalName}</Button> */}
                <div style={{display: originalName ? 'inline-block' : 'none',marginLeft: '8px', whiteSpace:'nowrap'}} title={originalName}
                // className='app-account-beginbalance-leadin-fileNameBut'><a>{originalName}</a></div>
                className='app-account-beginbalance-leadin-fileNameBut'><span>{originalName}</span></div>
            </div>
        )
    }
   // 上传文件
    handleOnChange = (info) => {
        if(!info.file.status) {
			this.metaAction.toast('error', '仅支持上传Excel格式的文件')
			return
		}
        LoadingMask.show()
        if (info.file.status == 'done') {
            LoadingMask.hide()
            if (info.file.response.result && info.file.response.value) {
                this.metaAction.toast('success', '文件上传成功')
                this.injections.reduce('uploadFile', info.file.response.value)
            }
        } else if (info.file.status === 'error') {
            LoadingMask.hide()
            this.metaAction.toast('warning', '文件上传失败')
        }
    }
    treeChange = async (value,label) => {
        this.metaAction.sf('data.value', value)
        this.metaAction.sf('data.label',label[0])
        this.metaAction.sf('data.disabled', false)
        if(label[0] == '其他'){
            this.metaAction.sf('data.downloadTempShow', true)
        }else{
            this.metaAction.sf('data.downloadTempShow', false)
        }
      
    }
    
    onOk = async () => {
        return await this.save()
    }

    save = async () => {
        const file = this.metaAction.gf('data.uploadFile') && this.metaAction.gf('data.uploadFile').toJS()
        const modleValue = this.metaAction.gf('data.value')
        const obj = {}
        obj.type = Number(modleValue) || 0 //如果没有选择模板 默认就是金财模板 type为0
        obj.fileId = file.id
        obj.isReturnValue = true
        if (obj.fileId) {
            if (obj.type || obj.type == 0) {
                const res = await this.webapi.haveAccountPeriodBegin()
                if (res) {
                   const result = await Modal.confirm({ 
                       content: '已存在期初数据，导入将会覆盖已有数据', 
                       okText: '确定'})
                if (!result) {
                    return false
                } else {
                    return this.sureImport(obj)
                }

                } else {
                   return this.sureImport(obj)
                }
            }
        } else {
            this.metaAction.toast('warning', '请选择文件')
            return false
        }
    }

    sureImport = async (obj) => {
        LoadingMask.show()
        let res = await this.webapi.exportFile(obj)
        LoadingMask.hide()
        if (res == null) {
            this.metaAction.toast('success', '期初数据导入成功')
            return res
        } else if (res.result == false) {
            if (res.error.code == 70001) {
                if (res.error.data) {
                    const file = res.error.data.fileDto
                    const id = file.id
                    const failureCount = res.error.data.failureCount
                    const successCount = res.error.data.successCount

                    const result = await this.tipProp({ id, failureCount, successCount })
                    if (!result && successCount) {
                        this.component.props.callbackAction && this.component.props.callbackAction()
                    }
                }

            } else {
                this.metaAction.toast('error', res.error.message)
            }
            return false
        }
        return res
    }

    tipProp = async (obj) => {
        return await this.down(obj)
    }
    down = async (obj) => {
        const result = await this.metaAction.modal('show', {
            title: <div>导入期初余额提醒</div>,
            width: 400,
            height: 450,
            footer: null,
            closeBack: (back) => {this.closeTip = back},
            children: <div>
                <div style={{display: 'flex'}}>
                    <div style={{marginTop: '10px', marginRight: '10px'}}>
                        <Icon fontFamily='edficon' type='jinggao' style={{ fontSize: '22px', color: '#fa7c63' }} />
                    </div>
                    <div>
                        <div style={{lineHeight: '26px'}}>{`存在导入失败数据，其中导入成功${obj.successCount}条，失败${obj.failureCount}条`}</div>
                        <div style={{lineHeight: '26px'}}>请点击下方的按钮，下载电子表格，根据标识修改后再上传哟~</div>
                    </div>
                </div>
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <Button type='primary' className='app-account-beginbalance-leadin-subButton' onClick={this.handlerDownLoad.bind(null, obj.id)}>下载并完善</Button>
                </div>
            </div>
        })
    }

    handlerDownLoad = (id) => {
        const obj = {}
        obj.id = id
        this.webapi.downLoadFile(obj)
        this.closeTip()
    }
    
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
	    voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({...option, metaAction,voucherAction}),
        ret = {...metaAction,...voucherAction, ...o }

    metaAction.config({metaHandlers: ret})

    return ret
}