import React from "react"
import { action as MetaAction, AppLoader } from "edf-meta-engine"
import config from "./config"
import moment from "moment"
import utils from "edf-utils"
import { DatePicker, Select, Table } from "edf-component"
import { Spin, Tooltip } from "antd"
// import { DataGrid } from 'edf-component';
// const { Column, TextCell, ColumnGroup } = DataGrid
// import PrintButton from "../components/common/PrintButton"

import RowSpanVirtualTable from "../components/common/RowSpanVirtualTable"

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
        this.initData()
        this.tableCol = this.dealTableCol()
    }

    initData = async () => {
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
        // console.log(currentOrg, sessionStorage['stockPeriod'+name])
        this.baseData = await this.webapi.init({ period: this.currentPeriod, opr: 1 })
        // invSetData = await this.webapi.init({ 'period': this.currentPeriod, 'opr': 0 })
        const invSetData = await this.webapi.getInvSetByPeroid({ period: this.currentPeriod })

        if (invSetData.state !== 1) {
            // 未启用
            this.metaAction.sfs({ "data.isUnOpen": true, "data.loading": false })
            return
        }

        let queryData = {
            orgId: currentOrg.id, //--企业id，必填
            natureOfTaxpayers: currentOrg.vatTaxpayer, //--纳税人性质，必填
            queryType: 0, // 0：全部；1：期初
            period: this.currentPeriod,
            diff: 0, // 0：全部；1有差额；2无差额
        }

        this.getTableData(queryData)
    }

    // 报表数据
    getTableData = async queryData => {
        // console.log(queryData)
        this.metaAction.sfs({
            "data.tableLoading": true,
            "data.loading": false,
        })

        // jira-9119 取消限制
        // 工业模式未结算
        // if(this.baseData.inveBusiness === 1 && !this.baseData.isCarryOverProductCost) {
        //     this.metaAction.toast('error', '未生成结转生产成本凭证，无法查看此表！')
        //     this.injections.reduce('saveDatas', {
        //         type: ['data.queryData', 'data.tableData', 'data.tableLoading'],
        //         data: [queryData, {}, false]
        //     })
        //     return
        // }

        // this.tableCol = this.dealTableCol()

        // 已结算
        let tableData = await this.webapi.query(queryData)

        this.injections.reduce("saveDatas", {
            type: ["data.queryData", "data.tableData", "data.tableLoading"],
            data: [queryData, tableData, false],
        })
    }

    // 处理表格数据
    dealTableData = tableData => {
        let start = 0,
            end = tableData.length - 1
        if (!tableData.length) {
            return tableData
        }
        while (start <= end) {
            tableData[start].rowSpan = tableData[start].inventoryClassList.length
            tableData[end].rowSpan = tableData[end].inventoryClassList.length
            start++
            end--
        }
        return tableData
    }

    // 处理表格列
    dealTableCol = () => {
        let colName = [
                { title: "存货科目", key: "accountName" },
                { title: "存货类型", key: "inventoryClassList" },
                { title: "存货", key: "qcBalance" },
                { title: "总账", key: "qcGla" },
                { title: "差额", key: "qcDiff" },
                { title: "存货", key: "rkBalance" },
                { title: "总账", key: "rkGla" },
                { title: "差额", key: "rkDiff" },
                { title: "存货", key: "ckBalance" },
                { title: "总账", key: "ckGla" },
                { title: "差额", key: "ckDiff" },
                { title: "存货", key: "qmBalance" },
                { title: "总账", key: "qmGla" },
                { title: "差额", key: "qmDiff" },
            ],
            columns = [],
            width = 120

        // 表格列
        colName.forEach((el, i) => {
            columns.push({
                title: el.title,
                dataIndex: el.key,
                width: i === 0 ? 200 : 120,
                fixed: i < 2 ? "left" : "",
                minWidth: 70,
                render: (text, row, idx) => {
                    let obj = {
                        children: text,
                        props: {
                            style: {},
                            className: "row-span-td",
                        },
                    }
                    const style = obj.props.style
                    if (i < 2) {
                        style.width = "100%"
                        if (i === 0) {
                            obj.props.title = text
                            style.color = "#0066B3"
                            style.cursor = "pointer"
                            obj.props.onClick = this.openSfcBom(row)
                        }
                        if (i === 1) {
                            obj.props.className = ""
                            obj.children = text.map(el => {
                                return (
                                    <div
                                        title={el.inventoryClassName}
                                        className="row-span-td children">
                                        {el.inventoryClassName}
                                    </div>
                                )
                            })
                        }
                    } else {
                        if (i > 1) {
                            // 数据显示处理
                            if (text) {
                                obj.props.title = obj.children = utils.number.format(text, 2)
                                style.textAlign = "right"
                            } else {
                                obj.children = ""
                            }
                        }
                        // if (row.accountName === '合计') {
                        //     obj.props.style = { backgroundColor: '#fff6ea', fontWeight: 700, textAlign: 'right' }
                        //     if(i === 1) { obj.props.style.textAlign = 'left' }
                        // }
                    }
                    return <div {...obj.props}>{obj.children}</div>
                },
            })
        })
        columns[11].flexGrow = 1
        // delete(columns[11].width)

        // 列分组
        let group = [
                { title: "期初", children: [] },
                { title: "入库", children: [] },
                { title: "出库", children: [] },
                { title: "期末", children: [], flexGrow: 1 },
            ],
            count = 0,
            columnGroup = []
        columns.forEach((el, i) => {
            if (i < 2) {
                columnGroup.push(el)
            } else {
                group[count].children.push(el)
                if (group[count].children.length === 3) {
                    count++
                    columnGroup.push(group[count - 1])
                }
            }
        })

        return columnGroup
    }
    // 单据未生成凭证提示
    renderNoVoucherTypeList = () => {
        const noVoucherTypeList =
            (this.metaAction.gf("data.tableData.noVoucherTypeList") &&
                this.metaAction.gf("data.tableData.noVoucherTypeList").toJS()) ||
            []
        if (!Array.isArray(noVoucherTypeList) || noVoucherTypeList.length < 1) return null
        const content = `您有“${noVoucherTypeList.map(m => m.name).join("、")}”单据未生成凭证！`
        return (
            <Tooltip placement="bottomLeft" title={content} overlayClassName="inv-tool-tip-warning">
                <span className="tip">{content}</span>
            </Tooltip>
        )
    }
    // 对账是否平衡
    getIsBalanceClass = () => {
        const checkAccountDetailList =
            (this.metaAction.gf("data.tableData.checkAccountDetailList") &&
                this.metaAction.gf("data.tableData.checkAccountDetailList").toJS()) ||
            []
        if (!Array.isArray(checkAccountDetailList) || checkAccountDetailList.length < 1) return ""
        // 期初或入库或出库或期末的差额 != 0 属于对账不平衡
        if (
            checkAccountDetailList.some(
                s => s.qcDiff !== 0 || s.rkDiff !== 0 || s.ckDiff !== 0 || s.qmDiff !== 0
            )
        ) {
            return "out-off-balance"
        }
        return "balance"
    }
    renderVTable = () => {
        /*
            "qcBalance": 10,   //--期初存货
            "qcGla": 10,    //--期初总账
            "qcDiff": 0, //--期初差额
            "rkBalance": 100,   //--入库存货
            "rkGla": 99,    //--入库总账
            "rkDiff": -1,  //--入库差额
            "ckBalance": 50,    //--出库存货
            "ckGla": 51,   //--出库总账
            "ckDiff": 1, //--出库差额
            "qmBalance": 60,   //--期末存货
            "qmGla": 58,  //--期末总账
            "qmDiff": -2   
        */
        let { checkAccountDetailList, allRecTotal } =
            (this.metaAction.gf("data.tableData") && this.metaAction.gf("data.tableData").toJS()) ||
            {}
        checkAccountDetailList = checkAccountDetailList ? checkAccountDetailList : []
        const sumRowData = allRecTotal ? allRecTotal : {}
        for (let key in sumRowData) {
            sumRowData[key] = utils.number.format(sumRowData[key], 2)
        }

        const rowData = [
            "总计",
            sumRowData.qcBalance,
            sumRowData.qcGla,
            sumRowData.qcDiff,
            sumRowData.rkBalance,
            sumRowData.rkGla,
            sumRowData.rkDiff,
            sumRowData.ckBalance,
            sumRowData.ckGla,
            sumRowData.ckDiff,
            sumRowData.qmBalance,
            sumRowData.qmGla,
            sumRowData.qmDiff,
        ]
        const summaryRows = {
            height: 37,
            rows: null,
            rowsComponent: columns => {
                if (!columns.length) {
                    columns = this.dealTableCol()
                }
                let titleWidth = 0,
                    rowWidth = []
                columns.forEach((el, i) => {
                    if (i < 2) {
                        titleWidth += el.width
                        i == 1 && rowWidth.push({ width: titleWidth })
                    } else {
                        el.children
                            ? el.children.forEach(item => {
                                  rowWidth.push({
                                      width: item.width,
                                      key: item.key,
                                      flexGrow: item.flexGrow,
                                  })
                              })
                            : rowWidth.push({ width: el.width, key: el.key, flexGrow: el.flexGrow })
                    }
                })

                let rows = rowData.map((el, i) => {
                    let width = rowWidth[i].width + "px"
                    let flexGrow = rowWidth[i].flexGrow
                    if (i == 0) {
                        return (
                            <div
                                className="vt-summary left ttk-stock-app-common-row-span-virtual-table-sum-row-title"
                                style={{ width }}>
                                {rowData[i]}
                            </div>
                        )
                    } else {
                        let textAlign =
                            rowWidth[i].key && rowWidth[i].key.includes("Num") ? "left" : ""
                        return (
                            <div style={{ width, textAlign, flexGrow }} title={rowData[i]}>
                                {rowData[i]}
                            </div>
                        )
                    }
                })
                return (
                    <div className="vt-summary row ttk-stock-app-common-row-span-virtual-table-sum-row">
                        {rows}
                    </div>
                )
            },
        }

        return (
            <RowSpanVirtualTable
                dataSource={checkAccountDetailList}
                columns={this.tableCol}
                headerRowCount={2}
                summaryRows={summaryRows}
                rowSpanKey="inventoryClassList"
                allowResizeColumn
            />
        )
    }

    openSfcBom = row => async () => {
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) {
            modalWidth = 1920
        }
        const period = this.metaAction.gf("data.queryData.period")
        const ret = await this.metaAction.modal("show", {
            title: row.accountName || "存货",
            width: modalWidth,
            height: modalHeight,
            style: { top: 25 },
            bodyStyle: {
                height: modalHeight - 102 + "px",
                // maxHeight: modalHeight - 102 + 'px',
                overflow: "auto",
            },
            children: this.metaAction.loadApp("ttk-stock-app-statements-sfc-summary", {
                store: this.component.props.store,
                period,
                accountId: row.accountId,
                showInModal: true,
                noToSfcDetail: true,
            }),
        })
        if (ret) {
        }
    }

    // moment日期
    momentDate = date => moment(date)

    // 设置区间选择范围
    disabledDate = date => {
        let enabledDate = this.momentDate((this.baseData && this.baseData.startPeriod) || "2019-01")
        return date < enabledDate
    }

    // 更改期间
    dateChange = async (momentDate, date) => {
        // this.baseData = await this.webapi.getInvSetByPeroid({'period': date})
        this.baseData = await this.webapi.init({ period: date, opr: 1 })

        let queryData = {
            ...this.metaAction.gf("data.queryData").toJS(),
            period: date,
        }
        this.getTableData(queryData)
    }

    // 更改差额
    diffChange = diff => {
        let queryData = {
            ...this.metaAction.gf("data.queryData").toJS(),
            diff,
        }

        this.getTableData(queryData)
    }

    // 监听footerTable滚动
    onTableScroll = e => {
        let appDom = document.getElementsByClassName("ttk-stock-app-statements-chyzz")
        let body = appDom && appDom[0] && appDom[0].getElementsByClassName("ant-table-body")
        body[0].scrollLeft = e.target.scrollLeft
        if (e.target.scrollLeft !== body[0].scrollLeft) {
            e.target.scrollLeft = body[0].scrollLeft
        }
        // console.log(e);
    }

    // 换虚拟表格
    // componentDidUpdate= () => {
    //     // this.timer = setInterval(() => {
    //         let appDom = document.getElementsByClassName('ttk-stock-app-statements-chyzz')
    //         let body = appDom && appDom[0] && appDom[0].getElementsByClassName('ant-table-body')
    //         if(body && body.length === 2) {
    //             // clearInterval(this.timer)
    //             body[1].addEventListener('scroll', this.onTableScroll)
    //         }
    //     // }, 500);
    // }

    // componentDidMount = () => {
    //     // 计算表格可用高度
    //     this.setScroll = setInterval(() => {
    //         let appDom = document.getElementsByClassName('ttk-stock-app-statements-chyzz')[0]
    //         if(appDom) {
    //             clearInterval(this.setScroll)
    //             let num = appDom.offsetHeight - 83 - 37 - 25 - 74;
    //             //---------------------------头部--总计行--边距--表头
    //             // console.log(num)
    //             this.injections.reduce('saveData', {
    //                 type: 'data.scrollProps',
    //                 data: {
    //                     x: '100%',
    //                     y: num
    //                 }
    //             })
    //         }
    //     },300)

    //     // this.setMargin()
    // }

    // componentWillUnmount = () => {
    //     // clearInterval(this.timer)
    //     // clearTimeout(this.marginId)
    //     let appDom = document.getElementsByClassName('ttk-stock-app-statements-chyzz')
    //     let body = appDom && appDom[0] && appDom[0].getElementsByClassName('ant-table-body')
    //     if(body && body.length === 2) {
    //         body[1].removeEventListener('scroll', this.onTableScroll)
    //     }
    // }

    // 设置外边距
    setMargin = () => {
        let body = document.getElementsByClassName("ant-table-body")
        if (body && body.length && body[0].offsetHeight) {
            clearTimeout(this.marginId)
            let barWidth = body[0].offsetHeight - body[0].clientHeight
            // console.log(barWidth, body[0].offsetHeight, body[0].clientHeight)
            this.injections.reduce("saveData", {
                type: "data.barWidth",
                data: barWidth + 1,
            })
        } else {
            this.marginId = setTimeout(() => {
                clearTimeout(this.marginId)
                this.setMargin()
            }, 300)
        }
    }

    // 页面渲染
    renderPage = () => {
        let data = this.metaAction.gf("data").toJS()
        let { loading, isUnOpen, tableLoading, queryData, selectOptions } = data
        return (
            <React.Fragment>
                {loading ? (
                    <div className="ttk-stock-app-statements-chyzz-spin">
                        <Spin
                            className="ttk-stock-app-statements-chyzz-spin-icon"
                            size="large"
                            delay={10}
                            tip="数据加载中......"></Spin>
                    </div>
                ) : null}

                {
                    // 未启用存货
                    isUnOpen && !loading ? (
                        <AppLoader
                            className="ttk-stock-weikaiqi"
                            name="ttk-stock-app-weikaiqi"
                            style={{ top: 0, left: 0 }}></AppLoader>
                    ) : null
                }

                {
                    // 已开启
                    !isUnOpen && !loading ? (
                        <Spin
                            spinning={tableLoading}
                            delay={10}
                            className="ttk-stock-app-statements-chyzz-index">
                            {/* // 筛选 */}
                            <div className="ttk-stock-app-statements-chyzz-header-filter">
                                <DatePicker.MonthPicker
                                    className="ttk-stock-app-statements-chyzz-header-filter-date"
                                    value={this.momentDate(queryData.period)}
                                    disabledDate={this.disabledDate}
                                    onChange={this.dateChange}></DatePicker.MonthPicker>
                                <span className="ttk-stock-app-statements-chyzz-header-filter-text">
                                    差额：
                                </span>
                                <Select
                                    className="ttk-stock-app-statements-chyzz-header-filter-type"
                                    value={queryData.diff}
                                    onChange={this.diffChange}>
                                    {selectOptions.map(el => {
                                        return (
                                            <Select.Option
                                                className="type-option"
                                                value={el.value}
                                                key={el.value}>
                                                {el.type}
                                            </Select.Option>
                                        )
                                    })}
                                </Select>
                                {this.renderNoVoucherTypeList()}
                            </div>
                            <div
                                className={
                                    "ttk-stock-app-statements-chyzz-main " +
                                    this.getIsBalanceClass()
                                }>
                                {this.renderVTable()}
                            </div>
                        </Spin>
                    ) : null
                }
            </React.Fragment>
        )
    }
}

/*

*/

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
