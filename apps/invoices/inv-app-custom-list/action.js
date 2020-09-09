import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import { fromJS } from "immutable"
import { Icon, Tooltip, Table, Button } from "edf-component"
import { Dropdown, Menu } from "antd"
import { message } from "antd"
import LoadInvoice from "./component/LoadInvoice"
import config from "./config"
import {
    generalBtnType, // 网报区一般纳税人页面内按钮
    smallBtnType, // 网报区小规模纳税人页面按钮
    generalBtnType_NonNetwork, // 非网报区一般纳税人页面内按钮
    smallBtnType_NonNetwork, // 非网报区小规模纳税人页面按钮
    Tips,
    nonNetworkTips,
    retCol,
} from "./fixedData"
import SetLimit from "./component/SetLimit"
import RenderTree from "./component/RenderTree"
import utils from "edf-utils"
import moment from "moment"
import isEqual from "lodash.isequal"
import MonthDetail from "./component/MonthDetail"
import CollectResultList from "../commonComponent/CollectResultList"

/*采集状态*/
const PICKINGSTATUS = {
    0: "check-circle", // 采集成功
    1: "exclamation-circle", // 采集失败
    2: "clock-circle", // 采集中
}

const resultColumns = [
    {
        title: "发票月份",
        dataIndex: "skssq",
        key: "skssq",
        width: 100,
        align: "center",
    },
    {
        title: "读取结果",
        dataIndex: "fs",
        key: "fs",
        render: (text, record) => (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div>
                    成功 <strong>{record.cghs}</strong> 户
                </div>{" "}
                &nbsp;&nbsp;
                <div>
                    失败 <strong style={{ color: "red" }}>{record.sbhs}</strong> 户
                </div>{" "}
                &nbsp;&nbsp;
                {record.cjzhs > 0 && (
                    <div>
                        采集中 <strong>{record.cjzhs}</strong> 户
                    </div>
                )}
            </div>
        ),
    },
]

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
        //const currentOrg = this.metaAction.context.get("currentOrg") || {}
        this.nsqj = moment().format("YYYYMM") //currentOrg.periodDate;
        this.queryInvoicePlatform()
        this.initPage()
        this.queryDetail()
        // const { invoiceVersion } = currentOrg
        // 再次进入 refresh
        let addEventListener = this.component.props.addEventListener
        // if (addEventListener) {
        //     addEventListener('onTabFocus', ::this.initPage);
        // }
    }

    /**
     * @description: 检测是否显示 "平台采集" 和 “一键读取销进项” 按钮,（网报区或是非网报区）
     * @return "codeType": "返回类型 1：显示发票平台采集，0：不显示发票平台采集"
     */
    queryInvoicePlatform = async () => {
        const platFormReq = this.webapi.invoice.queryInvoicePlatform({})
        let platForm = await platFormReq
        let invoicePlatForm = platForm.codeType // codeType  0：非网报区，显示平台采集按钮；1：网报区，不显示平台采集按钮
        this.metaAction.sfs({
            "data.invoicePlatForm": invoicePlatForm,
        })
    }

    // 获取权限
    queryDetail = async () => {
        const queryUserReq = this.webapi.invoice.queryUserDetail("")
        let res = await queryUserReq
        let rolePreset = res.rolePreset
        if (rolePreset) {
            this.metaAction.sf("data.userDetail", rolePreset)
        }
        //  权限控制按钮
        const data = this.metaAction.gf("data").toJS()
        const { TaxpayerNature, invoicePlatForm } = data
        // const  = this.metaAction.gf('data.TaxpayerNature')
        // let btns = TaxpayerNature === '0' ? generalBtnType : smallBtnType
        console.log(invoicePlatForm, TaxpayerNature, '::::::')
        let btns = ""
        if (invoicePlatForm == 1) {  // 非网报区
            btns = TaxpayerNature === "0" ? generalBtnType_NonNetwork : smallBtnType_NonNetwork

        } else {  // 网报区
            btns = TaxpayerNature === "0" ? generalBtnType : smallBtnType
        }

        // 判断是否显示平台采集按钮
        let btnType = JSON.parse(JSON.stringify(btns))

        if (rolePreset === 2) {
            btnType.forEach(item => {
                if (item.key !== "setLimitData") item.disabled = true
            })
        } else if (rolePreset === 1) {
            btnType.forEach(item => {
                if (item.key !== "setLimitData") item.disabled = false
            })
        }
        this.metaAction.sfs({
            "data.btnType": fromJS(btnType),
        })
    }

    handleButtonClick = () => {}

    handleMenuClick = () => {}

    renderHeaderBtn = () => {
        const data = this.metaAction.gf("data").toJS()
        const { btnType = [], helpTooltip } = data
        const btnEle = btnType.map(item => {
            let ele
            if (item.type === "Dropdown") {
                // 平台采集按钮
                ele = (
                    <Dropdown.Button
                        type="primary"
                        className={item.name}
                        onClick={this.handleButtonClick}
                        overlay={
                            <Menu onClick={this.handleMenuClick}>
                                {item.menuItems.map(v => (
                                    <Menu.Item key={v.key}>{v.children}</Menu.Item>
                                ))}
                            </Menu>
                        }
                        icon={<Icon type="down-out-lined" />}>
                        {item.children}
                    </Dropdown.Button>
                )
            } else {
                ele = (
                    <Tooltip
                        title={item.tooltipKey === true ? helpTooltip : ""}
                        placement="bottomLeft"
                        overlayClassName="inv-batch-custom-header-right-help-tooltip"
                        style={{
                            display: "inline-block",
                            backgroundColor: "white",
                        }}>
                        <Button
                            name={item.name}
                            style={{ marginRight: "8px" }}
                            className={item.className}
                            type={item.type}
                            disabled={item.disabled}
                            onClick={() => {
                                this.judgeChoseBill(item.key)
                            }}>
                            {item.children}
                        </Button>
                    </Tooltip>
                )
            }

            return ele
        })

        return <React.Fragment>{btnEle} </React.Fragment>
    }

    initPage = () => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        let { invoiceVersion } = currentOrg
        this.metaAction.sfs({
            "data.TaxpayerNature": "0",
            "data.nsqj": (this.nsqj && moment(this.nsqj, "YYYY-MM")) || "",
            "data.inputVal": "",
            "data.helpTooltip":
                invoiceVersion === 2
                    ? "可以读取税务发票、远程提取发票和票税宝上传发票"
                    : "可以读取税务发票、远程提取发票和票税宝上传发票，并对导入发票补全明细",
        })
        let filterFormOld = this.metaAction.gf("data.filterFormOld").toJS()
        this.metaAction.sf("data.filterForm", fromJS(filterFormOld))
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        this.metaAction.sf("data.pagination", fromJS(pagination))
        this.getColumns()
        this.load()
    }

    handleReset = data => {
        this.metaAction.sfs({
            "data.khRange": "self",
            "data.departments": undefined,
        })
        setTimeout(() => {
            this.load()
        }, 100)
    }
    renderTree = () => {
        let permission = this.metaAction.gf("data.other.permission").toJS()
        let showbm = this.metaAction.gf("data.showbm")
        this.metaAction.sf("data.ifgs", permission.all ? "公司的客户" : "部门的客户")
        return (
            <RenderTree
                treeData={permission.treeData || []}
                title={permission.all ? "公司的客户" : "部门的客户"}
                // self={permission.self || '分配我的客户'}
                self={showbm}
                onConfirm={this.handleConfirm}
                onReset={this.handleReset}
                setmda={this.setmda}
            />
        )
    }
    setmda = (path, val) => {
        this.metaAction.sf(path, val)
    }
    handleConfirm = async data => {
        // khRange
        let checked = data,
            maxde = this.metaAction.gf("data.maxde"),
            khRange = "self",
            permissionAll = this.metaAction.gf("data.other.permission.all")
        if (checked && checked.length > 0) {
            khRange = "dept"
        }
        if (
            Array.isArray(checked) &&
            checked.findIndex(f => f == maxde) > -1 &&
            permissionAll === "all"
        ) {
            khRange = "all"
        }
        this.metaAction.sfs({
            "data.checkedKeys.checked": data,
            "data.khRange": khRange,
            "data.departments": checked || undefined,
        })
        setTimeout(() => {
            this.load()
        }, 100)
    }
    getColumns = async () => {
        const TaxpayerNature = this.metaAction.gf("data.TaxpayerNature")
        const pageID = TaxpayerNature === "0" ? "batchCustomGeneral" : "batchCustomSmall"
        const resp = await this.webapi.invoice.queryColumnVo({
            pageID,
        })
        if (!this.mounted) return
        // columnsData(封装了小规模和一般纳税人列数据)
        // columns（当前要显示的列数据）
        // const currentOrg = this.metaAction.context.get("currentOrg") || {}
        // const { invoiceVersion } = currentOrg
        const columnData = this.metaAction.gf("data.columnData").toJS()
        this.metaAction.sf("data.columns", fromJS([]))
        let columns = columnData[TaxpayerNature].columns
        if (resp) {
            const data = JSON.parse(resp.columnjson)
            // 处理每一列的显示状态
            columns.forEach(item => {
                const idx = data.indexOf(item.id)
                item.isVisible = idx !== -1
            })
        }
        this.metaAction.sf("data.columns", fromJS(columns))
        setTimeout(() => {
            this.onResize()
        }, 50)
    }

    handleMenuClick = () => {}

    // 获取页面数据
    load = async () => {
        let loading = this.metaAction.gf("data.loading")
        // await this.queryInvoicePlatform()
        if (!loading) {
            this.injections.reduce("tableLoading", true)
        }
        const pagination = this.metaAction.gf("data.pagination").toJS(),
            inputVal = this.metaAction.gf("data.inputVal"),
            nsqj = this.metaAction.gf("data.nsqj"),
            TaxpayerNature = this.metaAction.gf("data.TaxpayerNature"),
            filterForm = this.metaAction.gf("data.filterForm").toJS(),
            khRange = this.metaAction.gf("data.khRange"),
            departments = this.metaAction.gf("data.departments") || undefined,
            params = {
                khRange, // 用户权限
                departments, // 选中的部门代码
                entity: {
                    type: TaxpayerNature,
                    khmc: inputVal, //客户名称
                    skssq: moment(nsqj).subtract(1, "months").format("YYYYMM"), // 税款所属期
                },
                xxfpCjzt: filterForm.saleStatus ? filterForm.saleStatus : null, // 销项采集状态xxfpCjzt
                jxfpCjzt: filterForm.purchaseStatus ? filterForm.purchaseStatus : null, // 进项采集状态 jxfpCjzt
                xxfpJezt: filterForm.xxfpCjzt ? filterForm.xxfpCjzt : null, //销项差额状态
                jxfpJezt: filterForm.jxfpCjzt ? filterForm.jxfpCjzt : null,
                page: {
                    currentPage: pagination.currentPage,
                    pageSize: pagination.pageSize,
                },
            }

        const resp = await this.webapi.invoice.queryBatchAccountPageList(params)
        let permission = {},
            tempPermissionTreedata = this.metaAction.gf("data.other.permission.treeData")
        if (!(tempPermissionTreedata && tempPermissionTreedata.length > 0)) {
            permission = await this.webapi.invoice.queryPermission()
        }
        if (!this.mounted) return
        if (permission && permission.body && !(JSON.stringify(permission.body.bmxx) == "{}")) {
            this.metaAction.sfs({
                "data.other.permission.treeData": permission.body.bmxx,
                "data.other.permission.all": permission.body.all,
                // 'data.other.permission.self':permission.body.self
                "data.maxde": Array.isArray(permission.body.bmxx) && permission.body.bmxx[0].bmdm,
            })
            // this.injections.reduce('update', 'data.other.permission', permission);
        }
        if (resp) {
            if (resp.list.length === 0) {
                this.injections.reduce("tableLoading", false)
            }
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
                this.injections.reduce("tableLoading", false)
            }, 50)
        } else {
            this.injections.reduce("tableLoading", false)
        }
    }

    // 切换纳税人身份
    tabChange = e => {
        const userDetail = this.metaAction.gf("data.userDetail")
        //this.metaAction.sf('data.columns', fromJS([]))
        this.injections.reduce("tableLoading", true)
        //this.metaAction.sf('data.TaxpayerNature', e)
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        //this.metaAction.sf('data.pagination', fromJS(pagination))
        const { filterFormOld } = this.metaAction.gf("data").toJS()
        // this.metaAction.sf('data.filterForm', fromJS(filterFormOld))
        //this.metaAction.sf('data.inputVal', '')
        this.injections.reduce("tableSettingVisible", { value: false })
        //this.metaAction.sf('data.list', fromJS([]))
        this.metaAction.sfs({
            "data.columns": fromJS([]),
            "data.TaxpayerNature": e,
            "data.pagination": fromJS(pagination),
            "data.filterForm": fromJS(filterFormOld),
            "data.inputVal": "",
            "data.list": fromJS([]),
        })
        const {invoicePlatForm, TaxpayerNature }= this.metaAction.gf("data").toJS()
        console.log(invoicePlatForm, TaxpayerNature, e, '______')
        let btnType = ""
        if (invoicePlatForm == 1) {  // 非网报区
            btnType = e === "0" ?  generalBtnType_NonNetwork : smallBtnType_NonNetwork
           
        } else { // 网报区
            btnType = e === "0" ? generalBtnType :  smallBtnType  
        }

        if (userDetail === 2) {
            btnType.forEach(item => {
                if (item.key !== "setLimitData") item.disabled = true
            })
            this.metaAction.sf("data.btnType", fromJS(btnType))
        } else if (userDetail === 1) {
            btnType.forEach(item => {
                if (item.key !== "setLimitData") item.disabled = false
            })
            this.metaAction.sf("data.btnType", fromJS(btnType))
        } else {
            this.metaAction.sf("data.btnType", fromJS(btnType))
        }

        this.load()
        this.getColumns()
    }
    // 输入框搜索
    onSearch = () => {
        this.injections.reduce("tableLoading", true)
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        this.metaAction.sf("data.pagination", fromJS(pagination))
        this.load()
    }
    // 切换报税月份
    handleMonthPickerChange = (e, strTime) => {
        this.injections.reduce("tableLoading", true)
        //this.metaAction.sf('data.nsqj', e)
        const pagination = this.metaAction.gf("data.pagination").toJS()
        pagination.currentPage = 1
        // this.metaAction.sf('data.pagination', fromJS(pagination))
        this.metaAction.sfs({
            "data.nsqj": e,
            "data.pagination": fromJS(pagination),
        })
        this.load()
    }
    // 帮助页面
    openHelp = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "",
            className: "ttk-edf-app-help-modal-content",
            wrapClassName: "ttk-edf-app-help-modal",
            footer: null,
            width: 860, //静态页面宽度840小于会有横向滚动条
            children: this.metaAction.loadApp("ttk-edf-app-help", {
                store: this.component.props.store,
                code: "inv-app-custom-list", // 查询页面对应参数
            }),
        })
    }
    // 点击搜索，初始化高级搜索
    handlePopoverVisibleChange = visible => {
        if (visible) {
            const { filterForm } = this.metaAction.gf("data").toJS()
            this.metaAction.sf("data.formContent", fromJS(filterForm))
        }
        this.metaAction.sf("data.showPopoverCard", visible)
    }
    //  点击高级搜索重置
    resetForm = () => {
        const { filterFormOld, formContent } = this.metaAction.gf("data").toJS()
        Object.assign(formContent, filterFormOld)
        this.metaAction.sf("data.formContent", fromJS(formContent))
    }
    // 点击高级搜索进项搜索
    filterList = () => {
        this.injections.reduce("tableLoading", true)
        const { formContent } = this.metaAction.gf("data").toJS()
        this.metaAction.sfs({
            "data.filterForm": fromJS(formContent),
            "data.showPopoverCard": false,
            "data.pagination.currentPage": 1,
        })
        this.load()
    }
    // 更多
    judgeChoseBill = type => {
        const { checkboxValue } = this.metaAction.gf("data.tableCheckbox").toJS()
        if (
            type !== "setLimitData" &&
            type !== "invoiceManagement" &&
            type !== "exports" &&
            checkboxValue &&
            checkboxValue.length === 0
        ) {
            message.warning("请先选择客户！")
            return
        }
        this[type](type)
    }
    sqldse = async () => {
        this.injections.reduce("tableLoading", true)
        const { selectedOption } = this.metaAction.gf("data.tableCheckbox").toJS(),
            nsqj = this.metaAction.gf("data.nsqj"),
            skssq = moment(nsqj).subtract(1, "months").format("YYYYMM"),
            TaxpayerNature = this.metaAction.gf("data.TaxpayerNature")
        // console.log(selectedOption);
        let params = []
        selectedOption.forEach(item => {
            let a = {
                qyId: item.qyId,
                khmc: item.khmc,
                nsrsbh: item.nsrsbh,
                mneCode: item.mneCod,
                skssq,
                djxh: item.djxh,
                type: TaxpayerNature,
            }
            params.push(a)
        })
        let res = await this.webapi.invoice.callQueryAllSqldseList(params)
        if (res) {
            let resp = await this.metaAction.modal("success", {
                className: "inv-batch-info-modal-wu",
                okText: "确定",
                style: { top: 200 },
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                content: (
                    <div>
                        <div style={{ marginBottom: "10px" }}>
                            获取上期留抵成功，请返回批量界面查看数据
                        </div>
                        <p style={{ color: "orange" }}>温馨提示：</p>
                        <span>如未能获取到数据，请检查本期和上期增值税申报表是否有数据！</span>
                    </div>
                ),
            })
            this.load()
        } else {
            let resp = this.metaAction.modal("error", {
                className: "inv-batch-info-modal-wu",
                okText: "确定",
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                content: (
                    <div>
                        <div style={{ marginBottom: "10px" }}>
                            获取上期留底失败：系统调用接口异常，请您联系运维人员！
                        </div>
                    </div>
                ),
            })
            if (resp) {
                this.load()
            }
        }
    }
    exports = async () => {
        const { userId, dljgId } = this.metaAction.gf("data")
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        const currentUser = this.metaAction.context.get("currentUser") || {}
        const pagination = this.metaAction.gf("data.pagination").toJS(),
            inputVal = this.metaAction.gf("data.inputVal"),
            nsqj = this.metaAction.gf("data.nsqj"),
            TaxpayerNature = this.metaAction.gf("data.TaxpayerNature"),
            filterForm = this.metaAction.gf("data.filterForm").toJS(),
            khRange = this.metaAction.gf("data.khRange"),
            departments = this.metaAction.gf("data.departments") || undefined,
            params = {
                khRange, // 用户权限
                departments, // 选中的部门代码  xxfpJezt jxfpJezt
                entity: {
                    type: TaxpayerNature,
                    khmc: inputVal, //客户名称
                    dljgId: dljgId ? dljgId : currentOrg.id,
                    userId: currentUser.id,
                    skssq: moment(nsqj).subtract(1, "months").format("YYYYMM"), // 税款所属期
                },
                xxfpCjzt: filterForm.saleStatus ? filterForm.saleStatus : null, // 销项采集状态 "0:采集成功,1：采集失败,2：采集中，3：未采集，null:全部",
                jxfpCjzt: filterForm.purchaseStatus ? filterForm.purchaseStatus : null, // 进项采集状态 "0:采集成功,1：采集失败,2：采集中，3：未采集，null:全部",
                xxfpJezt: filterForm.xxfpCjzt ? filterForm.xxfpCjzt : null, //销项差额状态
                jxfpJezt: filterForm.jxfpCjzt ? filterForm.jxfpCjzt : null,
                page: {
                    currentPage: pagination.currentPage,
                    pageSize: pagination.pageSize,
                },
            },
            list = this.metaAction.gf("data.list").toJS()
        if (list.length == 0) {
            this.metaAction.toast("error", "没有什么可导出的")
            return
        }
        let res = await this.webapi.invoice.exportExcelBatchAccountList(params)
    }
    // 发票管理工具
    invoiceManagement = async () => {
        const ret = await this.metaAction.modal("warning", {
            title: (
                <span>
                    {" "}
                    正常使用发票采集功能，需先下载 发票管理工具。点击
                    <a
                        href="http://download.etaxcn.com/ycs/plugin/KfptFpTqSetup.exe"
                        style={{ fontWeight: "bold" }}>
                        “发票管理工具”
                    </a>
                    自动下载{" "}
                </span>
            ),
            width: 500,
            okText: "确定",
            content: (
                <div style={{ fontSize: "12px" }}>
                    <div style={{ color: "#FAAD14", marginBottom: "5px" }}>温馨提示:</div>
                    <div style={{ marginBottom: "5px" }}>
                        1、工具未下载的，需下载并安装，且插盘，设置税控盘密码。
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                        1、工具已下载的，无需再下载，只需插盘，设置税控盘密码。
                    </div>
                </div>
            ),
        })
    }
    // 读取销项
    loadSaleInvoice = async type => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        const currentUser = this.metaAction.context.get("currentUser") || {}
        const TaxpayerNature = this.metaAction.gf("data.TaxpayerNature") // 纳税人性质 0 一般纳税人 1 小规模
        const list = this.metaAction.gf("data.tableCheckbox").toJS()
        const nsqj = this.metaAction.gf("data.nsqj") || moment(new Date())
        let ret = await this.metaAction.modal("show", {
            width: 385,
            height: 200,
            okText: "确定",
            title: "一键读取销项",
            className: "small-modal-class",
            children: (
                <LoadInvoice
                    tips={Tips[TaxpayerNature][type]}
                    date={nsqj}
                    webapi={this.webapi}
                    list={list.selectedOption}
                    type={0}
                    TaxpayerNature={TaxpayerNature}
                    currentUser={currentUser}
                    currentOrg={currentOrg}
                />
            ),
        })
        if (!this.mounted) return
        if (ret.sfcjcg === true && ret.sfcjz === true) {
            let resp = await this.metaAction.modal(ret.code === "400" ? "warning" : "success", {
                className: "inv-batch-custom-info-modal",
                okText: "确定",
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                // content: <div>
                //     <div style={{ marginBottom: '10px' }}>
                //         一键读取销项发票：成功
                //         <span style={{ fontWeight: 'bold' }}>{ret.cghs}</span>户，
                //         失败
                //         <span style={{ fontWeight: 'bold', color: '#e94033' }}>{ret.sbhs}</span>户
                //     </div>
                // </div>
                content: (
                    <div>
                        销项发票一键读取完成，结果如下：
                        <Table
                            className="inv-app-custom-list-month-detail-table"
                            columns={resultColumns}
                            dataSource={ret.dataList}
                            bordered
                            pagination={false}
                            style={{ marginTop: "24px" }}></Table>
                    </div>
                ),
            })
            if (resp) {
                this.load()
            }
        } else if (ret.sfcjcg === true && ret.sfcjz === false) {
            let resp = await this.metaAction.modal("info", {
                className: "inv-batch-custom-info-modal",
                okText: "确定",
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                content: <p>系统正在采集{ret.cjzhs}户中请稍后查看</p>,
            })
            if (resp) {
                this.load()
            }
        } else if (ret) {
            let resp = await this.metaAction.modal("info", {
                className: "inv-batch-custom-info-modal",
                okText: "确定",
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                content: <p>后台努力采集中，请稍后查看</p>,
            })
            if (resp) {
                this.load()
            }
        }
        // else {
        //     let resp = await this.metaAction.modal('error', {
        //         className: 'inv-batch-info-modal-wu',
        //         okText: '确定',
        //         content: <div style={{ marginTop: '-10px' }}>销项发票一键读取失败：发票读取接口调用异常，请您联系运维人员！</div>
        //     })
        //     if (resp) {
        //         this.load()
        //     }
        // }
    }
    loadPurchaseInvoice = async type => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        const currentUser = this.metaAction.context.get("currentUser") || {}
        const TaxpayerNature = this.metaAction.gf("data.TaxpayerNature")
        const list = this.metaAction.gf("data.tableCheckbox").toJS()
        const nsqj = this.metaAction.gf("data.nsqj") || moment(new Date())
        let ret = await this.metaAction.modal("show", {
            width: 410,
            height: 200,
            okText: "确定",
            title: "一键读取进项",
            className: "small-modal-class",
            children: (
                <LoadInvoice
                    tips={Tips[TaxpayerNature][type]}
                    date={nsqj}
                    webapi={this.webapi}
                    list={list.selectedOption}
                    type={1}
                    TaxpayerNature={TaxpayerNature}
                    currentOrg={currentOrg}
                    currentUser={currentUser}
                />
            ),
        })
        if (!this.mounted) return
        if (ret.sfcjcg === true && ret.sfcjz === true) {
            let resp = await this.metaAction.modal("success", {
                className: "inv-batch-info-modal-wu",
                okText: "确定",
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                // content: <div>
                //     <div style={{ marginBottom: '10px' }}>
                //         一键读取进项发票：成功
                //     <span style={{ fontWeight: 'bold' }}>{ret.cghs}</span>户，
                //     失败
                //     <span style={{ fontWeight: 'bold', color: '#e94033' }}>{ret.sbhs}</span>户
                // </div>
                //     {/*<div style={{fontSize:'12px'}}><span  style={{ color: "#FAAD14" }}>温馨提示：</span>根据税局要求，增值税发票综合服务平台上线前认证的发票，也需要进行确认签名。签名后才属于已认证发票。</div>*/}
                // </div>
                content: (
                    <div>
                        进项发票一键读取完成，结果如下：
                        <Table
                            className="inv-app-custom-list-month-detail-table"
                            columns={resultColumns}
                            dataSource={ret.dataList}
                            bordered
                            pagination={false}
                            style={{ marginTop: "24px" }}></Table>
                    </div>
                ),
            })
            if (resp) {
                this.load()
            }
        } else if (ret.sfcjcg === true && ret.sfcjz === false) {
            let resp = await this.metaAction.modal("info", {
                className: "inv-batch-custom-info-modal",
                okText: "确定",
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                content: <p>后台努力采集中，请稍后查看</p>,
            })
            if (resp) {
                this.load()
            }
        } else if (ret) {
            let resp = await this.metaAction.modal("info", {
                className: "inv-batch-custom-info-modal",
                okText: "确定",
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                content: <p>后台努力采集中，请稍后查看</p>,
            })
            if (resp) {
                this.load()
            }
        }
        // else {
        //     let resp =  await this.metaAction.modal('error', {
        //         className: 'inv-batch-info-modal-wu',
        //         okText: '确定',
        //         content: <div style={{ marginTop: '-10px' }}>进项发票一键读取失败：发票读取接口调用异常，请您联系运维人员！</div>
        //     })
        //     if (resp) {
        //         this.load()
        //     }
        // }
    }

    /*一键读取销进项*/
    salesAndPurchase = async type => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        const currentUser = this.metaAction.context.get("currentUser") || {}
        const TaxpayerNature = this.metaAction.gf("data.TaxpayerNature") // 纳税人性质 0 一般纳税人 1 小规模
        const list = this.metaAction.gf("data.tableCheckbox").toJS() // 勾选的数据
        const nsqj = this.metaAction.gf("data.nsqj") || moment(new Date()) //纳税期间
        let ret = await this.metaAction.modal("show", {
            width: 500,
            height: 200,
            okText: "确定",
            title: "一键读取销进项",
            className: "small-modal-class",
            children: (
                <LoadInvoice
                    tips={nonNetworkTips}
                    date={nsqj}
                    webapi={this.webapi}
                    list={list.selectedOption}
                    type={0}
                    TaxpayerNature={TaxpayerNature}
                    currentUser={currentUser}
                    currentOrg={currentOrg}
                    loadApiName={"invoiceCollectionXxfpJxfp"}
                />
            ),
        })

        if (ret && Object.prototype.toString.call(ret) === "[object Array]" && !ret.error) {
            let list = JSON.parse(JSON.stringify(ret))
            list = list.map(v => {
                const { xxfpCghs, xxfpSbhs, xxfpCjzhs, jxfpCghs, jxfpSbhs, jxfpCjzhs } = v
                const xxSuccess = `成功${xxfpCghs}户`
                const xxPicking = xxfpCjzhs ? `，采集中${xxfpCjzhs}户` : ""
                const xxFailed = xxfpSbhs ? `，失败${xxfpSbhs}户` : ""
                const jxSuccess = `成功${jxfpCghs}户`
                const jxPicking = jxfpCjzhs ? `，采集中${jxfpCjzhs}户` : ""
                const jxFailed = jxfpSbhs ? `，失败${jxfpSbhs}户` : ""
                const year = v.skssq.slice(0, 4)
                const month = v.skssq.slice(4)
                const item = {
                    skssq: `${year}-${month}`,
                    xxfp: `${xxSuccess}${xxPicking}${xxFailed}`,
                    jxfp: `${jxSuccess}${jxPicking}${jxFailed}`,
                }
                return item
            })
            let resp = await this.metaAction.modal("show", {
                className: "inv-batch-custom-info-modal",
                title: "结果",
                // okText: '确定',
                footer: null,
                width: 600,
                closeModal: this.closeBom,
                wrapClassName: "salesAndPurchase-success-tips-modal", // 必传，控制样式
                closeBack: back => {
                    this.closeTip = back
                },
                children: (
                    <CollectResultList
                        props={this.component.props.store}
                        resultTitle="销进项发票一键读取完成，结果如下" // 标题
                        unit="张"
                        columns={retCol} // 列字段和渲染
                        tableData={list} // 表格中展示的数据
                        softTips={[
                            // 温馨提示，一行作为数组的一个元素
                            "请到发票相应属期查看发票",
                        ]}
                        hasPlatFormCollect={false} // 是否有平台采集功能
                        // closePageFn={this.closeBom}  // 确定，关闭按钮功能
                    ></CollectResultList>
                ),
            })
            if (resp) {
                this.load()
            }
        } else {
            let resp = await this.metaAction.modal("info", {
                className: "inv-batch-custom-info-modal",
                okText: "确定",
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                content: <p>后台努力采集中，请稍后查看</p>,
            })
            if (resp) {
                this.load()
            }
        }
        return
    }

    // 关闭一键读取销进项的弹窗
    closeBom = async ret => {
        this.closeTip()
        this.load()
    }

    // 平台采集
    loadPlatform = () => {}

    // 设置上限预警
    setLimitData = () => {
        let userDetail = this.metaAction.gf("data.userDetail")
        let loading = this.metaAction.gf("data.loading")
        if (!loading) {
            this.injections.reduce("tableLoading", true)
        }
        this.getLimitData()
            .then(async resp => {
                this.injections.reduce("tableLoading", false)
                if (resp) {
                    let ret = await this.metaAction.modal("show", {
                        title: "上限预警设置",
                        width: 500,
                        height: 300,
                        //footer: userDetail === 2 ? null : true,
                        className: "small-modal-class inv-custom-list-limit-modal",
                        children: <SetLimit ratio={resp.ratio} webapi={this.webapi} />,
                    })
                    if (ret) {
                        this.load()
                    }
                }
            })
            .finally(() => {
                this.injections.reduce("tableLoading", false)
            })
    }
    // 获取上限预警
    getLimitData = async () => {
        return await this.webapi.invoice.queryRatio()
    }
    btnClick = () => {
        this.injections.reduce("modifyContent")
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
    //分页发生变化
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
        this.injections.reduce("tableLoading", true)
        this.metaAction.sf("data.pagination", fromJS(pagination))
        this.load()
    }
    // 显示列设置
    showTableSetting = ({ value, data }) => {
        const columns = this.metaAction.gf("data.columns").toJS()
        this.metaAction.sf("data.other.columnDto", fromJS(columns))
        this.injections.reduce("tableSettingVisible", { value })
    }
    // 保存列设置
    upDateTableSetting = async ({ value, data }) => {
        const columns = []
        const TaxpayerNature = this.metaAction.gf("data.TaxpayerNature")
        const pageID = TaxpayerNature === "0" ? "batchCustomGeneral" : "batchCustomSmall"
        for (const item of data) {
            item.isVisible ? columns.push(item.id) : null
        }
        const resp = await this.webapi.invoice.upDateColumn({
            pageID,
            columnjson: JSON.stringify(columns),
        })
        if (!this.mounted) return
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
        const TaxpayerNature = this.metaAction.gf("data.TaxpayerNature")
        const pageID = TaxpayerNature === "0" ? "batchCustomGeneral" : "batchCustomSmall"
        let res = await this.webapi.invoice.deleteColumn({ pageID })
        if (!this.mounted) return
        if (res) {
            this.injections.reduce("update", {
                path: "data.showTableSetting",
                value: false,
            })
            this.getColumns()
        }
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
        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        this.injections.reduce("update", {
            path: "data.tableCheckbox",
            value: {
                checkboxValue: newArr,
                selectedOption: newItemArr,
            },
        })
        //this.selectedOption = newItemArr
    }

    /**
     *
     * @param record 当前列数据
     * @param type   进项|| 销项
     * @returns {null}
     */
    renderStatus = (record, type) => {
        const data = this.metaAction.gf("data").toJS()
        const { invoicePlatForm = "" } = data
        let status, time, message
        if (type === "jx") {
            status = record.jxcjzt
            time = record.jxtqsj
            message = record.jxcjztmsg
        } else {
            status = record.xxcjzt
            time = record.xxtqsj
            message = record.xxcjztmsg
        }
        let tipsText = ""
        if (invoicePlatForm == 0) {
            switch (status) {
                case 0:
                    tipsText = (
                        <ul className="status-tips">
                            <li className="status-tips-origin">
                                {" "}
                                <span className="tips-name">来源：</span> <span>本地提取</span>{" "}
                            </li>
                            <li>
                                {" "}
                                <span className="tips-name">采集时间：</span> <span>{time}</span>{" "}
                            </li>
                        </ul>
                    )
                    break
                case 1:
                    tipsText = <div>{message}</div>
                    break

                case 2:
                    tipsText = (
                        <ul className="status-tips">
                            <li className="status-tips-origin">
                                {" "}
                                <span className="tips-name">平台采集：</span>
                                <span>采集中</span>
                            </li>
                            <li>
                                <span className="tips-name">操作时间：</span>
                                <span>{time}</span>
                            </li>
                        </ul>
                    )
            }
        } else {
            tipsText = status === 0 ? `采集时间：${time}` : message
        }

        return status === 0 || status === 1 ? (
            <Tooltip
                arrowPointAtCenter={true}
                // placement={status === 0 ? 'top' : 'left'}
                placement="top"
                overlayClassName={status !== 1 ? "inv-tool-tip-normal" : "inv-tool-tip-warning"}
                // title={status === 0 ? `采集时间：${time}` : message}>
                title={tipsText}>
                {/* <Icon type={status === 1 ? 'exclamation-circle' : 'check-circle'} className={status === 1 ? 'inv-custom-warning-text' : 'inv-custom-success-text'} /> */}
                <Icon type={PICKINGSTATUS[status]} className={PICKINGSTATUS[status]} />
            </Tooltip>
        ) : null
    }
    /**
     *
     * @param text
     * @param record
     * @param row 当前表头fixedData
     * @returns {*}
     */
    renderTaxAmount = (text, record, row) => {
        const TaxpayerNature = this.metaAction.gf("data.TaxpayerNature")
        if (TaxpayerNature === "1" && row.isToolTip && record[`${row.type}SeMsg`]) {
            let message = record[`${row.type}SeMsg`] ? record[`${row.type}SeMsg`].split(";") : []
            let toolTipContent = message.map(item => <div>{item}</div>)
            return record[`${row.type}SeMsg`] ? (
                <Tooltip
                    arrowPointAtCenter={true}
                    title={() => toolTipContent}
                    overlayClassName="inv-tool-tip-normal">
                    <span className="text-tax-amount">
                        {typeof text === "number" && row.amount
                            ? utils.number.format(text, 2)
                            : text}
                    </span>{" "}
                </Tooltip>
            ) : (
                <span className="text-tax-amount">
                    {typeof text === "number" && row.amount ? utils.number.format(text, 2) : text}
                </span>
            )
        } else {
            return (
                <span>
                    {typeof text === "number" && row.amount ? utils.number.format(text, 2) : text}
                </span>
            ) // 除小规模以外的信息不需要特殊处理
        }
    }

    renderTotalAmount = (text, record, row) => {
        if (row.fieldName === "totalAmount" && record.limitRate) {
            // record.limitRate 判断是否超过预警值
            return (
                <span>
                    <Tooltip
                        arrowPointAtCenter={true}
                        placement="top"
                        title={record.limitRate}
                        overlayClassName="inv-tool-tip-warning">
                        <Icon type="exclamation-circle" className="inv-custom-warning-text" />
                    </Tooltip>
                    <span style={{ paddingLeft: "5px" }}>
                        {typeof text === "number" && row.amount
                            ? utils.number.format(text, 2)
                            : text}
                    </span>
                </span>
            )
        } else {
            return (
                <span
                    title={
                        typeof text === "number" && row.amount ? utils.number.format(text, 2) : text
                    }>
                    {typeof text === "number" && row.amount ? utils.number.format(text, 2) : text}
                </span>
            )
        }
    }
    openMonthDetail(row, type) {
        //"cxlx":"操作类型 必传：0：销项；1：进项；2：连续12个月累计",
        let titlePrefix = ""
        if (type === "totalAmount") {
            row.cxlx = 2
            titlePrefix = "累计"
        } else if (type === "xxhjse") {
            row.cxlx = 0
            titlePrefix = "销项"
        } else {
            row.cxlx = 1
            titlePrefix = "进项"
        }

        this.metaAction.modal("show", {
            title: `${titlePrefix}-${row.khmc}`,
            style: { top: 5 },
            width: 400,
            height: 800,
            footer: null,
            children: (
                <MonthDetail
                    store={this.component.props.store}
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    row={row}
                />
            ),
        })
    }
    renderColumns = () => {
        const arr = []
        const column = this.metaAction.gf("data.columns").toJS()
        let width = 0
        const fixedTable = this.metaAction.gf("data.fixedTable")
        const taxpayerNature = this.metaAction.gf("data.TaxpayerNature")
        column.forEach((item, index) => {
            if (item.isVisible) {
                width += item.width
                if (item.children) {
                    // 判断是否进入了有多级表头的分支
                    const child = [] // 多表头
                    let col //  一级表头是否要显示 *** 状态栏显示
                    item.children.forEach(subItem => {
                        if (subItem.isSubTitle) {
                            // 二级表头渲染方式
                            //小规模才渲染弹窗组件
                            if (
                                taxpayerNature === "1" &&
                                (subItem.fieldName === "totalAmount" ||
                                    subItem.fieldName === "xxhjse" ||
                                    subItem.fieldName === "jxhjseyrz")
                            ) {
                                child.push({
                                    title: subItem.caption,
                                    dataIndex: subItem.fieldName,
                                    key: subItem.fieldName,
                                    width: subItem.width,
                                    align: subItem.align,
                                    className: subItem.className,
                                    render: (text, record) => (
                                        <div
                                            style={{ cursor: "pointer", width: "100%" }}
                                            onClick={this.openMonthDetail.bind(
                                                this,
                                                record,
                                                subItem.fieldName
                                            )}>
                                            <a href="javascript:;">
                                                {this.renderTotalAmount(text, record, subItem)}
                                            </a>
                                        </div>
                                    ),
                                })
                            } else {
                                child.push({
                                    title: subItem.caption,
                                    dataIndex: subItem.fieldName,
                                    key: subItem.fieldName,
                                    width: subItem.width,
                                    align: subItem.align,
                                    className: subItem.className,
                                    render: (text, record) =>
                                        this.renderTaxAmount(text, record, subItem),
                                })
                            }
                        } else {
                            // 状态一级表头渲染方式
                            // 纳税人方式  小规模 无已认证未认证区分
                            if (
                                !(
                                    taxpayerNature === "0" &&
                                    item.fieldName === "jxfpyrz" &&
                                    column[index + 1].isVisible
                                )
                            ) {
                                //正常状态显示
                                col = {
                                    title: subItem.caption,
                                    dataIndex: subItem.fieldName,
                                    key: subItem.fieldName,
                                    width: subItem.width,
                                    align: subItem.align,
                                    className: subItem.className,
                                    render: (text, record) =>
                                        this.renderStatus(record, subItem.type),
                                }
                            }
                        }
                    })
                    arr.push({
                        // 表头数据
                        title: item.caption,
                        align: item.align,
                        children: child,
                        className: item.className,
                    })
                    if (col) {
                        arr.push(col)
                    }
                } else if (item.id === "operation") {
                    const showTableSetting = this.metaAction.gf("data.showTableSetting")
                    arr.push({
                        title: (
                            <div>
                                操作
                                <span
                                    className="inv-col-setting"
                                    onClick={() => this.showTableSetting({ value: true })}>
                                    列设置
                                </span>
                            </div>
                        ),
                        className: "operation",
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        fixed: fixedTable ? "right" : "",
                        render: (text, record) => (
                            <React.Fragment>
                                <a
                                    href="javascript:void(0)"
                                    onClick={() => this.salesPurchaseClick(record, 1)}>
                                    销项
                                </a>
                                <span style={{ padding: "0 5px" }}>|</span>
                                <a
                                    href="javascript:void(0)"
                                    onClick={() => this.salesPurchaseClick(record, 2)}>
                                    进项
                                </a>
                                {taxpayerNature == "0" && (
                                    <React.Fragment>
                                        <span style={{ padding: "0 5px" }}>|</span>
                                        <a
                                            href="javascript:void(0)"
                                            onClick={this.gotoTaxPlatform(record)}>
                                            认证
                                        </a>
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        ),
                    })
                } else {
                    // 常规操作
                    arr.push({
                        title: item.caption,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        className: item.className,
                        render: (text, record) => this.renderTotalAmount(text, record, item), // 特殊字段处理
                        fixed: fixedTable ? item.isFixed : "",
                    })
                }
            }
        })
        this.metaAction.sf("data.columnsWidth", width)
        return arr
    }
    gotoTaxPlatform = record => async () => {
        const res = await this.webapi.invoice.getOrgAddressFromSj({
            orgId: record.qyId,
            linkCode: 1200515,
        })
        if (res) {
            window.open(res)
        } else {
            this.metaAction.toast("error", "发票综合服务平台打开失败，原因：未获取到有效的地址！")
        }
    }
    // 点击进销项
    salesPurchaseClick = (record, t) => {
        const userDetail = this.metaAction.gf("data.userDetail")
        const swVatTaxpayer = this.metaAction.gf("data.TaxpayerNature"),
            nsqj = this.metaAction.gf("data.nsqj").format("YYYYMM")
        let appName = `${
            t == 1 ? "inv-app-batch-sale-list" : "inv-app-batch-purchase-list"
        }?swVatTaxpayer=${swVatTaxpayer}&nsqj=${nsqj}&qyId=${record.qyId}&xgmJbOrYb=${
            record.cwbbType === "季报" ? "1" : "0"
        }`
        // let title = record.khmc //t === 1 ? '销项发票' : '进项发票'
        let title = t === 1 ? "销项发票" : "进项发票"
        let app = t === 1 ? "inv-app-batch-sale-list" : "inv-app-batch-purchase-list"
        let params = {
            userDetail,
            swVatTaxpayer,
            nsqj,
            xzqhdm: record.xzqhdm.substring(0, 2),
            qyId: record.qyId,
            xgmJbOrYb: record.cwbbType === "季报" ? "1" : "0",
        }
        // setGlobalContent，setGlobalContentWithDanhuMenu
        if (this.component.props.setGlobalContent) {
            this.component.props.setGlobalContent({
                name: title,
                appName: app + "?djxh=" + record.djxh,
                params,
                orgId: record.qyId,
                showHeader: true,
            })
        } else if (this.component.props.openDanhu) {
            this.component.props.openDanhu(record.qyId, appName, title)
        } else if (this.component.props.onRedirect) {
            this.component.props.onRedirect({ appName })
        } else {
            this.metaAction.toast("error", "进入方式不对")
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
            let appDom = document.getElementsByClassName("inv-app-custom-list")[0] //以app为检索范围
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

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num =
                    tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight
                const width = tableWrapperDom.offsetWidth
                const height = tableWrapperDom.offsetHeight
                const tbodyWidth = tbodyDom.offsetWidth
                const columnsWidth = this.metaAction.gf("data.columnsWidth")
                this.metaAction.sf("data.fixedTable", columnsWidth > width)
                if (num < 0) {
                    this.injections.reduce("setTableOption", {
                        ...tableOption,
                        x: columnsWidth > width ? columnsWidth : width - 12,
                        y:
                            columnsWidth > width
                                ? height - theadDom.offsetHeight - 2
                                : height - theadDom.offsetHeight - 1,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce("setTableOption", {
                        ...tableOption,
                        x: columnsWidth > width ? columnsWidth : width - 2,
                    })
                }
            }
        } catch (err) {}
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
