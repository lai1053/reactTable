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
        findByEnumId: (option) => fetch.post('/v1/edf/enumDetail/findByEnumId', option),
    },
    org: {
        modify: () => fetch.post('/v1/edf/org/canModifyEnterpriseProperty'),
        query: () => fetch.post('/v1/edf/org/queryAll'),
        updatePeriod: (option) => fetch.post('/v1/edf/org/checkCanUpdatePeriod', option),
        existsSysOrg: (option) => fetch.post('/v1/edf/sysOrg/existsSysOrg', option),
        readOrgMessage: (option) => fetch.post('v1/edf/org/getNSRXX', option),
        saveBasicInfo: (option) => fetch.post('/v1/edf/org/updateOrgInfo', option),
        updateVat: (option) => fetch.post('/v1/edf/org/updateVatTaxpayer', option),
        saveOrgInfo: (option) => fetch.post('/v1/edf/nsxx/createOrUpdate', option),
        validevatTaxpayerNum: (option) => fetch.post('/v1/edf/org/validevatTaxpayerNum', option),
        updateOrg: (option) => fetch.post('/v1/edf/org/updateOrgName', option),
        queryReportSetting: (option) => fetch.post('/v1/edf/org/queryReportSetting', option),//财务报表设置查询数据接口
        modifyReportSetting: (option) => fetch.post('/v1/edf/org/modifyReportSetting', option),//财务报表设置保存数据接口
        queryOrgAllBySfzCondition: (option) => fetch.post('/v1/edf/org/queryOrgAllBySfzCondition', option),//财务报表设置保存数据接口
        getRecord4XDZ: (option) => fetch.post('/v1/tax/sb/declare/getRecord4XDZ', option),//
        getSystemDate: (option) => fetch.post('/v1/edf/org/getSystemDate', option),//
        queryAllByOrgId: (option) => fetch.post('/v1/edf/org/queryAllByOrgId', option),
        getNsxxInfo: () => fetch.post('/v1/edf/nsxx/query'), //税务信息
        querySfzxx: (option) => fetch.post('v1/edf/sfzxx/queryByPage', option), //税费种信息
        updateNsxxInfo:(option) => fetch.post('v1/edf/nsxx/createOrUpdate', option), //税费种信息
        delNsxxInfo:(option) => fetch.post('v1/edf/sfzxx/delete', option),//税费种信息
        findEnumList: (option) => fetch.post('/v1/edf/enumDetail/batchQuery', option),
        autoGetSfz: (option) => fetch.post('/v1/edf/sfzxx/ysbxx', option),    
        
    },
    CAState: {
        queryCAState: () => fetch.post('/v1/edf/dlxxca/isExistCa'),
        getToolUrl: () => fetch.post('/v1/edf/org/getDownloadUrl')
    }
}