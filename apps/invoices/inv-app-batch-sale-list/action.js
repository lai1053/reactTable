import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import { fromJS } from "immutable"
import config from "./config"
import { message, Button, Icon, Tooltip } from "antd"
import { Menu } from "antd"
import utils from "edf-utils"
import moment from "moment"
import { btnType } from "./fixedData"
import ImportInvoice from "../component/ImportInvoice"
import NewImportInvoice from "../component/NewImportInvoice"
import QRCode from "../inv-app-riskControl/qrcode"
const { SubMenu } = Menu
const sortOrder = {
    fpzlMc: "fpzl_for_sort",
    formatedKprq: "kprq_for_sort",
    fpdm: "fpdm",
    fphm: "fphm",
    formatedDkyf: "dkyf",
    hjje: "hjje",
    formatedZbslv: "zbslv_for_sort",
    hjse: "hjse",
    gfmc: "gfmc",
    fpztDm: "fpzt_for_sort ",
    bdzt: "bdzt",
    fplyLx: "fply_for_sort",
    skssq: "skssq",
    showDzfp: "showDzfp",
    showCheck: "showCheck",
    df05: "df05",
}
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
        let { swVatTaxpayer, nsqj, qyId, userDetail } = this.component.props.qyId
            ? this.component.props
            : this.getAppParams()
        const { invoiceVersion, xdzOrgIsStop } = this.metaAction.context.get("currentOrg") || {}
        if (swVatTaxpayer == undefined || !nsqj || !qyId) {
            this.metaAction.toast("error", "进入方式不对")
            return
        }
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        this.metaAction.sfs({
            "data.btnType": fromJS(this.getBtnTypeByAuth(xdzOrgIsStop, userDetail)),
            "data.userDetail": userDetail,
            "data.xdzOrgIsStop": xdzOrgIsStop,
            "data.skssq": moment(`${nsqj}01`).subtract(1, "month"),
            "data.nsqj": moment(`${nsqj}01`, "YYYYMM"),
            "data.sort": fromJS({
                userOrderField: "",
                order: "",
            }),
            "data.inputVal": "",
            "data.filterForm": this.metaAction.gf("data.filterFormOld"),
            "data.pagination": fromJS(pagination),
            "data.helpTooltip":
                invoiceVersion === 2
                    ? "可以读取税务发票、远程提取发票和票税宝上传发票"
                    : "可以读取税务发票、远程提取发票和票税宝上传发票，并对导入发票补全明细",
        })
        this.getColumns()
        this.load()
        this.getFpzlcsList()
        this.getSlvcsList()
    }
    // 获取列表数据
    load = async () => {
        let loading = this.metaAction.gf("data.loading")
        let { swVatTaxpayer, qyId, xgmJbOrYb } = this.component.props.qyId
            ? this.component.props
            : this.getAppParams()
        if (!loading) {
            this.injections.reduce("tableLoading", true)
        }
        const gfmc = this.metaAction.gf("data.inputVal")
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
            customCode,
            taxRate,
            strDate,
            statusValue,
            endDate,
            goodsType,
            taxFlag,
            isDzfp,
            uploadStarDate,
            uploadEndDate,
            scopeType,
            showCheck,
        } = filterForm
        if (showCheck === "全部") showCheck = null

        if (isDzfp === "全部") isDzfp = ""
        let status = {
            normal: "0", //正常（"1"：选中；"0"或者null：没有选中）
            hcfp: "0",
            cancelled: "0",
        }
        statusValue.forEach(i => {
            status[i] = "1"
        })
        const params = {
            entity: {
                qyId: qyId,
                skssq: skssq,
                gfmc,
                fpzlDm: invType,
                fpdm: invCode,
                fphm: invNumber,
                fpztDmValues: status,
                gfsbh: customCode,
                zbslv: taxRate,
                showCheck,
                xgmJbOrYb: swVatTaxpayer === "0" ? null : xgmJbOrYb,
                isDzfp: isDzfp,
            },
            //xgmJbOrYb: swVatTaxpayer === "0" ? null : xgmJbOrYb,
            kprqq: strDate,
            kprqz: endDate,
            uploadStarDate,
            uploadEndDate,
            jzjtType: taxFlag,
            hwlxType: goodsType === "-0001" ? null : goodsType,
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

        let resp = await this.webapi.invoice.queryXxfpPageList(params)
        if (!this.mounted) return
        this.injections.reduce("tableLoading", false)
        if (resp) {
            this.metaAction.sfs({
                "data.list": fromJS([]),
                "data.tableCheckbox": fromJS({
                    checkboxValue: [],
                    selectedOption: [],
                }),
            })
            this.injections.reduce("load", resp)
            setTimeout(() => {
                this.onResize()
            }, 50)
        }
    }
    // 获取当前表头数据
    getColumns = async () => {
        const pageID = "saleInvoice"
        const resp = await this.webapi.invoice.queryColumnVo({
            pageID,
        })
        if (!this.mounted) return
        const columns = this.metaAction.gf("data.columnData").toJS()
        if (resp) {
            const data = JSON.parse(resp.columnjson)
            let a = data.filter(item => item === "showDzfp")
            if (Array.isArray(a) && a.length !== 0) {
                this.resetTableSetting() // 防止历史数据不出现列设置
            }
            columns.forEach(item => {
                const idx = data.indexOf(item.id)
                item.isVisible = idx !== -1
            })
        }
        this.metaAction.sf("data.columns", fromJS(columns))
    }
    // 获取发票类型
    getFpzlcsList = async () => {
        let swVatTaxpayer = this.getAppParams().swVatTaxpayer || this.component.props.swVatTaxpayer
        const resp = await this.webapi.invoice.getFpzlcsList({
            nsrxz: swVatTaxpayer === "0" ? "YBNSRZZS" : "XGMZZS",
            fplx: "xxfp",
        })
        if (!this.mounted) return
        if (resp) {
            const arr = [
                {
                    fplx: "xxfp",
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
            fplx: "xxfp",
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
        /*  console.log(e, strTime);*/
        this.injections.reduce("tableLoading", true)
        //this.metaAction.sf("data.nsqj", e);
        //this.metaAction.sf("data.skssq", moment(e).subtract(1, "month"));
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        //this.metaAction.sf("data.pagination", fromJS(pagination));
        this.metaAction.sfs({
            "data.nsqj": e,
            "data.skssq": moment(e).subtract(1, "month"),
            "data.pagination": fromJS(pagination),
        })
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
        // 停用客户，只有查看权限
        if (xdzOrgIsStop) return true
        let readOnly = false
        if (this.isTestMode()) {
            // 权限控制，是否查看，客户模块提供接口后，加上接口获取
            readOnly = userDetail === 2 ? true : false
        }
        return readOnly
    }
    // 双击某张发票
    doubleClick = record => {
        return {
            onDoubleClick: async () => {
                let type = record
                type.name = record.fpzlMc
                if (record && !record.fpzlDm) {
                    message.warning(`${record.fpzlMc || "未知类型发票"}  不能修改`)
                    return
                }
                if (!record.kjxh) {
                    this.metaAction.toast("error", "这张发票无效，不允许修改内容")
                    return
                }
                if (!record.fplyLx) {
                    this.metaAction.toast("error", "这张发票来源不是读取或录入，不允许修改内容")
                    return
                }
                const more =
                    this.metaAction
                        .gf("data.more")
                        .toJS()
                        .find(f => f.type == "addInvoice") || {}
                let { fpzlDm, kjxh, fpdm, fphm } = record
                let item = more.subItem.find(ff => ff.fpzl == fpzlDm)
                let readOnly = this.getActionRule(record)
                let nsqj = this.metaAction.gf("data.nsqj")
                let skssq = moment(nsqj).subtract(1)
                let invArguments = {
                    fpzlDm,
                    fpdm,
                    fphm,
                }
                const height = document.body.clientHeight - 40 || 700
                let width = document.body.clientWidth - 50 || 1000
                if (width > 1920) width = 1920
                let option = {
                    title:
                        (item.title && item.title.replace("新增", readOnly ? "查看" : "修改")) ||
                        "弹窗",
                    className: item.type + "-modal",
                    width,
                    height,
                    //footer:type.fpzl == '01' ||  type.fpzl=='10' || type.fpzl=='04' ? null: undefined,
                    style: { top: 5 },
                    okText: "保存",
                    // footer: null,
                    bodyStyle: { padding: "0px" },
                    children: this.metaAction.loadApp(item.type, {
                        store: this.component.props.store,
                        data: {
                            ...this.getAppParams(),
                        },
                        kjxh,
                        nsqj: skssq,
                        readOnly, // 只允许查看
                        xdzOrgIsStop: this.metaAction.gf("data.xdzOrgIsStop"),
                        fplx: "xxfp",
                        fpzlDm: fpzlDm,
                        fpName: type.name,
                        sf01: type.sf01,
                        // justShow: true, // 启用invArguments参数查看
                        //invArguments
                        // callback: this.load,
                    }),
                }

                option.footer = null
                const res = await this.metaAction.modal("show", option)
                if (res && res.needReload) {
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
    // 头部按钮，更多 点击触发时间入口
    judgeIsChoseBill = async type => {
        const needWarning = ["editInvoice", "deleteInvoice", "batchEditInvoice"]
        const { dljgId, userId } = this.metaAction.gf("data").toJS()
        let { swVatTaxpayer, qyId, xgmJbOrYb } = this.component.props.qyId
            ? this.component.props
            : this.getAppParams()
        const pagination = this.metaAction.gf("data.pagination").toJS()
        const sort = this.metaAction.gf("data.sort").toJS()
        const { checkboxValue } = this.metaAction.gf("data.tableCheckbox").toJS()
        const describe = {
            editInvoice: "请先选择需要修改的发票",
            deleteInvoice: "请先选择需要删除的发票",
            batchEditInvoice: "请先选择需要修改的发票",
            "inv-app-sales-export-card": "当前没有可导出的发票数据",
        }
        if (type.key === "import") {
            this.Import()
            return
        }
        if (needWarning.indexOf(type.key) > -1 && checkboxValue && checkboxValue.length === 0) {
            message.warning(describe[type.key])
            return
        }
        if (
            type.key === "inv-app-sales-export-card" &&
            this.metaAction.gf("data.amountData.normalFpzs") <= 0
        ) {
            message.warning(describe[type.key])
            return
        }
        // console.log('judgeIsChoseBill:', type);
        if (type.key) {
            if (type.item && type.item.props) {
                type.title = type.item.props.title
                type.fpzl = type.item.props.fpzl
                type.type = type.item.props.type
                type.name = type.item.props.name
            }

            if (
                type.key === "deleteInvoice" ||
                type.key === "editInvoice" ||
                type.key === "batchEditInvoice" ||
                type.key === "psbbupiao" ||
                type.key === "printprintInvoices"
            ) {
                this[type.key](type)
                return
            }
            const height = document.body.clientHeight - 40 || 700
            let width = document.body.clientWidth - 50 || 1000
            if (width > 1920) width = 1920

            const gfmc = this.metaAction.gf("data.inputVal")
            let nsqj = this.metaAction.gf("data.nsqj")
            let skssq = moment(nsqj).subtract(1)
            let obj = {
                title: type.title || "弹窗",
                className: type.key + "-modal",
                width: width,
                height: height,
                style: { top: 25 },
                okText:
                    type.key === "inv-app-sales-export-card" ||
                    type.key === "inv-app-sales-collect-card"
                        ? "确定"
                        : "保存",
                // footer: null,
                bodyStyle: { padding: "0px" },
                children: this.metaAction.loadApp(
                    type.key === "inv-app-sales-export-card"
                        ? "inv-app-sales-export-card"
                        : type.key === "inv-app-sales-collect-card"
                        ? "inv-app-sales-collect-card"
                        : "inv-app-new-invoices-card",
                    {
                        store: this.component.props.store,
                        data: {
                            ...this.getAppParams(),
                        },
                        filterForm:
                            type.key == "inv-app-sales-export-card"
                                ? {
                                      ...this.metaAction.gf("data.filterForm").toJS(),
                                      gfmc,
                                      swVatTaxpayer,
                                      qyId,
                                      xgmJbOrYb,
                                      pagination,
                                      sort,
                                      sortOrder,
                                      dljgId,
                                      userId,
                                  }
                                : null,
                        // callback: this.load,
                        nsqj: skssq,
                        kjxh: null,
                        fplx: "xxfp",
                        fpzlDm: type.fpzl,
                        fpName: type.name,
                        sf01: type.sf01, // 专票或者普票
                    }
                ),
            }

            if (
                type.key != "inv-app-sales-export-card" &&
                type.key != "inv-app-sales-collect-card"
            ) {
                obj.footer = null
            }
            const modalResult = await this.metaAction.modal("show", obj)

            if (modalResult && modalResult.needReload) {
                this.load()
            }
        }
    }
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
                        <div style={{ alignItems: "center", textAlign: "center", padding: "18px" }}>
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
                        <div style={{ padding: "18px" }}>
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
            this.injections.reduce("tableLoading", true)
            const data = {
                fplx: "xxfp",
                kjxhList: checkboxValue,
            }
            const res = await this.webapi.invoice.openInvoicePrintInvoices(data)
            let isContinue = false
            if (res) {
                this.injections.reduce("tableLoading", false)
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
                            {/*    <h3 style={{paddingBottom:'10px'}}>电子发票打印</h3>*/}
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
    deleteInvoice = async () => {
        const { checkboxValue } = this.metaAction.gf("data.tableCheckbox").toJS()
        const confirm = await this.metaAction.modal("confirm", {
            content: `确定要删除勾选的发票？`,
            width: 340,
        })
        if (confirm) {
            const { qyId } = this.getAppParams() || {}
            let currentOrg = this.metaAction.context.get("currentOrg") || {},
                periodDate = currentOrg.periodDate || moment().format("YYYYMM"),
                skssq = moment(periodDate).subtract(1, "month").format("YYYYMMDD"),
                nsrsbh = currentOrg.vatTaxpayerNum
            skssq = skssq.substring(0, 6)
            const res = await this.webapi.invoice.deleteXxfp({
                qyId: qyId || "1", // 企业Id
                nsrsbh,
                skssq,
                kjxhList: checkboxValue,
            })
            if (res == null) {
                this.metaAction.toast("success", "删除成功")
                this.load()
            }
        }
    }
    editInvoice = async () => {
        const { selectedOption } = this.metaAction.gf("data.tableCheckbox").toJS()
        if (selectedOption.length > 1) {
            this.metaAction.toast("error", "请选择单张要修改的发票！")
            return
        }
        if (selectedOption[0] && !selectedOption[0].fpzlDm) {
            message.warning(`${selectedOption[0].fpzlMc || "未知类型发票"}  不能修改`)
            return
        }
        if (!selectedOption[0].kjxh) {
            this.metaAction.toast("error", "这张发票无效，不允许修改内容")
            return
        }
        if (!selectedOption[0].fplyLx) {
            this.metaAction.toast("error", "这张发票来源不是读取或录入，不允许修改内容")
            return
        }
        const more =
                this.metaAction
                    .gf("data.more")
                    .toJS()
                    .find(f => f.type == "addInvoice") || {},
            fpzlDm = selectedOption[0].fpzlDm,
            item = more.subItem.find(ff => ff.fpzl == fpzlDm)
        // console.log('editInvoice:', item)
        let nsqj = this.metaAction.gf("data.nsqj")
        let skssq = moment(nsqj).subtract(1)
        const height = document.body.clientHeight - 40 || 700
        let width = document.body.clientWidth - 50 || 1000
        if (width > 1920) width = 1920
        const res = await this.metaAction.modal("show", {
            title: (item.title && item.title.replace("新增", "修改")) || "弹窗",
            className: item.type + "-modal",
            width: width,
            height,
            style: { top: 25 },
            okText: "保存",
            footer: null,
            bodyStyle: { padding: "0px" },
            children: this.metaAction.loadApp(item.type, {
                store: this.component.props.store,
                data: {
                    ...this.getAppParams(),
                },
                nsqj: skssq,
                kjxh: selectedOption[0].kjxh,
                fplx: "xxfp",
                fpzlDm: fpzlDm,
                fpName: item.name,
                sf01: item.sf01, // 专票或者普票
                // callback: this.load,
            }),
        })
        if (res && res.needReload) {
            this.load()
        }
    }
    batchEditInvoice = async () => {
        let skssq = this.metaAction.gf("data.skssq").format("YYYYMMDD")
        skssq = skssq.substring(0, 6)
        const { checkboxValue, selectedOption } = this.metaAction.gf("data.tableCheckbox").toJS()
        const res = await this.metaAction.modal("show", {
            title: "销项发票批量修改",
            className: "inv-app-sales-batch-update-card-modal",
            width: 500,
            top: 25,
            okText: "确定",
            // footer: null,
            bodyStyle: { padding: "30px" },
            children: this.metaAction.loadApp("inv-app-sales-batch-update-card", {
                store: this.component.props.store,
                data: {
                    ...this.getAppParams(),
                },
                items: selectedOption || [],
                kjxhList: checkboxValue || [],
                // callback: this.load,
                nsqj: skssq,
            }),
        })
        if (res && res.needReload) {
            this.load()
        }
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
        this.metaAction.sfs({
            "data.filterForm": fromJS(formContent),
            "data.showPopoverCard": false,
        })
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        this.metaAction.sf("data.pagination", fromJS(pagination))
        this.load()
    }
    handlePopoverVisibleChange = visible => {
        if (visible) {
            const { filterForm } = this.metaAction.gf("data").toJS()
            this.metaAction.sf("data.formContent", fromJS(filterForm))
        }
        this.metaAction.sf("data.showPopoverCard", visible)
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
    // 保存列设置
    upDateTableSetting = async ({ value, data }) => {
        const columns = []
        const pageID = "saleInvoice"
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
    //关闭栏目设置
    closeTableSetting = () => {
        this.injections.reduce("tableSettingVisible", { value: false })
    }
    // 重置列
    resetTableSetting = async () => {
        const pageID = "saleInvoice"
        let res = await this.webapi.invoice.deleteColumn({ pageID })
        if (res) {
            this.injections.reduce("update", {
                path: "data.showTableSetting",
                value: false,
            })
            this.getColumns()
        }
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
    handlePanelChange = (value, mode) => {
        mode = [mode[0] === "date" ? "month" : mode[0], mode[1] === "date" ? "month" : mode[1]]
        this.metaAction.sf("data.mode", mode)
    }
    // 渲染表格里的列明细html
    renderColumnsDetail = (text, row, type) => {
        if (type === "fpzlMc") {
            return (
                <span className="inv-warn-icon-end" title={text}>
                    {text}
                    {row.showDzfp === "Y" ? <div className="inv-warn-icon-end-dian"></div> : ""}
                </span>
            )
        } else if (type === "fphm") {
            return (
                <span>
                    {row.fpxxDm === "Y" ? (
                        <Tooltip
                            arrowPointAtCenter={true}
                            placement="top"
                            title="发票信息不全"
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
        } else if (type === "hjje" || type === "hjse") {
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
            return row.fplyLx === "1" ? "读取" : row.fplyLx === "2" ? "录入" : "导入"
        } else if (type === "showDzfp") {
            return (
                <span>
                    {row.showDzfp === "Y" ? "是" : ""}
                    {row.showCheckUrl && (
                        <span>
                            <a
                                href={row.showCheck}
                                target="view_window"
                                style={{ display: "inlineBlock", marginLeft: "5px" }}>
                                查看
                            </a>
                        </span>
                    )}
                </span>
            )
        } else if (type === "showCheck") {
            if (row.showCheckUrl) {
                return (row.showCheck = (
                    <span>
                        <a href={row.showCheckUrl} target="view_window">
                            查看
                        </a>{" "}
                    </span>
                ))
            }
        } else {
            return <span title={text}>{text}</span>
        }
    }
    renderColumns = () => {
        let arr = []
        const sort = this.metaAction.gf("data.sort").toJS()
        const column = this.metaAction.gf("data.columns").toJS()
        column.forEach(item => {
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
                            <span className={record.hcfpbz === "Y" ? "inv-blue-text-color" : ""}>
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
                                onClick={() => {
                                    this.handleClickOrder(item.id)
                                }}
                                style={{ width: "100%", cursor: "pointer" }}>
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
                            <span className={record.hcfpbz === "Y" ? "inv-blue-text-color" : ""}>
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
    // 头部更多 html
    renderMore = () => {
        let more = this.metaAction.gf("data.more").toJS()
        const userDetail = this.metaAction.gf("data.userDetail")
        const xdzOrgIsStop = this.metaAction.gf("data.xdzOrgIsStop")
        if (xdzOrgIsStop) {
            // 停用客户，只有导出按钮
            more = more.filter(f => f.type === "inv-app-sales-export-card")
        }
        let swVatTaxpayer = this.getAppParams().swVatTaxpayer || this.component.props.swVatTaxpayer
        return more.map(item => {
            return item.hasSub ? (
                <SubMenu key={item.type} title={item.name} className="sale-invoice-sub-menu">
                    {item.subItem.map(sub => {
                        return (swVatTaxpayer === "1" && sub.belong === "general") ||
                            (swVatTaxpayer === "0" && sub.fpzl === "10") ? null : (
                            <Menu.Item
                                {...sub}
                                key={sub.name}
                                disabled={
                                    item.isDisabled !== true && userDetail === 2 ? true : false
                                }>
                                {sub.name}
                            </Menu.Item>
                        )
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
    onResize = e => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        }, 200)
    }
    // footer 合计宽度计算
    getFooterAmountWidth = () => {
        let pagination = document.getElementsByClassName("invoice-sale-list-pagination")[0]
        let footer = document.getElementsByClassName("inv-batch-sale-list-footer")[0]
        if (!pagination || !footer) {
            return {}
        } else {
            let width = footer.offsetWidth - pagination.offsetWidth - 90
            return {
                maxWidth: width + "px",
            }
        }
    }
    // footer html
    renderFooterAmount = () => {
        const amountData = this.metaAction.gf("data.amountData").toJS()
        const showFooterToolTip = this.metaAction.gf("data.showFooterToolTip")
        let amount = null
        let negativeAmount = null
        let taxAmount = null
        let negativeTaxAmount = null
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
        let content = (
            <span>
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
                {(negativeAmount || negativeTaxAmount) && (
                    <span className="count-item">
                        其中：
                        <span>
                            &nbsp;&nbsp;金额：
                            {negativeAmount ? (
                                negativeAmount
                            ) : (
                                <span className="bold-text inv-number">0</span>
                            )}
                        </span>{" "}
                        <span>
                            &nbsp;&nbsp;税额：
                            {negativeTaxAmount ? (
                                negativeTaxAmount
                            ) : (
                                <span className="bold-text inv-number">0</span>
                            )}
                        </span>
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
    getTableScroll = e => {
        try {
            let tableOption = this.metaAction.gf("data.tableOption").toJS()
            let appDom = document.getElementsByClassName("inv-app-batch-sale-list")[0] //以app为检索范围
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
                        y: height - theadDom.offsetHeight - 1,
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
    rowSelection = () => {}
    // 导入
    Import = async () => {
        let swVatTaxpayer = this.getAppParams().swVatTaxpayer || this.component.props.swVatTaxpayer
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        let { invoiceVersion, id, esOrgId, vatTaxpayerNum } = currentOrg
        let skssq = this.metaAction.gf("data.skssq").format("YYYYMM")
        let res = this.metaAction.modal("show", {
            title: "销项导入",
            //className: "inv-app-batch-purchase-list-import-modal",
            style: { top: 25 },
            //footer: null,
            okText: "导入",
            // bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
            children: (
                // <ImportInvoice
                //     store={this.component.props.store}
                //     swVatTaxpayer={swVatTaxpayer}
                //     invoiceVersion={invoiceVersion}
                //     metaAction={this.metaAction}
                //     nsrsbh={currentOrg.vatTaxpayerNum}
                //     skssq={skssq}
                //     fplx={"xxfp"}
                //     qyId={id}
                //     webapi={this.webapi}
                //     load={this.load}
                // >
                // </ImportInvoice>
                <NewImportInvoice
                    store={this.component.props.store}
                    swVatTaxpayer={swVatTaxpayer}
                    invoiceVersion={invoiceVersion}
                    metaAction={this.metaAction}
                    nsrsbh={currentOrg.vatTaxpayerNum}
                    skssq={skssq}
                    fplx={"xxfp"}
                    qyId={id}
                    webapi={this.webapi}
                    load={this.load}></NewImportInvoice>
            ),
        })
    }
    // loding开关
    loadingSW = sw => {
        this.injections.reduce("tableLoading", sw)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
