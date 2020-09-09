export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-picking-material',
		children: [{  
			name: 'ttk-stock-app-spin',
			className: 'ttk-stock-app-spin',
			component: '::div',
			_visible: '{{data.loading}}',
			children: '{{$stockLoading()}}'
		},{
			name: 'ttk-stock-app-picking-material-header',
			className: 'ttk-stock-app-picking-material-header',
			component: '::div',
			children: [{
				name: 'ttk-stock-app-picking-material-header-product',
				className: 'ttk-stock-app-picking-material-header-product',
				component: '::span',
				children: '{{"产成品： "+ data.product.inventoryName+" "+(data.product.inventoryGuiGe||"")}}'
			}]
		},{
			name: 'ttk-stock-app-picking-material-main',
			className: 'ttk-stock-app-picking-material-main mk-layout',
			component: '::div',				
			children: {
				name: 'ttk-stock-app-picking-material-main-table',
				className: 'ttk-stock-app-picking-material-main-table mk-layout',
				component: 'Table',
				key:'inventoryId',
				rowKey:'inventoryId',
				bordered: true,
				pagination: false,
				scroll:'{{data.tableOption}}',
				columns:'{{$renderColumns()}}',
				dataSource: '{{data.list}}',
				emptyShowScroll: true
			}
		},{
			name: 'ttk-stock-app-picking-material-footer',
			className: 'ttk-stock-app-picking-material-footer',
			component:"::div",
			children:[{
				name: 'ttk-stock-app-picking-material-footer-btn',
				className: 'ttk-stock-app-picking-material-footer-btn',
				style: "{{{margin:'10px 20px 0 0'}}}",
				component: 'Button',
				children: '保存',
				type: 'primary',
				onClick: '{{$onSave}}'
			},{
				name: 'ttk-stock-app-picking-material-footer-btn',
				className: 'ttk-stock-app-picking-material-footer-btn',
				style: "{{{margin:'10px 20px 0 0'}}}",
				component: 'Button',
				children: '取消',
				type: 'default',
				onClick: '{{$onCancel}}'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			product: {
				inventoryName: '',
				inventoryGuiGe: ''
			},
			loading: false,
			isGenVoucher: false,
			tableOption: {
				x: '100%',
				y: 400
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
			selectNameList:[]
		}
	}
}