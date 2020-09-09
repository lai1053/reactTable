import {Map, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import utils from 'edf-utils'
import config from './config'
import {getInitState} from './data'
import moment from 'moment'

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer
		this.config = config.current
	}

	init = (state, option) => {
		const initState = getInitState()
		return this.metaReducer.init(state, initState)
	}

	load = (state, {response, noInitDate}) => {
		const {list, page, column, businessTypes, /*accountList, voucherStateList, voucherTypeList, displayDate, */loading} = response
		if (column) {
			state = this.metaReducer.sf(state, 'data.list', fromJS(this.processDtoList(column.columnDetails, list)))
		} else {
			let columnDetails = this.metaReducer.gf(state, 'data.other.columnDetails').toJS()
			state = this.metaReducer.sf(state, 'data.list', fromJS(this.processDtoList(column.columnDetails, list)))
		}
		state = this.metaReducer.sf(state, 'data.allList', fromJS(list))
		state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
		if (column) {
			state = this.metaReducer.sf(state, 'data.other.columnDetails', fromJS(column.columnDetails))
			state = this.metaReducer.sf(state, 'data.other.code', fromJS(column.code))
			state = this.metaReducer.sf(state, 'data.other.ts', fromJS(column.createTime))
		}
		if (businessTypes) {
			let arr = []
			businessTypes.forEach(function (data) {
				let result = {value: data.id, label: data.name}, resultArr = []
				if(data.children){
					data.children.forEach(function (dataChildren) {
						resultArr.push({value: dataChildren.id, label: dataChildren.name})
					})
				}
				result.children = resultArr
				arr.push(result)
			})
			state = this.metaReducer.sf(state, 'data.other.businessTypes', fromJS(arr))
		}
		// if (voucherStateList) {
		//     state = this.metaReducer.sf(state, 'data.other.voucherStateOption', fromJS(changeToOption(voucherStateList, 'name', 'id')))
		// }
		// if (voucherTypeList) {
		//     state = this.metaReducer.sf(state, 'data.other.sourceVoucherTypeIdOption', fromJS(changeToOption(voucherTypeList, 'name', 'id')))
		// }
		// if( displayDate && !noInitDate ){
		//     state = this.metaReducer.sf(
		//         state,
		//         'data.searchValue.endDate',
		//         utils.date.transformMomentDate(displayDate)
		//     )
		//     state = this.metaReducer.sf(
		//         state,
		//         'data.searchValue.beginDate',
		//         utils.date.transformMomentDate(displayDate)
		//     )
		//     state = this.metaReducer.sf(state, 'data.searchValue.displayDate', displayDate)
		// }
		if (typeof loading == 'boolean') {
			state = this.metaReducer.sf(state, 'data.other.loading', loading)
		}
		return state
	}

	processDtoList = (columnDetails, dtoList) => {
		let docDetailsCol = columnDetails.filter(item => item.isHeader == false && item.isVisible == true),
			retDtoList = []
		// 凭证管理中要显示明细列
		if (docDetailsCol && docDetailsCol.length > 0) {
			retDtoList = dtoList
			// 凭证管理中不显示明细列时，做数据排重用以控制行的高度为标准行高
		} else {
			let docCode = ''
			for (var i = 0; i < dtoList.length; i++) {
				if (docCode != dtoList[i].docCode) {
					retDtoList.push(dtoList[i])
					docCode = dtoList[i].docCode
				}
			}
		}
		return retDtoList
	}

	tableLoading = (state, loading) => {
		return this.metaReducer.sf(state, 'data.loading', loading)
	}

	update = (state, {path, value}) => {
		return this.metaReducer.sf(state, path, fromJS(value))
	}

	updateArr = (state, arr) => {
		arr.forEach(item => {
			state = this.metaReducer.sf(state, item.path, fromJS(item.value))
		})
		return state
	}

	tableSettingVisible = (state, {value, data}) => {
		state = this.metaReducer.sf(state, 'data.showTableSetting', value)
		data = this.metaReducer.gf(state, 'data.other.columnDetails')
		return state
	}

	settingOptionsUpdate = (state, {visible, data}) => {
		state = this.metaReducer.sf(state, 'data.other.columnDetails', fromJS(data))
		state = this.metaReducer.sf(state, 'data.showTableSetting', visible)
		let allList = this.metaReducer.gf(state, 'data.allList').toJS()
		state = this.metaReducer.sf(state, 'data.list', fromJS(this.processDtoList(data, allList)))
		return state
	}

	normalSearchChange = (state, {path, value}) => {
		state = this.metaReducer.sf(state, `data.normalSearch.${path}`, fromJS(value))
		return state
	}


	searchUpdate = (state, value) => {
		return this.metaReducer.sf(state, 'data.searchValue', fromJS(value))
	}

	tableOnchange = (state, value) => {
		state = this.metaReducer.sf(state, 'data.list', fromJS(value))
		state = this.metaReducer.sf(state, 'data.key', Math.random())
		//state = this.metaReducer.sf(state, 'data.pagination', fromJS(response.pagination))
		//state = this.metaReducer.sf(state, 'data.filter', fromJS(response.filter))
		return state
	}

	sortReduce = (state, value) => {
		state = this.metaReducer.sf(state, `data.sort`, fromJS(value))
		return state
	}

	setTableScroll = (state, value) => {
		let tableOption = {x: 1090, y: value}
		state = this.metaReducer.sf(state, 'data.tableOption', fromJS(tableOption))
		return state
	}

	setTableOption = (state, value) => {
		return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
	}

	resizeEnd = (state, column) => {
		state = this.metaReducer.sf(state, 'data.other.columnDetails', fromJS(column.columnDetails))
		state = this.metaReducer.sf(state, 'data.other.code', fromJS(column.code))
		state = this.metaReducer.sf(state, 'data.other.ts', fromJS(column.ts))
		return state
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		o = new reducer({...option, metaReducer})

	return {...metaReducer, ...o}
}
