export function getMeta() {
        return {
                name: "root",
                component: "::div",
                className: "ttk-stock-app-completion-warehousing-sales",
                children: "{{$renderPage()}}",
                // children: [
                //     {
                //              name: 'ttk-stock-app-spin',
                //              className: 'ttk-stock-app-spin',
                //              component: '::div',
                //         _visible: '{{data.loading}}',
                //         children: '{{$stockLoading()}}'
                //              // children: {
                //              //      name: 'ttk-stock-app-inventory-picking-fast-spin-icon',
                //              //      className: 'ttk-stock-app-inventory-picking-fast-spin-icon',
                //              //      component: 'Spin',
                //              //      size: 'large',
                //              //      tip: '数据加载中......',
                //              //      delay: 10
                //              // }
                //      },
                //     {
                //         name: 'ttk-stock-app-completion-warehousing-sales-head',
                //         className: 'ttk-stock-app-completion-warehousing-sales-head',
                //         component: '::div',
                //         children: [
                //             {
                //                 name: 'ttk-stock-app-completion-warehousing-sales-head-title',
                //                 className: 'ttk-stock-app-completion-warehousing-sales-head-title',
                //                 component: '::h3',
                //                 children: '{{data.content}}'
                //             },
                //             {
                //                 name: 'ttk-stock-app-completion-warehousing-sales-head-close',
                //                 className: 'ttk-stock-app-completion-warehousing-sales-head-close',
                //                 component: '::i',
                //                 onClick: "{{$handleReturn}}"
                //             }
                //         ]
                //     },
                //     {
                //         name: 'ttk-stock-app-completion-warehousing-sales-subHead',
                //         className: 'ttk-stock-app-completion-warehousing-sales-subHead',
                //         component: '::div',
                //         children: [
                //             {
                //                 name: 'ttk-stock-app-completion-warehousing-sales-subHead-filter',
                //                 className: 'ttk-stock-app-completion-warehousing-sales-subHead-filter',
                //                 component:  '::div',
                //                 children: {
                //                     name: 'ttk-stock-card-select-warehousing-names-div-filter',
                //                     className: 'ttk-stock-card-select-warehousing-names-div-filter',
                //                     component: '::div',
                //                     children: [
                //                         {
                //                             name: 'ttk-stock-card-select-warehousing-names-div-filter-search',
                //                             className: 'ttk-stock-card-select-warehousing-names-div-filter-search',
                //                             component: 'AppLoader',
                //                             appName:'ttk-stock-app-completion-warehousing-filter',
                //                             callback: '{{function(v){$filterCallBack(v)}}}',
                //                             // selectOptions: '{{data.inventoryClass}}',
                //                             requestParams: '{{data.requestParams}}'
                //                         }
                //                     ]
                //                 }
                //             },
                //             {
                //                 name: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income',
                //                 className: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income',
                //                 component:  '::div',
                //                 children: [
                //                     {
                //                         name: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-txt',
                //                         className: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-txt',
                //                         component:'::span',
                //                         children: '本期销售收入：'
                //                     },
                //                     {
                //                         name: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-num',
                //                         className: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-num',
                //                         component:'::span',
                //                         children: '{{data.totalSales}}'
                //                     }
                //                 ]
                //             },
                //             {
                //                 name: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-to-rate',
                //                 className: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-to-rate',
                //                 component:  '::div',
                //                 _visible: '{{data.radioValue==="1"}}',
                //                 children: [
                //                     {
                //                         name: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-to-rate-txt',
                //                         className: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-to-rate-txt',
                //                         component:'::span',
                //                         children: '销售成本比例：'
                //                     },
                //                     {
                //                         name: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-to-rate-num',
                //                         className: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-to-rate-num',
                //                         component:'::span',
                //                         children: [
                //                             {
                //                                 name: 'sales-income-to-rate-num-input-tips',
                //                                 className: 'sales-income-to-rate-num-input-tips',
                //                                 component: '::span',
                //                                 _visible: '{{!!data.batchRateTips}}',
                //                                 children: '{{data.batchRateTips}}'
                //                             },
                //                             {
                //                                 name: 'sales-income-to-rate-num-input',
                //                                 className: 'sales-income-to-rate-num-input',
                //                                 component: '::input',
                //                                 onInput: '{{$batchRateInput}}',
                //                                 onChange: '{{$batchInputChange}}'
                //                             },
                //                             {
                //                                 name: 'sales-income-to-rate-mark',
                //                                 className: 'sales-income-to-rate-mark',
                //                                 component: '::span',
                //                                 children: '%'
                //                             }
                //                         ]
                //                     },
                //                     {
                //                         name: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-to-rate-btn',
                //                         className: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-to-rate-btn',
                //                         component:'Button',
                //                         size: 'small',
                //                         type: 'primary',
                //                         children: '确定',
                //                         disabled: '{{!!data.batchRateTips}}',
                //                         onClick:'{{$setRatio}}'
                //                     }
                //                 ]
                //             },
                //             {
                //                 name: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-to-rate-radio',
                //                 className: 'ttk-stock-app-completion-warehousing-sales-subHead-sales-income-to-rate-radio',
                //                 component: 'Radio.Group',
                //                 // disabled: '{{}}',
                //                 value: '{{data.radioValue}}',
                //                 defaultValue: 'saleToRate',
                //                 onChange: '{{$handleChange}}',
                //                 children: [
                //                     {
                //                         name: 'unit-price',
                //                         className: 'unit-price',
                //                         component: 'Radio',
                //                         key: '0',
                //                         value: '0',
                //                         children: '按期初单价'
                //                     },
                //                     {
                //                         name: 'sale-to-rate',
                //                         className: 'sale-to-rate',
                //                         component: 'Radio',
                //                         key: '1',
                //                         value: '1',
                //                         children: '按销售成本率'
                //                     }
                //                 ]
                //             }
                //         ]
                //     },
                //     {
                //         name: 'table-container',
                //         className: 'ttk-stock-app-completion-warehousing-sales-table-container mk-layout',
                //         component: '::div',
                //         children: [
                //             {
                //                 name: 'ttk-stock-app-completion-warehousing-sales-table',
                //                 className: 'ttk-stock-app-completion-warehousing-sales-table mk-layout',
                //                 component: '::div',
                //                 children: '{{$renderTable()}}'
                //             },
                //             {
                //                 name:'ttk-stock-app-completion-warehousing-sales-footer',
                //                 className: 'ttk-stock-app-completion-warehousing-sales-footer',
                //                 component: '::div',
                //                 children: {
                //                     name:'ttk-stock-app-completion-warehousing-sales-footer-btn',
                //                     className: 'ttk-stock-app-completion-warehousing-sales-footer-btn',
                //                     component: 'Button',
                //                     type: 'primary',
                //                     children: '生成入库单',
                //                     disabled: '{{!data.canSaveFlag}}',
                //                     onClick:'{{$handleSave}}'
                //                 }
                //             }
                //         ]
                //     }
                // ]
        }
}

export function getInitState() {
        return {
                data: {
                        totalSales: 0,
                        batchRateTips: "",
                        cannotBatchRate: false,
                        loading: false,
                        content: "按销售入库",
                        list: [],
                        radioValue: "1",
                        tableOption: {
                                y: 400,
                        },
                        inventoryClass: [],
                        listLength: 0,
                        canSaveFlag: false,
                        fakeRes: {
                                result: true,
                                value: {
                                        period: "2019-07", //--日期
                                        isDisable: false,
                                        calculatingType: 1, //-- 计算类型 0 按期初单价 1 按销售成本
                                        includeContentEmpty: false,
                                        includeSystemData: false,
                                        code: "单据号",
                                        salesWarehouseDtos: [],
                                        classList: [],
                                },
                        },
                        salesWarehouseDtos: [],
                },
        }
}
