export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'mail',
		children:{
			name: 'mail',
			component: 'Spin',
			tip: '数据加载中...',
			spinning: '{{data.loading}}',
			// spinning: '{{data.form.url?false:true}}',
			className: '{{data.form.url?"mailContainer":"mailContainer filterMailContainer"}}',
			children: [{
				name: 'form',
				component: 'Form',
				className: 'z-formitems',
				children:[{
					name: 'item1',
					component: 'Form.Item',
					className: 'z-formitem',
					label: '收件人',
					validateStatus: "{{data.other.error.addressee?'error':'success'}}",
					required: true,
					help: '{{data.other.error.addressee}}',
					children: [{
						name: 'toAddress',
						className: 'z-formitem-input',
						component: 'Input',
						placeholder: '若发送多个邮箱请用逗号","或";"隔开',
						value: '{{data.form.toAddress}}',
						onChange: "{{function(e){$fieldChange('data.form.toAddress',e.target.value)}}}"
					}]
				},{
					name: 'item2',
					component: 'Form.Item',
					className: 'z-formite',
					label: '抄 送',
					
					validateStatus: "{{data.other.error.copyTo?'error':'success'}}",
					// required: true,
					// validateStatus: "{{data.other.error.code?'error':'success'}}",
					help: '{{data.other.error.copyTo}}',
					children: [{
						name: 'ccAddress',
						className: 'z-formitem-input',
						component: 'Input',
						placeholder: '若抄送多个邮箱请用逗号","或";"隔开',
						value: '{{data.form.ccAddress}}',
						onChange: "{{function(e){$fieldChange('data.form.ccAddress',e.target.value)}}}"
					}]
				},{
					name: 'item3',
					component: 'Form.Item',
					className: 'z-formitem',
					label: '主 题',
					validateStatus: "{{data.other.error.subject?'error':'success'}}",
					required: true,
					// validateStatus: "{{data.other.error.code?'error':'success'}}",
					help: '{{data.other.error.subject}}',
					children: [{
						name: 'subject',
						className: 'z-formitem-input',
						component: 'Input',
						placeholder: '邮件主题，不能省略',
						value: '{{data.form.subject}}',
						onChange: "{{function(e){$fieldChange('data.form.subject',e.target.value)}}}"
					}]
				},{
					name: 'item4',
					component: 'Form.Item',
					className: 'z-formitem',
					label: '附件',
					children:{
						name:'tableName',
						component: '::a',
						className: 'mail-pdf',
						// target: '_blank',
						// href: '{{data.form.fileHref}}',
						children: '{{data.other.file}}',
						onClick:'{{$goFile}}'
					}
				},{
					name: 'item5',
					component: 'Form.Item',
					className: 'z-formitem',
					label: '正文',
					children: {
						name:'tableName',
						component: 'Input.TextArea',
						className: 'mail-mailcontent',
						rows: 5,
						target: '_blank',
						// href: '{{data.form.fileHref}}',
						value: '{{data.form.textBody}}',
						onChange: "{{function(e){$fieldChange('data.form.textBody',e.target.value)}}}"
					}
				}]
			},
			// {
			// 	name:'content1',
			// 	component: '::div',
			// 	className: 'mail-content',
			// 	children:[{
			// 		name:'content2',
			// 		component: '::span',
			// 		className: '',
			// 		children: '附件:'
			// 	},{
			// 		name:'tableName',
			// 		component: '::a',
			// 		className: 'mail-pdf',
			// 		target: '_blank',
			// 		href: '{{data.form.fileHref}}',
			// 		children: '{{data.other.file}}'
			// 	},{
			// 		name:'content3',
			// 		component: '::h5',
			// 		className: 'mail-content',
			// 		children: '您好！'
			// 	},{
			// 		name:'content4',
			// 		component: '::p',
			// 		className: 'mail-mailcontent',
			// 		children: [{
			// 			name:'content5',
			// 			component: '::span',
			// 			className: '',
			// 			children: '{{data.other.detailFile}}'
			// 		},{
			// 			name:'content6',
			// 			component: '::a',
			// 			className: '',
			// 			target: '_blank',
			// 			href: '{{data.form.fileHref}}',
			// 			children: '{{data.form.fileHref}}'
			// 		}]
			// 	},
				
			// ]
			// }
		]
		} 
	}
}


export function getInitState() {
	return {
		data: {
			ok: true,
			loading: true,
			form: {
				toAddress: undefined,
				ccAddress:	undefined,
				subject: undefined
			},
			other: {
				error: {}
			}
		}
	}
}