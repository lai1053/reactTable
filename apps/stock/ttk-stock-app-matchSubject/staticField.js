const tableColumns = [{
    title: '存货编号',
    key: 'code',
    dataIndex: 'code',
    width: 90,
    align: 'center'
},{
    title: '存货名称',
    key: 'name',
    dataIndex: 'name',
    // width: 267,
    flexGrow: 1,
    align: 'left'
},{
    title: '规格型号',
    key: 'specification',
    dataIndex: 'specification',
    width: 95,
    align: 'center'
},{
    title: '单位',
    key: 'unitName',
    dataIndex: 'unitName',
    width: 55,
    align: 'center'
},{
//     title: '存货科目',
//     titleText: '存货科目',
//     key: 'inventoryRelatedAccountName',
//     dataIndex: 'inventoryRelatedAccountName',
//     width: 240,
//     isMust: true,
//     isSelect: true,
//     align: 'center'
// },{
    title: '成本科目',
    titleText: '成本科目',
    key: 'salesCostAccountName',
    dataIndex: 'salesCostAccountName',
    isMust: true,
    isSelect: true,
    width: 300,
    align: 'center'
}]

// const tableColumn2 = [{
//     title: '存货编号',
//     key: 'code',
//     dataIndex: 'code',
//     width: 90,
//     align: 'center'
// },{
//     title: '存货名称',
//     key: 'name',
//     dataIndex: 'name',
//     width: 471,
//     // flexGrow: 1,
//     align: 'left'
// },{
//     title: '规格型号',
//     key: 'specification',
//     dataIndex: 'specification',
//     width: 95,
//     align: 'center'
// },{
//     title: '单位',
//     key: 'unitName',
//     dataIndex: 'unitName',
//     width: 80,
//     align: 'center'
// },{
//     title: '存货科目',
//     titleText: '存货科目',
//     key: 'inventoryRelatedAccountName',
//     dataIndex: 'inventoryRelatedAccountName',
//     width: 240,
//     isMust: true,
//     isSelect: true,
//     align: 'center'
// }]


export default {
    tableColumns,
    // tableColumn2
}