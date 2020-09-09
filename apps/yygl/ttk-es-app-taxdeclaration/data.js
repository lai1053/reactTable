
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-taxdeclaration',
		children: [{
			name: 'spin-box',
			component: 'Spin',
			spinning: '{{data.loading}}',
			delay: 1,
			wrapperClassName: 'spin-box',
			size: 'large',
			tip: '数据加载中...',
			children:[
				{
					name: 'top',
					component: '::div',
					className: 'ttk-es-app-taxdeclaration-top',
					children:[{
						name: 'topleft',
						component: '::div',
						className: 'topleft',
						children:[{
							name: 'tree',
							component: '::span',
							style: {
								verticalAlign: 'middle',
								marginRight: '8px'
							},
							className: 'tree',
							children: '{{$renderTree()}}'
						},/*{
							name: 'input',
							component: 'Input.Search',
							placeholder:"请输入客户名称或助记码",
							prefix:{
								name: 'icon',
								component: 'Icon',
								type: 'XDZsousuo',
								fontFamily:'edficon',
								className: 'XDZsousuo'
							},
							enterButton: {
								name: 'icon',
								component: 'Icon',
								fontFamily:'edficon',
								type: 'XDZshaixuan',
							}
						}*/{
							name: 'inputs',
							component: '::div',
							className: 'topleftInput',
							children: '{{$renderInput()}}'
						}]
					},{
						name: 'topright',
						component: '::div',
						className: 'topright',
						children:[{
							name: 'popover',
							component: 'Popover',
							content: '{{$renderPopover()}}',
							placement: 'left',
							overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
							children: {
								name: 'icon',
								component: 'Icon',
								fontFamily: 'edficon',
								type: 'XDZtishi',
								className: 'helpIcon'
							}
						},
						{
							name:'showIcon',
							component:'Popover',
							content:'图标展示',
							placement:'bottom',
							children: {
								name: 'iconbtn',
								className:'{{data.isText ? "changeIconH" : "changeIconL"}}',
								component: 'Button',
								style:{
									borderRadius:'2px 0px 0px 2px',
									height: '30px',
									width: '30px'
								},
								onClick: '{{$changeIcon}}'
							}
						},{
							name:'showText',
							component:'Popover',
							content:'文字展示',
							placement:'bottom',
							children: {
								name: 'textbtn',
								className:'{{data.isText ? "changeTextL" : "changeTextH"}}',
								component: 'Button',
								style:{
									marginRight:'5px',
									borderRadius:'0px 2px 2px 0px',
									height: '30px',
									width: '30px'
								},
								onClick: '{{$changeText}}'
							}
						},
						{
							name: 'btn',
							style:{marginRight:'5px',top:'-9px'},
							component: 'Button',
							type: 'primary',
							children: '更新状态',
							onClick: '{{$handleRefreshState}}'
						},{
							name: 'add',
							component: 'Button',
							style:{top:'-9px'},
							children: '导出',
							type: 'primary',
							key:'export',
							className: 'btn',
							onClick: '{{$addClick}}'
						}
						]
					}]
				},
					{
						name: 'tablesetting',
						component: 'TableSettingCard',
						data: '{{data.other.columnDto}}',
						showTitle: false,
						positionClass: 'ttk-es-app-taxdeclaration-Body',
						visible: '{{data.showTableSetting}}',
						confirmClick: '{{function(data){$saveTableSetting({value: false, data: data})}}}',
						cancelClick: '{{function(){$closeTableSetting()}}}',
						resetClick: '{{function(){$resetTableSetting({data: data})}}}'
					},
					{
					name: 'tablediv',
					component: '::div',
					className: 'ttk-es-app-taxdeclaration-tablediv',
					children:[
						'{{$renderTable()}}',
					{
						name: 'footer',
						className: 'ttk-es-app-taxdeclaration-footer',
						component: '::div',
						children: [
							{
							name: 'left',
							component: '::div',
							className: 'left',
							children:[{
								name: 's1',
								component: '::span',
								children: '{{"汇总状态"}}'
							},{
								name: 's2',
								component: '::span',
								// children: '{{"已完税：" + data.huizong.yiwanshui}}'
								children:['已完成：',{
									name: 's22',
									component: '::span',
									children: '{{data.huizong.yiwanshui}}'
								}]
							},
							// 	{
							// 	name: 's3',
							// 	component: '::span',
							// 	// children: '{{"已申报：" + data.huizong.yishenbao}}'
							// 	children:['已申报：',{
							// 		name: 's33',
							// 		component: '::span',
							// 		children: '{{data.huizong.yishenbao}}'
							// 	}]
							// },
								{
								name: 's4',
								component: '::span',
								// children: '{{"未申报：" + data.huizong.weishenbao}}'
								children:['未完成：',{
									name: 's44',
									component: '::span',
									children: '{{data.huizong.weishenbao}}'
								}]
							},{
								name: 's5',
								component: '::span',
								// children: '{{"无任务：" + data.huizong.wurenwu}}'
								children:['无任务：',{
									name: 's55',
									component: '::span',
									children: '{{data.huizong.wurenwu}}'
								}]
							}]
						},
							{
							name: 'right',
							component: '::div',
							className: 'right',
							children:[{
								name: 'num',
								component: '::span',
								children: '{{"共" +data.pagination.totalCount+"条记录"}}'
							},{
								name: 'pagination',
								component: 'Pagination',
								pageSizeOptions: [ '50', '100', '200','300'],
								pageSize: '{{data.pagination.pageSize}}',
								current: '{{data.pagination.currentPage}}',
								total: '{{data.pagination.totalCount}}',
								onChange: '{{$pageChanged}}',
								onShowSizeChange: '{{$pageChanged}}'
							}]
						}]
					}]
				}
			]
			}
		]
	};
}

export function getInitState() {
	return {
		data: {
			loading: false,
			list:[],
			inputValue: '',//搜索框
			vatTaxpayer:'0',//纳税人性质
			shuifei:'',//税费种
			shenbaoState:'',//申报状态
			roleId:'',//岗位id
			userIds:[],//人员id
			gwoption:[],//岗位存放
			year:'',//申报年份
			month:'',//申报月份
			users:[],//存放选中的人员信息
			num:'',
			filterForm: {//隐藏的筛选条件
				customerTypeStatus: '',
				nsrMessStatus: '',
				sfdm:'',
				csdm:'',
				qxdm:''

			},
			filterFormOld: {
				customerTypeStatus: '',
				nsrMessStatus: '',
				sfdm:'',
				csdm:'',
				qxdm:''
			},
			formContent: {
				customerTypeStatus: '',
				nsrMessStatus: '',
				sfdm:'',
				csdm:'',
				qxdm:''
			},
			maxde:'',
			showbm:'分配给我的客户',
			ifgs:'',
			checkedKeys: {
				checked: [],//全选
				halfChecked: []//半选
			},
			showTableSetting: false,
			pagination: {
				currentPage: 1,//-- 当前页
				pageSize: 50,//-- 页大小
				totalCount: 0,
				totalPage: 0
			},
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
            tableOption:{
				x:'100%',
				y:'100%'
			},
			huizong:{
				yiwanshui: 0,
				yishenbao: 0,
				weishenbao: 0,
				wurenwu: 0
			},
			other: {
				columnDto: [],
				permission: {},
				columns: [
                    {id:1, fieldName: 'name', fieldTitle: '客户名称', caption: '客户名称', isVisible:true, isMustSelect:true, width:134},
                    {id:2, fieldName: 'helpCode', fieldTitle: '助记码', caption: '助记码', isVisible:true, width: 60},
                    {id:3, fieldName: 'zzs', fieldTitle: '增值税', caption: '增值税', isVisible:true, width: 55},
                    {id:4, fieldName: 'fjsf', fieldTitle: '附加税(费)', caption: '附加税(费)', isVisible:true, width: 70},
                    {id:5, fieldName: 'yhs', fieldTitle: '印花税', caption: '印花税', isVisible:true, width: 60},
                    // {id:6, fieldName: 'whsyjsf', fieldTitle: '文化事业建设费', caption: '文化事业建设费', isVisible:true, width: 130},
                    {id:6, fieldName: 'whjsfyl', fieldTitle: '(娱乐)文化建设费', caption: '(娱乐)文化建设费', isVisible:true, width: 110},
                    {id:7, fieldName: 'whjsfgg', fieldTitle: '(广告)文化建设费', caption: '(广告)文化建设费', isVisible:true, width: 110},
                    // {id:7, fieldName: 'grsds', fieldTitle: '个人所得税', caption: '个人所得税', isVisible:true, width: 110},
                    {id:8, fieldName: 'gsdkdj', fieldTitle: '个税(代扣代缴)', caption: '个税(代扣代缴)', isVisible:true, width: 110},
                    {id:9, fieldName: 'qysds', fieldTitle: '企业所得税', caption: '企业所得税', isVisible:true, width: 80},
                    {id:10, fieldName: 'cwbb', fieldTitle: '财务报表', caption: '财务报表', isVisible:true, width: 70},
                    {id:11, fieldName: 'gsscjy', fieldTitle: '个税(生产经营)', caption: '个税（生产经营）', isVisible:true, width: 100},
                    {id:12, fieldName: 'cbj', fieldTitle: '残保金', caption: '残保金', isVisible:true, width: 55},
                    {id:13, fieldName: 'sljj', fieldTitle: '水利基金', caption: '水利基金', isVisible:true, width: 65},
                    {id:14, fieldName: 'ghjf', fieldTitle: '工会经费', caption: '工会经费', isVisible:true, width: 65},
                    {id:15, fieldName: 'hzzt', fieldTitle: '汇总状态', caption: '汇总状态', isVisible:true, width: 65},
                    {id:16, fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 90},
                ],
				tableColumns:[
                    {id:1, fieldName: 'name', fieldTitle: '客户名称', caption: '客户名称', isVisible:true, isMustSelect:true, width:134},
                    {id:2, fieldName: 'helpCode', fieldTitle: '助记码', caption: '助记码', isVisible:true, width: 60},
                    {id:3, fieldName: 'zzs', fieldTitle: '增值税', caption: '增值税', isVisible:true, width: 55},
                    {id:4, fieldName: 'fjsf', fieldTitle: '附加税(费)', caption: '附加税(费)', isVisible:true, width: 70},
                    {id:5, fieldName: 'yhs', fieldTitle: '印花税', caption: '印花税', isVisible:true, width: 60},
                    {id:6, fieldName: 'whsyjsf', fieldTitle: '文化事业建设费', caption: '文化事业建设费', isVisible:true, width: 130},
                    // {id:6, fieldName: 'whjsfyl', fieldTitle: '(娱乐)文化建设费', caption: '(娱乐)文化建设费', isVisible:true, width: 110},
                    // {id:7, fieldName: 'whjsfgg', fieldTitle: '(广告)文化建设费', caption: '(广告)文化建设费', isVisible:true, width: 110},
                    {id:7, fieldName: 'grsds', fieldTitle: '个人所得税', caption: '个人所得税', isVisible:true, width: 110},
                    // {id:8, fieldName: 'gsdkdj', fieldTitle: '个税(代扣代缴)', caption: '个税(代扣代缴)', isVisible:true, width: 110},
                    {id:9, fieldName: 'qysds', fieldTitle: '企业所得税', caption: '企业所得税', isVisible:true, width: 80},
                    {id:10, fieldName: 'cwbb', fieldTitle: '财务报表', caption: '财务报表', isVisible:true, width: 70},
                    // {id:11, fieldName: 'gsscjy', fieldTitle: '个税(生产经营)', caption: '个税（生产经营）', isVisible:true, width: 100},
                    // {id:12, fieldName: 'cbj', fieldTitle: '残保金', caption: '残保金', isVisible:true, width: 55},
                    // {id:13, fieldName: 'sljj', fieldTitle: '水利基金', caption: '水利基金', isVisible:true, width: 65},
                    // {id:14, fieldName: 'ghjf', fieldTitle: '工会经费', caption: '工会经费', isVisible:true, width: 65},
                    {id:15, fieldName: 'hzzt', fieldTitle: '汇总状态', caption: '汇总状态', isVisible:true, width: 65},
                    {id:16, fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 90},
                ]
			},
			areaType:[],
			orgArr:[],
			updateState:[],
			treeType:'self',
			isText:false,
			isTypesAll:false,
			isSaveTableCol:false,
			scrollRemember:false,
			scrollTop:0
		}
	};
}
