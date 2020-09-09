export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'inv-app-deduct-list',
		children:  [
			{  // 勾选发票页面
				name: 'inv-app-check',
				className: 'inv-app-deduct-container mk-layout',
				component: '::div',
				children: [
					{ // 过滤筛选框
						name: 'inv-app-check-filterApp',
						component: '::div',
						className: 'inv-app-deduct-filterApp',
						children:[{
							name: 'filterApp',
							component: 'AppLoader',
							appName: 'inv-app-deduct-filter',
							data: "{{data.filter}}",
							onChange:"{{$handerFilter}}",
						}]
					},
					{ // 发票勾选列表
						name: 'check-table-list',
						className: "ttk-scm-app-authorized-invoice-list mk-layout",
						component: 'Table',
						key: '{{data.tableKey}}',  
						loading: '{{data.loading}}',
						delay: 200,
						pagination: false,
						scroll: '{{data.tableOption}}',
						dataSource: '{{data.list}}',
						bordered: true,
						columns: [{
							title: '发票种类',
							dataIndex: 'fpzlMc',
							width: 130,
							align: 'center'
						}, {
							title: '开票日期',
							dataIndex: 'formatedKprq',
							align: 'center',
							render: "{{function(text){return $renderTips(text,80,false)}}}"
						}, {
							title: '发票号码',
							dataIndex: 'fphm',
							width: 120,
							align: 'center',
						}, {
							title: '金额',
							dataIndex: 'hjje',
							align: 'center',
							render: "{{function(text){return $renderTips(text,80,true)}}}"
						}, {
							title: '税额',
							dataIndex: 'hjse',
							align: 'center',
							render: "{{function(text){return $renderTips(text,80,true)}}}"
						}, {
							title: '销方名称',
							dataIndex: 'xfmc',
							align: 'center',
							render: "{{function(text){return $renderTips(text,80,false)}}}"
						}],

					},
					{  // 分页
						name: 'footer',
						className: 'ttk-scm-app-authorized-invoice-list-footer check-deduct-footer',
						component: '::div',
						placement: 'bottom',
						children: [
							{
								name: 'footer-statics',
								className: 'inv-app-deduct-footer-statics',
								component: '::div',
								children: [
									{
										name: 'check-statics-label',
										className: 'inv-app-deduct-footer-statics-label',
										component: '::span',
										children: '合计 '
									},{
										name: 'check-statics-total-invoices',
										className: 'inv-app-deduct-footer-statics-total-invoices',
										component: '::span',
										children: '{{ "共 " + data.statics.totalCount + " 张发票"}}'
									},{
										name: 'check-statics-total-cash',
										className: 'inv-app-deduct-footer-statics-total-cash',
										component: '::span',
										children: '{{ "金额：" + data.statics.totalHjje + " (元)"}}'
									},{
										name: 'check-statics-total-tax',
										className: 'inv-app-deduct-footer-statics-total-tax',
										component: '::span',
										children: '{{ "税额：" + data.statics.totalHjse + " (元)"}}'
									}
								]
							},{
								name: 'deduct-pagination',
								component: 'Pagination',
								pageSizeOptions: '{{data.pagination.pageSizeOptions}}',
								defaultPageSize: '{{data.pagination.pageSizeOptions?data.pagination.pageSizeOptions[0]:0}}',
								total: '{{data.pagination.totalCount}}',
								onChange: '{{$pageChanged}}',
								showTotal: '{{$pageShowTotal}}',
								onShowSizeChange: '{{$pageChanged}}'
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
			tableKey: 10000,
			list: [],
			certificList:[],
			filter:{
				form:{},
				fpzlcsVoList:[],
				xfmc: '',  // 销方名称
				dkyf: ''   // 抵扣月份
			},
			// 合计数
			statics: {
				totalCount: '',
				totalHjje: '',
				totalHjse: ''
			},
			// 分页
			pagination: {
				pageSizeOptions: ['20', '50', '100', '200'],
				currentPage: 1,
				totalCount: 0,
				pageSize: 0
			},
			tableOption:{
				// y: 400
			},
			loading: true,
			initData:{
				qyid:'',
				account_id:'',
				nsrsbh:'',
				year_period:''
			}
		}
	}
}
