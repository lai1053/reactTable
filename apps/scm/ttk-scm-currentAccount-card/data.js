import { consts, common } from 'edf-constant'
import moment from 'moment'
import { fromJS } from 'immutable'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-currentAccount-card',
		onMouseDown: '{{$mousedown}}',
		children: [{
			name: 'account',
			component: 'Form.Item',
			label: '结算账户',
			className: 'account',
			children: [{
				name: 'select',
				component: 'Select',
				value: '{{data.form.account}}',
				required: true,
				onChange: `{{function(v){$fieldChange('data.form.account',data.other.account.filter(function(o){return o.id == v})[0])}}}`,
				children: {
					name: 'option',
					component: 'Select.Option',
					value: '{{data.other.account && data.other.account[_rowIndex].id}}',
					children: '{{data.other.account && data.other.account[_rowIndex].name}}',
					_power: 'for in data.other.account'
				}
			}]
		}, {
			name: 'details',
			component: 'DataGrid',
			headerHeight: 37,
			isColumnResizing: false,
			rowHeight: 37,
			ellipsis: true,
			enableSequence: false,
			className: 'ttk-scm-currentAccount-card-content',
			loading: '{{data.other.loading}}',
			rowsCount: "{{data.form.details.length}}",
			readonly: false,
			enableSequenceAddDelrow: true,
			onAddrow: '{{$addRow("details")}}',
			onDelrow: '{{$delRow("details")}}',
			onUprow: '{{$upRow("details")}}',
			onDownrow: '{{$downRow("details")}}',
			onKeyDown: '{{$gridKeydown}}',
			scrollToColumn: '{{data.other.detailsScrollToColumn}}',
			scrollToRow: '{{data.other.detailsScrollToRow}}',
			columns: [{
				name: 'invoiceDate',
				component: 'DataGrid.Column',
				columnKey: 'invoiceDate',
				width: 90,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '开票日期'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					value: "{{data.form.details[_rowIndex]&&data.form.details[_rowIndex].invoiceDate}}",
					_power: '({rowIndex})=>rowIndex',
					tip: true,
				}
			}, {
				name: 'invoiceNumber',
				component: 'DataGrid.Column',
				columnKey: 'invoiceNumber',
				width: 102,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '发票号码'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					value: "{{data.form.details[_rowIndex]&&data.form.details[_rowIndex].invoiceNumber}}",
					_power: '({rowIndex})=>rowIndex',
					tip: true,
				}
			}, {
				name: 'customerName',
				component: 'DataGrid.Column',
				columnKey: 'customerName',
				width: 222,
				_visible: '{{data.other.vatOrEntry==0}}',
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '购方单位名称'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					style: {
						textAlign: 'left'
					},
					value: "{{data.form.details[_rowIndex]&&data.form.details[_rowIndex].customerName}}",
					_power: '({rowIndex})=>rowIndex',
					tip: true,
				}
			},
			{
				name: 'supplierName',
				component: 'DataGrid.Column',
				columnKey: 'supplierName',
				width: 222,
				_visible: '{{data.other.vatOrEntry==1}}',
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '销方单位名称'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					style: {
						textAlign: 'left'
					},
					value: "{{data.form.details[_rowIndex]&&data.form.details[_rowIndex].supplierName}}",
					_power: '({rowIndex})=>rowIndex',
					tip: true,
				}
			},
			{
				name: 'notSettleAmount',
				component: 'DataGrid.Column',
				columnKey: 'notSettleAmount',
				width: 102,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '{{data.other.vatOrEntry==0?"待收款金额":"待付款金额"}}'
				},
				cell: {
					name: 'cell',
					component: "DataGrid.Cell",
					className: 'right',
					value: "{{data.form.details[_rowIndex]&&$transformThoundsNumber(data.form.details[_rowIndex].notSettleAmount,'notSettleAmount')}}",
					_power: '({rowIndex})=>rowIndex',
					tip: true,
				}
			}, {
				name: 'amount',
				component: 'DataGrid.Column',
				columnKey: 'amount',
				width: 122,
				className:'amount_cell',
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '{{data.other.vatOrEntry==0?"本次收款金额":"本次付款金额"}}',
					className:'cell_header'
				},
				cell: {
					name: 'cell',
					precision: 2,
					step:0.01,
					//	component: '{{$isFocus(_ctrlPath) ? "Input.Number" : "DataGrid.TextCell"}}',
					component: "Input.Number",
					className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-proceeds-card-cell-right"}}',
					value: "{{$quantityFormat(data.form.details[_rowIndex].amount,2,$isFocus(_ctrlPath))}}",
					onChange: '{{function(v){$changeAmount(v, _rowIndex)}}}',
					_power: '({rowIndex})=>rowIndex',
				}
			}, {
				name: 'operation',
				component: 'DataGrid.Column',
				columnKey: 'operation',
				width: 42,
				flexGrow: 1,
				header: {
					name: 'header',
					component: 'DataGrid.Cell',
					children: '操作'
				},
				cell: {
					name: 'cell',
					component: "Icon",
					title: '删除',
					fontFamily: 'edficon',
					className: 'deleteI',
					type: "shanchu",
					onClick: '{{function(){$deleteDetail(data.form.details[_rowIndex].id)}}}',
					_power: '({rowIndex})=>rowIndex',
					tip: true,
				}
			}]
		}]
	}
}

export function getInitState(option) {
	return {
		data: {
			form: {
				details: [
					blankDetail,
					blankDetail
				],
			},
			other: {
				error: {},
				loading: false,
				account: []
			},

		}
	}
}

export const blankDetail = {
	invoiceDate: null,
	invoiceNumber: null,
	customerName: null,
	notSettleAmount: null,
	amount: null
}
