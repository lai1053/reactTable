/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {fetch} from 'edf-utils'

export default {
    assignImport: {
        exportAssignData: (option) => fetch.formPost('/v1/yygl/userCustPlsq/exportkhfp',option),
        import: (path, option) => fetch.post(`${path}`, option),
        getImportAsyncStatus:(option,date) => fetch.post2('/v1/yygl/userCust/getImportAsyncStatusNew',option,date),//客户导入状态
    }
}