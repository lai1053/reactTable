/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    customer: {
        queryList: (option) => fetch.post('/v1/ba/customer/queryList', option)
    },
    department: {
        queryList: (option) => fetch.post('/v1/ba/department/queryList', option)
    },
    person: {
        queryList: (option) => fetch.post('/v1/ba/person/queryList', option)
    },
    inventory: {
        queryList: (option) => fetch.post('/v1/ba/inventory/queryList', option)
    },
    supplier: {
        queryList: (option) => fetch.post('/v1/ba/supplier/queryList', option)
    },
    project: {
        queryList: (option) => fetch.post('/v1/ba/project/queryList', option)
    },
    currency: {
        queryList: (option) =>  fetch.post('/v1/ba/currency/queryList', option),
    },
    isExCalc:{
        queryList: (option) =>  fetch.post('/v1/ba/userdefinearchive/queryListDataByCalcName', option)
    }
}
