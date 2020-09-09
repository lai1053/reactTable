import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, option) => {
        if(option && option.response) state = this.metaReducer.sf(state, 'data.other.subject', fromJS(option.response.subject))  
        if(option && option.response || option.autoAccountRes){
            
            let newSubject = [], subjectList
            if(option.assetCardId && option.autoAccountRes && option.isAutoAccount){
                // 资产科目
                if(option.treeSelectedKey == '4000080001'){
                    subjectList = option.autoAccountRes.initEnum.chargeList
                }else if(option.treeSelectedKey == '4000080002'){
                    subjectList = option.autoAccountRes.initEnum.depreciationList
                }else{
                    subjectList = option.autoAccountRes.initEnum.assetClassList
                }
                state = this.metaReducer.sfs(state, {
                    'data.other.filter': fromJS(option.autoAccountRes.asset),
                    'data.other.isAutoAccount': fromJS(option.isAutoAccount),
                    'data.other.treeSelectedKey': fromJS(option.treeSelectedKey),
                    'data.other.assetCardId': fromJS(option.assetCardId),
                    'data.other.assetId': fromJS(option.assetId)
                })
            }else{
                subjectList = option.response.glAccounts
            }
            let haveId = false
            
            subjectList.map(item=>{
                if(item.isEndNode && item.isEnable){
                    if(item.id == option.glAccountId) haveId = true
                    newSubject.push({
                        value: item.id,
                        label: item.codeAndName,
                        code: item.code
                    })
                }
            })
            state = this.metaReducer.sfs(state, {
                'data.other.subjectList': fromJS(newSubject),
                'data.form.glAccountId': haveId ? option.glAccountId : undefined,
                'data.form.glAccountIdOld': haveId ? option.glAccountId : undefined
            })  
        }  
        if(option && option.influenceList) state = this.metaReducer.sf(state, 'data.other.influenceList', fromJS(option.influenceList))  
        
        // 批量
        if(option && option.isBatch) state = this.metaReducer.sf(state, 'data.other.isBatch', option.isBatch)
        return state  
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}