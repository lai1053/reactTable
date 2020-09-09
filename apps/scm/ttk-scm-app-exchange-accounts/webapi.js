/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

const mockData = fetch.mockData

export default {
    
    init: (option) => fetch.post('/v1/biz/scm/bank/bankTransfer/init', option),
    create: (option) => fetch.post('v1/biz/scm/bank/bankTransfer/create', option),
    queryById: (option) => fetch.post('v1/biz/scm/bank/bankTransfer/queryById', option),
    update: (option) => fetch.post('v1/biz/scm/bank/bankTransfer/update', option)
    // exporttemplate: () => fetch.formPost('/v1/gl/asset/exporttemplate'),
	// import: (option) => fetch.post('/v1/gl/asset/import', option, isReturnValue),
    
}