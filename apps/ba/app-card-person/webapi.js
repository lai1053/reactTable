/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    person: {
        queryData: () => fetch.post('/v1/ba/person/findEnumList', {}),
        query: (id) => fetch.post('/v1/ba/person/query', { id }),
        create: (option) => fetch.post('/v1/ba/person/create', option),
        update: (option) => fetch.post('/v1/ba/person/update', option),
        queryList: (option) => fetch.post('/v1/ba/person/queryList', option),
	    account: (option) => fetch.post('/v1/gl/account/query', {isEnable: true, isEndNode: true }),
    },
    role: {
        query: (option) => fetch.post('/v1/edf/role/query', option)
    },
    dept: {
        query: (id) => fetch.post('/v1/ba/role/query', { id })
    },
    user: {
        existsMobile: (num) => fetch.post('v1/ba/person/existsMobileInOrg', {mobile:num})
    }
}
