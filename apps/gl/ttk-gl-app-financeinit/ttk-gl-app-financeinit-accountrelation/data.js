export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-gl-app-financeinit-accountrelation',
		children: [{
			name: 'content',
			className: 'ttk-gl-app-financeinit-accountrelation-content',
			component: 'Layout',
			children: [{
				component: 'Layout',
				name: 'content',
				children: [{
					name: 'header',
					component: '::div',
					className: 'ttk-gl-app-financeinit-accountrelation-content-btn',
					children: [
						{
							name:'left',
							component: '::div',
							className: 'ttk-gl-app-financeinit-accountrelation-content-btn-left',
							children: [
								{
									name: 'subjectName',
									component: 'Input.Search',
									showSearch: true,
									placeholder: '请输入编码/名称',
									className:'ttk-gl-app-financeinit-accountrelation-content-btn-left-search',
									// onSearch:'{{$load}}',
									value:'{{data.other.positionCondition}}',
									onChange: '{{function(e){$searchChange(e.target.value)}}}',
									onSearch: `{{$fixPosition}}`,
								},
									{
										name: 'text',
										component: '::span',
										className: 'matchType',
										children: '匹配类型'
									},
									{
									name: 'select',
									component: 'Select',
									onSelect: '{{$selectMatchType}}',
									defaultValue: 'all',
									children: [
										{
											name: 'all',
											component: 'Select.Option',
											key: 'all',
											value: 'all',
											children: '全部'
									},
									{
											name: 'matched',
											component: 'Select.Option',
											key: 'matched',
											value: 'matched',
											children: '已匹配'
									},
									{
										name: 'unMatched',
										component: 'Select.Option',
										key: 'unMatched',
										value: 'unMatched',
										children: '未匹配'
								}
									]
								},
							]
						},
						{
							name:'right',
							component:'::div',
							className: 'ttk-gl-app-financeinit-accountrelation-content-btn-right',
							children: [
								{
									name: 'batchIgnore',
									component: 'Popover',
									content: '{{$getPopover()}}',
									placement: "leftBottom",
									trigger: 'click',
									visible: '{{data.other.batchPopShow}}',
									overlayClassName: 'batchIgnore-popover',
									children: {
										name: 'ignore',
										component: 'Button',
										className: 'ttk-gl-app-financeinit-accountrelation-content-btn-right-ignore',
										children: '批量确认',
										style: {marginRight: '8px'},
										onClick: '{{$batchIgnore}}'
									}
								},
								{
								name: 'add',
								component: 'Button',
								className: 'ttk-gl-app-financeinit-accountrelation-content-btn-right-addSubject',
								children: '新增一级科目',
								onClick: '{{$addPrimarySubject}}'
							}
							]
						}
						]
				}, {
					name: 'dataGrid',
					component: 'DataGrid',
					headerHeight: 75,
					rememberScrollTop: true,
					// className: '{{_rowIndex == data.other.detailsScrollToRow?"ttk-gl-app-financeinit-accountrelation-grid currentScrollRow":"ttk-gl-app-financeinit-accountrelation-grid"}}',
					className: 'ttk-gl-app-financeinit-accountrelation-grid',
					rowHeight: 36,
					isColumnResizing: true,
					searchFlag: '{{data.other.searchFlag}}',
					loading: '{{data.other.loading}}',
					scrollToRow: '{{data.other.detailsScrollToRow}}',
					ellipsis: true,
					key: '{{Math.random()}}',
					rowsCount: "{{data.list && data.list.length<10 ? 15 : data.list.length}}",
					columns: '{{$tableColumns(data.list)}}'
				}]
			}]
		}, {
			name: 'footborder', //财务期初 上一步 下一步
			component: '::div',
			className: 'ttk-gl-app-financeinit-accountrelation-footerborder',
			children: [{
				component: '::div',
				className: 'ttk-gl-app-financeinit-accountrelation-footerborder-left',
			}, {
				component: '::div',
				className: 'ttk-gl-app-financeinit-accountrelation-footerborder-right',
			}]
		}, {
			name: 'foot', //财务期初 上一步 下一步
			component: '::div',
			className: 'ttk-gl-app-financeinit-accountrelation-footer',
			children: [{
				component: 'Button',
				children: '上一步',
				className: 'ttk-gl-app-financeinit-accountrelation-footer-btn preStepBtn',
				onClick: '{{$preStep}}'
			}, {
				component: 'Button',
				children: '下一步',
				type: '{{data.other.isCanNotToNextStep ?"":"primary"}}',
				className: 'ttk-gl-app-financeinit-accountrelation-footer-btn nextStepBtn',
				disabled: '{{data.other.isCanNotToNextStep}}',
				onClick: '{{$nextStep}}'
			}]
		}]
	}
}
export function getInitState() {
	return {
		data: {
			list: [],
			accountList: [],
			other: {
				calcDict: {},
				batchPopShow: false,
				isCanNotToNextStep: true,
				loading: false, //grid加载状态
				screenCurWidth: 500,
				matchIndex: -1,
				matchBacktoZero: true
			}
		}
	}
}
