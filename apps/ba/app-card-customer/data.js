import moment from 'moment';

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'app-card-customer',
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
                timeout: true,
                // maxlength: '50',
                value: '{{data.form.code}}',
                onChange: "{{function(e){$sf('data.form.code',e.target.value);$changeCheck('code')}}}"
            }]

        }, {
            name: 'nameItem',
            component: 'Form.Item',
            label: '名称',
            required: true,
            validateStatus: "{{data.other.error.name?'error':'success'}}",
            help: '{{data.other.error.name}}',
            children: [{
                name: 'name',
                component: 'Input',
                timeout: true,
                // maxlength: '200',
                value: '{{data.form.name}}',
	            // onChange: `{{function(e){$sf('data.form.name',e.target.value);$changeCheck('name');$payableAccountChange(e.target.value)}}}`,
                onChange:'{{function(e){$nameChange(e.target.value)}}}'
            }]
        }, {
            name: 'nameItem',
            component: 'Form.Item',
            label: '客户分类',
            help: '{{data.other.error.name}}',
            children: [{
				name: 'tree',
				component: 'TreeSelect',
				style:{width: '200px'},
				value:'{{data.form.categoryId}}',
				dropdownStyle:{ maxHeight: '200px', overflow: 'auto' },
				placeholder:'',
				showSearch:false,
				defaultValue:'未分类',
				onChange: `{{function(v){$fieldChange('data.form.categoryId',v)}}}`,
				className:'app-list-customer-header-left-tree',
				treeData:'{{data.other.category}}',
			},{
				name: 'btn',
				className: 'btn',
				component: '::a',
				onClick: '{{$managerItem}}',
				children: '分类设置'
			}]
        },{
			name: 'mobileItem',
			_visible: '{{data.linkT}}',
			component: 'Form.Item',
			children: [{
				name: 'remark',
				className: 'subjectRemark',
				component: '::div',
				children: ''
				// children: '注：预收科目、其他应收科目为空时,将默认取应收科目'
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
			label: '应收科目',
			_visible: '{{data.linkT}}',
	        // required: true,
	        // validateStatus: '{{data.other.error.receivableAccountId ? "error" : "success"}}',
	        // help: '{{data.other.error.receivableAccountId}}',
	        children: {
		        name: 'rate',
		        component: 'Select',
		        allowClear: true,
		        className: 'selectClear',
		        value: '{{data.form.receivableAccountId}}',
		        onChange: `{{function(v){if(v == undefined){$fieldChange('data.form.receivableAccountId',v)}}}}`,
		        onSelect: `{{function(v){$fieldChange('data.form.receivableAccountId',v)}}}`,
		        filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
		        // dropdownClassName: 'app-card-customer-dropdown',
		        dropdownFooter: {
			        name: 'add',
			        component: 'Button',
			        type: 'primary',
			        style: { width: '100%', borderRadius: '0' },
			        onClick: '{{function(){$addSubject("receivableAccountId")}}}',
			        children: '新增科目'
		        },
		        children: '{{$subjectListOption()}}'
	        }
        }, {
	        name: 'taxRateItem',
	        component: 'Form.Item',
			label: '预收科目',
			_visible: '{{data.linkT}}',
	        children: {
		        name: 'rate',
		        component: 'Select',
		        allowClear: true,
		        className: 'selectClear',
		        value: '{{data.form.receivableInAdvanceAccountId}}',
		        filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
		        onChange: `{{function(v){if(v == undefined){$fieldChange('data.form.receivableInAdvanceAccountId',v)}}}}`,
		        onSelect: `{{function(v){$fieldChange('data.form.receivableInAdvanceAccountId',v)}}}`,
		        // dropdownClassName: 'app-card-customer-dropdown',
		        dropdownFooter: {
			        name: 'add',
			        component: 'Button',
			        type: 'primary',
			        style: { width: '100%', borderRadius: '0' },
			        onClick: '{{function(){$addSubject("receivableInAdvanceAccountId")}}}',
			        children: '新增科目'
		        },
		        children: '{{$subjectListOption()}}'
	        }
        }, {
	        name: 'taxRateItem',
	        component: 'Form.Item',
			label: '其他应收科目',
			_visible: '{{data.linkT}}',
	        children: {
		        name: 'rate',
		        component: 'Select',
		        allowClear: true,
		        className: 'selectClear',
		        value: '{{data.form.otherReceivableAccountId}}',
		        filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
		        onChange: `{{function(v){if(v == undefined){$fieldChange('data.form.otherReceivableAccountId',v)}}}}`,
		        onSelect: `{{function(v){$fieldChange('data.form.otherReceivableAccountId',v)}}}`,
		        // dropdownClassName: 'app-card-customer-dropdown',
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
        },
	        {
				name: 'mobileItem',
				_visible: '{{data.linkT}}',
		        component: 'Form.Item',
		        children: [{
			        name: 'remark',
			        className: 'subjectRemark',
			        component: '::div',
			        children: ''
			        // children: '注：预收科目、其他应收科目为空时,将默认取应收科目'
		        }]
	        },
	        /* {
			// name: 'taxRateItem',
			// component: 'Form.Item',
			// label: '注',
			// required: true,
			// validateStatus: '{{data.other.error.rate?\'error\':\'success\'}}',
			// help: '{{data.other.error.rate}}',
			// children: {
				name: 'rate',
				component: '::span',
				style:{lineHeight:'37px'},
				children: '注:预收科目、其他应收科目为空时,将默认取应收科目'
			// }
		},*/{
		        name: 'line',
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
	        },  {
            name: 'taxNumberItem',
            component: 'Form.Item',
            label: '税号',
	        validateStatus: "{{data.other.error.taxNumber?'error':'success'}}",
	        help: '{{data.other.error.taxNumber}}',
            children: [{
                name: 'taxNumber',
                component: 'Input',
                timeout: true,
                // maxlength: 20,
                value: '{{data.form.taxNumber}}',
                onChange: "{{function(e){$sf('data.form.taxNumber',e.target.value);$changeCheck('taxNumber')}}}"
            }]
        }, {
            name: 'linkmanItem',
            component: 'Form.Item',
            label: '联系人',
	        validateStatus: "{{data.other.error.linkman?'error':'success'}}",
	        help: '{{data.other.error.linkman}}',
            children: [{
                name: 'linkman',
                component: 'Input',
                timeout: true,
                // maxlength: 50,
                value: '{{data.form.linkman}}',
                onChange: "{{function(e){$sf('data.form.linkman',e.target.value);$changeCheck('linkman')}}}"
            }]
        }, {
            name: 'contactNumberItem',
            component: 'Form.Item',
            label: '联系电话',
	        validateStatus: "{{data.other.error.contactNumber?'error':'success'}}",
	        help: '{{data.other.error.contactNumber}}',
            children: [{
                name: 'contactNumber',
                component: 'Input',
                timeout: true,
                // maxlength: 50,
                value: '{{data.form.contactNumber}}',
                onChange: "{{function(e){$sf('data.form.contactNumber',e.target.value);$changeCheck('contactNumber')}}}"
            }]
        }, {
            name: 'openingBankItem',
            component: 'Form.Item',
            label: '开户银行',
	        validateStatus: "{{data.other.error.openingBank?'error':'success'}}",
	        help: '{{data.other.error.openingBank}}',
            children: [{
                name: 'openingBank',
                component: 'Input',
                timeout: true,
                // maxlength: 50,
                value: '{{data.form.openingBank}}',
                onChange: "{{function(e){$sf('data.form.openingBank',e.target.value);$changeCheck('openingBank')}}}"
            }]
        }, {
            name: 'bankAccoutItem',
            component: 'Form.Item',
            label: '账号',
	        validateStatus: "{{data.other.error.bankAccout?'error':'success'}}",
	        help: '{{data.other.error.bankAccout}}',
            children: [{
                name: 'bankAccout',
                component: 'Input',
                timeout: true,
                // maxlength: 50,
                value: '{{data.form.bankAccout}}',
                onChange: "{{function(e){$sf('data.form.bankAccout',e.target.value);$changeCheck('bankAccout')}}}"
            }]
        }, {
            name: 'addressAndTelItem',
            component: 'Form.Item',
            label: '地址及电话',
	        className: 'textArea',
	        validateStatus: "{{data.other.error.addressAndTel?'error':'success'}}",
	        help: '{{data.other.error.addressAndTel}}',
            children: [{
                name: 'addressAndTel',
                component: 'Input.TextArea',
                timeout: true,
                // maxlength: 200,
	            className: 'textArea',
                value: '{{data.form.addressAndTel}}',
                onChange: "{{function(e){$sf('data.form.addressAndTel',e.target.value);$changeCheck('addressAndTel')}}}"
            }]
        }, {
            name: 'remarkItem',
            component: 'Form.Item',
            label: '备注',
	        className: 'textArea',
	        validateStatus: "{{data.other.error.remark?'error':'success'}}",
	        help: '{{data.other.error.remark}}',
            children: [{
                name: 'remark',
                component: 'Input.TextArea',
                timeout: true,
                // maxlength: 200,
                value: '{{data.form.remark}}',
                onChange: "{{function(e){$sf('data.form.remark',e.target.value);$changeCheck('remark')}}}"
            }]
        }, {
            name: 'statusItem',
            component: 'Form.Item',
            label: '停用',
            children: [{
                name: 'isEnable',
                component: 'Checkbox',
                checked: '{{!data.form.isEnable}}',
                onChange: "{{function(e){$sf('data.form.isEnable',!e.target.checked)}}}"
            }]
        }]
    }
}

export function getInitState() {
	return {
		data: {
			linkT:true,
			form: {
				code: '',
				name: '',
				isEnable: true,
				glAccounts:''
			},
			other: {
				glAccounts:[],
				error: {}
			}
		}
	};
}
