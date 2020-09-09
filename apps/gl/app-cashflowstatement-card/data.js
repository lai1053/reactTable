export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		onMouseDown: '{{$mousedown}}',
		className: 'app-cashflowstatement-card',
		children: [{
			name: 'header',
			component: '::div',
			className: 'app-cashflowstatement-card-header',
			children: [{
				name: 'refresh',
				component: 'Layout',
				className: 'app-cashflowstatement-card-header-left',
				children: '{{"启用期间："+ data.period}}'
			},
			// {
			// 	name: 'save',
			// 	component: 'Button',
			// 	children: '保存',
			// 	className: 'app-cashflowstatement-card-header-right',
			// 	onClick: '{{$save}}'
			// }
		]
		},
		{
			name: 'doubleRowContent',
			className: 'app-account-beginbalance-content',
			component: '::div',
			_visible: '{{!data.other.isDisplaySingleRowGrid}}',
			children: [{
				name: 'report2',
				pagination: false,
				className: '{{$getTableClassName()}}',
				id: 'app-account-beginbalance-doubleRowContent-id',
				component: 'Table',
				pagination: false,
				// key: '{{Math.random()}}',
				scroll: '{{ {x: 600, y: 400} }}',
				// scroll: '{{ !data.other.isNotJanuary || data.list.length == 0 ? {} : data.filter.isCalcMulti ? {x: 1900, y: data.other.scrollY} :  {x: 1500, y: data.other.scrollY}}}',
				// scroll: '{{{y: data.other.scrollY} }}',
				allowColResize: false,
				enableSequenceColumn: false,
				bordered: true,
				dataSource: '{{data.list}}',
				columns: doubleRowGridColumns,
				loading: '{{data.other.isLoading}}'
			}]
		},
		// {
		// 	name: 'header',
		// 	component: '::div',
		// 	className: 'textred',
		// 	children: '{{data.textWord}}'
		// }
	]
	}
}
export const doubleRowGridColumns = [
	{
		width: '40%',
		title: '项目',
		dataIndex: 'name',
		width:'57%',
		key: 'name',
		// render: "{{function(_rowIndex, v, index){return $renderNameColumn(v, index)}}}"
	}, {
		width: '30%',
		title: '行次',
		key: 'accountName',
		width:'10%',
		dataIndex: 'rowNo',
		// render: "{{function(_rowIndex, v, index){return $renderNameColumn(v, index)}}}"
	},
	{
		title: '金额',
		key: 'amount',
		dataIndex: 'amount',
		width: '33%',
		render: "{{function(_rowIndex, v, index){return $renderColumns('amount', v, _ctrlPath, index)}}}"
	},
	// {
	// 	width: '50px',
	// 	title: '操作',
	// 	key: 'voucherState',
	// 	fixed: '{{!data.other.isNotJanuary ? "" : "right"}}',
	// 	align: 'center',
	// 	className: 'table_fixed_width',
	// 	_visible: '{{!!data.other.isDisplayOperation}}',
	// 	// render: "{{function(record, v, index){return $operateCol(record, index)}}}"
	// }
]
//去除千分位
export function clearThousandsPosition(num) {
	if (num && num.toString().indexOf(',') > -1) {
		let x = num.toString().split(',')
		return parseFloat(x.join(""))
	} else {
		return num
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
export function getInitState() {
	return {
		data: {
			list: [],
			period: '',
			textWord: '',
			other: {

			}
		}
	}
}
