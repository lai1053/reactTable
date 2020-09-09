/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    ztlj: {
        queryList: (option) => fetch.post('/v1/yygl/accountconnect/queryPageList', option),//查询客户列表
        delete: (option) => fetch.post('/v1/yygl/accountconnect/deleteOne', option),//断开连接
        getfpkh: (option) => fetch.post('/v1/yygl/person/getDepartMentList',option),
        reportSetFlagAsync:(option) => fetch.post('/v1/yygl/accountconnect/getCompleteStateOfReportSetFlagAsync',option),//报表未设置异步调用
        reportSetFlagResp:(option,data) => fetch.post2('/v1/yygl/accountconnect/getCompleteStateOfReportSetFlagResp',option,data),//报表未设置结果获取
    }
}