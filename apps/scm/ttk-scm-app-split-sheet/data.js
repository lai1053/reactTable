import { consts, common } from 'edf-constant'
import moment from 'moment'
import { fromJS } from 'immutable'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-scm-app-split-sheet',
        id: 'ttk-scm-app-split-sheet',
        onMouseDown: '{{$mousedown}}',
        children: [{
			name: 'dataGrid',
			component: 'DataGrid',
			headerHeight: 37,
			isColumnResizing: false,
			rowHeight: 35,
			ellipsis: true,
			className: 'ttk-scm-app-split-sheet-list',
			loading: '{{data.loading}}',
			rowsCount: 1,
			columns:  [{
				name: 'date',
				component: 'DataGrid.Column',
				columnKey: 'date',
				width: 80,
				flexGrow: 1,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '交易日期'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					value: "{{data.other.bankReconciliatio && data.other.bankReconciliatio.businessDate}}",					
					_power: '({rowIndex})=>rowIndex',
				}
			},{
				name: 'abstract',
				component: 'DataGrid.Column',
				columnKey: 'abstract',
				width: 40,
				flexGrow: 1,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '摘要'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					tip: true,
					className: 'mk-datagrid-cellContent-left',
					value: "{{data.other.bankReconciliatio && data.other.bankReconciliatio.memo}}",					
					_power: '({rowIndex})=>rowIndex',
				}
			}, {
				name: 'reciprocalAccountName',
				component: 'DataGrid.Column',
				columnKey: 'reciprocalAccountName',
				width: 139,
				flexGrow: 1,
				header: {
					name: 'reciprocalAccountName',
					component: 'DataGrid.Cell',
					children: '对方账户'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					value: "{{data.other.bankReconciliatio && data.other.bankReconciliatio.reciprocalAccountName}}",					
					_power: '({rowIndex})=>rowIndex',
				}
			}, {
				name: 'inAmount',
				component: 'DataGrid.Column',
				columnKey: 'inAmount',
				width: 47,
				flexGrow: 1,
				header: {
					name: 'header',
					component: "DataGrid.Cell",
					children: '收入'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",					
					className: 'ttk-scm-app-split-sheet-list-inAmount',
					value: "{{data.other.bankReconciliatio && data.other.bankReconciliatio.inAmount}}",					
					_power: '({rowIndex})=>rowIndex',
				}
			}, {
				name: 'outAmount',
				component: 'DataGrid.Column',
				columnKey: 'outAmount',
				width: 47,
				flexGrow: 1,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '支出'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					className: 'ttk-scm-app-split-sheet-list-outAmount',
					value: "{{data.other.bankReconciliatio && data.other.bankReconciliatio.outAmount}}",
					_power: '({rowIndex})=>rowIndex',
				}
			},{
				name: 'receiveCode',
				component: 'DataGrid.Column',
				columnKey: 'receiveCode',
				width: 55,
				flexGrow: 1,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '回单号'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					tip: true,
					value: "{{data.other.bankReconciliatio && data.other.bankReconciliatio.receiveCode}}",
					_power: '({rowIndex})=>rowIndex',
				}
			}]
		},{
			name: 'top',
			className: 'ttk-scm-app-split-sheet-center',
			component: '::div',
			children: [{
				name: 'name',
				component: 'Form.Item',
				label: '开户银行',
				children: [{
					component: '::span',
					children: '{{data.other.bankAccount && data.other.bankAccount.name}}',
				}]
			}, {
				name: 'businessDate',
				component: 'Form.Item',
				label: '单据日期',
				children: [{
					name: 'businessDate',
					component: 'DatePicker',
					// className: 'app-proof-of-charge-form-header-date-picker',
					value: '{{$stringToMoment(data.other.SystemDate)}}',
					onChange: "{{function(d){$sf('data.other.SystemDate',$momentToString(d,'YYYY-MM-DD'))}}}"
				}]
			},{
				name: 'intercourse',
				component: 'Form.Item',
				_visible: '{{data.other.columnSetting && data.other.columnSetting.header.cards.find(o=> o.fieldName === "calcObject").isVisible}}',
				label: '往来单位或个人',
				children: [{
					name: 'intercourse',
					component: 'TreeSelect',
					value: '{{( data.form.supplierName || data.form.customerName || data.form.personName || data.other.bankReconciliatio && data.other.bankReconciliatio.reciprocalAccountName)}}',
					treeData: '{{data.other.getCalcObject}}',
					onChange: `{{$onFieldDataChanges({ value: "data.form.supplierId", label: "data.form.supplierName"}, "data.other.getCalcObjects")}}`,
				}]
			}]
		},{
            name: 'content',
            component: 'Layout',
            className: 'ttk-scm-app-split-sheet-content',
            children: {
                name: 'details',
                component: 'DataGrid',
                className: 'ttk-scm-app-split-sheet-form-details',
                headerHeight: 35,
                rowHeight: 35,
                rowsCount: '{{data.form.details.length}}',
                readonly: false,
                enableSequence: true,
				startSequence: 1,
                enableSequenceAddDelrow: true,
                onAddrow: '{{$addRow("details")}}',
				onDelrow: '{{$delRow("details")}}',
				onUprow: '{{$upRow("details")}}',
				onDownrow: '{{$downRow("details")}}',
				onKeyDown: '{{$gridKeydown}}',
				scrollToColumn: '{{data.other.detailsScrollToColumn}}',
				scrollToRow: '{{data.other.detailsScrollToRow}}',
                columns: [{
					name: 'proceedsType',
					component: 'DataGrid.Column',
					columnKey: 'proceedsType',
					flexGrow: 1,
					width: 100,
					header: {
						name: 'header',
						className: 'ant-form-item-required',
						component: 'DataGrid.Cell',
						children: '收款类型'
					},
					cell: {
						name: 'cell',
						component: '{{$isFocus(_ctrlPath) ? "Cascader" : "DataGrid.TextCell"}}',
						className: '{{$getCellClassName(_ctrlPath)}}',
						value: '{{$isFocus(_ctrlPath) ? data.form.details[_rowIndex].businessTypeArrName : data.form.details[_rowIndex] && data.form.details[_rowIndex].businessTypeName}}',
						onChange: '{{$onFieldChange({ id: `data.form.details.${_rowIndex}.businessTypeId`,' +
						'name: `data.form.details.${_rowIndex}.businessTypeName`,' +
						'arrName: `data.form.details.${_rowIndex}.businessTypeArrName`,' +
						'fatherName: `data.form.details.${_rowIndex}.businessTypeFatherName`,' +
						'calcObject: `data.form.details.${_rowIndex}.calcObject`}, "data.other.businessTypes", _rowIndex, data.form.details[_rowIndex])}}',
						onFocus: '{{$isFocus(_ctrlPath) ? "" : $cardFocus}}',
						options: '{{data.other.businessTypes}}',
						allowClear: false,
						// filedNames:{ label: 'name', value: 'id'},
						placeholder:'',
						expandTrigger: "hover",
						_excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
						_power: '({rowIndex}) => rowIndex'
					}
				}, {
					name: 'depdepartment',
					component: 'DataGrid.Column',
					columnKey: 'depdepartment',
					flexGrow: 1,
					width: 80,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '部门'
					},
					cell: {
						name: 'cell',
						component: '{{$isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
						className: '{{$getCellClassName(_ctrlPath)}}',
						showSearch: false,
						value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].departmentName}}',
						onChange: '{{$onFieldChange({ id: `data.form.details.${_rowIndex}.departmentId`,' +
						'name: `data.form.details.${_rowIndex}.departmentName`}, "data.other.departmentList", _rowIndex, data.form.details[_rowIndex])}}',
						onFocus: '{{() => $getDepartment({}, `data.other.departmentList`)}}',
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.departmentList && data.other.departmentList[_lastIndex].id}}',
							children: '{{data.other.departmentList && data.other.departmentList[_lastIndex].name}}',
							_power: 'for in data.other.departmentList'
						},
						_excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
						_power: '({rowIndex}) => rowIndex'
					}
				}, {
					name: 'project',
					component: 'DataGrid.Column',
					columnKey: 'project',
					flexGrow: 1,
					width: 100,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '项目'
					},
					cell: {
						name: 'cell',
						component: '{{$isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
						className: '{{$getCellClassName(_ctrlPath)}}',
						showSearch: false,
						value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].projectName}}',
						onChange: '{{$onFieldChange({ id: `data.form.details.${_rowIndex}.projectId`,' +
						'name: `data.form.details.${_rowIndex}.projectName`}, "data.other.projectList", _rowIndex, data.form.details[_rowIndex])}}',
						onFocus: '{{() => $getProject({}, `data.other.projectList`)}}',
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.projectList && data.other.projectList[_lastIndex].id}}',
							children: '{{data.other.projectList && data.other.projectList[_lastIndex].name}}',
							_power: 'for in data.other.projectList'
						},
						_excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
						_power: '({rowIndex}) => rowIndex'
					}
				}, {
                        name: 'amount',
                        component: 'DataGrid.Column',
                        columnKey: 'amount',
                        flexGrow: 1,
                        width: 100,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-required',
                            children: '金额'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$isFocus(_ctrlPath) ? "Input" : "DataGrid.TextCell"}}',
                            className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-proceeds-card-cell-right"}}',
							value: '{{data.form.details[_rowIndex].amount}}',
							onChange: '{{function(e){$moneyChange(_rowIndex,e.target.value)}}}',
                            // onChange: '{{function(e){$sf(`data.form.details.${_rowIndex}.amount`,e.target.value)}}}',
                            _power: '({rowIndex}) => rowIndex'
                        },
                        footer: {
                            name: 'footer',
                            component: 'DataGrid.Cell',
                            className: 'ttk-scm-app-proceeds-card-list-cell-right',
                            children: '{{$sumColumn("amount")}}'
                        }
					}, {
                        name: 'quantity',
                        component: 'DataGrid.Column',
                        columnKey: 'quantity',
                        flexGrow: 1,
                        width: 100,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '备注'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$isFocus(_ctrlPath) ? "Input" : "DataGrid.TextCell"}}',
                            className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-proceeds-card-cell-right"}}',
                            value: '{{data.form.details[_rowIndex].remark}}',
                            // value: '{{$quantityFormat(data.form.details[_rowIndex].remark,2,$isFocus(_ctrlPath))}}',
                            // onChange: '{{$calc("remark", _rowIndex, data.form.details[_rowIndex])}}',
                            onChange: '{{function(e){$sf(`data.form.details.${_rowIndex}.remark`,e.target.value)}}}',
                            _power: '({rowIndex}) => rowIndex'
                        }
                    }
                ]}
		},{
			name: 'top',
			className: 'ttk-scm-app-split-sheet-bottom',
			component: '::div',
			children: [{
				name: 'name',
				component: 'Form.Item',
				label: '还差',
				children: [{
					component: '::span',
					children: '{{data.other.bankReconciliatio && data.other.total}}',
				}]
			},{
				name: 'name',
				component: 'Form.Item',
				label: '总计',
				children: [{
					component: '::span',
					children: '{{data.other.bankReconciliatio && data.other.difference}}',
				}]
			}]
		}]
    }
}

export function getInitState(option) {
    return {
        data: {
            loading: false,
            form: {
                details: [
                    blankDetail
                ]
            },
            total: {

            },
            other: {
				defaultLength: 5, 	//默认初始行数
                beginDate: moment().format('YYYY-MM'),
                list:[{
                    projectId: ''
                }]
            },
        }
    }
}

export const blankDetail = {
    proceedsType: null,
    depdepartment: null,
    project: null,
	amount: null,
	quantity:null
}
