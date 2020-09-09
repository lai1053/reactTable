/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch, fetchCors } from 'edf-utils'

export default {
    mySetting: {
        init: (userId) => fetch.post('/v1/edf/mySetting/init', userId)
    },
    user: {
        update: (option) => fetch.post('/v1/edf/user/update', option),
        userInfo: (option) => fetch.post('/v1/section/section4/UserInfo', option),
        init: (option) => fetch.post('/v1/edf/mySetting/init', option),//查询基本信息
        updateDz: (option) => fetch.post('/v1/edf/user/updateDz', option),//保存基本信息
        queryOrgListForDz: (option) => fetch.post('/v1/edf/sysOrg/queryOrgListDz', option),//查询我的中介
        updateCurrentOrg: (option) => fetch.post('/v1/edf/org/updateCurrentOrg', option),//更改默认值
        common: (url, params, options) => fetchCors.post(url, params, options),//跨域通用 自定义url
        modifyPassword: (option) => fetch.post('/v1/edf/user/modifyPassword', option),
        getRoleList: (option) => fetch.post('/v1/dataapi/jcdz/getRoleList', option),//
        getDepartMentList: (option) => fetch.post('/v1/dataapi/jcdz/getDepartMentList', option),//
        queryList: (option) => fetch.post('/v1/edf/sysLog/queryList', option),//
        getUserDetail: (option) => fetch.post('/v1/yygl/person/getUserDetail', option),//
        load1: {

        },
        load2: {

        }
    }
}