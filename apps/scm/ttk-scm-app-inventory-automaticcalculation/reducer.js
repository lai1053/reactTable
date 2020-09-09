import { Map, fromJS } from 'immutable';
import { reducer as MetaReducer } from 'edf-meta-engine';
import config from './config';
import extend from './extend';
import { getInitState } from './data';

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer;
		this.extendReducer = option.extendReducer;
		this.config = config.current;
	}

	init = (state, option) => {
		const initState = getInitState();
		return this.metaReducer.init(state, initState);
	}

	load = (state, value, initData) => {
		value.details.map(m=>{
			if(initData && initData.type=='costSaleRatio'){
				m.amount = (Math.round(Number(m.price)*1000000)/1000000).toFixed(6)
				m.tempAmount = (Math.round(Number(m.tempPrice)*1000000)/1000000).toFixed(6)
			}else{
				m.amount = Number(m.amount).toFixed(2)
				m.tempAmount = Number(m.tempAmount).toFixed(2)
			}
			m.costRate = Number(m.costRate).toFixed(2)
			m.costRateError = false
			m.tempAmountError = false
		})
		
		state = this.metaReducer.sf(state, 'data.list', fromJS(value.details))
		state = this.metaReducer.sf(state, 'data.noDataVisible', true)
		if(value.defaultCostRate) state = this.metaReducer.sf(state, 'data.defaultCostRate', fromJS(value.defaultCostRate))
		if(initData) {
			// state = this.metaReducer.sf(state, 'data.period', fromJS(initData.date))
			state = this.metaReducer.sf(state, 'data.date', fromJS(initData.date))
			state = this.metaReducer.sf(state, 'data.type', fromJS(initData.type))
		}
		if(value.lastDayOfUnEndingClosingCalendar){
			state = this.metaReducer.sf(state, 'data.lastDayOfUnEndingClosingCalendar', fromJS(value.lastDayOfUnEndingClosingCalendar))
		}
		return state;
	}

	fixPosition = (state, condition) => {
		state = this.setMatchStatus(state, condition)
		return state
    }

	setMatchStatus = (state, condition) => {
        let list = this.metaReducer.gf(state, 'data.list'),
            matchIndex = this.metaReducer.gf(state, 'data.other.matchIndex'),
            matchBacktoZero = this.metaReducer.gf(state, 'data.other.matchBacktoZero'),
            firstMatchIndex = -1, aryMatch = []
		
		condition = (condition && condition.trim()) + ''
		if(!list.size) return state
        if (condition != '') {
            list = list.map((item, index) => {
                // 编码按照左匹配，名称按照模糊匹配
                if (item.get('inventoryName').indexOf(condition) > -1 ||
					item.get('specification').indexOf(condition) > -1 ||
					item.get('inventoryCode').indexOf(condition) > -1){
                    aryMatch.push(index)
                    if (firstMatchIndex == -1) {
                        firstMatchIndex = index
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
        } else {
            state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', -9)
        }

        return this.metaReducer.sf(state, 'data.other.matchIndex', matchIndex)
	}
	
	searchChange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', true)
        state = this.metaReducer.sf(state, 'data.other.matchIndex', -1)
		state = this.metaReducer.sf(state, 'data.search', value)
        return state
    }

    amountBlur = (state, list, _rowIndex) => {
		let allList = this.metaReducer.gf(state, 'data.list').toJS()
		allList.map((m, n)=>{
			if(m.id==list[_rowIndex].id) allList[n] = list[_rowIndex]
		})
		state = this.metaReducer.sf(state, 'data.list', fromJS(list))
		state = this.metaReducer.sf(state, 'data.allList', fromJS(allList))
		return state;
	}

}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}
