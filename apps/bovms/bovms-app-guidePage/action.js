import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import BatchSubjectSetting from "../components/batchSubjectSetting"
import config from "./config"
import moment from "moment"
import { fromJS } from "immutable"
import Checked from "../components/checked"
import ChaPiao from "../components/chaPiao"

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
        this.inintPage()
    }
    // 初始化页面数据
    inintPage = () => {
        let {
            vatTaxpayer,
            nsqj,
            stock,
            sobCheck,
            type,
            enabledYearAndMonth,
            tutorialEndDate,
            tutorialBeginDate,
            orgId
        } = this.component.props || this.component.props.appParams
        let fudaoqi, nsq
        //stock为0时 下面判断结果不符合预期
        if (vatTaxpayer && nsqj && type) {
            // 判断纳税人性质辅导期
            if (vatTaxpayer == 2000010003) {
                fudaoqi = 10086 // 纳税人辅导期
                vatTaxpayer = 2000010001
            }

            // if (tutorialBeginDate && tutorialEndDate) {
            //   tutorialBeginDate = moment(tutorialBeginDate)
            //       .subtract(0, 'month')
            //       .format('YYYYMM')
            //     tutorialEndDate = moment(tutorialEndDate)
            //       .subtract(0, 'month')
            //       .format('YYYYMM')
            //     nsq = moment(nsqj)
            //       .subtract(0, 'month')
            //       .format('YYYYMM')
            //     if (nsq < tutorialBeginDate) {
            //       vatTaxpayer = 2000010002
            //     } else if (nsq > tutorialEndDate) {
            //       vatTaxpayer = 2000010001
            //     } else {
            //       fudaoqi = 10086 // 纳税人辅导期
            //     }

            // }

            this.metaAction.sfs({
                "data.vatTaxpayer": fromJS(vatTaxpayer),
                "data.nsqj": fromJS(nsqj),
                "data.stock": fromJS(stock),
                "data.type": fromJS(type),
                "data.fudaoqi": fromJS(fudaoqi),
                "data.enabledYearAndMonth": fromJS(enabledYearAndMonth),
                "data.sobCheck": fromJS(sobCheck),
                "data.orgId": fromJS(orgId)
            })
        } else {
            /*    alert("获取纳税人信息不完全")*/
            return
        }
    }

    // 切换报税月份
    handleMonthPickerChange = (e, strTime) => {
        this.metaAction.sf("data.nsqj", e)
        let res = this.component.props.nsqjChange(strTime)
    }
    disabledStartDate = startValue => {
        let enabledYearAndMonth = this.metaAction.gf("data.enabledYearAndMonth")
        if (enabledYearAndMonth) {
            return (
                startValue.valueOf() <
                new Date(
                    moment(enabledYearAndMonth)
                        .subtract(1, "month")
                        .format("YYYY-MM-DD")
                        .substr(0, 7)
                ).valueOf() || startValue.valueOf() > new Date().valueOf()
            )
        } else {
            return startValue.valueOf() > new Date().valueOf()
        }
    }
    goConfigure = () => {
        this.purchase()
    }
    purchase = async () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                "存货设置",
                "ttk-stock-inventory-configure"
            )
    }
    openHelp = async () => {
        let type = this.metaAction.gf("data.type")
        let module =
            type === "进项" ? "bovms-app-purchase-list" : "bovms-app-sale-list"
        const ret = await this.metaAction.modal("show", {
            title: "",
            className: "ttk-edf-app-help-modal-content",
            wrapClassName: "ttk-edf-app-help-modal",
            footer: null,
            width: 840, //静态页面宽度840小于会有横向滚动条
            children: this.metaAction.loadApp("ttk-edf-app-help", {
                store: this.component.props.store,
                code: module // 查询页面对应参数
            })
        })
    }
    // 取票
    quPiao = async () => {
        const sobCheck = this.metaAction.gf("data.sobCheck")
        const id = this.metaAction.context.get("currentOrg").id
        let yearPeriod = this.metaAction.gf("data.nsqj") // 纳税期间
        if (!sobCheck) {
            this.metaAction.modal("confirm", {
                className: "bovms-app-zt-confirm",
                width: 450,
                content: "账套信息不完整，不能进行取票。请补充完整！",
                iconType: "exclamation-circle",
                onOk: () => {
                    this.showZt(id, yearPeriod)
                },
                okText: "现在补充"
            })
            return
        }

        let type = this.metaAction.gf("data.type")
        let vatTaxpayer = this.metaAction.gf("data.vatTaxpayer")
        let module = type === "进项" ? "cg" : "xs"
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 10
        if (modalWidth > 1920) modalWidth = 1920
        this.metaAction.modal("show", {
            title: "取票",
            style: { top: 25 },
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                overflow: "auto"
            },
            footer: null,
            wrapClassName: "bovms-app-guidePage-chapiao-molde collect-invoice",
            children: (
                <Checked
                    store={this.component.props.store}
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    nsqj={yearPeriod}
                    vatTaxpayer={vatTaxpayer}
                    module={module}
                    stock={this.component.props.stock}
                    nsqjChange={() => {
                        this.component.props.nsqjChange(yearPeriod)
                    }}
                />
            )
        })
    }
    // 查票
    caPiao = async () => {
        const sobCheck = this.metaAction.gf("data.sobCheck")
        const id = this.metaAction.context.get("currentOrg").id
        let nsqj = this.metaAction.gf("data.nsqj") // 纳税期间
        if (!sobCheck) {
            this.metaAction.modal("confirm", {
                className: "bovms-app-zt-confirm",
                width: 450,
                content: "账套信息不完整，不能进行查票。请补充完整！",
                iconType: "exclamation-circle",
                onOk: () => {
                    this.showZt(id, nsqj)
                },
                okText: "现在补充"
            })
            return
        }
        let type = this.metaAction.gf("data.type")
        let nsrxz = this.metaAction.gf("data.vatTaxpayer")
        let stock = this.metaAction.sf("data.stock")
        let enabledYearAndMonth = this.metaAction.gf("data.enabledYearAndMonth")
        this.metaAction.modal("show", {
            title: "查票",
            top: "10px",
            width: 1100,
            wrapClassName: "",
            style: { top: 25 },
            footer: null,
            children: (
                <ChaPiao
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    type={type}
                    nsqj={nsqj}
                    nsrxz={nsrxz}
                    stock={stock}
                    store={this.component.props.store}
                    enabledYearAndMonth={enabledYearAndMonth}
                    caPiaoOnOk={this.caPiaoOnOk}
                />
            )
        })
    }
    // 查票关闭的回调
    caPiaoOnOk = async (arr, yearPeriod) => {
        this.metaAction.sf("data.loading", true)
        let type = this.metaAction.gf("data.type")
        let res
        let formatDate = `${(yearPeriod + "").substr(0, 4)}-${(
            yearPeriod + ""
        ).substr(4)}`

        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 10
        if (modalWidth > 1920) modalWidth = 1920
        if (type === "销项") {

            this.metaAction.sf("data.loading", false)
            if (arr.length) {
                this.metaAction.modal("show", {
                    title: "批设科目",
                    width: modalWidth,
                    height: modalHeight,
                    bodyStyle: {
                        maxHeight: modalHeight - 47,
                        overflow: "auto"
                    },
                    okText: "保存",
                    footer: false,
                    style: { top: 25 },
                    wrapClassName:
                        "bovms-batch-subject-setting collect-invoice",
                    children: (
                        <BatchSubjectSetting
                            ids={arr}
                            store={this.component.props.store}
                            webapi={this.webapi}
                            yearPeriod={yearPeriod}
                            metaAction={this.metaAction}
                            nsqjChange={() => {
                                this.component.props.nsqjChange(formatDate)
                            }}
                            module="xs"
                            isStock={
                                this.component.props.stock === 1 ? true : false
                            }
                        />
                    )
                })
            } else {
                this.component.props.nsqjChange(formatDate)
            }
        } else {
            //进项

            if (arr.length) {
                this.metaAction.modal("show", {
                    title: "批设科目",
                    width: modalWidth,
                    height: modalHeight,
                    bodyStyle: {
                        maxHeight: modalHeight - 47,
                        overflow: "auto"
                    },
                    okText: "保存",
                    footer: false,
                    style: { top: 25 },
                    wrapClassName:
                        "bovms-batch-subject-setting collect-invoice",
                    children: (
                        <BatchSubjectSetting
                            ids={arr}
                            store={this.component.props.store}
                            webapi={this.webapi}
                            metaAction={this.metaAction}
                            yearPeriod={yearPeriod}
                            nsqjChange={() => {
                                this.component.props.nsqjChange(formatDate)
                            }}
                            module="cg"
                            isStock={
                                this.component.props.stock === 1 ? true : false
                            }
                        />
                    )
                })
            } else {
                this.component.props.nsqjChange(formatDate)
            }
        }
    }
    //补充账套信息
    showZt = async (id, yearPeriod) => {
        const ret = await this.metaAction.modal("show", {
            title: "账套信息",
            width: 450,
            footer: null,
            children: this.metaAction.loadApp("ttk-es-app-ztmanage-add", {
                store: this.component.props.store,
                id: id,
                sourceType: "1" //0创建账套 1账套信息
            })
        })
        if (ret) {
            this.component.props.nsqjChange(yearPeriod)
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
