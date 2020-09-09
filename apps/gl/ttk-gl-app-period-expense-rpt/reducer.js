import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState, UNFOLD, FOLD } from './data'
import moment from 'moment'
import { number } from 'edf-utils'
import { consts } from 'edf-consts'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        if (!option.periodDate) {
            option.periodDate = moment(new Date()).format('YYYY-MM')
        }
        const initState = getInitState(option)

        return this.metaReducer.init(state, initState)
    }

    initLoadRpt = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value.fatherList))
        state = this.metaReducer.sf(state, 'data.other.sonMap', fromJS(value.sonMap))
        if (value.maxEndYM) {
            state = this.metaReducer.sf(state, 'data.other.maxEndYM', value.maxEndYM)
        }
        if (value.defaultDisplayYM) {
            state = this.metaReducer.sf(state, 'data.period', value.defaultDisplayYM)
        }
        if (value.enabledYearMonth) {
            state = this.metaReducer.sf(state, 'data.other.disabledDate', value.enabledYearMonth)
        }

        state = this.setPeriodExpenseCode(state, value)

        return state
    }

    load = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value.fatherList))
        state = this.metaReducer.sf(state, 'data.other.sonMap', fromJS(value.sonMap))
        state = this.setPeriodExpenseCode(state, value)

        if (value.maxEndYM) {
            state = this.metaReducer.sf(state, 'data.other.maxEndYM', value.maxEndYM)
        }
        if (value.defaultDisplayYM) {
            state = this.metaReducer.sf(state, 'data.period', value.defaultDisplayYM)
        }
        if (value.enabledYearMonth) {
            state = this.metaReducer.sf(state, 'data.other.disabledDate', value.enabledYearMonth)
        }

        let foldStatus = this.metaReducer.gf(state, 'data.other.foldStatus'),
            periodExpenseCode = this.metaReducer.gf(state, 'data.other.periodExpenseCode')

        if (foldStatus.get(periodExpenseCode.get('saleExpenseCode')) == UNFOLD) {
            state = this.unfoldSonAccount(state, periodExpenseCode.get('saleExpenseCode'), 0)
        }
        if (foldStatus.get(periodExpenseCode.get('manageExpenseCode')) == UNFOLD) {
            let list = this.metaReducer.gf(state, 'data.list')
            let index = list.findIndex(item => {
                return item.get('code') == periodExpenseCode.get('manageExpenseCode')
            })
            state = this.unfoldSonAccount(state, periodExpenseCode.get('manageExpenseCode'), index)
        }
        if (foldStatus.get(periodExpenseCode.get('financeExpenseCode')) == UNFOLD) {
            let list = this.metaReducer.gf(state, 'data.list')
            let index = list.findIndex(item => {
                return item.get('code') == periodExpenseCode.get('financeExpenseCode')
            })
            state = this.unfoldSonAccount(state, periodExpenseCode.get('financeExpenseCode'), index)
        }

        return state
    }

    setPeriodExpenseCode = (state, value) => {
        let periodExpenseCode = {}
        if (value.accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
            periodExpenseCode = {
                saleExpenseCode: '5601',
                manageExpenseCode: '5602',
                financeExpenseCode: '5603'
            }
        } else if (value.accountingStandards == consts.ACCOUNTINGSTANDARDS_2007){
            periodExpenseCode = {
                saleExpenseCode: '6601',
                manageExpenseCode: '6602',
                financeExpenseCode: '6603'
            }
        }
        return this.metaReducer.sf(state, 'data.other.periodExpenseCode', Map(periodExpenseCode))
    }

    setIconType = (state, code, index) => {
        let foldStatus = this.metaReducer.gf(state, 'data.other.foldStatus'),
            iconType = this.metaReducer.gf(state, 'data.other.iconType')

        if (foldStatus.get(code) == FOLD) {
            foldStatus = foldStatus.set(code, UNFOLD)
            iconType = iconType.set(code, 'shang')

            state = this.unfoldSonAccount(state, code, index)
        } else {
            foldStatus = foldStatus.set(code, FOLD)
            iconType = iconType.set(code, 'xia')

            state = this.foldSonAccount(state, code)
        }
        state = this.metaReducer.sf(state, 'data.other.foldStatus', foldStatus)
        state = this.metaReducer.sf(state, 'data.other.iconType', iconType)

        return state
    }

    unfoldSonAccount = (state, code, index) => {
        let sonMap = this.metaReducer.gf(state, 'data.other.sonMap'),
            conrrespondCodeList = sonMap.get(code)

        if (conrrespondCodeList && conrrespondCodeList.size > 0) {
            let list = this.metaReducer.gf(state, 'data.list'),
                insertRowIndex = index + 1

            for (var i = 0; i < conrrespondCodeList.size; i++) {
                list = list.insert(insertRowIndex+i, conrrespondCodeList.get(i))
            }
            state = this.metaReducer.sf(state, 'data.list', list)
        }

        return state
    }

    foldSonAccount = (state, code) => {
        let nextCode,
            periodExpenseCode = this.metaReducer.gf(state, 'data.other.periodExpenseCode')

        if (code == periodExpenseCode.get('saleExpenseCode'))
            nextCode = periodExpenseCode.get('manageExpenseCode')
        else if (code == periodExpenseCode.get('manageExpenseCode'))
            nextCode = periodExpenseCode.get('financeExpenseCode')
        else if (code == periodExpenseCode.get('financeExpenseCode'))
            nextCode = ''

        let list = this.metaReducer.gf(state, 'data.list'),
            maxSize = list.size,
            newList = List()

        for (var i = 0; i < list.size; i++) {
            if (list.get(i).get('parentCode') != code ) {
                newList = newList.push(list.get(i))
            }

        }
        state = this.metaReducer.sf(state, 'data.list', newList)

        return state
    }

    setScrollX = (state, value) => {
        return this.metaReducer.sf(state, 'data.other.scrollX', value)
    }
    setScrollY = (state, value) => {
        return this.metaReducer.sf(state, 'data.other.scrollY', value)
    }
}
export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer })
    return {...metaReducer, ...o }
}
