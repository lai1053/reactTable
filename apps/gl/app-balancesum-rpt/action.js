import React, { PureComponent } from "react"
import { action as MetaAction, AppLoader } from "edf-meta-engine"
import { Map, fromJS } from "immutable"
import config from "./config"
import {
    TableOperate,
    Select,
    Button,
    Modal,
    Checkbox,
    PrintOption3,
    Timeline,
    Icon,
    VirtualTable
} from "edf-component"
import { sortSearchOption } from "edf-utils"
import moment from "moment"
import utils from "edf-utils"
import { FormDecorator } from "edf-component"
import changeToOption from "./utils/changeToOption"
const Option = Select.Option
const TimelineItem = Timeline.Item
import { consts } from "edf-consts"
import renderColumns from "./utils/renderColumns"
import { LoadingMask } from "edf-component"

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
        this.selectedOption = []
        this.handleTimeLineItem = utils.throttle(this.handleTimeLineItem, 800)
        this.vTableRef = null
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener("onTabFocus", ::this.onTabFocus)
            // addEventListener('enlargeClick', () => this.onResize({}))
        }

        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start: moment(currentOrg.periodDate).startOf("month"),
            date_end: moment(currentOrg.periodDate).endOf("month")
        }

        injections.reduce("init", data)
        this.load()
        this.getInitOption()
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener("resize", this.onResize, false)
            window.removeEventListener("onTabFocus", this.onTabFocus, false)
            window.removeEventListener("enlargeClick", this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent("onresize", this.onResize)
            window.detachEvent("onTabFocus", this.onTabFocus)
            window.detachEvent("enlargeClick", () => this.onResize({}))
        } else {
            window.onresize = undefined
        }
        window.balanceSumAccountList = null
    }
    componentDidMount = () => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start: moment(currentOrg.periodDate).startOf("month"),
            date_end: moment(currentOrg.periodDate).endOf("month")
        }
        this.renderTimeLine(data)
        /*if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }*/
    }
    componentWillReceiveProps = ({ keydown }) => {
        if (keydown && keydown.event) {
            let e = keydown.event
            if (e.keyCode == 39 || e.keyCode == 40) {
                this.accountlistBtn("right")
            } else if (e.keyCode == 37 || e.keyCode == 38) {
                this.accountlistBtn("left")
            }
        }
    }
    load = async () => {
        let pageParam = {
            moduleKey: "app-balancesum-rpt",
            resourceKey: "app-balancesum-rpt-table"
        }
        let list = [
            this.webapi.balanceSumRpt.getPageSetting(pageParam),
            this.webapi.balanceSumRpt.getExistsDataScope()
        ]
        const res = await Promise.all(list)
        if (res) {
            let response = res[0]
            let page = this.metaAction.gf("data.pagination").toJS()
            let pageSizeOptions = ["50", "100", "150", "200", "1000"]
            if (response.pageSize) {
                let option = pageSizeOptions.find(
                    item => item == response.pageSize
                )
                if (option) {
                    page.pageSize = response.pageSize
                } else {
                    page.pageSize = pageSizeOptions[0]
                }
            }
            let timePeriod = res[1] || {}
            this.metaAction.sfs({
                "data.pagination": fromJS(page),
                "data.other.timePeriod": fromJS(timePeriod)
            })
        }
    }
    onTabFocus = async params => {
        /*this.metaAction.sfs({
            'data.other.matchBacktoZero': true,
            'data.other.matchIndex': -1
        })
*/
        let dom = document.getElementsByClassName("ant-table-body")[0]
        const showCheckbox =
            this.metaAction.gf("data.showCheckbox") &&
            this.metaAction.gf("data.showCheckbox").toJS()
        const showOption = this.metaAction.gf("data.showOption").toJS()
        params.showOption = showOption
        params.showCheckbox = showCheckbox
        // this.checkQuantityAndCurrency()
        const res = await this.webapi.balanceSumRpt.getExistsDataScope()
        /*this.metaAction.sfs({
            'data.other.currentTime': '',
            'data.other.timePeriod': fromJS(res || {}),
        })*/
        this.getInitOption("tabFocus", params.toJS(), res || {})
        this.injections.reduce("update", {
            path: "data.randomNum",
            value: Math.random()
        })
    }
    getSearchCard = childrenRef => {
        this.searchCard = childrenRef
    }
    clearValueChange = value => {
        const searchValue =
            this.metaAction.gf("data.searchValue") &&
            this.metaAction.gf("data.searchValue").toJS()
        // this.searchCard.clearValue()
        this.metaAction.sfs({
            "data.searchValue.currencyId": "0",
            // 'data.searchValue.noDataNoDisplay': ['1'],
            "data.searchValue.date_start": searchValue.init_date_start,
            "data.searchValue.date_end": searchValue.init_date_end,
            "data.searchValue.showAuxAccCalc": ["1"],
            "data.searchValue.onlyShowEndAccount": fromJS([]),
            "data.searchValue.showZero": ["1"],
            "data.searchValue.beginAccountGrade": 1,
            "data.searchValue.endAccountGrade": 5,
            "data.searchValue.beginAccountCode": undefined,
            "data.searchValue.endAccountCode": undefined,
            "data.other.gradeStyleStatus": false,
            "data.other.showAccountDis": false
        })
    }
    pageChanged = async (current, pageSize) => {
        let page = this.metaAction.gf("data.pagination").toJS()

        const len = this.metaAction.gf("data.list").toJS().length
        if (pageSize) {
            page = {
                ...page,
                currentPage: len == 0 ? 1 : current,
                pageSize: pageSize
            }
        } else {
            page = {
                ...page,
                currentPage: len == 0 ? 1 : current
            }
        }
        this.sortParmas(null, page)
    }
    sizePageChanged = async (current, pageSize) => {
        let page = this.metaAction.gf("data.pagination").toJS()

        const len = this.metaAction.gf("data.list").toJS().length
        if (pageSize) {
            page = {
                ...page,
                currentPage: len == 0 ? 1 : current,
                pageSize: pageSize
            }
        } else {
            page = {
                ...page,
                currentPage: len == 0 ? 1 : current
            }
        }
        this.sortParmas(null, page)
        let request = {
            moduleKey: "app-balancesum-rpt",
            resourceKey: "app-balancesum-rpt-table",
            settingKey: "pageSize",
            settingValue: pageSize
        }
        await this.webapi.balanceSumRpt.setPageSetting([request])
    }
    // 初始化基础信息选项
    getInitOption = async (type = "load", params, resFocus) => {
        let forwardingFlag = await this.webapi.balanceSumRpt.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast(
                "warning",
                "您修改了数据，系统正在重新计算，请稍后"
            )
        }
        //科目
        // const accountList = await this.webapi.balanceSumRpt.queryAccountList({})
        const currencyParams = {
            isContainComprehensiveCurrency: true,
            isContainAllForeignCurrency: true,
            isContainAllCurrency: true
        }

        let promiseList = [
            this.webapi.balanceSumRpt.queryForCurrency(currencyParams), // 币种列表
            this.webapi.balanceSumRpt.queryAccountDepth(), // 科目级次
            this.getMaxDocPeriod(),
            this.getEnablePeriod()
        ]

        let promiseAll = await Promise.all(promiseList)

        let [
            currencyList,
            accountDepthList,
            maxDocPeriod,
            enabledPeriod
        ] = promiseAll

        let res = null,
            isChangeSipmleDate = this.metaAction.gf(
                "data.other.changeSipmleDate"
            )
        if (type == "tabFocus") {
            //页签切换，判断简单日期是否修改过。
            if (isChangeSipmleDate) {
                res = { currencyList, accountDepthList, enabledPeriod }
            } else {
                res = {
                    currencyList,
                    accountDepthList,
                    enabledPeriod,
                    maxDocPeriod
                }
            }
            this.injections.reduce("initOption", { ...res }, resFocus)
            if (params && params.initSearchValue) {
                //联查加载
                this.setInitSearchData(params.initSearchValue)
            }
        } else {
            // 检测数量和外币checkbox是否显示
            this.checkQuantityAndCurrency()
            res = {
                currencyList,
                accountDepthList,
                enabledPeriod,
                maxDocPeriod
            }
            if (this.component.props.initSearchValue) {
                this.injections.reduce("initOption", { ...res })
                //联查加载
                this.setInitSearchData(this.component.props.initSearchValue)
            }
        }
        //打开页签加载
        if (!params && !this.component.props.initSearchValue) {
            this.injections.reduce("initOption", { ...res })
            const prevValue = this.metaAction.gf("data.searchValue").toJS()
            this.setSearchField(prevValue.onlyShowEndAccount, { ...prevValue })
            // this.injections.reduce('searchUpdate', { ...prevValue })
        }
        this.sortParmas(undefined, undefined, undefined, type)
    }
    // 检测数量和外币checkbox是否显示
    checkQuantityAndCurrency = async () => {
        let calcUsage = await this.webapi.balanceSumRpt.queryCalcUsage(),
            multi = false,
            quantity = false
        if (calcUsage.calcMultiCount > 0) {
            //是否启用外币
            multi = true
        }
        if (calcUsage.calcQuantityCount > 0) {
            quantity = true
        }
        this.injections.reduce("updateArr", [
            {
                path: "data.showCheckbox",
                value: {
                    num: quantity,
                    multi: multi
                }
            },
            {
                path: "data.showOption",
                value: {
                    quantity: false,
                    currency: false
                }
            }
        ])
    }
    getAccountOptionList = () => {
        if (window.startAccountList) {
            return changeToOption(
                window.startAccountList,
                "codeAndName",
                "code"
            )
        } else {
            return []
        }
    }
    setInitSearchData = async currentValue => {
        let prevValue = this.metaAction.gf("data.searchValue").toJS()
        prevValue.date_start = currentValue.date_start
        prevValue.date_end = currentValue.date_end
        prevValue.beginAccountCode = currentValue.beginAccountCode
        prevValue.endAccountCode = currentValue.endAccountCode
        prevValue.currencyId = currentValue.currencyId || "0"
        prevValue.beginAccountGrade = "1"
        prevValue.endAccountGrade = "5"
        prevValue.onlyShowEndAccount = []
        prevValue.showZero = ["1"]
        prevValue.showAuxAccCalc = ["1"]
        prevValue.printType = 0
        this.setSearchField(prevValue.onlyShowEndAccount, { ...prevValue })
        let prevShowOption = this.metaAction.gf("data.showOption").toJS()
        this.injections.reduce("optionsUpdate", { ...prevShowOption })
        // this.injections.reduce('searchUpdate', { ...prevValue })
    }
    getEnablePeriod = async () => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        const enabledPeriod =
            currentOrg.enabledYear +
            "-" +
            `${currentOrg.enabledMonth}`.padStart(2, "0")
        return enabledPeriod
    }
    //获取凭证所在的最大期间座位默认日期
    getMaxDocPeriod = async () => {
        const res = await this.webapi.balanceSumRpt.getDisplayDate()
        return res.DisplayDate
    }
    //获取时间选项
    getNormalDateValue = () => {
        const data = this.metaAction.gf("data.searchValue").toJS()
        const arr = []
        arr.push(data.date_start)
        arr.push(data.date_end)
        return arr
    }

    normalSearchChange = (path, value) => {
        if (path == "date") {
            let date = {
                date_end: value[1],
                date_start: value[0]
            }
            const searchValue = this.metaAction.gf("data.searchValue").toJS()
            const pages = this.metaAction.gf("data.pagination").toJS()
            //记录是否变更过日期
            this.injections.reduce("updateArr", [
                {
                    path: "data.other.changeSipmleDate",
                    velue: true
                },
                {
                    path: "data.searchValue",
                    velue: { ...searchValue, ...date }
                }
            ])

            this.sortParmas({ ...searchValue, ...date }, { ...pages })
        }
    }
    getNormalSearchValue = () => {
        const data = this.metaAction.gf("data.searchValue").toJS()
        let date = [data.date_start, data.date_end]
        return { date, query: data.query }
    }

    /**
     * current 每个月份
     * pointTime 指定比较的时间
     * type 'pre' 前 'next' 后
     * return 返回 true 代表禁用
     */
    disabledDate = (current, pointTime, type) => {
        const enableddate = this.metaAction.gf("data.other.enabledDate")
        if (type == "pre") {
            let currentMonth = this.transformDateToNum(current)
            let enableddateMonth = this.transformDateToNum(enableddate)
            return currentMonth < enableddateMonth
        } else {
            let currentMonth = this.transformDateToNum(current)
            let pointTimeMonth = this.transformDateToNum(pointTime)
            let enableddateMonth = this.transformDateToNum(enableddate)
            return (
                currentMonth < pointTimeMonth || currentMonth < enableddateMonth
            )
        }
    }
    transformDateToNum = date => {
        let time = date
        if (typeof date == "string") {
            time = moment(new Date(date))
        }
        return parseInt(
            `${time.year()}${
                time.month() < 10 ? `0${time.month()}` : `${time.month()}`
            }`
        )
    }

    // 点击刷新按钮
    refreshBtnClick = () => {
        this.sortParmas()
    }
    renderCheckBox1 = () => {
        return (
            <Checkbox.Group
                className="app-proof-of-list-accountQuery-search-checkbox"
                onChange={arr =>
                    this.setSearchField(
                        arr,
                        undefined,
                        undefined,
                        "fromSearchCheck"
                    )
                }
            >
                <Checkbox value="1">仅显示末级科目</Checkbox>
            </Checkbox.Group>
        )
    }
    renderCheckBox2 = () => {
        return (
            <Checkbox.Group className="app-proof-of-list-accountQuery-search-checkbox">
                <Checkbox value="1">显示余额为0，发生额不为0的记录</Checkbox>
            </Checkbox.Group>
        )
    }
    renderCheckBox3 = () => {
        return (
            <Checkbox.Group className="app-proof-of-list-accountQuery-search-checkbox">
                <Checkbox value="1">显示辅助核算</Checkbox>
            </Checkbox.Group>
        )
    }
    queryAccountSubjects = async () => {
        let res = await this.webapi.balanceSumRpt.queryAccountList()
        if (res) {
            window.balanceSumAccountList = res.glAccounts
            this.metaAction.sf("data.other.isQueryAccountSubjects", true)
        }
    }
    onPanelChange = value => {
        let date = {
            date_end: value[1],
            date_start: value[0]
        }
        const searchValue = this.metaAction.gf("data.searchValue").toJS()
        //2018-02-27修改为只要更改时间就需要重新搜索科目，所以需要走高级搜索的逻辑
        this.searchValueChange({ ...searchValue, ...date }, null, "")
        // this.metaAction.sf('data.other.currentTime', '')
    }
    searchValueChange = (value, fromLoad, time) => {
        let prevValue = this.metaAction.gf("data.searchValue").toJS()
        const currencyList = this.metaAction
            .gf("data.other.tmpCurrencyList")
            .toJS()
        if (value) {
            //埋点需求
            // 余额表 + 高级查询 + 仅显示末级科目
            // 余额表 + 高级查询 + 显示余额为0，发生额不为0的记录
            // 余额表 + 高级查询 + 示辅助核算
            // 余额表 + 高级查询 + 选择综合本位币或人民币
            // 余额表 + 高级查询 + 选择外币
            if (
                value.onlyShowEndAccount &&
                value.onlyShowEndAccount.length > 0
            ) {
                _hmt &&
                    _hmt.push([
                        "_trackEvent",
                        "财务",
                        "余额表",
                        "高级查询仅显示末级科目"
                    ])
            }
            if (value.showZero && value.showZero.length > 0) {
                _hmt &&
                    _hmt.push([
                        "_trackEvent",
                        "财务",
                        "余额表",
                        "高级查询显示余额为0，发生额不为0的记录"
                    ])
            }
            if (value.showAuxAccCalc && value.showAuxAccCalc.length > 0) {
                _hmt &&
                    _hmt.push([
                        "_trackEvent",
                        "财务",
                        "余额表",
                        "高级查询显示辅助核算"
                    ])
            }
            const pages = this.metaAction.gf("data.pagination").toJS()
            this.metaAction.sfs({
                "data.searchValue": fromJS({ ...prevValue, ...value }),
                "data.other.changeSipmleDate": true,
                "data.other.currentTime": time ? time : "",
                "data.showOption.currency":
                    value.currencyId !== "0" && value.currencyId !== "1"
                        ? true
                        : false
            })
            this.sortParmas({ ...prevValue, ...value }, { ...pages })
            //记录是否变更过日期
        } else {
            this.setSearchField(
                prevValue.onlyShowEndAccount,
                undefined,
                time ? time : ""
            )
        }
    }

    filterOption = (inputValue, option) => {
        if (option.props) {
            const { codeAndName, helpCode, helpCodeFull } = option.props
            const str = `${codeAndName} ${helpCode} ${helpCodeFull}`
            const res = new RegExp(inputValue, "i")
            if (str.search(res) > -1) {
                return true
            } else {
                return false
            }
        } else {
            return true
        }
    }
    sortParmas = (search, pages, type, opportunity) => {
        //  * @apiParam {Number} beginYear 起始年份
        //  * @apiParam {Number} beginPeriod 起始期间
        //  * @apiParam {Number} endYear 结束年份
        //  * @apiParam {Number} endPeriod 结束期间
        //  * @apiParam {String} beginAccountCode 起始科目编码
        //  * @apiParam {String} endAccountCode 结束科目编码
        //  * @apiParam {Number} currencyId=0 币种 id，0 代表本位币
        //  * @apiParam {Number} beginAccountGrade 起始科目级次
        //  * @apiParam {Number} endAccountGrade 结束科目级次
        //  * @apiParam {Boolean} onlyShowEndAccount=false 是否仅显示末级科目
        //  * @apiParam {Boolean} showZero=true 余额为 0 是否显示
        let { currency, quantity } = this.metaAction
            .gf("data.showOption")
            .toJS()
        if (!search) {
            search = this.metaAction.gf("data.searchValue").toJS()
        }
        if (!pages) {
            pages = this.metaAction.gf("data.pagination").toJS()
        }
        const changeData = {
            date_start: {
                beginDate: data => (data ? data.format("YYYY-MM") : null),
                beginYear: data => (data ? data.format("YYYY") : null),
                beginPeriod: data => (data ? data.format("MM") : null)
            },
            date_end: {
                endDate: data => (data ? data.format("YYYY-MM") : null),
                endYear: data => (data ? data.format("YYYY") : null),
                endPeriod: data => (data ? data.format("MM") : null)
            }
        }
        const searchValue = sortSearchOption(search, changeData)
        const page = utils.sortSearchOption(pages, null, [
            "total",
            "totalCount",
            "totalPage"
        ])
        const showOption = this.metaAction.gf("data.showOption").toJS()
        if (!showOption.quantity && !showOption.currency) {
            searchValue.printType = 0
        } else if (showOption.quantity && !showOption.currency) {
            searchValue.printType = 1
        } else if (!showOption.quantity && showOption.currency) {
            searchValue.printType = 2
        } else if (showOption.quantity && showOption.currency) {
            searchValue.printType = 3
        }
        searchValue.isCalcMulti = currency
        searchValue.isCalcQuantity = quantity
        searchValue.onlyShowEndAccount =
            searchValue.onlyShowEndAccount &&
            searchValue.onlyShowEndAccount.length > 0
                ? "true"
                : "false"
        searchValue.showZero =
            searchValue.showZero && searchValue.showZero.length > 0
                ? "true"
                : "false"
        searchValue.showAuxAccCalc =
            searchValue.showAuxAccCalc && searchValue.showAuxAccCalc.length > 0
                ? "true"
                : "false"
        if (type == "get") {
            return { ...searchValue, ...page, needPaging: true }
        }
        this.requestData({ ...searchValue, ...page, needPaging: true }).then(
            res => {
                if (res && res.columnDtos) {
                    let tableOption = this.metaAction.gf("data.tableOption"),
                        rightTable =
                            document.getElementsByClassName(
                                "app-balancesum-rpt-table-tbody"
                            ) &&
                            document.getElementsByClassName(
                                "app-balancesum-rpt-table-tbody"
                            )[0],
                        rightTableScrollWidth =
                            rightTable && rightTable.scrollWidth,
                        rightTableWidth = rightTable && rightTable.offsetWidth

                    if (rightTable) {
                        tableOption = tableOption.set(
                            "x",
                            rightTableScrollWidth
                        )
                        tableOption = tableOption.set("y", 640)
                        tableOption = tableOption.set(
                            "width",
                            rightTableWidth + "px"
                        )
                    }

                    this.injections.reduce("load", res, tableOption)
                }
                /*setTimeout(() => {
                this.onResize()
            }, 20)*/
            }
        )
    }
    requestData = async params => {
        let res
        /*// LoadingMask.show()
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }*/
        res = await this.webapi.balanceSumRpt.queryRptList(params)
        // LoadingMask.hide()
        // this.injections.reduce('tableLoading', false)
        return res
    }

    shareClick = e => {
        switch (e.key) {
            case "weixinShare":
                this.weixinShare()
                break
            case "mailShare":
                this.mailShare()
                break
        }
    }

    weixinShare = async () => {
        let forwardingFlag = await this.webapi.balanceSumRpt.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast(
                "warning",
                "您修改了数据，系统正在重新计算，请稍后"
            )
            return
        }
        if (this.metaAction.gf("data.list").toJS().length == 0) {
            this.metaAction.toast("warning", "当前暂无数据可分享")
            return
        }
        let data = await this.sortParmas(null, null, "get")
        data.needPaging = false
        const ret = this.metaAction.modal("show", {
            title: "微信/QQ分享",
            width: 300,
            footer: null,
            children: this.metaAction.loadApp("app-weixin-share", {
                store: this.component.props.store,
                initData: "/v1/gl/report/balancesumrpt/share",
                params: data
            })
        })
        _hmt && _hmt.push(["_trackEvent", "财务", "余额表", "分享微信/QQ"])
    }

    mailShare = async () => {
        let forwardingFlag = await this.webapi.balanceSumRpt.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast(
                "warning",
                "您修改了数据，系统正在重新计算，请稍后"
            )
            return
        }
        if (this.metaAction.gf("data.list").toJS().length == 0) {
            this.metaAction.toast("warning", "当前暂无数据可分享")
            return
        }
        let data = await this.sortParmas(null, null, "get")
        data.needPaging = false
        const ret = this.metaAction.modal("show", {
            title: "邮件分享",
            width: 400,
            children: this.metaAction.loadApp("app-mail-share", {
                store: this.component.props.store,
                params: data,
                shareUrl: "/v1/gl/report/balancesumrpt/share",
                mailShareUrl: "/v1/gl/report/balancesumrpt/sendShareMail",
                printShareUrl: "/v1/gl/report/balancesumrpt/print",
                period: `${data.beginDate.replace(
                    "-",
                    "."
                )}-${data.endDate.replace("-", ".")}`
            })
        })
        _hmt && _hmt.push(["_trackEvent", "财务", "余额表", "分享邮件分享"])
    }

    moreActionOpeate = e => {
        this[e.key] && this[e.key]()
    }

    showOptionsChange = (key, value) => {
        this.injections.reduce("updateArr", [
            {
                path: `data.showOption.${key}`,
                value: value
            },
            {
                path: "data.loading",
                value: true
            }
        ])
        const prevValue = this.metaAction.gf("data.showOption").toJS()
        this.injections.reduce("optionsUpdate", { ...prevValue })
        this.sortParmas(null, null, null, "moreSearch")
        setTimeout(() => {
            this.injections.reduce("tableLoading", false)
        }, 500)
    }

    setSearchField = (array, searchValue, time, fromSearch) => {
        let fieldsValue =
            this.searchCard.form && this.searchCard.form.getFieldsValue()
        if (!fieldsValue) return

        let preSearchValue = this.metaAction.gf("data.searchValue")
        this.metaAction.sfs({
            "data.searchValue": searchValue
                ? fromJS(searchValue)
                : fromJS(preSearchValue),
            "data.searchValue.onlyShowEndAccount": fromJS(array),
            // 'data.searchValue.showZero': fromJS(["1"]),
            "data.searchValue.showZero": fromJS(fieldsValue.showZero),
            // 'data.searchValue.showAuxAccCalc': fromJS(["1"]),
            "data.searchValue.showAuxAccCalc": fromJS(
                fieldsValue.showAuxAccCalc
            ),
            "data.other.gradeStyleStatus":
                array && array.length == 1 ? true : false,
            "data.searchValue.beginAccountGrade": 1,
            "data.searchValue.endAccountGrade": 5,
            "data.other.showAccountDis":
                fromSearch == "fromSearchCheck" && array.length == 1
                    ? true
                    : false,
            "data.other.time": time ? time : ""
        })
    }
    checkBoxisShow = key => {
        const showCheckbox =
            this.metaAction.gf("data.showCheckbox") &&
            this.metaAction.gf("data.showCheckbox").toJS()
        return { display: showCheckbox[key] ? "inline-block" : "none" }
    }
    export = async () => {
        if (this.metaAction.gf("data.list").toJS().length == 0) {
            this.metaAction.toast("warning", "当前没有可导出数据")
            return
        }
        const params = this.sortParmas(null, null, "get")
        params.needPaging = false
        await this.webapi.balanceSumRpt.export(params)
        _hmt && _hmt.push(["_trackEvent", "财务", "余额表", "导出所有科目"])
    }

    printClick = e => {
        switch (e.key) {
            case "printset":
                this.setupClick()
                break
            case "print":
                this.print()
                break
        }
    }

    setupClick = async () => {
        let _this = this
        LoadingMask.show()
        const { enabledMonth, enabledYear } = this.metaAction.context.get(
            "currentOrg"
        )
        let enableddate = ""
        if (enabledMonth && enabledYear) {
            enableddate = utils.date.transformMomentDate(
                `${enabledYear}-${enabledMonth}`
            )
        }
        const {
            height,
            printTime,
            landscape,
            type,
            width,
            topPadding,
            bottomPadding,
            contentFontSize,
            isPrintCover,
            leftPadding,
            customPrintTime,
            creator,
            supervisor,
            creatorType,
            supervisorType,
            rightPadding
        } = await this.webapi.balanceSumRpt.getPrintConfig()
        LoadingMask.hide()
        this.metaAction.modal("show", {
            title: "打印设置",
            width: 740,
            footer: null,
            iconType: null,
            okText: "保存",
            className: "app-balancesum-rpt-print-modal-container",
            children: (
                <PrintOption3
                    height={height}
                    printTime={printTime}
                    landscape={landscape}
                    type={type}
                    width={width}
                    topPadding={topPadding}
                    bottomPadding={bottomPadding}
                    contentFontSize={contentFontSize}
                    isPrintCover={isPrintCover}
                    leftPadding={leftPadding}
                    rightPadding={rightPadding}
                    callBack={_this.submitPrintOption}
                    creator={creator}
                    supervisor={supervisor}
                    enableddate={enableddate}
                    creatorType={creatorType}
                    glFrom={true}
                    customPrintTime={customPrintTime}
                    supervisorType={supervisorType}
                />
            )
        })
    }

    submitPrintOption = async form => {
        delete form.creatorButton
        delete form.enableddate
        delete form.supervisorButton
        delete form.timeOriginal
        delete form.supervisor
        delete form.supervisorType
        let res = await this.webapi.balanceSumRpt.savePrintConfig(form)
        this.metaAction.toast("success", "打印设置成功")
    }

    print = async () => {
        let tempWindow = window.open()
        let forwardingFlag = await this.webapi.balanceSumRpt.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast(
                "warning",
                "您修改了数据，系统正在重新计算，请稍后"
            )
            tempWindow.close()
            return
        } else {
            const params = this.sortParmas(null, null, "get")
            if (this.metaAction.gf("data.list").toJS().length == 0) {
                this.metaAction.toast("warning", "当前没有可打印数据")
                tempWindow.close()
                return
            }
            params.tempWindow = tempWindow
            params.needPaging = false
            await this.webapi.balanceSumRpt.print(params)
        }

        _hmt && _hmt.push(["_trackEvent", "财务", "余额表", "打印所有科目"])
    }

    accountCodeSpan = (text, row, index) => {
        let obj = null
        let num = this.metaAction.gf("colSpan")
        if (row && row.accountName == "合计") {
            obj = {
                children: (
                    <span title={row.accountName}>{row.accountName}</span>
                ),
                props: { colSpan: num }
            }
        } else {
            obj = {
                children: <span title={text}>{text}</span>,
                props: { colSpan: 1 }
            }
        }
        return obj
    }

    accountNameSpan = (text, row, index) => {
        let obj
        if (text == "合计") {
            obj = {
                props: {
                    colSpan: 0,
                    rowSpan: 1
                }
            }
        } else {
            obj = {
                children: (
                    <a
                        href="javascript:;"
                        onClick={() => this.openMoreContent(row)}
                    >
                        <span title={text}>{text}</span>
                    </a>
                ),
                props: {
                    rowSpan: 1,
                    colSpan: 1
                }
            }
        }
        return obj
    }

    rowSpanExtend = (text, row, index) => {
        let obj
        if (row && row.accountName == "合计") {
            obj = {
                props: { colSpan: 0 }
            }
        } else {
            obj = {
                children: <span title={text}>{text}</span>
            }
        }
        return obj
    }

    rowShowTitle = (text, row, index) => {
        let obj = {
            children: <span title={text}>{text}</span>
        }
        return obj
    }
    tableCardList = () => {
        let quantity = this.metaAction.gf("data.showOption.quantity"),
            currency = this.metaAction.gf("data.showOption.currency"),
            columnDto = this.metaAction.gf("data.other.columnDto")
                ? this.metaAction.gf("data.other.columnDto").toJS()
                : undefined,
            code,
            columnDtoMap =
                this.metaAction.gf("data.other.columnDtoMap") &&
                this.metaAction.gf("data.other.columnDtoMap").toJS(),
            parentList = []
        if (columnDto && columnDto.length > 0) {
            columnDto.forEach(item => {
                if (!item.parentId) {
                    parentList.push(item)
                }
            })
        }
        return parentList
    }
    resizeEnd = async params => {
        let columnDtoMap = this.metaAction.gf("data.other.columnDtoMap")
        const code = this.metaAction.gf("data.other.code")
        const customDecideDisVisibleList =
            this.metaAction.gf("data.other.customDecideDisVisibleList") &&
            this.metaAction.gf("data.other.customDecideDisVisibleList").toJS()
        let columnDetails
        let index = columnDtoMap.findIndex(item => item.get("code") == code)
        let visibleList = []
        let columnDto = this.metaAction.gf("data.other.columnDto")
            ? this.metaAction.gf("data.other.columnDto").toJS()
            : undefined
        params.code = code
        if (columnDto.length > 0) {
            columnDto.forEach((item, index) => {
                let falg = false
                params.columnDetails.forEach(item1 => {
                    if (item1.fieldName == item.fieldName) {
                        falg = true
                    }
                })
                if (!falg) {
                    visibleList.push(item)
                }
            })
        }
        columnDetails = params.columnDetails.concat(visibleList)
        params.columnDetails = columnDetails
        let res = await this.webapi.balanceSumRpt.batchUpdate(params)
        columnDtoMap = columnDtoMap.update(index, item =>
            item.set("columnDetails", res[0].columnDetails)
        )
        this.metaAction.sfs({
            "data.other.columnDtoMap": columnDtoMap,
            "data.other.columnDto": fromJS(res[0].columnDetails)
        })
    }

    tableColumns = () => {
        let quantity = this.metaAction.gf("data.showOption.quantity"),
            currency = this.metaAction.gf("data.showOption.currency"),
            columnDto = this.metaAction.gf("data.other.columnDto")
                ? this.metaAction.gf("data.other.columnDto").toJS()
                : undefined,
            code,
            columnDtoMap =
                this.metaAction.gf("data.other.columnDtoMap") &&
                this.metaAction.gf("data.other.columnDtoMap").toJS(),
            dataList = this.metaAction.gf("data.list"),
            parentList = []
        // let appContainerWidth = null
        // try {
        //     let dom
        //     if ($) {
        //         dom = $('.edfx-app-portal-content-main')[0]
        //     } else {
        //         dom = document.getElementsByClassName('edfx-app-portal-content-main')[0]
        //     }
        //     if (dom) {
        //         appContainerWidth = dom.offsetWidth - 160 + 80
        //     } else {
        //         appContainerWidth = window.innerWidth - 100 - 160 + 80
        //     }

        // } catch (err) {
        //     // console.log(err)
        //     appContainerWidth = 1090
        // }
        if (columnDto && columnDto.length > 0) {
            let listWidth = 0
            columnDto.forEach(item => {
                if (item.isVisible) {
                    if (!item.parentId) {
                        let obj = {
                            width: item.width,
                            fieldName: item.fieldName,
                            title: item.caption, //(item.fieldName == 'accountCode' || item.fieldName == 'accountName') ? <div className='ellipsis'><div style={{ position: "absolute" }} title={item.caption}>{item.caption}</div></div> : item.caption,
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            id: item.id,
                            code: code,
                            name: item.fieldName,
                            isVisible: item.isVisible,
                            customDecideVisible: item.customDecideVisible
                            /*render: (text, row, index) => {
                                const obj1 = {
                                    children: <a>{text}</a>,
                                    props: {
                                        colSpan: 1
                                    }
                                };
                                if (index % 4 === 0) {
                                    obj1.props.colSpan = 5;
                                }
                                return obj1;
                            }*/
                        }
                        if (item.fieldName == "accountName") {
                            // obj.fixed = 'left'
                            obj.render = (text, record, index) =>
                                this.rowSpan2(
                                    text,
                                    record,
                                    index,
                                    "accountName"
                                )
                        } else if (item.fieldName == "accountCode") {
                            // obj.fixed = 'left'
                            obj.render = (text, record, index) =>
                                this.rowSpan2(
                                    text,
                                    record,
                                    index,
                                    "accountCode"
                                )
                        } else if (
                            item.fieldName == "currencyName" ||
                            item.fieldName == "unitName"
                        ) {
                            obj.align = "left"
                        } else {
                            obj.align = "right"
                        }
                        parentList.push(obj)
                    }
                }
            })

            let list = this.converseTree(columnDto, parentList)
            list.map(o => {
                if (o.children.length == 0) {
                    o.children = undefined
                }
            })
            list.forEach(item => {
                let childrenwidth = 0
                if (item.children) {
                    item.children.forEach(item1 => {
                        childrenwidth =
                            childrenwidth + (item1.width ? item1.width : 0)
                        listWidth = listWidth + (item1.width ? item1.width : 0)
                    })
                    item.width = childrenwidth
                } else {
                    listWidth = listWidth + (item.width ? item.width : 0)
                }
            })
            /*if(appContainerWidth&&listWidth<appContainerWidth){
                if(list[list.length-1].children){
                    list[list.length-1].children.forEach(item=>{
                        delete item.width
                    })
                }else{
                    delete list[list.length-1].width
                }
            }else if(appContainerWidth&&listWidth>=appContainerWidth&&!list[list.length-1].width){
                list[list.length-1].width=120
            }*/
            let tableOption = this.metaAction.gf("data.tableOption"),
                rightTable =
                    document.getElementsByClassName(
                        "app-balancesum-rpt-table-tbody"
                    ) &&
                    document.getElementsByClassName(
                        "app-balancesum-rpt-table-tbody"
                    )[0],
                rightTableWidth = rightTable && rightTable.scrollWidth - 3,
                scrollx = listWidth

            if (rightTable && listWidth && rightTableWidth) {
                if (listWidth < rightTableWidth) {
                    scrollx = rightTableWidth
                }

                tableOption = tableOption.set("x", scrollx)
                tableOption = tableOption.set("w", listWidth)
                this.metaAction.sf("data.tableOption", tableOption)

                /*let tableHeader = document.getElementsByClassName('ant-table-thead') && document.getElementsByClassName('ant-table-thead')[0]

                tableHeader.style.width = scrollx*/
            }

            if (list.length == 2) {
                delete list[0].fixed
                delete list[1].fixed
            } /*else{*/
            if (listWidth < rightTableWidth) {
                list.push({
                    fieldName: "blank",
                    dataIndex: "blank",
                    title: <span></span>,
                    key: "blank",
                    name: "blank",
                    isVisible: true,
                    width: rightTableWidth - listWidth,
                    customDecideVisible: true
                })
            }
            // }
            return list
            // return this.resizeCol(list)
        }
    }
    /**
     * 更新栏目
     */
    showTableSettingButton = e => {
        this.showTableSetting({ value: true })
    }
    showTableSetting = async ({ value, data }) => {
        this.injections.reduce("update", {
            path: "data.showTableSetting",
            value: value
        })
        if (value == false) {
            const code = this.metaAction.gf("data.other.code")
            const ts = this.metaAction.gf("data.other.ts")
            const columnSolution = await this.webapi.balanceSumRpt.findByParam({
                code: code
            })
            let columnSolutionId = columnSolution.id
            const columnDetail = await this.webapi.balanceSumRpt.updateWithDetail(
                {
                    id: columnSolutionId,
                    columnDetails: this.combineColumnProp(data),
                    ts: ts
                }
            )
            this.injections.reduce("settingOptionsUpdate", {
                visible: value,
                data: columnDetail.columnDetails
            })
        }
    }
    combineColumnProp = data => {
        if (!data) return []
        let newDataArray = []
        data.forEach((ele, index) => {
            newDataArray.push({
                isVisible: ele.isVisible,
                id: ele.id,
                ts: ele.ts
            })
        })

        return newDataArray
    }
    /**
     * 隐藏栏目
     */
    closeTableSetting = () => {
        this.injections.reduce("tableSettingVisible", false)
    }

    /**
     *  重置栏目
     */
    resetTableSetting = async () => {
        const code = this.metaAction.gf("data.other.code")
        //重置栏目
        let res = await this.webapi.balanceSumRpt.reInitByUser({ code: code })
        this.closeTableSetting()
        this.refreshBtnClick()
    }
    rowSpan1 = (text, row, index, columnName) => {
        return (
            <div className="renderNameDiv" title={text}>
                {text}
            </div>
        )
    }
    rowSpan2 = (text, row, index, columnName) => {
        const num = this.calcRowSpan(
            row.accountCodeAndName,
            "accountCodeAndName",
            index
        )
        let onlyShowEndAccount =
            this.metaAction.gf("data.searchValue.onlyShowEndAccount") &&
            this.metaAction.gf("data.searchValue.onlyShowEndAccount").toJS()
        let children, obj
        if (columnName == "accountCode") {
            /*return <div className='div'><div className='renderNameDiv' title={row[columnName]}>{row[columnName]}</div></div>*/
            switch (row.grade) {
                case 1:
                    return (
                        <div className="div">
                            <div
                                className="renderNameDiv"
                                title={row[columnName]}
                            >
                                {row[columnName]}
                            </div>
                        </div>
                    )
                /* return {
                                                                 children: <div className='div'><div className='renderNameDiv' title={row[columnName]}>{row[columnName]}</div></div>,
                                                                 props: {
                                                                     rowSpan: num
                                                                 }
                                                             }*/
                case 2:
                    return (
                        <div className="div">
                            <div
                                style={{
                                    paddingLeft:
                                        onlyShowEndAccount.length == 0
                                            ? "8px"
                                            : 0
                                }}
                                className="renderNameDiv"
                                title={row[columnName]}
                            >
                                {row[columnName]}
                            </div>
                        </div>
                    )
                /*return {
                                                                children: <div className='div'><div style={{ paddingLeft: onlyShowEndAccount.length == 0 ? '15px' : 0 }} className='renderNameDiv' title={row[columnName]}>{row[columnName]}</div></div>,
                                                                props: {
                                                                    rowSpan: num
                                                                }
                                                            }*/
                case 3:
                    return (
                        <div className="div">
                            <div
                                style={{
                                    paddingLeft:
                                        onlyShowEndAccount.length == 0
                                            ? "16px"
                                            : 0
                                }}
                                className="renderNameDiv"
                                title={row[columnName]}
                            >
                                {row[columnName]}
                            </div>
                        </div>
                    )
                /*return {
                                                                children: <div className='div'><div style={{ paddingLeft: onlyShowEndAccount.length == 0 ? '30px' : 0 }} className='renderNameDiv' title={row[columnName]}>{row[columnName]}</div></div>,
                                                                props: {
                                                                    rowSpan: num
                                                                }
                                                            }*/
                case 4:
                    return (
                        <div className="div">
                            <div
                                style={{
                                    paddingLeft:
                                        onlyShowEndAccount.length == 0
                                            ? "24px"
                                            : 0
                                }}
                                className="renderNameDiv"
                                title={row[columnName]}
                            >
                                {row[columnName]}
                            </div>
                        </div>
                    )
                /*return {
                                                                children: <div className='div'><div style={{ paddingLeft: onlyShowEndAccount.length == 0 ? '45px' : 0 }} className='renderNameDiv' title={row[columnName]}>{row[columnName]}</div></div>,
                                                                props: {
                                                                    rowSpan: num
                                                                }
                                                            }*/
                case 5:
                    return (
                        <div className="div">
                            <div
                                style={{
                                    paddingLeft:
                                        onlyShowEndAccount.length == 0
                                            ? "32px"
                                            : 0
                                }}
                                className="renderNameDiv"
                                title={row[columnName]}
                            >
                                {row[columnName]}
                            </div>
                        </div>
                    )
                /*return {
                                                                children: <div className='div'><div style={{ paddingLeft: onlyShowEndAccount.length == 0 ? '60px' : 0 }} className='renderNameDiv' title={row[columnName]}>{row[columnName]}</div></div>,
                                                                props: {
                                                                    rowSpan: num
                                                                }
                                                            }*/
                case "":
                    return (
                        <div className="div">
                            <div
                                className="renderNameDiv"
                                title={row[columnName]}
                            >
                                {row[columnName]}
                            </div>
                        </div>
                    )
                /*return {
                                                                children: <div className='div'><div className='renderNameDiv' title={row[columnName]}>{row[columnName]}</div></div>,
                                                                props: {
                                                                    rowSpan: num
                                                                }
                                                            }*/
                default:
                    return (
                        <div className="div">
                            {" "}
                            <div
                                className="renderNameDiv"
                                title={row[columnName]}
                            >
                                {row[columnName]}
                            </div>
                        </div>
                    )
                /*return {
                                                                children: <div className='div'> <div className='renderNameDiv' title={row[columnName]}>{row[columnName]}</div></div>,
                                                                props: {
                                                                    rowSpan: num
                                                                }
                                                            }*/
            }
        } else if (columnName == "accountName") {
            if (row[columnName] == "合计") {
                return (
                    <div className="div">
                        <span title={text}>{text}</span>
                    </div>
                )
                /*return {
                    children: <div className='div'><span title={text}>{text}</span></div>,
                    props: {
                        colSpan: 1
                    }
                }*/
            } else {
                switch (row.grade) {
                    case 1:
                        return (
                            <div className="div">
                                <a
                                    href="javascript:;"
                                    onClick={() => this.openMoreContent(row)}
                                >
                                    <span title={row[columnName]}>
                                        {row[columnName]}
                                    </span>
                                </a>
                            </div>
                        )
                    /*return {
                                                                    children: <div className='div'><a href="javascript:;" onClick={() => this.openMoreContent(row)}>
                                                                        <span title={row[columnName]}>{row[columnName]}</span>
                                                                    </a></div>,
                                                                    props: {
                                                                        rowSpan: num
                                                                    }
                                                                }*/
                    case 2:
                        return (
                            <div className="div">
                                <a
                                    href="javascript:;"
                                    style={{
                                        paddingLeft:
                                            onlyShowEndAccount.length == 0
                                                ? "15px"
                                                : 0
                                    }}
                                    onClick={() => this.openMoreContent(row)}
                                >
                                    <span title={row[columnName]}>
                                        {row[columnName]}
                                    </span>
                                </a>
                            </div>
                        )
                    /*return {
                                                                    children: <div className='div'><a href="javascript:;" style={{ paddingLeft: onlyShowEndAccount.length == 0 ? '15px' : 0 }} onClick={() => this.openMoreContent(row)}>
                                                                        <span title={row[columnName]}>{row[columnName]}</span>
                                                                    </a></div>,
                                                                    props: {
                                                                        rowSpan: num
                                                                    }
                                                                }*/
                    case 3:
                        return (
                            <div className="div">
                                <a
                                    href="javascript:;"
                                    style={{
                                        paddingLeft:
                                            onlyShowEndAccount.length == 0
                                                ? "30px"
                                                : 0
                                    }}
                                    onClick={() => this.openMoreContent(row)}
                                >
                                    <span title={row[columnName]}>
                                        {row[columnName]}
                                    </span>
                                </a>
                            </div>
                        )
                    /*return {
                                                                    children: <div className='div'><a href="javascript:;" style={{ paddingLeft: onlyShowEndAccount.length == 0 ? '30px' : 0 }} onClick={() => this.openMoreContent(row)}>
                                                                        <span title={row[columnName]}>{row[columnName]}</span>
                                                                    </a></div>,
                                                                    props: {
                                                                        rowSpan: num
                                                                    }
                                                                }*/

                    case 4:
                        return (
                            <div className="div">
                                {" "}
                                <a
                                    href="javascript:;"
                                    style={{
                                        paddingLeft:
                                            onlyShowEndAccount.length == 0
                                                ? "45px"
                                                : 0
                                    }}
                                    onClick={() => this.openMoreContent(row)}
                                >
                                    <span title={row[columnName]}>
                                        {row[columnName]}
                                    </span>
                                </a>
                            </div>
                        )
                    /*return {
                                                                    children: <div className='div'> <a href="javascript:;" style={{ paddingLeft: onlyShowEndAccount.length == 0 ? '45px' : 0 }} onClick={() => this.openMoreContent(row)}>
                                                                        <span title={row[columnName]}>{row[columnName]}</span>
                                                                    </a></div>,
                                                                    props: {
                                                                        rowSpan: num
                                                                    }
                                                                }*/

                    case 5:
                        return (
                            <div className="div">
                                <a
                                    href="javascript:;"
                                    style={{
                                        paddingLeft:
                                            onlyShowEndAccount.length == 0
                                                ? "60px"
                                                : 0
                                    }}
                                    onClick={() => this.openMoreContent(row)}
                                >
                                    <span title={row[columnName]}>
                                        {row[columnName]}
                                    </span>
                                </a>
                            </div>
                        )
                    /*return {
                                                                    children: <div className='div'><a href="javascript:;" style={{ paddingLeft: onlyShowEndAccount.length == 0 ? '60px' : 0 }} onClick={() => this.openMoreContent(row)}>
                                                                        <span title={row[columnName]}>{row[columnName]}</span>
                                                                    </a></div>,
                                                                    props: {
                                                                        rowSpan: num
                                                                    }
                                                                }*/

                    case "":
                        return (
                            <div className="div">
                                <a
                                    href="javascript:;"
                                    onClick={() => this.openMoreContent(row)}
                                >
                                    <span title={row[columnName]}>
                                        {row[columnName]}
                                    </span>
                                </a>
                            </div>
                        )
                    /*return {
                                                                    children: <div className='div'><a href="javascript:;" onClick={() => this.openMoreContent(row)}>
                                                                        <span title={row[columnName]}>{row[columnName]}</span>
                                                                    </a></div>,
                                                                    props: {
                                                                        rowSpan: num
                                                                    }
                                                                }*/

                    default:
                        return (
                            <div className="div">
                                <a
                                    href="javascript:;"
                                    onClick={() => this.openMoreContent(row)}
                                >
                                    <span title={row[columnName]}>
                                        {row[columnName]}
                                    </span>
                                </a>
                            </div>
                        )
                    /*return {
                                                                  children: <div className='div'><a href="javascript:;" onClick={() => this.openMoreContent(row)}>
                                                                       <span title={row[columnName]}>{row[columnName]}</span>
                                                                   </a></div>,
                                                                   props: {
                                                                       rowSpan: num
                                                                   }
                                                               }*/
                }
            }
        }
    }

    calcRowSpan(text, columnKey, currentRowIndex) {
        const list = this.metaAction.gf("data.list")
        if (!list) return
        const rowCount = list.size
        if (rowCount == 0 || rowCount == 1) return 1

        if (
            currentRowIndex > 0 &&
            currentRowIndex <= rowCount &&
            text == list.getIn([currentRowIndex - 1, columnKey])
        ) {
            return 0
        }

        var rowSpan = 1
        for (let i = currentRowIndex + 1; i < rowCount; i++) {
            if (text == list.getIn([i, columnKey])) rowSpan++
            else break
        }

        return rowSpan
    }
    converseTree = (tree, parentList) => {
        for (let i = 0; i < parentList.length; i++) {
            let parentItem = parentList[i]
            let childrenList = []
            let parentItemId = parentItem.id
            for (let j = 0; j < tree.length; j++) {
                let child = tree[j]
                let id = child.id
                let renderFunc
                let childObj = {
                    id: id,
                    title: child.title,
                    key: child.fieldName,
                    width: child.width,
                    title: child.caption,
                    dataIndex: child.fieldName,
                    fieldName: child.fieldName,
                    parentId: child.parentId,
                    name: child.fieldName,
                    isVisible: child.isVisible,
                    customDecideVisible: child.customDecideVisible,
                    render: (text, record, index) =>
                        this.rowSpan1(text, record, index)
                }
                if (
                    child.fieldName !== "accountName" &&
                    child.fieldName !== "accountCode"
                ) {
                    childObj.align = "right"
                }
                // if(child.isVisible == true){
                if (child.customDecideVisible == true) {
                    if (childObj.parentId == parentItemId) {
                        childrenList.push(childObj)
                    }
                }
                // }
            }
            parentItem.children = childrenList
        }
        return parentList
    }
    /*getRow = (record, index) => {

        let matchIndex = this.metaAction.gf('data.other.matchIndex')
        if (matchIndex == index) {
            return { className: record.accountName == '合计' ? "currentScrollRow total" : "currentScrollRow" }
        } else {
            return { className: record.accountName == '合计' ? 'total' : '' }
        }
    }*/
    fixPosition = condition => {
        this.injections.reduce("fixPosition", condition)

        if (this.vTableRef && this.vTableRef.scrollToItem) {
            this.vTableRef.scrollToItem(10)
        }
    }
    searchChange = value => {
        this.injections.reduce("searchChange", value)
    }
    // 名称列
    renderNameColumn = (fieldName, value, index) => {
        let onlyShowEndAccount =
            this.metaAction.gf("data.searchValue.onlyShowEndAccount") &&
            this.metaAction.gf("data.searchValue.onlyShowEndAccount").toJS()
        if (fieldName == "accountName") {
            if (value[fieldName] == "合计") {
                return <span title={value[fieldName]}>{value[fieldName]}</span>
            } else {
                switch (value.grade) {
                    case 1:
                        return (
                            <a
                                href="javascript:;"
                                onClick={() => this.openMoreContent(value)}
                            >
                                <span title={value[fieldName]}>
                                    {value[fieldName]}
                                </span>
                            </a>
                        )
                    case 2:
                        return (
                            <a
                                href="javascript:;"
                                style={{
                                    paddingLeft:
                                        onlyShowEndAccount.length == 0
                                            ? "15px"
                                            : 0
                                }}
                                onClick={() => this.openMoreContent(value)}
                            >
                                <span title={value[fieldName]}>
                                    {value[fieldName]}
                                </span>
                            </a>
                        )
                    case 3:
                        return (
                            <a
                                href="javascript:;"
                                style={{
                                    paddingLeft:
                                        onlyShowEndAccount.length == 0
                                            ? "30px"
                                            : 0
                                }}
                                onClick={() => this.openMoreContent(value)}
                            >
                                <span title={value[fieldName]}>
                                    {value[fieldName]}
                                </span>
                            </a>
                        )
                    case 4:
                        return (
                            <a
                                href="javascript:;"
                                style={{
                                    paddingLeft:
                                        onlyShowEndAccount.length == 0
                                            ? "45px"
                                            : 0
                                }}
                                onClick={() => this.openMoreContent(value)}
                            >
                                <span title={value[fieldName]}>
                                    {value[fieldName]}
                                </span>
                            </a>
                        )
                    case 5:
                        return (
                            <a
                                href="javascript:;"
                                style={{
                                    paddingLeft:
                                        onlyShowEndAccount.length == 0
                                            ? "60px"
                                            : 0
                                }}
                                onClick={() => this.openMoreContent(value)}
                            >
                                <span title={value[fieldName]}>
                                    {value[fieldName]}
                                </span>
                            </a>
                        )
                    case "":
                        return (
                            <a
                                href="javascript:;"
                                onClick={() => this.openMoreContent(value)}
                            >
                                <span title={value[fieldName]}>
                                    {value[fieldName]}
                                </span>
                            </a>
                        )
                    default:
                        return (
                            <a
                                href="javascript:;"
                                onClick={() => this.openMoreContent(value)}
                            >
                                <span title={value[fieldName]}>
                                    {value[fieldName]}
                                </span>
                            </a>
                        )
                }
            }
        } else {
            switch (value.grade) {
                case 1:
                    return (
                        <div className="renderNameDiv" title={value[fieldName]}>
                            {value[fieldName]}
                        </div>
                    )
                case 2:
                    return (
                        <div
                            style={{
                                paddingLeft:
                                    onlyShowEndAccount.length == 0 ? "15px" : 0
                            }}
                            className="renderNameDiv"
                            title={value[fieldName]}
                        >
                            {value[fieldName]}
                        </div>
                    )
                case 3:
                    return (
                        <div
                            style={{
                                paddingLeft:
                                    onlyShowEndAccount.length == 0 ? "30px" : 0
                            }}
                            className="renderNameDiv"
                            title={value[fieldName]}
                        >
                            {value[fieldName]}
                        </div>
                    )
                case 4:
                    return (
                        <div
                            style={{
                                paddingLeft:
                                    onlyShowEndAccount.length == 0 ? "45px" : 0
                            }}
                            className="renderNameDiv"
                            title={value[fieldName]}
                        >
                            {value[fieldName]}
                        </div>
                    )
                case 5:
                    return (
                        <div
                            style={{
                                paddingLeft:
                                    onlyShowEndAccount.length == 0 ? "60px" : 0
                            }}
                            className="renderNameDiv"
                            title={value[fieldName]}
                        >
                            {value[fieldName]}
                        </div>
                    )
                case "":
                    return (
                        <div className="renderNameDiv" title={value[fieldName]}>
                            {value[fieldName]}
                        </div>
                    )
                default:
                    return (
                        <div className="renderNameDiv" title={value[fieldName]}>
                            {value[fieldName]}
                        </div>
                    )
            }
        }
    }
    onResize = e => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll(
                    "app-balancesum-rpt-table-tbody",
                    "ant-table-thead",
                    0,
                    "ant-table-body",
                    "data.tableOption",
                    e
                )
            }

            this.metaAction.sfs("data.tableKey", Math.random())
        }, 200)
    }

    getTableScroll = (contaienr, head, num, target, path, e) => {
        try {
            const doubleRowContent = document.getElementById(
                "app-balancesum-rpt-table-id"
            )
                ? document
                      .getElementById("app-balancesum-rpt-table-id")
                      .getElementsByTagName("tbody")[0]
                : ""

            const tableCon = document.getElementsByClassName(contaienr)[0]
            if (!tableCon) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll(contaienr, head, num, target, path)
                }, 200)
                return
            }
            const header = tableCon.getElementsByClassName(head)[0]
            const body = tableCon
                .getElementsByClassName(target)[0]
                .getElementsByTagName("table")[0]
            const pre = this.metaAction.gf(path).toJS()
            const y = tableCon.offsetHeight - header.offsetHeight - num
            const bodyHeight = body.offsetHeight
            const tableDivWidth = doubleRowContent.offsetWidth
            // debugger
            if (bodyHeight > y && y != pre.y) {
                if (!!window.ActiveXObject || "ActiveXObject" in window) {
                    $(tableCon.getElementsByClassName("ant-table-fixed-right"))
                        .find(".ant-table-body-inner")
                        .css({ "margin-bottom": "-16px" })

                    $(tableCon.getElementsByClassName("ant-table-fixed-left"))
                        .find(".ant-table-body-inner")
                        .css({ "margin-bottom": "-16px" })
                }
                this.metaAction.sf(path, fromJS({ ...pre, y }))
                // let tableDiv = { tableDivHeight: y, tableDivWidth: tableDivWidth }
                // this.injections.reduce('setScroll', tableDiv)
            } else if (bodyHeight < y && pre.y != null) {
                if (!!window.ActiveXObject || "ActiveXObject" in window) {
                    $(tableCon.getElementsByClassName("ant-table-fixed-right"))
                        .find(".ant-table-body-inner")
                        .css({ "margin-bottom": "" })

                    $(tableCon.getElementsByClassName("ant-table-fixed-left"))
                        .find(".ant-table-body-inner")
                        .css({ "margin-bottom": "" })
                }
                this.metaAction.sf(path, fromJS({ ...pre, y: null }))
                // let tableDiv = { tableDivHeight: null, tableDivWidth: tableDivWidth }
                // this.injections.reduce('setScroll', tableDiv)
            } else if (bodyHeight > y && y == pre.y) {
                if (!!window.ActiveXObject || "ActiveXObject" in window) {
                    $(tableCon.getElementsByClassName("ant-table-fixed-right"))
                        .find(".ant-table-body-inner")
                        .css({ "margin-bottom": "-16px" })

                    $(tableCon.getElementsByClassName("ant-table-fixed-left"))
                        .find(".ant-table-body-inner")
                        .css({ "margin-bottom": "-16px" })
                }
                this.metaAction.sf(path, fromJS({ ...pre, y }))
                // let tableDiv = { tableDivHeight: y, tableDivWidth: tableDivWidth }
                // this.injections.reduce('setScroll', tableDiv)
            } else {
                return false
            }
        } catch (err) {}
    }

    //获取基础档案数据
    calAuxBaseArchives = data => {
        const constant = [
            "supplierId",
            "inventoryId",
            "customerId",
            "departmentId",
            "projectId",
            "personId",
            "isExCalc1",
            "isExCalc2",
            "isExCalc3",
            "isExCalc4",
            "isExCalc5",
            "isExCalc6",
            "isExCalc7",
            "isExCalc8",
            "isExCalc9",
            "isExCalc10"
        ]
        let initAuxData = {}
        for (let [key, value] of Object.entries(data)) {
            const zidingyiArr = value
            if (constant.includes(key) && zidingyiArr && zidingyiArr != -1) {
                initAuxData[key] = `${zidingyiArr}`
            }
        }
        return initAuxData
    }

    openMoreContent = row => {
        const searchValue = this.metaAction.gf("data.searchValue").toJS()
        const showOption = this.metaAction.gf("data.showOption").toJS()
        const showCheckbox = this.metaAction.gf("data.showOption").toJS()
        if (!row) {
            return
        }
        if (row.isAuxCalcData) {
            const initAuxData = this.calAuxBaseArchives(row)
            //联查辅助明细账
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    "辅助明细账",
                    "app-auxdetailaccount-rpt",
                    {
                        accessType: 1,
                        linkInSearchValue: {
                            accountCode: row.linkAccountCode.trim(),
                            date_start: searchValue.date_start,
                            date_end: searchValue.date_end,
                            assitForm: initAuxData
                        }
                    }
                )
        } else {
            //联查明细账
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    "明细账",
                    "app-detailaccount-rpt",
                    {
                        accessType: 1,
                        initSearchValue: {
                            accountCode: row.accountCode.trim(),
                            currencyId: searchValue.currencyId,
                            date_end: searchValue.date_end,
                            date_start: searchValue.date_start
                        },
                        showOption: {
                            num: showOption.quantity,
                            currency: showOption.currency
                        },
                        showCheckbox
                    }
                )
        }
    }

    handleTimeLineItem = async (time, disabled) => {
        // this.metaAction.sf('data.other.currentTime', time)
        if (disabled) return
        let month = time.slice(4)
        let year = time.slice(0, 4)
        let now = utils.date.transformMomentDate(`${year}-${month}`)

        let date = {
            date_end: moment(`${year}-${month}`),
            date_start: moment(`${year}-${month}`)
        }
        const searchValue = this.metaAction.gf("data.searchValue").toJS()
        //2018-02-27修改为只要更改时间就需要重新搜索科目，所以需要走高级搜索的逻辑
        this.searchValueChange({ ...searchValue, ...date }, null, time)
    }

    renderTimeLineVisible = () => {
        const data =
            this.metaAction.gf("data.searchValue") &&
            this.metaAction.gf("data.searchValue").toJS()
        let startDate = moment(data.date_start).format("YYYY-MM")
        let endDate = moment(data.date_end).format("YYYY-MM")
        let endDateYear = endDate.replace(/-/g, "")
        let diffMonth = moment(endDate).diff(moment(startDate), "month")
        if (diffMonth > 36) return false
        return true
    }

    renderTimeLine = parmasData => {
        const data = parmasData || this.metaAction.gf("data.searchValue").toJS()
        let startDate = moment(data.date_start).format("YYYY-MM")
        let endDate = moment(data.date_end).format("YYYY-MM")
        let endDateYear = endDate.replace(/-/g, "")
        const currentOrg = this.metaAction.context.get("currentOrg")
        let enabledDate = `${currentOrg.enabledYear}${currentOrg.enabledMonth}`

        let diffMonth = moment(endDate).diff(moment(startDate), "month")
        if (diffMonth > 36) return

        let initCurrentTime = currentOrg.periodDate.replace(/-/g, "")
        let currentTime = parmasData
            ? initCurrentTime
            : this.metaAction.gf("data.other.currentTime")

        // 初始时间和结束时间在同年同月
        let timeArr = []
        if (startDate == endDate) {
            let year = moment(startDate).format("YYYY")
            let list = [+year - 1, +year, +year + 1]

            if (parmasData || !currentTime) {
                list.forEach(item => {
                    for (let i = 0; i < 12; i++) {
                        let num = i < 9 ? "0" + (i + 1) : String(i + 1)
                        timeArr.push(item + num)
                    }
                })
                this.timeLineYearList = timeArr
            } else {
                timeArr = this.timeLineYearList
            }
        } else {
            let beforeDate = moment(
                moment(startDate).subtract(
                    Math.floor((36 - diffMonth) / 2),
                    "month"
                )
            ).format("YYYY-MM")
            let afterDate = moment(
                moment(endDate).add(Math.ceil((36 - diffMonth) / 2), "month")
            ).format("YYYY-MM")

            for (let i = 0; i < 36; i++) {
                let time = moment(beforeDate)
                    .add(i + 1, "month")
                    .format("YYYY-MM")
                time = time.replace(/-/g, "")
                timeArr.push(time)
            }
            this.timeLineYearList = timeArr
        }

        if (parmasData || !currentTime) {
            clearTimeout(this.renderTime)
            this.renderTime = setTimeout(() => {
                try {
                    var height = 0
                    var domList = document.getElementsByClassName(
                        "ant-timeline-item"
                    )
                    let yearNum = 0
                    timeArr.forEach(item => {
                        if (item < endDateYear) {
                            let month = item.slice(4)
                            if (Number(month) == 1) {
                                yearNum += 1
                            }
                        }
                    })

                    for (let i in domList) {
                        if (i < timeArr.indexOf(endDateYear) + 1 + yearNum) {
                            height += domList[i].offsetHeight
                        }
                    }
                    document.querySelector(
                        ".app-balancesum-rpt-body-left"
                    ).scrollTop =
                        height -
                        document.querySelector(".app-balancesum-rpt-body-left")
                            .offsetHeight /
                            2
                } catch (e) {}
            }, 10)
        }

        return (
            <div className="TimeWrap">
                <div className="TimelineDiv">
                    <Timeline className="Timeline">
                        <div className="ant-timeline-item line"></div>
                        {timeArr.map(item => {
                            let month = item.slice(4)
                            let year = item.slice(0, 4)
                            let title = `${year}-${month}`

                            // let isTrue = currentTime ? currentTime == item ? true : false: item == endDateYear
                            let isTrue = currentTime
                                ? currentTime == item
                                    ? true
                                    : false
                                : startDate == endDate && item == endDateYear

                            // let color = currentTime ?
                            // item < currentTime ? '#FF913A': '#0066B3' :
                            // startDate == endDate ?
                            // item < endDateYear ? '#FF913A': '#0066B3' :'#0066B3'

                            let timePeriod =
                                this.metaAction.gf("data.other.timePeriod") &&
                                this.metaAction
                                    .gf("data.other.timePeriod")
                                    .toJS()
                            let { minDataPeriod, maxDataPeriod } =
                                timePeriod || {}
                            // let disabled = (!minDataPeriod && !maxDataPeriod) || (Number(item) < Number(minDataPeriod) || Number(item) > Number(maxDataPeriod))
                            let disabled = Number(item) < Number(enabledDate)

                            let color = "#666"
                            if (minDataPeriod && maxDataPeriod) {
                                if (
                                    Number(item) < Number(minDataPeriod) ||
                                    Number(item) > Number(maxDataPeriod)
                                ) {
                                    if (disabled) {
                                        color = "#D9D9D9"
                                    } else {
                                        color = "#666"
                                    }
                                } else {
                                    color = "#0066B3"
                                }
                            }

                            let dot = isTrue ? (
                                <div className="nodeDiv">{title}</div>
                            ) : item == enabledDate ? (
                                <Icon
                                    type="qiyongriqi"
                                    fontFamily="edficon"
                                    style={{ fontSize: "16px", zIndex: 222 }}
                                    title="启用日期"
                                />
                            ) : null

                            if (Number(month) == 1) {
                                return [
                                    <Timeline.Item
                                        className="ant-timeline-item ant-timelineItemYear"
                                        dot={
                                            <div
                                                className={
                                                    disabled
                                                        ? "yearLabelDis"
                                                        : "yearLabel"
                                                }
                                            >
                                                <span>{year}</span>
                                                <Icon type="arrow-down" />
                                            </div>
                                        }
                                    ></Timeline.Item>,
                                    <Timeline.Item
                                        className={
                                            disabled
                                                ? "ant-timelineItemDis"
                                                : isTrue
                                                ? "ant-timelineItem"
                                                : item == enabledDate
                                                ? "ant-timelineEnabled"
                                                : ""
                                        }
                                        dot={dot}
                                        color={disabled ? "#D9D9D9" : color}
                                        onClick={() =>
                                            this.handleTimeLineItem(
                                                item,
                                                disabled
                                            )
                                        }
                                    >
                                        <span title={title}>
                                            {isTrue ? "" : month}
                                        </span>
                                    </Timeline.Item>
                                ]
                            }

                            return (
                                <Timeline.Item
                                    className={
                                        disabled
                                            ? "ant-timelineItemDis"
                                            : isTrue
                                            ? "ant-timelineItem"
                                            : item == enabledDate
                                            ? "ant-timelineEnabled"
                                            : ""
                                    }
                                    dot={dot}
                                    color={disabled ? "#D9D9D9" : color}
                                    onClick={() =>
                                        this.handleTimeLineItem(item, disabled)
                                    }
                                >
                                    <span title={title}>
                                        {isTrue ? "" : month}
                                    </span>
                                </Timeline.Item>
                            )
                        })}
                        <div></div>
                    </Timeline>
                </div>{" "}
            </div>
        )
    }

    handleClickShowAccount = () => {
        let searchValue = this.metaAction.gf("data.searchValue").toJS()
        let btnContent = this.metaAction.gf("data.other.btnContent")
        let label = ""
        if (btnContent == "显示一级科目") {
            searchValue.beginAccountGrade = "1"
            searchValue.endAccountGrade = "1"
            label = "显示全部科目"
        } else if (btnContent == "显示全部科目") {
            searchValue.beginAccountGrade = "1"
            searchValue.endAccountGrade = "5"
            label = "显示一级科目"
        }

        this.metaAction.sfs({
            "data.searchValue": fromJS(searchValue),
            "data.other.btnContent": label
        })
        this.searchValueChange(searchValue)
    }

    shouldRender = () => {
        this.injections.reduce("update", {
            path: "data.randomNum",
            value: Math.random()
        })
    }

    getRowHeight = index => {
        const tableSource = this.metaAction.gf("data.list").toJS(),
            row = tableSource[index]
        const num = this.calcRowSpan(
            row.accountCodeAndName,
            "accountCodeAndName",
            index
        )
        console.log(num)
        return 37 * num
    }
    onFieldFocus = (targetData, sourceData = []) => {
        if (targetData.length != sourceData.length) {
            this.injections.reduce("update", {
                path: "data.other.startAccountList",
                value: fromJS(changeToOption(sourceData, "codeAndName", "code"))
            })
        }
    }

    getVirtualTable = data => {
        return (
            <ColResizeTable
                className="app-balancesum-rpt-table-tbody"
                id="app-balancesum-rpt-Body-id"
                key={data.tableKey}
                loading={data.loading}
                bordered={true}
                shouldRender={this.shouldRender}
                scroll={data.tableOption}
                style={{ width: "100%" }}
                dataSource={data.list}
                matchIndex={data.other.matchIndex}
                columns={this.tableColumns()}
            ></ColResizeTable>
        )
    }
    createVtableRef = node => (this.vTableRef = node)
}

class ColResizeTable extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            columns: this.props.columns.map((col, index) => ({
                ...col,
                minWidth: col.width || 60,
                onHeaderCell: column => ({
                    width: column.width,
                    onResize: this.handerResize(index)
                })
            }))
        }
    }
    handerResize = index => (e, { size }) => {
        this.setState(({ columns }) => {
            const nextCols = [...columns]
            nextCols[index] = {
                ...nextCols[index],
                width:
                    size.width < nextCols[index].minWidth
                        ? nextCols[index].minWidth
                        : size.width
            }
            const nextColsChild = nextCols[index]["children"]
            if (
                nextColsChild &&
                nextColsChild.length &&
                nextColsChild.length > 1
            ) {
                let forwardWidth = 0
                nextColsChild.map((o, k) => {
                    if (k == nextColsChild.length - 1) {
                        o.width = nextCols[index].width - forwardWidth
                    } else {
                        o.width = Math.ceil(
                            nextCols[index].width / nextColsChild.length
                        )
                        forwardWidth += o.width
                    }
                    nextColsChild[k] = o
                })

                nextCols[index]["children"] = nextColsChild
            }

            return { columns: nextCols }
        })
    }

    render() {
        const { columns } = this.state

        /*let tableHeader = document.getElementsByClassName('ant-table-thead') && document.getElementsByClassName('ant-table-thead')[0],
            headerWidth = 0

        columns.map(o => {
            headerWidth += o.width
        })

        if(tableHeader) {
            tableHeader.style.width = headerWidth
        }*/

        return <VirtualTable {...this.props} columns={columns} />
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }
    metaAction.config({ metaHandlers: ret })

    return ret
}
