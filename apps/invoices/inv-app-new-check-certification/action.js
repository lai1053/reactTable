import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
// import InvAppNewCheckCertificationIndex from "./components/index";
import { Button, Icon } from "edf-component"
import { fromJS } from "immutable"
import moment from "moment"
import { Spin, Tabs } from "antd"
const { TabPane } = Tabs
import CheckDeduction from "./components/checkDeduction"
import CheckDeductionStat from "./components/checkDeductionStat"
import CertificationList from "./components/certificationList"

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
        this.load()
    }
    load() {
        let vatTaxpayerNum = (this.metaAction.context.get("currentOrg") || {})
            .vatTaxpayerNum
        setTimeout(
            () => {
                if (!vatTaxpayerNum)
                    vatTaxpayerNum = (
                        this.metaAction.context.get("currentOrg") || {}
                    ).vatTaxpayerNum
                this.queryClientConnectionStateAndQuerySkssq(vatTaxpayerNum)
            },
            vatTaxpayerNum ? 0 : 3000
        )
    }
    async queryClientConnectionStateAndQuerySkssq(nsrsbh) {
        const resCC = await this.webapi.iancc.queryClientConnectionState({
            nsrsbh
        })
        let resSkssq = null
        if (resCC && resCC.clientState != 1) {
            resSkssq = await this.webapi.iancc.querySkssq({ nsrsbh })
        }
        const currentOrg = this.metaAction.context.get("currentOrg"),
            clientState = resCC && resCC.clientState,
            skssq =
                (resSkssq && resSkssq.skssq) ||
                moment(currentOrg.systemDate || new Date())
                    .subtract(1, "month")
                    .format("YYYYMM")
        this.metaAction.sfs({
            "data.nsrsbh": nsrsbh,
            "data.clientState": clientState,
            "data.skssq": skssq,
            "data.totalSignInfo": fromJS({})
        })
    }

    onChange(e) {
        this.metaAction.sf("data.current", fromJS(e))
    }
    async refresh() {
        let res = await this.webapi.iancc.queryClientConnectionState({
            nsrsbh: this.metaAction.gf("data.nsrsbh")
        })
        this.metaAction.sf("data.clientState", res.clientState)
        this.child && this.child.initPage && this.child.initPage()
    }
    async openHelp() {
        const ret = await this.metaAction.modal("show", {
            title: "",
            className: "ttk-edf-app-help-modal-content",
            wrapClassName: "ttk-edf-app-help-modal",
            footer: null,
            width: 840, //静态页面宽度840小于会有横向滚动条
            children: this.metaAction.loadApp("ttk-edf-app-help", {
                store: this.component.props.store,
                code: "inv-app-check-certification-list-2" // 查询页面对应参数
            })
        })
    }
    renderChildren = () => {
        const {
            skssq,
            nsrsbh,
            clientState,
            current,
            totalSignInfo
        } = this.metaAction.gf("data").toJS()

        //获取到纳税所属期才渲染页面
        if (skssq) {
            //如果状态是已连接 或 未连接  渲染表格
            if (clientState && (clientState === 2 || clientState === 3)) {
                return (
                    <div className="tabs-container">
                        <Tabs
                            defaultActiveKey={current || "1"}
                            onChange={::this.onChange}
                            animated={false}
                        >
                            <TabPane tab="抵扣勾选" key="1">
                                {current == "1" && (
                                    <CheckDeduction
                                        skssq={skssq}
                                        nsrsbh={nsrsbh}
                                        totalSignInfo={totalSignInfo}
                                        webapi={this.webapi}
                                        metaAction={this.metaAction}
                                        store={this.component.props.store}
                                        returnChild={child => {
                                            this.child = child
                                        }}
                                    ></CheckDeduction>
                                )}
                            </TabPane>
                            <TabPane tab="抵扣勾选统计" key="2">
                                {current == "2" && (
                                    <CheckDeductionStat
                                        skssq={skssq}
                                        nsrsbh={nsrsbh}
                                        totalSignInfo={totalSignInfo}
                                        webapi={this.webapi}
                                        metaAction={this.metaAction}
                                        clientState={clientState}
                                        returnChild={child => {
                                            this.child = child
                                        }}
                                    ></CheckDeductionStat>
                                )}
                            </TabPane>
                            <TabPane tab="认证清单" key="3">
                                {current == "3" && (
                                    <CertificationList
                                        skssq={skssq}
                                        nsrsbh={nsrsbh}
                                        webapi={this.webapi}
                                        metaAction={this.metaAction}
                                        returnChild={child => {
                                            this.child = child
                                        }}
                                    ></CertificationList>
                                )}
                            </TabPane>
                        </Tabs>
                        <div className="tool-link-state">
                            <Icon
                                type="question-circle"
                                theme="filled"
                                style={{
                                    color: "#fe9400",
                                    fontSize: "16px",
                                    marginRight: "8px",
                                    cursor: "pointer"
                                }}
                                onClick={::this.openHelp}
                            />
                            发票管理工具：
                            {clientState == 2 ? (
                                <span style={{ color: "#cc0000" }}>未连接</span>
                            ) : (
                                "已连接"
                            )}{" "}
                            &nbsp;{" "}
                            <Button
                                onClick={::this.refresh}
                                icon="reload"
                                size="small"
                            />
                        </div>
                    </div>
                )
            }
            //如果状态是未安装 渲染下载界面
            if (clientState && clientState === 1) {
                return (
                    <div className="inv-app-new-check-certification-layout">
                        <div
                            className="tool-link-state"
                            style={{ position: "absolute", top: 20, right: 20 }}
                        >
                            <Icon
                                type="question-circle"
                                theme="filled"
                                style={{
                                    color: "#fe9400",
                                    fontSize: "16px",
                                    marginRight: "8px",
                                    cursor: "pointer"
                                }}
                                onClick={::this.openHelp}
                            />
                        </div>
                        <a
                            // href="http://download.etaxcn.com/ycs/plugin/XdzInvoAuthSetup.exe"
                            // download="发票管理工具.exe"
                            // target="_blank"
                            onClick={this.downloadexe}
                        >
                            <div className="inv-app-new-check-certification-imgdiv"></div>
                        </a>
                        <p style={{ marginBottom: "6px" }}>
                            <span style={{ color: "#f17712" }}>提示：</span>
                            使用勾选认证，需要下载并在
                            <strong style={{ fontSize: "large" }}>
                                开票机
                            </strong>
                            安装【发票管理工具】，设置金税盘/税控盘密码和抵扣确认密码。
                            <br />
                            如果多个税盘用同一台开票机，则只需要安装一次【发票管理工具】，逐个企业设置密码即可！
                        </p>
                    </div>
                )
            }
            //解决react报错
            return <div></div>
        } else {
            return (
                <div className="inv-app-new-check-certification-layout">
                    <Spin tip="加载中..." delay={500}></Spin>
                </div>
            )
        }
        // return (
        //     <InvAppNewCheckCertificationIndex
        //         webapi={this.webapi}
        //         metaAction={this.metaAction}
        //         store={this.component.props.store}
        //     ></InvAppNewCheckCertificationIndex>
        // );
    }
    
    downloadexe = () => { // 兼容客户端
        window.open('http://download.etaxcn.com/ycs/plugin/XdzInvoAuthSetup.exe', "_blank", undefined, undefined, 'download')
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
