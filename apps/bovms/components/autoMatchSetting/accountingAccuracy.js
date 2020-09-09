import React from "react"
import { Radio, Switch, Icon, Popover } from 'antd'


class AccountingAccuracy extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    onChange(type, e) {
        let { data, handleChange } = this.props
        switch (type) {
            case 'groupByRule':
                data.accountingDto.groupByRule = e.target.value
                break
            case 'displayPrice':
            case 'populatePriceToStockName':
                data.accountingDto[type] = e ? '1' : '0'
                break
            case 'displayInventoryType':
                data.inventoryDisplayDto.displayInventoryType = e ? '1' : '0'
                break
        }
        handleChange({ businessAccountingDto: data }, 1)
    }
    render() {
        const { inventoryEnableState, module } = this.props
        const { groupByRule, displayPrice, populatePriceToStockName } = this.props.data.accountingDto
        const displayInventoryType = this.props.data.inventoryDisplayDto ? this.props.data.inventoryDisplayDto.displayInventoryType : ''
        const radioStyle = {
            display: 'block',
            height: '40px',
            lineHeight: '40px',
        };
        return (
            <div className="bovms-app-auto-match-setting-accounting-accuracy bovms-app-auto-match-setting-wrap">
                <div className='bovms-app-auto-match-setting-accounting-accuracy-sec'>
                    <h3 className='bovms-app-auto-match-setting-accounting-accuracy-sec-title'>业务核算精度</h3>
                    <div className='bovms-app-auto-match-setting-accounting-accuracy-sec-content'>
                        <Radio.Group value={groupByRule} onChange={this.onChange.bind(this, 'groupByRule')} >
                            <Radio style={radioStyle} value={'1'}>商品或服务名称</Radio>
                            <Radio style={radioStyle} value={'2'}>商品或服务名称+规格型号</Radio>
                            <Radio style={radioStyle} value={'3'}>
                                商品或服务名称+规格型号+单位
                                {/* 业务核算精度为'3'时 */}
                                {groupByRule === '3' && <span style={{ display: 'inline-block', marginLeft: '73px' }}> 显示单价
                                   <Switch checked={displayPrice === '1' ? true : false} style={{ marginLeft: '6px' }} onChange={this.onChange.bind(this, 'displayPrice')} />
                                    <Popover
                                        placement="topLeft"
                                        className="habit-setting-tooltip"
                                        arrowPointAtCenter
                                        content={'单价仅作为参考，有多个单价时，单价在同一行中显示'}
                                    >
                                        <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                                    </Popover>
                                </span>}
                            </Radio>
                            <Radio style={radioStyle} value={'4'}>
                                商品或服务名称+规格型号+单位+单价，不使用{`${module === 2 ? '借方' : '贷方'}`}自动匹配功能
                                    <Popover
                                    placement="topLeft"
                                    className="habit-setting-tooltip"
                                    arrowPointAtCenter
                                    content={'单价不同的将分行显示、分行设置'}
                                >
                                    <Icon type="question" className="bovms-help-icon" />
                                </Popover>
                            </Radio>
                        </Radio.Group>
                        {/* 业务核算精度为'4'并且已启用存货 */}
                        {groupByRule === '4' && !!inventoryEnableState && <div>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;新增存货档案时将单价带入至档案名称中&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Switch checked={populatePriceToStockName === '1' ? true : false} onChange={this.onChange.bind(this, 'populatePriceToStockName')} />
                            <Popover
                                placement="topLeft"
                                className="habit-setting-tooltip"
                                arrowPointAtCenter
                                content={'打开时，新增存货档案时单价将带入至存货名称中'}
                            >
                                <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                            </Popover>
                        </div>}
                    </div>
                </div>
                {/* 已启用存货 */}
                {!!inventoryEnableState && <div className='bovms-app-auto-match-setting-accounting-accuracy-sec'>
                    <h3 className='bovms-app-auto-match-setting-accounting-accuracy-sec-title'>档案显示设置</h3>
                    <div className='bovms-app-auto-match-setting-accounting-accuracy-sec-content'>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;显示存货档案类型&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Switch checked={displayInventoryType === '1' ? true : false} onChange={this.onChange.bind(this, 'displayInventoryType')} />
                        <Popover
                            placement="topLeft"
                            className="habit-setting-tooltip"
                            arrowPointAtCenter
                            content={'打开时，界面上将显示存货档案的类型'}
                        >
                            <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                        </Popover>

                    </div>
                </div>}
                <div className='bovms-app-auto-match-setting-tips'>
                    <div className='bovms-app-auto-match-setting-tips-title'>温馨提示：</div>
                    <div className='bovms-app-auto-match-setting-tips-content'>
                        <p>1）请按照您的实际业务，选择合适的核算精度</p>
                        <p>2）当选择【商品或服务名称+规格型号+单位+单价】时，{module === 2 ? '借' : '贷'}方自动匹配功能（包括智能记忆，自动查找）将不能使用</p>
                    </div>
                </div>
            </div>
        )
    }
}
export default AccountingAccuracy
