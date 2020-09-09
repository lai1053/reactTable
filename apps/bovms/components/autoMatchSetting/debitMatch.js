import React from "react"
import { Radio, Switch, Icon, Popover, Select, Checkbox } from 'antd'
import RangeSetting from './rangeSetting'
const Option = Select.Option

class StockSection extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        const {
            matchMethodType,
            accurateMatchCondition,
            fuzzyMatchCondition,
            accountList,
            autoMatchAssist,
            assistTypeList,
            inventoryTypeList = []
        } = this.props.data
        const { inventoryEnableState, handleChange, handleRangeSetting, module } = this.props
        return (
            <div className='bovms-app-auto-match-setting-debit-subItem'>
                <div className='bovms-app-auto-match-setting-debit-subItem-titles'>
                    <h5>匹配方法</h5>
                    <h5>精确匹配条件</h5>
                    {matchMethodType === '2' && <h5>模糊匹配条件</h5>}
                    <h5>匹配的存货类型范围</h5>
                </div>
                <div className='bovms-app-auto-match-setting-debit-subItem-controls'>
                    {/* 匹配方法 */}
                    <div>
                        <Select value={matchMethodType} style={{ width: '250px' }} onChange={(value) => { handleChange('stock.matchMethodType', value) }}>
                            <Option key={'1'} value={'1'}>精确匹配</Option>
                            <Option key={'2'} value={'2'}>先精确匹配，再模糊匹配</Option>
                        </Select>
                        <Popover
                            placement="topLeft"
                            className="habit-setting-tooltip"
                            arrowPointAtCenter
                            content={module === 1 && inventoryEnableState ?
                                <div>
                                    <div>请选择存货档案的匹配规则：</div>
                                    <div>精确匹配规则：开票项目的元素与存货档案的对应元素相同。</div>
                                    <div>模糊匹配规则：开票项目的元素与存货档案的对应元素相似。</div>
                                </div>
                                : <div>
                                    <div>请选择存货档案的匹配规则：</div>
                                    <div>精确匹配：开票项目的元素与存货档案的元素相同</div>
                                    <div>模糊匹配：开票项目的元素与存货档案的元素相互包含</div>
                                </div>}
                        >
                            <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                        </Popover>
                    </div>
                    {/* 精确匹配条件 */}
                    <div>
                        <Checkbox checked={accurateMatchCondition.goodsName === '1' ? true : false} onChange={(value) => { handleChange('stock.goodsName', value) }}>商品或服务名称</Checkbox>
                        <Checkbox checked={accurateMatchCondition.specification === '1' ? true : false} onChange={(value) => { handleChange('stock.specification', value) }}>规格型号</Checkbox>
                        <Checkbox checked={accurateMatchCondition.unitName === '1' ? true : false} onChange={(value) => { handleChange('stock.unitName', value) }}>单位</Checkbox>
                    </div>
                    {/* 模糊匹配条件 */}
                    {matchMethodType === '2' && <div>
                        <Checkbox checked={fuzzyMatchCondition.goodsName === '1' ? true : false} disabled>商品或服务名称</Checkbox>
                    </div>}
                    <div className='bovms-app-auto-match-setting-debit-subItem-match-range'>
                        <a href='javascript:;' onClick={(value) => { handleRangeSetting('inventoryTypeList') }}>设置</a>
                        <div>
                            {inventoryTypeList.map(e => {
                                return (<p>{`${e.code} ${e.name}`}</p>)
                            })}
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}

class AcctSection extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        const {
            matchMethodType,
            accurateMatchCondition,
            fuzzyMatchCondition,
            accountList,
            autoMatchAssist,
            assistTypeList,
            inventoryTypeList = []
        } = this.props.data

        const { inventoryEnableState, handleChange, module, handleRangeSetting } = this.props
        return (
            <div style={{ height: 'auto' }}>
                <div className='bovms-app-auto-match-setting-debit-subItem'>
                    <div className='bovms-app-auto-match-setting-debit-subItem-titles'>
                        <h5>匹配方法</h5>
                        <h5>精确匹配条件</h5>
                        {matchMethodType === '2' && <h5>模糊匹配条件</h5>}
                        <h5>匹配的科目范围</h5>
                    </div>
                    <div className='bovms-app-auto-match-setting-debit-subItem-controls'>
                        {/* 匹配方法 */}
                        <div>
                            <Select value={matchMethodType} style={{ width: '250px' }} onChange={(value) => { handleChange('acct.matchMethodType', value) }}>
                                <Option key={'1'} value={'1'}>精确匹配</Option>
                                {(module === 2 || (module === 1 && !inventoryEnableState)) && <Option key={'2'} value={'2'}>先精确匹配，再模糊匹配</Option>}
                            </Select>
                            <Popover
                                placement="topLeft"
                                className="habit-setting-tooltip"
                                arrowPointAtCenter
                                content={module === 1 && inventoryEnableState ?
                                    <div>
                                        <div>精确匹配规则：</div>
                                        <div>选择了一个元素时：开票项目的元素与会计科目名称相同。</div>
                                        <div>选择了多个元素时：会计科目包含全部的的元素</div>
                                    </div>
                                    : <div>
                                        <div>请选择{module === 2 ? '借' : '贷'}方科目的匹配规则：</div>
                                        <div>精确匹配：</div>
                                        <div>仅1个元素时，开票项目的元素与{module === 2 ? '借' : '贷'}方科目的名称相同</div>
                                        <div>有多个元素时，{module === 2 ? '借' : '贷'}方科目的名称包含全部的元素</div>
                                        <div>模糊匹配：开票项目的元素与{module === 2 ? '借' : '贷'}方科目名称相互包含</div>
                                    </div>}
                            >
                                <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                            </Popover>
                        </div>
                        {/* 精确匹配条件 */}
                        <div>
                            <Checkbox checked={accurateMatchCondition.goodsName === '1' ? true : false} onChange={(value) => { handleChange('acct.goodsName', value) }}>商品或服务名称</Checkbox>
                            <Checkbox checked={accurateMatchCondition.specification === '1' ? true : false} onChange={(value) => { handleChange('acct.specification', value) }}>规格型号</Checkbox>
                            <Checkbox checked={accurateMatchCondition.unitName === '1' ? true : false} onChange={(value) => { handleChange('acct.unitName', value) }}>单位</Checkbox>
                        </div>
                        {/* 模糊匹配条件 */}
                        {matchMethodType === '2' && <div>
                            <Checkbox checked={fuzzyMatchCondition.goodsName === '1' ? true : false} disabled>商品或服务名称</Checkbox>
                        </div>}
                        <div className='bovms-app-auto-match-setting-debit-subItem-match-range'>
                            <a href='javascript:;' onClick={(value) => { handleRangeSetting('accountList') }}>设置</a>
                            <div>
                                {accountList.map(e => {
                                    return (<p>{`${e.code} ${e.name}`}</p>)
                                })}
                            </div>

                        </div>
                    </div>
                </div>

                {/* 未启用存货 或者 销项启用存货 */}
                {!inventoryEnableState && <div style={{ position: 'relative' }} className='bovms-app-auto-match-setting-debit-subItem'>
                    <h5>科目带有辅助核算时，自动匹配辅助核算</h5>
                    <div className='bovms-app-auto-match-setting-debit-top-switch'>
                        <Switch checked={autoMatchAssist === '1' ? true : false} onChange={(value) => { handleChange('autoMatchAssist', value) }}></Switch>
                        <Popover
                            placement="topLeft"
                            className="habit-setting-tooltip"
                            arrowPointAtCenter
                            content={module === 1 ? '开启时可匹配带有【存货档案】辅助核算的科目' : '开启时可匹配带有辅助核算的科目'}
                        >
                            <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                        </Popover></div>
                </div>}

                {/* 未启用存货 */}
                {
                    !inventoryEnableState && autoMatchAssist === '1' && <div className='bovms-app-auto-match-setting-debit-subItem'>
                        <div className='bovms-app-auto-match-setting-debit-subItem-titles'>
                            <h5>辅助核算类型</h5>
                            <h5>匹配的存货类型范围</h5>
                        </div>
                        <div className='bovms-app-auto-match-setting-debit-subItem-controls'>
                            {/* 辅助核算类型 */}
                            <div>
                                存货档案
                                <Popover
                                    placement="topLeft"
                                    className="habit-setting-tooltip"
                                    arrowPointAtCenter
                                    content={'仅支持带有【存货档案】辅助核算的科目进行匹配，不支持其他辅助核算类型'}
                                >
                                    <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '20px' }} />
                                </Popover>
                            </div>

                            {/* 匹配的存货类型范围 */}

                            <div className='bovms-app-auto-match-setting-debit-subItem-match-range'>
                                <a href='javascript:;' onClick={(value) => { handleRangeSetting('inventoryTypeList', 'acct') }}>设置</a>
                                <div>
                                    {inventoryTypeList.map(e => {
                                        return (<p>{`${e.code} ${e.name}`}</p>)
                                    })}
                                </div>

                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}



class DebitMatch extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
        this.key = props.inventoryEnableState ? 'matchStockDto' : 'matchAccountDto'
        this.webapi = props.webapi
        this.metaAction = props.metaAction
    }
    onChange(type, e) {
        let { data, handleChange, inventoryEnableState, module } = this.props
        switch (type) {
            case 'systemAutoMatchAccountAndStock':
                data.systemAutoMatchAccountAndStock = e ? '1' : '0'
                data.useAndSaveMemoryData = e ? '1' : '0'
                //是否启用存货
                if (module === 2) {
                    if (inventoryEnableState) {
                        data.autoMatchStock = e ? '1' : '0'
                    } else {
                        data.autoMatchAccount = e ? '1' : '0'
                    }
                } else {
                    if (inventoryEnableState) {
                        data.autoMatchStock = e ? '1' : '0'
                        data.autoMatchAccount = e ? '1' : '0'
                    } else {
                        data.autoMatchAccount = e ? '1' : '0'
                    }
                }

                break
            case 'useAndSaveMemoryData':
            case 'saveMemoryDataToOtherModule':
            case 'autoMatchStock':
            case 'autoMatchAccount':
                data[type] = e ? '1' : '0'
                if (type === 'autoMatchAccount') {
                    data.matchAccountDto.autoMatchAssist = e ? '1' : '0'
                }
                //进项
                if (module === 2) {
                    //已启用存货
                    if (inventoryEnableState) {
                        //【自动根据记忆库进行匹配（智能记忆）】开启，或【无记忆数据时自动匹配已存在的存货档案】开启，则【系统自动匹配】开启
                        if (data.useAndSaveMemoryData === '1' || data.autoMatchStock === '1') {
                            data.systemAutoMatchAccountAndStock = '1'
                        }
                        //【自动根据记忆库进行匹配（智能记忆）】关闭，且【无记忆数据时自动匹配已存在的存货档案】关闭，则【系统自动匹配】关闭
                        if (data.useAndSaveMemoryData === '0' && data.autoMatchStock === '0') {
                            data.systemAutoMatchAccountAndStock = '0'
                        }
                    } else {//未启用存货
                        //【自动根据记忆库进行匹配（智能记忆）】开启，或【无记忆数据时自动匹配已存在的科目】开启，则【系统自动匹配】开启
                        if (data.useAndSaveMemoryData === '1' || data.autoMatchAccount === '1') {
                            data.systemAutoMatchAccountAndStock = '1'
                        }
                        //【自动根据记忆库进行匹配（智能记忆）】关闭，且【无记忆数据时自动匹配已存在的科目】关闭，则【系统自动匹配】关闭
                        if (data.useAndSaveMemoryData === '0' && data.autoMatchAccount === '0') {
                            data.systemAutoMatchAccountAndStock = '0'
                        }
                    }
                } else {//销项 
                    //已启用存货
                    if (inventoryEnableState) {
                        //【自动根据记忆库进行匹配（智能记忆）】开启，
                        //或【无记忆数据时自动匹配已存在的存货档案】开启，
                        //或【无记忆数据时自动匹配已存在的科目】开启，
                        //则【系统自动匹配】开启
                        if (data.useAndSaveMemoryData === '1' || data.autoMatchStock === '1' || data.autoMatchAccount === '1') {
                            data.systemAutoMatchAccountAndStock = '1'
                        }
                        //【自动根据记忆库进行匹配（智能记忆）】关闭，
                        //且【无记忆数据时自动匹配已存在的存货档案】关闭，
                        //且【无记忆数据时自动匹配已存在的科目】关闭，
                        //则【系统自动匹配】关闭
                        if (data.useAndSaveMemoryData === '0' && data.autoMatchStock === '0' && data.autoMatchAccount === '0') {
                            data.systemAutoMatchAccountAndStock = '0'
                        }
                    } else {//未启用存货
                        //【自动根据记忆库进行匹配（智能记忆）】开启，或【无记忆数据时自动匹配已存在的科目】开启，则【系统自动匹配】开启
                        if (data.useAndSaveMemoryData === '1' || data.autoMatchAccount === '1') {
                            data.systemAutoMatchAccountAndStock = '1'
                        }
                        //【自动根据记忆库进行匹配（智能记忆）】关闭，且【无记忆数据时自动匹配已存在的科目】关闭，则【系统自动匹配】关闭
                        if (data.useAndSaveMemoryData === '0' && data.autoMatchAccount === '0') {
                            data.systemAutoMatchAccountAndStock = '0'
                        }
                    }
                }

                break
            case 'stock.matchMethodType':
                data.matchStockDto.matchMethodType = e
                if (e === '2') {
                    data.matchStockDto.fuzzyMatchCondition.goodsName = '1'
                }
                break
            case 'acct.matchMethodType':
                data.matchAccountDto.matchMethodType = e
                if (e === '2') {
                    data.matchAccountDto.fuzzyMatchCondition.goodsName = '1'
                }
                break
            case 'stock.goodsName':
            case 'stock.specification':
            case 'stock.unitName':
                data.matchStockDto.accurateMatchCondition[type.split('.')[1]] = e.target.checked ? '1' : '0'
                break
            case 'acct.goodsName':
            case 'acct.specification':
            case 'acct.unitName':
                data.matchAccountDto.accurateMatchCondition[type.split('.')[1]] = e.target.checked ? '1' : '0'
                break
            case 'autoMatchAssist':
                data.matchAccountDto.autoMatchAssist = e ? '1' : '0'
                break

        }
        handleChange(module === 2 ? { account10MatchDto: data } : { account20MatchDto: data })
    }
    async handleRangeSetting(type, parentType) {
        let { data, module, yearPeriod, handleChange } = this.props
        let list = []
        if (type === 'inventoryTypeList') {
            if (parentType) {
                list = list.concat(data && data.matchAccountDto && data.matchAccountDto[type] || [])
            } else {
                list = list.concat(data && data.matchStockDto && data.matchStockDto[type] || [])
            }
        } else {
            list = list.concat(data && data.matchAccountDto && data.matchAccountDto[type] || [])
        }
        let ret = await this.metaAction.modal("show", {
            title: type === 'inventoryTypeList' ? "存货类型查找范围与顺序" : `${module === 2 ? '借' : '贷'}方科目查找范围与顺序`,
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
            if (type === 'inventoryTypeList') {
                if (parentType) {
                    data.matchAccountDto[type] = ret
                } else {
                    data.matchStockDto[type] = ret
                }
            } else {
                data.matchAccountDto[type] = ret
            }

            handleChange(module === 2 ? { account10MatchDto: data } : { account20MatchDto: data })
        }
    }

    render() {
        const { inventoryEnableState, module, groupByRule } = this.props,
            {
                systemAutoMatchAccountAndStock,
                useAndSaveMemoryData,
                useOtherModuleMemoryData,
                saveMemoryDataToOtherModule,
                autoMatchAccountAndAssist,
                autoMatchStock,
                autoMatchAccount,
                matchAccountDto,
                matchStockDto
            } = this.props.data
        let switchClassName = ''

        //进项
        if (module === 2) {
            //启用存货
            if (inventoryEnableState) {
                if (!(useAndSaveMemoryData === '1' && autoMatchStock === '1') && !(useAndSaveMemoryData === '0' && autoMatchStock === '0')) {
                    switchClassName = 'bovms-app-auto-match-setting-switch-style ant-switch-checked'
                }
            } else {
                if (!(useAndSaveMemoryData === '1' && autoMatchAccount === '1') && !(useAndSaveMemoryData === '0' && autoMatchAccount === '0')) {
                    switchClassName = 'bovms-app-auto-match-setting-switch-style ant-switch-checked'
                }
            }
        } else {
            if (inventoryEnableState) {
                if (!(useAndSaveMemoryData === '1' && autoMatchStock === '1' && autoMatchAccount === '1') && !(useAndSaveMemoryData === '0' && autoMatchStock === '0' && autoMatchAccount === '0')) {
                    switchClassName = 'bovms-app-auto-match-setting-switch-style ant-switch-checked'
                }
            } else {
                if (!(useAndSaveMemoryData === '1' && autoMatchAccount === '1') && !(useAndSaveMemoryData === '0' && autoMatchAccount === '0')) {
                    switchClassName = 'bovms-app-auto-match-setting-switch-style ant-switch-checked'
                }
            }
        }

        return (
            <div className="bovms-app-auto-match-setting-debit bovms-app-auto-match-setting-wrap">
                <div className='bovms-app-auto-match-setting-debit-top'>
                    <div>{inventoryEnableState ? `系统自动匹配存货档案、${module === 2 ? '借方科目' : '贷方科目'}` : `系统自动匹配${module === 2 ? '借方科目' : '贷方科目'}`}
                        <div className='bovms-app-auto-match-setting-debit-top-switch'>
                            <Switch disabled={groupByRule === '4'} checked={systemAutoMatchAccountAndStock === '1' ? true : false} className={switchClassName} onChange={this.onChange.bind(this, 'systemAutoMatchAccountAndStock')} ></Switch>
                            <Popover
                                placement="topLeft"
                                className="habit-setting-tooltip"
                                arrowPointAtCenter
                                content={`开启时，系统会自动匹配${inventoryEnableState ? '存货档案和' : ''}${module === 2 ? '借' : '贷'}方科目,当业务核算精度选择【商品或服务名称+规格型号+单位+单价】时，不可开启`}
                            >
                                <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                            </Popover></div>
                    </div>

                    <div>自动根据记忆库进行匹配（智能记忆）
                    <div className='bovms-app-auto-match-setting-debit-top-switch'>
                            <Switch disabled={groupByRule === '4'} checked={useAndSaveMemoryData === '1' ? true : false} onChange={this.onChange.bind(this, 'useAndSaveMemoryData')} ></Switch>
                            <Popover
                                placement="topLeft"
                                className="habit-setting-tooltip"
                                arrowPointAtCenter
                                content={inventoryEnableState ?
                                    `系统自动记录开票项目对应的存货档案或${module === 2 ? '借' : '贷'}方科目（非存货业务），并用于后续取票时的自动匹配` :
                                    `系统自动记录开票项目对应的${module === 2 ? '借' : '贷'}方科目，并用于后续取票时的自动匹配`}
                            >
                                <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                            </Popover></div>
                    </div>

                    {
                        useAndSaveMemoryData === '1' &&
                        <div style={{ paddingLeft: '26px' }}>{module === 2 ? '开票项目与存货档案的关系同时记忆到销项记忆库' : '开票项目与存货档案的关系同时记忆到进项记忆库'}
                            <div className='bovms-app-auto-match-setting-debit-top-switch'>
                                <Switch checked={saveMemoryDataToOtherModule === '1' ? true : false} onChange={this.onChange.bind(this, 'saveMemoryDataToOtherModule')}></Switch>
                                <Popover
                                    placement="topLeft"
                                    className="habit-setting-tooltip"
                                    arrowPointAtCenter
                                    content={inventoryEnableState ? <div>
                                        <div>当开启时，{module === 2 ? '进' : '销'}项模块记忆的数据会复制到{module === 2 ? '销' : '进'}项记忆库</div>
                                        <div>未开启时，{module === 2 ? '进' : '销'}项模块记忆的数据仅保存在{module === 2 ? '进' : '销'}项记忆库</div>
                                    </div> : `将开票项目与存货档案的关系记忆到${module === 2 ? '销项' : '进项'}模块的记忆库，用于${module === 2 ? '销售' : '采购'}业务的自动匹配`}
                                >
                                    <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                                </Popover></div>
                        </div>
                    }

                    {/* start 存货档案设置 */}
                    {!!inventoryEnableState && <div>
                        无记忆数据时自动匹配已存在的存货档案
                        <div className='bovms-app-auto-match-setting-debit-top-switch'>
                            <Switch disabled={groupByRule === '4'} checked={autoMatchStock === '1' ? true : false} onChange={this.onChange.bind(this, 'autoMatchStock')}></Switch>
                            <Popover
                                placement="topLeft"
                                className="habit-setting-tooltip"
                                arrowPointAtCenter
                                content={`开启时，将按开票项目和设置的规则自动查找已存在的存货档案`}
                            >
                                <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                            </Popover></div>
                    </div>}
                    {(!!inventoryEnableState && autoMatchStock === '1') &&
                        <StockSection
                            handleRangeSetting={this.handleRangeSetting.bind(this)}
                            inventoryEnableState={inventoryEnableState}
                            module={module}
                            handleChange={this.onChange.bind(this)}
                            data={matchStockDto}>
                        </StockSection>
                    }
                    {/* end 存货档案设置 */}

                    {/* start 科目设置 */}
                    {(module === 1 || !!!inventoryEnableState) && <div>
                        无记忆数据时自动匹配已存在的科目
                        <div className='bovms-app-auto-match-setting-debit-top-switch'>
                            <Switch disabled={groupByRule === '4'} checked={autoMatchAccount === '1' ? true : false} onChange={this.onChange.bind(this, 'autoMatchAccount')}></Switch>
                            <Popover
                                placement="topLeft"
                                className="habit-setting-tooltip"
                                arrowPointAtCenter
                                content={`记忆库中未保存的开票项目，将会按设定的规则匹配已存在的科目`}
                            >
                                <Icon type="question" className="bovms-help-icon" style={{ marginLeft: '32px' }} />
                            </Popover></div>
                    </div>}
                    {((module === 1 || !!!inventoryEnableState) && autoMatchAccount === '1') &&
                        <AcctSection
                            handleRangeSetting={this.handleRangeSetting.bind(this)}
                            inventoryEnableState={inventoryEnableState}
                            module={module}
                            handleChange={this.onChange.bind(this)}
                            data={matchAccountDto}>
                        </AcctSection>}
                </div>
                <div className='bovms-app-auto-match-setting-tips' style={{ marginTop: '24px' }}>
                    <div className='bovms-app-auto-match-setting-tips-title'>温馨提示：</div>
                    <div className='bovms-app-auto-match-setting-tips-content'>
                        <p>1）系统将按照设置的规则，进行借方科目、贷方科目，存货档案等项目的自动匹配</p>
                        <p>2）不同的匹配方法会导致不同的匹配结果，修改配置时建议先阅读提示信息</p>
                        <p>3）科目范围、辅助核算类别越多，匹配所需时间越长，建议按进项业务的实际核算方式进行设置</p>
                        <p>4）自动匹配结果不能保证100%准确，建议对匹配结果进行检查</p>
                        <p>5）商品税务编码以2、3、4、5、6开头的商品或服务，不进行存货档案的自动查找，仅查找记忆数据</p>
                    </div>
                </div>
            </div >
        )
    }
}
export default DebitMatch
