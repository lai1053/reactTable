export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'edfx-app-home-voucher-xdz',
		children: [{
			name: 'header',
			component: 'Layout',
			className: 'edfx-app-home-voucher-xdz-header',
			children: [{
				name: 'left',
				component: '::div',
				className: 'edfx-app-home-voucher-xdz-header-left',
				children: [{
					name: 'title',
					component: '::span',
					className: 'edfx-app-home-voucher-xdz-header-left-title',
					children: '凭证'
				},
				{
					name: 'selectTime',
					component: '::div',
					className: 'edfx-app-home-voucher-xdz-header-left-select',
					children: {
						name: 'timeSelect',
						className: '',
						component: 'DatePicker.MonthPicker',
						showSearch: false,
						value: '{{$getPeriodDate()}}',
            onChange:'{{function(v,t){let time; time = t.replace("-","."); $setData("data.period",time)}}}'
					}
				}
			]
			}, {
				name: 'button',
				component: '::span',
				className: 'edfx-app-home-voucher-xdz-header-right',
				children: {
					name: 'icon',
						component: 'Icon',
						showStyle: 'showy',
						fontFamily: 'edficon',
						type: 'shuaxin',
						title: '刷新',
						onClick: '{{$refresh}}'
				}
			}]
		}, {
			name: 'spin',
			component: 'Spin',
			tip: '数据加载中...',
			spinning: '{{data.loading}}',
			children: {
				name: 'main',
				component: 'Layout',
				className: 'edfx-app-home-voucher-xdz-main',
				children:[{
					name: 'list',
					component: '::p',
					children: [{
						name: 'span',
						component: '::span',
						children: '总数：'
					},{
						name: 'a',
						component: '::a',
						children: '{{data.certificateCount}}',
						onClick: '{{$openList}}',
						disabled: '{{data.isExpire}}', 
					},{
						name: 'span2',
						component: '::span',
						children: ' 张'
					}]
				},{
					name: 'charge',
					component: '::div',
					children: {
						component: 'Button',
						type: 'primary',
						disabled: '{{data.isExpire}}',
						children: '新增凭证',
						onClick: '{{$openCharge}}'
					}
				},{
					name: 'balancesum',
					component: '::div',
					children: {
						component: 'Button',
						children: '余额表',
						onClick: '{{$openBalancesum}}'
					}
				}]
			}
		}]
	}
}

export function getInitState() {
	return {
		data: {
			size: '0',
			other: false,
			certificateCount: '0',
			periodList: [],
			loading: false
		}
	}
}