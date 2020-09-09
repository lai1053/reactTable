import moment from 'moment';

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'app-card-person',
        children: [{
            name: 'form',
            component: 'Form',
            className: 'app-card-person-form',
            children: [{
                name: 'essentialInfo',
                component: 'Layout',
                className: 'title',
                children: [{
                    name: 'info',
                    className: 'info',
                    component: '::span',
                    children: '基本信息'
                }, {
                    name: 'line',
                    className: 'line',
                    component: '::span',
                    children: ''
                }]
            }, {
                name: 'nameItem',
                component: 'Form.Item',
                label: '姓名',
                required: true,
                validateStatus: "{{data.other.error.name?'error':'success'}}",
                help: '{{data.other.error.name}}',
                children: [{
                    name: 'name',
                    timeout: true,
                    component: 'Input',
                    // maxlength: '100',
                    value: '{{data.form.name}}',
                    onChange: `{{function(e){$sf('data.form.name',e.target.value);$changeCheck('name')}}}`,
                }]
            }, {
                name: 'identityCardItem',
                component: 'Form.Item',
                label: '身份证号',
                validateStatus: "{{data.other.error.identityCard?'error':'success'}}",
                help: '{{data.other.error.identityCard}}',
                children: [{
                    name: 'ids',
                    timeout: true,
                    component: 'Input',
                    // maxlength: '20',
                    value: '{{data.form.identityCard}}',
                    // onChange: `{{function(v){$sf('data.form.identityCard',v.target.value);$changeCheck('identityCard')}}}`,
	                onChange: `{{function(v){$fieldChange('data.form.identityCard',v.target.value)}}}`,
                }]
            }, {
                name: 'departmentItem',
                component: 'Form.Item',
                label: '所属部门',
                required: true,
                validateStatus: "{{data.other.error.department?'error':'success'}}",
                help: '{{data.other.error.department}}',
                children: [{
                    name: 'department',
                    component: 'Select',
                    showSearch: false,
                    value: '{{data.form.department && data.form.department.id}}',
                    optionFilterProp: "children",
                    onChange: `{{function(v){$fieldChange('data.form.department',data.other.departmentList.filter(function(data){return data.id == v})[0])}}}`,
                    children: {
                        name: 'option',
                        component: 'Select.Option',
                        value: "{{data.other.departmentList &&data.other.departmentList[_rowIndex].id}}",
                        children: '{{data.other.departmentList && data.other.departmentList[_rowIndex].name}}',
                        _power: 'for in data.other.departmentList'
                    }
                }]
            }, {
                name: 'jobDutyItem',
                component: 'Form.Item',
                label: '职位',
	            validateStatus: "{{data.other.error.jobDuty?'error':'success'}}",
	            help: '{{data.other.error.jobDuty}}',
                children: [{
                    name: 'jobDuty',
                    timeout: true,
                    component: 'Input',
                    // maxlength: '50',
                    value: '{{data.form.jobDuty}}',
                    onChange: `{{function(v){$sf('data.form.jobDuty',v.target.value);$changeCheck('jobDuty')}}}`,
                }]
            }, {
                name: 'emailItem',
                component: 'Form.Item',
                label: '邮箱',
                validateStatus: "{{data.other.error.email?'error':'success'}}",
                help: '{{data.other.error.email}}',
                children: [{
                    name: 'email',
                    component: 'Input',
                    timeout: true,
                    // maxlength: '50',
                    value: '{{data.form.email}}',
                    onChange: `{{function(v){$fieldChange('data.form.email',v.target.value);$changeCheck('email')}}}`,
                }]
            }, {
                name: 'employeeItem',
                component: 'Form.Item',
                className:'noPaddingTop',
                label: '雇员',
                children: [{
                    name: 'employee',
                    component: 'Radio.Group',
                    options: '{{data.other.employeeList}}',
                    value: '{{data.form.employee}}',
                    onChange: `{{function(v){$setField('data.form.employee',v.target.value)}}}`,
                }]
            }, {
                name: 'genderItem',
                component: 'Form.Item',
                className:'noPaddingTop',
                label: '性别',
                children: [{
                    name: 'gender',
                    component: 'Radio.Group',
                    options: '{{data.other.sexList}}',
                    value: '{{data.form.gender}}',
                    onChange: `{{function(v){$setField('data.form.gender',v.target.value)}}}`,
                }]
            }, {
                name: 'maritalStatusItem',
                component: 'Form.Item',
                className:'noPaddingTop',
                label: '婚姻状况',
                children: [{
                    name: 'maritalStatus',
                    component: 'Radio.Group',
                    options: '{{data.other.maritalstatuxList}}',
                    value: '{{data.form.maritalStatus}}',
                    onChange: `{{function(v){$setField('data.form.maritalStatus',v.target.value)}}}`,
                }]
            }, {
	            name: 'line',
	            component: 'Layout',
	            className: 'title',
	            children: [{
		            name: 'info',
		            className: 'info',
		            component: '::span',
		            children: '对应科目'
	            }, {
		            name: 'line',
		            className: 'line',
		            component: '::span',
		            children: ''
	            }]
            }, {
	            name: 'taxRateItem',
	            component: 'Form.Item',
	            className: 'subjectRemark',
	            label: '其他应收科目',
	            validateStatus: '{{data.other.error.rate ? "error" : "success"}}',
	            help: '{{data.other.error.rate}}',
	            children: {
		            name: 'rate',
		            component: 'Select',
		            allowClear: true,
		            className: 'selectClear',
		            value: '{{data.form.otherReceivableAccountId}}',
		            filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
		            onChange: `{{function(v){if(v == undefined){$fieldChange('data.form.otherReceivableAccountId',v)}}}}`,
		            onSelect: `{{function(v){$fieldChange('data.form.otherReceivableAccountId',v)}}}`,
		            dropdownFooter: {
			            name: 'add',
			            component: 'Button',
			            type: 'primary',
			            style: { width: '100%', borderRadius: '0' },
			            onClick: '{{function(){$addSubject("otherReceivableAccountId")}}}',
			            children: '新增科目'
		            },
		            children: '{{$subjectListOption()}}'
	            }
            }, {
	            name: 'taxRateItem',
	            component: 'Form.Item',
	            className: 'subjectRemark',
	            label: '其他应付科目',
	            children: {
		            name: 'rate',
		            component: 'Select',
		            allowClear: true,
		            className: 'selectClear',
		            value: '{{data.form.otherPayableAccountId}}',
		            filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
		            onChange: `{{function(v){if(v == undefined){$fieldChange('data.form.otherPayableAccountId',v)}}}}`,
		            onSelect: `{{function(v){$fieldChange('data.form.otherPayableAccountId',v)}}}`,
		            dropdownFooter: {
			            name: 'add',
			            component: 'Button',
			            type: 'primary',
			            style: { width: '100%', borderRadius: '0' },
			            onClick: '{{function(){$addSubject("otherPayableAccountId")}}}',
			            children: '新增科目'
		            },
		            children: '{{$subjectListOption()}}'
	            }
            }, {
	            name: 'mobileItem',
	            component: 'Form.Item',
	            className: 'subjectRemark',
	            children: [{
		            name: 'remark',
		            className: 'telRemark',
		            style: {minHeight:'0px'},
		            component: '::div',
		            children: '注：其他应收科目、其他应付科目为空时，将默认取"基础设置"-"收支类型设置"内默认科目'
	            }]
            }, {
                name: 'essentialInfo',
                component: 'Layout',
                className: 'title',
                _visible: '{{data.appVersion != 114}}',
                children: [{
                    name: 'info',
                    className: 'info',
                    component: '::span',
                    children: '登录信息'
                }, {
                    name: 'line',
                    className: 'line',
                    component: '::span',

                    children: ''
                }]
            }, {
                name: 'mobileItem',
                component: 'Form.Item',
                label: '注册手机号',
                validateStatus: "{{data.other.error.mobile?'error':'success'}}",
                help: '{{data.other.error.mobile}}',
                _visible: '{{data.appVersion != 114}}',
                children: [{
                    name: 'mobile',
                    component: 'Input.Number',
                    timeout: true,
                    // maxlength: '20',
                    disabled: '{{(data.appVersion == 107 && sessionStorage["dzSource"] == 1) || (data.form.mobile != undefined && (data.phoneStatus ? Number(data.form.mobile) : "") && data.roleStatus)}}',
                    value: '{{!!data.form.mobile ? Number(data.form.mobile) : ""}}',
                    onChange: `{{function(v){$sf('data.phoneStatus',false);if(v != '-' ){$sf('data.form.mobile',v);$changeCheck('mobile')}}}}`,
                }]
            }, {
                name: 'mobileItem',
                component: 'Form.Item',
                className:'remarkForm',
                _visible: '{{data.appVersion != 114}}',
                children: [{
                    name: 'remark',
                    className: 'telRemark',
                    component: '::div',
                    children: '录入手机号，勾选角色保存后，系统会自动发短信邀请哟'
                }]
            }, {
                name: 'roleItem',
                component: 'Form.Item',
                className: 'title noPaddingTop',
                label: '角色',
                _visible: '{{data.appVersion != 114}}',
                children: [
                    {
                        component: '::div',
                        style:{display:'inline-block'},
                        title: '{{data.other.roles[_rowIndex].memo}}',
                        children: {
                            name: 'role',
                            component: 'Checkbox.Group',
                            options: '{{[data.other.roles[_rowIndex]]}}',
                            disabled: '{{$roleDisable()}}',
                            value: '{{data.form.roleDtoListCheck}}',
                            onChange: '{{$checkBoxChange}}'
                        },
                        _power: 'for in data.other.roles',
                        name: 'option',
                    }
                ]
            }]
        }]
    }
}

export function getInitState(option) {
	return {
		data: {
			form: {},
			other: {
				glAccounts:[],
				error: {}
			},
			phoneStatus: true,
			roleStatus: true
		}
	};
}
