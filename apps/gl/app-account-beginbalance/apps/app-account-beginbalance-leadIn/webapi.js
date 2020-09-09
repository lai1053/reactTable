/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    /*
    person: {
        query: (option) => fetch.post('/v1/person/query', option)
    }*/
    exportTemplate: () => fetch.formPost('/v1/gl/accountPeriodBegin/exportTemplate'), // 下载模板
    exportFile: (option) => fetch.post('/v1/gl/accountPeriodBegin/import', option), //导入
    downLoadFile: (option) => fetch.formPost('/v1/edf/file/download', option), // 下载文件
    haveAccountPeriodBegin: (option) => fetch.post('v1/gl/accountPeriodBegin/haveAccountPeriodBegin', {}),
}