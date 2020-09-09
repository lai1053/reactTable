export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-scm-app-file-mapping',
		children: {
			name: 'tabNav',
			component: 'Tabs',
			activeKey: '{{data.other.activeKey}}',
			onChange: '{{$onTabChange}}',
			animated: false,
			className: 'ttk-scm-app-file-mapping-tabs',
			children: {
				name: "tabs",
				component: 'Tabs.TabPane',
				className: 'ttk-scm-app-file-mapping-tabs-tabpane',
				key: "{{ _rowIndex }}",
				tab: {
					name: 'tab',
					component: '::div',
					children: '{{ data.tabs && data.tabs[_rowIndex].name }}'
				},
				children: {
					key: '{{data.tabs[_rowIndex].title}}',
					name: 'doc',
					component: '::div',
					className: 'ttk-scm-app-file-mapping-doc',
					children: [
						{
							name: 'header',
							component: '::div',
							className: 'ttk-scm-app-file-mapping-doc-header',
							children: [
								{
									name: 'left',
									component: '::div',
									className: 'ttk-scm-app-file-mapping-doc-header-left',
									children: [
										{
											name: 'search',
											component: 'Input.Search',
											className: 'mk-input',
											placeholder: "请输入编号/名称",
											autocomplete: "off",
											value: '{{data.table[_rowIndex].filter.simpleCondition}}',
											onChange: '{{function(e){$changeCondition(_rowIndex,e)}}}',
											onSearch: '{{function(){$request(_rowIndex)}}}',
											onBlur: '{{function(){$request(_rowIndex)}}}',
										},
										{
											name: 'refreshBtn',
											component: 'Icon',
											fontFamily: 'edficon',
											type: 'shuaxin',
											className: 'mk-normalsearch-reload',
											title: '刷新',
											onClick: '{{function(){$refresh(_rowIndex)}}}'
										},
										{
											name: 'text',
											component: '::div',
											className: 'ttk-scm-app-file-mapping-doc-header-text',
											children: '{{data.table[_rowIndex].tip}}'
										}
									]
								},			
								// {
								// 	name: 'button',
								// 	component: 'Button',
								// 	_visible: '{{(_rowIndex == 0 || _rowIndex == 1 || _rowIndex == 2) ? true : false}}',
								// 	className: 'ttk-scm-app-file-mapping-doc-header-right-button',
								// 	children: '{{_rowIndex == 2 ? "批量生成存货科目" : "批量生成往来科目"}}',
								// 	onClick: '{{function(){$handleBatch(_rowIndex)}}}'
								// }
							]
						},
						{
							name: 'content',
							component: '::div',
							className: 'ttk-scm-app-file-mapping-doc-content',
							children: {
								name: 'datagrid',
								component: 'DataGrid',
								isColumnResizing: false,
								ellipsis: true,
								readonly: false,
								loading: '{{data.table[_rowIndex].loading}}',
								className: 'ttk-scm-app-file-mapping-content',
								headerHeight: 37,
								rowHeight: 37,
								rowsCount: '{{data.table[_rowIndex].list.length}}',
								columns: "{{$getColumns(_rowIndex)}}",
								key: '{{data.table[_rowIndex].tableKey}}'
							}
						},
						{
							name: 'footer',
							component: '::div',
							className: 'ttk-scm-app-file-mapping-doc-footer',
							children: {
								name: 'pagination',
								component: 'Pagination',
								showSizeChanger: true,
								pageSizeOptions: ['50', '100', '150', '200'],
								pageSize: '{{data.table[_rowIndex].page.pageSize}}',
								current: '{{data.table[_rowIndex].page.currentPage}}',
								total: '{{data.table[_rowIndex].page.totalCount}}',
								onChange: '{{function(currentPage, pageSize){$pageChanged(currentPage, pageSize,_rowIndex)}}}',
								onShowSizeChange: '{{function(currentPage, pageSize){$pageChanged(currentPage, pageSize,_rowIndex)}}}',
							}
						}
					]
				},
				_power: 'for in data.tabs',
			}
		}
	}
}

export function getInitState() {
	return {
		data: {
			tabs: [
				{
					"id": 0,
					"name": "供应商映射",
					title: 'supplier'
				},
				{
					"id": 1, "name": "客户映射",
					title: 'consumer'
				},
				{
					"id": 2, "name": "存货映射", title: 'inventory'
				},
				{
					"id": 3, "name": "部门映射", title: 'deparment'
				},
				{
					"id": 4, "name": "人员映射", title: 'persion'
				},
				{
					"id": 5, "name": "项目映射", title: 'item'
				}
			],
			other: {
				activeKey: "0",

				softAppName: ""
			},
			table: [
				{

					list: [],
					loading: false,
					filter: {
						simpleCondition: null
					},
					page: {
						current: 1,
						total: 0,
						pageSize: 50
					},
					tableKey: 1000,
					columnDto: [

					],
					tip: '注：科目启用供应商辅助核算的时候，请进行映射；否则不需映射。当供应商对应应付科目有下级科目时，请维护应付科目。'
				},
				{
					list: [],
					loading: false,
					filter: {
						simpleCondition: null
					},
					page: {
						current: 1,
						total: 0,
						pageSize: 50
					},
					tableKey: 1000,
					columnDto: [

					],
					tip: '注：科目启用客户辅助核算的时候，请进行映射；否则不需映射。当客户对应应收科目有下级科目时，请维护应收科目。'
				},
				{
					list: [],
					loading: false,
					filter: {
						simpleCondition: null
					},
					page: {
						current: 1,
						total: 0,
						pageSize: 50
					},
					tableKey: 1000,
					columnDto: [

					],
					tip: '注：科目启用存货辅助核算的时候，请进行映射；否则不需映射。'
				},
				{
					list: [],
					loading: false,
					filter: {
						simpleCondition: null
					},
					page: {
						current: 1,
						total: 0,
						pageSize: 50
					},
					tableKey: 1000,
					columnDto: [


					],
					tip: '注：科目启用部门辅助核算的时候，请进行映射；否则不需映射。'
				},
				{
					list: [],
					loading: false,
					filter: {
						simpleCondition: null
					},
					page: {
						current: 1,
						total: 0,
						pageSize: 50
					},
					tableKey: 1000,
					columnDto: [


					],
					tip: '注：科目启用人员辅助核算的时候，请进行映射；否则不需映射。'
				},
				{
					list: [],
					loading: false,
					filter: {
						simpleCondition: null
					},
					page: {
						current: 1,
						total: 0,
						pageSize: 50
					},
					tableKey: 1000,
					columnDto: [

					],
					tip: '注：科目启用项目辅助核算的时候，请进行映射；否则不需映射。'
				},
			]
		}
	}
}