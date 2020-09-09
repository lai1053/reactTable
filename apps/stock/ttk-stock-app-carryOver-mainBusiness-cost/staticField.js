const mainBusinessTable = [
    {
        title: "存货编号",
        key: "inventoryCode",
        dataIndex: "inventoryCode",
        align: "left",
        flexGrow: 1,
        // fixed: 'left'
    },
    {
        title: "存货名称",
        key: "inventoryName",
        dataIndex: "inventoryName",
        align: "left",
        width: 250,
        minWidth: 250,
        // fixed: 'left'
    },
    {
        title: "规格型号",
        key: "inventoryGuiGe",
        dataIndex: "inventoryGuiGe",
        align: "left",
        width: 100,
        minWidth: 100,
        // fixed: 'left'
    },
    {
        title: "单位",
        key: "inventoryUnit",
        dataIndex: "inventoryUnit",
        align: "left",
        width: 70,
        minWidth: 70,
        // fixed: 'left'
    },
    // {
    //     title:'期初',
    //     width: 420,
    //     children:[
    //         {
    //             title: '数量',
    //             key: 'qcNum',
    //             dataIndex: 'qcNum',
    //             width: 140,
    //             align: 'right',
    //         },{
    //             title: '单价',
    //             key: 'qcPrice',
    //             dataIndex: 'qcPrice',
    //             width: 140,
    //             align: 'right'
    //         },{
    //             title: '金额',
    //             key: 'qcBalance',
    //             dataIndex: 'qcBalance',
    //             width: 140,
    //             align: 'right',
    //         }
    //     ]
    // },
    // {
    //     title:'入库',
    //     width: 420,
    //     children:[
    //         {
    //             title: '数量',
    //             key: 'rkNum',
    //             dataIndex: 'rkNum',
    //             width: 140,
    //             align: 'right',
    //         },{
    //             title: '单价',
    //             key: 'rkPrice',
    //             dataIndex: 'rkPrice',
    //             width: 140,
    //             align: 'center'
    //         },{
    //             title: '金额',
    //             key: 'rkBalance',
    //             dataIndex: 'rkBalance',
    //             width: 140,
    //             align: 'right',
    //         }
    //     ]
    // },
    {
        title: "销售出库",
        // flexGrow: 1,
        children: [
            // {
            //     title: '数量',
            //     key: 'ckNum',
            //     dataIndex: 'ckNum',
            //     width: 120,
            //     align: 'right',
            // },
            {
                title: "数量",
                key: "qzNum",
                dataIndex: "qzNum",
                width: 120,
                minWidth: 120,
                align: "left",
            },
            // {
            //     title: '其中：销售数',
            //     key: 'qzNum',
            //     dataIndex: 'qzNum',
            //     width: 140,
            //     align: 'right'
            // },
            {
                title: "单价",
                key: "ckPrice",
                dataIndex: "ckPrice",
                width: 120,
                minWidth: 120,
                align: "right",
            },
            // {
            //     title: '金额',
            //     key: 'ckBalance',
            //     dataIndex: 'ckBalance',
            //     width: 120,
            //     align: 'right',
            // },
            {
                title: "金额",
                key: "qzBalance",
                dataIndex: "qzBalance",
                width: 120,
                minWidth: 120,
                align: "right",
            },
        ],
    },
    // {
    //     title: '成本差异',
    //     key: 'diffCost',
    //     dataIndex: 'diffCost',
    //     width: 140,
    //     align: 'right',
    // },
    {
        title: "期末",
        // flexGrow: 1,
        children: [
            {
                title: "数量",
                key: "qmNum",
                dataIndex: "qmNum",
                width: 120,
                minWidth: 120,
                align: "left",
            },
            {
                title: "单价",
                key: "qmPrice",
                dataIndex: "qmPrice",
                width: 120,
                minWidth: 120,
                align: "right",
            },
            {
                title: "金额",
                key: "qmBalance",
                dataIndex: "qmBalance",
                width: 120,
                minWidth: 120,
                align: "right",
            },
        ],
    },
]

const mainBusinessTableTotal = [
    {
        title: "存货编号",
        key: "inventoryCodeTotal",
        dataIndex: "inventoryCodeTotal",
        width: 90,
        align: "left",
        // fixed: 'left'
    },
    {
        title: "存货名称",
        key: "inventoryNameTotal",
        dataIndex: "inventoryNameTotal",
        align: "left",
        width: 180,
        // fixed: 'left'
    },
    {
        title: "规格型号",
        key: "inventoryGuiGeTotal",
        dataIndex: "inventoryGuiGeTotal",
        align: "left",
        width: 100,
        // fixed: 'left'
    },
    {
        title: "单位",
        key: "inventoryUnitTotal",
        dataIndex: "inventoryUnitTotal",
        align: "left",
        width: 70,
        // fixed: 'left'
    },
    // {
    //     title:'期初',
    //     width: 420,
    //     children:[
    //         {
    //             title: '数量',
    //             key: 'qcNum',
    //             dataIndex: 'qcNum',
    //             width: 140,
    //             align: 'right',
    //         },{
    //             title: '单价',
    //             key: 'qcPrice',
    //             dataIndex: 'qcPrice',
    //             width: 140,
    //             align: 'right'
    //         },{
    //             title: '金额',
    //             key: 'qcBalance',
    //             dataIndex: 'qcBalance',
    //             width: 140,
    //             align: 'right',
    //         }
    //     ]
    // },
    // {
    //     title:'入库',
    //     width: 420,
    //     children:[
    //         {
    //             title: '数量',
    //             key: 'rkNum',
    //             dataIndex: 'rkNum',
    //             width: 140,
    //             align: 'right',
    //         },{
    //             title: '单价',
    //             key: 'rkPrice',
    //             dataIndex: 'rkPrice',
    //             width: 140,
    //             align: 'center'
    //         },{
    //             title: '金额',
    //             key: 'rkBalance',
    //             dataIndex: 'rkBalance',
    //             width: 140,
    //             align: 'right',
    //         }
    //     ]
    // },
    {
        title: "销售出库",
        width: 560,
        children: [
            // {
            //     title: '数量',
            //     key: 'ckNumTotal',
            //     dataIndex: 'ckNumTotal',
            //     width: 120,
            //     align: 'right',
            // },
            // {
            //     title: '其中：销售数',
            //     key: 'qzNum',
            //     dataIndex: 'qzNum',
            //     width: 140,
            //     align: 'right'
            // },
            {
                title: "数量",
                key: "qzNumTotal",
                dataIndex: "qzNumTotal",
                width: 120,
                align: "left",
            },
            {
                title: "单价",
                key: "ckPriceTotal",
                dataIndex: "ckPriceTotal",
                width: 120,
                align: "right",
            },
            // {
            //     title: '金额',
            //     key: 'ckBalanceTotal',
            //     dataIndex: 'ckBalanceTotal',
            //     width: 120,
            //     align: 'right',
            // }
            {
                title: "金额",
                key: "qzBalanceTotal",
                dataIndex: "qzBalanceTotal",
                width: 120,
                align: "right",
            },
        ],
    },
    // {
    //     title: '成本差异',
    //     key: 'diffCost',
    //     dataIndex: 'diffCost',
    //     width: 140,
    //     align: 'right',
    // },
    {
        title: "期末",
        width: 420,
        children: [
            {
                title: "数量",
                key: "qmNumTotal",
                dataIndex: "qmNumTotal",
                width: 120,
                align: "left",
            },
            {
                title: "单价",
                key: "qmPriceTotal",
                dataIndex: "qmPriceTotal",
                width: 120,
                align: "right",
            },
            {
                title: "金额",
                key: "qmBalanceTotal",
                dataIndex: "qmBalanceTotal",
                width: 120,
                align: "right",
            },
        ],
    },
]

export default {
    mainBusinessTable,
    mainBusinessTableTotal,
}
