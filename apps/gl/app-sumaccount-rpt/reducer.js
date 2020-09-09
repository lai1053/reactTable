import { Map, fromJS, toJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
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

    load = (state, value) => {
        let quantity = this.metaReducer.gf(state, 'data.showOption.num'),
        currency = this.metaReducer.gf(state, 'data.showOption.currency'),
        code,
        columnDto,
        customDecideDisVisibleList = []
        if (value.columnDtos) {
            value.columnDtos.map(o => {
                if (quantity == true && currency == false) {
                    if (o.code == 'sumAccountSelectCount') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else if (quantity == false && currency == true) {
                    if (o.code == 'sumAccountCurrency') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else if (quantity == true && currency == true) {
                    if (o.code == 'sumAccountSelectCountCurrency') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else {
                    if (o.code == 'sumAccountNoSelect') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                }
            })
        }
        if(value.data){
            value.data.map(item => {
                item.codeAndDate = `${item.accountCode}-${item.currencyName}-${item.accountDate}`
                item.codeAndCurrency = `${item.accountCode}-${item.currencyName}`
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
            state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(columnDto))
            state = this.metaReducer.sf(state, 'data.other.customDecideDisVisibleList', fromJS(customDecideDisVisibleList))
        }
        // state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(columnDto))
        state = this.metaReducer.sf(state, 'data.other.code', code)
        state = this.metaReducer.sf(state, 'data.list', fromJS(value.data))
        state = this.metaReducer.sf(state, 'data.pagination', fromJS(value.page))
        state = this.metaReducer.sf(state, 'data.loading',false)
        let tableOption = this.metaReducer.gf(state, 'data.tableOption')
        if(currency || quantity){
            tableOption = tableOption.set('h', 155)
            state = this.metaReducer.sf(state, 'data.tableOption', fromJS(tableOption))
            // loadObj['data.tableOption'] = fromJS(tableOption)
        }
        return state
    }

    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
    normalSearchChange = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }


    showOptionsChange = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, value)
    }
    tableSettingVisible = (state, value) => {
        state = this.metaReducer.sf(state, 'data.showTableSetting', value)      
        return state
    }
    searchUpdate = (state, value) => {
        return this.metaReducer.sf(state, 'data.searchValue', fromJS(value))
    }

    initOption = (state, { currencylist, accountlist, enableddate , accountDepthList, accountListAll}) => {
        // state = this.metaReducer.sf(state, 'data.other.startAccountList', fromJS(changeToOption(accountListAll.glAccounts, 'codeAndName', 'code')))
        // state = this.metaReducer.sf(state, 'data.other.endAccountList', fromJS(changeToOption(accountListAll.glAccounts, 'codeAndName', 'code')))

        if(accountListAll) window.startAccountList = accountListAll.glAccounts 

        state = this.metaReducer.sf(state, 'data.other.currencylist', fromJS(currencylist))
        state = this.metaReducer.sf(state, 'data.other.accountlist', fromJS(accountlist))
        state = this.metaReducer.sf(state, 'data.other.enableddate', fromJS(enableddate))
        state = this.metaReducer.sf(state, 'data.other.startAccountDepthList', fromJS(changeToOption(accountDepthList.values, 'value', 'key')))
        state = this.metaReducer.sf(state, 'data.other.endAccountDepthList', fromJS(changeToOption(accountDepthList.values, 'value', 'key'))) 
        return state
    }
    settingOptionsUpdate = (state, { visible, data }) => {
        state = this.metaReducer.sfs(state, {
            'data.other.columnDto': fromJS(data),
            'data.showTableSetting': visible,
        })
        return state
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
