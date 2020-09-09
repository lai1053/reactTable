/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    stock: {
        query: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleNum', option),
        save: (list) => fetch.post('/v1/edf/operation/save', list),
        delete: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/deleteBillTitle', list),
        queryone: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleById',option),
        getServerDate: () => fetch.post('/v1/edf/org/getSystemDate'),
        findBillTitleList: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleList', option),
        findSupplierList: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/findSupplierList', list),
        portal: () => {
            return fetch.post('/v1/edf/portal/initPortal').then(r => {
                r.menu.forEach(m => m.key = m.code)
                r.menu = tree.build(r.menu, { id: 0 }).children
                return r
            })
        },
        getInvSetByPeroid: (list) => fetch.post('/v1/biz/bovms/stock/common/getInvSetByPeroid', list),
        init: (option) => fetch.post('/v1/biz/bovms/stock/inveset/init', option),
        deleteBatchBillTitle: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/deleteBatchBillTitle',option),
        getInventoryGoods: (v) => fetch.post('/v1/biz/bovms/stock/common/getInventoryGoods', v), // 获取存货列表   
        // createBillTitlePZ: (v) => fetch.post('v1/biz/bovms/stock/bill/title/createBillTitlePZ', v), // 生成暂估入库单、生产领料单  ZGRK/SCLL
        createBillTitlePZ: (v) => fetch.post('v1/biz/bovms/stock/bill/title/createNewBillTitlePZ', v), // 生成暂估入库单、生产领料单  ZGRK/SCLL
        deleteBillTitlePZ: (v) => fetch.post('v1/biz/bovms/stock/bill/title/deleteBillTitlePZ', v), // 获取存货列表  
        
        getStockAcctCode:(options)=>fetch.post('/v1/biz/bovms/common/getStockAcctCode', options),  // 根据条件查询存货模块科目设置范围下的末级科目
        queryAcctCodeByModule:(options)=>fetch.post('/v1/biz/bovms/stock/bill/acctcode/queryAcctCodeByModule', options),  // 按账套和模块获取科目设置列表信息
        saveOrUpdateAcctCode:(options)=>fetch.post('/v1/biz/bovms/stock/bill/acctcode/saveOrUpdateAcctCode', options),    // 保存或更新科目设置信息
        
        queryBOMllInventoryInfo:(options)=>fetch.post('/v1/biz/bovms/stock/llBOMservice/queryBOMllInventoryInfo', options),    // 保存或更新科目设置信息
        getBOMConfigurationList: (v)=>fetch.post('/v1/biz/bovms/stock/BOMConfiguration/getBOMConfigurationList',v),  // BOM配置清单列表

        createBillTitle: (v) => fetch.post('/v1/biz/bovms/stock/bill/title/createBillTitle', v), // 单条新增  （同结转主营成本）
        getBillCodeTran: (v) => fetch.post('/v1/biz/bovms/stock/common/getBillCodeTran', v), // 获取流水号/单据编号 
        queryDllInventoryInfo: (v) => fetch.post('v1/biz/bovms/stock/llservice/queryDllInventoryInfo', v), // 新增领料、非BOM快速领料，查询待领料存货信息
        findInventoryEnumList: () => fetch.post('/v1/biz/bovms/stock/bill/title/findInventoryEnumList'),  
        export: (option) => fetch.formPost('/v1/biz/bovms/stock/bill/title/exportProducePick', option),

        /*
        *@params: {  "module": "purchase" }  
            —模块名：
                purchase(采购入库)、
                sale(销售收入)、
                zanguRK(暂估入库)、
                other(其他出入库)、
                main(销售出库)、
                picking(生产领料)、
                zanguCH(暂估冲回)
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
       queryPickRange: (option) => fetch.post('/v1/biz/bovms/stock/llservice/queryPickRange', option),  // 查询领料范围
       savePickRange: (option) => fetch.post('/v1/biz/bovms/stock/llservice/savePickRange', option),    // 保存领料范围

    }
}