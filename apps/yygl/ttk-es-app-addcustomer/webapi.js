/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    customer: {
    	getCode: () => fetch.post('/v1/ba/basearchive/getAutoCode', { archiveName: 'ba_customer' }),
        query: (id) => fetch.post('/v1/yygl/khzl/queryById', id),
        create: (option) => fetch.post('/v1/yygl/khzl/create', option),
        update: (option) => fetch.post('/v1/yygl/khzl/edit', option),
        queryList: (option) => fetch.post('/v1/ba/customer/queryList', option),
	    canGenerateAccount: (option) => fetch.post('/v1/ba/customer/canGenerateAccount', option),
	    queryByparamKeys: (option) => fetch.post('/v1/edf/orgparameter/queryByparamKeys', option),
	    updateBatchByparamKey: (option) => fetch.post('/v1/edf/orgparameter/updateBatchByparamKey', option),
	    account: (option) => fetch.post('/v1/gl/account/query', {isEnable: true, isEndNode: true }),
        batchQuery: (option) => fetch.post('/v1/edf/enumDetail/batchQuery', option),
        findByEnumId: (option) => fetch.post('/v1/edf/enumDetail/findByEnumId', option),
        areaQuery: (option) => fetch.post('/v1/edf/area/query', option),
        allTypeQuery:(option) => fetch.post('/v1/edf/enumDetail/batchQuery',option)
    },
    /*************************CA证书 begin*************************/
    CAState: {
        queryCAState: (option) => fetch.post('/v1/edf/dlxxca4proxy/isExistCa',option),
        getToolUrl: () => fetch.post('/v1/edf/org/getDownloadUrl'),
        getImportid: () => fetch.post('/v1/yygl/khzl/getOrgId'),
        queryCAName: (option) => fetch.post('/v1/yygl/khzl/queryCA',option),
        queryisCA:(option) => fetch.post('/v1/yygl/khzl/edfDlxxCaExistCa',option)
    },
    /*************************CA证书 end*************************/


    /*************************江西手机验证码 start*********************************/

    JXCode: {
        queryCode:(option) => fetch.post('/v1/edf/org/getYzm',option)
    }
    /*************************江西手机验证码 end*********************************/
}
