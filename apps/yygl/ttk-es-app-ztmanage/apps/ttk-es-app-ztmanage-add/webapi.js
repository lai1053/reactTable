/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, fetchCors, tree} from 'edf-utils'

export default {
    portal: {
        init: (id) => fetch.post('/v1/edf/org/findById', id),
        portal: (option) => fetch.post('/v1/edf/portal/initPortal', option),
        sfxsbgan:(option) => fetch.post('/v1/yygl/cusAccountManager/sfhybgjl',option),//是否显示查看按钮
        // portal: (option) => {
        //     return fetch.post('/v1/edf/portal/initPortal').then(r => {
        //         r.menu.forEach(m => m.key = m.code)
        //         r.menu = tree.build(r.menu, { id: 0 }).children
        //         return r
        //     })
        // },

    },
    user: {
        logout: () => fetch.post('/v1/edf/user/logout')
    },

    org: {
        queryList: (option) => fetch.post('v1/edf/org/queryList', option),
        //existsSysOrg: (option) => fetch.post('/v1/edf/sysOrg/existsSysOrg', option),
        // existsSysOrg: (option) => fetch.post('/v1/edf/sysOrg/existsXdzKhOrg',option),//变更接口地址，国伟2019-07-10
        existsSysOrg: (option) => fetch.post('v1/edf/sysOrg/financeNameIsExists',option),//变更接口地址，国伟2019-09-16
        create: (option) => fetch.post('/v1/edf/dzgl/initFinance', option),
        updateAccountInfo: (option) => fetch.post('/v1/edf/dzgl/updateAccountInfo', option),
        updateCurrentOrg: (option) => fetchCors.post_develop('/v1/openapi/userlevel/org/updateCurrentOrg', option, sessionStorage['_accessToken']),
    },
    enumDetail: {
        batchQuery: (option) => fetch.post('/v1/edf/enumDetail/batchQuery', option),
        updateCurrentOrg: (option) => fetchCors.post_develop('/v1/openapi/userlevel/org/updateCurrentOrg', option, sessionStorage['_accessToken']),
        //checkOrg: (option) => fetch.post('/v1/edf/sysOrg/existsSysOrg',option)
        checkOrg: (option) => fetch.post('/v1/edf/sysOrg/existsXdzKhOrg',option)//变更接口地址，国伟2019-07-10
    },
    enableDate: {
        getServerDate: () => fetch.post('/v1/edf/org/getSystemDate'),
    }
}
