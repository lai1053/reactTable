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

    load = (state, roleResponse) => {
        state = this.metaReducer.sf(state, 'data.other.roles', fromJS(roleResponse))
        return state
    }

    //修改角色
    roleChange1 = (state, data,name) => {
        let roleList = this.metaReducer.gf(state, 'data.other.roles1').toJS(), arr = [], arrChecked = [], roleStatus = false
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

        if(name) {
            state = this.metaReducer.sfs(state, {
                'data.other.roles1': fromJS(roleList),
                'data.form.roleDtoList': fromJS(arr),
                'data.form.roleDtoListCheck': fromJS(arrChecked),
                'data.form.dzRoles1': fromJS(arrChecked),
                'data.form.dzRoles3': fromJS(arrChecked)
            })
        }else{
            state = this.metaReducer.sfs(state, {
                'data.other.roles1': fromJS(roleList),
                'data.form.roleDtoList': fromJS(arr),
                'data.form.roleDtoListCheck': fromJS(arrChecked)
            })
        }
        return state
    }

    roleChange3 = (state, data,name) => {
        // debugger
        let roleList = this.metaReducer.gf(state, 'data.other.roles2').toJS(), arr = [], arrChecked = [], roleStatus = false
        console.log('我是系统管理员',data)
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

        if(name) {
            state = this.metaReducer.sfs(state, {
                'data.other.roles2': fromJS(roleList),
                'data.form.roleDtoList': fromJS(arr),
                'data.form.roleDtoListCheck': fromJS(arrChecked),
                'data.form.dzRoles3': fromJS(arrChecked),
                'data.xtglRole': fromJS(arrChecked)
            })
        }else{
            state = this.metaReducer.sfs(state, {
                'data.other.roles2': fromJS(roleList),
                'data.form.roleDtoList': fromJS(arr),
                'data.form.roleDtoListCheck': fromJS(arrChecked)
            })
        }
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

    updateObj = (state,obj) => {
        return this.metaReducer.sfs(state,obj)
    }

    updateSingle = (state,path,value) => {
        return this.metaReducer.sf(state,path,value)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})

    return {...metaReducer, ...o}
}
