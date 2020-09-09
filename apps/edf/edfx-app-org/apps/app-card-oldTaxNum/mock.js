/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData


fetch.mock('/v1/project/findById', (option) => {
    const project = mockData.project.find(o => o.id == option.id)
    return {
        result: true,
        value: project
    }
})

fetch.mock('/v1/project/create', (option) => {
    const id = mockData.project.length + 1
    const v = { ...option, id }
    mockData.project.push(v)

    return { result: true, value: v }
})

fetch.mock('/v1/project/update', (option) => {
    mockData.project[option.id] = option
    return { result: true, value: option }
})

fetch.mock('/v1/project/prev', (option) => {
    if (option.id) {
        const index = option.id - 1 < 0 ? 0 : option.id - 1
        return { result: true, value: mockData.project[index] }
    }

    return { result: true, value: mockData.project[mockData.project.length - 1] }
})

fetch.mock('/v1/project/next', (option) => {
    if (option.id) {
        const index = option.id + 1 > mockData.project.length - 1 ? mockData.project.length - 1 : option.id + 1
        return { result: true, value: mockData.project[index] }
    }

    return { result: true, value: mockData.project[mockData.project.length - 1] }
})