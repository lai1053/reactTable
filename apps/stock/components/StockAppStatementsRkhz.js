import React from "react"
import { Table, DatePicker, Button, Select } from "edf-component"
import { action as MetaAction, AppLoader } from "edf-meta-engine"
import utils from "edf-utils"
import { message, Spin } from "antd"
import moment from "moment"
import {
    getInfo,
    formatSixDecimal,
    denyClick,
    transToNum,
    addEvent,
    removeEvent,
    canClickTarget,
} from "../commonAssets/js/common"
import VirtualTable from "../../invoices/components/VirtualTable/index"
import StatementsFilter from "./common/StatementsFilter"
import { fromJS } from "immutable"
import MonthRangePicker from "./common/MonthRangePicker"
import PrintButton from "./common/PrintButton"
const tableColumns = [
    {
        title: "业务类型",
        dataIndex: "serviceTypeName",
        key: "serviceTypeName",
        width: 125,
        minWidth: 70,
        align: "left",
        // flexGrow: "12.5%"
    },
    {
        title: "存货编号",
        dataIndex: "inventoryCode",
        key: "inventoryCode",
        width: 125,
        minWidth: 70,
        align: "left",
        // flexGrow: "12.5%"
    },
    {
        title: "存货名称",
        dataIndex: "inventoryName",
        key: "inventoryName",
        width: 125,
        flexGrow: 1,
        minWidth: 70,
        align: "left",
        // flexGrow: "12.5%"
    },
    {
        title: "规格型号",
        dataIndex: "inventoryGuiGe",
        key: "inventoryGuiGe",
        width: 125,
        minWidth: 70,
        align: "left",
        // flexGrow: "12.5%"
    },
    {
        title: "单位",
        dataIndex: "inventoryUnit",
        key: "inventoryUnit",
        width: 125,
        minWidth: 70,
        align: "center",
        // flexGrow: "12.5%"
    },
    {
        title: "数量",
        dataIndex: "num",
        key: "num",
        width: 125,
        minWidth: 70,
        align: "left",
        // flexGrow: "12.5%"
    },
    {
        title: "单价",
        dataIndex: "price",
        key: "price",
        width: 125,
        minWidth: 70,
        align: "right",
        // flexGrow: "12.5%"
    },
    {
        title: "金额",
        dataIndex: "balance",
        key: "balance",
        align: "right",
        width: 125,
        minWidth: 70,
        // flexGrow: "12.5%"
    },
]

const tableColumnsTotal = [
    {
        title: "业务类型",
        dataIndex: "serviceTypeNameTotal",
        key: "serviceTypeNameTotal",
        width: 145,
        align: "left",
    },
    {
        title: "存货编号",
        dataIndex: "inventoryCodeTotal",
        key: "inventoryCodeTotal",
        width: 145,
        align: "left",
    },
    {
        title: "存货名称",
        dataIndex: "inventoryNameTotal",
        key: "inventoryNameTotal",
        width: 145,
        align: "left",
    },
    {
        title: "规格型号",
        dataIndex: "inventoryGuiGeTotal",
        key: "inventoryGuiGeTotal",
        width: 145,
        align: "left",
    },
    {
        title: "单位",
        dataIndex: "inventoryUnitTotal",
        key: "inventoryUnitTotal",
        width: 145,
        align: "center",
    },
    {
        title: "数量",
        dataIndex: "numTotal",
        key: "numTotal",
        width: 145,
        align: "right",
    },
    {
        title: "单价",
        dataIndex: "priceTotal",
        key: "priceTotal",
        width: 145,
        align: "right",
    },
    {
        title: "金额",
        dataIndex: "balanceTotal",
        key: "balanceTotal",
        align: "right",
        width: 145,
    },
]
class StockAppStatementsRkhz extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false, // 表格loading
            pageTitle: "入库汇总表", // 页面title
            tableOption: {
                // 表格定位对象
                x: "100%",
                y: 400,
            },
            isUnOpen: false,
            isVisible: false,
            inventoryClassId: "",
            selectOptions: [], // 存货类型select list
            serviceTypeList: [], // 业务类型select list
            list: [], // 表格数据list
            period: "2019-08", // 会计期间
            totalNum: "",
            totalBalance: "",
            serviceTypeId: "",
            obj: {
                tableW: "",
                tableH: "",
            },
        }
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.params = props.params || {}
    }

    componentWillMount() {}
    //按比例重新计算列宽度
    renderTableColumns = () => {
        let sumWidth = 0
        tableColumns.forEach(item => {
            if (item && !item.children) {
                sumWidth += item.width
            } else if (item.children) {
                for (let col of item.children) {
                    sumWidth += col.width
                }
            }
        })
        let rate = utils.number.round(this.tableColumnsWidth / sumWidth, 6)
        let arr = []
        tableColumns.forEach(item => {
            if (item && !item.children) {
                item.width = Math.floor(item.width * rate)
                arr.push(item)
            } else if (item.children) {
                for (let col of item.children) {
                    col.width = Math.floor(col.width * rate)
                }
                arr.push(item)
            }
        })
        return arr
    }

    componentDidMount = (nextprops, nextstate) => {
        if (!this.props.lastState) {
            this.load(true)
        } else {
            this.setState({ ...this.props.lastState })
            this.params = this.props.lastParams
        }
        this.resizeTable(true) //初始化
        addEvent(window, "resize", ::this.resizeTable)
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    componentWillUnmount = () => {
        removeEvent(window, "resize", ::this.resizeTable)
        this[`deny-statements-rkhz-outportClickFlag`] = null
        this.props.saveLastData &&
            this.props.saveLastData(fromJS(this.state).toJS(), fromJS(this.params).toJS())
    }

    resizeTable = init => {
        const eleH = document.querySelector(".ttk-stock-app-statements-rkhz")
        this.tableColumnsWidth = eleH.offsetWidth - 10
        let tableW = (eleH && eleH.offsetWidth - 10) || 0
        tableW = tableW < 800 ? 800 : tableW
        const tableH = (eleH && eleH.offsetHeight - 160 + 31 + 15) || 0
        tableW = this.dealColWidth(tableW)
        const obj = { tableH, tableW }
        this.setState({ obj })
    }

    dealColWidth = tableW => {
        const width = Math.floor(tableW / 8)
        tableColumns.forEach(el => {
            el.width = width
        })
        return width * tableColumns.length
    }

    // 列合计
    _calColumnTotal = () => {
        const allList = this.state.list.slice(0)
        let numTotal = 0,
            balanceTotal = 0
        allList.map(v => {
            numTotal += transToNum(v.num)
            balanceTotal += transToNum(v.balance)
        })
        numTotal = Number(numTotal.toFixed(6))
        balanceTotal = balanceTotal.toFixed(2)
        return {
            numTotal,
            balanceTotal,
        }
    }

    /**
     * @description: 页面尾部渲染
     * @return: 返回页面尾部JSX
     */
    renderFooter = () => {
        const { numTotal, balanceTotal } = this._calColumnTotal()
        const columns = tableColumnsTotal.concat()
        let list = [
            {
                serviceTypeNameTotal: "合计",
                inventoryUnitTotal: "", //--存货单位
                inventoryCodeTotal: "", //--编码
                inventoryNameTotal: "", //--名称
                inventoryGuiGeTotal: "", //--规格
                numTotal: formatSixDecimal(utils.number.format(numTotal, 6)),
                priceTotal: "",
                balanceTotal: utils.number.format(balanceTotal, 2),
            },
        ]
        return (
            <div className="table-footer-div">
                <Table
                    columns={columns}
                    dataSource={list}
                    rowKey={"inventoryCodeTotal"}
                    bordered={true}
                    showHeader={false}
                    pagination={false}
                    footer={null}
                />
            </div>
        )
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
                orgId: id,
                isUnOpen: this.params.isUnOpen,
                isVisible: true,
                period: currentPeriod,
                endPeriod: currentPeriod,
                startPeriod: startPeriod,
                defaultPeriod: currentPeriod,
                inveBusiness: this.params.inveBusiness,
            })
            if (this.params.isUnOpen) return // 前置校验 end
        }

        const time = currentPeriod || this.state.period
        const stockTypeId = isInitial ? "" : this.state.inventoryClassId
        const serviceTypeId = isInitial ? "" : this.state.serviceTypeId

        this.setState({ loading: true })
        let resp = await this.webapi.stock.queryList({
            orgId: id || "", //--企业id，必填
            serviceTypeId: serviceTypeId || "", //--业务类型id
            inventoryClassId: stockTypeId || "", //--存货类型id
            period: time || "", //--会计期间，必填
            endPeriod: currentPeriod || this.state.endPeriod,
            natureOfTaxpayers: vatTaxpayer, //--纳税人性质
            code: this.state.code,
        })
        let dataList = []
        if (resp) {
            if (
                Object.prototype.toString.call(resp.repOutInSummarySubDtoList) === "[object Array]"
            ) {
                dataList = resp.repOutInSummarySubDtoList.slice(0).map(item => {
                    item.price = formatSixDecimal(utils.number.format(item.price, 6))
                    item.balance = utils.number.format(item.balance, 2)
                    item.num = formatSixDecimal(utils.number.format(item.num, 6))
                    // dataList.push(item)
                    return item
                })
            }
        }
        this.setState({
            loading: false,
            list: dataList,
            totalNum:
                this.sum(resp.repOutInSummarySubDtoList, "num") === 0
                    ? 0
                    : utils.number.format(this.sum(resp.repOutInSummarySubDtoList, "num"), 6),
            totalBalance:
                this.sum(resp.repOutInSummarySubDtoList, "balance") === 0
                    ? 0
                    : utils.number.format(this.sum(resp.repOutInSummarySubDtoList, "balance"), 2),
        })
        //如果是页面刷新或者初始化时，需要请求存货列表
        // if (isInitial) {
        //     this.reqInventoryList()
        //     this.reqServiceTypeList(this.params.inveBusiness)
        // }

        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }
    /**
     * @description: 请求业务类型科目
     */
    reqServiceTypeList = async typeFlag => {
        let serviceTypeList = await this.webapi.stock.getServiceTypeList({
            inveBusiness: typeFlag,
        }) // 业务类型
        if (serviceTypeList) {
            serviceTypeList.splice(0, 0, { id: "", name: "全部" })
            this.setState({
                serviceTypeList: serviceTypeList,
            })
        } else {
            this.metaAction.toast("error", serviceTypeList.message)
        }
    }
    /**
     * @description: 请求存货科目
     */
    reqInventoryList = async () => {
        let { id } = this.metaAction.context.get("currentOrg")
        let inventoryList = await this.webapi.stock.queryAll({
            orgId: id,
        })
        if (inventoryList) {
            inventoryList.splice(0, 0, {
                id: "",
                name: "全部",
            })
            this.setState({
                selectOptions: inventoryList,
            })
        } else {
            this.metaAction.toast("error", inventoryList.message)
        }
    }

    // 列求和
    sum = (arr, field) => {
        const ret = arr.reduce((total, currentVal, currentIndex, arr) => {
            const tranferNum = currentVal[field].toString().replace(/,/g, "")
            return total + parseFloat(tranferNum)
        }, 0)
        return ret
    }
    /**
     * @description: 禁用月份
     * @param {string} currentDate 当前日期
     * @return: 布尔值 是否属于禁用范围
     */
    disabledDate = currentDate => {
        const currentDateStr = moment(currentDate).format("YYYY-MM")
        const { startPeriod } = this.state || ""
        return currentDateStr.valueOf() < startPeriod.valueOf()
    }

    getPrintProps = () => {
        const list = this.state.list
        return {
            printType: 2,
            params: {
                codeType: "RKHZ",
            },
            disabled: !(Array.isArray(list) && list.length > 0),
            getSearchParams: this.getSearchParams,
        }
    }
    getSearchParams = () => {
        var { id, name, vatTaxpayer } = this.metaAction.context.get("currentOrg") || {}
        var { inventoryClassId, period, endPeriod, serviceTypeId, code } = this.state
        return {
            orgId: id || "", //--企业id，必填
            orgName: name || "", //--企业名称，必填
            serviceTypeId: serviceTypeId || "", //--业务类型id
            inventoryClassId: inventoryClassId || "", //--存货类型id
            period: period || "", //--会计期间，必填
            endPeriod,
            natureOfTaxpayers: vatTaxpayer, //--纳税人性质
            code,
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
     * @description: 列表高度自适应浏览器大小，出现滚动条
     * @param {object} e 事件对象
     */
    getTableScroll = e => {
        try {
            // let tableOption = this.metaAction.gf('data.tableOption') && this.metaAction.gf('data.tableOption').toJS() || {}
            let { tableOption } = this.state || {}
            let appDom = document.getElementsByClassName("ttk-stock-app-statements-rkhz")[0] //以app为检索范围
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
                        tableOption.y = height - 28 // 有合计底部的情况下
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
     * 高级查询
     * @Author   weiyang.qiu
     * @DateTime 2020-05-25T17:37:19+0800
     * @param    {[type]}                 form [description]
     * @return   {[type]}                      [description]
     */
    statementsFilterSearch = form => {
        if (form) {
            this.setState(
                {
                    list: [],
                    code: form.inputValue,
                    // period: form.period,
                    inventoryClassId: form.inventory.id, // 存货科目类型
                    serviceTypeId: form.business.id,
                    inventoryIndex: form.inventory.index,
                    businessIndex: form.business.index,
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
        this.setState(
            {
                period: dateString,
                list: [],
            },
            () => {
                this.load()
            }
        )
    }

    handlMonthRangeChange = range => {
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
     * @description: 页面头部渲染
     * @return: 返回页面头部JSX
     */
    renderHeader = () => {
        const {
            period,
            endPeriod,
            pageTitle,
            startPeriod,
            defaultPeriod,
            inventoryClassId,
            orgId,
            serviceTypeId,
            inveBusiness,
            inventoryIndex,
            businessIndex,
            code,
        } = this.state
        return (
            <div className="ttk-stock-app-statements-rkhz-header">
                {/* <h2 className="ttk-stock-app-statements-rkhz-header-title">{pageTitle}</h2> */}
                <div className="ttk-stock-app-statements-rkhz-header-others">
                    <div className="ttk-stock-app-statements-rkhz-header-others-left">
                        <StatementsFilter
                            inputValue={code}
                            useInventory={{ value: inventoryIndex, orgId: orgId }}
                            useBusiness={{ value: businessIndex, inveBusiness, type: "insummary" }}
                            onSearch={this.statementsFilterSearch}
                        />
                        <MonthRangePicker
                            periodRange={[period, endPeriod]}
                            disabledDate={this.state.startPeriod}
                            handleChange={this.handlMonthRangeChange}
                            className="ttk-stock-app-statements-rkhz-header-others-monthRangePicker"
                        />
                    </div>
                    <div className="ttk-stock-app-statements-rkhz-header-others-right">
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
    /**
     * @description: 页面尾部渲染
     * @return: 返回页面尾部JSX
     */
    // renderFooter = () => {
    //     const { totalNum, totalBalance } = this.state
    //     return (
    //         <div className="ttk-stock-app-statements-rkhz-footer">
    //             合计 <span style={{paddingLeft: "10px"}}>数量: </span> <span style={{ color: '#999', paddingLeft: "8px", paddingRight: '10px' }}>{totalNum}</span> 金额：<span style={{ color: '#999', paddingLeft: "8px" }}>{totalBalance}</span> (元)
    //         </div>
    //     )
    // }
    renderSummaryRows = () => {
        const { numTotal, balanceTotal } = this._calColumnTotal()

        return {
            rows: null,
            rowsComponent: columns => {
                const rows = columns.map((el, i) => {
                    const colStyle = {
                        width: el.width,
                        flexGrow: el.flexGrow,
                    }
                    switch (i) {
                        case 0:
                            return <div style={colStyle}>合计</div>
                        case 5:
                            return (
                                <div style={{ ...colStyle, textAlign: "left" }}>
                                    {formatSixDecimal(numTotal, 6)}
                                </div>
                            )
                        case 7:
                            return (
                                <div style={{ ...colStyle, paddingRight: "20px" }}>
                                    {formatSixDecimal(balanceTotal, 6)}
                                </div>
                            )
                        default:
                            return <div style={colStyle}></div>
                    }
                })
                return <div className="table-summary-row vt-summary row">{rows}</div>
            },
            height: 37,
        }
    }

    /**
     * @description: 本页面渲染
     * @return: 返回本页面组件JSX
     */
    render() {
        const { isUnOpen, isVisible, loading, list, tableOption, obj } = this.state
        const nowTime = new Date().getTime() + Math.random()
        return (
            <React.Fragment>
                {loading && (
                    <div className="ttk-stock-app-spin">
                        <Spin
                            className="ttk-stock-app-inventory-picking-fast-spin-icon"
                            wrapperClassName="spin-box add-stock-orders purchase-ru-ku-add-alert"
                            spinning={true}
                            size="large"
                            delay={10}
                            tip="数据加载中......"></Spin>
                    </div>
                )}
                {isUnOpen && (
                    <AppLoader
                        name="ttk-stock-app-weikaiqi"
                        className="ttk-stock-weikaiqi"></AppLoader>
                )}
                {!isUnOpen && isVisible ? this.renderHeader() : null}
                {!isUnOpen && isVisible ? (
                    <div className="ttk-stock-app-statements-rkhz-main mk-layout">
                        {list && list.length ? (
                            <VirtualTable
                                className="ttk-stock-app-statements-rkhz-main-table mk-layout"
                                columns={this.renderTableColumns()}
                                dataSource={list}
                                key={nowTime}
                                rowKey="inventoryId"
                                style={{ width: `${obj.tableW}px` }}
                                scroll={{ y: obj.tableH, x: obj.tableW + 2 }}
                                width={obj.tableW}
                                summaryRows={this.renderSummaryRows()}
                                bordered
                                allowResizeColumn
                            />
                        ) : (
                            <Table
                                className="ttk-stock-app-statements-rkhz-main-table mk-layout"
                                columns={tableColumns}
                                dataSource={list}
                                key="inventoryId"
                                rowKey="inventoryId"
                                bordered={true}
                                showHeader={true}
                                pagination={false}
                                scroll={tableOption}
                                emptyShowScroll={true}
                                footer={null}
                            />
                        )}
                    </div>
                ) : null}
            </React.Fragment>
        )
    }
}

export default StockAppStatementsRkhz
