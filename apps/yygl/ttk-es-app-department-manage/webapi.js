/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    dept: {
        query: () => fetch.post('/v1/yygl/department/findById'),
        queryList: (option) => fetch.post('/v1/yygl/department/getListForDepartmentByAuth', option),//右侧部门列表
        delete: (option) => fetch.post('/v1/yygl/department/delDepartmentById', option),//删除部门
        departList:(option)=> fetch.post('/v1/yygl/department/findAllDepartmentByAuth', option),//部门树
        //departList:(option)=> fetch.post('/v1/ba/department/queryList'),//原部门列表
        isCreater: (option) => fetch.post('v1/edf/sysOrgUser/getIsOrgCreator', option),
    }
}