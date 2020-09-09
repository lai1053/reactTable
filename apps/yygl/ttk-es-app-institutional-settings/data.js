import moment from 'moment';

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-institutional-settings',
        children: [{
            name: 'form',
            component: 'Form',
            className: 'ttk-es-app-institutional-settings-form',
            children: [{
                name: 'nameItem',
                component: 'Form.Item',
                label: '机构名称',
                required: true,
                validateStatus: "{{data.other.error.name?'error':'success'}}",
                help: '{{data.other.error.name}}',
                children: [{
                    name: 'name',
                    timeout: true,
                    component: 'Input',
                    style: {fontSize:'12px'},
                    placeholder:'请输入机构名称',
                    // maxlength: '100',
                    value: '{{data.name}}',
                    onChange: '{{$formNameChange}}',//
                }]
            }, {
                name: 'areaItem',
                component: 'Form.Item',
                label: '所属区域',
                className: 'areaItemAddress',
                required: true,
                validateStatus: "{{data.other.error.areaCode?'error':'success'}}",
                help: '{{data.other.error.areaCode}}',
                children:{
                    name: 'detail',
                    component: 'Address',
                    value: {disabled: false},
                    showDetail: false,
                    width: 123,
                    style: {fontSize:'12px'},
                    // height: 50,
                    provinces: '{{data.area.registeredProvincial}}',
                    citys: '{{data.area.registeredCity}}',
                    districts: '{{data.area.registeredCounty}}',
                    // text: '{{data.area.registeredAddress}}',
                    onChange: "{{function(e) {$setAddress(e)}}}",
                    getPopupContainer:".areaItemAddress",
                    // isRequired: true
                }
            },
            {
                name: 'xxdzItem',
                component: 'Form.Item',
                label: '详细地址',
                // required: true,
                // maxlength:100,
                validateStatus: "{{data.other.error.password?'error':'success'}}",
                help: '{{data.other.error.password}}',
                children: [{
                    name: 'ids',
                    timeout: true,
                    component: 'Input.TextArea',
					maxlength:100,
                    placeholder:'请输详细地址',
                    style: {fontSize:'12px'},
					className:'xxdz-textarea',
                    value: '{{data.contactsAddress}}',
                    // onChange: `{{function(e){console.log(e)}}}`,//$sf('data.form.contactsAddress',e);$changeCheck('contactsAddress')
                    onChange: `{{function(e){$sf("data.contactsAddress",e.target.value)}}}`,//$fieldChange('data.form.contactsAddress',v.target.value)
                }]
            }
            //     {
            //         name: 'remarkItem',
            //         component: 'Form.Item',
            //         label: '备注',
            //         className: 'textArea',
            //         validateStatus: "{{data.other.error.contactsAddress?'error':'success'}}",
            //         help: '{{data.other.error.contactsAddress}}',
            //         children: [{
            //             name: 'contactsAddress',
            //             component: 'Input.TextArea',
            //             timeout: true,
            //             // maxlength: 200,
            //             className:'xxdz-textarea',
            //             value: '{{data.form.contactsAddress}}',
            //             onChange: "{{function(e){$sf('data.form.contactsAddress',e.target.value)}}}"//$sf('data.form.contactsAddress',e.target.value);$changeCheck('contactsAddress')
            //         }]
            //     }
            ,{
                name: 'nameItem',
                component: 'Form.Item',
                label: '机构联系人',
                required: true,
                validateStatus: "{{data.other.error.contactsName?'error':'success'}}",
                help: '{{data.other.error.contactsName}}',
                children: [{
                    name: 'contactsName',
                    timeout: true,
                    component: 'Input',
                    placeholder:'请输入机构联系人',
                    style: {fontSize:'12px'},
                    maxlength: '50',
                    value: '{{data.contactsName}}',
                    onChange: `{{function(e){$sf('data.contactsName',e.target.value)}}}`,
                }]
            },{
                name: 'mobileItem',
                component: 'Form.Item',
                label: '手机',
                required: true,
                validateStatus: "{{data.other.error.contactsPhone?'error':'success'}}",
                help: '{{data.other.error.contactsPhone}}',
                children: [{
                    name: 'contactsPhone',
                    component: 'Input.Number',
                    timeout: true,
                    placeholder:'请输入手机',
                    style: {fontSize:'12px'},
                    maxlength: '11',
                    // disabled: '{{(data.appVersion == 107 && sessionStorage["dzSource"] == 1) || (data.form.contactsPhone != undefined && (data.phoneStatus ? Number(data.form.contactsPhone) : "") && data.roleStatus)}}',
                    value: '{{!!data.contactsPhone ? Number(data.contactsPhone) : ""}}',
                    // onChange: `{{function(v){$sf('data.phoneStatus',false);if(v != '-' ){$sf('data.contactsPhone',v);$changeCheck('contactsPhone')}}}}`,
                    onChange: `{{function(v){$sf('data.contactsPhone',v)}}}`,
                }]
            }, {
                name: 'emailItem',
                component: 'Form.Item',
                label: '邮箱',
                required: true,
                validateStatus: "{{data.other.error.contactsMail?'error':'success'}}",
                help: '{{data.other.error.contactsMail}}',
                children: [{
                    name: 'contactsMail',
                    component: 'Input',
                    placeholder:'请输入邮箱',
                    timeout: true,
                    style: {fontSize:'12px'},
                    maxlength: '50',
                    value: '{{data.form.contactsMail}}',
                    // onChange: `{{function(v){$fieldChange('data.contactsMail',v.target.value);$changeCheck('contactsMail')}}}`,
                    onChange: `{{function(v){$fieldChange('data.contactsMail',v.target.value)}}}`,
                }]
            },{
                name: 'mobileItem',
                component: 'Form.Item',
                label: '组织类型',
                children: [{
                    name: 'filter-content',
                    component: '::div',
                    className: 'filter-content',
                    children: [{
                        name: 'setting',
                        component: 'Radio.Group',
                        style: {marginLeft:'20px'},
                        // _visible:false,
                        value: '{{data.form.orgType}}',
                        children: [{
                            name: 'loan',
                            component: 'Radio',
                            value: 0,
                            children: '个人代理'
                        }, {
                            name: 'loan',
                            component: 'Radio',
                            value: 1,
                            children: '机构'
                        }],
                        // onChange: `{{function(v){$setField('data.isCreatedAccount',v.target.value)}}}`,//$setField('data.isCreatedAccount',v.target.value);$loadList()
                    }]
                }]
            },
			{
				name: 'add',
				component: 'Button',
				children: '保存',
				className: 'ttk-es-app-institutional-settings-add',
				type: 'primary',
				onClick: '{{$onOk}}'
			}
            // {
            //     name: 'essentialInfo',
            //     component: 'Layout',
            //     className: 'title',
            //     children: [{
            //         name: 'info',
            //         className: 'info',
            //         component: '::span',
            //         children: '业务岗位'
            //     }, {
            //         name: 'line',
            //         className: 'line',
            //         component: '::span',
            //         children: ''
            //     }]
            // },
            // {
            //     name: 'roleItem',
            //     component: 'Form.Item',
            //     className: 'title noPaddingTop',
            //     label: '',
            //     children: [
            //         {
            //             component: '::div',
            //             style:{display:'inline-block'},
            //             title: '{{data.other.roles[_rowIndex].memo}}',
            //             children: {
            //                 name: 'role',
            //                 component: 'Checkbox.Group',
            //                 options: '{{[data.other.roles[_rowIndex]]}}',
            //                 disabled: '{{$roleDisable()}}',
            //                 value: '{{data.form.roleDtoListCheck}}',
            //                 onChange: '{{$checkBoxChange}}'
            //             },
            //             _power: 'for in data.other.roles',
            //             name: 'option',
            //         }
            //     ]
            // },
            //     {
            //         name: 'essentialInfo',
            //         component: 'Layout',
            //         className: 'title',
            //         children: [{
            //             name: 'info',
            //             className: 'info',
            //             component: '::span',
            //             children: '管理岗位'
            //         }, {
            //             name: 'line',
            //             className: 'line',
            //             component: '::span',
            //             children: ''
            //         }]
            //     },
            //     {
            //         name: 'roleItem',
            //         component: 'Form.Item',
            //         className: 'title noPaddingTop',
            //         label: '',
            //         children: [
            //             {
            //                 component: '::div',
            //                 style:{display:'inline-block'},
            //                 title: '{{data.other.roles[_rowIndex].memo}}',
            //                 children: {
            //                     name: 'role',
            //                     component: 'Checkbox.Group',
            //                     options: '{{[data.other.roles[_rowIndex]]}}',
            //                     disabled: '{{$roleDisable()}}',
            //                     value: '{{data.form.roleDtoListCheck}}',
            //                     onChange: '{{$checkBoxChange}}'
            //                 },
            //                 _power: 'for in data.other.roles',
            //                 name: 'option',
            //             }
            //         ]
            //     },
            //     {
            //         name: 'essentialInfo',
            //         component: 'Layout',
            //         className: 'title',
            //         children: [{
            //             name: 'info',
            //             className: 'info',
            //             component: '::span',
            //             children: '系统管理员'
            //         }, {
            //             name: 'line',
            //             className: 'line',
            //             component: '::span',
            //             children: ''
            //         }]
            //     },
            //     {
            //         name: 'roleItem',
            //         component: 'Form.Item',
            //         className: 'title noPaddingTop',
            //         label: '',
            //         children: [
            //             {
            //                 component: '::div',
            //                 style:{display:'inline-block'},
            //                 title: '{{data.other.roles[_rowIndex].memo}}',
            //                 children: {
            //                     name: 'role',
            //                     component: 'Checkbox.Group',
            //                     options: '{{[data.other.roles[_rowIndex]]}}',
            //                     disabled: '{{$roleDisable()}}',
            //                     value: '{{data.form.roleDtoListCheck}}',
            //                     onChange: '{{$checkBoxChange}}'
            //                 },
            //                 _power: 'for in data.other.roles',
            //                 name: 'option',
            //             }
            //         ]
            //     }
                ]
        }]
    }
}

export function getInitState(option) {
    return {
        data: {
            form: {
                otherReceivableAccountId: '0',
                name:'机构名称',
                // contactsAddress:'详细地址',
                contactsPhone:'15621497553',
                areaCode:null,
            },
            name:'机构名称',
            contactsName:'联系人名称',
            contactsAddress:'详细地址',
            other: {
                glAccounts:[],
                error: {},
                areaQueryMap: {},//
                areaQuery: [],//存放省份
            },
            area:{
                // registeredProvincial:370000,
                // citys:370100,
                // districts:370101
            },
            isCreatedAccount: 1,
            phoneStatus: true,
            roleStatus: true,
            sflistdata:[
                {
                    title: '北京',
                    val: '0'
                },
                {
                    title: '山东',
                    val: '1'
                },
                {
                    title: '河北',
                    val: '2'
                },
                {
                    title: '黑龙江',
                    val: '3'
                },
            ],
        }
    };
}
