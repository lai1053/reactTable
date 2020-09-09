export function getMeta() {
	return {
		name: 'root',
		className: 'app-proof-of-charge-selectPeriod',
		component: 'Layout',
		children: [{
			name: 'bottomDiv',
			component: '::div',
			className: 'app-proof-of-charge-selectPeriod-selectDiv',
			children: [{
				name: 'setInstruct',
				component: '::span',
				children: '请选择凭证月份:'
			},{
				name: 'selectYear',
				className: 'app-proof-of-charge-selectPeriod-selectYear',
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
				className: 'app-proof-of-charge-selectPeriod-selectMonth',
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
