/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    getEnumData: {
        basicEnum: (enumId) => fetch.post('/v1/edf/enumDetail/batchQuery', enumId),
        taxEnum: (option) => fetch.post('v1/edf/enum/findEnumMapIncludeDetails', option),
        ss: (option) => fetch.post('v1/edf/area/query', option),
        kjzzQuery: (option) => fetch.post('/v1/tax/sb/kjzz/query', option),//财务报表设置保存数据接口
        enumDetailQuery: (option) => fetch.post('/v1/edf/enumDetail/query', option),//
        kjzzQueryKjzz: (option) => fetch.post('/v1/tax/sb/kjzz/queryKjzz', option),//
        queryByKjzdzzDm: (option) => fetch.post('/v1/tax/sb/kjzz/queryByKjzdzzDm', option),//
        queryKjzzByCodeList: (option) => fetch.post('/v1/tax/sb/kjzz/queryKjzzByCodeList', option),//
        queryReportingCategoryInfoByAcctStdCd: (option) => fetch.post('/v1/tax/sb/kjzz/queryReportingCategoryInfoByAcctStdCd', option),//
        queryReportSettingCode: (option) => fetch.post('/v1/edf/org/queryReportSettingCode', option),//
        accountQuery: (option) => fetch.post('/v1/gl/account/query', option),//科目列表
    },
    org: {
        modify: () => fetch.post('/v1/edf/org/canModifyEnterpriseProperty'),
        query: (option) => fetch.post('/v1/edf/org/queryAll', option),
        updatePeriod: (option) => fetch.post('/v1/edf/org/checkCanUpdatePeriod', option),
        existsSysOrg: (option) => fetch.post('/v1/edf/sysOrg/existsSysOrg', option),
        readOrgMessage: (option) => fetch.post('v1/edf/org/getNSRXX', option),
        saveBasicInfo: (option) => fetch.post('/v1/edf/org/updateOrgInfo', option),
        updateVat: (option) => fetch.post('/v1/edf/org/updateVatTaxpayer', option),
        saveOrgInfo: (option) => fetch.post('/v1/edf/nsxx/createOrUpdate', option),
        updateNsxx: (option) => fetch.post('/v1/edf/nsxx/updateNsxx', option),
        validevatTaxpayerNum: (option) => fetch.post('/v1/edf/org/validevatTaxpayerNum', option),
        updateOrg: (option) => fetch.post('/v1/edf/org/updateOrgName', option),
        queryReportSetting: (option) => fetch.post('/v1/edf/org/queryReportSetting', option),//财务报表设置查询数据接口
        modifyReportSetting: (option) => fetch.post('/v1/edf/org/modifyReportSetting', option),//财务报表设置保存数据接口
        queryOrgAllBySfzCondition: (option) => fetch.post('/v1/edf/org/queryOrgAllBySfzCondition', option),//财务报表设置保存数据接口
        getRecord4XDZ: (option) => fetch.post('/v1/tax/sb/declare/getRecord4XDZ', option),//
        getDefaultReportSettingCode: (option) => fetch.post('/v1/edf/org/queryDefaultReportSettingCode', option),//
        getSystemDate: (option) => fetch.post('/v1/edf/org/getSystemDate', option),//
        queryAllByOrgId: (option) => fetch.post('/v1/edf/org/queryAllByOrgId', option),
        getZFJGInfo: (option) => fetch.post('/v1/edf/zfjglx/query', option),
        updateZFJGInfo: (option) => fetch.post('/v1/edf/zfjglx/createOrUpdate', option),
        addFZJGItem: (option) => fetch.post('/v1/edf/fzjgxx/create', option),
        updateFZJGItem: (option) => fetch.post('/v1/edf/fzjgxx/update', option),
        deleteFZJGItem: (option) => fetch.post('/v1/edf/fzjgxx/delete', option),
        getFZJGList: (option) => fetch.post('/v1/edf/fzjgxx/query', option),
    },
    CAState: {
        queryCAState: () => fetch.post('/v1/edf/dlxxca/isExistCa'),
        getToolUrl: () => fetch.post('/v1/edf/org/getDownloadUrl')
    },
    downLoad:{
        getNsrxx: (option) => fetch.post('/v1/yygl/khzl/getNsrxx',option),
        getNsrxxAsyncStatusHasReturn: (option) => fetch.post('/v1/yygl/khzl/getNsrxxAsyncStatusHasReturn',option),
    }
}