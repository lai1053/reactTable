import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import utils from 'edf-utils'
import { getInitState, addThousandsPosition, clearThousandsPosition, combineAuxItemContent, ACCOUNTTYPE_PROFITANDLOSS } from './data'

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer
	}

	init = (state, option = {}) => {
		const initState = getInitState()
		initState.data.other.stepEnabled = false //option.isGuide

		return this.metaReducer.init(state, initState)
	}

	//期初余额
	initBalanceView = (state, initData, selectedYear, settedPeriod, enabledPeriod, accountingStandards, accountType, calcDict, haveMonthlyClosing, other, tableOption) => {
		state = this.updateArr(state, other)

		let list = this.formatBeginBalances(initData.dataList)
		let customDecideDisVisibleList = []

		state = this.metaReducer.sf(state, 'data.list', fromJS(list))
		state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(initData.columnDto.columnDetails))
		state = this.metaReducer.sf(state, 'data.other.code', fromJS(initData.columnDto.code))
		state = this.metaReducer.sf(state, 'data.balanceCheckList', fromJS(initData.balanceCheckList))
		state = this.metaReducer.sf(state, 'data.other.notShowNextTime', initData.notShowNextTime)
		state = this.metaReducer.sf(state, 'data.other.enabledPeriod', `启用月份:${enabledPeriod.enabledYear}年${enabledPeriod.enabledMonth}月`)
		state = this.metaReducer.sf(state, 'data.other.enabledYear', enabledPeriod.enabledYear)
		state = this.metaReducer.sf(state, 'data.other.disabledDate', enabledPeriod.enabledMonth)
		state = this.metaReducer.sf(state, 'data.other.calcDict', calcDict)
		state = this.metaReducer.sf(state, 'data.other.accountingStandards', accountingStandards)
		state = this.metaReducer.sf(state, 'data.other.ts', enabledPeriod.ts)
		state = this.metaReducer.sf(state, 'data.other.settedPeriod', settedPeriod)
		state = this.metaReducer.sf(state, 'data.other.haveMonthlyClosing', haveMonthlyClosing)
		state = this.metaReducer.sf(state, 'data.pagination', fromJS(initData.page))
		if(initData.columnDto.columnDetails){
			initData.columnDto.columnDetails.map(o => {
				if(o.customDecideVisible == false){
					customDecideDisVisibleList.push({
						fieldName: o.fieldName,
						width: o.width,
						isVisible: o.customDecideVisible,
						customDecideVisible: o.customDecideVisible
					})
				}
			})
		}
		state = this.metaReducer.sf(state, 'data.other.customDecideDisVisibleList', fromJS(customDecideDisVisibleList))
		//期初余额试算平衡
		state = this.setBalancePageState(state, initData, selectedYear, enabledPeriod, accountType)

		if(tableOption) {
				state = this.metaReducer.sf(state, 'data.tableOption', tableOption)
		}

		return state
	}

	loadBalanceData = (state, initData, selectedYear, settedPeriod, enabledPeriod, accountingStandards, accountType, calcDict, haveMonthlyClosing, other, tableOption) => {
		if (other) {
				state = this.updateArr(state, other)
		}

		let list = this.formatBeginBalances(initData.dataList)
		let customDecideDisVisibleList = []

		state = this.metaReducer.sf(state, 'data.list', fromJS(list))
		state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(initData.columnDto.columnDetails))
		state = this.metaReducer.sf(state, 'data.other.code', fromJS(initData.columnDto.code))
		state = this.metaReducer.sf(state, 'data.balanceCheckList', fromJS(initData.balanceCheckList))
		state = this.metaReducer.sf(state, 'data.other.notShowNextTime', initData.notShowNextTime)
		state = this.metaReducer.sf(state, 'data.filter.targetKey', String(accountType))
		state = this.metaReducer.sf(state, 'data.other.enabledPeriod', `启用月份:${enabledPeriod.enabledYear}年${enabledPeriod.enabledMonth}月`)
		state = this.metaReducer.sf(state, 'data.other.enabledYear', enabledPeriod.enabledYear)
		state = this.metaReducer.sf(state, 'data.other.disabledDate', enabledPeriod.enabledMonth)
		state = this.metaReducer.sf(state, 'data.other.calcDict', calcDict)
		state = this.metaReducer.sf(state, 'data.other.ts', enabledPeriod.ts)
		state = this.metaReducer.sf(state, 'data.other.settedPeriod', settedPeriod)
		state = this.metaReducer.sf(state, 'data.other.accountingStandards', accountingStandards)
		state = this.metaReducer.sf(state, 'data.pagination', fromJS(initData.page))
		if(initData.columnDto.columnDetails){
			initData.columnDto.columnDetails.map(o => {
				if(o.customDecideVisible == false){
					customDecideDisVisibleList.push({
						fieldName: o.fieldName,
						width: o.width,
						isVisible: o.customDecideVisible,
						customDecideVisible: o.customDecideVisible
					})
				}
			})
		}
		state = this.metaReducer.sf(state, 'data.other.customDecideDisVisibleList', fromJS(customDecideDisVisibleList))

		let isDisplayOnlyAmount = this.getIsDisplayOnlyAmount(state)
		if (isDisplayOnlyAmount) {
			state = this.metaReducer.sf(state, 'data.other.isDisplaySingleRowGrid', true)
		} else {
			state = this.metaReducer.sf(state, 'data.other.isDisplaySingleRowGrid', false)
		}

    let condition = this.metaReducer.gf(state, 'data.other.positionCondition')

	  condition = (condition && condition.trim()) + ''

	  if (condition != '' && condition != 'undefined') {
				state = this.fixPosition(state, condition)
	  }

		state = this.setBalancePageState(state, initData, selectedYear, enabledPeriod, accountType, isDisplayOnlyAmount)

		if(tableOption) {
				state = this.metaReducer.sf(state, 'data.tableOption', tableOption)
		}

		return state
	}

	setBalancePageState = (state, initData, selectedYear, enabledPeriod, accountType, isDisplayOnlyAmount) => {

		let list = this.metaReducer.gf(state, 'data.list'), balanceGridName

		isDisplayOnlyAmount = isDisplayOnlyAmount ? isDisplayOnlyAmount : this.getIsDisplayOnlyAmount(state)
		balanceGridName = isDisplayOnlyAmount ? 'singleRowContent' : 'doubleRowContent'

		state = this.setYear(state, { yearArray: initData.years, currentYear: initData.currentYear }, selectedYear)
		if (selectedYear == undefined) {
			// 设置年度
			selectedYear = initData.currentYear
		}

		state = this.metaReducer.sf(state, 'data.other.tryCacuBalance', Map(initData.PeriodBeginDto))
		//更新state中的启用期间
		state = this.setEnabledPeriod(state, enabledPeriod)

		//控制【调整】按钮是否显示
		state = this.metaReducer.sf(state, 'data.other.isResetVisible', initData.isResetVisible)
		//记录凭证最小保存日期
		state = this.metaReducer.sf(state, 'data.other.minDocVoucherDate', initData.minDocVoucherDate)
		state = this.metaReducer.sf(state, 'data.other.accountType', accountType)

		state = this.metaReducer.sf(state, 'data.other.isDisplayCurrencyName', false)
		//控制数量和外币列显隐
		state = this.metaReducer.sf(state, 'data.other.isDisplayOnlyAmount', isDisplayOnlyAmount)
		state = this.metaReducer.sf(state, 'data.other.canDisplayCurYearDr', true)
		state = this.metaReducer.sf(state, 'data.other.canDisplayCurYearCr', true)
		state = this.metaReducer.sf(state, 'data.other.canDisplayYearBegin', true)
		// 界面年度和启用年度不一致时，不可录入
		// 		只能看期初余额，不能查看本年借方累计、本年贷方累计、年初余额
		if (selectedYear && enabledPeriod && parseInt(selectedYear) != parseInt(enabledPeriod.enabledYear)) {
			//不显示操作列
			state = this.metaReducer.sf(state, 'data.other.isDisplayOperation', false)
			let isNotJanuary = parseInt(enabledPeriod.enabledMonth) != 1
			//不能查看本年借方累计
			// COMMENT 0106 HAOZHAO START
			// if(!isDisplayOnlyAmount){
			// 	//state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr`, 'visible', false)
			// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.quantityDr`, 'visible', isNotJanuary)
			// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.origAmountDr`, 'visible', isNotJanuary)
			// }
			//
			// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.amountDr`, 'visible', isNotJanuary)
			// COMMENT 0106 HAOZHAO END
			//记录本年借方累计不能显示
			state = this.metaReducer.sf(state, 'data.other.canDisplayCurYearDr', isNotJanuary)

			//不能查看本年贷方累计
			// COMMENT 0106 HAOZHAO START
			// if(!isDisplayOnlyAmount){
			// 	//state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr`, 'visible', false)
			// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.quantityCr`, 'visible', isNotJanuary)
			// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.origAmountCr`, 'visible', isNotJanuary)
			// }
			// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.amountCr`, 'visible', isNotJanuary)
			// COMMENT 0106 HAOZHAO END
			//记录本年贷方累计不能显示
			state = this.metaReducer.sf(state, 'data.other.canDisplayCurYearCr', isNotJanuary)

			//不能查看年初余额
			// COMMENT 0106 HAOZHAO START
			// if(!isDisplayOnlyAmount){
			// 	//state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance`, 'visible', false)
			// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance.yearBeginQuantity`, 'visible', isNotJanuary)
			// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance.yearBeginOrigAmount`, 'visible', isNotJanuary)
			// }
			//
			// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance.yearBeginAmount`, 'visible', isNotJanuary)
			// COMMENT 0106 HAOZHAO END
			//记录本年贷方累计不能显示
			state = this.metaReducer.sf(state, 'data.other.canDisplayYearBegin', isNotJanuary)

			// COMMENT 0106 HAOZHAO START
			// if(!isDisplayOnlyAmount){
			// 	state = dr.setter(state, `pages.beginBalances.doubleRowBalanceGrid.quantityCurYearDr`, 'visible', isNotJanuary)
			// 	state = dr.setter(state, `pages.beginBalances.doubleRowBalanceGrid.quantityCurYearCr`, 'visible', isNotJanuary)
			// 	state = dr.setter(state, `pages.beginBalances.doubleRowBalanceGrid.yearBeginBalance`, 'visible', isNotJanuary)
			// }
			// COMMENT 0106 HAOZHAO END
			state = this.metaReducer.sf(state, 'data.other.isNotJanuary', isNotJanuary)

			// 界面年度和启用年度一致时，可录入
			// 		1月份启用，只能录入期初余额
			// 		2月份-12启用，可录入期初余额、本年借方累计、本年贷方累计
		} else if (selectedYear && enabledPeriod && parseInt(selectedYear) == parseInt(enabledPeriod.enabledYear)) {
			//显示操作列
			state = this.metaReducer.sf(state, 'data.other.isDisplayOperation', true)
			let isNotJanuary = parseInt(enabledPeriod.enabledMonth) != 1
			//1月份启用，只能录入期初余额
			if (parseInt(enabledPeriod.enabledMonth) == 1) {
				state = this.metaReducer.sf(state, 'data.other.isDisplayOperation', true)
				//不能查看及录入本年借方累计 0106 COMMENT TODO
				// if(!isDisplayOnlyAmount){
				// 		state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr`, 'visible', false)
				// 		state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.quantityDr`, 'visible', false)
				// 		state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.origAmountDr`, 'visible', false)
				// }
				// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.amountDr`, 'visible', false)
				//记录本年借方累计不能显示
				state = this.metaReducer.sf(state, 'data.other.canDisplayCurYearDr', false)

				//不能查看及录入本年贷方累计 0106 COMMENT TODO
				// if(!isDisplayOnlyAmount){
				// 		state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr`, 'visible', false)
				// 		state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.quantityCr`, 'visible', false)
				// 		state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.origAmountCr`, 'visible', false)
				// }
				// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.amountCr`, 'visible', false)
				//记录本年贷方累计不能显示
				state = this.metaReducer.sf(state, 'data.other.canDisplayCurYearCr', false)

				//不能查看及录入年初余额 0106 COMMENT TODO
				// if(!isDisplayOnlyAmount){
				// 		state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance`, 'visible', false)
				// 		state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance.yearBeginQuantity`, 'visible', false)
				// 		state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance.yearBeginOrigAmount`, 'visible', false)
				// }
				// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance.yearBeginAmount`, 'visible', false)
				//记录本年贷方累计不能显示
				state = this.metaReducer.sf(state, 'data.other.canDisplayYearBegin', false)

				//只让显示初期余额
				state = this.metaReducer.sf(state, 'data.other.isNotJanuary', isNotJanuary)

				//账套第一个年度的启用月是2月份-12月份时，界面提供【期初余额、本年借方累计、本年贷方累计、年初余额】的显示或录入
			} else {
				//不能查看及录入本年借方累计  0106 COMMENT TODO
				// if(!isDisplayOnlyAmount){
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr`, 'visible', true)
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.quantityDr`, 'visible', true)
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.origAmountDr`, 'visible', true)
				// }
				// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.amountDr`, 'visible', true)
				//记录本年借方累计不能显示
				state = this.metaReducer.sf(state, 'data.other.canDisplayCurYearDr', true)

				//不能查看及录入本年贷方累计 0106 COMMENT TODO
				// if(!isDisplayOnlyAmount){
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr`, 'visible', true)
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.quantityCr`, 'visible', true)
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.origAmountCr`, 'visible', true)
				// }
				// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.amountCr`, 'visible', true)
				//记录本年贷方累计不能显示
				state = this.metaReducer.sf(state, 'data.other.canDisplayCurYearCr', true)

				//不能查看及录入年初余额 0106 COMMENT TODO
				// if(!isDisplayOnlyAmount){
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance`, 'visible', true)
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance.yearBeginQuantity`, 'visible', true)
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance.yearBeginOrigAmount`, 'visible', true)
				// }
				// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.yearBeginBalance.yearBeginAmount`, 'visible', true)
				//记录本年贷方累计不能显示
				state = this.metaReducer.sf(state, 'data.other.canDisplayYearBegin', true)

				state = this.metaReducer.sf(state, 'data.other.isNotJanuary', isNotJanuary)
			}
		}

		let isCurrencyAllEmpty = true
		for (let i = 0; i < list.size; i++) {
			// 2.8 非末级科目，系统不提供录入期初余额；由末级科目的期初余额逐级汇总得到；
			// 2.9 带辅助核算的科目，系统只提供对应辅助核算项录入期初余额，不提供对科目本身录入期初余额；辅助核算项的期初余额汇总到科目本身；
			// 2.10外币核算的科目，系统只提供对[外币行]录入期初余额，不提供对科目本身录入期初余额；[外币行]的期初余额汇总到科目本身；
			// 2.11 辅助核算的科目和外币核算的科目，要求以特殊颜色标识；
			let beginBalance = list.get(i)

			//非末级别科目或末级且为非辅助外币明细项目的行，不可录入
			if (!beginBalance.get('isEndNode') ||
				(beginBalance.get('isEndNode') &&
					(beginBalance.get('accIsAuxAccCalc') || beginBalance.get('isMultiCalc')
						|| beginBalance.get('isAuxAccLevyAndRetreat') || beginBalance.get('isAuxAccInputTax'))
					&& !beginBalance.get('isDetailData'))) {

				// if(!isDisplayOnlyAmount){ 0106 COMMENT TODO
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.beginBalance.beginQuantity,` + i,'displayComponent', 'Text')
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.beginBalance.beginOrigAmount,` + i,'displayComponent', 'Text')
				// }
				// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.beginBalance.beginAmount,` + i,'displayComponent', 'Text')
				//
				// if(!isDisplayOnlyAmount){
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.quantityDr,` + i,'displayComponent', 'Text')
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.origAmountDr,` + i,'displayComponent', 'Text')
				// }
				// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearDr.amountDr,` + i,'displayComponent', 'Text')
				//
				// if(!isDisplayOnlyAmount){
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.quantityCr,` + i,'displayComponent', 'Text')
				// 	state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.origAmountCr,` + i,'displayComponent', 'Text')
				// }
				// state = dr.setter(state, `pages.beginBalances.${balanceGridName}.quantityCurYearCr.amountCr,` + i,'displayComponent', 'Text')
			}

			if (isCurrencyAllEmpty &&
				beginBalance.get('currencyName') != undefined &&
				beginBalance.get('currencyName') != '') {

				isCurrencyAllEmpty = false
			}

		}

		if (!isCurrencyAllEmpty) {
			state = this.metaReducer.sf(state, 'data.other.isDisplayCurrencyName', true)
		}

		return state
	}

	resetBalance = (state, rowIndex, curColumnName, oldValue, newValue) => {
		if (Number(oldValue) == 0) {
			newValue = undefined
		} else {
			newValue = oldValue
		}

		let list = this.metaReducer.gf(state, 'data.list')

		list = list.update(rowIndex, item => {
			item = item.set(curColumnName, newValue)
			return item
		})

		return this.metaReducer.sf(state, 'data.list', fromJS(list))
	}

	getIsDisplayOnlyAmount = (state) => {
		let curIsCalcQuantity = this.metaReducer.gf(state, 'data.filter.isCalcQuantity')
		let curIsCalcMulti = this.metaReducer.gf(state, 'data.filter.isCalcMulti')

		//当数量和外币Checkbox都未选中时，则只显示本币金额
		return (!curIsCalcQuantity && !curIsCalcMulti)
	}

	//保存启用期间
	setEnabledPeriod = (state, enabledPeriod) => {
		state = this.metaReducer.sf(state, 'data.other.enabledYear', enabledPeriod.enabledYear)
		return this.metaReducer.sf(state, 'data.other.enabledMonth', enabledPeriod.enabledMonth)
	}

	// 设置年度
	setYear = (state, time, selectedYear) => {
		let yearList = time.yearArray,
			currentYear = time.currentYear,
			dataSource = []

		for (let i = 0; i < yearList.length; i++) {
			dataSource.push({ id: yearList[i], name: yearList[i] })
		}

		state = this.metaReducer.sf(state, 'data.other.yearList', fromJS(dataSource))
		if (!selectedYear) {
			state = this.metaReducer.sf(state, 'data.other.year', Map({ id: currentYear, name: currentYear }))
		} else {
			state = this.metaReducer.sf(state, 'data.other.year', Map({ id: selectedYear, name: selectedYear }))
		}
		return state
	}

	//格式化数量金额及补零操作
	formatBeginBalances = (balanceList) => {
		balanceList.map(item => {
			//期初余额
			item.beginQuantityCr = (item.beginQuantityCr == undefined) || item.beginQuantityCr == 0
				? '' : utils.number.format(item.beginQuantityCr, 6)
			item.beginQuantityDr = (item.beginQuantityDr == undefined) || item.beginQuantityDr == 0
			? '' : utils.number.format(item.beginQuantityDr, 6)
			item.beginOrigAmountDr = (item.beginOrigAmountDr == undefined) || item.beginOrigAmountDr == 0
				? '' : addThousandsPosition(item.beginOrigAmountDr, true)
			item.beginOrigAmountCr = (item.beginOrigAmountCr == undefined) || item.beginOrigAmountCr == 0
			? '' : addThousandsPosition(item.beginOrigAmountCr, true)
			item.beginAmountDr = (item.beginAmountDr == undefined) || item.beginAmountDr == 0
				? '' : addThousandsPosition(item.beginAmountDr, true)
			item.beginAmountCr = (item.beginAmountCr == undefined) || item.beginAmountCr == 0
			? '' : addThousandsPosition(item.beginAmountCr, true)
			//本年借方累计
			item.quantityDr = (item.quantityDr == undefined) || item.quantityDr == 0
				? '' : utils.number.format(item.quantityDr, 6)
			item.origAmountDr = (item.origAmountDr == undefined) || item.origAmountDr == 0
				? '' : addThousandsPosition(item.origAmountDr, true)
			item.amountDr = (item.amountDr == undefined) || item.amountDr == 0
				? '' : addThousandsPosition(item.amountDr, true)

			//本年贷方累计
			item.quantityCr = (item.quantityCr == undefined) || item.quantityCr == 0
				? '' : utils.number.format(item.quantityCr, 6)
			item.origAmountCr = (item.origAmountCr == undefined) || item.origAmountCr == 0
				? '' : addThousandsPosition(item.origAmountCr, true)
			item.amountCr = (item.amountCr == undefined) || item.amountCr == 0
				? '' : addThousandsPosition(item.amountCr, true)

			//年初余额
			item.yearBeginQuantityDr = (item.yearBeginQuantityDr == undefined) || item.yearBeginQuantityDr == 0
				? '' : utils.number.format(item.yearBeginQuantityDr, 6)
			item.yearBeginQuantityCr = (item.yearBeginQuantityCr == undefined) || item.yearBeginQuantityCr == 0
			? '' : utils.number.format(item.yearBeginQuantityCr, 6)
			item.yearBeginOrigAmountDr = (item.yearBeginOrigAmountDr == undefined) || item.yearBeginOrigAmountDr == 0
				? '' : addThousandsPosition(item.yearBeginOrigAmountDr, true)
			item.yearBeginOrigAmountCr = (item.yearBeginOrigAmountCr == undefined) || item.yearBeginOrigAmountCr == 0
			? '' : addThousandsPosition(item.yearBeginOrigAmountCr, true)
			item.yearBeginAmountDr = (item.yearBeginAmountDr == undefined) || item.yearBeginAmountDr == 0
				? '' : addThousandsPosition(item.yearBeginAmountDr, true)
			item.yearBeginAmountCr = (item.yearBeginAmountCr == undefined) || item.yearBeginAmountCr == 0
			? '' : addThousandsPosition(item.yearBeginAmountCr, true)
			if (item.isDetailData) {
				item.accountCodeCombine = ''
				item.operation = ''
				item.accountName = combineAuxItemContent(item, 'accountName')
				item.accountCode = ''

			} else {
				item.accountCodeCombine = item.accountCode
				item.operation = item.accountCode
				item.accountName = item.accountName
			}
			if (item.id == undefined) {
				item.id = ''
			}

			let subjectName = item.accountName
			switch (item.accountGrade) {
				case 2:
					subjectName = ' ' + item.accountName
					break;
				case 3:
					subjectName = '  ' + item.accountName
					break;
				case 4:
					subjectName = '   ' + item.accountName
					break;
				case 5:
					subjectName = '    ' + item.accountName
					break;
				default:
			}
			item.accountName = subjectName
		})

		return balanceList
	}

	//更新期初余额数量、金额
	updateBeginBalanceRows = (state, relatedRows, curEditField, tryCacuBalance, curYearTotalAmountField, beginAmountField) => {

		if (!relatedRows) {
			return
		}
		//期初余额试算平衡
		state = this.metaReducer.sf(state, 'data.other.tryCacuBalance', Map(tryCacuBalance))
		let	list,accountType = this.metaReducer.gf(state, 'data.other.accountType')

		list = this.metaReducer.gf(state, 'data.list')
		const curIsCalcMulti = this.metaReducer.gf(state, 'data.filter.isCalcMulti')

		relatedRows.forEach((relatedRow) => {
			let updateRowIndex
			if (relatedRow.isDetailData) {
				if (relatedRow.currencyCode) {
					updateRowIndex = list.toJS().findIndex((x) => x.id == relatedRow.id)
				} else {
					updateRowIndex = list.toJS().findIndex((x) => x.id == relatedRow.id)
				}
			} else {
				updateRowIndex = list.toJS().findIndex((x) => x.accountCode == relatedRow.accountCode)
			}
			list = list.update(updateRowIndex, item => {
				item = item.set('id', relatedRow.id)

				item = item.set(curEditField, addThousandsPosition(relatedRow[curEditField]))
				item = item.set(curYearTotalAmountField, addThousandsPosition(relatedRow[curYearTotalAmountField]))

				if (accountType == ACCOUNTTYPE_PROFITANDLOSS && curIsCalcMulti) {
					switch (beginAmountField) {
						case 'origAmountDr':
							item = item.set('origAmountDr', addThousandsPosition(relatedRow['origAmountDr']))
							item = item.set('amountDr', addThousandsPosition(relatedRow['origAmountDr']))
							item = item.set('origAmountCr', addThousandsPosition(relatedRow['origAmountDr']))
							item = item.set('amountCr', addThousandsPosition(relatedRow['origAmountDr']))
							break;
						case 'amountDr':
							item = item.set('origAmountDr', addThousandsPosition(relatedRow['amountDr']))
							item = item.set('amountDr', addThousandsPosition(relatedRow['amountDr']))
							item = item.set('origAmountCr', addThousandsPosition(relatedRow['amountDr']))
							item = item.set('amountCr', addThousandsPosition(relatedRow['amountDr']))
							break;
						case 'origAmountCr':
							item = item.set('origAmountDr', addThousandsPosition(relatedRow['origAmountCr']))
							item = item.set('amountDr', addThousandsPosition(relatedRow['origAmountCr']))
							item = item.set('origAmountCr', addThousandsPosition(relatedRow['origAmountCr']))
							item = item.set('amountCr', addThousandsPosition(relatedRow['origAmountCr']))
							break;
						case 'amountCr':
							item = item.set('origAmountDr', addThousandsPosition(relatedRow['amountCr']))
							item = item.set('amountDr', addThousandsPosition(relatedRow['amountCr']))
							item = item.set('origAmountCr', addThousandsPosition(relatedRow['amountCr']))
							item = item.set('amountCr', addThousandsPosition(relatedRow['amountCr']))
							break;
						default: item = item.set(beginAmountField, addThousandsPosition(relatedRow[beginAmountField]))
					}
				} else {
					item = item.set(beginAmountField, addThousandsPosition(relatedRow[beginAmountField]))
				}

				const attributArr = ['yearBeginOrigAmountDr','yearBeginOrigAmountCr', 'yearBeginAmountDr', 'yearBeginAmountCr','yearBeginQuantityCr','yearBeginQuantityDr']

				attributArr.forEach((key) => {
					if (key == 'yearBeginQuantityDr'||key=='yearBeginQuantityCr') {
						item = item.set(key, relatedRow[key] ? addThousandsPosition(parseFloat(relatedRow[key]).toFixed(6)) == 0 ? '' : addThousandsPosition(parseFloat(relatedRow[key]).toFixed(6)) : '')

					} else {
						item = item.set(key, relatedRow[key] ? addThousandsPosition(parseFloat(relatedRow[key]).toFixed(2)) == 0 ? '' : addThousandsPosition(parseFloat(relatedRow[key]).toFixed(2)) : '')

					}
				})
				return item
			})
		})
		state = this.metaReducer.sf(state, 'data.list', list)
		state = this.metaReducer.sf(state, 'data.copyList', list)
		return state
	}

	// 试算平衡
	tryCaculateBalance = (state, tryCacuBalance) => {
		return this.metaReducer.sf(state, 'data.other.tryCacuBalance', tryCacuBalance)
	}

	//新增辅助核算项目、外币项目
	addAuxCalcItemRows = (state, auxItems, rowIndex, isSelectCurrency, accountId, tryCacuBalance) => {
		if (!auxItems) {
			return
		}
		//期初余额试算平衡
		state = this.metaReducer.sf(state, 'data.other.tryCacuBalance', Map(tryCacuBalance))

		let list = this.metaReducer.gf(state, 'data.list')

		let curAuxItems = list.filter(subItem => subItem.get('accountId') == accountId)

		if (curAuxItems && curAuxItems.size > 0) {
			rowIndex = rowIndex + curAuxItems.size - 1
		}

		auxItems.forEach((auxItem) => {
			// 将辅助核算项、币种行加入list中
			if (auxItem.isDetailData) {
				rowIndex++
				auxItem.accountCode = ''
				list = list.insert(rowIndex, Map(auxItem))
				if (auxItem.currencyName) {
					state = this.metaReducer.sf(state, 'data.other.isDisplayCurrencyName', true)
				}
			} else {
				let updateRowIndex = list.toJS().findIndex((x) => x.accountCode == auxItem.accountCode)
				list = list.update(updateRowIndex, item => {
					item = item.set('id', auxItem.id)

					const attributArr = ['yearBeginQuantityDr', 'yearBeginQuantityCr','yearBeginOrigAmountDr','yearBeginOrigAmountCr', 'yearBeginAmountDr','yearBeginAmountCr', 'beginQuantityDr', 'beginQuantityCr','beginOrigAmountDr', 'beginOrigAmountCr','beginAmountDr','beginAmountCr', 'amountCr', 'amountDr', 'origAmountCr', 'quantityCr', 'origAmountDr', 'quantityDr']
					attributArr.forEach((key) => {
						item = item.set(key, auxItem[key])
					})
					return item
				})

				//todo  去除return
			}
		})

		//选择了币种后，自动显示币种及外币列
		if (isSelectCurrency) {
			let curIsMultiCalc = this.metaReducer.gf(state, 'data.other.isCalcMulti')
			if (!curIsMultiCalc) {
				let isDisplayOnlyAmount = this.getIsDisplayOnlyAmount(state),
					balanceGridName = isDisplayOnlyAmount ? 'singleRowBalanceGrid' : 'doubleRowBalanceGrid'

			}
		}

		state = this.metaReducer.sf(state, 'data.list', fromJS(list))
		return state
	}

	//删除辅助核算项目 主页面
	deleteAuxItemRows = (state, rsultItems, selectIndex, tryCacuBalance) => {
		let list = this.metaReducer.gf(state, 'data.list')
		//期初余额试算平衡
		state = this.metaReducer.sf(state, 'data.other.tryCacuBalance', Map(tryCacuBalance))

		rsultItems.forEach((deleAuxItem) => {
			let deleteIndex = list.toJS().findIndex((x) => x.accountCode == deleAuxItem.accountCode)
			list = list.update(deleteIndex, item => {
				item = item.set('yearBeginQuantityDr', deleAuxItem.yearBeginQuantityDr == 0 ? undefined : deleAuxItem.yearBeginQuantityDr)
				item = item.set('yearBeginQuantityCr', deleAuxItem.yearBeginQuantityCr == 0 ? undefined : deleAuxItem.yearBeginQuantityCr)
				item = item.set('beginQuantityDr', deleAuxItem.beginQuantityDr == 0 ? undefined : deleAuxItem.beginQuantityDr)
				item = item.set('beginQuantityCr', deleAuxItem.beginQuantityCr == 0 ? undefined : deleAuxItem.beginQuantityCr)
				item = item.set('quantityCr', deleAuxItem.quantityCr == 0 ? undefined : deleAuxItem.quantityCr)
				item = item.set('quantityDr', deleAuxItem.quantityDr == 0 ? undefined : deleAuxItem.quantityDr)

				const attributArr = ['yearBeginOrigAmount', 'yearBeginAmount', 'beginOrigAmount', 'beginAmount', 'amountCr', 'amountDr', 'origAmountCr', 'origAmountDr']
				attributArr.forEach((key) => {
					item = item.set(key, deleAuxItem[key] ? addThousandsPosition(deleAuxItem[key].toFixed(2)) == 0 ? '' : addThousandsPosition(deleAuxItem[key].toFixed(2)) : '')
				})

				return item
			})
		})
		list = list.splice(selectIndex, 1)
		state = this.metaReducer.sf(state, 'data.list', fromJS(list))
		return state
	}
	//是否显示loading
	isShowLoading = (state, value) => {
		// state = this.metaReducer.sf(state, 'data.other.isLoading', fromJS(value))
		state = this.metaReducer.sf(state, 'data.other.isLoading', value)
		return state
	}
	//是否显示财务初始化按钮 上一步 、下一步
	isShowBtn = (state, appExtendParams) => {
		if (appExtendParams) {
			state = this.metaReducer.sf(state, 'data.other.isShowBtn', true)
		} else {
			state = this.metaReducer.sf(state, 'data.other.isShowBtn', false)
		}
		return state
	}

	setScroll = (state, value) => {
		state = this.metaReducer.sf(state, 'data.other.scrollY', value.tableDivHeight)
		state = this.metaReducer.sf(state, 'data.other.scrollX', value.tableDivWidth)
		return state
	}

	//********************以下为现金流量期初的脚本*********************
	loadCFPeriodBegin = (state, value, period) => {
		if (period) {
			state = this.metaReducer.sf(state, `data.cashflowperiod`, period)

		}

		if (value && value.datas) {
			value.datas.map(item => {
				item.cashFlowItem = {
					id: item.cashFlowItemId,
					name: item.name
				}
			})
			state = this.metaReducer.sf(state, `data.cashflowlist`, fromJS(value.datas))
		}

		if (value && value.cashFlowItems) {
			state = this.metaReducer.sf(state, `data.other.cashFlowItems`, fromJS(value.cashFlowItems))
		}
		state = this.metaReducer.sf(state, 'data.accountingStandards', fromJS(value.accountingStandards))
		state = this.metaReducer.sf(state, 'data.statement', fromJS(value))
		state = this.metaReducer.sf(state, 'data.canEdit', fromJS(value['canEdit']))

		return state
	}

	setCashFlowScroll = (state, value) => {
		state = this.metaReducer.sf(state, 'data.other.cashFlwoScrollY', value)
		return state
	}

	setCashflowDisabled = (state, value) => {
		if (value == 1) {
			state = this.metaReducer.sf(state, 'data.other.cashflowDisabled', true)
		} else {
			state = this.metaReducer.sf(state, 'data.other.cashflowDisabled', false)
		}
		return state
	}

	fixPosition = (state, condition) => {

			let list = this.metaReducer.gf(state, 'data.list'),
					matchIndex = this.metaReducer.gf(state, 'data.other.matchIndex'),
					matchBacktoZero = this.metaReducer.gf(state, 'data.other.matchBacktoZero'),
					firstMatchIndex = -1, aryMatch = []
					// dom = document.getElementsByClassName('ant-table-body')[0]

			condition = (condition && condition.trim()) + ''
			if (condition != '') {
					list = list.map((item, index) => {
							// 编码按照左匹配，名称按照模糊匹配
							if (item.get('accountName') != '合计' &&
							    (item.get('accountCode').indexOf(condition) ==0 ||
									item.get('accountName') && item.get('accountName').indexOf(condition) > -1)){
									item = item.set('isMatch', true)
									aryMatch.push(index)
									if (firstMatchIndex == -1) {
											firstMatchIndex = index
									}
							} else {
									if (item.get('isMatch') == true) {
											item = item.set('isMatch', false)
									}
							}
							return item
					})

					if (matchBacktoZero) {
							matchIndex = firstMatchIndex
					} else {
							let aryIndex = aryMatch.findIndex((x) => x > matchIndex)

							if (aryIndex == -1) {
									matchIndex = firstMatchIndex
							} else {
									matchIndex = parseInt(aryMatch[aryIndex])
							}
					}
					state = this.metaReducer.sf(state, 'data.list', list)
			}

			if (matchIndex > -1) {
					state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', matchIndex)
					state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', false)
					state = this.metaReducer.sf(state, 'data.other.searchFlag', true)
			} else {
				if(condition == undefined){
					state = this.metaReducer.sf(state, 'data.other.searchFlag', true)
				}
					state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', -9)
			}

			// dom.scrollTop = matchIndex * 37 - dom.offsetHeight + 44
			return this.metaReducer.sf(state, 'data.other.matchIndex', matchIndex)
	}

  searchChange = (state, value) => {
      state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', true)
      state = this.metaReducer.sf(state, 'data.other.matchIndex', -1)

      return this.metaReducer.sf(state, 'data.other.positionCondition', value)
  }

  update = (state, { path, value }) => {
      return this.metaReducer.sf(state, path, fromJS(value))
  }

  updateArr = (state, arr) => {
      arr.forEach(item => {
          state = this.metaReducer.sf(state, item.path, fromJS(item.value))
      })
      return state
  }
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		//extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer })
	return { ...metaReducer, ...o }
}
