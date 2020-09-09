/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    person: {
        queryData: () => fetch.post('/v1/ba/person/findEnumList', {}),
        query: (id) => fetch.post('/v1/ba/person/query', { id }),
        create: (option) => fetch.post('/v1/dataapi/jcdz/updateOrgInfo', option),
        update: (option) => fetch.post('/v1/ba/person/update', option),
        queryList: (option) => fetch.post('/v1/ba/person/queryList', option),
        load: (option) => fetch.post('/v1/yygl/department/initCusByToken', option),
        account: (option) => fetch.post('/v1/gl/account/query', {isEnable: true, isEndNode: true }),
        getxx: (option) => fetch.post('/v1/yygl/esorg/findEsOrgById', {isEnable: true, isEndNode: true }),
        checkOrgName: (option) => fetch.post('/v1/dataapi/jcdz/checkOrgInfo', option),
    },
}
