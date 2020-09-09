/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    personaltax: {
        findByEnumId: (option) => fetch.post('/v1/edf/enumDetail/findByEnumId', option), //登录方式下拉
        //querylist: (id) => fetch.post('/v1/dataapi/jcdz/customerList',{id}),//查询个税密码
        //update: (option) => fetch.post('/v1/dataapi/jcdz/updatePersonsTaxPassword', option),//更新个税密码

        querylist: (orgIdList) => fetch.post('/v1/edf/dlxx/dlxxGsCustomerList',{orgIdList}),//查询个税密码
        update: (option) => fetch.post('/v1/edf/dlxx/updateDlxxGsPassword', option),//更新个税密码
    }
}