export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: 'ttk-es-app-ztmanage-sms',
        children: [
            {
                name: 'tipsinfo',
                component: '::div',
                //className:'ttk-es-app-ztmanage-sms-tipsmain',
                children:[
                    {
						name:'tips1',
						component:'::div',
						children:[{
							name:'sptitle1',
							component:'::p',
							className:'ttk-es-app-ztmanage-sms-tips',
							children:"继续导账将删除企业数据，且不可恢复！"
						},{
							name:'sptitle2',
                            component:'::p',
                            className:'ttk-es-app-ztmanage-sms-wxtsmain',
							children:[
                                {
                                    name:'sptitle1',
                                    component:'::sapn',
                                    className:'ttk-es-app-ztmanage-sms-wxtsmain-wxtstitle',
                                    children:"温馨提示："
                                },
                                {
                                    name:'sptitle1',
                                    component:'::sapn',
                                    className:'ttk-es-app-ztmanage-sms-wxtsmain-wxtssmsg',
                                    children:"客户的业务、财务以及基础数据将被删除！"
                                }
                            ]
						} 
					   ]
					 }
                ]
            },
            {
            name: 'mobileItem',
            component: 'Form.Item',
            required: true,
            label: '手机号码：',
            children: {
                    name: 'mobile',
                    component: 'Input',
                    // maxlength: '50',
                    value: '{{data.form.mobile}}',
                    disabled:true
              }
            }, {
                name: 'imgCode',
                component: 'Form.Item',
                label: '图形验证码：',
                // className: 'edfx-app-forgot-password-form-imgCode',
                validateStatus: "{{data.other.error.imgCode?'error':'success'}}",
                required: true,
                help: '{{data.other.error.imgCode}}',
                children: [{
                    name: 'imgCode',
                    component: 'Input',
                    value: '{{data.form.imgCode}}',
                    placeholder: "请输入图形验证码",
                    type: 'text',
                    className: 'captchaInput',
                    // onFocus: "{{function(){$setField('data.other.error.imgCode',undefined)}}}",
                    // onChange: "{{function(e){$setField('data.form.imgCode',e.target.value)}}}",
                    // onBlur: `{{function(e){$fieldChange('data.form.imgCode',e.target.value, 'next')}}}`,
                    onFocus: "{{function(){$fieldChange('data.other.error.imgCode',undefined)}}}",
                    onChange: "{{function(e){$fieldChange('data.form.imgCode',e.target.value)}}}",
                    addonAfter:{
                        name: 'suffix',
                        component: '::span',
                        className: 'imgCode',
                        children:[{
                            name: 'suffix',
                            component: '::img',
                            style: {width: '100px'},
                            src:'{{data.other.imgCode}}'
                        },{
                            name: 'suffix',
                            component: '::a',
                            onClick:'{{$getImgCode}}',
                            style: {width: '50px'},
                            children:'换一张'
                        }]
                    }
                }]
            },
            {
                name: 'name',
                component: 'Form.Item',
                label: '验证码：',
                required: true,
                validateStatus: "{{data.other.error.name?'error':'success'}}",
                help: '{{data.other.error.name}}',
                children:[
                    {
                        name: 'name',
                        component: 'Input',
                        placeholder:'请输入验证码',
                        maxlength: '6',
                        style:{width:'212px'},
                        value: '{{data.form.name}}',
                        //onChange: `{{function(e){$sf('data.form.name',e.target.value);$changeCheck('name')}}}`,
                        type: 'captcha',
                        className: 'captchaInput',
                        onFocus: "{{function(){$fieldChange('data.other.error.name',undefined)}}}",
                        onChange: "{{function(e){$fieldChange('data.form.name',e.target.value)}}}",
                    },
                    {
                        name: 'btnyzm',
                        component: 'Button',
                        className: "{{!data.timeStaus?'btnyzm':null}}",
                        style:{marginLeft:'8px',textAglin:'center',width:'100px'},
                        onClick: '{{$getCaptcha}}',
						children: '{{data.time}}'//获取短信验证码
                    }
                ] 
           }
      ]
    }
}

export function getInitState() {
    return {
        data: {
            form: {
                mobile: '',
                name: '',
                captcha: ''
            },
            reLoginTime: 5,
			time: '获取验证码',
            timeStaus:true,
            other: {
                error: {}
            }
        }
    }
}
