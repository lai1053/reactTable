import React, { PureComponent } from "react"
import { action as MetaAction } from "edf-meta-engine"
import { Radio, message, Button, Input, Select, Divider, Tag } from "antd"
// import { VirtualTable } from "../components/virtualTable"
import VirtualTable from '../../invoices/components/VirtualTable'
import config from "./config"
// import { fetch } from 'edf-utils'
// import { addEvent, removeEvent } from '../utils/index'
// import VirtualSelect from '../component/VirtualSelect'
// import VirtualTable from "../component/VirtualTable/index"
// import SuperSelect from "../component/SuperSelect"
// import { fromJS, toJS } from "immutable"
// import {
    // printComponent,
    // printHtml，
    // printExistingElement
// } from "../component/print"

const vtSimpleColumns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 100,
        fixed: "left",
        render: text => <a>{text}</a>
    },
    {
        title: "Age",
        dataIndex: "age",
        key: "age",
        width: 100
    },
    {
        title: "Address",
        dataIndex: "address",
        key: "address",
        width: 200
    },
    {
        title: "Tags",
        key: "tags",
        dataIndex: "tags",
        render: tags => (
            <span>
                {tags.map(tag => {
                    let color = tag.length > 5 ? "geekblue" : "green"
                    if (tag === "loser") {
                        color = "volcano"
                    }
                    return (
                        <Tag color={color} key={tag}>
                            {tag.toUpperCase()}
                        </Tag>
                    )
                })}
            </span>
        )
    },
    {
        title: "Action",
        key: "action",
        width: 250,
        render: (text, record) => (
            <span>
                <a>Invite {record.name}</a>
                <Divider type="vertical" />
                <a>Delete</a>
            </span>
        )
    }
]
const vtColumns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 100,
        fixed: "left"
    },
    {
        title: "Other",
        children: [
            {
                title: "Age",
                dataIndex: "age",
                key: "age",
                width: 150
            },
            {
                title: "Address",
                children: [
                    {
                        title: "Street",
                        dataIndex: "street",
                        key: "street",
                        width: 150
                    },
                    {
                        title: "Block",
                        children: [
                            {
                                title: "Building",
                                dataIndex: "building",
                                key: "building",
                                width: 100
                            },
                            {
                                title: "Door No.",
                                dataIndex: "number",
                                key: "number",
                                width: 100
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        title: "Company",
        children: [
            {
                title: "Company Address",
                dataIndex: "companyAddress",
                key: "companyAddress",
                width: 200
            },
            {
                title: "Company Name",
                dataIndex: "companyName",
                key: "companyName"
            }
        ]
    },
    {
        title: "Person Gender",
        dataIndex: "gender",
        key: "gender",
        align: "center",
        width: 110,
        fixed: "right"
    }
]
const renderContent = (value, row, index) => {
    const obj = {
        children: value,
        props: {
            colSpan: 1
        }
    }
    if (index % 4 === 0) {
        obj.props.colSpan = 0
    }
    return obj
}

const colSpanColumns = [
    {
        title: "Name",
        dataIndex: "name",
        width: 300,
        render: (text, row, index) => {
            const obj = {
                children: <a>{text}</a>,
                props: {
                    colSpan: 1
                }
            }
            if (index % 4 === 0) {
                obj.props.colSpan = 5
            }
            return obj
        }
    },
    {
        title: "Age",
        dataIndex: "age",
        width: 300,
        render: renderContent
    },
    {
        title: "Home phone",
        colSpan: 2,
        // width: 600,
        dataIndex: "number",
        render: renderContent
    },
    {
        title: "Phone",
        colSpan: 0,
        // width: 0,
        dataIndex: "street",
        render: renderContent
    },
    {
        title: "Address",
        width: 300,
        dataIndex: "address",
        render: renderContent
    }
]
const vtData = []
for (let i = 0; i < 3001; i++) {
    vtData.push({
        key: i,
        name: "John Brown",
        age: i + 1,
        street: "Lake Park",
        building: "C",
        number: 2035,
        companyAddress: "Lake Street 42",
        companyName: "SoftLake Co",
        gender: "M",
        address: "Lake Street " + i + 1,
        tags: [
            "nice",
            "developer",
            "loser",
            "cool",
            "teacher",
            "lake",
            "park",
            "co",
            "brwon",
            "fine"
        ].slice(0, Math.random() * 10)
    })
}

function SimpleTable() {
    const colStyle = {
            paddingLeft: "10px",
            borderRight: "1px solid #d9d9d9"
        },
        summaryRows = {
            leftRows: (
                <div
                    style={{
                        width: "100px",
                        paddingLeft: "10px"
                    }}
                    className="virtual-table-summary left"
                >
                    合计
                </div>
            ),
            normalRows: (
                <div
                    style={{
                        paddingLeft: "100px"
                    }}
                    className="virtual-table-summary row"
                >
                    <div style={{ width: "100px", ...colStyle }}>age</div>
                    <div style={{ width: "200px", ...colStyle }}>address</div>
                    <div style={{ flex: 1, ...colStyle }}>tags</div>
                    <div style={{ width: "250px", paddingLeft: "10px" }}>
                        action
                    </div>
                </div>
            ),
            rightRows: null,
            height: 37
        }
    return (
        <VirtualTable
            style={{ width: "1000px", margin: "10px 0", minHeight: "400px" }}
            columns={vtSimpleColumns}
            dataSource={vtData}
            scroll={{ y: 406, x: 1500 }}
            summaryRows={summaryRows}
            bordered
        />
    )
}

function FixedRightTable() {
    const vtFixedRightColumns = [...vtSimpleColumns]
    const lastItem = vtFixedRightColumns[vtFixedRightColumns.length - 1]
    lastItem.fixed = "right"
    return (
        <VirtualTable
            style={{ width: "1000px", margin: "10px 0" }}
            columns={vtFixedRightColumns}
            dataSource={vtData}
            scroll={{ y: 400, x: 1500 }}
            bordered
        />
    )
}

class HeaderGroupTable extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedRowKeys: []
        }
    }
    onSelectChange = selectedRowKeys => {
        this.setState({
            selectedRowKeys
        })
    }
    render() {
        let { selectedRowKeys } = this.state
        const rowSelection = {
            selectedRowKeys,
            columnWidth: 62,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: [
                {
                    key: "all-data",
                    text: "选择全部",
                    onSelect: async () => {
                        this.setState({
                            selectedRowKeys: vtData.map(m => m.key)
                        })
                    }
                },
                {
                    key: "no-data",
                    text: "取消选择",
                    onSelect: () => {
                        this.setState({
                            selectedRowKeys: []
                        })
                    }
                }
            ],
            getCheckboxProps: record => ({
                ...record,
                disabled: record.editable ? true : false
            })
        }
        const onRow = record => ({
            onClick: () => {
                if (selectedRowKeys.some(s => s === record["key"]))
                    selectedRowKeys = selectedRowKeys.filter(
                        f => f !== record["key"]
                    )
                else selectedRowKeys.push(record["key"])
                this.setState({
                    selectedRowKeys
                })
            }
        })
        return (
            <VirtualTable
                className="header-group-table"
                onRow={onRow}
                rowSelection={rowSelection}
                style={{ width: "1000px", margin: "10px 0" }}
                columns={vtColumns}
                dataSource={vtData}
                scroll={{ y: 400, x: 1500 }}
                bordered
            />
        )
    }
}

function ColSpanTable() {
    return (
        <VirtualTable
            style={{ width: "1000px", margin: "10px 0", minHeight: "400px" }}
            columns={colSpanColumns}
            dataSource={vtData.slice(0, 100)}
            scroll={{ y: 400, x: 1500 }}
            bordered
        />
    )
}

function RowSpanTable() {
    return (
        <VirtualTable
            style={{ width: "1000px", margin: "10px 0", minHeight: "400px" }}
            columns={vtSimpleColumns}
            rowHeight={index => {
                switch (index % 2) {
                    case 0:
                        return 37 * 2
                    default:
                        return 37
                }
            }}
            dataSource={vtData.slice(0, 100)}
            scroll={{ y: 400, x: 1500 }}
            bordered
        />
    )
}
class ColResizeTable extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            columns: vtSimpleColumns.map((col, index) => ({
                ...col,
                minWidth: col.width || 100,
                onHeaderCell: column => ({
                    width: column.width,
                    onResize: this.handerResize(index)
                })
            }))
        }
    }
    handerResize = index => (e, { size }) => {
        this.setState(({ columns }) => {
            const nextCols = [...columns]
            nextCols[index] = {
                ...nextCols[index],
                width:
                    size.width < nextCols[index].minWidth
                        ? nextCols[index].minWidth
                        : size.width
            }
            return { columns: nextCols }
        })
    }
    render() {
        const { columns } = this.state
        return (
            <VirtualTable
                className="column-resize-table"
                style={{ width: "1000px", margin: "10px 0" }}
                columns={columns}
                dataSource={vtData}
                scroll={{ y: 400, x: 1500 }}
                bordered
            />
        )
    }
}

function testable(target) {
    target.isTestable = true
}

@testable
class MyTestableClass {}

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        // className
        // this.dropdownClassName = `v-dc${+new Date()}`;
        console.log("MyTestableClass:", MyTestableClass.isTestable)
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce("init")
    }
    async printHander() {
        await printExistingElement(".header-group-table")
        // await printComponent(<HeaderGroupTable />);
    }
    showConfirm() {
        let option = {
            title: "modal",
            className: "-modal",
            width: 1000,
            height: 700,
            top: 20,
            okText: "确定",
            // footer: null,
            centered: true,
            bodyStyle: {
                padding: "0px",
                borderTop: "1px solid #e9e9e9"
            },
            children: <SimpleTable />
        }

        this.metaAction.modal("show", option)
        // this.metaAction.modal("confirm", {
        //     style: { top: 5 },
        //     title: "请确认是否提交：",
        //     width: 480,
        //     okText: "确定",
        //     onOk: () => {},
        //     content: "请确认是否提交"
        // })
    }
    renderChildren = () => {
        let options = []
        new Array(1000).fill(1).forEach((item, index) => {
            options.push(
                <Select.Option key={index}>{`opt ${index + 1}`}</Select.Option>
            )
        })
        const selectVal = this.metaAction.gf("data.selectVal")

        // debugger

        return (
            <div>
                <Button onClick={::this.showConfirm}>confirm</Button>
                <h1>伸缩列</h1>
                <ColResizeTable />
                <h1>简单表格</h1>
                <SimpleTable />
                <h1>固定列</h1>
                <FixedRightTable />
                <h1>多层表头</h1>
                <HeaderGroupTable />
                <h1>列合并</h1>
                <ColSpanTable />
                <h1>行合并</h1>
                <RowSpanTable />
                <Button onClick={this.printHander}>
                    只打印 HeaderGroupTable
                </Button>
                <div>
                    <Select
                        style={{ width: "200px" }}
                        showSearch
                        onPopupScroll={e => console.log("onPopupScroll")}
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                            if (
                                option.props.children &&
                                typeof option.props.children !== "string"
                            ) {
                                return true
                            }
                            if (
                                option.props.children &&
                                typeof option.props.children === "string"
                            ) {
                                let ff = option.props.children.toLowerCase()
                                if (option.key === "new-add") return true
                                return ff.indexOf(input.toLowerCase()) >= 0
                            }
                            return false
                        }}
                    >
                        {options.slice(0, 50)}
                        <Select.Option key="new-add">新增</Select.Option>
                    </Select>
                </div>
                <div>
                    Super Select：
                    <SuperSelect
                        style={{ width: "200px" }}
                        defaultOpen={false}
                        showSearch
                        isNeedAdd
                        value={
                            selectVal !== undefined
                                ? String(selectVal)
                                : selectVal
                        }
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                            if (
                                option.props.children &&
                                typeof option.props.children !== "string"
                            ) {
                                return true
                            }
                            return option.props.children &&
                                typeof option.props.children === "string"
                                ? option.props.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                : false
                        }}
                    >
                        {options}
                    </SuperSelect>
                </div>
                <div>
                    Set Select value：
                    <Input
                        onChange={e =>
                            this.metaAction.sf("data.selectVal", e.target.value)
                        }
                        style={{ width: "200px" }}
                    />
                </div>
                <div>
                    进项：
                    <Button
                        onClick={() =>
                            this.handerChange(
                                "inv-app-sales-invoice-card",
                                "jxfp",
                                "07"
                            )
                        }
                    >
                        二手车统一销售发票
                    </Button>
                    <Button
                        onClick={() =>
                            this.handerChange(
                                "inv-app-sales-invoice-card",
                                "jxfp",
                                "07",
                                true
                            )
                        }
                    >
                        二手车统一销售发票 — 查看
                    </Button>
                    <Button
                        onClick={() =>
                            this.handerChange(
                                "inv-app-sales-invoice-card",
                                "jxfp",
                                "99"
                            )
                        }
                    >
                        其他票据
                    </Button>
                    <Button
                        onClick={() =>
                            this.handerChange(
                                "inv-app-pu-vats-invoice-card",
                                "jxfp",
                                "01"
                            )
                        }
                    >
                        专用发票
                    </Button>
                </div>
                <div>
                    销项：
                    <Button
                        onClick={() =>
                            this.handerChange(
                                "inv-app-sales-invoice-card",
                                "xxfp",
                                "07"
                            )
                        }
                    >
                        二手车统一销售发票
                    </Button>
                    <Button
                        onClick={() =>
                            this.handerChange(
                                "inv-app-sales-invoice-card",
                                "xxfp",
                                "07",
                                true
                            )
                        }
                    >
                        二手车统一销售发票 — 查看
                    </Button>
                </div>
            </div>
        )
    }
    comfirm = async t => {
        if (t) {
            let title = ""
            switch (t) {
                case "inv-app-sales-del":
                    title = "删除销项发票"
                    break
            }
            const res = await this.metaAction.modal("confirm", {
                content: "你确定删除这条记录么？"
            })
            // if (res) {
            //     this.metaAction.toast('success', '删除成功')
            // } else {
            //     this.metaAction.toast('error', '删除失败')
            // }
        }
    }
    handerChange = (t, fplx, fpzlDm, readOnly) => {
        if (t && typeof t == "string") {
            let title = "",
                data = null,
                noFooter = false
            switch (t) {
                case "inv-app-sales-zzsfp":
                    title = "增值税普通发票(销项)－新增"
                    break
                case "inv-app-sales-jdcxsfp":
                    title = "机动车销售发票(销项)-新增"
                    break
                case "inv-app-sales-zzsptfp":
                    title = "增值税普通发票(销项)-新增"
                    break
                case "inv-app-sales-ptjdfp":
                    title = "普通机打发票(销项)-新增"
                    break
                case "inv-app-sales-nsjctz":
                    title = "纳税检查调整(销项)-新增"
                    break
                case "inv-app-sales-wkjfp":
                    title = "未开具发票(销项)-新增"
                    break
                case "inv-app-sales-collect-card":
                    title = "一键读取销项"
                    // noFooter = true
                    break
                case "inv-app-sales-export-card":
                    title = "导出销项发票"
                    break
                case "inv-app-sales-batch-update-card":
                    title = "批量修改销项发票"
                    data = {}
                    break
                case "inv-app-pu-collect-card":
                    title = "一键读取进项"
                    break
                case "inv-app-sales-invoice-card":
                    if (fpzlDm === "07") {
                        title = "二手车统一销售发票"
                    } else if (fpzlDm === "99") {
                        title = "其他票据"
                    }
                    break
                default:
                    title = "弹窗"
                    break
            }
            let option = {
                title: title,
                className: t + "-modal",
                width: 1000,
                top: 20,
                okText: "确定",
                // footer: null,
                centered: true,
                bodyStyle: {
                    padding: "0px",
                    borderTop: "1px solid #e9e9e9"
                },
                children: this.metaAction.loadApp(t, {
                    store: this.component.props.store,
                    readOnly,
                    nsqj: "201909",
                    kjxh: null, //7377670868748289,
                    fplx,
                    fpzlDm,
                    fromModule:
                        t === "inv-app-pu-vats-invoice-card"
                            ? "InvoiceAuthentication"
                            : ""
                })
            }
            if (readOnly) {
                option.footer = null
            }
            this.metaAction.modal("show", option)
        }
    }

    handleAddTouristTransportInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "旅客运输服务抵扣凭证(进项)-新增",
            width: 1000,
            style: {
                top: 5
            },
            okText: "保存",
            cancelText: "关闭",
            wrapClassName: "inv-app-pu-tourist-transport-invoice-card-wrap",
            bodyStyle: {
                padding: "0px 0 12px 0"
            },
            children: this.metaAction.loadApp(
                "inv-app-pu-tourist-transport-invoice-card",
                {
                    store: this.component.props.store
                }
            )
        })
    }

    handleAddPuVatsInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "增值税专用发票(进项)-新增",
            width: "80%",
            style: {
                top: 5
            },
            okText: "保存",
            cancelText: "关闭",
            wrapClassName: "inv-app-pu-vats-invoice-card-wrap",
            bodyStyle: {
                padding: "0px 0 12px 0"
            },
            children: this.metaAction.loadApp("inv-app-pu-vats-invoice-card", {
                store: this.component.props.store
            })
        })
    }

    handleAddPuMvsInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "机动车销售发票(进项)-新增",
            width: "80%",
            style: {
                top: 5
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0"
            },
            children: this.metaAction.loadApp("inv-app-pu-mvs-invoice-card", {
                store: this.component.props.store
            })
        })
    }

    handleAddPuVatoInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "增值税普通发票(进项)-新增",
            width: "80%",
            style: {
                top: 5
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0"
            },
            children: this.metaAction.loadApp("inv-app-pu-vato-invoice-card", {
                store: this.component.props.store
            })
        })
    }

    handleAddPuCdpiInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "海关专用缴款书(进项)-新增",
            width: "80%",
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0"
            },
            children: this.metaAction.loadApp("inv-app-pu-cdpi-invoice-card", {
                store: this.component.props.store
            })
        })
    }

    handleAddPuWidthholdInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "代扣代缴专用缴款书(进项)-新增",
            width: "80%",
            style: {
                top: 5
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0"
            },
            children: this.metaAction.loadApp(
                "inv-app-pu-withhold-invoice-card",
                {
                    store: this.component.props.store
                }
            )
        })
    }

    handleAddPuUniformInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "统一收购发票(进项)-新增",
            width: "80%",
            style: {
                top: 5
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0"
            },
            children: this.metaAction.loadApp(
                "inv-app-pu-uniform-invoice-card",
                {
                    store: this.component.props.store
                }
            )
        })
    }

    handleAddPuAgriculturalInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "农产品销售发票(进项)-新增",
            width: "80%",
            style: {
                top: 5
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0"
            },
            children: this.metaAction.loadApp(
                "inv-app-pu-agricultural-invoice-card",
                {
                    store: this.component.props.store
                }
            )
        })
    }

    handleAddPuTollInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "通行费发票(进项)-新增",
            width: "80%",
            style: {
                top: 5
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0"
            },
            children: this.metaAction.loadApp("inv-app-pu-toll-invoice-card", {
                store: this.component.props.store
            })
        })
    }

    handleBatchUpdateInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "进项发票批量修改",
            width: 600,
            okText: "保存",
            bodyStyle: {
                padding: "12px 24px"
            },
            children: this.metaAction.loadApp(
                "inv-app-pu-batch-update-invoice",
                {
                    store: this.component.props.store
                }
            )
        })
    }
    onRedirect = (option, e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }
        if (option.appName) {
            window.location.href = `${location.origin}/#/edfx-app-root/${option.appName}`
            // this.component.props.onRedirect(option)
        }
    }
    onPortalChange = (option, e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }

        if (this.component.props.openDanhu) {
            let qyId =
                (this.metaAction.context.get("currentOrg") || {}).qyId ||
                "6857895587756032" ||
                "6863209271503872"
            // console.log('onPortalChange:', qyId)
            // this.component.props.setGlobalContent({
            //     name: option.title,
            //     appName: option.appName,
            //     params: { qyId: qyId },
            //     orgId: qyId,
            //     showHeader: true
            // })
            this.component.props.openDanhu(qyId, option.appName, option.title)
        }
    }
    // 关闭弹窗
    destroyDialog = wrapClassName => {
        const dialog = document.getElementsByClassName(wrapClassName)[0]
            .parentNode.parentNode
        document.body.removeChild(dialog)
    }
    downloadInvoices = () => {
        // if(){

        // }
        let radioSelected = "exportFpInDetail"
        const radioStyle = {
            display: "block",
            lineHeight: "44px"
        }
        const dialogContent = (
            <Radio.Group
                name="export_exportInvoices"
                defaultValue={radioSelected}
                onChange={function(e) {
                    radioSelected = e.target.value
                }}
            >
                <Radio style={radioStyle} value="exportFpInDetail">
                    导出明细发票数据（一条明细一条记录）
                </Radio>
                <Radio style={radioStyle} value="exportFpInSummary">
                    导出汇总发票数据（一张发票一条记录）
                </Radio>
            </Radio.Group>
        )
        this.metaAction.modal("show", {
            title: "导出",
            width: 400,
            wrapClassName: "inv-app-pu-export-dialog",
            bodyStyle: {
                borderTop: "1px solid #e9e9e9",
                padding: "30px 60px 45px"
            },
            footer: (
                <div>
                    <Button
                        onClick={() => {
                            this.destroyDialog("inv-app-pu-export-dialog")
                        }}
                    >
                        取消
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            this.downloadOk(radioSelected)
                        }}
                    >
                        确定
                    </Button>
                </div>
            ),
            children: dialogContent
        })
    }
    // 下载导出
    downloadOk = async radioSelected => {
        this.destroyDialog("inv-app-pu-export-dialog")
        const currentOrg = this.metaAction.context.get("currentOrg")
        const params = {
            // qyId: currentOrg.id,
            skssq: currentOrg.periodDate, //-- 税款属期
            nsrsbh: currentOrg.vatTaxpayerNum, //-- 纳税人识别号
            nsrmc: currentOrg.name,
            nsrxz: currentOrg.vatTaxpayer //-- 纳税人性质：一般纳税人（"YBNSRZZS"）或者小规模纳税人（"XGMZZS"）
        }
        let response
        if (radioSelected === "exportFpInSummary") {
            response = await this.webapi.invoices.exportJxfpInSummary(params)
        } else {
            response = await this.webapi.invoices.exportJxfpInDetail(params)
        }
        response.then(res => {
            if (res.result === true) {
                message.success("导出成功！", 1000)
            } else {
                message.error(`导出失败，失败原因是${res.error.message}`, 1500)
            }
        })
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({
        metaHandlers: ret
    })

    return ret
}
