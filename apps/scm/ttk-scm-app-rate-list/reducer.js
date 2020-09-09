import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { getInitState } from './data'
import utils from 'edf-utils'

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer
		this.extendReducer = option.extendReducer
		this.config = config.current
	}

	init = (state, option) => {
		const initState = getInitState()
		return this.metaReducer.init(state, initState)
	}

	load = (state, response) => {
		state = this.metaReducer.sfs(state, {
            'data.list': fromJS(response.list),
            'data.other.propertys': fromJS(response.propertys),
            'data.periodDate': fromJS(response.periodDate),
            'data.time': fromJS(response.time),
		})
		return state
	}

	//设置分页
	setPages = (state, page) => {
		if (page) {
			state = this.metaReducer.sf(state, `data.page`, fromJS({
				current: page.currentPage,
				total: page.totalCount,
				pageSize: page.pageSize
			}))
		}
		return state
	}

	sortReduce = (state, value) => {
		state = this.metaReducer.sf(state, `data.other.sort`, fromJS(value))
		return state
	}

	selectAll = (state, checked, gridName) => {
		_hmt && _hmt.push(['_trackEvent', '资产', '资产卡片列表', '勾选框全选'])
		state = this.extendReducer.gridReducer.selectAll(state, checked, gridName)
		return state
	}

	selectRow = (state, rowIndex, checked) => {
		_hmt && _hmt.push(['_trackEvent', '资产', '资产卡片列表', '勾选框'])
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked)
		return state
	}

	settingOptionsUpdate = (state, { visible, data }) => {
		state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(data))
		state = this.metaReducer.sf(state, 'data.showTableSetting', visible)
		return state
	}

	update = (state, { path, value }) => {
		return this.metaReducer.sf(state, path, fromJS(value))
	}

	tableSettingVisible = (state, { value, data }) => {
		state = this.metaReducer.sf(state, 'data.showTableSetting', value)
		data = this.metaReducer.gf(state, 'data.other.columnDto')
		return state
	}

	onColumnResizeEnd = (state, res) => {
		if (res[0]) {
			state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(res[0].columnDetails))
		}
		return state
	}

	getLabelList = (list, isAsset, isAssetClass) => {
		let newList = []
		if (list && Array.isArray(list)) {
			list.map(item => {
				//资产分类
				if (isAssetClass) {
					newList.push({ value: item.id, label: item.name, assetPropertyId: item.assetPropertyId })

					//高级查询资产下拉项
				} else if (isAsset) {
					newList.push({ value: item.cardId, label: item.code + '-' + item.name })

				} else {
					newList.push({ value: item.id, label: item.name })
				}
			})
		}
		return newList
	}

	setStatus = (state, path, value) => {
		state = this.metaReducer.sf(state, path, value)
		return state
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o }

	return { ...ret }
}