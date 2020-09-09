import React from "react"
import { Button, Tooltip, Table, VirtualTable, Layout } from "edf-component"
import moment from "moment"
import { Spin, DatePicker, Modal } from "antd"
import { quantityFormat, addEvent, removeEvent } from "../../utils/index"
import { printExistingElement } from "../../components/print"
const { MonthPicker } = DatePicker
import { throttle } from "edf-utils"

const SubmitComfirm = props => {
    const { type } = props
    let title = ""
    switch (type) {
        case "sign":
            title = "请确认是否提交签名"
            break
        case "booked":
            title = "请确认是否提交预约签名"
            break
        case "cancelSign":
            title = "请确认是否撤销统计"
            break
        case "cancelBooked":
            title = "请确认是否取消预约"
            break
    }
    return (
        <div style={{ paddingBottom: "16px", fontSize: "12px" }}>
            <div
                style={{
                    fontSize: "16px",
                    color: "#5a5a5a",
                    marginBottom: "17px"
                }}
            >
                {title}
            </div>
            {type == "sign" && (
                <div>
                    <span style={{ color: "#f17712" }}>温馨提示：</span>
                    <span style={{ color: "#a8a8a8" }}>
                        统计签名是将待认证发票，发送至发票综合服务平台，一键完成勾选、统计、签名！
                    </span>
                </div>
            )}
        </div>
    )
}

class SignSubmited extends React.Component {
    render() {
        return (
            <div
                className="inv-app-new-batch-check-certification-link-modal-div"
                style={{ paddingLeft: "40px", fontSize: "14px" }}
            >
                <div
                    style={{
                        marginBottom: "13px",
                        fontSize: "14px",
                        paddingTop: "8px"
                    }}
                >
                    <strong>签名提交中</strong>
                </div>
                <div>
                    <div
                        style={{
                            color: "#f17712",
                            display: "inline-block",
                            verticalAlign: "top"
                        }}
                    >
                        提示：
                    </div>
                    <div
                        style={{
                            color: "#d0d0d0",
                            display: "inline-block",
                            width: "255px",
                            verticalAlign: "top"
                        }}
                    >
                        统计签名，预计需要10分钟左右时间，请保持发票管理工具已连接状态！
                    </div>
                </div>
                <div className="inv-app-new-batch-check-certification-link-modal-loading"></div>
            </div>
        )
    }
}

class FaildRecordList extends React.Component {
    render() {
        const { arr } = this.props
        return (
            <div className="cds-fail-record-list">
                {arr.length ? (
                    <div className="cds-fail-record-content">
                        {arr.map(item => (
                            <div>
                                {(item.errMessageList || []).map(rm => (
                                    <div>{rm || ""}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="cds-fail-record-content">无异常数据</div>
                )}
            </div>
        )
    }
}
const getColumns = () => {
    return [
        {
            title: "发票种类",
            dataIndex: "fpzlMc"
        },
        {
            title: "抵扣",
            dataIndex: "dk",
            minWidth: 380,
            width: 380,
            children: [
                {
                    title: "发票份数",
                    dataIndex: "dkTotalFpNum",
                    align: "center",
                    width: 80
                },
                {
                    title: "金额",
                    dataIndex: "dkTotalJe",
                    align: "right",
                    render: text =>
                        text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : "",
                    width: 100
                },
                {
                    title: "税额",
                    dataIndex: "dkTotalSe",
                    align: "right",
                    render: text =>
                        text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : "",
                    width: 100
                },
                {
                    title: "有效税额",
                    dataIndex: "dkTotalYxse",
                    align: "right",
                    render: text =>
                        text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : "",
                    width: 100
                }
            ]
        },
        {
            title: "不抵扣",
            dataIndex: "bdk",
            minWidth: 380,
            width: 380,
            children: [
                {
                    title: "发票份数",
                    dataIndex: "bdkTotalFpNum",
                    align: "center",
                    width: 80
                },
                {
                    title: "金额",
                    dataIndex: "bdkTotalJe",
                    align: "right",
                    render: text =>
                        text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : "",
                    width: 100
                },
                {
                    title: "税额",
                    dataIndex: "bdkTotalSe",
                    align: "right",
                    render: text =>
                        text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : "",
                    width: 100
                },
                {
                    title: "有效税额",
                    dataIndex: "bdkTotalYxse",
                    align: "right",
                    render: text =>
                        text !== undefined
                            ? quantityFormat(text.toFixed(2), 2)
                            : "",
                    width: 100
                }
            ]
        }
    ]
}
export default class CheckDeductionStat extends React.Component {
    constructor(props) {
        super(props)
        const fpzlMcWidth =
            (
                document.querySelector(".edfx-app-portal-content-main") ||
                document.body
            ).offsetWidth - 780
        this.state = {
            scroll: {
                x:
                    (
                        document.querySelector(
                            ".edfx-app-portal-content-main"
                        ) || document.body
                    ).offsetWidth - 20
            },
            loading: false,
            checked: 1,
            tableSource: [],
            isCurrentSkssq: 1,
            localeSkssq: moment(props.skssq + "01"),
            linkModalShow: false,
            submitType: "sign",
            totalSignInfo: props.totalSignInfo || {},
            tableCols: getColumns().map((col, index) => ({
                ...col,
                width:
                    col.dataIndex === "fpzlMc"
                        ? fpzlMcWidth < 0
                            ? 100
                            : fpzlMcWidth
                        : col.width,
                minWidth:
                    col.dataIndex === "fpzlMc"
                        ? fpzlMcWidth < 0
                            ? 100
                            : fpzlMcWidth
                        : col.minWidth,
                onHeaderCell: column => ({
                    width: column.width,
                    onResize: throttle(this.handerResize(index), 100)
                })
            }))
        }
        this.webapi = props.webapi
        this.metaAction = props.metaAction || {}
        this.tableClass = "checkDeductionStat-" + new Date().valueOf()
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
        const { nsrsbh } = this.props
        const {
            params,
            pageSize,
            currentPage,
            isCurrentSkssq,
            localeSkssq
        } = this.state
        const totalSignRes = await this.webapi.iancc.queryTotalSignStateAndSignFailInfo(
            {
                nsrsbh,
                skssq: moment(localeSkssq).format("YYYYMM")
            }
        )

        this.setState({
            loading: true,
            totalSignInfo: totalSignRes || {}
        })
        let obj = {
            entity: {
                nsrsbh,
                skssq: moment(localeSkssq).format("YYYYMM"),
                totalSignState: (totalSignRes || {}).totalSignState
            },
            isCurrentSkssq: isCurrentSkssq
        }

        const res = await this.webapi.iancc.queryGxSignInfoPageList(obj)
        if (
            res &&
            res.gxSignInfoDetails &&
            Array.isArray(res.gxSignInfoDetails)
        ) {
            res.gxSignInfoDetails.push({
                fpzlMc: "合计",
                dkTotalFpNum: res.dkTotalFpNum,
                dkTotalJe: res.dkTotalJe,
                dkTotalSe: res.dkTotalSe,
                dkTotalYxse: res.dkTotalYxse,
                bdkTotalFpNum: res.bdkTotalFpNum,
                bdkTotalJe: res.bdkTotalJe,
                bdkTotalSe: res.bdkTotalSe,
                bdkTotalYxse: res.bdkTotalYxse
            })
        }
        this.setState({
            tableSource: (res && res.gxSignInfoDetails) || [],
            loading: false
        })
        // return Promise.resolve(res)
    }
    onSearch(values) {
        const { params } = this.state
        this.setState(
            {
                params: values
            },
            () => {
                this.initPage()
            }
        )
    }
    reset() {
        this.form.props.form.resetFields()
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
                let h = 37 * 4 + 18, //table.offsetHeight - 101 - 15 - 12, //头＋尾＋表头＋滚动条
                    w = table.offsetWidth,
                    width = this.getTableWidth(),
                    scroll = { y: h, x: w > width ? w : width }
                if (w > width) {
                    const tableCols = this.state.tableCols,
                        item = tableCols.find(f => f.dataIndex === "fpzlMc")
                    item.width = w - 760
                    item.minWidth = w - 760
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

    onSelectChange = arr => {
        this.setState({
            selectedRowKeys: arr
        })
    }
    onRow = record => {
        return {
            onClick: event => {
                const { selectedRowKeys, tableSource } = this.state
                // if (tableSource.find(ff => String(ff.kjxh) === String(record.kjxh))) {
                //      return
                //  }
                const index = selectedRowKeys.findIndex(
                    f => String(f) === String(record.kjxh)
                )
                if (index > -1) {
                    selectedRowKeys.splice(index, 1)
                } else {
                    selectedRowKeys.push(record.kjxh)
                }
                this.setState({
                    selectedRowKeys
                })
            } // 点击行
        }
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
    handlelinkModalCancel = () => {
        this.setState({
            linkModalShow: false
        })
    }
    renderLinkModal() {
        const { linkModalShow, submitType } = this.state
        let title, content
        switch (submitType) {
            case "sign":
                title = "签名提交中"
                content =
                    "统计签名，预计需要10分钟左右时间，请保持发票管理工具已连接状态！"
                break
            case "cancelSign":
                title = "撤销统计提交中"
                content =
                    "撤销统计，预计需要5分钟左右时间，请保持发票管理工具已连接状态！"
                break
            case "booked":
                title = "预约签名提交中"
                content = "预约签名提交后，发票管理工具已连接，会自动签名。"
                break
        }
        return (
            <Modal
                className="inv-app-new-batch-check-certification-link-modal"
                visible={linkModalShow}
                onOk={this.handlelinkModalCancel}
                onCancel={this.handlelinkModalCancel}
                footer={[
                    <Button
                        key="submit"
                        type="primary"
                        onClick={this.handlelinkModalCancel}
                    >
                        确定
                    </Button>
                ]}
            >
                <div
                    className="inv-app-new-batch-check-certification-link-modal-div"
                    style={{ paddingLeft: "40px", fontSize: "14px" }}
                >
                    <div
                        style={{
                            marginBottom: "13px",
                            fontSize: "14px",
                            paddingTop: "8px"
                        }}
                    >
                        <strong>{title}</strong>
                    </div>
                    <div>
                        <div
                            style={{
                                color: "#f17712",
                                display: "inline-block",
                                verticalAlign: "top"
                            }}
                        >
                            提示：
                        </div>
                        <div
                            style={{
                                color: "#999",
                                display: "inline-block",
                                width: "255px",
                                verticalAlign: "top"
                            }}
                        >
                            {content}
                        </div>
                    </div>
                    <div className="inv-app-new-batch-check-certification-link-modal-loading"></div>
                </div>
            </Modal>
        )
    }
    async statSign(type) {
        let { clientState } = this.props
        if (
            type.toLocaleLowerCase().indexOf("booked") == -1 &&
            clientState == 2
        ) {
            this.metaAction.modal("info", {
                title: "未连接",
                width: "480px",
                className: "inv-app-new-check-certification-modal4",
                okText: "确定",
                content: (
                    <div style={{ fontSize: "12px", lineHeight: "22px" }}>
                        发票管理工具未连接，请启动，并插入控盘！
                    </div>
                )
            })
            return
        }

        let res = await this.metaAction.modal("confirm", {
            style: { top: 5 },
            title: "请确认是否提交：",
            width: 480,
            okText: "确定",
            onOk: () => {
                this.handelBtn(type)
            },
            className: "inv-app-new-check-certification-modal1",
            content: <SubmitComfirm type={type}></SubmitComfirm>
        })
    }
    async handelBtn(type) {
        let apiFn = ""
        switch (type) {
            case "sign":
                apiFn = "submitSignRequest"
                break
            case "cancelSign":
                apiFn = "cancelSignRequest"
                break
            case "booked":
                apiFn = "submitBookedSignRequest"
                break
            case "cancelBooked":
                apiFn = "cancelBookedSignRequest"
                break
        }
        const { skssq, nsrsbh } = this.props,
            res = await this.webapi.iancc[apiFn]({
                skssq: skssq,
                nsrsbh: nsrsbh,
                isReturnValue: type === "cancelBooked"
            })
        if (type !== "cancelBooked" && res === null) {
            this.setState(
                {
                    submitType: type,
                    linkModalShow: true,
                    currentPage: 1
                },
                () => {
                    this.initPage()
                }
            )
        } else {
            if (res && !res.result && res.error && res.error.message) {
                this.metaAction.toast("error", res.error.message)
            } else {
                this.metaAction.toast("success", "取消成功")
                this.initPage()
            }
        }
    }

    async queryFailRecord() {
        const { skssq, nsrsbh } = this.props
        let res = await this.webapi.iancc.batchQuerySignFailInfo([
            { skssq: skssq, nsrsbh: nsrsbh }
        ])

        this.metaAction.modal("show", {
            style: { top: 5 },
            title: "异常查询",
            width: 680,
            okText: "确定",
            footer: false,
            children: <FaildRecordList arr={res || []}></FaildRecordList>
        })
    }
    printTable() {
        const tableCols = this.state.tableCols,
            fpzlMcCol = tableCols.find(f => f.dataIndex === "fpzlMc"),
            tempWidth = fpzlMcCol.width
        fpzlMcCol.width = 1044 - 760
        fpzlMcCol.minWidth = 1044 - 760
        this.setState({ showTitle: true, tableCols }, () => {
            printExistingElement(
                `.bovms-editable-table.iancc-table.bovms-common-table-style.${this.tableClass}`,
                "A4 landscape"
            )
            fpzlMcCol.width = fpzlMcCol.minWidth = tempWidth
            this.setState({ showTitle: false, tableCols })
        })
    }
    render() {
        const { skssq, nsrsbh } = this.props,
            {
                loading,
                tableSource,
                scroll,
                localeSkssq,
                isCurrentSkssq,
                totalSignInfo,
                showTitle,
                tableCols
            } = this.state,
            className = `bovms-editable-table iancc-table bovms-common-table-style a4landscape ${this.tableClass}`,
            // _columns = this.getColumns(),
            currentOrg = this.metaAction.context.get("currentOrg") || {},
            tableWidth = showTitle
                ? 1044
                : (
                      document.querySelector(".edfx-app-portal-content-main") ||
                      document.body
                  ).offsetWidth - 20,
            sumTableWidth = this.getTableWidth()
        if (scroll.x && tableWidth < scroll.x) {
            tableCols.forEach(o => {
                if (!o.width) o.width = scroll.x - 760
            })
        }
        if (sumTableWidth > tableWidth) {
            scroll.x = sumTableWidth
        }
        if (sumTableWidth < tableWidth || tableWidth > scroll.x) {
            scroll.x = tableWidth
        }
        if (showTitle) {
            scroll.x = 1044
        }
        //判断当前税款所属期是否是上个月
        let isPrevMonth =
            skssq ==
            moment(new Date())
                .subtract(1, "month")
                .format("YYYYMM")
        let isShowSignBtn =
            totalSignInfo.totalSignState == 1 ||
            totalSignInfo.totalSignState == 3
        let isShowCalcelBtn =
            totalSignInfo.totalSignState == 4 ||
            totalSignInfo.totalSignState == 6
        const tableTitle = () => (
            <div className="title-container">
                <div className="title">发票统计表</div>
                <div className="company-info">
                    <div>
                        <span>纳税人名称：{currentOrg.name}</span>
                        <span>纳税人识别号：{nsrsbh}</span>
                        <span>
                            所属月份：{localeSkssq.format("YYYY年MM")}日
                        </span>
                    </div>
                    <div>单位（份、元）</div>
                </div>
            </div>
        )
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
                        {isCurrentSkssq == 1 && (
                            <span style={{ margin: "0 8px" }}>
                                {totalSignInfo.totalSignStateDesc && "｜"}
                            </span>
                        )}
                        {isCurrentSkssq == 1 &&
                            (totalSignInfo.totalSignState == 3 ||
                            totalSignInfo.totalSignState == 6 ? (
                                <Tooltip
                                    arrowPointAtCenter={true}
                                    placement="bottom"
                                    title={
                                        (totalSignInfo.errMessageList &&
                                            totalSignInfo.errMessageList[0]) ||
                                        ""
                                    }
                                    overlayClassName="inv-tool-tip-warning"
                                >
                                    <span style={{ color: "#cc0000" }}>
                                        {totalSignInfo.totalSignStateDesc}
                                    </span>
                                </Tooltip>
                            ) : (
                                <span>{totalSignInfo.totalSignStateDesc}</span>
                            ))}
                    </div>
                    <div className="inv-app-new-check-certification-checkdeduction-header-right">
                        {/*  当前税款所属期=上月 并且 状态“未签名、签名失败”：状态显示【统计签名】  */}
                        {isCurrentSkssq == 1 && isPrevMonth && isShowSignBtn && (
                            <React.Fragment>
                                <Button
                                    style={{ marginRight: "8px" }}
                                    onClick={this.statSign.bind(this, "booked")}
                                    type="primary"
                                >
                                    预约签名
                                </Button>
                                <Button
                                    style={{ marginRight: "8px" }}
                                    onClick={this.statSign.bind(this, "sign")}
                                    type="primary"
                                >
                                    签名
                                </Button>
                            </React.Fragment>
                        )}
                        {/*  当前税款所属期=上月 显示【撤销统计】  */}
                        {isCurrentSkssq == 1 &&
                            isPrevMonth &&
                            totalSignInfo.totalSignState == 10 && (
                                <Button
                                    style={{ marginRight: "8px" }}
                                    onClick={this.statSign.bind(
                                        this,
                                        "cancelBooked"
                                    )}
                                    type="primary"
                                >
                                    取消预约
                                </Button>
                            )}
                        {isCurrentSkssq == 1 && isPrevMonth && isShowCalcelBtn && (
                            <Button
                                style={{ marginRight: "8px" }}
                                onClick={this.statSign.bind(this, "cancelSign")}
                                type="primary"
                            >
                                撤销统计
                            </Button>
                        )}
                        <Button
                            style={{ marginRight: "8px" }}
                            onClick={::this.printTable}
                        >
                            打印
                        </Button>
                    </div>
                </div>
                <VirtualTable
                    loading={loading}
                    title={showTitle ? tableTitle : undefined}
                    style={{ width: tableWidth + 5 + "px" }}
                    className={className}
                    bordered
                    dataSource={tableSource}
                    columns={tableCols}
                    scroll={scroll}
                    pagination={false}
                    rowKey="kjxh"
                    onRow={this.onRow}
                />
                {this.renderLinkModal()}
            </Layout>
        )
    }
}
