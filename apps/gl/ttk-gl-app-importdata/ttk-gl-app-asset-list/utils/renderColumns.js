import React from 'react'
import { DataGrid, Icon, Popover } from 'edf-component'

let percentage = ['salvageRate', 'salvageRateStr', 'inputTaxRate']

export default function renderColumns(list, other, _this) {
    let { Column, Cell } = DataGrid
    const columns = [
        // { fieldName: 'assetPropertyName', caption: '资产属性', width: 100, textalign: 'left' },
        { fieldName: 'isDraftName', caption: '状态', width: 80, textalign: 'center' },
        { fieldName: 'assetClassName', caption: '资产分类', width: 100, textalign: 'left' },
        { fieldName: 'code', caption: '资产编码', width: 100, textalign: 'left' },
        { fieldName: 'name', caption: '资产名称', width: 100, textalign: 'left' },
        { fieldName: 'buyDate', caption: '开始使用期间', width: 120, textalign: 'center' },
        { fieldName: 'origValue', caption: '原值', width: 80, textalign: 'right' },
        { fieldName: 'deprMonth', caption: '预计使用(月)', width: 100, textalign: 'center' },
        { fieldName: 'initAccuDepreciation', caption: '期初累计折旧', width: 100, textalign: 'right' },
        { fieldName: 'salvageRate', caption: '净残值率(%)', width: 100, textalign: 'right' },
        { fieldName: 'depreciationFunctionName', caption: '折旧方法', width: 130, textalign: 'center' },
        { fieldName: 'departmentName', caption: '使用部门', width: 80, textalign: 'center' },
        { fieldName: 'assetClassVsAccountStr', caption: '资产科目', width: 130, textalign: 'center' },
        { fieldName: 'depreciationVsAccountStr', caption: '累计折旧科目', width: 130, textalign: 'center' },
        { fieldName: 'chargeVsAccountStr', caption: '折旧损益科目', width: 130, textalign: 'center' },
    ]
        , cols = [
            <Column name='operation' columnKey='operation' width={85}
                fixedRight={true}
                header={<Cell name='cb'>操作</Cell>}
                cell={(ps) => {
                    return (<Cell name='cell' className={'app-oprate'}>
                        <Icon type="bianji"
                            fontFamily='edficon'
                            title="编辑"
                            style={{ fontSize: 23, cursor: 'pointer' }}
                            onClick={_this.modifyDetail(list[ps.rowIndex])} />
                        <Icon type="shanchu"
                            fontFamily='edficon'
                            title='删除'
                            style={{ fontSize: 23, cursor: 'pointer' }}
                            onClick={_this.delClick(list[ps.rowIndex])} />
                    </Cell>)
                }}
            />
        ]
    const state = _this.getSearchState()
    columns.forEach(op => {
        let col = <Column name={op.id} columnKey={op.fieldName} isResizable={true} width={op.width}
            header={<Cell name='header'>{op.caption}</Cell>}
            cell={(ps) => {
                return <Cell tip={list[ps.rowIndex].isDraft == 0 && op.fieldName == 'isDraftName' ? false : true}
                    className={list[ps.rowIndex].isDraft == 0 && state == 99 ? `align${op.textalign} isdraft` : `align${op.textalign}`}>
                    {
                        list[ps.rowIndex].isDraft == 0 && op.fieldName == 'isDraftName' ?
                            <span title={list[ps.rowIndex][op.fieldName]}>
                                <span title={list[ps.rowIndex][op.fieldName]}>{list[ps.rowIndex][op.fieldName]}</span>
                                <Popover placement="topLeft" content={list[ps.rowIndex].draftMsg ? list[ps.rowIndex].draftMsg : '草稿'} overlayClassName='ttk-gl-app-importdata-accountrelation-popover'>
                                    <Icon type="bangzhutishi"
                                        fontFamily='edficon'
                                        title='草稿'
                                        style={{ fontSize: 22, verticalAlign: 'middle' }} />
                                </Popover>
                            </span>
                            :
                            percentage.indexOf(op.fieldName) > -1 && list[ps.rowIndex][op.fieldName] ? list[ps.rowIndex][op.fieldName] + '%'
                                : list[ps.rowIndex][op.fieldName]

                    }
                </Cell>
            }}
        />
        cols.push(col)
    })
    return cols
}



