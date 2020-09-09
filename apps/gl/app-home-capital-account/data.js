export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'edfx-app-home-capital-account',
		children: [{
			name: 'header',
			component: 'Layout',
			className: 'edfx-app-home-capital-account-header',
			children: [{
				name: 'left',
				component: '::div',
				className: 'edfx-app-home-capital-account-header-left',
				children: [{
					name: 'title',
					component: '::span',
					className: 'edfx-app-home-capital-account-header-left-title',
					children: '资金账户'
				},{
					name: 'selectTime',
					component: '::div',
					className: 'edfx-app-home-capital-account-header-left-select',
					children: {
						name: 'timeSelect',
						className: '',
						component: 'Select',
						showSearch: false,
						value: '{{data.period}}',
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
				className: 'edfx-app-home-capital-account-header-right',
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
		},{
			name: 'main',
			// component: 'Layout',
			component: 'Spin',
			tip: '数据加载中...',
			spinning: '{{data.loading}}',
			
			children: {
				// name: 'spin',
				name: 'main',
				component: 'Layout',
				className: 'edfx-app-home-capital-account-main',
					children:[{
					name: 'list',
					component: '::p',
					className: 'edfx-app-home-capital-account-main-total',
					children: [{
						name: 'span',
						component: '::span',
						children: '合计：'
					},{
						name: 'number',
						component: '::span',
						children: '{{data.accountSumAmount==0?$convertData("total", 0.00):$convertData("total", data.accountSumAmount)}}'
						
					}]
				},{
					name: 'bankdeposit',
					component: '::div',
					className: 'bankdeposit',
					onClick: '{{$openBalancesum("accountToBankAccountAmountMap")}}',
					children: [{
						name: 'icon',
						component: 'Icon',
						showStyle: 'showy',
						fontFamily: 'edficon',
						type: 'yinhangqia',
					},{
						name: 'title',
						component: '::span',
						children: '银行账户：'
					},{
						name: 'number',
						component: '::a',
						children: '{{data.capitalAccount&&$convertData("accountToBankAccountAmountMap",data.capitalAccount.accountToBankAccountAmountMap[1])}}'
					}]
				},{
					name: 'cash',
					component: '::div',
					className: 'cash',
					onClick: '{{$openBalancesum("accountToCashAccountAmountMap")}}',
					children: [{
						name: 'icon',
						component: 'Icon',
						showStyle: 'showy',
						fontFamily: 'edficon',
						type: 'xianjin',
					},{
						name: 'title',
						component: '::span',
						children: '现金账户：'
					},{
						name: 'number',
						component: '::a',
						children: '{{data.capitalAccount &&$convertData("accountToCashAccountAmountMap",data.capitalAccount.accountToCashAccountAmountMap[1])}}'
					}]
				},{
					name: 'alipay',
					component: '::div',
					className: 'alipay',
					onClick: '{{$openBalancesum("accountToAlipayAmountMap")}}',
					_visible: '{{data.capitalAccount && !!data.capitalAccount.accountToAlipayAmountMap?true:false}}',
					children: [{
						name: 'icon',
						component: 'Icon',
						showStyle: 'showy',
						fontFamily: 'edficon',
						type: 'zhifubao',
					},{
						name: 'title',
						component: '::span',
						children: '支付宝：'
					},{
						name: 'number',
						component: '::a',
						children: '{{(data.capitalAccount&&data.capitalAccount.accountToAlipayAmountMap)?$convertData("accountToAlipayAmountMap",data.capitalAccount.accountToAlipayAmountMap[1]):0}}'
					}]
				},{
					name: 'wechat',
					component: '::div',
					className: 'wechat',
					onClick: '{{$openBalancesum("accountToWeChatAmountMap")}}',
					_visible: '{{data.capitalAccount && !!data.capitalAccount.accountToWeChatAmountMap?true:false}}',
					children: [{
						name: 'icon',
						component: 'Icon',
						showStyle: 'showy',
						fontFamily: 'edficon',
						type: 'weixin',
					},{
						name: 'title',
						component: '::span',
						children: '微信：'
					},{
						name: 'number',
						component: '::a',
						children: '{{(data.capitalAccount&&data.capitalAccount.accountToWeChatAmountMap)?$convertData("accountToWeChatAmountMap",data.capitalAccount.accountToWeChatAmountMap[1]):0}}'
					}]
				}]
			}
		}]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			
		}
	}
}
export function addThousandsPosition(input, isFixed) {
	// if (isNaN(input)) return null
    if (isNaN(input)) return ''
	let num

	if (isFixed) {
		num = parseFloat(input).toFixed(2)
	} else {
		num = input.toString()
	}
	let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g

	return num.replace(regex, "$1,")
}