import React from 'react'
import { Input, Tabs, Radio, Row, Col, Checkbox, Form } from 'antd'

class ProdectSeting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            inputValue: '付款',
            checked: false,
            data: {
                dljgId: 123123,
                orgId: 7027074432530432,
                module: "flowfund",
                voucherOrder: "0",
                voucherDateRule: "2",
                purchaseTaxProcessType: "1",
                firstMergeRule: {
                    fpMergerule: "3",
                    sameTypeAndSameStateFpMerge: "0",
                    maxFlowNum: null,
                    sameTradeDate: null,
                },
                secondMergeRule: {
                    sameAccount10Merge: "1",
                    sameAccount20Merge: null,
                },
                summaryRule: {
                    levelOneAccount10TransType: "1",
                    invKindCode: "0",
                    invNo: "0",
                    custName: "0",
                    goodsName: "0",
                    specification: "0",
                    unitPrice: "0",
                    levelOneAccount20TransType: "0",
                    isIntelligent: "1",
                    paymentDesc: "付款",
                    collectionDesc:"收款",
                },
                // summaryRule.collectionDesc: 
            }
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async (e) => {
        e && e.preventDefault && e.preventDefault();
        let data = this.state.data;

        if (data.firstMergeRule.maxLimitRuleValue == "1") {
            let maxLimitVal = this.props.form.getFieldValue("maxLimit");
            // this.props.form.validateFieldsAndScroll((err, values) => {
            //     if (!err) {
            //         selectedValues = values;
            //     }
            // });
            if (maxLimitVal) {
                maxLimitVal += "";
                if (maxLimitVal.match(/^[1-9]\d*$/g)) {
                    if (parseInt(maxLimitVal) > 50 || parseInt(maxLimitVal) <= 0) {
                        return false;
                    }
                    data.firstMergeRule.maxFlowNum = parseInt(maxLimitVal);
                } else {
                    return false;
                }
            } else {
                this.props.metaAction.toast("error", "请输入凭证最大的流水数量");
                return false;
            }
        }
        if (data.summaryRule.paymentName == '1') {
            let maxLimitValB = this.props.form.getFieldValue('maxLimitB');
            data.summaryRule.paymentDesc = maxLimitValB;
            if((maxLimitValB.length) > 10 || (maxLimitValB.length) <= 0){
                this.props.metaAction.toast("error", "请按提示信息输入完整");
                return false;
            }else{
                data.summaryRule.paymentDesc = maxLimitValB;
            }
            
            if (!maxLimitValB) {
                data.summaryRule.paymentDesc = "付款"
            }else{
                data.summaryRule.paymentDesc = maxLimitValB;
            }

        }
        
        if (data.summaryRule.collectionName == "1") {
            let maxLimitValC = this.props.form.getFieldValue('maxLimitC');
            data.summaryRule.collectionDesc = maxLimitValC;
            if((maxLimitValC.length) > 10 || (maxLimitValC.length) <= 0){
                this.props.metaAction.toast("error", "请按提示信息输入完整");
                return false;
            }else{
                data.summaryRule.collectionDesc = maxLimitValC;
            }
            if (!maxLimitValC) {
                data.summaryRule.collectionDesc = "收款";
            }else{
                data.summaryRule.collectionDesc = maxLimitValC;
            }
        }

        let notFillAll = true;

        Object.keys(data.summaryRule).forEach(e => {
            if(data.summaryRule[e] == "1") {
                notFillAll = false;
            }
        });

        if(notFillAll) {
            this.props.metaAction.toast("error", "请选择至少一项凭证摘要的要素");
            return false;
        }

        let res = await this.props.webapi.funds.updateVoucherRule(data);
        
        this.props.metaAction.toast("success", "保存成功")
    }

    componentDidMount() {
        this.getVoucherRule();
    }
    getVoucherRule = async () => {
        let res = await this.props.webapi.funds.getVoucherRule({
            module: "flowfund"
        })
        if(res.firstMergeRule.maxFlowNum){
            res.firstMergeRule.maxLimitRuleValue = "1";
        }
        if(!res.summaryRule.paymentDesc) {
            res.summaryRule.paymentDesc  = "付款";
        }
        if(!res.summaryRule.collectionDesc) {
            res.summaryRule.collectionDesc  = "付款";
        }
       this.setState({
           data: res
       })
    }

    //发票合并生成凭证 2019
    onMergeValueChange(e) {
        let data = this.state.data;
        data.firstMergeRule.flowMergerule = e.target.value;
        if (e.target.value) {
            data.firstMergeRule.sameTypeAndSameStateFpMerge = "0";
            data.firstMergeRule.maxLimitRuleValue = "0";
            data.firstMergeRule.maxFlowNum = "";
            data.firstMergeRule.sameTradeDate = "0"
            this.props.form.setFieldsValue({
                maxLimit: ""
            });
            this.props.form.resetFields();
        }
        this.setState({
            data: data
        });
    }

    // 银行存款科目合并
    onSummaryRuleOneChange(e) {
        let data = this.state.data;
            e.target.checked ? (data.secondMergeRule.sameAccount10Merge = "1") : (data.secondMergeRule.sameAccount10Merge = "0");
        this.setState({
            data: data
        });
    }
    
    onSummaryRuleTwoChange(e) {
        let data = this.state.data;
            e.target.checked ? (data.secondMergeRule.sameAccount20Merge = "1") : (data.secondMergeRule.sameAccount20Merge = "0");
        this.setState({
            data: data
        })
    }

    onSummaryRuleThreeChange(e) {
        let data = this.state.data;
        data.summaryRule.collectionName = e.target.checked
        if(e.target.checked == "0"){
            let maxLimitValD = this.props.form.setFieldsValue({maxLimitB:"付款"});
            data.summaryRule.paymentDesc = "付款";
            data.summaryRule.paymentName = "0";
        }else{
            data.summaryRule.paymentName = "1";
        }
        this.setState({
            data: data
        })
     }

     onSummaryRuleFourChange(e) {
         let data = this.state.data;
            e.target.checked ? (data.summaryRule.paymentTradeDate = "1") : (data.summaryRule.paymentTradeDate = "0")
        this.setState({
            data: data
        })
     }

     onSummaryRuleFiveChange(e) {
         let data = this.state.data;
         e.target.checked ? (data.summaryRule.paymentCounterparty = "1") : (data.summaryRule.paymentCounterparty = "0")
         this.setState({
             data: data
         })
     }

     onSummaryRuleSixChange(e) {
         let data = this.state.data;
         e.target.checked ? (data.summaryRule.paymentTradeSummary = "1") : (data.summaryRule.paymentTradeSummary = "0")
         this.setState({
             data: data
         })
     }

     onSummaryRuleSevenChange(e) {
        let data = this.state.data;
        data.summaryRule.collectionName = e.target.checked
        if(e.target.checked == "0"){
        let maxLimitValD = this.props.form.setFieldsValue({maxLimitC:"收款"});
        data.summaryRule.collectionDesc = "收款";
        data.summaryRule.collectionName = "0";

        }else{
            data.summaryRule.collectionName = "1";
        }
        this.setState({
            data: data
        })
    }

     onSummaryRuleEightChange(e) {
         let data = this.state.data;
         e.target.checked ? (data.summaryRule.collectionTradeDate = "1") : (data.summaryRule.collectionTradeDate = "0")
         this.setState({
             data: data
         })
     }

     onSummaryRuleNightChange(e) {
         let data = this.state.data;
         e.target.checked ? (data.summaryRule.collectionCounterparty = "1") : (data.summaryRule.collectionCounterparty = "0")
         this.setState({
             data: data
         })
     }

     onSummaryRuleTenChange(e) {
         let data = this.state.data;
         e.target.checked ? (data.summaryRule.collectionTradeSummary = "1") : (data.summaryRule.collectionTradeSummary = "0")
         this.setState({
             data: data
         })
     }

     onMaxLimitRuleChange(e) {
         let data = this.state.data;
         if (e.target.checked) {
            data.firstMergeRule.maxLimitRuleValue = "1";
         } else {
             data.firstMergeRule.maxLimitRuleValue = "0";
             data.firstMergeRule.maxFlowNum = "";
             this.props.form.setFieldsValue({
                 maxLimit: ""
             });
             this.props.form.resetFields();
         }
         this.setState({
             data: data
         });
     }

    //  交易日期相同才可合并sameTradeDate
    onMergeRuleChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.firstMergeRule.sameTradeDate = "1") : (data.firstMergeRule.sameTradeDate = "0");
        this.setState({
            data: data
        })
    }

    // 自定义摘要
    onTaxHandleChangeA(e) {
        let data = this.state.data;
        data.summaryRule.isIntelligent = e.target.value;
        if(e.target.value == "1") {
            data.summaryRule.paymentName = "1";
            data.summaryRule.paymentTradeSummary = "1";
            data.summaryRule.collectionName = "1";
            data.summaryRule.collectionTradeSummary = "1";
            data.summaryRule.paymentDesc = "付款";
            data.summaryRule.collectionDesc = "收款";
        }else{
            data.summaryRule.paymentTradeDate = 0;
            data.summaryRule.paymentCounterparty = 0;
            data.summaryRule.collectionTradeDate = 0;
            data.summaryRule.collectionCounterparty = 0;
        }
        if (e.target.value == "2") {
            data.summaryRule.paymentName = "1";
            data.summaryRule.paymentTradeSummary = "1";
            data.summaryRule.collectionName = "1";
            data.summaryRule.collectionTradeSummary = "1";
        }else{
             data.summaryRule.paymentName = "0";
             data.summaryRule.paymentTradeSummary = "0";
             data.summaryRule.collectionName = "0";
             data.summaryRule.collectionTradeSummary = "0";
        }
        this.setState({
            data: data
        })
    }

    onMaxLimitRuleChangeA(e) {
        let data = this.state.data;
        if(e.target.checked){
            data.voucherOrder = '1'
        }else{
            data.voucherOrder = '0'
        }
        
        this.setState({
            data: data
        })
    }

// 凭证日期
    onTaxHandleChange(e) {
        let data = this.state.data;
        data.voucherDateRule = e.target.value;
        if (e.target.value == "1") {
            data.firstMergeRule.sameTypeAndSameStateFpMerge == "1";
        } else {
            data.firstMergeRule.sameTypeAndSameStateFpMerge == false;
        }
        this.setState({
            data: data
        });
    }

    handleMaxlimit = (rule, value, callback) => {
        const {
            getFieldValue
        } = this.props.form;
        if (value) {
            if (value.match(/^[1-9]\d*$/g)) {
                if (parseInt(value) > 50 || parseInt(value) <= 0) {
                    callback("可输入区间1~50");
                }
            } else {
                callback("请输入正整数！");
            }
        } else {
            callback("不可为空！");
        }

        callback();
    }

    handleMaxlimitB = (rule, value, callback) => {
        const { getFieldValue } = this.props.form;
        if(value) {
            if (value.length > 10 || value.length <= 0) {
                callback("可输入区间1~10字符")
            }
        }else{
            callback('不可为空!')
        }
        callback();
    }

    handleMaxlimitC = (rule, value, callback) => {
        const {
            getFieldValue
        } = this.props.form;
        if (value) {
            if(value.length > 10 || value.length <=0) {
                callback("可输入区间1~10字符")
            }
        }else{
            callback('不可为空!')
        }
        callback();
    }
    
    render() {
        let { data } = this.state
        const { getFieldDecorator } = this.props.form;
        let mergerule = data.firstMergeRule.flowMergerule;
        let mergeDisabled = false;
        let maxLimitDisabled = false;

        if (mergerule == "1"){
            mergeDisabled = true;
        } else {
            mergeDisabled = false;
        }

        if(mergerule == "1") {
            maxLimitDisabled = true;
        } else {
            maxLimitDisabled = false;
        }
        return (
            <div className="habit-setting">
                <div className='bovms-app-popup-content no-top-padding'>
                    <div className='habit-setting-wrap' style={{ height: '475px', overflow: 'auto', overflowX: 'hidden' }}>
                        <div className="habit-setting-sec">
                            <h4 className='habit-setting-sec-title'><span style={{ marginTop: '24px' }}>交易流水合并生成凭证</span></h4>
                            <div className="habit-setting-sec-content" style={{ marginTop: '8px' }}>
                                <Radio.Group onChange={this.onMergeValueChange.bind(this)} value={data.firstMergeRule.flowMergerule} style={{ width: '100%' }}>
                                    <Row gutter={16} style={{ marginTop: '8px' }}>
                                        <Col span={12} ><Radio value='1' >逐条流水生成凭证</Radio></Col>
                                        <Col span={12} ><Radio value='2'>收付类型相同的流水合并生成凭证</Radio></Col>
                                    </Row>
                                    <Row gutter={16} style={{ marginTop: '16px' }}>
                                        <Col span={12} ><Radio value='3'>收付类型相同、会计科目相同的流水合并</Radio></Col>
                                        <Col span={12} ><Radio value='4'>收付类型相同、一级科目相同的流水合并</Radio></Col>
                                    </Row>
                                </Radio.Group>
                                <div>
                                    <div style={{ marginTop: '32px'}}>
                                        <Checkbox
                                            disabled={mergeDisabled}
                                            onChange={this.onMergeRuleChange.bind(this)}
                                            checked={data.firstMergeRule.sameTradeDate == "1" ? true : false}>
                                            交易日期相同才可合并                                          
                                        </Checkbox>
                                    </div>
                                    <div style={{ marginTop: '16px'}}>
                                        <span style={{ position: 'relative' }}>
                                            <Checkbox
                                                checked = {
                                                    data.firstMergeRule.maxLimitRuleValue == "1" ? true : false
                                                }
                                                onChange = {
                                                    this.onMaxLimitRuleChange.bind(this)
                                                }
                                                disabled = {
                                                    maxLimitDisabled
                                                }
                                            >
                                                限制每张凭证包含的最大流水数量:
                                            </Checkbox>
                                            <Form.Item style={{ width: '60px', display: 'inline-block', position: 'absolute', top: '-8px' }}>
                                                {getFieldDecorator(`maxLimit`,{
                                                    rules: [{
                                                        required: true,
                                                        validator: this.handleMaxlimit.bind()
                                                    }],
                                                    initialValue: data.firstMergeRule.maxFlowNum
                                                })
                                                    (<Input
                                                        disabled={
                                                            data.firstMergeRule.maxLimitRuleValue == "1" ? false : true
                                                        }
                                                        ></Input>)}
                                            </Form.Item>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='habit-setting-sec'>
                            <h4 className='habit-setting-sec-title' style={{ marginTop: '24px'}}>收付款凭证顺序</h4>
                            <div>
                                <span style={{ marginTop: '24px', marginLeft: '26px', display: 'inline-block'}}>
                                    <Checkbox className='habit-setting-tooltip' onChange={this.onMaxLimitRuleChangeA.bind(this)} checked={data.voucherOrder == "1" ? true : false}>凭证日期相同时，先生成收款凭证，后生成付款凭证</Checkbox>
                                </span>
                            </div>
                        </div>
                        <div className='habit-setting-sec' style={{ marginTop: '26px'}}>
                            <h4 className='habit-setting-sec-title' style={{ marginTop: '24px' }}><span>凭证内科目的合并</span></h4>
                            <div className="habit-setting-sec-content">
                                <Row gutter={16} style={{ marginTop: '16px'}}>
                                    <Col span={12} >
                                        <Checkbox
                                            checked={
                                                data.secondMergeRule.sameAccount10Merge == "1" ? true : false
                                            }
                                            onChange = {
                                                this.onSummaryRuleOneChange.bind(this)
                                            }
                                            style={{ marginTop: '8px'}}>银行存款科目合并</Checkbox>
                                    </Col>
                                    <Col span={12}>
                                        <Checkbox
                                            checked={
                                                data.secondMergeRule.sameAccount20Merge == "1" ? true : false
                                            }
                                            onChange = {
                                                this.onSummaryRuleTwoChange.bind(this)
                                            }
                                            style={{ marginTop: '8px', marginLeft: '26px'}}>银行存款科目的对方科目合并</Checkbox>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        <div className='habit-setting-sec'>
                            <h4 className='habit-setting-sec-title'><span>凭证摘要</span></h4>
                            <div className="habit-setting-sec-content">
                                <Radio.Group style={{ width: '100%' }} 
                                    onChange={this.onTaxHandleChangeA.bind(this)} 
                                    value = {data.summaryRule.isIntelligent} >
                                    <Row gutter={16} style={{ marginTop: '8px' }}>
                                        <Col span = {12} > 
                                            <Radio value = "1"> 智能摘要 </Radio></Col>
                                    </Row>
                                    <Row gutter={16} style={{ marginTop: '16px' }}>
                                        <Col span={12}><Radio value='2'>自定义摘要</Radio></Col>
                                    </Row>
                                </Radio.Group>
                            </div>
                            { data.summaryRule.isIntelligent =="2" && (
                                <div>
                                    <Row style={{ marginLeft: '50px', marginTop: '20px' }}>
                                        <Col className='habit-prodect-sec-title' span={3}><span style={{ marginTop : '7px', display: 'inline-block' }}>付款流水:</span></Col>
                                        <Col className="habit-prodect-sec-son" span={21}>
                                    <Row>
                                        <Col span={9} style={{ display: 'flex' }}>
                                            <Checkbox
                                                style={{ marginTop : '7px' }}
                                                checked = {
                                                    data.summaryRule.paymentName == "1" ? true : false
                                                }
                                                onChange = {
                                                    this.onSummaryRuleThreeChange.bind(this)
                                                }
                                                
                                            ></Checkbox>
                                            <Form.Item>
                                            {getFieldDecorator(`maxLimitB`,{
                                                rules: [{
                                                        required: true,
                                                        validator: this.handleMaxlimitB.bind()
                                                    }],
                                                    initialValue: data.summaryRule.paymentDesc

                                            })(
                                                < Input disabled = {
                                                    data.summaryRule.paymentName == "1" ? false : true
                                                }
                                                style = {
                                                    {
                                                        width: '150px',
                                                        marginLeft: '10px',
                                                        paddingLeft: "5px"
                                                    }
                                                }
                                                value={this.state.inputValue}
                                            ></Input>)}
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Checkbox value="交易日期"
                                                style={{ marginTop : '7px' }}
                                                checked = {
                                                    data.summaryRule.paymentTradeDate == "1" ? true : false
                                                }
                                                onChange = {
                                                    this.onSummaryRuleFourChange.bind(this)
                                                } >交易日期</Checkbox>
                                        </Col>
                                        <Col span={5}>
                                            <Checkbox value="对方户名"
                                                style={{ marginTop : '7px' }}
                                                checked = {
                                                    data.summaryRule.paymentCounterparty == "1" ? true : false
                                                }
                                                onChange = {
                                                    this.onSummaryRuleFiveChange.bind(this)
                                                } > 对方户名
                                            </Checkbox>
                                        </Col>
                                        <Col span={5}>
                                            <Checkbox value="交易摘要"
                                                style={{ marginTop : '7px' }}
                                                checked = {
                                                    data.summaryRule.paymentTradeSummary == "1" ? true : false
                                                }
                                                onChange = {
                                                    this.onSummaryRuleSixChange.bind(this)
                                                }
                                            >交易摘要</Checkbox>
                                        </Col>
                                    </Row>
                                </Col>
                                    </Row>
                                    <Row style={{ marginLeft: '50px'}}>
                                <Col className='habit-prodect-sec-title' span={3}><span style={{ marginTop : '-6px', display: 'inline-block'}}>收款流水:</span></Col>
                                <Col className="habit-prodect-sec-son" span={21} style={{marginTop: '-6px'}}>
                                    <Row>
                                        <Col span={9} style={{ display: 'flex' }} >
                                            <Checkbox
                                                style={{ marginTop : '7px' }}
                                                checked = {
                                                    data.summaryRule.collectionName == "1" ? true : false
                                                }
                                                onChange = {
                                                    this.onSummaryRuleSevenChange.bind(this)
                                                }
                                            ></Checkbox>
                                            < Form.Item > 
                                                {getFieldDecorator(`maxLimitC`, {
                                                        rules: [{
                                                            required: true,
                                                            validator: this.handleMaxlimitC.bind()
                                                        }],
                                                        initialValue: data.summaryRule.collectionDesc
                                                    })( <Input
                                                        disabled = {
                                                            data.summaryRule.collectionName == "1" ? false : true
                                                        }
                                                        style = {
                                                            {
                                                                width: '150px',
                                                                marginLeft: '10px',
                                                                paddingLeft: "5px"
                                                            }
                                                        }
                                                        >
                                                        </Input>)} 
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Checkbox value="交易日期"
                                                style={{ marginTop : '7px' }}
                                                checked = {

                                                    data.summaryRule.collectionTradeDate == "1" ? true : false
                                                }
                                                onChange = {
                                                    this.onSummaryRuleEightChange.bind(this)
                                                }
                                            >交易日期</Checkbox>
                                        </Col>
                                        <Col span={5}>
                                            <Checkbox value="对方户名"
                                                style={{ marginTop : '7px' }}
                                                checked = {
                                                    data.summaryRule.collectionCounterparty == "1" ? true : false
                                                }
                                                onChange = {
                                                    this.onSummaryRuleNightChange.bind(this)
                                                }
                                            >对方户名</Checkbox>
                                        </Col>
                                        <Col span={5}>
                                            <Checkbox value="交易摘要"
                                                style={{ marginTop : '7px' }}
                                                checked = {
                                                    data.summaryRule.collectionTradeSummary == "1" ? true : false
                                                }
                                                onChange = {
                                                    this.onSummaryRuleTenChange.bind(this)
                                                }
                                            >交易摘要</Checkbox>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                                </div>
                            )}
                        
                        </div>
                        <div className='habit-setting-sec' style={{marginTop: '-35px'}}>
                            <h4 className='habit-setting-sec-title'><span>凭证日期</span></h4>
                            <div className="habit-setting-sec-content">
                                <Radio.Group 
                                    onChange={this.onTaxHandleChange.bind(this)}
                                    value = {data.voucherDateRule}
                                    style={{ width: '100%' }}>
                                    <Row gutter={16} style={{ marginTop: '8px', marginLeft: '26px' }}>
                                        <Col span={12} ><Radio value="1">按交易流水的实际发生日期</Radio></Col>
                                        <Col span={12} ><Radio value="2">按会计月份的最后一天</Radio></Col>
                                    </Row>
                                </Radio.Group>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Form.create({ name: 'bovms_app_habit_setting' })(ProdectSeting)