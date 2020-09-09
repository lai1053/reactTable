/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    list: {
        query: (option) => fetch.post('/v1/biz/scm/st/rdrecord/queryenabletime', option),
        getBussinessType: (option = {all: true}) => fetch.post('/v1/biz/scm/st/rdrecord/inventoryPropertyList', option),
        getList: (option = {}) => fetch.post('/v1/biz/scm/st/rptservice/temporaryEstimation', option),
        getEnableDate: (option = {}) => fetch.post('/v1/biz/scm/st/rdrecord/queryenabletime', option),
        getCode: (option) => fetch.post('/v1/biz/scm/st/rdrecord/getcode', option),
        create: (option) => fetch.post('/v1/biz/scm/st/rdrecord/create', option),
        export: (option) => fetch.formPost('/v1/biz/scm/st/rptservice/exportTemporaryEstimation', option),
        print: (option) => fetch.printPost('/v1/biz/scm/st/rptservice/printTemporaryEstimation', option)
    }
}