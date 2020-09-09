import moment from 'moment'
export function getMeta() {
		return {
			name: 'root',
			component: '::div',
			className: 'ttk-scm-app-outline',
			children: [{
				name: 'header',
				component: '::div',
				className: 'ttk-scm-app-outline-header',
				children: [{
					name: 'left',
					component: '::div',
					className: 'ttk-scm-app-outline-header-left',
					children: [{
						name: 'period',
						component: 'DatePicker.MonthPicker',
						dropdownClassName: '{{data.isCurrent ? "" : "financial-assistance"}}',
						value: '{{$stringToMoment(data.filter.period)}}',
						onChange: "{{$depreciationChange}}",
					},
					{
						name: 'refreshBtn',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'shuaxin',
						className: 'mk-normalsearch-reload',
						title:'刷新',
						onClick: '{{$refresh}}'
					}]
				},{
					name: 'right',
					component: '::div',
					className: 'ttk-scm-app-outline-header-right',
					onClick: '{{$downloadText}}',
					children: [{
						name: 'btn',
						component: 'Button',
						className: 'btn',
						size: 'small',
						children: '同步数据',
					}]
				}]
			},{
				name: 'content',
				className: 'ttk-scm-app-outline-content',
				component: 'Layout',
				children: '{{$getContentChildren()}}',
			}]
		}
}


export function getInitState() {
	return {
		data: {
			filter: {
				simpleCondition: '',
				period: moment().format('YYYY-MM')
			},
			list: [],
			loading: false,
			tableOption: {
                y: null
			},
			other: {}
		}
	}
}