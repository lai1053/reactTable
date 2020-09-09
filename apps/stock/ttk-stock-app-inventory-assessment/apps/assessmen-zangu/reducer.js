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

    load = (state, response, propertyDetailFilter) => {
        let num=0, ybbalance=0
        if(response&&response.length>0){
            response.forEach(item => {
                item.numberChange= formatprice(item.num)
                item.priceChange= formatprice(item.price)
                item.moneryChange= formatprice(item.ybbalance)
                num = formatNumbe(num)+formatNumbe(item.numberChange)
                ybbalance=formatNumbe(ybbalance)+formatNumbe(item.moneryChange)
            })
        }
        state = this.metaReducer.sfs(state, {
            'data.form.propertyDetailFilter': fromJS(propertyDetailFilter),
            'data.listAll.billBodyNum': formatSixDecimal(num),
            'data.listAll.billBodyYbBalance': formatprice(ybbalance,2),
            'data.list': fromJS(response ? response : []),
            'data.other.focusCellInfo': undefined
        })
        return state 
    }

    reload = (state, response) => {
        let totalNum = formatSixDecimal(0), totalYbbalance = formatNumbe(0,2), list = []
        if(response&&response.length>0){
            let list = response
            totalNum = formatSixDecimal(list.num)
            totalYbbalance = formatNumbe(list.ybbalance,2)
        }
        state = this.metaReducer.sfs(state, {
            'data.listAll.billBodyNum': totalNum,
            'data.listAll.billBodyYbBalance': totalYbbalance,
            'data.list': fromJS(list),
            'data.other.focusCellInfo': undefined
        })
        return state 
    }

    updateSfs = (state, options) => this.metaReducer.sfs(state, options)
    
    handleNumberChange = (state, options) => this.metaReducer.sfs(state, options)
    
    update = (state, path, value, index) => {
        let list = this.metaReducer.gf(state, 'data.list').toJS()
        let num = 0, ybbalance = 0
        list.forEach((item, i) => {
            if (i==index) {
                num=formatNumbe(num)+formatNumbe(value.numberChange)
                ybbalance=formatNumbe(ybbalance)+formatNumbe(value.moneryChange)
            } else {
                num=formatNumbe(num)+formatNumbe(item.numberChange)
                ybbalance=formatNumbe(ybbalance)+formatNumbe(item.moneryChange)
            } 
        })
        state = this.metaReducer.sfs(state, {
            'data.listAll.billBodyNum': formatSixDecimal(num),
            'data.listAll.billBodyYbBalance': formatprice(ybbalance,2),
            [path]: fromJS(value)
        })
        return state
    }
    addEmptyRow = (state, rowIndex) => {
        var list = this.metaReducer.gf(state, 'data.list')
        list = list.insert(rowIndex, Map({
            id: list.size
        }))
        return this.metaReducer.sf(state, 'data.list', list)
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