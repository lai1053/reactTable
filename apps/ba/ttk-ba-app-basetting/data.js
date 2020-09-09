export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-ba-app-basetting',
		children: [{
			name: 'content',
			component: '::div',
			children: [
				{
                    name:'test1',
                    component: '::div',
                    className: 'ttk-ba-app-basetting-form-test1',
                    children:[{
                        name: 'test1-1',
                        component: '::div',
                        className: 'ttk-ba-app-basetting-form-test1-1',
                        children: {
                            name: 'title',
                            component: '::span',
                            children: '往来科目是否启用明细科目？'
                        }
                    }
                    ]
                },{
                    name: 'test2',
                    component: '::div',
                    className: 'ttk-ba-app-basetting-form-test2',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：往来科目包含应收账款、预收账款、应付账款、预付账款'
                    }
                },{
                    name:'currentAccount',
                    component: 'Form.Item',
                    className: 'formitem1',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.currentAccountClass}}',
                        value: '{{data.form.currentAccount}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.currentAccount", e.target.value)}}}'
                    }]
                }, {
                    name: 'customer',
                    component: '::div',
                    _visible: '{{data.other.flag}}',
                    className: 'ttk-ba-app-basetting-form-customer',
                    children: [{
                        name: 'checkbox',
                        component: 'Checkbox',
                        checked: '{{data.achivalRuleDto.accountSet}}',
                        className: 'ttk-ba-app-basetting-form-check1',
                        children: '按客户名称自动生成明细科目',
                        onChange: `{{function(v){$settlementChange('data.form.customer',v)}}}`,
                    }, {
                        name: 'supplier',
                        component: 'Form.Item',
                        required: true,
                        _visible: '{{!data.other.accountSetVisible}}',
                        className: 'ttk-ba-app-basetting-form-customer-Select',
                        label: '选择上级科目',
                        children: [{
                            name: 'select',
                            component: 'Select',
                            allowClear: true, 
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
                    _visible: '{{data.other.flag}}',
                    className: 'ttk-ba-app-basetting-form-supplier',
                    children: [{
                        name: 'checkbox',
                        component: 'Checkbox',
                        checked: '{{data.achivalRuleDto.supplierAccountSet}}',
                        className: 'ttk-ba-app-basetting-form-check1',
                        children: '按供应商名称自动生成明细科目',
                        onChange: `{{function(v){$settlementChange('data.form.supplier',v)}}}`,
                    }, {
                        name: 'supplier',
                        component: 'Form.Item',
                        label: '选择上级科目',
                        required: true,
                        _visible: '{{!data.other.supplierAccountSetVisible}}',
                        className: 'ttk-ba-app-basetting-form-supplier-Select',
                        children: [{
                            name: 'select',
                            component: 'Select',
                            allowClear: true,
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
                    className: 'ttk-ba-app-basetting-form-test3',
                    children:[{
                        name: 'test3-1',
                        component: '::div',
                        className: 'ttk-ba-app-basetting-form-test3-1',
                        children: {
                            name: 'title',
                            component: '::span',
                            children: '存货科目是否启用明细科目？'
                        }
                    }
                    ]
                },{
                    name: 'test4',
                    component: '::div',
                    className: 'ttk-ba-app-basetting-form-test4',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：存货科目包含库存商品、原材料、周转材料'
                    }
                },{
                    name:'inventoryAccountClass',
                    component: 'Form.Item',
                    className: 'formitem2',
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
                    className: 'ttk-ba-app-basetting-form-test5',
                    children:[{
                        name: 'test5-1',
                        component: '::div',
                        className: 'ttk-ba-app-basetting-form-test5-1',
                        children: {
                            name: 'title',
                            component: '::span',
                            children: '收入科目是否启用明细科目？'
                        }
                    }
                    ]
                },{
                    name: 'test6',
                    component: '::div',
                    className: 'ttk-ba-app-basetting-form-test6',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：收入科目包含主营业务收入、其他业务收入'
                    }
                },{
                    name:'revenueAccountClass',
                    component: 'Form.Item',
                    className: 'formitem3',
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
                    className: 'ttk-ba-app-basetting-form-test7',
                    children:[{
                        name: 'test7-1',
                        component: '::div',
                        className: 'ttk-ba-app-basetting-form-test7-1',
                        children: {
                            name: 'title',
                            component: '::span',
                            children: '销售成本科目是否启用明细科目？'
                        }
                    }
                    // ,{
                    //     name: 'test7-2',
                    //     component: '::div',
                    //     className: 'ttk-ba-app-basetting-form-test7-2',
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
                    className: 'ttk-ba-app-basetting-form-test8',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：销售成本科目包含主营业务成本、其他业务成本'
                    }
                },{
                    name:'saleAccountClass',
                    component: 'Form.Item',
                    className: 'formitem4',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.saleAccountClass}}',
                        value: '{{data.form.saleAccount}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.saleAccount", e.target.value)}}}'
                    }]
                }
			]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			other: {
                loading: false,
                flag: false,
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
                entranceFlag: 'system'
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



