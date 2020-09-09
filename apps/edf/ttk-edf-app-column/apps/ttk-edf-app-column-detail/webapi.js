/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    columnDetail: {
        create: (option) => fetch.post('/v1/edf/columnDetailPreset/create', option),
        update: (option) => fetch.post('/v1/edf/columnDetailPreset/update', option)
    },
    enum: {
        enumDetail: (enumId) => fetch.post('/v1/edf/enumDetail/batchQuery', enumId)
    }
}