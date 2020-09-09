import React, { PureComponent } from "react"
import { action as MetaAction, AppLoader } from "edf-meta-engine"
import { Input, Tooltip, DatePicker, Button, Select, message } from "antd"
import config from "./config"
import { fromJS } from "immutable"
import moment from "moment"
import utils from "edf-utils"
import GroupInfo from "./invoiceComs/groupInfo"
import CommonInfo from "./invoiceComs/commonInfo"
import EditableCellTable from "../components/EditableCellTable"
import { number } from "edf-utils"
import isEqual from "lodash.isequal"
import InvRedDetail from "../component/invRedDetail"
import error from "../../../component/components/modal/error"
import { type } from "os"
import { editCellColumns } from "./utils"
let hj = {
    hjje: "",
    hjse: "",
    hsje: "",
    jshjDx: "",
    jshj: "",
}
const minWidth = 1000
let optionList = {
    sbytcsList: [
        {
            name: 1,
            value: 2,
            sbytDm: "1",
            sbytMc: "抵扣",
        },
        {
            sbytDm: "10",
            sbytMc: "待抵扣",
        },
        {
            sbytDm: "2",
            sbytMc: "退税",
        },
        {
            sbytDm: "3",
            sbytMc: "代办退税",
        },
        {
            sbytDm: "6",
            sbytMc: "不抵扣",
        },
    ], //申报用途
}
let jzjtDmList = [
    { name: "是", value: "Y" },
    { name: "否", value: "N" },
]
let bdztChecked = true
const jsfsOptions = [
    {
        value: "1",
        name: "否",
    },
    {
        value: "2",
        name: "是",
    },
]
let mxDetai = {
    spbm: null,
    hwmc: null,
    hsje: null,
    je: null,
    se: null,
    slv: null,
    kec: null,
    ggxh: null,
    dw: null,
    sl: null,
    dj: null,
    cph: null,
    mxlx: null,
    txrqq: null,
    txrqz: null,
    qdbz: null,
    qdbzMx: null,
    jsfsDm: null,
    hwlxDm: null,
    jzjtDm: null,
    lslbz: null,
    mxsf01: null,
    mxsf02: null,
    mxnf01: null,
    mxnf02: null,
    mxnf03: null,
}
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }
    btnClick = () => {
        this.injections.reduce("modifyContent")
    }
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = this.config.webapi
        this.tableClass = "crum-" + new Date().valueOf()

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }

        injections.reduce("init")
    }
    componentDidMount = () => {
        this.mounted = true
        this.listNeedLoad = false
        this.load(this.component.props.kjxh)
    }
    onCancel = () => {
        return {
            listNeedLoad: this.needReload,
            needReload: this.needReload,
        }
    }
    getBlackDetail = () => {
        let data = this.metaAction.gf("data.editCellData.dataSource").toJS(),
            hwlxRes = this.metaAction.gf("data.hwlxRes").toJS(),
            slList = this.metaAction.gf("data.slList").toJS(),
            jsfsList = this.metaAction.gf("data.jsfsList").toJS()

        data.forEach((item, index) => {
            item.hwlxRes = hwlxRes
            item.slList = slList
            item.jsfsList = jsfsList
            item.jzjtDmList = jzjtDmList
            item.key = index
            item.hwmc = undefined //服务名称
            item.spbm = undefined //编码
            item.ggxh = undefined //规格
            item.dw = undefined //单位
            item.sl = undefined //数量
            item.dj = undefined //单价
            item.je = undefined //金额
            item.slv = undefined //税率
            item.se = undefined // 税额
            item.hwlxDm = undefined // 货物类型
            item.jsfsDm = undefined // 计税方式
            item.jzjtDm = undefined //即征即
        })
        return data
    }
    load = async (kjxh, redDate) => {
        //this.metaAction.sf('data.loading', true)
        const { fpzlDm, nsqj, fplx, readOnly } = this.component.props
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? "XGMZZS" : "YBNSRZZS", // 2000010001一般企业 2000010002 小规模企业
            nsrsbh = currentOrg.vatTaxpayerNum || "91441900065112839A", //东莞市松一自动化科技有限公司
            qyId = currentOrg.id || 7215202827592704,
            initData = {},
            option = {
                nsrxz,
                fplx,
                fpzlDm,
            },
            isTutorialPeriod, //是否纳税人辅导期
            slRes = [], //税率列表
            jsfsRes = [], // 计税方式
            spbmRes = [], //商品信息
            hwlxRes = [], // 货物类型
            sbytcsList = [], //申报用途
            ticketTypes = [], // 旅客票
            types = {},
            taxRates = [],
            rates = {},
            res
        // 税率 申报用途 计税方式和货物类型 在查看的界面也要用
        slRes = await this.webapi.invoices.getSlvcsList(option) // 税率
        if (fplx === "jxfp" && nsrxz === "YBNSRZZS") {
            // 进销一般纳税人才有申报用途
            sbytcsList = await this.webapi.invoices.getSbytcsList(
                `nsrxz=${nsrxz}&fplx=${fplx}&fpzlDm=${fpzlDm}`
            )
        }
        // 计税方式和货物类型只有销项才有
        if (fplx === "xxfp") {
            jsfsRes = await this.webapi.invoices.getJsfscsList(option)
            hwlxRes = await this.webapi.invoices.getHwlxcsList(option)
        }

        if (kjxh) {
            // 查找发票
            if (this.component.props.justShow === true) {
                // 其它只能查看模块
                let justShowData = await this.webapi.invoices[
                    fplx === "jxfp" ? "queryJxfpDto" : "queryXxfpDto"
                ](this.component.props.invArguments)
                if (justShowData.flag === true) {
                    res = justShowData[fplx]
                } else {
                    const confirm = await this.metaAction.modal("error", {
                        content: <span>{justShowData.msg}</span>,
                        width: 340,
                        okText: "确定",
                        mask: false,
                    })
                    if (confirm) {
                        this.component.props.closeModal()
                    }
                }
            } else {
                res = await this.webapi.invoices[fplx === "jxfp" ? "queryJxfp" : "queryXxfp"]({
                    kjxh,
                }) // 开具序号查找
            }
            // 添加一个key
            if (res) {
                if (redDate) {
                    // 有红冲明细清单
                    res.mxDetailList = redDate.mxDetailList
                    res.hjje = redDate.hjje
                    res.hjse = redDate.hjse
                    res.jshj = redDate.jshj
                    res.jshjDx = redDate.jshjDx
                    res.gfHcfpdm = redDate.gfHcfpdm
                    res.gfHcfphm = redDate.gfHcfphm
                    res.oldfphm = redDate.fphm
                    res.fplyLx = "2" //修改类型为录入
                }
                while (res.mxDetailList.length < 9) {
                    res.mxDetailList.push({})
                }
                res.mxDetailList.forEach(item => {
                    if (item.mxxh) {
                        item.rowState = true
                        res.jzjtDm = item.jzjtDm
                        res.jsfsDm = item.jsfsDm
                    }
                    if (item.txrqq && item.txrqz) {
                        return (item.txrq = [item.txrqq, item.txrqz])
                    }
                })
                res.kprq = res.kprq ? moment(res.kprq).format("YYYY-MM-DD") : null
                res.oldNf06 = res.nf06
                res.oldfphm = res.fphm
                hj.hjse = res.hjse
                hj.hjje = res.hjje
                hj.jshj = res.jshj
                hj.jshjDx = res.jshjDx
                hj.hsje = res.hjse
                res.bdzt = res.bdzt === "0" ? false : true
                initData = res
                if (res.mxDetailList instanceof Array) {
                    initData.mxDetailList = res.mxDetailList.map(m => ({ ...m, key: m.mxxh }))
                }
            }
        } else {
            // 新增发票
            let initInfo =
                (await this.webapi.invoices[
                    fplx === "jxfp" ? "initiateAddOfJxfp" : "initiateAddOfXxfp"
                ]({
                    qyId,
                    nsrsbh,
                    fpzlDm,
                    skssq: moment(nsqj).format("YYYYMM"),
                })) || {}
            if (initInfo) {
                initData = {
                    ...initInfo,
                    fplyLx: "2",
                    oldfphm: initInfo.fphm,
                    mxDetailList: [
                        { mxxh: 0 },
                        { mxxh: 1 },
                        { mxxh: 2 },
                        { mxxh: 3 },
                        { mxxh: 4 },
                        { mxxh: 5 },
                        { mxxh: 6 },
                        { mxxh: 7 },
                        { mxxh: 8 },
                    ],
                }
            }
        }
        // 获取税率商品编码等
        if (this.component.props.justShow != true) {
            spbmRes = await this.webapi.invoices.getSpbmList()

            if (fplx === "jxfp") {
                if (fpzlDm === "18") {
                    let ticketType_taxRate = await this.webapi.invoices.getKplxcsList(
                        `nsrxz=YBNSRZZS&fplx=jxfp`
                    ) //获取客票类型与税率
                    ticketType_taxRate.forEach((item, index) => {
                        const { kplxDm: mxlx, kplxMc: mxlxMc, mrslv, slv } = item
                        if (!types[mxlx]) {
                            ticketTypes.push({
                                mxlx,
                                mxlxMc,
                                slv,
                                mrslv,
                                name: mxlxMc,
                                value: mxlx,
                            }) // 客票类型
                            type[mxlx] = mxlx
                        }
                        if (!rates[mrslv]) {
                            taxRates.push({ mrslv, slv }) // 税率
                            rates[mrslv] = mrslv
                        }
                    })
                }

                if (this.notXaoGuiMo()) {
                    let getNsrZgrdXx = {}
                    let skssq = moment(nsqj).subtract(1).format("YYYYMM")
                    if (this.component.props.justShow != true)
                        getNsrZgrdXx = await this.webapi.invoices.getNsrZgrdXx({ skssq })
                    if (!this.mounted) return //组件已经卸载
                    isTutorialPeriod = getNsrZgrdXx && getNsrZgrdXx.isTutorialPeriod
                }
            }
        }

        let form = this.metaAction.gf("data.form").toJS()
        form.dkyf = moment(nsqj).format("YYYYMM").substring(0, 6)
        form = {
            ...form,
            ...initData,
        }
        let cacheFplyLx = form.fplyLx
        form.oldfplyLx = form.fplyLx
        if (form.fplyLx != 2 && form.fplyLx != 1 && form.fplyLx != 3) {
            // 将 3导入 4远程提取 5票税宝读取 设置为 1读取
            cacheFplyLx = form.fplyLx
            form.fplyLx = "1"
        }
        if (form.fplyLx === "3") {
            form.fplyLx = "2"
        }

        // 进销信息初始数据
        optionList = {
            slList: slRes,
            jsfsList: jsfsRes,
            spbmRes,
            hwlxRes: hwlxRes,
            jzjtDmList: [
                { name: "是", value: "Y" },
                { name: "否", value: "N" },
            ],
            oldSllist: slRes,
            oldJsfsList: jsfsRes,
            oldSpbmRes: spbmRes,
            oldhwlxRes: hwlxRes,
            sbytcsList: sbytcsList,
        }
        form.mxDetailList.forEach((item, index) => {
            item.key = String(index)
            item.slList = slRes
            item.jsfsList = jsfsRes
            item.hwlxRes = hwlxRes
            item.jzjtDmList = jzjtDmList
        })
        let editCellData = {
            dataSource: form.mxDetailList,
            count: form.mxDetailList,
        }
        this.injections.reduce("setStates", {
            "data.cacheFplyLx": cacheFplyLx,
            "data.form": fromJS(form),
            "data.initData": fromJS(initData),
            "data.editCellData": fromJS(editCellData),
            "data.slList": fromJS(slRes || []),
            "data.jsfsList": fromJS(jsfsRes || []),
            "data.spbmList": fromJS(
                (spbmRes || []).map(item => ({ ...item, key: item.spbm, title: item.spmc }))
            ),
            "data.sbytcsList": fromJS(sbytcsList),
            "data.hwlxRes": fromJS(hwlxRes || []),
            "data.slListCache": fromJS(slRes || []),
            "data.jsfsListCache": fromJS(jsfsRes || []),
            "data.spbmResCache": fromJS(spbmRes || []),
            "data.hwlxResCache": fromJS(hwlxRes || []),
            "data.ticketTypes": fromJS(ticketTypes || []),
            "data.isTutorialPeriod": isTutorialPeriod,
            "data.loading": false,
        })
    }
    onOk = async () => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? "XGMZZS" : "YBNSRZZS" // 2000010001一般企业 2000010002 小规模企业
        const { sf01 } = this.component.props
        let fpzlDm = this.component.props.fpzlDm
        if (this.component.props.justShow === true) {
            // 只允许查看状态直接关闭
            this.component.props.closeModal()
        } else {
            let params = await this.checkForm()
            if (!params) {
                this.metaAction.toast("error", "红框内必须有值")
                return false
            }
            if (fpzlDm === "03" || fpzlDm === "08") {
                params.sf02 = params.gfsbh
            }
            if (fpzlDm == "03" || fpzlDm == "07") {
                params.mxDetailList = [
                    {
                        hwlxDm: "0004",
                        jzjtDm: params.jzjtDm,
                        je: params.hjje,
                        jsfsDm: params.jsfsDm,
                        se: params.se,
                        slv: params.zbslv,
                        rowState: true,
                    },
                ]
            }
            let details = params.mxDetailList.filter(item => item.rowState === true),
                tipFlag,
                oldDetails1
            oldDetails1 = { ...details[0] }
            details[0] = {
                ...mxDetai,
                ...oldDetails1,
            }
            details.forEach(item => {
                delete item.hwlxList
                delete item.slList
                delete item.jsfsList
                delete item.jzjtDmList
                delete item.hwlxRes
                let sl = Number(item.sl)
                let je = Number(item.je)
                if ((sl > 0 && je < 0) || (sl < 0 && je > 0)) {
                    tipFlag = true
                }
            })
            if (tipFlag === true) {
                this.metaAction.toast("error", "数量和金额应同为正数或负数")
                return false
            }
            this.injections.reduce("setState", "data.loading", true)
            let kjxh = this.component.props.kjxh,
                apiFunName
            if (this.component.props.fplx === "xxfp") {
                apiFunName = kjxh ? "updateXxfp" : "addXxfp"
                delete params.bdzt
                delete params.bdlyLx
                delete params.dkyf
                delete params.bdjg
                delete params.nf06
            } else {
                if (fpzlDm === "04") {
                    //普票没有抵扣月份 和申报用途
                    delete params.bdlyLx
                    delete params.dkyf
                }
                if (fpzlDm === "99") {
                    //其它票据为未认证 也没有申报用途
                    delete params.bdlyLx
                    delete params.dkyf
                    params.bdzt = "0"
                }
                if (nsrxz === "XGMZZS") {
                    params.bdzt = "0"
                    params.dkyf = null
                }
                apiFunName = kjxh ? "updateJxfp" : "addJxfp"
            }
            params.mxDetailList = details
            if (!params.skssq) {
                params.skssq = this.calcSkssq(
                    moment(this.component.props.nsqj || "")
                        .format("YYYYMM")
                        .substring(0, 6),
                    params.kprq,
                    !params.bdzt
                )
            }
            // if (params.bdzt != 1) {
            //     // bdzt=0 未认证 1 已认证
            //     params.skssq = params.kprq.replace("-", "").slice(0, 6)
            // }
            // if (params.bdzt != 0) {
            //     params.skssq = moment(this.component.props.nsqj).subtract(1).format("YYYYMM")
            // }
            params.fpzlDm = this.component.props.fpzlDm // 发票种类代码
            if (fpzlDm != "07") {
                params.sf01 = sf01 ? sf01 : "Y" //Y：专票，N：普票         "sf01": "abcd",   --预留字段(销项-->机动车销售统一发票：代表专票、普票，使用扩展字段：sf01，Y：专票，N：普票）(进项-->海关专用缴款书发票：进口口岸代码 sf01)(进项-->代扣代缴专用缴款书：纳税人名称)(旅客运输服务抵扣凭证：税额合计大写)(二手车销售统一发票：经营拍卖单位名称)
            }
            if (fpzlDm === "12") {
                delete params.sf01
                params.hjje = params.hjse
            }
            const cacheFplyLx = this.metaAction.gf("data.cacheFplyLx")
            if (cacheFplyLx > -1 && cacheFplyLx != params.fplyLx) {
                params.fplyLx = cacheFplyLx
            }
            if (params.oldfplyLx) {
                params.fplyLx = params.oldfplyLx
            }
            let res = await this.webapi.invoices[apiFunName](params)
            if (!this.mounted) return
            this.injections.reduce("setState", "data.loading", false)
            if (kjxh && res === null) {
                this.needReload = true
                this.metaAction.toast("success", "修改成功")
            } else if (res) {
                this.needReload = true
                this.metaAction.toast("success", "新增成功")
                let blackDetail = this.getBlackDetail()
                hj = {}
                this.commonRef.resetFields(["jshj", "zbslv", "cllx"]) // 清空表单内的内容
                if (this.component.props.fplx === "xxfp") {
                    this.injections.reduce(
                        "setState",
                        "data.form",
                        fromJS({
                            xfmc: params.xfmc,
                            xfsbh: params.xfsbh,
                            xfdzdh: params.xfdzdh,
                            xfyhzh: params.xfyhzh,
                            kprq: params.kprq,
                            fphm: res.fphm,
                            fpdm: res.fpdm,
                            oldfphm: res.fphm,
                            fpztDm: "1",
                            fplyLx: "2",
                            // kprq: moment().format('YYYY-MM-DD'),
                            mxDetailList: blackDetail,
                        })
                    )
                } else {
                    // 一般纳税人且是专票的时候 才有已认证
                    let bdzt = false
                    if (nsrxz === "YBNSRZZS" && sf01 != "N") {
                        bdzt = true
                        let obj = {
                            bdlyLx: "1",
                            dkyf: moment(this.component.props.nsqj)
                                .format("YYYYMM")
                                .substring(0, 6),
                            nf06: undefined,
                            bdzt: true,
                        }

                        this.commonRef.setFieldsValue(obj) //给一个默认值
                        bdztChecked = true
                    }

                    this.injections.reduce(
                        "setState",
                        "data.form",
                        fromJS({
                            bdzt,
                            dkyf: moment(this.component.props.nsqj)
                                .format("YYYYMM")
                                .substring(0, 6),
                            nf06: null,
                            gfmc: params.gfmc,
                            gfsbh: params.gfsbh,
                            gfdzdh: params.gfdzdh,
                            gfyhzh: params.gfyhzh,
                            fphm: res.fphm,
                            oldfphm: res.fphm,
                            fpdm: res.fpdm,
                            kprq: params.kprq,
                            fpztDm: "1",
                            fplyLx: "2",
                            bdlyLx: 1,
                            mxDetailList: blackDetail,
                        })
                    )
                }
            }
            return false
        }
    }
    checkForm = async () => {
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? "XGMZZS" : "YBNSRZZS", // 2000010001一般企业 2000010002 小规模企业
            fplx = this.component.props.fplx,
            fpzlDm = this.component.props.fpzlDm
        let form = this.metaAction.gf("data.form").toJS(),
            error = this.metaAction.gf("data.error").toJS(),
            flag = true,
            gf = {},
            gfErr = {},
            ifo = {},
            ifoErr = {},
            ershouValue = {},
            obj = {}
        // 购买方和销售方信息
        this.ref &&
            this.ref.validateFieldsAndScroll((err, values) => {
                gf = values
                gfErr = err
            })
        // // 备注和开票人等信息
        this.commonRef &&
            this.commonRef.validateFieldsAndScroll((err, values) => {
                ifo = values
                ifoErr = err
            })
        //二手车底部的市场信息
        this.refershouche &&
            this.refershouche.validateFieldsAndScroll((err, values) => {
                ershouValue = values
            })

        const formData = this.tableRef ? await this.tableRef.onOk() : { tableFlag: true }
        form = {
            ...form,
            ...gf,
            ...ifo,
            mxDetailList: formData.dataSource,
            ...ershouValue,
            ...hj,
        }
        error = {
            ...gfErr,
            ...ifoErr,
            ...error,
        }
        // 发票类型不等于进项发票 也不等于一般纳税人的时候bdzt为空
        if (fpzlDm === "04" && form.fplyLx === "2") form.bdzt = false
        form.bdzt = form.bdzt == true ? 1 : 0

        if (nsrxz !== "YBNSRZZS" && fplx !== "jxfp") {
            form.bdzt = null
        }
        if (fpzlDm === "07") {
            delete form.bdlyLx
            delete form.dkyf
            form.bdzt = "0"
        }
        flag = formData.tableFlag
        // 发票代码号码处理
        if (fpzlDm === "07" || fpzlDm === "03") {
            // 机动车 二手车发票代码为必填项的时候 长度为12位数字
            if (!form.fpdm) {
                error.fpdm = "发票代码不能为空"
                flag = false
            } else if (form.fpdm.length !== 12) {
                error.fpdm = "发票代码长度应为12个字符"
                flag = false
            }
            if (!form.fphm) {
                error.fphm = "发票号码不能为空"
                flag = false
            } else if (form.fphm.length !== 8) {
                error.fphm = "发票号码长度应为8个字符"
                flag = false
            }
        } else if (
            fpzlDm === "05" ||
            fpzlDm === "09" ||
            fpzlDm === "08" ||
            fpzlDm === "18" ||
            fpzlDm === "99"
        ) {
            // 普通机打发票和未开具发票纳税检查调整 和未开具 代码非必填 号码为自动补全12位 可修改
            if (fpzlDm === "05") {
                if (Number(form.fpfs) < 1 || form.fpfs === "") {
                    error.fpfs = "开票张数不能小于1"
                    flag = false
                }
                if (!form.fphm) {
                    error.fphm = "发票号码不能为空"
                    flag = false
                } else if (form.fphm) {
                    if (form.fphm.length === 12) {
                        if (form.fphm.substring(0, 8) !== form.oldfphm.substring(0, 8)) {
                            error.fphm = "发票号码只能修改为8位数字或者修改后自动编号后面的四位数"
                            flag = false
                        }
                    } else if (form.fphm.length === 8) {
                        if (isNaN(Number(form.fphm.substring(0, 8)))) {
                            error.fphm = "完全修改后发票号码应为8个数字"
                            flag = false
                        }
                    } else {
                        error.fphm = "发票号码只能修改为8位数字或者修改后自动编号后面的四位数"
                        flag = false
                    }
                }
            }
            if (fpzlDm === "09" || fpzlDm === "08" || fpzlDm === "99") {
                if (!form.fphm) {
                    error.fphm = "发票号码不能为空"
                    flag = false
                } else if (form.fphm) {
                    if (form.fphm.length === 12) {
                        if (form.fphm.substring(0, 8) !== form.oldfphm.substring(0, 8)) {
                            error.fphm = "发票号码只能修改自动编号后面的四位数"
                            flag = false
                        }
                    } else {
                        error.fphm = "发票号码只能修改自动编号后面的四位数"
                        flag = false
                    }
                }
            }
        } else if (fpzlDm === "12" || fpzlDm === "13") {
            // 海关专用缴款书和纳税检查调整 代码非必填 号码为22位
            if (fpzlDm === "13") {
                if (!form.fphm) {
                    error.fphm = "专用缴款书号码不能为空"
                    flag = false
                } else if (form.fphm.length !== 22) {
                    error.fphm = "海关专用缴款书号码长度应为22个字符"
                    flag = false
                } else {
                    let wb = form.fphm.slice(4, 8) //5-8位
                    let wl = form.fphm.slice(4, 6) //5-6位 必须==20
                    let sj = form.fphm.slice(18, 19) //19位
                    let es = form.fphm.slice(19, 20) //20位

                    if (
                        !/^\d{4}$/.test(wb) ||
                        wl != 20 ||
                        Number(wb) > Number(moment().format("YYYY"))
                    ) {
                        error.fphm =
                            "海关专用缴款书号第5至第8位为年份(以20开头且小于当前年份)，请录入正确的代码！"
                        flag = false
                    } else if (sj !== "-" && sj !== "/") {
                        error.fphm = "海关专用缴款书号第19位为征税标志，“-”为正常征税，“/”为补税！"
                        flag = false
                    } else if (es !== "L") {
                        error.fphm = "海关专用缴款书号第20位为税种标志，增值税标志为“L”"
                        flag = false
                    }
                }
            }
            if (fpzlDm === "12") {
                if (!form.fphm) {
                    error.fphm = "缴款书号码不能为空"
                    flag = false
                }
            }
        } else if (fpzlDm === "04" || fpzlDm === "14" || fpzlDm === "17") {
            // 农产品 通行费 增值税普通发票的发票代码可以为 10 或者12个字符
            if (!form.fpdm) {
                error.fpdm = "发票号码不能为空"
                flag = false
            } else if (form.fpdm.length !== 10 && form.fpdm.length !== 12) {
                error.fpdm = "发票代码长度应为10或12个字符"
                flag = false
            }
            if (!form.fphm) {
                error.fphm = "发票号码不能为空"
                flag = false
            } else if (form.fphm.length !== 8) {
                error.fphm = "发票号码长度应为8个字符"
                flag = false
            }
        } else {
            if (!form.fpdm) {
                error.fpdm = "发票号代码不能为空"
                flag = false
            } else if (form.fpdm.length !== 10) {
                error.fpdm = "发票代码长度应为10个字符"
                flag = false
            }
            if (!form.fphm) {
                error.fphm = "发票号码不能为空"
                flag = false
            } else if (form.fphm.length !== 8) {
                error.fphm = "发票号码长度应为8个字符"
                flag = false
            }
        }
        if (!form.kprq) {
            error.kprq = "开票日期不能为空"
            flag = false
        }

        // 购方名称 识别号 销方 名称 识别号 处理
        let gxFlg = true
        if (fpzlDm === "08" || fpzlDm === "12" || fpzlDm === "13" || fpzlDm === "18") {
            //不需要校验
            gxFlg = false
        }
        if (gxFlg === true) {
            if (!form.xfmc) {
                error.xfmc = "销售方名称不能为空"
                flag = false
            }
            if (fpzlDm != "09") {
                //  未开具 购方信息销售方纳税识别号为非必填
                if (fplx === "xxfp") {
                    if (!form.xfsbh) {
                        error.xfsbh = "销售方纳税人识别号不能为空"
                        flag = false
                    } else if (form.xfsbh && form.xfsbh.length < 15) {
                        error.xfsbh = "销售方纳税人识别号最少15个字符"
                        flag = false
                    }
                }
                if (!form.gfmc) {
                    error.gfmc = "购买方名称不能为空"
                    flag = false
                }
            } else {
                if (!form.gfmc) {
                    form.gfmc = "未定义购买方"
                }
            }
            if (
                fplx === "jxfp" &&
                (fpzlDm === "01" ||
                    fpzlDm === "10" ||
                    fpzlDm === "04" ||
                    fpzlDm === "07" ||
                    fpzlDm === "08" ||
                    fpzlDm === "12" ||
                    fpzlDm === "13" ||
                    fpzlDm === "15")
            ) {
                // 机动车 普通机打  未开具 购方识别号为非必填
                if (!form.gfsbh) {
                    error.gfsbh = "购买方纳税人识别号不能为空"
                    flag = false
                } else if (form.gfsbh && form.gfsbh.length < 15) {
                    error.gfsbh = "购买方纳税人识别号最少15个字符"
                    flag = false
                }
            }
        }
        // if(!form.jshj){
        //     error.jshj = '价税合计不能为空'
        //     flag = false
        // }
        // 机动车 二手车处理
        if (fpzlDm == "03" || fpzlDm == "07") {
            if (fplx === "xxfp") {
                if (form.zbslv === undefined) {
                    error.zbslv = "税率不能为空"
                    flag = false
                }
            }

            if (!form.cllx) {
                error.cllx = "车辆类型不能为空"
                flag = false
            }
            if (!form.jshj) {
                error.jshj = "价税合计不能为空"
                flag = false
            }
        }
        // 有效税额
        if (fplx === "jxfp") {
            if (nsrxz === "YBNSRZZS") {
                if (fpzlDm === "01" && form.bdzt != false && form.bdlyLx === "1") {
                    if (!form.nf06) {
                        error.jshj = "有效税额不能为空"
                        flag = false
                    }
                }
            }
        }
        obj = {
            "data.other.randomKey": Math.random(),
            "data.form.details": fromJS(form.details),
        }

        if (!flag) {
            obj["data.error"] = fromJS(error)
        }
        this.injections.reduce("setStates", obj)

        return flag ? form : false
    }
    notAllowEdit = path => {
        //是否允许修改 编辑时 录入的发票都允许修改
        //fplyLx 发票来源类型，1：读取，2：录入，3：导入
        let kjxh = this.component.props.kjxh
        let fplyLx = this.metaAction.gf("data.form.fplyLx")
        if (path === "inv") {
            if (kjxh) return true
        }

        if (!kjxh) return false
        if (fplyLx == 2) {
            return false
        }

        return true
    }
    //明细清单
    redDetail = async () => {
        const { gfHcfpdm, gfHcfphm } = this.metaAction.gf("data.form").toJS()
        let data = {
            gfHcfpdm,
            gfHcfphm,
            fpzlDm: this.component.props.fpzlDm,
            fpzl: this.component.props.fplx,
            justShow: this.component.props.justShow,
        }
        let redDate = await this.metaAction.modal("show", {
            title: "明细清单",
            className: "inv-app-invReadDetail-card-modal",
            width: 420,
            hidden: 550,
            style: { top: 50 },
            okText: "确定",
            children: (
                <InvRedDetail metaAction={this.metaAction} webapi={this.webapi} data={data} />
            ),
        })
        if (typeof redDate === "object") {
            this.load(this.component.props.kjxh, redDate)
        }
    }

    handleGetPopupContainer = () => {
        return document.querySelector(".ant-modal")
    }

    // 获取发票名称
    getFpName = () => {
        const { fpName, fplx, invArguments, justShow } = this.component.props
        if (fpName) return fpName
        if (justShow) {
            const fpzlDm = invArguments.fpzlDm
            if (fplx === "xxfp") {
                let obj = {
                    "01": "增值税专用发票",
                    "10": "增值税专用发票(代开）",
                    "03": "机动车销售发票",
                    "04": "增值税普通发票",
                    "07": "二手车销售发票",
                    "05": "普通机打发票",
                    "08": "纳税检查调整",
                    "09": "未开具发票",
                }
                return obj[fpzlDm]
            }
            if (fplx === "jxfp") {
                let obj = {
                    "01": "增值税专用发票",
                    "10": "增值税专用发票(代开）",
                    "03": "机动车销售发票",
                    "04": "增值税普通发票",
                    "07": "二手车销售发票",
                    "13": "海关专用缴款书",
                    "12": "代扣代缴专用缴款书",
                    "14": "农产品销售（收购）发票",
                    "17": "通行费增值税电子普通发票",
                    "18": "旅客运输服务抵扣凭证",
                    "99": "其他票据",
                }
                return obj[fpzlDm]
            }
        }
    }
    // 是否小规模
    notXaoGuiMo = () => {
        //小规模不显示
        let swVatTaxpayer =
            this.metaAction.context.get("currentOrg") &&
            this.metaAction.context.get("currentOrg").swVatTaxpayer
        return swVatTaxpayer !== 2000010002
    }
    // 抵扣月份
    dkyfRender = () => {
        let fpskssq = this.metaAction.gf("data.form.skssq")
        let nsqj = this.component.props.nsqj
        let isTutorialPeriod = this.metaAction.gf("data.isTutorialPeriod")
        if (nsqj) {
            let skssq = moment(nsqj, "YYYYMM")
            if (Number(fpskssq) > moment(nsqj).format("YYYYMM")) {
                skssq = moment(fpskssq, "YYYYMM")
            }

            let skssqString = skssq.format("YYYYMM")
            let _com = []
            if (isTutorialPeriod === "Y") {
                let nextskssq = skssq.add("month", 1) //下月
                let nextskssqString = nextskssq.format("YYYYMM")
                _com = [
                    {
                        name: skssqString,
                        value: skssqString,
                    },
                    {
                        name: nextskssqString,
                        value: nextskssqString,
                    },
                ]
                return _com
            }
            _com = [
                {
                    name: skssqString,
                    value: skssqString,
                },
            ]
            return _com
        }
    }
    // 时间
    getDefaultPickerValue = () => {
        // console.log( moment(this.component.props.nsqj).format('YYYYMM'), this.metaAction.gf('data.form.kprq'));
        // let nsqj = moment(this.component.props.nsqj).format('YYYYMM') || this.metaAction.gf('data.form.kprq') ;
        //
        // nsqj = nsqj && `${nsqj.slice(0,4)}-${nsqj.slice(4,6)}-01` || moment().format('YYYY-MM-DD')
        // console.log(moment(nsqj, 'YYYY-MM-DD'));
        // let nsqj = moment().subtract(1)
        //return moment(nsqj, 'YYYY-MM-DD')
        // console.log(this.metaAction.gf('data.form.kprq'), this.component.props.nsqj);
        let nsqj = this.metaAction.gf("data.form.kprq") || this.component.props.nsqj
        // nsqj= moment(nsqj).format('YYYY-MM')
        // nsqj = nsqj && `${nsqj.slice(0,4)}-${nsqj.slice(4,6)}-01` || moment().format('YYYY-MM-DD')
        return moment(nsqj, "YYYY-MM-DD")
    }
    disabledDate = current => {
        const nsqj = this.component.props.nsqj || moment().format("YYYYMM")
        return current && current > nsqj
    }
    //直接改变value
    handleFieldChangeV = (path, v, must, nuebem) => {
        if (must) {
            let errorPath = path.replace("form", "error")
            let obj = {
                [path]: v,
                [errorPath]: "",
            }
            if (path.indexOf("kprq") > -1) {
                let { bdzt, kprq, skssq, bdlyLx, dkyf } =
                    (this.metaAction.gf("data.form") && this.metaAction.gf("data.form").toJS()) ||
                    {}
                const xgm = !this.notXaoGuiMo(),
                    isXxfp = this.component.props.fplx === "xxfp",
                    isJxfp = this.component.props.fplx === "jxfp"
                //  (isJxfp && this.maxDatestring(v, kprq, true)) ||
                if (
                    !bdzt ||
                    isXxfp ||
                    xgm ||
                    (bdzt && isJxfp && this.maxDatestring(v, skssq, true))
                ) {
                    let nsqj = moment(this.component.props.nsqj || "")
                        .format("YYYYMM")
                        .substring(0, 6)
                    skssq = this.calcSkssq(nsqj, v, !bdzt || xgm || isXxfp)
                    // 申报用途＝抵扣，dkyf=max(nsqj,skssq)
                    bdzt && bdlyLx == 1 && (dkyf = this.maxDatestring(nsqj, skssq))
                }
                obj["data.form.dkyf"] = dkyf
                obj["data.form.skssq"] = skssq
            }
            this.metaAction.sfs(obj)
        } else {
            this.metaAction.sf(path, v)
        }
    }
    maxDatestring = (a, b, isAMax) => {
        const _a = String(a).replace("-", "").substring(0, 6),
            _b = String(b).replace("-", "").substring(0, 6),
            _max = String(Math.max(_a, _b))
        if (isAMax) {
            return _max === _a
        }
        return _max === _a ? a : b
    }
    // 计算税款所属期
    calcSkssq = (bsyf, kpyf, isEqualKprq) => {
        /*
            进项
                未认证，skssq=开票月份
                已认证，skssq=max(报税月份-1,开票月份)
            销项
                skssq=开票月份
            小规模  skssq=开票月份
         */
        kpyf = kpyf.replace("-", "").substring(0, 6)
        return isEqualKprq ? kpyf : this.maxDatestring(bsyf, kpyf)
    }
    // 认证状态
    bdztChange = e => {
        bdztChecked = e.target.checked
        const checked = e.target.checked
        let nsqj = moment(this.component.props.nsqj || "")
            .format("YYYYMM")
            .substring(0, 6)
        let { bdlyLx, bdjg, nf06, hjse, fplyLx, kprq, skssq } =
            (this.metaAction.gf("data.form") && this.metaAction.gf("data.form").toJS()) || {}
        skssq = this.calcSkssq(nsqj, kprq, !checked)
        let dkyf = this.maxDatestring(nsqj, skssq)
        if (fplyLx != 2) {
            hj.hjse = hjse
        }
        let obj = {
            "data.form.bdzt": checked,
            "data.form.dkyf": checked ? dkyf : undefined, // 默认为当前属期
            "data.form.bdlyLx": checked ? bdlyLx || "1" : undefined, // 1-抵扣， 2-退税， 3-代办退税， 4-不抵扣自
            "data.form.bdjg": checked ? bdjg : undefined, //发票的状态, 0-正常， 1-异常
            "data.form.nf06": checked ? hj.hjse : undefined, // 有效抵扣税额
            "data.error.nf06": "",
            "data.error.bdjg": "",
            "data.error.bdlyLx": "",
            "data.error.dkyf": "",
            "data.form.skssq": skssq,
            // kpr: gfinfo.kpr     //开票人
        }

        this.commonRef.setFieldsValue({
            dkyf: checked ? dkyf : undefined,
            bdlyLx: checked ? bdlyLx || "1" : undefined,
            nf06: checked ? hj.hjse : undefined,
        })
        this.injections.reduce("setStates", obj)
    }
    // 进项申报用途修改
    bdlyLxChange = v => {
        let { bdzt, oldNf06, nf06, hjse, fplyLx, skssq, kprq } =
            (this.metaAction.gf("data.form") && this.metaAction.gf("data.form").toJS()) || {}
        let nsqj = moment(this.component.props.nsqj || "")
            .format("YYYYMM")
            .substring(0, 6)
        skssq = this.calcSkssq(nsqj, kprq, !bdzt)
        let dkyf = this.maxDatestring(nsqj, skssq)
        if (fplyLx === "2") {
            if (oldNf06 === undefined) {
                oldNf06 = nf06
                hjse = nf06
            }
        }
        let obj = {
            // nf06: v != 1 ? null : hj.hjse,
            dkyf: v != 1 ? null : dkyf,
        }
        this.commonRef.setFieldsValue(obj) // 有效税额

        this.injections.reduce("setStates", {
            "data.form.bdlyLx": v,
            "data.form.dkyf": v != 1 ? null : dkyf,
            "data.error.dkyf": "",
            "data.error.bdlyLx": "",
            // "data.form.nf06": v === "1" ? oldNf06 : hjse,
            // "data.error.nf06": "",
        })
    }
    // 抵扣月份不可编辑
    notAllowEditDkyf = () => {
        if (this.component.props.justShow === true) return true
        const { bdlyLx, bdzt } = this.metaAction.gf("data.form").toJS()
        if (bdzt == 1 && bdlyLx == 1) {
            return false
        }
        return true
    }

    // 车辆价格合计
    amountChange = v => {
        let bdzt = this.metaAction.gf("data.form.bdzt")
        v = String(v).match(/^[0-9||.||-]*$/) * 1
        let taxRate = this.metaAction.gf("data.form.zbslv") || ""
        let jshj = Number(v), //金额
            jshjDx = utils.number.moneySmalltoBig(jshj, 2),
            hjje = utils.number.round(jshj / (1 + taxRate), 2), //
            hjse = utils.number.round(jshj - hjje, 2) //税额
        // if(this.component.props.fplx === 'jxfp'){
        //     hjje = v
        // }
        hj.jshj = v === "" ? undefined : jshj.toFixed(2)
        hj.jshjDx = v === undefined ? undefined : jshjDx
        hj.hjse = v === undefined || taxRate === undefined ? undefined : hjse.toFixed(2)
        hj.hjje = v === undefined ? undefined : hjje.toFixed(2)
        this.injections.reduce("setStates", {
            [`data.form.jshj`]: v === "" ? undefined : jshj.toFixed(2),
            [`data.form.jshjDx`]: v === undefined ? undefined : jshjDx,
            [`data.form.hjse`]: v === undefined || taxRate === undefined ? undefined : hj.hjse,
            [`data.form.hjje`]: v === undefined ? undefined : hjje.toFixed(2),
            [`data.form.nf06`]: v === undefined || taxRate === undefined ? undefined : hj.hjse,
            [`data.error.jshj`]: "",
        })
    }
    // 车辆税率改变
    taxRateChange = v => {
        v = parseFloat(v)
        let jsfs = this.metaAction.gf("data.form.jsfsDm")
        let bdzt = this.metaAction.gf("data.form.bdzt")
        let fpzlDm = this.component.props.fpzlDm
        if (fpzlDm === "03") {
            // "0":一般计税；"1":简易征收；"2":免抵退；"3":免税
            if (v == 0.17 || v == 0.16 || v == 0.13 || v == 0.11 || v == 0.1 || v == 0.09) {
                // 一般纳税人：当税率选择“17%，16%，13%，11%，10%，9%”其中一种时 计税方式自动选中“一般计税”
                jsfs = "0"
            }
            if (v == 0.05 || v == 0.04 || v == 0.03 || v == 0.02 || v == 0.015 || v == 0.01) {
                // 一般纳税人：当税率选择“5%，4%，3%，2%，1.5%”其中一种时 计税方式自动选中“简易征收”
                jsfs = "1"
            }
            if (v == 0.06) {
                // 当税率选择“6%”时，计税方式为空白
                jsfs = undefined
            }

            if (v == 0) {
                jsfs = "3"
            }
        } else {
            // "0":一般计税；"1":简易征收；"2":免抵退；"3":免税
            if (v == 0.17 || v == 0.16 || v == 0.13) {
                // 一般纳税人：当税率选择“17%，16%，13%其中一种时 计税方式自动选中“一般计税”
                jsfs = "0"
            }
            if (v == 0.03 || v == 0.02 || v == 0.01) {
                // 一般纳税人：当税率选择“3%，2%”其中一种时 计税方式自动选中“简易征收”
                jsfs = "1"
            }
        }

        let jshj0 = this.metaAction.gf("data.form.jshj")
        let jshj = utils.number.round(jshj0, 2) //价税合计
        let taxRate = v //税率
        let hjje = utils.number.round(jshj / (1 + taxRate), 2), //不含税价
            hjse = utils.number.round(jshj - hjje, 2) //税额
        this.injections.reduce("setStates", {
            ["data.form.jsfsDm"]: jsfs,
            [`data.form.zbslv`]: v,
            [`data.form.hjse`]: v === undefined || jshj0 === undefined ? undefined : hjse,
            [`data.form.hjje`]: v === undefined || jshj0 === undefined ? undefined : hjje,
            [`data.form.nf06`]: bdzt ? hjse : undefined,
            [`data.error.zbslv`]: "",
        })
        let obj = {
            jsfsDm: jsfs,
            nf06: bdzt ? hjse : undefined,
        }
        this.commonRef.setFieldsValue(obj)
    }
    // 车辆销项计税方式修改
    jsfsDmChange = v => {
        let slList = this.metaAction.gf("data.slListCache").toJS()
        let fpzlDm = this.component.props.fpzlDm
        let slListNew = [],
            kjxh = this.component.props.kjxh,
            zbslv = this.metaAction.gf("data.form.zbslv"),
            fplyLx = this.metaAction.gf("data.form.fplyLx") //fplyLx 发票来源类型，1：读取，2：录入，3：导入
        switch (v) {
            case "0":
                if (fpzlDm === "03") {
                    // 当计税方式选中“一般计税”，税率选择项为
                    // 一般纳税人：“17%，16%，13%，11%，10%，9%，6%”
                    slListNew = slList.filter(f => f.slv <= 0.17 && f.slv >= 0.06)
                }
                if (fpzlDm === "07") {
                    //一般计税
                    // 17%，16%，13%"
                    slListNew = slList.filter(f => f.slv <= 0.17 && f.slv >= 0.13)
                }

                break
            case "1":
                if (fpzlDm === "03") {
                    //简易征收
                    // “6%，5%，4%，3%，2%，1.5%”
                    slListNew = slList.filter(f => f.slv <= 0.06 && f.slv >= 0.01)
                    zbslv = 0.03 || 0.01
                }
                if (fpzlDm === "07") {
                    //简易征收
                    // “3%，2%”
                    slListNew = slList.filter(f => f.slv <= 0.03 && f.slv >= 0.01)
                }

                break
            case "2":
                if (fpzlDm === "03") {
                    //免抵退
                    //免税
                    slListNew = slList.filter(f => f.slv == 0)
                    zbslv = 0
                    // jzjtbz = 'N'
                    // jzjtbzDisabled = true
                }

                break
            case "3":
                if (fpzlDm === "03") {
                    //免抵退
                    //免税
                    slListNew = slList.filter(f => f.slv == 0)
                    zbslv = 0
                    // jzjtbz = 'N'
                    // jzjtbzDisabled = true
                }

                break
        }
        let jshjxx = this.metaAction.gf("data.form.jshj"),
            se = 0,
            bhsj = 0
        if (parseFloat(jshjxx) && parseFloat(zbslv) > -1) {
            bhsj = jshjxx / (1 + zbslv)
            se = jshjxx - bhsj
        }
        //console.log(slListNew.find(f => f.slv == zbslv));
        this.metaAction.sfs({
            "data.slList": fromJS(slListNew),
            "data.form.jsfsDm": v,
            "data.form.zbslv": slListNew.find(f => f.slv == zbslv) ? zbslv : undefined,
            "data.form.hjse": !isNaN(zbslv) && !isNaN(jshjxx) ? se.toFixed(2) : undefined,
            "data.form.hjje": !isNaN(zbslv) && !isNaN(jshjxx) ? bhsj.toFixed(2) : undefined,
            "data.error.zbslv": "",
            "data.error.jsfsDm": "",
        })
        let obj = {
            zbslv: slListNew.find(f => f.slv == zbslv) ? zbslv : undefined,
        }
        this.commonRef.setFieldsValue(obj)
    }

    // 表头购买方销售方数据
    getGroupData() {
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? "XGMZZS" : "YBNSRZZS" // 2000010001一般企业 2000010002 小规模企业
        const {
                gfmc,
                gfsbh,
                gfyhzh,
                gfdzdh,
                xfmc,
                xfsbh,
                xfyhzh,
                xfdzdh,
                fplyLx,
                sf02,
            } = this.metaAction.gf("data.form").toJS(),
            error = this.metaAction.gf("data.error").toJS()
        const { fpzlDm, fplx, readOnly } = this.component.props
        let gfFlag = false,
            xfFlag = false,
            gfsbhFlag = true
        if (fplx === "xxfp" || readOnly == true || fplyLx != 2) {
            xfFlag = true
        }
        if (fplx === "jxfp" || readOnly == true || fplyLx != 2) {
            gfFlag = true
        }
        if (fpzlDm == "03" || fpzlDm == "05" || fpzlDm == "09") gfsbhFlag = false
        let arr = [
            {
                title: "购买方",
                subItem: [
                    {
                        key: "gfmc",
                        value: gfmc,
                        className: gfFlag ? "bcgar" : "",
                        disabled: gfFlag,
                        label: "名称",
                        required: fpzlDm == "09" ? false : true,
                        errMsg: fpzlDm == "09" ? "" : error.gfmc,
                        placement: "left",
                        onChange: () => {
                            this.metaAction.sf("data.error.gfmc", "")
                        },
                    },
                    {
                        key: "gfsbh",
                        label: fpzlDm === "03" ? "身份证/机构码/购方识别号" : "纳税人识别号",
                        required:
                            fplx === "xxfp" || fpzlDm == "03" || fpzlDm == "05" || fpzlDm == "09"
                                ? false
                                : true,
                        disabled: gfFlag,
                        maxLength: 50,
                        className: gfFlag ? "bcgar" : "",
                        value: gfsbh,
                        errMsg:
                            fpzlDm == "03" || fpzlDm == "05" || fpzlDm == "09" ? "" : error.gfsbh,
                        placement: "left",
                        onChange: () => {
                            this.metaAction.sf("data.error.gfsbh", "")
                        },
                    },
                    {
                        key: "gfdzdh",
                        label: "地址、电话",
                        disabled: gfFlag,
                        //required: true,
                        className: gfFlag ? "bcgar" : "",
                        value: gfdzdh,
                    },
                    {
                        key: "gfyhzh",
                        label: "开户行及账号",
                        disabled: gfFlag,
                        className: gfFlag ? "bcgar" : "",
                        //required: true,
                        value: gfyhzh,
                        car: true,
                    },
                ],
            },
            {
                title: "销售方",
                subItem: [
                    {
                        key: "xfmc",
                        label: "名称",
                        disabled: xfFlag,
                        className: xfFlag ? "bcgar" : "",
                        required: true,
                        value: xfmc,
                        errMsg: error.xfmc,
                        placement: "left",
                        onChange: () => {
                            this.metaAction.sf("data.error.xfmc", "")
                        },
                    },
                    {
                        className: xfFlag ? "bcgar" : "",
                        key: "xfsbh",
                        label: "纳税人识别号",
                        disabled: xfFlag,
                        required: fplx === "jxfp" || fpzlDm == "09" ? false : true,
                        value: xfsbh,
                        maxLength: 50,
                        errMsg: fpzlDm == "09" ? "" : error.xfsbh,
                        placement: "left",
                        onChange: () => {
                            this.metaAction.sf("data.error.xfsbh", "")
                        },
                    },
                    {
                        className: xfFlag ? "bcgar" : "",
                        key: "xfdzdh",
                        label: "地址、电话",
                        disabled: xfFlag,
                        value: xfdzdh,
                    },
                    {
                        className: xfFlag ? "bcgar" : "",
                        key: "xfyhzh",
                        label: "开户行及账号",
                        disabled: xfFlag,
                        //required: true,
                        value: xfyhzh,
                        car: true,
                        adjustHeight: true,
                    },
                ],
            },
        ]
        // if(fpzlDm === '07' || nsrxz !=='YBNSRZZS'){
        //     arr.forEach((item)=>{
        //         item.subItem = item.subItem.filter((i)=>i.car !== true)
        //     })
        // }
        return arr
    }
    getCommonData() {
        let {
            jsfs,
            bz,
            zf,
            kpr,
            je,
            bdzt,
            bdlyLx,
            dkyf,
            nf06,
            oldNf06,
            fpfs,
            gfmc,
            gfsbh,
            sf01,
            sf02,
            swjgDm,
            swjgMc,
            fplyLx,
            fpztDm,
            nsrmc,
            nsrsbh,
        } = this.metaAction.gf("data.form").toJS()
        const { fpzlDm, fplx, readOnly } = this.component.props,
            error = this.metaAction.gf("data.error").toJS()
        optionList.sbytcsList.forEach(item => {
            item.name = item.sbytMc
            item.value = item.sbytDm
        })
        let dlsbflag = false
        if (fplyLx != 2) {
            dlsbflag = true
        }
        let dkyfRender = this.dkyfRender() || []
        let bzwith = "6%"
        if (fpzlDm === "13" || fpzlDm === "12") bzwith = "17.1%"
        let nsqj = this.component.props.nsqj
        let fpskssq = this.metaAction.gf("data.form.skssq")
        if (Number(fpskssq) > moment(nsqj).format("YYYYMM")) {
            // 税款所属期只能选最大的那个值
            dkyf = moment(fpskssq).format("YYYYMM")
            dkyf = dkyf.substring(0, 6)
        }
        let kjxh = this.component.props.kjxh
        if (kjxh || fplyLx != 2) {
            nf06 = oldNf06
        }
        if (fplx === "xxfp") {
            let arr = [
                [
                    {
                        key: "bz",
                        value: bz,
                        label: "备注",
                        disabled: readOnly,
                        className: readOnly ? "bcgar" : "",
                        labelWidth: "6%",
                        controlWidth: "64%",
                        type: "input",
                    },
                    {
                        key: "kpr",
                        value: kpr,
                        label: "开票人",
                        disabled: readOnly,
                        className: readOnly ? "bcgar" : "",
                        //required: true,
                        type: "input",
                        labelWidth: "10%",
                        controlWidth: "10%",
                    },
                    {
                        key: "fpztDm",
                        value: fpztDm,
                        label: "作废",
                        // required: true,
                        disabled: readOnly,
                        className: readOnly ? "bcgar" : "",
                        type: "select",
                        labelWidth: "5%",
                        controlWidth: "5%",
                        option: jsfsOptions,
                    },
                ],
            ]
            if (fpzlDm === "05") {
                arr[0].push({
                    key: "fpfs",
                    value: fpfs,
                    label: "开票张数",
                    required: true,
                    errMsg: error.fpfs,
                    type: "input",
                    labelWidth: "8%",
                    controlWidth: "5%",
                    onChange: () => {
                        this.metaAction.sf("data.error.fpfs", "")
                    },
                })
            } else if (fpzlDm === "09" || fpzlDm === "08") {
                arr[0].splice(2, 3)
            }
            return arr
        }
        if (fplx === "jxfp") {
            /// 区分一般纳税人和小规模 小规模没有认证栏
            let bdFlag = this.metaAction.gf("data.form.bdzt")
            let arr = [
                [
                    {
                        key: "bz",
                        value: bz,
                        label: "备注",
                        labelWidth: bzwith,
                        //controlWidth: '74%',
                        disabled: this.component.props.justShow,
                        type: "input",
                    },
                    {
                        key: "kpr",
                        value: kpr,
                        label: "开票人",
                        type: "input",
                        labelWidth: "10%",
                        controlWidth: "10%",
                        disabled: this.component.props.justShow,
                    },
                ],
                [
                    {
                        key: "bdzt",
                        value: bdzt != 0 ? true : false,
                        required: true,
                        label: "认证状态",
                        labelWidth: "17.1%",
                        controlWidth: "10%",
                        type: "checkbox",
                        checkBoxLabel: "已认证",
                        disabled: readOnly,
                        className: readOnly ? "bcgar" : "",
                        onChange: e => {
                            this.bdztChange(e)
                        },
                    },
                    {
                        key: "bdlyLx",
                        value: bdzt != 0 ? bdlyLx : undefined,
                        label: "申报用途",
                        disabled: bdzt != 0 && !this.component.props.justShow ? false : true,
                        required: bdFlag,
                        type: "select",
                        labelWidth: "12%",
                        onChange: e => {
                            this.bdlyLxChange(e)
                        },
                        option: optionList.sbytcsList,
                        className: readOnly ? "bcgar" : "",
                    },
                    {
                        key: "dkyf",
                        value: bdzt != 0 && bdlyLx === "1" ? dkyf : undefined,
                        label: "抵扣月份",
                        disabled: this.notAllowEditDkyf(),
                        required: !this.notAllowEditDkyf(),
                        type: "select",
                        labelWidth: "12%",
                        controlWidth: "12%",
                        option: dkyfRender,
                        className: readOnly ? "bcgar" : "",
                    },
                    {
                        key: "nf06",
                        value: nf06 || undefined,
                        label: "有效税额",
                        disabled: this.notAllowEditDkyf(),
                        labelWidth: "10%",
                        controlWidth: "10%",
                        type: "input",
                        className: readOnly ? "bcgar" : "",
                        errMsg: error.nf06,
                        required: !this.notAllowEditDkyf(),
                        normalize: (value, prevValue, allValues) => {
                            if (!value) {
                                return value
                            }
                            if (String(value).match(/^[0-9||.||-]*$/)) {
                                return value
                            } else {
                                return prevValue
                            }
                        },
                    },
                ],
            ]
            if (fpzlDm === "13") {
                let a = [
                        {
                            key: "gfmc",
                            value: gfmc,
                            required: true,
                            label: "购方名称",
                            disabled: true,
                            labelWidth: "17.1%",
                            //controlWidth: '74%',
                            type: "input",
                        },
                        {
                            key: "gfsbh",
                            value: gfsbh,
                            required: true,
                            disabled: true,
                            label: "购方识别号",
                            type: "input",
                            labelWidth: "17.1%",
                            //controlWidth: '10%',
                        },
                    ],
                    b = [
                        {
                            key: "sf01",
                            value: sf01 === "Y" ? "" : sf01,
                            label: "进口口岸代码",
                            labelWidth: "17.1%",
                            //controlWidth: '74%',
                            type: "input",
                        },
                        {
                            key: "sf02",
                            value: sf02,
                            label: "进口口岸名称",
                            type: "input",
                            labelWidth: "17.1%",
                            //controlWidth: '10%',
                        },
                    ]
                arr.splice(0, 0, a, b)
            }
            if (fpzlDm === "14") {
                arr[1][0].disabled = true
            }
            if (fpzlDm === "12") {
                let a = [
                        {
                            key: "gfsbh",
                            value: gfsbh,
                            required: true,
                            label: "扣缴义务人识别号",
                            disabled: true,
                            labelWidth: "17.1%",
                            //controlWidth: '74%',
                            type: "input",
                        },
                        {
                            key: "gfmc",
                            value: gfmc,
                            required: true,
                            disabled: true,
                            label: "扣缴义务人名称",
                            type: "input",
                            labelWidth: "17.1%",
                            //controlWidth: '10%',
                        },
                    ],
                    b = [
                        {
                            key: "sf01",
                            value: sf01,
                            disabled: dlsbflag,
                            label: "纳税人识别号",
                            type: "input",
                            labelWidth: "17.1%",
                            //controlWidth: '10%',
                        },
                        {
                            key: "sf02",
                            value: sf02,
                            label: "纳税人识别名称",
                            disabled: dlsbflag,
                            labelWidth: "17.1%",
                            //controlWidth: '74%',
                            type: "input",
                        },
                    ],
                    c = [
                        {
                            key: "swjgDm",
                            value: swjgDm,
                            label: "税务机关代码",
                            disabled: dlsbflag,
                            labelWidth: "17.1%",
                            //controlWidth: '74%',
                            type: "input",
                            maxLength: 12,
                            normalize: (value, prevValue, allValues) => {
                                if (!value) {
                                    return value
                                }
                                if (String(value).match(/^[0-9a-zA-Z]*$/g)) {
                                    return value
                                } else {
                                    return prevValue
                                }
                            },
                        },
                        {
                            key: "swjgMc",
                            value: swjgMc,
                            disabled: dlsbflag,
                            label: "税务机关名称",
                            type: "input",
                            labelWidth: "17.1%",
                            //controlWidth: '10%',
                        },
                    ]
                arr.splice(0, 0, a, b, c)
            }
            if (fpzlDm === "18") {
                let a = [
                    {
                        key: "gfmc",
                        value: gfmc,
                        required: true,
                        label: "纳税人名称",
                        disabled: true,
                        labelWidth: "17.1%",
                        //controlWidth: '74%',
                        type: "input",
                    },
                    {
                        key: "gfsbh",
                        value: gfsbh,
                        required: true,
                        disabled: true,
                        label: "纳税人识别号",
                        type: "input",
                        labelWidth: "17.1%",
                        //controlWidth: '10%',
                    },
                ]
                arr.splice(0, 0, a)
                arr[1][0].labelWidth = "17.1%"
                arr[2][0].disabled = true
            }

            if (this.notXaoGuiMo() != true || fpzlDm === "99" || fpzlDm === "04") {
                arr.pop()
                return arr
            } else {
                return arr
            }
        }
    }

    // 机动车
    getCarCommonData() {
        const nsrxz =
            this.metaAction.context.get("currentOrg") &&
            this.metaAction.context.get("currentOrg").swVatTaxpayer == 2000010002
                ? "XGMZZS"
                : "YBNSRZZS"
        let {
            fplyLx,
            jsfs,
            bz,
            zf,
            kpr,
            swjgMc,
            je,
            bdzt,
            bdlyLx,
            dkyf,
            nf06,
            jshj,
            jshjDx,
            zbslv,
            hjse,
            jzjtDm,
            cllx,
            hjje,
            wspzhm,
            xcrs,
            cd,
            cpxh,
            sf07,
            hgzs,
            jkzmsh,
            sjdh,
            fdjhm,
            cjhm,
            swjgDm,
            jsfsDm,
            fpztDm,
        } = this.metaAction.gf("data.form").toJS()
        const { slList, jsfsList } = this.metaAction.gf("data").toJS() || [],
            error = this.metaAction.gf("data.error").toJS()
        const { fpzlDm, fplx, readOnly } = this.component.props
        let dlsbflag = false
        if (fplyLx != 2 || readOnly === true) {
            dlsbflag = true
        }
        let bdFlag = this.metaAction.gf("data.form.bdzt")
        optionList.sbytcsList.forEach(item => {
            item.name = item.sbytMc
            item.value = item.sbytDm
        })
        if (jsfsList.length != 0) {
            jsfsList.forEach(item => {
                item.value = item.jsfsDm
                item.name = item.jsfsMc
            })
        }
        if (slList.length !== 0) {
            slList.forEach(item => {
                item.value = item.slv
                item.name = item.slvMc
            })
        }
        let dkyfRender = this.dkyfRender() || []
        let nsqj = this.component.props.nsqj
        let fpskssq = this.metaAction.gf("data.form.skssq")
        if (Number(fpskssq) > moment(nsqj).format("YYYYMM")) {
            dkyf = moment(fpskssq).format("YYYYMM")
            dkyf = dkyf.substring(0, 6)
        }
        let arr = [
            [
                {
                    key: "bz",
                    value: bz,
                    label: "备注",
                    disabled: readOnly,
                    className: readOnly ? "bcgar" : "",
                    labelWidth: "12%",
                    type: "input",
                },
                {
                    key: "kpr",
                    value: kpr,
                    label: "开票人",
                    disabled: readOnly,
                    className: readOnly ? "bcgar" : "",
                    type: "input",
                    labelWidth: "12%",
                    controlWidth: "13%",
                },
            ],
            [
                {
                    key: "bdzt",
                    value: bdzt != 0 ? true : false,
                    required: true,
                    label: "认证状态",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    type: "checkbox",
                    checkBoxLabel: "已认证",
                    disabled: readOnly,
                    className: readOnly ? "bcgar" : "",
                    onChange: e => {
                        this.bdztChange(e)
                    },
                },
                {
                    key: "bdlyLx",
                    value: bdzt != 0 ? bdlyLx : undefined,
                    label: "申报用途",
                    disabled: bdzt != 0 && !this.component.props.justShow ? false : true,
                    required: bdFlag,
                    type: "select",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    onChange: e => {
                        this.bdlyLxChange(e)
                    },
                    option: optionList.sbytcsList,
                },
                {
                    key: "dkyf",
                    value: bdzt != 0 && bdlyLx === "1" ? dkyf : undefined,
                    label: "抵扣月份",
                    disabled: this.notAllowEditDkyf(),
                    required: !this.notAllowEditDkyf(),
                    type: "select",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    option: dkyfRender,
                    className: readOnly ? "bcgar" : "",
                },
                {
                    key: "nf06",
                    value: nf06 || undefined,
                    label: "有效税额",
                    disabled: this.notAllowEditDkyf(),
                    labelWidth: "12%",
                    controlWidth: "13%",
                    type: "input",
                    className: readOnly ? "bcgar" : "",
                    errMsg: error.nf06,
                    required: !this.notAllowEditDkyf(),
                    normalize: (value, prevValue, allValues) => {
                        if (!value) {
                            return value
                        }
                        if (String(value).match(/^[0-9||.||-]*$/)) {
                            return value
                        } else {
                            return prevValue
                        }
                    },
                },
            ],
            [
                {
                    key: "jshj",
                    value: isNaN(Number(jshj).toFixed(2)) ? undefined : Number(jshj).toFixed(2),
                    label: "价税合计（小写）",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    type: "input",
                    errMsg: error.jshj,
                    placement: "left",
                    required: true,
                    onFocus: () => {
                        this.commonRef.setFieldsValue({
                            jshj: parseFloat(this.metaAction.gf("data.form.jshj")),
                        })
                    },
                    onBlur: () => {
                        this.commonRef.setFieldsValue({
                            jshj: this.metaAction.gf("data.form.jshj"),
                        })
                    },
                    disabled: dlsbflag,
                    className: dlsbflag ? "bcgar" : "",
                    onChange: () => {},
                    normalize: (value, prevValue, allValues) => {
                        if (value == "") {
                            return value
                        }
                        if (String(value).match(/^[0-9||.||-]*$/)) {
                            this.amountChange(value)
                            return value
                        } else {
                            return prevValue
                        }
                    },
                },
                {
                    key: "jshjDx",
                    value: jshjDx,
                    label: "价税合计（大写）",
                    type: "input",
                    labelWidth: "12%",
                    disabled: true,
                },
            ],
            [
                {
                    key: "zbslv",
                    value: zbslv,
                    label: "税率",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    type: "select",
                    required: true,
                    option: slList,
                    errMsg: error.zbslv,
                    onChange: v => this.taxRateChange(v),
                    disabled: dlsbflag,
                    placement: "left",
                    className: dlsbflag ? "bcgar" : "",
                },
                {
                    key: "hjse",
                    value: hjse,
                    label: "税额",
                    type: "input",
                    labelWidth: "12%",
                    errMsg: error.se,
                    required: true,
                    disabled: true,
                    className: dlsbflag ? "bcgar" : "",
                },
                {
                    key: "jzjtDm",
                    value: jzjtDm,
                    label: "即征即退",
                    type: "select",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    option: jzjtDmList,
                    className: readOnly ? "bcgar" : "",
                    disabled: readOnly,
                },
            ],
            [
                {
                    key: "cllx",
                    value: cllx,
                    label: "车辆类型",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    required: true,
                    type: "input",
                    errMsg: error.cllx,
                    className: dlsbflag ? "bcgar" : "",
                    onChange: () => {
                        this.metaAction.sf("data.error.cllx", "")
                    },
                    placement: "left",
                    disabled: dlsbflag,
                },
                {
                    key: "hjje",
                    value: isNaN(Number(hjje).toFixed(2)) ? undefined : Number(hjje).toFixed(2),
                    label: "不含税价",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    type: "input",
                    className: dlsbflag ? "bcgar" : "",
                    disabled: true,
                },
                {
                    key: "wspzhm",
                    value: wspzhm,
                    label: "完税凭证号码",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    type: "input",
                    className: dlsbflag ? "bcgar" : "",
                    disabled: dlsbflag,
                },
                {
                    key: "xcrs",
                    value: xcrs,
                    label: "限乘人数",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    type: "input",
                    className: dlsbflag ? "bcgar" : "",
                    disabled: dlsbflag,
                },
            ],
            [
                {
                    key: "cd",
                    value: cd,
                    label: "产地",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    type: "input",
                    className: dlsbflag ? "bcgar" : "",
                    disabled: dlsbflag,
                },
                {
                    key: "cpxh",
                    value: cpxh,
                    label: "厂牌型号",
                    type: "input",
                    labelWidth: "12%",
                    className: dlsbflag ? "bcgar" : "",
                    disabled: dlsbflag,
                },
                {
                    key: "sf07",
                    value: sf07,
                    label: "吨位",
                    type: "input",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    className: dlsbflag ? "bcgar" : "",
                    disabled: dlsbflag,
                },
            ],
            [
                {
                    key: "hgzs",
                    value: hgzs,
                    label: "合格证号",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    type: "input",
                    className: dlsbflag ? "bcgar" : "",
                    disabled: dlsbflag,
                },
                {
                    key: "jkzmsh",
                    value: jkzmsh,
                    label: "进口证明书号",
                    type: "input",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    className: dlsbflag ? "bcgar" : "",
                    //disabled:true
                    disabled: dlsbflag,
                },
                {
                    key: "sjdh",
                    value: sjdh,
                    label: "商检单号",
                    type: "input",
                    labelWidth: "12%",
                    className: dlsbflag ? "bcgar" : "",
                    disabled: dlsbflag,
                },
            ],
            [
                {
                    key: "fdjhm",
                    value: fdjhm,
                    label: "发动机号码",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    type: "input",
                    className: dlsbflag ? "bcgar" : "",
                    disabled: dlsbflag,
                },
                {
                    key: "cjhm",
                    value: cjhm,
                    label: "车辆识别号/车架号码",
                    type: "input",
                    labelWidth: "12%",
                    //controlWidth: '13%',
                    className: dlsbflag ? "bcgar" : "",

                    disabled: dlsbflag,
                    //disabled:true
                },
                {
                    key: "swjgMc",
                    value: swjgMc,
                    label: "税务机关",
                    type: "input",
                    labelWidth: "12%",
                    className: dlsbflag ? "bcgar" : "",
                    disabled: dlsbflag,
                },
            ],
        ] // 默认信息为进项一般纳税人
        if (fplx === "jxfp") {
            if (nsrxz === "XGMZZS") {
                delete arr[1]
            }
        } else if (fplx === "xxfp") {
            if (nsrxz === "XGMZZS") {
                // 小规模默认方式为简易征收
                jsfsDm = jsfsDm ? jsfsDm : "1"
            }
            if (nsrxz === "YBNSRZZS") {
                // 一般纳税人默认方式为一般计税
                jsfsDm = jsfsDm ? jsfsDm : "0"
            }
            delete arr[1]
            arr[0].push({
                key: "fpztDm",
                value: fpztDm,
                label: "作废",
                // required: true,
                disabled: readOnly,
                className: readOnly ? "bcgar" : "",
                type: "select",
                labelWidth: "12%",
                controlWidth: "13%",
                option: jsfsOptions,
            })
            arr[3].splice(2, 0, {
                key: "jsfsDm",
                value: jsfsDm,
                label: "计税方式",
                type: "select",
                labelWidth: "12%",
                controlWidth: "13%",
                required: true,
                option: jsfsList,
                className: readOnly ? "bcgar" : "",
                onChange: v => this.jsfsDmChange(v),
                disabled: dlsbflag,
            })
        }
        return arr
    }
    //二手车
    getershouCarGroupData() {
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? "XGMZZS" : "YBNSRZZS" // 2000010001一般企业 2000010002 小规模企业
        const {
                gfmc,
                gfsbh,
                gfyhzh,
                gfdzdh,
                xfmc,
                xfsbh,
                xfyhzh,
                xfdzdh,
                fplyLx,
            } = this.metaAction.gf("data.form").toJS(),
            error = this.metaAction.gf("data.error").toJS()
        const { fpzlDm, fplx, readOnly } = this.component.props
        let gfFlag = false,
            xfFlag = false
        if (fplx === "xxfp" || readOnly == true || fplyLx != 2) {
            xfFlag = true
        }
        if (fplx === "jxfp" || readOnly == true || fplyLx != 2) {
            gfFlag = true
        }
        let arr = [
            {
                title: "购买方",
                subItem: [
                    {
                        key: "gfmc",
                        value: gfmc,
                        disabled: gfFlag,
                        label: "名称",
                        required: true,
                        errMsg: error.gfmc,
                        placement: "left",
                        onChange: () => {
                            this.metaAction.sf("data.error.gfmc", "")
                        },
                    },
                    {
                        key: "gfsbh",
                        label: "单位代码/身份证",
                        required: true,
                        disabled: gfFlag,
                        value: gfsbh,
                        errMsg: error.gfsbh,
                        placement: "left",
                        onChange: () => {
                            this.metaAction.sf("data.error.gfsbh", "")
                        },
                    },
                    {
                        key: "gfyhzh",
                        label: "地址、电话",
                        disabled: gfFlag,
                        //required: true,
                        value: gfyhzh,
                        onChange: e => {
                            console.log(e)
                        },
                    },
                ],
            },
            {
                title: "销售方",
                subItem: [
                    {
                        key: "xfmc",
                        label: "名称",
                        disabled: xfFlag,
                        required: true,
                        value: xfmc,
                        errMsg: error.xfmc,
                        placement: "left",
                        onChange: () => {
                            this.metaAction.sf("data.error.xfmc", "")
                        },
                    },
                    {
                        key: "xfsbh",
                        label: "单位代码/身份证",
                        disabled: xfFlag,
                        required: true,
                        value: xfsbh,
                        errMsg: error.xfsbh,
                        placement: "left",
                        onChange: () => {
                            this.metaAction.sf("data.error.xfsbh", "")
                        },
                    },
                    {
                        key: "xfyhzh",
                        label: "地址、电话",
                        disabled: xfFlag,
                        value: xfyhzh,
                    },
                ],
            },
        ]
        return arr
    }
    getershouCarCommonData() {
        const nsrxz =
            this.metaAction.context.get("currentOrg") &&
            this.metaAction.context.get("currentOrg").swVatTaxpayer == 2000010002
                ? "XGMZZS"
                : "YBNSRZZS"
        let {
            fplyLx,
            jsfs,
            bz,
            zf,
            kpr,
            je,
            bdzt,
            fpztDm,
            dkyf,
            nf06,
            jshj,
            jshjDx,
            zbslv,
            hjse,
            jzjtDm,
            cllx,
            hjje,
            wspzhm,
            xcrs,
            cd,
            cpxh,
            sf07,
            hgzs,
            jkzmsh,
            sjdh,
            fdjhm,
            cjhm,
            jsfsDm,
        } = this.metaAction.gf("data.form").toJS()
        const { slList, jsfsList } = this.metaAction.gf("data").toJS() || [],
            error = this.metaAction.gf("data.error").toJS()
        const { fpzlDm, fplx, readOnly } = this.component.props
        if (nsrxz === "XGMZZS") {
            // 小规模默认方式为简易征收
            jsfsDm = jsfsDm ? jsfsDm : "1"
        }
        if (nsrxz === "YBNSRZZS") {
            // 一般纳税人默认方式为一般计税
            jsfsDm = jsfsDm ? jsfsDm : "0"
        }
        let dlsbflag = false
        if (fplyLx != 2 || readOnly === true) {
            dlsbflag = true
        }
        optionList.sbytcsList.forEach(item => {
            item.name = item.sbytMc
            item.value = item.sbytDm
        })
        if (slList.length != 0) {
            slList.forEach(item => {
                item.value = item.slv
                item.name = item.slvMc
            })
        }
        if (jsfsList.length != 0) {
            jsfsList.forEach(item => {
                item.value = item.jsfsDm
                item.name = item.jsfsMc
            })
        }
        let jxarr = [
            [
                {
                    key: "bz",
                    value: bz,
                    label: "备注",
                    labelWidth: "12%",
                    type: "input",
                    disabled: dlsbflag,
                },
                {
                    key: "kpr",
                    value: kpr,
                    label: "开票人",
                    type: "input",
                    labelWidth: "12%",
                    controlWidth: "13%",
                    disabled: dlsbflag,
                },
            ],
            [
                {
                    key: "jshj",
                    value: jshj,
                    label: "价税合计（小写）",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    type: "input",
                    errMsg: error.jshj,
                    required: true,
                    disabled: dlsbflag,
                    onFocus: () => {
                        this.commonRef.setFieldsValue({
                            jshj: parseFloat(this.metaAction.gf("data.form.jshj")),
                        })
                    },
                    onBlur: () => {
                        this.commonRef.setFieldsValue({
                            jshj: this.metaAction.gf("data.form.jshj"),
                        })
                    },
                    normalize: (value, prevValue, allValues) => {
                        if (value == "") {
                            return value
                        }
                        if (String(value).match(/^[0-9||.||-]*$/)) {
                            this.amountChange(value)
                            return value
                        } else {
                            return prevValue
                        }
                    },
                },
                {
                    key: "jshjDx",
                    value: jshjDx,
                    label: "价税合计（大写）",
                    type: "input",
                    labelWidth: "15%",
                    disabled: true,
                },
            ],
            [
                {
                    key: "cllx",
                    value: cllx,
                    label: "车辆类型",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    required: true,
                    type: "input",
                    errMsg: error.cllx,
                    disabled: dlsbflag,
                    onChange: () => {
                        this.metaAction.sf("data.error.cllx", "")
                    },
                },
                {
                    key: "hjje",
                    value: hjje,
                    label: "不含税金额",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    type: "input",
                    disabled: true,
                },
                {
                    key: "jzjtDm",
                    value: jzjtDm,
                    label: "即征即退",
                    type: "select",
                    labelWidth: "15%",
                    //controlWidth: '15%',
                    option: jzjtDmList,
                    disabled: readOnly,
                },
            ],
            [
                {
                    key: "wspzhm",
                    value: wspzhm,
                    label: "车牌照号",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    type: "input",
                    disabled: dlsbflag,
                },
                {
                    key: "cjhm",
                    value: cjhm,
                    label: "车辆识别代号/车架号码",
                    type: "input",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    disabled: dlsbflag,
                    //disabled:true
                },
                {
                    key: "cpxh",
                    value: cpxh,
                    label: "厂牌型号",
                    type: "input",
                    labelWidth: "15%",
                    disabled: dlsbflag,
                },
            ],
            [
                {
                    key: "hgzs",
                    value: hgzs,
                    label: "登记证号",
                    type: "input",
                    labelWidth: "25%",
                    controlWidth: "25%",
                    disabled: dlsbflag,
                },
                {
                    key: "sjdh",
                    value: sjdh,
                    label: "移入地车管所名称",
                    type: "input",
                    labelWidth: "25%",
                    controlWidth: "25%",
                    disabled: dlsbflag,
                },
            ],
        ]
        let xxarr = [
            [
                {
                    key: "bz",
                    value: bz,
                    label: "备注",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    type: "input",
                    disabled: dlsbflag,
                },
                {
                    key: "kpr",
                    value: kpr,
                    label: "开票人",
                    type: "input",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    disabled: dlsbflag,
                },
                {
                    key: "fpztDm",
                    value: fpztDm,
                    label: "作废",
                    // required: true,
                    type: "select",
                    labelWidth: "15%",
                    //controlWidth: '15%',
                    option: jsfsOptions,
                },
            ],
            [
                {
                    key: "jshj",
                    value: jshj,
                    label: "价税合计（小写）",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    type: "input",
                    errMsg: error.jshj,
                    required: true,
                    disabled: dlsbflag,
                    onFocus: () => {
                        this.commonRef.setFieldsValue({
                            jshj: parseFloat(this.metaAction.gf("data.form.jshj")),
                        })
                    },
                    onBlur: () => {
                        this.commonRef.setFieldsValue({
                            jshj: this.metaAction.gf("data.form.jshj"),
                        })
                    },
                    normalize: (value, prevValue, allValues) => {
                        if (value == "") {
                            return value
                        }
                        if (String(value).match(/^[0-9||.||-]*$/)) {
                            this.amountChange(value)
                            return value
                        } else {
                            return prevValue
                        }
                    },
                },
                {
                    key: "jshjDx",
                    value: jshjDx,
                    label: "价税合计（大写）",
                    type: "input",
                    labelWidth: "15%",
                    disabled: true,
                },
            ],
            [
                {
                    key: "zbslv",
                    value: zbslv,
                    label: "税率",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    type: "select",
                    required: true,
                    option: slList,
                    onChange: v => this.taxRateChange(v),
                    disabled: dlsbflag,
                },
                {
                    key: "hjse",
                    value: hjse,
                    label: "税额",
                    type: "input",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    errMsg: error.se,
                    required: true,
                    disabled: true,
                },
                {
                    key: "jzjtDm",
                    value: jzjtDm,
                    label: "即征即退",
                    type: "select",
                    labelWidth: "15%",
                    option: jzjtDmList,
                    disabled: readOnly,
                },
            ],
            [
                {
                    key: "cllx",
                    value: cllx,
                    label: "车辆类型",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    required: true,
                    type: "input",
                    errMsg: error.cllx,
                    disabled: dlsbflag,
                    onChange: () => {
                        this.metaAction.sf("data.error.cllx", "")
                    },
                },
                {
                    key: "hjje",
                    value: hjje,
                    label: "不含税价",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    disabled: true,
                    type: "input",
                },
                {
                    key: "jsfsDm",
                    value: jsfsDm,
                    label: "计税方式",
                    type: "select",
                    labelWidth: "15%",
                    //controlWidth: '15%',
                    required: true,
                    option: jsfsList,
                    onChange: v => this.jsfsDmChange(v),
                    disabled: dlsbflag,
                },
            ],
            [
                {
                    key: "wspzhm",
                    value: wspzhm,
                    label: "车牌照号",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    type: "input",
                    disabled: dlsbflag,
                },
                {
                    key: "cjhm",
                    value: cjhm,
                    label: "车辆识别代号/车架号码",
                    type: "input",
                    labelWidth: "15%",
                    controlWidth: "15%",
                    disabled: dlsbflag,
                    //disabled:true
                },
                {
                    key: "cpxh",
                    value: cpxh,
                    label: "厂牌型号",
                    type: "input",
                    labelWidth: "15%",
                    disabled: dlsbflag,
                },
            ],
            [
                {
                    key: "hgzs",
                    value: hgzs,
                    label: "登记证号",
                    type: "input",
                    labelWidth: "25%",
                    controlWidth: "25%",
                    disabled: dlsbflag,
                },
                {
                    key: "sjdh",
                    value: sjdh,
                    label: "移入地车管所名称",
                    type: "input",
                    labelWidth: "25%",
                    controlWidth: "25%",
                    disabled: dlsbflag,
                },
            ],
        ]
        if (fplx === "xxfp") {
            return xxarr
        } else if (fplx === "jxfp") {
            return jxarr
        }
    }
    getershouCarGroupDataFooter() {
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? "XGMZZS" : "YBNSRZZS" // 2000010001一般企业 2000010002 小规模企业
        let { sf01, sf02, sf05, sf06, sf07, sf08, sf09, sf10, fplyLx } = this.metaAction
                .gf("data.form")
                .toJS(),
            error = this.metaAction.gf("data.error").toJS()
        if (sf01 === "N") sf01 = ""
        const { fpzlDm, fplx, readOnly } = this.component.props
        let gfFlag = false,
            xfFlag = false
        if (readOnly == true || fplyLx != 2) {
            xfFlag = true
        }
        if (readOnly == true || fplyLx != 2) {
            gfFlag = true
        }
        let arr = [
            {
                title: "经营拍卖单位",
                subItem: [
                    {
                        key: "sf01",
                        value: sf01,
                        disabled: gfFlag,
                        label: "名称",
                    },
                    {
                        key: "sf02",
                        label: "纳税人识别号",
                        disabled: gfFlag,
                        value: sf02,
                    },
                    {
                        key: "sf05",
                        label: "地址、电话",
                        disabled: gfFlag,
                        value: sf05,
                    },
                    {
                        key: "sf06",
                        label: "银行账号",
                        disabled: gfFlag,
                        value: sf06,
                        car: true,
                    },
                ],
            },
            {
                title: "二手车市场",
                subItem: [
                    {
                        key: "sf07",
                        label: "名称",
                        disabled: xfFlag,
                        value: sf07,
                    },
                    {
                        key: "sf08",
                        label: "纳税人识别号",
                        disabled: xfFlag,
                        value: sf08,
                    },
                    {
                        key: "sf09",
                        label: "地址",
                        disabled: xfFlag,
                        value: sf09,
                    },
                    {
                        key: "sf10",
                        label: "银行账号",
                        disabled: xfFlag,
                        value: sf10,
                        car: true,
                        adjustHeight: true,
                    },
                ],
            },
        ]
        return arr
    }

    rendeInvoices = () => {
        const nsrxz =
            this.metaAction.context.get("currentOrg") &&
            this.metaAction.context.get("currentOrg").swVatTaxpayer == 2000010002
                ? "XGMZZS"
                : "YBNSRZZS"
        const { form, error, justShow } = this.metaAction.gf("data").toJS(),
            { id, fplx, fpzlDm } = this.component.props,
            width = document.body.clientWidth - 50 || 1000
        let tableFlag = true,
            fpdmlengs = true,
            jiaokuanFlag = false,
            fphmMaxLength = 8
        let readOnly = this.component.props.readOnly
        let dmxinxing = true,
            noFpdm = true,
            noGxXX = true
        if (fpzlDm === "12") fphmMaxLength = 50
        if (fpzlDm === "13") fphmMaxLength = 22
        if (fpzlDm === "05" || fpzlDm === "09" || fpzlDm === "99" || fpzlDm === "18")
            fphmMaxLength = 12
        if (fpzlDm === "03" || fpzlDm === "07") {
            // 机动车二手车不需要用到表格
            tableFlag = false //tableFlag为false的时候 呈现出来的是二手车和机动车的数据
        }
        if (fpzlDm === "07" || fpzlDm === "04" || fpzlDm === "03" || fpzlDm === "14") {
            fpdmlengs = false
        }
        if (fpzlDm === "05" || fpzlDm === "09" || fpzlDm === "99") {
            dmxinxing = false
        }
        // 以下票种不需要发票代码字段
        if (fpzlDm === "08" || fpzlDm === "12" || fpzlDm === "13" || fpzlDm === "18") {
            noFpdm = false
        }
        // 以下票种不需要用到购销信息
        if (fpzlDm === "08" || fpzlDm === "12" || fpzlDm === "13" || fpzlDm === "18") {
            noGxXX = false
        }

        return (
            <div>
                <div
                    style={{
                        overflow: "auto",
                        maxHeight: `${document.body.clientHeight - 107 - 50}px`,
                    }}>
                    <div className="inv-app-new-invoices-card-head">
                        <div className="inv-app-new-invoices-card-title">
                            <div className="left">
                                <span className="lable">发票属期：</span>
                                <span>{form.skssq}</span>
                            </div>
                            <div className="title">{this.getFpName()}</div>
                            <div className="right"></div>
                        </div>
                        <div className="inv-app-new-invoices-card-invNumber">
                            {noFpdm && (
                                <div>
                                    <span
                                        className={
                                            dmxinxing ? "lable ant-form-item-required" : "lable"
                                        }>
                                        发票代码：
                                    </span>
                                    <span
                                        className={
                                            error.fpdm
                                                ? "-sales-error"
                                                : readOnly
                                                ? "text"
                                                : this.notAllowEdit()
                                                ? "bcgar"
                                                : ""
                                        }>
                                        {!readOnly ? (
                                            <Tooltip
                                                getCalendarContainer={this.handleGetPopupContainer}
                                                overlayClassName="-sales-error-toolTip"
                                                title={error.fpdm}
                                                visible={
                                                    error.fpdm &&
                                                    error.fpdm.indexOf("不能为空") == -1
                                                }
                                                placement="left">
                                                {" "}
                                                <Input
                                                    maxLength={fpdmlengs === true ? 10 : 12}
                                                    placeholder="请输入发票代码"
                                                    value={form.fpdm}
                                                    disabled={this.notAllowEdit("inv")}
                                                    onChange={e => {
                                                        const reg = /^[0-9a-zA-Z]*$/g
                                                        if (reg.test(e.target.value)) {
                                                            this.handleFieldChangeV(
                                                                "data.form.fpdm",
                                                                e.target.value,
                                                                true
                                                            )
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        ) : (
                                            <span>{form.fpdm}</span>
                                        )}
                                    </span>
                                </div>
                            )}
                            <div>
                                <span className="lable ant-form-item-required">
                                    {fpzlDm === "13" || fpzlDm === "12"
                                        ? "缴款书号码："
                                        : "发票号码："}
                                </span>
                                <span
                                    className={
                                        error.fphm
                                            ? "-sales-error"
                                            : readOnly
                                            ? "text"
                                            : this.notAllowEdit()
                                            ? "bcgar"
                                            : ""
                                    }>
                                    {!readOnly ? (
                                        <Tooltip
                                            getCalendarContainer={this.handleGetPopupContainer}
                                            overlayClassName="-sales-error-toolTip"
                                            title={error.fphm}
                                            visible={
                                                error.fphm && error.fphm.indexOf("不能为空") == -1
                                            }
                                            placement="left">
                                            {" "}
                                            <Input
                                                maxLength={fphmMaxLength}
                                                className={
                                                    fpzlDm === "13" || fpzlDm === "12"
                                                        ? "maxInput"
                                                        : ""
                                                }
                                                placeholder={
                                                    fpzlDm === "13" || fpzlDm === "12"
                                                        ? "请输入缴款书号码"
                                                        : "请输入发票号码"
                                                }
                                                disabled={this.notAllowEdit("inv")}
                                                value={form.fphm}
                                                onChange={e => {
                                                    const reg = /^[0-9a-zA-Z-?]*$/g
                                                    if (reg.test(e.target.value)) {
                                                        this.handleFieldChangeV(
                                                            "data.form.fphm",
                                                            e.target.value,
                                                            true
                                                        )
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                    ) : (
                                        <span>{form.fphm}</span>
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="lable ant-form-item-required">开票日期：</span>
                                <span
                                    className={
                                        error.kprq
                                            ? "-sales-error"
                                            : readOnly
                                            ? "text"
                                            : this.notAllowEdit()
                                            ? "bcgar"
                                            : ""
                                    }>
                                    {!readOnly ? (
                                        <Tooltip
                                            getCalendarContainer={this.handleGetPopupContainer}
                                            overlayClassName="-sales-error-toolTip"
                                            title={error.kprq}
                                            visible={
                                                error.kprq && error.kprq.indexOf("不能为空") == -1
                                            }
                                            placement="left">
                                            <DatePicker
                                                //getCalendarContainer={trigger => trigger.parentNode}
                                                defaultPickerValue={this.getDefaultPickerValue()}
                                                disabledDate={this.disabledDate}
                                                style={{ width: "120px" }}
                                                disabled={this.notAllowEdit()}
                                                //style={{width:'100%'}}
                                                value={
                                                    (form.kprq &&
                                                        moment(form.kprq, "YYYY-MM-DD")) ||
                                                    undefined
                                                }
                                                format="YYYY-MM-DD"
                                                onChange={v =>
                                                    this.handleFieldChangeV(
                                                        "data.form.kprq",
                                                        (moment.isMoment(v) &&
                                                            v.format("YYYY-MM-DD")) ||
                                                            v,
                                                        true
                                                    )
                                                }
                                            />
                                        </Tooltip>
                                    ) : (
                                        <span>{form.kprq}</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                    {tableFlag && (
                        <div className="inv-app-new-invoices-card-coms">
                            {noGxXX && (
                                <GroupInfo
                                    ref={ref => (this.ref = ref)}
                                    data={this.getGroupData()}
                                    extendable></GroupInfo>
                            )}
                            <div className={noGxXX ? "" : "inv-app-new-invoices-card-coms-bz"}>
                                <CommonInfo
                                    ref={ref => (this.commonRef = ref)}
                                    data={this.getCommonData()}></CommonInfo>
                            </div>
                        </div>
                    )}
                    {tableFlag && (
                        <div className="inv-app-new-invoices-card-table">
                            <CRUModal
                                ref={ref => (this.tableRef = ref)}
                                height={document.body.clientHeight - 120}
                                width={width}
                                webapi={this.webapi}
                                metaAction={this.metaAction}
                                store={this.component.props.store}
                                id={id}
                                notAllowEdit={this.notAllowEdit()}
                                isReadOnly={readOnly}
                                dataSource={form.mxDetailList}
                                fplyLx={form.fplyLx}
                                nsrxz={nsrxz}
                                optionList={optionList}
                                form={form}
                                fplx={fplx}
                                fpzlDm={fpzlDm}
                                comRef={this.commonRef}
                                nsqj={this.component.props.nsqj}
                            />
                        </div>
                    )}
                    {!tableFlag && (
                        <div
                            className="inv-app-new-invoices-card-coms"
                            style={{ bottom: fpzlDm === "03" ? "0px" : "-2px" }}>
                            {fpzlDm === "03" && (
                                <div style={{ paddingBottom: "20px" }}>
                                    <GroupInfo
                                        ref={ref => (this.ref = ref)}
                                        data={this.getGroupData()}></GroupInfo>
                                    <CommonInfo
                                        ref={ref => (this.commonRef = ref)}
                                        data={this.getCarCommonData()}></CommonInfo>
                                </div>
                            )}
                            {fpzlDm === "07" && (
                                <div style={{ paddingBottom: "20px" }}>
                                    <GroupInfo
                                        ref={ref => (this.ref = ref)}
                                        data={this.getershouCarGroupData()}></GroupInfo>
                                    <CommonInfo
                                        ref={ref => (this.commonRef = ref)}
                                        data={this.getershouCarCommonData()}></CommonInfo>
                                    <div style={{ position: "relative", top: "-1px" }}>
                                        <GroupInfo
                                            ref={ref => (this.refershouche = ref)}
                                            data={this.getershouCarGroupDataFooter()}></GroupInfo>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="inv-app-new-invoices-card-footer">
                    <footer>
                        <span className="left">
                            {form.showDetailListButton === "1" && (
                                <Tooltip
                                    title={
                                        justShow && !form.gfHcfpdm
                                            ? ""
                                            : "录入原正数票的号码，可带入明细清单"
                                    }>
                                    <Button
                                        disabled={justShow && !form.gfHcfpdm}
                                        onClick={() => {
                                            this.redDetail()
                                        }}>
                                        明细清单
                                    </Button>
                                </Tooltip>
                            )}
                        </span>{" "}
                        <span className="right">
                            {!this.component.props.xdzOrgIsStop && (
                                <Button
                                    style={{ marginRight: "8px" }}
                                    type="primary"
                                    onClick={() => {
                                        this.onOk()
                                    }}>
                                    {this.component.props.justShow ? "确定" : "保存"}
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    this.component.props.closeModal({
                                        listNeedLoad: true,
                                        needReload: true,
                                    })
                                }}>
                                取消
                            </Button>
                        </span>
                    </footer>
                </div>
            </div>
        )
    }
}

class CRUModal extends PureComponent {
    constructor(props) {
        super(props)
        this.tableClass = "crum-" + new Date().valueOf()
        this.shortcutsClass = "crum-modal-container" + new Date().valueOf()
        const pX = (props.width > 1920 ? 1920 : props.width) - 60
        const x = pX < minWidth ? minWidth : pX
        const y = props.fpzlDm === "12" || props.fpzlDm === "18" ? 242 : 274 //props.height - 105 - 48
        this.isReadOnly = props.isReadOnly
        this.state = {
            editCellData: {
                dataSource: props.form.mxDetailList,
                count: props.form.mxDetailList.length,
                width: x,
                height: y + 11,
                scroll: { x, y: y - 37 },
                showFullClient: true,
                fluctuateCell: {
                    width: 30,
                    flexGrow: "3%",
                    className:
                        this.props.form.fplyLx != 2 || this.props.isReadOnly === true
                            ? "inv-detail addBc"
                            : "inv-detail",
                },
            },
            errorList: [],
        }

        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}

        props.setOkListener && props.setOkListener(this.onOk)
    }

    componentWillReceiveProps(nextProps, nextContext) {
        // let data = this.state.editCellData.dataSource
        // this.setState({
        //     editCellData:nextProps.dataSource
        // })
        //
    }

    // 表头批设
    handleChangeColumns = (e, path) => {
        if (this.props.isReadOnly === true) return false
        const mxDetailLis = this.props.metaAction.gf("data.form.mxDetailList").toJS()
        mxDetailLis.forEach(item => {
            if (item.rowState === true) {
                item[path] = e
            }
        })
        // editCellData.dataSource = mxDetailLis
        // this.setState({
        //     editCellData
        // })
        this.props.metaAction.sf("data.form.mxDetailList", fromJS(mxDetailLis))
    }

    //底部合计
    summaryRows = () => {
        const colStyle = {
            paddingLeft: "10px",
            borderRight: "1px solid",
        }
        const colStyle2 = {
            paddingLeft: "10px",
        }
        const nonFirstBorder = {
            borderTop: "1px solid",
        }
        let summaryRows = {
            rows: (
                <div className="vt-summary row" style={{ height: 34 * 2 }}>
                    <div
                        style={{
                            width: 270,
                            ...colStyle,
                            textAlign: "center",
                            flex: "27.15%",
                        }}
                        className="strong">
                        合计
                    </div>
                    <div
                        style={{
                            width: 335,
                            ...colStyle,
                            flex: "33.45%",
                            textAlign: "right",
                        }}>
                        {this.amountTotal()}&nbsp;&nbsp;
                    </div>

                    <div
                        style={{
                            width: 185,
                            ...colStyle,
                            flex: "18.15%",
                            textAlign: "right",
                        }}>
                        {this.taxAmountTotal()}&nbsp;&nbsp;
                    </div>
                    <div style={{ width: 210, flex: "21.25%", ...colStyle2 }}></div>

                    <div
                        style={{
                            width: 270,
                            ...colStyle,
                            ...nonFirstBorder,
                            textAlign: "center",
                            flex: "27.15%",
                        }}
                        className="strong">
                        价税合计（大写）
                    </div>
                    <div
                        style={{
                            width: 340,
                            ...colStyle,
                            ...nonFirstBorder,
                            flex: "33.45%",
                            textAlign: "left",
                        }}>
                        {this.moneyToBig(true)}
                    </div>

                    <div
                        style={{
                            width: 180,
                            ...colStyle,
                            ...nonFirstBorder,
                            flex: "18.15%",
                            textAlign: "right",
                        }}
                        className="strong">
                        价税合计（小写）
                    </div>
                    <div style={{ width: 210, flex: "21.25%", ...nonFirstBorder, ...colStyle2 }}>
                        {this.moneyToBig(false)}
                    </div>
                </div>
            ),
            height: 34 * 2,
        }
        let jxsummaryRows = {
            rows: (
                <div className="vt-summary row" style={{ height: 34 * 2 }}>
                    <div
                        style={{
                            width: 270,
                            ...colStyle,
                            textAlign: "center",
                            flex: "27.15%",
                        }}
                        className="strong">
                        合计
                    </div>
                    <div
                        style={{
                            width: 335,
                            ...colStyle,
                            flex: "35.85%",
                            textAlign: "right",
                        }}>
                        {this.props.fpzlDm === "99" && this.hanshuiAmountTotal()}&nbsp;&nbsp;
                    </div>

                    <div
                        style={{
                            width: 185,
                            ...colStyle,
                            flex: "12%",
                            textAlign: "right",
                        }}>
                        {this.amountTotal()}&nbsp;&nbsp;
                    </div>
                    <div
                        style={{
                            width: 112,
                            textAlign: "right",
                            flex: "18%",
                            ...colStyle,
                        }}>
                        {" "}
                        {this.taxAmountTotal()}&nbsp;&nbsp;
                    </div>
                    <div style={{ width: 100, flex: "7%", ...colStyle2 }}></div>

                    <div
                        style={{
                            width: 270,
                            ...colStyle,
                            ...nonFirstBorder,
                            textAlign: "center",
                            flex: "27.15%",
                        }}
                        className="strong">
                        价税合计（大写）
                    </div>
                    <div
                        style={{
                            width: 340,
                            ...colStyle,
                            ...nonFirstBorder,
                            flex: "35.85%",
                            textAlign: "left",
                        }}>
                        {this.moneyToBig(true)}
                    </div>

                    <div
                        style={{
                            width: 180,
                            ...colStyle,
                            ...nonFirstBorder,
                            flex: "12%",
                            textAlign: "centen",
                        }}
                        className="strong">
                        价税合计（小写）
                    </div>
                    <div
                        style={{
                            width: 210,
                            textAlign: "right",
                            flex: "25%",
                            ...nonFirstBorder,
                            ...colStyle2,
                        }}>
                        {this.moneyToBig(false)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                </div>
            ),
            height: 34 * 2,
        }
        let fplx = this.props.fplx,
            fpzlDm = this.props.fpzlDm
        if (fplx === "xxfp") {
            if (fpzlDm === "05" || fpzlDm === "09") {
                summaryRows = {
                    rows: (
                        <div className="vt-summary row" style={{ height: 34 * 2 }}>
                            <div
                                style={{
                                    width: 200,
                                    ...colStyle,
                                    textAlign: "center",
                                    flex: "20%",
                                }}
                                className="strong">
                                合计
                            </div>
                            <div
                                style={{
                                    width: 320,
                                    ...colStyle,
                                    flex: "32%",
                                    textAlign: "right",
                                }}>
                                {this.hanshuiAmountTotal()}&nbsp;&nbsp;
                            </div>
                            <div
                                style={{
                                    width: 90,
                                    ...colStyle,
                                    flex: "9%",
                                    textAlign: "right",
                                }}>
                                {this.amountTotal()}&nbsp;&nbsp;
                            </div>
                            <div
                                style={{
                                    width: 170,
                                    ...colStyle,
                                    flex: "17%",
                                    textAlign: "right",
                                }}>
                                {this.taxAmountTotal()}&nbsp;&nbsp;
                            </div>
                            <div
                                style={{
                                    width: 220,
                                    ...colStyle,
                                    flex: "22%",
                                    textAlign: "right",
                                }}></div>

                            <div
                                style={{
                                    width: 270,
                                    ...colStyle,
                                    ...nonFirstBorder,
                                    textAlign: "center",
                                    flex: "20%",
                                }}
                                className="strong">
                                价税合计（大写）
                            </div>
                            <div
                                style={{
                                    width: 340,
                                    ...colStyle,
                                    ...nonFirstBorder,
                                    flex: "41%",
                                    textAlign: "left",
                                }}>
                                {this.moneyToBig(true)}
                            </div>

                            <div
                                style={{
                                    width: 180,
                                    ...colStyle,
                                    ...nonFirstBorder,
                                    flex: "17%",
                                    textAlign: "center",
                                }}
                                className="strong">
                                价税合计（小写）
                            </div>
                            <div
                                style={{
                                    width: 210,
                                    flex: "22%",
                                    ...nonFirstBorder,
                                    ...colStyle2,
                                }}>
                                {this.moneyToBig(false)}
                            </div>
                        </div>
                    ),
                    height: 34 * 2,
                }
            }
            if (fpzlDm === "08") {
                summaryRows = {
                    rows: (
                        <div className="vt-summary row" style={{ height: 34 * 2 }}>
                            <div
                                style={{
                                    width: 230,
                                    ...colStyle,
                                    textAlign: "center",
                                    flex: "23%",
                                }}
                                className="strong">
                                合计
                            </div>
                            <div
                                style={{
                                    width: 470,
                                    ...colStyle,
                                    flex: "47%",
                                    textAlign: "right",
                                }}>
                                {this.amountTotal()}&nbsp;&nbsp;
                            </div>
                            <div
                                style={{
                                    width: 300,
                                    ...colStyle,
                                    flex: "30%",
                                    textAlign: "right",
                                }}>
                                {this.taxAmountTotal()}&nbsp;&nbsp;&nbsp;&nbsp;
                            </div>

                            <div
                                style={{
                                    width: 230,
                                    ...colStyle,
                                    ...nonFirstBorder,
                                    textAlign: "center",
                                    flex: "23%",
                                }}
                                className="strong">
                                价税合计（大写）
                            </div>
                            <div
                                style={{
                                    width: 470,
                                    ...colStyle,
                                    ...nonFirstBorder,
                                    flex: "47%",
                                    textAlign: "left",
                                }}>
                                {this.moneyToBig(true)}
                            </div>

                            <div
                                style={{
                                    width: 150,
                                    ...colStyle,
                                    ...nonFirstBorder,
                                    flex: "15%",
                                    textAlign: "center",
                                }}
                                className="strong">
                                价税合计（小写）
                            </div>
                            <div
                                style={{
                                    width: 150,
                                    flex: "15%",
                                    ...nonFirstBorder,
                                    ...colStyle2,
                                }}>
                                {this.moneyToBig(false)}
                            </div>
                        </div>
                    ),
                    height: 34 * 2,
                }
            }
            return summaryRows
        } else {
            if (fpzlDm === "13") {
                jxsummaryRows = {
                    rows: (
                        <div className="vt-summary row" style={{ height: 34 * 2 }}>
                            <div
                                style={{
                                    width: 270,
                                    ...colStyle,
                                    textAlign: "center",
                                    flex: "17.1%",
                                }}
                                className="strong">
                                合计
                            </div>
                            <div
                                style={{
                                    width: 335,
                                    ...colStyle,
                                    flex: "54.6%",
                                    textAlign: "right",
                                }}>
                                {this.amountTotal()}&nbsp;&nbsp;
                            </div>

                            <div
                                style={{
                                    width: 112,
                                    textAlign: "right",
                                    flex: "20.2%",
                                    ...colStyle,
                                }}>
                                {" "}
                                {this.taxAmountTotal()}&nbsp;&nbsp;
                            </div>
                            <div style={{ width: 100, flex: "8.1%", ...colStyle2 }}></div>

                            <div
                                style={{
                                    width: 270,
                                    ...colStyle,
                                    ...nonFirstBorder,
                                    textAlign: "center",
                                    flex: "17.1%",
                                }}
                                className="strong">
                                价税合计（大写）
                            </div>
                            <div
                                style={{
                                    width: 340,
                                    ...colStyle,
                                    ...nonFirstBorder,
                                    flex: "41.6%",
                                    textAlign: "left",
                                }}>
                                {this.moneyToBig(true)}&nbsp;&nbsp;
                            </div>

                            <div
                                style={{
                                    width: 180,
                                    ...colStyle,
                                    ...nonFirstBorder,
                                    flex: "13%",
                                    textAlign: "right",
                                }}
                                className="strong">
                                价税合计（小写）
                            </div>
                            <div
                                style={{
                                    width: 210,
                                    textAlign: "right",
                                    flex: "28.3%",
                                    ...nonFirstBorder,
                                    ...colStyle2,
                                }}>
                                {this.moneyToBig(false)}
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </div>
                        </div>
                    ),
                    height: 34 * 2,
                }
            }
            if (fpzlDm === "12") {
                jxsummaryRows = {
                    rows: (
                        <div className="vt-summary row" style={{ height: 34 }}>
                            <div
                                style={{
                                    width: 270,
                                    ...colStyle,
                                    textAlign: "center",
                                    flex: "17.1%",
                                }}
                                className="strong">
                                金额合计（大写）
                            </div>
                            <div
                                style={{
                                    width: 340,
                                    ...colStyle,
                                    flex: "43.65%",
                                    textAlign: "right",
                                }}>
                                {this.moneyToBig(true)}&nbsp;&nbsp;
                            </div>

                            <div
                                style={{
                                    width: 180,
                                    ...colStyle,
                                    flex: "14.75%",
                                    textAlign: "right",
                                }}
                                className="strong">
                                金额合计（小写）
                            </div>
                            <div
                                style={{
                                    width: 210,
                                    textAlign: "right",
                                    flex: "24.5%",
                                    ...colStyle2,
                                }}>
                                {this.moneyToBig(false)}
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </div>
                        </div>
                    ),
                    height: 34,
                }
            }
            if (fpzlDm === "18") {
                jxsummaryRows = {
                    rows: (
                        <div className="vt-summary row" style={{ height: 34 }}>
                            <div
                                style={{
                                    width: 270,
                                    ...colStyle,
                                    textAlign: "center",
                                    flex: "16.85%",
                                }}
                                className="strong">
                                合计
                            </div>
                            <div
                                style={{
                                    width: 340,
                                    ...colStyle,
                                    flex: "48%",
                                    textAlign: "right",
                                }}
                                className="strong">
                                {this.mxnf01AmounTotal()}&nbsp;&nbsp;
                            </div>

                            <div
                                style={{
                                    width: 180,
                                    ...colStyle,
                                    flex: "9.95%",
                                    textAlign: "right",
                                }}
                                className="strong">
                                {this.amountTotal()}&nbsp;&nbsp;
                            </div>
                            <div
                                style={{
                                    width: 180,
                                    ...colStyle,
                                    flex: "18%",
                                    textAlign: "right",
                                }}
                                className="strong">
                                {this.taxAmountTotal()}&nbsp;&nbsp;
                            </div>
                            <div
                                style={{
                                    width: 210,
                                    textAlign: "right",
                                    flex: "7.2%",
                                    ...colStyle2,
                                }}></div>
                        </div>
                    ),
                    height: 34,
                }
            }
            return jxsummaryRows
        }
    }
    // 含税金额合计
    hanshuiAmountTotal = (t = true) => {
        let fplyLx = this.props.fplyLx
        if (fplyLx === "1") {
            return this.props.form.hsje
        }
        hj.hsje = this.calcTotal("hsje", t)
        return hj.hsje
    }
    // 合计金额计算
    amountTotal = (t = true) => {
        let fplyLx = this.props.fplyLx
        if (fplyLx === "1") {
            return this.props.form.hjje
        }
        hj.hjje = this.calcTotal("je", t)
        return hj.hjje
    }
    // 合计税额计算
    taxAmountTotal = (t = true) => {
        let fplyLx = this.props.fplyLx
        let kjxh = this.props.form.kjxh
        const hjse = this.props.form.hjse

        if (fplyLx === "1") {
            return hjse
        }
        hj.hjse = this.calcTotal("se", t)
        // 合计税额有变化才修改有效税额
        if (this.hjseHasChange && this.props.comRef && this.props.form.bdzt) {
            this.props.comRef.setFieldsValue({
                nf06: hj.hjse,
            }) // 有效税额
            this.hjseHasChange = false
        }
        return hj.hjse
    }
    // 旅客票金额计算
    mxnf01AmounTotal = () => {
        let fplyLx = this.props.fplyLx
        if (fplyLx === "1") {
            return this.props.form.jehj
        }
        hj.jehj = this.calcTotal("mxnf01")
        return hj.jehj
    }
    //汇总计算
    calcTotal = (field, t) => {
        let data = this.state.editCellData.dataSource
        let list = data
            .filter(f => f[field] !== undefined && f[field] !== null)
            .map(item => Number(item[field]))
        let total = !isNaN(list[0]) ? list.reduce((a, b) => a + b) : undefined
        return !isNaN(total) ? parseFloat(total).toFixed(2) : undefined
    }
    //价税合计计算
    moneyToBig = t => {
        let fplyLx = this.props.fplyLx
        let data = this.state.editCellData.dataSource
        if (fplyLx === "1" && t !== false) {
            return this.props.form.jshjDx
        } else if (fplyLx === "1" && t !== true) {
            return this.props.form.jshj
        }
        let a = this.amountTotal(true),
            b = this.taxAmountTotal(true),
            c = Number(a) + Number(b)
        if (this.props.fpzlDm === "12") c = b * 1 //代扣代缴只有税额
        if (isNaN(c)) {
            c = 0
        }
        if (t) {
            hj.jshjDx = this.moneySmalltoBig(c.toFixed(2)) || undefined
            return this.moneySmalltoBig(c.toFixed(2)) || undefined
        }
        hj.jshj = parseFloat(c).toFixed(2) || undefined
        return parseFloat(c).toFixed(2) || undefined
    }
    moneySmalltoBig = v => number.moneySmalltoBig(v, 2)
    onOk = async () => {
        let {
            editCellData: { dataSource },
        } = this.state
        let errorList = [],
            tableFlag = true
        let fplyLx = this.props.fplyLx
        if (dataSource.some(f => f.rowState === true)) {
            dataSource = dataSource.filter(itme => itme.rowState === true)
            dataSource.forEach(item => {
                const errorItem = { key: item.key }
                if (!item.jzjtDm) {
                    item.jzjtDm = "N"
                }
                //货物类型代码只有销项才有
                if (this.props.fplx === "xxfp") {
                    if (item.hwlxDm === undefined) {
                        errorItem.hwlxDm = true
                        tableFlag = false
                    }
                    if (item.jsfsDm === undefined) {
                        errorItem.jsfsDm = true
                        tableFlag = false
                    }
                    if (this.props.fpzlDm === "05") {
                        if (item.hsje === undefined) {
                            errorItem.hsje = true
                            tableFlag = false
                        }
                    }
                    // 有些票种不需要用到货物名称
                    if (this.props.fpzlDm === "08") {
                        if (!item.hwmc || item.hwmc === "") {
                            item.hwmc = "未定义商品名称"
                        }
                    } else if (this.props.fpzlDm === "09") {
                        if (!item.hwmc || item.hwmc === "") {
                            item.hwmc = "未定义商品名称"
                        }
                        if (item.hsje === undefined) {
                            errorItem.hsje = true
                            tableFlag = false
                        }
                    } else {
                        if (!item.hwmc || item.hwmc === "") {
                            errorItem.hwmc = true
                            tableFlag = false
                        }
                    }
                    if (item.slv === undefined) {
                        errorItem.slv = true
                        tableFlag = false
                    }
                    if (item.se === undefined) {
                        errorItem.se = true
                        tableFlag = false
                    }
                    if (item.je === undefined) {
                        errorItem.je = true
                        tableFlag = false
                    }
                    if (item.jzjtDm === undefined) {
                        item.jzjtDm = "N"
                    }
                } else if (this.props.fplx === "jxfp") {
                    if (
                        this.props.fpzlDm === "01" ||
                        this.props.fpzlDm === "04" ||
                        this.props.fpzlDm === "14" ||
                        this.props.fpzlDm === "17"
                    ) {
                        if (!item.hwmc || item.hwmc === "") {
                            errorItem.hwmc = true
                            tableFlag = false
                        }
                        if (item.slv === undefined) {
                            errorItem.slv = true
                            tableFlag = false
                        }
                        if (item.se === undefined) {
                            errorItem.se = true
                            tableFlag = false
                        }
                        if (item.je === undefined) {
                            errorItem.je = true
                            tableFlag = false
                        }
                        if (item.jzjtDm === undefined) {
                            item.jzjtDm = "N"
                        }
                    } else if (this.props.fpzlDm === "13") {
                        if (item.je === undefined) {
                            errorItem.je = true
                            tableFlag = false
                        }
                    } else if (this.props.fpzlDm === "12") {
                        if (item.se === undefined) {
                            errorItem.se = true
                            tableFlag = false
                        }
                    } else if (this.props.fpzlDm === "18") {
                        //mxlx mxnf02 slv
                        if (item.mxlx === undefined) {
                            errorItem.mxlx = true
                            tableFlag = false
                        }
                        if (item.mxnf02 === undefined) {
                            errorItem.mxnf02 = true
                            tableFlag = false
                        }
                        if (item.slv === undefined) {
                            errorItem.slv = true
                            tableFlag = false
                        }
                        if (item.mxnf01Flage === false) {
                            errorItem.mxnf01 = true
                            tableFlag = false
                        }
                    } else if (this.props.fpzlDm === "99") {
                        if (!item.hwmc || item.hwmc === "") {
                            errorItem.hwmc = true
                            tableFlag = false
                        }
                        if (!item.hsje) {
                            errorItem.hsje = true
                            tableFlag = false
                        }
                    }
                }

                errorList.push(errorItem)
            })
        } else {
            errorList = [
                {
                    hwmc: true,
                    je: true,
                    slv: true,
                    hsje: true,
                    se: true,
                    hwlxDm: true,
                    jsfsDm: true,
                    key: 0,
                    mxlx: true,
                    mxnf02: true,
                },
            ]
            tableFlag = false
        }
        this.setState({ errorList })
        let formData = {
            dataSource,
            errorList,
            tableFlag,
        }
        return formData
    }

    //表格内操作
    handleChange = (rowKey, rowIndex, field, value) => {
        const { errorList, editCellData } = this.state
        const record = editCellData.dataSource[rowIndex]
        const prevRecord = { ...record }
        record[field] = value
        // 处理列表数据
        let quantity = Number(record.sl), //数量
            price = record.dj, //单价
            amount = Number(record.je), //金额
            taxRate = record.slv, //税率
            taxAmount = Number(record.se), // 税额
            jsfsDm = record.jsfsDm, //计税方式
            hsAmount = Number(record.hsje), // 含税金额
            temp = null
        switch (field) {
            case "hsje": // 含税金额
                if (isNaN(taxRate)) taxRate = 0
                let je = hsAmount / (1 + taxRate)
                let se = hsAmount - je
                record.hsje = value
                record.je = !isNaN(je) ? parseFloat(je).toFixed(2) : undefined
                record.se = !isNaN(se) ? parseFloat(se).toFixed(2) : undefined
                record.dj = !isNaN(je) && !isNaN(quantity) ? (je / quantity).toFixed(6) : undefined
                this.hjseHasChange = true
                break
            case "hwmc": // 商品或服务名称
                if (typeof value == "object") {
                    let _hwlxDm = this.calcHwlx(value.spbm),
                        _jsfsDm = this.calcJsfs(value.slv),
                        _slList = this.props.metaAction.gf("data.slList").toJS() || [],
                        _slv = _slList.find(f => f.slv == value.slv) ? value.slv : undefined
                    record.slList = _slList
                    record.hwmc = value.spmc
                    record.spbm = value.spbm
                    record.slv = _slv
                    record.se = !isNaN(amount) && _slv > -1 ? this.calcSe(amount, _slv) : undefined
                    record.hwlxDm = record.hwlxRes.find(f => f.hwlxDm == _hwlxDm)
                        ? _hwlxDm
                        : undefined
                    record.jsfsDm = record.jsfsList.find(f => f.jsfsDm == _jsfsDm)
                        ? _jsfsDm
                        : undefined
                    this.hjseHasChange = true
                } else {
                    record.hwmc = value
                }
                break
            case "sl": //数量
                if (!isNaN(quantity) && quantity != 0 && !isNaN(amount)) {
                    temp = amount / quantity
                } else {
                    temp = undefined
                }
                record.dj = temp !== undefined ? parseFloat(temp).toFixed(6) : undefined
                record.sl = !isNaN(quantity) && quantity != 0 ? quantity : undefined
                break
            case "je":
                if (!isNaN(amount) && !isNaN(quantity) && quantity !== 0) {
                    temp = amount / quantity
                } else {
                    temp = undefined
                }
                record.dj = temp !== undefined ? parseFloat(temp).toFixed(6) : undefined
                record.se = this.calcSe(amount, taxRate)
                this.hjseHasChange = true
                break
            case "slv":
                if (isNaN(taxRate)) taxRate = 0
                if (
                    this.props.fpzlDm === "05" ||
                    this.props.fpzlDm === "09" ||
                    this.props.fpzlDm === "99"
                ) {
                    let je = (hsAmount / (1 + taxRate)).toFixed(2)
                    let se = (hsAmount - je).toFixed(2)
                    record.je = isNaN(je) ? undefined : je
                    record.se = isNaN(se) ? undefined : se
                    record.slv = value
                    record.dj =
                        je !== undefined && !isNaN(quantity)
                            ? (je / quantity).toFixed(6)
                            : undefined
                    record.jsfsDm = this.slChangeJsfs(value, jsfsDm) //计税方式代码
                } else if (this.props.fpzlDm === "13") {
                    let je = record.se / value
                    je = isNaN(je) ? undefined : je
                    record.je = je !== undefined ? je.toFixed(2) : undefined
                } else {
                    let se = isNaN(this.calcSe(amount, value))
                        ? undefined
                        : this.calcSe(amount, value)
                    record.se = value > -1 && !isNaN(amount) ? se : undefined
                    record.slv = value
                    record.jsfsDm = this.slChangeJsfs(value, jsfsDm) //计税方式代码
                }
                this.hjseHasChange = true
                break
            case "se":
                if (this.props.fpzlDm === "13") {
                    let je = value / record.slv
                    je = isNaN(je) ? undefined : je
                    record.je = je !== undefined ? je.toFixed(2) : undefined
                }
                this.hjseHasChange = true
                break
            case "jsfsDm":
                // if (this.props.fplyLx == 2) {
                //
                // }
                temp = this.jsfsChangeSl(value)
                let _slv = temp.toJS().find(f => f.slv == taxRate) ? taxRate : undefined
                record.slv = _slv
                record.slList = temp.toJS()
                record.se = !isNaN(amount) && _slv > -1 ? this.calcSe(amount, _slv) : undefined
                this.hjseHasChange = true
                break
            case "txrq":
                let txrqq = value[0]
                let txrqz = value[1]
                record.txrq = [moment(txrqq).format("YYYYMMDD"), moment(txrqz).format("YYYYMMDD")]
                record.txrqq = moment(txrqq).format("YYYYMMDD")
                record.txrqz = moment(txrqz).format("YYYYMMDD")
                break
            case "mxsf01":
                record.mxsf01 = moment(record.mxsf01).format("YYYYMMDD")
                break
            case "mxlx": // 旅客票客票类型
                if (this.props.fpzlDm === "18") {
                    let _zlv = 0.09 // 1003
                    if (value === "1003") {
                        _zlv = 0.03
                    }
                    record.slv = _zlv
                    record.je = record.mxnf01 / (1 + _zlv)
                    record.se = record.je * _zlv
                    this.hjseHasChange = true
                }
                break
            case "mxnf01": // 旅客票总金额
                record.mxnf02 = isNaN(record.mxnf02) ? 0 : record.mxnf02
                record.mxnf03 = isNaN(record.mxnf03) ? 0 : record.mxnf03
                if (record.mxnf02 + record.mxnf03 > Number(value)) {
                    this.props.metaAction.toast("error", "总金额应 大于或等于 票价+燃油附加费！")
                    record.mxnf01Flage = false
                }
                taxRate = isNaN(taxRate) ? 0 : taxRate
                record.je = Number(value) / (1 + taxRate)
                record.se = record.je * taxRate
                this.hjseHasChange = true
                break
            case "mxnf02": //旅客票票价
                let mxnf03 = Number(record.mxnf03)
                let mxnf01 = Number(value) + (isNaN(mxnf03) ? 0 : mxnf03)
                record.mxnf02 = Number(value)
                record.mxnf01 = isNaN(mxnf01) ? undefined : mxnf01 // 总金额
                record.je = record.mxnf01 / (1 + taxRate)
                record.se = record.je * taxRate
                this.hjseHasChange = true
                if (Number(value) + record.mxnf03 > record.mxnf01) {
                    this.props.metaAction.toast("error", "总金额应 大于或等于 票价+燃油附加费！")
                    record.mxnf01Flage = false
                }
                break
            case "mxnf03": // 旅客票附加燃油费
                let mxnf02 = Number(record.mxnf02)
                let zje = Number(value) + (isNaN(mxnf02) ? 0 : mxnf02)
                record.mxnf03 = Number(value)
                record.mxnf01 = isNaN(zje) ? undefined : zje
                record.je = record.mxnf01 / (1 + taxRate)
                record.se = record.je * taxRate
                this.hjseHasChange = true
                if (Number(value) + record.mxnf02 > record.mxnf01) {
                    this.props.metaAction.toast("error", "总金额应 大于或等于 票价+燃油附加费！")
                    record.mxnf01Flage = false
                }
                break
        }

        record.rowState = true // 添加一个是否被编辑过的状态
        const errorItem = errorList.find(f => String(f.key) === String(rowKey)) || {}
        const newErrorItem = { key: rowKey }

        if (value === "" || value === undefined) {
            newErrorItem[field] = true
        } else {
            newErrorItem[field] = false
        }

        if (!isEqual(record, prevRecord) || !isEqual(errorItem, newErrorItem)) {
            this.setState({
                editCellData,
                errorList: [
                    ...errorList.filter(f => String(f.key) !== String(rowKey)),
                    newErrorItem,
                ],
            })
            let mxDetailList = editCellData.dataSource
            this.props.metaAction.sf("data.form.mxDetailList", fromJS(mxDetailList))
        }
    }
    // 选择商品名称
    handleSelectProduct = async (e, text, record, index) => {
        if (this.props.form.fplyLx != 2 || this.props.isReadOnly === true) {
            return false
        }
        e.stopPropagation && e.stopPropagation()
        const spbmList = this.props.metaAction.gf("data.spbmList")
        const res = await this.props.metaAction.modal("show", {
            title: "商品选择",
            className: "inv-app-select-product-modal",
            width: 1000,
            style: { zIndex: "1000" },
            top: 20,
            okText: "确定",
            centered: true,
            footer: null,
            bodyStyle: { padding: "0px", borderTop: "1px solid #e9e9e9" },
            children: this.metaAction.loadApp("inv-app-select-product", {
                store: this.props.store,
                spbmList,
            }),
        })
        if (res && res.spbm) {
            this.handleChange(index, index, "hwmc", res)
        }
    }
    getPopupContainer = () => document.querySelector("." + this.shortcutsClass) || document.body
    editCellChange = (dataSource, count, tableOptions = {}) => {
        // 新增列需要添加选择数据
        const { slList, jsfsList, hwlxRes, jzjtDmList } = optionList
        dataSource.forEach(item => {
            if (!item.mxxh) {
                item.mxxh = item.key * 1
                item.slList = slList
                item.jsfsList = jsfsList
                item.hwlxRes = hwlxRes
                item.jzjtDmList = jzjtDmList
            }
        })
        const { width, height, scroll, isFullScreen, isFullClient, scrollTop } = tableOptions
        const editCellData = {
            ...this.state.editCellData,
            dataSource: [...dataSource],
            count,
        }
        if (width !== undefined) editCellData.width = width < minWidth ? minWidth : width
        if (height !== undefined) editCellData.height = height
        if (scroll !== undefined) {
            const { x, y } = scroll
            editCellData.scroll = { x: x < minWidth ? minWidth : x, y }
        }
        if (isFullScreen !== undefined) editCellData.isFullScreen = isFullScreen
        if (isFullClient !== undefined) editCellData.isFullClient = isFullClient
        if (scrollTop !== undefined) editCellData.scrollTop = scrollTop
        if (dataSource.length > 3) {
            this.setState({ editCellData })
            this.props.metaAction.sf("data.form.mxDetailList", fromJS(dataSource))
        }
    }

    // 计算税额
    calcSe = (je, sl) => {
        je = parseFloat(je)
        sl = parseFloat(sl)
        if (!isNaN(je) && sl > -1) {
            return (je * sl).toFixed(2)
        }
        return undefined
    }
    //计税方式修改
    jsfsChangeSl = jsfs => {
        const nsrxz = this.props.nsrxz
        let slList = optionList.oldSllist,
            slListNew = []
        switch (jsfs) {
            case "0":
                //一般计税
                // 当计税方式选中“一般计税”，税率选择项为
                // 一般纳税人：“17%，16%，13%，11%，10%，9%，6%”
                if (nsrxz == "YBNSRZZS") {
                    slListNew = slList.filter(f => f.slv <= 0.17 && f.slv >= 0.06)
                }
                break
            case "1":
                //简易征收
                if (nsrxz == "YBNSRZZS") {
                    // “6%，5%，4%，3%，2%，1.5% 1%”
                    slListNew = slList.filter(f => f.slv <= 0.06 && f.slv >= 0.01)
                } else {
                    // 5%、3% 、1%
                    slListNew = slList.filter(f => f.slv == 0.05 || f.slv == 0.03 || f.slv == 0.01)
                }
                break
            case "2":
                slListNew = slList.filter(f => f.slv == 0)
                break
            case "3":
                slListNew = slList.filter(f => f.slv == 0)
                break
            //免税
            case undefined:
                //空白
                if (nsrxz == "YBNSRZZS") {
                    slListNew = slList.filter(f => f.slv >= 0.015)
                } else {
                    slListNew = slList.filter(
                        f => f.slv == 0.05 || f.slv == 0.03 || f.slv == 0.01 || f.slv == 0.0
                    )
                }
                break
        }
        return fromJS(slListNew)
    }
    // 税率修改
    slChangeJsfs = (sl, jsfs) => {
        let v = parseFloat(sl)
        const nsrxz = this.props.nsrxz
        // 2000010001一般企业 2000010002 小规模企业
        // "0":一般计税；"1":简易征收；"2":免抵退；"3":免税
        // let jsfs = undefined
        if (nsrxz == "YBNSRZZS") {
            if (v <= 0.17 && v >= 0.09) {
                // 一般纳税人：当税率选择“17%，16%，13%，11%，10%，9%”其中一种时 计税方式自动选中“一般计税”
                jsfs = "0"
            }
            if (v <= 0.05 && v >= 0.01) {
                // 一般纳税人：当税率选择“5%，4%，3%，2%，1.5% 1%”其中一种时 计税方式自动选中“简易征收”
                jsfs = "1"
            }
            if (v == 0.06) {
                // 一般纳税人：当税率选择“6%”时，计税方式为空白
                jsfs = undefined
            }
            if (v == 0) {
                // 一般纳税人：当税率选择“0%”时，计税方式为免税
                jsfs = "3"
            }
        } else {
            if (v == 0.05 || v == 0.03 || v == 0.01) {
                // 小规模纳税人：当税率选择“5%、3% 1%”其中一种时 计税方式自动选中“简易征收”
                jsfs = "1"
            }
            // if (v == 0) {
            //     // 小规模纳税人：当税率选择“5%、3% 1%”其中一种时 计税方式自动选中“简易征收”
            //     jsfs = '3'
            // }
        }
        return jsfs
    }
    // 根据商品信息计算货物类型
    calcHwlx = spbm => {
        if (!spbm) return undefined
        let hwlx = undefined
        switch (spbm.slice(0, 1)) {
            case "1":
                hwlx = "0004"
                break
            case "2":
                hwlx = "0001"
                break
            case "4":
            case "6":
                hwlx = "0005"
                break
            case "5":
                hwlx = "0003"
                break
            default:
                hwlx = "0002"
                break
        }
        return hwlx
    }
    // 根据商品信息计算计税方法
    calcJsfs = slv => {
        if (isNaN(Number(slv))) {
            return undefined
        }
        if (slv == 0) {
            return "3"
        }
        if (slv >= 0.09 && slv <= 0.17) {
            return "0"
        }
        if (slv == 0.06) {
            return undefined
        }
        return "1"
    }
    //代扣代缴禁止选择日期
    disabledDateQ = currentDate => {
        //通行日期起
        let skssq = this.props.nsqj || moment()
        return currentDate && currentDate > moment(skssq)
    }

    render() {
        const { editCellData } = this.state
        const { fplyLx, isReadOnly } = this.props
        let addFlag = false
        if (fplyLx == "1" || isReadOnly == true) {
            addFlag = true
        }
        editCellData.dataSource = [].concat(this.props.form.mxDetailList)
        editCellData.count = this.props.form.mxDetailList.length
        editCellData.fluctuateCell = {
            width: 30,
            flexGrow: "3%",
            className:
                this.props.form.fplyLx != 2 || this.props.isReadOnly === true
                    ? "inv-detail addBc"
                    : "inv-detail",
        }
        return (
            <div className={this.shortcutsClass}>
                <EditableCellTable
                    {...editCellData}
                    addRowProps={record => ({ disabled: addFlag, hide: addFlag })}
                    deleteRowProps={record => ({
                        disabled: addFlag,
                        hide: addFlag,
                    })}
                    rowHeight={rowIndex => 34}
                    onChange={this.editCellChange}
                    columns={editCellColumns.call(this, optionList)}
                    summaryRows={this.summaryRows()}
                    // width={this.props.width < 1920 ? this.props.width : 1920}
                    minWidth={minWidth}
                    className={this.tableClass}
                    shortcutsClass={this.shortcutsClass}
                />
            </div>
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
