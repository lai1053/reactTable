export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-ztconnetlist',
        children: [
            {
                name: 'content',
                component: 'Card',
                className: 'ttk-es-app-ztconnetlist-content',
                extra: {
                    name: 'header',
                    component: '::div',
                    className: 'ttk-es-app-ztconnetlist-content-header',
                    children: [ {
                        name: 'leftbox',
                        component: '::div',
                        className:'ttk-es-app-ztconnetlist-content-header-leftbox',
                        children:[
                            {
                                    name: 'tree',
                                    component: '::span',
                                    style: {
                                        verticalAlign: 'middle',
                                        marginRight: '8px'
                                    },
                                    children: '{{$renderTree()}}'
                                  },{
                                        name: 'inventoryName',
                                        component: 'Input.Search',
                                        showSearch: true,
                                        placeholder: '请输入客户名称或助记码',
                                        className:'ttk-es-app-ztconnetlist-content-header-search',
                                        value:'{{data.entity.seachtext}}',
                                        onChange: `{{function(e){$sf('data.entity.seachtext',e.target.value);$search()}}}`,
                                        onPressEnter: '{{$search}}'//按下回车时回调
                                    },{
                                        name: 'btn',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        type: 'shuaxin',
                                        className: 'shuaxin',
                                        onClick: '{{$load}}',
                                        title: '刷新',
                                    }
                         ]
                        },{
                            name: 'rightbox',
                            component: '::div',
                            className:'ttk-es-app-ztconnetlist-content-header-rightbox',
                            children:[
                                {
                                    name: 'zhgjxz',
                                    component: 'Button',
                                    children: '财务账套链接工具下载 ',
                                    className: 'btn',
                                    icon:"download",
                                    onClick:'{{$downZhgj}}',
                                    type: 'primary'
                                },
                                {
                                    name: 'reportPlSet',
                                    component: 'Button',
                                    children: '批量报表设置',
                                    className: 'btn',
                                    onClick:'{{$reportPlSet}}',
                                    type: 'primary',
                                    // _visible:'{{data.isShow}}'
                                }
                            ]
                        }
                    ]
                    // children: [ {
                    //     name: 'tree',
                    //     component: '::span',
                    //     style: {
                    //         verticalAlign: 'middle',
                    //         marginRight: '8px'
                    //     },
                    //     children: '{{$renderTree()}}'
                    //   },{
                    //         name: 'inventoryName',
                    //         component: 'Input.Search',
                    //         showSearch: true,
                    //         placeholder: '请输入客户名称或助记码',
                    //         className:'ttk-es-app-ztconnetlist-content-header-search',
                    //         value:'{{data.entity.fuzzyCondition}}',
                    //         onChange: `{{function(e){$sf('data.entity.fuzzyCondition',e.target.value);$search()}}}`,
                    //     },{
                    //         name: 'zhgjxz',
                    //         component: 'Button',
                    //         children: '财务数据智能合规转换工具下载',
                    //         className: 'btn',
                    //         icon:"download",
                    //         onClick:'{{$downZhgj}}',
                    //         type: 'primary'
                    //     }
                    // ]
                },
                children: [{
                    name: 'dataGrid',
                    component: 'DataGrid',
                    className: 'ttk-es-app-ztconnetlist-content-content',
                    ellipsis: true,
                    headerHeight: 37,
                    rowHeight: 37,
                    rememberScrollTop:true,
                    loading: '{{data.other.loading}}',
                    rowsCount: '{{$getListRowsCount()}}',
                    columns: [
                        {
                            name: 'select',
                            component: 'DataGrid.Column',
                            columnKey: 'operation',
                            width: 55,
                            // _visible:'{{data.isShow}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: [{
                                	name: 'chexkbox',
                                	component: 'Checkbox',
                                	checked: '{{$isSelectAll("dataGrid")}}',
                                	onChange: '{{$selectAll("dataGrid")}}'
                                }]
						    },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.Cell',
                                _power: '({rowIndex})=>rowIndex',
                                children: [{
                                    name: 'select',
                                    component: 'Checkbox',
                                    checked: '{{data.list[_rowIndex].selected}}',
                                    onChange: '{{$selectRow(_rowIndex)}}'
                                }]
                            }
                        },
                        {
                            name: 'name',
                            component: 'DataGrid.Column',
                            columnKey: 'name',
                            flexGrow: 1,
                            width: 137,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '客户名称'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.Cell',
                                className: 'mk-datagrid-cellContent-left',
                                _power: '({rowIndex})=>rowIndex',
                                children: '{{data.list[_rowIndex].name}}'
                            }
                        },
                        {
                            name: 'zjm',
                            component: 'DataGrid.Column',
                            columnKey: 'zjm',
                            flexGrow: 1,
                            width: 100,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '助记码'
                            },
                            cell: {
                                name: 'cell',
                                tip: true,
                                component: 'DataGrid.Cell',
                                className: 'mk-datagrid-cellContent-left',
                                value: '{{data.list[_rowIndex].zjm}}',
                                _power: '({rowIndex})=>rowIndex'
                            }
                        }, {
                            name: 'cwrj',
                            component: 'DataGrid.Column',
                            columnKey: 'cwrj',
                            flexGrow: 1,
                            width: 100,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '财务软件'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.Cell',
                                tip: true,
                                className: 'mk-datagrid-cellContent-left',
                                value: '{{data.list[_rowIndex].cwrj}}',
                                _power: '({rowIndex})=>rowIndex'
                            }
                        }, {
                            name: 'kjzz',
                            component: 'DataGrid.Column',
                            columnKey: 'kjzz',
                            flexGrow: 1,
                            width: 100,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '会计制度'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.Cell',
                                tip: true,
                                className: 'mk-datagrid-cellContent-left',
                                value: '{{data.list[_rowIndex].kjzz}}',
                                _power: '({rowIndex})=>rowIndex'
                            }
                        },
                        {
                            name: 'operation',
                            component: 'DataGrid.Column',
                            columnKey: 'operation',
                            flexGrow: 1,
                            width: 100,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '操作'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.Cell',
                                style: { display: 'flex' },
                                _power: '({rowIndex})=>rowIndex',
                                children: [
                                    
                                    {
                                        name: 'bbsz',
                                        component: '::span',
                                        children:[{
                                            name: 'popover',
                                            component: 'Popover',
                                            content: '需要进行报表设置',
                                            placement: 'top',
                                            overlayClassName: 'ttk-es-app-ztconnetlist-content-content-tishi',
                                            children: {
                                                name: 'icon',
                                                component: 'Icon',
                                                fontFamily: 'edficon',
                                                type: "XDZdanchuang-jinggao",
                                                className: "failTig",
    
                                            },
                                            _visible: '{{data.list[_rowIndex].reportFlag}}'
                                        },{
                                            name: 'bbsztext',
                                            component: '::span',
                                            children: '报表设置',
                                            onClick: '{{$reportSet(data.list[_rowIndex])}}',
                                            title: '报表设置',
                                        }],
                                        title: '报表设置',
                                        style: {
                                            cursor: 'pointer',
                                            color:'#0066b3'
                                        },
                                        _visible:'{{$opreationState(data.list[_rowIndex].cwrj)}}',
                                    },
                                    {
                                        name: 'splitLine',
                                        component: '::c',
                                        style: {
                                            margin: '0px 4px'
                                        },
                                        children:' | ',
                                        _visible:'{{$opreationState(data.list[_rowIndex].cwrj)}}',
                                        title: ''
                                    },{
                                        name: 'ljbb',
                                        component: '::span',
                                        children:'{{data.list[_rowIndex].cwrj!="" ? "断开连接":"连接"}}',
                                        title: '{{data.list[_rowIndex].cwrj!=""  ? "断开连接":"连接"}}',
                                        // style: {
                                        //     cursor: 'pointer',
                                        //     color:'#0066b3',
                                        // },
                                        className: '{{$isZtSate(data.list[_rowIndex])}}',
                                        onClick: '{{$ztljStatusClick(data.list[_rowIndex],data.list[_rowIndex].id)}}'
                                    },{
                                        name: 'ttk',
                                        component: '::a',
                                        href: '#',
                                        style: { display: 'none' },
                                        id: 'exeType'
                                    }
                                   ]
                            }
                        }]
                }, {
                    name: 'footer',
                    component: '::div',
                    className: 'ttk-es-app-ztconnetlist-content-footer',
                    children: [{
                        name: 'pagination',
                        component: 'Pagination',
                        pageSizeOptions: ['50', '100', '200', '300'],
                        showSizeChanger: true,
                        pageSize: '{{data.pagination.pageSize}}',
                        current: '{{data.pagination.current}}',
                        total: '{{data.pagination.total}}',
                        onChange: '{{$pageChanged}}',
                        showTotal: '{{$pageTotal}}',
                        onShowSizeChange: '{{$pageChanged}}'
                    }]
                }]
            }]
    };
}

export function getInitState() {
    return {
        data: {
            list: [],
            entity:{
                bs: "all",
                seachtext:"",
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
            other: {
                permission: {
                treeData: [],//权限列表
                all: null,
                self: '分配我的客户'
            }},
            status: {
                isDeptCreater: ''
            },
            maxde:'',
            showbm:'分配给我的客户',
            ifgs:'',
            checkedKeys: {
                checked: [],//全选
                halfChecked: []//半选
            },
            expandedKeys: [],
            treeSelectedKey: [],
            isShow: false
        }

    };
}
