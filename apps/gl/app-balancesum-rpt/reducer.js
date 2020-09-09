import { Map, fromJS, toJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState } from './data'
import moment from 'moment'
import config from './config'
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
    fixPosition = (state, condition) => {

        let list = this.metaReducer.gf(state, 'data.list'),
            matchIndex = this.metaReducer.gf(state, 'data.other.matchIndex'),
            matchBacktoZero = this.metaReducer.gf(state, 'data.other.matchBacktoZero'),
            firstMatchIndex = -1, aryMatch = []
            // dom = document.getElementsByClassName('ant-table-body')[0]

        condition = (condition && condition.trim()) + ''
        if (condition != '') {

            list = list.map((item, index) => {
                // 编码按照左匹配，名称按照模糊匹配
                if (item.get('accountName') != '合计' &&
                    (item.get('accountCode') && item.get('accountCode').replace(/\s+/g, "").indexOf(condition) == 0 ||
                        item.get('accountName') && item.get('accountName').replace(/\s+/g, "").indexOf(condition) > -1)) {
                            aryMatch.push(index)
                            if (firstMatchIndex == -1) {
                                firstMatchIndex = index
                            }
                        item = item.set('isMatch', true)                    
                } else {
                    if (item.get('isMatch') == true) {
                        item = item.set('isMatch', false)
                    }
                }
                return item
            })
            if (matchBacktoZero) {
                matchIndex = firstMatchIndex
            } else {
                let aryIndex = aryMatch.findIndex((x) => x > matchIndex)

                if (aryIndex == -1) {
                    matchIndex = firstMatchIndex
                } else {
                    matchIndex = parseInt(aryMatch[aryIndex])
                }
            }
            state = this.metaReducer.sf(state, 'data.list', list)
        }
        if (matchIndex > -1) {
            state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', matchIndex)
            state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', false)
            state = this.metaReducer.sf(state, 'data.other.searchFlag', true)
        } else {
            if (condition == undefined) {
                state = this.metaReducer.sf(state, 'data.other.searchFlag', true)
            }
            state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', -9)
        }

        // dom.scrollTop = matchIndex * 37 - dom.offsetHeight + 37
        return this.metaReducer.sf(state, 'data.other.matchIndex', matchIndex)
    }

    searchChange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', true)
        state = this.metaReducer.sf(state, 'data.other.matchIndex', -1)
        return state
        // return this.metaReducer.sf(state, 'data.other.positionCondition', value)
    }
    initOption = (state, { accountList, currencyList, accountDepthList, enabledPeriod, maxDocPeriod }, resFocus) => {
        if(accountList){
            window.balanceSumAccountList = accountList.glAccounts
        }
        // state = this.metaReducer.sf(state, 'data.other.startAccountList', fromJS(changeToOption(accountList.glAccounts, 'codeAndName', 'code')))
        // state = this.metaReducer.sf(state, 'data.other.endAccountList', fromJS(changeToOption(accountList.glAccounts, 'codeAndName', 'code')))
        state = this.metaReducer.sf(state, 'data.other.currencyList', fromJS(changeToOption(currencyList, 'name', 'id')))
        state = this.metaReducer.sf(state, 'data.other.tmpCurrencyList', fromJS(currencyList))
        state = this.metaReducer.sf(state, 'data.other.startAccountDepthList', fromJS(changeToOption(accountDepthList.values, 'value', 'key')))
        state = this.metaReducer.sf(state, 'data.other.endAccountDepthList', fromJS(changeToOption(accountDepthList.values, 'value', 'key')))
        if (enabledPeriod) {
            state = this.metaReducer.sf(state, 'data.other.enabledDate', fromJS(moment(new Date(enabledPeriod))))
        }
        if (maxDocPeriod) {
            state = this.metaReducer.sf(state, 'data.searchValue.date_start', moment(new Date(maxDocPeriod)))
            state = this.metaReducer.sf(state, 'data.searchValue.date_end', moment(new Date(maxDocPeriod)))
            state = this.metaReducer.sf(state, 'data.searchValue.init_date_start', moment(new Date(maxDocPeriod)))
            state = this.metaReducer.sf(state, 'data.searchValue.init_date_end', moment(new Date(maxDocPeriod)))
        }

        if(resFocus) {
            state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', true)
            state = this.metaReducer.sf(state, 'data.other.matchIndex', -1)
            state = this.metaReducer.sf(state, 'data.other.currentTime', '')
            state = this.metaReducer.sf(state, 'data.other.timePeriod', fromJS(resFocus))
        }

        return state
    }
    load = (state, value, tableOption) => {
        let quantity = this.metaReducer.gf(state, 'data.showOption.quantity'),
            currency = this.metaReducer.gf(state, 'data.showOption.currency'),
            multi = this.metaReducer.gf(state, 'data.showOption.multi'),
            code,
            columnDto,
            customDecideDisVisibleList = []
        if (value.columnDtos) {
            value.columnDtos.map(o => {
                if (quantity == true && currency == false) {
                    if (o.code == 'balanceListSelectCount') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else if (quantity == false && currency == true) {
                    if (o.code == 'balanceListCurrency') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else if (quantity == true && currency == true) {
                    if (o.code == 'balanceListSelectCountCurrency') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else {
                    if (o.code == 'balanceListNoSelect') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                }
            })
        }

        if(value.details){
            // value.details = value.details.splice(0, 1)
            value.details.map(item => {
                item.accountCodeAndName = `${item.accountCode}-${item.accountName}`
            })
        }
        state = this.metaReducer.sf(state, 'data.list', fromJS(value.details))
        state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(columnDto))
        state = this.metaReducer.sf(state, 'data.other.columnDtoMap', fromJS(value.columnDtos))
        state = this.metaReducer.sf(state, 'data.other.code', code)
        state = this.metaReducer.sf(state, 'data.pagination', fromJS(value.page))
        if (columnDto) {
            columnDto.map(o => {
                if (o.isVisible == false) {
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
        state = this.metaReducer.sf(state, 'data.loading', false)
        if(tableOption) {
            state = this.metaReducer.sf(state, 'data.tableOption', tableOption)
            state = this.metaReducer.sf(state, 'data.randomNum', Math.random())
        }
        return state
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
    setScroll = (state, value) => {
		state = this.metaReducer.sf(state, 'data.tableOption.y', value.tableDivHeight)
		state = this.metaReducer.sf(state, 'data.tableOption.x', value.tableDivWidth)
		return state
	}
    normalSearchChange = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }

    showOptionsChange = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, value)
    }

    searchUpdate = (state, value) => {
        return this.metaReducer.sf(state, 'data.searchValue', fromJS(value))
    }

    optionsUpdate = (state, value) => {
        let columnDtoMap = this.metaReducer.gf(state, 'data.other.columnDtoMap') && this.metaReducer.gf(state, 'data.other.columnDtoMap').toJS(),
            quantity = this.metaReducer.gf(state, 'data.showOption.quantity'),
            currency = this.metaReducer.gf(state, 'data.showOption.currency'),
            multi = this.metaReducer.gf(state, 'data.showOption.multi'),
            columnDto,
            code
        if (columnDtoMap) {
            columnDtoMap.map(o => {
                if (quantity == true && currency == false) {
                    if (o.code == 'balanceListSelectCount') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else if (quantity == false && currency == true) {
                    if (o.code == 'balanceListCurrency') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else if (quantity == true && currency == true) {
                    if (o.code == 'balanceListSelectCountCurrency') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                } else {
                    if (o.code == 'balanceListNoSelect') {
                        columnDto = o.columnDetails
                        code = o.code
                    }
                }
            })
        }
        state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(columnDto))
        state = this.metaReducer.sf(state, 'data.other.code', code)
        return this.metaReducer.sf(state, 'data.showOption', fromJS(value))
    }

    sortReduce = (state, key, value) => {
        state = this.metaReducer.sf(state, `data.sort.${key}`, fromJS(value))
        state = this.metaReducer.sf(state, 'data.key', Math.random())
        return state
    }
    updateArr = (state, arr) => {
        arr.forEach(item => {
            state = this.metaReducer.sf(state, item.path, fromJS(item.value))
        })
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}