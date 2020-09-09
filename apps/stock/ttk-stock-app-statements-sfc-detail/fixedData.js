
// export const columnData = [{
//     id: 'code',
//     caption: "存货编码",
//     fieldName: 'code',
//     isVisible: true,
//     fixed:'left',
//     width: 75,
//     isMustSelect: false,
//     className: 'table_td_align_left',
//     amount: true
// }, {
//     id: 'name',
//     caption: "存货名称",
//     fieldName: 'name',
//     isVisible: true,
//     fixed:'left',
//     width: 135,
//     isMustSelect: false,
//     className: 'table_td_align_left',
//     amount: true
// }, {
//     id: 'guiGe',
//     caption: "规格型号",
//     fieldName: 'guiGe',
//     isVisible: true,
//     fixed:'left',
//     width: 80,
//     isMustSelect: false,
//     className: 'table_td_align_left',
//     amount: true
// }, {
//     id: 'inventoryUnit',
//     caption: "单位",
//     fieldName: 'inventoryUnit',
//     fixed:'left',
//     isVisible: true,
//     width: 50,
//     isMustSelect: false,
//     className: 'table_td_align_center',
//     amount: true
// }, {
//     id: 'serviceTypeName',
//     caption: "业务类型",
//     fixed:'left',
//     fieldName: 'serviceTypeName',
//     isFixed: false,
//     isVisible: true,
//     width: 90,
//     isMustSelect: false,
//     className: 'table_td_align_left',
//     amount: true
// }, {
//     id: 'sheetCode',
//     caption: "单据号",
//     fieldName: 'sheetCode',
//     isFixed: false,
//     isVisible: true,
//     width: 90,
//     isMustSelect: false,
//     className: 'table_td_align_left',
//     amount: true
// }, {
//     id: 'sheetDate',
//     caption: "日期",
//     fieldName: 'sheetDate',
//     isFixed: false,
//     isVisible: true,
//     width: 90,
//     isMustSelect: false,
//     className: 'table_td_align_center',
//     amount: true
// }, {
//     id: 'ruXxfp',
//     caption: '入库',
//     fieldName: 'xxfp',
//     isVisible: true,
//     isMustSelect: true,
//     children: [{
//         id: 'rkNum',
//         caption: "数量",
//         fieldName: 'rkNum',
//         isFixed: false,
//         isVisible: true,
//         isSubTitle: true,
//         className: 'table_td_align_right',
//         amount: true,
//         width: 90,
//     }, {
//         id: 'rkPrice',
//         caption: "单价",
//         fieldName: 'rkPrice',
//         isFixed: false,
//         isVisible: true,
//         isSubTitle: true,
//         width: 90,
//         className: 'table_td_align_right',
//         amount: true
//     }, {
//         id: 'rkBalance',
//         caption: "金额",
//         fieldName: 'rkBalance',
//         isFixed: false,
//         isVisible: true,
//         isSubTitle: true,
//         width: 90,
//         className: 'table_td_align_right',
//         amount: true
//     }, ]
// }, {
//     id: 'ckXxfp',
//     caption: '出库',
//     fieldName: 'xxfp',
//     isVisible: true,
//     isMustSelect: true,
//     children: [{
//         id: 'ckNum',
//         caption: "数量",
//         fieldName: 'ckNum',
//         isFixed: false,
//         isVisible: true,
//         isSubTitle: true,
//         className: 'table_td_align_right',
//         amount: true,
//         width: 90,
//     }, {
//         id: 'ckPrice',
//         caption: "单价",
//         fieldName: 'ckPrice',
//         isFixed: false,
//         isVisible: true,
//         isSubTitle: true,
//         width: 90,
//         className: 'table_td_align_right',
//         amount: true
//     }, {
//         id: 'ckBalance',
//         caption: "金额",
//         fieldName: 'ckBalance',
//         isFixed: false,
//         isVisible: true,
//         isSubTitle: true,
//         width: 90,
//         className: 'table_td_align_right',
//         amount: true
//     }, ]
// },  {
//     id: 'jxfpwrz',
//     caption: '库存',
//     fieldName: 'xxfp',
//     isVisible: true,
//     isMustSelect: true,
//     align: '',
//     children: [{
//         caption: "数量",
//         fieldName: 'kcNum',
//         isFixed: false,
//         isVisible: true,
//         isSubTitle: true,
//         className: 'table_td_align_right',
//         width: 100,
//     },{
//         caption: "单价",
//         fieldName: 'kcPrice',
//         className: 'table_td_align_right',
//         isFixed: false,
//         isVisible: true,
//         isSubTitle: true,
//         width: 80,
//     }, {
//         caption: "金额",
//         fieldName: 'kcBalance',
//         isFixed: false,
//         isVisible: true,
//         isSubTitle: true,
//         width: 80,
//         className: 'table_td_align_right',
//         amount: true
//     }, ]
// },]



export const columnData = [{
    key: 'inventoryCode',
    dataIndex: 'inventoryCode',
    title: "存货编码",
    fixed:'left',
    width: 85,
    minWidth: 70,
    className: 'table_td_align_left',
}, {
    key: 'inventoryName',
    dataIndex: 'inventoryName',
    title: "存货名称",
    fixed:'left',
    width: 140,
    minWidth: 70,
    className: 'table_td_align_left',
}, {
    key: 'inventoryGuiGe',
    dataIndex: 'inventoryGuiGe',
    title: "规格型号",
    fixed:'left',
    width: 85,
    minWidth: 70,
    className: 'table_td_align_left',
}, {
    key: 'inventoryUnit',
    dataIndex: 'inventoryUnit',
    title: "单位",
    fixed:'left',
    width: 50,
    minWidth: 50,
    className: 'table_td_align_left',
}, {
    key: 'serviceTypeNameArr',
    dataIndex: 'serviceTypeNameArr',
    title: "业务类型",
    fixed:'left',
    width: 80,
    minWidth: 70,
    className: 'table_td_align_left',
}, {
    key: 'sheetCodeArr',
    dataIndex: 'sheetCodeArr',
    title: "单据号",
    width: 130,
    minWidth: 70,
    className: 'table_td_align_left',
}, {
    key: 'sheetDateArr',
    dataIndex: 'sheetDateArr',
    title: "日期",
    width: 95,
    minWidth: 70,
    className: 'table_td_align_center',
}, {
    title: '入库',
    children: [{
        key: 'rkNumArr',
        dataIndex: 'rkNumArr',
        title: "数量",
        width: 115,
        minWidth: 70,
        className: 'table_td_align_right'
    }, {
        key: 'rkPriceArr',
        dataIndex: 'rkPriceArr',
        title: "单价",
        width: 115,
        minWidth: 70,
        className: 'table_td_align_right'
    }, {
        key: 'rkBalanceArr',
        dataIndex: 'rkBalanceArr',
        title: "金额",
        width: 115,
        minWidth: 70,
        className: 'table_td_align_right'
    }, ]
}, {
    title: '出库',
    children: [{
        key: 'ckNumArr',
        dataIndex: 'ckNumArr',
        title: "数量",
        width: 115,
        minWidth: 70,
        className: 'table_td_align_right'
    }, {
        key: 'ckPriceArr',
        dataIndex: 'ckPriceArr',
        title: "单价",
        width: 115,
        minWidth: 70,
        className: 'table_td_align_right'
    }, {
        key: 'ckBalanceArr',
        dataIndex: 'ckBalanceArr',
        title: "金额",
        width: 115,
        minWidth: 70,
        className: 'table_td_align_right'
    }, ]
},  {
    title: '库存',
    flexGrow: 1,
    children: [{
        key: 'kcNumArr',
        dataIndex: 'kcNumArr',
        title: "数量",
        flexGrow: 1,
        width: 115,
        minWidth: 70,
        className: 'table_td_align_right',
    },{
        key: 'kcPriceArr',
        dataIndex: 'kcPriceArr',
        title: "单价",
        width: 115,
        minWidth: 70,
        className: 'table_td_align_right'
    }, {
        key: 'kcBalanceArr',
        dataIndex: 'kcBalanceArr',
        title: "金额",
        width: 119,
        minWidth: 70,
        className: 'table_td_align_right'
    }, ]
}]