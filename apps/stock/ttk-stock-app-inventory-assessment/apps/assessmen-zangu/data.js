// import { columnData } from './fixedData'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'assessmen-zangu',
		children: [{
			name: 'ttk-stock-app-spin',
			className: 'ttk-stock-app-spin',
			component: '::div',
			_visible: '{{data.loading}}',
			children: '{{$stockLoading()}}'
		},{
			name: 'header',
			component: 'Layout',
			className: 'assessmen-zangu-header-title',
			children: [{
				name: 'inv-app-batch-sale-header',
				component: '::div',
				className: 'inv-app-batch-sale-header',
				children: [{
					name: 'header-left',
					className: 'header-left',
					component: '::div',
					children: [{
						name: 'header-filter-input',
						component: 'Input',
						className: 'inv-app-batch-sale-header-filter-input',
						type: 'text',
						placeholder: '请输入存货名称或存货编号',
						onChange: "{{function (e) {$onSearch('data.inputVal', e.target.value)}}}",
						prefix: {
							name: 'search',
							component: 'Icon',
							type: 'search'
						}
					}, 
					{
						name: 'popover',
						component: 'Popover',
						popupClassName: 'inv-batch-sale-list-popover',
						placement: 'bottom',
						title: '',
						content: {
							name: 'popover-content',
							component: '::div',
							className: 'inv-batch-custom-popover-content',
							children: [{
								name: 'filter-content',
								component: '::div',
								className: 'filter-content',
								children: [ 
									{
									name: 'popover-number',
									component: '::div',
									style: {width: '100%'},
									className: 'inv-batch-custom-popover-item',
									children: [{
										name: 'label',
										component: '::span',
										children: '存货类型：',
										className: 'inv-batch-custom-popover-label'
									}, {
										name: 'bankAccountType',
										component: 'Select',
										showSearch: false,
										value: '{{data.form.constom}}',
										getPopupContainer:'{{function(trigger) {return trigger.parentNode}}}',
										onChange: "{{function(v){$sf('data.form.constom',v)}}}",
										children: {
											name: 'selectItem',
											component: 'Select.Option',
											getPopupContainer:'{{function(trigger) {return trigger.parentNode}}}',
											value: '{{data.form.propertyDetailFilter[_rowIndex].name}}',
											children: '{{data.form.propertyDetailFilter[_rowIndex].name}}',
											_power: 'for in data.form.propertyDetailFilter'
										},
										style: {width: '65%'}
									}]
								}
							]
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
									},
									{
									name: 'reset',
									className: 'reset-btn',
									component: 'Button',
									children: '重置',
									onClick: '{{$resetForm}}'
								}]
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
				]
				}],
			},]
		},
		{
			name: 'content',
			component: 'Layout',
			className: 'assessmen-zangu-content',
			children: [
				{
					name: 'general-list-table-container',
					className: 'assessmen-zangu-Body-contaier',
					component: '::div',
					key: 'table-small-div',
					children: '{{$renderTable()}}',
                },
                {
                    name: 'footer-btn',
                    component: '::div',
                    className: 'assessmen-zangu-footer-btn',
                    children: [
                        {
                            name: 'btnGroup',
                            component: '::div',
                            className: 'assessmen-zangu-footer-btn-btnGroup',
                            children: [
                                {
                                    name: 'cancel',
                                    component: 'Button',
                                    className: 'assessmen-zangu-footer-btn-btnGroup-item',
                                    children: '取消',
                                    onClick: '{{$onCancel}}'
                                }, 
                                {
                                    name: 'confirm',
                                    component: 'Button',
                                    className: 'assessmen-zangu-footer-btn-btnGroup-item',
                                    type: 'primary',
                                    disabled: "{{data.list.length === 0}}",
                                    children: '生成暂估入库单',
                                    style: {
                                        width: "116px"
                                    }, 
                                    onClick: "{{$onOk}}"
                                }
                            ]
                        }
                    ]
                }
            ]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			columnData:[],
			columns: [],
			listAll:{
				billBodyNum:2,
				billBodyYbBalance:2
			},
			form: {
				propertyDetailFilter:[
					{
						name:'库存商品',
					},
					{
						name:'原材料',
					},
					{
						name:'周转材料',
					},
					{
						name:'委托加工物资',
					}
				],
				code: '',
				operater: 'liucp',
			},
			tableOption:{
				y: 305
            },
			list: [
			],
			other: {
				error: {},
            },
			basic: {
				enableDate:''
			}
		}
	}
}