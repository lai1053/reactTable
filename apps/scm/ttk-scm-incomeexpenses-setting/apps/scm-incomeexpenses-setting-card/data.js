import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'scm-incomeexpenses-setting-card',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: {
				name: 'form',
				component: 'Form',
				className: 'scm-incomeexpenses-setting-card-form',
				children: [{
					name: 'top',
					component: '::div',
					className: 'scm-incomeexpenses-setting-card-form-top',
					children: [{
						name: 'codeItem',
						component: 'Form.Item',
						label: '编码',
						required: true,
						validateStatus: "{{data.other.error.code?'error':'success'}}",
						help: '{{data.other.error.code}}',
						_visible: '{{$getCodeVisible()}}',
						children: [{
							name: 'code',
							component: 'Input',
							timeout: true,
							disabled: '{{$getAddOrEdit()}}',
							value: '{{data.form.code}}',
							onChange: "{{function(e){$fieldChange('data.form.code',e.target.value);}}}"
						}]

					}, {
						name: 'receivables',
						component: 'Form.Item',
						label: '{{data.other.incomeexpensesTabId == "3001002" ? "收款大类" : "付款大类"}}',
						required: true,
						validateStatus: "{{data.other.error.receivables?'error':'success'}}",
						help: '{{data.other.error.receivables}}',
						_visible: '{{data.other.incomeexpensesTabId == "3001002" || data.other.incomeexpensesTabId == "3001001"}}',
						children: [{
							name: 'receivables',
							component: 'Select',
							showSearch: false,
							value: '{{data.form.receivables && data.form.receivables.id}}',
							title: '{{data.form.receivables && data.form.receivables.id}}',
							onChange: `{{function(v){$fieldChange('data.form.receivables',data.other.receivables.filter(function(o){return o.id == v})[0])}}}`,
							children: {
								name: 'option',
								component: 'Select.Option',
								value: '{{data.other.receivables && data.other.receivables[_rowIndex].id }}',
								children: '{{data.other.receivables && data.other.receivables[_rowIndex].name }}',
								title: '{{data.other.receivables && data.other.receivables[_rowIndex].name }}',
								_power: 'for in data.other.receivables'
							}
						}, {
							name: 'edit',
							className: 'edit',
							component: '::a',
							children: '编辑',
							onClick: "{{$editClick}}"
						}]
					}, {
						name: 'businessName',
						component: 'Form.Item',
						label: '{{$getTypeName1()}}',
						required: true,
						_visible: '{{data.other.incomeexpensesTabId == "3000000" || data.other.incomeexpensesTabId == "4000000"}}',
						children: [{
							name: 'businessName',
							component: 'Input',
							timeout: true,
							maxlength: '200',
							disabled: '{{$getAddOrEdit()}}',
							value: '{{data.form.businessName}}',
							title: '{{data.form.businessName}}'
						}]
					}, {
						name: 'nameItem',
						component: 'Form.Item',
						label: '{{$getTypeName()}}',
						required: true,
						_visible: '{{$taxMethod()}}',
						validateStatus: "{{data.other.error.name?'error':'success'}}",
						help: '{{data.other.error.name}}',
						children: [{
							name: 'name',
							component: 'Input',
							timeout: true,
							maxlength: '200',
							disabled: '{{$getAddOrEdit()}}',
							value: '{{data.form.name}}',
							title: '{{data.form.name}}',
							onChange: `{{function(e){$fieldChange('data.form.name',e.target.value);}}}`,
						}]
					},
					{
						name: 'defaultProject',
						component: 'Form.Item',
						label: '默认关联科目',
						required: true,
						_visible: '{{!$isTplus()}}',
						validateStatus: "{{data.other.error.defaultProject?'error':'success'}}",
						help: '{{data.other.error.defaultProject}}',
						children: [{
							name: 'defaultProject',
							component: 'Select',
							showSearch: '{{true}}',
							dropdownClassName: 'scm-incomeexpenses-setting-card-selectStyle',
							filterOption: '{{$filterOption}}',
							value: '{{data.form.defaultProject && data.form.defaultProject.code}}',
							onChange: `{{function(v){$fieldChange('data.form.defaultProject',data.other.defaultProject.filter(function(o){return o.code == v})[0])}}}`,
							children: '{{$subjectListOption()}}'
						}]
					},
					{
						name: 'defaultProject+',
						component: 'Form.Item',
						_visible: '{{$isTplus()}}',
						label: '{{data.other.softAppName+"科目"}}',
						required: true,
						validateStatus: "{{data.other.error.defaultProject?'error':'success'}}",
						help: '{{data.other.error.defaultProject}}',
						children: [{
							name: 'defaultProject+',
							component: 'Select',
							showSearch: '{{true}}',
							filterOption: '{{$filterOption}}',
							value: '{{data.form.defaultProject && data.form.defaultProject.code}}',
							onChange: `{{function(v){$fieldChange('data.form.defaultProject',data.other.defaultProject.filter(function(o){return o.code == v})[0])}}}`,
							children: '{{$subjectListOption()}}'
						}]
					}
					]
				}, {
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
							//_visible: '{{data.other.incomeexpensesTabId == "2001003" || data.other.incomeexpensesTabId == "4001001"}}',
							_visible: '{{$getCancleVisible()}}',
							className: 'btnGroup-item',
							children: '取消',
							onClick: '{{$onCancel}}'
						}, {
							name: 'saveAndNew',
							component: 'Button',
							//_visible: '{{data.other.incomeexpensesTabId == "3001002" || data.other.incomeexpensesTabId == "3001001"}}',
							_visible: '{{$getSaveAndNewVisible()}}',
							className: 'btnGroup-item',
							children: '保存并新增',
							onClick: "{{function(e){$onOk('saveAndNew')}}}"
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
				softAppName: ""
			},
			error: {}
		}
	}
}
