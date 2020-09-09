import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { deepClone, formatSixDecimal, transToNum } from '../commonAssets/js/common'
import moment from 'moment'
import utils from 'edf-utils'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        let listData = deepClone(option) 
        const restLen = (listData.length < 7 ) ? (7-listData.length) : 0
        
        let numSum = 0, ybbalanceSum = 0
        numSum = option.reduce((total, item)=>{
            total = transToNum( (total + parseFloat(item.num)).toFixed(6) ) 
            ybbalanceSum = transToNum( (ybbalanceSum + parseFloat(item.ybbalance)).toFixed(2) ) 
            return total
        }, 0)

        const listAll = {
            'numSum': formatSixDecimal(numSum),
            'ybbalanceSum': utils.number.format(ybbalanceSum, 2)
        }
        if(restLen){    
            const others = new Array(restLen).fill({})
            listData = listData.concat(others)
        }
        initState.data.list= listData;
        initState.data.form.operater = sessionStorage['username']
        initState.data.listAll = listAll
        return this.metaReducer.init(state, initState)
    }

    load = (state, response) => {
        let listData = deepClone(response) 
        const restLen = (listData.length < 7 ) ? (7-listData.length) : 0
        if(restLen){    
            const others = new Array(restLen).fill({})
            listData = listData.concat(others)
        }
        state = this.metaReducer.sf(state, 'data.list', fromJS(listData))
        return this.metaReducer.sf(state, 'data.other.focusCellInfo', undefined)
    }
    updateSfs = (state, options) => {
        return this.metaReducer.sfs(state, options)
    }
    // addEmptyRow = (state, rowIndex) => {
    //     var list = this.metaReducer.gf(state, 'data.list')
    //     list = list.insert(rowIndex,Map({
    //         id: list.size
    //     }))
    //     return this.metaReducer.sf(state, 'data.list', list)
    // }

    delrow = (state, id) => {
        var list = this.metaReducer.gf(state, 'data.list')
        const index = list.findIndex(o => {
           return  o.get('id') == id
        })
        
        if (index == -1)
            return state

        list = list.remove(index)
        return this.metaReducer.sf(state, 'data.list', list)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}