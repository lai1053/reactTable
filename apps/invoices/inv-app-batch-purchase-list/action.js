import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import { fromJS } from "immutable"
import config from "./config"
import { Icon, Tooltip } from "edf-component"
import moment from "moment"
import { Menu, Radio, Button, message } from "antd"
import utils from "edf-utils"
const { SubMenu } = Menu
import { btnType } from "./fixedData"
import piaoshuibaolog from "./img/piaoshuibaolog.png"
const sortOrder = {
    fpzlMc: "fpzl_for_sort",
    formatedKprq: "kprq",
    fpdm: "fpdm",
    fphm: "fphm",
    formatedDkyf: "dkyf",
    hjje: "hjje",
    formatedZbslv: "zbslv_for_sort",
    hjse: "hjse",
    xfmc: "xfmc",
    fpztDm: "fpzt_for_sort",
    fplyLx: "fply_for_sort",
    bdzt: "bdzt",
    bdlyLx: "bdly_lx",
    skssq: "skssq",
    showDzfp: "showDzfp",
    showCheck: "showCheck",
    sbytMc: "sbytMc",
    nf06: "nf06",
    bdjg: "bdjg",
    df05: "df05",
}
import ImportInvoice from "../component/ImportInvoice"
import QRCode from "../inv-app-riskControl/qrcode"

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = this.config.webapi

        injections.reduce("init")
        this.initPage()
        // 再次进入 refresh
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener("onTabFocus", ::this.initPage)
        }
    }
    getAppParams() {
        // let { appParams } = this.component.props;
        // console.log(appParams);
        // if (appParams && Object.keys(appParams).length) return appParams;
        // if (sessionStorage["appParams"]) {
        //     appParams = JSON.parse(sessionStorage["appParams"]).appParams;
        //     if (appParams && Object.keys(appParams).length) return appParams;
        // }
        const currentOrg = this.metaAction.context.get("currentOrg")
        return {
            userDetail: "1",
            qyId: currentOrg.id,
            nsqj: moment().format("YYYYMM"),
            swVatTaxpayer: currentOrg.swVatTaxpayer === 2000010002 ? "1" : "0", // 0 为一般纳税人 1为小规模
        }
    }
    componentDidMount = () => {
        this.mounted = true
        if (window.addEventListener) {
            window.addEventListener("resize", this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent("onresize", this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }
    componentWillUnmount = () => {
        this.mounted = false
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener("resize", this.onResize, false)
            document.removeEventListener("keydown", this.keyDown, false)
        } else if (win.detachEvent) {
            win.detachEvent("onresize", this.onResize)
            document.detachEvent("keydown", this.keyDown)
        } else {
            win.onresize = undefined
        }
    }
    // 根据权限获取右侧操作按钮
    getBtnTypeByAuth(xdzOrgIsStop, userDetail) {
        // 停用客户，无操作按钮
        if (xdzOrgIsStop) return btnType.filter(f => f.key === "printprintInvoices")
        if (userDetail === 2) {
            btnType.forEach(item => {
                if (item.key !== "printprintInvoices") item.disabled = true
            })
        } else if (userDetail === 1) {
            btnType.forEach(item => {
                item.disabled = false
            })
        }
        return btnType
    }
    // 初始化页面数据
    initPage = () => {
        const { invoiceVersion, xdzOrgIsStop } = this.metaAction.context.get("currentOrg")
        let { swVatTaxpayer, nsqj, qyId, userDetail } = this.component.props.qyId
            ? this.component.props
            : this.getAppParams()
        if (swVatTaxpayer == undefined || !nsqj || !qyId) {
            this.metaAction.toast("error", "进入方式不对")
            return
        }
        let filterFormOld = this.metaAction.gf("data.filterFormOld").toJS()
        filterFormOld.dkMonth =
            swVatTaxpayer === "0"
                ? moment(`${nsqj}01`).subtract(1, "month").format("YYYYMM").substr(0, 6)
                : "全部"
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        this.metaAction.sfs({
            "data.xdzOrgIsStop": xdzOrgIsStop,
            "data.btnType": fromJS(this.getBtnTypeByAuth(xdzOrgIsStop, userDetail)),
            "data.userDetail": userDetail,
            "data.invoiceVersion": invoiceVersion,
            "data.skssq": moment(`${nsqj}01`).subtract(1, "month"),
            "data.nsqj": moment(`${nsqj}01`, "YYYYMM"),
            "data.swVatTaxpayer": swVatTaxpayer,
            "data.invCertificate": "1",
            "data.inputVal": "",
            "data.sort": fromJS({
                userOrderField: "",
                order: "",
            }),
            "data.pagination": fromJS(pagination),
            "data.filterFormOld": fromJS(filterFormOld),
            "data.filterForm": fromJS(filterFormOld),
        })
        this.getColumns()
        this.load()
        this.getDkMonth()
        this.getFpzlcsList()
        this.getSlvcsList()
    }
    // 获取列表数据
    load = async () => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        const { invoiceVersion } = currentOrg
        this.metaAction.sf(
            "data.helpTooltip",
            invoiceVersion === 2
                ? "可以读取税务发票、远程提取发票和票税宝上传发票"
                : "可以读取税务发票、远程提取发票和票税宝上传发票，并对导入发票补全明细"
        )
        let loading = this.metaAction.gf("data.loading")
        let { swVatTaxpayer, qyId, xgmJbOrYb } = this.component.props.qyId
            ? this.component.props
            : this.getAppParams()
        if (!loading) {
            this.injections.reduce("tableLoading", true)
        }
        const xfmc = this.metaAction.gf("data.inputVal")
        const invCertificate = this.metaAction.gf("data.invCertificate")
        const pagination = this.metaAction.gf("data.pagination").toJS()
        const filterForm = this.metaAction.gf("data.filterForm").toJS()
        const sort = this.metaAction.gf("data.sort").toJS()
        let skssq = this.metaAction.gf("data.skssq")
        skssq = skssq.format("YYYYMMDD")
        skssq = skssq.substring(0, 6)
        let {
            invType,
            invCode,
            invNumber,
            dkMonth,
            customCode,
            taxRate,
            strDate,
            endDate,
            uploadStarDate,
            uploadEndDate,
            statusValue,
            isDzfp,
            bdlyLx,
            bdjg,
            scopeType,
            showCheck,
        } = filterForm
        if (showCheck === "全部") showCheck = "" // 原始票
        if (isDzfp === "全部") isDzfp = ""
        if (bdlyLx === "抵扣") bdlyLx = "1"
        if (bdjg === "正常") bdjg = "0"
        if (bdlyLx === "10" || bdlyLx === "2" || bdlyLx === "3") dkMonth = "全部"
        if (dkMonth === "全部") dkMonth = 1
        let status = {
            normal: "0", //正常（"1"：选中；"0"或者null：没有选中）
            hcfp: "0",
            cancelled: "0",
            abnormal: "0",
            lostControl: "0",
        }
        statusValue.forEach(i => {
            status[i] = "1"
        })

        const params = {
            entity: {
                qyId: qyId,
                skssq: skssq,
                xfmc,
                fpzlDm: invType,
                fpdm: invCode,
                fphm: invNumber,
                fpztDmValues: status,
                xfsbh: customCode,
                zbslv: taxRate,
                showCheck,
                bdzt: swVatTaxpayer === "1" ? "" : invCertificate,
                //xgmJbOrYb: swVatTaxpayer === "0" ? null : xgmJbOrYb,
                isDzfp: isDzfp,
                bdlyLx: swVatTaxpayer === "0" && invCertificate === "1" ? bdlyLx : undefined,
                bdjg,
            },
            dkyfType:
                dkMonth === "全部"
                    ? 1
                    : bdlyLx === "6"
                    ? 0
                    : bdlyLx === ""
                    ? 1
                    : dkMonth === ""
                    ? 1
                    : dkMonth,
            kprqq: strDate,
            kprqz: endDate,
            uploadStarDate,
            uploadEndDate,
            scopeType,
            page: {
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
            },
            orders: sort.userOrderField
                ? [
                      {
                          name: sort.userOrderField ? sortOrder[sort.userOrderField] : "",
                          asc: sort.order ? sort.order === "asc" : "",
                      },
                  ]
                : [],
        }
        const resp = await this.webapi.invoice.queryJxfpPageList(params)
        if (!this.mounted) return
        this.injections.reduce("tableLoading", false)
        if (resp) {
            this.injections.reduce("update", {
                path: "data.tableCheckbox",
                value: {
                    checkboxValue: [],
                    selectedOption: [],
                },
            })
            this.metaAction.sf("data.list", fromJS([]))
            this.injections.reduce("load", resp)
            setTimeout(() => {
                this.onResize()
            }, 50)
        }
    }
    // 获取当前表头数据
    getColumns = async () => {
        this.metaAction.sf("data.columns", fromJS([]))
        let swVatTaxpayer = this.metaAction.gf("data.swVatTaxpayer")
        const pageID = swVatTaxpayer === "0" ? "purchaseInvoiceGeneral" : "purchaseInvoiceSmall"
        const resp = await this.webapi.invoice.queryColumnVo({
            pageID,
        })
        if (!this.mounted) return
        let columnData = this.metaAction.gf("data.columnData2").toJS()
        // const currentOrg = this.metaAction.context.get("currentOrg") || {};
        let columns = columnData[swVatTaxpayer].columns
        if (resp) {
            const data = JSON.parse(resp.columnjson)
            let a = data.filter(item => item === "showDzfp")
            if (Array.isArray(a) && a.length !== 0) {
                this.resetTableSetting()
            }
            columns.forEach(item => {
                const idx = data.indexOf(item.id)
                item.isVisible = idx !== -1
            })
        }
        let invCertificate = this.metaAction.gf("data.invCertificate")
        if (invCertificate === "0") {
            columns = columns.filter(
                item => (item.id != "bdlyLx") & (item.id != "nf06") & (item.id != "bdjg")
            )
        }

        this.metaAction.sf("data.columns", fromJS(columns))
        this.metaAction.sf("data.oldcolumns", fromJS(columns))
    }
    // 获取抵扣月份
    getDkMonth = () => {
        let arr = ["全部"]
        let skssq = this.metaAction.gf("data.skssq")
        let nsqj = this.metaAction.gf("data.nsqj")
        for (let i = 0; i < 12; i++) {
            let month = moment(nsqj).subtract(i, "month").format("YYYYMM").substr(0, 6)
            arr.push(month)
        }
        //const currentOrg = this.metaAction.context.get("currentOrg");
        //const { invoiceVersion } = currentOrg;
        /* if (invoiceVersion === 1) {
             arr.push('不抵扣')
         } // 9月20号屏蔽状态*/
        this.metaAction.sf("data.dkMonth", fromJS(arr))
        let filterFormOld = this.metaAction.gf("data.filterFormOld").toJS()
        let { swVatTaxpayer } = this.component.props.qyId
            ? this.component.props
            : this.getAppParams()
        filterFormOld.dkMonth = swVatTaxpayer === "0" ? skssq.format("YYYYMM").substr(0, 6) : "全部"
        this.metaAction.sf("data.filterFormOld", fromJS(filterFormOld))
        this.metaAction.sf("data.filterForm", fromJS(filterFormOld))
    }
    // 获取发票类型
    getFpzlcsList = async () => {
        let swVatTaxpayer = this.getAppParams().swVatTaxpayer || this.component.props.swVatTaxpayer
        const resp = await this.webapi.invoice.getFpzlcsList({
            nsrxz: swVatTaxpayer === "0" ? "YBNSRZZS" : "XGMZZS",
            fplx: "jxfp",
        })
        if (!this.mounted) return
        if (resp) {
            const arr = [
                {
                    fplx: "jxfp",
                    fpzlDm: "",
                    fpzlMc: "全部",
                    nsrxz: "YBNSRZZS",
                },
            ]
            this.metaAction.sf("data.invTypes", fromJS(arr.concat(resp)))
        }
    }
    // 获取税率
    getSlvcsList = async () => {
        let swVatTaxpayer = this.getAppParams().swVatTaxpayer || this.component.props.swVatTaxpayer
        const rest = await this.webapi.invoice.getSlvcsList({
            nsrxz: swVatTaxpayer === "0" ? "YBNSRZZS" : "XGMZZS",
            fplx: "jxfp",
        })
        let hash = {}
        const newArr = rest.reduceRight((item, next) => {
            hash[next.slvMc] ? "" : (hash[next.slvMc] = true && item.push(next))
            return item
        }, [])
        newArr.splice(0, 0, {
            slv: "",
            slvMc: "全部",
        })
        this.metaAction.sf("data.taxRates", fromJS(newArr))
    }
    // 切换报税月份
    handleMonthPickerChange = (e, strTime) => {
        //strTime = strTime.replace(/-/g, "");
        this.metaAction.sf("data.invCertificate", "1")
        this.injections.reduce("tableLoading", true)
        this.metaAction.sf("data.nsqj", e)
        this.metaAction.sf("data.skssq", moment(e).subtract(1, "month"))
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        this.metaAction.sf("data.pagination", fromJS(pagination))
        this.getDkMonth()
        this.load()
    }
    // input 搜索
    onSearch = () => {
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        this.metaAction.sf("data.pagination", fromJS(pagination))
        this.load()
    }
    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        let a
        if (arr.length > 0) {
            a = 1
        } else {
            a = 2
        }
        let newArr = []
        arr.forEach(item => {
            if (item) {
                newArr.push(item)
            }
        })
        let newItemArr = []
        const amount = {
            fpzs: 0,
            totalHjje: 0,
            totalHjse: 0,
            negativeTotalHjje: 0,
            negativeTotalHjse: 0,
            effectiveTotalHjse: 0,
            effectiveNegativeTotalHjse: 0,
        }
        if (itemArr.length > 0) {
            itemArr.map(item => {
                if (item) {
                    newItemArr.push(item)
                    if (typeof item.hjje === "number") {
                        if (item.hjje) {
                            amount.totalHjje = parseFloat(+amount.totalHjje + item.hjje).toFixed(2)
                            if (item.hjje < 0) {
                                amount.negativeTotalHjje = parseFloat(
                                    +amount.negativeTotalHjje + item.hjje
                                ).toFixed(2)
                            }
                        }
                    }
                    if (typeof item.hjse === "number") {
                        if (item.hjse) {
                            amount.totalHjse = parseFloat(+amount.totalHjse + item.hjse).toFixed(2)
                            if (item.hjse < 0) {
                                amount.negativeTotalHjse = parseFloat(
                                    +amount.negativeTotalHjse + item.hjse
                                ).toFixed(2)
                            }
                        }
                    }

                    if (typeof item.nf06 === "number") {
                        if (item.nf06) {
                            amount.effectiveTotalHjse = parseFloat(
                                +amount.effectiveTotalHjse + item.nf06
                            ).toFixed(2)
                            if (item.nf06 < 0) {
                                amount.effectiveNegativeTotalHjse = parseFloat(
                                    +amount.effectiveNegativeTotalHjse + item.nf06
                                ).toFixed(2)
                            }
                        }
                    }
                }
            })
            const amountData = this.metaAction.gf("data.amountData").toJS()
            Object.keys(amount).forEach(item => {
                if (item !== "fpzs") {
                    let itemVal = amount[item]
                    amountData[item] = utils.number.format(itemVal, 2)
                }
            })
            amountData.fpzs = itemArr.length
            this.metaAction.sf("data.amountData", fromJS(amountData))
        } else {
            const amountDataOld = this.metaAction.gf("data.amountDataOld").toJS()
            this.metaAction.sf("data.amountData", fromJS(amountDataOld))
        }

        this.injections.reduce("update", {
            path: "data.tableCheckbox",
            value: {
                checkboxValue: newArr,
                selectedOption: newItemArr,
                checkboxFlag: a,
            },
        })
        //this.selectedOption = newItemArr
    }
    // 是否为开发、测试模式
    isTestMode = () => {
        let href = location.href.toLowerCase()
        return (
            href.indexOf("dev.") > -1 ||
            href.indexOf("xdzdemo.") > -1 ||
            href.indexOf("10.10.") > -1
        )
    }
    // 获取操作权限
    getActionRule = record => {
        // 暂时未调用客户模块提供的接口
        const userDetail = this.metaAction.gf("data.userDetail")
        const xdzOrgIsStop = this.metaAction.gf("data.xdzOrgIsStop")
        if (xdzOrgIsStop) return true
        let readOnly = false
        if (this.isTestMode()) {
            readOnly = userDetail === 2 ? true : false
        }
        return readOnly
    }
    // 双击某张发票
    doubleClick = record => {
        return {
            onDoubleClick: async () => {
                let { fpzlDm, kjxh, fpdm, fphm } = record
                let nsqj = this.metaAction.gf("data.nsqj")
                let skssq = moment(nsqj).subtract(1)
                let obj = {
                    "01": {
                        title: "增值税专用发票(进项)-查看",
                        appName: "inv-app-new-invoices-card",
                    },
                    "03": {
                        title: "机动车销售发票(进项)-查看",
                        appName: "inv-app-new-invoices-card",
                    },
                    "04": {
                        title: "增值税普通发票(进项)-查看",
                        appName: "inv-app-new-invoices-card",
                    },
                    "07": {
                        title: "二手车销售发票(进项)-查看",
                        appName: "inv-app-new-invoices-card",
                    },
                    "12": {
                        title: "代扣代缴专用缴款书(进项)-查看",
                        appName: "inv-app-new-invoices-card",
                    },
                    "13": {
                        title: "海关专用缴款书(进项)-查看",
                        appName: "inv-app-new-invoices-card",
                    },
                    "14": {
                        title: "农产品销售（收购）发票(进项)-查看",
                        appName: "inv-app-new-invoices-card",
                    },
                    "17": {
                        title: "通行费增值税电子普通发票(进项)-查看",
                        appName: "inv-app-new-invoices-card",
                    },
                    "18": {
                        title: "旅客运输服务抵扣凭证(进项)-查看",
                        appName: "inv-app-new-invoices-card",
                    },
                    "99": {
                        title: "其他票据(进项)-查看",
                        appName: "inv-app-new-invoices-card",
                    },
                }
                let readOnly = this.getActionRule(record)
                let invArguments = {
                    fpzlDm,
                    fpdm,
                    fphm,
                }
                const height = document.body.clientHeight - 40 || 700
                let width = document.body.clientWidth - 50 || 1000
                if (width > 1920) width = 1920

                let fpName = obj[fpzlDm].title.replace("(进项)-查看", "")
                let option = {
                    title: obj[fpzlDm].title.replace("-查看", readOnly ? "" : "-修改"),
                    wrapClassName: `${obj[fpzlDm].appName}-modal`,
                    width,
                    height,
                    footer: null,
                    style: { top: 25 },
                    okText: "保存",
                    // cancelText: '关闭',
                    bodyStyle: {
                        padding: "0px",
                        borderTop: "1px solid #e8e8e8",
                    },
                    children: this.metaAction.loadApp(obj[fpzlDm].appName, {
                        store: this.component.props.store,
                        kjxh,
                        nsqj: skssq,
                        fplx: "jxfp",
                        fpzlDm: fpzlDm,
                        readOnly, // 只允许查看，
                        xdzOrgIsStop: this.metaAction.gf("data.xdzOrgIsStop"),
                        fpName,
                        sf01: record.sf01,
                    }),
                }
                let ret = await this.metaAction.modal("show", option)

                if (ret.listNeedLoad) {
                    this.load()
                }
            },
        }
    }
    // 高级筛选  点击重置
    resetForm = () => {
        const { filterFormOld, formContent } = this.metaAction.gf("data").toJS()
        Object.assign(formContent, filterFormOld)
        this.metaAction.sf("data.formContent", fromJS(formContent))
    }
    // 已认证,未认证，全部 切换
    handleInvCertificateChange = e => {
        this.metaAction.sf("data.invCertificate", e.target.value)
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        this.metaAction.sf("data.pagination", fromJS(pagination))
        let filterFormOld = this.metaAction.gf("data.filterFormOld").toJS()
        filterFormOld.dkMonth =
            e.target.value === "0" || e.target.value === null
                ? "全部"
                : this.metaAction.gf("data.skssq").format("YYYYMM").substr(0, 6)
        if (e.target.value === null) {
            filterFormOld.statusValue = ["normal", "hcfp", "cancelled", "abnormal", "lostControl"]
            filterFormOld.bdjg = ""
        }
        this.metaAction.sf("data.filterFormOld", fromJS(filterFormOld))
        this.metaAction.sf("data.filterForm", fromJS(filterFormOld))
        this.load()
        this.getColumns()
    }
    // 头部按钮，更多 点击触发时间入口
    judgeIsChoseBill = async type => {
        const needWarning = ["editInvoice", "deleteInvoice", "completionInvoice"]
        const { checkboxValue } = this.metaAction.gf("data.tableCheckbox").toJS()
        const describe = {
            editInvoice: "请先选择需要修改的发票",
            deleteInvoice: "请先选择需要删除的发票",
            completionInvoice: "请选择需要补全明细的发票",
        }
        if (type.key === "import") {
            this.import()
            return
        }

        if (type.key === "exportInvoice" && this.metaAction.gf("data.normalFpzs") <= 0) {
            message.warning("当前没有可导出的发票数据", 3)
            return
        }
        if (needWarning.indexOf(type.key) > -1 && checkboxValue && checkboxValue.length === 0) {
            message.warning(describe[type.key])
            return
        }
        if (type.key) {
            if (type.item && type.item.props) {
                type.title = type.item.props.title
                type.fpzl = type.item.props.fpzl
                type.type = type.item.props.type
                type.name = type.item.props.name
            }
            if (
                type.key === "exportInvoice" ||
                type.key === "deleteInvoice" ||
                type.key === "editInvoice" ||
                type.key === "batchEditInvoice" ||
                type.key === "printprintInvoices" ||
                type.key === "psbbupiao" ||
                type.key === "completionInvoice"
            ) {
                this[type.key](type)
                return
            }
            if (type.keyPath && type.keyPath.includes("addInvoice")) {
                //新增进项发票
                return this.addInvoice(type)
            }
            let skssq = this.metaAction.gf("data.skssq").format("YYYYMM")
            skssq = skssq.substring(0, 6)
            const ret = await this.metaAction.modal("show", {
                title: type.title || "弹窗",
                className: type.key + "-modal",
                width: type.key === "inv-app-pu-collect-card" ? 430 : 1000,
                style: { top: 25 },
                bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
                children: this.metaAction.loadApp(type.key, {
                    store: this.component.props.store,
                    data: {
                        ...this.getAppParams(),
                    },
                    nsqj: skssq,
                    callback: this.load,
                    type,
                }),
            })
            if (ret.listNeedLoad) {
                this.load()
            }
        }
    }
    loadPurchaseInvoice = () => {}
    //票税宝补票
    psbbupiao = async isenable => {
        let enable = false,
            currentOrg = this.metaAction.context.get("currentOrg") || {},
            periodDate = currentOrg.periodDate || moment().format("YYYYMM"),
            skssq = moment(periodDate).format("YYYYMMDD"),
            nsrsbh = currentOrg.vatTaxpayerNum
        skssq = skssq.substring(0, 6)
        const param = {
            enable: isenable === true ? true : enable,
            skssq,
            nsrsbh,
        }
        this.metaAction.sf("data.loading", true)
        let res = await this.webapi.invoice.openInvoiceMainPageUrl(param)
        this.metaAction.sf("data.loading", false)
        if (res) {
            if (res.popup === true) {
                // 要弹出开通标志
                let ret = await this.metaAction.modal("show", {
                    title: "票税宝补票",
                    top: 10,
                    className: "inv-app-batch-psbbupiao-modal",
                    footer: null,
                    children: (
                        <div style={{ alignItems: "center", textAlign: "center" }}>
                            <p>您未开通票税宝，无法使用补票功能!</p>
                            <Button
                                size="Large"
                                type="primary"
                                onClick={() => {
                                    this.closeModal()
                                    this.psbbupiao(true)
                                }}>
                                立即开通
                            </Button>
                        </div>
                    ),
                })
                console.log(ret)
            }
            if (res.popup === false && res.pageUrl) {
                // 弹出二维码

                let ret = this.metaAction.modal("show", {
                    title: "票税宝补票",
                    top: 10,
                    className: "inv-app-batch-psbbupiao-modal",
                    footer: null,
                    children: (
                        <div>
                            <div className="title">
                                <p>请使用微信“扫一扫”</p>
                                <div className="img">
                                    <div className="ermg" id="ermg"></div>
                                </div>
                            </div>
                            <div className="text">
                                <p style={{ color: "red" }}>温馨提示：</p>
                                <p>
                                    1、请使用手机，打开微信“扫一扫”以上二维码，然后进入票税宝产品端
                                </p>
                                <p>2、在票税宝产品端补充发票：</p>
                                <p className="text2">
                                    先确认“会计期间”，然后点击【拍照识票】，可单张或连续拍票；
                                </p>
                                <p className="text2">
                                    {" "}
                                    符合条件的发票，会自动上传，可点击【查看发票】查看上传状态。
                                </p>
                                <p>
                                    {" "}
                                    3、发票补充完毕，请回到代帐系统，点击【一键读取发票】，将同步票税宝的发票。
                                </p>
                                <p className="text2"> 读取发票时，请注意选择正确的发票月份</p>
                            </div>
                            <div className="footer">
                                <div className="right">
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            this.closeModal()
                                        }}>
                                        关闭
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ),
                })
                let qr = new QRCode(document.getElementById("ermg"), {
                    width: 128,
                    height: 128,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                })
                res.pageUrl
                qr.makeCode(res.pageUrl)
            }
        }
    }
    // 打印电子票
    printprintInvoices = async () => {
        const { checkboxValue } = this.metaAction.gf("data.tableCheckbox").toJS()
        if (checkboxValue.length === 0) {
            this.metaAction.toast("error", "请选择您要打印的数据")
            return
        } else {
            this.metaAction.sf("data.loading", true)
            const data = {
                fplx: "jxfp",
                kjxhList: checkboxValue,
            }
            const res = await this.webapi.invoice.openInvoicePrintInvoices(data)
            let isContinue = false
            if (res) {
                this.metaAction.sf("data.loading", false)
                if (res.enable === true && res.popup === false) {
                    window.open(res.pageUrl, "_blank")
                    return
                }
                if (res.isPrint > 0) isContinue = true
                this.metaAction.modal(isContinue === true ? "confirm" : "info", {
                    title: "电子发票打印",
                    width: "458px",
                    okText: isContinue === true ? "继续打印" : "确定",
                    onOk: () => {
                        this.windowOpen(res.pageUrl)
                    },
                    content: (
                        <div style={{ fontSize: "12px", lineHeight: "22px" }}>
                            {isContinue === true && (
                                <h3 style={{ paddingBottom: "10px" }}>电子发票打印</h3>
                            )}
                            <div>
                                已选中发票：<span>{res.print}</span>
                                张，可打印：
                                <span style={{}}>{res.isPrint}</span>
                                张，不可打印：
                                <span style={{}}>{res.noPrint}</span>张
                            </div>
                            {isContinue === true ? <div>需要继续吗？</div> : ""}
                            <div
                                style={{
                                    color: "#FFA500",
                                    marginTop: " 5px",
                                }}>
                                温馨提示：已通过【票税宝】产品上传了电子发票凭证，才能打印哦！
                            </div>
                        </div>
                    ),
                })
            }
        }
    }
    // 打开新窗口页面
    windowOpen = url => {
        window.open(url, "_blank")
    }
    // 关闭弹窗
    destroyDialog = wrapClassName => {
        const dialog = document.getElementsByClassName(wrapClassName)[0].parentNode.parentNode
        document.body.removeChild(dialog)
    }
    exportInvoice = () => {
        let radioSelected = "exportFpInDetail"
        const radioStyle = {
            display: "block",
            lineHeight: "44px",
        }
        const dialogContent = (
            <Radio.Group
                name="export_exportInvoices"
                defaultValue={radioSelected}
                onChange={function (e) {
                    radioSelected = e.target.value
                }}>
                <Radio style={radioStyle} value="exportFpInDetail">
                    导出明细发票数据（一条明细一条记录）
                </Radio>
                <Radio style={radioStyle} value="exportFpInSummary">
                    导出汇总发票数据（一张发票一条记录）
                </Radio>
            </Radio.Group>
        )
        this.metaAction.modal("show", {
            title: "导出",
            width: 400,
            wrapClassName: "inv-app-pu-export-dialog",
            bodyStyle: {
                borderTop: "1px solid #e9e9e9",
                padding: "30px 60px 45px",
            },
            footer: (
                <div>
                    <Button
                        onClick={() => {
                            this.destroyDialog("inv-app-pu-export-dialog")
                        }}>
                        取消
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            this.downloadOk(radioSelected)
                        }}>
                        确定
                    </Button>
                </div>
            ),
            children: dialogContent,
        })
    }
    // 下载导出
    downloadOk = async radioSelected => {
        // this.destroyDialog('inv-app-pu-export-dialog')
        const { dljgId, userId } = this.metaAction.gf("data").toJS()
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        let nsrsbh = currentOrg.vatTaxpayerNum,
            nsrmc = currentOrg.name,
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? "XGMZZS" : "YBNSRZZS"
        const xfmc = this.metaAction.gf("data.inputVal")
        const invCertificate = this.metaAction.gf("data.invCertificate")
        const pagination = this.metaAction.gf("data.pagination").toJS()
        const filterForm = this.metaAction.gf("data.filterForm").toJS()
        const sort = this.metaAction.gf("data.sort").toJS()
        let { swVatTaxpayer, xgmJbOrYb } = this.component.props.qyId
            ? this.component.props
            : this.getAppParams()
        let {
            invType,
            invCode,
            invNumber,
            dkMonth,
            customCode,
            taxRate,
            strDate,
            endDate,
            statusValue,
            goodsType,
            bdlyLx,
            bdjg,
            scopeType,
            isDzfp,
            showCheck,
        } = filterForm
        if (showCheck === "全部") showCheck = null

        if (bdlyLx === "抵扣") bdlyLx = "1"
        if (bdlyLx === "10") dkMonth = "全部"
        if (bdjg === "正常") bdjg = "0"
        if (isDzfp === "全部") isDzfp = ""
        if (bdlyLx === "10" || bdlyLx === "2" || bdlyLx === "3") dkMonth = "全部"
        let nsqj = this.metaAction.gf("data.skssq").format("YYYYMMDD")
        nsqj = nsqj.substring(0, 6)
        let status = {
            normal: "0", //正常（"1"：选中；"0"或者null：没有选中）
            hcfp: "0",
            cancelled: "0",
            abnormal: "0",
            lostControl: "0",
        }
        statusValue.forEach(i => {
            status[i] = "1"
        })
        const params = {
            entity: {
                qyId: currentOrg.id,
                dljgId,
                userId,
                skssq: nsqj,
                xfmc,
                fpzlDm: invType,
                fphm: invNumber,
                fpdm: invCode,
                fpztDmValues: status,
                xfsbh: customCode,
                zbslv: taxRate,
                showCheck,
                bdzt: swVatTaxpayer === "1" ? "" : invCertificate,
                bdlyLx: swVatTaxpayer === "0" && invCertificate === "1" ? bdlyLx : undefined,
                bdjg,
                isDzfp,
                //xgmJbOrYb: swVatTaxpayer === "0" ? "" : xgmJbOrYb
            },
            dkyfType:
                dkMonth === "全部"
                    ? 1
                    : bdlyLx === "6"
                    ? 0
                    : bdlyLx === ""
                    ? 1
                    : dkMonth === ""
                    ? 1
                    : dkMonth,
            kprqq: strDate,
            kprqz: endDate,

            scopeType,
            page: {
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
            },
            orders: sort.userOrderField
                ? [
                      {
                          name: sort.userOrderField ? sortOrder[sort.userOrderField] : "",
                          asc: sort.order ? sort.order === "asc" : "",
                      },
                  ]
                : [],
        }
        let response
        if (radioSelected === "exportFpInSummary") {
            response = await this.webapi.invoice.exportJxfpInSummary(params)
        } else {
            response = await this.webapi.invoice.exportJxfpInDetail(params)
        }
        setTimeout(() => {
            this.destroyDialog("inv-app-pu-export-dialog")
        }, 1500)
    }
    deleteInvoice = async () => {
        const { checkboxValue } = this.metaAction.gf("data.tableCheckbox").toJS()
        const confirm = await this.metaAction.modal("confirm", {
            content: "你确定要删除勾选的发票？",
            width: 340,
        })
        if (confirm) {
            const { qyId } = this.getAppParams() || {}
            const currentOrg = this.metaAction.context.get("currentOrg") || {},
                periodDate = currentOrg.periodDate || moment().format("YYYYMM"),
                skssq = moment(periodDate).subtract(1, "month").format("YYYYMM"),
                nsrsbh = currentOrg.vatTaxpayerNum
            const res = await this.webapi.invoice.deleteJxfp({
                qyId: qyId || "1", // 企业Id
                skssq,
                nsrsbh,
                kjxhList: checkboxValue,
            })
            if (res == null) {
                this.metaAction.toast("success", "删除成功")
                this.load()
            }
        }
    }
    addInvoice = async type => {
        //新增进项发票
        let nsqj = this.metaAction.gf("data.nsqj")
        let skssq = moment(nsqj).subtract(1)
        const height = document.body.clientHeight - 40 || 700
        let width = document.body.clientWidth - 50 || 1000
        if (width > 1920) width = 1920
        let para = {
            title: type.title,
            className: `${type.key}-modal`,
            width,
            height,
            footer: null,
            okText: "保存",
            style: {
                top: 25,
            },

            bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
            children: this.metaAction.loadApp("inv-app-new-invoices-card", {
                store: this.component.props.store,
                nsqj: skssq,
                kjxh: null,
                fplx: "jxfp",
                fpzlDm: type.fpzl,
                fpName: type.name,
                sf01: type.sf01, // 专票或者普票
            }),
        }
        // if (type.fpzl == '01' || type.fpzl =='04' || type.fpzl =='03' || type.fpzl == '07') {
        //     para.footer = null;
        //     para.bodyStyle = {
        //         padding: "0px 0 12px 0",
        //         borderTop: "1px solid #e8e8e8"
        //     };
        // }
        const ret = await this.metaAction.modal("show", para)
        if (ret.listNeedLoad) {
            this.load()
        }
    }
    //单张修改
    editInvoice = async () => {
        const { checkboxValue, selectedOption } = this.metaAction.gf("data.tableCheckbox").toJS()
        if (!checkboxValue.length) {
            this.metaAction.toast("error", "请勾选需要修改的发票")
            return
        } else if (checkboxValue.length > 1) {
            /*  await this.metaAction.modal('info', {
                  title: '提示',
                  content: '请选择单张要修改的发票！',
                  okText: '确定'
              })*/
            this.metaAction.toast("error", "请选择单张要修改的发票！")
            return
        }
        let { fpzlDm, kjxh, sf01 } = selectedOption[0]
        if (!fpzlDm || !kjxh) {
            return
        }
        let obj = {
            "01": {
                title: "增值税专用发票(进项)-查看",
                appName: "inv-app-new-invoices-card",
            },
            "03": {
                title: "机动车销售发票(进项)-查看",
                appName: "inv-app-new-invoices-card",
            },
            "04": {
                title: "增值税普通发票(进项)-查看",
                appName: "inv-app-new-invoices-card",
            },
            "07": {
                title: "二手车销售发票(进项)-查看",
                appName: "inv-app-new-invoices-card",
            },
            "12": {
                title: "代扣代缴专用缴款书(进项)-查看",
                appName: "inv-app-new-invoices-card",
            },
            "13": {
                title: "海关专用缴款书(进项)-查看",
                appName: "inv-app-new-invoices-card",
            },
            "14": {
                title: "农产品销售（收购）发票(进项)-查看",
                appName: "inv-app-new-invoices-card",
            },
            "17": {
                title: "通行费增值税电子普通发票(进项)-查看",
                appName: "inv-app-new-invoices-card",
            },
            "18": {
                title: "旅客运输服务抵扣凭证(进项)-查看",
                appName: "inv-app-new-invoices-card",
            },
            "99": {
                title: "其他票据(进项)-查看",
                appName: "inv-app-new-invoices-card",
            },
        }
        let readOnly = false
        if (!obj[fpzlDm]) return
        let nsqj = this.metaAction.gf("data.nsqj")
        let skssq = moment(nsqj).subtract(1)
        let fpName = obj[fpzlDm].title.replace("(进项)-查看", "")

        const height = document.body.clientHeight - 40 || 700
        let width = document.body.clientWidth - 50 || 1000
        if (width > 1920) width = 1920

        let para = {
            title: obj[fpzlDm].title.replace("-查看", readOnly ? "" : "-修改"),
            wrapClassName: `${obj[fpzlDm].appName}-modal`,
            width,
            height,
            footer: null,
            style: { top: 25 },
            okText: "保存",

            // cancelText: '关闭',
            bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
            children: this.metaAction.loadApp(obj[fpzlDm].appName, {
                store: this.component.props.store,
                kjxh,
                nsqj: skssq,
                fplx: "jxfp",
                fpzlDm: fpzlDm,
                fpName,
                sf01, // 专票或者普票
                // callback: this.load,
            }),
        }
        // if (readOnly || fpzlDm == '01' || fpzlDm =='04' || fpzlDm == '03' || fpzlDm == '07') {
        //     para.footer = null;
        // }
        let ret = await this.metaAction.modal("show", para)
        if (ret.listNeedLoad) {
            this.load()
        }
    }
    batchEditInvoice = async () => {
        const { checkboxValue, selectedOption } = this.metaAction.gf("data.tableCheckbox").toJS()
        const currentOrg = this.metaAction.context.get("currentOrg")
        //const { invoiceVersion } = currentOrg;
        if (!checkboxValue.length) {
            this.metaAction.toast("error", "请勾选需要批量修改的发票")
            return
        }
        let uniformOrAricultural = true //选择的发票为统一发票或农产品
        let uniformOrAriculturalVato = false //选择统一发票或农产品是否为录入
        let vato = true //选择的全部为普票

        if (
            selectedOption.filter(o => o.fpzlDm === "14" || o.fpzlDm === "18").length !==
            checkboxValue.length
        ) {
            uniformOrAricultural = false
        }
        if (uniformOrAricultural) {
            selectedOption.forEach(o => {
                if (o.fplyLx === "2" || o.fplyLx === "1" || o.fplyLx === "5") {
                    uniformOrAriculturalVato = true
                }
            })
        }

        if (selectedOption.filter(o => o.fpzlDm === "04").length !== checkboxValue.length) {
            vato = false
        }
        let skssq = this.metaAction.gf("data.skssq").format("YYYYMMDD")
        skssq = skssq.substring(0, 6)
        /*       //2020年1月9日优化屏蔽
               const res = await this.webapi.invoice.queryBatchUpdateJxfp({
                   kjxhList: checkboxValue,
                   skssq
               });*/
        /*   if (res.existsReadYrzFp === 'Y') {
                 await this.metaAction.modal('warning', {
                     title: '批量修改进项发票失败！',
                     okText: '确定',
                     content: '一键读取的已认证发票，不允许修改认证状态，请取消勾选此类发票，再操作！'
                 })
                 return;
             }*/
        let { swVatTaxpayer } = this.component.props.qyId
            ? this.component.props
            : this.getAppParams()
        let str = "inv-app-pu-batch-update-invoice2"
        const ret = await this.metaAction.modal("show", {
            title: "进项发票批量修改",
            className: "inv-app-pu-batch-update-invoice",
            width: 500,
            //okText: '保存',
            bodyStyle: { padding: "30px" },
            children: this.metaAction.loadApp(str, {
                store: this.component.props.store,
                kjxhList: checkboxValue || [],
                nsqj: skssq,
                uniformOrAricultural,
                uniformOrAriculturalVato,
                vato,
                selectedOption,
                swVatTaxpayer,
            }),
        })
        if (ret.listNeedLoad) {
            this.load()
        }
    }
    completionInvoice = async () => {
        this.metaAction.sf("data.loading", true)
        const { checkboxValue } = this.metaAction.gf("data.tableCheckbox").toJS()
        let invoiceCompletionAsync = await this.webapi.invoice.invoiceCompletionAsync({
            kjxhList: checkboxValue,
        })
        let invoiceCompletionAsyncResult
        if (invoiceCompletionAsync) {
            this.timer = setInterval(async () => {
                invoiceCompletionAsyncResult = await this.webapi.invoice.invoiceCompletionAsyncResult(
                    { seq: invoiceCompletionAsync }
                )
                if (invoiceCompletionAsyncResult) {
                    clearTimeout(this.timer)
                    clearTimeout(this.timer2)
                    let load = await this.metaAction.modal("success", {
                        okText: "确定",
                        content: (
                            <div>
                                <p>勾选发票{checkboxValue.length}张，其中：</p>
                                <p>
                                    已补全发票{invoiceCompletionAsyncResult.successSum}张，补全失败
                                    {invoiceCompletionAsyncResult.failSum}张，无需补全
                                    {invoiceCompletionAsyncResult.noNeedSum}张。
                                </p>
                                <p>
                                    {" "}
                                    <span style={{ color: "orange" }}>温馨提示：</span>
                                    仅支持增值税专用发票补全。{" "}
                                </p>
                            </div>
                        ),
                    })
                    if (load) {
                        if ((load = true)) this.load()
                    }
                } else {
                    clearTimeout(this.timer)
                    clearTimeout(this.timer2)
                    this.load()
                }
            }, 2000)
        }

        this.timer2 = setTimeout(async () => {
            let load = await this.metaAction.modal("error", {
                title: "网络错误",
                okText: "确定",
                content: "网络超时，请稍后再试。",
            })
            if (load) {
                this.load()
            }
            clearTimeout(this.timer)
        }, 1000 * 60 * 3)
    }
    closeModal = () => {
        let node = document.querySelector(".inv-app-batch-psbbupiao-modal")
        let maskNodes = document.querySelectorAll(".ant-modal-mask")[0]
        maskNodes.parentNode.parentNode.removeChild(maskNodes.parentNode)
        node.parentNode.removeChild(node)
    }
    // 高级筛选点击查询
    filterList = () => {
        const { formContent } = this.metaAction.gf("data").toJS()
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        this.metaAction.sf("data.pagination", fromJS(pagination))
        this.metaAction.sfs({
            "data.filterForm": fromJS(formContent),
            "data.showPopoverCard": false,
        })
        this.load()
    }
    handlePopoverVisibleChange = visible => {
        if (visible) {
            const { filterForm } = this.metaAction.gf("data").toJS()
            this.metaAction.sf("data.formContent", fromJS(filterForm))
        }
        this.metaAction.sf("data.showPopoverCard", visible)
    }
    // 触发排序
    sortChange = (key, value) => {
        let params2 = []
        if (value) {
            params2 = {
                userOrderField: key,
                order: value,
            }
        } else {
            params2 = {
                userOrderField: "",
                order: "",
            }
        }
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        this.metaAction.sf("data.pagination", fromJS(pagination))
        this.injections.reduce("sortReduce", params2)
        this.load()
    }
    onResize = e => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        }, 200)
    }
    // 头部更多 html
    renderMore = () => {
        let more = this.metaAction.gf("data.more").toJS()
        /*
         * 2020-03-06
         * 增加对青岛地区发票明细补全功能
         * */
        let skssq = this.metaAction.gf("data.skssq").format("YYYYMMDD")
        const userDetail = this.metaAction.gf("data.userDetail")
        let swVatTaxpayer = this.getAppParams().swVatTaxpayer || this.component.props.swVatTaxpayer
        const xdzOrgIsStop = this.metaAction.gf("data.xdzOrgIsStop")
        if (swVatTaxpayer === "1") {
            more = more.filter(item => item.type != "editInvoice")
        }
        if (xdzOrgIsStop) {
            // 停用客户，只有导出按钮
            more = more.filter(f => f.type === "exportInvoice")
        }

        let flag = true
        if (skssq < 20190401) {
            flag = false
        }
        return more.map(item => {
            return item.hasSub ? (
                <SubMenu key={item.type} title={item.name} className="purchase-invoice-sub-menu">
                    {item.subItem.map(sub => {
                        if (
                            (flag === false && sub.fpzl === "18") ||
                            (swVatTaxpayer !== "0" && sub.fpzl === "18")
                        ) {
                            item.subItem = item.subItem.filter(item => item.fpdm != "18")
                            item.subItem.map(sub => {
                                return (
                                    <Menu.Item
                                        {...sub}
                                        key={sub.fpzl}
                                        disabled={
                                            item.isDisabled !== true && userDetail === 2
                                                ? true
                                                : false
                                        }>
                                        {sub.name}
                                    </Menu.Item>
                                )
                            })
                        } else {
                            return (
                                <Menu.Item
                                    {...sub}
                                    key={sub.fpzl}
                                    disabled={
                                        item.isDisabled !== true && userDetail === 2 ? true : false
                                    }>
                                    {sub.name}
                                </Menu.Item>
                            )
                        }
                    })}
                </SubMenu>
            ) : (
                <Menu.Item
                    {...item}
                    key={item.type}
                    disabled={item.isDisabled !== true && userDetail === 2 ? true : false}>
                    {item.name}
                </Menu.Item>
            )
        })
    }
    // 显示列设置
    showTableSetting = ({ value, data }, e) => {
        e.stopPropagation()
        e.cancelBubble = true
        const columns = this.metaAction.gf("data.columns").toJS()
        columns.forEach(item => {
            if (item.id === "df05") {
                item.caption = (
                    <span>
                        上传日期{" "}
                        <Tooltip title="在【票税宝】产品上传发票的时间">
                            <Icon
                                type="question"
                                theme="twoTone"
                                style={{
                                    color: "#0065b3",
                                    border: "1px solid",
                                    borderRadius: " 50%",
                                }}
                            />
                        </Tooltip>{" "}
                    </span>
                )
            }
            if (item.id === "showCheck") {
                item.caption = (
                    <span>
                        原始票{" "}
                        <Tooltip title="在【票税宝】产品上传了发票，才能查看原始票">
                            <Icon
                                type="question"
                                theme="twoTone"
                                style={{
                                    color: "#0065b3",
                                    border: "1px solid",
                                    borderRadius: " 50%",
                                }}
                            />
                        </Tooltip>{" "}
                    </span>
                )
            }
        })
        this.metaAction.sf("data.other.columnDto", fromJS(columns))
        this.injections.reduce("tableSettingVisible", { value })
    }
    //关闭栏目设置
    closeTableSetting = () => {
        this.injections.reduce("tableSettingVisible", { value: false })
    }
    // 保存列设置
    upDateTableSetting = async ({ value, data }) => {
        const columns = []
        let swVatTaxpayer = this.getAppParams().swVatTaxpayer || this.component.props.swVatTaxpayer
        const pageID = swVatTaxpayer === "0" ? "purchaseInvoiceGeneral" : "purchaseInvoiceSmall"
        for (const item of data) {
            item.isVisible ? columns.push(item.id) : null
        }
        const resp = await this.webapi.invoice.upDateColumn({
            pageID,
            columnjson: JSON.stringify(columns),
        })
        if (resp) {
            this.getColumns()
            this.injections.reduce("tableSettingVisible", { value })
        }
    }
    // 重置列
    resetTableSetting = async () => {
        let swVatTaxpayer = this.getAppParams().swVatTaxpayer || this.component.props.swVatTaxpayer
        const pageID = swVatTaxpayer === "0" ? "purchaseInvoiceGeneral" : "purchaseInvoiceSmall"
        let res = await this.webapi.invoice.deleteColumn({ pageID })
        if (res) {
            this.injections.reduce("update", {
                path: "data.showTableSetting",
                value: false,
            })
            this.getColumns()
        }
    }
    // 渲染表格里的列明细html
    renderColumnsDetail = (text, row, type) => {
        /*  const currentOrg = this.metaAction.context.get("currentOrg");
          const { invoiceVersion } = currentOrg;*/
        /*
         * 2020-03-06
         * 增加对青岛地区发票明细补全功能
         * */
        /*console.log(manageOrg);*/
        if (type === "fpzlMc") {
            return (
                <span className="inv-warn-icon-end" title={text}>
                    {text}
                    {row.showDzfp === "Y" ? <div className="inv-warn-icon-end-dian"></div> : ""}
                </span>
            )
        } else if (type === "fphm") {
            return (
                <span className="inv-warn-icon-end" title={text}>
                    {row.showBqfpmx === "1" || row.fpxxDm === "Y" ? (
                        <Tooltip
                            arrowPointAtCenter={true}
                            placement="top"
                            title={
                                row.showBqfpmx === "1" ? (
                                    "需补全明细"
                                ) : row.fpxxDm === "Y" ? (
                                    "发票信息不全"
                                ) : row.showBqfpmx === "1" && row.fpxxDm === "Y" ? (
                                    <span>
                                        <p>发票信息不全</p>
                                        <p>需补全明细</p>
                                    </span>
                                ) : (
                                    ""
                                )
                            }
                            overlayClassName="inv-tool-tip-warning">
                            <Icon
                                type="exclamation-circle"
                                className="inv-custom-warning-text warning-icon"
                            />
                        </Tooltip>
                    ) : (
                        <i style={{ width: 16, height: 16, display: "inline-block" }}></i>
                    )}
                    {text}
                </span>
            )
        } else if (
            type === "formatedDkyf" &&
            row.bdzt === "1" &&
            !row.formatedDkyf &&
            row.bdlyLx !== "1"
        ) {
            return ""
        } else if (type === "hjje" || type === "hjse" || type === "nf06") {
            return <span>{typeof text === "number" ? utils.number.format(text, 2) : text}</span>
        } else if (type === "fpztDm") {
            return row.fpztDm === "1" && row.hcfpbz === "Y" ? (
                "红冲"
            ) : row.fpztDm === "2" ? (
                <span className="inv-red-text-color">作废</span>
            ) : row.fpztDm === "3" ? (
                <span className="inv-red-text-color">异常</span>
            ) : row.fpztDm === "4" ? (
                <span className="inv-red-text-color">失控</span>
            ) : (
                "正常"
            )
        } else if (type === "fplyLx") {
            return row.fplyLx === "1"
                ? "读取"
                : row.fplyLx === "2"
                ? "录入"
                : row.fplyLx === "3"
                ? "导入"
                : row.fplyLx === "4"
                ? "远程提取"
                : "票税宝"
        } else if (type === "bdzt") {
            return row.bdzt === "0" ? "未认证" : "已认证"
        } else if (type === "showCheck") {
            return (
                <span>
                    {row.showCheckUrl && (
                        <span>
                            <a
                                href={row.showCheckUrl}
                                target="_blank"
                                style={{ display: "inlineBlock", marginLeft: "5px" }}>
                                查看
                            </a>
                        </span>
                    )}
                </span>
            )
        } else if (type === "bdlyLx") {
            if (row.bdlyLx === "1" || row.bdlyLx === "抵扣") return (row.bdlyLx = "抵扣")
            if (row.bdlyLx === "2" || row.bdlyLx === "退税") return (row.bdlyLx = "退税")
            if (row.bdlyLx === "3" || row.bdlyLx === "代办退税") return (row.bdlyLx = "代办退税")
            if (row.bdlyLx === "6" || row.bdlyLx === "不抵扣") return (row.bdlyLx = "不抵扣")
            if (row.bdlyLx === "10" || row.bdlyLx === "待抵扣") return (row.bdlyLx = "待抵扣")
        } else if (type === "bdjg") {
            if (row.bdjg === "0") return (row.bdjg = "正常")
            if (row.bdjg === "1") return (row.bdjg = "异常")
        } else if (type === "df05") {
            if (row.df05) return (row.df05 = row.df05.substring(0, 10))
        } else {
            return <span title={text}>{text}</span>
        }
    }
    getTableScroll = e => {
        try {
            let tableOption = this.metaAction.gf("data.tableOption").toJS()
            let appDom = document.getElementsByClassName("inv-app-batch-purchase-list")[0] //以app为检索范围
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
            this.getFooterAmountWidth()
            if (tbodyDom && tableWrapperDom && theadDom) {
                let num =
                    tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight
                const width = tableWrapperDom.offsetWidth
                const height = tableWrapperDom.offsetHeight
                const tbodyWidth = tbodyDom.offsetWidth

                if (num < 0) {
                    this.injections.reduce("setTableOption", {
                        ...tableOption,
                        x: tbodyWidth - width > 0 ? tbodyWidth : 1,
                        y:
                            tbodyWidth > width
                                ? height - theadDom.offsetHeight - 2
                                : height - theadDom.offsetHeight - 1,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce("setTableOption", {
                        ...tableOption,
                        x: tbodyWidth - width > 0 ? tbodyWidth : 1,
                    })
                }
            }
        } catch (err) {}
    }
    // 点击列设置里面的排序
    handleClickOrder(type) {
        const sort = this.metaAction.gf("data.sort").toJS()
        let order = sort.userOrderField === type ? sort.order : null
        let flag
        switch (order) {
            case "asc":
                flag = "desc"
                break
            case "desc":
                flag = null
                break
            default:
                flag = "asc"
                break
        }
        this.sortChange(type, flag)
    }
    renderColumns = () => {
        let arr = []
        const sort = this.metaAction.gf("data.sort").toJS()
        const columns = this.metaAction.gf("data.columns").toJS()
        let redFlag = false
        let { swVatTaxpayer } = this.component.props.qyId
            ? this.component.props
            : this.getAppParams()
        let skssq = this.metaAction.gf("data.skssq").format("YYYYMM")
        const filterForm = this.metaAction.gf("data.filterForm").toJS()
        const invCertificate = this.metaAction.gf("data.invCertificate")
        let { dkMonth } = filterForm
        swVatTaxpayer = "0" // 放开小规模显示效果
        // if (
        //     skssq !== dkMonth &&
        //     dkMonth !== "全部" &&
        //     swVatTaxpayer === "0" &&
        //     invCertificate === "1"
        // ) {
        //     redFlag = true
        // }
        columns.forEach((item, idx) => {
            if (item.isVisible) {
                if (item.sortTable) {
                    arr.push({
                        title: {
                            name: item.id,
                            component: "TableSort",
                            sortOrder: sort.userOrderField === item.id ? sort.order : null,
                            handleClick: e => {
                                this.sortChange(item.id, e)
                            },
                            title: item.caption,
                        },
                        width: item.width,
                        className: item.className,
                        key: item.id,
                        dataIndex: item.id,
                        align: item.align,
                        render: (text, record) => (
                            <span
                                className={
                                    record.hcfpbz === "Y"
                                        ? "inv-blue-text-color"
                                        : // : (swVatTaxpayer === "0" &&
                                          //       record.bdzt === "1" &&
                                          //       record.formatedSkssq !== record.formatedDkyf) ||
                                          //   redFlag ||
                                          //   record.bdlyLx === "10"
                                          // ? "inv-red-text-color"
                                          ""
                                }>
                                {this.renderColumnsDetail(text, record, item.id)}
                            </span>
                        ),
                    })
                } else if (item.setting) {
                    const showTableSetting = this.metaAction.gf("data.showTableSetting")
                    arr.push({
                        title: (
                            <div
                                className="mk-table-sort"
                                style={{ width: "100%", cursor: "pointer" }}
                                onClick={() => {
                                    this.handleClickOrder(item.id)
                                }}>
                                {item.caption}
                                <div className="icon" style={{ paddingRight: 42 }}>
                                    <span
                                        className={
                                            sort.userOrderField === item.id && sort.order === "asc"
                                                ? "active"
                                                : ""
                                        }>
                                        <i className="anticon mk-icon edficon edficon-shang" />
                                    </span>
                                    <span
                                        className={
                                            sort.userOrderField === item.id && sort.order === "desc"
                                                ? "active"
                                                : ""
                                        }>
                                        <i className="anticon mk-icon edficon edficon-xia" />
                                    </span>
                                </div>
                                <span
                                    className="inv-col-setting"
                                    onClick={e => this.showTableSetting({ value: true }, e)}>
                                    列设置
                                </span>
                            </div>
                        ),
                        width: item.width,
                        className: item.className,
                        key: item.id,
                        dataIndex: item.id,
                        align: item.align,
                        render: (text, record) => (
                            <span
                                className={
                                    record.hcfpbz === "Y"
                                        ? "inv-blue-text-color"
                                        : // : (swVatTaxpayer === "0" &&
                                          //       record.bdzt === "1" &&
                                          //       record.formatedSkssq !== record.formatedDkyf) ||
                                          //   redFlag
                                          // ? "inv-red-text-color"
                                          ""
                                }>
                                {this.renderColumnsDetail(text, record, item.id)}
                            </span>
                        ),
                    })
                } else {
                    arr.push({
                        title: item.caption,
                        width: item.width,
                        className: item.className,
                        key: item.id,
                        dataIndex: item.id,
                        align: item.align,
                    })
                }
            }
        })

        arr = arr.map((col, index) => ({
            ...col,
            onHeaderCell: column => ({
                width: column.width,
                onResize: this.handleResize(col.key),
            }),
        }))
        return arr
    }

    handleResize = key => (e, { size }) => {
        let { columns } = this.metaAction.gf("data").toJS()
        let cItem = columns.find(f => f.id === key)
        cItem.width = size.width
        this.metaAction.sf("data.columns", fromJS(columns))
    }
    // footer 合计宽度计算
    getFooterAmountWidth = () => {
        let pagination = document.getElementsByClassName("invoice-purchase-list-pagination")[0]
        let footer = document.getElementsByClassName("inv-batch-purchase-list-footer")[0]
        if (!pagination || !footer) {
            return {}
        } else {
            let width = footer.offsetWidth - pagination.offsetWidth - 90
            return {
                maxWidth: width + "px",
            }
        }
    }
    pageChanged = (current, pageSize) => {
        let { pagination, list } = this.metaAction.gf("data").toJS()
        const len = list.length
        if (pageSize) {
            pagination = {
                ...pagination,
                currentPage: len === 0 ? 1 : current,
                pageSize: pageSize,
            }
        } else {
            pagination = {
                ...pagination,
                currentPage: len === 0 ? 1 : current,
            }
        }
        this.metaAction.sf("data.pagination", fromJS(pagination))
        this.load()
    }
    // footer html
    renderFooterAmount = () => {
        const amountData = this.metaAction.gf("data.amountData").toJS()
        const invCertificate = this.metaAction.gf("data.invCertificate")
        const checkboxFlag = this.metaAction.gf("data.tableCheckbox.checkboxFlag")
        const currentOrg = this.metaAction.context.get("currentOrg")
        const { invoiceVersion } = currentOrg
        let swVatTaxpayer = this.getAppParams().swVatTaxpayer || this.component.props.swVatTaxpayer
        let amount = null
        let negativeAmount = null
        let taxAmount = null
        let negativeTaxAmount = null
        let effectiveTotalHjse = null // 有效税额
        let totalNf06 = null // 11月25日新加有效税额
        let effectiveNegativeTotalHjse = null //有效税额负数合计
        if (
            parseFloat(amountData.totalHjje) === 0 &&
            parseFloat(amountData.negativeTotalHjje) === 0
        ) {
            amount = (
                <span>
                    <span className="bold-text">0</span>
                </span>
            )
        } else if (parseFloat(amountData.totalHjje) !== 0) {
            amount = (
                <span>
                    <span className="bold-text">{amountData.totalHjje}</span>
                    <span className="unit-text"></span>
                </span>
            )
        }
        if (parseFloat(amountData.negativeTotalHjje) !== 0) {
            negativeAmount = (
                <span>
                    <span className="bold-text">{amountData.negativeTotalHjje}</span>
                </span>
            )
        }

        if (
            parseFloat(amountData.totalHjse) === 0 &&
            parseFloat(amountData.negativeTotalHjse) === 0
        ) {
            taxAmount = (
                <span>
                    <span className="bold-text">0</span>
                </span>
            )
        } else if (parseFloat(amountData.totalHjse) !== 0) {
            taxAmount = (
                <span>
                    <span className="bold-text">{amountData.totalHjse}</span>
                    <span className="unit-text"></span>
                </span>
            )
        }
        if (parseFloat(amountData.negativeTotalHjse) !== 0) {
            negativeTaxAmount = (
                <span>
                    <span className="bold-text">{amountData.negativeTotalHjse}</span>
                </span>
            )
        }

        if (
            parseFloat(amountData.effectiveTotalHjse) === 0 &&
            parseFloat(amountData.effectiveNegativeTotalHjse) === 0
        ) {
            effectiveTotalHjse = (
                <span>
                    <span className="bold-text">0</span>
                </span>
            )
        } else if (parseFloat(amountData.effectiveTotalHjse) !== 0) {
            effectiveTotalHjse = (
                <span>
                    <span className="bold-text">{amountData.effectiveTotalHjse}</span>
                    <span className="unit-text"></span>
                </span>
            )
        }
        if (parseFloat(amountData.totalNf06)) {
            totalNf06 = (
                <span>
                    <span className="bold-text">{amountData.totalNf06}</span>
                    <span className="unit-text"></span>
                </span>
            )
        }
        if (parseFloat(amountData.negativeTotalHjse) !== 0) {
            effectiveNegativeTotalHjse = (
                <span>
                    <span className="bold-text">{amountData.effectiveNegativeTotalHjse}</span>
                </span>
            )
        }
        let effectiveTotalHjseValue = effectiveTotalHjse ? (
            effectiveTotalHjse
        ) : (
            <span className="bold-text inv-number">0</span>
        )
        let totalNf06Value = totalNf06 ? totalNf06 : <span className="bold-text inv-number">0</span>
        let content = (
            <span className="footer-amount-item-span">
                <span className="count-item">合计</span>
                <span className="count-item">
                    共<span className="bold-text inv-number">{amountData.fpzs}</span>
                    张发票
                </span>
                <span className="count-item">
                    金额：
                    {amount ? amount : <span className="bold-text inv-number">0</span>}
                </span>
                <span className="count-item">
                    税额：
                    {taxAmount ? taxAmount : <span className="bold-text inv-number">0</span>}
                </span>
                {invCertificate !== "0" && swVatTaxpayer === "0" && (
                    <span className="count-item">
                        有效税额：
                        {checkboxFlag === 1 ? effectiveTotalHjseValue : totalNf06Value}
                    </span>
                )}
                {/*负数行*/}
                {(negativeAmount || negativeTaxAmount) && (
                    <span className="count-item">
                        {" "}
                        其中：
                        <span>
                            {" "}
                            金额：
                            {negativeAmount ? (
                                negativeAmount
                            ) : (
                                <span className="bold-text inv-number">0</span>
                            )}
                        </span>
                        <span>
                            {" "}
                            &nbsp;&nbsp;&nbsp; 税额：
                            {negativeTaxAmount ? (
                                negativeTaxAmount
                            ) : (
                                <span className="bold-text inv-number">0</span>
                            )}
                        </span>
                        {invCertificate !== "0" && swVatTaxpayer === "0" && (
                            <span className="count-item">
                                &nbsp;&nbsp;&nbsp; 有效税额：
                                {effectiveNegativeTotalHjse ? (
                                    effectiveNegativeTotalHjse
                                ) : (
                                    <span className="bold-text inv-number">0</span>
                                )}
                            </span>
                        )}
                    </span>
                )}
            </span>
        )
        return (
            <Tooltip
                placement="topLeft"
                title={() => {
                    return <div className="footer-amount">{content}</div>
                }}
                overlayClassName="inv-tool-tip-normal tool-tip-footer-amount">
                <div className="footer-amount" style={this.getFooterAmountWidth()}>
                    {content}
                </div>
            </Tooltip>
        )
    }
    renderFooterPagination = total => {
        return (
            <span>
                共<span style={{ fontWeight: "bold" }}>{total}</span>条记录
            </span>
        )
    }
    rowSelection = () => {}
    // 申报用途与抵扣月份联动
    sbytSelection = v => {
        if (v !== "1") {
            this.metaAction.sf("data.dkMonthDsib", true)
        } else if (v === "1") {
            this.metaAction.sf("data.dkMonthDsib", false)
        }
        this.metaAction.sf("data.formContent.bdlyLx", v)
    }
    // 导入
    import = async () => {
        let importType = this.metaAction.gf("data.importType")
        let swVatTaxpayer = this.getAppParams().swVatTaxpayer || this.component.props.swVatTaxpayer
        const currentOrg = this.metaAction.context.get("currentOrg")
        const { invoiceVersion, id } = currentOrg
        const skssq = this.metaAction.gf("data.skssq").format("YYYYMM")
        const ret = await this.metaAction.modal("show", {
            title: "进项导入",
            style: { top: 25 },
            width: 580,
            okText: "选择",
            footer: false,
            bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
            children: (
                <ImportInvoice
                    store={this.component.props.store}
                    importType={importType}
                    swVatTaxpayer={swVatTaxpayer}
                    invoiceVersion={invoiceVersion}
                    metaAction={this.metaAction}
                    nsrsbh={currentOrg.vatTaxpayerNum}
                    skssq={skssq}
                    fplx={"jxfp"}
                    webapi={this.webapi}
                    qyId={id}
                    load={this.load}></ImportInvoice>
            ),
        })
        if (ret) {
            this.load()
        }
    }
}
export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
