export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className:'ttk-gl-app-finance-periodbegin-reinit',
		children: [{
			name: 'item1',
			component: '::div',
			className: 'text',
			children: {
				name: 'content',
				component: '::div',
				children:[{
					name: 'item10',
					component: '::div',
					children: '重新初始化后，将会删除以下数据，请谨慎操作'
				},{
					name: 'item11',
					component: '::div',
					className: 'text-marginleft',
					children: '1 期初科目余额、期初现金流量'
				},{
					name: 'item12',
					component: '::div',
					className: 'text-marginleft',
					children: '2 原科目与新科目间的匹配关系（第三方科目余额表直接导入方式）'
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
				children: '是否确认初始化？'
			}
		}, {
			name: 'item3',
			component: '::div',
			children: {
				name: 'name',
				component: 'Form.Item',
				colon: false,
				label: '登录密码',
				required: true,
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
