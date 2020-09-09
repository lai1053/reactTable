export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'inv-app-checkCertificatoin-filter',
		children: [
			{
				name: 'filter',
				className: 'inv-app-checkCertificatoin-filterInput',
				component: '::div',
				children: [
					{ // 输入框
						name:'input',
						component:'Input',
						className:'inv-app-checkCertificatoin-filter-input',
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
						popupClassName: 'inv-app-checkCertificatoin-filter-popover',
						placement: 'bottom',
						title:'筛选条件',
						content:{
							name:'::div',
							component: '::div',
							className:'inv-app-checkCertificatoin-filter-popover-body',
							children:[
								{
									name:'content',
									component: '::div',
									className:'inv-app-checkCertificatoin-filter-popover-body-content',
									children:[
										{
											name:'item1',
											component: '::div',
											className:'inv-app-checkCertificatoin-filter-popover-body-content-item',
											children:[
												{
													name:'label',
													component: '::span',
													children:'发票类型',
													className:'inv-app-checkCertificatoin-filter-popover-body-content-item-left',
												},{
													name:'select',
													component:'Select',
													placeholder:'发票类型',
													className:'inv-app-checkCertificatoin-filter-popover-body-content-item-select',
													onChange:"{{function(v){$sf('data.form.fpzlDm',v)}}}",
													value:'{{data.form.fpzlDm}}',
													getPopupContainer:'{{function(trigger){return trigger.parentNode} }}',
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
											className: 'inv-app-checkCertificatoin-filter-popover-body-content-item',
											component: '::div',
											children: [
												{
													name: 'label',
													className: 'inv-app-checkCertificatoin-filter-popover-body-content-item-left',
													component: '::span',
													children: '发票号码',					
												},{
													name: 'popover-input',
													className: 'inv-app-checkCertificatoin-filter-popover-body-content-item-input',
													component: 'Input',
													placeholder: '请输入发票号码',
													onChange: '{{function(v){console.log(v.target.selectionStart,v.target.value.length,"1111111111111");$sf("data.form.fphm",v.target.value)}}}',
													value:'{{data.form.fphm}}'
												}
											]
										},
										{
											name: 'item3',
											className: 'inv-app-checkCertificatoin-filter-popover-body-content-item',
											component: '::div',
											children: [
												{
													name: 'label',
													className: 'inv-app-checkCertificatoin-filter-popover-body-content-item-left',
													component:'::span',
													children: '勾选状态'
												},{
													name: 'select',
													className: 'inv-app-checkCertificatoin-filter-popover-body-content-item-select',
													component: 'Select',
													placeholder: '请选择勾选状态',
													getPopupContainer: '{{function(trigger){return trigger.parentNode}}}',
													value: '{{data.form.gxbz}}',
													onChange: '{{function(v){$sf("data.form.gxbz", v)}}}',
													children: {
														name: 'option',
														className: 'check-status-option',
														component: 'Select.Option',
														_power: 'for in data.gxbzList',
														children: '{{String(data.gxbzList[_rowIndex].gxbzMc)}}',
														value: '{{String(data.gxbzList[_rowIndex].gxbz)}}'
													}
												}
											]
										},
										{
											name: 'item4',
											className: 'inv-app-checkCertificatoin-filter-popover-body-content-item',
											component: '::div',
											children: [
												{
													name: 'label',
													className: 'inv-app-checkCertificatoin-filter-popover-body-content-item-left',
													component:'::span',
													children: '认证状态'
												},{
													name: 'select',
													className: 'inv-app-checkCertificatoin-filter-popover-body-content-item-select',
													component: 'Select',
													placeholder: '请选择认证状态',
													getPopupContainer: '{{function(trigger){return trigger.parentNode}}}',
													value: '{{data.form.rzzt}}',
													onChange: '{{function(v){$sf("data.form.rzzt", v)}}}',
													children: {
														name: 'option',
														className: 'check-status-option',
														component: 'Select.Option',
														_power: 'for in data.rzztList',
														children: '{{String(data.rzztList[_rowIndex].rzztMc)}}',
														value: '{{data.rzztList[_rowIndex].rzzt}}'
													}
												}
											]
										},
										{
											name:'item5',
											component: '::div',
											className:'inv-app-checkCertificatoin-filter-popover-body-content-item',
											children:[
												{
													name:'label',
													component: '::span',
													children:'开票日期',
													className:'inv-app-checkCertificatoin-filter-popover-body-content-item-left',
												},{
													name:'sdate',
													component:'DatePicker',
													disabledDate:'{{$disabledStartDate}}',
													defaultValue: "{{$stringToMoment((data.form.kprqq),'YYYY-MM-DD')}}",
													onChange: "{{function(v){$sf('data.form.kprqq', $momentToString(v,'YYYY-MM-DD'))}}}",
													allowClear:true,
													format:"YYYY-MM-DD",
													placeholder:'选择日期',
													className:'inv-app-checkCertificatoin-filter-popover-body-content-item-date',
													// getPopupContainer:'{{function(trigger){return trigger.parentNode}}}',
													getCalendarContainer: '{{function(trigger) {return trigger.parentNode}}}',
													value: "{{$stringToMoment((data.form.kprqq),'YYYY-MM-DD')}}"
												},{
													name:'span',
													component: '::span',
													children:'-',
													className:'inv-app-checkCertificatoin-filter-popover-body-content-item-::divider',
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
													className:'inv-app-checkCertificatoin-filter-popover-body-content-item-date',
													value: "{{$stringToMoment((data.form.kprqz),'YYYY-MM-DD')}}"
												}
											]
										}
									],
								},
								{
									name:'footer',
									component: '::div',
									className:'inv-app-checkCertificatoin-filter-popover-body-footer',
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
							className: 'inv-app-checkCertificatoin-filter-popover-filter',
							children:{
								name: 'filter',
								component: 'Icon',
								type: 'filter',
							}
						}
					}
				]
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
			visible:false,
			fpzlcsVoList: [],
			gxbzList: [],
			rzztList: [],
			xfmc: '', // 销方名称
			form:{
				"fpzlDm": undefined, // -- 发票种类代码 01 增值税专用发票,03 机动车销售发票,10 税局代开增税发票,17 通行费发票 非必填
				"fphm": undefined,  //"4400191130",   //-- 发票代码 非必填
				"rzzt": undefined,  // --认证状态 默认未0 必填
				"kprqq": undefined, //"2018-04-13",   //--开票日期起 非必填
				"kprqz": undefined,  //"2018-04-13",   //--开票日期止 非必填
				"gxbz": undefined,   // --勾选状态 Y 已勾选 N 未勾选 非必填
				"gfsbh": ""
			},
			filterForm: {
				"fpzlDm": undefined, // -- 发票种类代码 01 增值税专用发票,03 机动车销售发票,10 税局代开增税发票,17 通行费发票 非必填
				"fphm": undefined,  //"4400191130",   //-- 发票代码 非必填
				"rzzt": undefined,  // --认证状态 默认未0 必填
				"kprqq": undefined, //"2018-04-13",   //--开票日期起 非必填
				"kprqz": undefined,  //"2018-04-13",   //--开票日期止 非必填
				"gxbz": undefined,   // --勾选状态 Y 已勾选 N 未勾选 非必填
				"gfsbh": ""
			}
		}
	}
}