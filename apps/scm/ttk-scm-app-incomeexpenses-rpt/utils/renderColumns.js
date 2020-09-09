import React from 'react'
import { DataGrid, Checkbox, Icon, TableSort } from 'edf-component'

let //centerArr = ['isDraftName','unitName','seq', 'buyDate', 'beginDeprPeriod','createTime', 'isHasInitName'],
    //rightArr = ['quantityStr','salvageRateStr','initDeprMonths','deprMonth', 'salvageRate', 'hasDeprMonths','quantity', 'inputTaxRate', 'origValue', 'origValueStr', 'initAccuDepreciation','accuDepreciation','netWorthStr','inputTax'],
    percentage = ['salvageRate', 'salvageRateStr', 'inputTaxRate']

export default function renderColumns(columns, list, other, _this) {
    let { Column, Cell } = DataGrid, isHasIcon = false
    list.map(item => { if (item.sourceVoucherTypeId == '1000030012' || item.sourceVoucherTypeId == '1000030009' || item.sourceVoucherTypeId == '1000030008') isHasIcon = true })
    let cols = [
        <Column name='select' columnKey='select' width={34}
            header={<Cell name='cb'>
                <Checkbox checked={_this.extendAction.gridAction.isSelectAll("dataGrid")}
                    onChange={_this.extendAction.gridAction.selectAll("dataGrid")}>
                </Checkbox>
            </Cell>}
            cell={(ps) => {
                return <Cell name='cell' className={!Number(list[ps.rowIndex].seq) ? 'total' : ''}>
                    {!Number(list[ps.rowIndex].seq) ? null : <Checkbox onChange={_this.selectRow(ps.rowIndex)} checked={list[ps.rowIndex].selected}></Checkbox>}
                </Cell>
            }}
        />,
        <Column name='operation' columnKey='operation' width={87}
            fixedRight={true}
            header={<Cell name='cb'>
                <Icon style={{ fontSize: 28, cursor: 'pointer', paddingTop: '6px' }} type="youcezhankailanmushezhi" fontFamily='edficon' onClick={function (data) { _this.showTableSetting({ value: true }) }} />
            </Cell>}
            cell={(ps) => {
                if (!Number(list[ps.rowIndex].seq)) return <Cell name='cell' className={!Number(list[ps.rowIndex].seq) ? 'total' : ''}></Cell>
                if (list[ps.rowIndex].positionFlag != "last" && list[ps.rowIndex].positionFlag != "first") {
                    return (<Cell name='cell' className={!Number(list[ps.rowIndex].seq) ? 'total app-oprate' : 'app-oprate'}>
                        <Icon type="shengchengpingzheng"
                            fontFamily='edficon'
                            className={list[ps.rowIndex].docId ? "lanmuicon_scpz" : "lanmuicon_pz"}
                            title={list[ps.rowIndex].docId ? "生成凭证" : "生成凭证"}
                            style={{ fontSize: 23, cursor: 'pointer', paddingTop: '6px' }}
                            onClick={function () { list[ps.rowIndex].docId ? '' : _this.addVoucher(list[ps.rowIndex]) }} />
                        <Icon type="bianji"
                            fontFamily='edficon'
                            title="编辑"
                            style={{ fontSize: 23, cursor: 'pointer', paddingTop: '6px' }}
                            onClick={function () { _this.modifyDetail(list[ps.rowIndex]) }} />
                        <Icon type="shanchu"
                            fontFamily='edficon'
                            title='删除'
                            disabled={list[ps.rowIndex].docCode}
                            style={{ fontSize: 23, cursor: 'pointer', paddingTop: '6px' }}
                            onClick={function () { list[ps.rowIndex].docCode ? null : _this.delete(list[ps.rowIndex]) }} />
                    </Cell>)
                }
                return (<Cell name='cell' className={!Number(list[ps.rowIndex].seq) ? 'total app-oprate' : 'app-oprate'}></Cell>)
            }}
        />
    ]

    columns.forEach(op => {
        if (op.isVisible) {
            let col = <Column name={op.id} columnKey={op.fieldName} isResizable={true} width={op.fieldName == 'code' && isHasIcon ? op.width + 30 : op.width}
                header={<Cell name='header'>{op.caption}</Cell>}
                cell={(ps) => {
                    if (op.fieldName == 'docCode') {
                        return <Cell className={getClassName(list[ps.rowIndex], op.idAlignType)}>
                            <a title={list[ps.rowIndex][op.fieldName]} onClick={function () { _this.getDocCode(list[ps.rowIndex]) }}>
                                {/* {list[ps.rowIndex][op.fieldName] && "记-" + list[ps.rowIndex][op.fieldName]} */}
                                {list[ps.rowIndex][op.fieldName] ? (/已生成/.test(list[ps.rowIndex][op.fieldName]) ? list[ps.rowIndex][op.fieldName] : "记-" + list[ps.rowIndex][op.fieldName]) : ''}
                            </a>
                        </Cell>
                    }
                    if (op.fieldName == 'code') {
                        return <Cell className={getClassName(list[ps.rowIndex], op.idAlignType)}
                            style={isHasIcon ? { textAlign: 'left' } : {}}>
                            <a title={list[ps.rowIndex][op.fieldName]} onClick={function () { _this.modifyDetail(list[ps.rowIndex]) }}>
                                {list[ps.rowIndex][op.fieldName]}
                            </a>
                            {(list[ps.rowIndex].sourceVoucherTypeId == '1000030012' || list[ps.rowIndex].sourceVoucherTypeId == '1000030009' || list[ps.rowIndex].sourceVoucherTypeId == '1000030008')
                                && list[ps.rowIndex].positionFlag != "last" && list[ps.rowIndex].positionFlag != "first" ?
                                <Icon type={list[ps.rowIndex].sourceVoucherTypeId == '1000030012' ? "daoru1" : "xianjie"}
                                    fontFamily='edficon'
                                    title={list[ps.rowIndex].sourceVoucherTypeId == '1000030012' ? '导入' : '现结'}
                                    style={list[ps.rowIndex].sourceVoucherTypeId == '1000030012' ?
                                        { fontSize: 14, marginLeft: '6px', position: 'relative', top: '1px', color: '#FF9300' } :
                                        { fontSize: 14, marginLeft: '6px', position: 'relative', top: '1px', color: '#5CAAE3' }} /> : null}
                        </Cell>
                    }
                    return <Cell tip={true} className={getClassName(list[ps.rowIndex], op.idAlignType)}>
                        {(op.idFieldType == '1000040002' && Number(list[ps.rowIndex][op.fieldName]) !== NaN) ? addThousandsPosition(list[ps.rowIndex][op.fieldName]) : list[ps.rowIndex][op.fieldName]}
                    </Cell>
                }}
            />
            cols.push(col)
        }
    })
    cols.push(<Column name='right' columnKey='right' flexGrow={1} width={0}
        header={<Cell name='cb'></Cell>}
        cell={(ps) => {
            return <Cell name='cell' className={!Number(list[ps.rowIndex].seq) ? 'total' : ''}></Cell>
        }} />)
    return cols
}

function getClassName(option, idAlignType) {
    let leftName = 'mk-datagrid-cellContent-left',
        rightName = 'mk-datagrid-cellContent-right'

    if (idAlignType == '1000050002') {
        return !Number(option.seq) ? 'total' : ''
    } else if (idAlignType == '1000050003') {
        return !Number(option.seq) ? `total ${rightName}` : rightName
    } else {
        return !Number(option.seq) ? `total ${leftName}` : leftName
    }
}

function addThousandsPosition(value) {
    let num
    if (!value) {
        return ''
    }
    num = parseFloat(value).toFixed(2)
    let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g
    return num.replace(regex, "$1,")
}



