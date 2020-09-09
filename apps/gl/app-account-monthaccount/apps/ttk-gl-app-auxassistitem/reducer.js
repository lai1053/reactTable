import { fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { FormDecorator } from 'edf-component'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }

    load = (state, option, allArchiveDS) => {
        if (!!option.isCalcCustomer) {
            state = this.metaReducer.sf(state, 'data.other.customer', fromJS(allArchiveDS['客户']))
            if (option.auxId) {
                const name = allArchiveDS['客户'].filter(element => element.id = option.auxId)[0].name
                state = this.metaReducer.sf(state, 'data.form.auxAccountSubjects.customer', fromJS({ id: option.auxId, name }))
            }

        }
        if (!!option.isCalcSupplier) {
            state = this.metaReducer.sf(state, 'data.other.supplier', fromJS(allArchiveDS['供应商']))
            if (option.auxId) {
                const name = allArchiveDS['供应商'].filter(element => element.id = option.auxId)[0].name
                state = this.metaReducer.sf(state, 'data.form.auxAccountSubjects.supplier', fromJS({ id: option.auxId, name }))
            }
        }
        if (!!option.isCalcProject) {
            state = this.metaReducer.sf(state, 'data.other.project', fromJS(allArchiveDS['项目']))
            if (option.auxId) {
                const name = allArchiveDS['项目'].filter(element => element.id = option.auxId)[0].name
                state = this.metaReducer.sf(state, 'data.form.auxAccountSubjects.project', fromJS({ id: option.auxId, name }))
            }
        }
        if (!!option.isCalcDepartment) {
            state = this.metaReducer.sf(state, 'data.other.department', fromJS(allArchiveDS['部门']))
            if (option.auxId) {
                const name = allArchiveDS['部门'].filter(element => element.id = option.auxId)[0].name
                state = this.metaReducer.sf(state, 'data.form.auxAccountSubjects.department', fromJS({ id: option.auxId, name }))
            }
        }
        if (!!option.isCalcPerson) {
            state = this.metaReducer.sf(state, 'data.other.person', fromJS(allArchiveDS['人员']))
            if (option.auxId) {
                const name = allArchiveDS['人员'].filter(element => element.id = option.auxId)[0].name
                state = this.metaReducer.sf(state, 'data.form.auxAccountSubjects.person', fromJS({ id: option.auxId, name }))
            }
        }
        if (!!option.isCalcInventory) {
            state = this.metaReducer.sf(state, 'data.other.inventory', fromJS(allArchiveDS['存货']))
            if (option.auxId) {
                const name = allArchiveDS['存货'].filter(element => element.id = option.auxId)[0].name
                state = this.metaReducer.sf(state, 'data.form.auxAccountSubjects.inventory', fromJS({ id: option.auxId, name }))
            }
        }
        for (var i = 1; i <= 10; i++) {
            if (!!option[`isExCalc${i}`]) {                
                state = this.metaReducer.sf(state, `data.other.exCalc${i}`, fromJS(this.getUserdefineDS(allArchiveDS, `isExCalc${i}`)))
                if (option.auxId) {
                    const dsArray = this.getUserdefineDS(allArchiveDS, `isExCalc${i}`)
                    let auxData
                    if (dsArray && dsArray.length > 0) {
                        auxData = dsArray.filter(element => element.id == option.auxId)[0]                        
                        state = this.metaReducer.sf(state, `data.form.auxAccountSubjects.exCalc${i}`, fromJS({ id: option.auxId, name: auxData.name}))
                    }
                    
                }
            }
        }
        return state
    }

    getUserdefineDS = (allArchiveDS, archiveName) => {
        let dsArray = allArchiveDS['自定义档案'],
            userDefineDS = []        
        for (var i = 0; i < dsArray.length; i++) {
            if (dsArray[i].calcName == archiveName) {
                userDefineDS = dsArray[i].userDefineArchiveDataList
            }
        }
        return userDefineDS
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, voucherReducer })
    return { ...metaReducer, ...o }
}
