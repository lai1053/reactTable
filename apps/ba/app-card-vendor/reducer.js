import {Map, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import {getInitState} from './data'

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
		if (option.category) {
			let category = this.getTreeNode(option.category);
			state = this.metaReducer.sf(state, 'data.other.category', fromJS(category))
        }
        if (option.response) {
            if (Object.keys(option.response).length == 0) {
				option.response.isEnable = true
				option.response.categoryId = 1
                state = this.metaReducer.sf(state, 'data.form', fromJS(option.response))
            } else {
                state = this.metaReducer.sf(state, 'data.form', fromJS(option.response))
            }
        }
        if (option.code) {
            state = this.metaReducer.sf(state, 'data.form.code', fromJS(option.code))
        }
	    if (option.glAccounts) {
		    state = this.metaReducer.sf(state, 'data.other.glAccounts', fromJS(option.glAccounts))
	    }
        return state
    }
	glCats  = (state, option) => {
		let data = this.metaReducer.gf(state, 'data').toJS()
		if(!option.some((item)=> item.id == data.form.categoryId)){
			state = this.metaReducer.sf(state, 'data.form.categoryId', undefined)
		}
		let cats = this.getTreeNode(option);
		return state = this.metaReducer.sf(state, 'data.other.category', fromJS(cats))
	}
    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }

	glAccounts = (state, option) => {
		// state = this.metaReducer.sf(state, 'data.form.payableAccountId', '')
		let data = this.metaReducer.gf(state, 'data').toJS()
		let status = {
			payableAccountStatus: true,
			payableInAdvanceAccountStatus: true,
			otherPayableAccountStatus: true,
		}
		option.glAccounts.forEach(function(dataObj){
			if(dataObj.id == data.form.payableAccountId){
				status.payableAccountStatus = false
			}
			if(dataObj.id == data.form.payableInAdvanceAccountId){
				status.payableInAdvanceAccountStatus = false
			}
			if(dataObj.id == data.form.otherPayableAccountId){
				status.otherPayableAccountStatus = false
			}
		})
		if(status.payableAccountStatus == true){
			state = this.metaReducer.sf(state, 'data.form.payableAccountId', '')
		}
		if(status.payableInAdvanceAccountStatus == true){
			state = this.metaReducer.sf(state, 'data.form.payableInAdvanceAccountId', '')
		}
		if(status.otherPayableAccountStatus == true){
			state = this.metaReducer.sf(state, 'data.form.otherPayableAccountId', '')
		}
		state = this.metaReducer.sf(state, `data.form.${option.str}`, option.addItem.id)
		return state = this.metaReducer.sf(state, 'data.other.glAccounts', fromJS(option.glAccounts))
	}
	payableAccountChange = (state, option) => {
		return state = this.metaReducer.sf(state, 'data.form.payableAccountId', option)
	}
	getTreeNode = (list, pid=0, key) => {
		var tree = [];
		var temp;
		for (var i = 0; i < list.length; i++) {
			if (list[i].parentId == pid) {
				var obj = list[i];
				if (key != undefined && Number(key) != NaN) {
					obj.key = list[i].id;
				} else {
					obj.key = list[i].id;
				}
				temp = this.getTreeNode(list, list[i].id, i);
				if (temp.length > 0) {
					obj.children = temp;
					obj.selectable = false;
				}
				obj.value = obj.id;
				obj.title = obj.name;
				tree.push(obj);
			}
		}
		return tree;
	};
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})

    return {...metaReducer, ...o}
}
