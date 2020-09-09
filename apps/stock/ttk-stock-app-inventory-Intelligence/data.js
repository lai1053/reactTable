// import { columnData } from './fixedData'

// export function getMeta() {
// 	return {
// 		name: 'root',
// 		component: 'Layout',
// 		className: 'ttk-stock-app-inventory-intelligence',
// 		onMouseDown: '{{$mousedown}}',
// 		children: [
//             {
// 				name: 'ttk-stock-app-spin',
// 				className: 'ttk-stock-app-spin',
// 				component: '::div',
// 				_visible: '{{data.loading}}',
// 				children: '{{$stockLoading()}}'
// 			},
//             {
//                 name: 'header',
//                 component: 'Layout',
//                 className: 'ttk-stock-app-inventory-intelligence-header-title',
//                 children: [
//                     {
//                         name: 'inv-app-batch-sale-header',
//                         component: '::div',
//                         className: 'inv-app-batch-sale-header',
//                         children: [
//                             {
//                                 name: 'header-left',
//                                 className: 'header-left',
//                                 component: '::div',
//                                 children: [
//                                     {
//                                         name: 'header-filter-input',
//                                         component: 'Input',
//                                         className: 'inv-app-batch-sale-header-filter-input',
//                                         type: 'text',
//                                         placeholder: '请输入存货名称/存货编号',
//                                         onChange: "{{function (e) {$onSearch('data.inputVal', e.target.value)}}}",
//                                         prefix: {
//                                             name: 'search',
//                                             component: 'Icon',
//                                             type: 'search'
//                                         }
//                                     }, 
//                                     {
//                                         name: 'popover',
//                                         component: 'Popover',
//                                         popupClassName: 'inv-batch-sale-list-popover',
//                                         placement: 'bottom',
//                                         // title: '',
//                                         content: {
//                                             name: 'popover-content',
//                                             component: '::div',
//                                             className: 'inv-batch-custom-popover-content',
//                                             children: [
//                                                 {
//                                                     name: 'filter-content',
//                                                     component: '::div',
//                                                     className: 'filter-content',
//                                                     children: [
//                                                         {
//                                                             name: 'popover-number',
//                                                             component: '::div',
//                                                             className: 'inv-batch-custom-popover-item',
//                                                             children: [
//                                                                 {
//                                                                     name: 'label',
//                                                                     component: '::span',
//                                                                     children: '存货类型：',
//                                                                     className: 'inv-batch-custom-popover-label'
//                                                                 }, 
//                                                                 {
//                                                                     name: 'bankAccountType',
//                                                                     component: 'Select',
//                                                                     placeholder: '存货类型：',
//                                                                     className: 'inv-batch-custom-popover-select',
//                                                                     getPopupContainer:'{{function(trigger) {return trigger.parentNode}}}',
//                                                                     value: '{{data.form.constom}}',
//                                                                     onChange: "{{function(v){$sf('data.form.constom',v)}}}",
//                                                                     children: {
//                                                                         name: 'selectItem',
//                                                                         component: 'Select.Option',
//                                                                         placeholder: '存货类型：',
//                                                                         value: '{{data.form.propertyDetailFilter[_rowIndex].name}}',
//                                                                         children: '{{data.form.propertyDetailFilter[_rowIndex].name}}',
//                                                                         _power: 'for in data.form.propertyDetailFilter'
//                                                                     },
//                                                                 }
//                                                             ]
//                                                         }
//                                                     ]
//                                                 },
//                                                 {
//                                                     name: 'filter-footer',
//                                                     component: '::div',
//                                                     className: 'filter-footer',
//                                                     children: [
//                                                         {
//                                                             name: 'search',
//                                                             component: 'Button',
//                                                             type: 'primary',
//                                                             children: '查询',
//                                                             onClick: '{{$filterList}}'
//                                                         },
//                                                         {
//                                                             name: 'reset',
//                                                             className: 'reset-btn',
//                                                             component: 'Button',
//                                                             children: '重置',
//                                                             onClick: '{{$resetForm}}'
//                                                         }
//                                                     ]
//                                                 }
//                                             ]
//                                         },
//                                         trigger: 'click',
//                                         visible: '{{data.showPopoverCard}}',
//                                         onVisibleChange: "{{$handlePopoverVisibleChange}}",
//                                         children: {
//                                             name: 'filterSpan',
//                                             component: '::span',
//                                             className: 'inv-batch-custom-filter-btn header-item',
//                                             children: {
//                                                 name: 'filter',
//                                                 component: 'Icon',
//                                                 type: 'filter'
//                                             }
//                                         }
//                                     }
//                                 ]
//                             }
//                         ],
//                     },
//                     {
//                         name: 'content',
//                         className: 'inv-batch-custom-table',
//                         component: 'Layout',
//                         children: [
//                             {
//                                 allowColResize: false,
//                                 enableSequenceColumn: false,
//                                 className: 'inv-batch-custom-table-list',
//                                 scroll: '{{data.tableOption}}',
//                                 name: 'general-list-table',
//                                 component: 'Table',
//                                 rowSelection: '{{$rowSelection()}}',
//                                 loading: '{{data.other.loading}}',
//                                 key: 'table-small-custom',
//                                 bordered: true,
//                                 dataSource: '{{data.list}}',
//                                 columns: '{{$renderColumns()}}',
//                                 pagination: false,
//                                 rowKey:'inventoryId',						
//                             },
//                         ]
//                     }
//                 ]
//             },
//             {
//                 name: 'footer',
//                 component: '::div',
//                 className: 'ttk-stock-app-inventory-intelligence-footer',
//                 children: [
//                     {
//                         name:'title',
//                         component:'::div',
//                         children:'合计:'
//                     },
//                     {
//                         name:'title',
//                         component:'::div',
//                         className: 'sum-num',
//                         children:'{{data.list.length}}'
//                     },
//                     {
//                         name:'title',
//                         component:'::div',
//                         children:'选中:'
//                     },
//                     {
//                         name:'title',
//                         component:'::div',
//                         children:'{{data.selectedRowKeys.length}}'
//                     }
//                 ]
//             }	
// 	    ]
// 	}
// }

// export function getInitState() {
// 	return {
// 		data: {
// 			columnData,
// 			select: 0,
// 			selectedRowKeys: [],
// 			tableOption: {
// 				x: 1,
// 				y: 272
//             },
// 			form: {
// 				propertyDetailFilter:[
// 					{
// 						name:'库存商品',
// 					},
// 					{
// 						name:'原材料',
// 					},
// 					{
// 						name:'周转材料',
// 					},
// 					{
// 						name:'委托加工物资',
// 					}
// 				],
// 				constom: '',
// 				code: '',
// 				operater: 'liucp',
// 			},
// 			list: [],
// 			other: {
// 				error: {},
// 			},
// 			basic: {
// 				enableDate: ''
// 			}
// 		}
// 	}
// }

export function getMeta() {
    return {
        name: 'root',
		component: 'Layout',
        className: 'ttk-stock-app-inventory-intelligence',
        children: ["{{$renderPage()}}"]
    }
}

export function getInitState() {
	return {
		data: {

		}
	}
}