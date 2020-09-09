// import Menu from "antd/lib/menu";

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-profitstatement-rpt',
		children: [{
			name: 'header',
			component: '::div',
			className: 'app-profitstatement-rpt-headerContent',
			children:{
				name: 'header-content',
                component: '::div',
                 className: 'app-profitstatement-rpt-header',
                 children: [
                    //  {
                    //      name: 'btn',
                    //      component:'Button',
                    //      children:'刷新',
                    //      onClick:'{{$link}}'
                    //  },
                    {
                        name: 'selectTime',
                        component: 'Select',
                        className: 'app-profitstatement-rpt-period',
                        onSelect: '{{$selectPeriod}}',
                        // defaultValue: '按月查询',
                        // onChange: "{{function(value){$fieldChange('data.selectType',value)}}}",
                        value: '{{data.selectType?data.selectType : "month"}}',
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
                        className: 'app-profitstatement-rpt-headerDropDown',
                        // getPopupContainer:'{{function(){return document.querySelector(".app-profitstatement-rpt-headerDropDown")}}}',
                        value:'{{data.selectTimeTitle ? data.selectTimeTitle : ""}}',
                        onSelect: '{{$selectData}}',
                        selectPagination: false, //select组件是否支持分页加载
                        defaultSelectRows: 5, //select组件默认显示行数
                        selectRows: 5, //select组件滚动一次加载的行数
                        // style: { marginRight: '10px',fontSize: '12px',width: '170px' },
                        onPopupScroll: '{{data.selectTimeData}}',
                        children: {
                             name: 'option',
                             component: 'Select.Option',
                             value: '{{data.selectTimeData ? data.selectTimeData[_rowIndex]["name"] : undefined}}',
                             key: '{{data.selectTimeData ? data.selectTimeData[_rowIndex]["name"] : undefined}}',
                             children: '{{data.selectTimeData ? data.selectTimeData[_rowIndex]["name"] : undefined}}',
                             _power: `for in data.selectTimeData`
                         },
                    },{
                        name: 'refresh',
                        component: 'Layout',
                        className: 'app-profitstatement-rpt-header-left',
                        children: [{
                            name: 'refreshBtn',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            type: 'shuaxin',
                            title:'刷新',
                            className: 'reload',
                            onClick: '{{$refresh}}'
                        }]
                    },
                    {
                        name: 'btnGroup',
                        component: 'Layout',
                        className: 'app-profitstatement-rpt-header-right',
                        children: [{
                            name: 'internal',
                            component: 'Button',
                            type: 'primary',
                            className: 'recalculation-btn',
                            children: '重算',
                            _visible: '{{data.recalculation}}',
                            // _visible: '{{false}}',
                            onClick: '{{$recalculationClick}}'
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
                                type: 'primary',
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
							className: 'app-profitstatement-rpt-print',
							style: { marginRight: '8px'},
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
								className: 'app-profitstatement-rpt-dayin',
								type: 'dayin',
								title: '打印',

							}
                 }
                //  {
                //             name: 'save',
                //             component: 'Icon',
                //             fontFamily: 'edficon',
                //             className: 'dayin',
                //             type: 'dayin',
                //             onClick: '{{$print}}',
                //             title: '打印'
                //         }
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
                tableIsNotRefreshKey: 'profitstatement',
                className: '{{$getTableClassName()}}',
                columns: '{{$renderRows()}}',
                loading: '{{data.loading}}',
				dataSource: '{{data.statement}}'
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
            // selectType: '按月查询',
            tableOption: {
				x: 800,
				// y: 300
            },
            templateCode:'',
            accountingStandards:'',
			list: [],
			selectTimeTitle: '',
			selectTimeData:  [],
            period: {},
            recalculation: false

		}
	}
}
