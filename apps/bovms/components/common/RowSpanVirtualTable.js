/*
headerRowCount: this.props.headerRowCount || 1, // 表头行数--多表头必传
dataSource, columns, // 列表数据
rowSpanKey // 列表行高关键字段，根据该数组的length * 37计算行高
footerRow // reactNode,合计行的第一个单元格加上fixed属性，可实现固定
bottom // 离视窗底部高度，默认为10
height // 表格高度(含表头)，若传入bottom会被忽略
allowResizeColumn // 列拖动

// columns
className='row-span-td' // 表格单元，有左右padding
className='row-span-td children'  // 表格单元，有左右padding, 有下边框
className='hidden-text' // 文字省略
*/


import React, {PureComponent, Fragment} from 'react'
import ReactDOM from 'react-dom'
import {Table} from 'edf-component'
import {fromJS} from 'immutable'
import VirtualTable from "../../../invoices/components/VirtualTable/index"
import classNames from "classnames"
import { eventUtil } from 'edf-utils'
const {addHandler, removeHandler} = eventUtil

export default class RowSpanVirtualTable extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isTrident: /Trident\/(\S+)/.test(navigator.userAgent),
            scrollProps: {
                x: 0,
                y: 0
             },
             sumWidth: 1000, // 总列宽
             colCount: 0, // 列数
             headerRowCount: this.props.headerRowCount || 1, // 表头行数--多表头必传
            //  initialSumWidth: 0, // 初始总列宽
            columns: [],
        }
    }

    componentDidMount() {
        this.getInitialColProps()
        let timer = setTimeout(() => {
            clearTimeout(timer)
            timer = null
            this.getScrollProps()
        }, 300)
        addHandler(window, 'resize', this.getScrollProps)
    }

    componentWillUnmount() {
        removeHandler(window, 'resize', this.getScrollProps)
    }

    // 获取父元素宽高
    getScrollProps = () => {
        const tableDom = ReactDOM.findDOMNode(this)
        if(!tableDom) { return }
        const parentDom = tableDom.parentNode
        let scrollWidth = parentDom.offsetWidth
        let {
            columns,
            initialSumWidth,
            colCount,
            headerRowCount,
            sumRowWidth,
            footerRow,
            isTrident
        } = this.state
        let increment = Math.floor((scrollWidth - initialSumWidth) / colCount)
        let sumWidth = initialSumWidth
        let bottom = this.props.bottom === undefined ? 10 : this.props.bottom
        let scrollHeight
        if(this.props.height) {
            scrollHeight = this.props.height - 37 * headerRowCount
        } else {
            scrollHeight = window.innerHeight - tableDom.getBoundingClientRect().top - bottom - 37 * headerRowCount
        }
        // 适应宽屏
        if(scrollWidth > initialSumWidth && increment >= 1) {
            const res = this.getSumWidth(columns, increment)
            sumWidth = scrollWidth = res.sumWidth
            sumRowWidth = res.sumRowWidth
            // footerRow = this.dealSumRow(res.sumRowWidth, colCount)
        }
        if(isTrident) {
            scrollWidth -= 1 * headerRowCount
            scrollHeight -= 1 * headerRowCount
        }
        this.setState({
            scrollProps: {
               x: scrollWidth,
               y: scrollHeight
            },
            sumWidth,
            sumRowWidth,
            // footerRow
        })
    }

    // 计算总宽及列数
    getSumWidth = (columns, increment) => {
        let sumWidth = 0, colCount = 0, sumRowWidth = []
        for(let i = 0, length = columns.length; i < length; i++) {
            if(columns[i].children) {
                const res = this.getSumWidth(columns[i].children, increment)
                sumWidth += res.sumWidth
                colCount += res.colCount
                sumRowWidth = [...sumRowWidth, ...res.sumRowWidth]
            } else {
                columns[i].width += increment
                sumWidth += columns[i].width
                colCount++
                sumRowWidth.push(columns[i].width)
            }
        }
        return {sumWidth, colCount, sumRowWidth}
    }

    // 初始化数据--表格列
    getInitialColProps = () => {
        const increment = this.state.isTrident ? 16 : 0
        let columns = this.props.columns || []
        columns = fromJS(columns).toJS()

        const res = this.getSumWidth(columns, increment),
        initialSumWidth = res.sumWidth,
        colCount = res.colCount
        // footerRow = this.dealSumRow(res.sumRowWidth, colCount)
        this.setState({
            columns,
            initialSumWidth,
            colCount,
            sumWidth: initialSumWidth,
            sumRowWidth: res.sumRowWidth,
            // footerRow
        })
    }

    // 合计行宽度
    dealSumRow = (sumRowWidth, colCount) => {
        const footerRow = this.props.footerRow
        if(!footerRow || !sumRowWidth) { return }
        footerRow.props.className = classNames(
            footerRow.props.className,
            {
                "vt-summary row": true,
                'ttk-bovms-app-common-row-span-virtual-table-sum-row': true,
                'isTrident': this.state.isTrident,
            }
        )
        const children = footerRow.props.children
        let span = 0
        if(children.length < colCount) {
            span = colCount - children.length
        }
        children.forEach((el, i) => {
            if(i > 0) {
                el.props.style = {width: `${sumRowWidth[i + span]}px`}
            } else {
                let width = 0
                for(let j = 0; j <= span; j++) {
                    width += sumRowWidth[j]
                }
                el.props.style = {width: `${width}px`}
                el.props.className = classNames(
                    el.props.className,
                    {
                        'vt-summary left': el.props.fixed,
                        'ttk-bovms-app-common-row-span-virtual-table-sum-row-title': true
                    }
                )
            }
        })

        return footerRow
    }

    render() {
        const { dataSource, rowSpanKey, allowResizeColumn, summaryRows } = this.props
        const {columns, scrollProps, sumWidth, headerRowCount, footerRow, isTrident, sumRowWidth, colCount} = this.state
        const className = classNames({
            'isTrident': isTrident,
            'ttk-bovms-app-common-row-span-virtual-table': true,
            'row-span': !!rowSpanKey
        })

        return (
            <Fragment>
                {
                    dataSource && dataSource.length ? 
                    <VirtualTable className={className} allowResizeColumn={!!allowResizeColumn}
                        dataSource={dataSource} columns={columns} scroll={{...scrollProps, x: sumWidth + 2}} headerHeight={37 * headerRowCount}
                        style={{width: scrollProps.x + 'px'}} width={scrollProps.x} height={scrollProps.y + 37 * headerRowCount}
                        // summaryRows={{rows: this.dealSumRow(sumRowWidth, colCount) || <div />, height: footerRow ? 37 : 0}}
                        summaryRows={summaryRows ? summaryRows : {rows: <div />, height: 0}}
                        rowHeight={(index)=> {
                            if(!rowSpanKey) {return 1}
                            const rows = (dataSource[index][rowSpanKey].length) || 1
                            return rows * 37
                        }}
                    /> :
                    <Table className='ttk-bovms-app-common-row-span-virtual-table'
                        columns={columns} dataSource={dataSource} bordered pagination={false} 
                        emptyShowScroll={true} scroll={{x: '100%'}}
                        style={{height: scrollProps.y + 74 + 'px'}}
                    />
                }
            </Fragment>
        )
    }
}