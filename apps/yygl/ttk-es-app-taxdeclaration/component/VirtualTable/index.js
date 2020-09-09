import React, { createElement, PureComponent } from "react"
import classNames from "classnames"
import { Spin } from "edf-component"
import TableHeader from "./TableHeader"
import TableBody from "./TableBody"
import { Provider } from "./context"
import {
    getSelectCol,
    getEstimatedTotalSize,
    getItemMetadata,
    findNearestItem,
    flatCol,
    isSupportSticky
} from "./utils"
/**
 * VirtualTable，采用了定宽、定高策略
 * @Author   weiyang.qiu
 * @DateTime 2020-03-24T11:00:36+0800
- [☑️] 1、伸缩列
    resizeAble<Boolean>:true/false
    结合react-resizable来实现。可参考demo上多层表头和伸缩列的例子
- [☑️] 2、锁定列
    fixed<String>:left/right
    default:undefined
- [☑️] 3、单元格自动换行
    如果行高不够，需要换行，结合rowHeight和rowClass来实现
- [☑️] 4、自定义列
    render:node
- [☑️]  5、排序
    render:sort node
- [☑️]  6、分页
    使用pagination控制dataSource来实现，table不集成
- [ ] 7、树形展示
    暂不支持
- [☑️] 8、可展开
    expandable={
        expandedRowRender:(record, index, indent, expanded)=>ReactNode,
        rowExpandable:(record)=>boolean,
        rowExpandedHeight:(record)=>number
    }
- [☑️]  9、可编辑
    默认支持，
- [☑️] 10、加载中
    loading
- [☑️] 11、合并单元格
    colSpan
- [☑️] 12、汇总行
    summary
- [☑️] 13、可变行高
    rowHeight:(rowIndex)
- [ ] 14、固定表头在页首
- [☑️] 15、流体列宽
    flexGrow<number>:1
    default:undefined
- [☑️] 16、可变行样式
    rowClass:(rowIndex)
- [☑️] 17、多表头
    columns带children
- [☑️] 18、虚拟化
    天生拥有
- [☑️] 19、滚动到指定行、列
    ref.current.scrollToRow(rowIndex)
    比如在调用组件的componentDidMount钩子函数中使用
- [☑️] 20、记住滚动位置
    initialScrollIndex
- [☑️] 21、行选择
    rowSelection:{}
- [☑️] 22、行事件
    onRow:(record)=>{}
- [☑️] 23、数据变化后，滚动到指定高度
    scrollTop:number
    default:undefined
    可通过tableRef.current.bodyRef.current.scrollTop来获取滚动之前的位置
- [☑️] 24、纵向不可以滚动
    verticalScrollUnAvail:()=>boolean
    default:false
 */
const Warpper = props => <div {...props}>{props.children}</div>
const getComponents = props => {
    const { body } = props.components || {}
    const { row, cell } = body || {}
    return {
        body: {
            row: row || Warpper,
            cell: cell || Warpper
        }
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
            rowExpandedHeight: rowIndex => 0
        }
    }
    constructor(props) {
        super(props)

        this.state = {
            isScrolling: false,
            scrollDirection: "forward",
            scrollOffset: 0,
            expandItems: {}
        }
        this._instanceProps = {
            itemMetadataMap: {},
            lastMeasuredIndex: -1,
            prefixCls: props.prefixCls || "vt",
            showHeader: props.showHeader,
            estimatedItemSize: props.estimatedItemSize,
            tableId: "virtual-table-" + new Date().valueOf(),
            reCalculate: false
        }
        this.headerScrollRef = React.createRef()
        this.bodyRef = React.createRef()
        this.scrollToRow = this.scrollToRow.bind(this)
        if (!window.cssSupportSticky) isSupportSticky()
    }
    scrollToRow(rowIndex) {
        const { itemMetadataMap } = this._instanceProps
        if (itemMetadataMap && itemMetadataMap[rowIndex] && this.bodyRef) {
            this.bodyRef.current.scrollTop =
                itemMetadataMap[rowIndex].offset || 0
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
    _getRangeToRender() {
        const { dataSource, overscanCount } = this.props
        const { isScrolling, scrollDirection, scrollOffset } = this.state
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
        const overscanBackward =
            !isScrolling || scrollDirection === "backward"
                ? Math.max(1, overscanCount)
                : 1
        const overscanForward =
            !isScrolling || scrollDirection === "forward"
                ? Math.max(1, overscanCount)
                : 1

        return [
            Math.max(0, startIndex - overscanBackward),
            Math.max(0, Math.min(itemCount - 1, stopIndex + overscanForward)),
            startIndex,
            stopIndex
        ]
    }
    componentDidMount() {
        const { initialScrollIndex } = this.props
        if (typeof initialScrollIndex === "number") {
            this.scrollToRow(initialScrollIndex)
        }
    }
    componentDidUpdate(prevProps) {
        if (
            !this._instanceProps.isEqual &&
            this.bodyRef.current.scrollTop > 0
        ) {
            let scrollOffset = this.props.scrollTop || 0
            this.setState({ scrollOffset }, () => {
                this.bodyRef.current.scrollTop = scrollOffset
            })
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
            false
        )
        this._instanceProps.lastMeasuredIndex = lastMeasuredIndex
        // console.log("onExpand:", index, expanded, this._instanceProps)
        this.setState(({ expandItems }) => {
            const nextItems = { ...expandItems }
            nextItems[index] = item.expanded
            return { expandItems: nextItems }
        })
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
            summaryRows,
            loading,
            tip,
            delay,
            verticalScrollUnAvail
        } = this.props
        const items = []
        let renderRange = [0, -1]
        let estimatedTotalSize = scroll.y || height || 400
        if (dataSource.length > 0) {
            estimatedTotalSize =
                getEstimatedTotalSize(this.props, this._instanceProps) +
                ((summaryRows && summaryRows.height) || 0) +
                10
            renderRange = this._getRangeToRender()
        }
        const [startIndex, stopIndex] = renderRange
        for (let index = startIndex; index <= stopIndex; index++) {
            items.push({ ...dataSource[index] })
        }
        // console.log(estimatedTotalSize, this._instanceProps)
        return (
            <Provider
                value={{
                    ...this._instanceProps,
                    ...this.props,
                    rowTotalHeight: estimatedTotalSize,
                    dataSource: items,
                    startIndex,
                    columns: getSelectCol(this.props, flatCol(columns)),
                    onExpand: ::this.onExpand,
                    components: getComponents(this.props)
                }}
            >
                <div
                    className={`${this._instanceProps.prefixCls}-table ${
                        this._instanceProps.tableId
                    } ${className || ""}`}
                    style={{
                        ...style,
                        maxWidth: width + "px",
                        maxHeight: height + "px"
                    }}
                    onTouchMove={e => {
                        e.preventDefault()
                    }}
                >
                    <Spin spinning={loading} tip={tip} delay={delay}>
                        <TableHeader
                            headerScrollRef={this.headerScrollRef}
                        ></TableHeader>
                        <TableBody
                            bodyRef={this.bodyRef}
                            headerScrollRef={this.headerScrollRef}
                            setState={::this.setState}
                            rowTotalHeight={estimatedTotalSize}
                            height={height || scroll.y || 400}
                            verticalScrollUnAvail={verticalScrollUnAvail}
                            tableId={this._instanceProps.tableId}
                        ></TableBody>
                    </Spin>
                </div>
            </Provider>
        )
    }
}
