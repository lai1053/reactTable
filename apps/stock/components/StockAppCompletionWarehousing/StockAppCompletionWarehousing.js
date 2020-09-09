import React, { PureComponent, Fragment } from "react"
import { Button, DatePicker } from "edf-component"
import { Icon, Modal } from "antd"
import { moment as utilsMoment, number as utilsNumber } from "edf-utils"
import SelectName from "../SelectName"
import AddDeleteIcon from "../AddDeleteIcon"
import InputWithTip from "../InputWithTip"
import { warehouseingTable } from "./common/staticField"
import { 
    getInfo, 
    HelpIcon, 
    stockLoading, 
    canClickTarget, 
    formatSixDecimal, 
    transToNum,
    numFixed 
} from "../../commonAssets/js/common"
import moment from "moment"
import VirtualTable from "../../../invoices/components/VirtualTable"
import PrintButton from "../common/PrintButton"

const { stringToMoment } = utilsMoment

export default class StockAppCompletionWarehousing extends PureComponent {
    constructor(props) {
        super(props)
        const dom = document.querySelector(".ttk-stock-app-completion-warehousing")
        this.shortcutsClass = "shortcuts-container-" + new Date().valueOf()
        this.state = {
            loading: false,
            invSet: {}, // 传入的参数
            tableOption: {
                x: (dom && dom.offsetWidth - 10) || 1500,
                y: 600,
            },
            xdzOrgIsStop: props.xdzOrgIsStop,   // 该客户是否停用
            others: {
                code: "",                       // 页面显示的单据编号
                btnText: "更新入库数",
                delBtn: "删除",
                period: "",                     // 页面显示的会计期间
            },  
            list: [],                           // 列表数据
            selectNameList: [],                 // 存货名称(科目)
            // numT: 0,                            // 显示在页面底部的“入库数”
        }
        this.component = props.component || {}
        this.metaAction = props.metaAction || {}
        this.webapi = props.webapi || {}
        this.params = props.params || {} // 传入的参数
    }

    // 页面初始化
    load = async update => {
        let mainList = [],
            code = "",   // 单据编号
            res,
            originData,  // 接口返回的原始数据
            // numT = 0,    // 入库数
            rkPeriod     // 入库日期
        this.setState({ loading: true })
        const{isGenVoucher, period, isCarryOverMainCost} = this.params || {}

        if (update === "update") {
            const currentCode = this.state.others.code
            originData = res = await this.webapi.stock.getUpdateWipCompleteBillList({
                'period': period || "",  // 必传，会计期间
                'code': currentCode,     // 必传，单据编号
                'rkPeriod': this.state.others.rkPeriod,  // 入库日期
                'isGenVoucher': isGenVoucher,   // 是否已经结账
                'isCarryOverMainCost': isCarryOverMainCost
            }) 
            rkPeriod = this.state.others.rkPeriod || "" 
       
        } else {
            originData = res = await this.webapi.stock.getWipCompleteBillList({
                'period': this.params.period || "",
                'isGenVoucher': isGenVoucher,
                'isCarryOverMainCost': isCarryOverMainCost
            }) 
            rkPeriod = res.period || ""
        }

        if (res) {
            // 无需判断数据来源endNumSource 是以销定产还是手工，因为如果是手工的话，后端直接返回空数组列表
            if (res.billBodyDtoList && res.billBodyDtoList.length !== 0) {
                mainList = res.billBodyDtoList.map(item => {
                    item.num = (item.num && item.num) || "" // 数量
                    item.ybbalance = (item.ybbalance && utilsNumber.format(item.ybbalance, 2)) || "" // 金额
                    return item
                })
            } else {
                mainList = this.setBlank(5)
            }
            code = res.code || "" // 单据编码
            this.id = res.id
            if (!rkPeriod) {
                rkPeriod = moment(this.params.period || "")
                    .startOf("month")
                    .format("YYYY-MM-DD")
            }
        }
        // // 累计算出入库数
        // mainList.forEach(item => {
        //     if (item.num) numT = transToNum(item.num) + numT
        // })

        const isReadOnly = this.isReadOnly()

        this.setState({
            loading: false,
            list: mainList,
            // numT: utilsNumber.format(numT, 6),
            invSet: this.params,
            others: {
                ...this.state.others,
                code,
                period,
                rkPeriod,
            },
            isReadOnly,
            originData: res
        })

        this.reqInventoryList()
        this.getTableScroll()
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

    // 请求存货科目
    reqInventoryList = async () => {
        let inventoryList = await this.webapi.stock.getInventoryTypesFromArchives({
            period: this.params.period || "",
            serviceCode: "WGRK",
            name: "",
        })
        if (inventoryList) {
            let selectOptions = this._parseSelectOption(inventoryList)
            this.setState({
                selectNameList: inventoryList,
                selectOptions: selectOptions,
            })
        } else {
            this.metaAction.toast("error", inventoryList.message)
        }
    }
    // 去重--筛出存货类型
    _parseSelectOption = data => {
        const obj = {},
            selectOptions = [
                { inventoryClassId: "", inventoryClassName: "全部", isCompletion: false },
            ]
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
        try {
            let tableOption = this.state.tableOption
            const dom = document.querySelector(".ttk-stock-app-completion-warehousing")
            //ReactDOM.findDOMNode(this)
            if (dom) {
                this.setState({
                    tableOption: {
                        ...tableOption,
                        x: dom.offsetWidth - 10,
                        y: dom.offsetHeight - 114 - 38 + 5, //- tfooterHeight,
                    },
                })
            }
        } catch (err) {}
    }

    // ---- load逻辑完结 ----

    // 渲染表格
    renderColumns = () => {
        let optionList = this._diffTheSame()  
        const isReadOnly = this.isReadOnly()
        const columns = warehouseingTable.map(col => {
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
                case "inventoryName":
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
                        if (!isReadOnly) {
                            return (
                                <div className="edited-cell">
                                    <InputWithTip
                                        className="editable-cell-value-wrap"
                                        format={"amount"}
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
                        if (!isReadOnly) {
                            return (
                                <div className="edited-cell">
                                    <InputWithTip
                                        className="editable-cell-value-wrap"
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
        const optionList = this.state.selectNameList || []
        const mainList = this.state.list || []
        const options = optionList.map(v => {
            v.disabled = !!this.params.isGenVoucher
            for (const item of mainList) {
                if (item.inventoryId === v.inventoryId) v.disabled = true
            }
            return v
        })
        return options
    }

    // 增加或删除行
    handleAddOrDelete = async (icon, record, id) => {
        const list = this.state.list || []
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
            this.setState({ list: [...list] })

        } else {
            if (list.length > 1) {
                list.splice(index, 1)
                // let numT = 0
                // list.forEach(item => {
                //     if (item.num) numT = transToNum(item.num) + numT
                // })
                // this.setState({ numT })
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
                // this.setState({ numT: 0 })
            }
            this.setState({ list: [...list] })
        }
    }

    // 商品名称改变
    McChange(v, rowId) {
        const content = JSON.parse(v)
        let list = this.state.list || []
        const con = { ...content } //对象字段：{inventoryCode,inventoryName,inventoryGuiGe,inventoryUnit,inventoryId}
        const idx = list.findIndex(v => v.inventoryId === rowId)
        list[idx] = con
        this.setState({ list: [...list] })
    }

    // 选择更多商品
    selectMoreName = async record => {
        const selectNameList = this._diffTheSame()
        const selectOptions = this.state.selectOptions
        const con = {
            title: "存货名称选择",
            width: 950,
            height: 520,
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
        const idx =
            mainList[index] && mainList[index].inventoryId && mainList[index].inventoryName
                ? index + 1
                : index
        const delNum =
            mainList[idx] && mainList[idx].inventoryId && mainList[idx].inventoryName ? 0 : 1
        mainList.splice(idx, delNum, ...batchSelectedRows)
        this.setState({ list: [...mainList] })
    }

    // 输入框的输入事件
    handleInput = (value, rowId, field) => {
        let list = this.state.list || []
        const index = list.findIndex(v => v.inventoryId === rowId)
        try {
            if (value.trim()) list[index][`${field}Error`] = false
            list[index][field] = value // 这里要注意一下
        } catch (e) {
            throw new Error(e, "handleInput")
        }
        // if (field === "num") {
        //     let numT = 0
        //     list.forEach(item => {
        //         if (item.num) numT = transToNum(item.num) + numT
        //     })
        //     this.setState({ numT })
        // }
        this.setState({ list: [...list] })
    }

    
    handleBlur = (value, rowId, field, formatDecimal) => {
        let v = value
        let list = this.state.list || []
        let midVal = formatDecimal ? utilsNumber.format(v, formatDecimal) : v
        const index = list.findIndex(v => v.inventoryId === rowId)
        try {
            list[index][field] = v = transToNum(midVal) ? midVal : ""
        } catch (e) {
            throw new Error(e, "handleBlur")
        }
        this.setState({ list: [...list] })
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

    // ----列表相关方法完结----

    // 保存
    handleSave = async (event) => {
        event.stopPropagation && event.stopPropagation()
        event.nativeEvent.stopPropagation && event.nativeEvent.stopPropagation()
        const hasClick = canClickTarget.getCanClickTarget('completionSave')  // 防止重复点击
        if(!hasClick){
            const params = {}
            const { flag, checkedList } = this.checkform()
            if (flag) {
                params.billBodyDtoList = checkedList
                params.code = this.state.others.code
                params.period = this.params.period || ""
                params.rkPeriod = this.state.others.rkPeriod
                params.type = "0" //产值百分比是0，销售成本率是1
                params.calculatingType = null //--计算方式 期初单价0，销售成本率1 选择以销定产才传
                
                canClickTarget.setCanClickTarget('completionSave', true)
                let res = await this.webapi.stock.saveWipCompleteBillList({ billTitleDto: params })
                if (res === null) {
                    this.metaAction.toast("success", "保存成功!")
                    let timer = setTimeout(async () => {
                        clearTimeout(timer)
                        const newInfo = await getInfo({ period: this.params.period || "" })
                        Object.assign(this.params, newInfo)
                        this.load()
                    }, 1000)
                }
                canClickTarget.setCanClickTarget('completionSave', false)

            } else {
                this.metaAction.toast("error", "输入框的值不能为空")
            }
        }
    }

    // 校验
    checkform = () => {
        const list = this.state.list
        let flag = true
        let checkedList = list.filter(item => {
            if (item.inventoryId && item.inventoryCode) {
                item.inventoryId =
                    item.inventoryId != undefined && item.inventoryId != null
                        ? item.inventoryId
                        : null
                item.matDisCofError = !item.matDisCof  // 百分比未填写
                item.numError = !item.num              // 销售数量未填写
                item.num = transToNum(item.num)
                item.matDisCof = transToNum(item.matDisCof)
                item.salesCostRate = item.salesCostRate ? transToNum(item.salesCostRate) : 0 //-- 销售成本率 选择以销定产才传
                item.ybbalance = item.ybbalance ? transToNum(item.ybbalance) : 0 //-生成成本金额 选择以销定产才传
                if (!!item.matDisCofError || !!item.numError) {
                    flag = false   
                }
                return item
            }
        })

        let fullList = checkedList
        if (checkedList && !checkedList.length) {
            this.metaAction.toast("warning", "完工入库单为空，不能保存")
            return
        }
        this.setState({ list: [...fullList] })

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

    // 删除入库单
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
            let timer = setTimeout(() => {
                clearTimeout(timer)
                this.component.props.onlyCloseContent &&
                    this.component.props.onlyCloseContent("ttk-stock-app-completion-warehousing")
                this.component.props.setPortalContent &&
                    this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
            }, 3000)
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

    /* 只读 ，如果已结账、或已经生成生产成本凭证，或已经结转出库成本，或者该客户已经停用，那么页面为只读状态*/
    isReadOnly = () => {
        const { isGenVoucher, isCarryOverProductCost, isCarryOverMainCost } = this.params
        const {xdzOrgIsStop} = this.state
        return isGenVoucher || isCarryOverProductCost || isCarryOverMainCost || xdzOrgIsStop
    }

    // ----其他操作完结----

    componentDidMount() {
        this.load()
    }

    render() {
        const { loading, others, invSet, tableOption, list, isReadOnly, xdzOrgIsStop} = this.state
        const numT = list.reduce((total, item)=>{
            total = numFixed(total+transToNum(item.num), 6)
            return total 
        }, 0)
        return (
            <Fragment>
                {loading && <div className="ttk-stock-app-spin">{stockLoading()}</div>}
                <div className="ttk-stock-app-completion-warehousing-header">
                    <div className="ttk-stock-app-completion-warehousing-header-others">
                        <div className="ttk-stock-app-completion-warehousing-header-others-left">
                            { !xdzOrgIsStop && <span className="back-btn" onClick={this.handleReturn}/> }
                            <span className={!xdzOrgIsStop? "bill-code" : 'bill-code-readOnly'}>{"单据编号：" + others.code}</span>
                            {isReadOnly ? (
                                <span>{"入库日期：" + others.rkPeriod}</span>
                            ) : (
                                <span className="period">
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

                        <div className="ttk-stock-app-completion-warehousing-header-others-right">
                            <span className="ttk-stock-app-completion-warehousing-header-others-right-top">
                                {!xdzOrgIsStop &&
                                    <React.Fragment>
                                        <Button
                                            className="update-btn"
                                            onClick={this.handleRefresh}
                                            disabled={isReadOnly}>
                                            {others.btnText}
                                        </Button>
                                        <Button
                                            className="delete-btn"
                                            onClick={this.handleDel}
                                            disabled={
                                                isReadOnly ||
                                                !invSet.isCompletion
                                            }>
                                            {others.delBtn}
                                        </Button>
                                    </React.Fragment>
                                }
                                
                                <PrintButton className='print-btn' params={{codeType: 'WGRK'}} dealData={this.dealData} />
                            </span>
                        </div>
                    </div>
                </div>
                <div className={this.shortcutsClass}>
                    <VirtualTable
                        key="inventoryId"
                        rowKey="inventoryId"
                        bordered={true}
                        pagination={false}
                        width={tableOption.x}
                        height={tableOption.y + 100}
                        scroll={{
                            y: tableOption.y,
                            x: tableOption.x < 1200 ? 1200 : tableOption.x + 10,
                        }}
                        columns={this.renderColumns()}
                        dataSource={list}
                        allowResizeColumn
                        openShortcuts
                        shortcutsClass={this.shortcutsClass}
                    />
                </div>
                <div className="ttk-stock-app-completion-warehousing-footer">
                    <div className="ttk-stock-app-completion-warehousing-footer-div">
                        <span className="ttk-stock-app-completion-warehousing-footer-div-span">
                            入库数量：{ formatSixDecimal(numT) }
                        </span>
                    </div>
                    {!xdzOrgIsStop &&
                        <Button
                            className="ttk-stock-app-completion-warehousing-footer-btn"
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
