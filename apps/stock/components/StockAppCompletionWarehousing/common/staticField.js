const warehouseingTable = [
    {
        title: "序号",
        key: "xh",
        dataIndex: "xh",
        width: 70,
        minWidth: 70,
        align: "center",
        fixed: 'left'
    },
    {
        title: "存货编号",
        key: "inventoryCode",
        dataIndex: "inventoryCode",
        width: 160,
        minWidth: 160,
        align: "left",
    },
    {
        title: "存货名称",
        key: "inventoryName",
        dataIndex: "inventoryName",
        align: "left",
        flexGrow: 1,
    },
    {
        title: "规格型号",
        key: "inventoryGuiGe",
        dataIndex: "inventoryGuiGe",
        width: 140,
        minWidth: 140,
        align: "left",
    },
    {
        title: "单位",
        key: "inventoryUnit",
        dataIndex: "inventoryUnit",
        align: "center",
        width: 90,
        minWidth: 90,
    },
    {
        title: "入库数",
        key: "num",
        dataIndex: "num",
        align: "right",
        width: 170,
        minWidth: 170,
    },
    {
        title: "材料分配系数",
        key: "matDisCof",
        dataIndex: "matDisCof",
        width: 140,
        minWidth: 140,
        align: "right",
    },
]

const warehouseingSalesTable = [
    {
        title: "存货编号",
        dataIndex: "inventoryCode",
        key: "inventoryCode",
        textAlign: "left",
        width: 110,
        minWidth: 110,
        fixed: 'left'
    },
    {
        title: "存货档案信息",
        key: "stockInfo",
        flexGrow: 1,
        children: [
            {
                title: "存货名称",
                dataIndex: "inventoryName",
                key: "inventoryName",
                textAlign: "left",
                flexGrow: 1,
            },
            {
                title: "规格型号",
                dataIndex: "inventoryGuiGe",
                key: "inventoryGuiGe",
                textAlign: "left",
                width: 80,
                minWidth: 80,
            },
            {
                title: "单位",
                dataIndex: "inventoryUnit",
                key: "inventoryUnit",
                align: "center",
                width: 50,
                minWidth: 50
            },
        ],
    },
    {
        title: "库存",
        key: "currentStock",
        children: [
            {
                title: "数量",
                dataIndex: "inventoryQuantity",
                key: "inventoryQuantity",
                align: "right",
                width: 115,
                minWidth: 115,
            },
            {
                title: "金额",
                dataIndex: "stockAmount",
                key: "stockAmount",
                align: "right",
                width: 120,
                minWidth: 120,
            },
        ],
    },
    {
        title: "本期销售汇总",
        key: "currentSales",
        children: [
            {
                title: "数量",
                dataIndex: "salesNum",
                key: "salesNum",
                align: "right",
                width: 115,
                minWidth: 115,
            },
            {
                title: "金额",
                dataIndex: "salesVolume",
                key: "salesVolume",
                align: "right",
                width: 115,
                minWidth: 115,
            },
            {
                title: "销售成本率",
                dataIndex: "salesCostRate",
                key: "salesCostRate",
                align: "right",
                width: 100,
                minWidth: 100,
            },
        ],
    },
    {
        title: "完工入库",
        key: "needToProduce",
        children: [
            {
                title: "完工入库数",
                dataIndex: "num",
                key: "num",
                align: "right",
                width: 115,
                minWidth: 115,
            },
            {
                title: "完工成本",
                dataIndex: "ybbalance",
                key: "ybbalance",
                align: "right",
                width: 120,
                minWidth: 120,
            },
        ],
    },
]

const warehouseingSalesListTable = [
    {
        title: "序号",
        key: "xh",
        dataIndex: "xh",
        align: "center",
        width: 60,
        minWidth: 60,
        fixed: 'left'
    },
    {
        title: "存货编号",
        key: "inventoryCode",
        dataIndex: "inventoryCode",
        align: "left",
        // width: 120,
        flexGrow: 1,
    },
    {
        title: "存货名称",
        key: "inventoryName",
        dataIndex: "inventoryName",
        align: "left",
        width: 300,
        minWidth: 300,
    },
    {
        title: "规格型号",
        key: "inventoryGuiGe",
        dataIndex: "inventoryGuiGe",
        align: "left",
        width: 140,
        minWidth: 140,
    },
    {
        title: "单位",
        key: "inventoryUnit",
        dataIndex: "inventoryUnit",
        align: "center",
        width: 80,
        minWidth: 80,
    },
    {
        title: "生产数量",
        key: "num",
        dataIndex: "num",
        align: "right",
        width: 180,
        minWidth: 180,
    },
    {
        title: "生产成本金额",
        key: "ybbalance",
        dataIndex: "ybbalance",
        align: "right",
        width: 180,
        minWidth: 180,
    },
]

const tableColumnsField = [
    {
        title: "序号",
        dataIndex: "sequence",
        align: "center",
        width: 60,
        render: (text, record, index) => index + 1,
    },
    {
        title: "存货类型",
        dataIndex: "inventoryClassName",
        width: 185,
    },
    {
        title: "存货编号",
        dataIndex: "inventoryCode",
        align: "center",
        width: 123,
        flexGrow: 1,
    },
    {
        title: "存货名称",
        dataIndex: "inventoryName",
        align: "left",
        width: 185,
    },
    {
        title: "规格型号",
        dataIndex: "inventoryGuiGe",
        width: 185,
    },
    {
        title: "单位",
        dataIndex: "inventoryUnit",
        align: "center",
        width: 185,
    },
]

export default {
    warehouseingTable,
    warehouseingSalesTable,
    warehouseingSalesListTable,
    tableColumnsField,
}
