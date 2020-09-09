/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch, fetchCors } from 'edf-utils'

export default {
    user: {
        logout: () => fetch.post('/v1/edf/user/logout')
    },

    org: {
        queryList: (option) => fetch.post('v1/edf/org/queryList', option),
        existsSysOrg: (option) => fetch.post('/v1/edf/sysOrg/existsSysOrg', option),
        financeNameIsExists: (option) => fetch.post('/v1/edf/sysOrg/financeNameIsExists', option),
        create: (option) => fetch.post('/v1/edf/importaccount/createOrgDto', option),
        updateOrgDto: (option) => fetch.post('/v1/edf/importaccount/updateOrgDto', option),
        updateCurrentOrg: (option) => fetchCors.post_develop('/v1/openapi/userlevel/org/updateCurrentOrg', option, sessionStorage['_accessToken']),
        del: (option) => fetch.post('/v1/edf/importaccount/deleteAccount', option),
        query: () => fetch.post('/v1/edf/org/queryAll'),
        reinit: () => fetch.post('/v1/edf/org/reInitData'),
    },
    enumDetail: {
        batchQuery: (option) => fetch.post('/v1/edf/enumDetail/batchQuery', option),
        updateCurrentOrg: (option) => fetchCors.post_develop('/v1/openapi/userlevel/org/updateCurrentOrg', option, sessionStorage['_accessToken']),
    },
    enableDate: {
        getServerDate: () => fetch.post('/v1/edf/org/getSystemDate'),
    },
    upload: (option) => fetch.post('/v1/edf/importaccount/import', option),
    updateOrg: (option) => fetch.post('/v1/edf/org/updateOrgInfoForOrgManage', option),
    init: (option) => fetch.post('/v1/edf/importaccount/init', option),
    setImpAccountStep: (option) => fetch.post('/v1/gl/imp/setImpAccountStep', option),
    /**
     * 删除资产临时列表
     */
    deleteAssetTmpLst: () => fetch.post('/v1/gl/asset/imp/delete', {}),
}
