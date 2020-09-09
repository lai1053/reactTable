import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import moment from 'moment'
import { formatNumbe } from './../common'
import { formatSixDecimal,deepClone, transToNum } from '../commonAssets/js/common'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, titleName,flag) => {
        const initState = getInitState()
        initState.data.title.titleName=titleName
        initState.data.flag=flag
        return this.metaReducer.init(state, initState)
    }

    load = (state, response, serviceTypeCode) => {
        if(!response) {return state}
        let list=JSON.parse(response.billBodys)   
        let billBodyNum=0
        let billBodyYbBalance=0  
        let taxRateAll=0
        let taxAll=0
        let billBodyChNum = 0
        if(list){
            list.forEach(item=>{
                // billBodyNum=formatNumbe((formatNumbe(billBodyNum)+formatNumbe(item.num)),2)
                billBodyNum= transToNum( ( transToNum(billBodyNum) + transToNum(item.num) ).toFixed(6) )
                billBodyYbBalance= formatNumbe((formatNumbe(billBodyYbBalance)+formatNumbe(item.ybbalance)),2)
                taxRateAll = formatNumbe((formatNumbe(taxRateAll)+formatNumbe(item.ybbalance)+formatNumbe(item.tax)),2)
                taxAll = formatNumbe((formatNumbe(taxAll)+formatNumbe(item.tax)),2)
                billBodyChNum= formatNumbe(  (billBodyChNum + formatNumbe(item.chNum)).toFixed(6) )
            })
        }

        let listData = deepClone(list)
        const restLen = (listData.length < 7 ) ? (7-listData.length) : 0
        if(restLen){    
            const others = new Array(restLen).fill({})
            listData = listData.concat(others)
        }

        response.billBodys = ''

        state = this.metaReducer.sfs(state, {
            'data.list': fromJS(listData),
            'data.listAll.billBodyNum': formatSixDecimal(billBodyNum),
            'data.listAll.billBodyYbBalance': formatNumbe(billBodyYbBalance,2),
            'data.listAll.billBodyChNum': formatSixDecimal(billBodyChNum),
            'data.listAll.taxRateAll': formatNumbe(taxRateAll,2),
            'data.listAll.taxAll': formatNumbe(taxAll,2),
            'data.form': response,
            'data.serviceTypeCode': serviceTypeCode,
            'data.loading': false
        })
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}