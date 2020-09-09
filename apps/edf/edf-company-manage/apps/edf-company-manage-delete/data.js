export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className:'edf-company-manage-delete',
		children: [{
			name: 'item1',
			component: '::div',
			className: 'text',
			children: {
				name: 'content',
				component: '::span',
				children:[{
					name: 'item1',
					component: '::span',
					children: '删除企业将永久删除该企业相关的数据，无法恢复，请谨慎操作。您确认要删除企业吗?！'
				}]
			}
		}, {
			name: 'item2',
			component: '::div',
			className: 'text',
			style: {margin: '10px 0 18px'},
			children: {
				name: 'content',
				component: '::span',
				children: '是否确认删除？'
			}
		}, {
			name: 'item3',
			component: '::div',
			children: {
				name: 'name',
				component: 'Form.Item',
				colon: false,
				label: '登录密码',
				validateStatus: "{{data.error.password?'error':'success'}}",
				help: '{{data.error.password}}',
				children: [{
					name: 'hiddenInput',
					component: 'Input',
					type: 'password',
					style: {display: 'none', width: '0', height: '0'}
				}, {
					name: 'input',
					component: 'Input',
					autocomplete: 'new-password',
					value: '{{data.form.password}}',
					type: 'password',
					style: {width: '381px', height:'34px'},
					onBlur: '{{function(e) {$checkpassword(e.target.value)}}}'
				}]
			}
		}]
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				password: ''
			},
			error: {

			}
		}
	}
}
