const tableColumns = [{
    title: '存货编号',
    dataIndex: 'inventoryCode',
    key: 'inventoryCode',
    width: 85,
    align: 'left'
},{
    title: '存货名称',
    dataIndex: 'inventoryName',
    key: 'inventoryName',
    width: 140,
    align: 'left'
},{
    title: '规格型号',
    dataIndex: 'inventoryGuiGe',
    key: 'inventoryGuiGe',
    width: 90,
    align: 'left'
},{
    title: '单位',
    dataIndex: 'inventoryUnit',
    key: 'inventoryUnit',
    width: 60,
    align: 'center'
},{
    title: '完工入库数',
    dataIndex: 'putInNum',
    key: 'putInNum',
    width: 120,
    align: 'right'
},{
    title: '单价',
    dataIndex: 'price',
    key: 'price',
    width: 100,
    align: 'right'
},{
    title: '完工成本',
    dataIndex: 'putInCost',
    key: 'putInCost',
    width: 110,
    align: 'right'
},{
    title: '百分比',
    dataIndex: 'costRate',
    key: 'costRate',
    width: 80,
    align: 'right'
},{
    title: '成本构成',
    children:[
        {
            title: '直接材料',
            dataIndex: 'materialFee',
            key: 'materialFee',
            width: 105,
            align: 'right', 
        },{
            title: '直接人工',
            dataIndex: 'personCost',
            key: 'personCost',
            width: 105,
            align: 'right',
        },{
            title: '制造费用',
            dataIndex: 'directCost',
            key: 'directCost',
            width: 105,
            align: 'right',
        },{
            title: '其他费用',
            dataIndex: 'otherexpenses',
            key: 'otherexpenses',
            width: 105,
            align: 'right',
        }    
    ]
}]

export default {
    tableColumns
}