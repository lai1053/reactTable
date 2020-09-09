import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import { FormDecorator, Input, Select, Modal, DataGrid, Button } from "edf-component"
import { Spin } from "antd"
import config from "./config"
import utils from "edf-utils"
import extend from "./extend"
import { fromJS, toJS, List, Map } from "immutable"
import { formatNumbe, formatprice, deepClone } from "./../common"
import { formatSixDecimal, transToNum, stockLoading } from "../commonAssets/js/common"
import QcBom from "./components/qcBom.js"
import { tableColumns } from "./fixedData"
const Option = Select.Option
const InputNumber = Input.Number
const colKeys2 = ["code", "name", "size", "type", "work", "number", "pices", "monery"]
import importModal, { onFileError } from "../components/common/ImportModal"
import VirtualTable from "../../invoices/components/VirtualTable/index"
import SuperSelect from "../../invoices/component/SuperSelect"
import {debounce} from '../components/common/js/util'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.extendAction = option.extendAction
        if (extend.getGridOption()) {
            this.option = extend.getGridOption()
        }
        this.config = config.current
        this.webapi = this.config.webapi
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        this.name = currentOrg.name // 导出所需公司名称字段
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        injections.reduce("init")
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        this.name = currentOrg.name
        this.firstLost = true
        // let addEventListener = this.component.props.addEventListener
        // if (addEventListener) {
        //     addEventListener('onTabFocus', this.load)
        // }
        this.load()
    }

    stockLoading = () => stockLoading()

    componentWillUnmount = () => {
        sessionStorage.removeItem(`ttk-stock-app-inventory-archievs-length-${this.name}`)
        sessionStorage.removeItem(`ttk-stock-app-inventory-isCarryOverMainCost-${this.name}`)
        sessionStorage.removeItem(`ttk-stock-app-inventory-isGenVoucher-${this.name}`)
        this.motime = null
        this.selectOptionList = null
        this.startperiod = null
        this.firstLost = null
        this.list = null
        this.isCarryOverMainCost = null
        this.isGenVoucher = null
    }

    handleTabChange = async activeKey => {
        this.metaAction.sf("data.other.activeTabKey", activeKey)
        activeKey == 1 ? this.reload() : this.reloadReq()
    }

    selectRow = rowIndex => e => {
        this.injections.reduce("selectRow", rowIndex, e.target.checked)
    }

    Import = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "存货期初导入",
            width: 600,
            footer: null,
            children: this.metaAction.loadApp("ttk-stock-inventory-earlyStage-import-card", {
                store: this.component.props.store,
                exportCompanyName: this.name,
                periodDate: this.motime,
            }),
        })
        if (ret) {
            this.reload()
        }
    }

    // 导出
    exportData = async () => {
        this.metaAction.sf("data.loading", true)
        const clsName = this.metaAction.gf("data.form.inventoryClassName")
        const inputVal = this.metaAction.gf("data.input")
        await this.webapi.operation.export({
            period: this.motime, //会计期间
            guiGe: this.name, //企业名称
            blnZanGu: true,
            name: inputVal ? inputVal : "",
            inventoryClassName: clsName ? clsName : "",
        })
        this.metaAction.sf("data.loading", false)
    }

    load = async () => {
        let activeTabKey = this.metaAction.gf("data.other.activeTabKey")
        const initData = await this.webapi.operation.initPeriod()
        if (activeTabKey == 2) {
            this.reloadReq()
        } else {
            const dataReq = this.webapi.operation.init({ period: initData.thisPeriod, opr: 0 })
            let reqList = {
                blnZanGu: activeTabKey == 1 ? false : true,
                name: this.metaAction.gf("data.name"),
                inventoryClassName: this.metaAction.gf("data.form.constom"),
            }
            this.metaAction.sf("data.loading", true)
            const qcyeReq = this.webapi.operation.initQcye(reqList),
                pdfReq = this.webapi.operation.findInventoryEnumList(),
                supplierReq = this.webapi.operation.findSupplierList({}),
                invListReq = this.webapi.operation.findInventoryList({})

            const reqData = await dataReq
            const invSetReq = this.webapi.operation.getInvSetByPeroid({
                'period': reqData.startPeriod,
            })
            this.motime = reqData.startPeriod
            const {name, xdzOrgIsStop} = this.metaAction.context.get("currentOrg")
            this.name = name
            this.startperiod = reqData.startPeriod.split("-")[0] + reqData.startPeriod.split("-")[1]
            let getInvSetByPeroid = await invSetReq
            const response = await qcyeReq
            const propertyDetailFilter = await pdfReq
            
            this.injections.reduce(
                "load",
                response,
                this.startperiod,
                propertyDetailFilter,
                getInvSetByPeroid,
                xdzOrgIsStop
            )

            this.list = response && response.length > 0 && response.length // 页面列表的长度
            this.isCarryOverMainCost = getInvSetByPeroid
                ? getInvSetByPeroid.isCarryOverMainCost
                    ? true
                    : false
                : undefined
            this.isGenVoucher = getInvSetByPeroid
                ? getInvSetByPeroid.isGenVoucher
                    ? true
                    : false
                : undefined

            this.stateNow = this.metaAction.gf("data.limit.stateNow") // 是否生成结转主营成本凭证
            const data = await supplierReq
            this.supplierList = data
            const responseData = await invListReq
            this.selectOptionList = responseData
            this.renderSelectOption(data, responseData)
            // this.metaAction.sf('data.loading', false)
        }
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    renderDatagrid = () => {
        const list =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        let cols = []
        const { Column, Cell } = DataGrid
        const { Number } = Input
        const tCellArr = [
            "inventoryCode",
            "inventoryName",
            "propertyName",
            "specification",
            "unitName",
            "price",
        ]
        const inpArr = ["num", "ybBalance"]
        const stateNow = this.metaAction.gf("data.limit.stateNow") // 是否已经结转了凭证
        if (!list) return colData
        for (let item of tableColumns) {
            const {
                name = "",
                columnKey = "",
                dataIndex = "",
                width,
                flexGrow = 1,
                title,
                className,
                align,
            } = item
            let col = (
                <Column
                    name={name}
                    width={width}
                    columnKey={columnKey}
                    flexGrow={flexGrow || 1}
                    header={
                        <Cell name="header" className={className}>
                            {" "}
                            {title}{" "}
                        </Cell>
                    }
                    cell={v => {
                        let classN = ["inventoryCode", "unitName"].includes(dataIndex)
                            ? "earlyStage-textAlignC"
                            : "earlyStage-textAlignL"
                        const txt = list[v.rowIndex][dataIndex] // 每个单元格里的值
                        const isEnable = list[v.rowIndex].isEnable
                        if (tCellArr.indexOf(dataIndex) > -1) {
                            classN = dataIndex === "price" ? `earlyStage-textAlignR` : classN
                            let contentText = typeof txt == "number" && !txt ? "" : txt
                            return (
                                <Cell name="cell" title={contentText} className={classN}>
                                    {" "}
                                    {contentText}{" "}
                                </Cell>
                            )
                        } else if (inpArr.indexOf(dataIndex) > -1) {
                            let regExp =
                                dataIndex === "ybBalance"
                                    ? "^-?([0-9]+)(?:.[0-9]{1,2})?$"
                                    : dataIndex === "num"
                                    ? "^-?([0-9]+)(?:.[0-9]{1,6})?$"
                                    : "^([0-9]+)(?:.[0-9]{1,6})?$"
                            const numType = dataIndex === "ybBalance" ? "cash" : "amount"
                            let className = dataIndex === "num" ? "earlyStage-textAlignL" : "earlyStage-textAlignR"
                            if (stateNow || isEnable === false) {
                                return (
                                    <Cell name="cell" title={txt} className={className}>
                                        {this.numberFormat(txt, numType)}
                                    </Cell>
                                )
                            } else {
                                let style = dataIndex === "num" ? {textAlign: 'left'} : {}
                                const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
                                const cell = !xdzOrgIsStop ? <Number
                                        className={`${this.getCellClassName(
                                            v.ctrlPath
                                        )} zangu-early-input`}
                                        timeout={true}
                                        tip={true}
                                        regex={regExp}
                                        style={style}
                                        value={this.numberFormat(txt, numType)}
                                        onBlur={e => {
                                            this[`${dataIndex}Change`](
                                                "data.list." + v.rowIndex,
                                                list[v.rowIndex],
                                                e
                                            )
                                        }}
                                    />
                                    :
                                    <div>{this.numberFormat(txt, numType)}</div>
                                return ( cell )
                            }
                        }
                    }}
                />
            )
            cols.push(col)
        }
        return (
            <DataGrid
                name="tabel"
                className="dataGrid"
                headerHeight={40}
                rowsCount={list.length}
                rowHeight={37}
                readonly={false}
                startSequence={1}
                onKeyDown={this.gridKeydown}
                columns={cols}
                allowResizeColumn
            />
        )
    }

    getCellClassName = path =>
        this.metaAction.isFocus(path) ? "ttk-edf-app-operation-cell editable-cell" : ""

    reload = async () => {
        let reqList = {
            blnZanGu: false,
            name: this.metaAction.gf("data.name"),
            inventoryClassName: this.metaAction.gf("data.form.constom"),
        }
        this.metaAction.sf("data.loading", true)
        const response = await this.webapi.operation.initQcye(reqList)
        this.metaAction.sf("data.loading", false)
        this.injections.reduce("reload", response)
    }

    reloadReq = async () => {
        this.metaAction.sf("data.loading", true)
        let reqList = {
            blnZanGu: true,
            name: this.metaAction.gf("data.input"),
            inventoryClassName: this.metaAction.gf("data.form.inventoryClassName"),
        }
        this.metaAction.sf("data.loading", true)
        const initBlnReq = this.webapi.operation.initBln(reqList),
            initPeriodReq = this.webapi.operation.initPeriod()

        const currentOrg = await initPeriodReq,
            findSupplierListReq = this.webapi.operation.findSupplierList({}),
            findInventoryListReq = this.webapi.operation.findInventoryList({}),
            initReq = this.webapi.operation.init({ period: currentOrg.thisPeriod, opr: 0 }),
            reqData = await initReq
        this.motime = reqData.startPeriod
        this.startperiod = reqData.startPeriod.split("-")[0] + reqData.startPeriod.split("-")[1]

        let getInvSetByPeroid = await this.webapi.operation.getInvSetByPeroid({
            'period': reqData.startPeriod,
        })
        const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        const response = await initBlnReq
        this.metaAction.sf("data.loading", false)
        this.injections.reduce("reloadReq", response, getInvSetByPeroid, xdzOrgIsStop)
        const data = await findSupplierListReq
        this.supplierList = data
        const responseData = await findInventoryListReq
        this.selectOptionList = responseData

        this.renderSelectOption(data, responseData)
        if(!this.metaAction.gf('data.tableOption').toJS().y) {
            setTimeout(() => {
                this.getTableScroll()
            }, 100)
        }
        this.metaAction.sf("data.loading", false)
    }
    getTableScroll = e => {
        let content = document.querySelector('.ttk-stock-inventory-earlyStage-content')
        let x = content.offsetWidth
        let y = content.offsetHeight
        x = x < 1060 ? 1060 : x
        this.metaAction.sf('data.tableOption', fromJS({
            x,
            y
        }))
        return
    }

    renderSelectOption = (data, data1) => {
        const arr = data.map(item => (
            <Option key={item.supplierCode} value={item.supplierId}>
                {" "}
                {item.supplierName}{" "}
            </Option>
        ))
        const arr1 = data1.map(item => {
            const { inventoryCode, inventoryName, specification, inventoryUnit } = item
            const objArr = [inventoryCode, inventoryName, specification, inventoryUnit]
            const contextText = objArr.filter(v => !!v).join("-")
            return (
                <Option width={200} key={item.id} value={item.inventoryCode} title={contextText}>
                    {contextText}
                </Option>
            )
        })
        this.selectOption = arr
        this.inventoryList = arr1
        this.supplierData = data
        this.inventoryData = data1
        this.metaAction.sf("data.other.key", Math.floor(Math.random() * 10000))
    }

    moreActionOpeate = e => {
        if (e.key == "insertProofConfirmList") {
            const id = 1
            this.insertProofConfirm(id)
        } else {
            this[e.key] && this[e.key]()
        }
    }

    settlement = async () => this.extendAction.gridAction.getSelectedInfo("dataGrid") //选中的

    onSearch = (path, data) => {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(() => {
            this.metaAction.sf(path, data)
            this.reload()
        }, 500)
    }
    onSearchReq = debounce((path, data) => {
        this.metaAction.sf(path, data)
        this.reloadReq()
    }, 500)
    filterList = () => {
        this.metaAction.sf("data.showPopoverCard", false)
        this.reload()
    }
    filterListReq = () => {
        this.metaAction.sf("data.showPopoverCardReq", false)
        this.reloadReq()
    }
    handlePopoverVisibleChange = visible => {
        if (visible) {
            const { form } = (this.metaAction.gf("data") && this.metaAction.gf("data").toJS()) || {}
            this.metaAction.sf("data.form", fromJS(form))
        }
        this.metaAction.sf("data.showPopoverCard", visible)
    }
    handlePopoverVisibleChangeReq = visible => {
        if (visible) {
            const { form } = (this.metaAction.gf("data") && this.metaAction.gf("data").toJS()) || {}
            this.metaAction.sf("data.form", fromJS(form))
        }
        this.metaAction.sf("data.showPopoverCardReq", visible)
    }
    resetForm = () => {
        this.metaAction.sf("data.form.constom", "")
    }
    resetFormReq = () => {
        this.metaAction.sf("data.form.inventoryClassName", "")
    }
    addrow = ps => {
        this.injections.reduce("addEmptyRow", ps.rowIndex + 1)
    }
    back = async () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent("存货管理", "ttk-stock-Inventory-allocation")
        this.component.props.onlyCloseContent("ttk-stock-inventory-earlyStage")
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
    moveEditCell(path, action) {
        const cellInfo = this.getCellInfo(path)
        this.moveCell(cellInfo, action, path)
    }
    moveCell(cellInfo, action, path) {
        const position = utils.matrix.move(
            cellInfo.rowCount,
            cellInfo.colCount,
            { x: cellInfo.x, y: cellInfo.y },
            action
        )
        this.focusCell({ ...cellInfo, ...position }, path)
    }
    focusCell(position, path, e) {
        this.metaAction.sfs({
            "data.other.focusFieldPath": `root.children.root-content.children.content.children.tabel.columns.${
                colKeys2[position.x]
            }.cell.cell,${position.y}`,
            "data.other.scrollToRow": position.y,
            "data.other.scrollToColumn": position.x,
        })
        setTimeout(this.cellAutoFocus, 16)
    }

    gridKeydown = e => {
        if (!this.option) return

        var path = ""

        if (
            e.keyCode == 37 ||
            e.keyCode == 39 ||
            e.keyCode == 13 ||
            e.keyCode == 108 ||
            e.keyCode == 9 ||
            e.keyCode == 38 ||
            e.keyCode == 40
        ) {
            path = utils.path.findPathByEvent(e)
            if (!path || path.indexOf(",") == -1) return
        }

        //37:左键
        if (e.keyCode == 37) {
            if (!utils.dom.cursorAtBegin(e)) return
            this.moveEditCell(path, "left")
            return
        }

        //39:右键 13:回车 108回车 tab:9
        if (e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9) {
            // 应该只有右键的时候，才会去判断光标是否已经到了文本的末端
            // 回车键、tab键不需要判断，直接切换
            if (e.keyCode == 39 && !utils.dom.cursorAtEnd(e)) return
            if (path) {
                let columnGetter = this.metaAction.gm(path)
                if (columnGetter) {
                    if (columnGetter.noTabKey == true) {
                        return
                    }
                }
            }

            this.moveEditCell(path, "right")
            return
        }

        //38:上键
        if (e.keyCode == 38) {
            this.moveEditCell(path, "up")
            return
        }

        //40:下键
        if (e.keyCode == 40) {
            this.moveEditCell(path, "down")
            return
        }
    }
    getCellInfo(path) {
        const parsedPath = utils.path.parsePath(path)
        const rowCount = this.metaAction.gf("data.list").size
        const colCount = 8
        var colKey = parsedPath.path
            .replace("root.children.root-content.children.content.children.tabel.columns.", "")
            .replace(".cell.cell", "")
            .replace(/\s/g, "")

        return {
            x: colKeys2.findIndex(o => o == colKey),
            y: Number(parsedPath.vars[0]),
            colCount,
            rowCount,
        }
    }
    // root.children.root-content.children.content.children.tabel.columns.number.cell.cell
    cellAutoFocus = () => {
        utils.dom.gridCellAutoFocus(this.component, ".editable-cell")
    }
    isFocusCell = (ps, columnKey) => {
        const focusCellInfo = this.metaAction.gf("data.other.focusCellInfo")
        if (!focusCellInfo) return false
        return focusCellInfo.columnKey == columnKey && focusCellInfo.rowIndex == ps.rowIndex
    }
    numberFocus = async e => {
        let number = e.target.value.toString().replace("-", "") //.replace('.','$#$').replace(/\./g,'').replace('$#$','.')
        return number
    }
    numChange = async (path, data, value) => {
        if (value == "") {
            data.num = ""
            if (data.ybBalance == 0 || data.ybBalance == "") {
                data.price = ""
            } else {
                if (data.price == 0 || data.price == "") {
                    data.ybBalance = ""
                }
            }
            this.injections.reduce("updateList", path, data)
            if (!data.ybBalance && !data.price && !data.num) {
                this.updateQcye(data)
            }
        } else {
            // 放开负数限制
            data.num = value
            // 放开负数限制
            if (data.ybBalance) {
                if (
                    (formatNumbe(data.num) >= 0 && formatNumbe(data.ybBalance) < 0) || // 如果数量为正，金额为负
                    (formatNumbe(data.num) < 0 && formatNumbe(data.ybBalance) >= 0) // 如果数量为负，金额为正
                ) {
                    data.ybBalance = 0 - formatNumbe(data.ybBalance) // 金额要变为正数
                }

                data.price = formatNumbe(formatNumbe(data.ybBalance) / formatNumbe(data.num), 6)
            } else {
                if (data.price) {
                    data.ybBalance = formatNumbe(formatNumbe(data.price) * formatNumbe(data.num), 2)
                }
            }
            this.injections.reduce("updateList", path, data)
            this.updateQcye(data)
        }
    }
    ybBalanceChange = async (path, data, value) => {
        if (value == "") {
            data.ybBalance = ""
            if (data.num == 0 || data.num == "") {
                data.price = ""
            } else {
                if (data.price == 0 || data.price == "") {
                    data.num = ""
                }
            }
            this.injections.reduce("updateList", path, data)
            if (!data.ybBalance && !data.price && !data.num) {
                this.updateQcye(data)
            }
        } else {
            data.ybBalance = formatNumbe(value)
            if (data.num) {
                // 情况一： 有金额和单价，算数量
                if (formatNumbe(data.ybBalance) < 0) {
                    // 如果录入的金额为负数
                    data.num = 0 - Math.abs(formatNumbe(data.num)) // 数量处理为负数
                } else {
                    // 如果金额为正数
                    if (formatNumbe(data.num) < 0) {
                        // 数量为负数
                        data.num = Math.abs(formatNumbe(data.num)) // 把数量处理为正数
                    }
                }
                data.price = formatNumbe(
                    formatNumbe(data.ybBalance) / formatNumbe(data.num)
                ).toFixed(6)
                data.price = Math.abs(data.price) // 单价处理为正数
                data.price = formatSixDecimal(data.price)
            } else {
                if (data.price) {
                    // 情况二：有金额和单价，计算数量
                    data.num = formatNumbe(formatNumbe(data.ybBalance) / formatNumbe(data.price), 6)
                }
            }
            this.injections.reduce("updateList", path, data)
            this.updateQcye(data)
        }
    }
    priceChange = async (path, data, value) => {
        if (value == "") {
            data.price = ""
            if (data.ybBalance == 0 || data.ybBalance == "") {
                data.price = ""
            } else {
                if (data.num == 0 || data.num == "") {
                    data.ybBalance = ""
                }
            }
            this.injections.reduce("updateList", path, data)
            if (!data.ybBalance && !data.price && !data.num) {
                this.updateQcye(data)
            }
        } else {
            data.price = formatprice(value)
            if (data.num) {
                data.ybBalance = formatNumbe(formatNumbe(data.price) * formatNumbe(data.num), 2)
            } else {
                if (data.ybBalance) {
                    data.num = formatNumbe(formatNumbe(data.ybBalance) / formatNumbe(data.price), 6)
                }
            }
            this.injections.reduce("updateList", path, data)
            this.updateQcye(data)
        }
    }

    updateQcye = async data => {
        if (
            (data.num && data.ybBalance && data.price) ||
            (!data.ybBalance && !data.price && !data.num)
        ) {
            data.period = this.motime
            data.num = formatNumbe(data.num)
            data.ybBalance = formatNumbe(data.ybBalance)
            data.price = formatNumbe(data.price)
            this.metaAction.sf("data.loading", true)
            const response = await this.webapi.operation.updateQcye(data)
            this.metaAction.sf("data.loading", false)
            if (response && typeof response == "string" && response.indexOf("失败") > -1) {
                const res = response.indexOf("，") > -1 ? response.split("，")[0] : response
                const tips = `${res}，不允许修改`
                this.metaAction.toast("warning", tips)
            } else {
                this.metaAction.toast("success", "保存成功")
            }
            this.reload()
        }
    }

    // 回滚11月之前版本
    handleNumberChange = (value, record, index, fieldName) => {
        //e,record,index,fieldName
        if (fieldName == "num") {
            if (value) {
                record.num = formatNumbe(value)
                if (record.ybBalance) {
                    if (
                        (formatNumbe(record.num) >= 0 && formatNumbe(record.ybBalance) < 0) || // 如果数量为正，金额为负
                        (formatNumbe(record.num) < 0 && formatNumbe(record.ybBalance) >= 0) // 如果数量为负，金额为正
                    ) {
                        record.ybBalance = 0 - Math.abs(formatNumbe(record.ybBalance)) // 金额要变为正数
                    }
                    // record.price = formatNumbe(formatNumbe(record.ybBalance) / formatNumbe(record.num), 6)
                    record.price = formatSixDecimal(
                        formatNumbe(record.ybBalance) / formatNumbe(record.num)
                    )
                } else {
                    if (record.price) {
                        record.ybBalance = formatNumbe(
                            formatNumbe(record.price) * formatNumbe(record.num),
                            2
                        )
                    }
                }
                const row = this.recordFormat({ ...record })
                this.injections.reduce("updateList", "data.reqList." + index, row)
                // this.injections.reduce('updateList', 'data.reqList.' + index, record)
            } else {
                record.num = 0
                record.price = 0
                record.ybBalance = 0
                this.injections.reduce("updateList", "data.reqList." + index, record)
            }
        } else if (fieldName == "ybBalance") {
            if (value) {
                record.ybBalance = formatNumbe(value, 2)

                if (record.num) {
                    // 情况一： 有金额和数量，算单价
                    if (formatNumbe(record.ybBalance) < 0) {
                        // 如果录入的金额为负数
                        record.num = 0 - Math.abs(formatNumbe(record.num)) // 数量处理为负数
                    } else {
                        // 如果金额为正数
                        if (formatNumbe(record.num) < 0) {
                            // 数量为正数
                            record.num = Math.abs(formatNumbe(record.num)) // 把数量处理为正数
                        }
                    }
                    record.price = formatNumbe(
                        formatNumbe(record.ybBalance) / formatNumbe(record.num)
                    ).toFixed(6)
                    record.price = Math.abs(record.price) // 单价处理为正数
                    record.price = formatSixDecimal(record.price)
                } else {
                    if (record.price) {
                        // 情况二：有金额和单价，计算数量
                        record.num = formatSixDecimal(
                            formatNumbe(formatNumbe(record.ybBalance) / formatNumbe(record.price))
                        )
                    }
                }

                const row = this.recordFormat({ ...record })
                this.injections.reduce("updateList", "data.reqList." + index, row)
                // this.injections.reduce('updateList', 'data.reqList.' + index, record)
            } else {
                record.num = 0
                record.price = 0
                record.ybBalance = 0
                this.injections.reduce("updateList", "data.reqList." + index, record)
            }
        } else {
            if (value) {
                record.price = formatprice(value)
                if (record.num) {
                    record.ybBalance = formatNumbe(
                        formatNumbe(record.price) * formatNumbe(record.num),
                        2
                    )
                } else {
                    if (record.ybBalance) {
                        record.num = formatSixDecimal(
                            formatNumbe(formatNumbe(record.ybBalance) / formatNumbe(record.price))
                        )
                    }
                }
                const row = this.recordFormat({ ...record })
                // this.injections.reduce('updateList', 'data.reqList.' + index, record)
                this.injections.reduce("updateList", "data.reqList." + index, row)
            } else {
                record.num = 0
                record.price = 0
                record.ybBalance = 0
                this.injections.reduce("updateList", "data.reqList." + index, record)
            }
        }
        this.savereqList(record)
    }

    recordFormat = record => {
        record.num = formatSixDecimal(transToNum(record.num))
        record.price = formatSixDecimal(transToNum(record.price))
        record.ybBalance = utils.number.format(transToNum(record.ybBalance), 2)
        return { ...record }
    }

    /* （未结转生产成本凭证）暂估期初列表单元格渲染 */
    renderTotalAmount = (text, record, index, fieldName) => {
        if (fieldName == "num" || fieldName == "ybBalance") {
            text = transToNum(text)
            text = !text
                ? ""
                : fieldName == "num" || fieldName == "price"
                ? formatSixDecimal(text)
                : utils.number.format(text, 2)

            let holder =
                fieldName == "num"
                    ? "请输入数量"
                    : fieldName == "price"
                    ? "请输入单价"
                    : "请输入金额"
            let regExp =
                fieldName == "ybBalance"
                    ? "^-?([0-9]+)(?:.[0-9]{1,2})?$"
                    : fieldName == "num"
                    ? "^-?([0-9]+)(?:.[0-9]{1,6})?$"
                    : "^([0-9]+)(?:.[0-9]{1,6})?$"
            let style = fieldName == "num" ? {textAlign: 'left'} : {}
            const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
            const cell = !xdzOrgIsStop ? <InputNumber
                regex={regExp}
                className="amount"
                value={text}
                placeholder={holder}
                readonly
                style={style}
                onBlur={e => this.handleNumberChange(e, record, index, fieldName)}
            /> 
            : 
            <div>{text}</div>
            return (cell)
        } else {
            let classStyle = ""
            const contentTxt = transToNum(text) ? text : ""
            if (fieldName == "price") {
                text = contentTxt
                text = (text && formatSixDecimal(text)) || ""
                classStyle = "amount"
            }
            return <span className={classStyle}>{text}</span>
        }
    }

    /* （已结转生产成本凭证）暂估期初列表单元格渲染 */
    renderTotalAmountlist = (text, record, index, fieldName) => {
        if (fieldName == "supplierName") {
            let supplierName = ""
            let target = this.supplierList.find(el => el.supplierId == text)
            target && (supplierName = target.supplierName)
            return (
                <span className="after-production-cost" title={supplierName}>
                    {supplierName}
                </span>
            )
        }
        if (fieldName == "num" || fieldName == "price") {
            const txt = formatSixDecimal(text, 6)
            return (
                <span className="after-production-cost" title={txt}>
                    {txt}
                </span>
            )
        } else if (fieldName == "ybBalance") {
            const ybBalance = utils.number.format(transToNum(text), 2)
            return (
                <span className="after-production-cost" title={ybBalance}>
                    {ybBalance}
                </span>
            )
        } else {
            const content = typeof text === "number" ? utils.number.format(text, 2) : text
            return (
                <span className="after-production-cost" title={content}>
                    {content}
                </span>
            )
        }
    }

    // 回滚11月之前版本
    onFieldChange = (index, value, record, fieldName) => {
        if (fieldName == "inventoryName") {
            let target = this.selectOptionList.find(el => el.inventoryCode == value)
            record.inventoryId = target.inventoryId
            record.code = target.inventoryCode
            record.inventoryName = target.inventoryName
            record.guige = target.inventoryGuiGe
            record.unit = target.inventoryUnit
        } else if (fieldName == "supplierName") {
            // 暂时解决 先选择存货，后选择供应商，会清空存货数据bug
            // const stateRecord = this.metaAction.gf("data.reqList").toJS()[index]
            const stateRecord = this.metaAction.gf("data.reqList").get(index).toJS()
            record = { ...record, ...stateRecord }
            record.supplierName = value
            record.supplierId = value
        }
        // this.injections.reduce('updateList', `data.reqList[${index}]`, record)
        this.injections.reduce("updateList", "data.reqList." + index, { ...record })
        this.savereqList({ ...record })
    }
    savereqList = async data => {
        if (data.inventoryName && data.supplierId) {
            if (data.id) {
                if (
                    (data.num && data.ybBalance && data.price) ||
                    (!data.num && !data.ybBalance && !data.price)
                ) {
                    let reqliat = {
                        ...data,
                        inventoryId: data.inventoryId,
                        blnZanGu: 1,
                        period: this.motime,
                        num: formatNumbe(data.num),
                        bHasSave: data.id ? true : false,
                        price: formatNumbe(data.price),
                        ybBalance: formatNumbe(data.ybBalance),
                        supplierId: data.supplierId,
                    }
                    if (data.id) {
                        reqliat.id = data.id
                    }
                    const response = await this.webapi.operation.updateQcye(reqliat)
                    this.metaAction.sf("data.loading", false)
                    if (response) {
                        this.metaAction.toast("success", "保存成功")
                    }
                    this.reloadReq()
                }
            } else {
                if (typeof data.num === "number" && data.num == 0) {
                    this.metaAction.toast("error", "新增数据数量、单价、金额不能为空")
                    return false
                } else if (data.num && data.ybBalance && data.price) {
                    let reqliat = {
                        ...data,
                        inventoryId: data.inventoryId,
                        blnZanGu: 1,
                        period: this.motime,
                        num: formatNumbe(data.num),
                        bHasSave: data.id ? true : false,
                        price: formatNumbe(data.price),
                        ybBalance: formatNumbe(data.ybBalance),
                        supplierId: data.supplierId,
                    }
                    if (data.id) {
                        reqliat.id = data.id
                    }
                    const response = await this.webapi.operation.updateQcye(reqliat)
                    this.metaAction.sf("data.loading", false)
                    if (response) {
                        this.metaAction.toast("success", "保存成功")
                    }
                    this.reloadReq()
                }
            }
        }
    }
    filterIndustryinventory = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }
    filterIndustry = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }

    toggleSelect = (type, index, flag) => (e) => {
        let path
        type == 'inventory' ? (path = 'inventoryIsEdit') : (path = 'supplierIsEdit')
        let reqList = this.metaAction.gf("data.reqList")
        reqList.setIn([index, path], flag)
        this.metaAction.sf(`data.reqList.${index}.${path}`, flag)
        if(flag) {
            let timer = setInterval(() => {
                if(this.inventoryRef || this.supplierRef) {
                    clearInterval(timer)
                    timer = null
                    try {
                        type == 'inventory' ? 
                        this.inventoryRef._reactInternalFiber.firstEffect.stateNode.click() :
                        this.supplierRef._reactInternalFiber.firstEffect.stateNode.click()
                    } catch(err) {
                        type == 'inventory' ? this.inventoryRef.focous() : this.supplierRef.focous()
                    }
                    
                }
            }, 50)
        }
    }

    getDepartmentProject = (text, record, index, fieldName) => {
        let reqList = this.metaAction.gf("data.reqList")
        const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        let value = ""
        if (fieldName == "inventoryName") {
            value = reqList.getIn([index, "inventoryName"])
            let isEdit = reqList.getIn([index, "inventoryIsEdit"])
            const cell = !xdzOrgIsStop ? 
                (
                    <React.Fragment>
                        {
                            isEdit ?
                            <SuperSelect
                                style={{ width: "100%" }}
                                value={value ? value : undefined}
                                placeholder="请选择存货"
                                showSearch
                                dropdownMatchSelectWidth={false}
                                dropdownClassName="selectNameDivDropdown"
                                dropdownStyle={{ width: "auto" }}
                                onChange={vv => this.onFieldChange(index, vv, record, fieldName)}
                                optionFilterProp="children"
                                filterOption={this.filterIndustryinventory}
                                onBlur={this.toggleSelect('inventory', index, false)}
                                autoExpand={true} autofocus
                                ref={node => (this.inventoryRef = node)}
                            >
                                {this.inventoryList}
                            </SuperSelect> :
                            <div className='instead-select'
                             onClick={this.toggleSelect('inventory', index, true)}
                            >
                                {value ? value : <span style={{color: '#d6d6d6'}}>请选择存货</span>}
                                <span className='ant-select-arrow'></span>
                            </div>
                        }
                    </React.Fragment>
            ) :
            <div>{value}</div>
            return (cell)
        } else {
            value = reqList.getIn([index, "supplierName"])
            let isEdit = reqList.getIn([index, "supplierIsEdit"])
            let name = this.supplierData.find(el => text == el.supplierId)
            name ? name = name.supplierName : name = ''
            const cell2 = !xdzOrgIsStop ? 
                (
                    <React.Fragment>
                        {
                            isEdit ?
                            <SuperSelect
                                style={{ width: "100%" }}
                                value={value ? value : undefined}
                                showSearch="true"
                                placeholder="请选择供应商"
                                onChange={v => this.onFieldChange(index, v, record, fieldName)}
                                optionFilterProp="children"
                                filterOption={this.filterIndustry}
                                onBlur={this.toggleSelect('supplier', index, false)}
                                autoExpand={true} autofocus
                                ref={node => (this.supplierRef = node)}
                            >
                                {this.selectOption}
                            </SuperSelect> :
                            <div className='instead-select' 
                              onClick={this.toggleSelect('supplier', index, true)}
                            >
                                { value ? name : <span style={{color: '#d6d6d6'}}>请选择供应商</span> }
                                <span className='ant-select-arrow'></span>
                            </div>
                        }
                    </React.Fragment>
            ) :
            <div>{name}</div>
            return ( cell2 )
        }
    }
    // 渲染列
    renderColumns = () => {
        const columns =
            (this.metaAction.gf("data.columnData") &&
                this.metaAction.gf("data.columnData").toJS()) ||
            [] //header
        let stateNow = this.metaAction.gf("data.limit.stateNow") //header
        const arr = []
        if (stateNow) {
            columns.forEach((item, index) => {
                if (item.isVisible) {
                    if (item.children) {
                        const child = [] // 多表头
                        let col
                        item.children.forEach(subItem => {
                            if (subItem.isSubTitle) {
                                child.push({
                                    title: subItem.caption,
                                    className: subItem.class,
                                    dataIndex: subItem.fieldName,
                                    key: subItem.fieldName,
                                    width: subItem.width ? subItem.width : "",
                                    flexGrow: subItem.flexGrow,
                                    align: subItem.align,
                                    minWidth: subItem.minWidth,
                                    render: (text, record, index) => {
                                        return this.renderTotalAmountlist(
                                            text,
                                            record,
                                            index,
                                            subItem.fieldName
                                        )
                                    },
                                })
                            }
                        })
                        arr.push({
                            title: item.caption,
                            align: item.align,
                            children: child,
                            flexGrow: item.flexGrow,
                        })
                    }
                }
            })
        } else {
            columns.forEach((item, index) => {
                if (item.isVisible) {
                    if (item.children) {
                        const child = [] // 多表头
                        let col
                        item.children.forEach(subItem => {
                            if (subItem.isSubTitle) {
                                child.push({
                                    title: subItem.caption,
                                    className: subItem.class,
                                    dataIndex: subItem.fieldName,
                                    key: subItem.fieldName,
                                    width: subItem.width ? subItem.width : "",
                                    flexGrow: subItem.flexGrow,
                                    align: subItem.align,
                                    minWidth: subItem.minWidth,
                                    render: (text, record, index) => {
                                        if(record.isEnable === false) {
                                            return this.renderTotalAmountlist(
                                                text,
                                                record,
                                                index,
                                                subItem.fieldName
                                            )
                                        }
                                        if (
                                            subItem.fieldName == "inventoryName" ||
                                            subItem.fieldName == "supplierName"
                                        ) {
                                            return this.getDepartmentProject(
                                                text,
                                                record,
                                                index,
                                                subItem.fieldName
                                            )
                                        } else {
                                            return this.renderTotalAmount(
                                                text,
                                                record,
                                                index,
                                                subItem.fieldName
                                            )
                                        }
                                    },
                                })
                            }
                        })
                        arr.push({
                            title: item.caption,
                            align: item.align,
                            flexGrow: item.flexGrow,
                            children: child,
                        })
                    }
                }
            })
        }
        return arr
    }

    // 表格checkbox事件
    rowSelection = () => {
        let selectedRowKeys = this.metaAction.gf('data.tableCheckbox').toJS().checkboxValue
        return {
            selectedRowKeys,
            columnWidth: 60,
            onChange: (selectedRowKeys, record, checked) => {
                this.injections.reduce("update", {
                    path: "data.tableCheckbox",
                    value: {
                        checkboxValue: selectedRowKeys,
                        selectedOption: [],
                    },
                })
            },
        }
    }

    renderZgTable = () => {
        let list = this.metaAction.gf('data.reqList').toJS(), 
            tableOption = this.metaAction.gf('data.tableOption').toJS(),
            columns = this.renderColumns()

        return (
            <VirtualTable
                className='ttk-stock-inventory-earlyStage-ZgTable'
                dataSource={list}
                scroll={{ y: tableOption.y - 78, x: tableOption.x + 2 }}
                bordered
                rowKey="voucherId"
                width={tableOption.x}
                height={tableOption.y}
                rowSelection={this.rowSelection()}
                columns={columns}
                headerHeight={78}
                allowResizeColumn
            />
        )
    }

    addzangu = async () => {
        let list = this.metaAction.gf("data.reqList")
        list = list.push(fromJS({
            voucherId: list.size + 1,
            code: "",
            inventoryName: "",
            num: "",
            price: "",
            ybBalance: "",
            guige: "",
            unit: "",
            supplierName: "",
        }))
        this.metaAction.sf("data.reqList", list)
    }
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
    }
    clean = async () => {
        const ret = await this.metaAction.modal("confirm", {
            title: "提示",
            width: 400,
            bodyStyle: { padding: 24, fontSize: 12 },
            content: (
                <div style={{ margin: "0 auto", overflow: "hidden" }}>
                    <div style={{ color: "#515151", fontSize: "14px", lineHeight: "20px" }}>
                        <p style={{ marginBottom: "20px" }}>将清除目前己录入的初始数据（非停用存货），请确认！</p>
                    </div>
                </div>
            ),
        })
        if (ret) {
            this.metaAction.sf("data.loading", true)
            let data = {
                period: this.motime,
                blnZanGu: 0,
            }
            const response = await this.webapi.operation.cleanQcye(data)
            this.metaAction.sf("data.loading", false)
            this.metaAction.toast("success", "清空成功")
            this.reload()
            return false
        } else {
            return false
        }
    }

    cleanTip = async () => {
        const ret = await this.metaAction.modal("confirm", {
            title: "提示",
            width: 400,
            bodyStyle: { padding: 24, fontSize: 12 },
            content: (
                <div style={{ margin: "0 auto", overflow: "hidden" }}>
                    <div style={{ color: "#515151", fontSize: "14px", lineHeight: "20px" }}>
                        <p style={{ marginBottom: "20px" }}>删除所勾选暂估期初数据（非停用存货），请确认！</p>
                    </div>
                </div>
            ),
        })
        return ret
    }
    delect = async () => {
        let orgids =
            (this.metaAction.gf("data.tableCheckbox.checkboxValue") &&
                this.metaAction.gf("data.tableCheckbox.checkboxValue").toJS()) ||
            []

        // let reqList =
        //     (this.metaAction.gf("data.reqList") && this.metaAction.gf("data.reqList").toJS()) || []
        if (!orgids.length) {
            this.metaAction.toast("error", "请选择数据")
            return false
        } else {
            let res = await this.cleanTip()
            if(!res) return
            let reqList = this.metaAction.gf("data.reqList")
            let arr = []
            // reqList.forEach((item, index) => {
            //     orgids.forEach(data => {
            //         if (data == item.voucherId && item.id && item.isEnable) {
            //             arr.push(item.id)
            //         }
            //     })
            // })
            orgids.forEach(el => {
                let item = reqList.get(el - 1).toJS()
                if(item.id && item.isEnable) {
                    arr.push(item.id)
                }
            })
            if (arr.length == 0) {
                // reqList.forEach((item, index) => {
                //     let falg = false
                //     orgids.forEach(data => {
                //         if (data == item.voucherId) {
                //             falg = true
                //         }
                //     })
                //     if (falg == false || item.isEnable === false) {
                //         arr.push(item)
                //     }
                // })
                
                let newList = reqList.filter((el) => {
                    let voucherId = el.get('voucherId'), isEnable = el.get('isEnable')
                    return !orgids.includes(voucherId) || isEnable === false
                })

                this.metaAction.sf("data.reqList", newList)
                this.injections.reduce("update", {
                    path: "data.tableCheckbox",
                    value: {
                        checkboxValue: [],
                        selectedOption: [],
                    },
                })
            } else {
                this.metaAction.sf("data.loading", true)
                const response = await this.webapi.operation.deleteQcye({
                    ids: JSON.stringify(arr),
                })
                this.metaAction.sf("data.loading", false)
                if (response) {
                    this.metaAction.toast("success", "删除成功")
                }
                this.injections.reduce("update", {
                    path: "data.tableCheckbox",
                    value: {
                        checkboxValue: [],
                        selectedOption: [],
                    },
                })
                this.reloadReq()
            }
        }
    }

    numberFormat = (value, type) => {
        let number = value
        if (number) {
            if (number.constructor == String) {
                number = number.replace(/,/g, "")
            }
            number = parseFloat(number)
            number = type === "cash" ? utils.number.format(number, 2) : formatSixDecimal(number)
        } else {
            number = ""
        }
        return number
    }

    // quantityFormat = (quantity, decimals, isFocus) => {
    //  if (quantity) {
    //      return formatNumbe(quantity,decimals)
    //  }
    // }

    showModal = async () => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        const list =
            (this.metaAction.gf("data.initialList") &&
                this.metaAction.gf("data.initialList").toJS()) ||
            []
        let queryData = {
            orgId: currentOrg.id, //--企业id，必填
            natureOfTaxpayers: currentOrg.vatTaxpayer, //--纳税人性质，必填
            queryType: 1, // 0：全部；1：期初
            period: this.motime,
            diff: 0, // 0：全部；1有差额；2无差额
        }
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if(modalWidth > 1920) { modalWidth = 1920 }
        Modal.show({
            title: <span style={{ fontWeight: 700 }}>存货与总账对账表</span>,
            // width: 835,
            width: modalWidth,
            height: modalHeight,
            footer: null,
            style: { top: 25 },
            bodyStyle: {
                height: modalHeight - 47 + "px",
                // maxHeight: modalHeight - 102 + 'px',
                overflow: 'auto',
            },
            children: (
                // <div style={{ height: "490px" }}>
                <div style={{ height: "100%" }}>
                    <QcBom queryData={queryData} list={list} bodyHeight={modalHeight - 47} />
                </div>
            ),
        })
    }

    // 期初导入
    qcDataImport = () => {
        importModal({
            title: "暂估期初导入",
            tip: [
                "导出暂估期初模板",
                "针对暂估期初数据进行补充",
                "导入补充后的暂估期初数据",
                "暂不支持在模板中新增模板外的存货数据",
            ],
            export: this.qcDataExport,
            import: this.qcDataUpload,
        })
    }

    // 期初导出
    qcDataExport = async () => {
        await this.webapi.operation.templateExport({
            period: this.motime, //会计期间
            supplierName: this.name, //企业名称
        })
    }

    // 导入到数据库
    qcDataUpload = async info => {
        const res = await this.webapi.operation.uploadFile({
            period: this.motime,
            id: info.id,
            // "fileName": info.originalName,
            // "fileSuffix": info.suffix,
            // "fileSize": info.size,
            // "operator": sessionStorage['username']
        })

        if (res && res.stateCode == 1) {
            return await onFileError({
                confirm: data => {
                    window.open(data)
                },
                params: res.message,
            })
        }
        this.reloadReq()
        return true
    }
}
export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}


