export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-inventory',
		onMouseDown: '{{$mousedown}}',
		children: [
			{
				name: 'ttk-stock-app-spin',
				className: 'ttk-stock-app-spin',
				component: '::div',
				_visible: '{{data.loading}}',
				children: '{{$stockLoading()}}'
			},
			{
				name:'header',
				component:'::div',
				className:'ttk-stock-app-inventory-header',
				children:[
					{
						name:'qujian',
						component:'::div',
						className:'ttk-stock-app-inventory-DatePicker',
						children:[
							{
								name: 'codeItem',
								component: '::span',
								children: '会计期间：',
								className:'ttk-stock-app-inventory-header-label',
							},
							{
								name: 'enabledDate',
								component: 'DatePicker.MonthPicker',
								className: 'ttk-stock-app-inventory-DatePicker-enabledDate',
								disabledDate: "{{$disabledDate}}",
								value: "{{$stringToMoment((data.form.enableDate),'YYYY-MM')}}",
								placeholder: "会计期间",
								onChange: "{{function(v){$changePeriod('data.form.enableDate', $momentToString(v,'YYYY-MM'))}}}",
							},
							{
								name: 'ttk-stock-app-inventory-stockAccount-tips',
								className: 'ttk-stock-app-inventory-stockAccount-tips',
								component: '::span',
								_visible: '{{data.isTips}}',
								children: '{{$renderStockAccountTips()}}'
							}
						]
					},
					{
						name:'gongye',
						component:'::span',
						className:'ttk-stock-app-inventory-h2',
						children:'{{data.pageTitle}}',
					},
					
				]
			},
			{
				name: 'conent',
				component: '::div',
				className: 'ttk-stock-app-inventory-conent',
				onMouseDown: '{{$mousedown}}',
				children: [
					{
						name:'cunhuozhezhi',
						component: '::div',
						className: 'ttk-stock-app-inventory-div',
						children:[
							{
								name:'shuzi',
								component: '::span',
								className: 'ttk-stock-app-inventory-number',
								children:'1'						
							},
							{
								name:'shezhiicon',
								component: '::div',
								className: 'churu block-title-img',
							},
							{
								name:'churuku',
								component: '::span',
								className: 'ttk-stock-app-inventory-div-block',
								children:'出入库'														
							},
							{
								name:'shezhiziti',
								component: '::div',
								className: 'ttk-stock-app-inventory-conent-div',
								children: '{{$renderBtnContent("采购入库", "cg")}}',
								onClick: '{{$purchase}}',
							},
							{
								name:'shezhijieshi',
								component: '::div',
								className: 'ttk-stock-app-inventory-conent-div',
								children: '{{$renderBtnContent("销售收入", "xs")}}',
								onClick: '{{$xiaoshou}}',
							},
							{
								name:'shezhijieshi',
								component: '::div',
								className: 'ttk-stock-app-inventory-conent-div',
								children: '{{"其他出入库"}}',
								onClick: '{{$otherStorage}}',
							},
							{
								name:'diyibu',
								component: '::div',
								className: 'ttk-stock-app-inventory-div-block-title',
								children:{
									name:'icon',
									component:'::div',
									className: 'xiayibu ttk-stock-app-inventory-div-block-title-icon',
								}
						},
						]
					},
					{
						name:'cunhuodangan',
						component: '::div',
						className: 'ttk-stock-app-inventory-div',
						children:[
							{
								name:'shuzi',
								component: '::span',
								className: 'ttk-stock-app-inventory-number',
								children:'2'						
							},
							{
								name:'shezhiicon',
								component: '::div',
								className: 'zanguchuli block-title-img',
							},
							{
								name:'zanguchuli',
								component:'::span',
								className:'ttk-stock-app-inventory-div-block',
								children:'暂估处理'														
							},
							{
								name:'shezhiziti',
								component: '::div',
								className: 'ttk-stock-app-inventory-conent-div',
								children:'暂估入库',
								onClick: '{{$ruku}}',
							},
							{
								name:'shezhijieshi',
								component: '::div',
								className: 'ttk-stock-app-inventory-conent-div',
								children:'暂估冲回',
								onClick: '{{$chonghui}}',
							},
							{
								name:'dierbu',
								component: '::div',
								className: 'ttk-stock-app-inventory-div-block-title',
								children:{
									name:'icon',
									component:'::div',
									className: 'xiayibu ttk-stock-app-inventory-div-block-title-icon',
								}
							},
						]
					},
					{
						name:'jiliangdanwei',
						component: '::div',
						_visible:'{{data.typeFlag==1}}',
						className: 'ttk-stock-app-inventory-div',
						children:[
							{
								name:'shuzi',
								component: '::span',
								className: 'ttk-stock-app-inventory-number',
								children:'3'						
							},
							{
								name:'shezhiicon',
								component: '::div',
								className: 'shengchan block-title-img',
							},
							{
								name:'shengcahnguanli',
								component: '::span',
								className:'ttk-stock-app-inventory-div-block',
								children:'生产管理'														
							},
							{
								name:'jzzzfy',
								component: '::div',
								className: 'ttk-stock-app-inventory-conent-div',
								children: '结转制造费用',
                                onClick: '{{$manufacturingCost}}',
                                _visible: "{{data.Industry}}"
							},
							{
								name:'shezhijieshi',
								component: '::div',
                                className: 'ttk-stock-app-inventory-conent-div',
                                children:'完工入库',
								onClick: '{{$warehousing}}'

							},
							{
								name:'shezhiziti',
								component: '::div',
								className: 'ttk-stock-app-inventory-conent-div',
								children:'生产领料',
								onClick: '{{$lingliao}}',
							},
							{
								name:'disanbu',
								component: '::div',
								className: 'ttk-stock-app-inventory-div-block-title',
								children:{
									name:'icon',
									component:'::div',
									className: 'xiayibu ttk-stock-app-inventory-div-block-title-icon',
								}
						},
						]
					},
					{
						name:'cunhuoqichu',
						component: '::div',
						className: 'ttk-stock-app-inventory-div',
						children:[
							{
								name:'shuzi',
								component: '::span',
								className: 'ttk-stock-app-inventory-number',
								children:'{{data.typeFlag==1?4:3}}'						
							},
							{
								name:'shezhiicon',
								component: '::div',
								className: 'chengben block-title-img',
							},
							{
								name:'chengbenhesuan',
								component: '::span',
								className:'ttk-stock-app-inventory-div-block',
								children:'成本核算'														
							},
							{
								name:'shezhiziti',
								component: '::div',
								className: 'ttk-stock-app-inventory-conent-div',
								_visible:'{{data.typeFlag==1}}',
								children:'结转生产成本',
								onClick: '{{$productionCost}}'
							},
							{
								name:'shezhijieshi',
								component: '::div',
								className: 'ttk-stock-app-inventory-conent-div',
                                children: '销售出库',
                                // children: '{{data.buttonName}}',
								onClick: '{{$businessCost}}'
							},
						]
					},]
			},
			{
				name:'foot',
				component:'::div',
				className:'ttk-stock-app-inventory-foot',
				children:[
					{
						name:'huizong',
						component:'::span',
						onClick: '{{$sfcSummary}}',
						className:'ttk-stock-app-inventory-foot-span hasIcon',
						children:{
							name: 'statements-btn1',
							className: 'statements-btn',
							component: '::span',
							children: '收发存汇总表'
						}	
					},
					{
						name:'mingxi',
						component:'::span',
						className:'ttk-stock-app-inventory-foot-span hasIcon',
						onClick: '{{$sfcDetail}}',
						children:{
							name: 'statements-btn2',
							className: 'statements-btn',
							component: '::span',
							children: '收发存明细表'
						}	
					},
					{
						name:'fenxi',
						component:'::span',
						className:'ttk-stock-app-inventory-foot-span hasIcon',
						onClick: '{{$salesGrossProfit}}',
						children:{
							name: 'statements-btn3',
							className: 'statements-btn',
							component: '::span',
							children: '销售毛利分析表'
						}	
					},
					{
						name:'gongye',
						component:'::span',
						_visible:'{{data.typeFlag==1}}',
						className:'ttk-stock-app-inventory-foot-span hasIcon',
						onClick: '{{$productioCostStatement}}',
						children:{
							name: 'statements-btn4',
							className: 'statements-btn',
							component: '::span',
							children: '生产成本计算表'
						}	
						
					},
					{
						name:'chyzz',
						component:'::span',
						className:'ttk-stock-app-inventory-foot-span hasIcon',
						onClick: '{{$chyzzBom}}',
						// _visible: '{{!data.xdzOrgIsStop}}',
						children:{
							name: 'statements-btn5',
							className: 'statements-btn',
							component: '::span',
							children: '存货与总账对账表'
						}	
					},
					// 新增表
					{
						name:'rkhz',
						component:'::span',
						className:'ttk-stock-app-inventory-foot-span hasIcon',
						onClick: '{{$rkhz}}',
						children:{
							name: 'statements-btn6',
							className: 'statements-btn',
							component: '::span',
							children: '入库汇总表'
						}	
					},
					{
						name:'ckhz',
						component:'::span',
						className:'ttk-stock-app-inventory-foot-span hasIcon',
						onClick: '{{$ckhz}}',
						children:{
							name: 'statements-btn7',
							className: 'statements-btn',
							component: '::span',
							children: '出库汇总表'
						}	
					},
					{
						name:'zghz',
						component:'::span',
						className:'ttk-stock-app-inventory-foot-span hasIcon',
						onClick: '{{$zghzBom}}',
						children:[{
							name: 'statements-btn8',
							className: 'statements-btn',
							component: '::span',
							children: '暂估汇总表'
						}]	
					},
					{
						name:'zgmx',
						component:'::span',
						className:'ttk-stock-app-inventory-foot-span hasIcon',
						onClick: '{{$zgmx}}',
						children:{
							name: 'statements-btn2',
							component: '::span',
							className: 'statements-btn',
							children: '暂估明细表'
						}	
					},
					{
						name:'last',
						component:'::span',
						className:'ttk-stock-app-inventory-foot-span',
					},
					{
						name:'last2',
						component:'::span',
						className:'ttk-stock-app-inventory-foot-span',
						_visible:'{{data.typeFlag==0}}',
					}
				]
			},{
				name:'header',
				component:'::div',
				_visible: '{{data.openFlag}}',
				className: 'ttk-stock-app-inventory-unOpen-tips',
				children:[
					{
						name:'context',
						component:'::div',
						className: 'ttk-stock-app-inventory-unOpen-tips-content',
						children:[
							{
								name:'jiantouicon',
								component: '::div',
								className: 'jiantou block-title-img',
							},
							{
								name:'shezhiicon',
								component: '::div',
								className: 'weiqidong block-title-img',
							},
							{
								name:'gongye',
								component:'::div',
								className: 'gongye',
								children:[
									{
										name:'gongye',
										component:'::span',
										className: 'gongye-text',
										children:'提示:'
										
									},{
										name:'gongye',
										component:'::span',
										className: 'gongye-tips',
										children:'尚未启用存货，请前往存货管理-存货设置中设置'
										
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
export function getInitState() {
	return {
		data: {
			loading: false,
			openFlag:false,
			typeFlag:0,
			enableBOMFlag: 0,
			isTips: false,
			form: {
				enableDate:''
			},
			pageTitle: '',
			list: [],
            other: {},
			Industry: false,
			warningTip: {
				cgTip: '入库单时序簿中有异常单据！',
				cgFlag: false,
				xsTip: '出库单时序簿中有异常单据！',
				xsFlag: false,
				llTip: '领料出库数据发生了变更，请更新本期发生数！',
				llFlag: false,
				wgTip: '完工入库数据发生了变更，请更新本期发生数！',
				wgFlag: false,
			},
            currentState: {},
            buttonName: '生成销售出库单'
		}
	}
}