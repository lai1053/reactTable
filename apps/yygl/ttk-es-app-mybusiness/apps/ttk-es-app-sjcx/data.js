export function getMeta() {
	return {
		name: 'root',
		component: '::div',
        className: 'ttk-es-app-sjcx',
		children: [{
			name: 'wrap',
			component: '::div',
            className: 'ttk-es-app-sjcx-wrap',
            children: [
                {
                    name: 'title',
                    component: '::div',
                    className: 'ttk-es-app-sjcx-wrap-lxfs',
                    children:'1.选择客户的联系方式'
                },
                {
                    name: 'lxfs',
                    component: '::div',
                    className: 'ttk-es-app-sjcx-wrap-lxfs',
                    children:[
                        {
                            name: 'select',
                            component: 'Select',
                            // showSearch:false,
                            defaultValue: '{{data.seval && data.seval[0].id}}',
                            placeholder: "请选择",
                            className:'ttk-es-app-sjcx-wrap-lxfs-select',
                            //onFocus: '{{$industrysFocus}}',
                            // onBlur: "{{function(v){$setField('data.form.industry', v)}}}",
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                value: '{{data.seval[_rowIndex].val}}',
                                children: '{{data.seval[_rowIndex].tex}}',
                                _power: 'for in data.seval'
                            }
                        },
                        {
                            name: 'mobile',
                            component: 'Input',
                            className:'ttk-es-app-sjcx-wrap-lxfs-input',
                            // maxlength: '50',
                            value: '{{data.mobile}}',
                            // disabled:true
                        },
                        {
                            name: 'btn',
                            component: '::span',
                            className:'ttk-es-app-sjcx-wrap-lxfs-Btn',
                            children:'确定'
                            // maxlength: '50',
                            // disabled:true
                        }
					]
                },
                {
                    name: 'title',
                    component: '::div',
                    className: 'ttk-es-app-sjcx-wrap-xjkh',
                    children:[
                        {
                            name: 'btn',
                            component: '::span',
                            className:'ttk-es-app-sjcx-wrap-xjkh-xx',
                            children:'2.以新客户身份创建'
                            // maxlength: '50',
                            // disabled:true
                        },
                        {
                            name: 'btn',
                            component: '::span',
                            className:'ttk-es-app-sjcx-wrap-xjkh-Btn',
                            children:'创建'
                            // maxlength: '50',
                            // disabled:true
                        }
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
			select:1
		}
	}
}