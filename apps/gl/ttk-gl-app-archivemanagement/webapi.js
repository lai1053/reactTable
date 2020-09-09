/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */
import { fetch } from 'edf-utils'
export default {
    archivemanagement: {
        /**
         * 初始化归档
         */
        init: () => fetch.post('/v1/gl/placeFile/queryState', {}),        
        /**
         * 查询列表
         */
        query: (option) => fetch.post('/v1/gl/placeFile/query', option),       
        /**
         * 归档
         */
        fileArchive: (option) => fetch.post('/v1/gl/placeFile/uploadFile', option),
        /**
         * 查看归档状态
         */
        isFinishArchiveState: (option) => fetch.post('/v1/gl/placeFile/uploadFileState', option), 
        /**
        * 下载pdf
        */
        downLoadPdf: (option) => fetch.formPost('/v1/gl/placeFile/print', option),
        /**
        * 下载excel
        */
        downLoadExcel: (option) => fetch.formPost('/v1/gl/placeFile/export', option),
        /**
         * 批量下载pdf
         */
        downLoadPdfBatch: (option) => fetch.formPost('/v1/gl/placeFile/print_batch', option),
        /**
         * 预览pdf
         */
        generatePDF: (option) => fetch.printPost('/v1/gl/placeFile/print', option),
        /**
         * 批量下载excel
         */
        downLoadExcelBatch: (option) => fetch.formPost('/v1/gl/placeFile/export_batch',option),

        /**
        * 获取凭证录入所属的最大期间
        */
        getDocMaxDate: () => fetch.post('/v1/gl/placeFile/maxDate', {}),

    }
}