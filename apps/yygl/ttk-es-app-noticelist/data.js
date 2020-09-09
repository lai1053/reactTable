export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: '{{$heightCount()}}',
        children: [
            {
            name: 'content',
            component: 'Card',
            className: 'ttk-es-app-noticelist-content',
            title: '{{data.persName}}',
            extra: {
                name: 'header',
                component: '::div',
                className: 'ttk-es-app-noticelist-content-header',
                children: [{
                    name: 'inventoryName',
                    component: 'Input.Search',
                    showSearch: true,
                    placeholder: '请输入标题',
                    className:'ttk-es-app-noticelist-content-header-search',
                    value:'{{data.entity.fuzzyCondition}}',
                    onChange: `{{function(e){$sf('data.entity.fuzzyCondition',e.target.value);$search()}}}`,
                },{
                    name: 'popover',
                    component: 'Popover',
                    popupClassName: 'ttk-es-app-yyhome-popover',
                    placement: 'bottom',
                    title: '',
                    content: {
                        name: 'popover-content',
                        component: '::div',
                        className: 'inv-batch-custom-popover-content',
                        children: [
                            {
                                name: 'mobileItem',
                                component: 'Form.Item',
                                label: '阅读状态',
                                children: [{
                                    name: 'filter-content',
                                    component: '::div',
                                    className: 'filter-content',
                                    children: [{
                                        name: 'setting',
                                        component: 'Radio.Group',
                                        style: {marginLeft:'20px'},
                                        // _visible:false,
                                        value: '{{data.isCreatedAccount}}',
                                        children: [{
                                            name: 'borrow',
                                            component: 'Radio',
                                            value: 999,
                                            children: '全部'
                                        }, {
                                            name: 'loan',
                                            component: 'Radio',
                                            value: 1,
                                            children: '已读'
                                        }, {
                                            name: 'loan',
                                            component: 'Radio',
                                            value: 0,
                                            children: '未读'
                                        }],
                                        onChange: `{{function(e){$setKhflVal(e.target.value)}}}`,//function(v){$setField('data.isCreatedAccount',v.target.value);$loadList()}
                                    }]
                                }]
                            }, {
                                name: 'filter-footer',
                                component: '::div',
                                className: 'filter-footer',
                                children: [
                                    {
                                        name: 'search',
                                        component: 'Button',
                                        type: 'primary',
                                        children: '查询',
                                        onClick: '{{$search}}'
                                    },
                                    {
                                        name: 'reset',
                                        className: 'reset-btn',
                                        component: 'Button',
                                        children: '重置',
                                        onClick: '{{$resetval}}'
                                    }
                                ]
                            }]
                    },
                    trigger: 'click',
                    visible: '{{data.showPopoverCard}}',
                    onVisibleChange: "{{$handlePopoverVisibleChange}}",
                    children: {
                        name: 'filterSpan',
                        component: '::span',
                        className: 'inv-batch-custom-filter-btn header-item',
                        children: {
                            name: 'filter',
                            component: 'Icon',
                            type: 'filter'
                        }
                    }
                },{
                    name: 'del',
                    component: 'Button',
                    children: '全部已读',
                    className: 'btn',
                    type: 'primary',
                    onClick: '{{$delBatch}}'
                }]
            },
            children: [{
                name: 'dataGrid',
                component: 'DataGrid',
                className: 'ttk-es-app-noticelist-content-content',
                ellipsis: true,
                headerHeight: 37,
                rowHeight: 37,
                loading: '{{data.other.loading}}',
                rowsCount: '{{$getListRowsCount()}}',
                columns: [{
                    name: 'select',
                    component: 'DataGrid.Column',
                    columnKey: 'operation',
                    width: 34,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: [
                        //     {
                        //     name: 'chexkbox',
                        //     component: 'Checkbox',
                        //     checked: '{{$isSelectAll("dataGrid")}}',
                        //     // checked: '{{true}}',
                        //     onChange: '{{$selectAll("dataGrid")}}'
                        // }
                        ]
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.Cell',
                        _power: '({rowIndex})=>rowIndex',
                        children: [{
                            name: 'select',
                            // disabled: '{{(data.list[_rowIndex].isOrgCreator && data.list[_rowIndex].isOrgCreator == true) || (data.list[_rowIndex].id && data.list[_rowIndex].id == data.user.personid)}}',
                            component: 'Checkbox',
                            // checked: '{{$isSelectAll("dataGrid")}}',
                            disabled:'{{data.list[_rowIndex].isRead}}',
                            onChange: '{{$selectRow(_rowIndex)}}'
                        }]
                    }
                },
                {
                    name: 'departmentName',
                    component: 'DataGrid.Column',
                    columnKey: 'departmentName',
                    flexGrow: 1,
                    width: 100,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '标题'
                    },
                    cell: {
                        name: 'cell',
                        tip: true,
                        component: 'DataGrid.Cell',
                        // className: 'mk-datagrid-cellContent-left',
                        // className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
                        value: '{{data.list[_rowIndex].title}}',
                        title: '{{data.list[_rowIndex].title}}',
                        // onClick:'{{$ggDetail(data.list[_rowIndex].id)}}',
                        onClick: '{{function(){$ggDetail(data.list[_rowIndex].id)}}}',
                        _power: '({rowIndex})=>rowIndex'
                    }
                }, {
                    name: 'mobile',
                    component: 'DataGrid.Column',
                    columnKey: 'mobile',
                    flexGrow: 1,
                    width: 80,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '发送人'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.Cell',
                        tip: true,
                        // className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
                        value: '系统管理员',//{{data.list[_rowIndex].mobile}}
                        _power: '({rowIndex})=>rowIndex'
                    }
                }, {
                    name: 'email',
                    component: 'DataGrid.Column',
                    columnKey: 'email',
                    flexGrow: 1,
                    width: 80,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '发送时间'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.Cell',
                        tip: true,
                        // className: 'mk-datagrid-cellContent-left',
                        // className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
                        value: '{{data.list[_rowIndex].sendTime}}',
                        title: '{{data.list[_rowIndex].sendTime}}',
                        _power: '({rowIndex})=>rowIndex'
                    }
                }, {
                    name: 'role',
                    component: 'DataGrid.Column',
                    columnKey: 'role',
                    flexGrow: 1,
                    width: 70,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '状态'
                    },
                    cell: {
                        name: 'cell',
                        tip: true,
                        component: 'DataGrid.Cell',
                        // className: 'mk-datagrid-cellContent-left',
                        // className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
                        value: '{{data.list[_rowIndex].isRead ? "已读" : "未读"}}',//data.list[_rowIndex].isRead?已读:未读,
                        _power: '({rowIndex})=>rowIndex'
                    }
                }]
            }, {
                name: 'footer',
                component: '::div',
                className: 'ttk-es-app-noticelist-content-footer',
                children: [{
                    name: 'pagination',
                    component: 'Pagination',
                    showSizeChanger: true,
                    pageSize: '{{data.pagination.pageSize}}',
                    current: '{{data.pagination.current}}',
                    total: '{{data.pagination.total}}',
                    onChange: '{{$pageChanged}}',
                    onShowSizeChange: '{{$pageChanged}}'
                }]
            }]
        }]
    };
}

export function getInitState() {
    return {
        data: {
            //persName: '人员',
            persName: '',
            user: {},
            list: [],
            entity:{
                fuzzyCondition:""
            },
            departId:'',
            departCode:'',
            isDelDept: true,
            pagination: {
                current: 1,
                total: 0,
                pageSize: 50
            },
            filter: {},
            other: {},
            status: {
                isDeptCreater: ''
            },
            expandedKeys: [],
            treeSelectedKey: [],
            isCreatedAccount:999
        }

    };
}
