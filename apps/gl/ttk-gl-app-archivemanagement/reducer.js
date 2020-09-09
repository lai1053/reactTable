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
    load = (state, response) => {
        state = this.metaReducer.sf(state, 'data.tree.expandedKeys', fromJS(response.expandedKeys))
        state = this.metaReducer.sf(state, 'data.tree.selectedKeys', fromJS(response.selectedKeys))
        state = this.metaReducer.sf(state, 'data.docMaxDate', response.docMaxDate)       
        return state
    }
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }
    btnDisabled = (state, disabled) => {
        state = this.metaReducer.sf(state, 'data.other.btnFileDisabled', disabled)
        state = this.metaReducer.sf(state, 'data.other.btnDisabled', disabled)
        return state
    }
    /**
     * 设置表格数据
     */
    setTableData = (state, response, treeState, period) => {
        let noFiles = [], files = []
        if (response && response.length > 0 && period == 0) {
            noFiles = response.filter(x => x.type != 'file')
            files = response.filter(x => x.type == 'file')
            state = this.metaReducer.sf(state, 'data.list', fromJS([...noFiles, ...files]))
        }else{
            state = this.metaReducer.sf(state, 'data.list', fromJS(response))
        }
        
        state = this.metaReducer.sf(state, 'data.tree.finishStates', fromJS(treeState))
        if (response && response.length > 0) {
            state = this.metaReducer.sf(state, 'data.other.btnDisabled', false)
        } else {
            state = this.metaReducer.sf(state, 'data.other.btnDisabled', true)
        }
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
