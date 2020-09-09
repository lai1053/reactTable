import React from 'react'
import { DataGrid, Checkbox, Icon } from 'edf-component'

let centerArr = ['flag','formulaIdForPageStr'],
    rightArr = ['periodEndAmountStr','yearBeginAmountStr','amountStr','amountSumStr']

export default function renderColumns(columns, list, _this){
    let { Column, Cell } = DataGrid

    let cols = [
        <Column name='operation' columnKey='operation' width={100}
                fixedRight={true}
                header={<Cell name='cb'>
                    操作
                </Cell>}
                cell={(ps) => {
                    if(ps.rowIndex<list.length-1) {

                        return <Icon type="shanchu" fontFamily='edficon' style={{'fontSize':'22px','marginTop':'6px'}}  onClick = { function(){_this.delRowClick(ps,list[ps])} } />
                    } else {
                        return ''

                    }
               }}
        />
    ]

    columns.forEach(op => {
        let col = <Column name={op.id} columnKey={op.id} flexGrow={1} width={op.width}
        header={<Cell name='header'>{op.name}</Cell>}
        cell={(ps) => {
            if(ps.rowIndex<list.length-1) {

                return <Cell tip={true} className={getClassName(list[ps.rowIndex], op.id)}>
                    { 
                        list[ps.rowIndex][op.id]
                    }
                </Cell>
            } else {
                return <Cell tip={true} className={getClassName(list[ps.rowIndex], op.id)} style={{'fontWeight':'bold'}}>
                    { 
                        list[ps.rowIndex][op.id]
                    }
                </Cell>
            }
        }}
        />
          cols.push(col)
    })

    return cols
}

function getClassName(option, fieldName){
    let leftName = 'mk-datagrid-cellContent-left',
        rightName = 'mk-datagrid-cellContent-right'

    if(centerArr.indexOf(fieldName)>-1){
        return ''
    }else if(rightArr.indexOf(fieldName)>-1){
        return  rightName
    }else{
        return  leftName
    }
}

// function(data){_this.showTableSetting({value: true})}



