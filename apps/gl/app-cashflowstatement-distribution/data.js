// import Menu from "antd/lib/menu";

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'app-cashflowstatement-distribution',
        spinning: '{{data.other.loading}}',
        children: [
            {
                name: 'content',
                className: 'app-cashflowstatement-distribution-content',
                component: '::div',
                children:
                    [
                        {
                            className: 'app-account-addmultiauxitem-body',
                            name: 'report',
                            component: 'Table',
                            pagination: false,
                            lazyTable: true,
                            // showRows: 15,
                            // scroll: '{{data.list?{x:(data.colums+50), y:280}:{x:0,y:280}}}',
                            // key: '{{Math.random()}}',
                            scroll: '{{ (data.list && data.list.length >0) ? {y:330} : {y:0}}}',
                            allowColResize: false,
                            enableSequenceColumn: true,
                            bordered: true,
                            dataSource: '{{data.list}}',
                            noCalculate: true,
                            loading: '{{data.loading}}',
                            columns: [{
                                title: '摘要',
                                dataIndex: 'summary',
                                key: 'summary',
                                align: 'left',
                                width: '20%',
                                render: "{{ function(text, record, index){return $renderCell('summary', index, text)} }}"
                            }, {
                                title: '科目',
                                dataIndex: 'accountCodeAndName',
                                key: 'accountCodeAndName',
                                width: '20%',
                                render: "{{function(text, record, index){return $renderCell('accountCodeAndName', index, text)} }}"
                            }, {
                                title: '方向',
                                dataIndex: 'directionName',
                                key: 'directionName',
                                width: '5%',
                                align: 'center',
                                render: "{{function(text, record, index){return $renderCell('directionName', index, text)} }}"
                            }, {
                                title: '金额',
                                dataIndex: 'docAmount',
                                key: 'docAmount',
                                width: '10%',
                                // align: 'right',                            
                                render: "{{function(text, record, index){return $renderCell('docAmount', index, text)} }}"
                            }, {
                                title: '分配的现金流量项目',
                                dataIndex: 'itemName',
                                key: 'itemName',
                                width: '25%',
                                render: "{{function(text, record, index){return $renderCell('itemName', index, text)} }}"
                            }, {
                                title: '流向',
                                dataIndex: 'cashFlowDirectionName',
                                key: 'cashFlowDirectionName',
                                width: '5%',
                                render: "{{function(text, record, index){return $renderCell('cashFlowDirectionName', index, text)} }}"
                            }, {
                                title: '分配的金额',
                                dataIndex: 'allotAmount',
                                key: 'allotAmount',
                                width: '15%',
                                // align: 'right',                            
                                render: "{{function(text, record, index){return $renderCell('allotAmount', index, text)} }}"
                            }]
                        },

                    ]
            },
            // {
            //     name: 'footer',
            //     component: '::div',
            //     className: 'app-cashflowstatement-distribution-footer',
            //     children: [{
            //         name: 'pagination',
            //         component: 'Pagination',
            //         pageSize: '{{data.pagination.pageSize}}',
            //         current: '{{data.pagination.currentPage}}',
            //         total: '{{data.pagination.totalCount}}',
            //         onChange: '{{$pageChanged}}',
            //         onShowSizeChange: '{{$pageChanged}}',
            //         pageSizeOptions: ['20','50','100'],
            //         showQuickJumper: true
            //     }]
            // }
        ]
    }
}

export function getInitState() {
    return {
        data: {
            list: [],//列表
            // pagination: {
            //     pageSize: 20,
            //     currentPage: 1,
            //     pageSizeOptions: ['20','50','100'],
            //     totalCount: undefined
            // },
            dataSource: [],
            period: {},//从父级传来的调用接口参数
            codeAndName: undefined,//选择的科目
            flag: undefined,//被选符号
            formulaIdForPage: undefined,//被选取数规则
            other: {
                loading: false
            }
        }
    }
}



