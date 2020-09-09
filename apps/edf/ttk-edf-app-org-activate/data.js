export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-edf-app-org-activate',
		children: [{
			name: 'leftContent',
			component: '::div',
			className: 'ttk-edf-app-org-activate-leftContent',
			children: [{
				name: 'title',
				component: '::div',
				className: 'ttk-edf-app-org-activate-leftContent-title',
				children: '产品激活'
			}, {
				name: 'text',
				component: '::div',
				className: 'ttk-edf-app-org-activate-leftContent-text',
				children: '{{data.appVersion != 104 ? "亲爱的用户，请使用激活码激活企业" : "亲爱的用户，请使用激活码激活企业"}}'
			}, {
				name: 'nameItem',
				component: 'Form.Item',
				label: '企业名称',
				required: true,
				children: [{
					name: 'name',
					component: '::div',
					children: '{{data.company.name}}'
				}]
			}, {
				name: 'nameItem',
				component: 'Form.Item',
				label: '序列号',
				required: true,
				children: [{
					name: 'name',
					component: 'Input',
					maxlength: '20',
					value: '{{data.form.account}}',
					placehoder: '请输入序列号',
					onChange: `{{function(e){$sf('data.form.account',e.target.value)}}}`
				}]
			}, {
				name: 'nameItem',
				component: 'Form.Item',
				label: '激活码',
				required: true,
				children: [{
					name: 'name',
					component: 'Input',
					maxlength: '20',
					value: '{{data.form.psw}}',
					placehoder: '请输入激活码',
					onChange: `{{function(e){$sf('data.form.psw',e.target.value)}}}`
				}]
			}, {
				name: 'activate',
				component: 'Button',
				children: '立即激活',
				type: 'primary',
				className: 'ttk-edf-app-org-activate-leftContent-button',
				disabled: '{{!(data.form.psw && data.form.account)}}',
				onClick: '{{$activateClick}}'
			}, {
				name: 'notationList',
				component: '::div',
				className: 'ttk-edf-app-org-activate-leftContent-text',
				children: '注意事项：'
			}, {
				name: 'notationList1',
				component: '::div',
				className: 'ttk-edf-app-org-activate-leftContent-notationList',
				children: '1、请确认您要激活的企业'
			}, {
				name: 'notationList2',
				component: '::div',
				className: 'ttk-edf-app-org-activate-leftContent-notationList',
				children: '2、输入正确的序列号和激活码，才可以激活'
			}, {
				name: 'notationList3',
				component: '::div',
				_visible: '',
				className: 'ttk-edf-app-org-activate-leftContent-notationList',
				children: '{{data.appVersion != 104 ? "3、如果激活有问题，请联系客服热线：400-99-12366" : "3、如有问题请联系经销商"}}'
			}]
		}, {
			name: 'rightContent',
			component: '::div',
			className: 'ttk-edf-app-org-activate-rightContent',
			children: [{
				component: '::div',
				className: 'ttk-edf-app-org-activate-rightContent-container',
				children: [{
					name: ' goback',
					component: 'Button',
					children: '返回',
					className: 'ttk-edf-app-org-activate-rightContent-back',
					onClick: '{{$goBack}}'
				}, {
					name: 'tel',
					component: '::div',
					className: 'ttk-edf-app-org-activate-rightContent-connection',
					children: [{
						name: 'telIcon',
						component: '::div',
						className: 'ttk-edf-app-org-activate-rightContent-connection-icon',
						children: [{
							name: 'icon',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'zaixianbangzhu',
							style: {
								fontSize: 100
							}
						}]
					}, {
						name: 'telList',
						component: '::div',
						_visible: '{{data.appVersion != 104}}',
						className: 'ttk-edf-app-org-activate-rightContent-connection-telNum',
						children: [{
							name: 'notationList',
							component: '::p',
							className: 'ttk-edf-app-org-activate-rightContent-connection-telNum-telText',
							children: '如有问题请拨打客服电话'
						}, {
							name: 'notationList',
							component: '::p',
							className: 'ttk-edf-app-org-activate-rightContent-connection-telNum-num',
							children: '400-99-12366'
						}]
					}, {
						name: 'telList',
						component: '::div',
						_visible: '{{data.appVersion == 104}}',
						className: 'ttk-edf-app-org-activate-rightContent-connection-telNum',
						children: [{
							name: 'notationList',
							component: '::p',
							style: {marginTop: '80px'},
							className: 'ttk-edf-app-org-activate-rightContent-connection-telNum-telText',
							children: '如有问题请联系经销商'
						}]
					}]
				}]
			}]
		}]
	};
}

export function getInitState() {
	return {
		data: {
			form: {},
			other: {},
			company: {}
		}
	};
}
