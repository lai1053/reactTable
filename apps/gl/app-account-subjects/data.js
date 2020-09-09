import React from 'react'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-account-subjects',
		children: [
			{
				name:'search',
				component: '::div',
				style: {background:'#fff', border: '1px solid #d3d3d3',borderBottom:'none'},
				children: {
					name: 'subjectName',
					component: 'Input.Search',
					showSearch: true,
					placeholder: '请输入编码/名称',
					style:{marginTop:'10px'},
					ref:'search',
					className:'app-account-subjects-search',
					// value:'{{data.other.positionCondition}}',
					onChange: '{{function(e){$searchChange(e.target.value)}}}',
					onSearch: `{{$fixPosition}}`
				},
			},
			{
				name:'header',
				component: '::div',
				className: 'app-account-subjects-header',
				style: {display: 'flex',background:'#fff', border: '1px solid #d3d3d3',borderTop:'none',borderBottom:'none'},
				children: [
					{
						name: 'tabs',
						component: 'Tabs',
						className: '{{ data.other.isShowBtn ? "app-account-subjects-tabs" : "app-account-subjects-tabs cborder"}}',
						activeKey: '{{data.filter.targetList}}',
						onChange: '{{$tabChange}}',
						children: [{
							name: 'all',
							component: 'Tabs.TabPane',
							key: 'all',
							tab: '全部'
						}, {
							name: 'assets',
							component: 'Tabs.TabPane',
							key: '5000010001',
							tab: '资产'
						}, {
							name: 'liabilities',
							component: 'Tabs.TabPane',
							key: '5000010002',
							tab: '负债'
						}, {
							name: 'common',
							component: 'Tabs.TabPane',
							key: '5000010003',
							_visible: "{{$isTabDisplay('common')}}",
							tab: '共同'
						}, {
							name: 'rightsInterests',
							component: 'Tabs.TabPane',
							key: '5000010004',
							_visible: "{{$isTabDisplay('rightsInterests')}}",
							tab: '权益'
						}, {
							name: 'cost',
							component: 'Tabs.TabPane',
							key: '5000010005',
							_visible: "{{$isTabDisplay('cost')}}",
							tab: '成本'
						}, {
							name: 'profitLoss',
							component: 'Tabs.TabPane',
							key: '5000010006',
							_visible: "{{$isTabDisplay('profitLoss')}}",
							tab: '损益'
						}, {
							name: 'netAssets',
							component: 'Tabs.TabPane',
							key: '5000010007',
							_visible: "{{$isTabDisplay('netAssets')}}",
							tab: '净资产'
						}, {
							name: 'income',
							component: 'Tabs.TabPane',
							key: '5000010008',
							_visible: "{{$isTabDisplay('income')}}",
							tab: '收入'
						}, {
							name: 'expenses',
							component: 'Tabs.TabPane',
							key: '5000010009',
							_visible: "{{$isTabDisplay('expenses')}}",
							tab: '费用'
						}]
					},
					{
						name:'right',
						component: '::div',
						style: {position: 'absolute',right:0,top:'40px'},
						className:'app-account-subjects-header-container',
						children: [
							{
								name: 'add',
								component: 'Button',
								children: '新增一级科目',
								className: 'app-account-subjects-header-btn',
								onClick: '{{$addPrimarySubject}}'
					},
					{
						name: 'setting',
						component: 'Button',
						className: 'app-account-subjects-header-btn1',
						children: '删除',
						onClick: '{{$delBatchSubjects}}'
					},
					{
						name: 'header-right',
						component: '::div',
						className: 'app-account-subjects-header-right',
						onClick: '{{$setSubjectCode}}',
						children: [
							{
							name: 'set',
							component: 'Icon',
							className: 'app-account-subjects-header-right-icon',
							showStyle: 'softly',
							fontFamily: 'edficon',
							type: 'shezhi',
							style: {
								fontSize: 28
							},
							title: '设置',
						}, {
							name: 'set',
							component: '::span',
							className: 'app-account-subjects-header-right-text',
							children: '编码设置'
						}]
					},
						]
					}
				]
			},
			 {
			name: 'content',
			className: '{{ data.other.isShowBtn ? "app-account-subjects-content" : "app-account-subjects-content cborder"}}',
			component: 'Layout',
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				headerHeight: 37,
				rowHeight: 37,
				rememberScrollTop: true,
				isColumnResizing: true,
				searchFlag: '{{data.other.searchFlag}}',
				loading: '{{data.other.loading}}',
				ellipsis: true,
				className: 'app-account-subjects-content-grid',
				scrollToRow: '{{data.other.detailsScrollToRow}}',
				rowsCount: "{{data.list ? data.list.length : 0}}",
				key: '{{Math.random()}}',
				isCheckBoxCol: true,
				columns: [
					{
						name: 'select',
						component: 'DataGrid.Column',
						columnKey: 'operation',
						width: 34,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: [{
								name: 'chexkbox',
								component: 'Checkbox',
								checked: '{{$isSelectAll("dataGrid")}}',
								onChange: '{{$selectAll("dataGrid")}}'
							}]
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							_power: '({rowIndex})=>rowIndex',
							children: [{
								name: 'select',
								disabled: '{{!(!(data.list[_rowIndex].isSystem && !data.list[_rowIndex].isAllowDel) && data.list[_rowIndex].isEndNode && data.list[_rowIndex].isEnable)}}',
								// disabled: '{{data.list[_rowIndex].isEndNode && data.list[_rowIndex].grade != 1?false:"disabled"}}',
								component: 'Checkbox',
								checked: '{{data.list[_rowIndex].selected}}',
								onChange: '{{$selectRow(_rowIndex)}}'
							}]
						}
					},
					{
					name: 'code',
					component: 'DataGrid.Column',
					columnKey: 'code',
					flexGrow: 1,
					// isResizable: true,
					width: 130,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '编码'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						className: '{{$getClassName(_rowIndex, data.list[_rowIndex])}}',
						_power: '({rowIndex})=>rowIndex',
						children: {
							name: 'link',
							className: 'app-account-subjects-cell-left-code',
							component: '::a',
							tip: true,
							children: '{{data.list[_rowIndex].code}}',
							onClick: '{{$editSubject(data.list[_rowIndex])}}'
						},
					},
				}, {
					name: 'name',
					component: 'DataGrid.Column',
					columnKey: 'name',
					width: 250,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '名称'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						className: '{{_rowIndex == data.other.detailsScrollToRow?"app-account-subjects-cell-left currentScrollRow":"app-account-subjects-cell-left"}}',
						_power: '({rowIndex})=>rowIndex',
						style: {
							paddingLeft: '{{(data.list[_rowIndex].grade - 1) * 12 + 8}}',
						},
						children: "{{data.list[_rowIndex].name && data.list[_rowIndex].name }}",
						tip: true

					}
				}, {
					name: 'balanceDirectionName',
					component: 'DataGrid.Column',
					columnKey: 'balanceDirectionName',
					flexGrow: 1,
					width: 50,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '方向',
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						className: '{{_rowIndex == data.other.detailsScrollToRow?"app-account-subjects-cell-left currentScrollRow":"app-account-subjects-cell-left"}}',
						_power: '({rowIndex})=>rowIndex',
						children: '{{data.list[_rowIndex].balanceDirectionName}}',
					},
				}, {
					name: 'isAuxAccProject',
					component: 'DataGrid.Column',
					columnKey: 'isAuxAccProject',
					flexGrow: 1,
					width: 230,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '辅助核算'
					},
					cell: {
						name: 'cell',
						className: '{{_rowIndex == data.other.detailsScrollToRow?"app-account-subjects-cell-left currentScrollRow":"app-account-subjects-cell-left"}}',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						children: '{{data.list[_rowIndex].AuxAccCalcInfo}}',
						tip: true,
					},
				}, {
					name: 'currencyName',
					component: 'DataGrid.Column',
					columnKey: 'currencyName',
					flexGrow: 1,
					width: 90,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '外币'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						className: '{{_rowIndex == data.other.detailsScrollToRow?"app-account-subjects-cell-left currentScrollRow":"app-account-subjects-cell-left"}}',
						_power: '({rowIndex})=>rowIndex',
						children: '{{data.list[_rowIndex].currencyName}}',
						tip: true,
					},
				}, {
					name: 'unitName',
					component: 'DataGrid.Column',
					columnKey: 'unitName',
					flexGrow: 1,
					width: 70,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '数量'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						className: '{{_rowIndex == data.other.detailsScrollToRow?"app-account-subjects-cell-left currentScrollRow":"app-account-subjects-cell-left"}}',
						_power: '({rowIndex})=>rowIndex',
						children: '{{data.list[_rowIndex].unitName}}',
						tip: true,
					},
				}, {
					name: 'status',
					component: 'DataGrid.Column',
					columnKey: 'statue',
					flexGrow: 1,
					width: 50,
					align:'center',
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '停用'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						className: '{{_rowIndex == data.other.detailsScrollToRow?"app-account-subjects-cell-left currentScrollRow":"app-account-subjects-cell-left"}}',
						_power: '({rowIndex})=>rowIndex',
						children: `{{data.list[_rowIndex].isEnable ? '否': '是'}}`,
					},
				}, {
					name: 'oprate',
					component: 'DataGrid.Column',
					className: 'app-account-subjects-cell-oprate',
					columnKey: 'oprate',
					fixedRight: true,
					width: 104,
					style: { textOverflow: 'initial' },
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '操作'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						className: "{{_rowIndex == 4 ? 'app-account-subjects-cell-oprate-optrange':'app-account-subjects-cell-oprate'}}",
						_power: '({rowIndex})=>rowIndex',
						children: [{
							name: 'add',
							component: 'Icon',
							showStyle: 'softly',
							fontFamily: 'edficon',
							type: 'xinzengkemu',
							className: 'add',
							disabled: '{{$disabledState(data.list[_rowIndex])}}',
							style: {
								fontSize: 23
							},
							title: '新增',
							onClick: '{{$addSubject(data.list[_rowIndex],_rowIndex)}}'
						},
						{
							name: 'batch',
							component: 'Icon',
							showStyle: 'softly',
							fontFamily: 'edficon',
							type: 'piliangzengjia',
							disabled: '{{$disabledState(data.list[_rowIndex])}}',
							style: {
								fontSize: 24
							},
							title: '批量新增',
							onClick: '{{$batchAddSubject(data.list[_rowIndex])}}'
						},
						{
							name: 'edit',
							component: 'Icon',
							showStyle: 'softly',
							fontFamily: 'edficon',
							type: 'bianji',
							style: {
								fontSize: 23
							},
							title: '编辑',
							onClick: '{{$editSubject(data.list[_rowIndex])}}'
						}, {
							name: 'del',
							component: 'Icon',
							showStyle: 'showy',
							fontFamily: 'edficon',
							type: 'shanchu',
							disabled: '{{!(!(data.list[_rowIndex].isSystem && !data.list[_rowIndex].isAllowDel) && data.list[_rowIndex].isEndNode && data.list[_rowIndex].isEnable)}}',
							style: {
								fontSize: 23
							},
							title: '删除',
							onClick: '{{function(){$deleteSubject(data.list[_rowIndex])}}}'
						}]
					}
				}]
			}]
		}, {
			name: 'foot', //财务初始化 上一步 下一步
			component: '::div',
			className: '{{ data.other.isShowBtn ? "app-account-subjects-footer" : "footervisible"}}',
			children: [{
				component: 'Button',
				children: '上一步',
				className: 'app-account-subjects-footer-btn',
				onClick: '{{$preStep}}'
			}, {
				component: 'Button',
				children: '下一步',
				type: 'primary',
				className: 'app-account-subjects-footer-btn',
				onClick: '{{$nextStep}}'
			}]
		}, {
			name: 'stepTips',
			component: '::div',
			_visible: false, 
			run: "{{data.other.stepEnabled}}",
			locale: { back: '上一步', close: '关 闭', last: '完 成', next: '下一步', skip: '忽 略' },
			scrollToFirstStep: true,
			disableCloseOnEsc: true,
			disableOverlayClose: true,
			continuous: true,
			showProgress: false,
			showSkipButton: true,
			callback: "{{$onExit}}",
			steps: [{
				target: '.app-account-subjects-header-right',
				content: ["点击", {
					name: 'span',
					component: '::span',
					className: 'ttk-rc-intro-style',
					children: '编码设置'
				}, "可以进行科目编码设置"],
				placement: 'left',
				disableBeacon: true
			}, {
				target: '.app-account-subjects-cell-oprate-optrange',
				content: ['可', {
					name: 'span',
					component: '::span',
					className: 'ttk-rc-intro-style',
					children: '新增、批量新增、修改和删除'
				}, '科目'],
				placement: 'left',
				disableBeacon: true
			}, {
				target: '.app-account-subjects-cell-left-coderange',
				content: ['点击编码可以', {
					name: 'span',
					component: '::span',
					className: 'ttk-rc-intro-style',
					children: '查看、修改'
				}, '科目'],
				placement: 'right',
				disableBeacon: true
			}]
		}]
	}
}


export function getInitState() {
	return {
		data: {
			list: [],
			filter: {
				targetList: 'all'
			},
			top: 0,
			other: {
				stepEnabled: false,
				calcDict: {},
				detailsScrollToRow: 0,
				loading: true, //grid加载状态
				accountingStandards: true, //是否为小企业会计准则
				isShowBtn: false,
				x: 0,
				y: 0,
				matchIndex: -1,
				matchBacktoZero: true,
				isCheckBoxColAccountSubjects: true
			}
		}
	}
}
