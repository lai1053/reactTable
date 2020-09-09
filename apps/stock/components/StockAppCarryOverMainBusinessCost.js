import React from "react"
import moment from "moment"
import {
    Table,
    DatePicker,
    Button,
    Select,
    Layout,
    Icon,
    Checkbox,
    DataGrid,
    Menu,
    Dropdown,
    Input,
    Popover,
    Pagination,
    Radio,
    Tabs,
    Modal,
} from "edf-component"
import { AppLoader } from "edf-meta-engine"
import { message, Spin } from "antd"
import utils, { moment as momentUtil } from "edf-utils"
import SubjectSetting from "../../bovms/components/subjectSetting"
import {
    HelpIcon,
    setListEmptyVal,
    dealWithData,
    transToNum,
    formatSixDecimal,
    formatNumbe,
    getVoucherDateZGRK,
    // denyClick,
    FifoIcon,
    getClientSize,
} from "../commonAssets/js/common"
import Pingzhenghebing from "./Pingzhenghebing"
import MergeSetupByRadio from "./MergeSetupByRadio2"
import NegativeStockReminder from "./NegativeStockReminder"
import StockAppBySaleOut from "./StockAppBySaleOut"
import XsckImport from "./XsckImport"
import importModal, { onFileError } from "./common/ImportModal"
import PrintButton from "./common/PrintButton"
import HabitSetting from "./HabitSetting"
import VirtualTable from "../../invoices/components/VirtualTable/index"
import { flatCol } from "./common/js/util"
import { fromJS } from "immutable"
let { modalHeight, modalWidth, modalBodyStyle } = getClientSize()

const sourceOfDocumentsObj = {
    "0": "生成",
    "1": "录入",
    "2": "迁移",
    "3": "导入",
    "4": "迁移",
    "5": "迁移",
    "6": "退货",
}
const typeSelectOption = [
    {
        typeId: null,
        typeName: "全部",
    },
    {
        typeId: 0,
        typeName: "生成",
    },
    {
        typeId: 1,
        typeName: "录入",
    },
    {
        typeId: 3,
        typeName: "导入",
    },
    {
        typeId: 245,
        typeName: "迁移",
    },
]
const voucherIdsSelectOption = [
    {
        voucherIds: null,
        voucherName: "全部",
    },
    {
        voucherIds: 0,
        voucherName: "未生成",
    },
    {
        voucherIds: 1,
        voucherName: "已生成",
    },
]

class StockAppCarryOverMainBusinessCost extends React.Component {
    constructor(props) {
        super(props)
        const domCost = document.querySelector(".ttk-stock-app-carryOver-mainBusiness-cost")
        this.state = {
            loading: false, // 表格loading
            pageTitle: "销售出库汇总表", // 页面title
            tableOption: {
                // 表格定位对象
                x: ((domCost && domCost.offsetWidth) || 1500) - 10,
                y: ((domCost && domCost.offsetHeight) || 1000) - 104 - 39 * 2 - 10,
            },
            isGenVoucher: false,
            // inventoryClass: [],
            list1: [],
            month: "",
            activeTabKey: "1",
            showPopoverCard1: false,
            allList: [],
            form1: {
                inventoryType: "",
            },
            inputVal1: "",
            optionList: [],
            radioValue: 1,
            rRadioValue: 1,

            //第二个tab的数据
            list: [],
            limit: {
                stateNow: "",
            },
            listAll: {
                billBodyNumPlus: "0",
                billBodyNumMinus: "0",
                billBodyYbBalancePlus: "0.00",
                billBodyYbBalanceMinus: "0.00",
            },
            defaultPickerValue: "",
            pagination: {
                pageSize: 50,
                current: 1,
                total: 0,
            },
            inputVal: "",
            // other: {
            //  activeTabKey: '1',
            //  isShowFirstTab: true,
            // },
            form: {
                type: null,
                typeName: "",
                strDate: "",
                endDate: "",
                constom: "",
                voucherIds: null,
                voucherName: "",
                invNo: undefined,
            },
            showPopoverCard: false,
            checkOutType: "",
            hasXsckBill: "",
            isCarryOverMainCost: "",
        }
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.component = props.component || {}
        this.params = props.params || {}
        this.mainBusinessTable = props.mainBusinessTable || {}
        this.mainBusinessTableTotal = props.mainBusinessTableTotal || {}
        this.setOkListener = props.setOkListener || {}
    }

    componentDidMount() {
        this.defaultPeriod = moment().format("YYYY-MM")
        const { name, xdzOrgIsStop, financeAuditor } =
            this.metaAction.context.get("currentOrg") || {}
        this.name = name
        this.xdzOrgIsStop = xdzOrgIsStop  // 客户是否停用
        this.financeAuditor = financeAuditor || "" // 当前制单人信息
        const currentOrg = sessionStorage["stockPeriod" + this.name]
        this.period = currentOrg

        // 判断是否重新load页面
        let { lastPeriod, lastXdzOrgIsStop } = this.props.lastState || {}
        let notChange = lastPeriod === this.period && lastXdzOrgIsStop === this.xdzOrgIsStop
        if(notChange) {
            this.setState({ ...this.props.lastState, loading: false })
        } else {
            this.setState({
                lastPeriod: this.period,
                lastXdzOrgIsStop: this.xdzOrgIsStop,
            })
            this.load(true)
        }
    }

    componentWillUnmount = () => {
        this.props.saveLastData &&
            this.props.saveLastData(fromJS(this.state).toJS())
    }

    /**
     * @description: 初始化数据
     */
    load = async init => {
        let stateNow, checkOutType, hasXsckBill, isCarryOverMainCost
        const getInvSetByPeroid = await this.webapi.operation.getInvSetByPeroid({
            period: this.period,
        })
        if (getInvSetByPeroid) {
            stateNow =
                getInvSetByPeroid.isGenVoucher || getInvSetByPeroid.isCarryOverMainCost
                    ? true
                    : false
            checkOutType = getInvSetByPeroid.checkOutType
            hasXsckBill = getInvSetByPeroid.hasXsckBill
            isCarryOverMainCost = getInvSetByPeroid.isCarryOverMainCost
        }
        if (!hasXsckBill && checkOutType === 2 && init) this.setState({ activeTabKey: "2" })
        let { activeTabKey } = this.state
        if (activeTabKey == "1") {
            let allList = [],
                list1 = [],
                inventoryClass,
                isVoucher = false,
                voucherId = "",
                negativeItemList = []
            const time = this.getPeriod()
            // this.metaAction.sf('data.loading', true)
            this.setState({ loading: true })
            let carryMainCostVoucher = init ? isCarryOverMainCost : true
            const res = await this.webapi.stock.getCarryMainCostSheetService({
                period: this.period,
                isVoucher: carryMainCostVoucher,
            }) // 结转生产成本
            this.setState({ loading: false })
            // this.metaAction.sf('data.loading', false)
            if (res) {
                if (res.carryMainCostSheetDtoList && res.carryMainCostSheetDtoList.length !== 0) {
                    // this.carryMainCostSheetDtoList = res.carryMainCostSheetDtoList
                    allList = res.carryMainCostSheetDtoList.map(item => {
                        const { copyItem, negativeItem } = dealWithData(item, true)
                        if (negativeItem) {
                            negativeItemList.push(negativeItem)
                        } // 负库存的存货数据
                        if (transToNum(copyItem.qzNum)) {
                            list1.push(copyItem)
                        } // 过滤掉没有销售数的数据
                        return item
                    })
                }
                inventoryClass = (res.classList && [...res.classList]) || []
                const index = inventoryClass.findIndex(v => v.inventoryClassId == 21) || 0
                const itemArr = inventoryClass.splice(index, 1)
                itemArr[0] && inventoryClass.unshift(itemArr[0])
                inventoryClass.splice(0, 0, {
                    inventoryClassId: "",
                    inventoryClassName: "全部",
                    isCompletion: false,
                })
                isVoucher = res.isVoucher
                voucherId = res.voucherId
            }

            // 负库存控制和提示
            const _this = this
            if (
                this.params.bInveControl == 1 &&
                negativeItemList.length !== 0 &&
                init &&
                !stateNow
            ) {
                Modal.confirm({
                    title: "请确认",
                    content: "存在负库存，是否创建暂估入库单?",
                    okText: "确定",
                    cancelText: "取消",
                    onOk() {
                        _this.newZGRK(negativeItemList)
                    },
                    // onCancel() {  _this.handleReturn() },
                })
                this.setState({
                    list1,
                    optionList: inventoryClass,
                    allList,
                    month: time,
                    isVoucher,
                    voucherId,
                    isCarryOverMainCost,
                })
                let loadTimer = setTimeout(() => {
                    clearTimeout(loadTimer)
                    loadTimer = null
                    this.getTableScroll()
                }, 100)
            } else {
                this.setState({
                    list1,
                    optionList: inventoryClass,
                    allList,
                    month: time,
                    isVoucher,
                    voucherId,
                    isCarryOverMainCost,
                })
                let loadTimer = setTimeout(() => {
                    clearTimeout(loadTimer)
                    loadTimer = null
                    this.getTableScroll()
                }, 100)
            }
        } else {
            this.setState({ loading: true })
            let page = {}
            // const pagination = this.state.pagination || {}
            // page = { currentPage: pagination.current, pageSize: pagination.pageSize }
            const reqData = await this.webapi.operation.init({ period: this.period, opr: 0 })
            if (this.state.inputVal) {
                page.currentPage = 1
            }

            let reqList = {
                serviceTypeCode: "XSCB",
                period: this.period,
                type: null,
                strDate: null,
                endDate: null,
                customerName: null,
                voucherIds: null,
                page: {
                    pagination: 1,
                    pageSize: 50,
                },
            }
            const response = await this.webapi.operation.querylist(reqList)
            const customerRes = await this.webapi.operation.findCustomerList({})
            this.setState({
                loading: false,
                customerList: [{ customerId: -1, customerName: "全部" }].concat(customerRes),
                startPeriod: reqData.startPeriod, //启用时间
            })
            // let getInvSetByPeroid = await this.webapi.operation.getInvSetByPeroid({'period': this.period})
            // this.injections.reduce('load', response, getInvSetByPeroid)
            this.updateLoad(response, getInvSetByPeroid)
            if (!this.xdzOrgIsStop && !hasXsckBill && checkOutType === 2 && init) {
                this.StockBySaleOut()
            }
            // let data = await this.webapi.operation.findSupplierList({})
            // let listdada = [{customerName: '全部'}].concat(data)
            // this.renderSelectOption(listdada)
        }
    }

    StockBySaleOut = async () => {
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) modalWidth = 1920
        const ret = await this.metaAction.modal("show", {
            title: "按销售出库",
            style: { top: 25 },
            width: modalWidth,
            height: modalHeight,
            className: "business-modal",
            bodyStyle: {
                maxHeight: modalHeight - 47,
                padding: "20px 30px",
                overflow: "auto",
            },
            children: (
                <StockAppBySaleOut
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    closeModal={this.component.props.closeModal}></StockAppBySaleOut>
            ),
            footer: null,
        })
        if (ret === "ok") {
            this.reload()
        }
    }

    getPeriod = () => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        const { name, periodDate } = currentOrg
        let time
        if (
            sessionStorage["stockPeriod" + name] != "undefined" &&
            sessionStorage["stockPeriod" + name]
        ) {
            time = sessionStorage["stockPeriod" + name]
        } else {
            sessionStorage["stockPeriod" + name] = periodDate
            time = periodDate
        }
        return time
    }

    // 新增暂估入库单
    newZGRK = async negativeItemList => {
        const arr = []
        negativeItemList.forEach(item => {
            item.qmNum = Math.abs(item.qmNum) || 0
            item.qmBalance = Math.abs(item.qmBalance) || 0
            item.qmPrice = utils.number.round(item.qmBalance / item.qmNum, 6)
            arr.push(item)
        })
        await this.metaAction.modal("show", {
            title: "新增",
            footer: null,
            width: modalWidth,
            height: modalHeight - 47,
            bodyStyle: { ...modalBodyStyle, padding: "20px 30px" },
            style: { top: 25 },
            children: this.metaAction.loadApp("ttk-stock-app-inventory-assessment-add", {
                store: this.component.props.store,
                // parentId: type,
                // id: ret.id,
                arr,
                isFrom: "StockAppCarryOverMainBusinessCost",
            }),
        })
        setTimeout(() => {
            this.load(true)
        }, 20)
    }

    // // 帮助的图标和说明
    renderHelp1 = () => {
        let text = "该金额不限于销售出库金额，也包含其他出库类型的金额，如领料单"
        return HelpIcon(text, "bottom")
    }

    // 表格cell右对齐，文本溢出隐藏
    renderSpan = mainBusinessTable => {
        const columns = mainBusinessTable.map(col => {
            const v = { ...col }
            v.title = <div className="ttk-stock-app-table-header-txt"> {v.title} </div>

            if (v.children) {
                v.children = this.renderSpan(v.children)
            }
            return v
        })
        return columns
    }

    //渲染表格
    renderColumns = () => {
        const columns = this.renderSpan(this.mainBusinessTable)
        return columns
    }

    // 列合计
    _calColumnTotal = () => {
        const allList = this.state.list1.slice(0)
        let qzNumT = 0,
            qzBalanceT = 0,
            qmNumT = 0,
            qmBalanceT = 0
        allList.map(v => {
            qzNumT += transToNum(v.qzNum)
            qzBalanceT += transToNum(v.qzBalance)
            qmNumT += transToNum(v.qmNum)
            qmBalanceT += transToNum(v.qmBalance)
        })
        return {
            qzNumT,
            qzBalanceT,
            qmNumT,
            qmBalanceT,
        }
    }

    //渲染合计
    renderFooter = () => {
        return {
            rows: null,
            rowsComponent: columns => {
                const colStyle = {
                    paddingLeft: "10px",
                    borderRight: "1px solid #d9d9d9",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                }
                const rows = []
                const { qzNumT, qzBalanceT, qmNumT, qmBalanceT } = this._calColumnTotal()
                const _cols = flatCol(columns)
                _cols.forEach((c, i) => {
                    const style = { ...colStyle, width: c.width, flex: c.flexGrow },
                        className = c.fixed ? "vt-summary " + c.fixed : ""
                    if (i === _cols.length - 1) {
                        delete style.borderRight
                        style.paddingRight = "20px"
                    }
                    let row = null
                    let align = "left"
                    switch (c.key) {
                        case "inventoryCode":
                            row = "合计"
                            break
                        case "qzNum":
                            row = formatSixDecimal(qzNumT, 6)
                            break
                        case "qzBalance":
                            align = "right"
                            row = utils.number.format(qzBalanceT, 2)
                            break
                        case "qmNum":
                            row = formatSixDecimal(qmNumT, 6)
                            break
                        case "qmBalance":
                            align = "right"
                            row = utils.number.format(qmBalanceT, 2)
                            break
                        default:
                            row = ""
                            break
                    }
                    rows.push(
                        <div style={style} className={className} title={row} align={align}>
                            {row}
                        </div>
                    )
                })
                return <div className="vt-summary row">{rows}</div>
            },
            height: 37,
        }
    }

    // // 是否显示弹框
    // isShowSmDialog = event=> this.injections.reduce('updateSfs',{['data.isShowSmDialog']: event.target.checked})
    unique = arr => {
        var obj = {}
        let newArr = arr.reduce(function (item, next) {
            obj[next.inventoryId] ? "" : (obj[next.inventoryId] = true && item.push(next))
            return item
        }, [])
        return newArr
    }
    // 科目设置
    matchSubject = async list => {
        let flag = true // 标记是否是生成凭证调用的科目设置  默认为true 非生成凭证调用为false
        if (!list) {
            // 设置调用科目设置的情况
            let arr = this.state.list.filter(o => o.selected)
            if (!arr || arr.length == 0) {
                this.setState({ loading: false })
                return this.metaAction.toast("error", "请选择单据")
            }
            arr = arr.filter(item => !(item.voucherIds || item.isBillBodyNumNull))
            if (arr.length < 1) {
                this.setState({ loading: false })
                return this.metaAction.toast("error", "没有需要进行科目设置的单据")
            }
            list = arr.slice(0)
            flag = false
        }
        let billBodyDtoList = []
        list.forEach(item => {
            billBodyDtoList = billBodyDtoList.concat(item.billBodyDtoList)
        })
        billBodyDtoList = this.unique(billBodyDtoList)
        billBodyDtoList = setListEmptyVal(billBodyDtoList)
        const inventorys = billBodyDtoList.map(v => ({ inventoryId: v.inventoryId }))
        const resp = await this.webapi.stock.getInventoryGoods({ inventorys }) // 获取科目设置的存货列表
        let matchSubjectResult
        if (resp) {
            // 如果全部已经匹配，则直接生成结转凭证
            if (flag) {
                // let hasUnMatched = resp.some(
                //     v => !v.salesCostAccountId || !v.inventoryRelatedAccountId
                // )
                // if (!hasUnMatched) {
                //     return true
                // }
                let stockSubject = true,
                    hasUnMatched = true
                for (const item of resp) {
                    if (!item.inventoryRelatedAccountId) {
                        stockSubject = false
                    }
                    if (!item.salesCostAccountId) {
                        hasUnMatched = false
                    }
                }
                if (!stockSubject) {
                    this.metaAction.toast(
                        "warning",
                        "存货科目未设置，请先进入【存货档案】设置科目!"
                    )
                    return false
                }
                if (hasUnMatched) {
                    return true
                }
            }
            matchSubjectResult = await this.openSubjectSettingModal(resp)
        }
        return matchSubjectResult
    }
    // 打开科目设置弹窗
    openSubjectSettingModal(resp) {
        const params = {
            period: this.params.period || this.defaultPeriod,
            serviceCode: "FWGRK",
            name: "",
            inventoryClassId: null,
        } // 科目设置过滤筛选框的请求阐述
        return this.metaAction.modal("show", {
            title: "科目设置",
            name: "",
            wrapClassName: "",
            width: 1000,
            okText: "保存",
            cancelText: "取消",
            bodyStyle: { padding: "20px 30px" },
            allowDrag: false,
            children: this.metaAction.loadApp(
                'ttk-stock-app-matchSubject?key="carrymainBusiness"',
                {
                    // listIds: { inventorys },
                    list: [...resp], // 存货列表
                    isNeedMatchCost: true,
                    requestParams: params,
                    store: this.component.props.store,
                }
            ),
        })
    }
    // 查看凭证
    checkoutVoucher1 = async () => {
        // const voucherId = this.metaAction.gf('data.voucherId')
        const voucherId = this.state.voucherId
        const ret = await this.metaAction.modal("show", {
            title: "查看凭证",
            style: { top: 5 },
            width: 1200,
            bodyStyle: { padding: "20px 30px" },
            className: "stock-carry-batchCopyDoc-modal",
            okText: "保存",
            children: this.metaAction.loadApp("app-proof-of-charge", {
                store: this.component.props.store,
                initData: {
                    type: "isFromXdz",
                    id: voucherId,
                },
            }),
        })
    }

    // 删除凭证
    deleteVoucher = async () => {
        const _this = this
        Modal.confirm({
            content: "该凭证将删除，请确认！",
            okText: "确定",
            cancelText: "取消",
            onOk() {
                const params = { period: _this.period, type: 1 } //-- 1主营成本 0 生产成本
                const ret = new Promise(async (resolve, reject) => {
                    const resp = await _this.webapi.stock.deletePZ(params)
                    resolve(resp)
                }).then(res => {
                    if (res === null) {
                        const name = _this.metaAction.context.get("currentOrg").name
                        sessionStorage[
                            `ttk-stock-app-inventory-isCarryOverMainCost-${name}`
                        ] = false
                        _this.metaAction.toast("success", "凭证删除成功！")
                        _this.load()
                    }
                })
            },
            onCancel() {},
        })
    }

    // deletePZ = async(params) => await this.webapi.stock.deletePZ(params)

    // 过滤查找
    filterCallback = async option => {
        const { name, inventoryClassId } = option
        this.setState({ loading: true })
        const res = await this.webapi.stock.getCarryMainCostSheetService({
            period: this.period,
            isVoucher: this.state.isCarryOverMainCost,
            inventoryName: name,
            inventoryClassId,
        }) // 结转生产成本
        let listCopy = []
        if (res) {
            Array.isArray(res.carryMainCostSheetDtoList) &&
                res.carryMainCostSheetDtoList.forEach(item => {
                    const { copyItem, negativeItem } = dealWithData(item, true)
                    if (transToNum(copyItem.qzNum)) {
                        listCopy.push(copyItem)
                    } // 过滤掉没有销售数的数据
                    return item
                })
        }
        this.setState({
            loading: false,
            list1: listCopy,
        })
    }

    renderOptionList = () => {
        const optionList = this.state.optionList
        let arr = Array.isArray(optionList)
            ? optionList.map(item => {
                  return (
                      <Option
                          key={item.inventoryClassId}
                          value={item.inventoryClassId}
                          title={item.inventoryClassName}>
                          {item.inventoryClassName}
                      </Option>
                  )
              })
            : []
        return arr
    }

    // 输入框过滤
    handleInputChange = e => {
        this.setState({
            inputVal1: e.target.value,
        })
        // this.filterCallback({ name: e.target.value })
    }

    // 输入框回车事件
    // handlePressEnter = (e) => (this.component.props.callback && this.component.props.callback({name:e.target.value}))
    handlePressEnter = e => this.filterCallback({ name: e.target.value })

    // 下拉框显示隐藏
    // handlePopoverVisibleChange1 = (v) => { this.metaAction.sf('data.visible', v) }
    handlePopoverVisibleChange1 = visible => {
        this.setState({
            showPopoverCard1: visible,
        })
    }

    // 下拉列表选中
    // selectChange = (v) => { this.metaAction.sf('data.form1.inventoryType',v) }
    selectChange = value => {
        this.setState({
            form1: {
                ...this.state.form1,
                inventoryType: value,
            },
        })
    }

    // 放大镜点击事件
    iconSearch = () => {
        const v = this.state.inputVal1
        this.filterCallback({ name: v })
    }
    // 重置
    handlePopoverReset = () => {
        const inputVal1 = this.state.inputVal1
        this.setState({
            form1: {
                ...this.state.form1,
                inventoryType: undefined,
            },
        })
        this.filterCallback({ name: v })
    }
    // 查询
    handlePopoverConfirm = () => {
        const inventoryTypeVal = this.state.form1.inventoryType
        const inputVal1 = this.state.inputVal1
        this.filterCallback({ name: inputVal1, inventoryClassId: inventoryTypeVal })
        this.setState({ showPopoverCard1: false })
    }

    // 返回
    handleReturn = () => {
        this.component.props.onlyCloseContent &&
            this.component.props.onlyCloseContent("ttk-stock-app-carryOver-mainBusiness-cost")
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
    }

    // 过滤行业
    filterIndustry = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }

    handleTabChange = async activeKey => {
        // this.metaAction.sf('data.other.activeTabKey', activeKey)
        if (activeKey == 1) {
            this.setState({
                activeTabKey: activeKey,
                inputVal1: "",
                form1: {
                    inventoryType: null,
                },
            })
            this.load()
        } else {
            this.setState({
                activeTabKey: activeKey,
                inputVal: "",
                form: {
                    type: null,
                    typeName: "",
                    strDate: "",
                    endDate: "",
                    constom: "",
                    voucherIds: null,
                    voucherName: "",
                },
            })
            this.load()
        }
    }

    // 列表高度自适应浏览器大小，出现滚动条
    getTableScroll = e => {
        try {
            // let tableOption =  this.metaAction.gf('data.tableOption') && this.metaAction.gf('data.tableOption').toJS() || {}
            let tableOption = this.state.tableOption
            let appDom = document.getElementsByClassName(
                "ttk-stock-app-carryOver-mainBusiness-cost"
            )[0] //以app为检索范围
            if (!appDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            let width = appDom.offsetWidth
            const height = appDom.offsetHeight
            this.setState({
                tableOption: {
                    ...tableOption,
                    x: width - 10,
                    y: height - 104 - 39 * 2 - 10,
                },
            })
        } catch (err) {
            console.log(err)
        }
    }

    voucherSetOnOk = async value => {
        let obj = {
            module: "main", // 模块名
            stockRule: {
                // 单据合并生成凭证规则
                merge: value, // 1代表选中单据合并成一张,0代表一张单据一张凭证
            },
        }
        const res = await this.webapi.operation.updateVoucherRuleByModule(obj)
        if (res === null) {
            return this.metaAction.toast("success", "设置成功")
        } else {
            return this.metaAction.toast("error", "设置失败")
        }
    }

    voucherSet = async () => {
        const res = await this.webapi.operation.getVoucherRule({ module: "main" })
        const defaultValue = res.stockRule.merge
        // this.setState({value: res.stockRule.merge})
        const ret = await this.metaAction.modal("show", {
            title: "凭证合并",
            width: 400,
            top: 150,
            bodyStyle: { padding: "20px 30px" },
            children: (
                <MergeSetupByRadio
                    defaultValue={defaultValue}
                    initData={{
                        firstText: "选中单据合并一张凭证",
                        secondText: "一张单据一张凭证",
                        firstValue: "1",
                        secondValue: "0",
                    }}
                    setOkListener={this.setOkListener}
                    onOk={this.voucherSetOnOk}></MergeSetupByRadio>
            ),
            okText: "保存",
        })
    }

    negativeStockReminder = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "负库存提醒",
            width: 520,
            top: 150,
            bodyStyle: { padding: "20px 30px" },
            children: (
                <NegativeStockReminder
                    setOkListener={this.setOkListener}
                    webapi={this.webapi}
                    metaAction={this.metaAction}></NegativeStockReminder>
            ),
            okText: "保存",
        })
    }

    importXsck = async () => {
        let importObj = {
            operator: this.financeAuditor,
            period: this.period,
        }
        const ret = await this.metaAction.modal("show", {
            title: "导入销售出库单",
            width: 500,
            bodyStyle: { padding: "20px 30px" },
            children: (
                <XsckImport
                    importObj={importObj}
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    setOkListener={this.setOkListener}></XsckImport>
            ),
            okText: "导入",
        })
        if (ret) {
        }
    }

    updateLoad = (response, getInvSetByPeroid) => {
        if (response && response.list && response.list.length > 0 && response.list[0] !== null) {
            let list = response.list[response.list.length - 1]
            response.list.pop()

            this.setState({
                listAll: {
                    billBodyNumPlus: formatSixDecimal(list.billBodyNumPlus),
                    billBodyNumMinus: formatSixDecimal(list.billBodyNumMinus),
                    billBodyYbBalancePlus: utils.number.format(list.billBodyYbBalancePlus, 2),
                    billBodyYbBalanceMinus: utils.number.format(list.billBodyYbBalanceMinus, 2),
                },
                list: response.list,
            })
        } else {
            this.setState({
                listAll: {
                    billBodyNumPlus: "0",
                    billBodyNumMinus: "0",
                    billBodyYbBalancePlus: "0.00",
                    billBodyYbBalanceMinus: "0.00",
                },
                list: [],
            })
        }
        if (response && response.page) {
            let page = {
                current: response.page.currentPage,
                total: response.page.totalCount,
                pageSize: response.page.pageSize,
            }
            this.setState({
                pagination: page,
            })
        }
        if (getInvSetByPeroid) {
            let stateNow =
                getInvSetByPeroid.isGenVoucher || getInvSetByPeroid.isCarryOverMainCost
                    ? true
                    : false
            this.setState({
                limit: {
                    stateNow,
                },
                checkOutType: getInvSetByPeroid.checkOutType,
                hasXsckBill: getInvSetByPeroid.hasXsckBill,
                isCarryOverMainCost: getInvSetByPeroid.isCarryOverMainCost,
            })
        }
        let name = this.metaAction.context.get("currentOrg").name
        let year = sessionStorage["stockPeriod" + name].split("-")
        let skssq = year[0] + year[1]
        // state = this.metaReducer.sf(state, 'data.defaultPickerValue', moment(skssq, 'YYYYMM'))
        this.setState({
            defaultPickerValue: moment(skssq, "YYYYMM"),
        })
    }
    reload = async (falg, haveEdit) => {
        this.setState({ loading: true })
        let getInvSetByPeroid = await this.webapi.operation.getInvSetByPeroid({
            period: this.period,
        })
        let stateNow
        if (getInvSetByPeroid) {
            (stateNow =
                getInvSetByPeroid.isGenVoucher || getInvSetByPeroid.isCarryOverMainCost
                    ? true
                    : false)
        }
        let page = {}
        if (falg) {
            page = { currentPage: falg.currentPage, pageSize: falg.pageSize }
        } else {
            // const form = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS() || {}
            const pagination = this.state.pagination || {}
            // page = { currentPage: form.current, pageSize: form.pageSize }
            page = { currentPage: pagination.current, pageSize: pagination.pageSize }
        }
        // if (this.metaAction.gf('data.inputVal')) {
        //     page.currentPage = 1
        // }
        if (this.state.inputVal) {
            page.currentPage = 1
        }
        const form = this.state.form
        let reqList = {
            serviceTypeCode: "XSCB",
            period: currentOrg,
            code: this.state.inputVal,
            customerName: form.constom == "全部" ? null : form.constom,
            startPeriod: form.strDate ? form.strDate : null,
            endPeriod: form.endDate ? form.endDate : null,
            type: form.type == null ? null : form.type,
            voucherIds: form.voucherIds == null ? null : form.voucherIds,
            invNo: form.invNo,
            customerId: form.customerId === -1 ? undefined : form.customerId,
            page,
        }
        const response = await this.webapi.operation.querylist(reqList)
        this.updateReload(response)
        this.setState({
            limit: {
                stateNow,
            },
            checkOutType: getInvSetByPeroid.checkOutType,
            isCarryOverMainCost: getInvSetByPeroid.isCarryOverMainCost,
            loading: false,
            isAllChecked: false,
        })
        let loadTimer = setTimeout(() => {
            clearTimeout(loadTimer)
            loadTimer = null
            this.getTableScroll()
        }, 100)
    }
    updateReload = response => {
        if (response && response.list && response.list.length > 0 && response.list[0] !== null) {
            let list = response.list[response.list.length - 1]
            response.list.pop()

            this.setState({
                listAll: {
                    billBodyNumPlus: formatSixDecimal(list.billBodyNumPlus),
                    billBodyNumMinus: formatSixDecimal(list.billBodyNumMinus),
                    billBodyYbBalancePlus: utils.number.format(list.billBodyYbBalancePlus, 2),
                    billBodyYbBalanceMinus: utils.number.format(list.billBodyYbBalanceMinus, 2),
                },
                list: response.list,
            })
        } else {
            this.setState({
                listAll: {
                    billBodyNumPlus: "0",
                    billBodyNumMinus: "0",
                    billBodyYbBalancePlus: "0.00",
                    billBodyYbBalanceMinus: "0.00",
                },
                list: [],
            })
        }
        if (response && response.page) {
            let page = {
                current: response.page.currentPage,
                total: response.page.totalCount,
                pageSize: response.page.pageSize,
            }
            this.setState({
                pagination: page,
            })
        }
    }
    // 确认是一般纳税人 还是小规模
    confirmType = () => {
        return this.metaAction.context.get("currentOrg").vatTaxpayer === 2000010001
            ? "22210107"
            : "22210199"
    }
    habitSetting = async e => {
        const ret = await this.metaAction.modal("show", {
            title: "凭证合并",
            style: { top: 5 },
            bodyStyle: { padding: "20px 30px" },
            width: 500,
            children: (
                <HabitSetting
                    module="main"
                    store={this.component.props.store}
                    metaAction={this.metaAction}
                    webapi={this.webapi}
                />
            ),
        })
    }
    // 生成凭证
    generateVoucher = async event => {
        event.stopPropagation && event.stopPropagation()
        event.nativeEvent.stopPropagation && event.nativeEvent.stopPropagation()
        let list = this.state.list.filter(o => o.selected)
        if (!list || list.length == 0) {
            return this.metaAction.toast("error", "请选择需生成凭证单据")
        }
        if (this.state.isAllChecked) {
            this.createAllPz()
            return
        }
        list = list.filter(item => !(item.voucherIds || item.isBillBodyNumNull))
        if (list.length < 1) {
            return this.metaAction.toast("error", "没有需要生成凭证的单据")
        }
        if (this.generateVoucherDoing) {
            return false
        }
        this.generateVoucherDoing = true
        const matchSubjectResult = await this.matchSubject(list)
        if (matchSubjectResult) {
            this.setState({ loading: true })
            await this.createPz(list)
            this.setState({ loading: false })
        }
        this.generateVoucherDoing = false
    }
    // 最终生成凭证
    createPz = async list => {
        list = list.map(item => ({
            serviceTypeCode: "XSCB",
            period: this.period,
            id: item.id,
            code: item.code,
        }))
        let resp = await this.webapi.stock.getCarryMainCostSheetService({
            period: this.period,
            isVoucher: true,
        })
        if (resp) {
            let obj = {
                stockDtoMain: {
                    period: this.period,
                    carryMainCostSheetDtoList: resp.carryMainCostSheetDtoList,
                    billTitleDtos: list,
                },
            }
            let ret = await this.webapi.operation.createPz(obj)
            if (ret) {
                this.metaAction.toast("success", "生成凭证成功")
                this.reload()
            }
        }
    }
    // 税务科目设置
    setSubject = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "科目设置",
            style: { top: 5 },
            width: 800,
            okText: "保存",
            bodyStyle: { padding: "20px 30px" },
            wrapClassName: "bovms-app-purchase-list-subject-setting",
            children: (
                <SubjectSetting
                    store={this.component.props.store}
                    metaAction={this.metaAction}
                    webapi={this.webapi}
                    module="stockXs"
                />
            ),
        })
        if (ret) {
            return true
        } else {
            return false
        }
    }
    changeTypeSelect = value => {
        let select = typeSelectOption.find(item => item.typeName === value)
        this.setState({
            form: {
                ...this.state.form,
                type: select.typeId,
                typeName: select.typeName,
            },
        })
    }
    changeVoucherSelect = value => {
        let select = voucherIdsSelectOption.find(item => item.voucherName === value)
        this.setState({
            form: {
                ...this.state.form,
                voucherIds: select.voucherIds,
                voucherName: select.voucherName,
            },
        })
    }
    changeCustomerSelect = customerId => {
        this.setState({
            form: {
                ...this.state.form,
                customerId,
            },
        })
    }
    changeInvNo = e => {
        this.setState({
            form: {
                ...this.state.form,
                invNo: e.target.value,
            },
        })
    }
    renderHelp = () => {
        let text = (
            <div style={{ padding: "5px 10px", lineHeight: "25px" }}>
                <div>销售出库生成1张或多张凭证，当前及其他模块，控制如下：</div>
                <div>1、不支持新增、导入、删除单据</div>
                <div>2、点击单据编号，打开单据查询界面</div>
            </div>
        )
        return HelpIcon(text, "bottomRight")
    }
    disabledDate = current => {
        let startperiod = this.state.startPeriod
        return current < moment(startperiod)
    }
    renderTypeSelectOption = () => {
        return typeSelectOption.map(item => {
            return (
                <Option key={item.typeId} value={item.typeName} title={item.typeName}>
                    {item.typeName}
                </Option>
            )
        })
    }
    renderVoucherIdsSelectOption = () => {
        return voucherIdsSelectOption.map(item => {
            return (
                <Option key={item.voucherIds} value={item.voucherName} title={item.voucherName}>
                    {item.voucherName}
                </Option>
            )
        })
    }
    renderCustomerSelectOption = () => {
        return (this.state.customerList || []).map(item => (
            <Option key={item.customerId} value={item.customerId} title={item.customerName}>
                {item.customerName}
            </Option>
        ))
    }
    // 过滤行业
    filterIndustry = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }
    // getSelectOption = () => {
    //     return this.selectOption
    // }
    pageChanged = (currentPage, pageSize) => {
        if (pageSize == null || pageSize == undefined) {
            // pageSize = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS().pageSize || {}
            pageSize = (this.state.pagination && this.state.pagination.pageSize) || 0
        }
        let page = { currentPage, pageSize }
        this.reload(page)
    }
    back = async () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
        this.component.props.onlyCloseContent("ttk-stock-app-inventory-saleOutStock")
    }
    filterList = () => {
        this.setState({
            showPopoverCard: false,
        })
        this.reload()
    }
    handlePopoverVisibleChange = visible => {
        this.setState({
            showPopoverCard: visible,
        })
    }
    resetForm = () => {
        this.setState({
            form: {
                type: null,
                typeName: "",
                strDate: "",
                endDate: "",
                constom: "",
                voucherIds: null,
                voucherName: "",
                invNo: undefined,
            },
        })
    }
    addType = async () => {
        const name = "销售出库单"
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) modalWidth = 1920
        const ret = await this.metaAction.modal("show", {
            title: "新增",
            style: { top: 25 },
            width: modalWidth,
            height: 520,
            bodyStyle: {
                maxHeight: modalHeight - 47 - 44,
                padding: "20px 30px",
                overflow: "auto",
            },
            footer: null,
            children: this.metaAction.loadApp("purchase-ru-ku-add-alert-new", {
                store: this.component.props.store,
                formName: "销售出库单",
                period: this.period,
                type: 1, // 类型 0 自动生成 1手动新增或录入 2 迁移 3 导入
                newAdd: true, // 是否是手动新增
                checkOutType: this.state.checkOutType,
                editType: "新增",
            }),
        })
        if (ret !== "null") {
            this.reload()
        }
    }
    lock = (id, invNo, voucherIds, type) => e => {
        let personId = id ? id : null
        this.lookDtile(personId, invNo, voucherIds, type)
    }
    lookDtile = async (id, invNo, voucherIds, type) => {
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) modalWidth = 1920
        const isNotEdit = this.xdzOrgIsStop || voucherIds || this.state.limit.stateNow
        let ret = await this.metaAction.modal("show", {
            title: isNotEdit ? "查看" : "编辑",
            style: { top: 25 },
            width: modalWidth,
            height: 520,
            bodyStyle: {
                maxHeight: modalHeight - 47 - 44,
                padding: "20px 30px",
                overflow: "auto",
            },
            footer: null,
            children: this.metaAction.loadApp("purchase-ru-ku-add-alert-new", {
                store: this.component.props.store,
                formName: "销售出库单",
                id: id,
                voucherIds: voucherIds,
                type: type,
                period: this.period,
                isReadonly: isNotEdit ? true : null,
                checkOutType: this.state.checkOutType,
                editType: isNotEdit ? "查看" : "编辑",
            }),
        })
        if (ret !== "null") {
            this.reload()
        }
    }
    moreActionOpeate = e => {
        this[e.key] && this[e.key]()
    }
    // 获取搜索条件
    getSearchParams() {
        const form = this.state.form
        return {
            serviceTypeCode: "XSCB",
            period: this.period,
            code: this.state.inputVal,
            customerName: form.constom == "全部" ? null : form.constom,
            startPeriod: form.strDate ? form.strDate : null,
            endPeriod: form.endDate ? form.endDate : null,
            type: form.type == null ? null : form.type,
            voucherIds: form.voucherIds == null ? null : form.voucherIds,
        }
    }
    // 删除全部单据和凭证、删除全部单据凭证
    async deleteAllBillOrPz(type) {
        const api = type === "pz" ? "deleteAllPz" : "deleteAllBillAndPz"
        this.setState({ loading: true })
        const reqList = { ...this.getSearchParams(), isAll: true }
        const response = await this.webapi.stock[api](reqList)
        if (response) {
            this.metaAction.toast("success", type === "pz" ? "删除凭证成功" : "删除单据成功")
            this.reload()
        }
        this.setState({ loading: false })
    }
    // 全部生成单据凭证
    async createAllPz() {
        this.setState({ loading: true })
        const reqList = { ...this.getSearchParams(), isAll: true }
        const response = await this.webapi.stock.createAllPz(reqList)
        this.setState({ loading: false })
        if (response) {
            const { infoType, data } = response
            switch (infoType) {
                case "resultInfo":
                    this.metaAction.toast("success", data || "凭证生成成功")
                    break
                case "kmInfo":
                    const res = await this.openSubjectSettingModal((data && JSON.parse(data)) || [])
                    if (res) {
                        this.createAllPz()
                    }
                    break
            }
        }
        this.reload()
    }
    // 删除单据(多条)
    settlement = async () => {
        let isAllChecked = this.state.isAllChecked
        let list = this.state.list.filter(o => o.selected)
        if (list.length == 0) {
            this.metaAction.toast("error", "请先选择数据")
            return false
        }
        if (isAllChecked) {
            this.deleteAllBillOrPz("billAndPz")
            return
        }
        if (list.some(o => o.voucherIds)) {
            const ret = await this.metaAction.modal("show", {
                title: "提示",
                width: 400,
                bodyStyle: { padding: "20px 30px" },
                children: <div>凭证已存在，不允许删除单据</div>,
            })
            return false
        }

        list = list.map(item => ({
            // invNo: item.invNo || "",
            // voucherIds: item.voucherIds || "",
            serviceTypeCode: "XSCB",
            period: this.period,
            id: item.id,
            code: item.code,
        }))
        this.setState({ loading: true })
        const response = await this.webapi.operation.deleteBillAndPz(list)
        if (response) {
            this.metaAction.toast("success", "删除单据成功")
            this.reload()
        }
        this.setState({ loading: false })
    }

    // 删除凭证
    delectPz = async () => {
        // let list = this.extendAction.gridAction.getSelectedInfo('dataGrid') //选中
        let list = this.state.list.filter(o => o.selected)
        if (list.length == 0) {
            this.metaAction.toast("error", "请先选择数据")
            return false
        }
        if (this.state.isAllChecked) {
            this.deleteAllBillOrPz("pz")
            return
        }
        list = list.filter(item => !!item.voucherIds)
        if (list.length < 1) return this.metaAction.toast("error", "没有需要删除凭证的单据")
        list = list.map(item => ({
            voucherIds: item.voucherIds,
            serviceTypeCode: "XSCB",
            period: this.period,
            id: item.id,
        }))
        this.setState({ loading: true })
        const response = await this.webapi.operation.deletePz(list)
        if (response) {
            this.metaAction.toast("success", "删除凭证成功")
            this.reload()
        }
        this.setState({ loading: false })
    }
    // 删除单条凭证
    delectOnly = (item, idx) => async e => {
        // const ret = await this.metaAction.modal('confirm', {
        //     title: '提示',
        //     width: 400,
        //     content: (
        //         <div>所选单据中若存在由发票自动生成的单据，删除凭证时会同步删除对应的入库单据，请确认是否删除！</div>
        //     )
        // })
        // if (ret) {
        let list = []
        list.push({
            // invNo: item.invNo || "",
            voucherIds: idx !== undefined ? item.voucherIds.split(",")[idx] : item.voucherIds,
            serviceTypeCode: "XSCB",
            period: this.period,
            id: item.id,
        })
        this.setState({ loading: true })
        const response = await this.webapi.operation.deletePz(list)
        if (response) {
            this.metaAction.toast("success", "删除凭证成功")
            this.reload()
        }
        this.setState({ loading: false })
        // }
    }

    onSearch = data => {
        let searchTimer = setTimeout(() => {
            clearTimeout(searchTimer)
            searchTimer = null
            // this.metaAction.sf(path, data)
            this.setState({
                inputVal: data,
            })
            this.reload()
        }, 500)
    }
    isSelectAll = () => {
        return this.state.list.length > 0 && this.state.list.every(o => o.selected)
    }
    selectAll = (checked, isAllChecked) => {
        let list = this.state.list.slice(0).map(item => ({ ...item, selected: checked }))
        this.setState({
            list,
            isAllChecked,
        })
    }
    selectRow = rowIndex => e => {
        let list = this.state.list.slice(0)
        list[rowIndex].selected = e.target.checked
        this.setState({
            list,
        })
    }
    delClick = (id, invNo, voucherIds) => e => {
        // if (!this.metaAction.gf('data.limit.stateNow')) {
        if (!this.state.limit.stateNow) {
            let personId = id ? id : null
            let serviceTypeCode = "XSCB"
            this.delect(serviceTypeCode, personId, invNo, voucherIds)
        }
    }
    quantityFormat = (quantity, decimals, isFocus) => {
        if (quantity) {
            return formatNumbe(quantity, decimals)
        }
    }
    checkoutVoucher = id => e => {
        if (id) {
            this.lookVoucher(id)
        }
    }
    lookVoucher = async id => {
        const voucherId = id
        const ret = await this.metaAction.modal("show", {
            title: "查看凭证",
            style: { top: 5 },
            width: 1200,
            bodyStyle: { padding: "20px 30px" },
            className: "ttk-stock-pz-modal",
            okText: "保存",
            children: this.metaAction.loadApp("app-proof-of-charge", {
                store: this.component.props.store,
                initData: {
                    type: "isFromXdz",
                    id: voucherId,
                },
            }),
        })
    }
    checkoutInvNo = record => e => {
        if (record.invNo) {
            this.lookInvNo(record)
        }
    }
    format = type => {
        return sourceOfDocumentsObj[type]
    }
    lookInvNo = async record => {
        let invArguments = {
            // 查询票据的参数 三个key为必填项 如缺少参数请自行控制
            fpzlDm: record.invType,
            fpdm: record.invCode,
            fphm: record.invNo,
        }
        let modalWidth = document.body.clientWidth - 50
        if (modalWidth > 1920) modalWidth = 1920
        let ret = await this.metaAction.modal("show", {
            title: "查看",
            width: modalWidth || 1100,
            footer: null,
            style: { top: 25 },
            bodyStyle: { padding: "0px" },
            children: this.metaAction.loadApp("inv-app-new-invoices-card", {
                // 以下参数所有为必须项
                store: this.component.props.store,
                kjxh: 1, // 这个写死一个值为1
                fplx: "xxfp", // 'xxfp''jxfp'销项发票或者是进销发票 必传
                fpzlDm: record.invType, // 发票种类代码必传
                readOnly: true, // 必传true
                justShow: true, // 必传true
                invArguments,
            }),
        })
    }
    // 分页总页数
    pageShowTotal = () => {
        // const total = this.metaAction.gf('data.pagination') ? this.metaAction.gf('data.pagination').toJS()['total'] : 0
        const total = this.state.pagination ? this.state.pagination["total"] : 0
        return `共有 ${total} 条记录`
    }

    dateChange = (v, arr) => {
        this.setState({
            form: {
                strDate: momentUtil.momentToString(arr[0], "YYYY-MM-DD"),
                endDate: momentUtil.momentToString(arr[1], "YYYY-MM-DD"),
            },
        })
    }

    renderVoucherCodes = rowData => {
        if (rowData["voucherCodes"].indexOf(",") > -1) {
            let val = rowData["voucherCodes"].split(",")
            return val.map((item, index) => {
                return (
                    <div className="titledelect" style={{ display: "inline-block" }}>
                        <span
                            name="title"
                            onClick={
                                this.xdzOrgIsStop
                                    ? undefined
                                    : this.checkoutVoucher(rowData["voucherIds"].split(",")[index])
                            }>
                            {item}
                        </span>
                        {!this.xdzOrgIsStop && item ? (
                            <Icon
                                name="helpIcon"
                                fontFamily="del-icon"
                                type="close-circle"
                                className="del-icon"
                                onClick={this.delectOnly(rowData, index)}></Icon>
                        ) : null}
                        {index < val.length - 1 ? "," : null}
                    </div>
                )
            })
        } else {
            return (
                <div className="titledelect" style={{ display: "inline-block" }}>
                    <span
                        name="title"
                        onClick={
                            this.xdzOrgIsStop ? undefined : this.checkoutVoucher(rowData.voucherIds)
                        }>
                        {rowData.voucherCodes}
                    </span>
                    {!this.xdzOrgIsStop && rowData.voucherCodes ? (
                        <Icon
                            name="helpIcon"
                            fontFamily="del-icon"
                            type="close-circle"
                            className="del-icon"
                            onClick={this.delectOnly(rowData)}></Icon>
                    ) : null}
                </div>
            )
        }
    }
    // 导入
    dataImport = () => {
        let tip = [
            "导出销售出库单模板",
            "根据要求补充模板数据",
            "导入补充后的销售出库单数据",
            "暂不支持在模板中新增系统外的存货档案和供应商档案",
        ]

        if (this.state.checkOutType == 3) {
            tip = [
                "导出销售出库模板",
                "录入出库数量",
                "导入销售出库数据，出库单价、金额自动计算",
                "暂不支持在模板中新增系统外的存货档案和供应商档案",
            ]
        }

        importModal({
            title: "销售出库单导入",
            tip,
            export: this.dataExport,
            import: this.dataUpload,
        })
    }

    // 模板导出
    dataExport = async () => {
        await this.webapi.operation.templateExport({
            period: this.period, //会计期间
            orgName: this.name, //企业名称
        })
    }

    dataUpload = async info => {
        const res = await this.webapi.operation.uploadFile({
            period: this.period,
            fileId: info.id,
            fileName: info.originalName,
            fileSuffix: info.suffix,
            fileSize: info.size,
            operator: sessionStorage["username"],
        })

        if (res && !res.uploadSuccess) {
            return await onFileError({
                confirm: data => {
                    window.open(data)
                },
                params: res.fileUrlWithFailInfo,
            })
        }

        // 核算为先进先出
        // if(this.state.checkOutType == 3) {
        //     await Modal.show({
        //         title: '销售出库导入',
        //         className: 'ttk-stock-app-main-business-import-modal',
        //         children: <div>先进先出合计表</div>,
        //     })
        // }
        this.reload({ currentPage: 1, pageSize: this.state.pagination.pageSize }, true)
        return true
    }

    // 导出
    exportData = async () => {
        this.setState({ loading: true })
        const { strDate, endDate, type, voucherIds, invNo, customerId } = this.state.form
        const { inputVal } = this.state

        await this.webapi.operation.exportData({
            period: this.period, //会计期间
            startPeriod: strDate ? strDate : "", //入库日期起
            endPeriod: endDate ? endDate : "", //入库日期止
            code: inputVal ? inputVal : "", //流水号
            type: typeof type == "number" ? type : "", //单据来源：发票生成0、手工新增1
            voucherIds: typeof voucherIds == "number" ? voucherIds : "", //凭证类型：未生成0、已生成1
            serviceTypeCode: "XSCB", //销售成本
            invNo,
            customerId: customerId === -1 ? undefined : customerId,
        })
        setTimeout(() => {
            this.setState({ loading: false })
        }, 1000)
    }

    isFifoAndCheck = data => {
        return (
            this.state.checkOutType == 3 &&
            (data.titleStockOutStatus == 1 || data.titleStockOutStatus == 2)
        )
    }
    getSummarySearchParams = () => {
        const { name } = this.metaAction.context.get("currentOrg") || {}
        const inventoryClassId = this.state.form1.inventoryType
        const inventoryName = this.state.inputVal1
        return {
            period: this.period,
            isVoucher: this.state.isCarryOverMainCost,
            inventoryName,
            inventoryClassId,
            name,
        }
    }
    getPrintProps = () => {
        const printData = this.state.list1
        return {
            printType: 2,
            params: {
                codeType: "XSHZ",
            },
            disabled: !(Array.isArray(printData) && printData.length > 0),
            getSearchParams: this.getSummarySearchParams,
        }
    }
    renderSumTabContent() {
        const {
            loading,
            list1,
            tableOption,
            activeTabKey,
            pageTitle,
            showPopoverCard1,
            form1,
            inputVal1,
            month,
            isVoucher,
        } = this.state
        const popoverContent1 = (
            <div className="inv-batch-custom-popover-content" name="popover-content">
                <div className="filter-content" name="filter-content">
                    <div className="inv-batch-custom-popover-item" name="popover-sale">
                        <span className="inv-batch-custom-popover-label" name="label">
                            存货类型：
                        </span>
                        <Select
                            name="select"
                            className="inv-batch-custom-popover-option"
                            showSearch={true}
                            getPopupContainer={trigger => {
                                return trigger.parentNode
                            }}
                            placeholder="请选择"
                            filterOption={this.filterIndustry}
                            value={form1.inventoryType}
                            onSelect={this.selectChange}
                            children={this.renderOptionList()}></Select>
                    </div>
                </div>
                <div className="filter-footer" name="filter-footer">
                    <Button type="primary" name="search" onClick={this.handlePopoverConfirm}>
                        查询
                    </Button>
                    <Button className="reset-btn" name="search" onClick={this.handlePopoverReset}>
                        重置
                    </Button>
                </div>
            </div>
        )
        return (
            <React.Fragment>
                <div className="ttk-stock-app-header">
                    <div className="header-left">
                        <div className="back" name="back" onClick={this.handleReturn}></div>
                        <div className="filter-container">
                            <Input
                                className="filter-input"
                                type="text"
                                placeholder="请输入存货编号或存货名称"
                                name="header-filter-input"
                                // onChange={(e) => {this.onSearch(e.target.value)}}
                                prefix={
                                    <Icon
                                        name="search"
                                        type="search"
                                        onClick={() => {
                                            this.iconSearch()
                                        }}></Icon>
                                }
                                onPressEnter={this.handlePressEnter}
                                onChange={this.handleInputChange}
                                value={inputVal1}></Input>
                            <Popover
                                title=""
                                name="popover"
                                popupClassName="inv-batch-sale-list-popover"
                                placement="bottom"
                                visible={showPopoverCard1}
                                trigger="click"
                                onVisibleChange={this.handlePopoverVisibleChange1}
                                content={popoverContent1}>
                                <span className="filter-btn header-item" name="filterSpan">
                                    <Icon name="filter" type="filter"></Icon>
                                </span>
                            </Popover>
                        </div>
                    </div>
                    <div className="header-right">
                        <span style={{ marginRight: 10 }}>月份：{month}</span>
                        <PrintButton {...this.getPrintProps()} />
                    </div>
                </div>
                <VirtualTable
                    className="ttk-stock-app-carryOver-mainBusiness-cost-main-table"
                    key="inventoryId"
                    rowKey="inventoryId"
                    bordered={true}
                    pagination={false}
                    width={tableOption.x + 10 || 1000}
                    height={(tableOption.y || 600) + 39 * 2 + 10}
                    // loading: '{{data.loading}}',
                    scroll={{
                        y: tableOption.y + 10,
                        x: (tableOption.x < 1210 ? 1210 : tableOption.x) + 20,
                    }}
                    columns={this.renderColumns()}
                    dataSource={list1}
                    allowResizeColumn
                    summaryRows={this.renderFooter()}
                />
            </React.Fragment>
        )
    }
    handleMenuClick(e) {
        switch (e.key) {
            case "selectPage":
                this.selectAll(true, false)
                return
            case "selectAll":
                this.selectAll(true, true)
                return
            case "cancelSelect":
                this.selectAll(false, false)
                return
        }
    }

    dealData = () => {
        let list = this.state.list,
            res = []
        list.forEach((x, i) => {
            if (x.selected) {
                let temp = [],
                    data = x.billBodyDtoList
                data.forEach((y, j) => {
                    temp.push({
                        accountName: this.name,
                        amount: y.ybbalance,
                        billCode: x.code,
                        billNname: "销售出库单",
                        creator: x.operater,
                        custName: x.customerName,
                        indexNo: j + 1,
                        number: y.num,
                        remarks: "",
                        specification: y.inventoryGuiGe,
                        stockCode: y.inventoryCode,
                        stockName: y.inventoryName,
                        storageDate: x.cdate,
                        unit: y.inventoryUnit,
                        unitPrice: y.price,
                        voucherCode: x.voucherCodes,
                    })
                    if (j == data.length - 1) {
                        res.push(temp)
                    }
                })
            }
        })
        if (!res.length) {
            this.metaAction.toast("error", "请勾选单据")
            return
        }
        return res
    }

    renderAllCheckbox() {
        const moreMenu = (
            <Menu onClick={::this.handleMenuClick}>
                <Menu.Item key="selectPage">选择本页</Menu.Item>
                <Menu.Item key="selectAll">选择全部</Menu.Item>
                <Menu.Item key="cancelSelect">取消选择</Menu.Item>
            </Menu>
        )
        return (
            <Dropdown overlay={moreMenu}>
                <a>
                    选择 <Icon type="down" />
                </a>
            </Dropdown>
        )
    }
    rowHeightGetter(index, row) {
        if (!row) {
            row = this.state.list[index]
        }
        const detailList = (row && row.billBodyDtoList) || []
        return 37 * ((detailList.length > 5 ? 6 : detailList.length) + 1)
    }
    renderMultiLine = (field, align, lookMore, footer, precision, notClearZero) => ps => {
        const list = this.state.list
        if (!list || (list && list.length < 1)) return null
        const row = list[ps.rowIndex]
        const detailList = (row && row.billBodyDtoList) || []
        const len = detailList.length
        let footerText = footer && typeof footer === "boolean" ? row["billBody" + field] : footer
        footerText =
            footer === true && precision
                ? notClearZero
                    ? formatNumbe(footerText, precision)
                    : formatSixDecimal(formatNumbe(footerText, precision))
                : footerText
        return (
            <React.Fragment>
                {detailList.slice(0, 5).map((item, i) => {
                    const text = precision
                        ? notClearZero
                            ? formatNumbe(item[field.toLowerCase()], precision)
                            : formatSixDecimal(formatNumbe(item[field.toLowerCase()], precision))
                        : item[field]
                    return (
                        <div
                            align={align}
                            key={i}
                            className="stock-table-cell-multil-row"
                            title={text}>
                            {precision ? text || null : text}
                        </div>
                    )
                })}

                {len > 5 && (
                    <div align={align} className="stock-table-cell-multil-row more">
                        {lookMore ? (
                            <a onClick={this.lock(row.id, row.invNo, row.voucherIds, row.type)}>
                                查看更多...
                            </a>
                        ) : null}
                    </div>
                )}
                <div align={align} className="stock-table-cell-multil-row " title={footerText}>
                    {footerText}
                </div>
            </React.Fragment>
        )
    }
    renderDetailTabContent() {
        const {
            loading,
            tableOption,
            activeTabKey,
            pagination,
            form,
            limit,
            showPopoverCard,
            list,
            listAll,
            defaultPickerValue,
            inputVal,
            checkOutType,
        } = this.state

        let {
            billBodyNumMinus,
            billBodyYbBalanceMinus,
            billBodyNumPlus,
            billBodyYbBalancePlus,
        } = listAll
        let numPlus = formatSixDecimal(formatNumbe(billBodyNumPlus)),
            ybBalancePlus = utils.number.format(formatNumbe(billBodyYbBalancePlus), 2)

        let numMinus = "",
            ybBalanceMinus = ""
        billBodyNumMinus = formatNumbe(billBodyNumMinus)
        billBodyYbBalanceMinus = formatNumbe(billBodyYbBalanceMinus)

        if (billBodyNumMinus || billBodyYbBalanceMinus) {
            numMinus = formatSixDecimal(billBodyNumMinus)
            ybBalanceMinus = utils.number.format(billBodyYbBalanceMinus, 2)
        }

        const moreMenu = (
            <Menu name="menu" onClick={this.moreActionOpeate}>
                {!this.xdzOrgIsStop && (
                    <Menu.Item
                        name="settlement"
                        key="settlement"
                        className="app-asset-list-disposal"
                        disabled={limit.stateNow}>
                        <span name="settlementText">删除单据</span>
                    </Menu.Item>
                )}
                {!this.xdzOrgIsStop && (
                    <Menu.Item name="delectPz" key="delectPz" className="app-asset-list-disposal">
                        删除凭证
                    </Menu.Item>
                )}
                <Menu.Item name="exportData" key="exportData" className="app-asset-list-disposal">
                    导出
                </Menu.Item>
                {!this.xdzOrgIsStop && checkOutType != 3 && (
                    <Menu.Item
                        name="dataImport"
                        key="dataImport"
                        className="app-asset-list-disposal"
                        disabled={limit.stateNow}>
                        导入
                    </Menu.Item>
                )}
            </Menu>
        )
        const popoverContent = (
            <div className="inv-batch-custom-popover-content" name="popover-content">
                <div className="filter-content" name="filter-content">
                    <div className="inv-batch-custom-popover-item" name="bill-date">
                        <span className="inv-batch-custom-popover-label" name="label">
                            出库日期：
                        </span>
                        <DatePicker.RangePicker
                            name="rangePicker"
                            disabledDate={this.disabledDate}
                            defaultPickerValue={[defaultPickerValue, defaultPickerValue]}
                            value={[
                                momentUtil.stringToMoment(this.state.form.strDate, "YYYY-MM-DD"),
                                momentUtil.stringToMoment(this.state.form.endDate, "YYYY-MM-DD"),
                            ]}
                            onChange={this.dateChange}
                            allowClear={true}
                            placeholder={["开始日期", "结束日期"]}
                            className="popover-body-content-item-date"
                            getCalendarContainer={trigger => {
                                return trigger.parentNode
                            }}></DatePicker.RangePicker>
                    </div>
                    <div className="inv-batch-custom-popover-item" name="popover-sale">
                        <span className="inv-batch-custom-popover-label" name="label">
                            来源：
                        </span>
                        <Select
                            name="select"
                            className="inv-batch-custom-popover-option"
                            showSearch={true}
                            getPopupContainer={trigger => {
                                return trigger.parentNode
                            }}
                            placeholder="请选择"
                            filterOption={this.filterIndustry}
                            value={this.state.form.typeName}
                            onSelect={this.changeTypeSelect}
                            children={this.renderTypeSelectOption()}></Select>
                    </div>
                    <div className="inv-batch-custom-popover-item" name="popover-sale">
                        <span className="inv-batch-custom-popover-label" name="label">
                            凭证状态：
                        </span>
                        <Select
                            name="select"
                            className="inv-batch-custom-popover-option"
                            showSearch={true}
                            getPopupContainer={trigger => {
                                return trigger.parentNode
                            }}
                            placeholder="请选择"
                            filterOption={this.filterIndustry}
                            value={this.state.form.voucherName}
                            onSelect={this.changeVoucherSelect}
                            children={this.renderVoucherIdsSelectOption()}></Select>
                    </div>
                    <div className="inv-batch-custom-popover-item" name="popover-sale">
                        <span className="inv-batch-custom-popover-label" name="label">
                            发票号码：
                        </span>
                        <Input
                            name="invNo"
                            className="popover-body-content-item-date"
                            placeholder="请输入发票号码"
                            value={this.state.form.invNo}
                            onChange={this.changeInvNo}
                        />
                    </div>
                    <div className="inv-batch-custom-popover-item" name="popover-sale">
                        <span className="inv-batch-custom-popover-label" name="label">
                            往来单位：
                        </span>
                        <Select
                            name="select"
                            className="inv-batch-custom-popover-option"
                            showSearch={true}
                            getPopupContainer={trigger => {
                                return trigger.parentNode
                            }}
                            placeholder="请选择"
                            filterOption={this.filterIndustry}
                            value={this.state.form.customerId}
                            onSelect={this.changeCustomerSelect}
                            children={this.renderCustomerSelectOption()}></Select>
                    </div>
                </div>
                <div className="filter-footer" name="filter-footer">
                    <Button type="primary" name="search" onClick={this.filterList}>
                        查询
                    </Button>
                    <Button className="reset-btn" name="search" onClick={this.resetForm}>
                        重置
                    </Button>
                </div>
            </div>
        )
        const voucherMenu = (
            <Menu name="menu" onClick={this.moreActionOpeate}>
                <Menu.Item name="voucherSet" key="habitSetting" className="app-asset-list-disposal">
                    凭证合并
                </Menu.Item>
                <Menu.Item
                    name="matchSubject"
                    key="matchSubject"
                    className="app-asset-list-disposal">
                    科目设置
                </Menu.Item>
            </Menu>
        )
        let columns = [
            <DataGrid.Column
                name="select"
                columnKey="select"
                fixed={true}
                width={40}
                header={
                    <DataGrid.Cell name="header">
                        {
                            <Checkbox
                                name="chexkbox"
                                checked={this.isSelectAll()}
                                onChange={e => this.selectAll(e.target.checked, false)}></Checkbox>
                        }
                    </DataGrid.Cell>
                }
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    return (
                        <DataGrid.Cell
                            name="cell"
                            style={{
                                lineHeight: this.rowHeightGetter(null, list[ps.rowIndex]) + "px",
                            }}>
                            <Checkbox
                                name="select"
                                onChange={this.selectRow(ps.rowIndex)}
                                checked={list[ps.rowIndex].selected}></Checkbox>
                        </DataGrid.Cell>
                    )
                }}
            />,
            <DataGrid.Column
                name="code"
                columnKey="code"
                width={130}
                flexGrow={1}
                fixed={true}
                align="left"
                header={<DataGrid.Cell name="header">单据编号</DataGrid.Cell>}
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    let fifoTips = ""
                    if (this.isFifoAndCheck(list[ps.rowIndex])) {
                        fifoTips =
                            list[ps.rowIndex].titleStockOutStatus == 1
                                ? "全部参与出库成本核算"
                                : "部分参与出库成本核算"
                    }
                    const isTips = list[ps.rowIndex].isBillBodyNumNull
                    const tipWidth = (fifoTips ? 25 : 0) + (isTips ? 20 : 0)
                    return (
                        <DataGrid.Cell
                            name="cell"
                            align="left"
                            className="billCode-cell"
                            style={{
                                lineHeight: this.rowHeightGetter(null, list[ps.rowIndex]) + "px",
                            }}>
                            <span
                                name="title"
                                className="codeText"
                                style={{
                                    width: `calc(100% - ${tipWidth}px)`,
                                }}
                                onClick={this.lock(
                                    list[ps.rowIndex].id,
                                    list[ps.rowIndex].invNo,
                                    list[ps.rowIndex].voucherIds,
                                    list[ps.rowIndex].type
                                )}>
                                {list[ps.rowIndex].code}
                            </span>
                            {fifoTips && FifoIcon(fifoTips)}
                            {isTips ? (
                                <Icon
                                    name="helpIcon"
                                    fontFamily="warning-icon"
                                    type="exclamation-circle"
                                    title="单据信息不全"
                                    className="warning-icon"></Icon>
                            ) : null}
                        </DataGrid.Cell>
                    )
                }}
            />,
            <DataGrid.Column
                name="cdate"
                columnKey="cdate"
                width={100}
                flexGrow={1}
                align="left"
                header={<DataGrid.Cell name="header">出库日期</DataGrid.Cell>}
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    return (
                        <DataGrid.Cell
                            name="cell"
                            className=""
                            align="center"
                            style={{
                                lineHeight: this.rowHeightGetter(null, list[ps.rowIndex]) + "px",
                            }}>
                            {list[ps.rowIndex].cdate}
                        </DataGrid.Cell>
                    )
                }}
            />,
            <DataGrid.Column
                name="customerName"
                columnKey="customerName"
                width={120}
                flexGrow={1}
                align="left"
                header={<DataGrid.Cell name="header">往来单位</DataGrid.Cell>}
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    const rh = this.rowHeightGetter(null, list[ps.rowIndex])
                    const value = list[ps.rowIndex].customerName
                    return (
                        <DataGrid.Cell
                            name="cell"
                            align="left"
                            tip={true}
                            title={value}
                            className="overflowmove"
                            style={{
                                lineHeight: 37 + "px",
                                WebkitLineClamp: rh / 37,
                            }}>
                            {value}
                        </DataGrid.Cell>
                    )
                }}
            />,
            <DataGrid.Column
                name="savecode"
                columnKey="savecode"
                width={100}
                flexGrow={1}
                align="left"
                header={<DataGrid.Cell name="header">存货编号</DataGrid.Cell>}
                cell={this.renderMultiLine("inventoryCode", "left", true, "合计")}
            />,
            <DataGrid.Column
                name="inventoryName"
                columnKey="inventoryName"
                width={120}
                flexGrow={1}
                align="left"
                header={<DataGrid.Cell name="header">存货名称</DataGrid.Cell>}
                cell={this.renderMultiLine("inventoryName", "left", false, "")}
            />,
            <DataGrid.Column
                name="inventoryGuiGe"
                columnKey="inventoryGuiGe"
                width={120}
                flexGrow={1}
                align="left"
                header={<DataGrid.Cell name="header">规格型号</DataGrid.Cell>}
                cell={this.renderMultiLine("inventoryGuiGe", "left", false, "")}
            />,
            <DataGrid.Column
                name="inventoryUnit"
                columnKey="inventoryUnit"
                width={80}
                flexGrow={1}
                align="left"
                header={<DataGrid.Cell name="header">单位</DataGrid.Cell>}
                cell={this.renderMultiLine("inventoryUnit", "left", false, "")}
            />,
            <DataGrid.Column
                name="billBodyNum"
                columnKey="billBodyNum"
                width={90}
                flexGrow={1}
                header={<DataGrid.Cell name="header">数量</DataGrid.Cell>}
                cell={this.renderMultiLine("Num", "left", false, true, 6)}
            />,
            <DataGrid.Column
                name="price"
                columnKey="price"
                width={90}
                flexGrow={1}
                header={<DataGrid.Cell name="header">单价</DataGrid.Cell>}
                cell={this.renderMultiLine("price", "right", false, "", 6)}
            />,
            <DataGrid.Column
                name="ybbalance"
                columnKey="ybbalance"
                width={90}
                flexGrow={1}
                header={<DataGrid.Cell name="header">成本金额</DataGrid.Cell>}
                cell={this.renderMultiLine("YbBalance", "right", false, true, 2, true)}
            />,
            <DataGrid.Column
                name="invNo"
                columnKey="invNo"
                width={80}
                flexGrow={1}
                align="left"
                header={<DataGrid.Cell name="header">发票号码</DataGrid.Cell>}
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    const record = list[ps.rowIndex]
                    return (
                        <DataGrid.Cell
                            name="cell"
                            align="left"
                            style={{
                                lineHeight: this.rowHeightGetter(null, list[ps.rowIndex]) + "px",
                            }}
                            title={record.invNo}>
                            {record.invNo}
                        </DataGrid.Cell>
                    )
                }}
            />,
            <DataGrid.Column
                name="type"
                columnKey="type"
                width={50}
                flexGrow={1}
                align="center"
                header={<DataGrid.Cell name="header">来源</DataGrid.Cell>}
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    return (
                        <DataGrid.Cell
                            align="center"
                            style={{
                                lineHeight: this.rowHeightGetter(null, list[ps.rowIndex]) + "px",
                            }}>
                            {this.format(list[ps.rowIndex].type)}
                        </DataGrid.Cell>
                    )
                }}
            />,
            <DataGrid.Column
                name="num"
                columnKey="num"
                width={135}
                flexGrow={1}
                header={<DataGrid.Cell name="header">凭证号{this.renderHelp()}</DataGrid.Cell>}
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    const record = list[ps.rowIndex]
                    // JCDA2019-13804 迁移过来的单据，只要凭证号和凭证id存在，则可显示
                    const isShowVoucher =
                        record.type === 2 || record.type === 4 || record.type === 5
                            ? record.voucherCodes && record.voucherIds
                            : record.voucherCodes && !record.isBillBodyNumNull
                    return (
                        <DataGrid.Cell
                            name="cell"
                            align="left"
                            style={{
                                color: "#009fff",
                                cursor: "pointer",
                                lineHeight: this.rowHeightGetter(null, list[ps.rowIndex]) + "px",
                            }}>
                            {isShowVoucher ? this.renderVoucherCodes(record) : null}
                        </DataGrid.Cell>
                    )
                }}
            />,
        ]
        // if (this.xdzOrgIsStop) {
        //     columns = columns.filter(f => f.props.columnKey !== "select")
        // }
        return (
            <React.Fragment>
                <div className="ttk-stock-app-header">
                    <div className="header-left">
                        <div className="back" name="back" onClick={this.handleReturn}></div>
                        <div className="filter-container">
                            <Input
                                className="filter-input"
                                type="text"
                                placeholder="编号/存货名称"
                                name="header-filter-input"
                                onChange={e => {
                                    this.onSearch(e.target.value)
                                }}
                                prefix={<Icon name="search" type="search"></Icon>}
                                value={inputVal}></Input>
                            <Popover
                                name="popover"
                                title=""
                                popupClassName="inv-batch-sale-list-popover"
                                placement="bottom"
                                visible={showPopoverCard}
                                trigger="click"
                                onVisibleChange={this.handlePopoverVisibleChange}
                                content={popoverContent}>
                                <span className="filter-btn header-item" name="filterSpan">
                                    <Icon name="filter" type="filter"></Icon>
                                </span>
                            </Popover>
                        </div>
                    </div>
                    <div className="header-right">
                        {!this.xdzOrgIsStop && checkOutType === 2 && !limit.stateNow && (
                            <Button
                                className="btn-item axsck"
                                type="primary"
                                name="axsck"
                                onClick={this.StockBySaleOut}>
                                按销售出库
                            </Button>
                        )}
                        {!this.xdzOrgIsStop && checkOutType === 2 && limit.stateNow && (
                            <Button
                                className="btn-item axsck"
                                type="primary"
                                name="axsck"
                                disabled={true}
                                title={"已生成凭证，不支持重新生成"}>
                                按销售出库
                            </Button>
                        )}
                        {!this.xdzOrgIsStop && (
                            <Button.Group className="btn-item">
                                <Button type="primary" onClick={this.generateVoucher}>
                                    生成凭证
                                </Button>
                                <Dropdown name="batch3" trigger={["click"]} overlay={voucherMenu}>
                                    <Button
                                        type="primary"
                                        icon="setting"
                                        style={{ marginLeft: "1px" }}
                                    />
                                </Dropdown>
                            </Button.Group>
                        )}
                        {!this.xdzOrgIsStop && (
                            <Button
                                className="btn-item"
                                type="primary"
                                name="query1"
                                disabled={limit.stateNow}
                                onClick={this.addType}>
                                新增
                            </Button>
                        )}
                        <PrintButton
                            className="print-btn"
                            params={{ codeType: "XSCB" }}
                            dealData={this.dealData}
                        />
                        <Dropdown name="batch3" overlay={moreMenu} trigger={["click"]}>
                            <Button className="app-asset-list-header-more btn-item" name="internal">
                                <span name="word">更多</span>
                                <Icon name="more" type="down"></Icon>
                            </Button>
                        </Dropdown>
                    </div>
                </div>
                <DataGrid
                    ellipsis={true}
                    headerHeight={37}
                    name="dataGrid"
                    height={tableOption.y + 40}
                    width={tableOption.x + 10}
                    // loading={other.loading}
                    rowHeight={37}
                    isColumnResizing={false}
                    rowsCount={list.length}
                    columns={columns}
                    rowHeightGetter={::this.rowHeightGetter}
                    allowResizeColumn
                />
                <div className="ttk-stock-app-carryOver-mainBusiness-cost-footer">
                    <div>
                        <span name="totalTxt" style={{ fontSize: "14px", paddingRight: "16px" }}>
                            合计
                        </span>
                        <span name="totalNum" style={{ fontSize: "14px" }}>
                            数量:{" "}
                        </span>
                        <span name="totalNumV1" style={{ fontSize: "14px", paddingRight: "16px" }}>
                            {numPlus}
                        </span>
                        <span name="totalNumV2" style={{ fontSize: "14px", paddingRight: "25px" }}>
                            {numMinus}
                        </span>
                        <span name="totalAmount" style={{ fontSize: "14px" }}>
                            金额:{" "}
                        </span>
                        <span
                            name="totalAmountV1"
                            style={{ fontSize: "14px", paddingRight: "16px" }}>
                            {ybBalancePlus}
                        </span>
                        <span name="totalAmountV2" style={{ fontSize: "14px" }}>
                            {ybBalanceMinus}
                        </span>
                    </div>
                    <Pagination
                        pageSizeOptions={["50", "100", "200", "300", "500"]}
                        showSizeChanger={true}
                        pageSize={pagination.pageSize}
                        current={pagination.current}
                        total={pagination.total}
                        onChange={this.pageChanged}
                        showTotal={this.pageShowTotal}
                        onShowSizeChange={this.pageChanged}></Pagination>
                </div>
            </React.Fragment>
        )
    }
    render() {
        const { loading, activeTabKey } = this.state
        return (
            <React.Fragment>
                <Tabs
                    name="main"
                    className="ttk-stock-inventory-earlyStage-main"
                    animated={false}
                    forceRender={false}
                    activeKey={activeTabKey}
                    onChange={this.handleTabChange}>
                    <Tabs.TabPane
                        name="tab1"
                        key="1"
                        tab="销售出库汇总"
                        forceRender={false}></Tabs.TabPane>
                    <Tabs.TabPane
                        name="tab2"
                        key="2"
                        tab="销售出库明细"
                        forceRender={false}></Tabs.TabPane>
                </Tabs>
                <Spin spinning={loading} size="large" tip="数据加载中......" delay={10}>
                    {activeTabKey == 1 && this.renderSumTabContent()}
                    {activeTabKey == 2 && this.renderDetailTabContent()}
                </Spin>
            </React.Fragment>
        )
    }
}
export default StockAppCarryOverMainBusinessCost
