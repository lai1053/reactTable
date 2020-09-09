import React, { PureComponent, Fragment } from "react"
import { Input, Popover, Icon, Select, Button } from "edf-component"

export default class StockAppCompletionWarehousingFilter extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            visible: "",
            inputVal: props.component.props.searchVal || '',
            form: {
                inventoryType: "",
            },
            optionList: [],
        }
        this.component = props.component || {}
        this.metaAction = props.metaAction || {}
        this.webapi = props.webapi || {}
    }

    componentDidMount() {
        const timer = setTimeout(() => {
            clearTimeout(timer)
            this.load()
        }, 1000)
    }

    load = async () => {
        let options,
            requestParams = this.component.props.requestParams || {}
        if (
            this.component.props.selectOptions === undefined ||
            !this.component.props.selectOptions
        ) {
            let res = await this.webapi.stock.getInventoryTypesFromArchives(requestParams) //存货科目
            if (res && Object.prototype.toString.call(res) === "[object Array]") {
                options = this._parseSelectOption(res)
                options.splice(0, 0, {
                    inventoryClassId: "",
                    inventoryClassName: "全部",
                    isCompletion: false,
                })
            } else {
                this.metaAction.toast("error", res)
                options = []
            }
        } else {
            options = this.component.props.selectOptions || []
        }
        this.setState({ optionList: options })
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

    // 输入框回车事件
    handlePressEnter = e =>
        this.component.props.callback && this.component.props.callback({ name: e.target.value })

    // 输入框过滤
    handleInputChange = e => {
        this.setState({ inputVal: e.target.value })
        this.component.props.callback && this.component.props.callback({ name: e.target.value })
    }

    // 放大镜点击事件
    iconSearch = () => {
        this.component.props.callback &&
            this.component.props.callback({ name: this.state.form.inventoryType })
    }

    // 下拉框显示隐藏
    handleVisibleChange = v => {
        this.setState({ visible: v })
    }

    // 下拉列表选中
    selectChange = v => {
        this.setState({
            form: {
                ...this.state.form,
                inventoryType: v,
            },
        })
    }

    // 重置
    handlePopoverReset = () => {
        const inpVal = this.state.inputVal
        this.setState({
            form: {
                ...this.state.form,
                inventoryType: undefined,
            },
            visible: false,
        })
        this.component.props.callback &&
            this.component.props.callback({ name: inpVal, inventoryClassId: "" })
    }
    // 确定
    handlePopoverConfirm = () => {
        const inventoryTypeVal = this.state.form.inventoryType
        const inpVal = this.state.inputVal
        this.component.props.callback &&
            this.component.props.callback({ name: inpVal, inventoryClassId: inventoryTypeVal })
        this.setState({ visible: false })
    }

    render() {
        const { inputVal, visible, form, optionList } = this.state
        return (
            <div className="filter-container">
                <Input
                    className="filter-input"
                    value={inputVal}
                    placeholder="请输入存货编号或存货名称"
                    onPressEnter={this.handlePressEnter}
                    onChange={this.handleInputChange}
                    prefix={<Icon type="search" onClick={this.iconSearch} />}
                />
                <Popover
                    className="inv-batch-sale-list-popover"
                    trigger="click"
                    visible={visible}
                    onVisibleChange={this.handleVisibleChange}
                    placement="bottom"
                    content={
                        <PopoverContent
                            value={form.inventoryType}
                            optionList={optionList}
                            onChange={this.selectChange}
                            onConfirm={this.handlePopoverConfirm}
                            onReset={this.handlePopoverReset}
                        />
                    }>
                    <span className="filter-btn">
                        <Icon className="filter-icon" type="filter"></Icon>
                    </span>
                </Popover>
            </div>
        )
    }
}

class PopoverContent extends PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        const props = this.props
        return (
            <Fragment>
                <div className="ttk-stock-app-completion-warehousing-filter-search-filterOptions">
                    <span className="option1">存货类型：</span>
                    <Select
                        className="option1-txt"
                        value={props.value}
                        placeholder="请选择"
                        filterOption={false}
                        showSearch={true}
                        onChange={props.onChange}
                        getPopupContainer={trigger => trigger.parentNode}>
                        {props.optionList.map(el => {
                            return (
                                <Select.Option value={el.inventoryClassId}>
                                    {el.inventoryClassName}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
                <hr className="ttk-stock-app-completion-warehousing-filter-search-filterOptions-divisionLine"></hr>
                <div className="ttk-stock-app-completion-warehousing-filter-search-filterOptions-footer">
                    <Button
                        className="footerBtn footerBtn-confirm"
                        type="primary"
                        onClick={props.onConfirm}>
                        确定
                    </Button>
                    <Button
                        className="footerBtn footerBtn-reset"
                        type="default"
                        onClick={props.onReset}>
                        重置
                    </Button>
                </div>
            </Fragment>
        )
    }
}
