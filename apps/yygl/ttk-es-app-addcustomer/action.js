import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import config from './config'
import debounce from 'lodash.debounce'
import { fromJS } from 'immutable'
import {consts} from 'edf-consts'
import {FormDecorator, Icon, Checkbox,Form,Select,Input} from 'edf-component'
// import AddLinkPerson from './component/addLinkPerson'
const  FormItem = Form.Item

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
		this.nameChange = debounce(this.nameChange, 400);
	}

	onInit = ({component, injections}) => {
		this.voucherAction.onInit({component, injections})
		this.component = component
		this.injections = injections
		// this.clickStatus = false    //客户档案创建按钮状态控制
		// this.noPointStatus = 1    //客户档案自动生成二级科目不在显示控制
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
		injections.reduce('init', {
			isPop: this.component.props.isPop
		})
		this.load()
	}

	load = async () => {
	    let loginType = await this.webapi.customer.findByEnumId({ enumId: 200025 })//登录类型
	    let gsType = await this.webapi.customer.findByEnumId({ enumId: 200045 })//个税账号类型
	    let areaQuery = await this.webapi.customer.areaQuery({})//地区选择
		let IDType = await this.webapi.customer.findByEnumId({enumId:'200016'})//证件类型
		let arr = [];
		let arrbj = [];
	    arr.push('200037')
	    arrbj.push('200036')
		const enumList = await this.webapi.customer.batchQuery(arr)
		const enumListbj = await this.webapi.customer.batchQuery(arrbj)
		console.log(enumList['200037'],'我是职位')
		console.log(enumListbj['200036'],'我是北京身份')
		this.injections.reduce('updateObj', {
			'data.lxrJob':fromJS(enumList['200037']),
			'data.bjblrJob':fromJS(enumListbj['200036']),
			'data.other.gsType': fromJS(gsType)
		})
		// let allType = await this.webapi.customer.allTypeQuery({enumIdList:['200025','200016']})
		console.log('我是登录类型',loginType)
		console.log('我是个税账号类型',gsType)
		// console.log('我是证件类型',IDType)
		// console.log('我是地区',areaQuery)
        if(loginType){//登录类型
            let arg = {}
            loginType.forEach((data) => arg[data.code] = data)
            console.log('deng',arg)
			this.injections.reduce('updateSingle', 'data.other.loginTypeMap',fromJS(arg))
        }
        if(areaQuery){//地区选择
            let arg = {}
            areaQuery.map((data) => {
                data.loginTypeArr = data.loginType.split(',');
                arg[data.code] = data
			})
			this.injections.reduce('updateObj', {
				'data.other.areaQueryArr': fromJS(areaQuery),
				'data.other.areaQueryMap': fromJS(arg)
			})
        }
		let importid = await this.webapi.CAState.getImportid()//客户orgid
		this.injections.reduce('updateSingle', 'data.importId',fromJS(importid))
		console.log(importid,'/////')
		if(this.component.props.active == 'details') {
			let item = await this.webapi.customer.query({ id: this.component.props.id })
			this.injections.reduce('load', item)
			let code = this.metaAction.gf('data.area.registeredCounty')
			let dd = item.dlfs
			this.injections.reduce('updateSingle', 'data.gg',dd)//存放登录方式
			this.injections.reduce('updateObj',{//存放登录密码和个税申报密码、个税实名密码
               'data.ifdlmm':item.dlxxDto.DLMM,
               'data.ifgssmmm':item.dlxxDto.gssmmm,
               'data.ifgssbmm':item.dlxxDto.gssbmm,
				'data.ifbjblrmm':item.dlxxDto.blrDlmm,
			})
			this.confirmRegisteredCounty(code,dd)
			if(item.dlxxDto.DLFS == '1'){
				this.injections.reduce('updateObj', {
					'data.other.readSuc':true,
					'data.isEdit':'222'//更换证书
				})
			}
			this.injections.reduce('updateObj', {
				'data.orgId':item.orgDto.orgId,
				'data.CAState':item.orgDto.orgId,
				'data.isId':this.component.props.id,
				'data.dzswjmm':false,
				'data.mw1':false,
				'data.mw2':false
			})
			// this.confirmRegisteredCounty(item.orgDto.qxdm)
		}else {
            console.log(this.metaAction.context.get("currentOrg").xzqhdm,'666')
            let qydm = this.metaAction.context.get("currentOrg").xzqhdm
			// console.log(qydm,'qydm')
            if(qydm){
                let code = qydm.substr(0,2)
                let code1 = qydm.substr(2,2)
                let code2 = qydm.substr(4,2)
                // console.log(code,'777')
                // console.log(code1,'888')
                // console.log(code2,'888')
				this.injections.reduce('updateObj', {
					'data.area.registeredProvincial': (code+'0000').toString(),
					'data.area.registeredCity':  (code+code1+'00').toString(),
					'data.area.registeredCounty':  (code+code1+code2).toString(),
					'data.form.areaCode': qydm.toString()
				})
                this.confirmRegisteredCounty(qydm.toString())
            }
			//******************CA证书
			// begin****************** */
			this.injections.reduce('updateObj', {
				'data.dzswjmm': true,
				'data.isId':importid,
				'data.CAState':importid
			})
		}
        if(IDType){
			this.injections.reduce('updateSingle', 'data.IDType',fromJS(IDType))
		}

		this.timer = null  //
		//******************CA证书 end ****************** */

		// const linkConfig = this.metaAction.context.get('linkConfig');
		// if (linkConfig) {
		// 	this.metaAction.sf('data.linkT',false);
		// }
		//
		// let data = {}, response = {}, code, account
		// if (this.component.props.personId || this.component.props.personId === 0) {
		// 	// response = await this.webapi.customer.query(this.component.props.personId)
		// } else {
		// 	code = await this.webapi.customer.getCode()
		// }
		// account = await this.webapi.customer.account()
		// if (code) data.code = code
		// if (response) data.response = response
		// if (account && account.glAccounts) data.glAccounts = account.glAccounts
		let noPointStatusQuery= await this.webapi.customer.queryByparamKeys({paramKeys: ["PromptGenerateSpecificAccount4Customer"]})
		this.noPointStatus = noPointStatusQuery && noPointStatusQuery[0] && noPointStatusQuery[0].paramValue

	}

	// bsrwbq = () => {
     //    let qydm = this.metaAction.gf("data.form.areaCode")
     //    console.log(qydm,'qydm')
	// 	if(qydm.startsWith('11') || qydm.startsWith('44') || qydm.startsWith('52') || qydm.startsWith('63') || qydm.startsWith('37') || qydm.startsWith('35') || qydm.startsWith('2102')){//当企业所属区域为广东、北京、贵州、青海、山东（全省、含青岛）、福建、大连时，显示【办税人信息】字段
     //    	return true
	// 	}else {
     //    	return false
	// 	}
	// }



	onOk = async () => {
		return await this.save()
	}

	//新增或是详情里的四川登录方式 点击扫码下载APP
	copyImg = async () => {
        const ret = this.metaAction.modal('show', {
            title: '',
            width:400,
            className:'ttk-es-app-addcustomer-copyimg-modal',
            footer:null,
            children: this.metaAction.loadApp('ttk-es-app-addcustomer-copyimg', {
                store: this.component.props.store,
				option:{
                    typeImg:1,
					mes:''
				}
            })
        })
	}


	confirmRegisteredCounty = (code,dd) => {
		console.log(code,'>>>>>>',dd)
		// debugger
		let areaQueryMap = this.metaAction.gf('data.other.areaQueryMap').toJS()
		const form = this.metaAction.gf('data.form').toJS()
		console.log('这是谁：',areaQueryMap)
        if(areaQueryMap[code]){
			console.log('颠三倒四',areaQueryMap[code].loginTypeArr)
			
			let loginTypeArr = areaQueryMap[code].loginTypeArr
			if(form.khsx != "001"){ //选择的不是一次性服务 去掉无
				loginTypeArr = loginTypeArr.filter(item => item != "8")
			}
			console.log(loginTypeArr,"----:",form.khsx);
			if(this.component.props.active == 'details'){
				this.injections.reduce('updateObj', {
					'data.other.loginTypeRelation': fromJS(loginTypeArr),
					'data.form.dlfs': fromJS(dd)
				})
			}else{
				this.injections.reduce('updateObj', {
					'data.other.loginTypeRelation': fromJS(loginTypeArr),
					'data.form.dlfs': fromJS(areaQueryMap[code].loginTypeArr.length > 0 && (form.khsx != "001" ? areaQueryMap[code].loginTypeArr[0] : "8"))
				})
			}

        }else {
        	let ff = this.metaAction.gf('data.gg')
            this.confirmRegisteredCounty(code.slice(0,code.length - 2),ff)
        }
    }

    // setGssbm = (e) =>{
	// 	if(this.component.props.active == 'details'){
    //
	// 	}
	// }

    //设置地址
    setAddress = (e) => {
		// debugger
        let address = e.toJS()
        this.confirmRegisteredCounty(address.districts)
		this.injections.reduce('updateObj', {
			'data.area.registeredProvincial': address.provinces,
			'data.area.registeredCity': address.citys,
			'data.area.registeredCounty': address.districts,
			'data.area.registeredAddress': address.text,
			'data.form.areaCode':address.districts
		})
		// let aa = this.metaAction.gf('data.form.areaCode')
		/***********************CA证书信息 begin***********************/
		if(address.provinces=="110000"){//判断是否选择北京市
			this.injections.reduce('updateSingle', 'data.other.CABox',true)
		}else{
			this.injections.reduce('updateSingle', 'data.other.CABox',false)
		}
		/***********************CA证书信息 end ***********************/
		console.log('ddd',address)
    }

	openRuleContent = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '用户协议条款',
			width: 700,
			bodyStyle: { height: 400, overflow: 'auto' },
			okText: '同意',
			cancelText: '不同意',
			className: 'userProtocol',
			children: this.metaAction.loadApp('ttk-es-app-protocol', {
				store: this.component.props.store,
				initData: {
					name: appBasicInfo.name,
					companyName: appBasicInfo.companyName,
					companyNameShort: appBasicInfo.companyNameShort
				}
			})
		})
		this.injections.reduce('updateSingle', 'data.isEnable',!!ret)
	}




	/********************江西验证码登录 start*************************/


    changeYZM = (e) => {
    	// debugger
    	if(this.component.props.active == 'details'){
    		// console.log(e.target.value,'eeee')
    		if(e.target.value == ''){
				this.injections.reduce('updateSingle', 'data.JXYZM',false)
			}

		}
	}

    countDown = 120   //倒计时
    timer = null
	sendCoding = false

    sendCode = async() => {
    	// debugger
		let phone = this.metaAction.gf('data.form.dlzh');
        const form = this.metaAction.gf('data.form').toJS()
        // const area = this.metaAction.gf('data.area').toJS()
		if(phone == '' || phone == undefined){
			this.injections.reduce('updateSingle', 'data.other.error.dlzh',"请输入手机号")
            return false
		}else {
            if(phone && !(/^1[3|4|5|6|7|8|9][0-9]\d{8}$/.test(phone))){
				this.injections.reduce('updateSingle', 'data.other.error.dlzh',"请输入正确的手机号")
                return false
            }else {
				this.injections.reduce('updateSingle', 'data.other.error.dlzh',"")
			}
		}

        const ok = await this.voucherAction.check([
           {
                path: 'data.form.nsrsbh', value: form.nsrsbh
            },{
                path: 'data.form.areaCode', value: form.areaCode
            }], this.check)

        if (!ok) {
            debugger
            console.log('我是地区',form.areaCode);
            this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
            this.clickStatus = false
            return false
        }

        if(this.sendCoding) return
        this.sendCoding = true
        this.metaAction.sf('data.timeStaus',false)
        let data = {
        	sjhm:phone,
			areaCode:'36',
			nsrsbh:form.nsrsbh
        }
		// if(response.success){
            let code = await this.webapi.JXCode.queryCode(data)
            if(code){
                if(code.code == '0'){//验证码获取成功，请在5分钟内完成输入并保存客户
                    this.metaAction.toast('success', '验证码获取成功，请在5分钟内完成输入并保存客户')
                    this.timer = setInterval(() => {
                        if(this.countDown == 0) {
                            this.clearTimer(true, '重新获取')
                            return
                        }
						this.injections.reduce('updateObj', {
							'data.timeSJ':(--this.countDown)+'秒后重新获取',
							'data.yzm':true
						})
                        console.log(this.countDown)
                    },1000)
                }
            }
		// }


	}


    //清除定时器
    clearTimer = function(staus, remind) {
		this.injections.reduce('updateObj', {
			'data.timeStaus':true,
			'data.timeSJ':remind,
			'data.yzm':false
		})
        this.countDown = 120
        this.sendCoding = false
        clearInterval(this.timer)
    }
	/********************江西验证码登录 end*************************/




	/*********************新增联系人 start*********************************/

		//新增联系人
	addArr = () =>{
		let hh = this.metaAction.gf('data.addLXR')
		let contacts = this.metaAction.gf('data.form.contactsDto')
		let error = this.metaAction.gf('data.linkError')
		// console.log('eeeeeee',this.metaAction.gf('data.form.contactsDto'))
		// console.log('ggggggg',this.metaAction.gf('data.addLXR'))

		this.injections.reduce('updateObj', {
			'data.isAdd':true,
			'data.addLXR':fromJS(hh.push({name:'姓名',phone:'手机',job:'职位'})),
			'data.form.contactsDto':fromJS(contacts.push({name:'',mobile:'',position:''})),
			'data.linkError':fromJS(error.push({errorName:'',errorMobile:'',errorPosition:''}))
		})
	}

	//删除联系人
	deleteLink = (index) =>{
		console.log('我是删除',index)
		let hh = this.metaAction.gf('data.addLXR')
		let gg = this.metaAction.gf('data.form.contactsDto')
		let ff = this.metaAction.gf('data.linkError')
		this.injections.reduce('updateObj', {
			'data.addLXR':fromJS(hh.splice(index,1)),
			'data.form.contactsDto':fromJS(gg.splice(index,1)),
			'data.linkError':fromJS(ff.splice(index,1))
		})
		// console.log('tttttt',this.metaAction.gf('data.form.contactsDto').toJS())
		// console.log('yyyyyy',this.metaAction.gf('data.addLXR').toJS())
	}

	//输入姓名
	handleName = (e,index) =>{
		console.log(index)
		let name = this.metaAction.gf('data.form.contactsDto').toJS()
		name[index].name= e.target.value;
		this.injections.reduce('updateSingle', 'data.form.contactsDto',fromJS(name))
		// console.log('我是输入',this.metaAction.gf('data.form.contactsDto').toJS())
	}
	//输入手机号
	handleMobile = (e,index) =>{
		console.log(index)
		let mobile = this.metaAction.gf('data.form.contactsDto').toJS()
		mobile[index].mobile= e.target.value;
		this.injections.reduce('updateSingle', 'data.form.contactsDto',fromJS(mobile))
		// console.log('我是输入',this.metaAction.gf('data.form.contactsDto').toJS())
	}
	//职位选择
	handlePosition = (e,index) =>{
		console.log(index)
		let position = this.metaAction.gf('data.form.contactsDto').toJS()
		position[index].position= e;
		this.injections.reduce('updateSingle', 'data.form.contactsDto',fromJS(position))
		// console.log('我是输入',this.metaAction.gf('data.form.contactsDto').toJS())
	}

	//输入校验
	changeLink = (str,index) =>{
		// debugger
		let link = this.metaAction.gf('data.form.contactsDto').toJS();
		let error = this.metaAction.gf('data.linkError').toJS();
		console.log(link,9999)
		let reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
		switch (str) {
			case 'name':
				if(link[index].name == ''){
					error[index].errorName = '请输入联系姓名'
				}else {
					error[index].errorName = ''
				}
				this.injections.reduce('updateSingle', 'data.linkError',fromJS(error))
				break;
			case 'mobile':
				if(link[index].mobile == ''){
					error[index].errorMobile = '请输入联系人手机号'
				}else if(!reg.test(link[index].mobile)) {
					error[index].errorMobile = '请输入正确的手机号'
				}else {
					error[index].errorMobile = ''
				}
				this.injections.reduce('updateSingle', 'data.linkError',fromJS(error));
				break;
			case 'position':
				if(link[index].position == ''){
					error[index].errorPosition = '请选择联系人职位'
				}else {
					error[index].errorPosition = ''
				}
				this.injections.reduce('updateSingle', 'data.linkError',fromJS(error))
				break;
		}

	}

	//联系人多个
	renderLXR = (data) =>{
		// debugger
		let job =this.metaAction.gf('data.lxrJob').toJS()
		let link = this.metaAction.gf('data.form.contactsDto').toJS();
		let error = this.metaAction.gf('data.linkError').toJS();
		// console.log('\\\\\\',job)
		return data&&data.map( (item,index) => {
			return <div className="linkPerson">
				<div className="title">
					<span className="info">
						<span>联系人</span><a href="javascript:" onClick={() => {this.deleteLink(index)}}>删除</a>
						<span className="line"></span>
					</span>
				</div>
				{/*<div>*/}
					<Form className="linkP">
						<FormItem
							label={item.name}
							required={true}
							validateStatus={error[index].errorName!=''?'error':'success'}
							help={error[index].errorName}>
								<Input className="linkInput"
										placeholder="请输入联系人"
									   maxlength="50"
									   value={link[index].name}
									   onChange={(e) => {this.handleName(e,index),this.changeLink('name',index)}}
								/>
						</FormItem>
						<FormItem
							label={item.phone}
							required={true}
							validateStatus={error[index].errorMobile!=''?'error':'success'}
							help={error[index].errorMobile}>
							<Input  className="linkInput"
									placeholder="请输入手机号码"
									maxlength="11"
									value={link[index].mobile}
									onChange={(e) => {this.handleMobile(e,index),this.changeLink('mobile',index)}}
							/>
						</FormItem>
						<FormItem label={item.job}  required={true}>
							<Select placeholder="请选择职位"
									className="selectJob"
									value={link[index].position}
									onChange={(e) => {this.handlePosition(e,index),this.changeLink('position',index)}}
							>
								{
									job&&job.map(item => {
										return <Option value={item.id}>{item.name}</Option>
									})
								}
							</Select>
						</FormItem>
					</Form>
				{/*</div>*/}

			</div>
		})

		// return <AddLinkPerson
		// 	getPerson = {this.getPerson}
		// />
	}

	/*****************************新增联系人 end**************************************/

	
	save = async () => {
		if (this.clickStatus) return
		this.clickStatus = true
		const form = this.metaAction.gf('data.form').toJS()
        const area = this.metaAction.gf('data.area').toJS()
		const agree = this.metaAction.gf('data.isEnable')
		const ifdlmm = this.metaAction.gf('data.ifdlmm')
		const ifgssmmm = this.metaAction.gf('data.ifgssmmm')
		const ifgssbmm = this.metaAction.gf('data.ifgssbmm')
		const ifbjblrmm = this.metaAction.gf('data.ifbjblrmm')
		let provincial = this.metaAction.gf('data.area.registeredProvincial')
		let city = this.metaAction.gf('data.area.registeredCity')
		console.log(form,form)
		// console.log(ifdlmm,'qq')
		// console.log(ifgssmmm,'ww')
		// console.log(ifgssbmm,'ee')
        if(this.component.props.active == 'details'){
            let gssbmm = form.gssbmm1
            let gssmmm = form.gssmmm1
            debugger
            if(!form.gssbmm){
                form.gssbmm = gssbmm
            }
            if(!form.gssmmm){
            	form.gssmmm = gssmmm
			}
        }
		console.log(',,,,',agree)
		if (!agree) {
			debugger
			this.metaAction.toast('warn', '请同意《服务协议条款》')
			this.clickStatus = false
			return false
		}

		let ok = null
		if(provincial == '110000' || provincial == '370000' || provincial == '440000' || provincial == '520000' || provincial == '630000' || provincial == '350000' || city == '210200'){
            if(form.dlfs == '7'){
                if(form.gsdlfs == '1'){
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.sfz', value: form.sfz
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.gssmzh', value: form.gssmzh
                        },{
                            path: 'data.form.gssmmm', value: form.gssmmm
                        },{
                            path: 'data.form.bjblrxm', value: form.bjblrxm
                        },{
                            path: 'data.form.bjblrsf', value: form.bjblrsf
                        },{
                            path: 'data.form.bjblrsjh', value: form.bjblrsjh
                        },{
                            path: 'data.form.bjblrmm', value: form.bjblrmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
                else if(form.gsdlfs == '2'){
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.sfz', value: form.sfz
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.gssbmm', value: form.gssbmm
                        },{
                            path: 'data.form.bjblrxm', value: form.bjblrxm
                        },{
                            path: 'data.form.bjblrsf', value: form.bjblrsf
                        },{
                            path: 'data.form.bjblrsjh', value: form.bjblrsjh
                        },{
                            path: 'data.form.bjblrmm', value: form.bjblrmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
                else {
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.sfz', value: form.sfz
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.bjblrxm', value: form.bjblrxm
                        },{
                            path: 'data.form.bjblrsf', value: form.bjblrsf
                        },{
                            path: 'data.form.bjblrsjh', value: form.bjblrsjh
                        },{
                            path: 'data.form.bjblrmm', value: form.bjblrmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
            }
            else if(form.dlfs == '8' && form.gsdlfs == '3'){
                ok = await this.voucherAction.check([
                    {
                        path: 'data.form.name', value: form.name
                    },{
                        path: 'data.form.areaCode', value: form.areaCode
                    },
                    // {
                    // 	path: 'data.form.dlzh', value: form.dlzh
                    // },{
                    // 	path: 'data.form.dlmm', value: form.dlmm
                    // },
                    // {
                    // 	path: 'data.form.linkName', value: form.linkName
                    // },{
                    // 	path: 'data.form.linkTel', value: form.linkTel
                    // },{
                    // 	path: 'data.form.position', value: form.position
                    // }
                ], this.check)
            }
            else {
                if(form.gsdlfs == '1'){
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.gssmzh', value: form.gssmzh
                        },{
                            path: 'data.form.gssmmm', value: form.gssmmm
                        },{
                            path: 'data.form.bjblrxm', value: form.bjblrxm
                        },{
                            path: 'data.form.bjblrsf', value: form.bjblrsf
                        },{
                            path: 'data.form.bjblrsjh', value: form.bjblrsjh
                        },{
                            path: 'data.form.bjblrmm', value: form.bjblrmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
                else if(form.gsdlfs == '2'){
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.gssbmm', value: form.gssbmm
                        },{
                            path: 'data.form.bjblrxm', value: form.bjblrxm
                        },{
                            path: 'data.form.bjblrsf', value: form.bjblrsf
                        },{
                            path: 'data.form.bjblrsjh', value: form.bjblrsjh
                        },{
                            path: 'data.form.bjblrmm', value: form.bjblrmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
                else {
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.bjblrxm', value: form.bjblrxm
                        },{
                            path: 'data.form.bjblrsf', value: form.bjblrsf
                        },{
                            path: 'data.form.bjblrsjh', value: form.bjblrsjh
                        },{
                            path: 'data.form.bjblrmm', value: form.bjblrmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
            }
		}else {
            if(form.dlfs == '7'){//
                if(form.gsdlfs == '1'){
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.sfz', value: form.sfz
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.gssmzh', value: form.gssmzh
                        },{
                            path: 'data.form.gssmmm', value: form.gssmmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
                else if(form.gsdlfs == '2'){
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.sfz', value: form.sfz
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.gssbmm', value: form.gssbmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
                else {
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.sfz', value: form.sfz
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
            }
            else if(form.dlfs == '9'){
                if(form.gsdlfs == '1'){
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },
                        // {
                        //     path: 'data.form.dlzh', value: form.dlzh
                        // },
                        // {
                        //     path: 'data.form.sfz', value: form.sfz
                        // },
                        {
                            path: 'data.form.bjblrsf', value: form.bjblrsf
                        },{
                            path: 'data.form.bjblrsjh', value: form.bjblrsjh
                        },
						{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.gssmzh', value: form.gssmzh
                        },{
                            path: 'data.form.gssmmm', value: form.gssmmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
                else if(form.gsdlfs == '2'){
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },
                        // {
                        //     path: 'data.form.dlzh', value: form.dlzh
                        // },{
                        //     path: 'data.form.sfz', value: form.sfz
                        // },
                        {
                            path: 'data.form.bjblrsf', value: form.bjblrsf
                        },{
                            path: 'data.form.bjblrsjh', value: form.bjblrsjh
                        },
						{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.gssbmm', value: form.gssbmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
                else {
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },
                        // {
                        //     path: 'data.form.dlzh', value: form.dlzh
                        // },{
                        //     path: 'data.form.sfz', value: form.sfz
                        // },
                        {
                            path: 'data.form.bjblrsf', value: form.bjblrsf
                        },{
                            path: 'data.form.bjblrsjh', value: form.bjblrsjh
                        },
						{
                            path: 'data.form.dlmm', value: form.dlmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
			}
            else if(form.dlfs == '8' && form.gsdlfs == '3'){
                ok = await this.voucherAction.check([
                    {
                        path: 'data.form.name', value: form.name
                    },{
                        path: 'data.form.areaCode', value: form.areaCode
                    },
                    // {
                    // 	path: 'data.form.dlzh', value: form.dlzh
                    // },{
                    // 	path: 'data.form.dlmm', value: form.dlmm
                    // },
                    // {
                    // 	path: 'data.form.linkName', value: form.linkName
                    // },{
                    // 	path: 'data.form.linkTel', value: form.linkTel
                    // },{
                    // 	path: 'data.form.position', value: form.position
                    // }
                ], this.check)
            }
            else {
                if(form.gsdlfs == '1'){
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.gssmzh', value: form.gssmzh
                        },{
                            path: 'data.form.gssmmm', value: form.gssmmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
                else if(form.gsdlfs == '2'){
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },{
                            path: 'data.form.gssbmm', value: form.gssbmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
                else {
                    ok = await this.voucherAction.check([
                        {
                            path: 'data.form.name', value: form.name
                        },{
                            path: 'data.form.nsrsbh', value: form.nsrsbh
                        },{
                            path: 'data.form.areaCode', value: form.areaCode
                        },{
                            path: 'data.form.dlzh', value: form.dlzh
                        },{
                            path: 'data.form.dlmm', value: form.dlmm
                        },
                        // {
                        // 	path: 'data.form.linkName', value: form.linkName
                        // },{
                        // 	path: 'data.form.linkTel', value: form.linkTel
                        // },{
                        // 	path: 'data.form.position', value: form.position
                        // }
                    ], this.check)
                }
            }
		}
		// if(form.dlfs == '7'){
         //    if(form.gsdlfs == '1'){
         //        ok = await this.voucherAction.check([
         //            {
         //                path: 'data.form.name', value: form.name
         //            },{
         //                path: 'data.form.nsrsbh', value: form.nsrsbh
         //            },{
         //                path: 'data.form.areaCode', value: form.areaCode
         //            },{
         //                path: 'data.form.dlzh', value: form.dlzh
         //            },{
         //                path: 'data.form.sfz', value: form.sfz
         //            },{
         //                path: 'data.form.dlmm', value: form.dlmm
         //            },{
         //                path: 'data.form.gssmzh', value: form.gssmzh
         //            },{
         //                path: 'data.form.gssmmm', value: form.gssmmm
         //            },
         //            // {
         //            // 	path: 'data.form.linkName', value: form.linkName
         //            // },{
         //            // 	path: 'data.form.linkTel', value: form.linkTel
         //            // },{
         //            // 	path: 'data.form.position', value: form.position
         //            // }
         //        ], this.check)
         //    }
         //    else if(form.gsdlfs == '2'){
         //        ok = await this.voucherAction.check([
         //            {
         //                path: 'data.form.name', value: form.name
         //            },{
         //                path: 'data.form.nsrsbh', value: form.nsrsbh
         //            },{
         //                path: 'data.form.areaCode', value: form.areaCode
         //            },{
         //                path: 'data.form.dlzh', value: form.dlzh
         //            },{
         //                path: 'data.form.sfz', value: form.sfz
         //            },{
         //                path: 'data.form.dlmm', value: form.dlmm
         //            },{
         //                path: 'data.form.gssbmm', value: form.gssbmm
         //            },
         //            // {
         //            // 	path: 'data.form.linkName', value: form.linkName
         //            // },{
         //            // 	path: 'data.form.linkTel', value: form.linkTel
         //            // },{
         //            // 	path: 'data.form.position', value: form.position
         //            // }
         //        ], this.check)
         //    }
         //    else {
         //        ok = await this.voucherAction.check([
         //            {
         //                path: 'data.form.name', value: form.name
         //            },{
         //                path: 'data.form.nsrsbh', value: form.nsrsbh
         //            },{
         //                path: 'data.form.areaCode', value: form.areaCode
         //            },{
         //                path: 'data.form.dlzh', value: form.dlzh
         //            },{
         //                path: 'data.form.sfz', value: form.sfz
         //            },{
         //                path: 'data.form.dlmm', value: form.dlmm
         //            },
         //            // {
         //            // 	path: 'data.form.linkName', value: form.linkName
         //            // },{
         //            // 	path: 'data.form.linkTel', value: form.linkTel
         //            // },{
         //            // 	path: 'data.form.position', value: form.position
         //            // }
         //        ], this.check)
         //    }
		// }
		// else if(form.dlfs == '8' && form.gsdlfs == '3'){
		// 	ok = await this.voucherAction.check([
		// 		{
		// 			path: 'data.form.name', value: form.name
		// 		},{
		// 			path: 'data.form.areaCode', value: form.areaCode
		// 		},
		// 		// {
		// 		// 	path: 'data.form.dlzh', value: form.dlzh
		// 		// },{
		// 		// 	path: 'data.form.dlmm', value: form.dlmm
		// 		// },
		// 		// {
		// 		// 	path: 'data.form.linkName', value: form.linkName
		// 		// },{
		// 		// 	path: 'data.form.linkTel', value: form.linkTel
		// 		// },{
		// 		// 	path: 'data.form.position', value: form.position
		// 		// }
		// 	], this.check)
		// }
		// else {
         //    if(form.gsdlfs == '1'){
         //        ok = await this.voucherAction.check([
         //            {
         //                path: 'data.form.name', value: form.name
         //            },{
         //                path: 'data.form.nsrsbh', value: form.nsrsbh
         //            },{
         //                path: 'data.form.areaCode', value: form.areaCode
         //            },{
         //                path: 'data.form.dlzh', value: form.dlzh
         //            },{
         //                path: 'data.form.dlmm', value: form.dlmm
         //            },{
         //                path: 'data.form.gssmzh', value: form.gssmzh
         //            },{
         //                path: 'data.form.gssmmm', value: form.gssmmm
         //            },
         //            // {
         //            // 	path: 'data.form.linkName', value: form.linkName
         //            // },{
         //            // 	path: 'data.form.linkTel', value: form.linkTel
         //            // },{
         //            // 	path: 'data.form.position', value: form.position
         //            // }
         //        ], this.check)
         //    }
         //    else if(form.gsdlfs == '2'){
         //        ok = await this.voucherAction.check([
         //            {
         //                path: 'data.form.name', value: form.name
         //            },{
         //                path: 'data.form.nsrsbh', value: form.nsrsbh
         //            },{
         //                path: 'data.form.areaCode', value: form.areaCode
         //            },{
         //                path: 'data.form.dlzh', value: form.dlzh
         //            },{
         //                path: 'data.form.dlmm', value: form.dlmm
         //            },{
         //                path: 'data.form.gssbmm', value: form.gssbmm
         //            },
         //            // {
         //            // 	path: 'data.form.linkName', value: form.linkName
         //            // },{
         //            // 	path: 'data.form.linkTel', value: form.linkTel
         //            // },{
         //            // 	path: 'data.form.position', value: form.position
         //            // }
         //        ], this.check)
         //    }
         //    else {
         //        ok = await this.voucherAction.check([
         //            {
         //                path: 'data.form.name', value: form.name
         //            },{
         //                path: 'data.form.nsrsbh', value: form.nsrsbh
         //            },{
         //                path: 'data.form.areaCode', value: form.areaCode
         //            },{
         //                path: 'data.form.dlzh', value: form.dlzh
         //            },{
         //                path: 'data.form.dlmm', value: form.dlmm
         //            },
         //            // {
         //            // 	path: 'data.form.linkName', value: form.linkName
         //            // },{
         //            // 	path: 'data.form.linkTel', value: form.linkTel
         //            // },{
         //            // 	path: 'data.form.position', value: form.position
         //            // }
         //        ], this.check)
         //    }
		// }
		if (!ok) {
			debugger
			console.log('我是地区',form.areaCode);
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}
		let linkPer = this.metaAction.gf('data.form.contactsDto').toJS()
		let linkErr = this.metaAction.gf('data.linkError').toJS()
		let kk = true
		let link1 = await linkPer.forEach((item ,index)=>{
			debugger
			if(item.name == ''){
				linkErr[index].errorName = "请输入联系人姓名"
				this.metaAction.toast('warning', '请输入新增联系人姓名')
				console.log(linkErr)
				return kk = false
			}else if(item.mobile == ''){
				linkErr[index].errorMobile = "请输入联系人手机号"
				this.metaAction.toast('warning', '请输入新增联系人手机号')
				return kk = false
			}else if(item.mobile != '' && linkErr[index].errorMobile == '请输入正确的手机号'){
				linkErr[index].errorMobile = "请输入正确的手机号"
				this.metaAction.toast('warning', '请输入正确的手机号')
				return kk = false
			}
			else if(item.position == ''){
				linkErr[index].errorPosition = "请选择联系人职位"
				this.metaAction.toast('warning', '请选择新增联系人职位')
				return kk = false
			}
		})
		console.log('7777777',kk)
		if(!kk){
			debugger
			// this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}
		let response
		form.name = form.name ? form.name.trim() : ''
		form.helpCode = form.helpCode ? form.helpCode.trim() : ''
		form.nsrsbh = form.nsrsbh ? form.nsrsbh.trim() : ''
		form.dlfs = form.dlfs ? form.dlfs.trim() : ''//网报账号
		form.gsdlfs = form.gsdlfs ? form.gsdlfs.trim() : ''//个税账号
		form.dlzh =  form.dlfs != '7'?(form.dlzh ? form.dlzh.trim() : ''):form.dlzh+'#'+form.sfz
		form.dlmm = form.dlmm ? form.dlmm.trim() : ''
		form.gssmzh = form.gsdlfs == '1'?(form.gssmzh ? form.gssmzh.trim() : ''):''
		form.gssmmm = form.gsdlfs == '1'?(form.gssmmm ? form.gssmmm.trim() : ''):''
		form.gssbmm = form.gsdlfs != '3'?(form.gssbmm ? form.gssbmm.trim() : ''):''
		form.blr = form.blr ? form.blr.trim() : ''
		form.blrzj = form.blrzj ? form.blrzj.trim() : ''
		form.blrzjhm = form.blrzjhm ? form.blrzjhm.trim() : ''
		// form.linkName = form.linkName ? form.linkName : ''
		// form.linkTel = form.linkTel ? form.linkTel : ''
        form.sfdm = area.registeredProvincial?area.registeredProvincial:'';
        form.csdm = area.registeredCity?area.registeredCity:'';
        form.qxdm = area.registeredCounty?area.registeredCounty:'';
        // if(provincial == '110000' && form.dlfs != 8){
        	form.bjblrxm = form.bjblrxm ? form.bjblrxm.trim() : ''
        	form.bjblrsf = form.bjblrsf ? form.bjblrsf.trim() : ''
        	form.bjblrsjh = form.bjblrsjh ? form.bjblrsjh.trim() : ''
        	form.bjblrmm = form.bjblrmm ? form.bjblrmm.trim() : ''
		// }
        if(form.gsdlfs == '1'){
            form.gssbmm = '';
		}else if(form.gsdlfs == '2'){
            form.gssmzh = '';
            form.gssmmm = '';
		}else {
            form.gssmzh = '';
            form.gssmmm = '';
            form.gssbmm = '';

		}

		// form.isReturnValue = true
		// form.isLoadingDefaultAccount = false
		if (this.component.props.active == 'details') {
			form.id = this.component.props.id
			if(form.dlmm != ifdlmm){
				form.ifchangedlmm = 1
			}else{
                form.ifchangedlmm = 0
			}
            // if(provincial == '110000' && form.dlfs != 8){
				// debugger
                if(form.bjblrmm != ifbjblrmm){
                    form.ifchangebjblrmm = 1
                }else {
                    form.ifchangebjblrmm = 0
                }
			// }else {
             //    form.ifchangebjblrmm = 0
			// }
            if(form.gsdlfs == '1'){
				if(form.gssmmm != ifgssmmm){
                    form.ifchangegssmmm = 1;
                }else {
                    form.ifchangegssmmm = 0;
				}
                form.gssbmm = '';
            }else if(form.gsdlfs == '2'){
                if(form.gssbmm != ifgssbmm){
                    form.ifchangegssbmm = 1;
                }else {
                    form.ifchangegssbmm = 0;
                }
                form.gssmzh = '';
                form.gssmmm = '';
            }else {
                form.gssmzh = '';
                form.gssmmm = '';
                form.gssbmm = '';
                form.ifchangegssbmm = 0;
                form.ifchangegssmmm = 0;
            }
			response = await this.webapi.customer.update(form)
		} else {
			form.id = this.metaAction.gf('data.importId')
			response = await this.webapi.customer.create(form)
		}
		this.clickStatus = false
		if (response.success) {
            if(this.timer){
                clearInterval(this.timer)
            }
			if (response.insert) {
				let customerList = [];
				customerList.push(response.id);
;				await this.metaAction.modal('show', {
					title: '分配客户',
					className:'customer-assign-style',
                    width:620,
					children: this.metaAction.loadApp('ttk-es-app-customer-assign-modal', {
						store: this.component.props.store,
                        params:{
                            customerList:customerList,
                            type:'dg',
                        }
					})
				});
			}else {
				this.metaAction.toast('success', '保存成功')
				return response
			}
		} else {
            if(this.timer){
                clearInterval(this.timer)
            }
			this.metaAction.toast('error', response.message)
			return false
		}
	}

	changeCheck = (str) => {
		const form = this.metaAction.gf('data.form').toJS()
		switch (str){
			case 'name'://客户名称
				this.voucherAction.check([{
					path: 'data.form.name', value: form.name
				}], this.check);
				break;
			case 'helpCode'://助记码
				this.voucherAction.check([{
					path: 'data.form.helpCode', value: form.helpCode
				}], this.check);
				break;
			case 'areaCode'://所属区域
				this.voucherAction.check([{
					path: 'data.form.areaCode', value: form.areaCode
				}], this.check);
				break;
			case 'nsrsbh'://纳税人识别号
				this.voucherAction.check([{
					path: 'data.form.nsrsbh', value: form.nsrsbh
				}], this.check);
				break;
			case 'dlzh'://用户名
				this.voucherAction.check([{
					path: 'data.form.dlzh', value: form.dlzh
				}], this.check);
				break;case 'sfz'://身份证
				this.voucherAction.check([{
					path: 'data.form.sfz', value: form.sfz
				}], this.check);
				break;
			case 'dlmm'://用户名密码
				this.voucherAction.check([{
					path: 'data.form.dlmm', value: form.dlmm
				}], this.check);
				break;
			case 'gssmzh'://实名登录账号
				this.voucherAction.check([{
					path: 'data.form.gssmzh', value: form.gssmzh
				}], this.check);
				break;
            case 'gssmmm'://个税实名密码
                this.voucherAction.check([{
                    path: 'data.form.gssmmm', value: form.gssmmm
                }], this.check);
                break;	case 'gssbmm'://个税申报密码
                this.voucherAction.check([{
                    path: 'data.form.gssbmm', value: form.gssbmm
                }], this.check);
                break;
			case 'blr'://办理人
				this.voucherAction.check([{
					path: 'data.form.blr', value: form.blr
				}], this.check);
				break;
			case 'blrzjhm'://办理人证件号码
				this.voucherAction.check([{
					path: 'data.form.blrzjhm', value: form.blrzjhm
				}], this.check);
				break;
			case 'linkName'://联系人姓名
				this.voucherAction.check([{
					path: 'data.form.linkName', value: form.linkName
				}], this.check);
				break;
			case 'linkTel'://联系人手机号
				this.voucherAction.check([{
					path: 'data.form.linkTel', value: form.linkTel
				}], this.check);
				break;
			case 'position'://联系人职位
				this.voucherAction.check([{
					path: 'data.form.position', value: form.position
				}], this.check);
				break;
            case 'bjblrxm'://北京办理人姓名
                this.voucherAction.check([{
                    path: 'data.form.bjblrxm', value: form.bjblrxm
                }], this.check);
                break;
            case 'bjblrsf'://北京办理人身份
                this.voucherAction.check([{
                    path: 'data.form.bjblrsf', value: form.bjblrsf
                }], this.check);
                break;
            case 'bjblrsjh'://北京办理人手机号
                this.voucherAction.check([{
                    path: 'data.form.bjblrsjh', value: form.bjblrsjh
                }], this.check);
                break;
            case 'bjblrmm'://北京办理人登录密码
                this.voucherAction.check([{
                    path: 'data.form.bjblrmm', value: form.bjblrmm
                }], this.check);
                break;
		}
	}

	check = async (option) => {
		let reg = /^[0-9a-zA-Z]+$/;
		let form = this.metaAction.gf('data.form').toJS();
		console.log(form,'form')
		let msg = '';
		let sf = '';
		// let mmts = '';
		let sjhts = ''
		if(form.dlfs == 5){
			msg = '请输入验证码'
		}else {
			msg = '请输入密码'
		}
		if(form.dlfs == 9){
			sf = '请选择登录身份';
			msg = '请输入登录密码';
			sjhts = '请输入登录手机号'
		}else {
			sf = '请选择人员身份';
            sjhts = '请输入办理人员手机号'
		}
		if (!option || !option.path)
			return
		if (option.path == 'data.form.helpCode') {//助记码
			return {errorPath: 'data.other.error.helpCode', message: option.value && option.value.trim() ? (!reg.test(option.value) ? '助记码只能是数字和字母' : "") : ''}
		}
		 if (option.path == 'data.form.name') {//客户名称
			return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : '请输入名称'}
		} else if (option.path == 'data.form.areaCode') {//所属区域
			 return {errorPath: 'data.other.error.areaCode', message: option.value === null ? '请选择所属区域' : ''}
		 }
		 else if (option.path == 'data.form.nsrsbh') {//纳税人识别号
			return {errorPath: 'data.other.error.nsrsbh', message: option.value ?(!reg.test(option.value) ? '纳税人识别号只能是数字和字母' : (option.value && (option.value.length == 20 || option.value.length == 15 || option.value.length == 18)) ? '' : '税号应为15，18或20位'): ((form.dlfs == 8 && form.gsdlfs == 3) ? '' : '请输入纳税人识别号')}
		} else if (option.path == 'data.form.linkName') {//联系人姓名
			return {errorPath: 'data.other.error.linkName', message: option.value && option.value.trim() ? (option.value.trim().length > 50 ? '联系人最大长度为50个字符' : "") : '请输入联系人姓名'}
		} else if (option.path == 'data.form.linkTel') {//联系人手机号
			return {errorPath: 'data.other.error.linkTel', message: option.value &&option.value.trim() ?( !/^1(3|4|5|6|7|8|9)\d{9}$/.test(option.value) ? '请输入正确的手机号' : "") : '请输入联系人手机号'}
		}else if (option.path == 'data.form.position') {//联系人职位
			 return {errorPath: 'data.other.error.position', message: option.value === undefined ? '请选择联系人职位' : ''}
		 }
		else if (option.path == 'data.form.dlzh') {//用户名
			return {errorPath: 'data.other.error.dlzh', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : '请输入账户名称'}
		}
		else if (option.path == 'data.form.sfz') {//身份证
			return {errorPath: 'data.other.error.sfz', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : '请输入身份证'}
		}
		else if (option.path == 'data.form.dlmm') {//用户名密码
			return {errorPath: 'data.other.error.dlmm', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : msg}
		}
		else if (option.path == 'data.form.gssmzh') {//个税实名登录账号
			return {errorPath: 'data.other.error.gssmzh', message: option.value && option.value.trim() ? (option.value.trim().length > 50 ? '账号最大长度为50个字符' : "") : '请输入证件号/手机号/用户名'}
		}else if (option.path == 'data.form.gssmmm') {//个税实名密码
			return {errorPath: 'data.other.error.gssmmm', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : '请输入密码'}
		}else if (option.path == 'data.form.gssbmm') {//个税申报密码
			return {errorPath: 'data.other.error.gssbmm', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : '请输入密码'}
		}else if (option.path == 'data.form.bjblrxm') {//北京办税人账号密码姓名
             return {errorPath: 'data.other.error.bjblrxm', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '姓名最大长度为200个字符' : "") : '请输入姓名'}
         }else if (option.path == 'data.form.bjblrsf') {//北京办税人账号密码身份
             return {errorPath: 'data.other.error.bjblrsf', message: option.value === undefined ? sf : ''}
         }else if (option.path == 'data.form.bjblrsjh') {//北京办税人账号密码手机号
             return {errorPath: 'data.other.error.bjblrsjh', message: option.value &&option.value.trim() ?( !/^1(3|4|5|6|7|8|9)\d{9}$/.test(option.value) ? '请输入正确的手机号' : "") : sjhts}
         }else if (option.path == 'data.form.bjblrmm') {//北京办税人账号密码登录密码
             return {errorPath: 'data.other.error.bjblrmm', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : '请输入密码'}
         }
		// else if (option.path == 'data.form.blr') {//办理人
		// 	return {errorPath: 'data.other.error.blr', message: option.value && option.value.trim().length > 200 ? '备注最大长度为200个字符' : ""}
		// }
		// else if (option.path == 'data.form.blrzjhm') {//办理人证件号码
		// 	return {errorPath: 'data.other.error.blrzjhm', message: option.value && option.value.trim().length > 200 ? '备注最大长度为200个字符' : ""}
		// }
	}

	fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check)
	}
	nameChange =  (name) => {
		this.injections.reduce('updateSingle', 'data.form.name',name)
		this.changeCheck('name');
		// this.payableAccountChange(name)
	}

  subjectListOption = () => {
      const data = this.metaAction.gf('data.other.glAccounts') && this.metaAction.gf('data.other.glAccounts').toJS()

      if (data) {
          return data.map(d => <Option title={d.codeAndName} key={d.id} value={d.id} style={{'font-size': '12px', 'height': '36px', 'line-height': '26px'}}>{d.codeAndName}</Option>)
      }
  }



  changeDLFS = async (e) =>{
	  this.injections.reduce('updateSingle', 'data.form.dlfs',e.target.value)
	  let rr = this.metaAction.gf('data.form.dlfs')
	  console.log('??????',rr)
	  if (this.component.props.active == 'details'){
	  		if(rr == 1){//登录方式为CA
	  			//调查询是否有ca信息接口
				let orgid = this.metaAction.gf('data.orgId');
				let id = this.component.props.id;
				let data = {};
				data.id = id;
				data.orgId = orgid;
				let res = await this.webapi.CAState.queryisCA(data);
				if(res){
					if(res.exist){//存在CA
						// debugger
						console.log('我是登录方式',res.exist)
						this.injections.reduce('updateObj', {
							'data.other.readSuc': true,
							'data.isEdit':'222'
						})//更换证书
					}else {
						console.log('我是登录方式',res.exist)
						this.injections.reduce('updateObj', {
							'data.other.readSuc': false,
							'data.isEdit':'333'
						})//采集证书
					}

				}else {
				}

			}
	  }else {

	  }
}

    changeGSDLFS = async (e) =>{
		this.injections.reduce('updateSingle', 'data.form.gsdlfs',e.target.value)
	}

  /*********************CA证书相关 Begin*******************/
	//下载CA证书
	downloadCACertifacate = async () => {
		let platform = window.navigator.platform
		if (platform.toUpperCase().indexOf("WIN") == -1) {
			await this.metaAction.modal('warning', {
				content: 'CA登录只支持windows系统',
				title: '提示',
				okText: '确定'
			})
			return
		}
		let url = await this.webapi.CAState.getToolUrl();
		//let url = "https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/CATool.exe";
		if (url) {
			let iframeObject = document.getElementById('downloadExe');
			if (iframeObject) {
				iframeObject.src = url;
			}
			else {
				let iframe = document.createElement('iframe');
				iframe.id = 'downloadExe';
				iframe.frameborder = "0";
				iframe.style.width = "0px"
				iframe.style.height = "0px"
				iframe.src = url;
				document.body.appendChild(iframe);
			}

		}
	}
   
	//唤起CA工具
    openCATool = async () => {
		//定时器里有个轮询 读完企业信息会返回true 这个延时器就会关掉
        clearTimeout(this.timer)
		
		let basic = this.metaAction.gf('data.form').toJS()
	
        const info = await this.voucherAction.check([{
            path: 'data.form.name', value: basic.name
        }, {
            path: 'data.form.nsrsbh', value: basic.nsrsbh
        }, {
            path: 'data.form.areaCode', value: basic.areaCode
		}], this.check)

        if (!info) {
            if (!basic.name || !basic.nsrsbh) {
                const res = await this.metaAction.modal('warning', {
                    title: '提示',
                    content: '请录入正确的纳税人识别号或企业名称',
                    okText: '确定'
                })

            }
            return
		}
		
        let vatTaxpayerNum = this.metaAction.gf('data.form.nsrsbh'),
		//ss = this.metaAction.gf('data.form.areaCode'),
		ss ='11',//北京市areacode代码
        //areaCode = this.metaAction.gf('data.form.areaCode').toJS(),//110000北京市
        name = this.metaAction.gf('data.form.name'),
		area='北京市',
		// importid = await this.webapi.CAState.getImportid(),//
		importid = this.metaAction.gf('data.importId'),//客户orgid新增时
		orgid = this.metaAction.gf('data.orgId'),//客户orgid编辑时
		currentOrg = this.metaAction.context.get("currentOrg")
		console.log(currentOrg);
		let dzorgid=currentOrg.id//中介ID，北京CA的同事老是拧不过弯来，所以这个参数对应orgid，传给他代理记账公司的ID

		let a = document.querySelector('#caHype')
		let env = appBasicInfo.apiDomain + '/v1'//开发环境动态获取暂不好用
		// let env = window.location.protocol+"//"+window.location.host + '/v1'//开发环境动态获取暂不好用;
		console.log('yyyyyy',env)
		// console.log('uuuuuu',env)
		// let env = 'http://api.dev.aierp.cn:8089/v1'
        // if(env.indexOf('https') > -1) {
        //     env = env.replace('https', 'http')
		// }
		if(this.component.props.active == 'details') {
			let isEdit = this.metaAction.gf('data.isEdit')
			console.log('isEdit',isEdit)

			if(isEdit == '222'){//CA存在编辑
				let gg = this.metaAction.gf('data.orgId')
				this.injections.reduce('updateSingle', 'data.CAState',gg)
				let testss=`ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&orgId=${orgid}`;
				console.log(testss);

				a.setAttribute('href', `ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&orgId=${orgid}`)
			}
			else if(isEdit == '333'){//不存在CA新增
				let gg = this.component.props.id;//取主键ID
				// let gg = importid;//蔡立科说这边查询ca的id改成生成的临时id
				this.injections.reduce('updateSingle', 'data.CAState',gg)
				let testss=`ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&importid=${gg}`;
				console.log(testss);

				a.setAttribute('href', `ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&importid=${gg}`)
			}

		}else {
			let testss=`ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&importid=${importid}`;
			console.log(testss);

			a.setAttribute('href', `ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&importid=${importid}`)
		}
	    a.click()
        this.queryCAState()
	}
	
	//查询CA状态
	queryCAState = async () => {
		let data = {};
		if(this.component.props.active == 'details'){
			let orgid = this.metaAction.gf('data.orgId');
			let id = this.component.props.id;
			data.id = id;
			data.orgId = orgid;
		}else {
			let id2 = this.metaAction.gf('data.importId');
			data.id = id2
		}

        //如果当前的登录方式为CA登录时轮询
        let result = await this.webapi.CAState.queryisCA(data)
		if(result){
			if(result.exist){
				this.injections.reduce('updateObj', {
					'data.other.CAStep': false,
					'data.other.hasReadCA': true,
					'data.other.readSuc':true
				})
				// this.readOrgInfoBtnState()
			}else {
				this.timer = setTimeout(this.queryCAState, 2000)
			}
		}else {
			this.timer = setTimeout(this.queryCAState, 2000)
		}
        // if (!result) {
        //     this.timer = setTimeout(this.queryCAState, 2000)
        // } else {
        //     this.metaAction.sfs({
        //         'data.other.CAStep': false,
        //         'data.other.hasReadCA': true,
		// 		'data.other.readSuc':true,
        //     })
		//
        //     // this.readOrgInfoBtnState()
        // }
	}


	//读取证书名称和证书序列号
	queryCA = async () =>{
        let importId = this.metaAction.gf('data.CAState')
        let isEdit = this.metaAction.gf('data.isEdit')
        console.log('isEdit',isEdit)
        console.log(importId,'queryCA')
        let data = {}
        if(this.component.props.active == 'details'){//进入详情
        	if(isEdit == '222'){//存在ca登录方式后更换证书

				data.importId = '';
				data.orgId = importId;
			}
			else if (isEdit == '333'){//不是ca登录方式切换为ca登录

                data.importId = importId;
                data.orgId = '';
			}
		}else {
            data.importId = importId;
            data.orgId = '';
		}

		let ret = await this.webapi.CAState.queryCAName(data);
		if(ret){
			console.log(ret,'ppppp')
			let tt = fromJS(ret);
			this.metaAction.sf('data.tt',tt)
			let dd = this.metaAction.gf('data.tt').toJS()
			this.metaAction.sfs({
				'data.form.dlzh': this.metaAction.gf('data.form.name'),
				// 'data.form.dlmm': '77777'
				'data.form.dlmm': dd[0].caExpire
			})
		}
	}
	 //隐藏打开CA登录步骤
	changeCAStep = () => {
		this.injections.reduce('updateSingle', 'data.other.CAStep',!this.metaAction.gf('data.other.CAStep'))
	}
	
	 //更换ca证书
	 changeCA = async () => {
        let platform = window.navigator.platform
        if (platform.toUpperCase().indexOf("WIN") == -1) {
            await this.metaAction.modal('warning', {
                content: 'CA登录只支持windows系统',
                title: '提示',
                okText: '确定'
            })
            return
        }
        const result = await this.metaAction.modal('confirm', {
            title: '提示',
            content: 'CA证书已读取，更换证书将清空之前读取的企业信息，是否确认更换CA证书？',
        })
        if (result) {
            this.openCATool()
        }
	}
	
	IsChangeCA = () => {
        let readCA = this.metaAction.gf('data.other.hasReadCA')
        return readCA
	}


    onCancel = () => {
        if(this.timer){
            clearInterval(this.timer)
        }
    }
	
	//判断读取按钮状态
   /* readOrgInfoBtnState = () => {
        let dlfs = this.metaAction.gf('data.form.dlfs'),
            ss = this.metaAction.gf('data.basic.ss')
        if (!ss || !dlfs) {
            this.metaAction.sf('data.other.readOrgInfoBtn', true)
            return
        }
        if (dlfs != 1) {
            let wbzh = this.metaAction.gf('data.basic.wbzh'),
                wbmm = this.metaAction.gf('data.basic.wbmm')
            if (!wbzh || !wbmm) {
                this.metaAction.sf('data.other.readOrgInfoBtn', true)
            } else {
                this.metaAction.sf('data.other.readOrgInfoBtn', false)
            }
        } else {
            let hasReadCA = this.metaAction.gf('data.other.hasReadCA')
            //client下不需要判断是不是read ca
            //if (environment.isClientMode()) hasReadCA = true
            if (hasReadCA) {
                this.metaAction.sf('data.other.readOrgInfoBtn', false)
            } else {
                this.metaAction.sf('data.other.readOrgInfoBtn', true)
            }
        }
    }*/
  /*********************CA证书相关 End*******************/


  changeServiceType =(value)=> {
	  console.log(value)
	  let code = this.metaAction.gf('data.area.registeredCounty')
	  this.confirmRegisteredCounty(code)
	if(value == '001'){
		
	}else{

	}
  }
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({...option, metaAction}),
		o = new action({...option, metaAction, voucherAction}),
		ret = {...metaAction, ...voucherAction, ...o}
	metaAction.config({metaHandlers: ret})
	return ret
}
