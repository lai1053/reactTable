/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, tree} from 'edf-utils'
export default {
    financeinit: {      
        enum: (enumId) => fetch.post('/v1/edf/enumDetail/batchQuery', enumId),
        query: () => fetch.post('/v1/edf/org/queryOrgAboutPeriodAndProperty'),
        getModifyStatus: () => fetch.post('/v1/edf/org/canModifyEnterpriseProperty'),
        downloadTemplate: (option) => fetch.formPost('/v1/gl/accountPeriodBegin/exportTemplate', option), // 下载模板
        updatePeriodAndProperty: (option) => fetch.post('/v1/edf/org/updateOrgInfo', option),
        importAccountBalance: (option) => fetch.post('/v1/gl/accountBalance/import', option),
        getDisplayPeriod: () => fetch.post('/v1/gl/mec/getNeedMonthlyClosingPeriod'),
        checkCanUpdatePeriod: (option) => fetch.post('/v1/edf/org/checkCanUpdatePeriod', option),//检查启用期间能否修改
        isCanModifyEnterpriseProperty: () => fetch.post('/v1/edf/org/isCanModifyEnterpriseProperty'),//检查企业准则和纳税人性质是否能修改
        queryExcelCheckedInfo: () => fetch.post('/v1/gl/accountBalance/queryImportExcelSuccessInfo'),
        isUpdatePeriodAndProperty: (option) => fetch.post('/v1/edf/org/isUpdatePeriodAndProperty', option),//检查启用期间和企业准则能否修改
        //设置进行步骤
        setStep: (option) => fetch.post('/v1/gl/accountPeriodBegin/setStep',option),
        queryAll: () => fetch.post('/v1/edf/org/queryAll')
    }
}
