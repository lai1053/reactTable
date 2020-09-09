import React, { createElement, useRef, cloneElement, useContext, useMemo } from "react"
// import PropTypes from "prop-types"
import TableContext from "./context"
import classNames from "classnames"
import { getFixedCol, flatCol, renderList, renderScrollBar } from "./utils"
// import debounce from "lodash.debounce"
// import { throttle } from "edf-utils"
import { NoData } from "edf-component"
import scrollFactory from "./scrollFactory"
// import ScrollBar from "./ScrollBar"
// 滚动条宽
const scrollBarWidth = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
    ? 17
    : /Edge\/(\S+)/.test(navigator.userAgent)
    ? 18
    : 11

export default function TableBody(props) {
    const bodyRef = props.bodyRef
    const tableId = props.tableId
    const dataSource = props.dataSource
    const rowTotalHeight = props.rowTotalHeight
    const itemMetadataMap = props.itemMetadataMap
    const verticalScrollBarRef = useRef(null)
    const horizontalScrollBarRef = useRef(null)
    const summaryRowsRef = useRef(null)
    const tableContext = useContext(TableContext)
    const {
        startIndex,
        stopIndex,
        prefixCls,
        columns,
        summaryRows,
        scroll = {},
        allowResizeColumn,
        width: tableWidth,
    } = tableContext
    const tableSetSate = (scrollTop, scrollDirection, callThrottle) => {
        props.updateState(
            {
                isScrolling: true,
                scrollDirection,
                scrollOffset: scrollTop,
                startIndex,
                stopIndex,
                callThrottle,
                delay: rowTotalHeight / 1000,
            },
            () => {
                scrollFactory.setScrolling(tableId, false)
            }
        )
    }
    // const throttleTableSetSate = throttle(tableSetSate, rowTotalHeight / 1000)
    const verticalScroll = (scrollTop, position, callThrottle) => {
        const prevScrollTop = scrollFactory.getScrollTop(tableId)
        const scrollDirection = prevScrollTop < scrollTop ? "forward" : "backward"
        if (prevScrollTop !== scrollTop) {
            scrollFactory.setScrollTop(tableId, scrollTop)
            if (bodyRef && bodyRef.current && position !== "body")
                bodyRef.current.scrollTop = scrollTop
            if (verticalScrollBarRef && verticalScrollBarRef.current && position !== "vBar")
                verticalScrollBarRef.current.scrollTop = scrollTop
            if (!scrollFactory.getScrolling(tableId)) {
                scrollFactory.setScrolling(tableId, true)
                // console.log("verticalScroll:", startIndex, stopIndex, scrollTop)
                tableSetSate(scrollTop, scrollDirection, callThrottle)
            }
        }
    }
    // const debounceVerticalScroll = throttle(verticalScroll, rowTotalHeight / 1000)
    const horizontalScroll = (scrollLeft, position) => {
        if (scrollFactory.getScrollLeft(tableId) !== scrollLeft) {
            scrollFactory.setScrollLeft(tableId, scrollLeft)
            if (bodyRef && bodyRef.current && position !== "body")
                bodyRef.current.scrollLeft = scrollLeft
            const headerScrollRef = props.headerScrollRef
            if (headerScrollRef && headerScrollRef.current)
                headerScrollRef.current.scrollLeft = scrollLeft
            if (horizontalScrollBarRef && horizontalScrollBarRef.current && position !== "bar")
                horizontalScrollBarRef.current.scrollLeft = scrollLeft
            if (!window.cssSupportSticky && summaryRowsRef && summaryRowsRef.current)
                summaryRowsRef.current.style.left = -scrollLeft + "px"
        }
    }
    const handelVerticalScroll = (e, position) => {
        const currentTarget = e.currentTarget
        if (!currentTarget) return
        var scrollTop = currentTarget.scrollTop,
            scrollLeft = currentTarget.scrollLeft
        const prevScrollTop = scrollFactory.getScrollTop(tableId)
        if (props.verticalScrollUnAvail && props.verticalScrollUnAvail()) {
            bodyRef.current.scrollTop = prevScrollTop
            return
        }
        if (prevScrollTop !== scrollTop) {
            verticalScroll(scrollTop, position, position === "bar" && true)
        }
        if (position === "body") {
            horizontalScroll(scrollLeft, position)
        }
    }
    const onVerticalScroll = e => {
        var scrollTop = e.currentTarget.scrollTop
        // debounceVerticalScroll(scrollTop, "bar", true)
        handelVerticalScroll(e, "bar")
    }
    const onHorizontalScroll = e => {
        var scrollLeft = e.currentTarget.scrollLeft
        horizontalScroll(scrollLeft, "bar")
    }
    const bodyScroll = function (e) {
        handelVerticalScroll(e, "body")
    }
    const flatCols = flatCol(columns, true)
    // expander && expander.renderExpandIndentCell(rows, fixed)
    const renderRow = (realCols, style) => {
        if (!dataSource || dataSource.length < 1) {
            return <NoData style={{ position: "absolute" }}>暂无数据</NoData>
        } else {
            return dataSource.map((item, index) =>
                renderList({
                    ...tableContext,
                    itemMetadataMap,
                    dataSource,
                    columns: realCols,
                    index,
                    style,
                })
            )
        }
    }
    const hasVerticalScrollBar = rowTotalHeight > scroll.y
    // 无数据时，不显示滚动条
    const hasHorizontalScrollBar =
        dataSource && dataSource.length ? allowResizeColumn || scroll.x > tableWidth : false
    const maxHeight = scroll.y || dataSource.length * 37 || 100
    const summaryRowsTop =
        scroll.y -
        (hasHorizontalScrollBar ? (window.cssSupportSticky ? scrollBarWidth : 17) : 0) -
        (summaryRows ? summaryRows.height : 0)
    let _summaryRows = null
    if (summaryRows && summaryRows.rows) {
        const smRows =
            typeof summaryRows.rows === "function" ? summaryRows.rows(flatCols) : summaryRows.rows
        _summaryRows = cloneElement(smRows, {
            ref: summaryRowsRef,
            style: {
                ...(smRows.props.style || {}),
                height: (smRows.props.style || {}).height || "auto",
                width: scroll.x || "100%",
                top: summaryRowsTop,
                position: window.cssSupportSticky ? "sticky" : "absolute",
            },
            className: classNames(smRows.props.className, {
                "no-box-shadow": !window.cssSupportSticky,
            }),
        })
    }

    const verticalScrollHeight = rowTotalHeight - (hasHorizontalScrollBar ? scrollBarWidth : 0)
    const verticalScrollBarMaxHeight = scroll.y - (hasHorizontalScrollBar ? scrollBarWidth : 0)

    return (
        <div
            className={`${prefixCls}-body`}
            style={{
                height: maxHeight,
                maxHeight,
                maxWidth: tableWidth,
            }}>
            <div
                className={classNames(
                    `${prefixCls}-body-scroll`,
                    {
                        "scroll-hidden": window.cssSupportSticky,
                    },
                    {
                        "has-vertical-scroll": hasVerticalScrollBar,
                    }
                )}
                style={{
                    maxHeight,
                    maxWidth: tableWidth,
                    overflowX: window.cssSupportSticky ? "scroll" : "hidden",
                    overflowY: "scroll",
                }}
                onScroll={bodyScroll}
                ref={bodyRef}>
                <div
                    style={{
                        // minWidth: scroll.x,
                        height: rowTotalHeight,
                        position: "relative",
                        minHeight: scroll.y,
                    }}>
                    {renderRow(flatCols, {
                        width: scroll.x || "100%",
                    })}
                    {window.cssSupportSticky ? _summaryRows : null}
                </div>
                {!window.cssSupportSticky ? _summaryRows : null}

                {hasVerticalScrollBar &&
                    renderScrollBar({
                        prefixCls,
                        direction: "vertical",
                        ref: verticalScrollBarRef,
                        onScroll: onVerticalScroll,
                        height: verticalScrollHeight,
                        width: 10,
                        maxHeight: verticalScrollBarMaxHeight,
                    })}
                {hasHorizontalScrollBar &&
                    renderScrollBar({
                        prefixCls,
                        direction: "horizontal",
                        ref: horizontalScrollBarRef,
                        onScroll: onHorizontalScroll,
                        width: scroll.x,
                        maxWidth: tableWidth,
                    })}
            </div>
        </div>
    )
}
/*
return useMemo(() => {
    }, [columns, dataSource, summaryRows, scroll, tableWidth, rowTotalHeight, startIndex])
 */
