export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-edf-app-column',
		children: [{
			name: 'left',
			component: 'Card',
			className: 'ttk-edf-app-column-left',
			title: '栏目',
			extra: {
				name: 'header',
				component: '::div',
				children: [{
					name: 'add',
					component: 'Button',
                    className:'button',
					icon: 'plus',
					onClick: '{{$addType}}'
				}, {
					name: 'modify',
					component: 'Button',
                    className:'button',
					icon: 'edit',
					onClick: '{{$modifyType}}'
				}, {
					name: 'del',
					component: 'Button',
					icon: 'close',
					onClick: '{{$delType}}'
				}]

			},

			children: [{
				name: 'tree',
				component: 'Tree',
				selectedKeys: `{{[data.selectedKeys]}}`,
				onSelect: '{{$selectType}}',
				children: '{{$loopTreeChildren(data.tree)}}'
			}]
		}, {
			name: 'content',
			component: 'Card',
			className: 'ttk-edf-app-column-content',
			title: '栏目',
			extra: {
				name: 'header',
				component: '::div',
				className: 'ttk-edf-app-column-content-header',
				children: [{
					name: 'add',
					component: 'Button',
					type: 'primary',
					children: '新增',
					onClick: '{{$addDetail}}'
				}, {
					name: 'del',
					component: 'Button',
					children: '删除',
					onClick: '{{$batchDelDetail}}'
				},{
					name: 'setting',
					component: 'Button',
					_visible: false,
					children: '栏目设置',
					onClick: '{{$columnSetting}}'
				}]
			},
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				headerHeight: 37,
				rowHeight: 35,
				enableSequence: true,
				startSequence: '{{(data.pagination.currentPage-1)*data.pagination.pageSize + 1}}',
				rowsCount: "{{$getListRowsCount()}}",
				columns: "{{$getListColumns()}}"
			},{
				name: 'footer',
				className: 'ttk-edf-app-column-content-footer',
				component: '::div',
				children: [{
					name: 'pagination',
					component: 'Pagination',
					showSizeChanger: true,
					pageSize: '{{data.pagination.pageSize}}',
					current: '{{data.pagination.currentPage}}',
					total: '{{data.pagination.totalCount}}',
					onChange: '{{$pageChanged}}',
					onShowSizeChange: '{{$pageChanged}}'
				}]
			}]
		}]
	}
}


export function getInitState() {
	return {
		data: {
			tree: [],
			columns: [],
			list: [],
			pagination: { currentPage: 1, totalPage: 0, totalData: 0, pageSize: 20 },
			other: { filter: {} }
		}
	}
}
