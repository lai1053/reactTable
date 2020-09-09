/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    cerficate:{
        fixedArchive: (option, title) => fetch.post(`v1/ba/${title}/queryList`, option),
        userDefineItem: (option) =>  fetch.post('/v1/ba/userdefinearchive/queryListDataByCalcName', option),
        allArchive: (option) => fetch.post('v1/ba/basearchive/queryBaseArchives', option),
        query: (option) => fetch.post('/v1/gl/userdefinedcertificatetemplate/queryAllUserDefineDocByPeriod', option),
        del: (option) => fetch.post('/v1/gl/userdefinedcertificatetemplate/delete', option),
        getDisplayPeriod: () => fetch.post('/v1/gl/getDisplayPeriod')
    }
}
