export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-archives-list',
		//onMouseDown: '{{$mousedown}}',
		children: [{
			name: 'header',
			component: 'Layout',
			className: 'app-archives-list-header',
			children: [{
				name: 'refresh',
				component: 'Layout',
				className: 'app-archives-list-header-left',
				children: [{
					name: 'refresh',
					component: 'Button',
					className: 'refresh',
					type: 'softly',
					iconFontFamily: 'mkicon',
					icon: 'refresh',
					title: '刷新',
					onClick: '{{$refresh}}'
				}]
			},{
				name: 'btnGroup',
				component: 'Layout',
				className: 'app-archives-list-header-right',
				children: [{
					name: 'add',
					component: 'Button',
					type: 'bluesky',
					children: '新增',
					className: 'btn',
					onClick: '{{$addClick}}'
				}, {
					name: 'del',
					component: 'Button',
					children: '删除',
					className: 'btn',
					onClick: '{{$delClickBatch}}'
				}]
			}]
		}, {
			name: 'content',
			component: 'Layout',
			className: 'app-archives-list-content',
			children: [{
				name: 'tabNav',
				component: 'Tabs',
				activeKey: '{{data.tabKey}}',
				onChange: `{{$tabChange}}`,
				children: [{
					name: 'customer',
					component: 'Tabs.TabPane',
					tab: '客户',
					key: 'customer',
				}, {
					name: 'supplier',
					component: 'Tabs.TabPane',
					tab: '供应商',
					key: 'supplier',
				}, {
					name: 'inventory',
					component: 'Tabs.TabPane',
					tab: '存货',
					key: 'inventory',
				}, {
					name: 'project',
					component: 'Tabs.TabPane',
					tab: '项目',
					key: 'project',
				}, {
					name: 'currency',
					component: 'Tabs.TabPane',
					tab: '币种',
					key: 'currency',
				}, {
					name: 'unit',
					component: 'Tabs.TabPane',
					tab: '计量单位',
					key: 'unit',
				}, {
					name: 'bankAccount',
					component: 'Tabs.TabPane',
					tab: '账户',
					key: 'bankAccount',
				}]
			}, {
				name: 'dataGrid',
				component: 'DataGrid',
				headerHeight: 35,
				isColumnResizing:true,
				rowHeight: 35,
				//enableSequence: true,
				startSequence: '{{(data.pagination.currentPage-1)*data.pagination.pageSize + 1}}',
				rowsCount: "{{$getListRowsCount()}}",
				columns: "{{$getListColumns()}}"
			}]
		}, {
			name: 'footer',
			component: 'Layout',
			className: 'app-archives-list-footer',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				showSizeChanger: true,
				pageSize: '{{data.pagination.pageSize}}',
				current: '{{data.pagination.current}}',
				total: '{{data.pagination.total}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$pageChanged}}',
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			list: [],
			tabKey: '',
			pagination: {
				current: 1,
				total: 0,
				pageSize: 20
			},
			columns: []
		}
	}
}