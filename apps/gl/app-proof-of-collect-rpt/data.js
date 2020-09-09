// import moment from 'moment'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'app-proof-of-collect-rpt',
        children: [{
            name: 'body',
            component: 'Layout',
            className: 'app-proof-of-collect-rpt-body',
            children: [{
                name: 'left',
                component: '::div',
                className: 'app-proof-of-collect-rpt-body-left',
                // className: '{{$renderTimeLineVisible() ? "app-sumaccount-rpt-body-left" :""}}',
                _visible: '{{$renderTimeLineVisible()}}',
                children: '{{$renderTimeLine("")}}'
            }, {
                name: 'right',
                component: 'Layout',
                className: 'app-proof-of-collect-rpt-body-right',
                children: [{
                    name: 'header',
                    component: '::div',
                    className: 'app-proof-of-collect-rpt-headerContent',
                    children: {
                        name: 'header-content',
                        component: '::div',
                        className: 'app-proof-of-collect-rpt-header',
                        children: [{
                            name: 'header-left',
                            component: '::div',
                            className: 'app-proof-of-collect-rpt-header-left',
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
                                },
                                {
                                    component: 'Icon',
                                    fontFamily: 'edficon',
                                    type: 'shuaxin',
                                    title: '刷新',
                                    className: 'app-proof-of-collect-rpt-header-reload',
                                    onClick: '{{$refresh}}',
                                }]
                        }, {
                            name: 'header-right',
                            component: '::div',
                            className: 'app-proof-of-collect-rpt-header-right',
                            children: [{
                                name: 'lblDocCount',
                                component: 'Layout',
                                className: 'app-proof-of-collect-rpt-header-right-label',
                                children: ['凭证数: ', {
                                    name: 'label',
                                    component: '::label',
                                    children: '{{data.totalNum ? data.totalNum :0}}'
                                }, ' 张']
                            },
                            //  {
                            //     component: 'Icon',
                            //     fontFamily: 'edficon',
                            //     type: 'dayin',
                            //     className: 'dayin',
                            //     onClick: '{{$print}}',
                            //     title: '打印'
        
                            // },
                            {
                                name: 'batch2',
                                component: 'Dropdown.AntButton',
                                onClick: '{{$print}}',
                                className: 'dropdownbutton2',
                                style: { marginLeft: '8px' },
                                overlay: {
                                    name: 'menu',
                                    component: 'Menu',
                                    onClick: '{{$moreActionOpeate}}',
                                    children: [
                                        {
                                            name: 'subjectManage',
                                            component: 'Menu.Item',
                                            key: 'subjectManage',
                                            children: '打印设置'
                                        }
        
        
                                    ]
                                },
                                children: [{
                                    name: 'save',
                                    component: 'Icon',
                                    fontFamily: 'edficon',
                                    className: 'app-proof-of-collect-rpt-dayin',
                                    type: 'dayin',
                                    title: '打印',
        
                                }]
                            },
                            {
                                component: 'Icon',
                                fontFamily: 'edficon',
                                className: 'daochu',
                                type: 'daochu',
                                title: '导出',
                                onClick: '{{$export}}'
                            }]
                        }]
                    }
                }, {
                    name: 'voucherItems',
                    component: 'Table',
                    pagination: false,
                    key: '{{Math.random()}}',
                    loading: '{{data.loading}}',
                    className: 'app-proof-of-collect-rpt-table-tbody',
                    scroll: '{{data.list.length > 0 ? data.tableOption : {} }}',
                    allowColResize: false,
                    enableSequenceColumn: false,
                    bordered: true,
                    dataSource: '{{data.list}}',
                    noDelCheckbox: true,
                    columns: '{{$tableColumns()}}'
                }]
            }]
        }, {
            name: 'footer',
            className: 'app-proof-of-collect-rpt-footer',
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
                y: 700
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
            list: [],
            changeSipmleDate: false,
            enableDate: null,
            loading: true,
            other: {
                currentTime: '',
                timePeriod: {}
            }
        }
    }
}
