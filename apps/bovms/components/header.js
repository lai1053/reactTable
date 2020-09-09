import React from 'react'
import FilterForm from './filterForm/index'
import { Form, Icon } from 'antd';
import { Input, Select, Button, DatePicker, Dropdown, Menu, Popover, Col, Tooltip } from 'edf-component';
import moment from 'moment'
import { fromJS, toJS } from 'immutable'

const { RangePicker } = DatePicker;

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}
const formItemLayout = {
    labelCol: {
        xs: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 19 },
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
        const { webapi, metaAction, module } = this.props;
        // console.log('componentDidMount:', this.props)
        if (webapi && metaAction) {
            const vatTaxpayer = metaAction.gf('data.accountInfo.vatTaxpayer');
            let nsrxz = undefined;
            switch (vatTaxpayer) {
                case 2000010001: //一般纳税人
                case 2000010003: //一般纳税人辅导期
                    nsrxz = 'YBNSRZZS';
                    break;
                case 2000010002:
                    nsrxz = 'XGMZZS';
                    break;
            }
            const res = await webapi.bovms.getFpzlcsList({ nsrxz, fplx: module == 'cg' ? 'jxfp' : 'xxfp' });
            this.setState({
                fpzlList: res && res || [],
            })
        }
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

            if (values.kprq.length) {
                filterData.minBillDate = moment(values.kprq[0]).format('YYYY-MM-DD')
                filterData.maxBillDate = moment(values.kprq[1]).format('YYYY-MM-DD')
            } else {
                filterData.minBillDate = undefined
                filterData.maxBillDate = undefined
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
    disabledEndDate = current => {
        const { metaAction } = this.props;
        const filterData = metaAction.gf('data.filterData').toJS();
        let newDate = moment(filterData.yearPeriod).endOf('month').format("YYYY-MM-DD") + ' 23:59:59'
        return current.valueOf() > new Date(newDate).valueOf()
    };
    render() {
        const { getFieldDecorator } = this.props.form,
            vatTaxpayer = this.props.metaAction.gf('data.accountInfo.vatTaxpayer');
        let { custName, invKindCode, rzzt, minAmount, maxAmount, fpzlList, accountMatchState, kprq, yearPeriod } = this.state;

        // console.log('PopoverFilter:', this.state, this.props)
        return (
            <Form className="ttk-filter-form-popover-content">
                <Form.Item label="发票类型" {...formItemLayout}>
                    {getFieldDecorator('invKindCode', {
                        initialValue: invKindCode,
                    })(<Select
                        getPopupContainer={trigger => trigger.parentNode}
                        style={{ width: '100%' }}
                    >
                        <Select.Option key='null' value={null}>全部</Select.Option>
                        {
                            fpzlList.map(item => (
                                <Select.Option key={item.fpzlDm} value={item.fpzlDm}>{item.fpzlMc}</Select.Option>
                            ))
                        }
                    </Select>)}
                </Form.Item>
                {
                    this.props.module == 'xs' || vatTaxpayer == '2000010002' ?
                        null :
                        (
                            <Form.Item label="认证状态" {...formItemLayout}>
                                {getFieldDecorator('rzzt', {
                                    initialValue: rzzt,
                                })(<Select
                                    getPopupContainer={trigger => trigger.parentNode}
                                    // onChange={value=>console.log(value)}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option key='null' value={null}>全部</Select.Option>
                                    <Select.Option key='0'>未认证</Select.Option>
                                    <Select.Option key='1'>已认证</Select.Option>
                                    <Select.Option key='2'>待抵扣</Select.Option>
                                </Select>)}
                            </Form.Item>
                        )
                }
                <Form.Item label="价税合计" {...formItemLayout}>
                    <Col span={11}>
                        <Form.Item >
                            {getFieldDecorator('minAmount', {
                                initialValue: minAmount,
                            })(<Input.Number />)}
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>-</span>
                    </Col>
                    <Col span={11}>
                        <Form.Item>
                            {getFieldDecorator('maxAmount', {
                                initialValue: maxAmount,
                            })(<Input.Number />)}
                        </Form.Item>
                    </Col>
                </Form.Item>
                <Form.Item label="会计科目" {...formItemLayout}>
                    {getFieldDecorator('accountMatchState', {
                        initialValue: accountMatchState,
                    })(<Select
                        getPopupContainer={trigger => trigger.parentNode}
                        style={{ width: '100%' }}
                    >
                        <Select.Option key='null' value={null}>全部</Select.Option>
                        <Select.Option key='1'>已匹配</Select.Option>
                        <Select.Option key='0'>未匹配</Select.Option>
                    </Select>)}
                </Form.Item>
                <Form.Item label="开票日期" {...formItemLayout}>
                    {getFieldDecorator('kprq', {
                        initialValue: kprq,
                    })(<RangePicker disabledDate={this.disabledEndDate} defaultPickerValue={moment(yearPeriod)} />)}
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

    handleSubmit = (value, type) => {
        const { handleMenuClick } = this.props;
        const filterData = this.metaAction.gf('data.filterData').toJS();
        let fnType = type,
            field = type.replace('Search', '');
        if (type.endsWith('Search')) {
            fnType = 'searchPage';
            filterData[field] = value;
            if (field == 'goodsName') {
                filterData['custName'] = value;
            }
            // console.log('filterData:',filterData)
            this.metaAction.sf('data.filterData', fromJS(filterData));
        }
        if(type === 'initPage') {
            const { metaAction } = this.props;
            let filterData = metaAction.gf('data.filterData').toJS();
            filterData = {
                ...filterData,
                kprq: []
            }

            filterData.minBillDate = undefined
            filterData.maxBillDate = undefined

            metaAction.sf('data.filterData', fromJS(filterData));
        }
        setTimeout(() => {
            if (handleMenuClick) {
                const fn = handleMenuClick(fnType);
                if (type === 'initPage') {
                    fn && fn(value);
                } else {
                    fn && fn();
                }
            }
        }, 100);
    }

    disabledStartDate = startValue => {
        return startValue.valueOf() < new Date(moment(this.metaAction.gf('data.accountInfo.enabledYearAndMonth')).subtract(1, "month").format('YYYY-MM-DD').substr(0, 7)).valueOf() ||
            startValue.valueOf() > new Date().valueOf()
    };

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
    openHelp = async () => {
        let module = this.props.module == 'cg' ? 'bovms-app-purchase-list' : 'bovms-app-sale-list'
        const ret = await this.metaAction.modal('show', {
            title: '',
            className: 'ttk-edf-app-help-modal-content',
            wrapClassName: 'ttk-edf-app-help-modal',
            footer: null,
            width: 840, //静态页面宽度840小于会有横向滚动条
            children: this.metaAction.loadApp('ttk-edf-app-help', {
                store: this.props.store,
                code: module, // 查询页面对应参数
            })
        });
    }

    renderFilterFormItems = (form) => {
        const { getFieldDecorator } = form
        let { yearPeriod, goodsName, vchStateCode } = (this.props.filterData || {});
        let vatTaxpayerName = this.props.getVatTaxpayerName && this.props.getVatTaxpayerName() || '',
            stockName = this.props.getStockName && this.props.getStockName() || '';
        const yearPeriodVal = yearPeriod && moment(yearPeriod, 'YYYY-MM') || undefined;
        let items = [
            <Form.Item label="会计月份">
                <DatePicker.MonthPicker defaultValue={yearPeriodVal} onChange={(a, value) => this.handleSubmit(value, 'initPage')} format='YYYY-MM' disabledDate={this.disabledStartDate} />
            </Form.Item>,
            <Form.Item>
                <Tooltip placement="bottomLeft"
                    title={
                        <div className="footer-total-content">
                            <span>纳税人性质：{vatTaxpayerName}</span>
                            <span>存货核算：{stockName}</span>
                        </div>
                    }
                    overlayClassName="bovms-app-footer-tool"
                >
                    <Icon type="question" className="-help-icon" />
                </Tooltip>
            </Form.Item>,
            <Form.Item >
                {getFieldDecorator('vchStateCode', {
                    initialValue: vchStateCode,
                })(<Select
                    dropdownClassName='other-storage-main-select'
                    onChange={value => this.handleSubmit(value, 'vchStateCodeSearch')}
                    style={{ width: 80 }}
                >
                    {this.authStateList.map((item, index) => (
                        <Select.Option key={index} value={item.value}>{item.label}</Select.Option>
                    ))}
                </Select>)}
            </Form.Item>,
            <Form.Item >
                {getFieldDecorator('goodsName', {
                    initialValue: goodsName,
                })(
                    <Input.Group compact>
                        <Input
                            className="-search"
                            placeholder={this.props.module == 'xs' ? '发票号码、购方名称或商品名称' : '发票号码、销方名称或商品名称'}
                            onPressEnter={e => this.handleSubmit(e.target.value, 'goodsNameSearch')}
                            style={{ width: 210 }}
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
                {/* 小规模隐藏科目设置 */}
                {this.props.module == 'cg' ? vatTaxpayer != 2000010002 ? <Menu.Item key="setSubject">科目设置</Menu.Item> : '' : <Menu.Item key="setSubject">科目设置</Menu.Item>}
                <Menu.Item key="conversionRadio">
                    换算比率
                </Menu.Item>
            </Menu>
        );
        const moreMenu = (
            <Menu onClick={(e) => this.props.handleMenuClick(e.key)}>
                <Menu.Item key="chaPiao">查票</Menu.Item>
                <Menu.Item key="delInvoice">删除发票</Menu.Item>
                <Menu.Item key="delVoucher">删除凭证</Menu.Item>
            </Menu>
        );
        const buttons = [
            <Icon type="question-circle" theme="filled" style={{ color: '#fe9400', fontSize: '16px', marginRight: '8px', cursor: 'pointer' }} onClick={this.openHelp.bind(this)} />,
            <Button icon="plus" onClick={(e) => this.handleMenuClick('collectInvoice', e)}>取票</Button>,
            <Button type="primary" onClick={(e) => this.handleMenuClick('pathSetSubject', e)}>批设科目</Button>,
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