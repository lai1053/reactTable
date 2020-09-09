import moment from 'moment';

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-customer',
        children: [{
			name: 'line',
			component: 'Layout',
			className: 'title',
			_visible: '{{data.linkT}}',
			children: [{
				name: 'info',
				className: 'info',
				component: '::span',
				children: '服务类型'
			}, {
				name: 'line',
				className: 'line',
				component: '::span',
				children: ''
			}]
		}, {
            name: 'nameItem',
            component: 'Form.Item',
            label: '服务类型',
            required: true,
            validateStatus: "{{data.other.error.serviceTypeErr?'error':'success'}}",
            help: '{{data.other.error.serviceTypeErr}}',
            children: [{
                name: 'select-service-type',
                component: 'Select',
                className: 'ttk-es-app-input',
                getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                value: '{{data.form.khsx}}',
                onChange: "{{function (e) {$sf('data.form.khsx', e);$changeServiceType(e);}}}",
                children: {
                    name: 'option',
                    component: '::Select.Option',
                    children: '{{data.serviceTypeOption[_rowIndex].name}}',
                    value: '{{data.serviceTypeOption[_rowIndex].value}}',
                    _power: 'for in data.serviceTypeOption',
                }
            }, {
                name: 'service-type-popover',
                component: 'Popover',
                content: [
                    {
                        name: 'quanbu',
                        component: '::p',
                        children: '全部服务：周期性服务 + 一次性服务;'
                    },{
                        name: 'yici',
                        component: '::p',
                        children: '一次性服务：注册、变更、注销等一次性服务;'
                    },{
                        name: 'zhouqi',
                        component: '::p',
                        children: '周期性服务：代账服务、代理工资业务等周期性进行的服务;'
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
                        fontSize:'17px',
                        marginLeft: '10px',
                        position:'absolute',
                        top:'10px',

                    }
                }
            }]

        }, {
			name: 'line',
			component: 'Layout',
			className: 'title',
			_visible: '{{data.linkT}}',
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
		},{
            name: 'nameItem',
            component: 'Form.Item',
            label: '客户名称',
            required: true,
            validateStatus: "{{data.other.error.name?'error':'success'}}",
            help: '{{data.other.error.name}}',
            children: [{
                name: 'khName',
                component: 'Input',
				placeholder:'请输入客户名称',
				className:'ttk-es-app-input',
                timeout: true,
                maxlength: 50,
                value: '{{data.form.name}}',
                onChange: "{{function(e){$sf('data.form.name',e.target.value);$changeCheck('name');}}}"
            }]

        },
        //     {
        //     name: 'zjmItem',
        //     component: 'Form.Item',
        //     label: '助记码',
        //     required: false,
        //     validateStatus: "{{data.other.error.helpCode?'error':'success'}}",
        //     help: '{{data.other.error.helpCode}}',
        //     children: [{
        //         name: 'zjm',
        //         component: 'Input',
			// 	placeholder:'请输入助记码',
			// 	className:'ttk-es-app-input',
        //         timeout: true,
        //         maxlength: '6',
        //         value: '{{data.form.helpCode}}',
	     //        onChange: `{{function(e){$sf('data.form.helpCode',e.target.value);$changeCheck('helpCode');}}}`,
        //     }]
        // },
            {
                name: 'nsrsbhItem',
                component: 'Form.Item',
                label: '纳税人识别号',
                required: '{{(data.form.dlfs == 8 && data.form.gsdlfs == 3) ? false : true}}',//当网报账号和个税账号同时选中【无】时，纳税识别号非必填。如未同时选中则必填
                validateStatus: "{{data.other.error.nsrsbh?'error':'success'}}",
                help: '{{data.other.error.nsrsbh}}',
                children: [{
                    name: 'nsrsbh',
                    component: 'Input',
                    placeholder:'请输入纳税人识别号',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 20,
                    value: '{{data.form.nsrsbh}}',
                    onChange: "{{function(e){$sf('data.form.nsrsbh',e.target.value);$changeCheck('nsrsbh')}}}"
                }]

            },
            {
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
                // height: 50,
                provinces: '{{data.area.registeredProvincial}}',
                citys: '{{data.area.registeredCity}}',
                districts: '{{data.area.registeredCounty}}',
                text: '{{data.area.registeredAddress}}',
                onChange: "{{function(e) {$setAddress(e),$changeCheck('areaCode')}}}",
                getPopupContainer:".areaItemAddress",
                // isRequired: true
            }
		},   {
                name: 'zjmItem',
                component: 'Form.Item',
                label: '助记码',
                required: false,
                validateStatus: "{{data.other.error.helpCode?'error':'success'}}",
                help: '{{data.other.error.helpCode}}',
                children: [{
                    name: 'zjm',
                    component: 'Input',
                    placeholder:'请输入助记码',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: '6',
                    value: '{{data.form.helpCode}}',
                    onChange: `{{function(e){$sf('data.form.helpCode',e.target.value);$changeCheck('helpCode');}}}`,
                }]
            },

            /***********网报账号 start******************/

            {
	        name: 'line',
	        component: 'Layout',
			className: 'title',
			_visible: '{{data.linkT}}',
	        children: [{
		        name: 'info',
		        className: 'info',
		        component: '::span',
		        children: '网报账号'
	        }, {
		        name: 'line',
		        className: 'line',
		        component: '::span',
		        children: ''
	        }]
        },
         //    {
		// 	name: 'nsrsbhItem',
		// 	component: 'Form.Item',
		// 	label: '纳税人识别号',
		// 	required: true,
		// 	validateStatus: "{{data.other.error.nsrsbh?'error':'success'}}",
		// 	help: '{{data.other.error.nsrsbh}}',
		// 	children: [{
		// 		name: 'nsrsbh',
		// 		component: 'Input',
		// 		placeholder:'请输入纳税人识别号',
		// 		className:'ttk-es-app-input',
		// 		timeout: true,
		// 		maxlength: 20,
		// 		value: '{{data.form.nsrsbh}}',
		// 		onChange: "{{function(e){$sf('data.form.nsrsbh',e.target.value);$changeCheck('nsrsbh')}}}"
		// 	}]
        //
		// },
         //    {
         //    name: 'name',
         //    component: '::div',
         //    style: { width: '250px', display: 'inline-block' }
        // },
            {
			name: 'loginItem',
			component: 'Form.Item',
			label: '登录方式',
			required: false,
			validateStatus: "{{data.other.error.code?'error':'success'}}",
			help: '{{data.other.error.code}}',
			children: [{
				name: 'loginType',
				component: '::div',
				// value:'{{data.form.dlfs}}',
				// onChange: "{{function(e){$sf('data.value',e.target.value)}}}",
                children: [{
                    name: 'loginTypeGroup',
                    component: 'Radio.Group',
                    // className:'',
                    // children: '{{Object.keys(data.other.loginTypeMap).length > 0 && data.other.loginTypeMap[data.other.loginTypeRelation[_rowIndex]].name}}',
                    // timeout: true,
                    // value: '{{Object.keys(data.other.loginTypeMap).length > 0 && data.other.loginTypeMap[data.other.loginTypeRelation[_rowIndex]].code}}',
                    // _power: 'for in data.other.loginTypeRelation',
                    value: '{{data.form.dlfs}}',
                    onChange: "{{function(e){$changeDLFS(e)}}}",
                    children: {
                        name: 'loginType',
                        component: 'Radio',
                        className:'',
                        children: '{{Object.keys(data.other.loginTypeMap).length > 0 && data.other.loginTypeMap[data.other.loginTypeRelation[_rowIndex]].name}}',
                        timeout: true,
                        // value: '5',
                        value: '{{Object.keys(data.other.loginTypeMap).length > 0 && data.other.loginTypeMap[data.other.loginTypeRelation[_rowIndex]].code}}',
                        _power: 'for in data.other.loginTypeRelation',
                    }
                },{
                    name: 'popover',
                    component: 'Popover',
                    content: '无网报账号的客户请选择【无】',
                    placement: 'right',
                    overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                    _visible: '{{data.form.khsx == "001"}}',
                    children: {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'XDZtishi',
                        style:{
                            color:'#0066b3',
                            position:'absolute',
                            fontSize:'17px',
                            top:'12px',

                        }
                    }
                }, {
                    name: 'loginType2',
                    component: 'Checkbox',
                    _visible: '{{data.form.registeredProvincial == "370000" && data.form.registeredCounty != "370201" }}',
                    className:'',
                    children: 'CA登录',
                    timeout: true,
                    value: 'CA登录',
                    // onChange: "{{function(e){$sf('data.form.code',e.target.value);$changeCheck('code')}}}"
                }],

			}]

        },
        {
            name: 'name',
            _visible:'{{data.area.registeredProvincial != "110000"}}',
            component: '::div',
            style: { width: '250px', display: 'inline-block' }
        },
            {
            name: 'nameItem1',
            component: 'Form.Item',
            label: '电子税务局用户',
            required: true,
            _visible: '{{data.form.dlfs == 3}}',
            validateStatus: "{{data.other.error.dlzh?'error':'success'}}",
            help: '{{data.other.error.dlzh}}',
            children: [{
                name: 'dzsjUser',
                component: 'Input',
                placeholder:'请输入电子税务局用户',
                autoComplete:'off',
                className:'ttk-es-app-input',
                timeout: true,
                maxlength: 50,
                value: '{{data.form.dlzh}}',
                onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
            }]

        },{
            name: 'nameItem2',
            component: 'Form.Item',
            label: '电子税务局密码',
            _visible: '{{data.form.dlfs == 3}}',
            required: true,
            validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
            help: '{{data.other.error.dlmm}}',
            children: [{
                name: 'dzsjPassword',
                component: 'Input',
                type:'password',
                placeholder:'请输入电子税务局密码',
                autoComplete:'off',
                className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                timeout: true,
                maxlength: 50,
                value: '{{data.form.dlmm}}',
                onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
            }]

        }, {
            name: 'nameItem3',
            component: 'Form.Item',
            label: '网报账号',
            _visible: '{{data.form.dlfs == 2}}',
            required: true,
            validateStatus: "{{data.other.error.dlzh?'error':'success'}}",
            help: '{{data.other.error.dlzh}}',
            children: [{
                name: 'dzsjUser',
                component: 'Input',
                placeholder:'请输入网报账号',
                autocomplete:'offnewpassword',
                className:'ttk-es-app-input',
                timeout: true,
                maxlength: 50,
                value: '{{data.form.dlzh}}',
                onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
            }]

        }, {
            name: 'nameItem4',
            component: 'Form.Item',
            label: '网报账号密码',
            _visible: '{{data.form.dlfs == 2}}',
            required: true,
            validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
            help: '{{data.other.error.dlmm}}',
            children: [
                {
                    name:'stopAutoCompletePassword',
                    component:'Input',
                    type:'text',
                    tabindex:'-1',
                    autocomplete:'off',
                    style:{position:'absolute',top:'-9999px'}

                },{
                    name:'stopAutoCompletePassword',
                    component:'Input',
                    type:'password',
                    tabindex:'-1',
                    autocomplete:'new-password',
                    style:{position:'absolute',top:'-9999px'}
                },
                {
                name: 'dzsjPassword',
                component: 'Input',
                type:'password',
                placeholder:'请输入网报账号密码',
                // autocomplete:'offnewpassword',
                className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                timeout: true,
                maxlength: 50,
                value: '{{data.form.dlmm}}',
                onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
            }]

        },
            {
                name: 'nameItem31',
                component: 'Form.Item',
                label: '手机号',
                _visible: '{{data.form.dlfs == 7}}',
                required: true,
                validateStatus: "{{data.other.error.dlzh?'error':'success'}}",
                help: '{{data.other.error.dlzh}}',
                children: [{
                    name: 'dzsjUser',
                    component: 'Input',
                    placeholder:'请输入手机号',
                    autoComplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 11,
                    value: '{{data.form.dlzh}}',
                    onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
                }]

            }, {
                name: 'nameItem32',
                component: 'Form.Item',
                label: '身份证',
                _visible: '{{data.form.dlfs == 7}}',
                required: true,
                validateStatus: "{{data.other.error.sfz?'error':'success'}}",
                help: '{{data.other.error.sfz}}',
                children: [{
                    name: 'dzsjUser',
                    component: 'Input',
                    placeholder:'请输入身份证号',
                    autocomplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 18,
                    value: '{{data.form.sfz}}',
                    onChange: "{{function(e){$sf('data.form.sfz',e.target.value);$changeCheck('sfz')}}}"
                }]

            },{
                name: 'nameItem33',
                component: 'Form.Item',
                label: '密码',
                _visible: '{{data.form.dlfs == 7}}',
                required: true,
                validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
                help: '{{data.other.error.dlmm}}',
                children: [{
                    name: 'dzsjPassword',
                    component: 'Input',
                    type:'password',
                    placeholder:'请输入密码',
                    autocomplete:'off',
                    className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                    timeout: true,
                    maxlength: 50,
                    value: '{{data.form.dlmm}}',
                    onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
                }]

            },
            {
            name: 'nameItem5',
            component: 'Form.Item',
            label: '实名手机号',
            _visible: '{{data.form.dlfs == 6}}',
            required: true,
            validateStatus: "{{data.other.error.dlzh?'error':'success'}}",
            help: '{{data.other.error.dlzh}}',
            children: [{
                name: 'dzsjUser',
                component: 'Input',
                placeholder:'请输入手机号码',
                autocomplete:'off',
                className:'ttk-es-app-input',
                timeout: true,
                maxlength: 11,
                value: '{{data.form.dlzh}}',
                onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
            }]

        },{
            name: 'nameItem6',
            component: 'Form.Item',
            label: '密码',
            _visible: '{{data.form.dlfs == 6}}',
            required: true,
            validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
            help: '{{data.other.error.dlmm}}',
            children: [{
                name: 'dzsjPassword',
                component: 'Input',
                type:'password',
                placeholder:'请输入密码',
                autocomplete:'off',
                className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                timeout: true,
                maxlength: 50,
                value: '{{data.form.dlmm}}',
                onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
            }]

        },  {
                name: 'nameItem21',
                component: 'Form.Item',
                label: '手机号码',
                _visible: '{{data.form.dlfs == 5}}',
                required: true,
                validateStatus: "{{data.other.error.dlzh?'error':'success'}}",
                help: '{{data.other.error.dlzh}}',
                children: [{
                    name: 'dzsjUser',
                    component: 'Input',
                    placeholder:'请输入手机号码',
                    autocomplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 11,
                    value: '{{data.form.dlzh}}',
                    onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
                }]

            },{
                name: 'nameItem12',
                component: 'Form.Item',
                label: '验证码',
                _visible: '{{data.form.dlfs == 5}}',
                required: true,
                validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
                help: '{{data.other.error.dlmm}}',
                children: [{
                    name: 'dzsjPassword',
                    component: 'Input',
                    type:'password',
                    placeholder:'{{data.timeStaus?"请点击获取验证码":"请输入验证码"}}',
                    autocomplete:'off',
                    className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                    timeout: true,
                    maxlength: 20,
                    value: '{{data.form.dlmm}}',
                    onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm');$changeYZM(e)}}}",
                    // onKeyDown:"{{function(e){$changeYZM(e)}}}"
                },{
                    name:'time',
                    component:'::a',
                    disabled:'{{data.yzm}}',
                    style:{marginLeft:'8px',textDecoration: 'underline'},
                    children:'{{data.timeSJ}}',
                    onClick:'{{$sendCode}}'
                },{
                    name:'successPhone',
                    component:'::div',
                    _visible:'{{data.JXYZM}}',
                    style:{lineHeight:'16px'},
                    children:[
                        {
                            name:'icon',
                            component:'Icon',
                            type:'chenggongtishi',
                            fontFamily: 'edficon',
                            style:{color:'#a4c950'}
                        },
                        {
                            name:'phoneTit',
                            component:'::span',
                            children:'手机号码已验证'
                        }
                    ]
                }]

            },{
            name: 'nameItem7',
            component: 'Form.Item',
            label: '证件类型',
            _visible: '{{data.form.dlfs == 4}}',
            required: true,
            // validateStatus: "{{data.other.error.code?'error':'success'}}",
            // help: '{{data.other.error.code}}',
            children: [{
                name: 'dzsjUser',
                component: 'Select',
                className:'ttk-es-app-input',
                timeout: true,
                // maxlength: 20,
                value: '居民身份证',
                // onChange: "{{function(e){$sf('data.form.code',e.target.value);$changeCheck('name')}}}"
                // children:{
                //     name:'option',
                //     component:'::Select.Option',
                //     children:'{{data.IDType[_rowIndex].name}}',
                //     value:'{{data.IDType[_rowIndex].code}}',
                //     _power:'for in data.IDType'
                // }
            }]

        }, {
            name: 'nameItem8',
            component: 'Form.Item',
            label: '证件号码',
            _visible: '{{data.form.dlfs == 4}}',
            required: true,
            validateStatus: "{{data.other.error.dlzh?'error':'success'}}",
            help: '{{data.other.error.dlzh}}',
            children: [{
                name: 'dzsjUser',
                component: 'Input',
                placeholder:'请输入证件号码',
                autocomplete:'off',
                className:'ttk-es-app-input',
                timeout: true,
                maxlength: 20,
                value: '{{data.form.dlzh}}',
                onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
            }]

        },{
            name: 'nameItem9',
            component: 'Form.Item',
            label: '密码',
            style:{width:'500px'},
            _visible: '{{data.form.dlfs == 4}}',
            required: true,
            validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
            help: '{{data.other.error.dlmm}}',
            children: [{
                name: 'dzsjPassword',
                component: 'Input',
                type:'password',
                placeholder:'请输入密码',
                autocomplete:'off',
                className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                timeout: true,
                maxlength: 50,
                value: '{{data.form.dlmm}}',
                onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
            }]
          },

            /*****四川省登录方式 start********/
            {
                name: 'nameItem12',
                component: 'Form.Item',
                label: '登录密码',
                style:{width:'500px'},
                _visible: '{{data.form.dlfs == 9}}',
                required: true,
                validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
                help: '{{data.other.error.dlmm}}',
                children: [
                    {
                        name:'stopAutoCompletePassword',
                        component:'Input',
                        type:'text',
                        tabindex:'-1',
                        autocomplete:'off',
                        style:{position:'absolute',top:'-9999px'}

                    },{
                        name:'stopAutoCompletePassword',
                        component:'Input',
                        type:'password',
                        tabindex:'-1',
                        autocomplete:'new-password',
                        style:{position:'absolute',top:'-9999px'}
                    },
                    {
                    name: 'dzsjPassword',
                    component: 'Input',
                    type:'password',
                    placeholder:'请输入登录密码',
                    autocomplete:'off',
                    className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                    timeout: true,
                    maxlength: 50,
                    value: '{{data.form.dlmm}}',
                    onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
                }]
            },
            {
                name: 'nameItem121',
                component: 'Form.Item',
                label: '登录手机号',
                _visible: '{{data.form.dlfs == 9}}',
                required: true,
                validateStatus: "{{data.other.error.bjblrsjh?'error':'success'}}",
                help: '{{data.other.error.bjblrsjh}}',
                children: [{
                    name: 'dzsjUser',
                    component: 'Input',
                    placeholder:'请输入手机号码',
                    autocomplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 11,
                    value: '{{data.form.bjblrsjh}}',
                    onChange: "{{function(e){$sf('data.form.bjblrsjh',e.target.value);$changeCheck('bjblrsjh')}}}"
                }]

            },
            {
                name: 'nameItem123',
                component: 'Form.Item',
                label: '登录身份',
                required: true,
                _visible: '{{data.form.dlfs == 9}}',
                validateStatus: "{{data.other.error.bjblrsf?'error':'success'}}",
                help: '{{data.other.error.bjblrsf}}',
                children: [{
                    name: 'bjblrJob',
                    component: 'Select',
                    className:'ttk-es-app-input',
                    // timeout: true,
                    // maxlength: 20,
                    value: '{{data.form.bjblrsf}}',
                    placeholder:'请选择登录身份',
                    children:{
                        name:'option',
                        component:'::Select.Option',
                        children:'{{data.bjblrJob[_rowIndex].name}}',
                        value:'{{data.bjblrJob[_rowIndex].code}}',
                        _power:'for in data.bjblrJob'
                    },
                    onChange: "{{function(e){$sf('data.form.bjblrsf',e);}}}"
                }]
            },
            {
                name:'nameItem124',
                component:'::div',
                _visible: '{{data.form.dlfs == 9}}',
                style:{marginLeft:'7%'},
                children:[
                    {
                        name:'nameItem1241',
                        component:'::span',
                        style:{color:'#fd9400'},
                        children:'温馨提示：',
                    },
                    {
                        name:'nameItem1242',
                        component:'::span',
                        children:[
                            {
                                name:'nameItem12421',
                                component:'::span',
                                style:{color:'#666666'},
                                children:'为保证正常登录并使用产品，请使用登录手机号'
                            },
                            {
                                name:'nameItem12422',
                                component:'::a',
                                style:{textDecoration:'underline'},
                                children:'扫码安装App',
                                onClick:"{{function(){$copyImg()}}}"
                            },
                            {
                                name:'nameItem12423',
                                component:'::span',
                                style:{color:'#666666'},
                                children:'，并确保App处于运行状态。'
                            },
                            {
                                name:'nameItem12424',
                                component:'::span',
                                style:{color:'#666666',display:'block',marginLeft:'11%'},
                                children:'仅支持安卓手机。',
                                // onClick:"{{function(){$errorMsg()}}}"
                            },
                        ]
                    }
                ]

            },
            /*****四川省登录方式 end********/

         //------------------------------ CA登录------------------------------  Begin

            {
                name: 'nameItem10',
                component: 'Form.Item',
                label: '证书名称',
                // style:{width:'500px'},
                _visible: '{{data.form.dlfs == 1}}',
                required: true,
                validateStatus: "{{data.other.error.dlzh?'error':'success'}}",
                help: '{{data.other.error.dlzh}}',
                children: [{
                    name: 'dzsjPassword',
                    component: 'Input',
                    // type:'text',
                    placeholder:'请输入证书名称',
                    autocomplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    // maxlength: 20,
                    value: '{{data.form.dlzh}}',
                    disabled:true,
                    onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
                }]
            },
            {
                name: 'nameItem11',
                component: 'Form.Item',
                label: '证书有效期',
                style:{marginLeft:'0'},
                _visible: '{{data.form.dlfs == 1}}',
                required: true,
                validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
                help: '{{data.other.error.dlmm}}',
                children: [{
                    name: 'dzsjPassword',
                    component: 'Input',
                    // type:'password',
                    placeholder:'请输入证书有效期',
                    autocomplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 20,
                    value: '{{data.form.dlmm}}',
                    disabled:true,
                    onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
                }]
            },


         {
            name: 'camain',
            component: '::span',
            // className: 'camain',
             _visible: '{{data.form.dlfs == 1}}',
            children: [
                {
                    name: 'line3',
                    component: '::div',
                    //_visible: '{{data.basic.dlfs == 1 || data.basic.ss == 37}}',
                    // className: 'caHandle',
                    children: [
                     {
                        name: 'ttk',
                        component: '::a',
                        href: '#',
                        style: { display: 'none' },
                        id: 'caHype'
                    },
                    //     {
                    //     name: 'title',
                    //     component: '::div',
                    //     //_visible: '{{!data.basic.ieEnv}}',//判断是否是IE环境
                    //     style: { marginBottom: '10px' },
                    //     children: {
                    //         name: 'item',
                    //         component: '::span',
                    //         className: 'CATitle',
                    //         //_visible: '{{!$ieEnv()}}',
                    //         style: { overflow: 'hidden', display: 'inline-block', cursor: 'pointer' },
                    //         onClick: '{{$changeCAStep}}',
                    //         children: [{
                    //             name: 'item',
                    //             component: '::span',
                    //             children: [{
                    //                 name: 'item1',
                    //                 component: '::span',
                    //                 //_visible: '{{data.basic.ss != 37}}',
                    //                 children: 'CA证书登录步骤'
                    //             }]
                    //         }, {
                    //             name: 'icon',
                    //             component: 'Icon',
                    //             fontFamily: 'edficon',
                    //             type: '{{data.other.CAStep ? "shang" : "xia"}}',
                    //             style: { float: 'right' },
                    //         }]
                    //     }
                    // },
                        {
                        name: 'step',
                        component: '::div',
                        // _visible: '{{data.other.CAStep}}',
                        children: [
                            {
                                name: 'step2',
                                component: '::div',
                                style: { float:'left',marginLeft:'10px'},
                                children: [
                                //     {
                                //     name: 'title1',
                                //     component: '::div',
                                //     //_visible: '{{data.basic.ss != 37}}',
                                //     children: "{{!data.other.hasReadCA ? '2、下载完成后，读取CA证书' : '2、CA证书已读取，可更换CA证书'}}",
                                //     style: { marginBottom: '5px' },
                                //     className: 'stepName',
                                // },
                                    {
                                        name: 'btn',
                                        component: 'Button',
                                        title:'CA读取成功后请点击刷新按钮，获取企业名称和证书序列号',
                                        style: { marginRight:'10px' },
                                        onClick: '{{$queryCA}}',
                                        children: [
                                            {
                                                name:'refresh',
                                                component:'Icon',
                                                fontFamily: 'edficon',
                                                type:'shuaxin',
                                                className:'shuaxin',
                                                style:{color:'#0066B3',fontSize:'20px'},
                                                title: 'CA读取成功后请点击刷新按钮，获取企业名称和证书序列号',
                                            }
                                        ]
                                    },
                                    {
                                    name: 'btn1',
                                    component: 'Button',
                                    _visible: '{{!data.other.readSuc}}',
                                    disabled: '{{data.other.isReadOnly}}',
                                    style: { width: '70px',backgroundColor:'#0066b3',color:'#fff' },
                                    onClick: '{{$openCATool}}',
                                    children: '采集证书'
                                },
                                    {
                                        name: 'btn2',
                                        component: 'Button',
                                        _visible: '{{data.other.readSuc}}',
                                        disabled: '{{data.other.isReadOnly}}',
                                        style: { width: '70px',backgroundColor:'#0066b3',color:'#fff' },
                                        onClick: '{{!data.other.isReadOnly && $changeCA}}',
                                        children: '更换证书'
                                    }
                                ]
                            },
                            {
                            name: 'step1',
                            component: '::div',
                                style: { float:'left',marginLeft:'10px',color:'#0066B3',cursor:'pointer'},
                            children: [
                            //     {
                            //     name: 'title1',
                            //     component: '::div',
                            //     children: '1、下载安装CA证书读取工具',
                            //     //_visible: '{{data.basic.ss != 37}}',
                            //     style: { marginBottom: '5px' },
                            //     className: 'stepName'
                            // },
                                {
                                    name: 'btn',
                                    component: 'Button',
                                    title:'下载采集工具',
                                    // style: { width: '90px' },
                                    onClick: '{{$downloadCACertifacate}}',
                                    children: [
                                        {
                                            name:'downLoad',
                                            component:'Icon',
                                            type:'download',
                                            style:{color:'#0066B3',fontSize:'16px'},
                                        }
                                    ]
                                },
                            //     {
                            //     name: 'btn',
                            //     component: '::span',
                            //     // style: { width: '90px' },
                            //     onClick: '{{$downloadCACertifacate}}',
                            //     children: '下载采集工具'
                            // }
                            ]
                        },
                        //     {
                        //     name: 'step3',
                        //     component: '::div',
                        //     //_visible: '{{$caToolsInfo}}',
                        //     style: { marginBottom: '10px' },
                        //     children: [{
                        //         name: 'title1',
                        //         component: '::div',
                        //         //_visible: '{{data.basic.ss != 37}}',
                        //         children: '3、完成第1、2步后，可读取企业信息',
                        //         className: 'stepName',
                        //     }]
                        // }
                        ]
                    },
                    //     {
                    //     name: 'changeCA',
                    //     component: '::div',
                    //     _visible: '{{$IsChangeCA()}}',
                    //     children: [{
                    //         name: 'a1',
                    //         component: '::a',
                    //        // _visible: '{{data.basic.ss != 37}}',
                    //         onClick: '{{!data.other.isReadOnly && $changeCA}}',
                    //         children: '更换CA证书'
                    //     }, {
                    //         name: 'item1',
                    //         component: '::span',
                    //         children: '（如果无法打开更换CA证书，请点击上方重新下载证书读取工具）'
                    //     }]
                    // }
                    ]
                }

            ]
          },



         //------------------------------ CA登录------------------------------ End


		  // {
			// 	name: 'nameItem',
			// 	component: 'Form.Item',
			// 	label: '个税申报密码',
			// 	required: false,
			// 	validateStatus: "{{data.other.error.gssbmm?'error':'success'}}",
			// 	help: '{{data.other.error.gssbmm}}',
			// 	children: [{
			// 		name: 'gsPassword',
			// 		component: 'Input',
			// 		type:'password',
			// 		placeholder:'请输入个税申报密码',
           //          className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
			// 		timeout: true,
			// 		maxlength: 20,
			// 		value: '{{data.form.gssbmm}}',
			// 		onChange: "{{function(e){$sf('data.form.gssbmm',e.target.value);$changeCheck('gssbmm')}}}"
			// 	}]
           //  },

            /*********办税人账号密码（北京）start************/
            {
                name: 'line11',
                component: 'Layout',
                className: 'title',
                _visible: '{{(data.area.registeredProvincial == "110000"||data.area.registeredProvincial == "370000"||data.area.registeredProvincial == "440000"||data.area.registeredProvincial == "520000"||data.area.registeredProvincial == "630000"||data.area.registeredProvincial == "350000"||data.area.registeredCity == "210200") && data.form.dlfs!= 8}}',
                // _visible: '{{$bsrwbq}}',
                children: [{
                    name: 'info',
                    className: 'info',
                    component: '::span',
                    style:{width:'100px'},
                    children: '办税人账号密码'
                }, {
                    name: 'line',
                    className: 'line',
                    component: '::span',
                    children: ''
                }]
            },
            {
                name: 'nameItem111',
                component: 'Form.Item',
                label: '姓名',
                required: true,
                _visible: '{{(data.area.registeredProvincial == "110000"||data.area.registeredProvincial == "370000"||data.area.registeredProvincial == "440000"||data.area.registeredProvincial == "520000"||data.area.registeredProvincial == "630000"||data.area.registeredProvincial == "350000"||data.area.registeredCity == "210200") && data.form.dlfs!= 8}}',
                // _visible: '{{$bsrwbq}}',
                validateStatus: "{{data.other.error.bjblrxm?'error':'success'}}",
                help: '{{data.other.error.bjblrxm}}',
                children: [{
                    name: 'bjblrxm',
                    component: 'Input',
                    placeholder:'请输入办理人姓名',
                    autoComplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 50,
                    value: '{{data.form.bjblrxm}}',
                    onChange: "{{function(e){$sf('data.form.bjblrxm',e.target.value);$changeCheck('bjblrxm')}}}"
                }]

            },
            {
                name: 'nameItem112',
                component: 'Form.Item',
                label: '身份',
                required: true,
                _visible: '{{(data.area.registeredProvincial == "110000"||data.area.registeredProvincial == "370000"||data.area.registeredProvincial == "440000"||data.area.registeredProvincial == "520000"||data.area.registeredProvincial == "630000"||data.area.registeredProvincial == "350000"||data.area.registeredCity == "210200") && data.form.dlfs!= 8}}',
                // _visible: '{{$bsrwbq}}',
                validateStatus: "{{data.other.error.bjblrsf?'error':'success'}}",
                help: '{{data.other.error.bjblrsf}}',
                children: [{
                    name: 'bjblrJob',
                    component: 'Select',
                    className:'ttk-es-app-input',
                    // timeout: true,
                    // maxlength: 20,
                    value: '{{data.form.bjblrsf}}',
                    placeholder:'请选择人员身份',
                    children:{
                        name:'option',
                        component:'::Select.Option',
                        children:'{{data.bjblrJob[_rowIndex].name}}',
                        value:'{{data.bjblrJob[_rowIndex].code}}',
                        _power:'for in data.bjblrJob'
                    },
                    onChange: "{{function(e){$sf('data.form.bjblrsf',e);}}}"
                }]
            },
            {
                name: 'nameItem113',
                component: 'Form.Item',
                label: '手机号',
                required: true,
                _visible: '{{(data.area.registeredProvincial == "110000"||data.area.registeredProvincial == "370000"||data.area.registeredProvincial == "440000"||data.area.registeredProvincial == "520000"||data.area.registeredProvincial == "630000"||data.area.registeredProvincial == "350000"||data.area.registeredCity == "210200") && data.form.dlfs!= 8}}',
                // _visible: '{{$bsrwbq}}',
                validateStatus: "{{data.other.error.bjblrsjh?'error':'success'}}",
                help: '{{data.other.error.bjblrsjh}}',
                children: [{
                    name: 'bjblrsjh',
                    component: 'Input',
                    placeholder:'请输入办理人手机号',
                    autoComplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 11,
                    value: '{{data.form.bjblrsjh}}',
                    onChange: "{{function(e){$sf('data.form.bjblrsjh',e.target.value);$changeCheck('bjblrsjh')}}}"
                }]

            },
            {
                name: 'nameItem114',
                component: 'Form.Item',
                label: '登录密码',
                required: true,
                _visible: '{{(data.area.registeredProvincial == "110000"||data.area.registeredProvincial == "370000"||data.area.registeredProvincial == "440000"||data.area.registeredProvincial == "520000"||data.area.registeredProvincial == "630000"||data.area.registeredProvincial == "350000"||data.area.registeredCity == "210200") && data.form.dlfs!= 8}}',
                // _visible: '{{$bsrwbq}}',
                validateStatus: "{{data.other.error.bjblrmm?'error':'success'}}",
                help: '{{data.other.error.bjblrmm}}',
                children: [
                    {
                        name:'stopAutoCompletePassword',
                        component:'Input',
                        type:'text',
                        tabindex:'-1',
                        autocomplete:'off',
                        style:{position:'absolute',top:'-9999px'}

                    },{
                        name:'stopAutoCompletePassword',
                        component:'Input',
                        type:'password',
                        tabindex:'-1',
                        autocomplete:'new-password',
                        style:{position:'absolute',top:'-9999px'}
                    },
                    {
                    name: 'bjblrsjh',
                    component: 'Input',
                    type:'password',
                    placeholder:'请输入办理人个人密码',
                    autoComplete:'off',
                    className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                    timeout: true,
                    maxlength: 50,
                    value: '{{data.form.bjblrmm}}',
                    onChange: "{{function(e){$sf('data.form.bjblrmm',e.target.value);$changeCheck('bjblrmm')}}}"
                }]

            },
            {
                name:'wxtsbj',
                component:'::div',
                style:{marginLeft:'10%',padding:'10px 0'},
                _visible: '{{data.area.registeredProvincial == "110000" && data.form.dlfs!= 8}}',
                // _visible: '{{$bsrwbq}}',
                children:[
                    {
                        name:'wxtsbj1',
                        component:'::span',
                        style:{color:'#fd9400'},
                        children:'温馨提示：',
                    },
                    {
                        name:'wxtsbj2',
                        component:'::span',
                        style:{color:'#666666'},
                        children:'自2020年7月1日起，登录北京市电子税务局需进行办税人员身份认证，请完善办税人身份和登录信息'
                    }
                ]
            },

            /*********办税人账号密码（北京）end************/

            /***********个税账号 start******************/

            {
                name: 'line6',
                component: 'Layout',
                className: 'title',
                children: [{
                    name: 'info',
                    className: 'info',
                    component: '::span',
                    children: '个税账号'
                }, {
                    name: 'line',
                    className: 'line',
                    component: '::span',
                    children: ''
                }]
            },
            {
                name: 'gsItem',
                component: 'Form.Item',
                label: '登录方式',
                required: false,
                children: [{
                    name: 'gsType',
                    component: '::div',
                    style:{position:'relative'},
                    children: [{
                        name: 'gsTypeGroup',
                        component: 'Radio.Group',
                        value: '{{data.form.gsdlfs}}',
                        onChange: "{{function(e){$changeGSDLFS(e)}}}",
                        children: {
                            name: 'gsType',
                            component: 'Radio',
                            className:'',
                            children: '{{data.other.gsType[_rowIndex].name}}',
                            timeout: true,
                            value: '{{data.other.gsType[_rowIndex].code}}',
                            _power: 'for in data.other.gsType',
                        }
                    }],

                },{
                    name: 'popover',
                    component: 'Popover',
                    content: '如不使用产品的个税申报功能，请选择【无】',
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
                            top:'12px',
                            left:'245px'

                        }
                    }
                }]

            }, {
                name: 'name2',
                component: '::div',
                style: { width: '250px', display: 'inline-block' }
            },
             {
                name: 'gsnameItem',
                component: 'Form.Item',
                label: '实名账号',
                _visible: '{{data.form.gsdlfs == 1}}',
                required: true,
                validateStatus: "{{data.other.error.gssmzh?'error':'success'}}",
                help: '{{data.other.error.gssmzh}}',
                children: [{
                    name: 'dzsjUser',
                    component: 'Input',
                    placeholder:'请输入证件号/手机号/用户名',
                    autoComplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 50,
                    value: '{{data.form.gssmzh}}',
                    onChange: "{{function(e){$sf('data.form.gssmzh',e.target.value);$changeCheck('gssmzh')}}}"
                }]

            },{
                name: 'popover',
                component: 'Popover',
                _visible: '{{data.form.gsdlfs == 1}}',
                content: '【请输入已取得办税授权的实名制个税账号和个税密码，支持身份证件号码、手机号码、用户名】',
                placement: 'right',
                overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                children: {
                    name: 'icon',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    type: 'XDZtishi',
                    style:{
                        color:'#0066b3',
                        // position:'absolute',
                        fontSize:'17px',
                        // top:'-28px',
                        // left:'245px'
                        margin:'10px 0 0 5px',

                    }
                }
            },{
                name: 'gsnameItem1',
                component: 'Form.Item',
                style:{marginLeft:'20px'},
                label: '实名密码',
                _visible: '{{data.form.gsdlfs == 1}}',
                required: true,
                validateStatus: "{{data.other.error.gssmmm?'error':'success'}}",
                help: '{{data.other.error.gssmmm}}',
                children: [{
                    name: 'dzsjPassword',
                    component: 'Input',
                    type:'password',
                    placeholder:'请输入个税实名密码',
                    autoComplete:'off',
                    className:'{{data.mw1?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                    timeout: true,
                    maxlength: 50,
                    value: '{{data.mw1?data.form.gssmmm:data.form.gssmmm1}}',
                    onChange: "{{function(e){$sf('data.form.gssmmm',e.target.value);$changeCheck('gssmmm')}}}",
                    onKeyDown:"{{function(e){$sf('data.mw1',true)}}}"
                }]

            },
            {
                name: 'gsnameItem3',
                component: 'Form.Item',
                label: '个税申报密码',
                _visible: '{{data.form.gsdlfs == 2}}',
                required: true,
                validateStatus: "{{data.other.error.gssbmm?'error':'success'}}",
                help: '{{data.other.error.gssbmm}}',
                children: [{
                    name: 'gsPassword',
                    component: 'Input',
                    type:'password',
                    placeholder:'请输入个税申报密码',
                    className:'{{data.mw2?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                    timeout: true,
                    maxlength: 50,
                    value: '{{data.mw2?data.form.gssbmm:data.form.gssbmm1}}',
                    onChange: "{{function(e){$sf('data.form.gssbmm',e.target.value);$changeCheck('gssbmm')}}}",
                    onKeyDown:"{{function(e){$sf('data.mw2',true)}}}"
                }]
            },

            /***********报税人员设置 start******************/

	      {
		        name: 'line2',
		        component: 'Layout',
                className: 'title',
                 _visible:'{{(data.form.dlfs == 8 && data.form.gsdlfs == 3) ? false : true}}',
		        children: [{
			        name: 'info',
			        className: 'info',
			        component: '::span',
			        children: '报税人员设置'
		        }, {
			        name: 'line',
			        className: 'line',
			        component: '::span',
			        children: ''
		        }]
	        },
            {
            name: 'taxNumberItem',
            component: 'Form.Item',
                _visible:'{{data.blrVisible}}',
            label: '办理人',
	        validateStatus: "{{data.other.error.blr?'error':'success'}}",
	        help: '{{data.other.error.blr}}',
            children: [{
                name: 'blr',
                component: 'Input',
				placeholder:'请输入办理人',
				className:'ttk-es-app-input',
                timeout: true,
                maxlength: 50,
                value: '{{data.form.blr}}',
                onChange: "{{function(e){$sf('data.form.blr',e.target.value);$changeCheck('blr')}}}"
            }]
        },
            {
            name: 'linkmanItem',
            component: 'Form.Item',
            label: '办理人证件',
                _visible:'{{data.blrVisible}}',
	        validateStatus: "{{data.other.error.linkman?'error':'success'}}",
	        help: '{{data.other.error.linkman}}',
            children: [{
                name: 'linkman',
                component: 'Select',
				className:'ttk-es-app-input',
                // timeout: true,
                // maxlength: 20,
                value: '{{data.form.blrzj}}',
                placeholder:'请选择办理人证件',
                children:{
                    name:'option',
                    component:'::Select.Option',
                    children:'{{data.IDType[_rowIndex].name}}',
                    value:'{{data.IDType[_rowIndex].code}}',
                    _power:'for in data.IDType'
                },
                onChange: "{{function(e){$sf('data.form.blrzj',e);}}}"
            }]
        },
            {
            name: 'contactNumberItem',
            component: 'Form.Item',
            label: '办理人证件号码',
                _visible:'{{data.blrVisible}}',
	        validateStatus: "{{data.other.error.blrzjhm?'error':'success'}}",
	        help: '{{data.other.error.blrzjhm}}',
            children: [{
                name: 'blrzjhm',
                component: 'Input',
				placeholder:'请输入办理人证件号码',
				className:'ttk-es-app-input',
                timeout: true,
                maxlength: 50,
                value: '{{data.form.blrzjhm}}',
                onChange: "{{function(e){$sf('data.form.blrzjhm',e.target.value);$changeCheck('blrzjhm')}}}"
            }]
        },{
                name: 'name',
                component: '::div',
                _visible:'{{data.blrVisible}}',
                style: { width: '420px', display: 'inline-block' }
            },
            {
                name:'zhankai',
                component:'Button',
                _visible:'{{ (data.form.dlfs == 8 && data.form.gsdlfs == 3) ? false : (!data.blrVisible) }}',
                style:{margin:'0 auto 10px',border:'1px solid #0066b3',color:'#0066b3'},
                children:[
                    {
                        name:'text',
                        component:'::span',
                        children:'展开'
                    },
                    {
                        name:'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'xia',
                        style:{fontSize:'14px'}
                    }
                ],
                onClick:'{{function(){$sf("data.blrVisible",!data.blrVisible)}}}'
            },
            {
                name:'shouqi',
                component:'Button',
                _visible:'{{data.blrVisible}}',
                style:{margin:'0 auto 10px',border:'1px solid #0066b3',color:'#0066b3'},
                children:[
                    {
                        name:'text',
                        component:'::span',
                        children:'收起'
                    },
                    {
                        name:'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'shang',
                        style:{fontSize:'14px'}
                    }
                ],
                onClick:'{{function(){$sf("data.blrVisible",!data.blrVisible)}}}'
            },

            /***********联系人start******************/

            // {
			// 	name: 'line3',
			// 	component: 'Layout',
			// 	className: 'title',
			// 	children: [{
			// 		name: 'info',
			// 		className: 'info',
			// 		component: '::span',
			// 		children: '联系人'
			// 	}, {
			// 		name: 'line4',
			// 		className: 'line',
			// 		component: '::span',
			// 		children: ''
			// 	}]
			// },
			// {
        //     name: 'lxrNameItem',
        //     component: 'Form.Item',
        //     label: '姓名',
        //         required: true,
	     //    validateStatus: "{{data.other.error.linkName?'error':'success'}}",
	     //    help: '{{data.other.error.linkName}}',
        //     children: [{
        //         name: 'lxrName',
        //         component: 'Input',
			// 	placeholder:'请输入联系人',
			// 	className:'ttk-es-app-input',
        //         timeout: true,
        //         maxlength: 20,
        //         value: '{{data.form.linkName}}',
        //         onChange: "{{function(e){$sf('data.form.linkName',e.target.value);$changeCheck('linkName')}}}"
        //     }]
        // },
        //     {
        //     name: 'lxrPhoneItem',
        //     component: 'Form.Item',
        //     label: '手机',
        //         required: true,
	     //    validateStatus: "{{data.other.error.linkTel?'error':'success'}}",
	     //    help: '{{data.other.error.linkTel}}',
        //     children: [{
        //         name: 'lxrPhone',
        //         component: 'Input',
			// 	placeholder:'请输入手机号码',
			// 	className:'ttk-es-app-input',
        //         timeout: true,
        //         maxlength: 11,
        //         value: '{{data.form.linkTel}}',
        //         onChange: "{{function(e){$sf('data.form.linkTel',e.target.value);$changeCheck('linkTel')}}}"
        //     }]
        // },
            // {
            //     name: 'lxrJobItem',
            //     component: 'Form.Item',
            //     label: '职位',
            //     required: true,
            //     validateStatus: "{{data.other.error.position?'error':'success'}}",
            //     help: '{{data.other.error.position}}',
            //     children: [{
            //         name: 'lxrJob',
            //         component: 'Select',
            //         className:'ttk-es-app-input',
            //         // timeout: true,
            //         // maxlength: 20,
            //         value: '{{data.form.position}}',
            //         placeholder:'请选择职位',
            //         children:{
            //             name:'option',
            //             component:'::Select.Option',
            //             children:'{{data.lxrJob[_rowIndex].name}}',
            //             value:'{{data.lxrJob[_rowIndex].id}}',
            //             _power:'for in data.lxrJob'
            //         },
            //         onChange: "{{function(e){$sf('data.form.position',e);}}}"
            //     }]
            // },
            //新增的联系人
            {
                name:'addlxr',
                component:'::div',
                style:{
                    width:'100%',
                    minHeight:'20px',
                },
                _visible:'{{data.isAdd&&data.addLXR}}',
                children:'{{$renderLXR(data.addLXR)}}'
            },
            {
				name: 'line5',
				component: 'Layout',
				className: 'title',
                style:{
				    marginBottom:'20px'
                },
				children: [{
					name: 'info',
					className: 'info',
					component: '::a',
					children: '+ 新增联系人',
                    onClick:'{{$addArr}}'
					// style:{opacity:'0'}

				}, {
					name: 'line',
					className: 'line',
					component: '::span',
					children: ''
				}]
			},
            {
				name: 'line',
				component: 'Layout',
				className: 'title',
				children: [{
					name: 'info',
					className: 'info',
					component: '::span',
					style:{width:'400px',height:'40px'},
					children:[{
						name: 'protocol',
						component: 'Checkbox',
						checked: '{{data.isEnable}}',
                        style:{
						    marginRight:'5px'
                        },
						onChange: "{{function(e){$sf('data.isEnable',e.target.checked)}}}"
					},'同意使用方欣数据开放平台《',{
						name:'protocol_a',
						component:'::a',
						children:'服务协议',
                        onClick:'{{$openRuleContent}}'
					},'》'],
				}]
			}]
    }
}

export function getInitState() {
	return {
		data: {
			linkT:true,
			value: 1,
            isEnable: true,
			form: {
                dlfs:'2',
                areaCode:null,
                contactsDto:[],
                gsdlfs:'3',
                khsx: '003'
			},
            area:{

            },
			other: {
				error: {},
                loginTypeRelation:[2],//默认登录类型显示
                loginTypeMap: {},//登录类型
                areaQueryMap: {},//
                areaQuery: [],//存放省份
                IDType:[],//证件类型
                 //*****************读取CA证书begin*****************
                 CABox:false,           //默认不显示CA登录方式
                 CAStep: true,			//是否显示CA登录的详细信息
                 hasReadCA: false,		//是否已读取过证书
                 readOrgInfoBtn: true,	//读取按钮是否置灰
                 readSuc:false,//读取是否成功
                 //*****************读取CA证书 end *****************
                gsType:[]
			},
            dzswjmm:true,
            mw1:true,
            mw2:true,
            job:[
                {
                    id:100003,
                    name:'发票岗',
                    userName:'胡一天',
                    isEdit:false
                },
                {
                    id:100005,
                    name:'记账岗',
                    userName:'胡2天',
                    isEdit:false
                },
                {
                    id:100004,
                    name:'报税岗',
                    userName:'胡3天',
                    isEdit:false
                },{
                    id:100006,
                    name:'查询岗',
                    userName:'胡4天',
                    isEdit:false
                }
            ],
            customerList:[],
            importId:'',
            orgId:'',
            tt:[],
            isEdit:'',
            isId:'',
            CAState:'',
            lxrJob:[],
            bjblrJob:[],
            isAdd:false,
            addLXR:[],
            linkError:[],
            timeSJ:'获取验证码',
            timeStaus:true,
            blrVisible:false,
            yzm:false,
            JXYZM:false,
            serviceTypeOption: [//服务类型
                {
                    name: '全部服务',
                    value: '003'
                }, {
                    name: '一次性服务',
                    value: '001'
                }, {
                    name: '周期性服务',
                    value: '002'
                }

            ]
		}
	};
}
