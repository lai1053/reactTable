export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'accountrelation',
		children: [{
			name: 'content',
			className: '{{data.other.display ? "accountrelation-content" : "nodisplay"}}',
			component: 'Layout',
			children: [{
				component: 'Layout',
				name: 'content',
				children: [{
					name: 'header',
					component: '::div',
					className: 'accountrelation-content-tool',
					children: [{
						name: 'btnLeft',
						component: '::div',
						className: 'accountrelation-content-tool-left',
						children: [{
							name: 'subjectName',
							component: 'Input.Search',
							showSearch: true,
							placeholder: '请输入编码/名称',
							disabled: '{{data.other.isCanNotToNextStep}}',
							className: 'accountrelation-content-tool-left-search',
							value: '{{data.other.positionCondition}}',
							onChange: '{{function(e){$searchChange(e.target.value)}}}',
							onSearch: `{{$fixPosition}}`,
						}]
					}, {
						name: 'btnRight',
						component: '::div',
						className: 'accountrelation-content-tool-right',
						children: [{
							name: 'matchType',
							component: 'Radio.Group',
							disabled: '{{data.other.isCanNotToNextStep}}',
							className: 'matchType',
							onChange: `{{function(v){$selectMatchType(v.target.value)}}}`,
							value: '{{data.other.matchType}}',
							children: [{
								name: 'all',
								component: 'Radio',
								value: 0,
								children: '全部'
							}, {
								name: 'matched',
								component: 'Radio',
								value: 1,
								children: '已匹配'
							}, {
								name: 'unMatched',
								component: 'Radio',
								value: 2,
								children: '未匹配'
							}, {
								name: 'noNeedMatched',
								component: 'Radio',
								value: 3,
								children: '无需匹配'
							}]
						}, {
							name: 'ignore',
							component: 'Button',
							className: 'accountrelation-content-tool-right-ignore',
							children: '批量确认',
							disabled: '{{data.other.isCanNotToNextStep}}',
							onClick: '{{$batchIgnore}}'
						}, {
							name: 'add',
							component: 'Button',
							className: 'accountrelation-content-tool-right-addSubject',
							children: '新增一级科目',
							disabled: '{{data.other.isCanNotToNextStep}}',
							onClick: '{{$addPrimarySubject}}'
						}, {
							component: 'Button',
							children: '下一步',
							type: 'primary',
							className: '{{data.sjb && data.sjb.joinsource ? "accountrelation-content-tool-right-importbtn" : "nodisplay"}}',
							disabled: '{{data.other.isCanNotToNextStep}}',
							onClick: '{{$nextStep}}'
						}]
					}]
				},
				{
					name: 'sjbGrid',//税检宝
					component: '::div',
					className: "accountrelation-sjbgrid",
					_visible: `{{data.sjb && data.sjb.joinsource?true:false}}`,
					children: sjbGridColumns
				}, {
					name: 'gjGrid',//管家
					component: '::div',
					className: "accountrelation-grid",
					_visible: `{{!data.sjb?true:false}}`,
					children: gjGridColumns
				}]
			}]
		}, {
			name: 'footer',
			className: 'accountrelation-footer',
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
		}, {
			name: 'foot', //财务期初 上一步 下一步
			component: '::div',
			className: '{{data.sjb && data.sjb.joinsource ? "nodisplay" : "accountrelation-bottombtn"}}',
			children: [{
				component: 'Button',
				children: '上一步',
				className: 'accountrelation-bottombtn-btn',
				disabled: '{{data.other.isCanNotToNextStep}}',
				onClick: '{{$preStep}}'
			}, {
				component: 'Button',
				children: '下一步',
				type: '{{data.other.isCanNotToNextStep ?"":"primary"}}',
				className: 'accountrelation-bottombtn-btn',
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
			tableOption: {
				x: 900,
				y: null
			},
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
				colvisible: true,
				screenCurWidth: 500
			}
		}
	}
}

export const gjGridColumns = {
	name: 'details',
	component: 'DataGrid',
	headerHeight: 35,
	rowHeight: 35,
	groupHeaderHeight: 35,
	rememberScrollTop: true,
	className: 'accountrelation-grid',
	scrollToRow: '{{data.other.detailsScrollToRow}}',
	searchFlag: false,
	ellipsis: true,
	// isColumnResizing: true,
	// onColumnResizeEnd: '{{$onColumnResizeEnd}}',
	loading: '{{data.other.loading}}',
	rowsCount: "{{data.list && data.list.length<10 ? 18 : data.list.length}}",
	columns: [{
		name: 'sourceAccount',
		component: 'DataGrid.ColumnGroup',
		header: '原科目',
		isColumnGroup: true,
		children: [{
			name: 'sourceCode',
			component: 'DataGrid.Column',
			columnKey: 'sourceCode',
			width: '{{!data.other.colvisible?100:120}}',
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "科目编码"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?" leftalign currentScrollRow":" leftalign"}}',
				value: '{{data.list[_rowIndex] && data.list[_rowIndex].sourceCode}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		}, {
			name: 'sourceName',
			component: 'DataGrid.Column',
			columnKey: 'sourceName',
			width: 150,
			flexGrow: 1,
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "科目名称"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.Cell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?" leftalign currentScrollRow":" leftalign"}}',
				children: '{{$renderNameAndAux(data.list[_rowIndex])}}',
				_power: '({rowIndex}) => rowIndex',
			}
		}, {
			name: 'sourceBalance',
			component: 'DataGrid.Column',
			columnKey: 'sourceBalance',
			width: 40,
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "方向"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?"currentScrollRow":""}}',
				value: '{{data.list[_rowIndex] && data.list[_rowIndex].sourceBalance}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		}, {
			name: 'sourceCurrency',
			component: 'DataGrid.Column',
			columnKey: 'sourceCurrency',
			width: 80,
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "外币"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?" leftalign currentScrollRow":" leftalign"}}',
				value: '{{data.list[_rowIndex] && data.list[_rowIndex].sourceCurrency}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		}, {
			name: 'sourceUnit',
			component: 'DataGrid.Column',
			columnKey: 'sourceUnit',
			width: 80,
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "数量单位"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?" leftalign currentScrollRow":" leftalign"}}',
				value: '{{data.list[_rowIndex] && data.list[_rowIndex].sourceUnit}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		}, {
			name: 'sourceStatus',
			component: 'DataGrid.Column',
			columnKey: 'sourceStatus',
			width: 40,
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "停用"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?" currentScrollRow":""}}',
				value: '{{data.list[_rowIndex]?$isEnableTitle("sourceStatus",data.list[_rowIndex]):""}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		}]
	}, {
		name: 'targetAccount',
		component: 'DataGrid.ColumnGroup',
		header: '新科目',
		isColumnGroup: true,
		children: [{
			name: 'code',
			component: 'DataGrid.Column',
			columnKey: 'code',
			width: '{{!data.other.colvisible?100:120}}',
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "科目编码"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?" leftalign currentScrollRow":" leftalign"}}',
				value: '{{data.list[_rowIndex]&&data.list[_rowIndex].accountDto && data.list[_rowIndex].accountDto.code}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		}, {
			name: 'name',
			component: 'DataGrid.Column',
			columnKey: 'name',
			width: 150,
			flexGrow: 1,
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "科目名称"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?" leftalign currentScrollRow":" leftalign"}}',
				value: '{{data.list[_rowIndex]&&data.list[_rowIndex].accountDto && data.list[_rowIndex].accountDto.name}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		}, {
			name: 'balanceDirectionName',
			component: 'DataGrid.Column',
			columnKey: 'balanceDirectionName',
			width: 40,
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "方向"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?"currentScrollRow":""}}',
				value: '{{data.list[_rowIndex]&&data.list[_rowIndex].accountDto && data.list[_rowIndex].accountDto.balanceDirectionName}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		},
		{
			name: 'currencyName',
			component: 'DataGrid.Column',
			columnKey: 'currencyName',
			width: 80,
			_visible: '{{data.other.colvisible}}',
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "默认外币"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?" leftalign currentScrollRow":" leftalign"}}',
				value: '{{data.list[_rowIndex]&&data.list[_rowIndex].accountDto && data.list[_rowIndex].accountDto.currencyName}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		}, {
			name: 'unitName',
			component: 'DataGrid.Column',
			columnKey: 'unitName',
			width: 90,
			_visible: '{{data.other.colvisible}}',
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "默认数量单位"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?" leftalign currentScrollRow":" leftalign"}}',
				value: '{{data.list[_rowIndex]&&data.list[_rowIndex].accountDto && data.list[_rowIndex].accountDto.unitName}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		}, {
			name: 'isEnable',
			component: 'DataGrid.Column',
			columnKey: 'isEnable',
			width: 40,
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "停用"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.TextCell',
				className: '{{_rowIndex==data.other.detailsScrollToRow?" currentScrollRow":""}}',
				value: '{{data.list[_rowIndex]?$isEnableTitle("isEnable",data.list[_rowIndex]):""}}',
				enableTooltip: true,
				_power: '({rowIndex}) => rowIndex',
			}
		}]
	}, {
		name: 'moreAction',
		component: 'DataGrid.ColumnGroup',
		header: '科目确认',
		isColumnGroup: true,
		fixedRight: true,
		children: [{
			name: 'msg',
			component: 'DataGrid.Column',
			columnKey: 'msg',
			width: 178,
			flexGrow: 1,
			fixedRight: true,
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "异常提示"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.Cell',
				className: '{{$getCellClassName(_ctrlPath)}}',
				_power: '({rowIndex})=>rowIndex',
				children: '{{$renderMsgColumns(data.list[_rowIndex],_rowIndex)}}',
			}
		}, {
			name: 'operation',
			component: 'DataGrid.Column',
			columnKey: 'operation',
			width: 114,
			fixedRight: true,
			header: {
				name: 'header',
				component: 'DataGrid.Cell',
				children: "操作"
			},
			cell: {
				name: 'cell',
				component: 'DataGrid.Cell',
				_power: '({rowIndex})=>rowIndex',
				className: '{{$getCellClassName(_ctrlPath)+" leftalign"}}',
				children: '{{$renderOperate(data.list[_rowIndex],_rowIndex)}}',
			}
		}]
	}]
}

export const sjbGridColumns = {
	name: 'content',
	component: 'Table',
	pagination: false,
	allowColResize: false,
	enableSequenceColumn: false,
	onRow: '{{function(record, index){return $getRow(record, index)}}}',
	// scroll: { y: true, x: 600 },	
	scroll: '{{data.list.length> 0 ? data.tableOption:{}}}',
	emptyShowScroll: true,
	bordered: true,
	loading: '{{data.other.loading}}',
	dataSource: '{{data.list}}',
	noDelCheckbox: true,
	columns: [{
		title: '原科目',
		key: 'sourceAccount',
		dataIndex: 'sourceAccount',
		children: [{
			width: 100,
			title: "科目编码",
			key: 'sourceCode',
			dataIndex: 'sourceCode'
		}, {
			width: 170,
			title: '科目名称',
			key: 'sourceName',
			dataIndex: 'sourceName',
			render: "{{function(_rowIndex, v, index){return $renderColumns('sourceName', v, _ctrlPath, index)}}}"
		}, {
			width: 40,
			title: "方向",
			key: 'sourceBalance',
			dataIndex: 'sourceBalance',
			align: 'center'
		}]
	}, {
		title: '新科目',
		key: 'targetAccount',
		dataIndex: 'targetAccount',
		children: [{
			width: 100,
			title: '科目编码',
			key: 'code',
			dataIndex: 'code',
			render: "{{function(_rowIndex, v, index){return $renderColumns('code', v, _ctrlPath, index)}}}"
		}, {
			width: 170,
			title: '科目名称',
			key: 'name',
			dataIndex: 'name',
			render: "{{function(_rowIndex, v, index){return $renderColumns('name', v, _ctrlPath, index)}}}"
		}, {
			width: 40,
			title: "方向",
			key: 'balanceDirectionName',
			dataIndex: 'balanceDirectionName',
			align: 'center',
			render: "{{function(_rowIndex, v, index){return $renderColumns('balanceDirectionName', v, _ctrlPath, index)}}}"
		}]
	}, {
		width: 178,
		title: '异常提示',
		key: 'msg',
		// fixed: "right",
		align: 'center',
		// className: 'table_fixed_width',
		render: "{{function(record, v, index){return $renderMsgColumns(record, index)}}}"
	}, {
		width: 114,
		title: '操作',
		key: 'operation',
		// fixed: "right",
		align: 'center',
		// className: 'table_fixed_width',
		render: "{{function(record, v, index){return $renderOperate(record, index)}}}"
	}]
}



