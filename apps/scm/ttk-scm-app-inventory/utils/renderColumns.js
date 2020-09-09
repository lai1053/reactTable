
import React from 'react'

function initColumn(columns, ...cellArr) {
    let resColumn = [], className = ''
    let leftArr = ['specification', 'inventoryCode', 'inventoryName','propertyName'],
        centerArr = ['unitName']
    // 先插入一级节点    
    columns.forEach(item => {
        if (!item.fieldParentName) {
            className='detail_right'
            if (leftArr.indexOf(item.fieldName) > -1) className = 'detail_left'
            if (centerArr.indexOf(item.fieldName) > -1) className = 'detail_center'
            let data = {
                'title': item.fieldTitle,
                'name': item.fieldName,
                'dataIndex': item.fieldName,
                'key': item.fieldName,
                'className': className,
                'render': item.fieldName == 'inventoryName' ? cellArr[1] : cellArr[2],
                'width': item.fieldName == 'inventoryName' ? '198px' : (item.fieldName == 'specification' ? '100px' : '80px'),
            }
            resColumn.push(data)
        }
    })

    resColumn.forEach(item => {
        let childData = [], isHe = false
        let amountArr = ['periodBeginAmount', 'receiveAmount', 'temporaryEstimationAmount', 'backWashAmount', 'dispatchAmount', 'periodEndAmount', 'amount', 'rkAmount', 'recoilAmount', 'endAmount']
        //金额 2位小数 cellArr[3]
        //数量 6位小数 cellArr[0]
        columns.forEach(x => {
            if (x.fieldParentName && x.fieldParentName === item.name) {
                className='detail_right'
                if (leftArr.indexOf(x.fieldName) > -1) className = 'detail_left'
                if (centerArr.indexOf(x.fieldName) > -1) className = 'detail_center'
                let data = {
                    'title': x.fieldTitle,
                    'name': x.fieldName,
                    'dataIndex': x.fieldName,
                    'key': x.fieldName,
                    'className': className,
                    'render': x.fieldParentName === 'zgInventory' ? (x.fieldName == 'inventoryName' ? cellArr[1] : cellArr[2]) : (amountArr.indexOf(x.fieldName) > -1 ? cellArr[0] : cellArr[3])
                }
                childData.push(data)
            }
        })
        if (childData && childData.length > 0) item.children = childData
    })

    // let name = document.getElementsByClassName('name-colors').parentNode.className
    // document.getElementsByClassName('name-colors').parentNode.className = `${name} name-color`
    return resColumn
}

export default function renderColumns(accountRadioValue, ...cellArr) {
    let columns = {
        'tab1': [
            { fieldName: 'inventoryCode', fieldTitle: '存货编码', fieldParentName: null },
            { fieldName: 'inventoryName', fieldTitle: '存货名称', fieldParentName: null },
            { fieldName: 'specification', fieldTitle: '规格型号', fieldParentName: null },
            { fieldName: 'unitName', fieldTitle: '计量单位', fieldParentName: null },

            { fieldName: 'initial', fieldTitle: '期初结存', fieldParentName: null },
            { fieldName: 'periodBeginQuantity', fieldTitle: '数量', fieldParentName: 'initial' },
            { fieldName: 'periodBeginPrice', fieldTitle: '单价', fieldParentName: 'initial' },
            { fieldName: 'periodBeginAmount', fieldTitle: '金额', fieldParentName: 'initial' },

            { fieldName: 'current', fieldTitle: '本期入库', fieldParentName: null },
            { fieldName: 'receiveQuantity', fieldTitle: '数量', fieldParentName: 'current' },
            { fieldName: 'receivePrice', fieldTitle: '单价', fieldParentName: 'current' },
            { fieldName: 'receiveAmount', fieldTitle: '金额', fieldParentName: 'current' },

            { fieldName: 'temporary', fieldTitle: '暂估入库', fieldParentName: null },
            { fieldName: 'temporaryEstimationQty', fieldTitle: '数量', fieldParentName: 'temporary' },
            { fieldName: 'temporaryEstimationPrice', fieldTitle: '单价', fieldParentName: 'temporary' },
            { fieldName: 'temporaryEstimationAmount', fieldTitle: '金额', fieldParentName: 'temporary' },

            { fieldName: 'recoil', fieldTitle: '暂估回冲', fieldParentName: null },
            { fieldName: 'backWashQty', fieldTitle: '数量', fieldParentName: 'recoil' },
            { fieldName: 'backWashPrice', fieldTitle: '单价', fieldParentName: 'recoil' },
            { fieldName: 'backWashAmount', fieldTitle: '金额', fieldParentName: 'recoil' },

            { fieldName: 'treasury', fieldTitle: '本期出库', fieldParentName: null },
            { fieldName: 'dispatchQuantity', fieldTitle: '数量', fieldParentName: 'treasury' },
            { fieldName: 'dispatchPrice', fieldTitle: '单价', fieldParentName: 'treasury' },
            { fieldName: 'dispatchAmount', fieldTitle: '金额', fieldParentName: 'treasury' },

            { fieldName: 'deposit', fieldTitle: '期末结存', fieldParentName: null },
            { fieldName: 'periodEndQuantity', fieldTitle: '数量', fieldParentName: 'deposit' },
            { fieldName: 'periodEndPrice', fieldTitle: '单价', fieldParentName: 'deposit' },
            { fieldName: 'periodEndAmount', fieldTitle: '金额', fieldParentName: 'deposit' },
        ],
        'tab2': [
            // { fieldName: 'index', fieldTitle: '序号', fieldParentName: null },
            { fieldName: 'zgInventory', fieldTitle: '暂估存货', fieldParentName: null },
            { fieldName: 'propertyName', fieldTitle: '存货分类', fieldParentName: 'zgInventory' },
            { fieldName: 'inventoryCode', fieldTitle: '存货编码', fieldParentName: 'zgInventory' },
            { fieldName: 'inventoryName', fieldTitle: '存货名称', fieldParentName: 'zgInventory' },
            { fieldName: 'specification', fieldTitle: '规格型号', fieldParentName: 'zgInventory' },
            { fieldName: 'unitName', fieldTitle: '单位', fieldParentName: 'zgInventory' },

            { fieldName: 'initial', fieldTitle: '暂估期初', fieldParentName: null },
            { fieldName: 'quantity', fieldTitle: '数量', fieldParentName: 'initial' },
            { fieldName: 'price', fieldTitle: '单价', fieldParentName: 'initial' },
            { fieldName: 'amount', fieldTitle: '金额', fieldParentName: 'initial' },

            { fieldName: 'rk', fieldTitle: '本期暂估入库', fieldParentName: null },
            { fieldName: 'rkQuantity', fieldTitle: '数量', fieldParentName: 'rk' },
            { fieldName: 'rkPrice', fieldTitle: '单价', fieldParentName: 'rk' },
            { fieldName: 'rkAmount', fieldTitle: '金额', fieldParentName: 'rk' },

            { fieldName: 'recoil', fieldTitle: '本期暂估回冲', fieldParentName: null },
            { fieldName: 'recoilQuantity', fieldTitle: '数量', fieldParentName: 'recoil' },
            { fieldName: 'recoilPrice', fieldTitle: '单价', fieldParentName: 'recoil' },
            { fieldName: 'recoilAmount', fieldTitle: '金额', fieldParentName: 'recoil' },

            { fieldName: 'end', fieldTitle: '暂估期末', fieldParentName: null },
            { fieldName: 'endQuantity', fieldTitle: '数量', fieldParentName: 'end' },
            { fieldName: 'endPrice', fieldTitle: '单价', fieldParentName: 'end' },
            { fieldName: 'endAmount', fieldTitle: '金额', fieldParentName: 'end' },
        ]
    }

    return initColumn(columns[accountRadioValue], ...cellArr)
}
