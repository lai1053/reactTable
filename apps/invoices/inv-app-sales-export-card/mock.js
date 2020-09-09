/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData


fetch.mock('/v1/biz/invoice/xxfp/exportXxfpInSummary', (option) => {
    return { result: true, value: {} }
})
fetch.mock('/v1/biz/invoice/xxfp/exportXxfpInDetail', (option) => {
    return { result: true, value: {} }
})