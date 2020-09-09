/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import {fetch} from 'edf-utils'
import {checkList, certificationList} from './list_data'
const mockData = fetch.mockData

function initMockData() {
	if (!mockData.ticket) {
		mockData.ticket = {
			id: 1,
			list: checkList
		}
		mockData.ticket.list=mockData.ticket.list.map(item=>({
			...item,
			"invoiceDetailList": [{
				"bill_id": 1,
				"index_no": 1,
				"goods_name": "香华实验学校食堂改造工程",
				"goods_code": "10002333344",
				"qty": "1",
				"unit_price": "340742.531531532",
				"ex_tax_amount": "340742.53",
				"tax_rate": "0.11",
				"tax_amount": "37481.68",
				"amount": "378224.21"
			}, {
				"bill_id": 1,
				"index_no": 2,
				"goods_name": "香华实验学校食堂改造工程",
				"goods_code": "10002333344",
				"qty": "1",
				"unit_price": "1",
				"ex_tax_amount": "340742.53",
				"tax_rate": "0.11",
				"tax_amount": "37481.68",
				"amount": "378224.21"
			}]

		}))
	}
}

function initCertificata(){
	if (!mockData.certificList) {
		mockData.certificList = {
			id: 1,
			list: certificationList
		}
	}
}
initMockData()
// 勾选确认列表
fetch.mock('v1/bovmsscan/queryCertificList', (option) => {
	initCertificata()
	const list =!!mockData.certificList && mockData.certificList.list ? mockData.certificList.list : []

	if(!option){
		return {
			"result":true,
			"value": {
				"list": list,//.slice(0,5),
				"pageSize":pageSize ,
				"pageNum":currentPage ,
				"totalPage":currentPage ,
				"totalCount": 50 
			}
		}
	}
	let {
		pageSize,
		currentPage,
		totalPage,
		totalCount
	} = option.pageQueryVO || { pageSize:20,currentPage:1,totalPage:1,totalCount:50}
	totalCount = list.length;  // 总条数
	totalPage = Math.ceil(totalCount/pageSize)  // 总页数
	return {
		"result": true,
		"value": {
			"list": list,//.slice(pageSize*(currentPage-1),pageSize*currentPage),
			"pageSize":pageSize ,
			"pageNum":currentPage ,
			"totalPage":currentPage ,
			"totalCount": totalCount 
		}
	}
})
// 勾选发票列表
fetch.mock('v1/bovmsscan/queryCheckList', (option) => {
	initMockData()
	const list =!!mockData.ticket && mockData.ticket.list ? mockData.ticket.list : []
	if(!option){
		return {
			"result":true,
			"value": {
				"list": list,//.slice(0,5),
				"pageSize": 20,
				"pageNum": 1,
				"totalCount": 50,
			}
		}
	}
	let {
		pageSize,
		currentPage,
		totalPage,
		totalCount
	} = option.pageQueryVO || { pageSize:20,currentPage:1,totalPage:1,totalCount:50}
	totalCount = list.length;  // 总条数
	totalPage = Math.ceil(totalCount/pageSize)  // 总页数
	return {
		"result": true,
		"value": {
			"list": list,//.slice(pageSize*(currentPage-1),pageSize*currentPage),
			"pageSize":pageSize ,
			"pageNum":currentPage ,
			"totalPage":totalPage ,
			"totalCount":totalCount 
		}
	}
})



// 查询发票类型、勾选状态、认证类型
fetch.mock('v1/bovmsscan/queryInvoiceType', ()=>{
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