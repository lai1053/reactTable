import { Map, List, fromJS } from 'immutable'
import { Select } from 'edf-component'
const Option = Select.Option
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-proof-of-charge-common-edit',
		id: 'app-proof-of-charge-common-edit',
		onMouseDown: '{{function(e){$onMouseDown(e)}}}',
		children: [{
			name: 'center',
			component: '::div',
			className: 'app-proof-of-charge-common-edit-header',
			children: [{
				name: 'code',
				component: 'Form.Item',
				label: '编码',
				required: true,
				validateStatus: "{{data.other.error.code?'error':'success'}}",
				help: '{{data.other.error.code}}',
				children: [{
					name: 'code',
					component: 'Input',
					style: { width: 200 },
					value: '{{data.form.code}}',
					onChange: `{{function(e){$setFieldChange('data.form.code',e.target.value, 'data.other.error.code')}}}`,
				}]
			}, {
				name: 'name',
				component: 'Form.Item',
				label: '名称',
				required: true,
				validateStatus: "{{data.other.error.name?'error':'success'}}",
				help: '{{data.other.error.name}}',
				children: [{
					name: 'name',
					component: 'Input',
					style: { width: 200 },
					value: '{{data.form.name}}',
					onChange: `{{function(e){$setFieldChange('data.form.name',e.target.value, 'data.other.error.name')}}}`,
				}]
			}]
		}, {
			name: 'center',
			component: '::div',
			className: 'gridDiv',
			children: [
				{
					name: 'details',
					component: 'DataGrid',
					className: 'app-proof-of-charge-common-edit-form-details',
					headerHeight: 49,
					rowHeight: 49,
					footerHeight: 50,
					showBtnWidth: true,
					isFix: true,
					// height: '410px',
					rowsCount: '{{data.form.details.length}}',
					enableAddDelrow: '{{$isRowOperation()}}',
					onAddrow: "{{$addRow('details')}}",
					onDelrow: "{{$delRow('details')}}",
					enableUpDownrow: '{{$isRowOperation()}}',
					onUprow: "{{$upRow('details')}}",
					onDownrow: "{{$downRow('details')}}",
					startSequence: 1,
					readonly: '{{data.form.certificateStatus == "1000020002"}}',
					scrollToRow: '{{data.other.detailsScrollToRow}}',
					isAutoCalcScrollToRow: '{{data.other.isRenderScroll}}',
					// onRowMouseEnter: '{{$handleRowMouseEnter}}',
					onScrollEnd: '{{$handleScrollEnd}}',
					columns: [{
						name: 'summary',
						component: 'DataGrid.Column',
						columnKey: 'summary',
						width: 30,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: [{
								name: 'label',
								component: '::label',
								className: 'app-proof-of-charge-common-edit-form-details-label',
								children: '摘要'
							}]
						},
						cell: {
							name: 'cell',
							component: "{{$isReadOnly(_ctrlPath) ? 'DataGrid.TextCell' : $isFocus(_ctrlPath)?'Select':'DataGrid.TextCell' }}",
							mode: 'combobox',
							id: 'summary',
							enableEllipsis: true,
							enableTooltip: true,
							className: "{{$isFocus(_ctrlPath) ? 'summaryleft app-proof-of-charge-common-edit-cell editable-cell':'summaryleft'}}",
							defaultActiveFirstOption: false,
							showArrow: false,
							optionFilterProp: 'children',
							filterOption: true,
							dropdownClassName: 'app-proof-of-charge-common-edit-form-details-select',
							align: 'left',
							value: `{{{
									if(!data.form.details[_rowIndex].summary) return
									var ret = (data.form.details[_rowIndex].summary.name ||
														 data.form.details[_rowIndex].summary)
									return ret
								}}}`,
							onSelect: `{{$onSummarySelect(_ctrlPath,_rowIndex, data.form.details[_rowIndex], data.other.summarys)}}`,
							onFocus: "{{function(){$onFieldFocus(_ctrlPath)}}}",
							children: '{{$summaryOption()}}',
							_excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
							_power: '({rowIndex})=>rowIndex'
						},
						footer: {
							name: 'footer',
							component: '::span',
							className: 'total-footer',
							children: "{{ $getTotal(data.form.details)}}"
						}
					}, {
						name: 'accountingSubject',
						component: 'DataGrid.Column',
						columnKey: 'accountingSubject',
						width: 120,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: [{
								name: 'label',
								component: '::label',
								className: 'app-proof-of-charge-common-edit-form-details-label',
								children: '会计科目'
							}]
						},
						cell: {
							name: 'cell',
							component: "{{$isFocus(_ctrlPath) ?$renderSelectComponent(_ctrlPath):'SubjectDisplay' }}",
							className: "{{$isReadOnly(_ctrlPath) == false ? $isFocus(_ctrlPath) ? 'app-proof-of-charge-common-edit-cell editable-cell' :'' + ' app-proof-of-charge-common-edit-form-cell-subjects' : ' app-proof-of-charge-common-edit-form-cell-subjects'}}",
							getPopupContainer: '{{function(){return document.querySelector(".app-proof-of-charge-common-edit")}}}',
							onSearch: '{{function(v){$lazySearch(v)}}}',
							filterOption: '{{$filterOption}}',
							showArrow: false,
							showSearch: true,
							id: 'account',
							selectRows: 50,
						
							selectPagination: '{{data.other.isEnable}}',
							keyRandom: '{{data.other.keyRandom}}',
							selectSubject: '{{function(){return $clickSubject(data.form.details[_rowIndex].accountingSubject.id)}}}',
							updateAuxItem: '{{$updateAuxItem}}',
							dropdownClassName: 'app-proof-of-charge-common-edit-form-details-select app-proof-of-charge-common-edit-form-details-select-subjects',
							align: 'left',
							placeholder: '{{data.other.placeholder}}',
							value: `{{{
									if(!data.form.details[_rowIndex].accountingSubject) return
									return data.form.details[_rowIndex].accountingSubject.id
								}}}`,
							onFocus: "{{function(){$onFieldFocus(_ctrlPath)} }}",
							onBlur: '{{function(){$accountingSubjectBlur()}}}',
							onSelect: "{{$onSubjectSelect(_ctrlPath, _rowIndex, window.accountingEditSubjects)}}",
							children: '{{$renderCellContent(data.other.keyRandom,window.accountingEditSubjectOptions)}}',
							dropdownFooter: {
								name: 'add',
								type: 'default',
								component: 'Button',
								className: 'app-proof-of-charge-common-edit-form-details-account-add',
								style: { width: '100%', borderRadius: '0', height: '30px' },
								children: [{
									name: 'addIcon',
									component: 'Icon',
									className: 'app-proof-of-charge-common-edit-form-details-account-add-icon',
									fontFamily: 'edficon',
									type: 'xinzengkemu'
								}, '新增科目'],
								onClick: '{{$addSubject(_rowIndex)}}'
							},
							_excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
							_power: '({rowIndex})=>rowIndex',
						},
					}, {
						name: 'quantityAndForeignCurrency',
						component: 'DataGrid.Column',
						columnKey: 'quantityAndForeignCurrency',
						_visible: '{{!!data.other.isDisplayQuantityColumn}}',
						disabled: true,
						width: '{{data.other.quantityAndForeignCurrencyWidth}}',
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: [{
								name: 'label',
								component: '::label',
								className: 'app-proof-of-charge-common-edit-form-details-label',
								children: '{{data.other.quantityAndCurrencyTitle}}'
							}]
						},
						cell: {
							name: 'cell',
							component: "QuanAndForeCurrency",
							noTabKey: true,
							//className: "{{$getCellClassName(_ctrlPath) }}",
							className: "{{$isFocus(_ctrlPath) ? 'app-proof-of-charge-common-edit-cell editable-cell':''}}",
							value: '{{data.form.details[_rowIndex].quantityAndForeignCurrency}}',
							_power: '({rowIndex})=>rowIndex',
						}
					}, {
						name: 'debitAmount',
						component: 'DataGrid.Column',
						columnKey: 'debitAmount',
						width: 250,
						numberOnly: true,
						header: {
							name: 'header',
							component: 'MoneyCellHeader',
							className: 'app-proof-of-charge-common-edit-form-details-label',
							title: '借方金额'
						},
						cell: {
							name: 'cell',
							component: "{{$isReadOnly(_ctrlPath) ? 'MoneyCell' :($isFocus(_ctrlPath)?'Input.Number':'MoneyCell')}}",
							className: "{{$getCellClassName(_ctrlPath) }}",
							value: "{{(data.form.details[_rowIndex].debitAmount!=undefined && data.form.details[_rowIndex].debitAmount.toString()=='0') ? '' : data.form.details[_rowIndex].debitAmount}}",
							onChange: "{{$specialAmountChange(_ctrlPath)}}",
							onFocus: "{{function(){$onFieldFocus(_ctrlPath)}}}",
							precision: 2,
							type: 'input',
							timeout: true,
							interceptTab: true,
							_power: '({rowIndex})=>rowIndex',
							suffix: {
								name: 'calc',
								component: 'Icon',
								onClick: "{{function(){$calculator(_rowIndex,'debitAmount')}}}",
								style: { fontSize: '22px', cursor: 'pointer', position: 'absolute', right: '-8px', top: '-10px' },
								fontFamily: 'edficon',
								type: 'jisuanqi',
							}
						},
						footer: {
							name: 'footer',
							component: 'MoneyCell',
							value: "{{$sum(data.form.details, 'debitAmount')}}"
						}
					}, {
						name: 'creditAmount',
						component: 'DataGrid.Column',
						columnKey: 'creditAmount',
						width: 250,
						header: {
							name: 'header',
							component: 'MoneyCellHeader',
							className: 'app-proof-of-charge-common-edit-form-details-label',
							title: '贷方金额'
						},
						cell: {
							name: 'cell',
							component: "{{$isReadOnly(_ctrlPath) ? 'MoneyCell' :($isFocus(_ctrlPath)?'Input.Number':'MoneyCell')}}",
							className: "{{$getCellClassName(_ctrlPath) }}",
							value: "{{(data.form.details[_rowIndex].creditAmount!=undefined && data.form.details[_rowIndex].creditAmount.toString() == '0') ? '' : data.form.details[_rowIndex].creditAmount}}",
							onChange: "{{$specialAmountChange(_ctrlPath)}}",
							onFocus: "{{function(){$onFieldFocus(_ctrlPath)}}}",
							timeout: true,
							precision: 2,
							interceptTab: true,
							type: 'input',
							_power: '({rowIndex})=>rowIndex',
							suffix: {
								name: 'calc',
								component: 'Icon',
								onClick: "{{function(){$calculator(_rowIndex,'creditAmount')}}}",
								style: { fontSize: '22px', cursor: 'pointer', position: 'absolute', right: '-8px', top: '-10px' },
								fontFamily: 'edficon',
								type: 'jisuanqi',
							}
						},
						footer: {
							name: 'footer',
							component: 'MoneyCell',
							value: "{{$sum(data.form.details, 'creditAmount')}}"
						}
					}]
				}, {
					name: 'auxItemLink',
					component: '::a',
					children: '辅助项',
					_visible: '{{!data.other.hidePopover}}',
					className: '{{{data.other.auxBtnStyle}}}',
					style: '{{data.other.auxBtnStyle}}',
					onClick: '{{$updateAuxItem}}'
				}
			]
		}]
	}
}

//空的"数量/外币"字段
export const blankQuantityAndForeignCurrency = {
	isCalcQuantity: false,
	isCalcMulti: false,
	quantity: 0,
	price: 0,
	origAmount: 0,
	exchangeRate: 1,
	amount: 0,
	currency: undefined,
	unitName: ''
}

//空的凭证分录
export const blankVoucherItem = {
	summary: '',
	accountingSubject: undefined,
	debitAmount: undefined,
	creditAmount: ''
}

export function getInitState() {
	return {
		data: {
			auxItemVisible: true,
			form: {
				details: [
					blankVoucherItem,
					blankVoucherItem,
					blankVoucherItem,
					blankVoucherItem,
					blankVoucherItem
				],
				code: '',
				name: '',
				// adjunctInfo: {
				// 	album: [],
				// 	isVisible: false,
				// 	adjunctSize: 0,
				// },
				// isAttachCount: true,   //是否增加附件的数量（自动修改附件文本框的值）
				// attachCount: 0,
				// enclosures: [],
				// attachmentFiles: fromJS([]),
				// attachmentStatus: 0,  //附件status 0: 上传  1: 只读
				// docType: '记',
				// certificateStatus: STATUS_VOUCHER_NOT_AUDITED,  //单据状态  审核或未审核
				// codeDisabled: false,
				// dateDisabled: false,
				// attachmentDisabled: false,
				// prevDisalbed: false,
				// nextDisalbed: false,
				// attachmentLoading: false,  //附件上传状态
				// attachmentVisible: false //附件popover显示状态
			},
			total: {
			},
			other: {
				placeholder: '输入编码、拼音或名称过滤科目',
				accountingEditSubjects: [],
				accountingEditSubjectOptions: [],
				isRenderScroll: true,
				summarys: [],
				editStatus: EDIT_STATUS,			//默认为新增
				mouseHoverRow: undefined,		//鼠标当前悬停的行信息
				isShow: false,  //控制数量外币列显隐
				index: 0,				//当前操作行
				quantityAndForeignCurrencyTitle: '数量/外币',
				quantityAndForeignCurrencyWidth: 120,
				isDisplayQuantityColumn: false,
				hidePopover: false,
				summaryWidth: 100,
				isInsert: false,    //是否为插入凭证
				templates: [],
				btnStatus: false, //按钮置灰，防止重复提交
				detailsScrollToRow: 0,
				isClickCancelBtn: false, // 是否点击会计科目列的辅助取消按钮
				defaultLength: 5, 	//默认初始行数
				auxBtnStyle: { display: 'none' },
				cellAuxStyle: '',//会计科目 当编辑辅助项时，单元格样式
				certificateBodyScrollY: 0,
				isEnable: false,
				docs: [],
				keyRandom: 0,
				isAutoEqualAmount: true,
				error: {},
				fromPage: 'app-proof-of-charge-common-edit'
			}
		}
	}
}

export function find(arr, fieldName, value) {
	let item

	if (List.isList(arr)) {
		for (var i = 0; i < arr.size; i++) {
			if (arr.get(i).get(fieldName) == value) {
				item = arr.get(i).toJS()
				break
			}
		}
	} else {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i][fieldName] == value) {
				item = arr[i]
				break
			}
		}
	}

	return item
}
//去除千分位

export function clearThousandsPosition(num) {
	if (num && num.toString().indexOf(',') > -1) {
		let x = num.toString().split(',')
		return parseFloat(x.join(""))
	} else {
		return Number(num)
	}
}

export const STATUS_VOUCHER_NOT_AUDITED = 1000020001       //未审核
export const STATUS_VOUCHER_AUDITED = 1000020002           //已审核
export const STATUS_VOUCHER_REJECTED = 1000020003					 //已驳回

export const ADD_STATUS = 1        //新增
export const VIEW_STATUS = 2       //查看
export const EDIT_STATUS = 3       //编辑

export const MOVEROW_UP = 0				 //向上移动行
export const MOVEROW_DOWN = 1			 //向下移动行

export const DIRECTION_DEBIT = 0			//借方
export const DIRECTION_CREDIT = 1			//贷方

export const ARROWUP = 38 //上键
export const ARROWDOWN = 40 //下键
export const ARROWLEFT = 37 //左键
export const ARROWRIGHT = 39 //右键

//grid的行高
export const GRID_ROW_HEIGHT = 50
export const GRID_HEADER_HEIGHT = 73
export const GRID_FOOTER_HEIGHT = 50

export const MAX_ATTACH_COUNT = 999   //附件数上限

export const ALREADY_FIRST_CERTIFICATE = 70080  //已经是第一张凭证
export const ALREADY_LAST_CERTIFICATE = 70081   //已经是最后一张凭证
export const NOT_FOUND_CERTIFICATE = 70037   //没有找到对应凭证

export const ACCOUNTTYPE_ASSETS = 5000010001  						//资产
export const ACCOUNTTYPE_LIABILITIES = 5000010002  				//负债
export const ACCOUNTTYPE_COMMON = 5000010003  						//共同
export const ACCOUNTTYPE_RIGHTSANDINTERSETS = 5000010004  //权益
export const ACCOUNTTYPE_COST = 5000010005  							//成本
export const ACCOUNTTYPE_PROFITANDLOSS = 5000010006  			//损益
