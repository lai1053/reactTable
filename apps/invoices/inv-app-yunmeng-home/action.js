import React from "react"
import { Map, fromJS, is } from "immutable"
import { action as MetaAction, AppLoader } from "edf-meta-engine"
import config from "./config"
import {
    Radio,
    Menu,
    Collapse,
    Select,
    Button,
    Input,
    Icon,
    LoadingMask,
    Popover,
    Echarts,
    Table,
    Row,
    Col,
    Tabs
} from "edf-component"
import moment from "moment"
import { number, environment, math } from "edf-utils"
const TabPane = Tabs.TabPane

const getDate = period => {
    let newDate = {}
    if (period.period == 12) {
        newDate.year = parseInt(period.year) + 1
        newDate.period = "01"
    } else {
        newDate.year = parseInt(period.year)
        newDate.period =
            parseInt(period.period) + 1 >= 10
                ? parseInt(period.period) + 1
                : "0" + (parseInt(period.period) + 1)
    }
    return newDate
}

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.tableId = "inv-app-yunmeng-home-table-" + new Date().valueOf()
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections

        let data = { ...this.component.props.data }
        let period = this.component.props.period,
            newDate = period ? getDate(period) : undefined,
            date = newDate ? newDate.year + "-" + newDate.period : undefined,
            currentOrg = this.metaAction.context.get("currentOrg"),
            swVatTaxpayer = currentOrg.swVatTaxpayer
        // data.xxfplist = this.transList( data.xxfplist )
        // data.jxfplist = this.transList( data.jxfplist )
        injections.reduce("init", data, date, swVatTaxpayer)
        // this.load({ date, type:'xxfp' })
        this.initLoad()
    }

    initLoad = async () => {
        let res = this.component.props.data,
            period = this.component.props.period,
            newDate = period ? getDate(period) : undefined
        if (res && newDate) {
            let xxfp = this.initData(res["xxfp"], newDate, "xxfp"),
                jxfp = this.initData(res["jxfp"], newDate, "jxfp")

            if (!jxfp || !jxfp) return
            const data = {
                "data.xxfpoption": fromJS(xxfp.xxfpoption),
                "data.xxfplist": fromJS(xxfp.xxfplist),
                "data.jxfplist": fromJS(jxfp.jxfplist),
                "data.jxfpoption": fromJS(jxfp.jxfpoption),
                "data.date": jxfp.date
            }
            this.metaAction.sfs(data)
        }
    }

    initData = (res, period, type) => {
        let date = period.year + "-" + period.period,
            currentOrg = this.metaAction.context.get("currentOrg"),
            swVatTaxpayer = currentOrg.swVatTaxpayer
        let data = this.metaAction.gf(`data`).toJS(),
            dateName = `data.date`
        if (type == "jxfp" && swVatTaxpayer != 2000010002) {
            data.jxfplist = this.transList(
                res.fpxxTjDtoList,
                data.jxfplist,
                res.ljJshj,
                res.ljHjse
            )
            data.jxfpoption = this.transOption(
                res.fpxxTjDtoList,
                data.jxfpoption,
                res.fpzzs
            )
        } else if (type == "xxfp") {
            data.xxfplist = this.transList(
                res.fpxxTjDtoList,
                data.xxfplist,
                res.ljJshj,
                res.ljHjse
            )
            data.xxfpoption = this.transOption(
                res.fpxxTjDtoList,
                data.xxfpoption,
                res.fpzzs
            )
        } else if (type == "jxfp" && swVatTaxpayer == 2000010002) {
            res = this.transResData(res)
            data.xxfplist = this.transList(
                res.fpxxTjDtoList,
                data.xxfplist,
                res.ljJshj,
                res.ljHjse
            )
            data.xxfpoption = this.transOption(
                res.fpxxTjDtoList,
                data.xxfpoption,
                res.fpzzs
            )
        }
        data.date = date
        return data
    }

    load = async ({ date, type } = {}) => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            swVatTaxpayer = currentOrg.swVatTaxpayer
        date = date || this.metaAction.gf(`data.date`)
        let data = this.metaAction.gf(`data`).toJS(),
            params = {
                type
            }
        if (date) {
            let year = parseInt(date.split("-")[0]),
                month = parseInt(date.split("-")[1] - 1)
            if (month == 0) {
                params.skssq = parseInt(year - 1) + "12"
            } else {
                params.skssq = year + (month < 10 ? "0" + month : "" + month)
            }
        } //params.skssq = date.replace('-','')
        let res = await this.webapi.statistics.tjXxFpxx(params),
            dateName = `data.date`
        if (res) {
            if (type == "jxfp" && swVatTaxpayer != 2000010002) {
                data.jxfplist = this.transList(
                    res.fpxxTjDtoList,
                    data.jxfplist,
                    res.ljJshj,
                    res.ljHjse
                )
                data.jxfpoption = this.transOption(
                    res.fpxxTjDtoList,
                    data.jxfpoption,
                    res.fpzzs
                )
            } else if (type == "xxfp") {
                data.xxfplist = this.transList(
                    res.fpxxTjDtoList,
                    data.xxfplist,
                    res.ljJshj,
                    res.ljHjse
                )
                data.xxfpoption = this.transOption(
                    res.fpxxTjDtoList,
                    data.xxfpoption,
                    res.fpzzs
                )
            } else if (type == "jxfp" && swVatTaxpayer == 2000010002) {
                res = this.transResData(res)
                data.xxfplist = this.transList(
                    res.fpxxTjDtoList,
                    data.xxfplist,
                    res.ljJshj,
                    res.ljHjse
                )
                data.xxfpoption = this.transOption(
                    res.fpxxTjDtoList,
                    data.xxfpoption,
                    res.fpzzs
                )
            }
            data.date = date
            return data
        }
    }

    transResData = res => {
        let yrzIndex,
            wrzIndex,
            addItem = {
                fplxDm: "01",
                fpzs: 0,
                hjje: 0,
                hjse: 0,
                jshj: 0
            }
        res.fpxxTjDtoList = res.fpxxTjDtoList.filter((item, index) => {
            if (item.fplxDm == "010" || item.fplxDm == "011") {
                addItem.fpzs = (addItem.fpzs + item.fpzs).toFixed(2) - 0
                addItem.hjje = (addItem.hjje + item.hjje).toFixed(2) - 0
                addItem.hjse = (addItem.hjse + item.hjse).toFixed(2) - 0
                addItem.jshj = (addItem.jshj + item.jshj).toFixed(2) - 0
            }
            return item.fplxDm != "010" && item.fplxDm != "011"
        })
        res.fpxxTjDtoList.push(addItem)
        return res
    }

    transList = (list, table, ljJshj, ljHjse) => {
        table = table.map((item, index) => {
            if (item.fplxDm) {
                let curRow = {}
                list.map(row => {
                    if (row.fplxDm == item.fplxDm) {
                        curRow = row
                    }
                })
                delete curRow.type
                item = { ...item, ...curRow }
            } else {
                item.jshj = ljJshj
                item.hjse = ljHjse
            }
            if (item.jshj !== undefined) item.jshj = number.format(item.jshj, 2)
            if (item.hjse !== undefined) item.hjse = number.format(item.hjse, 2)
            return item
        })
        return table
    }

    transOption = (list, option, fpzzs) => {
        let data = option.series[0].data
        if (fpzzs == 0) {
            let arr = new Array(option.series[0].data.length)
            arr[arr.length - 1] = { value: 0, name: "无数据" }
            option.series[0].data = arr
        } else {
            if (data.length == 4) {
                data = [
                    { value: 0, fplxDm: "01", name: "增值税专用发票" },
                    { value: 0, fplxDm: "100", name: "其他发票" },
                    { value: 0, fplxDm: "04", name: "增值税普通发票" },
                    { value: 0, name: "无数据" }
                ]
            } else {
                data = [
                    {
                        value: 0,
                        fplxDm: "011",
                        name: "增值税专用发票（已认证）"
                    },
                    { value: 0, fplxDm: "04", name: "增值税普通发票" },
                    {
                        value: 0,
                        fplxDm: "010",
                        name: "增值税专用发票（未认证）"
                    },
                    { value: 0, fplxDm: "100", name: "其他发票" },
                    { value: 0, name: "无数据" }
                ]
            }
            option.series[0].data = data.map(item => {
                let curfplxDm = item && item.fplxDm
                list.map(row => {
                    if (row.fplxDm == curfplxDm) {
                        item.value = row.fpzs
                    }
                })
                if (item.value == 0) item = undefined
                return item
            })
            option.series[0].data[option.series[0].data.length - 1] = undefined
        }
        option.title.text = fpzzs + "张"
        return option
    }

    componentDidMount = () => {
        this.setContainerStyle()
    }

    componentWillUnmount = () => {}

    setNum = () => {
        this.metaAction.sf("data.mathRandom", Math.random())
    }

    changeDate = async e => {
        let xxfp = await this.load({ date: e, type: "xxfp" }),
            jxfp = await this.load({ date: e, type: "jxfp" })
        if (!jxfp || !jxfp) return
        let data = {
            "data.xxfpoption": fromJS(xxfp.xxfpoption),
            "data.xxfplist": fromJS(xxfp.xxfplist),
            "data.jxfplist": fromJS(jxfp.jxfplist),
            "data.jxfpoption": fromJS(jxfp.jxfpoption),
            "data.date": jxfp.date
        }
        this.metaAction.sfs(data)
    }

    getContent = type => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            swVatTaxpayer = currentOrg.swVatTaxpayer
        if (swVatTaxpayer == 2000010002 && type == "jxfp") {
            type = "xxfp"
        }
        let data = {},
            option = this.metaAction.gf(`data.${type}option`).toJS(),
            onEvents = {
                click: this.chartClick,
                mouseover: this.chartmouseover,
                timelinechanged: this.chartClick
            }
        return (
            <Echarts option={option} className="rcchart" onEvents={onEvents} />
        )
    }

    getDate = type => {
        let date = type
            ? this.metaAction.gf(`data.date`)
            : moment().format("YYYY-MM")
        return moment(date)
    }

    getList = type => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            swVatTaxpayer = currentOrg.swVatTaxpayer
        if (swVatTaxpayer == 2000010002 && type == "jxfp") {
            type = "xxfp"
        }
        let list = this.metaAction.gf(`data.${type}list`).toJS()

        return list
    }

    getBottomItems = type => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            swVatTaxpayer = currentOrg.swVatTaxpayer
        if (type == "xxfp" || (swVatTaxpayer == 2000010002 && type == "jxfp")) {
            return (
                <div className="inv-app-yunmeng-home-legend center">
                    <span className="inv-app-yunmeng-home-legend-item">
                        <span className="inv-app-yunmeng-home-legend-item-color color-orange"></span>
                        <span className="inv-app-yunmeng-home-legend-item-text">
                            增值税专用发票
                        </span>
                    </span>
                    <span className="inv-app-yunmeng-home-legend-item">
                        <span className="inv-app-yunmeng-home-legend-item-color color-blue"></span>
                        <span className="inv-app-yunmeng-home-legend-item-text">
                            其他发票
                        </span>
                    </span>
                    <span className="inv-app-yunmeng-home-legend-item">
                        <span className="inv-app-yunmeng-home-legend-item-color color-green"></span>
                        <span className="inv-app-yunmeng-home-legend-item-text">
                            增值税普通发票
                        </span>
                    </span>
                </div>
            )
        } else {
            return (
                <div className="inv-app-yunmeng-home-legend row">
                    <div className="inv-app-yunmeng-home-legend-item right">
                        <span className="inv-app-yunmeng-home-legend-item-color color-orange"></span>
                        <span className="inv-app-yunmeng-home-legend-item-text">
                            增值税专用发票（已认证）
                        </span>
                    </div>
                    <div className="inv-app-yunmeng-home-legend-item">
                        <span className="inv-app-yunmeng-home-legend-item-color color-blue2"></span>
                        <span className="inv-app-yunmeng-home-legend-item-text">
                            增值税普通发票
                        </span>
                    </div>
                    <div className="inv-app-yunmeng-home-legend-item right">
                        <span className="inv-app-yunmeng-home-legend-item-color color-green"></span>
                        <span className="inv-app-yunmeng-home-legend-item-text">
                            增值税专用发票（未认证）
                        </span>
                    </div>
                    <div className="inv-app-yunmeng-home-legend-item">
                        <span className="inv-app-yunmeng-home-legend-item-color color-blue"></span>
                        <span className="inv-app-yunmeng-home-legend-item-text">
                            其他发票
                        </span>
                    </div>
                </div>
            )
        }
    }
    renderTable = type => {
        const columns = [
            {
                title: "发票类型",
                dataIndex: "type",
                key: "type",
                width: "177px",
                align: "left"
            },
            {
                title: "价税合计",
                dataIndex: "jshj",
                key: "jshj",
                align: "right",
                width: "147px"
            },
            {
                title: "税额 ",
                dataIndex: "hjse",
                key: "hjse",
                align: "right",
                width: "150px"
            }
        ]
        return (
            <Table
                key={`${this.tableId}-${type}`}
                className="inv-app-yunmeng-home-table"
                pagination={false}
                allowColResize={false}
                enableSequenceColumn={true}
                bordered
                dataSource={[...this.getList(type)]}
                noCalculate
                width={476}
                columns={[...columns]}
                rowClassName={record => (record.type === "合计" ? "total" : "")}
            ></Table>
        )
    }
    renderContent = () => {
        return (
            <Row gutter={24} className="row">
                <Col span={12}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="销项" key="1">
                            {this.getContent("xxfp")}
                            {this.getBottomItems("xxfp")}
                            {this.renderTable("xxfp")}
                        </TabPane>
                    </Tabs>
                </Col>
                <Col span={12}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="进项" key="1">
                            {this.getContent("jxfp")}
                            {this.getBottomItems("jxfp")}
                            {this.renderTable("jxfp")}
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>
        )
    }
    setContainerStyle() {
        const dom = document.querySelector(
                "div[cust_appname=inv-app-yunmeng-home]"
            ),
            domParent = document.querySelector(".edfx-app-home-content")

        if (dom && domParent) {
            dom.style.height = "100%"
            const act = document.querySelector(".edfx-app-home-activity")
            if (!act) domParent.style.height = "100%"
            else domParent.style.height = "calc(100% - 56px)"
            // const antCard = domParent.querySelector(".ant-card"),
            //     antCardBody = domParent.querySelector(".ant-card-body")
            // if (antCard && antCardBody) {
            //     antCard.style.display = "block"
            //     antCard.style.flexDirection = "unset"
            //     antCard.style.overflow = "auto"
            //     antCardBody.style.display = "block"
            //     antCardBody.style.flexDirection = "unset"
            // }
        }
    }
    componentDidUpdate = () => {
        this.setContainerStyle()
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })
    return ret
}
