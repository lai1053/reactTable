import React from 'react'
import { DataGrid, Icon, TableSort } from 'edf-component'

export default function renderColumns(data, option, _this){
    let { Column, Cell } = DataGrid, columns = data.other.columns, list = data.list, cols = []

    columns.forEach(op => {
        let col = <Column name={op.id} columnKey={op.fieldName} isResizable={true} width={ op.width }
        header={<Cell name='header'>{op.caption}</Cell>}
        cell={(ps) => {
            return <Cell tip={true} className={getClassName(list[ps.rowIndex], op.idAlignType)}>
                    {list[ps.rowIndex][op.fieldName]}
            </Cell>
        }}
        />
        cols.push(col)
    })
    cols.push(<Column name='right' columnKey='right' flexGrow={1} width={0}
        header={<Cell name='cb'></Cell>}
        cell={(ps) => {
            return <Cell name='cell' className={!Number(list[ps.rowIndex].seq) ? 'total':''}></Cell>
        }}/>)
    return cols
}

function getClassName(option, idAlignType){
    let leftName = 'mk-datagrid-cellContent-left',
        rightName = 'mk-datagrid-cellContent-right'

    if(idAlignType == '1000050002'){
        return !Number(option.seq) ? 'total':''
    }else if(idAlignType == '1000050003'){
        return !Number(option.seq) ? `total ${rightName}`:rightName
    }else{
        return !Number(option.seq) ? `total ${leftName}`:leftName
    }
}

function addThousandsPosition(value){
    let num
    if(!value){
        return ''
    }
    num = parseFloat(value).toFixed(2)
    let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g
    return num.replace(regex, "$1,")
}



