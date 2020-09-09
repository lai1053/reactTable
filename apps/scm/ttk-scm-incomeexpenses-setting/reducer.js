import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState();
        return this.metaReducer.init(state, initState)
    }

    load = (state, { list, account }) => {
        if (list.length) list = this.getQueryList(list);
        const activeKey = this.metaReducer.gf(state, 'data.other.activeKey');
        state = this.metaReducer.sf(state, `data.table.${Number(activeKey)}.list`, fromJS(list))
        if (account) state = this.metaReducer.sf(state, 'data.tplus.account', fromJS(account))
        return state
    }

    setTabs = (state, res) => {
        if (res.length) {
            state = this.metaReducer.sf(state, 'data.other.activeKey', res[0].key);
        }
        state = this.metaReducer.sf(state, 'data.other.incomeexpensesTab', fromJS(res))
        return state
    }

    // incomeexpensesTabChange = (state, path, value, list) => {
    //     if (list.length) list = this.getQueryList(list);
    //     const activeKey = this.metaReducer.gf(state, 'data.other.activeKey');
    //     state = this.metaReducer.sf(state, `data.table.${Number(activeKey)}.list`, fromJS(list))
    //     state = this.metaReducer.sf(state, path, value + '')
    //     return state
    // }

    checkedChange = (state, option) => {
        const activeKey = this.metaReducer.gf(state, 'data.other.activeKey');
        let tableList = this.metaReducer.gf(state, `data.table.${Number(activeKey)}.list`).toJS()
        tableList[option.index].isEnable = option.res.isEnable
        tableList[option.index].id = option.res.id
        tableList[option.index].ts = option.res.ts
        state = this.metaReducer.sf(state, `data.table.${Number(activeKey)}.list`, fromJS(tableList))
        return state
    }

    getQueryList = (list) => {
        list.map((item) => {
            if (item.accountName && item.accountCode) {
                item.accountName = item.accountCode + ' ' + item.accountName
            }
        })
        return list
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
    tplusConfig = (state, option) => {
        let baseUrl = `${document.location.protocol}//${option.foreseeClientHost}`
        return this.metaReducer.sfs(state, { 'data.tplus.baseUrl': baseUrl, 'data.tplus.softAppName': option.appName })
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}