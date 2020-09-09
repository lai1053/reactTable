import React, { createElement } from "react"
import PropTypes from "prop-types"
import { Consumer } from "./context"
import classNames from "classnames"
import { getFixedCol, getFixedOffset } from "./utils"

function createNode(
    {
        key,
        type,
        title,
        className,
        width,
        align,
        flexGrow,
        children,
        index,
        offset,
        fixed,
        lastFixed,
        isLastChild,
        ...oth
    },
    prefixCls
) {
    let style = {}
    if (width) style.width = width
    if (align) style.textAlign = align
    if (flexGrow && !children) style.flex = flexGrow
    if (fixed) {
        style.position = window.cssSupportSticky ? "sticky" : "relative"
        if (window.cssSupportSticky && fixed === "left")
            style.left = offset || 0
        if (window.cssSupportSticky && fixed === "right")
            style.right = offset || 0
    }
    if (
        title &&
        title.type &&
        title.type.name === "ResizeableTitle" &&
        title.props.className
    )
        className = `${className || ""} ${title.props.className}`
    const dom = createElement(
        type || "div",
        {
            key: key || String(title),
            className: classNames(
                `${prefixCls}-header-cell`,
                { "header-fixed": window.cssSupportSticky && fixed },
                {
                    "fixed-left-last":
                        window.cssSupportSticky && fixed === "left" && lastFixed
                },
                {
                    "fixed-right-last":
                        window.cssSupportSticky &&
                        fixed === "right" &&
                        lastFixed
                },
                {
                    "last-child": isLastChild
                },
                className
            ),
            style
        },
        title
    )
    if (children)
        return (
            <div
                className={`${prefixCls}-header-col`}
                key={index}
                style={flexGrow ? { flex: flexGrow } : {}}
            >
                {dom}
                {
                    <div className={`${prefixCls}-header-row`}>
                        {children.map((cl, i) =>
                            createNode(
                                {
                                    ...cl,
                                    index: i,
                                    isLastChild:
                                        isLastChild && children.length - 1 === i
                                },
                                prefixCls
                            )
                        )}
                    </div>
                }
            </div>
        )
    return dom
}

function getHeaderRows(columns, prefixCls) {
    return columns.map((cl, index) =>
        createNode(
            { ...cl, index, isLastChild: columns.length - 1 === index },
            prefixCls
        )
    )
}
export default function TableHeader(props) {
    return (
        <Consumer>
            {({
                showHeader,
                components,
                prefixCls,
                onHeaderRow,
                scroll,
                width,
                columns,
                expander,
                fixedHeader,
                headerHeight
            }) => {
                if (!showHeader) {
                    return null
                }
                const {
                    fixedLeftCols,
                    fixedRightCols,
                    centerCols
                } = getFixedCol(columns)
                getFixedOffset(fixedLeftCols, "left")
                getFixedOffset(fixedRightCols.reverse(), "right")
                fixedRightCols.reverse()
                const rows = getHeaderRows([...centerCols], prefixCls)
                const style = {}
                let isScroll = false
                if (scroll.x) {
                    isScroll = scroll.x > width
                    style.width = scroll.x
                    style.maxWidth = scroll.x
                    style.height = headerHeight || "auto"
                }
                const header = (
                    <div className={`${prefixCls}-header`} style={style}>
                        {getHeaderRows([...fixedLeftCols], prefixCls)}
                        {rows}
                        {getHeaderRows([...fixedRightCols], prefixCls)}
                    </div>
                )
                return (
                    <div
                        className={`${prefixCls}-header-container`}
                        style={{ maxWidth: width + "px" }}
                    >
                        {isScroll ? (
                            <div
                                className={`${prefixCls}-header-scroll`}
                                style={{ maxWidth: width + "px" }}
                                ref={props.headerScrollRef}
                            >
                                {header}
                            </div>
                        ) : (
                            header
                        )}
                    </div>
                )
            }}
        </Consumer>
    )
}

TableHeader.propTypes = {
    fixed: PropTypes.string,
    columns: PropTypes.array.isRequired,
    // expander: PropTypes.object.isRequired,
    onHeaderRow: PropTypes.func
}

TableHeader.contextTypes = {
    table: PropTypes.any
}
