// import Menu from "antd/lib/menu";

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-cashflowstatement-rpt',
		children: [{
			name: 'header',
			component: '::div',
			className: 'app-cashflowstatement-rpt-headerContent',
			children:{
				name: 'header-content',
                component: '::div',
                 className: 'app-cashflowstatement-rpt-header',
                 children: [
                    {
                        name: 'selectTime',
                        component: 'Select',
                        className: 'app-cashflowstatement-rpt-period',
                        onSelect: '{{$selectPeriod}}',
                        // defaultValue: '按月查询',
                        value: '{{data.selectType?data.selectType : "month"}}',
                        // onChange: "{{function(value){$fieldChange('data.selectType',value)}}}",
                        children: [{
                            name: 'menuMonth',
                            component: 'Select.Option',
                            key: 'month',
                            children: '按月查询'
                        },{
                            name: 'menuQuarter',
                            component: 'Select.Option',
                            key: 'quarter',
                            children: '按季度查询'
                        },{
                            name: 'menuQuarter',
                            component: 'Select.Option',
                            key: 'halfYear',
                            children: '按半年查询'
                        },
                        // {
                        //     name: 'menuQuarter',
                        //     component: 'Select.Option',
                        //     key: 'year',
                        //     children: '按年查询'
                        // }
                    ]
                    },{

                        name: 'inquiryMode',
                        component: 'Select',
                        className: 'app-cashflowstatement-rpt-headerDropDown',
                        getPopupContainer:'{{function(){return document.querySelector(".app-cashflowstatement-rpt-headerDropDown")}}}',
                        value:'{{data.selectTimeTitle ? data.selectTimeTitle : undefined}}',
                        onSelect: '{{$selectData}}',
                         children: {
                             name: 'option',
                             component: 'Select.Option',
                             value: '{{data.selectTimeData ? data.selectTimeData[_rowIndex]["name"] : undefined}}',
                            //  key: '{{ data.selectTimeData ? JSON.stringify(data.selectTimeData[_rowIndex]): undefined}}',
                             children: '{{data.selectTimeData ? data.selectTimeData[_rowIndex]["name"] : undefined}}',
                             _power: 'for in data.selectTimeData'
                         },
                    },{
                        name: 'refresh',
                        component: 'Layout',
                        className: 'app-cashflowstatement-rpt-header-left',
                        children: [{
                            name: 'refreshBtn',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            type: 'shuaxin',
                            className: 'reload',
                            onClick: '{{$refresh}}',
                            title:'刷新'
                        }]
                    },
                    {
                        name: 'btnGroup',
                        component: 'Layout',
                        className: 'app-cashflowstatement-rpt-header-right',
                        children: [{
	                        name: 'beginningPeriod',
	                        component: 'Button',
	                        // type: 'primary',
	                        className: 'beginningPeriodBtn btn',
	                        children: '期初',
	                        _visible: '{{data.isBeginningPeriodShow}}',
	                        onClick: '{{$beginningPeriod}}',
                        },{
	                        name: 'projectManage',
	                        component: 'Button',
	                        type: 'primary',
	                        className: 'projectManageBtn btn',
	                        children: '现金流量分配',
	                        _visible: '{{data.period.type == "month"}}',
	                        onClick: '{{$projectManageClick}}',
                        },{
                            name: 'common',
                            component: 'Dropdown',
                            className: 'btn',
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
	                            className: 'shareBtn btn',
                                // type: 'primary',
                                children: ['分享', {
                                    name: 'down',
                                    component: 'Icon',
                                    fontFamily: 'edficon',
                                    type: 'xia',
                                    className: 'shareIcon'
                                }]
                            }
                        },
                        {
							name: 'printFunction',
							component: 'Dropdown.AntButton',
							onClick: '{{$print}}',
							className: 'app-cashflowstatement-rpt-print',
							style: { marginLeft: '8px'},
							overlay: {
								name: 'menu',
								component: 'Menu',
								onClick: '{{$printset}}',
								children: [
									{
										name: 'printset',
										component: 'Menu.Item',
										key: 'printset',
										children: '打印设置'
									}
								]
							},
							children: {
								name: 'print',
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'app-cashflowstatement-rpt-dayin',
								type: 'dayin',
								title: '打印',

							}
				 }
                        // {
                        //     name: 'save',
                        //     component: 'Icon',
                        //     fontFamily: 'edficon',
                        //     className: 'dayin',
                        //     type: 'dayin',
                        //     onClick: '{{$print}}',
                        //     title: '打印'
                        // }
                        ,{
                            name: 'share',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'daochu',
                            type: 'daochu',
                            title: '导出',
                            onClick: '{{$export}}'
                        }]
                    }]
            },
		}, {
				name: 'test',
				component: 'Table',
				bordered: true,
                pagination: false,
                scroll:'{{data.tableOption}}',
                tableIsNotRefreshKey: 'cashflowstatement',
                // className: 'app-cashflowstatement-rpt-table-tbody',
				className: '{{$getTableClassName()}}',
                // children: '{{$renderRows()}}',
                loading: '{{data.loading}}',
                columns: '{{$renderRows()}}',
				dataSource: '{{data.statement}}'
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
            tableOption: {
				x: 900,
				// y: 300
			},
			list: [],
			selectTimeTitle: '',
			selectTimeData:  [],
            period: {},
			other: {
				beginningPeriod: false
			}
		}
	}
}
