export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-sourceaccount-auxlist',
        // spinning: '{{data.other.loading}}',
        children: [{
            name: 'content',
            className: 'ttk-gl-app-sourceaccount-auxlist-content',
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
                    _visible: '{{data.other.showcode}}',
                    width: 120,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '科目编码'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        _visible: '{{data.other.showcode}}',
                        align: 'left',
                        value: '{{data.list[_rowIndex] && data.list[_rowIndex].accountCode}}',
                        title: '{{data.list[_rowIndex] && data.list[_rowIndex].accountCode}}',
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
                        value: '{{data.list[_rowIndex] && data.list[_rowIndex].accountName}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
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
                        value: '{{data.list[_rowIndex] && data.list[_rowIndex].balanceName}}',
                        _power: '({rowIndex}) => rowIndex',
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
            other: {
                showcode:true,
                loading: false
            }
        }
    }
}



