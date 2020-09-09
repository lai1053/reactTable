import moment from 'moment';

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-card-person',
        children: [{
            name: 'form',
            component: 'Form',
            className: 'ttk-es-app-card-person-form',
            children: [{
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
                    placeholder:'请输入姓名',
                    disabled: '{{data.flag}}',
                    // maxlength: '100',
                    value: '{{data.form.name}}',
                    onChange: `{{function(e){$sf('data.form.name',e.target.value);$changeCheck('name')}}}`,
                }]
            }, {
                name: 'passwordItem',
                component: 'Form.Item',
				label: '密码',
				required: true,
                validateStatus: "{{data.other.error.password?'error':'success'}}",
                help: '{{data.other.error.password}}',
                children: [{
                    name: 'ids',
                    timeout: true,
                    component: 'Input',
                    disabled: '{{data.flag || data.mobileVisible}}',
					placeholder:'请输入密码',
                    value: '{{data.form.password}}',
	                onChange: `{{function(v){$fieldChange('data.form.password',v.target.value)}}}`,
                }]
            },{
                name: 'mobileItem',
                component: 'Form.Item',
				label: '手机',
				required: true,
	            validateStatus: "{{data.other.error.mobile?'error':'success'}}",
	            help: '{{data.other.error.mobile}}',
                children: [{
                    name: 'mobile',
                    component: 'Input.Number',
					timeout: true,
					placeholder:'请输入手机',
                    disabled: '{{data.mobileVisible}}',
                    value: '{{!!data.form.mobile ? Number(data.form.mobile) : ""}}',
                    // onBlur: `{{function(v){$fieldChange('data.form.mobile',v)}}}`,
                    //onChange: `{{function(v){$sf('data.phoneStatus',false);if(v != '-' ){$sf('data.form.mobile',v);$changeCheck('mobile')}}}}`,
                    onBlur: `{{function(v){$sf('data.phoneStatus',false);if(v != '-' ){$sf('data.form.mobile',v);$changeCheck('mobile')}}}}`,
                }]
            }, {
                name: 'emailItem',
                component: 'Form.Item',
				label: '邮箱',
				// required: true,
                validateStatus: "{{data.other.error.email?'error':'success'}}",
                help: '{{data.other.error.email}}',
                children: [
                    {
                        name: 'email',
                        component: 'Input',
                        placeholder:'请输入邮箱',
                        disabled: '{{data.flag}}',
                        _visible:'{{!data.flag}}',
                        timeout: true,
                        // maxlength: '50',
                        value: '{{data.form.email}}',
                        // onChange: `{{function(v){$fieldChange('data.form.email',v.target.value);$changeCheckEmail('email')}}}`,
                        onChange: `{{function(v){$fieldChange('data.form.email',v.target.value);}}}`,
                    },
                    {
                        name: 'email',
                        component: 'Input',
                        type: 'password',
                        value: '{{data.form.email}}',
                        visibilityToggle: false,
                        disabled: '{{data.flag}}',
                        _visible:'{{data.flag}}',
                        className:'visibleEmailPass'
                    }
                ]
            }, {
	            name: 'rangeItem',
	            component: 'Form.Item',
	            className: 'subjectRemark',
				label: '数据权限',
				required: true,
	            validateStatus: '{{data.other.error.range ? "error" : "success"}}',
	            help: '{{data.other.error.range}}',
	            children: [{
		            name: 'range',
		            component: 'Select',
		            // allowClear: true,
		            className: 'selectClear',
		            value: '{{data.form.range}}',
                    disabled:'{{data.isSysRole}}',
		            filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
		            onChange: `{{function(v){if(v == undefined){$fieldChange('data.form.range',v)}}}}`,
		            onSelect: `{{function(v){$fieldChange('data.form.range',v)}}}`,
                    //children: '{{$subjectListOption()}}'//动态获取
                    children:[ {
                        name: 'optionSelf',
                        component: 'Select.Option',
                        value: '0',
                        key:'0',
                        children: '个人',
                        _visible:'{{data.isVisible}}'
                    },{
                        name: 'optionDepart',
                        component: 'Select.Option',
                        value: '2',
                        key:'2',
                        children: '部门',
                        _visible:'{{data.isVisible}}'
                    },{
                        name: 'optionCompany',
                        component: 'Select.Option',
                        value: '1',
                        key:'1',
                        children: '公司'
                    }]
	            }, {
                    name: 'popover',
                    component: 'Popover',
                    content: [
                        {
                            name: 'gs',
                            component: '::p',
                            children: '公司：可访问全公司所有的客户数据;'
                        },{
                            name: 'bm',
                            component: '::p',
                            children: '部门：可访问部门及下级部门的客户数据;'
                        },{
                            name: 'gr',
                            component: '::p',
                            children: '个人：仅可访问分配给个人的客户数据;'
                        }
                    ],
                    placement: 'right',
                    overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                    children: {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'XDZtishi',
                        style:{
                            color:'#0066b3',
                            position:'absolute',
                            fontSize:'17px',
                            top:'0',
                            left:'245px'

                        }
                    }
                }]
            }, {
                name: 'essentialInfo',
                component: 'Layout',
                className: 'title',
                children: [{
                    name: 'info',
                    className: 'info infoLow',
                    component: '::span',
                    children: '管理岗位'
                }, {
                    name: 'popover',
                    component: 'Popover',
                    content: '担任管理岗时，请将数据权限设置为【公司】或【部门】',
                    placement: 'right',
                    overlayClassName: 'ttk-es-app-taxdeclaration-title-helpPopover',
                    children: {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'XDZtishi',
                        style:{
                            color:'#0066b3',
                            fontSize:'17px',
                            top:'12px',
                            marginRight:'5px'
                        }
                    }
                },{
                    name: 'line',
                    className: 'line',
                    component: '::span',
                    children: ''
                }]
            }, {
                name: 'roleItem1',
                component: 'Form.Item',
                className: 'title noPaddingTop1',
                label: '',
                children: [
                    {
                        component: '::div',
                        style:{display:'inline-block'},
                        // title: '{{data.other.roles[_rowIndex].memo}}',
                        children: {
                            name: 'role',
                            component: 'Checkbox.Group',
                            options: '{{[data.other.roles1[_rowIndex]]}}',
                            disabled: '{{$roleDisable()}}',
                            value: '{{data.form.roleDtoListCheck}}',
                            onChange: '{{$checkBoxChange}}'
                        },
                        _power: 'for in data.other.roles1',
                        name: 'option',
                    }
                ]
			},
			 {
                name: 'essentialInfo',
                component: 'Layout',
                className: 'title',
                children: [{
                    name: 'info',
                    className: 'info infoLow',
                    component: '::span',
                    children: '业务岗位'
                },{
                    name: 'popover',
                    component: 'Popover',
                    content: '仅担任业务岗位时，请将数据权限设置为【个人】',
                    placement: 'right',
                    overlayClassName: 'ttk-es-app-taxdeclaration-title-helpPopover',
                    children: {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'XDZtishi',
                        style:{
                            color:'#0066b3',
                            fontSize:'17px',
                            top:'12px',
                            marginRight:'5px'
                        }
                    }
                }, {
                    name: 'line',
                    className: 'line',
                    component: '::span',
                    children: ''
                }]
            },
			 {
                name: 'roleItem2',
                component: 'Form.Item',
                className: 'title noPaddingTop2',
                label: '',
                children: [
                    {
                        component: '::div',
                        style:{display:'inline-block'},
                        // title: '{{data.other.roles[_rowIndex].memo}}',
                        children: {
                            name: 'role',
                            component: 'Checkbox.Group',
                            options: '{{[data.other.roles2[_rowIndex]]}}',
                            disabled: '{{$roleDisable()}}',
                            value: '{{data.form.roleDtoListCheck}}',
                            onChange: '{{$checkBoxChange}}'
                        },
                        _power: 'for in data.other.roles2',
                        name: 'option',
                    }
                ]
            },
            {
                name: 'essentialInfo',
                component: 'Layout',
                className: 'title',
                _visible: '{{data.other.userDefinedRole.length > 0}}',
                children: [{
                    name: 'info',
                    className: 'info',
                    component: '::span',
                    children: '自定义岗位'
                }, {
                    name: 'line',
                    className: 'line',
                    component: '::span',
                    children: ''
                }]
            },
            {
                name: 'roleItem4',
                component: 'Form.Item',
                className: 'title noPaddingTop4',
                _visible: '{{data.other.userDefinedRole.length > 0}}',
                label: '',
                children: [
                    {
                        component: '::div',
                        style:{display:'inline-block'},
                        children: {
                            name: 'user-defined-role',
                            component: 'Checkbox.Group',
                            options: '{{[data.other.userDefinedRole[_rowIndex]]}}',
                            value: '{{data.form.roleDtoListCheck}}',
                            onChange: '{{$checkBoxChange}}'
                        },
                        _power: 'for in data.other.userDefinedRole',
                        name: 'option',
                    }
                    // ,{
                    //     name: 'addInput',
                    //     component: '::div',
                    //     style:{display:'inline-block'},
                    //     children: {
                    //         name: 'user-defined-input',
                    //         component: 'Input',
                    //         type: 'text',
                    //         size: 'small',
                    //         placeholder: '自定义岗位',
                    //         style: {width: 78},
                    //         value: '{{data.addRolesValue}}',
                    //         onChange: '{{function(e){$sf("data.addRolesValue",e.target.value)}}}',
                    //         onBlur:'{{$addRolesInputConfirm}}',
                    //         onPressEnter:'{{$addRolesInputConfirm}}'
                    //     },
                    // }
                ]
            },
			{
                name: 'essentialInfo',
                component: 'Layout',
                className: 'title',
                _visible: '{{data.visibleRoles3}}',
                children: [{
                    name: 'info',
                    className: 'info',
                    component: '::span',
                    children: '系统管理员'
                }, {
                    name: 'line',
                    className: 'line',
                    component: '::span',
                    children: ''
                }]
            },
			{
			   name: 'roleItem3',
			   component: 'Form.Item',
               className: 'title noPaddingTop3',
               _visible: '{{data.visibleRoles3}}',
			   label: '',
			   children: [
				   {
					   component: '::div',
					   style:{display:'inline-block'},
					//    title: '{{data.other.roles[_rowIndex].memo}}',
					   children: {
						   name: 'role',
						   component: 'Checkbox.Group',
						   options: '{{[data.other.roles3[_rowIndex]]}}',
						   disabled: '{{data.systemDisabled}}',
						   value: '{{data.form.roleDtoListCheck}}',
						   onChange: '{{$checkBoxChange3}}'
					   },
					   _power: 'for in data.other.roles3',
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
            flag: false,
            mobileVisible: false,
            systemDisabled: false,
            visibleRoles3: true,
			form: {
                dzRoles:[],
                range: '0',
            },
			other: {
                glAccounts:[],
                roles1:[],
                roles2:[],
                roles3:[],
                userDefinedRole:[],
                error: {}
			},
			phoneStatus: true,
			roleStatus: true,
            xtglRole:[],
            isVisible:true,
            ddt:'0',
            isSysRole:false,
            roleKey: 1,
		}
	};
}
