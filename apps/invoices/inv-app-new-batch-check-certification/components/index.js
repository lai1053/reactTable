import React from "react"
import { Button, Pagination, Layout, Icon, VirtualTable } from "edf-component"
import moment from "moment"
import { Radio, Modal, Tooltip, Divider } from "antd"
import FilterForm from "./filterForm"
import {
    quantityFormat,
    flatCols,
    addEvent,
    removeEvent
} from "../../utils/index"
import videoImg from "../img/video.png"

export default class InvAppNewBatchCheckCertificationIndex extends React.Component {
    constructor(props) {
        super(props)
        this.webapi = props.webapi
        this.component = props.component
        this.metaAction = props.metaAction || {}
        this.state = {
            scroll: { x: document.body.offsetWidth }
        }
        this.videoId = `inv-batch-check-certification-video-object`
        this.getFullScreenChangeName()
        this.scrollHeight = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
            ? 20
            : 12
    }

    getTableWidth() {
        return flatCols(this.getColumns())
            .map(m => m.width || 0)
            .reduce((a, b) => a + b, 0)
    }

    onResize(e) {
        setTimeout(() => {
            const cn = `inv-app-new-batch-check-certification-list`
            let table = document.getElementsByClassName(cn)[0]
            if (table) {
                let h = table.offsetHeight - 180 - this.scrollHeight, //头＋尾＋表头＋滚动条
                    // w = table.offsetWidth,
                    width = this.getTableWidth() + 100 + 62,
                    scroll = { y: h, x: width }

                this.setState({ scroll: scroll })
            } else {
                setTimeout(() => {
                    this.onResize()
                }, 100)
                return
            }
        }, 100)
    }

    componentDidMount() {
        // this.initPage()
        this.onResize()
        addEvent(window, "resize", ::this.onResize)
        addEvent(
            document.body,
            this.fullScreenChangeName,
            ::this.onFullScreenChange
        )
    }

    componentWillUnmount() {
        removeEvent(window, "resize", ::this.onResize)
        removeEvent(
            document.body,
            this.fullScreenChangeName,
            ::this.onFullScreenChange
        )
    }

    onCheckedChange(e) {
        let val = {
            checked: e.target.value,
            params: {
                ...this.state.defaultParams
            }
        }
        // 不是全部，连接状态默认不传
        if (e.target.value !== null) {
            val.params.clientState = 4
            val.params.totalSignState = null
        }
        this.setState(
            {
                ...val
            },
            () => {
                this.initPage()
            }
        )
    }

    // 检测table被点击行的selectedRowKeys数组
    onSelectChange = arr => {
        this.setState({
            selectedRowKeys: arr
        })
    }

    // 批量预约签名;批量签名
    batchSubmit = async type => {
        const { selectedRowKeys, tableSource } = this.state,
            unLinkList = [],
            arr = selectedRowKeys.map(e => {
                let obj = tableSource.find(f => String(e) === String(f.qyId))
                if (type === "batchStatistics" && obj.clientState === 2)
                    unLinkList.push(obj.customerName)
                return {
                    skssq: obj.skssq,
                    qyId: obj.qyId,
                    nsrsbh: obj.nsrsbh,
                    xzqhdm: obj.xzqhdm
                }
            })
        if (arr.length > 0) {
            this.setState({
                bsModalShow: true,
                batchNum: arr.length || 0,
                submitList: arr,
                submitType: type,
                unLinkList
            })
        } else {
            this.metaAction.modal("warning", {
                width: "380px",
                className: "inv-app-new-batch-check-certification-warn-modal",
                okText: "确定",
                content: (
                    <div
                        style={{
                            fontSize: "14px",
                            lineHeight: "22px",
                            marginTop: "-8px"
                        }}
                    >
                        请至少选择一个客户
                    </div>
                )
            })
        }
    }

    // 取消预约－单户
    cancelBooked = async record => {
        const res = await this.webapi.ianbcc.cancelBookedSignRequestFromBatch({
            skssq: record.skssq,
            nsrsbh: record.nsrsbh,
            qyId: record.qyId,
            isReturnValue: true
        })
        if (res && !res.result && res.error && res.error.message) {
            this.metaAction.toast("error", res.error.message)
        } else {
            this.metaAction.toast("success", "取消成功")
            this.initPage()
        }
    }
    // 批量签名、预约签名，确认并提交
    async handleBsOk() {
        const { submitList, submitType } = this.state,
            apiFn =
                submitType === "batchBooked"
                    ? "batchSubmitBookedSignRequest"
                    : "batchSubmitSignRequest"
        this.setState({
            bsModalShow: false,
            linkModalShow: true
        })
        const res = await this.webapi.ianbcc[apiFn](submitList)
        res === null &&
            this.setState(
                {
                    linkModalShow: false
                },
                () => {
                    this.initPage()
                }
            )
    }

    handleBsCancel = () => {
        this.setState({
            bsModalShow: false
        })
    }

    handlelinkModalCancel = () => {
        this.setState({
            linkModalShow: false
        })
    }

    renderBsModal = () => {
        const { bsModalShow, batchNum, submitType, unLinkList } = this.state
        if (unLinkList && unLinkList.length > 0) {
            return (
                <Modal
                    title="批量签名"
                    className="inv-app-new-batch-check-certification-modal"
                    visible={bsModalShow}
                    okText="继续签名"
                    onOk={::this.handleBsOk}
                    onCancel={this.handleBsCancel}
                >
                    <div
                        style={{
                            paddingTop: "20px",
                            marginBottom: "20px",
                            fontSize: "14px"
                        }}
                    >
                        <span>已选</span>
                        <span style={{ color: "#f17712" }}>{batchNum}</span>
                        <span>户，有</span>
                        <span style={{ color: "#f00" }}>
                            {unLinkList.length}
                        </span>
                        <span>户不支持批量签名</span>
                    </div>

                    <div style={{ paddingBottom: "80px", fontSize: "12px" }}>
                        <div style={{ color: "#f00" }}>不支持原因：</div>
                        <div>
                            {unLinkList.map(
                                m =>
                                    `${m}：发票管理工具未连接，连接后再操作，或选择【批量预约签名】`
                            )}
                        </div>
                    </div>
                </Modal>
            )
        }
        return (
            <Modal
                title={
                    submitType === "batchBooked" ? "批量预约签名" : "批量签名"
                }
                className="inv-app-new-batch-check-certification-modal"
                visible={bsModalShow}
                onOk={::this.handleBsOk}
                onCancel={this.handleBsCancel}
            >
                <div
                    style={{
                        paddingTop: "20px",
                        marginBottom: "20px",
                        fontSize: "14px"
                    }}
                >
                    <span>请确认将这</span>
                    <span style={{ color: "#f17712" }}>{batchNum}</span>
                    <span>
                        户提交{submitType === "batchBooked" ? "预约" : ""}签名？
                    </span>
                </div>
                {submitType !== "batchBooked" && (
                    <div style={{ paddingBottom: "80px", fontSize: "12px" }}>
                        <span style={{ color: "#f17712" }}>温馨提示：</span>
                        <span style={{ color: "#a8a8a8" }}>
                            签名是将待认证发票，发送至发票综合服务平台，一键完成勾选、统计、签名！
                        </span>
                    </div>
                )}
            </Modal>
        )
    }

    renderLinkModal = () => {
        const { linkModalShow, submitType } = this.state,
            content =
                submitType === "batchBooked"
                    ? "预约签名提交后，发票管理工具已连接，会自动签名！"
                    : "签名，预计需要10分钟左右时间，请保持发票管理工具已连接状态！"
        return (
            <div>
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
                            <strong>
                                {submitType === "batchBooked" ? "预约" : ""}
                                签名提交中
                            </strong>
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
                                {content}
                            </div>
                        </div>
                        <div className="inv-app-new-batch-check-certification-link-modal-loading"></div>
                    </div>
                </Modal>
            </div>
        )
    }

    // 条件搜索
    onSearch(values) {
        this.setState(
            {
                params: values
            },
            () => {
                this.initPage()
            }
        )
    }

    // 点击表格的行
    onRow = record => {
        return {
            onClick: () => {
                const { selectedRowKeys } = this.state
                const index = selectedRowKeys.findIndex(
                    f => String(f) === String(record.qyId)
                )
                if (index > -1) {
                    selectedRowKeys.splice(index, 1)
                } else {
                    selectedRowKeys.push(record.qyId)
                }
                this.setState({
                    selectedRowKeys
                })
            }
        }
    }

    getColumns() {
        let columns = [
            {
                title: "客户名称",
                dataIndex: "customerName"
                // width: 200,
            },
            {
                title: "助记码",
                dataIndex: "memCode",
                width: 100
            },
            {
                title: "税款所属期",
                dataIndex: "skssq",
                width: 85,
                align: "center"
            },
            {
                title: "发票管理工具",
                dataIndex: "clientStateDesc",
                width: 95,
                align: "center"
            },
            {
                title: "抵扣",
                dataIndex: "dk",
                width: 260,
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
                width: 200,
                render: (text, record) => {
                    const { checked } = this.state
                    // 全部页签，状态＝预约中
                    if (checked === null && record.totalSignState === 10) {
                        return (
                            <React.Fragment>
                                <a
                                    onClick={this.cancelBooked.bind(
                                        this,
                                        record
                                    )}
                                >
                                    取消预约
                                </a>
                                <Divider type="vertical" />
                                <a
                                    onClick={this.gotoGouXuan.bind(
                                        this,
                                        record
                                    )}
                                >
                                    勾选认证
                                </a>
                            </React.Fragment>
                        )
                    }
                    return (
                        <a onClick={this.gotoGouXuan.bind(this, record)}>
                            勾选认证
                        </a>
                    )
                }
            }
        ]
        return columns
    }

    // 跳转到勾选页面
    gotoGouXuan(record) {
        let appName = "inv-app-new-check-certification",
            title = "勾选认证",
            params = {}
        if (this.component.props.setGlobalContentWithDanhuMenu) {
            this.component.props.setGlobalContentWithDanhuMenu({
                pageName: record.customerName,
                name: "勾选认证2.0",
                appName: appName,
                params,
                orgId: record.qyId
                // showHeader: true,
            })
        } else if (this.component.props.setGlobalContent) {
            this.component.props.setGlobalContent({
                name: "勾选认证2.0",
                appName: appName,
                params,
                orgId: record.qyId
                // showHeader: true,
            })
        } else if (this.component.props.openDanhu) {
            this.component.props.openDanhu(record.qyId, appName, title)
        } else if (this.component.props.onRedirect) {
            this.component.props.onRedirect({ appName })
        } else {
            this.metaAction.toast("error", "进入方式不对")
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

    renderFooter = () => {
        const { pageSize, currentPage, totalCount } = this.state
        return (
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
    async openHelp() {
        const ret = await this.metaAction.modal("show", {
            title: "",
            className: "ttk-edf-app-help-modal-content",
            wrapClassName: "ttk-edf-app-help-modal",
            footer: null,
            width: 840, //静态页面宽度840小于会有横向滚动条
            children: this.metaAction.loadApp("ttk-edf-app-help", {
                store: this.component.props.store,
                code: "inv-app-check-certification-list-3" // 查询页面对应参数
            })
        })
    }
    getFullScreenChangeName() {
        let name = "fullscreenchange"
        if (document.body.webkitRequestFullscreen) name = "webkit" + name
        if (document.body.mozRequestFullScreen) name = "moz" + name
        if (document.body.msRequestFullscreen) name = "ms" + name
        this.fullScreenChangeName = name
    }
    onFullScreenChange() {
        const fullscreenElement =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullscreenElement ||
            document.msFullscreenElement
        if (fullscreenElement) {
            fullscreenElement.width = window.screen.availWidth
            fullscreenElement.height = window.screen.availHeight
        } else {
            const element = document.getElementById(this.videoId)
            element.width = "100%"
            element.height = "600px"
        }
    }
    isFullscreenEnabled() {
        var requestFullscreen =
            document.body.requestFullscreen ||
            document.body.webkitRequestFullscreen ||
            document.body.mozRequestFullScreen ||
            document.body.msRequestFullscreen
        var fullscreenEnabled =
            document.fullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.msFullscreenEnabled
        return !!(requestFullscreen && fullscreenEnabled)
    }
    openFullscreen() {
        const element = document.getElementById(this.videoId)
        if (!element) return
        if (element.requestFullscreen) {
            element.requestFullscreen()
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen()
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen()
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullScreen()
        }
    }
    async toVideo() {
        const ret = await this.metaAction.modal("show", {
            title: (
                <div>
                    操作视频
                    {this.isFullscreenEnabled() ? (
                        <a
                            style={{ marginLeft: "20px" }}
                            onClick={::this.openFullscreen}
                        >
                            全屏播放
                        </a>
                    ) : null}
                </div>
            ),
            style: { top: 5 },
            bodyStyle: { padding: "0" },
            footer: null,
            width: 1024,
            children: (
                <object>
                    <embed
                        id={this.videoId}
                        className="inv-batch-check-certification-video-embed"
                        allowFullScreen
                        webkitAllowFullScreen={true}
                        width="100%"
                        height="600px"
                        src="//player.polyv.net/videos/player.swf?vid=52245012735a8893e6837c2e7be69a0d_5"
                        controls="controls"
                    ></embed>
                </object>
            )
        })
    }
    render() {
        const {
                loading,
                checked,
                tableSource,
                selectedRowKeys,
                scroll,
                skssq,
                params
            } = this.state,
            rowSelection = {
                columnWidth: 62,
                selectedRowKeys,
                onChange: this.onSelectChange,
                hideDefaultSelections: true
            },
            className = `bovms-editable-table ianbcc-table bovms-common-table-style`,
            _columns = this.getColumns(),
            tableWidth = document.body.offsetWidth
        if (scroll.x && tableWidth < scroll.x) {
            _columns.forEach(o => {
                if (!o.width) o.width = 100
            })
        }

        return (
            <Layout className="inv-app-new-batch-check-certification-list">
                <div className="inv-app-new-batch-check-certification-header">
                    <div className="inv-app-new-batch-check-certification-header-left">
                        <div
                            style={{
                                display: "inline-block",
                                verticalAlign: "middle"
                            }}
                        >
                            <FilterForm
                                wrappedComponentRef={form => (this.form = form)}
                                onSearch={::this.onSearch}
                                params={params}
                                checked={checked}
                                key={
                                    "filter-form-" + checked === null
                                        ? 3
                                        : checked
                                }
                            ></FilterForm>
                        </div>
                        <Radio.Group
                            onChange={::this.onCheckedChange}
                            value={checked}
                            style={{
                                paddingLeft: "24px",
                                paddingRight: "8px",
                                verticalAlign: "middle"
                            }}
                        >
                            <Radio value={null}>全部</Radio>
                            <Radio value={1}>可签名</Radio>
                        </Radio.Group>
                        <div
                            style={{
                                display: "none",
                                verticalAlign: "middle"
                            }}
                        >
                            税款所属期：{skssq}
                        </div>
                    </div>
                    <div className="inv-app-new-batch-check-certification-header-right">
                        {checked === null ? (
                            <React.Fragment>
                                <Icon
                                    type="question-circle"
                                    theme="filled"
                                    style={{
                                        color: "#fe9400",
                                        fontSize: "16px",
                                        cursor: "pointer"
                                    }}
                                    onClick={::this.openHelp}
                                />
                                <Divider type="vertical" />
                                <a onClick={::this.toVideo}>
                                    <img
                                        src={videoImg}
                                        style={{
                                            marginRight: "4px"
                                        }}
                                    />
                                    操作视频
                                </a>
                                <Divider type="vertical" />
                                <a
                                    href="http://download.etaxcn.com/ycs/plugin/XdzInvoAuthSetup.exe"
                                    download="发票管理工具.exe"
                                >
                                    下载发票管理工具
                                </a>
                            </React.Fragment>
                        ) : (
                            ""
                        )}

                        {Number(checked) ? (
                            <React.Fragment>
                                <Button
                                    type="primary"
                                    onClick={() =>
                                        this.batchSubmit("batchBooked")
                                    }
                                >
                                    批量预约签名
                                </Button>
                                <Divider type="vertical" />
                                <Button
                                    type="primary"
                                    onClick={() =>
                                        this.batchSubmit("batchStatistics")
                                    }
                                >
                                    批量签名
                                </Button>
                            </React.Fragment>
                        ) : (
                            ""
                        )}
                    </div>
                </div>
                <VirtualTable
                    loading={loading}
                    style={{ width: tableWidth + "px" }}
                    rowSelection={rowSelection}
                    className={className}
                    bordered
                    dataSource={tableSource}
                    columns={_columns}
                    scroll={scroll}
                    pagination={false}
                    rowKey="qyId"
                    onRow={this.onRow}
                />
                {this.renderFooter()}

                {this.renderBsModal()}
                {this.renderLinkModal()}
            </Layout>
        )
    }
}
