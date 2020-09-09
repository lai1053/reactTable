/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, fetchCors} from 'edf-utils'

export default {
	ordercenter: {
        create: (option) => fetchCors.post_develop('/v1/openapi/userlevel/order/create', option, sessionStorage['_accessToken']),
		orderPay: (option) => fetch.post('/v1/edf/ordercenter/pcPayAndUpdateOrder', option),
		productList: (option) => fetch.post('/v1/edf/product/queryList', option),
		startTime: (option, callBack) => fetchCors.post_develop('/v1/openapi/userlevel/order/expireDate', option, sessionStorage['_accessToken'], false, callBack),
		validevatTaxpayerNum: (option) => fetch.post('/v1/edf/org/validevatTaxpayerNum', option),
    }
}
