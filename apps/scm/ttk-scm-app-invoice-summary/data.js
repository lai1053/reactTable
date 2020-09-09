import moment from 'moment'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-scm-app-invoice-summary',
        children: [{
            name: 'header',
            component: '::div',
            className: 'ttk-scm-app-invoice-summary-headerContent',
            children: {
                name: 'header-content',
                component: '::div',
                className: 'ttk-scm-app-invoice-summary-header',
                children: [{
                    name: 'date',
                    component: 'DatePicker.MonthPicker',
                    format: "YYYY-MM",
                    allowClear: false,
                    className: "mk-rangePicker",
                    onChange: "{{function(d){$sf('data.period',$momentToString(d,'YYYY-MM'),$onDatePickerChange($momentToString(d,'YYYY-MM')))}}}",
                    value: '{{$stringToMoment(data.period)}}',
                    disabledDate: `{{function(current){ var disabledDate = new Date(data.enableDate)
													return current && current.valueOf() < disabledDate
					}}}`

                }, {
                    component: 'Icon',
                    fontFamily: 'edficon',
                    type: 'shuaxin',
                    className: 'ttk-scm-app-invoice-summary-header-reload',
                    onClick: '{{$refresh}}',
                }, {
                    name: 'lblDocCount',
                    component: 'Layout',
                    className: 'ttk-scm-app-invoice-summary-header-label',
                    children: null
                },
                {
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
                }]
            }
        },{
            name:'mail',
            component: 'Spin',
			tip: '数据加载中...',
            spinning: '{{data.loading}}',
            children:[
                {
                    name:'one',
                    component:'::div',
                    className: 'center',
                    children:'销项发票汇总'
                },{
                    name: 'content',
                    component: '::div',
                    className: 'ttk-scm-app-invoice-summary-content',
                    children: [{
                        name: 'content',
                        component: 'Table',
                        className: 'ttk-scm-app-invoice-summary-content-table',
                        pagination: false,
                        noDelCheckbox: true,
                        enableSequenceColumn: false,
                        bordered: true,
                        dataSource: '{{data.list}}',
                        columns: '{{$getColumns()}}',
                    },{
                        name:'right',
                        component:'::div',
                        className: 'ttk-scm-app-invoice-summary-content-text',
                        children:[{
                            name:'aa',
                            component:'::a',
                            onClick: '{{$handleSa}}',
                            children:'销项'
                        }]
                    }]
                },{
                    name:'two',
                    component:'::div',
                    className: 'center centertwo',
                    children:'进项发票汇总'
                },{
                    name: 'content',
                    component: '::div',
                    className: 'ttk-scm-app-invoice-summary-content',
                    children: [{
                        name: 'content',
                        component: 'Table',
                        className: 'ttk-scm-app-invoice-summary-content-table',
                        pagination: false,
                        noDelCheckbox: true,
                        enableSequenceColumn: false,
                        bordered: true,
                        dataSource: '{{data.list}}',
                        columns: '{{$getColumns()}}',
                    },{
                        name:'right',
                        component:'::div',
                        className: 'ttk-scm-app-invoice-summary-content-text',
                        children:[{
                            name:'aa',
                            component:'::a',
                            onClick: '{{$handlePu}}',
                            children:'进项'
                        }]
                    }]
                }
            ]
        }]
    }
}


export function getInitState() {
    return {
        data: {
            tableOption: {
                x: 900,
                y: null
            },
            period: moment().format('YYYY-MM'),
            list: [{name:'123',blue:'20',red:'10',aa:'65',num:'11',rate:'12',sum:'30'}],
            enableDate: null,
            loading: false,
            columns: []
        }
    }
}