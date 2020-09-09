import React from "react"
import { Radio, Switch, Icon, Popover, Select, Checkbox } from 'antd'
import RangeSetting from './rangeSetting'
const Option = Select.Option

class DebitMatch extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
        this.webapi = props.webapi
        this.metaAction = props.metaAction
    }
    onChange(type, e) {
        let { data, handleChange, module } = this.props
        switch (type) {
            case 'systemAutoMatchAccountAndStock':
                data.systemAutoMatchAccountAndStock = e ? '1' : '0'
                data.useAndSaveMemoryData = e ? '1' : '0'
                data.autoMatchAccountAndAssist = e ? '1' : '0'
                data.matchAccountAndAssistDto.autoMatchAssist = e ? '1' : '0'
                break
            case 'useAndSaveMemoryData':
            case 'saveMemoryDataToOtherModule':
            case 'autoMatchStock':
            case 'autoMatchAccount':
            case 'autoMatchAccountAndAssist':
            case 'useOtherModuleMemoryData':
                data[type] = e ? '1' : '0'
                if (type === 'autoMatchAccountAndAssist') {
                    data.matchAccountAndAssistDto.autoMatchAssist = e ? '1' : '0'
                }
                //【自动根据记忆库进行匹配（智能记忆）】开启，或【无记忆数据时自动匹配已存在的科目和辅助项目】开启，则【系统自动匹配】开启
                if (data.useAndSaveMemoryData === '1' || data.autoMatchAccountAndAssist === '1') {
                    data.systemAutoMatchAccountAndStock = '1'
                }
                 //【自动根据记忆库进行匹配（智能记忆）】开启，且【无记忆数据时自动匹配已存在的科目和辅助项目】开启，则【系统自动匹配】开启
                if (data.useAndSaveMemoryData === '0' && data.autoMatchAccountAndAssist === '0') {
                    data.systemAutoMatchAccountAndStock = '0'
                }

                break
            case 'matchMethodType':
                data.matchAccountAndAssistDto[type] = e
                break
            case 'autoMatchAssist':
                data.matchAccountAndAssistDto[type] = e ? '1' : '0'
                if (e) {
                    data.systemAutoMatchAccountAndStock = '1'
                }
                //全部子节点关闭，父节点关闭
                if (data.useAndSaveMemoryData === '0' && data.autoMatchAccountAndAssist === '0' && data.matchAccountAndAssistDto.autoMatchAssist === '0') {
                    data.systemAutoMatchAccountAndStock = '0'
                }
                break
            case 'accurateMatchCondition.goodsName':
            case 'accurateMatchCondition.specification':
            case 'accurateMatchCondition.unitName':
                data.matchAccountAndAssistDto['accurateMatchCondition'][type.split('.')[1]] = e.target.checked ? '1' : '0'
        }
        handleChange(module === 2 ? { account20MatchDto: data } : { account10MatchDto: data })
    }
    async handleRangeSetting(type) {
        let { data, module, yearPeriod, handleChange } = this.props
        let list = [].concat(data.matchAccountAndAssistDto[type === 'dfAccountList' ? 'accountList' : type])
        let ret = await this.metaAction.modal("show", {
            title: type === 'assistTypeList' ? "辅助核算查找范围与顺序" : `${module === 2 ? '贷方' : '借方'}科目查找范围与顺序`,
            style: { top: 25 },
            width: 380,
            children: (
                <RangeSetting
                    metaAction={this.metaAction}
                    webapi={this.webapi}
                    list={list}
                    type={type}
                    module={module === 1 ? 'xs' : 'cg'}
                    yearPeriod={yearPeriod}
                />
            )
        })
        if (ret) {
            data.matchAccountAndAssistDto[type === 'dfAccountList' ? 'accountList' : type] = ret
            handleChange(module === 2 ? { account20MatchDto: data } : { account10MatchDto: data })
        }
    }
    render() {
        const { inventoryEnableState, module } = this.props,
            {
                systemAutoMatchAccountAndStock,
                useAndSaveMemoryData,
                useOtherModuleMemoryData,
                saveMemoryDataToOtherModule,
                autoMatchAccountAndAssist,
                autoMatchStock,
                autoMatchAccount
            } = this.props.data,
            {
                matchMethodType,
                accurateMatchCondition,
                fuzzyMatchCondition,
                accountList,
                autoMatchAssist,
                assistTypeList
            } = this.props.data.matchAccountAndAssistDto

        let switchClassName = ''
        if (!(useAndSaveMemoryData === '1' && autoMatchAccountAndAssist === '1') && !(useAndSaveMemoryData === '0' && autoMatchAccountAndAssist === '0')) {
            switchClassName = 'bovms-app-auto-match-setting-switch-style ant-switch-checked'
        }

        return (
            <div className="bovms-app-auto-match-setting-debit bovms-app-auto-match-setting-wrap">
                <div className='bovms-app-auto-match-setting-debit-top'>
                    <div>{module === 2 ? '系统自动匹配贷方科目' : '系统自动匹配借方科目'}
                        <div className='bovms-app-auto-match-setting-debit-top-switch'>
                            <Switch checked={systemAutoMatchAccountAndStock === '1' ? true : false} className={switchClassName} onChange={this.onChange.bind(this, 'systemAutoMatchAccountAndStock')} ></Switch>
                            <Popover
                                placement="topLeft"
                                className="habit-setting-tooltip"
                                arrowPointAtCenter
                                content={<div>
                                    <div>开启时，系统会自动匹配{module === 2 ? '贷' : '借'}方科目</div>
                                    <div>关闭时，不进行自动匹配</div>
                                </div>}
                            >
                                <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                            </Popover></div>
                    </div>
                    <div>自动根据记忆库进行匹配（智能记忆）
                    <div className='bovms-app-auto-match-setting-debit-top-switch'>
                            <Switch checked={useAndSaveMemoryData === '1' ? true : false} onChange={this.onChange.bind(this, 'useAndSaveMemoryData')} ></Switch>
                            <Popover
                                placement="topLeft"
                                className="habit-setting-tooltip"
                                arrowPointAtCenter
                                content={`系统自动记录${module === 2 ? '销' : '购'}方名称对应的${module === 2 ? '贷' : '借'}方科目和辅助核算项目（使用辅助核算时），并用于后续取票时的自动匹配`}
                            >
                                <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                            </Popover></div>
                    </div>
                    {
                        useAndSaveMemoryData === '1' &&
                        <div style={{ paddingLeft: '26px' }}>使用其他模块的记忆数据进行匹配
                            <div className='bovms-app-auto-match-setting-debit-top-switch'>
                                <Switch checked={useOtherModuleMemoryData === '1' ? true : false} onChange={this.onChange.bind(this, 'useOtherModuleMemoryData')}></Switch>
                                <Popover
                                    placement="topLeft"
                                    className="habit-setting-tooltip"
                                    arrowPointAtCenter
                                    content={`当${module === 2 ? '进' : '销'}项模块无记忆数据时，使用其他模块的记忆数据进行匹配`}
                                >
                                    <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                                </Popover></div>
                        </div>
                    }

                    <div>
                        {`无记忆数据时自动匹配${module === 2 ? '已存在的科目' : '往来科目'}和辅助核算`}
                        <div className='bovms-app-auto-match-setting-debit-top-switch'>
                            <Switch checked={autoMatchAccountAndAssist === '1' ? true : false} onChange={this.onChange.bind(this, 'autoMatchAccountAndAssist')}></Switch>
                            <Popover
                                placement="topLeft"
                                className="habit-setting-tooltip"
                                arrowPointAtCenter
                                content={module === 2 ?
                                    '记忆库中未保存的销方名称，将会按设定的规则匹配已存在的科目和辅助核算项目（使用辅助核算时）' :
                                    '记忆库中未保存的购方名称，将会按设定的规则匹配已存在的往来科目和辅助核算项目（使用辅助核算时）'
                                }
                            >
                                <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                            </Popover></div>
                    </div>
                    {autoMatchAccountAndAssist === '1' && <div className='bovms-app-auto-match-setting-debit-subItem'>
                        <div className='bovms-app-auto-match-setting-debit-subItem-titles'>
                            <h5>匹配方法</h5>
                            <h5>精确匹配条件</h5>
                            <h5>往来科目匹配范围与顺序 </h5>
                        </div>
                        <div className='bovms-app-auto-match-setting-debit-subItem-controls'>
                            {/* 匹配方法 */}
                            <div>
                                <Select value={matchMethodType} style={{ width: '250px' }} onChange={this.onChange.bind(this, 'matchMethodType')}>
                                    <Option key={'1'} value={'1'}>精确匹配</Option>
                                    {/* <Option key={'2'} value={'2'}>先精确匹配，再模糊匹配</Option> */}
                                </Select>
                                <Popover
                                    placement="topLeft"
                                    className="habit-setting-tooltip"
                                    arrowPointAtCenter
                                    content={`精确匹配：科目名称与${module === 2 ? '销' : '购'}方名称相同，或者科目带有辅助核算、且辅助核算项目的名称与${module === 2 ? '销' : '购'}方名称相同`}
                                >
                                    <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                                </Popover>
                            </div>

                            {/* 精确匹配条件 */}
                            <div>
                                <Checkbox checked={accurateMatchCondition.custName === '1' ? true : false} disabled onChange={this.onChange.bind(this, 'fuzzyMatchCondition.goodsName')}>
                                    {module === 2 ? '销' : '购'}方名称
                                </Checkbox>
                            </div>
                            <div className='bovms-app-auto-match-setting-debit-subItem-match-range'>
                                <a href='javascript:;' onClick={this.handleRangeSetting.bind(this, 'dfAccountList')}>设置</a>
                                <div>
                                    {accountList.map(e => {
                                        return (<p>{`${e.code} ${e.name}`}</p>)
                                    })}
                                </div>

                            </div>
                        </div>
                    </div>
                    }
                    {autoMatchAccountAndAssist === '1' && <div className='bovms-app-auto-match-setting-debit-subItem'>
                        <h5>辅助核算自动匹配</h5>
                        <div className='bovms-app-auto-match-setting-debit-top-switch'>
                            <Switch checked={autoMatchAssist === '1' ? true : false} onChange={this.onChange.bind(this, 'autoMatchAssist')}></Switch>
                            <Popover
                                placement="topLeft"
                                className="habit-setting-tooltip"
                                arrowPointAtCenter
                                content={<div>
                                    <div>当往来科目使用辅助核算时，建议开启</div>
                                    <div>当往来科目未使用辅助核算时，建议关闭。关闭可提高系统速度。</div>
                                </div>}
                            >
                                <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                            </Popover></div>
                    </div>}

                    {autoMatchAssist === '1' && autoMatchAccountAndAssist === '1' && <div className='bovms-app-auto-match-setting-debit-subItem'>
                        <div className='bovms-app-auto-match-setting-debit-subItem-titles'>
                            <h5>匹配的辅助核算类别与顺序</h5>
                        </div>
                        <div className='bovms-app-auto-match-setting-debit-subItem-controls'>


                            {/* 匹配的存货类型范围 */}

                            <div className='bovms-app-auto-match-setting-debit-subItem-match-range'>
                                <a href='javascript:;' onClick={this.handleRangeSetting.bind(this, 'assistTypeList')}>设置</a>
                                <div>
                                    {assistTypeList.map(e => {
                                        return (<p>{`${e.name}`}</p>)
                                    })}
                                </div>

                            </div>
                        </div>
                    </div>
                    }
                </div>
                <div className='bovms-app-auto-match-setting-tips' style={{ marginTop: '24px' }}>
                    <div className='bovms-app-auto-match-setting-tips-title'>温馨提示：</div>
                    <div className='bovms-app-auto-match-setting-tips-content'>
                        <p>1）系统将按照设置的规则，进行借方科目、贷方科目，存货档案等项目的自动匹配</p>
                        <p>2）不同的匹配方法会导致不同的匹配结果，修改配置时建议先阅读提示信息</p>
                        <p>3）科目范围、辅助核算类别越多，匹配所需时间越长，建议按{module === 2 ? '进项' : '销项'}业务的实际核算方式进行设置</p>
                        <p>4）自动匹配结果不能保证100%准确，建议对匹配结果进行检查</p>
                        <p>5）商品税务编码以2、3、4、5、6开头的商品或服务，不进行存货档案的自动查找，仅查找记忆数据</p>
                    </div>
                </div>
            </div >
        )
    }
}
export default DebitMatch
