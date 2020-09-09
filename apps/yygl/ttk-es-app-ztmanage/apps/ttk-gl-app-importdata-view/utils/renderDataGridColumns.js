import React, { Component } from 'react'
import classNames from 'classnames'
import { List, Map } from 'immutable'
import { Select, Popover, Checkbox, Icon, DataGrid } from 'edf-component'
const Option = Select.Option;
const columnNameList = [
    { fieldName: 'sourceAccount', caption: '原科目', width: 510, fieldParentName: null },
    { fieldName: 'sourceCode', caption: '科目编码', width: 120, textalign: 'left', fieldParentName: 'sourceAccount' },
    { fieldName: 'sourceName', caption: '科目名称', width: 150, textalign: 'left', fieldParentName: 'sourceAccount' },
    { fieldName: 'sourceBalance', width: 40, caption: '方向', textalign: 'center', fieldParentName: 'sourceAccount' },
    { fieldName: 'sourceCurrency', width: 80, caption: '外币', textalign: 'center', fieldParentName: 'sourceAccount' },
    { fieldName: 'sourceUnit', width: 80, caption: '数量单位', textalign: 'center', fieldParentName: 'sourceAccount' },
    { fieldName: 'sourceStatus', width: 40, caption: '停用', textalign: 'center', fieldParentName: 'sourceAccount' },
    { fieldName: 'space', caption: '', width: 20, fieldParentName: null},
    { fieldName: 'targetAccount', caption: '新科目', width: 670, fieldParentName: null },
    { fieldName: 'code', caption: '科目编码', width: 120, textalign: 'left', fieldParentName: 'targetAccount' },
    { fieldName: 'name', caption: '科目名称', width: 150, textalign: 'left', fieldParentName: 'targetAccount' },
    { fieldName: 'balanceDirectionName', caption: '方向', width: 40, textalign: 'center', fieldParentName: 'targetAccount' },
    // { fieldName: 'AuxAccCalcInfo', caption: '辅助核算', width: 160, textalign: 'left', fieldParentName: 'targetAccount' },
    { fieldName: 'currencyName', caption: '默认外币', width: 80, textalign: 'center', fieldParentName: 'targetAccount' },
    { fieldName: 'unitName', caption: '默认数量单位', width: 80, textalign: 'center', fieldParentName: 'targetAccount' },
    { fieldName: 'isEnable', caption: '停用', width: 40, textalign: 'center', fieldParentName: 'targetAccount' },
    { fieldName: 'msg', caption: '异常提示', width: 168, textalign: 'left', fieldParentName: 'targetAccount' },
    // { fieldName: 'operation', caption: '操作', width: 114, fieldParentName: null }
]
const columnsjbLists = [
    { fieldName: 'sourceAccount', caption: '原科目', width: 300, fieldParentName: null },
    { fieldName: 'sourceCode', caption: '科目编码', width: 100, textalign: 'left', fieldParentName: 'sourceAccount' },
    { fieldName: 'sourceName', caption: '科目名称', width: 170, textalign: 'left', fieldParentName: 'sourceAccount' },
    { fieldName: 'sourceBalance', width: 30, caption: '方向', textalign: 'center', fieldParentName: 'sourceAccount' },
    { fieldName: 'space', caption: '', width: 20, fieldParentName: null },
    { fieldName: 'targetAccount', caption: '新科目', width: 448, fieldParentName: null },
    { fieldName: 'code', caption: '科目编码', width: 100, textalign: 'left', fieldParentName: 'targetAccount' },
    { fieldName: 'name', caption: '科目名称', width: 170, textalign: 'left', fieldParentName: 'targetAccount' },
    { fieldName: 'balanceDirectionName', caption: '方向', width: 30, textalign: 'center', fieldParentName: 'targetAccount' },
    { fieldName: 'msg', caption: '异常提示', width: 148, textalign: 'left', fieldParentName: 'targetAccount' },
    // { fieldName: 'operation', caption: '操作', width: 114, fieldParentName: null }
]
export default function renderColumns(sjbData, list, accWidth, detailsScrollToRow, ...fun) {
    let res = []
    //处理一级节点
    if (sjbData) {
        columnsjbLists.forEach((element, index) => {
            if (!element.fieldParentName) {
                const childColumnList = columnsjbLists.filter((child, index) => {
                    return child.fieldParentName == element.fieldName
                })
                if (childColumnList && childColumnList.length > 0) {
                    let msgWidth = 980 - 320 - 130
                    res.push(
                        <DataGrid.Column
                            name={element.fieldName}
                            columnKey={element.fieldName}
                            header={<DataGrid.Cell>{cellHeader(element, element.caption, msgWidth - 300, childColumnList)}</DataGrid.Cell>}
                            cell={({ rowIndex, ...props }) => {
                                return <DataGrid.Cell {...props} className={rowIndex == detailsScrollToRow ? 'currentScrollRow' : 'row'}>
                                    {cellContent(columnsjbLists, list[rowIndex], rowIndex, element, msgWidth - 300, ...fun)}
                                </DataGrid.Cell>
                            }}
                            width={element.fieldName == 'targetAccount' ? msgWidth : element.width}
                        />)
                } else if (element.fieldName == 'space') {
                    res.push(
                        <DataGrid.Column
                            name={element.fieldName}
                            columnKey={element.fieldName}
                            header={<DataGrid.Cell>
                                {<span style={{ width: '20px', height: '100%', float: 'left', background: '#fff', "border-bottom": '1px #fff' }}></span>}</DataGrid.Cell>}
                            cell={({ rowIndex, ...props }) => {
                                return <DataGrid.Cell {...props} className={rowIndex == detailsScrollToRow ? 'currentScrollRow' : 'row'}>
                                    {<span style={{ width: '20px', height: '100%', float: 'left', background: '#fff', "border-bottom": '1px #fff' }}></span>}
                                </DataGrid.Cell>
                            }}
                            width={20}
                        />)
                } 
            }
        })
    } else {
        columnNameList.forEach((element, index) => {
            if (!element.fieldParentName) {
                const childColumnList = columnNameList.filter((child, index) => {
                    return child.fieldParentName == element.fieldName
                })
                if (childColumnList && childColumnList.length > 0) {
                    // const tmpWidth = accWidth ? accWidth - 660  : element.width
                    const tmpWidth = element.width
                    res.push(
                        <DataGrid.Column
                            name={element.fieldName}
                            // flexGrow={1}
                            columnKey={element.fieldName}
                            header={<DataGrid.Cell>{cellHeader(element, element.caption, tmpWidth - 510, childColumnList)}</DataGrid.Cell>}
                            cell={({ rowIndex, ...props }) => {
                                return <DataGrid.Cell {...props} className={rowIndex == detailsScrollToRow ? 'currentScrollRow' : 'row'}>
                                    {cellContent(columnNameList, list[rowIndex], rowIndex, element, tmpWidth - 510, ...fun)}
                                </DataGrid.Cell>
                            }}
                            width={element.fieldName == 'targetAccount' ? tmpWidth : element.width}
                        />)
                } else if (element.fieldName == 'space') {
                    res.push(
                        <DataGrid.Column
                            name={element.fieldName}
                            columnKey={element.fieldName}
                            flexGrow={1 }
                            header={<DataGrid.Cell>
                                {<span style={{ height: '100%', float: 'left', background: '#fff', "border-bottom": '1px #fff' }}></span>}</DataGrid.Cell>}
                            cell={({ rowIndex, ...props }) => {
                                return <DataGrid.Cell {...props} className={rowIndex == detailsScrollToRow ? 'currentScrollRow' : 'row'}>
                                    {<span style={{ width: '20px', height: '100%', float: 'left', background: '#fff', "border-bottom": '1px #fff' }}></span>}
                                </DataGrid.Cell>
                            }}
                            width={20}
                        />)
                } 
            }
        })
    }

    return res
}
//处理表格标题列
function cellHeader(element, title, msgWidth, childColumnList) {
    return (
        <div className='ttk-gl-app-importdata-accountrelation-content-header'>
            <div className='ttk-gl-app-importdata-accountrelation-content-header-top'><span title={title}>{title}</span></div>
            <div className='ttk-gl-app-importdata-accountrelation-content-header-bottom'>
                {
                    childColumnList.map(element =>
                        <span className='ttk-gl-app-importdata-accountrelation-content-header-bottom-cell'
                            style={{ width: `${element.fieldName == 'msg' ? msgWidth : element.width}px`, textAlign: 'center', height: '100%', float: 'left' }} title={element ? element.caption : ''}>
                            {element ? element.caption : ''}
                        </span>
                    )
                }
            </div>
        </div>
    )
}
//处理表格内容列
function cellContent(list, option, rowIndex, element, msgWidth, renderMsgColumns) {
    let res = [], childColumnList = list.filter((child, index) => {
        return child.fieldParentName == element.fieldName
    })
    childColumnList.forEach((element) => {
        let elementCell
        if (element.fieldName == 'msg' && element.fieldParentName == 'targetAccount') {
            elementCell = renderMsgColumns(msgWidth, rowIndex)
            res.push(
                <span className='ttk-gl-app-importdata-accountrelation-content-msgcell'
                    style={{ width: `${msgWidth}px`, height: '100%', textAlign: `${element.textalign}`, 'padding-left': `${element.textalign == 'left' ? '8px' : '0px'}`, 'overflow': 'hidden', 'font-size': '12px', float: 'left' }}>
                    {elementCell}
                </span>
            )
        } else {
            if (element.fieldName == 'sourceName') {
                elementCell = option && option[element.fieldName] ? option[element.fieldName] : ''
                const sourceCalcNames = option && option['sourceCalcNames']
                if (elementCell && sourceCalcNames) {
                    elementCell = <span title={elementCell} style={{ display: 'flex', 'justify-content': 'space-between', paddingRight: '2px', 'align-items': 'center' }}>
                        <span>
                            {elementCell}
                        </span>
                        <Popover placement="topLeft" content={sourceCalcNames} overlayClassName='ttk-gl-app-importdata-accountrelation-popover'>
                            <Icon className='souceauxaccounttips' fontFamily='edficon' type="fuzhuxiang" />
                        </Popover>
                    </span>
                }

            } else if (element.fieldName == 'sourceStatus') {
                elementCell = option && option.glAccountId ? option && option[element.fieldName] ? '否' : '是' : ''
            } else if (element.fieldParentName == 'targetAccount' && element.fieldName != 'msg') {
                //处理停用
                if (element.fieldName == 'isEnable') {
                    elementCell = option && option.accountDto.id ? option.accountDto[element.fieldName] ? '否' : '是' : ''
                } else {
                    elementCell = option && option.accountDto[element.fieldName] ? option.accountDto[element.fieldName] : ''
                }

            } else {
                elementCell = option && option[element.fieldName] ? option[element.fieldName] : ''
            }
            res.push(
                <span className='ttk-gl-app-importdata-accountrelation-content-cell'
                    style={{
                        width: `${element.width}px`, height: '100%', textAlign: `${element.textalign}`, 'padding-left': `${element.textalign == 'left' ? '8px' : '0px'}`, 'overflow': 'hidden', 'font-size': '12px', 'float': 'left'
                    }} title={elementCell}>
                    {elementCell}
                </span>
            )
        }
    })
    return res
}
//处理操作列
function cellOperate(item, params, id, rowIndex, renderMsgColumns, disabledState, addAccount, batchAddSubject, editAccount, deleteAccount) {
    let isDisabledAdd = disabledState(params),
        isDisabledDel = !(!(params.isSystem && !params.isAllowDel) && params.isEndNode && params.isEnable),
        isDisabledEdit = params && params.id ? false : true
    return (
        <span className="operationcell">
            <Icon name='add' disabled={isDisabledAdd} type="xinzengkemu" onClick={!isDisabledAdd ? addAccount(item, params, rowIndex, id) : null} fontFamily="edficon" title='新增' style={{ fontSize: '24px', color: '#0066B3' }} />
            <Icon name='batchadd' disabled={isDisabledAdd} type="piliangzengjia" onClick={!isDisabledAdd ? batchAddSubject(item, params, rowIndex, id) : null} fontFamily="edficon" title='批量新增' style={{ fontSize: '24px' }} />
            <Icon name='edit' type="bianji" disabled={isDisabledEdit} onClick={!isDisabledEdit ? editAccount(item, params, id) : null} fontFamily="edficon" title='编辑' style={{ fontSize: '24px' }} />
            <Icon name='del' disabled={isDisabledDel} onClick={!isDisabledDel ? deleteAccount(item, params, id) : null} type="shanchu" fontFamily="edficon" title='删除' style={{ fontSize: '24px' }} />
        </span>
    )
}




