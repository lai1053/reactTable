const warehouseingTable = [{
        title:'序号',
        key:'xh',
        dataIndex: 'xh',
        align: 'center',
        width: 70
    },{
        title:'存货编号',
        key:'inventoryCode',
        dataIndex: 'inventoryCode',
        align: 'left',
        width: 120
        },{
        title:'存货名称',
        key:'inventoryName',
        dataIndex: 'inventoryName', 
        align: 'left',
    },{
        title:'规格型号',
        key:'inventoryGuiGe',
        dataIndex: 'inventoryGuiGe',
        align: 'left',
        width: 140,
    },{
        title:'单位',
        key:'inventoryUnit',
        dataIndex: 'inventoryUnit',
        align: 'center',
        width: 80,
    },{
        title:'生产数量',
        key:'num',
        dataIndex: 'num',
        align: 'right',
        width: 180
    },{
        title:'生产成本金额',
        key:'ybbalance',
        dataIndex: 'ybbalance',
        align: 'right',
        width: 180
}]

export default {
    warehouseingTable
}