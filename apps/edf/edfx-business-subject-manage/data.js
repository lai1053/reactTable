
export function getMeta() {
		return {
			name: 'root',
			component: 'Layout',
			className: 'edfx-business-subject-manage',
			children: [{
				name: 'left',
				className: 'edfx-business-subject-manage-left',
				component: 'Card',
				title: '科目设置管理',
				children:{
					name:'tree',
					component: 'Tree',
					className: 'edfx-deptPers-tree',
					onSelect: '{{$selectType}}',  
					onExpand: '{{$onExpand}}',
					expandedKeys: '{{data.other.expandedKeys}}',
					selectedKeys: '{{data.other.treeSelectedKey}}',
					children: '{{$renderTreeNodes(data.other.resTreeList)}}'
				}
			}, {
				name:'right',
				className: 'edfx-business-subject-manage-right',
				component: '::div',
				children: [
					{
						name: 'top',
						component: 'Form',
						className: 'edfx-business-subject-manage-top',
						children: [{
							name: 'renderSelect',
							component: '::div',
							className: 'topSelect',
							children: '{{$renderSelect()}}',
						},{
							name: 'searchConds',
							component: 'Input.Search',
							showSearch: true,
							_visible: '{{data.other.isBatch}}',
							className: 'search-conds',
							placeholder: '请输入存货名称',
							value: '{{data.other.conds}}',
							onChange: `{{function(v){$searchInventory(v.target.value)}}}`,
						},{
							name: 'refreshBtn',
							component: 'Button',
							className: 'refresh',
							title: '刷新',
							children: {
								name: 'userIcon',
								className: 'refresh-btn',
								component: 'Icon',
								fontFamily: 'edficon',
								type: 'shuaxin',
							},
							onClick: '{{$refreshBtn}}'
						},{
							name: 'batchUpdate1',
							component: 'Button',
							children: '自动生成存货科目',
							_visible: '{{data.flag && data.other.isBatch}}',
							className: 'batch-update1',
							onClick: '{{function(){$BatchGenerateRevenueAccount()}}}'
						},{
							name: 'batchUpdate',
							component: 'Button',
							children: '批量修改',
							_visible: '{{data.other.isBatch}}',
							className: 'batch-update',
							onClick: '{{function(){$openCard("isBatch")}}}'
						},{
							name: 'addSub',
							component: 'Button',
							children: '新增',
							_visible: '{{$addIsVisible()}}',
							className: 'batch-update',
							onClick: '{{function(){$addSub()}}}'
						}]
					},{
						name: 'content',
						className: 'edfx-business-subject-manage-content',
						component: 'Layout',
						onScroll: '{{$scrollTable}}',
						_visible: '{{!data.other.isBatch}}',
						children: [{
							name: 'manageContent',
							component: 'Table',
							pagination: false,
							className: 'edfx-business-subject-manage-table',
							allowColResize: false,
							enableSequenceColumn: false,
							loading: '{{data.loading}}',
							bordered: true,
							scroll: '{{data.other.tableList.length > 0 ? data.tableOption : {} }}',
							dataSource: '{{data.other.tableList}}',
							noDelCheckbox: true,
							columns: '{{$tableColumns()}}'
						}]
					},{
						name: 'content',
						className: 'edfx-business-subject-manage-content',
						component: 'Layout',
						onScroll: '{{$scrollTable}}',
						_visible: '{{data.other.isBatch}}',
						children: [{
							name: 'manageContent',
							component: 'Table',
							pagination: false,
							className: 'edfx-business-subject-manage-table',
							allowColResize: false,
							enableSequenceColumn: false,
							loading: '{{data.loading}}',
							bordered: true,
							scroll: '{{data.other.tableList.length > 0 ? data.tableOption : {} }}',
							dataSource: '{{data.other.tableList}}',
							checkboxKey: 'key',
							checkboxChange: '{{$checkboxChange}}',
							checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
							Checkbox: false,
							columns: '{{$tableColumns()}}'
						}]
					},{
						name: 'footer',
						className: 'edfx-business-subject-manage-footer',
						component: 'Layout',
						// _visible: '{{!data.other.isBatch}}',   
						children: [{
							name: 'pagination',
							component: 'Pagination',
							showSizeChanger: true,
							pageSize: '{{data.page.pageSize}}',
							current: '{{data.page.current}}',
							total: '{{data.page.total}}',
							onChange: '{{$pageChanged}}',
							onShowSizeChange: '{{$pageChanged}}'
						}]
					}
				]
			}]
		}
}

export function getInitState() {
	return {
		data: {
			flag: false,
			tableKey: 1000,
			loading: true,
			tableOption: {
                x: 900,
                y: null
			},
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			
			other: {
				tree: [],
				tableList: [],
				treeSelectedKey: [],
				expandedKeys: [],
				conds: '',
				isBatch: false
			},
			filter: {
				page: {pageSize: 50, currentPage: 1}
			},
			page: {
				current: 1,
				total: 1,
				pageSize: 50,
			},
		}
	}
}