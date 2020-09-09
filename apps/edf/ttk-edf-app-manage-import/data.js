export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: 'ttk-edf-app-manage-import',
        style: {background: '#fff'},
        children: [{
			name: 'ttk',
			component: '::a',
			href: '#',
			style: {display: 'none'},
			id: 'toolLink'
		}, {
            name: 'add',
            component: '::div',
            className: 'ttk-edf-app-manage-import-container',
            children: [{
                name: 'download',
                component: '::div',
                className: 'ttk-edf-app-manage-import-container-title',
                children: [{
                    name: 'download',
                    component: '::span',
                    style: {float:'right'},
                    onClick: '{{function(){$downloadTool()}}}',
                    children: '下载导账采集工具'
                }, {
                    name: 'downloadIcon',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    style: {float:'right'},
                    type: 'xiazai',
                }]
            }, {
                name: 'content',
                component: '::div',
                className: 'ttk-edf-app-manage-import-content',
                children: [{
                    name: 'form',
                    component: '::div',
                    style: {marginBottom: '0'},
                    className: 'ttk-edf-app-manage-import-content-item1',
                    children: [{
                        name:'div',
                        component:'::div',
                        style:{width:'724px'},
                        children:[{
                            name: 'nameItem1',
                            component: 'Form.Item',
                            style: {marginTop: '35px', marginBottom: '18px'},
                            label: '上传文件',
                            validateStatus: "{{data.other.error.fileName?'error':'success'}}",
                            help: '{{data.other.error.fileName}}',
                            required: true,
                            colon: false,
                            children: [{
                                name: 'sub',
                                component: 'Input',
                                value: '{{data.form.fileName}}',
                                style:{ width: '365px',marginRight:'8px', textOverflow: 'ellipsis' },
                                placeholder:'请上传导账采集工具采集到的zip文件',
                                readonly: 'readonly',
                            },{
                                name: 'upload',
                                component: 'Upload',
                                beforeUpload: '{{$beforeLoad}}',
                                children: [{
                                    name: 'openingBankItem',
                                    component: 'Button',
                                    style: {fontSize: '12px'},
                                    className: 'uploadBtn',
                                    children: '上传'
                                }],
                                onChange: '{{$uploadChange}}',
                                showUploadList: false,
                                action: '{{"/v1/edf/file/upload?token=" + $getAccessToken()}}',
                                // headers: '{{$getAccessToken()}}',
                                accept:'.zip',
                                data: {orgIdNullable: true }
                            }]
                        },{
                            name: 'nameItem1',
                            component: 'Form.Item',
                            label: '{{sessionStorage["appId"] == 114 ? "账套名称" : "企业名称"}}',
                            required: true,
                            colon: false,
                            style: {marginBottom: '18px'},
                            validateStatus: "{{data.other.error.name?'error':'success'}}",
                            help: '{{data.other.error.name}}',
                            children: [{
                                name: 'name',
                                component: 'Input',
                                placeholder: '请输入营业执照的企业名称',
                                style: {width: '440px', height: '32px'},
                                onFocus: "{{function(e){$setField('data.other.error.name', undefined)}}}",
                                onBlur: "{{function(e){$fieldChange('data.form.name', e.target.value, 'create')}}}",
                                value: '{{data.form.name}}',
                                onChange: "{{function(e){$fieldChange('data.form.name', e.target.value)}}}",
                            }]
                        }, {
                            name: 'vatTaxpayerItem',
                            component: 'Form.Item',
                            label: '纳税人性质',
                            required: true,
                            colon: false,
                            style: {marginLeft: '-14px', marginBottom: '10px'},
                            className: 'vatTaxpayerItem',
                            validateStatus: "{{data.other.error.vatTaxpayer?'error':'success'}}",
                            help: '{{data.other.error.vatTaxpayer}}',
                            children: [{
                                name:'vatTaxpayer',
                                component: 'Radio.Group',
                                style: {width: '440px', textAlign: 'left'},
                                value: '{{data.form.vatTaxpayer}}',
                                onChange: "{{function(v){$sfs({'data.form.vatTaxpayer': v.target.value, 'data.other.error.vatTaxpayer': undefined})}}}",
                                children: [{
                                    name: 'option',
                                    component: 'Radio',
                                    key: '{{data.vatTaxpayer[_rowIndex].id}}',
                                    value: '{{data.vatTaxpayer[_rowIndex].id}}',
                                    children: '{{data.vatTaxpayer[_rowIndex].name}}',
                                    _power: 'for in data.vatTaxpayer'
                                }]
                            }]
                        }, {
                            name: 'enabledDateItem',
                            component: 'Form.Item',
                            label: '启用期间',
                            required: true,
                            colon: false,
                            validateStatus: "{{data.other.error.enableDate?'error':'success'}}",
                            style: {marginBottom: '15px'},
                            help: '{{data.other.error.enableDate}}',
                            children: [{
                                name: 'enabledDate',
                                disabled: true,
                                component: 'DatePicker.MonthPicker',
                                style: {width: '440px', height: '30px'},
                                value: "{{$stringToMoment((data.form.enabledDate),'YYYY-MM')}}",
                                placeholder: "启用期间",
                                onChange: "{{function(v){$sf('data.form.enabledDate', $momentToString(v,'YYYY-MM'))}}}",
                            }]
                        }, {
                            name: 'accountingStandardsItem',
                            component: 'Form.Item',
                            _visible: '{{!data.other.editStandard}}',
                            label: '会计准则',
                            required: true,
                            colon: false,
                            style: {margin: '0 auto 0', marginBottom: '14px'},
                            validateStatus: "{{data.other.error.accountingStandards?'error':'success'}}",
                            help: '{{data.other.error.accountingStandards}}',
                            children: [{
                                name: 'accountingStandards',
                                component: 'Select',
                                showSearch:false,
                                style: {width: '440px', height: '30px'},
                                value: '{{data.form.accountingStandards}}',
                                placeholder: "请选择会计准则",
                                onChange: "{{function(v,o){$sfs({'data.form.accountingStandards': v, 'data.other.error.accountingStandards': undefined})}}}",
                                children: {
                                    name: 'option',
                                    component: 'Select.Option',
                                    value: '{{data.accountingStandards[_rowIndex].id}}',
                                    children: '{{data.accountingStandards[_rowIndex].name}}',
                                    _power: 'for in data.accountingStandards'
                                }
                            }]
                        }]
                    }]
                }]
            },{
                name: 'remind',
                component: '::div',
                style: {textAlign: 'center', color: '#FA954C', marginBottom: '20px'},
                children: {
                    name: 'text',
                    component: '::span',
                    style: {marginLeft: '-191px', fontSize: '12px'},
                    children: '温馨提示：请认真核实启用日期、纳税人性质和会计准则'
                }
            }, {
                name: 'btn',
                component: '::div',
                className: 'ttk-edf-app-manage-import-btn',
                children: [{
                    name: 'add',
                    component: 'Button',
                    children: '取消',
                    _visible: '{{!((data.appVersion == 107 && sessionStorage["dzSource"] == 1) || data.appVersion == 114)}}',
                    onClick: '{{$cancel}}',
                    className: 'ttk-edf-app-manage-import-btn-cancel'
                }, {
                    name: 'cancel',
                    component: 'Button',
                    children: '下一步',
                    onClick: '{{$create}}',
                    className: 'ttk-edf-app-manage-import-btn-create'
                }]
            }]
        }]

    }
}

export function getInitState() {
    return {
        data: {
            form: {
                fileName: '',
                name: '',
                vatTaxpayer: '',
                enabledDate: '',
                accountingStandards: ''
            },
            other: {
                propertyList: [],
                error: {},
                editDate: false,
                editStandard: false
            },
            manageList: [],
            organization: ''
        }
    }
}
