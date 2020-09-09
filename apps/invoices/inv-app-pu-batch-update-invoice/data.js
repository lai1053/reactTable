export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-pu-batch-update-invoice',
        children: [{
                name: 'spin',
                component: 'Spin',
                tip: '加载中',
                spinning: '{{data.loading}}',
                delay: 0.01,
                children: [{
                        name: 'demo',
                        component: '::div',
                        children: [{
                                name: 'span1',
                                component: '::span',
                                style: {
                                    fontSize: '12px',
                                    display: 'inline-block',
                                    lineHeight: '21px',
                                    height: '42px',
                                    margin: 0,
                                    color: '#f27215',
                                    float: 'left',
                                },
                                children: '温馨提示：'
                            },
                            {
                                name: 'span2',
                                component: '::span',
                                style: {
                                    display: 'inline-block',
                                    float: 'left',
                                    width: '266px',
                                    fontSize: '12px',
                                },
                                children: '只能修改当前属期的发票，历史属期请切换至历史属期处理！'
                            },

                        ]
                    },
                    {
                        name: 'dikou1',
                        component: '::div',
                        className: 'has-divider',
                        children: {
                            name: 'lable',
                            component: 'Checkbox',
                            checked: '{{data.enableDkyf}}',
                            onChange: '{{function(e){$handleFieldChangeC("data.enableDkyf",e)}}}',
                            children: '抵扣选项'
                        }
                    },
                    {
                        name: 'dikou2',
                        component: '::div',
                        className: 'inv-app-pu-batch-update-invoice-div',
                        children: [{
                                name: 'label',
                                component: '::span',
                                children: '抵扣月份：'
                            },
                            {
                                name: 'status',
                                component: 'Select',
                                placeholder: '',
                                value: '{{data.form.dkyf}}',
                                disabled: '{{!data.enableDkyf||(data.form.bdzt!=="1"&&!data.other.uniformOrAricultural)}}',
                                onChange: '{{function(date,dateString){$handleFieldChangeV("data.form.dkyf",date)}}}',
                                children: '{{$renderDkyf()}}'
                            }
                        ]
                    },
                    {
                        name: 'status1',
                        component: '::div',
                        className: 'has-divider',
                        children: {
                            name: 'lable',
                            component: 'Checkbox',
                            disabled: '{{data.other.uniformOrAricultural}}',
                            onChange: '{{function(e){$handleFieldChangeC("data.enableBdzt",e)}}}',
                            checked: '{{data.enableBdzt}}',
                            children: '认证状态'
                        }
                    },
                    {
                        name: 'status2',
                        component: '::div',
                        className: 'inv-app-pu-batch-update-invoice-div',
                        children: {
                            name: 'radiogroup',
                            component: 'Radio.Group',
                            onChange: '{{function(e){$handleFieldChangeE("data.form.bdzt",e)}}}',
                            value: '{{data.form.bdzt}}',
                            children: [{
                                    name: 'radio1',
                                    component: 'Radio',
                                    value: '1',
                                    disabled: '{{!data.enableBdzt||data.other.uniformOrAricultural}}',
                                    children: '已认证'
                                },
                                {
                                    name: 'radio2',
                                    value: '0',
                                    component: 'Radio',
                                    disabled: '{{!data.enableBdzt||data.other.uniformOrAricultural}}',
                                    children: '未认证'
                                }
                            ]
                        },
                    },

                ]

            },
            // {
            // 	name: 'footer',
            // 	component: '::div',
            // 	className: 'inv-app-pu-batch-update-invoice-footer',
            // 	children: {
            // 		name: 'btn',
            // 		component: 'Button',
            // 		type: 'primary',
            // 		onClick: '{{$onOk}}',
            // 		children: '保存'
            // 	}
            // }
        ],

    }
}

export function getInitState() {
    return {
        data: {
            loading: true,
            enableBdzt: false,
            enableDkyf: false,
            form: {},
            other: {
                isTutorialPeriod: '',
                uniformOrAricultural: false,
                vato: false
            }
        }
    }
}