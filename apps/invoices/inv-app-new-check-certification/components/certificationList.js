import React from "react"
import {
    Button,
    VirtualTable,
    Pagination,
    Tooltip,
    Layout
} from "edf-component"
import moment from "moment"
// import { fromJS, toJS } from "immutable";
import { Spin, DatePicker } from "antd"
import { quantityFormat, addEvent, removeEvent } from "../../utils/index"
import { throttle } from "edf-utils"

const { MonthPicker } = DatePicker
const getColumns = () => {
    let columns = [
        {
            title: "发票种类",
            dataIndex: "fpzlMc",
            minWidth: 130,
            width: 130
        },
        {
            title: "发票号码",
            dataIndex: "fphm",
            minWidth: 110,
            width: 110,
            render: (text, record, index) => {
                return <div className="text-center">{text}</div>
            }
        },
        {
            title: "开票日期",
            dataIndex: "kprq",
            minWidth: 110,
            width: 110,
            render: (text, record, index) => {
                return (
                    <div className="text-center">
                        {moment(text).format("YYYY-MM-DD")}
                    </div>
                )
            }
        },
        {
            title: "金额",
            dataIndex: "je",
            minWidth: 110,
            width: 110,
            render: (text, record, index) => {
                return (
                    <div className="text-right">
                        {text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : ""}
                    </div>
                )
            }
        },
        {
            title: "税额",
            dataIndex: "se",
            minWidth: 110,
            width: 110,
            render: (text, record, index) => {
                return (
                    <div className="text-right">
                        {text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : ""}
                    </div>
                )
            }
        },
        {
            title: "有效税额",
            dataIndex: "yxse",
            minWidth: 110,
            width: 110,
            render: (text, record, index) => {
                return (
                    <div className="text-right">
                        {text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : ""}
                    </div>
                )
            }
        },
        {
            title: "申报用途",
            dataIndex: "sbPurposeDesc",
            minWidth: 100,
            width: 100,
            render: (text, record, index) => {
                return <div className="text-center">{text}</div>
            }
        },
        {
            title: "销方名称",
            dataIndex: "xfmc"
        }
    ]
    return columns
}
export default class CertificationList extends React.Component {
    constructor(props) {
        super(props)

        const xfmcWidth =
            (
                document.querySelector(".edfx-app-portal-content-main") ||
                document.body
            ).offsetWidth - 796
        this.state = {
            scroll: {
                x:
                    (
                        document.querySelector(
                            ".edfx-app-portal-content-main"
                        ) || document.body
                    ).offsetWidth - 16
            },
            loading: false,
            tableSource: [],
            isCurrentSkssq: 1,
            localeSkssq: moment(props.skssq + "01"),
            pageSize: 50,
            currentPage: 1,
            totalCount: 0,
            totalFpNum: 0,
            totalJe: 0,
            totalSe: 0,
            totalYxse: 0,
            params: {},
            tableCols: getColumns().map((col, index) => ({
                ...col,
                width:
                    col.dataIndex === "xfmc"
                        ? xfmcWidth < 0
                            ? 100
                            : xfmcWidth
                        : col.width,
                minWidth:
                    col.dataIndex === "xfmc"
                        ? xfmcWidth < 0
                            ? 100
                            : xfmcWidth
                        : col.minWidth,
                onHeaderCell: column => ({
                    width: column.width,
                    onResize: throttle(this.handerResize(index), 100)
                })
            }))
        }
        this.webapi = props.webapi
        this.metaAction = props.metaAction || {}
        this.scrollHeight = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
            ? 20
            : 12
        this.tableClass = "certificationList-" + new Date().valueOf()
        this.tableScrollWidth = 0
    }
    handerResize = index => (e, { size }) => {
        this.setState(
            ({ tableCols }) => {
                const nextCols = [...tableCols]
                nextCols[index] = {
                    ...nextCols[index],
                    width:
                        size.width < nextCols[index].minWidth
                            ? nextCols[index].minWidth
                            : size.width
                }
                return { tableCols: nextCols }
            },
            () => {
                const dom = document.querySelector(
                    `.${this.tableClass} .ant-table-body`
                )
                if (dom && dom.scrollLeft > 0) {
                    dom.scrollLeft =
                        dom.scrollLeft + dom.scrollWidth - this.tableScrollWidth
                    this.tableScrollWidth = dom.scrollWidth
                }
            }
        )
    }
    componentDidMount() {
        this.initPage()
        this.onResize()
        addEvent(window, "resize", ::this.onResize)
        this.props.returnChild && this.props.returnChild(this)
    }
    disabledStartDate = startValue => {
        let { skssq } = this.props
        return (
            startValue.valueOf() >
            new Date(
                moment(skssq + "01")
                    .subtract(0, "month")
                    .format("YYYY-MM-DD")
                    .substr(0, 7)
            ).valueOf()
        )
    }
    componentWillUnmount() {
        removeEvent(window, "resize", ::this.onResize)
    }
    async initPage() {
        const { skssq, nsrsbh } = this.props
        const { pageSize, currentPage, localeSkssq } = this.state
        this.setState({
            loading: true
        })
        let obj = {
            entity: {
                nsrsbh: nsrsbh,
                skssq: localeSkssq ? localeSkssq.format("YYYYMM") : skssq
            },
            gxListType: 3,
            selectAll: 0
        }
        //分页信息（是否全选标志为0，即不是全选的时候，必传；是否全选标志为1，即是全选的时候，不传）
        obj.page = {
            currentPage: currentPage,
            pageSize: pageSize
        }
        const res = await this.webapi.iancc.queryGxPageList(obj)

        this.setState({
            tableSource: res.list,
            totalFpNum: res.totalFpNum,
            totalJe: res.totalJe,
            totalSe: res.totalSe,
            totalYxse: res.totalYxse,
            totalCount:
                res.page && res.page.totalCount ? res.page.totalCount : 0,
            loading: false
        })

        return Promise.resolve(res)
    }

    getTableWidth() {
        return this.state.tableCols
            .map(m => m.width || 0)
            .reduce((a, b) => a + b, 0)
    }
    onResize(e) {
        setTimeout(() => {
            const cn = `inv-app-new-check-certification-lista`
            let table = document.getElementsByClassName(cn)[0]
            // theadDom = table && table.getElementsByClassName('ant-table-thead')[0];//bovms-editable-table
            if (table) {
                let h = table.offsetHeight - 136, //头＋尾＋表头＋滚动条
                    w = table.offsetWidth,
                    width = this.getTableWidth(),
                    scroll = { y: h, x: w > width ? w : width }
                if (w > width) {
                    const tableCols = this.state.tableCols,
                        item = tableCols.find(f => f.dataIndex === "xfmc")
                    item.width = w - 780
                    item.minWidth = w - 780
                    this.setState({ scroll, tableCols })
                } else {
                    this.setState({ scroll })
                }
            } else {
                setTimeout(() => {
                    this.onResize()
                }, 100)
                return
            }
        }, 100)
    }
    pageChanged = (page, pageSize) => {
        this.setState(
            {
                currentPage: page || this.state.currentPage,
                pageSize: pageSize || this.state.pageSize
            },
            () => {
                this.initPage()
            }
        )
    }
    renderFooter = () => {
        const { pageSize, currentPage, totalCount } = this.state
        return (
            <div className="bovms-app-purchase-list-footer">
                {this.renderFooterTotal()}
                <Pagination
                    pageSizeOptions={["50", "100", "200", "300"]}
                    pageSize={pageSize}
                    current={currentPage}
                    total={totalCount}
                    onChange={this.pageChanged}
                    onShowSizeChange={this.pageChanged}
                    showTotal={total => (
                        <span>
                            共<strong>{total}</strong>条记录
                        </span>
                    )}
                ></Pagination>
            </div>
        )
    }
    renderFooterTotal = () => {
        const { totalFpNum, totalJe, totalSe, totalYxse } = this.state
        let content = (
            <div className="footer-total-content">
                <span>合计</span>
                <span>
                    共<strong>{totalFpNum}</strong>张发票
                </span>
                <span>
                    金额
                    <strong>{totalJe.toFixed(2)}</strong>(元)
                </span>
                <span>
                    税额：
                    <strong>{totalSe.toFixed(2)}</strong>(元)
                </span>
                <span>
                    有效税额：
                    <strong>{totalYxse.toFixed(2)}</strong>(元)
                </span>
            </div>
        )
        return (
            <Tooltip
                placement="topLeft"
                title={content}
                overlayClassName="bovms-app-footer-tool"
            >
                <div className="footer-total">{content}</div>
            </Tooltip>
        )
    }
    async onChange(e) {
        this.setState(
            {
                localeSkssq: e,
                isCurrentSkssq:
                    moment(e).format("YYYY-MM-DD") ===
                    moment(this.props.skssq + "01").format("YYYY-MM-DD")
                        ? 1
                        : 0
            },
            () => {
                this.initPage()
            }
        )
    }

    async exportTable() {
        this.setState({
            exportLoading: true
        })
        const { skssq, nsrsbh } = this.props,
            { localeSkssq } = this.state,
            currentOrg = this.metaAction.context.get("currentOrg") || {},
            obj = {
                entity: {
                    nsrsbh: nsrsbh,
                    skssq: localeSkssq ? localeSkssq.format("YYYYMM") : skssq
                },
                gxListType: 3,
                qyMc: currentOrg.name
            },
            res = await this.webapi.iancc.exportGxrzYrzFpExcel(obj)
        this.setState({
            exportLoading: false
        })
    }
    render() {
        const { skssq } = this.props,
            {
                loading,
                tableSource,
                scroll,
                localeSkssq,
                exportLoading,
                tableCols
            } = this.state,
            className = `bovms-editable-table iancc-table bovms-common-table-style ${this.tableClass}`,
            tableWidth =
                (
                    document.querySelector(".edfx-app-portal-content-main") ||
                    document.body
                ).offsetWidth - 16,
            sumTableWidth = this.getTableWidth()
        if (scroll.x && tableWidth < scroll.x) {
            tableCols.forEach(o => {
                if (!o.width) o.width = scroll.x - 780
            })
        }
        if (sumTableWidth > tableWidth) {
            scroll.x = sumTableWidth
        }
        if (sumTableWidth < tableWidth || tableWidth > scroll.x) {
            scroll.x = tableWidth
        }
        // _columns = this.getColumns()
        return (
            <Layout className="inv-app-new-check-certification-lista">
                <div className="inv-app-new-check-certification-checkdeduction-header">
                    <div className="inv-app-new-check-certification-checkdeduction-header-left">
                        <div>
                            税款所属期：
                            <MonthPicker
                                value={localeSkssq}
                                disabledDate={this.disabledStartDate}
                                onChange={::this.onChange}
                            />
                        </div>
                    </div>
                    <div className="inv-app-new-check-certification-checkdeduction-header-right">
                        <Button
                            style={{ marginRight: "8px" }}
                            loading={exportLoading}
                            onClick={::this.exportTable}
                            type="primary"
                        >
                            导出
                        </Button>
                    </div>
                </div>
                <VirtualTable
                    loading={loading}
                    style={{ width: tableWidth + 5 + "px" }}
                    className={className}
                    bordered
                    dataSource={tableSource}
                    columns={tableCols}
                    scroll={scroll}
                    pagination={false}
                    rowKey="kjxh"
                />
                {this.renderFooter()}
            </Layout>
        )
    }
}
