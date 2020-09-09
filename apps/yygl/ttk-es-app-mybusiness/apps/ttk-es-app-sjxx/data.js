export function getMeta() {
	return {
		name: 'root',
		component: '::div',
        className: 'ttk-es-app-sjxx',
		children: [{
			name: 'wrap',
			component: '::div',
            className: 'ttk-es-app-sjxx-wrap',
            children: [
                {
                    name: 'title',
                    component: '::div',
                    className: 'ttk-es-app-sjxx-wrap-jlsj',
                    children:[
                        {
                            name: 'title',
                            component: '::div',
                            className: 'ttk-es-app-sjxx-wrap-jlsj-title',
                            children:'记录商机'
                        },
                        {
                            name: 'title',
                            component: '::div',
                            className: 'ttk-es-app-sjxx-wrap-jlsj-wrap',
                            children:[
                                {
                                    name: 'nameItem',
                                    component: 'Form.Item',
                                    label: '联系人姓名',
                                    required: true,
                                    className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                    // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                    // help: '{{data.other.error.name}}',
                                    children: [{
                                        name: 'name',
                                        component: 'Input',
                                        className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                        value: '{{data.form.name}}',
                                        onChange: "{{function(e){$fieldChange('data.form.name',e.target.value)}}}"
                                    }]
                                },
                                {
                                    name: 'nameItem',
                                    component: 'Form.Item',
                                    label: '称谓',
                                    // required: true,
                                    // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                    // help: '{{data.other.error.name}}',
                                    children: [{
                                        name: 'e1',
                                        component: 'Radio.Group',
                                        value: '{{data.form.cw}}',
                                        // onChange: `{{function(v){$setField('data.form.cw',v.target.value)}}}`,
                                        children: [{
                                            name: 'option',
                                            component: 'Radio',
                                            key: '{{data.other.elist[_rowIndex].id}}',
                                            value: '{{data.other.elist[_rowIndex].id}}',
                                            children: '{{data.other.elist[_rowIndex].name}}',
                                            _power: 'for in data.other.elist'
                                        }]
                                    }]
                                },
                                {
                                    name: 'title',
                                    component: '::div',
                                    className: 'ttk-es-app-sjxx-wrap-jlsj-lxfstitle',
                                    children:[
                                        {
                                            name: 'title',
                                            component: '::span',
                                            className: 'ttk-es-app-sjxx-wrap-jlsj-lxfstitles',
                                            children:''
                                        },
                                        {
                                            name: 'title',
                                            component: '::span',
                                            className: 'ttk-es-app-sjxx-wrap-jlsj-lxfstitle',
                                            children:'请至少填入一种联系方式'
                                        },
                                        {
                                            name: 'title',
                                            component: '::span',
                                            className: 'ttk-es-app-sjxx-wrap-jlsj-lxfstitles',
                                            children:''
                                        }
                                    ]
                                },
                                {
                                    name: 'nameItem',
                                    component: 'Form.Item',
                                    label: '手机号码',
                                    // required: true,
                                    className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                    // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                    // help: '{{data.other.error.name}}',
                                    children: [{
                                        name: 'name',
                                        component: 'Input',
                                        className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                        value: '{{data.form.sjhm}}',
                                        onChange: "{{function(e){$fieldChange('data.form.sjhm',e.target.value)}}}"
                                    }]
                                },
                                {
                                    name: 'nameItem',
                                    component: 'Form.Item',
                                    label: '固定电话',
                                    // required: true,
                                    className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                    // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                    // help: '{{data.other.error.name}}',
                                    children: [{
                                        name: 'name',
                                        component: 'Input',
                                        className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                        value: '{{data.form.gddh}}',
                                        onChange: "{{function(e){$fieldChange('data.form.gddh',e.target.value)}}}"
                                    }]
                                },
                                {
                                    name: 'nameItem',
                                    component: 'Form.Item',
                                    label: '电子邮箱',
                                    // required: true,
                                    className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                    // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                    // help: '{{data.other.error.name}}',
                                    children: [{
                                        name: 'name',
                                        component: 'Input',
                                        className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                        value: '{{data.form.dzyx}}',
                                        onChange: "{{function(e){$fieldChange('data.form.dzyx',e.target.value)}}}"
                                    }]
                                },
                                {
                                    name: 'nameItem',
                                    component: 'Form.Item',
                                    label: '微信号',
                                    // required: true,
                                    className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                    // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                    // help: '{{data.other.error.name}}',
                                    children: [{
                                        name: 'name',
                                        component: 'Input',
                                        className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                        value: '{{data.form.vxh}}',
                                        onChange: "{{function(e){$fieldChange('data.form.vxh',e.target.value)}}}"
                                    }]
                                },
                                {
                                    name: 'nameItem',
                                    component: 'Form.Item',
                                    label: 'QQ号',
                                    // required: true,
                                    className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                    // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                    // help: '{{data.other.error.name}}',
                                    children: [{
                                        name: 'name',
                                        component: 'Input',
                                        className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                        value: '{{data.form.QQ}}',
                                        onChange: "{{function(e){$fieldChange('data.form.QQ',e.target.value)}}}"
                                    }]
                                },
                                {
                                    name: 'title',
                                    component: '::span',
                                    className: 'ttk-es-app-sjxx-wrap-jlsj-mlxfstitles',
                                    children:''
                                },
                                {
                                    name: 'nameItem',
                                    component: 'Form.Item',
                                    label: '商机来源',
                                    // required: true,
                                    className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                    // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                    // help: '{{data.other.error.name}}',
                                    children: [{
                                        name: 'name',
                                        component: 'Input',
                                        className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                        value: '{{data.form.sjly}}',
                                        onChange: "{{function(e){$fieldChange('data.form.sjly',e.target.value)}}}"
                                    }]
                                },
                                {
                                    name: 'nameItem',
                                    component: 'Form.Item',
                                    label: '客户偏好',
                                    // required: true,
                                    className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                    // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                    // help: '{{data.other.error.name}}',
                                    children:{
                                            name: 'select',
                                            component: 'Select',
                                            // showSearch:false,
                                            // defaultValue: '{{data.seval && data.seval[0].id}}',
                                            placeholder: "请选择",
                                            className:'ttk-es-app-sjxx-wrap-lxfs-select',
                                            //onFocus: '{{$industrysFocus}}',
                                            // onBlur: "{{function(v){$setField('data.form.industry', v)}}}",
                                            children: {
                                                name: 'option',
                                                component: 'Select.Option',
                                                value: '{{data.other.khph[_rowIndex].val}}',
                                                children: '{{data.other.khph[_rowIndex].text}}',
                                                _power: 'for in data.other.khph'
                                            }
                                        },
                                },
                                {
                                    name: 'nameItem',
                                    component: 'Form.Item',
                                    label: '优先级',
                                    // required: true,
                                    className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                    // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                    // help: '{{data.other.error.name}}',
                                    children: {
                                        name: 'select',
                                        component: 'Select',
                                        // showSearch:false,
                                        // defaultValue: '{{data.seval && data.seval[0].id}}',
                                        placeholder: "请选择",
                                        className:'ttk-es-app-sjxx-wrap-lxfs-select',
                                        //onFocus: '{{$industrysFocus}}',
                                        // onBlur: "{{function(v){$setField('data.form.industry', v)}}}",
                                        children: {
                                            name: 'option',
                                            component: 'Select.Option',
                                            value: '{{data.other.yxj[_rowIndex].val}}',
                                            children: '{{data.other.yxj[_rowIndex].text}}',
                                            _power: 'for in data.other.yxj'
                                        }
                                    },
                                },
                            ]
                        },
                        {
                            name: 'title',
                            component: '::div',
                            className: 'ttk-es-app-sjxx-wrap-xqxx',
                            children:[
                                {
                                    name: 'title',
                                    component: '::div',
                                    className: 'ttk-es-app-sjxx-wrap-xqxx-title',
                                    children:[
                                        {
                                            name: 'titleItem',
                                            component: '::span',
                                            className: 'ttk-es-app-sjxx-wrap-xqxx-titleitem ',
                                            children:'注册'
                                        },
                                        {
                                            name: 'titleItem',
                                            component: '::span',
                                            className: 'ttk-es-app-sjxx-wrap-xqxx-titleitem',
                                            children:'变更'
                                        },
                                        {
                                            name: 'titleItem',
                                            component: '::span',
                                            className: 'ttk-es-app-sjxx-wrap-xqxx-titleitem active',
                                            children:'注销'
                                        },
                                        {
                                            name: 'titleItem',
                                            component: '::span',
                                            className: 'ttk-es-app-sjxx-wrap-xqxx-titleitem',
                                            children:'其他'
                                        },
                                        {
                                            name: 'titleItem',
                                            component: '::span',
                                            className: 'ttk-es-app-sjxx-wrap-xqxx-titleitem',
                                            children:'官费'
                                        }
                                    ]
                                },
                                {
                                    name: 'zc',
                                    component: '::div',
                                    _visible:false,
                                    className: 'ttk-es-app-sjxx-wrap-xqxx-zc ttk-es-app-sjxx-wrap-jlsj',
                                    children:[
                                        {
                                            name: 'nameItem',
                                            component: 'Form.Item',
                                            label: '主营行业',
                                            // required: true,
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                            // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                            // help: '{{data.other.error.name}}',
                                            children: [{
                                                name: 'name',
                                                component: 'Input',
                                                className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                                value: '{{data.form.zyhy}}',
                                                onChange: "{{function(e){$fieldChange('data.form.zyhy',e.target.value)}}}"
                                            }]
                                        },
                                        {
                                            name: 'nameItem',
                                            component: 'Form.Item',
                                            label: '企业类型',
                                            // required: true,
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                            // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                            // help: '{{data.other.error.name}}',
                                            children:{
                                                name: 'select',
                                                component: 'Select',
                                                // showSearch:false,
                                                // defaultValue: '{{data.seval && data.seval[0].id}}',
                                                placeholder: "请选择",
                                                className:'ttk-es-app-sjxx-wrap-lxfs-select',
                                                //onFocus: '{{$industrysFocus}}',
                                                // onBlur: "{{function(v){$setField('data.form.industry', v)}}}",
                                                children: {
                                                    name: 'option',
                                                    component: 'Select.Option',
                                                    value: '{{data.other.qylx[_rowIndex].val}}',
                                                    children: '{{data.other.qylx[_rowIndex].text}}',
                                                    _power: 'for in data.other.qylx'
                                                }
                                            },
                                        },
                                        {
                                            name: 'nameItem',
                                            component: 'Form.Item',
                                            label: '年营业额（万元）',
                                            // required: true,
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                            // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                            // help: '{{data.other.error.name}}',
                                            children: [{
                                                name: 'name',
                                                component: 'Input',
                                                className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                                value: '{{data.form.nyye}}',
                                                onChange: "{{function(e){$fieldChange('data.form.nyye',e.target.value)}}}"
                                            }]
                                        },
                                        {
                                            name: 'nameItem',
                                            component: 'Form.Item',
                                            label: '行业资质许可证号',
                                            // required: true,
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                            // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                            // help: '{{data.other.error.name}}',
                                            children: [{
                                                name: 'name',
                                                component: 'Input',
                                                className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                                value: '{{data.form.hyzzxkzh}}',
                                                onChange: "{{function(e){$fieldChange('data.form.hyzzxkzh',e.target.value)}}}"
                                            }]
                                        },
                                        {
                                            name: 'nameItem',
                                            component: 'Form.Item',
                                            label: '注册地址来源',
                                            // required: true,
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                            // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                            // help: '{{data.other.error.name}}',
                                            children:{
                                                name: 'select',
                                                component: 'Select',
                                                // showSearch:false,
                                                // defaultValue: '{{data.seval && data.seval[0].id}}',
                                                placeholder: "请选择",
                                                className:'ttk-es-app-sjxx-wrap-lxfs-select',
                                                //onFocus: '{{$industrysFocus}}',
                                                // onBlur: "{{function(v){$setField('data.form.industry', v)}}}",
                                                children: {
                                                    name: 'option',
                                                    component: 'Select.Option',
                                                    value: '{{data.other.zcdzly[_rowIndex].val}}',
                                                    children: '{{data.other.zcdzly[_rowIndex].text}}',
                                                    _power: 'for in data.other.zcdzly'
                                                }
                                            },
                                        },
                                        {
                                            name: 'nameItem',
                                            component: 'Form.Item',
                                            label: '注册地址区域',
                                            // required: true,
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                            // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                            // help: '{{data.other.error.name}}',
                                            children: [{
                                                name: 'name',
                                                component: 'Input',
                                                className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                                value: '{{data.form.zcdzqy}}',
                                                onChange: "{{function(e){$fieldChange('data.form.zcdzqy',e.target.value)}}}"
                                            }]
                                        },
                                        {
                                            name: 'xxdzItem',
                                            component: 'Form.Item',
                                            label: '经营范围',
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zharea',
                                            // required: true,
                                            // maxlength:100,
                                            children: [{
                                                name: 'ids',
                                                timeout: true,
                                                component: 'Input.TextArea',
                                                maxlength:100,
                                                placeholder:'请输入经营范围',
                                                style: {fontSize:'12px'},
                                                className:'xxdz-textarea',
                                                value: '{{data.contactsAddress}}',
                                                // onChange: `{{function(e){console.log(e)}}}`,//$sf('data.form.contactsAddress',e);$changeCheck('contactsAddress')
                                                onChange: `{{function(e){$fieldChange("data.contactsAddress",e.target.value)}}}`,//$fieldChange('data.form.contactsAddress',v.target.value)
                                            }]
                                        },
                                        {
                                            name: 'xxdzItem',
                                            component: 'Form.Item',
                                            label: '需求概述',
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zharea',
                                            // required: true,
                                            // maxlength:100,
                                            children: [{
                                                name: 'ids',
                                                timeout: true,
                                                component: 'Input.TextArea',
                                                maxlength:100,
                                                placeholder:'请输入需求概述',
                                                style: {fontSize:'12px'},
                                                className:'xxdz-textarea',
                                                value: '{{data.xqgs}}',
                                                // onChange: `{{function(e){console.log(e)}}}`,//$sf('data.form.contactsAddress',e);$changeCheck('contactsAddress')
                                                onChange: `{{function(e){$fieldChange("data.xqgs",e.target.value)}}}`,//$fieldChange('data.form.contactsAddress',v.target.value)
                                            }]
                                        }
                                    ]
                                },
                                {
                                    name: 'pt',
                                    component: '::div',
                                    _visible:true,
                                    className: 'ttk-es-app-sjxx-wrap-xqxx-zc ttk-es-app-sjxx-wrap-jlsj',
                                    children:[
                                        {
                                            name: 'nameItem',
                                            component: 'Form.Item',
                                            label: '公司名称',
                                            // required: true,
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                            // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                            // help: '{{data.other.error.name}}',
                                            children: [{
                                                name: 'name',
                                                component: 'Input',
                                                className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                                value: '{{data.form.gsmc}}',
                                                onChange: "{{function(e){$fieldChange('data.form.gsmc',e.target.value)}}}"
                                            }]
                                        },
                                        {
                                            name: 'nameItem',
                                            component: 'Form.Item',
                                            label: '注册区域',
                                            // required: true,
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zh',
                                            // validateStatus: "{{data.other.error.name?'error':'success'}}",
                                            // help: '{{data.other.error.name}}',
                                            children: [{
                                                name: 'name',
                                                component: 'Input',
                                                className:'ttk-es-app-sjxx-wrap-jlsj-input',
                                                value: '{{data.form.zcqy}}',
                                                onChange: "{{function(e){$fieldChange('data.form.zcqy',e.target.value)}}}"
                                            }]
                                        },
                                        {
                                            name: 'xxdzItem',
                                            component: 'Form.Item',
                                            label: '需求概述',
                                            className:'ttk-es-app-sjxx-wrap-jlsj-zharea',
                                            // required: true,
                                            // maxlength:100,
                                            children: [{
                                                name: 'ids',
                                                timeout: true,
                                                component: 'Input.TextArea',
                                                maxlength:100,
                                                placeholder:'请输入需求概述',
                                                style: {fontSize:'12px'},
                                                className:'xxdz-textarea',
                                                value: '{{data.xqgs1}}',
                                                // onChange: `{{function(e){console.log(e)}}}`,//$sf('data.form.contactsAddress',e);$changeCheck('contactsAddress')
                                                onChange: `{{function(e){$fieldChange("data.xqgs1",e.target.value)}}}`,//$fieldChange('data.form.contactsAddress',v.target.value)
                                            }]
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                },
			]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			content: 'hello world',
            mobile:'',
            list: [],
            form:{
			    name:'',
                cw:1,
                sjhm:'',
                gddh:'',
                dzyx:'',
                vxh:'',
                QQ:'',
                sjly:'',
                khph:'',
                zyhy:'',
                qylx:'',
                nyye:'',
                hyzzxkzh:'',
                zcdzqy:'',
                contactsAddress:'',
                xqgs:'',
                gsmc:'',
                zcqy:'',
                xqgs1:''
            },
			seval:[
				{
					val:1,
					tex:'手机号码'
				},
                {
                    val:2,
                    tex:'固定电话'
                },
                {
                    val:3,
                    tex:'电子邮箱'
                },
                {
                    val:4,
                    tex:'微信号'
                },
                {
                    val:5,
                    tex:'QQ号'
                }

			],
			select:1,
            isVisible:true,
            other:{
                elist:[
                    {
                        id:1,
                        name:'女士'
                    },
                    {
                        id:0,
                        name:'先生'
                    }
                ],
                khph:[
                    {
                        val:'001',
                        text:'办理高效'
                    },
                    {
                        val:'002',
                        text:'服务优质'
                    },
                    {
                        val:'003',
                        text:'价格实惠'
                    },
                    {
                        val:'004',
                        text:'其他'
                    }
                ],
                yxj:[
                    {
                        val:'001',
                        text:'一般'
                    },
                    {
                        val:'002',
                        text:'紧急'
                    },
                    {
                        val:'003',
                        text:'次要'
                    },
                    {
                        val:'004',
                        text:'重要'
                    }
                ],
                zcdzly:[
                    {
                        val:'001',
                        text:'我方提供地址'
                    },
                    {
                        val:'002',
                        text:'客户提供地址'
                    },
                    {
                        val:'003',
                        text:'其它'
                    },
                ],
                qylx:[
                    {
                        val:'001',
                        text:'有限责任公司'
                    },
                    {
                        val:'002',
                        text:'分公司'
                    },
                    {
                        val:'003',
                        text:'普通合伙企业'
                    },
                    {
                        val:'004',
                        text:'特殊合伙企业'
                    },
                    {
                        val:'005',
                        text:'有限合伙企业'
                    },
                    {
                        val:'006',
                        text:'个人独资企业'
                    },
                    {
                        val:'007',
                        text:'股份有限公司'
                    },
                    {
                        val:'008',
                        text:'企业非法人分支机构'
                    },
                    {
                        val:'009',
                        text:'非公司企业法人'
                    },
                    {
                        val:'010',
                        text:'个体工商户'
                    },
                    {
                        val:'011',
                        text:'其它'
                    }
                ]
            }
		}
	}
}