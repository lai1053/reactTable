/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData


let db =  [{"id":100001,"code":"menuList","name":"菜单栏目方案","isDefault":true},
    {"id":510004,"code":"assetDepreciationList","name":"资产折旧","isDefault":true},
    {"id":510005,"code":"assetDispositionList","name":"已处置资产","isDefault":true}]

//查询左树数据
fetch.mock('/v1/edf/columnPreset/queryConvert', (option) => {
     return {
        result: true,
        value: db
     }
 })

function query(option) {
    initColumn()

    const { pagination, filter } = option

    var data = mockData.column

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


fetch.mock('/v1/edf/column/create', (option) => {
    console.log(option)
    const res = {
        "orgId": 4372210492535808,
        "id": parseInt(Math.random()*10000000000000000),
        "code": option.code,
        "name": option.name,
        "isDefault": option.isDefault == 0 ? false : true,
        "userId": 4372210486703104,
        "ts": "2018-04-17 09:06:48.0",
        "createTime": "2018-04-17 09:06:48",
        "updateTime": "2018-04-17 09:06:48"
    }
    db.push(res)
    return { result: true, value: res }
})

fetch.mock('/v1/edf/column/findById', (id) => {
    const node = db.find(item => item.id == id)
    return { result: true, value: node }
})

fetch.mock('/v1/edf/columnPreset/deleteBatch', (option) => {
    db = db.filter(item => item.id != option[0].id)
    return {
        result: true, value: {}
    }
})


fetch.mock('/v1/edf/column/update', (option) => {
    console.log(option)
    const index = db.findIndex(item => item.id == option.id)
    db[index] = {
        ...db[index],
        name: option.name,
        code: option.code,
        isDefault: option.isDefault == 1 ? true : false
    }
    return { result: true, value: {} }
})

fetch.mock('/v1/edf/columnType/del', (option) => {
    console.log(option)
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
    del(mockData.columnTypes)

    return { result: true, value: true }
})


fetch.mock('/v1/edf/column/del', (option) => {
    option.ids.forEach(id => {
        let index = mockData.column.findIndex(o => o.id == id)
        
        if (index || index === 0)
            mockData.column.splice(index, 1)
    })

    return { result: true, value: true }
})

fetch.mock('/v1/edf/columnDetail/create', ({form, typeId}) => {
    const index = db.findIndex(item => item.id == typeId)
    if( !db[index].data ){
        db[index].data = []
    }
    db[index].data.push({...form, id: Math.floor(Math.random()*100000000000000)})
    return { result: true, value: {} }
})

fetch.mock('/v1/edf/columnDetailPreset/deleteBatch', (option) => {
    for(let i = 0 ; i < option.length; i++) {
        option[i].id
        for(let j in list) {
            for(let k = 0 ; k < list[j].list.length ; k++) {
                if(list[j].list[k].id == option[i].id) {
                    list[j].list.splice(k, 1)
                }
            }
        }
    }
    return {
        result: true,
        value: {}
    }
})

fetch.mock('/v1/edf/columnDetail/batchUpdate', (option) => {
    return {
        result: true,
        value: {}
    }
})
//列表表头
fetch.mock('/v1/edf/columnDetail/findByColumnCode', (option) => {
    return {
        "result": true,
        "value": [{"id":10000400001,"columnId":100004,"fieldName":"fieldName","caption":"字段名称","idFieldType":1000040001,"width":100,"idAlignType":1000050002,"colIndex":1,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":true,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040001,"name":"字符","code":"string","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400002,"columnId":100004,"fieldName":"caption","caption":"字段标题","idFieldType":1000040001,"width":90,"idAlignType":1000050002,"colIndex":2,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":true,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040001,"name":"字符","code":"string","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400003,"columnId":100004,"fieldName":"fieldType","caption":"字段类型","idFieldType":1000040005,"width":70,"idAlignType":1000050002,"colIndex":3,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":false,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040005,"name":"枚举","code":"enum","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400004,"columnId":100004,"fieldName":"width","caption":"宽度","idFieldType":1000040002,"width":50,"defPrecision":0,"idAlignType":1000050002,"colIndex":4,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":false,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040002,"name":"数值","code":"decimal","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400005,"columnId":100004,"fieldName":"defPrecision","caption":"默认精度","idFieldType":1000040002,"width":50,"defPrecision":0,"idAlignType":1000050002,"colIndex":5,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":false,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040002,"name":"数值","code":"decimal","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400006,"columnId":100004,"fieldName":"alignType","caption":"对齐方式","idFieldType":1000040005,"width":70,"idAlignType":1000050002,"colIndex":6,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":false,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040005,"name":"枚举","code":"enum","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400007,"columnId":100004,"fieldName":"colIndex","caption":"显示顺序","idFieldType":1000040002,"width":50,"defPrecision":0,"idAlignType":1000050002,"colIndex":7,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":false,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040002,"name":"数值","code":"decimal","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400008,"columnId":100004,"fieldName":"orderMode","caption":"排序方式","idFieldType":1000040005,"width":70,"idAlignType":1000050002,"colIndex":8,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":false,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040005,"name":"枚举","code":"enum","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400009,"columnId":100004,"fieldName":"isFixed","caption":"是否固定列","idFieldType":1000040004,"width":50,"idAlignType":1000050002,"colIndex":9,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":false,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040004,"name":"布尔","code":"boolean","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400010,"columnId":100004,"fieldName":"isVisible","caption":"是否显示","idFieldType":1000040004,"width":50,"idAlignType":1000050002,"colIndex":10,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":false,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040004,"name":"布尔","code":"boolean","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400011,"columnId":100004,"fieldName":"isMustSelect","caption":"是否必选","idFieldType":1000040004,"width":50,"idAlignType":1000050002,"colIndex":11,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":false,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040004,"name":"布尔","code":"boolean","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}},{"id":10000400012,"columnId":100004,"fieldName":"isSystem","caption":"是否系统字段","idFieldType":1000040004,"width":70,"idAlignType":1000050002,"colIndex":12,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":false,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040004,"name":"布尔","code":"boolean","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}}]
    }
})
//查询列表数据
fetch.mock('/v1/edf/columnDetailPreset/queryPageList', (option) => {
    return {
        result: true,
        value: list[option.entity.columnId]
    }
})
let list = {
    "100001": {"list":[{"id":10000200001,"columnId":100002,"fieldName":"code","caption":"编码","idFieldType":1000040001,"width":200,"defPrecision":0,"idAlignType":1000050002,"colIndex":1,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":true,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040001,"name":"字符","code":"string","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}}],"page":{"pageSize":20,"currentPage":1,"totalPage":7,"totalCount":121}},
    "510004": {"list":[{"id":51000400001,"columnId":510004,"fieldName":"seq","caption":"序号","idFieldType":1000040001,"width":100,"idAlignType":1000050001,"colIndex":1,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":true,"isSystem":false,"isHeader":true,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040001,"name":"字符","code":"string","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050001,"name":"左对齐","code":"01","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}}],"page":{"pageSize":20,"currentPage":1,"totalPage":1,"totalCount":12}},
    "510005": {"list":[{"id":10000100001,"columnId":100001,"fieldName":"code","caption":"编号","idFieldType":1000040001,"width":200,"defPrecision":0,"idAlignType":1000050002,"colIndex":1,"idOrderMode":1000060001,"isFixed":false,"isVisible":true,"isMustSelect":true,"isSystem":false,"isHeader":false,"isTotalColumn":false,"fieldTypeDTO":{"id":1000040001,"name":"字符","code":"string","enumId":100004,"showOrder":0},"alignTypeDTO":{"id":1000050002,"name":"居中对齐","code":"02","enumId":100005,"showOrder":0},"orderModeDTO":{"id":1000060001,"name":"升序","code":"01","enumId":100006,"showOrder":0}}],"page":{"pageSize":20,"currentPage":1,"totalPage":7,"totalCount":121}}
}

mockData.columnPreset = {
    tree: db,
    list: list
}