import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState();
        return this.metaReducer.init(state, initState)
    }
    load = (state, res, accountRadioValue) => {
        if (res && res.inventoryPropertyList) {
            // let newInventoryProperty = []
            // res.inventoryPropertyList.map(item => {
            //     newInventoryProperty.push({
            //         value: item.id,
            //         label: item.name
            //     })
            // })
            let newInventoryProperty = res.inventoryPropertyList.map(item => {
                return {
                    value: item.id,
                    label: item.name
                }
            })
            state = this.metaReducer.sf(state, 'data.other.type', fromJS(newInventoryProperty))
        }
        if (accountRadioValue === 'tab1' && res && res.details) {
            state = this.metaReducer.sf(state, `data.other.tableList.${accountRadioValue}`, fromJS(res.details))
            if (!res.details.length) {
                state = this.metaReducer.sf(state, 'data.other.isEmpty', true)
            } else {
                state = this.metaReducer.sf(state, 'data.other.isEmpty', false)
            }
        }
        if (accountRadioValue === 'tab1' && res && res.getList) {
            state = this.metaReducer.sf(state, `data.other.tableList.${accountRadioValue}`, fromJS(res.getList))
            if (!res.getList.length) {
                state = this.metaReducer.sf(state, 'data.other.isEmpty', true)
            } else {
                state = this.metaReducer.sf(state, 'data.other.isEmpty', false)
            }
        }
        if (accountRadioValue === 'tab2' && res && res.estimateList) {
            state = this.metaReducer.sf(state, `data.other.tableList.${accountRadioValue}`, fromJS(res.estimateList))
            if (!res.estimateList.length) {
                state = this.metaReducer.sf(state, 'data.other.isEmpty', true)
            } else {
                state = this.metaReducer.sf(state, 'data.other.isEmpty', false)
            }
        }
        if (res.mode) state = this.metaReducer.sf(state, 'data.form.methodId', res.mode)
        // 生产方式  0：传统生产，1：以销定产-按计价核算方式取值，2：以销定产-按配置原料的单价取值
        if (res.productAccountMode) state = this.metaReducer.sf(state, 'data.other.productAccountMode', res.productAccountMode)
        state = this.metaReducer.sfs(state, {
            'data.other.periodBeginDate': res.periodBeginDate,
            'data.other.lastDayOfUnEndingClosingCalendar': res.lastDayOfUnEndingClosingCalendar,
            'data.other.recoilMode': res.recoilMode
        })

        state = this.metaReducer.sf(state, `data.page.${accountRadioValue}`, fromJS(res.page))

        return state
    }
    searchUpdate = (state, value) => {
        value.type = value.type ? value.type : undefined
        state = this.metaReducer.sfs(state, {
            'data.searchValue': fromJS(value),
            'data.form.typeId': fromJS(value.type)
        })
        return state
    }
    upDate = (state, value) => {
        value = value ? value : undefined
        state = this.metaReducer.sfs(state, {
            'data.searchValue.type': fromJS(value),
            'data.form.typeId': fromJS(value)
        })
        return state
    }
    upDateStart = (state, path, value) => {
        state = this.metaReducer.sf(state, path, fromJS(value))
        return state
    }
    setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
    }
    updateOption = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}