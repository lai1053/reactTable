import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import moment from 'moment'
import extend from './extend';
import { formatNumbe } from './../common'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked)
		return state
	}
    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }
    load = (state, response, getInvSetByPeroid) => {
        if (response && response.list && response.list.length > 0) {
            let list = response.list[response.list.length - 1]
            response.list.pop()
            
            state = this.metaReducer.sf(state, 'data.listAll.billBodyNum', formatNumbe(list.billBodyNum))
            state = this.metaReducer.sf(state, 'data.listAll.billBodyYbBalance', formatNumbe(list.billBodyYbBalance, 2))
            state = this.metaReducer.sf(state, 'data.list', fromJS(response.list))
        } else {
            state = this.metaReducer.sf(state, 'data.listAll.billBodyNum', formatNumbe(0))
            state = this.metaReducer.sf(state, 'data.listAll.billBodyYbBalance', formatNumbe(0, 2))
            state = this.metaReducer.sf(state, 'data.list', fromJS([]))
        }
        if (response && response.page) {
			let page = {
				current: response.page.currentPage,
                total: response.page.totalCount,
				pageSize: response.page.pageSize
			}
			state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
        }
        if (getInvSetByPeroid) {
            let stateNow = (getInvSetByPeroid.isGenVoucher || getInvSetByPeroid.isCarryOverMainCost) ? true : false
            // let stateNow=true
            state = this.metaReducer.sf(state, 'data.limit.stateNow', stateNow)
        }
        let name = this.metaReducer.context.get('currentOrg').name
        let year = sessionStorage['stockPeriod'+name].split('-')
        let skssq = year[0] + year[1]
        state = this.metaReducer.sf(state, 'data.defaultPickerValue', moment(skssq, 'YYYYMM'))
        return this.metaReducer.sf(state, 'data.other.focusCellInfo', undefined)
    }
    reload = (state, response) => {
        if (response && response.list && response.list.length > 0) {
            let list = response.list[response.list.length - 1]
            response.list.pop()
            
            state = this.metaReducer.sf(state, 'data.listAll.billBodyNum', formatNumbe(list.billBodyNum))
            state = this.metaReducer.sf(state, 'data.listAll.billBodyYbBalance', formatNumbe(list.billBodyYbBalance, 2))
            state = this.metaReducer.sf(state, 'data.list', fromJS(response.list))
        } else {
            state = this.metaReducer.sf(state, 'data.listAll.billBodyNum', formatNumbe(0))
            state = this.metaReducer.sf(state, 'data.listAll.billBodyYbBalance', formatNumbe(0, 2))
            state = this.metaReducer.sf(state, 'data.list', fromJS([]))
        }
        if (response && response.page) {
			let page = {
				current: response.page.currentPage,
                total: response.page.totalCount,
				pageSize: response.page.pageSize
			}
			state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
        }
        return this.metaReducer.sf(state, 'data.other.focusCellInfo', undefined)
    }
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}