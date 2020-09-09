import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { consts } from 'edf-consts'

const SMALLACCOUNTINGSTANDARDS = [
    {
        rowIndex: 0,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 10,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 11,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 12,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 13,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 15,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 16,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    // {
    //     rowIndex: 20,
    //     assetsDisabled: false,
    //     liabilitiesDisabled: true
    // },
    {
        rowIndex: 21,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 22,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 23,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 24,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 25,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 30,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 31,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }
]

const ACCOUNTINGSTANDARDS = [
    {
        rowIndex: 0,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    // {
    //     rowIndex: 10,
    //     assetsDisabled: true,
    //     liabilitiesDisabled: false
    // },
    // {
    //     rowIndex: 11,
    //     assetsDisabled: false,
    //     liabilitiesDisabled: true
    // },
    // {
    //     rowIndex: 12,
    //     assetsDisabled: true,
    //     liabilitiesDisabled: false
    // },
    // {
    //     rowIndex: 13,
    //     assetsDisabled: true,
    //     liabilitiesDisabled: true
    // },
    {
        rowIndex: 14,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 15,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 16,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 23,
        assetsDisabled: false,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 24,
        assetsDisabled: false,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 25,
        assetsDisabled: false,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 27,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 28,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 29,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 40,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 39,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },

    {
        rowIndex: 33,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 34,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 35,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 36,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 37,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 38,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
]
const ACCOUNTINGSTANDARDSNEW = [
    {
        rowIndex: 0,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 12,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 13,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 14,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 24,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 25,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 26,
        assetsDisabled: false,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 29,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 30,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 31,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 32,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },{
        rowIndex: 33,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 34,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },{
        rowIndex: 35,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 36,
        assetsDisabled: true,
        liabilitiesDisabled: false
    },
    {
        rowIndex: 37,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
    {
        rowIndex: 38,
        assetsDisabled: true,
        liabilitiesDisabled: true
    },
]
const ACCOUNTINGSTANDARDS_NONPROFITORG = [
    {
        rowIndex: 0,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }, {
        rowIndex: 9,
        assetsDisabled: true,
        liabilitiesDisabled: false
    }, {
        rowIndex: 10,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }, {
        rowIndex: 11,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }, {
        rowIndex: 12,
        assetsDisabled: false,
        liabilitiesDisabled: true
    }, {
        rowIndex: 14,
        assetsDisabled: true,
        liabilitiesDisabled: false
    }, {
        rowIndex: 15,
        assetsDisabled: true,
        liabilitiesDisabled: false
    }, {
        rowIndex: 16,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }, {
        rowIndex: 17,
        assetsDisabled: false,
        liabilitiesDisabled: true
    }, {
        rowIndex: 18,
        assetsDisabled: false,
        liabilitiesDisabled: true
    }, {
        rowIndex: 20,
        assetsDisabled: false,
        liabilitiesDisabled: true
    }, {
        rowIndex: 21,
        assetsDisabled: false,
        liabilitiesDisabled: true
    }, {
        rowIndex: 22,
        assetsDisabled: false,
        liabilitiesDisabled: true
    }, {
        rowIndex: 23,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }, {
        rowIndex: 24,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }, {
        rowIndex: 25,
        assetsDisabled: true,
        liabilitiesDisabled: false
    }, {
        rowIndex: 27,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }, {
        rowIndex: 28,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }, {
        rowIndex: 29,
        assetsDisabled: false,
        liabilitiesDisabled: true
    }, {
        rowIndex: 30,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }, {
        rowIndex: 31,
        assetsDisabled: true,
        liabilitiesDisabled: true
    }
]

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, value, title) => {
        if(this.metaReducer.gf(state,'data.selectTimeTitle')){
            state = this.metaReducer.sf(state, 'data.statement', fromJS(this.setCellDisabled(state, value['rows'])))
            state = this.metaReducer.sf(state, 'data.resetArApAccount', fromJS(value['resetArApAccount']))
        }else{
            // state = this.metaReducer.sf(state, 'data.statement', fromJS( value['reportTemplateDto']['rows'] ))
            state = this.metaReducer.sf(state, 'data.statement', fromJS(this.setCellDisabled(state, value['reportTemplateDto']['rows'])))
            // state = this.metaReducer.sf(state, 'data.accountingStandards', fromJS(value['reportTemplateDto']['accountingStandardsId']))
            state = this.metaReducer.sf(state, 'data.selectTimeData', fromJS(value['periods']))
            state = this.metaReducer.sf(state, 'data.resetArApAccount', fromJS(value['resetArApAccount']))
            state = this.metaReducer.sf(state, 'data.selectedPeriod', fromJS(value['selectedPeriod']))
            const selectData = this.metaReducer.gf(state,'data.selectData')        
            if ((selectData == undefined && title) || (selectData && title)) {
    
                state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(title['period']['name']))
            } else {
    
                state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(value['selectedPeriod']['name']))
    
            }
        }
        
        console.log(state.toJS())
        return state
    }
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }
    select = (state, value, selectData) => {
        console.log(selectData)
        state = this.metaReducer.sf(state, 'data.selectData', fromJS(selectData))
        state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(selectData['name']))
        // state = this.metaReducer.sf(state, 'data.templateCode', fromJS( value['templateCode'] ))
        state = this.metaReducer.sf(state, 'data.statement', fromJS(this.setCellDisabled(state, value['rows'])))
        state = this.metaReducer.sf(state, 'data.recalculation', !!value['recalculation'])
        state = this.metaReducer.sf(state, 'data.monthClosingFlag', fromJS(value['monthClosingFlag']))
        return state
    }
    setCellDisabled = (state, list) => {
        let accountingStandards = this.metaReducer.gf(state, 'data.accountingStandards'),
            templateCode = this.metaReducer.gf(state, 'data.templateCode'),
            disabledList
        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {//小企业会计准则
            disabledList = SMALLACCOUNTINGSTANDARDS
        } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
            if(templateCode=='1'){
                disabledList = ACCOUNTINGSTANDARDSNEW
            }else{
                disabledList = ACCOUNTINGSTANDARDS
            }
        } else {
            disabledList = ACCOUNTINGSTANDARDS_NONPROFITORG
        }
        disabledList.map(item => {
            list[item.rowIndex]['assetsDisabled'] = item.assetsDisabled
            list[item.rowIndex]['liabilitiesDisabled'] = item.liabilitiesDisabled
        })
        return list
    }
}


export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })
    return { ...metaReducer, ...o }
}
