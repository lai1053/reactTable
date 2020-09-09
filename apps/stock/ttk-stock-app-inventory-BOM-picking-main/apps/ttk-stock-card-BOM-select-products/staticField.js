const tableColumnsField = [{
    title:'存货编号',
    dataIndex: 'inventoryCode',
    width: 130,
    align:'left'
},{
    title:'存货名称',
    dataIndex: 'inventoryName',
    align:'left',
    width: 240,
    flexGrow: 1,
},{
    title:'规格型号',
    dataIndex: 'inventoryGuiGe',
    align:'left',
    width: 140,
},{
    title:'存货类型',
    dataIndex: 'inventoryClassName',
    align:'left',
    width: 150
},{
    title:'计量单位组',
    dataIndex: 'inventoryUnit',
    align:'left',
    width: 120
}]

export default {
    tableColumnsField
}