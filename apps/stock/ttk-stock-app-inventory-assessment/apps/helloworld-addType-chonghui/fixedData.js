export const columnField = [
    {
        key: 'inventoryCode',
        dataIndex: 'inventoryCode',
        title: '存货编号',
        width: 80,
        align: 'alignLeft'
    },{
        key: 'inventoryName',
        dataIndex: 'inventoryName',
        title: '存货名称',
        width: 150,
        flexGrow: 1,
        align: 'alignLeft'
    },
    {
        key: 'inventoryGuiGe',
        dataIndex: 'inventoryGuiGe',
        title: '规格型号',
        width: 90,
        align: 'alignLeft'
    },{
        key: 'inventoryUnit',
        dataIndex: 'inventoryUnit',
        title: '单位',
        width: 70,
        align: 'alignLeft'
    },{
        key: 'ckNum',
        dataIndex: 'ckNum',
        title: '库存数量',
        width: 90,
        sum: true,
        format: 6,
        align: 'alignLeft',
        sort: true
    }, {
        title: '待冲回',
        // id: 'dch',
        children: [{
            key: 'num',
            dataIndex: 'num',
            title: '数量',
            width: 90,
            sum: true,
            format: 6,
            align: 'alignLeft',
        },{
            key: 'price',
            dataIndex: 'price',
            title: '单价',
            width: 90,
            format: 6,
            align: 'alignRight',
        },{
            key: 'ybbalance',
            dataIndex: 'ybbalance',
            title: '金额',
            width: 90,
            sum: true,
            format: 2,
            align: 'alignRight',
        }]
    },{
        title: '冲回',
        // id: 'ch',
        children: [{
            key: 'numberChange',
            dataIndex: 'numberChange',
            title: '数量',
            width: 100,
            sum: true,
            format: 6,
            align: 'alignLeft',
        },{
            key: 'moneryChange',
            dataIndex: 'moneryChange',
            title: '金额',
            width: 100,
            sum: true,
            format: 2,
            align: 'alignRight',
        }]
    }]