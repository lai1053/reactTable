
import React from 'react'

function initColumn(columns, ...cellArr) {    
    let resColumn = [], className = ''
    let leftArr = ['propertyName', 'inventoryCode', 'inventoryName', 'specification']
    let centerArr = ['businessTypeName', 'businessDate', 'code', 'unitName', 'docCode', 'sourceVoucherCode']
    // 先插入一级节点    
    columns.forEach(item => {
        if (!item.fieldParentName) {
            let width = '100px'
            if(leftArr.indexOf(item.fieldName)>-1) className = 'detail_left'
            if(centerArr.indexOf(item.fieldName)>-1) className = 'detail_center'
            switch (item.fieldName){
                case 'code':
                    width = '110px'
                    break;
                case 'sourceVoucherCode':
                    width = '110px'
                    break;
                case 'businessTypeName':
                    width = '90px'
                    break;
                case 'businessDate':
                    width = '90px'
                    break;
                case 'unitName':
                    width = '66px'
                    break;  
                case 'docCode':
                    width = '78px'
                    break;
                case 'inventoryCode':
                    width = '66px'
                    break;
                case 'inventoryName':
                    width = '198px'
                    break;
            }
            let data = {
                'title': item.fieldTitle,
                'name': item.fieldName,
                'dataIndex': item.fieldName,
                'key': item.fieldName,
                'className': className,
                // 'render': _this.getCell(item.fieldName),
                'render': item.fieldName == 'code'? cellArr[1] : 
                        (item.fieldName == 'businessTypeName' || item.fieldName == 'businessDate') ? cellArr[4] :
                        item.fieldName == 'docCode'||item.fieldName == 'sourceVoucherCode' ? cellArr[5]: cellArr[0],
                'width': width
            }
            resColumn.push(data)
        }
    })
    
    resColumn.forEach(item => {
        let childData = [], isAmount = false
        columns.forEach(x => {
            if (x.fieldParentName && x.fieldParentName === item.name) {
                if(x.fieldName == 'receiveAmount' || x.fieldName == 'dispatchAmount') isAmount = true
                let data = {
                    'title': x.fieldTitle,
                    'name': x.fieldName,
                    'dataIndex': x.fieldName,
                    'key': x.fieldName,
                    'className': 'detail_right',
                    'width': '104px',
                    'render': isAmount ? cellArr[2] : cellArr[3]
                }
                childData.push(data)
            }
        })
        if (childData && childData.length > 0) item.children = childData
    })
    return resColumn
}

export default function renderColumns( ...cellArr) {
    const columns = [
        { fieldName: 'businessTypeName', fieldTitle: '业务类型', fieldParentName: null },
        { fieldName: 'businessDate', fieldTitle: '单据日期', fieldParentName: null },
        { fieldName: 'code', fieldTitle: '单据编号', fieldParentName: null },
        { fieldName: 'docCode', fieldTitle: '凭证字号', fieldParentName: null },
        { fieldName: 'sourceVoucherCode', fieldTitle: '来源发票', fieldParentName: null },
        { fieldName: 'propertyName', fieldTitle: '存货分类', fieldParentName: null },
        { fieldName: 'inventoryCode', fieldTitle: '存货编码', fieldParentName: null },
        { fieldName: 'inventoryName', fieldTitle: '存货名称', fieldParentName: null },
        { fieldName: 'unitName', fieldTitle: '计量单位', fieldParentName: null },
        { fieldName: 'specification', fieldTitle: '规格型号', fieldParentName: null },
        { fieldName: 'inTreasury', fieldTitle: '入库', fieldParentName: null },
        { fieldName: 'outTreasury', fieldTitle: '出库', fieldParentName: null },

        { fieldName: 'receiveQuantity', fieldTitle: '数量', fieldParentName: 'inTreasury' },
        { fieldName: 'receivePrice', fieldTitle: '单价', fieldParentName: 'inTreasury' },
        { fieldName: 'receiveAmount', fieldTitle: '金额', fieldParentName: 'inTreasury' },

        { fieldName: 'dispatchQuantity', fieldTitle: '数量', fieldParentName: 'outTreasury' },
        { fieldName: 'dispatchPrice', fieldTitle: '单价', fieldParentName: 'outTreasury' },
        { fieldName: 'dispatchAmount', fieldTitle: '金额', fieldParentName: 'outTreasury' },
    ]
    return initColumn(columns, ...cellArr)
}
