export function getMeta() {
	return {
		name: 'root',
		component: '::div',
        className: '{{(data.appVersion == 107 && sessionStorage["dzSource"] == 1) ? "edfx-app-org edfx-app-org-dz" : (data.bsgztAccess == 1 ? "edfx-app-org topImportant" : "edfx-app-org")}}',
		children: [{
			name: 'topRemind',
			component: '::div',
			className: 'topRemind',
			_visible: '{{data.other.caExpire}}',
			children: [{
				name: 'text',
				component: '::span',
				style: { fontSize: '12px', color: '#656363', lineHeight: '36px' },
				children: ["一证通到期时间为", {
					name: 'date',
					component: '::span',
					children: '{{data.other.caExpireDate}}'
				}, "，请及时更新证书！若已更新，请重新更新企业信息！一证通数字证书自助服务网址：", {
						name: 'link',
						component: '::a',
						children: 'help.bjca.org.cn',
						href: 'http://help.bjca.org.cn',
						target: '_blank'
					}]
			}, {
				name: 'isExpire-guanbi',
				component: 'Icon',
				fontFamily: 'edficon',
				type: 'guanbi',
				className: 'remindClose',
				title: '关闭',
				onClick: '{{function(){$sf("data.other.caExpire",false)}}}'
			}]
		}, {
			name: 'content',
			component: '::div',
			className: 'mainContent',
			style: '{{ data.other.caExpire ? {top: "36px"} : {top: "0px"} }}',
			children: [{
				name: 'ttk',
				component: '::a',
				href: '#',
				style: { display: 'none' },
				id: 'caHype'
			}, {
				name: 'main',
				component: 'Tabs',
				className: 'edfx-app-org-main',
				animated: false,
				forceRender: false,
				activeKey: '{{data.other.activeTabKey}}',
				onChange: '{{$handleTabChange}}',
				children: [{
					name: 'tab1',
					component: 'Tabs.TabPane',
					_visible: '{{data.other.isShowFirstTab}}',
					tab: '基本信息',
					forceRender: false,
					key: '1',
					children: [{
						name: 'save',
						component: '::div',
						className: 'save',
						_visible: '{{data.other.activeTabKey == 1}}',
						children: [{
							name: 'modify',
							component: 'Button',
							// _visible: '{{data.basic.accountingStandards != "2000020008" && !data.other.canModify && data.other.openSjvatTaxpayerChangeStateState === 0}}',
                            _visible: '{{data.basic.accountingStandards != "2000020008" && !data.other.canModify}}',
                            className: 'modifyVatTaxpayer',
							style: {margin: '10px 25px 0 -15px'},
							children: '改变纳税人性质',
							onClick: '{{function(){$openConfirmInfo()}}}'
						}, {
							name: 'button',
							onClick: '{{$saveBasicInfo}}',
							component: 'Button',
							type: 'primary',
							children: '保存'
						}, {
							name: 'back',
							component: '::a',
							_visible: '{{data.appVersion == 105 && data.other.batchDeclaration == "taxlist"}}',
							style: { float: 'right', fontSize: '12px', position: 'relative', top: '16px' },
							children: '返回清册',
							onClick: '{{$backToTaxlist}}'
						}, {
							name: 'batchDeclaration',
							component: '::a',
							_visible: '{{data.appVersion == 105 && data.other.batchDeclaration == "fromBatchDeclaration"}}',
							style: { float: 'right', fontSize: '12px', position: 'relative', top: '16px', marginRight: '12px' },
							children: '返回批量申报',
							onClick: '{{$backToBatchDeclaration}}'
						}]
					}, {
						name: 'content',
						component: '::div',
						className: 'edfx-app-org-main-content edfx-app-org-main-content-basicInfo',
						_visible: '{{data.other.activeTabKey == 1}}',
						children: [{
							name: 'basic',
							component: '::div',
							children: [{
								name: 'title',
								className: 'blockTitle',
								component: '::div',
								children: [{
									name: 'name',
									component: '::span',
									children: '基本信息'
								}, {
									name: 'line',
									component: '::div',
									className: 'assistLine'
								}]
							}, {
								name: 'block',
								component: '::div',
								children: [{
									name: 'line1',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'orgName',
										component: 'Form.Item',
										colon: false,
										label: '企业名称',
										validateStatus: "{{data.error.name?'error':'success'}}",
										help: '{{data.error.name}}',
										required: true,
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly}}',
											value: '{{data.basic.name}}',
											timeout: true,
											onChange: "{{function(e){$fieldChange('data.basic.name',e.target.value)}}}",
											onBlur: "{{function(e){$fieldChange('data.basic.name',e.target.value, 'blur')}}}",
										}
									}, {
										name: 'enableDate',
										component: 'Form.Item',
										colon: false,
										_visible: '{{!!data.nsxxDto.NSRMC}}',
										label: '纳税人名称',
										help: '{{data.error.orgInfo.NSRMC}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: true,
											value: '{{data.nsxxDto.NSRMC}}'
										}
									}, {
										name: 'name',
										component: 'Form.Item',
										_visible: '{{!data.nsxxDto.NSRMC}}',
										style: { visibility: 'hidden' },
										label: '*',
									}]
								}, {
									name: 'line2',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'enableDate',
										component: 'Form.Item',
										colon: false,
										label: '启用期间',
										className: 'enableDate',
										validateStatus: "{{data.error.enableDate?'error':'success'}}",
										help: '{{data.error.enableDate}}',
										required: true,
										children: {
											name: 'input',
											component: 'DatePicker.MonthPicker',
											disabled: '{{data.other.isReadOnly}}',
											getCalendarContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-basicInfo")}}}',
											value: "{{$stringToMoment((data.basic.enableDate),'YYYY-MM')}}",
											onChange: "{{function(v) {$fieldChange('data.basic.enableDate', $momentToString(v,'YYYY-MM'))}}}",
										}
									}, {
										name: 'accountingStandards',
										component: 'Form.Item',
										colon: false,
										label: '会计准则',
										required: true,
										children: {
											name: 'popover',
											component: 'Popover',
											overlayClassName: '{{data.other.canModify ? "vatTaxpayerPopover vatTaxpayerPopoverHide" : "vatTaxpayerPopover"}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-basicInfo")}}}',
											trigger: 'hover',
											placement: 'bottomLeft',
											content: {
												name: 'content',
												component: '::span',
												children: '当前企业已存在业务数据、财务数据、薪酬数据或已更新企业信息，修改会计准则需【重新初始化】才能操作'
											},
											children: {
												name: 'select',
												component: '::div',
												style: { position: 'relative' },
												children: [{
													name: 'select',
													component: 'Select',
													disabled: '{{data.other.isReadOnly || !data.other.canModify}}',
													getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-basicInfo")}}}',
													showSearch: false,
													value: '{{data.basic.accountingStandards}}',
													onChange: "{{function(e){$setField('data.basic.accountingStandards',e)}}}",
													children: {
														name: 'option',
														component: 'Select.Option',
														value: '{{data.enumData.basic.accountingStandards[_rowIndex].id}}',
														children: '{{data.enumData.basic.accountingStandards[_rowIndex].name}}',
														_power: 'for in data.enumData.basic.accountingStandards',
													}
												}, {
													name: 'shadow',
													component: '::div',
													_visible: '{{!data.other.canModify}}',
													className: 'shadow'
												}]
											}
										}
									}]
								}]
							}]
						}, {
							name: 'tax',
							component: '::div',
							children: [{
								name: 'title',
								className: 'blockTitle',
								component: '::div',
								children: [{
									name: 'name',
									component: '::span',
									children: '税务信息'
								}, {
									name: 'line',
									component: '::div',
									className: 'assistLine'
								}]
							}, {
								name: 'block',
								component: '::div',
								children: [{
									name: 'line1',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'vatTaxpayerNum',
										component: 'Form.Item',
										colon: false,
										label: '纳税人识别号',
										required: true,
										className: 'vatTaxpayerNum',
										validateStatus: "{{data.error.vatTaxpayerNum?'error':'success'}}",
										help: '{{data.error.vatTaxpayerNum}}',
										children: [{
											name: 'input',
											component: 'Input',
											autocomplete: 'off',
											readOnly: "{{data.inputReadOnly}}",
											disabled: '{{data.other.isReadOnly}}',
											value: '{{data.basic.vatTaxpayerNum}}',
											onFocus: "{{function() {$setField('data.error.vatTaxpayerNum', undefined)}}}",
											onChange: '{{function(e){$handleNsrsbhChange(e.target.value)}}}',
											onBlur: '{{function(e){$handleNsrsbhBlur(e.target.value)}}}'
										},{
											name: 'oldVatTaxpayerNumInput',
											component: '::div',
											className: 'oldVatTaxpayerNumInput',
											children: [
                                            //     {
                                            //     name:'oldVatTaxpayerNum',
                                            //     component: '::span',
                                            //     style: {color: '#0066B3',cursor: 'pointer'},
                                            //     onClick: '{{$oldVatTaxpayerNum}}',
                                            //     children:'请输入旧税号'
                                            // },
                                                {
                                                name: 'popover',
                                                component: '{{data.basic.oldVatTaxpayerNum ? "Popover" : "::span"}}',
                                                content: '{{"旧税号："+ data.basic.oldVatTaxpayerNum}}',
                                                placement: 'top',
                                                children: {
                                                    name:'oldVatTaxpayerNum',
                                                    component: '::span',
                                                    style: {color: '#0066B3',cursor: 'pointer'},
                                                    onClick: '{{$oldVatTaxpayerNum}}',
                                                    children:'旧税号'
                                                }
                                            },{
                                                name: 'remind',
                                                component: 'Popover',
                                                getPopupContainer: '{{function() {return document.querySelector(".readOrgBtn")}}}',
												placement: 'topLeft',
												autoAdjustOverflow:false,
                                                content: [
                                                    {
                                                        name: 'p',
                                                        component: '::div',
                                                        children: '1、当您需要采集旧税号的发票时，请录入旧税号，录入后会根据纳税人识别号+旧税号，一起采集发票'
                                                    }, {
                                                        name: 'p',
                                                        component: '::div',
                                                        children: '2、旧税号录入后，必须在企业信息页面点保存按钮，才能保存成功'
                                                    }],
                                                children: {
                                                    name: 'icon',
                                                    component: 'Icon',
                                                    fontFamily: 'edficon',
                                                    type: 'bangzhutishi'
                                                }
                                            }]
                                        }]
									},{
										name: 'ss',
										component: 'Form.Item',
										colon: false,
										label: '省市',
										required: true,
										validateStatus: "{{data.error.ss?'error':'success'}}",
										help: '{{data.error.ss}}',
										children: {
											name: 'input',
											component: 'Select',
											disabled: '{{data.other.isReadOnly}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-basicInfo")}}}',
											showSearch: false,
											value: '{{data.basic.ss}}',
											onChange: '{{function(e){$handleSelectChange("data.basic.ss", e)}}}',
											children: {
												name: 'option',
												component: 'Select.Option',
												value: '{{data.enumData.basic.SS[_rowIndex].code}}',
												children: '{{data.enumData.basic.SS[_rowIndex].name}}',
												_power: 'for in data.enumData.basic.SS',
											}
										}
									}, {
										name: 'agree',
										component: 'Form.Item',
										// _visible: '{{data.basic.vatTaxpayer == "2000010001" ? true : false}}',
										_visible: false,
										colon: false,
										className: 'jzjt',
										label: ' ',
										children: {
											name: 'checkbox',
											component: 'Checkbox',
											checked: '{{data.basic.isSignAndRetreat}}',
											onChange: "{{function(e){$setField('data.basic.isSignAndRetreat',e.target.checked)}}}",
											children: '即征即退'
										}
									}]
								}, {
									name: 'line2',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'vatTaxpayer',
										component: 'Form.Item',
										colon: false,
										label: '纳税人性质',
										required: true,
										children: {
											name: 'popover',
											component: 'Popover',
											overlayClassName: '{{data.other.canModify ? "accountingStandardsPopover accountingStandardsPopoverHide" : "accountingStandardsPopover"}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-basicInfo")}}}',
											trigger: 'hover',
											placement: 'bottomLeft',
											content: {
												name: 'content',
												component: '::span',
												children: '当前企业已存在业务数据、财务数据、薪酬数据或已更新企业信息，修改纳税人性质需【重新初始化】才能操作'
											},
											children: [{
												name: 'select',
												component: '::div',
												style: { position: 'relative' },
												children: [{
													name: 'select',
													component: 'Select',
													disabled: '{{data.other.isReadOnly || !data.other.canModify}}',
													getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-basicInfo")}}}',
													showSearch: false,
													value: '{{data.basic.vatTaxpayer}}',
													onChange: "{{function(e){$setField('data.basic.vatTaxpayer',e);console.log($getField('data.basic.vatTaxpayer'))}}}",
													children: {
														name: 'option',
														component: 'Select.Option',
														value: '{{data.enumData.basic.vatTaxpayer[_rowIndex].id}}',
														children: '{{data.enumData.basic.vatTaxpayer[_rowIndex].name}}',
														_power: 'for in data.enumData.basic.vatTaxpayer',
													}
												}, {
													name: 'shadow',
													component: '::div',
													_visible: '{{!data.other.canModify}}',
													className: 'shadow'
												},
												//  {
												// 	name: 'modify',
												// 	component: 'Icon',
												// 	_visible: '{{!data.other.canModify && data.basic.vatTaxpayer == "2000010002" && data.basic.accountingStandards != "2000020008"}}',
												// 	className: 'modifyVatTaxpayer',
												// 	fontFamily: 'edficon',
												// 	title: '转换纳税人性质',
												// 	type: 'bianji',
												// 	onClick: '{{function(){$openConfirmInfo()}}}'
												// }
											]
											}]
										}
									}, {
										name: 'hideInput',
										component: '::input',
										type: 'password',
										style: {display:'none'}
									},{
										name: 'isTutorialDateMain',
										component: 'Form.Item',
										label: ' ',
										colon: false,
										required: true,
										className:'tutorialDate',
										_visible: '{{data.basic.vatTaxpayer==2000010001 && data.uploadType == 1}}',
										validateStatus: "{{data.error.fdq?'error':'success'}}",
										help: '{{data.error.fdq}}',
										children:  [{
											name:'content',
											component: '::div',
											style:{marginLeft: '-100px',textAlign:'left',},
											children:[	{
												name: 'isTutorialDate',
												component: 'Checkbox',
												value: "",
												checked: '{{data.basic.isTutorialDate}}',
												onChange: "{{function(e){$fieldChange('data.basic.isTutorialDate',e.target.checked)}}}",
											},
											{
												name: 'isTutorialDateSP',
												component: '::span',
												className: 'isTutorialDateSP',
												children: '是否辅导期'
											},
											{
												name: 'isTutorialDateBox',
												component: '::span',
												style:{width:'300px',},
												// _visible: '{{data.form.isEnable && data.sourceType==0 }}',
												//_visible: '{{$isTutorialInfo()}}',
												children:[{
														name: 'tutorialBeginDate',
														component: 'DatePicker.MonthPicker',
														style:{width:'135px',textAlign:'center'},
														//required: true,
														disabled:'{{!data.basic.isTutorialDate}}',
														placeholder: "有效期起",
														value: "{{$stringToMoment((data.basic.tutorialBeginDate),'YYYY-MM')}}",
														onChange: "{{function(v){$fieldChange('data.basic.tutorialBeginDate', $momentToString(v,'YYYY-MM'))}}}",
													},
													{
														name:'dz_spline',
														component:'::span',
														style:{width:'30px',textAlign:'center',padding:'0 10px'},
														children:'-'
													},
													{
														name: 'tutorialEndDate',
														component: 'DatePicker.MonthPicker',
														style:{width:'135px',textAlign:'center'},
														//required: true,
														disabled:'{{!data.basic.isTutorialDate}}',
														placeholder: "有效期止",
														value: "{{$stringToMoment((data.basic.tutorialEndDate),'YYYY-MM')}}",
														onChange: "{{function(v){$fieldChange('data.basic.tutorialEndDate', $momentToString(v,'YYYY-MM'))}}}",
													}
												 ]
											},{
												name: 'formItemText',
												component: '::span',
												className: 'formItemText',
												_visible:false,
												// _visible: '{{data.form.isEnable && data.sourceType==1}}',
												// children: '{{$getFormItemValue(data.form.vatTaxpayer, data.vatTaxpayer, data.sourceType)}}',
												children: [{
													component:'::span',
													children:"{{data.basic.tutorialBeginDate}}"
												},{
													component:'::span',
													children:'-'
												},{
													component:'::span',
													children:"{{data.basic.tutorialEndDate}}"
												}],
											}]
										}


									]}
									, {
										name: 'name',
										component: 'Form.Item',
										_visible: '{{!(data.basic.vatTaxpayer==2000010001 && data.uploadType == 1)}}',
										style: { visibility: 'hidden' },
										label: '*',
									}
										// }, {
										// 	name: 'dkswjgsh',
										// 	component: 'Form.Item',
										// 	colon: false,
										// 	label: '代开税务机关税号',
										// 	_visible: '{{data.other.showDkswjgsh}}',
										// 	validateStatus: "{{data.error.dkswjgsh?'error':'success'}}",
										// 	help: '{{data.error.dkswjgsh}}',
										// 	children: [{
										// 		name: 'input',
										// 		component: 'Input',
										// 		value: '{{data.basic.dkswjgsh}}',
										// 		onFocus: "{{function() {$setField('data.error.dkswjgsh', undefined)}}}",
										// 		onChange: "{{function(e){$fieldChange('data.basic.dkswjgsh',e.target.value)}}}",
										// 		// onBlur: '{{function(e){$handleNsrsbhBlur(e.target.value)}}}'
										// 	}, {
										// 		name: 'icon',
										// 		component: 'Icon',
										// 		fontFamily: 'edficon',
										// 		type: 'bangzhutishi',
										// 		className: 'helpModalBtn',
										// 		onClick: '{{$showHelpModal}}'
										// 	}]
									]
								}]
							}]
						}, {
							name: 'login',
							component: '::div',
							children: [{
								name: 'title',
								className: 'blockTitle',
								component: '::div',
								children: [{
									name: 'name',
									component: '::span',
									children: '登录信息'
								}, {
									name: 'line',
									component: '::div',
									className: 'assistLine'
								}]
							}, {
							    name:'beijingTips',
                                component: '::div',
                                _visible: '{{data.basic.ss == 11 && data.basic.dlfs == 2}}',
                                className: 'beijingTip',
                                children: [{
							        name: 'tip1',
                                    component: '::span',
                                    children: '注：用户名密码登录即北京电子税局中的账号登录，如未开通账号或忘记密码，请携带'
                                },{
							        name: 'tip2',
                                    component: 'Popover',
                                    // content: "相关证件包括：【营业执照，公章，经办人身份证，法人身份证，税务登记副本】",
                                    content: {
                                        name: 'tip2content',
                                        component: '::div',
                                        style: {fontSize: '12px'},
                                        children: '相关证件包括：【营业执照，公章，经办人身份证，法人身份证，税务登记副本】'
                                    },
                                    children: {
                                        name: 'tip2span',
                                        className: 'beijingTipText',
                                        component: '::span',
                                        children: '相关证件'
                                    }
                                },{
                                    name: 'tip3',
                                    component: '::span',
                                    children: '前往报税大厅办理'
                                }]
                            },{
								name: 'block',
								component: '::div',
								children: [{
									name: 'line1',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'loginType',
										component: 'Form.Item',
										colon: false,
										label: '登录方式',
										children: {
											name: 'input',
											component: 'Select',
											disabled: '{{data.other.isReadOnly}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-basicInfo")}}}',
											showSearch: false,
											value: '{{data.basic.dlfs}}',
											onChange: '{{function(e){$handleSelectChange("data.basic.dlfs", e)}}}',
											onFocus: '{{$onDlfsSelectChange}}',
											children: {
												name: 'option',
												component: 'Select.Option',
												value: '{{data.enumData.basic.DLFS[_rowIndex].id}}',
												children: '{{data.enumData.basic.DLFS[_rowIndex].name}}',
												_power: 'for in data.enumData.basic.DLFS',
											}
										}
									}, {
										name: 'GSSBMM',
										component: 'Form.Item',
										colon: false,
										label: '个税申报密码',
										children: {
											name: 'input',
											component: 'Input',
											autocomplete: 'new-password',
											disabled: '{{data.other.isReadOnly}}',
											type: 'password',
											value: '{{data.basic.gssbmm}}',
											onChange: '{{function(e){$setField("data.basic.gssbmm", e.target.value)}}}',
										}
									}]
								}, {
									name: 'lineHelp',
									component: '::div',
									className: 'itemLine',
									style: {textAlign: 'left', paddingLeft: '155px'},
									children: [{
										name: 'website',
										component: 'Form.Item',
										_visible: '{{data.basic.dlfs == 1 && !!data.basic.ss && !!data.other.authenticationWebsite[data.basic.ss]}}',
										colon: false,
										className: 'authenticationWebsite',
										label: '{{data.other.authenticationWebsite[data.basic.ss] && data.other.authenticationWebsite[data.basic.ss].name}}',
										children: {
											name: 'link',
											component: '::a',
											href: '{{data.other.authenticationWebsite[data.basic.ss] && data.other.authenticationWebsite[data.basic.ss].website}}',
											title: '{{data.other.authenticationWebsite[data.basic.ss] && data.other.authenticationWebsite[data.basic.ss].website}}',
											style: { whiteSpace: 'nowrap' },
											target: '_blank',
											children: '{{data.other.authenticationWebsite[data.basic.ss] && data.other.authenticationWebsite[data.basic.ss].website}}'
										}
									}]
								}, {
									name: 'line2',
									component: '::div',
									className: 'itemLine',
									_visible: '{{data.basic.dlfs != 1}}',
									children: [{
										name: 'account',
										component: 'Form.Item',
										colon: false,
										// label: '网报账号',
										label: '{{$internetAccountLabel(data.basic && data.basic.dlfs)}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly}}',
											value: '{{data.basic.wbzh}}',
											onChange: '{{function(e){$setField("data.basic.wbzh", e.target.value);$readOrgInfoBtnState()}}}',
										}
									}, {
										name: 'password',
										component: 'Form.Item',
										colon: false,
										// label: '网报密码',
										label: '{{$internetPasswordLabel(data.basic && data.basic.dlfs)}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly}}',
											type: 'password',
											value: '{{data.basic.wbmm}}',
											onChange: '{{function(e){$setField("data.basic.wbmm", e.target.value);$readOrgInfoBtnState()}}}',
										}
									}]
								},{
									name: 'line31',
									component: '::div',
									className: 'itemLine',
									_visible: '{{data.basic.ss == 51}}',
									children: [{
										name: 'scPhone',
										component: 'Form.Item',
										colon: false,
										label: '手机号',
										className:'normalInput',
										validateStatus: "{{data.error.sjhm ?'error':'success'}}",
										help: '{{data.error.sjhm}}',
										children: {
											name: 'input',
											component: 'Input',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.basic.sjhm}}',
											timeout: true,
											onFocus: "{{function(e){$setField('data.error.sjhm', undefined)}}}",
											onBlur: "{{function(e){$fieldChange('data.basic.sjhm', e.target.value)}}}",
											onChange: "{{function(e){$fieldChange('data.basic.sjhm',e.target.value)}}}",
										}
									},{
										name: 'ssIdType',
										component: 'Form.Item',
										label: '身份类型',
										colon: false,
										className:'normalInput',
										validateStatus: "{{data.error.sflx ?'error':'success'}}",
										help: '{{data.error.sflx}}',
										children: [{
											name: 'ssId',
											component: 'Select',
											// timeout: true,
											// maxlength: 20,
											value: '{{data.basic.sflx}}',
											children:{
												name:'option',
												component:'::Select.Option',
												children:'{{data.enumData.basic.sfType[_rowIndex].name}}',
												value:'{{data.enumData.basic.sfType[_rowIndex].name}}',
												_power:'for in data.enumData.basic.sfType'
											},
											onChange: "{{function(e){$sf('data.basic.sflx',e);}}}"
										}]
									}]
								},{
									name: 'line41',
									component: '::div',
									className: 'itemLine',
									_visible: false,
									children: [{
										name: 'jgnm',
										component: 'Form.Item',
										colon: false,
										label: '主管税务机关名称',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly}}',
											value: '{{data.basic.zgswjgmc}}',
											onChange: '{{function(e){$setField("data.basic.zgswjgmc", e.target.value);$readOrgInfoBtnState()}}}',
										}
									},{
										name: 'name',
										component: 'Form.Item',
										style: { visibility: 'hidden' },
										label: '*',
									}]
								}, {
									name: 'line5',
									component: '::div',
									_visible: '{{data.basic.dlfs == 1 || data.basic.ss == 37}}',
									className: 'caHandle',
									children: [{
										name: 'title',
										component: '::div',
										_visible: '{{!data.basic.ieEnv}}',
										style: { marginBottom: '10px' },
										children: {
											name: 'item',
											component: '::span',
											className: 'CATitle',
											_visible: '{{!$ieEnv()}}',
											//_visible: '{{!data.basic.ieEnv}}',
											style: { overflow: 'hidden', display: 'inline-block', cursor: 'pointer' },
											onClick: '{{$changeCAStep}}',
											children: [{
												name: 'item',
												component: '::span',
												children: [{
													name: 'item1',
													component: '::span',
													_visible: '{{data.basic.ss != 37}}',
													children: 'CA证书登录步骤'
												}, {
													name: 'item2',
													component: '::span',
													_visible: '{{data.basic.ss == 37}}',
													children: '电子签章读取步骤（'
												}, {
													name: 'item3',
													component: '::span',
													_visible: '{{data.basic.ss == 37}}',
													style: {color: '#FA954C'},
													children: '需采集发票时，必须完成下列步骤'
												}, {
													name: 'item4',
													component: '::span',
													_visible: '{{data.basic.ss == 37}}',
													children: '）'
												}]
											}, {
												name: 'icon',
												component: 'Icon',
												fontFamily: 'edficon',
												type: '{{data.other.CAStep ? "shang" : "xia"}}',
												style: { float: 'right' },
											}]
										}
									}, {
										name: 'step',
										component: '::div',
										_visible: '{{data.other.CAStep && !data.basic.ieEnv}}',
										children: [{
											name: 'step1',
											component: '::div',
											//_visible: '{{$caToolsInfo}}',
											style: { marginBottom: '10px' },
											children: [{
												name: 'title1',
												component: '::div',
												children: '1、下载安装CA证书读取工具',
												_visible: '{{data.basic.ss != 37}}',
												style: { marginBottom: '5px' },
												className: 'stepName'
											}, {
												name: 'title2',
												component: '::div',
												children: '1、下载电子签章读取工具',
												_visible: '{{data.basic.ss == 37}}',
												style: { marginBottom: '5px' },
												className: 'stepName'
											}, {
												name: 'btn',
												component: 'Button',
												style: { width: '90px' },
												onClick: '{{$downloadCACertifacate}}',
												children: '点击下载'
											}]
										}, {
											name: 'step2',
											component: '::div',
											//_visible: '{{$caToolsInfo}}',
											style: { marginBottom: '10px' },
											children: [{
												name: 'title1',
												component: '::div',
												_visible: '{{data.basic.ss != 37}}',
												children: "{{!data.other.hasReadCA ? '2、下载完成后，读取CA证书' : '2、CA证书已读取，可更换CA证书'}}",
												style: { marginBottom: '5px' },
												className: 'stepName',
											}, {
												name: 'title2',
												component: '::div',
												_visible: '{{data.basic.ss == 37}}',
												children: "{{!data.other.hasReadCA ? '2、下载完成后，读取电子签章' : '2、电子签章已读取，可更换电子签章'}}",
												style: { marginBottom: '5px' },
												className: 'stepName',
											}, {
												name: 'btn1',
												component: 'Button',
												_visible: '{{data.basic.ss != 37}}',
												disabled: '{{data.other.isReadOnly}}',
												style: { width: '90px' },
												onClick: '{{$openCATool}}',
												children: '读取CA证书'
											}, {
												name: 'btn2',
												component: 'Button',
												_visible: '{{data.basic.ss == 37}}',
												disabled: '{{data.other.isReadOnly}}',
												style: { width: '90px' },
												onClick: '{{$openCATool}}',
												children: '读取电子签章'
											}]
										}, {
											name: 'step3',
											component: '::div',
											//_visible: '{{$caToolsInfo}}',
											style: { marginBottom: '10px' },
											children: [{
												name: 'title1',
												component: '::div',
												_visible: '{{data.basic.ss != 37}}',
												children: '3、完成第1、2步后，可更新企业信息',
												className: 'stepName',
											}, {
												name: 'title2',
												component: '::div',
												_visible: '{{data.basic.ss == 37}}',
												children: '3、完成第1、2步后，点下方的更新企业信息按钮，成功后即可采集发票',
												className: 'stepName',
											}]
										}]
									}, {
										name: 'changeCA',
										component: '::div',
										_visible: '{{$IsChangeCA()}}',
										children: [{
											name: 'a1',
											component: '::a',
											_visible: '{{data.basic.ss != 37}}',
											onClick: '{{!data.other.isReadOnly && $changeCA}}',
											children: '更换CA证书'
										}, {
											name: 'item1',
											component: '::span',
											_visible: '{{data.basic.ss != 37 && !$ieEnv()}}',
											children: '（如果无法打开更换CA证书，请点击上方重新下载证书读取工具）'
										}, {
											name: 'a2',
											component: '::a',
											_visible: '{{data.basic.ss == 37}}',
											onClick: '{{!data.other.isReadOnly && $changeCA}}',
											children: '更换电子签章'
										}, {
											name: 'item2',
											component: '::span',
											_visible: '{{data.basic.ss == 37}}',
											_visible: '{{!$ieEnv()}}',
											children: '（电子签章读取成功，点下方的更新企业信息按钮，成功后即可采集发票）'
										}]
									}]
								}, {
									name: 'line31',
									component: '::div',
									style: { textAlign: 'left', fontSize: '12px',paddingLeft: '168px' },
									_visible: '{{!$InstallCA()}}',
									children: [{
										name: 'line311',
										component: '::div',
										style: { color: '#F5222D', paddingTop: '8px', paddingBottom: '8px' },
										children: '请在电脑上插入“北京一证通”证书，插入后点击更新企业信息'
									}, {
										name: 'line312',
										component: '::span',
										children: '注：如果您插入CA证书无法识别，请确认您的北京一证通助手是否安装正确，北京一证通助手下载地址：',
									}, {
										name: 'link',
										component: '::a',
										children: 'http://yzt.beijing.gov.cn/download/index.html',
										href: 'http://yzt.beijing.gov.cn/download/index.html',
										target: '_blank'
									}]
								}, {
									name: 'line6',
									component: '::div',
									className: 'itemLine readOrgBtn',
									style: { textAlign: 'left', paddingTop: '10px', paddingBottom: '10px' },
									children: [{
										name: 'readBtn',
										component: 'Button',
										onClick: '{{$readOrgInfo}}',
										disabled: '{{data.other.isReadOnly || data.other.readOrgInfoBtn}}',
										style: { marginLeft: '168px', width: '90px' },
										type: 'primary',
										children: '{{"更新企业信息"}}',
									}, {
										name: 'remind',
										component: 'Popover',
										_visible: '{{!data.other.isNetAccount}}',
										getPopupContainer: '{{function() {return document.querySelector(".readOrgBtn")}}}',
										placement: 'right',
										// content: '提示：正确更新企业信息以后，会自动将信息带入到“纳税信息”、“资格认定”、“税费种信息”页签',
										content: [
											{
												name: 'p',
												component: '::div',
												children: '1. 更新企业信息后，才可以每月更新发票信息'
											}, {
												name: 'p',
												component: '::div',
												children: '2. 更新企业信息后，才可以税务申报'
											}, {
												name: 'p',
												component: '::div',
												children: '{{data.uploadType == 0 ? "3. 正确更新企业信息以后，会自动将信息带入到“企业信息”、“资格认定”、“税费种信息” 页签" : "3. 正确更新企业信息以后，会自动将信息带入到“税务信息”页签"}}'
											}],
										children: {
											name: 'icon',
											component: 'Icon',
											fontFamily: 'edficon',
											type: 'bangzhutishi'
										}
									}]
								}]
							}]
						}, {
							name: 'loginBottom',
							component: '::div',
							children: [{
								name: 'title',
								//className: 'blockTitle',
								component: '::div',
								children: [{
									name: 'name',
									component: '::span',
									style: { display: 'none' },
									children: '登录信息'
								}]
							}]
						}]
					}]
				}, {
					name: 'tab2',
					component: 'Tabs.TabPane',
					forceRender: false,
					tab: '企业信息',
					key: '2',
					_visible: '{{data.uploadType == 0 }}',
					children: [{
						name: 'save',
						component: '::div',
						className: 'save',
						_visible: '{{data.other.activeTabKey == 2}}',
						children: {
							name: 'button',
							component: 'Button',
							onClick: '{{$saveOrgInfo}}',
							type: 'primary',
							children: '保存'
						}
					}, {
						name: 'content',
						component: '::div',
						_visible: '{{data.other.activeTabKey == 2}}',
						className: 'edfx-app-org-main-content edfx-app-org-main-content-orgInfo',
						children: [{
							name: 'basic',
							component: '::div',
							children: [{
								name: 'title',
								className: 'blockTitle',
								component: '::div',
								children: [{
									name: 'name',
									component: '::span',
									children: '纳税人基本信息'
								}, {
									name: 'line',
									component: '::div',
									className: 'assistLine'
								}, {
									name: 'arrow',
									component: '::div',
									className: 'blockTitle-arrow',
									onClick: '{{function() {$setField("data.other.title1", !data.other.title1)}}}',
									children: {
										name: 'arrow',
										component: 'Icon',
										fontFamily: 'edficon',
										type: '{{data.other.title1 ? "shang" : "xia"}}'
									}
								}]
							}, {
								name: 'block',
								component: '::div',
								_visible: '{{data.other.title1}}',
								children: [{
									name: 'title',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'enableDate',
										component: 'Form.Item',
										colon: false,
										label: '纳税人名称',
										validateStatus: "{{data.error.orgInfo.NSRMC?'error':'success'}}",
										help: '{{data.error.orgInfo.NSRMC}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.NSRMC}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.NSRMC', e.target.value, '纳税人名称')}}}",
										}
									}, {
										name: 'state',
										component: 'Form.Item',
										colon: false,
										label: '纳税人状态',
										children: {
											name: 'input',
											component: 'Select',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											showSearch: false,
											// value: '{{data.nsxxDto.NSRZT && Number(data.nsxxDto.NSRZT)}}',
											value: '{{data.nsxxDto.NSRZTDM}}',
											onChange: "{{function(e){$setField('data.nsxxDto.NSRZTDM',e)}}}",
											children: {
												name: 'option',
												component: 'Select.Option',
												key: '{{data.enumData.tax.NSRZT.enumDetails[_rowIndex].id}}',
												value: '{{data.enumData.tax.NSRZT.enumDetails[_rowIndex].code}}',
												children: '{{data.enumData.tax.NSRZT.enumDetails[_rowIndex].name}}',
												_power: 'for in data.enumData.tax.NSRZT.enumDetails',
											}
										}
									}]
								}, {
									name: 'line1',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'industry',
										component: 'Form.Item',
										colon: false,
										label: '所属行业',
										children: {
											name: 'input',
											component: 'Select',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											key: '{{data.other.key}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											showSearch: true,
											filterOption: '{{$filterIndustry}}',
											value: '{{data.nsxxDto.SSHY}}',
											onSelect: "{{function(e){$setField('data.nsxxDto.SSHY',e)}}}",
											children: '{{$getSelectOption()}}'
										}
									}, {
										name: 'registerNum',
										component: 'Form.Item',
										colon: false,
										label: '登记序号',
										validateStatus: "{{data.error.orgInfo.DJXH?'error':'success'}}",
										help: '{{data.error.orgInfo.DJXH}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.DJXH}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.DJXH', e.target.value, '登记序号')}}}",
										}
									}]
								}, {
									name: 'line2',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'capital',
										component: 'Form.Item',
										colon: false,
										label: '注册资本',
										validateStatus: "{{data.error.orgInfo.ZCZB?'error':'success'}}",
										help: '{{data.error.orgInfo.ZCZB}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.ZCZB}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.ZCZB', e.target.value, '注册资本')}}}",
											onBlur: '{{function(e){$zczb(e.target.value)}}}'
										}
									}, {
										name: 'registerType',
										component: 'Form.Item',
										colon: false,
										label: '登记注册类型',
										children: {
											name: 'input',
											component: 'Select',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											showSearch: false,
											value: '{{data.nsxxDto.DJZCLX}}',
											onChange: "{{function(e){$setField('data.nsxxDto.DJZCLX',e)}}}",
											children: {
												name: 'option',
												component: 'Select.Option',
												key: '{{data.enumData.tax.DJZCLX.enumDetails[_rowIndex].id}}',
												value: '{{data.enumData.tax.DJZCLX.enumDetails[_rowIndex].code}}',
												children: '{{data.enumData.tax.DJZCLX.enumDetails[_rowIndex].name}}',
												_power: 'for in data.enumData.tax.DJZCLX.enumDetails',
											}
										}
									}]
								}, {
									name: 'line3',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'zzsqylx',
										component: 'Form.Item',
										colon: false,
										label: '增值税企业类型',
										children: {
											name: 'input',
											component: 'Select',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											showSearch: false,
											value: '{{data.nsxxDto.ZZSQYLX}}',
											onChange: "{{function(e){$setField('data.nsxxDto.ZZSQYLX',e)}}}",
											children: {
												name: 'option',
												component: 'Select.Option',
												key: '{{data.enumData.tax.ZZSQYLX.enumDetails[_rowIndex].id}}',
												value: '{{data.enumData.tax.ZZSQYLX.enumDetails[_rowIndex].code}}',
												children: '{{data.enumData.tax.ZZSQYLX.enumDetails[_rowIndex].name}}',
												_power: 'for in data.enumData.tax.ZZSQYLX.enumDetails',
											}
										}
									}, {
										name: 'cyrs',
										component: 'Form.Item',
										colon: false,
										label: '从业人数',
										validateStatus: "{{data.error.orgInfo.CYRS?'error':'success'}}",
										help: '{{data.error.orgInfo.CYRS}}',
										children: {
											name: 'input',
											component: 'Input.Number',
											regex: '^([0-9]+)$',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{!!data.nsxxDto.CYRS ? data.nsxxDto.CYRS : ""}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.CYRS', e, '从业人数')}}}",
										}
									}]
								}, {
									name: 'line4',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'level',
										component: 'Form.Item',
										colon: false,
										label: '信用等级',
										children: {
											name: 'input',
											component: 'Select',
											disabled: '{{data.other.isReadOnly}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											showSearch: false,
											value: '{{data.nsxxDto.XYDJ && Number(data.nsxxDto.XYDJ)}}',
											onChange: "{{function(e){$setField('data.nsxxDto.XYDJ',e)}}}",
											children: {
												name: 'option',
												component: 'Select.Option',
												key: '{{data.enumData.tax.XYDJ.enumDetails[_rowIndex].id}}',
												value: '{{data.enumData.tax.XYDJ.enumDetails[_rowIndex].id}}',
												children: '{{data.enumData.tax.XYDJ.enumDetails[_rowIndex].name}}',
												_power: 'for in data.enumData.tax.XYDJ.enumDetails',
											}
										}
									}, {
										name: 'level',
										component: 'Form.Item',
										colon: false,
										label: '纳税人电子档案',
										validateStatus: "{{data.error.orgInfo.NSRDZDA?'error':'success'}}",
										help: '{{data.error.orgInfo.NSRDZDA}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.NSRDZDA}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.NSRDZDA', e.target.value, '纳税人电子档案')}}}",
										}
									}]
								}, {
									name: 'more',
									component: '::div',
									className: 'itemLine',
									style: { borderTop: '1px dashed #d9d9d9' },
									children: [{
										name: 'more',
										component: '::span',
										onClick: '{{$hideInfo}}',
										className: 'more',
										children: ['更多', {
											name: 'icon',
											component: 'Icon',
											style: { marginLeft: '5px' },
											type: '{{data.other.detailInfo ? "up" : "down"}}'
										}]
									}]
								}, {
									name: 'line5',
									component: '::div',
									className: 'itemLine',
									_visible: '{{data.other.detailInfo}}',
									children: [{
										name: 'enableDate',
										component: 'Form.Item',
										colon: false,
										label: '银行账户',
										validateStatus: "{{data.error.orgInfo.YHZH?'error':'success'}}",
										help: '{{data.error.orgInfo.YHZH}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{!!data.initState.YHZH && (data.other.isReadOnly || data.other.isShowOtherMsg)}}',
											value: '{{data.nsxxDto.YHZH}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.YHZH', e.target.value, '银行账户')}}}",
										}
									}, {
										name: 'registerNum',
										component: 'Form.Item',
										colon: false,
										label: '开户银行',
										validateStatus: "{{data.error.orgInfo.KHYH?'error':'success'}}",
										help: '{{data.error.orgInfo.KHYH}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{!!data.initState.KHYH && (data.other.isReadOnly || data.other.isShowOtherMsg)}}',
											value: '{{data.nsxxDto.KHYH}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.KHYH', e.target.value, '开户银行')}}}",
										}
									}]
								}, {
									name: 'line6',
									component: '::div',
									className: 'itemLine',
									_visible: '{{data.other.detailInfo}}',
									children: [{
										name: 'level',
										component: 'Form.Item',
										colon: false,
										label: '开业日期',
										children: {
											name: 'input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											component: 'DatePicker',
											getCalendarContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											value: '{{$stringToMoment((data.nsxxDto.KYRQ), "YYYY-MM-DD")}}',
											onChange: "{{function(v) {$sf('data.nsxxDto.KYRQ', $momentToString(v,'YYYY-MM-DD'))}}}",
										}
									}, {
										name: 'registerNum',
										component: 'Form.Item',
										colon: false,
										label: '组织机构代码',
										validateStatus: "{{data.error.orgInfo.ZZJGDM?'error':'success'}}",
										help: '{{data.error.orgInfo.ZZJGDM}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.ZZJGDM}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.ZZJGDM', e.target.value, '组织机构代码')}}}",
										}
									}]
								}, {
									name: 'line7',
									component: '::div',
									className: 'itemLine',
									_visible: '{{data.other.detailInfo}}',
									children: [{
										name: 'level',
										component: 'Form.Item',
										colon: false,
										label: '总分机构标志',
										children: {
											name: 'input',
											component: 'Select',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											showSearch: false,
											value: '{{data.nsxxDto.ZFJGBZ}}',
											onChange: "{{function(e){$setField('data.nsxxDto.ZFJGBZ',e)}}}",
											children: {
												name: 'option',
												component: 'Select.Option',
												key: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].id}}',
												value: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].code}}',
												children: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].name}}',
												_power: 'for in data.enumData.tax.ZFJGLX.enumDetails',
											}
										}
									}, {
										name: 'registerNum',
										component: 'Form.Item',
										colon: false,
										label: '代扣代缴标志',
										children: {
											name: 'input',
											component: 'Select',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											showSearch: false,
											value: '{{data.nsxxDto.DKDJBZ}}',
											onChange: "{{function(e){$setField('data.nsxxDto.DKDJBZ',e)}}}",
											children: {
												name: 'option',
												component: 'Select.Option',
												key: '{{data.enumData.tax.DKDJBZ.enumDetails[_rowIndex].id}}',
												value: '{{data.enumData.tax.DKDJBZ.enumDetails[_rowIndex].code}}',
												children: '{{data.enumData.tax.DKDJBZ.enumDetails[_rowIndex].name}}',
												_power: 'for in data.enumData.tax.DKDJBZ.enumDetails',
											}
										}
									}]
								}, {
									name: 'line9',
									component: '::div',
									className: 'itemLine textarea',
									_visible: '{{data.other.detailInfo}}',
									children: [{
										name: 'enableDate',
										component: 'Form.Item',
										colon: false,
										label: '经营范围',
										validateStatus: "{{data.error.orgInfo.JYFW?'error':'success'}}",
										help: '{{data.error.orgInfo.JYFW}}',
										children: {
											name: 'input',
											component: 'Input.TextArea',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.JYFW}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(200, 'data.error.orgInfo.JYFW', e.target.value, '经营范围')}}}",
										}
									}]
								}, {
									name: 'line10',
									component: '::div',
									className: 'itemLine textarea',
									_visible: '{{data.other.detailInfo}}',
									children: [{
										name: 'enableDate',
										component: 'Form.Item',
										colon: false,
										label: '生产经营地址',
										validateStatus: "{{data.error.orgInfo.SCJYDZ?'error':'success'}}",
										help: '{{data.error.orgInfo.SCJYDZ}}',
										children: {
											name: 'input',
											component: 'Input.TextArea',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.SCJYDZ}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(200, 'data.error.orgInfo.SCJYDZ', e.target.value, '生产经营地址')}}}",
										}
									}]
								}]
							}]
						}, {
							name: 'tax',
							component: '::div',
							children: [{
								name: 'title',
								className: 'blockTitle',
								component: '::div',
								children: [{
									name: 'name',
									component: '::span',
									children: '税务信息'
								}, {
									name: 'line',
									component: '::div',
									className: 'assistLine'
								}, {
									name: 'arrow',
									component: '::div',
									className: 'blockTitle-arrow',
									onClick: '{{function() {$setField("data.other.title2", !data.other.title2)}}}',
									children: {
										name: 'arrow',
										component: 'Icon',
										fontFamily: 'edficon',
										type: '{{data.other.title2 ? "shang" : "xia"}}'
									}
								}]
							}, {
								name: 'block',
								component: '::div',
								_visible: '{{data.other.title2}}',
								children: [{
									name: 'line1',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'vatTaxpayer',
										component: 'Form.Item',
										colon: false,
										label: '主管税务局',
										validateStatus: "{{data.error.orgInfo.ZGSWJ?'error':'success'}}",
										help: '{{data.error.orgInfo.ZGSWJ}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.ZGSWJ}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.ZGSWJ', e.target.value, '主管税务局')}}}",
										}
									}, {
										name: 'name',
										component: 'Form.Item',
										_visible: true,
										style: { visibility: 'hidden' },
										label: '*',
									}]
								}]
							}]
						}, {
							name: 'login',
							component: '::div',
							children: [{
								name: 'title',
								className: 'blockTitle',
								component: '::div',
								children: [{
									name: 'name',
									component: '::span',
									children: '联系人信息'
								}, {
									name: 'line',
									component: '::div',
									className: 'assistLine'
								}, {
									name: 'arrow',
									component: '::div',
									className: 'blockTitle-arrow',
									onClick: '{{function() {$setField("data.other.title3", !data.other.title3)}}}',
									children: {
										name: 'arrow',
										component: 'Icon',
										fontFamily: 'edficon',
										type: '{{data.other.title3 ? "shang" : "xia"}}'
									}
								}]
							}, {
								name: 'block',
								component: '::div',
								_visible: '{{data.other.title3}}',
								children: [{
									name: 'line1',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'account',
										component: 'Form.Item',
										colon: false,
										label: '法定负责人',
										validateStatus: "{{data.error.orgInfo.FDFZR?'error':'success'}}",
										help: '{{data.error.orgInfo.FDFZR}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.FDFZR}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.FDFZR', e.target.value, '法定负责人')}}}",
										}
									}, {
										name: 'account',
										component: 'Form.Item',
										colon: false,
										label: '联系电话',
										validateStatus: "{{data.error.orgInfo.FDFZR_TEL?'error':'success'}}",
										help: '{{data.error.orgInfo.FDFZR_TEL}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.FDFZR_TEL}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.FDFZR_TEL', e.target.value, '联系电话')}}}",
										}
									}]
								}, {
									name: 'line2',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'account',
										component: 'Form.Item',
										colon: false,
										label: '财务负责人',
										validateStatus: "{{data.error.orgInfo.CWFZR?'error':'success'}}",
										help: '{{data.error.orgInfo.CWFZR}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.CWFZR}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.CWFZR', e.target.value, '财务负责人')}}}",
										}
									}, {
										name: 'password',
										component: 'Form.Item',
										colon: false,
										label: '联系电话',
										validateStatus: "{{data.error.orgInfo.CWFZR_TEL?'error':'success'}}",
										help: '{{data.error.orgInfo.CWFZR_TEL}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.CWFZR_TEL}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.CWFZR_TEL', e.target.value, '联系电话')}}}",
										}
									}]
								}, {
									name: 'line3',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'account',
										component: 'Form.Item',
										colon: false,
										label: '办税员',
										validateStatus: "{{data.error.orgInfo.BSY?'error':'success'}}",
										help: '{{data.error.orgInfo.BSY}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.BSY}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.BSY', e.target.value, '办税员')}}}",
										}
									}, {
										name: 'account',
										component: 'Form.Item',
										colon: false,
										label: '联系电话',
										validateStatus: "{{data.error.orgInfo.BSY_TEL?'error':'success'}}",
										help: '{{data.error.orgInfo.BSY_TEL}}',
										children: {
											name: 'input',
											component: 'Input',
											disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxDto.BSY_TEL}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.BSY_TEL', e.target.value, '联系电话')}}}",
										}
									}]
								}]
							}]
						}]
					}]
				}, {
					name: 'tab6',
					component: 'Tabs.TabPane',
					forceRender: false,
					tab: '税务信息',
					key: '6',
					_visible: '{{data.uploadType == 1}}',
					children: [{
						name: 'save',
						component: '::div',
						className: 'save',
						_visible: '{{data.other.activeTabKey == 6}}',
						children: {
							name: 'button',
							component: 'Button',
							onClick: '{{$saveTaxInfo}}',
							type: 'primary',
							children: '保存'
						}
					}, {
						name: 'content',
						component: '::div',
						_visible: '{{data.other.activeTabKey == 6}}',
						className: 'edfx-app-org-main-content edfx-app-org-main-content-orgInfo',
						children: [{
							name: 'basic',
							component: '::div',
							children: [{
								name: 'title',
								className: 'blockTitle',
								component: '::div',
								children: [{
									name: 'name',
									component: '::span',
									children: '纳税人基本信息'
								}, {
									name: 'line',
									component: '::div',
									className: 'assistLine'
								}, {
									name: 'arrow',
									component: '::div',
									className: 'blockTitle-arrow',
									onClick: '{{function() {$setField("data.other.title11", !data.other.title11)}}}',
									children: {
										name: 'arrow',
										component: 'Icon',
										fontFamily: 'edficon',
										type: '{{data.other.title11 ? "shang" : "xia"}}'
									}
								}]
							}, {
								name: 'block',
								component: '::div',
								_visible: '{{data.other.title11}}',
								children: [{
									name: 'title',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'enableDate',
										component: 'Form.Item',
										colon: false,
										label: '纳税人名称',
										validateStatus: "{{data.error.taxInfo.NSRMC?'error':'success'}}",
										help: '{{data.error.taxInfo.NSRMC}}',
										children: {
											name: 'input',
											component: 'Input',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxInfo.NSRMC}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.taxInfo.NSRMC', e.target.value, '纳税人名称')}}}",
										}
									}, {
										name: 'industry',
										component: 'Form.Item',
										colon: false,
										label: '所属行业',
										children: {
											name: 'input',
											component: 'Select',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											key: '{{data.other.key}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											showSearch: true,
											filterOption: '{{$filterIndustry}}',
											value: '{{data.nsxxInfo.SSHY}}',
											onSelect: "{{function(e){$setField('data.nsxxInfo.SSHY',e)}}}",
											children: '{{$getSelectOption()}}'
										}
									}]
								}, {
									name: 'line2',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'registerType',
										component: 'Form.Item',
										colon: false,
										label: '登记注册类型',
										children: {
											name: 'input',
											component: 'Select',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											showSearch: false,
											value: '{{data.nsxxInfo.DJZCLX}}',
											onChange: "{{function(e){$setField('data.nsxxInfo.DJZCLX',e)}}}",
											children: {
												name: 'option',
												component: 'Select.Option',
												key: '{{data.enumData.tax.DJZCLX.enumDetails[_rowIndex].id}}',
												value: '{{data.enumData.tax.DJZCLX.enumDetails[_rowIndex].code}}',
												children: '{{data.enumData.tax.DJZCLX.enumDetails[_rowIndex].name}}',
												_power: 'for in data.enumData.tax.DJZCLX.enumDetails',
											}
										}
									}, {
										name: 'level',
										component: 'Form.Item',
										colon: false,
										label: '开业日期',
										children: {
											name: 'input',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											component: 'DatePicker',
											getCalendarContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											value: '{{$stringToMoment((data.nsxxInfo.KYRQ), "YYYY-MM-DD")}}',
											onChange: "{{function(v) {$sf('data.nsxxInfo.KYRQ', $momentToString(v,'YYYY-MM-DD'))}}}",
										}
									}]
								}, {
									name: 'line3',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'level',
										component: 'Form.Item',
										colon: false,
										label: '总分机构标志',
										children: {
											name: 'input',
											component: 'Select',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
											showSearch: false,
											value: '{{data.nsxxInfo.ZFJGBZ}}',
											onChange: "{{function(e){$setField('data.nsxxInfo.ZFJGBZ',e)}}}",
											children: {
												name: 'option',
												component: 'Select.Option',
												key: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].id}}',
												value: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].code}}',
												children: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].name}}',
												_power: 'for in data.enumData.tax.ZFJGLX.enumDetails',
											}
										}
									},{
										name: 'name',
										component: 'Form.Item',
										_visible: true,
										style: { visibility: 'hidden' },
										label: '*',
									}]
								}, {
									name: 'line4',
									component: '::div',
									className: 'itemLine textarea tax',
									children: [{
										name: 'zcdz',
										component: 'Form.Item',
										colon: false,
										label: '注册地址',
										validateStatus: "{{data.error.taxInfo.ZCDZ?'error':'success'}}",
										help: '{{data.error.taxInfo.ZCDZ}}',
										children: {
											name: 'input',
											component: 'Input.TextArea',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxInfo.ZCDZ}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.taxInfo.ZCDZ', e.target.value, '注册地址')}}}",
										}
									},
								]
								}, {
									name: 'line5',
									component: '::div',
									className: 'itemLine textarea tax ',
									children: [{
										name: 'scjydz',
										component: 'Form.Item',
										colon: false,
										label: '生产经营地址',
										validateStatus: "{{data.error.taxInfo.SCJYDZ?'error':'success'}}",
										help: '{{data.error.taxInfo.SCJYDZ}}',
										children: {
											name: 'input',
											component: 'Input.TextArea',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxInfo.SCJYDZ}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.taxInfo.SCJYDZ', e.target.value, '生产经营地址')}}}",
										}
									}]
								}, {
									name: 'line6',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'registerNum',
										component: 'Form.Item',
										colon: false,
										label: '开户银行',
										validateStatus: "{{data.error.taxInfo.KHYH?'error':'success'}}",
										help: '{{data.error.taxInfo.KHYH}}',
										children: {
											name: 'input',
											component: 'Input',
											// disabled: '{{!!data.initState.KHYH && (data.other.isReadOnly || data.other.isShowOtherMsg)}}',
											value: '{{data.nsxxInfo.KHYH}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(50, 'data.error.taxInfo.KHYH', e.target.value, '开户银行','data.nsxxInfo.KHYH')}}}",
										}
									},{
										name: 'enableDate',
										component: 'Form.Item',
										colon: false,
										label: '银行账户',
										validateStatus: "{{data.error.taxInfo.YHZH?'error':'success'}}",
										help: '{{data.error.taxInfo.YHZH}}',
										children: {
											name: 'input',
											component: 'Input',
											// disabled: '{{!!data.initState.YHZH && (data.other.isReadOnly || data.other.isShowOtherMsg)}}',
											value: '{{data.nsxxInfo.YHZH}}',
											timeout: true,
											onChange: "{{function(e){$fieldChange('data.nsxxInfo.YHZH',e.target.value)}}}"
											// onChange: "{{function(e){$checkNotRequire(50, 'data.error.taxInfo.YHZH', e.target.value, '银行账户','data.nsxxInfo.YHZH')}}}",
										}
									}]
								}]

							}]
						},  {
							name: 'login',
							component: '::div',
							className:'connectInfo',
							children: [{
								name: 'title',
								className: 'blockTitle',
								component: '::div',
								children: [{
									name: 'name',
									component: '::span',
									children: '联系人信息'
								}, {
									name: 'line',
									component: '::div',
									className: 'assistLine'
								}, {
									name: 'arrow',
									component: '::div',
									className: 'blockTitle-arrow',
									onClick: '{{function() {$setField("data.other.title12", !data.other.title12)}}}',
									children: {
										name: 'arrow',
										component: 'Icon',
										fontFamily: 'edficon',
										type: '{{data.other.title12 ? "shang" : "xia"}}'
									}
								}]
							}, {
								name: 'block',
								component: '::div',
								_visible: '{{data.other.title12}}',
								children: [{
									name: 'line1',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'account',
										component: 'Form.Item',
										colon: false,
										label: '法定负责人',
										className:'minInput',
										validateStatus: "{{data.error.taxInfo.FDFZR?'error':'success'}}",
										help: '{{data.error.taxInfo.FDFZR}}',
										children: {
											name: 'input',
											component: 'Input',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxInfo.FDFZR}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(20, 'data.error.taxInfo.FDFZR', e.target.value, '法定负责人')}}}",
										}
									}, {
										name: 'account',
										component: 'Form.Item',
										colon: false,
										label: '联系方式',
										className:'normalInput',
										validateStatus: "{{data.error.taxInfo.FDFZR_TEL?'error':'success'}}",
										help: '{{data.error.taxInfo.FDFZR_TEL}}',
										children: {
											name: 'input',
											component: 'Input',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxInfo.FDFZR_TEL}}',
											timeout: true,
											onChange: "{{function(e){$fieldChange('data.nsxxInfo.FDFZR_TEL',e.target.value)}}}",
										}
									},{
										name: 'idType',
										component: 'Form.Item',
										label: '证件类型',
										colon: false,
										className:'normalInput',
										validateStatus: "{{data.error.taxInfo.FDFZR_SFZJLX?'error':'success'}}",
										help: '{{data.error.taxInfo.FDFZR_SFZJLX}}',
										children: [{
											name: 'linkman',
											component: 'Select',
											// timeout: true,
											// maxlength: 20,
											value: '{{data.nsxxInfo.FDFZR_SFZJLX}}',
											children:{
												name:'option',
												component:'::Select.Option',
												children:'{{data.other.IDType[_rowIndex].name}}',
												value:'{{data.other.IDType[_rowIndex].code}}',
												_power:'for in data.other.IDType'
											},
											onChange: "{{function(e){$sf('data.nsxxInfo.FDFZR_SFZJLX',e);}}}"
										}]
									},{
										name: 'id',
										component: 'Form.Item',
										colon: false,
										label: '证件号码',
										className:'normalInput',
										validateStatus: "{{data.error.taxInfo.FDFZR_SFZJHM?'error':'success'}}",
										help: '{{data.error.taxInfo.FDFZR_SFZJHM}}',
										children: {
											name: 'input',
											component: 'Input',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxInfo.FDFZR_SFZJHM}}',
											timeout: true,
											onChange: "{{function(e){$fieldChange('data.nsxxInfo.FDFZR_SFZJHM',e.target.value)}}}",
											// onChange: "{{function(e){$checkNotRequire(50, 'data.error.taxInfo.FDFZR_SFZJHM', e.target.value, '法定责任人证件号码')}}}",
										}
									}]
								}, {
									name: 'line3',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'account',
										component: 'Form.Item',
										colon: false,
										label: '办税员',
										className:'minInput',
										validateStatus: "{{data.error.taxInfo.BSY?'error':'success'}}",
										help: '{{data.error.taxInfo.BSY}}',
										children: {
											name: 'input',
											component: 'Input',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxInfo.BSY}}',
											timeout: true,
											onChange: "{{function(e){$checkNotRequire(20, 'data.error.taxInfo.BSY', e.target.value, '办税员')}}}",
										}
									}, {
										name: 'account',
										component: 'Form.Item',
										colon: false,
										label: '联系方式',
										className:'normalInput',
										validateStatus: "{{data.error.taxInfo.BSY_TEL?'error':'success'}}",
										help: '{{data.error.taxInfo.BSY_TEL}}',
										children: {
											name: 'input',
											component: 'Input',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxInfo.BSY_TEL}}',
											timeout: true,
											onChange: "{{function(e){$fieldChange('data.nsxxInfo.BSY_TEL',e.target.value)}}}",
										}
									}, {
										name: 'idType',
										component: 'Form.Item',
										label: '证件类型',
										colon: false,
										className:'normalInput',
										validateStatus: "{{data.error.taxInfo.BSY_SFZJLX?'error':'success'}}",
										help: '{{data.error.taxInfo.BSY_SFZJLX}}',
										children: [{
											name: 'linkman',
											component: 'Select',
											className:'ttk-es-app-input',
											// timeout: true,
											// maxlength: 20,
											value: '{{data.nsxxInfo.BSY_SFZJLX}}',
											children:{
												name:'option',
												component:'::Select.Option',
												children:'{{data.other.IDType[_rowIndex].name}}',
												value:'{{data.other.IDType[_rowIndex].code}}',
												_power:'for in data.other.IDType'
											},
											onChange: "{{function(e){$sf('data.nsxxInfo.BSY_SFZJLX',e);}}}"
										}]
									},{
										name: 'id',
										component: 'Form.Item',
										colon: false,
										label: '证件号码',
										className:'normalInput',
										validateStatus: "{{data.error.taxInfo.BSY_SFZJHM?'error':'success'}}",
										help: '{{data.error.taxInfo.BSY_SFZJHM}}',
										children: {
											name: 'input',
											component: 'Input',
											// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
											value: '{{data.nsxxInfo.BSY_SFZJHM}}',
											timeout: true,
											onChange: "{{function(e){$fieldChange('data.nsxxInfo.BSY_SFZJHM',e.target.value)}}}",
											// onChange: "{{function(e){$checkNotRequire(50, 'data.error.taxInfo.BSY_SFZJHM', e.target.value, '办税员证件号码')}}}",
										}
									}]
								}]
							}]
						},{
							name: 'tax',
							component: '::div',
							children: [{
								name: 'title',
								className: 'blockTitle',
								component: '::div',
								children: [{
									name: 'name',
									component: '::span',
									children: '税费种信息'
								}, {
									name: 'line',
									component: '::div',
									className: 'assistLine'
								}, {
									name: 'arrow',
									component: '::div',
									className: 'blockTitle-arrow',
									onClick: '{{function() {$setField("data.other.title13", !data.other.title13)}}}',
									children: {
										name: 'arrow',
										component: 'Icon',
										fontFamily: 'edficon',
										type: '{{data.other.title13 ? "shang" : "xia"}}'
									}
								}]
							}, {
								name: 'block',
								component: '::div',
								_visible: '{{data.other.title13}}',
								children: [{
									name: 'save',
									component: '::div',
									className:'bottomTitle',
									children:[{
										name: 'info',
										className: 'info',
										component: '::span',
										style:{color:'#FF0000'},
										children: '注意：如果自动同步下来的税费种与实际有出入，可手动增删改'
									},{
										name: 'save',
										component: '::div',
										className: 'add',
										children:[ {
											name: 'button',
											component: 'Button',
											onClick: '{{$autoGetData}}',
											type: 'primary',
											children: '自动同步'
										},{
											name: 'button',
											component: 'Button',
											onClick: '{{$addClick}}',
											type: 'primary',
											children: '新增'
										}]
									}]
								},{
									name: 'dataGrid',
									component: 'DataGrid',
									headerHeight: 37,
									rowHeight: 37,
									ellipsis: true,
									loading: '{{data.other.loading}}',
									className: 'ttk-es-app-ztconnetlist-content-content',
									rowsCount: '{{$getListRowsCount()}}',
									// rowsCount: '{{data.list ? data.list.length : 0}}',
									columns: [{
										name: 'code',
										component: 'DataGrid.Column',
										flexGrow: 1,
										columnKey: 'code',
										width: 200,
										// isResizable: true,
										header: {
											name: 'header',
											component: 'DataGrid.Cell',
											children: '税费种'
										},
										cell: {
											name: 'cell',
											component: 'DataGrid.Cell',
											tip: true,
											// className: 'mk-datagrid-cellContent-left',
											className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
											value: '{{data.list[_rowIndex].name}}',
											_power: '({rowIndex})=>rowIndex'
										}
									}, {
										name: 'name',
										component: 'DataGrid.Column',
										flexGrow: 1,
										columnKey: 'name',
										width: 50,
										header: {
											name: 'header',
											component: 'DataGrid.Cell',
											children: '申报期限'
										},
										cell: {
											name: 'cell',
											component: 'DataGrid.Cell',
											tip: true,
											// className: 'mk-datagrid-cellContent-left',
											className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
											value: '{{data.list[_rowIndex].time}}',
											_power: '({rowIndex})=>rowIndex'
										}
									}, {
										name: 'taxNumber',
										component: 'DataGrid.Column',
										flexGrow: 1,
										columnKey: 'taxNumber',
										width: 50,
										header: {
											name: 'header',
											component: 'DataGrid.Cell',
											children: '检查漏报'
										},
										cell: {
											name: 'cell',
											component: 'DataGrid.Cell',
											// className: 'mk-datagrid-cellContent-left',
											className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
											tip: true,
											value: '{{data.list[_rowIndex].isJCLB ? "是":"否"}}',
											_power: '({rowIndex})=>rowIndex'
										}
									},
									 {
										name: 'operation',
										component: 'DataGrid.Column',
										columnKey: 'operation',
										width: 100,
										header: {
											name: 'header',
											component: 'DataGrid.Cell',
											children: '操作'
										},
										cell: {
											name: 'cell',
											component: 'DataGrid.Cell',
											style: { display: 'flex' },
											_power: '({rowIndex})=>rowIndex',
											children: [
											// 	{
											// 	name: 'isEnable',
											// 	component: 'Icon',
											// 	fontFamily: 'edficon',
											// 	type: '{{data.list[_rowIndex].isEnable ? "tingyong-" : "qiyong-"}}',
											// 	style: {
											// 		fontSize: 23,
											// 		marginRight: '4px',
											// 		cursor: 'pointer'
											// 	},
											// 	title: '{{data.list[_rowIndex].isEnable ? "已启用" : "已停用"}}',
											// 	onClick: '{{$personStatusClick(data.list[_rowIndex], _rowIndex)}}'
											// },
											{
												name: 'update',
												component: 'Icon',
												fontFamily: 'edficon',
												type: 'bianji',
												style: {
													fontSize: 23,
													cursor: 'pointer'
												},
												title: '编辑',
												onClick: '{{$modifyDetail(data.list[_rowIndex].sbbDm,data.list[_rowIndex].id)}}'
											}, {
												name: 'remove',
												component: 'Icon',
												fontFamily: 'edficon',
												type: 'shanchu',
												style: {
													fontSize: 23,
													cursor: 'pointer'
												},
												title: '删除',
												onClick: '{{$delClick(data.list[_rowIndex].sbbDm,data.list[_rowIndex].id)}}'
											}]
										}
									}]
								}]
								}]
						},

					]
					},
					// {
					// 	name: 'footer',
					// 	component: '::div',
					// 	className: 'app-list-inventory-footer',
					// 	children: [{
					// 		name: 'pagination',
					// 		component: 'Pagination',
					// 		showSizeChanger: true,
					// 		pageSize: '{{data.pagination.pageSize}}',
					// 		current: '{{data.pagination.current}}',
					// 		total: '{{data.pagination.total}}',
					// 		onChange: '{{$pageChanged}}',
					// 		onShowSizeChange: '{{$pageChanged}}'
					// 	}]
					// }
				]
				}, {
					name: 'tab3',
					component: 'Tabs.TabPane',
					className: 'zgrdTab',
					forceRender: false,
					_visible: '{{data.other.isShowOtherMsg && data.uploadType == 0 }}',
					tab: '资格认定',
					key: '3',
					children: [{
						name: 'bar',
						component: '::div',
						className: 'refreshBtn',
						children: [{
							name: 'refresh',
							component: 'Icon',
							fontFamily: 'edficon',
							onClick: '{{$readOrgInfo}}',
							type: 'shuaxin',
							style: { float: 'left', fontSize: '28px', lineHeight: '30px' }
						}, {
							name: 'explain',
							component: '::span',
							style: { lineHeight: '30px', color: 'rgb(250, 149, 76)', fontSize: '12px', float: 'left' },
							children: '提示：刷新将重新更新企业信息'
						}]
					}, {
						name: 'zgrdDiv',
						component: '::div',
						children: [{
							name: 'dataGrid',
							component: 'DataGrid',
							headerHeight: 36,
							rowHeight: 36,
							rowsCount: '{{data.zgrdDtos.length}}',
							isColumnResizing: true,
							ellipsis: true,
							columns: [{
								name: 'ZGRDLX',
								component: 'DataGrid.Column',
								columnKey: 'ZGRDLX',
								flexGrow: 1,
								width: 300,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '资格认定类型'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									align: 'left',
									value: '{{$renderColValue(data.zgrdDtos[_rowIndex] && data.zgrdDtos[_rowIndex].ZGRDLX, data.enumData.tax.ZGRDLX.enumDetails)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}, {
								name: 'YXQKSRQ',
								component: 'DataGrid.Column',
								columnKey: 'YXQKSRQ',
								flexGrow: 1,
								width: 80,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '有效期开始日期'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									value: '{{$renderDate(data.zgrdDtos[_rowIndex] && data.zgrdDtos[_rowIndex].YXQKSRQ)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}, {
								name: 'YXQJSRQ',
								component: 'DataGrid.Column',
								columnKey: 'YXQJSRQ',
								flexGrow: 1,
								width: 80,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '有效期结束日期'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									value: '{{$renderDate(data.zgrdDtos[_rowIndex] && data.zgrdDtos[_rowIndex].YXQJSRQ)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}, {
								name: 'SJZZRQ',
								component: 'DataGrid.Column',
								columnKey: 'SJZZRQ',
								flexGrow: 1,
								width: 80,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '实际中止日期'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									value: '{{$renderDate(data.zgrdDtos[_rowIndex] && data.zgrdDtos[_rowIndex].SJZZRQ)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}]
						}]
					}]
				}, {
					name: 'tab4',
					component: 'Tabs.TabPane',
					forceRender: false,
					className: 'sfzxxTab',
					_visible: '{{data.other.isShowOtherMsg && data.uploadType == 0 }}',
					tab: '税费种信息',
					key: '4',
					children: [{
						name: 'bar',
						component: '::div',
						className: 'refreshBtn',
						children: [{
							name: 'refresh',
							component: 'Icon',
							onClick: '{{$readOrgInfo}}',
							fontFamily: 'edficon',
							type: 'shuaxin',
							style: { float: 'left', fontSize: '28px', lineHeight: '30px' }
						}, {
							name: 'explain',
							component: '::span',
							style: { lineHeight: '30px', color: 'rgb(250, 149, 76)', fontSize: '12px', float: 'left' },
							children: '提示：刷新将重新更新企业信息'
						}]
					}, {
						name: 'taxDiv',
						component: '::div',
						children: [{
							name: 'details',
							component: 'DataGrid',
							headerHeight: 36,
							rowHeight: 36,
							rowsCount: '{{data.sfzxxDtos.length}}',
							isColumnResizing: true,
							ellipsis: true,
							columns: [{
								name: 'SBXM',
								component: 'DataGrid.Column',
								columnKey: 'SBXM',
								flexGrow: 1,
								width: 300,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '申报项目'
								},
								cell: {
									name: 'cell',
									align: 'left',
									component: 'DataGrid.TextCell',
									value: '{{$renderColValue(data.sfzxxDtos[_rowIndex] && data.sfzxxDtos[_rowIndex].SBXM, data.enumData.tax.SBXM.enumDetails)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}, {
								name: 'SBPM',
								component: 'DataGrid.Column',
								columnKey: 'SBPM',
								flexGrow: 1,
								width: 300,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '申报品目'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									align: "left",
									value: '{{$renderColValue(data.sfzxxDtos[_rowIndex] && data.sfzxxDtos[_rowIndex].SBPM, data.enumData.tax.SBPM.enumDetails)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}, {
								name: 'NSQXDM',
								component: 'DataGrid.Column',
								columnKey: 'NSQXDM',
								flexGrow: 1,
								width: 30,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '纳税期限'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									value: '{{$renderColValue(data.sfzxxDtos[_rowIndex] && data.sfzxxDtos[_rowIndex].NSQXDM, data.enumData.tax.SBZQ.enumDetails)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}, {
								name: 'ZFSBZ',
								component: 'DataGrid.Column',
								columnKey: 'ZFSBZ',
								flexGrow: 1,
								width: 30,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '主附税标志'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									value: '{{$renderColValue(data.sfzxxDtos[_rowIndex] && data.sfzxxDtos[_rowIndex].ZFSBZ, data.enumData.tax.ZFSBZ.enumDetails)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}, {
								name: 'YXQQ',
								component: 'DataGrid.Column',
								columnKey: 'YXQQ',
								flexGrow: 1,
								width: 80,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '有效期起'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									value: '{{$renderDate(data.sfzxxDtos[_rowIndex] && data.sfzxxDtos[_rowIndex].YXQQ)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}, {
								name: 'YXQZ',
								component: 'DataGrid.Column',
								columnKey: 'YXQZ',
								flexGrow: 1,
								width: 80,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '有效期止'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									value: '{{$renderDate(data.sfzxxDtos[_rowIndex] && data.sfzxxDtos[_rowIndex].YXQZ)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}]
						}]
					}]
				},{
					name: 'tab5',
					component: 'Tabs.TabPane',
					forceRender: false,
					className: 'cwbbTab',
					tab: '财务报表设置',
					_visible: '{{ data.uploadType == 0 }}',
					key: '5',
					children: [{
						name: 'cwbbszTab',
						component: '::div',
						className:'cwbbszTab',
						children: [{
							name: 'content',
							component: '::div',
							className: 'edfx-app-org-main-content edfx-app-org-main-content-basicInfo',
							children: [{
								name: 'basic',
								component: '::div',
								children: [{
									name: 'title',
									className: 'cwbbszTabTitle',
									component: '::div',
									children: [{
										name: 'bar',
										component: '::div',
										className: 'refreshBtn',
										_visible: '{{$getCanEditSS()}}',
										children: [{
											name: 'refresh',
											component: 'Icon',
											fontFamily: 'edficon',
											onClick: '{{$readFinanceInfo2}}',
											type: 'shuaxin',
											style: { fontSize: '28px', lineHeight: '30px',float: 'left',border: '1px solid' }
										},{
											name: 'refreshTip',
											className: 'refreshTip',
											component: '::span',
											children: '点击刷新，将根据局端重新读取报送小类'
										}]
									 },{
										name: 'tab4Footer',
										component: '::div',
										className: 'tab4Footer',
										// _visible: '{{data.other.activeTabKey=="4"&&$getCanEditSS()}}',
										_visible: '{{data.other.activeTabKey=="5"}}',
										children: [{
												name: 'tab1SaveBtn',
												component: 'Button',
												type: 'primary',
												children: '保存',
												onClick: '{{$saveFinanceInfo}}',
												className: 'tab1EditBtn footerBtn',
											}
										]
									}]
								}, {
									name: 'block',
									component: '::div',
									children: [{
										name: 'line1',
										component: '::div',
										className: 'itemLine',
										children: [{
											name: 'rule',
											component: 'Form.Item',
											colon: false,
											label: '财务会计制度准则：',
											validateStatus: "{{data.error.accountingStandardsId?'error':'success'}}",
											help: '{{data.error.accountingStandardsId}}',
											required: true,
											children: {
												name: 'select',
												component: '::div',
												style: { position: 'relative' },
												children: [{
													name: 'select',
													component: 'Select',
													// disabled: '{{!$getCanEditSS()}}',
													disabled: true,
													// disabled: '{{data.other.isReadOnly || !data.other.canModify}}',
													// getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-basicInfo")}}}',
													showSearch: false,
													value: '{{data.financeReportSettingDto.accountingStandardsId}}',
													onChange: "{{function(e){$setTab4Field('data.financeReportSettingDto.accountingStandardsId',e)}}}",
													children: {
														name: 'option',
														component: 'Select.Option',
														value: '{{data.other.rules[_rowIndex].code}}',
														children: '{{data.other.rules[_rowIndex].name}}',
														_power: 'for in data.other.rules',
													}
												}, {
													name: 'shadow',
													component: '::div',
													_visible: false,
													// _visible: '{{!data.other.canModify}}',
													className: 'shadow'
												}]
											}
										}]
									}, {
										name: 'line2',
										component: '::div',
										className: 'itemLine',
										children: [{
											name: 'type',
											component: 'Form.Item',
											colon: false,
											label: '资料报送小类：',
											validateStatus: "{{data.error.reportingCategoryCode?'error':'success'}}",
											help: '{{data.error.reportingCategoryCode}}',
											required: true,
											children: {
												name: 'select',
												component: '::div',
												style: { position: 'relative' },
												children: [{
													name: 'select',
													component: 'Select',
													allowClear:true,
													// disabled: '{{data.other.isReadOnly || !data.other.canModify}}',
													// getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-basicInfo")}}}',
													showSearch: true,
													filterOption:'{{$filterTypes}}',
													value: '{{data.financeReportSettingDto.reportingCategoryCode}}',
													onChange: "{{function(e){$setTab4Field('data.financeReportSettingDto.reportingCategoryCode',e)}}}",
													children: {
														name: 'option',
														component: 'Select.Option',
														value: '{{data.other.types[_rowIndex].reportingCategoryCode}}',
														children: '{{data.other.types[_rowIndex].reportingCategoryName}}',
														_power: 'for in data.other.types',
													}
												}, {
													name: 'shadow',
													component: '::div',
													// _visible: '{{!data.other.canModify}}',
													_visible: false,
													className: 'shadow'
												}]
											}
										}]
									}, {
										name: 'line3',
										component: '::div',
										className: 'itemLine',
										children: [{
											name: 'during',
											component: 'Form.Item',
											colon: false,
											label: '报送期间：',
											validateStatus: "{{data.error.reportingPeriod?'error':'success'}}",
											help: '{{data.error.reportingPeriod}}',
											required: true,
											children: {
												name: 'select',
												component: '::div',
												style: { position: 'relative' },
												children: [{
													name: 'select',
													component: 'Select',
													// disabled: '{{!$getCanEditSS()}}',
													// disabled: '{{data.other.isReadOnly || !data.other.canModify}}',
													// getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-basicInfo")}}}',
													showSearch: false,
													value: '{{data.financeReportSettingDto.reportingPeriod}}',
													onChange: "{{function(e){$setTab4Field('data.financeReportSettingDto.reportingPeriod',e)}}}",
													children: {
														name: 'option',
														component: 'Select.Option',
														value: '{{data.other.durings[_rowIndex].id}}',
														children: '{{data.other.durings[_rowIndex].name}}',
														_power: 'for in data.other.durings',
													}
												}, {
													name: 'shadow',
													component: '::div',
													// _visible: '{{!data.other.canModify}}',
													_visible: false,
													className: 'shadow'
												}]
											}
										}]
									}]
								}]
							},{
								name: 'message',
								component: '::div',
								// 广东44：不允许修改，接口返回什么就显示什么，返回空，也显示空。
								// 福建35，陕西61，贵州52，北京11，青海63：可修改。
								// _visible: '{{$getCanEditSS()}}',
								className:'textTips',
								children: [{
									name: 'messageTitle',
									className: 'messageTitle',
									component: '::div',
									children: '温馨提示：'
								}, {
									name: 'messageItem1',
									className: 'messageItem',
									component: '::div',
									children: '	财务报表报送类型以资料报送小类为准，目前系统仅支持小企业会计准则、企业会计准则（一般企业）、企业会计制度进行申报'
								},
								// {
								// 	name: 'messageItem2',
								// 	className: 'messageItem',
								// 	component: '::div',
								// 	children: '2、手工编辑数据后，将以编辑后的数据为准，如需从局端获取，请点击左侧的刷新按钮。'
								// }
							]
							}]
						}]
					}]
				},]
			}, {
				name: 'reinit',
				component: '::div',
				className: 'reinit',
				_visible: '{{!(data.appVersion == 105)}}',
				onClick: '{{$reinit}}',
				children: [{
					name: 'icon',
					component: 'Icon',
					fontFamily: 'edficon',
					type: 'zhongxinchushihua'
				}, {
					name: 'explain',
					component: '::span',
					children: '重新初始化'
				}]
			}]
		}]

	}
}

export function getInitState() {
    //判断是否是报税工作台
    let bsgztAccess = sessionStorage['thirdPartysourceType'] == 'bsgzt' ? 1 : 0
	return {
		data: {
			orgId:null,
			basic: {
				name: null,
				accountingStandards: null,
				enableDate: null,
				vatTaxpayer: null,
				vatTaxpayerNum: null,
				isSignAndRetreat: false,
				ss: null,
				dlfs: null,
				ieEnv: false,
				wbzh: null,
				wbmm: null,
				gssbmm: '',
				oldVatTaxpayerNum:'',
				isTutorialDate:false,
			},
			nsxxInfo:{
				NSRSBH:'',  //--纳税人识别号
				NSRMC:'',  //--纳税人名称
				SSHY:null,   //--所属行业
				NSRZT:'',//--纳税人状态
				NSRZTDM:'',//--纳税人状态代码
				ZCZB:'',//--注册资本
				DJZCLX:'',//--登记注册类型
				JYFW:'',//--经营范围
				SCJYDZ:'',//--生产经营地址
				ZCDZ:'',//--注册地址
				NSRDZDA:'',//--纳税人电子档案
				DJXH:'',//--登记序号
				DJRQ:'',//--登记日期
				KYRQ:'',//--开业日期
				KHYH:'',//--开户银行
				YHZH:'',//--银行账户
				CYRS:'',//--从业人数
				ZZSQYLX:'',//--增值税企业类型
				GDGHLX:'',//--国地管户类型
				ZGSWJ:'',//--主管税务局
				ZGSWRY:'',//--主管税务人员
				ZGSWJGDM:'',//--主管税务机关代码
				FDFZR:'',//--法定负责人
				FDFZR_TEL:'',//--法定负责人电话
				CWFZR:'',//--财务负责人
				CWFZR_TEL:'',//--财务负责人电话
				BSY:'',//--办税员
				BSY_TEL:'',//--办税员电话
				QYSDSLX:'',//--企业所得税类型
				XYDJ:'',//--信用等级
				DKDJBZ:'',//--代扣代缴标志
				FDFZR_SFZJLX:'',//--法定负责人身份证件类型
				FDFZR_SFZJHM:'',//--法定负责人身份证件号码
				BSY_SFZJLX:'',//--办税员身份证件类型
				BSY_SFZJHM:'',//--办税员身份证件号码
				SWDJBLX:'',//--税务登记表类型
				ZZJGDM:'',//--组织机构代码
				ZFJGBZ:'',//--总分机构标志
				HYDM:'',//--行业代码
				ZCDZXZQHSZDM:'',//--注册地址行政区划数字代码
				JDXZDM:'',//--街道乡镇代码
				ZGSWSKFJDM:'',//--主管税务所（科、分局）代码
				ZGSWSKFJMC:'',//--主管税务所（科、分局）名称
				SFXYH:''//--三方协议号
			},
			nsxxDto: {
				SCJYDZ: null,
				ZGSWRY: null,
				BSY: null,
				ZCZB: null,
				BSY_TEL: null,
				CWFZR_TEL: null,
				NSRDZDA: null,
				FDFZR: null,
				FDFZR_TEL: null,
				DKDJBZ: null,
				ZGSWJ: null,
				ZZSQYLX: null,
				SSHY: null,
				YHZH: null,
				CWFZR: null,
				JYFW: null,
				NSRZTDM: null,
				DJXH: null,
				CYRS: null,
				DJZCLX: null,
				KYRQ: null,
				KHYH: null,
				XYDJ: null,
				ZZJGDM: null,
				ZFJGBZ: null
			},
			enumIdList:{
				200031: [],
                200032: [],
                200033: [],
                200034: [],
                200022: [],
                200035: [],
			},
			uploadType:0,//上报方式类别（0代表非机器人，1代表机器人）
			zgrdDtos: [],
			sfzxxDtos: [],
			enumData: {
				basic: {},
				tax: {},
				dkswjgshEnum: []	    //代开税务机关税号s
			},
			initState: {
				enableDate: null,
				name: null,
				pwd: null
			},
			financeReportSettingDto: {
			},
			copyFinance: {
			},
			other: {
				canModify: true,
				CAStep: true,			//是否显示CA登录的详细信息
				hasReadCA: false,		//是否已读取过证书
				readOrgInfoBtn: true,	//读取按钮是否置灰
				key: '11',
				activeTabKey: '1',
				isShowOtherMsg: false,
				detailInfo: false,
				title1: true,
				title2: true,
				title3: true,
				title11: true,
				title12: true,
				title13: true,
				isNetAccount: false,
				showDkswjgsh: false,
				authenticationWebsite: {
					"11": {
						name: "北京实名认证网站",
						website: "http://12366.bjsat.gov.cn/user/login?login_callback=/"
					}
				},
				caExpire: false,
				isReadOnly: false,
				isShowFirstTab: true,			//是否显示第一个Tab.
				openSjvatTaxpayerChangeStateState: 0,				//是否更新企业信息
			},
			error: {
				orgInfo: {},
				taxInfo: {}
			},
			list: [],
			entity:{
			},
			pagination: {
				current: 1,
				total: 0,
				pageSize: 10
			},
			inputReadOnly: true,
            bsgztAccess, //办税工作台对接
		}
	}
}
