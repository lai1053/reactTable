import React from 'react'
import { List, fromJS, Map} from 'immutable'
import { Form,Select,Input,Checkbox } from 'edf-component'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
const  FormItem = Form.Item

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
        let res = await this.webapi.assignUser.getTableHeader({sfbt:0});
		if(res){
            // console.log(res,'res')
			this.injections.reduce('updateSingle', 'data.list',fromJS(res))
            let saveData = this.metaAction.gf('data.saveData').toJS();
            if(this.component.props.params.type == 'pl'){
                let dis = this.metaAction.gf('data.dis').toJS();
                res.forEach(item =>{
					dis[item.roleId] =true
                })
                // console.log(dis,'dis')
				this.injections.reduce('updateSingle', 'data.dis',fromJS(dis))
			}
            res.forEach(item =>{
				saveData.fpxxs[item.roleId] = [0]
			})
            // console.log(saveData,'saveData')
			this.injections.reduce('updateSingle', 'data.saveData',fromJS(saveData))
		}
		if(this.component.props.params.type == 'dg'){
            let ret = await this.webapi.assignUser.queryDGCustomer();
            if(ret){
				this.injections.reduce('updateSingle', 'data.user',fromJS(ret))
            }
			let id = this.metaAction.gf('data.customerList').toJS()
			let reg = await this.webapi.assignUser.queryUserName({customerId:id[0]})
			if(reg){
				// console.log(reg,'reg')
				let valu = {};
                res&&res.map((item,index) => {
                    valu[item.roleId] = []
                    reg[item.roleId]&&reg[item.roleId].map(aa =>{
                    	valu[item.roleId].push(aa.sysUserId)
                    })
				})
				this.injections.reduce('updateObj', {
					'data.userId':fromJS(reg),
					'data.valu':fromJS(valu)
				})
				// console.log(valu,'我是单个分配提前筛选出来的')
			}

		}
		else {
            let ret = await this.webapi.assignUser.queryPLCustomer();
			let valu = {};
			res.forEach(item =>{
				valu[item.roleId] = []
			})
            if(ret){
				this.injections.reduce('updateObj', {
					'data.user':fromJS(ret),
					'data.valu':fromJS(valu)
				})
            }else{
				this.injections.reduce('updateSingle', 'data.valu',fromJS(valu))
			}
		}
	}

    handleUser = (e,index,id) => {
		console.log(e,'eeeee')
		let saveData = this.metaAction.gf('data.saveData').toJS();
		let valu = this.metaAction.gf('data.valu').toJS();
		let ee = null
		if(e == undefined || e == ''){
			ee = [1]
		}else {
			ee = e
		}
		saveData.fpxxs[id] = ee
		valu[id]=e
		this.injections.reduce('updateObj', {
			'data.saveData':fromJS(saveData),
			'data.valu':fromJS(valu)
		})
		console.log(saveData,'我是saveData')
		console.log(valu,'我是valu')

	}

    changeCheck = (e,index,id) => {
        console.log(e,'eeeee')
        let saveData = this.metaAction.gf('data.saveData').toJS();
        let dis = this.metaAction.gf('data.dis').toJS();
        dis[id] = !dis[id]
		if(dis[id] == false){
            saveData.fpxxs[id] = [1];
		}else {
            saveData.fpxxs[id] = [0];
		}
		this.injections.reduce('updateObj', {
			'data.saveData':fromJS(saveData),
			'data.dis':fromJS(dis)
		})
        // console.log(saveData,'我是saveData')
        // console.log(dis[id],'id')

	}
    changeTop = (e) => {
	    console.log(e,'我是onselect')
    }

	//单个客户分配
    renderDGData = (data) => {
		let user = this.metaAction.gf('data.user').toJS();
		let valu = this.metaAction.gf('data.valu').toJS();
        // console.log(valu,'valu')
        return data&&data.map((item,index) => {
            return <div className='ttk-es-app-customer-assign-modal-listdg-dg' style={{position:'relative'}} id='area'>
                <Form>
                    <FormItem label={item.name} >
                        <Select placeholder="请选择担任该岗位的人员"
								style={{width:'360px'}}
                                className="selectUser"
								value={valu[item.roleId]}
                                showSearch={true}
                                filterOption={true}
                                optionFilterProp="children"
                                // allowClear={true}
                                mode="multiple"
                                dropdownStyle={{height:'160px'}}
                                getPopupContainer={() => document.getElementById('area')}
                                // onSelect ={(e) => {this.changeTop(e)}}
							onChange={(e) => {this.handleUser(e,index,item.roleId)}}
                        >
                            {
                                user[item.roleId]&&user[item.roleId].map(data => {

                                	return  <Option value={data.sysUserId} disabled={data.hasqx =='1'?false:true} title={data.hasqx =='1'?"":"【不能选择其他部门的人员】"}>{ data.name}</Option>
                            })
                            }
                        </Select>
                    </FormItem>
                </Form>
            </div>
        })
    }


    //批量客户分配
    renderPLData = (data) => {
        let user = this.metaAction.gf('data.user').toJS();
        let valu = this.metaAction.gf('data.valu').toJS();
        let dis = this.metaAction.gf('data.dis').toJS();
        // console.log(valu,'valu')
		return data&&data.map((item,index) => {
			return <div className='ttk-es-app-customer-assign-modal-listpl-pl' style={{position:'relative'}} id='area'>
				<Form>
                    <Checkbox className="ttk-es-app-customer-assign-modal-listpl-checkbox"
							  onChange={(e) => {this.changeCheck(e,index,item.roleId)}}
					></Checkbox>
					<FormItem label={item.name}>
                        <Select placeholder="请选择担任该岗位的人员"
                                style={{width:'360px'}}
                                className="selectUser"
                                value={valu[item.roleId]}
                                showSearch={true}
                                filterOption={true}
                                optionFilterProp="children"
							// allowClear={true}
                                mode="multiple"
								disabled={dis[item.roleId]}
                                dropdownStyle={{height:'160px'}}
                                getPopupContainer={() => document.getElementById('area')}
                                onChange={(e) => {this.handleUser(e,index,item.roleId)}}
                        >
                            {
                                user[item.roleId]&&user[item.roleId].map(data => {

                                    return  <Option value={ data.sysUserId}>{ data.name}</Option>
                                })
                            }
                        </Select>
					</FormItem>
				</Form>
			</div>
		})

	}




	onOk = async () => {
		return await this.save()
	}

	save = async () =>{
		let data = this.metaAction.gf('data.saveData').toJS();
		console.log(data,'data')
		let ret = await this.webapi.assignUser.saveAssignMessage(data)
	}


}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
