import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import moment from 'moment'
import { formatNumbe } from './../common'
import { formatSixDecimal, deepClone } from '../commonAssets/js/common'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        initState.data.form.operater = sessionStorage['username'];
        return this.metaReducer.init(state, initState)
    }

    load = (state, list, form, code) => {
        let listData = deepClone(list) || []
        const restLen = (listData.length < 7 ) ? (7-listData.length) : 0
        if(restLen){    
            const blankList = new Array(restLen).fill({})
            listData = listData.concat(blankList)
        }
        let num=0, money=0
        listData.forEach(item=>{
            num=formatNumbe(num)+formatNumbe(item.num)
            money=formatNumbe(money)+formatNumbe(item.ybbalance)
        })

        const formData = form ? {...form} : {}
        if(!code){
            formData.code='';
            formData.cdate='';
        }
        formData.operater = sessionStorage['username'];
        state = this.metaReducer.sfs(state, {
            'data.loading': false,
            'data.form': fromJS(formData),
            'data.list': fromJS(listData),
            'data.listAll.billBodyNum': formatSixDecimal(num),
            'data.listAll.billBodyYbBalance': formatNumbe(money, 2),
        })
        return state
    }

    updateSfs = (state, options) => {
        return this.metaReducer.sfs(state, options)
    }

    addEmptyRow = (state, rowIndex) => {
        var list = this.metaReducer.gf(state, 'data.list')
        list = list.insert(rowIndex,Map({
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