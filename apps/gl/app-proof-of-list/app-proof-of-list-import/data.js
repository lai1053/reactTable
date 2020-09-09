export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'app-proof-of-list-import',
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
					children: '1. 下载',
				},{
					name: 'center',
					component: '::a',
					children: '导入模板',
					onClick: '{{$importTemplate}}'
				},
				{
					name: 'left',
					component: '::span',
					children: '并将数据按照模板格式进行整理',
				}
			]
			}, {
				name: 'word',
				component: '::p',
				children: '2. 下载模板维护内容后，选择文件进行导入'
			}, {
				 name: 'upload',
				 component: 'Upload',
				 beforeUpload: '{{$beforeLoad}}',
				 children: [{
					name: 'openingBankItem',
					className:'ant-btn-primary selectFile',
                    component: 'Button',
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