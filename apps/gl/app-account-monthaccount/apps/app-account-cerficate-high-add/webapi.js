/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    query:{
        init: (option) =>  fetch.post('/v1/gl/userdefinedcertificatetemplate/init', option), //初始化查询
        fixedArchive: (option, title) => fetch.post(`v1/ba/${title}/queryList`, option),
        userDefineItem: (option) =>  fetch.post('/v1/ba/userdefinearchive/queryListDataByCalcName', option),
        allArchive: (option, title) => fetch.post('v1/ba/basearchive/queryBaseArchives', option),
        getBaseArchive: () => fetch.post('/v1/gl/doc/queryItemInfo'),
        create: (option) => fetch.post('/v1/gl/userdefinedcertificatetemplate/create', option),
        update: (option) => fetch.post('/v1/gl/userdefinedcertificatetemplate/update ',option),
        queryTemplate: (option) => fetch.post('/v1/gl/userdefinedcertificatetemplate/query',option),
        getProportion: (option) => fetch.post('/v1/gl/userdefinedcertificatetemplate/getProportionByCreditAccountId', option),
        findCost_ProfitAndLossAccounts: () => fetch.post('/v1/gl/account/findCost_ProfitAndLossAccounts')
    }
}
