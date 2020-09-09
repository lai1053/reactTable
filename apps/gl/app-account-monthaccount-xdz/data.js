// import { consts } from 'edf-consts'
// import moment from 'moment'
// import utils from 'edf-utils'
import certi from '../../../vendor/img/gl/certi.png'
import shixin from '../../../vendor/img/gl/shixin.png'
export function getMeta() {

	return {
		name: 'root',
		component: 'Layout',
		className: 'app-account-monthaccount-xdz',
		children: [{
			name: 'spin',
			component: 'Spin',
			tip: '数据加载中...',
			className: 'spinContainer',
			spinning: '{{data.loading}}',
			size: 'large',
			children: [
				{
					name: 'content',
					component: 'Layout',
					className: 'app-account-monthaccount-xdz-content',
					children: [{
						name: 'monthLeft',
						component: '::div',
						className: 'month-left',
						_visible: '{{data.other.fromXDZmanufacturing==true?false:true}}',
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
						name: 'content',
						component: '::div',
						className: '{{data.other.fromXDZmanufacturing==true?"month-right-xdz app-account-final-cerficate month-right":"app-account-final-cerficate month-right"}}',
						_visible: '{{data.other.fromXDZmanufacturing==true?true:data.other.currentMenu=="cerficate"?true:false}}',
						// style: { display: '{{data.other.fromXDZmanufacturing==true?true:data.other.currentMenu=="cerficate"?"block":"none"}}' },
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
											_visible: '{{data.other.fromXDZmanufacturing==true?false:data.generateMode==1||!data.other.isEdit?false:true}}',
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
														_visible: '{{data.other.fromXDZmanufacturing==false?true:data.list[_rowIndex].businessType==5000040022?true:false}}',
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
	]
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
export function getInitState(option) {
	return {
		data: {
			other: {
				currentMenu: 'cerficate',
				currentMenuLine: 'cerficate',
				period: option.period ? option.period : '',
				setting: ['系统自动生成', '手工点击生成'],
				createBtn: true,//
				unMonthEndingClosingBtn: false,//反结账按钮显示隐藏
				isEdit: true,//不可编辑,
				isClick: true,
				isSetClick: true,
				checkBtn: true,
				checkAll: false,
				checkNotTips: false,
				fromXDZmanufacturing: option.fromXDZmanufacturing != undefined?option.fromXDZmanufacturing:false,
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
