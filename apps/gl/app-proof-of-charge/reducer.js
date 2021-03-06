import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import * as data from './data'
//import moment from 'moment'
import extend from './extend'
import utils from 'edf-utils'
import { clearThousandsPosition } from './data.js'
import { debug } from 'util';

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer
		this.extendReducer = option.extendReducer
		this.config = config.current
	}

	init = (state) => {
		return this.metaReducer.init(state, data.getInitState())
	}

	//附件上传状态
	attachmentLoading = (state, attachmentLoading) => {
		return this.metaReducer.sf(state, 'data.form.attachmentLoading', attachmentLoading)
	}

	//附件显示状态
	attachmentVisible = (state, attachmentVisible) => {
		return this.metaReducer.sf(state, 'data.form.attachmentVisible', attachmentVisible)
	}

	initNewCertificate = (state, initVoucherData, subjectList, enabledYearMonth, currencyDS, other) => {
		if (other && JSON.stringify(other) !== "{}") {
			state = this.metaReducer.sfs(state, other)
		}

		if (initVoucherData) {
			state = this.initVoucherCode(state, initVoucherData.docCode)
			state = this.metaReducer.sf(state, 'data.form.date', initVoucherData.voucherDate)
		}
		window.accountingSubjects = fromJS(subjectList.glAccounts)
		window.accountingSubjectsAll = fromJS(subjectList.glAccountsAll)
		// state = this.metaReducer.sf(state, 'data.other.accountingSubjects', fromJS(subjectList.glAccounts))		
		state = this.metaReducer.sf(state, 'data.other.isEnable', subjectList.glAccounts && subjectList.glAccounts.length > 800 ? true : false)
		// state = this.metaReducer.sf(state, 'data.other.accountingSubjectsAll', fromJS(subjectList.glAccountsAll))
		state = this.metaReducer.sf(state, 'data.other.calcDict', Map(subjectList.calcDict))
		state = this.metaReducer.sf(state, 'data.other.currencyDS', fromJS(currencyDS))
		state = this.metaReducer.sf(state, 'data.other.disabledDate', enabledYearMonth)
		state = this.metaReducer.sf(state, 'data.form.attachmentStatus', 0)
		if (initVoucherData) {
			state = this.metaReducer.sf(state, 'data.other.focusFieldPath', 'root.children.center.children.details.columns.summary.cell.cell,0')
		}
		state = this.metaReducer.sf(state, 'data.form.copydetails', this.metaReducer.gf(state, 'data.form.details'))
		return state
	}

	//使用凭证初始化界面
	initLoadCertificate = (state, certificateData, enabledYearMonth, subjectList, currencyDS, other) => {
		if (other && JSON.stringify(other) !== "{}") {
			state = this.metaReducer.sfs(state, other)
		}
		window.accountingSubjects = fromJS(subjectList.glAccounts)
		window.accountingSubjectsAll = fromJS(subjectList.glAccountsAll)
		// state = this.metaReducer.sf(state, 'data.other.accountingSubjects', fromJS(subjectList.glAccounts))	
		state = this.metaReducer.sf(state, 'data.other.isEnable', subjectList.glAccounts && subjectList.glAccounts.length > 800 ? true : false)
		// state = this.metaReducer.sf(state, 'data.other.accountingSubjectsAll', fromJS(subjectList.glAccountsAll))
		state = this.metaReducer.sf(state, 'data.other.calcDict', Map(subjectList.calcDict))
		state = this.metaReducer.sf(state, 'data.other.currencyDS', fromJS(currencyDS))
		state = this.loadCertificate(state, certificateData)

		if (certificateData.get('voucherState') == data.STATUS_VOUCHER_AUDITED) {
			state = this.changeStatus(state, data.VIEW_STATUS, data.STATUS_VOUCHER_AUDITED)
		} else {
			state = this.changeStatus(state, data.VIEW_STATUS, data.STATUS_VOUCHER_NOT_AUDITED)
		}

		if (enabledYearMonth) {
			state = this.metaReducer.sf(state, 'data.other.disabledDate', enabledYearMonth)
		}

		return state
	}

	//默认显示行数
	setrowsCount = (state, details, defaultLength, other) => {
		if (other && JSON.stringify(other) !== "{}") {
			state = this.metaReducer.sfs(state, other)
		}

		state = this.metaReducer.sf(state, 'data.form.details', fromJS(details))
		state = this.metaReducer.sf(state, 'data.other.defaultLength', defaultLength)
		return state
	}

	//加载新的凭证数据, 或者服务端获取的数据
	loadCertificate = (state, certificateData, editStatus, other) => {
		if (other && JSON.stringify(other) !== "{}") {
			state = this.metaReducer.sfs(state, other)
		}

		let form = Map({
			id: certificateData.get('docId'),
			code: certificateData.get('docCode'),
			date: certificateData.get('voucherDate'),
			docType: certificateData.get('docType'),
			attachCount: certificateData.get('attachedNum'),
			creatorId: certificateData.get('creatorId'),
			creator: certificateData.get('creator'),
			auditorId: certificateData.get('auditorId'),
			auditor: certificateData.get('auditor'),
			certificateStatus: certificateData.get('voucherState'),
			certificateStatusName: certificateData.get('voucherStateName'),
			ts: certificateData.get('ts'),
			redSourceDocId: certificateData.get('redSourceDocId') || undefined,
			voucherSource: certificateData.get('sourceVoucherCode') || '',
			sourceVoucherId: certificateData.get('sourceVoucherId') || '',
			sourceVoucherTypeId: certificateData.get('sourceVoucherTypeId') || '',
			attachmentFiles: this.convertToAttachmentFiles(certificateData.get('enclosures') ? certificateData.get('enclosures').toJS() : fromJS([])),
			isAttachCount: certificateData.get('attachedNum') != 0 ? false : true
		})

		state = this.metaReducer.sf(state, 'data.other.isShow', false)
		state = this.metaReducer.sf(state, 'data.other.isDisplayQuantityColumn', false)

		let details = List(),
			isShowQuantityCol = false,   //检查是否需要显示"数量/外币"字段
			quantityAndCurrencyTitle = ''
		for (let entry of certificateData.get('entrys')) {
			let detail = this.getVoucherItemFromEntry(state, entry)

			details = details.push(detail)

			//检查是否需要显示"数量/外币"字段
			if (detail.get('accountingSubject').get('isCalcMulti') || detail.get('accountingSubject').get('isCalcQuantity')) {
				isShowQuantityCol = true
				quantityAndCurrencyTitle = this.getQuantityAndCurrentTitle(quantityAndCurrencyTitle, detail.get('accountingSubject'))
			}
		}

		if (isShowQuantityCol) {
			state = this.enableQuantityAndForeignCurrency(state, quantityAndCurrencyTitle)
		} else {
			state = this.disableQuantityAndForeignCurrency(state)
		}

		let blankVoucherItemCount = this.metaReducer.gf(state, 'data.other.defaultLength') - details.size
		if (blankVoucherItemCount > 0) {
			for (let i = 0; i < blankVoucherItemCount; i++) {
				details = details.push(fromJS(data.blankVoucherItem))
			}
		}

		//更新"科目"列里的"余额"是否显示
		details = this.updateBalanceShowable(details, editStatus)

		// COMMENT HAOZHAO 1225 START  TODO
		// if(!!certificateData.get('docSourceTypeId')){
		// 	if(certificateData.get('docSourceTypeId') == 142 || certificateData.get('docSourceTypeId') == 150 || certificateData.get('docSourceTypeId') == 151){//142为折旧摊销生成的凭证，150、151为资产处置生成的凭证
		// 		state = dr.setter(state,'voucher.voucherHeader.formItems.voucherSource','visible',false)
		// 	}else{
		// 		state = dr.setter(state,'voucher.voucherHeader.formItems.voucherSource','visible',true)
		// 	}
		// }else{
		// 	state = dr.setter(state,'voucher.voucherHeader.formItems.voucherSource','visible',false)
		// }
		// COMMENT HAOZHAO 1225 END
		form = form.set('details', details)
		state = this.metaReducer.sf(state, 'data.form', form)
		state = this.metaReducer.sf(state, 'data.form.adjunctInfo.album', fromJS(certificateData.get('enclosures')))
		state = this.metaReducer.sf(state, 'data.form.adjunctInfo.adjunctSize', certificateData.get('enclosures') ? certificateData.get('enclosures').size : 0)
		state = this.clearGridFocus(state)  //切换单据(翻页)时,清空焦点
		state = this.clearDeleteddetails(state)  //重新装载凭证时，清空已删除凭证项
		state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', 0)
		state = this.metaReducer.sf(state, 'data.other.certificateBodyScrollY', 0)

		state = this.changeStatus(state, editStatus, form.get('certificateStatus'))
		return this.metaReducer.sf(state, 'data.form.copydetails', this.metaReducer.gf(state, 'data.form.details'))
	}

	clearDeleteddetails = (state) => {
		return this.metaReducer.sf(state, 'data.other.deletedCertificateItems', undefined)
	}

	//清空当前单据状态,并进入新建状态(重建一个getEmptyVoucher)
	clearAndNewCertificate = (state, newVoucherData, subjectList, currencyDS, enabledYearMonth, other) => {
		if (other && JSON.stringify(other) !== "{}") {
			state = this.metaReducer.sfs(state, other)
		}

		let curAccountingSubjects = subjectList && subjectList.glAccounts ? fromJS(subjectList.glAccounts) : window.accountingSubjects,
			curAccountingSubjectsAll = subjectList && subjectList.glAccountsAll ? fromJS(subjectList.glAccountsAll) : window.accountingSubjectsAll,
			currencyDSTemp = this.metaReducer.gf(state, 'data.other.currencyDS'),
			calcDictTemp = this.metaReducer.gf(state, 'data.other.calcDict'),
			defaultLength = this.metaReducer.gf(state, 'data.other.defaultLength'),
			dateTemp = this.metaReducer.gf(state, 'data.form.date'),
			summarysTemp = this.metaReducer.gf(state, 'data.other.summarys')

		state = this.metaReducer.init(state, data.getInitState())
		state = this.metaReducer.sf(state, 'data.other.defaultLength', defaultLength)
		state = this.completeBlankRow(state, defaultLength)
		state = this.changeStatus(state, data.ADD_STATUS, data.STATUS_VOUCHER_NOT_AUDITED)
		state = this.metaReducer.sf(state, 'data.other.currencyDS', currencyDS != undefined ? fromJS(currencyDS) : currencyDSTemp)
		state = this.initVoucherCode(state, newVoucherData.code)
		if (newVoucherData.voucherDate != undefined) {
			state = this.metaReducer.sf(state, 'data.form.date', newVoucherData.voucherDate)
		} else {
			state = this.metaReducer.sf(state, 'data.form.date', dateTemp)
		}
		state = this.metaReducer.sf(state, 'curCellAuxAccountSubjects', undefined)
		state = this.metaReducer.sf(state, 'curCellCodeAndName', undefined)
		state = this.metaReducer.sf(state, 'data.form.attachmentStatus', 0)
		window.accountingSubjects = fromJS(curAccountingSubjects)
		window.accountingSubjectsAll = fromJS(curAccountingSubjectsAll)
		// state = this.metaReducer.sf(state, 'data.other.accountingSubjects', curAccountingSubjects)
		state = this.metaReducer.sf(state, 'data.other.isEnable', curAccountingSubjects.size > 800 ? true : false)
		// state = this.metaReducer.sf(state, 'data.other.accountingSubjectsAll', curAccountingSubjectsAll)
		state = this.metaReducer.sf(state, 'data.other.calcDict', subjectList != undefined ? Map(subjectList.calcDict) : calcDictTemp)
		state = this.metaReducer.sf(state, 'data.other.isInsert', newVoucherData.isInsert ? true : false)
		state = this.metaReducer.sf(state, 'data.other.disabledDate', enabledYearMonth)
		state = this.metaReducer.sf(state, 'data.other.summarys', summarysTemp)

		if (newVoucherData.code) {
			//设置摘要为默认焦点
			state = this.metaReducer.sf(state, 'data.other.focusFieldPath', 'root.children.center.children.details.columns.summary.cell.cell,0')
		}
		return this.metaReducer.sf(state, 'data.form.copydetails', this.metaReducer.gf(state, 'data.form.details'))
	}

	// 补全空白行
	completeBlankRow = (state, defaultLength) => {
		let details = this.metaReducer.gf(state, 'data.form.details')

		if (details.size < defaultLength) {
			for (var i = details.size; i < defaultLength; i++) {
				details = details.push(Map(data.blankVoucherItem))
			}

			state = this.metaReducer.sf(state, 'data.form.details', details)
		}

		return state
	}

	//设置单据号
	initVoucherCode = (state, newCode) => {
		state = this.metaReducer.sf(state, 'data.form.initVoucherCode', newCode)

		// 批量复制的，更改当前凭证日期后，当前及后续凭证号联动修改
		if (this.metaReducer.gf(state, 'data.other.copyType') == 'batchCopy') {
			let currentIndex = this.metaReducer.gf(state, 'data.other.currentIndex'),
				docs = this.metaReducer.gf(state, 'data.other.docs').toJS()

			if (currentIndex < docs.length - 1) {
				for (var i = currentIndex + 1; i < docs.length; i++) {
					docs[i].docCode = (parseInt(newCode) + (i - currentIndex)).toString().padStart(5, '0');
					docs[i].voucherDate = this.metaReducer.gf(state, 'data.form.date')
				}
				state = this.metaReducer.sf(state, 'data.other.docs', fromJS(docs))
			}
		}

		return this.metaReducer.sf(state, 'data.form.code', newCode)
	}

	updateBalanceShowable = (details, editStatus) => {
		let newItems = List()
		for (let item of details) {
			let account = item.get('accountingSubject')
			if (account && typeof (account) == 'object') {
				item = item.set('accountingSubject', account.set('showBalance', (editStatus == data.EDIT_STATUS || editStatus == data.ADD_STATUS)))
			}
			newItems = newItems.push(item)
		}
		return newItems
	}

	//关闭"数量/外币"列
	disableQuantityAndForeignCurrency = (state) => {
		//表头
		state = this.metaReducer.sf(state, 'data.other.quantityAndForeignCurrencyTitle', '')

		//如果该字段可见,则调整其他单元格的宽度
		state = this.metaReducer.sf(state, 'data.other.isDisplayQuantityColumn', false)
		state = this.metaReducer.sf(state, 'data.other.quantityAndForeignCurrencyWidth', 0)
		state = this.metaReducer.sf(state, 'data.other.summaryWidth', 220)
		return state
	}

	getVoucherItemFromEntry = (state, entry) => {

		let accountSubject = fromJS(entry.get('accountDto') || this.getAccountById(state, entry.get('accountId')))
		if (accountSubject == null) accountSubject = fromJS({})
		let auxAccountSubjects = {
			department: entry.get('departmentId') ? {
				id: entry.get('departmentId'),
				name: entry.get('departmentName')
			} : undefined,
			person: entry.get('personId') ? {
				id: entry.get('personId'),
				name: entry.get('personName')
			} : undefined,
			customer: entry.get('customerId') ? {
				id: entry.get('customerId'),
				name: entry.get('customerName')
			} : undefined,
			supplier: entry.get('supplierId') ? {
				id: entry.get('supplierId'),
				name: entry.get('supplierName')
			} : undefined,
			inventory: entry.get('inventoryId') ? {
				id: entry.get('inventoryId'),
				name: entry.get('inventoryName')
			} : undefined,
			project: entry.get('projectId') ? {
				id: entry.get('projectId'),
				name: entry.get('projectName')
			} : undefined
		}
		for (var j = 1; j <= 10; j++) {
			if (entry.get(`exCalc${j}`)) {
				auxAccountSubjects[`exCalc${j}`] = {
					id: entry.get(`exCalc${j}`),
					name: entry.get(`exCalc${j}Name`)
				}
			} else {
				auxAccountSubjects[`exCalc${j}`] = undefined
			}
		}

		if (entry.get('balance') != undefined) {
			accountSubject = accountSubject.set('balance', this.getRuntimeBalance(state, accountSubject.get('code'), entry.get('balance')))
			accountSubject = accountSubject.set('initBalance', entry.get('initBalance'))
		}
		let initBalance = entry.get('initBalance')
		let detail = fromJS({
			id: entry.get('id'),
			summary: entry.get('summary'),
			accountingSubject: {
				...accountSubject.toJS(),
				auxAccountSubjects: auxAccountSubjects,
				auxAccountSubjectsPreSelected: auxAccountSubjects
			},
			quantityAndForeignCurrency: {
				quantity: initBalance ? initBalance.get('quantity') : entry.get('quantity'),
				price: initBalance ? initBalance.get('price') : entry.get('price'),
				origAmount: entry.get('origAmountDr') != undefined ? entry.get('origAmountDr') : entry.get('origAmountCr'),
				exchangeRate: entry.get('exchangeRate') ? entry.get('exchangeRate') : accountSubject.get('exchangeRate'),
				amount: entry.get('amountDr') != undefined ? entry.get('amountDr') : entry.get('amountCr'),
				currency: {
					id: entry.get('currencyId') ? entry.get('currencyId') : accountSubject.get('currencyId'),
					name: entry.get('currencyName') ? entry.get('currencyName') : accountSubject.get('currencyName'),
					exchangeRate: entry.get('exchangeRate') ? entry.get('exchangeRate') : accountSubject.get('exchangeRate'),
					isBaseCurrency: entry.get('exchangeRate') == 1 ? true : false
				},

				//以下三个字段从科目里来(冗余)
				unitName: entry.get('unitName'),
				isCalcQuantity: accountSubject.get('isCalcQuantity'),
				isCalcMulti: accountSubject.get('isCalcMulti')
			},
			debitAmount: entry.get('amountDr') || 0,
			creditAmount: entry.get('amountCr') || 0,
			ts: entry.get('ts'),
			inPutTaxDeductId: entry.get('inPutTaxDeductId'),
			accountList: entry.get('accountList')
		})

		return detail
	}

	getRuntimeBalance = (state, accountCode, balance) => {
		let details = this.metaReducer.gf(state, 'data.form.details'),
			retBalance = balance

		let filterList = details.filter(detail => detail.get('accountingSubject') && detail.get('accountingSubject').get('code') == accountCode)

		if (filterList.size > 0) {
			retBalance = filterList.get(0).get('accountingSubject').get('balance')
		}

		return retBalance
	}

	//根据科目id返回科目对象
	getAccountById = (state, accountId) => {
		let accountSubjects = window.accountingSubjectsAll,
			// let accountSubjects = this.metaReducer.gf(state, 'data.other.accountingSubjects'),
			targetAccount = Map()
		if (accountSubjects) {
			targetAccount = data.find(accountSubjects, 'id', accountId) //accountSubjects.find((item, index) => item.get('id') == accountId)
		}
		return targetAccount
	}

	endEditAuxAccount = (state, option) => {
		//凭证科目的辅助项变更之后，设置凭证状态为：【编辑】EDIT_STATUS
		let curIndex = option.path.split(',')[1],
			details = this.metaReducer.gf(state, 'data.form.details'),
			curRowVoucher = details.get(curIndex),
			curAccountSubject = details.get(curIndex).get('accountingSubject')

		if (curAccountSubject) {
			let auxAccountSubjectsPreSelected = curAccountSubject.get('auxAccountSubjectsPreSelected')

			if (!this.isEqualAuxAccountSubjects(option.data.get('auxAccountSubjects'), auxAccountSubjectsPreSelected)) {
				let editStatus = this.metaReducer.gf(state, 'data.other.editStatus')
				if (editStatus != data.ADD_STATUS) {
					state = this.changeStatus(state, data.EDIT_STATUS, data.STATUS_VOUCHER_NOT_AUDITED)
				}
			}
		}

		curAccountSubject = curAccountSubject.set('auxAccountSubjects', fromJS(option.data.get('auxAccountSubjects')))
		curAccountSubject = curAccountSubject.set('auxAccountSubjectsPreSelected', fromJS(option.data.get('auxAccountSubjects')))
		curAccountSubject = curAccountSubject.set('balance', option.balance)
		curAccountSubject = curAccountSubject.set('initBalance', fromJS(option.initBalance))

		state = this.metaReducer.sf(state, 'data.form.details.' + curIndex + '.accountingSubject', curAccountSubject)
		if (this.metaReducer.gf(state, 'root.children.center.children.details.columns.accountingSubject.isReadOnly') == true) {
			state = this.setGridDisabledState(state, false)
		}
		state = this.metaReducer.sf(state, 'data.other.hidePopover', false)
		state = this.reCaculateBalance(state, option.path.split(',')[1])

		return this.onEvent(state, 'onEndEdit', option)
	}

	//取消输入辅助核算: 表格可编辑 + 设置焦点到当前科目
	cancelEditAuxAccount = (state, option) => {
		state = this.setGridDisabledState(state, false)
		state = this.metaReducer.sf(state, 'data.other.cancelEditAuxAccount', true)

		// 清空当前选中的科目
		let details = this.metaReducer.gf(state, 'data.form.details'),
			index = parseInt(option.path.split(',')[1])

		details = details.set(index, details.get(index).set('accountingSubject', undefined))
		details = details.set(index, details.get(index).set('quantityAndForeignCurrency', undefined))
		state = this.metaReducer.sf(state, 'data.form.details', details)
		state = this.metaReducer.sf(state, 'curCellAuxAccountSubjects', undefined)
		state = this.metaReducer.sf(state, 'curCellCodeAndName', undefined)
		state = this.setGridFocus(state, option.path)
		return state
	}

	onEvent = (state, eventName, option, other) => {
		let index, details, quantityAndForeignCurrency

		//科目结束编辑,检查是否填写辅助核算
		if ((eventName === 'onEndEdit' || eventName === 'onBlur')) {
			if (other && JSON.stringify(other) !== "{}") {
				state = this.metaReducer.sfs(state, other)
			}

			if (option.path.indexOf('root.children.center.children.details.columns.accountingSubject') != -1) {
				details = this.metaReducer.gf(state, 'data.form.details')
				index = parseInt(option.path.split(',')[1])

				if (eventName == 'onEndEdit' && option.isChanged) {
					details = details.set(index, details.get(index).set('accountingSubject', option.data))
					state = this.metaReducer.sf(state, 'data.form.details', details)
				}

				let detail = details.get(index),
					accountSubject = detail.get('accountingSubject')
				quantityAndForeignCurrency = detail.get('quantityAndForeignCurrency') ? detail.get('quantityAndForeignCurrency').toJS() : undefined
				if (eventName == 'onEndEdit') {
					state = this.metaReducer.sf(state, 'isEdit', false)
					if (option.data) {
						if (accountSubject && (accountSubject.get('isCalcQuantity') || accountSubject.get('isCalcMulti'))) {
							state = this.checkQuantityAndForeignCurrency(state, option.path, accountSubject, quantityAndForeignCurrency)

						} else {
							details = details.update(index, item => item.set('quantityAndForeignCurrency', undefined))
							state = this.metaReducer.sf(state, 'data.form.details', details)
						}
					} else {
						if (accountSubject && (accountSubject.get('isCalcQuantity') || accountSubject.get('isCalcMulti'))) {
							state = this.checkQuantityAndForeignCurrency(state, option.path, accountSubject, quantityAndForeignCurrency)
						} else {
							details = details.update(index, item => item.set('quantityAndForeignCurrency', undefined))
							state = this.metaReducer.sf(state, 'data.form.details', details)
						}
					}
				}
				//如果输入以后,没有在下拉中匹配到内容,则清空填写
				if (typeof accountSubject != 'object') {
					state = this.clearCell(state, 'accountingSubject', index)
				}
				if ((eventName === 'onBlur' && this.metaReducer.gf(state, 'isEdit') == true) || option.recoverAuxItem === 'recoverAuxItem') {

					//恢复onFocus时暂存的当前辅助核算项及科目名+辅助名称 haozhao ADD START
					let curCellAuxAccountSubjects = this.metaReducer.gf(state, 'curCellAuxAccountSubjects'),
						curCellCodeAndName = this.metaReducer.gf(state, 'curCellCodeAndName')

					if (typeof accountSubject == 'object' &&
						curCellAuxAccountSubjects &&
						curCellCodeAndName &&
						accountSubject.get('code') == curCellCodeAndName.split(' ')[0]) {
						details = details.update(index, item => item.setIn(['accountingSubject', 'auxAccountSubjects'], curCellAuxAccountSubjects))
						details = details.update(index, item => item.setIn(['accountingSubject', 'codeAndName'], curCellCodeAndName))

						state = this.metaReducer.sf(state, 'data.form.details', details)
						accountSubject = details.get(index).get('accountingSubject')
					}
					//恢复onFocus时暂存的当前辅助核算项及科目名+辅助名称 haozhao ADD END
				}
				//选择了下拉项
				if (typeof accountSubject == 'object' && accountSubject.get('isCalc') && !accountSubject.get('auxAccountSubjects')) {
					state = this.startEditAuxAccount(state)
					return state
				}
			} else if (option.path.indexOf('root.children.center.children.details.columns.debitAmount') != -1
				|| option.path.indexOf('root.children.center.children.details.columns.creditAmount') != -1) {
				//todo
				let curPath = option.path.split('.cell.cell')[0].split('.'),
					curEditField = curPath[curPath.length - 1]
				details = this.metaReducer.gf(state, 'data.form.details')
				index = parseInt(option.path.split(',')[1])
				let curAmount = details.get(index).get(curEditField) == '-' ? 0 : details.get(index).get(curEditField)
				if (!!curAmount) {
					details = this.rewriteQuantityAndCurrency(state, option.path) //反算"数量/外币"

					//格式化精度
					let amount = curAmount,
						precision = 2 //默认为空 1120 HAOZHAO
					if (precision && amount) {
						//金额要先进行去千分位
						amount = parseFloat(clearThousandsPosition(amount)).toFixed(precision)
					}
					// details = this.metaReducer.gf(state, 'data.form.details')
					details = details.update(index, item => item.set(curEditField, amount))
					state = this.metaReducer.sf(state, 'data.form.details', details)
				}
			}

			if (eventName === 'onEndEdit' && option.path) {
				if (option.path.indexOf('root.children.center.children.details.columns.accountingSubject') != -1) {
					index = parseInt(option.path.split(',')[1])
					details = this.metaReducer.gf(state, 'data.form.details')
					quantityAndForeignCurrency = details.get(index).get('quantityAndForeignCurrency')

					if (!!option.data) {
						//若辅助项中选择了存货，则【数量/外币】列的计量单位取存货中的计量单位2033 haozhao ADD
						if (!!option.data.get('auxAccountSubjects')) {
							let inventory = option.data.get('auxAccountSubjects').get('inventory'),
								curQuantityUnitName = quantityAndForeignCurrency ? quantityAndForeignCurrency.get('unitName') : undefined

							if (inventory) {
								if (curQuantityUnitName && curQuantityUnitName != inventory.get('unitName')) {
									details = details.update(index, item => item.setIn(['quantityAndForeignCurrency', 'unitName'], inventory.get('unitName')))
									state = this.metaReducer.sf(state, 'data.form.details', details)
								}
							}
						}
					}

					//如果科目有数量核算或外币核算并且没有按上下左右键，或者
					//科目有数量核算或外币核算并且按下了向右键（ARROWRIGHT）haozhao ADD 2017-01-19
					//直接弹出数量外币框，焦点不落入金额框
					if (quantityAndForeignCurrency &&
						(quantityAndForeignCurrency.get('isCalcMulti') || quantityAndForeignCurrency.get('isCalcQuantity')) &&
						!option.arrowDirection) {

						state = this.metaReducer.sf(state, 'data.other.isShow', true)
						state = this.metaReducer.sf(state, 'data.other.index', index)
						state = this.clearGridFocus(state) //弹出数量外币录入框前，清空Grid焦点
						return state

					} else if (quantityAndForeignCurrency &&
						(quantityAndForeignCurrency.get('isCalcMulti') == true || quantityAndForeignCurrency.get('isCalcQuantity') == true) &&
						option.arrowDirection == data.ARROWRIGHT) {

						state = this.metaReducer.sf(state, 'data.other.isShow', true)
						state = this.metaReducer.sf(state, 'data.other.index', index)
						state = this.clearGridFocus(state) //弹出数量外币录入框前，清空Grid焦点
						return state
					}

					// 凭证新增状态下实时计算余额
					if (this.metaReducer.gf(state, 'data.other.editStatus') == data.ADD_STATUS) {
						for (var i = 0; i < details.size; i++) {
							state = this.reCaculateBalance(state, i)
						}
					}
				}
				details = this.metaReducer.gf(state, 'data.form.details')
				let path = option.path,
					nextPath, isTemplate = false

				nextPath = this.getNextFocusCellPath(state, path)
				if (nextPath != option.path) {
					if (nextPath.indexOf('root.children.center.children.details.columns.accountingSubject') != -1) {
						state = this.onFieldFocus(state, nextPath)
					}
					state = this.setGridFocus(state, nextPath)
				}
				state = this.checkRowState(state, nextPath, option.isChanged || false)  //如果自动切换到最后一行,则新增一行
			}
		}
		//完成填写 辅助核算
		else if (eventName === 'endEditAuxAccount') {
			let curIndex = option.path.split(',')[1], curRowVoucher, curAccountSubject

			details = this.metaReducer.gf(state, 'data.form.details')
			curRowVoucher = details.get(curIndex)
			curAccountSubject = details.get(curIndex).get('accountingSubject')
			state = this.endEditAuxAccount(state, option)

			if (curAccountSubject.get('isCalcMulti') == true || curAccountSubject.get('isCalcQuantity') == true) {
				state = this.metaReducer.sf(state, 'data.other.isShow', true)
			} else {
				state = this.metaReducer.sf(state, 'data.other.isShow', false)
			}

			return this.metaReducer.sf(state, 'data.other.index', parseInt(option.path.split(',')[1]))
		}
		//取消填写 辅助核算
		else if (eventName === 'cancelEditAuxAccount') {
			state = this.cancelEditAuxAccount(state, option)
		}
		//复写数量外币核算弹窗的isShow属性
		else if (eventName === 'accountQuantityIsShow') {
			state = this.accountQuantityIsShow(state, option)
		}
		//快捷键事件处理
		else if (eventName === 'onShortcutKey') {			
			//借贷平衡
			if (option.keyEvent && (option.keyEvent.key == '=' || option.keyEvent.keyCode == 187 || option.keyEvent.keyCode == 229)) {
				state = this.makeAmountEqual(state)
			}
			//切换数值的正负
			else if (option.keyEvent && (option.keyEvent.key == '-' || (option.keyEvent.keyCode == 189 || option.keyEvent.keyCode == 109))) {
				state = this.toggleAmountPositive(state, eventName, option.keyEvent)
			}
			//空格值切换借方贷方
			else if (option.keyEvent && (option.keyEvent.key == ' ' || option.keyEvent.keyCode == 32)) {
				state = this.toggleAmountDirection(state)
			}
			let originalFieldPath = this.metaReducer.gf(state, 'data.other.originalFieldPath')
			state = this.reCaculateBalance(state, originalFieldPath && originalFieldPath.split(',')[1])
		}
		return state
	}

	onAmountBlur = (state, eventName, option, other) => {
		let index, details
		//科目结束编辑,检查是否填写辅助核算
		if (other && JSON.stringify(other) !== "{}") {
			state = this.metaReducer.sfs(state, other)
		}

		if (option.path.indexOf('root.children.center.children.details.columns.debitAmount') != -1
			|| option.path.indexOf('root.children.center.children.details.columns.creditAmount') != -1) {
			let curPath = option.path.split('.cell.cell')[0].split('.'),
				curEditField = curPath[curPath.length - 1]

			details = this.metaReducer.gf(state, 'data.form.details')
			index = parseInt(option.path.split(',')[1])
			let detail = details.get(index),
				curAmount = detail.get(curEditField) == '-' ? 0 : detail.get(curEditField)

			if (!!curAmount) {
				details = this.rewriteQuantityAndCurrency(state, option.path, undefined) //反算"数量/外币"

				//格式化精度
				// 默认为空 1120 HAOZHAO
				//金额要先进行去千分位
				curAmount = parseFloat(clearThousandsPosition(curAmount)).toFixed(2)
				details = details.update(index, item => item.set(curEditField, curAmount))
				state = this.metaReducer.sf(state, 'data.form.details', details)
			}
		}

		return state
	}

	toggleAmountDirection = (state) => {
		let focusCellPath = this.metaReducer.gf(state, 'data.other.focusFieldPath'),
			editStatus = this.metaReducer.gf(state, 'data.other.editStatus'),//action.STATUS_EDIT 当前凭证状态
			data = this.metaReducer.gf(state, 'data.form.details'),
			index = parseInt(focusCellPath.split(',')[1])

		if (focusCellPath.indexOf('root.children.center.children.details.columns.debitAmount') != -1) {  //当前在借方
			data = data.update(index, item => this.switchAmount(item))
			state = this.metaReducer.sf(state, 'data.form.details', data)

			state = this.metaReducer.sf(state, 'data.other.focusFieldPath', focusCellPath.replace('debitAmount', 'creditAmount'))
		}
		else if (focusCellPath.indexOf('root.children.center.children.details.columns.creditAmount') != -1) {  //当前在贷方
			data = data.update(index, item => this.switchAmount(item))
			state = this.metaReducer.sf(state, 'data.form.details', data)

			state = this.metaReducer.sf(state, 'data.other.focusFieldPath', focusCellPath.replace('creditAmount', 'debitAmount'))
		}

		if (editStatus != 1) {//凭证状态不为新增时按下空格更改凭证状态未编辑状态，新增状态保持不变
			state = this.metaReducer.sf(state, 'data.other.editStatus', data.EDIT_STATUS)
		}

		return state
	}

	switchAmount = (item) => {
		let tmp = item.get('debitAmount')
		return item.set('debitAmount', item.get('creditAmount')).set('creditAmount', tmp)
	}

	onFieldFocus = (state, path, other) => {
		let index = path.split(',')[1],
			details = this.metaReducer.gf(state, 'data.form.details'),
			creditAmount = this.getTotalValue(details, 'creditAmount'),
			debitAmount = this.getTotalValue(details, 'debitAmount')
		if (other && JSON.stringify(other) !== "{}") {
			state = this.metaReducer.sfs(state, other)
		}
		//如果进入"科目"列,则清空辅助核算, 以便在没改动的时候, 离开时弹出辅助核算
		if (path.indexOf('root.children.center.children.details.columns.accountingSubject') != -1) {
			let detail = details.get(index)

			if (detail.get('accountingSubject')) {
				//暂存当前辅助核算项及科目名+辅助名称 haolj ADD START
				let curCellAuxAccountSubjects = detail.get('accountingSubject').get('auxAccountSubjects'),
					curCellCodeAndName = detail.get('accountingSubject').get('codeAndName')

				state = this.metaReducer.sf(state, 'curCellAuxAccountSubjects', curCellAuxAccountSubjects)
				state = this.metaReducer.sf(state, 'curCellCodeAndName', curCellCodeAndName)
				state = this.metaReducer.sf(state, 'isEdit', true)
				//暂存当前辅助核算项及科目名+辅助名称 haolj ADD END

				details = details.update(index, item => item.setIn(['accountingSubject', 'auxAccountSubjects'], undefined))
				state = this.metaReducer.sf(state, 'data.form.details', details)
			}
		}
		// 凭证焦点放入借贷自动找平
		else if (path.indexOf('root.children.center.children.details.columns.debitAmount') > -1) {
			//借方 如果当前分录借方小于贷方的值,并且当前分录对应的借贷金额都没有录入，自动找平借方,否则不管

			let currentCreditAmount = details.get(index).get('creditAmount')
			let currentDebitAmount = details.get(index).get('debitAmount')
			if (currentCreditAmount == '0' || currentCreditAmount == '0.00') {
				currentCreditAmount = ''
			}
			if (currentDebitAmount == '0' || currentDebitAmount == '0.00') {
				currentDebitAmount = ''
			}

			if (debitAmount < creditAmount
				&& !currentCreditAmount
				&& !currentDebitAmount) {
				state = this.makeAmountEqual(state)
				state = this.reCaculateBalance(state, path.split(',')[1])
			}
			state = this.metaReducer.sf(state, 'data.other.path', path)
		} else if (path.indexOf('root.children.center.children.details.columns.creditAmount') > -1) {
			//贷方 如果当前分录贷方方小于借方的值,并且当前分录对应的借贷金额都没有录入， 自动找平借方,否则不管

			let currentCreditAmount = details.get(index).get('creditAmount')
			let currentDebitAmount = details.get(index).get('debitAmount')
			if (currentCreditAmount == '0' || currentCreditAmount == '0.00') {
				currentCreditAmount = ''
			}
			if (currentDebitAmount == '0' || currentDebitAmount == '0.00') {
				currentDebitAmount = ''
			}
			if (creditAmount < debitAmount
				&& !currentCreditAmount
				&& !currentDebitAmount) {
				state = this.makeAmountEqual(state)
				state = this.reCaculateBalance(state, path.split(',')[1])
			}
			state = this.metaReducer.sf(state, 'data.other.path', path)
		} else if (path.indexOf('root.children.center.children.details.columns.summary') > -1) {
			state = this.metaReducer.sf(state, 'data.other.path', path)
		}

		state = this.checkRowState(state, path)
		return state
	}
	updateSpecialAmount = (state, path, oldValue, newValue, isMinus = true) => {
		if (path.indexOf('root.children.center.children.details') != -1) {
			let editStatus = this.metaReducer.gf(state, 'data.other.editStatus')

			//一借多贷，一贷多借，一借一贷，录入时自动平衡
			//如果填写的是"借方金额"或"贷方金额", 把对方方向的数量清零
			if (path.indexOf('root.children.center.children.details.columns.debitAmount') != -1 ||
				path.indexOf('root.children.center.children.details.columns.creditAmount') != -1) {
				let curPath = path.split('.cell.cell')[0].split('.'),
					curEditField = curPath[curPath.length - 1],
					rowIndex = parseInt(path.split(',')[1])
				oldValue = this.metaReducer.gf(state, 'data.form.details').get(rowIndex).get(curEditField)

				if (this.isEnterTestSign('=', oldValue, newValue) && isMinus == true) {
					state = this.makeAmountEqual(state)
					newValue = this.getNewValueAmount(state, path)
					state = this.reCaculateBalance(state, rowIndex, undefined)
				} else if (this.isEnterTestSign('-', oldValue, newValue) && isMinus == true) {					
					state = this.toggleAmountPositive(state)
					newValue = this.getNewValueAmount(state, path)
					state = this.reCaculateBalance(state, rowIndex, undefined)
				} else {

				}

			}

			if (oldValue != newValue) {  //点选右边修改科目使其保存可用
				if (editStatus == data.EDIT_STATUS || editStatus == data.VIEW_STATUS) {
					state = this.changeStatus(state, data.EDIT_STATUS)
				}
			}
		}
		return state
	}
	onFieldChange = (state, path, oldValue, newValue, isMinus = true) => {
		if (path.indexOf('root.children.center.children.details') != -1) {
			let editStatus = this.metaReducer.gf(state, 'data.other.editStatus')

			//一借多贷，一贷多借，一借一贷，录入时自动平衡
			//如果填写的是"借方金额"或"贷方金额", 把对方方向的数量清零
			if (path.indexOf('root.children.center.children.details.columns.debitAmount') != -1 ||
				path.indexOf('root.children.center.children.details.columns.creditAmount') != -1) {
				let curPath = path.split('.cell.cell')[0].split('.'),
					curEditField = curPath[curPath.length - 1],
					rowIndex = parseInt(path.split(',')[1])
				oldValue = this.metaReducer.gf(state, 'data.form.details').get(rowIndex).get(curEditField)

				if (this.isEnterTestSign('=', oldValue, newValue) && isMinus == true) {
					state = this.makeAmountEqual(state)
					newValue = this.getNewValueAmount(state, path)
					state = this.reCaculateBalance(state, rowIndex, undefined)
				} else if (this.isEnterTestSign('-', oldValue, newValue) && isMinus == true) {					
					state = this.toggleAmountPositive(state)
					newValue = this.getNewValueAmount(state, path)
					state = this.reCaculateBalance(state, rowIndex, undefined)
				} else {
					if (newValue > 9999999999.99) {
						newValue = 9999999999.99
					} else if (newValue < -9999999999.99) {
						newValue = -9999999999.99
					}

					state = this.metaReducer.sf(state, `data.form.details.${rowIndex}.${curEditField}`, newValue)
					let details = this.metaReducer.gf(state, 'data.form.details')
					//金额 change事件减少设置state的代码

					details = this.getDebitAndCreditBalance(state, path, newValue, details)
					state = this.reCaculateBalance(state, rowIndex, undefined, details)
				}

			}
			else if (path.indexOf('root.children.center.children.details.columns.quantityAndForeignCurrency') != -1) {
				let rowIndex = parseInt(path.split(',')[1])
				let details = this.metaReducer.gf(state, 'data.form.details')
				state = this.rewriteAmount(state, path, oldValue, newValue)
				state = this.setRateUpdateFlg(state, path, oldValue, newValue)
			}
			//选择科目: 检查是否显示"数量/外币"
			else if (path.indexOf('root.children.center.children.details.columns.accountingSubject') != -1) {
				if (typeof newValue == 'object') {
					state = this.checkQuantityAndForeignCurrency(state, path, newValue)
				}
			}

			if (oldValue != newValue) {  //点选右边修改科目使其保存可用
				if (editStatus == data.EDIT_STATUS || editStatus == data.VIEW_STATUS) {
					state = this.changeStatus(state, data.EDIT_STATUS)
				}
			}
		}
		return state
	}
	updateAmount = (state, path, oldValue, newValue) => {
		let curPath = path.split('.cell.cell')[0].split('.'),
			curEditField = curPath[curPath.length - 1],
			rowIndex = parseInt(path.split(',')[1])
		oldValue = this.metaReducer.gf(state, 'data.form.details').get(rowIndex).get(curEditField)
		if (newValue > 9999999999.99) {
			newValue = 9999999999.99
		} else if (newValue < -9999999999.99) {
			newValue = -9999999999.99
		}

		state = this.metaReducer.sf(state, `data.form.details.${rowIndex}.${curEditField}`, newValue)
		let details = this.metaReducer.gf(state, 'data.form.details')
		//金额 change事件减少设置state的代码

		details = this.getDebitAndCreditBalance(state, path, newValue, details)
		state = this.reCaculateBalance(state, rowIndex, undefined, details)
		return state
	}
	// 汇率发生变更后，给该行分录作标记(currencyForUpdateRate)，用于保存凭证时后端调度更新基础档案的币种汇率
	setRateUpdateFlg = (state, path, oldValue, newValue) => {
		let curRowIndex = parseInt(path.split(',')[1])

		if (this.metaReducer.gf(state, 'data.form.details').get(curRowIndex).get('accountingSubject') && this.metaReducer.gf(state, 'data.form.details').get(curRowIndex).get('accountingSubject').get('isCalcMulti') == true) {
			if (oldValue.get('currency') && newValue.get('currency') &&
				oldValue.get('currency').get('id') == newValue.get('currency').get('id') &&
				oldValue.get('currency').get('exchangeRate') != newValue.get('exchangeRate')) {

				let currencyId = newValue.get('currency').get('id'),
					currencyDS = this.metaReducer.gf(state, 'data.other.currencyDS'),
					index = currencyDS.findIndex(item => {
						return item.get('id') == currencyId
					})

				if (index > -1) {
					let details = this.metaReducer.gf(state, 'data.form.details'),
						currency = details.get(curRowIndex).getIn(['quantityAndForeignCurrency', 'currency']),
						selectedCurrency = currencyDS.get(index)

					let formatRate = utils.number.toFixedLocal(parseFloat(newValue.get('exchangeRate')), 6)

					selectedCurrency = selectedCurrency.set('exchangeRate', formatRate)
					currency = currency.set('exchangeRate', newValue.get('exchangeRate'))
					details = details.update(parseInt(curRowIndex), item => item.setIn(['quantityAndForeignCurrency', 'currency'], currency))
					details = details.update(parseInt(curRowIndex), item => item.set('currencyForUpdateRate', selectedCurrency))

					for (var i = 0; i < details.size; i++) {
						if (i != curRowIndex &&
							details.get(i).getIn(['quantityAndForeignCurrency', 'currency']) &&
							details.get(i).getIn(['quantityAndForeignCurrency', 'currency']).get('id') == currencyId) {

							details = details.update(i, item => item.set('currencyForUpdateRate', undefined))
						}
					}

					state = this.metaReducer.sf(state, 'data.form.details', details)

					currencyDS = currencyDS.update(index, item => item.set('exchangeRate', newValue.get('exchangeRate')))
					state = this.metaReducer.sf(state, 'data.other.currencyDS', currencyDS)
					let glAccounts = window.accountingSubjects,
						// let glAccounts = this.metaReducer.gf(state, 'data.other.accountingSubjects'),
						// glAccountsAll = this.metaReducer.gf(state, 'data.other.accountingSubjectsAll')
						glAccountsAll = window.accountingSubjectsAll
					glAccounts = glAccounts.map(item => {
						if (item.get('currencyId') == currencyId) {
							item = item.set('exchangeRate', newValue.get('exchangeRate'))
						}
						return item
					})
					glAccountsAll = glAccounts.map(item => {
						if (item.get('currencyId') == currencyId) {
							item = item.set('exchangeRate', newValue.get('exchangeRate'))
						}
						return item
					})
					window.accountingSubjects = fromJS(glAccounts)
					window.accountingSubjectsAll = fromJS(glAccountsAll)
					// state = this.metaReducer.sf(state, 'data.other.accountingSubjects', glAccounts)					
					// state = this.metaReducer.sf(state, 'data.other.accountingSubjectsAll', glAccountsAll)
				}
				// 变更币种时
			} else if (oldValue.get('currency') && newValue.get('currency') &&
				oldValue.get('currency').get('id') != newValue.get('currency').get('id')) {

				let currencyId = newValue.get('currency').get('id'),
					currencyDS = this.metaReducer.gf(state, 'data.other.currencyDS'),
					index = currencyDS.findIndex(item => {
						return item.get('id') == currencyId
					})

				if (index > -1) {
					let details = this.metaReducer.gf(state, 'data.form.details'),
						currency = details.get(curRowIndex).getIn(['quantityAndForeignCurrency', 'currency']),
						selectedCurrency = currencyDS.get(index)

					if (selectedCurrency.get('exchangeRate') != newValue.get('exchangeRate')) {
						selectedCurrency = selectedCurrency.set('exchangeRate', newValue.get('exchangeRate'))
						currency = currency.set('exchangeRate', newValue.get('exchangeRate'))
						details = details.update(parseInt(curRowIndex), item => item.setIn(['quantityAndForeignCurrency', 'currency'], currency))
						details = details.update(parseInt(curRowIndex), item => item.set('currencyForUpdateRate', selectedCurrency))

						for (var i = 0; i < details.size; i++) {
							if (i != curRowIndex &&
								details.get(i).getIn(['quantityAndForeignCurrency', 'currency']) &&
								details.get(i).getIn(['quantityAndForeignCurrency', 'currency']).get('id') == currencyId) {

								details = details.update(i, item => item.set('currencyForUpdateRate', undefined))
							}
						}

						state = this.metaReducer.sf(state, 'data.form.details', details)

						currencyDS = currencyDS.update(index, item => item.set('exchangeRate', newValue.get('exchangeRate')))
						state = this.metaReducer.sf(state, 'data.other.currencyDS', currencyDS)
						let glAccounts = window.accountingSubjects,
							// let glAccounts = this.metaReducer.gf(state, 'data.other.accountingSubjects'),
							// glAccountsAll = this.metaReducer.gf(state, 'data.other.accountingSubjectsAll')
							glAccountsAll = window.accountingSubjectsAll
						glAccounts = glAccounts.map(item => {
							if (item.get('currencyId') == currencyId) {
								item = item.set('exchangeRate', newValue.get('exchangeRate'))
							}
							return item
						})
						glAccountsAll = glAccounts.map(item => {
							if (item.get('currencyId') == currencyId) {
								item = item.set('exchangeRate', newValue.get('exchangeRate'))
							}
							return item
						})
						window.accountingSubjects = fromJS(glAccounts)
						window.accountingSubjectsAll = fromJS(glAccountsAll)
						// state = this.metaReducer.sf(state, 'data.other.accountingSubjects', glAccounts)						
						// state = this.metaReducer.sf(state, 'data.other.accountingSubjectsAll', glAccountsAll)
					}
				}
			}
		}

		return state
	}

	reCaculateBalance = (state, rowIndex, isDelRow, formdetails) => {
		let details = formdetails ? formdetails : this.metaReducer.gf(state, 'data.form.details')
		if (this.metaReducer.gf(state, 'data.other.editStatus') != data.ADD_STATUS) {
			state = this.metaReducer.sf(state, 'data.form.details', details)
			return state
		}
		if (!details.get(rowIndex).get('accountingSubject')) {
			state = this.metaReducer.sf(state, 'data.form.details', details)
			return state
		}

		let detail = details.get(rowIndex),
			accountingSubject = detail.get('accountingSubject'),
			balance = utils.number.transferData(accountingSubject.get('balance')),
			initBalance = accountingSubject.get('initBalance')
		let amount = 0
		let itemSubject
		for (var i = 0; i < details.size; i++) {
			itemSubject = details.get(i).get('accountingSubject')
			if (itemSubject && itemSubject.get('code') == accountingSubject.get('code') &&
				(!isDelRow || (isDelRow && rowIndex != i))) {
				if (!itemSubject.get('isCalc')) {
					if (itemSubject.get('balanceDirection') == data.DIRECTION_DEBIT) {
						amount = amount + utils.number.transferData(details.get(i).get('debitAmount')) - utils.number.transferData(details.get(i).get('creditAmount'))
					} else {
						amount = amount - utils.number.transferData(details.get(i).get('debitAmount')) + utils.number.transferData(details.get(i).get('creditAmount'))
					}
				} else if (itemSubject.get('isCalc') &&
					this.isEqualAuxAccountSubjects(itemSubject.get('auxAccountSubjects'), accountingSubject.get('auxAccountSubjects'))) {
					if (itemSubject.get('balanceDirection') == data.DIRECTION_DEBIT) {
						amount = amount + utils.number.transferData(details.get(i).get('debitAmount')) - utils.number.transferData(details.get(i).get('creditAmount'))
					} else {
						amount = amount - utils.number.transferData(details.get(i).get('debitAmount')) + utils.number.transferData(details.get(i).get('creditAmount'))
					}
				}
			}
		}
		balance = (initBalance ? initBalance.balance != undefined ? initBalance.balance : initBalance.get('balance') + amount : 0).toFixed(2)
		for (var j = 0; j < details.size; j++) {
			itemSubject = details.get(j).get('accountingSubject')

			if (itemSubject && itemSubject.get('code') == accountingSubject.get('code') &&
				(!isDelRow || (isDelRow && rowIndex != j))) {
				if (!itemSubject.get('isCalc')) {
					details = details.update(j, item => item.setIn(['accountingSubject', 'balance'], balance))
					details = details.update(j, item => item.setIn(['accountingSubject', 'initBalance'], fromJS(accountingSubject.get('initBalance'))))
				} else if (itemSubject.get('isCalc') &&
					this.isEqualAuxAccountSubjects(itemSubject.get('auxAccountSubjects'), accountingSubject.get('auxAccountSubjects'))) {
					details = details.update(j, item => item.setIn(['accountingSubject', 'balance'], balance))
					details = details.update(j, item => item.setIn(['accountingSubject', 'initBalance'], fromJS(accountingSubject.get('initBalance'))))
				}
			}
		}

		state = this.metaReducer.sf(state, 'data.form.details', details)
		return state
	}

	//填写"数量/外币": 修改借方/贷方金额,规则:
	// 1)如果有一方填写了金额,则修改该金额的值
	// 2)如果损益类科目(accountTypeId==ACCOUNTTYPE_PROFITANDLOSS),根据科目方向
	// 2.5）在已经【借贷平】的情况下，数量核算外币核算的弹出框确定后，返回到借方金额。
	// 3)其他科目,且借贷方都没有金额,第一行或上一行为空则填借方,否则与上一行方向相同
	rewriteAmount = (state, path, oldValue, newValue) => {
		let index = path.split(',')[1],
			isFillDebit = true, //是否填写借方
			details = this.metaReducer.gf(state, 'data.form.details'),
			detail = details.get(index),
			debitAmount = detail.get('debitAmount'),
			creditAmount = detail.get('creditAmount')
		if (debitAmount != 0) {
			isFillDebit = true
		}
		else if (creditAmount != 0) {
			isFillDebit = false
		}
		else {
			let accountSubject = detail.get('accountingSubject')
			if (accountSubject.get('accountTypeId') == data.ACCOUNTTYPE_PROFITANDLOSS) {  //损益类科目,根据科目方向填
				isFillDebit = accountSubject.get('balanceDirection') == 0
			}
			else {
				if (index == 0) {
					isFillDebit = true
				}
				else {
					//todo 
					let lastRowDebitAmount = details.get(index - 1).get('debitAmount'),
						lastRowCreditAmount = details.get(index - 1).get('creditAmount')
					let isEqaul = this.getEqualAmount(state) == 0
					if (isEqaul) {
						isFillDebit = true
					} else {
						if (lastRowDebitAmount != 0) {
							isFillDebit = false
						}
						else if (lastRowCreditAmount != 0) {
							isFillDebit = true
						}
						else {
							isFillDebit = true
						}
					}
				}
			}
		}
		//格式化精度
		let amount = newValue.get('amount'),
			quantity = newValue.get('quantity'),
			amountPath = isFillDebit ? path.replace('quantityAndForeignCurrency', 'debitAmount')
				: path.replace('quantityAndForeignCurrency', 'creditAmount'),
			precision = 2

		if (precision && amount) {
			amount = parseFloat(amount).toFixed(precision)
			quantity = parseFloat(quantity).toFixed(6)
		}

		let isMinus = false
		if (isFillDebit) {
			state = this.onFieldChange(state, 'root.children.center.children.details.columns.debitAmount.cell.cell,' + index,
				detail.get('debitAmount'),
				amount, isMinus)

		}
		else {
			state = this.onFieldChange(state, 'root.children.center.children.details.columns.creditAmount.cell.cell,' + index,
				detail.get('creditAmount'),
				amount, isMinus)
		}

		details = this.metaReducer.gf(state, 'data.form.details')
		details = details.update(index, item => item.set('quantityAndForeignCurrency', newValue))
		state = this.metaReducer.sf(state, 'data.form.details', details)
		details = this.getDebitAndCreditBalance(state, amountPath, amount, details)
		state = this.metaReducer.sf(state, 'data.form.details', details)
		return state
	}

	//按下负号, 切换当前焦点的数值正负性
	toggleAmountPositive = (state, eventName = '', keyEvent = null) => {		
		let focusCellPath = this.metaReducer.gf(state, 'data.other.focusFieldPath'),
			details = this.metaReducer.gf(state, 'data.form.details'),
			editStatus = this.metaReducer.gf(state, 'data.other.editStatus'),
			index = parseInt(focusCellPath.split(',')[1])
		if (focusCellPath.indexOf('root.children.center.children.details.columns.debitAmount') != -1) {  //当前在借方
			if (eventName == 'onShortcutKey' && keyEvent) {
				details = details.update(index, item => item.set('debitAmount', -parseFloat(utils.number.transferData(keyEvent.target.value))))
			} else {
				details = details.update(index, item => item.set('debitAmount', -parseFloat(utils.number.transferData(item.get('debitAmount')))))
			}

			let debitAmount = parseFloat(details.get(index).get('debitAmount'))
			details = this.getDebitAndCreditBalance(state, focusCellPath, debitAmount, details)//自动找平
			state = this.metaReducer.sf(state, 'data.form.details', details)
		}
		else if (focusCellPath.indexOf('root.children.center.children.details.columns.creditAmount') != -1) {  //当前在贷方
			if (eventName == 'onShortcutKey' && keyEvent) {
				details = details.update(index, item => item.set('creditAmount', -parseFloat(utils.number.transferData(keyEvent.target.value))))
			} else{
				details = details.update(index, item => item.set('creditAmount', -parseFloat(utils.number.transferData(item.get('creditAmount')))))
			}
			
			let creditAmount = parseFloat(details.get(index).get('creditAmount'))
			details = this.getDebitAndCreditBalance(state, focusCellPath, creditAmount, details)//自动找平
			state = this.metaReducer.sf(state, 'data.form.details', details)
		}

		if (editStatus != data.ADD_STATUS) {//凭证状态不为新增时按下负号更改凭证状态未编辑状态，新增状态保持不变
			state = this.metaReducer.sf(state, 'data.other.editStatus', data.EDIT_STATUS)
		}
		return state
	}

	getDebitAndCreditBalance = (state, path, newValue, details, status) => {
		let rowIndex = parseInt(path.split(',')[1]),
			editStatus = this.metaReducer.gf(state, 'data.other.editStatus'),
			debitNum = 0, creditNum = 0, debitSum = 0, creditSum = 0
		if (!status) {//onFieldChange修改金额，待抵扣进项税额修改贷方金额 自动找平
			let changeAmountIndex,
				beforeAmountChange

			if (path.indexOf('root.children.center.children.details.columns.debitAmount') != -1 && newValue) {
				// if (editStatus == data.EDIT_STATUS) {//修改状态下自动找平，非修改状态不做处理
				// 	let creditIndex = -1 //多对一，贷方是否为待抵扣进项税额
				// COMMENT 0201 HAOZHAO START 现不支持待抵扣进项税 故先注释掉
				// details.map((item, index) => {
				// 	let debitAmountItem = parseInt((parseFloat(item.get('debitAmount') || 0) * 100).toFixed(0)),
				// 		creditAmountItem = parseInt((parseFloat(item.get('creditAmount') || 0) * 100).toFixed(0))
				//
				// 	if (item.get('debitAmount') && item.get('debitAmount') != '' || index == rowIndex) {
				// 		if (index != rowIndex) {
				// 			debitSum = (parseInt((debitSum * 100).toFixed(0)) + debitAmountItem) / 100
				// 		} else if (index == rowIndex) {
				// 			let newValueTemp = parseInt((parseFloat(newValue || 0) * 100).toFixed(0))
				// 			debitSum = (parseInt((debitSum * 100).toFixed(0)) + newValueTemp) / 100
				// 		}
				// 		debitNum += 1
				// 	}
				// 	if (item.get('creditAmount') && item.get('creditAmount') != '') {
				// 		if (item.get('accountingSubject') &&
				// 			item.get('accountingSubject').get('cashTypeId') == 350014) {//若贷方1科目为22210401
				// 			creditIndex = index
				// 		}
				// 		creditNum += 1
				// 		creditSum = (parseInt((creditSum * 100).toFixed(0)) + creditAmountItem) / 100
				// 	}
				// })
				// COMMENT 0201 HAOZHAO END 现不支持待抵扣进项税 故先注释掉
				// 	if (creditIndex == -1) {//不为待抵扣进项税额
				// 		if (creditNum == 1 && debitNum == creditNum) {
				// 			if (!!newValue && newValue != 0) {
				// 				details.map((item, index) => {
				// 					if (item.get('creditAmount') && item.get('creditAmount') != '') {
				// 						changeAmountIndex = index
				// 						beforeAmountChange = item.get('creditAmount')
				// 						details = details.update(index, item => item.set('creditAmount', debitSum))
				// 					}
				// 				})
				// 			}
				// 		} else if (creditNum == 1 && debitNum > creditNum) {
				// 			details.map((item, index) => {
				// 				if (item.get('creditAmount') && item.get('creditAmount') != '') {
				// 					changeAmountIndex = Number(index)
				// 					details = details.update(index, item => item.set('creditAmount', debitSum))
				// 				}
				// 			})
				// 		}
				// 	}
				// }

				details = details.update(rowIndex, item => item.set('creditAmount', 0))//如果填写的是"借方金额"或"贷方金额", 把对方方向的数量清零
				// state = this.metaReducer.sf(state, 'data.form.details', details)
				// if (typeof (changeAmountIndex) == 'number') {
				// 	state = this.rewriteQuantityAndCurrency(state, 'root.children.center.children.details.columns.creditAmount.cell.cell,' + changeAmountIndex, beforeAmountChange)//自动找平一方若启用数量外币则自动反算
				// }
			}
			else if (path.indexOf('root.children.center.children.details.columns.creditAmount') != -1) {
				if (editStatus == data.EDIT_STATUS) {
					// details.map((item, index) => {
					// 	let debitAmountItem = parseInt((parseFloat(item.get('debitAmount') || 0) * 100).toFixed(0)),
					// 		creditAmountItem = parseInt((parseFloat(item.get('creditAmount') || 0) * 100).toFixed(0))

					// 	if (item.get('creditAmount') && item.get('creditAmount') != '' || index == rowIndex) {
					// 		if (index != rowIndex) {
					// 			creditSum = (parseInt((creditSum * 100).toFixed(0)) + creditAmountItem) / 100
					// 		} else if (index == rowIndex) {
					// 			let newValueTemp = parseInt((parseFloat(newValue || 0) * 100).toFixed(0))
					// 			creditSum = (parseInt((creditSum * 100).toFixed(0)) + newValueTemp) / 100
					// 		}
					// 		creditNum += 1
					// 	}
					// 	if (item.get('debitAmount') && item.get('debitAmount') != '') {
					// 		debitNum += 1
					// 		debitSum = (parseInt((debitSum * 100).toFixed(0)) + debitAmountItem) / 100
					// 	}
					// })
					// if (debitNum == 1 && creditNum == debitNum) {
					// 	if (!!newValue && newValue != 0 && !Number.isNaN(creditSum)) {
					// 		details.map((item, index) => {
					// 			if (item.get('debitAmount') && item.get('debitAmount') != '') {
					// 				changeAmountIndex = index
					// 				beforeAmountChange = item.get('debitAmount')
					// 				details = details.update(index, item => item.set('debitAmount', creditSum))
					// 			}
					// 		})
					// 	}
					// } else if (debitNum == 1 && creditNum > debitNum && !Number.isNaN(creditSum)) {
					// 	details.map((item, index) => {
					// 		if (item.get('debitAmount') && item.get('debitAmount') != '') {
					// 			changeAmountIndex = Number(index)
					// 			details = details.update(index, item => item.set('debitAmount', creditSum))
					// 		}
					// 	})
					// }
				}
				if (newValue) {
					details = details.update(rowIndex, item => item.set('debitAmount', 0))//如果填写的是"借方金额"或"贷方金额", 把对方方向的数量清零
				}

				// state = this.metaReducer.sf(state, 'data.form.details', details)
				// if (typeof (changeAmountIndex) == 'number') {
				// 	state = this.rewriteQuantityAndCurrency(state, 'root.children.center.children.details.columns.debitAmount.cell.cell,' + changeAmountIndex, beforeAmountChange)//自动找平一方若启用数量外币则自动反算
				// }
			}
		}

		return details
	}

	isEnterTestSign = (testSign, oldValue, newValue) => {
		if (oldValue == '' || oldValue == undefined) {
			if (testSign == newValue) {
				return true
			} else {
				return false
			}
		}

		let singleChar, ret = false
		oldValue = oldValue.toString()
		newValue = newValue.toString()
		for (let i = 0; i < oldValue.length; i++) {
			singleChar = oldValue.substr(i, 1)
			newValue = newValue.replace(singleChar, '')
		}

		if (newValue == testSign) {
			ret = true
		}

		return ret
	}

	//按下等号, 填写当前焦点,清空对方金额, 使得借贷平衡
	makeAmountEqual = (state) => {

		let focusCellPath = this.metaReducer.gf(state, 'data.other.focusFieldPath'),
			deltaAmount = parseFloat(this.getEqualAmount(state)),
			data = this.metaReducer.gf(state, 'data.form.details'),
			index = parseInt(focusCellPath.split(',')[1])

		if (focusCellPath.indexOf('root.children.center.children.details.columns.debitAmount') != -1) {  //借方
			data = data.update(index, item => item.set('debitAmount', -deltaAmount).set('creditAmount', 0))
			state = this.metaReducer.sf(state, 'data.form.details', data)
		}
		else if (focusCellPath.indexOf('root.children.center.children.details.columns.creditAmount') != -1) {  //贷方
			data = data.update(index, item => item.set('creditAmount', deltaAmount).set('debitAmount', 0))
			state = this.metaReducer.sf(state, 'data.form.details', data)
		}

		return state
	}

	//计算使得借贷平衡的金额
	getEqualAmount = (state) => {
		let details = this.metaReducer.gf(state, 'data.form.details'),
			creditTotal = this.getTotalValue(details, 'creditAmount'),
			debitTotal = this.getTotalValue(details, 'debitAmount'),
			focusCellPath = this.metaReducer.gf(state, 'data.other.focusFieldPath')

		if (!focusCellPath) {
			return (debitTotal - creditTotal).toFixed(2)
		}

		let rowIndex = parseInt(focusCellPath.split(',')[1]),
			detail = details.get(rowIndex),
			debitAmountOfFocusRow = 0,
			creditAmountOfFocusRow = 0

		if (focusCellPath.indexOf('root.children.center.children.details.columns.debitAmount') != -1) {
			debitAmountOfFocusRow = parseFloat(detail.get('debitAmount'))
			creditAmountOfFocusRow = parseFloat(detail.get('creditAmount'))
		}
		else if (focusCellPath.indexOf('root.children.center.children.details.columns.creditAmount') != -1) {
			creditAmountOfFocusRow = parseFloat(detail.get('creditAmount'))
			debitAmountOfFocusRow = parseFloat(detail.get('debitAmount'))
		}
		return ((debitTotal || 0) - (creditTotal || 0) - (debitAmountOfFocusRow || 0) + (creditAmountOfFocusRow || 0)).toFixed(2)
	}

	getNewValueAmount = (state, path) => {
		let curFieldPath = path.split('.cell.cell')[0].split('.'),
			curEditField = curFieldPath[curFieldPath.length - 1],
			rowIndex = parseInt(path.split(',')[1]),
			data = this.metaReducer.gf(state, 'data.form.details')

		return parseFloat(data.get(rowIndex).get(curEditField)).toFixed(2)
	}

	getTotalValue = (details, fieldName) => {
		let total = 0

		details.map((item, index) => {
			total += parseFloat(item.get(fieldName) || '0')
		})

		if (fieldName == 'debitAmount' || fieldName == 'creditAmount') {
			if (total >= 99999999999.99) {
				return total = 99999999999.99
			} else {
				return total
			}
		} else {
			return total
		}
	}

	accountQuantityIsShow = (state, option) => {
		let balanceDirection
		let path = option.path,
			nextPath

		if (!!option.error) {
			state = this.metaReducer.sf(state, 'data.other.isShow', true)
		} else {
			if (option.path.indexOf('root.children.center.children.details.columns.quantityAndForeignCurrency') != -1 &&
				option.isToNextCell != false) {

				let details = this.metaReducer.gf(state, 'data.form.details'),
					index = parseInt(option.path.split(',')[1]),
					detail = details.get(index)

				balanceDirection = detail.getIn(['accountingSubject', 'balanceDirection'])
				if (balanceDirection == 1) {
					let debitPath = this.getNextFocusCellPath(state, path)
					nextPath = this.getNextFocusCellPath(state, debitPath)
				} else {
					nextPath = this.getNextFocusCellPath(state, path)
				}
				if (nextPath != option.path) {
					state = this.setGridFocus(state, nextPath)
				}
				state = this.checkRowState(state, nextPath)  //如果自动切换到最后一行,则新增一行
			}
			state = this.metaReducer.sf(state, 'data.other.isShow', false)
		}

		return state
	}

	//检查当前行状态
	checkRowState = (state, path, isParamChanged = false) => {
		let index = parseInt(path.split(',')[1]),
			fieldPath = path.split(',')[0],
			details = this.metaReducer.gf(state, 'data.form.details'),
			isChanged

		//已审核状态不可编辑
		if (this.metaReducer.gf(state, 'data.form.certificateStatus') == data.STATUS_VOUCHER_AUDITED
			|| this.metaReducer.gf(state, 'root.children.center.children.details.columns.creditAmount.isReadOnly') == true
		) {
			return state
		}

		//如果已经到最后一行,则新增一个空行

		if (index == details.size - 1) {
			details = details.push(Map(data.blankVoucherItem))
			state = this.metaReducer.sf(state, 'data.form.details', details)
			isChanged = true
		}
		//如果切换到了"摘要"(新的一行)
		if (fieldPath.indexOf('root.children.center.children.details.columns.summary') != -1) {
			if (index > 0) {
				//将上一行摘要自动填入下一行
				let lastItem = details.get(index - 1)
				if (!details.get(index).get('summary') && lastItem.get('summary')) {
					details = details.update(index, item => item.set('summary', lastItem.get('summary')))
					state = this.metaReducer.sf(state, 'data.form.details', details)
					isChanged = true
				}
			} else if (index == 0) {
				isChanged = false
			}
		}
		// 先保留 HAOZHAO 0305 START
		// else if (fieldPath.indexOf('root.children.center.children.details.columns.debitAmount') != -1 && index > 0) {
		// 	if (!details.get(index).get('debitAmount') && !details.get(index).get('creditAmount')) {
		// 		let deltaAmount = this.getEqualAmount(state)
		// 		if (deltaAmount < 0) {   //贷方金额大,则填写借方金额
		// 			details = details.update(index, item => item.set('debitAmount', -deltaAmount))
		// 			state = this.metaReducer.sf(state, 'data.form.details', details)
		// 			isChanged = true
		// 		}
		// 	}
		// }
		// else if (fieldPath.indexOf('root.children.center.children.details.columns.creditAmount') != -1 && index > 0) {
		// 	if (!details.get(index).get('debitAmount') && !details.get(index).get('creditAmount')) {
		// 		let deltaAmount = this.getEqualAmount(state)
		// 		if (deltaAmount > 0) {  //借方金额大,则填写贷方
		// 			details = details.update(index, item => item.set('creditAmount', deltaAmount))
		// 			state = this.metaReducer.sf(state, 'data.form.details', details)
		// 			isChanged = true
		// 		}
		// 	}
		// }
		// 先保留 HAOZHAO 0305 END

		isChanged = isParamChanged == true ? isParamChanged : isChanged
		if (isChanged && this.metaReducer.gf(state, 'data.other.editStatus') == data.VIEW_STATUS) {
			state = this.changeStatus(state, data.EDIT_STATUS)
		}

		return state
	}

	getNextFocusCellPath = (state, path) => {
		if (path.indexOf('root.children.center.children.details') == -1 || path.indexOf(',') == -1) {
			return path
		}
		let index = path.split(',')[1],
			pageMeta = data.getMeta(),
			bodyColumns = pageMeta.children[3].children[1].columns  //凭证Grid的列信息

		let curPath = path.split('.cell.cell')[0].split('.'),
			currentFieldName = curPath[curPath.length - 1],
			nextFiledName = undefined,
			nextIndex = undefined

		for (let i = 0; i < bodyColumns.length; i++) {
			if (bodyColumns[i].name === currentFieldName) {
				//填写了借方金额 或 在贷方金额cell里,则切换到下一行
				if (i == bodyColumns.length - 1) {
					nextFiledName = bodyColumns[0].name
					nextIndex = parseInt(index) + 1
				}
				else {
					for (let j = i + 1; j < bodyColumns.length; j++) {
						if (!bodyColumns[j].disabled) {
							nextFiledName = bodyColumns[j].name
							break
						}
					}
					nextIndex = index
				}

				break
			}
		}

		if (nextFiledName && nextIndex) {
			return path.split(',')[0].replace(currentFieldName, nextFiledName) + ',' + nextIndex
		}
		else {
			return path
		}
	}

	clearGridFocus = (state) => {
		return this.metaReducer.sf(state, 'data.other.focusFieldPath', undefined)
	}

	setGridFocus = (state, path) => {
		return this.metaReducer.sf(state, 'data.other.focusFieldPath', path)
	}

	//清空单元格
	clearCell = (state, fieldName, index) => {
		let details = this.metaReducer.gf(state, 'data.form.details')
		details = details.set(index, details.get(index).set(fieldName, ''))
		return this.metaReducer.sf(state, 'data.form.details', details)
	}

	//开始输入辅助核算: 表格不可编辑 + 清空焦点
	startEditAuxAccount = (state) => {
		state = this.setGridDisabledState(state, true)
		state = this.metaReducer.sf(state, 'data.other.hidePopover', true)

		return this.clearGridFocus(state)
	}

	moveRowToUpOrDown = (state, gridName, rowIndex, upOrDown) => {
		let details = this.metaReducer.gf(state, `data.form.${gridName}`).toJS()

		let curItem = details[rowIndex],
			targetItem = details[rowIndex - 1]

		if (upOrDown == data.MOVEROW_UP) {
			curItem = details[rowIndex]
			targetItem = details[rowIndex - 1]
			details[rowIndex - 1] = curItem
			details[rowIndex] = targetItem
		} else if (upOrDown == data.MOVEROW_DOWN) {
			curItem = details[rowIndex]
			targetItem = details[rowIndex + 1]
			details[rowIndex + 1] = curItem
			details[rowIndex] = targetItem
		}

		let editStatus = this.metaReducer.gf(state, 'data.other.editStatus') == data.ADD_STATUS ? data.ADD_STATUS : data.EDIT_STATUS

		state = this.metaReducer.sf(state, `data.form.${gridName}`, fromJS(details))
		state = this.changeStatus(state, editStatus, data.STATUS_VOUCHER_NOT_AUDITED)

		return state
	}

	// 表格浮动新增需要改变单据状态
	addRowBefore = (state, gridName, rowIndex) => {
		state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', rowIndex + 1) //解决滚动条回到第一行的问题

		let newEditStatus = this.metaReducer.gf(state, 'data.other.editStatus') == data.ADD_STATUS ? data.ADD_STATUS : data.EDIT_STATUS

		state = this.changeStatus(state, newEditStatus, data.STATUS_VOUCHER_NOT_AUDITED)

		return state
	}

	//1)记录被删除的分录,用以上传服务端  2) 设置为编辑状态
	delRowBefore = (state, gridName, rowIndex, details) => {
		state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', rowIndex) //解决滚动条回到第一行的问题

		let deletedCertificateItems = this.metaReducer.gf(state, 'data.other.deletedCertificateItems'),
			detail = this.metaReducer.gf(state, 'data.form.details').get(rowIndex)

		if (detail.get('id')) {
			if (!deletedCertificateItems) {
				deletedCertificateItems = List()
			}
			deletedCertificateItems = deletedCertificateItems.push(detail)
			state = this.metaReducer.sf(state, 'data.other.deletedCertificateItems', deletedCertificateItems)
		}

		state = this.reCaculateBalance(state, rowIndex, true)

		let newEditStatus = this.metaReducer.gf(state, 'data.other.editStatus') == data.ADD_STATUS ? data.ADD_STATUS : data.EDIT_STATUS
		state = this.changeStatus(state, newEditStatus, data.STATUS_VOUCHER_NOT_AUDITED)

		return state
	}

	//检查是否出"数量/外币"列
	checkQuantityAndForeignCurrency = (state, path, newValue, quantityAndForeignCurrency) => {
		let index = parseInt(path.split(',')[1])

		if (newValue.get('isCalcQuantity') || newValue.get('isCalcMulti')) {
			let currentTitle = this.metaReducer.gf(state, 'data.other.quantityAndCurrencyTitle')
			var title = this.getQuantityAndCurrentTitle(currentTitle, newValue)
			let resCurrency, currencyDS = this.metaReducer.gf(state, 'data.other.currencyDS')
			if (currencyDS) {
				resCurrency = fromJS(data.find(currencyDS, 'id', newValue.get('currencyId'))) //currencyDS.find(x => x.get('id') == newValue.get('currencyId'))
			}
			//"数量/外币"字段, 需要 用到科目里的这几个字段.来进行显示
			if (!quantityAndForeignCurrency) {
				let details = this.metaReducer.gf(state, 'data.form.details'),
					preQuantityAndForeignCurrency = details.get(index).get('quantityAndForeignCurrency') ? details.get(index).get('quantityAndForeignCurrency').toJS() : undefined

				if (!preQuantityAndForeignCurrency) {
					let debitAmount = details.get(index).get('debitAmount'),
						creditAmount = details.get(index).get('creditAmount')

					quantityAndForeignCurrency = data.blankQuantityAndForeignCurrency

					if (!!debitAmount && debitAmount != 0) {
						quantityAndForeignCurrency.amount = debitAmount
					} else if (!!creditAmount && creditAmount != 0) {
						quantityAndForeignCurrency.amount = creditAmount
					} else {
						quantityAndForeignCurrency.amount = debitAmount
					}

					quantityAndForeignCurrency.isCalcMulti = newValue.get('isCalcMulti')
					quantityAndForeignCurrency.isCalcQuantity = newValue.get('isCalcQuantity')
					quantityAndForeignCurrency.unitName = newValue.get('unitName')
					// quantityAndForeignCurrency.quantity = newValue.get('initBalance') && newValue.get('initBalance').get('quantity')
					quantityAndForeignCurrency.exchangeRate = newValue.get('exchangeRate') || 1   //汇率默认1
					quantityAndForeignCurrency.price = newValue.get('initBalance') && newValue.get('initBalance').get('price')
					// quantityAndForeignCurrency.price = newValue.get('initBalance') && newValue.get('initBalance').price?newValue.get('initBalance').price:newValue.get('initBalance')&&newValue.get('initBalance').get('price')
					if (resCurrency) {
						quantityAndForeignCurrency.currency = {
							id: resCurrency.get('id'),
							name: resCurrency.get('name'),
							exchangeRate: resCurrency.get('exchangeRate') || 1,
							isBaseCurrency: resCurrency.get('isBaseCurrency')
						}
					} else {
						quantityAndForeignCurrency.currency = null
					}

				} else {
					quantityAndForeignCurrency = preQuantityAndForeignCurrency

					// quantityAndForeignCurrency.price = data.blankQuantityAndForeignCurrency.price
					quantityAndForeignCurrency.origAmount = data.blankQuantityAndForeignCurrency.origAmount
					quantityAndForeignCurrency.isCalcMulti = newValue.get('isCalcMulti')
					quantityAndForeignCurrency.isCalcQuantity = newValue.get('isCalcQuantity')
					quantityAndForeignCurrency.unitName = newValue.get('unitName')
					quantityAndForeignCurrency.price = newValue.get('initBalance') && newValue.get('initBalance').get('price')
					// quantityAndForeignCurrency.quantity = newValue.get('initBalance') && newValue.get('initBalance').get('quantity')
					// quantityAndForeignCurrency.price = newValue.get('initBalance') && newValue.get('initBalance').price?newValue.get('initBalance').price:newValue.get('initBalance')&&newValue.get('initBalance').get('price')
					quantityAndForeignCurrency.exchangeRate = newValue.get('exchangeRate') || 1   //汇率默认1
					if (resCurrency) {
						quantityAndForeignCurrency.currency = {
							id: resCurrency.get('id'),
							name: resCurrency.get('name'),
							exchangeRate: resCurrency.get('exchangeRate') || 1,
							isBaseCurrency: resCurrency.get('isBaseCurrency')
						}
					} else {
						quantityAndForeignCurrency.currency = null
					}
				}
			} else {
				if (quantityAndForeignCurrency.isCalcMulti != newValue.get('isCalcMulti') ||
					quantityAndForeignCurrency.isCalcQuantity != newValue.get('isCalcQuantity')) {

					quantityAndForeignCurrency = data.blankQuantityAndForeignCurrency
					quantityAndForeignCurrency.isCalcMulti = newValue.get('isCalcMulti')
					quantityAndForeignCurrency.isCalcQuantity = newValue.get('isCalcQuantity')
					quantityAndForeignCurrency.unitName = newValue.get('unitName')
					quantityAndForeignCurrency.quantity = newValue.get('initBalance') && newValue.get('initBalance').get('quantity')
					quantityAndForeignCurrency.exchangeRate = newValue.get('exchangeRate') || 1   //汇率默认1
					quantityAndForeignCurrency.price = newValue.get('initBalance') && newValue.get('initBalance').get('price')
					// quantityAndForeignCurrency.price = newValue.get('initBalance') && newValue.get('initBalance').price?newValue.get('initBalance').price:newValue.get('initBalance')&&newValue.get('initBalance').get('price')
					if (resCurrency) {
						quantityAndForeignCurrency.currency = {
							id: resCurrency.get('id'),
							name: resCurrency.get('name'),
							exchangeRate: resCurrency.get('exchangeRate') || 1,
							isBaseCurrency: resCurrency.get('isBaseCurrency')
						}
					} else {
						quantityAndForeignCurrency.currency = null
					}
				}
			}
			state = this.saveQuantityAndForeignCurrency(state, title, index, fromJS(quantityAndForeignCurrency))
		}
		else {
			state = this.saveQuantityAndForeignCurrency(state, '', index, undefined)
		}

		return state
	}

	//填写科目时,更新"数量/外币"列的显示
	saveQuantityAndForeignCurrency = (state, title, index, quantityAndForeignCurrency) => {
		if (quantityAndForeignCurrency) {
			state = this.enableQuantityAndForeignCurrency(state, title)
		}

		//设置表体对应cell的值
		let details = this.metaReducer.gf(state, 'data.form.details'),
			debitAmount = details.get(index).get('debitAmount'),
			creditAmount = details.get(index).get('creditAmount'),
			path

		details = details.update(index, item => item.set('quantityAndForeignCurrency', quantityAndForeignCurrency))
		state = this.setIsFromTemplate(state, index, details)

		if (!!quantityAndForeignCurrency) {
			if (!!debitAmount && debitAmount != 0) {
				path = 'root.children.center.children.details.columns.debitAmount.cell.cell,' + index
			} else if (!!creditAmount && creditAmount != 0) {
				path = 'root.children.center.children.details.columns.creditAmount.cell.cell,' + index
			} else {
				path = 'root.children.center.children.details.columns.debitAmount.cell.cell,' + index
			}

			details = this.rewriteQuantityAndCurrency(state, path)
			state = this.metaReducer.sf(state, 'data.form.details', details)
		}

		return state
	}

	//根据填写的金额,反算"数量/外币"
	rewriteQuantityAndCurrency = (state, path, amount) => {
		let index = parseInt(path.split(',')[1]),
			data = this.metaReducer.gf(state, 'data.form.details'),
			curFieldPath = path.split('.cell.cell')[0].split('.'),
			curEditField = curFieldPath[curFieldPath.length - 1],
			curValue = parseFloat(data.get(index).get(curEditField))

		let k = this.metaReducer.gf(state, `data.form.details.${index}.${curEditField}`)

		if (!amount || amount != curValue) {
			//如果有数量/外币核算, 则做反算. 算法在控件里,此处通知修改即可
			if (data.get(index).get('accountingSubject') &&
				(data.get(index).get('accountingSubject').get('isCalcQuantity')
					|| data.get(index).get('accountingSubject').get('isCalcMulti'))) {
				//todo
				let quantityAndForeignCurrency = data.get(index).get('quantityAndForeignCurrency') ?
					data.get(index).get('quantityAndForeignCurrency')
						.set('calcFromAmount', true).
						set('externalAmount', curValue || 0) : data.get(index).get('quantityAndForeignCurrency')

				data = data.update(index, item => item.set('quantityAndForeignCurrency', quantityAndForeignCurrency))
			}
		}
		return data
		// return this.metaReducer.sf(state, 'data.form.details', data)
	}

	//摘要选择下拉，但不使用模板；科目选择下拉
	setIsFromTemplate = (state, index, details) => {
		if (!details) {
			details = this.metaReducer.gf(state, 'data.form.details')
		}

		details = details.toJS()

		for (let i = 0; i < details.length; i++) {
			let item = details[i]
			if (!!item.accountingSubject || !!item.summary || !!item.debitAmount || !!item.creditAmount) {
				item.isFromTemplate = false
			}
		}

		return this.metaReducer.sf(state, 'data.form.details', fromJS(details))
	}

	//启用"数量/外币"列
	enableQuantityAndForeignCurrency = (state, title) => {
		return this.metaReducer.sfs(state, {
			'data.other.quantityAndCurrencyTitle': title,
			'data.other.isDisplayQuantityColumn': true,
			'data.other.quantityAndForeignCurrencyWidth': 120,
			'data.other.summaryWidth': 140
		})
	}

	//更新"数量/外币"列字段的title
	getQuantityAndCurrentTitle = (currentTitle, newValue) => {
		let title = ''
		if (currentTitle && (currentTitle.indexOf('/') != -1 ||
			(currentTitle == '外币' && newValue.get('isCalcQuantity')) ||
			(currentTitle == '数量' && newValue.get('isCalcMulti')))) {
			title = '数量/外币'
		}
		else {
			if (newValue.get('isCalcQuantity')) {
				title = '数量'
			}
			if (newValue.get('isCalcMulti')) {
				title = title + (title ? '/' : '') + '外币'
			}
		}
		return title
	}

	setGridDisabledState = (state, isDisabled) => {
		let gridMeta = {
			'root.children.center.children.details.columns.summary.isReadOnly': isDisabled,
			'root.children.center.children.details.columns.accountingSubject.isReadOnly': isDisabled,
			'root.children.center.children.details.columns.debitAmount.isReadOnly': isDisabled,
			'root.children.center.children.details.columns.creditAmount.isReadOnly': isDisabled
		}

		return this.setMultiField(state, gridMeta)
	}

	//判断凭证的辅助核算项是否变更
	isEqualAuxAccountSubjects = (auxAccountSubjects, auxAccountSubjectsPreSelected) => {
		if (!auxAccountSubjects && !auxAccountSubjectsPreSelected) {
			return true
		}

		if (auxAccountSubjects && auxAccountSubjectsPreSelected) {
			if (!this.isEqualAuxItemFile('department', auxAccountSubjects, auxAccountSubjectsPreSelected)) return false
			if (!this.isEqualAuxItemFile('person', auxAccountSubjects, auxAccountSubjectsPreSelected)) return false
			if (!this.isEqualAuxItemFile('customer', auxAccountSubjects, auxAccountSubjectsPreSelected)) return false
			if (!this.isEqualAuxItemFile('supplier', auxAccountSubjects, auxAccountSubjectsPreSelected)) return false
			if (!this.isEqualAuxItemFile('inventory', auxAccountSubjects, auxAccountSubjectsPreSelected)) return false
			if (!this.isEqualAuxItemFile('project', auxAccountSubjects, auxAccountSubjectsPreSelected)) return false
			if (!this.isEqualAuxItemFile('department', auxAccountSubjects, auxAccountSubjectsPreSelected)) return false
			for (var i = 1; i <= 10; i++) {
				if (!this.isEqualAuxItemFile(`exCalc${i}`, auxAccountSubjects, auxAccountSubjectsPreSelected)) return false
			}
		} else if (auxAccountSubjects && !auxAccountSubjectsPreSelected ||
			!auxAccountSubjects && auxAccountSubjectsPreSelected) {
			return false
		}

		return true
	}

	//判断凭证科目的某一具体辅助项是否变更
	isEqualAuxItemFile(fileName, auxAccountSubjects, auxAccountSubjectsPreSelected) {
		let retValue = true

		if (auxAccountSubjects.get(fileName) &&
			(!auxAccountSubjectsPreSelected.get(fileName) ||
				(auxAccountSubjectsPreSelected.get(fileName) &&
					auxAccountSubjects.get(fileName).get('id') != auxAccountSubjectsPreSelected.get(fileName).get('id')
				)
			)) {
			retValue = false
		}

		return retValue
	}

	//修改单据状态
	changeStatus = (state, editStatus, certificateStatus, sourceVoucherCode, other) => {
		if (other && JSON.stringify(other) !== "{}") {
			state = this.metaReducer.sfs(state, other)
		}
		state = this.checkMetaDisable(state, editStatus, certificateStatus, sourceVoucherCode)
		state = this.metaReducer.sf(state, 'data.other.editStatus', editStatus || data.ADD_STATUS)
		state = this.metaReducer.sf(state, 'data.form.certificateStatus', certificateStatus || data.STATUS_VOUCHER_NOT_AUDITED)

		//更新"余额"的可见性
		state = this.metaReducer.sf(state, 'data.form.details', this.updateBalanceShowable(this.metaReducer.gf(state, 'data.form.details'), editStatus))

		if ((editStatus == data.VIEW_STATUS || editStatus == data.EDIT_STATUS) && certificateStatus == data.STATUS_VOUCHER_NOT_AUDITED) {
			state = this.metaReducer.sf(state, 'data.form.attachmentStatus', 0)
		} else if ((editStatus == data.VIEW_STATUS || editStatus == data.EDIT_STATUS) && certificateStatus == data.STATUS_VOUCHER_AUDITED) {
			state = this.metaReducer.sf(state, 'data.form.attachmentStatus', 1)
		} else {
			state = this.metaReducer.sf(state, 'data.form.attachmentStatus', 0)
		}

		return state
	}

	//保存审核状态: 修改审核人信息 + 单据状态
	changeAuditStatus = (state, auditStatus, user, ts) => {
		if (auditStatus == data.STATUS_VOUCHER_AUDITED) {
			state = this.metaReducer.sf(state, 'data.form.auditor', user.financeAuditor)
			state = this.metaReducer.sf(state, 'data.form.auditorId', user.id)
			state = this.metaReducer.sf(state, 'data.form.ts', ts)
			state = this.metaReducer.sf(state, 'data.other.certificateBodyScrollY', 0)
		} else {
			state = this.metaReducer.sf(state, 'data.form.auditor', '')
			state = this.metaReducer.sf(state, 'data.form.auditorId', '')
			state = this.metaReducer.sf(state, 'data.form.ts', ts)
		}
		state = this.clearGridFocus(state)  //审核/反审核时,清空焦点
		state = this.changeStatus(state, data.VIEW_STATUS, auditStatus)

		return this.metaReducer.sf(state, 'data.form.copydetails', this.metaReducer.gf(state, 'data.form.details'))
	}

	//原设计在查看状态不可编辑, 现改为只要没审核就可以编辑
	checkMetaDisable = (state, editStatus, certificateStatus, sourceVoucherCode) => {
		if (!certificateStatus) {
			certificateStatus = this.metaReducer.gf(state, 'data.form.certificateStatus') //审核状态
		}

		if (editStatus == data.VIEW_STATUS && certificateStatus == data.STATUS_VOUCHER_AUDITED || !!sourceVoucherCode) {
			state = this.metaReducer.sfs(state, {
				'data.form.codeDisabled': true,
				'data.form.dateDisabled': true,
				'data.form.attachmentDisabled': true
			})

			state = this.setGridDisabledState(state, true)
			state = this.metaReducer.sf(state, 'data.other.hidePopover', true)
			state = this.metaReducer.sf(state, 'data.form.attachmentStatus', 0)
		}
		else {
			state = this.metaReducer.sfs(state, {
				'data.form.codeDisabled': false,
				'data.form.dateDisabled': false,
				'data.form.attachmentDisabled': false
			})

			state = this.setGridDisabledState(state, false)
			state = this.metaReducer.sf(state, 'data.other.hidePopover', false)
			state = this.metaReducer.sf(state, 'data.form.attachmentStatus', 1)
		}

		//处理保存后的凭证，修改为带有数量核算科目时数量框无法弹出问题时，注释掉该行 0301
		return state
	}

	setMultiField = (state, value) => {
		if (value) {
			Object.keys(value).forEach(p => {
				state = this.metaReducer.sf(state, `${p}`, fromJS(value[p]))
			})
		}
		let { gf, sf } = this.metaReducer
		state = this.metaReducer.sf(state, 'data.form.status', 128)
		state = this.metaReducer.sf(state, 'data.form.attachmentStatus', 0)
		return state
	}


	convertToAttachmentFiles = (file) => {
		let attachmentFiles = []

		if (file && file.length > 0) {
			file.map(o => {
				attachmentFiles.push({
					alt: o.name || o.file.name,
					id: o.id,
					type: o.type || o.file.type,
					fileId: o.fileId,
					name: o.name || o.file.originalName,
					ts: o.ts || o.file.ts,
					accessUrl: o.accessUrl || o.file.accessUrl
				})
				return attachmentFiles
			})
		}

		return fromJS(attachmentFiles)
	}

	upload = (state, file, ts, attachedNum) => {
		let isAttachCount = this.metaReducer.gf(state, 'data.form.isAttachCount'),
			attachCount = this.metaReducer.gf(state, 'data.form.attachCount'),
			enclosures = List()

		let attachmentFiles = []
		if (file && file.length > 0) {
			file.map(o => {
				attachmentFiles.push({
					alt: o.name || o.file.name,
					id: o.id || o.file.id,
					type: o.type || o.file.type,
					// fileId: o.fileId,
					name: o.name || o.file.name,
					ts: o.ts || o.file.ts,
					accessUrl: o.accessUrl || o.file.accessUrl
				})
				return attachmentFiles
			})
		}
		if (attachedNum > -1) {
			state = this.metaReducer.sf(state, 'data.form.attachCount', attachedNum)
		} else {
			if (isAttachCount || (file.length >= attachCount)) {
				state = this.metaReducer.sf(state, 'data.form.attachCount', file.length)
			}
		}

		if (!!ts) {
			state = this.metaReducer.sf(state, 'data.form.ts', ts)
		}

		state = this.metaReducer.sf(state, 'data.form.adjunctInfo.album', file)
		state = this.metaReducer.sf(state, 'data.form.adjunctInfo.adjunctSize', file.length)
		state = this.metaReducer.sf(state, 'data.form.attachmentFiles', fromJS(attachmentFiles))
		return state
	}

	draginPrevRowSummary = (state, curRowIndex, path) => {
		let details = this.metaReducer.gf(state, 'data.form.details'),
			summary = details.get(curRowIndex - 1).get('summary')

		details = details.update(curRowIndex, item => item.set('summary', summary))

		state = this.metaReducer.sf(state, 'data.form.details', details)
		if (this.metaReducer.gf(state, 'data.other.editStatus') == data.VIEW_STATUS) {
			state = this.changeStatus(state, data.EDIT_STATUS)
		}

		return this.checkRowState(state, path)
	}

	//设置翻页按钮可用与否的标识
	setNextOrPrivDis = (state, nextOrPrivBtn) => {
		if (nextOrPrivBtn == 'prevBtn') {
			state = this.metaReducer.sf(state, 'data.form.prevDisalbed', true)
			state = this.metaReducer.sf(state, 'data.form.nextDisalbed', false)
		} else if (nextOrPrivBtn == 'nextBtn') {
			state = this.metaReducer.sf(state, 'data.form.prevDisalbed', false)
			state = this.metaReducer.sf(state, 'data.form.nextDisalbed', true)
		}

		return state
	}

	//使用摘要模板: 把摘要模板里的项替换界面上的现有项
	applySummaryTemplate = (state, certificateData, rowIndex) => {
		let details = List(),
			isShowQuantityCol = false,   //检查是否需要显示"数量/外币"字段
			quantityAndCurrencyTitle = ''

		let oldDetails = this.metaReducer.gf(state, 'data.form.details')

		if (typeof oldDetails == 'object') {
			oldDetails = oldDetails.toJS()
		}

		let templateIndex = rowIndex
		state = this.delRowBefore(state, 'details', templateIndex)
		oldDetails = this.metaReducer.gf(state, 'data.form.details').toJS()
		state = this.extendReducer.gridReducer.delRow(state, 'details', templateIndex)
		oldDetails.splice(templateIndex, 1)
		let firstFlg = 0
		for (let entry of certificateData.get('entrys')) {
			let detail = this.getVoucherItemFromEntry(state, entry)

			detail = detail.set('isFromTemplate', true)

			detail = detail.setIn(['accountingSubject', 'initBalance'], fromJS(entry.get('initBalance')))
			oldDetails.splice(templateIndex, 0, detail.toJS())
			templateIndex++
			let accountingSubject = detail.get('accountingSubject')
			//检查是否需要显示"数量/外币"字段
			if (accountingSubject.get('isCalcMulti') || accountingSubject.get('isCalcQuantity')) {
				isShowQuantityCol = true

				quantityAndCurrencyTitle = this.getQuantityAndCurrentTitle(quantityAndCurrencyTitle, accountingSubject)
			}
		}

		if (isShowQuantityCol) {
			state = this.enableQuantityAndForeignCurrency(state, quantityAndCurrencyTitle)
		}

		// 删除5行以上的空白行
		for (let i = this.metaReducer.gf(state, 'data.other.defaultLength'); i < oldDetails.length; i++) {
			if (oldDetails[i].summary == '') {
				oldDetails.splice(i, 1)
				i--
			}
		}

		state = this.clearGridFocus(state)
		state = this.metaReducer.sf(state, 'data.form.details', fromJS(oldDetails))

		if (this.metaReducer.gf(state, 'data.other.editStatus') == data.ADD_STATUS) {
			for (var i = 0; i < oldDetails.length; i++) {
				state = this.reCaculateBalance(state, i)
			}
		}

		return state
	}

	//使用常用凭证模板: 把常用凭证模板里的项替换界面上的现有项
	applyCertificateTemplate = (state, detailData) => {
		let details = List(),
			isShowQuantityCol = false,   //检查是否需要显示"数量/外币"字段
			quantityAndCurrencyTitle = ''
		for (let entry of detailData.get('entrys')) {
			let detail = this.getVoucherItemFromEntry(state, entry)
			detail = detail.setIn(['accountingSubject', 'initBalance'], fromJS(entry.get('initBalance')))
			details = details.push(detail)

			//检查是否需要显示"数量/外币"字段
			if (detail.get('accountingSubject').get('isCalcMulti') || detail.get('accountingSubject').get('isCalcQuantity')) {
				isShowQuantityCol = true
				quantityAndCurrencyTitle = this.getQuantityAndCurrentTitle(quantityAndCurrencyTitle, detail.get('accountingSubject'))
			}
		}

		if (isShowQuantityCol) {
			state = this.enableQuantityAndForeignCurrency(state, quantityAndCurrencyTitle)
		}
		else {
			state = this.disableQuantityAndForeignCurrency(state)
		}

		//如果行数太少,则用空行补足
		let defaultLength = this.metaReducer.gf(state, 'data.other.defaultLength')
		while (details.size < defaultLength) {
			details = details.push(Map(data.blankVoucherItem))
		}

		state = this.clearGridFocus(state)
		state = this.metaReducer.sf(state, 'data.form.details', details)

		for (var i = 0; i < details.size; i++) {
			state = this.reCaculateBalance(state, i)
		}

		return state
	}

	setAccoutingSubject = (state, rowIndex, subjectList, ret) => {
		let details = this.metaReducer.gf(state, 'data.form.details')

		details = details.update(rowIndex, item => item.set('accountingSubject', Map(ret)))
		state = this.metaReducer.sf(state, 'data.form.details', details)
		state = this.metaReducer.sf(state, 'data.other.focusCellPath', `root.children.center.children.details.columns.accountingSubject.cell.cell,${rowIndex}`)
		window.accountingSubjects = fromJS(subjectList.glAccounts)
		window.accountingSubjectsAll = fromJS(subjectList.glAccountsAll)
		// state = this.metaReducer.sf(state, 'data.other.accountingSubjects', fromJS(subjectList.glAccounts))
		// return this.metaReducer.sf(state, 'data.other.accountingSubjectsAll', fromJS(subjectList.glAccountsAll))
		return state
	}

	showBtnState = (state, value) => {
		state = this.metaReducer.sf(state, 'data.other.btnStatus', value)
		return state
	}

	clearAuxItem = (state, rowIndex, other) => {
		if (other && JSON.stringify(other) !== "{}") {
			state = this.metaReducer.sfs(state, other)
		}

		let details = this.metaReducer.gf(state, 'data.form.details'),
			detail = details.get(rowIndex)

		if (detail.get('accountingSubject')) {
			//暂存当前辅助核算项及科目名+辅助名称 haolj ADD START
			let curCellAuxAccountSubjects = detail.get('accountingSubject').get('auxAccountSubjects'),
				curCellCodeAndName = detail.get('accountingSubject').get('codeAndName')

			state = this.metaReducer.sf(state, 'curCellAuxAccountSubjects', curCellAuxAccountSubjects)
			state = this.metaReducer.sf(state, 'curCellCodeAndName', curCellCodeAndName)
			state = this.metaReducer.sf(state, 'isEdit', true)
			//暂存当前辅助核算项及科目名+辅助名称 haolj ADD END

			details = details.update(rowIndex, item => item.setIn(['accountingSubject', 'auxAccountSubjects'], undefined))
			state = this.metaReducer.sf(state, 'data.form.details', details)
		}

		return state
	}

	mouseHoverRow = (state, option, auxBtnStyle, other) => {
		state = this.metaReducer.sfs(state, other)
		state = this.setAuxBtnVisible(state, Map(auxBtnStyle))
		return this.metaReducer.sf(state, 'data.other.mouseHoverRow', option ? Map(option) : undefined)
	}

	setCertificateBodyScrollY = (state, y) => {
		return this.metaReducer.sf(state, 'data.other.certificateBodyScrollY', y)
	}

	setAuxBtnVisible = (state, auxBtnStyle) => {
		return this.metaReducer.sf(state, 'data.other.auxBtnStyle', Map(auxBtnStyle))
	}

	setSummaryDS = (state, summarys) => {
		return this.metaReducer.sf(state, 'data.other.summarys', summarys)
	}

	setOther = (state, other) => {
		return this.metaReducer.sfs(state, other)
	}

	setPageIconStyle = (state, pagingDirection, currentIndex, totalPages) => {
		if (pagingDirection == 'left') {
			if (currentIndex == 0) {
				state = this.metaReducer.sf(state, 'data.other.toPrevPage', 'toPrevPage-disabled')
			}
			if (this.metaReducer.gf(state, 'data.other.toNextPage') == 'toNextPage-disabled' && totalPages > 1) {
				state = this.metaReducer.sf(state, 'data.other.toNextPage', 'toNextPage')
			}
		} else if (pagingDirection == 'right') {
			if (currentIndex == totalPages - 1) {
				state = this.metaReducer.sf(state, 'data.other.toNextPage', 'toNextPage-disabled')
			}
			if (this.metaReducer.gf(state, 'data.other.toPrevPage') == 'toPrevPage-disabled' && currentIndex > 0) {
				state = this.metaReducer.sf(state, 'data.other.toPrevPage', 'toPrevPage')
			}
		}

		return state
	}

	moveCellBefore = (state, path, newValue) => {
		if (path && path.indexOf('.cell.cell,') > -1 &&
			document.activeElement.className == "ant-input mk-input-number app-proof-of-charge-cell editable-cell") {
			let curPath = path.split('.cell.cell')[0].split('.'),
				curEditField = curPath[curPath.length - 1],
				rowIndex = parseInt(path.split(',')[1]),
				oldValue = this.metaReducer.gf(state, 'data.form.details').get(rowIndex).get(curEditField)

			let editStatus = this.metaReducer.gf(state, 'data.other.editStatus')
			if (newValue == '0') {
				if (oldValue != newValue) {  //点选右边修改科目使其保存可用
					if (editStatus == data.EDIT_STATUS || editStatus == data.VIEW_STATUS) {
						state = this.changeStatus(state, data.EDIT_STATUS, data.STATUS_VOUCHER_NOT_AUDITED)
					}
				}
				return state
			}
			if (newValue != oldValue) {
				return this.onFieldChange(state, path, oldValue, newValue)
			}
		}

		return state
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer })

	return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}
