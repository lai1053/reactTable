import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
import moment from "moment"
import QRCode from "./qrcode"
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
        window.addEventListener("click", e => {
            if (e.target.id !== "10086111") {
                this.metaAction.sf("data.rendeQQ", 2)
            }
            if (e.target.id === "10085") {
                this.fenxiang()
            }
        })
    }

    btnClick = () => {
        this.injections.reduce("modifyContent")
    }
    // 初始化页面
    initPage = async e => {
        this.metaAction.sf("data.loading", true)
        let { swVatTaxpayer, appId, xdzOrgIsStop } = this.metaAction.context.get("currentOrg")
        let currentMenu = this.metaAction.context.get("currentMenu")
        let menuAuth = "200"
        if (appId === 114) {
            currentMenu &&
                currentMenu.forEach(item => {
                    if (item.name == "发票风控" && item.appName == "inv-app-riskControl") {
                        menuAuth = item.menuAuth
                    }
                })
        }
        if (xdzOrgIsStop) menuAuth = "200"
        let periodDate =
            moment(e).subtract(1, "month").format("YYYYMM") ||
            moment().subtract(1, "month").format("YYYYMM")
        let data = {
            skssq: periodDate,
            nsrxz: swVatTaxpayer === 2000010002 ? "XGMZZS" : "YBNSRZZS",
        }
        periodDate = moment(e).subtract(0, "month").format("YYYYMM")
        let res = await this.webapi.invoice.queryInvoicePhysicalExamination(data)
        this.metaAction.sf("data.loading", false)
        if (res) {
            let sfsJson = {}
            if (res.wdbgUrl) {
                // 有值则代表已经体检过
                sfsJson = {
                    "data.isTijian": 2,
                    "data.swfxLog": res.swfxLog,
                    "data.swtjUrl": res.swfxLog.swtjUrl,
                    "data.bgid": res.swfxLog.bgid,
                    "data.wdbgUrl": res.wdbgUrl,
                    "data.fxbgUrl": res.fxbgUrl,
                }
            } else {
                sfsJson = {
                    "data.isTijian": 1,
                }
            }
            this.metaAction.sfs({
                ...sfsJson,
                "data.menuAuth": menuAuth,
                "data.dljgId": res.dljgId,
                "data.qyid": res.qyid,
                "data.date": moment(`${periodDate}01`, "YYYYMM"),
                "data.jxfpData": res.jxfpData,
                "data.xxfpData": res.xxfpData,
                "data.fxbgUrl": res.fxbgUrl,
            })
        }
    }
    // 切换报税月份
    handleMonthPickerChange = (e, strTime) => {
        this.metaAction.sf("data.date", e)
        this.initPage(e)
    }
    // 体检超时提醒
    resTimeoutFun = time => {
        this.timer && clearTimeout(this.timer)
        // 连接超时提示
        this.timer = setTimeout(async () => {
            this.metaAction.sf("data.loading", false)
            let response = this.metaAction.gf("data.isCaoshi")
            if (response === true) {
                let resp = await this.metaAction.modal("warning", {
                    className: "inv-batch-custom-info-modal",
                    okText: "确定",
                    content: (
                        <div>
                            {" "}
                            <p>检测发现，您缺少体检所需期间的发票，系统</p>{" "}
                            <p>正在自动提取。请稍后再进行体检。</p>{" "}
                        </div>
                    ),
                })
            }
        }, time)
    }

    // 开始检查
    check = async () => {
        let tFlag = false
        // 先进行前端检查 true 开始体检 fals 跳转采集
        let jxfpData = this.metaAction.gf("data.jxfpData")
        let xxfpData = this.metaAction.gf("data.xxfpData")
        if (jxfpData == undefined || xxfpData == undefined) {
            tFlag = true
        }
        if (tFlag) {
            this.initPage()
            this.goutuFenkonhg()
        } else {
            // 使用发票采集接口采集发票
            this.metaAction.sf("data.loading", true)
            let xxres = await this.webapi.invoice.fpxxCollection(xxfpData)
            let jxres = await this.webapi.invoice.fpxxCollection(jxfpData)
            this.resTimeoutFun(60 * 1000)
            if (jxres !== undefined && xxres !== undefined) {
                // 采集成功进行体检
                this.metaAction.sf("data.isCaoshi", false)
                this.goutuFenkonhg()
                this.metaAction.sf("data.loading", false)
                this.initPage()
            } else {
                this.metaAction.modal("confirm", {
                    title: "",
                    width: "458px",
                    okText: "跳转发票采集",
                    onOk: () => {
                        this.gotuCaiji()
                    },
                    content: (
                        <div>
                            {" "}
                            <p> 自动提取发票失败，需要您前往【发票采集】</p> <p>模块自行提取发票</p>
                        </div>
                    ),
                })
                this.metaAction.sf("data.isCaoshi", false)
            }
        }
    }
    // 跳转发票采集
    gotuCaiji = async () => {
        this.component.props.setPortalContent("发票", "inv-app-single-custom-list")
    }
    // 跳转到风控页面
    goutuFenkonhg = async () => {
        let { swVatTaxpayer } = this.metaAction.context.get("currentOrg")
        let data = {
            skssq: moment(this.metaAction.gf("data.date")).subtract(1, "month").format("YYYYMM"),
            nsrxz: swVatTaxpayer === 2000010002 ? "XGMZZS" : "YBNSRZZS",
        }
        let res = await this.webapi.invoice.postInvoicePhysicalExamination(data)
        const url = res.swtjUrl
        let qyId = (this.metaAction.context.get("currentOrg") || {}).id
        let ishttps = "https:" == document.location.protocol ? true : false
        let urlData = { key: "startCheck", url: res.swtjUrl, encryptedData: res.swfxData }
        this.initPage()
        await this.component.props.setPortalContent("体检", "inv-app-riskControl-warp", {
            urlData,
        })
    }

    // 体检标语
    rendertis = () => {
        let isTijian = this.metaAction.gf("data.isTijian")
        let date = this.metaAction.gf("data.date")
        date = moment(date).subtract(0, "month").format("YYYYMM")
        let a = date.substring(0, 4)
        let b = parseInt(date.substring(4, 6))
        if (isTijian === 1) {
            return (
                <span>
                    {" "}
                    <span className="body-ti">温馨提示：</span>{" "}
                    <span>
                        发票体检，需要{a}年{b}月前连续4个月完整的销项发票和进项发票
                    </span>
                </span>
            )
        } else {
            return (
                <span>
                    {" "}
                    <div className="inv-app-riskControl-chenggong-icn" />{" "}
                    <span>您已经完成扫描</span>
                </span>
            )
        }
    }
    // 体检报告
    report = () => {
        let wdbgUrl = this.metaAction.gf("data.wdbgUrl"),
            bgid = this.metaAction.gf("data.bgid"),
            qyId = (this.metaAction.context.get("currentOrg") || {}).id
        if (wdbgUrl !== undefined) {
            let urlData = {
                key: "checkReport",
                url: wdbgUrl,
                encryptedData: "",
            }
            this.component.props.setPortalContent("体检报告", "inv-app-riskControl-warp", {
                urlData,
            })
        } else {
            this.metaAction.toast("error", "请重新体检")
        }
        this.initPage()
    }
    // 分享
    fenxiang = async () => {
        let url = await this.metaAction.gf("data.fxbgUrl")
        if (url === "" || url === undefined) {
            this.metaAction.toast("error", "请先进行体检")
        } else {
            let rendeFalg = this.metaAction.gf("data.data.rendeQQ")
            if (rendeFalg === 1) {
                return
            } else {
                this.metaAction.sf("data.rendeQQ", 1)
                let qr = new QRCode(document.getElementById("erweimaImg"), {
                    width: 128,
                    height: 128,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                })
                //let Qurl =  `${location.origin}/share-oss${url}`  // 金财管家方案
                qr.makeCode(url)
            }
        }
    }
    // 渲染QQ
    rendeqq = () => {
        return (
            <div className="inv-app-riskControl-erweima" id="10086111">
                <div className="erweima-one">请使用微信或者QQ“扫一扫”</div>
                <div className="erweima-two">将网页分享给好友</div>
                <div className="erweima-img" id="erweimaImg">
                    {" "}
                </div>
            </div>
        )
    }
    componentWillUnmount = () => {
        clearTimeout(this.timer)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
