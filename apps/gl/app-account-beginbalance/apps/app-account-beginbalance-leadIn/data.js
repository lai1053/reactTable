export function getMeta() {
	return {
		name: 'root',
		className: 'app-account-beginbalance-leadin',
		component: 'Layout',
		children: [{
			name: 'topTipDiv',
			component: '::div',
			className: 'app-account-beginbalance-leadin-whileDiv',
			children: [{
				name: 'bottomDiv',
				component: '::div',
				className: 'app-account-beginbalance-leadin-bottomDiv',
				children:'选择您之前使用的财务软件，上传从中导出的余额表：'
			},{
                name: 'bottomDiv',
                component: 'Form',
                className: 'app-account-beginbalance-leadin-whileDiv-form',
                children: [
                    {
                        name: 'div1',
                        component: 'Form.Item',
                        className: 'app-account-beginbalance-leadin-whileDiv-form-item',
                        children: [{
                            name: 'sub',
                            component: 'TreeSelect',
                            placeholder:'下拉选取财务软件',
                            style:{ width: '260px' },
                            treeData: '{{data.treeData}}',
                            value: '{{data.value}}',
                            onChange: '{{function(value,label){$treeChange(value, label)}}}',
                            dropdownClassName:'{{data.expand?"app-account-beginbalance-leadin-whileDiv-treeSelect":"app-account-beginbalance-leadin-whileDiv-treeSelect ant-select-dropdown-hidden"}}'
                        },{
                            name: 'div2',
                            component: '::div',
                            _visible: '{{data.downloadTempShow}}',
                            style:{fontSize:'12px',height:'18px',lineHeight:'18px',textAlign:'right'},
                            children: [{
                                name: 'span1',
                                component: '::span',
                                children: '请'
                            },{
                                name: 'span2',
                                component: '::span',
                                children: '下载模板',
                                className:'leadInModle',
                                onClick: '{{$leadInModle}}'
                            },{
                                name: 'span3',
                                component: '::span',
                                children: '，填好数据后导入',
                            }]
                        }]
                    },{
                        name: 'div3',
                        component: 'Form.Item',
                        className: 'app-account-beginbalance-leadin-whileDiv-form-item',
                        children: [{
                            name: 'sub',
                            component: 'Input',
                            style:{ width: '191px',marginRight:'5px' },
                            placeholder:'上传excel文件',
                            disabled: '{{data.disabled}}',
                            value:'{{data.fileName}}',
                            readonly: 'readonly',
                            title: '{{data.fileName}}'
                        },{
                            name: 'upload',
                            component: 'Upload',
                            beforeUpload: '{{$beforeLoad}}',
                            children: [{
                               name: 'openingBankItem',
                               className:'uploadFile',
                               component: 'Button',
                               disabled: '{{data.disabled}}',
                               children: '{{data.file ? "重选文件" :"选择文件"}}'
                           }],
                           onChange: '{{$handleOnChange}}',
                           showUploadList: false,
                           action: '/v1/edf/file/upload',
                           headers: '{{$getAccessToken()}}',
                            accept:'.xls, .xlsx'
                        }]
                    }
                ]
            }]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			tagValue: '',
            uploadFile:{},
            disabled: true,
            downloadTempShow: false,
            expand: true,
            treeDefaultExpandedKeys:[],
            treeData: [{
                label: '用友',
                value: '0-0',
                key: '0-0',
                children: [{
                  label: 'T3',
                  value: '1',
                  key: '1',
                }, {
                  label: 'T+',
                  value: '2',
                  key: '2',
                },{
                    label: '好会计',
                    value: '3',
                    key: '3',
                }],
              }, {
                label: '金蝶',
                value: '0-1',
                key: '0-1',
                children: [{
                    label: '精斗云',
                    value: '4',
                    key: '4',
                },{
                    label: 'KIS',
                    value: '5',
                    key: '5',
                }]
              },{
                label: '其他',
                value: '0',
                key: '0',
              }]
		}
	}
}