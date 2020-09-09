import React, { createElement, useRef, cloneElement } from "react"
// import PropTypes from "prop-types"
import { Consumer } from "./context"
import classNames from "classnames"
import { getFixedCol, flatCol, renderList, renderScrollBar } from "./utils"
// import debounce from "lodash.debounce"
// import { throttle } from "edf-utils"
import { NoData } from "edf-component"
import scrollFactory from "./scrollFactory"
// 滚动条宽
const scrollBarWidth = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
    ? 17
    : /Edge\/(\S+)/.test(navigator.userAgent)
    ? 18
    : 11
export default function TableBody(props) {
    const bodyRef = props.bodyRef
    const tableId = props.tableId
    const verticalScrollBarRef = useRef(null)
    const horizontalScrollBarRef = useRef(null)
    const summaryRowsRef = useRef(null)
    const bodyScroll = function(e) {
        handelVerticalScroll(e, "body")
    }
    const tableSetSate = (scrollTop, scrollHeight, clientHeight) => {
        props.setState(prevState => {
            if (prevState.scrollOffset === scrollTop) {
                return null
            }
            var scrollOffset = Math.max(
                0,
                Math.min(scrollTop, scrollHeight - clientHeight)
            )
            return {
                isScrolling: true,
                scrollDirection:
                    prevState.scrollOffset < scrollOffset
                        ? "forward"
                        : "backward",
                scrollOffset: scrollOffset
                // scrollUpdateWasRequested: false
            }
        })
    }

    const verticalScroll = (
        scrollTop,
        scrollHeight,
        clientHeight,
        position
    ) => {
        if (scrollFactory.getScrollTop(tableId) !== scrollTop) {
            scrollFactory.setScrollTop(tableId, scrollTop)

            if (bodyRef && bodyRef.current && position !== "body")
                bodyRef.current.scrollTop = scrollTop
            if (
                verticalScrollBarRef &&
                verticalScrollBarRef.current &&
                position !== "vBar"
            )
                verticalScrollBarRef.current.scrollTop = scrollTop
            tableSetSate(scrollTop, scrollHeight, clientHeight)
        }
    }
    const horizontalScroll = (scrollLeft, position) => {
        if (scrollFactory.getScrollLeft(tableId) !== scrollLeft) {
            scrollFactory.setScrollLeft(tableId, scrollLeft)
            if (bodyRef && bodyRef.current && position !== "body")
                bodyRef.current.scrollLeft = scrollLeft
            const headerScrollRef = props.headerScrollRef
            if (headerScrollRef && headerScrollRef.current)
                headerScrollRef.current.scrollLeft = scrollLeft
            if (
                horizontalScrollBarRef &&
                horizontalScrollBarRef.current &&
                position !== "bar"
            )
                horizontalScrollBarRef.current.scrollLeft = scrollLeft
            if (
                !window.cssSupportSticky &&
                summaryRowsRef &&
                summaryRowsRef.current
            )
                summaryRowsRef.current.style.left = -scrollLeft + "px"
        }
    }
    const handelVerticalScroll = (e, position) => {
        const currentTarget = e.currentTarget
        if (!currentTarget) return
        var clientHeight = currentTarget.clientHeight,
            scrollHeight = currentTarget.scrollHeight,
            scrollTop = currentTarget.scrollTop,
            scrollLeft = currentTarget.scrollLeft
        const prevScrollTop = scrollFactory.getScrollTop(tableId)
        if (props.verticalScrollUnAvail && props.verticalScrollUnAvail()) {
            bodyRef.current.scrollTop = prevScrollTop
            return
        }
        if (prevScrollTop !== scrollTop) {
            const abs = Math.abs(scrollTop - prevScrollTop)
            // if (abs < props.height / 2) {
            verticalScroll(scrollTop, scrollHeight, clientHeight, position)
            // } else {
            //     debounceVerticalScroll(
            //         scrollTop,
            //         scrollHeight,
            //         clientHeight,
            //         position
            //     )
            // }
        }
        if (position === "body") {
            horizontalScroll(scrollLeft, position)
        }
    }
    // const debounceVerticalScroll = debounce(verticalScroll, 37)
    const onVerticalScroll = e => {
        handelVerticalScroll(e, "bar")
    }
    const onHorizontalScroll = e => {
        var scrollLeft = e.currentTarget.scrollLeft
        horizontalScroll(scrollLeft, "bar")
    }
    return (
        <Consumer>
            {consumerVal => {
                const {
                    prefixCls,
                    columns,
                    dataSource,
                    summaryRows,
                    scroll = {},
                    rowTotalHeight,
                    width: tableWidth
                } = consumerVal

                const {} = props
                const flatCols = flatCol(columns, true)
                // expander && expander.renderExpandIndentCell(rows, fixed)
                const renderRow = (realCols, style) => {
                    if (!dataSource || dataSource.length < 1) {
                        return <NoData>暂无数据</NoData>
                    } else {
                        return dataSource.map((item, index) =>
                            renderList({
                                ...consumerVal,
                                columns: realCols,
                                index,
                                style
                            })
                        )
                    }
                }
                const hasVerticalScrollBar = rowTotalHeight > scroll.y
                const hasHorizontalScrollBar = scroll.x > tableWidth
                const maxHeight = scroll.y || dataSource.length * 37 || 100
                const summaryRowsTop =
                    scroll.y -
                    (hasHorizontalScrollBar
                        ? window.cssSupportSticky
                            ? scrollBarWidth
                            : 17
                        : 0) -
                    (summaryRows ? summaryRows.height : 0)
                const _summaryRows = summaryRows
                    ? cloneElement(summaryRows.rows, {
                          ref: summaryRowsRef,
                          style: {
                              height:
                                  (summaryRows.rows.props.style || {}).height ||
                                  "auto",
                              width: scroll.x || "100%",
                              top: summaryRowsTop,
                              position: window.cssSupportSticky
                                  ? "sticky"
                                  : "absolute"
                          },
                          className: classNames(
                              summaryRows.rows.props.className,
                              { "no-box-shadow": !window.cssSupportSticky }
                          )
                      })
                    : null
                const verticalScrollHeight =
                    rowTotalHeight -
                    (hasHorizontalScrollBar ? scrollBarWidth : 0)
                const verticalScrollBarMaxHeight =
                    scroll.y - (hasHorizontalScrollBar ? scrollBarWidth : 0)
                return (
                    <div
                        className={`${prefixCls}-body`}
                        style={{
                            height: maxHeight,
                            maxHeight,
                            maxWidth: tableWidth
                        }}
                    >
                        <div
                            className={classNames(
                                `${prefixCls}-body-scroll`,
                                {
                                    "scroll-hidden": window.cssSupportSticky
                                },
                                {
                                    "has-vertical-scroll": handelVerticalScroll
                                }
                            )}
                            style={{
                                maxHeight,
                                maxWidth: tableWidth,
                                overflowX: window.cssSupportSticky
                                    ? "scroll"
                                    : "hidden",
                                overflowY: "scroll"
                            }}
                            onScroll={bodyScroll}
                            ref={bodyRef}
                        >
                            <div
                                style={{
                                    height: rowTotalHeight,
                                    position: "relative",
                                    minHeight: scroll.y
                                }}
                            >
                                {renderRow(flatCols, {
                                    width: scroll.x || "100%"
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
                                    maxHeight: verticalScrollBarMaxHeight
                                })}
                            {hasHorizontalScrollBar &&
                                renderScrollBar({
                                    prefixCls,
                                    direction: "horizontal",
                                    ref: horizontalScrollBarRef,
                                    onScroll: onHorizontalScroll,
                                    width: scroll.x,
                                    maxWidth: tableWidth
                                })}
                        </div>
                    </div>
                )
            }}
        </Consumer>
    )
}
