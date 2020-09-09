import React from "react"
import {
    columnDataPurchase,
    columnDataPurchaseXgm,
    columnDataSale
} from "./fixedData"
import { Radio, DatePicker, Button, Col, Form, Select, Popover } from "antd"
import { Pagination, Input, DataGrid } from "edf-component"
import renderDataGridCol from "../column/index"
import moment from "moment/moment"

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
        let {
            fpzlDm,
            isProduce,
            minAmount,
            maxAmount,
            type,
            nsrxz
        } = this.state
        return (
            <Form className="ttk-filter-form-popover-content">
                {type === "进项" && (
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
                                {nsrxz === 2000010001 && (
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
                )}
                {type === "销项" && (
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
                                <Select.Option key="07" value="07">
                                    二手车发票
                                </Select.Option>
                                <Select.Option key="05" value="05">
                                    普通机打发票
                                </Select.Option>
                                <Select.Option key="08" value="08">
                                    纳税检查调整
                                </Select.Option>
                                <Select.Option key="09" value="09">
                                    未开具发票
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

                <Form.Item label="已生成单据:" {...formItemLayout}>
                    {getFieldDecorator("isProduce", {
                        initialValue: isProduce
                    })(
                        <Select style={{ width: "100%" }}>
                            <Select.Option key="null" value={null}>
                                全部
                            </Select.Option>
                            <Select.Option key="true" value={true}>
                                已生成
                            </Select.Option>
                            <Select.Option key="false" value={false}>
                                未生成
                            </Select.Option>
                        </Select>
                    )}
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

class chaPiao extends React.Component {
    constructor(props) {
        super(props)
        let { nsrxz, nsqj, stock, type } = props
        this.state = {
            yearPeriod:
                moment(nsqj)
                    .subtract(0, "month")
                    .format("YYYYMM") || "201908",
            stock: stock, // 是否启用存货
            type: type || "进项", // 进项或者销项
            nsrxz: nsrxz === 2000010001 ? "一般纳税人" : "小规模", // 纳税人性质
            kpyf: nsqj || "201908", // 开票月份
            dkyf: this.props.dkyf, // 抵扣月份
            date: "", // 开票月份
            deductionMonth: "", //抵扣月份
            term: 1, // 单选框的值
            invoiceNub: "", //发票号码
            yearPeriodRes: "", // 后台返回会计区间
            orgId: "", // 后台返回机构ID
            pagination: {
                // 分页数据
                currentPage: 1,
                pageSize: 50,
                totalCount: 50,
                totalPage: 1
            },
            list: [], // 源数据
            tableData: [], //表格数据
            selectedRowKeys: [], //
            loading: false,
            keyword: "",
            popVisible: false,
            filterParams: {
                fpzlDm: null,
                isProduce: null,
                minAmount: "",
                maxAmount: "",
                type,
                nsrxz
            },
            sourceData: []
        }
        this.closArr = [] // 关闭时要发送的数组

        // this.dataGridKey = `fund-datagrid-${new Date().valueOf()}`;
    }
    // 单选查询
    query = e => {
        if (e.target.value == 1) {
            this.setState({
                term: e.target.value,
                date: "",
                deductionMonth: ""
            })
        } else if (e.target.value == 2) {
            this.setState({
                term: e.target.value,
                date: moment().subtract(1, "month"),
                deductionMonth: ""
            })
        } else {
            this.setState({
                term: e.target.value,
                date: "",
                deductionMonth: moment().subtract(1, "month")
            })
        }

        if (this.state.invoiceNub) {
            this.setState({
                invoiceNub: undefined
            })
        }
    }
    async handleMenuClick(key, data, selectedRowKeys) {
        switch (key) {
            case "selectPage":
                selectedRowKeys = data
                    .filter(e => !this.condition(e))
                    .map(m => m.kjxh)
                this.setState({ selectedRowKeys })
                return
            case "selectAll":
                let sourceData = [...this.state.list]
                this.setState({
                    selectedRowKeys: sourceData
                        .filter(e => !this.condition(e))
                        .map(e => e.kjxh)
                })
                return
            case "cancelSelect":
                this.setState({
                    selectedRowKeys: []
                })
                return
        }
    }

    // 表头渲染
    getColumns = () => {
        let { type, nsrxz, tableData, selectedRowKeys } = this.state,
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
        let columns = [
            {
                width: 60,
                dataIndex: "kjxh",
                columnType: "allcheck",
                onMenuClick: e =>
                    this.handleMenuClick(e.key, tableData, selectedRowKeys),
                onSelectChange: keys =>
                    this.setState({ selectedRowKeys: keys }),
                getCheckboxProps: (text, record, index) =>
                    this.condition(record),
                descMark: "mark"
            }
        ]
        if (type === "销项") columns = columns.concat(columnDataSale)
        if (type === "进项" && nsrxz === "小规模")
            columns = columns.concat(columnDataPurchaseXgm)
        if (type === "进项" && nsrxz === "一般纳税人")
            columns = columns.concat(columnDataPurchase)
        columns = columns
            .map((item, index) => {
                return {
                    ...item,
                    render: (text, record) =>
                        this.renderColumnsDetail(text, record, item.dataIndex)
                }
            })
            .map(m => renderDataGridCol({ ...colOption, ...m }))

        return columns
    }
    //表格明细渲染
    renderColumnsDetail = (text, row, type) => {
        if (type === "rzzt") {
            return row.rzzt == 0
                ? "未认证"
                : row.rzzt == 1
                    ? "已认证"
                    : row.rzzt == 2
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
                    <Popover placement="left" content={dom}>
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
                return text
            }
        } else if (type === "accountDesc") {
            if (
                text === "未入账" ||
                text === "已在本月生成了单据" ||
                text === "开票月份大于当前会计期间"
            ) {
                return (
                    <Popover placement="left" content={text}>
                        {text}
                    </Popover>
                )
            } else {
                return (
                    <Popover placement="left" content={text}>
                        <span>
                            <a
                                href="javascript:void(0)"
                                onClick={() => {
                                    this.credentials(row)
                                }}
                            >
                                {text}
                            </a>
                        </span>
                    </Popover>
                )
            }
        } else if (type == "amount") {
            return text.toFixed(2)
        } else {
            return text
        }
    }
    // 凭证查看
    credentials = async row => {
        const { vchId } = row
        if (!vchId) {
            return
        }
        const { store } = this.props
        const ret = await this.props.metaAction.modal("show", {
            title: "查看凭证",
            style: { top: 25 },
            width: 1200,
            bodyStyle: { paddingBottom: "0px" },
            className: "batchCopyDoc-modal",
            okText: "保存",
            children: this.props.metaAction.loadApp("app-proof-of-charge", {
                store: store,
                initData: {
                    type: "isFromXdz",
                    id: vchId
                }
            })
        })
    }

    clearCheck = () => {
        this.setState({
            selectedRowKeys: []
        })
    }
    // 日期
    onChdataChange = (date, month) => {
        if (this.state.term === 2) {
            this.setState({
                date: date
            })
        } else {
            this.setState({
                deductionMonth: date
            })
        }
    }
    // 输入框
    inputOnChange = val => {
        this.setState({
            keyword: val.target.value
        })
    }

    onChange = val => {
        this.setState({
            invoiceNub: val.target.value
        })
    }

    //查询
    filterList = async () => {
        let { invoiceNub, date, deductionMonth, term } = this.state
        date = moment(date)
            .startOf("month")
            .format("YYYYMM")
        deductionMonth = moment(deductionMonth)
            .startOf("month")
            .format("YYYYMM")
        let aa = {
            yearPeriod: this.state.yearPeriod || "201907",
            fphm: "",
            kpyf: "",
            dkyf: ""
        }
        if (term === 1) {
            if (
                !invoiceNub ||
                invoiceNub.length < 8 ||
                parseFloat(invoiceNub).toString() == "NaN"
            ) {
                this.props.metaAction.toast("error", "请输入至少8位号码")
                return /*this.metaAction.toast('error', );*/
            }
            aa.fphm = invoiceNub
        }
        if (term === 2) {
            if (date === "Invalid date") {
                this.props.metaAction.toast("error", "请选择开票月份")
                return
            }
            aa.kpyf = date
        }
        if (term === 3) {
            if (deductionMonth === "Invalid date") {
                this.props.metaAction.toast("error", "请选择抵扣月份")
                return
            }
            aa.dkyf = deductionMonth
        }
        let res
        this.setState({
            loading: true
        })
        if (this.state.type === "销项") {
            res = await this.props.webapi.bovms.saleChaPiao(aa)
        } else {
            res = await this.props.webapi.bovms.purchaseChaPiao(aa)
        }
        this.setState({
            loading: false
        })
        let list
        if (this.state.type === "销项") {
            list = res.checkTicketSaleList
        } else {
            list = res.checkTicketPurchaseList
        }

        let { pagination } = this.state
        pagination.currentPage = 1
        this.form && this.form.reset && this.form.reset() //重置过滤表单的值
        if (list) {
            this.clearCheck()
            this.setState({
                list: list,
                keyword: "",
                sourceData: list,
                tableData: []
                    .concat(list)
                    .splice(0, this.state.pagination.pageSize),
                orgId: res.order,
                yearPeriodRes: res.yearPeriod,
                pagination,
                selectedRowKeys: []
            })
        }
    }
    // 重置
    resetForm = () => {
        this.setState(
            {
                date: "",
                deductionMonth: "",
                term: 1,
                invoiceNub: "",
                tableData: []
            },
            () => { }
        )
    }
    //本期入账
    isRuzhang = async () => {
        let { selectedRowKeys, list, tableData } = this.state
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

        if (selectedRowKeys.length === 0) {
            this.props.metaAction.toast("error", "请选择入账数据")
            return
        }

        let pshuArr = selectedRowKeys.map(e => {
            let dItem = list.find(f => f.kjxh === e)
            //去掉原数据对应这条
            list = list.filter(fl => fl.kjxh != e)
            tableData = tableData.filter(ft => ft.kjxh != e)
            //合并对象
            dItem.detailList = dItem.detailList.map(de =>
                Object.assign({}, mergaDetailObj, de)
            )

            //删除属性
            delete dItem.goodName
            delete dItem.goodNameList
            delete dItem.dljgId
            delete dItem.orgId
            delete dItem.yearPeriod
            delete dItem.acct20CiName
            delete dItem.vchState
            delete dItem.invKindName
            dItem.detailList.map(de => {
                if (!de.qty) {
                    de.qty = null
                }
                if (!de.unitPrice) {
                    de.unitPrice = null
                }
                delete de.dljgId
                delete de.orgId
                delete de.indexNo
                delete de.isStock
                delete de.acct10CiName
                return de
            })

            return Object.assign({}, mergaObj, dItem)
        })



        let aa = {
            yearPeriod: this.state.yearPeriodRes,
            inventoryEnableState: this.props.stock,
            billList: pshuArr,
            insertType: 'check'
        }
        let ss = {
            yearPeriod: this.state.yearPeriodRes,
            inventoryEnableState: this.props.stock,
            accountList: pshuArr,
            insertType: 'check'
        }

        let res
        if (this.state.type === "销项") {
            res = await this.props.webapi.bovms.batchInsertSaleBillInfo(aa)
        } else {
            res = await this.props.webapi.bovms.batchSavePurchaseInvoice(ss)
        }
        if (res) {
            this.closArr = [].concat(res.billIds || res)
            this.clearCheck()
            this.setState({
                list,
                tableData
            })
            this.props.metaAction.toast(
                "success",
                `入账成功，生成了${pshuArr.length}条业务单据`
            )
        }
    }
    // 分页
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

        this.setState(
            {
                pagination,
                tableData
            },
            () => {
                this.clearCheck()
            }
        )
    }
    disabledStartDate = startValue => {
        let enabledYearAndMonth = this.props.enabledYearAndMonth
        return (
            startValue.valueOf() <
            new Date(
                moment(enabledYearAndMonth)
                    .subtract(0, "month")
                    .format("YYYY-MM-DD")
                    .substr(0, 7)
            ).valueOf() || startValue.valueOf() > new Date().valueOf()
        )
    }

    componentWillUnmount() {
        this.props.caPiaoOnOk(this.closArr, this.state.yearPeriod)
    }

    onRowClick = (e, index) => {
        let { selectedRowKeys, tableData } = this.state
        if (this.condition(tableData[index])) {
            return
        }
        const columnKey = e && e.target && e.target.attributes["columnKey"]
        if (columnKey && columnKey.value) {
            let key = tableData[index]["kjxh"]
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

    inputOnChange = val => {
        this.setState({
            keyword: val.target.value
        })
    }

    dataFilter(data) {
        let {
            fpzlDm,
            minAmount,
            maxAmount,
            isProduce
        } = this.state.filterParams
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
        if (isProduce != null) {
            arr = arr.filter(f => f.isProduce === isProduce)
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

    onPressEnter() {
        const { keyword, sourceData } = this.state
        let list = []
        if (keyword) {
            let filterData = this.dataFilter(sourceData)
            filterData.map(item => {
                if (
                    item.custName.includes(keyword) ||
                    item.goodName.includes(keyword)
                ) {
                    list.push(item)
                } else {
                    item.detailList.some(dItem => {
                        if (
                            list.findIndex(f => f.kjxh === item.kjxh) == -1 &&
                            dItem.goodsName &&
                            dItem.goodsName.includes(keyword)
                        ) {
                            list.push(item)
                        }
                    })
                }
            })
        } else {
            list = this.dataFilter(sourceData)
        }
        this.setState(
            {
                list
            },
            () => {
                this.pageChanged()
            }
        )
    }

    handleSearch(values) {
        const { sourceData } = this.state
        if (!sourceData.length) {
            return
        }
        this.setState(
            {
                filterParams: values
            },
            () => {
                this.onPressEnter()
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

    rowClassNameGetter(index) {
        const { tableData, selectedRowKeys } = this.state,
            record = tableData[index] || {}
        if (this.condition(record)) {
            return "bovms-common-table-style-grey-row"
        }
        return ""
    }

    condition(row) {
        return (
            (row.accountState === "1" && row.isProduce === true) ||
            row.accountState === "1" ||
            row.isProduce === true ||
            row.fpztDm != "1" ||
            row.invKindCode == "12" ||
            row.invKindCode == "99" ||
            row.invKindCode == "13" ||
            row.selectable === false
        )
    }

    render() {
        const {
            date,
            deductionMonth,
            pagination,
            selectedRowKeys,
            keyword,
            filterParams,
            type
        } = this.state
        return (
            <div>
                <div className="bovms-app-popup-content">
                    <div style={{ marginBottom: "12px" }}>
                        <div>
                            <Radio.Group
                                onChange={this.query}
                                value={this.state.term}
                            >
                                <span>
                                    <Radio value={1}>发票号码</Radio>
                                    <Input
                                        placeholder="请输入发票号码"
                                        style={{ width: "140px" }}
                                        onChange={this.onChange}
                                        value={this.state.invoiceNub}
                                        disabled={
                                            this.state.term === 1 ? false : true
                                        }
                                        size="default"
                                    />
                                </span>
                                <span style={{ marginLeft: "12px" }}>
                                    <Radio value={2}>开票月份</Radio>
                                    <DatePicker.MonthPicker
                                        style={{ width: "120px" }}
                                        onChange={this.onChdataChange}
                                        value={date}
                                        disabled={
                                            this.state.term === 2 ? false : true
                                        }
                                    />
                                </span>
                                {this.state.type === "进项" &&
                                    this.state.nsrxz === "一般纳税人" && (
                                        <span style={{ marginLeft: "12px" }}>
                                            <Radio value={3}>抵扣月份</Radio>
                                            <DatePicker.MonthPicker
                                                style={{ width: "120px" }}
                                                onChange={this.onChdataChange}
                                                value={deductionMonth}
                                                disabled={
                                                    this.state.term === 3
                                                        ? false
                                                        : true
                                                }
                                            />
                                        </span>
                                    )}
                            </Radio.Group>
                            <Button
                                type="primary"
                                onClick={this.filterList.bind(this)}
                                style={{
                                    marginLeft: "16px",
                                    marginRight: "10px"
                                }}
                            >
                                查询
                            </Button>
                            <Button onClick={this.resetForm.bind(this)}>
                                重置
                            </Button>
                        </div>
                        <div className="bovms-app-chapiao-filter">
                            <div>
                                <Input.Group compact>
                                    <Input
                                        placeholder={`请输入${
                                            type === "销项" ? "购方" : "销方"
                                            }名称或商品服务名称`}
                                        style={{ width: "230px" }}
                                        value={keyword}
                                        onChange={this.inputOnChange.bind(this)}
                                        onPressEnter={this.onPressEnter.bind(
                                            this
                                        )}
                                    />
                                    <Popover
                                        overlayClassName="ttk-filter-form-popover"
                                        autoAdjustOverflow={false}
                                        getPopupContainer={trigger =>
                                            trigger.parentNode
                                        }
                                        content={
                                            <PopoverFilterForm
                                                wrappedComponentRef={form =>
                                                    (this.form = form)
                                                }
                                                params={filterParams}
                                                onFilter={this.handleSearch.bind(
                                                    this
                                                )}
                                                close={this.hide}
                                            />
                                        }
                                        placement="bottom"
                                        trigger="click"
                                        visiible={this.state.popVisible}
                                        onVisibleChange={this.handlePopChange}
                                    >
                                        <Button icon="filter" />
                                    </Popover>
                                </Input.Group>
                            </div>
                            <Button onClick={this.isRuzhang} type="primary">
                                本期入账
                            </Button>{" "}
                        </div>
                    </div>

                    <DataGrid
                        loading={this.state.loading}
                        className="bovms-common-table-style"
                        key={this.dataGridKey}
                        headerHeight={37}
                        rowHeight={37}
                        footerHeight={0}
                        rowsCount={(this.state.tableData || []).length}
                        onRowClick={this.onRowClick.bind(this)}
                        rowClassNameGetter={this.rowClassNameGetter.bind(this)}
                        columns={this.getColumns()}
                        style={{ width: "100%", height: "400px" }}
                        ellipsis
                    />

                    <div className="bovms-common-table-style-footer">
                        <div>
                            已选择
                            <span>{this.state.selectedRowKeys.length}</span>条
                        </div>
                        <Pagination
                            showSizeChanger
                            showQuickJumper
                            pageSize={pagination.pageSize}
                            pageSizeOptions={["50", "100", "200", "300"]}
                            current={pagination.currentPage}
                            total={this.state.list.length}
                            onChange={this.pageChanged.bind(this)}
                            onShowSizeChange={this.pageChanged.bind(this)}
                            showTotal={total => `共${total}条记录`}
                        />
                    </div>
                </div>
                <div className="bovms-app-chaPiao-pagination-hint">
                    <Popover
                        content={
                            <p>
                                <p>
                                    <span>温馨提示：</span>
                                    不能选中的发票：1）已在本月生成了单据；2）已经生成了凭证；3）开票月份大于当前会计月度
                                </p>
                                <p style={{ marginLeft: "70px" }}>
                                    4）发票类型为海关缴款书、代扣代缴凭证、其他票据；5）状态为作废、异常、失控
                                </p>
                            </p>
                        }
                        overlayClassName="inv-tool-tip-normal tool-tip-footer-amount"
                    >
                        <p className="ellipsis-text">
                            <p>
                                {" "}
                                <span>温馨提示：</span>
                                不能选中的发票：1）已在本月生成了单据；2）已经生成了凭证；3）开票月份大于当前会计月度
                            </p>
                            <p style={{ marginLeft: "70px" }}>
                                4）发票类型为海关缴款书、代扣代缴凭证、其他票据；5）状态为作废、异常、失控
                            </p>
                        </p>
                    </Popover>
                </div>
            </div>
        )
    }
}
export default chaPiao
