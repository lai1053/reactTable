import React from 'react'
import { DataGrid, Checkbox, Icon } from 'edf-component'

export default function renderColumns(columns, list, _this){
    let { Column, Cell } = DataGrid

    let cols = [
        // <Column name='operation' columnKey='operation' width={100}
        //         fixedRight={true}
        //         header={<Cell name='cb'>
        //             操作
        //         </Cell>}
        //         cell={(ps) => {
        //             if(ps.rowIndex<list.length-1) {

        //                 return <Icon type="shanchu" fontFamily='edficon' style={{'fontSize':'22px','marginTop':'6px'}}  onClick = { function(){_this.delRowClick(ps,list[ps])} } />
        //             } else {
        //                 return ''

        //             }
        //        }}
        // />
    ]

    // width={op.width}   className={getClassName(list[ps.rowIndex], op.id)}
    columns.forEach(op => {
        let col = <Column name={op.id} columnKey={op.id} flexGrow={1} 
        header={<Cell name='header'>{op.name}</Cell>}
        cell={(ps) => {
                return <Cell tip={true}>
                    { 
                        list[ps.rowIndex][op.id]
                    }
                </Cell>
        }}
        />
          cols.push(col)
    })

    return cols
}
