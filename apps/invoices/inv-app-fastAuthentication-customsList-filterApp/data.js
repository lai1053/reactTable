export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ticket-app-filter',
        children: [
            {
                name: 'input',
                component: 'Input',
                className: 'ticket-app-filter-input',
                type: 'text',
                placeholder: '请输入缴款书号码',
                allowClear: true,
                enterButton: false,
                prefix: {
                    name: 'search',
                    component: 'Icon',
                    type: 'search',
                },
                onChange: "{{function(v) {$sf('data.form.inv_code', v.target.value)}}}",
                onPressEnter: '{{$handerSearch}}',
            }, {
                name: 'popover',
                component: 'Popover',
                popupClassName: 'ticket-app-filter-popover',
                placement: 'bottom',
                title: '筛选条件',
                content: {
                    name: 'filterDiv',
                    component: '::div',
                    className: 'ticket-app-filter-popover-body',
                    children: [
                        {
                            name: 'content',
                            component: '::div',
                            className: 'ticket-app-filter-popover-body-content',
                            children: [
                                {
                                    name: 'item4',
                                    component: '::div',
                                    className: 'ticket-app-filter-popover-body-content-item',
                                    children: [
                                        {
                                            name: 'label',
                                            component: '::span',
                                            children: '认证状态',
                                            className: 'ticket-app-filter-popover-body-content-item-left',
                                        }, {
                                            name: 'select',
                                            component: 'Select',
                                            placeholder: '请选择',
                                            className: 'ticket-app-filter-popover-body-content-item-select',
                                            onChange: "{{function(val){$sf('data.form.recognize_retult',val)}}}",
                                            value: '{{data.form.recognize_retult}}',
                                            getPopupContainer: '{{function(trigger){return trigger.parentNode}}}',
                                            children: {
                                                name: 'option',
                                                component: 'Select.Option',
                                                children: '{{data.recognitionTypeList[_rowIndex].value}}',
                                                value: '{{String(data.recognitionTypeList[_rowIndex].key)}}',
                                                _power: 'for in data.recognitionTypeList',
                                            }
                                        }
                                    ]
                                },
                                {
                                    name: 'date',
                                    component: '::div',
                                    className: 'ticket-app-filter-popover-body-content-item',
                                    children: [
                                        {
                                            name: 'label',
                                            component: '::span',
                                            children: '开票日期',
                                            className: 'ticket-app-filter-popover-body-content-item-left',
                                        }, {
                                            name: 'sdate',
                                            component: 'DatePicker',
                                            disabledDate: '{{$disabledStartDate}}',
                                            defaultValue: "{{$stringToMoment((data.form.bill_date_start),'YYYY-MM-DD')}}",
                                            onChange: "{{function(v){$sf('data.form.bill_date_start', $momentToString(v,'YYYY-MM-DD'))}}}",
                                            allowClear: true,
                                            format: "YYYY-MM-DD",
                                            placeholder: '选择日期',
                                            className: 'ticket-app-filter-popover-body-content-item-date',
                                            //getPopupContainer:'{{function(trigger){return trigger.parentNode} }}',
                                            getCalendarContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                            value: "{{$stringToMoment((data.form.bill_date_start),'YYYY-MM-DD')}}"
                                        }, {
                                            name: 'span',
                                            component: '::span',
                                            children: '-',
                                            className: 'ticket-app-filter-popover-body-content-item-::divider',
                                        }, {
                                            name: 'edate',
                                            component: 'DatePicker',
                                            disabledDate: '{{$disabledEndDate}}',
                                            placeholder: '选择日期',
                                            allowClear: true,
                                            format: "YYYY-MM-DD",
                                            defaultValue: "{{$stringToMoment((data.form.bill_date_end),'YYYY-MM-DD')}}",
                                            onChange: "{{function(v){$sf('data.form.bill_date_end', $momentToString(v,'YYYY-MM-DD'))}}}",
                                            className: 'ticket-app-filter-popover-body-content-item-date',
                                            //getPopupContainer:'{{function(trigger){return trigger.parentNode} }}',
                                            getCalendarContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                            value: "{{$stringToMoment((data.form.bill_date_end),'YYYY-MM-DD')}}"
                                        }
                                    ]
                                },
                            ],
                        },
                        {
                            name: 'footer',
                            component: '::div',
                            className: 'ticket-app-filter-popover-body-footer',
                            children: [
                                {
                                    name: 'reset',
                                    component: 'Button',
                                    children: '重置',
                                    onClick: '{{$handerReset}}'
                                }, {
                                    name: 'ok',
                                    component: 'Button',
                                    type: 'primary',
                                    children: '查询',
                                    onClick: '{{$handerSearch}}'
                                }
                            ]
                        }
                    ]
                },
                trigger: "click",
                visible: '{{data.visible}}',
                onVisibleChange: '{{$handleVisibleChange}}',
                children: {
                    name: 'filterSpan',
                    component: '::span',
                    className: 'ticket-app-filter-popover-filter',
                    children: {
                        name: 'filter',
                        component: 'Icon',
                        type: 'filter',
                    }
                }
            }
        ]
    }
}

export function getInitState() {
    return {
        data: {
            visible: false,
            ticketTypeList: [],
            recognitionTypeList: [
                {key: '', value: '全部'},
                {key: '1', value: '已认证'},
                {key: '0', value: '未认证'},
                {key: '2', value: '认证中'}]
            ,
            form: {
                bill_date_start: undefined,
                bill_date_end: undefined,
                recognize_retult: '', //识别结果类型
                inv_code: undefined, //发票号码
            },
            filterForm: {
                bill_date_start: undefined,
                bill_date_end: undefined,
                recognize_retult: '', //识别结果类型
                inv_code: undefined, //发票号码
            }
        }
    }
}