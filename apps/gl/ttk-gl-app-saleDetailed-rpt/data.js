// import moment from 'moment'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-saleDetailed-rpt',
        children: [{
            name: 'body',
            component: 'Layout',
            className: 'ttk-gl-app-saleDetailed-rpt-body',
            children: [
			// 	{
			// 	name: 'left',
			// 	component: '::div',
			// 	className: 'app-auxdetailaccount-rpt-body-left',
			// 	_visible: '{{$renderTimeLineVisible()}}',
			// 	children: '{{$renderTimeLine("")}}'
			// },
			{
                name: 'right',
                component: 'Layout',
                className: 'ttk-gl-app-saleDetailed-rpt-body-right',
                children: [{
                    name: 'header',
                    component: '::div',
                    className: 'ttk-gl-app-saleDetailed-rpt-headerContent',
                    children: {
                        name: 'header-content',
                        component: '::div',
                        className: 'ttk-gl-app-saleDetailed-rpt-header',
                        children: [{
                            name: 'header-left',
                            component: '::div',
                            className: 'ttk-gl-app-saleDetailed-rpt-header-left',
                            children: [
                                {
                                    name: 'data',
                                    component: 'DateRangeMonthPicker',
                                    format: "YYYY-MM",
                                    allowClear: false,
                                    startEnableDate: '{{data.enableDate}}',
                                    popupStyle: { zIndex: 10 },
                                    mode: ['month', 'month'],
                                    onChange: '{{$onPanelChange}}',
                                    value: '{{$getNormalDateValue()}}'
                                }, {
									name: 'title',
									component: '::span',
									style:{
										fontSize: '14px',
										paddingLeft: '10px',
										position: 'relative',
    									top: '3px',
										paddingRight: '5px',
										fontWeight: '600'
									},
									children: '产品名称及规格:'
								},{

									name: 'inquiryMode',
									component: 'Select',
									className: 'headerDropDown',
									value:'{{data.name ? data.name : undefined}}',
									onSelect: "{{function(d){$selectName('data.name',d)}}}",
									dropdownMatchSelectWidth:false,
									dropdownStyle:{
										width: '350px'
									},
									 children: {
										 name: 'option',
										 component: 'Select.Option',
										 value: '{{data.nameData ? data.nameData[_rowIndex]["codeAndName"] : undefined}}',
										 children: '{{data.nameData ? data.nameData[_rowIndex]["codeAndName"] : undefined}}',
										 _power: 'for in data.nameData'
									 },
								}, {
									name: 'inquiryModeChildren',
									component: 'Select',
									_visible:'{{data.namefalg}}',
									className: 'headerleftDropDown',
									value:'{{data.nameChildren ? data.nameChildren : undefined}}',
									onSelect: "{{function(d){$selectNameChildren('data.nameChildren',d)}}}",
									 children: {
										 name: 'option',
										 component: 'Select.Option',
										 value: '{{data.nameChildrenData ? data.nameChildrenData[_rowIndex]["name"] : undefined}}',
										 children: '{{data.nameChildrenData ? data.nameChildrenData[_rowIndex]["name"] : undefined}}',
										 _power: 'for in data.nameChildrenData'
									 },
								}, {
									name: 'titlename',
									component: '::span',
									style:{
										fontSize: '14px',
										paddingLeft: '20px',
										position: 'relative',
    									top: '3px',
										paddingRight: '5px',
										fontWeight: '600'
									},
									children: '计量单位:'
								}, {
									name: 'titlevalue',
									style:{
										position: 'relative',
    									top: '3px',
									},
									component: '::span',
									children: '{{data.unitName}}'
								},{
									name: 'refreshBtn',
									component: 'Icon',
									style:{
										border: '1px solid #D9D9D9',
										marginLeft: '20px'
									},
									fontFamily: 'edficon',
									type: 'shuaxin',
									title: '刷新',
									className: 'mk-normalsearch-reload',
									onClick: '{{$refreshBtnClick}}'
								},]
                        }, {
                            name: 'header-right',
                            component: '::div',
                            className: 'ttk-gl-app-saleDetailed-rpt-header-right',
                            children: [{
									name: 'common',
									component: 'Dropdown',
									overlay: {
										name: 'menu',
										component: 'Menu',
										onClick: '{{$shareClick}}',
										children: [{
											name: 'weixinShare',
											component: 'Menu.Item',
											key: 'weixinShare',
											children: '微信/QQ'
										}, {
											name: 'mailShare',
											component: 'Menu.Item',
											key: 'mailShare',
											children: '邮件分享'
										}]
									},
									children: {
										name: 'internal',
										component: 'Button',
										style: { top: '-6px'},
										type: 'primary',
										children: ['分享', {
											name: 'down',
											component: 'Icon',
											type: 'down'
										}]
									}
								},
								{
									name: '打印',
									component: 'Dropdown',
									overlay: {
										name: 'menu',
										component: 'Menu',
										children: [{
											name: 'item',
											component: 'Menu.Item',
											key: 'item',
											children: {
												component: '::span',
												name: '当前项目',
												onClick: '{{$print}}',
												children: '当前项目'
											}
										},
									// 	{
									// 	   name: 'all',
									// 	   component: 'Menu.Item',
									// 	   key: 'all',
									// 	   children: {
									// 		   component: '::span',
									// 		   name: '所有项目',
									// 		   children: '所有项目',
									// 		   onClick: '{{$printAllAccount}}'
									// 	   }
									//    },
									   {
											name: 'all',
											component: 'Menu.Item',
											key: 'all',
											children: {
												component: '::span',
												name: 'subjectManage',
												onClick: '{{$moreActionOpeate}}',
												children: '打印设置'
											}
										}
									]
									},
									children: {
										name: 'internal',
										component: 'Button',
										className: 'dayinBut',
										children: [{
											name: 'save',
											component: 'Icon',
											fontFamily: 'edficon',
											className: 'dayinBtn',
											type: 'dayin',
											title: '打印'
										}, {
											name: 'down',
											component: 'Icon',
											className: 'dayin-down',
											type: 'down'
										}]
									}
					
								}, {
									name: '导出',
									component: 'Dropdown',
									overlay: {
										name: 'menu',
										component: 'Menu',
										children: [ {
											name: 'item',
											component: 'Menu.Item',
											key: 'item',
											children: {
												component: '::span',
												name: '当前项目',
												onClick: '{{$export}}',
												children: '当前项目'
											}
										},
										//  {
										// 	name: 'all',
										// 	component: 'Menu.Item',
										// 	key: 'all',
										// 	children: {
										// 		component: '::span',
										// 		name: '所有项目',
										// 		children: '所有项目',
										// 		onClick: '{{$exportAllAccount}}'
										// 	}
										// }
									]
									},
									children: {
										name: 'internal',
										component: 'Button',
										style: { top: '-1px'},
										className: 'daochuBut',
										children: [{
											name: 'share',
											component: 'Icon',
											fontFamily: 'edficon',
											className: 'daochuBtn',
											type: 'daochu',
											title: '导出'
										}, {
											name: 'down',
											component: 'Icon',
											className: 'dayin-down dayin-down1',
											type: 'down'
										}]
									}
								}]
                        }]
                    }
                }, {
                    name: 'voucherItems',
                    component: 'Table',
                    pagination: false,
                    key: '{{Math.random()}}',
                    loading: '{{data.loading}}',
                    className: 'ttk-gl-app-saleDetailed-rpt-table-tbody',
                    scroll: '{{data.list.length > 0 ? data.tableOption : {} }}',
                    allowColResize: false,
                    enableSequenceColumn: false,
                    bordered: true,
                    dataSource: '{{data.list}}',
                    noDelCheckbox: true,
					columns: '{{$tableColumns()}}',
					onRow: '{{function(record){if(record.summary=="本月合计"||record.summary=="截至本月累计"){return {className: "totalRow"}}else{return {className: ""}}}}}'
                }]
            }]
        }, {
            name: 'footer',
            className: 'ttk-gl-app-saleDetailed-rpt-footer',
            component: '::div',
            children: [{
                name: 'pagination',
                component: 'Pagination',
                pageSize: '{{data.pagination.pageSize}}',
                current: '{{data.pagination.currentPage}}',
                total: '{{data.pagination.totalCount}}',
                onChange: '{{$pageChanged}}',
                onShowSizeChange: '{{$sizePageChanged}}'
            }]
        }
        ]
    }
}

export function childVoucherItems() {
    return {
        name: 'childVoucherItems',
        component: 'Table',
        dataSource: '{{data.dataItems}}',
        className: 'app-proof-of-list-child-Body',
        columns: [{
            title: '摘要1',
            name: 'summary1',
            dataIndex: 'summary1',
            key: 'summary1'
        }, {
            title: '科目1',
            name: 'accountingSubject1',
            dataIndex: 'accountingSubject1',
            key: 'accountingSubject1'
        }, {
            title: '借方金额1',
            name: 'debitAmount1',
            dataIndex: 'debitAmount1',
            key: 'debitAmount1',
            render: '{{data.content}}'
        }, {
            title: '贷方金额1',
            name: 'creditAmount1',
            key: 'creditAmount1',
            dataIndex: 'creditAmount1',
            render: '{{data.content}}'
        }]
    }
}

export function getInitState(option) {
    return {
        data: {
            tableOption: {
                x: 900,
                y: null
            },
            pagination: {
                currentPage: 1,
                totalCount: 0,
                pageSize: 50,
                totalPage: 0
            },
            searchValue: {
				date_end: option.date_end,
				date_start: option.date_start,
			},
            period: '',
            list:[],
            changeSipmleDate: false,
            enableDate: null,
            loading: true,
            other: {
                currentTime: '',
                timePeriod: {}
			},
			name:'',
			nameChildren:'',
			namefalg:false,
			unitName:'',
			nameData:[
				{
					name:'测试'
				}
			],
			nameChildrenData:[
				{
					name:'测试2'
				}
			]
        }
    }
}
