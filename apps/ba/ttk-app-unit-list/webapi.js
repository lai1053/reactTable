/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
	queryList: (option) => fetch.post('/v1/edf/unit/queryList', option),
	delete: (option) => fetch.post('/v1/edf/unit/delete', option)
}
