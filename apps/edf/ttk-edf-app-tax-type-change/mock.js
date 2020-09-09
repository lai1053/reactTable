/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData

fetch.mock('/v1/person/findById', (option) => {
    const person = mockData.person.find(o => o.id == option.id)
    return {
        result: true,
        value: person
    }
})

fetch.mock('/v1/person/create', (option) => {
    const id = mockData.person.length
    const v = { ...option, id }
    mockData.person.push(v)

    return { result: true, value: v }
})

fetch.mock('/v1/person/update', (option) => {
    mockData.person[option.id] = option
    return { result: true, value: option }
})

fetch.mock('/v1/person/prev', (option) => {
    if (option.id) {
        const index = option.id - 1 < 0 ? 0 : option.id - 1
        return { result: true, value: mockData.person[index] }
    }

    return { result: true, value: mockData.person[mockData.person.length - 1] }
})

fetch.mock('/v1/person/next', (option) => {
    if (option.id) {
        const index = option.id + 1 > mockData.person.length - 1 ? mockData.person.length - 1 : option.id + 1
        return { result: true, value: mockData.person[index] }
    }

    return { result: true, value: mockData.person[mockData.person.length - 1] }
})