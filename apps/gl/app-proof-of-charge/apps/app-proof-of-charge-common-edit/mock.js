/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData

function initMockData() {
    //摘要
    if(!mockData.summarys){
        mockData.summarys = [{
            id: 1,
            name: '提现模板'
        },{
            id: 2,
            name: '存款模板'
        }]
    }

    //科目
    if(!mockData.accountingSubjects){
        mockData.accountingSubjects = [{
            id: 1,
            code: '1001',
            name: '库存现金'
        },{
            id:2,
            code: '100201',
            name: '银行存款-银行基本户'
        }]
    }

    //凭证
    if(!mockData.proofOfCharges){
        mockData.proofOfCharges = []
        for(let i = 0; i < 117; i++){
            mockData.proofOfCharges.push({
                id: i,
                code: ((i+1) +'').padStart(4,'0'),
                date: '2017-10-24',
                attachment: 0,
                details: [{
                    id: 1,
                    summary: '卖东西',
                    accountingSubject: mockData.accountingSubjects[0],
                    debitAmount: 100.11 + i * 50
                },{
                    id: 2,
                    summary: '买东西',
                    accountingSubject: mockData.accountingSubjects[1],
                    creditAmount: 100.11 + i * 50
                }]
            })
        }
    }
}


fetch.mock('/v1/gl/doc/init', (option) => {
    initMockData()
    return {
        result: true,
        value: {
            certificate: (option.id || option.id == 0) ? mockData.proofOfCharges.find(o => o.id == option.id) : undefined,
            summarys: mockData.summarys,
            accountingSubjects: mockData.accountingSubjects
        }
    }
})

fetch.mock('/v1/summary/query', (option) => {
    initMockData()
    return {
        result: true,
        value: mockData.summarys
    }
})

fetch.mock('/v1/accountingSubject/query', (option) => {
    initMockData()
    return {
        result: true,
        value: mockData.accountingSubjects
    }
})


fetch.mock('/v1/gl/doc/prev', (option) => {
    initMockData()
    if (!mockData.proofOfCharges || mockData.proofOfCharges.length == 0) {
        return {
            result: false,
            error: {
                message: '不存在任何单据'
            }
        }
    }

    if (!(option.id || option.id == 0)) {
        return { result: true, value: mockData.proofOfCharges[mockData.proofOfCharges.length - 1] }
    }

    const index = mockData.proofOfCharges.findIndex(o => o.id == option.id)

    if (index == 0) {
        return {
            result: false,
            error: {
                message: '已经到第一张单据'
            }
        }
    }

    return { result: true, value: mockData.proofOfCharges[index - 1] }
})


fetch.mock('/v1/gl/doc/next', (option) => {
    initMockData()

    if (!mockData.proofOfCharges || mockData.proofOfCharges.length == 0) {
        return {
            result: false,
            error: {
                message: '不存在任何存货'
            }
        }
    }

    if (!(option.id || option.id == 0)) {
        return { result: true, value: mockData.proofOfCharges[mockData.proofOfCharges.length - 1] }
    }

    const index = mockData.proofOfCharges.findIndex(o => o.id == option.id)

    if (index == mockData.proofOfCharges.length - 1) {
        return {
            result: false,
            error: {
                message: '已经到最后一张单据'
            }
        }
    }


    return { result: true, value: mockData.proofOfCharges[index + 1] }
})


fetch.mock('/v1/gl/doc/update', (option) => {
    initMockData()

    const index = mockData.proofOfCharges.findIndex(o => o.id == option.id)
    mockData.proofOfCharges.splice(index, 1, option)
    return { result: true, value: option }
})

fetch.mock('/v1/gl/doc/create', (option) => {
    initMockData()

    var maxId = 0

    mockData.proofOfCharges.forEach(o => {
        maxId = maxId > o.id ? maxId : o.id
    })

    const id = maxId + 1
    option = { ...option, id }

    mockData.proofOfCharges.push(option)

    return { result: true, value: option }
})

fetch.mock('/v1/gl/doc/audit', (option) => {
    initMockData()

    const order = mockData.proofOfCharges.find(o => o.id == option.id)
    order.isAudit = true

    return { result: true, value: order }
})

fetch.mock('/v1/gl/doc/del', (option) => {
    initMockData()

    const index = mockData.proofOfCharges.findIndex(o => o.id == option.id)
    mockData.proofOfCharges.splice(index, 1)

    if (!mockData.proofOfCharges || mockData.proofOfCharges.length == 0) {
        return {
            result: true
        }
    }

    if (mockData.proofOfCharges.length - 1 >= index) {
        return {
            result: true,
            value: mockData.proofOfCharges[index]
        }
    }
    else {
        return {
            result: true,
            value: mockData.proofOfCharges[mockData.proofOfCharges.length - 1]
        }
    }
})
