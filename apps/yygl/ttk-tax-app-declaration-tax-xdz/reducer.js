import { fromJS } from 'immutable'
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

    init = (state, year ) => {
        const initState = getInitState()  
        initState.data.other.year = year 
        initState.data.other.defaultYear = moment().format('YYYY') 
        return this.metaReducer.init(state, initState)
    }

    load = (state, res ) => {
        let data = this.metaReducer.gf(state, 'data').toJS()
        res = res.map( item => {
            item.zzsse = this.getNumStr( item.zzsse )
            item.fjsse = this.getNumStr( item.fjsse )
            item.yhsse = this.getNumStr( item.yhsse )
            item.whsyjefse = this.getNumStr( item.whsyjefse )
            item.grsdsse = this.getNumStr( item.grsdsse )
            item.qysdsse = this.getNumStr( item.qysdsse )
            item.zese = this.getNumStr( item.zese )
            return item 
        })
        data.list = res
        if( !data.other.year ) data.other.year = res&&res.length?res[0].year: undefined
        if( !data.other.defaultYear ) data.other.defaultYear = res&&res.length&&res[0].year?res[0].year: moment().format('YYYY')
        
        state = this.metaReducer.sf(state, 'data', fromJS(data))
        return state
    }  

    getNumStr = ( num ) => {
        if(num===undefined || num === "") return undefined
        return number.format( num , 2 )
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}