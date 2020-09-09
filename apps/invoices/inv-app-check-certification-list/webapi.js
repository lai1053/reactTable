/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    invoices: {
        // 发票勾选列表
        queryGxfpList: (option) => fetch.post('v1/biz/invoice/queryGxfpList', option),
        // queryCheckList: (option) => fetch.post('v1/bovmsscan/queryCheckList', option),
        // 保存勾选信息
        saveFprzZtxx: (option) => fetch.post('v1/biz/invoice/saveFprzZtxx', option),
        // 确认勾选列表
        queryConfFprzList: (option) => fetch.post('v1/biz/invoice/queryConfFprzList', option),
        // 确认勾选
        confimeFpztxx: (option) => fetch.post('v1/biz/invoice/confimeFpztxx', option),
        // 刷新税控盘状态
        refreshSkpzt: (option)=>fetch.post('v1/biz/invoice/refreshSkpzt', option),
        // 下载发票
        fpxxCollection: (option)=>fetch.post('v1/biz/invoice/fpxxCollection', option),  
        // 查询“发票期间代码”
        batchQueryZzsNsqxdm: (option)=>fetch.post('v1/biz/invoice/batchQueryZzsNsqxdm', option),
        // 获取服务器自然月（税款所属期）
        getSbrq: (option)=>fetch.get('v1/biz/invoice/getSbrq')
         
    }
}