/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    dateCard: {
        // queryAccountEnable: (option) => fetch.post('/v1/biz/scm/account/enable/queryAccountEnable', option),
        queryAccountEnable: (option) => fetch.post('/v1/biz/scm/account/enable/queryAccountEnableNew', option),
        queryAccountByNameAutomatic: (option) => fetch.post('/v1/biz/scm/invoice/queryAccountByNameAutomatic', option),
        create: (option) => fetch.post('/v1/biz/scm/account/enable/createAccountEnableNew', option),
        // create: (option) => fetch.post('/v1/biz/scm/account/enable/create', option)
    }
}
