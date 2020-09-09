import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }
    load = (state, value, VatTaxpayer, title) => {
        if (value.selectedPeriod && VatTaxpayer &&
            VatTaxpayer.enabledYear == value.selectedPeriod.year && value.selectedPeriod.period != 1) {
            state = this.metaReducer.sf(state, 'data.other.beginningPeriod', true)
        } else {
            state = this.metaReducer.sf(state, 'data.other.beginningPeriod', false)
        }
        state = this.metaReducer.sf(state, 'data.userRole', fromJS(value['getRoleDtoList']))
        state = this.metaReducer.sf(state, 'data.statement', fromJS(value['reportTemplateDto']['rows']))
        state = this.metaReducer.sf(state, 'data.accountingStandards', fromJS(value['reportTemplateDto']['accountingStandardsId']))
        state = this.metaReducer.sf(state, 'data.selectTimeData', fromJS(value['periods']))
        // state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(value['selectedPeriod']['name']))
        const selectData = this.metaReducer.gf(state, 'data.selectData')    
        if ((selectData == undefined && title) || (selectData && title)) {

            state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(title['period']['name']))
        } else {

            state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(value['selectedPeriod']['name']))

        }
        let enabledMonth = `${VatTaxpayer.enabledMonth}`.indexOf('0') == -1 && parseInt(`${VatTaxpayer.enabledMonth}`) < 10 ? `0${VatTaxpayer.enabledMonth}` : `${VatTaxpayer.enabledMonth}`

        if (value['getRoleDtoList'] == false) {
            state = this.metaReducer.sf(state, 'data.isBeginningPeriodShow', false)
        } else {
            if (enabledMonth == '01') {

                state = this.metaReducer.sf(state, 'data.isBeginningPeriodShow', false)
            } else if (value.data) {
                if ((`${VatTaxpayer.enabledYear}年${enabledMonth}月` == value.selectedPeriod.name) || (`${VatTaxpayer.enabledYear}年${enabledMonth}月` == value.data.selectTimeTitle)) {
                    state = this.metaReducer.sf(state, 'data.isBeginningPeriodShow', true)
                }
            }
            else if (`${VatTaxpayer.enabledYear}年${enabledMonth}月` == value.selectedPeriod.name) {

                state = this.metaReducer.sf(state, 'data.isBeginningPeriodShow', true)
            } else if (value.periods[0].type != 'month' && value.selectedPeriod.name == value.periods[value.periods.length - 1].name) {
                state = this.metaReducer.sf(state, 'data.isBeginningPeriodShow', true)
            }
            else {

                state = this.metaReducer.sf(state, 'data.isBeginningPeriodShow', false)
            }
        }

        return state
    }

    select = (state, value, selectData) => {
        state = this.metaReducer.sf(state, 'data.selectData', fromJS(selectData))
        state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(selectData['name']))
        state = this.metaReducer.sf(state, 'data.statement', fromJS(value['rows']))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })
    return { ...metaReducer, ...o }
}
