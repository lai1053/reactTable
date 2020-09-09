export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className:'edfx-app-my-setting-xdz-change-password',
		children: {
			name: 'form',
			component: 'Form',
			className: 'changePassword',
			children: [{
				name: 'oldPassword',
				component: 'Form.Item',
				colon: false,
				label: '请输入旧密码',
				validateStatus: "{{data.error.oldPassword?'error':'success'}}",
				help: '{{data.error.oldPassword}}',
				children: {
					name: 'input',
					component: 'Input',
					type: 'password',
					value: '{{data.form.oldPassword}}',
					style: {width: '270px', height:'30px'},
					onFocus: '{{function() {$setField("data.error.oldPassword",undefined)}}}',
					onBlur: `{{function (e){$fieldChange('data.form.oldPassword',e.target.value)}}}`,
				}
			}, {
				name: 'password',
				component: 'Form.Item',
				colon: false,
				label: '请输入新密码',
				validateStatus: "{{data.error.password?'error':'success'}}",
				help: '{{data.error.password}}',
				children: {
					name: 'input',
					type: 'password',
					value: '{{data.form.password}}',
					placeholder: '6-20位必须包含大写字母、小写字母和数字',
					component: 'Input',
					style: {width: '270px', height:'30px'},
					onChange: `{{function(e){$setField('data.form.password',e.target.value)}}}`,
					onFocus: '{{function() {$setField("data.error.password",undefined)}}}',
					onBlur: `{{function (e){$fieldChange('data.form.password',e.target.value)}}}`,
				}
			}, {
				name: 'rePassword',
				component: 'Form.Item',
				colon: false,
				label: '请确认新密码',
				validateStatus: "{{data.error.rePassword?'error':'success'}}",
				help: '{{data.error.rePassword}}',
				children: {
					name: 'input',
					value: '{{data.form.rePassword}}',
					placeholder: "确认新密码",
					type: 'password',
					component: 'Input',
					style: {width: '270px', height:'30px'},
					onChange: `{{function(e){$setField('data.form.rePassword',e.target.value)}}}`,
					onFocus: '{{function() {$setField("data.error.rePassword",undefined)}}}',
					onBlur: `{{function (e){$fieldChange('data.form.rePassword',e.target.value)}}}`,
				}
			}]
		}
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				oldPassword: '',
				password: '',
				rePassword: ''
			},
			error: {
				oldPassword: '',
				password: '',
				rePassword: ''
			}
		}
	}
}