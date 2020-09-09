import React, { PureComponent } from "react"
import { action as MetaAction } from "edf-meta-engine"
import { Radio, message, Button, Input, Select } from "antd"
// import { VirtualTable } from "edf-component"
import config from "./config"
// import { fetch } from 'edf-utils'
import { addEvent, removeEvent } from "../utils/index"

import InvoiceComs from "./invoiceComs"

// import VirtualSelect from '../component/VirtualSelect'
// import VirtualTable from "./components/index"
// import SuperSelect from "../component/SuperSelect"

import SuperSelect from "../component/SuperSelect"
import SimpleTable from "./demos/SimpleTable"
import FixedRightTable from "./demos/FixedRightTable"
import HeaderGroupTable from "./demos/HeaderGroupTable"
import ColSpanTable from "./demos/ColSpanTable"
import RowSpanTable from "./demos/RowSpanTable"
import ColResizeTable from "./demos/ColResizeTable"
import PaginatedTable from "./demos/PaginatedTable"
import ExpandableTable from "./demos/ExpandableTable"
import CRUModal from "./demos/CRUModal"

import EditableTable from "./demos/EditableTable"
import ColResizeDataGrid from "./demos/ColResizeDataGrid"
import AutoMatchSetting from "../../bovms/components/autoMatchSetting"

import { fromJS, toJS } from "immutable"
import {
    // printComponent,
    // printHtml，
    printExistingElement,
} from "../components/print"

// function testable(target) {
//     target.isTestable = true
// }

// @testable
// class MyTestableClass {}
const affixList = [
    {
        name: "HeaderGroupTable",
        title: "多层表头",
        startTop: 0,
        endTop: 664,
        current: false,
    },
    {
        name: 'EditableTable"',
        title: "编辑行",
        startTop: 664,
        endTop: 1148,
        current: false,
    },
    {
        name: 'PaginatedTable"',
        title: "分页表格",
        startTop: 1148,
        endTop: 1727,
        current: false,
    },
    {
        name: 'ColResizeTable"',
        title: "伸缩列",
        startTop: 1727,
        endTop: 2225,
        current: false,
    },
    {
        name: 'ExpandableTable"',
        title: "可展开",
        startTop: 2225,
        endTop: 2730,
        current: false,
    },
    {
        name: 'SimpleTable"',
        title: "简单表格、合计行",
        startTop: 2730,
        endTop: 3228,
        current: false,
    },
    {
        name: 'FixedRightTable"',
        title: "固定列",
        startTop: 3228,
        endTop: 3731,
        current: false,
    },
    {
        name: 'ColSpanTable"',
        title: "列合并",
        startTop: 3731,
        endTop: 4230,
        current: false,
    },
    {
        name: 'RowSpanTable"',
        title: "行合并",
        startTop: 4230,
        endTop: 4730,
        current: false,
    },
    {
        name: "EditableCellTable",
        title: "编辑单元格",
        startTop: 4730,
        endTop: 4762,
        current: false,
    },
    {
        name: "ColResizeDataGrid",
        title: "DatGrid伸缩列",
        startTop: 4762,
        endTop: 5262,
        current: false,
    },
]

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.selectRef = React.createRef()
        // className
        // this.dropdownClassName = `v-dc${+new Date()}`;
        // console.log("MyTestableClass:", MyTestableClass.isTestable)
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce("init")
    }
    async printHander() {
        await printExistingElement(".header-group-table")
        // await printComponent(<HeaderGroupTable />);
    }
    // cru弹窗
    addOrEditModal = async (id, isReadOnly) => {
        const height = document.body.clientHeight - 40 || 700
        const width = document.body.clientWidth - 50 || 1000
        const option = {
            title: isReadOnly ? "查看单据" : "弹窗编辑",
            className: "cru-modal",
            width: width,
            height: height,
            okText: "保存",
            style: { top: 20 },
            bodyStyle: {
                padding: "24px",
                maxHeight: height - 47 - 55,
                borderTop: "1px solid #e9e9e9",
                overflow: "auto",
            },
            children: (
                <CRUModal
                    height={height}
                    width={width}
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    id={id}
                    isReadOnly={isReadOnly}></CRUModal>
            ),
        }
        if (isReadOnly) {
            option.footer = null
            option.closeBack = back => {
                this.closeTip = back
            }
        }
        const ret = await this.metaAction.modal("show", option)
        if (ret && ret.needReload) {
            this.initPage()
        }
    }
    showTest = () => {
        this.metaAction.modal("show", {
            title: "核算精度和自动匹配设置",
            style: { top: 25 },
            width: 960,
            footer:null,
            children: (
                <AutoMatchSetting
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                    yearPeriod={202006}
                    module={2}
                    inventoryEnableState={1}
                />
            )
        })
    }
    renderChildren = () => {
        let options = []
        new Array(1000).fill(1).forEach((item, index) => {
            options.push(<Select.Option key={index}>{`opt ${index + 1}`}</Select.Option>)
        })
        const selectVal = this.metaAction.gf("data.selectVal")
        const affixChildren = this.renderAffix()
        return (
            <div>
                <SuperSelect
                    style={{ width: 300 }}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                        if (option.props.children && typeof option.props.children !== "string") {
                            return true
                        }
                        return option.props.children && typeof option.props.children === "string"
                            ? option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            : false
                    }}>
                    {options}
                </SuperSelect>
                {/* <Button onClick={this.showInvoiceComs.bind(this)}>发票组件</Button> */}
                <div className="affix">{affixChildren}</div>
                <h1>多层表头</h1>
                <HeaderGroupTable />
                <h1>编辑行</h1>
                <EditableTable />
                <h1>分页表格</h1>
                <PaginatedTable></PaginatedTable>
                <h1>伸缩列</h1>
                <ColResizeTable />
                <h1>可展开</h1>
                <ExpandableTable></ExpandableTable>
                <h1>简单表格、合计行</h1>
                <SimpleTable />
                <h1>固定列</h1>
                <FixedRightTable />
                <h1>列合并</h1>
                <ColSpanTable />
                <h1>行合并</h1>
                <RowSpanTable />
                <h1>编辑单元格</h1>
                <Button onClick={::this.addOrEditModal}>编辑单元格－弹窗显示</Button>
            <Button onClick={this.printHander}>只打印 HeaderGroupTable</Button>
            <h1>DatGrid伸缩列</h1>
            <ColResizeDataGrid />
            </div >
        )
    }

    renderAffix = () => {
        const affixCurrent = this.metaAction.gf("data.affixCurrent") || affixList[0].name
        return affixList.map(item => (
            <a
                key={item.name}
                onClick={() => this.handerAffixLiClick(item.name, item.startTop)}
                className={affixCurrent === item.name ? "current" : ""}>
                {item.title}
            </a>
        ))
    }
    handerAffixLiClick = (name, startTop) => {
        this.metaAction.sf("data.affixCurrent", name)
        const rootDom = document.querySelector(".edfx-app-root")
        rootDom.scrollTop = startTop
    }
    getAffixCurrent = e => {
        const scrollTop = e.currentTarget.scrollTop
        for (let i = 0; i < affixList.length; i++) {
            const item = affixList[i]
            if (item.startTop < scrollTop && item.endTop > scrollTop) {
                this.metaAction.sf("data.affixCurrent", item.name)
                break
            }
        }
    }
    componentDidMount = () => {
        const rootDom = document.querySelector(".edfx-app-root")
        addEvent(rootDom, "scroll", this.getAffixCurrent)
        const search = location.hash && location.hash.split("?")
        if (Array.isArray(search) && search[1]) {
            const current = affixList.find(f => f.name === search[1])
            if (current) rootDom.scrollTop = current.startTop
        }
    }
    componentWillUnmount = () => {
        removeEvent(document.querySelector(".edfx-app-root"), "scroll", this.getAffixCurrent)
    }
    comfirm = async t => {
        if (t) {
            let title = ""
            switch (t) {
                case "inv-app-sales-del":
                    title = "删除销项发票"
                    break
            }
            const res = await this.metaAction.modal("confirm", {
                content: "你确定删除这条记录么？",
            })
            // if (res) {
            //     this.metaAction.toast('success', '删除成功')
            // } else {
            //     this.metaAction.toast('error', '删除失败')
            // }
        }
    }
    handerChange = (t, fplx, fpzlDm, readOnly) => {
        if (t && typeof t == "string") {
            let title = "",
                data = null,
                noFooter = false
            switch (t) {
                case "inv-app-sales-zzsfp":
                    title = "增值税普通发票(销项)－新增"
                    break
                case "inv-app-sales-jdcxsfp":
                    title = "机动车销售发票(销项)-新增"
                    break
                case "inv-app-sales-zzsptfp":
                    title = "增值税普通发票(销项)-新增"
                    break
                case "inv-app-sales-ptjdfp":
                    title = "普通机打发票(销项)-新增"
                    break
                case "inv-app-sales-nsjctz":
                    title = "纳税检查调整(销项)-新增"
                    break
                case "inv-app-sales-wkjfp":
                    title = "未开具发票(销项)-新增"
                    break
                case "inv-app-sales-collect-card":
                    title = "一键读取销项"
                    // noFooter = true
                    break
                case "inv-app-sales-export-card":
                    title = "导出销项发票"
                    break
                case "inv-app-sales-batch-update-card":
                    title = "批量修改销项发票"
                    data = {}
                    break
                case "inv-app-pu-collect-card":
                    title = "一键读取进项"
                    break
                case "inv-app-sales-invoice-card":
                    if (fpzlDm === "07") {
                        title = "二手车统一销售发票"
                    } else if (fpzlDm === "99") {
                        title = "其他票据"
                    }
                    break
                default:
                    title = "弹窗"
                    break
            }
            let option = {
                title: title,
                className: t + "-modal",
                width: 1000,
                top: 20,
                okText: "确定",
                // footer: null,
                centered: true,
                bodyStyle: {
                    padding: "0px",
                    borderTop: "1px solid #e9e9e9",
                },
                children: this.metaAction.loadApp(t, {
                    store: this.component.props.store,
                    readOnly,
                    nsqj: "201909",
                    kjxh: null, //7377670868748289,
                    fplx,
                    fpzlDm,
                    fromModule: t === "inv-app-pu-vats-invoice-card" ? "InvoiceAuthentication" : "",
                }),
            }
            if (readOnly) {
                option.footer = null
            }
            this.metaAction.modal("show", option)
        }
    }
    showInvoiceComs = async () => {
        const res = await this.metaAction.modal("show", {
            title: "发票组件",
            width: 1100,
            style: {
                top: 5,
            },
            wrapClassName: "inv-app-pu-tourist-transport-invoice-card-wrap",
            bodyStyle: {
                padding: "0px 0 12px 0",
            },
            children: <InvoiceComs></InvoiceComs>,
        })
    }
    handleAddTouristTransportInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "旅客运输服务抵扣凭证(进项)-新增",
            width: 1000,
            style: {
                top: 5,
            },
            okText: "保存",
            cancelText: "关闭",
            wrapClassName: "inv-app-pu-tourist-transport-invoice-card-wrap",
            bodyStyle: {
                padding: "0px 0 12px 0",
            },
            children: this.metaAction.loadApp("inv-app-pu-tourist-transport-invoice-card", {
                store: this.component.props.store,
            }),
        })
    }

    handleAddPuVatsInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "增值税专用发票(进项)-新增",
            width: "80%",
            style: {
                top: 5,
            },
            okText: "保存",
            cancelText: "关闭",
            wrapClassName: "inv-app-pu-vats-invoice-card-wrap",
            bodyStyle: {
                padding: "0px 0 12px 0",
            },
            children: this.metaAction.loadApp("inv-app-pu-vats-invoice-card", {
                store: this.component.props.store,
            }),
        })
    }

    handleAddPuMvsInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "机动车销售发票(进项)-新增",
            width: "80%",
            style: {
                top: 5,
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0",
            },
            children: this.metaAction.loadApp("inv-app-pu-mvs-invoice-card", {
                store: this.component.props.store,
            }),
        })
    }

    handleAddPuVatoInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "增值税普通发票(进项)-新增",
            width: "80%",
            style: {
                top: 5,
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0",
            },
            children: this.metaAction.loadApp("inv-app-pu-vato-invoice-card", {
                store: this.component.props.store,
            }),
        })
    }

    handleAddPuCdpiInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "海关专用缴款书(进项)-新增",
            width: "80%",
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0",
            },
            children: this.metaAction.loadApp("inv-app-pu-cdpi-invoice-card", {
                store: this.component.props.store,
            }),
        })
    }

    handleAddPuWidthholdInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "代扣代缴专用缴款书(进项)-新增",
            width: "80%",
            style: {
                top: 5,
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0",
            },
            children: this.metaAction.loadApp("inv-app-pu-withhold-invoice-card", {
                store: this.component.props.store,
            }),
        })
    }

    handleAddPuUniformInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "统一收购发票(进项)-新增",
            width: "80%",
            style: {
                top: 5,
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0",
            },
            children: this.metaAction.loadApp("inv-app-pu-uniform-invoice-card", {
                store: this.component.props.store,
            }),
        })
    }

    handleAddPuAgriculturalInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "农产品销售发票(进项)-新增",
            width: "80%",
            style: {
                top: 5,
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0",
            },
            children: this.metaAction.loadApp("inv-app-pu-agricultural-invoice-card", {
                store: this.component.props.store,
            }),
        })
    }

    handleAddPuTollInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "通行费发票(进项)-新增",
            width: "80%",
            style: {
                top: 5,
            },
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: {
                padding: "0px 0 12px 0",
            },
            children: this.metaAction.loadApp("inv-app-pu-toll-invoice-card", {
                store: this.component.props.store,
            }),
        })
    }

    handleBatchUpdateInvoice = async () => {
        const res = await this.metaAction.modal("show", {
            title: "进项发票批量修改",
            width: 600,
            okText: "保存",
            bodyStyle: {
                padding: "12px 24px",
            },
            children: this.metaAction.loadApp("inv-app-pu-batch-update-invoice", {
                store: this.component.props.store,
            }),
        })
    }
    onRedirect = (option, e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }
        if (option.appName) {
            window.location.href = `${location.origin}/#/edfx-app-root/${option.appName}`
            // this.component.props.onRedirect(option)
        }
    }
    onPortalChange = (option, e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }

        if (this.component.props.openDanhu) {
            let qyId =
                (this.metaAction.context.get("currentOrg") || {}).qyId ||
                "6857895587756032" ||
                "6863209271503872"
            // console.log('onPortalChange:', qyId)
            // this.component.props.setGlobalContent({
            //     name: option.title,
            //     appName: option.appName,
            //     params: { qyId: qyId },
            //     orgId: qyId,
            //     showHeader: true
            // })
            this.component.props.openDanhu(qyId, option.appName, option.title)
        }
    }
    // 关闭弹窗
    destroyDialog = wrapClassName => {
        const dialog = document.getElementsByClassName(wrapClassName)[0].parentNode.parentNode
        document.body.removeChild(dialog)
    }
    downloadInvoices = () => {
        // if(){

        // }
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
        this.destroyDialog("inv-app-pu-export-dialog")
        const currentOrg = this.metaAction.context.get("currentOrg")
        const params = {
            // qyId: currentOrg.id,
            skssq: currentOrg.periodDate, //-- 税款属期
            nsrsbh: currentOrg.vatTaxpayerNum, //-- 纳税人识别号
            nsrmc: currentOrg.name,
            nsrxz: currentOrg.swVatTaxpayer, //-- 纳税人性质：一般纳税人（"YBNSRZZS"）或者小规模纳税人（"XGMZZS"）
        }
        let response
        if (radioSelected === "exportFpInSummary") {
            response = await this.webapi.invoices.exportJxfpInSummary(params)
        } else {
            response = await this.webapi.invoices.exportJxfpInDetail(params)
        }
        response.then(res => {
            if (res.result === true) {
                message.success("导出成功！", 1000)
            } else {
                message.error(`导出失败，失败原因是${res.error.message}`, 1500)
            }
        })
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({
        metaHandlers: ret,
    })

    return ret
}
