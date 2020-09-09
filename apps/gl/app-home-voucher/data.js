export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'edfx-app-home-voucher',
		children: [{
			name: 'header',
			component: 'Layout',
			className: 'edfx-app-home-voucher-header',
			children: [{
				name: 'left',
				component: '::div',
				className: 'edfx-app-home-voucher-header-left',
				children: [{
					name: 'title',
					component: '::span',
					className: 'edfx-app-home-voucher-header-left-title',
					children: '凭证'
				},{
					name: 'selectTime',
					component: '::div',
					className: 'edfx-app-home-voucher-header-left-select',
					children: {
						name: 'timeSelect',
						className: '',
						component: 'Select',
						showSearch: false,
						value: '{{data.period?data.period:data.periodList[0]}}',
						dropdownClassName: 'selectDate',
						onSelect:'{{function(v){$setField("data.period",v)}}}',
						children: {
							name:'option',
							component: 'Select.Option',
							children: '{{data.periodList && data.periodList[_rowIndex]}}',
							key: '{{data.periodList && data.periodList[_rowIndex]}}',
							_power: 'for in data.periodList'
						}
					}
				}]
			}, {
				name: 'button',
				component: '::span',
				className: 'edfx-app-home-voucher-header-right',
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
				className: 'edfx-app-home-voucher-main',
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