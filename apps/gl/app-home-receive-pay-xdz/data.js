export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'edfx-app-home-receive-pay-xdz',
		children: [{
			name: 'top',
			component: 'Layout',
			// className: 'edfx-app-hot-search-widget-top',
			children: [{
				name: 'header',
				component: 'Layout',
				className: 'edfx-app-home-receive-pay-xdz-header',
				children: [{
					name: 'left',
					component: '::div',
					className: 'edfx-app-home-receive-pay-xdz-header-left',
					children: [
						{
							name: 'name',
							component: '::span',
							children: '应收应付'
						},{
							name: 'selectTime',
							component: '::div',
							className: 'edfx-app-home-receive-pay-xdz-header-left-select',
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
				}, 
				{
					name: 'right',
					component: '::div',
					className:'edfx-app-home-receive-pay-xdz-header-right',
					children: {
						name:'btn',
						component:'Radio.Group',
						onChange:`{{function(v){$fieldChange('data.form.value',v.target.value)}}}`,
						// defaultValue:'0',
						children: [
							{
								name:'button1',
								component: 'Radio.Button',
								className: '{{data.type == "chart"?"focusIcon":"unfocusIcon"}}',
								value:'0',
								children:{
									name: 'baobiao',
									component: 'Icon',
									fontFamily: 'edficon',
									className: 'chart',
									type: 'baobiao',
									title: '图表',
									key:'chart',
									// onClick:'{{$getChartOption()}}'
								},
							},{
								name:'button2',
								component: 'Radio.Button',
								className: '{{data.type == "table"?"focusIcon":"unfocusIcon"}}',
								value:'1',
								children:{
									name: 'table',
									component: 'Icon',
									fontFamily: 'edficon',
									className: 'table',
									type: 'biaoge',
									title: '列表',
									key:'table',
									// onClick:'{{$getChartOption()}}'
								},
							},
							{
								name: 'refresh',
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'refresh homeIcon',
								type: 'shuaxin',
								title: '刷新',
								onClick: '{{$refresh}}'
							},
							{
								name: '展开',
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'unfold homeIcon',
								type: '{{data.fold ? "shouhui" : "zhankai"}}',
								title: '{{data.fold ? "收回" : "展开"}}',
								onClick: '{{function(){$fold("receive")}}}'
							},
						]
					}
				}
			]
			}, {
				name: 'spin',
				component: 'Spin',
				tip: '数据加载中...',
				spinning: '{{data.loading}}',
				children: {
					name:'content',
					key: '{{data.other.mathRandom}}',
					component: '::div',
					className: 'edfx-app-home-receive-pay-xdz-content',
					children: '{{$getContent()}}',
					ref:'aaa'
					// children: {
					// 	name: 'item',
					// 	component: '::div',
					// 	className: '{{data.type == "table"?"rctable":"rcchart"}}',
					// 	children: '{{$getContent()}}'
					// }
				}
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			periodList:[],
			list: [],
			option: {
				
			},
			type:'chart',
			period: '',
			form: {
				value: '',
				// period: '22'
			},
			loading: false,
			other: {
				mathRandom: Math.random(),
				action: 'out',
				emptyData: true
			}
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
export function clearThousandsPosition(num) {
	if (num && num.toString().indexOf(',') > -1) {
		let x = num.toString().split(',')
		return parseFloat(x.join(""))
	} else {
		return num
	}
}