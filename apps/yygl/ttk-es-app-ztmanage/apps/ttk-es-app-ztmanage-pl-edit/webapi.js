/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, fetchCors, tree} from 'edf-utils'

export default {
    edit:{
        batchQuery: (option) => fetch.post('/v1/edf/enumDetail/batchQuery', option),
        editXX:(option) => fetch.post('/v1/yygl/cusAccountManager/ztplgx',option),
    }
}
