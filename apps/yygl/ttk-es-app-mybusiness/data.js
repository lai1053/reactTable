export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-mybusiness',
		children: [{
			name: 'top',
			component: '::div',
			className: 'ttk-es-app-mybusiness-top',
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
					name: 'right',
					component: '::div',
					// content: '{{$renderPopover()}}',
					placement: 'left',
					overlayClassName: 'ttk-es-app-mybusiness-top-helpPopover',
					children: [{
                        name: 'del',
                        component: '::span',
                        // fontFamily: 'edficon',
                        // type: 'XDZtishi',
                        // _visible:false,
						onClick:'{{$xzBtn}}',
                        className: 'ttk-es-app-mybusiness-top-helpPopover-btn ttk-es-app-mybusiness-top-helpPopover-xzbtn',
                        children:'新增'
                    },{
                        name: 'del',
                        component: '::span',
                        // fontFamily: 'edficon',
                        // type: 'XDZtishi',
                        // _visible:false,
                        className: 'ttk-es-app-mybusiness-top-helpPopover-btn ttk-es-app-mybusiness-top-helpPopover-ghbtn',
                        children:'转到公海'
                    },{
						name: 'del',
						component: '::span',
						// fontFamily: 'edficon',
						// type: 'XDZtishi',
						// _visible:false,
						className: 'ttk-es-app-mybusiness-top-helpPopover-btn',
						children:'删除'
					}]
				}]
			}]
		},{
			name: 'tablesetting',
			component: 'TableSettingCard',
			data: '{{data.other.columnDto}}',
			showTitle: true,
			positionClass: 'ttk-es-app-mybusiness-Body',
			visible: '{{data.showTableSetting}}',
			confirmClick: '{{function(data){$showTableSetting({value: false, data: data})}}}',
			cancelClick: '{{function(){$closeTableSetting()}}}',
			resetClick: '{{function(){$resetTableSetting({data: data})}}}'
		},{
			name: 'tablediv',
			component: '::div',
			className: 'ttk-es-app-mybusiness-tablediv',
			children:[{
				className: 'ttk-es-app-mybusiness-Body',
				name: 'table',
				component: 'Table',
				lazyTable: true,
				emptyShowScroll: true,
				// key: '{{data.tableKey}}',
				// checkboxKey: 'id',
				loading: '{{data.loading}}',
				// checkboxChange: '{{$checkboxChange}}',
				// checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
				pagination: false,
				// scroll: '{{data.tableOption}}',
				enableSequenceColumn: false,
				// Checkbox: true,
				bordered: true,
				dataSource: '{{data.list}}',
				columns: '{{$renderColumns()}}',
			},{
				name: 'footer',
				className: 'ttk-es-app-mybusiness-footer',
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
            ndValue:2019,
            yfValue:8,
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
			}
		}

	};
}
