import { consts, common } from 'edf-constant';
import moment from 'moment';
import { fromJS } from 'immutable';

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-proceeds-card',
		id: 'ttk-scm-app-proceeds-card',
		onMouseDown: '{{$mousedown}}',
		children: [{
			name: 'audited',
			component: '::img',
			className: 'ttk-scm-app-proceeds-card-audit-tag',
			src: './vendor/img/scm/audited.png',
			_visible: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved}}'
		}, {
			name: 'header',
			component: 'Layout',
			className: 'ttk-scm-app-proceeds-card-header',
			children: [{
				name: 'left',
				component: 'Layout',
				className: 'ttk-scm-app-proceeds-card-header-left',
				children: [{
					name: 'page',
					component: 'Button.Group',
					className: 'page-prev-next',
					children: [{
						name: 'prev',
						component: 'Button',
						icon: 'left',
						disabled: '{{data.other.prevDisalbed}}',
						title: '上一张',
						onClick: '{{$prev}}'
					}, {
						name: 'next',
						component: 'Button',
						icon: 'right',
						disabled: '{{data.other.nextDisalbed}}',
						title: '下一张',
						onClick: '{{$next}}'
					}]
				}, {
					name: 'setting',
					component: 'Icon',
					className: 'btn setting',
					fontFamily: 'edficon',
					type: 'shezhi',
					title: '设置',
					//disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
					//onClick: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY ? "" : $setting}}'
					onClick: '{{$setting}}'
				}]
			}, {
				name: 'right',
				component: 'Layout',
				className: 'ttk-scm-app-proceeds-card-header-right',
				children: [{
					name: 'shortcut',
					component: '::span',
					children: '{{$renderPopover()}}'
				}, {
					name: 'add',
					component: 'Button',
					type: 'primary',
					className: 'app-sa-delivery-card-header-right-but',
					onClick: '{{function(){$save(true)}}}',
					_visible: '{{!data.other.isSaveSuccess}}',
					//disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
					children: '保存并新增'
				}, {
					name: 'add',
					component: 'Button',
					_visible: '{{data.other.isSaveSuccess}}',
					className: 'app-sa-delivery-card-header-right-but',
					onClick: '{{function(){$add()}}}',
					//disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
					children: '新增'
				}, {
					name: 'save',
					component: 'Button',
					_visible: '{{!data.other.isSaveSuccess}}',
					//disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
					onClick: '{{function(){$save(false)}}}',
					children: '保存'
				}, {
					name: 'audit',
					component: 'Button',
					// type: 'bluesky',
					_visible: '{{data.other.isSaveSuccess && (data.other.sourceVoucherTypeId != data.consts.VOUCHERTYPE_Delivery)}}',
					//disabled: '{{data.other.pageStatus === data.consts.pageStatus.ADD}}',
					onClick: '{{$audit}}',
					children: '{{$getAuditBtnText()}}'
					// children:'审核'
				}, {
					name: 'history',
					component: 'Button',
					// type: 'bluesky',
					onClick: '{{$history}}',
					// className: 'app-sa-delivery-card-header-right-but',
					children: '历史单据'
				}, {
					name: 'more',
					component: 'Dropdown',
					overlay: {
						name: 'menu',
						component: 'Menu',
						onClick: '{{$moreMenuClick}}',
						children: [{
							name: 'del',
							component: 'Menu.Item',
							key: 'del',
							disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY || data.other.pageStatus === data.consts.pageStatus.ADD || data.other.sourceVoucherTypeId == data.consts.VOUCHERTYPE_Delivery}}',
							children: '删除'
						}/*, {
							name: 'pay',
							component: 'Menu.Item',
							key: 'pay',
							disabled: '{{data.other.pageStatus === data.consts.pageStatus.ADD}}',
							children: '付款'
						}*/]
					},
					children: {
						name: 'internal',
						component: 'Button',
						// className: 'app-sa-delivery-card-header-right-but',
						children: ['更多', {
							name: 'down',
							component: 'Icon',
							type: 'down'
						}]
					}
				}]
			}]
		}, {
			name: 'content',
			component: '::div',
			className: 'ttk-scm-app-proceeds-card-content',
			children: [{
				name: 'title',
				component: 'Layout',
				className: 'ttk-scm-app-proceeds-card-title',
				children: [{
					name: 'left',
					component: 'Layout',
					className: 'ttk-scm-app-proceeds-card-title-left',
					children: [{
						name: 'docCode',
						component: '::div',
						_visible: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved}}',
						children: [{
							name: 'title',
							component: '::span',
							children: '凭证字号：'
						}, {
							name: 'code',
							component: '::a',
							children: "{{$renderPZZH()}}",
							//children: '{{"记-"+data.form.docCode}}',
							onClick: '{{$docCode}}'
						}]
					}]
				}, {
					name: 'center',
					component: '::div',
					className: 'ttk-scm-app-proceeds-card-title-center',
					children: {
						name: 'title',
						component: '::h1',
						style: { fontWeight: 'bold' },
						children: '收款单'
					}
				}, {
					name: 'right',
					component: 'Layout',
					className: 'ttk-scm-app-proceeds-card-title-right',
					children: [{
						name: 'title',
						component: '::span',
						children: '{{data.form.code ? "单据编号：" : ""}}'
					}, {
						name: 'code',
						component: '::span',
						//className: 'code',
						//style: { marginRight: 10 },
						children: '{{data.form.code || ""}}'
					}, {
						name: 'attachment',
						component: 'Attachment',
						status: '{{$getVoucherVisible() ? 0 :1}}',
						data: '{{data.form.attachmentFiles}}',
						onDownload: '{{$download}}',
						loading: '{{data.form.attachmentLoading}}',
						visible: '{{data.form.attachmentVisible}}',
						onDel: '{{$getVoucherVisible() ? $delFile : null}}',
						uploadProps: {
							disabled: '{{!($getVoucherVisible())}}',
							action: '/v1/edf/file/upload', //上传地址,
							headers: '{{$getAccessToken()}}',
							accept: '', //接受的上传类型
							data: { 'fileClassification': 'ATTACHMENT' },
							onChange: '{{$attachmentChange}}',
							beforeUpload: '{{$beforeUpload}}'
						}
					}]
				}]
			}, {
				name: 'formHeader',
				component: 'Form',
				className: 'ttk-scm-app-proceeds-card-form-header',
				children: '{{$renderFormContent()}}'
			}, {
				name: 'details',
				component: 'DataGrid',
				ellipsis: true,
				className: 'ttk-scm-app-proceeds-card-form-details',
				headerHeight: 35,
				rowHeight: 35,
				footerHeight: 35,
				rowsCount: '{{data.form.details.length}}',
				enableSequence: true,
				startSequence: 1,
				enableSequenceAddDelrow: '{{$getVoucherVisible() ? true : false}}',
				sequenceFooter: {
					name: 'footer',
					component: 'DataGrid.Cell',
					children: '合计'
				},
				key: '{{data.other.detailHeight}}',
				readonly: false,
				style: '{{{return{height: data.other.detailHeight}}}}',
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
					// flexGrow: 1,
					width: 198,
					header: {
						name: 'header',
						className: 'ant-form-item-required',
						component: 'DataGrid.Cell',
						children: '收款类型'
					},
					cell: {
						name: 'cell',
						component: '{{$isFocus(_ctrlPath) && $getVoucherVisible() ? "Cascader" : "DataGrid.TextCell"}}',
						className: '{{$getCellClassName(_ctrlPath)+($isFocus(_ctrlPath) && $getVoucherVisible() ? "" : " mk-datagrid-cellContent-left")}}',
						disabled: '{{!($getVoucherVisible())}}',
						value: '{{$isFocus(_ctrlPath) && $getVoucherVisible() ? data.form.details[_rowIndex].businessTypeArrName : data.form.details[_rowIndex] && data.form.details[_rowIndex].businessTypeName}}',
						title: '{{$isFocus(_ctrlPath) && $getVoucherVisible() ? data.form.details[_rowIndex].businessTypeArrName : data.form.details[_rowIndex] && data.form.details[_rowIndex].businessTypeName}}',
						onChange: '{{$onFieldChange({ id: "data.form.details."+_rowIndex+".businessTypeId",' +
						'name: "data.form.details."+_rowIndex+".businessTypeName",' +
						'arrName: "data.form.details."+_rowIndex+".businessTypeArrName",' +
						'fatherName: "data.form.details."+_rowIndex+".businessTypeFatherName",' +
						'calcObject: "data.form.details."+_rowIndex+".calcObject"}, "data.other.businessTypes", _rowIndex, data.form.details[_rowIndex])}}',
						onFocus: '{{$isFocus(_ctrlPath) ? "" : $cardFocus}}',
						options: '{{data.other.businessTypes}}',
						allowClear: false,
						onPopupVisibleChange: '{{$onPopupVisibleChange}}',
						popupClassName: "ttk-scm-app-proceeds-card-Cascader",
						tip: true,
						// filedNames:{ label: 'name', value: 'id'},
						placeholder:'',
						expandTrigger: "hover",
						_excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
						_power: '({rowIndex}) => rowIndex'
					}
				}, {
					name: 'deptPerson',
					component: 'DataGrid.Column',
					columnKey: 'deptPerson',
					flexGrow: 1,
					width: 138,
					header: {
						name: 'header',
						//className: 'ant-form-item-required',
						component: 'DataGrid.Cell',
						children: '往来单位/个人'
					},
					cell: {
						name: 'cell',
						component: '{{$isFocus(_ctrlPath) && $getVoucherVisible() ? $deptPersonReadonly(_rowIndex) ? "Select" : "DataGrid.TextCell" : "DataGrid.TextCell"}}',
						className: '{{$deptPersonReadonly(_rowIndex) ? $getCellClassName(_ctrlPath)+($isFocus(_ctrlPath) && $getVoucherVisible() && $deptPersonReadonly(_rowIndex) ? "" : " mk-datagrid-cellContent-left") : $getCellClassName(_ctrlPath) + "ttk-scm-app-proceeds-card-cell-disabled"}}',
						showSearch: true,
                        enableTooltip: true,
                        allowClear: false,
						filterOption: '{{function(a,b){return $filterOptionArchives("deptPersonList",a,b)}}}',
						tip: true,
						dropdownMatchSelectWidth: false,
                        dropdownStyle: { width: '225px' },
						disabled: '{{!($getVoucherVisible())}}',
						value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].deptPersonName}}',
						onChange: '{{$onFieldChange({ id: "data.form.details."+_rowIndex+".deptPersonId",' +
						'name: "data.form.details."+_rowIndex+".deptPersonName"}, "data.other.deptPersonList", _rowIndex, data.form.details[_rowIndex])}}',
						onFocus: '{{$deptPerson}}',
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.deptPersonList && data.other.deptPersonList[_lastIndex].id}}',
							children: '{{data.form.codeDisplay ? data.other.deptPersonList && (data.other.deptPersonList[_lastIndex].name) : data.other.deptPersonList && (data.other.deptPersonList[_lastIndex].code + " " + data.other.deptPersonList[_lastIndex].name)}}',
							_power: 'for in data.other.deptPersonList'
						},
						_excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
						_power: '({rowIndex}) => rowIndex',
						dropdownFooter: {
							name: 'add',
							type: 'primary',
							component: 'Button',
							style: { width: '100%', borderRadius: '0' },
							children: '新增',
							onClick: '{{function(){$addDeptPerson(_rowIndex)}}}'
						},
					}
				}, {
					name: 'department',
					component: 'DataGrid.Column',
					columnKey: 'department',
					_visible: '{{$getColumnVisible("department")}}',
					flexGrow: 1,
					width: 138,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '部门'
					},
					cell: {
						name: 'cell',
						component: '{{$isFocus(_ctrlPath) && $getVoucherVisible() ? "Select" : "DataGrid.TextCell"}}',
						className: '{{$getCellClassName(_ctrlPath)+($isFocus(_ctrlPath) && $getVoucherVisible() ? "" : " mk-datagrid-cellContent-left")}}',
						showSearch: true,
                        enableTooltip: true,
                        allowClear: true,
						filterOption: '{{function(a,b){return $filterOptionArchives("departmentList",a,b)}}}',
						tip: true,
						disabled: '{{!($getVoucherVisible())}}',
						value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].departmentName}}',
						onChange: '{{$onFieldChange({ id: "data.form.details."+_rowIndex+".departmentId",' +
						'name: "data.form.details."+_rowIndex+".departmentName"}, "data.other.departmentList", _rowIndex, data.form.details[_rowIndex])}}',
						onFocus: '{{function(){$getDepartment({ entity: { isEnable: true } }, "data.other.departmentList")}}}',
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.departmentList && data.other.departmentList[_lastIndex].id}}',
							children: '{{data.other.departmentList && (data.other.departmentList[_lastIndex].name)}}',
							_power: 'for in data.other.departmentList'
						},
						_excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
						_power: '({rowIndex}) => rowIndex',
						dropdownFooter: {
							name: 'add',
							type: 'primary',
							component: 'Button',
							style: { width: '100%', borderRadius: '0' },
							children: '新增',
							onClick: '{{function(){$addUnitProject("app-card-department", "department", "部门", _rowIndex)}}}'
						},
					}
				}, {
					name: 'project',
					component: 'DataGrid.Column',
					columnKey: 'project',
					_visible: '{{$getColumnVisible("project")}}',
					flexGrow: 1,
					width: 138,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '项目'
					},
					cell: {
						name: 'cell',
						component: '{{$isFocus(_ctrlPath) && $getVoucherVisible() ? "Select" : "DataGrid.TextCell"}}',
						className: '{{$getCellClassName(_ctrlPath)+($isFocus(_ctrlPath) && $getVoucherVisible() ? "" : " mk-datagrid-cellContent-left")}}',
						showSearch: true,
                        enableTooltip: true,
                        allowClear: true,
						filterOption: '{{function(a,b){return $filterOptionArchives("projectList",a,b)}}}',
						tip: true,
						disabled: '{{!($getVoucherVisible())}}',
						value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].projectName}}',
						onChange: '{{$onFieldChange({ id: "data.form.details."+_rowIndex+".projectId",' +
						'name: "data.form.details."+_rowIndex+".projectName"}, "data.other.projectList", _rowIndex, data.form.details[_rowIndex])}}',
						onFocus: '{{function(){$getProject({ entity: { isEnable: true } }, "data.other.projectList")}}}',
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.projectList && data.other.projectList[_lastIndex].id}}',
							children: '{{data.other.projectList && (data.other.projectList[_lastIndex].code+" "+data.other.projectList[_lastIndex].name)}}',
							_power: 'for in data.other.projectList'
						},
						_excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
						_power: '({rowIndex}) => rowIndex',
						dropdownFooter: {
							name: 'add',
							component: 'Button',
							type: 'primary',
							style: { width: '100%', borderRadius: '0' },
							children: '新增',
							onClick: '{{function(){$addUnitProject("app-card-project", "project", "项目", _rowIndex)}}}'
						},
					}
				}, {
					name: 'amount',
					component: 'DataGrid.Column',
					columnKey: 'amount',
					//flexGrow: 1,
					width: 108,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						className: 'ant-form-item-required',
						children: '金额'
					},
					cell: {
						name: 'cell',
						component: '{{$isFocus(_ctrlPath) && $getVoucherVisible() ? "Input.Number" : "DataGrid.TextCell"}}',
						disabled: '{{!($getVoucherVisible())}}',
						timeout: true,
						tip: true,
						precision: 2,
						interceptTab: true,
						className: '{{$getCellClassName(_ctrlPath) + " mk-datagrid-cellContent-right"}}',
						value: '{{$quantityFormat(data.form.details[_rowIndex].amount,2,($isFocus(_ctrlPath) && $getVoucherVisible()))}}',
						onChange: '{{$calc("amount", _rowIndex,data.form.details[_rowIndex])}}',
						_power: '({rowIndex}) => rowIndex'
					},
					footer: {
						name: 'footer',
						component: 'DataGrid.Cell',
						className: 'mk-datagrid-cellContent-right',
						children: '{{$sumColumn("amount")}}'
					}
				}, {
					name: 'fees',
					component: 'DataGrid.Column',
					columnKey: 'fees',
					//flexGrow: 1,
					width: 108,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '手续费'
					},
					cell: {
						name: 'cell',
						component: '{{$isFocus(_ctrlPath) && $getVoucherVisible() ? "Input.Number" : "DataGrid.TextCell"}}',
						disabled: '{{!($getVoucherVisible())}}',
						timeout: true,
						tip: true,
						regex: '^([0-9]+)(?:\.[0-9]{1,2})?$', 
						className: '{{$getCellClassName(_ctrlPath) + " mk-datagrid-cellContent-right"}}',
						value: '{{$quantityFormat(data.form.details[_rowIndex].fees,2,($isFocus(_ctrlPath) && $getVoucherVisible()))}}',
						// value: '{{$quantityFormat(data.form.details[_rowIndex].fees,2,$isFocus(_ctrlPath))}}',
						onChange: '{{$calc("fees", _rowIndex,data.form.details[_rowIndex])}}',
						_power: '({rowIndex}) => rowIndex'
					},
					footer: {
						name: 'footer',
						component: 'DataGrid.Cell',
						className: 'mk-datagrid-cellContent-right',
						children: '{{$sumColumn("fees")}}'
					}
				}, {
					name: 'quantity',
					component: 'DataGrid.Column',
					columnKey: 'quantity',
					flexGrow: 1,
					width: 198,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '备注'
					},
					cell: {
						name: 'cell',
						component: '{{$isFocus(_ctrlPath) && $getVoucherVisible() ? "Input" : "DataGrid.TextCell"}}',
						className: '{{$getCellClassName(_ctrlPath)+($isFocus(_ctrlPath) && $getVoucherVisible() ? "" : " mk-datagrid-cellContent-left")}}',
						value: '{{data.form.details[_rowIndex].remark}}',
						disabled: '{{!($getVoucherVisible())}}',
						timeout: true,
						tip: true,
						// value: '{{$quantityFormat(data.form.details[_rowIndex].remark,2,$isFocus(_ctrlPath))}}',
						// onChange: '{{$calc("remark", _rowIndex, data.form.details[_rowIndex])}}',
						onChange: '{{function(e){$inputChange("data.form.details."+_rowIndex+".remark",e.target.value)}}}',
						_power: '({rowIndex}) => rowIndex'
					}
				}]
			}, {
				name: 'footer',
				component: '::div',
				className: 'ttk-scm-app-proceeds-card-footer',
				children: {
					name: 'container',
					component: 'Layout',
					className: 'ttk-scm-app-proceeds-card-footer-container',
					children: [{
						name: 'left',
						component: 'Layout',
						className: 'ttk-scm-app-proceeds-card-footer-left',
						children: [{
							name: 'creator',
							component: 'Layout',
							children: ['制单人：', '{{data.form.creatorName}}'],
							style: { marginRight: 30 }
						}/*, {
							name: 'auditor',
							component: 'Layout',
							children: ['审核人：', '{{data.form.auditorName}}'],
						}*/]
					}, {
						name: 'right',
						component: 'Layout',
						className: 'ttk-scm-app-proceeds-card-footer-right',
						children: [{
							name: 'saveAndNew',
							component: 'Button',
							type: 'primary',
							className: 'app-sa-delivery-card-header-right-but',
							_visible: '{{!data.other.isSaveSuccess}}',
							//disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
							onClick: '{{function(){$save(true)}}}',
							children: '保存并新增'
						}, {
							name: 'save',
							component: 'Button',
							_visible: '{{!data.other.isSaveSuccess}}',
							//disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
							onClick: '{{function(){$save(false)}}}',
							children: '保存'
						}, {
							name: 'cancel',
							component: 'Button',
							_visible: '{{!data.other.isSaveSuccess}}',
							//disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
							onClick: '{{$add}}',
							children: '放弃'
						}]
					}]
				}
			}]
		}]
	};
}

export function getInitState(option) {
	return {
		data: {
			form: {
				details: [
					blankDetail,
					blankDetail,
					blankDetail,
					blankDetail,
					blankDetail
				],
				settles: [{
					bankAccountId: '',
					amount: '',
					bankAccountName: ''
				}],
				attachmentFiles: []
			},
			total: {},
			other: {
				detailHeight: 8,
				accountList: [],
				bankAccountList: [],
				pageStatus: common.commonConst.PAGE_STATUS.ADD,
				isSignAndRetreat: false,
				signAndRetreat: [{
					id: 4000100001,
					name: '即征即退'
				}, {
					id: 4000100002,
					name: '一般项目'
				}],
				defaultLength: 5, 	//默认初始行数
				MOVEROW_UP: 0,
				MOVEROW_DOWN: 1,
				isSaveSuccess: false,
				isAuditEdit: true
			},
			consts: {
				VOUCHERSTATUS_Approved: consts.consts.VOUCHERSTATUS_Approved, //已审核
				SETTLESTATUS_settled: consts.consts.SETTLESTATUS_settled, //已结清
				pageStatus: common.commonConst.PAGE_STATUS,
				VATTAXPAYER_smallScaleTaxPayer: consts.consts.VATTAXPAYER_smallScaleTaxPayer,//小规模纳税人
				VATTAXPAYER_generalTaxPayer: consts.consts.VATTAXPAYER_generalTaxPayer, //一般纳税人
				VOUCHERTYPE_Delivery: consts.consts.VOUCHERTYPE_Delivery //来源为销售单
			}
		}
	};
}

export const blankDetail = {
	calcObject: null,
	businessTypeId: null,
	businessTypeName: null,
	supplierId: null,
	customerId: null,
	departmentId: null,
	personId: null,
	projectId: null,
	amount: null,
	fees: null,
	remark: null
};
