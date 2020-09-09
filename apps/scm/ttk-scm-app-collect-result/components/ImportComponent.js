import React from 'react'
import { Spin, Upload } from 'edf-component'
import moment from 'moment'
import {fetch} from 'edf-utils'

class ImportComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            isOk: true,
            file:null,
            fileName:null
        }
    }

    importTemplate(){
		// let res = await this.webapi.assetImport.exporttemplate()
		// if(res){
		// 	this.metaAction.toast('success', '下载模版成功')
        // }
        alert('下载成功')
    }

    onOk = async () => {
        return await this.save()
    }
    beforeLoad(){
        this.props.beforeLoad()
    }
    save = async () => {
		let file = this.metaAction.gf('data.file'),
			isOk = this.metaAction.gf('data.isOk')
	    if(file){
			if(!isOk) {
				// this.metaAction.sf('data.isOk', true)
				return false
			}

			this.metaAction.sf('data.isOk', false)
			this.metaAction.sf('data.loading', true)
			// file = file.toJS()
			// file.isReturnValue = true
		    let res = await this.webapi.assetImport.import(file.toJS())
			this.metaAction.sf('data.loading', false)

		    if(res){
				if(!res.successCount) res.successCount = 0
				if(!res.errorCount) res.errorCount = 0
				if(!res.successDrafCount) res.successDrafCount = 0

				if(res.successDrafCount || res.errorCount) {
					const ret = await this.metaAction.modal('confirm', {
						title: '导入提示',
						className: 'import-tip',
						content: this.getContent(res)
					})
				}else if(res.successCount == 0 && res.errorCount == 0 && res.successDrafCount == 0 && res.erro && res.erro[1]){
					this.metaAction.toast('warning', res.erro[1])
					this.metaAction.sf('data.isOk', true)
					return false
				}else{
					this.metaAction.toast('success', `导入成功!`)
					this.metaAction.sf('data.isOk', true)
					return res
				}
		    }
	    }else{
		    this.metaAction.toast('warning', '请选择文件')
		    return false
	    }
    }
    getContent = (res) => {
		return <div>
			<p>{`1.导入成功${res.successCount + res.successDrafCount}条，其中正常状态${res.successCount}条`}</p>
			<p>{`2.草稿状态${res.successDrafCount}条，请在卡片上完善`}</p>
			<p>{`3.导入失败${res.errorCount}条，请完善必填信息`}</p>
		</div>
	}


	uploadChange = (info) =>{
        
        console.log(info);

		if(!info.file.status) {
            this.props.metaAction.toast('error', '仅支持上传Excel格式的文件')
            return
        }
		this.props.metaAction.sf('data.loading', true)
		if (info.file.status === 'done') {
			this.props.metaAction.sf('data.loading', false)
			if (info.file.response.error && info.file.response.error.message) {
				this.props.metaAction.toast('error', info.file.response.error.message)
			}else if (info.file.response.result && info.file.response.value) {
            //	this.props.injections.reduce('upload', info.file.response.value)
            
            //调用上传接口
			}
		} else if (info.file.status === 'error') {
			this.props.metaAction.sf('data.loading', false)
			this.props.metaAction.toast('error', '上传失败')
		}
	}
	getAccessToken = () => {
        let token = fetch.getAccessToken()
		return {token}
	}

    render() {
        const { loading, isOk,file,fileName } = this.state
        return (
            <div className="app-sa-delivery-import">
            <Spin
                tip='数据处理中...'
                spinning={loading}
            >
                <p>
                    <span>1. 下载</span>
                    <a onClick={this.importTemplate}>导入模板</a>
                    <span>并将数据按照模版格式进行整理</span>
                </p>
                <p>2. 下载模版维护内容后，选择文件进行导入</p>
                <Upload
                    beforeUpload={this.beforeLoad}
                    onChange={this.uploadChange}
                    showUploadList={false}
                    action={'/v1/edf/file/upload'}
                    headers={this.getAccessToken}
                    accept={'.xls, .xlsx'}
                >
                    <p className='ant-btn-primary'>
                       {file?'重选文件':'选择文件'} 
                    </p>
                </Upload>
                 <a className='file-name'>{fileName}</a>
            </Spin>
            </div>
        )
    }
}

export default ImportComponent
