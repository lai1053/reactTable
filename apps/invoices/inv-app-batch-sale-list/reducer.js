import { fromJS, Map } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import utils from "edf-utils";

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }
    load = (state, data) => {
        if (data && data.list) {
            const { list, page, totalHjse, fpzs, normalFpzs, totalHjje, negativeTotalHjje, negativeTotalHjse,dljgId,userId } = data
            const amount = {
                totalHjse: totalHjse,
                totalHjje: totalHjje,
                fpzs: fpzs,
                negativeTotalHjje: negativeTotalHjje,
                negativeTotalHjse: negativeTotalHjse,
                normalFpzs,
            }
            const amountDataOld = this.metaReducer.gf(state, 'data.amountDataOld').toJS()
            Object.keys(amountDataOld).forEach(item => {
                let itemVal = amount[item]
                amountDataOld[item] = item === 'fpzs' || item === 'normalFpzs' ? itemVal : utils.number.format(itemVal, 2)
            })
            state = this.metaReducer.sf(state, 'data.amountData', fromJS(amountDataOld))
            state = this.metaReducer.sf(state, 'data.amountDataOld', fromJS(amountDataOld))
            state = this.metaReducer.sf(state, 'data.list', fromJS(list))
            state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
            state = this.metaReducer.sf(state, 'data.dljgId', dljgId)
            state = this.metaReducer.sf(state, 'data.userId', userId)
        }
        return state
    }
    tableLoading = (state, value) => {
        return this.metaReducer.sf(state, 'data.loading', value)
    }
    setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
    }
    sortReduce = (state, value) => {
        state = this.metaReducer.sf(state, `data.sort`, fromJS(value))
        return state
    }
    tableSettingVisible = (state, { value }) => {
        state = this.metaReducer.sf(state, 'data.showTableSetting', value)
        return state
    }
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}