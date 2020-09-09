/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    beginImport: {
        // import: (option) => fetch.post('/v1/gl/docManage/importDocFromExcel', option),
        importDocFromExcelAsync: (option) => fetch.post('/v1/gl/docManage/importDocFromExcelAsync', option),
        getImportDocFromExcelStatus: (option) => fetch.post('/v1/gl/docManage/getImportDocFromExcelStatus', option),
        
        downloadTemplate: (option) => fetch.formPost('/v1/gl/docManage/exportTemplate', option),
    }
}