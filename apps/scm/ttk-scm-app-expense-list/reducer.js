import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import utils from 'edf-utils'
import config from './config'
import { getInitState } from './data'
import changeToOption from './utils/changeToOption'
import moment from 'moment'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, { response }) => {
        const { businessTypes, list, invoiceTypes, page ,column } = response;
        if(list){
            let expenseArr = []
            list.map(item=>{
                let childrenArr = item.details
                item.isTitle = true
                delete item.details
                expenseArr.push(item)
                if(childrenArr && childrenArr.length) childrenArr.map(m=>{
                    m.seq = item.seq
                    m.pid = item.id
                    m.businessDate = utils.date.transformMomentDate(item.businessDate)
                    m.isEdit = false
                    /*m.departmentId = item.departmentId
                    m.projectId = item.projectId
                    m.departmentName = item.departmentName
                    m.projectName = item.projectName*/
                    expenseArr.push(m)
                })
            })
            state = this.metaReducer.sf(state, 'data.list', fromJS(expenseArr))
        }
        state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
    
        if (invoiceTypes) {
            state = this.metaReducer.sf(state, 'data.other.invoiceType', fromJS(changeToOption(invoiceTypes, 'name', 'id')))
        }
        if(businessTypes){
            state = this.metaReducer.sf(state, 'data.other.businessType', fromJS(businessTypes))
        }
        if(column){
            state=this.metaReducer.sf(state,'data.other.columnDto',fromJS(column.columnDetails))
            state = this.metaReducer.sf(state, 'data.other.code', fromJS(column.code))
        }
        if(response.contextDate) {
            state = this.metaReducer.sf(state, 'data.searchValue.period', response.contextDate)
        }
        if(response.expenseInitDto) {
            state=this.metaReducer.sf(state,'data.other.expenseInitDto',fromJS(response.expenseInitDto))
        }
        return state
    }

    accountDateChange = (state, option) => {
        let list = this.metaReducer.gf(state, 'data.list').toJS()
        list.map(item => {
            if(item.pid == option.record.pid) item.businessDate = option.e
        })
        state = this.metaReducer.sf(state, `data.list`, fromJS(list))
        return state
    }
    
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    updateArr = (state, arr) => {
        arr.forEach(item => {
            state = this.metaReducer.sf(state, item.path, fromJS(item.value))
        })
        return state
    }

    tableSettingVisible = (state, { value, data }) => {
        state = this.metaReducer.sf(state, 'data.showTableSetting', value)
        data = this.metaReducer.gf(state, 'data.other.columnDto')
        return state
    }

    settingOptionsUpdate = (state, { visible, data }) => {
        state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(data.columnDetails))
        state = this.metaReducer.sf(state, 'data.other.code', fromJS(data.code))
        state = this.metaReducer.sf(state, 'data.showTableSetting', visible)
        return state
    }

    normalSearchChange = (state, { path, value }) => {
        state = this.metaReducer.sf(state, `data.normalSearch.${path}`, fromJS(value))
        return state
    }


    searchUpdate = (state, value) => {
        return this.metaReducer.sf(state, 'data.searchValue', fromJS(value))
    }

    tableOnchange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value))
        state = this.metaReducer.sf(state, 'data.key', Math.random())
        //state = this.metaReducer.sf(state, 'data.pagination', fromJS(response.pagination))
        //state = this.metaReducer.sf(state, 'data.filter', fromJS(response.filter))
        return state
    }

    sortReduce = (state, value) => {
        state = this.metaReducer.sf(state, `data.sort`, fromJS(value))
        return state
    }

    setTableScroll = (state, value) => {
        let tableOption = { x: 1090, y: value }
        state = this.metaReducer.sf(state, 'data.tableOption', fromJS(tableOption))
        return state
    }

    setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
    }

    addArchives = (state, type, rowIndex, ret, record) => {
        let list = this.metaReducer.gf(state, 'data.list').toJS()
        /*list.map(item => {
            if(item.pid == record.pid){
                item[type+'Id'] = ret.id
            }
        })*/
        list[rowIndex][type+'Id'] = ret.id
        state = this.metaReducer.sf(state, `data.list`, fromJS(list))

        let archList = this.metaReducer.gf(state, `data.other.${type}`).toJS()
        archList.push(ret)
        state = this.metaReducer.sf(state, `data.other.${type}`, fromJS(archList))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
