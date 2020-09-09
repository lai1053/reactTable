import React from "react"
import moment from "moment"
import utils from "edf-utils"
import { message, Spin } from "antd"
import { AppLoader } from "edf-meta-engine"
import { moment as momentUtil } from "edf-utils"
import { formatSixDecimal, denyClick, canClickTarget } from "../commonAssets/js/common"
import VirtualTable from "../../invoices/components/VirtualTable/index"
import { Table, DatePicker, Button } from "edf-component"
import { quantityFormat, addEvent, removeEvent } from "../../invoices/utils/index"
import { throttle } from "edf-utils"
import StatementsFilter from "./common/StatementsFilter"
import { fromJS } from "immutable"
import MonthRangePicker from "./common/MonthRangePicker"
import PrintButton from "./common/PrintButton"
// 销售毛利率分析表
const renderCell = (text, record, index) => {
    // if (record.dataIndex == 'num' || fieldName == 'salePrice' || fieldName == 'costPrice') {
    let txt = ""
    if (["num", "salePrice", "costPrice"].includes(record.dataIndex)) {
        txt = formatSixDecimal(text)
        // return <span
        //             title={formatSixDecimal(text)}
        //         >
        //             {formatSixDecimal(text)}
        //         </span>
    } else {
        txt = typeof text === "number" ? utils.number.format(text, 2) : text
        // const txt = typeof text === 'number' ? utils.number.format(text, 2) : text
        // return <span title={txt}>
        //             {txt}
        //         </span>
    }
    return <span title={txt}>{txt}</span>
}

const columnField = [
    {
        dataIndex: "inventoryCode",
        name: "inventoryCode",
        title: "存货编码",
        width: 80,
    },
    {
        dataIndex: "inventoryName",
        name: "inventoryName",
        title: "存货编码",
        width: 130,
    },
    {
        dataIndex: "inventoryGuiGe",
        name: "inventoryGuiGe",
        title: "规格型号",
        width: 70,
    },
    {
        dataIndex: "inventoryUnit",
        dataIndex: "inventoryUnit",
        title: "单位",
        width: 75,
    },
    {
        dataIndex: "num",
        name: "num",
        title: "存货编码",
        width: 80,
    },
    {
        dataIndex: "income",
        name: "income",
        title: "收入",
        children: [
            {
                dataIndex: "inventoryName",
                name: "inventoryName",
                title: "存货编码",
                width: 80,
            },
            {
                dataIndex: "saleBalance",
                name: "saleBalance",
                title: "存货编码",
                width: 80,
            },
        ],
    },
    {
        dataIndex: "cost",
        name: "cost",
        title: "成本",
        children: [
            {
                dataIndex: "costPrice",
                name: "costPrice",
                title: "单价",
                width: 80,
            },
            {
                dataIndex: "costBalance",
                name: "costBalance",
                title: "金额",
                width: 130,
            },
        ],
    },
    {
        dataIndex: "profit",
        name: "profit",
        title: "毛利",
        width: 80,
    },
    {
        dataIndex: "profitRate",
        name: "profitRate",
        title: "毛利率",
        width: 80,
    },
]

const tableColumns2 = [
    {
        title: "存货编号",
        dataIndex: "inventoryCode",
        key: "inventoryCode",
        fixed: "left",
        isVisible: true,
        width: 100,
        minWidth: 100,
        isMustSelect: false,
        className: "table_td_align_center",
        amount: true,
    },
    {
        title: "存货名称",
        dataIndex: "inventoryName",
        key: "inventoryName",
        // fixed: false,
        isVisible: true,
        isMustSelect: false,
        className: "table_td_align_left",
        amount: true,
    },
    {
        title: "规格型号",
        dataIndex: "inventoryGuiGe",
        key: "inventoryGuiGe",
        // fixed: false,
        isVisible: true,
        width: 85,
        minWidth: 85,
        isMustSelect: false,
        className: "table_td_align_left",
        amount: true,
    },
    {
        title: "单位",
        dataIndex: "inventoryUnit",
        key: "inventoryUnit",
        // fixed: false,
        isVisible: true,
        width: 75,
        minWidth: 75,
        isMustSelect: false,
        className: "table_td_align_center",
        amount: true,
    },
    {
        title: "收入",
        dataIndex: "xxfp",
        key: "xxfp",
        // width: 270,
        // minWidth: 270,
        isVisible: true,
        // isMustSelect: true,
        children: [
            {
                dataIndex: "num",
                title: "数量",
                key: "num",
                // fixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 90,
                className: "table_td_align_left",
                amount: true,
            },
            {
                dataIndex: "salePrice",
                title: "单价",
                key: "salePrice",
                // fixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 90,
                className: "table_td_align_right",
                amount: true,
            },
            {
                key: "saleBalance",
                title: "金额",
                dataIndex: "saleBalance",
                // fixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 90,
                className: "table_td_align_right",
                amount: true,
            },
        ],
    },
    {
        dataIndex: "xxfp",
        title: "成本",
        key: "xxfp",
        isVisible: true,
        // width: 270,
        // minWidth: 270,
        // isMustSelect: true,
        children: [
            {
                dataIndex: "ckNum",
                title: "数量",
                key: "ckNum",
                // fixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 90,
                className: "table_td_align_left",
                amount: true,
            },
            {
                dataIndex: "costPrice",
                title: "单价",
                key: "costPrice",
                // fixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 90,
                className: "table_td_align_right",
                amount: true,
            },
            {
                dataIndex: "costBalance",
                title: "金额",
                key: "costBalance",
                // fixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 90,
                className: "table_td_align_right",
                amount: true,
            },
        ],
    },
    {
        dataIndex: "profit",
        title: "毛利",
        key: "profit",
        // fixed: false,
        isVisible: true,
        width: 90,
        minWidth: 90,
        isMustSelect: false,
        className: "table_td_align_right",
        amount: true,
    },
    {
        dataIndex: "profitRate",
        title: "毛利率",
        key: "profitRate",
        // fixed: false,
        isVisible: true,
        width: 90,
        minWidth: 90,
        isMustSelect: false,
        className: "table_td_align_right",
        amount: true,
    },
]

const tableColumns = [
    {
        title: "存货编号",
        dataIndex: "inventoryCode",
        key: "inventoryCode",
        width: 100,
        minWidth: 70,
        align: "center",
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
        width: 60,
        minWidth: 70,
        align: "center",
        fixed: "left",
    },
    {
        title: "收入",
        children: [
            {
                title: "数量",
                dataIndex: "num",
                key: "num",
                width: 100,
                minWidth: 70,
                align: "left",
            },
            {
                title: "单价",
                dataIndex: "salePrice",
                key: "salePrice",
                width: 100,
                minWidth: 70,
                align: "right",
            },
            {
                title: "金额",
                dataIndex: "saleBalance",
                key: "saleBalance",
                width: 100,
                minWidth: 70,
                align: "right",
            },
        ],
    },
    {
        title: "成本",
        children: [
            {
                title: "数量",
                dataIndex: "ckNum",
                key: "ckNum",
                width: 100,
                minWidth: 70,
                align: "left",
            },
            {
                title: "单价",
                dataIndex: "costPrice",
                key: "costPrice",
                width: 100,
                minWidth: 70,
                align: "right",
            },
            {
                title: "金额",
                dataIndex: "costBalance",
                key: "costBalance",
                width: 100,
                minWidth: 70,
                align: "right",
            },
        ],
    },
    {
        title: "毛利",
        dataIndex: "profit",
        key: "profit",
        width: 90,
        minWidth: 70,
        align: "right",
    },
    {
        title: "毛利率",
        dataIndex: "profitRate",
        key: "profitRate",
        width: 90,
        flexGrow: 1,
        minWidth: 70,
        align: "right",
    },
]

const scrollBarWidth = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
    ? 18
    : /Edge\/(\S+)/.test(navigator.userAgent)
    ? 18
    : 12

class StockAppStatementsSalesGrossPro extends React.Component {
    constructor(props) {
        super(props)
        this.tableColumns = [
            {
                title: "存货编号",
                dataIndex: "inventoryCode",
                key: "inventoryCode",
                width: 100,
                minWidth: 70,
                align: "center",
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
                width: 60,
                minWidth: 70,
                align: "center",
                fixed: "left",
            },
            {
                title: "收入",
                children: [
                    {
                        title: "数量",
                        dataIndex: "num",
                        key: "num",
                        width: 100,
                        minWidth: 70,
                        align: "left",
                    },
                    {
                        title: "单价",
                        dataIndex: "salePrice",
                        key: "salePrice",
                        width: 100,
                        minWidth: 70,
                        align: "right",
                    },
                    {
                        title: "金额",
                        dataIndex: "saleBalance",
                        key: "saleBalance",
                        width: 100,
                        minWidth: 70,
                        align: "right",
                    },
                ],
            },
            {
                title: "成本",
                children: [
                    {
                        title: "数量",
                        dataIndex: "ckNum",
                        key: "ckNum",
                        width: 100,
                        minWidth: 70,
                        align: "left",
                    },
                    {
                        title: "单价",
                        dataIndex: "costPrice",
                        key: "costPrice",
                        width: 100,
                        minWidth: 70,
                        align: "right",
                    },
                    {
                        title: "金额",
                        dataIndex: "costBalance",
                        key: "costBalance",
                        width: 100,
                        minWidth: 70,
                        align: "right",
                    },
                ],
            },
            {
                title: "毛利",
                dataIndex: "profit",
                key: "profit",
                width: 90,
                minWidth: 70,
                align: "right",
            },
            {
                title: "毛利率",
                dataIndex: "profitRate",
                key: "profitRate",
                width: 90,
                flexGrow: 1,
                minWidth: 70,
                align: "right",
            },
        ]
        const xfmcWidth =
            (document.querySelector(".edfx-app-portal-content-main") || document.body).offsetWidth -
            1000
        this.state = {
            scroll: {
                x:
                    (document.querySelector(".edfx-app-portal-content-main") || document.body)
                        .offsetWidth - 16,
            },
            loading: false, // 表格loading
            isUnOpen: false,
            isVisible: false,
            tableOption: {
                // 表格定位对象
                x: 1000,
                // y: 340
            },
            list: [],
            tableKey: 1000,
            // columnData,
            sumData: {
                iNum: 0,
                iPrice: 0,
                iAmount: 0,
                cNum: 0,
                cPrice: 0,
                cAmount: 0,
                grossProfit: 0,
            },
            form: {
                enableDate: "",
                inventoryClassId: "",
            },
            tableColumns: fromJS(this.tableColumns).toJS(),
            // tableCols: tableColumns.map((col, index) => ({
            //     ...col,
            //     width:
            //         col.dataIndex === "inventoryName"
            //             ? xfmcWidth < 0
            //                 ? 100
            //                 : xfmcWidth
            //             : col.width,
            //     minWidth:
            //         col.dataIndex === "inventoryName"
            //             ? xfmcWidth < 0
            //                 ? 100
            //                 : xfmcWidth
            //             : col.minWidth,
            //     onHeaderCell: column => ({
            //         width: column.width,
            //         onResize: throttle(this.handerResize(index), 100),
            //     }),
            // })),
        }
        this.tableClass = "stock-app-statement-salesgross-prifit" + new Date().valueOf()
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.component = props.component || {}
        this.sumWidth = 1190
    }

    componentDidMount() {
        if (!this.props.lastState) {
            this.load()
        } else {
            this.setState({ ...this.props.lastState })
        }
        addEvent(window, "resize", ::this.onResize)
        let timer = setTimeout(() => {
            clearTimeout(timer)
            timer = null
            this.onResize()
        }, 100)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener("onTabFocus", this.load)
        }
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
                            : size.width,
                }
                return { tableCols: nextCols }
            },
            () => {
                const dom = document.querySelector(`.${this.tableClass} .ant-table-body`)
                if (dom && dom.scrollLeft > 0) {
                    dom.scrollLeft = dom.scrollLeft + dom.scrollWidth - this.tableScrollWidth
                    this.tableScrollWidth = dom.scrollWidth
                }
            }
        )
    }
    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     const dom = document.querySelector(
    //         `.${this.tableClass} .ant-table-body .virtual-grid-main-scrollbar`
    //     )
    //     if (dom) {
    //         const tbBody = document.querySelector(`.${this.tableClass} .ant-table-body`),
    //             offsetLeft = tbBody.offsetWidth,
    //             left = offsetLeft - scrollBarWidth + 1 + tbBody.scrollLeft + "px"
    //         dom.style.left = left
    //         dom.style.opacity = 1
    //     }
    // }
    getTableWidth() {
        return this.state.tableCols.map(m => m.width || 0).reduce((a, b) => a + b, 0)
    }

    computeColWidth = tableW => {
        // 1190为初始宽度，12为总列数

        if (tableW <= 1190) {
            this.sumWidth = 1190
            return tableW
        }
        let increment = Math.floor((tableW - this.sumWidth) / 12)
        let sumWidth = 0
        let tableColumns = this.tableColumns
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
        this.setState({ tableColumns })
        this.sumWidth = sumWidth
        return this.sumWidth
    }
    onResize = () => {
        const ele = document.querySelector(
            ".ttk-stock-app-statements-sales-gross-profitRate-backgroundColor"
        )
        let tableW = (ele && ele.offsetWidth - 10) || 0
        const tableH = (ele && ele.offsetHeight - 64) || 0
        let { tableOption } = this.state
        tableW = this.computeColWidth(tableW)
        this.setState({
            tableOption: {
                ...tableOption,
                x: tableW,
                y: tableH,
            },
        })
        // setTimeout(() => {
        //     const cn = `ttk-stock-app-statements-sales-gross-profitRate-backgroundColor`
        //     let table = document.getElementsByClassName(cn)[0]
        //     if (table) {
        //         let h = table.offsetHeight - 160 + 20, //头＋尾＋表头＋滚动条
        //             w = table.offsetWidth,
        //             width = this.getTableWidth(),
        //             scroll = { y: h, x: w > width ? w : width }
        //         if (w > width) {
        //             const tableCols = this.state.tableCols,
        //                 item = tableCols.find(f => f.dataIndex === "inventoryName")
        //             item.width = w - 1000
        //             item.minWidth = w - 1000
        //             this.setState({ scroll, tableCols })
        //         } else {
        //             this.setState({ scroll })
        //         }
        //     } else {
        //         setTimeout(() => {
        //             this.onResize()
        //         }, 100)
        //         return
        //     }
        // }, 100)
    }
    /**
     * @description: 初始化数据
     */
    load = async () => {
        // let name = this.metaAction.context.get('currentOrg').name
        let currentPeriod, stockPeriod
        const { id = "", vatTaxpayer = "2000010002", name, periodDate = "" } =
            this.metaAction.context.get("currentOrg") || {}

        if (
            sessionStorage["stockPeriod" + name] != "undefined" &&
            sessionStorage["stockPeriod" + name]
        ) {
            stockPeriod = sessionStorage["stockPeriod" + name]
        } else {
            sessionStorage["stockPeriod" + name] = periodDate
            stockPeriod = periodDate
        }
        // const currentOrg = await this.webapi.initPeriod()
        // stockPeriod = currentOrg.thisPeriod
        const reqData = await this.webapi.init({ period: stockPeriod, opr: "0" })
        this.motime = reqData.startPeriod //启用时间
        if (sessionStorage["stockPeriod" + name] < reqData.startPeriod) {
            sessionStorage["stockPeriod" + name] = reqData.startPeriod
            stockPeriod = reqData.startPeriod
        }
        // 判断存货是否开启 start
        const isUnOpen = reqData.state !== 1
        // this.metaAction.sf('data.isUnOpen', isUnOpen)
        // this.metaAction.sf('data.isVisible', true)
        this.setState({
            isUnOpen,
            defaultPeriod: stockPeriod,
            isVisible: true,
            motime: reqData.startPeriod,
        })
        if (isUnOpen) return
        // 判断存货是否开启 end
        // this.metaAction.sf('data.loading', false)
        // this.metaAction.sf('data.loading', true)
        // let list = await this.webapi.query({'period': stockPeriod})
        // this.metaAction.sf('data.loading', false)
        // this.injections.reduce('load', list, stockPeriod)
        this.setState({ loading: true })
        const { code, inventoryClassId } = this.state.form
        let list = await this.webapi.query({
            period: stockPeriod,
            endPeriod: stockPeriod,
            orgId: id,
            natureOfTaxpayers: vatTaxpayer,
            code,
            inventoryClassId,
        })
        this.setState({
            list: list && list.length > 0 ? this.dealListData(list) : [],
            loading: false,
            orgId: id,
            natureOfTaxpayers: vatTaxpayer,
            form: {
                ...this.state.form,
                enableDate: stockPeriod,
                endPeriod: stockPeriod,
            },
        })

        // setTimeout(() => { this.getTableScroll() }, 100)
    }

    /**
     * @description: 日期改变reload页面数据
     * @param {string} data 选中日期
     */
    changereload = async range => {
        let form = {
            ...this.state.form,
            enableDate: range[0],
            endPeriod: range[1],
        }
        this.setState({
            loading: true,
            form,
        })
        let list = await this.webapi.query({
            ...form,
            orgId: this.state.orgId,
            natureOfTaxpayers: this.state.natureOfTaxpayers,
            // 'period': momentUtil.stringToMoment(data).format('YYYY-MM')
            period: range[0],
            endPeriod: range[1],
        })
        if (list && list.length > 0) {
            this.setState({
                list: this.dealListData(list),
                loading: false,
            })
        } else {
            this.setState({
                list: [],
                loading: false,
            })
        }
    }

    dealListData = list => {
        let iNum = 0,
            iPrice = 0,
            iAmount = 0,
            cNum = 0,
            cPrice = 0,
            cAmount = 0,
            grossProfit = 0

        list.forEach(e => {
            iNum += e.num
            iPrice += e.salePrice
            iAmount += e.saleBalance
            cNum += e.ckNum
            cPrice += e.costPrice
            cAmount += e.costBalance
            grossProfit += e.profit

            e.num = formatSixDecimal(e.num)
            e.salePrice = formatSixDecimal(e.salePrice)
            e.ckNum = formatSixDecimal(e.ckNum)
            e.costPrice = formatSixDecimal(e.costPrice)
            e.saleBalance = utils.number.format(e.saleBalance, 2)
            e.costBalance = utils.number.format(e.costBalance, 2)
            e.profit = utils.number.format(e.profit, 2)
        })

        this.setState({
            sumData: {
                iNum: formatSixDecimal(iNum),
                iPrice: formatSixDecimal(iPrice),
                iAmount: utils.number.format(iAmount, 2),
                cNum: formatSixDecimal(cNum),
                cPrice: formatSixDecimal(cPrice),
                cAmount: utils.number.format(cAmount, 2),
                grossProfit: utils.number.format(grossProfit, 2),
            },
        })
        return list
    }

    renderSumRow = () => {
        if (!this.state.list.length) {
            return {
                rows: <div />,
                height: 0,
            }
        }
        const { iNum, iPrice, iAmount, cNum, cPrice, cAmount, grossProfit } = this.state.sumData
        let colStyle = {
                padding: "0 10px",
                borderRight: "1px solid #d9d9d9",
                fontSize: "13px",
                fontWeight: "bold",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "right",
            },
            summaryRows = {
                rows: null,
                rowsComponent: columns => {
                    let rowData = ["", iNum, "", iAmount, cNum, "", cAmount, grossProfit, ""]
                    let titleWidth = 0,
                        rowWidth = []
                    columns.forEach((el, i) => {
                        if (i < 4) {
                            titleWidth += el.width
                            i == 3 && rowWidth.push({ width: titleWidth })
                        } else {
                            if (el.children) {
                                el.children.forEach(item => {
                                    rowWidth.push({ width: item.width, dataIndex: item.dataIndex })
                                })
                            } else {
                                rowWidth.push({
                                    width: el.width,
                                    dataIndex: el.dataIndex,
                                    flexGrow: el.flexGrow,
                                })
                            }
                        }
                    })
                    let rows = rowData.map((el, i) => {
                        let width = rowWidth[i].width + "px"
                        let flexGrow = rowWidth[i].flexGrow
                        if (i == 0) {
                            return (
                                <div
                                    className="vt-summary left"
                                    style={{ ...colStyle, width, textAlign: "center" }}>
                                    合计
                                </div>
                            )
                        } else {
                            let textAlign = rowWidth[i].dataIndex.toLowerCase().includes("num")
                                ? "left"
                                : "right"
                            return (
                                <div
                                    style={{ ...colStyle, width, textAlign, flexGrow }}
                                    title={rowData[i]}>
                                    {rowData[i]}
                                </div>
                            )
                        }
                    })
                    return <div className="vt-summary row virtual-table-summary">{rows}</div>
                },
                height: 37,
            }

        return summaryRows
    }

    componentWillUnmount() {
        this[`deny-statements-gross-outportClickFlag`] = null
        removeEvent(window, "resize", ::this.onResize)
        this.props.saveLastData && this.props.saveLastData(fromJS(this.state).toJS())
    }
    getSearchParams = () => {
        let { enableDate, endPeriod, code, inventoryClassId } = this.state.form
        let name = this.metaAction.context.get("currentOrg").name
        return {
            period: momentUtil.stringToMoment(enableDate).format("YYYY-MM"),
            endPeriod,
            name: name,
            code,
            inventoryClassId,
        }
    }

    getPrintProps = () => {
        const list = this.state.list
        return {
            printType: 2,
            params: {
                codeType: "XSMLFX",
            },
            disabled: !(Array.isArray(list) && list.length > 0),
            getSearchParams: this.getSearchParams,
        }
    }
    /**
     * @description: 导出
     */
    reportDetial = async event => {
        event.stopPropagation && event.stopPropagation()
        event.nativeEvent.stopPropagation && event.nativeEvent.stopPropagation()
        if (!this.reportDetialDoing) {
            this.reportDetialDoing = true
            await this.webapi.export(this.getSearchParams())
            this.reportDetialDoing = false
        }
    }
    /**
     * @description: 禁用月份
     * @param {string} currentDate 当前日期
     * @return: 布尔值 是否属于禁用范围
     */
    disabledDate = current => {
        return current < moment(this.state.motime)
        // let startperiod = this.motime
        // return current < moment(startperiod)
    }

    renderCol = () => {
        const columns = columnData //this.state.columnData
        const arr = []
        columns.forEach((item, index) => {
            if (item.isVisible) {
                if (item.children) {
                    const child = [] // 多表头
                    let col
                    item.children.forEach(subItem => {
                        if (subItem.isSubTitle) {
                            child.push({
                                title: subItem.caption,
                                dataIndex: subItem.fieldName,
                                key: subItem.fieldName,
                                width: subItem.width ? subItem.width : "",
                                style: {
                                    minWidth: subItem.minWidth ? subItem.minWidth : "",
                                },
                                className: subItem.className,
                                render: (text, record, index) => {
                                    return this.renderCell(text, record, index, subItem.fieldName)
                                },
                            })
                        }
                    })
                    arr.push({
                        title: item.caption,
                        align: item.align,
                        children: child,
                    })
                } else {
                    arr.push({
                        title: item.caption,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        fixed: item.fixed,
                        className: item.className,
                        render: (text, record, index) => {
                            return this.renderCell(text, record, index, item.fieldName)
                        },
                    })
                }
            }
        })
        return arr
    }
    /**
     * @description: 渲染单元格
     * @return: JSX
     */
    renderCell = (text, record, index, fieldName) => {
        if (fieldName == "num" || fieldName == "salePrice" || fieldName == "costPrice") {
            return <span title={formatSixDecimal(text)}>{formatSixDecimal(text)}</span>
        } else {
            const txt = typeof text === "number" ? utils.number.format(text, 2) : text
            return <span title={txt}>{txt}</span>
        }
    }
    statementsFilterSearch = async form => {
        if (!form) return
        const code = form.inputValue
        const inventoryClassId = form.inventory.id
        this.setState({
            loading: true,
            form: {
                ...this.state.form,
                // enableDate: form.period,
                code,
                inventoryClassId,
            },
            inventoryIndex: form.inventory.index,
        })
        const { orgId, natureOfTaxpayers } = this.state
        let list = await this.webapi.query({
            period: this.state.form.enableDate,
            endPeriod: this.state.form.endPeriod,
            orgId,
            natureOfTaxpayers,
            code,
            inventoryClassId,
        })
        this.setState({
            list: list && list.length ? this.dealListData(list) : [],
            loading: false,
        })
    }
    /**
     * @description: 表格渲染
     * @return: 返回本页面组件JSX
     */
    render() {
        let {
            isUnOpen,
            isVisible,
            loading,
            list,
            tableOption,
            tableKey,
            scroll,
            tableCols,
            defaultPeriod,
            orgId,
            sumData,
        } = this.state
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
                {!isUnOpen && isVisible ? (
                    <div className="ttk-stock-app-statements-sales-gross-profitRate-backgroundColor-content  mk-layout">
                        <div
                            className="ttk-stock-app-statements-sales-gross-profitRate-title"
                            style={{
                                flex: "0 0 50px",
                                // height: "90px",
                                padding: "10px 0",
                                position: "relative",
                                background: "#fff",
                            }}>
                            {/* <div className="ttk-stock-app-inventory-h2">销售毛利率分析表</div> */}

                            <div
                                style={{
                                    position: "absolute",
                                    top: "10px",
                                    left: "10px",
                                }}>
                                <StatementsFilter
                                    inputValue={this.state.form.code}
                                    useInventory={{
                                        value: this.state.inventoryIndex,
                                        orgId: orgId,
                                    }}
                                    onSearch={this.statementsFilterSearch}
                                />
                                <MonthRangePicker
                                    style={{ verticalAlign: "bottom", marginLeft: "8px" }}
                                    periodRange={[
                                        this.state.form.enableDate,
                                        this.state.form.endPeriod,
                                    ]}
                                    disabledDate={this.state.motime}
                                    handleChange={this.changereload}
                                />
                            </div>
                            <div style={{ top: 10, right: 70, position: "absolute" }}>
                                <PrintButton {...this.getPrintProps()} />
                            </div>
                            <Button
                                className="ttk-stock-app-inventory-span"
                                style={{
                                    width: "50px",
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                }}
                                onClick={this.reportDetial}>
                                导出
                            </Button>
                        </div>
                        <div className="ttk-stock-app-statements-sales-gross-profitRate-content mk-layout">
                            {/* <VirtualTable
                                className="ttk-stock-app-statements-sales-gross-profitRate-Body ttk-scm-app-authorized-invoice-list mk-layout"
                                columns={tableCols}
                                dataSource={list}
                                key={tableKey}
                                rowKey="id"
                                style={{ width: tableWidth + "px" }}
                                scroll={scroll}
                                summaryRows={summaryRows}
                                bordered
                                onRow={this.handleOnRow}
                                allowResizeColumn
                            /> */}
                            <VirtualTable
                                // className="ttk-stock-app-statements-sales-gross-profitRate-Body ttk-scm-app-authorized-invoice-list mk-layout"
                                columns={this.state.tableColumns}
                                dataSource={list}
                                key={tableKey}
                                rowKey="id"
                                style={{ width: `${tableOption.x - 2}px` }}
                                scroll={{ y: tableOption.y - 78, x: this.sumWidth + 2 }}
                                summaryRows={this.renderSumRow()}
                                bordered
                                onRow={this.handleOnRow}
                                width={tableOption.x - 2}
                                height={tableOption.y}
                                headerHeight={78}
                                allowResizeColumn
                            />
                        </div>
                    </div>
                ) : null}
            </React.Fragment>
        )
    }
}

export default StockAppStatementsSalesGrossPro
