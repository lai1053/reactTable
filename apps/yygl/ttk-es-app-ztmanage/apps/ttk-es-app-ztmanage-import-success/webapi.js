/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    importapi: {
        /**
         * 设置步骤 step:3
         */
        // setImpAccountStep: (option) => fetch.post('/v1/gl/imp/setImpAccountStep', option),
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
         * 是否下次显示该窗口
         * **/

        sfxcts:(option) => fetch.post('/v1/yygl/cusAccountManager/sfxcts',option),
    }

}
