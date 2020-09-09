/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'


fetch.mock('/v1/web/dz/home/getCustomerStatusList', (option)=>{
    return {
        "result": true,
        "value": {
            "customeStatusList": [{
                "orgId": 5572608279437312,
                "orgName": "优合美味餐饮有限公司",
                "accountDate": "2018-10",
                "receiptStatus": 1,
                "accountStatus": 1,
                "taxStatus": 4,
                "dunStatus": 1,
                "status": 1,
                "industry": 3
            }, {
                "orgId": 5567715422298112,
                "orgName": "1233",
                "accountDate": "2018-10",
                "receiptStatus": 1,
                "accountStatus": 1,
                "taxStatus": 4,
                "dunStatus": 1,
                "status": 1,
                "industry": 1
            }, {
                "orgId": 5555668516468736,
                "orgName": "新建客户01",
                "accountDate": "2018-10",
                "receiptStatus": 1,
                "accountStatus": 1,
                "taxStatus": 4,
                "dunStatus": 1,
                "status": 1,
                "industry": 1
            }, {
                "orgId": 5550418204096512,
                "orgName": "安徽-财务代账服务有限公司",
                "accountDate": "2018-10",
                "receiptStatus": 1,
                "accountStatus": 1,
                "taxStatus": 4,
                "dunStatus": 1,
                "status": 1,
                "industry": 2
            }],
            "page": {
                "pageSize": 15,
                "currentPage": 1,
                "totalPage": 1,
                "sumCloum": 4
            }
        }
    }
})

fetch.mock('/v1/web/dz/home/getChartData', (option) => {
    return {
        "result": true,
        "value": {
            "chartData": {
                "orgCount": 4,
                "receiptCount1": 4,
                "receiptCount2": 0,
                "receiptCount3": 0,
                "acountCount1": 4,
                "acountCount2": 0,
                "acountCount3": 0,
                "taxCount1": 0,
                "taxCount2": 0,
                "taxCount3": 0,
                "taxCount4": 4,
                "dunCount1": 4,
                "dunCount2": 0,
                "dunCount3": 0
            },
            "customeStatusList": [{
                "orgId": 5572608279437312,
                "orgName": "优合美味餐饮有限公司",
                "accountDate": "2018-10",
                "receiptStatus": 1,
                "accountStatus": 1,
                "taxStatus": 4,
                "dunStatus": 1,
                "status": 1,
                "industry": 3
            }, {
                "orgId": 5567715422298112,
                "orgName": "1233",
                "accountDate": "2018-10",
                "receiptStatus": 1,
                "accountStatus": 1,
                "taxStatus": 4,
                "dunStatus": 1,
                "status": 1,
                "industry": 1
            }, {
                "orgId": 5555668516468736,
                "orgName": "新建客户01",
                "accountDate": "2018-10",
                "receiptStatus": 1,
                "accountStatus": 1,
                "taxStatus": 4,
                "dunStatus": 1,
                "status": 1,
                "industry": 1
            }, {
                "orgId": 5550418204096512,
                "orgName": "安徽-财务代账服务有限公司",
                "accountDate": "2018-10",
                "receiptStatus": 1,
                "accountStatus": 1,
                "taxStatus": 4,
                "dunStatus": 1,
                "status": 1,
                "industry": 2
            }],
            "page": {
                "pageSize": 15,
                "currentPage": 1,
                "totalPage": 1,
                "sumCloum": 4
            }
        }
    }
})
