import {consts} from 'edf-consts'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-withdrawing',       
        children: [
            {
                name:'mode',
                component:'Form.Item',
                className:'ttk-gl-app-withdrawing-mode',
                label: '计提规则',
                required: true,
                children: [{
                    name: 'setting',
                    component: 'Radio.Group',
                    disabled: '{{data.isDisabled||data.isAccountedMonth}}',
                    // options: '{{data.other.setting}}',
                    value: '{{data.calcMode}}',
                    children: [{
                        name: 'borrow',
                        component: 'Radio',
                        value: 1,
                        children: '按月计提'
                    }, {
                        name: 'loan',
                        component: 'Radio',
                        value: 2,
                        children: '按季计提'
                    }],
                    onChange: `{{function(v){$setField('data.calcMode',v.target.value)}}}`,
                }]
            },
            {
                name: 'span',
                component: 'Table',
                pagination: false,
                className: 'ttk-gl-app-withdrawing-body',
                loading: '{{data.other.loading}}',
                // allowColResize: false,
                // enableSequenceColumn: false,
                bordered: true,
                noDelCheckbox: true,
                scroll:'{{data.list.length > 7 ? data.tableOption : {} }}',
                columns: [{
                    title:'摘要',
                    colSpan: 2,
                    // rowSpan: 0,
                    dataIndex: 'summaryNum',
                    key:'summaryNum',
                    width:'3%',
                    render: "{{function(text, record, index){return $renderCell('summaryNum', index, text, record)} }}"
                },
                {
                    title: '摘要',
                    colSpan: 0,
                    dataIndex: 'summary',
                    width:'19%',
                    key: 'summary',
                    render: "{{function(text, record, index){return $renderCell('summary', index, text, record)} }}"
                },{
                    title: '借方科目',
                    // colSpan: 0,
                    dataIndex: 'debitAccountId',
                    width:'30%',
                    key: 'debitAccountId',
                    render: "{{function(text, record, index){return $renderCell('debitAccountId', index, text, record)} }}"												
                },
                {
                    title: '计税比例',
                    // colSpan: 0,
                    dataIndex: 'rate',
                    width:'11%',
                    key: 'rate',
                    render: "{{function(text, record, index){return $renderCell('rate', index, text, record)} }}"																
                },
                {
                    title: '贷方科目',
                    // colSpan: 0,
                    dataIndex: 'accountId',
                    width:'35%',
                    key: 'accountId',
                    render: "{{function(text, record, index){return $renderCell('accountId', index, text, record)} }}"												
                },
                {
                    title: '税率',
                    // colSpan: 0,
                    dataIndex: 'proportion',
                    width:'11%',
                    key: 'proportion',
                    render: "{{function(text, record, index){return $renderCell('proportion', index, text, record)} }}"																
                }
            ],
                // columns: '{{$tableColumns()}}',
                dataSource: '{{data.list}}',
                onRow: '{{function(record){return $mouseEnter(record)}}}'
            }
        ]
    }
}

export function getInitState() {
    return {
        data: {
            calcMode:1,
            tableOption: {y:264,x:850},
            list:[{summaryNum:'',summary:'',accountId:'',proportion:'',rate:'',debitAccountId:''}],
            other:{
                loading: false
            }
        }
    }
}