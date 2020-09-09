/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData


fetch.mock('/v1/bankaccount/findById', (option) => {
    const bankaccount = mockData.bankaccount.find(o => o.id == option.id)
    return {
        result: true,
        value: bankaccount
    }
})

fetch.mock('/v1/bankaccount/create', (option) => {
    const id = mockData.bankaccount.length + 1
    const v = { ...option, id }
    mockData.bankaccount.push(v)

    return { result: true, value: v }
})

fetch.mock('/v1/bankaccount/update', (option) => {
    mockData.bankaccount[option.id] = option
    return { result: true, value: option }
})
