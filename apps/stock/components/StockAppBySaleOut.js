import React from "react"
import ReactDOM from "react-dom"
import { Table, Button, Input, Icon, Modal } from "edf-component"
import { AppLoader } from "edf-meta-engine"
import utils from "edf-utils"
import { message, Spin } from "antd"
import moment from "moment"
import { getInfo, denyClick, transToNum, deepClone } from "../commonAssets/js/common"
import StockAppBySaleOutInput from "./StockAppBySaleOutInput"
import MergeSetupByRadio from "./MergeSetupByRadio2"
import VirtualTable from "../../invoices/components/VirtualTable"
import { flatCol, formatSixDecimal } from "./common/js/util"

const TableColumns = [
    {
        title: "存货编号",
        key: "inventoryCode",
        dataIndex: "inventoryCode",
        // width: 90,
        flexGrow: 1,
        align: "left",
        // fixed: 'left'
    },
    {
        title: "存货名称",
        key: "inventoryName",
        dataIndex: "inventoryName",
        align: "left",
        width: 180,
        // fixed: 'left'
    },
    {
        title: "规格型号",
        key: "inventoryGuiGe",
        dataIndex: "inventoryGuiGe",
        align: "left",
        width: 90,
        // fixed: 'left'
    },
    {
        title: "单位",
        key: "inventoryUnit",
        dataIndex: "inventoryUnit",
        align: "left",
        width: 80,
        // fixed: 'left'
    },
    {
        title: "销售收入",
        // flexGrow: 1,
        // width: 330,
        children: [
            {
                title: "数量",
                key: "xssrNum",
                dataIndex: "xssrNum",
                width: 105,
                minWidth: 105,
                align: "left",
                // flexGrow: 1,
            },
            {
                title: "金额",
                key: "xssrAmount",
                dataIndex: "xssrAmount",
                width: 105,
                minWidth: 105,
                align: "right",
            },
            {
                title: "销售成本率",
                key: "saleCostRate",
                dataIndex: "saleCostRate",
                width: 120,
                minWidth: 120,
                align: "right",
            },
        ],
    },
    {
        title: "销售成本",
        // width: 330,
        // flexGrow: 1,
        children: [
            {
                title: "数量",
                key: "xscbNum",
                dataIndex: "xscbNum",
                width: 105,
                minWidth: 105,
                align: "left",
                // flexGrow: 1,
            },
            {
                title: "单价",
                key: "xscbPrice",
                dataIndex: "xscbPrice",
                width: 105,
                minWidth: 105,
                align: "right",
            },
            {
                title: "金额",
                key: "xscbAmount",
                dataIndex: "xscbAmount",
                width: 120,
                minWidth: 120,
                align: "right",
            },
        ],
    },
]

class StockAppBySaleOut extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false, // 表格loading
            tableOption: {
                // 表格定位对象
                x: 1200,
                y: 500,
            },
            list: [{}], // 表格数据list
            selectedRowKeys: [],
            saleCostRate: "",
            canCreate: false,
            inputValue: "",
            allList: [],
            // obj: {
            //     tableW: ''
            // }
        }
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.params = props.params || {}
        this.closeModal = props.closeModal
    }

    componentWillMount() {
        this.load()
    }
    componentDidMount() {
        const dom = ReactDOM.findDOMNode(this)
        if (dom) {
            this.setState({ tableOption: { x: dom.offsetWidth } })
        }
    }

    getPeriod = () => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        const { name, periodDate } = currentOrg
        let time
        if (
            sessionStorage["stockPeriod" + name] != "undefined" &&
            sessionStorage["stockPeriod" + name]
        ) {
            time = sessionStorage["stockPeriod" + name]
        } else {
            sessionStorage["stockPeriod" + name] = periodDate
            time = periodDate
        }
        return time
    }

    /**
     * @description: 初始化数据
     * @param {boolean} isInitial 是否为初始化加载，是——true; 否——可不传
     */
    load = async isInitial => {
        let resp = await this.webapi.operation.queryXscbInventoryList({ period: this.getPeriod() }),
            list = [] // .查询按销售出库列表数据
        if (resp) list = resp.xssrInventoryDtoList
        let flag = false
        const allList = []
        // filterList = list.filter(item => item.xssrNum > 0)
        list.forEach(item => {
            item.xssrNum = formatSixDecimal(item.xssrNum)
            item.xssrAmount = utils.number.format(item.xssrAmount, 2)
            item.xscbNum = formatSixDecimal(item.xscbNum) ? formatSixDecimal(item.xscbNum) : ""
            item.saleCostRate &&
                (item.saleCostRate = parseFloat((item.saleCostRate * 100).toFixed(2)))
            if (item.xscbPrice || item.xscbAmount) {
                item.xscbPrice = formatSixDecimal(item.xscbPrice)
                item.xscbAmount = utils.number.format(item.xscbAmount, 2)
                flag = true
            }
            allList.push(item)
        })

        this.setState({
            allList,
            list,
            canCreate: flag,
        })
    }

    onOk = () => {
        let _this = this
        Modal.confirm({
            title: "请确认",
            content: "系统将重新生成出库单，并覆盖原数据，请确认",
            okText: "确定",
            cancelText: "取消",
            width: 420,
            onOk() {
                _this.generateXsckBills()
            },
            onCancel() {
                _this.onCancel()
            },
        })
    }

    generateXsckBills = async () => {
        let list = []
        this.state.list.slice(0).forEach(item => {
            if (transToNum(item.xscbAmount) || transToNum(item.xscbPrice)) {
                let newObj = {
                    inventoryId: item.inventoryId,
                    saleCostRate: parseFloat((transToNum(item.saleCostRate) / 100).toFixed(4)),
                    xscbNum: transToNum(item.xscbNum),
                    xscbPrice: transToNum(item.xscbPrice),
                    xscbAmount: transToNum(item.xscbAmount),
                }
                list.push(newObj)
            }
        })
        let reqObj = {
            period: this.getPeriod(),
            operater: this.metaAction.context.get("currentOrg").financeAuditor,
            xssrInventoryDtoList: list,
        }
        const resp = await this.webapi.operation.generateXsckBills(reqObj) // 保存按销售出库列表数据，即生成出库单
        this.closeModal("ok")
    }

    onCancel = () => {
        this.closeModal("cancel")
    }
    onSelectChange = (selectedRowKeys, record, checked) => {
        this.setState({
            selectedRowKeys,
        })
    }
    // 表格checkbox事件
    rowSelection = () => {
        let selectedRowKeys = this.state.selectedRowKeys.slice(0)
        return {
            selectedRowKeys,
            columnWidth: 62,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: null,
            getCheckboxProps: record => ({
                ...record,
            }),
        }
    }

    renderColumns = () => {
        const columns = TableColumns.map(v => {
            if (v.title === "销售收入") {
                v.children.forEach(item => {
                    if (item.dataIndex === "saleCostRate") {
                        item.render = (text, record, index) => {
                            return (
                                <div>
                                    <StockAppBySaleOutInput
                                        style={{ width: "80px", textAlign: "right" }}
                                        defaultVal={text}
                                        placeholder={"请输入成本率"}
                                        inputEvent={value => {
                                            this.handleInput(value, index)
                                        }}
                                        blurEvent={value => {
                                            this.handleInput(value, index, true)
                                        }}
                                    />{" "}
                                    %
                                </div>
                            )
                        }
                    }
                })
            }
            return v
        })
        return columns
    }
    handleInputChange = (v, flag) => {
        if (v.indexOf(".") > -1) {
            let decimal = v.split(".")[1]
            if (decimal.length > 2) {
                v = v.substr(0, v.length - 1)
            }
        }
        if (flag) v = parseFloat(v)
        // if (transToNum(value) > 100) {
        //     value = 100
        // }
        const { selectedRowKeys, list } = this.state
        let canCreate
        if (selectedRowKeys.length > 0) {
            let copylist = list.slice(0)
            selectedRowKeys.forEach(item => {
                let index = list.findIndex(data => data.inventoryId === item)
                if (Number(v) === 0 || !Number(v)) {
                    copylist[index]["saleCostRate"] = ""
                    copylist[index]["xscbPrice"] = ""
                    copylist[index]["xscbAmount"] = ""
                    // copylist[index]['xscbNum'] = ''
                    // v = ''
                    canCreate = list.filter(item => item.xscbAmount && item.xscbPrice).length > 0
                } else {
                    let rate = v / 100
                    copylist[index]["saleCostRate"] = v
                    copylist[index]["xscbNum"] = copylist[index]["xssrNum"]
                    copylist[index]["xscbAmount"] = utils.number.format(
                        transToNum(copylist[index]["xssrAmount"]) * rate,
                        2
                    )
                    copylist[index]["xscbPrice"] = formatSixDecimal(
                        transToNum(
                            utils.number.format(transToNum(copylist[index]["xssrAmount"]) * rate, 2)
                        ) / transToNum(copylist[index]["xssrNum"])
                    )
                    canCreate = true
                }
            })
            this.setState({
                saleCostRate: v,
                list: copylist,
                canCreate,
            })
        } else {
            // if (Number(v) === 0 || !Number(v)) v = ''
            let canCreate = list.filter(item => item.xscbAmount && item.xscbPrice).length > 0
            this.setState({
                saleCostRate: v,
                canCreate,
            })
            if (flag) return false
            this.metaAction.toast("error", "请先勾选数据")
        }
    }
    handleInput = (v, index, flag) => {
        let list = this.state.list.slice(0)
        // let list = deepClone(this.state.list)
        if (Number(v) === 0 || !Number(v)) {
            list[index]["saleCostRate"] = v
            list[index]["xscbPrice"] = ""
            list[index]["xscbAmount"] = ""
            // list[index]['xscbNum'] = ''
            let canCreate = list.filter(item => item.xscbAmount && item.xscbPrice).length > 0
            this.setState({
                list,
                canCreate,
            })
            return
        }
        if (v.indexOf(".") > -1) {
            let decimal = v.split(".")[1]
            if (decimal.length > 2) {
                v = v.substr(0, v.length - 1)
            }
            if (flag) v = parseFloat(v)
        }
        // if (v > 100) v = 100
        let rate = v / 100
        list[index]["saleCostRate"] = v
        list[index]["xscbNum"] = list[index]["xssrNum"]
        list[index]["xscbAmount"] = utils.number.format(
            transToNum(list[index]["xssrAmount"]) * rate,
            2
        )
        list[index]["xscbPrice"] = formatSixDecimal(
            transToNum(utils.number.format(transToNum(list[index]["xssrAmount"]) * rate, 2)) /
                transToNum(list[index]["xssrNum"]),
            6
        )
        // console.log('100')
        this.setState({
            list,
            canCreate: true,
        })
    }

    // 列合计
    _calColumnTotal = () => {
        const listAll = this.state.list.slice(0)
        let xssrNumTotal = 0,
            xscbAmountTotal = 0,
            xscbNumTotal = 0,
            xssrAmountTotal = 0
        listAll.map(v => {
            xssrNumTotal += transToNum(v.xssrNum)
            xscbNumTotal += transToNum(v.xscbNum)
            xscbAmountTotal += transToNum(v.xscbAmount)
            xssrAmountTotal += transToNum(v.xssrAmount)
        })
        return {
            xssrNumTotal,
            xscbNumTotal,
            xscbAmountTotal,
            xssrAmountTotal,
        }
    }

    //渲染合计
    renderFooter = () => {
        return {
            rows: null,
            rowsComponent: columns => {
                const colStyle = {
                    paddingLeft: "10px",
                    borderRight: "1px solid #d9d9d9",
                }
                const rows = []
                const {
                    xssrNumTotal,
                    xscbNumTotal,
                    xscbAmountTotal,
                    xssrAmountTotal,
                } = this._calColumnTotal()
                const _cols = flatCol(columns)
                _cols.forEach((c, i) => {
                    const style = { ...colStyle, width: c.width, flex: c.flexGrow },
                        className = c.fixed ? "vt-summary " + c.fixed : ""
                    if (i === _cols.length - 1) delete style.borderRight
                    let row = null
                    switch (c.key) {
                        case "select-col-key":
                            row = "合计"
                            break
                        case "xssrNum":
                            row = formatSixDecimal(xssrNumTotal, 6)
                            break
                        case "xssrAmount":
                            row = utils.number.format(xssrAmountTotal, 2)
                            break
                        case "xscbNum":
                            row = formatSixDecimal(xscbNumTotal)
                            break
                        case "xscbAmount":
                            row = utils.number.format(xscbAmountTotal, 2)
                            break
                        default:
                            row = ""
                            break
                    }
                    rows.push(
                        <div style={style} className={className}>
                            {row}
                        </div>
                    )
                })
                return <div className="vt-summary row">{rows}</div>
            },
            height: 37,
        }
    }

    mergeBillsSetOnOk = async value => {
        let obj = {
            mergeRule: value,
        }
        const res = await this.webapi.operation.saveBillMergeRule(obj)
        if (res === null) {
            return this.metaAction.toast("success", "设置成功")
        } else {
            return this.metaAction.toast("error", "设置失败")
        }
    }

    onSearch = e => {
        const value = e.target.value
        if (value) {
            const { allList } = this.state || []
            const listCopy = []
            allList.forEach(v => {
                if (v.inventoryName.indexOf(value) > -1 || v.inventoryCode.indexOf(value) > -1) {
                    // v.saleCostRate = ''
                    listCopy.push(v)
                }
            })
            this.setState({
                inputValue: value,
                list: listCopy,
            })
        } else {
            const { allList } = this.state || []
            // console.log('allList', allList)
            this.setState({
                inputValue: value,
                list: allList,
                // list: deepClone(allList)
            })
        }
    }

    mergeBills = async () => {
        const defaultValue = await this.webapi.operation.getBillMergeRule()
        // const defaultValue = res
        // this.setState({value: res.stockRule.merge})
        const ret = await this.metaAction.modal("show", {
            title: "合并单据",
            width: 400,
            top: 150,
            children: (
                <MergeSetupByRadio
                    defaultValue={defaultValue}
                    initData={{
                        firstText: "合并生成一张销售出库单",
                        secondText: "一条存货明细一张销售出库单",
                        firstValue: 1,
                        secondValue: 2,
                    }}
                    setOkListener={this.setOkListener}
                    onOk={this.mergeBillsSetOnOk}></MergeSetupByRadio>
            ),
            okText: "保存",
        })
    }

    /**
     * @description: 本页面渲染
     * @return: 返回本页面组件JSX
     */
    render() {
        const { loading, list, tableOption, saleCostRate, canCreate, inputValue } = this.state

        return (
            <React.Fragment>
                <div className="stock-app-by-sale-out">
                    <div className="stock-app-by-sale-out-header">
                        <Input
                            className="inv-app-batch-sale-header-filter-input"
                            type="text"
                            placeholder="请输入存货编号或存货名称"
                            prefix={<Icon name="search" type="search"></Icon>}
                            value={inputValue}
                            // onChange={(e) => {this.onSearch(e.target.value)}}
                            onChange={this.onSearch}></Input>
                        <span style={{ marginRight: "10px", verticalAlign: "middle" }}>
                            销售成本率:
                        </span>

                        <StockAppBySaleOutInput
                            style={{ width: "100px", marginRight: "8px", verticalAlign: "middle" }}
                            placeholder="请输入成本率"
                            defaultVal={saleCostRate}
                            inputEvent={value => {
                                this.handleInputChange(value)
                            }}
                            blurEvent={value => {
                                this.handleInputChange(value, true)
                            }}></StockAppBySaleOutInput>
                        <span style={{ verticalAlign: "middle" }}> %</span>
                        <Button
                            className="stock-app-by-sale-out-header-button"
                            onClick={this.mergeBills}>
                            单据合并
                        </Button>
                    </div>

                    <VirtualTable
                        key="inventoryId"
                        rowKey="inventoryId"
                        bordered={true}
                        pagination={false}
                        columns={this.renderColumns()}
                        dataSource={list}
                        rowSelection={this.rowSelection()}
                        width={tableOption.x}
                        height={500}
                        scroll={{ y: 400, x: tableOption.x + 10 }}
                        summaryRows={this.renderFooter()}
                        bordered
                        allowResizeColumn
                    />
                    <div className="stock-app-by-sale-out-footer">
                        <div className="stock-app-by-sale-out-footer-btngroup">
                            <Button
                                type="primary"
                                style={{ marginRight: "15px" }}
                                disabled={!canCreate}
                                onClick={this.onOk}>
                                生成出库单
                            </Button>
                            <Button onClick={this.onCancel}>取消</Button>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
export default StockAppBySaleOut
