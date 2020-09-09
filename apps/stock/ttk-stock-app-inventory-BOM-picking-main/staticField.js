const BOMListTable = [{
        title:'BOM编码',
        key:'bomCode',
        dataIndex: 'bomCode',
        width: 110,
        align: 'left'
    },{
        title:'存货编号',
        key:'inventoryCode',
        dataIndex: 'inventoryCode',
        width: 100,
        align: 'left'
    },{
        title:'存货名称',
        key:'inventoryName',
        dataIndex: 'inventoryName',
        align: 'left'   
    },{
        title:'规格型号',
        key:'inventoryGuiGe',
        dataIndex: 'inventoryGuiGe',
        width:  90,
        align: 'left'
    },{
        title:'存货类型',
        key:'inventoryClassName',
        dataIndex: 'inventoryClassName',
        align: 'left',
        width: 130
    },{
        title:'单位',
        key:'inventoryUnit',
        dataIndex: 'inventoryUnit',
        align: 'left',
        width: 60
    },{
        title:'数量',
        key:'num',
        dataIndex: 'num',
        width: 120,
        align: 'right'
    },{
        title:'单价',
        key:'price',
        dataIndex: 'price',
        width: 120,
        align: 'right'
    },{
        title:'操作',
        key:'operation',
        dataIndex: 'operation',
        width: 120,
        align: 'center'
}]

export default {
    BOMListTable
}