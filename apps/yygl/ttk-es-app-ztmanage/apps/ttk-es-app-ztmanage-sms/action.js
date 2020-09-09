import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import config from './config'
import {FormDecorator} from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.voucherAction = option.voucherAction
		this.webapi = this.config.webapi
	}

	onInit = ({component, injections}) => {
		// console.log(this.voucherAction)
		this.voucherAction.onInit({component, injections})
		this.component = component
		this.injections = injections
		this.clickStatus = false
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
		injections.reduce('init')
		this.load()
	}

	componentWillUnmount = () => {
		if(this.timer){
            clearInterval(this.timer);
            this.timer = null;
		}
    }

	load = async () => {
		let data = {},user
		user =  this.metaAction.context.get('currentUser');
		data.mobile = user.mobile
		this.injections.reduce('load', data)
		this.getImgCode();
	}

	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		if (this.clickStatus) return
		this.clickStatus = true
		const form = this.metaAction.gf('data.form').toJS()

		const ok = await this.voucherAction.check([{
			path: 'data.form.name', value: form.name
		},{
			path: 'data.form.imgCode', value: form.imgCode
		}], this.check)
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}
		let response
		form.mobile = form.mobile ? form.mobile.trim() : ''
		form.name = form.name ? form.name.trim() : ''
		form.isReturnValue = true
		form.isLoadingDefaultAccount = false

		let sign = this.metaAction.gf('data.form.sign'),
			mobile = this.metaAction.gf('data.form.mobile'),
            params = {
            sign: sign,
			mobile: mobile,
			//captcha: captcha,
			//captcha: form.name//短信验证码
			smsCode: form.name//短信验证码
		}

		let isPass=await this.webapi.msg.validateMsg(params);

		if (!isPass){//短信验证不通过
			this.metaAction.toast('warning', '验证码输入错误，请重新输入。')
			this.clickStatus = false
			return false;
		}
		else{
            if(this.timer){
                clearInterval(this.timer)
            }
			return true;
		}


	}

	changeCheck = (str) => {
		const form = this.metaAction.gf('data.form').toJS()
		switch (str){
			case 'name':
				this.voucherAction.check([{
					path: 'data.form.name', value: form.name
				}], this.check);
				break;
		}
	}

	check = (option) => {
		if (!option || !option.path)
			return

		if (option.path == 'data.form.name') {
			return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '名称最大长度为100个字符' : "") : '请输入短信验证码'}
		}else if(option.path == 'data.form.imgCode') {
			return {errorPath: 'data.other.error.imgCode', message: option.value ? undefined: '请输入图形验证码'}
		}
	}

	fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check)
	}

	//获取短信验证码
	countDown = 60   //倒计时
    timer = null
    getCaptchaing = false
    getCaptcha = async () => {
		let imgCode = this.metaAction.gf('data.form.imgCode')
        if(!imgCode) {
            this.metaAction.sfs({ 'data.other.error.imgCode': "请输入图形验证码"})
            return
        }
        const captchaInput = document.querySelector('.captchaInput')
        if(!!captchaInput) {
            captchaInput.focus()
        }
        const mobile = this.metaAction.gf('data.form.mobile')
        if(mobile && !(/^1[3|4|5|6|7|8|9][0-9]\d{8}$/.test(mobile))){
            this.metaAction.sfs({'data.form.mobile': mobile, 'data.other.error.mobile': "请输入正确的手机号"})
            return false
        }
        if(this.getCaptchaing) return
        this.getCaptchaing = true
		this.injections.reduce('update',{path:'data.timeStaus',value:false});
        let that = this
        this.timer = setInterval(function() {
            if(that.countDown == 0) {
                that.clearTimer(true, '重新获取')
                return
            }
			// that.metaAction.sf('data.time', (--that.countDown)+'s')
			that.injections.reduce('update',{path:'data.time',value:(--that.countDown)+'s'});
        }, 1000)
        let params = {}
        params.mobile = this.metaAction.gf('data.form.mobile')
        //1: 注册 2:找回密码 3:修改手机号
        params.smsType = 2
		params.requestUrl = location.hostname
		params.captcha = this.metaAction.gf('data.form.imgCode')
        params.sign = this.metaAction.gf('data.other.sign')
        params.isReturnValue = true
        // if(/^127.|^172.|^192./.test(location.hostname)) {
        //     params.requestUrl = 'localhost'
        // }
		const captcha = await this.webapi.msg.sendMsg(params);
		this.getCaptchaing = false
		// console.log("captcha:::"+captcha);
		if (captcha && captcha.error) {
            let message = ''
            if (captcha.error.code == '50102') {
                this.metaAction.sfs({
                    'data.other.error.imgCode': captcha.error.message
                });
            }else if(captcha.error.code == 50027){
                message=  '呀,系统出现了点小问题,请稍后再试'
            }else {
                message = captcha.error.message
            }
            this.metaAction.sfs({
                'data.other.error.name': message
            });
            that.clearTimer(true, '重新获取')
            return
        }else{
			this.injections.reduce('update',{path:'data.form.sign',value:captcha});
            this.metaAction.toast('success', `验证码已经发送到您的手机`)
        }
	}

	//获取图形验证码
	getImgCode = async()=>{
		const response = await this.webapi.msg.getImgCode();
        if(response){
            this.injections.reduce('initImageCode', response)
        }
    }

	//清除定时器
    clearTimer = function(staus, remind) {
        this.metaAction.sfs({
			'data.timeStaus':true,
            'data.time':remind
        })
        this.countDown = 60
        this.getCaptchaing = false
        clearInterval(this.timer)
	}

	//验证码校验
	checkCaptcha = async (captcha) => {
        var message
        let sign = this.metaAction.gf('data.form.sign')
        let mobile = this.metaAction.gf('data.form.mobile')
        let params = {
            sign: sign,
            mobile: mobile,
            captcha: captcha
        }

        if (!captcha)
            message = '请输入验证码'
        else if (!(await this.webapi.msg.validateMsg(params))){
			message = '验证码输入错误'
		}
		else{
			message=true
		}
		// debugger
		return  message
    }

    onCancel = () => {
        if(this.timer){
            clearInterval(this.timer)
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
