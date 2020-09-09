import React, { Component } from 'react'
import classNames from 'classnames'
import { List, Map } from 'immutable'
import { TableOperate, Table, Select, Button, Modal, Input, Number, Checkbox, Icon, Popconfirm, FormDecorator, Menu, DataGrid } from 'edf-component'
const Option = Select.Option;
const columnNameList = [
    { fieldName: 'sourceAccount', caption: '原科目', width: 330, fieldParentName: null },
    { fieldName: 'sourceCode', caption: '科目编码', width: 120, textalign: 'left', fieldParentName: 'sourceAccount' },
    { fieldName: 'sourceName', caption: '科目名称', width: 170, textalign: 'left', fieldParentName: 'sourceAccount' },
    { fieldName: 'sourceBalanceName', width: 40, caption: '方向', textalign: 'center', fieldParentName: 'sourceAccount' },
    { fieldName: 'space', caption: '', width: 20, fieldParentName: null },
    { fieldName: 'targetAccount', caption: '新科目', width: 670, fieldParentName: null },
    { fieldName: 'code', caption: '科目编码', width: 120, textalign: 'left', fieldParentName: 'targetAccount' },
    { fieldName: 'name', caption: '科目名称', width: 170, textalign: 'left', fieldParentName: 'targetAccount' },
    { fieldName: 'balanceDirectionName', caption: '方向', width: 40, textalign: 'center', fieldParentName: 'targetAccount' },
    // { fieldName: 'AuxAccCalcInfo', caption: '辅助核算', width: 160, textalign: 'left', fieldParentName: 'targetAccount' },
    { fieldName: 'currencyName', caption: '外币', width: 80, textalign: 'center', fieldParentName: 'targetAccount' },
    { fieldName: 'unitName', caption: '数量单位', width: 80, textalign: 'center', fieldParentName: 'targetAccount' },
    { fieldName: 'isEnable', caption: '停用', width: 40, textalign: 'center', fieldParentName: 'targetAccount' },
    { fieldName: 'msg', caption: '异常提示', width: 148, textalign: 'left', fieldParentName: 'targetAccount' },
    { fieldName: 'operation', caption: '操作', width: 114, fieldParentName: null }
]
export default function renderColumns(list, accWidth, detailsScrollToRow, ...fun) {
    let res = []
    //处理一级节点
    columnNameList.forEach((element, index) => {
        if (!element.fieldParentName) {
            const childColumnList = columnNameList.filter((child, index) => {
                return child.fieldParentName == element.fieldName
            })
            if (childColumnList && childColumnList.length > 0) {
                let width = accWidth ? accWidth - 480 : element.width
                res.push(
                    <DataGrid.Column
                        name={element.fieldName}
                        columnKey={element.fieldName}
                        header={<DataGrid.Cell>{cellHeader(element, element.caption, width, childColumnList)}</DataGrid.Cell>}
                        cell={({ rowIndex, ...props }) => {
                            return <DataGrid.Cell {...props} className={rowIndex == detailsScrollToRow ? 'currentScrollRow' : 'row'}>
                                {cellContent(list[rowIndex], rowIndex, element, width, ...fun)}
                            </DataGrid.Cell>
                        }}
                        width={element.fieldName == 'targetAccount' ? width : element.width}
                    />)
            } else if (element.fieldName == 'space') {
                res.push(
                    <DataGrid.Column
                        name={element.fieldName}
                        columnKey={element.fieldName}
                        header={<DataGrid.Cell>

                            {<span style={{ width: '20px', float: 'left', height: '100%', background: '#fff', "border-bottom": '1px #fff' }}></span>}</DataGrid.Cell>}
                        cell={({ rowIndex, ...props }) => {
                            return <DataGrid.Cell {...props} className={rowIndex == detailsScrollToRow ? 'currentScrollRow' : 'row'}>
                                {<span style={{ width: '20px', float: 'left', height: '100%', background: '#fff', "border-bottom": '1px #fff' }}></span>}
                            </DataGrid.Cell>
                        }}
                        width={20}
                    />)
            } else {
                //添加操作按钮  `${element.width}px`
                res.push(
                    <DataGrid.Column
                        name={element.fieldName}
                        columnKey={element.fieldName}
                        // flexGrow={1}
                        fixedRight={true}
                        header={<DataGrid.Cell>{element.caption}</DataGrid.Cell>}
                        cell={({ rowIndex, ...props }) => {
                            return <DataGrid.Cell {...props} >

                                {list && list[rowIndex] ? cellOperate(list[rowIndex].accountDto, list[rowIndex].id, rowIndex, ...fun) : <span className='ttk-gl-app-financeinit-accountrelation-content-msgcell'
                                    style={{ width: '100%', height: '100%' }}></span>}
                            </DataGrid.Cell>
                        }}
                        width={element.width}
                    />)
            }
        }
    })
    return res
}
//处理表格标题列
function cellHeader(element, title, accWidth, childColumnList) {
    const msgWidth = accWidth - 525 - 5
    return (
        <div className='ttk-gl-app-financeinit-accountrelation-content-header'>
            <div className='ttk-gl-app-financeinit-accountrelation-content-header-top'><span title={title}>{title}</span></div>
            <div className='ttk-gl-app-financeinit-accountrelation-content-header-bottom'>
                {
                    childColumnList.map(element =>
                        <span className='ttk-gl-app-financeinit-accountrelation-content-header-bottom-cell'
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
function cellContent(option, rowIndex, element, accWidth, renderMsgColumns, sourceAccountAux) {
    let res = [], childColumnList = columnNameList.filter((child, index) => {
        return child.fieldParentName == element.fieldName
    })
    childColumnList.forEach((element) => {
        let elementCell
        if (element.fieldName == 'msg' && element.fieldParentName == 'targetAccount') {
            const msgWidth = accWidth - 525 - 5
            elementCell = renderMsgColumns(msgWidth, rowIndex)
            res.push(
                <span className='ttk-gl-app-financeinit-accountrelation-content-msgcell'
                    style={{ width: `${msgWidth}px`, height: '100%', textAlign: `${element.textalign}`, 'padding-left': `${element.textalign == 'left' ? '4px' : '0px'}`, 'overflow': 'hidden', 'font-size': '12px', 'white-space': 'pre-wrap', float: 'left' }}>
                    {elementCell}
                </span>
            )
        } else {
            if (element.fieldName == 'sourceName') {
                elementCell = option && option[element.fieldName] ? option[element.fieldName] : ''
                const sourceIsAuxAccCalc = option && option['sourceIsAuxAccCalc'] ? option['sourceIsAuxAccCalc'] : ''
                if (elementCell && sourceIsAuxAccCalc) {
                    elementCell = <span title={elementCell} style={{ display: 'flex', 'justify-content': 'space-between', paddingRight: '2px' }}>
                        {elementCell}
                        <a href="javascript:;"
                            onClick={sourceAccountAux(option)}
                            title='辅助项'>
                            辅助项
                    </a>
                    </span>
                }
            }
            else if (element.fieldParentName == 'targetAccount' && element.fieldName != 'msg') {
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
                <span className='ttk-gl-app-financeinit-accountrelation-content-cell'
                    style={{
                        width: `${element.width}px`, height: '100%', textAlign: `${element.textalign}`, 'padding-left': `${element.textalign == 'left' ? '8px' : '0px'}`, 'overflow': 'hidden', 'font-size': '12px', float: 'left'
                    }} title={elementCell}>
                    {elementCell}
                </span>
            )
        }
    })
    return res
}
//处理操作列
function cellOperate(params, id, rowIndex, renderMsgColumns, sourceAccountAux, disabledState, addAccount, batchAddSubject, editAccount, deleteAccount) {
    let isDisabledAdd = disabledState(params),
        isDisabledDel = !(!(params.isSystem && !params.isAllowDel) && params.isEndNode && params.isEnable),
        isDisabledEdit = params && params.id ? false : true
    return (
        <span className="operationcell">
            <Icon name='add' disabled={isDisabledAdd} type="xinzengkemu" onClick={!isDisabledAdd ? addAccount(params, rowIndex, id) : null} fontFamily="edficon" title='新增' style={{ fontSize: '24px', color: '#0066B3' }} />
            <Icon name='batchadd' disabled={isDisabledAdd} type="piliangzengjia" onClick={!isDisabledAdd ? batchAddSubject(params, rowIndex, id) : null} fontFamily="edficon" title='批量新增' style={{ fontSize: '24px' }} />
            <Icon name='edit' type="bianji" disabled={isDisabledEdit} onClick={!isDisabledEdit ? editAccount(params, id) : null} fontFamily="edficon" title='编辑' style={{ fontSize: '24px' }} />
            <Icon name='del' disabled={isDisabledDel} onClick={!isDisabledDel ? deleteAccount(params, id) : null} type="shanchu" fontFamily="edficon" title='删除' style={{ fontSize: '24px' }} />
        </span>
    )
}



