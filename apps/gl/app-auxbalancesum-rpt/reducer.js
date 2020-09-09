import { Map, fromJS, toJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState } from './data'
import moment from 'moment'
import config from './config'
import {changeToOption} from './utils/app-auxbalancesum-rpt-common'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }
    //初始化
    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }
    //初始化选项
    initOption = (state, { accountList, accountDepthList, enabledPeriod, maxDocPeriod,auxGroupList, timePeriod}) => {
        if (accountList && accountList.glAccounts){           
            window.auxBalanceSumAccountList = accountList.glAccounts
            // state = this.metaReducer.sf(state, 'data.other.accountList', fromJS(changeToOption(accountList.glAccounts, 'codeAndName', 'code')))
        }
        state = this.metaReducer.sf(state, 'data.other.startAccountDepthList', fromJS(changeToOption(accountDepthList.values, 'value', 'key')))
        state = this.metaReducer.sf(state, 'data.other.endAccountDepthList', fromJS(changeToOption(accountDepthList.values, 'value', 'key')))
        state = this.metaReducer.sf(state, 'data.showOption.rptType', '科目辅助余额表')
        if (auxGroupList){
            state = this.metaReducer.sf(state, 'data.assistForm.initOption', fromJS(auxGroupList))
            state = this.metaReducer.sf(state, 'data.assistForm.assistFormOption', fromJS(auxGroupList))
        }

        if (enabledPeriod) {
            state = this.metaReducer.sf(state, 'data.other.enabledDate', fromJS(moment(new Date(enabledPeriod))))
        }
        if (maxDocPeriod) {
            state = this.metaReducer.sf(state, 'data.searchValue.date_start', moment(new Date(maxDocPeriod)))
            state = this.metaReducer.sf(state, 'data.searchValue.date_end', moment(new Date(maxDocPeriod)))
            state = this.metaReducer.sf(state, 'data.other.date_start', moment(new Date(maxDocPeriod)))
            state = this.metaReducer.sf(state, 'data.other.date_end', moment(new Date(maxDocPeriod)))
        }
        if(timePeriod){
            state = this.metaReducer.sf(state, 'data.other.timePeriod', fromJS(timePeriod))
        }
        return state
    }
    load = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value))
        return state
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }

    updateBathState = (state, arr) => {
        arr.forEach(item => {
            state = this.metaReducer.sf(state, item.path, fromJS(item.value))
        })
        return state
    }
    normalSearchChange = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    showOptionsChange = (state, {path, value}) => {
        return this.metaReducer.sf(state, path, value)
    }

    searchUpdate = (state, value) => {
        return this.metaReducer.sf(state, 'data.searchValue', fromJS(value))
    }

    tableOnchange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value))
        return state
    }

    sortReduce = (state, key, value) => {
        state = this.metaReducer.sf(state, `data.sort.${key}`, fromJS(value))
        state = this.metaReducer.sf(state, 'data.key', Math.random())
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
