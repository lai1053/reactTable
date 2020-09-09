const data = {
    '5001001001': {
        name: '采购入库',
        detail: {
            inventoryName: true,//存货名称
            specification: true,//规格型号
            unitName: true, //单位名称
            quantity: true, //数量
            price: true, //单价
            amount: true,//金额
        }
    },
    '5001001005': {
        name: '销售出库',
        detail: {
            inventoryCode: true, //存货编码
            inventoryName: true, //存货名称
            specification: true,//规格型号
            unitName: true, //单位名称
            quantity: true, //数量
            price: true, //单价
            amount: true,//金额
        }
    },
    '5001001003': {
        name: '产品入库',
        detail: {
            inventoryName: true, //存货名称
            unitName: true, //单位名称
            specification: true,//规格型号
            quantity: true, //数量
            price: true, //单价
            amount: true,//金额
        }
    },
    '5001001002': {
        name: '盘盈入库',
        detail: {
            inventoryName: true, //存货名称
            unitName: true, //单位名称
            specification: true,//规格型号
            quantity: true, //数量
            price: true, //单价
            amount: true,//金额
        }
    },
    '5001001006': {
        name: '盘亏出库',
        detail: {
            inventoryName: true, //存货名称
            specification: true,//规格型号
            unitName: true, //单位名称
            quantity: true, //数量
            price: true, //单价
            amount: true,//金额
        }
    },
    '5001001007': {
        name: '材料出库',
        detail: {
            inventoryName: true, //存货名称
            specification: true,//规格型号
            unitName: true, //单位名称
            quantity: true, //数量
            price: true, //单价
            amount: true,//金额

        }
    },
    '5001001009': {
        name: '成本调整',
        detail: {
            inventoryName: true, //存货名称
            specification: true,//规格型号
            unitName: true, //单位名称
            amount: true,//金额

        }
    },
    '5001001004': {
        name: '暂估入库',
        detail: {
            inventoryName: true, //存货名称
            specification: true,//规格型号
            unitName: true, //单位名称
            quantity: true, //数量
            price: true, //单价
            amount: true,//金额
        }
    },
    '5001001008': {
        name: '暂估回冲',
        detail: {
            inventoryName: true, //存货名称
            unitName: true, //单位名称
            specification: true,//规格型号
            quantity: true, //数量
            price: true, //单价
            amount: true,//金额
        }
    }
}

export default data
     