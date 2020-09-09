/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch, tree, fetchCors } from 'edf-utils'

export default {
    portal: {
        init: () => fetch.post('/v1/edf/portal/init'),
        portal: () => {
            return fetch.post('/v1/edf/portal/initPortal').then(r => {
                r.menu.forEach(m => m.key = m.code)
                r.originMenu = r.menu
                r.menu = tree.build(r.menu, { id: 0 }).children
                return r
            })
        },
        menu: (option) => fetch.post('/v1/edf/menutreememory/update', option)
    },
    user: {
        logout: () => fetch.post('/v1/edf/user/logout'),
        updateSkin: (color) => fetch.post('v1/edf/user/updateSkin', color),
        deleteUser: (option) => fetch.post('v1/edf/portal/cleanUpDataByMobile', option)
    },
    org: {
        queryList: (option) => fetch.post('/v1/edf/sysOrg/queryOrgList', option),
        updateCurrentOrg: (option) => fetchCors.post_develop('/v1/openapi/userlevel/org/updateCurrentOrg', option, sessionStorage['_accessToken']),
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
    getOwnCode: () => fetch.post('/v1/edf/sdk/getWebUrlForCompanyInformation'),
    dzgl: {
        getDzgl: (option) => fetch.post('/v1/dzgl/toDz', option),
    }
}
