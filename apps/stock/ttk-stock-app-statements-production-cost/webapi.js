/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    stock: {
        getInvSetByPeroid: options =>
            fetch.post("/v1/biz/bovms/stock/common/getInvSetByPeroid", options), // 获取存货设置信息和结转信息
        queryList: options => fetch.post("/v1/biz/bovms/stock/report/cost/query", options), // 获取收发存汇总表
        export: options => fetch.formPost("/v1/biz/bovms/stock/report/cost/export", options), // 导出收发存汇总表
        print: options => fetch.printPost("/v1/biz/bovms/stock/report/cost/print", options), // 导出收发存汇总表
        // getInventoryTypesFromArchives:(v)=>fetch.post('/v1/biz/bovms/stock/common/getInventoryTypesFromArchives',v), //存货类型列表
    },
}
