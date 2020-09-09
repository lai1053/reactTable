import React, { PureComponent } from 'react'
import VirtualTable from './virtualTable'
import { Resizable } from "react-resizable"


const ResizeableTitle = props => {
    const { onResize, width, resizeAble, ...restProps } = props
    const children = <React.Fragment {...restProps} />
    if (!width || !resizeAble) {
        return children
    }
    return (
        <Resizable
            width={width}
            height={0}
            handle={resizeHandle => (
                <span
                    className={`resizable-handle-${resizeHandle}`}
                    onClick={e => {
                        e.stopPropagation()
                    }}
                />
            )}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
            children={children}
        />
    )
}

const getResizeTitle = (cols = [], handerResize) => {
    const result = []
    cols.forEach(col => {
        const item = {
            ...col,
            minWidth: col.children && col.children.length ? Math.max.call(Math, col.title.length * 20, 75 * col.children.length) : col.title.length * 25,
            title: (
                <ResizeableTitle
                    resizeAble={!(col.children && col.children.length)}
                    width={col.width}
                    onResize={handerResize(col.key)}
                    className={'resizable testresizable'}
                >
                    {col.title}
                </ResizeableTitle>
            )
        }
        if (col.children) {
            delete item.width
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
                width: size.width < col.minWidth ? col.minWidth : size.width
            }
        }
        if (col.children) {
            col.children = resizeCols(col.children, key, size)
        }
        result.push(col)
    })
    return result
}

function flatCol(cols) {
    cols = cols.flatMap(item => {
        if (item.children) {
            item = flatCol(item.children)
        }
        return item
    })
    return cols
}

export default class ColResizeTable extends PureComponent {
    constructor(props) {
        super(props)
        const cols = getResizeTitle(this.props.columns, this.handerResize)
        const listWidth = getListWidth(cols)
        this.state = {
            scrollX: props.scroll ? props.scroll.x : 1500,
            columns: cols || [],
            listWidth
        }
        this.initColsWidth = flatCol(cols)
            .map(m => m.width || m.minWidth || 0)
            .reduce((a, b) => a + b, 0)
        this.tableRef = React.createRef()
    }

    handerResize = key => (e, { size }) => {
        this.setState(({ columns }) => {
            const nextCols = [...columns]
            let columnDetails = [],
                param = {}

            nextCols.forEach(item => {
                if (!item.children) {
                    if (item.dataIndex) {
                        columnDetails.push({
                            fieldName: item.dataIndex,
                            width: item.width,
                            isVisible: true,
                            customDecideVisible: true //控制哪一列显示隐藏
                        })
                    }
                } else {
                    item.width = 0
                    item.children.forEach(child => {
                        item.width += child.width
                        columnDetails.push(child)
                    })

                    columnDetails.push(item)
                }
            })

            param.columnDetails = columnDetails

            let that = this, res
            this.onResizend(function () {
                res = that.props.onResizeEnd(param)

            })

            if(columns[columns.length - 1].fieldName == 'blank') {
                const resizePart = findResizeCol(columns, key)
                const newCols = resizeCols(columns, key, size)
                newCols[newCols.length - 1].width += (resizePart.width - size.width)
                if(newCols[newCols.length - 1].width < 0) {
                    newCols[newCols.length - 1].width = 0
                }
                return { columns: newCols }
            } else {
                return { columns: resizeCols(columns, key, size) }
            }
        })
    }

    render() {
        const { columns, listWidth } = this.state
        const { scroll } = this.props
        const diffWidth =
            flatCol(columns)
                .map(m => m.width || m.minWidth || 0)
                .reduce((a, b) => a + b, 0) - this.initColsWidth
        const initialWidth = (scroll && listWidth > scroll.w) ? listWidth : scroll.w + 1
        const scrollX = diffWidth > 0 ? diffWidth + initialWidth : initialWidth
        const scrollValue = getScrollValue(scroll)
        const scrollTop = getScrollTop(scroll)

        return (
            <VirtualTable
                {...this.props}
                ref={this.tableRef}
                style={{ width: `${scroll && scroll.w}px` }}
                width={scroll && scroll.w}
                // height={scroll && scroll.y}
                scroll={{y: scroll.y, x: scrollX}}
                columns={columns}
                rowHeight={this.getRowHeight.bind(this)}
                scrollTop={scrollTop}
                initialScrollIndex={scrollValue}
            />
        ) 
    }
 
    getRowHeight(index) {
        let ds = this.props.dataSource
        if (ds[index].entrys && ds[index].entrys.length > 0) {
            return 37 * ds[index].entrys.length
        }
        return 37
    }

    onResizend = (onResizend) => {
        let that = this,
            timeOutTask = function () {
                that.state.taskPtr && clearTimeout(that.state.taskPtr)
                let taskPtr = setTimeout(function () {
                    onResizend && onResizend();
                }, 500)
                that.setState({ taskPtr: taskPtr })
            }
        timeOutTask()
    }

    componentWillUpdate() {
        const { scroll, matchIndex } = this.props
        const tableRef = this.tableRef
        setScrollTop(scroll, tableRef, matchIndex)
    }

    componentDidUpdate() {
        const { scroll,matchIndex } = this.props
        setMatchIndex(scroll, this.tableRef, matchIndex)
    }

    componentWillUnmount() {
        const { scroll, dataSource: ds} = this.props
        const tableRef = this.tableRef
        setScrollValue(scroll, ds, tableRef)
    }
}

function getMatchOrNot(matchIndex) {
    const dataInput = document.getElementById('data_input')
    if(matchIndex >= 0 && (dataInput[`${scroll.class}-matchIndex`] != matchIndex)) {
        return true
    }
    return false
}

function setMatchIndex(scroll, tableRef, matchIndex) {
    const dataInput = document.getElementById('data_input')
    if(!dataInput || !scroll || !scroll.class) return

    if(!dataInput[`${scroll.class}-searching`]) return 

    tableRef.current.scrollToRow(matchIndex)
    dataInput[`${scroll.class}-searching`] = false
}

function setScrollTop(scroll, tableRef, matchIndex) {
    const dataInput = document.getElementById('data_input')
    if(!dataInput || !scroll || !scroll.class) return 

    if(matchIndex >= 0 && dataInput[`${scroll.class}-searching`]) {
        dataInput[`${scroll.class}-scrollTop`] = matchIndex * 37
    } else if(tableRef && tableRef.current.bodyRef.current.scrollTop > 0) {
        dataInput[`${scroll.class}-scrollTop`] = tableRef.current.bodyRef.current.scrollTop
    }
}

function getScrollTop(scroll) {
    const dataInput = document.getElementById('data_input')
    return dataInput[`${scroll.class}-scrollTop`]
}

function findResizeCol(cols, key) {
    let flatC = flatCol(cols)
    return flatC.filter(o => o.key === key)[0]
}

function getListWidth(cols, wid = 0) {
    if(!cols || !cols.length) return 0

    return cols.reduce((pre, cur) => {
        if(cur.children && cur.children.length) {
            return getListWidth(cur.children, pre)
        } else {
            return pre + (cur.width || 0)
        }
    }, wid)
}

function setScrollValue(scroll, ds, tableRef) {
    const dataInput = document.getElementById('data_input')
    if(dataInput && scroll && scroll.class && tableRef) {
        dataInput[`${scroll.class}-scrollValue`] = getLastIndex(ds, tableRef.current.bodyRef.current.scrollTop)
    }
}

function getScrollValue(scroll) {
    const dataInput = document.getElementById('data_input')
    return dataInput[`${scroll.class}-scrollValue`]
}
function getLastIndex(ds, height) {
    if(!ds || !ds.length) return undefined

    let lastIndex
    for(let i = 0; i < ds.length; i++) {
        if(height <= 0) {
            lastIndex = i - 1
            break;
        }
        if (ds[i].entrys && ds[i].entrys.length > 0) {
            height -= 37 * ds[i].entrys.length
        } else {
            height -= 37
        }
    }
    return lastIndex
}

