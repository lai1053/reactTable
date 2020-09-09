export function getMeta() {
	return {
		name: 'root',
		className: 'app-account-beginbalance-changePeriod',
		component: 'Layout',
		children: [{
			name: 'topTipDiv',
			component: '::div',
			className: 'app-account-beginbalance-changePeriod-instructDiv',
			children: '注意：修改启用期间，必须刷新您的当前企业，刷新您的企业可能会关闭所有的窗口，请确定您是否要修改启用期间。'
		},{
			name: 'bottomDiv',
			component: '::div',
			className: 'app-account-beginbalance-changePeriod-selectDiv',
			children: [{
				name: 'setInstruct',
				component: '::span',
				children: '请设置启用月份:'
			},{
				name: 'selectYear',
				className: 'app-account-beginbalance-changePeriod-selectYear',
				component: 'Select',
				style: {width: '120px'},
				defaultValue: '{{data.selectYear}}',
				onChange: '{{$changeYearOption}}',
				children: {
					name: 'option',
					component: 'Select.Option',
					value: "{{ data.yearList && data.yearList[_rowIndex] }}",
					children: '{{data.yearList && data.yearList[_rowIndex]}}',
					_power: 'for in data.yearList'
				}
			},{
				name: 'selectMonth',
				className: 'app-account-beginbalance-changePeriod-selectMonth',
				component: 'Select',
				style: {width: '120px'},
				defaultValue: '{{data.selectMonth}}',
				onChange: '{{$changeMonthOption}}',
				children: {
					name: 'option',
					component: 'Select.Option',
					value: "{{ data.monthList && data.monthList[_rowIndex]}}",
					children: '{{data.monthList && data.monthList[_rowIndex] }}',
					_power: 'for in data.monthList'
				}
			}]
		}]
	}
}

export function getInitState(option) {
	return {
		data: {
			selectYear: option.enabledYear,
			selectMonth: option.enabledMonth,
			yearList:[2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019],
			monthList: [],
			id: option.accountTypeId,
			ts: option.ts
		}
	}
}