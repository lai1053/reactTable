const pickMTable = [{
        title:'序号',
        key:'xh',
        dataIndex: 'xh',
        width: 40,
        align: 'center'
    },{
        title:'存货编号',
        key:'inventoryCode',
        dataIndex: 'inventoryCode',
        width: 90,
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
        width:  100,
        align: 'left'
    },{
        title:'存货类型',
        key:'inventoryClassName',
        dataIndex: 'inventoryClassName',
        width:  110,
        align: 'left'
    },{
        title:'单位',
        key:'inventoryUnit',
        dataIndex: 'inventoryUnit',
        align: 'left',
        width: 70
    },{
        title:'数量',
        key:'num',
        titleText: '数量',
        isMust: true,
        dataIndex: 'num',
        align: 'right',
        width: 130
    },{
        title:'单价',
        key:'price',
        dataIndex: 'price',
        width: 130,
        align: 'right'
}]

export default {
    pickMTable
}