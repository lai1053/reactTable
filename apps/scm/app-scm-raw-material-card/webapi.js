/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

let prefix = "/v1/biz/scm/st/rdrecord/"

export default {
    queryIngredient: (option) => fetch.post('/v1/ba/bom/queryIngredient', option),
    updateIngredient: (option) => fetch.post('/v1/ba/bom/updateIngredient', option),
    queryBOM: (option) => fetch.post('/v1/ba/bom/query', option),
    queryInventory: (option) => fetch.post('/v1/ba/inventory/queryList', option),
}