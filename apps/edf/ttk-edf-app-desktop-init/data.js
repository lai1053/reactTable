export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-edf-app-desktop-init',
		children: [{
			name: 'top',
			component: '::div',
			className: 'ttk-edf-app-desktop-init-top',
			children: [{
				name: 'title',
				component: '::span',
				className: 'ttk-edf-app-desktop-init-top-title',
				children: '初始化'
			}, {
				name: 'close',
				component: 'Icon',
				onClick: '{{$hideInit}}',
				fontFamily: 'edficon',
				_visible: false,
				className: 'ttk-edf-app-desktop-init-top-close',
				type:'guanbi'
			}, {
				name: 'beginnerGuidance',
				component: '::span',
				_visible: false,
				// _visible: '{{data.currentOrg && data.currentOrg.appId != 104}}',
				onClick: "{{function() {$openApp('新手引导', 'ttk-edf-app-beginner-guidance')}}}",
				className: '{{data.isExpire ? "isExpire ttk-edf-app-desktop-init-top-beginnerGuidance":"ttk-edf-app-desktop-init-top-beginnerGuidance"}}',
				children: '新手引导'
			}]
		}, {
			name: 'body',
			component: '::div',
			_visible: '{{data.currentOrg && data.currentOrg.appId != 104}}',
			className: 'ttk-edf-app-desktop-init-body',
			children: [
				{
				name: 'one',
				component: '::div',
				className: 'ttk-edf-app-desktop-init-body-block',
				children: [{
					name: 'state',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-left',
					children: [{
						name: 'img',
						component: '::div',
						children: [{
							name: 'bg',
							component: '::div',
							children: ''
						}]
					}]
				}, {
					name: 'item',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-right',
					children: [{
						name: 'title',
						component: '::div',
						className: 'ttk-edf-app-desktop-init-body-right-title',
						children: '1.先初始化数据'
					}, {
						name: 'item',
						component: '::p',
						className: 'ttk-edf-app-desktop-init-body-right-item',
						children: {
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight first isExpire' : 'highLight first'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#1EB5AD'}}}",
							onClick: "{{function() {$openApp('财务期初', 'ttk-gl-app-financeinit-enterprise')}}}",
							children: '财务数据初始化'
						}
					}]
				}]
			}, {
				name: 'two',
				component: '::div',
				className: 'ttk-edf-app-desktop-init-body-block',
				children: [{
					name: 'state',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-left',
					children: [{
						name: 'img',
						component: '::div',
						children: [{
							name: 'bg',
							component: '::div',
							children: ''
						}]
					}]
				}, {
					name: 'item',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-right',
					children: [{
						name: 'title',
						component: '::div',
						className: 'ttk-edf-app-desktop-init-body-right-title',
						children: '2.采集发票，开始做业务'
					}, {
						name: 'item',
						component: '::p',
						className: 'ttk-edf-app-desktop-init-body-right-item',
						children: [{
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight second isExpire' : 'highLight second'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#FF543E'}}}",
							onClick: "{{function() {$openApp('销项', 'ttk-scm-app-sa-invoice-list')}}}",
							children: '采集销项发票'
						}, '、',  {
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight second isExpire' : 'highLight second'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#FF543E'}}}",
							onClick: "{{function() {$openApp('进项', 'ttk-scm-app-pu-invoice-list')}}}",
							children: '采集进项发票'
						}, '，批量生成财务凭证']
					}]
				}]
			}, {
				name: 'three',
				component: '::div',
				className: 'ttk-edf-app-desktop-init-body-block',
				children: [{
					name: 'state',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-left',
					children: [{
						name: 'img',
						component: '::div',
						children: [{
							name: 'bg',
							component: '::div',
							children: ''
						}]
					}]
				}, {
					name: 'item',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-right',
					children: [{
						name: 'title',
						component: '::div',
						className: 'ttk-edf-app-desktop-init-body-right-title',
						children: '3.导入银行对账，开始做银行收支明细'
					}, {
						name: 'item',
						component: '::p',
						className: 'ttk-edf-app-desktop-init-body-right-item',
						children: [{
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight third isExpire' : 'highLight third'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#FF690D'}}}",
							onClick: "{{function() {$openApp('银行对账单', 'ttk-scm-add-bank-statement-list', {bankAccountId: 1, accessType: '5', importId: undefined})}}}",
							children: '导入银行对账单'
						}, '，自动维护收支类型，批量生成收支明细账']
					}]
				}]
			}, {
				name: 'four',
				component: '::div',
				className: 'ttk-edf-app-desktop-init-body-block',
				children: [{
					name: 'state',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-left',
					children: [{
						name: 'img',
						component: '::div',
						children: [{
							name: 'bg',
							component: '::div',
							children: ''
						}]
					}]
				}, {
					name: 'item',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-right',
					children: [{
						name: 'title',
						component: '::div',
						className: 'ttk-edf-app-desktop-init-body-right-title',
						children: '4.申报'
					}, {
						name: 'item',
						component: '::p',
						className: 'ttk-edf-app-desktop-init-body-right-item',
						children: ['采集完发票，可以 ', {
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight fouth isExpire' : 'highLight fouth'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#10A5F2'}}}",
							// onClick: "{{function() {$openApp('申报缴款', 'ttk-taxapply-app-taxlist')}}}",
							onClick: "{{$SBJKopen}}",
							children: '申报增值税'
						}, '； 做完凭证，可以 ', {
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight fouth isExpire' : 'highLight fouth'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#10A5F2'}}}",
							onClick: "{{function() {$openApp('申报缴款', 'ttk-taxapply-app-taxlist')}}}",
							children: '申报财务报表'
						}]
					}]
				}]
			}]
		}, {
			name: 'body',
			component: '::div',
			_visible: '{{data.currentOrg && data.currentOrg.appId == 104}}',
			className: 'ttk-edf-app-desktop-init-body',
			children: [
				{
				name: 'one',
				component: '::div',
				className: 'ttk-edf-app-desktop-init-body-block',
				children: [{
					name: 'state',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-left',
					children: [{
						name: 'img',
						component: '::div',
						children: [{
							name: 'bg',
							component: '::div',
							children: ''
						}]
					}]
				}, {
					name: 'item',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-right',
					children: [{
						name: 'title',
						component: '::div',
						className: 'ttk-edf-app-desktop-init-body-right-title',
						children: '1.对接用友金蝶财务软件'
					}, {
						name: 'item',
						component: '::p',
						className: 'ttk-edf-app-desktop-init-body-right-item',
						children: {
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight first isExpire' : 'highLight first'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#1EB5AD'}}}",
							onClick: "{{function() {$openApp('对接财务账套', 'ttk-scm-tj-init-setting')}}}",
							children: '对接财务账套'
						}
					}]
				}]
			}, {
				name: 'two',
				component: '::div',
				className: 'ttk-edf-app-desktop-init-body-block',
				children: [{
					name: 'state',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-left',
					children: [{
						name: 'img',
						component: '::div',
						children: [{
							name: 'bg',
							component: '::div',
							children: ''
						}]
					}]
				}, {
					name: 'item',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-right',
					children: [{
						name: 'title',
						component: '::div',
						className: 'ttk-edf-app-desktop-init-body-right-title',
						children: '2.采集发票，开始做业务'
					}, {
						name: 'item',
						component: '::p',
						className: 'ttk-edf-app-desktop-init-body-right-item',
						children: [{
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight second isExpire' : 'highLight second'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#FF543E'}}}",
							onClick: "{{function() {$openApp('销项', 'ttk-scm-app-sa-invoice-list')}}}",
							children: '采集销项发票'
						}, '、',  {
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight second isExpire' : 'highLight second'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#FF543E'}}}",
							onClick: "{{function() {$openApp('进项', 'ttk-scm-app-pu-invoice-list')}}}",
							children: '采集进项发票'
						}, '，批量生成财务凭证']
					}]
				}]
			}, {
				name: 'four',
				component: '::div',
				className: 'ttk-edf-app-desktop-init-body-block',
				children: [{
					name: 'state',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-left',
					children: [{
						name: 'img',
						component: '::div',
						children: [{
							name: 'bg',
							component: '::div',
							children: ''
						}]
					}]
				}, {
					name: 'item',
					component: '::div',
					className: 'ttk-edf-app-desktop-init-body-right',
					children: [{
						name: 'title',
						component: '::div',
						className: 'ttk-edf-app-desktop-init-body-right-title',
						children: '3.申报'
					}, {
						name: 'item',
						component: '::p',
						className: 'ttk-edf-app-desktop-init-body-right-item',
						children: ['采集完发票，可以 ', {
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight fouth isExpire' : 'highLight fouth'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#10A5F2'}}}",
							onClick: "{{function() {$openApp('申报缴款', 'ttk-taxapply-app-taxlist')}}}",
							children: '申报增值税'
						}, '； 做完凭证，可以 ', {
							name: 'link',
							component: '::span',
							className: "{{data.isExpire ? 'highLight fouth isExpire' : 'highLight fouth'}}",
							style: "{{data.isExpire? {color: '#999999'} : {color: '#10A5F2'}}}",
							onClick: "{{function() {$openApp('申报缴款', 'ttk-taxapply-app-taxlist')}}}",
							children: '申报财务报表'
						}]
					}]
				}]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			other: {
				firstState: false,
				twoState: false,
				threeState: false
			},
		}
	}
}
