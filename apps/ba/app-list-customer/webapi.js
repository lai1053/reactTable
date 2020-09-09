/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    customer: {
        query: (option) => fetch.post('v1/ba/customer/queryList', option),
        delete: (option) => fetch.post('v1/ba/customer/delete', option),
        update: (option) => fetch.post('/v1/ba/customer/update', option),
        cats: (option) => fetch.post('/v1/ba/archCat/queryAll', option),
    },
    getSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
    setSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),
}
