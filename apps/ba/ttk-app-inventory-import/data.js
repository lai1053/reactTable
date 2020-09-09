export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-app-inventory-import',
		children: [{
			name: 'mail',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.loading}}',
			children: [{
				name: 'tishi',
				component: '::div',
				children: '温馨提示：',
				style: {fontWeight: 700}
			},{
				name: 'yi',
				component: '::div',
				children: '1、支持导入的文件格式：Excel格式（xls、xlsx）'
			},{
				name: 'check',
				component: 'Checkbox',
				checked: '{{data.check}}',
				// disabled: '{{data.other.isGenVoucher}}',
				disabled: true,
				onChange: '{{function(e){$sf("data.check", e.target.checked)}}}',
				children: '是否同步导入期初数据'
			},{
				name: 'xiazai',
				component: 'Icon',
				type: 'xiazai',
				fontFamily: 'edficon',
				onClick: '{{$downLoad}}'
			},{
				name: 'er',
				component: '::div',
				children: '2、Excel格式大小 3M'
			},{
				name: 'wenjian',
				component: '::span',
				className: 'wenjian',
				children: '请选择文件：'
			}, {
				name: 'upload',
				component: 'Form.Item',
				children: [{
					name: 'sub',
					component: 'Input',
					style:{ width: '191px',marginRight:'5px', whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", verticalAlign: "middle" },
					placeholder:'上传excel文件',
					value:'{{data.file && data.file.originalName}}',
					readonly: 'readonly',
					title: '{{data.file && data.file.originalName}}'
				},
				{
					name: 'upload',
					component: 'Upload',
					className: 'ttk-app-inventory-import-upload',
					beforeUpload: '{{$beforeUpload}}',
					children: [{
						name: 'openingBankItem',
						component: 'Button',
						type: 'primary',
						children: '{{data.file ? "重选文件" :"选择文件"}}'
					}],
					onChange: '{{$uploadChange}}',
					showUploadList: false,
					action: '/v1/edf/file/upload',
					headers: '{{$getAccessToken()}}',
					accept:'.xls, .xlsx'
				}]
			}]
		}]
		
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			check: false,
			other: {
				isGenVoucher: false
			}
		}
	}
}