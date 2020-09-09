export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-inventory-BOM-picking',
		children: [{ 
			name: 'ttk-stock-app-spin',
			className: 'ttk-stock-app-spin',
			component: '::div',
			_visible: '{{data.loading}}',
			children: '{{$stockLoading()}}'
		},{
			name: 'ttk-stock-app-inventory-BOM-picking-header',
			className: 'ttk-stock-app-inventory-BOM-picking-header',
			component: '::div',
			children: [{
				name: 'ttk-stock-app-inventory-BOM-picking-header-others',					
				className: 'ttk-stock-app-inventory-BOM-picking-header-others',
				component: '::div',
				children: [{
					name: 'ttk-stock-app-inventory-BOM-picking-header-others-left',						
					className: 'ttk-stock-app-inventory-BOM-picking-header-others-left',
					component: '::div',
					children:[{
						name: 'ttk-stock-app-inventory-BOM-picking-header-others-left-top',
						className: 'back-btn',
						component: '::span',
						onClick: '{{$handleReturn}}'							
					},{
						name: 'ttk-stock-app-inventory-BOM-picking-header-others-left-bottom',
						className: 'bom-search',
						component: 'Input.Search',	
						placeholder: '请输入存货名称或BOM编码',
						onChange: '{{$searchStock}}'						
					}]
				},{
					name: 'ttk-stock-app-inventory-BOM-picking-header-others-right',						
					className: 'ttk-stock-app-inventory-BOM-picking-header-others-right',
					component: '::div',
					_visible: '{{!data.xdzOrgIsStop}}',
					children: {
						name: 'ttk-stock-app-inventory-BOM-picking-header-others-right-top',							
						className: 'ttk-stock-app-inventory-BOM-picking-header-others-right-top',
						component: '::span',
						children: {
							name: 'update-btn',
							className: 'update-btn',
							component: 'Button',
							children: '{{data.others.btnText}}',
							type: 'primary',
							onClick: '{{$selectProduct}}',
						}
					}
				}]
			}]
		}, {  
			name: 'ttk-stock-app-inventory-BOM-picking-main',
			className: 'ttk-stock-app-inventory-BOM-picking-main mk-layout',
			component: '::div',				
			children: {
				name: 'ttk-stock-app-inventory-BOM-picking-main-table',
				className: 'ttk-stock-app-inventory-BOM-picking-main-table mk-layout',
				component: 'Table',
				key:'bomId',
				rowKey:'bomId',
				indentSize: 15,
				bordered: true,
				pagination: false,
				scroll:'{{data.tableOption}}',
				columns:'{{$renderColumns()}}',
				dataSource: '{{data.list}}',
				emptyShowScroll: true,
				rowKey: 'inventoryId',
				onExpand: '{{$onRowExpand}}',
				defaultExpandAllRows: false,
				expandedRowKeys: '{{data.expandedRowKeys}}'
			}
		},{  // 分页
			name: 'pagination',
			component: 'Pagination',
			showSizeChanger: true,
			pageSize: '{{data.pagination.pageSize}}',
			current: '{{data.pagination.currentPage}}',
			total: '{{data.pagination.totalCount}}',
			onChange: '{{$pageChanged}}',
			showTotal: '{{$pageShowTotal}}',
			onShowSizeChange: '{{$pageChanged}}'
		}]
	}
}

export function getInitState() {
	return {
		data: {
			pageTitle: 'BOM清单',
			loading: false,
			isGenVoucher: false,
			tableOption: {
				x: '100%',
				y: 400
			},
			others: {
				code: '',
				btnText: '选择产成品',
				period: ''			
			},
			listItem: {
				xh: '',
				inventoryId: 1,
				inventoryCode: '',
				inventoryName: '',
				inventoryGuiGe: '',
				inventoryUnit: '',
				num: '',
				matDisCof: '',
				isDisable: '',
				isSelect: false,
			},
			list:[],
			pagination: {
				pageSize: 50,
				currentPage:1,
				totalCount:0,
			},
			products:[],
			listCopy:[],
			selectNameList:[],
			expandedRowKeys: []
		}
	}
}