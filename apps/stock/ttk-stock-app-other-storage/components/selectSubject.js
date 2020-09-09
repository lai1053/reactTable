import React from "react"
import { findDOMNode } from "react-dom"
import { Button, Select } from "antd"
import SelectAssist from "../../../bovms/components/selectAssist"
// import { Select } from 'edf-component';
import isEqual from "lodash.isequal"
import { subjectIncludeAssist } from "../../../bovms/utils/index"
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
 * 资金选择科目
 * metaAction:必须传
 * store:必须传
 * webapi:必须传
 * value:必须传
 * assistJSON:选传，用户初始化辅助核算科目
 * subjectName:科目名称，选填
 * noCanAdd：没有新增科目功能，选填
 * noShowSelectAssist：不显示选择辅助核算按钮，选填
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
            value: props.value || undefined,
            optionList: initSelctSubjectOptionList(props),
            isCanAdd: props.noCanAdd ? false : true,
            sonListByPidList: [], //新增科目对应的父级科目列表
            defaultItem: props.defaultItem,
            addBtnDisabled: true,
        }
        this.serviceTypeCode = props.serviceTypeCode || "other"
        this.metaAction = props.metaAction || {}
        this.rbSelect
        this.requestIsCompleted = false
    }
    isObject(value) {
        return Object.prototype.toString.call(value) === "[object Object]"
    }
    focus() {
        try {
            this.rbSelect && this.rbSelect.focus()
        } catch (ex) {}
    }

    blur() {
        try {
            this.rbSelect && this.rbSelect.blur()
        } catch (ex) {}
    }
    componentWillReceiveProps(nextProps) {
        if (!isEqual(nextProps.defaultItem, this.state.defaultItem)) {
            let optionList = this.state.optionList
            if (
                nextProps.defaultItem &&
                nextProps.defaultItem.id &&
                !optionList.find(f => f.id === nextProps.defaultItem.id)
            ) {
                optionList.push(nextProps.defaultItem)
                this.setState({ optionList })
            }
        }
    }
    componentDidMount() {
        // this.onFocus();

        //手动点击一次
        if (
            this.props.autoExpand &&
            (this.props.noShowSelectAssist || !this.getIsCanSelectAssist())
        ) {
            try {
                this.rbSelect._reactInternalFiber.firstEffect.stateNode.click()
            } catch (err) {}
        }
    }
    saveSelect = node => {
        this.rbSelect = node
    }
    //获取新增科目的上级科目列表
    getParentCodeId = async () => {
        const { webapi, metaAction, serviceTypeCode } = this.props
        if (webapi) {
            let res = await webapi.api.getStockOtherParentCodeId({
                serviceTypeCode: serviceTypeCode ? serviceTypeCode : "other",
            })
            if (res) {
                this.setState({ sonListByPidList: res, addBtnDisabled: false })
            }
        }
    }
    onFocus = async () => {
        this.setState({ addBtnDisabled: true })
        this.requestIsCompleted = true
        const { webapi, metaAction, serviceTypeCode } = this.props
        this.getParentCodeId()
        if (webapi) {
            const res = await webapi.api.getStockOtherBillAccountCode({
                serviceTypeCode: serviceTypeCode ? serviceTypeCode : "other",
            })
            if (res) {
                // console.log('res', res);
                this.setState(
                    {
                        optionList: res,
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
        if (value && Array.isArray(list) && list.findIndex(f => f.id == value) === -1) {
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
                children: metaAction.loadApp("app-proof-of-charge-subjects-add", {
                    store: store,
                    columnCode: "subjects",
                    active: "archives", //'addPrimarySubject',
                    initData: {
                        subjectName: subjectName || undefined,
                        sonListByPidList: sonListByPidList,
                    },
                }),
            })
            if (ret && ret.id) {
                // console.log('onAdd:', ret)
                value = ret.id
                optionList.push(ret)
                this.setState({ value, optionList })
                //如果是外币或停用 不回显科目
                if (ret.isCalcMulti || !ret.isEnable) return
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
        const { metaAction, store, webapi, subjectName, disabled } = this.props
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
                    module={"api"}
                    subjectName={subjectName}
                    disabledInventory={disabled}></SelectAssist>
            ),
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
    handleSelect = (value, option) => {}
    handleChange = (value, option) => {
        //clear按钮清空
        if (value === undefined && option === undefined) {
            this.callBack(value)
        }

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
            const assistList = JSON.parse(this.props.assistJSON || "{}").assistList || []
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
            if (node && node.firstElementChild && node.firstElementChild.offsetWidth)
                return node.firstElementChild.offsetWidth + "px"
        } catch (ex) {}
        return "auto"
    }
    getIsCanSelectAssist() {
        const { optionList } = this.state,
            { assistJSON } = this.props,
            value = this.computePropsValue()
        return (
            JSON.parse(assistJSON || "{}").assistList ||
            (optionList.find(f => f.id == value) || {}).assistList
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
        if (!item.assistList) item.assistList = JSON.parse(assistJSON || "{}").assistList
        this.openStockModal(item, true)
    }
    computePropsValue() {
        const val = this.props.value
        return this.isObject(val) ? val.id : val
    }
    render() {
        // const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        let { optionList, isCanAdd, addBtnDisabled } = this.state
        const { noShowSelectAssist, disabled } = this.props,
            minWidth = this.getMinWidth(),
            isCanSelectAssist = this.getIsCanSelectAssist(),
            value = this.computePropsValue()
        return (
            <div
                className={
                    !noShowSelectAssist && isCanSelectAssist ? "bovms-select-subject-container" : ""
                }
                onBlur={() => {
                    noShowSelectAssist && disabled && this.onBlur()
                }}>
                <Select
                    {...this.props}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
                    value={value}
                    style={{
                        width:
                            !noShowSelectAssist && isCanSelectAssist ? "calc(100% - 20px)" : "100%",
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
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                        if (option.props.children && typeof option.props.children !== "string") {
                            return true
                        }
                        return option.props.children && typeof option.props.children === "string"
                            ? option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            : false
                    }}
                    ref={this.saveSelect}
                    dropdownStyle={{ minWidth: minWidth }}>
                    {optionList.map(item => (
                        <Option
                            value={item.id}
                            key={item.id}
                            item={item}
                            title={this.getOptionText(item, value)}>
                            {this.getOptionText(item, value)}
                        </Option>
                    ))}
                    {isCanAdd ? (
                        <Option key="add" className="select-subject-add">
                            <Button
                                icon="plus"
                                type="primary"
                                disabled={addBtnDisabled}
                                onClick={this.onAdd}>
                                新增
                            </Button>
                        </Option>
                    ) : null}
                </Select>
                {!noShowSelectAssist && isCanSelectAssist ? (
                    <a className="assist-btn" unSelectable="on" onClick={::this.openSelectAssist}>
                        辅助
                    </a>
                ) : null}
            </div>
        )
    }
}
