export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-sbselist',
		children: {
			name: 'spin-box',
            component: 'Spin',
            spinning:  '{{data.loading}}',
            size: 'large',
            tip: '数据加载中...',
            delay: 1,
			wrapperClassName: 'spin-box',
			children:[{
				name: 'top',
				component: '::div',
				className: 'ttk-es-app-sbselist-top',
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
					},{
						name: 'inputs',
						component: '::div',
						className: 'topleftInput',
						children: '{{$renderInput()}}'
					}]
				},{
					name: 'topright',
					component: '::div',
					className: 'topright',
					 children:[//{
					// 	name: 'popover',
					// 	component: 'Popover',
					// 	content: '{{$renderPopover()}}',
					// 	placement: 'left',
					// 	overlayClassName: 'ttk-es-app-sbselist-top-helpPopover',
					// 	children: {
					// 		name: 'icon',
					// 		component: 'Icon',
					// 		fontFamily: 'edficon',
					// 		type: 'XDZtishi',
					// 		className: 'helpIcon'
					// 	}
					// }
					{
						name: 'btnGroup',
						component: 'Layout',
						className: 'ttk-es-app-sbselist-header-right',
						children: [{
							name: 'add',
							component: 'Button',
							children: '导出',
							type: 'primary',
							key:'export',
							// _visible:false,
							className: 'btn',
							onClick: '{{$addClick}}'
						}]
					}
				   ]
				}]
			},{
				name: 'tablesetting',
				component: 'TableSettingCard',
				data: '{{data.other.columnDto}}',
				showTitle: false,
				positionClass: 'ttk-es-app-sbselist-Body',
				visible: '{{data.showTableSetting}}',
				confirmClick: '{{function(data){$saveTableSetting({value: false, data: data})}}}',
				cancelClick: '{{function(){$closeTableSetting()}}}',
				resetClick: '{{function(){$resetTableSetting({data: data})}}}'
			},{
				name: 'tablediv',
				component: '::div',
				className: 'ttk-es-app-sbselist-tablediv',
				children:['{{$renderVTable()}}',
				{
					name: 'footer',
					className: 'ttk-es-app-sbselist-footer',
					component: '::div',
					children: [
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
							pageSizeOptions: ['50', '100', '200','300'],
							pageSize: '{{data.pagination.pageSize}}',
							current: '{{data.pagination.currentPage}}',
							total: '{{data.pagination.totalCount}}',
							onChange: '{{$pageChanged}}',
							onShowSizeChange: '{{$pageChanged}}'
						}]
					}]
				}]
			}]
		}
	};
}

export function getInitState() {
	return {
		data: {
			loading: false,
			list:[

			],
			showTableSetting: false,
			pagination: {
				currentPage: 1,
				totalCount: 0,
				pageSize: 50
			},
            checkedKeys: {
                checked: [],//全选
                halfChecked: []//半选
            },
            maxde:'',
            gwVal:'',
			iptval:'',
            num:'',
            users:[],
            persioniL:[],
            persioniLs:[],
            year:'',//申报年份
            vatTaxpayer:999,//客户分类
            month:'',//申报月份
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			other: {
				columnDto: [],
				permission: {},
                columns:[
                    {id:1, fieldName: 'name', fieldTitle: '客户名称', caption: '客户名称', isVisible:true, isMustSelect:true, width: 200},
                    {id:2, fieldName: 'zjm', fieldTitle: '助记码', caption: '助记码', isVisible:true, width: 60},
                    {id:3, fieldName: 'zzs', fieldTitle: '增值税', caption: '增值税', isVisible:true, width: 55},
                    {id:4, fieldName: 'fjs', fieldTitle: '附加税(费)', caption: '附加税（费）', isVisible:true, width: 70},
                    {id:5, fieldName: 'yhs', fieldTitle: '印花税', caption: '印花税', isVisible:true, width: 60},
                    // {id:6, fieldName: 'whsyjsf', fieldTitle: '文化事业建设费', caption: '文化事业建设费', isVisible:true, width: 120},
                    {id:6, fieldName: 'whjsfyl', fieldTitle: '(娱乐)文化建设费', caption: '（娱乐）文化建设费', isVisible:true, width: 110},
                    {id:7, fieldName: 'whjsfgg', fieldTitle: '(广告)文化建设费', caption: '（广告）文化建设费', isVisible:true, width: 110},
                    {id:8, fieldName: 'gsdkdj', fieldTitle: '个税(代扣代缴)', caption: '个税（代扣代缴）', isVisible:true, width: 110},
                    {id:9, fieldName: 'qysds', fieldTitle: '企业所得税', caption: '企业所得税', isVisible:true, width: 80},
                    {id:10, fieldName: 'gsscjy', fieldTitle: '个税(生产经营)', caption: '个税（生产经营）', isVisible:true, width: 110},
                    {id:11, fieldName: 'cbj', fieldTitle: '残保金', caption: '残保金', isVisible:true, width: 55},
                    {id:12, fieldName: 'sljj', fieldTitle: '水利基金', caption: '水利基金', isVisible:true, width: 65},
                    {id:13, fieldName: 'ghjf', fieldTitle: '工会经费', caption: '工会经费', isVisible:true, width: 65},
                    {id:14, fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 90},
                ],
                tableColumns:[
                    {id:1, fieldName: 'name', fieldTitle: '客户名称', caption: '客户名称', isVisible:true, isMustSelect:true, width: 200},
                    {id:2, fieldName: 'zjm', fieldTitle: '助记码', caption: '助记码', isVisible:true, width: 60},
                    {id:3, fieldName: 'zzs', fieldTitle: '增值税', caption: '增值税', isVisible:true, width: 55},
                    {id:4, fieldName: 'fjs', fieldTitle: '附加税(费)', caption: '附加税（费）', isVisible:true, width: 70},
                    {id:5, fieldName: 'yhs', fieldTitle: '印花税', caption: '印花税', isVisible:true, width: 60},
                    {id:6, fieldName: 'whsyjsf', fieldTitle: '文化事业建设费', caption: '文化事业建设费', isVisible:true, width: 120},
                    // {id:6, fieldName: 'whjsfyl', fieldTitle: '(娱乐)文化建设费', caption: '（娱乐）文化建设费', isVisible:true, width: 110},
                    // {id:7, fieldName: 'whjsfgg', fieldTitle: '(广告)文化建设费', caption: '（广告）文化建设费', isVisible:true, width: 110},
                    {id:8, fieldName: 'grsds', fieldTitle: '个人所得税', caption: '个人所得税', isVisible:true, width: 110},
                    // {id:8, fieldName: 'gsdkdj', fieldTitle: '个税(代扣代缴)', caption: '个税（代扣代缴）', isVisible:true, width: 110},
                    {id:9, fieldName: 'qysds', fieldTitle: '企业所得税', caption: '企业所得税', isVisible:true, width: 80},
                    // {id:10, fieldName: 'gsscjy', fieldTitle: '个税(生产经营)', caption: '个税（生产经营）', isVisible:true, width: 110},
                    // {id:11, fieldName: 'cbj', fieldTitle: '残保金', caption: '残保金', isVisible:true, width: 55},
                    // {id:12, fieldName: 'sljj', fieldTitle: '水利基金', caption: '水利基金', isVisible:true, width: 65},
                    // {id:13, fieldName: 'ghjf', fieldTitle: '工会经费', caption: '工会经费', isVisible:true, width: 65},
                    {id:14, fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 90},
                ]
			},
			treeType:'self',
			isTypesAll:false,
			obj:{},
			scrollTop: 0,
			scrollRemember:false,
		}

	};
}
