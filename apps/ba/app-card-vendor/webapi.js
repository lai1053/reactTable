/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    vendor: {
        cats: (option) => fetch.post('/v1/ba/archCat/queryAll',option),
	    getCode: () => fetch.post('/v1/ba/basearchive/getAutoCode', { archiveName: 'ba_supplier' }),
        query: (id) => fetch.post('/v1/ba/supplier/query', { id }),
        //findById: (id) => fetch.post('/v1/verdor/findById', { id }),
        create: (option) => fetch.post('/v1/ba/supplier/create', option),
        update: (option) => fetch.post('/v1/ba/supplier/update', option),
        queryList: (option) => fetch.post('/v1/ba/supplier/queryList', option),
	    canGenerateAccount: (option) => fetch.post('/v1/ba/supplier/canGenerateAccount', option),
	    queryByparamKeys: (option) => fetch.post('/v1/edf/orgparameter/queryByparamKeys', option),
	    updateBatchByparamKey: (option) => fetch.post('/v1/edf/orgparameter/updateBatchByparamKey', option),
	    account: (option) => fetch.post('/v1/gl/account/query', {isEnable: true, isEndNode: true }),
    }
}
