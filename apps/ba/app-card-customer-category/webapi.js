/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    cat:{
        query: (option) => fetch.post('/v1/ba/archCat/queryAll',option),
        delete: (option) => fetch.post('/v1/ba/archCat/delete', option),
        isUsed: (option) => fetch.post('/v1/ba/archCat/isUsed', option),
    },

   
}
