/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    // query: (option) => fetch.post('/v1/biz/bovms/stock/report/detail/query', option),
    query: option => fetch.post("/v1/biz/bovms/stock/report/zgdetail/query", option),
    init: option => fetch.post("/v1/biz/bovms/stock/inveset/init", option),
    export: option => fetch.formPost("/v1/biz/bovms/stock/report/zgdetail/export", option),
    print: option => fetch.printPost("/v1/biz/bovms/stock/report/zgdetail/print", option),
    queryAll: option => fetch.post("/v1/edf/invType/queryAll", option),
    queryList: option => fetch.post("v1/edf/inventory/queryList", option),
    getInvSetByPeroid: list => fetch.post("/v1/biz/bovms/stock/common/getInvSetByPeroid", list),
}
