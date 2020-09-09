import { fromJS } from 'immutable'
import { tree } from 'edf-utils'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { getInitState } from './data'

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer
		this.extendReducer = option.extendReducer
		this.config = config.current
	}

	init = (state, option) => {
		return this.metaReducer.init(state, getInitState())
	}

	/**
     * @description: 页面初始化时赋值
     * @param {array} businessType 树结构-业务类型
     * @param {array} list 收发存明细表表格数据
     * @param {array} treeList 树结构的明细
     * @param {string} stockPeriod 当前日期
     * @param {object} getInvSetByPeroid 账套信息
     * @return: 无
    */
	load = (state, businessType, list, treeList, stockPeriod, stateNow, endPeriod) => {
		let expandedKeys = ['0'], treeData = [], listData = []
		// 树结构数据处理 start
		if (businessType && businessType.length > 0) {
			businessType.forEach(item => {
				let name = item.code + '  ' + item.name
				item.name = name
				item.level = 2
				expandedKeys.push(item.id.toString())
				item.children = []
				treeList.forEach(data => {
					if (data.propertyId == item.id) {
						let name = data.fullname + '  ' + (data.specification ? data.specification : '')
						data.name = name
						data.level = 3
						item.children.push(data)
					}
				})
			})
			treeData = [{
				name:'存货',
				id:'0',
				children: businessType
			}]
		} 
		// 树结构数据处理 end
		// 表格数据处理 start
		// if (list && list.length > 0) {
		// 	list.forEach(ietm => {
		// 		let length = ietm.StockDetailSubDtoList.length
		// 		ietm.StockDetailSubDtoList.forEach((data, index) => {
		// 			data.rowSpan =  index == 0 ? length : 0
		// 			listData.push(data)
		// 		})
		// 	})
		// } 
		// 表格数据处理 end
		state = this.metaReducer.sfs(state,{
			// 'data.list': fromJS(listData),
			'data.list': fromJS(list),
			'data.other.tree': fromJS(treeData),
			'data.expandedKeys': fromJS(expandedKeys),
			'data.form.enableDate': stockPeriod,
			'data.form.endPeriod': endPeriod || stockPeriod,
			'data.limit.stateNow': stateNow,
			'data.loading': false
		})
		return state
	}

	/**
     * @description: 查询一个存货的明细
     * @param {array} list 表格的一条存货明细数据
     * @return: 无
    */
	reload = (state, list) => {
		// let reqlist = []
		// if (list && list.length>0) {	
		// 	list.forEach(item => {
        //         let length = item.StockDetailSubDtoList && item.StockDetailSubDtoList.length || 0
        //         if(length){
        //             item.StockDetailSubDtoList.forEach((data, index) => {
        //                 data.rowSpan = index == 0 ? length : 0               // 计算同一个存货有多少个明细列
        //                 reqlist.push(data)
        //             })
        //         }
				
		// 	})
		// }
		state = this.metaReducer.sfs(state, {
			// 'data.list': fromJS(reqlist),
			'data.list': fromJS(list),
			'data.loading': false
		})
		return state
	}

	/**
     * @description: 页面初始化时赋值
     * @param {array} businessType 树结构-业务类型
     * @param {array} list 收发存明细表表格数据
     * @param {array} treeList 树结构的明细
     * @param {string} inputVal 输入框的值，即查询条件
     * @return: 无
    */
	reloadType = (state, businessType, list, treeList, inputVal) => {
		let expandedKeys = ['0']
		let levelchildren = [],
			treeData = [], 
			listData = []
		if (businessType && businessType.length > 0) {
			businessType.forEach(item => {
				let name = item.code + '  ' + item.name
				item.name = name
				item.level = 2
				expandedKeys.push(item.id.toString())  // 展开的节点
				item.children = []
				treeList.forEach(v => {
					if (v.propertyId == item.id) {
						let name = v.fullname + '  ' + (v.specification ? v.specification : '')
						v.name = name
						v.level = 3
						item.children.push(v)
					}
				})
			})

			// 如果有查询条件
			if (inputVal !== '') {
				businessType.forEach((item, index) => {
					if (item.children.length > 0) {
						levelchildren.push(item)
					}
				})
			} else {
				levelchildren = businessType
			}

			treeData = [{
				name:'存货',
				id:'0',
				children: levelchildren
			}]
		} 

		// 表格数据处理
		// if (list && list.length > 0) {
		// 	let reqlist = []
		// 	list.forEach(item => {
        //         let length = item.StockDetailSubDtoList && item.StockDetailSubDtoList.length || 0
        //         if(length){
        //             item.StockDetailSubDtoList.forEach((v, index) => {
        //                 v.rowSpan = (index == 0) ? length : 0
        //                 reqlist.push(v)
        //             })
        //         }
		// 	})
		// 	listData = reqlist
		// }

		listData = list

		state = this.metaReducer.sfs(state, {
			'data.list': fromJS(listData),
			'data.other.tree': fromJS(treeData),
			'data.expandedKeys': fromJS(expandedKeys),
			'data.treeSelectedKey': fromJS(['0']),
			'data.treeLoading': false
		})	
		return state
	}

	treeKey = (state, data) => {
		state = this.metaReducer.sf(state, `data.expandedKeys`, data)
		return state
	}

	selectAll = (state, checked, gridName) => {
		state = this.extendReducer.gridReducer.selectAll(state, checked, gridName)
		return state
	}

	enable = (state, res, index) => {
		if (res) {
			state = this.metaReducer.sf(state, `data.list.${index}`, fromJS(res))
		}
		return state
	}

	selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked)
		return state
	}

	getTreeNode = (list, pid, key) => {
		var tree = []
		var temp
		for (var i = 0; i < list.length; i++) {
			if (list[i].pid == pid) {
				var obj = list[i]
				if (key != undefined && Number(key) != NaN) {
					obj.key = key + '-' + i
				} else {
					obj.key = i
				}
				temp = this.getTreeNode(list, list[i].id, i)
				if (temp.length > 0) {
					obj.children = temp
				}
				obj.title = obj.name
				tree.push(obj)
			}
		}
		return tree
	}
	setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o }
	return { ...ret }
}
