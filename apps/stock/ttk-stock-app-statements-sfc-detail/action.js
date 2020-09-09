import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import { columnData } from "./fixedData"
import { fromJS, toJS } from "immutable"
import config from "./config"
import extend from "./extend"
import { Tree, Table, DatePicker, Button } from "edf-component"
import VirtualTable from "../../invoices/components/VirtualTable/index"
import moment from "moment"
import { moment as momentUtil } from "edf-utils"
import {
    formatSixDecimal,
    deepClone,
    transToNum,
    addEvent,
    removeEvent,
    stockLoading,
    getClientSize,
} from "../commonAssets/js/common"
import utils from "edf-utils"
import CompletionOfWarehousingLook from "../components/CompletionOfWarehousingLook"
import AddStockOrrders from "../ttk-stock-app-other-storage/components/addStockOrders"
import MonthRangePicker from "../components/common/MonthRangePicker"
import PrintButton from "../components/common/PrintButton"

let { modalHeight, modalWidth, modalBodyStyle } = getClientSize()
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        injections.reduce("init")

        let time = this.component.props.accountPeriod ? this.component.props.accountPeriod : ""
        let id = this.component.props.inventory ? this.component.props.inventory.inventoryId : ""
        let inventoryClassId = this.component.props.inventory
            ? this.component.props.inventory.inventoryClassId
            : ""
        this.name = this.metaAction.context.get("currentOrg").name
        if (id) {
            // const storeId = sessionStorage["detailTable-stockId" + this.name]
            // const storeTime = sessionStorage["detailTable-period" + this.name] || ""
            // if (!storeId || !moment(time).isSame(storeTime, "month") || storeId != id) {
            this.detialLoad(id, time, this.component.props.endPeriod, inventoryClassId)
            const classId = (inventoryClassId && inventoryClassId.toString()) || ""
            this.metaAction.sfs({
                "data.treeSelectedKey": fromJS([(id && id.toString()) || ""]),
                "data.expandedKeys": fromJS(["0", classId]),
                "data.level": 3,
            })
            // } else {
            //     this.load()
            // }
        } else {
            this.load(true)
        }
    }

    stockLoading = param => stockLoading(param)

    componentWillUpdate = (nextprops, nextstate) => {
        const { inventory, params } = nextprops
        const { inventoryId, inventoryClassId } = inventory || {}
        let time = nextprops.accountPeriod ? nextprops.accountPeriod : ""
        const fromPage = sessionStorage["fromPage" + this.name]
        if (fromPage == "ttk-stock-app-statements-sfc-summary" && inventoryId) {
            const storeId = sessionStorage["detailTable-stockId" + this.name]
            const storeTime = sessionStorage["detailTable-period" + this.name] || ""
            const storeEndTime = sessionStorage["detailTable-endPeriod" + this.name] || ""
            if (
                !storeId ||
                !moment(time).isSame(storeTime, "month") ||
                !moment(nextprops.endPeriod).isSame(storeEndTime, "month") ||
                storeId != inventoryId
            ) {
                this.detialLoad(inventoryId, time, nextprops.endPeriod, inventoryClassId)
                this.metaAction.sfs({
                    "data.treeSelectedKey": fromJS([(inventoryId && inventoryId.toString()) || ""]),
                    "data.expandedKeys": fromJS([
                        "0",
                        (inventoryClassId && inventoryClassId.toString()) || "",
                    ]),
                    "data.level": 3,
                })
            }
            sessionStorage["fromPage" + name] = "ttk-stock-app-statements-sfc-detail"
        }
    }
    componentDidMount = (nextprops, nextstate) => {
        this.computeColWidth()
        addEvent(window, "resize", ::this.resizeTable)
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    componentWillUnmount = () => {
        sessionStorage["fromPage" + name] = "ttk-stock-app-statements-sfc-detail"
        removeEvent(window, "resize", ::this.resizeTable)
    }

    /**
     * @description: 页面数据初始化
     * @return: 无
     */
    load = async selectFirstChild => {
        const accountPeriod = this.getStockPeriod()
        const reqData = await this.webapi.init({ period: accountPeriod, opr: 0 })
        // 判断存货是否开启 start
        const isUnOpen = reqData.state !== 1
        this.motime = reqData.startPeriod //启用时间
        if (sessionStorage["stockPeriod" + name] < reqData.startPeriod) {
            sessionStorage["stockPeriod" + name] = reqData.startPeriod
            this.stockPeriod = reqData.startPeriod
        }
        this.metaAction.sfs({
            "data.isUnOpen": isUnOpen,
            "data.isVisible": true,
        })
        if (isUnOpen) return
        // 判断存货是否开启 end

        this.metaAction.sf("data.loading", true)
        const qAllFun = this.webapi.queryAll({}),
            getInvSetByPeroid = this.webapi.getInvSetByPeroid({ period: accountPeriod }),
            treeFun = this.webapi.queryList({
                entity: {
                    fuzzyCondition: "",
                    propertyId: "",
                },
                page: {
                    currentPage: 1,
                    pageSize: 500000,
                },
            })
        // listFun =

        let invSet = await getInvSetByPeroid, // 账套信息
            businessType = await qAllFun, // 业务类型
            treeList = (await treeFun) || {}, // 数结构的数据
            list = await this.webapi.query({
                period: accountPeriod,
                endPeriod: accountPeriod,
                inventoryId: !selectFirstChild
                    ? undefined
                    : (Array.isArray(treeList.list) && treeList.list[0] && treeList.list[0].id) ||
                      undefined,
            }), // 明细表的数据
            stateNow = false // 当前存货是否已启用
        if (invSet) {
            this.endCostType = invSet.endCostType
            this.inveBusiness = invSet.inveBusiness
            stateNow = invSet.isGenVoucher || invSet.isCarryOverMainCost ? true : false
        }

        let listArr = []
        if (list && list.length > 0) {
            listArr = (await this.dealWithData(list)) || []
        }
        this.injections.reduce(
            "load",
            businessType,
            listArr,
            treeList.list || {},
            accountPeriod,
            stateNow
        )
        const sfsObj = {
            "data.loading": false,
            "data.list": fromJS(listArr),
        }
        if (selectFirstChild && Array.isArray(treeList.list)) {
            sfsObj["data.treeSelectedKey"] = fromJS([
                (treeList.list[0] && treeList.list[0].id.toString()) || "",
            ])
            sfsObj["data.level"] = 3
        }
        this.metaAction.sfs(sfsObj)
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    /**
     * @description: 请求单个存货明细
     * @param {string} id 存货id
     * @param {string} time 当前会计期间
     * @param {string} inventoryClassId 存货类型id
     * @return: 无
     */
    detialLoad = async (id, time, endPeriod, inventoryClassId) => {
        let name = this.metaAction.context.get("currentOrg").name
        sessionStorage["detailTable-stockId" + name] = id
        sessionStorage["detailTable-period" + name] = time
        sessionStorage["detailTable-endPeriod" + this.name] = endPeriod

        // 判断存货是否开启 start
        const reqData = await this.webapi.init({ period: time, opr: 0 })
        const isUnOpen = parseInt(reqData.state) !== 1
        this.metaAction.sfs({
            "data.isUnOpen": isUnOpen,
            "data.isVisible": true,
        })
        if (isUnOpen) return
        this.motime = reqData.startPeriod //启用时间
        // 判断存货是否开启 end

        this.metaAction.sf("data.loading", true)
        const qAllFun = this.webapi.queryAll({}),
            listFun = this.webapi.query({ period: time, endPeriod, inventoryId: id }),
            treeFun = this.webapi.queryList({
                entity: {
                    fuzzyCondition: "",
                    propertyId: "",
                },
                page: {
                    currentPage: 1,
                    pageSize: 500000,
                },
            })

        let businessType = await qAllFun,
            treeList = await treeFun,
            list = await listFun,
            stateNow = true // 当前存货是否已启用 --查询单个存货明细时，默认是已启用了

        list = this.dealWithData(list || [])
        this.injections.reduce("load", businessType, list, treeList.list, time, stateNow, endPeriod)
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    /**
     * @description: 获取当前会计期间
     * @return: 获取当前会计期间
     */
    getStockPeriod = () => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        let name = currentOrg.name
        if (
            sessionStorage["stockPeriod" + name] != "undefined" &&
            sessionStorage["stockPeriod" + name]
        ) {
            this.stockPeriod = sessionStorage["stockPeriod" + name]
        } else {
            const period = currentOrg.periodDate
            sessionStorage["stockPeriod" + name] = period
            this.stockPeriod = period
        }
        return this.stockPeriod
    }

    heightCount = () => {
        let name = "ttk-stock-app-statements-sfc-detail ttk-stock-app-statements-sfc-detailNoBorder"
        if (this.component.props.modelStatus && this.component.props.modelStatus == 1) {
            name = "ttk-stock-app-statements-sfc-detail"
        }
        return name
    }

    /**
     * @description: 渲染树节点
     * @param {array} data 树结构数组
     * @return: 返回所有树节点
     */
    renderTreeNodes = data => {
        if (!data) return <div></div>
        return data.map(item => {
            if (item.children) {
                return (
                    <Tree.TreeNode title={item.name} key={item.id} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </Tree.TreeNode>
                )
            }
            return <Tree.TreeNode title={item.name} key={item.id} dataRef={item} />
        })
    }

    /**
     * @description: 渲染树节点
     * @param {array} key 展开的树节点的数组
     * @return: 返回所有树节点
     */
    updateExpandedKeys = keys => {
        this.metaAction.sf("data.expandedKeys", keys)
    }

    /**
     * @description: 渲染树节点
     * @param {array} selectedKeys 选中的树节点
     * @param {object} info {selected: bool, selectedNodes, node, event} -选中事件的信息
     * @return: 返回所有树节点
     */
    selectType = (selectedKeys, info) => {
        if (selectedKeys.length == 0) {
            // this.load()
        } else {
            let expandedKeys = this.metaAction.gf("data.expandedKeys")
            if (expandedKeys.constructor !== Array) {
                expandedKeys =
                    (this.metaAction.gf("data.expandedKeys") &&
                        this.metaAction.gf("data.expandedKeys").toJS()) ||
                    []
            }
            if (expandedKeys.indexOf(selectedKeys[0]) == -1) {
                if (selectedKeys[0] == "0") {
                    let tree = this.metaAction.gf("data.other.tree")
                    if (tree.constructor !== Array) {
                        tree =
                            (this.metaAction.gf("data.other.tree") &&
                                this.metaAction.gf("data.other.tree").toJS()) ||
                            []
                    }
                    let list = ["0"]
                    tree[0].children.forEach(item => {
                        list.push((item.id && item.id.toString()) || "")
                    })
                    this.metaAction.sf("data.expandedKeys", fromJS(list))
                } else {
                    expandedKeys.push(selectedKeys[0])
                    this.metaAction.sf("data.expandedKeys", fromJS(expandedKeys))
                }
            }
            this.metaAction.sf("data.treeSelectedKey", fromJS(selectedKeys))
            this.reload(info)
        }
    }

    /**
     * @description: 切换月份查询列表
     * @param {object} path 日期路径名
     * @param {moment} moment 选中日期的moment格式
     * @return: 返回所有树节点
     */
    changereload = async range => {
        this.metaAction.sfs({
            "data.form.enableDate": range[0],
            "data.form.endPeriod": range[1],
            "data.loading": true,
        })
        let inventoryId =
                (this.metaAction.gf("data.treeSelectedKey") &&
                    this.metaAction.gf("data.treeSelectedKey").toJS()) ||
                [],
            time = momentUtil.stringToMoment(range[0]).format("YYYY-MM"),
            level = this.metaAction.gf("data.level"),
            list = [],
            req

        if (level == 1) {
            req = this.webapi.query({ period: time, endPeriod: range[1] })
        } else if (level == 2) {
            req = this.webapi.query({
                period: time,
                endPeriod: range[1],
                inventoryClassId: inventoryId[0],
            })
        } else {
            req = this.webapi.query({
                period: time,
                endPeriod: range[1],
                inventoryId: inventoryId[0],
            })
        }
        const getInvSetByPeroid = this.webapi.getInvSetByPeroid({ period: time })
        list = await req
        list = this.dealWithData(list || [])

        this.injections.reduce("reload", list)
        const invSet = await getInvSetByPeroid
        if (invSet) {
            this.inveBusiness = invSet.inveBusiness
            this.endCostType = invSet.endCostType
            let stateNow = invSet.isGenVoucher || invSet.isCarryOverMainCost ? true : false
            this.metaAction.sf("data.limit.stateNow", stateNow)
        }
        this.metaAction.sf("data.loading", false)
    }

    /**
     * @description: 渲染树节点
     * @param {object} info {selected: bool, selectedNodes, node, event} -选中子节点的信息
     * @return: 返回所有树节点
     */
    reload = async info => {
        let time = this.metaAction.gf("data.form.enableDate"),
            endPeriod = this.metaAction.gf("data.form.endPeriod")
        let selectedNode = info.selectedNodes[0], // 选中的树节点id
            level = selectedNode.props.dataRef.level, // 第几级树节点
            levelNum = 1, // 默认是第一级
            reqList = { period: time, endPeriod } // 请求参数

        if (level == 2) {
            levelNum = 2
            reqList["inventoryClassId"] = selectedNode.key
        } else if (level == 3) {
            levelNum = 3
            reqList["inventoryId"] = selectedNode.key
        }

        this.metaAction.sfs({
            "data.level": levelNum,
            "data.loading": true,
        })

        let list = await this.webapi.query(reqList)
        list = this.dealWithData(list || [])

        this.injections.reduce("reload", list)
    }

    /**
     * @description: 树上方的搜索框，可支持编码和存货名称查询
     * @param {string} path 输入框的值对应的字段
     * @param {string} inputVal 输入框的值
     * @return: 无
     */
    reloadType = async (path, inputVal) => {
        let datatime = this.metaAction.gf("data.form.enableDate"),
            endPeriod = this.metaAction.gf("data.form.endPeriod")
        this.metaAction.sf("data.treeLoading", true)
        const qAllFun = this.webapi.queryAll({}),
            treeFun = this.webapi.queryList({
                entity: { fuzzyCondition: inputVal, propertyId: "" },
                page: { currentPage: 1, pageSize: 500000 },
            }),
            listFun = this.webapi.query({ period: datatime, endPeriod })

        let businessType = await qAllFun,
            treeList = (await treeFun) || {},
            list = await listFun

        list = this.dealWithData(list || [])
        this.injections.reduce("reloadType", businessType, list, treeList.list || [], inputVal)
    }

    /**
     * @description: 树上方的搜索框，可支持编码和存货名称查询
     * @param {string} path 输入框的值对应的字段
     * @param {string} value 输入框的值
     * @return: 无
     */
    onSearch = (path, value) => {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(() => {
            this.reloadType(path, value)
        }, 500)
    }

    /**
     * @description: 禁用不可选择的月份（小于存货启用期间的月份不可选）
     * @param {moment} current 单元格内的文本
     * @return: 不可选择月份
     */
    disabledDate = current => {
        let startperiod = this.motime
        return current < moment(startperiod)
    }

    /**
     * @description: 给“本月合计”和“本年累计”的行添加样式类名
     * @param {object} record 表格的行的数据
     * @return: 不可选择月份
     */
    renderRowClassName = (record, index) => {
        if (record.serviceTypeName == "本月合计" || record.serviceTypeName == "本年累计") {
            return "tr_heji"
        } else {
            return ""
        }
    }

    /* 解析数据 */
    dealWithData = list => {
        let rowData = deepClone(list)
        for (let item of rowData) {
            item.rowSpanNum = 1

            const serviceTypeNameArr = [],
                sheetCodeArr = [],
                sheetDateArr = [],
                rkNumArr = [],
                rkPriceArr = [],
                rkBalanceArr = [],
                ckNumArr = [],
                ckPriceArr = [],
                ckBalanceArr = [],
                kcNumArr = [],
                kcPriceArr = [],
                kcBalanceArr = []

            if (item.stockDetailSubDtoList && item.stockDetailSubDtoList.length > 0) {
                item.rowSpanNum = item.stockDetailSubDtoList.length
                const rowArr = item.stockDetailSubDtoList.map((v, idx) => {
                    let {
                        serviceTypeName,
                        sheetCode,
                        // voucherIds,
                        // type,
                        sheetDate,
                        rkNum,
                        rkPrice,
                        rkBalance,
                        ckNum,
                        ckPrice,
                        ckBalance,
                        kcNum,
                        kcPrice,
                        kcBalance,
                    } = v

                    let classN = "",
                        typeClass = ""
                    if (v.serviceTypeName === "本月合计") {
                        classN = "staticStyle1"
                        typeClass = "staticStyle1 fontBold"
                    } else if (v.serviceTypeName === "本年累计") {
                        classN = "staticStyle2"
                        typeClass = "staticStyle2 fontBold"
                    } else {
                        typeClass = classN = idx % 2 === 1 ? "baseDiv bgBlack" : "baseDiv bgWhite"
                    }

                    // 数据的格式区分处理（本月合计、本年累计）
                    if (v.serviceTypeName === "本月合计" || v.serviceTypeName === "本年累计") {
                        rkNum = formatSixDecimal(rkNum)
                        // rkPrice = transToNum(rkPrice) ? formatSixDecimal(rkPrice) : ""
                        rkPrice = ""
                        rkBalance = utils.number.format(rkBalance, 2)
                        ckNum = formatSixDecimal(ckNum)
                        // ckPrice = transToNum(ckPrice) ? formatSixDecimal(ckPrice) : ""
                        ckPrice = ""
                        ckBalance = utils.number.format(ckBalance, 2)
                        kcNum = formatSixDecimal(kcNum)
                        // kcPrice = transToNum(kcPrice) ? formatSixDecimal(kcPrice) : ""
                        kcPrice = ""
                        kcBalance = utils.number.format(kcBalance, 2)
                    } else if (v.serviceTypeName === "成本调整") {
                        rkNum = (rkNum && formatSixDecimal(rkNum)) || ""
                        rkPrice = (rkPrice && formatSixDecimal(rkPrice)) || ""
                        rkBalance = (rkBalance && utils.number.format(rkBalance, 2)) || ""
                        ckNum = formatSixDecimal(ckNum)
                        ckPrice = formatSixDecimal(ckPrice)
                        ckBalance = utils.number.format(ckBalance, 2)
                        kcNum = formatSixDecimal(kcNum)
                        kcPrice = formatSixDecimal(kcPrice)
                        kcBalance = utils.number.format(kcBalance, 2)
                    } else {
                        rkNum = (rkNum && formatSixDecimal(rkNum)) || ""
                        rkPrice = (rkPrice && formatSixDecimal(rkPrice)) || ""
                        rkBalance = (rkBalance && utils.number.format(rkBalance, 2)) || ""
                        ckNum = (ckNum && formatSixDecimal(ckNum)) || ""
                        ckPrice = (ckPrice && formatSixDecimal(ckPrice)) || ""
                        ckBalance = (ckBalance && utils.number.format(ckBalance, 2)) || ""
                        kcNum = (kcNum && formatSixDecimal(kcNum)) || ""
                        kcPrice = (kcPrice && formatSixDecimal(kcPrice)) || ""
                        kcBalance = utils.number.format(kcBalance, 2)
                    }

                    serviceTypeNameArr.push(
                        <div className={typeClass} title={serviceTypeName}>
                            {" "}
                            {serviceTypeName}{" "}
                        </div>
                    )
                    sheetCodeArr.push(
                        <div className={classN} title={sheetCode}>
                            <div
                                className="sfc-detail-sheetCode-link"
                                onClick={
                                    sheetCode
                                        ? e => {
                                              e.stopPropagation()
                                              e.nativeEvent.stopImmediatePropagation()
                                              this.clickSheetCode(v, sheetCode)
                                          }
                                        : void 0
                                }>
                                {sheetCode}
                            </div>
                        </div>
                    )
                    sheetDateArr.push(
                        <div className={classN} title={sheetDate}>
                            {" "}
                            {sheetDate}{" "}
                        </div>
                    )
                    rkNumArr.push(
                        <div className={classN} title={rkNum}>
                            {" "}
                            {rkNum}{" "}
                        </div>
                    )
                    rkPriceArr.push(
                        <div className={classN} title={rkPrice}>
                            {" "}
                            {rkPrice}{" "}
                        </div>
                    )
                    rkBalanceArr.push(
                        <div className={classN} title={rkBalance}>
                            {" "}
                            {rkBalance}{" "}
                        </div>
                    )
                    ckNumArr.push(
                        <div className={classN} title={ckNum}>
                            {" "}
                            {ckNum}{" "}
                        </div>
                    )
                    ckPriceArr.push(
                        <div className={classN} title={ckPrice}>
                            {" "}
                            {ckPrice}{" "}
                        </div>
                    )
                    ckBalanceArr.push(
                        <div className={classN} title={ckBalance}>
                            {" "}
                            {ckBalance}{" "}
                        </div>
                    )
                    kcNumArr.push(
                        <div className={classN} title={kcNum}>
                            {" "}
                            {kcNum}{" "}
                        </div>
                    )
                    kcPriceArr.push(
                        <div className={classN} title={kcPrice}>
                            {" "}
                            {kcPrice}{" "}
                        </div>
                    )
                    kcBalanceArr.push(
                        <div className={classN} title={kcBalance}>
                            {" "}
                            {kcBalance}{" "}
                        </div>
                    )

                    return v
                })
            }

            item["serviceTypeNameArr"] = serviceTypeNameArr
            item["sheetCodeArr"] = sheetCodeArr
            item["sheetDateArr"] = sheetDateArr
            item["rkNumArr"] = rkNumArr
            item["rkPriceArr"] = rkPriceArr
            item["rkBalanceArr"] = rkBalanceArr
            item["ckNumArr"] = ckNumArr
            item["ckPriceArr"] = ckPriceArr
            item["ckBalanceArr"] = ckBalanceArr
            item["kcNumArr"] = kcNumArr
            item["kcPriceArr"] = kcPriceArr
            item["kcBalanceArr"] = kcBalanceArr
        }

        this.resizeTable() // 计算表格的宽高

        return rowData
    }

    computeColWidth = () => {
        const isTrident = /Trident\/(\S+)/.test(navigator.userAgent) ? 16 : 0
        if (!isTrident) {
            this.sumWidth = 1704
            return
        }
        let sumWidth = 0
        for (const item of columnData) {
            if (isTrident) {
                if (item.children) {
                    for (const el of item.children) {
                        el.width += isTrident
                        sumWidth += el.width
                    }
                } else {
                    item.width += isTrident
                    sumWidth += item.width
                }
            }
        }
        this.sumWidth = sumWidth
    }

    /* 解析表格字段 */
    dealWithCol = () => {
        for (const item of columnData) {
            if (
                ["inventoryCode", "inventoryName", "inventoryUnit", "inventoryGuiGe"].includes(
                    item.dataIndex
                )
            ) {
                const classN =
                    item.dataIndex === "inventoryName"
                        ? "rowSpanDiv textAlignL"
                        : "rowSpanDiv textAlignC"
                item.render = (text, row, index) => {
                    return (
                        <div
                            style={{
                                height: `${37 * row.rowSpanNum}px`,
                                lineHeight: `${37 * row.rowSpanNum}px`,
                            }}
                            className={classN}
                            title={text}>
                            {text}
                        </div>
                    )
                }
            } else {
                let align = item.dataIndex === "serviceTypeNameArr" ? "textAlignL" : "textAlignC"

                if (item.children && item.children.length > 0) {
                    for (const ite of item.children) {
                        ite.render = (text, row, index) => {
                            let className = ite.key.includes("Num") ? "textAlignL" : "textAlignR"
                            if (ite.dataIndex === "kcBalanceArr") {
                                className += " kcBalanceArr"
                            }
                            return <div className={className}>{row[ite.dataIndex]}</div>
                        }
                    }
                } else {
                    item.render = (text, row, index) => {
                        return <div className={align}>{row[item.dataIndex]}</div>
                    }
                }
            }
        }
        return columnData
    }

    /* 重新计算表格的宽高 */
    resizeTable = () => {
        const ele = document.querySelector(".ttk-stock-app-statements-sfc-detail-contentlist")
        if (!ele) {
            let timer = setTimeout(() => {
                clearTimeout(timer)
                timer = null
                this.resizeTable()
            }, 300)
            return
        }
        let tableW = (ele && ele.offsetWidth) || 0
        const tableH = (ele && ele.offsetHeight - 88 + 6) || 0
        tableW = this.dealColWidth(tableW)
        const obj = { tableW, tableH }
        this.metaAction.sf("data.obj", fromJS(obj))
    }

    // 宽屏自适应
    dealColWidth = tableW => {
        const isTrident = /Trident\/(\S+)/.test(navigator.userAgent) ? 16 : 0
        // 1700为初始宽度，16为总列数

        if (tableW <= 1704 || (isTrident && tableW <= 1956)) {
            this.sumWidth = isTrident ? 1956 : 1704
            return tableW
        }
        let increment = Math.floor((tableW - this.sumWidth) / 16)
        let sumWidth = 0
        for (const item of columnData) {
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
        this.sumWidth = sumWidth
        return this.sumWidth
    }

    /* 渲染表格 */
    renderTable = () => {
        const list =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        const obj = (this.metaAction.gf("data.obj") && this.metaAction.gf("data.obj").toJS()) || {}
        const { tableW, tableH } = obj
        const cols = this.dealWithCol()
        const nowTime = new Date().getTime() + Math.random()
        const isTrident = /Trident\/(\S+)/.test(navigator.userAgent) ? "isTrident" : ""

        if (list && list.length > 0) {
            return (
                <div className="ttk-stock-app-statements-sfc-detail-table">
                    <VirtualTable
                        className={isTrident}
                        key={nowTime}
                        style={{ width: `${tableW}px`, minHeight: `${tableH}px` }}
                        columns={cols}
                        rowHeight={index => list[index].rowSpanNum * 37}
                        dataSource={list}
                        scroll={{ y: tableH, x: this.sumWidth && this.sumWidth + 2 }}
                        bordered
                        width={tableW}
                        headerHeight={78}
                        allowResizeColumn
                    />
                </div>
            )
        } else {
            return (
                <Table
                    name="general-list-table"
                    className="ttk-stock-app-statements-sfc-detail-Body  mk-layout"
                    key="table-small-custom"
                    bordered={true}
                    scroll={{ x: "100%" }}
                    dataSource={[]}
                    columns={cols}
                    pagination={false}
                    emptyShowScroll={true}
                />
            )
        }
    }

    renderHeader = () => {
        const enableDate = this.metaAction.gf("data.form.enableDate"),
            endPeriod = this.metaAction.gf("data.form.endPeriod")
        return (
            <React.Fragment>
                <MonthRangePicker
                    periodRange={[enableDate, endPeriod]}
                    disabledDate={this.motime}
                    handleChange={this.changereload}
                    className="ttk-stock-app-statements-sfc-detail-content-title-monthRangePicker"
                />
                <div style={{ top: 10, right: 70, position: "absolute" }}>
                    <PrintButton className="print-btn" {...this.getPrintProps()} />
                </div>
                <Button
                    className="ttk-stock-app-inventory-span sfc-detail-export"
                    onClick={this.reportDetial}
                    children="导出"
                />
            </React.Fragment>
        )
    }

    /* 点击表单编号 */
    clickSheetCode = async (item, value) => {
        const filed = item && item.sheetCode && item.sheetCode.slice(0, 4)
        const { sheetTitleId, voucherIds, type, serviceTypeName, inventoryId } = item

        if (serviceTypeName === "采购入库") {
            this.lookDtile(sheetTitleId, voucherIds, type, serviceTypeName)
        } else if (serviceTypeName === "销售出库") {
            this.lookXSCK(sheetTitleId, voucherIds, type)
        } else if (
            serviceTypeName === "暂估入库" ||
            serviceTypeName === "暂估回冲" ||
            serviceTypeName === "生产领料"
        ) {
            this.lookshow(sheetTitleId, serviceTypeName)
        } else if (serviceTypeName === "完工入库") {
            this.lookDetail(inventoryId)
        } else {
            this.lookOtherSheet(sheetTitleId, filed)
        }
    }

    /* 查看采购入库单或销售收入库单 */
    lookDtile = async (id, voucherIds, type, serviceTypeName) => {
        let ret = ""
        ret = await this.metaAction.modal("show", {
            title: "查看",
            style: { top: 25 },
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                padding: "20px 30px",
                overflow: "auto",
            },
            footer: null,
            children: this.metaAction.loadApp("app-purchase-look", {
                store: this.component.props.store,
                id: id,
                serviceTypeCode: serviceTypeName === "采购入库" ? "CGRK" : "XSCB",
                type: type,
                fromType: "收发存明细表",
                titleName: serviceTypeName + "单",
                // unEditable: true   // 是否不可编辑
            }),
        })
    }

    /*查看销售出库单*/
    lookXSCK = async (id, voucherIds, type) => {
        id = id ? id : null
        let ret = await this.metaAction.modal("show", {
            title: "查看",
            style: { top: 25 },
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                padding: "20px 30px",
                overflow: "auto",
            },
            footer: null,
            children: this.metaAction.loadApp("purchase-ru-ku-add-alert-new", {
                store: this.component.props.store,
                formName: "销售出库单",
                id: id,
                voucherIds: voucherIds ? voucherIds : null,
                type: type,
                period: this.getStockPeriod(),
                isReadonly: true,
                hideButton: true,
            }),
        })
    }

    /* 查看暂估入库、暂估冲回 或 生产领料单 */
    lookshow = async (id, serviceTypeName) => {
        const serviceTypeObj = {
            暂估入库: "ZGRK",
            暂估回冲: "ZGHC",
            生产领料: "SCLL",
        }
        let flag = this.metaAction.gf("data.limit.stateNow") ? true : false
        let ret = ""
        ret = await this.metaAction.modal("show", {
            title: "查看",
            style: { top: 25 },
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                padding: "20px 30px",
                overflow: "auto",
            },
            footer: null,
            children: this.metaAction.loadApp("ttk-stock-app-inventory-look", {
                store: this.component.props.store,
                id: id,
                flag: flag,
                serviceTypeCode: serviceTypeObj[serviceTypeName],
                titleName: serviceTypeName + "单",
            }),
        })
    }

    /* 查看完工入库单 */
    lookDetail = async inventoryId => {
        let time = this.metaAction.gf("data.form.enableDate")
        const ret = this.metaAction.modal("show", {
            title: "查看",
            style: { top: 25 },
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                padding: "20px 30px",
                overflow: "auto",
            },
            okText: "确定",
            okButtonProps: {
                style: { display: "none" },
            },
            children: (
                <CompletionOfWarehousingLook
                    store={this.component.props.store}
                    metaAction={this.metaAction}
                    inventoryId={inventoryId}
                    period={time}
                    webapi={this.webapi}
                    endCostType={this.endCostType}
                />
            ),
        })
    }

    /* 查看其它出入库单据 */
    lookOtherSheet = async (id, filed) => {
        const inveBusiness = this.inveBusiness || ""
        const ret = await this.metaAction.modal("show", {
            title: "查看",
            style: { top: 25 },
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                overflow: "auto",
            },
            footer: false,
            children: (
                <AddStockOrrders
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                    inveBusiness={inveBusiness}
                    type={filed}
                    id={id}
                    isReadOnly={true}
                />
            ),
        })
        // if (ret) {
        //  this.initPage()
        // }
    }
    getSearchParams = () => {
        let level = this.metaAction.gf("data.level")
        let inventoryId =
            (this.metaAction.gf("data.treeSelectedKey") &&
                this.metaAction.gf("data.treeSelectedKey").toJS()) ||
            []
        let name = this.metaAction.context.get("currentOrg").name,
            datatime = this.metaAction.gf("data.form.enableDate"),
            endPeriod = this.metaAction.gf("data.form.endPeriod")
        const params = { period: datatime, endPeriod, name: name }
        switch (level) {
            case 1:
                break
            case 2:
                params.inventoryClassId = inventoryId[0]
                break
            default:
                params.inventoryId = inventoryId[0]
                break
        }
        return params
    }

    getPrintProps = () => {
        const list = this.metaAction.gf("data.list").toJS()
        return {
            printType: 2,
            params: {
                codeType: "SFCMX",
            },
            disabled: !(Array.isArray(list) && list.length > 0),
            getSearchParams: this.getSearchParams,
        }
    }
    /* 导出明细 (excel) */
    reportDetial = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "批量导出",
            okText: "确定",
            children: this.metaAction.loadApp("ttk-stock-app-report-export", {
                store: this.component.props.store,
            }),
        })
        if (ret) {
            this.webapi.export({ ...this.getSearchParams(), exportType: ret })
        }
    }

    /**
     * @description: 表格展开和收小
     * @return: 无
     */
    clickArrow = data => {
        const isLeft = fromJS(this.metaAction.gf("data.imgbac"))
        let direction = isLeft ? "" : "arrowRight"
        this.metaAction.sf("data.imgbac", direction)

        clearTimeout(this.timeoutTimer)
        this.timeoutTimer = setTimeout(() => {
            this.resizeTable()
        }, 180)
    }

    getTableScroll = e => {
        try {
            let tableOption =
                (this.metaAction.gf("data.tableOption") &&
                    this.metaAction.gf("data.tableOption").toJS()) ||
                {}
            let appDom = document.getElementsByClassName("ttk-stock-app-statements-sfc-detail")[0] //以app为检索范围
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

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num =
                    tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight
                const width = tableWrapperDom.offsetWidth
                const height = tableWrapperDom.offsetHeight
                this.injections.reduce("setTableOption", {
                    ...tableOption,
                    y: height - theadDom.offsetHeight,
                    x: 1000,
                })
            }
        } catch (err) {}
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}
