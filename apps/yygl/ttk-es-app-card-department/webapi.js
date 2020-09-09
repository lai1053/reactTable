/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {fetch} from 'edf-utils'

export default {
    department: {
        query: (id) => fetch.post('/v1/yygl/department/findById', {id}),
        create: (option) => fetch.post('/v1/yygl/department/addDepartment', option),
        update: (option) => fetch.post('/v1/yygl/department/updateDepartment', option),
        departList:(option)=> fetch.post('/v1/yygl/department/findAllDepartmentByAuth', option),//部门树
        selDepartList:(id)=> fetch.post('/v1/yygl/department/choseParentDepByUpdate', id),//编辑部门选择树
        //deptAttr: () => fetch.post('/v1/edf/enumDetail/findByEnumId', {enumId: 300001})
    }
}