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
				className: 'ttk-stock-card-BOM-select-products-div-mian',
				component: '::div',
				children: [{
					name: 'ttk-stock-card-BOM-select-products-div-mian-table',
					className: 'ttk-stock-card-BOM-select-products-div-mian-table',
					component: 'Table',
					rowKey:'inventoryId',
					bordered: true,
					columns: '{{$renderColumns()}}',
					dataSource: '{{data.list}}',
					scroll:'{{data.tableOption}}',
					rowSelection: '{{$rowSelection()}}',
					pagination:false,
					emptyShowScroll: true,
					footer: '{{$renderFooter}}'
				}]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			tableOption:{
				y: 200,
				x: '100%'
			},
			selectOptions:[],
			selectedRowKeys: [],
			visible: false,
			list:[{
				inventoryId: '12313127',
				inventoryCode:'KC005',
				inventoryName:'数据采集主模块 KCTSV-008',
				inventoryGuiGe:'MX100-MWEK-1SQ',
				inventoryType:'库存商品',
				inventoryUnit:'台',
				checked: true,
			}]
		}
	}
}