/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    matchInventory: {
        queryByCode: (option) => fetch.post('/v1/biz/core/docGenerateHabit/queryByCode', option),
        save: (option) => fetch.post('/v1/biz/scm/invoice/saveRelationOrder', option),
        inventory: (option) => fetch.post('/v1/ba/inventory/queryList', {}), //存货名称
        queryInventory: (option) => fetch.post('/v1/biz/scm/pu/arrival/queryInventory', option),
    }
}