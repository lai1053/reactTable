import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import { columnData } from "./fixedData"
import { fromJS } from "immutable"
import config from "./config"
import extend from "./extend"
import { Tree, Table, DatePicker, Button } from "edf-component"
import VirtualTable from "../../invoices/components/VirtualTable/index"
import moment from "moment"
import { moment as momentUtil } from "edf-utils"
import {
    formatSixDecimal,
    deepClone,
    addEvent,
    removeEvent,
    denyClick,
    stockLoading,
    getClientSize,
    canClickTarget,
} from "../commonAssets/js/common"
import utils from "edf-utils"
import MonthRangePicker from "../components/common/MonthRangePicker"
import PrintButton from "../components/common/PrintButton"
// import CompletionOfWarehousingLook from '../components/CompletionOfWarehousingLook'
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

        let summaryParams = this.component.props || {}
        let id = summaryParams.inventoryId
        let inventoryClassId = summaryParams.inventoryClassId
        let time = summaryParams.period

        this.name = this.metaAction.context.get("currentOrg").name
        if (id) {
            // const storeId = sessionStorage["zgDetail-stockId" + this.name]
            // const storeTime = sessionStorage["zgDetail-period" + this.name] || ""
            // if (!storeId || !moment(time).isSame(storeTime, "month") || storeId != id) {
            this.detialLoad(id, time, summaryParams.endPeriod, inventoryClassId)
            this.metaAction.sfs({
                "data.treeSelectedKey": fromJS([(id && id.toString()) || ""]),
                "data.expandedKeys": fromJS([
                    "0",
                    (inventoryClassId && inventoryClassId.toString()) || "",
                ]),
                "data.level": 3,
            })
            // } else {
            //     this.load()
            // }
        } else {
            this.load(true)
        }
    }

    componentWillUpdate = (nextprops, nextstate) => {
        let summaryParams = nextprops || {}
        let { inventoryId, inventoryClassId, period, endPeriod } = summaryParams
        const fromPage = sessionStorage["fromPage" + this.name]
        if (fromPage == "ttk-stock-app-statements-zg-summary" && inventoryId) {
            const storeId = sessionStorage["zgDetail-stockId" + this.name]
            const storeTime = sessionStorage["zgDetail-period" + this.name] || ""
            const storeEndTime = sessionStorage["zgDetail-endPeriod" + this.name] || ""
            if (
                !storeId ||
                !moment(period).isSame(storeTime, "month") ||
                !moment(endPeriod).isSame(storeEndTime, "month") ||
                storeId != inventoryId
            ) {
                this.detialLoad(inventoryId, period, endPeriod, inventoryClassId)
                this.metaAction.sfs({
                    "data.treeSelectedKey": fromJS([(inventoryId && inventoryId.toString()) || ""]),
                    "data.expandedKeys": fromJS([
                        "0",
                        (inventoryClassId && inventoryClassId.toString()) || "",
                    ]),
                    "data.level": 3,
                })
            }
            sessionStorage["fromPage" + name] = "ttk-stock-app-statements-zg-detail"
        }
    }

    componentDidMount = (nextprops, nextstate) => {
        this.computeColWidth()
        addEvent(window, "resize", ::this.resizeTable)
        // setTimeout(() => {
        //  this.getTableScroll()
        // }, 100)
    }

    componentWillUnmount = () => {
        sessionStorage["fromPage" + name] = "ttk-stock-app-statements-sfc-detail"
        this[`deny-statements-zg-detailClickFlag`] = null
        removeEvent(window, "resize", ::this.resizeTable)
    }

    stockLoading = param => stockLoading(param)

    /**
     * @description: 页面数据初始化
     * @return: 无
     */
    load = async selectFirstChild => {
        const accountPeriod = this.getStockPeriod(),
            { id } = this.getContext()
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
        // listFun = this.webapi.query({'period': accountPeriod})

        let invSet = await getInvSetByPeroid, // 账套信息
            businessType = await qAllFun, // 业务类型
            treeList = (await treeFun) || {}, // 数结构的数据
            list = await this.webapi.query({
                orgId: id, //--企业id，必填
                period: accountPeriod, //--月份，必填
                endPeriod: accountPeriod,
                inventoryId: !selectFirstChild
                    ? undefined
                    : (Array.isArray(treeList.list) && treeList.list[0] && treeList.list[0].id) ||
                      undefined,
            }), // 明细表的数据
            stateNow = false // 当前存货是否已启用
        if (invSet) {
            this.endCostType = invSet.endCostType
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
        if (selectFirstChild && Array.isArray(treeList.list)) {
            this.metaAction.sfs({
                "data.treeSelectedKey": fromJS([
                    (treeList.list[0] && treeList.list[0].id.toString()) || "",
                ]),
                "data.level": 3,
            })
        }
        // setTimeout(() => {this.getTableScroll()}, 100)
    }

    /**
     * @description: 请求单个存货明细
     * @param {string} id 存货id
     * @param {string} time 当前会计期间
     * @param {string} inventoryClassId 存货类型id
     * @return: 无
     */
    detialLoad = async (inventoryId, time, endPeriod, inventoryClassId) => {
        let { name, id } = this.getContext()
        sessionStorage["zgDetail-stockId" + name] = inventoryId
        sessionStorage["zgDetail-period" + name] = time
        sessionStorage["zgDetail-endPeriod" + this.name] = endPeriod

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
            listFun = this.webapi.query({
                orgId: id, //--企业id，必填
                period: time, //--月份，必填
                endPeriod,
                inventoryId: inventoryId, //--存货id
            }),
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
        // setTimeout(() => {this.getTableScroll()}, 100)
    }

    /**
     * @description: 获取当前会计期间
     * @return: 获取当前会计期间
     */
    getStockPeriod = () => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
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
        let name = "ttk-stock-app-statements-zg-detail ttk-stock-app-statements-zg-detailNoBorder"
        if (this.component.props.modelStatus && this.component.props.modelStatus == 1) {
            name = "ttk-stock-app-statements-zg-detail"
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
        let id = (this.metaAction.context.get("currentOrg") || {}).id || "",
            inventoryId = this.metaAction.gf("data.treeSelectedKey").toJS() || [],
            time = momentUtil.stringToMoment(range[0]).format("YYYY-MM"),
            level = this.metaAction.gf("data.level"),
            list = [],
            reqOption = { orgId: id, period: time, endPeriod: range[1] }
        // console.log(this.metaAction.gf("data.treeSelectedKey").toJS())
        if (level == 2) {
            reqOption.inventoryClassId = inventoryId[0]
        } else if (level == 3) {
            reqOption.inventoryId = inventoryId[0]
        }
        const getInvSetByPeroid = this.webapi.getInvSetByPeroid({ period: time })
        list = await this.webapi.query(reqOption)
        list = this.dealWithData(list || [])
        this.injections.reduce("reload", list)

        const invSet = await getInvSetByPeroid
        if (invSet) {
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
        let id = (this.metaAction.context.get("currentOrg") || {}).id || "",
            selectedNode = info.selectedNodes[0], // 选中的树节点id
            level = selectedNode.props.dataRef.level, // 第几级树节点
            levelNum = 1, // 默认是第一级
            reqList = { period: time, endPeriod, orgId: id } // 请求参数

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

    getContext = () => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        return currentOrg
    }
    /**
     * @description: 树上方的搜索框，可支持编码和存货名称查询
     * @param {string} path 输入框的值对应的字段
     * @param {string} inputVal 输入框的值
     * @return: 无
     */
    reloadType = async (path, inputVal) => {
        let datatime = this.metaAction.gf("data.form.enableDate"),
            { id } = this.getContext(),
            endPeriod = this.metaAction.gf("data.form.endPeriod")
        this.metaAction.sf("data.treeLoading", true)
        const qAllFun = this.webapi.queryAll({}),
            treeFun = this.webapi.queryList({
                entity: { fuzzyCondition: inputVal, propertyId: "" },
                page: { currentPage: 1, pageSize: 500000 },
            }),
            listFun = this.webapi.query({
                orgId: id,
                period: datatime,
                endPeriod,
            })

        const businessType = await qAllFun,
            treeList = (await treeFun) || {}
        let list = await listFun
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

    /* 处理格式化的问题 */
    dealDecimal = v => {
        if (Object.prototype.toString.call(v) != "[object Object]") {
            v = {}
        }

        let zgrkNum,
            zgrkPrice,
            zgrkBalance,
            zghcNum,
            zghcPrice,
            zghcBalance,
            bqkcNum,
            bqkcPrice,
            bqkcBalance

        if (v.serviceTypeName != "本月合计" && v.serviceTypeName != "本年累计") {
            zgrkNum = (parseFloat(v.zgrkNum) && formatSixDecimal(v.zgrkNum)) || ""
            zgrkPrice = (parseFloat(v.zgrkPrice) && formatSixDecimal(v.zgrkPrice)) || ""
            zgrkBalance = (parseFloat(v.zgrkBalance) && utils.number.format(v.zgrkBalance, 2)) || ""
            zghcNum = (parseFloat(v.zghcNum) && formatSixDecimal(v.zghcNum)) || ""
            zghcPrice = (parseFloat(v.zghcPrice) && formatSixDecimal(v.zghcPrice)) || ""
            zghcBalance = (parseFloat(v.zghcBalance) && utils.number.format(v.zghcBalance, 2)) || ""
            bqkcNum = (parseFloat(v.bqkcNum) && formatSixDecimal(v.bqkcNum)) || ""
            bqkcPrice = (parseFloat(v.bqkcPrice) && formatSixDecimal(v.bqkcPrice)) || ""
            bqkcBalance = (parseFloat(v.bqkcBalance) && utils.number.format(v.bqkcBalance, 2)) || ""
        } else {
            zgrkNum = formatSixDecimal(v.zgrkNum)
            // zgrkPrice = formatSixDecimal(v.zgrkPrice)
            zgrkPrice = ""
            zgrkBalance = utils.number.format(v.zgrkBalance, 2)
            zghcNum = formatSixDecimal(v.zghcNum)
            // zghcPrice = formatSixDecimal(v.zghcPrice)
            zghcPrice = ""
            zghcBalance = utils.number.format(v.zghcBalance, 2)
            bqkcNum = formatSixDecimal(v.bqkcNum)
            // bqkcPrice = formatSixDecimal(v.bqkcPrice)
            bqkcPrice = ""
            bqkcBalance = utils.number.format(v.bqkcBalance, 2)
        }
        return {
            zgrkNum,
            zgrkPrice,
            zgrkBalance,
            zghcNum,
            zghcPrice,
            zghcBalance,
            bqkcNum,
            bqkcPrice,
            bqkcBalance,
        }
    }
    /* 解析数据 */
    dealWithData = list => {
        let rowData = deepClone(list)
        rowData = rowData.map((item, idxNum) => {
            item.rowSpanNum = 0 // 合并的行数

            if (item.repZgDetailSubDtoList && item.repZgDetailSubDtoList.length > 0) {
                item.repZgDetailSubDtoList = item.repZgDetailSubDtoList.map((v, index) => {
                    v.relatedRowSpan = 1 //关联单据的合并行数

                    let decimal = index % 2
                    if (v.repZgDetailSubDtoList && v.repZgDetailSubDtoList.length > 0) {
                        item.rowSpanNum += v.repZgDetailSubDtoList.length //一条存货的合并总行数
                        v.relatedRowSpan = v.repZgDetailSubDtoList.length //关联单据的合并行数

                        const relatedCode = [],
                            rkNum = [],
                            rkPrice = [],
                            rkBalance = [],
                            chNum = [],
                            chPrice = [],
                            chBalance = [],
                            qmNum = [],
                            qmPrice = [],
                            qmBalance = []

                        v.repZgDetailSubDtoList.map((i, idx) => {
                            let {
                                zgrkNum,
                                zgrkPrice,
                                zgrkBalance,
                                zghcNum,
                                zghcPrice,
                                zghcBalance,
                                bqkcNum,
                                bqkcPrice,
                                bqkcBalance,
                            } = this.dealDecimal(i)
                            let cellStyle =
                                v.serviceTypeName != "本月合计" && v.serviceTypeName != "本年累计"
                                    ? "borderD9"
                                    : v.serviceTypeName === "本年累计"
                                    ? "staticBg"
                                    : "borderD9  staticBg"
                            const bgColor = (idx + decimal) % 2 === 0 ? `bgOdd` : `bgEven`
                            cellStyle = `${cellStyle} ${bgColor}`

                            relatedCode.push(
                                <div
                                    className={`${cellStyle} zg-detail-sheetCode-link`}
                                    onClick={
                                        i.relatedSheetCode
                                            ? e => {
                                                  e.stopPropagation()
                                                  e.nativeEvent.stopImmediatePropagation()
                                                  this.clickSheetCodeRelated(i)
                                              }
                                            : void 0
                                    }
                                    title={i.relatedSheetCode}>
                                    {i.relatedSheetCode}
                                </div>
                            )
                            rkNum.push(
                                <div className={`${cellStyle} alignL`} title={zgrkNum}>
                                    {" "}
                                    {zgrkNum}{" "}
                                </div>
                            )
                            rkPrice.push(
                                <div className={`${cellStyle} alignR`} title={zgrkPrice}>
                                    {" "}
                                    {zgrkPrice}{" "}
                                </div>
                            )
                            rkBalance.push(
                                <div className={`${cellStyle} alignR`} title={zgrkBalance}>
                                    {" "}
                                    {zgrkBalance}{" "}
                                </div>
                            )
                            chNum.push(
                                <div className={`${cellStyle} alignL`} title={zghcNum}>
                                    {" "}
                                    {zghcNum}{" "}
                                </div>
                            )
                            chPrice.push(
                                <div className={`${cellStyle} alignR`} title={zghcPrice}>
                                    {" "}
                                    {zghcPrice}{" "}
                                </div>
                            )
                            chBalance.push(
                                <div className={`${cellStyle} alignR`} title={zghcBalance}>
                                    {" "}
                                    {zghcBalance}{" "}
                                </div>
                            )
                            qmNum.push(
                                <div className={`${cellStyle} alignL`} title={bqkcNum}>
                                    {" "}
                                    {bqkcNum}{" "}
                                </div>
                            )
                            qmPrice.push(
                                <div className={`${cellStyle} alignR`} title={bqkcPrice}>
                                    {" "}
                                    {bqkcPrice}{" "}
                                </div>
                            )
                            qmBalance.push(
                                <div className={`${cellStyle} alignR`} title={bqkcBalance}>
                                    {" "}
                                    {bqkcBalance}{" "}
                                </div>
                            )
                            return i
                        })

                        v["relatedSheetCodeArr"] = relatedCode
                        v["zgrkNumArr"] = rkNum
                        v["zgrkPriceArr"] = rkPrice
                        v["zgrkBalanceArr"] = rkBalance
                        v["zghcNumArr"] = chNum
                        v["zghcPriceArr"] = chPrice
                        v["zghcBalanceArr"] = chBalance
                        v["bqkcNumArr"] = qmNum
                        v["bqkcPriceArr"] = qmPrice
                        v["bqkcBalanceArr"] = qmBalance
                    } else {
                        item.rowSpanNum += 1
                        v.relatedRowSpan = 1
                        v["relatedSheetCodeArr"] = []
                        v["zgrkNumArr"] = []
                        v["zgrkPriceArr"] = []
                        v["zgrkBalanceArr"] = []
                        v["zghcNumArr"] = []
                        v["zghcPriceArr"] = []
                        v["zghcBalanceArr"] = []
                        v["bqkcNumArr"] = []
                        v["bqkcPriceArr"] = []
                        v["bqkcBalanceArr"] = []

                        let {
                            zgrkNum,
                            zgrkPrice,
                            zgrkBalance,
                            zghcNum,
                            zghcPrice,
                            zghcBalance,
                            bqkcNum,
                            bqkcPrice,
                            bqkcBalance,
                        } = this.dealDecimal(v)
                        let cellStyle =
                            v.serviceTypeName != "本月合计" && v.serviceTypeName != "本年累计"
                                ? "borderD9"
                                : v.serviceTypeName === "本年累计"
                                ? "staticBg"
                                : "borderD9  staticBg"
                        const bgColor = index % 2 === 0 ? `bgOdd` : `bgEven` //index % 2 === 0 ? 'bgOdd' : 'bgEven'
                        cellStyle = `${cellStyle} ${bgColor}`

                        v["relatedSheetCodeArr"].push(
                            <div
                                className={`${cellStyle} zg-detail-sheetCode-link`}
                                title={v.relatedSheetCode}
                                onClick={
                                    v.relatedSheetCode
                                        ? e => {
                                              e.stopPropagation()
                                              e.nativeEvent.stopImmediatePropagation()
                                              this.clickSheetCodeRelated(v)
                                          }
                                        : void 0
                                }>
                                {v.relatedSheetCode}
                            </div>
                        )
                        v["zgrkNumArr"].push(
                            <div className={`${cellStyle} alignL`} title={zgrkNum}>
                                {" "}
                                {zgrkNum}{" "}
                            </div>
                        )
                        v["zgrkPriceArr"].push(
                            <div className={`${cellStyle} alignR`} title={zgrkPrice}>
                                {" "}
                                {zgrkPrice}{" "}
                            </div>
                        )
                        v["zgrkBalanceArr"].push(
                            <div className={`${cellStyle} alignR`} title={zgrkBalance}>
                                {" "}
                                {zgrkBalance}{" "}
                            </div>
                        )
                        v["zghcNumArr"].push(
                            <div className={`${cellStyle} alignL`} title={zghcNum}>
                                {" "}
                                {zghcNum}{" "}
                            </div>
                        )
                        v["zghcPriceArr"].push(
                            <div className={`${cellStyle} alignR`} title={zghcPrice}>
                                {" "}
                                {zghcPrice}{" "}
                            </div>
                        )
                        v["zghcBalanceArr"].push(
                            <div className={`${cellStyle} alignR`} title={zghcBalance}>
                                {" "}
                                {zghcBalance}{" "}
                            </div>
                        )
                        v["bqkcNumArr"].push(
                            <div className={`${cellStyle} alignL`} title={bqkcNum}>
                                {" "}
                                {bqkcNum}{" "}
                            </div>
                        )
                        v["bqkcPriceArr"].push(
                            <div className={`${cellStyle} alignR`} title={bqkcPrice}>
                                {" "}
                                {bqkcPrice}{" "}
                            </div>
                        )
                        v["bqkcBalanceArr"].push(
                            <div className={`${cellStyle} alignR`} title={bqkcBalance}>
                                {" "}
                                {bqkcBalance}{" "}
                            </div>
                        )
                    }
                    return v
                })
            }
            return item
        })

        this.resizeTable()

        return rowData
    }

    computeColWidth = () => {
        const isTrident = /Trident\/(\S+)/.test(navigator.userAgent) ? 16 : 0
        if (!isTrident) {
            this.sumWidth = 1848
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

    // 解析列字段
    dealWithCol = () => {
        const cols = deepClone(columnData)
        for (const item of cols) {
            if (
                ["inventoryName", "inventoryCode", "inventoryGuiGe", "inventoryUnit"].indexOf(
                    item.dataIndex
                ) < 0
            ) {
                item.render = (text, row, index) => {
                    return <div>{row[`${item.dataIndex}`]}</div>
                }

                if (
                    ["serviceTypeNameArr", "sheetDateArr", "sheetCodeArr"].indexOf(item.dataIndex) >
                    -1
                ) {
                    item.render = (text, row, index) => {
                        if (row.repZgDetailSubDtoList && row.repZgDetailSubDtoList.length > 0) {
                            const rowArr = []
                            let count = 1
                            row.repZgDetailSubDtoList.map((ite, idx) => {
                                count = ite["relatedRowSpan"]
                                const keyName =
                                    (item.dataIndex &&
                                        item.dataIndex.slice(0, item.dataIndex.length - 3)) ||
                                    ""
                                const content = ite[keyName]
                                const heightCount = count * 37
                                const styleCollect = {
                                    height: `${heightCount}px`,
                                    lineHeight: `${heightCount}px`,
                                }
                                const bgColor = idx % 2 === 0 ? "bgOdd" : "bgEven"
                                let classN =
                                    ite.serviceTypeName === "本月合计"
                                        ? "staticBg borderD9"
                                        : ite.serviceTypeName === "本年累计"
                                        ? "staticBg"
                                        : "borderD9"
                                if (
                                    (ite.serviceTypeName === "本月合计" ||
                                        ite.serviceTypeName === "本年累计") &&
                                    item.dataIndex === "serviceTypeNameArr"
                                ) {
                                    classN = `${classN} fontBold`
                                } else {
                                    classN = `${classN} ${bgColor}`
                                }
                                // 对单据号进行处理
                                if (item.dataIndex === "sheetCodeArr") {
                                    classN = `${classN} zg-detail-sheetCode-link`
                                    rowArr.push(
                                        <div
                                            style={styleCollect}
                                            className={classN}
                                            title={content}
                                            onClick={
                                                content
                                                    ? e => {
                                                          e.stopPropagation()
                                                          e.nativeEvent.stopImmediatePropagation()
                                                          this.clickSheetCode(ite)
                                                      }
                                                    : void 0
                                            }>
                                            {content}
                                        </div>
                                    )
                                } else {
                                    rowArr.push(
                                        <div
                                            style={styleCollect}
                                            className={classN}
                                            title={content}>
                                            {content}
                                        </div>
                                    )
                                }
                            })
                            return <div> {rowArr} </div>
                        } else {
                            return text || "--"
                        }
                    }
                }
                if (item.dataIndex === "relatedSheetCodeArr") {
                    item.render = (text, row, index) => {
                        const rowArr = []
                        if (row.repZgDetailSubDtoList && row.repZgDetailSubDtoList.length > 0) {
                            for (const ite of row.repZgDetailSubDtoList) {
                                rowArr.push(ite[`${item.dataIndex}`])
                            }
                        }
                        return <div> {rowArr} </div>
                    }
                }
            } else {
                //存货编码、名称、规格、单位等单元格渲染
                item.render = (text, row, index) => {
                    const rows = row.rowSpanNum || 1,
                        heightCount = rows * 37
                    return (
                        <div
                            style={{
                                height: `${heightCount}px`,
                                lineHeight: `${heightCount}px`,
                            }}
                            title={text}
                            className="baseDiv">
                            {text}
                        </div>
                    )
                }
            }

            if (item.children && item.children.length > 0) {
                for (const v of item.children) {
                    v.render = (text, row, index) => {
                        if (row.repZgDetailSubDtoList && row.repZgDetailSubDtoList.length > 0) {
                            const rowArr = []
                            for (var ite of row.repZgDetailSubDtoList) {
                                rowArr.push(ite[`${v.dataIndex}`])
                            }
                            return <div> {rowArr} </div>
                        } else {
                            return text || "--"
                        }
                    }
                }
            }
        }

        return cols
    }

    /* 重新计算表格的宽高 */
    resizeTable = () => {
        const ele = document.querySelector(".ttk-stock-app-statements-zg-detail-contentlist")
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
        // 1848为初始宽度，17为总列数

        if (tableW <= 1848 || (isTrident && tableW <= 2120)) {
            this.sumWidth = isTrident ? 2120 : 1848
            return tableW
        }
        let increment = Math.floor((tableW - this.sumWidth) / 17)
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

    getPrintProps = () => {
        const list = this.metaAction.gf("data.list").toJS()
        return {
            printType: 2,
            params: {
                codeType: "ZGMX",
            },
            disabled: !(Array.isArray(list) && list.length > 0),
            getSearchParams: this.getSearchParams,
        }
    }
    renderHeader = () => {
        const enableDate = this.metaAction.gf("data.form.enableDate"),
            endPeriod = this.metaAction.gf("data.form.endPeriod")
        return (
            <React.Fragment>
                {/* <DatePicker.MonthPicker 
                    placeholder="会计期间"
                    disabledDate={this.disabledDate}
                    className='ttk-stock-app-statements-zg-detail-content-period'
                    value={momentUtil.stringToMoment(enableDate,'YYYY-MM')}
                    onChange={(v) => {this.changereload('data.form.enableDate', momentUtil.momentToString(v,'YYYY-MM'))}}
                /> */}
                <MonthRangePicker
                    periodRange={[enableDate, endPeriod]}
                    disabledDate={this.motime}
                    handleChange={this.changereload}
                    className="ttk-stock-app-statements-zg-detail-content-monthRangePicker"
                />
                <div style={{ top: 10, right: 70, position: "absolute" }}>
                    <PrintButton className="print-btn" {...this.getPrintProps()} />
                </div>
                <Button
                    className="ttk-stock-app-statements-zg-detail-content-export"
                    onClick={this.reportDetial}
                    children="导出"
                />
            </React.Fragment>
        )
    }

    /*渲染表格*/
    renderTable = () => {
        const list =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        const obj = (this.metaAction.gf("data.obj") && this.metaAction.gf("data.obj").toJS()) || {}
        let { tableW, tableH } = obj
        const cols = this.dealWithCol()
        const tableKey = new Date().getTime() + Math.random()
        const isTrident = /Trident\/(\S+)/.test(navigator.userAgent) ? "isTrident" : ""

        if (list && list.length > 0 && tableH) {
            return (
                <div className="ttk-stock-app-statements-zg-detail-table">
                    <VirtualTable
                        className={"rowSpanTable " + isTrident}
                        key={tableKey}
                        style={{ width: `${tableW}px`, minHeight: `${tableH}px` }}
                        columns={cols}
                        rowHeight={index => {
                            const rows = list[`${index}`]["rowSpanNum"]
                            return rows * 37
                        }}
                        rowKey="inventoryId"
                        dataSource={list}
                        scroll={{ y: tableH, x: this.sumWidth + 2 }}
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
                    name="zgdetail-general-list-table"
                    className="ttk-stock-app-statements-zg-detail-Body mk-layout"
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

    clickSheetCode = async item => {
        // const typeCode = item.sheetCode && item.sheetCode.slice(0, 4)
        const typeCode = item.serviceTypeCode
        this.lookshow(item.sheetTitleId, typeCode)
    }

    clickSheetCodeRelated = async item => {
        // const typeCode = item.relatedSheetCode && item.relatedSheetCode.slice(0, 4)
        const typeCode = item.relatedServiceTypeCode
        this.lookshow(item.relatedSheetId, typeCode)
    }

    // 查看暂估入库、暂估冲回 或 采购入库单
    lookshow = async (sheetId, typeCode) => {
        const serviceTypeObj = {
            ZGRK: "暂估入库",
            ZGHC: "暂估回冲",
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
                id: sheetId,
                flag: flag,
                serviceTypeCode: typeCode,
                titleName: serviceTypeObj[typeCode] + "单",
            }),
        })
    }
    getSearchParams = (warningMsg = "打印失败！") => {
        let level = this.metaAction.gf("data.level"),
            inventoryId = this.metaAction.gf("data.treeSelectedKey").toJS(),
            datatime = this.metaAction.gf("data.form.enableDate"),
            endPeriod = this.metaAction.gf("data.form.endPeriod")
        const { name, id } = this.getContext()
        if (!name || !id) {
            throw new Error("暂估明细表获取不到企业名称或企业ID，" + warningMsg)
        }
        let params = {
            period: datatime,
            endPeriod,
            orgName: name,
            orgId: id,
        }
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
    // 导出明细 (excel)
    reportDetial = async () => {
        const hasClick = canClickTarget.getCanClickTarget("zgDetailOutport")
        if (!hasClick) {
            canClickTarget.setCanClickTarget("zgDetailOutport", true)
            let ret = ""
            ret = await this.metaAction.modal("show", {
                title: "批量导出",
                okText: "确定",
                children: this.metaAction.loadApp("ttk-stock-app-report-export", {
                    store: this.component.props.store,
                }),
            })
            if (ret) {
                const params = this.getSearchParams("导出excel失败！")
                params && this.webapi.export({ ...params, exportType: ret })
            }
            canClickTarget.setCanClickTarget("zgDetailOutport", false)
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
            let appDom = document.getElementsByClassName("ttk-stock-app-statements-zg-detail")[0] //以app为检索范围
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
