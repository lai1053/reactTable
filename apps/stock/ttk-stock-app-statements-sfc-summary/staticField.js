const tableColumns = [{
    title: '存货编号',
    dataIndex: 'inventoryCode',
    key: 'inventoryCode',
    width: 110,
    align: 'left',
    fixed: 'left'
},{
    title: '存货名称',
    dataIndex: 'inventoryName',
    key: 'inventoryName',
    width: 180,
    align: 'left',
    fixed: 'left'
},{
    title: '规格型号',
    dataIndex: 'inventoryGuiGe',
    key: 'inventoryGuiGe',
    width: 120,
    align: 'left',
    fixed: 'left'
},{
    title: '单位',
    dataIndex: 'inventoryUnit',
    key: 'inventoryUnit',
    width: 100,
    align: 'center',
    fixed: 'left'
},{
    title: '期初',
    children:[
        {
            title: '数量',
            dataIndex: 'qcNum',
            key: 'qcNum',
            width: 120,
            align: 'right', 
        },{
            title: '单价',
            dataIndex: 'qcPrice',
            key: 'qcPrice',
            width: 120,
            align: 'right',
        },{
            title: '金额',
            dataIndex: 'qcBalance',
            key: 'qcBalance',
            width: 120,
            align: 'right',
        }   
    ]
},{
    title: '入库',
    children:[
        {
            title: '数量',
            dataIndex: 'rkNum',
            key: 'rkNum',
            width: 120,
            align: 'right', 
        },{
            title: '单价',
            dataIndex: 'rkPrice',
            key: 'rkPrice',
            width: 120,
            align: 'right',
        },{
            title: '金额',
            dataIndex: 'rkBalance',
            key: 'rkBalance',
            width: 120,
            align: 'right',
        }   
    ]
},{
    title: '出库',
    children:[
        {
            title: '数量',
            dataIndex: 'ckNum',
            key: 'ckNum',
            width: 120,
            align: 'right', 
        },{
            title: '单价',
            dataIndex: 'ckPrice',
            key: 'ckPrice',
            width: 120,
            align: 'right',
        },{
            title: '金额',
            dataIndex: 'ckBalance',
            key: 'ckBalance',
            width: 120,
            align: 'right',
        }   
    ]
},{
    title: '成本差异',
    dataIndex: 'diffCost',
    key: 'diffCost',
    width: 120,
    align: 'right', 
},{
    title: '期末',
    children:[
        {
            title: '数量',
            dataIndex: 'qmNum',
            key: 'qmNum',
            width: 120,
            align: 'right', 
        },{
            title: '单价',
            dataIndex: 'qmPrice',
            key: 'qmPrice',
            width: 120,
            align: 'right',
        },{
            title: '金额',
            dataIndex: 'qmBalance',
            key: 'qmBalance',
            width: 120,
            align: 'right',
        }   
    ]
}]

export default {
    tableColumns
}