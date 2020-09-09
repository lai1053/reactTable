/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import {fetch} from 'edf-utils'
import {deductList} from './mock_data'
const mockData = fetch.mockData

function initMockData() {
	if (!mockData.deduct) {
		mockData.deduct = {
			id: 1,
			list: deductList
		}
	}
}

// 勾选发票列表
fetch.mock('v1/biz/invoice/jxfp/queryDktjList', (option) => {
	initMockData()
	const list =!!mockData.deduct && mockData.deduct.list ? mockData.deduct.list : []
	if(!option){
		return {
			"result":true,
			"value": {
				"list": list,//.slice(0,5),
				"pageSize": 20,
				"currentPage": 1,
				"totalCount": 1,
			}
		}
	}
	let {
		pageSize,
		currentPage,
		totalPage,
		totalCount
	} = option.pageQueryVO || { pageSize:25,currentPage:1,totalPage:1,totalCount:1}
	totalCount = list.length;  // 总条数
	totalPage = Math.ceil(totalCount/pageSize)  // 总页数
	return {
		"result": true,
		"value": {
			"list": list,//.slice(pageSize*(currentPage-1),pageSize*currentPage),
			"pageSize":pageSize ,
			"currentPage":currentPage ,
			"totalPage":totalPage ,
			"totalCount":totalCount 
		}
	}
})



// 查询发票类型、勾选状态、认证类型
fetch.mock('v1/biz/invoice/jxfp/queryDktjList', ()=>{
	return {
		"result": true,
		"value":{
			"invoiceTypeList":[{id:'1',description:'增值税专用票'},
				{id:'2',description:'增值税卷式发票'},
				{id:'3',description:'二手车销售统一发票'},
				{id:'4',description:'增值税电子普通发票（通行费）'},
				{id:'5',description:'机动车销售统一发票'}
			],
			"checkStatusList": [
				{id:'1', name: '已勾选'},
				{id:'2', name: '未勾选'}
			],
			"certificStatusList": [
				{id:'1', name: '已认证'},
				{id:'2', name: '未认证'},
				{id:'3', name: '认证中'},
				{id:'4', name: '认证失败'}
			]
		}	

	}
})

// 查询发票明细
fetch.mock('v1/bovmsscan/queryInvoiceDetail', (option)=>{

	const list =!!mockData.ticket && mockData.ticket.list ? mockData.ticket.list : []
	return {
		"result": true,
		"value": list.find(f=>f.id==option.id) || {}
	}
})