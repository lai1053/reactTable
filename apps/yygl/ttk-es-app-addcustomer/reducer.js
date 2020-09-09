import {Map, List, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import moment from 'moment'
import {getInitState} from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state) => {
        return this.metaReducer.init(state, getInitState())
    }

    load = (state, option) => {
		let { orgDto, dlxxDto, nsxxDto,dlfs,contactsDto } = option
		let {khsx, name, helpCode, nsrsbh, dlzh, dlmm, blr, blrzjhm, linkName, linkTel, isEnable, areaCode, sfdm, csdm, qxdm,position} = orgDto
		let {DLFS, DLMM, DLZH,gssbmm,gsslfs,gssmzh,gssmmm,blrXm,blrDlmm,sjhm,sflx} = dlxxDto
		let dlfsu = dlfs
		let contactDto = contactsDto //新增联系人
		let addLink = [];
		let error = [];
		contactDto.map(item =>{
			addLink.push({name:'姓名',phone:'手机',job:'职位'});
			error.push({errorName:'',errorMobile:'',errorPosition:''})
		})
		let isAdd = null;
		if(contactDto){
			isAdd = true
		}else {
			isAdd = false
		}
		let newnsxxDto =  {}
		if(nsxxDto == null){
			newnsxxDto.BSY = '';
			newnsxxDto.BSY_SFZJHM = '';
			newnsxxDto.BSY_SFZJLX = ''
		}else {
			// {BSY, BSY_SFZJHM, BSY_SFZJLX} = nsxxDto
			newnsxxDto.BSY = nsxxDto.BSY;
			newnsxxDto.BSY_SFZJHM = nsxxDto.BSY_SFZJHM;
			newnsxxDto.BSY_SFZJLX = nsxxDto.BSY_SFZJLX
		}
		// let gs = null
		// if(gsslfs == 1){
		// 	gs = gssmmm
		// }else if(gsslfs == 2){
		// 	gs = gssbmm
		// }
        let zh = [];
		if(dlfs == '7'){
            zh = DLZH.split('#')
		}
		let from = {khsx, name, helpCode, nsrsbh,position, dlfs: dlfsu, dlzh: dlfsu != '7'?DLZH:zh[0],sfz:dlfsu == '7'?zh[1]:'', dlmm: DLMM, blr:newnsxxDto.BSY, blrzjhm: newnsxxDto.BSY_SFZJHM, blrzj: newnsxxDto.BSY_SFZJLX, linkName, linkTel, isEnable, areaCode, sfdm, csdm, qxdm,contactsDto:contactDto,gsdlfs:gsslfs,gssmzh,gssmmm1:gssmmm,gssbmm1:gssbmm,bjblrxm:blrXm,bjblrsf:sflx,bjblrsjh:sjhm,bjblrmm:blrDlmm}
		let area = {registeredProvincial: sfdm, registeredCity: csdm, registeredCounty: qxdm}
		if(newnsxxDto.BSY != '' || newnsxxDto.BSY_SFZJHM != '' || newnsxxDto.BSY_SFZJLX != ''){
            state = this.metaReducer.sf(state, 'data.blrVisible', true)
		}
		/*********江西手机号验证码登录**********/
		if(DLFS == 5){
			if(DLMM == '' || DLMM == null){
                state = this.metaReducer.sfs(state, {
                	'data.other.error.dlmm': '手机号码未验证',
					'data.form': fromJS(from),
					'data.area': fromJS(area),
					'data.addLXR': fromJS(addLink),
					'data.linkError': fromJS(error),
					'data.isAdd': isAdd
                })
			}else {
                state = this.metaReducer.sfs(state, {
                	'data.JXYZM': true,
					'data.form': fromJS(from),
					'data.area': fromJS(area),
					'data.addLXR': fromJS(addLink),
					'data.linkError': fromJS(error),
					'data.isAdd': isAdd
                })
			}
		}else{
			state = this.metaReducer.sfs(state, {
				'data.form': fromJS(from),
				'data.area': fromJS(area),
				'data.addLXR': fromJS(addLink),
				'data.linkError': fromJS(error),
				'data.isAdd': isAdd
			})
		}
		console.log("from:",from);
        return state
    }

	glAccounts = (state, option) => {
		let data = this.metaReducer.gf(state, 'data').toJS()
		let status = {
			receivableAccountStatus: true,
			receivableInAdvanceAccountStatus: true,
			otherReceivableAccountStatus: true,
		}
		option.glAccounts.forEach(function(dataObj){
			if(dataObj.id == data.form.receivableAccountId){
				status.receivableAccountStatus = false
			}
			if(dataObj.id == data.form.receivableInAdvanceAccountId){
				status.receivableInAdvanceAccountStatus = false
			}
			if(dataObj.id == data.form.receivableInAdvanceAccountId){
				status.otherReceivableAccountStatus = false
			}
		})
		if(status.receivableAccountStatus == true){
			state = this.metaReducer.sf(state, 'data.form.receivableAccountId', '')
		}
		if(status.receivableInAdvanceAccountStatus == true){
			state = this.metaReducer.sf(state, 'data.form.receivableInAdvanceAccountId', '')
		}
		if(status.otherReceivableAccountStatus == true){
			state = this.metaReducer.sf(state, 'data.form.otherReceivableAccountId', '')
		}
		state = this.metaReducer.sf(state, `data.form.${option.str}`, option.addItem.id)
		return this.metaReducer.sfs(state, 'data.other.glAccounts', fromJS(option.glAccounts))
	}

	payableAccountChange = (state, option) => {
		return this.metaReducer.sf(state, 'data.form.receivableAccountId', option)
	}

	dzswjStatus = (state, value) => {
		return this.metaReducer.sf(state, 'data.dzswjmm', value)
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
