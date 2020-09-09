import React from "react"
import { Button, Popover } from "edf-component"
import { Input, Form, Icon, DatePicker, Select } from "antd"

const formItemLayout = {
    labelCol: {
        xs: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 18 },
    },
}

class PopoverFilter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props.params,
        }
    }
    onOk = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                Object.keys(values).forEach(key => {
                    if (values.key === "null") {
                        values[key] = null
                    }
                })
                this.handleSearch(values)
            }
        })
    }
    handleSearch(values) {
        const { onFilter } = this.props
        setTimeout(() => {
            onFilter(values)
            this.props.close && this.props.close()
        }, 100)
    }
    reset = () => {
        const { form } = this.props
        if (form) {
            form.resetFields()
            const values = form.getFieldsValue()
            this.handleSearch(values)
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form
        let { date, status } = this.state

        return (
            <Form className="ttk-filter-form-popover-content">
                <Form.Item label="日期:" {...formItemLayout}>
                    {getFieldDecorator("date", {
                        initialValue: date,
                    })(
                        <DatePicker.RangePicker className="other-storage-datepicker"></DatePicker.RangePicker>
                    )}
                </Form.Item>

                <Form.Item label="凭证状态:" {...formItemLayout}>
                    {getFieldDecorator("status", {
                        initialValue: status,
                    })(
                        <Select style={{ width: "100%" }}>
                            <Select.Option key="null" value={null}>
                                全部
                            </Select.Option>
                            <Select.Option key={0} value={0}>
                                未生成
                            </Select.Option>
                            <Select.Option key={1} value={1}>
                                已生成
                            </Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <div className="footer">
                    <Button type="primary" onClick={this.onOk}>
                        查询
                    </Button>
                    <Button onClick={this.reset}>重置</Button>
                </div>
            </Form>
        )
    }
}
const PopoverFilterForm = Form.create({
    name: "orther_storage_popover_filter_form",
})(PopoverFilter)

class FilterForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            keyword: "",
            btnActive: false,
            popVisible: false,
            params: props.params,
        }
        this.metaAction = props.metaAction || {}
    }
    componentDidMount() {}
    handlePopChange = visible => {
        this.setState({
            popVisible: visible,
            btnActive: visible,
        })
    }

    handleSearch(values) {
        if (values) {
            this.setState(
                {
                    params: values,
                },
                () => {
                    let obj = Object.assign(
                        {},
                        {
                            keyword: this.props.form.getFieldValue("keyword"),
                        },
                        values
                    )
                    this.props.onSearch(obj)
                }
            )
        } else {
            let obj = Object.assign({}, this.state.params, {
                keyword: this.props.form.getFieldValue("keyword"),
            })
            this.props.onSearch(obj)
        }
    }
    hide = () => {
        this.setState({
            popVisible: false,
            btnActive: false,
        })
    }
    onChange() {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(() => {
            this.handleSearch()
        }, 500)
    }
    onClick() {
        this.props.form.resetFields()
    }
    render() {
        const { keyword, params } = this.state
        const { getFieldDecorator } = this.props.form
        return (
            <Form className="filter-form" layout="inline" autocomplete="off">
                <Form.Item>
                    <Input.Group compact>
                        {getFieldDecorator("keyword", {
                            initialValue: keyword,
                        })(
                            <Input
                                className="filter-form-search"
                                placeholder="编号/存货名称"
                                onPressEnter={this.handleSearch.bind(this)}
                                onChange={this.onChange.bind(this)}
                                style={{ width: 210 }}
                                prefix={<Icon type="search" />}
                            />
                        )}
                        <Popover
                            overlayClassName="ttk-filter-form-popover filter-form-popover"
                            content={
                                <PopoverFilterForm
                                    params={params}
                                    onFilter={this.handleSearch.bind(this)}
                                    close={this.hide}
                                    hasState={this.props.hasState}
                                    checked={this.props.checked}
                                />
                            }
                            placement="bottom"
                            trigger="click"
                            visible={this.state.popVisible}
                            onVisibleChange={this.handlePopChange}>
                            <Button
                                icon="filter"
                                className={
                                    this.state.btnActive ? "filter-icon active" : "filter-icon"
                                }
                            />
                        </Popover>
                    </Input.Group>
                </Form.Item>
            </Form>
        )
    }
}

export default Form.create({
    name: "orther_storage_popover_filter_form",
})(FilterForm)
