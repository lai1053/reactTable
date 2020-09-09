/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData


fetch.mock('/v1/biz/invoice/xxfp/batchUpdateXxfp', (option) => {
    const a = parseInt(Math.random() * 10);
    if (a > 5) {
        return { result: true, value: {} }
    }
    return { result: false, value: {}, error: { code: '504', message: '接口不可用' } }
})