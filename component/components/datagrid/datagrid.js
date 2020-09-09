import React, { PureComponent } from "react"
import ReactDOM from "react-dom"
import classNames from "classnames"
import omit from "omit.js"
import Grid from "./gridComponent"

import { Column, ColumnGroup } from "fixed-data-table-2"
import ariaAttributes from "fixed-data-table-2/internal/ariaAttributes"
import columnWidths from "fixed-data-table-2/internal/columnWidths"
import columnTemplates from "fixed-data-table-2/internal/columnTemplates"
import scrollbarsVisible from "fixed-data-table-2/internal/scrollbarsVisible"
import tableHeights from "fixed-data-table-2/internal/tableHeights"

import Cell from "./cell"
import TextCell from "./textCell"
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
//import _ from 'underscore'
class DataGrid extends PureComponent {
    state = {
        height: 0,
        width: 0,
        rowsCount: 0,
        scrollLeft: 0,
    }

    constructor(props) {
        super(props)
        this.onResize = this.onResize.bind(this)
        // this.onScrollEnd = this.onScrollEnd.bind(this)
        // this.update = this.update.bind(this)
        // this.setStateDebounce = _.debounce(({ width, height }) => {
        //     this.setState({
        //         height,
        //         width
        //     })
        // }, 1)
        this.rowsCount = props.rowsCount
        this.gridClass = "col-resize-" + new Date().valueOf()
    }
    onMouseEnter = e => {
        try {
            const dom = e.target.parentElement.parentElement.nextElementSibling
            if (dom) dom.setAttribute("data-before", "show")
        } catch (ex) {
            console.error("gridComponent onMouseEnter error:", ex)
        }
    }
    onMouseLeave = e => {
        try {
            const dom = e.target.parentElement.parentElement.nextElementSibling
            if (dom) dom.setAttribute("data-before", "hide")
        } catch (ex) {
            console.error("gridComponent onMouseEnter error:", ex)
        }
    }
    onCellGroup2MouseEnter = e => {
        try {
            const dom = e.target.parentElement.parentElement.nextElementSibling.nextElementSibling
            let isScrollEnd = true
            const horizontalBar = document.querySelector(
                "." +
                    this.gridClass +
                    " .ScrollbarLayout_face.ScrollbarLayout_faceHorizontal.public_Scrollbar_face"
            )
            let width = horizontalBar && horizontalBar.style.width
            let transformX = horizontalBar && horizontalBar.style.transform
            if (width && !transformX) isScrollEnd = false
            if (width && transformX) {
                width = width.replace("px", "")
                transformX = transformX.replace("translate3d(", "").split("px")[0]
                if (
                    Number(horizontalBar.parentElement.style.width.replace("px", "")) <=
                    Number(width) + Number(transformX) + 5
                )
                    isScrollEnd = true
                else isScrollEnd = false
            }
            if (dom && isScrollEnd) dom.setAttribute("data-before", "show")
        } catch (ex) {
            console.error("gridComponent onMouseEnter error:", ex)
        }
    }
    onCellGroup2MouseLeave = e => {
        try {
            const dom = e.target.parentElement.parentElement.nextElementSibling.nextElementSibling
            if (dom) dom.setAttribute("data-before", "hide")
        } catch (ex) {
            console.error("gridComponent onMouseEnter error:", ex)
        }
    }

    componentDidMount() {
        //if (this.props.isFix === true) return
        const { width, height } = this.props
        if (!width || !height) {
            this.refreshSize()

            var win = window
            if (win.addEventListener) {
                win.addEventListener("resize", this.onResize, false)
            } else if (win.attachEvent) {
                win.attachEvent("onresize", this.onResize)
            } else {
                win.onresize = this.onResize
            }
            // let dom = ReactDOM.findDOMNode(this)
            // this.setState({
            //     height: dom.offsetHeight,
            //     width: dom.offsetWidth,
            // })
        }
        setTimeout(() => {
            const cellGroup1 = document.querySelector(
                "." +
                    this.gridClass +
                    " .public_fixedDataTable_header .fixedDataTableCellGroupLayout_cellGroupWrapper .public_fixedDataTableCell_main:last-child"
            )
            addEvent(cellGroup1, "mouseenter", this.onMouseEnter)
            addEvent(cellGroup1, "mouseleave", this.onMouseLeave)
            const cellGroup2 = document.querySelector(
                "." +
                    this.gridClass +
                    " .public_fixedDataTable_header .fixedDataTableCellGroupLayout_cellGroupWrapper:nth-child(2) .public_fixedDataTableCell_main:last-child"
            )
            addEvent(cellGroup2, "mouseenter", this.onCellGroup2MouseEnter)
            addEvent(cellGroup2, "mouseleave", this.onCellGroup2MouseLeave)
        }, 100)
    }

    componentWillReceiveProps(prevProps, prevState) {
        // console.log(prevProps)
        this.rowsCount = this.state.rowsCount
        this.setState({
            rowsCount: prevProps.rowsCount,
            // scrollTop: prevProps.top
        })
    }

    // shouldComponentUpdate(prevProps, prevState){
    //     console.log('shouldComponentUpdate',prevState)
    //     return true
    // }

    componentWillUnmount() {
        //if (this.props.isFix === true) return
        var win = window
        if (win.removeEventListener) {
            win.removeEventListener("resize", this.onResize, false)
        } else if (win.detachEvent) {
            win.detachEvent("onresize", this.onResize)
        } else {
            win.onresize = undefined
        }
        const cellGroup1 = document.querySelector(
            "." +
                this.gridClass +
                " .public_fixedDataTable_header .fixedDataTableCellGroupLayout_cellGroupWrapper .public_fixedDataTableCell_main:last-child"
        )
        const cellGroup2 = document.querySelector(
            "." +
                this.gridClass +
                " .public_fixedDataTable_header .fixedDataTableCellGroupLayout_cellGroupWrapper:nth-child(2) .public_fixedDataTableCell_main:last-child"
        )
        removeEvent(cellGroup1, "mouseenter", this.onMouseEnter)
        removeEvent(cellGroup1, "mouseleave", this.onMouseLeave)
        removeEvent(cellGroup2, "mouseenter", this.onCellGroup2MouseEnter)
        removeEvent(cellGroup2, "mouseleave", this.onCellGroup2MouseLeave)
        var newProps = {
            elementHeights: {},
            tableSize: {},
            scrollFlags: {},
            rowSettings: {},
            keyboardScrollEnabled: false,
            keyboardPageEnabled: false,
            touchScrollEnabled: false,
            stopScrollPropagation: false,
        }
        ariaAttributes(newProps)
        columnWidths(newProps)
        columnTemplates(newProps)
        scrollbarsVisible(newProps)
        tableHeights(newProps)
    }

    onResize() {
        this.refreshSize()
        if (this.props.onResize) setTimeout(this.props.onResize, 16)
    }

    refreshSize() {
        let dom = ReactDOM.findDOMNode(this)
        this.setState({
            height: dom.offsetHeight,
            width: dom.offsetWidth,
        })
    }
    //会造成表格的重复渲染
    // componentDidUpdate() {
    //     let width = ReactDOM.findDOMNode(this).offsetWidth
    //     if (width !== this.state.width) {
    //         this.setState({
    //             width: width
    //         })
    //     }
    // }

    onScrollEnd = (x, y, n, m) => {
        if (!!this.props.rememberScrollTop) {
            window[this.props.className] = y

            let dataInput = document.getElementById("data_input")
            if (dataInput) {
                dataInput[`${this.props.className}-x`] = x
                dataInput[`${this.props.className}-y`] = y
                dataInput[`${this.props.className}-n`] = n
                dataInput[`${this.props.className}-m`] = m
                // console.log('-------------------------', x, y, n, m)
            }
        }
        this.props.onScrollEnd && this.props.onScrollEnd(x, y)
    }

    filterChildren = () => {
        if (!this.props.columns) return
        this.props.columns.forEach((item, index) => {
            if (
                item &&
                item.props &&
                item.props.isColumnGroup &&
                item.props.children &&
                item.props.children.length > 0
            ) {
                let newChildren = []
                item.props.children.forEach(item => {
                    if (item && item.key != "_sequence") newChildren.push(item)
                })
                this.props.columns[index].props.children = newChildren
            }
        })
    }

    render() {
        this.filterChildren()
        let className = classNames({
            "mk-datagrid": true,
            "mk-datagrid-editable": this.props.readonly === false,
            [this.props.className]: !!this.props.className,
            "mk-addDel": this.props.enableAddDelrow || this.props.showBtnWidth,
            "mk-upDown": this.props.enableUpDownrow || this.props.showBtnWidth,
            "mk-endDel": this.props.enableEndDelRow || this.props.showBtnWidth,
            "mk-ellipsis": this.props.ellipsis,
            [this.gridClass]: true,
        })
        //填制凭证页签切换出现空白行，height和width做特殊处理
        let height =
                this.props.id == "proofCharge" || this.props.id == "accountSubjectGrid"
                    ? this.state.height
                    : this.state.height || this.props.height,
            width =
                this.props.id == "proofCharge" || this.props.id == "accountSubjectGrid"
                    ? this.state.width
                    : this.state.width || this.props.width,
            oldRowsCount = this.rowsCount,
            onScrollEnd = this.onScrollEnd,
            // scrollLeft = this.state.scrollLeft,
            // scrollTop = this.changetab == this.props.changetab ? this.state.scrollTop : 0,
            loading = this.props.loading,
            scrollToRow,
            dataInput = document.getElementById("data_input"),
            scrollTop = 0,
            hasFocus = false
        if (dataInput) {
            dataInput.tabFocus.forEach(o => {
                if (this.props.className && this.props.className.includes(o)) {
                    hasFocus = true
                }
            })
        }

        if (
            this.props.enableAddDelrow ||
            this.props.enableUpDownrow ||
            this.props.enableEndDelRow ||
            this.props.showBtnWidth
        ) {
            height = height
            width = width - 50
        }
        if (this.props.isFix) {
            if (height > this.props.height) height = this.props.height
        }

        if (this.props.rememberScrollTop && window[this.props.className]) {
            let { height } = this.state
            let count = 0
            if (height) {
                height = height - this.props.headerHeight - 15
                if (height > 0) {
                    count = Math.floor(height / this.props.rowHeight)
                    if (typeof count != "number") {
                        count = 0
                    }
                }
            }
            if (this.props.searchFlag == true) {
                scrollToRow = scrollToRow
            } else {
                scrollToRow = parseInt(window[this.props.className] / this.props.rowHeight) + count
            }
        }
        if (scrollToRow) {
            if (this.props.selfCalcScrollToRow) {
                //会计科目页签切换scrollToRow计算值不对，造成出现空白行，特殊处理
                return (
                    <div
                        className={className}
                        style={this.props.style ? this.props.style : {}}
                        onKeyDown={this.props.onKeyDown}
                        onKeyUp={this.props.onKeyUp}>
                        {Grid({
                            ...omit(this.props, ["className"]),
                            width,
                            height,
                            oldRowsCount,
                            onScrollEnd,
                            scrollToRow,
                            // scrollTop,
                            loading,
                        })}
                    </div>
                )
            }
            if (dataInput && dataInput[`${this.props.className}-n`]) {
                scrollToRow = Math.floor(
                    (dataInput[`${this.props.className}-n`] +
                        dataInput[`${this.props.className}-m`]) /
                        2 +
                        1
                )
                if (
                    hasFocus &&
                    !dataInput["datagridKeydown"] &&
                    dataInput[`${this.props.className}-y`] < 1200
                ) {
                    scrollTop = Math.floor(dataInput[`${this.props.className}-n`] * 37)
                } else if (dataInput["datagridKeydown"]) {
                    scrollTop = this.props.scrollTop
                } else {
                    scrollTop = -1
                }
            }
            return (
                <div
                    className={className}
                    style={this.props.style ? this.props.style : {}}
                    onKeyDown={this.props.onKeyDown}
                    onKeyUp={this.props.onKeyUp}>
                    {scrollTop >= 0
                        ? Grid({
                              ...omit(this.props, ["className"]),
                              width,
                              height,
                              oldRowsCount,
                              onScrollEnd,
                              // scrollToRow,
                              scrollTop,
                              loading,
                          })
                        : Grid({
                              ...omit(this.props, ["className"]),
                              width,
                              height,
                              oldRowsCount,
                              onScrollEnd,
                              scrollToRow,
                              // scrollTop,
                              loading,
                          })}
                </div>
            )
        } else {
            return (
                <div
                    className={className}
                    style={this.props.style ? this.props.style : {}}
                    onKeyDown={this.props.onKeyDown}
                    onKeyUp={this.props.onKeyUp}>
                    {Grid({
                        ...omit(this.props, ["className"]),
                        width,
                        height,
                        oldRowsCount,
                        onScrollEnd,
                        // scrollToRow:0,
                        scrollTop: this.props.scrollTop,
                        // scrollLeft,
                        loading,
                    })}
                </div>
            )
        }
    }
}

DataGrid.Cell = Cell
DataGrid.TextCell = TextCell
DataGrid.Column = Column
DataGrid.ColumnGroup = ColumnGroup

export default DataGrid
