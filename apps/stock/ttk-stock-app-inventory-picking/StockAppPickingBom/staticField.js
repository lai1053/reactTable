const step2Table = [{
    title:'存货编号',
    dataIndex: 'inventoryCode',
    align:'left',
    width: 100,
},{
    title:'存货名称',
    dataIndex: 'inventoryName',
    align:'left',
    width: 165,
    flexGrow: 1,
},{
    title:'规格型号',
    dataIndex: 'inventoryGuiGe',
    align:'left',
    width: 95,
},{
    title:'单位',
    dataIndex: 'inventoryUnit',
    align:'left',
    width: 60,
},{
    title:'待领料',
    children:[{
        title: '数量',
        dataIndex: 'num',
        width: 100,
        align: 'left',
        sum: true,
        format: 6,
    },{
        title: '单价',
        dataIndex: 'unitCost',
        width: 100,
        align: 'right',
        format: 6
    },{
        title: '金额',
        dataIndex: 'ybbalance',
        width: 100,
        align: 'right',
        sum: true,
        format: 2
    }]  
},{
    title:'本次领料',
    children:[{
        title: '数量',
        dataIndex: 'bomNum',  // bomNum
        width: 100,
        align: 'left',
        sum: true,
        format: 6
    },{
        title: '金额',
        dataIndex: 'bomBalance',  // bomBalance
        width: 100,
        align: 'right',
        sum: true,
        format: 2
    }]  
},{
    title:'库存缺口',
    children: [{
        title: '数量',
        dataIndex: 'gapNum', 
        width: 100,
        align: 'left',
        sum: true,
        format: 6,
        empty: true
    },{
        title: '金额',
        dataIndex: 'gapBalance',
        width: 100,
        align: 'right',
        sum: true,
        format: 2,
        empty: true
    }]
}]

const step3Table = [{
    title:'存货编号',
    dataIndex: 'inventoryCode',
    align:'left',
    width: 100,
},{
    title:'存货名称',
    dataIndex: 'inventoryName',
    align:'left',
    width: 245,
    flexGrow: 1,
},{
    title:'规格型号',
    dataIndex: 'inventoryGuiGe',
    align:'left',
    width: 90,
},{
    title:'单位',
    dataIndex: 'inventoryUnit',
    align:'left',
    width: 60,
},{
    title:'待领料',
    children:[{
        title: '数量',
        dataIndex: 'num',
        width: 125,
        align: 'left',
        sum: true,
        format: 6
    },{
        title: '单价',
        dataIndex: 'unitCost',
        width: 125,
        align: 'right',
        format: 6
    },{
        title: '金额',
        dataIndex: 'ybbalance',
        width: 125,
        align: 'right',
        sum: true,
        format: 2
    }]  
},{
    title:'本次领料',
    children:[{
        title: '数量',
        dataIndex: 'bomNum',
        width: 125,
        align: 'left',
        sum: true,
        format: 6

    },{
        title: '金额',
        dataIndex: 'bomBalance',
        width: 125,
        align: 'right',
        sum: true,
        format: 2
    }]  
}]

export default {
    step2Table,
    step3Table
}