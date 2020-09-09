export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-account-rereplace',
        // spinning: '{{data.other.loading}}',        
        children: [{
            name: 'search',
            className: 'ttk-gl-app-account-rereplace-search',
            component: '::div',
            children: {
                name: 'accountSearch',
                component: 'Input.Search',
                showSearch: true,
                placeholder: '科目编码/科目名称',
                onSearch: '{{$onSearch}}',
            }
        }, {
            name: 'content',
            className: 'ttk-gl-app-account-rereplace-content',
            component: '::div',
            children: [{
                name: 'dataGrid',
                component: 'DataGrid',
                headerHeight: 36,
                rowHeight: 36,
                rowsCount: '{{$getRowsCount()}}',
                loading: '{{data.other.loading}}',
                isColumnResizing: true,
                ellipsis: true,
                columns: [{
                    name: 'code',
                    component: 'DataGrid.Column',
                    columnKey: 'code',
                    width: 120,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '科目编码'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        align: 'left',
                        value: '{{data.list[_rowIndex] && data.list[_rowIndex].code}}',
                        title: '{{data.list[_rowIndex] && data.list[_rowIndex].code}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'name',
                    component: 'DataGrid.Column',
                    columnKey: 'name',
                    width: 240,
                    flexGrow: 1,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '科目名称'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        align: 'left',
                        value: '{{data.list[_rowIndex] && data.list[_rowIndex].name}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                },
                {
                    name: 'balanceDirectionName',
                    component: 'DataGrid.Column',
                    columnKey: 'balanceDirectionName',
                    width: 80,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '方向'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        align: 'center',
                        value: '{{data.list[_rowIndex] && data.list[_rowIndex].balanceDirectionName}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                },
                {
                    name: 'operation',
                    component: 'DataGrid.Column',
                    columnKey: 'operation',
                    width: 80,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '操作'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.Cell',
                        _power: '({rowIndex})=>rowIndex',
                        children: [{
                            name: 'select',
                            component: 'Radio',
                            checked: '{{data.list[_rowIndex].selected}}',
                            onChange: '{{function(e){$selectRow(e.target.checked,_rowIndex)}}}'
                        }]
                    }
                }]
            }]
        }]
    }
}

export function getInitState() {
    return {
        data: {
            list: [],
            sourceList: [],
            other: {
                loading: false
            }
        }
    }
}



