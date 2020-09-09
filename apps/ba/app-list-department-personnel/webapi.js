/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    dept: {
        query: () => fetch.post('v1/ba/department/queryList'),
        delete: (option) => fetch.post('v1/ba/department/delete', option),
        isCreater: (option) => fetch.post('v1/edf/sysOrgUser/getIsOrgCreator', option),
    },
    person: {
        query: (id) => fetch.post('/v1/ba/person/query', {id}),
        queryList: (option) => fetch.post('v1/ba/person/queryList', option),
        delete: (option) => fetch.post('v1/ba/person/delete', option),
        update: (option) => fetch.post('/v1/ba/person/update', option),
        temptDownload: (option) => fetch.formPost('/v1/ba/person/download', option),
        export: (option) => fetch.formPost('/v1/ba/person/export', option),
        transferPrivilege: (option) => fetch.post('/v1/ba/person/transferPrivilege', option),
    },
    role: {
        query: (option) => fetch.post('/v1/edf/role/query', option)
    },
    getSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
    setSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),
}
