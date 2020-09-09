import React, { PureComponent } from "react"
import { Button, Popover } from "edf-component"
import { Input, Form, Icon, Row, Col, Select } from "antd"
import { fromJS } from "immutable"
const formItemLayout = {
    labelCol: {
        xs: { span: 8 }
    },
    wrapperCol: {
        xs: { span: 16 }
    }
}
class PopoverFilter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    onOk(e) {
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

    reset() {
        const { form } = this.props
        if (form) {
            form.resetFields()
            const values = form.getFieldsValue()
            this.handleSearch(values)
        }
    }

    render() {
        const { form, params, checked } = this.props,
            { getFieldDecorator } = form,
            { clientState, totalSignState } = params
        let stateOption, toolOption
        if (Number(checked)) {
            stateOption = [
                <Select.Option key="null" value={null}>
                    全部
                </Select.Option>,
                <Select.Option key={1} value={1}>
                    未签名
                </Select.Option>,
                <Select.Option key={3} value={3}>
                    签名失败
                </Select.Option>
            ]
            toolOption = [
                <Select.Option key={4} value={4}>
                    全部
                </Select.Option>,
                <Select.Option key={3} value={3}>
                    已连接
                </Select.Option>,
                <Select.Option key={2} value={2}>
                    未连接
                </Select.Option>
            ]
        } else {
            stateOption = [
                <Select.Option key="null" value={null}>
                    全部
                </Select.Option>,
                <Select.Option key={1} value={1}>
                    未签名
                </Select.Option>,
                <Select.Option key={2} value={2}>
                    签名中
                </Select.Option>,
                <Select.Option key={3} value={3}>
                    签名失败
                </Select.Option>,
                <Select.Option key={10} value={10}>
                    预约中
                </Select.Option>,
                <Select.Option key={4} value={4}>
                    已签名
                </Select.Option>,
                <Select.Option key={5} value={5}>
                    撤销中
                </Select.Option>,
                <Select.Option key={6} value={6}>
                    撤销失败
                </Select.Option>
            ]
            toolOption = [
                <Select.Option key={4} value={4}>
                    全部
                </Select.Option>,
                <Select.Option key={3} value={3}>
                    已连接
                </Select.Option>,
                <Select.Option key={1} value={1}>
                    未安装
                </Select.Option>,
                <Select.Option key={2} value={2}>
                    未连接
                </Select.Option>
            ]
        }
        return (
            <Form className="ttk-filter-form-popover-content">
                <Row>
                    <Col>
                        <Form.Item label="状态：" {...formItemLayout}>
                            {getFieldDecorator("totalSignState", {
                                initialValue: totalSignState
                            })(
                                <Select style={{ width: "100%" }}>
                                    {stateOption}
                                </Select>
                            )}
                        </Form.Item>
                    </Col>

                    <Col>
                        <Form.Item label="发票管理工具:" {...formItemLayout}>
                            {getFieldDecorator("clientState", {
                                initialValue: clientState
                            })(
                                <Select
                                    style={{ width: "100%" }}
                                    placeholder="请选择"
                                >
                                    {toolOption}
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                </Row>
                <div className="footer">
                    <Button type="primary" onClick={::this.onOk}>
                        查询
                    </Button>
                    <Button onClick={::this.reset}>重置</Button>
                </div>
            </Form>
        )
    }
}
const PopoverFilterForm = Form.create({
    name: "inv_app_new_check_batch_cetifi_popover_filter_form"
})(PopoverFilter)
class FilterForm extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            customerNameOrMemCode: "",
            btnActive: false,
            popVisible: false
        }
        this.metaAction = props.metaAction || {}
    }

    handlePopChange(visible) {
        this.setState({
            popVisible: visible,
            btnActive: visible
        })
    }

    async handleSearch(values) {
        const { form, initPage } = this.props,
            { getFieldValue } = form
        let params = {}
        if (values) {
            params = { ...values }
        }
        await this.metaAction.sfs({
            "data.params": fromJS({
                ...params,
                customerNameOrMemCode: getFieldValue("customerNameOrMemCode")
            })
        })
        initPage && initPage()
    }

    hide() {
        this.setState({
            popVisible: false,
            btnActive: false
        })
    }

    render() {
        const { customerNameOrMemCode, popVisible, btnActive } = this.state
        const { form, checked, params } = this.props
        const { getFieldDecorator } = form

        return (
            <Form className="ianbcc-filter-form" layout="inline">
                <Form.Item>
                    <Input.Group compact>
                        {getFieldDecorator("customerNameOrMemCode", {
                            initialValue: customerNameOrMemCode
                        })(
                            <Input
                                className="ianbcc-filter-form-search"
                                placeholder="请输入客户名称或助记码"
                                onPressEnter={e => this.handleSearch()}
                                style={{ width: 210 }}
                                prefix={<Icon type="search" />}
                            />
                        )}
                        <Popover
                            overlayClassName="ttk-filter-form-popover ianbcc-filter-form-popover"
                            placement="bottomRight"
                            content={
                                <PopoverFilterForm
                                    params={params}
                                    onFilter={this.handleSearch.bind(this)}
                                    close={::this.hide}
                                    checked={checked}
                                />
                            }
                            placement="bottom"
                            trigger="click"
                            visible={popVisible}
                            onVisibleChange={::this.handlePopChange}
                        >
                            <Button
                                icon="filter"
                                className={
                                    btnActive
                                        ? "filter-icon active"
                                        : "filter-icon"
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
    name: "inv_app_new_check_batch_certification_filter_form"
})(FilterForm)
