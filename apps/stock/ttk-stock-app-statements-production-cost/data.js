// export function getMeta() {
	// return {
	// 	name: 'root',
	// 	component: 'Layout',
	// 	className: 'ttk-stock-app-statements-production-cost',
	// 	children: [
    //         {
    //             name: 'ttk-stock-app-spin',
    //             className: 'ttk-stock-app-spin',
    //             component: '::div',
    //             _visible: '{{data.loading}}',
    //             children: {
    //                 name: 'ttk-stock-app-inventory-picking-fast-spin-icon',
    //                 className: 'ttk-stock-app-inventory-picking-fast-spin-icon',
    //                 component: 'Spin',
    //                 size: 'large',
    //                 tip: '数据加载中......',
    //                 delay: 10
    //             }
    //         },
    //         {
    //             _visible: '{{data.isUnOpen}}',
    //             name: 'ttk-stock-weikaiqi',
    //             className: 'ttk-stock-weikaiqi',
    //             component: 'AppLoader',
    //             appName:'ttk-stock-app-weikaiqi',
    //         },
    //         {
    //             _visible:'{{!data.isUnOpen && data.isVisible}}',
    //             name: 'ttk-stock-app-statements-production-cost-header',
    //             className: 'ttk-stock-app-statements-production-cost-header',
    //             component: '::div',
    //             children: [
    //                 {
    //                     name: 'ttk-stock-app-statements-production-cost-header-title',
    //                     className: 'ttk-stock-app-statements-production-cost-header-title',
    //                     component: '::h2',					
    //                     children: '{{data.pageTitle}}'
    //                 },
    //                 {
    //                     name: 'ttk-stock-app-statements-production-cost-header-others',					
    //                     className: 'ttk-stock-app-statements-production-cost-header-others',
    //                     component: '::div',
    //                     children: [
    //                         {
    //                             name: 'ttk-stock-app-statements-production-cost-header-others-left',						
    //                             className: 'ttk-stock-app-statements-production-cost-header-others-left',
    //                             component: '::div',
    //                             children: [
    //                                 {
    //                                     name: 'ttk-stock-app-statements-production-cost-header-others-monthPicker',
    //                                     className: 'ttk-stock-app-statements-production-cost-header-others-monthPicker',
    //                                     component: 'DatePicker.MonthPicker',
    //                                     disabledDate: '{{$disabledDate}}',
    //                                     defaultValue: '{{$transToMoment(data.period)}}',
    //                                     onChange: '{{$handlMonthChange}}'							
    //                                 }
    //                             ]
    //                         },
    //                         {
    //                             name: 'ttk-stock-app-statements-production-cost-header-others-right',						
    //                             className: 'ttk-stock-app-statements-production-cost-header-others-right',
    //                             component: '::div',
    //                             children: {
    //                                 name: 'ttk-stock-app-statements-production-cost-header-others-right-top',							
    //                                 className: 'ttk-stock-app-statements-production-cost-header-others-right-top',
    //                                 component: '::span',
    //                                 children: {
    //                                     name: 'outport-btn',
    //                                     className: 'outport-btn',
    //                                     component: 'Button',
    //                                     children: '导出',
    //                                     type: 'default',
    //                                     onClick: '{{$handleOutport}}'
    //                                 }
    //                             }
    //                         }
    //                     ]
    //                 }
    //             ]
    //         }, 
    //         {
    //             _visible:'{{!data.isUnOpen && data.isVisible}}',
    //             name: 'ttk-stock-app-statements-production-cost-main',
    //             className: 'ttk-stock-app-statements-production-cost-main mk-layout',
    //             component: '::div',				
    //             children: {
    //                 name: 'ttk-stock-app-statements-production-cost-main-table',
    //                 className: 'ttk-stock-app-statements-production-cost-main-table ttk-scm-app-authorized-invoice-list mk-layout',
    //                 component: 'Table',
    //                 key: 'inventoryId',
    //                 rowKey: 'inventoryId',
    //                 bordered: true,
    //                 pagination: false,
    //                 loading: '{{data.loading}}',
    //                 scroll: '{{data.tableOption}}',
    //                 columns: '{{$renderColumns()}}',
    //                 dataSource: '{{data.list}}',
    //                 emptyShowScroll: true,
    //                 // footer: '{{$renderFooter}}'
    //             }
    //         }
    //     ]
    // }
// }

export function getMeta() {
    return {
        name: 'root',
		component: 'Layout',
        className: 'ttk-stock-app-statements-production-cost',
        children: ["{{$renderPage()}}"]
    }
}

export function getInitState() {
	return {
		data: {

		}
	}
}