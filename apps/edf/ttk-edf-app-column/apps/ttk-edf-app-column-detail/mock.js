/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData

//add
fetch.mock('/v1/edf/columnDetailPreset/create', (option) => {
    let lists = mockData.columnPreset.list[option.columnId].list
    option.id = parseInt(Math.random() * 1000000)
    let item = {"id":10000200001,"columnId":100002,"fieldName":"code","caption":"编码","idFieldType":1000040001,"width":200,"defPrecision":0,"idAlignType":1000050002,"colIndex":1,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":true,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040001,"name":"字符","code":"string","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}}
    Object.assign(item, option)
    lists.push(item)
    return {
        result: true,
    }
})
//modity
fetch.mock('/v1/edf/columnDetailPreset/update', (option) => {
    let lists = mockData.columnPreset.list[option.columnId].list
    let item = lists.find((o) => {
        return option.id == o.id
    })
    Object.assign(item, option)
    return {
        result: true
    }
})
//enum
fetch.mock('/v1/edf/enumDetail/batchQuery', (option) => {
    return { 
            "result": true, 
            "value": { 
                "100004": [{ "id": 1000040001, "name": "字符", "code": "string" }, { "id": 1000040002, "name": "数值", "code": "decimal" }, { "id": 1000040003, "name": "日期", "code": "datatime" }, { "id": 1000040004, "name": "布尔", "code": "boolean" }, { "id": 1000040005, "name": "枚举", "code": "enum" }], 
                "100005": [{ "id": 1000050001, "name": "左对齐", "code": "01" }, { "id": 1000050003, "name": "右对齐", "code": "03" }, { "id": 1000050002, "name": "居中对齐", "code": "02" }], 
                "100006": [{ "id": 1000060001, "name": "升序", "code": "01" }, { "id": 1000060002, "name": "降序", "code": "02" }] 
            } 
        }
})