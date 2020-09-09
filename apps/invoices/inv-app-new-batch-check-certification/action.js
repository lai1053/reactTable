import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
import Table from "./components/table"
import Header from "./components/header"
import { fromJS } from "immutable"
import { Modal } from "antd"

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
        this.initPage()
    }
    // 初始化页面表格数据
    async initPage(pageIndex, currentPageSize) {
        const { params, pageSize, currentPage, checked } = this.metaAction
            .gf("data")
            .toJS()
        this.metaAction.sf("data.loading", true)

        let obj = {
            entity: {
                clientState: params.clientState,
                totalSignState: params.totalSignState
            },
            signable: checked, //是否可签
            dataAuthorityType: "self", // 数据权限
            customerNameOrMemCode: params.customerNameOrMemCode, // 模糊查找字段，客户名称或助记码
            // 分页信息（是否全选标志为0，即不是全选的时候，必传；是否全选标志为1，即是全选的时候，不传）
            page: {
                currentPage: pageIndex || currentPage,
                pageSize: currentPageSize || pageSize
            }
        }
        const res = await this.webapi.ianbcc.queryBatchGxrzPageList(obj)
        res &&
            this.metaAction.sfs({
                "data.tableSource": fromJS(res.list || []),
                "data.totalCount": (res.page && res.page.totalCount) || 0,
                "data.loading": false,
                "data.pageSize": currentPageSize || pageSize,
                "data.currentPage": pageIndex || currentPage
            })
    }
    // 取消预约－单户
    async cancelBooked(record) {
        const res = await this.webapi.ianbcc.cancelBookedSignRequestFromBatch({
            skssq: record.skssq,
            nsrsbh: record.nsrsbh,
            qyId: record.qyId,
            isReturnValue: true
        })
        if (res && !res.result && res.error && res.error.message) {
            this.metaAction.toast("error", res.error.message)
        } else {
            this.metaAction.toast("success", "取消成功")
            this.initPage()
        }
    }
    // 跳转到勾选页面
    gotoGouXuan(record) {
        let appName = "inv-app-new-check-certification",
            title = "勾选认证",
            params = {}
        if (this.component.props.setGlobalContentWithDanhuMenu) {
            this.component.props.setGlobalContentWithDanhuMenu({
                pageName: record.customerName,
                name: "勾选认证2.0",
                appName: appName,
                params,
                orgId: record.qyId
                // showHeader: true,
            })
        } else if (this.component.props.setGlobalContent) {
            this.component.props.setGlobalContent({
                name: "勾选认证2.0",
                appName: appName,
                params,
                orgId: record.qyId
                // showHeader: true,
            })
        } else if (this.component.props.openDanhu) {
            this.component.props.openDanhu(record.qyId, appName, title)
        } else if (this.component.props.onRedirect) {
            this.component.props.onRedirect({ appName })
        } else {
            this.metaAction.toast("error", "进入方式不对")
        }
    }
    // 跳转到税局
    async gotoTaxBureau(record) {
        const res = await this.webapi.ianbcc.getOrgAddressFromSj({
            orgId: record.qyId,
            linkCode: 1200515
        })
        if (res) {
            window.open(res)
        } else {
            this.metaAction.toast(
                "error",
                "发票综合服务平台打开失败，原因：未获取到有效的地址！"
            )
        }
    }
    // 批量预约签名;批量签名
    async batchSubmit(type) {
        const { selectedRowKeys, tableSource } = this.metaAction
                .gf("data")
                .toJS(),
            unLinkList = [],
            arr = selectedRowKeys.map(e => {
                let obj = tableSource.find(f => String(e) === String(f.qyId))
                if (type === "batchStatistics" && obj.clientState === 2)
                    unLinkList.push(obj.customerName)
                return {
                    skssq: obj.skssq,
                    qyId: obj.qyId,
                    nsrsbh: obj.nsrsbh,
                    xzqhdm: obj.xzqhdm
                }
            })
        if (arr.length > 0) {
            this.confimSubmit({
                batchNum: arr.length || 0,
                submitList: arr,
                submitType: type,
                unLinkList
            })
        } else {
            await this.metaAction.modal("warning", {
                width: "380px",
                className: "inv-app-new-batch-check-certification-warn-modal",
                okText: "确定",
                content: (
                    <div
                        style={{
                            fontSize: "14px",
                            lineHeight: "22px",
                            marginTop: "-8px"
                        }}
                    >
                        请至少选择一个客户
                    </div>
                )
            })
        }
    }
    async confimSubmit(params) {
        const { submitList, batchNum, submitType, unLinkList } = params
        if (unLinkList && unLinkList.length > 0) {
            const res = await this.metaAction.modal("show", {
                title: "批量签名",
                wrapClassName: "inv-app-new-batch-check-certification-modal",
                okText: "继续签名",
                children: (
                    <React.Fragment>
                        <div
                            style={{
                                paddingTop: "20px",
                                marginBottom: "20px",
                                fontSize: "14px"
                            }}
                        >
                            <span>已选</span>
                            <span style={{ color: "#f17712" }}>{batchNum}</span>
                            <span>户，有</span>
                            <span style={{ color: "#f00" }}>
                                {` ${unLinkList.length} `}
                            </span>
                            <span>户不支持批量签名</span>
                        </div>

                        <div
                            style={{ paddingBottom: "80px", fontSize: "12px" }}
                        >
                            <div style={{ color: "#f00" }}>不支持原因：</div>
                            <div>
                                {unLinkList.map(
                                    m =>
                                        `${m}：发票管理工具未连接，连接后再操作，或选择【批量预约签名】`
                                )}
                            </div>
                        </div>
                    </React.Fragment>
                )
            })
            if (res) {
                this.batchRequest(params)
            }
            return
        }
        const ret = await this.metaAction.modal("confirm", {
            style: { top: 5 },
            className: "inv-app-new-batch-check-certification-modal-confirm",
            title: submitType === "batchBooked" ? "批量预约签名" : "批量签名",
            width: 480,
            okText: "确认",
            content: (
                <React.Fragment>
                    <div
                        style={{
                            paddingTop: "20px",
                            marginBottom: "20px",
                            fontSize: "14px"
                        }}
                    >
                        <span>请确认将这</span>
                        <span
                            style={{ color: "#f17712" }}
                        >{` ${batchNum} `}</span>
                        <span>
                            户提交{submitType === "batchBooked" ? "预约" : ""}
                            签名？
                        </span>
                    </div>
                    {submitType !== "batchBooked" && (
                        <div style={{ fontSize: "12px" }}>
                            <span style={{ color: "#f17712" }}>温馨提示：</span>
                            <span style={{ color: "#a8a8a8" }}>
                                签名是将待认证发票，发送至发票综合服务平台，一键完成勾选、统计、签名！
                            </span>
                        </div>
                    )}
                </React.Fragment>
            )
        })
        if (ret) {
            this.batchRequest(params)
        }
        return
    }
    async batchRequest(params) {
        const { submitList, submitType } = params,
            apiFn =
                submitType === "batchBooked"
                    ? "batchSubmitBookedSignRequest"
                    : "batchSubmitSignRequest"
        await this.metaAction.modal("info", {
            style: { top: 5 },
            className: "inv-app-new-batch-check-certification-modal-info",
            title:
                submitType === "batchBooked" ? "预约签名提交中" : "签名提交中",
            icon: (
                <div className="inv-app-new-batch-check-certification-link-modal-loading"></div>
            ),
            width: 420,
            okText: "确定",
            content: (
                <React.Fragment>
                    <div
                        style={{
                            color: "#f17712"
                        }}
                    >
                        提示：
                    </div>
                    <div
                        style={{
                            color: "#d0d0d0"
                        }}
                    >
                        {submitType === "batchBooked"
                            ? "预约签名提交后，发票管理工具已连接，会自动签名！"
                            : "签名，预计需要10分钟左右时间，请保持发票管理工具已连接状态！"}
                    </div>
                </React.Fragment>
            )
        })
        const res = await this.webapi.ianbcc[apiFn](submitList)
        res === null && this.initPage()
    }
    renderChildren = () => {
        return (
            <React.Fragment>
                <Header
                    metaAction={this.metaAction}
                    initPage={::this.initPage}
                    batchSubmit={::this.batchSubmit}
                    store={this.component.props.store}
                    {...this.metaAction.gf("data").toJS()}
                ></Header>
                <Table
                    cancelBooked={::this.cancelBooked}
                    gotoGouXuan={::this.gotoGouXuan}
                    gotoTaxBureau={::this.gotoTaxBureau}
                    metaAction={this.metaAction}
                    initPage={::this.initPage}
                    {...this.metaAction.gf("data").toJS()}
                ></Table>
            </React.Fragment>
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
