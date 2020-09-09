export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'inv-app-deduct-filter',
		children: [
			{
				name: 'filter',
				className: 'inv-app-deduct-filterInput',
				component: '::div',
				children: [
					{ // 输入框
						name:'input',
						component:'Input',
						className:'inv-app-deduct-filter-input',
						type:'text',
						placeholder: '请输入销方名称',
						allowClear:true,
						enterButton:false,
						prefix: {
							  name: 'search',
							  component: 'Icon',
							  type: 'search',
						},
						onChange:"{{function(v) {$sf('data.xfmc', v.target.value)}}}",
						onPressEnter:'{{$handerSearch}}',
					},{  // 浮出框
						name: 'popover',
						component: 'Popover',
						popupClassName: 'inv-app-deduct-filter-popover',
						placement: 'bottom',
						title:'筛选条件',
						content:{
							name:'::div',
							component: '::div',
							className:'inv-app-deduct-filter-popover-body',
							children:[
								{
									name:'content',
									component: '::div',
									className:'inv-app-deduct-filter-popover-body-content',
									children:[
										{
											name:'item1',
											component: '::div',
											className:'inv-app-deduct-filter-popover-body-content-item',
											children:[
												{
													name:'label',
													component: '::span',
													children:'发票类型',
													className:'inv-app-deduct-filter-popover-body-content-item-left',
												},{
													name:'select',
													component:'Select',
													placeholder:'请选择发票类型',
													className:'inv-app-deduct-filter-popover-body-content-item-select',
													onChange:"{{function(val){$sf('data.form.fpzlDm',val)}}}",
													value:'{{data.form.fpzlDm}}',
													getPopupContainer:'{{function(trigger){return trigger.parentNode}}}',
													children:{
														name:'option',
														component: 'Select.Option',
														children:'{{data.fpzlcsVoList[_rowIndex].fpzlMc}}',
														value:'{{String(data.fpzlcsVoList[_rowIndex].fpzlDm)}}',
														_power:'for in data.fpzlcsVoList',
													}
												}
											]
										},
										{
											name: 'item2',
											className: 'inv-app-deduct-filter-popover-body-content-item',
											component: '::div',
											children: [
												{
													name: 'label',
													className: 'inv-app-deduct-filter-popover-body-content-item-left',
													component: '::span',
													children: '发票号码',					
												},{
													name: 'popover-input',
													className: 'inv-app-deduct-filter-popover-body-content-item-input',
													component: 'Input',
													placeholder: '请输入发票号码',
													defaultValue: '{{data.form.fphm}}',
													value: '{{data.form.fphm}}',
													onChange: '{{function(v){$sf("data.form.fphm",v.target.value)}}}'
												}
											]
										},				
										{
											name:'item5',
											component: '::div',
											className:'inv-app-deduct-filter-popover-body-content-item',
											children:[
												{
													name:'label',
													component: '::span',
													children:'开票日期',
													className:'inv-app-deduct-filter-popover-body-content-item-left',
												},{
													name:'sdate',
													component:'DatePicker',
													disabledDate:'{{$disabledStartDate}}',
													// getPopupContainer:'{{function(trigger){return trigger.parentNode}}}',
													getCalendarContainer: '{{function(trigger) {return trigger.parentNode}}}',
													defaultValue: "{{$stringToMoment((data.form.kprqq),'YYYY-MM-DD')}}",
													onChange: "{{function(v){$sf('data.form.kprqq', $momentToString(v,'YYYY-MM-DD'))}}}",
													allowClear:true,
													format:"YYYY-MM-DD",
													placeholder:'选择日期',
													className:'inv-app-deduct-filter-popover-body-content-item-date',
													value: "{{$stringToMoment((data.form.kprqq),'YYYY-MM-DD')}}"
												},{
													name:'span',
													component: '::span',
													children:'-',
													className:'inv-app-deduct-filter-popover-body-content-item-::divider',
												},{
													name:'edate',
													component:'DatePicker',
													disabledDate:'{{$disabledEndDate}}',
													placeholder:'选择日期',
													allowClear:true,
													format:"YYYY-MM-DD",
													// getPopupContainer:'{{function(trigger){return trigger.parentNode}}}',
													getCalendarContainer: '{{function(trigger) {return trigger.parentNode}}}',
													defaultValue: "{{$stringToMoment((data.form.kprqz),'YYYY-MM-DD')}}",
													onChange: "{{function(v){$sf('data.form.kprqz', $momentToString(v,'YYYY-MM-DD'))}}}",
													className:'inv-app-deduct-filter-popover-body-content-item-date',
													value: "{{$stringToMoment((data.form.kprqz),'YYYY-MM-DD')}}"
												}
											]
										}
									],
								},
								{
									name:'footer',
									component: '::div',
									className:'inv-app-deduct-filter-popover-body-footer',
									children:[
										{
											name:'reset',
											component:'Button',
											children:'重置',
											onClick:'{{$handerReset}}'
										},{
											name:'ok',
											component:'Button',
											type:'primary',
											children:'查询',
											onClick:'{{$handerSearch}}'
										}
									]
								}
							]
						},
						trigger: "click",
						visible:'{{data.visible}}',
						onVisibleChange:'{{$handleVisibleChange}}',
						children: {
							name: 'filterSpan',
							component: '::span',
							className: 'inv-app-deduct-filter-popover-filter',
							children:{
								name: 'filter',
								component: 'Icon',
								type: 'filter',
							}
						}
					}
				]
			},{ // 税款所属期
				name:'tax_period',
				className: 'inv-app-deduct-filter-tax-period',
				component: '::span',
				children:[{
					name: 'spanToSpan1',
					className: 'inv-app-deduct-filter-tax-period-label',
					component: '::span',
					children: '抵扣月份： '
				},{
					name: 'spanToSpan2',
					className: 'inv-app-deduct-filter-tax-period-time',
					component: 'DatePicker.MonthPicker',
					placeholder: '请选择月份',
					allowClear: false,
					onChange: '{{$dkyfChange}}',
					defaultValue: '{{$stringToMoment((data.dkyf),"YYYY-MM")}}'
				}]
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
			visible: false,
			fpzlcsVoList:[],
			xfmc: '',
			dkyf: '',
			form:{
				kprqq: undefined,
				kprqz: undefined,
				fpzlDm: undefined, //发票类型代码
				fphm: '', //发票号码
				fpdm: ''
			},
			filterForm: {
                kprqq: undefined,
				kprqz: undefined,
				fpzlDm: undefined, //发票类型代码
				fphm: '', //发票号码
				fpdm: ''
			}
		}
	}
}