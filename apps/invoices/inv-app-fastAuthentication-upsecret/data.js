export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: 'inv-app-fastAuthentication-upsecret-import-key',
        children: {
            name: 'mail',
            component: 'Spin',
            tip: '数据处理中...',
            delay: 0.01,
            spinning: '{{data.loading}}',
            className: 'inv-app-fastAuthentication-upsecret-import-key-container',
            children: [
                // 	{
                // 	name: 'import',
                // 	component: '::p',
                // 	children: [
                // 		{
                // 		name: 'left',
                // 		component: '::span',
                // 		children: '1. 下载'
                // 	},{
                // 		name: 'center',
                // 		component: '::a',
                // 		children: '导入模板',
                // 		className: 'importBth',
                // 		onClick: '{{$importTemplate}}'
                // 	},{
                // 		name: 'right',
                // 		component: '::span',
                // 		children: '并将数据按照模版格式进行整理'
                // 	}]
                // },
                {
                    name: 'upload',
                    component: 'Form.Item',
                    children: [{
                            name: 'sub',
                            component: 'Input',
                            style: {
                                width: '170px',
                                marginRight: '5px',
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden"
                            },
                            placeholder: '上传key.dat文件',
                            disabled: '{{data.disabled}}',
                            value: '{{data.file && data.file.originalName}}',
                            readonly: 'readonly',
                            title: '{{data.file && data.file.originalName}}'
                        },
                        {
                            name: 'upload',
                            component: 'Upload',
                            beforeUpload: '{{$beforeLoad}}',
                            children: {
                                name: 'openingBankItem',
                                className: '{{data.disabled? "" : "statementUpload"}}',
                                component: 'Button',
                                disabled: '{{data.disabled}}',
                                children: '{{data.file ? "重选文件" :"选择文件"}}'
                            },
                            onChange: '{{$uploadChange}}',
                            showUploadList: false,
                            action: '/v1/edf/file/upload',
                            headers: '{{$getAccessToken()}}',
                            accept: '.dat',
                            data: {
                                "fileClassification": "ATTACHMENT",
                                "uploadCompressed": false
                            },
                        }
                    ]
                },
                {
                    name: 'word',
                    component: '::div',
                    style: {
                        marginLeft: '97px',
                        fontSize: '12px',
                        color: '#333333'
                    },
                    children: [{
                            name: 'tou',
                            component: '::span',
                            children: '温馨提示：',
                            style: {
                                color: '#FFBD31'
                            }
                        }, {
                            name: 'content',
                            component: '::span',
                            children: '请先上传发票秘钥（key）'
                        }



                    ]
                },
            ]
        }

    }
}

export function getInitState() {
    return {
        data: {
            loading: false,
            isOk: true,
            disabled: false,
            file: ''
        }
    }
}