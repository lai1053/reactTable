// import moment from 'moment'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-accountagefx-rpt',
        children: [{
            name: 'header-content',
            component: '::div',
            className: 'ttk-gl-app-accountagefx-rpt-headerContent',
            children: {
                name: 'header',
                component: '::div',
                className: 'ttk-gl-app-accountagefx-rpt-header',
                children: [{
                    name: 'header-left',
                    component: '::div',
                    className: 'ttk-gl-app-accountagefx-rpt-header-left',
                    children: [{
                        name: 'declareMonth',
                        component: '::div',
                        children: '截至会计期间',
                        className: 'ttk-gl-app-accountagefx-rpt-header-left-endMonth'
                    }, {
                        name: 'date',
                        component: 'DatePicker.MonthPicker',
                        allowClear: false,
                        placeholder: '请选择月份',
                        value: '{{$stringToMoment(data.form.date)}}',
                        onChange: `{{function(d){$sf('data.form.date',$momentToString(d,'YYYY-MM-DD'));
              														$onMonthChange(_ctrlPath, data.form.date, $momentToString(d,'YYYY-MM-DD'))}}}`,
                        disabledDate: `{{function(current){ var enabledYM = new Date(data.other.enabledYM)
                													return current && current.valueOf() < enabledYM
                					}}}`,
                    }, {
                        name: 'select',
                        component: 'Select',
                        value: '{{data.other.id}}',
                        placeholder: "客户",
                        showSearch: true,
                        optionFilterProp:"children",
                        className: 'ttk-gl-app-accountagefx-rpt-header-left-customerList-width',
                        onChange: "{{function(v){$onFieldChange(_ctrlPath, v)}}}",
                        // getPopupContainer: '{{function(){return document.querySelector(".ttk-gl-app-accountagefx-rpt")}}}',
                        allowClear: true,
                        filterOption: '{{$filterOptionAux}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.customerList[_rowIndex].id}}',
                            key: '{{data.other.customerList[_rowIndex].id}}',
                            children: '{{data.other.customerList[_rowIndex].name}}',
                            _power: 'for in data.other.customerList'
                        },
                    }, {
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'shuaxin',
                        title: '刷新',
                        className: 'ttk-gl-app-accountagefx-rpt-header-reload',
                        onClick: '{{$refresh}}',
                    }
                    ]
                }, {
                    name: 'header-right',
                    component: '::div',
                    className: 'ttk-gl-app-accountagefx-rpt-header-right',
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
                            type: 'primary',
                            children: ['分享', {
                                name: 'down',
                                component: 'Icon',
                                type: 'down'
                            }]
                        }
                    }, {
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'dayin',
                        className: 'dayin',
                        onClick: '{{$print}}',
                        title: '打印'

                    }, {
                        component: 'Icon',
                        fontFamily: 'edficon',
                        className: 'daochu',
                        type: 'daochu',
                        title: '导出',
                        onClick: '{{$export}}'
                    }
                    ]
                }]
            }
        }, {
            name: 'voucherItems',
            component: 'Table',
            pagination: false,
            key: '{{Math.random()}}',
            loading: '{{data.loading}}',
            className: 'ttk-gl-app-accountagefx-rpt-table-tbody',
            scroll: '{{data.list.length > 0 ? data.tableOption : {} }}',
            allowColResize: false,
            enableSequenceColumn: false,
            bordered: true,
            dataSource: '{{data.list}}',
            noDelCheckbox: true,
            columns: '{{$tableColumns(data.other.reportType)}}'
        }]
    }
}

export function getInitState(option) {
    return {
        data: {
            form: {
                date: option.periodDate
            },
            tableOption: {
                x: 900,
                y: 700
            },
            period: '',
            list: [],
            changeSipmleDate: false,
            enableDate: null,
            loading: true,
            other: {
                enabledYM: option.enabledYM,
                id: undefined
            }
        }
    }
}
