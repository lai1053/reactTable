/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    dept: {
        query: () => fetch.post('v1/ba/department/queryList'),//部门查询
        isCreater: (option) => fetch.post('v1/edf/sysOrgUser/getIsOrgCreator', option),
    },
    person: {
        query: (id) => fetch.post('/v1/ba/person/query', {id}),//查询用户
        queryList: (option) => fetch.post('/v1/yygl/home/queryListByUserPage', option),//查询用户列表v1/ba/person/queryList
        delete: (option) => fetch.post('v1/ba/person/delete', option),//删除用户
        update: (option) => fetch.post('/v1/ba/person/update', option),//更新用户(是否与停用用户共用一个方法)
        setBelongOrg:(option) => fetch.post('/v1/ba/person/setBelongOrg', option),//部门移动
        getGGxx: (option) => fetch.post('/v1/yygl/home/queryListByUser',option),
        getGGrd: (option) => fetch.post('/v1/yygl/home/userRead',option),
    },
    role: {
        query: (option) => fetch.post('/v1/edf/role/query', option)//角色岗位查询
    },
}