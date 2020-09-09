import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-warehouseDetail',
        children: [{
			name: 'accountQuery',
			title: 'accountQuery',
			className: 'ttk-scm-app-warehouseDetail-accountQuery',
			component: 'SearchCard',
			refName: 'accountQuery',
			searchClick: '{{function(value){$searchValueChange(value)}}}',
			cancelClick: '{{function(value){$searchCancelChange(value)}}}',
			clearClick: '{{function(value){$clearValueChange(value)}}}',
			onChange: '{{function(value){$searchValueChange(value)}}}',
			didMount:'{{function(childrenRef){$getSearchCard(childrenRef)}}}',
			refreshBtn: {
				name: 'refreshBtn',
				component: 'Icon',
				fontFamily: 'edficon',
				type: 'shuaxin',
				title: '刷新',
				className: 'mk-normalsearch-reload',
				onClick: '{{$refresh}}'
			},
			confirmBtn:{
				hidden: false,
				text: '查询'
			},
			cancelBtn: {
				hidden: false,
				text: '取消'
			},
			clearBtn: {
				hidden: false,
				text: '清空'
			},
			menuBtn: [{
				name: 'batchAdd',
				component: 'Dropdown',
				className: 'btn',
				overlay: {
					name: 'menu',
					component: 'Menu',
					onClick: '{{$inventory}}',
					children: [{
						name: 'addInventoryIn',
						component: 'Menu.Item',
						key: 'addInventoryIn',
						children: '入库单'
					},{
						name: 'addInventoryOut',
						component: 'Menu.Item',
						key: 'addInventoryOut',
						children: '出库单'
					}]
				},
				children: {
					name: 'internalAdd',
					component: 'Button',
					type: 'primary',
					children: [{
						name: 'word',
						component: '::span',
						children: '新增单据'
					},{
						name: 'more',
						component: 'Icon',
						type: 'down'
					}]
				}
			},{
				name: 'batch',
				component: 'Dropdown.AntButton',
				onClick: '{{function(){$getVoucher()}}}',
				className: 'btn dropdownbutton',
				overlay: {
					name: 'menu',
					component: 'Menu',
					onClick: '{{$moreMenuClick}}',
					children: [{
						name: 'voucherHabit',
						component: 'Menu.Item',
						className: "app-asset-list-depreciation",
						key: 'voucherHabit',
						children: '凭证习惯'
					},{
						name: 'subjectSetting',
						component: 'Menu.Item',
						key: 'subjectSetting',
						children: '科目设置'
					},{
						name: 'delBatch',
						component: 'Menu.Item',
						key: 'delBatch',
						children: '删除凭证'
					}
				]
				},
				children:'生成凭证'
			},{
				name: 'zangu',
				component: 'Dropdown.AntButton',
				onClick: '{{function(){$temporaryInventoryList()}}}',
				className: 'btn dropdownbutton',
				_visible: '{{data.other.recoilMode == "1"}}',
				overlay: {
					name: 'menu',
					component: 'Menu',
					onClick: '{{$moreMenuClick}}',
					children: [{
						name: 'linkToEstimateList',
						component: 'Menu.Item',
						key: 'linkToEstimateList',
						children: '自动生成暂估'
					}]
				},
				children:'暂估回冲'
			},{
				name: 'zangu',
				component: 'Button',
				children: '自动生成暂估',
				className: 'btn',
				_visible: '{{data.other.recoilMode != "1"}}',
				onClick: '{{$linkToEstimateList}}'
			},{
				name: 'add',
				component: 'Button',
				// type: 'primary',
				children: '删除',
				className: 'btn',
				onClick: '{{$delete}}'
			},{
				name: 'print',
				component: 'Icon',
				fontFamily: 'edficon',
				className: 'btn print dayin',
				type: 'dayin',
				onClick: '{{$print}}',
				title: '打印',
				style: {
					fontSize: 28,
					lineHeight: '30px'
				},
			}, {
				name: 'export',
				component: 'Icon',
				fontFamily: 'edficon',
				className: 'btn export daochu',
				type: 'daochu',
				title: '导出',
				onClick: '{{$export}}',
				style: {
					fontSize: 28,
					lineHeight: '28px'
				},
			}],
			normalSearcChildren: [{
				name: 'selectContianer',
				component: '::div',
				className: 'ttk-scm-app-warehouseDetail-normalSearch',
				children:[{
					name: 'startDate',
					component: 'DatePicker.MonthPicker',
					value: '{{$getNormalDateValue()}}',
					onChange: "{{function(d){$changeStartDate($momentToString(d,'YYYY-MM'))}}}",
					disabledDate: '{{function(value){return $handleDisabledDate(value)}}}',
				},{
					name: 'type1',
					component: 'Select',
					placeholder: '存货分类',
					showSearch: false,
					allowClear: true,
					value: '{{data.form.typeId}}',
					onChange: `{{function(v){$selectType(data.other.type.filter(function(o){return o.value == v})[0])}}}`,
					children: {
						name: 'option',
						component: 'Select.Option',
						value: '{{data.other.type && data.other.type[_rowIndex].value}}',
						title: '{{data.other.type && data.other.type[_rowIndex].label}}',
						children: '{{data.other.type && data.other.type[_rowIndex].label}}',
						_power: 'for in data.other.type'
					}
				},{
					name: 'type2',
					component: 'Select',
					showSearch: false,
					placeholder: '业务类型',
					allowClear: true,
					value: '{{data.form.businessId}}',
					onChange: `{{function(v){$selectBusinessType(data.other.businessList.filter(function(o){return o.value == v})[0])}}}`,
					children: {
						name: 'option',
						component: 'Select.Option',
						value: '{{data.other.businessList && data.other.businessList[_rowIndex].value}}',
						title: '{{data.other.businessList && data.other.businessList[_rowIndex].label}}',
						children: '{{data.other.businessList && data.other.businessList[_rowIndex].label}}',
						_power: 'for in data.other.businessList'
					}
				},{
					name: 'inventoryName',
					component: 'Input.Search',
					showSearch: true,
					placeholder: '名称/规格型号/编码',
					value: '{{data.other.conds}}',
					className:'ttk-scm-app-warehouseDetail-selectR',
					onChange: `{{function(v){$searchList(v.target.value)}}}`,
				}]
			}],
			normalSearch:[],
			moreSearch: '{{data.other.searchValue}}',
			moreSearchItem: [{
				name: 'startDate',
				label: '月份',
				isTime: true,
				type: 'DatePicker.MonthPicker',
				noClear: true,
				disabledDate: '{{function(value){return $handleDisabledDate(value)}}}',
			},{
				name: 'type',
				label: '存货分类',
				type: 'Select',
				childType: 'Option',
				optionFilterProp:"children",
				filterOption: '{{$filterOptionSummary}}',
				title: '{{data.other.type}}',
				option: '{{data.other.type}}',
				allowClear: true,
			},{
				name: 'business',
				label: '业务类型',
				type: 'Select',
				childType: 'Option',
				optionFilterProp:"children",
				filterOption: '{{$filterOptionSummary}}',
				title: '{{data.other.businessList}}',
				option: '{{data.other.businessList}}',
				allowClear: true,
			}
			,{
				name: 'state',
				label: '凭证状态',
				type: 'Select',
				childType: 'Option',
				optionFilterProp:"children",
				title: '{{data.other.state}}',
				option: '{{data.other.state}}',
				noClear: true,
			}
		]
		},{
            name: 'content',
            className: 'ttk-scm-app-warehouseDetail-content',
            component: 'Layout',
            children: [{
                name: 'manageContent',
                component: 'Table',
                pagination: false,
                className: 'ttk-scm-app-warehouseDetail-table',
                allowColResize: false,
                enableSequenceColumn: false,
                loading: '{{data.other.loading}}',
				bordered: true,
				emptyShowScroll: true,
                scroll: '{{data.tableOption}}',
                dataSource: '{{data.other.tableList}}',
				key: '{{data.tableKey}}',
				checkboxKey: 'voucherId',
				checkboxChange: '{{$checkboxChange}}',
				checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
				Checkbox: false,
				rowSelection: '{{$rowSelection()}}',
				columns: '{{$tableColumns()}}',
				rowClassName: '{{$renderRowClassName}}',
            }]
        },{
			name: 'footer',
			className: 'ttk-scm-app-warehouseDetail-footer',
			component: 'Layout',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				pageSizeOptions: ['20', '50', '100', '200'],
				pageSize: '{{data.page.pageSize}}',
				current: '{{data.page.currentPage}}',
				total: '{{data.page.total}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$pageChanged}}'
			}]
		}]
    }
}

export function getInitState(option) {
	return {
		data: {
			tableKey: 1000,
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
            tableOption: {
                x: 1580,
                // y: null
			},
			enableDate: null,
			filter:{},
			form:{
				typeId:undefined
			},
			flag: true,
			page: {
				current: 1,
				total: 1,
				pageSize: 20,
			},
            other: {
                tableList: [],
				loading: false,
				searchValue:{
					startDate: moment(),
					state: 0
				},
				type:[],
				state: [{
					value: 0,
					label: '全部'
				},{
					value: 1,
					label: '生成凭证'
				},{
					value: 2,
					label: '未生成凭证'
				}]
            }
		}
	}
}