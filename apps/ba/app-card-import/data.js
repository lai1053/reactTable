import {fetch} from 'edf-utils'

export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: 'app-asset-import',
        children: [{
            name: 'import',
            component: '::p',
            children: [{
                name: 'left',
                component: '::span',
                children: '1. 下载'
            }, {
                name: 'center',
                component: '::a',
                children: '导入模板',
                className: 'importBth',
                onClick: '{{$importTemplate}}'
            }, {
                name: 'right',
                component: '::span',
                children: '并将数据按照模版格式进行整理'
            }]
        }, {
            name: 'word',
            component: '::p',
            children: '2. 下载模版维护内容后，选择文件进行导入'
        },{
            name: 'word',
            component: '::p',
            children: '3. 若模板数据错误，下载纠错文件修改后重新导入'
        }, {
            name: 'upload',
            component: '::p',
            className:'bottom',
            children: [{
                name: 'upload',
                component: 'Upload',
                children: [{
                    name: 'openingBankItem',
                    className:'ant-btn-primary',
                    component: '::p',
                    children: '{{data.file ? "重选文件" :"选择文件"}}'
                }],
                showUploadList: false,
                action: '/v1/edf/file/upload',
                headers: '{{$getAccessToken()}}',
	            onChange: '{{$uploadChange}}',
	            beforeUpload: '{{$beforeLoad}}',
	            accept: '.xls, .xlsx'
            }, {
                name: 'name',
                component: '::span',
                className: 'file-name',
	            title: '{{data.file ? data.file.originalName : ""}}',
                children: '{{data.file ? data.file.originalName : ""}}'
            }]
        }, {
            name: 'openingBankItem',
            component: '::p',
            className:'noBottom',
            children: {
                component: 'Button',
                children: '下载纠错模板',
                _visible:'{{data.url ? true : false}}',
                onClick:'{{$downloadTemplate}}'
            }
        }]
    }
}

export function getInitState() {
    return {
        data: {
        }
    }
}
