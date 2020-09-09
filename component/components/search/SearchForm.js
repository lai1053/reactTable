import React, { PureComponent } from 'react'
import { Form } from 'antd'
import moment from 'moment'
import antdFormItem from './antdFormItem'
import AssistForm from './AssistForm'
import Select from '../select/index'
// const Option = Select.Option
const FormItem = Form.Item

class SearchForm extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    renderChildOption = (type, option) => {
        if (!option) {
            return null
        }
        return option.map(item => {
            return React.createElement(type, item, <span title={item.label}>{item.label}</span>)
        })
    }
    renderCellContent = (accountingSubjectOptions) => {
        let res = []
        if (!accountingSubjectOptions) {
            return res
        }
        res = accountingSubjectOptions.map(item => {
            return (
                <Option
                    key={item.id}
                    // className="app-proof-of-charge-form-details-account"
                    value={item.code}
                    // keyRandom={keyRandom}
                    title={item.codeAndName}
                >
                    {item.codeAndName}
                </Option>
            )
        })
        return res
    }
    renderOption = (type, data, childType, option) => {
        if (data && data.props && data.props.accountingSubjectFlag) {
            return data
        } else {
            let arr = type.split('.')

            if (!childType) {
                if (arr.length == 1) {
                    return React.createElement(antdFormItem[type], data)
                } else {
                    return React.createElement(antdFormItem[arr[0]][arr[1]], data)
                }

            } else {
                if (arr.length == 1) {
                    return React.createElement(antdFormItem[type], data, this.renderChildOption(antdFormItem[type][childType], option))
                } else {
                    return React.createElement(antdFormItem[arr[0]][arr[1]], data, this.renderChildOption(antdFormItem[type][childType], option))
                }

            }
        }

    }

    needToBroadcast = (key, value) => {
        if (this.props.onChange) {
            this.props.onChange(key, value)
        }
    }
    renderProofFlag = (data) => {
        let name = data.key ? data.key.split('.')[data.key.split('.').length - 1] : data.props.key
        const { values } = this.props
        let nextMore = {}
        const { getFieldDecorator } = this.props.form
        let preMore = {}
        let more = {}
        let label = data.props.label
        data.onChange = (value) => { this.needToBroadcast(name, value) }
        // data.onMouseEnter = data.props.onMouseEnter
        return (
            <div className='select_proofFlag' onMouseEnter={data.props ? data.props.onMouseEnter(values) : ''}>
                <FormItem
                    label={<span>{label}</span>}
                >
                    {getFieldDecorator(name, {
                        initialValue: values ? values[name] : '',
                        ...more
                    })(
                        data.render ? data.render(data) : this.renderOption(data.type, data, data.childType, data.option)
                    )}
                </FormItem>
            </div>
        )

    }
    renderAssetFlag = (data) => {
        let name = data.key ? data.key.split('.')[data.key.split('.').length - 1] : data.props.key
        const { values } = this.props
        let nextMore = {}
        const { getFieldDecorator } = this.props.form
        let preMore = {}
        let more = {}
        let label = data.props.label
        data.onChange = (value) => { this.needToBroadcast(name, value) }
        // data.onMouseEnter = data.props.onMouseEnter
        return (
            <div className='select_assetFlag'>
                <FormItem
                    label={<span>{label}</span>}
                >
                    {getFieldDecorator(name, {
                        initialValue: values ? values[name] : '',
                        ...more
                    })(
                        data.render ? data.render(data) : this.renderOption(data.type, data, data.childType, data.option)
                    )}
                </FormItem>
            </div>
        )

    }
    renderRange = (data) => {
        const { name, type, pre, next, label, centerContent, isTime } = data
        const { values } = this.props
        const { getFieldDecorator } = this.props.form
        let more = type == 'Checkbox' ? { valuePropName: 'checked' } : {}
        let nextMore = next.rules ? { rules: next.rules } : {}
        let preMore = pre.rules ? { rules: pre.rules } : {}
        let pre_name = pre.name ? pre.name : `${name}_start`
        let next_name = next.name ? next.name : `${name}_end`

        if (next.decoratorDate) {
            next.disabledDate = (currentDate) => {
                return next.decoratorDate(currentDate, values[pre_name])
            }
            next.onChange = (value) => { this.needToBroadcast(next_name, value) }
            pre.onChange = (value) => { this.needToBroadcast(pre_name, value) }
            pre.disabledDate = (currentDate) => {
                return pre.decoratorDate(currentDate, values[next_name])
            }
        }
        if (next.props && next.props.accountingSubjectFlag) {
            next_name = next.key.split('.')[next.key.split('.').length - 1]
            pre_name = pre.key.split('.')[pre.key.split('.').length - 1]
            next.onChange = (value) => { this.needToBroadcast(next_name, value) }
            pre.onChange = (value) => { this.needToBroadcast(pre_name, value) }
            return (
                <div className='select_range' onMouseEnter={pre.props ? pre.props.onMouseEnter(values) : ''}>
                    <div className="select_range_label">{label}</div>
                    <FormItem >
                        {getFieldDecorator(pre_name, {
                            initialValue: values ? values[pre_name] : '',
                            ...more,
                            ...preMore
                        })(
                            pre.render ? pre.render(pre) : this.renderOption(pre_name, pre, pre.childType, pre.option)
                        )}
                    </FormItem>
                    <div className="select_range_content">{centerContent}</div>
                    <FormItem>
                        {getFieldDecorator(next_name, {
                            initialValue: values ? values[next_name] : '',
                            ...more,
                            ...nextMore,
                        })(
                            // <div onChange={(value) => { this.needToBroadcast(next_name, value) }} onMouseEnter={next.props?next.props.onMouseEnter:''}>
                            next.render ? next.render(next) : this.renderOption(next_name, next, next.childType, next.option)
                        )}
                    </FormItem>
                </div>
            )
        } else {
            return (
                <div className='select_range'>
                    <div className="select_range_label">{label}</div>
                    <FormItem>
                        {getFieldDecorator(pre_name, {
                            initialValue: values ? values[pre_name] : '',
                            ...more,
                            ...preMore
                        })(
                            pre.render ? pre.render(pre) : this.renderOption(pre.type, pre, pre.childType, pre.option)
                        )}
                    </FormItem>
                    <div className="select_range_content">{centerContent}</div>
                    <FormItem>
                        {getFieldDecorator(next_name, {
                            initialValue: values ? values[next_name] : '',
                            ...more,
                            ...nextMore,
                        })(

                            next.render ? next.render(next) : this.renderOption(next.type, next, next.childType, next.option)
                        )}
                    </FormItem>
                </div>
            )
        }

    }

    renderItem = () => {
        let { item, values } = this.props
        const { getFieldDecorator } = this.props.form
        let allDom = []
        let itemDom = []
        item = item.filter(o => o._visible !== false)
        item.forEach((data, index) => {

            const { name, range, label, type, className, render, children, option, childType, _visible } = data
            //if(_visible===false)return
            if (range) {
                itemDom.push(this.renderRange(data))
            } else if (data.props && data.props.proofFlag) {
                itemDom.push(this.renderProofFlag(data))
            } else if(data.props && data.props.assetFlag){
                itemDom.push(this.renderAssetFlag(data))
            }else if (type == 'AssistForm') {
                if (itemDom.length > 0) {
                    allDom.push(
                        <div className="mk_search_row">
                            {itemDom}
                            {index == item.length - 1 && item.length % 2 != 0 ? <FormItem></FormItem> : null}
                        </div>
                    )
                    itemDom = []
                }
                allDom.push(
                    <AssistForm
                        ref={form => this.props.target.assistForm = form}
                        {...data}
                    />
                )
                return
            } else {
                let more = type == 'Checkbox' ? { valuePropName: 'checked' } : {}
                itemDom.push(
                    <FormItem
                        label={<span>{label}</span>}
                    >
                        {getFieldDecorator(name, {
                            initialValue: values ? values[name] : '',
                            ...more
                        })(
                            render ? render(data) : this.renderOption(type, data, childType, option)
                        )}
                    </FormItem>
                )
            }
            if (itemDom.length == 2 || index == item.length - 1) {
                allDom.push(
                    <div className="mk_search_row">
                        {itemDom}
                        {index == item.length - 1 && item.length % 2 != 0 ? <FormItem></FormItem> : null}
                    </div>
                )
                itemDom = []
            }
        })
        return allDom
    }

    render() {
        const { getFieldDecorator } = this.props.form
        const data = this.props.data
        return (
            <Form>
                {this.renderItem()}
            </Form>
        )
    }
}

export default Form.create()(SearchForm) 