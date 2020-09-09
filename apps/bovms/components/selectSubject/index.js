import React from "react"
import { findDOMNode } from "react-dom"
import { Divider, Button, Form, Select } from "antd"
import SuperSelect from "../../../invoices/component/SuperSelect"
import SelectAssist from "../selectAssist"
// import { Select } from 'edf-component';
import isEqual from "lodash.isequal"
import { subjectIncludeAssist } from "../../utils/index"
const Option = Select.Option

const initSelctSubjectOptionList = props => {
    return props.defaultItem &&
        props.defaultItem.id &&
        props.defaultItem.codeAndName &&
        props.defaultItem.codeAndName.trim()
        ? [props.defaultItem]
        : []
}
/**
 * 选择科目
 * selectType:必须传，选择科目的类型。jfkm：借方科目；dfkm：贷方科目；2221:科目设置中的会计科目
 * module:必须传，模块类型。cg：进项；销项：xs
 * metaAction:必须传
 * store:必须传
 * webapi:必须传
 * value:必须传
 * assistJSON:选传，用户初始化辅助核算科目
 * subjectName:科目名称，选填
 * isStockMonth:会计月份，是否为存货，必填
 * isStock:当前行数据，是否为存货，选填
 * noCanAdd：没有新增科目功能，选填
 * noShowSelectAssist：不显示选择辅助核算按钮，选填
 * apiModule  多个模块需要复用这个组件 为了取到对应模块的api 选填 默认bovms
 * onChange={value => yourFun(value)}
 *     value的值有两类：
 *     1、undefined；
 *     2、{id:id,name:name,assistList:[{id:id,name:name}]}，
 *         包括了科目和辅助核算项目，assistList为辅助核算项目，
 *         如果没有辅助核算项目，则没有assistList。
 */
export default class SelectSubject extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            footerDisabled: false,
            value: props.value || undefined,
            optionList: initSelctSubjectOptionList(props),
            isCanAdd: props.noCanAdd ? false : true,
            isStock: props.isStock,
            sonListByPidList: [], //新增科目对应的父级科目列表
            defaultItem: props.defaultItem
        }
        this.apiModule = props.apiModule || "bovms"
        this.metaAction = props.metaAction || {}
        this.rbSelect
        this.requestIsCompleted = false
        // console.log('this.apiModule',this.apiModule)
        // console.log('module',this.props.module)
    }
    isObject(value) {
        return Object.prototype.toString.call(value) === "[object Object]"
    }
    focus() {
        // console.log('this.rbSelect:', this.rbSelect)
        try {
            this.rbSelect && this.rbSelect.current.focus()
        } catch (ex) { }
    }

    blur() {
        try {
            this.rbSelect && this.rbSelect.current.blur()
        } catch (ex) { }
    }
    componentWillReceiveProps(nextProps) {
        let { isStock, defaultItem, optionList } = this.state
        if (nextProps.isStock !== isStock) {
            this.setState({ isStock: nextProps.isStock }, () => {
                this.onFocus()
                this.getParentCodeId()
            })
        }
        if (!isEqual(nextProps.defaultItem, defaultItem)) {
            if (
                nextProps.defaultItem &&
                nextProps.defaultItem.id &&
                !optionList.find(f => f.id === nextProps.defaultItem.id)
            ) {
                optionList.push({ ...nextProps.defaultItem })
                this.setState({ optionList })
            }
        }
    }
    componentDidMount() {
        // console.log('this.refs', this.rbSelect);
        // this.onFocus();
        this.getParentCodeId()
        //手动点击一次
        if (
            this.props.autoExpand &&
            (this.props.noShowSelectAssist || !this.getIsCanSelectAssist())
        ) {
            try {
                this.rbSelect._reactInternalFiber.firstEffect.stateNode.click()
            } catch (err) { }
        }
    }
    saveSelect = node => {
        this.rbSelect = node
    }
    getParentCodeId = async () => {
        const {
            webapi,
            metaAction,
            selectType,
            module,
            isStock,
            isStockMonth
        } = this.props
        // console.log('webapi:', webapi, this.props)
        if (webapi && webapi[this.apiModule] && selectType && module) {
            let res = null
            if (selectType === "2221") {
                res = await webapi[this.apiModule].get2221CodeIds({ module })
                // return;
            } else {
                const debitOrCredit = selectType === "jfkm" ? "debit" : "credit"
                res = await webapi.bovms.getParentCodeId({
                    module,
                    isStock:
                        module === "cg" &&
                            debitOrCredit === "debit" &&
                            isStockMonth == 1
                            ? isStock
                            : undefined,
                    [debitOrCredit]: debitOrCredit
                })
            }
            if (res) {
                this.setState({ sonListByPidList: res })
            }
        }
    }
    onFocus = async () => {
        this.requestIsCompleted = true
        const {
            webapi,
            metaAction,
            selectType,
            module,
            isStock,
            isStockMonth
        } = this.props
        // console.log('webapi:', webapi, this.props)
        this.setState({ footerDisabled: true })
        if (webapi && webapi[this.apiModule] && selectType && module) {
            if (selectType === "2221") {
                const response = await webapi[this.apiModule].get2221CodeList({
                    module
                })
                if (response) {
                    this.setState(
                        {
                            optionList: response,
                            footerDisabled: false
                            // sonListByPidList: response.map(r => r.id),
                        },
                        () => {
                            this.clearDefaultVal(response)
                        }
                    )
                }
                return
            }
            const debitOrCredit = selectType === "jfkm" ? "debit" : "credit"
            const res = await webapi.bovms.getChildAccountCodeList({
                module,
                isStock:
                    module === "cg" &&
                        debitOrCredit === "debit" &&
                        isStockMonth == 1
                        ? isStock
                        : undefined,
                [debitOrCredit]: debitOrCredit
            })
            if (res) {
                this.setState(
                    {
                        optionList: res,
                        footerDisabled: false
                    },
                    () => {
                        this.clearDefaultVal(res)
                    }
                )
            }
        }
    }
    clearDefaultVal(list) {
        this.requestIsCompleted = false
        const value = this.computePropsValue()
        if (
            value &&
            Array.isArray(list) &&
            list.findIndex(f => f.id == value) === -1
        ) {
            this.callBack(undefined)
        }
    }
    onAdd = async () => {
        const { selectType, metaAction, store, subjectName } = this.props
        let { optionList, value, sonListByPidList } = this.state
        // console.log('select-subject-add:', sonListByPidList)
        if (metaAction) {
            const ret = await metaAction.modal("show", {
                title: "新增科目",
                width: 450,
                okText: "保存",
                style: { top: 5 },
                bodyStyle: { padding: 24, fontSize: 12 },
                children: metaAction.loadApp(
                    "app-proof-of-charge-subjects-add",
                    {
                        store: store,
                        columnCode: "subjects",
                        active: "archives", //'addPrimarySubject',
                        initData: {
                            subjectName: subjectName || undefined,
                            sonListByPidList: sonListByPidList
                        }
                    }
                )
            })
            if (ret && ret.id) {
                // console.log('onAdd:', ret)
                value = ret.id
                optionList.push(ret)
                this.setState({ value, optionList })
                if (ret.isCalc) {
                    // 属于辅助核算科目
                    await this.openStockModal(ret)
                } else {
                    this.callBack(ret)
                }
            }
        }
    }
    callBack = item => {
        this.props.onChange && this.props.onChange(item)
    }
    openStockModal = async (item, isFromManual) => {
        const {
            selectType,
            metaAction,
            store,
            webapi,
            subjectName,
            disabled
        } = this.props
        let { optionList } = this.state
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
                    subjectName={subjectName}
                    disabledInventory={disabled}
                ></SelectAssist>
            )
        })
        if (res && res.assistList) {
            const optionItem = optionList.find(f => f.id === item.id)
            if (optionItem) {
                optionItem.assistList = res.assistList
                this.setState({ optionList })
                this.callBack(optionItem)
            }
        } else {
            !isFromManual && this.callBack()
        }
    }
    handleSelect = (value, option) => { }
    handleChange = (value, option) => {
        if (String(value) === "add" || (option && option.key === "add")) {
            value = undefined
        }
        const item = option && option.props && option.props.item
        if (item) {
            if (item.isCalc && subjectIncludeAssist(item)) {
                this.openStockModal(item)
            } else {
                this.callBack(item)
            }
        }
    }
    getOptionText(item, value) {
        let text = item.codeAndName
        if (Array.isArray(item.assistList)) {
            item.assistList.forEach(ass => {
                text += ass.name ? `/${ass.name}` : ""
            })
        } else if (value && item.id == value) {
            const assistList =
                JSON.parse(this.props.assistJSON || "{}").assistList || []
            assistList.forEach(ass => {
                text += ass.name ? `/${ass.name}` : ""
            })
        }
        return text
    }
    onBlur = () => {
        this.props.onBlur && this.props.onBlur()
    }
    getMinWidth() {
        try {
            const node = findDOMNode(this.rbSelect)
            if (
                node &&
                node.firstElementChild &&
                node.firstElementChild.offsetWidth
            )
                return node.firstElementChild.offsetWidth + "px"
        } catch (ex) { }
        return "auto"
    }
    getIsCanSelectAssist() {
        const { optionList } = this.state,
            { assistJSON } = this.props,
            value = this.computePropsValue()
        return (
            (JSON.parse(assistJSON || "{}").assistList ||
                (optionList.find(f => f.id == value) || {}).assistList) && value
        )
    }
    openSelectAssist(e) {
        e && e.preventDefault && e.preventDefault()
        e && e.stopPropagation && e.stopPropagation()
        const { optionList } = this.state,
            { assistJSON } = this.props,
            value = this.computePropsValue()
        let item = optionList.find(f => f.id == value)
        if (!item) return
        if (!item.assistList)
            item.assistList = JSON.parse(assistJSON || "{}").assistList
        this.openStockModal(item, true)
    }
    computePropsValue() {
        const val = this.props.value
        return this.isObject(val) ? val.id : val
    }
    render() {
        // const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        let { optionList, isCanAdd, footerDisabled } = this.state
        const { noShowSelectAssist, disabled } = this.props,
            minWidth = this.getMinWidth(),
            isCanSelectAssist = this.getIsCanSelectAssist(),
            value = this.computePropsValue()
        return (
            <div
                className={
                    !noShowSelectAssist && isCanSelectAssist
                        ? "bovms-select-subject-container"
                        : ""
                }
                onBlur={() => {
                    noShowSelectAssist && disabled && this.onBlur()
                }}
            >
                <SuperSelect
                    {...this.props}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
                    value={value}
                    footerDisabled={footerDisabled}
                    style={{
                        width:
                            !noShowSelectAssist && isCanSelectAssist
                                ? "calc(100% - 20px)"
                                : "100%"
                    }}
                    onChange={this.handleChange}
                    // onSelect={this.handleSelect}
                    dropdownMatchSelectWidth={false}
                    dropdownClassName={
                        isCanAdd
                            ? "bovms-select-subject-dropdown"
                            : "bovms-select-subject-dropdown no-add"
                    }
                    notFoundContent="无匹配结果"
                    showSearch
                    isNeedAdd
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
                    dropdownStyle={{ minWidth: minWidth }}
                    footerClick={::this.onAdd}
                >
                {optionList.map(item => (
                    <Option value={item.id} key={item.id} item={item}>
                        {this.getOptionText(item, value)}
                    </Option>
                ))}
                </SuperSelect>
                {
            !noShowSelectAssist && isCanSelectAssist ? (
                <a
                    className="assist-btn"
                    unSelectable="on"
                    onClick={:: this.openSelectAssist}
                    >
            辅助
                    </a >
                ) : null
    }
            </div>
        )
    }
}
