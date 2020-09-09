export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-app-unit-list',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'ttk-app-unit-list-backgroundColor',
			children: [{
				name: 'header',
				component: '::div',
				className: 'ttk-app-unit-list-header',
				children: [
				{
					name: 'btnGroup',
					component: 'Layout',
					className: 'ttk-app-unit-list-header-right',
					children: [{
						name: 'add',
						component: 'Button',
						children: '新增',
						type: 'primary',
						className: 'btn',
						onClick: '{{$addModel}}'
					}]
				}]
			}, {
				name: 'content',
				component: 'Layout',
				className: 'ttk-app-unit-list-content',
				children: [{
					name: 'table',
					component: 'Table',
					className: 'ttk-app-unit-list-Body',
					lazyTable: true,
					emptyShowScroll: true,
					loading: '{{data.other.loading}}',
					pagination: false,
					scroll: '{{data.tableOption}}',
					enableSequenceColumn: false,
					bordered: true,
					dataSource: '{{data.list}}',
					columns: '{{$renderColumns()}}',
				}]
			}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'ttk-app-unit-list-footer',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				showSizeChanger: true,
				pageSize: '{{data.pagination.pageSize}}',
				current: '{{data.pagination.current}}',
				total: '{{data.pagination.total}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$pageChanged}}'
			}]
		}]
	} 
}

export function getInitState() {
	return {
		data: {
			list: [{
				number:'01',
				describe: 'asdfasf'
			}],
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			tableOption: {
				x: 900,
				// y: null
			},
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			},
			columns: [],
            other:{
                property: []
            }
		}
	}
}
