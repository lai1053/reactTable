import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
import utils from "edf-utils"
import { HelpIcon } from "../commonAssets/js/common"
import { Modal, Button } from "edf-component"
import { Spin as Aspin } from "antd"
import StockSetting from "../ttk-stock-inventory-configure/component/StockSetting"
import Spin from "../components/common/Spin"
import TransferWebCard from "./TransferWebCard"
const STATE = {
    0: "ttk-stock-Inventory-allocation-div wqy", // 未启用
    1: "ttk-stock-Inventory-allocation-div yqy", // 已启用
    2: "ttk-stock-Inventory-allocation-div yty", // 已停用
}
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.monthEndingClosingNum = sessionStorage.getItem("monthEndingClosingNum") // 当前结账次数
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        this.name = currentOrg.name
        injections.reduce("init")
        this.load()
    }

    componentWillUpdate = (nextprops, nextstate) => {
        const stateCode = sessionStorage[`ttk-stock-app-inventory-config-state-${this.name}`]
        const path = sessionStorage[`ttk-stock-app-inventory-config-path-${this.name}`]
        const monthEndingClosingNum = sessionStorage.getItem("monthEndingClosingNum")
        if (this.monthEndingClosingNum != monthEndingClosingNum) {
            this.monthEndingClosingNum = monthEndingClosingNum
            this.load()
        }
        if (path == "ttk-stock-app-inventory-config") {
            if (stateCode && this.state && stateCode != this.state) {
                this.load()
                sessionStorage[`ttk-stock-app-inventory-config-path-${this.name}`] =
                    "ttk-stock-Inventory-allocation"
            }
        }
    }

    componentWillUnmount = () => {
        this.state = null
        this.motime = null
        this.openFlag = null
        this.startperiod = null
    }

    load = async () => {
        this.metaAction.sf("data.loading", true)
        const currentOrg = (await this.webapi.operation.initPeriod()) || {}
        this.motime = currentOrg.thisPeriod
        const reqData =
            (await this.webapi.operation.init({
                period: this.motime,
                opr: 0,
            })) || {}

        let time = ""
        let name = this.metaAction.context.get("currentOrg").name
        if (
            sessionStorage["stockPeriod" + name] != "undefined" &&
            sessionStorage["stockPeriod" + name]
        ) {
            time = sessionStorage["stockPeriod" + name]
        } else {
            const currentOrg = this.metaAction.context.get("currentOrg").periodDate
            sessionStorage["stockPeriod" + name] = currentOrg
            time = currentOrg
        }
        const allowMigration =
            (await this.webapi.operation.getAllowDataMigrationState({ versionNo: "2.0" })) || 0
        // 是否开启标记————状态统一来自init接口，20200205日修改，如果要来自公共接口，那公共接口period字段的参数应取init接口的startPeriod字段
        const classTag = (this.state = reqData.state
            ? STATE[reqData.state]
            : "ttk-stock-Inventory-allocation-div wqy")
        // this.metaAction.sf('data.classConfirm', classTag)
        this.metaAction.sfs({
            "data.classConfirm": classTag,
            "data.id": reqData.id,
            "data.state": reqData.state,
            "data.startPeriod": reqData.startPeriod,
            "data.loading": false,
            "data.migrationState": reqData.migrationState,
            "data.migrationType": 1,
            "data.failDesc": reqData.failDesc,
            "data.allowMigration": allowMigration,
            "data.enableBOMFlag": reqData.enableBOMFlag,
        })
        this.openFlag = reqData.state == 1 ? false : true
        this.startperiod = reqData.startPeriod
    }

    // 启用存货
    setInfo = async () => {
        const id = this.metaAction.gf("data.id")
        const currentOrg = this.metaAction.context.get("currentOrg")
        const name = currentOrg.name
        let period = ""
        // 获取会计月份
        if (
            sessionStorage["stockPeriod" + name] != undefined &&
            sessionStorage["stockPeriod" + name]
        ) {
            period = sessionStorage["stockPeriod" + name]
        } else {
            period = currentOrg.periodDate
        }

        // 设置id和企业orgId
        // const id = form.id, orgId = limit.orgId

        const res = await Modal.show({
            title: "启用存货",
            width: 700,
            footer: null,
            className: "ttk-stock-inventory-setting-modal",
            children: (
                <StockSetting webapi={this.webapi} id={id} period={period} motime={this.motime} />
            ),
        })

        if (res && res.data) {
            this.load()
        }
    }
    // 帮助的图标和说明
    renderHelp = () => {
        let text = (
            <div style={{ padding: "5px 10px", lineHeight: "25px" }}>
                <div>第一步：启用存货并配置参数</div>
                <div>第二步：建立并维护存货</div>
                <div>第三步：存货初始化</div>
            </div>
        )
        return HelpIcon(text, "bottomRight")
    }
    // 存货迁移
    handleTransfer = async () => {
        if (this.transferModaling) {
            return
        }
        this.transferModaling = true
        const orgRes = await this.webapi.operation.findOrgById({
            orgId: (this.metaAction.context.get("currentOrg") || {}).id,
        })
        const option = {
            title: "存货迁移",
            className: "stock-transfer-modal",
            width: 500,
            height: 520,
            okText: "确认",
            style: { top: 20 },
            bodyStyle: {
                padding: "24px",
                maxHeight: 520 - 47 - 55,
                borderTop: "1px solid #e9e9e9",
                overflow: "auto",
            },
            children: (
                <TransferWebCard
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    startPeriod={`${orgRes.enabledYear}-${orgRes.enabledMonth}`}
                />
            ),
        }
        const ret = await this.metaAction.modal("show", option)
        if (ret && ret.needReload) {
            this.load()
        }
        this.transferModaling = false
    }
    //存货迁移按钮
    renderTransferBtn = () => {
        const state = this.metaAction.gf("data.state")
        const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        // JCDA2019-10675 需求决定放开控制
        const allowMigration = this.metaAction.gf("data.allowMigration")
        if (allowMigration && state === 0) {
            // 未启用存货
            const btn = !xdzOrgIsStop ? <Button onClick={this.handleTransfer}>存货迁移</Button> : ''
            return btn
        }
        return null
    }
    // 返回主页面
    handleReturn = async () => {
        const res = await this.webapi.operation.clearDataMigrationState({})
        if (res && !res.result && res.error && res.error.message) {
            this.metaAction.toast("error", res.error.message)
        }
        this.load()
    }
    // 渲染存货迁移信息
    renderTransferInfo = () => {
        const migrationState = this.metaAction.gf("data.migrationState")
        const failDesc = this.metaAction.gf("data.failDesc")

        const item = {
            name: migrationState === 1 ? "transferring" : "transfer-failure",
            title: migrationState === 1 ? "存货数据迁移中" : "存货数据迁移失败",
            desc: failDesc ? (
                <div>
                    <p>失败原因：{failDesc}</p>
                    <div>
                        您可以 <a onClick={this.handleReturn}>返回 </a>{" "}
                        主页面，重新进行存货迁移或启用存货
                    </div>
                </div>
            ) : (
                <div>
                    请 <a onClick={this.load}>刷新</a> 后查看结果
                </div>
            ),
        }
        return (
            <div className="transfer-info">
                <div className={"icon " + item.name}></div>
                <div className="title">{item.title}</div>
                <div className="desc">{item.desc}</div>
            </div>
        )
    }
    // 页面渲染
    renderPage = () => {
        const loading = this.metaAction.gf("data.loading")
        const state = this.metaAction.gf("data.state")
        const migrationState = this.metaAction.gf("data.migrationState")
        if (state === 0 && (migrationState === 1 || migrationState === 3)) {
            return (
                <div className="ttk-stock-Inventory-allocation-conent">
                    <Aspin spinning={loading} tip="数据加载中...">
                        {this.renderTransferInfo()}
                    </Aspin>
                </div>
            )
        }
        return (
            <React.Fragment>
                <Spin loading={loading}></Spin>
                <div className="transfer-btn-container">{this.renderTransferBtn()}</div>
                <div className={`help-icon-container ${state === 0 ? "has-transfer-btn" : ""}`}>
                    {this.renderHelp()}
                </div>
                <div className="ttk-stock-Inventory-allocation-conent">{this.renderNavCard()}</div>
            </React.Fragment>
        )
    }

    // 转跳渲染
    renderNavCard = () => {
        let navCard = [
            {
                name: "shezhi",
                title: "存货设置",
                appName: "ttk-stock-inventory-configure",
                desc: "启用存货,并依据选定的业务类型配置数据",
            },
            {
                name: "cunhuodangan",
                title: "存货档案",
                appName: "ttk-app-inventory-list",
                desc: "建立存货档案资料",
            },
            {
                name: "jiliangdanwei",
                title: "计量单位",
                appName: "ttk-app-unit-list",
                desc: "设定主、辅计量单位",
            },
            {
                name: "qichu",
                title: "存货期初",
                appName: "ttk-stock-inventory-earlyStage",
                desc: "对存货进行初始化录入",
            },
            {
                name: "bom",
                title: "BOM设置",
                appName: "ttk-stock-app-inventory-BOM-picking-main",
                desc: "记录产品用到的相关材料和属性",
            },
        ]
        const classConfirm = this.metaAction.gf("data.classConfirm")
        const state = this.metaAction.gf("data.state") || 0
        const startPeriod = this.metaAction.gf("data.startPeriod") || "2019-01"
        let enableBOMFlag = this.metaAction.gf("data.enableBOMFlag")
        let markText
        switch (state) {
            case 1:
                markText = "已启用"
                break
            case 2:
                markText = "已停用"
                break
            default:
                navCard = [
                    {
                        name: "qiyong",
                        title: "启用存货",
                        appName: "ttk-stock-inventory-configure",
                        desc: "点击启用存货核算功能",
                    },
                ]
                markText = "未启用"
        }

        return (
            <React.Fragment>
                {navCard.map((item, index) => {
                    let className = index ? "ttk-stock-Inventory-allocation-div" : classConfirm
                    if (item.name === "bom" && !enableBOMFlag) {
                        return null
                    }
                    return (
                        <div className={className} onClick={this.navToPage(item)}>
                            <div
                                className={
                                    "ttk-stock-Inventory-allocation-conent-img " + item.name
                                }></div>
                            <span className="ttk-stock-Inventory-allocation-h2">{item.title}</span>
                            <span className="ttk-stock-Inventory-allocation-size12">
                                {item.desc}
                            </span>
                            {/* {!index && <div className='ttk-stock-Inventory-allocation-state'></div>} */}
                            {!index && (
                                <div
                                    className={
                                        "ttk-stock-Inventory-allocation-state-mark" +
                                        " mark" +
                                        state
                                    }>
                                    <div>{markText}</div>
                                    {state === 1 && <div>{startPeriod}</div>}
                                </div>
                            )}
                        </div>
                    )
                })}
            </React.Fragment>
        )
    }

    // 跳转逻辑
    navToPage = item => () => {
        const state = this.metaAction.gf("data.state") || 0
        const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        if(item.name=='qiyong' && xdzOrgIsStop){
            return
        }
        if (!state) {
            this.setInfo()
            return
        }
        if (item.name === "qichu") {
            if (this.openFlag) {
                this.metaAction.toast("error", "需启用存货模块，才能进初始化处理")
            } else {
                this.component.props.setPortalContent &&
                    this.component.props.setPortalContent(item.title, item.appName, {
                        time: this.startperiod,
                    })
            }
        } else {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(item.title, item.appName)
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
