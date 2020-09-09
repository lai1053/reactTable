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

    invoices: {
        // 进项————导出批量
        exportJxfpInSummary: (option) => fetch.formPost('/v1/biz/invoice/jxfp/exportJxfpInSummary', option),
        // 进项————导出明细
        exportJxfpInDetail: (option) => fetch.formPost('/v1/biz/invoice/jxfp/exportJxfpInDetail', option),
        // 销项 ——
        exportXxfpInSummary: (option) => fetch.formPost('/v1/biz/invoice/xxfp/exportXxfpInSummary', option),
        // 销项
        exportXxfpInDetail: (option) => fetch.formPost('/v1/biz/invoice/xxfp/exportXxfpInDetail', option),
        queryAccountingSetupRule: option =>
            fetch.post("/v1/biz/bovms/accountingSetup/queryAccountingSetupRule", option),
        //保存核算精度与自动匹配设置信息
        saveAccountingSetupRule: option =>
            fetch.post("/v1/biz/bovms/accountingSetup/saveAccountingSetupRule", option),
            
        //查询除了【部门人员】、【存货档案】、【项目】、【计量单位】、【账户】、【币种】外的铺助类别
        queryArchiveCategory: option =>
            fetch.post("/v1/biz/bovms/common/queryArchiveCategory", option),
        //获取账套对应的存货类型信息
        queryInventoryType: option =>
            fetch.post("/v1/biz/bovms/common/queryInventoryType", option),
        //查询销项和进项往来科目范围(一级科目)
        queryContactAccountCodeList: option =>
            fetch.post("/v1/biz/bovms/common/queryContactAccountCodeList", option),
        //查询销项贷方或者进项借方科目范围(一级科目)
        queryStockAccountCodeList: option =>
            fetch.post("/v1/biz/bovms/common/queryStockAccountCodeList", option),
    }
}