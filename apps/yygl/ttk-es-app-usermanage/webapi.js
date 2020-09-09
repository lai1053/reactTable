/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    dept: {
        department: (option) => fetch.post('v1/yygl/department/findAllDepartmentByAuth', option),//部门树
        delPerson: (option) => fetch.post('v1/yygl/person/delPerson', option),//删除
        stopPerson: (option) => fetch.post('v1/yygl/person/stopPerson', option),//停用
        movePersonDepartment: (option) => fetch.post('v1/yygl/person/movePersonDepartment', option),//部门调转
    },
    person: {
        query: (id) => fetch.post('/v1/yygl/person/getUserDetail', {id}),//查询单个用户
        queryList: (option) => fetch.post('/v1/yygl/person/queryList', option),//查询用户列表
        delete: (option) => fetch.post('/v1/yygl/person/delPerson', option),//删除用户
        stopUser: (option) => fetch.post('/v1/yygl/person/stopPerson', option),//停用用户
        add: (option) => fetch.post('/v1/yygl/person//addPerson', option),//添加用户
        update: (option) => fetch.post('/v1/yygl/person/updataPerson', option),//更新用户(是否与停用用户共用一个方法)
        setBelongOrg:(option) => fetch.post('/v1/ba/person/setBelongOrg', option),//部门移动
    },
    role: {
        query: (option) => fetch.post('/v1/yygl/person/getRoleList', option)//角色岗位查询
    },
}