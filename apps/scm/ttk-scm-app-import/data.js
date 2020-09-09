export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-scm-app-import',
		children: {
			name: 'mail',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.loading}}',
			children: [{
				name: 'alert',
				component: '::div',
				className: 'ttk-scm-app-import-alert',
				_visible: '{{data.message != undefined}}',
				children: '{{data.message}}'
			}, {
				name: 'more',
				component: '::div',
				className: 'ttk-scm-app-import-other',
				_visible: '{{data.other != undefined}}',
				children: '{{data.other}}'
			}, {
				name: 'import',
				component: '::p',
				children: [{
					name: 'title',
					component: '::h3',
					_visible: '{{data.other != undefined}}',
					children: '方法二'
				}, {
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
				className: 'import-word',
				children: '2. 下载模版维护内容后，选择文件进行导入'
			}, {
				name: 'account',
				component: 'Select',
				showSearch: false,
				value: '{{data.account.id}}',
				placeholder: '请选择账户',
				onChange: `{{function(v){$accountChange('data.account',data.accountList.filter(function(o){return o.id == v})[0])}}}`,
				children: {
					name: 'option',
					component: 'Select.Option',
					value: '{{data.accountList && data.accountList[_rowIndex].id }}',
					children: '{{data.accountList && data.accountList[_rowIndex].name }}',
					_power: 'for in data.accountList'
				}
			}, {
				name: 'upload',
				component: 'Form.Item',
				children: [{
					name: 'sub',
					component: 'Input',
					style:{ width: '191px',marginRight:'5px', whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", verticalAlign: "middle" },
					placeholder:'上传excel文件',
					disabled: '{{data.disabled || !data.account}}',
					value:'{{data.file && data.file.originalName}}',
					readonly: 'readonly',
					title: '{{data.file && data.file.originalName}}'
				},{
					name: 'upload',
					component: 'Upload',
					beforeUpload: '{{$beforeLoad}}',
					children: [{
					   name: 'openingBankItem',
					   className:'{{data.disabled || !data.account ? "" : "statementUpload"}}',
					   component: 'Button',
					   disabled: '{{data.disabled || !data.account}}',
					   children: '{{data.file ? "重选文件" :"选择文件"}}'
				   }],
				   onChange: '{{$uploadChange}}',
				   showUploadList: false,
				   action: '/v1/edf/file/upload',
				   headers: '{{$getAccessToken()}}',
					accept:'.xls, .xlsx'
				}]
			}]
		}

	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			message: undefined,
			isOk: true,
			other: undefined,
			account: '',
			other: {
				accountList: []
			}
		}
	}
}