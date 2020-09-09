import { Map, fromJS } from 'immutable'
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

  	load = (state, option, allArchiveDS, editStatus, isontabfocus) => {
        let auxAccountSubjectsPreSelected = option.auxAccountSubjectsPreSelected

        // 新增状态下，保持已选择辅助项
        if (option.auxAccountSubjectsPreSelected == undefined &&
            (localStorage.getItem('auxAccountSubjects') &&
             JSON.parse(localStorage.getItem('auxAccountSubjects')) != {})) {

            auxAccountSubjectsPreSelected = JSON.parse(localStorage.getItem('auxAccountSubjects'))
        }

        let auxItems = []

        if (!!option.isCalcCustomer) {
            auxItems.push('客户')
            state = this.metaReducer.sf(state, 'data.other.customer', fromJS(allArchiveDS['客户']))
        }
        if (!!option.isCalcSupplier) {
            auxItems.push('供应商')
            state = this.metaReducer.sf(state, 'data.other.supplier', fromJS(allArchiveDS['供应商']))
        }
        if (!!option.isCalcProject) {
            auxItems.push('项目')
            state = this.metaReducer.sf(state, 'data.other.project', fromJS(allArchiveDS['项目']))
        }
        if (!!option.isCalcDepartment) {
            auxItems.push('部门')
            state = this.metaReducer.sf(state, 'data.other.department', fromJS(allArchiveDS['部门']))
        }
        if (!!option.isCalcPerson) {
            auxItems.push('人员')
            state = this.metaReducer.sf(state, 'data.other.person', fromJS(allArchiveDS['人员']))
        }
        if (!!option.isCalcInventory) {
            auxItems.push('存货')
            state = this.metaReducer.sf(state, 'data.other.inventory', fromJS(allArchiveDS['存货']))
        }

        for (var i = 1; i <= 10; i++) {
            if (!!option[`isExCalc${i}`]) {
                auxItems.push(option.calcDict[`isExCalc${i}`])
                state = this.metaReducer.sf(state, `data.other.exCalc${i}`, fromJS(this.getUserdefineDS(allArchiveDS, `isExCalc${i}`)))
            }
        }

        state = this.metaReducer.sf(state, 'data.other.auxItems', fromJS(auxItems))

        if(auxAccountSubjectsPreSelected){
          state = this.metaReducer.sf(state, 'data.form.auxAccountSubjects', fromJS(auxAccountSubjectsPreSelected))
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

    setUserDefineItem = (state, address, value) => {
      state = this.metaReducer.sf(state, address, fromJS(value))
      return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, voucherReducer })

    return { ...metaReducer, ...o }
}
