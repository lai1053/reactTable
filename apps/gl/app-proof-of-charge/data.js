import { Map, List, fromJS } from 'immutable'
//import * as data from './data'
//import { fetch } from 'edf-utils'
import React from 'react'
import { Select } from 'edf-component'

const Option = Select.Option

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-proof-of-charge',
		id: 'app-proof-of-charge',
		onMouseDown: '{{function(e){$onMouseDown(e)}}}',
		children: [{
			name: 'header',
			component: 'Layout',
			className: 'app-proof-of-charge-header',
			_visible: '{{!data.other.copyDoc}}',//从凭证列表 的复制凭证打开的填制凭证时不显示
			children: [{
				name: 'left',
				component: 'Layout',
				className: 'app-proof-of-charge-header-left',
				children: [{
					name: 'common',
					component: 'Popover',
					trigger: 'click',
					placement: 'bottom',
					overlayClassName: 'Popover-app-proof-of-charge-template',
					_visible: '{{!data.other.isFromXdz}}',
					content: {
						name: 'menu',
						component: 'Menu',
						onClick: '{{$commonMenuClick}}',
						className: 'Popover-app-proof-of-charge-useCommon',
						children: [{
							name: 'useCommon',
							component: 'Menu.Item',
							key: 'useCommon',
							className: 'common',
							disabled: '{{$isCommonTemplateDisabled()}}',
							children: '凭证模板'
						}, {
							name: 'saveCommon',
							component: 'Menu.Item',
							className: 'common',
							key: 'saveCommon',
							children: '存为模版'
						}]
					},
					children: {
						name: 'internal',
						component: 'Button',
						className: 'app-proof-of-charge-header-left-useCommon',
						children: ['凭证模版', {
							name: 'down',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'xia',
						}]
					}
				}, {
					name: 'saveAndNew',
					component: 'Button',
					type: 'primary',
					refs: 'saveAndNew',
					onClick: "{{function(){$saveAndNew('左上角')}}}",
					disabled: "{{data.other.btnStatus}}",
					_visible: "{{$isDisplayButton('save')}}",
					children: '保存并新增'
				}, {
					name: 'save',
					component: 'Button',
					onClick: "{{function(){$save(undefined, '左上角')}}}",
					disabled: "{{data.other.btnStatus}}",
					_visible: "{{$isDisplayButton('save')}}",
					children: '保存'
				}, {
					name: 'add',
					type: 'primary',
					component: 'Button',
					onClick: '{{$newCertificate}}',
					_visible: "{{$isDisplayButton('add')}}",
					children: '新增'
				}, {
					name: 'audit',
					component: 'Button',
					_visible: "{{$isDisplayButton('audit')}}",
					onClick: '{{$audit}}',
					children: '{{$getAuditText()}}'
				}, {
					name: 'print',
					component: 'Button',
					_visible: "{{$isDisplayButton('print')}}",
					children: '打印',
					onClick: '{{$print}}'
				}, {
					name: 'more',
					component: 'Dropdown',
					_visible: "{{$isDisplayButton('more')}}",
					overlay: {
						name: 'menu',
						component: 'Menu',
						className: 'app-proof-of-charge-header-left-useCommon',
						onClick: '{{$moreMenuClick}}',
						children: [{
							name: 'del',
							component: 'Menu.Item',
							key: 'del',
							disabled: "{{$isDisplayButton('del')}}",
							children: '删除'
						}, {
							name: 'insert',
							component: 'Menu.Item',
							key: 'insert',
							// _visible: '{{!data.other.isFromXdz}}',
							_visible: "{{data.other.isFromXdz==true?false:data.other.editStatus != data.STATUS_VIEW ? true : false}}",
							children: '插入凭证'
						}]
					},
					children: {
						name: 'internal',
						component: 'Button',
						className: 'app-proof-of-charge-header-left-more',
						children: ['更多', {
							name: 'down',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'xia'
						}]
					}
				}]
			}, {
				name: 'right',
				component: 'Layout',
				className: 'app-proof-of-charge-header-right',
				_visible: '{{!data.other.isFromXdz}}',
				// _visible: '{{!data.other.copyDoc}}',//从凭证列表 的复制凭证打开的填制凭证时不显示
				children: [{
					name: 'shortcut',
					component: 'Popover',
					placement: "bottom",
					// trigger:'click',
					overlayClassName: 'app-proof-of-charge-header-right-jianpan',
					arrowPointAtCenter: true,
					content: {
						name: 'keys',
						component: 'ShortKey'
					},
					title: null,
					children: {
						component: 'Icon',
						className: 'app-proof-of-charge-header-right-iconbutton',
						fontFamily: 'edficon',
						type: 'jianpan',
						title: '快捷键',
					}
				}, {
					name: 'moreVoucher',
					component: 'Button',
					onClick: '{{$certificateManagement}}',
					children: '凭证管理'
				}, {
					name: 'page',
					component: 'Button.Group',
					className: 'page-prev-next',
					children: [{
						name: 'prev',
						component: 'Button',
						icon: 'left',
						disabled: '{{data.form.prevDisalbed}}',
						onClick: '{{$loadPrevCertificate}}'
					}, {
						name: 'next',
						component: 'Button',
						icon: 'right',
						disabled: '{{data.form.nextDisalbed}}',
						onClick: '{{$loadNextCertificate}}'
					}]
				}]
			}]
		}, {
			name: 'title',
			component: 'Layout',
			className: 'app-proof-of-charge-title',
			_visible: '{{!data.other.copyDoc}}',//从凭证列表 的复制凭证打开的填制凭证时不显示
			children: [{
				name: 'left',
				component: 'Layout',
				className: 'app-proof-of-charge-title-left',

			}, {
				name: 'center',
				component: '::div',
				className: 'app-proof-of-charge-title-center',
				children: {
					name: 'title',
					component: '::h1',
					children: '记账凭证',
				}
			}, {
				name: 'right',
				component: 'Layout',
				className: 'app-proof-of-charge-title-right',
				children: []
			}]
		}, {
			name: 'formHeader',
			component: 'Layout',
			className: 'app-proof-of-charge-form-header',
			children: [{
				name: 'code',
				component: 'Layout',
				className: 'app-proof-of-charge-form-header-code',
				children: ['记字第', {
					name: 'code',
					component: 'Input.Number',
					className: '{{data.form.redSourceDocId?"redDoc":""}}',
					disabled: '{{ data.form.codeDisabled }}',
					value: '{{data.form.code}}',
					regex: '^[0-9]+$',
					maxlength: '5',
					onPressEnter: "{{function(){$onPressEnter('code')}}}",
					onBlur: "{{function(v){$onFieldChange(_ctrlPath, data.form.code, v)}}}"
					//onChange: "{{function(e){$sf('data.form.code',e.target.value)}}}",
					// onChange: "{{function(e){/\^[0-9]+$/.test(e.target.value+'') ? $sf('data.form.code',e.target.value) : '';$onFieldChange(_ctrlPath, data.form.code, e.target.value)}}}"
				}]
			}, {
				name: 'date',
				component: 'Layout',
				className: 'app-proof-of-charge-form-header-date',
				children: ['日期', {
					name: 'date',
					component: 'DatePicker',
					allowClear: false,
					className: 'app-proof-of-charge-form-header-date-picker',
					value: '{{$stringToMoment(data.form.date)}}',
					onChange: `{{function(d){$sf('data.form.date',$momentToString(d,'YYYY-MM-DD'));
														$onFieldChange(_ctrlPath, data.form.date, $momentToString(d,'YYYY-MM-DD'))}}}`,
					disabledDate: `{{function(current){ var disabledDate = new Date(data.other.disabledDate)
													return current && current.valueOf() < disabledDate
					}}}`,
					disabled: '{{ data.form.dateDisabled }}'
				}]
			}, {
				name: 'titleshow',
				component: 'Layout',
				_visible: false,
				className: 'app-proof-of-charge-form-header-titleshow',
				children: '{{$renderFormHeaderTitleShow(data.form.date)}}'
			},
			{
				name: 'audited',
				component: '::img',
				className: 'app-proof-of-charge-title-right-tag',
				src: './vendor/img/gl/audited_charge.png',
				_visible: '{{$getAudited()}}'
			},
			{
				name: 'attachment',
				component: 'Layout',
				className: 'app-proof-of-charge-form-header-attachment',
				children: ['附单据', {
					name: 'attachment',
					component: 'Input.Number',
					defaultValue: 0,
					maxlength: 3,
					nullToZero: true,
					className: 'app-proof-of-charge-form-header-attachment-number',
					regex: '^([0-9]+)$',
					disabled: '{{ data.form.attachmentDisabled }}',
					value: '{{ data.form.attachCount }}',
					onPressEnter: "{{function(){$onPressEnter('attachment')}}}",
					onBlur: "{{function(v){$onFieldChange(_ctrlPath, data.form.attachCount, v)}}}"
					//onChange: "{{function(v){$sf('data.form.attachCount',v)}}}"
				}, '张', {
						name: 'attachmentItem',
						component: 'Attachment',
						//placement: 'right',
						status: '{{data.form.attachmentStatus}}',
						data: '{{data.form.attachmentFiles}}',
						onDownload: '{{$download}}',
						isFromDocList: '{{data.other.copyDocId}}',
						popupContainerModal: '{{data.other.popupContainerModal}}',
						loading: '{{data.form.attachmentLoading}}',
						visible: '{{data.form.attachmentVisible}}',
						onDel: '{{$delFile}}',
						uploadProps: {
							action: '{{$getActionUrl()}}', //上传地址,
							// headers: '{{$getAccessToken()}}',
							accept: '', //接受的上传类型
							//attachementVisible: '{{$attachementVisible}}'
							data: { "fileClassification": "ATTACHMENT" },
							onChange: '{{$attachmentChange}}',
							beforeUpload: '{{$beforeLoad}}',
						}
					}]
			}]
		}, {
			name: 'center',
			component: '::div',
			className: 'gridDiv',
			children: [
				{
					name: 'toPrevPage',
					component: 'Icon',
					fontFamily: 'edficon',
					className: '{{data.other.toPrevPage}}',
					type: 'zuo',
					_visible: "{{data.other.copyType == 'batchCopy'}}",
					onClick: "{{$loadPagingDoc('left')}}"
				}, {
					name: 'details',
					component: 'DataGrid',
					className: 'app-proof-of-charge-form-details',
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
					onKeyDown: '{{$selfGridKeydown}}',
					scrollToRow: '{{data.other.detailsScrollToRow}}',
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
								className: 'app-proof-of-charge-form-details-label',
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
							className: "{{$isFocus(_ctrlPath) ? 'summaryleft app-proof-of-charge-cell editable-cell':'summaryleft'}}",
							defaultActiveFirstOption: false,
							showArrow: false,
							optionFilterProp: 'children',
							filterOption: true,
							dropdownClassName: 'app-proof-of-charge-form-details-select',
							align: 'left',
							value: `{{{
									if(!data.form.details[_rowIndex].summary) return
									var ret = (data.form.details[_rowIndex].summary.name ||
														 data.form.details[_rowIndex].summary)
									return ret
								}}}`,
							// onChange: `{{$onSummaryChange(_rowIndex)}}`,
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
								className: 'app-proof-of-charge-form-details-label',
								children: '会计科目'
							}]
						},
						cell: {
							name: 'cell',
							component: "{{$isFocus(_ctrlPath) ?$renderSelectComponent(_ctrlPath):'SubjectDisplay' }}",
							className: "{{$isReadOnly(_ctrlPath) == false ? $isFocus(_ctrlPath) ? 'app-proof-of-charge-cell editable-cell' :'' + ' app-proof-of-charge-form-cell-subjects' : ' app-proof-of-charge-form-cell-subjects'}}",
							//getPopupContainer: '{{function(){return document.querySelector(".app-proof-of-charge")}}}',
							onSearch: '{{function(v){$lazySearch(v)}}}',
							filterOption: '{{$filterOption}}',
							showArrow: false,
							showSearch: true,
							id: 'account',
							selectRows: 50,
							showBalanceContent: '{{$showBalanceContent}}',
							selectPagination: '{{data.other.isEnable}}',
							keyRandom: '{{data.other.keyRandom}}',
							selectSubject: '{{function(){return $clickSubject(data.form.details[_rowIndex].accountingSubject.id)}}}',
							updateAuxItem: '{{$updateAuxItem}}',
							dropdownClassName: 'app-proof-of-charge-form-details-select app-proof-of-charge-form-details-select-subjects',
							align: 'left',
							placeholder: '{{data.other.placeholder}}',
							value: `{{{
									if(!data.form.details[_rowIndex].accountingSubject) return
									return data.form.details[_rowIndex].accountingSubject.id
								}}}`,
							onFocus: "{{function(){$onFieldFocus(_ctrlPath)} }}",
							onBlur: '{{function(){$accountingSubjectBlur()}}}',
							onSelect: "{{$onSubjectSelect(_ctrlPath, _rowIndex, window.accountingSubjects)}}",
							//children: '{{data.other.accountingSubjectOptions}}',							
							children: '{{$renderCellContent(data.other.keyRandom,window.accountingSubjectOptions)}}',
							dropdownFooter: {
								name: 'add',
								type: 'default',
								component: 'Button',
								className: 'app-proof-of-charge-form-details-account-add',
								style: { width: '100%', borderRadius: '0', height: '30px' },
								children: [{
									name: 'addIcon',
									component: 'Icon',
									className: 'app-proof-of-charge-form-details-account-add-icon',
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
								className: 'app-proof-of-charge-form-details-label',
								children: '{{data.other.quantityAndCurrencyTitle}}'
							}]
						},
						cell: {
							name: 'cell',
							component: "QuanAndForeCurrency",
							noTabKey: true,
							//className: "{{$getCellClassName(_ctrlPath) }}",
							className: "{{$isFocus(_ctrlPath) ? 'app-proof-of-charge-cell editable-cell':''}}",
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
							className: 'app-proof-of-charge-form-details-label',
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
							timeout: true,							
							interceptTab: true,						
							_power: '({rowIndex})=>rowIndex'
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
							className: 'app-proof-of-charge-form-details-label',
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
							_power: '({rowIndex})=>rowIndex'
						},
						footer: {
							name: 'footer',
							component: 'MoneyCell',
							value: "{{$sum(data.form.details, 'creditAmount')}}"
						}
					}]
				}, {
					name: 'toNextPage',
					component: 'Icon',
					fontFamily: 'edficon',
					className: '{{data.other.toNextPage}}',
					type: 'you',
					_visible: "{{data.other.copyType == 'batchCopy'}}",
					onClick: "{{$loadPagingDoc('right')}}"
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
		}, {
			name: 'footer',
			component: 'Layout',
			className: 'app-proof-of-charge-footer',
			children: [{
				name: 'left',
				component: 'Layout',
				className: 'app-proof-of-charge-footer-left',
				children: [{
					name: 'creator',
					component: '::h3',
					children: "{{ '制单人:' + (data.form.creator ? data.form.creator : '') }}",
					style: { marginRight: 150 }
				}, {
					name: 'approver',
					component: '::h3',
					children: "{{ '审核人:' + (data.form.auditor ? data.form.auditor : '') }}",
				}]
			}, {
				name: 'right',
				component: 'Layout',
				className: 'app-proof-of-charge-footer-right',
				_visible: '{{!data.other.copyDoc}}',//从凭证列表 的复制凭证打开的填制凭证时不显示
				children: [{
					name: 'saveAndNew',
					component: 'Button',
					type: 'primary',
					onClick: "{{function(){$saveAndNew('右下角')}}}",
					disabled: "{{data.other.btnStatus}}",
					_visible: "{{$isDisplayButton('save')}}",
					children: '保存并新增'
				}, {
					name: 'save',
					component: 'Button',
					onClick: "{{function(){$save(undefined, '右下角')}}}",
					disabled: "{{data.other.btnStatus}}",
					_visible: "{{$isDisplayButton('save')}}",
					children: '保存',
					style: { width: 80 }
				}]
			}, {
				name: 'currentPage',
				component: '::div',
				className: 'app-proof-of-charge-footer-currentPage',
				_visible: "{{data.other.copyType == 'batchCopy'}}",
				children: '{{$getPageCount()}}'
			}]
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
				adjunctInfo: {
					album: [],
					isVisible: false,
					adjunctSize: 0,
				},
				isAttachCount: true,   //是否增加附件的数量（自动修改附件文本框的值）
				attachCount: 0,
				enclosures: [],
				attachmentFiles: fromJS([]),
				attachmentStatus: 0,  //附件status 0: 上传  1: 只读
				docType: '记',
				certificateStatus: STATUS_VOUCHER_NOT_AUDITED,  //单据状态  审核或未审核
				codeDisabled: false,
				dateDisabled: false,
				attachmentDisabled: false,
				prevDisalbed: false,
				nextDisalbed: false,
				attachmentLoading: false,  //附件上传状态
				attachmentVisible: false //附件popover显示状态
			},
			total: {
			},
			other: {
				placeholder: '输入编码、拼音或名称过滤科目',
				accountingSubjects: [],
				accountingSubjectOptions: [],
				summarys: [],
				editStatus: ADD_STATUS,			//默认为新增
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
				keyRandom: 0
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
