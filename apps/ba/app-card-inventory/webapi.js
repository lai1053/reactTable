/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    inventory: {
	    revenueType: (option) => fetch.post('/v1/biz/core/businessType/queryRevenueType',option),
	    queryData: (option) => fetch.post('/v1/ba/inventory/findEnumList',option),
	    getCode: () => fetch.post('/v1/ba/basearchive/getAutoCode', { archiveName: 'ba_inventory' }),
        query: (id) => fetch.post('/v1/ba/inventory/query', { id }),
        //findById: (id) => fetch.post('/v1/currency/findById', { id }),
        create: (option) => fetch.post('/v1/ba/inventory/create', option),
        update: (option) => fetch.post('/v1/ba/inventory/update', option),
        //queryDict: () => fetch.get('/v1/bankType')
        taxClassification: (option) => fetch.post('/v1/ba/inventoryTaxClassification/queryByKey', option),
	    inventoryIsUsed: (option) => fetch.post('/v1/biz/scm/st/rdrecord/inventoryIsUsed', option),
        queryList: (option) => fetch.post('/v1/ba/inventory/queryList', option),
	    account: (option) => fetch.post('/v1/gl/account/query', {isEnable: true, isEndNode: true }),
        isApplied2Fin: (option) => fetch.post('/v1/ba/inventory/isApplied2Fin', option),

    },
	unit: {
		query: () => fetch.post('v1/ba/unit/queryList'),
	},
	queryByparamKeys: (option) => fetch.post('/v1/edf/orgparameter/queryByparamKeys', option),
}
