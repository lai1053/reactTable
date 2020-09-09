import React from "react"
import { action as MetaAction, AppLoader } from "edf-meta-engine"
import config from "./config"
import { DatePicker, Select, Button, Table } from "edf-component"
import { Spin } from "antd"
import moment from "moment"
import VirtualTable from "../../invoices/components/VirtualTable/index"
import { denyClick, formatSixDecimal, canClickTarget } from "../commonAssets/js/common"
import StatementsFilter from "../components/common/StatementsFilter"
import utils from "edf-utils"
import MonthRangePicker from "../components/common/MonthRangePicker"
import PrintButton from "../components/common/PrintButton"

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce("init")
        this.initPage()
    }

    initPage = async () => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        let name = currentOrg.name
        if (
            sessionStorage["stockPeriod" + name] != undefined &&
            sessionStorage["stockPeriod" + name]
        ) {
            this.currentPeriod = sessionStorage["stockPeriod" + name]
        } else {
            this.currentPeriod = currentOrg.periodDate
        }
        const invSetData = await this.webapi.getInvSetByPeroid({ period: this.currentPeriod })

        if (invSetData.state !== 1) {
            // 未启用
            this.metaAction.sfs({ "data.isUnOpen": true, "data.loading": false })
            return
        }

        this.baseData = await this.webapi.init({ period: this.currentPeriod, opr: 1 }) // 获取基本信息
        // this.getInventoryType() // 存货类型

        let queryData = {
            orgId: currentOrg.id, //--企业id，必填
            orgName: currentOrg.name, //--企业名称
            period: this.currentPeriod,
            endPeriod: this.currentPeriod,
            defaultPeriod: this.currentPeriod,
            inventoryClassId: 0, // 0：全部；
            inventoryIndex: 0,
        }

        // 存货核算选择月份小于等于启用月份
        if (
            new Date(this.baseData.startPeriod).valueOf() > new Date(this.currentPeriod).valueOf()
        ) {
            this.metaAction.toast("error", "选择月份小于存货启用月份，无法查看此表！")
            this.injections.reduce("saveDatas", {
                type: ["data.queryData", "data.loading"],
                data: [queryData, false],
            })
            return
        }

        this.getTableData(queryData)
    }

    // 报表数据
    getTableData = async queryData => {
        this.metaAction.sfs({
            "data.tableLoading": true,
            "data.loading": false,
        })

        let params = { ...queryData }

        if (queryData.inventoryClassId == 0) {
            delete params.inventoryClassId
        }

        // 已结算
        let tableData = (await this.webapi.query(params)) || {}

        this.injections.reduce("saveDatas", {
            type: ["data.queryData", "data.tableData", "data.tableLoading"],
            data: [queryData, tableData, false],
        })
    }

    // 存货类型
    getInventoryType = async () => {
        const invType = (await this.webapi.queryAllInvType()) || []
        invType.unshift({ name: "全部", id: 0 })

        this.injections.reduce("saveData", {
            type: "data.selectOptions",
            data: invType,
        })
    }

    componentDidMount = () => {
        this.getScrollProps()
    }

    componentWillUnmount = () => {
        this[`deny-statements-zg-summaryClickFlag`] = null
    }
    statementsFilterSearch = form => {
        if (form) {
            let queryData = {
                ...this.metaAction.gf("data.queryData").toJS(),
                code: form.inputValue,
                // period: form.period,
                inventoryClassId: form.inventory.id,
                inventoryIndex: form.inventory.index,
            }
            this.getTableData(queryData)
        }
    }

    // 页面渲染
    renderPage = () => {
        const data = this.metaAction.gf("data").toJS()
        const { loading, isUnOpen, tableLoading, queryData } = data
        let disabled =
            this.baseData &&
            new Date(this.baseData.startPeriod).valueOf() > new Date(queryData.period).valueOf()
        return (
            <React.Fragment>
                {(loading || tableLoading) && (
                    <div className="ttk-stock-app-statements-zg-summary-spin">
                        <Spin size="large" delay={10} tip="数据加载中......"></Spin>
                    </div>
                )}

                {/* 未启用存货 */}
                {!loading && isUnOpen && (
                    <AppLoader
                        className="ttk-stock-weikaiqi"
                        name="ttk-stock-app-weikaiqi"
                        style={{ top: 0, left: 0 }}></AppLoader>
                )}

                {/* 已开启 */}
                {!loading && !isUnOpen && (
                    <div className="ttk-stock-app-statements-zg-summary-main">
                        {/* 头部 */}
                        <div className="ttk-stock-app-statements-zg-summary-main-header">
                            {/* 交互操作 */}
                            <div className="ttk-stock-app-statements-zg-summary-main-header-controller">
                                <StatementsFilter
                                    inputValue={queryData.code}
                                    useInventory={{
                                        value: queryData.inventoryIndex,
                                        orgId: queryData.orgId,
                                    }}
                                    onSearch={this.statementsFilterSearch}
                                />
                                <MonthRangePicker
                                    periodRange={[queryData.period, queryData.endPeriod]}
                                    disabledDate={
                                        (this.baseData && this.baseData.startPeriod) || "2019-01"
                                    }
                                    handleChange={this.dateRangeChange}
                                    className="ttk-stock-app-statements-zg-summary-main-header-controller-monthRangePicker"
                                />
                                <Button
                                    style={{ marginLeft: 10 }}
                                    onClick={this.exportData}
                                    disabled={disabled}
                                    className="ttk-stock-app-statements-zg-summary-main-header-controller-export">
                                    导出
                                </Button>
                                <PrintButton
                                    className="ttk-stock-app-statements-zg-summary-main-header-controller-export"
                                    {...this.getPrintProps()}
                                />
                            </div>
                        </div>

                        {/* 表格 */}
                        <div className="ttk-stock-app-statements-zg-summary-main-content">
                            {this.renderTable()}
                        </div>
                    </div>
                )}
            </React.Fragment>
        )
    }

    // 表格渲染
    renderTable = () => {
        let tableData = this.metaAction.gf("data.tableData").toJS().repZgSummarySubDtoList || []
        let scrollProps = this.metaAction.gf("data.scrollProps").toJS()

        // 计算合计
        let qcNum = 0,
            qcBalance = 0,
            zgrkNum = 0,
            zgrkBalance = 0,
            zghcNum = 0,
            zghcBalance = 0,
            qmNum = 0,
            qmBalance = 0
        tableData.forEach(el => {
            qcNum += el.qcNum
            qcBalance += el.qcBalance
            zgrkNum += el.zgrkNum
            zgrkBalance += el.zgrkBalance
            zghcNum += el.zghcNum
            zghcBalance += el.zghcBalance
            qmNum += el.qmNum
            qmBalance += el.qmBalance
        })

        let colName = [
                { title: "存货编号", key: "inventoryCode" },
                { title: "存货名称", key: "inventoryName" },
                { title: "规格型号", key: "inventoryGuiGe" },
                { title: "单位", key: "inventoryUnit" },
                { title: "数量", key: "qcNum" },
                { title: "单价", key: "qcPrice" },
                { title: "金额", key: "qcBalance" },
                { title: "数量", key: "zgrkNum" },
                { title: "单价", key: "zgrkPrice" },
                { title: "金额", key: "zgrkBalance" },
                { title: "数量", key: "zghcNum" },
                { title: "单价", key: "zghcPrice" },
                { title: "金额", key: "zghcBalance" },
                { title: "数量", key: "qmNum" },
                { title: "单价", key: "qmPrice" },
                { title: "金额", key: "qmBalance" },
            ],
            columns = [],
            width = 130,
            sumWidth = width * colName.length
        if (sumWidth < scrollProps.x) {
            let increment = Math.floor((scrollProps.x - sumWidth) / colName.length)
            width += increment
            sumWidth = width * colName.length
            scrollProps.x = sumWidth
        }
        // 表格列
        colName.forEach((el, i) => {
            columns.push({
                title: el.title,
                dataIndex: el.key,
                width,
                fixed: i < 4 ? "left" : "",
                minWidth: 70,
                render: (text, row, idx) => {
                    let obj = {
                        children: text,
                        props: {
                            title: i < 3 ? text : "",
                            style: {
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textAlign: "center",
                            },
                        },
                    }
                    if (i === 0) {
                        obj.children = <span onClick={this.navToPage(row)}>{text}</span>
                        obj.props.style.cursor = "pointer"
                        obj.props.style.color = "#0066B3"
                    } else if (i === 1 || i === 2) {
                        obj.props.style.textAlign = "left"
                    } else if (i > 3) {
                        obj.props.style.textAlign = "right"
                        obj.children = text || ""
                    }
                    if (el.title === "金额") {
                        obj.children = text ? utils.number.format(text, 2) : ""
                    }
                    if (el.title === "数量") {
                        obj.props.style.textAlign = "left"
                        obj.children = text ? formatSixDecimal(text) : ""
                    }
                    if (el.title === "单价") {
                        obj.children = text ? formatSixDecimal(text) : ""
                    }
                    return <div {...obj.props}>{obj.children}</div>
                },
            })
        })
        columns[13].flexGrow = 1
        // columns[13].width = undefined
        // 列分组
        let group = [
                { title: "期初", children: [] },
                { title: "暂估入库", children: [] },
                { title: "暂估冲回", children: [] },
                { title: "期末", children: [], flexGrow: 1 },
            ],
            count = 0,
            columnGroup = []
        columns.forEach((el, i) => {
            if (i < 4) {
                columnGroup.push(el)
            } else {
                group[count].children.push(el)
                if (group[count].children.length === 3) {
                    count++
                    columnGroup.push(group[count - 1])
                }
            }
        })

        // let tdWidth = { width: `${width}px` }
        // let footerRow = (
        //     <div className="vt-summary row">
        //         <div className="vt-summary left" style={{ width: `${4 * width}px` }}>
        //             总计
        //         </div>
        //         <div style={{...tdWidth, textAlign: 'left'}}>{!!qcNum && formatSixDecimal(qcNum)}</div>
        //         <div style={tdWidth}></div>
        //         <div style={tdWidth}>{!!qcBalance && utils.number.format(qcBalance ,2)}</div>
        //         <div style={{...tdWidth, textAlign: 'left'}}>{!!zgrkNum && formatSixDecimal(zgrkNum)}</div>
        //         <div style={tdWidth}></div>
        //         <div style={tdWidth}>{!!zgrkBalance && utils.number.format(zgrkBalance, 2)}</div>
        //         <div style={{...tdWidth, textAlign: 'left'}}>{!!zghcNum && formatSixDecimal(zghcNum)}</div>
        //         <div style={tdWidth}></div>
        //         <div style={tdWidth}>{!!zghcBalance && utils.number.format(zghcBalance, 2)}</div>
        //         <div style={{...tdWidth, textAlign: 'left'}}>{!!qmNum && formatSixDecimal(qmNum)}</div>
        //         <div style={tdWidth}></div>
        //         <div style={tdWidth}>{!!qmBalance && utils.number.format(qmBalance, 2)}</div>
        //     </div>
        // )
        let rowData = [
            "",
            !!qcNum && formatSixDecimal(qcNum),
            "",
            !!qcBalance && utils.number.format(qcBalance, 2),
            !!zgrkNum && formatSixDecimal(zgrkNum),
            "",
            !!zgrkBalance && utils.number.format(zgrkBalance, 2),
            !!zghcNum && formatSixDecimal(zghcNum),
            "",
            !!zghcBalance && utils.number.format(zghcBalance, 2),
            !!qmNum && formatSixDecimal(qmNum),
            "",
            !!qmBalance && utils.number.format(qmBalance, 2),
        ]
        let footerRow = columns => {
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
                                  dataIndex: item.key,
                                  flexGrow: item.flexGrow,
                              })
                          })
                        : rowWidth.push({
                              width: el.width,
                              dataIndex: el.key,
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
            return <div className="vt-summary row">{rows}</div>
        }

        return (
            <React.Fragment>
                {tableData.length ? (
                    <VirtualTable
                        dataSource={tableData}
                        columns={columnGroup}
                        scroll={{ ...scrollProps, x: sumWidth }}
                        style={{ width: scrollProps.x + "px" }}
                        width={scrollProps.x + 2}
                        height={scrollProps.y + 78}
                        summaryRows={{ rows: null, rowsComponent: footerRow, height: 37 }}
                        headerHeight={78}
                        allowResizeColumn
                    />
                ) : (
                    <Table
                        className="ttk-stock-app-statements-zg-summary-main-content-table"
                        columns={columnGroup}
                        dataSource={tableData}
                        bordered
                        pagination={false}
                        emptyShowScroll={true}
                        scroll={{ x: "100%" }}
                        style={{ height: scrollProps.y + 74 + "px" }}
                    />
                )}
            </React.Fragment>
        )
    }

    // 获取滚动属性
    getScrollProps = () => {
        clearTimeout(this.timer)
        this.timer = null
        const wrapper = document.querySelector(".ttk-stock-app-statements-zg-summary-main-content")
        if (wrapper) {
            this.injections.reduce("saveData", {
                type: "data.scrollProps",
                data: { x: wrapper.offsetWidth, y: wrapper.offsetHeight - 74 },
            }) // 表头74
        } else {
            this.timer = setTimeout(() => {
                this.getScrollProps()
            }, 300)
        }
    }

    momentDate = date => moment(date)

    // 设置区间选择范围
    disabledDate = date => {
        let enabledDate = this.momentDate((this.baseData && this.baseData.startPeriod) || "2019-01")
        return date < enabledDate
    }

    // 更改期间
    dateChange = async (momentDate, date) => {
        let queryData = {
            ...this.metaAction.gf("data.queryData").toJS(),
            period: date,
        }
        this.getTableData(queryData)
    }

    dateRangeChange = async range => {
        let queryData = {
            ...this.metaAction.gf("data.queryData").toJS(),
            period: range[0],
            endPeriod: range[1],
        }
        this.getTableData(queryData)
    }

    // 导出表格
    exportData = async () => {
        const hasClick = canClickTarget.getCanClickTarget("zgSummaryOutport")
        if (!hasClick) {
            canClickTarget.setCanClickTarget("zgSummaryOutport", true)
            const queryData = this.metaAction.gf("data.queryData").toJS()
            if (queryData.inventoryClassId == 0) {
                delete queryData.inventoryClassId
            }
            this.injections.reduce("saveData", {
                type: "data.tableLoading",
                data: true,
            })
            await this.webapi.export(queryData)
            this.injections.reduce("saveData", {
                type: "data.tableLoading",
                data: false,
            })
            canClickTarget.setCanClickTarget("zgSummaryOutport", false)
        }
    }
    getSearchParams = () => {
        const queryData = this.metaAction.gf("data.queryData").toJS()
        if (queryData.inventoryClassId == 0) {
            delete queryData.inventoryClassId
        }
        return queryData
    }

    getPrintProps = () => {
        const list = this.metaAction.gf("data.tableData").toJS().repZgSummarySubDtoList || []
        return {
            printType: 2,
            params: {
                codeType: "ZGHZ",
            },
            disabled: !(Array.isArray(list) && list.length > 0),
            getSearchParams: this.getSearchParams,
        }
    }

    // 跳转逻辑
    navToPage = ({ inventoryId, inventoryClassId }) => () => {
        const { period, endPeriod } = this.metaAction.gf("data.queryData").toJS()
        const name = (this.metaAction.context.get("currentOrg") || {}).name
        sessionStorage["fromPage" + name] = "ttk-stock-app-statements-zg-summary"
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                "暂估明细表",
                "ttk-stock-app-statements-zg-detail",
                {
                    inventoryId,
                    inventoryClassId,
                    period,
                    endPeriod,
                }
            )
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
