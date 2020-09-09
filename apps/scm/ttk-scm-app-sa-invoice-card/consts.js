export default {
    status: {
        VOUCHER_STATUS_NORMAL: 1,
        VOUCHER_STATUS_ADD: 2,
        VOUCHER_STATUS_EDIT: 3,
        VOUCHER_STATUS_AUDITED: 128,
        VOUCHER_STATUS_NOTAUDITED: 127,
        VOUCHER_STATUS_WRITEOFF: 131,
        VOUCHER_STATUS_NOTWRITEOFF: 130,
        VOUCHER_STATUS_HASREJECT: 129
    },
    ticketType: {
        pp: { id: 200000000000050, code: '001', name: '增值税普通发票' },
        zp: { id: 200000000000051, code: '002', name: '增值税专用发票' },
        qt: { id: 200000000000052, code: '003', name: '其他票据' },
        hgzp: { code: "004", id: 200000000000053, name: "海关进口增值税专用缴款书" },
        np: { code: "005", id: 200000000000054, name: "农产品发票" },
        qtp: { code: "006", id: 200000000000055, name: "其他发票" },
        qtpk: { code: "007", id: 200000000000056, name: "其他发票(可抵扣)" },
        wkp: { code: "008", id: 200000000000057, name: "未开票" }
    }

}

// export const ticketType = [
//     { enumItemId: '200000000000050', enumItemCode: '001', enumItemName: '增值税普通发票' },
//     { enumItemId: '200000000000051', enumItemCode: '002', enumItemName: '增值税专用发票' },
//     { enumItemId: '200000000000052', enumItemCode: '003', enumItemName: '其他票据' },
//     { enumItemId: '200000000000053', enumItemCode: '004', enumItemName: '海关进口增值税专用缴款书' },
//     { enumItemId: '200000000000054', enumItemCode: '005', enumItemName: '农产品发票' },
//     { enumItemId: '200000000000055', enumItemCode: '006', enumItemName: '其他发票' },
//     { enumItemId: '200000000000056', enumItemCode: '007', enumItemName: '其他发票(可抵扣)' },
//     { enumItemId: '200000000000057', enumItemCode: '008', enumItemName: '未开票' }
// ]
// export const taxRateType = [
//     { id: 100, name: '100%', value: 1, privilegeTaxRate: 0 },
//     { id: 17, name: '17%', value: 0.17, privilegeTaxRate: 0 },
//     { id: 13, name: '13%', value: 0.13, privilegeTaxRate: 0 },
//     { id: 11, name: '11%', value: 0.11, privilegeTaxRate: 0 },
//     { id: 6, name: '6%', value: 0.06, privilegeTaxRate: 0 },
//     { id: 5, name: '5%', value: 0.05, privilegeTaxRate: 0 },
//     { id: 4, name: '4%', value: 0.04, privilegeTaxRate: 0 },
//     { id: 3, name: '3%', value: 0.03, privilegeTaxRate: 0 },
//     { id: 2, name: '3%减按2%', value: 0.03, privilegeTaxRate: 0.01 },
//     { id: 1000, name: '免税', value: 0.00, privilegeTaxRate: 0.00 },
//     { id: 0, name: '0%', value: 0, privilegeTaxRate: 0 }
// ]

// export const period = {
//     today: { id: 0, name: '今天' },
//     yesterday: { id: 1, name: '昨天' },
//     currentWeek: { id: 2, name: '本周' },
//     currentMonth: { id: 3, name: '本月' },
//     currentYear: { id: 4, name: '本年' },
//     defined: { id: 5, name: '自定义' }
// }


// export const bankAccount = {
//     xj: { id: 1, name: '银行基本户' },
//     cjysk: { id: 2, name: '企业微信号' },
//     khqk: { id: 3, name: '企业支付宝' },
//     cjyfk: { id: 4, name: '现金' },
//     ygjk: { id: 9, name: '员工借款' },
//     ygdf: { id: 10, name: '员工垫付' }
// }

// export const VOUCHER_STATUS_NORMAL = 1 //正常
// export const VOUCHER_STATUS_ADD = 2 //新增
// export const VOUCHER_STATUS_EDIT = 3//编辑 (查看状态下进行了修改)

// export const VOUCHER_STATUS_NOTAUDITED = 127       //未审核
// export const VOUCHER_STATUS_AUDITED = 128          //已审核
// export const VOUCHER_STATUS_WRITEOFF = 131         //已冲销
// export const VOUCHER_STATUS_NOTWRITEOFF = 130       //未冲销

// export const VOUCHER_STATUS_HASREJECT = 129         //已驳回


// export const GRID_ROW_HEIGHT = 40
// export const GRID_HEADER_HEIGHT = 38
// export const GRID_FOOTER_HEIGHT = 40
// export const GRID_ROW_DEFAULTCOUNT = 6 //单据明细中的表格默认行数


// export const VOUCHER_CODE_INVOICE = 137//销售发票
// export const VOUCHER_CODE_ARRIVAL = 136 //采购发票
// export const VOUCHER_CODE_PAY = 139 //付款单
// export const VOUCHER_CODE_RECEIVE = 138 //收款单
// export const VOUCHER_CODE_EXPENSE = 145 //费用发票
// export const VOUCHER_CODE_BANKTRANSFER = 144  //银行转帐单

// export const vatTaxpayerType = {
//     YBNSR: { id: 41, name: '一般纳税人' },
//     XGMNSR: { id: 42, name: '小规模纳税人' }
// }

// /**
//  * stock存货帐常量定义
//  */
// export const VOUCHER_CODE_PURCHASEIN = 14601  //采购入库单
// export const VOUCHER_CODE_SALEOUT = 14602  //销售出库单
// export const VOUCHER_CODE_PRODUCTIN = 14603  //产品入库单
// export const VOUCHER_CODE_MATERIALOUT = 14604  //材料出库单
// export const VOUCHER_CODE_PROFITIN = 14605  //盘盈入库单
// export const VOUCHER_CODE_LOSSOUT = 14606  //盘亏出库单
// export const VOUCHER_CODE_COSTADJUSTMENT = 14607  //成本调整单