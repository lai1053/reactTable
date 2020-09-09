export function getMeta() {
    return {
        name: "root",
        component: "::div",
        className: "ttk-stock-app-completion-warehousing",
        children: "{{$renderPage()}}",
        // children: [
        //     {
        //         name: 'ttk-stock-app-spin',
        //         className: 'ttk-stock-app-spin',
        //         component: '::div',
        //         _visible: '{{data.loading}}',
        //         children: '{{$stockLoading()}}'
        //     },
        //     {
        //         name: 'ttk-stock-app-completion-warehousing-header',
        //         className: 'ttk-stock-app-completion-warehousing-header',
        //         component: '::div',
        //         children: [
        //             {
        //                 name: 'ttk-stock-app-completion-warehousing-header-title',
        //                 className: 'ttk-stock-app-completion-warehousing-header-title',
        //                 component: '::h2',
        //                 children: '完工入库'
        //             },
        //             {
        //                 name: 'ttk-stock-app-completion-warehousing-header-others',
        //                 className: 'ttk-stock-app-completion-warehousing-header-others',
        //                 component: '::div',
        //                 children: [
        //                     {
        //                         name: 'ttk-stock-app-completion-warehousing-header-others-left',
        //                         className: 'ttk-stock-app-completion-warehousing-header-others-left',
        //                         component: '::div',
        //                         children: [
        //                             {
        //                                 name: 'ttk-stock-app-completion-warehousing-header-others-left-top',
        //                                 className: 'ttk-stock-app-completion-warehousing-header-others-left-top',
        //                                 component: '::span',
        //                                 onClick: '{{$handleReturn}}'
        //                             },
        //                             {
        //                                 name: 'ttk-stock-app-completion-warehousing-header-others-left-bottom',
        //                                 className: 'ttk-stock-app-completion-warehousing-header-others-left-bottom',
        //                                 component: '::div',
        //                                 children: '{{"单据编号：" + data.others.code}}'
        //                             }
        //                         ]
        //                     },
        //                     {
        //                         name: 'ttk-stock-app-completion-warehousing-header-others-right',
        //                         className: 'ttk-stock-app-completion-warehousing-header-others-right',
        //                         component: '::div',
        //                         children: [
        //                             {
        //                                 name: 'ttk-stock-app-completion-warehousing-header-others-right-top',
        //                                 className: 'ttk-stock-app-completion-warehousing-header-others-right-top',
        //                                 component: '::span',
        //                                 children: [
        //                                     // {
        //                                     //     name: 'update-icon',
        //                                     //     className: 'update-icon',
        //                                     //     component: '::span'
        //                                     // },
        //                                     {
        //                                         name: 'update-btn',
        //                                         className: 'update-btn',
        //                                         component: 'Button',
        //                                         disabled: '{{data.invSet.isGenVoucher || data.invSet.isCarryOverProductCost || data.invSet.isCarryOverMainCost || (data.invSet.automaticDistributionMark===0)}}',
        //                                         children: '{{data.others.btnText}}',
        //                                         onClick: '{{$handleRefresh}}',
        //                                     },
        //                                     {
        //                                         name: 'delete-btn',
        //                                         className: 'delete-btn',
        //                                         component: 'Button',
        //                                         children: '{{data.others.delBtn}}',
        //                                         disabled: '{{data.invSet.isCarryOverMainCost || data.invSet.isCarryOverProductCost || !data.invSet.isCompletion}}',
        //                                         onClick: '{{$handleDel}}'
        //                                     }
        //                                 ]
        //                             },
        //                             {
        //                                 name: 'ttk-stock-app-completion-warehousing-header-others-right-bottom',
        //                                 className: 'ttk-stock-app-completion-warehousing-header-others-right-bottom',
        //                                 component: '::div',
        //                                 children: '{{"入库日期：" + data.others.period}}',
        //                             }
        //                         ]
        //                     }
        //                 ]
        //             }
        //         ]
        //     },
        //     {
        //         name: 'ttk-stock-app-completion-warehousing-main',
        //         className: 'ttk-stock-app-completion-warehousing-main mk-layout',
        //         component: '::div',
        //         children: {
        //             name: 'ttk-stock-app-completion-warehousing-main-table',
        //             className: 'ttk-stock-app-completion-warehousing-main-table mk-layout',
        //             component: 'Table',
        //             key: 'inventoryId',
        //             rowKey: 'inventoryId',
        //             bordered: true,
        //             pagination: false,
        //             // loading: '{{data.loading}}',
        //             scroll: '{{data.tableOption}}',
        //             columns: '{{$renderColumns()}}',
        //             dataSource: '{{data.list}}',
        //             emptyShowScroll: true
        //         }
        //     },
        //     {
        //         name: 'ttk-stock-app-completion-warehousing-footer',
        //         className: 'ttk-stock-app-completion-warehousing-footer',
        //         component: "::div",
        //         children: [
        //             {
        //                 name: 'ttk-stock-app-completion-warehousing-footer-div',
        //                 className: 'ttk-stock-app-completion-warehousing-footer-div',
        //                 component: '::div',
        //                 children: '{{$renderFooterLeft()}}',
        //             },
        //             {
        //                 name: 'ttk-stock-app-completion-warehousing-footer-btn',
        //                 className: 'ttk-stock-app-completion-warehousing-footer-btn',
        //                 style: "{{{margin:'10px 20px 0 0'}}}",
        //                 component: 'Button',
        //                 children: '保存',
        //                 disabled: '{{data.invSet.isGenVoucher || data.invSet.isCarryOverProductCost || data.invSet.isCarryOverMainCost}}',
        //                 type: 'primary',
        //                 onClick: '{{$handleSave}}'
        //             }
        //         ]
        //     }
        // ]
    }
}

export function getInitState() {
    return {
        data: {
            loading: false,
            isGenVoucher: false,
            invSet: {
                // state: 1,
                // startPeriod: "",
                // thisPeriod: "",
                // inveBusiness: undefined,
                // bInveControl: true,
                // endCostType: 1,
                // endNumSource: 1,
                // isGenVoucher: false,
                // isCarryOverMainCost: false,
                // isCarryOverProductCost: false,
                // isProductShare: true,
                // isMaterial: true,
                // automaticDistributionMark: 0,
                // isConfigureBOM: 0,
                // opr: 0,
                // bProductShareUp: false,
                // orgId: '',
                // isCompletion: true,
                // auxiliaryMaterialAllocationMark: 0,
                // enableBOMFlag: 1,
                // peroids: ["2019-12", "2019-03", "2019-01"],
                // num: 0,
                // price: 0,
                // ckNum: 0,
                // qzNum: 0,
            },
            tableOption: {
                x: "100%",
                y: 400,
            },
            others: {
                code: "",
                btnText: "更新入库数",
                delBtn: "删除",
                period: "",
            },
            listItem: {
                xh: "",
                inventoryId: 1,
                inventoryCode: "",
                inventoryName: "",
                inventoryGuiGe: "",
                inventoryUnit: "",
                num: "",
                matDisCof: "",
                isDisable: "",
                isSelect: false,
            },
            list: [],
            selectNameList: [],
            numT: 0,
        },
    }
}
