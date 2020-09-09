/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, tree} from 'edf-utils'

export default {
    financeinit: {
        init: (option) => {},
        used: (option) =>  fetch.post('/v1/gl/account/isUsedInCertificate', option),//当前科目是否已使用
        findSubject: (option) =>  fetch.post('/v1/gl/account/getById', option),//当前科目
        queryBaseArchives: (option) => fetch.post('/v1/ba/basearchive/queryBaseArchives', option)
    }

}
