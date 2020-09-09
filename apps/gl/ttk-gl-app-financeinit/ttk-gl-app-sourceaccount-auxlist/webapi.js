/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'
export default {
	financeinit: {
		/**
		* 查询Excel中的辅助数据
		* 入参{"id":5057466989480960}
		   返回：{ "showCode": true,
				   "auxDataList": [
					   {
						   "accountCode": "410101_001_002_003_004_005_006",
						   "accountName": "    办公用品及办公费_客户_供应商_人员_项目_部门_存货 个",
						   "balanceName": "借"
					   }
				   ]}
		*/
		queryExcelAux: (option) => fetch.post('/v1/gl/accountPeriodBegin/queryExcelAux', option)		
	}
}