import React from 'react'
import { Form, Radio, Button, Input, Icon, Popover } from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item
const RadioGroup = Radio.Group
import { message } from 'antd';
import utils from 'edf-utils'
class InventoryCostingComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            carryForwardMode: props.initData.carryForwardMode,
            carryForwardSource: props.initData.carryForwardSource,
            isEnableInventory: props.initData.isEnableInventory,//是否是否启用存货模块
            period: props.period,
            amount: props.initData.amount ? props.initData.amount : 0,
            proportion: props.initData.proportion ? props.initData.proportion : 0,
            businessType: props.initData.businessType,
            isAccountedMonth: props.isAccountedMonth,
            hasSaleCostCarryForwardDoc: props.hasSaleCostCarryForwardDoc
        }
    }
    componentWillMount = () => {
        // let res = this.props.interfacePath.getAmountAndProportion(this.props.period)
        // console.log(res)
        // this.setState({
        //     carryForwardMode: res.carryForwardMode
        // })
    }
    confirm = () => {
        if (!this.state.carryForwardMode || this.state.carryForwardMode == '') {
            message.warning('结转方式不能为空')
            return
        }
        if (this.state.proportion == '' && this.state.carryForwardMode == 5000090001) {
            message.warning('比例不能为空')
            return
        }

        this.props.closeModal()
        this.props.callBack(this)
    }
    cancel = () => {
        this.props.closeModal()
    }
    radioChange = async (type, value) => {
        let carryForwardMode = this.state.carryForwardMode,
            carryForwardSource = this.state.carryForwardSource,
            res
        if (type == 'carryForwardMode') {
            //结转方式
            this.setState({
                carryForwardMode: value

            })

        } else {
            //结转来源
            if (value == 5000100001) {
                this.setState({
                    carryForwardMode: 5000090004
                })
            } else {
                this.setState({
                    carryForwardMode: undefined
                })
            }
            this.setState({
                carryForwardSource: value
            })
        }
    }
    handleChange = () => { }
    handleBlur = (value) => {
        if (value > 100) {
            message.warning('比例不能超过100%')
            return
        }
        this.setState({
            proportion: value
        })
    }
    handleClick = async (e, businessType) => {
        const res = await this.props.accountRelationsClick(e, businessType)
        if (res) {
            //金额
            this.setState({
                amount: res.amount
            })
        }
    }
    getContent = (isAccountedMonth, businessType) => {
        let carryForwardMode = this.state.carryForwardMode
        if (carryForwardMode == '5000090001') {
            return (
                <div className="inventoryCosting-content">
                    {/* <div className="tips">
                        结转成本金额 = 本期收入科目结转前发生额 * 结转比例
                    </div> */}
                    <div className="content">
                        <div className="contentLeft">{businessType == '5000040026' ? '原材料科目余额: ' : '本期销售收入发生额：'}<span>{utils.number.format(this.state.amount, 2)}</span></div>
                        <div className="contentRight">
                            <span>结转比例：</span>
                            <EditableCell value={this.state.proportion} onBlur={(value) => this.handleBlur(value)} disabled={isAccountedMonth} />
                            <span style={{ marginLeft: '5px' }}>%</span>
                        </div>
                    </div>
                </div>
            )
        }

        // else if (carryForwardMode == '5000090002') {
        //     return (
        //         <div className="inventoryCosting-content">
        //             <div className="tips">
        //                 收入科目及库存商品科目需要启用数量核算，根据加权平均法结转成本
        //             </div>
        //         </div>
        //     )
        // } else if (carryForwardMode == '5000090003') {
        //     return (
        //         <div className="inventoryCosting-content">
        //             <div className="tips">
        //                 结转成本金额 = 库存商品结转前的科目余额
        //             </div>
        //             <div className="content">
        //                 <div className="contentLeft">本期库存商品结余：<span>{utils.number.format(this.state.amount, 2)}</span></div>
        //             </div>
        //         </div>
        //     )
        // }
    }

    render() {
        const { carryForwardMode, isAccountedMonth, hasSaleCostCarryForwardDoc, carryForwardSource, isEnableInventory, businessType } = this.state
        // const isEnableInventory = this.props.initData.isEnableInventory
        let tips = businessType == 5000040026 ? "领料结转成本" : businessType == 5000040005 ? "销售结转成本" : "生产入库结转"
        return (
            <div>
                <div className="inventoryCosting" style={{ padding: '0px 15px', marginBottom: '25px' }}>
                    <div style={{ fontSize: '12px', color: ' #FA954C', background: '#FCF4EE', border: '1px solid #FF812F', 'border-radius': '3px' }}>
                        <div style={{ paddingLeft: '10px', marginTop: '10px' }}>结转方式一经确认，不可修改</div>
                        {isEnableInventory ? <div style={{ paddingLeft: '10px', marginBottom: '10px' }}>{`变更结转方式或来源时，将会删除当期已生成的${tips}`}</div>
                            : <div style={{ paddingLeft: '10px', marginBottom: '10px' }}>{`变更结转方式时，将会删除当期已生成的${tips}`}</div>}

                    </div>
                    <div style={{
                        height: '137px', width: '350px', marginTop: '20px', borderRight: '1px solid #D0D0D0', display: 'flex', flexDirection: 'column', justifyContent: 'center'
                    }}>
                        <FormItem label="结转来源：" style={{ display: isEnableInventory ? 'block' : 'none' }}>
                            <RadioGroup value={carryForwardSource} disabled={hasSaleCostCarryForwardDoc} onChange={(e) => this.radioChange('carryForwardSource', e.target.value)}>

                                <Radio value={5000100001}>存货模块</Radio>
                                <Popover content='根据存货模块选择的结转方式，关联存货台账结转销售成本，数据更为精准' placement="rightTop" overlayClassName="inventoryCosting-pop">
                                    <Icon type="bangzhutishi" fontFamily="edficon" />
                                </Popover>
                                <Radio value={5000100002}>总账模块</Radio>
                                <Popover content='根据总账收入科目、库存商品科目的相关信息倒推出成本金额' placement="rightTop" overlayClassName="inventoryCosting-pop">
                                    <Icon type="bangzhutishi" fontFamily="edficon" />
                                </Popover>
                            </RadioGroup>
                        </FormItem>
                        {
                            carryForwardSource == 5000100002 ?
                                <FormItem label="结转方式：">

                                    <RadioGroup value={carryForwardMode} disabled={hasSaleCostCarryForwardDoc} onChange={(e) => this.radioChange('carryForwardMode', e.target.value)}>
                                        <Radio value={5000090001}>按比例结转</Radio>
                                        {businessType == 5000040005 ? <Radio value={5000090002}>全月加权平均</Radio> : ''}
                                        <Radio value={5000090003}>全额结转</Radio>
                                    </RadioGroup>
                                    {/* // <RadioGroup value={carryForwardMode} disabled={hasSaleCostCarryForwardDoc} style={{display: isEnableInventory?'block':'none'}}>
                        //     <Radio value={5000090004}>移动加权平均</Radio>
                        // </RadioGroup> */}

                                </FormItem> : null
                        }

                        {carryForwardSource == 5000100002 ? this.getContent(isAccountedMonth, businessType) : ''}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'absolute', top: '190px', right: '50px' }}>
                        <Button
                            className='rightbtns'
                            style={{ marginBottom: '10px' }}
                            disabled={carryForwardSource == 5000100002 && !hasSaleCostCarryForwardDoc ? false : true}
                            onClick={(e) => this.handleClick(e, businessType)}>
                            科目对应设置
                            </Button>
                    </div>

                </div >
                <div className="btnContainer" style={{ PaddingRight: '10px' }}>
                    <Button style={{ marginRight: '8px', fontSize: '12px', padding: '0px 15px' }} type='primary' onClick={this.confirm}>保存</Button>
                    <Button onClick={this.cancel} style={{ fontSize: '12px', padding: '0px 15px' }}>取消</Button>
                </div>
            </div >
        )
    }
}
// const EditableCell = ({ value, onBlur, customAttribute, disabled }) => {
//     // '^(-?[0-9]+)(?:\.[0-9]{1,2})?$'
//     return (
//         <div>
//             <Input.Number
//                 value={value}
//                 onBlur={(value) => onBlur(value)}
//                 style={{ 'textAlign': 'right', fontSize: '12px' }}
//                 disabled={disabled}
//                 min={0}
// 				max={100}
//                 customAttribute={customAttribute}
//                 regex='^(-?[0-9]+)(?:\.[0-9]{1,2})?$'

//             />
//         </div>
//     )
// }
class EditableCell extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: props.value
        }
    }

    handleChange = (value) => {
        console.log(value)
        if (value > 100) {
            value = 100
        }
        this.setState({
            value: value
        })
    }

    handleBlur = (e) => {
        const { onBlur } = this.props
        const { value } = this.state
        onBlur(value ? value : 0)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        })
    }

    render() {
        const { onBlur, onEnter, customAttribute, disabled } = this.props
        const value = this.state.value
        return (
            <div className="td_input_antNumber">
                <Input.AntNumber
                    onChange={this.handleChange}
                    value={value}
                    onBlur={this.handleBlur}
                    onPressEnter={(e) => onEnter(e)}
                    style={{ 'textAlign': 'right', fontSize: '12px' }}
                    disabled={disabled}
                    customAttribute={customAttribute}
                    regex='^([0-9]+)(?:\.[0-9]{1,2})?$'
                    min={0}
                    max={100}
                    // precision={2}
                    // formatter={value => `${value}%`}
                    formatter={value => `${value}${value == '' ? '' : ''}`}
                    parser={value => value.replace('%', '')}
                />
            </div>
        )
    }
}
export default InventoryCostingComponent