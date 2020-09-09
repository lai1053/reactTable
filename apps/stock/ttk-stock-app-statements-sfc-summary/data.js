// export function getMeta() {
// 	return {
// 		name: 'root',
// 		component: 'Layout',
// 		className: 'ttk-stock-app-statements-sfc-summary',
// 		children: [
//             {
//                 name: 'ttk-stock-app-spin',
//                 className: 'ttk-stock-app-spin',
//                 component: '::div',
//                 _visible: '{{data.loading}}',
//                 children: {
//                     name: 'ttk-stock-app-inventory-picking-fast-spin-icon',
//                     className: 'ttk-stock-app-inventory-picking-fast-spin-icon',
//                     component: 'Spin',
//                     size: 'large',
//                     tip: '数据加载中......',
//                     delay: 10
//                 }
//             },
//             {
//                 _visible:'{{data.isUnOpen}}',
//                 name: 'ttk-stock-weikaiqi',
//                 className: 'ttk-stock-weikaiqi',
//                 component: 'AppLoader',
//                 appName:'ttk-stock-app-weikaiqi',
//             },
//             {
//                 _visible:'{{!data.isUnOpen && data.isVisible}}',
//                 name: 'ttk-stock-app-statements-sfc-summary-header',
//                 className: 'ttk-stock-app-statements-sfc-summary-header',
//                 component: '::div',
//                 children: [
//                     {
//                         name: 'ttk-stock-app-statements-sfc-summary-header-title',
//                         className: 'ttk-stock-app-statements-sfc-summary-header-title',
//                         component: '::h2',					
//                         children: '{{data.pageTitle}}'
//                     },
//                     {
//                         name: 'ttk-stock-app-statements-sfc-summary-header-others',					
//                         className: 'ttk-stock-app-statements-sfc-summary-header-others',
//                         component: '::div',
//                         children: [
//                             {
//                                 name: 'ttk-stock-app-statements-sfc-summary-header-others-left',						
//                                 className: 'ttk-stock-app-statements-sfc-summary-header-others-left',
//                                 component: '::div',
//                                 children:[
//                                     {
//                                         name: 'ttk-stock-app-statements-sfc-summary-header-others-monthPicker',
//                                         className: 'ttk-stock-app-statements-sfc-summary-header-others-monthPicker',
//                                         component: 'DatePicker.MonthPicker',
//                                         disabledDate: '{{$disabledDate}}',
//                                         defaultValue: '{{$transToMoment(data.period)}}',
//                                         onChange: '{{$handlMonthChange}}'							
//                                     },
//                                     {
//                                         name: 'ttk-stock-app-statements-sfc-summary-header-others-inventoryClass',
//                                         className: 'ttk-stock-app-statements-sfc-summary-header-others-inventoryClass',
//                                         component: 'Select',
//                                         placeholder: '请选择存货类型',
//                                         defaultValue: '{{data.stockType}}',
//                                         onChange: '{{$InventoryClassChange}}',
//                                         getPopupContainer:'{{function(trigger){return trigger.parentNode} }}',
//                                         children:{
//                                             name:'option',
//                                             component: 'Select.Option',
//                                             children:'{{data.selectOptions[_rowIndex].inventoryClassName}}',
//                                             value:'{{String(data.selectOptions[_rowIndex].inventoryClassId)}}',
//                                             _power:'for in data.selectOptions',
//                                         }
//                                     }
//                                 ]
//                             },
//                             {
//                                 name: 'ttk-stock-app-statements-sfc-summary-header-others-right',						
//                                 className: 'ttk-stock-app-statements-sfc-summary-header-others-right',
//                                 component: '::div',
//                                 children:{
//                                     name: 'ttk-stock-app-statements-sfc-summary-header-others-right-top',							
//                                     className: 'ttk-stock-app-statements-sfc-summary-header-others-right-top',
//                                     component: '::span',
//                                     children: {
//                                         name: 'outport-btn',
//                                         className: 'outport-btn',
//                                         component: 'Button',
//                                         children: '导出',
//                                         type: 'default',
//                                         disabled: '{{$disabledDate()}}', // 不可选择的月份，导出功能也不可用
//                                         onClick: '{{$handleOutport}}'
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 ]
//             },
//             {
//                 _visible:'{{!data.isUnOpen && data.isVisible}}',
//                 name: 'ttk-stock-app-statements-sfc-summary-main',
//                 className: 'ttk-stock-app-statements-sfc-summary-main mk-layout',
//                 component: '::div',				
//                 children: {
//                     name: 'ttk-stock-app-statements-sfc-summary-main-table',
//                     className: 'ttk-stock-app-statements-sfc-summary-main-table ttk-scm-app-authorized-invoice-list mk-layout',
//                     component: 'Table',
//                     key:'inventoryId',
//                     rowKey:'inventoryId',
//                     bordered: true,
//                     pagination: false,
//                     loading: '{{data.loading}}',
//                     scroll:'{{data.tableOption}}',
//                     columns:'{{$renderColumns()}}',
//                     dataSource: '{{data.list}}',
//                     emptyShowScroll: true,
//                     onRow: '{{$handleOnRow}}',
//                     // footer: '{{$renderFooter}}'
//                 }
//             }
//         ]
// 	}
// }

export function getMeta() {
    return {
        name: 'root',
		component: 'Layout',
        className: 'ttk-stock-app-statements-sfc-summary',
        children: ["{{$renderPage()}}"]
    }
}

export function getInitState() {
	return {
		data: {

		}
	}
}