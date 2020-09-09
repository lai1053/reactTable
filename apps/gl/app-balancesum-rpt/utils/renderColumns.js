
import React from 'react'
function initColumn(columns, type, ...params) {
    let resColumn = []
    const colSapnArray = ['accountCode', 'accountName', 'unitName', 'currencyName']
    if (!columns || columns.length < 1) return resColumn
    // 先插入一级节点  
    
    columns.forEach(item => {
        if (!item.fieldParentName) {
            let data
            if (item.fieldName == 'accountCode') {
                data = {
                    'title': item.fieldTitle,
                    'name': item.fieldName,
                    'dataIndex': item.fieldName,
                    'key': item.fieldName,
                    'width': 80,
                    'render': params[0]
                }
            } else if (item.fieldName == 'accountName') {
                data = {
                    'title': item.fieldTitle,
                    'name': item.fieldName,
                    'dataIndex': item.fieldName,
                    'key': item.fieldName,

                    'render': params[1]
                }
                if (type != 'defalut') {
                    data['width'] = 198
                }
            } else {
                if (colSapnArray.indexOf(item.fieldName) > 0) {
                    data = {
                        'title': item.fieldTitle,
                        'name': item.fieldName,
                        'dataIndex': item.fieldName,
                        'key': item.fieldName,
                        'render': params[2]
                    }
                } else {
                    data = {
                        'title': item.fieldTitle,
                        'name': item.fieldName,
                        'dataIndex': item.fieldName,
                        'key': item.fieldName,
                        'render': params[3]
                    }
                }
            }
            resColumn.push(data)
        }
    })

    resColumn.forEach(item => {
        let childData = []
        columns.forEach(x => {
            if (x.fieldParentName && x.fieldParentName === item.name) {
                
                let data = {
                    'title': x.fieldTitle,
                    'name': x.fieldName,
                    'dataIndex': x.fieldName,
                    'className': 'amountColumnStyle',
                    'key': x.fieldName,
                    'width': 108,
                    'render': params[3]
                }
                childData.push(data)
            }
        })
        if (childData && childData.length > 0)
            item.children = childData
    })
    return resColumn
}

export default function renderColumns(type, ...params) {
    const columns = {
        Defalut: [
            { fieldName: 'accountCode', fieldTitle: '科目编码', fieldParentName: null },
            { fieldName: 'accountName', fieldTitle: '科目名称', fieldParentName: null },
            { fieldName: 'periodBegin', fieldTitle: '期初余额', fieldParentName: null },
            { fieldName: 'periodBeginAmountDr', fieldTitle: '借方', fieldParentName: 'periodBegin' },
            { fieldName: 'periodBeginAmountCr', fieldTitle: '贷方', fieldParentName: 'periodBegin' },
            { fieldName: 'currentAmount', fieldTitle: '本期发生额', fieldParentName: null },
            { fieldName: 'amountDr', fieldTitle: '借方', fieldParentName: 'currentAmount' },
            { fieldName: 'amountCr', fieldTitle: '贷方', fieldParentName: 'currentAmount' },
            { fieldName: 'yearAmount', fieldTitle: '本年累计发生额', fieldParentName: null },
            { fieldName: 'yearAmountDr', fieldTitle: '借方', fieldParentName: 'yearAmount' },
            { fieldName: 'yearAmountCr', fieldTitle: '贷方', fieldParentName: 'yearAmount' },
            { fieldName: 'periodEnd', fieldTitle: '期末余额', fieldParentName: null },
            { fieldName: 'periodEndAmountDr', fieldTitle: '借方', fieldParentName: 'periodEnd' },
            { fieldName: 'periodEndAmountCr', fieldTitle: '贷方', fieldParentName: 'periodEnd' }
        ],
        currencyColumn: [
            { fieldName: 'accountCode', fieldTitle: '科目编码', fieldParentName: null },
            { fieldName: 'accountName', fieldTitle: '科目名称', fieldParentName: null },
            { fieldName: 'currencyName', fieldTitle: '币种', fieldParentName: null },
            { fieldName: 'periodBegin', fieldTitle: '期初余额', fieldParentName: null },
            { fieldName: 'periodBeginOrigAmountDr', fieldTitle: '借方原币', fieldParentName: 'periodBegin' },
            { fieldName: 'periodBeginAmountDr', fieldTitle: '借方本币', fieldParentName: 'periodBegin' },
            { fieldName: 'periodBeginOrigAmountCr', fieldTitle: '贷方原币', fieldParentName: 'periodBegin' },
            { fieldName: 'periodBeginAmountCr', fieldTitle: '贷方本币', fieldParentName: 'periodBegin' },

            { fieldName: 'currentAmount', fieldTitle: '本期发生额', fieldParentName: null },
            { fieldName: 'origAmountDr', fieldTitle: '借方原币', fieldParentName: 'currentAmount' },
            { fieldName: 'amountDr', fieldTitle: '借方本币', fieldParentName: 'currentAmount' },
            { fieldName: 'origAmountCr', fieldTitle: '贷方原币', fieldParentName: 'currentAmount' },
            { fieldName: 'amountCr', fieldTitle: '贷方本币', fieldParentName: 'currentAmount' },

            { fieldName: 'periodEndAmount', fieldTitle: '期末余额', fieldParentName: null },
            { fieldName: 'periodEndOrigAmountDr', fieldTitle: '借方原币', fieldParentName: 'periodEndAmount' },
            { fieldName: 'periodEndAmountDr', fieldTitle: '借方本币', fieldParentName: 'periodEndAmount' },
            { fieldName: 'periodEndOrigAmountCr', fieldTitle: '贷方原币', fieldParentName: 'periodEndAmount' },
            { fieldName: 'periodEndAmountCr', fieldTitle: '贷方本币', fieldParentName: 'periodEndAmount' }
        ],
        quantityColumn: [
            { fieldName: 'accountCode', fieldTitle: '科目编码', fieldParentName: null },
            { fieldName: 'accountName', fieldTitle: '科目名称', fieldParentName: null },
            { fieldName: 'unitName', fieldTitle: '单位', fieldParentName: null },
            { fieldName: 'periodBegin', fieldTitle: '期初余额', fieldParentName: null },
            { fieldName: 'periodBeginQuantity', fieldTitle: '数量', fieldParentName: 'periodBegin' },
            { fieldName: 'periodBeginPrice', fieldTitle: '单价', fieldParentName: 'periodBegin' },
            { fieldName: 'periodBeginAmountDr', fieldTitle: '借方', fieldParentName: 'periodBegin' },
            { fieldName: 'periodBeginAmountCr', fieldTitle: '贷方', fieldParentName: 'periodBegin' },
            { fieldName: 'currentAmount', fieldTitle: '本期发生额', fieldParentName: null },
            { fieldName: 'quantityDr', fieldTitle: '入库数量', fieldParentName: 'currentAmount' },
            { fieldName: 'amountDr', fieldTitle: '入库金额', fieldParentName: 'currentAmount' },
            { fieldName: 'quantityCr', fieldTitle: '出库数量', fieldParentName: 'currentAmount' },
            { fieldName: 'amountCr', fieldTitle: '出库金额', fieldParentName: 'currentAmount' },
            { fieldName: 'periodEndAmount', fieldTitle: '期末余额', fieldParentName: null },
            { fieldName: 'periodEndQuantity', fieldTitle: '数量', fieldParentName: 'periodEndAmount' },
            { fieldName: 'periodEndPrice', fieldTitle: '单价', fieldParentName: 'periodEndAmount' },
            { fieldName: 'periodEndAmountDr', fieldTitle: '借方', fieldParentName: 'periodEndAmount' },
            { fieldName: 'periodEndAmountCr', fieldTitle: '贷方', fieldParentName: 'periodEndAmount' }

        ],
        quantityCurrencyColumn: [
            { fieldName: 'accountCode', fieldTitle: '科目编码', fieldParentName: null },
            { fieldName: 'accountName', fieldTitle: '科目名称', fieldParentName: null },
            { fieldName: 'unitName', fieldTitle: '单位', fieldParentName: null },
            { fieldName: 'currencyName', fieldTitle: '币种', fieldParentName: null },
            { fieldName: 'periodBegin', fieldTitle: '期初余额', fieldParentName: null },
            { fieldName: 'periodBeginQuantity', fieldTitle: '数量', fieldParentName: 'periodBegin' },
            { fieldName: 'periodBeginOrigPrice', fieldTitle: '单价', fieldParentName: 'periodBegin' },
            { fieldName: 'periodBeginOrigAmountDr', fieldTitle: '借方', fieldParentName: 'periodBegin' },
            { fieldName: 'periodBeginOrigAmountCr', fieldTitle: '贷方', fieldParentName: 'periodBegin' },
            { fieldName: 'currentAmount', fieldTitle: '本期发生额', fieldParentName: null },
            { fieldName: 'quantityDr', fieldTitle: '入库数量', fieldParentName: 'currentAmount' },
            { fieldName: 'origAmountDr', fieldTitle: '入库金额', fieldParentName: 'currentAmount' },
            { fieldName: 'quantityCr', fieldTitle: '出库数量', fieldParentName: 'currentAmount' },
            { fieldName: 'origAmountCr', fieldTitle: '出库金额', fieldParentName: 'currentAmount' },
            { fieldName: 'periodEndAmount', fieldTitle: '期末余额', fieldParentName: null },
            { fieldName: 'periodEndQuantity', fieldTitle: '数量', fieldParentName: 'periodEndAmount' },
            { fieldName: 'periodEndOrigPrice', fieldTitle: '单价', fieldParentName: 'periodEndAmount' },
            { fieldName: 'periodEndOrigAmountDr', fieldTitle: '借方', fieldParentName: 'periodEndAmount' },
            { fieldName: 'periodEndOrigAmountCr', fieldTitle: '贷方', fieldParentName: 'periodEndAmount' }
        ]
    }
    if (type == 'defalut') {
        return initColumn(columns.Defalut, type, ...params)
    }
    if (type == 'currency') {
        return initColumn(columns.currencyColumn, type, ...params)
    }
    if (type == 'quantity') {
        return initColumn(columns.quantityColumn, type, ...params)
    }
    if (type == 'quantityCurrency') {
        return initColumn(columns.quantityCurrencyColumn, type, ...params)
    }
}