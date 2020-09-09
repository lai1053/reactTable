import React from "react"
import {
    Table,
    Tooltip,
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
} from "edf-component"
// import { AppLoader } from 'edf-meta-engine'
// import utils from 'edf-utils'
// import { message } from 'antd'
import { Spin } from "antd"
import moment from "moment"
import utils, { moment as momentUtil } from "edf-utils"
import SubjectSetting from "../../bovms/components/subjectSetting"
import {
    HelpIcon,
    WarningTip,
    FifoIcon,
    formatSixDecimal,
    denyClick,
    stockLoading,
} from "../commonAssets/js/common"
import { formatNumbe } from "../common"
import importModal, { onFileError } from "./common/ImportModal"
import PrintButton from "./common/PrintButton"
import HabitSetting from "./HabitSetting"

const sourceOfDocumentsObj = {
    "0": "生成",
    "1": "录入",
    "2": "迁移",
    "3": "导入",
    "4": "迁移",
    "5": "迁移",
}
class StockAppPurchase extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            list: [],
            limit: {
                stateNow: "",
            },
            listAll: {
                billBodyNum: "0",
                billBodyYbBalance: "0.00",
                billBodyNumMinus: "0",
                billBodyYbBalanceMinus: "0.00",
                billBodyNumPlus: "0",
                billBodyYbBalancePlus: "0.00",
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
        }
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.params = props.params || {}
        this.extendAction = props.extendAction || {}
        this.component = props.component || {}
    }

    componentWillMount() {
        this.load()
    }

    load = async falg => {
        // LoadingMask.show()
        // this.metaAction.sf('data.loading', true)
        this.setState({ loading: true })
        let page = {}
        // const form = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS() || {};
        const pagination = this.state.pagination || {}
        page = { currentPage: pagination.current, pageSize: pagination.pageSize }
        const { name, xdzOrgIsStop } = this.metaAction.context.get("currentOrg") || {}
        this.name = name
        const period = sessionStorage["stockPeriod" + this.name]
        this.period = period
        const reqData = await this.webapi.operation.init({ period, opr: 0 })
        this.startPeriod = reqData.startPeriod //启用时间
        // if (this.metaAction.gf('data.inputVal')) {
        if (this.state.inputVal) {
            page.currentPage = 1
        }
        const form = this.state.form
        let reqList = {
            serviceTypeCode: "CGRK",
            period,
            code: this.state.inputVal,
            supplierName: form.constom,
            startPeriod: form.strDate,
            endPeriod: form.endDate,
            type: form.type,
            voucherIds: form.voucherIds,
            invNo: form.invNo,
            page,
        }
        const reqQuery = this.webapi.operation.querylist(reqList)
        const reqInvSet = this.webapi.operation.getInvSetByPeroid({ period })
        const reqSupplier = this.webapi.operation.findSupplierList({})
        const reqAccount = this.webapi.operation.queryAccount({
            yearPeriod: String(period).replace("-", ""),
            isFront: "Y",
        })
        const response = await reqQuery
        let getInvSetByPeroid = await reqInvSet
        const accountInfo = await reqAccount
        this.vatTaxpayer =
            accountInfo && accountInfo.vatTaxpayer === 2000010002 ? 2000010002 : 2000010001 // 0 为一般纳税人 1为小规模
        this.updateLoad(response, getInvSetByPeroid)
        let data = await reqSupplier
        this.selectList = data
        let listdada = [{ supplierName: "全部" }].concat(data)
        this.renderSelectOption(listdada)
        this.setState({ loading: false, xdzOrgIsStop })
    }
    updateLoad = (response, getInvSetByPeroid) => {
        if (response && response.list && response.list.length > 0) {
            let list = response.list[response.list.length - 1]
            response.list.pop()
            this.setState({
                listAll: {
                    billBodyNum: formatSixDecimal(list.billBodyNum),
                    billBodyYbBalance: utils.number.format(list.billBodyYbBalance, 2),
                    billBodyNumMinus: formatSixDecimal(list.billBodyNumMinus),
                    billBodyYbBalanceMinus: utils.number.format(list.billBodyYbBalanceMinus, 2),
                    billBodyNumPlus: formatSixDecimal(list.billBodyNumPlus),
                    billBodyYbBalancePlus: utils.number.format(list.billBodyYbBalancePlus, 2),
                },
                list: response.list,
            })
        } else {
            this.setState({
                listAll: {
                    billBodyNum: 0,
                    billBodyYbBalance: "0.00",
                    billBodyNumMinus: 0,
                    billBodyYbBalanceMinus: "0.00",
                    billBodyNumPlus: 0,
                    billBodyYbBalancePlus: "0.00",
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
            // state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
        }
        if (getInvSetByPeroid) {
            let stateNow =
                getInvSetByPeroid.isGenVoucher || getInvSetByPeroid.isCarryOverMainCost
                    ? true
                    : false
            // let stateNow=true
            // state = this.metaReducer.sf(state, 'data.limit.stateNow', stateNow)
            this.setState({
                limit: {
                    stateNow: stateNow,
                    isCarryOverMainCost: getInvSetByPeroid.isCarryOverMainCost,
                },
                checkOutType: getInvSetByPeroid.checkOutType,
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
    reload = async falg => {
        let page = {}
        if (falg) {
            page = { currentPage: falg.currentPage, pageSize: falg.pageSize }
        } else {
            // const form = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS() || {}
            const pagination = this.state.pagination || {}
            // page = { currentPage: form.current, pageSize: form.pageSize }
            page = { currentPage: pagination.current, pageSize: pagination.pageSize }
        }
        let name = this.metaAction.context.get("currentOrg").name
        const currentOrg = sessionStorage["stockPeriod" + name]
        this.period = currentOrg
        // if (this.metaAction.gf('data.inputVal')) {
        //     page.currentPage = 1
        // }
        if (this.state.inputVal) {
            page.currentPage = 1
        }
        const form = this.state.form
        let reqList = {
            serviceTypeCode: "CGRK",
            period: currentOrg,
            code: this.state.inputVal,
            supplierName: form.constom == "全部" ? "" : form.constom,
            startPeriod: form.strDate,
            endPeriod: form.endDate,
            type: form.type == null ? null : form.type,
            voucherIds: form.voucherIds == null ? null : form.voucherIds,
            invNo: form.invNo,
            page,
        }
        this.setState({ loading: true })
        const response = await this.webapi.operation.querylist(reqList)
        this.updateReload(response)
        this.setState({ loading: false })
    }
    updateReload = response => {
        if (response && response.list && response.list.length > 0) {
            let list = response.list[response.list.length - 1]
            response.list.pop()

            this.setState({
                listAll: {
                    // billBodyNum: formatNumbe(list.billBodyNum),
                    // billBodyYbBalance: formatNumbe(list.billBodyYbBalance, 2)
                    billBodyNum: formatSixDecimal(list.billBodyNum),
                    billBodyYbBalance: utils.number.format(list.billBodyYbBalance, 2),
                    billBodyNumMinus: formatSixDecimal(list.billBodyNumMinus),
                    billBodyYbBalanceMinus: utils.number.format(list.billBodyYbBalanceMinus, 2),
                    billBodyNumPlus: formatSixDecimal(list.billBodyNumPlus),
                    billBodyYbBalancePlus: utils.number.format(list.billBodyYbBalancePlus, 2),
                },
                list: response.list,
            })
        } else {
            this.setState({
                listAll: {
                    // billBodyNum: formatNumbe(0),
                    // billBodyYbBalance: formatNumbe(0, 2)
                    billBodyNum: 0,
                    billBodyYbBalance: "0.00",
                    billBodyNumMinus: 0,
                    billBodyYbBalanceMinus: "0.00",
                    billBodyNumPlus: 0,
                    billBodyYbBalancePlus: "0.00",
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
        } else {
            let page = {
                pageSize: 50,
                current: 1,
                total: 0,
            }
            this.setState({
                pagination: page,
            })
        }
    }
    // 确认是一般纳税人 还是小规模
    confirmType = () => {
        return this.metaAction.context.get("currentOrg").vatTaxpayer === 2000010001 ? true : false
    }

    componentWillUnmount = () => {
        this[`deny-purchase-generateVoucherClickFlag`] = null
    }
    habitSetting = async e => {
        if (this.habitSettingDoing) return false
        this.habitSettingDoing = true
        const ret = await this.metaAction.modal("show", {
            title: "凭证合并",
            style: { top: 5 },
            bodyStyle: { padding: "20px 30px" },
            width: 500,
            children: (
                <HabitSetting
                    module="purchase"
                    store={this.component.props.store}
                    metaAction={this.metaAction}
                    webapi={this.webapi}
                />
            ),
        })
        this.habitSettingDoing = false
    }
    // 生成凭证
    generateVoucher = async event => {
        event.stopPropagation && event.stopPropagation()
        event.nativeEvent.stopPropagation && event.nativeEvent.stopPropagation()
        let list = this.state.list.filter(o => o.selected)
        if (!list || list.length == 0) {
            this.metaAction.toast("error", "请选择需生成凭证单据")
            return false
        }
        list = list.filter(item => !item.voucherIds && !(item.type == 3 && !item.accountId)) //过滤贷方科目为空的情况
        if (list.length < 1) return this.metaAction.toast("error", "所选单据均已生成凭证")
        if (this.generateVoucherDoing) return false
        this.generateVoucherDoing = true
        // let { vatTaxpayer } = this.metaAction.context.get("currentOrg") || {}
        // vatTaxpayer === 2000010002 ? (vatTaxpayer = 2000010002) : (vatTaxpayer = 2000010001)
        if (this.vatTaxpayer === 2000010001) {
            let reqData = {
                module: 2, //1代表是销项，2代表进项
                acctCode: "22210101", //22210107代表销项的一般纳税人,22210199代表销项的小规模纳税人,22210101代表是进项
                vatTaxpayer: this.vatTaxpayer, // 小规模纳税人2000010002, 其他2000010001
            }
            let res = await this.webapi.operation.getDestAcctId({ ...reqData })
            if (res === null) {
                let confirm = await this.metaAction.modal("confirm", {
                    content: "税额科目未设置，请先进行设置，再生成凭证。",
                    iconType: "exclamation-circle",
                    okText: "现在设置",
                })
                if (confirm) {
                    let response = await this.setSubject()
                    if (response) {
                        this.createPz(list, response[0].destAcctId)
                    }
                }
            } else if (res && !res.error) {
                this.createPz(list, res)
            }
        } else {
            this.createPz(list, null)
        }
        this.generateVoucherDoing = false
    }
    // 最终生成凭证
    createPz = async (list, res) => {
        if (res) {
            list.forEach(item => {
                let newList = JSON.parse(item.billBodys)
                let taxRateT = 0
                newList.forEach(item => {
                    if (item.taxRate) taxRateT = item.taxRate + taxRateT
                })
                if (taxRateT === 0 || !taxRateT) {
                    item.hasTaxRate = false
                } else {
                    item.hasTaxRate = true
                }
            })
        }
        list = list.map(item => ({
            taxAmountSubject: item.hasTaxRate ? res : null,
            serviceTypeCode: "CGRK",
            period: this.period,
            id: item.id,
        }))

        let ret = await this.webapi.operation.createPz(list)
        if (ret) {
            this.metaAction.toast("success", ret)
            await this.reload()
        }
    }
    // 税务科目设置
    setSubject = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "税额科目设置",
            style: { top: 25 },
            width: 800,
            okText: "保存",
            bodyStyle: { padding: "20px 30px" },
            wrapClassName: "bovms-app-purchase-list-subject-setting",
            children: (
                <SubjectSetting
                    store={this.component.props.store}
                    metaAction={this.metaAction}
                    webapi={this.webapi}
                    yearPeriod={String(this.period).replace("-", "")}
                    module="stockCg"
                />
            ),
        })
        return ret
    }
    changeTypeSelect = value => {
        let select = this.typeSelectOption.find(item => item.typeName === value)
        // this.metaAction.sf("data.form.type", select.typeId)
        // this.metaAction.sf("data.form.typeName", select.typeName)
        this.setState({
            form: {
                ...this.state.form,
                type: select.typeId,
                typeName: select.typeName,
            },
        })
    }
    changeVoucherSelect = value => {
        let select = this.voucherIdsSelectOption.find(item => item.voucherName === value)
        // this.metaAction.sf("data.form.voucherIds", select.voucherIds)
        // this.metaAction.sf("data.form.voucherName", select.voucherName)
        this.setState({
            form: {
                ...this.state.form,
                voucherIds: select.voucherIds,
                voucherName: select.voucherName,
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
    disabledDate = current => {
        let startperiod = this.startPeriod
        return current < moment(startperiod)
    }
    renderSelectOption = data => {
        const arr = data.map(item => {
            return (
                <Option key={item.supplierId} value={item.supplierName} title={item.supplierName}>
                    {item.supplierName}
                    {/* {item.code&nbsp&nbsp&nbspitem.name&nbsp&nbsp&nbspitem.guige&nbsp&nbsp&nbspitem.unit} */}
                </Option>
            )
        })
        this.selectOption = arr
        this.selectOptionData = data
        // this.metaAction.sf('data.other.key', Math.floor(Math.random() * 10000))
    }
    renderTypeSelectOption = () => {
        let arr = [
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
        this.typeSelectOption = arr.slice()
        arr = arr.map(item => {
            return (
                <Option key={item.typeId} value={item.typeName} title={item.typeName}>
                    {item.typeName}
                </Option>
            )
        })
        return arr
    }
    renderVoucherIdsSelectOption = () => {
        let arr = [
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
        this.voucherIdsSelectOption = arr.slice()
        arr = arr.map(item => {
            return (
                <Option key={item.voucherIds} value={item.voucherName} title={item.voucherName}>
                    {item.voucherName}
                </Option>
            )
        })
        return arr
    }
    //过滤行业
    filterIndustry = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }
    getSelectOption = () => {
        return this.selectOption
    }
    pageChanged = (currentPage, pageSize) => {
        if (pageSize == null || pageSize == undefined) {
            // pageSize = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS().pageSize || 0
            pageSize = (this.state.pagination && this.state.pagination.pageSize) || 0
        }
        let page = { currentPage, pageSize }
        this.reload(page)
    }
    back = async () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
        this.component.props.onlyCloseContent("ttk-stock-app-purchase")
    }
    filterList = () => {
        // this.metaAction.sf('data.showPopoverCard', false)
        this.setState({
            showPopoverCard: false,
        })
        this.reload()
    }
    handlePopoverVisibleChange = visible => {
        // if (visible) {
        //     const { form } = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        //     this.metaAction.sf('data.form', fromJS(form))
        // }
        // this.metaAction.sf('data.showPopoverCard', visible)
        if (visible) {
            // const { form } = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
            const form = this.state.form
            // this.metaAction.sf('data.form', fromJS(form))
            this.setState({
                form,
            })
        }
        // this.metaAction.sf('data.showPopoverCard', visible)
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
            },
        })
    }
    addType = async () => {
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) modalWidth = 1920
        if (this.addTypeDoing) return false
        this.addTypeDoing = true
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
            children: this.metaAction.loadApp("purchase-ru-ku-add-alert", {
                store: this.component.props.store,
                formName: "采购入库单",
            }),
        })
        if (ret) {
            this.reload()
        }
        this.addTypeDoing = false
    }
    lock = (id, invNo, voucherIds, type) => e => {
        let personId = id ? id : null
        if (this.lookDtileDoing) {
            return
        }
        this.lookDtileDoing = true
        this.lookDtile(personId, invNo, voucherIds, type)
        this.lookDtileDoing = false
    }

    /**
     * @description: 编辑或查看单据
     * @param {number/string} id 单据id
     * @param {number/string} invNo 单据号(只有进项生成的单据才有这个字段)
     * @param {number/string} voucherIds 凭证id
     * @param {string} type —— 0：发票生成；1：手工新增；2：数据迁移；3：导入；4：老代账再次数据迁移；5:web迁移
     */
    lookDtile = async (id, invNo, voucherIds, type) => {
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) modalWidth = 1920
        const xdzOrgIsStop = this.state.xdzOrgIsStop
        let flag = xdzOrgIsStop || this.state.limit.stateNow, //已结转主营成本凭证  或者 已结账
            ret = ""
        const canEdit =
            !flag && ((type === 0 && invNo && voucherIds) || (type !== 0 && !voucherIds))
        if (xdzOrgIsStop || !canEdit) {
            // invNod——只有进销项生成的单据才有这个字段
            ret = await this.metaAction.modal("show", {
                title: "查看",
                style: { top: 25 },
                width: modalWidth,
                height: 520,
                bodyStyle: {
                    maxHeight: modalHeight - 47 - 44,
                    padding: "20px 30px",
                    overflow: "auto",
                },
                footer: null,
                children: this.metaAction.loadApp("app-purchase-look", {
                    store: this.component.props.store,
                    id: id,
                    serviceTypeCode: "CGRK",
                    flag: invNo ? false : flag,
                    type: type,
                    titleName: "采购入库单",
                    invNo: invNo,
                    unEditable: flag,
                    editType: "查看",
                    checkOutType: this.state.checkOutType,
                }),
            })
        } else {
            // const titleText = voucherIds ? "查看" : "编辑"
            ret = await this.metaAction.modal("show", {
                title: "编辑",
                style: { top: 20 },
                width: modalWidth,
                bodyStyle: {
                    maxHeight: modalHeight - 47 - 44,
                    padding: "20px 30px",
                    overflow: "auto",
                },
                height: 520,
                footer: null,
                children: this.metaAction.loadApp("purchase-ru-ku-add-alert", {
                    store: this.component.props.store,
                    formName: "采购入库单",
                    id: id,
                    type: type,
                    unEditable: flag, // 为check的时候代表查看状态
                    // voucherIds: voucherIds,
                    editType: "编辑",
                    checkOutType: this.state.checkOutType,
                }),
            })
        }
        if (ret) {
            this.reload()
        }
    }
    renderHelp = () => {
        let text = (
            <div style={{ padding: "5px 10px", lineHeight: "25px" }}>
                <div>可删除单据范围：</div>
                <div>1、发票生成的单据</div>
                <div>2、手工新增但未生成凭证的单据</div>
            </div>
        )
        return HelpIcon(text, "bottomRight")
    }
    moreActionOpeate = e => {
        this[e.key] && this[e.key]()
    }
    // 删除单据(多条)
    settlement = async () => {
        // let list = this.extendAction.gridAction.getSelectedInfo('dataGrid') //选中
        let list = this.state.list.filter(o => o.selected)
        if (list.length == 0) {
            this.metaAction.toast("error", "请先选择数据")
            return false
        }
        let check = list.some(item => !!item.voucherIds)
        if (check) return this.metaAction.toast("error", "已经生成凭证，不支持删除")
        list = list.map(item => ({
            invNo: item.invNo || "",
            voucherIds: item.voucherIds || "",
            serviceTypeCode: "CGRK",
            period: this.period,
            id: item.id,
            code: item.code,
            type: item.type,
        }))

        this.setState({ loading: true })
        const response = await this.webapi.operation.deleteBillAndPz(list)
        if (response) {
            this.metaAction.toast("success", response)
            this.reload()
        }
        this.setState({ loading: false })
        // }
    }
    // 删除凭证
    delectPz = async () => {
        let list = this.state.list.filter(o => o.selected)
        if (list.length == 0) {
            this.metaAction.toast("error", "请先选择数据")
            return false
        }
        const ret = list.some(s => s.type === 0)
            ? await this.metaAction.modal("confirm", {
                  title: "提示",
                  width: 400,
                  content: <div>删除生成的单据，删除凭证会同步删除对应的单据，请确认？</div>,
              })
            : true
        if (ret) {
            list = list
                .filter(item => !!item.voucherIds)
                .map(item => ({
                    invNo:
                        (item.type !== 2 && item.type !== 4 && item.type !== 5 && item.invNo) || "",
                    voucherIds: item.voucherIds,
                    serviceTypeCode: "CGRK",
                    period: this.period,
                    id: item.id,
                    type: item.type,
                }))
            this.setState({ loading: true })
            const response = await this.webapi.operation.deletePz(list)
            if (response) {
                this.metaAction.toast("success", response)
                this.reload()
            }
            this.setState({ loading: false })
        }
    }
    // 删除凭证
    delectOnly = item => async e => {
        const ret =
            item.type === 0
                ? await this.metaAction.modal("confirm", {
                      title: "提示",
                      width: 400,
                      content: <div>删除生成的单据，删除凭证会同步删除对应的单据，请确认？</div>,
                  })
                : true
        if (ret) {
            let list = []
            list.push({
                invNo: (item.type !== 2 && item.type !== 4 && item.type !== 5 && item.invNo) || "",
                voucherIds: item.voucherIds,
                serviceTypeCode: "CGRK",
                period: this.period,
                id: item.id,
                type: item.type,
            })
            this.setState({ loading: true })
            const response = await this.webapi.operation.deletePz(list)
            if (response) {
                this.metaAction.toast("success", response)
                this.reload()
            }
            this.setState({ loading: false })
        }
    }
    onSearch = data => {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(() => {
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

    selectAll = e => {
        let list = this.state.list.slice(0).map(item => ({ ...item, selected: e.target.checked }))
        this.setState({
            list,
        })
    }
    selectRow = rowIndex => e => {
        // this.injections.reduce('selectRow', rowIndex, e.target.checked)
        let list = this.state.list.slice(0)
        list[rowIndex].selected = e.target.checked
        this.setState({
            list,
        })
    }

    delClick = item => e => {
        // if (!this.metaAction.gf('data.limit.stateNow')) {
        if (!this.state.limit.stateNow && !item.voucherIds) {
            let serviceTypeCode = "CGRK"
            this.delect(serviceTypeCode, item)
        }
    }
    // 删除单据(单条)
    delect = async (serviceTypeCode, item) => {
        const confirm = await this.metaAction.modal("confirm", {
            content: `确定删除该单据?`,
            width: 340,
        })
        if (confirm) {
            let list = []
            list.push({
                invNo: item.invNo || "",
                voucherIds: item.voucherIds || "",
                serviceTypeCode,
                period: this.period,
                id: item.id,
                code: item.code,
                type: item.type,
            })
            this.setState({ loading: true })
            const response = await this.webapi.operation.deleteBillAndPz(list)
            if (response) {
                this.metaAction.toast("success", response)
                this.reload()
            }
            this.setState({ loading: false })
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
            style: { top: 5 },
            bodyStyle: { padding: "0px" },
            children: this.metaAction.loadApp("inv-app-new-invoices-card", {
                // 以下参数所有为必须项
                store: this.component.props.store,
                kjxh: 1, // 这个写死一个值为1
                fplx: "jxfp", // 'xxfp''jxfp'销项发票或者是进销发票 必传
                fpzlDm: record.invType, // 发票种类代码必传
                readOnly: true, // 必传true
                justShow: true, // 必传true
                invArguments,
            }),
        })
    }
    // 分页总页数
    pageShowTotal = () => {
        // const total = this.metaAction.gf('data.pagination')? this.metaAction.gf('data.pagination').toJS()['total'] : 0
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

    // 导入
    dataImport = () => {
        importModal({
            title: "采购入库单导入",
            tip: [
                "导出采购入库单模板",
                "根据要求补充模板数据",
                "导入补充后的采购入库单数据",
                "暂不支持在模板中新增系统外的存货档案和供应商档案",
            ],
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

        this.reload({ currentPage: 1, pageSize: this.state.pagination.pageSize })
        return true
    }

    // 导出
    exportData = async () => {
        this.setState({ loading: true })
        const { strDate, endDate, constom, type, voucherIds, invNo } = this.state.form
        const { inputVal } = this.state

        let newConstom
        if (constom) {
            newConstom = constom === "全部" ? "" : constom
        } else {
            newConstom = ""
        }
        const selected = this.selectOptionData.find(el => {
            return el.supplierName == newConstom
        })
        await this.webapi.operation.export({
            period: this.period, //会计期间
            customerCode: this.name, //企业名称
            startPeriod: strDate ? strDate : "", //入库日期起
            endPeriod: endDate ? endDate : "", //入库日期止
            code: inputVal ? inputVal : "", //流水号
            supplierName: newConstom, //往来单位名称
            supplierId: selected ? selected.supplierId : "",
            type: typeof type == "number" ? type : "", //单据来源：发票生成0、手工新增1
            voucherIds: typeof voucherIds == "number" ? voucherIds : "", //凭证类型：未生成0、已生成1
            invNo,
        })
        setTimeout(() => {
            this.setState({ loading: false })
        }, 1000)
    }

    dealData = () => {
        let list = this.state.list,
            res = []
        list.forEach((x, i) => {
            if (x.selected) {
                let temp = [],
                    data = JSON.parse(x.billBodys)
                data.forEach((y, j) => {
                    temp.push({
                        accountName: this.name,
                        amount: y.taxInclusiveAmount,
                        billCode: x.code,
                        billNname: "采购入库单",
                        creator: x.operater,
                        custName: x.supplierName,
                        indexNo: j + 1,
                        number: y.num,
                        remarks: "",
                        specification: y.inventoryGuiGe,
                        stockCode: y.inventoryCode,
                        stockName: y.inventoryName,
                        storageDate: x.cdate,
                        unit: y.inventoryUnit,
                        unitPrice: Number((y.taxInclusiveAmount / y.num).toFixed(6)),
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

    isFifoAndCheck = data => {
        return (
            this.state.checkOutType == 3 &&
            (data.titleStockOutStatus == 1 || data.titleStockOutStatus == 2)
        )
    }
    rowHeightGetter(index, row) {
        if (!row) {
            row = this.state.list[index]
        }
        const detailList = row && row.billBodys ? JSON.parse(row.billBodys) : []
        return 37 * ((detailList.length > 5 ? 6 : detailList.length) + 1)
    }
    renderMultiLine = (field, align, lookMore, footer, precision, notClearZero) => ps => {
        const list = this.state.list
        if (!list || (list && list.length < 1)) return null
        const row = list[ps.rowIndex]
        const detailList = row && row.billBodys ? JSON.parse(row.billBodys) : []
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
                    const _field =
                        field === "YbBalance" ? "taxInclusiveAmount" : field.toLowerCase()
                    const value =
                        _field === "price" ? item.taxInclusiveAmount / item.num : item[_field]
                    const text = precision
                        ? notClearZero
                            ? formatNumbe(value, precision)
                            : formatSixDecimal(formatNumbe(value, precision))
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
                <div align={align} className="stock-table-cell-multil-row" title={footerText}>
                    {footerText}
                </div>
            </React.Fragment>
        )
    }
    settingOverlay = () => {
        const { xdzOrgIsStop } = this.state
        return (
            <Menu onClick={this.moreActionOpeate}>
                {!xdzOrgIsStop && <Menu.Item key="habitSetting">凭证合并</Menu.Item>}
                {!xdzOrgIsStop && this.vatTaxpayer === 2000010001 && (
                    <Menu.Item key="setSubject">税额科目设置</Menu.Item>
                )}
            </Menu>
        )
    }
    /**
     * @description: 本页面渲染
     * @return: 返回本页面组件JSX
     */
    render = () => {
        const {
            loading,
            pagination,
            form,
            limit,
            showPopoverCard,
            list,
            listAll,
            defaultPickerValue,
            xdzOrgIsStop,
        } = this.state

        /* 合计数 */
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
                {!xdzOrgIsStop && (
                    <Menu.Item
                        name="settlement"
                        key="settlement"
                        className="app-asset-list-disposal"
                        disabled={limit.stateNow}>
                        <span name="settlementText">删除单据</span>
                    </Menu.Item>
                )}
                {!xdzOrgIsStop && (
                    <Menu.Item name="supplement" key="delectPz" className="app-asset-list-disposal">
                        删除凭证
                    </Menu.Item>
                )}
                <Menu.Item name="supplement" key="exportData" className="app-asset-list-disposal">
                    导出
                </Menu.Item>
                {!xdzOrgIsStop && (
                    <Menu.Item
                        name="import"
                        key="dataImport"
                        className="app-asset-list-import"
                        disabled={limit.isCarryOverMainCost}>
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
                            入库日期：
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
                            value={this.state.form.constom}
                            onSelect={e => {
                                this.setState({ form: { ...this.state.form, constom: e } })
                            }}
                            children={this.getSelectOption()}></Select>
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
                            // onSelect={(e) => {this.changeTypeSelect(e)}}
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
                            // onSelect={function(e){this.changeVoucherSelect(e)}}
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
        let columns = [
            <DataGrid.Column
                name="select"
                columnKey="select"
                className="purchase-datagrid"
                width={34}
                fixed={true}
                header={
                    <DataGrid.Cell name="header">
                        <Checkbox
                            name="chexkbox"
                            checked={this.isSelectAll()}
                            onChange={this.selectAll}></Checkbox>
                    </DataGrid.Cell>
                }
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    const rowIndex = ps.rowIndex
                    return (
                        <DataGrid.Cell
                            name="cell"
                            style={{
                                lineHeight: this.rowHeightGetter(null, list[rowIndex]) + "px",
                            }}>
                            <Checkbox
                                name="select"
                                onChange={this.selectRow(rowIndex)}
                                checked={list[rowIndex].selected}></Checkbox>
                        </DataGrid.Cell>
                    )
                }}
            />,
            <DataGrid.Column
                name="code"
                columnKey="code"
                width={120}
                flexGrow={1}
                fixed={true}
                header={<DataGrid.Cell name="header">单据编号</DataGrid.Cell>}
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    const { type, accountId, isBillBodyNumNull } = list[ps.rowIndex] || {}
                    const isTips = (type == 3 && !accountId) || isBillBodyNumNull
                    let cellTips = "",
                        fifoTips = ""
                    if (type == 3 && !accountId && isBillBodyNumNull) {
                        cellTips = "单据中往来单位/借方科目/贷方科目, 数量/单价为空！"
                    } else if (isBillBodyNumNull) {
                        cellTips = "数量为空，单价为空！"
                    } else if (type == 3 && !accountId) {
                        cellTips = "单据中往来单位/借方科目/贷方科目为空！"
                    }

                    if (this.isFifoAndCheck(list[ps.rowIndex])) {
                        fifoTips =
                            list[ps.rowIndex].titleStockOutStatus == 1
                                ? "全部参与出库成本核算"
                                : "部分参与出库成本核算"
                    }
                    const tipWidth = (fifoTips ? 25 : 0) + (isTips ? 20 : 0)
                    return (
                        <DataGrid.Cell
                            name="cell"
                            className="mk-datagrid-cellContent-left purchase-billCode-cell"
                            style={{
                                width: "100%",
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
                            {isTips && WarningTip(cellTips)}
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
                header={<DataGrid.Cell name="header">入库日期</DataGrid.Cell>}
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
                    const value = list[ps.rowIndex].supplierName
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
                name="num"
                columnKey="num"
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
                header={<DataGrid.Cell name="header">成本单价</DataGrid.Cell>}
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
                    return record.type === 0 ? (
                        <DataGrid.Cell
                            name="cell"
                            className="mk-datagrid-cellContent-left"
                            style={{
                                color: "#009fff",
                                cursor: "pointer",
                                lineHeight: this.rowHeightGetter(null, list[ps.rowIndex]) + "px",
                            }}
                            onClick={this.checkoutInvNo(record)}>
                            {record.invNo}
                        </DataGrid.Cell>
                    ) : (
                        <DataGrid.Cell
                            name="cell"
                            className="mk-datagrid-cellContent-left"
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
                align="center"
                header={<DataGrid.Cell name="header">来源</DataGrid.Cell>}
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    const record = list[ps.rowIndex]
                    return (
                        <DataGrid.Cell
                            name="cell"
                            align="center"
                            style={{
                                lineHeight: this.rowHeightGetter(null, list[ps.rowIndex]) + "px",
                            }}
                            title={sourceOfDocumentsObj[record.type]}>
                            {sourceOfDocumentsObj[record.type]}
                        </DataGrid.Cell>
                    )
                }}
            />,
            <DataGrid.Column
                name="voucherCodes"
                columnKey="voucherCodes"
                width={100}
                flexGrow={1}
                header={<DataGrid.Cell name="header">凭证号</DataGrid.Cell>}
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    return (
                        <DataGrid.Cell
                            name="cell"
                            className="mk-datagrid-cellContent-left titledelect"
                            style={{
                                color: "#009fff",
                                cursor: "pointer",
                                lineHeight: this.rowHeightGetter(null, list[ps.rowIndex]) + "px",
                            }}>
                            <span
                                name="title"
                                onClick={
                                    xdzOrgIsStop
                                        ? undefined
                                        : this.checkoutVoucher(list[ps.rowIndex].voucherIds)
                                }>
                                {list[ps.rowIndex].voucherCodes}
                            </span>
                            {!xdzOrgIsStop && list[ps.rowIndex].voucherCodes ? (
                                <Icon
                                    name="helpIcon"
                                    fontFamily="del-icon"
                                    type="close-circle"
                                    className="del-icon"
                                    onClick={this.delectOnly(list[ps.rowIndex])}></Icon>
                            ) : null}
                        </DataGrid.Cell>
                    )
                }}
            />,
            <DataGrid.Column
                name="operation"
                columnKey="operation"
                width={100}
                fixedRight={true}
                header={
                    <DataGrid.Cell name="header" fixed="right">
                        操作
                    </DataGrid.Cell>
                }
                cell={ps => {
                    const list = this.state.list
                    if (!list || (list && list.length < 1)) return null
                    return (
                        <DataGrid.Cell
                            name="cell"
                            className="mk-datagrid-cellContent-left"
                            style={{
                                display: "flex",
                                lineHeight: this.rowHeightGetter(null, list[ps.rowIndex]) + "px",
                            }}>
                            <span
                                className={
                                    limit.stateNow || list[ps.rowIndex].voucherIds
                                        ? "spanNoselect"
                                        : "spanselect"
                                }
                                name="remove"
                                style={{
                                    fontSize: 14,
                                    cursor: "pointer",
                                    paddingRight: "5px",
                                }}
                                onClick={this.delClick(list[ps.rowIndex])}>
                                删除
                            </span>
                        </DataGrid.Cell>
                    )
                }}
            />,
        ]
        if (xdzOrgIsStop) {
            columns = columns.filter(f => f.props.columnKey !== "operation")
        }
        return (
            <React.Fragment>
                <Layout className="app-purchase-backgroundColor" name="root-content">
                    {loading ? <div className="ttk-stock-app-spin">{stockLoading()}</div> : null}
                    <div className="ttk-stock-app-header" name="header">
                        <div className="header-left">
                            <div className="back" name="back" onClick={this.back}></div>
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
                                />
                                {
                                    <Popover
                                        name="popover"
                                        title=""
                                        popupClassName="inv-batch-sale-list-popover"
                                        placement="bottom"
                                        trigger="click"
                                        visible={showPopoverCard}
                                        onVisibleChange={this.handlePopoverVisibleChange}
                                        content={popoverContent}>
                                        <span className="filter-btn header-item" name="filterSpan">
                                            <Icon name="filter" type="filter"></Icon>
                                        </span>
                                    </Popover>
                                }
                            </div>
                        </div>
                        <div className="header-right">
                            {!xdzOrgIsStop && (
                                <React.Fragment>
                                    <Button.Group className="btn-item">
                                        <Button type="primary" onClick={this.generateVoucher}>
                                            生成凭证
                                        </Button>
                                        <Dropdown
                                            name="setting"
                                            trigger={["click"]}
                                            overlay={this.settingOverlay()}>
                                            <Button
                                                type="primary"
                                                icon="setting"
                                                style={{ marginLeft: "1px" }}></Button>
                                        </Dropdown>
                                    </Button.Group>
                                    <Button
                                        className="btn-item"
                                        type="primary"
                                        name="query1"
                                        disabled={limit.stateNow}
                                        onClick={this.addType}>
                                        新增
                                    </Button>
                                </React.Fragment>
                            )}
                            <PrintButton
                                className="print-btn"
                                params={{ codeType: "CGRK" }}
                                dealData={this.dealData}
                            />
                            <Dropdown name="batch3" trigger={["click"]} overlay={moreMenu}>
                                <Button
                                    className="app-asset-list-header-more btn-item"
                                    name="internal">
                                    <span name="word">更多</span>
                                    <Icon name="more" type="down"></Icon>
                                </Button>
                            </Dropdown>
                        </div>
                    </div>
                    <Layout className="app-purchase-content" name="content">
                        <DataGrid
                            ellipsis={true}
                            headerHeight={37}
                            name="dataGrid"
                            rowHeight={37}
                            rowsCount={list.length}
                            columns={columns}
                            rowHeightGetter={::this.rowHeightGetter}
                            allowResizeColumn
                            // loading={other.loading}
                            // isColumnResizing={false}
                        ></DataGrid>
                    </Layout>
                </Layout>
                <div className="bovms-app-purchase-list-footer">
                    <div style={{ fontSize: "14px" }}>
                        <span style={{ paddingRight: "14px" }}>合计</span>
                        <span>数量: </span>
                        <span style={{ paddingRight: "16px" }}>{numPlus}</span>
                        <span style={{ paddingRight: "25px" }}>{numMinus}</span>
                        <span>金额: </span>
                        <span style={{ paddingRight: "16px" }}>{ybBalancePlus}</span>
                        <span>{ybBalanceMinus}</span>
                    </div>
                    <Pagination
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
}

export default StockAppPurchase
