export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-scm-app-matching-unit',
		children: [/*{
			className: 'ttk-scm-app-matching-unit-waring',
			_visible: '{{ !data.currentAccountEnable }}',
			component: '::div',
			children: {
				// className: '',
				component: '::div',
				children: '注意：供应商/客户为空时，点击生成单据按钮，会根据默认性质自动生成客户档案或者供应商档案'
			}
		}, */{
			name: 'header',
			component: '::div',
			className: 'ttk-scm-app-matching-unit-header',
			children: [{
				name: 'inventoryName',
				component: 'Input.Search',
				showSearch: true,
				placeholder: '按对方户名查询',
				className:'ttk-scm-app-matching-unit-header-search',
				onSearch:`{{$fixPosition}}`,
				value:'{{data.search}}',
				//enterButton:true,
				onChange: `{{$handleChangeSearch}}`,
				//onBlur:`{{$fixPosition}}`,
			}, {
				name: 'RadioGroup',
				component: 'Radio.Group',
				_visible: '{{ data.currentAccountEnable }}',
				onChange: '{{$handleOnChangeSetType}}',
				value: '{{data.inventoryNameSet}}',
				children: [
					{
						name: 'Radio2',
						component: 'Radio',
						className: 'ttk-scm-app-matching-unit-header-radio',
						value:1,
						children: '{{ $getName("未匹配") }}'
					},
					{
						name: 'Radio1',
						component: 'Radio',
						className: 'ttk-scm-app-matching-unit-header-radio',
						value: 0,
						children: '{{ $getName("全部") }}'
					}
				]
			}, {
				component: 'Button',
				//type: 'primary',
				_visible: '{{ data.currentAccountEnable }}',
				children: '自动生成往来科目',
				className: 'btn',
				onClick: '{{function(){$autoSubjectClick()}}}'
			}]
		}, {
			name: 'dataGrid',
			component: 'DataGrid',
			headerHeight: 37,
			isColumnResizing: false,
			rowHeight: 38,
			ellipsis: true,
			className: '{{ data.currentAccountEnable ? "ttk-scm-app-matching-unit-list accountenable" : "ttk-scm-app-matching-unit-list" }}',
			loading: '{{data.loading}}',
			// enableSequence: false,
			rowsCount: "{{data.list.length}}",
			columns:  [{
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
						component: 'Checkbox',
						checked: '{{data.list[_rowIndex].selected}}',
						onChange: '{{$selectRow(_rowIndex)}}'
					}]
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
					children: '对方户名'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					tip: true,
					className: 'mk-datagrid-cellContent-left',
					value: "{{data.list[_rowIndex].name}}",
					_power: '({rowIndex})=>rowIndex',
				}
			}, {
				name: 'archiveSelect',
				component: 'DataGrid.Column',
				columnKey: 'archiveSelect',
				width: 150,
				flexGrow: 1,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '供应商/客户'
				},
				cell: {
					name: 'cell',
					component: 'Select',
					className: 'ttk-scm-app-matching-unit-list-archiveSelect',
					showSearch: true,
					allowClear: true,
					value: '{{data.list[_rowIndex] && data.list[_rowIndex].archiveId}}',
					onChange: '{{function(value){$onFieldChange(value, _rowIndex)}}}',
					// filterOption: '{{$filterOption}}',
					//onFocus: '{{function(){data.list[_rowIndex].archiveType == "供应商" ? $getSupplier({ entity: { isEnable: true } }, "data.other.supplier") : $getCustomer({ entity: { isEnable: true } }, "data.other.customer")}}}',
					onFocus: '{{ $archiveFocus }}',
					children: '{{$selectChidren(data.list[_rowIndex], data.list[_rowIndex].archiveType)}}',
					dropdownFooter: {
						name: 'add',
						type: 'primary',
						component: 'Button',
						style: { width: '100%', borderRadius: '0' },
						children: '新增',
						onClick: '{{function(){data.list[_rowIndex].archiveType == "供应商" ? $addSupplierCustomer("supplier", _rowIndex) : $addSupplierCustomer("customer", _rowIndex)}}}'
					},
					_power: '({rowIndex}) => rowIndex',
				}
			}, /*{
				name: 'archiveType',
				component: 'DataGrid.Column',
				columnKey: 'archiveType',
				width: 150,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '性质'
				},
				cell: {
					name: 'cell',
					component: "Radio.Group",
					className: 'ttk-scm-app-matching-unit-list-archiveType',
					value: '{{data.list[_rowIndex].archiveType}}',
					//onChange: '{{function(v){$rptTypeChange(_rowIndex,v.target.value)}}}',
					_power: '({rowIndex})=>rowIndex',
					children: [{
						name: 'type',
						component: 'Radio',
						disabled: true,
						value:'供应商',
						children: '供应商'
						// onClick: '{{$modifyDetail(data.list[_rowIndex].id)}}'
					}, {
						name: 'type',
						component: 'Radio',
						disabled: true,
						value:'客户',
						children: '客户'
						// onClick: '{{$modifyDetail(data.list[_rowIndex].id)}}'
					}]
				}
			}, */{
				name: 'receiptAndDisbursementDirection',
				component: 'DataGrid.Column',
				columnKey: 'receiptAndDisbursementDirection',
				width: 90,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '收支方向'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					tip: true,
					value: "{{data.list[_rowIndex].receiptAndDisbursementDirection}}",
					_power: '({rowIndex})=>rowIndex',
				}
			}, {
				name: 'subjectSelect',
				component: 'DataGrid.Column',
				columnKey: 'subjectSelect',
				width: 150,
				flexGrow: 1,
				_visible: '{{ data.currentAccountEnable }}',
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '往来科目'
				},
				cell: {
					name: 'cell',
					component: 'Select',
					className: '{{ data.list[_rowIndex].subjectError ? "subjectError ttk-scm-app-matching-unit-list-subjectSelect" : "ttk-scm-app-matching-unit-list-subjectSelect" }}',
					showSearch: true,
					allowClear: true,
					value: '{{data.list[_rowIndex] && data.list[_rowIndex].accountId}}',
					onChange: '{{function(value){$onFieldChange(value, _rowIndex, "subject")}}}',
					//onFocus: '{{function(){$onFieldFocus(data.list[_rowIndex], _rowIndex)}}}',
					// filterOption: '{{$filterOption}}',
					children: '{{$selectChidren(data.list[_rowIndex], "subject")}}',
					dropdownFooter: {
						name: 'add',
						type: 'primary',
						component: 'Button',
						style: { width: '100%', borderRadius: '0' },
						children: '新增科目',
						onClick: '{{function(){ $addSubject(data.list[_rowIndex], _rowIndex) } }}'
					},
					_power: '({rowIndex}) => rowIndex',
				}
			}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'ttk-scm-app-matching-unit-footer',
			children: [{
				name: 'btnGroup',
				component: '::div',
				className: 'ttk-scm-app-matching-unit-footer-btnGroup',
				children: [{
					name: 'save',
					component: 'Button',
					className: 'ttk-scm-app-matching-unit-footer-btnGroup-item',
					children: '保存',
					onClick: "{{function(e){$save()}}}"
				}, {
					name: 'prev',
					component: 'Button',
					className: 'ttk-scm-app-matching-unit-footer-btnGroup-item',
					children: '上一步',
					onClick: "{{function(e){$prev()}}}"
				}, {
					name: 'next',
					component: 'Button',
					className: 'ttk-scm-app-matching-unit-footer-btnGroup-item',
					type: 'primary',
					children: '生成单据',
					onClick: "{{function(e){$next()}}}"
				}]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			search: '',
			inventoryNameSet: 1,
			list: [],
			other: {
				inventory: [],
				supplier: [],
				customer: []
			}
		}
	}
}