
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-inventory-configure',
		children: '{{$renderPage()}}',
		// children: [
		// 	{
		// 		name: 'ttk-stock-app-spin',
		// 		className: 'ttk-stock-app-spin',
		// 		component: '::div',
		// 		_visible: '{{data.loading}}',
		// 		children: {
		// 			name: 'ttk-stock-app-inventory-picking-fast-spin-icon',
		// 			className: 'ttk-stock-app-inventory-picking-fast-spin-icon',
		// 			component: 'Spin',
		// 			size: 'large',
		// 			tip: '数据加载中......',
		// 			delay: 10
		// 		}
		// 	},
		// 	{ // 返回按钮
		// 		name:'back',
		// 		component:'::div',
		// 		className: 'back ttk-stock-inventory-configure-back',
		// 		onClick: '{{$back}}',
		// 	},{
		// 		name: 'header',
		// 		component: '::div',
		// 		className: 'ttk-stock-inventory-configure-header',
		// 		children:[{
		// 			name: 'step1',
		// 			component: '::div',
		// 			className: '{{data.other.tab1 ? "step step1" : "stepbiance step1"}}',
		// 			children: [{
		// 				name: 'step0',
		// 				component: '::span',
		// 				className: 'step1-child',
		// 				_visible: '{{data.other.tab1}}',
		// 				children: '①'
		// 			},{
		// 				name: 'step00',
		// 				component: 'Icon',
		// 				className: 'step1-child',
		// 				type: 'check',
		// 				_visible: '{{!data.other.tab1}}'
		// 			}, 
		// 				'选择存货业务'
		// 			],
		// 		},
		// 		{
		// 			name: 'san1',
		// 			component: '::div',
		// 			_visible:'{{data.other.tab1}}',
		// 			children: '',
		// 			className:'san san1',
		// 		},{
		// 			name: 'san2',
		// 			_visible:'{{data.other.tab1}}',
		// 			component: '::div',
		// 			children: '',
		// 			className:'san san2',
		// 		},{
		// 			name: 'step2',
		// 			component: '::div',
		// 			children: [{
		// 				name: 'step11',
		// 				component: '::span',
		// 				children: '②',
		// 				style: {marginRight: '8px'},
		// 			},{
		// 				name: 'step22',
		// 				component: '::span',
		// 				children: '配置存货参数'
		// 			}],
		// 			className: '{{data.other.tab1 ? "step step2" : "step step2-select"}}',
		// 		}]
		// 	},{
		// 		name:'selectTrue',
		// 		component:'::div',
		// 		className:'blockselectTrue',
				
		// 		children:[
		// 			{
		// 				_visible: "{{data.other.tab1==false}}",
		// 				name:'title',
		// 				className:'blockswitch-span',
		// 				component:'::span',
		// 				children:'您已选择：'
		// 			},
		// 			{
		// 				_visible: "{{data.other.tab1==false}}",
		// 				name:'content',
		// 				className:'blockswitch-span1',
		// 				component:'::span',
		// 				children:"{{data.form.inveBusiness==0?'商业类企业':'工业类企业'}}",
		// 			} , 
		// 			{
		// 				_visible: "{{data.other.tab1==false}}",
		// 				name: 'tooltip',
		// 				component: 'Tooltip',
		// 				placement: 'bottom',
		// 				overlayClassName:'helpIcon-tooltip',
		// 				title:`{{data.form.inveBusiness==0?'企业类企业：纯商业模式':'企业类企业：自行生产模式'}}`,
		// 				children:{
		// 					name: 'helpIcon',
		// 					component: 'Icon',
		// 					fontFamily: 'edficon',
		// 					type: 'bangzhutishi',
		// 					className: 'helpIcon',
		// 				},
		// 			},
		// 			// 更改记录start
		// 			{
		// 				name: 'record-change-set',
		// 				className: 'record-change-set',
		// 				component: '::div',
		// 				_visible: '{{(data.hasRecord != 0)}}',  //有存货记录的时候显示
		// 				children:[
		// 					{
		// 						name: 'record-change-set-text',
		// 						className: 'record-change-set-text',
		// 						component: '::span',
		// 						children: '更改：'
		// 					},
		// 					{
		// 						name: 'record-change-set-switch',
		// 						className: 'record-change-set-switch',
		// 						component: 'Switch',
		// 						checked: '{{data.setting.isChecked}}',
		// 						onChange: '{{$recordSwitchChange}}'
		// 					},
		// 					{
		// 						name: 'record-change-set-tips',
		// 						className: 'record-change-set-tips',
		// 						_visible: '{{data.setting.tipsShow}}',
		// 						component: '::div',
		// 						// children: '须同时打开设置按钮和选择更改月份之后才能进行修改 2、更改月份：本次更改设置的生效月份'
		// 						children: '{{$settingTips()}}'
		// 					},
		// 					{
		// 						name: 'record-change-set-month',
		// 						className: 'record-change-set-month',
		// 						component: 'DatePicker.MonthPicker',
		// 						value: '{{$stringToMoment((data.setting.month),"YYYY-MM")}}',
		// 						placeholder: '请选择更改月份',
		// 						_visible: '{{data.setting.isCheckedTag==true}}',  //开启更改按钮的时候显示
		// 						disabledDate: '{{$monthDisabled}}',
		// 						onChange: '{{$recordMonthChange}}',
		// 						getCalendarContainer: '{{function(trigger){return trigger.parentNode}}}'
		// 					},
		// 					{
		// 						name: 'ttk-stock-app-inventory-picking-fast-sub-isDistributed-tips',
		// 						className: 'ttk-stock-app-inventory-picking-fast-sub-isDistributed-tips stock-config-setting-help',
		// 						component: '::i',
		// 						children: '{{$renderSettingHelp()}}'
		// 					},
		// 					{
		// 						name: 'record-change-set-checkBtn',
		// 						className: 'record-change-set-checkBtn',
		// 						component: 'Button',
		// 						type: 'default',
		// 						children: '更改记录',
		// 						onClick: '{{$recordBtnClick}}'
		// 					}
		// 				],	
		// 			}
		// 			// 更改记录end
		// 		]
		// 	},{
		// 		name: 'body',
		// 		component: '::div',
		// 		className:'ttk-stock-inventory-configure-body',
		// 		children:[
		// 			{
		// 				name: 'tax',
		// 				component: '::div',
		// 				_visible: '{{data.other.tab1}}',
		// 				children: [{
		// 					name: 'title',
		// 					className: 'blockTitle',
		// 					component: '::div',
		// 					children: [{
		// 						name: 'name',
		// 						component: '::span',
		// 						children: '启用存货'
		// 					}, {
		// 						name: 'line',
		// 						component: '::div',
		// 						className: 'assistLine'
		// 					}]
		// 				},{
		// 					name:'switch',
		// 					className: 'blockswitch',
		// 					component:'::div',
		// 					children:[
		// 						{
		// 							name: 'select',
		// 							component: 'Switch',
		// 							size:'small',
		// 							checked:'{{data.form.state==1?true:false}}',
		// 							onChange:'{{$switchChange}}',
		// 						},
		// 						{
		// 							name: 'forzi',
		// 							component: '::span',
		// 							className:'blockswitch-span',
		// 							children:"{{data.form.state==1?'是':'否'}}"
		// 						},
		// 						{
		// 							name: 'enabledDate',
		// 							component: 'DatePicker.MonthPicker',
		// 							_visible: '{{data.form.state==1}}',
		// 							disabledDate: "{{$disabledDate}}",
		// 							disabled:"{{data.form.isInput==true?false:true}}",
		// 							// value: "{{$stringToMoment((data.form.period),'YYYY-MM')}}",
		// 							value: "{{$stringToMoment((data.form.startPeriod),'YYYY-MM')}}",
		// 							placeholder: "启用时间",
		// 							// onChange: "{{function(v){$sf('data.form.period', $momentToString(v,'YYYY-MM'))}}}",
		// 							onChange: "{{function(v){$sf('data.form.startPeriod', $momentToString(v,'YYYY-MM'))}}}",
		// 						},
		// 					]
							
		// 				},{
		// 					name:'conent',
		// 					className: 'blockswitch',
		// 					component:'::div',
		// 					children:[
		// 						{
		// 							name: 'name',
		// 							component: '::span',
		// 							className:'blockswitch-span1',
		// 							children: '存货业务：'
		// 						}, 
		// 						{
		// 							name: 'statusgroup',
		// 							component: 'Radio.Group',
		// 							className: 'status-group',
		// 							value: '{{data.form.inveBusiness}}',
		// 							onChange: "{{function(v){$inveBusinessChange('data.form.inveBusiness',v.target.value)}}}",
		// 							children: [
		// 								{
		// 									name: 'allright',
		// 									component: 'Radio',
		// 									key: 'allright',
		// 									// disabled:"{{data.form.state==2||data.form.state==0 }}",
		// 									disabled: '{{$canChange()}}',
		// 									value: 0,
		// 									children: '商业类(纯商业模式)'
		// 								},
		// 								{

		// 									name: 'tooltip',
		// 									component: 'Tooltip',
		// 									placement: 'bottom',
		// 									overlayStyle: { background: '#fff'},
		// 									overlayClassName:'helpIcon-tooltip',
		// 									title: '纯商业模式：适用于买进再卖出库存商品的商业零售批发企业',
		// 									children:{
		// 										name: 'helpIcon',
		// 										component: 'Icon',
		// 										fontFamily: 'edficon',
		// 										type: 'bangzhutishi',
		// 										className: 'helpIcon'
		// 									},
		// 								},
		// 								{
		// 									name: 'not',
		// 									component: 'Radio',
		// 									style: { paddingLeft: '40px' },
		// 									// disabled:"{{data.form.state==2||data.form.state==0 }}",
		// 									disabled: '{{$canChange()}}',
		// 									key: 'not',
		// 									value: 1,
		// 									children: '工业类(自行生产模式)'
		// 								},
		// 							{

		// 								name: 'tooltip',
		// 								component: 'Tooltip',
		// 								placement: 'bottom',
		// 								overlayClassName:'helpIcon-tooltip',
		// 								title: '自行生产模式：适用于原材料来自主采购、自行生产半成品、产成品的工业制造企业',
		// 								children:{
		// 									name: 'helpIcon',
		// 									component: 'Icon',
		// 									fontFamily: 'edficon',
		// 									type: 'bangzhutishi',
		// 									className: 'helpIcon'
		// 								},
		// 							},
		// 							]
		// 						},
		// 					]
							
		// 				}
		// 			]
		// 			},
		// 			{
		// 				name: 'main',
		// 				component: 'Tabs',
		// 				_visible: '{{data.other.tab1==false}}',
		// 				animated: false,
		// 				forceRender: false,
		// 				activeKey: '{{data.other.activeTabKey}}',
		// 				onChange: '{{$handleTabChange}}',
		// 				children: [
		// 					{
		// 					name: 'tab1',
		// 					component: 'Tabs.TabPane',
		// 					tab: '出库成本核算',
		// 					forceRender: false,
		// 					className:'sutOfStock',
		// 					key: '1',
		// 					children: [
		// 						{
		// 							name:'title',
		// 							className:'blockswitch-span1',
		// 							component:'::span',
		// 							children:'成本核算方式'
		// 						},
		// 						{
		// 							name: 'statusgroup',
		// 							component: 'Radio.Group',
		// 							className: 'status-group',
		// 							value: '{{data.form.checkOutType}}',
		// 							disabled: '{{$canChange()}}',
		// 							onChange: "{{function(v){$sf('data.form.checkOutType',v.target.value)}}}",
		// 							children: [
		// 								{
		// 									name: 'allright',
		// 									component: 'Radio',
		// 									key: 'allright',
		// 									value: 0,
		// 									children: '全月加权'
		// 								},
		// 							]
		// 						},
		// 						{
		// 							name:'content',
		// 							className:'blockswitch-span1',
		// 							component:'::span',
		// 							children: [{
		// 								name:'content',
		// 								className:'blockswitch-span1-text',
		// 								component:'::span',
		// 								children: '是否进行负库存控制'
		// 							},{
		// 								name:'content',
		// 								className:'blockswitch-span1-icon',
		// 								component:'::span',
		// 								children: '{{$renderHelp()}}'
		// 							}]
		// 						},
		// 						{
		// 							name: 'select',
		// 							className: 'blockswitch-span1-control-switch',
		// 							component: 'Switch',
		// 							disabled: '{{$canChange()}}',
		// 							checked:'{{data.form.bInveControl}}',
		// 							onChange:'{{$bInveControlChange}}',
		// 						},
		// 					]
		// 				}, {
		// 					name: 'tab2',
		// 					component: 'Tabs.TabPane',
		// 					forceRender: false,
		// 					_visible: "{{data.form.inveBusiness==1}}",
		// 					className:'sutOfStock production-cost-accounting',
		// 					tab: '生产成本核算',
		// 					key: '2',
		// 					children: [
		// 						{
		// 							name:'title',
		// 							className:'blockswitch-span1',
		// 							component:'::span',
		// 							children:'完工成本分摊方式:'
		// 						},
		// 						{
		// 							name: 'statusgroup',
		// 							component: 'Radio.Group',
		// 							className: 'status-group',
		// 							disabled: '{{$canChange()}}',
		// 							value: '{{data.form.endCostType}}',
		// 							onChange: "{{$endCostTypeChange}}",
		// 							children: [
		// 								{
		// 									name: 'allright',
		// 									component: 'Radio',
		// 									key: 'allright',
		// 									value: 0,
		// 									children: '以销定产 [ 销售成本率 ]'
		// 								},
		// 								{
		// 									name: 'allright',
		// 									component: 'Radio',
		// 									key: 'allright',
		// 									value: 1,
		// 									children: '传统生产 [ 产值百分比 ]'
		// 								},
		// 							]
		// 						},
		// 						{
		// 							name: 'distribute-status-group',
		// 							component: 'Radio.Group',
		// 							className: 'distribute-status-group status-group',
		// 							value: '{{data.form.automaticDistributionMark}}',
		// 							_visible: '{{data.form.endCostType==0}}',
		// 							disabled: '{{$canChange()}}',
		// 							onChange: "{{$markChange}}",
		// 							children: [
		// 								{
		// 									name: 'distribute-method-1',
		// 									component: 'Radio',
		// 									key: 'distribute-method-1',
		// 									value: 1,
		// 									children: '自动分配本期结转和本期结余'
		// 								},
		// 								{
		// 									name: 'distribute-method-2',
		// 									component: 'Radio',
		// 									key: 'distribute-method-2',
		// 									value: 0,
		// 									children: '人工分配'
		// 								},
		// 							]
		// 						},
		// 						{
		// 							name:'title5',
		// 							className:'blockswitch-span1',
		// 							component:'::span',
		// 							children:'完工入库数来源:'
		// 						},
		// 						{
		// 							name: 'statusgroup',
		// 							component: 'Radio.Group',
		// 							className: 'status-group',
		// 							disabled: '{{$canChange()}}',
		// 							value: '{{data.form.endNumSource}}',
		// 							onChange: '{{$endNumSourceChange}}',
		// 							children: [
		// 								{
		// 									name: 'allright',
		// 									component: 'Radio',
		// 									key: 'allright',
		// 									value:1,
		// 									children: '根据本期销售数确定完工入库数'
		// 								},
		// 								{
		// 									name: 'allright',
		// 									component: 'Radio',
		// 									key: 'allright',
		// 									value:0,
		// 									children: '手工录入'
		// 								},
		// 							]
		// 						},
		// 						{
		// 							name:'title',
		// 							className:'blockswitch-span1',
		// 							component:'::span',
		// 							children: '是否启用BOM设置:'
		// 						},{
		// 							name: 'about-BOM',
		// 							className: 'about-BOM',
		// 							component: '::div',
		// 							children: [{
		// 								name: 'about-BOM-isOpen',
		// 								className: 'about-BOM-isOpen',
		// 								component: '::span',
		// 								children: [{
		// 									name: 'about-BOM-isOpen-check',
		// 									className: 'about-BOM-isOpen-check',
		// 									component: 'Switch',
		// 									checked: '{{data.form.enableBOMFlag==1}}',
		// 									disabled: '{{$canChange()}}', 
		// 									onChange: "{{$enableBOMFlagChange}}"
		// 								},{
		// 									name: 'about-BOM-isOpen-txt',
		// 									className: 'about-BOM-isOpen-txt',
		// 									component: '::span',
		// 									children: '是',
		// 								}]
		// 							},{
		// 								name: 'about-BOM-isDistribute',
		// 								className: 'about-BOM-isDistribute',
		// 								_visible: '{{data.form.enableBOMFlag==1}}',
		// 								disabled: '{{$canChange()}}',
		// 								component: 'Checkbox',
		// 								checked: '{{!!(data.form.auxiliaryMaterialAllocationMark)}}',
		// 								onChange: "{{$auxiliaryChange}}",
		// 								children: '辅料是否分摊到有BOM结构的产品中'
		// 							}]
		// 						}
		// 					]
		// 				},{
		// 					name: 'tab3',
		// 					component: 'Tabs.TabPane',
		// 					forceRender: false,
		// 					tab: '科目来源',
		// 					key: '3',
		// 					children: [
		// 						{
		// 							className: 'ttk-scm-app-expense-list-Body',
		// 							rowKey: "id",
		// 							name: 'report',
		// 							component: 'Table',
		// 							key: '{{data.tableKey}}',
		// 							style:{height:'100%'},
		// 							pagination: false,
		// 							enableSequenceColumn: true,
		// 							Checkbox: false,
		// 							noDelCheckbox: true,
		// 							bordered: true,
		// 							dataSource: '{{data.list}}',
		// 							columns: '{{$renderColumns()}}'
		// 						}
		// 					]
		// 				}]
		// 			}
		// 		]
		// 	},{
		// 		name: 'footer1',
		// 		component: '::div',
		// 		className: 'ttk-stock-inventory-configure-footer',
		// 		children:[{
		// 			name: 'last',
		// 			className: 'ttk-stock-inventory-configure-footer-btn',
		// 			component: 'Button',
		// 			disabled: '{{data.form.state==2||data.form.state==0}}',
		// 			type: '{{(data.other.tab1 ||$canChange()) ? "primary" : "default"}}',
		// 			children: '{{data.other.tab1 ? "下一步" : "上一步"}}',
		// 			onClick: '{{$next}}'
		// 		},{
		// 			name: 'save',
		// 			className: 'ttk-stock-inventory-configure-footer-btn',
		// 			component: 'Button',
		// 			children: '保存',
		// 			type: 'primary',
		// 			disabled: '{{$canChange()}}',
		// 			_visible: "{{data.other.tab1==false}}",
		// 			onClick: '{{$onOk}}'
		// 		}]
		// 	}]
	}
}

export function getInitState() {
	return {
		data:{
			setting:{
				isCheckedTag: false,
				tipsShow: false
			},
			loading: false,
			limit:{
				isGenVoucher:'',
				isProductShare:'',
				isCarryOverMainCost:''
			},
			hasRecord: 0,
			columns: [],
			list: [
				{
					id:'1',
					code:'暂估往来科目',
					name:''
				},{
					id:'2',
					code:'直接人工',
					name:''
				},{
					id:'3',
					code:'直接材料',
					name:''
				},{
					id:'4',
					code:'制造费用',
					name:''
				},{
					id:'5',
					code:'其他费用',
					name:''
				}
			],
			tableKey: 1000,
			other: {
				tab1: true,
				unitList: [{id: 1, name: 'as'}],
				activeTabKey:'1',
				columnDto: [
					{
						"orgId": 6535301397822464, 
						"align":'center',
						"userId": 6120841777214464, 
						"id": 40000500001, 
						"columnId": 400005, 
						"fieldName": "id", 
						"caption": "序号", 
						"idFieldType": 1000040001, 
						"width": 50, 
						"idAlignType": 1000050002, 
						"colIndex": 10, 
						"idOrderMode": 1000060001, 
						"isFixed": false, 
						"isVisible": true, 
						"isMustSelect": true, 
						"isSystem": true, 
						"isHeader": true, 
						"isTotalColumn": false, 
						"isOrderMode": false, 
						"occupyConfig": "6CH", 
						"customDecideVisible": true, 
						"ts": "2019-05-06 14:13:32.0", 
						"createTime": "2019-05-06 14:13:41", 
						"updateTime": "2019-05-06 14:13:41" 
					},
					{ 
						"orgId": 6535301397822464, 
						"align":'left' ,
						"userId": 6120841777214464, 
						"id": 40000500002, 
						"columnId": 400005, 
						"fieldName": "code", 
						"caption": "业务选项", 
						"idFieldType": 1000040003, 
						"width": 100, 
						"idAlignType": 1000050002, 
						"colIndex": 30, 
						"idOrderMode": 1000060001, 
						"isFixed": false, 
						"isVisible": true, 
						"isMustSelect": false, 
						"isSystem": true, 
						"isHeader": true, 
						"isTotalColumn": false, 
						"isOrderMode": false, 
						"occupyConfig": "10CH", 
						"customDecideVisible": true, 
						"ts": "2019-05-06 14:13:32.0", 
						"createTime": "2019-05-06 14:13:41", 
						"updateTime": "2019-05-06 14:13:41" 
					},
					{ 
						"orgId": 6535301397822464, 
						"align":'left',
						"userId": 6120841777214464, 
						"id": 40000500003, 
						"columnId": 400005, 
						"fieldName": "name", 
						"caption": "科目匹配", 
						"idFieldType": 1000040001, 
						"width": 300, 
						"idAlignType": 1000050001, 
						"colIndex": 50, 
						"idOrderMode": 1000060001, 
						"isFixed": false, 
						"isVisible": true, 
						"isMustSelect": true, 
						"isSystem": true, 
						"isHeader": false, 
						"isTotalColumn": false, 
						"isOrderMode": false, 
						"occupyConfig": "7CC", 
						"customDecideVisible": true, 
						"ts": "2019-05-06 14:13:32.0", 
						"createTime": "2019-05-06 14:13:41", 
						"updateTime": "2019-05-06 14:13:41" 
					},
				],
			},
			form:{
				flag:'',
				period:'',
				startPeriod: '',
				state:'',
				id:'',
				inveBusiness:'',
				enableDate:'',
				endCostType:1,
				endNumSource:1,
				checkOutType:0,
				bInveControl:true,
				enableBOMFlag: 0,  //是否启用bom 1是 0 否 默认不启用 0
				auxiliaryMaterialAllocationMark: 0, //辅料分摊标志：1是 0 否
				automaticDistributionMark: 1, //自动分配标志1 表示自动分配 0表示人工分配 默认为 1
				isInput:true
			},
		}
	}
}
