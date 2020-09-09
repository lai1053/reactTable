
import React from 'react'

function initColumn(id,isBatch,influenceLabel,columns, ...params) { 
    let resColumn = []   
    const colSapnArray = ['influenceFactor', 'subject', 'handle']

        // 先插入一级节点    
    columns.forEach(item => {
        if (!item.fieldParentName) {
            let data
            if (item.fieldName =='influence') {
                data = {
                    'title': item.fieldTitle,
                    'name': item.fieldName,
                    'dataIndex': item.fieldName,
                    'key': item.fieldName,
                    'render': params[0],
                    'width': '330px'
                }
            }else if (item.fieldName =='subject') {
                data = {
                    'title': item.fieldTitle,
                    'name': item.fieldName,
                    'dataIndex': item.fieldName,
                    'key': item.fieldName,
                    'render': params[1],
                    'width': '420px'
                }
            }else {
                data = {
                    'title': item.fieldTitle,
                    'name': item.fieldName,
                    'dataIndex': item.fieldName,
                    'key': item.fieldName,
                    'render': params[2],
                    'width': '150px'
                }
            }      
            resColumn.push(data)
        }
    })
    let childData = [], data
    columns.forEach(x => {
        if (x.fieldParentName && x.fieldParentName === resColumn[0].name) {
            data = {
                'title': x.fieldTitle,
                'name': x.fieldName,
                'dataIndex': x.fieldName,
                'className':'amountColumnStyle',
                'key': x.fieldName,
                // 'render': params[0]
                'render': isBatch && x.fieldTitle== '存货及服务分类' ? params[3] : params[0]
            }
            childData.push(data)
        }
    })

    if(childData.length == 0 && influenceLabel){
        let label = influenceLabel.toJS()
        label.map(item => {
            data = {
                'title': item.name,
                'name': item.name,
                'dataIndex': item.name,
                'className':'amountColumnStyle',
                'key': item.name,
                'render': params[0]
            }
            childData.push(data)
        })
    }
    
    if (childData && childData.length > 0)
        resColumn[0].children = childData

    return resColumn
}
    
export default function renderColumns(id,isBatch,influenceLabel,tableList, ...params) {
    let columns

    columns = [
        { fieldName: 'influence', fieldTitle: '影响因素', fieldParentName: null },
        { fieldName: 'subject', fieldTitle: '对应科目', fieldParentName: null },
        { fieldName: 'handle', fieldTitle: '操作', fieldParentName: null },
        // { fieldName: 'influence0', fieldTitle: '资产属性', fieldParentName: 'influence' },
        // { fieldName: 'influence1', fieldTitle: '资产分类', fieldParentName: 'influence' },
    ]
    if(id== 2001001 || id == 5001005) {
        columns = [
            { fieldName: 'influence', fieldTitle: '影响因素', fieldParentName: null },
            { fieldName: 'subject', fieldTitle: '对应科目', fieldParentName: null },
            // { fieldName: 'handle', fieldTitle: '操作', fieldParentName: null },
            // { fieldName: 'influence0', fieldTitle: '资产属性', fieldParentName: 'influence' },
            // { fieldName: 'influence1', fieldTitle: '资产分类', fieldParentName: 'influence' },
        ]
    }

    let influenceList
    if(tableList) {
        tableList = tableList.size||tableList.size==0 ? tableList.toJS() : tableList
        if(tableList && tableList.length!=0) {
            influenceList = tableList[0].influenceList
            influenceList.map((item, index)=> {
                columns.push({
                    fieldName: 'influence'+index,
                    fieldTitle: influenceList[index].influence,
                    fieldParentName: 'influence'
                })
            })
        }
        return initColumn(id,isBatch,influenceLabel,columns, ...params)
    }
}
