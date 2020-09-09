import {consts} from 'edf-consts'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-ztmanage-add',
        style: {background: '#fff'},
        children: [{
            name: 'directAdd',
            component: '::div',
            children: [ {
                name: 'content',
                component: '::div',
                className: 'ttk-es-app-ztmanage-add-content',
                // style: {padding: '0px 200px'},
                children: [{
                    name: 'item1',
                    component: '::div',
                    style: {marginBottom: '0'},
                    // validateStatus: "{{data.other.error.mobile?'error':'success'}}",
                    // help: '{{data.other.error.mobile}}',
                    className: 'ttk-es-app-ztmanage-add-content-item1',
                    children: [{
                        name:'div',
                        component:'::div',
                        style:{width:'400px',display:'flex',alignItems:'flex-start',flexDirection:'column'},
                        children:[{
                            name: 'nameItem1',
                            component: 'Form.Item',
                            label: '账套名称',
                            required: true,
                            style: {display: 'flex'},
                            validateStatus: "{{data.other.error.name?'error':'success'}}",
                            help: '{{data.other.error.name}}',
                            children: [{
                                name: 'name',
                                // autoFocus: 'autoFocus',
                                component: 'Input',
                                placeholder: '请输入账套名称',
                                style: {width: '290px', height: '32px'},
                                // onFocus: "{{function(e){$setField('data.other.error.name', undefined)}}}",
                                onBlur: "{{function(e){$fieldChange('data.form.name', e.target.value, 'create')}}}",
                                value: '{{data.form.name}}',
                                onChange: "{{function(e){$fieldChange('data.form.name', e.target.value)}}}",
                            }]
                        }, {
                            name: 'vatTaxpayerItem',
                            component: 'Form.Item',
                            label: '纳税人身份',
                            required: true,
                            style: {display: 'flex'},
                            validateStatus: "{{data.other.error.vatTaxpayer?'error':'success'}}",
                            help: '{{data.other.error.vatTaxpayer}}',
                            children: [{
                                // name: 'vatTaxpayer',
                                // component: 'Select',
                                // showSearch:false,
                                // style: {width: '290px', height: '30px'},
                                // value: '{{data.form.vatTaxpayer}}',
                                // placeholder: "纳税人身份",
                                // onSelect: "{{function(v){$setField('data.form.vatTaxpayer', v)}}}",
                                // children: {
                                //     name: 'option',
                                //     component: 'Select.Option',
                                //     value: '{{data.vatTaxpayer[_rowIndex].id}}',
                                //     children: '{{data.vatTaxpayer[_rowIndex].name}}',
                                //     _power: 'for in data.vatTaxpayer'
                                // }
                                name:'vatTaxpayer',
                                component: 'Radio.Group',
                                value: '{{data.form.vatTaxpayer}}',
                                _visible: '{{data.sourceType==0}}',
                                onChange: "{{function(v){$sfs({'data.form.vatTaxpayer': v.target.value, 'data.other.error.vatTaxpayer': undefined})}}}",
                                children: [{
                                    name: 'option',
                                    component: 'Radio',
                                    key: '{{data.vatTaxpayer[_rowIndex].id}}',
                                    value: '{{data.vatTaxpayer[_rowIndex].id}}',
                                    children: '{{data.vatTaxpayer[_rowIndex].name}}',
                                    _power: 'for in data.vatTaxpayer'
                                }]
                            },{
                                name: 'formItemText',
                                component: '::span',
                                className: 'formItemText',
                                _visible: '{{data.sourceType==1}}',
                                children: '{{$getFormItemValue(data.form.vatTaxpayer, data.vatTaxpayer, data.sourceType)}}',
                                children: '{{data.other.vatTaxpayerName}}',
                            },
                                {
                                  name:'editPerson',
                                    component: 'Popover',
                                    // _visible:false,
                                    _visible:'{{data.sourceType==1}}',
                                    content: '变更',
                                    placement: 'bottom',
                                    overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                                    children: {
                                        name: 'icon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        type: 'bianji ',
                                        className: 'ttk-es-app-ztmanage-add-editper',
                                        onClick:'{{function(){$editVatTaxPayer(data.other.vatTaxpayerName)}}}',
                                    }
                                },
                                {
                                    name:'infoPerson',
                                    component: 'Popover',
                                    // _visible:false,
                                    _visible:'{{data.sourceType==1 && data.viewVisible}}',
                                    content: '查看',
                                    placement: 'bottom',
                                    overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                                    children: {
                                        name: 'icon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        type: 'chakan',
                                        className: 'ttk-es-app-ztmanage-add-editper',
                                        style:{top:'4px'},
                                        onClick:'{{$viewVatTaxPayer}}',
                                    }
                                },

                            ]
                        },
                        {
                            name: 'isTutorialDateMain',
                            component: 'Form.Item',
                            //label: '辅导期',
                            required: true,
                            style: {display: 'flex'},
                            _visible: '{{data.sourceType==0 && data.form.vatTaxpayer==2000010001}}',
                            validateStatus: "{{data.other.error.fdq?'error':'success'}}",
                            help: '{{data.other.error.fdq}}',
                            children: [{
                                    name: 'isTutorialDate',
                                    component: 'Checkbox',
                                    style: {marginLeft: '65px'},
                                    value: "",
                                    disabled:'{{data.dowloadNSRXX && data.isTutorialDate}}',
                                    checked: '{{data.form.isEnable}}',
                                    onChange: "{{function(e){$changeFDQ(e)}}}",
                                    //onChange: '{{function(e){$checkTutorial(e.target.checked)}}}',
                                    //_visible: '{{data.sourceType==0}}',
                                },
                                {
                                    name: 'isTutorialDateSP',
                                    component: '::span',
                                    className: 'isTutorialDateSP',
                                    children: '辅导期'
                                },
                                {
                                    name: 'isTutorialDateBox',
                                    component: '::span',
                                    style:{width:'266px',},
                                    _visible: '{{data.form.isEnable && data.sourceType==0 }}',
                                    //_visible: '{{$isTutorialInfo()}}',
                                    children:[{
                                            name: 'tutorialBeginDate',
                                            component: 'DatePicker.MonthPicker',
                                            style:{width:'102px',textAlign:'center'},
                                            //required: true,
                                            placeholder: "有效期起",
                                            disabled:"{{data.dowloadNSRXX && data.isTutorialDate}}",
                                            // disabledDate:'{{$disabledFDQStart}}',
                                            value: "{{$stringToMoment((data.form.tutorialBeginDate),'YYYY-MM')}}",
                                            onChange: "{{function(v){$sf('data.form.tutorialBeginDate', $momentToString(v,'YYYY-MM'))}}}",
                                        },
                                        {
                                            name:'dz_spline',
                                            component:'::span',
                                            style:{width:'21px',textAlign:'center',padding:'0 6px'},
                                            children:'-'
                                        },
                                        {
                                            name: 'tutorialEndDate',
                                            component: 'DatePicker.MonthPicker',
                                            style:{width:'102px',textAlign:'center'},
                                            //required: true,
                                            placeholder: "有效期止",
                                            disabled:"{{data.dowloadNSRXX && data.isTutorialDate}}",
                                            // disabledDate:'{{$disabledFDQEnd}}',
                                            value: "{{$stringToMoment((data.form.tutorialEndDate),'YYYY-MM')}}",
                                            onChange: "{{function(v){$sf('data.form.tutorialEndDate', $momentToString(v,'YYYY-MM'))}}}",
                                        }
                                     ] 
                                },
                                // {
                                //     name: 'formItemText',
                                //     component: '::span',
                                //     className: 'formItemText',
                                //     _visible: '{{data.form.isEnable && data.sourceType==1}}',
                                //     // children: '{{$getFormItemValue(data.form.vatTaxpayer, data.vatTaxpayer, data.sourceType)}}',
                                //     children: [{
                                //         component:'::span',
                                //         children:"{{data.form.tutorialBeginDate}}"
                                //     },{
                                //         component:'::span',
                                //         children:'-'
                                //     },{
                                //         component:'::span',
                                //         children:"{{data.form.tutorialEndDate}}"
                                //     }],
                                // }
                            ]
                        },
                            {
                                name: 'isTutorialDateMain',
                                component: 'Form.Item',
                                label: '辅导期',
                                // required: true,
                                style: {display: 'flex'},
                                _visible: '{{data.sourceType==1 && data.form.vatTaxpayer==2000010001 && data.form.isEnable}}',
                                validateStatus: "{{data.other.error.fdq?'error':'success'}}",
                                help: '{{data.other.error.fdq}}',
                                children: [
                                //     {
                                //     name: 'isTutorialDate',
                                //     component: 'Checkbox',
                                //     style: {marginLeft: '65px'},
                                //     value: "",
                                //     checked: '{{data.form.isEnable}}',
                                //     onChange: "{{function(e){$sf('data.form.isEnable',e.target.checked)}}}",
                                //     //onChange: '{{function(e){$checkTutorial(e.target.checked)}}}',
                                //     //_visible: '{{data.sourceType==0}}',
                                // },
                                //     {
                                //         name: 'isTutorialDateSP',
                                //         component: '::span',
                                //         className: 'isTutorialDateSP',
                                //         children: '辅导期：'
                                //     },
                                    // {
                                    //     name: 'isTutorialDateBox',
                                    //     component: '::span',
                                    //     style:{width:'266px',},
                                    //     _visible: '{{data.form.isEnable && data.sourceType==0 }}',
                                    //     //_visible: '{{$isTutorialInfo()}}',
                                    //     children:[{
                                    //         name: 'tutorialBeginDate',
                                    //         component: 'DatePicker.MonthPicker',
                                    //         style:{width:'102px',textAlign:'center'},
                                    //         //required: true,
                                    //         placeholder: "有效期起",
                                    //         value: "{{$stringToMoment((data.form.tutorialBeginDate),'YYYY-MM')}}",
                                    //         onChange: "{{function(v){$sf('data.form.tutorialBeginDate', $momentToString(v,'YYYY-MM'))}}}",
                                    //     },
                                    //         {
                                    //             name:'dz_spline',
                                    //             component:'::span',
                                    //             style:{width:'21px',textAlign:'center',padding:'0 6px'},
                                    //             children:'-'
                                    //         },
                                    //         {
                                    //             name: 'tutorialEndDate',
                                    //             component: 'DatePicker.MonthPicker',
                                    //             style:{width:'102px',textAlign:'center'},
                                    //             //required: true,
                                    //             placeholder: "有效期止",
                                    //             value: "{{$stringToMoment((data.form.tutorialEndDate),'YYYY-MM')}}",
                                    //             onChange: "{{function(v){$sf('data.form.tutorialEndDate', $momentToString(v,'YYYY-MM'))}}}",
                                    //         }
                                    //     ]
                                    // },
                                    {
                                        name: 'formItemText',
                                        component: '::span',
                                        className: 'formItemText',
                                        // _visible: '{{data.form.isEnable && data.sourceType==1}}',
                                        // children: '{{$getFormItemValue(data.form.vatTaxpayer, data.vatTaxpayer, data.sourceType)}}',
                                        children: [{
                                            component:'::span',
                                            children:"{{data.isTutorialDate && data.form.tutorialBeginDate.substring(0,7)}}"
                                            // children:"{{data.form.tutorialBeginDate}}"
                                        },{
                                            component:'::span',
                                            children:'至'
                                        },{
                                            component:'::span',
                                            children:"{{data.isTutorialDate && data.form.tutorialEndDate.substring(0,7)}}"
                                            // children:"{{data.form.tutorialEndDate}}"
                                        }],
                                    }
                                ]
                            },
                        {
                            name: 'enabledDateItem',
                            component: 'Form.Item',
                            _visible: '{{!data.other.editDate}}',
                            label: '启用期间',
                            required: true,
                            style: {display: 'flex'},
                            // style: {display: 'flex', width: '50%', margin: '0 auto'},
                            validateStatus: "{{data.other.error.enableDate?'error':'success'}}",
                            help: '{{data.other.error.enableDate}}',
                            children: [{
                                name: 'enabledDate',
                                component: 'DatePicker.MonthPicker',
                                style: {width: '290px', height: '30px'},
                                value: "{{$stringToMoment((data.form.enabledDate),'YYYY-MM')}}",
                                _visible: '{{data.sourceType==0}}',
                                placeholder: "启用期间",
                                onChange: "{{function(v){$sf('data.form.enabledDate', $momentToString(v,'YYYY-MM'))}}}",
                            },{
                                name: 'formItemText',
                                component: '::span',
                                className: 'formItemText',
                                _visible: '{{data.sourceType==1}}',
                                children: '{{data.form.enabledDate}}'
                            }]
                        }, {
                            name: 'accountingStandardsItem',
                            component: 'Form.Item',
                            _visible: '{{!data.other.editStandard}}',
                            label: '会计准则',
                            required: true,
                            style: {display: 'flex', margin: '0'},
                            validateStatus: "{{data.other.error.accountingStandards?'error':'success'}}",
                            help: '{{data.other.error.accountingStandards}}',
                            children: [{
                                name: 'accountingStandards',
                                component: 'Select',
                                showSearch:false,
                                style: {width: '290px', height: '30px'},
                                value: '{{data.form.accountingStandards}}',
                                _visible: '{{data.sourceType==0}}',
                                placeholder: "请选择会计准则",
                                onChange: "{{function(v,o){$sfs({'data.form.accountingStandards': v, 'data.other.error.accountingStandards': undefined})}}}",
                                children: {
                                    name: 'option',
                                    component: 'Select.Option',
                                    value: '{{data.accountingStandards[_rowIndex].id}}',
                                    children: '{{data.accountingStandards[_rowIndex].name}}',
                                    _power: 'for in data.accountingStandards'
                                }
                            },{
                                name: 'formItemText',
                                component: '::span',
                                className: 'formItemText',
                                _visible: '{{data.sourceType==1}}',
                                children: '{{$getFormItemValue(data.form.accountingStandards,data.accountingStandards, data.sourceType)}}',
                                children: '{{data.other.accountingStandardsName}}',
                            }]
                        },{
                            name: 'industrysItem',
                            component: 'Form.Item',
                            _visible: '{{!data.other.editStandard}}',
                            label: '所属行业',
                            required: true,
                            style: {display: 'flex', margin: '0'},
                            validateStatus: "{{data.other.error.industrys?'error':'success'}}",
                            help: '{{data.other.error.industrys}}',
                            children: [{
                                name: 'industrys',
                                component: 'Select',
                                showSearch:false,
                                style: {width: '290px', height: '30px'},
                                value: '{{data.form.industrys}}',
                                // _visible: '{{data.sourceType==0}}',
                                placeholder: "请选择所属行业",
                                onChange: "{{function(v,o){$sfs({'data.form.industrys': v, 'data.other.error.industrys': undefined})}}}",
                                children: {
                                    name: 'option',
                                    component: 'Select.Option',
                                    value: '{{data.industrys[_rowIndex].id}}',
                                    children: '{{data.industrys[_rowIndex].name}}',
                                    _power: 'for in data.industrys'
                                }
                            },
                            // ,{
                            //     name: 'formItemTextSshy',
                            //     component: '::span',
                            //     className: 'formItemText',
                            //     _visible: '{{data.sourceType==1}}',
                            //     children: '{{$getFormItemValue(data.form.industrys,data.industrys, data.sourceType)}}',
                            //     children: '{{data.other.industrysName}}',
                            // }
                            ]
                        },{
                            name: 'financeCreatorItem',
                            component: 'Form.Item',
                            label: '制单人',
                            // required: true,
                            style: {display: 'flex'},
                            validateStatus: "{{data.other.error.financeCreator?'error':'success'}}",
                            help: '{{data.other.error.financeCreator}}',
                            children: [{
                                name: 'financeCreator',
                                // autoFocus: 'autoFocus',
                                component: 'Input',
                                placeholder: '请输入制单人',
                                // disabled: true,
                                style: {width: '290px', height: '32px'},
                                // onFocus: "{{function(e){$setField('data.other.error.financeCreator', undefined)}}}",
                                onBlur: "{{function(e){$fieldChange('data.form.financeCreator', e.target.value, 'create')}}}",
                                value: '{{data.form.financeCreator}}',
                                onChange: "{{function(e){$fieldChange('data.form.financeCreator', e.target.value)}}}",
                            }]
                        },{
                            name: 'financeAuditorItem',
                            component: 'Form.Item',
                            label: '审核人',
                            // required: true,
                            style: {display: 'flex'},
                            validateStatus: "{{data.other.error.financeAuditor?'error':'success'}}",
                            help: '{{data.other.error.financeAuditor}}',
                            children: [{
                                name: 'financeAuditor',
                                // autoFocus: 'autoFocus',
                                component: 'Input',
                                placeholder: '请输入审核人',
                                // disabled: true,
                                style: {width: '290px', height: '32px'},
                                // onFocus: "{{function(e){$setField('data.other.error.financeAuditor', undefined)}}}",
                                onBlur: "{{function(e){$fieldChange('data.form.financeAuditor', e.target.value, 'create')}}}",
                                value: '{{data.form.financeAuditor}}',
                                onChange: "{{function(e){$fieldChange('data.form.financeAuditor', e.target.value)}}}",
                            }]
                        },
                        {
                            name: 'accountSupervisorItem',
                            component: 'Form.Item',
                            label: '{{$getCheckLabel()}}',
                            // required: true,
                            style: {display: 'flex'},
                            validateStatus: "{{data.other.error.accountSupervisor?'error':'success'}}",
                            help: '{{data.other.error.accountSupervisor}}',
                            children: [{
                                name: 'accountSupervisor',
                                // autoFocus: 'autoFocus',
                                component: 'Input',
                                placeholder: '请输入账套主管',
                                disabled: '{{!data.isZtzg}}',
                                style: {width: '290px', height: '32px'},
                                // onFocus: "{{function(e){$setField('data.other.error.accountSupervisor', undefined)}}}",
                                onBlur: "{{function(e){$fieldChange('data.form.accountSupervisor', e.target.value, 'create')}}}",
                                value: '{{data.form.accountSupervisor}}',
                                onChange: "{{function(e){$fieldChange('data.form.accountSupervisor', e.target.value)}}}",
                            }]
                        },
                        // {
                            //     name: 'message',
                            //     component: 'Form.Item',
                            //     label: '温馨提示：',
                            //     className: 'messageTitle',
                            //     style: {display: 'flex'},
                            //     children: [{
                            //         name: 'name',
                            //         // autoFocus: 'autoFocus',
                            //         component: '::span',
                            //         // placeholder: '请输入审核人',
                            //         // disabled: true,
                            //         // style: {width: '290px', height: '32px'},
                            //         children: '1、请认真核实启用日期、纳税人性质和会计准则'
                            //     },
                            //         {
                            //             name: 'name2',
                            //             // autoFocus: 'autoFocus',
                            //             component: '::span',
                            //             // placeholder: '请输入审核人',
                            //             // disabled: true,
                            //             // style: {width: '290px', height: '32px'},
                            //             children: '  2、制单人/审核人如果有值，财务相关单据对应字段按所填写的内容进行生成，否则按系统默认规则（实际操作人员）进行生成'
                            //         }]
                            // }
                            {
                                name: 'message',
                                component: '::div',
                                children:'温馨提示：',
                                className: 'messageTitle',
                                style:{color:' #FA954C',fontSize:'12px',marginLeft:'20px'}
                            },
                            {
                                name: 'message1',
                                component: '::div',
                                children:'1、请认真核实启用日期、纳税人性质和会计准则',
                                // className: 'messageTitle',
                                style:{fontSize:'12px',marginLeft:'20px'}
                            },
                            {
                                name: 'message2',
                                component: '::div',
                                children:'2、制单人/审核人如果有值，财务相关单据对应字段按所填写的内容进行生成，否则按系统默认规则（实际操作人员）进行生成',
                                // className: 'messageTitle',
                                style:{fontSize:'12px',marginLeft:'20px',marginBottom:'15px'}
                            },
                        ]
                    }]
                }]
            }, {
                name: 'btn',
                component: '::div',
                className: 'ttk-es-app-ztmanage-add-btn',
                children: [{
                    name: 'cancel',
                    component: 'Button',
                    // type:'primary',
                    children: '创建',
                    _visible: '{{data.sourceType==0}}',
                    onClick: '{{$create}}',
                    className: 'ttk-es-app-ztmanage-add-btn-create'
                },{
                    name: 'save',
                    component: 'Button',
                    // type:'primary',
                    children: '确定',
                    _visible: '{{data.sourceType==1}}',
                    onClick: '{{$save}}',
                    className: 'ttk-es-app-ztmanage-add-btn-create'
                },{
                    name: 'add',
                    component: 'Button',
                    children: '取消',
                    onClick: '{{$cancel}}',
                    className: 'ttk-es-app-ztmanage-add-btn-cancel'
                }]
            }]
        }]
        
    }
}

export function getInitState() {
    return {
        data: {
            form: {
                name: '',
                enabledDate:'',
                tutorialBeginDate:'',
                tutorialEndDate:'',
                isEnable: false,
            },
            other: {
                propertyList: [],
                error: {},
                editDate: false,
                editStandard: false,
                title: '创建账套'
            },
            manageList: [],
            showAdd: true,
            vatTaxpayer: [
                {
                    "id":2000010001,
                    "name":"一般纳税人",
                    "code":"generalTaxPayer"
                },
                {
                    "id":2000010002,
                    "name":"小规模纳税人",
                    "code":"smallScaleTaxPayer"
                }
            ],
            accountingStandards: [
                {
                    "id":2000020001,
                    "name":"企业会计准则(一般企业)",
                    "code":"2007"
                },
                {
                    "id":2000020002,
                    "name":"小企业会计准则",
                    "code":"2013"
                },
                {
                    "id":2000020008,
                    "name":"民间非营利组织会计制度",
                    "code":"nonprofit"
                },
                {
                    code: "SimplyGeneralEnterprise",
                    id: 2000020016,
                    name: "企业会计准则(一般企业)【精简】",
                },
                {
                    code: "SimplySmallCompany",
                    id: 2000020032,
                    name: "小企业会计准则【精简】",
                }
            ],
            industrys: [
                {
                    "id":2000300001,
                    "name":"制造业",
                    "code":"001"
                },
                {
                    "id":2000300002,
                    "name":"商贸业",
                    "code":"002"
                },
                {
                    "id":2000300003,
                    "name":"服务业",
                    "code":"003"
                },
                {
                    "id":2000300004,
                    "name":"其他",
                    "code":"004"
                }
            ],
            dowloadNSRXX:true,//是否下载纳税人信息
            isTutorialDate:null,//是否是辅导期纳税人
            viewVisible:false,//是否显示查看按钮
            // isAdministrative:false,//账套主管是否可编辑
            isZtzg:false,//账套主管是否可编辑

        }
    }
}