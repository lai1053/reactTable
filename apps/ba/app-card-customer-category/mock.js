/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData


fetch.mock('/v1/customer/findById', (option) => {
    const customer = mockData.customer.find(o => o.id == option.id)
    return {
        result: true,
        value: customer
    }
})

fetch.mock('/v1/customer/create', (option) => {
    const id = mockData.customer.length + 1
    const v = { ...option, id }
    mockData.customer.push(v)

    return { result: true, value: v }
})

fetch.mock('/v1/customer/update', (option) => {
    mockData.customer[option.id] = option
    return { result: true, value: option }
})

fetch.mock('/v1/customer/prev', (option) => {
    if (option.id) {
        const index = option.id - 1 < 0 ? 0 : option.id - 1
        return { result: true, value: mockData.customer[index] }
    }

    return { result: true, value: mockData.customer[mockData.customer.length - 1] }
})

fetch.mock('/v1/customer/next', (option) => {
    if (option.id) {
        const index = option.id + 1 > mockData.customer.length - 1 ? mockData.customer.length - 1 : option.id + 1
        return { result: true, value: mockData.customer[index] }
    }

    return { result: true, value: mockData.customer[mockData.customer.length - 1] }
})