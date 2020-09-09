import {columnData} from "../ttk-es-app-customer/fixedData";

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-queryzjnumber',
		children: {
			name: 'spin-box',
			component: 'Spin',
			spinning:  '{{data.loading}}',
            size: 'large',
            tip: '数据加载中...',
			delay: 1,
			wrapperClassName: 'spin-box',
			children:[
				{//表头配置
					name: 'tablesetting',
					component: 'TableSettingCard',
					data: '{{data.other.columnDto}}',
					showTitle: '{{data.showTitle}}',
					positionClass: 'inv-batch-custom-table',
					visible: '{{data.showTableSetting}}',//显示隐藏控制
					confirmClick: '{{function(data){$upDateTableSetting({value: false, data: data})}}}',
					cancelClick: '{{function(){$closeTableSetting()}}}',
					resetClick: '{{function(){$resetTableSetting({data: data})}}}'
				},
				{
					name: 'inv-batch-custom-header',
					component: '::div',
					className: 'inv-batch-custom-header',
					children: [
						{
							name: 'header-right',
							className: 'header-right',
							component: '::div',
							children: [
								{
									name: '{{data.btnType[_rowIndex].name}}',
									className: '{{data.btnType[_rowIndex].className}}',
									component: 'Button',
									type: '{{data.btnType[_rowIndex].type}}',
									children: '{{data.btnType[_rowIndex].children}}',
									_power: "for in data.btnType",
									onClick: '{{function () {$judgeChoseBill(data.btnType[_rowIndex].key)}}}'
								},
							]
						},
					],
				},
				{//table表格
					name: 'queryzjNumber',
					className: 'inv-batch-custom-table',
					component: 'Table',
					key: 'queryzjNumber',
					bordered: true,
					scroll: '{{data.list.length?data.tableOption:undefined}}',
					dataSource: '{{data.list}}',
					columns: '{{$renderColumns()}}',
					pagination: false,
					rowKey: 'id',
					emptyShowScroll:true,
					delay: 0,
					Checkbox: false,
					enableSequenceColumn: false,
				},
				{
					name: 'footer',
					className: 'inv-batch-custom-footer',
					component: '::div',
					children: [
						{
							name: 'pagination',
							component: 'Pagination',
							pageSizeOptions: ['50', '100', '200', '300'],
							pageSize: '{{data.pagination.pageSize}}',
							current: '{{data.pagination.currentPage}}',
							total: '{{data.pagination.totalCount}}',
							onChange: '{{$pageChanged}}',
							onShowSizeChange: '{{$pageChanged}}'
						},{
							name: 'num',
							component: '::span',
							style:{position:'relative',float:'right',top:'5px',marginRight:'10px',fontSize:'14px',color:'rgba(0,0,0,0.65)'},
							children: '{{"共" +data.pagination.totalCount+"条记录"}}'
						}
					]
				}]
		}
	}
}

export function getInitState() {
	return {
		data: {
			btnType:[
				{
					name: 'query',
					className: 'header-btn',
					type: 'primary',
					children: '查询',
					key: 'queryCustomer',
				},
				{
					name: 'export',
					className: 'header-btn',
					type: 'primary',
					children: '导出',
					key: 'exportAssign'
				},
			],

			loading: false,
			list: [
				// {
				// 	id:'124332423',
				// 	name:'肖战',
                 //    createTime:'2020-02-02',
                 //    contactsName:'佳小丽',
                 //    contactsPhone:'15666202938',
                 //    area:'山东省青岛市市南区',
                 //    khsize:99,
                 //    ybsize:33,
                 //    xgmsize:33,
                 //    qtsize:33,
                 //    ygsize:1
                //
				// }
			],
			tableOption: {
                x:'100%',
                y:'100%'
			},
			pagination: {
				currentPage: 1,//-- 当前页
				pageSize: 50,//-- 页大小
				totalCount: 0,
				totalPage: 0
			},
			showTableSetting: false,
			other: {
				columnDto: [],
			},
			columns: [
                {
                    id: 'id',
                    caption: "中介ID",
                    fieldName: 'id',
                    width: '8%',
                },
                {
                    id: 'name',
                    caption: "中介名称",
                    fieldName: 'name',
                    width: '14%',
                },
                {
                    id: 'createTime',
                    caption: "注册时间",
                    fieldName: 'createTime',
                    width: '8%',
                },
                {
                    id: 'contactsName',
                    caption: "联系人姓名",
                    fieldName: 'contactsName',
                    width: '7%',
                },
                {
                    id: 'contactsPhone',
                    caption: "联系人电话",
                    fieldName: 'contactsPhone',
                    width: '8%',
                },
                {
                    id: 'sssf',
                    caption: '省份',
                    fieldName: 'sssf',
                    width: '5%',
                }, {
                    id: 'sscs',
                    caption: '城市',
                    fieldName: 'sscs',
                    width: '5%',
                }, {
                    id: 'ssqx',
                    caption: '区县',
                    fieldName: 'ssqx',
                    width: '5%',
                },
                {
                    id: 'khsize',
                    caption: "客户数量",
                    fieldName: 'khsize',
                    width: '6%',
                },
                {
                    id: 'ybsize',
                    caption: "一般纳税人数量",
                    fieldName: 'ybsize',
                    width: '6%',
                },
                {
                    id: 'xgmsize',
                    caption: "小规模数量",
                    fieldName: 'xgmsize',
                    width: '6%',
                },
                {
                    id: 'qtsize',
                    caption: "其他数量",
                    fieldName: 'qtsize',
                    width: '6%',
                },
                {
                    id: 'ygsize',
                    caption: "员工数量",
                    fieldName: 'ygsize',
                    width: '6%',
                },
			],
			showPopoverCard: false,

		}
	}
}