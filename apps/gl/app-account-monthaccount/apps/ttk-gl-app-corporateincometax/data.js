import {consts} from 'edf-consts'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-corporateincometax',       
        children: [
            {
                name:'mode',
                component:'Form.Item',
                className:'ttk-gl-app-corporateincometax-mode',
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
                className: 'ttk-gl-app-corporateincometax-body',
                loading: '{{data.other.loading}}',
                // allowColResize: false,
                // enableSequenceColumn: false,
                bordered: true,
                noDelCheckbox: true,
                // scroll:'{{data.list.length > 7 ? data.tableOption : {} }}',
                columns: [
                {
                    title: '计税标准',
                    // colSpan: 0,
                    align: 'center',
                    dataIndex: 'name',
                    width:'60%',
                    key: 'name',
                    // render: "{{function(text, record, index){return $renderCell('summary', index, text, record)} }}"
                },{
                    title: '计税比例',
                    // colSpan: 0,
                    align: 'center',
                    dataIndex: 'rate',
                    width:'20%',
                    key: 'rate',
                    render: "{{function(text, record, index){return $renderCell('rate', index, text, record)} }}"												
                },
                {
                    title: '税率',
                    // colSpan: 0,
                    align: 'center',
                    dataIndex: 'proportion',
                    width:'20%',
                    key: 'proportion',
                    render: "{{function(text, record, index){return $renderCell('proportion', index, text, record)} }}"																
                }
            ],
                // columns: '{{$tableColumns()}}',
                dataSource: '{{data.list}}',
                // onRow: '{{function(record){return $mouseEnter(record)}}}'
            }
        ]
    }
}

export function getInitState() {
    return {
        data: {
            calcMode:1,
            // tableOption: {y:268},
            list:[{summaryNum:'',summary:'',creditAccountId:'',proportion:'',rate:'',debitAccountId:''}],
            other:{
                loading: false
            }
        }
    }
}