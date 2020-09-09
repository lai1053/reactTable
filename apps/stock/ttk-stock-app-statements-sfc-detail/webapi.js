/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    getInventoryTypesFromArchives: option =>
        fetch.post("/v1/biz/bovms/stock/common/getInventoryTypesFromArchives", option),
    query: option => fetch.post("/v1/biz/bovms/stock/report/detail/query", option),
    init: option => fetch.post("/v1/biz/bovms/stock/inveset/init", option),
    export: option => fetch.formPost("/v1/biz/bovms/stock/report/detail/export", option),
    print: option => fetch.printPost("/v1/biz/bovms/stock/report/detail/print", option),
    queryAll: option => fetch.post("/v1/edf/invType/queryAll", option),
    queryList: option => fetch.post("v1/edf/inventory/queryList", option),
    initPeriod: option => fetch.post("/v1/biz/bovms/stock/inveset/initPeriod", option),
    initdata: option => fetch.post("/v1/biz/bovms/stock/inveset/init", option),
    getInvSetByPeroid: list => fetch.post("/v1/biz/bovms/stock/common/getInvSetByPeroid", list),
    getWipCompleteBillList: options =>
        fetch.post("/v1/biz/bovms/stock/wipcomplete/getWipCompleteBillList", options),
    api: {
        //查询其他出入库列表
        findOtherBillTitleList: option =>
            fetch.post("v1/biz/bovms/stock/bill/otherBilltitle/findOtherBillTitleList", option),
        getInvSetByPeroid: option =>
            fetch.post("/v1/biz/bovms/stock/common/getInvSetByPeroid", option),
        getOtherBillServiceType: option =>
            fetch.post("/v1/biz/bovms/stock/bill/otherBilltitle/getOtherBillServiceType", option),
        //删除其他出入库单据(单个和批量同一个接口)
        deleteOtherBillTitle: option =>
            fetch.post(" /v1/biz/bovms/stock/bill/otherBilltitle/deleteOtherBillTitle", option),
        //其他出入库业务类型设置
        queryOtherBillServiceType: option =>
            fetch.post("/v1/biz/bovms/stock/bill/otherBilltitle/queryOtherBillServiceType", option),
        //根据条件查询存货其他出入库科目范围下的末级科目
        getStockOtherBillAccountCode: option =>
            fetch.post("/v1/biz/bovms/common/getStockOtherBillAccountCode", option),
        //存货单个科目新增时查询对应父级科目列表id
        getStockOtherParentCodeId: option =>
            fetch.post("/v1/biz/bovms/common/getStockOtherParentCodeId", option),
        //删除自定义业务类型
        deleteOtherServiceType: option =>
            fetch.post("/v1/biz/bovms/stock/bill/otherBilltitle/deleteOtherServiceType", option),
        //获取对应业务类型的科目信息
        getOtherServiceTypeAcctCode: option =>
            fetch.post(
                "/v1/biz/bovms/stock/bill/otherBilltitle/getOtherServiceTypeAcctCode",
                option
            ),
        //其他出入库业务类型状态设置(禁止或开启)
        disableOtherServiceTypeState: option =>
            fetch.post(
                "/v1/biz/bovms/stock/bill/otherBilltitle/disableOtherServiceTypeState",
                option
            ),
        //保存或更新其他出入库业务类型数据
        saveOtherServiceType: option =>
            fetch.post("/v1/biz/bovms/stock/bill/otherBilltitle/saveOtherServiceType", option),
        //获取单据code的接口
        getOtherBillTitleCode: option =>
            fetch.post("/v1/biz/bovms/stock/bill/otherBilltitle/getOtherBillTitleCode", option),
        //更新单个模块凭证习惯设置规则
        updateVoucherRuleByModule: option =>
            fetch.post("/v1/biz/bovms/stock/common/updateVoucherRuleByModule", option),
        //查询单个模块凭证习惯设置规则
        getVoucherRule: option => fetch.post("/v1/biz/bovms/stock/common/getVoucherRule", option),
        //获取其他出入库所有的业务类型
        getOtherBillServiceType: option =>
            fetch.post("/v1/biz/bovms/stock/bill/otherBilltitle/getOtherBillServiceType", option),
        //获取服务器时间
        getServerDate: () => fetch.post("/v1/edf/org/getSystemDate"),
        //保存或更新其他出入库单据
        saveOrUpdateOtherBillTitle: option =>
            fetch.post(
                "/v1/biz/bovms/stock/bill/otherBilltitle/saveOrUpdateOtherBillTitle",
                option
            ),
        //获取存货列表
        findInventoryList: option =>
            fetch.post("/v1/biz/bovms/stock/bill/title/findInventoryList", option),
        //保存或更新其他出入库单据
        //生成凭证
        generateOtherBillVoucher: option =>
            fetch.post("/v1/biz/bovms/stock/bill/otherBilltitle/generateOtherBillVoucher", option),
        //删除凭证
        deletePz: option =>
            fetch.post("/v1/biz/bovms/stock/bill/otherBilltitle/deleteOtherVoucher", option),
        //查看单据
        queryOtherBillById: option =>
            fetch.post("/v1/biz/bovms/stock/bill/otherBilltitle/queryOtherBillById", option),
        // 获取指定类型辅助核算项目列表
        fixedArchive: (option, title) => fetch.post(`v1/ba/${title}/queryList`, option),
        // 获取自定义辅助核算项目列表
        userDefineItem: option =>
            fetch.post("/v1/ba/userdefinearchive/queryListDataByCalcName", option),
        // 获取全部辅助核算项目列表
        allArchive: (option, title) => fetch.post("v1/ba/basearchive/queryBaseArchives", option),
        //根据科目id，获取科目信息
        getAccountById: option => fetch.post("/v1/gl/account/getById", option),
        //查询成本单价和实时库存点
        getRealTimeInventoryAndUnitCost: option =>
            fetch.post("/v1/biz/bovms/stock/common/getRealTimeInventoryAndUnitCost", option),
    },
}
