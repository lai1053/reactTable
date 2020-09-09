import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState, blankDetail } from './data'
// import moment from 'moment'
import{deepClone } from '../commonAssets/js/common'
const LISTLENGTH = 7

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        initState.data.form.operater=sessionStorage['username']
        return this.metaReducer.init(state, initState)
    }

    load = (state, listArr, data) => {
        let listData = deepClone(listArr)
        const restLen = (listData.length < LISTLENGTH ) ? ( LISTLENGTH -listData.length) : 0
        if(restLen){    
            const others = new Array(restLen).fill({})
            listData = listData.concat(others)
        }
        let obj = {
            'data.list': fromJS(listData),
            'data.cacheData': fromJS(listData)
        }
        if (data) {
            data.billBodys = ''
            state = this.metaReducer.sf(state, 'data.form', fromJS(data))
            obj = Object.assign({}, obj, {'data.form': fromJS(data)})
        }
        state = this.metaReducer.sfs(state, obj)
        return state
    }
    reload = (state, ret, list, id) => {
        let respList = ret // 公共
        list.forEach(item => {
            let flag = false
            ret.forEach(item1 => {
                if (item.inventoryId == item1.inventoryId || !item.inventoryId) {
                    flag = true
                }
            })
            if (!flag) {
                respList.push(item)
            }
        })
        if (!id) {
            while (respList.length < LISTLENGTH) {
                respList.push(blankDetail)
            }
        }
        state = this.metaReducer.sf(state, 'data.list', fromJS(respList))
        return state
    }

    updateSfs = (state, options) => this.metaReducer.sfs(state, options)
    
    addEmptyRow = (state, rowIndex) => {
        var list = this.metaReducer.gf(state, 'data.list')
        list = list.insert(rowIndex,Map({
            id: list.size,
            isAddManually: true
        }))
        return this.metaReducer.sf(state, 'data.list', list)
    }

    // delrow = (state, id) => {
    //     var list = this.metaReducer.gf(state, 'data.list')
    //     const index = list.findIndex(o => {
    //        return  o.get('id') == id
    //     })
        
    //     if (index == -1)
    //         return state

    //     list = list.remove(index)
    //     return this.metaReducer.sf(state, 'data.list', list)
    // }

    delrow = (state, id, Id) => {
        var list = this.metaReducer.gf(state, 'data.list').toJS() || []
        // list.splice(id, 1)
        // if (list && !Id) {
			// while (list.length < LISTLENGTH) {
			// 	list.push(blankDetail)
			// }
        // }
        
        if(list.length<=LISTLENGTH){
            list.splice(id, 1, blankDetail)
        }else{
            list.splice(id, 1)
        }

        while (list.length < LISTLENGTH) {
            list.push(blankDetail)
        }
        return this.metaReducer.sf(state, 'data.list', fromJS(list))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}