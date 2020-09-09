import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { TableOperate, Select, LoadingMask, Button, Tabs, Input, Checkbox, Icon, Table, Popover } from 'edf-component'
import { accountTypeEnum, clearThousandsPosition, combineAuxItemContent, ACCOUNTTYPE_PROFITANDLOSS, ACCOUNTTYPE_ASSETS, ACCOUNTTYPE_INCOME, ACCOUNTTYPE_EXPENSES } from './data'
import { fromJS, set, List, is } from 'immutable'
import config from './config'
import utils from 'edf-utils'
import * as data from './data'
import { consts } from 'edf-consts'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
		this.menuList = {}
		this.clickWraper = {}
		this.isHaveResult = false
	}

	onInit = ({ component, injections }) => {
		this.component = component
		this.injections = injections
		let option = {
			isGuide: this.component.props.isGuide,
			menuKey: this.component.props.isMenuCode
		}

		this.menuList = option
		injections.reduce('init', option)

		let addEventListener = this.component.props.addEventListener

		if (addEventListener) {
			addEventListener('onTabFocus', :: this.onTabFocus)
			// addEventListener('enlargeClick', () => this.onResize({}))
		}

		this.initBalanceView()
		//处理财务期初初始化按钮显示
		this.injections.reduce('isShowBtn', this.component.props && this.component.props.appExtendParams)
	}

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('onTabFocus', this.onTabFocus, false)
        } else if (window.detachEvent) {
            window.detachEvent('onTabFocus', this.onTabFocus)
        }
    }

	initBalanceView = async () => {

		this.injections.reduce('update', { path: 'data.other.isLoading', value: true })
		let isPromptStorage = localStorage.getItem('isPrompt')
		let accountTypeId = ACCOUNTTYPE_ASSETS
		let year = this.metaAction.context.get("currentOrg").enabledYear
		year = Number(year)
		let pageParam = {
			moduleKey: 'ttk-gl-app-finance-periodbegin',
			resourceKey: 'ttk-gl-app-finance-periodbegin-table',
		}
		let pageResponse = await this.webapi.getPageSetting(pageParam)
		let page = this.metaAction.gf('data.pagination').toJS()
		if(pageResponse.pageSize){
				page.pageSize = pageResponse.pageSize
		}
		let other = [
			{ path: 'data.pagination', value: fromJS(page) }
		]

		let option = {
			accountTypeId: accountTypeId,
			year: year,
			isCalcQuantity: false,
			isCalcMulti: false,
			noDataNoDisplay: false
		}
		let newPage = utils.sortSearchOption(page, null, ['total', 'totalCount', 'totalPage'])
		let currentOrg = this.metaAction.context.get("currentOrg"),
			accountingStandards = currentOrg.accountingStandards
		option.page = newPage
		const response = await this.webapi.init(option)
		if (isPromptStorage) {
			// this.metaAction.sf('data.other.isBalancePopShow', false)
			other.push({ path: 'data.other.isBalancePopShow', value: false })
		} else {
			if (response.PeriodBeginDto.beginAmountDifference == 0.00 && response.PeriodBeginDto.yearBeginAmountDifference == 0.00 && response.PeriodBeginDto.amountDifference == 0.00) {
				// this.metaAction.sf('data.other.isBalancePopShow', false)
				other.push({ path: 'data.other.isBalancePopShow', value: false })
			} else {
				// this.metaAction.sf('data.other.isBalancePopShow', true)
				other.push({ path: 'data.other.isBalancePopShow', value: true })
			}
		}
		let enabledPeriod = { enabledYear: response.enabledYear ? response.enabledYear : '', enabledMonth: response.enabledMonth ? response.enabledMonth : '', ts: response.ts ? response.ts : '' },
			selectedYear,
			calcDict = response.calcDict, haveMonthlyClosing = response.haveMonthlyClosing,
			settedPeriod = `${response.enabledYear}-${response.enabledMonth}`

		// this.injections.reduce('setCashflowDisabled', Number(response.enabledMonth))
		other.push({ path: 'data.other.cashflowDisabled', value: Number(response.enabledMonth) == 1 })

		let tableOption = this.metaAction.gf('data.tableOption'),
				rightTable = document.getElementsByClassName('ttk-gl-app-finance-periodbegin-body') && document.getElementsByClassName('ttk-gl-app-finance-periodbegin-body')[0],
				rightTableWidth = rightTable && rightTable.scrollWidth

		if(rightTable) {
				tableOption = tableOption.set('x', rightTableWidth - 5)
		}

		this.injections.reduce('initBalanceView', response, year, settedPeriod, enabledPeriod, accountingStandards, accountTypeId, calcDict, haveMonthlyClosing, other, tableOption)
		// this.metaAction.sf('data.other.isLoading', false)
		this.injections.reduce('update', { path: 'data.other.isLoading', value: false })
		// setTimeout(() => {
		// 	this.computeFun()
		// }, 20)
		// //启用期间为空时，系统弹出启用期间选择对话框，供操作员选择启用的期间；COMMENT START 0102 TODO
		if (!response.enabledYear) {
			this.changeEnabledPeriod()
		}
	}

	pageChanged = async (current, pageSize) => {
		// this.metaAction.sf('data.other.isLoading', true)
		let other = [ { path: 'data.other.isLoading', value: true } ]
		let page = this.metaAction.gf('data.pagination').toJS()
			page = {
					...page,
					'currentPage': current,
					'pageSize': pageSize ? pageSize : page.pageSize
			}
			// this.metaAction.sf('data.pagination', fromJS(page))
			other.push({ path: 'data.pagination', value: page })
			this.injections.reduce('updateArr', other)
			let accountType = this.metaAction.gf('data.filter.targetKey'),
			selectedYear = this.metaAction.gf('data.other.year').get('id')
			await this.loadBalanceData(accountType, selectedYear)
			// this.metaAction.sf('data.other.isLoading', false)
			this.injections.reduce('update', { path: 'data.other.isLoading', value: false })
		}
		//分页发生变化
		sizePageChanged = async (current, pageSize) => {

			// this.metaAction.sf('data.other.isLoading', true)
			let other = [ { path: 'data.other.isLoading', value: true } ]
			let page = this.metaAction.gf('data.pagination').toJS()
			page = {
					...page,
					'currentPage': current,
					'pageSize': pageSize ? pageSize : page.pageSize
			}
			// this.metaAction.sf('data.pagination', fromJS(page))
			other.push({ path: 'data.pagination', value: page })
			this.injections.reduce('updateArr', other)
			let request = {
				moduleKey: 'ttk-gl-app-finance-periodbegin',
				resourceKey: 'ttk-gl-app-finance-periodbegin-table',
				settingKey:"pageSize",
				settingValue: page.pageSize
		}
		await this.webapi.setPageSetting([request])
		let accountType = this.metaAction.gf('data.filter.targetKey'),
		selectedYear = this.metaAction.gf('data.other.year').get('id')
		await this.loadBalanceData(accountType, selectedYear)
		this.injections.reduce('update', { path: 'data.other.isLoading', value: false })

	}
	renderTabs = () => {
		const tabs = [{
			name: 'assets',
			key: '5000010001',
			tab: '资产'
		}, {
			name: 'liabilities',
			key: '5000010002',
			tab: '负债'
		}, {
			name: 'common',
			key: '5000010003',
			tab: '共同'
		}, {
			name: 'rightsInterests',
			key: '5000010004',
			tab: '权益'
		}, {
			name: 'cost',
			key: '5000010005',
			tab: '成本'
		}, {
			name: 'profitLoss',
			key: '5000010006',
			tab: '损益'
		}, {
			name: 'netAssets',
			key: '5000010007',
			tab: '净资产'
		}, {
			name: 'income',
			key: '5000010008',
			tab: '收入'
		}, {
			name: 'expenses',
			key: '5000010009',
			tab: '费用'
		}]
		const accountingStandards = this.metaAction.gf('data.other.accountingStandards')
		if (accountingStandards == true) return ''
		const tmpMaps = tabs.filter((item) => { return this.isTabDisplay(item.name) })
		return tmpMaps.map((item) => {
			return <Tabs.TabPane key={item.key} tab={item.tab} >
			</Tabs.TabPane>
		})
	}
	getAmountTip = () => {
		let period = this.metaAction.gf('data.other.settedPeriod') && this.metaAction.gf('data.other.settedPeriod').split('-'),
			year = period && period[0], month = period && period[1]
		let beforeMonth = Number(month) - 1 <= 0 ? 12 : Number(month) - 1,
			beforeYear = Number(month) - 1 <= 0 ? Number(year) - 1 : Number(year),
			amountTipShow = this.metaAction.gf('data.other.amountTipShow'),
			notShowNextTime = this.metaAction.gf('data.other.notShowNextTime')
		if (period) {
			if (amountTipShow) {

				return (
					<div >
						<div style={{ textAlign: "right" }}><Icon type="close" onClick={this.closeAmountTip} /></div>
						<div>{`${year}年${month}月期初余额 = ${beforeYear}年${beforeMonth}月期末余额`}</div>
					</div>
				)
			} else {
				return (
					<div>

					</div>
				)
			}

		} else {
			return (
				<div>

				</div>
			)
		}

	}

	// componentDidMount = () => {
	// 	const win = window
	// 	if (win.addEventListener) {
	// 		win.addEventListener('resize', this.onResize, false)
	// 	} else if (win.attachEvent) {
	// 		win.attachEvent('onresize', this.onResize)
	// 	} else {
	// 		win.onresize = this.onResize
	// 	}
	// }
	//
	// componetWillUnmount = () => {
	// 	const win = window
	// 	if (win.removeEventListener) {
	// 		win.removeEventListener('resize', this.onResize, false)
	// 	} else if (win.detachEvent) {
	// 		win.detachEvent('onresize', this.onResize)
	// 	} else {
	// 		win.onresize = undefined
	// 	}
	// }

	onResize = (e) => {
		let keyRandom = Math.floor(Math.random() * 10000)
		this.keyRandom = keyRandom
		// setTimeout(() => {
		// 	if (this.keyRandom == keyRandom) {
		// 		this.computeFun(e)
		// 	}
		// }, 100)
	}
	resizeEnd = async (params) => {
		const code = this.metaAction.gf('data.other.code')
		const customDecideDisVisibleList = this.metaAction.gf('data.other.customDecideDisVisibleList') && this.metaAction.gf('data.other.customDecideDisVisibleList').toJS()
		let columnDetails
		params.code = code
		columnDetails = params.columnDetails.concat(customDecideDisVisibleList)
		params.columnDetails = columnDetails
		let res = await this.webapi.batchUpdate(params)

		this.injections.reduce('update', { path: 'data.other.columnDto', value: fromJS(res[0].columnDetails) })
	}
	computeFun = (e) => {
		const wrapContent = document.getElementById('ttk-gl-app-finance-periodbegin-id')
		const bigPageContent = document.getElementById('ttk-gl-app-finance-periodbegin-glPeriodBeginBigPage-id')
		const headerContent = document.getElementById('ttk-gl-app-finance-periodbegin-header-id')
		const tabHeadContent = document.getElementById('ttk-gl-app-finance-periodbegin-tabHeaderDiv-id')
		const pageContent = document.getElementById('ttk-gl-app-finance-periodbegin-pagination')
		// const singleRowContent = document.getElementById("ttk-gl-app-finance-periodbegin-singleRowContent-id") ?
		// 	document.getElementById("ttk-gl-app-finance-periodbegin-singleRowContent-id").getElementsByClassName('ant-table-body')[0].getElementsByClassName('ant-table-fixed')[0] : ''
		const singleRowContent = document.getElementById("ttk-gl-app-finance-periodbegin-singleRowContent-id") && document.getElementById("ttk-gl-app-finance-periodbegin-singleRowContent-id")
		const doubleRowContent = document.getElementById("ttk-gl-app-finance-periodbegin-doubleRowContent-id")
			? document.getElementById("ttk-gl-app-finance-periodbegin-doubleRowContent-id").getElementsByTagName('tbody')[0] : ''

		const isCalcQuantity = this.metaAction.gf('data.filter.isCalcQuantity')
		const isCalcMulti = this.metaAction.gf('data.filter.isCalcMulti')
		const isNotJanuary = this.metaAction.gf('data.other.isNotJanuary')
		const tableCon=document.getElementsByClassName('ttk-gl-app-finance-periodbegin-body')[0]

		if (isCalcQuantity || isCalcMulti) {
			if (!doubleRowContent) {
				if (e) {
					return
				}
				// setTimeout(() => {
				// 	this.computeFun()
				// }, 500)
			} else {
				const wrapContentHeight = wrapContent.offsetHeight
				const headerContentHeight = headerContent.offsetHeight
				const bigPageContentHeight = bigPageContent.offsetHeight
				const tabHeadContentHeight = tabHeadContent.offsetHeight
				const doubleRowContentHeight = doubleRowContent.offsetHeight
				const tableDivWidth = singleRowContent.offsetWidth || doubleRowContent.offsetWidth
				const num = !isNotJanuary ? 85 : 83

				let tableDivHeight
				if (this.component.props.appExtendParams == undefined) {
					tableDivHeight = wrapContentHeight - headerContentHeight - bigPageContentHeight - tabHeadContentHeight - num
				} else {
					tableDivHeight = wrapContentHeight - headerContentHeight - bigPageContentHeight - tabHeadContentHeight - num - 52
				}

				const saveTabDivHeight = this.metaAction.gf('data.other.scrollY')
				const list = this.metaAction.gf('data.list').toJS()
				if (saveTabDivHeight != tableDivHeight) {
					if (!!window.ActiveXObject || "ActiveXObject" in window&&list.length>0){
						$(tableCon.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
						$(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
					}else{
						$(tableCon.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '' });
						$(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '' });
					}
					let tableDiv = { tableDivHeight: tableDivHeight -50, tableDivWidth: tableDivWidth }
					this.injections.reduce('setScroll', tableDiv)
				}
			}
		} else {
			if (!singleRowContent) {
				if (e) {
					return
				}
				// setTimeout(() => {
				// 	this.computeFun()
				// }, 500)
			} else {
				const wrapContentHeight = wrapContent.offsetHeight
				const headerContentHeight = headerContent.offsetHeight
				const bigPageContentHeight = bigPageContent.offsetHeight
				const tabHeadContentHeight = tabHeadContent.offsetHeight
				const singleRowContentHeight = singleRowContent.scrollHeight
				const pageHeight = pageContent.offsetHeight
				// const tableDivWidth = singleRowContent.offsetWidth || doubleRowContent.offsetWidth
				const tableDivWidth = singleRowContent.scrollWidth
				let tableDivHeight
				if (this.component.props.appExtendParams == undefined) {
					tableDivHeight = singleRowContentHeight < wrapContentHeight - headerContentHeight - bigPageContentHeight - tabHeadContentHeight - pageHeight- 44 ? 0 : wrapContentHeight - headerContentHeight - bigPageContentHeight - tabHeadContentHeight - pageHeight - 44
				} else {
					tableDivHeight = singleRowContentHeight < wrapContentHeight - headerContentHeight - bigPageContentHeight - tabHeadContentHeight - pageHeight- 44 ? 0 : wrapContentHeight - headerContentHeight - bigPageContentHeight - tabHeadContentHeight - pageHeight - 44 - 36
				}

				const saveTabDivHeight = this.metaAction.gf('data.other.scrollY')
				const list = this.metaAction.gf('data.list').toJS()
				if (saveTabDivHeight != tableDivHeight) {
					if (!!window.ActiveXObject || "ActiveXObject" in window&&list.length>0){
						$(tableCon.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
						$(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
					}else{
						$(tableCon.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '' });
						$(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '' });
					}
					let tableDiv = { tableDivHeight: tableDivHeight -12, tableDivWidth: tableDivWidth }
					this.injections.reduce('setScroll', tableDiv)
				}
			}
		}
	}

	getVirtualTbStyle = (scrollX) => {
			if (!scrollX) {
					scrollX = 1300
			}
			return { width: scrollX + 'px' }
	}

	closeAmountTip = async () => {
		let response = await this.webapi.setNotShowNextTime()
		// this.metaAction.sf('data.other.notShowNextTime', true)
		// this.metaAction.sf('data.other.amountTipShow', false)
		let other = [
			{ path: 'data.other.notShowNextTime', value: true },
			{ path: 'data.other.amountTipShow', value: false }
		]
		this.injections.reduce('updateArr', other)
	}
	fixPosition = (condition) => {
		this.injections.reduce('fixPosition', condition)
	}
	searchChange = (value) => {
		this.injections.reduce('searchChange', value)
	}

	getIsBalance = () => {
		const tryCacuBalance = this.metaAction.gf('data.other.tryCacuBalance').toJS()
		const notShowNextTime = this.metaAction.gf('data.other.notShowNextTime')
		const isPrompt = this.metaAction.gf('data.other.isPrompt')
		let beginAmountCr = tryCacuBalance.beginAmountCr ? tryCacuBalance.beginAmountCr : 0,
			beginAmountDr = tryCacuBalance.beginAmountDr ? tryCacuBalance.beginAmountDr : 0,
			yearBeginAmountCr = tryCacuBalance.yearBeginAmountCr ? tryCacuBalance.yearBeginAmountCr : 0,
			yearBeginAmountDr = tryCacuBalance.yearBeginAmountDr ? tryCacuBalance.yearBeginAmountDr : 0,
			amountDr = tryCacuBalance.amountDr ? tryCacuBalance.amountDr : 0,
			amountCr = tryCacuBalance.amountCr ? tryCacuBalance.amountCr : 0,
			balanceData,
			beginAmountdiff = Number(beginAmountDr - beginAmountCr).toFixed(2),
			yearBeginAmountdiff = Number(yearBeginAmountDr - yearBeginAmountCr).toFixed(2),
			amountdiff = Number(amountDr - amountCr).toFixed(2),
			period = this.metaAction.gf('data.other.settedPeriod') && this.metaAction.gf('data.other.settedPeriod').split('-')

		let other = [], balanceShow

		if (notShowNextTime) {
			balanceShow = false
		} else {
			if (beginAmountdiff == 0.00 && yearBeginAmountdiff == 0.00 && amountdiff == 0.00) {
				balanceShow = false
			} else if (this.metaAction.gf('data.other.closeFlag') == true) {
				balanceShow = false
			} else {
				balanceShow = true
			}
		}
		this.injections.reduce('update', { path: 'data.other.balanceShow', value: balanceShow })

		if (period) {
			if (Number(period[1]) == 1) {
				balanceData = [
					{
						name: '期初余额差额：', num: beginAmountdiff
					}
				]
			} else {
				balanceData = [
					{
						name: '期初余额差额：', num: beginAmountdiff
					},
					{
						name: '本年累计差额：', num: amountdiff
					},
					{
						name: '年初余额差额：', num: yearBeginAmountdiff
					}
				]
			}
		}

		return (
			<div className="isBalanceContent">
				{/* <div className="header">
                    <Icon type="close" onClick={this.closeIsBalanccePop} />
                </div> */}
				<div className="content">
					<div className="contentLeft">
						{balanceData && balanceData.map(item => {
							return (
								<div>{item.name + item.num}</div>
							)
						})}
					</div>
					<div className="contentRight">
						<Icon type="close" onClick={this.closeIsBalancePop} />
					</div>

				</div>
				<div className="footer">
					<Checkbox onChange={this.handlePrompt} checked={isPrompt}>下次不再提示</Checkbox>
					<Button onClick={this.balanceSetting} className="isbalanceBtn">确定</Button>
				</div>
			</div>
		)
	}
	isBalanceShow = (option) => {
		if (option == 'close') {
			return false
		}
		let isBalance = this.metaAction.gf('data.other.isBalance'),
			notShowNextTime = this.metaAction.gf('data.other.notShowNextTime')
		if (notShowNextTime) {//下次不再提示
			return false
		} else {
			if (isBalance) {
				return false
			} else {
				return true
			}
		}
	}
	handlePrompt = (e) => {//不再提示
		e.stopPropagation()
		let checked = e.target.checked
		this.injections.reduce('update', { path: 'data.other.isPrompt', value: checked })
	}
	balanceSetting = () => {
		let isPrompt = this.metaAction.gf('data.other.isPrompt'), other = []
		if (isPrompt) {
			let response = this.webapi.setNotShowNextTime()
			other.push({ path: 'data.other.notShowNextTime', value: true })
		}
		// this.metaAction.sf('data.other.balanceShow', false)
		// this.metaAction.sf('data.other.closeFlag', true)
		other.push({ path: 'data.other.balanceShow', value: false })
		other.push({ path: 'data.other.closeFlag', value: true })

		this.injections.reduce('updateArr', other)
	}
	closeIsBalancePop = () => {
		// this.metaAction.sf('data.other.closeFlag', true)
		this.injections.reduce('update', { path: 'data.other.closeFlag', value: true })
	}
	getRow = (record, index) => {
		let matchIndex = this.metaAction.gf('data.other.matchIndex')
		if(record.accountId){
			if(matchIndex == index){
				return { className: "currentScrollRow" }
		}else{
				return { className: '' }
		}
		}else{
			if(matchIndex == index){
				return { className: "currentScrollRow totalRow" }
			}else{
					return { className: 'totalRow' }
			}
		}

	}
	export = async () => {
		let accountType = this.metaAction.gf('data.filter.targetKey'),
		isCalcQuantity = this.metaAction.gf('data.filter.isCalcQuantity'),
		isCalcMulti = this.metaAction.gf('data.filter.isCalcMulti'),
		isNullData = this.metaAction.gf('data.filter.isNullData'),
			year = this.metaAction.context.get("currentOrg").enabledYear
			year = Number(year)
		let option = {
			accountTypeId: accountType,
			year: year,
			isCalcQuantity: isCalcQuantity,
			isCalcMulti: isCalcMulti,
			noDataNoDisplay: isNullData?true:false
		}
		let response = await this.webapi.export(option)
		this.metaAction.toast('success', '导出成功')
	}
	loadBalanceData = async (accountType, selectedYear, otherparam) => {
		let currentOrg = this.metaAction.context.get("currentOrg"),
			accountingStandards = currentOrg.accountingStandards

		let accountTypeNew = accountType
		// 若之前为企业准则而且选择的是共同这一项时 切到期初时默认显示资产这列
		// if (accountTypeNew == 5000010003 && accountingStandards) {
		//     accountTypeNew = 5000010001
		// }

		let year = this.metaAction.context.get("currentOrg").enabledYear
		year = Number(year)
		let option = {
			accountTypeId: accountTypeNew,
			year: year,
			isCalcQuantity: !!this.metaAction.gf('data.filter.isCalcQuantity'),
			isCalcMulti: !!this.metaAction.gf('data.filter.isCalcMulti'),
			noDataNoDisplay: false
		}

		// if (otherparam) {
		// 		if (otherparam[0].path == 'data.filter.isCalcQuantity') {
		// 				option.isCalcQuantity = otherparam[0].value
		// 		} else if (otherparam[0].path == 'data.filter.isCalcMulti') {
		// 				option.isCalcMulti = otherparam[0].value
		// 		}
		// }

		let isNullData = this.metaAction.gf('data.filter.isNullData'),
			list = this.metaAction.gf('data.list').toJS(),
			copyList = fromJS(list), newList
		if (isNullData) {
			option.noDataNoDisplay = true
		}
		let page = this.metaAction.gf('data.pagination').toJS()
		let newPage = utils.sortSearchOption(page, null, ['total', 'totalCount', 'totalPage'])
		option.page = newPage
		const response = await this.webapi.init(option)
		// this.metaAction.sf('data.other.isLoading', false)
		// this.injections.reduce('setCashflowDisabled', Number(response.enabledMonth))

		let other = [
				{ path: 'data.other.isLoading', value: false },
				{ path: 'data.other.cashflowDisabled', value: Number(response.enabledMonth) == 1 }
		]

		let enabledPeriod = { enabledYear: response.enabledYear, enabledMonth: response.enabledMonth, ts: response.ts ? response.ts : '' },
			calcDict = response.calcDict, haveMonthlyClosing = response.haveMonthlyClosing,
			settedPeriod = `${response.enabledYear}-${response.enabledMonth}`

		let tableOption = this.metaAction.gf('data.tableOption'),
				rightTable = document.getElementsByClassName('ttk-gl-app-finance-periodbegin-body') && document.getElementsByClassName('ttk-gl-app-finance-periodbegin-body')[0],
				rightTableWidth = rightTable && rightTable.scrollWidth

		if(rightTable) {
				tableOption = tableOption.set('x', rightTableWidth - 5)
		}

		this.injections.reduce('loadBalanceData', response, year, settedPeriod, enabledPeriod, accountingStandards, accountTypeNew, calcDict, haveMonthlyClosing, other, tableOption)

		// setTimeout(() => {
		// 	this.onResize()
		// }, 50)
	}
	balanceModal = async () => {
		await this.metaAction.modal('show', {
			// height: 200,
			// width: 250,
			title: '试算平衡',
			// okText: '关闭',
			// closable: false,
			wrapClassName: 'balance-container initcomplete-tip',
			children: await this.getBalanceModal(),
		})
	}
	getBalanceModal = async () => {
		let accountType = this.metaAction.gf('data.filter.targetKey'),
			subdataSource,
			year = this.metaAction.context.get("currentOrg").enabledYear
		year = Number(year)
		let option = {
			accountTypeId: accountType,
			year: year,
			isCalcQuantity: false,
			isCalcMulti: false,
			noDataNoDisplay: false
		}
		let pageParam = {
			moduleKey: 'ttk-gl-app-finance-periodbegin',
			resourceKey: 'ttk-gl-app-finance-periodbegin-table',
		}
		let pageResponse = await this.webapi.getPageSetting(pageParam)
		let page = this.metaAction.gf('data.pagination').toJS()
		if(pageResponse.pageSize){
				page.pageSize = pageResponse.pageSize
		}
		// this.metaAction.sf('data.pagination', fromJS(page))
		let other = [{ path: 'data.pagination', value: page }]

		let newPage = utils.sortSearchOption(page, null, ['total', 'totalCount', 'totalPage'])
		option.page = newPage
		let response = await this.webapi.init(option)
		if (response.balanceCheckList) {
			// this.metaAction.sf('data.balanceCheckList', fromJS(response.balanceCheckList))
			other.push({ path: 'data.balanceCheckList', value: response.balanceCheckList })

			subdataSource = response.balanceCheckList
			subdataSource.map(item => {
				item.amountZc = Number(item.amountZc ? item.amountZc : 0).toFixed(2)
				item.amountFz = Number(item.amountFz ? item.amountFz : 0).toFixed(2)
				item.amountSyzqy = Number(item.amountSyzqy ? item.amountSyzqy : 0).toFixed(2)
				return item
			})
		}
		this.injections.reduce('updateArr', other)

		const tryCacuBalance = this.metaAction.gf('data.other.tryCacuBalance').toJS()
		let beginAmountCr = tryCacuBalance.beginAmountCr ? tryCacuBalance.beginAmountCr : 0.00,
			beginAmountDr = tryCacuBalance.beginAmountDr ? tryCacuBalance.beginAmountDr : 0.00,
			yearBeginAmountCr = tryCacuBalance.yearBeginAmountCr ? tryCacuBalance.yearBeginAmountCr : 0.00,
			yearBeginAmountDr = tryCacuBalance.yearBeginAmountDr ? tryCacuBalance.yearBeginAmountDr : 0.00,
			amountDr = tryCacuBalance.amountDr ? tryCacuBalance.amountDr : 0,
			amountCr = tryCacuBalance.amountCr ? tryCacuBalance.amountCr : 0,
			period = this.metaAction.gf('data.other.settedPeriod').split('-'),
			dataSource,
			columns = [
				{
					title: '项目',
					dataIndex: 'project',
					key: 'project',
					align: 'center',
				},
				{
					title: <div>借方科目<Popover overlayClassName="debitPopover" content={<p>请注意资产类科目中，累计折旧、累计摊销科目为“贷方科目”，期初余额计入贷方科目余额</p>}><Icon type="bangzhutishi" fontFamily="edficon" className="helpIcon" style={{ position: 'relative', top: '-1px'}} /></Popover></div>,
					dataIndex: 'debit',
					key: 'debit',
					align: 'center',
				},
				{
					title: '贷方科目',
					dataIndex: 'credit',
					key: 'credit',
					align: 'center',
				},
				{
					title: '差额',
					dataIndex: 'balance',
					key: 'balance',
					align: 'center',
				}
			],
			subcolumns = [
				{
					title: '项目',
					dataIndex: 'accountName',
					key: 'accountName',
					align: 'center',
				},
				{
					title: '资产',
					dataIndex: 'amountZc',
					key: 'amountZc',
					align: 'center',
				},
				{
					title: '负债',
					dataIndex: 'amountFz',
					key: 'amountFz',
					align: 'center',
				},
				{
					title: '所有者权益',
					dataIndex: 'amountSyzqy',
					key: 'amountSyzqy',
					align: 'center',
				}
			]
		if (Number(period[1]) == 1) {
			dataSource = [
				{
					project: '期初余额', debit: Number(beginAmountDr).toFixed(2), credit: Number(beginAmountCr).toFixed(2), balance: Number(beginAmountDr - beginAmountCr).toFixed(2)
				}
			]
		} else {
			dataSource = [
				{
					project: '期初余额', debit: Number(beginAmountDr).toFixed(2), credit: Number(beginAmountCr).toFixed(2), balance: Number(beginAmountDr - beginAmountCr).toFixed(2)
				},
				{
					project: '本年累计', debit: Number(amountDr).toFixed(2), credit: Number(amountCr).toFixed(2), balance: Number(amountDr - amountCr).toFixed(2)
				},
				{
					project: '年初余额', debit: Number(yearBeginAmountDr).toFixed(2), credit: Number(yearBeginAmountCr).toFixed(2), balance: Number(yearBeginAmountDr - yearBeginAmountCr).toFixed(2)
				}
			]

		}
		return (
			<div>
				<Table dataSource={dataSource} columns={columns} pagination={false} bordered={true} />
				<br />
				<Table dataSource={subdataSource} columns={subcolumns} pagination={false} bordered={true} />
			</div>
		)
	}
	onTabFocus = () => {
		// this.metaAction.sf('data.other.matchBacktoZero', true)
		// this.metaAction.sf('data.other.matchIndex', -1)
		let other = [
				{ path: 'data.other.matchBacktoZero', value: true },
				{ path: 'data.other.matchIndex', value: -1 }
		]
		this.injections.reduce('updateArr', other)

		let accountType = this.metaAction.gf('data.filter.targetKey'),
			selectedYear = this.metaAction.gf('data.other.year').get('id')
		this.loadBalanceData(accountType, selectedYear)
	}

	tabChange = async (key) => {
		// this.metaAction.sf('data.other.matchBacktoZero', true)
		// this.metaAction.sf('data.other.matchIndex', -1)
		let other = [
				{ path: 'data.other.matchBacktoZero', value: true },
				{ path: 'data.other.matchIndex', value: -1 }
		]
		this.injections.reduce('updateArr', other)

		let selectedYear = this.metaAction.gf('data.other.year').get('id')
		this.loadBalanceData(key, selectedYear)

	}

	// 科目期初和现金流量期初切换
	bigTabChange = async (key) => {
		let cashflowDisabled = this.metaAction.gf('data.other.cashflowDisabled')
		let pingheng1 = this.metaAction.gf('data.other.pingheng1'),
			pingheng2 = this.metaAction.gf('data.other.pingheng2'),
			isBalance = false  // false：科目期初试算不平衡  true：科目期初试算平衡
		if (pingheng1 && pingheng2) {
			if (pingheng1.innerText == '=' && pingheng2.innerText == '=') {
				isBalance = true
			}
		} else if (pingheng1 && !pingheng2) {
			if (pingheng1.innerText == '=') {
				isBalance = true
			}
		}

		let other = [
			{ path: 'data.other.isBalance', value: isBalance },
			{ path: 'data.other.pingheng1', value: pingheng1 },
			{ path: 'data.other.pingheng2', value: pingheng2 },
			{ path: 'data.other.accountFlowBalancePageSwitch', value: key }
		]
		this.injections.reduce('updateArr', other)

		if (key == data.PERIODBEGIN_ACCOUNTPERIODBEGIN) {
			let accountType = this.metaAction.gf('data.filter.targetKey'),
				selectedYear = this.metaAction.gf('data.other.year').get('id')
			this.loadBalanceData(accountType, selectedYear)
		} else if (key == data.PERIODBEGIN_CASHFLOWPERIODBEGIN) {
			this.loadCFPeriodBegin()
		}

	}

	reload = async () => {
		const pagination = this.metaAction.gf('data.pagination').toJS()
		const filter = this.metaAction.gf('data.filter').toJS()
		this.load(pagination, filter)
	}
	getDisabledDate = (current) => {
		var disabledDate = new Date(this.metaAction.gf('data.other.settedPeriod'))
		return current && current.valueOf() < disabledDate
	}
	tableColumns = () => {
		let columnDto = this.metaAction.gf('data.other.columnDto') && this.metaAction.gf('data.other.columnDto').toJS(),
			code = this.metaAction.gf('data').toJS().other.code,
			isCalcQuantity= this.metaAction.gf('data.filter.isCalcQuantity'),
			isCalcMulti= this.metaAction.gf('data.filter.isCalcMulti'),
			arr = [],
			parentList = []

		if (columnDto && columnDto.length > 0) {
			let listWidth = 0

			columnDto.forEach(item => {
				if (item.customDecideVisible == true) {
					if (!item.parentId) {
						let obj = {
							width: item.width,
							fieldName: item.fieldName,
							title: item.caption,
							dataIndex: item.fieldName,
							key: item.fieldName,
							id: item.id,
							code: code,
							name: item.fieldName,
							isVisible: item.customDecideVisible,
							customDecideVisible: item.customDecideVisible
						}

						if (item.fieldName == 'directionName' || item.fieldName == 'currencyName') {
							obj.align = 'center'
						} else if (item.fieldName == 'accountName') {
								// obj.fixed ='left'
								obj.render = (text, record, index) => this.renderNameColumn('accountName', record, index)
						} else if (item.fieldName == 'accountCode') {
								// obj.fixed ='left'
								obj.render = (text, record, index) => this.renderNameColumn('accountCode', record, index)
						} else if (item.fieldName == 'beginAmountDr' ||
											item.fieldName == 'beginAmountCr' ||
											item.fieldName == 'amountCr' ||
											item.fieldName == 'beginQuantityDr' ||
											item.fieldName == 'beginOrigAmountDr' ||
											item.fieldName == 'beginQuantityCr' ||
											item.fieldName == 'beginOrigAmountCr' ||
											item.fieldName == 'quantityDr' ||
											item.fieldName == 'origAmountDr' ||
											item.fieldName == 'amountDr' ||
											item.fieldName == 'quantityCr' ||
											item.fieldName == 'origAmountCr'
						) {
								obj.render = (_rowIndex, v, index) => this.renderColumns(item.fieldName, v, index)
						} else if (item.fieldName == 'yearBeginAmountDr' ||
											item.fieldName == 'yearBeginAmountCr' ||
											item.fieldName == 'yearBeginQuantityDr' ||
											item.fieldName == 'yearBeginOrigAmountDr' ||
											item.fieldName == 'yearBeginQuantityCr' ||
											item.fieldName == 'yearBeginOrigAmountCr'
						) {
								obj.render = (text, record, index) => this.renderSpan(item.fieldName, record[item.fieldName])
						}

						parentList.push(obj)
					}
				}
			})
			let list = this.converseTree(columnDto, parentList)
			list.map(o => {
				if (o.children.length == 0) {
					o.children = undefined
				}
			})

			list.forEach(item => {
					let childrenwidth=0
					if(item.children){
							item.children.forEach(item1=>{
									childrenwidth= childrenwidth + (item1.width?item1.width:0)
									listWidth = listWidth + (item1.width?item1.width:0)
							})
							item.width=childrenwidth
					}else{
							listWidth = listWidth + (item.width?item.width:0)
					}
			})
			listWidth += 100

			let tableOption = this.metaAction.gf('data.tableOption'),
					rightTable = document.getElementsByClassName('ttk-gl-app-finance-periodbegin-body') && document.getElementsByClassName('ttk-gl-app-finance-periodbegin-body')[0],
                rightTableWidth = rightTable && rightTable.scrollWidth - 3,
                scrollx = listWidth

            if(rightTable && listWidth && rightTableWidth) {
                if(listWidth < rightTableWidth) {
                    scrollx = rightTableWidth
                }

                tableOption = tableOption.set('x', scrollx)
                this.metaAction.sf('data.tableOption', tableOption)

                 let tableHeader = document.getElementsByClassName('ant-table-thead') && document.getElementsByClassName('ant-table-thead')[0]

                 tableHeader.style.width = scrollx
            }
			if(list.length==2){
					delete list[0].fixed
					delete list[1].fixed
			}else{
                if(listWidth < rightTableWidth) {
                    list.push({
                        fieldName: 'blank',
                        dataIndex: 'blank',
                        title: <span></span>,
                        key: 'blank',
                        name: 'blank',
                        isVisible: true,
                        width: rightTableWidth - listWidth,
                        customDecideVisible: true
                    })
                }
			}

			list.push({
				width: '100px',
				title: '操作',
				key: 'action',
				// fixed: 'right',
				align: 'center',
				render: (text, record, rowIndex) => {
					let obj, enabledYear = this.metaAction.gf('data.other.enabledYear'),
							selectedYear = this.metaAction.gf('data.other.year').get('id')

					if (record && (record.isCalcMulti || record.isCalc) && !record.isDetailData && record.isEndNode) {
							return (
								<span>
									<Icon type="xinzengkemu" fontFamily='edficon' className='table_fixed_width-addIcon' title='新增' onClick={() => this.addAuxItem(record, rowIndex, 'add')} />
								</span>
							)
					} else if (record && record.isDetailData) {
							return (
								<div>
									<span>
										<Icon type="bianji" fontFamily='edficon' className='table_fixed_width-deleteIcon' title='编辑' onClick={() => this.addAuxItem(record, rowIndex, 'edit')} />
									</span>
									<span>
										<Icon type="shanchu" fontFamily='edficon' className='table_fixed_width-deleteIcon' title='删除' onClick={() => this.deleteAuxItem(record, rowIndex)} />
									</span>
								</div>
							)
					} else {
							return (<div style={{height: '37px'}}></div>)
					}

					// if (record && record.isDetailData) {
					// 		return (
					// 			<div>
					// 				<span>
					// 					<Icon type="bianji" fontFamily='edficon' className='table_fixed_width-deleteIcon' title='编辑' onClick={() => this.addAuxItem(record, rowIndex, 'edit')} />
					// 				</span>
					// 				<span>
					// 					<Icon type="shanchu" fontFamily='edficon' className='table_fixed_width-deleteIcon' title='删除' onClick={() => this.deleteAuxItem(record, rowIndex)} />
					// 				</span>
					// 			</div>
					// 		)
					// } else {
					// 		return (<span>AAAAA</span>)
					// }
				}
			})
			return list
			// this.metaAction.sf('data.other.isLoading',false)
			this.injections.reduce('update', { path: 'data.other.isLoading', value: false })

		}

	}
	converseTree = (tree, parentList) => {
		for (let i = 0; i < parentList.length; i++) {
			let parentItem = parentList[i]
			let childrenList = []
			let parentItemId = parentItem.id
			for (let j = 0; j < tree.length; j++) {
				let child = tree[j]
				let id = child.id
				let childObj = {
					id: id,
					title: child.title,
					key: child.fieldName,
					width: child.width,
					title: child.caption,
					dataIndex: child.fieldName,
					fieldName: child.fieldName,
					parentId: child.parentId,
					name: child.fieldName,
					isVisible: child.customDecideVisible,
					customDecideVisible: child.customDecideVisible
				}
				if (child.customDecideVisible == true) {
					if (child.fieldName == 'beginAmountDr' ||
						child.fieldName == 'beginAmountCr' ||
						child.fieldName == 'amountDr' ||
						child.fieldName == 'amountCr' ||
						child.fieldName == 'beginQuantityDr' ||
						child.fieldName == 'beginOrigAmountDr' ||
						child.fieldName == 'beginQuantityCr' ||
						child.fieldName == 'beginOrigAmountCr' ||
						child.fieldName == 'quantityDr' ||
						child.fieldName == 'origAmountDr' ||
						child.fieldName == 'quantityCr' ||
						child.fieldName == 'origAmountCr'

					) {
						childObj.render = (_rowIndex, v, index) => this.renderColumns(child.fieldName, v, index)
					} else if (child.fieldName == 'yearBeginAmountDr' ||
						child.fieldName == 'yearBeginAmountCr' ||
						child.fieldName == 'yearBeginQuantityDr' ||
						child.fieldName == 'yearBeginOrigAmountDr' ||
						child.fieldName == 'yearBeginQuantityCr' ||
						child.fieldName == 'yearBeginOrigAmountCr'
					) {
						childObj.render = (_rowIndex, v, index) => this.renderSpan(child.fieldName, _rowIndex)
					}
					if (childObj.parentId == parentItemId) {
						childrenList.push(childObj)
					}
				}
			}
			parentItem.children = childrenList

		}
		return parentList
	}

	renderColumns = (columnName, v, rowIndex) => {
		let list = this.metaAction.gf('data.list'),
			beginDisabled = false,
			curRow = list.get(rowIndex),
			text = curRow ? curRow.get(columnName) : '',
			error = curRow ? curRow.get(`${columnName}error`) : false,
			isEndNode = curRow ? !!curRow.get('isEndNode') : false,
			isCalc = curRow ? !!curRow.get('isCalc') : false,
			isDetailData = curRow ? !!curRow.get('isDetailData') : false,
			isCalcMulti = curRow ? !!curRow.get('isCalcMulti') : false,
			enabledYear = this.metaAction.gf('data.other.enabledYear'),
			selectedYear = this.metaAction.gf('data.other.year'),
			errorStatus = false,
			editable = (isEndNode && !(isCalc || isCalcMulti)) || isDetailData, //年份下拉选去掉 不再受年份控制
			accountCode = curRow ? curRow.get('accountCode') : '',
			oldValue = curRow ? curRow.get(columnName) : '',
			isResetVisible = this.metaAction.gf('data.other.isResetVisible'),
			customAttribute = this.metaAction.gf('data.other.customAttribute') //为了只有操作另一个input时才去render input
		if (!text) {
			text = ''
		} else if (columnName == 'quantityDr' ||
			columnName == 'beginQuantityCr' ||
			columnName == 'beginQuantityDr' ||
			columnName == 'beginQuantity' ||
			columnName == 'quantityCr' ||
			columnName == 'yearBeginQuantity' ||
			columnName == 'yearBeginQuantityCr' ||
			columnName == 'yearBeginQuantityDr') {
			text = text && text
			// text = text && utils.number.format(text,6)
		} else {
			text = text && text
		}

		if (curRow.get('directionName') == '借' && columnName == 'beginAmountCr' ||
			curRow.get('directionName') == '借' && columnName == 'beginQuantityCr' ||
			curRow.get('directionName') == '借' && columnName == 'beginOrigAmountCr' ||
			curRow.get('directionName') == '贷' && columnName == 'beginAmountDr' ||
			curRow.get('directionName') == '贷' && columnName == 'beginQuantityDr' ||
			curRow.get('directionName') == '贷' && columnName == 'beginOrigAmountDr'
		) {
			beginDisabled = true
		}

		return (
			<EditableCell
				editable={editable}
				value={text}
				errorStatus={error}
				disabled={!isResetVisible ? true : beginDisabled ? true : false}
				onBlur={(value) => this.handleBlur(rowIndex, columnName, value)}
				onEnter={(e) => this.handleEnter(e, rowIndex, columnName)}
				customAttribute={customAttribute}
				rowIndex={rowIndex}
				columnName={columnName}
			/>

		)
	}

	handleKeyDown = (e, rowIndex, columnName) => {
		const inputs = document.getElementsByClassName('ant-input mk-input-number ttk-gl-app-finance-periodbegin-tableClass')
		let index = $(inputs).index(e.target),
			newValue = e.target.value,
			list = this.metaAction.gf('data.list', list),
			errorMessage = this.getErrorMessage(columnName)
		// 获取光标当前位置
		let cursorPosition = utils.dom.getCursorPosition(e.target)
		if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.key == 'Enter') {
			if (newValue && newValue.indexOf(',') > -1) {
				newValue = newValue.replace(/,/g, '')
			}
			if (newValue && newValue > 9999999999.99) {
				this.metaAction.toast('warning', `${errorMessage}不能大于9,999,999,999.99，请调整`)
				return
			}
			if (newValue && newValue < -9999999999.99) {
				this.metaAction.toast('warning', `${errorMessage}不能小于9,999,999,999.99，请调整`)
				return
			}
			if (newValue && isNaN(Number(parseFloat(newValue)))) {
				this.metaAction.toast('warning', '请输入数字')
				return
			}

			switch (e.keyCode) {
				case 38: //上
					index = index - 3
					if (index < 0) {
						index = index + 3
					}
					break;
				case 40: // 下
					index = index + 3
					if (index > inputs.length - 1) {
						index = index - 3
					}
					break;
				case 37: // 左
					if (cursorPosition == 1) {
						index = index - 1
						if (index < 0) {
							index = index + 1
						}
					}
					break;
				case 39: //右
					if (cursorPosition == String(newValue).length + 1) {
						index = index + 1
						if (index > inputs.length - 1) {
							index = index - 1
						}
					}
					break;
				case 13: //ENTER
					index = index + 1
					break;
				case 108:
					index = index + 1
					break;
				default: return
			}
		}
		inputs[index].focus()
	}
	onExit = (tour) => {
		const intro = tour
		if (intro.action == 'skip' || intro.status == 'finished') {
			let stepEnabled = this.metaAction.gf('data.other.stepEnabled')
			if (stepEnabled == true) {
				// this.metaAction.sf('data.other.stepEnabled', false)
				this.injections.reduce('update', { path: 'data.other.stepEnabled', value: false })
				let params = { "menuId": this.menuList.menuKey, "isVisible": false }
				this.webapi.updateGuide(params)

				this.component.props.closeGuide &&
					this.component.props.closeGuide(this.component.props.appName)
			}
		}
	}

	/**
			 * 财务期初-上一步
			 */
	preStep = async () => {
		if (this.component.props) {
			const appParams = this.component.props && this.component.props.appExtendParams
			if (appParams && !appParams.preStep) {
				appParams.preStep = 'app-account-subjects-financeinit'
			}
			this.component.props.setPortalContent('科目初始化', appParams.preStep, appParams)
		}
	}
	asyncFinish = async () => {

		let isBalance = true
		const isflowBalance = this.metaAction.gf('data.other.accountFlowBalancePageSwitch'),
			tryCacuBalance = this.metaAction.gf('data.other.tryCacuBalance').toJS()
		if ((parseFloat(tryCacuBalance.beginAmountDr || 0) != parseFloat(tryCacuBalance.beginAmountCr || 0))
			|| (parseFloat(tryCacuBalance.yearBeginAmountCr || 0) != parseFloat(tryCacuBalance.yearBeginAmountDr || 0))) {
			isBalance = false
		}
		if (isflowBalance == '1001' && !isBalance) {
			// this.metaAction.sf('data.other.isNoDispose', true)
			this.injections.reduce('update', { path: 'data.other.isNoDispose', value: true })

			this.metaAction.toast('warning', '试算不平衡，请检查数据!')
			return
		} else if (isflowBalance == '1002' && !isBalance) {
			// this.metaAction.sf('data.other.isNoDispose', true)
			this.injections.reduce('update', { path: 'data.other.isNoDispose', value: true })
			this.metaAction.toast('warning', '试算不平衡，请检查数据!')
			return
		} else {

			const ret = await this.metaAction.modal('confirm', {
				width: 320,
				content: '确认是否已完成财务初始化？'
			})
			// this.metaAction.sf('data.other.isNoDispose', true)
			this.injections.reduce('update', { path: 'data.other.isNoDispose', value: true })
			if (ret) {
				const response = this.webapi.setFinish()
				if (this.component.props) {
					const appParams = this.component.props && this.component.props.appExtendParams
					this.component.props.setPortalContent('完成', 'ttk-gl-app-financeinit-success', appParams)
				}
			}
		}
	}
	finish = async () => {
		setTimeout(() => {
			let isNoDispose = this.metaAction.gf('data.other.isNoDispose')
			if (!isNoDispose) return
			// this.metaAction.sf('data.other.isNoDispose', false)
			this.injections.reduce('update', { path: 'data.other.isNoDispose', value: false })
			this.asyncFinish()
		}, 1000)
	}

	// 科目期初的重新初始化
	rePeriodBeginInit = async () => {
		if (this.metaAction.gf('data.other.haveMonthlyClosing') == true) {
			this.metaAction.toast('info', '该账套已存在结账月份，需要反结账后才能进行重新初始化')
			return
		}

		const ret = await this.metaAction.modal('show', {
			title: '重新初始化',
			width: 500,
			height: 325,
			children: this.metaAction.loadApp('ttk-gl-app-finance-periodbegin-reinit', {
				store: this.component.props.store,
			})
		})

		if (ret == true) {
			this.component.props.tabEdit('财务期初', 'remove')
			this.component.props.onPortalReload && this.component.props.onPortalReload('noReloadTplus')
			setTimeout(() => {
				this.component.props.setPortalContent &&
					this.component.props.setPortalContent('财务期初', 'ttk-gl-app-financeinit-enterprise')
			}, 20)
		}
	}

	getSetContent = () => {
		return (<div style={{ display: 'flex', 'font-size': '12px', 'flex-direction': 'column' }}>
			<div style={{ display: 'flex', 'flex-direction': 'column', color: '#FF6000' }}>
				<div>重新初始化后，将会删除以下数据，请谨慎操作</div>
				<div style={{ 'margin-left': '23px' }}>1 期初科目余额、期初现金流量</div>
				<div style={{ 'margin-left': '23px' }}>2 原科目与新科目间的对应关系（如非第三方导入只显示第一条）</div>
			</div>
			<br />
			<div>是否重新初始化？</div>
			<br />
			<div style={{ display: 'flex' }}>
				<div style={{ 'margin-right': '10px', 'margin-top': '7px' }}>登陆密码</div>
				<Input type='password' style={{ width: '320px' }} />
			</div>
		</div>)
	}

	getContent = () => {
		return <div>
			<p className='chenggongtishi'><Icon type="cuowutishi" fontFamily='edficon' style={{ color: '#E94033' }} /><span>试算不平衡，请检查数据</span></p >
		</div>
	}

	handleEnter = (e, rowIndex, columnName) => { //enter键切换input框
		if (e.keyCode == 13 || e.key == 'Enter' || e.keyCode == 108) {
			const inputs = document.getElementsByClassName('ant-input mk-input-number ttk-gl-app-finance-periodbegin-tableClass')
			const index = $(inputs).index(e.target)
			let newValue = e.target.value, list = this.metaAction.gf('data.list', list), errorMessage = this.getErrorMessage(columnName)
			if (newValue && newValue > 9999999999.99) {
				this.metaAction.toast('warning', `${errorMessage}不能大于9,999,999,999.99，请调整`)
				return
			}
			if (newValue && newValue < -9999999999.99) {
				this.metaAction.toast('warning', `${errorMessage}不能小于9,999,999,999.99，请调整`)
				return
			}
			if (newValue && newValue.indexOf(',') > -1) {
				newValue = newValue.replace(/,/g, '')
			}
			if (isNaN(newValue)) {
				this.metaAction.toast('warning', '请输入数字')
				return
			}
			inputs[index + 1].focus()
		}
	}

	handleBlur = (rowIndex, columnName, value) => {
		let list = this.metaAction.gf('data.list'),
			oldValue = list.get(rowIndex).get(columnName),
			newValue = value,
			errorMessage = this.getErrorMessage(columnName)
		list = list.update(rowIndex, item => item.set(columnName, newValue))
		if (newValue && newValue.indexOf && newValue.indexOf(',') > -1) { //对于修改格式化好的数字 避免isNaN为true
			newValue = newValue.replace(/,/g, '')
		}
		if (newValue > 9999999999.99) {
			newValue = undefined
			// this.metaAction.sf('data.error', true)
			let other = [{ path: 'data.error', value: true }]

			list = list.update(rowIndex, item => {
				item = item.set(columnName, newValue)
				item = item.set(`${columnName}error`, true)
				return item
			})
			// this.metaAction.sf('data.list', list)
			other.push({ path: 'data.list', value: list })
			this.injections.reduce('updateArr', other)

			this.metaAction.toast('warning', `${errorMessage}不能大于9,999,999,999.99，请调整`)
			return
		}
		if (newValue < -9999999999.99) {
			newValue = undefined
			list = list.update(rowIndex, item => {
				item = item.set(columnName, newValue)
				item = item.set(`${columnName}error`, true)
				return item
			})
			// this.metaAction.sf('data.list', list)
			this.injections.reduce('update', { path: 'data.list', value: list })
			this.metaAction.toast('warning', `${errorMessage}不能小于9,999,999,999.99，请调整`)
			return
		}
		if (isNaN(newValue)) {
			this.metaAction.toast('warning', '请输入数字')
			return
		}

		list = list.update(rowIndex, item => {
			item = item.set(columnName, newValue)
			item = item.set(`${columnName}error`, false)
			return item
		})
		// this.metaAction.sf('data.list', list)
		let other = [{ path: 'data.list', value: list }]
		const customAttribute = Math.random()
		// this.metaAction.sf('data.other.customAttribute', customAttribute)
		other.push({ path: 'data.other.customAttribute', value: customAttribute })
		this.injections.reduce('updateArr', other)
		this.onFieldChange(columnName + ',' + rowIndex, oldValue, rowIndex)(newValue)
	}
	setField = async (path, value) => {
		let res = await this.changeEnabledPeriod(value)
	}
	onFieldChange = (path, oldValue, rowIndex) => async (newValue) => {
		let accountType = this.metaAction.gf('data.filter.targetKey'),
			selectedYear = this.metaAction.gf('data.other.year').get('id'),
			list = this.metaAction.gf('data.list'),
			errorMessage
		if (oldValue == newValue) return

		//数量、金额、外币变更时，上级科目及年初余额计算
		if (path.indexOf('beginQuantityDr') > -1 ||
			path.indexOf('beginQuantityCr') > -1 ||
			path.indexOf('beginAmountDr') > -1 ||
			path.indexOf('beginAmountCr') > -1 ||
			path.indexOf('beginOrigAmountDr') > -1 ||
			path.indexOf('beginOrigAmountCr') > -1 ||
			path.indexOf('quantityDr') > -1 ||
			path.indexOf('amountDr') > -1 ||
			path.indexOf('origAmountDr') > -1 ||
			path.indexOf('quantityCr') > -1 ||
			path.indexOf('amountCr') > -1 ||
			path.indexOf('origAmountCr') > -1) {

			let curEditField = path.split(',')[0], curYearTotalAmountField, beginAmountField,
				accountType = this.metaAction.gf('data.other.accountType'),
				errorMessage = this.getErrorMessage(curEditField),
				list = this.metaAction.gf('data.list')

			if (newValue && newValue.toString().indexOf(',') > -1) {
				newValue = newValue.replace(/,/g, '')
			}


			let dataName = 'list'
			let curBeginBalance = (this.metaAction.gf('data.list')).toJS()[rowIndex] //当前期初余额行
			// 如果是本位币是人民币 填写期初余额时本位币金额和外币保持一致
			const isBaseCurrency = curBeginBalance.isBaseCurrency
			if (isBaseCurrency) {
				switch (curEditField) {
					case 'beginOrigAmountDr':
						beginAmountField = 'beginAmountDr'
						break;
					case 'beginOrigAmountCr':
						beginAmountField = 'beginAmountCr'
						break;
					case 'beginAmountDr':
						beginAmountField = 'beginOrigAmountDr'
						break;
					case 'beginAmountCr':
						beginAmountField = 'beginOrigAmountCr'
						break;
					case 'origAmountDr':
						beginAmountField = 'amountDr'
						break;
					case 'amountDr':
						beginAmountField = 'origAmountDr'
						break;
					case 'amountCr':
						beginAmountField = 'origAmountCr'
						break;
					case 'origAmountCr':
						beginAmountField = 'amountCr'
						break;
					default: beginAmountField = curEditField
				}
			}

			let isPositiveNum = false

			//在期初余额，在录入【财务费用-利息收入】的【借方累计、贷方累计】录入时，提示用户请录入负值，包含数量、外币、金额
			if ((path.indexOf('quantityDr') > -1 ||
				path.indexOf('origAmountDr') > -1 ||
				path.indexOf('amountDr') > -1 ||
				path.indexOf('quantityCr') > -1 ||
				path.indexOf('origAmountCr') > -1 ||
				path.indexOf('amountCr') > -1) &&
				curBeginBalance.cashTypeId == 203 &&  //203：利息收入
				parseFloat(newValue) > 0) {

				isPositiveNum = true
				newValue = -parseFloat(newValue)
			}

			//损益类、收入类、费用类科目时，填写了借方（贷方）累计金额后，贷方（借方）累计金额自动取相同值
			//为了保持年初余额为零
			if ((accountType == ACCOUNTTYPE_PROFITANDLOSS ||
				accountType == ACCOUNTTYPE_INCOME ||
				accountType == ACCOUNTTYPE_EXPENSES) && curEditField == 'amountDr') {
				curYearTotalAmountField = 'amountCr'
			} else if ((accountType == ACCOUNTTYPE_PROFITANDLOSS ||
				accountType == ACCOUNTTYPE_INCOME ||
				accountType == ACCOUNTTYPE_EXPENSES) && curEditField == 'amountCr') {
				curYearTotalAmountField = 'amountDr'
			}

			if ((accountType == ACCOUNTTYPE_PROFITANDLOSS ||
				accountType == ACCOUNTTYPE_INCOME ||
				accountType == ACCOUNTTYPE_EXPENSES) && curEditField == 'origAmountCr') {
				curYearTotalAmountField = 'origAmountDr'
			} else if ((accountType == ACCOUNTTYPE_PROFITANDLOSS ||
				accountType == ACCOUNTTYPE_INCOME ||
				accountType == ACCOUNTTYPE_EXPENSES) && curEditField == 'origAmountDr') {
				curYearTotalAmountField = 'origAmountCr'
			}
			//本年借方和贷方的数量也要保持一致
			if ((accountType == ACCOUNTTYPE_PROFITANDLOSS ||
				accountType == ACCOUNTTYPE_INCOME ||
				accountType == ACCOUNTTYPE_EXPENSES) && curEditField == 'quantityDr') {
				curYearTotalAmountField = 'quantityCr'
			} else if ((accountType == ACCOUNTTYPE_PROFITANDLOSS ||
				accountType == ACCOUNTTYPE_INCOME ||
				accountType == ACCOUNTTYPE_EXPENSES) && curEditField == 'quantityCr') {
				curYearTotalAmountField = 'quantityDr'
			}
			let listBalance = [],
				curEditBeginBalance = this.getBalanceItem(curBeginBalance, curEditField, newValue, curYearTotalAmountField, beginAmountField)
			curEditBeginBalance.year = this.metaAction.gf('data.other.enabledYear'), //不在受年份控制
				listBalance.push(curEditBeginBalance)
			// 期初余额的计算工作放入后端，所以以下三行注释掉 0105 haozhao
			// let curAccountGrade = curBeginBalance.accountGrade
			// listBalance = caculateTopGrade(curEditField, curEditBeginBalance, curAccountGrade, curYearTotalAmountField)
			// let saveUseList = generateSaveUseList(listBalance)
			// 保存期初余额

			this.createAndUpdateBatch(listBalance, curEditField, isPositiveNum, curYearTotalAmountField, beginAmountField) //初始
			//数量CheckBox变更时列的控制
			// setTimeout(() => {
			// 	this.computeFun()
			// }, 50)
		} else if (path == 'root.children.accountperiodbeginpage.children.tabHeaderWrapDiv.children.tabHeaderDiv.children.rightDiv.children.isCalcQuantity') {
			// this.metaAction.sf('data.filter.isCalcQuantity', !this.metaAction.gf('data.filter.isCalcQuantity'))

			let isCalcQuantity = !this.metaAction.gf('data.filter.isCalcQuantity'),
					isCalcMulti = this.metaAction.gf('data.filter.isCalcMulti'),
					h = 123

			if (isCalcQuantity || isCalcMulti) {
					h = h + 38
			}

			this.injections.reduce('updateArr', [
					{ path: 'data.filter.isCalcQuantity', value: !this.metaAction.gf('data.filter.isCalcQuantity') },
					{ path: 'data.tableOption.h', value: h }
			])
			// let other = [
			// 		{ path: 'data.filter.isCalcQuantity', value: !this.metaAction.gf('data.filter.isCalcQuantity') },
			// 		{ path: 'data.tableOption.h', value: h }
			// ]

			// this.injections.reduce('changeShowQuanMulti', this.metaAction.gf('data.filter.isCalcQuantity'), 1);

			this.loadBalanceData(accountType, selectedYear)
			// setTimeout(() => {
			// 	this.computeFun()
			// }, 50)
			//外币CheckBox变更时列的控制
		} else if (path == 'root.children.accountperiodbeginpage.children.tabHeaderWrapDiv.children.tabHeaderDiv.children.rightDiv.children.isCalcMulti') {
			// this.metaAction.sf('data.filter.isCalcMulti', !this.metaAction.gf('data.filter.isCalcMulti'))

			let isCalcQuantity = this.metaAction.gf('data.filter.isCalcQuantity'),
					isCalcMulti = !this.metaAction.gf('data.filter.isCalcMulti'),
					h = 123

			if (isCalcQuantity || isCalcMulti) {
					h = h + 38
			}

			this.injections.reduce('updateArr', [
					{ path: 'data.filter.isCalcMulti', value: !this.metaAction.gf('data.filter.isCalcMulti') },
					{ path: 'data.tableOption.h', value: h }
			])
			// let other = [
			// 		{ path: 'data.filter.isCalcMulti', value: !this.metaAction.gf('data.filter.isCalcMulti') },
			// 		{ path: 'data.tableOption.h', value: h }
			// ]

			this.loadBalanceData(accountType, selectedYear)
			// setTimeout(() => {
			// 	this.computeFun()
			// }, 50)
			//隐藏空数据
		} else if (path == 'root.children.accountperiodbeginpage.children.tabHeaderWrapDiv.children.tabHeaderDiv.children.rightDiv.children.filter') {
			let accountTypeId = this.metaAction.gf('data.filter.targetKey')
			let year = this.metaAction.context.get("currentOrg").enabledYear
			year = Number(year)

			let option = {
				accountTypeId: accountTypeId,
				year: year,
				isCalcQuantity: false,
				isCalcMulti: false,
				noDataNoDisplay: false
			}
			let isNullData = this.metaAction.gf('data.filter.isNullData')
			// this.metaAction.sf('data.filter.isNullData', newValue.target.checked)
			this.injections.reduce('update', { path: 'data.filter.isNullData', value: newValue.target.checked })

			if (newValue.target.checked) {
				option.noDataNoDisplay = true
			}
			this.loadBalanceData(accountType, selectedYear)
			// setTimeout(() => {
			// 	this.computeFun()
			// }, 50)
			//年度变化时，重新加载期初余额
		} else if (path == 'root.children.accountperiodbeginpage.children.header.children.left.children.year.children.year') {
			let yearList = this.metaAction.gf('data.other.yearList'),
				hit = yearList.find(o => o.get('id') == newValue)

			if (hit) {
				// this.metaAction.sf('data.other.year', fromJS(hit))
				this.injections.reduce('update', { path: 'data.other.year', value: hit })

				selectedYear = hit.get('id')
			}

			this.loadBalanceData(accountType, selectedYear)
			// setTimeout(() => {
			// 	this.computeFun()
			// }, 50)
		}
	}


	getErrorMessage = (curEditField) => {
		let errorMessage

		if (curEditField === 'beginQuantity') {
			errorMessage = `期初余额数量`
		} else if (curEditField === 'beginOrigAmount') {
			errorMessage = `期初余额外币`
		} else if (curEditField === 'beginAmount') {
			errorMessage = `期初余额金额`
		} else if (curEditField === 'quantityDr') {
			errorMessage = `本年借方累计数量`
		} else if (curEditField === 'origAmountDr') {
			errorMessage = `本年借方累计外币`
		} else if (curEditField === 'amountDr') {
			errorMessage = `本年借方累计金额`
		} else if (curEditField === 'quantityCr') {
			errorMessage = `本年贷方累计数量`
		} else if (curEditField === 'origAmountCr') {
			errorMessage = `行本年贷方累计外币`
		} else if (curEditField === 'amountCr') {
			errorMessage = `本年贷方累计金额`
		} else if (curEditField == 'beginAmountDr_f') {
			errorMessage = `期初借方余额`
		} else if (curEditField == 'beginAmountCr_f') {
			errorMessage = `期初贷方余额`
		} else if (curEditField == 'amountDr_f') {
			errorMessage = `本年借方累计`
		} else if (curEditField == 'amountCr_f') {
			errorMessage = `本年贷方累计`
		}

		return errorMessage
	}

	//新增修改合并处理
	createAndUpdateBatch = async (listBalance, curEditField, isPositiveNum, curYearTotalAmountField, beginAmountField) => {
		listBalance.map(item => {
			if(!item.beginAmountDr) item.beginAmountDr = null
			if(!item.beginOrigAmountDr) item.beginOrigAmountDr = null
			if(!item.beginQuantityDr) item.beginQuantityDr = null
			if(!item.beginAmountCr) item.beginAmountCr = null
			if(!item.beginOrigAmountCr) item.beginOrigAmountCr = null
			if(!item.beginQuantityCr) item.beginQuantityCr = null
			if(!item.amountCr) item.amountCr = null
			if(!item.amountDr) item.amountDr = null
			if(!item.origAmountCr) item.origAmountCr = null
			if(!item.origAmountDr) item.origAmountDr = null
			if(!item.quantityCr) item.quantityCr = null
			if(!item.quantityDr) item.quantityDr = null
			return item
	})
		const data = await this.webapi.createAndUpdateBatch(listBalance)
		const curIsCalcMulti = this.metaAction.gf('data.filter.isCalcMulti')
		let accountType = this.metaAction.gf('data.filter.targetKey')
		let selectedYear = this.metaAction.gf('data.other.year').get('id')

		if (data) {
			await this.loadBalanceData(accountType, selectedYear)
			if (isPositiveNum) {
				this.metaAction.toast('success', '期初余额更新成功！财务费用下的利息收入是借方科目，[本年借方累计][本年贷方累计]列应该录入负数')
			} else {
				this.metaAction.toast('success', '期初余额更新成功')
			}

		}

	}

	controlTip = () => {
		let getRandom = Math.floor(Math.random() * 10000)
		this.getRandom = getRandom

		setTimeout(() => {
			if (this.getRandom == getRandom) {
				this.metaAction.toast('success', '期初余额更新成功')
			}
		}, 1000)
	}


	getSelectedYear = () => {
		let selectedYear
		if (this.metaAction.gf('data.other.year')) {
			selectedYear = this.metaAction.gf('data.other.year').get('id')
		}
		return selectedYear
	}

	getBalanceItem = (balanceFromServer, curEditField, newValue, curYearTotalAmountField, beginAmountField) => {
		if (!balanceFromServer) {
			return {}
		}

		let retBalance = {
			id: balanceFromServer.id,    //  期初余额id
			year: balanceFromServer.currentYear,    //	年度
			origAmountDr: clearThousandsPosition(balanceFromServer.origAmountDr),    //	本年借方累计(外币)
			origAmountCr: clearThousandsPosition(balanceFromServer.origAmountCr),    //	本年贷方累计（外币）
			amountDr: clearThousandsPosition(balanceFromServer.amountDr),    //	本年借方累计（本币）
			amountCr: clearThousandsPosition(balanceFromServer.amountCr),    //	本年贷方累计（本币）
			quantityDr: clearThousandsPosition(balanceFromServer.quantityDr),    //	本年借方累计（数量）
			quantityCr: clearThousandsPosition(balanceFromServer.quantityCr),    //	本年贷方累计（数量）
			beginAmountDr: clearThousandsPosition(balanceFromServer.beginAmountDr), //期初本币余额（借方）
			beginAmountCr: clearThousandsPosition(balanceFromServer.beginAmountCr),//期初本币余额（贷方）
			beginOrigAmountDr: clearThousandsPosition(balanceFromServer.beginOrigAmountDr), //期初外币余额（借方）
			beginOrigAmountCr: clearThousandsPosition(balanceFromServer.beginOrigAmountCr), //期初外币余额（贷方）
			beginQuantityDr: clearThousandsPosition(balanceFromServer.beginQuantityDr),//期初借方余额（数量）
			beginQuantityCr: clearThousandsPosition(balanceFromServer.beginQuantityCr),//期初贷方余额（数量）
			// isAuxAccCalc: balanceFromServer.isAuxAccCalc,    //	是否辅助明细数据
			// isAuxAccCalc:balanceFromServer.isDetailData,    //	是否辅助明细数据
			isDetailData: balanceFromServer.isDetailData,    //	是否辅助明细数据
			unitId: balanceFromServer.unitId,    //	计量单位ID
			currencyId: balanceFromServer.currencyId,    //	币种ID
			currencyCode: balanceFromServer.currencyCode,    //	币种编码
			accountId: balanceFromServer.accountId,    //	科目ID
			accountCode: balanceFromServer.accountCode,    //	科目编码
			direction: balanceFromServer.direction,    //	方向编码
			departmentId: balanceFromServer.departmentId,    //	部门ID
			personId: balanceFromServer.personId,    //	人员ID
			customerId: balanceFromServer.customerId,    //	客户ID
			supplierId: balanceFromServer.supplierId,    //	供应商ID
			inventoryId: balanceFromServer.inventoryId,    //	存货ID
			projectId: balanceFromServer.projectId,    //	项目ID
			bankAccountId: balanceFromServer.bankAccountId,    //	账号ID
			levyAndRetreatId: balanceFromServer.levyAndRetreatId,    //    即征即退ID
			inputTaxId: balanceFromServer.inputTaxId                    //    即征即退ID
		}, accountType = this.metaAction.gf('data.other.accountType')

		if (newValue != undefined) {
			retBalance[curEditField] = newValue
		}
		if (curYearTotalAmountField && newValue != undefined) {
			retBalance[curYearTotalAmountField] = newValue
		}
		if (beginAmountField && newValue != undefined) {
			if (accountType == ACCOUNTTYPE_PROFITANDLOSS) {
				switch (beginAmountField) {
					case 'origAmountDr':
						retBalance['origAmountDr'] = newValue
						retBalance['amountDr'] = newValue
						retBalance['origAmountCr'] = newValue
						retBalance['amountCr'] = newValue
						break;
					case 'amountDr':
						retBalance['amountDr'] = newValue
						retBalance['origAmountDr'] = newValue
						retBalance['origAmountCr'] = newValue
						retBalance['amountCr'] = newValue
						break;
					case 'origAmountCr':
						retBalance['amountDr'] = newValue
						retBalance['origAmountDr'] = newValue
						retBalance['origAmountCr'] = newValue
						retBalance['amountCr'] = newValue
						break;
					case 'amountCr':
						retBalance['amountDr'] = newValue
						retBalance['origAmountDr'] = newValue
						retBalance['origAmountCr'] = newValue
						retBalance['amountCr'] = newValue
						break;
					default: retBalance[beginAmountField] = newValue
				}
			} else {
				retBalance[beginAmountField] = newValue
			}
		}
		return retBalance
	}

	operateCol = (record, rowIndex) => {
		let obj,
			enabledYear = this.metaAction.gf('data.other.enabledYear'),
			selectedYear = this.metaAction.gf('data.other.year').get('id')

		if (record && (record.isCalcMulti || record.isCalc) && !record.isDetailData && record.isEndNode) {
			obj = {
				children: (
					<span>
						<Icon type="xinzengkemu" fontFamily='edficon' className='table_fixed_width-addIcon' title='新增' onClick={() => this.addAuxItem(record, rowIndex, 'add')} />
					</span>
				)
			}
		} else if (record && record.isDetailData) {
			obj = {
				children: (
					<div>
						<span>
							<Icon type="bianji" fontFamily='edficon' className='table_fixed_width-deleteIcon' title='编辑' onClick={() => this.addAuxItem(record, rowIndex, 'edit')} />
						</span>
						<span>
							<Icon type="shanchu" fontFamily='edficon' className='table_fixed_width-deleteIcon' title='删除' onClick={() => this.deleteAuxItem(record, rowIndex)} />
						</span>
					</div>
				)
			}
		}

		return obj
	}
	editAuxItem = async (selectObj, selectIndex) => {
		// let year = this.metaAction.context.get("currentOrg").enabledYear
		// year = Number(year)
		// const id = selectObj.id
		// const isNotJanuary = enabledMonth != 1
		// const calcDict = this.metaAction.gf('data.other.calcDict')
		// let accountType = this.metaAction.gf('data.filter.targetKey')
		// let selectedYear = this.metaAction.gf('data.other.year').get('id')
		// const result = await this.metaAction.modal('show', {
		//     // title: '新增辅助核算明细',
		//     title: title,
		//     width: width,
		//     height: 500,
		//     children: this.metaAction.loadApp('app-account-addmultiauxitem', {
		//         store: this.component.props.store,
		//         columnCode: "common",
		//         initData: { selectObj, isNotJanuary, calcDict, selectIndex, colums, isResetVisible},
		//         callbackAction: this.handlerResult
		//     })
		// })
	}
	deleteItem = async (selectObj, selectIndex) => {
		let year = this.metaAction.context.get("currentOrg").enabledYear
		year = Number(year)
		const id = selectObj.id
		const result = await this.webapi.deleteAuxItem({ id, year })
		let accountType = this.metaAction.gf('data.filter.targetKey')
		let selectedYear = this.metaAction.gf('data.other.year').get('id')
		if (result) {
			await this.loadBalanceData(accountType, selectedYear)
			this.metaAction.toast('success', '期初余额删除成功')
			// this.computeFun()
		}
	}

	//删除辅助明细确认弹框
	deleteAuxItem = async (record, rowIndex) => {
		const _this = this
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '你确定要删除吗？',
			onOk() {
				_this.deleteItem(record, rowIndex)
			},
			onCancel() { }
		})

	}

	// 新增辅助明细
	addBatch = async (listBalance, rowIndex, isSelectCurrency, accountId, id, type) => {
		if (this.isHaveResult) return
		let accountType = this.metaAction.gf('data.filter.targetKey')
		let selectedYear = this.metaAction.gf('data.other.year').get('id')
		listBalance.isReturnValue = true
		this.isHaveResult = true
		if (type == 'edit') {
			listBalance[0].id = id
		}
		listBalance.map(item => {
			if(!item.beginAmountDr) item.beginAmountDr = null
			if(!item.beginOrigAmountDr) item.beginOrigAmountDr = null
			if(!item.beginQuantityDr) item.beginQuantityDr = null
			if(!item.beginAmountCr) item.beginAmountCr = null
			if(!item.beginOrigAmountCr) item.beginOrigAmountCr = null
			if(!item.beginQuantityCr) item.beginQuantityCr = null
			if(!item.amountCr) item.amountCr = null
			if(!item.amountDr) item.amountDr = null
			if(!item.origAmountCr) item.origAmountCr = null
			if(!item.origAmountDr) item.origAmountDr = null
			if(!item.quantityCr) item.quantityCr = null
			if(!item.quantityDr) item.quantityDr = null
			return item
	})
		const data = await this.webapi.createAndUpdateBatch(listBalance)

		if (data.result == false) {
			this.isHaveResult = false
			this.metaAction.toast('warning', data.error.message)
			return false
		}
		else {
			await this.loadBalanceData(accountType, selectedYear)
			this.isHaveResult = false
		}

		this.metaAction.toast('success', '期初余额新增成功')
		// this.computeFun()
		return true
	}
	handlerResult = async (result, accountingSubject, rowIndex, type) => {
		if (result) {

			let selectedYear = this.metaAction.gf('data.other.enabledYear'), //不在受年份控制
				list = this.metaAction.gf('data.list'),
				auxItems = [],
				accountId = accountingSubject.accountId,
				accountCode = accountingSubject.accountCode,
				direction = accountingSubject.direction,
				cashTypeId = accountingSubject.cashTypeId,
				id = accountingSubject.id
			const resultList = result.value.toJS()
			for (let i = 0; i < resultList.length; i++) {
				let item = resultList[i],
					auxItem = this.addFileToBalance(item, selectedYear, accountId, accountCode, direction, cashTypeId, accountingSubject)
				auxItems.push(auxItem)
			}
			let arrAuxItems = list.filter(subItem => {
				return subItem.get('accountId') == accountId &&
					subItem.get('isDetailData') == true
			})

			for (let i = 0; i < auxItems.length; i++) {
				let filterItem = arrAuxItems.filter(subItem => {
					if (auxItems[i].currencyId) {
						return subItem.get('accountCode') + '_' + subItem.get('currencyCode') == auxItems[i].accountCode + '_' + auxItems[i].currencyCode
					} else {
						return subItem.get('accountCode') == auxItems[i].accountCode
					}
				})

			}

			let addAuxItems = []
			for (let i = 0; i < auxItems.length; i++) {
				if (auxItems[i].addFlg != 0) {
					addAuxItems.push(auxItems[i])
				}
			}

			if (addAuxItems.length == 0) {
				// clearMessage()
				// return
			}

			// 若当前期初余额还未入库，则逐级次找出上级科目期初余额数据准备入库
			// let id = getterByField(`list.${rowIndex}.id`), //期初余额id
			//     accountGrade = getterByField(`list.${rowIndex}.accountGrade`)


			// 判断是否有选择了币种
			let isSelectCurrency = false

			for (let i = 0; i < result.value.length; i++) {
				let auxItem = result.value[i]
				if (!!auxItem.currencyId && (!!auxItem.currencyId.code || auxItem.currencyId.id || auxItem.currencyId.name)) {
					isSelectCurrency = true
					break
				}
			}

			const res = this.addBatch(addAuxItems, rowIndex, isSelectCurrency, accountId, id, type)

			return res
		}

	}

	//增加辅助项弹框
	addAuxItem = async (accountingSubject, rowIndex, type) => {
		let curItem = this.metaAction.gf('data.list').get(rowIndex).toJS()
		accountingSubject.accountType = this.metaAction.gf('data.other.accountType')
		const enabledMonth = this.metaAction.gf('data.other.enabledMonth')
		const isNotJanuary = enabledMonth != 1
		const calcDict = this.metaAction.gf('data.other.calcDict')

		let width,
			valueTrueNum = 0,
			colums

		for (let key in accountingSubject) {
			if (accountingSubject.hasOwnProperty(key) && typeof (accountingSubject[key]) == 'boolean' && accountingSubject[key] == true) {
				if (key == 'isMultiCalc') {
					valueTrueNum = valueTrueNum + 1
				} else {
					valueTrueNum += 1
				}
			}
		}
		switch (valueTrueNum) {
			case 1:
				width = 500
				break;
			case 2:
				width = 500
				break;
			case 3:
				width = 600
				break;
			case 4:
				width = 600
				break;
			case 5:
				width = 700
				break;
			case 6:
				width = 800
				break;
			case 7:
				width = 900
				break;
			case 8:
				width = 1000
				break;
			case 9:
				width = 1100
				break;
			case 10:
				width = 1200
				break;
			default:
				width = (valueTrueNum + 3) * 100
				break;
		}

		if (enabledMonth > 1) {
			// width += 300
			width += 200
			if (accountingSubject.isCalcMulti == true) {
				// width += 600
				width += 400
			}
			if (accountingSubject.isCalcQuantity == true) {
				// width += 300
				width += 200
			}
		} else {
			width += 100
			if (accountingSubject.isCalcMulti == true) {
				// width += 200
				width += 150
			}
			if (accountingSubject.isCalcQuantity == true) {
				// width += 100
			}
		}

		colums = width

		if (width > 1200) {
			// width = 1200
			width = '80%'
		}

		if (width > 700 && width < 1000) {
			width = '60%'
		}

		if (width > 1000 && width < 1200) {
			width = '70%'
		}

		for (let item in accountingSubject) {
			for (let key in calcDict) {
				if (item == key && accountingSubject[item] == true) {
					title = '辅助核算期初余额'
					break
				}
			}
		}
		let isResetVisible = this.metaAction.gf('data.other.isResetVisible'),
			title = type == 'add' ? '新增辅助核算明细' : '编辑辅助核算明细'
		const result = await this.metaAction.modal('show', {
			title: title,
			width: width,
			height: 500,
			children: this.metaAction.loadApp('app-account-addmultiauxitem', {
				store: this.component.props.store,
				columnCode: "common",
				initData: { accountingSubject, isNotJanuary, calcDict, rowIndex, colums, isResetVisible, curItem, type },
				callbackAction: this.handlerResult
			})
		})
	}


	addFileToBalance = (selectedFiles, currentYear, accountId, accountCode, direction, cashTypeId, accountingSubject) => {
		const calcDict = this.metaAction.gf('data.other.calcDict')
		let assistList = []

		let customer = selectedFiles.customer,
			department = selectedFiles.department,
			person = selectedFiles.person,
			inventory = selectedFiles.inventory,
			supplier = selectedFiles.supplier,
			project = selectedFiles.project,
			currency = selectedFiles.currency
		let auxItem = {
			// currentYear: currentYear,
			year: currentYear,
			accountId: accountId,
			direction: direction,
			directionName: direction == 0 ? '借' : '贷',
			accIsAuxAccCalc: true,  //会计科目，是否启用辅助核算
			// isAuxAccCalc: true,     //期初余额，是否辅助核算项目
			isDetailData: true,     //期初余额，是否辅助核算项目
			accountCode: accountCode,
			accountName: '',
			isEndNode: true,
			cashTypeId: cashTypeId
		}

		for (let item in calcDict) {
			if (calcDict.hasOwnProperty(item) === true) {
				if (item.includes('isExCalc') && accountingSubject[item]) {
					assistList.push(item)
				}
			}
		}

		assistList.sort((a, b) => { //科目期初名称自定义档案排序
			let aNumber = parseInt(a.slice(8))
			let bNumber = parseInt(b.slice(8))
			return a > b
		})

		if (currency) {
			auxItem.currencyId = currency.id
			auxItem.currencyCode = currency.code
			auxItem.currencyName = currency.name
			auxItem.isMultiCalc = true
		}


		auxItem = this.combineItem(auxItem, customer, 'customerId')
		auxItem = this.combineItem(auxItem, supplier, 'supplierId')
		auxItem = this.combineItem(auxItem, project, 'projectId')
		auxItem = this.combineItem(auxItem, department, 'departmentId')
		auxItem = this.combineItem(auxItem, person, 'personId')
		auxItem = this.combineItem(auxItem, inventory, 'inventoryId')

		if (assistList.length != 0) {
			for (let i = 0; i < assistList.length; i++) {
				const num = assistList[i].replace(/[^0-9]/ig, "")
				auxItem = this.combineItem(auxItem, selectedFiles[assistList[i]], `exCalc${num}`)
			}
		}

		if (auxItem.accountCode.substring(0, 1) == '_') {
			auxItem.accountCode = auxItem.accountCode.substring(1)
		}
		if (auxItem.accountName.substring(0, 1) == '_') {
			auxItem.accountName = auxItem.accountName.substring(1)
		}

		if (!!selectedFiles.beginAmount) {
			auxItem.beginAmount = clearThousandsPosition(selectedFiles.beginAmount)
		}
		if (!!selectedFiles.beginAmountDr) {
			auxItem.beginAmountDr = clearThousandsPosition(selectedFiles.beginAmountDr)
		}
		if (!!selectedFiles.beginAmountCr) {//期初借方余额
			auxItem.beginAmountCr = clearThousandsPosition(selectedFiles.beginAmountCr)
		}
		if (!!selectedFiles.beginOrigAmount) {
			auxItem.beginOrigAmount = clearThousandsPosition(selectedFiles.beginOrigAmount)
		}
		if (!!selectedFiles.beginOrigAmountDr) {
			auxItem.beginOrigAmountDr = clearThousandsPosition(selectedFiles.beginOrigAmountDr)
		}
		if (!!selectedFiles.beginOrigAmountCr) {
			auxItem.beginOrigAmountCr = clearThousandsPosition(selectedFiles.beginOrigAmountCr)
		}
		if (!!selectedFiles.beginQuantity) {
			auxItem.beginQuantity = clearThousandsPosition(selectedFiles.beginQuantity)
		}
		if (!!selectedFiles.beginQuantityDr) {
			auxItem.beginQuantityDr = clearThousandsPosition(selectedFiles.beginQuantityDr)
		}
		if (!!selectedFiles.beginQuantityCr) {
			auxItem.beginQuantityCr = clearThousandsPosition(selectedFiles.beginQuantityCr)
		}
		if (!!selectedFiles.quantityCr) {
			auxItem.quantityCr = clearThousandsPosition(selectedFiles.quantityCr)
		}
		if (!!selectedFiles.quantityDr) {
			auxItem.quantityDr = clearThousandsPosition(selectedFiles.quantityDr)
		}
		if (!!selectedFiles.origAmountCr) {
			auxItem.origAmountCr = clearThousandsPosition(selectedFiles.origAmountCr)
		}
		if (!!selectedFiles.origAmountDr) {
			auxItem.origAmountDr = clearThousandsPosition(selectedFiles.origAmountDr)
		}
		if (!!selectedFiles.amountCr) {
			auxItem.amountCr = clearThousandsPosition(selectedFiles.amountCr)
		}
		if (!!selectedFiles.amountDr) {
			auxItem.amountDr = clearThousandsPosition(selectedFiles.amountDr)
		}

		return auxItem
	}

	combineItem = (auxItem, resourceAuxItems, fieldId) => {
		if (resourceAuxItems) {
			if (fieldId == 'personId' || fieldId == 'bankAccountId') {
				auxItem[fieldId] = resourceAuxItems.id
				auxItem.accountCode = auxItem.accountCode + '_' + resourceAuxItems.name
				auxItem.accountName = auxItem.accountName + '_' + resourceAuxItems.name
			} else if (fieldId == 'levyAndRetreatId') {
				auxItem[fieldId] = resourceAuxItems.enumItemId
				auxItem.accountCode = auxItem.accountCode + '_' + resourceAuxItems.enumItemId
				auxItem.accountName = auxItem.accountName + '_' + resourceAuxItems.enumItemName
			} else if (fieldId == 'inputTaxId') {
				auxItem[fieldId] = resourceAuxItems.enumItemId
				auxItem.accountCode = auxItem.accountCode + '_' + resourceAuxItems.enumItemId
				auxItem.accountName = auxItem.accountName + '_' + resourceAuxItems.enumItemName
			} else {
				auxItem[fieldId] = resourceAuxItems.id
				auxItem.accountCode = auxItem.accountCode + '_' + resourceAuxItems.code
				auxItem.accountName = auxItem.accountName + '_' + resourceAuxItems.name

			}
		}

		return auxItem
	}

	//平衡
	renderBanlace = (num) => {
		const tryCacuBalance = this.metaAction.gf('data.other.tryCacuBalance').toJS()
		const beginAmountCr = tryCacuBalance.beginAmountCr ? tryCacuBalance.beginAmountCr : 0
		const beginAmountDr = tryCacuBalance.beginAmountDr ? tryCacuBalance.beginAmountDr : 0
		const yearBeginAmountCr = tryCacuBalance.yearBeginAmountCr ? tryCacuBalance.yearBeginAmountCr : 0
		const yearBeginAmountDr = tryCacuBalance.yearBeginAmountDr ? tryCacuBalance.yearBeginAmountDr : 0

		if (num == 1) {
			if (parseFloat(beginAmountDr) > parseFloat(beginAmountCr)) {
				const value = <span>期初: 借{addThousandsPosition(beginAmountDr.toFixed(2))} <span id='pingheng1' style={{ color: 'red' }}>&gt;</span> 贷{addThousandsPosition(beginAmountCr.toFixed(2))}</span>
				return value
			} else {
				if (parseFloat(beginAmountDr) == parseFloat(beginAmountCr)) {
					const value = <span>期初: 借{addThousandsPosition(beginAmountDr.toFixed(2))} <span id='pingheng1'>=</span> 贷{addThousandsPosition(beginAmountCr.toFixed(2))}</span>
					return value
				} else {
					const value = <span>期初: 借{addThousandsPosition(beginAmountDr.toFixed(2))} <span id='pingheng1' style={{ color: 'red' }}>&lt;</span> 贷{addThousandsPosition(beginAmountCr.toFixed(2))}</span>
					return value
				}
			}
		} else if (num == 2) {
			if (parseFloat(yearBeginAmountDr) > parseFloat(yearBeginAmountCr)) {
				const value = <span>年初: 借{addThousandsPosition(yearBeginAmountDr.toFixed(2))} <span id='pingheng2' style={{ color: 'red' }}>&gt;</span> 贷{addThousandsPosition(yearBeginAmountCr.toFixed(2))}</span>
				return value
			} else {
				if (parseFloat(yearBeginAmountDr) == parseFloat(yearBeginAmountCr)) {
					const value = <span>年初: 借{addThousandsPosition(yearBeginAmountDr.toFixed(2))} <span id='pingheng2'>=</span> 贷{addThousandsPosition(yearBeginAmountCr.toFixed(2))}</span>
					return value
				} else {
					const value = <span>年初: 借{addThousandsPosition(yearBeginAmountDr.toFixed(2))} <span id='pingheng2' style={{ color: 'red' }}>&lt;</span> 贷{addThousandsPosition(yearBeginAmountCr.toFixed(2))}</span>
					return value
				}
			}
		}
	}

	//点击导入
	onClickLeadIn = async () => {
		const result = await this.metaAction.modal('show', {
			title: <div style={{ fontSize: '16px', fontWeight: '500' }}>导入</div>,
			width: 400,
			height: 500,
			okText: '导入期初',
			children: this.metaAction.loadApp('app-account-beginbalance-leadIn', {
				store: this.component.props.store,
				columnCode: "common",
				callbackAction: this.handlerLeadInResult
			}),
		})
		if (result) {
			let accountType = this.metaAction.gf('data.filter.targetKey'),
				selectedYear = this.metaAction.gf('data.other.year').get('id')

			// this.injections.reduce('isShowLoading', true)
			//
			// this.metaAction.sf('data.filter.isCalcMulti', false)
			// this.metaAction.sf('data.filter.isCalcQuantity', false)

			let other = [
					{ path: 'data.other.isLoading', value: true },
					{ path: 'data.filter.isCalcMulti', value: false },
					{ path: 'data.filter.isCalcQuantity', value: false }
			]
			this.injections.reduce('updateArr', other)

			const res = this.loadBalanceData(accountType, selectedYear)

			res.then(() => {
				// this.injections.reduce('isShowLoading', false)
				this.injections.reduce('update', { path: 'data.other.isLoading', value: false })
			})
		}
	}

	resetAccountPeriodBegin = async () => {
		const response = await this.webapi.clearImportDate({})

		if (response) {
			this.metaAction.toast('success', '科目期初重置完成')
			let accountType = this.metaAction.gf('data.filter.targetKey'),
				selectedYear = this.metaAction.gf('data.other.year').get('id')
			this.loadBalanceData(accountType, selectedYear)
		}
	}

	handlerLeadInResult = () => {
		let accountType = this.metaAction.gf('data.filter.targetKey'),
			selectedYear = this.metaAction.gf('data.other.year').get('id')

		// this.injections.reduce('isShowLoading', true)
		//
		// this.metaAction.sf('data.filter.isCalcMulti', false)
		// this.metaAction.sf('data.filter.isCalcQuantity', false)

		let other = [
				{ path: 'data.other.isLoading', value: true },
				{ path: 'data.filter.isCalcMulti', value: false },
				{ path: 'data.filter.isCalcQuantity', value: false }
		]
		this.injections.reduce('updateArr', other)

		const res = this.loadBalanceData(accountType, selectedYear)

		res.then(() => {
			// this.injections.reduce('isShowLoading', false)
			this.injections.reduce('update', { path: 'data.other.isLoading', value: false })
		})
	}

	// 点击调整启用月份
	changeEnabledPeriod = async (value) => {
		const selectYear = value.split('-')[0]
		const selectMonth = value.split('-')[1]
		const ts = this.metaAction.gf('data.other.ts') ? this.metaAction.gf('data.other.ts') : ''
		const obj = {}
		obj.year = selectYear
		obj.period = Number(selectMonth.split('月')[0])
		obj.isReturnValue = true
		obj.ts = ts
		const res = await this.webapi.updatePeriod(obj)
		if (!res.error) {
			this.metaAction.toast('success', '启用期间调整成功')

			let other = [
					{ path: 'data.other.ts', value: res.ts }
			]
			// this.metaAction.sf('data.other.ts', res.ts)
			const obj = this.metaAction.context.get("currentOrg")
			obj.enabledMonth = Number(selectMonth.split('月')[0])
			obj.enabledYear = selectYear
			this.metaAction.context.set("currentOrg", obj)
			// this.metaAction.sf('data.other.settedPeriod', `${res.enabledYear}-${res.enabledMonth}`)
			other.push({ path: 'data.other.settedPeriod', value: `${res.enabledYear}-${res.enabledMonth}` })
			let accountType = this.metaAction.gf('data.filter.targetKey')
			this.injections.reduce('isShowLoading', true)
			// this.metaAction.sfs({
			// 	'data.filter.isCalcMulti': false,
			// 	'data.filter.isCalcQuantity': false,
			// 	'data.other.notShowNextTime': false
			// })
			other.push({ path: 'data.other.settedPeriod', value: `${res.enabledYear}-${res.enabledMonth}` })

			// this.component.props.onPortalReload && this.component.props.onPortalReload()
			let key = this.metaAction.gf('data.other.accountFlowBalancePageSwitch')
			if (key == data.PERIODBEGIN_ACCOUNTPERIODBEGIN) {
				await this.bigTabChange(data.PERIODBEGIN_ACCOUNTPERIODBEGIN)
			} else if (key == data.PERIODBEGIN_CASHFLOWPERIODBEGIN) {
				if (obj.enabledMonth == 1) {
					await this.bigTabChange(data.PERIODBEGIN_ACCOUNTPERIODBEGIN)
				} else {
					await this.bigTabChange(data.PERIODBEGIN_ACCOUNTPERIODBEGIN)
				}
			}
			this.injections.reduce('isShowLoading', false)
			return selectYear
		} else if (res.error) {
			this.metaAction.toast('error', res.error.message)
			return false
		}
	}

	renderSpan = (name, value) => {
		return <div className='ttk-gl-app-finance-periodbegin-tableClass' title={value}>{value}</div>
	}

	// 名称列
	renderNameColumn = (fieldName, value, index) => {
		if (fieldName == 'accountCode') {
				return <div className='ttk-gl-app-finance-periodbegin-renderNameDiv' title={value[fieldName]}>{value[fieldName]}</div>
		} else {
				switch (value.accountGrade) {
					case 1:
						return <div className='ttk-gl-app-finance-periodbegin-renderNameDiv' title={value[fieldName]}>{value[fieldName]}</div>
					case 2:
						return <div style={{ paddingLeft: '15px' }} className='ttk-gl-app-finance-periodbegin-renderNameDiv' title={value[fieldName]}>{value[fieldName]}</div>
					case 3:
						return <div style={{ paddingLeft: '30px' }} className='ttk-gl-app-finance-periodbegin-renderNameDiv' title={value[fieldName]}>{value[fieldName]}</div>
					case 4:
						return <div style={{ paddingLeft: '45px' }} className='ttk-gl-app-finance-periodbegin-renderNameDiv' title={value[fieldName]}>{value[fieldName]}</div>
					case 5:
						return <div style={{ paddingLeft: '60px' }} className='ttk-gl-app-finance-periodbegin-renderNameDiv' title={value[fieldName]}>{value[fieldName]}</div>
					case '':
						return <div className='ttk-gl-app-finance-periodbegin-renderNameDiv' title={value[fieldName]}>{value[fieldName]}</div>
					default: return <div className='ttk-gl-app-finance-periodbegin-renderNameDiv' title={value[fieldName]}>{value[fieldName]}</div>
				}
		}
	}

	getReInitContent = () => {
		if (this.isShowResetBtn('reInit') == true) {
			return (
				<div className='reinit' onClick={() => this.rePeriodBeginInit()}>
					<Icon type="zhongxinchushihua" fontFamily='edficon' />
					<span>重新初始化</span>
				</div>
			)
		} else {
			return (
				<div></div>
			)
		}
	}

	isShowResetBtn = (btnType) => {
		let isShow = false

		if (btnType == 'reset') {
			if (this.component.props &&
				this.component.props.appExtendParams &&
				this.component.props.appExtendParams.key == 'manualEentry') {
				isShow = true
			}
		} else if (btnType == 'reInit') {
			if (this.component.props &&
				this.component.props.appExtendParams == undefined) {
				isShow = true
			}
		}

		return isShow
	}

	isTabDisplay = (tabName) => {
		let accountingStandards = this.metaAction.gf('data.other.accountingStandards'),
			isDisplay = true

		if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
			// 共同 权益 成本 损益
			if (tabName == 'common' || tabName == 'rightsInterests' || tabName == 'cost' || tabName == 'profitLoss') {
				isDisplay = true
				// 净资产 收入 费用
			} else if (tabName == 'netAssets' || tabName == 'income' || tabName == 'expenses') {
				isDisplay = false
			}
		} else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
			// 权益 成本 损益
			if (tabName == 'rightsInterests' || tabName == 'cost' || tabName == 'profitLoss') {
				isDisplay = true
				// 共同 净资产 收入 费用
			} else if (tabName == 'common' || tabName == 'netAssets' || tabName == 'income' || tabName == 'expenses') {
				isDisplay = false
			}
		} else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
			// 共同 权益 成本 损益
			if (tabName == 'common' || tabName == 'rightsInterests' || tabName == 'cost' || tabName == 'profitLoss') {
				isDisplay = false
				// 净资产 收入 费用
			} else if (tabName == 'netAssets' || tabName == 'income' || tabName == 'expenses') {
				isDisplay = true
			}
		}

		return isDisplay
	}


	//*******************以下为现金流量期初的脚本*******************
	//装载现金流量期初数据
	loadCFPeriodBegin = async () => {
		let period = `${this.metaAction.context.get("currentOrg").enabledYear}年${this.metaAction.context.get("currentOrg").enabledMonth}月`
		let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards
		let list = await this.webapi.cashflowstatement.periodBeginInit()

		list.accountingStandards = accountingStandards
		this.injections.reduce('loadCFPeriodBegin', list, period)
		setTimeout(() => {
			this.setCashFlowScroll()
		}, 100)
	}

	renderCashFlowPBColumns = (columnName, v, path, rowIndex) => {
		let list = this.metaAction.gf('data.cashflowlist'),
			text = list ? list.get(rowIndex).get(columnName) : '',
			oldValue = list ? list.get(rowIndex).get(columnName) : '',
			canEdit = this.metaAction.gf('data.canEdit'),
			isEdit = list ? list.get(rowIndex).get('canEdit') : undefined

		let editable
		let row = list.get(rowIndex).get('rowNo')
		if (this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {

			if (!row || row == '4' || row == '9' || row == '10' || row == '16' || row == '21' || row == '22' || row == '26' || row == '30' || row == '31') {
				editable = false
			} else {
				editable = true
			}

			if (row) {
				return (
					<CashFlowEditableCell
						disabled={!canEdit}
						editable={editable}
						customAttribute={this.customAttribute}
						value={text ? addThousandsPosition(parseFloat(text).toFixed(2)) : ''}
						onBlur={(value) => this.handleCashFlowBlur(rowIndex, columnName, value)}
					/>
				)
			} else {
				return
			}

		} else if (this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
			if (!row || row == '7' || row == '13' || row == '19') {
				editable = false
			} else {
				editable = true
			}

			if (row) {
				return (

					<CashFlowEditableCell
						disabled={!canEdit}
						editable={editable}
						customAttribute={this.customAttribute}
						value={text ? addThousandsPosition(parseFloat(text).toFixed(2)) : ''}
						onBlur={(value) => this.handleCashFlowBlur(rowIndex, columnName, value)}
					/>
				)
			} else {
				return
			}
		} else {
			if (isEdit && isEdit == true) {
				editable = true
			} else {
				editable = false
			}
			return (

				<EditableCell
					disabled={!canEdit}
					editable={editable}
					customAttribute={this.customAttribute}
					value={text ? addThousandsPosition(parseFloat(text).toFixed(2)) : ''}
					onBlur={(value) => this.handleCashFlowBlur(rowIndex, columnName, value)}
				/>
			)
		}
	}

	handleCashFlowBlur = (rowIndex, columnName, value) => {
		let list = this.metaAction.gf('data.cashflowlist'),
			oldValue = list.get(rowIndex).get(columnName),
			newValue = value

		list = list.update(rowIndex, item => item.set(columnName, newValue))
		this.customAttribute = Math.random()
		if (newValue > 9999999999.99) {
			newValue = undefined

			list = list.update(rowIndex, item => {
				item = item.set(columnName, newValue)
				return item
			})
			// this.metaAction.sf('data.cashflowlist', list)
			this.injections.reduce('update', { path: 'data.cashflowlist', value: list })
			this.metaAction.toast('warning', `金额不能大于9999999999.99，请调整`)
			return
		}
		if (newValue < -9999999999.99) {
			newValue = undefined
			list = list.update(rowIndex, item => {
				item = item.set(columnName, newValue)
				return item
			})
			// this.metaAction.sf('data.cashflowlist', list)
			this.injections.reduce('update', { path: 'data.cashflowlist', value: list })

			this.metaAction.toast('warning', `金额不能小于-9999999999.99，请调整`)
			return
		}
		if (this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
			let listFour = parseFloat(parseFloat(list.get(1).get(columnName) || 0).toFixed(2)) + parseFloat(parseFloat(list.get(2).get(columnName) || 0).toFixed(2)) + parseFloat(parseFloat(list.get(3).get(columnName) || 0).toFixed(2))

			list = list.update(4, item =>
				item.set(columnName, listFour != '' ? listFour.toFixed(2) : '')
			)
			let listNine = parseFloat(parseFloat(list.get(5).get(columnName) || 0).toFixed(2)) + parseFloat(parseFloat(list.get(6).get(columnName) || 0).toFixed(2)) + parseFloat(parseFloat(list.get(7).get(columnName) || 0).toFixed(2)) + parseFloat(parseFloat(list.get(8).get(columnName) || 0).toFixed(2))
			list = list.update(9, item =>
				item.set(columnName, listNine != '' ? listNine.toFixed(2) : '')
			)
			list = list.update(10, item =>
				item.set(columnName, (listFour - listNine) != '' ? (listFour - listNine).toFixed(2) : '')
			)
			let listSixteen = parseFloat(parseFloat(list.get(12).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(13).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(14).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(15).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(16).get(columnName) || 0).toFixed(2))
			list = list.update(17, item =>
				item.set(columnName, listSixteen != '' ? listSixteen.toFixed(2) : '')
			)
			let listTwentyOne = parseFloat(parseFloat(list.get(18).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(19).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(20).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(21).get(columnName) || 0).toFixed(2))
			list = list.update(22, item =>
				item.set(columnName, listTwentyOne != '' ? listTwentyOne.toFixed(2) : '')
			)
			let listTwentyTwo = listSixteen - listTwentyOne
			list = list.update(23, item =>
				item.set(columnName, listTwentyTwo != '' ? listTwentyTwo.toFixed(2) : '')
			)
			let listTwentySix = parseFloat(parseFloat(list.get(25).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(26).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(27).get(columnName) || 0).toFixed(2))

			list = list.update(28, item =>
				item.set(columnName, listTwentySix != '' ? listTwentySix.toFixed(2) : '')
			)
			let listThirty = parseFloat(parseFloat(list.get(29).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(30).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(31).get(columnName) || 0).toFixed(2))

			list = list.update(32, item =>
				item.set(columnName, listThirty != '' ? listThirty.toFixed(2) : '')
			)
			let listThirtyOne = listTwentySix - listThirty
			list = list.update(33, item =>
				item.set(columnName, listThirtyOne != '' ? listThirtyOne.toFixed(2) : '')
			)
			//this.metaAction.sf('data.cashflowlist', list)
		} else if (this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
			let listSeven = parseFloat(parseFloat(list.get(1).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(2).get(columnName) || 0).toFixed(2))
				- parseFloat(parseFloat(list.get(3).get(columnName) || 0).toFixed(2))
				- parseFloat(parseFloat(list.get(4).get(columnName) || 0).toFixed(2))
				- parseFloat(parseFloat(list.get(5).get(columnName) || 0).toFixed(2))
				- parseFloat(parseFloat(list.get(6).get(columnName) || 0).toFixed(2))

			list = list.update(7, item =>
				item.set(columnName, listSeven != '' ? listSeven.toFixed(2) : '')
			)
			let listThirteen = parseFloat(parseFloat(list.get(9).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(10).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(11).get(columnName) || 0).toFixed(2))
				- parseFloat(parseFloat(list.get(12).get(columnName) || 0).toFixed(2))
				- parseFloat(parseFloat(list.get(13).get(columnName) || 0).toFixed(2))


			list = list.update(14, item =>
				item.set(columnName, listThirteen != '' ? listThirteen.toFixed(2) : '')
			)
			let listNinteen = parseFloat(parseFloat(list.get(16).get(columnName) || 0).toFixed(2))
				+ parseFloat(parseFloat(list.get(17).get(columnName) || 0).toFixed(2))
				- parseFloat(parseFloat(list.get(18).get(columnName) || 0).toFixed(2))
				- parseFloat(parseFloat(list.get(19).get(columnName) || 0).toFixed(2))
				- parseFloat(parseFloat(list.get(20).get(columnName) || 0).toFixed(2))

			list = list.update(21, item =>
				item.set(columnName, listNinteen != '' ? listNinteen.toFixed(2) : '')
			)
			//this.metaAction.sf('data.cashflowlist', list)
		} else {
			let listOneIndex = list.findIndex(o => o.get('rowNo') == 1),
				listTwoIndex = list.findIndex(o => o.get('rowNo') == 2),
				listThreeIndex = list.findIndex(o => o.get('rowNo') == 3),
				listFourIndex = list.findIndex(o => o.get('rowNo') == 4),
				listFiveIndex = list.findIndex(o => o.get('rowNo') == 5),
				listEightIndex = list.findIndex(o => o.get('rowNo') == 8),
				listThirteenIndex = list.findIndex(o => o.get('rowNo') == 13),
				listForteenIndex = list.findIndex(o => o.get('rowNo') == 14),
				listFiveteenIndex = list.findIndex(o => o.get('rowNo') == 15),
				listSixteenIndex = list.findIndex(o => o.get('rowNo') == 16),
				listNineteenIndex = list.findIndex(o => o.get('rowNo') == 19),
				listTwentythreeIndex = list.findIndex(o => o.get('rowNo') == 23),
				listTwentyfourIndex = list.findIndex(o => o.get('rowNo') == 24),
				listTwentyfiveIndex = list.findIndex(o => o.get('rowNo') == 25),
				listTwentysixIndex = list.findIndex(o => o.get('rowNo') == 26),
				listTwentysevenIndex = list.findIndex(o => o.get('rowNo') == 27),
				listThirtyIndex = list.findIndex(o => o.get('rowNo') == 30),
				listThirtyfourIndex = list.findIndex(o => o.get('rowNo') == 34),
				listThirtyfiveIndex = list.findIndex(o => o.get('rowNo') == 35),
				listThirtysixIndex = list.findIndex(o => o.get('rowNo') == 36),
				listThirtynineIndex = list.findIndex(o => o.get('rowNo') == 39),
				listFortythreeIndex = list.findIndex(o => o.get('rowNo') == 43),
				listFortyfourIndex = list.findIndex(o => o.get('rowNo') == 44),
				listFortyfiveIndex = list.findIndex(o => o.get('rowNo') == 45),
				listFortyeightIndex = list.findIndex(o => o.get('rowNo') == 48),
				listFiftyIndex = list.findIndex(o => o.get('rowNo') == 50),
				listFiftyoneIndex = list.findIndex(o => o.get('rowNo') == 51),
				listFiftytwoIndex = list.findIndex(o => o.get('rowNo') == 52),
				listFiftyfiveIndex = list.findIndex(o => o.get('rowNo') == 55),
				listFiftyeightIndex = list.findIndex(o => o.get('rowNo') == 58),
				listFiftynineIndex = list.findIndex(o => o.get('rowNo') == 59),
				listSixtyIndex = list.findIndex(o => o.get('rowNo') == 60),
				listSixtyoneIndex = list.findIndex(o => o.get('rowNo') == 61),
				listThirteen = parseFloat(parseFloat(list.get(listOneIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listTwoIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listThreeIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listFourIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listFiveIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listEightIndex).get(columnName) || 0).toFixed(2)),
				listTwentythree = parseFloat(parseFloat(list.get(listForteenIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listFiveteenIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listSixteenIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listNineteenIndex).get(columnName) || 0).toFixed(2)),
				listTwentyfour = listThirteen
					- listTwentythree,
				listThirtyfour = parseFloat(parseFloat(list.get(listTwentyfiveIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listTwentysixIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listTwentysevenIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listThirtyIndex).get(columnName) || 0).toFixed(2)),
				listFortythree = parseFloat(parseFloat(list.get(listThirtyfiveIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listThirtysixIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listThirtynineIndex).get(columnName) || 0).toFixed(2)),
				listFortyfour = listThirtyfour
					- listFortythree,
				listFifty = parseFloat(parseFloat(list.get(listFortyfiveIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listFortyeightIndex).get(columnName) || 0).toFixed(2)),
				listFiftyeight = parseFloat(parseFloat(list.get(listFiftyoneIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listFiftytwoIndex).get(columnName) || 0).toFixed(2))
					+ parseFloat(parseFloat(list.get(listFiftyfiveIndex).get(columnName) || 0).toFixed(2)),
				listFiftynine = parseFloat(parseFloat(list.get(listFiftyIndex).get(columnName) || 0).toFixed(2))
					- listFiftyeight,
				listSixtyone = listFifty
					+ listFortyfour
					+ listFiftynine
					+ parseFloat(parseFloat(list.get(listSixtyIndex).get(columnName) || 0).toFixed(2))
			list = list.update(listThirteenIndex, item =>
				item.set(columnName, listThirteen != '' ? listThirteen.toFixed(2) : '')
			)
			list = list.update(listTwentythreeIndex, item =>
				item.set(columnName, listTwentythree != '' ? listTwentythree.toFixed(2) : '')
			)
			list = list.update(listTwentyfourIndex, item =>
				item.set(columnName, listTwentyfour != '' ? listTwentyfour.toFixed(2) : '')
			)
			list = list.update(listThirtyfourIndex, item =>
				item.set(columnName, listThirtyfour != '' ? listThirtyfour.toFixed(2) : '')
			)
			list = list.update(listFortythreeIndex, item =>
				item.set(columnName, listFortythree != '' ? listFortythree.toFixed(2) : '')
			)
			list = list.update(listFortyfourIndex, item =>
				item.set(columnName, listFortyfour != '' ? listFortyfour.toFixed(2) : '')
			)
			list = list.update(listFiftyIndex, item =>
				item.set(columnName, listFifty != '' ? listFifty.toFixed(2) : '')
			)
			list = list.update(listFiftyeightIndex, item =>
				item.set(columnName, listFiftyeight != '' ? listFiftyeight.toFixed(2) : '')
			)
			list = list.update(listFiftynineIndex, item =>
				item.set(columnName, listFiftynine != '' ? listFiftynine.toFixed(2) : '')
			)
			list = list.update(listSixtyoneIndex, item =>
				item.set(columnName, listSixtyone != '' ? listFiftynine.toFixed(2) : '')
			)

		}

		this.save(list.toJS())
	}

	save = async (list) => {
		//let list = this.metaAction.gf('data.cashflowlist')?this.metaAction.gf('data.cashflowlist').toJS():[]
		let data = this.checkSave(list),
			checkStyle = { textAlign: 'right', fontSize: '12px', display: 'inline-block', verticalAlign: 'top' }

		if (data.msg.length > 0) {
			this.metaAction.toast('warning',
				<div style={checkStyle}>
					{data.msg.map(o => <p style={{ marginBottom: '0' }}>{o}</p>)}
				</div>
			)
			// this.metaAction.sf('data.cashflowlist', list)
			this.injections.reduce('update', { path: 'data.cashflowlist', value: list })

			return
		}

		if (list.length) {
			let response = await this.webapi.cashflowstatement.save(data.listArr)

			this.metaAction.toast('success', '现金流量期初更新成功')
			this.loadCFPeriodBegin()
		}
	}

	checkSave = (list) => {
		let msg = [], allItemEmpty = true, listArr = []

		list.forEach((item, i) => {
			if (!item || (!item.voucherDate && !item.cashFlowItem && !item.amount)) {
				return
			}

			if (item.cashFlowItem && item.amount) {
				listArr.push({
					// voucherDate: date,
					cashFlowItemId: item.cashFlowItem && item.cashFlowItem.id,
					amount: item.amount
				})
			}

			allItemEmpty = false

			let emptyItemNames = List()

			if (!item.voucherDate) {
				emptyItemNames = emptyItemNames.push('日期')
			}

			if (!item.cashFlowItem) {
				emptyItemNames = emptyItemNames.push('项目')
			}

			if (!item.amount) {
				emptyItemNames = emptyItemNames.push('金额')
			}

			if (emptyItemNames.size > 0) {
				let rowError
				if (emptyItemNames.size > 2) {
					rowError = "日期、项目和金额"
				} else if (emptyItemNames.size == 2) {
					rowError = emptyItemNames.get(0) + '和' + emptyItemNames.get(1)
				} else {
					rowError = emptyItemNames.get(0)
				}

				return
			}
		})

		return { msg, listArr }
	}

	resetCashFlowPeriodBegin = async () => {
		const response = await this.webapi.cashflowstatement.resetCashFlowPeriodBegin({})

		if (response) {
			this.metaAction.toast('success', '现金流量期初重置完成')
			this.loadCFPeriodBegin()
		}
	}

	setCashFlowScroll = () => {
		const cashflowontent = document.getElementById('ttk-gl-app-finance-periodbegin-cashflowperiodbeginpage-cashflowcontent-id')
		const cashflowontentHeight = cashflowontent.offsetHeight

		this.injections.reduce('setCashFlowScroll', cashflowontentHeight - 40)
	}

	getTableClassName = () => {
		let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards,
			className = ''

		if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
			className = 'app-cashflowstatement-rpt-table-tbody smallOrgTable'
		} else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
			className = 'app-cashflowstatement-rpt-table-tbody orgTable'
		} else {
			className = 'app-cashflowstatement-rpt-table-tbody nonProfitOrgTable'
		}

		return className
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		o = new action({ ...option, metaAction })

	const ret = { ...metaAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}
const EditableCell = ({ editable, errorStatus, value, onBlur, onEnter, onkeydown, customAttribute, disabled, rowIndex, columnName }) => {
	let regex, className = ''
	if (columnName == 'beginQuantityDr' || columnName == 'beginQuantityCr' || columnName == 'quantityDr' || columnName == 'quantityCr') {
		regex = '^(-?[0-9]+)(?:\.[0-9]{1,6})?$'
	} else {
		regex = '^(-?[0-9]+)(?:\.[0-9]{1,2})?$'
	}
	const getclassName = () => {
		if (errorStatus) {
			className += 'errorStatus '
		} else {
			className += ''
		}
		if (columnName == 'beginAmount' && rowIndex == 2) {
			className += 'ttk-gl-app-finance-periodbegin-tableClass stepShowRowIndex '
		} else {
			className += 'ttk-gl-app-finance-periodbegin-tableClass '
		}
		return className
	}

	return (
		<div style={{ textAlign: 'right' }}>
			{editable
				? <Input.Number
					style={{ margin: '-5px 0' }}
					customAttribute={customAttribute}
					className={getclassName()}
					// className={(columnName == 'beginAmount' && rowIndex == 2) ? 'ttk-gl-app-finance-periodbegin-tableClass stepShowRowIndex' : 'ttk-gl-app-finance-periodbegin-tableClass'}
					onPressEnter={(e) => onEnter(e)}
					value={value}
					disabled={disabled}
					title={value}
					onBlur={(value) => onBlur(value)}
					// errorStatus = {errorStatus}
					regex={regex}
				/>

				: <div className='ttk-gl-app-finance-periodbegin-tableClass' title={value}>{value}</div>
			}
		</div>
	)
}

const CashFlowEditableCell = ({ editable, value, onBlur, customAttribute, disabled }) => (
	<div style={{ textAlign: 'right' }}>
		{editable
			? <Input.Number style={{ margin: '-5px 0', textAlign: 'right' }} className='ttk-gl-app-finance-periodbegin-tableClass'
				value={value}
				disabled={disabled}
				customAttribute={customAttribute}
				onBlur={(value) => onBlur(value)} regex='^(-?[0-9]+)(?:\.[0-9]{1,2})?$' />
			: <div className='ttk-gl-app-finance-periodbegin-tableClass'>{value}</div>
		}
	</div>
)

const addThousandsPosition = (input, isFixed) => {
	if (isNaN(input)) return null
	let num

	if (isFixed) {
		num = parseFloat(input).toFixed(2)
	} else {
		num = input.toString()
	}
	let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g

	return num.replace(regex, "$1,")
}
