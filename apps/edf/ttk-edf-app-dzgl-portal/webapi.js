/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch, tree, fetchCors } from 'edf-utils'

export default {
    portal: {
        init: () => fetch.post('/v1/edf/dzgl/init'),
        portal: () => {
            return fetch.post('/v1/edf/dzgl/initPortal').then(r => {
                sessionStorage['dzglMenu'] = r && JSON.stringify(r.menu)
                r.menu.forEach(m => m.key = m.code)
                r.menu = tree.build(r.menu, { id: 0 }).children
                return r
            })
        },
        menu: (option) => fetch.post('/v1/edf/menutreememory/update', option)
    },
    user: {
        logout: () => fetch.post('/v1/edf/user/logout'),
        updateSkin: (color) => fetch.post('v1/edf/user/updateSkin', color),
        deleteUser: (option) => fetch.post('v1/edf/portal/cleanUpDataByMobile', option),
        updatePageStyle: (option) => fetch.post('v1/edf/user/updatePageStyle', option)
    },
    org: {
        queryList: (option) => fetch.post('/v1/edf/sysOrg/queryOrgList', option),
        updateCurrentOrg: (option) => fetch.post('/v1/edf/org/updateCurrentOrg', option),
        //updateCurrentOrg: (option) => fetchCors.post_develop('/v1/openapi/userlevel/org/updateCurrentOrg', option, sessionStorage['_accessToken']),
    },
    desktop: {
        queryAppList: () => fetch.post('/v1/edf/desktopapp/queryAppList'),
        saveAppList: (option) => fetch.post('/v1/edf/desktopapp/saveAppList', option)
    },
    getMsgNum: () => fetch.post('/v1/edf/sysMessage/queryUnreadCount'),
    periodDate: (option) => fetch.post('/v1/edf/perioddate/update', option),
    tplus: {
        common: (url, params, options) => fetchCors.post(url, params, options),
    },
    landing: {
        code: (option) => fetch.post('/v1/edf/connector/getGjCodefromUc', option),
    },
    markRead: (option) => fetch.post('/v1/edf/sysMessage/userRead', option),
    dzCode: () => fetch.post('/v1/edf/connector/getJcyyCodeFromUc'),
    getJcyyLogin: (url, params) => fetch.post(url, params),
    getWebUrlForShenBaoBatch: (option) => fetch.post('/v1/edf/sdk/getWebUrlForShenBaoBatch',option),
    getCustomerOrgIdList: () => fetch.post('/v1/dz/customer/getCustomerOrgIdList'),
    dzgl: {
        getDanhuInfo: (option) => fetch.post('/v1/dzgl/toBdz', option),
        getEsOrgList: (option) => fetch.post('/v1/edf/sysOrg/queryOrgListDz', option),
    },
    // yygl: {
    //     getHomeOrgList: (option) => fetch.post('/v1/yygl/home/getOrgList', option),
    // }
}
