import React from "react"
import { Select, Divider, Button, Form } from "antd"
import SuperSelect from "../../invoices/component/SuperSelect"
import SelectAssist from "./selectAssist"
const Option = Select.Option
/**
 * module:必须传，模块类型。cg：进项；销项：xs
 * metaAction:必须传
 * store:必须传
 * webapi:必须传
 * value:必须传
 * onChange={value => yourFun(value)}
 *     value的值有两类：
 *     1、undefined；
 *     2、{id:id,name:name,assistList:[{id:id,name:name}]}，
 *         包括了存货、科目和辅助核算项目，assistList为辅助核算项目，
 *         如果没有辅助核算项目，则没有assistList。
 */
export default class SelectStock extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            footerDisabled: false,
            value: props.value || undefined,
            optionList: [],
            isCanAdd: props.noCanAdd ? false : true
        }
        this.metaAction = props.metaAction || {}
        this.webapi = props.webapi || {}
        this.rbSelect
    }
    focus() {
        try {
            this.rbSelect && this.rbSelect.current.focus()
        } catch (ex) { }
    }

    blur() {
        this.rbSelect && this.rbSelect.current.blur()
    }
    componentDidMount() {
        this.getInventoryById()
        //手动点击一次
        if (this.props.autoExpand) {
            try {
                this.rbSelect._reactInternalFiber.firstEffect.stateNode.click()
            } catch (err) { }
        }
    }
    saveSelect = node => {
        this.rbSelect = node
    }
    onFocus = async () => {
        const { webapi, metaAction, module, isStock } = this.props
        if (webapi && webapi.bovms && module) {
            const res = await webapi.bovms.queryInventoryDtoList({
                isEnable: true
            })
            if (res) {
                this.setState({ optionList: res })
            }
        }
    }
    close = async ret => {
        this.closeTip && this.closeTip()
        if (ret && ret.id) {
            let { optionList } = this.state,
                value = ret.id
            if (ret.inventoryRelatedAccountId) {
                const csa = await this.computeSubjectAndAssist(ret, value)
                ret = csa.item
                value = csa.value || this.props.value
            }
            if (!optionList.some(s => s.id === ret.id))
                optionList.push({ ...ret })
            this.setState({ value, optionList })
            this.callBack(ret)
        }
    }
    async getInventoryById() {
        const { webapi, value } = this.props
        if (webapi && webapi.bovms && value) {
            this.setState({ footerDisabled: true })
            const res = await webapi.bovms.getInventoryById({
                id: value
            })
            if (res) {
                this.setState({ optionList: [{ ...res }], footerDisabled: false })
            }
        }
    }
    async onAdd(item) {
        const { metaAction, store, rowData } = this.props
        let { optionList, value } = this.state
        if (metaAction) {
            // item && console.log('编辑存货档案:', item);
            const ret = await metaAction.modal("show", {
                title: item ? "编辑存货档案" : "新增存货档案",
                wrapClassName: "card-archive",
                style: { top: 5 },
                width: 700,
                height: 520,
                footer: "",
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                children: metaAction.loadApp("ttk-app-inventory-card", {
                    store: store,
                    initData: item || null,
                    moduleYW: {
                        invenName: item ? item.name : rowData.goodsName,
                        invenSpecification: item
                            ? item.specification
                            : rowData.specification
                    }
                })
            })
        }
    }
    callBack = item => {
        this.props.onChange && this.props.onChange(item)
    }
    async computeSubjectAndAssist(item, value) {
        const res = await this.webapi.bovms.getAccountById({
            id: item.inventoryRelatedAccountId
        })
        if (res && res.glAccount && res.glAccount.id) {
            // 如果1）只有存货核算项目的；2）不带辅助核算的，则添加，否则科目置空
            let calcList =
                Object.keys(res.glAccount)
                    .filter(
                        f =>
                            f !== "isCalc" &&
                            f.indexOf("Calc") > 0 &&
                            res.glAccount[f] === true
                    )
                    .map(m => m.replace("isCalc", "").toLocaleLowerCase()) || []
            // 排除数量、外币、外汇核算
            calcList = calcList.filter(
                f => f !== "multi" && f !== "quantity" && f !== "bankaccount"
            )
            //
            item.inventoryRelatedAccountCode = res.glAccount.code
            item.inventoryRelatedAccountName = res.glAccount.gradeName
            // 场景1：选择的存货档案的存货科目不为空，且存货科目不带有辅助核算
            // 直接将存货档案的借方科目带出，作为所编辑明细项目的借方科目，借方科目不可编辑
            if (calcList.length === 0) {
                item.assistList = null
            }
            // 场景2：选择的存货档案的存货科目不为空，存货科目带有且仅带有【存货档案】辅助核算
            // 直接将存货档案的存货科目带出作为发票明细的借方科目，并将所选择的存货档案做为借方科目的辅助核算项目，借方科目不可编辑——显示【辅助】按钮
            if (calcList.length === 1 && calcList[0] === "inventory") {
                item.isCalcInventory = true
                item.assistList = [
                    { id: item.id, name: item.name, type: "calcInventory" }
                ]
            }
            // 场景3：选择的存货档案的存货科目不为空，存货科目带有类别不为【存货档案】的辅助核算
            // 直接将存货档案的存货科目带出作为发票明细的借方科目，并同时［打开］辅助项目选择弹窗——如果用户点击取消或关闭按钮，则返回值上一界面，同时清空已经选择的【存货档案】和【借方科目】
            if (calcList.length > 0 && !calcList.includes("inventory")) {
                item.assistList = await this.openSelectAssist({
                    ...res.glAccount,
                    assistList: null
                })
                if (!item.assistList) {
                    value = undefined
                    item = undefined
                }
            }
            // 场景4：选择的存货档案的存货科目不为空，存货科目带有类别为【存货档案】和其他类别的辅助核算
            // 直接将存货档案的存货科目带出作为发票明细的借方科目，并同时［打开］辅助项目选择弹窗——【存货档案】固定为已选择的存货档案，不可编辑
            if (calcList.length > 1 && calcList.includes("inventory")) {
                item.assistList = await this.openSelectAssist({
                    ...res.glAccount,
                    assistList: [
                        { id: item.id, name: item.name, type: "calcInventory" }
                    ]
                })
                if (!item.assistList) {
                    value = undefined
                    item = undefined
                }
            }
        }
        return { item, value }
    }
    handleChange = async (value, option) => {
        if (String(value) === "add" || option.key === "add") {
            value = undefined
            return
        }
        // console.log('onChange:', value, option)
        let item = option.props.item
        if (item && item.inventoryRelatedAccountId) {
            const csa = await this.computeSubjectAndAssist(item, value)
            item = csa.item
            value = csa.value || this.props.value
        } else {
            // 场景5：选择的存货档案的存货科目为空
            // 打开存货档案的的编辑界面
            item.openEditStockModal = true
            item.inventoryRelatedAccountId = undefined
            item.inventoryRelatedAccountCode = undefined
            item.inventoryRelatedAccountName = undefined
            item.assistList = null
            await this.onAdd(item)
            return false
        }
        // console.log('select-stock:', item, value)
        this.setState({ value: value })
        this.callBack(item)
    }
    getOptionText(item) {
        const { rowData } = this.props
        return `${item.code || ""}${item.propertyName ? `-${item.propertyName}` : ''}-${item.name || ""}${
            item.specification ? "-" : ""
            }${item.specification || ""}${item.unitName ? `-${item.unitName}` : ""}`
    }
    onBlur = () => {
        this.props.onBlur && this.props.onBlur()
    }
    async openSelectAssist(item) {
        const { metaAction, store, webapi, rowData } = this.props
        let { optionList, value } = this.state
        const res = await metaAction.modal("show", {
            title: "选择辅助项目",
            width: 450,
            style: { top: 5 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: (
                <SelectAssist
                    item={item}
                    store={store}
                    metaAction={metaAction}
                    webapi={webapi}
                    subjectName={rowData.goodsName}
                    disabledInventory
                ></SelectAssist>
            )
        })
        if (res && res.assistList) {
            return res.assistList
        } else {
            return null
        }
    }
    isObject(value) {
        return Object.prototype.toString.call(value) === "[object Object]"
    }
    computePropsValue() {
        const val = this.props.value
        return this.isObject(val) ? val.id : val
    }
    render() {
        let { optionList, isCanAdd } = this.state
        let { value } = this.props
        let _val =
            (value && optionList.some(s => s.id == value) && value) || undefined
        return (
            <SuperSelect
                {...this.props}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                value={this.computePropsValue()}
                style={{ width: "100%" }}
                onChange={this.handleChange}
                dropdownMatchSelectWidth={false}
                dropdownClassName="bovms-select-subject-dropdown"
                notFoundContent="无匹配结果"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                    if (
                        option.props.children &&
                        typeof option.props.children !== "string"
                    ) {
                        return true
                    }
                    return option.props.children &&
                        typeof option.props.children === "string"
                        ? option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        : false
                }}
                ref={this.saveSelect}
                isNeedAdd
                footerClick={:: this.onAdd}
            >
{
    optionList.map(item => (
        <Option value={item.id} key={item.id} item={item}>
            {this.getOptionText(item)}
        </Option>
    ))
}
            </SuperSelect >
        )
    }
}
