export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-unauthorized-list',
		children: [{
			name: 'headDiv',
			component: '::div',
			className: 'ttk-scm-app-unauthorized-list-headDiv',
			children:[{
				name: 'leftHeadDiv',
				component: '::div',
				className: 'ttk-scm-app-unauthorized-list-headDiv-leftHeadDiv',
				children:[{
					name: 'searchIput',
					component: 'Input.Search',
					placeholder: '请输入发票号码',
					maxLength: '8',
					className: 'ttk-scm-app-unauthorized-list-accountQuery-searchIput',
					onSearch:'{{function(value){$handleInputSearch(value)}}}',
					onChange:'{{function(e){$sf("data.searchValue.invoiceNumber", e.target.value)}}}',
					value:'{{data.searchValue.invoiceNumber}}'
				},{
					name: 'leftMenuBtn',
					component: '::div',
					className: 'ttk-scm-app-unauthorized-list-accountQuery-leftMenuBtn',
					children:[{
						name: 'labelName',
						component: '::span',
						// style:{width: '70px', textAlign: 'right'},
						style:{width: 'auto', textAlign: 'right'},
						children: '认证状态：'
					},{
						name: 'notdeductible',
						component: 'Radio',
						children: '显示全部',
						checked: '{{!data.other.authentication}}',
						style: {fontSize: '12px'},
						onChange:'{{function(){$handleChangeAuth(true)}}}'
					},{
						name: 'notdeductible',
						component: 'Radio',
						children: '显示未认证',
						checked: '{{data.other.authentication}}',
						style: {fontSize: '12px'},
						onChange:'{{function(){$handleChangeAuth(false)}}}'
					}]
				}]
			},{
				name: 'rightHeadDiv',
				component: '::div',
				className: 'ttk-scm-app-unauthorized-list-headDiv-rightHeadDiv',
				children:[{
					name: 'deductible',
					component: 'Button',
					children: '抵扣',
					onClick: '{{function(){$handleIsDeductible(true)}}}'
				},{
					name: 'notdeductible',
					component: 'Button',
					children: '不予抵扣',
					onClick: '{{function(){$handleIsDeductible(false)}}}'
				},{
					name: 'more',
					component: 'Dropdown',
					overlay: {
						name: 'menu',
						component: 'Menu',
						onClick: '{{$moreActionOpeate}}',
						children: [{
							name: 'reauthentication',
							key: 'reauthentication',
							component: 'Menu.Item',
							children: '撤销认证'
						},
						{
							name: 'subjectSet',
							key:'subjectSet',
							component: 'Menu.Item',
							children: '科目设置'
						}]
					},
					children: {
						name: 'internal',
						component: 'Button',
						className: 'app-asset-list-header-more',
						children: [{
							name: 'word',
							component: '::span',
							children: '更多'
						}, {
							name: 'more',
							component: 'Icon',
							type: 'down'
						}]
					}
				}]
			}]
		},
		/*{
			name: 'accountQuery',
			title: 'accountQuery',
			className: 'ttk-scm-app-unauthorized-list-accountQuery',
			component: 'SearchCard',
			// component: '::div',
			searchClick: '{{function(value){$entityChange(value)}}}',
			normalSearcChildren:[{
				name: 'searchIput',
				component: 'Input.Search',
				placeholder: '请输入发票号码',
				maxLength: 8,
				className: 'ttk-scm-app-unauthorized-list-accountQuery-searchIput',
				onSearch:'{{function(value){$handleInputSearch(value)}}}',
				onChange:'{{function(e){$sf("data.searchValue.invoiceNumber", e.target.value)}}}',
				value:'{{data.searchValue.invoiceNumber}}'
			}],
			moreSearch: '{{data.searchValue}}',
			moreSearchItem:[{
				name: 'invoiceNumber',
				type: 'Input',
				label:'发票号码',
				autocomplete: "off",
				maxLength: 8,
				noClear: true,
			},{
				name: 'invoiceCode',
				type: 'Input',
				label:'发票代码',
				maxLength: 12,
				autocomplete: "off",
			},{
				name: 'sysAuthenticate',
				type: 'DatePicker',
				label:'认证期间',
			},{
				name: 'authenticated',
				type: 'Select',
				label:'采集发票状态',
				childType: 'Option',
				optionFilterProp: "children",
				option: '{{[{label:"已认证",value:true},{label:"未认证",value:false}]}}',
				allowClear: true
			}],
			leftMenuBtn:[{
				name: 'leftMenuBtn',
				component: '::div',
				className: 'ttk-scm-app-unauthorized-list-accountQuery-leftMenuBtn',
				children:[{
					name: 'labelName',
					component: '::span',
					style:{width: '70px', textAlign: 'right'},
					children: '认证状态：'
				},{
					name: 'notdeductible',
					component: 'Radio',
					children: '显示全部',
					checked: '{{!data.other.authentication}}',
					style: {fontSize: '12px'},
					onChange:'{{function(){$handleChangeAuth(true)}}}'
				},{
					name: 'notdeductible',
					component: 'Radio',
					children: '显示未认证',
					checked: '{{data.other.authentication}}',
					style: {fontSize: '12px'},
					onChange:'{{function(){$handleChangeAuth(false)}}}'
				}]
			}],
			refreshBtn: {
				name: 'refreshBtn',
				component: 'Icon',
				fontFamily: 'edficon',
				type: 'shuaxin',
				className: 'mk-normalsearch-reload',
				onClick: '{{$refreshBtnClick}}',
			},
			menuBtn:[{
				name: 'deductible',
				component: 'Button',
				children: '抵扣',
				onClick: '{{function(){$handleIsDeductible(true)}}}'
			},{
				name: 'notdeductible',
				component: 'Button',
				children: '不予抵扣',
				onClick: '{{function(){$handleIsDeductible(false)}}}'
			},{
				name: 'more',
				component: 'Dropdown',
				overlay: {
					name: 'menu',
					component: 'Menu',
					onClick: '{{$moreActionOpeate}}',
					children: [{
						name: 'reauthentication',
						key: 'reauthentication',
						component: 'Menu.Item',
						children: '撤销认证'
					},
					{
						name: 'subjectSet',
						key:'subjectSet',
						component: 'Menu.Item',
						children: '科目设置'
					}]
				},
				children: {
					name: 'internal',
					component: 'Button',
					className: 'app-asset-list-header-more',
					children: [{
						name: 'word',
						component: '::span',
						children: '更多'
					}, {
						name: 'more',
						component: 'Icon',
						type: 'down'
					}]
				}
			}]
		},*/{
			name: 'table',
			component: 'Table',
			className: 'ttk-scm-app-unauthorized-list-table',
			emptyShowScroll:true,
			key: '{{data.tableKey}}',
			checkboxKey: 'id',
			loading: '{{data.loading}}',
			checkboxChange: '{{$checkboxChange}}',
			checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
			pagination: false,
			scroll: '{{data.list.length > 0 ? data.tableOption : {}}}',
			allowColResize: false,
			enableSequenceColumn: false,
			Checkbox: false,
			rowSelection: '{{$rowSelection()}}',
			bordered: true,
			dataSource: '{{data.list}}',
			columns: [{
				width: '100px',
				title: '单据日期',
				dataIndex: 'businessDate',
			},{
				title: '系统认证/抵扣状态',
				dataIndex: 'authorizedStatus',
				width: '200px',
				children:[{
					name: 'sysAuthenticate',
					title:'认证期间',
					width: '100px',
					dataIndex: 'sysAuthenticate',
					render: '{{function(record, v, index){return $renderMoreStatus("sysAuthenticate", v, index)}}}'
				},{
					name: 'sysDeductible',
					title:'抵扣状态',
					width: '100px',
					dataIndex: 'sysDeductible',
					render: '{{function(record, v, index){return $renderAuthenticated("sysDeductible",v, index)}}}'
				}]
			},{
				title: '发票信息',
				dataIndex: 'authorizedStatus',
				width: '760px',
				children:[{
					name: 'invoiceNumber',
					title:'发票号码',
					dataIndex: 'invoiceNumber',
					render:'{{function(_rowIndex, v, index){return $renderText("invoiceNumber", v, index)}}}',
					width:'100px',
				},{
					name: 'invoiceCode',
					title:'发票代码',
					dataIndex: 'invoiceCode',
					render:'{{function(_rowIndex, v, index){return $renderText("invoiceCode", v, index)}}}',
					width:'100px',
				},{
					name: 'amount',
					title:'金额',
					dataIndex: 'amount',
					render:'{{function(_rowIndex, v, index){return $renderTextRight("amount", v, _ctrlPath, index)}}}',
					width:'110px',
				},{
					name: 'tax',
					title:'税额',
					dataIndex: 'tax',
					render:'{{function(_rowIndex, v, index){return $renderTextRight("tax", v, _ctrlPath, index)}}}',
					width:'110px',
				},{
					name: 'taxInclusiveAmount',
					title:'价税合计',
					dataIndex: 'taxInclusiveAmount',
					render:'{{function(_rowIndex, v, index){return $renderTextRight("taxInclusiveAmount", v, _ctrlPath, index)}}}',
					width:'110px',
				},
				{
					name: 'authenticated',
					title:'实际发票认证状态',
					dataIndex: 'authenticated',
					render: '{{function(record, v, index){return $renderAuthenticated("authenticated",v, index)}}}',
					width:'120px',
				},{
					name: 'code',
					title: '凭证字号',
					width: '80px',
					render:'{{function(record, v, index){return $renderCode(v, index)}}}'
				}]
			},{
				title: '操作',
				dataIndex: 'option',
				width: '90px',
				align: 'center',
				render: '{{function(record, v, index){return $renderOption(v, index)}}}'
			}]
		},{
			name: 'footer',
			className: 'ttk-scm-app-unauthorized-list-footer',
			component: '::div',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				pageSizeOptions: ['20', '50', '100', '200'],
				pageSize: '{{data.page.pageSize}}',
				current: '{{data.page.currentPage}}',
				total: '{{data.page.totalCount}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$pageChanged}}'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			searchValue:{},
			list:[],
			certifiedList: [],
			queryList: [],
			nodeSubject:{},
			tableKey: 1050,
			page: {
				currentPage: 1,//-- 当前页
				pageSize: 20,//-- 页大小
				// totalCount: 0,
				// totalPage: 0
			},
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			authenticatedList:[],
			tableOption:{},
			loading: false,
			other: {
				authentication : false
			}
		}
	}
}