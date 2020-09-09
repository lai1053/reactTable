/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch, tree } from 'edf-utils'

export default {
    importapi: {
        /**
         * 设置步骤 step:3
         */
        setImpAccountStep: (option) => fetch.post('/v1/gl/imp/setImpAccountStep', option),
        getSuccessAndFailedCount: () => fetch.post('/v1/edf/importaccount/getSuccessAndFailedCount'),
        deleteOrgAccountFile: () => fetch.post('/v1/edf/importaccount/deleteOrgAccountFile'),
        /**
        * 检验科目是否还存在未匹配的记录
        */
        queryUnMatch: () => fetch.post('/v1/gl/imp/queryUnMatch', {}),
        /**
        * 检验凭证是否还存在未匹配的记录
        */
        queryVoucherFailedList: (option) => fetch.post('/v1/gl/imp/queryFailedList', option),
        /**
        * 查找资产草稿列表
        */
        queryAssetFailedList: () => fetch.post('/v1/gl/asset/imp/queryFailedList', {}),
        /**
        * 保存目标科目快照
        */
        saveAccountsSnapshot: () => fetch.post('/v1/gl/imp/saveAccountsSnapshot', {}),

        /**
         * 批量导账 （对接工作台）
         */
        importAsync: () => fetch.post('/v1/imp/auto/importAsync', {}),
        /**
         * 获取状态，查看导账是否已成功（对接工作台，不走科目对照、资产等页面）
         */
        getImportStatus: (id) => fetch.post('/v1/imp/auto/getImportStatus', id),
        
    }

}