export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: '{{(data.appVersion == 107 && sessionStorage["dzSource"] == 1) ? "ttk-es-app-org ttk-es-app-org-dz" : "ttk-es-app-org"}}',
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
				}, "，请及时更新证书！若已更新，请重新读取企业信息！一证通数字证书自助服务网址：", {
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
			},
                {
                    name:'tishi',
					_visible:'{{data.changelinkman == "0"}}',
                    component: 'Popover',
                    content:'数据不完整，请补充',
                    placement: 'right',
                    overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                    children: {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'XDZdanchuang-jinggao',
                        style:{color:'#cc0000',position:'absolute',top:'1%',left:'39.5%',zIndex:'99999999'},

                    }

                },
				{
				name: 'main',
				component: 'Tabs',
				className: 'ttk-es-app-org-main',
				animated: false,
				forceRender: false,
				activeKey: '{{data.other.activeTabKey}}',
				onChange: '{{$handleTabChange}}',
				children: [
				{
					name: 'tab1',
					component: 'Tabs.TabPane',
					forceRender: false,
					tab: '企业信息',
					key: '1',
					children: [
					{
						name: 'basic',
						component: '::div',
						children: [{
								name: 'nsrjbxx',
								className: 'nsrjbxx tab1Content',
								component: '::div',
								children: [
								{
									name: 'title1',
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
									}]
								},{
									name: 'nsrjbxxTitle1',
									className: 'nsrjbxxTitle tab1Form',
									component: '::div',
									children: [
										{
											name: 'nsrjbxxTable',
											className: 'nsrjbxxTable',
											component: '::div',
											children: [
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '纳税人识别号',
															children: '纳税人识别号'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.basic.vatTaxpayerNum}}',
															children: '{{data.basic.vatTaxpayerNum}}'
														},
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '纳税人电子档案号',
														// 	children: '纳税人电子档案号'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellValue',
														// 	component: '::div',
														// 	title: '{{data.nsxxDto.NSRDZDA}}',
														// 	children: '{{data.nsxxDto.NSRDZDA}}'
														// },
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '纳税人名称',
															children: '纳税人名称'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.nsxxDto.NSRMC}}',
															children: '{{data.nsxxDto.NSRMC}}'
														}
													]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '所属区域',
															children: '所属区域'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.nsxxDto.SSQY}}',
															children: '{{data.nsxxDto.SSQY}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															children: '主管税务机关名称'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															children: '{{data.nsxxDto.ZGSWJ}}'
														},
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '社会信用代码',
														// 	children: '社会信用代码'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellValue',
														// 	component: '::div',
														// 	title: '{{data.basic.vatTaxpayerNum}}',
														// 	children: '{{data.basic.vatTaxpayerNum}}'
														// },
														
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '税务登记表类型',
														// 	children: '税务登记表类型'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellValue nsrjbxxCellFill',
														// 	component: '::div',
														// 	title: '{{(data&&data.nsxxDto&&!!data.nsxxDto.SWDJBLX)?data.nsxxDto.SWDJBLX:""}}',
														// 	children: '{{(data&&data.nsxxDto&&!!data.nsxxDto.SWDJBLX)?data.nsxxDto.SWDJBLX:""}}'
														// 	// children: '{{$getValue( data&&data.enumData&&data.enumData.tax&&data.enumData.tax.SWDJBLX&&data.enumData.tax.SWDJBLX.enumDetails, data&&data.nsxxDto&&data.nsxxDto.SWDJBLX, "code", "name" )}}'
														// }
													]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '登记日期',
															children: '登记日期'
														},{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.nsxxDto.DJRQ}}',
															children: '{{data.nsxxDto.DJRQ}}'
														},{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '登记注册类型',
															children: '登记注册类型'
														},{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															children: '{{$getValue( data&&data.enumData&&data.enumData.tax&&data.enumData.tax.DJZCLX&&data.enumData.tax.DJZCLX.enumDetails, data&&data.nsxxDto&&data.nsxxDto.DJZCLX, "code", "name" )}}'
														}
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '组织机构代码',
														// 	children: '组织机构代码'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellValue',
														// 	component: '::div',
														// 	title: '{{data.nsxxDto.ZZJGDM}}',
														// 	children: '{{data.nsxxDto.ZZJGDM}}'
														// },
														
														
													]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '生产经营地址',
															children: '生产经营地址'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.nsxxDto.SCJYDZ}}',
															children: '{{data.nsxxDto.SCJYDZ}}'
														},{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '所属行业',
															children: '所属行业'
														},{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															children: '{{$getValue( data&&data.enumData&&data.enumData.tax&&data.enumData.tax.SSHY&&data.enumData.tax.SSHY.enumDetails, data&&data.nsxxDto&&data.nsxxDto.SSHY, "code", "name" )}}'
														}
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '纳税人状态',
														// 	children: '纳税人状态'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellValue',
														// 	component: '::div',
														// 	title: '{{data.nsxxDto.NSRZT}}',
														// 	children: '{{data.nsxxDto.NSRZT}}'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '总分机构标志',
														// 	children: '总分机构标志'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellValue',
														// 	component: '::div',
														// 	children: '{{$getValue( data&&data.enumData&&data.enumData.tax&&data.enumData.tax.ZFJGLX&&data.enumData.tax.ZFJGLX.enumDetails, data&&data.nsxxDto&&data.nsxxDto.ZFJGBZ, "code", "name" )}}'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '代扣代缴标志',
														// 	children: '代扣代缴标志'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellValue nsrjbxxCellFill',
														// 	component: '::div',
														// 	children: '{{$getValue( data&&data.enumData&&data.enumData.tax&&data.enumData.tax.DKDJBZ&&data.enumData.tax.DKDJBZ.enumDetails, data&&data.nsxxDto&&data.nsxxDto.DKDJBZ, "code", "name" )}}'
														// }
													]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '纳税人信用等级',
															children: '纳税人信用等级'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.nsxxDto.XYDJ}}',
															children: '{{data.nsxxDto.XYDJ}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '三方协议号',
															children: '三方协议号'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															children: ''
														}
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '开业日期',
														// 	children: '开业日期'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellValue',
														// 	component: '::div',
														// 	title: '{{data.nsxxDto.KYRQ}}',
														// 	children: '{{data.nsxxDto.KYRQ}}'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '注册资本',
														// 	children: '注册资本'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellValue',
														// 	component: '::div',
														// 	title: '{{!!data.nsxxDto.ZCZB ? data.nsxxDto.ZCZB : ""}}',
														// 	children: '{{!!data.nsxxDto.ZCZB ? data.nsxxDto.ZCZB : ""}}'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '从业人数',
														// 	children: '从业人数'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellValue nsrjbxxCellFill',
														// 	component: '::div',
														// 	title: '{{!!data.nsxxDto.CYRS ? data.nsxxDto.CYRS : ""}}',
														// 	children: '{{!!data.nsxxDto.CYRS ? data.nsxxDto.CYRS : ""}}'
														// }
													]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '纳税人状态',
															children: '纳税人状态'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.nsxxDto.NSRZT}}',
															children: '{{data.nsxxDto.NSRZT}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '',
															children: ''
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															children: ''
														}]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '经营范围',
															children: '经营范围'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue7',
															component: '::div',
															title: '{{data.nsxxDto.JYFW}}',
															children: '{{data.nsxxDto.JYFW}}'
														},
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellTitle',
														// 	component: '::div',
														// 	title: '增值税企业类型',
														// 	children: '增值税企业类型'
														// },
														// {
														// 	name: 'nsrjbxxCell',
														// 	className: 'nsrjbxxCell nsrjbxxCellFill',
														// 	component: '::div',
														// 	children: '{{$getValue( data&&data.enumData&&data.enumData.tax&&data.enumData.tax.ZZSQYLX&&data.enumData.tax.ZZSQYLX.enumDetails, data&&data.nsxxDto&&data.nsxxDto.ZZSQYLX, "code", "name" )}}'
														// }
													]
												},{
													name: 'more',
													component: '::div',
													className: 'itemLine',
													style: { borderTop: '1px solid #d9d9d9' },
													children: [{
														name: 'more',
														component: '::span',
														onClick: '{{$hideInfo}}',
														className: 'more',
														children: ['{{data.other.detailInfo ? "收起" : "更多"}}', {
															name: 'icon',
															component: 'Icon',
															style: { marginLeft: '5px' },
															type: '{{data.other.detailInfo ? "up" : "down"}}'
														}]
													}]
												},
												{
													name: 'nsrjbxxkhh',
													className: 'nsrjbxxTr',
													component: '::div',
													_visible: '{{data.other.detailInfo}}',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '开户银行',
															children: '开户银行'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.nsxxDto.KHYH}}',
															children: {
																name: 'input',
																component: 'Input',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																value: '{{data.nsxxDto.KHYH}}',
																timeout: true,
																onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.KHYH', e.target.value, '开户银行'); console.log(e)}}}",
															}
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '银行账号',
															children: '银行账号'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															children: {
																name: 'input',
																component: 'Input',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																value: '{{data.nsxxDto.YHZH}}',
																timeout: true,
																onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.YHZH', e.target.value, '银行账号')}}}",
															}
														}
													]
												},{
													name: 'nsrjbxxzczb',
													className: 'nsrjbxxTr',
													component: '::div',
													_visible: '{{data.other.detailInfo}}',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellTitle2',
															component: '::div',
															title: '注册资本（元）',
															children: '注册资本（元）'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.nsxxDto.SCJYDZ}}',
															children: {
																name: 'input',
																component: 'Input',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																value: '{{data.nsxxDto.ZCZB}}',
																timeout: true,
																onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.ZCZB', e.target.value, '注册资本');console.log(e)}}}",
																onBlur: '{{function(e){$zczb(e.target.value)}}}'
															}
								},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellTitle2',
															component: '::div',
															title: '从业人数（人）',
															children: '从业人数（人）'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellValue6',
															component: '::div',
															children: {
																name: 'input',
																component: 'Input.Number',
																regex: '^([0-9]+)$',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																value: '{{data.nsxxDto.CYRS}}',
																timeout: true,
																onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.CYRS', e, '从业人数（人）')}}}",
															}
														}
													]
												}
											]
										}
									]
								},{
									name: 'title2',
									className: 'blockTitle',
									component: '::div',
									children: [{
										name: 'name',
										component: '::span',
										children: '主要税种信息'
									}, {
										name: 'line',
										component: '::div',
										className: 'assistLine'
									}]
								},{
									name: 'nsrjbxxTitle3',
									className: 'nsrjbxxTitle tab1Form',
									component: '::div',
									style: {
										marginBottom: '10px',
									},
									children: [
										{
											name: 'nsrjbxxTable',
											className: 'nsrjbxxTable',
											component: '::div',
											children: [
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															children: '增值税纳税人性质'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															children: '{{$getVatTaxpayerName(data.basic.vatTaxpayer)}}'
														},{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															children: '是否即征即退类型'
														},{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.nsxxDto.isSignAndRetreat}}',
															children:{
																name: 'isSignAndRetreat',
																component: 'Select',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																// getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
																showSearch: false,
																value: '{{data.nsxxDto.SFJZJT}}',
																onChange: "{{function(e){$setField('data.nsxxDto.SFJZJT',e)}}}",
																children: {
																	name: 'option',
																	component: 'Select.Option',
																	key: '{{data.enumData.basic.isSignAndRetreat[_rowIndex].id}}',
																	value: '{{data.enumData.basic.isSignAndRetreat[_rowIndex].code}}',
																	children: '{{data.enumData.basic.isSignAndRetreat[_rowIndex].name}}',
																	_power: 'for in data.enumData.basic.isSignAndRetreat',
																}
															} 
														},
													]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellTitle2',
															component: '::div',
															children: '企业所得税征收方式'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellValue6',
															component: '::div',
															children:{
																name: 'QYSDSZSFS',
																component: 'Select',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																// getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
																showSearch: false,
																value: '{{data.nsxxDto.QYSDSZSFS}}',
																onChange: "{{function(e){$setField('data.nsxxDto.QYSDSZSFS',e);console.log(data.nsxxDto.QYSDSZSFS)}}}",
																children: {
																	name: 'option',
																	component: 'Select.Option',
																	key: '{{data.enumData.basic.QYSDSZSFS[_rowIndex].id}}',
																	value: '{{data.enumData.basic.QYSDSZSFS[_rowIndex].code}}',
																	children: '{{data.enumData.basic.QYSDSZSFS[_rowIndex].name}}',
																	_power: 'for in data.enumData.basic.QYSDSZSFS',
																}
															} 
														},{
															name: 'nsrjbxxCellQYSDSYJFStitle',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellTitle2',
															component: '::div',
															_visible: '{{!!data.nsxxDto.QYSDSZSFS}}',
															children: '{{data.nsxxDto.QYSDSZSFS == "0002" ? "核定征收方式" : "企业所得税预缴方式"}}'
														},{
															name: 'nsrjbxxCellQYSDSYJFS',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellValue6',
															component: '::div',
															_visible: '{{data.nsxxDto.QYSDSZSFS == "0001"}}',
															children:{
																name: 'QYSDSYJFS',
																component: 'Select',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																// getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
																showSearch: false,
																value: '{{data.nsxxDto.QYSDSYJFS}}',
																onChange: "{{function(e){$setField('data.nsxxDto.QYSDSYJFS',e)}}}",
																children: {
																	name: 'option',
																	component: 'Select.Option',
																	key: '{{data.enumData.basic.QYSDSYJFS[_rowIndex].id}}',
																	value: '{{data.enumData.basic.QYSDSYJFS[_rowIndex].code}}',
																	children: '{{data.enumData.basic.QYSDSYJFS[_rowIndex].name}}',
																	_power: 'for in data.enumData.basic.QYSDSYJFS',
																}
															} 
														},{
															name: 'nsrjbxxCellHDZSFS',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellValue6',
															component: '::div',
															_visible: '{{data.nsxxDto.QYSDSZSFS == "0002"}}',
															children:{
																name: 'HDZSFS',
																component: 'Select',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																// getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
																showSearch: false,
																value: '{{data.nsxxDto.HDZSFS}}',
																onChange: "{{function(e){$setField('data.nsxxDto.HDZSFS',e)}}}",
																children: {
																	name: 'option',
																	component: 'Select.Option',
																	key: '{{data.enumData.basic.HDZSFS[_rowIndex].id}}',
																	value: '{{data.enumData.basic.HDZSFS[_rowIndex].code}}',
																	children: '{{data.enumData.basic.HDZSFS[_rowIndex].name}}',
																	_power: 'for in data.enumData.basic.HDZSFS',
																}
															} 
														}
													]
												}
											]
										}
									]
								},{
									name: 'title3',
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
									}]
								},{
									name: 'nsrjbxxTitle2',
									className: 'nsrjbxxTitle tab1Form',
									component: '::div',
									children: [
										{
											name: 'nsrjbxxTable',
											className: 'nsrjbxxTable',
											component: '::div',
											children: [
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle3',
															component: '::div',
															children: '法定负责人'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue3',
															component: '::div',
															children: '{{data.nsxxDto.FDFZR}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle3',
															component: '::div',
															children: '身份证件类型'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue3',
															component: '::div',
															children: '{{$getValue( data&&data.enumData&&data.enumData.tax&&data.enumData.tax.SFZJLX&&data.enumData.tax.SFZJLX.enumDetails, data&&data.nsxxDto&&data.nsxxDto.FDFZR_SFZJLX, "code", "name" )}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle3',
															component: '::div',
															children: '证件号码'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue3',
															component: '::div',
															children: '{{data.nsxxDto.FDFZR_SFZJHM}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle3',
															component: '::div',
															children: '联系电话'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue3',
															component: '::div',
                                                            validateStatus: "{{data.error.orgInfo.FDFZR_TEL?'error':'success'}}",
															children:[
																{
																	name:'nsrfdfzrtel',
																	component:'Input',
																	className:'nsrfdfzrtel',
                                                                    value: '{{data.nsxxDto.FDFZR_TEL}}',
                                                                    onChange: "{{function(e){$fdfxrTel(e);}}}"
                                                                    // onChange: "{{function(e){$fdfxrTel(e);$changeCheckFDF(FDFZR_TEL)}}}"
																}
															]
															// children: '{{data.nsxxDto.FDFZR_TEL}}'
														}
													]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle3',
															component: '::div',
															children: '财务负责人'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue3',
															component: '::div',
															children: '{{data.nsxxDto.CWFZR}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle3',
															component: '::div',
															children: '身份证件类型'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue3',
															component: '::div',
															children: '{{$getValue( data&&data.enumData&&data.enumData.tax&&data.enumData.tax.SFZJLX&&data.enumData.tax.SFZJLX.enumDetails, data&&data.nsxxDto&&data.nsxxDto.CWFZR_SFZJLX, "code", "name" )}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle3',
															component: '::div',
															children: '证件号码'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue3',
															component: '::div',
															children: '{{data.nsxxDto.CWFZR_SFZJHM}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle3',
															component: '::div',
															children: '联系电话'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue3',
															component: '::div',
															children: '{{data.nsxxDto.CWFZR_TEL}}'
														}
													]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													style: { marginBottom:'60px'},
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellTitle3',
															component: '::div',
															children: '办税员'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellValue3',
															component: '::div',
															children: '{{data.nsxxDto.BSY}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellTitle3',
															component: '::div',
															children: '身份证件类型'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellValue3',
															component: '::div',
															children: '{{$getValue( data&&data.enumData&&data.enumData.tax&&data.enumData.tax.SFZJLX&&data.enumData.tax.SFZJLX.enumDetails, data&&data.nsxxDto&&data.nsxxDto.BSY_SFZJLX, "code", "name" )}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellTitle3',
															component: '::div',
															children: '证件号码'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellValue3',
															component: '::div',
															children: '{{data.nsxxDto.BSY_SFZJHM}}'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle3',
															component: '::div',
															children: '联系电话'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellBottomLine nsrjbxxCellValue3',
															component: '::div',
															children: '{{data.nsxxDto.BSY_TEL}}'
														}
													]
												}
											]
										}
									]
								}]
							}
						]

					}
					// {
					// 	name: 'content',
					// 	component: '::div',
					// 	_visible: '{{data.other.activeTabKey == 1}}',
					// 	className: 'ttk-es-app-org-main-content ttk-es-app-org-main-content-orgInfo',
					// 	children: [{
					// 		name: 'basic',
					// 		component: '::div',
					// 		children: [{
					// 			name: 'title',
					// 			className: 'blockTitle',
					// 			component: '::div',
					// 			children: [{
					// 				name: 'name',
					// 				component: '::span',
					// 				children: '纳税人基本信息'
					// 			}, {
					// 				name: 'line',
					// 				component: '::div',
					// 				className: 'assistLine'
					// 			}, {
					// 				name: 'arrow',
					// 				component: '::div',
					// 				className: 'blockTitle-arrow',
					// 				onClick: '{{function() {$setField("data.other.title1", !data.other.title1)}}}',
					// 				children: {
					// 					name: 'arrow',
					// 					component: 'Icon',
					// 					fontFamily: 'edficon',
					// 					type: '{{data.other.title1 ? "shang" : "xia"}}'
					// 				}
					// 			}]
					// 		}, {
					// 			name: 'block',
					// 			component: '::div',
					// 			_visible: '{{data.other.title1}}',
					// 			children: [
					// 			{
					// 				name: 'title',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				children: [{
					// 					name: 'enableDate',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '纳税人名称',
					// 					validateStatus: "{{data.error.orgInfo.NSRMC?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.NSRMC}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.NSRMC}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.NSRMC', e.target.value, '纳税人名称')}}}",
					// 					}
					// 				}, {
					// 					name: 'state',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '纳税人状态',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Select',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-orgInfo")}}}',
					// 						showSearch: false,
					// 						// value: '{{data.nsxxDto.NSRZT && Number(data.nsxxDto.NSRZT)}}',
					// 						value: '{{data.nsxxDto.NSRZTDM}}',
					// 						onChange: "{{function(e){$setField('data.nsxxDto.NSRZTDM',e)}}}",
					// 						children: {
					// 							name: 'option',
					// 							component: 'Select.Option',
					// 							key: '{{data.enumData.tax.NSRZT.enumDetails[_rowIndex].id}}',
					// 							value: '{{data.enumData.tax.NSRZT.enumDetails[_rowIndex].code}}',
					// 							children: '{{data.enumData.tax.NSRZT.enumDetails[_rowIndex].name}}',
					// 							_power: 'for in data.enumData.tax.NSRZT.enumDetails',
					// 						}
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'line1',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				children: [{
					// 					name: 'industry',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '所属行业',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Select',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						key: '{{data.other.key}}',
					// 						getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-orgInfo")}}}',
					// 						showSearch: true,
					// 						filterOption: '{{$filterIndustry}}',
					// 						value: '{{data.nsxxDto.SSHY}}',
					// 						onSelect: "{{function(e){$setField('data.nsxxDto.SSHY',e)}}}",
					// 						children: '{{$getSelectOption()}}'
					// 					}
					// 				}, {
					// 					name: 'registerNum',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '登记序号',
					// 					validateStatus: "{{data.error.orgInfo.DJXH?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.DJXH}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.DJXH}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.DJXH', e.target.value, '登记序号')}}}",
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'line2',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				children: [{
					// 					name: 'capital',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '注册资本',
					// 					validateStatus: "{{data.error.orgInfo.ZCZB?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.ZCZB}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.ZCZB}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.ZCZB', e.target.value, '注册资本')}}}",
					// 						onBlur: '{{function(e){$zczb(e.target.value)}}}'
					// 					}
					// 				}, {
					// 					name: 'registerType',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '登记注册类型',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Select',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-orgInfo")}}}',
					// 						showSearch: false,
					// 						value: '{{data.nsxxDto.DJZCLX}}',
					// 						onChange: "{{function(e){$setField('data.nsxxDto.DJZCLX',e)}}}",
					// 						children: {
					// 							name: 'option',
					// 							component: 'Select.Option',
					// 							key: '{{data.enumData.tax.DJZCLX.enumDetails[_rowIndex].id}}',
					// 							value: '{{data.enumData.tax.DJZCLX.enumDetails[_rowIndex].code}}',
					// 							children: '{{data.enumData.tax.DJZCLX.enumDetails[_rowIndex].name}}',
					// 							_power: 'for in data.enumData.tax.DJZCLX.enumDetails',
					// 						}
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'line3',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				children: [{
					// 					name: 'zzsqylx',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '增值税企业类型',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Select',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-orgInfo")}}}',
					// 						showSearch: false,
					// 						value: '{{data.nsxxDto.ZZSQYLX}}',
					// 						onChange: "{{function(e){$setField('data.nsxxDto.ZZSQYLX',e)}}}",
					// 						children: {
					// 							name: 'option',
					// 							component: 'Select.Option',
					// 							key: '{{data.enumData.tax.ZZSQYLX.enumDetails[_rowIndex].id}}',
					// 							value: '{{data.enumData.tax.ZZSQYLX.enumDetails[_rowIndex].code}}',
					// 							children: '{{data.enumData.tax.ZZSQYLX.enumDetails[_rowIndex].name}}',
					// 							_power: 'for in data.enumData.tax.ZZSQYLX.enumDetails',
					// 						}
					// 					}
					// 				}, {
					// 					name: 'cyrs',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '从业人数',
					// 					validateStatus: "{{data.error.orgInfo.CYRS?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.CYRS}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input.Number',
					// 						regex: '^([0-9]+)$',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{!!data.nsxxDto.CYRS ? data.nsxxDto.CYRS : ""}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.CYRS', e, '从业人数')}}}",
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'line4',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				children: [{
					// 					name: 'level',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '信用等级',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Select',
					// 						disabled: '{{data.other.isReadOnly}}',
					// 						getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-orgInfo")}}}',
					// 						showSearch: false,
					// 						value: '{{data.nsxxDto.XYDJ && Number(data.nsxxDto.XYDJ)}}',
					// 						onChange: "{{function(e){$setField('data.nsxxDto.XYDJ',e)}}}",
					// 						children: {
					// 							name: 'option',
					// 							component: 'Select.Option',
					// 							key: '{{data.enumData.tax.XYDJ.enumDetails[_rowIndex].id}}',
					// 							value: '{{data.enumData.tax.XYDJ.enumDetails[_rowIndex].id}}',
					// 							children: '{{data.enumData.tax.XYDJ.enumDetails[_rowIndex].name}}',
					// 							_power: 'for in data.enumData.tax.XYDJ.enumDetails',
					// 						}
					// 					}
					// 				}, {
					// 					name: 'level',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '纳税人电子档案',
					// 					validateStatus: "{{data.error.orgInfo.NSRDZDA?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.NSRDZDA}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.NSRDZDA}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.NSRDZDA', e.target.value, '纳税人电子档案')}}}",
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'more',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				style: { borderTop: '1px dashed #d9d9d9' },
					// 				children: [{
					// 					name: 'more',
					// 					component: '::span',
					// 					onClick: '{{$hideInfo}}',
					// 					className: 'more',
					// 					children: ['更多', {
					// 						name: 'icon',
					// 						component: 'Icon',
					// 						style: { marginLeft: '5px' },
					// 						type: '{{data.other.detailInfo ? "up" : "down"}}'
					// 					}]
					// 				}]
					// 			}, {
					// 				name: 'line5',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				_visible: '{{data.other.detailInfo}}',
					// 				children: [{
					// 					name: 'enableDate',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '银行账户',
					// 					validateStatus: "{{data.error.orgInfo.YHZH?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.YHZH}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{!!data.initState.YHZH && (data.other.isReadOnly || data.other.isShowOtherMsg)}}',
					// 						value: '{{data.nsxxDto.YHZH}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.YHZH', e.target.value, '银行账户')}}}",
					// 					}
					// 				}, {
					// 					name: 'registerNum',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '开户银行',
					// 					validateStatus: "{{data.error.orgInfo.KHYH?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.KHYH}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{!!data.initState.KHYH && (data.other.isReadOnly || data.other.isShowOtherMsg)}}',
					// 						value: '{{data.nsxxDto.KHYH}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.KHYH', e.target.value, '开户银行')}}}",
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'line6',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				_visible: '{{data.other.detailInfo}}',
					// 				children: [{
					// 					name: 'level',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '开业日期',
					// 					children: {
					// 						name: 'input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						component: 'DatePicker',
					// 						getCalendarContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-orgInfo")}}}',
					// 						value: '{{$stringToMoment((data.nsxxDto.KYRQ), "YYYY-MM-DD")}}',
					// 						onChange: "{{function(v) {$sf('data.nsxxDto.KYRQ', $momentToString(v,'YYYY-MM-DD'))}}}",
					// 					}
					// 				}, {
					// 					name: 'registerNum',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '组织机构代码',
					// 					validateStatus: "{{data.error.orgInfo.ZZJGDM?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.ZZJGDM}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.ZZJGDM}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.ZZJGDM', e.target.value, '组织机构代码')}}}",
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'line7',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				_visible: '{{data.other.detailInfo}}',
					// 				children: [{
					// 					name: 'level',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '总分机构标志',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Select',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-orgInfo")}}}',
					// 						showSearch: false,
					// 						value: '{{data.nsxxDto.ZFJGBZ}}',
					// 						onChange: "{{function(e){$setField('data.nsxxDto.ZFJGBZ',e)}}}",
					// 						children: {
					// 							name: 'option',
					// 							component: 'Select.Option',
					// 							key: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].id}}',
					// 							value: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].code}}',
					// 							children: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].name}}',
					// 							_power: 'for in data.enumData.tax.ZFJGLX.enumDetails',
					// 						}
					// 					}
					// 				}, {
					// 					name: 'registerNum',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '代扣代缴标志',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Select',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-orgInfo")}}}',
					// 						showSearch: false,
					// 						value: '{{data.nsxxDto.DKDJBZ}}',
					// 						onChange: "{{function(e){$setField('data.nsxxDto.DKDJBZ',e)}}}",
					// 						children: {
					// 							name: 'option',
					// 							component: 'Select.Option',
					// 							key: '{{data.enumData.tax.DKDJBZ.enumDetails[_rowIndex].id}}',
					// 							value: '{{data.enumData.tax.DKDJBZ.enumDetails[_rowIndex].code}}',
					// 							children: '{{data.enumData.tax.DKDJBZ.enumDetails[_rowIndex].name}}',
					// 							_power: 'for in data.enumData.tax.DKDJBZ.enumDetails',
					// 						}
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'line9',
					// 				component: '::div',
					// 				className: 'itemLine textarea',
					// 				_visible: '{{data.other.detailInfo}}',
					// 				children: [{
					// 					name: 'enableDate',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '经营范围',
					// 					validateStatus: "{{data.error.orgInfo.JYFW?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.JYFW}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input.TextArea',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.JYFW}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(200, 'data.error.orgInfo.JYFW', e.target.value, '经营范围')}}}",
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'line10',
					// 				component: '::div',
					// 				className: 'itemLine textarea',
					// 				_visible: '{{data.other.detailInfo}}',
					// 				children: [{
					// 					name: 'enableDate',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '生产经营地址',
					// 					validateStatus: "{{data.error.orgInfo.SCJYDZ?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.SCJYDZ}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input.TextArea',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.SCJYDZ}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(200, 'data.error.orgInfo.SCJYDZ', e.target.value, '生产经营地址')}}}",
					// 					}
					// 				}]
					// 			}
					// 			]
					// 		}]
					// 	}, {
					// 		name: 'tax',
					// 		component: '::div',
					// 		children: [{
					// 			name: 'title',
					// 			className: 'blockTitle',
					// 			component: '::div',
					// 			children: [{
					// 				name: 'name',
					// 				component: '::span',
					// 				children: '税务机关信息'
					// 			}, {
					// 				name: 'line',
					// 				component: '::div',
					// 				className: 'assistLine'
					// 			}, {
					// 				name: 'arrow',
					// 				component: '::div',
					// 				className: 'blockTitle-arrow',
					// 				onClick: '{{function() {$setField("data.other.title2", !data.other.title2)}}}',
					// 				children: {
					// 					name: 'arrow',
					// 					component: 'Icon',
					// 					fontFamily: 'edficon',
					// 					type: '{{data.other.title2 ? "shang" : "xia"}}'
					// 				}
					// 			}]
					// 		}, {
					// 			name: 'block',
					// 			component: '::div',
					// 			_visible: '{{data.other.title2}}',
					// 			children: [{
					// 				name: 'line1',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				children: [{
					// 					name: 'vatTaxpayer',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '主管税务局',
					// 					validateStatus: "{{data.error.orgInfo.ZGSWJ?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.ZGSWJ}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.ZGSWJ}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.ZGSWJ', e.target.value, '主管税务局')}}}",
					// 					}
					// 				}, {
					// 					name: 'vatTaxpayerNum',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '主管税务人员',
					// 					validateStatus: "{{data.error.orgInfo.ZGSWRY?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.ZGSWRY}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.ZGSWRY}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.ZGSWRY', e.target.value, '主管税务人员')}}}",
					// 					}
					// 				}]
					// 			}]
					// 		}]
					// 	}, {
					// 		name: 'login',
					// 		component: '::div',
					// 		children: [{
					// 			name: 'title',
					// 			className: 'blockTitle',
					// 			component: '::div',
					// 			children: [{
					// 				name: 'name',
					// 				component: '::span',
					// 				children: '联系人信息'
					// 			}, {
					// 				name: 'line',
					// 				component: '::div',
					// 				className: 'assistLine'
					// 			}, {
					// 				name: 'arrow',
					// 				component: '::div',
					// 				className: 'blockTitle-arrow',
					// 				onClick: '{{function() {$setField("data.other.title3", !data.other.title3)}}}',
					// 				children: {
					// 					name: 'arrow',
					// 					component: 'Icon',
					// 					fontFamily: 'edficon',
					// 					type: '{{data.other.title3 ? "shang" : "xia"}}'
					// 				}
					// 			}]
					// 		}, {
					// 			name: 'block',
					// 			component: '::div',
					// 			_visible: '{{data.other.title3}}',
					// 			children: [{
					// 				name: 'line1',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				children: [{
					// 					name: 'account',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '法定负责人',
					// 					validateStatus: "{{data.error.orgInfo.FDFZR?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.FDFZR}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.FDFZR}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.FDFZR', e.target.value, '法定负责人')}}}",
					// 					}
					// 				}, {
					// 					name: 'account',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '联系电话',
					// 					validateStatus: "{{data.error.orgInfo.FDFZR_TEL?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.FDFZR_TEL}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.FDFZR_TEL}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.FDFZR_TEL', e.target.value, '联系电话')}}}",
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'line2',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				children: [{
					// 					name: 'account',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '财务负责人',
					// 					validateStatus: "{{data.error.orgInfo.CWFZR?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.CWFZR}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.CWFZR}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.CWFZR', e.target.value, '财务负责人')}}}",
					// 					}
					// 				}, {
					// 					name: 'password',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '联系电话',
					// 					validateStatus: "{{data.error.orgInfo.CWFZR_TEL?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.CWFZR_TEL}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.CWFZR_TEL}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.CWFZR_TEL', e.target.value, '联系电话')}}}",
					// 					}
					// 				}]
					// 			}, {
					// 				name: 'line3',
					// 				component: '::div',
					// 				className: 'itemLine',
					// 				children: [{
					// 					name: 'account',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '办税员',
					// 					validateStatus: "{{data.error.orgInfo.BSY?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.BSY}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.BSY}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.BSY', e.target.value, '办税员')}}}",
					// 					}
					// 				}, {
					// 					name: 'account',
					// 					component: 'Form.Item',
					// 					colon: false,
					// 					label: '联系电话',
					// 					validateStatus: "{{data.error.orgInfo.BSY_TEL?'error':'success'}}",
					// 					help: '{{data.error.orgInfo.BSY_TEL}}',
					// 					children: {
					// 						name: 'input',
					// 						component: 'Input',
					// 						disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
					// 						value: '{{data.nsxxDto.BSY_TEL}}',
					// 						timeout: true,
					// 						onChange: "{{function(e){$checkNotRequire(50, 'data.error.orgInfo.BSY_TEL', e.target.value, '联系电话')}}}",
					// 					}
					// 				}]
					// 			}]
					// 		}]
					// 	}]
					// }
					]
				},
					{
					name: 'tab2',
					component: 'Tabs.TabPane',
					forceRender: false,
					className: 'sfzxxTab',
					tab: '税费种认定',
					key: '2',
					children: [
					{
						name: 'sfzxxOperation',
						component: '::div',
						className: 'sfzxxOperation',
						children: [{
							name: 'sfzxxSearchIcon',
							component: 'Icon',
							className: 'sfzxxSearchIcon',
							fontFamily: 'edficon',
                            type: 'sousuo',
							onClick: "{{$handleSfzxxSearch}}",
							placeholder: "请输入征收项目名称"
						},{
							name: 'sfzxxSearch',
							component: 'Input',
							className: 'mk-input sfzxxSearch',
							width: 225,
							// onChange: '',
							autocomplete: "off",
							value: '{{data.other.tab2Params.zsxm}}',
							onChange: "{{function(e){$changeValue( e.target.value )}}}",
							// onPressEnter: "{{function(e){$changeValue( e.target.value )}}}",
							onPressEnter: "{{$handleSfzxxSearch}}",
							placeholder: "请输入征收项目名称"
						},{
							name: 'sfzxxCheck',
							component: 'Checkbox',
							children: '隐藏失效的记录',
							checked: '{{data.other.tab2Params.isInvalid}}',
							// onChange: '{{$selectAll()}}',
							onChange: "{{function(e){$changeCheck( e.target.checked )}}}",
							// key: '1122',
							// value: '1122',
							className: 'radio sfzxxCheck'
						}]
					},
					 {
						name: 'taxDiv',
						component: '::div',
						className: 'taxDiv',
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
								width: 230,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '征收项目'
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
								width: 230,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '征收品目'
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
							}, 
							{
								name: 'YXQQ',
								component: 'DataGrid.Column',
								columnKey: 'YXQQ',
								flexGrow: 1,
								width: 80,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '有效期（起）'
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
									children: '有效期（止）'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									value: '{{$renderDate(data.sfzxxDtos[_rowIndex] && data.sfzxxDtos[_rowIndex].YXQZ)}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}, {
								name: 'SL',
								component: 'DataGrid.Column',
								columnKey: 'SL',
								flexGrow: 1,
								width: 80,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '税率或单位税额'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									value: '{{data.sfzxxDtos[_rowIndex] && data.sfzxxDtos[_rowIndex].SLHDWSE}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}, {
								name: 'ZSL',
								component: 'DataGrid.Column',
								columnKey: 'ZSL',
								flexGrow: 1,
								width: 80,
								header: {
									name: 'header',
									component: 'DataGrid.Cell',
									children: '征收率'
								},
								cell: {
									name: 'cell',
									component: 'DataGrid.TextCell',
									value: '{{data.sfzxxDtos[_rowIndex] && data.sfzxxDtos[_rowIndex].ZSL}}',
									_power: '({rowIndex}) => rowIndex',
								}
							}]
						}]
					}, {
						name: 'footer',
						component: '::div',
						className: 'sfzxxFooter',
						children: [{
							name: 'pagination',
							component: 'Pagination',
							showSizeChanger: true,
							pageSizeOptions: ['30', '50', '100'],
							pageSize: '{{data.other.tab2Params.page.pageSize||30}}',
							current: '{{data.other.tab2Params.page.currentPage||1}}',
							total: '{{data.other.tab2Params.page.total||30}}',
							onChange: '{{$pageChanged}}',
							onShowSizeChange: '{{$pageChanged}}'
						}]
					}]
				},
					{
					name: 'tab3',
					component: 'Tabs.TabPane',
					className: 'zgrdTab',
					forceRender: false,
					// _visible: '{{data.other.isShowOtherMsg}}',
					tab: '资格认定',
					key: '3',
					children: [
					{
						name: 'zgrdDiv',
						component: '::div',
						className: 'zgrdDiv',
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
									children: '有效期（起）'
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
									children: '有效期（止）'
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
									children: '数据终止日期'
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
				},
					{
					name: 'tab4',
					component: 'Tabs.TabPane',
					forceRender: false,
					className: 'cwbbTab',
					tab: '财务报表设置',
					key: '4',
					children: [
						{
						name: 'cwbbszTab',
						component: '::div',
						className:'cwbbszTab',
						children: [{
							name: 'save',
							component: '::div',
							className: 'save',
							_visible: false,
							children: [{
								name: 'button',
								onClick: '{{$saveFinanceInfo}}',
								component: 'Button',
								type: 'primary',
								children: '保存'
							}]
						}, {
							name: 'content',
							component: '::div',
							className: 'ttk-es-app-org-main-content ttk-es-app-org-main-content-basicInfo',
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
									},{
										name: 'bar',
										component: '::div',
										className: 'refreshBtn',
										// _visible: '{{$getCanEditSS()}}',
										_visible: false,
										style: {
											float: 'left',
											position: 'absolute',
											zIndex: 1,
											marginLeft: '59px',
											background: '#fff',
										},
										children: [{
											name: 'refresh',
											component: 'Icon',
											fontFamily: 'edficon',
											onClick: '{{$readFinanceInfo2}}',
											type: 'shuaxin',
											style: { fontSize: '28px', lineHeight: '30px',float: 'left' }
										}]
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
													// disabled: true,
													// disabled: '{{data.other.isReadOnly || !data.other.canModify}}',
													// getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-basicInfo")}}}',
													showSearch: false,
													value: '{{data.finance.accountingStandardsId}}',
													onChange: "{{function(e){$setTab4Field('data.finance.accountingStandardsId',e)}}}",
													children: {
														name: 'option',
														component: 'Select.Option',
														value: '{{data.other.rules[_rowIndex].accountingStandardCode}}',
														children: '{{data.other.rules[_rowIndex].accountingStandardName}}',
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
													// disabled: '{{data.other.isReadOnly || !data.other.canModify}}',
													// getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-basicInfo")}}}',
													showSearch: false,
													// disabled: true,
													// disabled: '{{!$getCanEditSS()}}',
													value: '{{data.finance.reportingCategoryCode}}',
													onChange: "{{function(e){$setTab4Field('data.finance.reportingCategoryCode',e)}}}",
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
										name: 'line21',
										component: '::div',
										className: 'itemLine',
										children: [{
											name: 'type',
											component: 'Form.Item',
											colon: false,
											label: '资料报送子类：',
											validateStatus: "{{data.error.reportingSubCategoryCode?'error':'success'}}",
											help: '{{data.error.reportingSubCategoryCode}}',
											required: true,
											children: {
												name: 'select',
												component: '::div',
												style: { position: 'relative' },
												children: [{
													name: 'select',
													component: 'Select',
													// disabled: '{{data.other.isReadOnly || !data.other.canModify}}',
													// getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-org-main-content-basicInfo")}}}',
													showSearch: false,
													// disabled: true,
													// disabled: '{{!$getCanEditSS()}}',
													value: '{{data.finance.reportingSubCategoryCode}}',
													onChange: "{{function(e){$setTab4Field('data.finance.reportingSubCategoryCode',e)}}}",
													children: {
														name: 'option',
														component: 'Select.Option',
														value: '{{data.other.subTypes[_rowIndex].reportingSubCategoryCode}}',
														children: '{{data.other.subTypes[_rowIndex].reportingSubCategoryName}}',
														_power: 'for in data.other.subTypes',
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
													value: '{{data.finance.reportingPeriod}}',
													onChange: "{{function(e){$setTab4Field('data.finance.reportingPeriod',e)}}}",
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
							}, {
								name: 'message',
								component: '::div',
								// 广东44：不允许修改，接口返回什么就显示什么，返回空，也显示空。
								// 福建35，陕西61，贵州52，北京11，青海63：可修改。
								className:'textTips',
								children: [{
									name: 'messageTitle',
									className: 'messageTitle',
									component: '::div',
									children: '温馨提示：'
								}]
							},{
                                name: 'message1',
                                component: '::div',
                                style: {
                                    fontSize: '12px'
                                },
                                children: [ {
                                    name: 'messageItem3',
                                    className: 'messageItem',
                                    component: '::div',
                                    children: '财务报表报送类型以资料报送子类为准，目前系统仅支持小企业会计准则、企业会计准则（一般企业，未执行新准则）、企业会计制度'
                                }]
                            },
								{
								name: 'message2',
								component: '::div',
								// 广东44：不允许修改，接口返回什么就显示什么，返回空，也显示空。
								// 福建35，陕西61，贵州52，北京11，青海63：可修改。
								// _visible: '{{$getCanEditSS()}}',
								_visible: false,
								style: {
									fontSize: '12px'
								},
								children: [ {
									name: 'messageItem4',
									className: 'messageItem',
									component: '::div',
									children: '手工编辑数据后，将以编辑后的数据为准，如需从局端获取，请点击左侧的刷新按钮。'
								}]
							},{
                                name: 'message3',
                                component: '::div',
                                style: {
                                    fontSize: '12px'
                                },
                                children: [ {
                                    name: 'messageItem5',
                                    className: 'messageItem',
                                    component: '::div',
                                    children: [
										{
											name:'mess',
											component:'::span',
											children:'手动修改后，下载纳税人信息时不更新【财务报表设置】内容，如需按下载数据更新，请点击'
										},
                                        {
                                            name:'mess',
                                            component:'::a',
                                            children:'下载并更新',
											onClick:'{{$downLoadAndUpdate}}'
                                        }
									]
                                }]
                            },

							]
						}]
					}
					]
				},
					{
					name: 'tab5',
					component: 'Tabs.TabPane',
					forceRender: false,
					className: 'cwbbTab',
					tab: '加计抵减政策',
                        _visible:'{{data.areaType == 0}}',
					key: '5',
					children: [{
						name: 'jjdjzcTab',
						component: '::div',
						className:'cwbbszTab jjdjzcTab',
						children: [{
							name: 'content',
							component: '::div',
							className: 'ttk-es-app-org-main-content ttk-es-app-org-main-content-basicInfo',
							children: [{
									name: 'line1',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'vatTaxpayer',
										component: 'Form.Item',
										label: '是否适用加计抵减政策',
										children: {
											name: 'input',
											component: 'Input',
											disabled: true,
											value: '{{data.nsxxDto.sfsyjjdjzc}}',
											timeout: true,
										}
									}]
								},{
									name: 'line2',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'vatTaxpayer',
										component: 'Form.Item',
										label: '适用年度',
										children: {
											name: 'input',
											component: 'Input',
											disabled: true,
											value: '{{data.nsxxDto.syndDate}}',	
										}
									}]
								},{
									name: 'line3',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'vatTaxpayer',
										component: 'Form.Item',
										label: '适用政策有效期(起)',
										children: {
											name: 'input',
											component: 'Input',
											disabled: true,
											value: '{{data.nsxxDto.syzcyxqq}}',
										}
									}]
								},{
									name: 'line4',
									component: '::div',
									className: 'itemLine',
									children: [{
										name: 'vatTaxpayer',
										component: 'Form.Item',
										label: '适用政策有效期(止)',
										children: {
											name: 'input',
											component: 'Input',
											disabled: true,
											value: '{{data.nsxxDto.syzcyxqz}}',
										}
									}]
								}]
						}]
					}]
				},
					{
					name: 'tab6',
					component: 'Tabs.TabPane',
					forceRender: false,
					tab: '总分机构设置',
						_visible:'{{data.areaType == 0}}',
					key: '6',
					children: [
					{
						name: 'basic',
						component: '::div',
						children: [{
								name: 'nsrjbxx',
								className: 'nsrjbxx tab1Content',
								component: '::div',
								children: [
								{
									name: 'title1',
									className: 'blockTitle',
									component: '::div',
									children: [{
										name: 'name',
										component: '::span',
										children: '总分机构类型'
									}, {
										name: 'line',
										component: '::div',
										className: 'assistLine'
									}]
								},{
									name: 'nsrjbxxTitle1',
									className: 'nsrjbxxTitle tab1Form',
									component: '::div',
									children: [
										{
											name: 'nsrjbxxTable',
											className: 'nsrjbxxTable',
											component: '::div',
											children: [
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '总分机构类型',
															children: '总分机构类型'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.basic.vatTaxpayerNum}}',
															children:{
																name: 'ZFJGBZ',
																component: 'Select',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																// getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
																showSearch: false,
																value: '{{data.zfjgInfo.zfjglx}}',
																onChange: "{{function(e){$setField('data.zfjgInfo.zfjglx',e)}}}",
																children: {
																	name: 'option',
																	component: 'Select.Option',
																	key: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].id}}',
																	value: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].code}}',
																	children: '{{data.enumData.tax.ZFJGLX.enumDetails[_rowIndex].name}}',
																	_power: 'for in data.enumData.tax.ZFJGLX.enumDetails',
																}
															} 
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '跨地区税收专业企业类型',
															children: '跨地区税收专业企业类型'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.zfjgInfo.kdqsszyqylx}}',
															children:{
																name: 'KDQSSZYQY',
																component: 'Select',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																// getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
																showSearch: false,
																value: '{{data.zfjgInfo.kdqsszyqylx}}',
																onChange: "{{function(e){$setField('data.zfjgInfo.kdqsszyqylx',e)}}}",
																children: {
																	name: 'option',
																	component: 'Select.Option',
																	key: '{{data.enumData.basic.KDQSSZYQYLX[_rowIndex].id}}',
																	value: '{{data.enumData.basic.KDQSSZYQYLX[_rowIndex].code}}',
																	children: '{{data.enumData.basic.KDQSSZYQYLX[_rowIndex].name}}',
																	_power: 'for in data.enumData.basic.KDQSSZYQYLX',
																}
															} 
														}
													]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '汇总（合并）纳税企业机构类别',
															children: '汇总（合并）纳税企业机构类别'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.zfjgInfo.hznsqyjglb}}',
															children:{
																name: 'HZNSQYJGLB',
																component: 'Select',
																// getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
																showSearch: false,
																value: '{{data.zfjgInfo.hznsqyjglb}}',
																onChange: "{{function(e){$setField('data.zfjgInfo.hznsqyjglb',e)}}}",
																children: {
																	name: 'option',
																	component: 'Select.Option',
																	key: '{{data.enumData.basic.HZNSQYJGLB[_rowIndex].id}}',
																	value: '{{data.enumData.basic.HZNSQYJGLB[_rowIndex].code}}',
																	children: '{{data.enumData.basic.HZNSQYJGLB[_rowIndex].name}}',
																	_power: 'for in data.enumData.basic.HZNSQYJGLB',
																}
															} 
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '就地缴纳标识',
															children: '就地缴纳标识'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.zfjgInfo.jdjnbs}}',
															children:{
																name: 'JDJNBS',
																component: 'Select',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																// getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
																showSearch: false,
																value: '{{data.zfjgInfo.jdjnbs}}',
																onChange: "{{function(e){$setField('data.zfjgInfo.jdjnbs',e)}}}",
																children: {
																	name: 'option',
																	component: 'Select.Option',
																	key: '{{data.enumData.basic.JDJNBS[_rowIndex].id}}',
																	value: '{{data.enumData.basic.JDJNBS[_rowIndex].code}}',
																	children: '{{data.enumData.basic.JDJNBS[_rowIndex].name}}',
																	_power: 'for in data.enumData.basic.JDJNBS',
																}
															} 
														},
														
													]
												},
												{
													name: 'nsrjbxxTr',
													className: 'nsrjbxxTr',
													component: '::div',
													children: [
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '汇总企业范围',
															children: '汇总企业范围'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.zfjgInfo.hzqyfw}}',
															children:{
																name: 'HZQYFW',
																component: 'Select',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																// getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
																showSearch: false,
																value: '{{data.zfjgInfo.hzqyfw}}',
																onChange: "{{function(e){$setField('data.zfjgInfo.hzqyfw',e)}}}",
																children: {
																	name: 'option',
																	component: 'Select.Option',
																	key: '{{data.enumData.basic.HZQYFW[_rowIndex].id}}',
																	value: '{{data.enumData.basic.HZQYFW[_rowIndex].code}}',
																	children: '{{data.enumData.basic.HZQYFW[_rowIndex].name}}',
																	_power: 'for in data.enumData.basic.HZQYFW',
																}
															} 
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellTitle2',
															component: '::div',
															title: '汇总企业类型',
															children: '汇总企业类型'
														},
														{
															name: 'nsrjbxxCell',
															className: 'nsrjbxxCell nsrjbxxCellValue6',
															component: '::div',
															title: '{{data.zfjgInfo.hzqylx}}',
															children:{
																name: 'HZQYLX',
																component: 'Select',
																// disabled: '{{data.other.isReadOnly || data.other.isShowOtherMsg}}',
																// getPopupContainer: '{{function(){return document.querySelector(".edfx-app-org-main-content-orgInfo")}}}',
																showSearch: false,
																value: '{{data.zfjgInfo.hzqylx}}',
																onChange: "{{function(e){$setField('data.zfjgInfo.hzqylx',e)}}}",
																children: {
																	name: 'option',
																	component: 'Select.Option',
																	key: '{{data.enumData.basic.HZQYLX[_rowIndex].id}}',
																	value: '{{data.enumData.basic.HZQYLX[_rowIndex].code}}',
																	children: '{{data.enumData.basic.HZQYLX[_rowIndex].name}}',
																	_power: 'for in data.enumData.basic.HZQYLX',
																}
															} 
														},
													]
												}]
										}
									]
								},{
									name: 'title2',
									className: 'blockTitle',
									component: '::div',
									children: [{
										name: 'name',
										component: '::span',
										children: '分支机构信息'
									}, {
										name: 'line',
										component: '::div',
										className: 'assistLine'
									}]
								},{
									name: 'block',
									component: '::div',
									_visible: '{{data.other.title13}}',
									children: [{
										name: 'save',
										component: '::div',
										className: 'save',
										children: [{
											name: 'button',
											component: 'Button',
											onClick: '{{$delBatchClick}}',
											// type: 'primary',
											children: '删除'
										},{
											name: 'button',
											component: 'Button',
											onClick: '{{$addClick}}',
											type: 'primary',
											children: '新增'
										}]
									},{
										className: 'ttk-es-app-org-main-table',
										name: 'report',
										component: 'Table',
										key: '{{data.tableKey}}',
										checkboxKey: 'id',
										remberName: 'ttk-es-app-org-main-table',
										loading: '{{data.loading}}',
										checkboxChange: '{{$checkboxChange}}',
										checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
										pagination: false,
										scroll: '{{data.list.length > 0 ? data.tableOption : {} }}',
										enableSequenceColumn: true,
										//onChange: '{{$tableOnchange}}',
										Checkbox: false,
										rowSelection: '{{$rowSelection()}}',
										noDelCheckbox: true,
										bordered: true,
										dataSource: '{{data.list}}',
										columns: '{{$renderColumns()}}',
										rowKey: "id",
									}]
								}]
							}
						]
					}]
				}
				]
			}, {
				name: 'tab4Footer',
				component: '::div',
				className: 'tab4Footer',
				// _visible: '{{data.other.activeTabKey=="4"&&$getCanEditSS()}}',
				_visible: '{{data.other.activeTabKey=="1"||data.other.activeTabKey=="4"||data.other.activeTabKey=="6"}}',
				children: [
					{
						name: 'tab1SaveBtn',
						component: 'Button',
						type: 'primary',
						children: '保存',
						onClick: '{{$saveButton}}',
						className: 'tab1EditBtn footerBtn',
					},
					{
						name: 'tab1SaveBtn',
						component: 'Button',
						children: '关闭',
						onClick: '{{$onCancel}}',
						className: 'tab1EditBtn footerBtn',
					}
				]
			}
			]
		}]

	}
}

export function getInitState() {
	return {
		data: {
			list:[],
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
				gssbmm: ''
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
				ZFJGBZ: null,
				QYSDSZSFS:null,
			},
			zfjgInfo:{
				zfjglx:null,
				kdqsszyqylx:null,
				hznsqyjglb:null,
				jdjnbs:null,
				hzqyfw:null,
				hzqylx:null
			},
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
			finance: {
				
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
				openSjvatTaxpayerChangeStateState: 0,				//是否读取企业信息
				rules: [],
				types: [],
				subTypes:[],
				CopySubTypes:[],
				durings: [],
				tab2Params: {
					isInvalid: true,
					page: {
						currentPage: 1,
						pageSize: 30
					}
				}
			},
			error: {
				orgInfo: {}
			},
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			inputReadOnly: true,
			fdfzrEdit:false
		}
	}
}
