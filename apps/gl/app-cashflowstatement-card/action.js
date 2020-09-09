import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Menu, Checkbox, DataGrid, Icon ,Input} from 'edf-component'
import { Map, fromJS, List, is } from 'immutable'
import extend from './extend'
import config from './config'
import {LoadingMask} from 'edf-component'
import { consts } from 'edf-consts'
import { addThousandsPosition , clearThousandsPosition} from './data'
class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections })
		this.component = component
		this.injections = injections
		this.customAttribute = Math.random()
		if (this.component.props.setOkListener) {

            this.component.props.setOkListener(this.onOk)
        }
		injections.reduce('init')
		this.load()
	}

	load = async () => {
		let period =`${this.metaAction.context.get("currentOrg").enabledYear}年${this.metaAction.context.get("currentOrg").enabledMonth}月`
		let accountingStandards = this.component.props.accountingStandards
		let list = await this.webapi.cashflowstatement.periodBeginInit()
		list.accountingStandards = accountingStandards
		this.injections.reduce('load', list, period)
	}
	onOk = async () => {
		await this.save()
	}
	refresh = () => {
		let period = this.component.props.period
		this.getData().then((res)=> {
			this.injections.reduce('load', res, period)
		})
	}

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size
	}

	getCashValue = (_rowIndex) => (e) => {
		this.injections.reduce('getCashValue', e, _rowIndex)
	}

	addGridRow = (option) => (e) => {
		this.injections.reduce('addGridRow', option)
	}


	delClick = (option) => (e) => {
		this.injections.reduce('delClick', option)
	}

	renderColumns = (columnName, v, path, rowIndex) => {
        let list = this.metaAction.gf('data.list'),
            text = list ? list.get(rowIndex).get(columnName) : '',
			oldValue = list ? list.get(rowIndex).get(columnName) : '',
			isEdit = list ? list.get(rowIndex).get('canEdit') : undefined,
			canEdit = this.metaAction.gf('data.canEdit')
			let editable
			let row = list.get(rowIndex).get('rowNo')
			if(this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_2007){

				if(!row||row =='4'||row =='9'||row =='10'||row =='16'||row =='21'||row =='22'||row =='26'||row =='30'||row =='31'){
					editable = false
				}else{
					editable = true
				}

				if(row){
					return (

						<EditableCell
							disabled = {!canEdit}
							editable={editable}
							customAttribute = {this.customAttribute}
							value={text?addThousandsPosition(parseFloat(text).toFixed(2)):''}
							onBlur={(value) => this.handleBlur(rowIndex, columnName, value)}
						/>
					)
				}else{
					return
				}

			}else if(this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_2013){
				if(!row||row =='7'||row =='13'||row =='19'){
					editable = false
				}else{
					editable = true
				}

				if(row){
					return (

						<EditableCell
							disabled = {!canEdit}
							editable={editable}
							customAttribute = {this.customAttribute}
							value={text?addThousandsPosition(parseFloat(text).toFixed(2)):''}
							onBlur={(value) => this.handleBlur(rowIndex, columnName, value)}
						/>
					)
				}else{
					return
				}

			}else {
				if(isEdit && isEdit == true){
					editable = true
				}else{
					editable = false
				}
				// if(row){
					return (

						<EditableCell
							disabled = {!canEdit}
							editable={editable}
							customAttribute = {this.customAttribute}
							value={text?addThousandsPosition(parseFloat(text).toFixed(2)):''}
							onBlur={(value) => this.handleBlur(rowIndex, columnName, value)}
						/>
					)
				// }
			}

	}
	handleBlur = (rowIndex, columnName, value) => {
        let list = this.metaAction.gf('data.list'),
            oldValue = list.get(rowIndex).get(columnName),
            newValue = value
			// newValue = value ? parseFloat(value).toFixed(2) : value
		list = list.update(rowIndex, item => item.set(columnName, newValue))
		this.customAttribute = Math.random()
		if (newValue > 9999999999.99 ) {
			newValue = undefined

			list = list.update(rowIndex, item => {
				item = item.set(columnName, newValue)
				return item
			})
			this.metaAction.sf('data.list', list)
			this.metaAction.toast('warning', `金额不能大于9999999999.99，请调整`)
			return
		}
		if (newValue < -9999999999.99 ) {
			newValue = undefined
			list = list.update(rowIndex, item => {
				item = item.set(columnName, newValue)
				return item
			})
			this.metaAction.sf('data.list', list)
			this.metaAction.toast('warning', `金额不能小于-9999999999.99，请调整`)
			return
		}
		if(this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_2007){
			let listFour = parseFloat(parseFloat(list.get(1).get(columnName)||0).toFixed(2) ) + parseFloat(parseFloat(list.get(2).get(columnName)||0 ).toFixed(2)) + parseFloat(parseFloat(list.get(3).get(columnName)||0).toFixed(2))

			list = list.update(4, item =>
					item.set(columnName, listFour!=''?listFour.toFixed(2):'')
				)
			let listNine = parseFloat(parseFloat(list.get(5).get(columnName)||0).toFixed(2) ) + parseFloat(parseFloat(list.get(6).get(columnName)||0 ).toFixed(2)) + parseFloat(parseFloat(list.get(7).get(columnName)||0).toFixed(2)) + parseFloat(parseFloat(list.get(8).get(columnName)||0).toFixed(2))
			list = list.update(9, item =>
				item.set(columnName, listNine!=''?listNine.toFixed(2):'')
			)
			list = list.update(10, item =>
				item.set(columnName, (listFour - listNine)!=''?(listFour - listNine).toFixed(2):'')
			)
			let listSixteen = parseFloat(parseFloat(list.get(12).get(columnName)||0).toFixed(2))
							+ parseFloat(parseFloat(list.get(13).get(columnName)||0 ).toFixed(2))
							+ parseFloat(parseFloat(list.get(14).get(columnName)||0).toFixed(2))
							+ parseFloat(parseFloat(list.get(15).get(columnName)||0).toFixed(2))
							+ parseFloat(parseFloat(list.get(16).get(columnName)||0).toFixed(2))
			list = list.update(17, item =>
				item.set(columnName, listSixteen!=''?listSixteen.toFixed(2):'')
			)
			let listTwentyOne = parseFloat(parseFloat(list.get(18).get(columnName)||0).toFixed(2) )
								+ parseFloat(parseFloat(list.get(19).get(columnName)||0 ).toFixed(2))
								+ parseFloat(parseFloat(list.get(20).get(columnName)||0).toFixed(2))
								+ parseFloat(parseFloat(list.get(21).get(columnName)||0).toFixed(2))
			list = list.update(22, item =>
				item.set(columnName, listTwentyOne!=''?listTwentyOne.toFixed(2):'')
			)
			let listTwentyTwo = listSixteen - listTwentyOne
			list = list.update(23, item =>
				item.set(columnName, listTwentyTwo!=''?listTwentyTwo.toFixed(2):'')
			)
			let listTwentySix = parseFloat(parseFloat(list.get(25).get(columnName)||0).toFixed(2) )
								+ parseFloat(parseFloat(list.get(26).get(columnName)||0 ).toFixed(2))
								+ parseFloat(parseFloat(list.get(27).get(columnName)||0).toFixed(2))

			list = list.update(28, item =>
				item.set(columnName, listTwentySix!=''?listTwentySix.toFixed(2):'')
			)
			let listThirty = parseFloat(parseFloat(list.get(29).get(columnName)||0).toFixed(2) )
							+ parseFloat(parseFloat(list.get(30).get(columnName)||0 ).toFixed(2))
							+ parseFloat(parseFloat(list.get(31).get(columnName)||0).toFixed(2))

			list = list.update(32, item =>
				item.set(columnName, listThirty!=''?listThirty.toFixed(2):'')
			)
			let listThirtyOne = listTwentySix - listThirty
			list = list.update(33, item =>
				item.set(columnName, listThirtyOne!=''?listThirtyOne.toFixed(2):'')
			)
			this.metaAction.sf('data.list', list)

		}else if(this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_2013){
			let listSeven = parseFloat(parseFloat(list.get(1).get(columnName)||0).toFixed(2))
						+ parseFloat(parseFloat(list.get(2).get(columnName)||0 ).toFixed(2))
						- parseFloat(parseFloat(list.get(3).get(columnName)||0).toFixed(2))
						- parseFloat(parseFloat(list.get(4).get(columnName)||0).toFixed(2))
						- parseFloat(parseFloat(list.get(5).get(columnName)||0).toFixed(2))
						- parseFloat(parseFloat(list.get(6).get(columnName)||0).toFixed(2))

			list = list.update(7, item =>
				item.set(columnName, listSeven!=''?listSeven.toFixed(2):'')
			)
			let listThirteen = parseFloat(parseFloat(list.get(9).get(columnName)||0).toFixed(2))
							+ parseFloat(parseFloat(list.get(10).get(columnName)||0 ).toFixed(2))
							+ parseFloat(parseFloat(list.get(11).get(columnName)||0).toFixed(2))
							- parseFloat(parseFloat(list.get(12).get(columnName)||0).toFixed(2))
							- parseFloat(parseFloat(list.get(13).get(columnName)||0).toFixed(2))


			list = list.update(14, item =>
				item.set(columnName, listThirteen!=''?listThirteen.toFixed(2):'')
			)
			let listNinteen = parseFloat(parseFloat(list.get(16).get(columnName)||0).toFixed(2))
							+ parseFloat(parseFloat(list.get(17).get(columnName)||0 ).toFixed(2))
							- parseFloat(parseFloat(list.get(18).get(columnName)||0).toFixed(2))
							- parseFloat(parseFloat(list.get(19).get(columnName)||0).toFixed(2))
							- parseFloat(parseFloat(list.get(20).get(columnName)||0).toFixed(2))

			list = list.update(21, item =>
				item.set(columnName, listNinteen!=''?listNinteen.toFixed(2):'')
			)
			this.metaAction.sf('data.list', list)

		}else {
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
			listTwentythreeIndex  = list.findIndex(o => o.get('rowNo') == 23),
			listTwentyfourIndex  = list.findIndex(o => o.get('rowNo') == 24),
			listTwentyfiveIndex = list.findIndex(o => o.get('rowNo') == 25),
			listTwentysixIndex = list.findIndex(o => o.get('rowNo') == 26),
			listTwentysevenIndex = list.findIndex(o => o.get('rowNo') == 27),
			listThirtyIndex = list.findIndex(o => o.get('rowNo') == 30),
			listThirtyfourIndex= list.findIndex(o => o.get('rowNo') == 34),
			listThirtyfiveIndex = list.findIndex(o => o.get('rowNo') == 35),
			listThirtysixIndex = list.findIndex(o => o.get('rowNo') == 36),
			listThirtynineIndex= list.findIndex(o => o.get('rowNo') == 39),
			listFortythreeIndex= list.findIndex(o => o.get('rowNo') == 43),
			listFortyfourIndex= list.findIndex(o => o.get('rowNo') == 44),
			listFortyfiveIndex= list.findIndex(o => o.get('rowNo') == 45),
			listFortyeightIndex= list.findIndex(o => o.get('rowNo') == 48),
			listFiftyIndex= list.findIndex(o => o.get('rowNo') == 50),
			listFiftyoneIndex= list.findIndex(o => o.get('rowNo') == 51),
			listFiftytwoIndex= list.findIndex(o => o.get('rowNo') == 52),
			listFiftyfiveIndex= list.findIndex(o => o.get('rowNo') == 55),
			listFiftyeightIndex= list.findIndex(o => o.get('rowNo') == 58),
			listFiftynineIndex= list.findIndex(o => o.get('rowNo') == 59),
			listSixtyIndex= list.findIndex(o => o.get('rowNo') == 60),
			listSixtyoneIndex= list.findIndex(o => o.get('rowNo') == 61),
			listThirteen = parseFloat(parseFloat(list.get(listOneIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listTwoIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listThreeIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listFourIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listFiveIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listEightIndex).get(columnName)||0).toFixed(2)),
			listTwentythree = parseFloat(parseFloat(list.get(listForteenIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listFiveteenIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listSixteenIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listNineteenIndex).get(columnName)||0).toFixed(2)),
			listTwentyfour = listThirteen
										- listTwentythree,
			listThirtyfour = parseFloat(parseFloat(list.get(listTwentyfiveIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listTwentysixIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listTwentysevenIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listThirtyIndex).get(columnName)||0).toFixed(2)),
			listFortythree = parseFloat(parseFloat(list.get(listThirtyfiveIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listThirtysixIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listThirtynineIndex).get(columnName)||0).toFixed(2)),
			listFortyfour = listThirtyfour
										- listFortythree,
			listFifty = parseFloat(parseFloat(list.get(listFortyfiveIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listFortyeightIndex).get(columnName)||0).toFixed(2)),
			listFiftyeight = parseFloat(parseFloat(list.get(listFiftyoneIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listFiftytwoIndex).get(columnName)||0).toFixed(2))
										+ parseFloat(parseFloat(list.get(listFiftyfiveIndex).get(columnName)||0).toFixed(2)),
			listFiftynine = listFifty
										- listFiftyeight,
			listSixtyone = listTwentyfour
										+ listFortyfour
										+ listFiftynine
										+ parseFloat(parseFloat(list.get(listSixtyIndex).get(columnName)||0).toFixed(2))
			list = list.update(listThirteenIndex, item =>
				item.set(columnName, listThirteen!=''?listThirteen.toFixed(2):'')
			)
			list = list.update(listTwentythreeIndex, item =>
				item.set(columnName, listTwentythree!=''?listTwentythree.toFixed(2):'')
			)
			list = list.update(listTwentyfourIndex, item =>
				item.set(columnName, listTwentyfour!=''?listTwentyfour.toFixed(2):'')
			)
			list = list.update(listThirtyfourIndex, item =>
				item.set(columnName, listThirtyfour!=''?listThirtyfour.toFixed(2):'')
			)
			list = list.update(listFortythreeIndex, item =>
				item.set(columnName, listFortythree!=''?listFortythree.toFixed(2):'')
			)
			list = list.update(listFortyfourIndex, item =>
				item.set(columnName, listFortyfour!=''?listFortyfour.toFixed(2):'')
			)
			list = list.update(listFiftyIndex, item =>
				item.set(columnName, listFifty!=''?listFifty.toFixed(2):'')
			)
			list = list.update(listFiftyeightIndex, item =>
				item.set(columnName, listFiftyeight!=''?listFiftyeight.toFixed(2):'')
			)
			list = list.update(listFiftynineIndex, item =>
				item.set(columnName, listFiftynine!=''?listFiftynine.toFixed(2):'')
			)
			list = list.update(listSixtyoneIndex, item =>
				item.set(columnName, listSixtyone!=''?listSixtyone.toFixed(2):'')
			)
			this.metaAction.sf('data.list', list)
		}
	}

	save = async () => {
		let list = this.metaAction.gf('data.list')?this.metaAction.gf('data.list').toJS():[]
		let data = this.checkSave(list),
			checkStyle = { textAlign: 'right', fontSize: '12px', display: 'inline-block', verticalAlign: 'top' }

		if (data.msg.length > 0) {
			this.metaAction.toast('warning',
				<div style={checkStyle}>
					{data.msg.map(o => <p style={{ marginBottom: '0' }}>{o}</p>)}
				</div>
			)
			return
		}

		if(list.length){
			let response = await this.webapi.cashflowstatement.save(data.listArr)

			if(response){
				this.metaAction.toast('success', '保存成功')
			}
		}
	}

	checkSave = (list) => {

		let msg = [], allItemEmpty = true, listArr = []

		list.forEach((item, i) => {
			if (!item || (!item.voucherDate && !item.cashFlowItem && !item.amount)) {
				return
			}

			if(item.cashFlowItem && item.amount){
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

	//获取初始化内容
	getData = async () => {
		let loading = this.metaAction.gf('data.loading')
        if(!loading){
            this.injections.reduce('tableLoading', true)
        }
		let response = await this.webapi.cashflowstatement.query()
		this.injections.reduce('tableLoading', false)
		if(!response) return false
		return response
	}

		getTableClassName = () => {
				let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards,
						className = ''

			  console.log('accountingStandards:' + accountingStandards )
				if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
						className = 'app-cashflowstatement-rpt-table-tbody smallOrgTable'
				} else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
						className = 'app-cashflowstatement-rpt-table-tbody orgTable'
				} else {
						className = 'app-cashflowstatement-rpt-table-tbody nonProfitOrgTable'
						// nonProfitOrgTable
				}

				return className
		}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}

const EditableCell = ({ editable, value, onBlur ,customAttribute,disabled}) => (
    <div style={{textAlign: 'right'}}>
        {editable
            ? <Input.Number style={{ margin: '-5px 0' ,textAlign:'right'}} className='app-account-beginbalance-tableClass'
				value={value}
				disabled = {disabled}
				customAttribute = {customAttribute}
                onBlur={(value) => onBlur(value)} regex='^(-?[0-9]+)(?:\.[0-9]{1,2})?$'/>
            : <div className='app-account-beginbalance-tableClass'>{value}</div>
        }
    </div>
)
