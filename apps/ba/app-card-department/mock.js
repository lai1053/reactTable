/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData


fetch.mock('/v1/department/findById', (option) => {
    const department = mockData.departments.find(o => o.id == option.id)
    return {
        result: true,
        value: department
    }
})

fetch.mock('/v1/department/create', (option) => {
    const id = mockData.departments.length + 1
    const v = { ...option, id }
    mockData.departments.push(v)

    return { result: true, value: v }
})

fetch.mock('/v1/department/update', (option) => {
    mockData.departments[option.id] = option
    return { result: true, value: option }
})

fetch.mock('/v1/department/prev', (option) => {
    if (option.id) {
        const index = option.id - 1 < 0 ? 0 : option.id - 1
        return { result: true, value: mockData.departments[index] }
    }

    return { result: true, value: mockData.departments[mockData.departments.length - 1] }
})

fetch.mock('/v1/department/next', (option) => {
    if (option.id) {
        const index = option.id + 1 > mockData.departments.length - 1 ? mockData.departments.length - 1 : option.id + 1
        return { result: true, value: mockData.departments[index] }
    }

    return { result: true, value: mockData.departments[mockData.departments.length - 1] }
})