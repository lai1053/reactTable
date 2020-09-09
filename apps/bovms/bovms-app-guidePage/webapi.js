/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    bovms: {
        saleChaPiao: option =>
            fetch.post("/v1/biz/bovms/sale/checkSaleTicket", option), // 销项查票接口
        saleRuZhang: option =>
            fetch.post("/v1/biz/bovms/sale/saveSaleTicket", option), // 销项入账接口
        saleColes: option =>
            fetch.post("/v1/biz/bovms/sale/saleTicketSubjectMatch", option), // 销项查票关闭
        saleTake: option =>
            fetch.post("/v1/biz/bovms/sale/takeSaleInvoice", option), // 销项取票
        salebatchUpdate: option =>
            fetch.post("/v1/biz/bovms/sale/batchUpdateInvoice", option), // 销项批量设置保存

        purchaseChaPiao: option =>
            fetch.post("/v1/biz/bovms/purchase/checkPurchaseTicket", option), // 进项查票接口
        purchaseRuZhang: option =>
            fetch.post("/v1/biz/bovms/purchase/savePurchaseTicket", option), // 进项入账接口
        purchaseColes: option =>
            fetch.post(
                "/v1/biz/bovms/purchase/purchaseTicketSubjectMatch",
                option
            ), // 进项查票关闭
        purchaseTake: option =>
            fetch.post("/v1/biz/bovms/purchase/takePurchaseInvoice", option), // 进项取票接口
        purchaseTakeSave: option =>
            fetch.post("/v1/biz/bovms/purchase/savePurchaseInvoice", option), // 进项取票保存入库
        purchasebatchUpdate: option =>
            fetch.post(
                "/v1/biz/bovms/purchase/batchUpdatePurchaseInvoice",
                option
            ), //进项批量设置保存
        // 根据条件查询科目范围下的末级科目，module:进项='cg'或销项='xs';debit借方科目；credit贷方科目;isStock是否为存货
        getChildAccountCodeList: option =>
            fetch.post("/v1/biz/bovms/common/getChildAccountCodeList", option),
        getAccountCodeByIds: option =>
            fetch.post("/v1/biz/bovms/common/getAccountCodeByIds", option),
        // 获取批量设置维度
        getBatchsetupRule: option =>
            fetch.post("/v1/biz/bovms/common/getBatchsetupRule"),
        // 批量设置维度
        saveBatchsetupRule: option =>
            fetch.post("/v1/biz/bovms/common/saveBatchsetupRule", option),
        // 批量新增辅助项目
        saveAuxiliaryItems: option =>
            fetch.post("/v1/biz/bovms/common/saveAuxiliaryItems", option),
        // 根据条件查询科目范围下的所有科目,用于批量新增科目选择，module:进项='cg'或销项='xs';debit借方科目；credit贷方科目;isStock是否为存货
        getParentCodeList: option =>
            fetch.post("/v1/biz/bovms/common/getParentCodeList", option),
        // 批量新增科目
        batchAddAccountCode: option =>
            fetch.post("/v1/biz/bovms/common/batchAddAccountCode", option),
        // 获取存货档案信息 List集合，"enabledAccountOnly": true    --true：启用；false：不启用
        queryInventoryDtoList: option =>
            fetch.post("/v1/biz/bovms/common/queryInventoryDtoList", option),
        // 根据科目id查询科目信息， "id": "49001" --科目id
        getAccountCodeById: option =>
            fetch.post("/v1/biz/bovms/common/getAccountCodeById", option),
        // 单个科目新增时查询对应父级科目列表id
        getParentCodeId: option =>
            fetch.post("/v1/biz/bovms/common/getParentCodeId", option),
        // 获取全部辅助核算项目列表
        allArchive: (option, title) =>
            fetch.post("v1/ba/basearchive/queryBaseArchives", option),
        // 获取指定类型辅助核算项目列表
        fixedArchive: (option, title) =>
            fetch.post(`v1/ba/${title}/queryList`, option),
        //查票取票获取批设科目数据
        purchaseBatchsetupRule: option =>
            fetch.post("/v1/biz/bovms/purchase/purchaseBatchsetupRule", option),
        //销项取票获取批设科目数据
        saleBatchsetupRule: option =>
            fetch.post("/v1/biz/bovms/sale/saleBatchsetupRule", option),
        //获取进项取票的智能记忆的数据
        queryMemTakeInvoice: option =>
            fetch.post("/v1/biz/bovms/purchase/queryMemTakeInvoice", option),
        //获取批量新增铺助核算下拉科目范围
        getShopAccountList: option =>
            fetch.post("/v1/biz/bovms/common/getShopAccountList", option),
        //根据科目id，获取科目信息
        getAccountById: option => fetch.post("/v1/gl/account/getById", option),
        // 根据id查询存货档案数据
        getInventoryById: option =>
            fetch.post("/v1/ba/inventory/query", option),
        // 销项取票
        querySaleInvoice: option =>
            fetch.post("/v1/biz/bovms/sale/querySaleInvoice", option),
        // 生成销项单据
        saveSaleInvoice: option =>
            fetch.post("/v1/biz/bovms/sale/saveSaleInvoice", option),
        purchaseAutomaticMatch: option =>
            fetch.post("/v1/biz/bovms/purchase/automaticMatch", option),
        saleAutomaticMatch: option =>
            fetch.post("/v1/biz/bovms/sale/automaticMatch", option),
        //获取销取票的智能记忆的数据
        querySaleMemTakeInvoice: option =>
            fetch.post("/v1/biz/bovms/sale/queryMemTakeInvoice", option),
        batchInsertSaleBillInfo: option =>
            fetch.post("/v1/biz/bovms/sale/batchInsertSaleBillInfo", option),
        batchSavePurchaseInvoice: option =>
            fetch.post("/v1/biz/bovms/purchase/batchSavePurchaseInvoice", option),
        queryBatchPurchaseInvoiceList: option =>
            fetch.post("/v1/biz/bovms/purchase/queryBatchPurchaseInvoiceList", option),
        queryBatchSetupSaleBillInfo: option =>
            fetch.post("/v1/biz/bovms/sale/queryBatchSetupSaleBillInfo", option),
        //查询核算精度与自动匹配设置信息
        queryAccountingSetupRule: option =>
            fetch.post("/v1/biz/bovms/accountingSetup/queryAccountingSetupRule", option),
        //保存核算精度与自动匹配设置信息
        saveAccountingSetupRule: option =>
            fetch.post("/v1/biz/bovms/accountingSetup/saveAccountingSetupRule", option),
        //批量修改进项单据信息（主界面修改单张单据、弹窗编辑单张单据、批量设置科目的保存接口）
        batchUpdatePurchaseBillInfo: option =>
            fetch.post("/v1/biz/bovms/purchase/batchUpdatePurchaseBillInfo", option),
        //进项自动匹配科目（批设科目界面、单据弹窗编辑界面的自动匹配）
        purchaseAutoMatchAccount: option => fetch.post("/v1/biz/bovms/purchase/purchaseAutoMatchAccount", option),
        //批量修改销项单据信息（主界面修改单张单据、弹窗编辑单张单据、批量设置科目的保存接口）
        batchUpdateSaleBillInfo: option => fetch.post("/v1/biz/bovms/sale/batchUpdateSaleBillInfo", option),
        //销项自动匹配科目（批设科目界面、单据弹窗编辑界面的自动匹配）
        saleAutoMatchAccount: option => fetch.post("/v1/biz/bovms/sale/saleAutoMatchAccount", option),
        //销项自动匹配科目（批设科目界面、单据弹窗编辑界面的自动匹配）
        purchaseAutoMatchAccount: option => fetch.post("/v1/biz/bovms/purchase/purchaseAutoMatchAccount", option),
        //查询除了【部门人员】、【存货档案】、【项目】、【计量单位】、【账户】、【币种】外的铺助类别(吴道攀)
        queryArchiveCategory: option =>
            fetch.post("/v1/biz/bovms/common/queryArchiveCategory", option),
        //查询指定铺助核算类别下的科目范围（吴道攀）
        queryAuxiliaryAccountCode: option =>
            fetch.post("/v1/biz/bovms/common/queryAuxiliaryAccountCode", option),
        //查询销项和进项往来科目范围(一级科目)
        queryContactAccountCodeList: option =>
            fetch.post("/v1/biz/bovms/common/queryContactAccountCodeList", option),
        //查询销项贷方或者进项借方科目范围(一级科目)
        queryStockAccountCodeList: option =>
            fetch.post("/v1/biz/bovms/common/queryStockAccountCodeList", option),
            //获取账套对应的存货类型信息
        queryInventoryType: option =>
        fetch.post("/v1/biz/bovms/common/queryInventoryType", option),
        //销项批增会计科目
        queryUnitList: option => fetch.post("/v1/edf/unit/queryList", option),
    }
}
