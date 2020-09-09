// import Menu from "antd/lib/menu";

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'app-balancesheet-rpt',
        children: [
            {
            name: 'header',
            component: '::div',
            className: 'app-balancesheet-rpt-headerContent',
            children: {
                name: 'header-content',
                component: '::div',
                className: 'app-balancesheet-rpt-header',
                children: [
                    {
                        name: 'selectTime',
                        component: 'Select',
                        className: 'app-balancesheet-rpt-period',
                        onSelect: '{{$selectPeriod}}',
                        defaultValue: '按月查询',
                        children: [{
                            name: 'menuMonth',
                            component: 'Select.Option',
                            key: 'month',
                            children: '按月查询'
                        },
                        //  {
                        //     name: 'menuQuarter',
                        //     component: 'Select.Option',
                        //     key: 'quarter',
                        //     children: '按季度查询'
                        // }, {
                        //     name: 'menuHalfYear',
                        //     component: 'Select.Option',
                        //     key: 'halfYear',
                        //     children: '按半年查询'
                        // }, {
                        //     name: 'menuYear',
                        //     component: 'Select.Option',
                        //     key: 'year',
                        //     children: '按年查询'
                        // }
                    ]
                    }, {

                        name: 'inquiryMode',
                        component: 'Select',
                        className: 'app-balancesheet-rpt-headerDropDown',
                        getPopupContainer:'{{function(){return document.querySelector(".app-balancesheet-rpt-headerDropDown")}}}',
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
                        name:'btn',
                        component: '::div',
                        className: 'app-balancesheet-rpt-header-btn',
                        children: [
                            {
                                name: 'refresh',
                                component: 'Layout',
                                className: 'app-balancesheet-rpt-header-left',
                                children: [{
                                    name: 'refreshBtn',
                                    component: 'Icon',
                                    fontFamily: 'edficon',
                                    type: 'shuaxin',
                                    className: 'reload',
                                    title:'刷新',
                                    onClick: '{{function(){$refresh(data.resetArApAccount)}}}'
                                }]
                            },{
                                name: 'setting',
                                component: 'Layout',
                                className: 'app-balancesheet-rpt-header-left',
                                
                                children: [
                                    {
                                        // name:'settingPopover',
                                        // component: 'Popover',
                                        // // content: '往来项目重分类',
                                        
                                        // placement: "right",
                                        // children: {
                                            name: 'settingBtn',
                                            component: 'Icon',
                                            fontFamily: 'edficon',
                                            type: 'shezhi',
                                            // disabled: '{{data.monthClosingFlag}}',
                                            className: 'reload',
                                            onClick: '{{$setting}}',
                                            title:'设置',
                                        // }
                                    }
                                    ]
                            }
                        ]
                    },
                    {
                        name: 'btnGroup',
                        component: 'Layout',
                        className: 'app-balancesheet-rpt-header-right',
                        children: [{
                            name: 'balanceSheet',
                            component: 'Layout',
                            className: 'app-balancesheet-rpt-header-textContent',
                            children: [{
                                name: 'divShell',
                                component: '::div',
                                className: 'shell',
                                children: [
                                    {
                                        name: 'finalTextHeader',
                                        component: '::span',
                                        children: '期末：',
                                        className: 'title'
                                    }, {
                                        name: 'textHeader',
                                        component: '::div',
                                        className: 'text',
                                        // title: `{{"资产总计"+data.balanceSheetAmount["assetsPeriodEndAmount"] +$finalSymbol()+"负债和所有者权益总计"+data.balanceSheetAmount["liabilitiesPeriodEndAmount"]}}`,
                                        children: [
                                            {
                                                name: 'finalTextContentfirst',
                                                component: '::span',
                                                children: '资产总计',
                                                className: 'content'
                                            }, {
                                                name: 'assetsPeriodEndAmount',
                                                component: '::span',
                                                children: '{{data.balanceSheetAmount["assetsPeriodEndAmount"] ? data.balanceSheetAmount["assetsPeriodEndAmount"] : undefined}}',
                                                className: 'content'
                                            }, {
                                                name: 'textSymbol',
                                                component: '::span',
                                                children: '{{$finalSymbol()}}',
                                                // className:'iconRed'
                                            }, {
                                                name: 'finalTextContentSecond',
                                                component: '::span',
                                                children: '负债和所有者权益总计',
                                                className: 'content'
                                            }, {
                                                name: 'liabilitiesPeriodEndAmount',
                                                component: '::span',
                                                children: '{{data.balanceSheetAmount["liabilitiesPeriodEndAmount"] ? data.balanceSheetAmount["liabilitiesPeriodEndAmount"] : undefined}}',
                                                className: 'content'
                                            }
                                        ]
                                    }
                                ]
                            }, {
                                name: 'divShell',
                                component: '::div',
                                className: 'shell',
                                children: [
                                    {
                                        name: 'beginTextHeader',
                                        component: '::span',
                                        children: '年初：',
                                        className: 'title'
                                    }, {
                                        name: 'textFooter',
                                        component: '::div',
                                        className: 'text',
                                        children: [
                                            {
                                                name: 'beginTextContentfirst',
                                                component: '::span',
                                                children: '资产总计',
                                                className: 'content'
                                            }, {
                                                name: 'assetsYearBeginAmount',
                                                component: '::span',
                                                children: '{{data.balanceSheetAmount["assetsYearBeginAmount"] ? data.balanceSheetAmount["assetsYearBeginAmount"] : undefined}}',
                                                className: 'content'
                                            }, {
                                                name: 'textSymbol',
                                                component: '::span',
                                                children: '{{$beginSymbol()}}',
                                                // className:'iconRed'
                                            }, {
                                                name: 'beginTextContentSecond',
                                                component: '::span',
                                                children: '负债和所有者权益总计',
                                                className: 'content'
                                            }, {
                                                name: 'liabilitiesYearBeginAmount',
                                                component: '::span',
                                                children: '{{data.balanceSheetAmount["liabilitiesYearBeginAmount"] ? data.balanceSheetAmount["liabilitiesYearBeginAmount"] : undefined}}',
                                                className: 'content'
                                            }
                                        ]
                                    }
                                ]
                            }]
                        },{
                            name: 'internal',
                            component: 'Button',
                            type: 'primary',
                            className: 'recalculation-btn',
                            children: '重算',
                            _visible: '{{data.recalculation}}',
                            // _visible: '{{false}}',
                            onClick: '{{$recalculationClick}}'
                        }, {
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
							className: 'app-balancesheet-rpt-print',
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
								className: 'app-balancesheet-rpt-dayin',
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
                        , {
                            name: 'share',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'daochu',
                            type: 'daochu',
                            title: '导出',
                            onClick: '{{$export}}'
                        },
                        // {
                        //     name: 'share',
                        //     component: 'Icon',
                        //     fontFamily: 'edficon',
                        //     className: 'daochu',
                        //     type: 'jian1',
                        //     title: '导出',
                        //     onClick: '{{$openCerti}}'
                        // }
                    ]
                    }]
            },
        }, {
            name: 'test',
            component: 'Table',
            bordered: true,
            pagination: false,
            scroll:'{{data.tableOption}}',
            tableIsNotRefreshKey: 'balancesheet',
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
            templateCode:'',
            resetTaxAmountAccount:'',
            list: [],
            selectTimeTitle: '',
            selectTimeData: [],
            period: {},
            balanceSheetAmount: {},
            recalculation:false
        }
    }
}
