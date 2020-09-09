import React from "react"
import { Row, Col, Button, Spin, Popover, Form, Select, Icon } from "antd"
import { Input, DataGrid, TableSort } from "edf-component"
import { columnDataYiBan, columnDataXguiMo, columnData } from "./fixedData"
import renderDataGridCol from "../column/index"
import SimplePagination from "../SimplePagenation"
import { number } from "edf-utils"
import { quantityFormat } from "../../utils/index"

const formItemLayout = {
    labelCol: {
        xs: { span: 6 }
    },
    wrapperCol: {
        xs: { span: 18 }
    }
}

class PopoverFilter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props.params
        }
    }

    onOk = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                Object.keys(values).forEach(key => {
                    if (values.key === "null") {
                        values[key] = null
                    }
                })
                this.handleSearch(values)
            }
        })
    }

    handleSearch(values) {
        const { onFilter } = this.props
        setTimeout(() => {
            onFilter(values)
            this.props.close && this.props.close()
        }, 100)
    }

    reset = () => {
        const { form } = this.props
        if (form) {
            form.resetFields()
            const values = form.getFieldsValue()
            this.handleSearch(values)
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form
        let { fpzlDm, rzzt, minAmount, maxAmount } = this.state
        const { nsrxz, date } = this.props
        return (
            <Form className="ttk-filter-form-popover-content">
                <Form.Item label="发票类型:" {...formItemLayout}>
                    {getFieldDecorator("fpzlDm", {
                        initialValue: fpzlDm
                    })(
                        <Select style={{ width: "100%" }}>
                            <Select.Option key="null" value={null}>
                                全部
                            </Select.Option>
                            <Select.Option key="01" value="01">
                                增值税专票
                            </Select.Option>
                            <Select.Option key="03" value="03">
                                机动车发票
                            </Select.Option>
                            <Select.Option key="04" value="04">
                                增值税普票
                            </Select.Option>
                            <Select.Option key="12" value="12">
                                代扣代缴缴款书
                            </Select.Option>
                            <Select.Option key="13" value="13">
                                海关专用缴款书
                            </Select.Option>
                            <Select.Option key="14" value="14">
                                农产品发票
                            </Select.Option>
                            <Select.Option key="17" value="17">
                                通行费发票
                            </Select.Option>
                            {!nsrxz && (
                                <Select.Option key="18" value="18">
                                    旅客运输票
                                </Select.Option>
                            )}
                            <Select.Option key="07" value="07">
                                二手车发票
                            </Select.Option>
                            <Select.Option key="99" value="99">
                                其他票据
                            </Select.Option>
                        </Select>
                    )}
                </Form.Item>
                {nsrxz === false && (
                    <Form.Item label="认证状态:" {...formItemLayout}>
                        {getFieldDecorator("rzzt", {
                            initialValue: rzzt
                        })(
                            <Select style={{ width: "100%" }}>
                                <Select.Option key="null" value={null}>
                                    全部
                                </Select.Option>
                                <Select.Option key="1" value="1">
                                    已认证
                                </Select.Option>
                                <Select.Option key="0" value="0">
                                    未认证
                                </Select.Option>
                                <Select.Option key="2" value="2">
                                    待抵扣
                                </Select.Option>
                            </Select>
                        )}
                    </Form.Item>
                )}
                <Form.Item
                    label="价税合计"
                    style={{ marginBottom: 0 }}
                    {...formItemLayout}
                >
                    <Col span={11}>
                        <Form.Item>
                            {getFieldDecorator("minAmount", {
                                initialValue: minAmount
                            })(<Input.Number />)}
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <span
                            style={{
                                display: "inline-block",
                                width: "24px",
                                textAlign: "center"
                            }}
                        >
                            -
                        </span>
                    </Col>
                    <Col span={11}>
                        <Form.Item>
                            {getFieldDecorator("maxAmount", {
                                initialValue: maxAmount
                            })(<Input.Number min={minAmount} />)}
                        </Form.Item>
                    </Col>
                </Form.Item>
                <div className="footer">
                    <Button type="primary" onClick={this.onOk}>
                        查询
                    </Button>
                    <Button onClick={this.reset}>重置</Button>
                </div>
            </Form>
        )
    }
}

const PopoverFilterForm = Form.create({
    name: "bovms_guide_steptwo_popover_filter_form"
})(PopoverFilter)

class StepTwo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            invoiceNub: "", // 销方名称或者商品服务名称
            term: 1, // 已入账 未入账
            accountList: [], // 入账列表
            notAccountList: [], // 不入账列表
            inCompleteList: [], //问题项列表
            tableCheckbox: {
                //选择框的数据
                checkboxValue: [],
                selectedOption: []
            },
            selectedRowKeys: [],
            pagination: {
                // 分页
                currentPage: 1, // 当前页
                pageSize: 50, // 页设置
                totalCount: 50, // 总量
                totalPage: 1 //总页数
            },
            tableData: [], // 分页显示数据
            amountData: "", // 合计数据
            list: [], // 当前显示列表
            filterParams: {
                fpzlDm: null,
                rzzt: null,
                minAmount: "",
                maxAmount: ""
            },
            popVisible: false,
            sort: null
        }
    }
    componentDidMount() {
        this.purchaseTake()
    }
 
    handleSearch(values) {
        this.setState(
            {
                filterParams: values
            },
            () => {
                this.onPressEnter()
            }
        )
    }

    dataFilter(data) {
        let { fpzlDm, rzzt, minAmount, maxAmount } = this.state.filterParams
        minAmount = minAmount * 1
        maxAmount = maxAmount * 1
        let arr = [].concat(data)

        if (minAmount && maxAmount && maxAmount < minAmount) {
            this.props.metaAction.toast("error", "截至金额必须大于等于起始金额")
            return arr
        }
        if (fpzlDm) {
            arr = arr.filter(f => f.invKindCode === fpzlDm)
        }
        if (rzzt) {
            arr = arr.filter(f => f.rzzt === rzzt)
        }

        if (minAmount && maxAmount) {
            //价税合计最小及最大具已填写
            arr = arr.filter(
                f => minAmount <= f.amount && f.amount <= maxAmount
            )
        } else if (minAmount && !maxAmount) {
            //价税合计仅填最小
            arr = arr.filter(f => minAmount <= f.amount)
        } else if (!minAmount && maxAmount) {
            //价税合计仅填最大
            arr = arr.filter(f => f.amount <= maxAmount)
        }
        return arr
    }
    // 输入框查询
    onPressEnter = () => {
        const {
            invoiceNub,
            term,
            accountList,
            notAccountList,
            inCompleteList
        } = this.state
        let list = []
        let data = [accountList, notAccountList, inCompleteList][term - 1]
        let filterData = this.dataFilter(data)
        let keyword = this.ref ? this.ref.state.value : null
        filterData.map(item => {
            if (item.custName.includes(keyword) || item.invNo.includes(keyword)) {
                list.push(item)
            } else {
                item.detailList.some(dItem => {
                    if (
                        list.findIndex(f => f.kjxh === item.kjxh) == -1 &&
                        ((dItem.goodsName && dItem.goodsName.includes(keyword)) || (dItem.invNo && dItem.invNo.includes(keyword)))
                    ) {
                        list.push(item)
                    }
                })
            }
        })

        const { currentPage, pageSize } = this.state.pagination
        this.setState(
            {
                list,
                tableData: list
            },
            () => {
                this.pageChanged(currentPage, pageSize)
            }
        )
    }
    generatorRandomNum() {
        let s = []
        let hexDigits = "0123456789"
        for (let i = 0; i < 16; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
        }
        return parseInt(s.join(""))
    }
    async purchaseTake() {
        this.setState({
            loading: true
        })
        let res = await this.props.webapi.bovms.purchaseTake(this.props.params)
        let { accountList, notAccountList, inCompleteList, onlyPartialDataReturned } = res
        if(onlyPartialDataReturned) {
            this.props.metaAction.toast('warning', '发票数量过多，本次仅获取了部分发票，请完成本次取票流程后再次取票')
        }
        if (inCompleteList) {
            inCompleteList.map((item, index) => {
                item.key = this.generatorRandomNum()
            })
            this.setState({
                inCompleteList: inCompleteList
            })
        }
        if (accountList) {
            // 数据处理给每一条数据加一个key
            accountList.map((item, index) => {
                item.key = this.generatorRandomNum()
            })
            notAccountList.map((item, index) => {
                item.key = this.generatorRandomNum()
            })

            const { currentPage, pageSize } = this.state.pagination
            this.setState({
                accountList: accountList,
                notAccountList: notAccountList,
                list: accountList,
                tableData: accountList.slice(
                    (currentPage - 1) * pageSize,
                    currentPage * pageSize
                ),
                loading: false,
                resDate: res.yearPeriod,
                amountData: res
            })
        } else {
            let dom = document.getElementsByClassName("mk-nodata")[0]
            let tip = document.createElement("div")
            tip.style.lineHeight = "28px"
            tip.innerText = "可能是票据模块还未采集发票哦~"
            dom.appendChild(tip)
            this.setState({
                accountList: [],
                notAccountList: [],
                list: [],
                tableData: [],
                loading: false,
                resDate: res.yearPeriod,
                amountData: res
            })
        }
    }

    pageChanged = (current, pagSize) => {
        let { pagination, tableData, list } = this.state
        let { currentPage, pageSize, totalCount, totalPage } = pagination
        pageSize = pagSize || pageSize || 50 // 页大小
        totalCount = list.length || 0 //总计
        totalPage = Math.ceil(totalCount / pageSize) //总页数
        currentPage = current || 1 //当前页
        if (currentPage > totalPage) currentPage = totalPage
        tableData = list.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        ) // 列表数据
        pagination = { currentPage, pageSize, totalCount, totalPage }

        this.setState({
            pagination,
            tableData
        }),
            this.clearCheck()
    }

    // 合计
    renderFooterAmount = () => {
        let {
            amountData,
            term,
            accountList,
            notAccountList,
            tableData,
            invoiceNub,
            filterParams
        } = this.state
        let accountInvoiceNum = 0
        let accountTotalAmount = 0
        let nAccountTotalAmount = 0
        let accountTotalTaxAmount = 0
        let naccountTotalTaxAmount = 0
        let keyword = this.ref ? this.ref.state.value : null
        if (keyword || filterParams.fpzlDm || filterParams.rzzt || filterParams.maxAmount || filterParams.minAmount) {
            accountInvoiceNum = tableData.length
            tableData.forEach(e => {
                if (e.amount > 0) {
                    accountTotalAmount += e.amount
                } else {
                    nAccountTotalAmount += e.amount
                }
                accountTotalTaxAmount += e.taxAmount
            })
        } else {
            if (term == 1) {
                accountInvoiceNum = accountList.length
                accountList.forEach(e => {
                    if (e.amount > 0) {
                        accountTotalAmount += e.amount
                    } else {
                        nAccountTotalAmount += e.amount
                    }
                    if (e.taxAmount > 0) {
                        accountTotalTaxAmount += e.taxAmount ? e.taxAmount : 0
                    } else {
                        naccountTotalTaxAmount += e.taxAmount ? e.taxAmount : 0
                    }
                })
            } else {
                accountInvoiceNum = notAccountList.length
                notAccountList.forEach(e => {
                    if (e.amount > 0) {
                        accountTotalAmount += e.amount
                    } else {
                        nAccountTotalAmount += e.amount
                    }
                    if (e.taxAmount > 0) {
                        accountTotalTaxAmount += e.taxAmount ? e.taxAmount : 0
                    } else {
                        naccountTotalTaxAmount += e.taxAmount ? e.taxAmount : 0
                    }
                })
            }
        }

        let content = (
            <span className="footer-amount-item-span">
                <span className="count-item">合计 &nbsp;&nbsp;</span>
                <span className="count-item">
                    <span className="bold-text inv-number">
                        发票：<strong>{accountInvoiceNum}</strong>
                    </span>
                    张 &nbsp;&nbsp;
                </span>
                <span className="count-item">
                    <span className="bold-text inv-number">
                        价税合计：
                        <strong>
                            {accountTotalAmount != 0
                                ? quantityFormat(
                                    accountTotalAmount,
                                    2,
                                    false,
                                    false
                                ) + "(元)"
                                : ""}
                            {nAccountTotalAmount != 0
                                ? quantityFormat(
                                    nAccountTotalAmount,
                                    2,
                                    false,
                                    false
                                ) + "(元)"
                                : ""}
                            {accountTotalAmount == 0 &&
                                nAccountTotalAmount == 0 &&
                                "0.00(元)"}
                        </strong>
                    </span>{" "}
                    &nbsp;&nbsp;
                </span>
                <span className="count-item">
                    税额：
                    <strong>
                        {accountTotalTaxAmount != 0
                            ? quantityFormat(
                                accountTotalTaxAmount,
                                2,
                                false,
                                false
                            ) + "(元)"
                            : ""}
                        {naccountTotalTaxAmount != 0
                            ? quantityFormat(
                                naccountTotalTaxAmount,
                                2,
                                false,
                                false
                            ) + "(元)"
                            : ""}
                        {accountTotalTaxAmount == 0 &&
                            naccountTotalTaxAmount == 0 &&
                            "0.00(元)"}
                    </strong>
                </span>
            </span>
        )
        return (
            <Popover
                content={<div className="footer-amount">{content}</div>}
                overlayClassName="inv-tool-tip-normal tool-tip-footer-amount"
            >
                <div className="footer-amount  ellipsis-text">{content}</div>
            </Popover>
        )
    }

    async handleMenuClick(key, data, selectedRowKeys) {
        switch (key) {
            case "selectPage":
                this.setState({
                    selectedRowKeys: data.map(m => m.key)
                })
                return
            case "selectAll":
                let sourceData = [...this.state.list]
                this.setState({
                    selectedRowKeys: sourceData.map(e => e.key)
                })
                return
            case "cancelSelect":
                this.setState({
                    selectedRowKeys: []
                })
                return
        }
    }
    sortChange(e) {
        let { tableData } = this.state
        this.setState({
            sort: e
        })
        if (e === "asc") {
            tableData.sort((a, b) => (a.billDate > b.billDate ? 1 : -1))
        } else {
            tableData.sort((a, b) => (a.billDate < b.billDate ? 1 : -1))
        }
    }
    /*
     * 取票页面逻辑
     * */
    //表头渲染
    getColumns = () => {
        let nsrxz = this.props.nsrxz
        let { tableData, selectedRowKeys, term, sort } = this.state,
            dataSource = tableData,
            colOption = {
                dataSource,
                selectedRowKeys,
                width: 100,
                fixed: false,
                align: "center",
                className: "",
                flexGrow: 0,
                lineHeight: 37,
                isResizable: false,
                noShowDetailList: true
            }

        let columns =
            term === 3
                ? []
                : [
                    {
                        width: 60,
                        dataIndex: "key",
                        columnType: "allcheck",
                        onMenuClick: e =>
                            this.handleMenuClick(
                                e.key,
                                tableData,
                                selectedRowKeys
                            ),
                        onSelectChange: keys =>
                            this.setState({ selectedRowKeys: keys })
                    }
                ]
        columns =
            term === 3
                ? columns.concat(columnData)
                : nsrxz
                    ? columns.concat(columnDataXguiMo)
                    : columns.concat(columnDataYiBan)
        columns = columns
            .map((item, index) => {
                let obj = {
                    ...item,
                    render: (text, record) =>
                        this.renderColumnsDetail(text, record, item.dataIndex)
                }
                if (item.dataIndex === "billDate") {
                    obj.title = (
                        <TableSort
                            title="开票日期"
                            sortOrder={sort || null}
                            handleClick={e => this.sortChange(e)}
                        />
                    )
                }
                return obj
            })
            .map(m => renderDataGridCol({ ...colOption, ...m }))
        return columns
    }
    //表格明细渲染
    renderColumnsDetail = (text, row, type) => {
        if (type === "rzzt") {
            return row.rzzt === "0"
                ? "未认证"
                : row.rzzt === "1"
                    ? "已认证"
                    : row.rzzt === "2"
                        ? "待抵扣"
                        : "-"
        } else if (type === "billDate") {
            return row.billDate ? row.billDate.substring(0, 10) : ""
        } else if (type === "goodName") {
            if (row.detailList && Array.isArray(row.detailList)) {
                let dom = (
                    <div>
                        {row.detailList.map((e, i) => {
                            if (i < 6) {
                                return <div>{e.goodsName}</div>
                            }
                        })}{" "}
                        {row.detailList.length > 6 && <div>...</div>}
                    </div>
                )

                return (
                    <Popover placement="right" content={dom}>
                        <span
                            style={{
                                display: "inline-block",
                                width: "100%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}
                            title={text}
                        >
                            {text}
                        </span>
                    </Popover>
                )
            } else {
                return <span title={text}>{text}</span>
            }
        } else if (type === "amount") {
            return quantityFormat(text, 2, false, false)
        } else {
            return <span title={text}>{text}</span>
        }
    }
    // 列表切换
    query = val => {
        this.setState(
            {
                term: val
            },
            () => {
                this.form && this.form.reset && this.form.reset() //重置过滤表单的值
                let list = []
                if (this.state.term === 1) {
                    list = this.state.accountList
                } else if (this.state.term === 2) {
                    list = this.state.notAccountList
                } else {
                    list = this.state.inCompleteList
                }
                const { currentPage, pageSize } = this.state.pagination
                this.ref.state.value = ''
                this.setState(
                    {
                        invoiceNub: "",
                        list: list,
                        tableData: list.slice(
                            (currentPage - 1) * pageSize,
                            currentPage * pageSize
                        )
                    },
                    () => {
                        this.pageChanged(currentPage, pageSize)
                    }
                )
            }
        )
        this.clearCheck()
    }

    clearCheck = () => {
        this.setState({
            selectedRowKeys: []
        })
    }
    onRowClick = (e, index) => {
        let { tableData, selectedRowKeys } = this.state
        const columnKey = e && e.target && e.target.attributes["columnKey"]
        if (columnKey && columnKey.value) {
            let key = tableData[index]["key"]
            if (selectedRowKeys.includes(key)) {
                selectedRowKeys = selectedRowKeys.filter(f => f !== key)
            } else {
                selectedRowKeys.push(key)
            }
            this.setState({
                selectedRowKeys
            })
        }
    }
    handleInvoice = type => {
        let {
            accountList,
            notAccountList,
            list,
            tableData,
            selectedRowKeys
        } = this.state
        if (!selectedRowKeys.length) {
            const msg =
                type === "delete"
                    ? "请选择本期入账发票!"
                    : "请选择本期不入账发票"
            this.props.metaAction.toast("error", msg)
            return
        }
        selectedRowKeys.forEach(e => {
            if (type === "delete") {
                let dItem = notAccountList.find(f => f.key === e)
                accountList.push(dItem)
                notAccountList = notAccountList.filter(f => f.key != e)
                tableData = tableData.filter(f => f.key != e)
                list = list.filter(f => f.key != e)
            } else {
                let dItem = accountList.find(f => f.key === e)
                notAccountList.push(dItem)
                accountList = accountList.filter(f => f.key != e)
                tableData = tableData.filter(f => f.key != e)
                list = list.filter(f => f.key != e)
            }
        })
        const { currentPage, pageSize } = this.state.pagination
        this.setState(
            {
                tableData,
                list,
                accountList,
                notAccountList
            },
            () => {
                this.pageChanged(currentPage, pageSize)
            }
        )
    }
    hide = () => {
        this.setState({
            popVisible: false
        })
    }

    handlePopChange = visible => {
        this.setState({
            popVisible: visible
        })
    }

    // 保存入账数据
    purchaseTakeSave = async () => {
        this.setState({
            loading: true
        })
        let accountList = [...this.state.accountList]
        let mergaObj = {
            exTaxAmount: null,
            taxAmount: null,
            amount: null
        }
        let mergaDetailObj = {
            qty: null,
            unitPrice: null,
            exTaxAmount: null,
            taxRate: null,
            taxAmount: null,
            amount: null
        }
        accountList = accountList.map(e => {
            e.detailList = e.detailList.map(de =>
                Object.assign({}, mergaDetailObj, de)
            )
            return Object.assign({}, mergaObj, e)
        })

        let data = {
            yearPeriod: this.state.resDate,
            accountList: accountList
        }
        //传递参数到父页面请求
        this.props.onPurchaseTakeSave(data, this.state.resDate)
    }
    render() {
        const { nsrxz } = this.props
        const {
            invoiceNub,
            accountList,
            term,
            notAccountList,
            tableData,
            selectedRowKeys,
            loading,
            pagination,
            filterParams,
            inCompleteList
        } = this.state

        return (
            <div
                className="bovms-app-guidePage-range-step-two"
                style={{ paddingTop: "16px" }}
            >
                <div className="bovms-app-guidePage-popup-content">
                    <div class="ant-tabs-bar ant-tabs-top-bar">
                        <div class="ant-tabs-nav-container">
                            <div class="ant-tabs-nav">
                                <div
                                    class={
                                        term === 1
                                            ? "ant-tabs-tab-active ant-tabs-tab"
                                            : "ant-tabs-tab"
                                    }
                                    onClick={this.query.bind(this, 1)}
                                >
                                    本期入账({accountList.length})
                                </div>
                                <div
                                    class={
                                        term === 2
                                            ? "ant-tabs-tab-active ant-tabs-tab"
                                            : "ant-tabs-tab"
                                    }
                                    onClick={this.query.bind(this, 2)}
                                >
                                    待选择({notAccountList.length})
                                </div>
                                {inCompleteList.length != 0 && (
                                    <div
                                        class={
                                            term === 3
                                                ? "ant-tabs-tab-active ant-tabs-tab"
                                                : "ant-tabs-tab"
                                        }
                                        onClick={this.query.bind(this, 3)}
                                    >
                                        问题票({inCompleteList.length})
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Spin
                        spinning={loading}
                        delay={1}
                        wrapperClassName="spin-box"
                        size="large"
                        tip="数据加载中"
                    >
                        <div className="bovms-app-guidePage-range-step-two-filter">
                            <div className="bovms-common-actions-header">
                                <Input
                                    placeholder="销方名称、货品名称或发票号码"
                                    style={{
                                        width: "250px",
                                        marginRight: "4px"
                                    }}
                                    ref={ref => this.ref = ref}
                                    // value={invoiceNub}
                                    // onChange={this.inputOnChange}
                                    onPressEnter={this.onPressEnter}
                                    prefix={<Icon type="search" />}
                                />
                                {term != 3 && (
                                    <Popover
                                        overlayClassName="ttk-filter-form-popover"
                                        getPopupContainer={trigger =>
                                            trigger.parentNode
                                        }
                                        content={
                                            <PopoverFilterForm
                                                wrappedComponentRef={form =>
                                                    (this.form = form)
                                                }
                                                params={filterParams}
                                                nsrxz={nsrxz}
                                                onFilter={this.handleSearch.bind(
                                                    this
                                                )}
                                                close={this.hide}
                                            />
                                        }
                                        placement="bottom"
                                        trigger="click"
                                        visible={this.state.popVisible}
                                        onVisibleChange={this.handlePopChange}
                                    >
                                        <Button icon="filter" />
                                    </Popover>
                                )}
                            </div>
                            <span style={{ float: "right" }}>
                                {term === 1 && (
                                    <Button
                                        type="primary"
                                        onClick={this.handleInvoice.bind(
                                            this,
                                            "add"
                                        )}
                                    >
                                        本期不入账
                                    </Button>
                                )}
                                {term === 2 && (
                                    <Button
                                        type="primary"
                                        onClick={this.handleInvoice.bind(
                                            this,
                                            "delete"
                                        )}
                                    >
                                        本期入账
                                    </Button>
                                )}
                            </span>
                        </div>
                        <div style={{ marginTop: "8px" }}>
                            <DataGrid
                                className="bovms-common-table-style"
                                headerHeight={37}
                                rowHeight={37}
                                footerHeight={0}
                                rowsCount={(tableData || []).length}
                                onRowClick={this.onRowClick.bind(this)}
                                columns={this.getColumns()}
                                style={{ width: "100%", height: "350px" }}
                                ellipsis
                            />

                            <Row className="bovms-common-table-style-footer">
                                <Col span="15">
                                    {term != 3 ? (
                                        <span>{this.renderFooterAmount()}</span>
                                    ) : (
                                            <span className="footer-amount-item-span">
                                                <span className="count-item">
                                                    合计 &nbsp;&nbsp;
                                            </span>
                                                <span className="count-item">
                                                    <span className="bold-text inv-number">
                                                        发票：
                                                    <strong>
                                                            {inCompleteList.length}
                                                        </strong>
                                                    </span>
                                                张 &nbsp;&nbsp;
                                            </span>
                                            </span>
                                        )}
                                </Col>
                                <Col span="9">
                                    <SimplePagination
                                        showSizeChanger
                                        showQuickJumper
                                        pageSize={pagination.pageSize}
                                        pageSizeOptions={[
                                            "50",
                                            "100",
                                            "200",
                                            "300"
                                        ]}
                                        current={pagination.currentPage}
                                        style={{ textAlign: "right" }}
                                        total={this.state.list.length}
                                        onChange={this.pageChanged.bind(this)}
                                        onShowSizeChange={this.pageChanged.bind(
                                            this
                                        )}
                                        showTotal={total => `共${total}条记录`}
                                    ></SimplePagination>
                                </Col>
                            </Row>
                        </div>
                    </Spin>
                </div>
                <div className="bovms-app-actions-footer">
                    <div class="bovms-app-actions-footer-tip">
                        {term === 1 && (
                            <p>
                                <span>温馨提示：</span>
                                请将需入账的发票生成为单据
                            </p>
                        )}
                        {term === 2 && (
                            <p>
                                <span>温馨提示：</span>
                                选择需入账的发票，将其移入【本期入账】列表中
                            </p>
                        )}
                        {term === 3 && (
                            <p>
                                <span>温馨提示：</span>
                                问题票不能生成单据，请按原因在发票模块补充数据或者重新采集
                            </p>
                        )}
                    </div>
                    <div>
                        <Button onClick={this.props.onPrev}> 上一步</Button>
                        {accountList.length !== 0 && term === 1 && (
                            <Button
                                type="primary"
                                onClick={this.purchaseTakeSave}
                                loading={loading}
                            >
                                生成单据
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                this.props.onCancel()
                            }}
                        >
                            取消
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default StepTwo
