/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    stock: {
        getInventoryTypesFromArchives: v =>
            fetch.post("/v1/biz/bovms/stock/common/getInventoryTypesFromArchives", v), //存货列表
        getCarryMainCostSheetService: v =>
            fetch.post("/v1/biz/bovms/stock/carrymainsheet/getCarryMainCostSheetService", v), // 结转主列表
        print: options => fetch.printPost("/v1/biz/bovms/stock/carrymainsheet/print", options), // 打印
        createPZ: v => fetch.post("/v1/biz/bovms/stock/carrymainsheet/createPZ", v), // 生成凭证
        deletePZ: v => fetch.post("/v1/biz/bovms/stock/carryproducesheet/deletePZ", v), // 删除凭证
        deleteCostSheet: v =>
            fetch.post("/v1/biz/bovms/stock/carryproducesheet/deleteCostSheet", v), // 删除成本单据
        getInventoryGoods: v => fetch.post("/v1/biz/bovms/stock/common/getInventoryGoods", v), // 获取存货列表
        createBillTitle: v => fetch.post("/v1/biz/bovms/stock/bill/title/createBillTitle", v), // 新增单条暂估入库单
        getBillCodeTran: v => fetch.post("/v1/biz/bovms/stock/common/getBillCodeTran", v), // 获取流水号/单据编号
        deleteAllBillAndPz: v => fetch.post("/v1/biz/bovms/stock/bill/title/deleteAllBillAndPz", v), // 删除全部单据和凭证
        deleteAllPz: v => fetch.post("/v1/biz/bovms/stock/bill/title/deleteAllPz", v), // 删除全部单据凭证
        createAllPz: v => fetch.post("/v1/biz/bovms/stock/bill/title/createAllPz", v), // 全部生成单据凭证
    },
    operation: {
        query: option => fetch.post("/v1/biz/bovms/stock/bill/title/findBillTitleNum", option),
        save: list => fetch.post("/v1/edf/operation/save", list),
        delete: list => fetch.post("/v1/biz/bovms/stock/bill/title/deleteBillTitle", list),
        queryone: option => fetch.post("/v1/biz/bovms/stock/bill/title/findBillTitleById", option),
        getServerDate: () => fetch.post("/v1/edf/org/getSystemDate"),
        // querylist: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleList', option),
        querylist: option =>
            fetch.post("/v1/biz/bovms/stock/carrymainsheet/getSalesCostDetails", option),
        deleteBatchBillTitle: option =>
            fetch.post("/v1/biz/bovms/stock/bill/title/deleteBatchBillTitle", option),
        findSupplierList: list =>
            fetch.post("/v1/biz/bovms/stock/bill/title/findSupplierList", list),
        findCustomerList: () => fetch.post("/v1/biz/bovms/stock/bill/title/findCustomerList"),
        getInvSetByPeroid: list => fetch.post("/v1/biz/bovms/stock/common/getInvSetByPeroid", list),
        init: option => fetch.post("/v1/biz/bovms/stock/inveset/init", option),
        get2221CodeList: option => fetch.post("/v1/biz/bovms/common/get2221CodeList", option), // 查询科目编号2221对应的子级科目列表
        get2221CodeIds: option => fetch.post("/v1/biz/bovms/common/get2221CodeIds", option), // 查询科目编号2221对应的科目id列表（吴道攀）
        updateSubjectMatch: option =>
            fetch.post("/v1/biz/bovms/subjectMatch/updateSubjectMatch", option), // 保存匹配科目列表
        getSubjectMatchList: option =>
            fetch.post("/v1/biz/bovms/subjectMatch/getSubjectMatchList", option), // 获取科目设置明细列表
        getDestAcctId: option => fetch.post("/v1/biz/bovms/subjectMatch/getDestAcctId", option), // 通过指定科目获取科目匹配结果
        createPz: option => fetch.post("/v1/biz/bovms/stock/carrymainsheet/createPZ", option), // 生成单据凭证
        deletePz: option => fetch.post("/v1/biz/bovms/stock/bill/title/deletePz", option), // 删除单据凭证
        deleteBillAndPz: option =>
            fetch.post("/v1/biz/bovms/stock/carrymainsheet/deleteSalesCostDetails", option), // 删除单据
        getVoucherRule: option => fetch.post("/v1/biz/bovms/stock/common/getVoucherRule", option),
        updateVoucherRuleByModule: option =>
            fetch.post("/v1/biz/bovms/stock/common/updateVoucherRuleByModule", option),
        import: option =>
            fetch.formPost("/v1/biz/bovms/stock/carrymainsheet/importSalesCostDetails", option), // 导入销售出库
        export: option =>
            fetch.formPost("/v1/biz/bovms/stock/carrymainsheet/downloadTemplate", option), // 导出销售出库
        exportData: option =>
            fetch.formPost("/v1/biz/bovms/stock/carrymainsheet/exportSaleOutdelivery", option), //导出
        templateExport: option =>
            fetch.formPost("/v1/biz/bovms/stock/importAndExport/downloadXsckTemplate", option), //导出
        uploadFile: option =>
            fetch.post("/v1/biz/bovms/stock/importAndExport/uploadXsckFile", option), // 导入数据
        queryXscbInventoryList: option =>
            fetch.post("/v1/biz/bovms/stock/saleCostRateService/queryXscbInventoryList", option), // 查询按销售出库列表数据
        generateXsckBills: option =>
            fetch.post("/v1/biz/bovms/stock/saleCostRateService/generateXsckBills", option), // 保存按销售出库列表数据，即生成出库单
        getBillMergeRule: option =>
            fetch.post("/v1/biz/bovms/stock/saleCostRateService/getBillMergeRule", option), // 查询生成销售出库单据的存货合并规则
        saveBillMergeRule: option =>
            fetch.post("/v1/biz/bovms/stock/saleCostRateService/saveBillMergeRule", option), // 保存生成销售出库单据的存货合并规则
    },
    api: {
        //更新单个模块凭证习惯设置规则
        updateVoucherRuleByModule: option =>
            fetch.post("/v1/biz/bovms/stock/common/updateVoucherRuleByModule", option),
        //查询单个模块凭证习惯设置规则
        getVoucherRule: option => fetch.post("/v1/biz/bovms/stock/common/getVoucherRule", option),
    },
}
