/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    bovms: {
        // queryList: (option) => fetch.post('/v1/bovms/queryList', option),
        // 获取借方和贷方科目(包含父级)；module：销项传xs,进项传cg
        queryContactAndStockParentCode: option =>
            fetch.post(
                "v1/biz/bovms/common/queryContactAndStockParentCode",
                option
            ),
        // 获取借方和贷方科目下来新增(没有启动存货)；module：销项传xs,进项传cg
        getContactAndStockList: option =>
            fetch.post("v1/biz/bovms/common/getContactAndStockList", option),
        // 获取指定类型辅助核算项目列表
        fixedArchive: (option, title) =>
            fetch.post(`v1/ba/${title}/queryList`, option),
        // 获取自定义辅助核算项目列表
        userDefineItem: option =>
            fetch.post(
                "/v1/ba/userdefinearchive/queryListDataByCalcName",
                option
            ),
        // 获取全部辅助核算项目列表
        allArchive: (option, title) =>
            fetch.post("v1/ba/basearchive/queryBaseArchives", option),
        // 获取客户的账套信息接口；vatTaxpayer，2000010001：一般纳税人，2000010002：小规模纳税人
        queryAccount: option =>
            fetch.post("v1/biz/bovms/common/queryAccount", option),
        // 获取发票种类参数,nsrxz=YBNSRZZS&fplx=xxfp
        getFpzlcsList: option =>
            fetch.get(
                `v1/biz/bovms/common/getFpzlcsList?nsrxz=${option.nsrxz}&fplx=${option.fplx}`
            ),
        // 查询当期月份的存货设置数据, "period": "2019-07"; "state": 1,-- 是否启用（1启用，0未启用，2关闭）
        getStockActivationInfo: option =>
            fetch.post("/v1/biz/bovms/common/getStockActivationInfo", option),
        // 获取批量设置维度
        getBatchsetupRule: option =>
            fetch.post("/v1/biz/bovms/common/getBatchsetupRule"),
        // 批量设置维度
        saveBatchsetupRule: option =>
            fetch.post("/v1/biz/bovms/common/saveBatchsetupRule", option),
        // 查询单个模块凭证习惯设置规则；"module": "purchase" --模块名：purchase、sale、expense、psb、flowfund、salary
        getVoucherRule: option =>
            fetch.post("/v1/biz/bovms/common/getVoucherRule", option),
        // 更新单个模块凭证习惯设置规则
        updateVoucherRule: option =>
            fetch.post("/v1/biz/bovms/common/updateVoucherRule", option),
        // 获取分页销项数据，
        querySalePageList: option =>
            fetch.post("/v1/biz/bovms/sale/querySalePageList", option),
        // 查询销项单张发票单据信息，"id": 1,   --销项单张发票单据id
        getBillSaleInformation: option =>
            fetch.post("/v1/biz/bovms/sale/getBillSaleInformation", option),
        // 编辑时更新销项单张发票单据信息
        updateBillSaleInformation: option =>
            fetch.post("/v1/biz/bovms/sale/updateBillSaleInformation", option),
        // 销项清单单据批量设置科目数据
        bovmsBillSaleBatchsetup: option =>
            fetch.post("/v1/biz/bovms/sale/bovmsBillSaleBatchsetup", option),
        // 获取存货档案信息 List集合，"enabledAccountOnly": true    --true：启用；false：不启用
        queryInventoryDtoList: option =>
            fetch.post("/v1/biz/bovms/common/queryInventoryDtoList", option),
        // 根据条件查询科目范围下的末级科目，module:进项='cg'或销项='xs';debit借方科目；credit贷方科目;isStock是否为存货
        getChildAccountCodeList: option =>
            fetch.post("/v1/biz/bovms/common/getChildAccountCodeList", option),
        // 根据条件查询科目范围下的所有科目,用于批量新增科目选择，module:进项='cg'或销项='xs';debit借方科目；credit贷方科目;isStock是否为存货
        getParentCodeList: option =>
            fetch.post("/v1/biz/bovms/common/getParentCodeList", option),
        // 根据科目id查询科目信息， "id": "49001" --科目id
        getAccountCodeById: option =>
            fetch.post("/v1/biz/bovms/common/getAccountCodeById", option),
        getAccountCodeByIds: option =>
            fetch.post("/v1/biz/bovms/common/getAccountCodeByIds", option),
        // 获取科目设置明细列表
        getSubjectMatchList: option =>
            fetch.post(
                "/v1/biz/bovms/subjectMatch/getSubjectMatchList",
                option
            ),
        // 保存匹配科目列表
        updateSubjectMatch: option =>
            fetch.post("/v1/biz/bovms/subjectMatch/updateSubjectMatch", option),
        // 销项取票
        saleTake: option =>
            fetch.post("/v1/biz/bovms/sale/takeSaleInvoice", option),
        // 销项批量设置保存
        salebatchUpdate: option =>
            fetch.post("/v1/biz/bovms/sale/batchUpdateInvoice", option),
        // 获取批量设置维度
        // operationBatchsetupRule:(option) => fetch.get('/v1/biz/bovms/common/operationBatchsetupRule', option),
        // 批量新增科目
        batchAddAccountCode: option =>
            fetch.post("/v1/biz/bovms/common/batchAddAccountCode", option),
        // 批量新增辅助项目
        saveAuxiliaryItems: option =>
            fetch.post("/v1/biz/bovms/common/saveAuxiliaryItems", option),
        // 单个科目新增时查询对应父级科目列表id
        getParentCodeId: option =>
            fetch.post("/v1/biz/bovms/common/getParentCodeId", option),
        // 获取辅助项目类别，"module": -- 模块名：purchase(进项)、sale(销项)
        getAuxiliaryItemCategory: option =>
            fetch.post("/v1/biz/bovms/common/getAuxiliaryItemCategory", option),
        // 删除销项凭证
        deleteSaleVoucher: option =>
            fetch.post("/v1/biz/bovms/sale/deleteSaleVoucher", option),
        // 销项生成凭证
        createVoucher: option =>
            fetch.post("/v1/biz/bovms/sale/createVoucher", option),
        // 删除销项发票单据
        deleteBillSale: option =>
            fetch.post("/v1/biz/bovms/sale/deleteBillSale", option),
        // 查询科目编号2221对应的子级科目列表
        get2221CodeList: option =>
            fetch.post("/v1/biz/bovms/common/get2221CodeList", option),
        saleChaPiao: option =>
            fetch.post("/v1/biz/bovms/sale/checkSaleTicket", option), // 销项查票接口
        saleRuZhang: option =>
            fetch.post("/v1/biz/bovms/sale/saveSaleTicket", option), // 销项入账接口
        saleColes: option =>
            fetch.post("/v1/biz/bovms/sale/saleTicketSubjectMatch", option), // 销项查票关闭
        // 返回当前查询结果的所有BillID
        getAllBillIdSale: option =>
            fetch.post("/v1/biz/bovms/sale/getAllBillIdSale", option),
        // 查询进项单张发票单据信息
        // getBillSaleInformation: (option) => fetch.post('/v1/biz/bovms/sale/getBillSaleInformation', option),
        // 查询科目编号2221对应的科目id列表（吴道攀）
        get2221CodeIds: option =>
            fetch.post("/v1/biz/bovms/common/get2221CodeIds", option),
        //查票取票获取批设科目数据
        purchaseBatchsetupRule: option =>
            fetch.post("/v1/biz/bovms/purchase/purchaseBatchsetupRule", option),
        //销项取票获取批设科目数据
        saleBatchsetupRule: option =>
            fetch.post("/v1/biz/bovms/sale/saleBatchsetupRule", option),
        // 保存列设置
        saveBillColumnSetup: option =>
            fetch.post("/v1/biz/bovms/common/saveBillColumnSetup", option),
        // 查询列设置
        queryColumnSetup: option =>
            fetch.post("/v1/biz/bovms/common/queryColumnSetup", option),
        //获取进项取票的智能记忆的数据
        queryMemTakeInvoice: option =>
            fetch.post("/v1/biz/bovms/purchase/queryMemTakeInvoice", option),
        //获取批量新增铺助核算下拉科目范围
        getShopAccountList: option =>
            fetch.post("/v1/biz/bovms/common/getShopAccountList", option),
        //根据科目id，获取科目信息
        getAccountById: option => fetch.post("/v1/gl/account/getById", option),
        //换算比率分页查询接口
        queryUnitChangeRatioPageList: option =>
            fetch.post(
                "/v1/biz/bovms/common/queryUnitChangeRatioPageList",
                option
            ),
        //换算比率保存接口
        saveUnitChangeRatioRecords: option =>
            fetch.post(
                "/v1/biz/bovms/common/saveUnitChangeRatioRecords",
                option
            ),
        //换算比率删除接口
        deleteUnitChangeRatioRecords: option =>
            fetch.post(
                "/v1/biz/bovms/common/deleteUnitChangeRatioRecords",
                option
            ),
        // 根据id查询存货档案数据
        getInventoryById: option =>
            fetch.post("/v1/ba/inventory/query", option),
        // 销项取票
        querySaleInvoice: option =>
            fetch.post("/v1/biz/bovms/sale/querySaleInvoice", option),
        // 生成销项单据
        saveSaleInvoice: option =>
            fetch.post("/v1/biz/bovms/sale/saveSaleInvoice", option),
        //取票自动匹配
        automaticMatch: option =>
            fetch.post("/v1/biz/bovms/sale/automaticMatch", option),
        //批设科目自动匹配
        automaticBatchMatch: option =>
            fetch.post("/v1/biz/bovms/sale/automaticBatchMatch", option),
        //进项取票自动匹配
        purchaseAutomaticMatch: option =>
            fetch.post("/v1/biz/bovms/purchase/automaticMatch", option),
        //销项取票自动匹配
        saleAutomaticMatch: option =>
            fetch.post("/v1/biz/bovms/sale/automaticMatch", option),
        //单张发票编辑自动匹配
        automaticSingleMatch: option =>
            fetch.post("/v1/biz/bovms/sale/automaticSingleMatch", option),
        //获取销取票的智能记忆的数据
        querySaleMemTakeInvoice: option =>
            fetch.post("/v1/biz/bovms/sale/queryMemTakeInvoice", option),
        //查询除了【部门人员】、【存货档案】、【项目】、【计量单位】、【账户】、【币种】外的铺助类别(吴道攀)
        queryArchiveCategory: option =>
            fetch.post("/v1/biz/bovms/common/queryArchiveCategory", option),
        //查询指定铺助核算类别下的科目范围（吴道攀）
        queryAuxiliaryAccountCode: option =>
            fetch.post("/v1/biz/bovms/common/queryAuxiliaryAccountCode", option),
        //查询核算精度与自动匹配设置信息
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
        //销项批增会计科目
        queryUnitList: option => fetch.post("/v1/edf/unit/queryList", option),
    }
}
