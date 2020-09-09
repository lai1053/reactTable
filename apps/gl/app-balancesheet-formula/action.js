import React from 'react'
import { Map, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { LoadingMask, FormDecorator, Icon } from 'edf-component'
import extend from './extend'
import config from './config'
import { consts } from 'edf-consts'
import { number } from 'edf-utils'
import renderColumns from './utils/renderColumns'
import changeToOption from './utils/changeToOption'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.config = config.current
		this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
	}

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
		this.component = component
        this.injections = injections
		injections.reduce('init', component.props)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        this.metaAction.sf(`data.other.loading`,true)
        this.load()
    }

    //初始化接口调用
	load = async (data) => {
        let params,params2

        params = params2 = {
            period: this.metaAction.gf('data.period')?this.metaAction.gf('data.period').toJS():undefined,
            reportId: this.metaAction.gf('data.type'),
            rowNo: (this.metaAction.gf(`data.index`)-0)
        }
        delete params.period.tempWindow
        let response = await this.webapi.balancesheet.getReportEditFormulaPageInfoForDoc(params)
        if( response.glAccountsList ) {
            this.metaAction.sf('data.accountList', fromJS( changeToOption(response.glAccountsList, 'codeAndName', 'id') ) )
        }
        this.metaAction.sf('data.isReset', !!response.isReset )
        if(params.reportId==1) {
            this.loadBalancesheet(params, response)
        } else {
            this.loadProfitstatement(params, response)
        }
        this.metaAction.sf(`data.other.loading`,false)
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('onTabFocus', this.onTabFocus, false)
        } else if (window.detachEvent) {
            window.detachEvent('onTabFocus', this.onTabFocus)
        }
    }

    //资产负债表初始化接口调用
    loadBalancesheet = async (params, response) => {
        if(response) {
            response.glReportTemplateProjectItemList.push({
                codeAndName:'合计',
                periodEndAmountStr:response.totalPeriodEndAmountStr ? response.totalPeriodEndAmountStr : '0.00',
                yearBeginAmountStr:response.totalYearBeginAmountStr ? response.totalYearBeginAmountStr : '0.00',
            })
            let glReportTemplateProjectItemList = this.getGlReportTemplateProjectItemList(response.glReportTemplateProjectItemList, params.reportId)
            this.metaAction.sf(`data.list`,fromJS(glReportTemplateProjectItemList))
        }
    }

    //利润表初始化接口调用
    loadProfitstatement = async (params, response) => {
        if(response) {
						if (this.metaAction.gf('data.accountingStandards') == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
								response.glReportTemplateProjectItemList.push({
										codeAndName:'合计',
										amountNoLimitStr:response.totalAmountNoLimitStr ? response.totalAmountNoLimitStr : '0.00',
										amountLimitStr:response.totalAmountLimitStr ? response.totalAmountLimitStr : '0.00',
										amountSumStr:response.totalAmountSumStr ? response.totalAmountSumStr : '0.00',
										yearAmountNoLimitStr:response.totalYearAmountNoLimitStr ? response.totalYearAmountNoLimitStr : '0.00',
										yearAmountLimitStr:response.totalYearAmountLimitStr ? response.totalYearAmountLimitStr : '0.00',
										yearAmountSumStr:response.totalYearAmountSumStr ? response.totalYearAmountSumStr : '0.00'
								})

		            let glReportTemplateProjectItemList = this.getGlReportTemplateProjectItemList(response.glReportTemplateProjectItemList, params.reportId), fieldValue

								if (glReportTemplateProjectItemList.length > 4) {
										fieldValue = {
												'data.other.scrollY': 175,
												'data.list': fromJS(glReportTemplateProjectItemList)
										}
								} else {
										fieldValue = {
												'data.other.scrollY': 0,
												'data.list': fromJS(glReportTemplateProjectItemList)
										}
								}

								this.injections.reduce('load', fieldValue)
						} else {
		            response.glReportTemplateProjectItemList.push({
		                codeAndName:'合计',
		                amountStr:response.totalAmountStr ? response.totalAmountStr : '0.00',
		                amountSumStr:response.totalAmountSumStr ? response.totalAmountSumStr : '0.00',
		            })

		            let glReportTemplateProjectItemList = this.getGlReportTemplateProjectItemList(response.glReportTemplateProjectItemList, params.reportId), fieldValue

								fieldValue = {
										'data.list': fromJS(glReportTemplateProjectItemList)
								}

								this.injections.reduce('load', fieldValue)
						}

        }
    }

    //遍历列表 将取数规则由数字变字符串
    getGlReportTemplateProjectItemList = (glReportTemplateProjectItemList, type) => {
        glReportTemplateProjectItemList = glReportTemplateProjectItemList.map(item => {
            switch(item.formulaIdForPage) {
                case 1:
                    item.formulaIdForPageStr = type==1 ? '余额' : '借方发生额-贷方发生额';
                    break;
                case 2:
                    item.formulaIdForPageStr = type==1 ? '本级科目借方余额' : '贷方发生额-借方发生额';
                    break;
                case 3:
                    item.formulaIdForPageStr = type==1 ? '本级科目贷方余额' : '借方发生额';
                    break;
                case 4:
                    item.formulaIdForPageStr = type==1 ? '末级科目借方余额' : '贷方发生额';
                    break;
                case 5:
                    item.formulaIdForPageStr = '末级科目贷方余额';
                    break;
                default:
                    break;
            }
            return item
        })
        return glReportTemplateProjectItemList
    }

    //获取datagrid列值
    getColumns = () => {
				if (!this.metaAction.gf('data.columns')) return []

        let columns = this.metaAction.gf('data.columns').toJS(),
            list = this.metaAction.gf('data.list').toJS()
        return renderColumns(columns, list, this)
    }

		getActiveTBColumns = () => {
				return [
						{
								title: '科目',
								dataIndex: 'codeAndName',
								width: '22%',
								key: 'codeAndName'
						}, {
								title: '运算符号',
								dataIndex: 'flag',
								align: 'center',
								width: '6%',
								key: 'flag',
                        }, {
                            title: '取数规则',
                            dataIndex: 'formulaIdForPageStr',
                            align: 'center',
                            width: '15%',
                            key: 'formulaIdForPageStr',
                    },
                        {
								title: '本月数',
								children: [{
										title: '非限定性',
										dataIndex: 'amountNoLimitStr',
										width: '11%',
										className:'amountColumnStyle',
										key: 'amountNoLimitStr'
								}, {
										title: '限定性',
										dataIndex: 'amountLimitStr',
										width: '11%',
										className:'amountColumnStyle',
										key: 'amountLimitStr'
								}, {
										title: '合计',
										dataIndex: 'amountSumStr',
										width: '11%',
										className:'amountColumnStyle',
										key: 'amountSumStr'
								}]
						}, {
								title: '本年累计数',
								children: [{
										title: '非限定性',
										dataIndex: 'yearAmountNoLimitStr',
										width: '11%',
										className:'amountColumnStyle',
										key: 'yearAmountNoLimitStr'
								}, {
										title: '限定性',
										dataIndex: 'yearAmountLimitStr',
										width: '11%',
										className:'amountColumnStyle',
										key: 'yearAmountLimitStr'
								}, {
										title: '合计',
										dataIndex: 'yearAmountSumStr',
										width: '11%',
										className:'amountColumnStyle',
										key: 'yearAmountSumStr'
								}]
						}, {
								title: '操作',
                                dataIndex: 'operation',
                                width: '5%',
								align: 'center',
								key: 'operation',
								render: (text, record, index) => this.operate(text, record, index, this)
						}
				]
		}

    operate = (text, record, index, _this) => {
        console.log(text, record, index)
				let listSize = this.metaAction.gf('data.list').size

				if (index < listSize - 1) {
						return {
								children: (
										<div style={{ width: '100%', display: 'block' }}>
												<Icon type="shanchu" fontFamily='edficon' style={{'fontSize':'22px','marginTop':'6px'}}  onClick = { () => this.delRowClick(index, record)} />
										</div>
								)
						}
				} else {
						return ''
				}
    }

    //选择符号
    selectFlagData = (value, option) => {
        this.voucherAction.fieldChange(`data.flag`, JSON.parse(value), this.check)
        this.metaAction.sf(`data.flag`, JSON.parse(value))

    }

    //选择取数规则
    selectFormulaIdForPageData = (value, option) => {
        this.voucherAction.fieldChange(`data.formulaIdForPage`, JSON.parse(value), this.check)
        this.metaAction.sf(`data.formulaIdForPage`, JSON.parse(value))
    }

    //过滤科目下拉列表数据
    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }

    //选择科目
    accountlistChange = (value, noSend, showOption) => {
        const accountList = this.metaAction.gf('data.accountList').toJS()
        const item = accountList.find(index => {
            return index.value == value
        })
        this.voucherAction.fieldChange(`data.codeAndName`, value, this.check)
        this.metaAction.sf('data.codeAndName',value)

    }

    //获取表格行数
    getListRowsCount = () => {
        return this.metaAction.gf('data.list').size
    }

		isDisplay = () => {
				let accountingStandards = this.metaAction.gf('data.accountingStandards'),
						type = this.metaAction.gf('data.type'), _display = false

				if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization &&
						type == 2) {
						_display = true
				}

				return _display
		}

    //加行
    addRowClick = async () => {//添加公式
        let row = {},
            type = this.metaAction.gf(`data.type`),
            params = await this.getParams('add'),//获取参数
            list = this.metaAction.gf(`data.list`)?this.metaAction.gf(`data.list`).toJS():[]

        if(!params) return

        this.metaAction.sf(`data.other.loading`,true)
        let response = await this.webapi.balancesheet.getCalMoneyForAddFormula(params)
        this.metaAction.sf(`data.other.loading`,false)

        if(response) {
            let codeAndName = this.metaAction.gf(`data.codeAndName`),
                flag = this.metaAction.gf(`data.flag`),
                formulaIdForPage = this.metaAction.gf(`data.formulaIdForPage`),
								accountingStandards = this.metaAction.gf('data.accountingStandards')

            if(type==1) {
                list.splice(list.length-1, 0,{
                    codeAndName:JSON.parse(codeAndName).label,
                    accountId:JSON.parse(codeAndName).value,
                    formulaIdForPage:formulaIdForPage.id,
                    flag:flag.name,
                    periodEndAmountStr:response.periodEndAmountStr,
                    yearBeginAmountStr:response.yearBeginAmountStr,
                })
                let totalPeriodEndAmountStr = list[list.length-1].periodEndAmountStr ? this.clearThousandsPosition(list[list.length-1].periodEndAmountStr) : '0.00',
                    totalYearBeginAmountStr = list[list.length-1].yearBeginAmountStr ? this.clearThousandsPosition(list[list.length-1].yearBeginAmountStr) : '0.00',
                    currentPeriodEndAmountStr = response.periodEndAmountStr ? this.clearThousandsPosition(response.periodEndAmountStr) : '0.00',
                    currentYearBeginAmountStr = response.yearBeginAmountStr ? this.clearThousandsPosition(response.yearBeginAmountStr) : '0.00'
                if(flag.name==='+') {
                    list[list.length-1].periodEndAmountStr = this.addThousandsPosition( parseFloat(totalPeriodEndAmountStr) + parseFloat(currentPeriodEndAmountStr) , true )
                    list[list.length-1].yearBeginAmountStr = this.addThousandsPosition( parseFloat(totalYearBeginAmountStr) + parseFloat(currentYearBeginAmountStr) , true )
                } else if(flag.name==='-') {
                    list[list.length-1].periodEndAmountStr = this.addThousandsPosition( parseFloat(totalPeriodEndAmountStr) - parseFloat(currentPeriodEndAmountStr) , true )
                    list[list.length-1].yearBeginAmountStr = this.addThousandsPosition( parseFloat(totalYearBeginAmountStr) - parseFloat(currentYearBeginAmountStr) , true )
                }
            } else if(type==2) {
								if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
										
		                list.splice(list.length-1, 0,{
		                    codeAndName:JSON.parse(codeAndName).label,
		                    accountId:JSON.parse(codeAndName).value,
		                    formulaIdForPage:formulaIdForPage.id,
		                    flag:'+',
		                    amountNoLimitStr:response.amountNoLimitStr,
		                    amountLimitStr:response.amountLimitStr,
		                    amountSumStr:response.amountSumStr,
		                    yearAmountNoLimitStr:response.yearAmountNoLimitStr,
		                    yearAmountLimitStr:response.yearAmountLimitStr,
		                    yearAmountSumStr:response.yearAmountSumStr
		                })
										let totalAmountNoLimitStr = parseFloat(number.clearThousPos(list[list.length-1].amountNoLimitStr)),
												totalAmountLimitStr = parseFloat(number.clearThousPos(list[list.length-1].amountLimitStr)),
												totalAmountSumStr = parseFloat(number.clearThousPos(list[list.length-1].amountSumStr)),
												totalYearAmountNoLimitStr = parseFloat(number.clearThousPos(list[list.length-1].yearAmountNoLimitStr)),
												totalYearAmountLimitStr = parseFloat(number.clearThousPos(list[list.length-1].yearAmountLimitStr)),
												totalYearAmountSumStr = parseFloat(number.clearThousPos(list[list.length-1].yearAmountSumStr)),
												curAmountNoLimitStr = parseFloat(number.clearThousPos(response.amountNoLimitStr)),
												curAmountLimitStr = parseFloat(number.clearThousPos(response.amountLimitStr)),
												curAmountSumStr = parseFloat(number.clearThousPos(response.amountSumStr)),
												curYearAmountNoLimitStr = parseFloat(number.clearThousPos(response.yearAmountNoLimitStr)),
												curYearAmountLimitStr = parseFloat(number.clearThousPos(response.yearAmountLimitStr)),
												curYearAmountSumStr = parseFloat(number.clearThousPos(response.yearAmountSumStr))

										list[list.length-1].amountNoLimitStr = (totalAmountNoLimitStr + curAmountNoLimitStr) != 0 ? number.addThousPos( totalAmountNoLimitStr + curAmountNoLimitStr) : '0.00'
										list[list.length-1].amountLimitStr = (totalAmountLimitStr + curAmountLimitStr) != 0 ? number.addThousPos( totalAmountLimitStr + curAmountLimitStr) : '0.00'
										list[list.length-1].amountSumStr = (totalAmountSumStr + curAmountSumStr) != 0 ? number.addThousPos( totalAmountSumStr + curAmountSumStr) : '0.00'
										list[list.length-1].yearAmountNoLimitStr = (totalYearAmountNoLimitStr + curYearAmountNoLimitStr) != 0 ? number.addThousPos( totalYearAmountNoLimitStr + curYearAmountNoLimitStr) : '0.00'
										list[list.length-1].yearAmountLimitStr = (totalYearAmountLimitStr + curYearAmountLimitStr) != 0 ? number.addThousPos( totalYearAmountLimitStr + curYearAmountLimitStr) : '0.00'
										list[list.length-1].yearAmountSumStr = (totalYearAmountSumStr + curYearAmountSumStr) != 0 ? number.addThousPos( totalYearAmountSumStr + curYearAmountSumStr) : '0.00'
								} else {
		                list.splice(list.length-1, 0,{
		                    codeAndName:JSON.parse(codeAndName).label,
		                    accountId:JSON.parse(codeAndName).value,
		                    formulaIdForPage:formulaIdForPage.id,
		                    flag:'+',
		                    amountStr:response.amountStr,
		                    amountSumStr:response.amountSumStr,
		                })
		                let totalAmountStr = list[list.length-1].amountStr ? this.clearThousandsPosition(list[list.length-1].amountStr) : '0.00',
		                    totalAmountSumStr = list[list.length-1].amountSumStr ? this.clearThousandsPosition(list[list.length-1].amountSumStr) : '0.00',
		                    currentAmountStr = response.amountStr ? this.clearThousandsPosition(response.amountStr) : '0.00',
		                    currentAmountSumStr = response.amountSumStr ? this.clearThousandsPosition(response.amountSumStr) : '0.00'

		                list[list.length-1].amountStr = this.addThousandsPosition( parseFloat(totalAmountStr) + parseFloat(currentAmountStr) , true )
		                list[list.length-1].amountSumStr = this.addThousandsPosition( parseFloat(totalAmountSumStr) + parseFloat(currentAmountSumStr) , true )
								}
            }
            let glReportTemplateProjectItemList = this.getGlReportTemplateProjectItemList(list, type)

						let fieldValue, scrollY = 0

						if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization &&
							  type == 2 && glReportTemplateProjectItemList.length > 4) {
								scrollY = 175
						}

						fieldValue = {
								'data.list': fromJS(glReportTemplateProjectItemList),
								'data.editState': true,
								'data.codeAndName': undefined,
								'data.flag': undefined,
								'data.formulaIdForPage': undefined,
								'data.other.error': fromJS({}),
								'data.isReset': true,
								'data.other.scrollY': scrollY
						}

						this.injections.reduce('load', fieldValue)
        }
    }

    //删除行
    delRowClick = (rowIndex,obj) => {//删除不调接口
        console.log(rowIndex)
        // debugger
        let list = this.metaAction.gf(`data.list`)?this.metaAction.gf(`data.list`).toJS():[],
            type = this.metaAction.gf(`data.type`),
						accountingStandards = this.metaAction.gf('data.accountingStandards')

        let delItem = list.splice(rowIndex.rowIndex?rowIndex.rowIndex:rowIndex, 1)

        if(type==1) {
            let totalPeriodEndAmountStr = list[list.length-1].periodEndAmountStr ? this.clearThousandsPosition(list[list.length-1].periodEndAmountStr) : '0.00',
                totalYearBeginAmountStr = list[list.length-1].yearBeginAmountStr ? this.clearThousandsPosition(list[list.length-1].yearBeginAmountStr) : '0.00',
                currentPeriodEndAmountStr = delItem[0].periodEndAmountStr ? this.clearThousandsPosition(delItem[0].periodEndAmountStr) : '0.00',
                currentYearBeginAmountStr = delItem[0].yearBeginAmountStr ? this.clearThousandsPosition(delItem[0].yearBeginAmountStr) : '0.00'
            if(delItem[0].flag==='+') {//计算合计值
                list[list.length-1].periodEndAmountStr = this.addThousandsPosition( parseFloat(totalPeriodEndAmountStr) - parseFloat(currentPeriodEndAmountStr) , true )
                list[list.length-1].yearBeginAmountStr = this.addThousandsPosition( parseFloat(totalYearBeginAmountStr) - parseFloat(currentYearBeginAmountStr) , true )
            } else if(delItem[0].flag==='-') {
                list[list.length-1].periodEndAmountStr = this.addThousandsPosition( parseFloat(totalPeriodEndAmountStr) + parseFloat(currentPeriodEndAmountStr) , true )
                list[list.length-1].yearBeginAmountStr = this.addThousandsPosition( parseFloat(totalYearBeginAmountStr) + parseFloat(currentYearBeginAmountStr) , true )
            }
        } else if(type==2) {
						// 民间非营利组织会计准则
						if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
								let totalAmountNoLimitStr = parseFloat(number.clearThousPos(list[list.length-1].amountNoLimitStr)),
										totalAmountLimitStr = parseFloat(number.clearThousPos(list[list.length-1].amountLimitStr)),
										totalAmountSumStr = parseFloat(number.clearThousPos(list[list.length-1].amountSumStr)),
										totalYearAmountNoLimitStr = parseFloat(number.clearThousPos(list[list.length-1].yearAmountNoLimitStr)),
										totalYearAmountLimitStr = parseFloat(number.clearThousPos(list[list.length-1].yearAmountLimitStr)),
										totalYearAmountSumStr = parseFloat(number.clearThousPos(list[list.length-1].yearAmountSumStr)),
										curAmountNoLimitStr = parseFloat(number.clearThousPos(delItem[0].amountNoLimitStr)),
										curAmountLimitStr = parseFloat(number.clearThousPos(delItem[0].amountLimitStr)),
										curAmountSumStr = parseFloat(number.clearThousPos(delItem[0].amountSumStr)),
										curYearAmountNoLimitStr = parseFloat(number.clearThousPos(delItem[0].yearAmountNoLimitStr)),
										curYearAmountLimitStr = parseFloat(number.clearThousPos(delItem[0].yearAmountLimitStr)),
										curYearAmountSumStr = parseFloat(number.clearThousPos(delItem[0].yearAmountSumStr))

								list[list.length-1].amountNoLimitStr = (totalAmountNoLimitStr - curAmountNoLimitStr) != 0 ? number.addThousPos( totalAmountNoLimitStr - curAmountNoLimitStr) : '0.00'
								list[list.length-1].amountLimitStr = (totalAmountLimitStr - curAmountLimitStr) != 0 ? number.addThousPos( totalAmountLimitStr - curAmountLimitStr) : '0.00'
								list[list.length-1].amountSumStr = (totalAmountSumStr - curAmountSumStr) != 0 ? number.addThousPos( totalAmountSumStr - curAmountSumStr) : '0.00'
								list[list.length-1].yearAmountNoLimitStr = (totalYearAmountNoLimitStr - curYearAmountNoLimitStr) != 0 ? number.addThousPos( totalYearAmountNoLimitStr - curYearAmountNoLimitStr) : '0.00'
								list[list.length-1].yearAmountLimitStr = (totalYearAmountLimitStr - curYearAmountLimitStr) != 0 ? number.addThousPos( totalYearAmountLimitStr - curYearAmountLimitStr) : '0.00'
								list[list.length-1].yearAmountSumStr = (totalYearAmountSumStr - curYearAmountSumStr) != 0 ? number.addThousPos( totalYearAmountSumStr - curYearAmountSumStr) : '0.00'
						} else {
		            let totalAmountStr = list[list.length-1].amountStr ? this.clearThousandsPosition(list[list.length-1].amountStr) : '0.00',
		                totalAmountSumStr = list[list.length-1].amountSumStr ? this.clearThousandsPosition(list[list.length-1].amountSumStr) : '0.00',
		                currentAmountStr = delItem[0].amountStr ? this.clearThousandsPosition(delItem[0].amountStr) : '0.00',
		                currentAmountSumStr = delItem[0].amountSumStr ? this.clearThousandsPosition(delItem[0].amountSumStr) : '0.00'
		            //计算合计值
		            list[list.length-1].amountStr = this.addThousandsPosition( parseFloat(totalAmountStr) - parseFloat(currentAmountStr) , true )
		            list[list.length-1].amountSumStr = this.addThousandsPosition( parseFloat(totalAmountSumStr) - parseFloat(currentAmountSumStr) , true )
						}
        }
        this.metaAction.sf(`data.list`,fromJS(list))
        this.metaAction.sf(`data.editState`,true)
        this.metaAction.sf(`data.isReset`, true )

				let fieldValue, scrollY = 0

				if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization &&
					  type == 2 && list.length > 4) {
						scrollY = 175
				}

				fieldValue = {
						'data.list': fromJS(list),
						'data.editState': true,
						'data.isReset': true,
						'data.other.scrollY': scrollY
				}

				this.injections.reduce('load', fieldValue)
    }

    //去除千分位
    clearThousandsPosition = (num) => {
        if (num && num.toString().indexOf(',') > -1) {
            let x = num.toString().split(',')
            return parseFloat(x.join(""))
        } else {
            return num
        }
    }

    //添加千分位
    addThousandsPosition = (input, isFixed) => {
        if (isNaN(input)) return ''
        let num

        if (isFixed) {
            num = parseFloat(input).toFixed(2)
        } else {
            num = input.toString()
        }
        let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g

        return num.replace(regex, "$1,")
    }

    //点击确定按钮
    onOk = async () => {
        let editState = this.metaAction.gf(`data.editState`)
        if(editState) {
            return await this.save()
        } else {
            return true
        }
    }

    //保存报表公式
    save = async () => {
        let type = this.metaAction.gf(`data.type`),
            params = await this.getParams('save'),//获取参数
            response

        this.metaAction.sf(`data.other.loading`,true)
        response = await this.webapi.balancesheet.getReportEditFormulaPageInfoForAdd(params)
        this.metaAction.sf(`data.other.loading`,false)

        if (response) {
            return true
        } else {
            return false
        }
	}

    onTabFocus = (data) => {
        let periodData = this.metaAction.gf('data.selectData').toJS()
        this.load(data.initSearchValue)
    }

    //重置
    resetClick = async () => {
        let ret = await this.metaAction.modal('confirm', {
            title: '重置提示',
            content: '是否重置公式？',
            okText: '是',
            cancelText: '否'
        })

        if(ret) {//点击重置
            let params = await this.getParams()//获取参数
            let response = await this.webapi.balancesheet.resetReportTemplateFormula(params)
            if(!response) return
            this.metaAction.toast('success', '重置成功')
            this.metaAction.sf(`data.codeAndName`,undefined)//清空下拉框数据
            this.metaAction.sf(`data.flag`,undefined)
            this.metaAction.sf(`data.formulaIdForPage`,undefined)
            this.metaAction.sf(`data.other.error`,fromJS({}))
            this.metaAction.sf(`data.editState`,true)
            this.metaAction.sf(`data.isReset`, false )
            if(params.reportId==1) {
                this.loadBalancesheet(params, response)
            } else {
                this.loadProfitstatement(params, response)
            }
        }

    }

    //必填项校验
	check = async (fieldPathAndValues) => {
		if (!fieldPathAndValues)
			return
        let r = { ...fieldPathAndValues },
            path = r.path,
            other = this.metaAction.gf('data.other').toJS(),
            message = `${other[path.slice(11)]}不能为空`
        if( fieldPathAndValues.path == 'data.codeAndName' ) {
	        return { errorPath: 'data.other.error.subject', message: fieldPathAndValues.value?'':'科目不能为空' }
        } else if( fieldPathAndValues.path == 'data.flag' ) {
	        return { errorPath: 'data.other.error.symbol', message: fieldPathAndValues.value?'':'运算符号不能为空' }
        } else if( fieldPathAndValues.path == 'data.formulaIdForPage' ) {
	        return { errorPath: 'data.other.error.rule', message: fieldPathAndValues.value?'':'取数规则不能为空' }
        }
	}

    fieldChange = (path, value) => {
        this.voucherAction.fieldChange(path, value, this.check)
    }

    getPayInColumns = () => {
        return [
            {
                title: '序号',
                dataIndex: 'yzpzmxxh',
                width: 45,
                align: 'center',
                key: 'yzpzmxxh'
            }, {
                title: '电子税票号码',
                dataIndex: 'dzsphm',
                key: 'dzsphm'
            }, {
                title: '缴款返回信息',
                dataIndex: 'kkfhxx',
                key: 'kkfhxx'
            }, {
                title: '缴款金额',
                dataIndex: 'se',
                key: 'se'
            }
        ]
    }

    //获取参数
    getParams = async (funType) => {//获取参数，funtype是哪个方法的参数
        let type = this.metaAction.gf(`data.type`),//利润表还是资产负债表
            period = this.metaAction.gf(`data.period`).toJS(),
            index = this.metaAction.gf(`data.index`),
            params = {
                period:period,
                reportId:type,
                rowNo:(index-0)
            }

        if(!funType) {
            return params
        } else if(funType=='add') {
            let codeAndName = this.metaAction.gf(`data.codeAndName`),
                flag = this.metaAction.gf(`data.flag`),
                formulaIdForPage = this.metaAction.gf(`data.formulaIdForPage`)
            params.glReportTemplateProjectItemList = []
            if(type==1) {
                if(codeAndName===undefined||flag===undefined||formulaIdForPage===undefined) {
                    let checkArr = []
                    checkArr.push({
                        path:'data.codeAndName',
                        value:codeAndName
                    })
                    checkArr.push({
                        path:'data.flag',
                        value:flag
                    })
                    checkArr.push({
                        path:'data.formulaIdForPage',
                        value:formulaIdForPage
                    })
                    const ok = await this.voucherAction.check(checkArr, this.check)
                    if (!ok) {
                        this.metaAction.toast('warning', '请补充数据')
                        return false
                    }
                } else {
                    let list = this.metaAction.gf(`data.list`)?this.metaAction.gf(`data.list`).toJS():[],
                        checkResult = false//通过
                    list.map(item => {//校验是否已经存在相同科目的公式
                        if(item.accountId == JSON.parse(codeAndName).value && item.formulaIdForPage == formulaIdForPage.id ) {
                            checkResult = true//未通过
                        }
                    })
                    if(checkResult) {
                        this.metaAction.toast('warning', '已经存在相同科目和取数规则的公式')
                        return false
                    }
                    params.glReportTemplateProjectItemList.push({
                        accountId:JSON.parse(codeAndName).value,
                        formulaIdForPage:formulaIdForPage.id,
                        flag:flag.name
                    })
                    return params
                }
            } else {
                if(codeAndName===undefined||formulaIdForPage===undefined) {
                    let checkArr = []
                    checkArr.push({
                        path:'data.codeAndName',
                        value:codeAndName
                    })
                    checkArr.push({
                        path:'data.formulaIdForPage',
                        value:formulaIdForPage
                    })
                    const ok = await this.voucherAction.check(checkArr, this.check)
                    if (!ok) {
                        this.metaAction.toast('warning', '请补充数据')
                        return false
                    }
                } else {
                    let list = this.metaAction.gf(`data.list`)?this.metaAction.gf(`data.list`).toJS():[],
                        checkResult = false//通过
                    list.map(item => {//校验是否已经存在相同科目的公式
                        if(item.accountId == JSON.parse(codeAndName).value && item.formulaIdForPage == formulaIdForPage.id ) {
                            checkResult = true//未通过
                        }
                    })
                    if(checkResult) {
                        this.metaAction.toast('warning', '已经存在相同科目和取数规则的公式')
                        return false
                    }
                    params.glReportTemplateProjectItemList.push({
                        accountId:JSON.parse(codeAndName).value,
                        formulaIdForPage:formulaIdForPage.id,
                        flag:'+'
                    })
                    return params
                }
            }
        } else if(funType=='save') {
            let list = this.metaAction.gf(`data.list`)?this.metaAction.gf(`data.list`).toJS():[]
            params.glReportTemplateProjectItemList = []
            if(type==1) {
                if(list.length<1) {
                    return false
                } else {
                    list.map(( item, index )=> {
                        if( index < list.length-1 ) {

                            params.glReportTemplateProjectItemList.push({
                                accountId: item.accountId,
                                formulaIdForPage: item.formulaIdForPage,
                                flag: item.flag
                            })
                        }
                    })
                    return params
                }
            } else {
                if(list.length<1) {
                    return false
                } else {
                    list.map(( item, index )=> {
                        if( index < list.length-1 ) {

                            params.glReportTemplateProjectItemList.push({
                                accountId: item.accountId,
                                formulaIdForPage: item.formulaIdForPage,
                                flag: '+'
                            })
                        }
                    })
                    return params
                }
            }
        }
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })
    return ret
}
