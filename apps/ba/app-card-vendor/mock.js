/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData


fetch.mock('/v1/vendor/findById', (option) => {
    const vendor = mockData.vendor.find(o => o.id == option.id)
    return {
        result: true,
        value: vendor
    }
})

fetch.mock('/v1/vendor/create', (option) => {
    const id = mockData.vendor.length + 1
    const v = { ...option, id }
    mockData.vendor.push(v)

    return { result: true, value: v }
})

fetch.mock('/v1/vendor/update', (option) => {
    mockData.vendor[option.id] = option
    return { result: true, value: option }
})
