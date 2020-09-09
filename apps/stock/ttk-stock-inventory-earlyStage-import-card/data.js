export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-inventory-earlyStage-import-card',
		children: [
            {
                name: 'demo',
                component: '::div',
                className: 'ttk-stock-inventory-earlyStage-import-card-div',
                children: [
                    {
                        name: 'title',
                        component: '::h3',
                        children: '业务提示:'
                    },
                    {
                        name: 'p1',
                        component: '::div',
                        className: 'p-item',
                        children: [
                            {
                                name: 'p1-txt',
                                component: '::span',
                                children: '第一步：导出当前存货期初数据'
                            },
                            {
                                name: 'p1-icon',
                                className: 'p1-icon-export',
                                component: 'Icon',
                                type: 'export',
                                onClick: '{{$export}}'
                            }
                        ]
                    },
                    {
                        name: 'p2-item',
                        className: 'p-item',
                        component: '::div',
                        children: '第二步：针对存货期初数据中的数量、单价、金额等字段进行补充',
                    },
                    {
                        name: 'p3-item',
                        className: 'p-item',
                        component: '::div',
                        children:[
                            {
                                name: 'p3-item-c1',
                                component: '::div',
                                children: '第三步：导入补充后的存货期初数据'
                            },
                            {
                                name: 'p3-item-c1',
                                component: '::div',
                                style: { marginTop: "10px" },
                                children: [
                                    {
                                        name: 'p3-item-c1',
                                        component: '::span',
                                        children: '温馨提示：',
                                        style: { color: '#f17712' }
                                    },
                                    { 
                                        name: 'p3-item-c1',
                                        component: '::span',
                                        children: '暂不支持在模板中新增存货期初数据'
                                    }
                                ]
                            },
                            {
                                name: 'p3-item-c2',
                                className: 'p3-item-c2',
                                component: '::div',
                                children:[
                                    {
                                        name: 'p3-item-c2-txt',
                                        className: 'p3-item-c2-txt',
                                        style:{ marginRight:'15px' },
                                        component: '::span',
                                        children: '请选择文件:'
                                    },
                                    {
                                        name: 'sub',
                                        component: 'Input',
                                        style:{ width: '191px', whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", verticalAlign: "middle" },
                                        placeholder:'请选择文件',
                                        value:'{{data.file && data.file.originalName}}',
                                        readonly: 'readonly',
                                        title: '{{data.file && data.file.originalName}}'
                                    },
                                    {
                                        name: 'upload',
                                        className: 'ttk-stock-inventory-earlyStage-import-card-upload',
                                        component: 'Upload',
                                        children: [
                                            {
                                                name: 'p3-item-c2-button',
                                                className: 'p3-item-c2-button',
                                                component: 'Button',
                                                type: 'primary',
                                                children: '选择文件'
                                            }
                                        ],
                                        showUploadList: false,
                                        action: '/v1/edf/file/upload',
                                        headers: '{{$getAccessToken()}}',
                                        onChange: '{{$uploadChange}}',
                                        beforeUpload: '{{$beforeUpload}}',
                                        accept: '.xls, .xlsx'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'footer-btn',
                        component: '::div',
                        className: 'ttk-stock-inventory-earlyStage-import-card-footer-btn',
                        children: [
                            {
                                name: 'btnGroup',
                                component: '::div',
                                className: 'ttk-stock-inventory-earlyStage-import-card-footer-btn-btnGroup',
                                children: [
                                    {
                                        name: 'cancel',
                                        component: 'Button',
                                        className: 'ttk-stock-inventory-earlyStage-import-card-footer-btn-btnGroup-item',
                                        children: '取消',
                                        onClick: '{{$onCancel}}'
                                    }, 
                                    {
                                        name: 'confirm',
                                        component: 'Button',
                                        className: 'ttk-stock-inventory-earlyStage-import-card-footer-btn-btnGroup-item',
                                        type: 'primary',
                                        children: '确定',
                                        onClick: "{{$onOk}}",
                                        style:{borderTopLeftRadius: "4px", borderBottomLeftRadius:"4px"}
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
	}
}

export function getInitState() {
	return {
		data: {
            file: "",
            originalName: '',
            canUpload: true,
		}
	}
}