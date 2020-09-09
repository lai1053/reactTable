import moment from 'moment'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-arap-statrpt',
        children: [{
            name: 'header-content',
            component: '::div',
            className: 'ttk-gl-app-arap-statrpt-headerContent',
            children: {
                name: 'header',
                component: '::div',
                className: 'ttk-gl-app-arap-statrpt-header',
                children: [{
                    name: 'header-left',
                    component: '::div',
                    className: 'ttk-gl-app-arap-statrpt-header-left',
                    children: [{
                        name: 'date',
                        component: 'DateRangeMonthPicker',
                        format: "YYYY-MM",
                        allowClear: false,
                        startEnableDate: '{{data.other.enabledDate}}',
                        endEnableDate: '{{data.other.maxEnabledDate}}',
                        popupStyle: { zIndex: 10 },
                        mode: ['month', 'month'],
                        //onChange: "{{function(v){$onFieldChange(_ctrlPath, v)}}}",
                        onChange: '{{$onPanelChange}}',
                        value: '{{$getNormalDateValue()}}'
                    }, {
                        name: 'supplierList',
                        component: 'Select',
                        value: '{{data.other.id}}',
                        _visible: '{{data.other.useCalc == true?true:false}}',
                        placeholder: "{{data.other.reportType<2 ? '客户' : '供应商'}}",
                        className: 'ttk-gl-app-arap-statrpt-header-left-supplierList-width',
                        onChange: "{{function(v){$onFieldChange(_ctrlPath, v)}}}",
                        getPopupContainer: '{{function(){return document.querySelector(".ttk-gl-app-arap-statrpt")}}}',
                        allowClear: true,
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.supplierList[_rowIndex].id}}',
                            key: '{{data.other.supplierList[_rowIndex].id}}',
                            children: '{{data.other.supplierList[_rowIndex].name}}',
                            _power: 'for in data.other.supplierList'
                        },
                    },
                    {
                        name: 'inputGroup',
                        component: 'Input.Group',
                        compact: true,
                        _visible: '{{data.other.useCalc == false?true:false}}',
                        children: [
                            {
                                name: 'text',
                                component: 'Input',
                                value:'{{$getInputValue()}}',
                                disabled: true,
                                style: {height:'30px'}
                            },
                            {
                                name: 'grade',
                                component: 'Select',
                                value: '{{data.other.grade}}',
                               
                                placeholder: "末级科目",
                                className: 'ttk-gl-app-arap-statrpt-header-left-supplierList-grade',
                                onChange: "{{function(v){$onFieldChange(_ctrlPath, v)}}}",
                                getPopupContainer: '{{function(){return document.querySelector(".ttk-gl-app-arap-statrpt")}}}',
                                // allowClear: true,
                                children: {
                                    name: 'option',
                                    component: 'Select.Option',
                                    value: '{{data.other.gradeList[_rowIndex].id}}',
                                    key: '{{data.other.gradeList[_rowIndex].id}}',
                                    children: '{{data.other.gradeList[_rowIndex].name}}',
                                    _power: 'for in data.other.gradeList'
                                },
                            },
                        ]
                    }, 
                    // {
                    //     name: 'grade',
                    //     component: 'Select',
                    //     value: '{{data.other.grade}}',
                    //     _visible: '{{data.other.useCalc == false?true:false}}',
                    //     placeholder: "末级科目",
                    //     className: 'ttk-gl-app-arap-statrpt-header-left-supplierList-grade',
                    //     onChange: "{{function(v){$onFieldChange(_ctrlPath, v)}}}",
                    //     getPopupContainer: '{{function(){return document.querySelector(".ttk-gl-app-arap-statrpt")}}}',
                    //     // allowClear: true,
                    //     children: {
                    //         name: 'option',
                    //         component: 'Select.Option',
                    //         value: '{{data.other.gradeList[_rowIndex].id}}',
                    //         key: '{{data.other.gradeList[_rowIndex].id}}',
                    //         children: '{{data.other.gradeList[_rowIndex].name}}',
                    //         _power: 'for in data.other.gradeList'
                    //     },
                    // },
                    {
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'shuaxin',
                        title: '刷新',
                        className: 'ttk-gl-app-arap-statrpt-header-reload',
                        onClick: '{{$refresh}}',
                    }, {
                        name: 'noBalanceNoDisplay',
                        children: '无余额不显示',
                        key: 'noBalanceNoDisplay',
                        dataIndex: 'noBalanceNoDisplay',
                        component: 'Checkbox',
                        checked: "{{data.other.noBalanceNoDisplay}}",
                        onChange: "{{function(v){$onFieldChange(_ctrlPath, v)}}}",
                    },
                    
                    ]
                }, {
                    name: 'header-right',
                    component: '::div',
                    className: 'ttk-gl-app-arap-statrpt-header-right',
                    children: [{
                        component: 'Button',
                        className: 'ttk-gl-app-arap-statrpt-header-right-btn',
                        onClick: '{{$viewRpt}}',
                        children: '{{data.other.btnText}}'
                    }, {
                        name: 'common',
                        component: 'Dropdown',
                        // trigger:'click',
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
            className: 'ttk-gl-app-arap-statrpt-table-tbody',
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
                reportType: option.reportType,
                startDate: moment().endOf('month'),
                endDate: moment().endOf('month'),
                noBalanceNoDisplay: false,
                id: undefined,
                btnText: option.btnText,
                grade: 0,
                gradeList: [
                    {name: '一级科目',id:1},
                    {name: '二级科目', id:2},
                    {name: '三级科目', id:3},
                    {name: '四级科目', id:4},
                    {name: '五级科目', id:5},
                    {name: '末级科目', id:0}
                ]
            }
        }
    }
}
