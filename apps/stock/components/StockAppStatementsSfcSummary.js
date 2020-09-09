import React from "react"
import { Table, DatePicker, Button, Select } from "edf-component"
import { AppLoader } from "edf-meta-engine"
import utils from "edf-utils"
// import { message } from 'antd'
import { Spin } from "antd"
import VirtualTable from "../../invoices/components/VirtualTable/index"
import StatementsFilter from "./common/StatementsFilter"
import moment from "moment"
import {
    getInfo,
    transToNum,
    formatSixDecimal,
    addEvent,
    removeEvent,
    deepClone,
    canClickTarget,
} from "../commonAssets/js/common"
import { fromJS } from "immutable"
import MonthRangePicker from "./common/MonthRangePicker"
import PrintButton from "./common/PrintButton"

const tableColumns = [
    {
        title: "存货编号",
        dataIndex: "inventoryCode",
        key: "inventoryCode",
        width: 110,
        minWidth: 70,
        align: "left",
        fixed: "left",
    },
    {
        title: "存货名称",
        dataIndex: "inventoryName",
        key: "inventoryName",
        width: 160,
        minWidth: 70,
        align: "left",
        fixed: "left",
    },
    {
        title: "规格型号",
        dataIndex: "inventoryGuiGe",
        key: "inventoryGuiGe",
        width: 90,
        minWidth: 70,
        align: "left",
        fixed: "left",
    },
    {
        title: "单位",
        dataIndex: "inventoryUnit",
        key: "inventoryUnit",
        width: 50,
        minWidth: 50,
        align: "center",
        fixed: "left",
    },
    {
        title: "期初",
        children: [
            {
                title: "数量",
                dataIndex: "qcNum",
                key: "qcNum",
                width: 120,
                minWidth: 70,
                align: "left",
            },
            {
                title: "单价",
                dataIndex: "qcPrice",
                key: "qcPrice",
                width: 120,
                minWidth: 70,
                align: "right",
            },
            {
                title: "金额",
                dataIndex: "qcBalance",
                key: "qcBalance",
                width: 120,
                minWidth: 70,
                align: "right",
            },
        ],
    },
    {
        title: "入库",
        children: [
            {
                title: "数量",
                dataIndex: "rkNum",
                key: "rkNum",
                width: 120,
                minWidth: 70,
                align: "left",
            },
            {
                title: "单价",
                dataIndex: "rkPrice",
                key: "rkPrice",
                width: 120,
                minWidth: 70,
                align: "right",
            },
            {
                title: "金额",
                dataIndex: "rkBalance",
                key: "rkBalance",
                width: 120,
                minWidth: 70,
                align: "right",
            },
        ],
    },
    {
        title: "出库",
        children: [
            {
                title: "数量",
                dataIndex: "ckNum",
                key: "ckNum",
                width: 120,
                minWidth: 70,
                align: "left",
            },
            {
                title: "单价",
                dataIndex: "ckPrice",
                key: "ckPrice",
                width: 120,
                minWidth: 70,
                align: "right",
            },
            {
                title: "金额",
                dataIndex: "ckBalance",
                key: "ckBalance",
                width: 120,
                minWidth: 70,
                align: "right",
            },
        ],
    },
    // {
    //     title: '成本差异',
    //     dataIndex: 'diffCost',
    //     key: 'diffCost',
    //     width: 120,
    //     align: 'right',
    // },
    {
        title: "期末",
        flexGrow: 1,
        children: [
            {
                title: "数量",
                dataIndex: "qmNum",
                key: "qmNum",
                flexGrow: 1,
                width: 120,
                minWidth: 70,
                align: "left",
            },
            {
                title: "单价",
                dataIndex: "qmPrice",
                key: "qmPrice",
                width: 120,
                minWidth: 70,
                align: "right",
            },
            {
                title: "金额",
                dataIndex: "qmBalance",
                key: "qmBalance",
                width: 120,
                minWidth: 70,
                align: "right",
            },
        ],
    },
]

class StockAppStatementsSfcSummary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false, // 表格loading
            pageTitle: "收发存汇总表", // 页面title
            tableOption: {
                // 表格定位对象
                x: "100%",
                y: 400,
            },
            isUnOpen: false,
            isVisible: false,
            inventoryClassId: "",
            stockType: "全部",
            selectOptions: [], // 存货类型select list
            list: [], // 表格数据list
            period: "2019-08", // 会计期间
            summaryRowData: {},
            summary: undefined, //存货编号或存货名称
            isExist: false, //显示无期初、无发生、无期末余额的存货
            bInveControl: false, //显示负库存
            // tableColumns: fromJS(tableColumns).toJS()
        }
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.params = props.params || {}
        this.component = props.component || {}
        this.sumWidth = 1850
    }

    componentWillMount() {}

    componentDidMount = (nextprops, nextstate) => {
        if (!this.props.lastState) {
            this.load(true)
        } else {
            this.setState({ ...this.props.lastState })
            this.params = this.props.lastParams
        }
        addEvent(window, "resize", ::this.resizeTable)
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    componentWillUnmount = () => {
        // this[`deny-statements-sfc-summary-outportClickFlag`] = null
        sessionStorage["fromPage" + name] = "ttk-stock-app-statements-sfc-detail"
        removeEvent(window, "resize", ::this.resizeTable)
        this.props.saveLastData &&
            this.props.saveLastData(fromJS(this.state).toJS(), fromJS(this.params).toJS())
    }

    /**
     * @description: 初始化数据
     * @param {boolean} isInitial 是否为初始化加载，是——true; 否——可不传
     * @param {boolean} isTabLoad 是否是tab切换导致页面重新加载
     */
    load = async (isInitial, isTabLoad) => {
        let currentPeriod
        const { id = "", vatTaxpayer = "2000010002", name, periodDate = "" } =
            this.metaAction.context.get("currentOrg") || {}

        if (isInitial) {
            // 前置校验 start
            if (Object.keys(this.params).length === 0 || isTabLoad === true) {
                const newInfo = await getInfo({
                    period: sessionStorage["stockPeriod" + name] || periodDate,
                })
                this.params = Object.assign({}, newInfo)
                this.params.period = sessionStorage["stockPeriod" + name] || periodDate
            }
            this.params.isUnOpen = this.params.state !== 1

            currentPeriod = sessionStorage["stockPeriod" + name] || periodDate
            const startPeriod = (this.params && this.params.startPeriod) || ""
            this.setState({
                isUnOpen: this.params.isUnOpen,
                isVisible: true,
                period: currentPeriod,
                endPeriod: currentPeriod,
                defaultPeriod: currentPeriod,
                startPeriod: startPeriod,
            })
            if (this.params.isUnOpen) return
        }
        const time = currentPeriod || this.state.period
        const stockTypeId = isInitial ? "" : this.state.inventoryClassId
        this.setState({ loading: true })
        const { summary, isExist, bInveControl } = this.state
        let resp
        if (this.component.props.showInModal) {
            this.params.noToSfcDetail = this.component.props.noToSfcDetail
            resp = await this.webapi.stock.query({
                orgId: id || "", //--企业id，必填
                natureOfTaxpayers: vatTaxpayer || "", //--纳税人性质，必填
                inventoryClassId: stockTypeId || "", //--存货类型id
                period: this.component.props.period || "", //--会计期间，必填
                endPeriod: this.component.props.period || "",
                isVoucher: true, //写死的
                summary,
                isExist,
                bInveControl,
                accountId: this.component.props.accountId,
            })
        } else {
            resp = await this.webapi.stock.query({
                orgId: id || "", //--企业id，必填
                natureOfTaxpayers: vatTaxpayer || "", //--纳税人性质，必填
                inventoryClassId: stockTypeId || "", //--存货类型id
                period: time || "", //--会计期间，必填
                endPeriod: currentPeriod || this.state.endPeriod,
                isVoucher: true, //写死的
                summary,
                isExist,
                bInveControl,
            })
        }

        let dataList = []
        if (
            resp &&
            Object.prototype.toString.call(resp.carryMainCostSheetDtoList) === "[object Array]"
        ) {
            const resList = deepClone(resp.carryMainCostSheetDtoList)
            resList.map(item => {
                const copyItem = this.dealWithData(item)
                dataList.push(copyItem)
                return item
            })
        }
        this.getSummaryRowData(dataList)
        this.setState({
            loading: false,
            list: dataList,
            orgId: id,
        })
        if (isInitial && this.component.props.showInModal) {
            this.reqInventoryList()
        } //如果是页面刷新或者初始化时，需要请求存货列表
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    getSummaryRowData = list => {
        let qcNumSum = 0,
            qcBalanceSum = 0,
            rkNumSum = 0,
            rkBalanceSum = 0,
            ckNumSum = 0,
            ckBalanceSum = 0,
            qmNumSum = 0,
            qmBalanceSum = 0

        for (const item of list) {
            qcNumSum = (transToNum(qcNumSum) + transToNum(item.qcNum)).toFixed(6)
            qcBalanceSum = (transToNum(qcBalanceSum) + transToNum(item.qcBalance)).toFixed(2)
            rkNumSum = (transToNum(rkNumSum) + transToNum(item.rkNum)).toFixed(6)
            rkBalanceSum = (transToNum(rkBalanceSum) + transToNum(item.rkBalance)).toFixed(2)
            ckNumSum = (transToNum(ckNumSum) + transToNum(item.ckNum)).toFixed(6)
            ckBalanceSum = (transToNum(ckBalanceSum) + transToNum(item.ckBalance)).toFixed(2)
            qmNumSum = (transToNum(qmNumSum) + transToNum(item.qmNum)).toFixed(6)
            qmBalanceSum = (transToNum(qmBalanceSum) + transToNum(item.qmBalance)).toFixed(2)
        }

        const qcNum = formatSixDecimal(qcNumSum),
            qcBal = utils.number.format(transToNum(qcBalanceSum), 2),
            rkNum = formatSixDecimal(rkNumSum),
            rkBal = utils.number.format(transToNum(rkBalanceSum), 2),
            ckNum = formatSixDecimal(ckNumSum),
            ckBal = utils.number.format(transToNum(ckBalanceSum), 2),
            qmNum = formatSixDecimal(qmNumSum),
            qmBal = utils.number.format(transToNum(qmBalanceSum), 2)

        this.setState({
            summaryRowData: {
                qcNum,
                qcBal,
                rkNum,
                rkBal,
                ckNum,
                ckBal,
                qmNum,
                qmBal,
            },
        })
    }

    /**
     * @description: 格式化列表数据
     * @param {object} item 列表中的某一行
     */
    dealWithData = (item, needNegative) => {
        const regExp1 = new RegExp("Num"),
            regExp2 = new RegExp("Price"),
            regExp3 = new RegExp("Balance"),
            copyItem = { ...item }
        let negativeItem

        for (const v in item) {
            // 格式化数据
            if (regExp3.test(v) || v === "diffCost") {
                copyItem[v] = transToNum(item[v]) ? utils.number.format(item[v], 2) : ""
            } else if (regExp1.test(v) || regExp2.test(v)) {
                copyItem[v] = transToNum(item[v]) ? formatSixDecimal(item[v]) : ""
                if (v === "qmNum" && item[v] < 0) {
                    negativeItem = { ...item }
                }
            }
        }
        const ret = needNegative ? { copyItem, negativeItem } : copyItem
        return ret
    }
    /**
     * @description: 请求存货科目
     * @param {string} period 会计期间
     */
    reqInventoryList = async period => {
        let Period = period || this.state.period
        let inventoryList = await this.webapi.stock.getInventoryTypesFromArchives({
            //存货科目
            period: Period,
            serviceCode: "FWGRK",
            name: "",
        })
        if (inventoryList) {
            let selectOptions = this._parseSelectOption(inventoryList)
            selectOptions.splice(0, 0, {
                inventoryClassId: "",
                inventoryClassName: "全部",
                isCompletion: false,
            })
            // this.injections.reduce('updateSfs', {['data.selectOptions']: fromJS(selectOptions)} )
            this.setState({
                selectOptions: selectOptions,
            })
        } else {
            this.metaAction.toast("error", inventoryList.message)
        }
    }
    /**
     * @description: 去重
     * @param {string} data 需要去重的存货科目数组
     * @return: 去重后的存货科目数组
     */
    _parseSelectOption = data => {
        const obj = {},
            selectOptions = []
        data.map(v => {
            if (!obj[v.inventoryClassId]) {
                obj[v.inventoryClassId] = v.inventoryClassId
                const { inventoryClassId, inventoryClassName } = v
                selectOptions.push({ inventoryClassId, inventoryClassName })
            }
        })
        return selectOptions
    }

    /**
     * @description: 禁用月份
     * @param {string} currentDate 当前日期
     * @return: 布尔值 是否属于禁用范围
     */
    disabledDate = currentDate => {
        const currentDateStr = moment(currentDate).format("YYYY-MM")
        // const startMonth = this.metaAction.gf('data.startPeriod') || ''
        const { startPeriod } = this.state || ""
        return currentDateStr.valueOf() < startPeriod.valueOf()
    }

    getPrintProps = () => {
        const list = this.state.list
        return {
            printType: 2,
            params: {
                codeType: "SFCHZ",
            },
            disabled: !(Array.isArray(list) && list.length > 0),
            getSearchParams: this.getSearchParams,
        }
    }
    getSearchParams = () => {
        var { id, name, vatTaxpayer } = this.metaAction.context.get("currentOrg") || {}
        var { inventoryClassId, period, endPeriod, isExist, summary, bInveControl } = this.state

        return {
            orgId: id || "", //--企业id，必填
            name: name || "", //--企业名称，必填
            natureOfTaxpayers: vatTaxpayer || "", //--纳税人性质，必填
            inventoryClassId: inventoryClassId || "", //--存货类型id
            period: period || "", //--会计期间，必填
            endPeriod,
            isVoucher: true,
            summary,
            isExist,
            bInveControl,
        }
    }
    /**
     * @description: 导出
     */
    handleOutport = async event => {
        event.stopPropagation && event.stopPropagation()
        event.nativeEvent.stopPropagation && event.nativeEvent.stopPropagation()
        if (!this.handleOutportDoing) {
            this.handleOutportDoing = true
            await this.webapi.stock.export(this.getSearchParams())
            this.handleOutportDoing = false
        }
    }
    /**
     * @description: 渲染列
     * @return: 表格columns数组
     */
    renderColumns = () => {
        const columns = tableColumns.map(v => {
            // v.title = <div className='ttk-stock-app-table-header-txt'>{v.title}</div>
            if (v.dataIndex === "inventoryCode") {
                v.render = (text, record, index) => {
                    if (this.params && this.params.noToSfcDetail) return text
                    return (
                        <span
                            className="ttk-stock-app-link-txt"
                            onClick={event => {
                                event.nativeEvent.stopImmediatePropagation()
                                this.toSfcDetail(record)
                            }}>
                            {text}
                        </span>
                    )
                }
            } else if (
                ["inventoryCode", "inventoryName", "inventoryGuiGe"].indexOf(v.dataIndex) > -1
            ) {
                v.render = (text, record, index) => {
                    return (
                        <div title={text} className="textOverflow">
                            {" "}
                            {text}{" "}
                        </div>
                    )
                }
            }
            return v
        })
        return columns
    }
    /**
     * @description: 重新计算表格宽高
     * @return {object} 表格的宽和表格的高
     */
    resizeTable = () => {
        const ele = document.querySelector(".ttk-stock-app-statements-sfc-summary")
        let tableW = (ele && ele.offsetWidth - 10) || 0
        const tableH = (ele && ele.offsetHeight - 88 + 20) || 0
        const obj = { tableW, tableH }
        let { tableOption } = this.state
        // this.metaAction.sf('data.obj', fromJS(obj))
        tableW = this.computeColWidth(tableW)
        this.setState({
            tableOption: {
                ...tableOption,
                x: tableW,
                y: tableH,
            },
        })
    }

    computeColWidth = tableW => {
        // 1850为初始宽度，16为总列数

        if (tableW <= 1850) {
            this.sumWidth = 1850
            return tableW
        }
        let increment = Math.floor((tableW - this.sumWidth) / 16)
        let sumWidth = 0
        // let tableColumns = this.state.tableColumns
        for (const item of tableColumns) {
            if (item.children) {
                for (const el of item.children) {
                    el.width += increment
                    sumWidth += el.width
                }
            } else {
                item.width += increment
                sumWidth += item.width
            }
        }
        // this.setState({tableColumns})
        this.sumWidth = sumWidth
        return tableW
    }

    /**
     * @description: 单击跳转存货明细
     * @param {object} record 当前行数据
     */
    toSfcDetail = record => {
        const paramsAll = {}
        // const currentPeriod = this.metaAction.gf('data.period') || moment().format('YYYY-MM')
        const currentPeriod = this.state.period || moment().format("YYYY-MM")
        const name = this.metaAction.context.get("currentOrg").name
        paramsAll.params = Object.assign({}, this.params)
        paramsAll.params.path = "ttk-stock-app-statements-sfc-summary"
        sessionStorage["fromPage" + name] = "ttk-stock-app-statements-sfc-summary"
        paramsAll.accountPeriod = currentPeriod
        paramsAll.endPeriod = this.state.endPeriod
        paramsAll.inventory = Object.assign({}, record)
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                "收发存明细表",
                "ttk-stock-app-statements-sfc-detail",
                { ...paramsAll }
            )
    }
    /**
     * @description: 双击表格行
     * @param {object} record 当前行数据
     * @param {number} index 当前行数据index
     */
    handleOnRow = (record, index) => {
        return { onDoubleClick: event => this.toSfcDetail(record) }
    }
    /**
     * @description: 列表高度自适应浏览器大小，出现滚动条
     * @param {object} e 事件对象
     */
    getTableScroll = e => {
        this.resizeTable()
        return
        // try {
        //     let { tableOption } = this.state || {}
        //     let appDom = document.querySelector(".ttk-stock-app-statements-sfc-summary-main") //以app为检索范围
        //     let tableWrapperDom = appDom.getElementsByClassName("ant-table-wrapper")[0] //table wrapper包含整个table,table的高度基于这个dom
        //     if (!tableWrapperDom) {
        //         if (e) {
        //             return
        //         }
        //         setTimeout(() => {
        //             this.getTableScroll()
        //         }, 100)
        //         return
        //     }
        //     //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
        //     let theadDom = tableWrapperDom.getElementsByClassName("ant-table-thead")[0]
        //     let tfooterDom = tableWrapperDom.getElementsByClassName("ant-table-footer")[0]
        //     if (tableWrapperDom && theadDom) {
        //         const width = tableWrapperDom.offsetWidth
        //         const height = tableWrapperDom.offsetHeight
        //         const tfooterHeight = tfooterDom ? tfooterDom.offsetHeight : 0
        //         tableOption.y = height - theadDom.offsetHeight - tfooterHeight - 10
        //         this.setState({
        //             tableOption: {
        //                 ...tableOption,
        //                 x: width,
        //                 y: tableOption.y,
        //             },
        //         })
        //     }
        // } catch (err) {
        //     console.log(err)
        // }
    }
    /**
     * 高级筛选查询方法
     * @Author   weiyang.qiu
     * @DateTime 2020-05-25T14:43:49+0800
     * @return   {[type]}                 [description]
     */
    statementsFilterSearch = form => {
        if (form) {
            this.setState(
                {
                    list: [],
                    summary: form.inputValue,
                    // period: form.period,
                    inventoryClassId: form.inventory.id, // 存货科目类型
                    inventoryIndex: form.inventory.index,
                    isExist: form.specialInv, // 无期初存货
                    bInveControl: form.minusInv, // 负库存
                },
                () => {
                    this.load()
                }
            )
        }
    }

    /**
     * @description: 日期转化为moment格式
     * @param {string} dateStr 需要转换格式的日期
     */
    transToMoment = dateStr => moment(dateStr)

    /**
     * @description: 切换月份
     * @param {object} date UI封装日期对象
     * @param {string} dateString 当期日期
     */
    handlMonthChange = (date, dateString) => {
        // this.metaAction.sf('data.period', dateString)
        // this.load()
        this.setState(
            {
                period: dateString,
                endPeriod: dateString,
                list: [],
            },
            () => {
                this.load()
            }
        )
    }

    handlMonthRangeChange = range => {
        // this.metaAction.sf('data.period', dateString)
        // this.load()
        this.setState(
            {
                period: range[0],
                endPeriod: range[1],
                list: [],
            },
            () => {
                this.load()
            }
        )
    }

    /**
     * @description: 切换存货类型
     * @param {string} value 存货类型id
     */
    InventoryClassChange = value => {
        // this.metaAction.sf('data.inventoryClassId', value)
        // this.load()
        this.setState(
            {
                inventoryClassId: value,
                list: [],
            },
            () => {
                this.load()
            }
        )
    }

    /**
     * @description: 页面头部渲染
     * @return: 返回页面头部JSX
     */
    renderHeader = () => {
        const {
            pageTitle,
            startPeriod,
            orgId,
            inventoryClassId,
            defaultPeriod,
            period,
            endPeriod,
            summary,
            isExist,
            bInveControl,
            selectOptions,
            inventoryIndex,
        } = this.state

        if (this.component.props.showInModal) {
            // return null
            return (
                <div className="ttk-stock-app-statements-sfc-summary-header">
                    <StatementsFilter
                        inputValue={summary}
                        useInventory={{ value: inventoryIndex, orgId: orgId }}
                        onSearch={this.statementsFilterSearch}
                    />
                </div>
            )
        }

        return (
            <div className="ttk-stock-app-statements-sfc-summary-header">
                <div className="ttk-stock-app-statements-sfc-summary-header-others">
                    <div className="ttk-stock-app-statements-sfc-summary-header-others-left">
                        <StatementsFilter
                            inputValue={summary}
                            useInventory={{ value: inventoryIndex, orgId: orgId }}
                            useSpecialInv={{ value: isExist }}
                            useMinusInv={{ value: bInveControl }}
                            onSearch={this.statementsFilterSearch}
                        />
                        <MonthRangePicker
                            periodRange={[period, endPeriod]}
                            disabledDate={this.state.startPeriod}
                            handleChange={this.handlMonthRangeChange}
                            className="ttk-stock-app-statements-sfc-summary-header-others-monthRangePicker"
                        />
                    </div>
                    <div className="ttk-stock-app-statements-sfc-summary-header-others-right">
                        <PrintButton {...this.getPrintProps()} />
                        <Button
                            style={{ marginLeft: 10 }}
                            type="default"
                            onClick={this.handleOutport}
                            disabled={this.disabledDate()}>
                            导出
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
    renderSummaryRow = () => {
        const { qcNum, qcBal, rkNum, rkBal, ckNum, ckBal, qmNum, qmBal } = this.state.summaryRowData

        let rowData = ["", qcNum, "", qcBal, rkNum, "", rkBal, ckNum, "", ckBal, qmNum, "", qmBal]
        const summaryRows = {
            height: 37,
            rows: null,
            rowsComponent: columns => {
                let titleWidth = 0,
                    rowWidth = []
                columns.forEach((el, i) => {
                    if (i < 4) {
                        titleWidth += el.width
                        i == 3 && rowWidth.push({ width: titleWidth })
                    } else {
                        el.children
                            ? el.children.forEach(item => {
                                  rowWidth.push({
                                      width: item.width,
                                      dataIndex: item.dataIndex,
                                      flexGrow: item.flexGrow,
                                  })
                              })
                            : rowWidth.push({
                                  width: el.width,
                                  dataIndex: el.dataIndex,
                                  flexGrow: el.flexGrow,
                              })
                    }
                })
                let rows = rowData.map((el, i) => {
                    let width = rowWidth[i].width + "px"
                    let flexGrow = rowWidth[i].flexGrow
                    if (i == 0) {
                        return (
                            <div className="vt-summary left" style={{ width }}>
                                合计
                            </div>
                        )
                    } else {
                        let textAlign = rowWidth[i].dataIndex.includes("Num") ? "left" : ""
                        return (
                            <div style={{ width, textAlign, flexGrow }} title={rowData[i]}>
                                {rowData[i]}
                            </div>
                        )
                    }
                })
                return <div className="vt-summary row virtual-table-summary">{rows}</div>
            },
        }

        return summaryRows
    }
    /**
     * @description: 本页面渲染
     * @return: 返回本页面组件JSX
     */
    render() {
        let { isUnOpen, isVisible, loading, list, tableOption } = this.state
        const cols = this.renderColumns()

        const nowTime = new Date().getTime() + Math.random()

        return (
            <React.Fragment>
                {loading ? (
                    <div className="ttk-stock-app-spin">
                        <Spin
                            className="ttk-stock-app-inventory-picking-fast-spin-icon"
                            wrapperClassName="spin-box add-stock-orders purchase-ru-ku-add-alert"
                            spinning={true}
                            size="large"
                            tip="数据加载中......"
                            delay={10}></Spin>
                    </div>
                ) : null}
                {isUnOpen ? (
                    <AppLoader
                        className="ttk-stock-weikaiqi"
                        name="ttk-stock-app-weikaiqi"></AppLoader>
                ) : null}
                {!isUnOpen && isVisible ? this.renderHeader() : null}
                {!isUnOpen && isVisible ? (
                    <div className="ttk-stock-app-statements-sfc-summary-main mk-layout">
                        {list && list.length ? (
                            <VirtualTable
                                // className='ttk-stock-app-statements-sfc-summary-main-table ttk-scm-app-authorized-invoice-list mk-layout'
                                columns={cols}
                                dataSource={list}
                                key={nowTime}
                                rowKey="inventoryId"
                                style={{ width: `${tableOption.x - 2}px` }}
                                scroll={{
                                    y: tableOption.y - 78,
                                    x: this.sumWidth && this.sumWidth + 2,
                                }}
                                summaryRows={this.renderSummaryRow()}
                                bordered
                                onRow={this.handleOnRow}
                                width={tableOption.x - 2}
                                headerHeight={78}
                                allowResizeColumn
                            />
                        ) : (
                            <Table
                                className="ttk-stock-app-statements-sfc-summary-main-table empty mk-layout"
                                columns={cols}
                                dataSource={list}
                                key="inventoryId"
                                rowKey="inventoryId"
                                bordered={true}
                                style={{ width: "100%" }}
                                scroll={tableOption}
                                bordered
                                showHeader={true}
                                pagination={false}
                                scroll={{ x: "100%" }}
                                emptyShowScroll={true}
                                footer={null}
                                // onRow={this.handleOnRow}
                            />
                        )}
                    </div>
                ) : null}
            </React.Fragment>
        )
    }
}

export default StockAppStatementsSfcSummary
