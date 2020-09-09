/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    column: {
        query: () => fetch.post('/v1/edf/columnPreset/queryConvert'),
        del: (option)  => fetch.post('/v1/edf/columnPreset/deleteBatch', option)
    },
    columnDetail: {
        init: (option) => fetch.post('/v1/edf/columnDetailPreset/queryPageList', option),
        delDetail: (option)  => fetch.post('/v1/edf/columnDetailPreset/deleteBatch', option),
        findByColumnCode: (code) => fetch.post('/v1/edf/columnDetail/findByColumnCode', code)
    }
}