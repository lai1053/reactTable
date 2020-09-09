import React from "react"
import { Table, DatePicker, Button } from "edf-component"
import { AppLoader } from "edf-meta-engine"
import utils from "edf-utils"
import { message, Spin } from "antd"
import moment from "moment"
import {
    getInfo,
    transToNum,
    formatSixDecimal,
    denyClick,
    addEvent,
    removeEvent,
    canClickTarget,
} from "../commonAssets/js/common"
import VirtualTable from "../../invoices/components/VirtualTable/index"
import { fromJS } from "immutable"
import PrintButton from "./common/PrintButton"
const tableColumns = [
    {
        title: "存货编号",
        dataIndex: "inventoryCode",
        key: "inventoryCode",
        width: 75,
        minWidth: 70,
        align: "left",
    },
    {
        title: "存货名称",
        dataIndex: "inventoryName",
        key: "inventoryName",
        align: "left",
        width: 120,
        flexGrow: 1,
        minWidth: 70,
    },
    {
        title: "规格型号",
        dataIndex: "inventoryGuiGe",
        key: "inventoryGuiGe",
        width: 85,
        minWidth: 70,
        align: "left",
    },
    {
        title: "单位",
        dataIndex: "inventoryUnit",
        key: "inventoryUnit",
        width: 50,
        minWidth: 50,
        align: "center",
    },
    {
        title: "完工入库数",
        dataIndex: "putInNum",
        key: "putInNum",
        width: 70,
        minWidth: 70,
        align: "left",
    },
    {
        title: "单价",
        dataIndex: "price",
        key: "price",
        width: 90,
        minWidth: 70,
        align: "right",
    },
    {
        title: "完工成本",
        dataIndex: "putInCost",
        key: "putInCost",
        width: 90,
        minWidth: 70,
        align: "right",
    },
    {
        title: "百分比",
        dataIndex: "costRate",
        key: "costRate",
        width: 60,
        minWidth: 70,
        align: "right",
    },
    {
        title: "成本构成",
        children: [
            {
                title: "直接材料",
                dataIndex: "materialFee",
                key: "materialFee",
                width: 90,
                minWidth: 70,
                align: "right",
            },
            {
                title: "直接人工",
                dataIndex: "personCost",
                key: "personCost",
                width: 90,
                minWidth: 70,
                align: "right",
            },
            {
                title: "制造费用",
                dataIndex: "directCost",
                key: "directCost",
                width: 90,
                minWidth: 70,
                align: "right",
            },
            {
                title: "其他费用",
                dataIndex: "otherexpenses",
                key: "otherexpenses",
                width: 90,
                minWidth: 70,
                align: "right",
            },
        ],
    },
]

class StockAppStatementsProductionCost extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pageTitle: "生产成本计算表", // 页面title
            loading: false, // 表格loading
            isGenVoucher: false,
            tableOption: {
                // 表格定位对象
                x: 1000,
                y: 400,
            },
            isUnOpen: false,
            isVisible: false,
            list: [], // 表格数据list
            period: "2019-08", // 会计期间
            sumRowData: {},
            tableColumns: fromJS(tableColumns).toJS(),
        }
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.params = props.params || {}
    }

    componentWillMount() {}

    componentDidMount = () => {
        if (!this.props.lastState) {
            this.load(true)
        } else {
            this.setState({ ...this.props.lastState })
            this.params = this.props.lastParams
        }
        this.resizeTable()
        addEvent(window, "resize", ::this.resizeTable)
    }

    componentWillUnmount() {
        this[`deny-statements-production-cost-outportClickFlag`] = null
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
        let currentPeriod, resp
        const { id = "", vatTaxpayer = "2000010002", name, periodDate = "" } =
            this.metaAction.context.get("currentOrg") || {}
        if (isInitial) {
            // 前置校验 start
            // if (this.params === undefined || isTabLoad === true) {
            if (Object.keys(this.params).length === 0 || isTabLoad === true) {
                const newInfo = await getInfo({
                    period: sessionStorage["stockPeriod" + name] || periodDate,
                })
                this.params = Object.assign({}, newInfo)
                this.params.period = sessionStorage["stockPeriod" + name] || periodDate
            }
            this.params.isUnOpen = this.params.state !== 1
            // this.setState({
            //     isUnOpen: this.params.isUnOpen,
            //     isVisible: true
            // })
            // this.metaAction.sf('data.isUnOpen', this.params.isUnOpen)
            // this.metaAction.sf('data.isVisible', true)
            currentPeriod = sessionStorage["stockPeriod" + name] || periodDate
            const startPeriod = (this.params && this.params.startPeriod) || ""
            // this.injections.reduce('initInfo', currentPeriod, this.params.isUnOpen, startPeriod)
            this.setState(
                {
                    isUnOpen: this.params.isUnOpen,
                    isVisible: true,
                    period: currentPeriod,
                    startPeriod: startPeriod,
                },
                () => {
                    if (this.params.isUnOpen) return
                }
            )
        } else {
            const newInfo = await getInfo({
                period: this.state.period,
            })
            this.params = {
                ...newInfo,
                period: this.state.period,
                isUnOpen: newInfo.state !== 1,
            }
            this.setState({
                isUnOpen: this.params.isUnOpen,
                startPeriod: this.params.startPeriod,
            })
            if (this.params.isUnOpen) return
        }

        const time = currentPeriod || this.state.period
        if ((this.params && this.params.inveBusiness == "1") || this.params === undefined) {
            // 如果是工业自行生产才有这个页面
            if (!this.params.isCompletion && !this.params.isProductShare) {
                this.metaAction.toast("warning", "请先进行完工入库和生成成本分配处理")
                this.setState({
                    list: [],
                })
                return
            } else if (!this.params.isCompletion) {
                this.metaAction.toast("warning", "请先进行完工入库处理！")
                this.setState({
                    list: [],
                })
                return
            } else if (!this.params.isProductShare) {
                this.metaAction.toast("warning", "请先进行生产成本分配处理！")
                this.setState({
                    list: [],
                })
                return
            }

            this.setState({ loading: true })
            resp = await this.webapi.stock.queryList({
                orgId: id || "", //--企业id，必填
                type: (this.params && this.params.endCostType) || 0, //"endCostType":0, 以销定产0、传统生产1
                period: time || "", //--会计期间，必填
                enableBOMFlag: 1,
                auxiliaryMaterialAllocationMark:
                    (this.params && this.params.auxiliaryMaterialAllocationMark) || 0,
            })
            this.setState({ loading: false })
        } else {
            message.destroy()
            message.warning("该企业为纯商业性质企业，没有生产成本计算表，请自行跳转页面", 3)
        }

        let dataList = []
        if (
            resp &&
            Object.prototype.toString.call(resp.produceCostSheetDtoList) === "[object Array]"
        ) {
            resp.produceCostSheetDtoList.slice(0).map(item => {
                // const regExp1 = new RegExp('Num'), regExp2 = new RegExp('Price'), regExp3 = new RegExp('Balance')
                const copyItem = { ...item }
                for (const v in item) {
                    // copyItem[v] = ( regExp1.test(v) || regExp2.test(v) || regExp3.test(v) || v==='diffCost' ) ? utils.number.format(item[v], 2) : item[v]
                    if (["putInNum", "price"].includes(v)) {
                        copyItem[v] = copyItem[v] ? formatSixDecimal(copyItem[v]) : ""
                    } else if (
                        [
                            "putInCost",
                            "materialFee",
                            "personCost",
                            "directCost",
                            "otherexpenses",
                        ].includes(v)
                    ) {
                        copyItem[v] = copyItem[v] ? utils.number.format(item[v], 2) : ""
                    }
                    if (v === "costRate") {
                        //百分比格式化
                        copyItem[v] = (item[v] * 100).toFixed(2) + "%"
                    }
                }
                dataList.push(copyItem)
                return item
            })
        }
        this.setState({ list: dataList }, () => {
            this.computeSumRowsData()
        })
        // setTimeout(() => { this.getTableScroll() }, 100)
    }

    // 计算合计行
    computeSumRowsData = () => {
        const list = this.state.list
        let putInNumSum = 0, // 库存数量
            putInCostSum = 0, // 库存金额
            costRateSum = 0, // 销售数量
            materialFeeSum = 0, // 销售金额
            personCostSum = 0, // 生产数量
            directCostSum = 0, // 生产成本金额
            otherexpensesSum = 0
        // 累计每一列的数目
        for (const item of list) {
            putInNumSum = (transToNum(item.putInNum) + transToNum(putInNumSum)).toFixed(6)
            putInCostSum = (transToNum(item.putInCost) + transToNum(putInCostSum)).toFixed(2)
            costRateSum = (transToNum(item.costRate) + transToNum(costRateSum)).toFixed(2) //百分位，保留两位小数
            materialFeeSum = (transToNum(item.materialFee) + transToNum(materialFeeSum)).toFixed(2)
            personCostSum = (transToNum(item.personCost) + transToNum(personCostSum)).toFixed(2)
            directCostSum = (transToNum(item.directCost) + transToNum(directCostSum)).toFixed(2)
            otherexpensesSum = (
                transToNum(item.otherexpenses) + transToNum(otherexpensesSum)
            ).toFixed(2)
        }
        // 格式化
        const putInNum = formatSixDecimal(putInNumSum),
            putInCost = utils.number.format(transToNum(putInCostSum), 2),
            costRate = formatSixDecimal(costRateSum),
            materialF = utils.number.format(transToNum(materialFeeSum), 2),
            personCost = utils.number.format(transToNum(personCostSum), 2),
            directCost = utils.number.format(transToNum(directCostSum), 2),
            otherexpen = utils.number.format(transToNum(otherexpensesSum), 2)

        this.setState({
            sumRowData: {
                putInNum,
                putInCost,
                costRate,
                materialF,
                personCost,
                directCost,
                otherexpen,
            },
        })
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
        this.setState(
            {
                period: dateString,
            },
            () => {
                this.load()
            }
        )
        // this.metaAction.sf('data.period', dateString)
        // this.load()
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
                codeType: "SCCBJS",
            },
            disabled: !(Array.isArray(list) && list.length > 0),
            getSearchParams: this.getSearchParams,
        }
    }
    getSearchParams = () => {
        const { id, name } = this.metaAction.context.get("currentOrg") || {}
        const { period } = this.state
        return {
            orgId: id || "", //--企业id，必填
            name: name || "", //--企业名称，必填
            period: period || "", //--会计期间，必填
            type: (this.params && this.params.endCostType) || 0, // 结转生产成本0, 结转主营成本1
            enableBOMFlag: 1,
            auxiliaryMaterialAllocationMark:
                (this.params && this.params.auxiliaryMaterialAllocationMark) || 0,
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
     * @description: 重新计算表格宽高
     * @return {object} 表格的宽和表格的高
     */
    resizeTable = () => {
        const ele = document.querySelector(".ttk-stock-app-statements-production-cost")
        let tableW = (ele && ele.offsetWidth - 10) || 0
        let tableH = (ele && ele.offsetHeight - 98 - 10 + 31 + 15) || 0
        tableW = this.dealColWidth(tableW)
        this.setState({
            tableOption: {
                x: tableW,
                y: tableH,
            },
        })
    }

    dealColWidth = tableW => {
        // 1000为初始宽度，12为总列数

        if (tableW <= 1000) {
            return 1000
        }
        let increment = Math.floor((tableW - this.state.tableOption.x) / 12)
        let sumWidth = 0
        let tableColumns = this.state.tableColumns
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
        return sumWidth
    }

    /**
     * @description: 列表高度自适应浏览器大小，出现滚动条
     * @param {object} e 事件对象
     */
    getTableScroll = e => {
        try {
            // let tableOption = this.metaAction.gf('data.tableOption') && this.metaAction.gf('data.tableOption').toJS() || {}
            let { tableOption } = this.state || {}
            let appDom = document.getElementsByClassName(
                "ttk-stock-app-statements-production-cost"
            )[0] //以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName("ant-table-wrapper")[0] //table wrapper包含整个table,table的高度基于这个dom
            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName("ant-table-thead")[0]
            let tbodyDom = tableWrapperDom.getElementsByClassName("ant-table-tbody")[0]
            let tfooterDom = tableWrapperDom.getElementsByClassName("ant-table-footer")[0]

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num =
                    tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight
                const width = tableWrapperDom.offsetWidth
                const height = tableWrapperDom.offsetHeight
                const tfooterHeight = tfooterDom ? tfooterDom.offsetHeight : 0
                if (num < 0) {
                    delete tableOption.y
                    this.setState({
                        tableOption: {
                            ...tableOption,
                            x: width - 20,
                            y: height - theadDom.offsetHeight - 6 - tfooterHeight,
                        },
                    })
                } else {
                    tableOption.y = height - theadDom.offsetHeight - tfooterHeight - 5 //- tfooterHeight
                    if (tbodyDom.offsetHeight === 0) {
                        tableOption.y = height
                    }
                    this.setState({
                        tableOption: {
                            ...tableOption,
                            x: width - 20,
                            y: tableOption.y,
                        },
                    })
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
    /**
     * @description: 页面头部渲染
     * @return: 返回页面头部JSX
     */
    renderHeader = () => {
        const { isUnOpen, isVisible, period, pageTitle, list } = this.state
        return (
            <div className="ttk-stock-app-statements-production-cost-header">
                {/* <h2 className="ttk-stock-app-statements-production-cost-header-title">{pageTitle}</h2> */}
                <div className="ttk-stock-app-statements-production-cost-header-others">
                    <div className="ttk-stock-app-statements-production-cost-header-others-left">
                        <DatePicker.MonthPicker
                            className="ttk-stock-app-statements-production-cost-header-others-monthPicker"
                            disabledDate={this.disabledDate}
                            defaultValue={this.transToMoment(period)}
                            onChange={this.handlMonthChange}></DatePicker.MonthPicker>
                    </div>
                    <div className="ttk-stock-app-statements-production-cost-header-others-right">
                        {Array.isArray(list) && list.length > 0 && (
                            <PrintButton {...this.getPrintProps()} />
                        )}
                        <Button
                            style={{ marginLeft: 10 }}
                            type="default"
                            onClick={this.handleOutport}>
                            导出
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    renderSummaryRows = () => {
        const {
            putInNum,
            putInCost,
            costRate,
            materialF,
            personCost,
            directCost,
            otherexpen,
        } = this.state.sumRowData

        return {
            rows: null,
            rowsComponent: columns => {
                // let col = columns.slice(0, columns.length-1)
                // col = [...col , ...(columns[columns.length-1].children)]
                let col = columns
                let rows = col.map((el, i) => {
                    const colStyle = {
                        width: el.width,
                        flexGrow: el.flexGrow,
                    }
                    switch (i) {
                        case 0:
                            return (
                                <div className="left" style={colStyle}>
                                    合计
                                </div>
                            )
                        case 4:
                            return (
                                <div style={{ ...colStyle, textAlign: "left" }} title={putInNum}>
                                    {putInNum}
                                </div>
                            )
                        case 6:
                            return (
                                <div style={colStyle} title={putInCost}>
                                    {putInCost}
                                </div>
                            )
                        case 7:
                            return (
                                <div style={colStyle} title={costRate + "%"}>
                                    {costRate + "%"}
                                </div>
                            )
                        case 8:
                            return (
                                <div style={colStyle} title={materialF}>
                                    {materialF}
                                </div>
                            )
                        case 9:
                            return (
                                <div style={colStyle} title={personCost}>
                                    {personCost}
                                </div>
                            )
                        case 10:
                            return (
                                <div style={colStyle} title={directCost}>
                                    {directCost}
                                </div>
                            )
                        case 11:
                            return (
                                <div style={colStyle} title={otherexpen}>
                                    {otherexpen}
                                </div>
                            )
                        default:
                            return <div style={colStyle}></div>
                    }
                })
                if (this.state.list.length) {
                    return <div className="vt-summary row">{rows}</div>
                } else {
                    return <div />
                }
            },
            height: this.state.list.length ? 37 : 0,
        }
    }
    /**
     * @description: 本页面渲染
     * @return: 返回本页面组件JSX
     */
    render() {
        const { isUnOpen, isVisible, loading, list, tableOption } = this.state

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
                    <div className="ttk-stock-app-statements-production-cost-main mk-layout">
                        <VirtualTable
                            columns={this.state.tableColumns}
                            dataSource={list}
                            key="inventoryId"
                            rowKey="inventoryId"
                            style={{ width: `${tableOption.x}px` }}
                            scroll={{ x: tableOption.x + 2, y: tableOption.y - 78 }}
                            summaryRows={this.renderSummaryRows()}
                            width={tableOption.x}
                            bordered
                            headerHeight={78}
                            allowResizeColumn
                        />
                    </div>
                ) : null}
            </React.Fragment>
        )
    }
}

export default StockAppStatementsProductionCost
