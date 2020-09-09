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
        if(option) {
            let obj = {
                'data.form.isChange': option.changeFlag,
                'data.form.methodId': option.mode ? option.mode : '2',
                'data.other.dateChangeFlag': option.dateChangeFlag
            }
            let production = this.metaReducer.gf(state, 'data.other.production').toJS()
            
            if(option.mode=='1' || option.mode=='2'){
                delete production[0].disabled
                production[1].disabled = 'disabled'
                delete production[2].disabled
            }else if(option.mode=='3'){
                production[0].disabled = 'disabled'
                delete production[1].disabled
                production[2].disabled = 'disabled'
                obj['data.form.valuationMethodId'] =  '2'
                obj['data.form.methodId'] = "2"
            }else if(option.mode=='4'){
                production[0].disabled = 'disabled'
                delete production[1].disabled
                production[2].disabled = 'disabled'
                obj['data.form.valuationMethodId'] =  '3'
                obj['data.form.methodId'] = "2"
            }

            obj['data.form.paramValue'] =  option.inventoryEnableDate

            if(option.productionAccounting==="0"){
                obj['data.form.productionId'] = "1"
                obj['data.form.costId'] = "1"
            }else if(option.productionAccounting=="1"){
                obj['data.form.productionId'] = "2"
                obj['data.form.costId'] = "1"
            }else if(option.productionAccounting=="2"){
                obj['data.form.productionId'] = "2"
                obj['data.form.costId'] = "2"
            }else if(option.productionAccounting=="3"){
                obj['data.form.productionId'] = "3"
                obj['data.form.costId'] = "1"
            }else if(option.productionAccounting==""){
                obj['data.form.productionId'] = ""
                obj['data.form.costId'] = "1"
            }
            obj['data.other.production'] = fromJS(production)

            if(option.accountRatio){
                obj['data.form.inputNumber'] =  option.accountRatio
                obj['data.other.accountRatio'] = option.accountRatio
            }
            if (option.periodBeginDate) {
                obj['data.other.enableTime'] =  option.periodBeginDate
            }
            if (option.closingCalendar) {
                obj['data.other.enableTime'] =  option.closingCalendar
            }

            if(option.recoilMode==="0"){
                obj['data.form.recoilModeId'] = "0"
            }else if(option.recoilMode=="1"){
                obj['data.form.recoilModeId'] = "1"
            }

            state = this.metaReducer.sfs(state, obj) 

            // state = this.metaReducer.sfs(state, {
            //     'data.form.isChange': option.changeFlag,
            //     'data.form.methodId': option.mode ? option.mode : '2',
            //     'data.form.oldMethodId': option.mode ? option.mode : '2',
            //     'data.form.oldProductionAccounting': option.productionAccounting ? option.productionAccounting : '0',
            //     'data.form.productionId': productionId,
            //     'data.form.costId': costId,
            // }) 
        } 
            
        return state  
    }
    update = (state,path,value) => {
        state = this.metaReducer.sf(state, path, fromJS(value))  
        return state  
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}