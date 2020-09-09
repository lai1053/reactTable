/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    funds: {
        //保存银行对账单
        saveBankStatement: (option) => fetch.post('/v1/biz/bovms/flowfund/saveBankStatement', option),
        //资金主列表查询（筛选、统计、分页、排序）
        queryFlowfundPageList: (option) => fetch.post('/v1/biz/bovms/flowfund/queryFlowfundPageList', option),
        //获取全部账户
        getBankAccountList: (option) => fetch.post('/v1/biz/bovms/common/getBankAccountList', option),
        //获取全部账户
        getFlowfundBankAccountList: (option) => fetch.post('/v1/biz/bovms/flowfund/getBankAccountList', option),
        //根据账户id查询账户对象
        getOneBankAccount: (option) => fetch.post('/v1/biz/bovms/common/getOneBankAccount', option),
        //对账单通用模板下载
        downloadCommonTemplate: (option) => fetch.get('/v1/biz/bovms/flowfund/downloadCommonTemplate', option),
        //批量设置科目查询接口
        queryBankFlowsWhenBatchSetup: (option) => fetch.post('/v1/biz/bovms/flowfund/queryBankFlowsWhenBatchSetup', option),
        //批量设置科目更新接口
        saveBankFlowsWhenBatchSetup: (option) => fetch.post('/v1/biz/bovms/flowfund/saveBankFlowsWhenBatchSetup', option),
        //解析银行对账单getSubjectMatchList
        parseBankStatement: (option) => fetch.post('/v1/biz/bovms/flowfund/parseBankStatement', option),
        //资金生成凭证（支持批量）
        createVoucher: (option) => fetch.post('/v1/biz/bovms/flowfund/createVoucher', option),
        //删除对帐单
        deleteBankStatement: (option) => fetch.post('/v1/biz/bovms/flowfund/deleteBankStatement', option),
        //删除凭证
        deleteFlowfundVoucher: (option) => fetch.post('/v1/biz/bovms/flowfund/deleteFlowfundVoucher', option),
        //保存编辑后的银行流水
        saveBankFlowsWhenUpdate: (option) => fetch.post('/v1/biz/bovms/flowfund/saveBankFlowsWhenUpdate', option),
        //拆分流水保存接口
        saveBankFlowsWhenSplit: (option) => fetch.post('/v1/biz/bovms/flowfund/saveBankFlowsWhenSplit', option),
        //单条流水查询
        queryBankFlowsByIds: (option) => fetch.post('/v1/biz/bovms/flowfund/queryBankFlowsByIds', option),
        //删除银行账号时，检查是否存在对账单，凭证数据
        checkBankAccountWhenDelete: (option) => fetch.post('/v1/biz/bovms/flowfund/checkBankAccountWhenDelete', option),
        //获取资金模块生成凭证下的科目设置下拉科目列表
        getFlowfundAccountCodeListForAccountMatch: (option) => fetch.post('/v1/biz/bovms/common/getFlowfundAccountCodeListForAccountMatch', option),
        //获取资金模块科目设置下拉科目列表
        getFundChildAccountCodeList: (option) => fetch.post('/v1/biz/bovms/common/getFundChildAccountCodeList', option),
        //单个科目新增时获取资金对应的所有父级科目列表id
        getFundParentCodeId: (option) => fetch.post('/v1/biz/bovms/common/getFundParentCodeId', option),
        // 批量新增科目时获取资金对应的往来科目的父级科目列表id
        getFundListParentCodeId: (option) => fetch.post('/v1/biz/bovms/common/getFundListParentCodeId', option),
        //查询列设置
        queryColumnSetup: (option) => fetch.post('/v1/biz/bovms/common/queryColumnSetup', option),
        //保存列设置
        saveBillColumnSetup: (option) => fetch.post('/v1/biz/bovms/common/saveBillColumnSetup', option),
        //查询习惯凭证
        getVoucherRule: (option) => fetch.post('/v1/biz/bovms/common/getVoucherRule', option),
        //更新习惯凭证
        updateVoucherRule: (option) => fetch.post('/v1/biz/bovms/common/updateVoucherRule', option),
        // 获取科目设置明细列表
        getSubjectMatchList: (option) => fetch.post('/v1/biz/bovms/subjectMatch/getSubjectMatchList', option),
        // 保存匹配科目列表
        updateSubjectMatch: (option) => fetch.post('/v1/biz/bovms/subjectMatch/updateSubjectMatch', option),
        // 获取指定类型辅助核算项目列表
        fixedArchive: (option, title) => fetch.post(`v1/ba/${title}/queryList`, option),
        // 获取自定义辅助核算项目列表
        userDefineItem: (option) => fetch.post('/v1/ba/userdefinearchive/queryListDataByCalcName', option),
        // 获取全部辅助核算项目列表
        allArchive: (option, title) => fetch.post('v1/ba/basearchive/queryBaseArchives', option),
        //根据科目id，获取科目信息
        getAccountById: (option) => fetch.post('/v1/gl/account/getById', option),
        // 获取指定类型辅助核算项目列表
        fixedArchive: (option, title) => fetch.post(`v1/ba/${title}/queryList`, option),
        // 获取自定义辅助核算项目列表
        userDefineItem: (option) => fetch.post('/v1/ba/userdefinearchive/queryListDataByCalcName', option),
        //获取批量新增铺助核算下拉科目范围
        getShopAccountList: (option) => fetch.post('/v1/biz/bovms/common/getShopAccountList', option),
        // 批量新增辅助项目
        saveAuxiliaryItems: (option) => fetch.post('/v1/biz/bovms/common/saveAuxiliaryItems', option),
        // 根据条件查询科目范围下的所有科目,用于批量新增科目选择，module:进项='cg'或销项='xs';debit借方科目；credit贷方科目;isStock是否为存货
        getParentCodeList: (option) => fetch.post('/v1/biz/bovms/common/getParentCodeList', option),
        // 批量新增科目
        batchAddAccountCode: (option) => fetch.post('/v1/biz/bovms/common/batchAddAccountCode', option),
        // 获取客户的账套信息接口；vatTaxpayer，2000010001：一般纳税人，2000010002：小规模纳税人
        queryAccount: option => fetch.post("/v1/biz/bovms/common/queryAccount", option),
        downloadTemplate :option => fetch.formPost("/v1/biz/bovms/flowfund/downloadCommonTemplate", option),
    }
}