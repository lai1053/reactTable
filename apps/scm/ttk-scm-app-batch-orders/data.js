export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-batch-orders',
		children: [{
			name: 'top',
			className: 'ttk-scm-app-batch-orders-top',
			component: '::div',
			children: [/*{
				component: 'Form.Item',
				label: '单据日期',
				children: [{
					name: 'businessDate',
					component: 'DatePicker',
					allowClear: false,
					// className: 'app-proof-of-charge-form-header-date-picker',
					value: '{{data.businessDate}}',
					onChange: `{{function(d){$changeDate(d)}}}`,
					disabledDate: `{{function(current){ return $getDisabledDate(current)}}}`
				}]
			}, */{
				name: 'top-content',
				component: '::div',
				className: 'top-content',
				children: [{
					name: 'name',
					component: 'Form.Item',
					label: '账户',
					children: [{
						name: 'name',
						component: 'Input',
						className: 'name',
						disabled: true,
						value: '{{data.name}}',
					}]
				}, {
					component: 'Button',
					//type: 'primary',
					children: '批量修改收支类型',
					className: 'btn',
					onClick: '{{function(){$changeBussnisType()}}}'
				}/*, {
					component: 'Button',
					type: 'primary',
					children: '生成单据',
					className: 'btn',
					onClick: '{{function(){$save()}}}'
				}*/]
			}]
		}, {
			className: 'ttk-scm-app-batch-orders-body',
			name: 'report',
			component: 'Table',
			pagination: false,
			// scroll: '{{ data.colums <= 1000 ? ( (data.form.activeTab =="balancesheet" ?data.balancesheetColList.length : (data.form.activeTab == "profitstatement"? data.profitstatementColList.length: data.cashflowstatementColList.length)) <= 7 ? {x:0,y:0}:{x:0,y:245}) : ((data.form.activeTab =="balancesheet" ?data.balancesheetColList.length : (data.form.activeTab == "profitstatement"? data.profitstatementColList.length: data.cashflowstatementColList.length)) <= 7 ? {x:(data.colums+50), y:0} : {x:(data.colums+50), y:245})}}',
			allowColResize: false,
			enableSequenceColumn: true,
			bordered: true,
			dataSource:'{{data.bankReconciliatios}}',
			noCalculate: true,
			// defaultExpandAllRows: true,
			rowSelection: '{{$getRowSelection()}}',
			checkboxKey: '{{data.other.checkboxKey}}',
			checkboxChange: '{{$checkboxChange}}',
			checkboxValue: '{{data.other.tableCheckbox.checkboxValue}}',
			scroll: '{{data.bankReconciliatios.length > 0 ? data.tableOption : {} }}',
			columns: '{{$renderColumns()}}'
		}, {
			name: 'footer',
			component: '::div',
			className: 'footer',
			children: [{
				component: 'Button',
				//type: 'primary',
				children: '保存',
				className: 'btn',
				onClick: '{{function(){$saveClick()}}}'
			}, {
				component: 'Button',
				type: 'primary',
				children: '下一步',
				className: 'btn',
				onClick: '{{function(){$nextClick()}}}'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			bankAccountId: '',
			name: '', //账户名称
			bankReconciliatios: [],	//对账单列表
			payBusinessType: [],	//收支类型(付款单)
			receiveBusinessType: [],	//收支类型(收款单)
			other: {
				customer: [],
				supplier: [],
				department: [],
				project: [],
				person: [],
				checkboxKey:'id',
				tableCheckbox: {
					checkboxValue: []
				},
			},
			tableOption: {
			},
		}
	}
}