import React from 'react'
import { Table } from 'edf-component'
import { Map, fromJS } from 'immutable'
import { Input, Select, Form, Row, Col, Button, Spin } from 'antd'
import SelectSubject from './selectSubject';
import { setListEmptyVal } from "../../utils/index";
const { Option } = Select;
const formItemLayout = {
    labelCol: {
        xs: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 19 },
    },
};



class SplitStatement extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {},
            tableData: [],
            loading: false,
            tLoading: false,
        }
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
        this.store = props.store || {}
        // if (props.setOkListener) {
        //     props.setOkListener(this.onOk)
        // }
    }
    onClose(e) {
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal();
    }
    onOk = async (e) => {
        let { tableData, data } = this.state
        let hasErr = false
        this.props.form.validateFieldsAndScroll((err, values) => {

            if (err) {
                hasErr = true
            }

        });
        if (!hasErr) {
            let amount = 0
            tableData.forEach(e => amount = this.operation(amount,e.amount, 'add'))
            if (data.amount != amount) {
                this.metaAction.toast('error', '保存失败：明细合计金额不等于流水金额');
                return false
            }
            // console.log('amount', amount)
            let params = setListEmptyVal(tableData);
            let res = await this.webapi.funds.saveBankFlowsWhenSplit(params)
            if (res === null) {
                this.metaAction.toast('success', '保存成功');
                e && e.preventDefault && e.preventDefault();
                this.props.closeModal && this.props.closeModal('needReload');
            } else {
                return false
            }

        } else {
            return false
        }
    }

    componentDidMount() {
        this.getData();
    }

    validator = (rule, value, callback) => {
        const { getFieldValue } = this.props.form
        if (String(value)) {
            if (value <= 0) {
                callback('金额不能为负数或零')
            }
        } else {
            callback('不可为空！')
        }

        // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
        callback()
    }
    getColumns() {
        const { data } = this.state
        const { getFieldDecorator } = this.props.form;
        let { isReadOnly } = this.props
        let columns = [
            {
                title: data.flowfundType === 1 ? '收款金额' : '付款金额',
                dataIndex: 'amount',
                align: 'right',
                width: 200,
                key: 'amount',
                render: (text, record, index) => {
                    return isReadOnly ? (<span>{record.amount}</span>) : (
                        <Form.Item key={`amount${index}`} label=''>
                            {getFieldDecorator(`amount${index}`, {
                                rules: [{ required: true, validator: this.validator }],
                                normalize: (value, prevValue, allValues) => {
                                    if (value == "") {
                                        return value;
                                    }
                                    if (String(value).match(/^[0-9||.||-]*$/)) {
                                        return value;
                                    } else {
                                        return prevValue;
                                    }
                                },
                                initialValue: record.amount,
                            })(<Input onChange={(e) => this.onChange(e, index)} />)}
                        </Form.Item>
                    )
                }
            },
            {
                title: '会计科目',
                align: 'center',
                dataIndex: 'subject',
                width: 400,
                key: 'subject',
                render: (text, record, index) => {
                    let { data } = this.state
                    let value = data.flowfundType === 1 ? record.acct20Id : record.acct10Id
                    return (
                        <Form.Item key={`subject${index}`} label=''>
                            {getFieldDecorator(`subject${index}`, {
                                rules: [{ required: true, message: `科目不能为空` }],
                                initialValue: value,
                            })(this.renderCell(text, record, index))}
                        </Form.Item>
                    )

                }
            },

        ];
        if (!isReadOnly) {
            columns.push({
                title: '操作',
                key: '操作',
                width: 120,
                align: 'center',
                render: (text, record, index) => (
                    <span>
                        <a onClick={this.delete.bind(this, index)}>删除</a>&nbsp;
                        <a onClick={this.insert.bind(this, index)}>插入</a>&nbsp;
                        <a onClick={this.setAve.bind(this, index)}>配平</a>&nbsp;
                    </span>
                ),
            })
        }
        return columns
    }
    onChange(e, index) {
        let { tableData } = this.state
        tableData[index].amount = e.target.value
        this.setState({ tableData })
    }
    delete(index) {
        let { tableData } = this.state
        if (tableData.length === 1) {
            return this.metaAction.toast('error', '删除失败：至少要有一行明细数据');
        }
        tableData.splice(index, 1);
        this.props.form.resetFields()
        this.setState({
            tableData
        })
    }
    setAve(index) {
        let { tableData, data } = this.state
        let aveAmount = data.amount
        tableData.map((e, i) => {
            if (index != i) {
                aveAmount = this.operation(aveAmount, e.amount, 'subtract')
                // aveAmount -= e.amount
            }
        })
        tableData[index].amount = aveAmount
        this.props.form.resetFields(tableData.map((e, i) => `amount${i}`))
        this.setState({
            tableData
        })
    }
    insert(index) {
        let { tableData, data} = this.state
        if (tableData.length === 10) {
            return this.metaAction.toast('error', '插入失败：最多可将流水拆分为10条明细');
        }
        let insertedData = { ...tableData[0] }

        //计算金额
        let amount = data.amount
        tableData.map(e => {
            // amount -= e.amount
            amount = this.operation(amount, e.amount, 'subtract')
        })

        insertedData.amount = amount
        insertedData.acct20Id = null
        insertedData.acct20Code = null
        insertedData.acct20Name = null
        insertedData.acct20CiName = null
        insertedData.acct10Id = null
        insertedData.acct10Code = null
        insertedData.acct10Name = null
        insertedData.acct10CiName = null
        tableData.splice(index + 1, 0, insertedData);
        this.props.form.resetFields()
        this.setState({
            tableData
        })
    }
    isInteger(obj) {
        return Math.floor(obj) === obj
    }

    /*
     * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
     * @param floatNum {number} 小数
     * @return {object}
     *   {times:100, num: 314}
     */
    toInteger(floatNum) {
        var ret = { times: 1, num: 0 };
        if (this.isInteger(floatNum)) {
            ret.num = floatNum;
            return ret
        }
        var strfi = floatNum + '';
        var dotPos = strfi.indexOf('.');
        var len = strfi.substr(dotPos + 1).length;
        var times = Math.pow(10, len);
        var intNum = parseInt(floatNum * times + 0.5, 10);
        ret.times = times;
        ret.num = intNum;
        return ret
    }
    operation(a, b, op) {
        var o1 = this.toInteger(a);
        var o2 = this.toInteger(b);
        var n1 = o1.num;
        var n2 = o2.num;
        var t1 = o1.times;
        var t2 = o2.times;
        var max = t1 > t2 ? t1 : t2;
        var result = null;
        switch (op) {
            case 'add':
                if (t1 === t2) { // 两个小数位数相同
                    result = n1 + n2
                } else if (t1 > t2) { // o1 小数位 大于 o2
                    result = n1 + n2 * (t1 / t2)
                } else { // o1 小数位 小于 o2
                    result = n1 * (t2 / t1) + n2
                }
                return result / max;

            case 'subtract':
                if (t1 === t2) {
                    result = n1 - n2
                } else if (t1 > t2) {
                    result = n1 - n2 * (t1 / t2)
                } else {
                    result = n1 * (t2 / t1) - n2
                }
                return result / max;
        }
    }

    renderCell = (text, record, index) => {
        const { data } = this.state
        let assistJSON = '';
        let defaultItem = {};
        let subjectName = null;
        let obj = {}
        let assistList = ''
        let title = ''
        if (data.flowfundType === 1) {
            assistJSON = record['acct20CiName'];
            defaultItem.id = record['acct20Id']
            defaultItem.codeAndName = `${record.acct20Code || ""} ${record.acct20Name || ""}`
            subjectName = record["acct20Name"]
            obj = assistJSON ? JSON.parse(assistJSON) : {};
            assistList = obj.assistList;
            title = `${record.acct20Code || ""} ${record.acct20Name || ""}${assistList ? "/" : ""}${assistList ? assistList.map(m => m.name).join("/") : ""}`;
        } else {
            assistJSON = record['acct10CiName']
            defaultItem.id = record['acct10Id']
            defaultItem.codeAndName = `${record.acct10Code || ""} ${record.acct10Name || ""}`
            subjectName = record["acct10Name"]
            obj = assistJSON ? JSON.parse(assistJSON) : {};
            assistList = obj.assistList;
            title = `${record.acct10Code || ""} ${record.acct10Name || ""}${assistList ? "/" : ""}${assistList ? assistList.map(m => m.name).join("/") : ""}`;
        }


        let isCanSelectAssist = JSON.parse(assistJSON || "{}").assistList;
        return record.editing ? (
            <div>
                <SelectSubject
                    key={index}
                    onBlur={this.toggleEdit.bind(this, index)}
                    value={defaultItem.id}
                    metaAction={this.metaAction}
                    store={this.store}
                    autoExpand={true}
                    webapi={this.webapi}
                    onChange={value => { this.handleChange(value, index) }}
                    defaultItem={defaultItem}
                    subjectName={subjectName}
                    noShowSelectAssist
                />
            </div>
        ) : (
                <div className="editable-cell"
                    className={isCanSelectAssist ? "editable-cell-value-wrap bovms-select-subject-container no-right-padding" : "editable-cell-value-wrap"}
                    onClick={this.toggleEdit.bind(this, index)}
                    title={title}
                >
                    <span className={isCanSelectAssist ? "subject-value" : ''}>{title}</span>
                    {
                        isCanSelectAssist ?
                            <a className="assist-btn"
                                unSelectable="on"
                                onClick={e => this.openSelectAssist(e, value, assistJSON, record.counterpartyName, record)}>辅助</a>
                            : null
                    }
                </div>
            );
    }

    handleChange(val, index) {
        let { data, tableData } = this.state;
        //如果科目被禁用
        if (!val) {
            return
        }
        if (data.flowfundType === 1) {
            tableData[index].acct20Id = val.id;
            tableData[index].acct20Code = val.code;
            tableData[index].acct20Name = val.gradeName;
            tableData[index].acct20CiName = val.assistList && val.assistList.length ? JSON.stringify({ assistList: val.assistList }) : '';
        } else {
            tableData[index].acct10Id = val.id;
            tableData[index].acct10Code = val.code;
            tableData[index].acct10Name = val.gradeName;
            tableData[index].acct10CiName = val.assistList && val.assistList.length ? JSON.stringify({ assistList: val.assistList }) : '';
        }
        this.props.form.resetFields(tableData.map((e, i) => `subject${i}`))
        this.setState({
            tableData
        })
    }

    toggleEdit(index) {
        let { tableData } = this.state;
        let { isReadOnly } = this.props;
        if (!isReadOnly) {
            tableData[index].editing = !tableData[index].editing
            this.setState({
                tableData
            })
        }

    }
    async getData() {
        this.setState({
            loading: true
        })
        let yearPeriod = parseInt(this.metaAction.gf('data.filterData.yearPeriod').replace('-', '')) //后端要求日期必须传Int类型
        let bankAcctId = this.metaAction.gf('data.filterData.bankAcctId')
        let fundIds = [this.props.id]
        let params = {
            yearPeriod,
            bankAcctId,
            fundIds
        }
        // console.log('res', res);
        let res = await this.webapi.funds.queryBankFlowsByIds(params)
        this.setState({
            data: res[0],
            tableData: res[0].mxDtoList,
            loading: false
        })
    }
    render() {
        const { data, tableData, loading, tLoading } = this.state
        const { isReadOnly } = this.props

        return (
            <div className={
                isReadOnly
                    ? "bovms-app-funds-split-statement read-only"
                    : "bovms-app-funds-split-statement"
            }>
                <Spin
                    tip='加载中...'
                    delay={0}
                    spinning={loading}
                >
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item label='交易日期：' {...formItemLayout}>
                                    <Input value={data.billDate} disabled />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={data.flowfundType == '1' ? '收款金额：' : '付款金额：'} {...formItemLayout}>
                                    <Input value={data.amount} disabled />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label='对方户名：' {...formItemLayout}>
                                    <Input value={data.counterpartyName} disabled />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label='对方账号：' {...formItemLayout}>
                                    <Input value={data.counterpartyAcct} disabled />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label='交易摘要：' {...formItemLayout}>
                                    <Input value={data.summary} disabled />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                    <div className='bovms-app-funds-split-statement-main subject-setting-body-section'>
                        <h1><span>拆分明细</span></h1>
                        <Table
                            loading={tLoading}
                            columns={this.getColumns()}
                            dataSource={tableData}
                            pagination={false}
                            style={{ height: '270px' }}
                            scroll={{ y: 232 }}></Table>
                    </div>
                    <div className='bovms-app-actions-footer'>
                        <div></div>
                        <div>
                            {!isReadOnly && <Button type="primary" onClick={this.onOk.bind(this)}>保存</Button>}
                            <Button onClick={this.onClose.bind(this)}>关闭</Button>
                        </div>
                    </div>
                </Spin>
            </div>
        )
    }
}

export default Form.create({ name: 'bovms_app_funds_split_statement' })(SplitStatement);