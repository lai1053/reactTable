/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    operation: {
        query: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleNum', option),
        findBillTitleList: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleList', option),
        save: (list) => fetch.post('/v1/edf/operation/save', list),
        delete: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/deleteBillTitle', list),
        queryone: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleById', option),
        getServerDate: () => fetch.post('/v1/edf/org/getSystemDate'),
        deleteBatchBillTitle: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/deleteBatchBillTitle', option),
        findSupplierList: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/findSupplierList', list),
        init: (option) => fetch.post('/v1/biz/bovms/stock/inveset/init', option),
        getInvSetByPeroid: (list) => fetch.post('/v1/biz/bovms/stock/common/getInvSetByPeroid', list),
        getInventoryGoods: (v) => fetch.post('/v1/biz/bovms/stock/common/getInventoryGoods', v), // 获取存货列表   
        // createBillTitlePZ: (v) => fetch.post('v1/biz/bovms/stock/bill/title/createBillTitlePZ', v), // 生成凭证   
        createBillTitlePZ: (v) => fetch.post('v1/biz/bovms/stock/bill/title/createNewBillTitlePZ ', v), // 生成凭证   
        deleteBillTitlePZ: (v) => fetch.post('v1/biz/bovms/stock/bill/title/deleteBillTitlePZ', v), // 获取存货列表   
        queryAcctCodeByModule: (option) => fetch.post('/v1/biz/bovms/stock/bill/acctcode/queryAcctCodeByModule', option),
        saveOrUpdateAcctCode: (option) => fetch.post('/v1/biz/bovms/stock/bill/acctcode/saveOrUpdateAcctCode', option),
        getStockAcctCode: (option) => fetch.post('/v1/biz/bovms/common/getStockAcctCode', option),
        getStockAcctParentCodeId: (option) => fetch.post('/v1/biz/bovms/common/getStockAcctParentCodeId', option),
        //根据科目id，获取科目信息
        getAccountById: option => fetch.post("/v1/gl/account/getById", option),
        // 获取全部辅助核算项目列表
        allArchive: (option, title) => fetch.post("v1/ba/basearchive/queryBaseArchives", option),
        // 获取指定类型辅助核算项目列表
        fixedArchive: (option, title) => fetch.post(`v1/ba/${title}/queryList`, option),
        // 获取自定义辅助核算项目列表
        userDefineItem: option => fetch.post("/v1/ba/userdefinearchive/queryListDataByCalcName", option),
        templateExport: (option) => fetch.formPost('/v1/biz/bovms/stock/importAndExport/downloadZanguTemplate', option), //导出 
        uploadFile: (option) => fetch.post('/v1/biz/bovms/stock/importAndExport/uploadZanguFile', option), // 导入数据
        templateBackWashExport: (option) => fetch.formPost('/v1/biz/bovms/stock/importAndExport/downloadBackWashTemplate', option), //冲回导出 
        uploadBackWashFile: (option) => fetch.post('/v1/biz/bovms/stock/importAndExport/uploadBackWashFile', option), // 冲回导入数据
        export: (option) => fetch.formPost('/v1/biz/bovms/stock/bill/title/' + option.path, option), // 导出
        zgSummary: (option) => fetch.post('/v1/biz/bovms/stock/report/zgsummary/query', option),  // 查询暂估汇总表数据
   
         /*
        *@params: {  "module": "purchase" }  
            —模块名：
                purchase(采购入库)、
                sale(销售收入)、
                zangu(暂估入库)、
                other(其他出入库)、
                main(销售出库)、
                production(生产领料)、
                pick(暂估冲回)
        *
        *@return  {
        *    "orgId": 239636371313920,
        *    "module": "sale",   -— 代表模块
        *    "stockRule": {
        *        "merge": "0"    —— 1代表选中单据合并成一张,0代表一张单据一张凭证
        *    }
        */
       getVoucherRule: (option) => fetch.post('/v1/biz/bovms/stock/common/getVoucherRule', option),  // 10.查询单个模块凭证习惯设置规则（吴道攀） 
        
       /*
       *{
       *   "orgId": 7027074432530432,              -- 账套Id
       *   "module": "purchase",                   -- 模块名
       *   "stockRule": {     -- 单据合并生成凭证规则
       *      "merge": "1"  -- 1代表选中单据合并成一张,0代表一张单据一张凭证
       *   }
       * }
       * 
       * @return
       * ---success : null
       * ---fail: {
       *     "code": "",
       *     "message": "更新凭证习惯设置规则失败。" -- 接口失败提示信息
       *   }
       */
      updateVoucherRuleByModule: (option) => fetch.post('/v1/biz/bovms/stock/common/updateVoucherRuleByModule', option),  // 09.更新单个模块凭证习惯设置规则（吴道攀）

    }
}