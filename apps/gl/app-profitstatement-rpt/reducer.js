import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { consts } from 'edf-consts'

const SMALLACCOUNTINGSTANDARDS = [
    {
        rowIndex: 20,
        projectDisabled: true
    },
    {
        rowIndex: 29,
        projectDisabled: true,
    },
    {
        rowIndex: 31,
        projectDisabled: true,
    }
]

const ACCOUNTINGSTANDARDS = [
    {
        rowIndex: 10,
        projectDisabled: false,
    },
    // {
    //     rowIndex: 11,
    //     projectDisabled: true,
    // },
    {
        rowIndex: 12,
        projectDisabled: true,
    },
    {
        rowIndex: 15,
        projectDisabled: true,
    },{
        rowIndex: 17,
        projectDisabled: true
    },
    {
        rowIndex: 18,
        projectDisabled: true,
    },
    {
        rowIndex: 19,
        projectDisabled: false,
    },
    {
        rowIndex: 20,
        projectDisabled: true,
    },
    {
        rowIndex: 21,
        projectDisabled: true,
    },
    {
        rowIndex: 24,
        projectDisabled: true,
    },
    {
        rowIndex: 22,
        projectDisabled: false,
    },
    {
        rowIndex: 30,
        projectDisabled: true,
    },
    {
        rowIndex: 31,
        projectDisabled: true,
    }
]
const ACCOUNTINGSTANDARDSNEW = [
    {
        rowIndex: 15,
        projectDisabled: true,
    },
    // {
    //     rowIndex: 11,
    //     projectDisabled: true,
    // },
    {
        rowIndex: 18,
        projectDisabled: true,
    },
    {
        rowIndex: 20,
        projectDisabled: true,
    },{
        rowIndex: 21,
        projectDisabled: true
    },
    {
        rowIndex: 23,
        projectDisabled: true,
    },
    {
        rowIndex: 24,
        projectDisabled: true,
    },
    {
        rowIndex: 27,
        projectDisabled: true,
    },
    {
        rowIndex: 33,
        projectDisabled: true,
    },
    {
        rowIndex: 34,
        projectDisabled: true,
    },
]

const ACCOUNTINGSTANDARDS_NONPROFITORGANIZATION = [
    {
        rowIndex: 0,
        projectDisabled: true,
    },
    {
        rowIndex: 8,
        projectDisabled: true,
    },
    {
        rowIndex: 9,
        projectDisabled: true,
    },{
        rowIndex: 11,
        projectDisabled: true
    },
    {
        rowIndex: 12,
        projectDisabled: true,
    },
    {
        rowIndex: 13,
        projectDisabled: true,
    },
    {
        rowIndex: 14,
        projectDisabled: true,
    },
    {
        rowIndex: 18,
        projectDisabled: true,
    },
    {
        rowIndex: 19,
        projectDisabled: true,
    },
    {
        rowIndex: 20,
        projectDisabled: true,
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

	load = (state, value,title) => {
        state = this.metaReducer.sf(state, 'data.accountingStandards', fromJS(value['reportTemplateDto']['accountingStandardsId']))
        state = this.metaReducer.sf(state, 'data.templateCode', fromJS( value['templateCode'] ))
        state = this.metaReducer.sf(state, 'data.statement', fromJS( this.setCellDisabled( state, value['reportTemplateDto']['rows'],value.templateCode) ))
        state = this.metaReducer.sf(state, 'data.selectTimeData', fromJS(value['periods']))
        state = this.metaReducer.sf(state, 'data.selectTimeDataPre', fromJS(value['periods'].slice(0,5)))
        const selectData = this.metaReducer.gf(state, 'data.selectData')    
        if ((selectData == undefined && title) || (selectData&&title)){
            state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(title['period']['name']))
        }else{
            state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(value['selectedPeriod']['name']))
        }
    	return state
	}
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }
	select = (state, value, selectData) => {

        state = this.metaReducer.sf(state, 'data.selectData', fromJS(selectData))
        state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(selectData['name']))
        state = this.metaReducer.sf(state, 'data.templateCode', fromJS( value['templateCode'] ))
        state = this.metaReducer.sf(state, 'data.statement', fromJS( this.setCellDisabled( state,value['rows'],value.templateCode) ))
        state = this.metaReducer.sf(state, 'data.recalculation', !!value['recalculation'])
        state = this.metaReducer.sf(state, 'data.monthClosingFlag', fromJS(value['monthClosingFlag']))
        return state
    }

    setCellDisabled = (state,list,templateCode) => {
        let accountingStandards = this.metaReducer.gf(state, 'data.accountingStandards'),
            disabledList
        if(accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {//小企业会计准则
            disabledList = SMALLACCOUNTINGSTANDARDS
        } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
            if(templateCode=='1'){
                disabledList = ACCOUNTINGSTANDARDSNEW
            }else{
                disabledList = ACCOUNTINGSTANDARDS
            }
        } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
            disabledList = ACCOUNTINGSTANDARDS_NONPROFITORGANIZATION
        }
        disabledList.map(item => {
            list[item.rowIndex]['projectDisabled'] = item.projectDisabled
        })
        return list
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })
    return { ...metaReducer, ...o }
}
