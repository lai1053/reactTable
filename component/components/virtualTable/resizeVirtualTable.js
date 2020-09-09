import React, { PureComponent } from 'react'
import VirtualTable from './virtualTable'

class ColResizeTable extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            columns: this.upColumns(this.props.columns)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.columns && nextProps.columns.length) {
            this.state = {
                columns: this.upColumns(nextProps.columns)
            }
        }
    }

    handerResize = index => (e, { size }) => {
        this.setState(({ columns }) => {
            const nextCols = [...columns]
            nextCols[index] = {
                ...nextCols[index],
                width:
                    size.width + 1 < nextCols[index].minWidth
                        ? nextCols[index].minWidth
                        : size.width
            }
            const nextColsChild = nextCols[index]['children']
            if (nextColsChild && nextColsChild.length && nextColsChild.length > 1) {
                let forwardWidth = 0
                nextColsChild.map((o, k) => {
                    if (k == nextColsChild.length - 1) {
                        o.width = nextCols[index].width - forwardWidth
                    } else {
                        o.width = Math.ceil(nextCols[index].width / nextColsChild.length)
                        forwardWidth += o.width
                    }
                    nextColsChild[k] = o
                })

                nextCols[index]['children'] = nextColsChild
            }


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

            return { columns: nextCols }
        })
    }

    render() {
        const { columns } = this.state
        let listWidth = 0

        columns.map(o => {
            if (o.width) {
                listWidth += o.width
            }
        })

        let tableOption = this.props.scroll

        if (tableOption) {
            let tableClass = tableOption.class,
                rightTable = document.getElementsByClassName(tableClass) && document.getElementsByClassName(tableClass)[0]

            if (rightTable && listWidth) {
                tableOption.x = listWidth
                tableOption.w = listWidth

                let tableHeader = document.getElementsByClassName('ant-table-thead') && document.getElementsByClassName('ant-table-thead')[0]

                if (tableHeader) tableHeader.style.width = listWidth
            }
        }

        return (
            <VirtualTable
                {...this.props}
                columns={columns}
                scroll={this.state.scroll || this.props.scroll}
            />
        )
    }

    /**
    * 主要针对有二级表头来做宽度适应
    * -----------------------------------
    * 1. 默认没有二级合并表头 宽度为 字数 * 25
    * 2. 有二级合并表头 
    * 2.1. 比较一级表头字数 * 20 和二级表头数量 * 75 的大小 
    * 2.2. 哪个值大就按照哪个来算
    * 出现二级表头字数很多的情况 目前不考虑
    */
    upColumns = (columns) => {
        return columns.map((col, index) => ({
            ...col,
            minWidth: col.children && col.children.length ? Math.max.call(Math, col.title.length * 20, 75 * col.children.length) : col.title.length * 25,
            onHeaderCell: column => ({
                width: column.width,
                onResize: this.handerResize(index)
            })
        }))
    }


    onResizend = (onResizend) => {
        /**
         * <<<算法说明>>>
         * ---------------------------------------------------------------------------------
         * 1. 默认窗口状态 normal.
         * 2. 调整窗口大小时状态 resizing.
         * 3. 调整窗口大小时设置动作状态为 resizing, 并设置延时任务. 若已存在延时任务,则重新设置.
         * 4. 若500毫秒后没有断续调整大小,则认为调整结束,执行resizend事件.
         */

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
}

export default ColResizeTable