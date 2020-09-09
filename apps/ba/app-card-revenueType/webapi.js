/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils';

export default {
	revenueType: {
		query: (option) => fetch.post('/v1/biz/core/businessType/queryRevenueType', option),
		set: (option) => fetch.post('/v1/ba/inventoryproperty/setRevenueType', option)
	},
	inventory: { query: (option) => fetch.post('/v1/ba/inventoryproperty/queryList', option) }
};
