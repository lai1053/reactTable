import React, { PureComponent, Fragment } from "react"
import { Icon } from "antd"
import { Button, DatePicker } from "edf-component"
import { moment as utilsMoment, number as utilsNumber } from "edf-utils"
import SelectName from "../SelectName"
import InputWithTip from "../InputWithTip"
import AddDeleteIcon from "../AddDeleteIcon"
import { warehouseingSalesListTable } from "./common/staticField"
import moment from "moment"
import {
    getInfo,
    transToNum,
    formatSixDecimal,
    stockLoading,
    // denyClick,
    canClickTarget
} from "../../commonAssets/js/common"
import VirtualTable from "../../../invoices/components/VirtualTable"
import { flatCol } from "../common/js/util"
import PrintButton from "../common/PrintButton"

const { stringToMoment } = utilsMoment

export default class StockAppCompletionWarehousingSalesList extends PureComponent {
    constructor(props) {
        super(props)
        const dom = document.querySelector(".ttk-stock-app-completion-warehousing-sales")
        this.shortcutsClass = "shortcuts-container-" + new Date().valueOf()
        this.state = {
            loading: false,
            isGenVoucher: false,
            cannotReturn: false,
            tableOption: {
                x: (dom && dom.offsetWidth - 10) || 1500,
                y: (dom && dom.offsetHeight - 10 - 104 - 39) || 600,
            },
            others: {
                btnText: "按销售生产入库",
                delBtn: "删除",
                code: "",
                period: "",
                rkPeriod: "",
            },
            listItem: {
                xh: undefined,
                inventoryId: 1,
                inventoryCode: undefined,
                inventoryName: undefined,
                inventoryGuiGe: undefined,
                inventoryUnit: undefined,
                num: undefined,
                ybbalance: undefined,
                isDisable: false,
                isSelect: false,
            },
            invSet: {},
            list: [],
            selectNameList: [],
            numT: 0,
            ybbalanceT: 0,
            xdzOrgIsStop: props.xdzOrgIsStop
        }
        this.component = props.component || {}
        this.metaAction = props.metaAction || {}
        this.webapi = props.webapi || {}
        this.params = props.params || {} // 传入的参数
    }

    componentDidMount() {
        this.load()
    }

    // 存货列表
    load = async reload => {
        let mainList = [],
            id,
            code = "",
            calculatingType = "0",
            res,
            originData,
            rkPeriod 
        const { isGenVoucher, isCompletion, endNumSource, path, isCarryOverMainCost, period, form={} } = this.params || {}
        if (
            reload == "reload" ||
            ((isGenVoucher || isCompletion || endNumSource == 0) &&
                this.params &&
                path !== "ttk-stock-app-completion-warehousing-sales")
        ) {
            this.setState({ loading: true })
            originData = res = await this.webapi.stock.getWipCompleteBillList({
                'period': period || "",
                'isGenVoucher': isGenVoucher,
                'isCarryOverMainCost': isCarryOverMainCost,
            }) // 存货列表

            if (res) {
                if (res.billBodyDtoList.length !== 0) {
                    mainList = res.billBodyDtoList.map(item => {
                        item.num = (item.num && item.num) || ""
                        item.ybbalance = (item.ybbalance && utilsNumber.format(item.ybbalance, 2)) || "" // 金额
                        return item
                    })
                } else {
                    mainList = this.setBlank()
                }
                this.id = res.id
                code = res.code || "" // 单据编码
                rkPeriod = res.period || "" // 生成日期
                calculatingType = res.calculatingType || "0"
            }
        } else {
            mainList = form.list || this.setBlank()
            code = form.code || "" // 单据编码
            rkPeriod = (!form.rkPeriod) ? moment(form.period).startOf("month").format("YYYY-MM-DD") : form.rkPeriod
            calculatingType = form.calculatingType || "0" // 销售成本率的计算方式 ，期初单价为'0'，销售成本率方式为'1'
        }

        const isReadOnly = this.isReadOnly()
        this.setState({
            loading: false,
            list: mainList,
            others: {
                ...this.state.others,
                code,
                calculatingType,
                rkPeriod,
            },
            isReadOnly,
            originData
        })

        this.reqInventoryList()

        this.getTableScroll()
    }

    //设置空白表格
    setBlank = () => {
        const mainList = []
        const item = {
            xh: "",
            inventoryId: "",
            inventoryCode: "",
            inventoryName: "",
            inventoryGuiGe: "",
            inventoryUnit: "",
            num: "",
            ybbalance: "",
            isDisable: false,
            isSelect: false,
            initialQuantity: 0, //--期初数量
            initialAmount: 0, //--期初金额
            salesVolume: 0, //--销售 金额
            salesNum: 0, //--销售数量
            salesCostRate: 0, //--成本率
        }
        for (let i = 0; i < 5; i++) {
            item.inventoryId = i + 1 + Math.random()
            mainList.push(Object.assign({}, item))
        }
        return mainList
    }

    // 请求存货科目
    reqInventoryList = async () => {
        let inventoryList = await this.webapi.stock.getInventoryTypesFromArchives({
            'period': this.params.period || "",
            'serviceCode': "WGRK",
            'name': "",
            'inventoryClassId': null,
        })
        if (inventoryList) {
            let selectOptions = this._parseSelectOption(inventoryList),
                inventoryListCopy = []
            selectOptions.splice(0, 0, {
                inventoryClassId: "",
                inventoryClassName: "全部",
                isCompletion: false,
            })

            this.setState({
                selectNameList: inventoryList,
                selectOptions,
            })
        } else {
            this.metaAction.toast("error", inventoryList.message)
        }
    }

    // 解析并去重存货科目
    _parseSelectOption = data => {
        const obj = {},
            selectOptions = []
        data.map(v => {
            if (!obj[v.inventoryClassId]) {
                obj[v.inventoryClassId] = v.inventoryClassId
                const { inventoryClassId, inventoryClassName } = v
                selectOptions.push({ inventoryClassId, inventoryClassName })
            }
        })
        return selectOptions
    }

    // 列表高度自适应浏览器大小，出现滚动条
    getTableScroll = e => {
        let tableOption = this.state.tableOption || {}
        const dom = document.querySelector(".ttk-stock-app-completion-warehousing-sales")
        if (dom) {
            this.setState({
                tableOption: {
                    ...tableOption,
                    x: dom.offsetWidth - 10,
                    y: dom.offsetHeight - 10 - 104 - 39,
                },
            })
        }
    }

    // ---- load逻辑完结 ----

    renderTable = () => {
        const tableData = this.state.list || []
        const tableOption = this.state.tableOption || {}
        return (
            <div className={this.shortcutsClass}>
                <VirtualTable
                    dataSource={tableData}
                    scroll={{
                        y: tableOption.y,
                        x: tableOption.x < 1200 ? 1200 : tableOption.x + 10,
                    }}
                    // summaryRows={this.renderSummaryRow()}
                    bordered
                    rowKey="inventoryId"
                    width={tableOption.x}
                    height={tableOption.y + 100}
                    columns={this.renderColumns()}
                    // headerHeight={78}
                    openShortcuts
                    shortcutsClass={this.shortcutsClass}
                    allowResizeColumn
                />
            </div>
        )
    }

    renderColumns = () => {
        let optionList = this._diffTheSame()
        const isReadOnly = this.isReadOnly()
        const columns = warehouseingSalesListTable.map(col => {
            const item = { ...col }
            item.title = <div className="ttk-stock-app-table-header-txt"> {item.title} </div>
            switch (item.dataIndex) {
                case "xh":
                    item.render = (text, record, index) => {
                        if (!isReadOnly) {
                            return (
                                <div className="operations">
                                    <span className="xh">{index + 1} </span>
                                    <AddDeleteIcon
                                        callback={icon => {
                                            this.handleAddOrDelete(icon, record, record.inventoryId)
                                        }}
                                    />
                                </div>
                            )
                        } else {
                            return <span className="xh">{index + 1} </span>
                        }
                    }
                    break
                case "inventoryName": //存货名称列
                    item.render = (text, record, index) => {
                        if (!isReadOnly) {
                            return (
                                <div className="tdChme">
                                    <SelectName
                                        key={`key-${record.inventoryId}`}
                                        className="selectName"
                                        text={text}
                                        optionList={optionList}
                                        changeCallback={v => {
                                            this.McChange(v, record)
                                        }}
                                    />
                                    <div
                                        className="selectMoreName"
                                        onClick={() => {
                                            this.selectMoreName(record)
                                        }}>
                                        <Icon type="ellipsis" />
                                    </div>
                                </div>
                            )
                        } else {
                            return <div className="tdChme">{text}</div>
                        }
                    }
                    break
                case "num": // 数量列
                    item.render = (text, record, index) => {
                        if (!isReadOnly) {
                            return (
                                <div className="editable-cell edited-cell">
                                    <InputWithTip
                                        className="editable-cell-value-wrap"
                                        format={"amount"}
                                        isError={record.numError}
                                        errorTips={""}
                                        defaultVal={text}
                                        inputEvent={value => {
                                            this.handleInput(value, record, "num")
                                        }}
                                        blurEvent={value => {
                                            this.handleBlur(value, record, "num")
                                        }}
                                    />
                                </div>
                            )
                        } else {
                            return <div>{text}</div>
                        }
                    }
                    break
                case "ybbalance": //总金额列
                    item.render = (text, record, index) => {
                        if (!isReadOnly) {
                            return (
                                <div className="editable-cell edited-cell">
                                    <InputWithTip
                                        className="editable-cell-value-wrap"
                                        format={"cash"}
                                        isError={record.numError}
                                        errorTips={""}
                                        defaultVal={text}
                                        inputEvent={value => {
                                            this.handleInput(value, record, "ybbalance")
                                        }}
                                        blurEvent={value => {
                                            this.handleBlur(value, record, "ybbalance", 2)
                                        }}
                                    />
                                </div>
                            )
                        } else {
                            return <div>{text}</div>
                        }
                    }
                    break
            }
            return item
        })
        return columns
    }

    // 对比存货名称，表格中已有的存货名称，在下拉框中不可选
    _diffTheSame = () => {
        const optionList = this.state.selectNameList || []
        const mainList = this.state.list || []
        const options = optionList.map(v => {
            v.disabled = !this.params.isGenVoucher ? false : true
            for (const item of mainList) {
                if (item.inventoryId === v.inventoryId) v.disabled = true
            }
            return v
        })
        return options
    }

    // 表格的新增和删除事件
    handleAddOrDelete = async (icon, record, id) => {
        const list = this.state.list || []
        const index = list.findIndex(v => v.inventoryId === record.inventoryId)
        if (icon === "add") {
            const newObj = {
                xh: "",
                inventoryId: list.length + 1 + Math.random(),
                inventoryCode: "",
                inventoryName: "",
                inventoryGuiGe: "",
                inventoryUnit: "",
                num: "",
                ybbalance: "",
                isDisable: false,
                isSelect: false,
                initialQuantity: 0, //--期初数量
                initialAmount: 0, //--期初金额
                salesVolume: 0, //--销售 金额
                salesNum: 0, //--销售数量
                salesCostRate: 0, //--成本率
            }
            const newNum = parseInt(index) + 1 + Math.random()
            list.splice(newNum, 0, newObj)
            this.setState({ list: [...list] })
        } else {
            if (list.length > 1) {
                list.splice(index, 1)
            } else {
                if (list.length > 0) {
                    let firstItem = list[0]
                    list[0] = Object.assign(firstItem, {
                        inventoryCode: undefined,
                        inventoryName: "",
                        inventoryGuiGe: undefined,
                        inventoryUnit: undefined,
                        num: "",
                        matDisCof: undefined,
                        ybbalance: "",
                        isDisable: false,
                        isSelect: false,
                    })
                }
            }
            this.setState({ list: [...list] })
        }
    }

    // 存货名称改变回调事件
    McChange(v, record) {
        const content = JSON.parse(v)
        let list = this.state.list || []
        const index = list.findIndex(v => v.inventoryId === record.inventoryId)
        list[index] = { ...content }
        this.setState({ list: [...list] })
    }

    // 选择更多存货名称
    selectMoreName = async record => {
        if (this.params.isGenVoucher) {
            this.metaAction.toast("warning", "本月已结账，不能修改存货！")
            return
        }
        const selectNameList = this._diffTheSame()
        const selectOptions = this.state.selectOptions || []
        const con = {
            title: "存货名称选择",
            wrapClassName: "ttk-stock-card-select-warehousing-names",
            width: 950,
            okText: "确定",
            allowDrag: false,
            children: this.metaAction.loadApp("ttk-stock-card-select-warehousing-names", {
                store: this.component.props.store,
                selectNameList,
                selectOptions,
            }),
        }
        const res = await this.metaAction.modal("show", con)
        const batchSelectedRows = (res && res) || []
        const mainList = this.state.list || []
        const index = mainList.findIndex(v => v.inventoryId === record.inventoryId)
        if (batchSelectedRows.length !== 0) {
            const idx =
                mainList[index] && mainList[index].inventoryId && mainList[index].inventoryName
                    ? index + 1
                    : index
            const delNum =
                mainList[idx] && mainList[idx].inventoryId && mainList[idx].inventoryName ? 0 : 1
            mainList.splice(idx, delNum, ...batchSelectedRows)
        }
        this.setState({ list: [...mainList] })
    }

    handleBlur = (value, record, field, formatDecimal) => {
        let val = value && value.toString().replace(/,/g, "")
        let list = this.state.list || []
        const index = list.findIndex(v => v.inventoryId === record.inventoryId)
        let midVal = formatDecimal ? utilsNumber.format(val, formatDecimal) : val
        list[index][field] = val ? midVal : ""
        this.setState({ list: [...list] })
    }

    handleInput = (value, record, field) => {
        let list = this.state.list || []
        const index = list.findIndex(v => v.inventoryId === record.inventoryId)
        if (value.trim()) {
            list[index][`${field}Error`] = false
        }
        list[index][field] = value
        this.setState({ list: [...list] })
    }

    // ---- 列表逻辑完结 ----

    /* 只读 ，如果已结账、或已经生成生产成本凭证，或已经结转出库成本，或者该客户已经停用，那么页面为只读状态*/
    isReadOnly = () => {
        const {xdzOrgIsStop} = this.state
        const { isGenVoucher, isCarryOverProductCost, isCarryOverMainCost } = this.params
        return isGenVoucher || isCarryOverProductCost || isCarryOverMainCost || xdzOrgIsStop
    }

    /* 是否可以返回 */
    canRefresh = () => {
        const list = this.state.list || []
        const {
            isGenVoucher,
            isCarryOverProductCost,
            isCarryOverMainCost,
        } = this.params
        return (
            isGenVoucher ||
            isCarryOverProductCost ||
            isCarryOverMainCost
        )
    }

    /* 可以删除 */
    canDelete = () => {
        const { isCarryOverMainCost, isCarryOverProductCost, isGenVoucher, isCompletion } = this.params
        return isCarryOverMainCost || isCarryOverProductCost || isGenVoucher || !isCompletion
    }

    // 返回
    handleReturn = () => {
        this.component.props.onlyCloseContent &&
            this.component.props.onlyCloseContent("ttk-stock-app-completion-warehousing-sales-list")
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
    }

    // 按销售生产入库
    handleRefresh = async(event) => {
        const hasClick = canClickTarget.getCanClickTarget('completionSaleRefresh')  
        if(!hasClick){
            const list = this.state.list || []
            const {
                code,
                period,
                type,
                calculatingType,
                list: billBodyDtoList,
                rkPeriod,
            } = this.composeParams(list)
            const obj = {}
            obj.form = { code, period, type, calculatingType, list, rkPeriod }
            const params = Object.assign({}, this.params, obj)
            params.path = "ttk-stock-app-completion-warehousing-sales-list" // 设置路径
            canClickTarget.setCanClickTarget('completionSaleRefresh', true)
            this.component.props.onlyCloseContent &&
                this.component.props.onlyCloseContent(
                    "ttk-stock-app-completion-warehousing-sales-list"
                )
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    "完工入库",
                    "ttk-stock-app-completion-warehousing-sales",
                    { params: { ...params } }
                )
            canClickTarget.setCanClickTarget('completionSaleRefresh', false)

        }
    }

    // 删除
    handleDel = async () => {
        const ret = await this.metaAction.modal("confirm", {
            content: "确定删除完工入库单？",
        })
        if (!ret) {
            return
        }
        await this.webapi.stock.cancelProductShare({'period': this.params.period || ''})
        let isDel = await this.webapi.stock.deleteWipCompleteByPeriod({
            period: this.params.period || "",
            id: this.id,
        })
        if (isDel === null) {
            this.metaAction.toast("success", "删除成功！")
            setTimeout(() => {
                if (this.component.props.onlyCloseContent) {
                    this.component.props.onlyCloseContent(
                        "ttk-stock-app-completion-warehousing-sales-list"
                    )
                    this.component.props.onlyCloseContent(
                        "ttk-stock-app-completion-warehousing-sales"
                    )
                }
                this.component.props.setPortalContent &&
                    this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
            }, 3000)
        }
    }

    // 禁用时间 (只能选当前会计期间的日期)
    disabledDate = currentDate => {
        const currentMonth = this.state.others.rkPeriod
        const flag1 = currentDate <= moment(currentMonth).startOf("month")
        const flag2 = currentDate >= moment(currentMonth).endOf("month")
        return currentDate && (flag1 || flag2)
    }

    // 日期改变事件
    changeDate = e => {
        this.setState({
            others: {
                ...this.state.others,
                rkPeriod: moment(e).format("YYYY-MM-DD"),
            },
        })
    }

    // 渲染合计数
    renderFooterLeft = () => {
        const list = this.state.list || []
        let numT = 0,
            ybbalanceT = 0
        list.map(v => {
            numT += transToNum(v.num)
            ybbalanceT += transToNum(v.ybbalance)
            return v
        })
        return (
            <div className="total">
                <span>生产数量：{formatSixDecimal(numT)}</span>
                <span>生产成本合计：{utilsNumber.format(ybbalanceT, 2)}</span>
            </div>
        )
    }

    // 保存
    handleSave = async (event) => {
        event.stopPropagation && event.stopPropagation()
        event.nativeEvent.stopPropagation && event.nativeEvent.stopPropagation()
        const hasClick = canClickTarget.getCanClickTarget('completionSaleSave')   // 防止重复点击
        if(!hasClick){
            const { flag, checkedList } = this.checkform()
            if (flag) {
                if (checkedList.length === 0) {
                    this.metaAction.toast("error", "请先录入存货")
                    return
                }
                this.setState({ loading: true })
                canClickTarget.setCanClickTarget('completionSaleSave', true)
                const params = this.composeParams(checkedList)
                let res = await this.webapi.stock.saveWipCompleteBillList({
                    'billTitleDto': { ...params },
                })
                if (res === null) {
                    this.metaAction.toast("success", "保存成功！")
                    this.saveTimer = setTimeout(async () => {
                        const newInfo = await getInfo({ period: this.params.period || "" })
                        Object.assign(this.params, newInfo)
                        this.load("reload")
                    }, 1000)
                }
                canClickTarget.setCanClickTarget('completionSaleSave', false)
                this.setState({ loading: false })
            } else {
                this.metaAction.toast("error", "输入框的值不能为空")
                return
            }
        }
    }

    // 打印
    dealData = () => {
        let originData = this.state.originData
        if(!originData || !originData.billBodyDtoList.length) {
            this.metaAction.toast('error', '暂无有效数据')
            return
        }
        let data = originData.billBodyDtoList, res = []
        let temp = []
        data.forEach((y, j) => {
            temp.push({
                "accountName": this.metaAction.context.get("currentOrg").name,
                "amount": transToNum(y.ybbalance),
                "billCode": originData.code,
                "billNname": "完工入库单",
                "creator": originData.operater,
                "custName": originData.supplierName,
                "indexNo": j + 1,
                "number": transToNum(y.num),
                "remarks": "",
                "specification": y.inventoryGuiGe,
                "stockCode": y.inventoryCode,
                "stockName": y.inventoryName,
                "storageDate": originData.rkPeriod,
                "unit": y.inventoryUnit,
                "unitPrice": transToNum(y.price),
                "voucherCode": originData.voucherCodes
            })
        })
        res.push(temp)
        return res
    }

    // 校验
    checkform = () => {
        const list = this.state.list || []
        let flag = true
        let checkedList = [],
            all = []
        all = list.map(item => {
            if (item.inventoryName) {
                item.ybBalanceError = !item.ybbalance  // 未输入数量
                item.numError = !item.num              // 未输入金额
                checkedList.push(item)
            }
            if (!!item.ybBalanceError || !!item.numError) {
                flag = false
            }
            return item
        })
        this.setState({ list: [...all] })
        return { flag, checkedList }
    }

    // 组装保存的参数
    composeParams = checkList => {
        const params = {},
        list = checkList || []
        params.billBodyDtoList = list.map(v => {
            const item = {}
            item.inventoryId =
                v.inventoryId != null && v.inventoryId != undefined ? v.inventoryId : null
            item.num = transToNum(v.num)
            item.matDisCof = v.matDisCof  // 材料系数
            item.ybbalance = (v.ybbalance && transToNum(v.ybbalance)) || 0   //金额
            item.price = transToNum(v.price)
            item.salesCostRate = (v.salesCostRate && v.salesCostRate) || 0 //-- 销售成本率 选择以销定产才传
            return item
        })
        params.rkPeriod = this.state.others.rkPeriod
        params.code = this.state.others.code
        params.period = this.params.period
        params.type = this.params.endCostType == "0" ? "1" : "0" // 必传，生产成本核算方式：0——以销定产，1——传统生产
        params.calculatingType = this.state.others.calculatingType || "1" //已不用该字段 --计算方式 期初单价0，销售成本率1 选择以销定产才传
        return params
    }

    // ---- 其他逻辑完结 ----

    render() {
        const { loading, others, invSet, isReadOnly, xdzOrgIsStop } = this.state
        return (
            <Fragment>
                {loading && <div className="ttk-stock-app-spin">{stockLoading()}</div>}

                <div className="ttk-stock-app-header has-border">
                    <div className="header-left">
                        {!xdzOrgIsStop && <div className="back" disabled={isReadOnly} onClick={this.handleReturn}></div> } 
                        <span className="form-item">{"单据编号：" + others.code}</span>
                        {isReadOnly ? (
                            <span className="form-item">{"入库日期：" + others.rkPeriod}</span>
                        ) : (
                            <span className="form-item">
                                <span className="dateText">入库日期：</span>
                                <span className="codeDate">
                                    <DatePicker
                                        className="datePicker"
                                        disabledDate={this.disabledDate}
                                        onChange={this.changeDate}
                                        value={stringToMoment(others.rkPeriod, "YYYY-MM-DD")}
                                    />
                                </span>
                            </span>
                        )}
                    </div>
                    <div className="header-right">
                        {!xdzOrgIsStop &&
                            <React.Fragment>
                                <Button
                                    className="btn-item"
                                    onClick={this.handleRefresh}
                                    disabled={this.canRefresh()}>
                                    {others.btnText}
                                </Button>
                                <Button
                                    className="btn-item"
                                    onClick={this.handleDel}
                                    disabled={this.canDelete()}>
                                    {others.delBtn}
                                </Button>
                            </React.Fragment>
                        }
                        <PrintButton className='print-btn' params={{codeType: 'WGRK'}} dealData={this.dealData} />
                    </div>
                </div>

                {this.renderTable()}

                <div className="ttk-stock-app-completion-warehousing-sales-footer flex">
                    {this.renderFooterLeft()}
                    { !xdzOrgIsStop &&
                        <Button
                            className="ttk-stock-app-completion-warehousing-sales-footer-btn"
                            type="primary"
                            onClick={this.handleSave}
                            disabled={isReadOnly}>
                            保存
                        </Button>
                    } 
                </div>
            </Fragment>
        )
    }
}
