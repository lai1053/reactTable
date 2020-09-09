import React, { PureComponent } from 'react'
import Select from '../antdSelect/index'
// import shouldCompare from 'react-addons-shallow-compare'
import isequal from 'lodash.isequal'

const Option = Select.Option

class ActiveLabelSelect extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectLabel: props.selectLabel ? props.selectLabel : props.option && props.option[0] ? props.option[0].key : '',
            value: props.value ? props.value : '',
            option: props.option || []
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (window.noshouldComponent) {
            return true
        }
        return !(isequal(this.props, nextProps) && isequal(this.state, nextState))
    }

    componentWillReceiveProps(nextProps) {
        let state = this.state
        const props = this.props
        let state2 = {
            ...state,
            option: nextProps.option || [],
            selectLabel: nextProps.selectLabel || '',
            value: nextProps.value ? nextProps.value : state.value
        }
        this.setState(state2)
    }

    renderLabelChildItem = () => {
        const { option, selectLabel } = this.state
        return option.map(item => {
            return <Option title={item.name} className="activeLabelSelect-option" key={item.key}>{item.name}</Option>
        })
    }

    labelChange = (value) => {
        let obj = {
            selectLabel: value,
            value: ''
        }
        this.setState(obj)
        this.updateToParent(obj)
    }

    renderLable = () => {
        let { option, selectLabel } = this.state
        const item = option.find(item => item.key == selectLabel)

        const propsValue = this.props.value
        if (item && (propsValue === null || propsValue === undefined || propsValue === '')) {
            this.state.value = item.value
        }
        if (!selectLabel) {
            selectLabel = option && option.length > 0 ? option[0].key : ''
        }
        return (
            <Select
                value={selectLabel}
                onChange={this.labelChange}
                dropdownClassName="activeLabelSelect-option-label-dropDown"
                className="mk-activeLabelSelect-label"
            >
                {this.renderLabelChildItem()}
            </Select>
        )
    }

    renderValueItem = (data) => {
        return data.map(item => {
            return <Option className="activeLabelSelect-option" _data={item} value={item.value.toString()} title={item.label}>{item.label}</Option>
        })
    }

    valueChange = (value) => {
        // this.state.value = value
        let obj = {
            value: value ? value : ''
        }
        this.setState(obj)
        this.updateToParent(obj)
    }

    renderValue = () => {
        let { option, selectLabel, value } = this.state
        let { filterOption } = this.props
        if (!selectLabel) {
            selectLabel = option && option.length > 0 ? option[0].key : ''
        }
        const item = option.find(item => item.key == selectLabel)
        console.log(value)
        return (
            <Select
                showSearch
                onChange={this.valueChange}
                value={value}
                onFocus={this.handleFocus}
                dropdownClassName="activeLabelSelect-option-value-dropDown"
                className="mk-activeLabelSelect-value"
                allowClear={true}
                filterOption={(input, option) => this.filterOption(input, option, item && item.children)}
            >
                {item && item.children ? this.renderValueItem(item.children) : null}
            </Select>
        )
    }
    filterOption = (inputValue, option, source) => {
        if (option && option.props && option.props.value) {
            // let accountingSubjects = this.metaAction.gf('data.creditAccountDataSource')
            let itemData = source.find(o => o.value == option.props.value)

            if ((itemData.code && itemData.code.indexOf(inputValue) == 0)
                // || (itemData.get('gradeName') && itemData.get('gradeName').indexOf(inputValue) != -1)
                || (itemData.name && itemData.name.indexOf(inputValue) != -1)
                || (itemData.helpCode && itemData.helpCode.toUpperCase().indexOf(inputValue.toUpperCase()) != -1)
                || (itemData.helpCodeFull && itemData.helpCodeFull.indexOf(inputValue) != -1)) {

                return true
            }
            else {
                return false
            }
        }
        return true
    }
    render() {
        return (
            <div className="mk-activeLabelSelect">
                {this.renderLable()}
                {this.renderValue()}
            </div>
        )
    }

    updateToParent = (params) => {
        const state = this.state
        if (this.props.onChange) {
            let {
                selectLabel = state.selectLabel,
                value = state.value,
                option = state.option
            } = params
            if (!selectLabel) {
                selectLabel = option && option.length > 0 ? option[0].key : ''
            }
            this.props.onChange(selectLabel, value)
        }
    }
}

export default ActiveLabelSelect