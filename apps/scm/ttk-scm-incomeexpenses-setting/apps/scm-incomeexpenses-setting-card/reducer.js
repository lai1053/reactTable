import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, option) => {
        state = this.metaReducer.sf(state, 'data.other.incomeexpensesTabId', option.incomeexpensesTabId)
        if (option.code) state = this.metaReducer.sf(state, 'data.form.code', option.code)

        //编辑时内容展示
        if (option.form) {
            if (option.form.accountName) {
                let accountCode = option.form.accountCode
                if (option.subjectList) {
                    option.subjectList.map(item => {
                        if (item.code == accountCode) {
                            option.form.defaultProject = item
                        }
                    })
                }
            }
            if (!option.form.name) option.form.name = option.form.archiveName  // 结算方式

            state = this.metaReducer.sf(state, 'data.form', fromJS(option.form))
            if (option.form.categoryId) {
                state = this.metaReducer.sf(state, 'data.form.receivables', fromJS({
                    id: option.form.categoryId,
                    name: option.form.categoryName
                }))
            }
        }
        //科目列表
        if (option.subjectList) {
            state = this.metaReducer.sf(state, 'data.other.defaultProject', fromJS(option.subjectList))
        }

        if (option.largeClass) {
            if(option.parentId) {
                let receivablesArr = option.largeClass.filter(m => m.id == option.parentId)
                if(receivablesArr.length){
                    state = this.metaReducer.sf(state, 'data.form.receivables', fromJS(receivablesArr[0]))
                }
            }
            state = this.metaReducer.sf(state, 'data.other.receivables', fromJS(option.largeClass))
        }
        if (option.softAppName) {
            state = this.metaReducer.sf(state, 'data.other.softAppName', option.softAppName)
        }
        return state
    }

    saveAndNew = (state, option) => {
        state = this.metaReducer.sf(state, 'data.form', fromJS({}))
        state = this.metaReducer.sf(state, 'data.other.isSaveAndNew', true)
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}