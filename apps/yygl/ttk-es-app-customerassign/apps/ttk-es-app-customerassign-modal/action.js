import React from 'react'
import { List, fromJS, Map} from 'immutable'
import { Select } from 'edf-component'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.component = component
		this.injections = injections
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		injections.reduce('init', component.props.params);
		let ss = this.metaAction.gf('data.customerList').toJS();
		console.log(ss,'888888')
		this.load();

	}


	load = async () => {
		let res = await this.webapi.assignUser.getTableHeader({sfbt:1})
		if(res){
			this.metaAction.sf('data.listArr',fromJS(res))
		}
		let columns = this.metaAction.gf('data.listArr').toJS();
		console.log(columns,22222)
		if (columns){
			columns.forEach(item => {
				// debugger
				if(item.roleId){
					if(item.roleId == 100003){
						this.metaAction.sf('data.fp',true)
					}else if(item.roleId == 100004){
						this.metaAction.sf('data.bs',true)
					}else if(item.roleId == 100005){
						this.metaAction.sf('data.jz',true)
					}else if(item.roleId == 100006){
						this.metaAction.sf('data.cx',true)
					}else if(item.roleId == 100007){
						this.metaAction.sf('data.jzsh',true)
					}else if(item.roleId == 100008){
						this.metaAction.sf('data.ld',true)
					}
				}
			})
		}

		if(this.component.props.params.type == 'dg'){
			let dt =  this.metaAction.gf('data.dt').toJS();
			console.log(dt,'dt')
			let ret = await this.webapi.assignUser.queryDGCustomer()
			if(ret){
				if (ret.fpg){
                    this.metaAction.sfs({
						'data.fpUser':fromJS(ret.fpg),
						'data.fpgUserId':dt.fpgUserId,
                    })
				}else {
                    this.metaAction.sfs({
                        'data.fpUser':fromJS([]),
                        'data.fpgUserId':'',
                    })
				}
                if (ret.bsg){
                    this.metaAction.sfs({
						'data.bsUser':fromJS(ret.bsg),
                        'data.bsgUserId':dt.bsgUserId,
                    })
                }else {
                    this.metaAction.sfs({
                        'data.bsUser':fromJS([]),
                        'data.bsgUserId':'',
                    })
                }
                if (ret.jzg){
                    this.metaAction.sfs({
						'data.jzUser':fromJS(ret.jzg),
                        'data.jzgUserId':dt.jzgUserId,
                    })
                }else {
                    this.metaAction.sfs({
                        'data.jzUser':fromJS([]),
                        'data.jzgUserId':'',
                    })
                }
                if (ret.cxg){
                    this.metaAction.sfs({
						'data.cxUser':fromJS(ret.cxg),
                        'data.cxgUserId':dt.cxgUserId,
					})
                }else {
                    this.metaAction.sfs({
                        'data.cxUser':fromJS([]),
                        'data.cxgUserId':'',
                    })
                }
                if (ret.jzshg){
                    this.metaAction.sfs({
						'data.jzshUser':fromJS(ret.jzshg),
                        'data.jzshUserId':dt.jzshUserId,
                    })
                }else {
                    this.metaAction.sfs({
                        'data.jzshUser':fromJS([]),
                        'data.jzshUserId':'',
                    })
                }
                if (ret.ldg){
                    this.metaAction.sfs({
						'data.ldUser':fromJS(ret.ldg),
                        'data.ldUserId':dt.ldUserId,
                    })
                }else {
                    this.metaAction.sfs({
                        'data.ldUser':fromJS([]),
                        'data.ldUserId':'',
                    })
                }
			}
		}
	}


	//改变可选状态
	// changeStatus = (e,name) => {
	// 	let ss = e.target.checked
	// 	console.log('qqqq',ss)
	// 	console.log('eeee',name)
	// 	this.injections.reduce('checkboxStatus',name,!ss)
    //
	// }
	changeStatus1 = (e,name) => {
		// debugger
		let ss = e.target.checked
		console.log('qqqq',ss)
		console.log('eeee',name)
		this.injections.reduce('checkboxStatus1',name,!ss)
	}

	//展示岗位人员
	showUser = async (e,roleId) => {
		// debugger
		if(e.target.checked){
			let data = {roleId:roleId}
			let res = await this.webapi.assignUser.queryJobUser(data)
			if(res){
				console.log('我是岗位人员',res)
				let ss = null;
				switch (roleId) {
					case 100003:
						ss = 'data.fpUser';
						break;
					case 100004:
						ss = 'data.bsUser';
						break;
					case 100005:
						ss = 'data.jzUser';
						break;
					case 100006:
						ss = 'data.cxUser';
						break;
					case 100007:
						ss = 'data.jzshUser';
						break;
					case 100008:
						ss = 'data.ldUser';
						break;

				}
				this.metaAction.sf(ss,fromJS(res))
			}
		}


	}


	showUser1 = async () => {
		let res = await this.webapi.assignUser.queryJobUser2();
		if (res){
			console.log('.....',res);
				res.forEach((item) =>{
					if(item.roleName === '发票岗'){
						this.metaAction.sf('data.fpUser',fromJS(item.users))
						console.log(item.users)
					}else if(item.roleName === '报税岗'){
						this.metaAction.sf('data.bsUser',fromJS(item.users))
					}else if(item.roleName === '记账岗'){
						this.metaAction.sf('data.jzUser',fromJS(item.users))
					}else if(item.roleName === '查询岗'){
						this.metaAction.sf('data.cxUser',fromJS(item.users))
					}else if(item.roleName === '记账审核岗'){
						this.metaAction.sf('data.jzshUser',fromJS(item.users))
					}else if(item.roleName === '理单岗'){
						this.metaAction.sf('data.ldUser',fromJS(item.users))
					}
				})
		}
	}

	userData = (data) =>{
        if(!data) return null
        let arr = []
        data.forEach((option) => arr.push(<Select.Option key={option.sysUserId} value={option.sysUserId}>{option.name}</Select.Option>))
        return arr
    }


	onOk = async () => {
		return await this.save()
	}

	save = async () =>{
		//选择了岗位下人员的id
		let  fp = this.metaAction.gf('data.fpgUserId')
		let  bs = this.metaAction.gf('data.bsgUserId')
		let  jz = this.metaAction.gf('data.jzgUserId')
		let  cx = this.metaAction.gf('data.cxgUserId')
		let  jzsh = this.metaAction.gf('data.jzshUserId')
		let  ld = this.metaAction.gf('data.ldUserId')
		let data = {};
		console.log('gggg',fp)
        data.customerList = this.metaAction.gf('data.customerList').toJS();
		//是否进行了人员选择
		if(this.component.props.params.type == 'dg'){
            let  fpD = this.metaAction.gf('data.fp')
            let  bsD = this.metaAction.gf('data.bs')
            let  jzD = this.metaAction.gf('data.jz')
            let  cxD = this.metaAction.gf('data.cx')
            let  jzshD = this.metaAction.gf('data.jzsh')
            let  ldD = this.metaAction.gf('data.ld')
            data.fpgUserId = fpD ? ((fp === ''|| fp == undefined) ? 1 : fp) : (fp === '' ? 0 : fp);
            data.bsgUserId = bsD ? ((bs === ''|| bs == undefined) ? 1 : bs) : (bs === '' ? 0 : bs);
            data.jzgUserId = jzD ? ((jz === ''|| jz == undefined) ? 1 : jz) : (jz === '' ? 0 : jz);
            data.cxgUserId = cxD ? ((cx === ''|| cx == undefined) ? 1 : cx) : (cx === '' ? 0 : cx);
            data.jzshUserId = jzshD ? ((jzsh === ''|| jzsh == undefined) ? 1 : jzsh) : (jzsh === '' ? 0 : jzsh);
            data.ldUserId = ldD ? ((ld === ''|| ld == undefined) ? 1 : ld) : (ld === '' ? 0 : ld);
		}else {
            let  fpL = this.metaAction.gf('data.fpLoding')
            let  bsL = this.metaAction.gf('data.bsLoding')
            let  jzL = this.metaAction.gf('data.jzLoding')
            let  cxL = this.metaAction.gf('data.cxLoding')
            let  jzshL = this.metaAction.gf('data.jzshLoding')
            let  ldL = this.metaAction.gf('data.ldLoding')
            data.fpgUserId = fpL ? (fp === '' ? 0 : fp) : (fp === ''|| fp == undefined) ? 1 : fp;
            data.bsgUserId = bsL ? (bs === '' ? 0 : bs) : (bs === ''|| bs == undefined) ? 1 : bs;
            data.jzgUserId = jzL ? (jz === '' ? 0 : jz) : (jz === ''|| jz == undefined) ? 1 : jz;
            data.cxgUserId = cxL ? (cx === '' ? 0 : cx) : (cx === ''|| cx == undefined) ? 1 : cx;
            data.jzshUserId = jzshL ? (jzsh === '' ? 0 : jzsh) : (jzsh === ''|| jzsh == undefined) ? 1 : jzsh;
            data.ldUserId = ldL ? (ld === '' ? 0 : ld) : (ld === ''|| ld == undefined) ? 1 : ld;
		}

		console.log(',,,,',data)
		let res = await this.webapi.assignUser.saveCustomer(data);
	}

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
