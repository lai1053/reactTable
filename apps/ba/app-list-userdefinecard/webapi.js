/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    basearchive: {
        queryList: (option) => fetch.post('v1/ba/userdefinearchive/queryList', option),
        delete: (option) => fetch.post('v1/ba/userdefinearchive/delete', option),
        update: (option) => fetch.post('/v1/ba/userdefinearchive/updateData', option),
        queryDataList: (option) => fetch.post('v1/ba/userdefinearchive/queryListData', option),
        deleteData: (option) => fetch.post('v1/ba/userdefinearchive/deleteData', option),
    },
    getSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
    setSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),
}
