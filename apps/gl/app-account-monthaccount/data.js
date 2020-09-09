// import { consts } from 'edf-consts'
// import moment from 'moment'
// import utils from 'edf-utils'
import certi from '../../../vendor/img/gl/certi.png'
import shixin from '../../../vendor/img/gl/shixin.png'
export function getMeta() {

	return {
		name: 'root',
		component: 'Layout',
		className: 'app-account-monthaccount',
		children: {
			name: 'spin',
			component: 'Spin',
			tip: '数据加载中...',
			className: 'spinContainer',
			spinning: '{{data.loading}}',
			size: 'large',
			children: [
				{
					name: 'header',
					component: '::div',
					className: 'app-account-monthaccount-header',
					children: [
						{
							name: 'title',
							component: '::span',
							children: '会计期间 ',
							style: { float: 'left', height: '30px', lineHeight: '30px', marginRight: '8px', fontSize: '12px' }
						},
						{
							name: 'date',
							allowClear: false,
							component: 'DatePicker.MonthPicker',
							className: 'app-account-monthaccount-header-left',
							value: '{{$stringToMoment(data.other.period)}}',
							placeholder: '',
							dropdownClassName: 'app-account-monthaccount-header-datePicker',
							monthCellContentRender: '{{$monthCellCustom}}',
							onChange: `{{function(d){$setField('data.other.period', $momentToString(d,'YYYY-MM'))}}}`,
							disabledDate: `{{function(current){ var disabledDate = new Date(data.other.disabledDate)
								return current && current.valueOf() < disabledDate
							}}}`,
						},
						{
							name: 'refreshBtn',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'shuaxin',
							className: 'refresh',
							title: '刷新',
							onClick: '{{$refresh}}'
						},
						{
							name: 'rightBtn',
							component: '::div',
							className: 'app-account-monthaccount-header-right',
							_visible: '{{data.other.currentMenu=="cerficate"}}',
							children: [
								{
									name: 'rightBtn',
									component: '::div',
									className: 'app-account-monthaccount-header-right-setting',
									children: [{
										name: 'setting',
										component: 'Radio.Group',
										disabled: '{{!data.other.isEdit}}',
										value: '{{data.generateMode}}',
										children: [{
											name: 'borrow',
											component: 'Radio',
											value: 1,
											children: '系统自动生成'
										}, {
											name: 'helpPopover',
											component: 'Popover',
											content: '系统在获取到信息后，将会实时生成相关凭证，无需手工点击“生成凭证”按钮，但请核对凭证是否准确 ',
											placement: 'rightTop',
											overlayClassName: 'app-account-monthaccount-helpPopover',
											children: {
												name: 'helpIcon',
												component: 'Icon',
												fontFamily: 'edficon',
												type: 'bangzhutishi',
												className: 'helpIcon'
											}
										},{
											name: 'loan',
											component: 'Radio',
											value: 0,
											children: '手工点击生成'
										},
										{
											name: 'helpPopover',
											component: 'Popover',
											content: '需要手工点击“生成凭证”按钮，人工生成凭证',
											placement: 'rightTop',
											overlayClassName: 'app-account-monthaccount-helpPopover',
											children: {
												name: 'helpIcon',
												component: 'Icon',
												fontFamily: 'edficon',
												type: 'bangzhutishi',
												className: 'helpIcon'
											}
										}
									],
										onChange: `{{function(v){$setField('data.generateMode',v.target.value)}}}`,
									}]
								},
								{
									name: 'create',
									component: 'Button',
									className: 'generateBtn',
									_visible: '{{data.generateMode==1||!data.other.isEdit?false:true}}',
									type: 'primary',
									children: '一键生成',
									onClick: '{{function(){$batchGenerate()}}}'
								}
							]
						}
					]
				},
				{
					name: 'content',
					component: 'Layout',
					className: 'app-account-monthaccount-content',
					children: [{
						name: 'monthLeft',
						component: '::div',
						className: 'month-left',
						children: [
							{
								name: 'menu1',
								component: '::div',
								className: '{{data.other.currentMenu=="cerficate"?"currentMenu menu":"menu"}}',
								onClick: '{{function(){$clickMenu("cerficate")}}}',
								onMouseOver: '{{function(){$mouseMenu("cerficate")}}}',
								onMouseLeave: '{{function(){$mouseOutMenu()}}}',
								children: [{
									name: 'line',
									component: '::div',
									className: '{{data.other.currentMenuLine=="cerficate"?"currentLine1 menuLeft":"menuLeft"}}'
								}, {
									name: 'line',
									component: '::div',
									className: 'menuRight',
									children: [
										{
											name: 'title',
											component: '::div',
											className: 'menuTitle',
											children: [
												{
													name: 'num',
													component: '::span',
													className: 'num',
													children: '1'
												},
												{
													name: 'name',
													component: '::span',
													className: 'name',
													children: '期末凭证'
												}
											]
										},
										{
											name: 'icon',
											component: '::div',
											className: 'icon',
											children: {
												name: 'img',
												component: '::img',
												src: `${certi}`
											}
										},
										{
											name: 'name',
											component: 'Button',
											className: 'viewCerficate',
											children: '期末凭证'
										}
									]
								},
								{
									name: 'name',
									component: '::div',
									className: 'arrow',
								}
								]
							},
							{
								name: 'menu2',
								component: '::div',
								className: '{{data.other.currentMenu=="account"?"currentMenu menu1 menu":"menu1 menu"}}',
								onClick: '{{function(){$clickMenu("account")}}}',
								onMouseOver: '{{function(){$mouseMenu("account")}}}',
								onMouseLeave: '{{function(){$mouseOutMenu()}}}',
								children: [{
									name: 'line',
									component: '::div',
									className: '{{data.other.currentMenuLine=="account"?"currentLine2 menuLeft":"menuLeft"}}'
								}, {
									name: 'line',
									component: '::div',
									className: 'menuRight',
									children: [
										{
											name: 'title',
											component: '::div',
											className: 'menuTitle',
											children: [
												{
													name: 'num',
													component: '::span',
													className: 'num',
													children: '2'
												},
												{
													name: 'name',
													component: '::span',
													className: 'name',
													children: '期末结账'
												}
											]
										},
										{
											name: 'icon',
											component: '::div',
											className: 'icon',
											children: {
												name: 'img',
												component: '::img',
												src: `${shixin}`
											}
										},
										{
											name: 'name',
											component: '::div',
											className: 'btnContainer',
											children: [
												{
													name: 'name',
													component: 'Button',
													className: 'checkBtn',
													style: { diaplay: 'block', marginRight: '10px' },
													children: '{{data.other.checkBtn?"立即检查":"重新检查"}}',
													onClick: '{{$accountCheck}}',
												},
												{
													name: 'name',
													component: 'Button',
													className: '{{data.other.isEdit?"endingClosingBtn":"endingClosingBtn noEdit"}}',
													style: { diaplay: 'block' },
													disabled: '{{!data.other.isEdit}}',
													_visible: '{{!data.other.unMonthEndingClosingBtn}}',
													children: '{{data.continueEndClosing?"继续结账":"直接结账"}}',
													onClick: '{{$monthEndingClosing}}',
												},
												{
													name: 'name',
													component: 'Button',
													_visible: '{{data.other.unMonthEndingClosingBtn}}',
													className: 'unendingClosingBtn endingClosingBtn',
													style: { diaplay: 'block', marginRight: '10px' },
													children: '反结账',
													onClick: '{{$undoMonthEndingClosing}}'

												},
											]
										}

									]
								},
								{
									name: 'name',
									component: '::div',
									className: 'arrow',
								}
								]
							}
						]
					},
					{
						name: 'monthRight',
						component: '::div',
						className: 'month-right',
						style: { display: '{{data.other.currentMenu=="account"?"block":"none"}}' },
						children: [
							{
								name: 'spin',
								component: '::div',
								tip: '数据加载中...',
								spinning: false,
								size: 'large',
								children: {
									name: 'content',
									component: 'Collapse',
									activeKey: '{{data.activeKey}}',
									onChange: '{{function(key){$collapseExpand(key)}}}',
									className: 'account-content',
									children: [{
										name: 'subcontent',
										component: 'Collapse.Panel',
										disabled: '{{!data.activeBtn}}',
										style: { display: '{{data.initialBalanceShow == true?"block":"none"}}' },
										className: 'account-content-item',
										key: 'item1',
										header: {
											name: 'subcontent1',
											component: '::div',
											className: 'item-title',
											children: [
												{
													name: 'left',
													component: '::img',
													src: '{{$getPhoto("initialBalance")}}',
													className: 'title-icon',
												},
												{
													name: 'subcontent1',
													component: '::p',
													className: 'item-text',
													children: '期初余额检查'
												},
											]
										},
										children: [{
											name: 'subcontent2',
											component: '::div',
											className: 'item-content1',
											style: { display: '{{data.isBtnShow ?"none":"block"}}' },
											children: [
												{
													name: 'subcontent2',
													component: '::div',
													className: 'item-content',
													children: [{
														name: 'subcontent2',
														component: '::div',
														className: '{{data.accountCheck.initialBalance && data.accountCheck.initialBalance.checkPeriodBegin?"subContent":"redSign subContent"}}',
														children: [
															{
																name: 'left',
																component: '::div',
																className: 'left',
																children: [
																	{
																		name: 'icon',
																		component: 'Icon',
																		type: '{{data.accountCheck.initialBalance && data.accountCheck.initialBalance.checkPeriodBegin?"chenggongtishi":"jinggao"}}',
																		fontFamily: 'edficon',
																		className: 'itemIcon'
																	},
																	{
																		name: 'item',
																		component: '::div',
																		style: { display: 'inline' },
																		children: '{{data.accountCheck.initialBalance && data.accountCheck.initialBalance.checkPeriodBegin?"期初余额试算平衡":"期初余额试算不平衡，请处理"}}'
																	},
																]
															},

															{
																name: 'btn1',
																component: '::a',
																onClick: '{{$goBeginBalance}}',
																style: { display: '{{data.accountCheck.initialBalance&&data.accountCheck.initialBalance.checkPeriodBegin?"none":"block"}}' },
																className: 'item-btn redBtn',
																children: '期初余额'
															}
														]
													}, {
														name: 'subcontent2',
														component: '::div',
														style: { display: '{{data.currentAccount&&parseInt(data.currentAccount.month) == 1?"none":"block"}}' },
														className: '{{data.accountCheck.initialBalance && data.accountCheck.initialBalance.checkYearBegin?"subContent":"redSign subContent"}}',
														children: [
															{
																name: 'left',
																component: '::div',
																className: 'left',
																children: [
																	{
																		name: 'icon',
																		component: 'Icon',
																		type: '{{data.accountCheck.initialBalance && data.accountCheck.initialBalance.checkYearBegin?"chenggongtishi":"jinggao"}}',
																		fontFamily: 'edficon',
																		className: 'itemIcon'
																	},
																	{
																		name: 'item',
																		component: '::div',
																		children: '{{data.accountCheck.initialBalance && data.accountCheck.initialBalance.checkYearBegin?"年初余额试算平衡":"年初余额试算不平衡，请处理"}}'
																	}
																]
															},
															{
																name: 'btn1',
																component: '::a',
																onClick: '{{$goBeginBalance}}',
																style: { display: '{{data.accountCheck.initialBalance&&data.accountCheck.initialBalance.checkYearBegin?"none":"block"}}' },
																className: 'item-btn redBtn',
																children: '期初余额'
															}
														]
													}, {
														name: 'subcontent2',
														component: '::div',
														_visible: '{{data.other.accountingStandards != 2000020008}}',
														className: '{{data.accountCheck.initialBalance && data.accountCheck.initialBalance.checkLossProfit?"subContent":"redSign subContent"}}',
														children: [
															{
																name: 'left',
																component: '::div',
																className: 'left',
																children: [
																	{
																		name: 'icon',
																		component: 'Icon',
																		type: '{{data.accountCheck.initialBalance && data.accountCheck.initialBalance.checkLossProfit?"chenggongtishi":"jinggao"}}',
																		fontFamily: 'edficon',
																		className: 'itemIcon'
																	},
																	{
																		name: 'item',
																		component: '::div',
																		children: '{{data.accountCheck.initialBalance && data.accountCheck.initialBalance.checkLossProfit?"损益类科目的期初余额为0":"损益类科目的期初余额不为0"}}'
																	}
																]
															},

															{
																name: 'btn1',
																component: '::a',
																onClick: '{{$goBeginBalance}}',
																style: { display: '{{data.accountCheck.initialBalance&&data.accountCheck.initialBalance.checkLossProfit?"none":"block"}}' },
																className: 'item-btn redBtn',
																children: '期初余额'
															}
														]
													}]
												}
											]
										}]
									},
									{
										name: 'subcontent',
										component: 'Collapse.Panel',
										disabled: '{{!data.activeBtn}}',
										className: 'account-content-item',
										key: 'item2',
										header: {
											name: 'subcontent1',
											component: '::div',
											className: 'item-title',
											children: [
												{
													name: 'left',
													component: '::img',
													src: '{{$getPhoto("voucherAudit")}}',
													className: 'title-icon',
												},
												{
													name: 'subcontent1',
													component: '::p',
													className: 'item-text',
													children: '凭证检查'
												},
											]
										},
										children: [
											{
												name: 'subcontent2',
												component: '::div',
												className: 'item-content1',
												children: [
													{
														name: 'subcontent2',
														component: '::div',
														className: 'item-content',
														children: [{
															name: 'subcontent-item1',
															component: '::div',
															className: '{{data.accountCheck.voucherAudit && data.accountCheck.voucherAudit.docExistence?"subContent":"yellowSign subContent"}}',
															children: [
																{
																	name: 'left',
																	component: '::div',
																	className: 'left',
																	children: [
																		{
																			name: 'icon',
																			component: 'Icon',
																			type: '{{data.accountCheck.voucherAudit && data.accountCheck.voucherAudit.docExistence?"chenggongtishi":"jinggao"}}',
																			fontFamily: 'edficon',
																			className: 'itemIcon'
																		},
																		{
																			name: 'item',
																			component: '::div',
																			children: '{{data.accountCheck.voucherAudit && data.accountCheck.voucherAudit.docExistence?"本月不存在未审核凭证":"本月存在未审核凭证，建议审核"}}'
																		}
																	]
																},
																{
																	name: 'btn1',
																	component: '::a',
																	onClick: '{{$goVoucherAudit}}',
																	style: { display: '{{data.accountCheck.voucherAudit&&data.accountCheck.voucherAudit.docExistence?"none":"block"}}' },
																	className: '{{data.accountCheck.voucherAudit && data.accountCheck.voucherAudit.docExistence == false?"yellowBtn item-btn":"item-btn yellowBtn"}}',
																	children: '凭证管理'
																}
															]
														}, {
															name: 'subcontent-item2',
															component: '::div',
															className: 'subContent',
															children: [
																{
																	name: 'left',
																	component: '::div',
																	className: 'left',
																	children: [
																		{
																			name: 'icon',
																			component: 'Icon',
																			type: 'chenggongtishi',
																			fontFamily: 'edficon',
																			className: 'itemIcon'
																		},
																		{
																			name: 'item',
																			component: '::div',
																			children: '{{data.accountCheck.voucherAudit&&"本月凭证数：" + data.accountCheck.voucherAudit.docCount}}'
																		}
																	]
																}
															]
														}, {
															name: 'subcontent-item3',
															component: '::div',
															className: 'subContent',
															children: [
																{
																	name: 'left',
																	component: '::div',
																	className: 'left',
																	children: [
																		{
																			name: 'icon',
																			component: 'Icon',
																			type: 'chenggongtishi',
																			fontFamily: 'edficon',
																			className: 'itemIcon'
																		},
																		{
																			name: 'item',
																			component: '::div',
																			children: '{{data.accountCheck.voucherAudit&&"本月已审核凭证数：" + data.accountCheck.voucherAudit.auditDocCount}}'
																		}
																	]
																}
															]
														}, {
															name: 'subcontent2',
															component: '::div',
															className: '{{data.accountCheck.documentNumber && data.accountCheck.documentNumber.docCodeIsSeries?"subContent":"yellowSign subContent"}}',
															children: [
																{
																	name: 'left',
																	component: '::div',
																	className: 'left',
																	children: [
																		{
																			name: 'icon',
																			component: 'Icon',
																			type: '{{data.accountCheck.documentNumber && data.accountCheck.documentNumber.docCodeIsSeries?"chenggongtishi":"jinggao"}}',
																			fontFamily: 'edficon',
																			className: 'itemIcon'
																		},
																		{
																			name: 'item',
																			component: '::div',
																			children: '{{data.accountCheck.documentNumber && data.accountCheck.documentNumber.docCodeIsSeries?"凭证不存在断号":"凭证存在断号，请处理"}}'
																		}
																	]
																},
																{
																	name: 'btn1',
																	component: '::a',
																	onClick: '{{$goVoucherAudit}}',
																	style: { display: '{{data.accountCheck.voucherAudit&&data.accountCheck.documentNumber.docCodeIsSeries?"none":"block"}}' },
																	className: '{{data.accountCheck.voucherAudit && data.accountCheck.documentNumber.docCodeIsSeries == false?"yellowBtn item-btn":"item-btn "}}',
																	children: '凭证管理'
																}
															]
														}, {
															name: 'subcontent2',
															component: '::div',
															className: '{{data.accountCheck.documentNumber && data.accountCheck.documentNumber.docCodeIsSequence?"subContent":"yellowSign subContent"}}',
															children: [
																{
																	name: 'left',
																	component: '::div',
																	className: 'left',
																	children: [
																		{
																			name: 'icon',
																			component: 'Icon',
																			type: '{{data.accountCheck.documentNumber && data.accountCheck.documentNumber.docCodeIsSequence?"chenggongtishi":"jinggao"}}',
																			fontFamily: 'edficon',
																			className: 'itemIcon'
																		},
																		{
																			name: 'item',
																			component: '::div',
																			children: '{{data.accountCheck.documentNumber && data.accountCheck.documentNumber.docCodeIsSequence?"本月凭证号已按凭证日期排序":"本月凭证号没有按凭证日期排序"}}'
																		}
																	]
																},
																{
																	name: 'btn1',
																	component: '::a',
																	onClick: '{{$goVoucherAudit}}',
																	style: { display: '{{data.accountCheck.voucherAudit&&data.accountCheck.documentNumber.docCodeIsSequence?"none":"block"}}' },
																	className: '{{data.accountCheck.voucherAudit && data.accountCheck.documentNumber.docCodeIsSequence == false?"yellowBtn item-btn":"item-btn "}}',
																	children: '凭证管理'
																}
															]
														}
														]
													}
												]
											}
										]
									},
									{
										name: 'subcontent',
										component: 'Collapse.Panel',
										disabled: '{{!data.activeBtn}}',
										className: 'account-content-item',
										key: 'item3',
										header: {
											name: 'subcontent1',
											component: '::div',
											className: 'item-title',
											children: [
												{
													name: 'left',
													component: '::img',
													src: '{{$getPhoto("accountBalanceCheck")}}',
													className: 'title-icon',
												},
												{
													name: 'subcontent1',
													component: '::p',
													className: 'item-text',
													children: '科目余额'
												},
											]
										},
										children: [{
											name: 'subcontent2',
											component: '::div',
											className: 'item-content ',
											children: [{
												name: 'subcontent2',
												component: '::div',
												className: 'subContent accountBalance',
												children: {
													name: 'option',
													component: '::div',
													key: '{{_rowIndex}}',
													className: 'subItem',
													style: {
														display: `{{$getSubContentDisplay(data,data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex])}}`
													},
													children: [
														{
															name: 'icon',
															component: 'Icon',
															type: '{{$getIconType(data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex])}}',
															style: { display: `{{data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex].grade !=1?"none":"inline-block"}}` },
															fontFamily: 'edficon',
															className: 'itemIcon'
														},
														{
															name: 'option',
															component: '::div',
															className: 'item-left',
															style: { display: `{{data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex].grade !=1?"none":"inline-block"}}` },
															title: '{{data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex].gradeName}}',
															children: '{{$getGradeName(data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex])}}'
														},
														{
															name: 'option',
															component: '::div',
															style: { display: `{{data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex].accountBalance < 0?"inline-block":"none"}}` },
															className: 'item-right ',
															children: [
																{
																	name: 'option',
																	component: '::span',
																	className: 'item-code yellowSign',
																	children: '{{data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex].accountCode}}'
																}, {
																	name: 'option',
																	component: '::span',
																	className: 'item-name yellowSign',

																	children: '{{data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex].accountName}}'
																}, {
																	name: 'option',
																	component: '::span',
																	className: 'item-balance yellowSign',
																	children: '余额小于0,'
																}, {
																	name: 'option',
																	component: '::div',
																	className: 'item-link',
																	children: [
																		{
																			name: 'option',
																			component: '::span',
																			children: '查看',
																			style: { marginRight: '3px' }
																		}, {
																			name: 'option',
																			component: '::a',
																			className: 'detail',
																			onClick: '{{function(){$goDetailAccount(data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex].accountCode)}}}',
																			children: '明细账'
																		}
																	]
																}
															]
														}, {
															name: 'option',
															component: '::div',
															className: 'item-right',
															children: '{{$getIsNormal(data.accountCheck.mecBalanceDto.mecDtoList[_rowIndex])}}'
														}
													],
													_power: 'for in data.accountCheck.mecBalanceDto.mecDtoList'
												}
											},

											{
												name: 'subcontent3',
												component: '::div',
												className: 'subContent accountBalance',
												children: {
													name: 'option',
													component: '::div',
													key: '{{_rowIndex}}',
													className: 'subItem',
													style: {
														display: `{{$getSubContent3Display(data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex])}}`
													},
													children: [
														{
															name: 'icon',
															component: 'Icon',
															type: '{{$getIconType1(data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex])}}',
															style: { display: `{{data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].total?"inline-block":"none"}}` },
															fontFamily: 'edficon',
															className: 'itemIcon'
														},
														{
															name: 'option',
															component: '::div',
															className: 'item-left',
															style: { display: `{{data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].total?"inline-block":"none"}}` },
															title: `{{$getSubContentChildren1(data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex])}}`,
															children:
																`{{$getSubContentChildren1(data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex])}}`
														},
														{
															name: 'option',
															component: '::div',
															style: { display: '{{data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].diffVal<0 &&data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].total != true ?"inline-block":"none"}}' },
															className: 'item-right ',
															children: [
																{
																	name: 'option',
																	component: '::span',
																	className: 'item-code yellowSign',
																	style: { marginRight: '5px' },
																	children: '{{data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].accountCode1}}'
																},
																{
																	name: 'option',
																	component: '::span',
																	className: 'item-name yellowSign',
																	style: { marginRight: 0 },
																	children: '{{data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].accountName1}}'
																}, {
																	name: 'option',
																	component: '::span',
																	className: 'item-balance yellowSign',
																	children: '原值 -'
																}, {

																	name: 'option',
																	component: '::span',
																	className: 'item-code yellowSign',
																	style: { marginRight: '5px' },
																	children: '{{data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].accountCode2}}'

																}, {
																	name: 'option',
																	component: '::span',
																	className: 'item-name yellowSign',
																	style: { marginRight: 0 },
																	children: '{{data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].accountName2}}'
																}, {
																	name: 'option',
																	component: '::span',
																	className: 'item-name yellowSign',
																	style: { marginRight: 0 },
																	children: `{{$getSubContentChildren2(data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex])}}`

																}, {
																	name: 'option',
																	component: '::span',
																	className: 'yellowSign',
																	children: '<0，'
																}, {
																	name: 'option',
																	component: '::div',
																	className: 'item-link',
																	children: [
																		{
																			name: 'option',
																			component: '::span',
																			children: '查看',
																			style: { marginRight: '3px' }
																		}, {
																			name: 'option',
																			component: '::a',
																			className: 'detail',
																			onClick: '{{function(){$goBalanceAccount(data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].accountCode1.slice(0,4),data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].accountCode2.slice(0,4))}}}',
																			children: '余额表'
																		}
																	]
																}
															]
														}, {
															name: 'option',
															component: '::div',
															style: { display: '{{data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].total?"inline-block":"none"}}' },
															className: 'item-right',
															children: '{{data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList[_rowIndex].diffVal < 0?"异常":"正常"}}'
														}
													],
													_power: 'for in data.accountCheck.mecBalanceDto.mecBalanceDiffDtoList'
												}
											}
											]
										}]
									},
									{
										name: 'subcontent',
										component: 'Collapse.Panel',
										disabled: '{{!data.activeBtn}}',
										className: 'account-content-item',
										key: 'item4',
										header: {
											name: 'subcontent1',
											component: '::div',
											className: 'item-title',
											children: [

												{
													name: 'left',
													component: '::img',
													src: '{{$getPhoto("profitLoss")}}',
													className: 'title-icon',
												},
												{
													name: 'subcontent1',
													component: '::p',
													className: 'item-text',
													children: '{{$getCarryForwardCheckTitle()}}'
												},

											]
										},
										children: [
											{
												name: 'subcontent2',
												component: '::div',
												className: 'item-content1 ',
												children: [{
													name: 'subcontent2',
													component: '::div',
													className: 'item-content profitLoss',
													style: { display: '{{data.isBtnShow?"none":"flex"}}' },
													children: [
														{
															name: 'left',
															component: '::div',
															className: 'left',
															children: [
																{
																	name: 'icon',
																	component: 'Icon',
																	type: '{{data.accountCheck && data.accountCheck.profitLoss == 0?"jinggao":"chenggongtishi"}}',
																	fontFamily: 'edficon',
																	className: 'itemIcon'
																},
																{
																	name: 'subcontent2',
																	component: '::div',
																	style: { display: 'inline' },
																	className: '{{data.accountCheck && data.accountCheck.profitLoss == 0?"redSign subContent":"subContent"}}',
																	children: '{{data.profitLossAccount && data.profitLossAccount}}'
																}
															]
														},
														{
															name: 'btn1',
															component: '::a',
															onClick: '{{$goProfitLoss}}',
															style: { display: '{{data.accountCheck&&data.accountCheck.profitLoss == 0?"block":"none"}}' },
															className: 'item-btn redBtn',
															children: '{{$getCarryForwardTitle()}}'
														}
													]
												}
												]
											}]
									},
									{
										name: 'subcontent',
										component: 'Collapse.Panel',
										disabled: '{{!data.activeBtn}}',
										className: 'account-content-item',
										key: 'item5',
										header: {
											name: 'subcontent1',
											component: '::div',
											className: 'item-title',
											children: [
												{
													name: 'left',
													component: '::img',
													src: '{{$getPhoto("reportCheck")}}',
													className: 'title-icon',
												},
												{
													name: 'subcontent1',
													component: '::p',
													className: 'item-text',
													children: '财务报表'
												},
											]
										},
										children: [
											{
												name: 'subcontent2',
												component: '::div',
												className: 'item-content1',
												children: [
													{
														name: 'subcontent2',
														component: '::div',
														className: 'item-content',

														children: [{
															name: 'subcontent2',
															component: '::div',
															className: 'subContent accountBalance',
															children: [
																{
																	name: 'subcontent14',
																	component: '::div',
																	className: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.isNeedBalanceRecalculation?"subItem":""}}',
																	children: {
																		name: 'reportCheck4',
																		component: '::span',
																		className: '{{"link yellowSign"}}',
																		style: { display: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.isNeedBalanceRecalculation?"block":"none"}}' },
																		children: '{{"资产负债表数据变更，需要重新计算！"}}',
																		children: [
																			{
																				name: 'icon',
																				component: 'Icon',
																				type: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.isNeedBalanceRecalculation?"jinggao":"chenggongtishi"}}',
																				fontFamily: 'edficon',
																				className: 'itemIcon'
																			},
																			{
																				name: 'reportCheck2',
																				component: '::span',
																				children: '{{"资产负债表数据变更，需要重新计算！"}}',
																			}, {
																				name: 'reportCheck2',
																				component: '::span',
																				children: '{{"查看"}}',
																				style: { marginRight: '3px', color: 'rgba(0, 0, 0, 0.65)' }
																			}
																			, {
																				name: 'reportCheck2',
																				component: '::a',
																				style: { marginRight: '3px', textDecoration: 'underline' },
																				onClick: '{{$goBalanceSheetPass}}',
																				children: '{{"资产负债表"}}',
																			}

																		]
																	}
																}, {
																	name: 'subcontent15',
																	component: '::div',
																	className: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.isNeedProfitStatementRecalculation?"subItem":""}}',
																	children: {
																		name: 'reportCheck5',
																		component: '::span',
																		className: '{{"link yellowSign"}}',
																		style: { display: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.isNeedProfitStatementRecalculation?"block":"none"}}' },
																		children: '{{$getProfitRptName() + "数据变更，需要重新计算！"}}',
																		children: [
																			{
																				name: 'icon',
																				component: 'Icon',
																				type: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.isNeedProfitStatementRecalculation?"jinggao":"chenggongtishi"}}',
																				fontFamily: 'edficon',
																				className: 'itemIcon'
																			},
																			{
																				name: 'reportCheck2',
																				component: '::span',
																				children: '{{$getProfitRptName()+"数据变更，需要重新计算！"}}',
																			}, {
																				name: 'reportCheck2',
																				component: '::span',
																				children: '{{"查看"}}',
																				style: { marginRight: '3px', color: 'rgba(0, 0, 0, 0.65)' }
																			}
																			, {
																				name: 'reportCheck2',
																				component: '::a',
																				onClick: '{{$goBalanceAndProfitStatementPass}}',
																				style: { textDecoration: 'underline' },
																				children: '{{$getProfitRptName()}}',
																			}
																		]
																	}
																},
																{
																	name: 'subcontent11',
																	component: '::div',
																	children: [{
																		name: 'reportCheck1',
																		component: '::span',
																		className: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceSheetPass?"link subItem":"link subItem redSign"}}',
																		children: [
																			{
																				name: 'icon',
																				component: 'Icon',
																				type: '{{data.accountCheck.reportCheck&&data.accountCheck.reportCheck.balanceSheetPass?"chenggongtishi":"jinggao"}}',
																				fontFamily: 'edficon',
																				className: 'itemIcon'
																			},
																			{
																				name: 'reportCheck2',
																				component: '::span',
																				style: { marginRight: '3px' },
																				children: '{{data.accountCheck.reportCheck&&data.accountCheck.reportCheck.balanceSheetPass?"资产负债表平衡":"资产负债表不平衡，"}}',
																			}, {
																				name: 'reportCheck2',
																				component: '::span',
																				style: { marginRight: '3px', color: 'rgba(0, 0, 0, 0.65)' },
																				children: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceSheetPass?"":"查看"}}'
																			}, {
																				name: 'reportCheck2',
																				component: '::a',
																				onClick: '{{$goBalanceSheetPass}}',
																				style: { marginRight: '3px', textDecoration: 'underline' },
																				children: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceSheetPass?"":"资产负债表"}}'
																			}
																		]
																	},]

																}, {
																	name: 'subcontent12',
																	component: '::div',
																	// className: 'subItem',
																	children: {
																		name: 'reportCheck2',
																		component: '::span',
																		className: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceAndProfitStatementPass?"link subItem":"link subItem yellowSign"}}',
																		children: [
																			{
																				name: 'icon',
																				component: 'Icon',
																				type: '{{data.accountCheck.reportCheck&&data.accountCheck.reportCheck.balanceAndProfitStatementPass?"chenggongtishi":"jinggao"}}',
																				fontFamily: 'edficon',
																				className: 'itemIcon'
																			},
																			{
																				name: 'reportCheck2',
																				component: '::span',
																				children: '{{data.accountCheck.reportCheck&&data.accountCheck.reportCheck.balanceAndProfitStatementPass?"资产负债表与"+$getProfitRptName()+"勾稽正确":"资产负债表与"+$getProfitRptName()+"勾稽不正确，"}}'
																			}, {
																				name: 'reportCheck2',
																				component: '::span',
																				style: { marginRight: '3px', color: 'rgba(0, 0, 0, 0.65)' },
																				children: '{{data.accountCheck.reportCheck&&data.accountCheck.reportCheck.balanceAndProfitStatementPass?"":"查看"}}'
																			}, {
																				name: 'reportCheck2',
																				component: '::a',
																				onClick: '{{$goBalanceSheetPass}}',
																				style: { marginRight: '3px', textDecoration: 'underline' },
																				children: '{{data.accountCheck.reportCheck&&data.accountCheck.reportCheck.balanceAndProfitStatementPass?"":"资产负债表"}}'
																			}, {
																				name: 'reportCheck2',
																				component: '::a',
																				className: 'pauseMark',
																				children: '{{data.accountCheck.reportCheck&&data.accountCheck.reportCheck.balanceAndProfitStatementPass?"":"、"}}',
																				style: { marginRight: '3px' }
																			}, {
																				name: 'reportCheck2',
																				component: '::a',
																				style: { textDecoration: 'underline' },
																				onClick: '{{$goBalanceAndProfitStatementPass}}',
																				children: '{{data.accountCheck.reportCheck&&data.accountCheck.reportCheck.balanceAndProfitStatementPass?"":$getProfitRptName()}}'
																			}]
																	}

																}, {
																	name: 'subcontent13',
																	component: '::div',
																	children: {
																		name: 'reportCheck3',
																		component: '::span',
																		className: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceAndCashFlowPass?"link subItem":"link subItem yellowSign"}}',
																		children: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceAndCashFlowPass?"资产负债表与现金流量表勾稽正确":"资产负债表与现金流量表勾稽不正确"}}',
																		children: [
																			{
																				name: 'icon',
																				component: 'Icon',
																				type: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceAndCashFlowPass?"chenggongtishi":"jinggao"}}',
																				fontFamily: 'edficon',
																				className: 'itemIcon'
																			},
																			{
																				name: 'reportCheck2',
																				component: '::span',
																				children: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceAndCashFlowPass?"资产负债表与现金流量表勾稽正确":"资产负债表与现金流量表勾稽不正确，"}}',
																			}, {
																				name: 'reportCheck2',
																				component: '::span',
																				children: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceAndCashFlowPass?"":"查看"}}',
																				style: { marginRight: '3px', color: 'rgba(0, 0, 0, 0.65)' }
																			}
																			, {
																				name: 'reportCheck2',
																				component: '::a',
																				style: { marginRight: '3px', textDecoration: 'underline' },
																				onClick: '{{$goBalanceSheetPass}}',
																				children: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceAndCashFlowPass?"":"资产负债表"}}',
																			}, {
																				name: 'reportCheck2',
																				component: '::a',
																				className: 'pauseMark',
																				children: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceAndCashFlowPass?"":"、"}}',
																				style: { marginRight: '3px' }
																			}, {
																				name: 'reportCheck2',
																				component: '::a',
																				onClick: '{{$goBalanceAndCashFlowPass}}',
																				style: { textDecoration: 'underline' },
																				children: '{{data.accountCheck.reportCheck &&data.accountCheck.reportCheck.balanceAndCashFlowPass?"":"现金流量表"}}',
																			}
																		]
																	}
																}
															]
														}]
													}
												
												]
											}]
									},
									{
										name: 'subcontent',
										component: 'Collapse.Panel',
										disabled: '{{!data.activeBtn}}',
										className: 'account-content-item',
										_visible: '{{$isDisplayAssetCheck()}}',
										key: 'item6',
										header: {
											name: 'subcontent1',
											component: '::div',
											className: 'item-title',
											children: [
											
												{
													name: 'left',
													component: '::img',
													src: '{{$getPhoto("assetCheck")}}',
													className: 'title-icon',
												},
												{
													name: 'subcontent1',
													component: '::p',
													className: 'item-text',
													children: '资产情况检查'
												},

											]
										},
										children: [
											{
												name: 'subcontent2',
												component: '::div',
												className: 'item-content1',
												children: [
													{
														name: 'subcontent2',
														component: '::div',
														className: 'item-content assetCheck',
														children: [
															{
																name: 'left',
																component: '::div',
																children: [
																	{
																		name: 'icon',
																		component: 'Icon',
																		type: '{{data.accountCheck.assetCheck && data.accountCheck.assetCheck.state?"chenggongtishi":"jinggao"}}',
																		fontFamily: 'edficon',
																		className: 'itemIcon'
																	},
																	{
																		name: 'subcontent11',
																		component: '::div',
																		className: '{{data.accountCheck.assetCheck && data.accountCheck.assetCheck.state?"subContent":"yellowSign subContent"}}',
																		children: '{{data.accountCheck.assetCheck && data.accountCheck.assetCheck.state?"没有需要计提折旧的资产":"还未计提折旧"}}'
																	},
																]
															},
															{
																name: 'btn1',
																component: '::a',
																onClick: '{{$goAssetCheck}}',
																style: { display: '{{data.accountCheck.assetCheck&&data.accountCheck.assetCheck.state?"none":"block"}}', bottom: '-6px' },
																className: 'item-btn yellowBtn',
																children: '折旧/摊销'
															}
														]
													},
												
												]
											}]
									},
									]
								}
							}]
					},
					{
						name: 'content',
						component: '::div',
						className: 'app-account-final-cerficate month-right',
						style: { display: '{{data.other.currentMenu=="cerficate"?"block":"none"}}' },
						children: [
							{
								name: 'spin',
								component: '::div',
								tip: '数据加载中...',
								spinning: false,
								size: 'large',
								children: [
									{
										name: 'check',
										component: '::div',
										className: 'check',
										children: [{
											name: 'selectItem',
											component: 'Checkbox',
											className: 'checkAllbtn',
											_visible: '{{data.generateMode==1||!data.other.isEdit?false:true}}',
											children: '全部',
											checked: '{{data.other.checkAll}}',
											onChange: '{{function(){$checkAll()}}}'
										}
										]
									},
									{
										name: 'content',
										component: '::div',
										className: 'app-account-final-cerficate-content',
										children: [
											{
												name: 'sub',
												component: '::div',
												className: 'app-account-final-cerficate-content-list',
												children: [
													{
														name: 'div',
														component: '::div',
														className: '{{data.list[_rowIndex].canCreate==false?"disabledItem item":"item"}}',
														key: '{{_rowIndex}}',
														onClick: '{{function(){$checkItem(data.list[_rowIndex],_rowIndex)}}}',
														children: [
															{
																name: 'header',
																component: '::div',
																className: 'header',
																children: [
																	{
																		name: 'check',
																		component: 'Checkbox',
																		className: 'checkBoxItem triangle',
																		checked: '{{data.list[_rowIndex].checked}}',
																		_visible: '{{data.generateMode==0?true:false}}',
																		disabled: '{{$renderIsDisabled(data.list[_rowIndex],data.isHasExchangeRate,data.generateMode)}}'
																	},
																	{
																		name: 'header1',
																		component: '::div',
																		className: 'headerLeft',
																		title: '{{data.list[_rowIndex].title}}',
																		children: '{{data.list[_rowIndex].title}}'
																	},
																	{
																		name: 'header2',
																		component: '::div',
																		className: 'headerRight',
																		children: [
																			{
																				name: 'btn1',
																				component: 'Icon',
																				fontFamily: 'edficon',
																				type: 'gerenshezhi',
																				className: 'settingIcon',
																				_visible: '{{data.list[_rowIndex].businessType==5000040019||data.list[_rowIndex].businessType==5000040020||(data.other.accountingStandards==2000020008&&data.list[_rowIndex].businessType==5000040004)?false:true}}',
																				onClick: '{{function(e){$setting(e,data.list[_rowIndex])}}}'
																			}, {
																				name: 'btn2',
																				component: 'Icon',
																				fontFamily: 'edficon',
																				type: 'guanbi',
																				_visible: '{{data.list[_rowIndex].templateId?true:false}}',
																				disabled: '{{!data.other.isEdit}}',
																				className: 'closeIcon',
																				onClick: '{{function(){$delTemplate(data.list[_rowIndex])}}}'
																			}
																		]
																	}
																]
															},
															{
																name: 'body',
																component: '::div',
																className: 'content',
																children: [{
																	name: 'sub',
																	component: '::div',
																	className: 'subContent',
																	children: [{
																		name: 'Popover',
																		component: 'Popover',
																		placement: 'right',
																		overlayClassName: 'subpopover',
																		_visible: '{{$isPopverShow(data.list[_rowIndex])}}',
																		content: {
																			name: 'content',
																			component: '::div',
																			children: '{{$renderPopoverContent(data.list[_rowIndex])}}'
																		},
																		children: [{
																			name: 'subAmount1',
																			component: '::span',
																			className: '{{$isPopverShow(data.list[_rowIndex])?"primaryfontcolor":"defaultfontcolor"}}',
																			children: '金额：'
																		}, {
																			name: 'subAmount2',
																			component: '::span',
																			className: '{{$isPopverShow(data.list[_rowIndex])?"primaryfontcolor":"defaultfontcolor"}}',
																			children: '{{$formatAmount(data.list[_rowIndex])}}'
																		}]
																	}, {
																		name: 'amount',
																		component: '::div',
																		className: 'amount',
																		_visible: '{{!$isPopverShow(data.list[_rowIndex])}}',
																		children: [{
																			name: 'subAmount1',
																			component: '::span',
																			children: '金额：'
																		}, {
																			name: 'subAmount2',
																			component: '::span',
																			children: '{{$formatAmount(data.list[_rowIndex])}}'
																		}]
																	}, {
																		name: 'code1',
																		component: '::div',
																		className: 'code',
																		children: {
																			name: 'div',
																			component: '::a',
																			onClick: '{{function(){$linkProofList( data.list[_rowIndex].docId)}}}',
																			children: '{{data.list && data.list[_rowIndex].docCode?data.list[_rowIndex].docCode:""}}'
																		}
																	},
																	{
																		name: 'code2',
																		component: '::div',
																		className: 'code',
																		_visible: '{{data.list && ((data.list[_rowIndex].businessType=="5000040005"||data.list[_rowIndex].businessType=="5000040004"||data.list[_rowIndex].businessType=="5000040026")&&data.list[_rowIndex].docCode2)?true:false}}',
																		children: {
																			name: 'div',
																			component: '::a',
																			onClick: '{{function(){$linkProofList( data.list[_rowIndex].docId2)}}}',
																			children: '{{data.list && data.list[_rowIndex].docCode2?data.list[_rowIndex].docCode2:""}}'
																		}
																	},
																	{
																		name: 'tips',
																		component: '::div',
																		className: 'tipContent',
																		children: [
																			{
																				name: 'tip1',
																				component: '::div',
																				className: 'tips',
																				children: '{{$renderTip(data.list[_rowIndex])}}'
																			},
																			{
																				name: 'Popover',
																				component: 'Popover',
																				placement: 'bottom',
																				overlayClassName: 'monthaccount-tipmorepopover',
																				_visible: '{{data.list[_rowIndex].hintCode==0||data.list[_rowIndex].hintCode==undefined?false:true}}',
																				content: {
																					name: 'content',
																					component: '::div',
																					children: '{{$renderTipMore(data.list[_rowIndex])}}'
																				},
																				children: {
																					name: 'helpIcon',
																					component: 'Icon',
																					fontFamily: 'edficon',
																					type: 'bangzhutishi',
																					className: 'helpIcon'
																				}
																			}
																		]
																	},
																	{
																		name: 'source',
																		component: '::div',
																		className: 'source',
																		children: '{{$renderSource(data.list[_rowIndex])}}'
																	},
																	{
																		name: 'sourceBtn',
																		component: '::a',
																		onClick: '{{$inventory}}',
																		className: 'sourceBtn ',
																		children: '{{$renderSourceBtn(data.list[_rowIndex])}}'
																	}
																	]
																}, {
																	name: 'set',
																	component: '::a',
																	onClick: '{{function(){$calcCostClick(data.list[_rowIndex])}}}',																	
																	_visible: '{{$isSetShow(data.list[_rowIndex])}}',
																	className: 'set',
																	children: '测算成本'
																}]
															}, {
																name: 'footer',
																component: '::div',
																className: 'footer',
																children: [{
																	name: 'footer1',
																	component: 'Button',
																	className: 'link',
																	children: '查看凭证',
																	_visible: '{{!(data.list[_rowIndex].businessType==5000040004&&data.list[_rowIndex].isCreateDoc==true?true:data.list[_rowIndex].docId?false:true)}}',
																	onClick: '{{function(){$linkProofList( data.list[_rowIndex].docId)}}}'
																},
																{
																	name: 'footer2',
																	component: 'Button',
																	className: 'link generateBtn',
																	children: '生成凭证',
																	disabled: '{{data.list[_rowIndex].canCreate==false||data.other.isAccountedMonth?true:false}}',
																	_visible: '{{data.list[_rowIndex].businessType==5000040004&&data.list[_rowIndex].isCreateDoc==true?true:data.list[_rowIndex].docId?false:true}}',
																	onClick: '{{function(){$generateProof( data.list[_rowIndex], _rowIndex)}}}'
																}
																]
															},
														],
														_power: 'for in data.list'
													}
												]
											},
											{
												name: 'add2',
												component: '::div',
												className: 'app-account-final-cerficate-content-add',
												_visible: '{{data.other.accountingStandards != 2000020008?data.other.isEdit?true:false:false}}',
												onClick: '{{$addHighModal}}',
												children: [{
													name: 'div',
													component: '::div',
													className: 'app-account-final-cerficate-content-add-container',

													children: [{
														name: 'helpIcon',
														component: 'Icon',
														fontFamily: 'edficon',
														type: 'gaojichaxunlidejia',
														className: 'addIcon'
													},
													{
														name: 'span',
														component: '::div',
														children: '高级自定义模板',
														className: 'addTitle'
													}
													]
												},
												]
											}
										]
									}
								]
							}
						]
					}
					]
				}
			]
		}

	}
}
export function addThousandsPosition(input, isFixed) {
	if (isNaN(input)) return ''
	let num

	if (isFixed) {
		num = parseFloat(input).toFixed(2)
	} else {
		num = input.toString()
	}
	let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g

	return num.replace(regex, "$1,")
}
export function getInitState() {
	return {
		data: {
			other: {
				currentMenu: 'cerficate',
				currentMenuLine: 'cerficate',
				period: '',
				setting: ['系统自动生成', '手工点击生成'],
				createBtn: true,//
				unMonthEndingClosingBtn: false,//反结账按钮显示隐藏
				isEdit: true,//不可编辑,
				isClick: true,
				isSetClick: true,
				checkBtn: true,
				checkAll: false,
				checkNotTips: false,
				hintContent: {
					0: '',
					1: '根据财税〔2016〕12号文件规定，纳税月销售额不超过10万元（季度30万元），可减免教育费附加、地方教育附加，城市维护建设税正常缴纳。',
					2: '根据财税〔2016〕12号文件规定，纳税月销售额不超过10万元（季度30万元），可减免教育费附加、地方教育附加，城市维护建设税正常缴纳。',
					3: '此类一般纳税人不享受优惠政策',
					4: '此类一般纳税人不享受优惠政策',
					5: '根据国家税务总局公告2019年第4号规定，小规模纳税人发生增值税应税销售行为，合计月销售额未超过10万元（以1个季度为1个纳税期的，季度销售额未超过30万元，下同）的，免征增值税。则免征附加税',
					6: '根据国家税务总局公告2019年第4号规定，小规模纳税人发生增值税应税销售行为，合计月销售额未超过10万元（以1个季度为1个纳税期的，季度销售额未超过30万元，下同）的，免征增值税。则免征附加税',
					7: '根据财税〔2019〕13号规定，对增值税小规模纳税人，按照税额的50%减征资源税、城市维护建设税、房产税、城镇土地使用税、印花税、耕地占用税和教育费附加、地方教育附加。',
					8: '根据财税〔2019〕13号规定，对增值税小规模纳税人，按照税额的50%减征资源税、城市维护建设税、房产税、城镇土地使用税、印花税、耕地占用税和教育费附加、地方教育附加。'
				},
				hint: { 0: '', 1: '月度销售额或营业额不超过10万元', 2: '季度销售额或营业额不超过30万元', 3: '月销售额或营业额超过10万元', 4: '季度销售额或营业额超过30万元', 5: '月销售额或营业额不超过10万元', 6: '季销售额或营业额不超过30万元',7: '月销售额或营业额超过10万元',8: '季度销售额或营业额超过30万元'}
			},
			generateMode: 0,
			disabled: false,
			disabledUndoMonthEndingClosing: false,
			firstSubjectAsset: true,
			firstSubject: true,
			loading: true,
			activeKey: [],
			isExpand: false,
			isAccountShow: false,
			monthList: [],
			isBtnShow: true,
			isAgainShow: false,
			accountCheck: {
				initialBalance: { checkPeriodBegin: true, checkYearBegin: true, checkLossProfit: true },
				voucherAudit: { docExistence: true },
				documentNumber: { docCodeIsSeries: true },
				assetCheck: { state: true },
				profitLoss: 1,

			},
			profitLossAccount: ''
		}

	}
}
