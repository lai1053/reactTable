/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {

    assignUser:{
        getTableHeader:(option) => fetch.post('/v1/yygl/userCustPlsqNew/findPlsqRoles',option),//查询岗位
        queryDGCustomer:() => fetch.post('/v1/yygl/userCustPlsqNew/findRolePersonsQxGr'),//单个客户查询所有岗位
        queryPLCustomer:() => fetch.post('/v1/yygl/userCustPlsqNew/findRolePersonsQx'),//批量客户查询所有岗位
        queryUserName:(option) => fetch.post('/v1/yygl/userCustPlsqNew/findPersonsByKhid',option),//单个客户回写选择的人员名称
        saveAssignMessage:(option) => fetch.post('/v1/yygl/userCustNew/updateUserCust710',option),//保存信息
    }
}
