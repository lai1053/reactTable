import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { blankDetail } from './data'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    
    load = (state, propertyList, glAccounts) => {
        let newAccount = []
        if(propertyList){
            glAccounts.forEach(item=> {
                if(item.codeGrade1 == '1403' || item.codeGrade1 == '1405' || item.codeGrade1 == '1411' || item.codeGrade1 == '1408'){
                    newAccount.push(item)
                }
            })
            if(newAccount.length){
                propertyList.forEach((item, index)=> {
                    if(item.accountId){
                        const items = newAccount.filter(o=> o.id == item.accountId)[0]
                        if(items) propertyList[index].accountName = items.codeAndName
                    }
                })
                state = this.metaReducer.sfs(state,{
                    'data.form.details':  fromJS(propertyList),
                    'data.glAccounts':  fromJS(newAccount),
                    'data.other.loading':  false
                })
            }
        }
        return state
    }

    // glAccounts = (state, value) => {
	// 	return state = this.metaReducer.sf(state, 'data.glAccounts', fromJS(value))
	// }

    addRowBefore = (state, gridName, rowIndex) => {
        return state
    }
    addBottomRow = (state, gridName, rowIndex) => {
        let deatils = this.metaReducer.gf(state, 'data.form.details').toJS()
        deatils.splice(rowIndex+1, 0, blankDetail[0])
        state = this.metaReducer.sf(state, 'data.form.details', fromJS(deatils))
        return state
    }

    delRowBefore = (state, gridName, rowIndex) => {
        return state
    }
    delRow = (state, gridName, rowIndex) => {
        let details = this.metaReducer.gf(state, 'data.form.details').toJS()
        let delArr = this.metaReducer.gf(state, 'data.form.delArr').toJS()

        let item = details[rowIndex]
        if(item && item.id){
            item.recordStatus = 3
            delArr.push(item)
            state = this.metaReducer.sf(state, 'data.form.delArr', fromJS(delArr))
        }

        if (rowIndex > 0) {
            details.splice(rowIndex, 1)
        } else {
            if (details.length > 1) {
                details.splice(rowIndex, 1)
            } 
        }
        state = this.metaReducer.sf(state, 'data.form.details', fromJS(details))
        return state
    }

    update = (state, path, value ) => {
        state = this.metaReducer.sf(state, path, fromJS(value))  
        return state  
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}