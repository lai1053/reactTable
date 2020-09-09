export function getMeta() {
    return {
        name: "root",
        component: "::div",
        className: "ttk-stock-app-completion-warehousing-sales",
        children: "{{$renderPage()}}",
        // onMouseDown: '{{$mousedown}}',
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
        //                         children:[
        //                             {
        //                                 name: 'ttk-stock-app-completion-warehousing-header-others-left-top',
        //                                 className: 'ttk-stock-app-completion-warehousing-header-others-left-top',
        //                                 component: '::span',
        //                                 disabled: "{{$isReadOnly()}}",
        //                                 onClick: "{{$handleReturn}}"
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
        //                         children:[
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
        //                                         disabled: '{{$canRefresh()}}',
        //                                         onClick: "{{$handleRefresh}}",
        //                                         children: '{{data.others.btnText}}'
        //                                     },
        //                                     {
        //                                         name: 'delete-btn',
        //                                         className: 'delete-btn',
        //                                         component: 'Button',
        //                                         children: '{{data.others.delBtn}}',
        //                                         disabled: '{{$canDelete()}}',
        //                                         onClick: '{{$handleDel}}'
        //                                     }
        //                                 ]
        //                             },
        //                             {
        //                                 name: 'ttk-stock-app-completion-warehousing-header-others-right-bottom',
        //                                 className: 'ttk-stock-app-completion-warehousing-header-others-right-bottom',
        //                                 component: '::div',
        //                                 _visible: '{{$isReadOnly()}}',
        //                                 children: '{{"入库日期：" + data.others.period}}',
        //                             },
        //                             {
        //                                 name: 'ttk-stock-app-completion-warehousing-header-others-right-bottom',
        //                                 className: 'ttk-stock-app-completion-warehousing-header-others-right-bottom',
        //                                 component: '::div',
        //                                 _visible: '{{!($isReadOnly())}}',
        //                                 children: [
        //                                     {
        //                                         name: 'dateText',
        //                                         className: 'dateText',
        //                                         component: '::span',
        //                                         children: '入库日期：'
        //                                     },{
        //                                         name: 'codeDate',
        //                                         className: 'codeDate',
        //                                         component: '::span',
        //                                         children: {
        //                                             name: 'datePicker',
        //                                             className: 'datePicker',
        //                                             component: 'DatePicker',
        //                                             value: "{{$stringToMoment((data.others.period),'YYYY-MM-DD')}}",
        //                                             disabledDate:'{{$disabledDate}}',
        //                                             onChange:'{{$changeDate}}'

        //                                         }
        //                                     }
        //                                 ]
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
        //         children: "{{$renderTable()}}",
        //     },
        //     {
        //         name: 'ttk-stock-app-completion-warehousing-footer',
        //         className: 'ttk-stock-app-completion-warehousing-footer',
        //         component:"::div",
        //         children:[
        //             {
        //                 name: 'ttk-stock-app-completion-warehousing-footer-div',
        //                 className: 'ttk-stock-app-completion-warehousing-footer-div',
        //                 component: '::div',
        //                 children: '{{$renderFooterLeft()}}',
        //             },
        //             {
        //                 name: 'ttk-stock-app-completion-warehousing-footer-btn',
        //                 className: 'ttk-stock-app-completion-warehousing-footer-btn',
        //                 component: 'Button',
        //                 children: '保存',
        //                 type: 'primary',
        //                 disabled: "{{$isReadOnly()}}",
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
            cannotReturn: false,
            tableOption: {
                x: "100%",
                y: 400,
            },
            others: {
                btnText: "按销售生产入库",
                delBtn: "删除",
                code: "",
                period: "",
            },
            listItem: {
                xh: undefined,
                inventoryId: 1,
                inventoryCode: undefined,
                inventoryName: undefined,
                inventoryGuiGe: undefined,
                inventoryUnit: undefined,
                num: undefined,
                ybbalance: undefined,
                isDisable: false,
                isSelect: false,
            },
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
            list: [],
            selectNameList: [],
            numT: 0,
            ybbalanceT: 0,
        },
    }
}
