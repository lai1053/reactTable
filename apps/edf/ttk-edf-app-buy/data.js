export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-edf-app-buy',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'ttk-edf-app-buy-backgroundColor',
			children: [
				{
					name: 'header',
					component: '::div',
					className: 'ttk-edf-app-buy-header',
					children: [{
						name: 'name',
						component: '::div',
						className: 'ttk-edf-app-buy-header-left',
						children: '支付中心'
					}, {
						name: 'btnGroup',
						component: 'Layout',
						className: 'ttk-edf-app-buy-header-center',
						children: [{
							name: 'barItem',
							component: '::div',
							className: 'ttk-edf-app-buy-header-center-bar',
							children: [{
								name: 'step1',
								component: '::div',
								className: 'ttk-edf-app-buy-header-center-bar-step',
								children: [{
									name: 'title',
									className: "ttk-edf-app-buy-header-center-bar-step-icon",
									component: '::div',
									children: ['1']
								}, {
									name: 'description',
									component: '::span',
									className: "ttk-edf-app-buy-header-center-bar-step-description",
									children: ['订单信息']
								}]
							}, {
								name: 'line1',
								className: "ttk-edf-app-buy-header-center-bar-line",
								component: '::span'
							}, {
								name: 'step2',
								component: '::div',
								className: 'ttk-edf-app-buy-header-center-bar-step',
								children: [{
									name: 'title',
									className: "ttk-edf-app-buy-header-center-bar-step-icon",
									component: '::div',
									children: ['2']
								}, {
									name: 'description',
									component: '::span',
									className: "ttk-edf-app-buy-header-center-bar-step-description",
									children: ['支付']
								}]
							}, {
								name: 'line2',
								className: "ttk-edf-app-buy-header-center-bar-line",
								component: '::span'
							}, {
								name: 'step3',
								component: '::div',
								className: 'ttk-edf-app-buy-header-center-bar-step',
								children: [{
									name: 'title',
									className: "ttk-edf-app-buy-header-center-bar-step-icon",
									component: '::div',
									children: ['3']
								}, {
									name: 'description',
									component: '::span',
									className: "ttk-edf-app-buy-header-center-bar-step-description",
									children: ['交易完成']
								}]
							}]
						}]
					},{
						name: 'goback',
						component: '::div',
						className: 'ttk-edf-app-buy-header-right',
						onClick:'{{$goBack}}',
						children: "{{ data.other.step == 1 ? '返回我的企业' : '返回我的订单'}}"
					}]
				},
				{
					name: 'content',
					component: 'Layout',
					_visible: '{{data.other.step == 1}}',
					className: 'ttk-edf-app-buy-content',
					children: [{
						name: 'content',
						component: '::div',
						className: 'ttk-edf-app-buy-content-left',
						children: [{
							name: 'selectPackage',
							component: '::div',
							className: 'ttk-edf-app-buy-content-left-packageName',
							children: [{
								name: 'content',
								component: '::div',
								style: {
									display: 'inline-block',
									height: '16px',
									width: '3px',
									background: '#4ECACC',
									marginRight: '9px'
								}
							}, '选择套餐']
						}, {
							name: 'line1',
							className: 'ttk-edf-app-buy-content-left-packageLine',
							component: '::div'
						}, {
							name: 'package1',
							component: '::div',
							_power: 'for in data.other.productList',
							className:'{{(_rowIndex < 2 || data.other.productList[_rowIndex].appId == 104) ? "ttk-edf-app-buy-content-left-packageList remind" : "ttk-edf-app-buy-content-left-packageList"}}',
							// className:'{{(_rowIndex < 2 && data.other.productList[_rowIndex].appId != 104) ? "ttk-edf-app-buy-content-left-packageList remind" : "ttk-edf-app-buy-content-left-packageList"}}',
							style: { marginLeft: '1%', marginRight: '1%' },
							// onMouseLeave: '{{}}',
							children: [{
								name: 'package',
								component: '::div',
								className: '{{$packageClassName(_rowIndex)}}',
								onClick: '{{$packageSelect(data.other.productList[_rowIndex])}}',
								children: [{
									name: 'packageInfo1',
									component: '::div',
									className: '{{data.other.productList[_rowIndex].productStatus == 1? "ttk-edf-app-buy-content-left-package-Info1 active" : "ttk-edf-app-buy-content-left-package-Info1"}}',
									children: '{{data.other.productList[_rowIndex].name}}',
								}, {
									name: 'packageInfo2',
									component: '::div',
									className: '{{data.other.productList[_rowIndex].productStatus == 1 ? "ttk-edf-app-buy-content-left-package-Info2 active" : "ttk-edf-app-buy-content-left-package-Info2"}}',
									children: '{{data.other.productList[_rowIndex].description}}',
								}, {
									name: 'packageInfo3',
									component: '::div',
									className: '{{data.other.productList[_rowIndex].productStatus == 1 ? "ttk-edf-app-buy-content-left-package-Info3 active" : "ttk-edf-app-buy-content-left-package-Info3"}}',
									// children: '{{data.other.productList[_rowIndex].price == 0 ? "敬请关注" : "￥"+data.other.productList[_rowIndex].price+"/年/企业"}}',
									children: `{{function(){
									if(data.other.productList[_rowIndex].price == -1){
										return "敬请关注"
									}else if(data.other.productList[_rowIndex].price == -2){
										return "价格面议"
									} else{
										return "￥"+data.other.productList[_rowIndex].price+"/年/企业"
									}
									}()}}`,
								}, {
									name: 'packageInfo4',
									component: '::div',
									// _visible: "{{!!data.other.productList[_rowIndex].maxUser}}",
									className: '{{data.other.productList[_rowIndex].productStatus == data.form.productId ||  data.other.productList[_rowIndex].id ==4? "ttk-edf-app-buy-content-left-package-Info4 active" : "ttk-edf-app-buy-content-left-package-Info4"}}',
									style: `{{ data.other.productList[_rowIndex].maxUser == "-1" ? {visibility: 'hidden'} : {} }}`,
									children: '{{data.other.productList[_rowIndex].maxUser+"用户/企业"}}',
								}, {
									name: 'select',
									component: '::div',
									className: 'packageSelect',
									_visible: '{{data.other.productList[_rowIndex].id == data.form.productId ||data.other.productList[_rowIndex].id ==4 }}',
									children: {
										name: 'isDefault',
										component: 'Icon',
										type: 'check',
										style: {
											fontSize: 22,
											position: 'absolute',
											top: '9px',
											color: '#fff',
											right: '-2px'
										}
									}
								}],
							}, {
								name: 'package2',
								component: '::div',
								className: '{{$packageClassName(_rowIndex)}}',
								_visible: '{{_rowIndex < 2 || data.other.productList[_rowIndex].appId == 104}}',
								onClick: '{{$packageSelect(data.other.productList[_rowIndex])}}',
								children: [{
									name: 'test',
									component: '::div',
									style: '{{data.other.productList[_rowIndex].id == data.form.productId  || data.other.productList[_rowIndex].id == 4? {padding: "7px 0 0 11px"} : {padding: "8px 0 0 12px"}}}',
									children: '{{$getDetailDescribe(data.other.productList[_rowIndex].id)}}'
								}, {
									name: 'select',
									component: '::div',
									className: 'packageSelect',
									_visible: '{{data.other.productList[_rowIndex].id == data.form.productId ||data.other.productList[_rowIndex].id == 4 }}',
									children: {
										name: 'isDefault',
										component: 'Icon',
										type: 'check',
										style: {
											fontSize: 22,
											position: 'absolute',
											top: '9px',
											color: '#fff',
											right: '-2px'
										}
									}
								}]
							}]
								// [
								// {
								// 	name: 'package',
								// 	component: '::div',
								// 	style: { marginLeft: '1%', marginRight: '1%' },
								// 	className: 'ttk-edf-app-buy-content-left-package active',
								// 	children: [{
								// 		name: 'packageInfo1',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info1 active',
								// 		children: '标准版'
								// 	}, {
								// 		name: 'packageInfo2',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info2 active',
								// 		children: '金财管家'
								// 	}, {
								// 		name: 'packageInfo3',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info3 active',
								// 		children: '¥980/年'
								// 	}, {
								// 		name: 'select',
								// 		component: '::div',
								// 		className: 'packageSelect',
								// 		children: {
								// 			name: 'isDefault',
								// 			component: 'Icon',
								// 			type: 'check',
								// 			style: {
								// 				fontSize: 22,
								// 				position: 'absolute',
								// 				top: '9px',
								// 				color: '#fff',
								// 				right: '-2px'
								// 			}
								// 		}
								// 	}]
								// }, {
								// 	name: 'package',
								// 	component: '::div',
								// 	style: { marginLeft: '1%', marginRight: '1%' },
								// 	className: 'ttk-edf-app-buy-content-left-package noAllow', children: [{
								// 		name: 'packageInfo1',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info1',
								// 		children: '专业版'
								// 	}, {
								// 		name: 'packageInfo2',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info2',
								// 		children: '金财管家+网课+咨询'
								// 	}, {
								// 		name: 'packageInfo3',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info3',
								// 		children: '¥1380/年'
								// 	}]
								// }, {
								// 	name: 'package',
								// 	component: '::div',
								// 	style: { marginLeft: '1%', marginRight: '1%' },
								// 	className: 'ttk-edf-app-buy-content-left-package noAllow', children: [{
								// 		name: 'packageInfo1',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info1',
								// 		children: '无忧版'
								// 	}, {
								// 		name: 'packageInfo2',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info2',
								// 		children: '标准版+网课+咨询+线下培训'
								// 	}, {
								// 		name: 'packageInfo3',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info3',
								// 		children: '¥1980/年'
								// 	}]
								// }, {
								// 	name: 'package',
								// 	component: '::div',
								// 	style: { marginLeft: '1%', marginRight: '1%' },
								// 	className: 'ttk-edf-app-buy-content-left-package noAllow', children: [{
								// 		name: 'packageInfo1',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info1',
								// 		style: { marginTop: '9px' },
								// 		children: '尊享版'
								// 	}, {
								// 		name: 'packageInfo2',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info2',
								// 		children: '标准版+网课+线下培训+专业顾问+上门服务'
								// 	}, {
								// 		name: 'packageInfo3',
								// 		component: '::div',
								// 		className: 'ttk-edf-app-buy-content-left-package-Info3',
								// 		children: '¥3680/年'
								// 	}]
								// }]
						}, {
							name: 'selectTime',
							component: '::div',
							className: 'ttk-edf-app-buy-content-left-package-buyName',
							children: [{
								name: 'content',
								component: '::div',
								style: {
									display: 'inline-block',
									height: '16px',
									width: '3px',
									background: '#FF6E5B',
									marginRight: '9px'
								}
							}, '订购年限']
						}, {
							name: 'line2',
							className: 'ttk-edf-app-buy-content-left-packageLine',
							component: '::div'
						}, {
							name: 'buyTime',
							component: '::div',
							children: [{
								name: 'packageInfo1',
								component: '::div',
								className: '{{data.form.timespan == 1 ? "ttk-edf-app-buy-content-left-package-buyTime active" : "ttk-edf-app-buy-content-left-package-buyTime"}}',
								onClick: '{{function(){$buyTimeChange(1)}}}',
								children: '1年'
							}, {
								name: 'packageInfo2',
								component: '::div',
								className: '{{data.form.timespan == 2 ? "ttk-edf-app-buy-content-left-package-buyTime active" : "ttk-edf-app-buy-content-left-package-buyTime"}}',
								onClick: '{{function(){$buyTimeChange(2)}}}',
								children: '2年'
							}, {
								name: 'packageInfo3',
								component: '::div',
								className: '{{data.form.timespan == 3 ? "ttk-edf-app-buy-content-left-package-buyTime active" : "ttk-edf-app-buy-content-left-package-buyTime"}}',
								onClick: '{{function(){$buyTimeChange(3)}}}',
								children: '3年'
							}, {
								name: 'packageInfo3',
								component: '::div',
								className: '{{data.form.timespan == 4 ? "ttk-edf-app-buy-content-left-package-buyTime active" : "ttk-edf-app-buy-content-left-package-buyTime"}}',
								onClick: '{{function(){$buyTimeChange(4)}}}',
								children: '4年'
							}]
						}, {
							name: 'selectTax',
							component: '::div',
							className: 'ttk-edf-app-buy-content-left-package-buyName',
							children: [{
								name: 'content',
								component: '::div',
								style: {
									display: 'inline-block',
									height: '16px',
									width: '3px',
									background: '#FDD631',
									marginRight: '9px'
								}
							}, '发票信息']
						}, {
							name: 'line3',
							className: 'ttk-edf-app-buy-content-left-packageLine',
							component: '::div'
						}, {
							name: 'createTax',
							component: 'Checkbox',
							children: '开具电子发票（普票）',
							onChange: '{{function(e){$invoiceStatus(e.target.checked)}}}'
							// onChange: '{{function(e){$sf("data.form.invoiceStatus",e.target.checked)}}}'
						}, {
							name: 'tax',
							component: '::div',
							_visible: '{{data.form.invoiceStatus}}',
							className:'ttk-edf-app-buy-content-left-taxList',
							children: {
								name: 'form',
								component: 'Form',
								style: {paddingBottom: '10px'},
								children: [
									{
										name: 'codeItem',
										component: 'Form.Item',
										label: '发票内容：',
										children: '服务费'
									}, {
										name: 'codeItem',
										component: 'Form.Item',
										_visible: '{{data.other.invoiceType == false}}',
										label: '发票抬头',
										required: true,
										children: [{
											name: 'code',
											component: '::div',
											className: '{{data.form.orderInvoice.titleType == 1 ? "ttk-edf-app-buy-content-left-package-invoiceTitle active" : "ttk-edf-app-buy-content-left-package-invoiceTitle"}}',
											onClick: '{{function(){$InvoiceChange(1)}}}',
											children: '企业'
										}, {
											name: 'code',
											component: '::div',
											className: '{{data.form.orderInvoice.titleType == 2 ? "ttk-edf-app-buy-content-left-package-invoiceTitle active" : "ttk-edf-app-buy-content-left-package-invoiceTitle"}}',
											onClick: '{{function(){$InvoiceChange(2)}}}',
											children: '个人'
										}]
									}, {
										name: 'companyName',
										component: 'Form.Item',
										_visible: '{{data.other.invoiceType == false}}',
										label: '{{function(){if(data.form.orderInvoice.titleType == 1){return "企业名称"}else{return "发票抬头"}}()}}',
										required: true,
										validateStatus: "{{data.other.error.orderInvoice.title?'error':'success'}}",
										help: '{{data.other.error.orderInvoice.title}}',
										children: [{
											name: 'code',
											component: 'Input',
											value: '{{data.form.orderInvoice.title}}',
											onChange: "{{function(e){$sf('data.form.orderInvoice.title',e.target.value);$inputCheck([{ path: 'data.form.orderInvoice.title', value: e.target.value }])}}}"
										}]
									}, {
										name: 'taxCode',
										component: 'Form.Item',
										_visible: '{{data.form.orderInvoice.titleType == 1 && data.other.invoiceType == false}}',
										label: '纳税人识别号',
										required: true,
										validateStatus: "{{data.other.error.orderInvoice.vatTaxpayerNum?'error':'success'}}",
										help: '{{data.other.error.orderInvoice.vatTaxpayerNum}}',
										children: [{
											name: 'code',
											component: 'Input',
											// maxlength: '50',
											value: '{{data.form.orderInvoice.vatTaxpayerNum}}',
											onChange: "{{function(e){$sf('data.form.orderInvoice.vatTaxpayerNum',e.target.value);$inputCheck([{ path: 'data.form.orderInvoice.vatTaxpayerNumInput', value: e.target.value }])}}}"
										}]
									}, {
										name: ' invoiceDiv',
										component: 'Form.Item',
										_visible: '{{data.other.invoiceType == true}}',
										label: '发票抬头',
										required: true,
										children: [{
											name: 'code',
											component: '::div',
											children: '{{function(){if(data.form.orderInvoice.titleType == 2){return "个人"}else{return "企业"}}()}}',
										}]
									}, {
										name: 'companyNameDiv',
										component: 'Form.Item',
										_visible: '{{data.other.invoiceType == true}}',
										label: '{{function(){if(data.form.orderInvoice.titleType == 1){return "企业名称"}else{return "发票抬头"}}()}}',
										required: true,
										children: [{
											name: 'code',
											component: '::div',
											children: '{{data.form.orderInvoice.title}}',
										}]
									}, {
										name: 'taxCodeDiv',
										component: 'Form.Item',
										_visible: '{{data.form.orderInvoice.titleType == 1 && data.other.invoiceType == true}}',
										label: '纳税人识别号',
										required: true,
										children: [{
											name: 'code',
											component: '::div',
											children: '{{data.form.orderInvoice.vatTaxpayerNum}}',
										}]
									}, {
										name: 'invoiceSave',
										component: 'Button',
										style: { marginLeft: '110px',marginTop: '10px' },
										type: 'primary',
										onClick:'{{$invoiceSave}}',
										children: '{{function(){if(data.other.invoiceType == false){return "保存开票信息"}else{return "修改开票信息"}}()}}',
									}
								]
							}
						}
						]
					},
						{
						name: 'content',
						component: '::div',
						className: 'ttk-edf-app-buy-content-right',
						children: [{
							name: 'content',
							component: '::div',
							className: 'ttk-edf-app-buy-content-right-info',
							children: [{
								name: 'selectPackage',
								component: '::div',
								className: 'ttk-edf-app-buy-content-right-info-packageName',
								children: [{
									name: 'content',
									component: '::div',
									style: {
										display: 'inline-block',
										height: '16px',
										width: '3px',
										background: '#1EC6F3',
										marginLeft: '12px',
										marginRight: '9px'
									}
								}, '购买清单']
							}, {
								name: 'list',
								component: '::div',
								className: 'ttk-edf-app-buy-content-right-info-list',
								style: { marginBottom: '36px' },
								children: [
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-tr',
										children: '企业名称：'
									},
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-td',
										children: '{{$getOrgName()}}'
									}
								]
							}, {
								name: 'list',
								component: '::div',
								className: 'ttk-edf-app-buy-content-right-info-list',
								children: [
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-tr',
										children: '产品名称：'
									},
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-td',
										children: '{{data.other.productName}}'
									}
								]
							}, {
								name: 'list',
								component: '::div',
								className: 'ttk-edf-app-buy-content-right-info-list',
								children: [
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-tr',
										children: '开始时间：'
									},
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-td',
										children: '{{data.other.startTime}}'
									}
								]
							}, {
								name: 'list',
								component: '::div',
								className: 'ttk-edf-app-buy-content-right-info-list',
								style: { marginBottom: '36px' },
								children: [
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-tr',
										children: '结束时间：'
									},
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-td',
										children: "{{$endTime(data.form.timespan)}}"
									}
								]
							}, {
								name: 'list',
								component: '::div',
								className: 'ttk-edf-app-buy-content-right-info-list',
								children: [
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-tr',
										children: '订单金额：'
									},
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-money',
										children: '{{"¥" + data.form.timespan*data.other.productPrice + ".00"}}'
									}
								]
							}, {
								name: 'list',
								component: '::div',
								className: 'ttk-edf-app-buy-content-right-info-list',
								style: { marginBottom: '60px' },
								children: [
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-tr',
										children: '应付金额：'
									},
									{
										name: 'selectPackage',
										component: '::div',
										className: 'ttk-edf-app-buy-content-right-info-list-finMoney',
										children: '{{"¥" + data.form.timespan*data.other.productPrice + ".00"}}'
									}
								]
							}, {
								name: 'list',
								component: '::div',
								className: 'ttk-edf-app-buy-content-right-info-list',
								style: { marginBottom: '20px' },
								children: [{
									name: 'selectPackage',
									component: '::div',
									className: 'ttk-edf-app-buy-content-right-info-list-tr',
									children: '服务商：'
								}, {
									name: 'selectPackage',
									component: 'Input',
									maxlength: '50',
									placeholder: '***服务商',
									className: 'ttk-edf-app-buy-content-right-info-list-input',
									onChange: `{{function(e){$sf('data.form.serviceProviderName',e.target.value)}}}`,
								}]
							}, {
								name: 'button',
								component: 'Button',
								type: 'primary',
								className: '{{data.form.agree == false ? "ttk-edf-app-buy-content-right-info-list-commit disabled" : "ttk-edf-app-buy-content-right-info-list-commit"}}',
								onClick: '{{$listCommit}}',
								children: '提交订单'
							}, {
								name: 'list',
								component: '::div',
								className: 'ttk-edf-app-buy-content-right-info-list-treatyAll',
								children: [{
									name: 'createTax',
									component: 'Checkbox',
									className: 'ttk-edf-app-buy-content-right-info-list-treaty',
									checked: '{{data.form.agree}}',
									onChange: '{{function(e){$sf(\'data.form.agree\',e.target.checked)}}}',
									children: '同意'
								}, {
									name: 'treaty',
									component: '::label',
									className: 'ttk-edf-app-buy-content-right-info-list-treaty primaryColor',
									onClick: '{{$showAgreement}}',
									children: '《金财管家租赁服务协议》'
								}]
							}]
						}]
					}]
				},
				{
					name: 'iframe',
					_visible: '{{data.other.step == 2}}',
					component: '::div',
						children:[{
						name: 'payIframe',
						id: 'payIframe',
						className: 'ttk-edf-app-buy-iframe',
						component: '::iframe',
						height: '600',
						scrolling: 'auto',
						src: '{{$payIframe()}}'
					}]
				}
			]
		}]
	};
}

export function getInitState() {
	return {
		data: {
			form: {
				productId: 1, //产品 id
				serviceProviderName:'', //服务商名称
				orderInvoice: {
					content: "服务费",
					titleType: 1,  //客户类型：2为个人 1为单位
					title:"",
					vatTaxpayerNum:""
				},

				timespan: 1,      //购买时间
				payRetUrl: window.location.protocol+"//"+ window.location.host + '/vendor/pay.html',    //支付成功后需要调转的 url
				payNotifyUrl: window.location.protocol+"//"+ window.location.host + '/v1/edf/ordercenter/paynotifyurl',    //支付成功后支付平台会回调通知此 url
				invoiceStatus: false,     //是否需要发票 2需要 1不需要

				agree: true     //用户协议
			},
			other: {
				step: 1,
				invoiceType: false,
				iframeUrl:'',
				startTime: '2000-01-01',
				error: {
					orderInvoice: {
						content: "",
						titleType:"",
						title:"",
						vatTaxpayerNum:""
					}
				},
				productPrice: '980',
				productName: '金财管家-标准版',
				productList: []
			}
		}
	}
}
