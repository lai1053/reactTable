export function getMeta() {
    return {
        name:'root',
        component:'Layout',
        className:'ttk-es-app-mediation-list',
        children:[
            {
                name:'table',
                className:'ttk-es-app-mediation-list-table',
                component: 'Table',
                key: '{{data.id}}',
                bordered: true,
                scroll: {y:true},
                dataSource: '{{data.list}}',
                columns: '{{$renderColumns()}}',
                pagination: false,
                rowKey: 'id',
                emptyShowScroll:true,
                delay: 0,
                Checkbox: false,
                enableSequenceColumn: false,
                loading:'{{data.loading}}'
            },
            // {
            //     name: 'footer',
            //     className: 'ttk-es-app-mediation-list-table-footer',
            //     component: '::div',
            //     children: [
            //         {
            //             name: 'num',
            //             component: '::span',
            //             className: 'ttk-es-app-mediation-list-table-footer-total',
            //             children: '{{"共" +data.pagination.totalCount+"条记录"}}'
            //         },
            //         {
            //             name: 'pagination',
            //             component: 'Pagination',
            //             pageSizeOptions: ['50', '100', '200', '300'],
            //             pageSize: '{{data.pagination.pageSize}}',
            //             current: '{{data.pagination.currentPage}}',
            //             total: '{{data.pagination.totalCount}}',
            //             onChange: '{{$pageChanged}}',
            //             onShowSizeChange: '{{$pageChanged}}'
            //         },
            //     ]
            // }
        ]
    }
}

export function getInitState() {
    return {
        data:{
            list:[],
            columns: [
                {
                    id: 'id',
                    caption: "ID",
                    fieldName: 'id',
                    // isFixed: true,
                    isVisible: true,
                    width: '10%',
                    // isMustSelect: true,
                    align: 'center',
                    className:'',
                },
                {
                    id: 'name',
                    caption: "中介名称",
                    fieldName: 'name',
                    // isFixed: true,
                    isVisible: true,
                    width: '30%',
                    // isMustSelect: true,
                    align: 'left',
                    className:'',
                },
                {
                    id: 'createTime',
                    caption: "创建时间",
                    fieldName: 'createTime',
                    // isFixed: true,
                    isVisible: true,
                    width: '30%',
                    // isMustSelect: true,
                    align: 'center',
                    className:'',
                },
                // {
                //     id: 'address',
                //     caption: "详细地址",
                //     fieldName: 'address',
                //     // isFixed: true,
                //     isVisible: true,
                //     width: '40%',
                //     // isMustSelect: true,
                //     align: 'left',
                //     className:'',
                // },
                {
                    id: 'operation',
                    caption: "操作",
                    fieldName: 'operation',
                    // isFixed: true,
                    isVisible: true,
                    width: '30%',
                    // isMustSelect: true,
                    align: 'center',
                    className:'',
                },
            ],
            pagination: {//分页
                currentPage: 1,//-- 当前页
                pageSize: 50,//-- 页大小
                totalCount: 0,
                totalPage: 0
            },
            loading:false,
        }
    }
}