import React from 'react';
import { TableOperate, Select, Button, Modal, Icon, PrintOption, FormDecorator } from 'edf-component'
import utils from 'edf-utils'
const VOUCHERSTATUS_NotApprove = '1000020001',  // 单据状态:  1000020001: 未审核
    VOUCHERSTATUS_Approved = '1000020002',  // 单据状态:  1000020002: 已审核
    VOUCHERSTATUS_Rejected = '1000020003'     // 单据状态:  1000020003: 已驳回


    
export default function getColumns(columns, tableOption, _this) {
    const dataSource = _this.metaAction.gf('data.list') //dataSource []
    const arr = [];
    //增加一列序号列
    arr.push({
        title: '序号',
        key: 'index',
        className: 'table_td_align_center',
        dataIndex: 'index',
        //fixed: 'left',
        width: 70,
        render: (text, record, index) => {
            let num = calcRowSpan(record.docId, 'docId', index);//计算跨行数
            return {
                children: (
                    <span>
                        {index}
                    </span>
                ),
                props: {
                    rowSpan: num,
                },
            }
        }
    }
    )
    columns.forEach(data => {
        let sortColumns = getSortColumnsItem(data.fieldName,dataSource) //需要排序操作的单独处理
        if (!data.isVisible) {
            return
        }
        if (sortColumns) {
            arr.push(sortColumns)
        } else if (data.isHeader == true) {
            //作为表头 需要跨行
            arr.push({
                title: data.caption,
                key: data.fieldName,
                className: `table_td_align_${needAlignType(data.fieldName)}`,
                dataIndex: data.fieldName,
                render: (text, record, index) => renderRowSpan(text, record, index, data.fieldName)
            })
        } else {
            //作为明细 不需要跨行
            // if (data.fieldName == 'accountCodeName') {
            //     //不处理数字
            //     arr.push({
            //         title: data.caption,
            //         key: data.fieldName,
            //         dataIndex: data.fieldName,
            //         className: `table_td_align_${_this.needAlignType(data.fieldName)}`,
            //         render: _this.normalTdRender2
            //     })
            // } else {
            arr.push({
                title: data.caption,
                key: data.fieldName,
                className: `table_td_align_${needAlignType(data.fieldName)}`,
                dataIndex: data.fieldName,
                render: (text, record, index) => normalTdRender(text, record, index, data.fieldName)
            })
            //    }
        }
    })

    //操作栏目列
    arr.push({
        title: (
            <Icon
                name="columnset"
                fontFamily='edficon'
                className='ttk-table-app-list-columnset'
                type="youcezhankailanmushezhi"
                onClick={() => _this.showTableSetting({ value: true })}
            />
        ),
        key: 'voucherState',
        dataIndex: 'voucherState',
        fixed: 'right',
        className: 'table_fixed_width',
        //componet: 'TableOperate',
        width: 70,
        render: (text, record, index) => operateCol(text, record, index,_this)
    })
    return arr
}

//获取需要排序的列
function getSortColumnsItem(type, dataSource) {
    const data = dataSource;
    const columns = [{
        title: {
            name: 'sort',
            component: 'TableSort',
            sortOrder: data.sort.userOrderField == "voucherDate" ? data.sort.order : null,
            handleClick: (e) => { this.sortChange("voucherDate", e) },
            title: '单据日期'
        },
        dataIndex: 'voucherDate',
        key: 'voucherDate',
        className: 'table_center',
        render: renderRowSpan
    }, {
        title: {
            name: 'sort',
            component: 'TableSort',
            sortOrder: data.sort.userOrderField == "docCode" ? data.sort.order : null,
            handleClick: (e) => { this.sortChange("docCode", e) },
            title: '单据号'
        },
        className: 'table_center',
        dataIndex: 'docCode',
        key: 'docCode',
        render: renderRowSpanA
    }]

    return columns.find(item => {
        return item.dataIndex == type
    })

    // return columns
}

//对齐方式 货币右对齐 文字左对齐 其他居中
function needAlignType(key) {
    const right = ['amountSum', 'origAmount', 'amountDr', 'price', 'amountCr']
    const left = ['summary', 'accountCodeName', 'currencyAndExchangeRate', 'sourceVoucherCode', 'creator', 'auditor']
    const center = ['quantity', 'attachedNum', 'voucherStateName', 'unitName']
    let className = right.includes(key) ? 'right' : left.includes(key) ? 'left' : 'center'
    return className
}

//跨行 不带a标签
function renderRowSpan(text, row, index, key) {
    const obj = {
        children: <span className="ttk-table-app-list-td-con"><span title={transformThoundsNumber(text, key)}>{transformThoundsNumber(text, key)}</span></span>,
        props: {
            rowSpan: calcRowSpan(row.docId, 'docId', index),
        },
    }
    return obj
}

//跨行 带a链接
function renderRowSpanA(text, row, index) {
    const num = calcRowSpan(row.docId, 'docId', index)
    const obj = {
        children: (
            <span className="ttk-table-app-list-td-con">
                <a
                    href="javascript:;"
                    // onClick={() => this.openMoreContent(row.docId, false)}
                    className="table-needDel"
                    title={text}
                    data-rol={num}>
                    {text}
                </a>
            </span>
        ),
        props: {
            rowSpan: num,
        },
    }
    // console.log(obj);
    return obj
}

//带数字的单元格渲染
function normalTdRender(text, record, index, key) {
    return <span className="ttk-table-app-list-td-con" title={transformThoundsNumber(text, key)}>{transformThoundsNumber(text, key)}</span>
}

//不带数字的单元格渲染
function normalTdRender2(text) {
    return <span title={text} className="ttk-table-app-list-td-con" title={text}>{text}</span>
}

//计算 跨行数 docId为主键占一行 其它的明细行都按照docId分类 docId相同视为同一单的明细  表头根据明细数判断跨行数
function calcRowSpan(text, columnKey, currentRowIndex, dataSource) {
    //text  当前行主键的值（docId）
    //columnkey  行的主键 'docId'
    //currentRowIndex 当前{}的索引 index
    //以docId为主键 相同的docId的{}合并为一行
    const list = dataSource //dataSource []

    if (!list) return
    const rowCount = list.size //dataSource 长度 明细数

    if (rowCount == 0 || rowCount == 1) return 1

    //重复
    if (currentRowIndex > 0
        && currentRowIndex <= rowCount
        && text == list.getIn([currentRowIndex - 1, columnKey])) {
        return 0
    }

    //获取[]中相同docId的{}数
    let rowSpan = 1
    for (let i = currentRowIndex + 1; i < rowCount; i++) {
        if (text == list.getIn([i, columnKey]))
            rowSpan++
        else
            break
    }
    //  console.log(list.getIn([1,'docId'])); //获取list中第i个docId的值
    return rowSpan
}

//数字的转化
function transformThoundsNumber(text, key) {
    const arr = ['amountCr', 'amountDr', 'origAmount', 'price', 'amountSum']
    // text = -0.01
    if (arr.includes(key)) {
        if (!text || parseFloat(text) == 0 || isNaN(parseInt(text))) {
            return ''
        }
        if (key == 'price') {
            return utils.number.format(text, 6)
        } else {
            return utils.number.format(text, 2)
        }
    } else {
        return text
    }
}

    //操作栏目列
  function  operateCol (text, record, index,_this)  {
        const { voucherState, docId } = record
        const num = calcRowSpan(docId, 'docId', index)
        const obj = {
            children: (
                // <span className="table-needDel2" data-rol={num} data-sign={docId}>
                <span>
                    <TableOperate
                        viewClick={() => this.openMoreContent(docId, false)}
                        editClick={() => this.openMoreContent(docId, false)}
                        deleteClick={() => this.delModal(docId, record.ts)}
                        status={voucherState == VOUCHERSTATUS_Approved ? 1 : 2}
                    />
                </span>
            ),
            props: {
                rowSpan: num,
            },
        }

        return obj
    }
