export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'inv-app-sales-nsjctz2',
		onMouseDown: '{{$mousedown}}',
		children: {
			name: 'spin',
			component: 'Spin',
			tip: '加载中...',
			delay: 0.01,
			spinning: '{{data.loading}}',
			// _visable: false,
			children: [{
				name: 'top',
				component: '::div',
				className: 'inv-app-test-header',
				children: [{
					name: 'title',
					component: '::div',
					className: 'title',
					children: '未开具发票'
				}, {
					name: 'right',
					component: '::div',
					className: 'right',
					children: [
						{
							name: "row2",
							component: "Row",
							className: "",
							_visible:"{{data.form.fphmVisible}}",
							children: [
								{
									name: "col1",
									component: "Col",
									span: 10,
									className:'{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
									children: "发票号码："
								},
								{
									name: "col2",
									style:
										'{{{return{"margin-top":"0px"}}}}',
									component: "Col",
									span: 14,
									_visible: "{{$isReadOnly()}}",
									children: "{{data.form.fphm}}"
								},
								{
									name: "col3",
									className: "",
									component: "Col",
									span: 14,
									_visible: "{{!$isReadOnly()}}",
									children: {
										name: "tooltips",
										component: "Tooltip",
										overlayClassName:
											"-sales-error-toolTip",
										placement: "left",
										getPopupContainer:
											"{{$handleGetPopupContainer}}",
										title: "{{data.error.fphm}}",
										visible:
											'{{data.error.fphm && data.error.fphm.indexOf("不能为空")==-1}}',
										children: {
											className:
												'{{data.error.fphm?"-sales-error":""}}',
											name: "input",
											component: "Input",
											maxLength: 8,
											disabled: true,
											onChange:
												'{{function(e){$handleFieldChangeV("data.form.fphm",e.target.value,true)}}}',
											value: "{{data.form.fphm}}"
										}
									}
								}
							]
						},
						{
						name: 'row3',
						component: 'Row',
						className: '',
						children: [{
							name: 'col1',
							component: 'Col',
							span: 10,
							className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
							children: '开票日期：',
						}, {
							name: 'col2',
							style: '{{{return{"margin-top":"0px"}}}}',
							component: 'Col',
							span: 14,
							_visible: '{{$isReadOnly()}}',
							children: "{{data.form.kprq}}",
						}, {
							name: 'col3',
							className: '',
							component: 'Col',
							span: 14,
							_visible: '{{!$isReadOnly()}}',
							children: {
								name: 'tooltips-kprq',
								component: 'Tooltip',
								overlayClassName: '-sales-error-toolTip',
								getPopupContainer: '{{$handleGetPopupContainer}}',
								title: '{{data.error.kprq}}',
								visible: '{{data.error.kprq && data.error.kprq.indexOf("不能为空")==-1}}',
								placement: 'left',
								children: {
									name: 'input',
									component: 'DatePicker',
									className: '{{data.error.kprq?"-sales-error":""}}',
									disabledDate: '{{$disabledDate}}',
									defaultPickerValue: "{{$getDefaultPickerValue()}}",
									defaultValue: "{{$stringToMoment((data.form.kprq),'YYYY-MM-DD')}}",
									disabled: '{{$notAllowEdit()}}',
									onChange: '{{function(v){$handleFieldChangeV("data.form.kprq",$momentToString(v,"YYYY-MM-DD"),true)}}}',
									allowClear: true,
									format: "YYYY-MM-DD",
									placeholder: '选择开票日期',
									getCalendarContainer: '{{$handleGetPopupContainer}}',
									value: "{{$stringToMoment((data.form.kprq),'YYYY-MM-DD')}}"
								}
							}
						}]
					}
					]
				}]
			}, {
				name: 'details',
				component: 'DataGrid',
				className: 'inv-app-test-details',
				headerHeight: 35,
				rowHeight: 24,
				rowsCount: '{{data.form.details.length}}',
				key: '{{data.other.randomKey}}',
				readonly: '{{$isReadOnly()}}', //不允许增减行
				enableAddDelrow: true,
				// style: '{{{return{height: data.other.detailHeight}}}}',
				onAddrow: "{{$addRow}}",
				onDelrow: "{{$delRow}}",
				onKeyDown: '{{$gridKeydown}}',
				ellipsis: true,
				footerHeight: 24,
				heightFromRowsCount: true,
				sequenceFooter: {
					name: 'footer',
					component: 'DataGrid.Cell',
				},
				columns: [
					{
						name: 'hwlxDm',
						component: 'DataGrid.Column',
						columnKey: 'hwlxDm',
						width: 200 * 1.5,
						// flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
							children: '货物类型'
						},
						cell: {
							name: 'cell',
							component: '{{!$isReadOnly()?"Select":"DataGrid.TextCell"}}',
							// disabled: '{{$notAllowEdit()}}',
							dropdownStyle: { width: '125px' },
							allowClear: true,
							dropdownMatchSelectWidth: false,
							className: '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].hwlxDm?"-sales-error":""}}',
							value: '{{!$isReadOnly()?data.form.details[_rowIndex].hwlxDm:((data.hwlxList || []).find(function(f){return f.hwlxDm===data.form.details[_rowIndex].hwlxDm})||{}).hwlxMc}}',
							onChange: '{{function(v){$onCellChange(_rowIndex,"hwlxDm",v)}}}',
							children: {
								_visible: '{{!$isReadOnly()}}',
								name: '{{"item-hwlx"+_rowIndex}}',
								component: 'Select.Option',
								value: '{{data.form.details[_rowIndex].hwlxList[_lastIndex].hwlxDm}}',
								children: '{{data.form.details[_rowIndex].hwlxList[_lastIndex].hwlxMc}}',
								className: '-ttk-option',
								_power: 'for in data.form.details._rowIndex.hwlxList',
							},
							_power: '({rowIndex}) => rowIndex',
						},
						footer: {
							name: 'footer',
							component: 'DataGrid.Cell',
							className: 'ant-form-item-center bg',
							//title: '{{$taxAmountTotal(false)}}',
							children: '合计：',
						}
					},
					{
						name: 'jsfsDm',
						component: 'DataGrid.Column',
						columnKey: 'jsfsDm',
						width: 200 * 0.9,
						// flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
							children: '计税方式'
						},
						cell: {
							name: 'cell',
							component: '{{!$isReadOnly()?"Select":"DataGrid.TextCell"}}',
							// disabled: '{{$notAllowEdit()}}',
							dropdownStyle: { width: '125px' },
							dropdownMatchSelectWidth: false,
							allowClear: true,
							className: '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].jsfsDm?"-sales-error":""}}',
							value: '{{((data.form.details && data.form.details[_rowIndex].jsfsList || []).find(function(f){return f.jsfsDm===data.form.details[_rowIndex].jsfsDm})||{})[!$isReadOnly()?"jsfsDm":"jsfsMc"]}}',
							onChange: '{{function(v){$onCellChange(_rowIndex,"jsfsDm",v)}}}',
							children: {
								_visible: '{{!$isReadOnly()}}',
								name: '{{"item-jsfs"+_rowIndex}}',
								component: 'Select.Option',
								value: '{{data.form.details[_rowIndex].jsfsList[_lastIndex].jsfsDm}}',
								children: '{{data.form.details[_rowIndex].jsfsList[_lastIndex].jsfsMc}}',
								className: '-ttk-option',
								_power: 'for in data.form.details._rowIndex.jsfsList',
							},
							_power: '({rowIndex}) => rowIndex',
						}
					},
					{
						name: 'je',
						component: 'DataGrid.Column',
						columnKey: 'je',
						width: 220 * 0.9,
						// flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
							children: '不含税金额'
						},
						cell: {
							name: 'cell',
							component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
							executeBlur: true,
							onBlur: '{{function(){$inputBlur(_rowIndex,"je")}}}',
							precision: 2,
							disabled: '{{$notAllowEdit()}}',
							className: "{{$getCellClassName(_ctrlPath)}}",
							align: 'right',
							style: '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].je?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
							value: '{{$quantityFormat(data.form.details[_rowIndex].je,2,$isFocus(_ctrlPath),false,true)}}',
							title: '{{$quantityFormat(data.form.details[_rowIndex].je,2,false,false)}}',
							onChange: '{{function(v){$onCellChange(_rowIndex,"je",v)}}}',
							_power: '({rowIndex}) => rowIndex',
						},
						footer: {
							name: 'footer',
							component: 'DataGrid.Cell',
							className: 'txt-right',
							title: '{{$amountTotal(false)}}',
							children: '{{$quantityFormat($amountTotal(false),2,false,false)}}',
						},
					},
					{
						name: 'slv',
						component: 'DataGrid.Column',
						columnKey: 'slv',
						width: 90 * 0.9,
						// flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
							children: '税率'
						},
						cell: {
							name: 'cell',
							component: 'Row',
							disabled: '{{$notAllowEdit()}}',
							children: [{
								_visible: '{{$isReadOnly()}}',
								name: 'col',
								component: '::div',
								className: '-mx-cell',
								align: 'right',
								title: '{{data.form.details[_rowIndex].slv!==undefined&&((data.form.details[_rowIndex].slv || 0)*100 +"%")}}',
								children: '{{data.form.details[_rowIndex].slv!==undefined&&((data.form.details[_rowIndex].slv || 0)*100 +"%")}}',
							}, {
								_visible: '{{!$isReadOnly()}}',
								name: '{{"sales-zzsfp-cell-slv-"+_rowIndex}}',
								component: 'Select',
								value: '{{data.form.details[_rowIndex].slv}}',
								disabled: '{{$notAllowEdit()}}',
								allowClear: true,
								dropdownStyle: { width: '100px' },
								dropdownMatchSelectWidth: false,
								className: '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].slv?"-sales-error":""}}',
								onChange: '{{function(v){$onCellChange(_rowIndex,"slv",v)}}}',
								children: {
									name: '{{"item-slv"+_rowIndex}}',
									component: 'Select.Option',
									value: '{{data.form.details[_rowIndex].slList[_lastIndex].slv}}',
									children: '{{data.form.details[_rowIndex].slList[_lastIndex].slvMc}}',
									className: '-ttk-option',
									_power: 'for in data.form.details._rowIndex.slList',
								},
							}],
							_power: '({rowIndex}) => rowIndex',
						}
					},
					{
						name: 'se',
						component: 'DataGrid.Column',
						columnKey: 'se',
						width: 200 * 0.9,
						// flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
							children: '税额'
						},
						cell: {
							name: 'cell',
							component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
							executeBlur: true,
							onBlur: '{{function(){$inputBlur(_rowIndex,"se")}}}',
							precision: 2,
							disabled: '{{$notAllowEdit()}}',
							className: "{{$getCellClassName(_ctrlPath)}}",
							align: 'right',
							style: '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].se?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
							value: '{{$quantityFormat(data.form.details[_rowIndex].se,2,$isFocus(_ctrlPath),false)}}',
							title: '{{$quantityFormat(data.form.details[_rowIndex].se,2,false,false)}}',
							onChange: '{{function(v){$onCellChange(_rowIndex,"se",v)}}}',
							_power: '({rowIndex}) => rowIndex',
						},
						footer: {
							name: 'footer',
							component: 'DataGrid.Cell',
							className: 'txt-right',
							title: '{{$taxAmountTotal(false)}}',
							children: '{{$quantityFormat($taxAmountTotal(false),2,false,false)}}',
						},
					},
				
				]
			}, {
				name: 'total1',
				component: '::div',
				className: 'total',
				children: [{
					name: 'col1',
					component: '::div',
					className: 'col1 bg txt-right',
					children: '价税合计(大写)',
				}, {
					name: 'col2',
					component: '::div',
					className: 'col2',
					title: '{{$moneyToBig(true)}}',
					children: '{{$moneyToBig(true)}}',
				}, {
					name: 'col3',
					component: '::div',
					className: 'col3 txt-right bg',
					children: '价税合计(小写)',
				}, {
					name: 'col4',
					component: '::div',
					className: 'col4 txt-right',
					title: '{{$numberFormat($moneyToBig(false),2,false,false)}}',
					children: '{{$numberFormat($moneyToBig(false),2,false,false)}}',
				}],
			}, {
				name: 'action',
				component: 'Row',
				className: 'action',
				children: [{
					name: 'col1',
					component: 'Col',
					span: 7,
					className: 'ant-form-item-required ant-form-item-center bg',
					children: '即征即退标识',
				}, {
					name: 'col2',
					component: 'Col',
					span: 7,
					className: 'ant-form-item-center',
					_visible: '{{$isReadOnly()}}',
					children: '{{data.form.jzjtbz==="N"?"否":"是"}}',
				}, {
					name: 'col3',
					component: 'Col',
					span: 7,
					className: 'ant-form-item-center',
					_visible: '{{!$isReadOnly()}}',
					children: {
						name: 'radio',
						component: 'Radio.Group',
						className: 'radio-group',
						//disabled: 'false',
						//disabled: '{{data.other.jzjtbzDisable}}',
						value: '{{data.form.jzjtbz}}',
						onChange: '{{function(e){$sf("data.form.jzjtbz",e.target.value)}}}',
						children: [{
							name: 'item1',
							component: 'Radio',
							value: 'N',
							children: '否',
							className: 'radio'
						}, {
							name: 'item2',
							component: 'Radio',
							value: 'Y',
							children: '是',
							className: 'radio'
						}]
					},
				}, {
					name: 'col4',
					component: 'Col',
					span: 5,
					className: ' ant-form-item-center bg',
					children: '备注',
				}, {
					name: 'col5',
					component: 'Col',
					span: 5,
					className: 'ant-form-item-center',
					_visible: '{{$isReadOnly()}}',
					children: '{{data.form.fpfs}}',
				}, {
					name: 'col6',
					component: 'Col',
					span: 5,
					className: 'ant-form-item-center',
					_visible: '{{!$isReadOnly()}}',
					children: {
						name: 'input-fpfs',
						component: 'Input',
						match: 'int',
						hideTip: true,
						//disabled: '{{$notAllowEdit()}}',
						align: 'right',
						value: '{{data.form.bz}}',
						className: '{{data.error.bz?"-sales-error":""}}',
						onChange: '{{function(e){$sf("data.form.bz",e.target.value)}}}',
					},
				}]
			}, {
				name: 'kpr',
				className: 'kpr',
				component: '::div',
				children: [{
					name: 'kpr-txt',
					className: 'kpr-txt',
					component: '::span',
					children: '开票人：'
				}, {
					name: 'kpr-input',
					className: 'kpr-input',
					component: 'Input',
					value: '{{data.form.kpr}}',
					onChange: '{{function(e){$sf("data.form.kpr",e.target.value)}}}'
				}]
			}],
		},
	}
}

export function getInitState() {
	return {
		data: {
			loading: true,
			hwlxList: [],
			slList: [],
			jsfsList: [],
			spbmList: [],
			// editRow: -1, //当前编辑行
			form: {
				"fplyLx": "2", //  发票来源类型，1：读取，2：录入，3：导入
				"sf01": 'N', //Y：专票，N：普票
				jzjtbz: 'N',
				fpztDm: '1',
				details: [{}, {}, {}, {}]
			},
			other: {
				detailHeight: 24 * 3 + 35,
				tableWidth: 940 - 18,
				minCount: 4,
				randomKey: 100,
				jzjtbzDisable: false,
			},
			error: {
				details: []
			}
			
		}
	}
}