import React from 'react'
import { Tabs, Checkbox } from 'edf-component'
import { Button } from 'antd'
const { TabPane } = Tabs
import AccountingAccuracy from './accountingAccuracy'
import DebitMatch from './debitMatch'
import LoanMatch from './loanMatch'


/**
 * module:模块类型。2：进项；销项：1 
 * defaultActiveKey： 默认激活的tabKey
 * inventoryEnableState：存货状态。1：启用；0：未启用
 */

class AutoMatchSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            current: props.defaultActiveKey || '1',
            noAutoPopup: "0",                              //是否不再自动弹出，"0"：关闭状态；"1"：开启状态
            businessAccountingDto: {                       //业务核算精度Dto
                accountingDto: {                          //业务核算精度设置（分组依据）
                    groupByRule: "1",                   //分组规则，"1"：商品或服务名称；"2"：商品或服务名称+规格型号；"3"：商品或服务名称+规格型号+单位；"4"：商品或服务名称+规格型号+单位+单价，不使用贷方/借方自动匹配功能
                    displayPrice: "1",                  //是否显示单价，"0"：关闭状态；"1"：开启状态
                    populatePriceToStockName: "1"       //新增存货档案时，将单价带入至档案名称中，"0"：关闭状态；"1"：开启状态
                },
                inventoryDisplayDto: {                    //档案显示设置
                    displayInventoryType: "1"           //显示存货档案类型，"0"：关闭状态；"1"：开启状态
                }
            },
            account10MatchDto: {                           //借方科目，自动匹配设置Dto
                systemAutoMatchAccountAndStock: "1",      //系统自动匹配存货档案，或者/和（借方、贷方）科目，"0"：关闭状态；"1"：开启状态
                useAndSaveMemoryData: "1",                //自动根据记忆库进行匹配（并且进行智能记忆），"0"：关闭状态；"1"：开启状态
                useOtherModuleMemoryData: "1",            //使用其他模块的记忆数据进行匹配，"0"：关闭状态；"1"：开启状态
                saveMemoryDataToOtherModule: "1",         //同时记忆到其他模块，"0"：关闭状态；"1"：开启状态
                autoMatchAccountAndAssist: "1",           //无记忆数据时，自动匹配往来科目和辅助核算，"0"：关闭状态；"1"：开启状态
                matchAccountAndAssistDto: {               //自动匹配往来科目和辅助核算设置
                    matchMethodType: "1",                //匹配方法，"1"：精确匹配；"2"：模糊匹配
                    accurateMatchCondition: {             //精确匹配条件
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    fuzzyMatchCondition: {                //模糊匹配条件（注：与精确匹配条件accurateMatchCondition结构相同，根据实际情况返回相应的字段）
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    accountList: [                        //匹配的一级科目范围与顺序设置列表
                        {
                            code: "101201",                   //一级科目编码
                            name: "test"                      //一级科目名称
                        }
                    ],
                    autoMatchAssist: "1",                //辅助核算自动匹配，"0"：关闭状态；"1"：开启状态
                    assistTypeList: [],
                    inventoryTypeList: []
                },
                autoMatchStock: "1",                      //无记忆数据时，自动匹配已存在的存货档案，"0"：关闭状态；"1"：开启状态
                matchStockDto: {                          //自动匹配已存在的存货档案设置（注：与自动匹配往来科目和辅助核算设置matchAccountAndAssistDto结构相同，根据实际情况返回相应的字段）
                    matchMethodType: "1",                //匹配方法，"1"：精确匹配；"2"：模糊匹配
                    accurateMatchCondition: {             //精确匹配条件
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    fuzzyMatchCondition: {                //模糊匹配条件（注：与精确匹配条件accurateMatchCondition结构相同，根据实际情况返回相应的字段）
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    accountList: [],
                    autoMatchAssist: "1",                //辅助核算自动匹配，"0"：关闭状态；"1"：开启状态
                    assistTypeList: []
                },
                autoMatchAccount: "1",                    //无记忆数据时，自动匹配已存在的会计科目，"0"：关闭状态；"1"：开启状态
                matchAccountDto: {                        //自动匹配已存在的会计科目设置（注：与自动匹配往来科目和辅助核算设置matchAccountAndAssistDto结构相同，根据实际情况返回相应的字段）
                    matchMethodType: "1",                //匹配方法，"1"：精确匹配；"2"：模糊匹配
                    accurateMatchCondition: {             //精确匹配条件
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    fuzzyMatchCondition: {                //模糊匹配条件（注：与精确匹配条件accurateMatchCondition结构相同，根据实际情况返回相应的字段）
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    accountList: [],
                    autoMatchAssist: "1",                //辅助核算自动匹配，"0"：关闭状态；"1"：开启状态
                    assistTypeList: [],
                    inventoryTypeList: []
                }
            },
            account20MatchDto: {                           //贷方科目，自动匹配设置Dto（（注：与借方科目，自动匹配设置Dto（account10MatchDto）结构相同，根据实际情况返回相应的字段）
                systemAutoMatchAccountAndStock: "1",      //系统自动匹配存货档案，或者/和（借方、贷方）科目，"0"：关闭状态；"1"：开启状态
                useAndSaveMemoryData: "1",                //自动根据记忆库进行匹配（并且进行智能记忆），"0"：关闭状态；"1"：开启状态
                useOtherModuleMemoryData: "1",            //使用其他模块的记忆数据进行匹配，"0"：关闭状态；"1"：开启状态
                saveMemoryDataToOtherModule: "1",         //同时记忆到其他模块，"0"：关闭状态；"1"：开启状态
                autoMatchAccountAndAssist: "1",           //无记忆数据时，自动匹配往来科目和辅助核算，"0"：关闭状态；"1"：开启状态
                matchAccountAndAssistDto: {               //自动匹配往来科目和辅助核算设置
                    matchMethodType: "1",                //匹配方法，"1"：精确匹配；"2"：模糊匹配
                    accurateMatchCondition: {             //精确匹配条件
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    fuzzyMatchCondition: {                //模糊匹配条件（注：与精确匹配条件accurateMatchCondition结构相同，根据实际情况返回相应的字段）
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    accountList: [],
                    autoMatchAssist: "1",                //辅助核算自动匹配，"0"：关闭状态；"1"：开启状态
                    assistTypeList: [],
                    inventoryTypeList: []
                },
                autoMatchStock: "1",                      //无记忆数据时，自动匹配已存在的存货档案，"0"：关闭状态；"1"：开启状态
                matchStockDto: {                          //自动匹配已存在的存货档案设置（注：与自动匹配往来科目和辅助核算设置matchAccountAndAssistDto结构相同，根据实际情况返回相应的字段）
                    matchMethodType: "1",                //匹配方法，"1"：精确匹配；"2"：模糊匹配
                    accurateMatchCondition: {             //精确匹配条件
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    fuzzyMatchCondition: {                //模糊匹配条件（注：与精确匹配条件accurateMatchCondition结构相同，根据实际情况返回相应的字段）
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    accountList: [],
                    autoMatchAssist: "1",                //辅助核算自动匹配，"0"：关闭状态；"1"：开启状态
                    assistTypeList: [],
                    inventoryTypeList: []
                },
                autoMatchAccount: "1",                    //无记忆数据时，自动匹配已存在的会计科目，"0"：关闭状态；"1"：开启状态
                matchAccountDto: {                        //自动匹配已存在的会计科目设置（注：与自动匹配往来科目和辅助核算设置matchAccountAndAssistDto结构相同，根据实际情况返回相应的字段）
                    matchMethodType: "1",                //匹配方法，"1"：精确匹配；"2"：模糊匹配
                    accurateMatchCondition: {             //精确匹配条件
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    fuzzyMatchCondition: {                //模糊匹配条件（注：与精确匹配条件accurateMatchCondition结构相同，根据实际情况返回相应的字段）
                        custName: "1",                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                        goodsName: "1",                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                        specification: "1",              //规格型号，"0"：关闭状态；"1"：开启状态
                        unitName: "1"                    //单位，"0"：关闭状态；"1"：开启状态
                    },
                    accountList: [                        //匹配的一级科目范围与顺序设置列表
                        {
                            code: "101201",                   //一级科目编码
                            name: "test"                      //一级科目名称
                        }
                    ],
                    autoMatchAssist: "1",                //辅助核算自动匹配，"0"：关闭状态；"1"：开启状态
                    assistTypeList: [],
                    inventoryTypeList: []
                }
            }
        }
        this.defaultData = {
            systemAutoMatchAccountAndStock: null,      //系统自动匹配存货档案，或者/和（借方、贷方）科目，"0"：关闭状态；"1"：开启状态
            useAndSaveMemoryData: null,                //自动根据记忆库进行匹配（并且进行智能记忆），"0"：关闭状态；"1"：开启状态
            useOtherModuleMemoryData: null,            //使用其他模块的记忆数据进行匹配，"0"：关闭状态；"1"：开启状态
            saveMemoryDataToOtherModule: null,         //同时记忆到其他模块，"0"：关闭状态；"1"：开启状态
            autoMatchAccountAndAssist: null,           //无记忆数据时，自动匹配往来科目和辅助核算，"0"：关闭状态；"1"：开启状态
            matchAccountAndAssistDto: {               //自动匹配往来科目和辅助核算设置
                matchMethodType: null,                //匹配方法，"1"：精确匹配；"2"：模糊匹配
                accurateMatchCondition: {             //精确匹配条件
                    custName: null,                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                    goodsName: null,                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                    specification: null,              //规格型号，"0"：关闭状态；"1"：开启状态
                    unitName: null                    //单位，"0"：关闭状态；"1"：开启状态
                },
                fuzzyMatchCondition: {                //模糊匹配条件（注：与精确匹配条件accurateMatchCondition结构相同，根据实际情况返回相应的字段）
                    custName: null,                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                    goodsName: null,                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                    specification: null,              //规格型号，"0"：关闭状态；"1"：开启状态
                    unitName: null                    //单位，"0"：关闭状态；"1"：开启状态
                },
                accountList: null,
                autoMatchAssist: null,                //辅助核算自动匹配，"0"：关闭状态；"1"：开启状态
                assistTypeList: null,
                inventoryTypeList: null
            },
            autoMatchStock: null,                      //无记忆数据时，自动匹配已存在的存货档案，"0"：关闭状态；"1"：开启状态
            matchStockDto: {                          //自动匹配已存在的存货档案设置（注：与自动匹配往来科目和辅助核算设置matchAccountAndAssistDto结构相同，根据实际情况返回相应的字段）
                matchMethodType: null,                //匹配方法，"1"：精确匹配；"2"：模糊匹配
                accurateMatchCondition: {             //精确匹配条件
                    custName: null,                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                    goodsName: null,                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                    specification: null,              //规格型号，"0"：关闭状态；"1"：开启状态
                    unitName: null                    //单位，"0"：关闭状态；"1"：开启状态
                },
                fuzzyMatchCondition: {                //模糊匹配条件（注：与精确匹配条件accurateMatchCondition结构相同，根据实际情况返回相应的字段）
                    custName: null,                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                    goodsName: null,                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                    specification: null,              //规格型号，"0"：关闭状态；"1"：开启状态
                    unitName: null                   //单位，"0"：关闭状态；"1"：开启状态
                },
                accountList: null,
                autoMatchAssist: null,                //辅助核算自动匹配，"0"：关闭状态；"1"：开启状态
                assistTypeList: null,
                inventoryTypeList: null
            },
            autoMatchAccount: null,                    //无记忆数据时，自动匹配已存在的会计科目，"0"：关闭状态；"1"：开启状态
            matchAccountDto: {                        //自动匹配已存在的会计科目设置（注：与自动匹配往来科目和辅助核算设置matchAccountAndAssistDto结构相同，根据实际情况返回相应的字段）
                matchMethodType: null,                //匹配方法，"1"：精确匹配；"2"：模糊匹配
                accurateMatchCondition: {             //精确匹配条件
                    custName: null,                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                    goodsName: null,                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                    specification: null,              //规格型号，"0"：关闭状态；"1"：开启状态
                    unitName: null                   //单位，"0"：关闭状态；"1"：开启状态
                },
                fuzzyMatchCondition: {                //模糊匹配条件（注：与精确匹配条件accurateMatchCondition结构相同，根据实际情况返回相应的字段）
                    custName: null,                   //客户名称，购方名称或者销方名称，"0"：关闭状态；"1"：开启状态
                    goodsName: null,                  //商品或服务名称，"0"：关闭状态；"1"：开启状态
                    specification: null,              //规格型号，"0"：关闭状态；"1"：开启状态
                    unitName: null                    //单位，"0"：关闭状态；"1"：开启状态
                },
                accountList: null,
                autoMatchAssist: null,                //辅助核算自动匹配，"0"：关闭状态；"1"：开启状态
                assistTypeList: null,
                inventoryTypeList: null
            },

        }
        this.webapi = props.webapi
        this.metaAction = props.metaAction
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }
    onCancel = e => {
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal();
    }


    //保存维度设置
    onOk = async () => {
        const { module, inventoryEnableState, yearPeriod } = this.props
        const { current, account10MatchDto, account20MatchDto } = this.state
        let isFill = true
        //进项
        if (module === 2) {
            //是否启用存货
            if (inventoryEnableState) {
                //开启【无记忆数据时，自动匹配已存在的存货档案】并且未选中任何一个【精确匹配条件】
                if (account10MatchDto.autoMatchStock === '1' && Object.keys(account10MatchDto.matchStockDto.accurateMatchCondition).every(e => account10MatchDto.matchStockDto.accurateMatchCondition[e] === '0')) {
                    isFill = false
                }
            } else {//未启用存货
                //开启【无记忆数据时，自动匹配已存在的会计科目】并且未选中任何一个【精确匹配条件】
                if (account10MatchDto.autoMatchAccount === '1' && Object.keys(account10MatchDto.matchAccountDto.accurateMatchCondition).every(e => account10MatchDto.matchAccountDto.accurateMatchCondition[e] === '0')) {
                    isFill = false
                }
            }
        } else {//销项
            //是否启用存货
            if (inventoryEnableState) {
                //开启【无记忆数据时，自动匹配已存在的存货档案】并且未选中任何一个【精确匹配条件】
                if (account20MatchDto.autoMatchStock === '1' && Object.keys(account20MatchDto.matchStockDto.accurateMatchCondition).every(e => account20MatchDto.matchStockDto.accurateMatchCondition[e] === '0')) {
                    isFill = false
                }
                //开启【无记忆数据时，自动匹配已存在的会计科目】并且未选中任何一个【精确匹配条件】
                if (account20MatchDto.autoMatchAccount === '1' && Object.keys(account20MatchDto.matchAccountDto.accurateMatchCondition).every(e => account20MatchDto.matchAccountDto.accurateMatchCondition[e] === '0')) {
                    isFill = false
                }
            } else {
                //开启【无记忆数据时，自动匹配已存在的会计科目】并且未选中任何一个【精确匹配条件】
                if (account20MatchDto.autoMatchAccount === '1' && Object.keys(account20MatchDto.matchAccountDto.accurateMatchCondition).every(e => account20MatchDto.matchAccountDto.accurateMatchCondition[e] === '0')) {
                    isFill = false
                }
            }
        }
        if (!isFill) {
            this.metaAction.toast('error', '请选择至少1个精确匹配条件')
            return false
        }

        let data = this.state

        //补全参数
        Object.keys(data.account10MatchDto).forEach(e => {
            if (typeof data.account10MatchDto[e] === 'object') {
                data.account10MatchDto[e]['accurateMatchCondition'] = Object.assign({}, this.defaultData[e]['accurateMatchCondition'], data.account10MatchDto[e]['accurateMatchCondition'])
                data.account10MatchDto[e]['fuzzyMatchCondition'] = Object.assign({}, this.defaultData[e]['fuzzyMatchCondition'], data.account10MatchDto[e]['fuzzyMatchCondition'])
                data.account10MatchDto[e] = Object.assign({}, this.defaultData[e], data.account10MatchDto[e])
            }
        })
        //补全参数
        Object.keys(data.account20MatchDto).forEach(e => {
            if (typeof data.account20MatchDto[e] === 'object') {
                data.account20MatchDto[e]['accurateMatchCondition'] = Object.assign({}, this.defaultData[e]['accurateMatchCondition'], data.account20MatchDto[e]['accurateMatchCondition'])
                data.account20MatchDto[e]['fuzzyMatchCondition'] = Object.assign({}, this.defaultData[e]['fuzzyMatchCondition'], data.account20MatchDto[e]['fuzzyMatchCondition'])
                data.account20MatchDto[e] = Object.assign({}, this.defaultData[e], data.account20MatchDto[e])
            }
        })

        //合并对象
        data.account10MatchDto = Object.assign({}, this.defaultData, data.account10MatchDto)
        data.account20MatchDto = Object.assign({}, this.defaultData, data.account20MatchDto)

        let params = {
            module,
            inventoryEnableState,
            yearPeriod,
            accountingAndMatchSetupDto: data,
        }
        let res = await this.webapi.bovms.saveAccountingSetupRule(params)
        if (res === null) {
            this.metaAction.toast('success', '设置成功')
            this.props.closeModal && this.props.closeModal(this.state);
        }
    }
    componentDidMount() {
        this.getData()
    }

    async getData() {
        let { yearPeriod, module, inventoryEnableState } = this.props
        let params = {
            yearPeriod,                 //当前会计期间（必传）
            module,                          //模块名称，1：销项；2：进项（必传）
            inventoryEnableState             //存货启用状态，1：启用；0：没有启用（必传）
        }
        let res = await this.webapi.bovms.queryAccountingSetupRule(params)
        this.setState({ ...res })
    }
    onChange(e) {
        this.setState({
            noAutoPopup: e.target.checked ? '1' : '0'
        })
    }
    change = (obj, type) => {
        this.setState(obj, () => {
            //业务核算精度才触发
            if (type === 1) {
                const data = this.state
                const { module, inventoryEnableState } = this.props
                //核算精度选择第四种‘商品或服务名称+规格型号+单位+单价
                if (data.businessAccountingDto.accountingDto.groupByRule === '4') {
                    //如果是进项则自动关闭借方自动匹配，销项则自动关闭贷方自动匹配
                    if (module === 2) {
                        data.account10MatchDto.systemAutoMatchAccountAndStock = '0'
                        data.account10MatchDto.useAndSaveMemoryData = '0'
                        //是否启用存货，如果启用存货则关闭【无记忆数据时，自动匹配已存在的存货档案】，反之关闭【无记忆数据时，自动匹配已存在的会计科目】
                        if (inventoryEnableState) {
                            data.account10MatchDto.autoMatchStock = '0'
                        } else {
                            data.account10MatchDto.autoMatchAccount = '0'
                        }
                    } else {
                        data.account20MatchDto.systemAutoMatchAccountAndStock = '0'
                        data.account20MatchDto.useAndSaveMemoryData = '0'
                        //是否启用存货，
                        //如果启用存货则关闭【无记忆数据时，自动匹配已存在的存货档案】和【无记忆数据时，自动匹配已存在的会计科目】，
                        //反之关闭【无记忆数据时，自动匹配已存在的会计科目】
                        if (inventoryEnableState) {
                            data.account20MatchDto.autoMatchStock = '0'
                            data.account20MatchDto.autoMatchAccount = '0'
                        } else {
                            data.account20MatchDto.autoMatchAccount = '0'
                        }
                    }
                    this.setState({
                        ...data
                    })
                } else { //核算精度选择非第四种选项时
                    //如果是进项则自动开启借方自动匹配，销项则自动开启贷方自动匹配
                    if (module === 2) {
                        data.account10MatchDto.systemAutoMatchAccountAndStock = '1'
                        data.account10MatchDto.useAndSaveMemoryData = '1'
                        //是否启用存货，如果启用存货则开启【无记忆数据时，自动匹配已存在的存货档案】，反之开启【无记忆数据时，自动匹配已存在的会计科目】
                        if (inventoryEnableState) {
                            data.account10MatchDto.autoMatchStock = '1'
                        } else {
                            data.account10MatchDto.autoMatchAccount = '1'
                        }

                    } else {
                        data.account20MatchDto.systemAutoMatchAccountAndStock = '1'
                        data.account20MatchDto.useAndSaveMemoryData = '1'
                        //是否启用存货，
                        //如果启用存货则开启【无记忆数据时，自动匹配已存在的存货档案】和【无记忆数据时，自动匹配已存在的会计科目】，
                        //反之开启【无记忆数据时，自动匹配已存在的会计科目】
                        if (inventoryEnableState) {
                            data.account20MatchDto.autoMatchStock = '1'
                            data.account20MatchDto.autoMatchAccount = '1'
                        } else {
                            data.account20MatchDto.autoMatchAccount = '1'
                        }
                    }
                    this.setState({
                        ...data
                    })
                }
            }

        })
    }
    handleTabsChange(e) {
        const { current, account10MatchDto, account20MatchDto } = this.state
        const { module, inventoryEnableState } = this.props
        let isFill = true

        //当前activeTabKey为2时
        if (current === '2') {
            //启用存货
            if (inventoryEnableState) {
                //开启【无记忆数据时，自动匹配已存在的存货档案】并且未选中任何一个【精确匹配条件】
                if (account10MatchDto.autoMatchStock === '1' && Object.keys(account10MatchDto.matchStockDto.accurateMatchCondition).every(e => account10MatchDto.matchStockDto.accurateMatchCondition[e] === '0')) {
                    isFill = false
                }
            } else { //未启用存货
                //开启【无记忆数据时，自动匹配已存在的会计科目】并且未选中任何一个【精确匹配条件】
                if (account10MatchDto.autoMatchAccount === '1' && Object.keys(account10MatchDto.matchAccountDto.accurateMatchCondition).every(e => account10MatchDto.matchAccountDto.accurateMatchCondition[e] === '0')) {
                    isFill = false
                }
            }
            //当前activeTabKey为3时
        } else if (current === '3') {
            //启用存货
            if (inventoryEnableState) {
                //开启【无记忆数据时，自动匹配已存在的存货档案】并且未选中任何一个【精确匹配条件】
                if (account20MatchDto.autoMatchStock === '1' && Object.keys(account20MatchDto.matchStockDto.accurateMatchCondition).every(e => account20MatchDto.matchStockDto.accurateMatchCondition[e] === '0')) {
                    isFill = false
                }
                //开启【无记忆数据时，自动匹配已存在的会计科目】并且未选中任何一个【精确匹配条件】
                if (account20MatchDto.autoMatchAccount === '1' && Object.keys(account20MatchDto.matchAccountDto.accurateMatchCondition).every(e => account20MatchDto.matchAccountDto.accurateMatchCondition[e] === '0')) {
                    isFill = false
                }
            } else {
                //未启用存货
                //开启【无记忆数据时，自动匹配已存在的会计科目】并且未选中任何一个【精确匹配条件】
                if (account20MatchDto.autoMatchAccount === '1' && Object.keys(account20MatchDto.matchAccountDto.accurateMatchCondition).every(e => account20MatchDto.matchAccountDto.accurateMatchCondition[e] === '0')) {
                    isFill = false
                }
            }
        }

        if (!isFill) {
            return this.metaAction.toast('error', '请选择至少1个精确匹配条件')
        }

        this.setState({
            current: e
        })
    }
    render() {
        const { businessAccountingDto, account10MatchDto, account20MatchDto, current } = this.state
        let { inventoryEnableState, module, yearPeriod, defaultActiveKey } = this.props
        return (
            <div className="bovms-app-auto-match-setting">
                <Tabs onChange={this.handleTabsChange.bind(this)} activeKey={current} className="bovms-app-auto-match-setting-tabs" animated={false}>
                    {!defaultActiveKey && <TabPane tab={'业务核算精度'} key="1">
                        <AccountingAccuracy
                            data={businessAccountingDto}
                            module={module}
                            inventoryEnableState={inventoryEnableState}
                            handleChange={this.change}>
                        </AccountingAccuracy>
                    </TabPane>}
                    <TabPane tab={'借方科目匹配'} key="2">
                        {module === 2 ?
                            <DebitMatch
                                groupByRule={businessAccountingDto.accountingDto.groupByRule}
                                data={account10MatchDto}
                                module={module}
                                yearPeriod={yearPeriod}
                                inventoryEnableState={inventoryEnableState}
                                handleChange={this.change}
                                webapi={this.webapi}
                                metaAction={this.metaAction}
                            >
                            </DebitMatch> :
                            <LoanMatch
                                data={account10MatchDto}
                                yearPeriod={yearPeriod}
                                module={module}
                                inventoryEnableState={inventoryEnableState}
                                handleChange={this.change}
                                webapi={this.webapi}
                                metaAction={this.metaAction}
                            ></LoanMatch>
                        }
                    </TabPane>
                    <TabPane tab={'贷方科目匹配'} key="3">
                        {module === 1 ?
                            <DebitMatch
                                groupByRule={businessAccountingDto.accountingDto.groupByRule}
                                data={account20MatchDto}
                                module={module}
                                yearPeriod={yearPeriod}
                                inventoryEnableState={inventoryEnableState}
                                handleChange={this.change}
                                webapi={this.webapi}
                                metaAction={this.metaAction}
                            >
                            </DebitMatch> :
                            <LoanMatch
                                data={account20MatchDto}
                                yearPeriod={yearPeriod}
                                module={module}
                                inventoryEnableState={inventoryEnableState}
                                handleChange={this.change}
                                webapi={this.webapi}
                                metaAction={this.metaAction}
                            ></LoanMatch>
                        }
                    </TabPane>
                </Tabs>
                <div className='bovms-app-auto-match-setting-footer'>
                    <Checkbox checked={this.state.noAutoPopup === '1' ? true : false} onChange={this.onChange.bind(this)}>不再自动弹出</Checkbox>
                    <div className='bovms-app-auto-match-setting-footer-buttons'>
                        <Button type="primary" onClick={this.onOk.bind(this)}>确定</Button>
                        &nbsp;&nbsp;
                        <Button onClick={this.onCancel.bind(this)}>取消</Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default AutoMatchSetting