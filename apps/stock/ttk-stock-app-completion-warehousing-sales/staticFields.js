const columns = [{
    title: '存货档案信息',
    key:'stockInfo',
    children: [
        {
            title: '存货编号',
            dataIndex: 'inventoryCode',
            key:'inventoryCode', 
            textAlign: 'left',
            width: 80
        },{
            title: '存货简称',
            dataIndex: 'inventoryName',
            key:'inventoryName',
            textAlign: 'left',
            width: 100
        },{
            title: '规格型号',
            dataIndex: 'inventoryGuiGe',
            key:'inventoryGuiGe',
            textAlign: 'left',
            width: 80
        },{
            title: '单位',
            dataIndex: 'inventoryUnit',
            key:'inventoryUnit',
            align: 'center',
            width: 50
        }
    ]
},{
    title: '期初库存',
    key: 'currentStock',
    children: [
        {
            title: '库存数量',
            dataIndex: 'initialQuantity',
            key:'initialQuantity',
            align:'right',
            width: 115
        },{
            title: '库存金额',
            dataIndex: 'initialAmount',
            key:'initialAmount',
            align:'right',
            width: 120
        }
    ]
},{
    title: '本期销售汇总',
    key: 'currentSales',
    children: [
        {
            title: '销售数量',
            dataIndex: 'salesNum',
            key:'salesNum', 
            align:'right',
            width: 115
        },{
            title: '销售金额',
            dataIndex: 'salesVolume',
            key:'salesVolume',
            align:'right',
            width: 115 
        },{
            title: '销售成本比率',
            dataIndex: 'salesCostRate',
            key:'salesCostRate',
            align:'right',
            width: 85
        }
    ]
},{
    title: '本期需生产入库',
    key: 'needToProduce',
    children: [
        {
            title: '生产数量',
            dataIndex: 'num',
            key:'num', 
            align:'right',
            width: 115
        },{
            title: '生产成本金额',
            dataIndex: 'ybbalance',
            key:'ybbalance',
            align:'right',
            width: 120
        }
    ]
}]

export default {
    columns
}