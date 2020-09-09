/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    role: {
        query: (option) => fetch.post('/v1/yygl/roleManager/findAllByAgencyId', option),//岗位列表
        delete: (option) => fetch.post('/v1/yygl/roleManager/delRoleById', option),//删除岗位
        update: (option) => fetch.post('/v1/yygl/roleManager/updateRole', option),//编辑岗位(停用岗位)
    }
}