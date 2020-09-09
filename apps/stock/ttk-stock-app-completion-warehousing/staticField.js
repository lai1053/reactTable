const warehouseingTable = [{
        title:'序号',
        key:'xh',
        dataIndex: 'xh',
        width: 70,
        align: 'center'
    },{
        title:'存货编号',
        key:'inventoryCode',
        dataIndex: 'inventoryCode',
        width: 160,
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
        width:  140,
        align: 'left'
    },{
        title:'单位',
        key:'inventoryUnit',
        dataIndex: 'inventoryUnit',
        align: 'center',
        width: 90

    },{
        title:'入库数',
        key:'num',
        dataIndex: 'num',
        align: 'right',
        width: 170
    },{
        title:'材料分配系数',
        key:'matDisCof',
        dataIndex: 'matDisCof',
        width: 140,
        align: 'right'
}]

export default {
    warehouseingTable
}