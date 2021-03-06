/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, fetchCors, tree} from 'edf-utils'

export default {
    ztManagePL: {
        oldZT: (option) => fetch.post('/v1/yygl/cusAccountManager/ztpldz', option),//旧版账套调用
        getPldzAsyncStatus: (option,date) => fetch.post2('/v1/yygl/cusAccountManager/getPldzAsyncStatus',option,date)
    }

}
