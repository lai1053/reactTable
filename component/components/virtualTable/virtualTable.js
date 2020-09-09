import React, { PureComponent } from "react"
import { VariableSizeList as List } from "./react-window"
import classNames from "classnames"
import { Table } from "antd"
import { NoData, Table as TtkTable } from "edf-component"
import { Resizable } from "react-resizable"
import { throttle, environment } from "edf-utils"
// import debounce from 'lodash.debounce'
const fun = function () { }
/**
 * VirualTable，对列采用了定宽，对行定高策略
 * @Author   weiyang.qiu
 * @DateTime 2019-11-11T11:00:36+0800
 * 1、在使用过程中，请给table一个固定style.width、一个固定scroll.x；
 * 2、如果style.width>scroll.x，请确保colums中有一列是未设宽。
 * 3、如果style.width<scroll.x，请确保每一列都有宽度
 * 4、使用事例，请参考 inv-app-ledger-list/action.js
 * 5、listRef,请传入函数，如果 (node)=>this.listRef=node,有了listRef，可以调用如listRef.scrollToItem(200);
 */
export default class VirtualTable extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
        // 滚动条宽
        this.scrollBarWidth = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
            ? 18
            : /Edge\/(\S+)/.test(navigator.userAgent)
                ? 18
                : 12
        this.vrTableClass = "virtual-table-" + new Date().valueOf()
        this.vrGridId = "virtual-grid-" + new Date().valueOf()
        this.onTableScroll = throttle(this.onTableScroll.bind(this), 100)
        // let browserType = environment.getBrowserVersion()
        // if(browserType && browserType.)
        this.onScroll = throttle(this.onScroll.bind(this), 100);
    }
    componentDidMount() {
        this.tableBodyAddEventListener()
    }

    componentWillUnmount() {
        const dom = document.querySelector(`.${this.vrTableClass} .ant-table-body`)
        if (dom) {
            removeEvent(dom, "scroll", this.onTableScroll)
        }
        if (this.onTableScroll) {
            this.onTableScroll.cancel()
        }
        if (this.onScroll) {
            this.onScroll.cancel()
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.tableNotMount) {
            this.tableBodyAddEventListener()
        }
        const dom = document.querySelector(
            `.${this.vrTableClass} .virtual-grid-main-scrollbar`
        )
        // window resize后，自定义滚动条位置修正
        if (dom) {
            const offsetLeft = document.querySelector(
                `.${this.vrTableClass} .ant-table-body`
            ).offsetWidth,
                left = offsetLeft - this.scrollBarWidth + 1 + "px"
            if (dom.style.left !== left) dom.style.left = left
        }
    }
    tableBodyAddEventListener() {
        const dom = document.querySelector(
            `.${this.vrTableClass} .ant-table-body`
        )
        if (dom) {
            this.tableNotMount = false
            addEvent(dom, "scroll", this.onTableScroll)
        } else {
            this.tableNotMount = true
        }
    }
    onTableScroll(e) {
        // 滚动条位置
        const dom = document.querySelector(
            `.${this.vrTableClass} .virtual-grid-main-scrollbar`
        )
        if (dom) {
            let offsetLeft = document.querySelector(
                `.${this.vrTableClass} .ant-table-body`
            ).offsetWidth
            dom.style.left =
                offsetLeft -
                this.scrollBarWidth +
                1 +
                e.target.scrollLeft +
                "px"
        }
    }
    onScroll({ scrollOffset }) {
        //双表格滚动不同步
        let tables = document.getElementsByClassName(this.vrGridId),
            dataInput = document.getElementById('data_input'),
            scroll = this.props.scroll,
            hasFocus = false
        if (dataInput && dataInput.tabFocus && Array.isArray(dataInput.tabFocus)) {
            dataInput.tabFocus.forEach(o => {
                if (scroll && scroll.class && scroll.class.includes(o)) {
                    hasFocus = true
                }
            })
        }

        if (tables && tables.length > 0) {
            for (var i = 0; i < tables.length; i++) {
                if (hasFocus && dataInput) {
                    if(window.self === window.top && event && event.target && $(event.target).attr('path') && $(event.target).attr('path').includes('tabs.children')) {
                        debounce(tabFocusScroll(tables[i], dataInput[`${scroll.class}-value`]))
                    } else {
                        $(tables[i]).prop({ "scrollTop": dataInput[`${scroll.class}-value`] })
                    }
                } else {
                    if (tables[i].scrollTop !== scrollOffset) {
                        // console.log('====滚动相等====')
                        $(tables[i]).prop({ "scrollTop": scrollOffset })
                    }
                    if (dataInput) {
                        dataInput[`${scroll.class}-value`] = scrollOffset
                    }
                }
            }
        }

    }

    onRowMouseEnter(rowIndex, e) {
        let rows = document.querySelectorAll(
            "." + this.vrGridId + " .virtual-table-row.row-" + rowIndex
        )
        if (rows && rows.length > 0) {
            let dom
            for (var i = 0; i < rows.length; i++) {
                dom = rows[i]
                if (dom) {
                    dom.className = [
                        ...new Set(
                            dom.className
                                .split(" ")
                                .concat("virtual-table-row-hover")
                        )
                    ].join(" ")
                }
            }
        }
        const { onRow, dataSource = [] } = this.props,
            { onMouseEnter } = (onRow && onRow(dataSource[rowIndex])) || {}
        onMouseEnter && onMouseEnter(e)
    }
    onRowMouseLeave(rowIndex, e) {
        let rows = document.querySelectorAll("." + this.vrGridId + " .virtual-table-row.row-" + rowIndex)
        if (rows && rows.length > 0) {
            let dom
            for (var i = 0; i < rows.length; i++) {
                dom = rows[i]
                if (dom) {
                    dom.className = dom.className.replace("virtual-table-row-hover", "")
                }
            }
        }
        const { onRow, dataSource = [] } = this.props,
            { onMouseLeave } = (onRow && onRow(dataSource[rowIndex])) || {}
        onMouseLeave && onMouseLeave(e)
    }
    onRowClick(rowIndex, e) {
        const { onRow, dataSource = [] } = this.props,
            { onClick } = (onRow && onRow(dataSource[rowIndex])) || {}
        onClick && onClick(e)
    }
    onRowDoubleClick(rowIndex, e) {
        const { onRow, dataSource = [] } = this.props,
            { onDoubleClick } = (onRow && onRow(dataSource[rowIndex])) || {}
        onDoubleClick && onDoubleClick(e)
    }
    onRowContextMenu(rowIndex, e) {
        const { onRow, dataSource = [] } = this.props,
            { onContextMenu } = (onRow && onRow(dataSource[rowIndex])) || {}
        onContextMenu && onContextMenu(e)
    }
    rowHeight(index) {
        let ds = this.props.dataSource
        if (ds[index].entrys && ds[index].entrys.length > 0) {
            return 37 * ds[index].entrys.length
        }
        return 37
    }
    flat(cols) {
        cols = cols.flatMap(item => {
            if (item.children) {
                item = this.flat(item.children)
            }
            return item
        })
        return cols
    }
    addSelectRow(cols, props) {
        const item = (props.children[0]
            ? props.children[0].props.columns
            : []
        ).find(f => f.key === "selection-column"),
            { rowSelection } = this.props
        if (!item || !rowSelection) return cols
        const { columnWidth } = rowSelection
            ; (item.width =
                typeof columnWidth === "string"
                    ? columnWidth.replace("px", "")
                    : columnWidth || 62),
                cols.splice(0, 0, item)
        return cols
    }
    computeProps(fixed, _columns) {
        let tableWidth = 0,
            marginLeft = 0,
            marginRight = 0,
            unSetWidthColumn = 0,
            scrollHidden = false
        switch (fixed) {
            case "left":
                scrollHidden = true
                tableWidth = _columns
                    .filter(f => f.fixed === "left")
                    .map(m => m.width)
                    .reduce((a, b) => a + b, 0)
                break
            case "right":
                tableWidth = _columns
                    .filter(f => f.fixed === "right")
                    .map(m => m.width)
                    .reduce((a, b) => a + b, 0)
                break
            default:
                if (_columns.some(s => s.fixed === "right")) {
                    marginRight = _columns
                        .filter(f => f.fixed === "right")
                        .map(m => m.width)
                        .reduce((a, b) => a + b, 0)
                    scrollHidden = true
                }
                if (_columns.some(s => s.fixed === "left")) {
                    marginLeft = _columns
                        .filter(f => f.fixed === "left")
                        .map(m => m.width)
                        .reduce((a, b) => a + b, 0)
                }
                unSetWidthColumn =
                    scroll.x -
                    _columns.map(m => m.width || 0).reduce((a, b) => a + b, 0)
                break
        }
        return {
            tableWidth,
            marginLeft,
            marginRight,
            unSetWidthColumn,
            scrollHidden
        }
    }
    renderVirtualList(props) {
        // fixed 的列，width不能为空。
        const {
            scroll,
            style: tableStyle,
            columns: tempColumns,
            dataSource: rawData,
            rowHeight,
            rowClassName,
            rowSelection,
            rowKey = "key",
            matchIndex,
            listRef
        } = this.props,
            _columns = this.addSelectRow(this.flat(tempColumns), props),
            fixed = props.children[0].props.fixed,
            columns = _columns.filter(f => f.fixed === fixed)
        let selectedRowKeys = [],
            overflowX = "hidden",
            overflowY = "auto",
            {
                tableWidth,
                marginLeft,
                marginRight,
                unSetWidthColumn,
                scrollHidden
            } = this.computeProps(fixed, _columns)
        const noWidthColumns = columns.filter(({ width }) => !width).length,
            mergedColumns = columns.map(column => {
                if (column.width) {
                    if (typeof column.width === "string")
                        column.width = column.width.replace("px", "")
                    return column
                }
                return {
                    ...column,
                    flex: column.flex || 1,
                    width:
                        unSetWidthColumn > 0
                            ? Math.floor(unSetWidthColumn / noWidthColumns)
                            : 100
                }
            }),
            // 单元格内容，可执行列配置的render方法
            renderCell = (columnIndex, rowIndex) => {
                const cell = mergedColumns[columnIndex],
                    dataIndex =
                        typeof cell.dataIndex === "function"
                            ? cell.dataIndex(rawData[rowIndex])
                            : cell.dataIndex
                return cell.render
                    ? cell.render(
                        rawData[rowIndex][dataIndex],
                        rawData[rowIndex],
                        rowIndex
                    )
                    : rawData[rowIndex][dataIndex]
            },
            // 列宽，最后一列特殊处理
            columnWidth = index => {
                const { width } = mergedColumns[index]
                if (!fixed && !marginRight)
                    return index === mergedColumns.length - 1
                        ? width - this.scrollBarWidth + 2
                        : width
                return fixed === "right" && index === mergedColumns.length - 1
                    ? width - this.scrollBarWidth + 2
                    : width
            },
            // 行中的每一列
            renderCols = (record, index) =>
                mergedColumns.map((col, i) => {
                    const { onCell } = col,
                        {
                            onClick: onCellClick,
                            onMouseEnter: onCellMouseEnter,
                            onMouseLeave: onCellMouseLeave,
                            onDoubleClick: onCellDoubleClick,
                            onContextMenu: onCellContextMenu
                        } = (onCell && onCell(record)) || {}
                    let cell = renderCell(i, index),
                        colWidth = 0,
                        colFlex = 0,
                        { props, children } =
                            Object.prototype.toString.call(cell) ===
                                "[object Object]"
                                ? cell
                                : {}
                    if (props) {
                        const { colSpan } = props
                        if (colSpan === 0) return null
                        if (colSpan) {
                            if (colSpan > 1)
                                for (var j = 0; j < mergedColumns.length; j++) {
                                    if (j >= i && j < i + colSpan) {
                                        colWidth += mergedColumns[j].width
                                        colFlex += mergedColumns[j].flex || 0
                                    }
                                }
                            cell = children
                        }
                    }
                    return (
                        <div
                            key={col.key || col.dataIndex}
                            className={classNames(
                                "virtual-table-cell",
                                {
                                    "virtual-table-cell-last":
                                        i === mergedColumns.length - 1
                                },
                                col.className || ""
                            )}
                            style={{
                                width: colWidth || columnWidth(i),
                                flex: colFlex || col.flex || "none",
                                // height: record.entrys?record.entrys.length*37+'px':37+'px',
                                textAlign:
                                    (col.key === "selection-column" &&
                                        "center") ||
                                    col.align ||
                                    "left"
                            }}
                            title={typeof cell === "string" && cell}
                            onMouseEnter={onCellMouseEnter || fun}
                            onMouseLeave={onCellMouseLeave || fun}
                            onClick={onCellClick || fun}
                            onDoubleClick={onCellDoubleClick || fun}
                            onContextMenu={onCellContextMenu || fun}
                        >
                            {cell}
                        </div>
                    )
                }),
            // list的每一行
            renderListRow = ({ index, style }) => {

                if (rowSelection) selectedRowKeys = rowSelection.selectedRowKeys
                const record = rawData[index],
                    dataIndex =
                        typeof rowKey === "function" ? rowKey(record) : rowKey,
                    rowSelected = selectedRowKeys.some(
                        s => s === record[dataIndex]
                    ),
                    calcstyle = {
                        ...style,
                        paddingLeft: marginLeft,
                        paddingRight: marginRight,
                        // top: this.getTopValue(index, record),
                        // height: record.entrys&&record.entrys.length>0?record.entrys.length*37+'px':37+'px'
                    },
                    total = record.entrys && record.entrys.find(item => item.summary == "本年累计" || item.summary == "本月合计")
                if (record.entrys) {
                    style.top = this.getTopValue(index, record)
                    style.height = record.entrys.length * 37 + 'px'
                }
                if (navigator.userAgent.indexOf("Firefox") > 0) { // firefox 浏览器样式错乱
                    calcstyle.position = '"initial" !important;'
                }
                return (
                    <div
                        className={classNames(
                            "virtual-table-row",
                            `row-${index}`,
                            { "virtual-table-row-selected": rowSelected },
                            rowClassName ? rowClassName(index) : "",
                            matchIndex != -1 && matchIndex == index
                                ? "currentScrollRow"
                                : "",
                            record.accountName == "合计" || record.isSubtotalData || record.summary == "本月合计" || record.summary == "本年累计" || total ? "total" : ""
                        )}
                        style={calcstyle}
                        onMouseEnter={e => this.onRowMouseEnter(index, e)}
                        onMouseLeave={e => this.onRowMouseLeave(index, e)}
                        onClick={e => this.onRowClick(index, e)}
                    // onDoubleClick={e => this.onRowDoubleClick(index, e)}
                    // onContextMenu={e => this.onRowContextMenu(index, e)}
                    >
                        {renderCols(record, index)}
                    </div>
                )
            }
        if (
            !fixed &&
            !marginRight && tableStyle &&
            tableStyle.width &&
            tableStyle.width.replace("px", "") < scroll.x
        ) {
            // 不是左右固定列，且表格容器宽<列宽
            return (
                <React.Fragment>
                    <List
                        style={{ overflowX, overflowY }}
                        className={classNames(this.vrGridId, {
                            "scroll-hidden": scrollHidden
                        })}
                        height={scroll.y || rawData.length * 37 || 100}
                        // itemCount={this.getcount()}
                        itemCount={rawData.length}
                        itemSize={rowHeight || this.rowHeight.bind(this)}
                        width={tableWidth || "100%"}
                        onScroll={this.onScroll}
                    >
                        {renderListRow}
                    </List>
                    <List
                        className={classNames(
                            this.vrGridId,
                            "virtual-grid-main-scrollbar"
                        )}
                        height={scroll.y || rawData.length * 37 || 100}
                        // itemCount={this.getcount()}
                        itemCount={rawData.length}
                        itemSize={rowHeight || this.rowHeight.bind(this)}
                        width={this.scrollBarWidth - 1}
                        style={{
                            overflowX: "hidden",
                            overflowY: "auto",
                            position: "absolute"
                        }}
                        onScroll={this.onScroll}
                        ref={listRef || fun}
                    >
                        {() => <div>&nbsp;</div>}
                    </List>
                </React.Fragment>
            )
        }
        return (
            <React.Fragment>
                <List
                    style={{ overflowX, overflowY }}
                    className={classNames(this.vrGridId, {
                        "scroll-hidden": scrollHidden
                    })}
                    height={scroll.y || rawData.length * 37 || 100}
                    // itemCount={this.getcount()}
                    itemCount={rawData.length}
                    itemSize={rowHeight || this.rowHeight.bind(this)}
                    width={tableWidth || "100%"}
                    onScroll={this.onScroll}
                    ref={listRef || fun}
                >
                    {renderListRow}
                </List>
            </React.Fragment>
        )
    }

    getTopValue = (index, record) => {
        let num = 0
        let ds = this.props.dataSource
        for (let i = 0; i < index; i++) {
            num += ds[i].entrys && ds[i].entrys.length > 0 ? ds[i].entrys.length : 1
        }
        return num * 37 + 'px';
    }
    render() {
        const {
            className,
            scroll,
            dataSource,
            emptyText,
            loading,
            delay,
            key,
            isScroll,
            matchIndex,
        } = this.props
        let tableHeader,
            _loading = {
                size: 'large',
                delay: delay || 2000,
                spinning: loading || false,
                tip: "数据加载中..."
            },
            dataInput = document.getElementById('data_input')

        if (isScroll) {
            let tableHeight = scroll.class &&
                document.getElementsByClassName(scroll.class) &&
                document.getElementsByClassName(scroll.class)[0],
                tableHeightY = tableHeight && tableHeight.offsetHeight
            
            tableHeader =
                document.getElementsByClassName("ant-table-thead") &&
                document.getElementsByClassName("ant-table-thead")[0]
            if (scroll.class && tableHeight) {
                scroll.y = tableHeightY - scroll.h
            }
        }

        if (dataSource && dataSource.length) {
            if ((matchIndex && matchIndex != -1) || matchIndex == 0) {
                if (isScroll && scroll.class && tableHeader && document.querySelectorAll("." + this.vrGridId)) {

                    let vrGrid = document.querySelectorAll("." + this.vrGridId), dom

                    for (var i = 0; i < vrGrid.length; i++) {
                        dom = vrGrid[i]

                        if (i === 0) {
                            // dom.style.width = scroll.x + "px"
                            // dom.scrollTop = matchIndex * 37
                            dataInput[`${scroll.class}-value`] = matchIndex * 37
                        }
                    }
                }
            }
            if (isScroll && !scroll.y && scroll.w) {
                this.props.shouldRender && this.props.shouldRender()
            }
            return (
                <Table
                    {...this.props}
                    key={key || this.vrTableClass}
                    className={classNames(
                        "virtual-table",
                        this.vrTableClass,
                        className
                    )}
                    loading={_loading}
                    scroll={{
                        x: scroll.x + 1,
                        y: scroll.y + (this.scrollBarWidth > 12 ? 30 : 12)
                    }}
                    components={{
                        header: {
                            cell: ResizeableTitle
                        },
                        body: {
                            wrapper: this.renderVirtualList.bind(this)
                        }
                    }}
                    pagination={false}
                    locale={{
                        emptyText: <NoData>{emptyText || "暂无数据"}</NoData>
                    }}
                ></Table>
            )
        }
        return (
            <TtkTable
                {...this.props}
                key={key || this.vrTableClass + "-1"}
                className={classNames("virtual-table", className)}
            ></TtkTable>
        )
    }
}

function tabFocusScroll(ele, pos) {
    return function() {
        $(ele).prop({ "scrollTop": pos })
    }
}

function debounce(func, wait = 500) {
    let dataInput = document.getElementById('data_input')

    let taskFun = (() => {
        if(dataInput.task) {
            clearTimeout(dataInput.task)
            dataInput.task = null
        }
        dataInput.task = setTimeout(() => {
            func()
        }, wait)
    })

    taskFun()
}

const addEvent = (ele, funName, fun) => {
    if (!ele) return
    if (ele.addEventListener) {
        ele.addEventListener(funName, fun, false)
    } else if (ele.attachEvent) {
        ele.attachEvent("on" + funName, fun)
    } else {
        ele["on" + funName] = fun
    }
}
const removeEvent = (ele, funName, fun) => {
    if (!ele) return
    if (ele.removeEventListener) {
        ele.removeEventListener(funName, fun, false)
    } else if (win.detachEvent) {
        ele.detachEvent("on" + funName, fun)
    } else {
        ele["on" + funName] = undefined
    }
}
const ResizeableTitle = props => {
    const { onResize, width, ...restProps } = props

    if (!width) {
        return <th {...restProps} />
    }

    return (
        <Resizable
            width={width}
            height={0}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
        >
            <th {...restProps} />
        </Resizable>
    )
}
