export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-card-BOM-select-products',
		children: [{
			name: 'container',
			component: '::span',
			className: 'ttk-stock-card-BOM-select-products-div',
			children: [{
				name: 'ttk-stock-card-BOM-select-products-div-filter',
				className: 'ttk-stock-card-BOM-select-products-div-filter',
				name: '',
				className: '',
				component: '::div',
				children: {
					name: 'select-filter',
					className: 'select-filter',
					component:  '::div',
					children: {
						name: 'ttk-stock-card-BOM-select-products-div-filter',
						className: 'ttk-stock-card-BOM-select-products-div-filter',
						component: '::div',
						children: [{
							name: 'ttk-stock-card-BOM-select-products-div-filter-searchIcon',
							className: 'ttk-stock-card-BOM-select-products-div-filter-searchIcon',
							component: '::i'
						},{
							name: 'ttk-stock-card-BOM-select-products-div-filter-search',
							className: 'ttk-stock-card-BOM-select-products-div-filter-search',
							component: '::input',
							placeholder: '请输入存货名称或者存货编码',
							onChange:'{{$searchChange}}'
						}]
					}
				}
			}, {
				name: 'ttk-stock-card-BOM-select-products-div-mian',
				className: 'ttk-stock-card-BOM-select-products-div-mian  mk-layout',
				component: '::div',
				// children: [{
				// 	name: 'ttk-stock-card-BOM-select-products-div-mian-table',
				// 	className: 'ttk-stock-card-BOM-select-products-div-mian-table',
				// 	component: 'Table',
				// 	rowKey:'inventoryId',
				// 	bordered: true,
				// 	columns: '{{$renderColumns()}}',
				// 	dataSource: '{{data.list}}',
				// 	scroll:'{{data.tableOption}}',
				// 	rowSelection: '{{$rowSelection()}}',
				// 	pagination:false,
				// 	emptyShowScroll: true,
				// }]
				children: '{{$renderTable()}}'
			},{
				name: 'ttk-stock-card-BOM-select-products-footer',
				className: 'ttk-stock-card-BOM-select-products-footer',
				component: '::div',
				children:[{
					name: 'ttk-stock-card-BOM-select-products-statics',
					className: 'ttk-stock-card-BOM-select-products-statics',
					component: '::div',
					children: '{{$renderFooter()}}'
				},{
					name: 'ttk-stock-card-BOM-select-products-btn-container',
					className: 'ttk-stock-card-BOM-select-products-btn-container',
					component: '::div',
					children: [{
						name: 'ttk-stock-card-BOM-select-products-btn',
						className: 'ttk-stock-card-BOM-select-products-btn',
						component: 'Button',
						children: '保存',
						type: 'primary',
						onClick: '{{$onSave}}'
					},{
						name: 'ttk-stock-card-BOM-select-products-btn-1',
						className: 'ttk-stock-card-BOM-select-products-btn',
						component: 'Button',
						children: '取消',
						type: 'default',
						onClick: '{{$onCancel}}'
					}]
				}]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			tableOption:{
				y: 340,
				x: '100%'
			},
			selectOptions:[],
			selectedRowKeys: [],
			visible: false,
			list:[],
			newC: ''
		}
	}
}