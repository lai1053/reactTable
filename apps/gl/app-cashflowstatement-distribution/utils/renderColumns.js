import React from 'react'
import { DataGrid, Checkbox, Icon, Input, Select } from 'edf-component'

let centerArr = ['flag','formulaIdForPageStr'],
    rightArr = ['periodEndAmountStr','yearBeginAmountStr'],
    specialColmns = ['distributionProject', 'distributionAmount']
const Option = Select.Option;

export default function renderColumns(columns, list, _this){
    let { Column, Cell } = DataGrid

    let cols = [
        <Column name='operation' columnKey='operation' width={100}
                fixedRight={true}
                header={<Cell name='cb'>
                    操作
                </Cell>}
                cell={(ps) => {
                    return <Icon type="shanchu" fontFamily='edficon' style={{'fontSize':'22px','marginTop':'6px'}}  onClick = { function(){_this.delRowClick(ps,list[ps])} } />
               }}
        />
    ]

    columns.forEach(op => {
        let col = <Column name={op.id} columnKey={op.id} flexGrow={1} width={150}
        header={<Cell name='header'>{op.name}</Cell>}
            cell={(ps) => {
                setCell(list, ps, op)
            }}
        />
          cols.push(col)
    })

    return cols
}

function setCell(list, ps, op) {
    if( !specialColmns.includes(op.id) ) {
        return <Cell tip={true} className={getClassName(list[ps.rowIndex], op.id)}>
            { 
                list[ps.rowIndex][op.id]
            }
        </Cell>
    } else if(op.id == 'distributionProject') {
        if( list[ps.rowIndex].type == true ) {
            return <Cell tip={true} className={getClassName(list[ps.rowIndex], op.id)}>
                { 
                    list[ps.rowIndex][op.id]
                }
            </Cell>
        } else {
            return <Cell tip={true} className={getClassName(list[ps.rowIndex], op.id)}>
                <Select style={{ width: '100%' }}
                onChange={(value) => onChange(value)}
                value={list[ps.rowIndex][op.id]}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                dropdownFooter={dropdownFooter} onFocus={handleFoucus}>
                    {productChildren}
                </Select>
            </Cell>
        }
    } else if(op.id == 'distributionAmount') {
        if( list[ps.rowIndex].type == true ) {
            return <Cell tip={true} className={getClassName(list[ps.rowIndex], op.id)}>
                { 
                    list[ps.rowIndex][op.id]
                }
            </Cell>
        } else {
            return <Cell tip={true} className={getClassName(list[ps.rowIndex], op.id)}>
                <Input />
            </Cell>
        }
    }
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



