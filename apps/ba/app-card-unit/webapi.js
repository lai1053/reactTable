/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    unit: {
	    getCode: () => fetch.post('/v1/ba/basearchive/getAutoCode', { archiveName: 'ba_unit' }),
        query: (id) => fetch.post('/v1/ba/unit/query', {id}),
        //findById: (id) => fetch.post('/v1/unit/findById', { id }),
        create: (option) => fetch.post('/v1/ba/unit/create', option),
        update: (option) => fetch.post('/v1/ba/unit/update', option)
    }
}