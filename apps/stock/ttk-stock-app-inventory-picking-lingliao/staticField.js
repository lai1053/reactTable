// const step2Table = [{
//     title:'存货编号',
//     dataIndex: 'inventoryCode',
//     align:'left',
//     width: 88,
// },{
//     title:'存货名称',
//     dataIndex: 'inventoryName',
//     align:'left',

//     flexGrow: 1,
// },{
//     title:'规格型号',
//     dataIndex: 'inventoryGuiGe',
//     align:'left',
//     width: 77,
// },{
//     title:'单位',
//     dataIndex: 'inventoryUnit',
//     align:'center',
//     width: 45,
// },{
//     title:'待领料',
//     children:[{
//         title: '数量',
//         dataIndex: 'num',
//         width: 120,
//         align: 'left',
//     },{
//         title: '单价',
//         dataIndex: 'unitCost',
//         width: 110,
//         align: 'right',
//     },{
//         title: '金额',
//         dataIndex: 'ybbalance',
//         width: 110,
//         align: 'right',
//     }]  
// },{
//     title:'本次领料',
//     children:[{
//         title: '数量',
//         dataIndex: 'numChange',
//         width: 110,
//         align: 'left',
//     },{
//         title: '金额',
//         dataIndex: 'ybbalanceChange', 
//         width: 110,
//         align: 'right',
//     }]  
// },{
//     title:'库存缺口',
//     children: [{
//         title: '数量',
//         dataIndex: 'inventoryGap', // kucunnumber
//         width: 110,
//         align: 'left',
//     },{
//         title: '金额',
//         dataIndex: 'zanguYbbalance', // kucunmonery
//         width: 110,
//         align: 'right',
//     }]
// }]

// const step3Table = [{
//     title:'存货编号',
//     dataIndex: 'inventoryCode',
//     align:'left',
//     width: 90,
// },{
//     title:'存货名称',
//     dataIndex: 'inventoryName',
//     align:'left',
//     flexGrow: 1,
// },{
//     title:'规格型号',
//     dataIndex: 'inventoryGuiGe',
//     align:'left',
//     width: 80,
// },{
//     title:'单位',
//     dataIndex: 'inventoryUnit',
//     align:'center',
//     width: 50,
// },{
//     title:'待领料',
//     children:[{
//         title: '数量',
//         dataIndex: 'num',
//         width: 128,
//         align: 'left',
//     },{
//         title: '单价',
//         dataIndex: 'unitCost',
//         width: 128,
//         align: 'right',
//     },{
//         title: '金额',
//         dataIndex: 'ybbalance',
//         width: 128,
//         align: 'right',
//     }]  
// },{
//     title:'本次领料',
//     children:[{
//         title: '数量',
//         dataIndex: 'numChange',
//         width: 128,
//         align: 'left',
//     },{
//         title: '金额',
//         dataIndex: 'ybbalanceChange',
//         width: 128,
//         align: 'right',
//     }]  
// }]

// export default {
//     step2Table,
//     step3Table
// }


const step2Table = [{
    title:'存货编号',
    dataIndex: 'inventoryCode',
    key: 'inventoryCode',
    align:'left',
    width: 100,
},{
    title:'存货名称',
    dataIndex: 'inventoryName',
    key: 'inventoryName',
    align:'left',
    width: 165,
    flexGrow: 1
},{
    title:'规格型号',
    dataIndex: 'inventoryGuiGe',
    key: 'inventoryGuiGe',
    align:'left',
    width: 95,
},{
    title:'单位',
    dataIndex: 'inventoryUnit',
    key: 'inventoryUnit',
    align:'left',
    width: 60,
},{
    title:'待领料',
    children:[{
        title: '数量',
        dataIndex: 'num',
        key: 'num',
        width: 100,
        align: 'left',
        sum: true,
        format: 6
    },{
        title: '单价',
        dataIndex: 'unitCost',
        key: 'unitCost',
        width: 100,
        align: 'right',
        format: 6
    },{
        title: '金额',
        dataIndex: 'ybbalance',
        key: 'ybbalance',
        width: 100,
        align: 'right',
        sum: true,
        format: 2
    }]  
},{
    title:'本次领料',
    children:[{
        title: '数量',
        dataIndex: 'numChange',  // numChange
        key: 'numChange',  // numChange
        width: 100,
        align: 'left',
        sum: true,
        format: 6,
    },{
        title: '金额',
        dataIndex: 'ybbalanceChange',  // ybbalanceChange
        key: 'ybbalanceChange',  // ybbalanceChange
        width: 100,
        align: 'right',
        sum: true,
        format: 2
    }]  
},{
    title:'库存缺口',
    children: [{
        title: '数量',
        dataIndex: 'inventoryGap', // kucunnumber
        key: 'inventoryGap', // kucunnumber
        width: 100,
        align: 'left',
        sum: true,
        format: 6
    },{
        title: '金额',
        dataIndex: 'zanguYbbalance', // kucunmonery
        key: 'zanguYbbalance', // kucunmonery
        width: 100,
        align: 'right',
        sum: true,
        format: 2
    }]
}]

const step3Table = [{
    title:'存货编号',
    dataIndex: 'inventoryCode',
    key: 'inventoryCode',
    align:'left',
    width: 100,
},{
    title:'存货名称',
    dataIndex: 'inventoryName',
    key: 'inventoryName',
    align:'left',
    width: 245,
    flexGrow: 1
},{
    title:'规格型号',
    dataIndex: 'inventoryGuiGe',
    key: 'inventoryGuiGe',
    align:'left',
    width: 90,
},{
    title:'单位',
    dataIndex: 'inventoryUnit',
    key: 'inventoryUnit',
    align:'left',
    width: 60,
},{
    title:'待领料',
    children:[{
        title: '数量',
        dataIndex: 'num',
        key: 'num',
        width: 125,
        align: 'left',
        sum: true,
        format: 6
    },{
        title: '单价',
        dataIndex: 'unitCost',
        key: 'unitCost',
        width: 125,
        align: 'right',
        format: 6
    },{
        title: '金额',
        dataIndex: 'ybbalance',
        key: 'ybbalance',
        width: 125,
        align: 'right',
        sum: true,
        format: 2
    }]  
},{
    title:'本次领料',
    children:[{
        title: '数量',
        dataIndex: 'numChange',
        key: 'numChange',
        width: 125,
        align: 'left',
        sum: true,
        format: 6
    },{
        title: '金额',
        dataIndex: 'ybbalanceChange',
        key: 'ybbalanceChange',
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