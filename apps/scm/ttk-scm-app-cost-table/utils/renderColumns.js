import React from 'react';
import { addThousPos, clearThousPos } from '../../../../utils/number'

function renderText(name, rowData, index, tableList) {
    let obj = null
    if (rowData && !rowData.inventoryName) { 
        // if (name != 'inventoryCode' && name != 'inventoryName' && name != 'specification' && name != 'unitName') {
        if (name == 'materialCost' || name == 'laborCost' || name == 'manufacturCost' || name == 'otherCost' || 
        name == 'amount' || name == 'absorption') {
            let per = name == 'price' || name == 'quantity' ? 6 : 2
            obj = {
                children: <span title={addThousPos(rowData[name] || 0, true, null, per)}>
                {addThousPos(rowData[name] || 0, true, null, per)}
                </span> ,
                props: {
                    colSpan: 1
                }
            }
        } else {

            if (name == 'inventoryCode') {
                obj = {
                    children: <span title='合计'>合计</span>,
                    props: {
                        // colSpan: 4
                        colSpan: 6
                    }
                }
            } else {
                obj = {
                    children: <span title={rowData[name]}>
                        {rowData[name]}
                    </span>,
                    props: {
                        colSpan: 0
                    }
                }
            }
        }

    } else {
        let className = '',
            leftArr = ['specification', 'inventoryCode', 'inventoryName'],
            centerArr = ['unitName'],
            per = name == 'price' || name == 'quantity' ? 6 : 2

        className = leftArr.includes(name) ? "detail_left" : centerArr.includes(name) ? "detail_center" : ""

        let isNumber = name != 'inventoryCode' && name != 'inventoryName' && name != 'specification' && name != 'unitName' && name != 'absorption'
        obj =  !isNumber ? <div className={className} colSpan={1}>
            <span title={rowData[name]}>
                {rowData[name]}
            </span>
        </div> : <div className={className} colSpan={1}>
                <span title={addThousPos(rowData[name] || 0, true, null, per)}>
                    {addThousPos(rowData[name] || 0, true, null, per)}
                </span>
            </div>

        // let rows = tableList.filter(item => item.inventoryCode == rowData.inventoryCode)
        // let rows = [], minIndex = index, isHave = false
        // tableList.forEach((item,index) => {
        //     if (item.inventoryCode == rowData.inventoryCode) {
        //         rows.push(item)
        //         if (index>minIndex) {
        //             isHave = true
        //         } else {
        //             isHave = false
        //         }

        //     }
        // })
        
        // if (rows.length > 1 && name == 'inventoryCode') {
        //     console.log(rows,isHave, 'rows')
        //     if (!isHave) {
        //         obj = {
        //             children: <span title={rowData[name]}>{rowData[name]}</span>,
        //             props: {
        //                 colSpan: 1,
        //                 rowSpan: 0
        //             }
        //         }
        //     }else {
        //         obj = {
        //             children: <span title={rowData[name]}>{rowData[name]}</span>,
        //             props: {
        //                 colSpan: 1,
        //                 rowSpan: rows.length
        //             }
        //         }
        //     }
        // } else {
        //     obj = {
        //         children: <span title={rowData[name]}>{rowData[name]}</span>,
        //         props: {
        //             colSpan: 1
        //         }
        //     }
        // }
    }

    return obj
}

function initColumn(columns, tableList) {
    let resColumn = [], className = '',
    leftArr = ['specification', 'inventoryCode', 'inventoryName'],
    centerArr = ['unitName']

    columns.forEach(item => {
        if(!item.fieldParentName) {
            let data = {
                'name': item.fieldName,
                'title': item.fieldTitle,
                'dataIndex': item.fieldName,
                'key': item.fieldName
            }
            resColumn.push(data)
        }
    });

    resColumn.forEach(ele => {
        let childData = []
        columns.forEach(obj => {
            if (obj.fieldParentName && obj.fieldParentName == ele.name) {
                let data = {
                    'name': obj.fieldName,
                    'title': obj.fieldTitle,
                    'dataIndex': obj.fieldName,
                    'key': obj.fieldName,
                    'width': obj.fieldName=='inventoryName' ? '160px': 
                    (obj.fieldName=='unitName' || obj.fieldName == 'inventoryCode' ? '80px':'90px'),
                    'render':(_rowIndex, v, index)=>{ return renderText(obj.fieldName, v, index, tableList)}
                }
                childData.push(data)
            }
        })

        if(childData&&childData.length>0) ele.children = childData
    })

    return resColumn
}

export default function renderColumns(tableList){

    const columns =[

        { fieldName: 'chanchengpin', fieldTitle: '产成品', fieldParentName: null },
        { fieldName: 'inventoryCode', fieldTitle: '存货编码', fieldParentName: 'chanchengpin' },
        { fieldName: 'inventoryName', fieldTitle: '存货名称', fieldParentName: 'chanchengpin' },
        { fieldName: 'specification', fieldTitle: '规格型号', fieldParentName: 'chanchengpin' },
        { fieldName: 'unitName', fieldTitle: '单位', fieldParentName: 'chanchengpin' },
        { fieldName: 'quantity', fieldTitle: '数量', fieldParentName: 'chanchengpin'},
        { fieldName: 'price', fieldTitle: '单价', fieldParentName: 'chanchengpin'},
        { fieldName: 'amount', fieldTitle: '金额', fieldParentName: 'chanchengpin'},
        
        { fieldName: 'chengbenxiangmu', fieldTitle: '成本项目', fieldParentName: null },
        { fieldName: 'absorption', fieldTitle: '分摊率', fieldParentName: 'chengbenxiangmu' },
        { fieldName: 'materialCost', fieldTitle: '直接材料', fieldParentName: 'chengbenxiangmu' },
        { fieldName: 'laborCost', fieldTitle: '直接人工', fieldParentName: 'chengbenxiangmu' },
        { fieldName: 'manufacturCost', fieldTitle: '制造费用', fieldParentName: 'chengbenxiangmu' },
        { fieldName: 'otherCost', fieldTitle: '其他费用', fieldParentName: 'chengbenxiangmu' },
    ]

    return initColumn(columns, tableList)
}
