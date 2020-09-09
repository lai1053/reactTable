import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-entry-invoice',
		className: '{{data.isCurrent ? "ttk-scm-app-entry-invoice" : "ttk-scm-app-entry-invoice financial"}}',
		children: [
			{
				name: 'header',
				component: '::div',
				className: 'ttk-scm-app-entry-invoice-header',
				children: [{
					name: 'left',
					component: '::div',
					className: 'ttk-scm-app-entry-invoice-header-left',
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
						placeholder: "按发票号码／销方名称",
						autocomplete: "off",
						value:'{{data.filter.simpleCondition}}',
						onChange:'{{$changeCondition}}'
					},{
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
					className: 'ttk-scm-app-entry-invoice-header-right',
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
				className: 'ttk-scm-app-entry-invoice-contenttip',
				_visible: '{{data.tabArr.length ? false : true}}',
				children: [{
					name: 'tip',
					component: '::div',
					children: [{
						name: 'img',
						component: '::img',
						className: 'ttk-scm-app-entry-invoice-contenttip-img',
						src: './vendor/img/scm/noContent.png'
					},{
						name: 'word',
						component: '::div',
						className: 'ttk-scm-app-entry-invoice-contenttip-word',
						children: '暂无数据'
					}]
				}]
			}, {
				name: 'content',
				component: '::div',
				_visible: '{{data.tabArr.length ? true : false}}',
				className: 'ttk-scm-app-entry-invoice-content',
				children: {
					name: 'tabNav',
					component: 'Tabs',
					activeKey: '{{data.filter.activeKey}}',
					onChange:'{{$handletabchange}}',
					children: [{
						name: "option",
						component: 'Tabs.TabPane',
						tab: {
							name: 'tab',
							component: '::div',
							children: '{{ data.tabArr && data.tabArr[_rowIndex].name }}'
						},
						key: "{{ data.tabArr && data.tabArr[_rowIndex].fplxdm }}",
						_power: 'for in data.tabArr',
					}]
				}
			}, {
				name: 'details',
				component: 'DataGrid',
				_visible: '{{data.tabArr.length ? true : false}}',
				loading: '{{data.loading}}',
				className: 'ttk-scm-app-entry-invoice-form-details',
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
							className: '{{ data.list[_rowIndex].xh == "合计" ? "total" : "" }}',
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
							className: '{{ data.list[_rowIndex].xh == "合计" ? "total" : "" }}',
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
							className: '{{ data.list[_rowIndex].xh == "合计" ? "total" : "" }}',
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
							className: '{{ data.list[_rowIndex].xh == "合计" ? "total" : "" }}',
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
							className: '{{ data.list[_rowIndex].xh == "合计" ? "total mk-datagrid-cellContent-right" : "mk-datagrid-cellContent-right" }}',
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
							className: '{{ data.list[_rowIndex].xh == "合计" ? "total mk-datagrid-cellContent-right" : "mk-datagrid-cellContent-right" }}',
							value: '{{data.list[_rowIndex] && $addThousandsPosition(data.list[_rowIndex].se)}}',
							title: '{{data.list[_rowIndex] && $addThousandsPosition(data.list[_rowIndex].se)}}',
							_power: '({rowIndex}) => rowIndex',
						}
					}, {
						name: 'xfnsrsbh',
						component: 'DataGrid.Column',
						columnKey: 'xfnsrsbh',
						flexGrow: 1,
						width: 150,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '销方纳税人识别号'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{ data.list[_rowIndex].xh == "合计" ? "total" : "" }}',
							value: '{{data.list[_rowIndex] && data.list[_rowIndex].xfnsrsbh}}',
							title: '{{data.list[_rowIndex] && data.list[_rowIndex].xfnsrsbh}}',
							_power: '({rowIndex}) => rowIndex',
						}
					}, {
						name: 'xfmc',
						component: 'DataGrid.Column',
						columnKey: 'xfmc',
						flexGrow: 1,
						width: 150,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '销方名称'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{ data.list[_rowIndex].xh == "合计" ? "total mk-datagrid-cellContent-left" : "mk-datagrid-cellContent-left" }}',
							value: '{{data.list[_rowIndex] && ( data.isCurrent ? data.list[_rowIndex].xfmc : $getPopover(data.list[_rowIndex].xfmc) )}}',
							title: '{{data.list[_rowIndex] && data.list[_rowIndex].xfmc}}',
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
							className: '{{ data.list[_rowIndex].xh == "合计" ? "total" : "" }}',
							value: '{{data.list[_rowIndex] && data.list[_rowIndex].kprq}}',
							title: '{{data.list[_rowIndex] && data.list[_rowIndex].kprq}}',
							_power: '({rowIndex}) => rowIndex',
						}
					}, {
						name: 'rzrq',
						component: 'DataGrid.Column',
						columnKey: 'rzrq',
						flexGrow: 1,
						width: 90,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '认证日期'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{ data.list[_rowIndex].xh == "合计" ? "total" : "" }}',
							value: '{{data.list[_rowIndex] && data.list[_rowIndex].rzrq}}',
							title: '{{data.list[_rowIndex] && data.list[_rowIndex].rzrq}}',
							_power: '({rowIndex}) => rowIndex',
						}
					}
				]
			}, {
				name: 'footer',
				component: '::div',
				className: 'ttk-scm-app-entry-invoice-footer',
				_visible: '{{data.tabArr.length ? true : false}}',
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
			activekey: null,
			list: [],
			tabArr: [],
			filter: {
				simpleCondition: '',
				period: '',
				activeKey:"01",
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