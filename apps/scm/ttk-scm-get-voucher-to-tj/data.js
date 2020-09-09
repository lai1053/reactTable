import moment from 'moment'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-get-voucher-to-tj',
		children: [
			{
				name: 'mail',
				component: 'Spin',
				tip: '数据加载中...',
				spinning: '{{data.loading}}',
				delay: 0.01,
				children: {
					name: 'form',
					component: 'Form',
					className: 'ttk-scm-get-voucher-to-tj-form',
					children: [
						{
							name: 'barItem',
							component: '::div',
							className: 'ttk-scm-get-voucher-to-tj-form-bar',
							children: [
								{
									name: 'step1',
									component: '::div',
									className: 'ttk-scm-get-voucher-to-tj-form-bar-step step1',
									children: [
										{
											name: 'title',
											className: 'ttk-scm-get-voucher-to-tj-form-bar-step-icon active',
											component: '::div',
											children: ['1']
										},
										{
											name: 'description',
											component: '::span',
											className: 'ttk-scm-get-voucher-to-tj-form-bar-step-description active',
											children: ['档案映射']
										}
									]
								},
								{
									name: 'line1',
									className: '{{data.other.step >= 2 ? "ttk-scm-get-voucher-to-tj-form-bar-line active" : "ttk-scm-get-voucher-to-tj-form-bar-line"}}',
									component: '::span',
								},
								{
									name: 'step2',
									component: '::div',
									className: 'ttk-scm-get-voucher-to-tj-form-bar-step step2',
									children: [{
										name: 'title',
										className: '{{ data.other.step>=2 ? "ttk-scm-get-voucher-to-tj-form-bar-step-icon active" : "ttk-scm-get-voucher-to-tj-form-bar-step-icon" }}',
										component: '::div',
										children: ['2']
									}, {
										name: 'description',
										component: '::span',
										className: "{{data.other.step>=2 ? 'ttk-scm-get-voucher-to-tj-form-bar-step-description active' : 'ttk-scm-get-voucher-to-tj-form-bar-step-description' }}",
										children: ['科目设置']
									}]
								},
								{
									name: 'line2',
									className: '{{data.other.step >= 3 ? "ttk-scm-get-voucher-to-tj-form-bar-line active" : "ttk-scm-get-voucher-to-tj-form-bar-line"}}',
									component: '::span',
								},
								{
									name: 'step3',
									component: '::div',
									className: 'ttk-scm-get-voucher-to-tj-form-bar-step step3',
									children: [{
										name: 'title',
										className: '{{ data.other.step==3 ? "ttk-scm-get-voucher-to-tj-form-bar-step-icon active" : "ttk-scm-get-voucher-to-tj-form-bar-step-icon" }}',
										component: '::div',
										children: ['3']
									}, {
										name: 'description',
										component: '::span',
										className: "{{data.other.step==3 ? 'ttk-scm-get-voucher-to-tj-form-bar-step-description active' : 'ttk-scm-get-voucher-to-tj-form-bar-step-description' }}",
										children: ['生成凭证']
									}]
								}
							]
						},
						// {
						// 	name: 'step1-tip',
						// 	component: "::div",
						// 	className: 'sep1-tip',
						// 	_visible: '{{data.other.step==1}}',
						// 	children: '{{data.other.vatOrEntry==0?"注：客户、存货默认生成"+data.tplus.softAppName+"对应档案":"注：供应商档案、存货档案默认生成"+data.tplus.softAppName+"对应档案"}}'
						// },
						{
							name: 'step1-tip1',
							component: "Button",
							className: 'sep1-tip',
							_visible: '{{data.other.step==1&&data.other.tab1==1&&data.other.accountEnableDto.currentAccount==1}}',
							children: [{
								name: 'step1-tip11',
								component: "Button",
								// className: 'sep1-tip',
								onClick: '{{$handleBatchGetCustomerCurrentAccount}}',
								children: '批量生成往来科目'
							}]
						},
						{
							name: 'step1-tip11',
							component: "Button",
							className: 'sep1-tip',
							_visible: '{{data.other.step==1&&data.other.tab1==2&&data.other.accountEnableDto.currentAccount==1}}',
							children: [{
								name: 'step1-tip11',
								component: "Button",
								// className: 'sep1-tip',
								
								onClick: '{{$handleBatchGetSupplierCurrentAccount}}',
								children: '批量生成往来科目'
							}]
						},
						{
							name: 'step1-tip2',
							component: "::div",
							className: 'sep1-tip',
							children: [
								{
									name: 'step1-tip21',
									component: "Button",
									// className: 'sep1-tip',
									_visible: '{{data.other.vatOrEntry==0&&data.other.step==1&&data.other.tab1==3&&data.other.accountEnableDto.revenueAccount==1}}',
									onClick: '{{$handleBatchCreateInventoryAccount}}',
									children: '批量生成收入科目'
								},
								{
									name: 'step1-tip22',
									component: "Button",
									// className: 'sep1-tip',
									_visible: '{{data.other.vatOrEntry==0&&data.other.step==1&&data.other.tab1==3&&data.other.accountEnableDto.revenueAccount==1}}',
									onClick: '{{$handleBatchUpdateInventoryAccount}}',
									children: '批量修改收入类型'
								},
								{
									name: 'step1-tip23',
									component: "Button",
									// className: 'sep1-tip',
									_visible: '{{data.other.vatOrEntry==1&&data.other.step==1&&data.other.tab1==3&&data.other.accountEnableDto.inventoryAccount==1}}',
									onClick: '{{$handleBatchCreateInventoryAccount}}',
									children: '批量生成存货科目'
								},
								{
									name: 'step1-tip24',
									component: "Button",
									// className: 'sep1-tip',
									_visible: '{{data.other.vatOrEntry==1&&data.other.step==1&&data.other.tab1==3&&data.other.accountEnableDto.inventoryAccount==1}}',
									onClick: '{{$handleBatchUpdateInventoryAccount}}',
									children: '批量修改存货科目'
								},
							]
						},
						{
							name: 'mobileItem',
							component: "::div",
							className: 'ttk-scm-get-voucher-to-tj-form-mobile',
							_visible: '{{data.other.step==1}}',
							children:
							{
								name: 'step1-tab',
								component: 'Tabs',
								tabBarGutter: 1,
								animated: false,
								activeKey: "{{data.other.tab1}}",
								onChange: '{{$changFileTab}}',
								//tabBarExtraContent:'{{(data.other.isAux.inventory==true||data.other.isAux.consumer==true)&&data.other.vatOrEntry==0?"注：客户、存货默认生成"+data.tplus.softAppName+"对应档案":(data.other.isAux.inventory==true||data.other.isAux.supplier==true)&&data.other.vatOrEntry==1? "注：供应商档案、存货档案默认生成"+data.tplus.softAppName+"对应档案":""}}',
								children: [
									{
										name: 'step1-tab1',
										component: 'Tabs.TabPane',
										_visible: "{{data.other.vatOrEntry==0&&(data.other.isAux.consumer==true||data.other.accountEnableDto.currentAccount==1)}}",
										tab: '客户档案',
										key: '1',
										children: {
											name: 'customer',
											component: 'DataGrid',
											loading: '{{data.customerLoading}}',
											delay: 0.01,
											headerHeight: 37,
											className: 'ttk-scm-get-voucher-to-tj-content',
											isColumnResizing: true,
											rowHeight: 37,
											enableSequence: false,
											ellipsis: true,
											rowsCount: "{{data.form.customerList && data.form.customerList.length}}",
											readonly: false,
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
															checked: '{{$isSelectAll("dataGridCustomer")}}',
															onChange: '{{$selectAll("dataGridCustomer")}}'
														}]
													},
													cell: {
														name: 'cell',
														component: 'DataGrid.Cell',
														tip: true,
														_power: '({rowIndex})=>rowIndex',
														children: [{
															name: 'select',
															component: 'Checkbox',
															checked: '{{data.form.customerList[_rowIndex].selected}}',
															onChange: '{{$selectRow(_rowIndex,"data.form.customerList")}}'
														}]
													}
												},
												{
													name: 'customerCode',
													component: 'DataGrid.Column',
													columnKey: 'customerCode',
													width: 65,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '客户编码'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'customerCode',
														value: "{{data.form.customerList[_rowIndex].archiveCode}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'customerName',
													component: 'DataGrid.Column',
													columnKey: 'customerName',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '客户名称'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'customerName',
														value: "{{data.form.customerList[_rowIndex].archiveName}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'customerMappingCode',
													component: 'DataGrid.Column',
													columnKey: 'customerMappingCode',
													width: 190,
													flexGrow: 1,
													_visible: '{{data.other.isAux.consumer==true}}',
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '{{data.tplus.softAppName+"客户"}}',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														dropdownClassName: 'celldropdown',
														className: '{{data.form.customerList[_rowIndex] && data.form.customerList[_rowIndex].mappingCode?"":"has-error"}}',
														value: '{{data.form.customerList[_rowIndex]&&data.form.customerList[_rowIndex].mappingCode}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("customerList",v, _rowIndex)}}}',
														children: '{{$renderAccountSelectOption("customer")}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addcustomer(_rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												},
												{
													name: 'customerAccountCode',
													component: 'DataGrid.Column',
													columnKey: 'customerAccountCode',
													width: 190,
													flexGrow: 1,
													_visible: '{{data.other.accountEnableDto.currentAccount==1}}',
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '往来科目',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														dropdownClassName: 'celldropdown',
														className: '{{data.form.customerList[_rowIndex] && data.form.customerList[_rowIndex].accountCode?"":"has-error"}}',
														value: '{{data.form.customerList[_rowIndex]&&data.form.customerList[_rowIndex].accountCode}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("customerAccount",v, _rowIndex)}}}',
														children: '{{$renderAccountSelectOption("account")}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addAccount("customer", _rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												}
											]
										}
									},
									{
										name: 'step1-tab2',
										component: 'Tabs.TabPane',
										_visible: "{{data.other.vatOrEntry==1&&(data.other.isAux.supplier==true||data.other.accountEnableDto.currentAccount==1)}}",
										tab: '供应商档案',
										key: '2',
										children: {
											name: 'supplier',
											component: 'DataGrid',
											loading: '{{data.supplierLoading}}',
											delay: 0.01,
											headerHeight: 37,
											className: 'ttk-scm-get-voucher-to-tj-content',
											isColumnResizing: true,
											rowHeight: 37,
											enableSequence: false,
											ellipsis: true,
											rowsCount: "{{data.form.supplierList && data.form.supplierList.length}}",
											readonly: false,
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
															checked: '{{$isSelectAll("dataGridSupplier")}}',
															onChange: '{{$selectAll("dataGridSupplier")}}'
														}]
													},
													cell: {
														name: 'cell',
														component: 'DataGrid.Cell',
														tip: true,
														_power: '({rowIndex})=>rowIndex',
														children: [{
															name: 'select',
															component: 'Checkbox',
															checked: '{{data.form.supplierList[_rowIndex].selected}}',
															onChange: '{{$selectRow(_rowIndex,"data.form.supplierList")}}'
														}]
													}
												},
												{
													name: 'supplierCode',
													component: 'DataGrid.Column',
													columnKey: 'supplierCode',
													width: 75,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '供应商编码'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'supplierCode',
														value: "{{data.form.supplierList[_rowIndex].archiveCode}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'supplierName',
													component: 'DataGrid.Column',
													columnKey: 'supplierName',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '供应商名称'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'supplierName',
														value: "{{data.form.supplierList[_rowIndex].archiveName}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'supplierMappingCode',
													component: 'DataGrid.Column',
													columnKey: 'supplierMappingCode',
													width: 190,
													flexGrow: 1,
													_visible: '{{data.other.isAux.supplier==true}}',
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '{{data.tplus.softAppName+"供应商"}}',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														dropdownClassName: 'celldropdown',
														className: '{{data.form.supplierList[_rowIndex] && data.form.supplierList[_rowIndex].mappingCode?"":"has-error"}}',
														value: '{{data.form.supplierList[_rowIndex]&&data.form.supplierList[_rowIndex].mappingCode}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("supplierList",v, _rowIndex)}}}',
														children: '{{$renderAccountSelectOption("supplier")}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addSupplier(_rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												},
												{
													name: 'supplierAccountCode',
													component: 'DataGrid.Column',
													columnKey: 'supplierAccountCode',
													width: 190,
													flexGrow: 1,
													_visible: '{{data.other.accountEnableDto.currentAccount==1}}',
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '往来科目',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														dropdownClassName: 'celldropdown',
														className: '{{data.form.supplierList[_rowIndex] && data.form.supplierList[_rowIndex].accountCode?"":"has-error"}}',
														value: '{{data.form.supplierList[_rowIndex]&&data.form.supplierList[_rowIndex].accountCode}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("supplierAccount",v, _rowIndex)}}}',
														children: '{{$renderAccountSelectOption("account")}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addAccount("supplier", _rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												}
											]
										}
									},
									{
										name: 'step1-tab3',
										component: 'Tabs.TabPane',
										_visible: "{{data.other.isAux.inventory==true||(data.other.vatOrEntry==0&&data.other.accountEnableDto.revenueAccount==1)||(data.other.vatOrEntry==1&&data.other.accountEnableDto.inventoryAccount==1)}}",
										tab: '存货档案',
										key: '3',
										children: {
											name: 'inventory',
											component: 'DataGrid',
											loading: '{{data.inventoryLoading}}',
											delay: 0.01,
											headerHeight: 37,
											className: 'ttk-scm-get-voucher-to-tj-content',
											isColumnResizing: true,
											rowHeight: 37,
											enableSequence: false,
											ellipsis: true,
											rowsCount: "{{data.form.inventoryList && data.form.inventoryList.length}}",
											readonly: false,
											columns: [
												{
													name: 'select',
													component: 'DataGrid.Column',
													columnKey: 'operation',
													width: 34,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: {
															name: 'chexkbox',
															component: 'Checkbox',
															checked: '{{$isSelectAll("dataGridInventory")}}',
															onChange: '{{$selectAll("dataGridInventory")}}'
														}
													},
													cell: {
														name: 'cell',
														component: 'DataGrid.Cell',
														tip: true,
														_power: '({rowIndex})=>rowIndex',
														children: {
															name: 'select',
															component: 'Checkbox',
															checked: '{{data.form.inventoryList[_rowIndex].selected}}',
															onChange: '{{$selectRow(_rowIndex,"data.form.inventoryList")}}'
														}
													}
												},
												// {
												// 	name: 'inventoryCode',
												// 	component: 'DataGrid.Column',
												// 	columnKey: 'inventoryCode',
												// 	width: 45,
												// 	flexGrow: 1,
												// 	header: {
												// 		name: 'header',
												// 		component: 'DataGrid.Cell',
												// 		children: '存货编码'
												// 	},
												// 	cell: {
												// 		name: 'cell',
												// 		component: "DataGrid.Cell",
												// 		className: 'inventoryCode',
												// 		value: "{{data.form.inventoryList[_rowIndex].archiveCode}}",
												// 		_power: '({rowIndex})=>rowIndex',
												// 		tip: true,
												// 	}
												// },
												{
													name: 'inventoryName',
													component: 'DataGrid.Column',
													columnKey: 'inventoryName',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '存货名称(规格型号计量单位)'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'inventoryName',
														value: "{{data.form.inventoryList[_rowIndex].archiveName}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'inventoryMappingCode',
													component: 'DataGrid.Column',
													columnKey: 'inventoryMappingCode',
													width: 190,
													flexGrow: 1,
													_visible: '{{data.other.isAux.inventory==true}}',
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '{{data.tplus.softAppName+"存货"}}',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														className: '{{data.form.inventoryList[_rowIndex] && data.form.inventoryList[_rowIndex].mappingCode?"":"has-error"}}',
														dropdownClassName: 'celldropdown',
														value: '{{data.form.inventoryList[_rowIndex] && data.form.inventoryList[_rowIndex].mappingCode}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("inventoryList",v, _rowIndex)}}}',
														children: '{{$renderAccountSelectOption("inventory")}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addInventory(_rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												},
												{
													name: 'revenueType',
													_visible: '{{data.other.vatOrEntry==0&&data.other.accountEnableDto.revenueAccount==1}}',
													// _visible: '{{data.other.vatOrEntry==0}}',
													component: 'DataGrid.Column',
													columnKey: 'revenueType',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '收入类型',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														className: '{{data.form.inventoryList[_rowIndex] && data.form.inventoryList[_rowIndex].revenueType?"":"has-error"}}',
														dropdownClassName: 'celldropdown',
														value: '{{data.form.inventoryList[_rowIndex] && data.form.inventoryList[_rowIndex].revenueType}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("inventoryList",v, _rowIndex, "revenueType")}}}',
														children: '{{$renderRevenueTypeSelectOption()}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addRevenueTypeCode(_rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												},
												{
													name: 'inventoryUnitName',
													// _visible: '{{data.other.vatOrEntry==1}}',
													_visible: '{{data.other.vatOrEntry==1 && data.other.isAux.inventory==true}}',
													component: 'DataGrid.Column',
													columnKey: 'inventoryUnitName',
													width: 60,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '计量单位'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'inventoryUnitName',
														// value: "{{data.form.inventoryList[_rowIndex].inventoryUnitName}}",
														value: "{{$renderInventoryUnitName(data.form.inventoryList[_rowIndex],_rowIndex)}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'rate',
													// _visible: '{{data.other.vatOrEntry==1}}',
													_visible: '{{data.other.vatOrEntry==1 && data.other.isAux.inventory==true}}',
													component: 'DataGrid.Column',
													columnKey: 'rate',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '转换关系(发票单位：核算单位)'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'rate',
														// value: "{{data.form.inventoryList[_rowIndex].rate}}",
														value: "{{data.form.inventoryList[_rowIndex].unit ? data.form.inventoryList[_rowIndex].rate : ''}}",
														_power: '({rowIndex})=>rowIndex',
														// tip: true,
														children: '{{$renderRate(data.form.inventoryList[_rowIndex], _rowIndex)}}'
													}
												},
												{
													name: 'accountCode',
													_visible: '{{data.other.vatOrEntry==1&&data.other.accountEnableDto.inventoryAccount==1}}',
													// _visible: '{{data.other.vatOrEntry==1}}',
													component: 'DataGrid.Column',
													columnKey: 'accountCode',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '存货科目',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														className: '{{data.form.inventoryList[_rowIndex] && data.form.inventoryList[_rowIndex].accountCode?"":"has-error"}}',
														dropdownClassName: 'celldropdown',
														value: '{{data.form.inventoryList[_rowIndex] && data.form.inventoryList[_rowIndex].accountCode}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("inventoryList",v, _rowIndex, "account")}}}',
														children: '{{$renderAccountSelectOption("account")}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addAccount("inventory", _rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												}
											]
										}
									}
								]
							}
						},
						{
							name: 'orgItem',
							component: "::div",
							className: 'ttk-scm-get-voucher-to-tj-form-org',
							_visible: '{{data.other.step==2}}',
							children:
							{
								name: 'step2-tab',
								component: 'Tabs',
								tabBarGutter: 1,
								animated: false,
								onChange: '{{$changAccountTab}}',
								activeKey: "{{data.other.tab2}}",
								children: [
									{
										name: 'step2-tab1',
										component: 'Tabs.TabPane',
										_visible: "{{data.other.vatOrEntry==0}}",
										tab: '收入科目',
										key: '1',
										children: {
											name: 'revenue',
											component: 'DataGrid',
											loading: '{{data.loadingRevenueType}}',
											delay: 0.01,
											headerHeight: 37,
											className: 'ttk-scm-get-voucher-to-tj-content',
											isColumnResizing: true,
											rowHeight: 37,
											enableSequence: false,
											ellipsis: true,
											rowsCount: "{{data.form.revenueTypeList && data.form.revenueTypeList.length}}",
											readonly: false,
											columns: [
												{
													name: 'revenueName',
													component: 'DataGrid.Column',
													columnKey: 'revenueName',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '收入类型名称'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'revenueName',
														value: "{{data.form.revenueTypeList[_rowIndex].name}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'revenueaccountCode',
													component: 'DataGrid.Column',
													columnKey: 'revenueaccountCode',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '{{data.tplus.softAppName+"科目"}}',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														dropdownClassName: 'celldropdown',
														className: '{{data.form.revenueTypeList[_rowIndex] && data.form.revenueTypeList[_rowIndex].accountCode?"":"has-error"}}',
														value: '{{data.form.revenueTypeList[_rowIndex] && data.form.revenueTypeList[_rowIndex].accountCode}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("revenueTypeList",v, _rowIndex)}}}',
														children: '{{$renderAccountSelectOption("account")}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addAccount("revenueType", _rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												}]
										}
									},
									{
										name: 'step2-tab2',
										component: 'Tabs.TabPane',
										_visible: "{{data.other.vatOrEntry==1}}",
										tab: '存货类别科目',
										key: '2',
										children: {
											name: 'inventoryType',
											component: 'DataGrid',
											loading: '{{data.loadingInventoryType}}',
											delay: 0.01,
											headerHeight: 37,
											className: 'ttk-scm-get-voucher-to-tj-content',
											isColumnResizing: true,
											rowHeight: 37,
											enableSequence: false,
											ellipsis: true,
											rowsCount: "{{data.form.inventoryTypeList && data.form.inventoryTypeList.length}}",
											readonly: false,
											columns: [
												{
													name: 'inventoryName',
													component: 'DataGrid.Column',
													columnKey: 'inventoryName',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '存货及服务分类'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'inventoryTypeName',
														value: "{{data.form.inventoryTypeList[_rowIndex].name}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'inventoryTypeAccountCode',
													component: 'DataGrid.Column',
													columnKey: 'inventoryTypeAccountCode',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '{{data.tplus.softAppName+"科目"}}',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														dropdownClassName: 'celldropdown',
														className: '{{data.form.inventoryTypeList[_rowIndex] && data.form.inventoryTypeList[_rowIndex].accountCode?"":"has-error"}}',
														value: '{{data.form.inventoryTypeList[_rowIndex] && data.form.inventoryTypeList[_rowIndex].accountCode}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("inventoryTypeList",v, _rowIndex)}}}',
														children: '{{$renderAccountSelectOption("account")}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addAccount("inventoryType", _rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												}]
										}
									},
									{
										name: 'step2-tab6',
										component: 'Tabs.TabPane',
										_visible: "{{data.other.vatOrEntry==1}}",
										tab: '资产科目',
										key: '6',
										children: [
											{
												name: 'asset',
												component: 'DataGrid',
												loading: '{{data.loadingAsset}}',
												delay: 0.01,
												headerHeight: 37,
												className: 'ttk-scm-get-voucher-to-tj-content',
												isColumnResizing: true,
												rowHeight: 37,
												enableSequence: false,
												ellipsis: true,
												rowsCount: "{{data.form.assetList && data.form.assetList.length}}",
												readonly: false,
												columns: [
													{
														name: 'assetName',
														component: 'DataGrid.Column',
														columnKey: 'assetName',
														width: 65,
														flexGrow: 1,
														header: {
															name: 'header',
															component: 'DataGrid.Cell',
															children: '资产属性'
														},
														cell: {
															name: 'cell',
															component: "DataGrid.Cell",
															className: 'assetName',
															value: "{{data.form.assetList[_rowIndex].name}}",
															_power: '({rowIndex})=>rowIndex',
															tip: true,
														}
													},
													{
														name: 'assetType',
														component: 'DataGrid.Column',
														columnKey: 'assetType',
														width: 190,
														flexGrow: 1,
														header: {
															name: 'header',
															component: 'DataGrid.Cell',
															children: '资产分类'
														},
														cell: {
															name: 'cell',
															component: "DataGrid.Cell",
															className: 'assetType',
															value: "{{data.form.assetList[_rowIndex].assetType}}",
															_power: '({rowIndex})=>rowIndex',
															tip: true,
														}
													},
													{
														name: 'assetaccountCode',
														component: 'DataGrid.Column',
														columnKey: 'assetaccountCode',
														width: 190,
														flexGrow: 1,
														header: {
															name: 'header',
															component: 'DataGrid.Cell',
															children: '{{data.tplus.softAppName+"科目"}}',
															className: 'cell_header'
														},
														cell: {
															name: 'cell',
															component: 'Select',
															showSearch: true,
															allowClear: false,
															dropdownClassName: 'celldropdown',
															//className: '{{data.form.assetList[_rowIndex] && data.form.assetList[_rowIndex].accountCode?"":"has-error"}}',
															value: '{{data.form.assetList[_rowIndex] && data.form.assetList[_rowIndex].accountCode}}',
															filterOption: '{{$filterOption}}',
															onChange: '{{function(v){$onFieldChange("assetList",v, _rowIndex)}}}',
															children: '{{$renderAccountSelectOption("account")}}',
															dropdownFooter: {
																name: 'add',
																type: 'primary',
																component: 'Button',
																style: { width: '100%', borderRadius: '0' },
																children: '新增',
																onClick: '{{function(){$addAccount("asset", _rowIndex)}}}'
															},
															_power: '({rowIndex}) => rowIndex',
														}
													}]
											},
											{
												name: 'tip',
												component: '::div',
												style: {
													fontSize: 12,
													marginTop: 4,
													color: 'red'
												},
												children: '提示：如果进项发票未包含资产，不需设置资产科目'
											}
										]
									},
									{
										name: 'step2-tab3',
										component: 'Tabs.TabPane',
										_visible: "{{data.other.vatOrEntry==1}}",
										tab: '费用类型科目设置',
										key: '3',
										children: [
											{
												name: 'busness',
												component: 'DataGrid',
												loading: '{{data.loadingBusiness}}',
												delay: 0.01,
												headerHeight: 37,
												className: 'ttk-scm-get-voucher-to-tj-content',
												isColumnResizing: true,
												rowHeight: 37,
												enableSequence: false,
												ellipsis: true,
												rowsCount: "{{data.form.busnessList && data.form.busnessList.length}}",
												readonly: false,
												columns: [
													{
														name: 'busnessName',
														component: 'DataGrid.Column',
														columnKey: 'busnessName',
														width: 190,
														flexGrow: 1,
														header: {
															name: 'header',
															component: 'DataGrid.Cell',
															children: '费用类型'
														},
														cell: {
															name: 'cell',
															component: "DataGrid.Cell",
															className: 'busnessName',
															value: "{{data.form.busnessList[_rowIndex].name}}",
															_power: '({rowIndex})=>rowIndex',
															tip: true,
														}
													},
													{
														name: 'busnessaccountCode',
														component: 'DataGrid.Column',
														columnKey: 'busnessaccountCode',
														width: 190,
														flexGrow: 1,
														header: {
															name: 'header',
															component: 'DataGrid.Cell',
															children: '{{data.tplus.softAppName+"科目"}}',
															className: 'cell_header'
														},
														cell: {
															name: 'cell',
															component: 'Select',
															showSearch: true,
															allowClear: false,
															dropdownClassName: 'celldropdown',
															//className: '{{data.form.busnessList[_rowIndex] && data.form.busnessList[_rowIndex].accountCode?"":"has-error"}}',
															value: '{{data.form.busnessList[_rowIndex] && data.form.busnessList[_rowIndex].accountCode}}',
															filterOption: '{{$filterOption}}',
															onChange: '{{function(v){$onFieldChange("busnessList",v, _rowIndex)}}}',
															children: '{{$renderAccountSelectOption("account")}}',
															dropdownFooter: {
																name: 'add',
																type: 'primary',
																component: 'Button',
																style: { width: '100%', borderRadius: '0' },
																children: '新增',
																onClick: '{{function(){$addAccount("busness", _rowIndex)}}}'
															},
															_power: '({rowIndex}) => rowIndex',
														}
													}]
											},
											{
												name: 'tip',
												component: '::div',
												style: {
													fontSize: 12,
													marginTop: 4,
													color: 'red'
												},
												children: '提示：如果进项发票未包含费用，不需设置费用类型科目'
											}
										]
									},
									{
										name: 'step2-tab4',
										component: 'Tabs.TabPane',
										tab: '结算方式科目设置',
										key: '4',
										children: {
											name: 'settle',
											component: 'DataGrid',
											loading: '{{data.loadingSettle}}',
											delay: 0.01,
											headerHeight: 37,
											className: 'ttk-scm-get-voucher-to-tj-content',
											isColumnResizing: true,
											rowHeight: 37,
											enableSequence: false,
											ellipsis: true,
											rowsCount: "{{data.form.settleList && data.form.settleList.length}}",
											readonly: false,
											columns: [
												{
													name: 'settleName',
													component: 'DataGrid.Column',
													columnKey: 'settleName',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '结算方式'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'settleName',
														value: "{{data.form.settleList[_rowIndex].archiveName}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'settleaccountCode',
													component: 'DataGrid.Column',
													columnKey: 'settleaccountCode',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '{{data.tplus.softAppName+"科目"}}',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														dropdownClassName: 'celldropdown',
														className: '{{data.form.settleList[_rowIndex] && data.form.settleList[_rowIndex].accountCode?"":"has-error"}}',
														value: '{{data.form.settleList[_rowIndex] && data.form.settleList[_rowIndex].accountCode}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("settleList",v, _rowIndex)}}}',
														children: '{{$renderAccountSelectOption("account")}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addAccount("settle", _rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												}
											]
										}
									},
									{
										name: 'step2-tab5',
										component: 'Tabs.TabPane',
										_visible: '{{$isXgmAndPu()}}',
										tab: '增值税科目',
										key: '5',
										children: {
											name: 'tax',
											component: 'DataGrid',
											loading: '{{data.loadingTax}}',
											delay: 0.01,
											headerHeight: 37,
											className: 'ttk-scm-get-voucher-to-tj-content',
											isColumnResizing: true,
											rowHeight: 37,
											enableSequence: false,
											ellipsis: true,
											rowsCount: "{{data.form.taxList && data.form.taxList.length}}",
											readonly: false,
											columns: [
												{
													name: 'businessCode',
													component: 'DataGrid.Column',
													columnKey: 'businessCode',
													width: 45,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '业务名称'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'businessCode',
														value: "{{data.form.taxList[_rowIndex].businessCode}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'taxName',
													component: 'DataGrid.Column',
													columnKey: 'taxName',
													width: 190,
													_visible: "{{$isXgm()}}",
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '计税方式'
													},
													cell: {
														name: 'cell',
														component: "DataGrid.Cell",
														className: 'taxName',
														value: "{{data.form.taxList[_rowIndex].influenceValueDisplay}}",
														_power: '({rowIndex})=>rowIndex',
														tip: true,
													}
												},
												{
													name: 'taxaccountCode',
													component: 'DataGrid.Column',
													columnKey: 'taxaccountCode',
													width: 190,
													flexGrow: 1,
													header: {
														name: 'header',
														component: 'DataGrid.Cell',
														children: '{{data.tplus.softAppName+"科目"}}',
														className: 'cell_header'
													},
													cell: {
														name: 'cell',
														component: 'Select',
														showSearch: true,
														allowClear: false,
														dropdownClassName: 'celldropdown',
														className: '{{data.form.taxList[_rowIndex] && data.form.taxList[_rowIndex].accountCode?"":"has-error"}}',
														value: '{{data.form.taxList[_rowIndex] && data.form.taxList[_rowIndex].accountCode}}',
														filterOption: '{{$filterOption}}',
														onChange: '{{function(v){$onFieldChange("taxList",v, _rowIndex)}}}',
														children: '{{$renderAccountSelectOption("account")}}',
														dropdownFooter: {
															name: 'add',
															type: 'primary',
															component: 'Button',
															style: { width: '100%', borderRadius: '0' },
															children: '新增',
															onClick: '{{function(){$addAccount("tax", _rowIndex)}}}'
														},
														_power: '({rowIndex}) => rowIndex',
													}
												}]
										}
									},
								]
							}
						},
						{
							name: 'enabledDateItem',
							component: "::div",
							className: 'ttk-scm-get-voucher-to-tj-form-date',
							_visible: '{{data.other.step==3}}',
							required: true,
							children: [
								{
									component: "::div",
									name: 'get-voucher-result',
									className: 'center-row',
									children: [
										{
											name: 'span1',
											component: "::span",
											children: '生成',
										},
										{
											name: 'span2',
											className: 'success-count',
											component: "::span",
											children: '{{data.other.successCount}}'
										},
										{
											name: 'span3',
											component: "::span",
											children: '张凭证！',
											_visible: '{{data.other.failCount==0}}'
										},
										{
											name: 'span4',
											component: "::span",
											children: '张凭证，',
											_visible: '{{data.other.failCount>0}}'
										},
										{
											name: 'span5',
											component: "::span",
											children: '{{data.other.failCount}}',
											_visible: '{{data.other.failCount>0}}'
										},
										{
											name: 'span6',
											component: "::span",
											children: '张凭证生成失败！',
											_visible: '{{data.other.failCount>0}}'
										}
									]
								},
								{
									component: "::div",
									className: 'center-row',
									name: 'get-voucher-result-tip',
									_visible: '{{data.other.successCount>0}}',
									children: '{{"请在"+data.tplus.softAppName+"凭证管理查看生成的凭证！"}}'
								},
								{
									component: "::div",
									name: "get-voucher-error-tip",
									children: '{{$getErrorList()}}'
								}
							]
						},
					]
				}
			},
			{
				name: 'footer',
				component: '::div',
				className: 'ttk-scm-get-voucher-to-tj-footer',
				children: [{
					name: 'btnGroup',
					component: '::div',
					className: 'ttk-scm-get-voucher-to-tj-footer-btnGroup',
					children: [{
						name: 'cancel',
						component: 'Button',
						_visible: '{{$backStepButton()}}',
						className: 'ttk-scm-get-voucher-to-tj-footer-btnGroup-item',
						children: '上一步',
						onClick: '{{$backLastStep}}',
					},
					{
						name: 'confirm',
						component: 'Button',
						className: 'ttk-scm-get-voucher-to-tj-footer-btnGroup-item',
						type: 'primary',
						//_visible: '{{$nextStepButton()}}',
						children: "{{data.other.step==3 ? '关闭' : '下一步'}}",
						onClick: '{{$nextStep}}'
					}
					]
				}]
			},
			// {
			// 	name: 'set',
			// 	component: '::div',
			// 	_visible: '{{data.other.step==1}}',
			// 	style: {
			// 		position: 'absolute',
			// 		right: '50px',
			// 		top: '64px'
			// 	},
			// 	children: {
			// 		name: 'btn',
			// 		component: 'Button',
			// 		onClick: '{{$openAutomaticGenerationSetting}}',
			// 		children: '设置'
			// 	}
			// }
		]
	}
}

export function getInitState(option) {

	let state = {
		data: {
			loading: false,
			tip: '数据加载中...',
			customerLoading: false,
			supplierList: false,
			inventoryLoading: false,
			loadingRevenueType: true,
			loadingInventoryType: true,
			loadingBusiness: true,
			loadingSettle: true,
			loadingTax: true,
			loadingAsset: true,
			firstTime: true,
			form: {
				customerList: [],
				supplierList: [],
				inventoryList: [],
				revenueTypeList: [],
				settleList: [],
				busnessList: [],
				inventoryTypeList: [],
				taxList: [],
				assetList: [],
			},
			other: {
				step: 1,
				successCount: 0,
				failCount: 0,
				tab1: '1',
				tab2: '1',
				account: [],
				customer: [],
				supplier: [],
				inventory: [],
				autoAddCustomer: false,//是否自动新增客户档案
				autoAddSupplier: false,//是否自动新增供应商档案
				autoAddInventory: false,//是否自动新增存货档案
				autoAddCustomerCurrentAccount: false,//是否自动新增客户往来单位
				autoAddSupplierCurrentAccount: false,//是否自动新增供应商往来单位
				autoAddInventoryAccount: false,//是否自动新增存货科目
				accountEnableDto: {
					currentAccount: 0,
					inventoryAccount: 0,
					revenueAccount: 0,
					saleAccount: 0,
				},
				isAux: {},
				ruleDto: {
					"customerSet": false,//不自动生成客户档案
					"customerCodeRule": 2,//编码按照拼音
					"customerAccountSet": false,//不自动生成客户往来档案
					"supplierSet": false,
					"supplierCodeRule": 2,
					"supplierAccountSet": false,
					"inventorySet": false,
					"inventoryCodeRule": 2,
					"inventoryAccountSet": false,
				}
			},
			errorList: [

			],
			isAux: {

			},
			tplus: {
				softAppName: option.softAppName
			}
		}
	}
	return state
}