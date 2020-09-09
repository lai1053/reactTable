/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {fetch} from 'edf-utils'

export default {
    customerImport: {
        exporttemplate: (path,option) => fetch.formPost(`${path}`,option),
        import: (path, option) => fetch.post(`${path}`, option),
        getImportAsyncStatus:(option,date) => fetch.post2('/v1/yygl/khzl/getImportAsyncStatus',option,date),//客户导入状态
        getBJCustomer:(option) => fetch.post('/v1/yygl/khzl/hasExportOrg',option)
    }
}