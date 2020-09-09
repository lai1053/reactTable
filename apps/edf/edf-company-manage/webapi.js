/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, fetchCors, tree} from 'edf-utils'

export default {
    portal: {
        init: () => fetch.post('/v1/edf/portal/init'),
        portal: () => {
            return fetch.post('/v1/edf/portal/initPortal').then(r => {
                r.menu.forEach(m => m.key = m.code)
                r.menu = tree.build(r.menu, { id: 0 }).children
                return r
            })
        },

    },
    user: {
        logout: () => fetch.post('/v1/edf/user/logout')
    },

    org: {
        queryList: (option) => fetch.post('v1/edf/sysOrg/queryOrgList', option),
        del: (option) => fetchCors.post_develop('/v1/openapi/userlevel/org/delete', option, sessionStorage['_accessToken']),
        updateCurrentOrg: (option) => fetchCors.post_develop('/v1/openapi/userlevel/org/updateCurrentOrg', option, sessionStorage['_accessToken']),
        modify: (option) => fetch.post('/v1/edf/org/canModifyEnterprisePropertyForOrgManage', option),
        validevatTaxpayerNum: (option) => fetch.post('/v1/edf/org/validevatTaxpayerNum', option),
        cancelImportAccount: (option) => fetchCors.post_develop('/v1/openapi/basicData/cancelImportAccount', option, sessionStorage['_accessToken']),
    },
    invoice: {
        query: (option) => fetch.post('/v1/edf/ordercenter/queryInvoice', option),
        applyForInvoice: (option) => fetch.post('/v1/edf/ordercenter/issueInvoice', option)
    },
    order: {
        query: (option) => fetch.post('/v1/edf/order/queryList', option),
        cancel: (option) => fetch.post('/v1/edf/order/cancel', option),
        delete: (option) => fetch.post('/v1/edf/order/delete', option),
    }
}
