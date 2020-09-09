export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		children: {
			name: 'mail',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.loading}}',
			delay: 0.01,
			className:'inv-app-fastAuthentication-list-import-key',
			children: [
				{
					name: 'word',
					component: '::p',
					style: {
						marginLeft: '97px',
						fontSize: '12px',
						color:'#333333'
					},
					children: '请上传发票认证秘钥（key）'
				},
				{
					name: 'upload',
					component: 'Form.Item',
          className:'inv-app-fastAuthentication-list-import-key2',
					children: [{
							name: 'sub',
							component: 'Input',
							style: {
								width: '270px',
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
		}
	}
}