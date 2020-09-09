import React from 'react'
import { Upload, Input, Button, Icon } from 'edf-component'
import { fetch } from 'edf-utils'

class Pingzhenghebing  extends React.PureComponent{
    constructor(props){
        super(props)
        this.state = {
            file: '',
        }
        this.props = props
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.period = props.importObj.period || ''
        this.operator = props.importObj.operator || ''
        props.setOkListener(this.onOk)
    }

    export = async() => {
        await this.webapi.operation.export()
    }
    onCancel = async() => {
        this.component.props.closeModal && this.component.props.closeModal()
    }
    onOk = async() => {
        let { file } = this.state, res
		if (file) {
            res = await this.webapi.operation.import({
                period: this.period,
                fileId: file.id,                          // 文件ID（必传）
                fileName: file.originalName,                  // 文件名（必传）
                fileSize: file.size,                        // 文件大小（必传）
                operator: this.operator                    // 制单人（必传）    
            })
            // console.log("ressss", res)
            if (res && res.uploadSuccess == 0) {
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
                    window.open(res.fileUrlWithFailInfo)
                }
            } else if (res && res.uploadSuccess == 1) {
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
        if (!this.state.canUpload) return
        if (file.status === 'done') {
            this.setState({
                loading: false
            })
            const response = file.response
            if (response.error && response.error.message) {
                this.metaAction.toast('error', response.error.message)
            } else if (response.result && response.value) {
                this.setState({
                    file: response.value
                })
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
        const isLt3M = file.size / 1024 / 1024 > 3
        if (file.size && isLt3M) {
            // this.metaAction.sf('data.canUpload', false)
            this.setState({canUpload: false})
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
        this.setState({
            canUpload: true
        })
    }

    render () {
        const { file } = this.state
        return (
            <div style={{padding: '25px 30px 60px'}}>
                <div className='drxxckd-top' style={{marginBottom: '10px', paddingLeft: '112px'}}>
                    <span className='downloadSpan' onClick={this.export}>
                        {/* <Icon type='download' className='downloadSpanIcon'></Icon> */}
                    </span>
                    下载导入模板
                </div>
                <div className='drxxckd-center' style={{lineHeight: '30px'}}>
                    <span className='' style={{verticalAlign: "middle"}}>
                        请选择导入文件：
                    </span>
                    <Input className='drxxckd-center-input' placeholder='请选择文件' value={file && file.originalName}></Input>
                    <Upload
                        showUploadList={false}
                        action='/v1/edf/file/upload'
                        headers={this.getAccessToken()}
                        onChange={this.uploadChange}
                        beforeUpload={this.beforeUpload}
                        accept='.xls, .xlsx'
                        style={{verticalAlign: "middle"}}
                    >
                        <Button className='drxxckd-center-button' type='primary'>选择文件</Button>
                    </Upload>
                </div> 
            </div>            
        )
    }
}

export default Pingzhenghebing