import React from "react"
import utils, { environment } from "edf-utils"
import { Select, Icon, Button, Input, Spin, DataGrid } from "edf-component"
import img from "../../commonAssets/add.png"
import { formatNumbe, formatnum, formatprice } from "../utils"
import SuperSelect from "../../../invoices/component/SuperSelect"

class EditableCell extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: props.value,
            editable: false,
            cacheData: props.record || {},
            localType: props.type,
            localCheckOutType: props.checkOutType,
        }
        this.module = props.module
    }
    isObject(val) {
        return Object.prototype.toString.call(val) === "[object Object]"
    }
    handleChange = async value => {
        const {
            dataIndex,
            handleSave,
            opstionList,
            serviceTypeName,
            type,
            checkOutType,
        } = this.props
        const { cacheData } = this.state
        const isObject = this.isObject(value)
        switch (dataIndex) {
            case "inventoryId":
                let option = opstionList.find(f => f.inventoryCode === value)
                cacheData["inventoryId"] = option.inventoryId
                cacheData["inventoryCode"] = option.inventoryCode
                cacheData["inventoryName"] = option.inventoryName
                cacheData["inventoryGuiGe"] = option.inventoryGuiGe
                cacheData["inventoryUnit"] = option.inventoryUnit
                cacheData["num"] = undefined
                //业务类型不是成本调整才自动带出单价 , 成本核算为先进先出需要带出库存数量
                if (
                    (serviceTypeName != "成本调整" && type === "QTCK") ||
                    (type === "QTCK" && checkOutType === 3)
                ) {
                    let res
                    // 全月加权：0 移动加权：1 销售成本率：2 先进先出：3
                    if (checkOutType === 0 || checkOutType === 2) {
                        res = await this.props.webapi.api.getRealTimeInventoryAndUnitCost({
                            period: this.props.period,
                            ids: [option.inventoryId],
                        })
                    } else if (checkOutType === 1) {
                        res = await this.props.webapi.api.getSaleMobileCostNum({
                            period: this.props.period,
                            ids: [option.inventoryId],
                        })
                    } else if (checkOutType === 3) {
                        res = await this.props.webapi.api.queryPendingStockOutNum({
                            period: this.props.period,
                            stockOutList: [{ inventoryId: option.inventoryId }],
                        })
                    }
                    if (checkOutType === 3) {
                        cacheData["placeholder"] = `库存${
                            res.stockOutList[0].pendingStockOutNum
                                ? res.stockOutList[0].pendingStockOutNum
                                : "0"
                        }`
                        cacheData["stockNum"] = res.stockOutList[0].pendingStockOutNum
                    } else {
                        cacheData["placeholder"] = `库存${res[0].num ? res[0].num : "0"}`
                        cacheData["stockNum"] = res[0].num
                    }

                    if (checkOutType === 0) {
                        this.calc("price", cacheData, res[0].unitCost)
                    } else if (checkOutType === 1) {
                        this.calc("price", cacheData, res[0].price)
                    }
                }

                break
            case "num":
                //其他出库并且存货核算为先进先出
                if (type === "QTCK" && checkOutType === 3 && cacheData.inventoryId) {
                    if (value) {
                        //如果输入数量大于出库数量 ，清空输入框，弹出错误提示
                        cacheData.num = value
                        if (value && value <= cacheData.stockNum) {
                            let res = await this.props.webapi.api.calculatePendingStockOutPriceAndAmount(
                                {
                                    period: this.props.period,
                                    inventoryId: cacheData.inventoryId,
                                    pendingStockOutNum: value,
                                }
                            )
                            cacheData.price = res.pendingStockOutPrice
                            cacheData.ybbalance = res.pendingStockOutAmount
                            cacheData.outToInRelationList = res.outToInRelationList
                        } else {
                            cacheData.price = ""
                            cacheData.ybbalance = ""
                        }
                    } else {
                        cacheData.num = ""
                        cacheData.price = ""
                        cacheData.ybbalance = ""
                    }
                } else {
                    this.calc("quantity", cacheData, value)
                }
                this.toggleEdit()
                break
            case "price":
                this.calc("price", cacheData, value)
                this.toggleEdit()
                break
            case "ybbalance":
                this.calc("amount", cacheData, value)
                this.toggleEdit()
                break
            default:
                break
        }
        this.setState({ cacheData })
        handleSave && handleSave(cacheData)
    }

    save = () => {
        const { handleSave } = this.props
        const { cacheData } = this.state
        this.toggleEdit()
        handleSave && handleSave(cacheData)
    }
    toggleEdit = type => {
        //数字输入框已聚焦 再次点击不取消
        if (type === "num" && this.state.editable) return
        const editable = !this.state.editable
        if (this.props.record) this.props.record["editable"] = editable
        this.setState({ editable }, () => {
            if (editable) {
                if (this.props.dataIndex === "inventoryId") {
                    try {
                        this.myRef._reactInternalFiber.firstEffect.stateNode.click()
                    } catch (err) {}
                } else {
                    this.myRef && this.myRef.focus && this.myRef.focus()
                }
            }
        })
    }

    handleSearch() {}

    addSubject() {}

    quantityFormat = (quantity, decimals, isFocus) => {
        if (quantity) {
            if (isFocus == "price") {
                return formatprice(quantity, decimals)
            } else {
                return formatNumbe(quantity, decimals)
            }
        }
    }
    //过滤行业
    filterIndustryInventory = (input, option) => option.props.children.indexOf(input) > -1

    // filterIndustryInventory = (input, option) => {
    //     let flag = false
    //     option.props.children.forEach(item => {
    //         if (item.props.children.indexOf(input) >= 0) {
    //             flag = true
    //         }
    //     })
    //     return flag
    // }
    calc = (fieldName, rowData, value) => {
        if (fieldName === "price") {
            //单价
            this.priceChange(value, rowData)
        } else if (fieldName === "amount") {
            //金额
            this.amountChange(value, rowData)
        } else if (fieldName === "quantity") {
            //数量
            this.quantityChange(value, rowData)
        }
    }

    priceChange = (v, rowData) => {
        // 金额＝单价×数量
        const price = Math.abs(formatNumbe(v)) //解决删除时将小数点自动删除得问题
        let quantity = utils.number.round(rowData.num, 6)
        let amount = utils.number.round(rowData.ybbalance, 6)

        if (quantity) {
            amount = utils.number.round(price * quantity, 2)
        } else {
            if (amount) {
                quantity = utils.number.round(amount / price, 6)
            }
        }
        rowData.price = price
        rowData.num = quantity
        //如果数量和单价不为空才算金额
        if (quantity && price) {
            rowData.ybbalance = amount
        }
    }

    amountChange = (v, rowData) => {
        // 如果数量为0 ，单价为0
        // 如果数量不为0，单价＝金额÷数量

        // let taxRate = utils.number.round(rowData.taxRate, 2),
        let amount = formatNumbe(v), //解决删除时将小数点自动删除得问题
            quantity = utils.number.round(rowData.num, 6),
            price = utils.number.round(rowData.price, 6)
        if (quantity != 0) {
            price = utils.number.round(amount / quantity, 6)
            if (price < 0) {
                price = Math.abs(Number(price))
                quantity = utils.number.round(amount / price, 6)
            }
        } else {
            if (price) {
                if (price < 0) {
                    price = Math.abs(Number(price))
                }
                quantity = utils.number.round(amount / price, 6)
            }
        }

        rowData.num = quantity
        rowData.price = price
        rowData.ybbalance = amount
    }

    quantityChange = (v, rowData) => {
        // 金额＝单价×数量

        let quantity = formatNumbe(v), //解决删除时将小数点自动删除得问题
            price = utils.number.round(rowData.price, 6),
            amount = utils.number.round(rowData.ybbalance, 2)
        if (price) {
            amount = utils.number.round(price * quantity, 2)
            rowData.num = quantity
            rowData.price = price
            rowData.ybbalance = amount
        } else {
            price = utils.number.round(amount / quantity, 6)
            if (price < 0) {
                price = Math.abs(formatNumbe(price))
                amount = utils.number.round(quantity * price, 6)
            }
            rowData.num = quantity
            rowData.price = price

            //如果数量和单价不为空才算金额
            if (quantity && price) {
                rowData.ybbalance = amount
            }
        }
    }

    renderSelectOpts = () => {}

    render() {
        const {
            value,
            record,
            handleSave,
            dataIndex,
            webapi,
            metaAction,
            store,
            module,
            isReadOnly,
            opstionList,
            checkOutType,
            className,
        } = this.props

        const { editable, fetching } = this.state

        // if (module==='cg' && dataIndex === 'acct10Id' && record.isStock === '1') {
        //     // 是存货时，借方科目不能编辑－－因为档案带回的科目辅助核算可能存在多个值，暂时先放开编辑
        //     return <div title={this.getColText(value,record,dataIndex)}>{this.getColText(value,record,dataIndex)}</div>
        // }
        switch (dataIndex) {
            case "inventoryId":
                let inventoryNameList = sessionStorage.getItem("inventoryNameList")
                return (
                    <div
                        className={
                            editable ? "inputSelectonClick tdChme" : "inputSelectClass tdChme"
                        }>
                        {editable ? (
                            <SuperSelect
                                ref={node => (this.myRef = node)}
                                showSearch={true}
                                key={`${record.key}-${dataIndex}`}
                                className="selectName"
                                value={record.inventoryName}
                                title={record.inventoryName}
                                dropdownMatchSelectWidth={false}
                                dropdownClassName="selectNameDivDropdown"
                                dropdownStyle={{ width: "auto", fontSize: "12px !important" }}
                                // dropdownMenuStyle={{ height: '200px' }}
                                onBlur={this.save}
                                notFoundContent={
                                    fetching ? (
                                        <Spin size="small" spinning={true} delay={1}></Spin>
                                    ) : null
                                }
                                onChange={this.handleChange.bind(this)}
                                filterOption={this.filterIndustryInventory}
                                isNeedAdd
                                footerClick={this.props.addStockName}>
                                {opstionList.map(item => {
                                    const {
                                        inventoryCode,
                                        inventoryName,
                                        inventoryGuiGe,
                                        inventoryUnit,
                                    } = item
                                    const contentArr = [
                                        inventoryCode,
                                        inventoryName,
                                        inventoryGuiGe,
                                        inventoryUnit,
                                    ]
                                    const contentText = contentArr.filter(v => !!v).join("-")

                                    //先进先出不能重复选择存货
                                    if (checkOutType === 3) {
                                        return (
                                            <Option
                                                width={200}
                                                key={item.inventoryId}
                                                value={item.inventoryCode}
                                                title={contentText}
                                                disabled={
                                                    inventoryNameList.indexOf(item.inventoryId) > -1
                                                }>
                                                {contentText}
                                            </Option>
                                        )
                                    } else {
                                        return (
                                            <Option
                                                width={200}
                                                key={item.inventoryId}
                                                value={item.inventoryCode}
                                                title={contentText}>
                                                {contentText}
                                            </Option>
                                        )
                                    }
                                })}
                            </SuperSelect>
                        ) : (
                            <div
                                className="editable-cell-value-wrap static-editable-cell"
                                onClick={this.toggleEdit.bind(this)}>
                                {record.inventoryName ? record.inventoryName : ""}
                            </div>
                        )}
                        {
                            <div className="selectMoreName">
                                <Icon
                                    type="ellipsis"
                                    disabled={false}
                                    onClick={this.props.selectMore.bind(this)}></Icon>
                            </div>
                        }
                    </div>
                )
            case "num":
                return (
                    <Input.Number
                        key={`${record.key}-${dataIndex}`}
                        className={
                            className +
                            " " +
                            (editable ? "inputSelectonClick" : "inputSelectClass hover-number")
                        }
                        timeout={true}
                        tip={true}
                        style={{
                            textAlign: "left",
                        }}
                        executeBlur
                        placeholder={record.placeholder}
                        value={this.quantityFormat(value)}
                        title={this.quantityFormat(value)}
                        precision={6}
                        interceptTab={true}
                        onClick={this.toggleEdit.bind(this, "num")}
                        // onChange={this.handleChange.bind(this)}
                        onBlur={this.handleChange.bind(this)}></Input.Number>
                )
            case "price":
                return (
                    <Input.Number
                        key={`${record.key}-${dataIndex}`}
                        className={
                            className +
                            " " +
                            (editable ? "inputSelectonClick" : "inputSelectClass hover-number")
                        }
                        timeout={true}
                        tip={true}
                        style={{
                            textAlign: "right",
                        }}
                        value={this.quantityFormat(value)}
                        title={this.quantityFormat(value)}
                        precision={6}
                        interceptTab={true}
                        executeBlur
                        regex={"^([0-9]+)(?:.[0-9]{1,6})?$"}
                        onClick={this.toggleEdit.bind(this, "num")}
                        // onChange={this.handleChange.bind(this)}
                        onBlur={this.handleChange.bind(this)}></Input.Number>
                )
            case "ybbalance":
                return (
                    <Input.Number
                        key={`${record.key}-${dataIndex}`}
                        className={
                            className +
                            " " +
                            (editable ? "inputSelectonClick" : "inputSelectClass hover-number")
                        }
                        min={0}
                        timeout={true}
                        tip={true}
                        style={{
                            textAlign: "right",
                        }}
                        value={this.quantityFormat(value, 2)}
                        title={this.quantityFormat(value, 2)}
                        precision={2}
                        executeBlur
                        interceptTab={true}
                        // onChange={this.handleChange.bind(this)}
                        onClick={this.toggleEdit.bind(this, "num")}
                        onBlur={this.handleChange.bind(this)}></Input.Number>
                )
        }
    }
}

export default EditableCell
