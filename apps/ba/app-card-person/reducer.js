import {Map, List, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import moment from 'moment'
import {getInitState} from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        return this.metaReducer.init(state, getInitState(option))
    }

    load = (state, payload, roleResponse) => {
        if (payload.person) {
            if (payload.person.mobile === null) {
                payload.person.mobile = ''
            }
            state = this.metaReducer.sf(state, 'data.form', fromJS(payload.person))
	        if(payload.person.roleDtoList.length < 1){state = this.metaReducer.sf(state, 'data.roleStatus', false)}
            if(payload.person.roleDtoList && payload.person.roleDtoList.length > 0){
                let arr = [], arrChecked = [];
                payload.person.roleDtoList.forEach((data) => {arr.push({roleId:data.roleId});arrChecked.push(data.roleId)});
                state = this.metaReducer.sf(state, 'data.form.roleDtoList', fromJS(arr))
                state = this.metaReducer.sf(state, 'data.form.roleDtoListCheck', fromJS(arrChecked))
            }
            if (payload.person.departmentId) {
                let departmentName;
                payload.queryData.departmentList.forEach(dep => { if (dep.id == payload.person.departmentId) { departmentName = dep.name; return }})

                state = this.metaReducer.sf(state, 'data.form.department', fromJS({
                    id: payload.person.departmentId,
                    name: departmentName
                }))
            }
        }

        if (payload.parentPerson) {
            state = this.metaReducer.sf(state, 'data.form.department', fromJS(payload.parentPerson))
        }

	    if (payload.glAccounts) {
		    state = this.metaReducer.sf(state, 'data.other.glAccounts', fromJS(payload.glAccounts))
	    }

        if (payload.queryData) {
            let queryData = payload.queryData
            if (queryData.departmentList) {
                state = this.metaReducer.sf(state, 'data.other.departmentList', fromJS(queryData.departmentList))
            }
            if (queryData.employeeList && queryData.employeeList.length) {
                let employeeList = queryData.employeeList.map(o => ({label: o.name, value: o.id}))
                if (!payload.person) {
                    state = this.metaReducer.sf(state, 'data.form.employee', fromJS(employeeList[0] && employeeList[0].value))
                }
                state = this.metaReducer.sf(state, 'data.other.employeeList', fromJS(employeeList))
            }
            if (queryData.maritalstatuxList && queryData.maritalstatuxList.length) {
                let maritalstatuxList = queryData.maritalstatuxList.map(o => ({label: o.name, value: o.id}))
                if (!payload.person) {
                    state = this.metaReducer.sf(state, 'data.form.maritalStatus', fromJS(maritalstatuxList[2] && maritalstatuxList[2].value))
                }
                state = this.metaReducer.sf(state, 'data.other.maritalstatuxList', fromJS(maritalstatuxList))
            }

            if (queryData.sexList && queryData.sexList.length) {
                let sexList = queryData.sexList.map(o => ({label: o.name, value: o.id}))
                if (!payload.person) {
                    state = this.metaReducer.sf(state, 'data.form.gender', fromJS(sexList[2] && sexList[2].value))
                }
                state = this.metaReducer.sf(state, 'data.other.sexList', fromJS(sexList))

            }
        }
        if (roleResponse) {
            if(payload.person && payload.person.roleDtoList && payload.person.roleDtoList.length > 0){
                let roleListCheck = this.metaReducer.gf(state, 'data.form.roleDtoListCheck').toJS()
                let roleStatus = false
                roleListCheck.forEach((data) => {
                    if(data == '10'){
                        roleStatus = true
                    }
                })
                roleResponse.forEach((data) => {
                    if(roleStatus){
                        if(data.code != '001'){
                            data.disabled = true
                        }
                    }else {
                        if(data.code == '001'){
                            data.disabled = true
                        }
                    }
                })
            }
            state = this.metaReducer.sf(state, 'data.other.roles', fromJS(roleResponse))
        }

        return state
    }
    roleChange = (state, data) => {
        let roleList = this.metaReducer.gf(state, 'data.other.roles').toJS(), arr = [], arrChecked = [], roleStatus = false
        data.forEach((dataNum) => {
            arr.push({roleId:dataNum});
            arrChecked.push(dataNum);
            if(dataNum == '10'){
                roleStatus = true
            }
        });
        roleList.forEach((datarole) => {
            if(data.length > 0) {
                if(roleStatus){
                    if (datarole.code != '001') {
                        datarole.disabled = true
                    }
                }else {
                    if(datarole.code == '001'){
                        datarole.disabled = true
                    }
                }
            }else {
                datarole.disabled = false
            }
        })
        state = this.metaReducer.sf(state, 'data.other.roles', fromJS(roleList))
        state = this.metaReducer.sf(state, 'data.form.roleDtoList', fromJS(arr))
        state = this.metaReducer.sf(state, 'data.form.roleDtoListCheck', fromJS(arrChecked))
        return state
    }

	glAccounts = (state, option) => {
		let data = this.metaReducer.gf(state, 'data').toJS()
		let status = {
			otherReceivableAccountStatus: true,
			otherPayableAccountStatus: true,
		}
		option.glAccounts.forEach(function(dataObj){
			if(dataObj.id == data.form.otherReceivableAccountId){
				status.otherReceivableAccountStatus = false
			}
			if(dataObj.id == data.form.otherPayableAccountId){
				status.otherPayableAccountStatus = false
			}
		})
		if(status.otherReceivableAccountStatus == true){
			state = this.metaReducer.sf(state, 'data.form.otherReceivableAccountId', '')
		}
		if(status.otherPayableAccountStatus == true){
			state = this.metaReducer.sf(state, 'data.form.otherPayableAccountId', '')
		}
		state = this.metaReducer.sf(state, `data.form.${option.str}`, option.addItem.id)
		return state = this.metaReducer.sf(state, 'data.other.glAccounts', fromJS(option.glAccounts))
	}

    departmentList = (state, queryData) => {
        state = this.metaReducer.sf(state, 'data.other.departmentList', fromJS(queryData.departmentList))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})

    return {...metaReducer, ...o}
}
