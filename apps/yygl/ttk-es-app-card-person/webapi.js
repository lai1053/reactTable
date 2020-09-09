/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    person: { 
        getRoleList: (option) => fetch.post('v1/yygl/person/getRoleList', option),//获取列表
        addPerson: (option) => fetch.post('/v1/yygl/person/addPerson', option),//新增
        updataPerson: (option) => fetch.post('/v1/yygl/person/updataPerson', option),//新增 
        getUserDetail: (option) => fetch.post('/v1/yygl/person/getUserDetail', option),//获取
        queryMobile: (option) => fetch.post('/v1/yygl/person/queryMobile', option),//手机号
    },
    
}
