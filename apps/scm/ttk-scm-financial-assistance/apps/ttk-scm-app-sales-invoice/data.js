import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-sales-invoice',
		children: [
			{
				name: 'header',
				component: '::div',
				className: 'ttk-scm-app-sales-invoice-header',
				children: [{
					name: 'left',
					component: '::div',
					className: 'ttk-scm-app-sales-invoice-header-left',
					children: [{
						name: 'period',
						component: 'DatePicker.MonthPicker',
						dropdownClassName: '{{data.isCurrent ? "" : "financial-assistance"}}',
						// value: '{{$getPeriodValue(data.systemDate)}}',
						value: '{{$stringToMoment(data.filter.period)}}',
						//onChange: "{{function(d){$sf('data.filter.period',$momentToString(d,'YYYY-MM'))}}}",
						onChange: "{{$depreciationChange}}",
						//disabledDate: '{{function(value){return $disabledMonth(value)}}}',
					},{
						name: 'search',
						component: 'Input.Search',
						className: 'mk-input',
						placeholder: "按发票号码／购方名称",
						autocomplete: "off",
						value:'{{data.filter.simpleCondition}}',
						onChange:'{{$changeCondition}}'
					},
					{
						name: 'refreshBtn',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'shuaxin',
						className: 'mk-normalsearch-reload',
						title:'刷新',
						onClick: '{{$refresh}}'
					}]
				},{
					name: 'right',
					component: '::div',
					className: 'ttk-scm-app-sales-invoice-header-right',
					onClick: '{{$downloadText}}',
					children: [{
						name: 'btn',
						component: 'Button',
						className: 'btn',
						size: 'small',
						children: '同步数据',
					}]
				}]
			}, {
				name: 'contentTip',
				component: '::div',
				className: 'ttk-scm-app-sales-invoice-contenttip',
				_visible: '{{data.isNotValue}}',
				children: [{
					name: 'tip',
					component: '::div',
					children: [{
						name: 'img',
						component: '::img',
						className: 'ttk-scm-app-sales-invoice-contenttip-img',
						src: './vendor/img/scm/noContent.png'
					},{
						name: 'word',
						component: '::div',
						className: 'ttk-scm-app-sales-invoice-contenttip-word',
						children: '暂无数据'
					}]
				}]
			}, {
				name: 'content',
				component: 'Layout',
				_visible: '{{!data.isNotValue}}',
				className: 'ttk-scm-app-sales-invoice-content',
				children: [{
					name: 'details',
					component: 'DataGrid',
					loading: '{{data.loading}}',
					className: 'ttk-scm-app-sales-invoice-form-details',
					headerHeight: 37,
					rowHeight: 37,
					ellipsis: true,
					key:'{{data.activekey}}',
					rowsCount: '{{data.list.length}}',
					columns: [
						{
							name: 'xh',
							component: 'DataGrid.Column',
							columnKey: 'xh',
							width: 42,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '序号'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								className: '{{ !Number(data.list[_rowIndex].xh) ? "total" : "" }}',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].xh}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].xh}}',
								_power: '({rowIndex}) => rowIndex',
							}
						}, {
							name: 'ssyf',
							component: 'DataGrid.Column',
							columnKey: 'ssyf',
							width: 80,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '所属月份'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								className: '{{ !Number(data.list[_rowIndex].xh) ? "total" : "" }}',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].ssyf}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].ssyf}}',
								_power: '({rowIndex}) => rowIndex',
							}
						}, {
							name: 'fphm',
							component: 'DataGrid.Column',
							columnKey: 'fphm',
							width: 102,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '发票号码'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								className: '{{ !Number(data.list[_rowIndex].xh) ? "total" : "" }}',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].fphm}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].fphm}}',
								_power: '({rowIndex}) => rowIndex',
							}
						}, {
							name: 'fpdm',
							component: 'DataGrid.Column',
							columnKey: 'fpdm',
							width: 102,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '发票代码'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								className: '{{ !Number(data.list[_rowIndex].xh) ? "total" : "" }}',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].fpdm}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].fpdm}}',
								_power: '({rowIndex}) => rowIndex',
							}
						}, {
							name: 'je',
							component: 'DataGrid.Column',
							columnKey: 'je',
							flexGrow: 1,
							width: 102,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '金额'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								className: '{{ !Number(data.list[_rowIndex].xh) ? "total mk-datagrid-cellContent-right" : "mk-datagrid-cellContent-right" }}',
								value: '{{data.list[_rowIndex] && $addThousandsPosition(data.list[_rowIndex].je)}}',
								title: '{{data.list[_rowIndex] && $addThousandsPosition(data.list[_rowIndex].je)}}',
								_power: '({rowIndex}) => rowIndex',
							}
						}, {
							name: 'se',
							component: 'DataGrid.Column',
							columnKey: 'se',
							flexGrow: 1,
							width: 102,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '税额'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								className: '{{ !Number(data.list[_rowIndex].xh) ? "total mk-datagrid-cellContent-right" : "mk-datagrid-cellContent-right" }}',
								value: '{{data.list[_rowIndex] && $addThousandsPosition(data.list[_rowIndex].se)}}',
								title: '{{data.list[_rowIndex] && $addThousandsPosition(data.list[_rowIndex].se)}}',
								_power: '({rowIndex}) => rowIndex',
							}
						}, {
							name: 'gfnsrsbh',
							component: 'DataGrid.Column',
							columnKey: 'gfnsrsbh',
							flexGrow: 1,
							width: 160,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '购方纳税人识别号'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								className: '{{ !Number(data.list[_rowIndex].xh) ? "total" : "" }}',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].gfnsrsbh}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].gfnsrsbh}}',
								_power: '({rowIndex}) => rowIndex',
							}
						}, {
							name: 'gfmc',
							component: 'DataGrid.Column',
							columnKey: 'gfmc',
							flexGrow: 1,
							width: 200,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '购方名称'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								className: '{{ !Number(data.list[_rowIndex].xh) ? "total mk-datagrid-cellContent-left" : "mk-datagrid-cellContent-left" }}',
								value: '{{data.list[_rowIndex] && ( data.isCurrent ? data.list[_rowIndex].gfmc : $getPopover(data.list[_rowIndex].gfmc) )}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].gfmc}}',
								_power: '({rowIndex}) => rowIndex',
							}
						}, {
							name: 'kprq',
							component: 'DataGrid.Column',
							columnKey: 'kprq',
							flexGrow: 1,
							width: 140,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '开票日期'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								className: '{{ !Number(data.list[_rowIndex].xh) ? "total" : "" }}',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].kprq}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].kprq}}',
								_power: '({rowIndex}) => rowIndex',
							}
						}
					]
				}]
			}, {
				name: 'footer',
				component: '::div',
				className: 'ttk-scm-app-sales-invoice-footer',
				_visible: '{{!data.isNotValue}}',
				children: [{
					name: 'pagination',
					component: 'Pagination',
					showSizeChanger: true,
					pageSizeOptions: ['50', '100', '150', '200'],
					pageSize: '{{data.filter.page.pageSize}}',
					current: '{{data.filter.page.currentPage}}',
					total: '{{data.filter.page.totalCount}}',
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
			activekey: null,
			isNotValue: false,
			filter: {
				simpleCondition: '',
				period: '',
				page: {
					currentPage: 1,
					totalCount: 0,
					pageSize: 50
				},
			},
			loading: false, //grid加载状态
		}
	}
}