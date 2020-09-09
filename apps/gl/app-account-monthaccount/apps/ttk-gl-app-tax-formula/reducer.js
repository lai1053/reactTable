import { fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

const BALANCESHEET_DATA = {//资产负债表相关数据
    columns: [{
        'id':'codeAndName',
        'name':'科目',
        'width':250
    },{
        'id':'flag',
        'name':'运算符号',
        'width':80
    },{
        'id':'formulaIdForPageStr',
        'name':'取数规则',
        'width':130
    },{
        'id':'periodEndAmountStr',
        'name':'期末数',
        'width':150
    },{
        'id':'yearBeginAmountStr',
        'name':'年初数',
        'width':150
    }],
    flagOption:[{
        name: '+',
        id: '+'
    },{
        name: '-',
        id: '-'
    }],
    formulaIdForPageOption:[{
        name: '余额',
        id: 1
    },{
        name: '本级科目借方余额',
        id: 2
    },{
        name: '本级科目贷方余额',
        id: 3
    },{
        name: '末级科目借方余额',
        id: 4
    },{
        name: '末级科目贷方余额',
        id: 5
    }]
}

const PROFITSTATEMENT_DATA = {//利润表相关数据
    columns: [{
        'id':'codeAndName',
        'name':'科目',
        'width':240
    },{
        'id':'flag',
        'name':'运算方式',
        'width':80
    },{
        'id':'formulaIdForPageStr',
        'name':'取数规则',
        'width':160
    },{
        'id':'amountStr',
        'name':'本期数',
        'width':150
    },{
        'id':'amountSumStr',
        'name':'本年累计数',
        'width':150
    }],
    flagOption:[{
        name: '+',
        id: '+'
    }],
    formulaIdForPageOption:[{
        name: '借方发生额',
        id: 3
    },{
        name: '贷方发生额',
        id: 4
    },{
        name: '借方发生额-贷方发生额',
        id: 1
    },{
        name: '贷方发生额-借方发生额',
        id: 2
    }]
}

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {//初始化
        const initState = getInitState(option)

        initState.data.accountingStandards = option.initData&&option.initData.accountingStandards
        initState.data.type = option.initData&&option.initData.type
        initState.data.period = option.initData.period
        initState.data.index = option.initData&&option.initData.index
        
        // if(initState.data.type==1) {
        //     initState.data.columns = BALANCESHEET_DATA.columns
        //     initState.data.flagOption = BALANCESHEET_DATA.flagOption
        //     initState.data.formulaIdForPageOption = BALANCESHEET_DATA.formulaIdForPageOption
        // } else {
        //     initState.data.columns = PROFITSTATEMENT_DATA.columns
        //     initState.data.flagOption = PROFITSTATEMENT_DATA.flagOption
        //     initState.data.formulaIdForPageOption = PROFITSTATEMENT_DATA.formulaIdForPageOption
        // }
        return this.metaReducer.init(state, initState)
     }

    load = (state, fieldValue) => {

        state = this.metaReducer.sfs(state, fieldValue)
        return state
    }

    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
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
