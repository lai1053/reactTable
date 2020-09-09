import moment from 'moment'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-automatic-generation-setting',
		children: {
			name: 'mail',
			component: 'Spin',
			tip: '加载中...',
			delay: 0.01,
			spinning: '{{data.loading}}',
			children: {
				name: 'form',
				component: 'Form',
				layout: 'inline',
				className: 'ttk-scm-automatic-generation-setting-form',
				children: [{
					name: 'barItem',
					component: '::div',
					className: 'ttk-scm-automatic-generation-setting-form-content',
					children: [{
						name: 'customer',
						component: '::div',
						children: [{
							name: 'left',
							component: '::div',
							_visible:'{{data.other.isAux.consumer==true}}',
							className: 'left',
							children: [{
								component: 'Checkbox',
								children: '自动生成客户档案',
								className: 'customer-title',
								checked: '{{data.form.customerSet}}',
								onChange: '{{function(e){ $onFileChange("data.form.customerSet", e.target.checked) }}}',
							}, {
								name: 'customerItem',
								component: 'Form.Item',
								label: '客户分类',
								children: {
									name: 'customerClassCode',
									component: 'Select',
									showSearch: false,
									allowClear: true,
									optionFilterProp: 'children',
									//className: '{{ data.other.customerClassCode ? "error" : "" }}',
									value: '{{data.form.customerClassCode&&data.form.customerClassCode}}',
									onChange: '{{function(e){ $onFileChange("data.form.customerClassCode", e, "customerClassCode") }}}',
									children: {
										name: 'selectItem',
										component: 'Select.Option',
										value: '{{data.other.customer[_rowIndex].code}}',
										children: '{{data.other.customer[_rowIndex].name}}',
										_power: 'for in data.other.customer'
									}
								}
							}, {
								name: 'customerCodeRule',
								component: 'Form.Item',
								label: '编码规则',
								children: {
									name: 'RadioGroup',
									component: 'Radio.Group',
									onChange: '{{function(e){ $onFileChange("data.form.customerCodeRule", e.target.value) }}}',
									value: '{{data.form.customerCodeRule}}',
									children: [
										{
											name: 'Radio2',
											component: 'Radio',
											value: 1,
											children: '数字规则'
										},
										{
											name: 'Radio1',
											component: 'Radio',
											value: 2,
											children: '名称拼音首字规则'
										}
									]
								}
							}, {
								name: 'li',
								component: '::div',
								_visible: '{{ data.form.customerCodeRule==2 }}',
								className: 'zhu',
								children: '例：客户名称为“广东方欣科技”，编码为“gdfxkj”'
							}, {
								name: 'customerCode',
								component: 'Form.Item',
								_visible: '{{ data.form.customerCodeRule==1 }}',
								label: '起始编码',
								children: {
									name: 'input',
									component: 'Input.Number',
									className: '{{ data.other.customerStarCode ? "error" : "" }}',
									value: '{{data.form.customerStarCode}}',
									onChange: '{{function(e){ $onFileChange("data.form.customerStarCode", e, "customerStarCode") }}}',
									style: { Height: '30px' }
								}
							}]
						}, {
							name: 'rigjt',
							component: '::div',
							className: 'right',
							_visible:'{{data.form.currentAccountShow==true}}',
							children: [{
								component: 'Checkbox',
								children: '客户自动生成往来科目',
								className: 'customer-title',
								checked: '{{data.form.customerAccountSet}}',
								onChange: '{{function(e){ $onFileChange("data.form.customerAccountSet", e.target.checked) }}}',
							}, {
								name: 'customerSubject',
								component: 'Form.Item',
								label: '上级科目',
								children: {
									name: 'customerParentAccountCode',
									component: 'Select',
									className: '{{ data.other.customerParentAccountCode ? "error" : "" }}',
									showSearch: true,
									allowClear: true,
									optionFilterProp:"children",
									filterOption: '{{$filterOptionSubject}}',
									value: '{{data.form.customerParentAccountCode&&data.form.customerParentAccountCode}}',
									onChange: '{{function(e){ $onFileChange("data.form.customerParentAccountCode", e) }}}',
									children: {
										name: 'selectItem',
										component: 'Select.Option',
										value: '{{data.other.account[_rowIndex].code}}',
										children: '{{data.other.account[_rowIndex].codeAndName}}',
										_power: 'for in data.other.account'
									}
								}
							}]
						}]
					}, {
						name: 'supplier',
						component: '::div',
						children: [{
							name: 'left',
							component: '::div',
							_visible:'{{data.other.isAux.supplier==true}}',
							className: 'left',
							children: [{
								component: 'Checkbox',
								children: '自动生成供应商档案',
								className: 'supplier-title',
								checked: '{{data.form.supplierSet}}',
								onChange: '{{function(e){ $onFileChange("data.form.supplierSet", e.target.checked) }}}',
							}, {
								name: 'supplierItem',
								component: 'Form.Item',
								label: '供应商分类',
								children: {
									name: 'supplierClassCode',
									component: 'Select',
									showSearch: false,
									optionFilterProp: 'children',
									allowClear: true,
									//className: '{{ data.other.supplierClassCode ? "error" : "" }}',
									value: '{{data.form.supplierClassCode&&data.form.supplierClassCode}}',
									onChange: '{{function(e){ $onFileChange("data.form.supplierClassCode", e, "supplierClassCode") }}}',
									children: {
										name: 'selectItem',
										component: 'Select.Option',
										value: '{{data.other.supplier[_rowIndex].code}}',
										children: '{{data.other.supplier[_rowIndex].name}}',
										_power: 'for in data.other.supplier'
									}
								}
							}, {
								name: 'supplierCodeRule',
								component: 'Form.Item',
								label: '编码规则',
								children: {
									name: 'RadioGroup',
									component: 'Radio.Group',
									onChange: '{{function(e){ $onFileChange("data.form.supplierCodeRule", e.target.value) }}}',
									value: '{{data.form.supplierCodeRule}}',
									children: [
										{
											name: 'Radio2',
											component: 'Radio',
											value: 1,
											children: '数字规则'
										},
										{
											name: 'Radio1',
											component: 'Radio',
											value: 2,
											children: '名称拼音首字规则'
										}
									]
								}
							}, {
								name: 'li',
								component: '::div',
								_visible: '{{ data.form.supplierCodeRule==2 }}',
								className: 'zhu',
								children: '例：供应商名称为“广东方欣科技”，编码为“gdfxkj”'
							}, {
								name: 'supplierCode',
								component: 'Form.Item',
								_visible: '{{ data.form.supplierCodeRule==1 }}',
								label: '起始编码',
								children: {
									name: 'input',
									component: 'Input.Number',
									className: '{{ data.other.supplierStarCode ? "error" : "" }}',
									value: '{{data.form.supplierStarCode}}',
									onChange: '{{function(e){ $onFileChange("data.form.supplierStarCode", e, "supplierStarCode") }}}',
									style: { Height: '30px' }
								}
							}]
						}, {
							name: 'right',
							component: '::div',
							_visible:'{{data.form.currentAccountShow==true}}',
							className: 'right',
							children: [{
								component: 'Checkbox',
								children: '供应商自动生成往来科目',
								className: 'supplier-title',
								checked: '{{data.form.supplierAccountSet}}',
								onChange: '{{function(e){ $onFileChange("data.form.supplierAccountSet", e.target.checked) }}}',
							}, {
								name: 'supplierSubject',
								component: 'Form.Item',
								label: '上级科目',
								children: {
									name: 'supplierParentAccountCode',
									component: 'Select',
									className: '{{ data.other.supplierParentAccountCode ? "error" : "" }}',
									showSearch: true,
									allowClear: true,
									optionFilterProp:"children",
									filterOption: '{{$filterOptionSubject}}',
									value: '{{data.form.supplierParentAccountCode&&data.form.supplierParentAccountCode}}',
									onChange: '{{function(e){ $onFileChange("data.form.supplierParentAccountCode", e) }}}',
									children: '{{$renderAccountSelectOption("account")}}'
								}
							}]
						}]
					}, {
						name: 'inventory',
						component: '::div',
						children: [{
							name: 'left',
							component: '::div',
							_visible:'{{data.other.isAux.inventory==true}}',
							className: 'left',
							children: [{
								component: 'Checkbox',
								children: '自动生成存货档案',
								className: 'inventory-title',
								checked: '{{data.form.inventorySet}}',
								onChange: '{{function(e){ $onFileChange("data.form.inventorySet", e.target.checked) }}}',
							}, {
								name: 'inventoryItem',
								component: 'Form.Item',
								label: '存货分类',
								children: {
									name: 'inventoryClassCode',
									component: 'Select',
									showSearch: false,
									allowClear: true,
									optionFilterProp: 'children',
									//className: '{{ data.other.inventoryClassCode ? "error" : "" }}',
									value: '{{data.form.inventoryClassCode&&data.form.inventoryClassCode}}',
									onChange: '{{function(e){ $onFileChange("data.form.inventoryClassCode", e, "inventoryClassCode") }}}',
									children: {
										name: 'selectItem',
										component: 'Select.Option',
										value: '{{data.other.inventory[_rowIndex].code}}',
										children: '{{data.other.inventory[_rowIndex].name}}',
										_power: 'for in data.other.inventory'
									}
								}
							}, {
								name: 'inventoryCodeRule',
								component: 'Form.Item',
								label: '编码规则',
								children: {
									name: 'RadioGroup',
									component: 'Radio.Group',
									onChange: '{{function(e){ $onFileChange("data.form.inventoryCodeRule", e.target.value) }}}',
									value: '{{data.form.inventoryCodeRule}}',
									children: [
										{
											name: 'Radio2',
											component: 'Radio',
											value: 1,
											children: '数字规则'
										},
										{
											name: 'Radio1',
											component: 'Radio',
											value: 2,
											children: '名称拼音首字规则'
										}
									]
								}
							}, {
								name: 'li',
								component: '::div',
								_visible: '{{ data.form.inventoryCodeRule==2 }}',
								className: 'zhu',
								children: '例：存货名称为“广东方欣科技”，编码为“gdfxkj”'
							}, {
								name: 'inventoryCode',
								component: 'Form.Item',
								_visible: '{{ data.form.inventoryCodeRule==1 }}',
								label: '起始编码',
								children: {
									name: 'input',
									component: 'Input.Number',
									className: '{{ data.other.inventoryStarCode ? "error" : "" }}',
									value: '{{data.form.inventoryStarCode}}',
									onChange: '{{function(e){ $onFileChange("data.form.inventoryStarCode", e, "inventoryStarCode") }}}',
									style: { Height: '30px' }
								}
							}]
						}/*, {
							name: 'right',
							component: '::div',
							className: 'right',
							children: [{
								component: 'Checkbox',
								children: '存货自动生成存货科目',
								className: 'inventory-title',
								checked: '{{data.form.inventoryAccountSet}}',
								//onChange: '{{function(e){$showOptionsChange("includeSum", e.target.checked)}}}'
							}, {
								name: 'zhu',
								component: '::div',
								className: 'zhu',
								children: '注：默认按照存货类别生成'
							}]
						}*/]
					}]
				}, {
					name: 'footer',
					component: '::div',
					className: 'ttk-scm-automatic-generation-setting-form-footer',
					children: [{
						name: 'title',
						component: '::span',
						className: 'ttk-scm-automatic-generation-setting-form-footer-title',
						children: "注：选中选项后，生成凭证会自动生成对应档案，减少工作量。",
					}, {
						name: 'cancel',
						component: 'Button',
						className: 'ttk-scm-automatic-generation-setting-form-footer-cancel',
						children: "取消",
						onClick: '{{$oncancel}}',
					}, {
						name: 'confirm',
						component: 'Button',
						className: 'ttk-scm-automatic-generation-setting-form-footer-confirm',
						type: 'primary',
						children: "保存",
						onClick: '{{$onconfirm}}'
					}]
				}]
			}
		}
	}
}

export function getInitState(option) {
	let state = {
		data: {
			form: {
				customerSet: false, //自动生成客户档案
				customerClassCode: '', //客户分类
				customerCodeRule: 2, //编码规则
				customerStarCode: '',  //客户起始编码
				customerAccountSet: false, //客户自动生成往来科目
				customerParentAccountCode: '', //客户上级科目

				supplierSet: false, //自动生成供应商档案
				supplierClassCode: '', //供应商分类
				supplierCodeRule: 2, //编码规则
				supplierStarCode: '',  //供应商起始编码
				supplierAccountSet: false, //供应商自动生成往来科目
				supplierParentAccountCode: '', //供应商上级科目

				inventorySet: false, //自动生成存货档案
				inventoryClassCode: '', //存货分类
				inventoryCodeRule: 2, //编码规则
				inventoryStarCode: '',  //存货起始编码
				inventoryAccountSet: false, //存货自动生成往来科目
			},
			other: {
				customer: [],
				supplier: [],
				inventory: [],
				account: [],
				customerClassCode: false,
				supplierClassCode: false,
				inventoryClassCode: false,
				customerStarCode: false,
				supplierStarCode: false,
				inventoryStarCode: false,
				isAux:{

				}
			},
			loading: false,
		}
	}
	return state
}