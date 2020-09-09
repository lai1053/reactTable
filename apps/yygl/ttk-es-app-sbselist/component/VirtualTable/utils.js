import React from "react"
import { Radio, Checkbox, Menu, Icon, Dropdown, Button } from "antd"
import classNames from "classnames"
import isEqual from "lodash.isequal"
const emptyFn = function() {}

function getSelectCol(props, flatCols) {
    const { rowSelection, columns, rowKey, dataSource } = props
    const {
        selectedRowKeys,
        type,
        columnWidth,
        selections,
        onChange,
        getCheckboxProps
    } = rowSelection || {}
    let _columns = []
    if (selectedRowKeys && onChange) {
        const render = (text, record, index) => {
            const dataIndex =
                    typeof rowKey === "function" ? rowKey(record) : rowKey,
                key = record[dataIndex],
                rowSelected = selectedRowKeys.some(
                    s => String(s) === String(key)
                ),
                disabled =
                    typeof getCheckboxProps === "function"
                        ? getCheckboxProps(record).disabled
                        : false,
                handelChange = e => {
                    let keys = [...selectedRowKeys]
                    if (e.target.checked) {
                        keys = [...keys, key]
                    } else {
                        keys = keys.filter(f => String(f) !== String(key))
                    }
                    e.stopPropagation && e.stopPropagation()
                    onChange(
                        Array.from(new Set(keys)),
                        record,
                        e.target.checked
                    )
                }
            if (type === "radio") {
                return (
                    <Radio
                        checked={rowSelected}
                        onChange={handelChange}
                        disabled={disabled}
                    ></Radio>
                )
            } else {
                return (
                    <Checkbox
                        checked={rowSelected}
                        onChange={handelChange}
                        disabled={disabled}
                    ></Checkbox>
                )
            }
        }

        const dropdownMenuItems = selections
            ? selections.map(s => (
                  <Menu.Item key={s.key} onClick={s.onSelect}>
                      {s.text}
                  </Menu.Item>
              ))
            : null
        const dropdownMenu = selections ? (
            <Menu>{dropdownMenuItems}</Menu>
        ) : null
        const dropdown = selections ? (
            <Dropdown overlay={dropdownMenu}>
                <Icon type="down"></Icon>
            </Dropdown>
        ) : null
        const handelAllChange = e => {
            if (e.target.checked) {
                onChange(
                    dataSource.map(
                        d =>
                            d[typeof rowKey === "function" ? rowKey(d) : rowKey]
                    )
                )
            } else {
                onChange([])
            }
        }
        const title = (
            <div className="select-cell-header">
                <Checkbox
                    indeterminate={
                        selectedRowKeys.length &&
                        selectedRowKeys.length !== dataSource.length
                    }
                    checked={selectedRowKeys.length === dataSource.length}
                    onChange={handelAllChange}
                ></Checkbox>
                {dropdown}
            </div>
        )
        const selectCol = {
            title,
            dataIndex: rowKey,
            key: "select-col-key",
            width: columnWidth || 60,
            className: "select-cell",
            fixed: flatCols.find(f => f.fixed === "left") ? "left" : undefined,
            render
        }

        _columns = [{ ...selectCol }, ...columns]
    } else {
        _columns = [...columns]
    }
    return _columns
}

function getFixedCol(cols) {
    const fixedLeftCols = [],
        fixedRightCols = [],
        centerCols = []
    cols.forEach(item => {
        switch (item.fixed) {
            case "left":
                fixedLeftCols.push({ ...item })
                break
            case "right":
                fixedRightCols.push({ ...item })
                break
            default:
                centerCols.push({ ...item })
                break
        }
    })
    return { fixedLeftCols, fixedRightCols, centerCols }
}

function flatCol(cols, calcFixedOffset, level) {
    cols = cols.flatMap(item => {
        if (item.children) {
            level++
            item = flatCol(item.children, level)
        }
        item.level = level
        return item
    })
    if (calcFixedOffset) {
        getFixedOffset(cols, "left")
        getFixedOffset(cols.reverse(), "right")
        cols = cols.reverse()
    }
    return cols
}

function getFixedOffset(cols, fixedDirection) {
    let offset = 0,
        lastFixedIndex = 0,
        havaFixed = false
    cols = cols.map((m, i) => {
        if (m.fixed === fixedDirection) {
            m.offset = offset
            offset += m.width
            lastFixedIndex = i
            havaFixed = true
        }
        return m
    })
    if (havaFixed) cols[lastFixedIndex].lastFixed = true
    return cols
}
var getEstimatedTotalSize = function(props, instanceProps) {
    var dataSource = props.dataSource
    var itemCount = dataSource.length
    var itemMetadataMap = instanceProps.itemMetadataMap
    var itemMetadata
    if (
        isEqual(dataSource, instanceProps.dataSource) &&
        itemMetadataMap[itemCount - 1]
    ) {
        instanceProps.isEqual = true
        itemMetadata = itemMetadataMap[itemCount - 1]
    } else {
        instanceProps.dataSource = dataSource
        instanceProps.isEqual = false
        instanceProps.itemMetadataMap = {}
        instanceProps.lastMeasuredIndex = -1
        itemMetadata = getItemMetadata(
            props,
            itemCount - 1,
            instanceProps,
            false
        )
    }
    return (
        itemMetadata.offset +
        itemMetadata.size +
        (itemMetadata.expandedHeight || 0)
    )
}

var getItemMetadata = function(
    props,
    index,
    instanceProps,
    isNeedSetIndex = true
) {
    var _ref = props,
        itemSize = _ref.rowHeight,
        rowExpandedHeight = _ref.expandable.rowExpandedHeight
    var itemMetadataMap = instanceProps.itemMetadataMap,
        lastMeasuredIndex = instanceProps.lastMeasuredIndex
    if (index > lastMeasuredIndex) {
        var offset = 0

        if (lastMeasuredIndex >= 0) {
            var itemMetadata = itemMetadataMap[lastMeasuredIndex]
            offset = itemMetadata.offset + itemMetadata.size
        }

        for (var i = lastMeasuredIndex + 1; i <= index; i++) {
            var size = itemSize(i),
                expandedHeight = rowExpandedHeight(i)
            itemMetadataMap[i] = {
                offset: offset,
                size: size,
                expanded: (itemMetadataMap[i] || {}).expanded,
                expandedHeight
            }
            offset += size
            if (itemMetadataMap[i].expanded) {
                offset += expandedHeight
            }
        }
        if (isNeedSetIndex) instanceProps.lastMeasuredIndex = index
    }

    return itemMetadataMap[index]
}

var findNearestItem = function(props, instanceProps, offset) {
    var itemMetadataMap = instanceProps.itemMetadataMap,
        lastMeasuredIndex = instanceProps.lastMeasuredIndex
    var lastMeasuredItemOffset =
        lastMeasuredIndex > 0 ? itemMetadataMap[lastMeasuredIndex].offset : 0

    if (lastMeasuredItemOffset >= offset) {
        // If we've already measured items within this range just use a binary search as it's faster.
        return findNearestItemBinarySearch(
            props,
            instanceProps,
            lastMeasuredIndex,
            0,
            offset
        )
    } else {
        return findNearestItemExponentialSearch(
            props,
            instanceProps,
            Math.max(0, lastMeasuredIndex),
            offset
        )
    }
}
var findNearestItemBinarySearch = function(
    props,
    instanceProps,
    high,
    low,
    offset
) {
    while (low <= high) {
        var middle = low + Math.floor((high - low) / 2)
        var currentOffset = getItemMetadata(props, middle, instanceProps).offset

        if (currentOffset === offset) {
            return middle
        } else if (currentOffset < offset) {
            low = middle + 1
        } else if (currentOffset > offset) {
            high = middle - 1
        }
    }

    if (low > 0) {
        return low - 1
    } else {
        return 0
    }
}

var findNearestItemExponentialSearch = function(
    props,
    instanceProps,
    index,
    offset
) {
    var itemCount = props.itemCount
    var interval = 1

    while (
        index < itemCount &&
        getItemMetadata(props, index, instanceProps).offset < offset
    ) {
        index += interval
        interval *= 2
    }

    return findNearestItemBinarySearch(
        props,
        instanceProps,
        Math.min(index, itemCount - 1),
        Math.floor(index / 2),
        offset
    )
}
const renderList = props => {
    const {
        columns,
        index,
        style,
        rowSelection,
        dataSource,
        prefixCls,
        rowKey,
        rowClass,
        itemMetadataMap,
        startIndex,
        components,
        expandable: { expandedRowRender, rowExpandable, rowExpandedHeight },
        onExpand
    } = props
    let selectedRowKeys = [],
        expandedRow = null,
        expanded = false,
        onExpandHandle = emptyFn
    if (rowSelection) selectedRowKeys = rowSelection.selectedRowKeys
    const record = dataSource[index],
        rowIndex = startIndex + index,
        dataIndex = typeof rowKey === "function" ? rowKey(record) : rowKey,
        rowSelected = selectedRowKeys.some(
            s => String(s) === String(record[dataIndex])
        ),
        itemMetadata = itemMetadataMap[rowIndex],
        _style = { ...style }
    if (itemMetadata) {
        _style.height = itemMetadata.size
        _style.lineHeight = itemMetadata.size + "px"
        _style.top = itemMetadata.offset
        _style.left = 0

        if (itemMetadata.expanded) {
            expanded = true
            const expandedRowStyle = { ...style }
            expandedRowStyle.height = itemMetadata.expandedHeight
            expandedRowStyle.lineHeight = itemMetadata.expandedHeight + "px"
            expandedRowStyle.top =
                itemMetadata.offset + itemMetadata.expandedHeight
            expandedRowStyle.left = 0
            expandedRow = (
                <div
                    className={classNames(
                        `${prefixCls}-body-row`,
                        "row-expanded"
                    )}
                    style={expandedRowStyle}
                >
                    {expandedRowRender(record)}
                </div>
            )
        }
        onExpandHandle = e => {
            onExpand && onExpand(rowIndex, !expanded)
            e && e.preventDefault && e.preventDefault()
            e && e.stopPropagation && e.stopPropagation()
        }
    }
    const {
        body: { row: RowComponent }
    } = components
    return (
        <React.Fragment>
            <RowComponent
                index={rowIndex}
                className={classNames(
                    `${prefixCls}-body-row`,
                    `row-${rowIndex}`,
                    { "row-selected": rowSelected },
                    rowClass ? rowClass(rowIndex) : ""
                )}
                style={_style}
                onMouseEnter={e => onRowMouseEnter(props, rowIndex, e)}
                onMouseLeave={e => onRowMouseLeave(props, rowIndex, e)}
                onClick={e => onRowEvent(props, rowIndex, "onClick", e)}
                onDoubleClick={e =>
                    onRowEvent(props, rowIndex, "onDoubleClick", e)
                }
                onContextMenu={e =>
                    onRowEvent(props, rowIndex, "onContextMenu", e)
                }
            >
                {renderCol(
                    columns,
                    record,
                    rowIndex,
                    prefixCls,
                    rowExpandable(record),
                    expanded,
                    onExpandHandle,
                    components,
                    _style.lineHeight
                )}
            </RowComponent>
            {expandedRow}
        </React.Fragment>
    )
}

const renderCol = (
    cells,
    record,
    rowIndex,
    prefixCls,
    expandable,
    expanded,
    onExpand,
    components,
    parentLineHeight
) => {
    const {
        body: { cell: CellComponent }
    } = components

    const expandedButtonColIndex =
        cells.findIndex(f => f.key === "select-col-key") + 1
    const cellsLength = cells.length - 1
    return cells.map((item, i) => {
        const { onCell } = item,
            {
                onClick: onCellClick,
                onMouseEnter: onCellMouseEnter,
                onMouseLeave: onCellMouseLeave,
                onDoubleClick: onCellDoubleClick,
                onContextMenu: onCellContextMenu,
                ...restProps
            } = (onCell && onCell(record)) || {}
        const dataIndex =
            typeof item.dataIndex === "function"
                ? item.dataIndex(record)
                : item.dataIndex
        let cell = item.render
            ? item.render(record[dataIndex], record, rowIndex)
            : record[dataIndex]
        const { width, align, flexGrow, fixed, offset, lastFixed } = item
        const style = { ...(item.style || {}) }
        if (width) style.width = width
        if (align) style.textAlign = align
        if (flexGrow) style.flex = flexGrow
        if (parentLineHeight) style.lineHeight = parentLineHeight
        if (fixed) {
            style.position = window.cssSupportSticky ? "sticky" : "static"
            if (fixed === "left") style.left = offset || 0
            if (fixed === "right") style.right = offset || 0
        }
        let colWidth = 0,
            colFlex = 0,
            { props, children } =
                Object.prototype.toString.call(cell) === "[object Object]"
                    ? cell
                    : {}
        if (props) {
            const { colSpan } = props
            if (colSpan === 0) return null
            if (colSpan) {
                if (colSpan > 1)
                    for (var j = 0; j < cells.length; j++) {
                        if (j >= i && j < i + colSpan) {
                            colWidth += cells[j].width
                            colFlex += cells[j].flexGrow || 0
                        }
                    }
                cell = children
                if (colWidth) style.width = colWidth
                if (colFlex) style.flex = colFlex
            }
        }
        let expandableButton = null
        if (expandable && expandedButtonColIndex === i) {
            expandableButton = (
                <Button
                    onClick={onExpand}
                    className={`expand-btn ${
                        expanded ? "expanded" : "collapsed"
                    }`}
                />
            )
        }
        return (
            <CellComponent
                {...restProps}
                key={item.key || dataIndex}
                className={classNames(
                    `${prefixCls}-body-row-cell`,
                    { "last-cell": cellsLength === i },
                    item.className || "",
                    { "fixed-cell": window.cssSupportSticky && fixed },
                    {
                        "fixed-left-last":
                            window.cssSupportSticky &&
                            fixed === "left" &&
                            lastFixed
                    },
                    {
                        "fixed-right-last":
                            window.cssSupportSticky &&
                            fixed === "right" &&
                            lastFixed
                    }
                )}
                style={style}
                title={typeof cell === "string" && cell}
                onMouseEnter={onCellMouseEnter || emptyFn}
                onMouseLeave={onCellMouseLeave || emptyFn}
                onClick={onCellClick || emptyFn}
                onDoubleClick={onCellDoubleClick || emptyFn}
                onContextMenu={onCellContextMenu || emptyFn}
            >
                <React.Fragment>
                    {expandableButton}
                    {cell}
                </React.Fragment>
            </CellComponent>
        )
    })
}

const renderScrollBar = props => {
    const {
        prefixCls,
        direction,
        ref,
        onScroll,
        width,
        height,
        maxWidth,
        maxHeight
    } = props
    return (
        <div
            className={`${prefixCls}-body-scroll-bar ${direction}`}
            onScroll={onScroll}
            ref={ref}
            style={{
                maxHeight,
                maxWidth,
                width: direction === "vertical" ? 11 : "auto"
            }}
        >
            <div style={{ width, height }}></div>
        </div>
    )
}

function onRowMouseEnter(props, rowIndex, e) {
    let rows = document.querySelectorAll(
        "." + props.tableId + " .row-" + rowIndex
    )
    if (rows && rows.length > 0) {
        let dom
        for (var i = 0; i < rows.length; i++) {
            dom = rows[i]
            if (dom) {
                dom.className = [
                    ...new Set(dom.className.split(" ").concat("row-hover"))
                ].join(" ")
            }
        }
    }
    onRowEvent(props, rowIndex, "onMouseEnter", e)
}

function onRowMouseLeave(props, rowIndex, e) {
    let rows = document.querySelectorAll(
        "." + props.tableId + " .row-" + rowIndex
    )
    if (rows && rows.length > 0) {
        let dom
        for (var i = 0; i < rows.length; i++) {
            dom = rows[i]
            if (dom) {
                dom.className = dom.className.replace("row-hover", "")
            }
        }
    }
    onRowEvent(props, rowIndex, "onMouseLeave", e)
}

function onRowEvent(props, rowIndex, eventName, e) {
    const { onRow, dataSource = [], startIndex } = props,
        onEvent = ((onRow && onRow(dataSource[rowIndex - startIndex])) || {})[
            eventName
        ]
    onEvent && onEvent(e)
}

function isSupportSticky() {
    const testNode = document.createElement("div")

    if (
        ["", "-webkit-", "-moz-", "-ms-"].some(prefix => {
            try {
                testNode.style.position = prefix + "sticky"
            } catch (e) {}

            return testNode.style.position != ""
        })
    ) {
        window.cssSupportSticky = true
        return true
    }
    window.cssSupportSticky = false
    return false
}
export default {
    getSelectCol,
    flatCol,
    getFixedCol,
    getEstimatedTotalSize,
    getItemMetadata,
    findNearestItem,
    findNearestItemExponentialSearch,
    findNearestItemBinarySearch,
    renderList,
    renderCol,
    renderScrollBar,
    getFixedOffset,
    isSupportSticky
}
