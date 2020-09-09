import React, { PureComponent, Fragment } from "react"
import {
    getInfo,
    transToNum,
    formatSixDecimal,
    stockLoading,
    denyClick,
    canClickTarget
} from "../../commonAssets/js/common"
import { AppLoader } from "edf-meta-engine"
import { Modal } from "antd"
import { Table, Button, Radio, Input, Popover, Icon, Input as EdfInput } from "edf-component"
import { number as utilsNumber } from "edf-utils"
import SwitchInputText from "../SwitchInputText"
import { warehouseingSalesTable } from "./common/staticField"
import VirtualTable from "../../../invoices/components/VirtualTable"
import moment from "moment"
import { flatCol } from "../common/js/util"

export default class StockAppCompletionWarehousingSales extends PureComponent {
    constructor(props) {
        super(props)
        const dom = document.querySelector(".ttk-stock-app-completion-warehousing-sales")
        this.state = {
            // totalSales: 0,
            batchRatio: "",
            batchRateTips: "",
            cannotBatchRate: false,
            loading: false,
            content: "按销售入库",
            list: [],
            radioValue: "1",
            tableOption: {
                x: (dom && dom.offsetWidth - 10) || 1500,
                y: (dom && dom.offsetHeight - 10 - 104 - 78) || 600,
            },
            inventoryClass: [],
            listLength: 0,
            canSaveFlag: false,
            fakeRes: {
                result: true,
                value: {
                    period: "2019-07", //--日期
                    isDisable: false,
                    calculatingType: 1, //-- 计算类型 0 按期初单价 1 按销售成本
                    includeContentEmpty: false,
                    includeSystemData: false,
                    code: "单据号",
                    salesWarehouseDtos: [],
                    classList: [],
                },
            },
            xdzOrgIsStop: props.xdzOrgIsStop,
            salesWarehouseDtos: [],
            requestParams: {
                'period': this.props.params.period || moment().format("YYYY-MM"),
                'serviceCode': "WGRK",
                'name': "",
                'inventoryClassId': null,
            },
            tableScrollTop: 0
        }
        this.component = props.component || {}
        this.metaAction = props.metaAction || {}
        this.webapi = props.webapi || {}
        this.params = props.params || {} // 传入的参数
        this.tableRef = React.createRef()
    }

    componentDidMount() {
        this.load()
    }

    load = async () => {
        const salesList = this.state.salesWarehouseDtos || []
        let accountPeriod = (this.params && this.params.period) || moment().format("YYYY-MM")
        let rkPeriod = (this.params && this.params.rkPeriod) || ""
        let actualPeriod = (accountPeriod && accountPeriod.slice(0, 7)) || ""
        this.setState({ loading: true })
        const res = await this.webapi.stock.getSalesWarehousingList({
            period: actualPeriod || "", //--当前会计期间
            name: "", //--存货id
            inventoryClassId: null, //111 --类型id,无传null
            'isGenVoucher': this.params.isGenVoucher,
            'isCarryOverMainCost': this.params.isCarryOverMainCost
        })
        let salesWarehouseDtos = [],
            inventoryClass = [],
            code = "",
            period = ""

        this.listCopy = []

        if (res) {
            const resList = res.salesWarehouseDtos || salesList
            salesWarehouseDtos = resList.filter(v => {
                if (+v.salesNum && +v.salesVolume) {
                    v.num = transToNum(v.salesNum) - transToNum(v.inventoryQuantity) // 完工入库数
                    if (v.num < 0) {
                        v.num = 0
                    }
                    v.num = Number(v.num.toFixed(6))
                    return v.salesNum && v.salesVolume
                }
            })
            this.listCopy = [...salesWarehouseDtos]
            inventoryClass = res.classList
            code = res.code || "" // 单据编码
            period = res.period || "" // 生成日期
            inventoryClass.splice(0, 0, {
                'inventoryClassId': "",
                'inventoryClassName': "全部",
                'isCompletion': false,
            })
        }

        this.setState({
            loading: false,
            list: salesWarehouseDtos,
            allList: salesWarehouseDtos,
            listLength: salesWarehouseDtos.length,
            inventoryClass,
            requestParams: {
                'period': accountPeriod,
                'serviceCode': "WGRK",
                'name': "",
                'inventoryClassId': null,
            },
            // totalSales,
            others: { code, period, rkPeriod },
            isCarryOverProductCost: this.params.isCarryOverProductCost,
        })

        this.getTableScroll()
    }

    getTableScroll = e => {
        let tableOption = this.state.tableOption || {}
        const dom = document.querySelector(".ttk-stock-app-completion-warehousing-sales")
        if (dom) {
            this.setState({
                tableOption: {
                    ...tableOption,
                    x: dom.offsetWidth - 10,
                    y: dom.offsetHeight - 10 - 104 - 78 + 5,
                },
            })
        }
    }

    // ---- load逻辑完结 ----

    calcTotal = list => {
        if (Array.isArray(list) && list.length > 0 && list[0]) {
            let inventoryQuantitySum = 0, // 库存数量
                stockAmountSum = 0, // 库存金额
                salesNumSum = 0, // 销售数量
                salesVolumeSum = 0, // 销售金额
                numSum = 0, // 生产数量
                ybbalanceSum = 0 // 生产成本金额

            // 累计每一列的数目
            for (const item of list) {
                inventoryQuantitySum += transToNum(item.inventoryQuantity)
                stockAmountSum += transToNum(item.stockAmount)
                salesNumSum += transToNum(item.salesNum)
                salesVolumeSum += transToNum(item.salesVolume)
                numSum += transToNum(item.num)
                // ybbalanceSum += transToNum(item.ybbalance)
                // 销售单价计算方式
                let rate = transToNum(item.salesCostRate) // 销售成本率
                let salesVolume = transToNum(item.salesVolume) // 销售总金额
                let salesNum = transToNum(item.salesNum) // 销售数量
                let univalent = (rate * salesVolume) / salesNum // 销售成本单价
                let amount = transToNum(item.num) // 数量
                let totalCashNum = amount * univalent // 总金额 = 单价 * 数量
                ybbalanceSum += totalCashNum
            }
            // 格式化
            const initNum = formatSixDecimal(inventoryQuantitySum.toFixed(6)),
                initYb = utilsNumber.format(stockAmountSum, 2),
                saleNum = formatSixDecimal(salesNumSum.toFixed(6)),
                saleVol = utilsNumber.format(salesVolumeSum, 2),
                proNum = formatSixDecimal(numSum.toFixed(6)),
                proYba = utilsNumber.format(ybbalanceSum, 2)

            return { initNum, initYb, saleNum, saleVol, proNum, proYba }
        } else {
            return {}
        }
    }

    // 合计行
    renderSummaryRow = () => {
        const summaryRows = {
            height: 37,
            rows: null,
            rowsComponent: columns => {
                const colStyle = {
                    padding: "0 10px",
                    borderRight: "1px solid #d9d9d9",
                    textAlign: 'right'
                }
                const rows = []
                const { list = [] } = this.state
                const { initNum, initYb, saleNum, saleVol, proNum, proYba } = this.calcTotal(list)
                const _cols = flatCol(columns)
                _cols.forEach((c, i) => {
                    let style = { ...colStyle, width: c.width, flex: c.flexGrow },
                        className = c.fixed ? "vt-summary " + c.fixed : ""
                    if (i === _cols.length - 1) {delete style.borderRight; style = {...style, paddingRight: '20px'}}
                    if (i === 0) style = {...style, textAlign: 'center'}
                    let row = null

                    switch (c.key) {
                        case "select-col-key":
                            row = "合计"
                            break
                        case "inventoryQuantity":
                            row = initNum
                            break
                        case "stockAmount":
                            row = initYb
                            break
                        case "salesNum":
                            row = saleNum
                            break
                        case "salesVolume":
                            row = saleVol
                            break
                        case "num":
                            row = proNum
                            break
                        case "ybbalance":
                            row = proYba
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
        }

        return summaryRows
    }

    renderTable = () => {
        const { list = [], tableOption = {}, tableScrollTop } = this.state
        return (
            <VirtualTable
                dataSource={list}
                scroll={{ y: tableOption.y, x: tableOption.x + 10 }}
                summaryRows={this.renderSummaryRow()}
                bordered
                ref = {this.tableRef}
                rowKey="inventoryId"
                scrollTop={tableScrollTop}
                width={tableOption.x}
                height={tableOption.y + 100}
                rowSelection={this.rowSelection()}
                columns={this.renderColumns()}
                headerHeight={78}
                allowResizeColumn
            />
        )
    }

    // 表格checkbox事件
    rowSelection = () => {
        let selectedRowKeys = this.state.selectedRowKeys || []
        const {xdzOrgIsStop} = this.state
        return {
            selectedRowKeys,
            columnWidth: 62,
            onChange: (selectedRowKeys, record, checked) => {
                const flag = !!selectedRowKeys.length
                this.setState(
                    {
                        selectedRowKeys: [...selectedRowKeys],
                        canSaveFlag: flag,
                    },
                    () => {
                        if (selectedRowKeys.length) {
                            this.setRatio()
                        }
                    }
                )
            },
            getCheckboxProps: record => ({
                ...record,
                disabled: xdzOrgIsStop ? true : false,
            }),
        }
    }

    // 列渲染
    renderColumns = () => {
        let col = warehouseingSalesTable.map(c => {
            const v = { ...c }
            if (v.key === "currentStock") {
                v.title = (
                    <Fragment>
                        库存
                        <Popover content="库存计算不包括当期销售出库成本">
                            <Icon type="question-circle-o" style={{ padding: "0 4px" }} />
                        </Popover>
                    </Fragment>
                )
            }
            const item = this.renderChild(v)
            return item
        })
        return col
    }

    // 渲染表格的列
    renderChild = c => {
        const col = { ...c }
        col.title = <div className="ttk-stock-app-table-header-txt"> {col.title} </div>

        if (["inventoryCode", "inventoryName", "inventoryGuiGe"].includes(col.dataIndex)) {  
            col.render = (text, record, index) => {
                return (
                    <div className="tdOverflow" title={text}>
                        {text}
                    </div>
                )
            }
        } else if (["stockAmount", "salesVolume"].includes(col.dataIndex)) {
            col.render = (text, record, index) => {
                return this.formatNum(text, 2)
            }
        } else if (["inventoryQuantity", "salesNum"].includes(col.dataIndex)) {
            col.render = (text, record, index) => {
                return this.formatNum(text)
            }
        } else if (col.dataIndex == "salesCostRate") {
            col.render = (text, record, index) => {
                return this.renderInputRatio(text, record, index)
            }
        } else if (col.dataIndex == "num") {
            col.render = (text, record, index) => {
                return this.renderInputNum(text, record, index)
            }
        } else if (col.dataIndex == "ybbalance") {
            col.render = (text, record, index) => {
                return this.calTotal(text, record, index)
            }
        }
        if (col.children && col.children.length > 0) {
            col.children = col.children.map(v => {
                return this.renderChild(v)
            })
        }

        return col
    }

    //数据格式化
    formatNum = (num, decimal) => {
        let txt = num
        const content =
            decimal && decimal !== 0 ? utilsNumber.format(txt, decimal) : formatSixDecimal(txt)
        return (
            <div title={content} className="warehousing-sale-overflow">
                {content}
            </div>
        )
    }

    // 渲染表格成本比率输入框
    renderInputRatio = (text, record, index) => {
        const {xdzOrgIsStop} = this.state
        let rate = (text && parseFloat(text * 100).toFixed(2)) || text
        if (text) {
            const txt = rate.split(".")
            const [a, b] = txt
            let decimal = Number(`0.${b}`) > 0 ? Number(`0.${b}`).toString().split(".")[1] : 0
            rate = Number(decimal) && Number(decimal) > 0 ? Number(`${a}.${decimal}`) : a
        }

        const radioVal = this.state.radioValue
        // 隐藏期初方式，期初库存字段变更
        return (
            <React.Fragment>
                {!xdzOrgIsStop ? 
                    <div class="salesCostRate-input">
                        <SwitchInputText
                            text={rate}
                            numType={"cash"}
                            callback={v => {
                                this.inputRatioChangeCallback(v, record, index)
                            }}
                        />
                        <span class="salesCostRate-mark">{"%"}</span>
                    </div>
                    :
                    <div>{text}</div>
                }
            </React.Fragment>
        )
    }

    // 渲染表格的数量输入框
    renderInputNum = (text, record, index) => {
        const {xdzOrgIsStop} = this.state
        const { hasNum } = record
        return (
            <div className="input-num-container">
                {!xdzOrgIsStop ? 
                    <SwitchInputText
                        text={text}
                        callback={v => {
                            this.inputNumChangeCallback(v, record, index)
                        }}
                        errorFlag={hasNum}
                        numType={"amount"}
                        format={0}
                    />
                    :
                    <span title={text}>{text}</span>
                }
            </div>
        )
    }

    // 计算表格每行的总成本金额
    calTotal = (text, record, index) => {
        const {xdzOrgIsStop} = this.state 

        // 销售单价计算方式
        let rate = transToNum(record.salesCostRate) // 销售成本率
        let salesVolume = transToNum(record.salesVolume) // 销售总金额
        let salesNum = transToNum(record.salesNum) // 销售数量
        let univalent = (rate * salesVolume) / salesNum // 销售成本单价

        let amount = transToNum(record.num) // 数量
        let totalCashNum = amount * univalent // 总金额 = 单价 * 数量
        totalCashNum = totalCashNum ? utilsNumber.format(totalCashNum, 2) : ""
        let totalFlag = record.hasYbBalance ? (totalCashNum ? false : true) : false

        //添加字段
        this.listCopy[index].ybbalance = totalCashNum
        this.listCopy[index].hasYbBalance = totalCashNum ? false : true

        return (
            <div
                className="td-totalCash"
                title={totalCashNum}
                style={{
                    borderColor: (totalFlag && !xdzOrgIsStop) ? "#ff4600" : "transparent",
                }}>
                {totalCashNum}
            </div>
        )
    }

    // 数量成本比率输入框change事件
    inputRatioChangeCallback = (v, record, index) => {
        const list = this.state.list || []
        list[index].salesCostRate = (v && v / 100) || v
        this.listCopy = [...list]
        this.setState({ 
            list: [...list],
            tableScrollTop: this.tableRef.current.bodyRef.current.scrollTop
        })
    }

    // 数量输入框change事件
    inputNumChangeCallback = (v, record, index) => {
        const list = this.state.list || []
        list[index].num = v
        if (v) {
            list[index].hasNum = false
        }
        this.listCopy = [...list]
        this.setState({ 
            list: [...list],
            tableScrollTop: this.tableRef.current.bodyRef.current.scrollTop
        })
    }

    // ---- 列表逻辑完结 ----

    //关闭、返回
    handleReturn = () => {
        const params = this.composeParams()
        const fromPage = this.params.path.slice(0)
        let pageName
        if (fromPage == "ttk-stock-app-completion-warehousing-sales-list" && this.params) {
            this.params.path = "ttk-stock-app-completion-warehousing-sales"
            pageName = "完工入库"
        } else {
            if (this.params) {
                this.params.path = "ttk-stock-app-completion-warehousing-sales"
            }
            pageName = "存货核算"
        }
        this.component.props.onlyCloseContent &&
            this.component.props.onlyCloseContent("ttk-stock-app-completion-warehousing-sales")

        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(pageName, fromPage, {
                params: { ...this.params },
            })
    }

    // 生成参数
    composeParams = () => {
        const params = { ...this.params }
        params.form = {}
        params.form.rkPeriod = this.state.others.rkPeriod           // 入库日期
        params.form.code = this.state.others.code                   // 单据编号
        params.form.calculatingType = this.state.radioValue || "1"  // 现已不用
        params.form.period = this.state.others.period               // 会计期间
        return params
    }

    // 搜索下拉框的change事件：筛选
    filterCallBack = v => {
        const { 
            name,  // 存货名称
            inventoryClassId  // 存货的类型id
        } = v
        let allList = this.state.allList || []
        allList = allList.filter(v => {
            if (name && inventoryClassId) {  // 如果同时数据存货名称 和 选择了存货类型，要同时根据这两个来搜索
                return (
                    (v.inventoryName.indexOf(name) > -1 || v.inventoryCode.indexOf(name) > -1) &&
                    v.inventoryClassId.toString() === inventoryClassId.toString()
                )
            } else if (name && !inventoryClassId) {  // 只根据存货名称搜索
                return v.inventoryName.indexOf(name) > -1 || v.inventoryCode.indexOf(name) > -1

            } else if (!name && inventoryClassId) {  // 只根据存货类型搜索
                return v.inventoryClassId.toString() === inventoryClassId.toString()

            } else {
                return v
            }
        })
        this.listCopy = [...allList]
        this.setState({ list: [...allList] })
    }

    // 销售成本比率输入框的输入控制：0-100的数字，2位小数
    batchRateInput = e => {
        e.target.value = e.target.value
            .replace(/[^\d^\.]+/g, "")
            .replace(".", "$#$")
            .replace(/\./g, "")
            .replace("$#$", ".")
        let val = e.target.value
        if (val.indexOf(".") > -1) {
            let arr = val.split(".")
            let decimal = arr[1]
            if (decimal.toString().length > 2) {
                val = `${arr[0]}.${arr[1].slice(0, 2)}`
            }
        }
        if (parseFloat(val.toString().trim()) === 0) {
            val = 0
        }
        e.target.value = val
    }

    // 销售成本比率输入框change事件
    batchInputChange = e => {
        let val = e.target.value
        if (this.state.batchRatio === val) {
            return
        }
        this.setState({ batchRatio: val }, () => {
            this.setRatio()
        })
    }

    // 点击“确定”批量设置销售成本比率的事件
    setRatio = () => {
        const { selectedRowKeys=[], batchRatio } = this.state
        if (batchRatio === "" || selectedRowKeys.length === 0) return  
        let tableList = this.state.list || []
        tableList = tableList.map((v, i) => {
            if (selectedRowKeys.includes(v.inventoryId)) {
                batchRatio ? (v.salesCostRate = batchRatio / 100) : (v.salesCostRate = "")
                // 销售单价计算方式
                let rate = transToNum(v.salesCostRate) // 销售成本率v
                let salesVolume = transToNum(v.salesVolume) // 销售总金额
                let salesNum = transToNum(v.salesNum) // 销售数量
                let univalent = (rate * salesVolume) / salesNum // 销售成本单价

                let amount = transToNum(v.num) // 数量
                let totalCashNum = amount * univalent // 总金额 = 单价 * 数量
                totalCashNum = totalCashNum ? utilsNumber.format(totalCashNum, 2) : ""

                //添加字段
                this.listCopy[i].ybbalance = totalCashNum
                this.listCopy[i].hasYbBalance = totalCashNum ? false : true
            }
            return v
        })
        this.listCopy = [...tableList]
        this.setState({ list: [...tableList] })
    }

    // 点击保存
    handleSave = async (a, b) => {
        const hasClick = canClickTarget.getCanClickTarget('completionJump')  
        if(!hasClick){
            const list = this.listCopy
            let { selectedRowKeys=[] } = this.state
            const { flag, selectedRows } = this.checkForm(list, selectedRowKeys)
            if (flag) {
                this.metaAction.toast("error", "勾选的存货生产入库列数据为空，需补充")
                return
            }
            const params = this.composeParams()
            params.form.list = selectedRows
            if (params && params.form.list && params.form.list.length !== 0) {
                canClickTarget.setCanClickTarget('completionJump', true)  // 防止重复点击
                await Modal.confirm({
                    title: "确认",
                    content: "系统将根据此数据重新生成完工入库单，是否进行覆盖生成？",
                    okText: "确定",
                    cancelText: "取消",
                    onOk: () => {
                        params.path = "ttk-stock-app-completion-warehousing-sales"
                        this.component.props.onlyCloseContent &&
                            this.component.props.onlyCloseContent(
                                "ttk-stock-app-completion-warehousing-sales"
                            )
                        this.component.props.setPortalContent &&
                            this.component.props.setPortalContent(
                                "完工入库",
                                "ttk-stock-app-completion-warehousing-sales-list",
                                { params: { ...params } }
                            )
                    },
                    onCancel() {},
                })
                canClickTarget.setCanClickTarget('completionJump', false)
            }
        }
    }

    // 检查校验
    checkForm = (list, selectedRowKeys) => {
        let flag = false,
            selectedRows = []
        list = list.map(item => {
            if (selectedRowKeys.includes(item.inventoryId)) {
                item.hasNum = parseFloat(item.num) ? false : true
                item.hasYbBalance = parseFloat(item.ybbalance) ? false : true
                selectedRows.push(item)
                if (item.hasNum || item.hasYbBalance) {
                    flag = true
                }
            } else {
                item.hasNum = false
                item.hasYbBalance = false
            }
            return item
        })
        this.listCopy = [...list]
        this.setState({ list: [...list] })
        return { flag, selectedRows }
    }


   /* 只读 ，如果已结账、或已经生成生产成本凭证，或已经结转出库成本，或者该客户已经停用，那么页面为只读状态*/
    isReadOnly = () => {
        const {xdzOrgIsStop} = this.state
        const { isGenVoucher, isCarryOverProductCost, isCarryOverMainCost } = this.params
        return isGenVoucher || isCarryOverProductCost || isCarryOverMainCost || xdzOrgIsStop
    }

    render() {
        const {
            loading,
            content,
            requestParams,
            totalSales,
            radioValue,
            batchRateTips,
            canSaveFlag,
            xdzOrgIsStop,
        } = this.state
        const isReadOnly = this.isReadOnly()
        return (
            <Fragment>
                {loading && <div className="ttk-stock-app-spin">{stockLoading()}</div>}

                <div className="ttk-stock-app-header has-border">
                    <div className="header-left">
                        <AppLoader
                            name="ttk-stock-app-completion-warehousing-filter"
                            requestParams={requestParams}
                            callback={v => {
                                this.filterCallBack(v)
                            }}
                            store={this.component.props.store}></AppLoader>

                        {(radioValue === "1" && !xdzOrgIsStop) && (
                            <div className="form-item">
                                <span className="lable">销售成本率：</span>
                                <span className="input">
                                    <Input
                                        placeholder="请输入成本率"
                                        onInput={this.batchRateInput}
                                        onChange={this.batchInputChange}
                                        disabled={isReadOnly}
                                    />
                                    <span className="mark">%</span>
                                </span>
                            </div>
                        )}
                    </div>
                    {!xdzOrgIsStop && 
                        <div className="header-right">
                            <i className="close-btn" onClick={this.handleReturn} ></i>
                        </div>
                    }
                </div>
                {this.renderTable()}
                {!xdzOrgIsStop &&
                    <div className="ttk-stock-app-completion-warehousing-sales-footer">
                        <Button
                            type="primary"
                            disabled={!canSaveFlag || isReadOnly}
                            onClick={()=>this.handleSave(!canSaveFlag , isReadOnly)}
                            className="ttk-stock-app-completion-warehousing-sales-footer-btn">
                            生成入库单
                        </Button>
                    </div>
                }
                
            </Fragment>
        )
    }
}
