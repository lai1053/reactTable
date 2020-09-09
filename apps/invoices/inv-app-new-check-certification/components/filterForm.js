import React from "react";
import { Button, DatePicker, Popover } from "edf-component";
import { Input, Form, Icon, Select } from "antd";

const formItemLayout = {
    labelCol: {
        xs: { span: 6 }
    },
    wrapperCol: {
        xs: { span: 18 }
    }
};

class PopoverFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props.params
        };
    }
    onOk = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                Object.keys(values).forEach(key => {
                    if (values.key === "null") {
                        values[key] = null;
                    }
                });
                this.handleSearch(values);
            }
        });
    };
    handleSearch(values) {
        const { onFilter } = this.props;
        setTimeout(() => {
            onFilter(values);
            this.props.close && this.props.close();
        }, 100);
    }
    reset = () => {
        const { form } = this.props;
        if (form) {
            form.resetFields();
            const values = form.getFieldsValue();
            this.handleSearch(values);
        }
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        let { fpzlDm, fphm, sbPurpose, bdzt, date } = this.state;
        const { checked, hasState } = this.props;
        let sbytVisible = checked === 2 || !checked ? true : false;
        let stateVisible = checked === 2 || !checked ? true : false;

        return (
            <Form className="ttk-filter-form-popover-content">
                <Form.Item label="发票类型:" {...formItemLayout}>
                    {getFieldDecorator("fpzlDm", {
                        initialValue: fpzlDm
                    })(
                        <Select style={{ width: "100%" }}>
                            <Select.Option key="null" value={null}>
                                全部
                            </Select.Option>
                            <Select.Option key="01" value="01">
                                增值税专用发票
                            </Select.Option>
                            <Select.Option key="03" value="03">
                                机动车销售发票
                            </Select.Option>
                            <Select.Option key="17" value="17">
                                通行费
                            </Select.Option>
                        </Select>
                    )}
                </Form.Item>

                <Form.Item label="发票号码" {...formItemLayout}>
                    {getFieldDecorator("fphm", {
                        initialValue: fphm
                    })(
                        <Input
                            style={{ width: "100%" }}
                            placeholder="请输入发票号码"
                        />
                    )}
                </Form.Item>

                {sbytVisible && (
                    <Form.Item label="申报用途:" {...formItemLayout}>
                        {getFieldDecorator("sbPurpose", {
                            initialValue: sbPurpose
                        })(
                            <Select style={{ width: "100%" }}>
                                <Select.Option key="null" value={null}>
                                    全部
                                </Select.Option>
                                <Select.Option key={1} value={1}>
                                    抵扣
                                </Select.Option>
                                <Select.Option key={6} value={6}>
                                    不抵扣
                                </Select.Option>
                            </Select>
                        )}
                    </Form.Item>
                )}
                {stateVisible && hasState && (
                    <Form.Item label="认证状态:" {...formItemLayout}>
                        {getFieldDecorator("bdzt", {
                            initialValue: bdzt
                        })(
                            <Select style={{ width: "100%" }}>
                                <Select.Option key="null" value={null}>
                                    全部
                                </Select.Option>
                                <Select.Option key={0} value={0}>
                                    未认证
                                </Select.Option>
                                <Select.Option key={1} value={1}>
                                    已认证
                                </Select.Option>
                            </Select>
                        )}
                    </Form.Item>
                )}

                <Form.Item label="开票日期:" {...formItemLayout}>
                    {getFieldDecorator("date", {
                        initialValue: date
                    })(<DatePicker.RangePicker></DatePicker.RangePicker>)}
                </Form.Item>

                <div className="footer">
                    <Button type="primary" onClick={this.onOk}>
                        查询
                    </Button>
                    <Button onClick={this.reset}>重置</Button>
                </div>
            </Form>
        );
    }
}
const PopoverFilterForm = Form.create({
    name: "inv_app_new_check_cetifi_popover_filter_form"
})(PopoverFilter);

class FilterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            xfmc: "",
            btnActive: false,
            popVisible: false,
            params: props.params
        };
        this.metaAction = props.metaAction || {};
    }
    componentDidMount() {}
    handlePopChange = visible => {
        this.setState({
            popVisible: visible,
            btnActive: visible
        });
    };

    handleSearch(values) {
        if (values) {
            this.setState(
                {
                    params: values
                },
                () => {
                    let obj = Object.assign(
                        {},
                        {
                            xfmc: this.props.form.getFieldValue("xfmc")
                        },
                        values
                    );
                    this.props.onSearch(obj);
                }
            );
        } else {
            console.log("from press");
            let obj = Object.assign({}, this.state.params, {
                xfmc: this.props.form.getFieldValue("xfmc")
            });
            this.props.onSearch(obj);
        }
    }
    hide = () => {
        this.setState({
            popVisible: false,
            btnActive: false
        });
    };

    onClick() {
        this.props.form.resetFields();
    }
    render() {
        const { xfmc, params } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Form className="iancccd-filter-form" layout="inline">
                <Form.Item>
                    <Input.Group compact>
                        {getFieldDecorator("xfmc", {
                            initialValue: xfmc
                        })(
                            <Input
                                className="iancccd-filter-form-search"
                                placeholder="请输入销方名称"
                                onPressEnter={e => this.handleSearch()}
                                style={{ width: 210 }}
                                prefix={<Icon type="search" />}
                            />
                        )}
                        <Popover
                            overlayClassName="ttk-filter-form-popover iancccd-filter-form-popover"
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
                            onVisibleChange={this.handlePopChange}
                        >
                            <Button
                                icon="filter"
                                className={
                                    this.state.btnActive
                                        ? "filter-icon active"
                                        : "filter-icon"
                                }
                            />
                        </Popover>
                    </Input.Group>
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({
    name: "inv_app_new_check_certification_filter_form"
})(FilterForm);
