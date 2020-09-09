export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-card-syndromescombine',
        children:[
            {
                name: 'nameItem',
                component: 'Form.Item',
                label: '纳税人名称',
                required: false,
                validateStatus: "{{data.other.error.name?'error':'success'}}",
                help: '{{data.other.error.name}}',
                children: [{
                    name: 'khName',
                    component: 'Input',
                    placeholder:'请输入客户名称',
                    className:'ttk-es-app-input',
                    disabled:true,
                    timeout: true,
                    maxlength: 50,
                    value: '{{data.form.name}}'
                }]
            },
            {
                name: 'nsrsbhOldItem',
                component: 'Form.Item',
                label: '旧纳税人识别号',
                required: true,
                validateStatus: "{{data.other.error.nsrsbh_old?'error':'success'}}",
                help: '{{data.other.error.nsrsbh_old}}',
                children: [
                    {
                        name: 'nsrsbh_old',
                        component: 'Input',
                        placeholder:'请输入纳税人识别号',
                        className:'ttk-es-app-input',
                        timeout: true,
                        maxlength: 20,
                        value: '{{data.form.nsrsbh_old}}',
                        onChange: "{{function(e){$sf('data.form.nsrsbh_old',e.target.value);$changeCheck('nsrsbh_old')}}}"
                    },
                    {
                        name: 'helpPopover',
                        component: 'Popover',
                        content: [{
                            name: 'p',
                            component: '::div',
                            children: [{
                                name: 'help1',
                                component: '::span',
                                children: '变更前的识别号'
                            }]
                        }],
                        placement: 'bottom',
                        overlayClassName: 'ttk-app-syndromes-card-helpPopover',
                        children: {
                            name: 'helpIcon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            type: 'bangzhutishi',
                            className: 'helpIcon'
                        }
                    }
                ]
            },
            {
                name: 'nsrsbhNewItem',
                component: 'Form.Item',
                label: '新纳税人识别号',
                required: true,
                validateStatus: "{{data.other.error.nsrsbh_new?'error':'success'}}",
                help: '{{data.other.error.nsrsbh_new}}',
                children: [
                    {
                        name: 'nsrsbh_new',
                        component: 'Input',
                        placeholder:'请输入纳税人识别号',
                        className:'ttk-es-app-input',
                        timeout: true,
                        maxlength: 20,
                        value: '{{data.form.nsrsbh_new}}',
                        onChange: "{{function(e){$sf('data.form.nsrsbh_new',e.target.value);$changeCheck('nsrsbh_new')}}}"
                    },
                    {
                        name: 'helpPopover',
                        component: 'Popover',
                        content: [{
                            name: 'p',
                            component: '::div',
                            children: [{
                                name: 'help2',
                                component: '::span',
                                children: '变更后的识别号'
                            }]
                        }],
                        placement: 'bottom',
                        overlayClassName: 'ttk-app-syndromes-card-helpPopover',
                        children: {
                            name: 'helpIcon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            type: 'bangzhutishi',
                            className: 'helpIcon'
                        }
                    }
                ]
            },
            {
                name: 'line',
                component: 'Layout',
                className: 'title',
                _visible: '{{data.linkT}}',
                children: [
                    {
                        name: 'info',
                        className: 'info',
                        component: '::span',
                        children: '登录信息：'
                    },
                    {
                        name: 'helpPopover',
                        component: 'Popover',
                        content: [{
                            name: 'p',
                            component: '::div',
                            children: [{
                                name: 'help2',
                                component: '::span',
                                children: '请输入变更后的账号密码'
                            }]
                        }],
                        placement: 'bottom',
                        overlayClassName: 'ttk-app-syndromes-info-card-helpPopover',
                        children: {
                            name: 'helpIcon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            type: 'bangzhutishi',
                            className: 'helpIcon'
                        }
                    },
                    {
                        name: 'line',
                        className: 'line',
                        component: '::span',
                        children: ''
                    }
                ]
            },
            {
                name: 'loginItem',
                component: 'Form.Item',
                label: '登录方式',
                className:'ttk-es-app-card-syndromescombine-login-type',
                required: false,
                validateStatus: "{{data.other.error.code?'error':'success'}}",
                help: '{{data.other.error.code}}',
                children: [{
                    name: 'loginType',
                    component: '::div',
                    className:'ttk-es-app-card-syndromescombine-login-type-group',
                    children: [
                        {
                            name: 'loginTypeGroup',
                            component: 'Radio.Group',
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
                        },
                        {
                            name: 'loginType2',
                            component: 'Checkbox',
                            _visible: '{{data.form.registeredProvincial == "370000" && data.form.registeredCounty != "370201" }}',
                            className:'',
                            children: 'CA登录',
                            timeout: true,
                            value: 'CA登录',
                            // onChange: "{{function(e){$sf('data.form.code',e.target.value);$changeCheck('code')}}}"
                        }
                    ],
                }]
            },
            //3.电子税务局账户
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
                    maxlength: 20,
                    value: '{{data.form.dlzh}}',
                    onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
                }]
            },
            {
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
                    maxlength: 20,
                    value: '{{data.form.dlmm}}',
                    onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
                }]
            },
            //2.网报账号
            {
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
                    autoComplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 20,
                    value: '{{data.form.dlzh}}',
                    onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
                }]
            },
            {
                name: 'nameItem4',
                component: 'Form.Item',
                label: '网报账号密码',
                _visible: '{{data.form.dlfs == 2}}',
                required: true,
                validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
                help: '{{data.other.error.dlmm}}',
                children: [{
                    name: 'dzsjPassword',
                    component: 'Input',
                    type:'password',
                    placeholder:'请输入网报账号密码',
                    autoComplete:'off',
                    className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                    timeout: true,
                    maxlength: 20,
                    value: '{{data.form.dlmm}}',
                    onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
                }]
            },
            //6.手机号
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
                    autoComplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 11,
                    value: '{{data.form.dlzh}}',
                    onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
                }]
            },
            {
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
                    autoComplete:'off',
                    className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                    timeout: true,
                    maxlength: 20,
                    value: '{{data.form.dlmm}}',
                    onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
                }]
            },
            //7授权人登录
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

            },
            {
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
                    autoComplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 18,
                    value: '{{data.form.sfz}}',
                    onChange: "{{function(e){$sf('data.form.sfz',e.target.value);$changeCheck('sfz')}}}"
                }]

            },
            {
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
                    autoComplete:'off',
                    className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                    timeout: true,
                    maxlength: 20,
                    value: '{{data.form.dlmm}}',
                    onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
                }]
            },
            //4.证件类型
            {
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
            },
            {
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
                    autoComplete:'off',
                    className:'ttk-es-app-input',
                    timeout: true,
                    maxlength: 20,
                    value: '{{data.form.dlzh}}',
                    onChange: "{{function(e){$sf('data.form.dlzh',e.target.value);$changeCheck('dlzh')}}}"
                }]
            },
            {
                name: 'nameItem9',
                component: 'Form.Item',
                label: '密码',
                _visible: '{{data.form.dlfs == 4}}',
                required: true,
                validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
                help: '{{data.other.error.dlmm}}',
                children: [{
                    name: 'dzsjPassword',
                    component: 'Input',
                    type:'password',
                    placeholder:'请输入密码',
                    autoComplete:'off',
                    className:'{{data.dzswjmm?"ttk-es-app-input":"ttk-es-app-inputdz"}}',
                    timeout: true,
                    maxlength: 20,
                    value: '{{data.form.dlmm}}',
                    onChange: "{{function(e){$sf('data.form.dlmm',e.target.value);$changeCheck('dlmm')}}}"
                }]
            },
            //1.CA
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
                    autoComplete:'off',
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
                _visible: '{{data.form.dlfs == 1}}',
                required: true,
                validateStatus: "{{data.other.error.dlmm?'error':'success'}}",
                help: '{{data.other.error.dlmm}}',
                children: [{
                    name: 'dzsjPassword',
                    component: 'Input',
                    // type:'password',
                    placeholder:'请输入证书有效期',
                    autoComplete:'off',
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
                className: 'camain',
                _visible: '{{data.form.dlfs == 1}}',
                children: [
                    {
                        name: 'line3',
                        component: '::div',
                        className:'ttk-app-syndromes-ca-line',
                        children: [
                            {
                                name: 'ttk',
                                component: '::a',
                                href: '#',
                                style: { display: 'none' },
                                id: 'caHype'
                            },
                            {
                                name: 'step',
                                component: '::div',
                                className:'ttk-app-syndromes-ca-line-step',
                                // _visible: '{{data.other.CAStep}}',
                                children: [
                                    {
                                        name: 'step2',
                                        component: '::div',
                                        className:'ttk-app-syndromes-ca-line-step-step2',
                                        style: { float:'left',marginLeft:'10px'},
                                        children: [
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
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

export function getInitState() {
    return {
        data:{
            form:{
                name:'',
                nsrsbh_old:'',
                nsrsbh_new:'',
                registeredProvincial:'',
                registeredCounty:'',
                sfz:''
            },
            other: {
                error: {},
                loginTypeMap:{},
                loginTypeRelation:[],
                CABox:false,           //默认不显示CA登录方式
                CAStep: true,			//是否显示CA登录的详细信息
                hasReadCA: false,		//是否已读取过证书
                readOrgInfoBtn: true,	//读取按钮是否置灰
                readSuc:false,//读取是否成功
            },
            IDType:[],
            CAState:'',
            tt:[],
            importId:'',
            isEdit:'',
            gg:'',
            dzswjmm:true,
        }
    }
}