const productionCostTable = [{
        title:'存货编号',
        key:'inventoryCode',
        dataIndex: 'inventoryCode',
        width: 95,
        align: 'left',
    },{
        title:'存货名称',
        key:'inventoryName',
        dataIndex: 'inventoryName',
        align: 'left',
        flexGrow: 1,
        width: 120,
    },{
        title:'规格型号',
        key:'inventoryGuiGe',
        dataIndex: 'inventoryGuiGe', 
        align: 'left',
        width: 90,
    },{
        title:'单位',
        key:'inventoryUnit',
        dataIndex: 'inventoryUnit',
        align: 'center',
        width: 60,
    },{
        title: '完工入库',
        key: 'completion',
        children: [{
            title:'数量',
            key:'putInNum',
            dataIndex: 'putInNum',
            align: 'right', 
            width: 100,
            format: 6,
            sum: true
        },{
            title:'单价',
            key:'price',
            dataIndex: 'price',
            align: 'right',
            width: 90,
        },{
            title:'金额',
            key:'putInCost',
            dataIndex: 'putInCost',
            align: 'right',
            width: 100,
            sum: true,
            format: 2
        }]
    },{
        title:'百分比',
        key:'costRate',
        dataIndex: 'costRate',
        width: 90,
        align: 'right',
        sum: true,
        format: 6
    },{
        title:'成本构成',
        key: 'costItems',
        children:[{
        //     title: 'bom领料',
        //     key: 'bomMaterialFee',
        //     dataIndex: 'bomMaterialFee',
        //     width: 100,
        //     align: 'right',
        //     sum: true,
        //     format: 2
        // },{
            title: '直接材料',
            key: 'materialFee',
            dataIndex: 'materialFee',
            width: 100,
            align: 'right',
            sum: true,
            format: 2
        },{
            title: '直接人工',
            key: 'personCost',
            dataIndex: 'personCost',
            width: 100,
            align: 'right',
            sum: true,
            format: 2
        },{
            title: '制造费用',
            key: 'directCost',
            dataIndex: 'directCost',
            width: 100,
            align: 'right',
            sum: true,
            format: 2
        },{
            title: '其他费用',
            key: 'otherexpenses',
            dataIndex: 'otherexpenses',
            width: 100,
            align: 'right',
            sum: true,
            format: 2
        }]
}]

const tableColumns = [
    {
        title: '成本费用',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        width: 200,
    }, 
    {
        title: '期初余额',
        dataIndex: 'lastAmount',
        key: 'lastAmount',
        align: 'center',
        width: 200
    }, 
    {
        title: '本期发生',
        dataIndex: 'currentAmount',
        key: 'currentAmount',
        align: 'center',
        width: 200
    }, 
    {
        title: '本期结转',
        dataIndex: 'currentCost',
        key: 'currentCost',
        align: 'center',
        width: 200
    }, 
    {
        title: '本期结余',
        dataIndex: 'currentBalance',
        key: 'currentBalance',
        align: 'center',
        width: 200
    }
]


export default {
    productionCostTable,
    tableColumns
}