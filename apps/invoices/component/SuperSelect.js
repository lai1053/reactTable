import React, { PureComponent } from "react"
// import ReactDOM from 'react-dom';
import { Select, Icon } from "antd"
import debounce from "lodash/debounce"
import isEqual from "lodash.isequal"
// 页面实际渲染的下拉菜单数量，实际为 2 * ITEM_ELEMENT_NUMBER
const ITEM_ELEMENT_NUMBER = 30
// Select size 配置
const ITEM_HEIGHT_CFG = {
    small: 24,
    large: 40,
    default: 32,
}
// 箭头代码
const ARROW_CODE = {
    40: "down",
    38: "up",
}
// 下拉列表高度
const DROPDOWN_HEIGHT = 250

const addHandle = (ele, funName, fun) => {
    if (!ele) return
    if (ele.addEventListener) {
        ele.addEventListener(funName, fun, false)
    } else if (ele.attachEvent) {
        ele.attachEvent("on" + funName, fun)
    } else {
        ele["on" + funName] = fun
    }
}
const removeHandle = (ele, funName, fun) => {
    if (!ele) return
    if (ele.removeEventListener) {
        ele.removeEventListener(funName, fun, false)
    } else if (win.detachEvent) {
        ele.detachEvent("on" + funName, fun)
    } else {
        ele["on" + funName] = undefined
    }
}

export default class SuperSelect extends PureComponent {
    constructor(props) {
        super(props)
        const { mode, defaultValue, value } = props
        this.isMultiple = ["tags", "multiple"].includes(mode)
        // 设置默认 value
        let defaultV = this.isMultiple ? [] : ""
        defaultV = value || defaultValue || defaultV
        // 下拉菜单项行高
        this.ITEM_HEIGHT = ITEM_HEIGHT_CFG[props.size || "default"]
        // 可视区 dom 高度
        this.visibleDomHeight = this.ITEM_HEIGHT * ITEM_ELEMENT_NUMBER
        // 滚动时重新渲染的 scrollTop 判断值，大于 reactDelta 则刷新下拉列表
        this.reactDelta = this.visibleDomHeight / 3
        // 上一次滚动的 scrollTop 值
        this.prevScrollTop = 0
        // 上一次按下方向键时 scrollTop 值
        this.prevTop = 0
        // 当前滚动位置
        this.scrollTop = 0
        // className
        this.dropdownClassName = `vs-dropdown-${+new Date()}`
        // Select id
        this.id = `vs-id-${+new Date()}`
        // 防抖
        this.debounceScrollReal = debounce(this.onScrollReal, 200)
        //
        this.footerBtn = (
            <Select.Option
                key="vs_footer_add_btn"
                style={{
                    width: "100%",
                    height: "30px",
                    position: "absolute",
                    bottom: "0px",
                    left: 0,
                    right: 0,
                    backgroundColor: "#0066B3",
                    color: "#ffffff",
                    textAlign: "center",
                    cursor: "pointer",
                    lineHeight: "20px",
                    fontSize: "12px",
                    zIndex: "1099",
                }}
                onClick={() => this.props.footerClick && this.props.footerClick()}
                value="vs_footer_add_btn_val"
                disabled={this.props.footerDisabled}>
                {" "}
                新 增
            </Select.Option>
        )
        this.state = {
            children: props.children || [],
            filterChildren: null,
            value: defaultV,
            selectOptions: [],
        }
    }
    componentWillReceiveProps(prevProps, prevState) {}
    componentDidMount() {
        this.setVirtualChildrenList()
        // defaultOpens=true 时添加滚动事件
        setTimeout(() => {
            this.addEvent()
        }, 500)
    }
    componentDidUpdate(prevProps) {
        const { mode, defaultValue, value, children, isNeedAdd } = this.props
        this.isMultiple = ["tags", "multiple"].includes(mode)
        let defaultV = this.isMultiple ? [] : ""
        defaultV = value || defaultValue || defaultV
        if (!isEqual(prevProps.children, children)) {
            let obj = {
                children: children || [],
                filterChildren: null,
            }
            if (prevProps.value !== value) {
                obj.value = defaultV
                this.scrollToValue()
            }
            this.setState(obj, () => {
                this.setVirtualChildrenList()
            })
        } else if (prevProps.value !== value) {
            // 属性值变化时回填
            // 更新时设置默认 value
            this.scrollToValue()
            this.setState({ value: defaultV }, () => {
                this.setVirtualChildrenList()
            })
        }
    }
    componentWillUnmount() {
        this.removeEvent()
    }
    // value 存在时需要滚动到 value 所在位置，如果
    scrollToValue() {
        const { children, value } = this.props,
            index = children.findIndex(item => item.key == value) || 0
        this.scrollTop = this.ITEM_HEIGHT * index
        this.needFocusScrollToValue = true
        // setTimeout(() => {
        // this.forceUpdate();
        // this.throttleByHeight(null, scrollTop);
        // }, 0);
    }

    addEvent() {
        this.inputEle = document.querySelector(`#${this.id}`)
        if (!this.inputEle) return
        addHandle(this.inputEle, "keydown", ::this.onKeyDown)

        this.scrollEle = document.querySelector(`.${this.dropdownClassName}`)
        // 下拉菜单未展开时元素不存在
        if (!this.scrollEle) return
        // addHandle(this.scrollEle, 'scroll', ::this.onScroll);
        addHandle(this.scrollEle, "mousedown", ::this.handleMouseDown)
        addHandle(this.scrollEle, "mouseup", ::this.handleMouseUp)
    }
    removeEvent() {
        if (!this.inputEle) return
        removeHandle(this.inputEle, "keydown", this.onKeyDown)

        if (!this.scrollEle) return
        // removeHandle(this.scrollEle, 'scroll', this.onScroll);
        removeHandle(this.scrollEle, "mousedown", this.handleMouseDown)
        removeHandle(this.scrollEle, "mouseup", this.handleMouseUp)
    }

    handleMouseDown(e) {
        // e && e.preventDefault && e.preventDefault();
        this.MouseDown = true
    }
    handleMouseUp() {
        this.MouseDown = false
    }
    // 模拟 antd select 按下 上下箭头 键时滚动列表
    onKeyDown(e) {
        const { keyCode } = e || {}
        setTimeout(() => {
            const activeItem = document.querySelector(
                `.${this.dropdownClassName} .ant-select-dropdown-menu-item-active`
            )
            if (!activeItem) return
            const { offsetTop } = activeItem
            const isUp = ARROW_CODE[keyCode] === "up"
            const isDown = ARROW_CODE[keyCode] === "down"

            // 在所有列表第一行按上键
            if (offsetTop - this.prevTop > DROPDOWN_HEIGHT && isUp) {
                this.scrollEle.scrollTo(0, this.allHeight - DROPDOWN_HEIGHT)
                this.prevTop = this.allHeight

                return
            }

            // 在所有列表中最后一行按下键
            if (this.prevTop > offsetTop + DROPDOWN_HEIGHT && isDown) {
                this.scrollEle.scrollTo(0, 0)
                this.prevTop = 0

                return
            }

            this.prevTop = offsetTop
            // 向下滚动到下拉框最后一行时，向下滚动一行的高度
            if (
                offsetTop > this.scrollEle.scrollTop + DROPDOWN_HEIGHT - this.ITEM_HEIGHT + 10 &&
                isDown
            ) {
                this.scrollEle.scrollTo(0, this.scrollTop + this.ITEM_HEIGHT)
                return
            }
            // 向上滚动到下拉框第一一行时，向上滚动一行的高度
            if (offsetTop < this.scrollEle.scrollTop && isUp) {
                this.scrollEle.scrollTo(0, this.scrollTop - this.ITEM_HEIGHT)
            }
        }, 100)
    }
    onScroll(e) {
        this.throttleByHeight(e)
    }
    onScrollReal() {
        // 重新渲染列表组件
        this.setVirtualChildrenList()
        this.prevScrollTop = this.scrollTop
    }
    throttleByHeight(e, top) {
        this.scrollTop = top || (e && e.target && e.target.scrollTop) || 0
        if (!this.scrollTarget) {
            this.scrollTarget = e && e.target
        }
        if (!this.scrollTop && this.scrollTop !== 0 && this.prevScrollTop) {
            this.scrollTarget.scrollTop = this.prevScrollTop
            return
        }
        // 滚动的高度
        let delta = Math.abs(this.prevScrollTop - this.scrollTop)
        if (this.MouseDown) {
            delta > this.reactDelta && this.debounceScrollReal()
        } else {
            delta > this.reactDelta && this.onScrollReal()
        }!top && this.props.onPopupScroll && this.props.onPopupScroll(e)
    }

    // 列表可展示所有 children
    getUseChildrenList() {
        return this.state.filterChildren || this.state.children
    }
    getStartAndEndIndex() {
        // 滚动后显示在列表可视区中的第一个 item 的 index
        const showIndex = Number((this.scrollTop / this.ITEM_HEIGHT).toFixed(0))

        const startIndex =
            showIndex - ITEM_ELEMENT_NUMBER < 0 ? 0 : showIndex - ITEM_ELEMENT_NUMBER / 2
        const endIndex = showIndex + ITEM_ELEMENT_NUMBER
        return { startIndex, endIndex }
    }
    onDeselect(value) {
        const { onDeselect, onChange } = this.props

        // this.setState(
        //     { value: this.state.value.filter(item => item !== value) },
        //     state => {
        //         onChange && onChange(this.state.value);
        //     }
        // );
        onDeselect && onDeselect(value)
    }
    // 在搜索重新计算下拉滚动条高度
    onChange(value, opt) {
        if (value && typeof value == "string" && value.includes("vs_footer_add_btn_val")) {
            return
        }
        const { showSearch, onChange, autoClearSearchValue } = this.props
        if (showSearch || this.isMultiple) {
            // 搜索模式下选择后是否需要重置搜索状态
            if (autoClearSearchValue !== false) {
                this.setState({ filterChildren: null }, () => {
                    // 搜索成功后重新设置列表的总高度
                    this.setVirtualChildrenList()
                })
            }
        }
        // this.setState({ value });
        if (onChange) onChange(value, opt)
        else {
            try {
                this.props.value = value
            } catch (ex) {}
        }
    }

    onSearch(v) {
        const { showSearch, onSearch, filterOption, children, isNeedAdd } = this.props

        if (showSearch && filterOption !== false) {
            // 须根据 filterOption（如有该自定义函数）手动 filter 搜索匹配的列表
            let filterChildren = null
            if (typeof filterOption === "function") {
                filterChildren = children.filter(item => filterOption(v, item))
            } else if (filterOption === undefined) {
                filterChildren = children.filter(item => this.filterOption(v, item))
            }
            // 设置下拉列表显示数据
            this.setState({ filterChildren: v === "" ? null : filterChildren }, () => {
                // 搜索成功后需要重新设置列表的总高度
                this.setVirtualChildrenList()
            })
        }
        onSearch && onSearch(v)
    }

    filterOption(v, option) {
        // 自定义过滤对应的 option 属性配置
        const filterProps = this.props.optionFilterProp || "value"
        return `${option.props[filterProps]}`.indexOf(v) >= 0
    }
    handleFocus() {
        this.props.onFocus && this.props.onFocus()
        if (!this.eventTimer) {
            this.eventTimer = setTimeout(() => {
                this.addEvent()
                this.focusScrollToValue()
            }, 200)
        }
        this.focusScrollToValue()
    }
    handleBlur() {
        this.props.onBlur && this.props.onBlur()
    }
    // dropdown 获取焦点时，如需要滚动选中值的位置，则滚动
    focusScrollToValue() {
        if (this.needFocusScrollToValue && this.scrollEle) {
            setTimeout(() => {
                this.scrollEle.scrollTop = this.scrollTop
                this.needFocusScrollToValue = false
            }, 100)
        }
    }

    setVirtualChildrenList() {
        const allList = this.getUseChildrenList(),
            { startIndex, endIndex } = this.getStartAndEndIndex()
        let options = [],
            startItem = (
                <div
                    key="super-select-start-item"
                    style={{ height: 0, width: "100%" }}>{`   `}</div>
            ),
            endItem = (
                <div key="super-select-end-item" style={{ height: 0, width: "100%" }}>{`   `}</div>
            )

        Array.isArray(allList) &&
            allList.forEach((item, i) => {
                if (i < startIndex) {
                    startItem.props.style.height =
                        Number(startItem.props.style.height) +
                        Number(
                            String(
                                (item.props.style && item.props.style.height) || this.ITEM_HEIGHT
                            ).replace("px", "")
                        )
                }
                if (i >= startIndex && i <= endIndex) {
                    options.push(item)
                }
                if (i > endIndex) {
                    endItem.props.style.height =
                        Number(endItem.props.style.height) +
                        Number(
                            String(
                                (item.props.style && item.props.style.height) || this.ITEM_HEIGHT
                            ).replace("px", "")
                        )
                }
            })
        if (startItem.props.style.height > 0) {
            startItem.props.style.height += "px"
            options.unshift(startItem)
        }
        if (endItem.props.style.height > 0) {
            endItem.props.style.height += "px"
            options.push(endItem)
        }

        this.setState({ selectOptions: options })
    }
    handleFooterAdd(event) {
        event.stopPropagation && event.stopPropagation()
        event.nativeEvent && event.nativeEvent.stopPropagation && event.nativeEvent.stopPropagation()
        this.props.footerClick && this.props.footerClick()
    }
    handleSelect(v) {
        if (v === 'vs_footer_add_btn_val')
            return
        this.props.onSelect && this.props.onSelect(v)
    }
    render() {
        let {
            dropdownStyle,
            optionLabelProp,
            notFoundContent,
            dropdownMenuStyle,
            isNeedAdd,
            filterOption,
            ...props
        } = this.props

        dropdownStyle = {
            ...dropdownStyle,
        }
        dropdownMenuStyle = {
            backgroundImage: "linear-gradient(0deg,rgba(249, 249, 249, 0.7) 50%,#fff 50%)",
            backgroundSize: `100% ${this.ITEM_HEIGHT * 2}px`,
            ...dropdownMenuStyle,
        }

        const { selectOptions } = this.state

        // 判断处于 antd Form 中时不自动设置 value
        const _props = { ...props }
        // 先删除 value，再手动赋值，防止空 value 影响 placeholder
        // delete _props.value;
        _props.value = _props.value || _props.defaultValue
        // value 为空字符会隐藏 placeholder，改为 undefined
        if (typeof _props.value === "string" && !_props.value) {
            _props.value = undefined
        }

        optionLabelProp = optionLabelProp || "children"
        if (isNeedAdd) {
            dropdownMenuStyle = {
                ...dropdownMenuStyle,
                marginBottom: "30px",
            }
        }
        let footerBtn = (
            <Select.Option
                key="vs_footer_add_btn"
                style={{
                    width: "100%",
                    height: "30px",
                    position: "absolute",
                    bottom: "0px",
                    left: 0,
                    right: 0,
                    backgroundColor: "#0066B3",
                    color: "#ffffff",
                    cursor: "pointer",
                    lineHeight: "20px",
                    fontSize: "12px",
                    display:'flex',
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'center',
                    zIndex: "1099",
                }}
                onClick={::this.handleFooterAdd}
                value="vs_footer_add_btn_val"
                disabled={this.props.footerDisabled}>
                <Icon type="plus-circle-o" style={{fontSize:'14px',marginRight:'6px'}}/>
                新 增
            </Select.Option>
        )
        return (
            <Select
                {..._props}
                filterOption={false}
                defaultActiveFirstOption={false}
                id={this.id}
                key={this.id}
                onSelect={::this.handleSelect}
                onSearch={::this.onSearch}
                onChange={::this.onChange}
                dropdownClassName={this.dropdownClassName}
                optionLabelProp={optionLabelProp}
                dropdownStyle={dropdownStyle}
                dropdownMenuStyle={dropdownMenuStyle}
                onDeselect={::this.onDeselect}
                onFocus={::this.handleFocus}
                onBlur={::this.handleBlur}
                onPopupScroll={::this.onScroll}
                children={[...selectOptions, isNeedAdd ? footerBtn : null]}
            />
        )
    }
}