import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-scm-app-archives-card',
        children: {
            name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
            spinning: '{{data.other.loading}}',
            children:[{
                name: 'dev',
                component: '::div',
				className: 'ttk-scm-app-archives-card-form',
                children:[{
                    name: 'test',
                    component: '::div',
                    className: 'ttk-scm-app-archives-card-form-test',
                    children: {
                        name: 'title',
                        component: '::div',
                        children: '注：选中选项后，生成凭证会自动生成对应档案，减少工作量。'
                    }
                },{
                    name: 'dev1',
                    component: '::div',
                    className: 'ttk-scm-app-archives-card-form1',
                    children:[{
                        name: 'checkbox',
                        component: 'Checkbox',
                        className: 'ttk-scm-app-archives-card-form1-check',
                        checked: '{{data.form.customerFiles}}',
                        children: '自动生成客户档案',
                        // onChange: '{{$customerFilesChange}}'
                    },{
                        name: 'consumerClass',
                        component: 'Form.Item',
                        className: 'ttk-scm-app-archives-card-form1-item',
                        label: '客户分类',
                        children: [{
                            name: 'select',
                            component: 'Select',
                            allowClear:true,
                            value: '{{data.form.consumerId}}',
                            // onChange: `{{function(v){$fieldChange('data.form.consumerId',v)}}}`,
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                // value: '{{data.other.consumer && data.other.consumer[_rowIndex].code}}',
                                // children: '{{data.other.consumer && data.other.consumer[_rowIndex].name}}',
                                // _power: 'for in data.other.consumer'
                            }
                        }]
                    },{
                        name:'encodingRule',
                        component: 'Form.Item',
                        className: 'ttk-scm-app-archives-card-form1-group',
                        label: '编码规则',                    
                        children:[{
                            name: 'check',
                            component: 'Radio.Group',
                            options: '{{data.other.encodingRule}}',
                            value: '{{data.form.encodingRuleId1}}',
                            onChange: '{{function(e){$checkBoxChange("data.form.encodingRuleId1", e.target.value)}}}'
                        }]
                    },{
                        name: 'startCode',
                        component: 'Form.Item',
                        className: 'ttk-scm-app-archives-card-form1-code',
                        label: '起始编码',
                        children: [{
                            name: 'code',
                            component: 'Input',
                            value: '{{data.form.startCode}}',
                            // onChange: "{{function(e){$fieldChange('data.form.code',e.target.value);}}}"
                        }]
                    }]
                },{
                    name: 'dev2',
                    component: '::div',
                    className: 'ttk-scm-app-archives-card-form2',
                    children:[{
                        name: 'checkbox',
                        component: 'Checkbox',
                        className: 'ttk-scm-app-archives-card-form2-check',
                        checked: '{{data.form.supplierFiles}}',
                        children: '自动生成供应商档案',
                        // onChange: '{{$customerFilesChange}}'
                    },{
                        name: 'consumerClass',
                        component: 'Form.Item',
                        className: 'ttk-scm-app-archives-card-form2-item',
                        label: '供应商分类',
                        children: [{
                            name: 'select',
                            component: 'Select',
                            allowClear:true,
                            value: '{{data.form.supplierId}}',
                            // onChange: `{{function(v){$fieldChange('data.form.supplierId',v)}}}`,
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                // value: '{{data.other.supplier && data.other.supplier[_rowIndex].code}}',
                                // children: '{{data.other.supplier && data.other.supplier[_rowIndex].name}}',
                                // _power: 'for in data.other.supplier'
                            }
                        }]
                    },{
                        name:'encodingRule',
                        component: 'Form.Item',
                        className: 'ttk-scm-app-archives-card-form2-group',
                        label: '编码规则',                    
                        children:[{
                            name: 'check',
                            component: 'Radio.Group',
                            options: '{{data.other.encodingRule}}',
                            value: '{{data.form.encodingRuleId2}}',
                            onChange: '{{function(e){$checkBoxChange("data.form.encodingRuleId2", e.target.value)}}}'
                        }]
                    },{
                        name: 'test1',
                        component: '::div',
                        className: 'ttk-scm-app-archives-card-form2-test',
                        children: {
                            name: 'title',
                            component: '::div',
                            children: '例：供应商名称为“广东方欣科技”，编码为“gdfxkj'
                        }
                    }]
                },{
                    name: 'dev3',
                    component: '::div',
                    className: 'ttk-scm-app-archives-card-form3',
                    children:[{
                        name: 'checkbox',
                        component: 'Checkbox',
                        className: 'ttk-scm-app-archives-card-form3-check',
                        checked: '{{data.form.inventoryFiles}}',
                        children: '自动生成存货档案',
                        // onChange: '{{$customerFilesChange}}'
                    },{
                        name: 'inventoryClass',
                        component: 'Form.Item',
                        className: 'ttk-scm-app-archives-card-form3-item',
                        label: '存货分类',
                        children: [{
                            name: 'select',
                            component: 'Select',
                            allowClear:true,
                            value: '{{data.form.inventoryId}}',
                            // onChange: `{{function(v){$fieldChange('data.form.inventoryId',v)}}}`,
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                // value: '{{data.other.inventory && data.other.inventory[_rowIndex].code}}',
                                // children: '{{data.other.inventory && data.other.inventory[_rowIndex].name}}',
                                // _power: 'for in data.other.inventory'
                            }
                        }]
                    },{
                        name:'encodingRule',
                        component: 'Form.Item',
                        className: 'ttk-scm-app-archives-card-form3-group',
                        label: '编码规则',                    
                        children:[{
                            name: 'check',
                            component: 'Radio.Group',
                            options: '{{data.other.encodingRule}}',
                            value: '{{data.form.encodingRuleId3}}',
                            onChange: '{{function(e){$checkBoxChange("data.form.encodingRuleId3", e.target.value)}}}'
                        }]
                    },{
                        name: 'startCode',
                        component: 'Form.Item',
                        className: 'ttk-scm-app-archives-card-form3-code',
                        label: '起始编码',
                        children: [{
                            name: 'code',
                            component: 'Input',
                            value: '{{data.form.startCode3}}',
                            // onChange: "{{function(e){$fieldChange('data.form.code',e.target.value);}}}"
                        }]
                    }]
                },{
                    name: 'dev4',
                    component: '::div',
                    className: 'ttk-scm-app-archives-card-form4',
                    children:[{
                        name: 'checkbox',
                        component: 'Checkbox',
                        className: 'ttk-scm-app-archives-card-form4-check',
                        checked: '{{data.form.customerAccountChoose}}',
                        children: '客户自动生成往来科目',
                        // onChange: '{{$customerFilesChange}}'
                    },{
                        name: 'consumerAccount',
                        component: 'Form.Item',
                        className: 'ttk-scm-app-archives-card-form4-item',
                        label: '上级科目',
                        children: [{
                            name: 'select',
                            component: 'Select',
                            allowClear:true,
                            value: '{{data.form.consumerAccountId}}',
                            // onChange: `{{function(v){$fieldChange('data.form.consumerAccountId',v)}}}`,
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                // value: '{{data.other.consumerAccount && data.other.consumerAccount[_rowIndex].code}}',
                                // children: '{{data.other.consumerAccount && data.other.consumerAccount[_rowIndex].name}}',
                                // _power: 'for in data.other.consumerAccount'
                            }
                        }]
                    }]
                },{
                    name: 'dev5',
                    component: '::div',
                    className: 'ttk-scm-app-archives-card-form5',
                    children:[{
                        name: 'checkbox',
                        component: 'Checkbox',
                        className: 'ttk-scm-app-archives-card-form5-check',
                        checked: '{{data.form.supplierAccountChoose}}',
                        children: '供应商自动生成往来科目',
                        // onChange: '{{$customerFilesChange}}'
                    },{
                        name: 'supplierAccount',
                        component: 'Form.Item',
                        className: 'ttk-scm-app-archives-card-form5-item',
                        label: '上级科目',
                        children: [{
                            name: 'select',
                            component: 'Select',
                            allowClear:true,
                            value: '{{data.form.supplierAccountId}}',
                            // onChange: `{{function(v){$fieldChange('data.form.supplierAccountId',v)}}}`,
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                // value: '{{data.other.supplierAccount && data.other.supplierAccount[_rowIndex].code}}',
                                // children: '{{data.other.supplierAccount && data.other.supplierAccount[_rowIndex].name}}',
                                // _power: 'for in data.other.supplierAccount'
                            }
                        }]
                    }]
                },{
                    name: 'dev6',
                    component: '::div',
                    className: 'ttk-scm-app-archives-card-form6',
                    children:[{
                        name: 'checkbox',
                        component: 'Checkbox',
                        className: 'ttk-scm-app-archives-card-form6-check',
                        checked: '{{data.form.inventoryAccountChoose}}',
                        children: '存货自动生成存货科目',
                        // onChange: '{{$customerFilesChange}}'
                    },{
                        name: 'test1',
                        component: '::div',
                        className: 'ttk-scm-app-archives-card-form6-test',
                        children: {
                            name: 'title',
                            component: '::div',
                            children: '注：默认按照存货类别生成'
                        }
                    }]
                }]
            }]
        }
    }
}

export function getInitState() {
	return {
		data: {
			other: {
				loading: false,
                encodingRule:[{
                    value: 1,
                    label: '数字规则'
                },{
                    value: 2,
                    label: '名称拼音首字规则'
                }],
            },
            form:{
                customerFiles: true
            }
			
		}
	}
}
