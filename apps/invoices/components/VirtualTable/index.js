import React, { createElement, PureComponent } from "react"
import classNames from "classnames"
import { Spin } from "edf-component"
import TableHeader from "./TableHeader"
import TableBody from "./TableBody"
import TableContext from "./context"
import {
    getSelectCol,
    getEstimatedTotalSize,
    getItemMetadata,
    findNearestItem,
    flatCol,
    isSupportSticky,
} from "./utils"
import isEqual from "lodash.isequal"
import shallowEqual from "./shallowEqual"
import { addEvent, removeEvent, findDomFromParent } from "../../utils"
import { dom, throttle } from "edf-utils"
const { cursorAtBegin, cursorAtEnd } = dom
import { Resizable } from "react-resizable"
// import scrollFactory from "./scrollFactory"

// import debounce from "lodash.debounce"
/**
 * VirtualTable，采用了定宽、定高策略
 * @Author   weiyang.qiu
 * @DateTime 2020-03-24T11:00:36+0800
 *    - [☑️] 1、伸缩列
 *        resizeAble<Boolean>:true/false
 *        结合react-resizable来实现。可参考demo上多层表头和伸缩列的例子
 *    - [☑️] 2、锁定列
 *        fixed<String>:'left'/'right'
 *        default:undefined
 *    - [☑️] 3、单元格自动换行
 *        如果行高不够，需要换行，结合rowHeight和rowClass来实现
 *    - [☑️] 4、自定义列
 *        render:Node
 *    - [☑️]  5、排序
 *        render:sort Node
 *    - [☑️]  6、分页
 *        使用pagination控制dataSource来实现，table不集成
 *    - [ ] 7、树形展示
 *        暂不支持
 *    - [☑️] 8、可展开
 *        expandable={
 *            expandedRowRender:(record, index, indent, expanded)=>ReactNode,
 *            rowExpandable:(record)=>Boolean,
 *            rowExpandedHeight:(record)=>Bumber
 *        }
 *    - [☑️]  9、可编辑
 *        默认支持，
 *    - [☑️] 10、加载中
 *        loading<Boolean>:false/true
 *    - [☑️] 11、合并单元格
 *        colSpan
 *    - [☑️] 12、汇总行
 *        summaryRows<Object>:{
 *          rows:Node,
 *          rowsComponent<Function>:function(columns){
 *              return Node
 *          },
 *          height<Number>:37
 *        }
 *        具体用法请参考事例 SimpleTable
 *    - [☑️] 13、可变行高
 *        rowHeight:(rowIndex)=>Number
 *    - [ ] 14、固定表头在页首
 *    - [☑️] 15、流体列宽
 *        flexGrow<Number>:1
 *        default:undefined
 *    - [☑️] 16、可变行样式
 *        rowClass:(rowIndex)=>String
 *    - [☑️] 17、多表头
 *        columns带children
 *        具体用法，请参考事例
 *    - [☑️] 18、虚拟化
 *        天生拥有
 *    - [☑️] 19、滚动到指定行、列
 *        ref.current.scrollToRow(rowIndex)
 *        比如在调用组件的componentDidMount钩子函数中使用
 *    - [☑️] 20、记住滚动位置
 *        initialScrollIndex<Number>:undefined
 *        传入数据行索引
 *    - [☑️] 21、行选择
 *        rowSelection:{
 *           selectedRowKeys<Array>:[],
 *           type<String>:'radio'/'checkbox';default:'checkbox',
 *           columnWidth<Number>:60,
 *           selections<Array>:[],
 *           onChange<Function>:(selectedRowKeys, record, checked)=>undefined,
 *           getCheckboxProps<Function>:record=>({disabled:true/false})
 *        }
 *    - [☑️] 22、行事件
 *        onRow:(record)=>{
 *            onClick:()=>undefined,
 *            onMouseEnter:()=>undefined,
 *            onMouseLeave:()=>undefined,
 *            onDoubleClick:()=>undefined,
 *            onContextMenu:()=>undefined,
 *        }
 *    - [☑️] 23、数据变化后，滚动到指定高度
 *        scrollTop:Number
 *        default:undefined
 *        可通过tableRef.current.bodyRef.current.scrollTop来获取滚动之前的位置
 *    - [☑️] 24、纵向不可以滚动
 *        verticalScrollUnAvail:()=>Boolean
 *        default:false
 *  - 扩展属性：
 *  1、openShortcuts<Boolean>:true/false
 *  开启快捷键，默认false，需配合属性shortcutsClass一起使用
 *  现支持的快捷键有：enter,tab,left,right,up,down
 *  antd 3.8.4内：
 *      RangePicker 不支持快捷键；
 *      MonthPicker 弹出后，不支持方向键
 *  2、shortcutsClass<String>
 *  快捷键挂载元素的class，一般是渲染表格的父元素
 *  3、allowResizeColumn<Boolean>:true/false
 *  允许伸缩列，默认false
 *  某列不伸缩，给改列属性 resizeAble ，设为false
 *  如有 summaryRows 且需让列伸缩后，summaryRows的列也跟着伸缩，请给 summaryRows 传入 rowsComponent
 *  ps：如果发现伸缩不流畅，请检查 scroll.x 是否大于 width
 */
const Wrapper = props => <div {...props}>{props.children}</div>
const getComponents = props => {
    const { body } = props.components || {}
    const { row, cell } = body || {}
    return {
        body: {
            row: row || Wrapper,
            cell: cell || Wrapper,
        },
    }
}
export default class VirtualTable extends PureComponent {
    static defaultProps = {
        overscanCount: 2,
        showHeader: true,
        prefixCls: "vt",
        rowHeight: rowIndex => 37,
        estimatedItemSize: 50,
        loading: false,
        tip: "加载中...",
        delay: 100,
        expandable: {
            expandedRowRender: (record, index, indent, expanded) => null,
            rowExpandable: record => false,
            rowExpandedHeight: rowIndex => 0,
        },
    }
    constructor(props) {
        super(props)
        const cols =
            (props.allowResizeColumn && getResizeTitle(props.columns, this.handerResize)) ||
            props.columns
        this._instanceProps = {
            itemMetadataMap: {},
            lastMeasuredIndex: -1,
            prefixCls: props.prefixCls || "vt",
            showHeader: props.showHeader,
            estimatedItemSize: props.estimatedItemSize,
            tableId: "virtual-table-" + new Date().valueOf(),
            needReCalculate: true,
            dataSourceIsEqual: false,
        }
        this.state = {
            isScrolling: false,
            scrollDirection: "forward",
            scrollOffset: 0,
            expandItems: {},
            columns: cols,
            scrollContentHeight: getEstimatedTotalSize(props, this._instanceProps),
        }
        this.initColsWidth = flatCol(cols)
            .map(m => m.width || m.minWidth || 0)
            .reduce((a, b) => a + b, 0)

        this.headerScrollRef = React.createRef()
        this.bodyRef = React.createRef()
        this.scrollToRow = this.scrollToRow.bind(this)
        if (!window.cssSupportSticky) isSupportSticky()
        this.throttleUpdate = throttle(this.update, 37)
        this.prevRowCount = (Array.isArray(props.dataSource) && props.dataSource.length) || 0
    }
    handerResize = key => (e, { size }) => {
        const columns = resizeCols(this.state.columns, key, size)
        this.setState({ columns })
    }

    scrollToRow(rowIndex) {
        const { itemMetadataMap } = this._instanceProps
        if (itemMetadataMap && itemMetadataMap[rowIndex] && this.bodyRef) {
            this.bodyRef.current.scrollTop = itemMetadataMap[rowIndex].offset || 0
        }
    }
    getStartIndexForOffset(props, offset, instanceProps) {
        return findNearestItem(props, instanceProps, offset)
    }
    getStopIndexForStartIndex(props, startIndex, scrollOffset, instanceProps) {
        var height = props.scroll.y || props.height,
            itemCount = props.dataSource.length,
            width = props.width

        var size = height
        var itemMetadata = getItemMetadata(props, startIndex, instanceProps)
        var maxOffset = scrollOffset + size
        var offset = itemMetadata.offset + itemMetadata.size
        var stopIndex = startIndex

        while (stopIndex < itemCount - 1 && offset < maxOffset) {
            stopIndex++
            offset += getItemMetadata(props, stopIndex, instanceProps).size
        }

        return stopIndex
    }
    _getRangeToRender(state) {
        const { dataSource, overscanCount } = this.props
        const { isScrolling, scrollDirection, scrollOffset } = state || this.state
        const itemCount = dataSource.length

        if (itemCount === 0) {
            return [0, 0, 0, 0]
        }
        const startIndex = this.getStartIndexForOffset(
            this.props,
            scrollOffset,
            this._instanceProps
        )
        const stopIndex = this.getStopIndexForStartIndex(
            this.props,
            startIndex,
            scrollOffset,
            this._instanceProps
        )
        this._instanceProps.lastMeasuredIndex = stopIndex
        const overscanBackward =
            !isScrolling || scrollDirection === "backward" ? Math.max(1, overscanCount) : 1
        const overscanForward =
            !isScrolling || scrollDirection === "forward" ? Math.max(1, overscanCount) : 1

        return [
            Math.max(0, startIndex - overscanBackward),
            Math.max(0, Math.min(itemCount - 1, stopIndex + overscanForward)),
            startIndex,
            stopIndex,
        ]
    }
    onKeyDown(e) {
        handleKeyDown(e, this.props.shortcutsClass)
    }
    componentDidMount() {
        const { initialScrollIndex, shortcutsClass, openShortcuts } = this.props
        if (openShortcuts) {
            const tableDom = document.querySelector(`.${shortcutsClass}`)
            tableDom && addEvent(tableDom, "keydown", ::this.onKeyDown)
        }
        if (typeof initialScrollIndex === "number") {
            this.scrollToRow(initialScrollIndex)
        }
    }
    componentDidUpdate(prevProps) {
        if (!this._instanceProps.dataSourceIsEqual && this.bodyRef.current.scrollTop > 0) {
            let scrollOffset = this.props.scrollTop || 0
            // console.log("componentDidUpdate:", scrollOffset, this.bodyRef.current.scrollTop)
            this.setState({ scrollOffset }, () => {
                this.bodyRef.current.scrollTop = scrollOffset
            })
        }
    }
    componentWillUnmount() {
        const { shortcutsClass, openShortcuts } = this.props
        if (openShortcuts) {
            const tableDom = document.querySelector(`.${shortcutsClass}`)
            tableDom && removeEvent(tableDom, "keydown", ::this.onKeyDown)
        }
    }
    onExpand(index, expanded) {
        const item = this._instanceProps.itemMetadataMap[index],
            lastMeasuredIndex = this._instanceProps.lastMeasuredIndex
        if (item) item.expanded = expanded

        this._instanceProps.lastMeasuredIndex = -1
        getItemMetadata(
            this.props,
            this.props.dataSource.length - 1,
            this._instanceProps,
            false,
            true
        )
        this._instanceProps.lastMeasuredIndex = lastMeasuredIndex
        // console.log("onExpand:", index, expanded, this._instanceProps)
        this.setState(({ expandItems }) => {
            const nextItems = { ...expandItems }
            nextItems[index] = item.expanded
            return { expandItems: nextItems }
        })
    }
    componentWillReceiveProps(nextProps) {
        const { dataSource, rowsCount } = this.props
        let { columns, scrollContentHeight } = this.state
        let dataSourceHasChange = false,
            columnsHasChange = false
        const nextRowCount = Array.isArray(nextProps.dataSource) ? nextProps.dataSource.length : 0
        if (this.prevRowCount !== nextRowCount || !isEqual(dataSource, nextProps.dataSource)) {
            this.prevRowCount = nextRowCount
            dataSourceHasChange = true
            this._instanceProps.needReCalculate = true
            this._instanceProps.dataSourceIsEqual = false
        } else {
            this._instanceProps.dataSourceIsEqual = true
            this._instanceProps.needReCalculate = false
        }
        if (dataSourceHasChange || !shallowEqual(this.props.columns, nextProps.columns)) {
            if (nextProps.allowResizeColumn) {
                columns = getResizeTitle(nextProps.columns, this.handerResize)
                this.initColsWidth = flatCol(columns)
                    .map(m => m.width || m.minWidth || 0)
                    .reduce((a, b) => a + b, 0)
            } else {
                columns = nextProps.columns
            }
            columnsHasChange = true
        }
        if (dataSourceHasChange) {
            scrollContentHeight = getEstimatedTotalSize(nextProps, this._instanceProps)
        }
        ;(dataSourceHasChange || columnsHasChange) &&
            this.setState({
                columns,
                scrollContentHeight,
            })
    }
    updateState(state, cb) {
        const { scrollDirection, scrollOffset, startIndex, stopIndex, delay, callThrottle } = state
        const itemMetadataMap = this._instanceProps.itemMetadataMap
        const height = this.props.height || (this.props.scroll || {}).x || 400
        const startItemOffset =
            (itemMetadataMap[startIndex + 5] && itemMetadataMap[startIndex + 5].offset) || 0
        const stopItemOffset =
            (itemMetadataMap[stopIndex - 5] && itemMetadataMap[stopIndex - 5].offset) || 0
        const forward =
            scrollDirection === "forward" && scrollOffset + height / 3 >= startItemOffset
        const backward =
            scrollDirection === "backward" && scrollOffset - height / 3 <= stopItemOffset
        callThrottle
            ? this.throttleUpdate(state, cb, forward, backward)
            : this.update(state, cb, forward, backward)
    }
    update(state, cb, forward, backward) {
        if (state.scrollOffset !== this.bodyRef.current.scrollTop) {
            state.scrollOffset = this.bodyRef.current.scrollTop
        }
        const { scrollDirection, scrollOffset, startIndex, stopIndex, delay, callThrottle } = state
        let [nextStart, nextStop] = this._getRangeToRender(state)
        if ((forward || backward) && (nextStart !== startIndex || nextStop !== stopIndex)) {
            this.isScrolling = true
            nextStart = Math.max(
                this.viewportSize ? nextStop - this.viewportSize - 2 : nextStart,
                0
            )
            this.renderRange = [nextStart, nextStop]
            this.setState(
                {
                    ...state,
                },
                () => {
                    this.isScrolling = false
                    cb && cb()
                }
            )
        } else {
            cb && cb()
        }
    }
    render() {
        const {
            columns,
            dataSource,
            scroll,
            width,
            height,
            style,
            className,
            loading,
            tip,
            delay,
            verticalScrollUnAvail,
            allowResizeColumn,
        } = this.props
        // 无数据时，不开启伸缩列
        // console.time("-----vtable----time--")
        const _allowResizeColumn = dataSource && dataSource.length > 0 ? allowResizeColumn : false
        const _columns = [...((_allowResizeColumn && this.state.columns) || columns)]
        const summaryRows = getSummaryRows(this.props.summaryRows, _columns)
        const items = []
        let renderRange = [0, -1]
        let estimatedTotalSize = this.state.scrollContentHeight || scroll.y || height || 400
        if (dataSource.length > 0) {
            estimatedTotalSize += ((summaryRows && summaryRows.height) || 0) + 10
            if (!this.isScrolling) {
                renderRange = this._getRangeToRender()
                this.viewportSize = renderRange[1] - renderRange[0]
            }
        }
        let [startIndex, stopIndex] = !this.isScrolling ? renderRange : this.renderRange
        for (let index = startIndex; index <= stopIndex; index++) {
            dataSource[index] && items.push({ ...dataSource[index] })
        }
        let scrollX = scroll.x
        if (allowResizeColumn) {
            const diffWidth =
                flatCol(_columns)
                    .map(m => m.width || m.minWidth || 0)
                    .reduce((a, b) => a + b, 0) - this.initColsWidth
            diffWidth > 0 && (scrollX += diffWidth)
        }
        // console.timeEnd("-----vtable----time--")
        return (
            <TableContext.Provider
                value={{
                    prefixCls: this._instanceProps.prefixCls,
                    showHeader: this._instanceProps.showHeader,
                    ...this.props,
                    dataSource: null,
                    startIndex,
                    stopIndex,
                    columns: getSelectCol({ ...this.props, columns: _columns }, flatCol(_columns)),
                    onExpand: ::this.onExpand,
                    components: getComponents(this.props),
                    scroll: { ...scroll, x: scrollX },
                    summaryRows,
                    allowResizeColumn: _allowResizeColumn,
                }}>
                <div
                    className={`${this._instanceProps.prefixCls}-table ${
                        this._instanceProps.tableId
                    } ${className || ""}`}
                    key={this._instanceProps.tableId}
                    style={{
                        ...style,
                        maxWidth: width + "px",
                        maxHeight: height + "px",
                    }}
                    onTouchMove={e => {
                        e.preventDefault()
                    }}>
                    <Spin spinning={loading} tip={tip} delay={delay}>
                        <TableHeader headerScrollRef={this.headerScrollRef}></TableHeader>
                        <TableBody
                            itemMetadataMap={this._instanceProps.itemMetadataMap || {}}
                            dataSource={items || []}
                            bodyRef={this.bodyRef}
                            headerScrollRef={this.headerScrollRef}
                            updateState={::this.updateState}
                            rowTotalHeight={estimatedTotalSize}
                            height={height || scroll.y || 400}
                            verticalScrollUnAvail={verticalScrollUnAvail}
                            tableId={this._instanceProps.tableId}></TableBody>
                    </Spin>
                </div>
            </TableContext.Provider>
        )
    }
}
const getSummaryRows = (summaryRows, columns) => {
    if (!summaryRows) return null
    let { rowsComponent, rows } = summaryRows
    if (typeof rowsComponent === "function") rows = rowsComponent
    return {
        ...summaryRows,
        rows,
    }
}
const handleKeyDown = (e, tableClass) => {
    var cellInfo = {},
        action = null,
        targetClass = e.target.className,
        keyCode = e.keyCode
    if (
        keyCode == 37 ||
        keyCode == 39 ||
        keyCode == 13 ||
        keyCode == 108 ||
        keyCode == 9 ||
        keyCode == 38 ||
        keyCode == 40
    ) {
        cellInfo = getCellInfo(e, tableClass)
        if (!cellInfo) return false
        // console.log(keyCode, targetClass, cellInfo)
        // e.preventDefault && e.preventDefault()
        // e.stopPropagation && e.stopPropagation()
    }

    //37:左键
    if (keyCode == 37) {
        if (
            (targetClass.indexOf("input") > -1 && !cursorAtBegin(e)) ||
            targetClass.indexOf("ant-calendar") > -1
        )
            return
        action = "left"
    }
    //39:右键 13:回车 108回车 tab:9
    if (keyCode == 39 || keyCode == 13 || keyCode == 108 || keyCode == 9) {
        // 应该只有右键的时候，才会去判断光标是否已经到了文本的末端
        // 回车键、tab键不需要判断，直接切换
        if (
            (keyCode == 39 && targetClass.indexOf("input") > -1 && !cursorAtEnd(e)) ||
            (keyCode == 39 && targetClass.indexOf("ant-calendar") > -1)
        )
            return
        action = "right"
    }
    //38:上键
    if (keyCode == 38) {
        if (
            targetClass.indexOf("ant-select-selection") > -1 ||
            targetClass.indexOf("ant-calendar") > -1
        )
            return
        action = "up"
    }
    //40:下键
    if (keyCode == 40) {
        if (
            targetClass.indexOf("ant-select-selection") > -1 ||
            targetClass.indexOf("ant-calendar") > -1
        )
            return
        action = "down"
    }
    if (action) {
        cellAutoFocusOut(e.target)
        setTimeout(() => {
            document.querySelector("." + tableClass).click()
        }, 1)
        setTimeout(() => {
            moveEditCell(cellInfo, action, tableClass)
        }, 10)
    }
}
const getCellInfo = (e, tableClass) => {
    // nextSibling
    // previousSibling
    if (e && e.path && Array.isArray(e.path)) {
        let cell =
                e.path.find(
                    f => f.nodeName === "DIV" && f.className.indexOf("vt-body-row-cell cell-") > -1
                ) || findDomFromParent(`.${tableClass} .edited-cell`, "vt-body-row-cell cell-"),
            row =
                e.path.find(
                    f => f.nodeName === "DIV" && f.className.indexOf("vt-body-row row-") > -1
                ) || findDomFromParent(`.${tableClass} .edited-cell`, "vt-body-row row-")
        return {
            rowIndex: Number(
                [...((row && row.classList) || [])]
                    .find(f => f.indexOf("row-") === 0)
                    .replace("row-", "")
            ),
            colIndex: Number(
                [...((cell && cell.classList) || [])]
                    .find(f => f.indexOf("cell-") === 0)
                    .replace("cell-", "")
            ),
            maxCol: (row && row.children.length) || 0,
        }
    }
    return null
}
const cellAutoFocus = editorDOM => {
    if (!editorDOM) return
    const domClassName = editorDOM.className
    if (domClassName.indexOf("input") > -1) {
        if (editorDOM.select) {
            editorDOM.select()
        } else {
            const input = editorDOM.querySelector("input")
            input && input.select()
        }
        return
    }

    if (domClassName.indexOf("select") > -1) {
        editorDOM.click()
        const input = editorDOM.querySelector("input")
        input && input.select()
        return
    }

    if (domClassName.indexOf("datepicker") > -1) {
        const input = editorDOM.querySelector("input")
        input.click()
        return
    }

    if (domClassName.indexOf("checkbox") > -1) {
        const input = editorDOM.querySelector("input")
        input.focus()
        return
    }

    if (domClassName.indexOf("cascader") > -1) {
        editorDOM.click()
        const input = editorDOM.querySelector("input")
        input && input.select()
        return
    }
    if (domClassName.indexOf("editable-cell-value-wrap") > -1) {
        editorDOM.click()
        editorDOM.focus()
        // setTimeout(() => {
        //     this.cellAutoFocus(editorDOM)
        // }, 10)
        return
    }
}
const cellAutoFocusOut = editorDOM => {
    if (!editorDOM) return
    const outDom = document.querySelector(".edited-cell")
    // let input =
    //     outDom.querySelector(".ant-calendar-picker") ||
    //     outDom.querySelector(".ant-select-selection") ||
    //     outDom.querySelector(".ant-input")
    const inputs = outDom.querySelectorAll("input")
    const len = inputs.length
    const input = len > 1 ? inputs[len - 1] : inputs[0]
    input ? input.blur() : editorDOM.blur()
}
const moveEditCell = (cellInfo, action, tableClass) => {
    let rowIndex = cellInfo.rowIndex,
        colIndex = cellInfo.colIndex,
        maxCol = cellInfo.maxCol || 0,
        rows = document.querySelectorAll(`.${tableClass} .vt-body-scroll .vt-body-row`),
        firstRowIndex = Number(
            [...((rows[0] && rows[0].classList) || [])]
                .find(f => f.indexOf("row-") === 0)
                .replace("row-", "")
        ),
        maxRow = firstRowIndex + rows.length,
        cellDom = null,
        container = null

    switch (action) {
        case "up":
            rowIndex--
            break
        case "down":
            rowIndex++
            break
        case "left":
            colIndex--
            break
        case "right":
            colIndex++
            break
    }
    if (colIndex <= -1) {
        rowIndex--
        colIndex = maxCol - 1
    }
    if (colIndex >= maxCol) {
        rowIndex++
        colIndex = 0
    }
    if (rowIndex < 0 || !maxRow || rowIndex >= maxRow) {
        return false
    }

    cellDom = document.querySelector(
        `.${tableClass} .vt-body-row.row-${rowIndex} .vt-body-row-cell.cell-${colIndex}`
    )
    container = cellDom && cellDom.querySelector(".editable-cell-value-wrap")
    if (container) {
        cellAutoFocus(container)
    } else {
        moveEditCell({ rowIndex, colIndex, maxCol }, action, tableClass)
    }
}
const ResizeableTitle = props => {
    const { onResize, width, resizeAble, ...restProps } = props
    const children = <React.Fragment {...restProps} />
    if (!width || !resizeAble) {
        return children
    }

    return (
        <Resizable
            width={width}
            height="100%"
            axis="x"
            handle={resizeHandle => (
                <span className={`resizable-handle-${resizeHandle}`} onClick={stopPropagation} />
            )}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
            children={children}
        />
    )
}

function stopPropagation(e) {
    // e.preventDefault()
    e.persist && e.persist()
    e.stopPropagation()
}
const getResizeTitle = (cols, handerResize) => {
    const result = []
    cols.forEach(col => {
        const key = col.key || col.dataIndex
        const item = {
            ...col,
            key,
            minWidth: col.minWidth || 41,
            title: (
                <ResizeableTitle
                    resizeAble={col.resizeAble !== undefined ? col.resizeAble : true}
                    width={col.width}
                    onResize={handerResize(key)}
                    className={col.width ? "resizable" : ""}>
                    {col.title}
                </ResizeableTitle>
            ),
        }
        if (col.children) {
            item.children = getResizeTitle(col.children, handerResize)
        }
        result.push(item)
    })
    return result
}
const resizeCols = (cols, key, size) => {
    const result = []
    cols.forEach(col => {
        if (col.key === key) {
            col = {
                ...col,
                width:
                    size.width < col.minWidth
                        ? col.minWidth
                        : col.maxWidth && size.width > col.maxWidth
                        ? col.maxWidth
                        : size.width,
            }
        }
        if (col.children) {
            col.children = resizeCols(col.children, key, size)
        }
        result.push(col)
    })
    return result
}
