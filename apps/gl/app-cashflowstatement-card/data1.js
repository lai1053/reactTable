export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		onMouseDown: '{{$mousedown}}',
		className: 'app-cashflowstatement-card',
		children: [{
			name: 'header',
			component: '::div',
			className: 'app-cashflowstatement-card-header',
			children: [{
				name: 'refresh',
				component: 'Layout',
				className: 'app-cashflowstatement-card-header-left',
				children: '{{"启用期间："+ data.period}}'
			}, {
				name: 'save',
				component: 'Button',
				children: '保存',
				className: 'app-cashflowstatement-card-header-right',
				onClick: '{{$save}}'
			}]
		}, {
			name: 'content',
			component: 'Layout',
			className: 'app-cashflowstatement-card-content',
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				headerHeight: 35,
				isColumnResizing:true,
				rowHeight: 35,
				//enableSequence: true,
				rowsCount: "{{$getListRowsCount()}}",
				onKeyDown: '{{$gridKeydown}}',
				columns: [{
					name: 'voucherDate',
					component: 'DataGrid.Column',
					columnKey: 'voucherDate',
					width: 120,
					isResizable: true,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '日期'
					},
					cell: {
						name: 'cell',
						component: "{{$isFocus(_ctrlPath)?'DatePicker':'DataGrid.TextCell' }}",
						format: "YYYY-MM-DD",
						className: "{{$getCellClassName(_ctrlPath)}}",
						align: 'left',
						value: `{{{
								if(!data.list[_rowIndex].voucherDate) return
								let ret= $isFocus(_ctrlPath) ? $stringToMoment(data.list[_rowIndex].voucherDate) : data.list[_rowIndex].voucherDate
								return ret
							}}}`,
						onChange: "{{function(d){$sf(`data.list.${_rowIndex}.voucherDate`, $momentToString(d,'YYYY-MM-DD'))}}}",
						_excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
						_power: '({rowIndex})=>rowIndex',
					},
				}, {
					name: 'cashFlowItem',
					component: 'DataGrid.Column',
					columnKey: 'cashFlowItem',
					width: 150,
					flexGrow: 1,
					isResizable: true,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '项目'
					},
					cell: {
						name: 'cell',
						component: "{{$isFocus(_ctrlPath)?'Select':'DataGrid.TextCell' }}",
						//mode: 'combobox',
						className: "{{$getCellClassName(_ctrlPath)}}",
						align: 'left',
						value: `{{{
								if(!data.list[_rowIndex].cashFlowItem) return
								let ret= $isFocus(_ctrlPath) ? (data.list[_rowIndex].cashFlowItem && data.list[_rowIndex].cashFlowItem.name) :
								(data.list[_rowIndex].cashFlowItem && data.list[_rowIndex].cashFlowItem.name)
								return ret
							}}}`,
						onChange: "{{$getCashValue(_rowIndex)}}",
						onFocus: "{{$addGridRow(_rowIndex)}}",
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.cashFlowItems && data.other.cashFlowItems[_lastIndex].id }}',
							children: '{{data.other.cashFlowItems && data.other.cashFlowItems[_lastIndex].name }}',
							_power: 'for in data.other.cashFlowItems'
						},
						_excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
						_power: '({rowIndex})=>rowIndex',
					},
				}, {
					name: 'cashFlowDirectionName',
					component: 'DataGrid.Column',
					columnKey: 'cashFlowDirectionName',
					width: 80,
					isResizable: true,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '方向'
					},
					cell: {
						name: 'cell',
						component: "DataGrid.TextCell",
						value: "{{data.list[_rowIndex].cashFlowDirectionName}}",
						_power: '({rowIndex})=>rowIndex',
					}
				}, {
					name: 'amount',
					component: 'DataGrid.Column',
					columnKey: 'amount',
					width: 100,
					flexGrow: 1,
					isResizable: true,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '金额'
					},
					cell: {
						name: 'cell',
						component: "{{$isFocus(_ctrlPath)?'Input.Number':'DataGrid.TextCell' }}",
						//mode: 'combobox',
						className: "{{$getCellClassName(_ctrlPath)}}",
						align: 'left',
						value: `{{{
								if(!data.list[_rowIndex].amount) return
								let ret= $isFocus(_ctrlPath) ? data.list[_rowIndex].amount : data.list[_rowIndex].amount
								return ret
							}}}`,
						onChange: "{{function(d){$sf(`data.list.${_rowIndex}.amount`, d)}}}",
						onFocus: "{{$addGridRow(_rowIndex)}}",
						_excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
						_power: '({rowIndex})=>rowIndex',
					},
				}, {
					name: 'operation',
					component: 'DataGrid.Column',
					columnKey: 'operation',
					width: 60,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '操作'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						children: [{
							name: 'remove',
							component: 'Icon',
							showStyle: 'showy',
							fontFamily: 'mkicon',
							type: 'remove',
							className: 'del',
							title: '删除',
							onClick: '{{$delClick(_rowIndex)}}'
						}],
						_power: '({rowIndex})=>rowIndex',
					}
				}]
			}]
		}, {
			name: 'header',
			component: '::div',
			className: 'textred',
			children: '{{data.textWord}}'
		}]
	}
}

export function getInitState() {
	return {
		data: {
			list: [],
			period: '',
			textWord: '',
			other: {

			}
		}
	}
}