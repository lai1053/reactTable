import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-scm-app-subject-card',
        children: {
            name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
            spinning: '{{data.other.loading}}',
            children:[{
                name: 'form',
                component: 'Form',
				className: 'ttk-scm-app-subject-card-form',
                children:[{
                    name:'test1',
                    component: '::div',
                    // _visible: '{{data.other.sales}}',
                    className: 'ttk-scm-app-subject-card-form-test1',
                    children:[{
                            name: 'test1-1',
                            component: '::div',
                            className: 'ttk-scm-app-subject-card-form-test1-1',
                            children: {
                                name: 'title',
                                component: '::span',
                                children: '往来科目是否启用明细科目？'
                            }
                        }]
                    },{
                        name: 'test2',
                        component: '::div',
                        // _visible: '{{data.other.sales}}',
                        className: 'ttk-scm-app-subject-card-form-test2',
                        children: {
                            name: 'title',
                            component: '::div',
                            children: '注：往来科目包含应收账款、预收账款、应付账款、预付账款'
                        }
                    }, {
                        name: 'currentAccount',
                        component: 'Form.Item',
                        className: 'formitem1',
                        // _visible: '{{data.other.sales}}',
                        children: [{
                            name: 'check',
                            component: 'Radio.Group',
                            options: '{{data.other.currentAccountClass}}',
                            value: '{{data.form.currentAccount}}',
                            onChange: '{{function(e){$checkBoxChange("data.form.currentAccount", e.target.value)}}}'
                        }]
                    }, {
                        name: 'customer',
                        component: '::div',
                        _visible: '{{data.other.sales && data.other.flag}}',
                        className: 'ttk-scm-app-subject-card-form-customer',
                        children: [{
                            name: 'checkbox',
                            component: 'Checkbox',
                            checked: '{{data.achivalRuleDto.accountSet}}',
                            className: 'ttk-scm-app-subject-card-form-check1',
                            children: '按客户名称自动生成明细科目',
                            onChange: `{{function(v){$settlementChange('data.form.customer',v)}}}`,
                        }, {
                            name: 'supplier',
                            component: 'Form.Item',
                            label: '选择上级科目',
                            children: [{
                                name: 'select',
                                component: 'Select',
                                allowClear: true,
                                disabled: '{{data.other.accountSetVisible}}',
                                value: '{{data.achivalRuleDto.customerUpperAccount}}',
                                onChange: `{{function(v){$fieldChange('data.form.customer',v)}}}`,
                                children: {
                                    name: 'option',
                                    component: 'Select.Option',
                                    key: '{{data.other.customer && data.other.customer[_rowIndex].id }}',
                                    value: '{{data.other.customer && data.other.customer[_rowIndex].id }}',
									children: '{{data.other.customer && data.other.customer[_rowIndex].codeAndName}}',
                                    _power: 'for in data.other.customer'
                                }
                            }]
                        }]
                    },{
                        name: 'supplier',
                        component: '::div',
                        _visible: '{{!data.other.sales && data.other.flag}}',
                        className: 'ttk-scm-app-subject-card-form-supplier',
                        children: [{
                            name: 'checkbox',
                            component: 'Checkbox',
                            checked: '{{data.achivalRuleDto.supplierAccountSet}}',
                            className: 'ttk-scm-app-subject-card-form-check1',
                            children: '按供应商名称自动生成明细科目',
                            onChange: `{{function(v){$settlementChange('data.form.supplier',v)}}}`,
                        }, {
                            name: 'supplier',
                            component: 'Form.Item',
                            label: '选择上级科目',
                            children: [{
                                name: 'select',
                                component: 'Select',
                                allowClear: true,
                                disabled: '{{data.other.supplierAccountSetVisible}}',
                                value: '{{data.achivalRuleDto.supplierUpperAccount}}',
                                onChange: `{{function(v){$fieldChange('data.form.supplier',v)}}}`,
                                children: {
                                    name: 'option',
                                    component: 'Select.Option',
                                    key: '{{data.other.supplier && data.other.supplier[_rowIndex].id }}',
                                    value: '{{data.other.supplier && data.other.supplier[_rowIndex].id }}',
									children: '{{data.other.supplier && data.other.supplier[_rowIndex].codeAndName}}',
                                    _power: 'for in data.other.supplier'
                                }
                            }]
                        }]
                    },{
                    name:'test3',
                    component: '::div',
                    className: 'ttk-scm-app-subject-card-form-test3',
                    _visible: '{{!data.other.sales}}',
                    children:[{
                        name: 'test3-1',
                        component: '::div',
                        className: 'ttk-scm-app-subject-card-form-test3-1',
                        children: {
                            name: 'title',
                            component: '::span',
                            children: '存货科目是否启用明细科目？'
                        }
                    }
                    // ,{
                    //     name: 'test3-2',
                    //     component: '::div',
                    //     className: 'ttk-scm-app-subject-card-form-test3-2',
                    //     children: {
                    //         name: 'title',
                    //         component: '::span',
                    //         children: '（科目无余额时可随意切换）'
                    //     }
                    // }
                    ]
                },{
                    name: 'test4',
                    component: '::div',
                    _visible: '{{!data.other.sales}}',
                    className: 'ttk-scm-app-subject-card-form-test4',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：存货科目包含库存商品、原材料、周转材料'
                    }
                },{
                    name:'inventoryAccountClass',
                    component: 'Form.Item',
                    className: 'formitem2',
                    _visible: '{{!data.other.sales}}',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.inventoryAccountClass}}',
                        value: '{{data.form.inventoryAccount}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.inventoryAccount", e.target.value)}}}'
                    }]
                },{
                    name:'test5',
                    component: '::div',
                    _visible: '{{data.other.sales}}',
                    className: 'ttk-scm-app-subject-card-form-test5',
                    children:[{
                        name: 'test5-1',
                        component: '::div',
                        className: 'ttk-scm-app-subject-card-form-test5-1',
                        children: {
                            name: 'title',
                            component: '::span',
                            children: '收入科目是否启用明细科目？'
                        }
                    }
                    // ,{
                    //     name: 'test5-2',
                    //     component: '::div',
                    //     className: 'ttk-scm-app-subject-card-form-test5-2',
                    //     children: {
                    //         name: 'title',
                    //         component: '::span',
                    //         children: '（科目无余额时可随意切换）'
                    //     }
                    // }
                    ]
                },{
                    name: 'test6',
                    component: '::div',
                    _visible: '{{data.other.sales}}',
                    className: 'ttk-scm-app-subject-card-form-test6',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：收入科目包含主营业务收入、其他业务收入'
                    }
                },{
                    name:'revenueAccountClass',
                    component: 'Form.Item',
                    className: 'formitem3',
                    _visible: '{{data.other.sales}}',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.revenueAccountClass}}',
                        value: '{{data.form.revenueAccount}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.revenueAccount", e.target.value)}}}'
                    }]
                },{
                    name:'test7',
                    component: '::div',
                    _visible: '{{!data.other.sales && this.component.props.aaa != "pu"}}',
                    className: 'ttk-scm-app-subject-card-form-test7',
                    children:[{
                        name: 'test7-1',
                        component: '::div',
                        className: 'ttk-scm-app-subject-card-form-test7-1',
                        children: {
                            name: 'title',
                            component: '::span',
                            children: '销售成本科目是否启用明细科目？'
                        }
                    }
                    // ,{
                    //     name: 'test7-2',
                    //     component: '::div',
                    //     className: 'ttk-scm-app-subject-card-form-test7-2',
                    //     children: {
                    //         name: 'title',
                    //         component: '::span',
                    //         children: '（科目无余额时可随意切换）'
                    //     }
                    // }
                    ]
                },{
                    name: 'test8',
                    component: '::div',
                    _visible: '{{!data.other.sales && this.component.props.aaa != "pu"}}',
                    className: 'ttk-scm-app-subject-card-form-test8',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：销售成本科目包含主营业务成本、其他业务成本'
                    }
                },{
                    name:'saleAccountClass',
                    component: 'Form.Item',
                    className: 'formitem4',
                    _visible: '{{!data.other.sales && this.component.props.aaa != "pu"}}',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.saleAccountClass}}',
                        value: '{{data.form.saleAccount}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.saleAccount", e.target.value)}}}'
                    }]
                }]
            },{
				name: 'title',
				component: '::div',
				className: 'ttk-scm-app-subject-card-more',
				children: [{
					name: 'more',
					component: '::span',
					className: 'ttk-scm-app-subject-card-more-ico',
					children: [{
						name: 'left',
						component: '::span',
						children: '更多'
					}, {
						name: 'icon',
						component: 'Icon',
						className: 'operation',
						showStyle: 'showy',
						fontFamily: 'edficon',
						type: '{{data.other.moreInfo ? "shang" : "xia"}}',
						style: {
							fontSize: 26
						},
					}],
                    onClick: '{{$moreClick}}'
				}]
			},{
                name: 'form',
                component: 'Form',
                _visible: '{{data.other.moreInfo}}',
				className: 'ttk-scm-app-subject-card-form',
                children:[{
                    name:'test3',
                    component: '::div',
                    className: 'ttk-scm-app-subject-card-form-test3',
                    _visible: '{{data.other.sales}}',
                    children:[{
                        name: 'test3-1',
                        component: '::div',
                        className: 'ttk-scm-app-subject-card-form-test3-1',
                        children: {
                            name: 'title',
                            component: '::span',
                            children: '存货科目是否启用明细科目？'
                        }
                    }
                    // ,{
                    //     name: 'test3-2',
                    //     component: '::div',
                    //     className: 'ttk-scm-app-subject-card-form-test3-2',
                    //     children: {
                    //         name: 'title',
                    //         component: '::span',
                    //         children: '（科目无余额时可随意切换）'
                    //     }
                    // }
                    ]
                },{
                    name: 'test4',
                    component: '::div',
                    _visible: '{{data.other.sales}}',
                    className: 'ttk-scm-app-subject-card-form-test4',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：存货科目包含库存商品、原材料、周转材料'
                    }
                },{
                    name:'inventoryAccountClass',
                    component: 'Form.Item',
                    className: 'formitem2',
                    _visible: '{{data.other.sales}}',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.inventoryAccountClass}}',
                        value: '{{data.form.inventoryAccount}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.inventoryAccount", e.target.value)}}}'
                    }]
                },{
                    name:'test5',
                    component: '::div',
                    _visible: '{{!data.other.sales}}',
                    className: 'ttk-scm-app-subject-card-form-test5',
                    children:[{
                        name: 'test5-1',
                        component: '::div',
                        className: 'ttk-scm-app-subject-card-form-test5-1',
                        children: {
                            name: 'title',
                            component: '::span',
                            children: '收入科目是否启用明细科目？'
                        }
                    }
                    // ,{
                    //     name: 'test5-2',
                    //     component: '::div',
                    //     className: 'ttk-scm-app-subject-card-form-test5-2',
                    //     children: {
                    //         name: 'title',
                    //         component: '::span',
                    //         children: '（科目无余额时可随意切换）'
                    //     }
                    // }
                    ]
                },{
                    name: 'test6',
                    component: '::div',
                    _visible: '{{!data.other.sales}}',
                    className: 'ttk-scm-app-subject-card-form-test6',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：收入科目包含主营业务收入、其他业务收入'
                    }
                },{
                    name:'revenueAccountClass',
                    component: 'Form.Item',
                    className: 'formitem3',
                    _visible: '{{!data.other.sales}}',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.revenueAccountClass}}',
                        value: '{{data.form.revenueAccount}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.revenueAccount", e.target.value)}}}'
                    }]
                },{
                    name:'test7',
                    component: '::div',
                    _visible: '{{data.other.sales}}',
                    className: 'ttk-scm-app-subject-card-form-test7',
                    children:[{
                        name: 'test7-1',
                        component: '::div',
                        className: 'ttk-scm-app-subject-card-form-test7-1',
                        children: {
                            name: 'title',
                            component: '::span',
                            children: '销售成本科目是否启用明细科目？'
                        }
                    }
                    // ,{
                    //     name: 'test7-2',
                    //     component: '::div',
                    //     className: 'ttk-scm-app-subject-card-form-test7-2',
                    //     children: {
                    //         name: 'title',
                    //         component: '::span',
                    //         children: '（科目无余额时可随意切换）'
                    //     }
                    // }
                    ]
                },{
                    name: 'test8',
                    component: '::div',
                    _visible: '{{data.other.sales}}',
                    className: 'ttk-scm-app-subject-card-form-test8',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：销售成本科目包含主营业务成本、其他业务成本'
                    }
                },{
                    name:'saleAccountClass',
                    component: 'Form.Item',
                    className: 'formitem4',
                    _visible: '{{data.other.sales}}',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.saleAccountClass}}',
                        value: '{{data.form.saleAccount}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.saleAccount", e.target.value)}}}'
                    }]
                }]
            },{
				name: 'footer',
				component: '::div',
				className: 'ttk-scm-app-subject-card-footer',
				children: {
                    name: 'cancel',
                    component: 'Button',
                    className: 'ttk-scm-app-subject-card-footer',
                    children: '保存',
                    onClick: '{{$save}}',
				}
            }]
        }
    }
}

export function getInitState() {
	return {
		data: {
			other: {
                flag: false,
                loading: false,
                moreInfo: false,
                sales: false,
                beginDate: moment().format('YYYY-MM'),
                accountSetVisible: true,
                supplierAccountSetVisible: true,
                currentAccountClass:[{
                    value: 1,
                    label: '是（例：112201 应收账款-方欣科技）'
                },{
                    value: 0,
                    label: '否'
                }],
                inventoryAccountClass:[{
                    value: 1,
                    label: '是（例：140501  库存商品-税控盘）'
                },{
                    value: 0,
                    label: '否'
                }],
                revenueAccountClass:[{
                    value: 1,
                    label: '是（例：600101 主营业务收入-销售商品）'
                },{
                    value: 0,
                    label: '否'
                }],
                saleAccountClass:[{
                    value: 1,
                    label: '是（例：640101 主营业务成本-销售商品）'
                },{
                    value: 0,
                    label: '否'
                }],
            },
            form:{
                
            },
            achivalRuleDto: {
                supplierUpperAccount:null,
                customerUpperAccount:null,
                accountSet:0,
                supplierAccountSet:0,
            }
		}
	}
}
