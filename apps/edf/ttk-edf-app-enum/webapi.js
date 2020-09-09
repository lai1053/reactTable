/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    enum: {
        query: (option) => fetch.post('/v1/edf/enum/query', option),
        del: (option)  => fetch.post('/v1/edf/enum/delete', option)
    },
    enumDetail: {
        init: () => fetch.post('/v1/edf/enum/queryAll'),
        delDetail: (option)  => fetch.post('/v1/edf/enumDetail/batchDelete', option),
        column: (option)  => fetch.post('/v1/edf/enumDetail/queryPageList', option)
    },
    columnDetail: {
        findByColumnCode: (code) => fetch.post('/v1/edf/columnDetail/findByColumnCode', code)
    }
}