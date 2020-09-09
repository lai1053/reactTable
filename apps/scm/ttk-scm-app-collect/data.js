import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-scm-app-collect',
		children: {
			name: 'mail',
			component: 'Spin',
			tip: '{{data.other.tip}}',
			spinning: '{{data.loading}}',
			children:[{
						name: 'lettt',
						component: '::div',
						className: 'ttk-scm-app-collect-flag',
						children: '{{$getName()}}',
						// children: '注：包含本月认证发票和本月开具发票',
						_visible: '{{data.other.flag == "pu"}}'
					},
					{
						name: 'tip',
						component: '::div',
						_visible: '{{data.other.flag==="authenticatedInvoice"}}',
						className: 'ttk-scm-app-collect-flag',
						style: {
							fontSize: 12,
							textIndent: '25px',
							lineHeight: 1.6,
							position: 'relative',
							top: 15
						},
						children: '{{"注：采集"+data.currentDateString+"月份之前全部未认证发票（包含"+data.currentDateString+"月份）和"+data.dateString+"月份已认证增值税专用发票和机动车发票，最长可采集1年以内的发票数据"}}'
					},
					{
						name: 'date',
						component: 'Form.Item',
						label: '采集发票月份',
						_visible: '{{!data.small}}',
						children: {
							name: 'date',
							component: 'DatePicker.MonthPicker',
							allowClear: false,
							className: 'collectDate-picker',
							value: '{{data.date}}',
							onChange: '{{$dateChange}}',
							disabledDate: '{{$disabledRangePicker}}'
						}
					},
					{
						name: 'checkbox1',
						component: '::div',
						className: 'checkbox1',
						_visible: '{{data.small}}',
						children: [{
							name: 'checkbox',
							component: 'Radio',
							checked: '{{data.form.issuedByTax}}',
							children: '按月采集发票',
							onChange: '{{$issuedByTaxonChange}}'
						}]
					},
					{
						name: 'date',
						component: 'Form.Item',
						className: 'date',
						_visible: '{{data.small}}',
						children: {
							name: 'date',
							component: 'DatePicker.MonthPicker',
							allowClear: false,
							className: 'collectDate-picker',
							value: '{{data.date}}',
							onChange: '{{$dateChange}}',
							disabled: '{{!data.form.issuedByTax}}',
							disabledDate: '{{$disabledRangePicker}}'
						}
					},{
						name: 'checkbox2',
						component: '::div',
						className: 'checkbox2',
						_visible: '{{data.small}}',
						children: [{
							name: 'checkbox',
							component: 'Radio',
							checked: '{{!data.form.issuedByTax}}',
							children: '按季采集发票',
							onChange: '{{$issuedByTaxonChange}}'
						}]
					},{
						name: 'year',
						component: 'Form.Item',
						_visible: '{{data.small}}',
						className: 'year',	
						children: [{
							name: 'select',
							component: 'Select',
							allowClear:false,
							value: '{{data.year}}',
							dropdownStyle: { width: '75px' },
							disabled: '{{data.form.issuedByTax}}',
							onChange: `{{function(v){$fieldChangeYear(v)}}}`,
							children: {
								name: 'option',
								component: 'Select.Option',
								value: '{{data.other.year && data.other.year[_rowIndex].id}}',
								children: '{{data.other.year && data.other.year[_rowIndex].name}}',
								_power: 'for in data.other.year'
							}
						}]
					},{
						name: 'quarter',
						component: 'Form.Item',
						_visible: '{{data.small}}',
						className: 'select',	
						children: [{
							name: 'select',
							component: 'Select',
							allowClear:false,
							value: '{{data.form.quarterId}}',
							disabled: '{{data.form.issuedByTax}}',
							onChange: `{{function(v){$fieldChange(v)}}}`,
							children: {
								name: 'option',
								component: 'Select.Option',
								value: '{{data.other.quarter && data.other.quarter[_rowIndex].id}}',
								children: '{{data.other.quarter && data.other.quarter[_rowIndex].name}}',
								_power: 'for in data.other.quarter'
							}
						}]
					}]
		},

	}
}

export function getInitState() {
	return {
		data: {
			//date: moment().subtract(1, "months").startOf('month'),//采集发票月份
			date: null,
			small: false,
			dateString: null,
			currentDateString:moment().format('YYYY-MM'),
			accountDate: null,//单据日期
			loading: true,
			enableddate: null,
			other: {
				bankAccount: [
				],
				quarter: [{id:1,name:'第一季度'},{id:2,name:'第二季度'},{id:3,name:'第三季度'},{id:4,name:'第四季度'}],
				year: [{id:2019,name:'2019'},{id:2018,name:'2018'},{id:2017,name:'2017'},{id:2016,name:'2016'}],
				tip: '正在获取采集日期...'
			},
			form: {
				quarterId: 1,
				bankAccountId: '暂未付款',
				issuedByTax: true,
			}
		}
	}
}