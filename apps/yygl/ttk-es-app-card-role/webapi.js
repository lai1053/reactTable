/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    role: {
	    //getCode: () => fetch.post('/v1/ba/basearchive/getAutoCode', { archiveName: 'ba_project' }),
        query: (id) => fetch.post('/v1/yygl/roleManager/findById', { id }),//查询岗位
        create: (option) => fetch.post('/v1/yygl/roleManager/addRole', option),//新增岗位
        update: (option) => fetch.post('/v1/yygl/roleManager/updateRole', option),//更新岗位
        roleAttr: () => fetch.post('/v1/edf/enumDetail/findByEnumId', {enumId: 200028})//岗位类型,枚举表中增加岗位类型。
    }
}