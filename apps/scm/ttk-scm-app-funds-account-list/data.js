export function getMeta() {
	return {
		name: 'root',
		className: 'ttk-scm-app-funds-account-list',
		component: 'Layout',
		children: [{
			name: 'account',
			component: '::div',
			className: 'ttk-scm-app-funds-account-list-main',
			children: [{
				name: 'cash',
				component: '::div',
				className: 'content',
				children: [{
					name: 'button',
					component: '::div',
					className: 'content-cash-top content-top',
					children: [{
						name: 'icon',
						className: 'ttk-scm-app-funds-account-list-icon',
						component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'zhanghuliebiao-xianjin',
                    }, {
                        name: 'title',
                        component: '::span',
                        children: '现金'
                    }]
				}, {
					name: 'list',
					component: '::div',
					className: 'list',
					children: '{{$loopAccount(data.cash)}}'
				}]
			}, {
				name: 'bank',
				component: '::div',
				className: 'content',
				_visible: '{{data.bank.length != 0}}',
				children: [{
					name: 'button',
					component: '::div',
					className: 'content-bank-top content-top',
					children: [{
						name: 'icon',
						className: 'ttk-scm-app-funds-account-list-icon',
						component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'zhanghuliebiao-yinhangqia',
                    }, {
                        name: 'title',
                        component: '::span',
                        children: '银行'
                    }, {
						name: 'addAccount',
						className: 'ttk-scm-app-funds-account-list-add',
						component: '::div',
						children: [{
							name: 'icon',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'gaojichaxunlidejia',
						}, '新增银行账户'],
						onClick: '{{function(){$addAccount("BANKACCOUNTTYPE_bank")}}}'
					}]
				}, {
					name: 'list',
					component: '::div',
					className: 'list',
					children: '{{$loopAccount(data.bank)}}'
				}]
			}, {
				name: 'wechat',
				component: '::div',
				className: 'content',
				_visible: '{{data.wechat.length != 0}}',
				children: [{
					name: 'button',
					component: '::div',
					className: 'content-wechat-top content-top',
					children: [{
						name: 'icon',
						className: 'ttk-scm-app-funds-account-list-icon',
						component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'zhanghuliebiao-weixin',
                    }, {
                        name: 'title',
                        component: '::span',
                        children: '微信'
                    }, {
						name: 'addAccount',
						component: '::div',
						className: 'ttk-scm-app-funds-account-list-add',
						children: [{
							name: 'icon',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'gaojichaxunlidejia',
						}, '新增微信账户'],
						onClick: '{{function(){$addAccount("BANKACCOUNTTYPE_wechat")}}}'
					}]
				}, {
					name: 'list',
					component: '::div',
					className: 'list',
					children: '{{$loopAccount(data.wechat)}}'
				}]
			}, {
				name: 'alipay',
				component: '::div',
				className: 'content',
				_visible: '{{data.alipay.length != 0}}',
				children: [{
					name: 'button',
					component: '::div',
					className: 'content-alipay-top content-top',
					children: [{
						name: 'icon',
						className: 'ttk-scm-app-funds-account-list-icon',
						component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'zhanghuliebiao-zhifubao',
                    }, {
                        name: 'title',
                        component: '::span',
                        children: '支付宝'
                    }, {
						name: 'addAccount',
						component: '::div',
						className: 'ttk-scm-app-funds-account-list-add',
						children: [{
							name: 'icon',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'gaojichaxunlidejia',
						}, '新增支付宝账户'],
						onClick: '{{function(){$addAccount("BANKACCOUNTTYPE_alipay")}}}'
					}]
				}, {
					name: 'list',
					component: '::div',
					className: 'list',
					children: '{{$loopAccount(data.alipay)}}'
				}]
			}, {
				name: 'addAcount',
				className: 'ttk-scm-app-funds-account-list-button',
				component: 'Button',
				// type: 'primary',
				children: [{
					name: 'icon',
					component: 'Icon',
					fontFamily: 'edficon',
					type: 'gaojichaxunlidejia',
				}, '添加账户'],
				_visible: '{{data.addAccount}}',
				onClick: '{{$addAccount}}'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			importId: undefined,
			addAccount: true,
			wechat: [], //微信
			cash: [], //现金
			bank: [],	//银行
			alipay: [] //支付宝
		}
	}
}