/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    operation: {
        query: option => fetch.post("/v1/biz/bovms/stock/bill/title/findBillTitleNum", option),
        save: list => fetch.post("/v1/edf/operation/save", list),
        delete: list => fetch.post("/v1/biz/bovms/stock/bill/title/deleteBillTitle", list),
        queryone: option => fetch.post("/v1/biz/bovms/stock/bill/title/findBillTitleById", option),
        getServerDate: () => fetch.post("/v1/edf/org/getSystemDate"),
        querylist: option => fetch.post("/v1/biz/bovms/stock/bill/title/findBillTitleList", option),
        deleteBatchBillTitle: option =>
            fetch.post("/v1/biz/bovms/stock/bill/title/deleteBatchBillTitle", option),
        findSupplierList: list =>
            fetch.post("/v1/biz/bovms/stock/bill/title/findSupplierList", list),
        getInvSetByPeroid: list => fetch.post("/v1/biz/bovms/stock/common/getInvSetByPeroid", list),
        init: option => fetch.post("/v1/biz/bovms/stock/inveset/init", option),
        get2221CodeList: option => fetch.post("/v1/biz/bovms/common/get2221CodeList", option), // 查询科目编号2221对应的子级科目列表
        get2221CodeIds: option => fetch.post("/v1/biz/bovms/common/get2221CodeIds", option), // 查询科目编号2221对应的科目id列表（吴道攀）
        updateSubjectMatch: option =>
            fetch.post("/v1/biz/bovms/subjectMatch/updateSubjectMatch", option), // 保存匹配科目列表
        getSubjectMatchList: option =>
            fetch.post("/v1/biz/bovms/subjectMatch/getSubjectMatchList", option), // 获取科目设置明细列表
        getDestAcctId: option => fetch.post("/v1/biz/bovms/subjectMatch/getDestAcctId", option), // 通过指定科目获取科目匹配结果
        createPz: option => fetch.post("/v1/biz/bovms/stock/bill/title/createPz", option), // 生成单据凭证
        deletePz: option => fetch.post("/v1/biz/bovms/stock/bill/title/deletePz", option), // 删除单据凭证
        deleteBillAndPz: option =>
            fetch.post("/v1/biz/bovms/stock/bill/title/deleteBillAndPz", option), // 删除单据
        export: option =>
            fetch.formPost("/v1/biz/bovms/stock/bill/title/exportPurchaseStock", option), //导出
        templateExport: option =>
            fetch.formPost("/v1/biz/bovms/stock/importAndExport/downloadCgrkTemplate", option), //导出
        uploadFile: option =>
            fetch.post("/v1/biz/bovms/stock/importAndExport/uploadCgrkFile", option), // 导入数据
        queryAccount: option => fetch.post("v1/biz/bovms/common/queryAccount", option),
    },
    api: {
        //更新单个模块凭证习惯设置规则
        updateVoucherRuleByModule: option =>
            fetch.post("/v1/biz/bovms/stock/common/updateVoucherRuleByModule", option),
        //查询单个模块凭证习惯设置规则
        getVoucherRule: option => fetch.post("/v1/biz/bovms/stock/common/getVoucherRule", option),
    },
}
