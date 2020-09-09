
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-jzjdlist',
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
				className: 'ttk-es-app-jzjdlist-top',
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
						overlayClassName: 'ttk-es-app-jzjdlist-top-helpPopover',
						children: {
							name: 'icon',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'XDZtishi',
							className: 'helpIcon'
						}
					},{
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
					},{
						name: 'add',
						component: 'Button',
						children: '导出',
						style:{
							top:'-9px',
						},
						type: 'primary',
						key:'export',
						className: 'btn',
						onClick: '{{$addClick}}'
					}]
				}]
			},{
				name: 'tablesetting',
				component: 'TableSettingCard',
				data: '{{data.other.columnDto}}',
				showTitle: false,
				positionClass: 'ttk-es-app-jzjdlist-Body',
				visible: '{{data.showTableSetting}}',
				confirmClick: '{{function(data){$saveTableSetting({value: false, data: data})}}}',
				cancelClick: '{{function(){$closeTableSetting()}}}',
				resetClick: '{{function(){$resetTableSetting({data: data})}}}'
			},{
				name: 'tablediv',
				component: '::div',
				className: 'ttk-es-app-jzjdlist-tablediv',
				children:[{
					className: 'ttk-es-app-jzjdlist-Body',
					name: 'table',
					component: 'Table',
					lazyTable: true,
					emptyShowScroll: true,
					// key: '{{data.tableKey}}',
					// checkboxKey: 'id',
					// loading: '{{data.loading}}',
					// checkboxChange: '{{$checkboxChange}}',
					// checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
					pagination: false,
					scroll: {y:true},
					enableSequenceColumn: false,
					// Checkbox: true,
					bordered: true,
					dataSource: '{{data.list}}',
					columns: '{{$renderColumns()}}',
				},{
					name: 'footer',
					className: 'ttk-es-app-jzjdlist-footer',
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
							pageSizeOptions: [ '50', '100', '200','300'],
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
            finishmark:0,
			showTableSetting: false,
			pagination: {
                currentPage: 1,//-- 当前页
                pageSize: 50,//-- 页大小
                totalCount: 0,
                totalPage: 0
			},
            jzztValue:999,
            jizztValue:999,
            ndValue:'2020',
            yfValue:'999',
            customers:0,
			inputval:'',
            maxde:'',
            gwoption:[],
            gwVal:'',
			persioniL:[],
            num:'',
            users:[],
            checkedKeys: {
                checked: [],//全选
                halfChecked: []//半选
            },
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			other: {
				columnDto: [],
				permission: {
                    treeData: [],//权限列表
                    all: null,
                    self: '分配我的客户'
				},
                columns:[
                    {id:1, fieldName: 'name', fieldTitle: '客户名称', caption: '客户名称', isVisible:true, isMustSelect:true, width: 190},
                    {id:2, fieldName: 'zjm', fieldTitle: '助记码', caption: '助记码', isVisible:true, width: 100},
                    {id:3, fieldName: 'state01', fieldTitle: '1', caption: '1', isVisible:true, width: 75},
                    {id:4, fieldName: 'state02', fieldTitle: '2', caption: '2', isVisible:true, width: 75},
                    {id:5, fieldName: 'state03', fieldTitle: '3', caption: '3', isVisible:true, width: 75},
                    {id:6, fieldName: 'state04', fieldTitle: '4', caption: '4', isVisible:true, width: 75},
                    {id:7, fieldName: 'state05', fieldTitle: '5', caption: '5', isVisible:true, width: 75},
                    {id:8, fieldName: 'state06', fieldTitle: '6', caption: '6', isVisible:true, width: 75},
                    {id:9, fieldName: 'state07', fieldTitle: '7', caption: '7', isVisible:true, width: 75},
                    {id:10, fieldName: 'state08', fieldTitle: '8', caption: '8', isVisible:true, width: 75},
                    {id:11, fieldName: 'state09', fieldTitle: '9', caption: '9', isVisible:true, width: 75},
                    {id:12, fieldName: 'state10', fieldTitle: '10', caption: '10', isVisible:true, width: 75},
                    {id:13, fieldName: 'state11', fieldTitle: '11', caption: '11', isVisible:true, width: 75},
                    {id:14, fieldName: 'state12', fieldTitle: '12', caption: '12', isVisible:true, width: 75},
                    {id:15, fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 100},
                ],
                tableColumns:[
                    {id:1, fieldName: 'name', fieldTitle: '客户名称', caption: '客户名称', isVisible:true, isMustSelect:true, width: 190},
                    {id:2, fieldName: 'zjm', fieldTitle: '助记码', caption: '助记码', isVisible:true, width: 100},
                    {id:3, fieldName: 'state01', fieldTitle: '1', caption: '1', isVisible:true, width: 75},
                    {id:4, fieldName: 'state02', fieldTitle: '2', caption: '2', isVisible:true, width: 75},
                    {id:5, fieldName: 'state03', fieldTitle: '3', caption: '3', isVisible:true, width: 75},
                    {id:6, fieldName: 'state04', fieldTitle: '4', caption: '4', isVisible:true, width: 75},
                    {id:7, fieldName: 'state05', fieldTitle: '5', caption: '5', isVisible:true, width: 75},
                    {id:8, fieldName: 'state06', fieldTitle: '6', caption: '6', isVisible:true, width: 75},
                    {id:9, fieldName: 'state07', fieldTitle: '7', caption: '7', isVisible:true, width: 75},
                    {id:10, fieldName: 'state08', fieldTitle: '8', caption: '8', isVisible:true, width: 75},
                    {id:11, fieldName: 'state09', fieldTitle: '9', caption: '9', isVisible:true, width: 75},
                    {id:12, fieldName: 'state10', fieldTitle: '10', caption: '10', isVisible:true, width: 75},
                    {id:13, fieldName: 'state11', fieldTitle: '11', caption: '11', isVisible:true, width: 75},
                    {id:14, fieldName: 'state12', fieldTitle: '12', caption: '12', isVisible:true, width: 75},
                    {id:15, fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 100},
                ]
			},
			treeType:'self',
			isText:false,
			isTypesAll:false,
		}

	};
}
