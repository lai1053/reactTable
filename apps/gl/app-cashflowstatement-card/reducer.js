import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer
		this.config = config.current
	}

	init = (state, option) => {
		const initState = getInitState()
		return this.metaReducer.init(state, initState)
	}
	tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }
	load = (state, value, period) => {

		if(period){
			state = this.metaReducer.sf(state, `data.period`, period)
			// let endTime = `${period.year}.${period.period-1>9 ? period.period-1 : "0"+period.period-1}.30`
			// state = this.metaReducer.sf(state, 'data.textWord', `提示：日期只能输入${period.year}.01.01-${endTime}之内的数据`)
		}

		if(value && value.datas) {
			value.datas.map(item=> {
				item.cashFlowItem = {
					id: item.cashFlowItemId,
					name: item.name
				}

				// item.voucherDate = item.voucherDate.split(' ')[0]
				// item.voucherDate = period.name || ''
			})
			value.datas.push({})
			state = this.metaReducer.sf(state, `data.list`, fromJS(value.datas))
		}

		if(value && value.cashFlowItems) {
			state = this.metaReducer.sf(state, `data.other.cashFlowItems`, fromJS(value.cashFlowItems))
		}
		state = this.metaReducer.sf(state, 'data.accountingStandards', fromJS(value.accountingStandards))
		state = this.metaReducer.sf(state, 'data.statement', fromJS(value))
		state = this.metaReducer.sf(state, 'data.canEdit', fromJS(value['canEdit']))
		return state
	}
	renderList = (state, value) => {
		state = this.metaReducer.sf(state, 'data.list', fromJS(value))
		return state
	}
	getCashValue = (state, e, _rowIndex) => {
		let list = this.metaReducer.gf(state, `data.other.cashFlowItems`)
		if(list){
			list.toJS().map(item => {
				if(e == item.id){
					state = this.metaReducer.sf(state, `data.list.${_rowIndex}.cashFlowItem`, fromJS(item))
					state = this.metaReducer.sf(state, `data.list.${_rowIndex}.cashFlowDirectionName`, fromJS(item.cashFlowDirectionName))
				}
			})
		}
		return state
	}

	delClick = (state, _rowIndex) => {
		state = this.metaReducer.sf(state, `data.list.${_rowIndex}`, fromJS({}))
		return state
	}
	resetBalance = (state,curColumnName,rowIndex,oldValue,newValue) => {

		if (Number(oldValue) == 0) {
			newValue = undefined
		} else {
			newValue = oldValue
		}
		let list = this.metaReducer.gf(state, 'data.list')
		list = list.update(rowIndex, item => {
			item = item.set(curColumnName, '')
			return item
		})
		state = this.metaReducer.sf(state, 'data.list', fromJS(list))
		return state
	}
	addGridRow = (state, index) => {
		let list = this.metaReducer.gf(state, `data.list`)

		if(list) list = list.toJS()

		if((list.length && index == list.length-1) || !list.length){
			list.push({})
		}

		state = this.metaReducer.sf(state, `data.list`, fromJS(list))
		return state
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		o = new reducer({ ...option, metaReducer }),
		ret = { ...metaReducer, ...o }

	return { ...ret }
}
