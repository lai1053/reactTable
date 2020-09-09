export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-scm-app-warehouse-import',
		children: {
			name: 'mail',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.loading}}',
			children: [{
				name: 'import',
				component: '::p',
				children: [{
					name: 'left',
					component: '::span',
					children: '1. ',
				},{
					name: 'center',
					component: '::a',
					children: '下载模板',
					onClick: '{{$importTemplate}}'
				}]
			}, {
				name: 'word',
				component: '::p',
				children: '2. 如果期初数据已经导入，再次导入会把之前的内容覆盖'
			},{
				name: 'word',
				component: '::p',
				children: '3. 下载模板维护内容后，选择文件进行导入'
			}, {
				 name: 'upload',
				 component: 'Upload',
				 beforeUpload: '{{$beforeLoad}}',
				 children: [{
					name: 'openingBankItem',
					className:'ant-btn-primary',
                    component: '::p',
					children: '{{data.file ? "重选文件" :"选择文件"}}'
				}],
				onChange: '{{$uploadChange}}',
				showUploadList: false,
				action: '/v1/edf/file/upload',
				headers: '{{$getAccessToken()}}',
				 accept:'.xls, .xlsx'
			}, {
				name: 'name',
				component: '::a',
				className: 'file-name',
				title: '{{data.file ? data.file.originalName : ""}}',
				children: '{{data.file ? data.file.originalName : ""}}'
			}]
		}
		
	}
}

export function getInitState() {
	return {
		data: {
			loading:false,
			isOk: true
		}
	}
}