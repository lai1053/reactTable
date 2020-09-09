import { consts } from 'edf-consts'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-edf-app-tax-type-change',
        children: [{
            name: 'form',
            component: 'Form',
            className: 'ttk-edf-app-tax-type-change-form',
            children: [{
	            name: 'taxType',
	            component: 'Form.Item',
	            label: '税种',
	            validateStatus: '{{data.other.error.rate ? "error" : "success"}}',
	            help: '{{data.other.error.rate}}',
	            children: {
		            name: 'rate',
		            component: 'Select',
		            value: '{{data.form.sbbDm}}',
                    filterOptionExpressions: 'code,name',
                    disabled:'{{data.other.isDisableTaxType}}',
		            onSelect: `{{$taxType}}`,
		            children: '{{$selectOptionCode(200035)}}'
	            }
            }, {
	            name: 'ratepayingDate',
                component: 'Form.Item',
                className:'dateSelect',
	            label: '纳税期限',
	            children:[{
		            name: 'rate',
		            component: 'Select',
                    value: '{{data.form.NSQXDM}}',
                    disabled:'{{data.other.TaxTimeType}}',
                    filterOptionExpressions: 'code,name',
		            onSelect: `{{function(v){$fieldChange('data.form.NSQXDM',v)}}}`,
		            children: '{{$selectOptionCode(200022)}}'
                },{
                    name: 'isJCLBCheckbox',
                    className:'isJCLB',
                    component: 'Checkbox',
                    checked: '{{data.form.isJCLB}}',
                    onChange: "{{function(e){$sf('data.form.isJCLB',e.target.checked)}}}"
                },{
                    name: 'isEnableSpan',
                    component: '::span',
                    children: '检查漏报'
                }
            ]
            }, {
	            name: ' companyType',
	            component: 'Form.Item',
	            label: '企业类型',
                _visible: '{{data.form.sbbDm == "QYSDSASB"}}',
	            children: {
		            name: 'rate',
		            component: 'Select',
                    value: '{{data.form.QYLX ? Number(data.form.QYLX) :data.form.QYLX}}',
		            filterOptionExpressions: 'code,name',
		            onSelect: `{{function(v){$fieldChange('data.form.QYLX',v)}}}`,
                    children: '{{$selectOption(200033)}}'
	            }
            }, {
	            name: 'prepayType',
	            component: 'Form.Item',
	            label: '预缴方式',
                _visible: '{{data.form.sbbDm == "QYSDSASB"}}',
	            children: {
		            name: 'rate',
		            component: 'Select',
		            className: 'selectClear',
                    value: '{{data.form.YJFS ? Number(data.form.YJFS) : data.form.YJFS}}',
		            filterOptionExpressions: 'code,name',
		            onSelect: `{{function(v){$fieldChange('data.form.YJFS',v)}}}`,
                    children: '{{$selectOption(200034)}}'
                }
            },{
                name: 'isCZXFZFZForm',
                component: 'Form.Item',
                label: '     ',
                _visible: '{{data.form.sbbDm == "FJSSB"}}',
                children: [{
                    name: 'isCZXFZFZCheckbox',
                    component: 'Checkbox',
                    checked: '{{data.form.isCZXFZFZ}}',
                    onChange: "{{function(e){$sf('data.form.isCZXFZFZ',e.target.checked)}}}"
                },{
                    name: 'isCZXFZFZSpan',
                    component: '::span',
                    children: '存在消费税附征'
                }]
            }, {
	            name: ' cityBuildTaxType',
	            component: 'Form.Item',
	            label: '城建税类型',
                _visible: '{{data.form.sbbDm == "FJSSB"}}',
                children: {
		            name: 'rate',
		            component: 'Select',
		            className: 'selectClear',
                    value: '{{data.form.CJSLX ? Number(data.form.CJSLX) : data.form.CJSLX}}',
		            filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
		            onSelect: `{{function(v){$fieldChange('data.form.CJSLX',v)}}}`,
                    children: '{{$selectOption(200032)}}'
	            }
            }, {
                name: 'isJCKQYForm',
                component: 'Form.Item',
                label: '     ',
                _visible: '{{data.form.sbbDm == "ZZSYBNSRSB"}}',
                children: [{
                    name: 'isJCKQYCheckbox',
                    component: 'Checkbox',
                    checked: '{{data.form.isJCKQY}}',
                    onChange: "{{function(e){$sf('data.form.isJCKQY',e.target.checked)}}}"
                },{
                    name: 'isEnableSpan',
                    component: '::span',
                    children: '是否出口企业'
                }]
            }, {
                name: 'isJJDJForm',
                component: 'Form.Item',
                label: '     ',
                _visible: '{{data.form.sbbDm == "ZZSYBNSRSB"}}',
                className: 'readOrgBtn',
                children: [{
                    name: 'isJJDJCheckbox',
                    component: 'Checkbox',
                    checked: '{{data.form.isJJDJ}}',
                    onChange: "{{function(e){$sf('data.form.isJJDJ',e.target.checked)}}}"
                },{
                    name: 'isJJDJSpan',
                    component: '::span',
                    children: '是否加计抵减'
                },{
                    name: 'remind',
                    component: 'Popover',
                    autoAdjustOverflow: 'false',
                    placement: 'right',
                    content: [
                        {
                            name: 'p',
                            component: '::div',
                            children: '自2019年4月1日至2021年12月31日，提供邮政服务、电信服务、现代服务、生活服务取得的销售额占全部销售额的比重超过50%的纳税人，可以适用加计抵减政策'
                        }],
                    children: {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'bangzhutishi'
                    }
                }]
            }, {
                name: 'isCEKCForm',
                component: 'Form.Item',
                label: '     ',
                _visible: '{{data.form.sbbDm == "ZZSXGMSB"}}',
                children: [{
                    name: 'isCEKCCheckbox',
                    component: 'Checkbox',
                    checked: '{{data.form.isCEKC}}',
                    onChange: "{{function(e){$sf('data.form.isCEKC',e.target.checked)}}}"
                },{
                    name: 'isCEKCspan',
                    component: '::span',
                    children: '是否差额扣除'
                }]
            }, {
                name: 'isGXJSQYForm',
                component: 'Form.Item',
                label: '     ',
                _visible: '{{data.form.sbbDm == "QYSDSASB"}}',
                children: [{
                    name: 'isGXJSQYCheckbox',
                    component: 'Checkbox',
                    checked: '{{data.form.isGXJSQY}}',
                    onChange: "{{function(e){$sf('data.form.isGXJSQY',e.target.checked)}}}"
                },{
                    name: 'isGXJSQYSpan',
                    component: '::span',
                    children: '高新技术企业'
                }]
            }, {
                name: 'isKJXZXQYForm',
                component: 'Form.Item',
                label: '     ',
                _visible: '{{data.form.sbbDm == "QYSDSASB"}}',
                children: [{
                    name: 'isKJXZXQYCheckbox',
                    component: 'Checkbox',
                    checked: '{{data.form.isKJXZXQY}}',
                    onChange: "{{function(e){$sf('data.form.isKJXZXQY',e.target.checked)}}}"
                },{
                    name: 'isKJXZXQYSpan',
                    component: '::span',
                    children: '科技型中小企业'
                }]
            }, {
                name: 'isJSRGYNSSForm',
                component: 'Form.Item',
                label: '     ',
                _visible: '{{data.form.sbbDm == "QYSDSASB"}}',
                children: [{
                    name: 'isJSRGYNSSCheckbox',
                    component: 'Checkbox',
                    checked: '{{data.form.isJSRGYNSS}}',
                    onChange: "{{function(e){$sf('data.form.isJSRGYNSS',e.target.checked)}}}"
                },{
                    name: 'isJSRGYNSSSpan',
                    component: '::span',
                    children: '技术入股递延纳税事项'
                }]
            }, {
                name: 'isGJXZHJZHYForm',
                component: 'Form.Item',
                label: '     ',
                _visible: '{{data.form.sbbDm == "QYSDSASB"}}',
                children: [{
                    name: 'isGJXZHJZHYCheckbox',
                    component: 'Checkbox',
                    checked: '{{data.form.isGJXZHJZHY}}',
                    onChange: "{{function(e){$sf('data.form.isGJXZHJZHY',e.target.checked)}}}"
                },{
                    name: 'isGJXZHJZHYSpan',
                    component: '::span',
                    children: '国家限制或禁止行业'
                }]
            },{
                name: 'isGGYForm',
                component: 'Form.Item',
                label: '     ',
                _visible: '{{data.form.sbbDm == "WHSYJSFSB"}}',
                children: [{
                    name: 'isGGYCheckbox',
                    component: 'Checkbox',
                    checked: '{{data.form.isGGY}}',
                    onChange: "{{function(e){$sf('data.form.isGGY',e.target.checked)}}}"
                },{
                    name: 'isGGYSpan',
                    component: '::span',
                    children: '广告业'
                }]
            },{
                name: 'isYLYForm',
                component: 'Form.Item',
                label: '     ',
                _visible: '{{data.form.sbbDm == "WHSYJSFSB"}}',
                children: [{
                    name: 'isYLYCheckbox',
                    component: 'Checkbox',
                    checked: '{{data.form.isYLY}}',
                    onChange: "{{function(e){$sf('data.form.isYLY',e.target.checked)}}}"
                },{
                    name: 'isYLYSpan',
                    component: '::span',
                    children: '娱乐业'
                }]
            },{
                name: 'rule',
                component: 'Form.Item',
                colon: false,
                label: '财务会计制度准则',
                _visible: '{{data.form.sbbDm == "CWBB"}}',
                validateStatus: "{{data.error.accountingStandardsId?'error':'success'}}",
                help: '{{data.error.accountingStandardsId}}',
                children: {
                    name: 'select',
                    component: '::div',
                    style: { position: 'relative' },
                    children: [{
                        name: 'select',
                        component: 'Select',
                        disabled: true,
                        showSearch: false,
                        value: '{{data.form.CSKJZZ}}',
                        onChange: "{{function(e){$setTab4Field('data.form.CSKJZZ',e)}}}",
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.rules[_rowIndex].code}}',
                            children: '{{data.other.rules[_rowIndex].name}}',
                            _power: 'for in data.other.rules',
                        }
                    }, {
                        name: 'shadow',
                        component: '::div',
                        _visible: false,
                        className: 'shadow'
                    }]
                }
            },{
                name: 'type',
                component: 'Form.Item',
                colon: false,
                label: '资料报送小类',
                _visible: '{{data.form.sbbDm == "CWBB"}}',
                validateStatus: "{{data.error.reportingCategoryCode?'error':'success'}}",
                help: '{{data.error.reportingCategoryCode}}',
                children: {
                    name: 'select',
                    component: '::div',
                    style: { position: 'relative' },
                    children: [{
                        name: 'select',
                        component: 'Select',
                        allowClear:true,
                        showSearch: true,
                        filterOption:'{{$filterTypes}}',
                        value: '{{data.form.ZLBSXL}}',
                        onChange: "{{function(e){$setTab4Field('data.form.ZLBSXL',e)}}}",
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.types[_rowIndex].reportingCategoryCode}}',
                            children: '{{data.other.types[_rowIndex].reportingCategoryName}}',
                            _power: 'for in data.other.types',
                        }
                    }, {
                        name: 'shadow',
                        component: '::div',
                        _visible: false,
                        className: 'shadow'
                    }]
                }
            }]
        }]
    }
}

export function getInitState(option) {
	return {
		data: {
			form: {
                sbbDm: "",
                NSQXDM: '06',
                isJCKQY: false,
                isJJDJ: false,
                isCEKC: false,
                isGXJSQY: false,
                isKJXZXQY: false,
                isJSRGYNSS: false,
                isGJXZHJZHY: false,
                isCZXFZFZ:false,
                isGGY:false,
                isYLY:false,
                isJCLB:true,

            },
			other: {
                error: {},
                isDisableTaxType:false,
			},
            enumIdList: {
                200031: [],
                200032: [],
                200033: [],
                200034: [],
                200022: [],
                200035: [],
            },
            error: {
			},
            vatTaxpayer: '',
            VATTAXPAYER_generalTaxPayer: consts.VATTAXPAYER_generalTaxPayer, //纳税人身份: 2000010001 一般纳税人
            VATTAXPAYER_smallScaleTaxPayer: consts.VATTAXPAYER_smallScaleTaxPayer, //纳税人身份: 2000010002 小规模纳税人
		}
	};
}
