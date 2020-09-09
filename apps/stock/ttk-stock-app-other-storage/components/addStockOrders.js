import React from "react"
import { Button, DataGrid, Select, Layout } from "edf-component"
import moment from "moment"
import renderDataGridCol from "../../../bovms/components/column/index"
import { generatorRandomNum } from "../../../bovms/utils/index"
import { moment as momentUtil } from "edf-utils"
import { Spin, Form, Input, DatePicker, Row, Col } from "antd"
import EditableCell from "./editableCell"
import SelectSubject from "./selectSubject"
import isEquall from "lodash.isequal"
import { formatNumbe, formatnum, formatprice } from "../utils"
import {
    billDisabledDate,
    getVoucherDateZGRK,
    formatSixDecimal,
} from "../../commonAssets/js/common"

const Cell = DataGrid.Cell
const formItemLayout = {
    labelCol: {
        xs: { span: 3 },
    },
    wrapperCol: {
        xs: { span: 16 },
    },
}

const blankDetail = () => ({
    key: generatorRandomNum(),
    inventoryId: null, //存货id
    inventoryName: null,
    num: 0, //数量
    price: 0, //单价
    ybbalance: 0, //金额
})

/**
 * 选择科目
 * id：(必传) 单据id
 * type:(必传) 入库还是出库
 * inveBusiness:(必传) 1代表工业,0代表商业(必须)
 */

class AddStockOrders extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            title: "其他出库单",
            serviceOptions: [],
            main: {
                serviceTypeId: "", //业务类型id
                accountId: "", //科目id
                code: "", //单据编码
                cdate: moment(new Date()).format("YYYY-MM-DD"), //会计月份 解决IE问题
                type: 1, //新增类型，1代表是手工新增,默认给1
                assistCiName: "",
                operater: sessionStorage.getItem("username"), //操作者，给当前登录手机号码
                billBodyDtoList: [
                    blankDetail(),
                    blankDetail(),
                    blankDetail(),
                    blankDetail(),
                    blankDetail(),
                    blankDetail(),
                    blankDetail(),
                ],
            },
            opstionList: [],
            serviceTypeCode: "",
            serviceTypeName: "",
            //用于科目回显
            subjectObject: {
                acctId: "",
                acctCode: "",
                acctName: "",
                assistCiName: "",
            },
            orderType: "",
            formError: false,
            detailsError: false,
        }
        this.cacheData = []
        this.id = props.id
        this.webapi = props.webapi
        this.metaAction = props.metaAction || {}
        this.store = props.store
        this.dataGridKey = `datagrid-${new Date().valueOf()}`
        this.name = this.metaAction.context.get("currentOrg").name
        this.period = sessionStorage["stockPeriod" + this.name]
    }
    onCancel = async () => {
        let cacheData = this.cacheData
        //删除掉key和editable 前端生成的字段 再对比
        let list = this.state.main.billBodyDtoList
            .filter(f => f.inventoryId)
            .map(e => {
                return {
                    inventoryId: e.inventoryId, //存货id
                    inventoryName: e.inventoryName,
                    num: e.num, //数量
                    price: e.price, //单价
                    ybbalance: e.ybbalance,
                }
            })
        //是否存在有效行
        if (list.length) {
            cacheData = cacheData.map(e => ({
                inventoryId: e.inventoryId, //存货id
                inventoryName: e.inventoryName,
                num: e.num, //数量
                price: e.price, //单价
                ybbalance: e.ybbalance,
            }))
            if (this.id && !isEquall(cacheData, list)) {
                const res = await this.metaAction.modal("confirm", {
                    className: "haveData",
                    content: `当前界面有数据，请确认是否先进行保存`,
                })
                if (res) return false
            }
            this.props.closeModal && this.props.closeModal()
        } else {
            this.props.closeModal && this.props.closeModal()
        }
    }
    checkForm = main => {
        const { accountId, serviceTypeId } = main
        let formError = false
        if (!accountId || !serviceTypeId) {
            formError = true
            this.metaAction.toast("error", "红框内填入正确值")
        }
        this.setState({ formError })
        return !formError
    }
    checkDetails = (details, type, invoiceTypeName, serviceTypeName) => {
        //如果没有编辑记录
        let errorMsg = ""
        if (details.length === 0) {
            errorMsg = "存货名称不能为空"
        } else {
            //判断必填项是否已填
            for (let i = 0; i < details.length; i++) {
                if (!details[i].inventoryId) {
                    errorMsg = "存货名称不能为空"
                    break
                }

                if (type === "QTRK" || invoiceTypeName === "QTRK") {
                    if (!details[i].num || !details[i].price || !details[i].ybbalance) {
                        errorMsg = "红框内填入正确值"
                        break
                    }
                } else {
                    if (serviceTypeName != "成本调整") {
                        if (!details[i].num || !details[i].price || !details[i].ybbalance) {
                            errorMsg = "红框内填入正确值"
                            break
                        }
                    } else {
                        if (!details[i].ybbalance) {
                            errorMsg = "红框内填入正确值"
                            break
                        }
                    }
                }
            }
        }
        errorMsg && this.metaAction.toast("error", errorMsg)
        this.setState({ detailsError: errorMsg ? true : false })
        return errorMsg ? false : true
    }
    async onSave(actionType) {
        let { main, serviceTypeName } = this.state
        let { type } = this.props
        main = JSON.parse(JSON.stringify(main))

        if (!this.checkForm(main)) return false
        let details = main.billBodyDtoList.filter(f => f.inventoryCode)
        // 过滤details的空数据
        const detailsError = this.checkDetails(details, type, main.invoiceTypeName, serviceTypeName)
        if (!detailsError) return false
        main.billBodyDtoList = details

        this.setState({ loading: true })
        let res = await this.webapi.api.saveOrUpdateOtherBillTitle(main)
        this.setState({ loading: false })
        if (res === null) {
            if (actionType === "saveAndNew") {
                if (this.id) this.id = ""
                this.props.form.resetFields()
                let main = {
                    serviceTypeId: "", //业务类型id
                    accountId: "", //科目id
                    code: "", //单据编码
                    cdate: undefined, //会计月份
                    type: 1, //新增类型，1代表是手工新增,默认给1
                    assistCiName: "",
                    operater: sessionStorage.getItem("username"), //操作者，给当前登录手机号码
                    billBodyDtoList: [
                        blankDetail(),
                        blankDetail(),
                        blankDetail(),
                        blankDetail(),
                        blankDetail(),
                        blankDetail(),
                        blankDetail(),
                    ],
                }
                this.setState(
                    {
                        main,
                    },
                    () => {
                        this.initPage()
                    }
                )

                this.metaAction.toast("success", "保存并新增成功")
            } else {
                this.metaAction.toast("success", "保存成功")
                this.props.closeModal(res)
            }
        }
    }

    componentDidMount() {
        if (this.props.isAutoAdjust) {
            // 智能跳整--获取收发存汇总表
            this.initAutoAdjustPage()
        } else {
            this.initPage()
        }
    }

    // 智能调整---开始
    async initAutoAdjustPage() {
        const { type, inveBusiness, serviceTypeId } = this.props
        const { main, subjectObject } = this.state
        this.setState({ loading: true })

        // 获取收发存汇总的期末数据
        const { id = "", vatTaxpayer = "2000010002" } =
            this.metaAction.context.get("currentOrg") || {}
        let resp =
            (await this.webapi.api.querySfcList({
                orgId: id || "", //--企业id，必填
                natureOfTaxpayers: vatTaxpayer || "", //--纳税人性质，必填
                inventoryClassId: "", //--存货类型id
                period: this.period, //--会计期间，必填
                endPeriod: this.period,
                isVoucher: true, //写死的
                isExist: false,
                bInveControl: false,
            })) || {}
        let mainList = resp.carryMainCostSheetDtoList || [],
            temp = []
        mainList.forEach(el => {
            if (!el.qmNum && el.qmBalance) {
                temp.push({
                    inventoryCode: el.inventoryCode,
                    inventoryId: el.inventoryId,
                    inventoryName: el.inventoryName,
                    inventoryGuiGe: el.inventoryGuiGe,
                    inventoryUnit: el.inventoryUnit,
                    num: el.qmNum,
                    price: el.qmPrice,
                    ybbalance: el.qmBalance,
                })
            }
        })
        if (temp.length) {
            while (temp.length < 7) {
                temp.push(blankDetail())
            }
            main.billBodyDtoList = temp
        } else {
            this.metaAction.toast("error", "没有需要成本调整的存货")
        }
        //获取对应业务类型的科目
        let subject =
            (await this.webapi.api.getOtherServiceTypeAcctCode({
                serviceTypeId: serviceTypeId,
                inveBusiness,
            })) || {}

        // main.accountId = subject.acctId
        // main.assistCiName = subject.assistCiName
        main.serviceTypeId = subject.serviceTypeId
        this.props.form.resetFields(["accountId"])
        main.accountId = subjectObject.acctId =
            subject && subject.acctId ? subject.acctId : undefined
        main.assistCiName = subjectObject.assistCiName =
            subject && subject.assistCiName ? subject.assistCiName : undefined
        subjectObject.acctCode = subject && subject.acctCode ? subject.acctCode : undefined
        subjectObject.acctName = subject && subject.acctName ? subject.acctName : undefined

        // 编码
        let code = await this.webapi.api.getOtherBillTitleCode({
            code: type,
            period: this.period,
        })
        main.code = code

        //获取服务器时间
        const getServerDate = await this.webapi.api.getServerDate()
        let data = momentUtil.stringToMoment(getServerDate).format("YYYY-MM")
        //对比当前会计期间， 如果服务器时间等于会计期间就用当前时间，反之用服务器月份的最后一天
        if (data == this.period) {
            main.cdate = momentUtil.stringToMoment(getServerDate).format("YYYY-MM-DD")
        } else {
            let year = this.period.split("-")
            let data = Number(year[1]) + 1
            let lastData = moment(
                year[0] + "-" + `${data >= 10 ? data : `0${data}`}` + "-" + "01"
            ).valueOf()
            if (data > 12) {
                data = "01"
                lastData = moment(Number(year[0]) + 1 + "-" + data + "-" + "01").valueOf()
            }
            main.cdate = moment(lastData - 24 * 60 * 60).format("YYYY-MM-DD")
        }

        this.setState({
            main,
            title: "成本调整单",
            loading: false,
            serviceTypeName: subject.serviceTypeName,
            serviceTypeCode: subject.serviceTypeCode,
            autoAdjustBtnFlag: !!temp.length,
        })
    }
    // 智能调整---结束

    async initPage() {
        const { type, inveBusiness } = this.props
        const { main } = this.state
        this.setState({ loading: true })

        //获取存货列表
        let opstionList = await this.webapi.api.findInventoryList({})

        //有ID说明是编辑或查看
        if (this.id) {
            //获取单个单据信息
            this.setState({ loading: true })
            let main = await this.webapi.api.queryOtherBillById({ id: this.id })
            let invoiceType = type === "QTCK" || main.invoiceTypeName === "QTCK" ? 1 : 2
            let serviceOptions = await this.webapi.api.getOtherBillServiceType({
                inveBusiness,
                serviceTypeId: 1000,
                invoiceType,
            })
            let serviceTypeName = main.serviceTypeName
            this.cacheData = JSON.parse(JSON.stringify(main.billBodyDtoList))
            let subjectObject = {
                acctId: main.accountId,
                acctCode: main.accountCode,
                acctName: main.accountName,
                assistCiName: main.assistCiName,
            }

            let selectname = []
            main.billBodyDtoList.forEach(item => {
                selectname.push(item.inventoryId)
            })
            sessionStorage["inventoryNameList"] = selectname
            //不足空行
            if (main.billBodyDtoList) {
                while (main.billBodyDtoList.length < 7) {
                    main.billBodyDtoList.push(blankDetail())
                }
            }
            this.setState({
                main,
                loading: false,
                serviceOptions,
                subjectObject,
                opstionList,
                title: `${serviceTypeName}单`,
                serviceTypeName,
                serviceTypeCode: main.serviceTypeCode,
                loading: false,
            })
        } else {
            //获取服务器时间
            let serviceOptions = await this.webapi.api.getOtherBillServiceType({
                inveBusiness,
                serviceTypeId: 1000,
                invoiceType: type === "QTCK" ? 1 : 2,
            })
            let title = type === "QTCK" ? "其他出库单" : "其他入库单"
            const getServerDate = await this.webapi.api.getServerDate()
            let data = momentUtil.stringToMoment(getServerDate).format("YYYY-MM")
            //对比当前会计期间， 如果服务器时间等于会计期间就用当前时间，反之用服务器月份的最后一天
            if (type !== "QTCK") {
                //  const currentMonth = sessionStorage['stockPeriod' + name]
                const cDate = getVoucherDateZGRK(this.period)
                main.cdate = cDate
            } else {
                if (data == this.period) {
                    main.cdate = momentUtil.stringToMoment(getServerDate).format("YYYY-MM-DD")
                } else {
                    let year = this.period.split("-")
                    let data = Number(year[1]) + 1
                    let lastData = moment(
                        year[0] + "-" + `${data >= 10 ? data : `0${data}`}` + "-" + "01"
                    ).valueOf()
                    if (data > 12) {
                        data = "01"
                        lastData = moment(Number(year[0]) + 1 + "-" + data + "-" + "01").valueOf()
                    }
                    main.cdate = moment(lastData - 24 * 60 * 60).format("YYYY-MM-DD")
                }
            }

            sessionStorage["inventoryNameList"] = []

            this.setState({
                serviceOptions,
                main,
                opstionList,
                title,
                loading: false,
            })
        }
    }
    async handleServiceChange(e) {
        let { serviceOptions, main, subjectObject, serviceTypeCode, serviceTypeName } = this.state
        let { type, inveBusiness } = this.props

        let item = serviceOptions.find(f => f.id === e)
        //是否自定义,0代表不自定义，1代表自定义
        serviceTypeCode = item.statementState ? "other" : item.code
        let title = `${item.name}单`
        main.serviceTypeId = item.id

        //如果是新增才需要调用 获取编号
        if (!this.id) {
            let code = await this.webapi.api.getOtherBillTitleCode({
                code: type || main.invoiceTypeName,
                period: this.period,
            })
            if (code) {
                main.code = code
            }
        }
        //获取对应业务类型的科目
        let subject = await this.webapi.api.getOtherServiceTypeAcctCode({
            serviceTypeId: item.id,
            inveBusiness,
        })

        this.props.form.resetFields(["accountId"])
        main.accountId = subjectObject.acctId =
            subject && subject.acctId ? subject.acctId : undefined
        main.assistCiName = subjectObject.assistCiName =
            subject && subject.assistCiName ? subject.assistCiName : undefined
        subjectObject.acctCode = subject && subject.acctCode ? subject.acctCode : undefined
        subjectObject.acctName = subject && subject.acctName ? subject.acctName : undefined

        this.setState({
            title,
            main,
            serviceTypeName: item.name,
            serviceTypeCode,
        })
    }
    isObject(val) {
        return Object.prototype.toString.call(val) === "[object Object]"
    }
    handleSubjectChange(value) {
        const { main, subjectObject } = this.state
        const isObject = this.isObject(value)
        const json =
            isObject && value.assistList ? JSON.stringify({ assistList: value.assistList }) : ""
        main.accountId = isObject ? value.id : undefined
        subjectObject.acctId = isObject ? value.id : undefined
        main.assistCiName = isObject ? json : undefined
        subjectObject.assistCiName = isObject ? json : undefined
        subjectObject.acctCode = isObject ? value.code : undefined
        subjectObject.acctName = isObject ? value.gradeName : undefined
        this.setState({
            subjectObject,
            main,
        })
    }
    handleDateChange(e) {
        let { main } = this.state
        main.cdate = moment(e).subtract(0, "day").format("YYYY-MM-DD")
        this.setState({
            main,
        })
    }
    onCellChange(row, rowIndex) {
        const { main } = this.state
        const { checkOutType, type } = this.props
        const tableSource = main.billBodyDtoList
        const rowItem = tableSource[rowIndex]
        tableSource.splice(rowIndex, 1, { ...rowItem, ...row })
        main.billBodyDtoList = tableSource
        this.setState(
            {
                main,
            },
            () => {
                let selectname = []
                main.billBodyDtoList.forEach(e => {
                    if (e.inventoryId) {
                        selectname.push(e.inventoryId)
                    }
                })
                sessionStorage["inventoryNameList"] = selectname

                //如果用户输入数量大于出库数量，清空输入框
                if (
                    (type === "QTCK" || main.invoiceTypeName === "QTCK") &&
                    checkOutType === 3 &&
                    row.num > row.stockNum
                ) {
                    row["num"] = undefined
                    this.props.metaAction.toast("error", "数量不能大于待出库数量")
                    this.onCellChange(row, rowIndex)
                }
            }
        )
    }
    sumColumn(type) {
        let { main } = this.state
        let count = 0
        main.billBodyDtoList.forEach(e => {
            if (e[type]) {
                count += e[type]
                // count = this.operation(count, e[type], 'add')
            }
        })
        if (type === "ybbalance") {
            // console.log('count', count)
            return formatNumbe(count, 2)
        }
        if (type === "num") {
            return formatSixDecimal(formatnum(count))
        }
    }
    isInteger(obj) {
        return Math.floor(obj) === obj
    }

    /*
     * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
     * @param floatNum {number} 小数
     * @return {object}
     *   {times:100, num: 314}
     */
    toInteger(floatNum) {
        let ret = { times: 1, num: 0 }
        if (this.isInteger(floatNum)) {
            ret.num = floatNum
            return ret
        }
        let strfi = floatNum + ""
        let dotPos = strfi.indexOf(".")
        let len = strfi.substr(dotPos + 1).length
        let times = Math.pow(10, len)
        let intNum = parseInt(floatNum * times + 0.5, 10)
        ret.times = times
        ret.num = intNum
        return ret
    }
    operation(a, b, op) {
        let o1 = this.toInteger(a)
        let o2 = this.toInteger(b)
        let n1 = o1.num
        let n2 = o2.num
        let t1 = o1.times
        let t2 = o2.times
        let max = t1 > t2 ? t1 : t2
        let result = null
        switch (op) {
            case "add":
                if (t1 === t2) {
                    // 两个小数位数相同
                    result = n1 + n2
                } else if (t1 > t2) {
                    // o1 小数位 大于 o2
                    result = n1 + n2 * (t1 / t2)
                } else {
                    // o1 小数位 小于 o2
                    result = n1 * (t2 / t1) + n2
                }
                return result / max
        }
    }
    async handleSelectMore(index) {
        const { checkOutType } = this.props
        //先进先出不可重复选择
        const canRepeat = checkOutType === 3 ? false : true
        const ret = await this.metaAction.modal("show", {
            title: "存货名称选择",
            width: 950,
            height: 520,
            style: { top: 50 },
            bodyStyle: { padding: "20px 30px" },
            children: this.metaAction.loadApp("ttk-stock-app-inventory-intelligence", {
                store: this.store,
                canRepeat,
            }),
        })
        if (ret) {
            const { serviceTypeName, main } = this.state
            const { type, checkOutType } = this.props
            let costs
            //不是成本调整 带出单价
            // console.log('serviceTypeName', serviceTypeName)
            // console.log('type', type)
            // console.log('main.invoiceTypeName', main.invoiceTypeName)
            if (
                (type === "QTCK" || main.invoiceTypeName === "QTCK") &&
                serviceTypeName != "成本调整"
            ) {
                let ids = ret.map(e => e.inventoryId)
                if (checkOutType === 0 || checkOutType === 2) {
                    costs = await this.webapi.api.getRealTimeInventoryAndUnitCost({
                        period: this.period,
                        ids,
                    })
                } else if (checkOutType === 1) {
                    costs = await this.webapi.api.getSaleMobileCostNum({ period: this.period, ids })
                } else if (checkOutType === 3) {
                    let stockOutList = ids.map(e => ({ inventoryId: e }))
                    let numRes = await this.webapi.api.queryPendingStockOutNum({
                        period: this.period,
                        stockOutList,
                    })
                    costs = numRes.stockOutList
                    costs.forEach(e => {
                        e.num = e.pendingStockOutNum
                    })
                }
            }
            ret.forEach(e => {
                e.key = generatorRandomNum()
                if (
                    (type === "QTCK" || main.invoiceTypeName === "QTCK") &&
                    serviceTypeName != "成本调整"
                ) {
                    let cItem = costs.find(f => f.inventoryId === e.inventoryId)
                    if (cItem) {
                        e.placeholder = `库存${cItem.num ? cItem.num : "0"}`
                        e.stockNum = cItem.num
                        if (checkOutType === 0) {
                            e.price = cItem.unitCost
                        } else if (checkOutType === 1) {
                            e.price = cItem.price
                        }
                    }
                }
            })

            let tableSource = main.billBodyDtoList
            let listdata = []

            //保存选择得存货到本地存储
            let selectname = sessionStorage["inventoryNameList"]
            ret.forEach(e => {
                selectname += `,${e.inventoryId}`
            })
            sessionStorage.setItem("inventoryNameList", selectname)

            if (ret.length == 1) {
                let flag
                let haveFirst = index > 0 ? true : false
                if (haveFirst) flag = main.billBodyDtoList[index - 1].inventoryCode
                if (!flag) {
                    listdata = main.billBodyDtoList.filter(f => f.inventoryCode)
                    main.billBodyDtoList = listdata.concat(ret)

                    while (main.billBodyDtoList.length < 7) {
                        main.billBodyDtoList.push(blankDetail())
                    }
                    this.setState({
                        main,
                    })
                    return
                }

                main.billBodyDtoList[index] = ret[0]
                this.setState({
                    main,
                })
                return
            } else {
                listdata = main.billBodyDtoList.filter(f => f.inventoryCode)
                main.billBodyDtoList = listdata.concat(ret)
                while (main.billBodyDtoList.length < 7) {
                    main.billBodyDtoList.push(blankDetail())
                }
                this.setState({
                    main,
                })
            }
        }
    }
    getColumns() {
        let { main, opstionList, serviceTypeName, detailsError } = this.state,
            dataSource = main.billBodyDtoList,
            colOption = {
                dataSource,
                width: 65,
                fixed: false,
                align: "center",
                className: "",
                flexGrow: 1,
                lineHeight: 35,
                isResizable: true,
                noShowDetailList: false,
            }
        let { isReadOnly, type, isPZ, checkOutType, id } = this.props
        const colClass =
            type === "QTRK" || main.invoiceTypeName === "QTRK"
                ? "ant-form-item-required"
                : serviceTypeName != "成本调整"
                ? "ant-form-item-required"
                : ""

        let columns = [
            {
                width: 75,
                flexGrow: 1,
                title: "存货编号",
                dataIndex: "inventoryCode",
                key: "inventoryCode",
            },
            {
                width: 180,
                flexGrow: 1,
                title: (
                    <Cell className={isReadOnly || isPZ ? "" : "ant-form-item-required"}>
                        存货名称
                    </Cell>
                ),
                dataIndex: "inventoryId",
                key: "inventoryId",
                textAlign: "left",
                render: (text, record, index) => {
                    return isReadOnly ||
                        isPZ ||
                        ((type === "QTCK" || main.invoiceTypeName === "QTCK") &&
                            checkOutType === 3 &&
                            id) ? (
                        <div className="static-editable-cell">{`${
                            record.inventoryName || ""
                        }`}</div>
                    ) : (
                        <EditableCell
                            key={`editableCell-inventoryId-${record.key}`}
                            value={text || undefined}
                            opstionList={opstionList}
                            index={index}
                            record={record}
                            dataIndex="inventoryId"
                            handleSave={row => this.onCellChange(row, index)}
                            webapi={this.webapi}
                            metaAction={this.metaAction}
                            store={this.store}
                            period={this.period}
                            serviceTypeName={serviceTypeName}
                            addStockName={this.addStockName}
                            checkOutType={checkOutType}
                            type={type || main.invoiceTypeName}
                            selectMore={() => this.handleSelectMore(index)}></EditableCell>
                    )
                },
            },
            {
                width: 65,
                flexGrow: 1,
                title: "规格型号",
                dataIndex: "inventoryGuiGe",
                key: "inventoryGuiGe",
                textAlign: "left",
                render: text => <div className="static-editable-cell">{text}</div>,
            },
            {
                title: "单位",
                width: 65,
                flexGrow: 1,
                dataIndex: "inventoryUnit",
                key: "inventoryUnit",
                textAlign: "left",
                render: text => <div className="static-editable-cell">{text}</div>,
            },
            {
                title: <Cell className={colClass}>数量</Cell>,
                dataIndex: "num",
                key: "num",
                width: 65,
                flexGrow: 1,
                textAlign: "left",
                render: (text, record, index) => {
                    return isReadOnly ||
                        isPZ ||
                        (checkOutType === 3 &&
                            (type === "QTCK" || main.invoiceTypeName === "QTCK") &&
                            id) ? (
                        <div className="static-editable-cell text-left">
                            {text ? formatSixDecimal(formatnum(text)) : ""}
                        </div>
                    ) : (
                        <EditableCell
                            key={`editableCell-num-${record.key}`}
                            className={
                                colClass && detailsError && record.inventoryCode && !text
                                    ? "-sales-error"
                                    : ""
                            }
                            value={text}
                            record={record}
                            dataIndex="num"
                            handleSave={row => this.onCellChange(row, index)}
                            webapi={this.webapi}
                            metaAction={this.metaAction}
                            store={this.store}
                            period={this.period}
                            checkOutType={checkOutType}
                            type={type || main.invoiceTypeName}
                            serviceTypeName={serviceTypeName}></EditableCell>
                    )
                },
                footer: () => {
                    return (
                        <DataGrid.Cell
                            className="mk-datagrid-cellContent-left"
                            title={this.sumColumn("num")}>
                            {this.sumColumn("num")}
                        </DataGrid.Cell>
                    )
                },
            },
            {
                title: <Cell className={colClass}>单价</Cell>,
                dataIndex: "price",
                width: 65,
                flexGrow: 1,
                key: "price",
                textAlign: "left",
                render: (text, record, index) => {
                    //如果是先进先出并且是其他出库,,用户不能自定义单价，金额
                    return isReadOnly ||
                        isPZ ||
                        ((type === "QTCK" || main.invoiceTypeName === "QTCK") &&
                            checkOutType === 3) ? (
                        <div className="static-editable-cell text-right">
                            {text ? formatSixDecimal(formatnum(text)) : ""}
                        </div>
                    ) : (
                        <EditableCell
                            key={`editableCell-price-${record.key}`}
                            className={
                                colClass && detailsError && record.inventoryCode && !text
                                    ? "-sales-error"
                                    : ""
                            }
                            value={text}
                            record={record}
                            dataIndex="price"
                            handleSave={row => this.onCellChange(row, index)}
                            webapi={this.webapi}
                            metaAction={this.metaAction}
                            store={this.store}></EditableCell>
                    )
                },
            },
            {
                title: (
                    <Cell className={isReadOnly || isPZ ? "" : "ant-form-item-required"}>金额</Cell>
                ),
                dataIndex: "ybbalance",
                key: "ybbalance",
                width: 65,
                flexGrow: 1,
                textAlign: "left",
                render: (text, record, index) => {
                    //成本核算为先进先出，类型为出库，不能修改金额
                    //如果业务类型为成本调整，数量不等于0，可修改金额；数量等于0，不可修改金额
                    if (
                        (type === "QTCK" || main.invoiceTypeName === "QTCK") &&
                        checkOutType === 3
                    ) {
                        //如果是新增并且业务类型为成本调整
                        if (serviceTypeName === "成本调整" && !id) {
                            return isReadOnly || isPZ || record.num ? (
                                <div className="static-editable-cell text-right">
                                    {text ? formatNumbe(text, 2) : ""}
                                </div>
                            ) : (
                                <EditableCell
                                    key={`editableCell-ybbalance-${record.key}`}
                                    className={
                                        detailsError && record.inventoryCode && !text
                                            ? "-sales-error"
                                            : ""
                                    }
                                    value={text}
                                    record={record}
                                    dataIndex="ybbalance"
                                    handleSave={row => this.onCellChange(row, index)}
                                    webapi={this.webapi}
                                    metaAction={this.metaAction}
                                    store={this.store}></EditableCell>
                            )
                        } else {
                            return (
                                <div className="static-editable-cell text-right">
                                    {text ? formatNumbe(text, 2) : ""}
                                </div>
                            )
                        }
                    } else {
                        return isReadOnly || isPZ ? (
                            <div className="static-editable-cell text-right">
                                {text ? formatNumbe(text, 2) : ""}
                            </div>
                        ) : (
                            <EditableCell
                                key={`editableCell-ybbalance-${record.key}`}
                                className={
                                    detailsError && record.inventoryCode && !text
                                        ? "-sales-error"
                                        : ""
                                }
                                value={text}
                                record={record}
                                dataIndex="ybbalance"
                                handleSave={row => this.onCellChange(row, index)}
                                webapi={this.webapi}
                                metaAction={this.metaAction}
                                store={this.store}></EditableCell>
                        )
                    }
                },
                footer: () => {
                    return (
                        <DataGrid.Cell className="p-r" title={this.sumColumn("ybbalance")}>
                            {this.sumColumn("ybbalance")}
                        </DataGrid.Cell>
                    )
                },
            },
        ]
        columns = columns.map(m => renderDataGridCol({ ...colOption, ...m }))
        return columns
    }
    //增行
    addRow(ps) {
        let { main } = this.state
        let index = ps.rowIndex + 1
        let item = blankDetail()
        main.billBodyDtoList.splice(index, 0, item)
        this.setState({
            main,
        })
    }
    //删行
    delRow(ps) {
        let { main } = this.state,
            tableSource = main.billBodyDtoList
        let index = ps.rowIndex
        tableSource.splice(index, 1)
        while (tableSource.length < 7) {
            tableSource.push(blankDetail())
        }
        this.setState(
            {
                main,
            },
            () => {
                let selectname = []
                main.billBodyDtoList.forEach(e => {
                    if (e.inventoryId) {
                        selectname.push(e.inventoryId)
                    }
                })
                sessionStorage["inventoryNameList"] = selectname
            }
        )
    }

    addStockName = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "新增存货档案",
            wrapClassName: "card-archive",
            width: 700,
            height: 520,
            bodyStyle: { padding: "20px 30px" },
            footer: "",
            children: this.metaAction.loadApp("ttk-app-inventory-card", {
                store: this.store,
                initData: null,
            }),
        })
        if (ret) {
            let opstionList = await this.webapi.api.findInventoryList({})
            this.setState({
                opstionList,
            })
        }
    }

    // 禁用时间 (只能选当前会计期间的日期)
    disabledDate = currentDate => {
        return (
            currentDate.valueOf() < moment(this.period).startOf("day").valueOf() ||
            currentDate.valueOf() > moment(this.period).endOf("month").valueOf()
        )
    }

    render() {
        const {
            loading,
            main,
            title,
            serviceOptions,
            serviceTypeCode,
            subjectObject,
            serviceTypeName,
            autoAdjustBtnFlag,
            formError,
            detailsError,
        } = this.state
        const { type, isReadOnly, isPZ, id, checkOutType, isAutoAdjust } = this.props

        let defaultItem = {
                id: subjectObject.acctId,
            },
            assistJSON = subjectObject["assistCiName"],
            subjectName = subjectObject["acctName"],
            obj = assistJSON ? JSON.parse(assistJSON) : {},
            assistList = obj.assistList
        defaultItem.codeAndName = `${subjectObject["acctCode"] || ""} ${
            subjectObject["acctName"] || ""
        }`
        let fullName = `${subjectObject["acctCode"] || ""} ${subjectObject["acctName"] || ""} ${
            assistList ? "/" : ""
        }${assistList ? assistList.map(m => m.name).join("/") : ""}`
        const isCanSelectAssist = JSON.parse(assistJSON || "{}").assistList
        const { getFieldDecorator } = this.props.form
        // console.log('main.cdate', main.cdate)

        let hasOption = serviceOptions.find(f => f.id === main.serviceTypeId)
        return (
            <Spin
                spinning={loading}
                delay={0.1}
                wrapperClassName="spin-box add-stock-orders purchase-ru-ku-add-alert"
                size="large"
                tip="数据加载中">
                {/* 标题栏 */}
                <div className="add-stock-orders-title">
                    {/* 标题栏表单 */}
                    <h1 className="add-stock-orders-title-text">{title}</h1>
                    <Form className="add-stock-orders-form">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "0px",
                                flexWrap: "wrap",
                            }}>
                            <Form.Item
                                required={isReadOnly || isPZ ? false : true}
                                label="业务类型:"
                                {...formItemLayout}
                                className={formError && !main.serviceTypeId ? "-sales-error" : ""}>
                                {isReadOnly || isPZ ? (
                                    <div className="add-stock-orders-form-read-only-box ellipsis">{`${
                                        serviceTypeName ? serviceTypeName : ""
                                    }`}</div>
                                ) : (
                                    getFieldDecorator("serviceTypeId", {
                                        initialValue: hasOption
                                            ? main.serviceTypeId
                                            : main.serviceTypeName,
                                    })(
                                        <Select
                                            placeholder="请选择业务类型"
                                            onChange={this.handleServiceChange.bind(this)}>
                                            {serviceOptions.map(e => (
                                                <Option
                                                    key={e.id}
                                                    value={e.id}
                                                    item={e}
                                                    title={e.name}>
                                                    {e.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    )
                                )}
                            </Form.Item>
                            <Form.Item label="单据编号:" {...formItemLayout}>
                                <div className="add-stock-orders-form-read-only-box">{`${main.code}`}</div>
                            </Form.Item>
                            <Form.Item
                                required={(isReadOnly || isPZ) && !isAutoAdjust ? false : true}
                                label={
                                    main.invoiceTypeName === "QTCK" || type === "QTCK"
                                        ? "出库日期"
                                        : "入库日期"
                                }
                                {...formItemLayout}>
                                {(isReadOnly || isPZ) && !isAutoAdjust ? (
                                    <div className="add-stock-orders-form-read-only-box">{`${
                                        main.cdate ? main.cdate : ""
                                    }`}</div>
                                ) : (
                                    <DatePicker
                                        placeholder="请选择入库日期"
                                        value={moment(main.cdate)}
                                        onChange={this.handleDateChange.bind(this)}
                                        disabledDate={this.disabledDate}></DatePicker>
                                )}
                            </Form.Item>
                            <Form.Item
                                required={(isReadOnly || isPZ) && !isAutoAdjust ? false : true}
                                label={`${
                                    main.invoiceTypeName === "QTCK" || type === "QTCK"
                                        ? "借方科目"
                                        : "贷方科目"
                                }:`}
                                {...formItemLayout}
                                className={formError && !main.accountId ? "-sales-error" : ""}
                                style={{ marginRight: "2px" }}>
                                {(isReadOnly || isPZ) && !isAutoAdjust ? (
                                    <div
                                        className="add-stock-orders-form-read-only-box ellipsis"
                                        title={fullName}>{`${fullName}`}</div>
                                ) : (
                                    getFieldDecorator("accountId", {
                                        initialValue: main.accountId,
                                    })(
                                        <SelectSubject
                                            ref={node => (this.myRef = node)}
                                            value={main.accountId}
                                            style={{ border: "none" }}
                                            autofocus
                                            metaAction={this.metaAction}
                                            store={this.store}
                                            dropdownMenuStyle={{
                                                maxWidth: "280px",
                                            }}
                                            webapi={this.webapi}
                                            assistJSON={main.assistCiName}
                                            serviceTypeCode={serviceTypeCode}
                                            defaultItem={defaultItem}
                                            // subjectName={subjectName}
                                            disabled={!main.serviceTypeId}
                                            onChange={value =>
                                                this.handleSubjectChange(value)
                                            }></SelectSubject>
                                    )
                                )}
                            </Form.Item>
                        </div>
                    </Form>
                </div>
                <Layout
                    className={
                        (main.invoiceTypeName === "QTCK" || type === "QTCK") &&
                        checkOutType === 3 &&
                        id
                            ? "purchase-ru-ku-add-alert-content no-show-add-btn"
                            : "purchase-ru-ku-add-alert-content"
                    }>
                    {/* 表格 */}
                    <DataGrid
                        ellipsis={true}
                        className="purchase-ru-ku-add-alert-Body no-mk-cell-padding"
                        headerHeight={35}
                        rowHeight={35}
                        footerHeight={35}
                        rowsCount={main.billBodyDtoList.length}
                        enableSequence={true}
                        startSequence={1}
                        enableSequenceAddDelrow={!isAutoAdjust && !isReadOnly && !isPZ}
                        sequenceFooter={<DataGrid.Cell>合计</DataGrid.Cell>}
                        key={this.dataGridKey}
                        readonly={false}
                        style={{ minHeight: "315px" }}
                        onAddrow={this.addRow.bind(this)}
                        onDelrow={this.delRow.bind(this)}
                        columns={this.getColumns()}
                        allowResizeColumn></DataGrid>
                </Layout>

                <div className="add-stock-orders-footer">
                    <div className="add-stock-orders-footer-author">
                        <span>制单人: &nbsp;{main.operater}</span>
                    </div>
                    <div className="purchase-ru-ku-add-alert-footer-btn-btnGroup">
                        <Button
                            className="purchase-ru-ku-add-alert-footer-btn-btnGroup-item"
                            onClick={this.onCancel.bind(this)}>
                            取消
                        </Button>
                        {isAutoAdjust
                            ? null
                            : !isReadOnly &&
                              !isPZ && (
                                  <Button
                                      className="purchase-ru-ku-add-alert-footer-btn-btnGroup-item"
                                      type="primary"
                                      onClick={this.onSave.bind(this)}>
                                      保存
                                  </Button>
                              )}
                        {isAutoAdjust
                            ? null
                            : !isReadOnly &&
                              !isPZ && (
                                  <Button
                                      className="purchase-ru-ku-add-alert-footer-btn-btnGroup-item"
                                      type="primary"
                                      onClick={this.onSave.bind(this, "saveAndNew")}>
                                      保存并新增
                                  </Button>
                              )}
                        {isAutoAdjust && (
                            <Button
                                className="purchase-ru-ku-add-alert-footer-btn-btnGroup-item"
                                type="primary"
                                onClick={this.onSave.bind(this)}
                                disabled={!autoAdjustBtnFlag && isAutoAdjust}>
                                保存
                            </Button>
                        )}
                    </div>
                </div>
            </Spin>
        )
    }
}

export default Form.create({ name: "add_other_storage_orders" })(AddStockOrders)
