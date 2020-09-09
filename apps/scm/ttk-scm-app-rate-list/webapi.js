/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch, fetchCors } from 'edf-utils'

export default {
	tplus: {
		init: (option) => fetch.post('/v1/biz/scm/st/rdrecord/queryGrossProfitRate', option),
		time: (option) => fetch.post('/v1/biz/scm/st/rdrecord/queryenabletime', option),
		exports: (option) => fetch.formPost('/v1/biz/scm/st/rdrecord/exportGrossProfitRate', option),
		print: (option) => fetch.printPost('/v1/biz/scm/st/rdrecord/printGrossProfitRate', option),
	}
}