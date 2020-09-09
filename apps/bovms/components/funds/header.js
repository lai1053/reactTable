import React from 'react'
import FilterForm from '../filterForm/index'
import { Form, Icon } from 'antd';
import { Input, Select, Button, DatePicker, Dropdown, Menu, Popover, Col } from 'edf-component';
import moment from 'moment'
import { fromJS } from 'immutable'
const { Option } = Select;

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}
const formItemLayout = {
    labelCol: {
        xs: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 18 },
    },
};
class PopoverFilter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ...(props.filterData || {}),
            fpzlList: [],
        };
    }
    componentDidMount = async () => {

    }
    onOk = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                Object.keys(values).forEach(key => {
                    if (values.key === 'null') {
                        values[key] = null;
                    }
                })
                // this.props.handleSubmit && this.props.handleSubmit(values)
                // console.log('Received values of form: ', values,handleMenuClick,);
                this.handleSearch(values);

            }
        });
    }
    handleSearch(values) {
        const { handleMenuClick, metaAction } = this.props;
        if (handleMenuClick && metaAction) {
            let filterData = metaAction.gf('data.filterData').toJS();
            filterData = {
                ...filterData,
                ...values,
            }
            // filterData.invKindCode = values.invKindCode;
            // filterData.rzzt = values.rzzt;
            // filterData.minAmount = values.minAmount;
            // filterData.maxAmount = values.maxAmount;
            // filterData.accountMatchState=values.accountMatchState;
            metaAction.sf('data.filterData', fromJS(filterData));
            setTimeout(() => {
                const fn = handleMenuClick('searchPage');
                fn && fn();
                this.props.close && this.props.close();
            }, 100)
        }
    }
    reset = () => {
        const { handleMenuClick, metaAction, form } = this.props;
        if (form) {
            form.resetFields();
            const values = form.getFieldsValue();
            this.handleSearch(values)
        }

    }

    render() {
        const { getFieldDecorator } = this.props.form,
            vatTaxpayer = this.props.metaAction.gf('data.accountInfo.vatTaxpayer');
        let { flowfundType, accountMatchState, startAmount, endAmount } = this.state;

        // console.log('PopoverFilter:', this.state, this.props)
        return (
            <Form className="ttk-filter-form-popover-content">
                <Form.Item label="收付款类型" {...formItemLayout}>
                    {getFieldDecorator('flowfundType', {
                        initialValue: flowfundType,
                    })(<Select
                        getPopupContainer={trigger => trigger.parentNode}
                        style={{ width: '100%' }}
                    >
                        <Select.Option key='null' value={null}>全部</Select.Option>
                        <Select.Option key='1' value={1}>收款</Select.Option>
                        <Select.Option key='2' value={2}>付款</Select.Option>
                    </Select>)}
                </Form.Item>

                <Form.Item label="会计科目" {...formItemLayout}>
                    {getFieldDecorator('accountMatchState', {
                        initialValue: accountMatchState,
                    })(<Select
                        getPopupContainer={trigger => trigger.parentNode}
                        style={{ width: '100%' }}
                    >
                        <Select.Option key='null' value={null}>全部</Select.Option>
                        <Select.Option key='1' value={1}>已匹配</Select.Option>
                        <Select.Option key='0' value={0}>未匹配</Select.Option>
                    </Select>)}
                </Form.Item>

                <Form.Item label="交易金额" {...formItemLayout}>
                    <Col span={11}>
                        <Form.Item >
                            {getFieldDecorator('startAmount', {
                                initialValue: startAmount,
                                // normalize: (value, prevValue, allValues) => {
                                //     if (!value) {
                                //         return value;
                                //     }
                                //     if (String(value).match(/^\d+(\.\d{1,2})?$/)) {
                                //         return value;
                                //     } else {
                                //         return prevValue;
                                //     }
                                // },
                            })(<Input.Number />)}
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>-</span>
                    </Col>
                    <Col span={11}>
                        <Form.Item>
                            {getFieldDecorator('endAmount', {
                                initialValue: endAmount,
                                // normalize: (value, prevValue, allValues) => {
                                //     if (!value) {
                                //         return value;
                                //     }
                                //     if (String(value).match(/^\d+(\.\d{1,2})?$/)) {
                                //         return value;
                                //     } else {
                                //         return prevValue;
                                //     }
                                // },
                            })(<Input.Number />)}
                        </Form.Item>
                    </Col>
                </Form.Item>

                <div className="footer">
                    <Button type="primary" onClick={this.onOk}>查询</Button>
                    <Button onClick={this.reset}>重置</Button>
                </div>
            </Form>
        );
    }
}

const PopoverFilterForm = Form.create({ name: 'bovms_purchase_popover_filter_form' })(PopoverFilter)

export default class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            btnActive: false,
            popVisible: false,
        };
        this.metaAction = props.metaAction || {};
    }
    componentDidMount() {
        // To disabled submit button at the beginning.
        // this.props.form.validateFields();
    }
    authStateList = [{ value: null, label: '全部' }, { value: '2', label: '已记账' }, { value: '', label: '未记账' }];
    disabledStartDate = startValue => {
        return startValue.valueOf() < new Date(moment(this.metaAction.gf('data.accountInfo.enabledYearAndMonth')).subtract(1, "month").format('YYYY-MM-DD').substr(0, 7)).valueOf() ||
            startValue.valueOf() > new Date().valueOf()
    };
    handleSubmit = (value, type) => {
        const { handleMenuClick } = this.props;
        const filterData = this.metaAction.gf('data.filterData').toJS();
        let fnType = type,
            field = type.replace('Search', '');
        if (type.endsWith('Search')) {
            fnType = 'searchPage';
            filterData[field] = value;
            if (field == 'name') {
                filterData['partyAcctOrSummaryName'] = value;
            }
            this.metaAction.sf('data.filterData', fromJS(filterData));
        }

        setTimeout(() => {
            if (handleMenuClick) {
                const fn = handleMenuClick(fnType);
                if (type === 'initPage') {
                    fn && fn(value);
                } else if (type === 'changeBankAcct') {
                    fn && fn(filterData.yearPeriod, value);
                } else {
                    fn && fn();
                }
            }
        }, 100);
    }

    handlePopChange = visible => {
        this.setState({
            popVisible: visible,
            btnActive: visible,
        })
    }

    hide = () => {
        this.setState({
            popVisible: false,
            btnActive: false,
        });
    }

    renderFilterFormItems = (form) => {
        let { getFieldDecorator } = form
        let { yearPeriod, bankAcctId, partyAcctOrSummaryName, vchStateCode } = (this.props.filterData || {});
        let { bankList } = this.props;
        let yearPeriodVal = yearPeriod && moment(yearPeriod, 'YYYY-MM') || undefined;
        let items = [
            <Form.Item label="会计月份">
                <DatePicker.MonthPicker defaultValue={yearPeriodVal} onChange={(a, value) => this.handleSubmit(value, 'initPage')} format='YYYY-MM' disabledDate={this.disabledStartDate} />
            </Form.Item>,
            <Form.Item>
                <Select defaultValue={bankAcctId} onChange={(value) => this.handleSubmit(value, 'changeBankAcct')} style={{ width: 180 }}>
                    {bankList && bankList.map(e => <Option key={e.id} value={e.id}>{`${e.name} ${e.code}`}</Option>)}
                </Select>
            </Form.Item>,
            <Form.Item >
                {getFieldDecorator('partyAcctOrSummaryName', {
                    initialValue: partyAcctOrSummaryName,
                })(
                    <Input.Group compact>
                        <Input
                            className="-search"
                            placeholder='请输入对方户名或摘要'
                            onPressEnter={e => this.handleSubmit(e.target.value, 'nameSearch')}
                            style={{ width: 160 }}
                            prefix={<Icon type="search" />}
                        />
                        <Popover
                            overlayClassName="ttk-filter-form-popover"
                            content={
                                <PopoverFilterForm
                                    filterData={this.props.filterData || {}}
                                    handleMenuClick={this.props.handleMenuClick}
                                    webapi={this.props.webapi}
                                    metaAction={this.props.metaAction}
                                    store={this.props.store}
                                    module={this.props.module}
                                    close={this.hide}
                                />
                            }
                            placement="bottom"
                            trigger="click"
                            visible={this.state.popVisible}
                            onVisibleChange={this.handlePopChange}
                        >
                            <Button icon="filter" className={this.state.btnActive ? 'filter-icon active' : 'filter-icon'} />
                        </Popover>
                    </Input.Group>
                )}

            </Form.Item>,
            <Form.Item >
                {getFieldDecorator('vchStateCode', {
                    initialValue: vchStateCode,
                })(<Select
                    onChange={value => this.handleSubmit(value, 'vchStateCodeSearch')}
                    style={{ width: 80 }}
                >
                    {this.authStateList.map((item, index) => (
                        <Select.Option key={index} value={item.value}>{item.label}</Select.Option>
                    ))}
                </Select>)}
            </Form.Item>,
        ]

        return items
    };
    handleMenuClick = (type, e) => {
        e.preventDefault();
        this.props.handleMenuClick && this.props.handleMenuClick(type)
    }
    render() {
        const vatTaxpayer = this.props.metaAction.gf('data.accountInfo.vatTaxpayer');
        const settingMenu = (
            <Menu onClick={(e) => this.props.handleMenuClick(e.key)}>
                <Menu.Item key="setVoucher">凭证习惯</Menu.Item>
                <Menu.Item key="setSubject">科目设置</Menu.Item>
            </Menu>
        );
        const moreMenu = (
            <Menu onClick={(e) => this.props.handleMenuClick(e.key)}>
                <Menu.Item key="delVoucher">删除凭证</Menu.Item>
                <Menu.Item key="delStatement">删除对账单</Menu.Item>
                <Menu.Item key="importStatement">导入对账单</Menu.Item>
                <Menu.Item key="bankAcct">银行账号</Menu.Item>
            </Menu>
        );
        const buttons = [
            <Button type="primary" onClick={(e) => this.handleMenuClick('batchSetSubject', e)}>批设科目</Button>,
            <Button.Group>
                <Button type="primary" onClick={(e) => this.handleMenuClick('createVoucher', e)}>生成凭证</Button>
                <Dropdown overlay={settingMenu}>
                    <Button type="primary" icon="setting" />
                </Dropdown>
            </Button.Group>,
            <Dropdown overlay={moreMenu}>
                <Button >更多 <Icon type="down" /></Button>
            </Dropdown>
        ];
        return (
            <FilterForm
                renderItems={this.renderFilterFormItems}
                buttons={buttons}
            />
        );
    }
}