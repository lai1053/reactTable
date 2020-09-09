import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
import StockAppCompletionWarehousing from "../components/StockAppCompletionWarehousing/StockAppCompletionWarehousing"
/*
    @params: {
         "state": 0, --状态 0未开，1开启
            "bInveControl": 0, --是否进行负库存控制 0否 1是
            "endNumSource": 0, 完工入库数据来源 0 手工 1以销定产
            "inveBusiness": 1, 1工业模式 0商业模式
            "endCostType":0, 以销定产0、传统生产1
            "isGenVoucher":true, 是否结账，未生成 false 生成 true
            "isCompletion":true,是否本月有完工入库单 有 true 没有 false
            "startPeriod": "2019-09", 启用月份
            "isCarryOverMainCost":false, 结转主营成本凭证 未生成 false 生成 true
            "isCarryOverProductCost":false, 结转生成凭证，未生成 false 生成 true
            "isProductShare":true, 是否进行成本分配，未生成 false 生成 true
            "inveBusiness",1 --1工业自行生产，0 存商业
            "enableBOMFlag",1 --是否启用BOM设置：1是；0否；
            "auxiliaryMaterialAllocationMark"1, --辅料是否分摊之BOM产品中：1是；0否；
            "isConfigureBOM":1 ,是否有配置bom 结构 1 表示有 0表示没有
            "automaticDistributionMark":1, 1为自动分配 0 为手工分配
            "isMaterial":true --本月是否领料
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
        // this.load()
    }

    renderPage = () => {
        const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        return (
            <StockAppCompletionWarehousing
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

    // 存货列表
    load = async update => {
        let mainList = [],
            code = "",
            period = "",
            res,
            numT = 0
        this.metaAction.sf("data.loading", true)
        if (update && update === "update") {
            const currentCode = this.metaAction.gf("data.others.code")
            res = await this.webapi.stock.getUpdateWipCompleteBillList({
                period: this.params.period || "",
                code: currentCode,
            }) // 存货列表
        } else {
            res = await this.webapi.stock.getWipCompleteBillList({
                period: this.params.period || "",
            }) // 存货列表
        }
        this.metaAction.sf("data.loading", false)
        if (res) {
            // 无需判断数据来源endNumSource 是以销定产还是手工，因为如果是手工的话，后端直接返回空数组列表
            if (res.billBodyDtoList && res.billBodyDtoList.length !== 0) {
                mainList = res.billBodyDtoList.map(item => {
                    item.num = (item.num && item.num) || "" // 数量
                    item.ybbalance =
                        (item.ybbalance && utils.number.format(item.ybbalance, 2)) || "" // 金额
                    return item
                })
            } else {
                mainList = this.setBlank(5)
            }
            code = res.code || "" // 单据编码
            period = res.period || "" // 生成日期
            this.id = res.id
        }
        mainList.forEach(item => {
            if (item.num) numT = this.transToNum(item.num) + numT
        })
        this.injections.reduce("updateSfs", {
            "data.list": fromJS(mainList),
            "data.numT": utils.number.format(numT, 6),
            "data.others.code": code,
            "data.others.period": period,
            // 'data.isGenVoucher': this.params.isGenVoucher,
            // 'data.isCarryOverMainCost': this.params.isCarryOverMainCost,
            // 'data.isCarryOverProductCost': this.params.isCarryOverProductCost,
            // 'data.automaticDistributionMark': this.params.automaticDistributionMark,
            "data.invSet": fromJS(this.params),
        })
        // if (!this.params.isGenVoucher) this.reqInventoryList()
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
        })
        if (inventoryList) {
            let selectOptions = this._parseSelectOption(inventoryList)
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
    // 去重
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

    // 设置空白表格
    setBlank = rowAmount => {
        const mainList = []
        const item = {
            xh: "",
            inventoryId: new Date().getTime(),
            inventoryCode: "",
            inventoryName: "",
            inventoryGuiGe: "",
            inventoryUnit: "",
            num: "",
            ybBalance: "",
        }
        for (let i = 0; i < rowAmount; i++) {
            item.inventoryId = i + 1
            mainList.push(Object.assign({}, item))
        }
        return mainList
    }

    // 帮助的图标和说明
    renderHelp = () => {
        let text = (
            <div style={{ lineHeight: "25px" }}>
                <div>材料分配系数：本期销售金额/本期销售数</div>
                <div>目的：完工产品分摊的计算依据</div>
            </div>
        )
        return HelpIcon(text, "bottomRight")
    }

    //渲染表格
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
                case "inventoryName":
                    item.render = (text, record, index) => {
                        if (!this.params.isCarryOverProductCost && !this.params.isGenVoucher) {
                            return (
                                <div className="tdChme">
                                    <SelectName
                                        key={`key-${record.inventoryId}`}
                                        className="selectName"
                                        text={text}
                                        optionList={optionList}
                                        changeCallback={v => {
                                            this.McChange(v, record.inventoryId)
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
                case "num":
                    item.render = (text, record, index) => {
                        if (!this.params.isCarryOverProductCost && !this.params.isGenVoucher) {
                            return (
                                <div>
                                    <InputWithTip
                                        format={"cash"}
                                        isError={record.numError}
                                        defaultVal={text}
                                        inputEvent={value => {
                                            this.handleInput(value, record.inventoryId, "num")
                                        }}
                                        blurEvent={value => {
                                            this.handleBlur(value, record.inventoryId, "num")
                                        }}
                                    />
                                </div>
                            )
                        } else {
                            return <div>{text}</div>
                        }
                    }
                    break
                case "matDisCof":
                    const help = this.renderHelp()
                    item.title = (
                        <div>
                            <span>材料分配系数</span>
                            {help}
                        </div>
                    )

                    item.render = (text, record, index) => {
                        if (!this.params.isCarryOverProductCost && !this.params.isGenVoucher) {
                            return (
                                <div>
                                    <InputWithTip
                                        format={"cash"}
                                        isError={record.numError}
                                        defaultVal={text}
                                        inputEvent={value => {
                                            this.handleInput(value, record.inventoryId, "matDisCof")
                                        }}
                                        blurEvent={value => {
                                            this.handleBlur(
                                                value,
                                                record.inventoryId,
                                                "matDisCof",
                                                2
                                            )
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

    // 过滤，主列表已有的存货，在存货列表中不可选
    _diffTheSame = () => {
        const optionList =
            (this.metaAction.gf("data.selectNameList") &&
                this.metaAction.gf("data.selectNameList").toJS()) ||
            []
        const mainList = this.metaAction.gf("data.list")
            ? this.metaAction.gf("data.list").toJS()
            : []
        const options = optionList.map(v => {
            v.disabled = !!this.params.isGenVoucher
            for (const item of mainList) {
                if (item.inventoryId === v.inventoryId) v.disabled = true
            }
            return v
        })
        return options
    }

    handleInput = (value, rowId, field) => {
        let list = (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        const index = list.findIndex(v => v.inventoryId === rowId)
        try {
            if (value.trim()) list[index][`${field}Error`] = false
            list[index][field] = value // 这里要注意一下
        } catch (e) {
            throw new Error(e, "handleInput")
        }
        if (field === "num") {
            let numT = 0
            list.forEach(item => {
                if (item.num) numT = this.transToNum(item.num) + numT
            })
            this.metaAction.sf("data.numT", numT)
        }
        this.injections.reduce("updateSfs", { "data.list": fromJS(list) })
    }

    handleBlur = (value, rowId, field, formatDecimal) => {
        let v = value
        let list = this.metaAction.gf("data.list").toJS()
        let midVal = formatDecimal ? utils.number.format(v, formatDecimal) : v
        const index = list.findIndex(v => v.inventoryId === rowId)
        try {
            list[index][field] = v = this.transToNum(midVal) ? midVal : ""
        } catch (e) {
            throw new Error(e, "handleBlur")
        }
        this.injections.reduce("updateSfs", {
            ["data.list"]: fromJS(list),
        })
    }

    // 商品名称改变
    McChange(v, rowId) {
        const content = JSON.parse(v)
        let list = (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        const con = { ...content } //对象字段：{inventoryCode,inventoryName,inventoryGuiGe,inventoryUnit,inventoryId}
        const idx = list.findIndex(v => v.inventoryId === rowId)
        list[idx] = con
        this.injections.reduce("updateSfs", {
            ["data.list"]: fromJS(list),
        })
    }
    // 选择更多商品
    selectMoreName = async record => {
        const selectNameList = this._diffTheSame()
        const selectOptions =
            (this.metaAction.gf("data.selectOptions") &&
                this.metaAction.gf("data.selectOptions").toJS()) ||
            []
        const con = {
            title: "存货名称选择",
            wrapClassName: "ttk-stock-card-select-warehousing-names",
            width: 950,
            style: {},
            okText: "确定",
            allowDrag: false,
            bodyStyle: {},
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
        const idx =
            mainList[index] && mainList[index].inventoryId && mainList[index].inventoryName
                ? index + 1
                : index
        const delNum =
            mainList[idx] && mainList[idx].inventoryId && mainList[idx].inventoryName ? 0 : 1
        mainList.splice(idx, delNum, ...batchSelectedRows)
        this.injections.reduce("updateSfs", { "data.list": fromJS(mainList) })
    }

    formatSixDecimal = num => {
        if (!num) return 0
        const condition = String(num).indexOf(".") > -1
        const length = condition && String(num).split(".")[1].length
        const decimalLength = condition ? (length > 6 ? 6 : length) : 0
        return utils.number.format(num, decimalLength)
    }

    renderFooterLeft = () => {
        const numT = this.metaAction.gf("data.numT") || 0
        return (
            <div>
                <span
                    className="ttk-stock-app-completion-warehousing-footer-div-span"
                    style={{ marginRight: "30px" }}>
                    入库数量：{this.formatSixDecimal(utils.number.format(numT, 6))}
                </span>
            </div>
        )
    }

    // 增加或删除行
    handleAddOrDelete = async (icon, record, id) => {
        const list = this.metaAction.gf("data.list") ? this.metaAction.gf("data.list").toJS() : []
        const index = list.findIndex(v => v.inventoryId === record.inventoryId)
        if (icon === "add") {
            const newObj = {
                xh: "",
                inventoryId: list.length + 1 + Math.random(),
                inventoryCode: undefined,
                inventoryName: "",
                inventoryGuiGe: undefined,
                inventoryUnit: undefined,
                num: undefined,
                matDisCof: undefined,
                isDisable: false,
                isSelect: false,
            }
            const newNum = parseInt(index) + 1 + Math.random()
            list.splice(newNum, 0, newObj)
            this.injections.reduce("updateSfs", { "data.list": fromJS(list) })
        } else {
            if (list.length > 1) {
                list.splice(index, 1)
                let numT = 0
                list.forEach(item => {
                    if (item.num) numT = this.transToNum(item.num) + numT
                })
                this.metaAction.sf("data.numT", numT)
            } else {
                if (list.length > 0) {
                    let firstItem = list[0]
                    firstItem = Object.assign(firstItem, {
                        inventoryCode: undefined,
                        inventoryName: "",
                        inventoryGuiGe: undefined,
                        inventoryUnit: undefined,
                        num: "",
                        matDisCof: "",
                        isDisable: false,
                        isSelect: false,
                    })
                }
                this.metaAction.sf("data.numT", 0)
                // message.destroy()
                // message.warning('最后一行，无法删除', 2)
            }
            this.metaAction.sf("data.list", fromJS(list))
        }
    }

    // 按生产入库
    handleRefresh = () => {
        Modal.confirm({
            title: "提示",
            content: "系统将以本期销售数更新完工入库记录，请确认！",
            okText: "确定",
            cancelText: "取消",
            onOk: () => {
                this.load("update")
            },
            onCancel() {},
        })
    }

    transToNum = val => {
        const num = val && parseFloat(val.toString().replace(/,/g, ""))
        return num
    }

    // 校验
    checkform = () => {
        const list = this.metaAction.gf("data.list").toJS()
        let flag = true
        let checkedList = list.filter(item => {
            if (item.inventoryId && item.inventoryCode) {
                item.inventoryId =
                    item.inventoryId != undefined && item.inventoryId != null
                        ? item.inventoryId
                        : null
                item.matDisCofError = !item.matDisCof
                item.numError = !item.num
                item.num = this.transToNum(item.num)
                item.matDisCof = this.transToNum(item.matDisCof)
                item.salesCostRate = item.salesCostRate ? this.transToNum(item.salesCostRate) : 0 //-- 销售成本率 选择以销定产才传
                item.ybbalance = item.ybbalance ? this.transToNum(item.ybbalance) : 0 //-生成成本金额 选择以销定产才传
                if (!!item.matDisCofError || !!item.numError) {
                    flag = false
                }
                return item
            }
        })

        let fullList = checkedList
        if (checkedList) {
            if (checkedList.length === 0) {
                this.metaAction.toast("warning", "完工入库单为空，不能保存")
                return
            }
        }
        this.injections.reduce("updateSfs", { "data.list": fromJS(fullList) })

        return {
            flag,
            checkedList,
        }
    }

    // 返回
    handleReturn = () => {
        this.component.props.onlyCloseContent &&
            this.component.props.onlyCloseContent("ttk-stock-app-completion-warehousing")
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
    }

    componentWillUnmount = () => {
        this[`deny-warehousing-generateVoucherClickFlag`] = null
    }

    // 保存
    handleSave = async () => {
        const canClick = denyClick(this, "deny-warehousing-generateVoucher")
        if (canClick) {
            const params = {}
            const { flag, checkedList } = this.checkform()
            if (flag) {
                params.billBodyDtoList = checkedList
                params.code = this.metaAction.gf("data.others.code")
                params.period = this.params.period || ""
                params.rkPeriod = this.metaAction.gf("data.others.period")
                params.type = "0" //产值百分比是0，销售成本率是1
                params.calculatingType = null //--计算方式 期初单价0，销售成本率1 选择以销定产才传
                let res = await this.webapi.stock.saveWipCompleteBillList({
                    billTitleDto: { ...params },
                })
                if (res === null) {
                    this.metaAction.toast("success", "保存成功!")
                    setTimeout(async () => {
                        const newInfo = await getInfo({ period: this.params.period || "" })
                        Object.assign(this.params, newInfo)
                        this.load()
                    }, 1000)
                }
            } else {
                this.metaAction.toast("error", "输入框的值不能为空")
            }
        }
    }

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
                this.component.props.onlyCloseContent &&
                    this.component.props.onlyCloseContent("ttk-stock-app-completion-warehousing")
                this.component.props.setPortalContent &&
                    this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
            }, 3000)
        } else {
        }
    }

    // 列表高度自适应浏览器大小，出现滚动条
    getTableScroll = e => {
        try {
            let tableOption = this.metaAction.gf("data.tableOption").toJS()
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
