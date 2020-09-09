/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    stock: {
        queryList: options => fetch.post("/v1/biz/bovms/stock/report/outsummary/query", options), // 获取出库汇总表
        export: options => fetch.formPost("/v1/biz/bovms/stock/report/outsummary/export", options), // 导出出库汇总表
        print: options => fetch.printPost("/v1/biz/bovms/stock/report/outsummary/print", options), // 打印出库汇总表
        getInventoryTypesFromArchives: v =>
            fetch.post("/v1/biz/bovms/stock/common/getInventoryTypesFromArchives", v), // 存货类型列表
        getServiceTypeList: v => fetch.post("/v1/biz/bovms/stock/report/outsummary/getType", v), // 业务类型列表
        queryAll: v => fetch.post("/v1/edf/invType/queryAll", v), // 查询全部存货类型
    },
}
