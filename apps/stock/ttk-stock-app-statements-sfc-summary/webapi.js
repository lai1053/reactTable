/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    stock: {
        query: options => fetch.post("/v1/biz/bovms/stock/report/collect/query", options), // 获取收发存汇总表
        export: options => fetch.formPost("/v1/biz/bovms/stock/report/collect/export", options), // 导出收发存汇总表
        print: options => fetch.printPost("/v1/biz/bovms/stock/report/collect/print", options), // 打印收发存汇总表
        getInventoryTypesFromArchives: v =>
            fetch.post("/v1/biz/bovms/stock/common/getInventoryTypesFromArchives", v), //存货类型列表
    },
}
