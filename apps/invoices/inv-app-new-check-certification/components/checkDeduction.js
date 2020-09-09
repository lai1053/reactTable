import React from "react"
import {
    Select,
    Button,
    Dropdown,
    Menu,
    Tooltip,
    VirtualTable,
    Pagination,
    Layout
} from "edf-component"
import moment from "moment"
// import { fromJS, toJS } from "immutable";
import { Spin, Radio, Icon } from "antd"
import FilterForm from "./filterForm"
// import Download from './Download'
import { throttle } from "edf-utils"
import { quantityFormat, addEvent, removeEvent } from "../../utils/index"
const { SubMenu } = Menu
const scrollBarWidth = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
    ? 18
    : /Edge\/(\S+)/.test(navigator.userAgent)
    ? 18
    : 12
class CheckComfirm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            localeValue: props.comfirmCheckValue
        }
    }
    onChange(e) {
        this.props.onChangeComfirmValue(e)
        this.setState({
            localeValue: e
        })
    }

    render() {
        const { localeValue } = this.state
        const { totalFpNum, totalJe, totalSe, totalYxse, checked } = this.props
        return (
            <div style={{ fontSize: "12px", lineHeight: "22px" }}>
                <div
                    style={{
                        fontSize: "16px",
                        color: "#5a5a5a",
                        marginBottom: "17px"
                    }}
                >
                    请确认是否提交
                </div>
                <div style={{ marginBottom: "8px" }}>
                    本次勾选的发票汇总如下：
                </div>
                <div className="inv-app-new-check-certification-modal1-content">
                    本次{checked == 1 ? "勾选" : "撤销"}：
                    <strong>{totalFpNum}</strong>份， 金额合计：
                    <strong>{totalJe.toFixed(2)}</strong>元， 税额合计：
                    <strong>{totalSe.toFixed(2)}</strong>元， 有效税额合计：
                    <strong>{totalYxse.toFixed(2)}</strong>元
                </div>
                {checked === 1 && (
                    <div
                        style={{
                            marginTop: "3px",
                            verticalAlign: "middle",
                            marginBottom: "8px"
                        }}
                    >
                        <span
                            style={{
                                display: "inline-block",
                                verticalAlign: "top",
                                marginTop: "3px"
                            }}
                        >
                            申报用途：
                        </span>
                        <Select
                            style={{ width: 200 }}
                            value={localeValue}
                            onChange={this.onChange.bind(this)}
                        >
                            <Select.Option key={1} value={1}>
                                抵扣
                            </Select.Option>
                            <Select.Option key={6} value={6}>
                                不抵扣
                            </Select.Option>
                        </Select>
                    </div>
                )}
            </div>
        )
    }
}

class ModifyPurpose extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            localeValue: 1
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }
    onOk = () => {
        return this.state.localeValue
    }

    onChange(e) {
        this.setState({
            localeValue: e
        })
    }
    render() {
        const { localeValue } = this.state
        const { totalFpNum } = this.props
        return (
            <div>
                <p
                    style={{
                        paddingTop: "20px",
                        marginBottom: "20px",
                        paddingLeft: "40px"
                    }}
                >
                    本次选中发票：{` ${totalFpNum} `}份
                </p>
                <div style={{ paddingBottom: "60px", paddingLeft: "40px" }}>
                    <span style={{ paddingLeft: "27px" }}>申报用途：</span>
                    <Select
                        style={{ width: 160 }}
                        value={localeValue}
                        onChange={this.onChange.bind(this)}
                    >
                        <Select.Option key={1} value={1}>
                            抵扣
                        </Select.Option>
                        <Select.Option key={6} value={6}>
                            不抵扣
                        </Select.Option>
                    </Select>
                </div>
            </div>
        )
    }
}
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
            title: "销方名称",
            dataIndex: "xfmc"
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
            title: "认证状态",
            dataIndex: "bdzt",
            minWidth: 100,
            width: 100,
            align: "center",
            render: text => {
                switch (String(text)) {
                    case "1":
                        return "已认证"
                    case "0":
                        return "未认证"
                    default:
                        return ""
                }
            }
        }
    ]
    return columns
}

export default class CheckDeduction extends React.Component {
    constructor(props) {
        super(props)
        const xfmcWidth =
            (
                document.querySelector(".edfx-app-portal-content-main") ||
                document.body
            ).offsetWidth - 958

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
            checked: 1,
            selectedRowKeys: [],
            tableSource: [],
            params: {
                xfmc: "",
                fpzlDm: null,
                fphm: "",
                sbPurpose: null,
                bdzt: null,
                date: null
            },
            selectAll: 0,
            pageSize: 50,
            currentPage: 1,
            totalCount: 0,
            totalFpNum: 0,
            totalJe: 0,
            totalSe: 0,
            totalYxse: 0,
            hasSignInProgressFp: 0,
            hasSignedFp: 0,
            comfirmCheckValue: 1,
            totalSignInfo: {},
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
        this.store = props.store
        this.scrollHeight = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
            ? 20
            : 12
        this.tableClass = "checkDeduction-" + new Date().valueOf()
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
    componentWillUnmount() {
        removeEvent(window, "resize", ::this.onResize)
    }
    async initPage() {
        const { skssq, nsrsbh } = this.props
        const { params, checked, pageSize, currentPage, selectAll } = this.state
        this.setState({
            loading: true
        })
        let obj = {
            entity: {
                nsrsbh: nsrsbh,
                skssq: skssq,
                xfmc: params.xfmc,
                fpzlDm: params.fpzlDm,
                fphm: params.fphm,
                sbPurpose: params.sbPurpose,
                bdzt: params.bdzt
            },
            gxListType: checked,
            selectAll: selectAll
        }
        //选择了日期就传
        if (params.date && params.date.length) {
            obj.kprqq = moment(params.date[0]).format("YYYY-MM-DD hh:mm:ss")
            obj.kprqz = moment(params.date[1]).format("YYYY-MM-DD hh:mm:ss")
        }
        //分页信息（是否全选标志为0，即不是全选的时候，必传；是否全选标志为1，即是全选的时候，不传）
        if (!selectAll) {
            obj.page = {
                currentPage: currentPage,
                pageSize: pageSize
            }
        }
        const res = await this.webapi.iancc.queryGxPageList(obj)
        const totalSignRes = await this.webapi.iancc.queryTotalSignStateAndSignFailInfo(
            { nsrsbh, skssq }
        )

        this.setState({
            selectedRowKeys: [],
            tableSource: res.list,
            totalFpNum: res.totalFpNum,
            totalJe: res.totalJe,
            totalSe: res.totalSe,
            totalYxse: res.totalYxse,
            loading: false,
            comfirmCheckValue: 1,
            totalSignInfo: totalSignRes || {}
        })
        if (res.page && res.page.totalCount) {
            this.setState({
                totalCount: res.page.totalCount
            })
        }
        return Promise.resolve(res)
    }
    download = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "下载发票",
            className: "inv-app-pu-collect-card-modal",
            width: 430,
            style: { top: 5 },
            bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
            children: this.metaAction.loadApp("inv-app-pu-collect-card", {
                store: this.store,
                data: {},
                nsqj: this.props.skssq
            })
        })
        if (ret.listNeedLoad) {
            this.initPage()
        }
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
    onCheckedChange(e) {
        const { params } = this.state
        this.setState(
            {
                checked: e.target.value
            },
            () => {
                this.initPage()
            }
        )
    }
    async comfirmCheck() {
        const { checked, selectedRowKeys, tableSource } = this.state
        if (selectedRowKeys.length == 0) {
            return this.metaAction.toast("error", "请选择数据")
        }
        let totalFpNum = 0
        let totalJe = 0
        let totalSe = 0
        let totalYxse = 0

        selectedRowKeys.forEach(e => {
            let index = tableSource.findIndex(f => e === f.kjxh)
            totalJe += tableSource[index].je
            totalSe += tableSource[index].se
            totalYxse += tableSource[index].yxse
            totalFpNum++
        })
        let res = await this.metaAction.modal("confirm", {
            style: { top: 5 },
            title: "请确认是否提交:",
            width: 480,
            okText: "确定",
            onOk: () => {
                this.check()
            },
            className: "inv-app-new-check-certification-modal1",
            content: (
                <CheckComfirm
                    totalFpNum={totalFpNum}
                    totalJe={totalJe}
                    totalSe={totalSe}
                    totalYxse={totalYxse}
                    checked={checked}
                    comfirmCheckValue={this.state.comfirmCheckValue}
                    onChangeComfirmValue={this.onChangeComfirmValue.bind(this)}
                ></CheckComfirm>
            )
        })
    }

    onChangeComfirmValue(value) {
        this.setState({
            comfirmCheckValue: value
        })
    }

    async check() {
        const {
            checked,
            selectedRowKeys,
            tableSource,
            comfirmCheckValue
        } = this.state
        const { skssq, nsrsbh } = this.props
        let obj = {
            nsrsbh: nsrsbh,
            skssq: skssq,
            detailList: selectedRowKeys.map(e => {
                let obj =
                    tableSource[
                        tableSource.findIndex(f => String(e) === String(f.kjxh))
                    ]
                return checked === 1
                    ? {
                          kjxh: obj.kjxh,
                          fpzlDm: obj.fpzlDm,
                          fphm: obj.fphm,
                          fpdm: obj.fpdm
                      }
                    : {
                          fpzlDm: obj.fpzlDm,
                          fphm: obj.fphm,
                          fpdm: obj.fpdm
                      }
            })
        }

        if (checked == 1) {
            obj.sbPurpose = comfirmCheckValue
            const res = await this.webapi.iancc.gxFp(obj)
            if (res === null) {
                this.metaAction.toast("success", "勾选成功!")
                this.initPage()
            }
        } else {
            const res = await this.webapi.iancc.cancelGxFp(obj)
            if (res === null) {
                this.metaAction.toast("success", "撤销成功!")
                this.initPage()
            }
        }
    }
    handleMenuClick(e) {
        switch (e.key) {
            case "download":
                this.download()
                break
            case "modify":
                this.modify()
                break
            case "zzszyfp":
                this.createInvoice("zzszyfp")
                break
            case "jdcxsfp":
                this.createInvoice("jdcxsfp")
                break
            case "dxffp":
                this.createInvoice("dxffp")
                break
        }
    }
    //新增发票
    async createInvoice(type) {
        const { skssq } = this.props
        if (type == "zzszyfp") {
            let res = await this.metaAction.modal("show", {
                title: "增值税专用发票(进项)—新增",
                width: 1000,
                okText: "保存",
                cancelText: "关闭",
                bodyStyle: { padding: "0px 0 12px 0" },
                children: this.metaAction.loadApp(
                    "inv-app-pu-vats-invoice-card",
                    {
                        store: this.store,
                        nsqj: skssq,
                        fromModule: "InvoiceAuthentication"
                    }
                )
            })
            if (res.listNeedLoad) {
                this.initPage()
            }
        } else if (type == "jdcxsfp") {
            let res = await this.metaAction.modal("show", {
                title: "机动车销售发票(进项)—新增",
                width: 1000,
                okText: "保存",
                cancelText: "关闭",
                bodyStyle: { padding: "0px 0 12px 0" },
                children: this.metaAction.loadApp(
                    "inv-app-pu-mvs-invoice-card",
                    {
                        store: this.store,
                        nsqj: skssq,
                        fromModule: "InvoiceAuthentication"
                    }
                )
            })
            if (res.listNeedLoad) {
                this.initPage()
            }
        } else if (type == "dxffp") {
            let res = await this.metaAction.modal("show", {
                title: "通行费发票(进项)—新增",
                width: 1000,
                okText: "保存",
                cancelText: "关闭",
                bodyStyle: { padding: "0px 0 12px 0" },
                children: this.metaAction.loadApp(
                    "inv-app-pu-toll-invoice-card",
                    {
                        store: this.store,
                        nsqj: skssq,
                        fromModule: "InvoiceAuthentication"
                    }
                )
            })
            if (res.listNeedLoad) {
                this.initPage()
            }
        }
    }

    async modify() {
        const { selectedRowKeys, tableSource } = this.state
        if (selectedRowKeys.length == 0) {
            return this.metaAction.toast("error", "请选择数据")
        }
        const { skssq, nsrsbh } = this.props
        let sbPurpose = await this.metaAction.modal("show", {
            title: "修改申报用途",
            width: "420px",
            style: { top: 5 },
            okText: "确定",
            wrapClassName: "bovms-batch-add-aid-subject",
            children: (
                <ModifyPurpose
                    totalFpNum={selectedRowKeys.length}
                ></ModifyPurpose>
            )
        })
        if (sbPurpose) {
            let obj = {
                nsrsbh: nsrsbh,
                skssq: skssq,
                sbPurpose: sbPurpose,
                detailList: selectedRowKeys.map(e => {
                    let obj =
                        tableSource[
                            tableSource.findIndex(
                                f => String(e) === String(f.kjxh)
                            )
                        ]
                    return {
                        fpzlDm: obj.fpzlDm,
                        fphm: obj.fphm,
                        fpdm: obj.fpdm
                    }
                })
            }
            const res = await this.webapi.iancc.batchUpdateSbPurpose(obj)
            if (res === null) {
                this.metaAction.toast("success", "修改成功!")
                this.initPage()
            }
        }
    }

    getTableWidth() {
        return this.state.tableCols
            .map(m => m.width || 0)
            .reduce((a, b) => a + b, 0)
    }
    onResize(e) {
        setTimeout(() => {
            const cn = `inv-app-new-check-certification-list`
            let table = document.getElementsByClassName(cn)[0]
            if (table) {
                let h = table.offsetHeight - 136, //头＋尾＋表头＋滚动条
                    w = table.offsetWidth,
                    width = this.getTableWidth() + 62,
                    scroll = { y: h, x: w > width ? w : width }
                if (w > width) {
                    const tableCols = this.state.tableCols,
                        item = tableCols.find(f => f.dataIndex === "xfmc")
                    item.width = w - 880 - 62
                    item.minWidth = w - 880 - 62
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
                const dom = document.querySelector(
                    `.${this.tableClass} .ant-table-body .virtual-grid-main-scrollbar`
                )
                if (dom) dom.style.opacity = 0
                const { selectedRowKeys, tableSource } = this.state
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
    componentDidUpdate(prevProps, prevState, snapshot) {
        const dom = document.querySelector(
            `.${this.tableClass} .ant-table-body .virtual-grid-main-scrollbar`
        )
        if (dom) {
            const tbBody = document.querySelector(
                    `.${this.tableClass} .ant-table-body`
                ),
                offsetLeft = tbBody.offsetWidth,
                left =
                    offsetLeft - scrollBarWidth + 1 + tbBody.scrollLeft + "px"
            dom.style.left = left
            dom.style.opacity = 1
        }
    }
    render() {
        const { skssq } = this.props
        const {
            loading,
            checked,
            tableSource,
            selectedRowKeys,
            scroll,
            totalSignInfo,
            tableCols
        } = this.state
        const className = `bovms-editable-table iancc-table bovms-common-table-style ${this.tableClass}`,
            sumTableWidth = this.getTableWidth() + 62,
            tableWidth =
                (
                    document.querySelector(".edfx-app-portal-content-main") ||
                    document.body
                ).offsetWidth - 16
        // const _columns = this.getColumns();
        if (scroll.x && tableWidth < scroll.x) {
            tableCols.forEach(o => {
                if (!o.width) o.width = scroll.x - 952
            })
        }
        if (sumTableWidth > tableWidth) {
            scroll.x = sumTableWidth
        }
        if (sumTableWidth < tableWidth || tableWidth > scroll.x) {
            scroll.x = tableWidth
        }
        let btnVisible =
            totalSignInfo.totalSignState == 1 ||
            totalSignInfo.totalSignState == 3 ||
            totalSignInfo.totalSignState == 7
        const menu = (
            <Menu onClick={this.handleMenuClick.bind(this)}>
                <SubMenu
                    key="add"
                    title={
                        <span>
                            <span>新增</span>
                        </span>
                    }
                >
                    <Menu.Item key="zzszyfp">增值税专用发票</Menu.Item>
                    <Menu.Item key="jdcxsfp">机动车销售发票</Menu.Item>
                    <Menu.Item key="dxffp">通行费发票</Menu.Item>
                </SubMenu>
                {btnVisible && checked === 2 && (
                    <Menu.Item key="modify">修改申报用途</Menu.Item>
                )}
            </Menu>
        )
        const rowSelection = {
            columnWidth: 62,
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: [
                {
                    key: "all-data",
                    text: "选择全部",
                    onSelect: async () => {
                        this.setState(
                            {
                                selectAll: 1
                            },
                            async () => {
                                let res = await this.initPage()
                                this.setState({
                                    selectedRowKeys: res.list.map(e => e.kjxh),
                                    selectAll: 0
                                })
                            }
                        )
                    }
                },
                {
                    key: "no-data",
                    text: "取消选择",
                    onSelect: () => {
                        this.setState(
                            {
                                selectedRowKeys: [],
                                selectAll: 0
                            },
                            () => {
                                this.initPage()
                            }
                        )
                    }
                }
            ]
        }
        return (
            <Layout className="inv-app-new-check-certification-list">
                <div className="inv-app-new-check-certification-checkdeduction-header">
                    <div className="inv-app-new-check-certification-checkdeduction-header-left">
                        <span>
                            <FilterForm
                                wrappedComponentRef={form => (this.form = form)}
                                onSearch={this.onSearch.bind(this)}
                                params={this.state.params}
                                hasState
                                checked={checked}
                            ></FilterForm>
                        </span>

                        <Radio.Group
                            onChange={::this.onCheckedChange}
                            value={checked}
                            style={{
                                paddingLeft: "24px",
                                paddingRight: "8px"
                            }}
                        >
                            <Radio value={1}>未勾选</Radio>
                            <Radio value={2}>已勾选</Radio>
                        </Radio.Group>
                        <span>税款所属期：{skssq}</span>
                        <span style={{ margin: "0 8px" }}>
                            {totalSignInfo.totalSignStateDesc && "｜"}
                        </span>
                        {totalSignInfo.totalSignState == 3 ||
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
                        )}
                    </div>
                    <div className="inv-app-new-check-certification-checkdeduction-header-right">
                        <Button
                            onClick={::this.download}
                            type="primary"
                            style={{ marginRight: "8px" }}
                        >
                            下载发票
                        </Button>
                        {btnVisible && (
                            <Button
                                style={{ marginRight: "8px" }}
                                onClick={this.comfirmCheck.bind(this)}
                                type="primary"
                            >
                                {checked == 1 ? "勾选" : "撤销勾选"}
                            </Button>
                        )}
                        <Dropdown overlay={menu} trigger={["click"]}>
                            <Button>
                                更多
                                <Icon type="down" />
                            </Button>
                        </Dropdown>
                    </div>
                </div>
                <VirtualTable
                    loading={loading}
                    style={{ width: tableWidth + 5 + "px" }}
                    rowSelection={rowSelection}
                    className={className}
                    bordered
                    dataSource={tableSource}
                    columns={tableCols}
                    scroll={scroll}
                    pagination={false}
                    rowKey="kjxh"
                    onRow={this.onRow}
                />
                {this.renderFooter()}
            </Layout>
        )
    }
}
