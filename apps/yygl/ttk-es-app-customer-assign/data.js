import {columnData} from "../ttk-es-app-customer/fixedData";

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-customer-assign',
		children: {
			name: 'spin-box',
			component: 'Spin',
			spinning:  '{{data.loading}}',
            size: 'large',
            tip: '数据加载中...',
			delay: 1,
			wrapperClassName: 'spin-box',
			children:[
				{//表头配置
					name: 'tablesetting',
					component: 'TableSettingCard',
					data: '{{data.other.columnDto}}',
					showTitle: '{{data.showTitle}}',
					positionClass: 'inv-batch-custom-table',
					visible: '{{data.showTableSetting}}',//显示隐藏控制
					confirmClick: '{{function(data){$upDateTableSetting({value: false, data: data})}}}',
					cancelClick: '{{function(){$closeTableSetting()}}}',
					resetClick: '{{function(){$resetTableSetting({data: data})}}}'
				},{
					name: 'inv-batch-custom-header',
					component: '::div',
					className: 'inv-batch-custom-header',
					children: [
						{
							name: 'header-left',
							className: 'header-left',
							component: '::div',
							children: [
								{
									name: 'tree',
									component: '::span',
									style: {
										verticalAlign: 'middle',
										marginRight: '8px'
									},
									children: '{{$renderTree()}}'
								},
								{
									name: 'header-filter-input',
									component: 'Input',
									className: 'inv-batch-custom-header-filter-input',
									type: 'text',
									placeholder: '请输入客户名称或助记码',
									value: "{{data.inputVal}}",
									onChange: "{{function (e) {$sf('data.inputVal', e.target.value)}}}",
									onPressEnter: '{{$onSearch}}',
									prefix: {
										name: 'search',
										component: 'Icon',
										type: 'search'
									}
								}, {
									name: 'popover',
									component: 'Popover',
									popupClassName: 'inv-batch-custom-popover',
									placement: 'bottom',
									title: '',
									content: {
										name: 'popover-content',
										component: '::div',
										className: 'inv-batch-custom-popover-content',
										children: [
											{
												name: 'filter-content',
												component: '::div',
												className: 'filter-content',
												children: [
													{
														name: 'customer-type',
														component: '::div',
														className: 'inv-batch-custom-popover-item',
														children: [{
															name: 'label',
															component: '::span',
															children: '客户类型：',
															className: 'inv-batch-custom-popover-label'
														}, {
															name: 'select',
															component: 'Select',
															className: 'inv-batch-custom-popover-option',
															getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
															value: '{{data.formContent.customerTypeStatus}}',
															onChange: "{{function (e) {$sf('data.formContent.customerTypeStatus', e)}}}",
															children: {
																name: 'option',
																component: '::Select.Option',
																children: '{{data.customerType[_rowIndex].name}}',
																value: '{{data.customerType[_rowIndex].value}}',
																_power: 'for in data.customerType',
															}
														}]
													},{
                                                        name: 'customer-service',
                                                        component: '::div',
                                                        className: 'inv-batch-custom-popover-item',
                                                        children: [{
                                                            name: 'label',
                                                            component: '::span',
                                                            children: '服务类型：',
                                                            className: 'inv-batch-custom-popover-label'
                                                        }, {
                                                            name: 'select',
                                                            component: 'Select',
                                                            className: 'inv-batch-custom-popover-option',
                                                            getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                            value: '{{data.formContent.serviceTypeStatus}}',
                                                            onChange: "{{function (e) {$sf('data.formContent.serviceTypeStatus', e)}}}",
                                                            children: {
                                                                name: 'option',
                                                                component: '::Select.Option',
                                                                children: '{{data.serviceType[_rowIndex].name}}',
                                                                value: '{{data.serviceType[_rowIndex].value}}',
                                                                _power: 'for in data.serviceType'
                                                            }
                                                        }]
                                                    }, {
														name: 'customer-assign',
														component: '::div',
														className: 'inv-batch-custom-popover-item',
														_visible:'{{data.js==2}}',
														children: [{
															name: 'label',
															component: '::span',
															children: '分配状态：',
															className: 'inv-batch-custom-popover-label'
														}, {
															name: 'select',
															component: 'Select',
															className: 'inv-batch-custom-popover-option',
															getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
															value: '{{data.formContent.assignTypeStatus}}',
															onChange: "{{function (e) {$sf('data.formContent.assignTypeStatus', e)}}}",
															children: {
																name: 'option',
																component: '::Select.Option',
																children: '{{data.assignType[_rowIndex].name}}',
																value: '{{data.assignType[_rowIndex].value}}',
																_power: 'for in data.assignType'
															}
														}]
													}, {
														name: 'customer-job',
														component: '::div',
														className: 'inv-batch-custom-popover-item',
														children: [{
															name: 'label',
															component: '::span',
															children: '岗位：',
															className: 'inv-batch-custom-popover-label'
														}, {
															name: 'select',
															component: 'Select',
															className: 'inv-batch-custom-popover-option',
															getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
															value: '{{data.formContent.jobTypeStatus}}',
															onChange: "{{function (e) {$sf('data.formContent.jobTypeStatus', e),$customer(e)}}}",
															children: {
																name: 'option',
																component: '::Select.Option',
																children: '{{data.jobType[_rowIndex].caption}}',
																value: '{{data.jobType[_rowIndex].roleId}}',
																_power: 'for in data.jobType'
															}
														}]
													},{
														name: 'customer-user',
														component: '::div',
														className: 'inv-batch-custom-popover-item',
														children: [{
															name: 'label',
															component: '::span',
															children: '人员：',
															className: 'inv-batch-custom-popover-label'
														}, {
															name: 'select',
															component: 'Select',
															className: 'inv-batch-custom-popover-option',
															getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
															value: '{{data.formContent.customerName}}',
                                                            optionFilterProp: 'children',
															showSearch:true,
                                                            filterOption:true,
															onChange: "{{function (e) {$sf('data.formContent.customerName', e)}}}",
															// children: {
															// 	name: 'option',
															// 	component: '::Select.Option',
															// 	children: '{{data.jobType[_rowIndex].name}}',
															// 	value: '{{data.jobType[_rowIndex].value}}',
															// 	_power: 'for in data.jobType'
															// }
															children:'{{$userData(data.user)}}'
														}]
													},]
											}, {
												name: 'filter-footer',
												component: '::div',
												className: 'filter-footer',
												children: [
													{
														name: 'search',
														component: 'Button',
														type: 'primary',
														children: '查询',
														onClick: '{{$filterList}}'
													},{
														name: 'reset',
														className: 'reset-btn',
														component: 'Button',
														children: '重置',
														style:{marginRight:'10px'},
														onClick: '{{$resetForm}}'
													}
												]
											}]
									},
									trigger: 'click',
									visible: '{{data.showPopoverCard}}',
									onVisibleChange: "{{$handlePopoverVisibleChange}}",
									children: {
										name: 'filterSpan',
										component: '::span',
										className: 'inv-batch-custom-filter-btn header-item',
										children: {
											name: 'filter',
											component: 'Icon',
											type: 'filter'
										}
									}
								}
								// {
								//     name: 'tax-month',
								//     component: '::span',
								//     className: 'tax-month header-item',
								//     children: [{
								//         name: 'label',
								//         component: '::label',
								//         children: '报税月份：'
								//     }, {
								//         name: 'tax-date-picker',
								//         component: 'DatePicker.MonthPicker',
								//         value: '{{data.nsqj}}',
								//         format: 'YYYY-MM',
								//         onChange: "{{$handleMonthPickerChange}}"
								//     }]
								// }
							]
						}, {
							name: 'header-right',
							className: 'header-right',
							component: '::div',
							_visible:'{{data.qx != 0}}',
							children: [
								{
									name: '{{data.btnType[_rowIndex].name}}',
									//style:'{{{return{width:800}}}}',
									className: '{{data.btnType[_rowIndex].className}}',
									component: 'Button',
									type: '{{data.btnType[_rowIndex].type}}',
									children: '{{data.btnType[_rowIndex].children}}',
									_power: "for in data.btnType",
									onClick: '{{function () {$judgeChoseBill(data.btnType[_rowIndex].key)}}}'
								},
								// {//更多操作
								// 	name:'moreOpr',
								// 	component:'Dropdown',
								// 	className:'ant-dropdown-link',
								// 	overlay:{
								// 		name:'menu0',
								// 		component:'Menu',
								// 		children:[{
								// 			name:'menu1',
								// 			component: 'Menu.Item',
								// 			key:'export',
								// 			children: '导入分配'
								// 		}]
								// 	},
								// 	children:{
								// 		name:'menu4',
								// 		component: 'Button',
								// 		children: [' 更多 ',{
								// 			name:'moreIcon',
								// 			component:'Icon',
								// 			fontFamily:'',
								// 			style:{fontSize:'18px',verticalAlign:'middle'},
								// 			type:'down'
								// 		}]
								// 	}
								//
								// }
							]
						},
                        {
                            name: 'header-right',
                            className: 'header-right',
                            component: '::div',
                            _visible:'{{data.qx == 0}}',
                            children: [
                                {
                                    name: '{{data.btnTypeN[_rowIndex].name}}',
                                    //style:'{{{return{width:800}}}}',
                                    className: '{{data.btnTypeN[_rowIndex].className}}',
                                    component: 'Button',
                                    type: '{{data.btnTypeN[_rowIndex].type}}',
                                    children: '{{data.btnTypeN[_rowIndex].children}}',
                                    _power: "for in data.btnTypeN",
									disabled:true,
                                    // onClick: '{{function () {$judgeChoseBill(data.btnType[_rowIndex].key)}}}'
                                },
                                // {//更多操作
                                // 	name:'moreOpr',
                                // 	component:'Dropdown',
                                // 	className:'ant-dropdown-link',
                                // 	overlay:{
                                // 		name:'menu0',
                                // 		component:'Menu',
                                // 		children:[{
                                // 			name:'menu1',
                                // 			component: 'Menu.Item',
                                // 			key:'export',
                                // 			children: '导入分配'
                                // 		}]
                                // 	},
                                // 	children:{
                                // 		name:'menu4',
                                // 		component: 'Button',
                                // 		children: [' 更多 ',{
                                // 			name:'moreIcon',
                                // 			component:'Icon',
                                // 			fontFamily:'',
                                // 			style:{fontSize:'18px',verticalAlign:'middle'},
                                // 			type:'down'
                                // 		}]
                                // 	}
                                //
                                // }
                            ]
                        }
					],
				},
				{//table表格
					name: 'assignCustomer',
					className: 'inv-batch-custom-table',
					component: 'Table',
					key: 'assignCustomer',
					//loading: '{{data.loading}}',
					checkboxChange: '{{$checkboxChange}}',
					bordered: true,
					scroll: '{{data.list.length?data.tableOption:undefined}}',
					dataSource: '{{data.list}}',
					columns: '{{$renderColumns()}}',
					checkboxKey: 'customerId',
					pagination: false,
					rowKey: 'customerId',
					checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
					checkboxFixed: true,
					emptyShowScroll:true,
					delay: 0,
					// rowSelection: '{{function(){}}}',
					Checkbox: false,
					enableSequenceColumn: false,
					// allowColResize: true,
				},
				{
					name: 'footer',
					className: 'inv-batch-custom-footer',
					component: '::div',
					children: [
						{
							name: 'pagination',
							component: 'Pagination',
							pageSizeOptions: ['50', '100', '200', '300'],
							pageSize: '{{data.pagination.pageSize}}',
							current: '{{data.pagination.currentPage}}',
							total: '{{data.pagination.totalCount}}',
							onChange: '{{$pageChanged}}',
							onShowSizeChange: '{{$pageChanged}}'
						},{
							name: 'num',
							component: '::span',
							style:{position:'relative',float:'right',top:'5px',marginRight:'10px',fontSize:'14px',color:'rgba(0,0,0,0.65)'},
							children: '{{"共" +data.pagination.totalCount+"条记录"}}'
						}
					]
				}]
		}
	}
}

export function getInitState() {
	return {
		data: {
			btnType:[
				{
					name: 'assign',
					className: 'header-btn',
					type: 'primary',
					children: '批量分配',
					key: 'assignCustomer',
				},
				{
					name: 'import',
					className: 'header-btn',
					type: 'primary',
					children: '导入分配',
					key: 'importAssign'
				},
			],
			btnTypeN:[
                {
                    name: 'assignN',
                    className: 'header-btn',
                    type: 'disabled',
                    children: '批量分配',
                    key: 'assignCustomerN'
                },
                {
                    name: 'importN',
                    className: 'header-btn',
                    type: 'disabled',
                    children: '导入分配',
                    key: 'importAssignN'
                },
			],
			axpayerNature: '0',
			nsqj: '',
			khRangeList: [{
				rangeName: '分配给我的客户',
				rangeType: 'self'
			}],
			maxde:'',
			showbm:'分配给我的客户',
			ifgs:'',
			checkedKeys: {
				checked: [],//全选
				halfChecked: []//半选
			},
			khRange: 'self',
			inputVal: '',
			filterForm: {
				customerTypeStatus: '',
				assignTypeStatus: '',
				jobTypeStatus: '',
				customerName:'',
                serviceTypeStatus:'000',
			},
			filterFormOld: {
				customerTypeStatus: '',
				assignTypeStatus: '',
				jobTypeStatus: '',
				customerName:'',
                serviceTypeStatus:'000',
			},
			formContent: {
				customerTypeStatus: '',
				assignTypeStatus: '',
				jobTypeStatus: '',
				customerName:'',
                serviceTypeStatus:'000',
			},
			customerType: [//客户类型
				{
				name: '全部',
				value: ''
			}, {
				name: '一般纳税人',
				value: '2000010001'
			}, {
				name: '小规模',
				value: '2000010002'
			}
			],
			assignType: [//分配状态
				{
					name: '全部',
					value: ''
				},
				{
					name: '已分配',
					value: 'had'
				}, {
					name: '部分分配',
					value: 'half'
				}, {
					name: '未分配',
					value: 'empty'
				}
			],
			jobType: [//岗位类型
				{
					caption: '全部',
					roleId: ''
				},
			],
            serviceType:[{//服务类型
                name: '全部',
                value: '000'
            },{
                name: '全部服务',
                value: '003'
            }, {
                name: '一次性服务',
                value: '001'
            }, {
                name: '周期性服务',
                value: '002'
            }],
			loading: false,
			list: [],
			tableOption: {
				// x: 5000
			},
			pagination: {
				currentPage: 1,//-- 当前页
				pageSize: 50,//-- 页大小
				totalCount: 0,
				totalPage: 0
			},
			showTableSetting: false,
			other: {
				columnDto: [],
				permission: {
					treeData: [],//权限列表
					all: null,
					self: '分配我的客户'
				},
			},
			columnData,
			columns: [],
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			showPopoverCard: false,
			loadTime: '',
			job:[],
			customerList:[],
			user:[],
			isLD:0,
			js:1,
		}
	}
}