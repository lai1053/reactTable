/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    operation: {
        query: option => fetch.post("/v1/edf/operation/query", option),
        save: list => fetch.post("/v1/edf/operation/save", list),
        getServerDate: () => fetch.post("/v1/edf/org/getSystemDate"),
        init: option => fetch.post("/v1/biz/bovms/stock/inveset/init", option),
        periodDate: option => fetch.post("/v1/edf/perioddate/update", option),
        initPeriod: () => fetch.post("/v1/biz/bovms/stock/inveset/initPeriod"),
        getInvSetByPeroid: option =>
            fetch.post("/v1/biz/bovms/stock/common/getInvSetByPeroid", option),
        stockDataMigration: option =>
            fetch.post("/v1/biz/bovms/stock/dataMigration/stockDataMigration", option),
        // 清除迁移状态
        clearDataMigrationState: option =>
            fetch.post("/v1/biz/bovms/stock/dataMigration/clearDataMigrationState", option),
        // 查询账套是否允许迁移状态
        getAllowDataMigrationState: option =>
            fetch.post("/v1/biz/bovms/stock/dataMigration/getAllowDataMigrationState", option),
        // 查询账套信息
        findOrgById: option => fetch.post("v1/edf/org/findById", option),
        //
    },
    createInveSet: option => fetch.post("/v1/biz/bovms/stock/inveset/createInveSet", option), // 更改存货信息
}
