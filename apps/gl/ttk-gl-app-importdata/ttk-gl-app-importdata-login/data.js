export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-importdata-login',
        // spinning: '{{data.other.loading}}',        
        children: [
                {
                    name: 'formLogin',
					component: 'Form',
					className: 'ttk-gl-app-importdata-login-content-form',
					onSubmit: '{{$login}}',
					children: [{
						name: 'item1',
						component: 'Form.Item',
						className: 'ttk-gl-app-importdata-login-content-form-title',
						style:{
							color: '#4f55bf',
							fontSize: '22px'
						},
						children: '在线导账'
					}, {
						name: 'item101',
                        component: 'Form.Item',
                        label: '厂商及版本',
						className: 'ttk-gl-app-importdata-login-content-form-mobile',
						children: [{
							name: 'inquiryMode',
							component: 'Select',
							placeholder: '请选择厂商及版本',
							className: 'headerDropDown',
							defaultValue:'{{data.selectTimeData ? data.selectTimeData[0]["name"] : undefined}}',
							value:'{{data.form.selectTimeTitle ? data.form.selectTimeTitle : undefined}}',
							onSelect: "{{function(d){$sf('data.form.selectTimeTitle',d)}}}",
							children: {
								 name: 'option',
								 component: 'Select.Option',
								 value: '{{data.selectTimeData ? data.selectTimeData[_rowIndex]["name"] : undefined}}',
								 children: '{{data.selectTimeData ? data.selectTimeData[_rowIndex]["name"] : undefined}}',
								 _power: 'for in data.selectTimeData'
							},
						}]
					},{
						name: 'item2',
                        component: 'Form.Item',
                        label: '账号',
                        validateStatus: "{{data.other.error.mobile?'error':'success'}}",
						help: '{{data.other.error.mobile}}',
						className: 'ttk-gl-app-importdata-login-content-form-mobile',
						children: [{
							name: 'mobile',
							component: 'Input',
							placeholder: '请输入您的账号',
							onFocus: "{{function(e){$setField('data.other.error.mobile', undefined)}}}",
							onChange: "{{function(e){$fieldChange('data.form.mobile', e.target.value)}}}",
							onBlur: "{{function(e){$fieldChange('data.form.mobile', e.target.value, 'login')}}}",
							value: '{{data.form.mobile}}',
						}]
					},{
						name: 'item7',
						component: 'Form.Item',
						style:{
							display: 'none'
						},
                        label: '密码',
						validateStatus: "{{data.other.error.password?'error':'success'}}",
						help: '{{data.other.error.password}}',
						className: 'ttk-gl-app-importdata-login-content-form-password',
						children: [{
							name: 'password',
							component: 'Input',
							placeholder: '请输入您的密码',
							type: 'password',
							onFocus: "{{function(e){$setField('data.other.error.password', undefined)}}}",
							onChange: `{{function(e){$setField('data.other.error.password', undefined);$setField('data.other.userInput', true);$setField('data.form.password', e.target.value)}}}`,
							onBlur: `{{function(e){$fieldChange('data.form.password', e.target.value)}}}`,
							value: '{{data.form.password}}',
						}]
					}, {
						name: 'item3',
                        component: 'Form.Item',
                        label: '密码',
						validateStatus: "{{data.other.error.password?'error':'success'}}",
						help: '{{data.other.error.password}}',
						className: 'ttk-gl-app-importdata-login-content-form-password',
						children: [{
							name: 'password',
							component: 'Input',
							placeholder: '请输入您的密码',
							type: 'password',
							autocomplete:"new-password",
							onFocus: "{{function(e){$setField('data.other.error.password', undefined)}}}",
							onChange: `{{function(e){$setField('data.other.error.password', undefined);$setField('data.other.userInput', true);$setField('data.form.password', e.target.value)}}}`,
							onBlur: `{{function(e){$fieldChange('data.form.password', e.target.value)}}}`,
							value: '{{data.form.password}}',
						}]
					},{
						name: 'item6',
						component: 'Form.Item',
						_visible:'{{$checkentErprise()}}',
                        label: '企业号',
                        validateStatus: "{{data.other.error.enterprise?'error':'success'}}",
						help: '{{data.other.error.enterprise}}',
						className: 'ttk-gl-app-importdata-login-content-form-mobile',
						children: [{
							name: 'enterprise',
							component: 'Input',
							placeholder: '请输入您的企业号',
							onFocus: "{{function(e){$setField('data.other.error.enterprise', undefined)}}}",
							onChange: "{{function(e){$fieldChange('data.form.enterprise', e.target.value)}}}",
							onBlur: "{{function(e){$fieldChange('data.form.enterprise', e.target.value, 'login')}}}",
							value: '{{data.form.enterprise}}',
						}]
					} ,{
                        name: 'item4',
                        component: 'Form.Item',
                        className: 'ttk-gl-app-importdata-login-content-form-more',
                        children: [{
                            name: 'remember',
                            component: 'Checkbox',
                            className: 'ttk-gl-app-importdata-login-content-form-more-remember',
                            checked: '{{data.form.remember}}',
                            onChange: `{{function(e){$fieldChange('data.form.remember', e.target.checked)}}}`,
                            children: '记住登陆信息'
                        }]
                    }, {
						name: 'item5',
						component: 'Form.Item',
						className: 'ttk-gl-app-importdata-login-content-form-login',
						children: [{
							name: 'loginBtn',
							component: 'Button',
							type: 'softly',
							disabled: '{{$checkLogin()}}',
							children: '登录',
							onClick: '{{$login}}'
						}]
					}]
                }
        ]
    }
}

export function getInitState() {
	return {
		data: {
			flag:1,//1显示，0不显示
			selectTimeData:[
				{
					name:'测试用例'
				},
				{
					name:'测试用例1'
				},
				{
					name:'测试用例2'
				},
				{
					name:'测试用例3'
				}
			],
			form: {
				
				account: '',
				password: '',
				enterprise:'',
				mobile: '',
				remember: false,
			},
			other: {
				error: {},
				selectedImgIndex: 0,
				imgs: [],
				userInput: false,
				checkTips: false,
				version: '',
			}
		}
	}
}



