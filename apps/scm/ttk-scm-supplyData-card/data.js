import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-supplyData-card',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: [
				{
					name: 'tip',
					component: '::div',
					className: 'div1',
					style: {
						color: '#fa954c'
					},
					children: '注：1.本次修改的数据，会同时修改勾选发票上对应的字段'
				},
				{
					name: 'tip1',
					component: '::div',
					className: 'div2',
					style: {
						color: '#fa954c'
					},
					children: '2.批量修改数据，不影响已生成凭证的发票'
				},
				{
					name: 'property',
					component: 'Form.Item',
					label: '业务类型',
					className: 'name',
					_visible: '{{data.other.visible}}',
					children: [{
						name: 'property',
						component: 'Select',
						value: '{{data.form.propertyId}}',
						filterOption: '{{$filterOption2}}',
						showSearch: true,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						onChange: `{{function(v){$changeProperty('data.form.propertyId',data.other.property.filter(function(o){return o.propertyId == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.property && data.other.property[_rowIndex].propertyId}}',
							children: '{{data.other.property && data.other.property[_rowIndex].propertyName}}',
							_power: 'for in data.other.property'
						},
						// dropdownFooter: {
						// 	name: 'add',
						// 	type: 'primary',
						// 	component: 'Button',
						// 	style: { width: '100%', borderRadius: '0' },
						// 	children: '新增',
						// 	onClick: '{{function(){$addBussess()}}}'
						// },
					}]
				},
				{
					name: 'inventoryfilter',
					component: 'Form.Item',
					label: '费用类型',//进项 联动
					className: 'name',
					_visible: '{{data.other.isFY}}',
					children: [{
						name: 'inventoryfilterselect',
						component: 'Select',
						value: '{{data.form.inventoryName}}',
						filterOption: '{{$filterOption}}',
						showSearch: true,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						onChange: `{{function(v){$fieldChange('data.form.inventoryId',data.other.inventoryfilter.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.inventoryfilter && data.other.inventoryfilter[_lastIndex].id}}',
							children: '{{data.other.inventoryfilter && data.other.inventoryfilter[_lastIndex].fullName}}',
							_power: 'for in data.other.inventoryfilter'
						},
						dropdownFooter: {
							name: 'add',
							type: 'primary',
							component: 'Button',
							style: { width: '100%', borderRadius: '0' },
							children: '新增',
							onClick: '{{function(){$addRecordClick()}}}'
						},
					}, {
						name: 'popover',
						component: 'Popover',
						content: '只支持批量修改费用',
						placement: 'rightTop',
						overlayClassName: 'ttk-scm-app-sa-invoice-card-helpPopover',
						children: {
							name: 'icon',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'bangzhutishi',
							className: 'helpIcon'
						}
					}]
				},
				{
					name: 'propertyDetail',
					component: 'Form.Item',
					label: '明细分类',//进项 明细分类
					className: 'name',
					_visible: '{{data.other.showCH}}',
					children: [{
						name: 'detailListFilterSelect',
						component: 'Select',
						value: '{{data.form.propertyDetailId}}',
						filterOption: '{{$filterOption}}',
						showSearch: false,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						onChange: `{{function(v){$fieldChange('data.form.propertyDetailId',data.other.detailListFilter.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.detailListFilter && data.other.detailListFilter[_lastIndex].id}}',
							children: '{{data.other.detailListFilter && data.other.detailListFilter[_lastIndex].name}}',
							_power: 'for in data.other.detailListFilter'
						}
					}]
				},
				{
					name: 'inventory',
					component: 'Form.Item',
					label: '存货名称',//销项
					_visible: '{{!data.other.visible}}',
					className: 'name',
					children: [{
						name: 'inventory',
						component: 'Select',
						value: '{{data.form.inventoryId}}',
						filterOption: '{{$filterOption}}',
						showSearch: true,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						onChange: `{{function(v){$fieldChange('data.form.inventoryId',data.other.inventory.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.inventory && data.other.inventory[_rowIndex].id}}',
							children: '{{data.other.inventory && data.other.inventory[_rowIndex].name}}',
							_power: 'for in data.other.inventory'
						},
						dropdownFooter: {
							name: 'add',
							type: 'primary',
							component: 'Button',
							style: { width: '100%', borderRadius: '0' },
							children: '新增',
							onClick: '{{function(){$addInventoryClick()}}}'
						},
					}]
				},
				{
					name: 'supplier',
					component: 'Form.Item',
					label: '往来单位',//供应商
					className: 'supplier',
					_visible: '{{data.other.visible}}',
					children: [{
						name: 'supplier',
						component: 'Select',
						value: '{{data.form.supplierId}}',
						filterOption: '{{$filterOption}}',
						showSearch: true,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						onChange: `{{function(v){$fieldChange('data.form.supplierId',data.other.supplier.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.supplier && data.other.supplier[_rowIndex].id}}',
							children: '{{data.other.supplier && data.other.supplier[_rowIndex].name}}',
							_power: 'for in data.other.supplier'
						},
						dropdownFooter: {
							name: 'add',
							type: 'primary',
							component: 'Button',
							style: { width: '100%', borderRadius: '0' },
							children: '新增',
							onClick: '{{function(){$addSuppliers()}}}'
						},
					}]
				},
				{
					name: 'revenueType',
					component: 'Form.Item',
					label: '收入类型',//销项
					_visible: '{{!data.other.visible}}',
					className: 'name',
					children: [{
						name: 'revenueType',
						component: 'Select',
						value: '{{data.form.revenueType}}',
						filterOption: '{{function(v,option){return $filterOptionArchives("revenueType",v,option)}}}',
						showSearch: true,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						// dropdownFooter: "{{$handleAddRecord('RevenueType', 'revenueType')}}",
						onChange: `{{function(v){$fieldChange('data.form.revenueType',data.other.revenueType.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							key: '{{data.other.revenueType && data.other.revenueType[_rowIndex].id}}',
							value: '{{data.other.revenueType && data.other.revenueType[_rowIndex].id}}',
							children: '{{data.other.revenueType && data.other.revenueType[_rowIndex].name}}',
							_power: 'for in data.other.revenueType'
						},
						dropdownFooter: {
							name: 'add',
							component: 'Button',
							type: 'primary',
							style: { width: '100%', borderRadius: '0' },
							onClick: '{{$addRevenueType}}',
							children: '新增收入类型'
						}
					}, {
						name: 'popover',
						component: 'Popover',
						content: '可在基础设置/存货及服务档案中维护存货对应的收入类型',
						placement: 'rightTop',
						overlayClassName: 'ttk-scm-app-sa-invoice-card-helpPopover',
						children: {
							name: 'icon',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'bangzhutishi',
							className: 'helpIcon'
						}
					}]
				},
				{
					name: 'project',
					component: 'Form.Item',
					// _visible: '{{!data.other.visible}}',
					label: '项目',
					className: 'name',
					children: [{
						name: 'project',
						component: 'Select',
						showSearch: true,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						dropdownFooter: "{{$handleAddRecord('Project', 'project')}}",
						filterOption: '{{function(v,option){return $filterOptionArchives("project",v,option)}}}',
						value: '{{data.form.projectId}}',
						onChange: `{{function(v){$fieldChange('data.form.projectId',data.other.project.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							key: '{{data.other.project && data.other.project[_rowIndex].id }}',
							value: '{{data.other.project && data.other.project[_rowIndex].id }}',
							children: '{{data.other.project && data.other.project[_rowIndex].name }}',
							_power: 'for in data.other.project'
						},
					}]
				},
				{
					name: 'department',
					component: 'Form.Item',
					_visible: '{{data.other.visible}}',
					label: '部门',
					className: 'name',
					children: [{
						name: 'department',
						component: 'Select',
						showSearch: true,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						dropdownFooter: "{{$handleAddRecord('Department', 'department')}}",
						filterOption: '{{function(v,option){return $filterOptionArchives("department",v,option)}}}',
						value: '{{data.form.departmentId}}',
						onChange: `{{function(v){$fieldChange('data.form.departmentId',data.other.department.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							key: '{{data.other.department && data.other.department[_rowIndex].id }}',
							value: '{{data.other.department && data.other.department[_rowIndex].id }}',
							children: '{{data.other.department && data.other.department[_rowIndex].name }}',
							_power: 'for in data.other.department'
						},
					}]
				},
				{
					name: 'customer',
					component: 'Form.Item',
					label: '往来单位',//客户
					className: 'customer',
					_visible: '{{!data.other.visible}}',
					children: [{
						name: 'customer',
						component: 'Select',
						value: '{{data.form.customerId}}',
						filterOption: '{{$filterOption}}',
						showSearch: true,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						onChange: `{{function(v){$fieldChange('data.form.customerId',data.other.customer.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.customer && data.other.customer[_rowIndex].id}}',
							children: '{{data.other.customer && data.other.customer[_rowIndex].name}}',
							_power: 'for in data.other.customer'
						},
						dropdownFooter: {
							name: 'add',
							type: 'primary',
							component: 'Button',
							style: { width: '100%', borderRadius: '0' },
							children: '新增',
							onClick: '{{function(){$addCustomer()}}}'
						},
					}]
				},
				{
					name: 'taxRateTypes',
					component: 'Form.Item',
					label: '计税方式',//
					className: 'customer',
					_visible: '{{!data.other.visible}}',
					children: [{
						name: 'taxRateTypes',
						component: 'Select',
						value: '{{data.form.taxRateType}}',
						filterOption: '{{$filterOption}}',
						showSearch: false,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						onChange: `{{function(v){$fieldChange('data.form.taxRateType',data.other.taxRateTypes.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.taxRateTypes && data.other.taxRateTypes[_rowIndex].id}}',
							children: '{{data.other.taxRateTypes && data.other.taxRateTypes[_rowIndex].name}}',
							_power: 'for in data.other.taxRateTypes'
						},
					}]
				},
				{
					name: 'signAndRetreat',
					component: 'Form.Item',
					label: '征收方式',//
					className: 'customer',
					_visible: '{{$showImpose()}}',
					children: [{
						name: 'signAndRetreat',
						component: 'Select',
						value: '{{data.form.signAndRetreat}}',
						filterOption: '{{$filterOption}}',
						showSearch: false,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						onChange: `{{function(v){$fieldChange('data.form.signAndRetreat',data.other.impose.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.impose && data.other.impose[_rowIndex].id}}',
							children: '{{data.other.impose && data.other.impose[_rowIndex].name}}',
							_power: 'for in data.other.impose'
						},
					}]
				},
				{
					name: 'inventoryTypeSelect',
					component: 'Form.Item',
					label: '货物类型',
					className: 'customer',
					children: [{
						name: 'inventoryTypeSelect',
						component: 'Select',
						value: '{{data.form.inventoryTypeSelect}}',
						filterOption: '{{$filterOption}}',
						showSearch: false,
						allowClear: true,
						dropdownClassName: 'celldropdown',
						onChange: `{{function(v){$fieldChange('data.form.inventoryTypeSelect',data.other.inventoryTypes.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.inventoryTypes && data.other.inventoryTypes[_rowIndex].id}}',
							children: '{{data.other.inventoryTypes && data.other.inventoryTypes[_rowIndex].name}}',
							_power: 'for in data.other.inventoryTypes'
						},
					}]
				}
			]
		}
	}
}

export function getInitState() {
	return {
		data: {
			form: {},
			other: {
				error: {},
				loading: false,
				inventoryfilter: [],//进项存货
				project: [],
				isFY: false,//是否显示费用
				showCH: false,//是否显示明细
				detailList: [],
				detailListFilter: [],
				taxRateTypes:[],
				impose:[],
				department:[],
				inventoryTypes:[]
			},

		}
	}
}
