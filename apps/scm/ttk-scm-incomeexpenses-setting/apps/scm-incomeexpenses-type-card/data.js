import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'scm-incomeexpenses-type-card',
        children: {
            name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
            spinning: '{{data.other.loading}}',
            children:{
                name: 'form',
                component: 'Form',
				className: 'scm-incomeexpenses-type-card-form',
                children: [{
					name: 'top',
					component: '::div',
					className: 'scm-incomeexpenses-type-card-form-top',
					children: [{
						name: 'codeItem',
						component: 'Form.Item',
						label: '编码',
						required: true,
						validateStatus: "{{data.other.error.code?'error':'success'}}",
						help: '{{data.other.error.code}}',
						children: [{
							name: 'code',
							component: 'Input',
							value: '{{data.form.code}}',
							onChange: "{{function(e){$fieldChange('data.form.code',e.target.value);}}}"
						}]
			
					}, {
						name: 'nameItem',
						component: 'Form.Item',
						label: '收款大类',
						required: true,
						validateStatus: "{{data.other.error.name?'error':'success'}}",
						help: '{{data.other.error.name}}',
						children: [{
							name: 'name',
							component: 'Input',
							maxlength: '200',
							value: '{{data.form.name}}',
							onChange: `{{function(e){$fieldChange('data.form.name',e.target.value);}}}`,
						}]
					}]
				},{
					name: 'footer',
					component: '::div',
					className: 'footer',
					children: [{
						name: 'btnGroup',
						component: '::div',
						className: 'btnGroup',
						children: [{
							name: 'cancel',
							component: 'Button',
							className: 'btnGroup-item',
							children: '取消',
							onClick: '{{$onCancel}}'
						}, {
							name: 'confirm',
							component: 'Button',
							className: 'btnGroup-item',
							type: "primary",
							children: "保存",
							onClick: "{{function(e){$onOk('save')}}}"
						}]
					}]
				}]
            }
        }
    }
}

export function getInitState() {
	return {
		data: {
			form: {},
			other: {
				error: {},
				loading: false,
			},
			error: {}
		}
	}
}
