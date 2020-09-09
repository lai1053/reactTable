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
        if(!option.name){ // isTab true
            let activeKeyArr = []
            state = this.metaReducer.sfs(state,{
                "data.other.isTab": true,
                "data.other.allOption": fromJS(option),
                "data.form.activeKey": fromJS(option[0].code)
            })
            option.map(item => {
                activeKeyArr.push({
                    id: item.code,
                    name: item.name
                })
            })
            
            if(option[0].optionalDateRules) {
                state = this.metaReducer.sf(state, 'data.other.dateHabitArr', fromJS(option[0].optionalDateRules))
                if(option[0].mergeRule && option[0].dateRule){ // 选择过
                    if(option[0].mergeRule == '4000120002' || option[0].mergeRule == '4000120003' || option[0].mergeRule == '4000120004'){
                        state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[1]))
                    }else if(option[0].mergeRule == '4000120001'){
                        state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[0]))
                    }else if(option[0].mergeRule == '4000120005'){
                        state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[4]))
                    }else if(option[0].mergeRule == '4000120006'){
                        state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[3]))
                    }else if(option[0].mergeRule == '4000120007'){
                        state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[4]))
                    }else if(option[0].mergeRule == '4000120008'){
                        state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[6]))
                    }else if(option[0].mergeRule == '4000120010'|| option[0].mergeRule == '4000120009'){
                        state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[4]))
                    }else if(option[0].mergeRule == '4000120011'){
                        state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[0]))
                    }else if(option[0].mergeRule == '4000120012'){
                        state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[1]))
                    }else if(option[0].mergeRule == '4000120013'){
                        state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[2]))
                    }
                    if(option[0].mergeRule) {
                        option[0].optionalMergeRules.map(item=>{
                            if(item.id == option[0].mergeRule) {
                                item.summarys.map(items=>{
                                    items.label = items.name
                                    items.value = items.name
                                })
                                state = this.metaReducer.sf(state, 'data.other.summarys', fromJS(item.summarys))
                                state = this.metaReducer.sf(state, 'data.other.summarysreceive', fromJS(item.summarys))
                            }
                        })
                    }
                }else{  // 未选择过
                    state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option[0].optionalDateRules[0]))
                }
                if(option[0].dateRule) {
                    state = this.metaReducer.sf(state, 'data.form.dateHabitId', fromJS(option[0].dateRule))
                }else{
                    state = this.metaReducer.sf(state, 'data.form.dateHabitId', fromJS(option[0].optionalDateRules[0][0].id))
                }
            }
            if(option[0].optionalMergeRules) {
                option[0].optionalMergeRules.map(i=>{
                    i.label=i.name 
                    i.value=i.id 
                })
                state = this.metaReducer.sfs(state, {
                    'data.other.habit': fromJS(option[0].optionalMergeRules),
                    'data.other.ts0': fromJS(option[0].ts),
                    'data.other.id0': fromJS(option[0].id)
                })
                state = this.metaReducer.sfs(state, {
                    'data.other.ts1': fromJS(option[1].ts),
                    'data.other.id1': fromJS(option[1].id)
                })
                if(option[0].mergeRule) {
                    state = this.metaReducer.sf(state, 'data.form.habitId', fromJS(option[0].mergeRule))
                }else{
                    state = this.metaReducer.sf(state, 'data.form.habitId', fromJS(option[0].optionalMergeRules[0].id))
                }
            }

            if(option[1].mergeRule == '4000120001') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitpay', fromJS(option[1].optionalDateRules[0]))
            }
            if(option[1].mergeRule == '4000120002' || option[1].mergeRule == '4000120003' || option[1].mergeRule == '4000120004') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitpay', fromJS(option[1].optionalDateRules[1]))
            }
            if(option[1].mergeRule == '4000120005') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitpay', fromJS(option[1].optionalDateRules[4]))
            }
            if(option[1].mergeRule == '4000120006' || option[1].mergeRule == '4000120009' || option[1].mergeRule == '4000120010') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitpay', fromJS(option[1].optionalDateRules[3]))
            }
            if(option[1].mergeRule == '4000120007') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitpay', fromJS(option[1].optionalDateRules[4]))
            }
            if(option[1].mergeRule == '4000120008') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitpay', fromJS(option[1].optionalDateRules[6]))
            }

            if(option[0].mergeRule == '4000120001') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitreceive', fromJS(option[0].optionalDateRules[0]))
            }
            if(option[0].mergeRule == '4000120002' || option[0].mergeRule == '4000120003' || option[0].mergeRule == '4000120004') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitreceive', fromJS(option[0].optionalDateRules[1]))
            }
            if(option[0].mergeRule == '4000120005') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitreceive', fromJS(option[0].optionalDateRules[4]))
            }
            if(option[0].mergeRule == '4000120006' || option[0].mergeRule == '4000120009' || option[0].mergeRule == '4000120010') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitreceive', fromJS(option[0].optionalDateRules[3]))
            }
            if(option[0].mergeRule == '4000120007') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitreceive', fromJS(option[0].optionalDateRules[4]))
            }
            if(option[0].mergeRule == '4000120008') {
                state = this.metaReducer.sf(state, 'data.other.dateHabitreceive', fromJS(option[0].optionalDateRules[6]))
            }
            state = this.metaReducer.sf(state, 'data.form.settleMerge', fromJS(option[0].settleMerge))

            state = this.metaReducer.sf(state, 'data.other.habitreceive', fromJS(option[0].optionalMergeRules))
            state = this.metaReducer.sf(state, 'data.other.habitpay', fromJS(option[1].optionalMergeRules))

            state = this.metaReducer.sf(state, 'data.form.dateHabitIdreceive', fromJS(option[0].dateRule))
            state = this.metaReducer.sf(state, 'data.form.dateHabitIdpay', fromJS(option[1].dateRule))
            state = this.metaReducer.sf(state, 'data.form.habitIdreceive', fromJS(option[0].mergeRule))
            state = this.metaReducer.sf(state, 'data.form.habitIdpay', fromJS(option[1].mergeRule))

            state = this.metaReducer.sf(state, 'data.form.settleMergereceive', fromJS(option[0].settleMerge))
            state = this.metaReducer.sf(state, 'data.form.settleMergepay', fromJS(option[1].settleMerge))
            state = this.metaReducer.sf(state, "data.other.activeKey", fromJS(activeKeyArr))
        }else{ // isTab false
            state = this.metaReducer.sf(state, 'data.form.settleMerge', fromJS(option.settleMerge))
            state = this.metaReducer.sf(state, "data.other.isTab", false)
            state = this.metaReducer.sf(state, 'data.other.title', fromJS(option.name+'：'))
            state = this.metaReducer.sf(state, 'data.form.activeKey', fromJS(option.code))
            if(option.optionalMergeRules) {
                option.optionalMergeRules.map(item=>{
                    item.label=item.name 
                    item.value=item.id 
                })
                state = this.metaReducer.sfs(state, {
                    'data.other.habit': fromJS(option.optionalMergeRules),
                    'data.other.ts': fromJS(option.ts),
                    'data.other.id': fromJS(option.id),
                    'data.form.jtHabitId': option.jthb,
                    'data.form.ffHabitId': option.ffhb,
                    'data.form.isHeBing': option.jtffhb,
                    'data.form.oldjtHabitId': option.jthb,
                    'data.form.oldffHabitId': option.ffhb,
                    'data.form.oldisHeBing': option.jtffhb
                })
                if(option.mergeRule) {
                    state = this.metaReducer.sf(state, 'data.form.habitId', fromJS(option.mergeRule))
                }else{
                    state = this.metaReducer.sf(state, 'data.form.habitId', fromJS(option.optionalMergeRules[0].id))
                }
            }
            if(option.optionalDateRules) {
                state = this.metaReducer.sf(state, 'data.other.dateHabitArr', fromJS(option.optionalDateRules))
                if(option.mergeRule && option.dateRule){ // 选择过
                    if(option.code == 'expense') {
                        if(option.mergeRule == '4000120001'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[0]))
                        }else if(option.mergeRule == '4000120009'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[1]))
                        }else if(option.mergeRule == '4000120005'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[2]))                    
                        }else if(option.mergeRule == '4000120006'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[3]))
                        }
                    }else {
                        if(option.mergeRule == '4000120002' || option.mergeRule == '4000120003' || option.mergeRule == '4000120004'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[1]))
                        }else if(option.mergeRule == '4000120001'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[0]))
                        }else if(option.mergeRule == '4000120005'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[4]))
                        }else if(option.mergeRule == '4000120006'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[3]))                    
                        }else if(option.mergeRule == '4000120007'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[4]))
                        }else if(option.mergeRule == '4000120008'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[4]))
                        }else if(option.mergeRule == '4000120009'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[3]))
                        }else if(option.mergeRule == '4000120010'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[5]))
                        }else if(option.mergeRule == '4000120011'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[0]))
                        }else if(option.mergeRule == '4000120012'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[1]))
                        }else if(option.mergeRule == '4000120013'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[2]))
                        }else if(option.mergeRule == '4000120017' || option.mergeRule == '4000120021'){
                            state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[0]))
                        }
                    }
                   
                    if(option.mergeRule) {
                        option.optionalMergeRules.map(item=>{
                            if(item.id == option.mergeRule) {
                                item.summarys.map(items=>{
                                    items.label = items.name
                                    items.value = items.name
                                })
                                state = this.metaReducer.sf(state, 'data.other.summarys', fromJS(item.summarys))
                            }
                        })
                    }
                }else{  // 未选择过
                    state = this.metaReducer.sf(state, 'data.other.dateHabit', fromJS(option.optionalDateRules[0]))
                    option.optionalMergeRules.map(item=>{
                        if(item.id == '4000120001') {
                            item.summarys.map(items=>{
                                items.label = items.name
                                items.value = items.name
                            })
                            state = this.metaReducer.sf(state, 'data.other.summarys', fromJS(item.summarys))
                        }
                    })
                }
                if(option.dateRule) {
                    state = this.metaReducer.sf(state, 'data.form.dateHabitId', fromJS(option.dateRule))
                }else{
                    state = this.metaReducer.sf(state, 'data.form.dateHabitId', fromJS(option.optionalDateRules[0][0].id))
                }
            }
        }
        return state  
    }
    upDate = (state,option) => {
        return state = this.metaReducer.sf(state, option.path, fromJS(option.value))
    }
    upDates = (state,value) => {
        return state = this.metaReducer.sfs(state, {
            'data.other.dateHabit': fromJS(value[0]),
            'data.form.dateHabitId': fromJS(value[1])
        })
    }

    // tab页
    // radio change
    upDateArr = (state,option) => {
        state = this.metaReducer.sf(state, 'data.form.habitId', fromJS(option.value))
        state = this.metaReducer.sf(state, option.path, fromJS(option.value))
        return state
    }
    // radio 改变时，默认的下拉信息
    upDatesArr = (state,value,path,pathId) => {
        state = this.metaReducer.sfs(state, {
            'data.other.dateHabit': fromJS(value[0]),
            'data.form.dateHabitId': fromJS(value[1]),
        })
        state = this.metaReducer.sf(state, path, fromJS(value[0]))
        state = this.metaReducer.sf(state, pathId, fromJS(value[1]))
        return state
    }
    // select 选中项
    upDatesArrSelect = (state,option) =>{
        state = this.metaReducer.sf(state, option.path, fromJS(option.value))
        state = this.metaReducer.sf(state, option.pathActive, fromJS(option.value))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}