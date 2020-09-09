import { fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import extend from './extend'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.extendReducer = option.extendReducer
        this.config = config.current
    }

    init = (state, option) => {
        let initState = getInitState()
        initState.data.list = initState.data.other.defaultList
        if (option.businessType == 5000040024){
            initState.data.inventoryList = initState.data.other.defaultList
            initState.data.listSecond = initState.data.other.defaultList
        }      
        initState.data.other.businessType = option.businessType
        return this.metaReducer.init(state, initState)
    }

    load = (state, response, initData, allArchiveDS) => {
        if (response) {
            const businessType = initData.businessType
            state = this.metaReducer.sf(state, 'data.other.accountList', fromJS(response.accountList))
            if (response.list.length > 0) {
                let details = fromJS(response.list),
                    firstElement = details.get(0)
                //补全数据结构，否则nodejs会过滤掉，导致后面有值的列无法接收到数据
                if (!firstElement.get('inventoryAuxDataId')) {
                    details = details.update(0, item => item.set(`inventoryAuxDataId`, null))
                }
                if (!firstElement.get('incomeAuxDataId')) {
                    details = details.update(0, item => item.set(`incomeAuxDataId`, null))
                }
                if (!firstElement.get('costAuxDataId')) {
                    details = details.update(0, item => item.set(`costAuxDataId`, null))
                }
                if (!firstElement.get('costAccountId')) {
                    details = details.update(0, item => item.set(`costAccountId`, null))
                }
                if (!firstElement.get('inventoryAccountId')) {
                    details = details.update(0, item => item.set(`inventoryAccountId`, null))
                }
                if (!firstElement.get('incomeAccountId')) {
                    details = details.update(0, item => item.set(`incomeAccountId`, null))
                }
                if (businessType == 5000040026
                    || businessType == 5000040005) {
                    state = this.metaReducer.sf(state, 'data.list', details)
                }
                if (businessType == 5000040024) {
                    state = this.metaReducer.sf(state, 'data.inventoryList', details)
                }
                state = this.metaReducer.sf(state, 'data.other.btnDisabled', false)
            }
            if (response.listSecond && response.listSecond.length > 0) {
                let details = fromJS(response.listSecond),
                    firstElement = details.get(0)
                //补全数据结构，否则nodejs会过滤掉，导致后面有值的列无法接收到数据               
                if (!firstElement.get('costAuxDataId')) {
                    details = details.update(0, item => item.set(`costAuxDataId`, null))
                }
                state = this.metaReducer.sf(state, 'data.listSecond', details)
            }
        }
        if (allArchiveDS) {
            state = this.metaReducer.sf(state, 'data.other.allArchiveDS', allArchiveDS)
        }
        return state
    }
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.other.loading', loading)
    }
    selectRow = (state, path, rowIndex, checked) => {
        state = this.metaReducer.sf(state, `${path}.${rowIndex}.selected`, checked)
        return state
    }
    setGridFocus = (state, path) => {
        return this.metaReducer.sf(state, 'data.other.focusFieldPath', path)
    }
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    setDelList = (state, path, option) => {
        if (option.size < 1) {
            let initState = getInitState()
            state = this.metaReducer.sf(state, path, initState.data.other.defaultList)
        } else {
            state = this.metaReducer.sf(state, path, option)
        }
        return state
    }
    addRowBefore = (state, gridName, rowIndex) => {
        state = this.metaReducer.sf(state, 'data.other.btnDisabled', false)
        return state
    }

    delRowBefore = (state, gridName, rowIndex) => {
        return state
    }
    // editAuxAccount = (state, option) => {
    //     let curIndex = option.rowIndex
    //     if (option.colType == 'inventoryAccount') {
    //         state = this.metaReducer.sf(state, 'data.list.' + curIndex + '.inventoryAuxDataId', fromJS(option.data.get('id')))
    //     } else if (option.colType == 'incomeAccount') {
    //         state = this.metaReducer.sf(state, 'data.list.' + curIndex + '.incomeAuxDataId', fromJS(option.data.get('id')))
    //     } else {
    //         state = this.metaReducer.sf(state, 'data.list.' + curIndex + '.costAuxDataId', fromJS(option.data.get('id')))
    //     }
    //     return state
    // }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer })
    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}