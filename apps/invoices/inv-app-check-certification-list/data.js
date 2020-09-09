export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'inv-app-check-certification-list',
		children:  [
			{  // tabs
				name: 'root-content',
				component: '::div',
				className: 'inv-app-check-certification-header',
				children: {
					name: 'tabs',
					component: 'Tabs',
				className: 'inv-app-check-certification-tabs',
          			tabPosition: 'top',
					activeKey: '{{data.tabFilter.trans_catagory}}',
					onChange: '{{$tabChange}}',
					children: [
						{
							name: 'checkInvoice',
							component: 'Tabs.TabPane',
							key: 'check',
							tab: '发票勾选',
						}, {
							name: 'checkConfirm',
							component: 'Tabs.TabPane',
							key: 'certification',
							tab: '确认勾选'
						}
					]
				}
			},
			{  // 勾选发票页面
				name: 'inv-app-check',
				className: 'inv-app-checkCertification-container mk-layout',
				component: '::div',
				_visible: '{{data.tabFilter.trans_catagory==="check"}}',
				children: [
					{ // 过滤筛选框
						name: 'inv-app-check-filterApp',
						component: '::div',
						className: 'inv-app-checkCertification-filterApp',
						children:[{
							name: 'filterApp',
							component: 'AppLoader',
							appName: 'inv-app-check-certification-filter',
							data: "{{data.filter}}",
							onChange:"{{$handleFilter}}",
						},{
							name:'tax_period',
							className: 'inv-app-check-filter-tax-period',
							component: '::span',
							children:[{
								name: 'spanToSpan1',
								className: 'inv-app-check-filter-tax-period-label',
								component: '::span',
								children: '税款所属期：'
							},{
								name: 'spanToSpan2',
								className: 'inv-app-check-filter-tax-period-time',
								component: '::span',
								children: '{{data.skssq}}' //税款
							}]
						},{ // 按钮组
							name:'btnBox',
							className: 'inv-app-check-filter-btnBox',
							component: '::div',
							children:[
								{
									name:'inv-app-check-filter-btnBox-help',
									className:'inv-app-check-filter-btnBox-help',
									component:'::div',
									onClick: '{{$openHelp}}',
									children:''
								},
								{
								name: 'button1',
								className: 'inv-app-check-filter-btn',
								component: 'Button',
								type: 'primary',
								onClick: '{{$saveCheck}}',
								children: '保存'
							},{
								name: 'button2',
								className: 'inv-app-check-filter-btn',
								component: 'Button',
								onClick: '{{$onloadInvoice}}',
								children: '下载发票'
							}]
						}]
					},
					{ // 发票勾选列表
						name: 'check-table-list',
						className: "ttk-scm-app-authorized-invoice-list mk-layout",
						component: 'Table',
						key: '{{data.tableKey}}',  
						loading: '{{data.loading}}',
						rowKey: 'kjxh',
						rowSelection: '{{$rowSelection()}}',
						bordered: true,
						delay:200,
						pagination: false,
						scroll: '{{data.tableOption}}',
						dataSource: '{{data.list}}',
						columns: [
							{
								title: '发票号码',
								dataIndex: 'fphm',
								width: 100,
								align: 'center',
							}, {
								title: '开票日期',
								dataIndex: 'kprq',
								width: 100,
								align: 'center',
							}, {
								title: '金额',
								dataIndex: 'hjje',
								align: 'center',
								render: "{{function(text){return $renderTips(text,50,true)}}}"
							}, {
								title: '税额',
								dataIndex: 'hjse',
								align: 'center',
								render: "{{function(text){return $renderTips(text,50,true)}}}"
							}, {
								title: '销方名称',
								dataIndex: 'xfmc',
								align: 'center',							
								render: "{{function(text){return $renderTips(text,50,false)}}}"
							}, {
								title: '发票状态',
								dataIndex: 'fpztMc',
								width: 80,
								align: 'center',
							}, {
								title: '勾选日期',
								dataIndex: 'gxrq',
								width: 190,
								align: 'center',
							}, {
								title: '抵扣月份',
								dataIndex: 'dkyf',
								width: 80,
								align: 'center',
							}, {
								title: '状态',
								dataIndex: 'rzztMc',
								width: 80,
								align: 'center',
								render: "{{function(text, record, index){return $renderStatusTips(text, record, index)}}}"	
							}
						]
					}			
				]
			},
			{  // 勾选确认页面
				name: 'inv-app-certification',
				className: 'inv-app-checkCertification-container',
				component: '::div',
				_visible: '{{data.tabFilter.trans_catagory==="certification"}}',
				children: [
					{
						name: 'inv-app-certification-header',
						className: 'inv-app-certification-filter',
						component: '::div',
						children: [
							{ // 税款所属期
								name:'tax_period',
								className: 'inv-app-certification-filter-tax-period',
								component: '::span',
								children:[{
									name: 'spanToSpan1',
									className: 'inv-app-certification-filter-tax-period-label',
									component: '::span',
									children: '远程开票机：'
								},{
									name: 'spanToSpan2',
									className: '{{$calTipsClass("inv-app-certification-filter-tax-period-time")}}',
									component: '::span',
									children: '{{data.machineStatus==="0"?"未连接, 请启动开票机, 插入税盘":"开票机已连接"}}'
								},{
									name: 'refresh',
									className:'inv-app-certification-refresh-btn',
									component: 'Icon',
									type:  'reload',
									onClick: "{{$detectSkpzt}}"
								}]
							},{ // 按钮组
								name:'btnBox',
								className: 'inv-app-certification-filter-btnBox',
								component: '::div',
								children:[{
									name: 'button',
									className: 'inv-app-certification-filter-btn',
									component: 'Button',
									type: '{{data.machineStatus === "0" ? "" : "primary"}}',
									disabled: '{{data.machineStatus=== "0" ? true : false}}',
									children: '确认',
									onClick: '{{$sureCheck}}'
								}]
							}
						]
					},					
					{ // 确认勾选列表
						name: 'certification-table-list',
						className: "ttk-scm-app-authorized-invoice-list mk-layout",
						component: 'Table',
						key: '{{data.tableKey}}',  
						loading: '{{data.loading}}',
						bordered : true,
						delay:200,
						pagination: false,
						scroll: '{{data.tableOption}}',
						dataSource: '{{data.certificationList}}',
						columns:  [
							{
								title: '发票号码',
								dataIndex: 'fphm',
								width: 120,
								align: 'center',
							}, {
								title: '开票日期',
								dataIndex: 'kprq',
								width: 120,
								align: 'center',
							}, {
								title: '金额',
								dataIndex: 'hjje',
								align: 'center',
							}, {
								title: '税额',
								dataIndex: 'hjse',
								align: 'center',
							}, {
								title: '销方名称',
								dataIndex: 'xfmc',
								align: 'center',
								render: "{{function(text){return $renderTips(text,60,false)}}}"
							},{
								title: '勾选日期',
								dataIndex: 'gxrq',
								align: 'center'
							},{
								title: '状态',
								dataIndex: 'rzztMc',
								width: 100,
								align: 'center',
								render: "{{function(text, record, index){return $renderStatusTips(text, record, index)}}}"	
							}
						],			
					}
				]
			},
			{  // 页面footer
				name: 'footer',
				className: 'ttk-scm-app-authorized-invoice-list-footer',
				component: '::div',
				placement: 'bottom',
				children: [
					{ // 统计
						name:'Popover',
						className: 'popover-div',
						component: 'Popover',
						content:'{{$renderFooter()}}',
						trigger: 'hover',
						children:{
							name: 'footer-statics',
							className: 'inv-app-checkCertification-footer-statics',
							component: '::div',
							children: '{{$renderFooter()}}',
						}
						
					},{
						// 分页
						name: 'check-pagination',
						component: 'Pagination',
						pageSizeOptions: '{{data.pagination.pageSizeOptions}}',
						defaultPageSize: '{{data.pagination.pageSizeOptions?data.pagination.pageSizeOptions[0]:0}}',
						total: '{{data.pagination.totalCount}}', //
						onChange: '{{$pageChanged}}',
						showTotal: '{{$pageShowTotal}}',
						onShowSizeChange: '{{$pageChanged}}'
					}
				]
			}	
		]
	}
}

export function getInitState() {
	return {
		data: {
			machineStatus: '1',  // skpzt
			machineStatusTips: ' 未连接, 请启动开票机, 插入税盘',
			tableKey: 6000,
			list: [],
			certificationList: [],
			gfsbh: '', // 购方识别号
			filter:{
				form:{},
				fpzlcsVoList: [{   //发票类型
						"nsrxz": "YBNSRZZS", 
						"fplx": "jxfp", 
						"fpzlDm": "01", 
						"fpzlMc": "增值税专用发票" 
					},{
						"nsrxz": "YBNSRZZS",
						"fplx": "jxfp",
						"fpzlDm": "03",
						"fpzlMc": "机动车销售发票"
					},{
						"nsrxz": "YBNSRZZS",
						"fplx": "jxfp",
						"fpzlDm": "10",
						"fpzlMc": "税局代开增税发"
					},{
						"nsrxz": "YBNSRZZS",
						"fplx": "jxfp",
						"fpzlDm": "17",
						"fpzlMc": "通行费发票"
					}
				],
				rzztList:[   // 认证状态
					{rzztMc: '未认证', rzzt: '0'},
					{rzztMc: '已认证', rzzt : '1'},
					{rzztMc: '认证中', rzzt : '2'},
					{rzztMc: '认证失败', rzzt : '3'}
				],
				gxbzList: [  //勾选状态
					{gxbzMc:'已勾选', gxbz:'Y'},
					{gxbzMc:'未勾选', gxbz:'N'}
				]
			},
			tabFilter: {  // tab切换
				trans_catagory: 'check' //check 或者 certification
			},
			statics: {  // 列表底部发票张数统计
				fpzs: '',
				ljje: '',
				ljse: ''
			},
			sureList: { // 发票勾选确认数额
				gxfs: 0,   // 勾选份数
				gxHjje: 0, // 勾选合计金额
				gxHjse: 0  // 勾选合计税额
			},
			saveParams:[],  // 保存的参数
			selectedRowKeysArr: [1],  // 勾选中的列表的key
			pagination: { 
				pageSizeOptions: ['20', '50', '60', '200'],
				currentPage: 0,
				totalCount: 0,
				pageSize: 0,
				totalPage: 0
			},
			tableOption:{
				y: 400
			},
			loadInvoiceMonth: '',  // 发票下载月份
			loading: true,
			skssq: '', //税款所属期
			initData:{
				qyid:'',
				account_id:'',
				nsrsbh:'',
				year_period:''
			}
		}
	}
}
