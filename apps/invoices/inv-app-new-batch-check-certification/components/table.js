import React, { useState, useEffect } from "react"
import { Icon, Pagination, VirtualTable } from "edf-component"
import { Tooltip, Divider } from "antd"
import {
    quantityFormat,
    flatCols,
    addEvent,
    removeEvent
} from "../../utils/index"
import { fromJS } from "immutable"
import { throttle } from "edf-utils"
const scrollBarWidth = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
    ? 18
    : /Edge\/(\S+)/.test(navigator.userAgent)
    ? 18
    : 12

const getColumns = props => {
    let columns = [
        {
            title: "客户名称",
            dataIndex: "customerName",
            // width: 200,
            minWidth: 100
        },
        {
            title: "助记码",
            dataIndex: "memCode",
            width: 100,
            minWidth: 100
        },
        {
            title: "税款所属期",
            dataIndex: "skssq",
            width: 85,
            minWidth: 85,
            align: "center"
        },
        {
            title: "发票管理工具",
            dataIndex: "clientStateDesc",
            width: 95,
            minWidth: 95,
            align: "center"
        },
        {
            title: "抵扣",
            dataIndex: "dk",
            width: 260,
            minWidth: 260,
            children: [
                {
                    title: "份数",
                    dataIndex: "dkTotalFpNum",
                    align: "center",
                    width: 60
                },
                {
                    title: "金额",
                    dataIndex: "dkTotalJe",
                    width: 100,
                    align: "right",
                    render: text =>
                        text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : ""
                },
                {
                    title: "有效税额",
                    dataIndex: "dkTotalYxse",
                    width: 100,
                    align: "right",
                    render: text =>
                        text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : ""
                }
            ]
        },
        {
            title: "不抵扣",
            dataIndex: "bdk",
            width: 260,
            minWidth: 260,
            children: [
                {
                    title: "份数",
                    dataIndex: "bdkTotalFpNum",
                    align: "center",
                    width: 60
                },
                {
                    title: "金额",
                    dataIndex: "bdkTotalJe",
                    width: 100,
                    align: "right",
                    render: text =>
                        text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : ""
                },
                {
                    title: "有效税额",
                    dataIndex: "bdkTotalYxse",
                    width: 100,
                    align: "right",
                    render: text =>
                        text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : ""
                }
            ]
        },
        {
            title: "状态",
            dataIndex: "totalSignStateDesc",
            align: "center",
            width: 100,
            minWidth: 100,
            render: (text, record) => {
                return (
                    <span>
                        {record.totalSignState == 3 ||
                        record.totalSignState == 6 ? (
                            <Tooltip
                                arrowPointAtCenter={true}
                                placement="left"
                                title={
                                    (record.errMessageList &&
                                        record.errMessageList[0]) ||
                                    ""
                                }
                                overlayClassName="inv-tool-tip-warning"
                            >
                                <Icon
                                    type="exclamation-circle"
                                    className="inv-custom-warning-text warning-icon"
                                />
                                <span
                                    style={{
                                        color: "#cc0000",
                                        marginLeft: "8px"
                                    }}
                                >
                                    {text}
                                </span>
                            </Tooltip>
                        ) : (
                            text
                        )}
                    </span>
                )
            }
        },
        {
            title: "操作",
            dataIndex: "operation",
            align: "center",
            // fixed: "right",
            width: 300,
            minWidth: 300,
            render: (text, record) => {
                const {
                        checked,
                        cancelBooked,
                        gotoGouXuan,
                        gotoTaxBureau
                    } = props,
                    isWupan =
                        record.xzqhdm.indexOf("44") === 0 ||
                        record.xzqhdm.indexOf("52") === 0 ||
                        record.xzqhdm.indexOf("11") === 0 ||
                        record.xzqhdm.indexOf("61") === 0
                // 全部页签，状态＝预约中
                if (checked === null && record.totalSignState === 10) {
                    return (
                        <React.Fragment>
                            {isWupan && (
                                <React.Fragment>
                                    <a
                                        onClick={gotoTaxBureau.bind(
                                            this,
                                            record
                                        )}
                                    >
                                        无盘认证
                                    </a>
                                    <Divider type="vertical" />
                                </React.Fragment>
                            )}
                            <a onClick={cancelBooked.bind(this, record)}>
                                取消预约
                            </a>
                            <Divider type="vertical" />
                            <a onClick={gotoGouXuan.bind(this, record)}>
                                勾选认证
                            </a>
                        </React.Fragment>
                    )
                }
                return (
                    <React.Fragment>
                        {isWupan && (
                            <React.Fragment>
                                <a onClick={gotoTaxBureau.bind(this, record)}>
                                    无盘认证
                                </a>
                                <Divider type="vertical" />
                            </React.Fragment>
                        )}
                        <a onClick={e => gotoGouXuan(record)}>勾选认证</a>
                    </React.Fragment>
                )
            }
        }
    ]
    return columns
}
// 点击表格的行
const onRow = (record, props) => {
    return {
        onClick: () => {
            const dom = document.querySelector(
                `.bovms-editable-table.ianbcc-table.bovms-common-table-style .ant-table-body .virtual-grid-main-scrollbar`
            )
            if (dom) dom.style.opacity = 0
            const { selectedRowKeys, metaAction } = props
            const index = selectedRowKeys.findIndex(
                f => String(f) === String(record.qyId)
            )
            if (index > -1) {
                selectedRowKeys.splice(index, 1)
            } else {
                selectedRowKeys.push(record.qyId)
            }
            metaAction &&
                metaAction.sf("data.selectedRowKeys", fromJS(selectedRowKeys))
            // listRef && listRef.scrollToItem(index)
        }
    }
}
// 检测table被点击行的selectedRowKeys数组
const onSelectChange = (arr, metaAction) => {
    metaAction && metaAction.sf("data.selectedRowKeys", fromJS(arr))
}
const getTableWidth = cols => {
    return flatCols(cols)
        .map(m => m.width || 0)
        .reduce((a, b) => a + b, 0)
}

export default class InvBatchCheckCertificationTable extends React.Component {
    constructor(props) {
        super(props)
        const customerNameWidth = document.body.offsetWidth - 1262
        this.state = {
            scroll: { x: document.body.offsetWidth },
            resizeCols: getColumns(this.props).map((col, index) => ({
                ...col,
                width:
                    col.dataIndex === "customerName"
                        ? customerNameWidth < 0
                            ? 100
                            : customerNameWidth
                        : col.width,
                minWidth:
                    col.dataIndex === "customerName"
                        ? customerNameWidth < 0
                            ? 100
                            : customerNameWidth
                        : col.minWidth,
                onHeaderCell: column => ({
                    width: column.width,
                    onResize: throttle(this.handerResize(index), 100)
                })
            }))
        }
        this.scrollHeight = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
            ? 20
            : 12
        this.className = `bovms-editable-table ianbcc-table bovms-common-table-style`
        this.tableScrollWidth = 0
    }
    componentDidMount() {
        addEvent(window, "resize", ::this.onResize)
        this.onResize()
    }
    componentWillUnmount() {
        removeEvent(window, "resize", this.onResize)
    }
    onResize = e => {
        setTimeout(() => {
            const cn = `inv-app-new-batch-check-certification`
            let table = document.getElementsByClassName(cn)[0]
            if (table) {
                let h = table.offsetHeight - 180 - this.scrollHeight, //头＋尾＋表头＋滚动条
                    w = table.offsetWidth,
                    width = getTableWidth(this.state.resizeCols) + 62,
                    _scroll = { y: h, x: w > width ? w : width }
                if (w > width) {
                    const resizeCols = this.state.resizeCols,
                        item = resizeCols.find(
                            f => f.dataIndex === "customerName"
                        )
                    item.width = w - 1262
                    item.minWidth = w - 1262
                    this.setState({ scroll: _scroll, resizeCols })
                } else {
                    this.setState({ scroll: _scroll })
                }
            } else {
                setTimeout(() => {
                    this.onResize()
                }, 100)
                return
            }
        }, 100)
    }
    handerResize = index => (e, { size }) => {
        if (this.state.resizeCols[index].dataIndex === "operation") {
            return
        }
        this.setState(
            ({ resizeCols }) => {
                const nextCols = [...resizeCols]
                nextCols[index] = {
                    ...nextCols[index],
                    width:
                        size.width <= nextCols[index].minWidth
                            ? nextCols[index].minWidth
                            : size.width
                }
                return { resizeCols: nextCols }
            },
            () => {
                const dom = document.querySelector(
                    ".bovms-editable-table.ianbcc-table.bovms-common-table-style .ant-table-body"
                )
                if (dom && dom.scrollLeft > 0) {
                    dom.scrollLeft =
                        dom.scrollLeft + dom.scrollWidth - this.tableScrollWidth
                    this.tableScrollWidth = dom.scrollWidth
                }
            }
        )
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        const dom = document.querySelector(
            `.bovms-editable-table.ianbcc-table.bovms-common-table-style .ant-table-body .virtual-grid-main-scrollbar`
        )
        if (dom) {
            const tbBody = document.querySelector(
                    `.bovms-editable-table.ianbcc-table.bovms-common-table-style .ant-table-body`
                ),
                offsetLeft = tbBody.offsetWidth,
                left =
                    offsetLeft - scrollBarWidth + 1 + tbBody.scrollLeft + "px"
            dom.style.left = left
            dom.style.opacity = 1
        }
    }
    render() {
        const {
            loading,
            checked,
            tableSource,
            selectedRowKeys,
            pageSize,
            currentPage,
            totalCount,
            metaAction,
            initPage
        } = this.props
        const rowSelection = {
                columnWidth: 62,
                selectedRowKeys,
                onChange: arr => onSelectChange(arr, metaAction),
                hideDefaultSelections: true
            },
            { scroll, resizeCols } = this.state,
            sumTableWidth = getTableWidth(resizeCols) + 62,
            tableWidth = document.body.offsetWidth
        const pageChanged = (page, pageSize) => {
            initPage && initPage(page, pageSize)
        }

        if (scroll.x && tableWidth < scroll.x) {
            resizeCols.forEach(o => {
                if (!o.width) o.width = scroll.x - 1262
            })
        }
        if (sumTableWidth >= tableWidth) {
            scroll.x = sumTableWidth
        }
        if (sumTableWidth < tableWidth || tableWidth > scroll.x) {
            scroll.x = tableWidth
        }

        return (
            <React.Fragment>
                <VirtualTable
                    loading={loading}
                    style={{ width: tableWidth + "px" }}
                    rowSelection={rowSelection}
                    className={this.className}
                    bordered
                    dataSource={tableSource}
                    columns={resizeCols}
                    scroll={scroll}
                    pagination={false}
                    rowKey="qyId"
                    onRow={record => onRow(record, this.props, this.gridRef)}
                    listRef={node => (this.gridRef = node)}
                />
                <div
                    className="bovms-app-purchase-list-footer"
                    style={{ backgroundColor: "white" }}
                >
                    <div className="footer-total"></div>
                    <Pagination
                        pageSizeOptions={["50", "100", "200", "300"]}
                        pageSize={pageSize}
                        current={currentPage}
                        total={totalCount}
                        onChange={pageChanged}
                        onShowSizeChange={pageChanged}
                        showTotal={total => (
                            <span>
                                共<strong>{total}</strong>条记录
                            </span>
                        )}
                    ></Pagination>
                </div>
            </React.Fragment>
        )
    }
}
