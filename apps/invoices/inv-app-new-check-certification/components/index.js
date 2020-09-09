import React from "react";
import { Button, Icon } from "edf-component";
import moment from "moment";
import { Spin, Tabs } from "antd";
const { TabPane } = Tabs;
import CheckDeduction from "./checkDeduction";
import CheckDeductionStat from "./checkDeductionStat";
import CertificationList from "./certificationList";

export default class InvAppNewCheckCertificationIndex extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nsrsbh: "",
            skssq: null,
            clientState: null,
            current: "1"
        };
        this.webapi = props.webapi;
        this.metaAction = props.metaAction || {};
        this.store = props.store;
    }
    componentDidMount() {
        let vatTaxpayerNum = (this.metaAction.context.get("currentOrg") || {})
            .vatTaxpayerNum;
        setTimeout(
            () => {
                if (!vatTaxpayerNum)
                    vatTaxpayerNum = (
                        this.metaAction.context.get("currentOrg") || {}
                    ).vatTaxpayerNum;
                this.queryClientConnectionStateAndQuerySkssq(vatTaxpayerNum);
            },
            vatTaxpayerNum ? 0 : 3000
        );
    }
    async queryClientConnectionStateAndQuerySkssq(nsrsbh) {
        const resCC = await this.webapi.iancc.queryClientConnectionState({
            nsrsbh
        });
        let resSkssq = null;
        if (resCC && resCC.clientState != 1) {
            resSkssq = await this.webapi.iancc.querySkssq({ nsrsbh });
        }
        const currentOrg = this.metaAction.context.get("currentOrg"),
            clientState = resCC && resCC.clientState,
            skssq =
                (resSkssq && resSkssq.skssq) ||
                moment(currentOrg.systemDate || new Date())
                    .subtract(1, "month")
                    .format("YYYYMM");
        // const totalSignRes = await this.webapi.iancc.queryTotalSignStateAndSignFailInfo({ nsrsbh, skssq })

        this.setState({
            nsrsbh,
            clientState,
            skssq,
            totalSignInfo: {}
        });
    }

    onChange(e) {
        this.setState({
            current: e
        });
    }
    async refresh() {
        let res = await this.webapi.iancc.queryClientConnectionState({
            nsrsbh: this.state.nsrsbh
        });
        this.setState({
            clientState: res.clientState
        });
        this.child && this.child.initPage && this.child.initPage();
    }
    async openHelp() {
        const ret = await this.metaAction.modal("show", {
            title: "",
            className: "ttk-edf-app-help-modal-content",
            wrapClassName: "ttk-edf-app-help-modal",
            footer: null,
            width: 840, //静态页面宽度840小于会有横向滚动条
            children: this.metaAction.loadApp("ttk-edf-app-help", {
                store: this.store,
                code: "inv-app-check-certification-list-2" // 查询页面对应参数
            })
        });
    }
    render() {
        const {
            skssq,
            nsrsbh,
            clientState,
            current,
            totalSignInfo
        } = this.state;

        //获取到纳税所属期才渲染页面
        if (skssq) {
            //如果状态是已连接 或 未连接  渲染表格
            if (clientState && (clientState === 2 || clientState === 3)) {
                return (
                    <div className="tabs-container">
                        <Tabs
                            defaultActiveKey="1"
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
                                        store={this.store}
                                        returnChild={child => {
                                            this.child = child;
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
                                            this.child = child;
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
                                            this.child = child;
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
                );
            }
            //如果状态是未安装 渲染下载界面
            if (clientState && clientState === 1) {
                return (
                    <div className="inv-app-new-check-certification-layout">
                        <a
                            href="http://download.etaxcn.com/ycs/plugin/XdzInvoAuthSetup.exe"
                            download="发票管理工具.exe"
                        >
                            <div className="inv-app-new-check-certification-imgdiv"></div>
                        </a>
                        <p style={{ marginBottom: "6px" }}>
                            <span style={{ color: "#f17712" }}>提示：</span>
                            使用勾选认证，需要下载并在
                            <strong style={{ fontSize: "large" }}>
                                开票机
                            </strong>
                            安装【发票管理工具】，设置金税盘/税控盘密码。
                            <br />
                            如果多个税盘用同一台开票机，则只需要安装一次【发票管理工具】，逐个企业设置税盘密码即可！
                        </p>
                    </div>
                );
            }
            //解决react报错
            return <div></div>;
        } else {
            return (
                <div className="inv-app-new-check-certification-layout">
                    <Spin tip="加载中..." delay={500}></Spin>
                </div>
            );
        }
    }
}
