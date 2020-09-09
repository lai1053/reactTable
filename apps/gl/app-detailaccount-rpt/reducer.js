import { Map, fromJS, toJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState } from './data'
import moment from 'moment'
import {message} from 'antd'
import config from './config'
import * as data from './data'
import changeToOption from './utils/changeToOption'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
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

    load = (state, value, selectKeys, other) => {
        let quantity = this.metaReducer.gf(state, 'data.showOption.num'),
        currency = this.metaReducer.gf(state, 'data.showOption.currency'),
        code,
        columnDto,
        customDecideDisVisibleList = []
        if (value.columnDtos) {
            value.columnDtos.map(o => {
                if (quantity == true && currency == false) {
                    if (o.code == 'detailAccountSelectCount') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else if (quantity == false && currency == true) {
                    if (o.code == 'detailAccountCurrency') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else if (quantity == true && currency == true) {
                    if (o.code == 'detailAccountSelectCountCurrency') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else {
                    if (o.code == 'detailAccountNoSelect') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                }
            })
        }
        if (columnDto) {
            columnDto.map(o => {
                if (o.customDecideVisible == false) {
                    customDecideDisVisibleList.push({
                        fieldName: o.fieldName,
                        width: o.width,
                        isVisible: o.isVisible,
                        customDecideVisible: o.customDecideVisible
                    })
                }
            })
            state = this.metaReducer.sf(state, 'data.other.customDecideDisVisibleList', fromJS(customDecideDisVisibleList))
        }
        let loadObj = {
            'data.other.columnDto': fromJS(columnDto),
            'data.list': fromJS(value.data?value.data:[]),
            'data.other.code': code,
            'data.pagination': fromJS(value.page)
        }
       
        if(selectKeys) {
            loadObj['data.other.selectKeys'] = fromJS(selectKeys)
            loadObj['data.searchValue.accountCode'] = selectKeys[0]
            
        }
        if(other){
            loadObj = {...loadObj, ...other}
        }
        let tableOption = this.metaReducer.gf(state, 'data.tableOption')
        if(currency || quantity){
            tableOption = tableOption.set('h', 155)
            loadObj['data.tableOption'] = fromJS(tableOption)
        }
        state = this.metaReducer.sfs(state, loadObj)
        return state
    }

    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }

    getEnableDate = (state, res) => {
        return this.metaReducer.sf(state, 'data.enableDate', moment(new Date(res)))
    }

    normalSearchChange = (state, { path, value, getExpandKeys }) => {
        state = this.metaReducer.sf(state, path, fromJS(value))
        if(getExpandKeys && getExpandKeys.length) {
            state = this.metaReducer.sf(state, 'data.other.expandKeys', fromJS(getExpandKeys))
        }
        return state
    }

    showOptionsChange = (state, {path, value}) => {
        return this.metaReducer.sf(state, path, value)
    }

    searchUpdate = (state, value) => {
        return this.metaReducer.sf(state, 'data.searchValue', fromJS(value))
    }

    initOption = (state, { currencyList , accountList, dataList, moreSearchAccountList, accountDepthList}) => {
        let loadObj = {
            'data.other.currencylist': fromJS(currencyList),
            'data.other.treelist': fromJS(data.transData(accountList))
        }
        if(moreSearchAccountList){
            window.detailAccountList = moreSearchAccountList.glAccounts
        }

        window.accountlist = accountList
        if(accountDepthList){
            loadObj['data.other.startAccountDepthList'] = fromJS(changeToOption(accountDepthList.values, 'value', 'key'))
            loadObj['data.other.endAccountDepthList'] = fromJS(changeToOption(accountDepthList.values, 'value', 'key'))
            
        }

        if( dataList ){
            loadObj['data.list'] = fromJS(dataList.data)
            loadObj['data.pagination'] = fromJS(dataList.page)
            
        }
        state = this.metaReducer.sfs(state, loadObj)
        return state
    }

    tableOnchange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value))
        return state
    }

    sortReduce = (state, key, value) => {
       
        state = this.metaReducer.sf(state, `data.sort.${key}`, fromJS(value))
        return state
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
    settingOptionsUpdate = (state, { visible, data }) => {
        state = this.metaReducer.sfs(state, {
            'data.other.columnDto': fromJS(data),
            'data.showTableSetting': visible,
        })
        return state
    }
    tableSettingVisible = (state, value) => {
        state = this.metaReducer.sf(state, 'data.showTableSetting', value)      
        return state
    }
}
export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
