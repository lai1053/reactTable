/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    queryList: (option) => fetch.post('v1/edf/inventory/queryList', option),
    delete: (option) => fetch.post('v1/edf/inventory/delete', option),
    update: (option) => fetch.post('/v1/edf/inventory/update', option),
    findEnumList: (option) => fetch.post('/v1/edf/inventory/findEnumList', option),
    queryAll: (option) => fetch.post('/v1/edf/invType/queryAll', option),
    export: (option) => fetch.formPost('/v1/edf/inventory/export', option)
}
