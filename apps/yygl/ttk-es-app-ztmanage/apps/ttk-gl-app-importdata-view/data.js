export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-gl-app-importdata-accountrelation',
		children: [{
			name: 'content',
			className: '{{data.other.display ? "ttk-gl-app-importdata-accountrelation-content" : "nodisplay"}}',
			component: 'Layout',
			children: [{
				component: 'Layout',
				name: 'content',
				children: [{
					name: 'header',
					component: '::div',
					className: 'ttk-gl-app-importdata-accountrelation-content-btn',
					children: [{
						name: 'btnLeft',
						component: '::div',
						className: 'ttk-gl-app-importdata-accountrelation-content-btn-left',
						children: [
							{
								name: 'subjectName',
								component: 'Input.Search',
								showSearch: true,
								placeholder: '请输入编码/名称',
								disabled: '{{data.other.isCanNotToNextStep}}',	
								className: 'ttk-gl-app-importdata-accountrelation-content-btn-left-search',
								value: '{{data.other.positionCondition}}',
								onChange: '{{function(e){$searchChange(e.target.value)}}}',
								onSearch: `{{$fixPosition}}`,
							},
							{
								name: 'text',
								component: '::span',
								className: 'matchType',
								children: '匹配类型'
							}, {
								name: 'select',
								component: 'Select',
								onSelect: '{{$selectMatchType}}',
								disabled: '{{data.other.isCanNotToNextStep}}',	
								showSearch: false,
								defaultValue: 0,
								children: [{
									name: 'all',
									component: 'Select.Option',
									// key: '0',
									value: 0,
									children: '全部'
								}, {
									name: 'matched',
									component: 'Select.Option',
									// key: '1',
									value: 1,
									children: '已匹配'
								}, {
									name: 'unMatched',
									component: 'Select.Option',
									// key: 'unMatched',
									value: 2,
									children: '未匹配'
								}, {
									name: 'noNeedMatched',
									component: 'Select.Option',
									// key: 'noNeedMatched',
									value: 3,
									children: '无需匹配'
								}
								]
							}]
					}
					// {
					// 	name: 'btnRight',
					// 	component: '::div',
					// 	className: 'ttk-gl-app-importdata-accountrelation-content-btn-right',
					// 	children: [{
					// 		name: 'ignore',
					// 		component: 'Button',
					// 		className: 'ttk-gl-app-importdata-accountrelation-content-btn-right-ignore',
					// 		children: '批量确认',
					// 		disabled: '{{data.other.isCanNotToNextStep}}',
					// 		onClick: '{{$batchIgnore}}'
					// 	}, 
						// {
						// 	name: 'add',
						// 	component: 'Button',
						// 	className: 'ttk-gl-app-importdata-accountrelation-content-btn-right-addSubject',
						// 	children: '新增一级科目',
						// 	disabled: '{{data.other.isCanNotToNextStep}}',
						// 	onClick: '{{$addPrimarySubject}}'
						// }, {
						// 	component: 'Button',
						// 	children: '下一步',
						// 	type: 'primary',
						// 	className: '{{data.sjb && data.sjb.joinsource ? "ttk-gl-app-importdata-accountrelation-content-btn-right-importbtn" : "nodisplay"}}',
						// 	disabled: '{{data.other.isCanNotToNextStep}}',
						// 	onClick: '{{$nextStep}}'
						// }
					// ]
					// }
				]
				}, {
					name: 'dataGrid',
					component: 'DataGrid',
					headerHeight: 75,
					rememberScrollTop: true,
					className: '{{data.sjb && data.sjb.joinsource ? "ttk-gl-app-importdata-accountrelation-sjbgrid" : "ttk-gl-app-importdata-accountrelation-grid"}}',
					rowHeight: 36,
					scrollToRow: '{{data.other.detailsScrollToRow}}',
					searchFlag: '{{data.other.searchFlag}}',
					isColumnResizing: true,
					loading: '{{data.other.loading}}',
					ellipsis: true,
					rowsCount: "{{data.list && data.list.length<10 ? 18 : data.list.length}}",
					columns: '{{$tableColumns(data.list)}}'
				}]
			}]
		}, 
		{
			name: 'footer',
			className: 'ttk-gl-app-importdata-accountrelation-footer',
			component: '::div',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				pageSizeOptions: ['300', '500', '1000', '2000'],
				pageSize: '{{data.pagination.pageSize}}',
				current: '{{data.pagination.currentPage}}',
				total: '{{data.pagination.totalCount}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$pageChanged}}'
			}]
		}
	]
	}
}
export function getInitState() {
	return {
		data: {
			list: [],
			accountList: [],
			pagination: {
				currentPage: 1,
				totalCount: 0,
				pageSize: 300,
				totalPage: 0
			},
			other: {
				matchType: 0,
				isNoDispose: true,
				display: true,
				calcDict: {},
				isCanNotToNextStep: true,				
				loading: false, //grid加载状态
				screenCurWidth: 500
			}
		}
	}
}