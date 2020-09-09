/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    tax: {
        findEnumList: (option) => fetch.post('/v1/edf/enumDetail/batchQuery', option),
        query: (option) => fetch.post('/v1/edf/sfzxx/query', option),
        create: (option) => fetch.post('/v1/edf/sfzxx/create', option),
        update: (option) => fetch.post('/v1/edf/sfzxx/update', option),
        queryReportSettingCode: (option) => fetch.post('/v1/edf/org/queryReportSettingCode', option),//
        kjzzQueryKjzz: (option) => fetch.post('/v1/tax/sb/kjzz/queryKjzz', option),//
    },
}
