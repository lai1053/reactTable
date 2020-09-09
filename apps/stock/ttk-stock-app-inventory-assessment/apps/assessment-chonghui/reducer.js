import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { formatNumbe,formatprice } from '../../../common'
import{ formatSixDecimal } from '../../../commonAssets/js/common'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, response) => {
        state = this.metaReducer.sfs(state, {
            'data.list': fromJS(response) ,
            'data.other.focusCellInfo': undefined
        })
        return state
    }
    update = (state, data)=> this.metaReducer.sf(state, 'data.list', fromJS(data))
       
    addEmptyRow = (state, rowIndex) => {
        var list = this.metaReducer.gf(state, 'data.list')
        list = list.insert(rowIndex,Map({
            id: list.size
        }))

        return this.metaReducer.sf(state, 'data.list', list)
    }

    updateSfs = (state, options) => this.metaReducer.sfs(state, options)
    
    updateList = (state, data)=> {
        let num=0,monery=0
        data.forEach(item=>{
            num=formatNumbe(num)+formatNumbe(item.number)
            monery=formatNumbe(monery)+formatNumbe(item.monery)
        })
        state = this.metaReducer.sfs(state, {
            'data.list': fromJS(data),
            'data.listAll.num': formatSixDecimal(num),
            'data.listAll.ybbalance': formatNumbe(monery,2)
        })
        return state
    }
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