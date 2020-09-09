/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    person: {
        getInvoiceList: (option) => fetch.post('/v1/biz/invoice/getInvoiceList', option), // 获取发票列表
        /*  downloadPdf4Rz: (option) => fetch.post('/v1/biz/invoice/downloadPdf4Rz', option), // 下载发票税局平台下载到本地数据库*/
        checkDownLoadDatFile: (option) => fetch.post('/v1/biz/invoice/checkDownLoadDatFile', option), // 导出认证数据之前的校验
        export: (option) => fetch.formPost('/v1/biz/invoice/downLoadDatFile', option), //导出认证数据
        refreshResult: (option) => fetch.post('/v1/biz/invoice/refreshResult', option), // 刷新认证结果
        send: (option) => fetch.post('/v1/biz/invoice/send', option), // 发送认证
        deleteBatch: (option) => fetch.post('/v1/biz/invoice/jxfp/deleteJxfp', option), // 删除
        downInvoice: (option) => fetch.post('/v1/biz/invoice/fpxxCollection', option), // 下载发票
        batchQueryZzsNsqxdm: (option) => fetch.post('v1/biz/invoice/batchQueryZzsNsqxdm', option), // 获取纳税期限代码
    }
}