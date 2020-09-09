/*
// 传参
usePeriod: {
    value: '', // 期间--单月份
    defaultValue:'',// 进入页面时的会计期间
    disabledDate: '', // 禁用期间
},
usePeriodRange: {
    value: null, // 期间--多月份，数组
    disabledDate: '', // 禁用期间
},
useInventory: {
    value: 0, // 存货科目类型，序号
    orgId：1213, // id
},
useBusiness: {
    value: 0, // 业务类型，序号
    inveBusiness: 0, // 工商业
    type: 'outsummary', // outsummary-出库，insummary-入库
},
useCategory: {
    value: 0, // 存货分类，序号
},
useSpecialInv：{
    value: false, // 无期初存货
},
useMinusInv: {
    value: false, // 负库存
},
placeholder, style, className,
onSearch // 函数，会接收组件的所有筛选值，按enter键或查询按钮触发

// 筛选值，根据usePeriod等一系列的传参判断是否有返回值
{
    inputValue: '', // 输入框
    period: null, // 期间--单月份
    periodRange: null, // 期间--多月份，数组
    inventory: {
        id: "",
        name: "全部",
        index: 0, // 选择项的序号
    },  // 存货科目类型
    business: { id: "", name: "全部", index: 0 }, // 业务类型
    category: { id: "", name: "全部", index: 0 }, // 存货分类 
    specialInv: false, // 无期初存货
    minusInv: false, // 负库存
}

*/

import React, { PureComponent, Fragment } from "react"
import ReactDOM from 'react-dom'
import moment from "moment"
import { fetch } from "edf-utils"
import { Input, Popover, Icon, Select, Button, DatePicker, Checkbox } from "edf-component"
const { MonthPicker } = DatePicker
const { Option } = Select

import MonthRangePicker from "./MonthRangePicker"
import { debounce } from "./js/util"

export default class StatementsFilter extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            inputValue: "",
            inventoryOptions: [{
                id: "",
                name: "全部",
            }, ],
            businessOptions: [{ id: "", name: "全部" }],
            categoryOptions: [{
                id: "",
                name: "全部",
            }],
            popoverVisible: false,
        }
        this.popoverDom = React.createRef()
    }

    componentDidMount() {
        this.getOptions()
        if(this.props.inputValue) {
            this.setState({inputValue: this.props.inputValue})
        }
    }

    getOptions = async () => {
        const { useInventory, useBusiness, useCategory } = this.props
        if (useInventory) {
            // 存货科目类型
            const res =
                (await fetch.post("/v1/edf/invType/queryAll", { orgId: useInventory.orgId })) || []

            this.setState({
                inventoryOptions: [{
                    id: "",
                    name: "全部",
                }, ].concat(res),
            })
        }
        if (useBusiness) {
            // 业务类型
            const res =
                (await fetch.post(`/v1/biz/bovms/stock/report/${useBusiness.type}/getType`, {
                    inveBusiness: useBusiness.inveBusiness,
                })) || []

            this.setState({ businessOptions: [{ id: "", name: "全部" }].concat(res) })
        }
        if (useCategory) {
            // 存货分类
            const res =
                (await fetch.post("/v1/edf/archCat/getAllCategoryIdAndName", { baseArchiveType: 3000160005 })) || []

            this.setState({
                categoryOptions: [{
                    id: "",
                    name: "全部",
                }, ].concat(res),
            })
        }
    }

    handlePressEnter = () => {
        if (this.popoverDom.current) {
            this.popoverDom.current.onSearch()
        } else {
            const {
                usePeriod,
                usePeriodRange,
                useInventory,
                useBusiness,
                useCategory,
                useSpecialInv,
                useMinusInv,
                onSearch,
            } = this.props
            const { inputValue } = this.state
            const form = { inputValue }
            usePeriod && (form.period = usePeriod.defaultValue)
            usePeriodRange && (form.periodRange = null)
            useInventory && (form.inventory = "")
            useBusiness && (form.business = "")
            useCategory && (form.category = '')
            useSpecialInv && (form.specialInv = false)
            useMinusInv && (form.minusInv = false)
            onSearch(form)
        }
    }
    handleInputChange = e => {
        this.setState({ inputValue: e.target.value ? e.target.value.trim() : "" })
    }

    // 获取筛选参数
    getPopoverData = form => {
        form.inputValue = this.state.inputValue
        this.props.onSearch && this.props.onSearch(form)
        let timer = setTimeout(() => {
            clearTimeout(timer)
            timer = null
            this.setState({
                popoverVisible: false
            })
        }, 150)
    }
    setPopVisible = (visible) => {
        this.setState((state) => ({ popoverVisible: visible !== undefined ? visible : !state.popoverVisible }))
    }
    render() {
        const { placeholder, style, className, ...otherProps } = this.props
        const { inventoryOptions, businessOptions, categoryOptions, inputValue, popoverVisible } = this.state
        return (
            <div className={"ttk-stock-app-common-statements-filter " + (className || '')} style={style}>
                <Input
                    className="ttk-stock-app-common-statements-filter-input"
                    value={inputValue}
                    placeholder={placeholder || "请输入存货编号或存货名称"}
                    onPressEnter={this.handlePressEnter}
                    onChange={this.handleInputChange}
                    prefix={<Icon type="search" />}
                    addonAfter={
                        <StatementsFilterPopover
                            visible={popoverVisible}
                            setPopVisible={this.setPopVisible}
                            content={
                                <StatementsFilterPopoverContent
                                    {...otherProps}
                                    inventoryOptions={inventoryOptions}
                                    businessOptions={businessOptions}
                                    categoryOptions={categoryOptions}
                                    onSubmit={this.getPopoverData}
                                    ref={this.popoverDom}
                                />
                            }
                        />
                    }
                />
            </div>
        )
    }
}

class StatementsFilterPopover extends PureComponent {
    constructor(props) {
        super(props)
    }

    getPopupContainer = () => {
        return ReactDOM.findDOMNode(this).parentNode.parentNode
        // return document.querySelector(".ttk-stock-app-common-statements-filter")
    }

    render() {
        const { visible, content, setPopVisible } = this.props;
        return (
            <Popover
                visible={visible}
                content={content}
                trigger="click"
                onVisibleChange={v=>setPopVisible(v)}
                getPopupContainer={this.getPopupContainer}>
                <Icon className="filter-icon" type="filter" onClick={setPopVisible}></Icon>
            </Popover>
        )
    }
}

class StatementsFilterPopoverContent extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            period: null, // 期间--单月份
            periodRange: null, // 期间--多月份，数组
            inventory: 0, // 存货科目类型
            business: 0, // 业务类型
            category: 0, // 业务分类
            specialInv: false, // 无期初存货
            minusInv: false, // 负库存
        }
    }

    componentDidMount() {
        this.onReset()
    }

    // 禁用会计期间-单个月份
    disabledPeriod = date => {
        const { usePeriod } = this.props
        if (!usePeriod || !usePeriod.disabledDate) {
            return false
        } else {
            return date < moment(usePeriod.disabledDate)
        }
    }

    // 会计期间-单个月份
    periodChange = (date, period) => {
        this.setState({
            period,
        })
    }

    // 会计期间-同一年的多个月份
    monthRangePickerChange = periodRange => {
        this.setState({
            periodRange,
        })
    }

    getPopupContainer = () => {
        return ReactDOM.findDOMNode(this).parentNode
        // return document.querySelector(
        //     ".ttk-stock-app-common-statements-filter .ant-popover-inner-content"
        // )
    }

    // 存货科目和业务类型
    selectChange = key => e => {
        this.setState({
            [key]: e,
        })
    }

    // 无期初存货和负库存
    checkboxChange = key => e => {
        this.setState({
            [key]: e.target.checked,
        })
    }

    onSearch = debounce(
        () => {
            // console.log(this.state)
            const {
                usePeriod,
                usePeriodRange,
                useInventory,
                useBusiness,
                useCategory,
                useSpecialInv,
                useMinusInv,
                inventoryOptions,
                businessOptions,
                categoryOptions,
            } = this.props
            const { period, periodRange, inventory, business, category, specialInv, minusInv } = this.state
            const form = {}
            usePeriod && (form.period = period)
            usePeriodRange && (form.periodRange = periodRange)
            // useInventory && (form.inventory = inventoryOptions[inventory])
            if(useInventory) {
                form.inventory = inventoryOptions[inventory]
                form.inventory.index = inventory
            }
            // useBusiness && (form.business = businessOptions[business])
            if(useBusiness) {
                form.business = businessOptions[business]
                form.business.index = business
            }
            if(useCategory) {
                form.category = categoryOptions[category]
                form.category.index = category
            }
            useSpecialInv && (form.specialInv = specialInv)
            useMinusInv && (form.minusInv = minusInv)
            this.props.onSubmit(form)
        },
        500,
        true
    )

    onReset = (e) => {
        let {
            usePeriod,
            usePeriodRange,
            useInventory,
            useBusiness,
            useCategory,
            useSpecialInv,
            useMinusInv,
        } = this.props, form
        if(!e) {
            form = {
                period: (usePeriod && usePeriod.value) || null,
                periodRange: (usePeriodRange && usePeriodRange.value) || null,
                inventory: (useInventory && useInventory.value) || 0,
                business: (useBusiness && useBusiness.value) || 0,
                category: (useCategory && useCategory.value) || 0,
                specialInv: (useSpecialInv && useSpecialInv.value) || false,
                minusInv: (useMinusInv && useMinusInv.value) || false,
            }
        } else {
            form = {
                period: (usePeriod && usePeriod.defaultValue) || null,
                periodRange: null,
                inventory: 0,
                business: 0,
                category: 0,
                specialInv: false,
                minusInv: false,
            }
        }
        this.setState({...form})
    }

    render() {
        const {
            usePeriod,
            usePeriodRange,
            useInventory,
            useBusiness,
            useCategory,
            useSpecialInv,
            useMinusInv,
            inventoryOptions,
            businessOptions,
            categoryOptions
        } = this.props
        const { period, periodRange, inventory, business, category, minusInv, specialInv } = this.state

        return (
            <Fragment>
                <div className="popover-content-main">
                    {usePeriod && (
                        <div className="filter-item">
                            会计期间：
                            <MonthPicker
                                className="popover-content-main-date"
                                value={period ? moment(period) : undefined}
                                disabledDate={this.disabledPeriod}
                                onChange={this.periodChange}
                                style={{ flex: 1 }}
                            />
                        </div>
                    )}
                    {usePeriodRange && (
                        <div className="filter-item">
                            会计期间：
                            <MonthRangePicker
                                handleChange={this.monthRangePickerChange}
                                disabledDate={usePeriodRange && usePeriodRange.disabledDate}
                                periodRange={periodRange}
                                style={{ flex: 1 }}
                            />
                        </div>
                    )}
                    {useInventory && (
                        <div className="popover-content-main-select-wrapper filter-item">
                            存货类型：
                            <Select
                                className="popover-content-main-select"
                                getPopupContainer={this.getPopupContainer}
                                onChange={this.selectChange("inventory")}
                                value={inventory}
                                style={{ flex: 1 }}>
                                {inventoryOptions.map((el, i) => {
                                    return <Option value={i} key={el.name}>{el.name}</Option>
                                })}
                            </Select>
                        </div>
                    )}
                    {useBusiness && (
                        <div className="popover-content-main-select-wrapper filter-item">
                            业务类型：
                            <Select
                                className="popover-content-main-select"
                                getPopupContainer={this.getPopupContainer}
                                onChange={this.selectChange("business")}
                                value={business}
                                style={{ flex: 1 }}>
                                {businessOptions.map((el, i) => {
                                    return <Option value={i} key={el.name}>{el.name}</Option>
                                })}
                            </Select>
                        </div>
                    )}
                    {useCategory && (
                        <div className="popover-content-main-select-wrapper filter-item">
                            存货分类：
                            <Select
                                className="popover-content-main-select"
                                getPopupContainer={this.getPopupContainer}
                                onChange={this.selectChange("category")}
                                value={category}
                                style={{ flex: 1 }}>
                                {categoryOptions.map((el, i) => {
                                    return <Option value={i} key={el.name} title={el.name}>{el.name}</Option>
                                })}
                            </Select>
                        </div>
                    )}
                    {useSpecialInv && (
                        <div>
                            <Checkbox
                                className="popover-content-main-checkbox"
                                checked={specialInv}
                                onChange={this.checkboxChange("specialInv")}
                            />
                            显示无期初、无发生、无期末余额的存货
                        </div>
                    )}
                    {useMinusInv && (
                        <div>
                            <Checkbox
                                className="popover-content-main-checkbox"
                                checked={minusInv}
                                onChange={this.checkboxChange("minusInv")}
                            />
                            显示负库存
                        </div>
                    )}
                </div>
                <div className="popover-content-btn">
                    <Button
                        className="popover-content-btn-confirm"
                        type="primary"
                        onClick={this.onSearch}>
                        查询
                    </Button>
                    <Button onClick={this.onReset}>重置</Button>
                </div>
            </Fragment>
        )
    }
}