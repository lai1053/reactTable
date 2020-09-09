/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'
import { debug } from 'util';

const mockData = fetch.mockData


let data = [{"id":100001,"name":"文件类型","code":"fileType"},
{"id":100002,"name":"单据状态","code":"voucherStatus"},
{"id":100003,"name":"单据类型","code":"voucherType"}
]

let lists = {
    "100001": {"list":[{"id":1000010002,"name":"word","code":"word","enumId":100001,"showOrder":0},{"id":1000010003,"name":"excel","code":"excel","enumId":100001,"showOrder":0},{"id":1000010004,"name":"ppt","code":"ppt","enumId":100001,"showOrder":0},{"id":1000010005,"name":"pdf","code":"pdf","enumId":100001,"showOrder":0},{"id":1000010006,"name":"压缩包","code":"zip","enumId":100001,"showOrder":0},{"id":1000019999,"name":"其他","code":"other","enumId":100001,"showOrder":0},{"id":1000020001,"name":"未审核","code":"NotApprove","enumId":100002,"showOrder":0},{"id":1000020002,"name":"已审核","code":"Approved","enumId":100002,"showOrder":0},{"id":1000020003,"name":"已驳回","code":"Rejected","enumId":100002,"showOrder":0},{"id":1000030001,"name":"凭证","code":"Doc","enumId":100003,"showOrder":0},{"id":1000030002,"name":"资产卡片","code":"Asset","enumId":100003,"showOrder":0},{"id":1000030003,"name":"资产处置-销售收入","code":"AssetSaleIncome","enumId":100003,"showOrder":0},{"id":1000030004,"name":"资产处置-清理费用","code":"AssetExpense","enumId":100003,"showOrder":0},{"id":1000030005,"name":"资产计提折旧","code":"AssetDepreciation","enumId":100003,"showOrder":0},{"id":1000030006,"name":"资产处置-清理","code":"AssetGoIntoLiquidation","enumId":100003,"showOrder":0},{"id":1000030007,"name":"资产处置-损益","code":"AssetlossProfit","enumId":100003,"showOrder":0},{"id":1000030008,"name":"采购单","code":"Arrival","enumId":100003,"showOrder":0},{"id":1000030009,"name":"销售单","code":"Delivery","enumId":100003,"showOrder":0},{"id":1000030010,"name":"收款单","code":"Receive","enumId":100003,"showOrder":0},{"id":1000030011,"name":"付款单","code":"Pay","enumId":100003,"showOrder":0}],"page":{"pageSize":20,"currentPage":1,"totalPage":7,"totalCount":121}},
    "100002": {"list":[{"id":1000010002,"name":"word","code":"word","enumId":100001,"showOrder":0},{"id":1000010003,"name":"excel","code":"excel","enumId":100001,"showOrder":0},{"id":1000010004,"name":"ppt","code":"ppt","enumId":100001,"showOrder":0},{"id":1000010005,"name":"pdf","code":"pdf","enumId":100001,"showOrder":0},{"id":1000010006,"name":"压缩包","code":"zip","enumId":100001,"showOrder":0},{"id":1000019999,"name":"其他","code":"other","enumId":100001,"showOrder":0},{"id":1000020001,"name":"未审核","code":"NotApprove","enumId":100002,"showOrder":0},{"id":1000020002,"name":"已审核","code":"Approved","enumId":100002,"showOrder":0},{"id":1000020003,"name":"已驳回","code":"Rejected","enumId":100002,"showOrder":0},{"id":1000030001,"name":"凭证","code":"Doc","enumId":100003,"showOrder":0},{"id":1000030002,"name":"资产卡片","code":"Asset","enumId":100003,"showOrder":0},{"id":1000030003,"name":"资产处置-销售收入","code":"AssetSaleIncome","enumId":100003,"showOrder":0},{"id":1000030004,"name":"资产处置-清理费用","code":"AssetExpense","enumId":100003,"showOrder":0},{"id":1000030005,"name":"资产计提折旧","code":"AssetDepreciation","enumId":100003,"showOrder":0},{"id":1000030006,"name":"资产处置-清理","code":"AssetGoIntoLiquidation","enumId":100003,"showOrder":0},{"id":1000030007,"name":"资产处置-损益","code":"AssetlossProfit","enumId":100003,"showOrder":0},{"id":1000030008,"name":"采购单","code":"Arrival","enumId":100003,"showOrder":0},{"id":1000030009,"name":"销售单","code":"Delivery","enumId":100003,"showOrder":0},{"id":1000030010,"name":"收款单","code":"Receive","enumId":100003,"showOrder":0},{"id":1000030011,"name":"付款单","code":"Pay","enumId":100003,"showOrder":0}],"page":{"pageSize":20,"currentPage":1,"totalPage":1,"totalCount":12}},
    "100003": {"list":[{"id":1000010002,"name":"word","code":"word","enumId":100001,"showOrder":0},{"id":1000010003,"name":"excel","code":"excel","enumId":100001,"showOrder":0},{"id":1000010004,"name":"ppt","code":"ppt","enumId":100001,"showOrder":0},{"id":1000010005,"name":"pdf","code":"pdf","enumId":100001,"showOrder":0},{"id":1000010006,"name":"压缩包","code":"zip","enumId":100001,"showOrder":0},{"id":1000019999,"name":"其他","code":"other","enumId":100001,"showOrder":0},{"id":1000020001,"name":"未审核","code":"NotApprove","enumId":100002,"showOrder":0},{"id":1000020002,"name":"已审核","code":"Approved","enumId":100002,"showOrder":0},{"id":1000020003,"name":"已驳回","code":"Rejected","enumId":100002,"showOrder":0},{"id":1000030001,"name":"凭证","code":"Doc","enumId":100003,"showOrder":0},{"id":1000030002,"name":"资产卡片","code":"Asset","enumId":100003,"showOrder":0},{"id":1000030003,"name":"资产处置-销售收入","code":"AssetSaleIncome","enumId":100003,"showOrder":0},{"id":1000030004,"name":"资产处置-清理费用","code":"AssetExpense","enumId":100003,"showOrder":0},{"id":1000030005,"name":"资产计提折旧","code":"AssetDepreciation","enumId":100003,"showOrder":0},{"id":1000030006,"name":"资产处置-清理","code":"AssetGoIntoLiquidation","enumId":100003,"showOrder":0},{"id":1000030007,"name":"资产处置-损益","code":"AssetlossProfit","enumId":100003,"showOrder":0},{"id":1000030008,"name":"采购单","code":"Arrival","enumId":100003,"showOrder":0},{"id":1000030009,"name":"销售单","code":"Delivery","enumId":100003,"showOrder":0},{"id":1000030010,"name":"收款单","code":"Receive","enumId":100003,"showOrder":0},{"id":1000030011,"name":"付款单","code":"Pay","enumId":100003,"showOrder":0}],"page":{"pageSize":20,"currentPage":1,"totalPage":7,"totalCount":121}}
}
window.data = data

fetch.mock('/v1/edf/enum/queryAll', () => {
    const res = {
        result: true, 
        value: data
    }
    return res
 })

fetch.mock('/v1/edf/enumDetail/queryPageList', (option) => {
    return {
        result: true,
        value: lists[option.entity.columnId]
    }
})

fetch.mock('/v1/edf/columnDetail/query', (option) => {
    initEnum()
    return mockData.enumTypes
})

fetch.mock('/v1/edf/columnDetail/query', (option) => {
    return query(option)
})

function query(option) {
    initEnum()

    const { pagination, filter } = option

    var data = mockData.enum

    if (filter) {
        if (filter.type) {
            data = data.other.filter(o => {
                return o.type.toString().substr(0, filter.type.toString().length) == filter.type
            })
        }

    }

    var current = pagination.current
    var pageSize = pagination.pageSize
    var start = (current - 1) * pageSize
    var end = current * pageSize

    start = start > data.length - 1 ? 0 : start
    end = start > data.length - 1 ? pageSize : end
    current = start > data.length - 1 ? 1 : current

    var ret = {
        result: true,
        value: {
            pagination: { current, pageSize, total: data.length },
            list: []
        }
    }
    for (let j = start; j < end; j++) {
        if (data[j])
            ret.value.list.push(data[j])
    }

    return ret
}


fetch.mock('/v1/edf/columnDetail/del', (option) => {
    const del = (types) => {
        types.forEach((t, index) => {
            if (t.id == option.id) {
                types.splice(index, 1)
                return true
            } else if (t.children) {
                del(t.children)
            }
        })
    }
    del(mockData.enumTypes)

    return { result: true, value: true }
})


fetch.mock('/v1/edf/enum/del', (option) => {
    option.ids.forEach(id => {
        let index = mockData.enum.findIndex(o => o.id == id)
        
        if (index || index === 0)
            mockData.enum.splice(index, 1)
    })

    return { result: true, value: true }
})

fetch.mock('/v1/edf/enum/create', option => {
    const result = {
        id: 1 + parseInt(Math.random()*10000),
        name: option.name,
        code: option.code
    }
    data.push(result)
    lists[result.id] = {
        list: [],
        page: {"pageSize":20,"currentPage":1,"totalPage":7,"totalCount":121}
    }
    return {
        result: true, 
        value: {}
    }
})

fetch.mock('/v1/edf/enum/findById', (id) => {
    const node = data.find(item => item.id == id)
    return { result: true, value: JSON.parse(JSON.stringify(node)) }
})

fetch.mock('/v1/edf/enum/update', (option) => {
    const node = data.findIndex(item => item.id == option.id)
    data[node].code = option.code
    data[node].name = option.name
    return { result: true, value: JSON.parse(JSON.stringify(data[node])) }
})


fetch.mock('/v1/edf/enum/delete', (option) => {
    const res = data.find(item => item.id == option.id)
    data = data.filter(item => item.id != option.id)
    return { result: true, value: {id: option.id} }
})


// fetch.mock('/v1/edf/enumDetail/create', (option) => {
//     const id = mockData.enumDetail.length
//     const v = { ...option, id }
//     mockData.enumDetail.push(v)
//     return { result: true, value: v }
// })

fetch.mock('/v1/edf/enumDetail/create', (option) => {
    const res = {
        "id": parseInt(Math.random() * 1000),
        "name": option.name,
        "code": option.code,
        "enumId": option.enumId
    }
    lists[option.enumId].list.push(res)
    return { result: true, value: res }
})


fetch.mock('/v1/edf/enumDetail/create', (option) => {
    const res = {
        "id": parseInt(Math.random() * 1000),
        "name": option.name,
        "code": option.code,
        "enumId": option.enumId
    }
    lists[option.enumId].list.push(res)
    return { result: true, value: res }
})

fetch.mock('/v1/edf/enumDetail/update', (option)=> {
    let list = lists[option.enumId].list
    for(let i = 0 ; i < list.length; i++) {
        if(option.id == list[i].id) {
            Object.assign(list[i], option)
        }
    }
    return { result: true, value: {} }
})

fetch.mock('/v1/edf/enumDetail/batchDelete', (option)=> {
    for(let i = 0 ; i < option.ids.length; i++) {
        for(let j in lists) {
            for(let k = 0 ; k < lists[j].list.length ; k++) {
                if(lists[j].list[k].id == option.ids[i]) {
                    lists[j].list.splice(k, 1)
                }
            }
        }
    }
    return {
        result: true,
        value: {}
    }
    return { result: true, value: {} }
})