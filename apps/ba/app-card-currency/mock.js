/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData


fetch.mock('/v1/currency/findById', (option) => {
    const currency = mockData.currency.find(o => o.id == option.id)
    return {
        result: true,
        value: currency
    }
})

fetch.mock('/v1/currency/create', (option) => {
    const id = mockData.currency.length + 1
    const v = { ...option, id }
    mockData.currency.push(v)

    return { result: true, value: v }
})

fetch.mock('/v1/currency/update', (option) => {
    mockData.currency[option.id] = option
    return { result: true, value: option }
})
