/*
 * @Author: mikey.zhaopeng 
 * @Date: 2019-12-31 14:46:40 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-31 14:48:13
 */
/*
 * @Author: mikey.zhaopeng 
 * @Date: 2019-12-31 14:46:40 
 * @Last Modified by:   mikey.zhaopeng 
 * @Last Modified time: 2019-12-31 14:46:40 
 */
import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import debounce from 'lodash.debounce'
import extend from './extend';
import config from './config';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
		// this.search = debounce(this.search, 800);
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		injections.reduce('init');
		
		this.load();
	};

	load = async () => {
		
		//console.log(sessionStorage, 'sessionStorage')
		let orgIds = this.component.props.data && this.component.props.data.orgIds;
		if (sessionStorage['appParams']) {
			let appParams = JSON.parse(sessionStorage['appParams'])['appParams']
			this.metaAction.sf('data.orgIds',fromJS(appParams.orgIds))
			console.log(appParams, 'appParams')
		}
		if(orgIds){
			this.metaAction.sf('data.orgIds',fromJS(orgIds))
		}
		const loginTypeOptionData = await this.webapi.personaltax.findByEnumId(200045)
		this.metaAction.sf('data.loginTypeOptionData',fromJS(loginTypeOptionData))
		let gsmm= this.metaAction.gf('data.orgIds') || '[]';//获取个税客户ID
		//console.log(gsmm);
		//let gsmm="[247196665647360,247183538368832]";
		let arrgsmm=JSON.parse(gsmm);
		//let arrgsmm=['6907707551468544']
		//console.log(arrgsmm);
		const res = await this.webapi.personaltax.querylist(arrgsmm);
		let newList = res.map(item=>{
			
			return {
				...item,
				mw1:false,
				gssbmm: '',
				gssbmm1: item.gssbmm,
				mw2:false,
				gssmmm: '',
				gssmmm1: item.gssmmm,
			}
		})

		this.injections.reduce('load', newList)
	};

	// search = () => this.load()

	heightCount = () => {
		let name = '';
		if (this.component.props.modelStatus && (this.component.props.modelStatus == 1 || this.component.props.modelStatus == 2)) {
			name = 'ttk-es-app-personaltaxcode-contentHeight';
		}
		return name;
	};

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
	};

	
	//保存更新个税申报密码
	addClick = async () => {
		let list = this.metaAction.gf('data.list').toJS();

		let flag = false;
		for (let item of list) {
			if(!item.gssbmm){
				item.gssbmm = item.gssbmm1
			}
			if (!item.gssmmm) {
				item.gssmmm = item.gssmmm1
			}
			if(item.gsslfs == '1'){  //选择 实名登录
				if(!item.gssmzh || !item.gssmmm){
					item.validateStatus = true
					flag = true
				}
				// else{
				// 	item.gssbmm = ""
				// }
				
			}else if(item.gsslfs == '2'){ //选择 申报密码登录
				if(!item.gssbmm){
					item.validateStatus = true
					flag = true
				}
				// else{
				// 	item.gssmzh = ""
				// 	item.gssmmm = ""
				// }
				
			}else if(item.gsslfs == '3'){ //选择 申报密码登录
					item.gssbmm = ""
					item.gssmzh = ""
					item.gssmmm = ""
			}
			
		}
		//console.table(list);
		if(flag){
			this.metaAction.sf('data.list', fromJS(list))
			this.metaAction.toast('error', '红框内必须有值')
			return;
		}
		// list = list.filter(obj => obj.isChange)
		// list = list.map(item => {
		// 	let obj = {}
		// 	obj.value = item.gsmm && item.gsmm.trim()
		// 	obj.name = item.orgId
		// 	console.table(obj);
		// 	return obj
		// })
		 //console.table("---",list);
		let response = await this.webapi.personaltax.update(list)//新增岗位
		
		if (response && response.error) {
			this.metaAction.toast('error', response.error.message)
			return false
		} else {
			this.metaAction.toast('success', '保存成功')
			this.component.props.closeModal()
			// return response
		}
		
	}

	//登录方式
	loginTypeChange = (val,index) => {
	
		const list = this.metaAction.gf('data.list').toJS()
		list[index].gsslfs = val
		list[index].validateStatus = false
		this.metaAction.sf('data.list', fromJS(list))
	};

	changegText = (e, index,key) =>{
		const list = this.metaAction.gf('data.list').toJS()
		//list[index].validateStatus = false
		list[index][key] = e.target.value

		if(!e.target.value){
			const _key1 = key+'1'
			list[index][_key1] = e.target.value
		}
		this.metaAction.sf('data.list', fromJS(list))
	}

	keyDownText =(index,key)=>{
		const list = this.metaAction.gf('data.list').toJS()
		if(key == "mw1"){
			list[index].mw1 = true
			list[index].gssbmm1 = ''
		}else if(key == "mw2"){
			list[index].mw2 = true
			list[index].gssmmm1 = ''
		}
		this.metaAction.sf('data.list', fromJS(list))
	}

	
	// handleFocus  = (e, index) => {
	// 	const list = this.metaAction.gf('data.list').toJS()
	// 	list[index].passwordType = 'text'
	// 	this.metaAction.sf('data.list', fromJS(list))
	// }
	

	//修改个税密码(判断密码是否修改)
	handleBlur = (e, index) => {
		const list = this.metaAction.gf('data.list').toJS()
		list[index].passwordType = 'password'
		list[index].validateStatus = false
		 list[index].isChange = true
		// list[index].gsmm = e.target.value
		this.metaAction.sf('data.list', fromJS(list))
	}

    // changePassword = (e, index) => {
    //     const list = this.metaAction.gf('data.list').toJS()
    //     list[index].passwordType = 'text'
	// 	console.info(list)
    //     this.metaAction.sf('data.list', fromJS(list))
	// }
}


export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };

	metaAction.config({ metaHandlers: ret });

	return ret;
}
