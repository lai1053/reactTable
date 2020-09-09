/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    operation: { 
        init: (option) => fetch.post('/v1/biz/bovms/stock/inveset/init', option),
        queryAccount: (option) => fetch.post('/v1/biz/bovms/common/queryAccount', option), //获取客户的账套信息（吴道攀）
        queryBuBusinessType: (option) => fetch.post('/v1/gl/periodEndDoc/queryBuBusinessType', option), // 结转制造费用查询
        getInvSetByPeroid: (option) => fetch.post('/v1/biz/bovms/stock/common/getInvSetByPeroid', option), // 获取存货设置信息和结转信息
        judgeHasInventoryAccountNull: (option) => fetch.post('/v1/edf/inventory/judgeHasInventoryAccountNull ', option), //获取客户的账套信息（吴道攀）
        // query: (option) => fetch.post('/v1/edf/operation/query', option),
        // save: (list) => fetch.post('/v1/edf/operation/save', list),
        // getServerDate: () => fetch.post('/v1/edf/org/getSystemDate'),
        // periodDate: (option) => fetch.post('/v1/edf/perioddate/update', option),
    }
}