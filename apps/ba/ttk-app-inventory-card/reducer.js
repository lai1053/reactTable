import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { consts } from 'edf-consts'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, option) => {
        state = this.metaReducer.sfs(state, {
            'data.other.property': fromJS(option.propertyList),
            'data.other.unitList': fromJS(option.unitList)
        })
        if (option && option.initData) {
            let initData = option.initData,
                alias = '',
                aliasArr = [],
                newAlias = [{ sequenceNo: 1, name: null }]
            if (initData.archiveAliasList && initData.archiveAliasList.length) {
                initData.archiveAliasList.map(item => {
                    if (item.name) aliasArr.push(item.name)
                })
                alias = aliasArr.join(',')
            }

            state = this.metaReducer.sfs(state, {
                'data.form.code': fromJS(initData.code),
                'data.form.name': fromJS(initData.name),
                'data.form.propertyId': fromJS(initData.propertyId),
                'data.form.specification': fromJS(initData.specification),
                'data.form.unit': fromJS({ id: initData.unitId }),
                'data.form.account': fromJS({ id: initData.inventoryRelatedAccountId }),
                'data.form.alias': fromJS(alias),
                'data.otherName': fromJS(initData.archiveAliasList || newAlias),
                'data.newAlias': fromJS(initData.archiveAliasList || newAlias)
            })
        }
        return state
    }

    glAccounts = (state, value) => {
        // let newArr = []
        // value.forEach((item, index)=>{
        // 	if(item.isEnable) newArr.push(item)
        // })
        return state = this.metaReducer.sf(state, 'data.glAccounts', fromJS(value))
    }

    isUsed = (state, value) => {
        return state = this.metaReducer.sf(state, 'data.other.isUsed', value)
    }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}