import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { number } from 'edf-utils'
import moment from 'moment'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }

    initLoadRpt = (state, value, reportType) => {
        let gradeList = this.metaReducer.gf(state, 'data.other.gradeList')
        state = this.metaReducer.sf(state, 'data.list', fromJS(this.formatDataList(value.dataList)))
        if (reportType == 0 || reportType == 1) {
            state = this.metaReducer.sf(state, 'data.other.supplierList', fromJS(value.customerList))
        } else {
            state = this.metaReducer.sf(state, 'data.other.supplierList', fromJS(value.supplierList))
        }
        state = this.metaReducer.sf(state, 'data.other.startDate', moment(new Date(value.startDate)))
        state = this.metaReducer.sf(state, 'data.other.endDate', moment(new Date(value.endDate)))
        state = this.metaReducer.sf(state, 'data.other.enabledDate', moment(new Date(value.enabledYearMonth)))
        state = this.metaReducer.sf(state, 'data.other.maxEnabledDate', moment(new Date(value.maxDate)))
        state = this.metaReducer.sf(state, 'data.other.accountCode', value.accountCode)
        state = this.metaReducer.sf(state, 'data.other.useCalc', value.useCalc)
        if(value.maxGrade){
            let newGradeList = []
            gradeList.map(o => {
                if(o.get('id') <= value.maxGrade){
                    newGradeList.push(o)
                    
                }
            })
            // newGradeList.push({name: '末级科目', id:0})
            state = this.metaReducer.sf(state, 'data.other.maxGrade', fromJS(value.maxGrade))
            state = this.metaReducer.sf(state, 'data.other.gradeList', fromJS(newGradeList))
        }
        state = this.tableLoading(state, false)
        return state
    }

    load = (state, value) => {
        let gradeList = this.metaReducer.gf(state, 'data.other.gradeList')
        state = this.metaReducer.sf(state, 'data.list', fromJS(this.formatDataList(value.dataList)))

        let reportType = this.metaReducer.gf(state, 'data.other.reportType')
        if (reportType < 2) {
            if (value.customerList) {
                state = this.metaReducer.sf(state, 'data.other.supplierList', fromJS(value.customerList))
            }
        } else {
            if (value.supplierList) {
                state = this.metaReducer.sf(state, 'data.other.supplierList', fromJS(value.supplierList))
            }
        }
        if (value.startDate) {
            state = this.metaReducer.sf(state, 'data.other.startDate', moment(new Date(value.startDate)))
        }
        if (value.endDate) {
            state = this.metaReducer.sf(state, 'data.other.endDate', moment(new Date(value.endDate)))
        }
        if (value.maxDate) {
            state = this.metaReducer.sf(state, 'data.other.maxEnabledDate', moment(new Date(value.maxDate)))
        }
        // if(value.useCalc){
            state = this.metaReducer.sf(state, 'data.other.useCalc', value.useCalc)
        // }
        if(value.maxGrade){
            let newGradeList = []
            gradeList.map(o => {
                if(o.get('id') <= value.maxGrade){
                    newGradeList.push(o)  
                }
            })
            // newGradeList.push({name: '末级科目', id:0})
            state = this.metaReducer.sf(state, 'data.other.maxGrade', fromJS(value.maxGrade))
            state = this.metaReducer.sf(state, 'data.other.gradeList', fromJS(newGradeList))
        }
        state = this.tableLoading(state, false)
        return state
    }

    formatDataList = (dataList) => {
        let dataItem, isRetailZero = true

        for (var i = 0; i < dataList.length; i++) {
            dataItem = dataList[i]

            dataItem.beginAmount = number.addThousPos(dataItem.beginAmount, true, isRetailZero)
            dataItem.addAmount = number.addThousPos(dataItem.addAmount, true, isRetailZero)
            dataItem.subAmount = number.addThousPos(dataItem.subAmount, true, isRetailZero)
            dataItem.addAmountSum = number.addThousPos(dataItem.addAmountSum, true, isRetailZero)
            dataItem.subAmountSum = number.addThousPos(dataItem.subAmountSum, true, isRetailZero)
            dataItem.endAmount = number.addThousPos(dataItem.endAmount, true, isRetailZero)

            dataList[i] = dataItem
        }

        return dataList
    }

    onFieldChange = (state, path, value) => {
        if (path.indexOf('date') > -1) {
            state = this.metaReducer.sf(state, 'data.other.startDate', value.startDate)
            state = this.metaReducer.sf(state, 'data.other.endDate', value.endDate)
        } else if (path.indexOf('supplierList') > -1) {
            state = this.metaReducer.sf(state, 'data.other.id', value)
        } else if(path.indexOf('grade') > -1){
            state = this.metaReducer.sf(state, 'data.other.grade', value)
        }else if (path.indexOf('noBalanceNoDisplay') > -1) {
            state = this.metaReducer.sf(state, 'data.other.noBalanceNoDisplay', value)
        }

        return state
    }

    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }
}
export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer })
    return {...metaReducer, ...o }
}
