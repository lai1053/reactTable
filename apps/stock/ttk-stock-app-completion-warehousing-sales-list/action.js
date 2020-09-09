import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
// import { Icon } from 'antd'
// import { toJS, fromJS } from 'immutable'
// import utils from 'edf-utils'
// import SelectName  from '../components/SelectName'
// import InputWithTip from '../components/InputWithTip'
// import AddDeleteIcon  from '../components/AddDeleteIcon'
// import { warehouseingTable } from './staticField'
// import moment from 'moment'
// import{ getInfo, transToNum, formatSixDecimal, stockLoading, denyClick, billDisabledDate} from '../commonAssets/js/common'
// import InvTable from "./component/invTable"
import StockAppCompletionWarehousingSalesList from "../components/StockAppCompletionWarehousing/StockAppCompletionWarehousingSalesList"
/*
    @params: {
        "state": 0, --状态 0未开，1开启
        "bInveControl": 0, --是否进行负库存控制 0否 1是
        "endNumSource": 0, 完工入库数据来源 0 手工 1以销定产
        "endCostType":0, 以销定产0、传统生产1
        "isGenVoucher":true, 是否结账，未生成 false 生成 true
        "isCompletion":true,是否本月有完工入库单 有 true 没有 false
        "startPeriod":"2019-09", 启用月份
        "isCarryOverMainCost":false, 结转主营成本凭证 未生成 false 生成 true
        "isCarryOverProductCost":false, 结转生产成本凭证，未生成 false 生成 true
        "isProductShare":true, 是否进行成本分配，未生成 false 生成 true
        "inveBusiness",1 --1工业自行生产，0 存商业
    }
*/
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        // this.rowCount = 0
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = config.current.webapi
        this.params = this.component.props.params || {}
        injections.reduce("init")
    }

    renderPage = () => {
        const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        return (
            <StockAppCompletionWarehousingSalesList
                component={this.component}
                webapi={this.webapi}
                params={this.params}
                xdzOrgIsStop={xdzOrgIsStop}
                metaAction={this.metaAction}
            />
        )
    }

    stockLoading = () => {
        return stockLoading()
    }

    /* 只读 */
    isReadOnly = () => {
        const { isGenVoucher, isCarryOverProductCost, isCarryOverMainCost } = this.params
        return isGenVoucher || isCarryOverProductCost || isCarryOverMainCost
    }

    /* 是否可以返回 */
    canRefresh = () => {
        const list =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        const cannotReturn = list && list.length != 0
        const {
            isGenVoucher,
            endNumSource,
            isCarryOverProductCost,
            isCarryOverMainCost,
        } = this.params
        return (
            isGenVoucher ||
            !cannotReturn ||
            !endNumSource ||
            isCarryOverProductCost ||
            isCarryOverMainCost
        )
    }

    /* 可以删除 */
    canDelete = () => {
        const { isCarryOverMainCost, isCarryOverProductCost, isCompletion } = this.params
        return isCarryOverMainCost || isCarryOverProductCost || !isCompletion
    }

    // 存货列表
    load = async reload => {
        let mainList = [],
            id,
            code = "",
            period = "",
            calculatingType = "0",
            res,
            cannotReturn //, numT = 0, ybbalanceT = 0
        const { isGenVoucher, isCompletion, endNumSource, path } = this.params
        if (
            reload == "reload" ||
            ((isGenVoucher || isCompletion || endNumSource == 0) &&
                this.params &&
                path !== "ttk-stock-app-completion-warehousing-sales")
        ) {
            this.metaAction.sf("data.loading", true)
            res = await this.webapi.stock.getWipCompleteBillList({
                period: this.params.period || "",
            }) // 存货列表
            this.metaAction.sf("data.loading", false)
            if (res) {
                if (res.billBodyDtoList.length !== 0) {
                    mainList = res.billBodyDtoList.map(item => {
                        item.num = (item.num && item.num) || ""
                        item.ybbalance =
                            (item.ybbalance && utils.number.format(item.ybbalance, 2)) || "" // 金额
                        return item
                    })
                } else {
                    mainList = this.setBlank()
                }
                this.id = res.id
                code = res.code || "" // 单据编码
                period = res.period || "" // 生成日期
                calculatingType = res.calculatingType || "0"
            }
        } else {
            mainList = this.params.form.list || this.setBlank()
            // cannotReturn = mainList && mainList.length!==0 ? false : true
            code = this.params.form.code || "" // 单据编码
            period = this.params.form.period || "" // 生成日期
            if (moment().isSame(this.params.form.period, "month")) {
                period = moment().format("YYYY-MM-DD")
            } else {
                const currentDate = moment(this.params.form.period).endOf("month").format("-DD")
                period =
                    this.params.form.period.length > 7
                        ? this.params.form.period
                        : this.params.form.period + currentDate
            }
            calculatingType = this.params.form.calculatingType || "0" // 销售成本率的计算方式 ，期初单价为'0'，销售成本率方式为'1'
            this.injections.reduce("updateSfs", { "data.loading": false })
        }
        this.injections.reduce("updateSfs", {
            ["data.list"]: fromJS(mainList),
            // ['data.cannotReturn']: cannotReturn,
            ["data.others.code"]: code,
            ["data.others.period"]: period,
            ["data.others.calculatingType"]: calculatingType,
            // ['data.invSet']: fromJS(this.params)
        })
        this.reqInventoryList()
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    // 请求存货科目
    reqInventoryList = async () => {
        let inventoryList = await this.webapi.stock.getInventoryTypesFromArchives({
            //存货科目
            period: this.params.period || "",
            serviceCode: "WGRK",
            name: "",
            inventoryClassId: null,
        })
        if (inventoryList) {
            let selectOptions = this._parseSelectOption(inventoryList),
                inventoryListCopy = []
            selectOptions.splice(0, 0, {
                inventoryClassId: "",
                inventoryClassName: "全部",
                isCompletion: false,
            })
            this.injections.reduce("updateSfs", {
                ["data.selectNameList"]: fromJS(inventoryList),
                ["data.selectOptions"]: fromJS(selectOptions),
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

    renderFooterLeft = () => {
        const list =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        let numT = 0,
            ybbalanceT = 0
        list.map(v => {
            numT += transToNum(v.num)
            ybbalanceT += transToNum(v.ybbalance)
            return v
        })
        return (
            <div>
                <span
                    className="ttk-stock-app-completion-warehousing-footer-div-span"
                    style={{ marginRight: "30px" }}>
                    生产数量：{formatSixDecimal(numT)}
                </span>
                <span className="ttk-stock-app-completion-warehousing-footer-div-span">
                    生产成本合计：{utils.number.format(ybbalanceT, 2)}
                </span>
            </div>
        )
    }
    mousedown = e => {
        const path = utils.path.findPathByEvent(e)
        if (this.metaAction.isFocus(path)) return
        if (path.indexOf("cell.cell") != -1) {
            this.focusCell(this.getCellInfo(path))
        } else {
            if (!this.metaAction.focusByEvent(e)) return
            setTimeout(this.cellAutoFocus, 16)
        }
    }
    renderTable = () => {
        const tableData =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        const tableOption =
            (this.metaAction.gf("data.tableOption") &&
                this.metaAction.gf("data.tableOption").toJS()) ||
            []
        return (
            <InvTable
                className="ttk-stock-app-completion-warehousing-main-table mk-layout"
                bordered
                dataSource={tableData}
                pagination={false}
                scroll={tableOption}
                // rowSelection={this.rowSelection()}
                // style={{maxHeight: '250px', overflowY: "auto"}}
                columns={this.renderColumns()}
                allowColResize={false}
                rowKey="inventoryId"
                emptyShowScroll={true}
            />
        )
    }

    renderColumns = () => {
        let optionList = this._diffTheSame()
        const columns = warehouseingTable.map(item => {
            item.title = <div className="ttk-stock-app-table-header-txt"> {item.title} </div>
            switch (item.dataIndex) {
                case "xh":
                    item.render = (text, record, index) => {
                        if (!this.params.isCarryOverProductCost) {
                            // 如果还没有生成凭证,鼠标经过时
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
                        if (!this.params.isCarryOverProductCost) {
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
                        if (!this.params.isCarryOverProductCost && !this.params.isGenVoucher) {
                            return (
                                <div className="editable-cell">
                                    <InputWithTip
                                        format={"cash"}
                                        // key={((new Date()).getTime())}
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
                        if (!this.params.isCarryOverProductCost && !this.params.isGenVoucher) {
                            return (
                                <div className="editable-cell">
                                    <InputWithTip
                                        format={"cash"}
                                        // key={((new Date()).getTime())}
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
        const optionList =
            (this.metaAction.gf("data.selectNameList") &&
                this.metaAction.gf("data.selectNameList").toJS()) ||
            []
        const mainList = this.metaAction.gf("data.list")
            ? this.metaAction.gf("data.list").toJS()
            : []
        const options = optionList.map(v => {
            v.disabled = !this.params.isGenVoucher ? false : true
            for (const item of mainList) {
                if (item.inventoryId === v.inventoryId) v.disabled = true
            }
            return v
        })
        return options
    }

    handleBlur = (value, record, field, formatDecimal) => {
        let val = value && value.toString().replace(/,/g, "")
        let list = (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        const index = list.findIndex(v => v.inventoryId === record.inventoryId)
        let midVal = formatDecimal ? utils.number.format(val, formatDecimal) : val
        list[index][field] = val ? midVal : ""
        this.injections.reduce("updateSfs", {
            ["data.list"]: fromJS(list),
        })
    }

    handleInput = (value, record, field) => {
        let list = (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        const index = list.findIndex(v => v.inventoryId === record.inventoryId)
        if (value.trim()) {
            list[index][`${field}Error`] = false
        }
        list[index][field] = value
        this.injections.reduce("updateSfs", {
            ["data.list"]: fromJS(list),
        })
    }

    // 存货名称改变回调事件
    McChange(v, record) {
        const content = JSON.parse(v)
        let list = (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        const index = list.findIndex(v => v.inventoryId === record.inventoryId)
        list[index] = { ...content }
        this.injections.reduce("updateSfs", {
            ["data.list"]: fromJS(list),
        })
    }
    // 选择更多存货名称
    selectMoreName = async record => {
        if (this.params.isGenVoucher) {
            this.metaAction.toast("warning", "本月已结账，不能修改存货！")
            return
        }
        const selectNameList = this._diffTheSame()
        const selectOptions =
            (this.metaAction.gf("data.selectOptions") &&
                this.metaAction.gf("data.selectOptions").toJS()) ||
            []
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
        const mainList =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
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
        this.injections.reduce("updateSfs", {
            ["data.list"]: fromJS(mainList),
        })
    }
    // 表格的新增和删除事件
    handleAddOrDelete = async (icon, record, id) => {
        const list = this.metaAction.gf("data.list") ? this.metaAction.gf("data.list").toJS() : []
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
            this.injections.reduce("updateSfs", {
                ["data.list"]: fromJS(list),
            })
        } else {
            if (list.length > 1) {
                list.splice(index, 1)
                this.metaAction.sf("data.list", fromJS(list))
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
                this.metaAction.sf("data.list", fromJS(list))
                // message.destroy()
                // message.warning('最后一行，无法删除', 2)
            }
        }
    }

    // 返回
    handleReturn = () => {
        this.component.props.onlyCloseContent &&
            this.component.props.onlyCloseContent("ttk-stock-app-completion-warehousing-sales-list")
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
    }

    componentWillUnmount = () => {
        this[`deny-warehousing-sale-refresh-generateVoucherClickFlag`] = null
        this[`deny-warehousing-sale-save-generateVoucherClickFlag`] = null
    }

    // 按销售生产入库
    handleRefresh = () => {
        const canClick = denyClick(this, "deny-warehousing-sale-refresh-generateVoucher")
        if (canClick) {
            const list =
                (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
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
        }
    }

    // 校验
    checkform = () => {
        const list =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        let flag = true
        let checkedList = [],
            all = []
        all = list.map(item => {
            if (item.inventoryName) {
                item.ybBalanceError = !item.ybbalance
                item.numError = !item.num
                checkedList.push(item)
            }
            if (!!item.ybBalanceError || !!item.numError) {
                flag = false
            }
            return item
        })
        this.injections.reduce("updateSfs", {
            ["data.list"]: fromJS(all),
        })
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
            item.num = v.num
            item.matDisCof = v.matDisCof
            item.ybbalance = (v.ybbalance && transToNum(v.ybbalance)) || 0
            item.price = transToNum(v.price)
            item.salesCostRate = (v.salesCostRate && v.salesCostRate) || 0 //-- 销售成本率 选择以销定产才传
            return item
        })
        params.rkPeriod = this.metaAction.gf("data.others.period")
        params.code = this.metaAction.gf("data.others.code")
        params.period = this.params.period
        params.type = this.params.endCostType == "0" ? "1" : "0" //产值百分比是0，销售成本率是1
        params.calculatingType = this.metaAction.gf("data.others.calculatingType") || "1" //--计算方式 期初单价0，销售成本率1 选择以销定产才传
        return params
    }

    // 保存
    handleSave = async () => {
        const canClick = denyClick(this, "deny-warehousing-sale-save-generateVoucher")
        if (canClick) {
            const { flag, checkedList } = this.checkform()
            if (flag) {
                if (checkedList.length === 0) {
                    this.metaAction.toast("error", "请先录入存货")
                    return
                }
                const params = this.composeParams(checkedList)
                this.metaAction.sf("data.loading", true)
                let res = await this.webapi.stock.saveWipCompleteBillList({
                    billTitleDto: { ...params },
                })
                if (res === null) {
                    this.metaAction.toast("success", "保存成功！")
                    // clearTimeout(this.saveTimer)
                    this.saveTimer = setTimeout(async () => {
                        const newInfo = await getInfo({ period: this.params.period || "" })
                        Object.assign(this.params, newInfo)
                        this.load("reload")
                    }, 1000)
                }
                this.metaAction.sf("data.loading", false)
            } else {
                this.metaAction.toast("error", "输入框的值不能为空")
                return
            }
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
        // if(this.params.endCostType == 0 && this.params.isProductShare){
        //     this.metaAction.toast('warning', '当前会计期间已存在成本分配表，请先删除成本分配表！')
        //     return
        // }
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
    disabledDate = currentDate => billDisabledDate(this, currentDate, "data.others.period")

    // 日期改变事件
    changeDate = e => {
        this.metaAction.sf("data.others.period", moment(e).format("YYYY-MM-DD"))
    }

    // 列表高度自适应浏览器大小，出现滚动条
    getTableScroll = e => {
        try {
            let tableOption =
                (this.metaAction.gf("data.tableOption") &&
                    this.metaAction.gf("data.tableOption").toJS()) ||
                []
            let appDom = document.getElementsByClassName("ttk-stock-app-completion-warehousing")[0] //以app为检索范围
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
                //const tfooterHeight = tfooterDom ? tfooterDom.offsetHeight : 0
                if (num < 0) {
                    delete tableOption.y
                    this.injections.reduce("updateSfs", {
                        ["data.tableOption"]: fromJS({
                            ...tableOption,
                            x: width - 20,
                            y: height - theadDom.offsetHeight - 6, //- tfooterHeight,
                        }),
                    })
                } else {
                    tableOption.y = height - theadDom.offsetHeight //- tfooterHeight -5 //- tfooterHeight
                    if (tbodyDom.offsetHeight === 0) {
                        tableOption.y = height
                    }
                    this.injections.reduce("updateSfs", {
                        ["data.tableOption"]: fromJS({
                            ...tableOption,
                            x: width - 20,
                            y: tableOption.y,
                        }),
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
