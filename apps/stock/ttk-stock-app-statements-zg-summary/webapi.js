/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"
// import { isStatus200 } from '../commonAssets/js/common'

export default {
    init: option => fetch.post("/v1/biz/bovms/stock/inveset/init", option),
    getInvSetByPeroid: option => fetch.post("/v1/biz/bovms/stock/common/getInvSetByPeroid", option),
    queryAllInvType: option => fetch.post("/v1/edf/invType/queryAll", option),
    query: option => fetch.post("/v1/biz/bovms/stock/report/zgsummary/query", option),
    export: option => fetch.formPost("/v1/biz/bovms/stock/report/zgsummary/export", option),
    print: option => fetch.printPost("/v1/biz/bovms/stock/report/zgsummary/print", option),
}
