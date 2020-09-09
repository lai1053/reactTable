export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-ba-app-subjects-create-supplier',
        children: [{
            name: 'root-content',
            component: 'Layout',
            children: [{
                name: 'note',
                component: '::div',
                className: 'ttk-ba-app-subjects-create-supplier-title',
                children: [
                //     {
                //     name: 'subjectNote',
                //     component: '::div',
                //     children: '自动生成档案的取值规则：',
                //     style: {marginBottom: '6px'}
                // },
                    {
                    name: 'noteList',
                    component: '::div',
                    className: 'ttk-ba-app-subjects-create-supplier-title-content',
                    children: [{
                        component: '::div',
                        children:[{
                            name: 'subjectNote',
                            component: '::span',
                            children: '客户名称自动取值规则：',
                            className: 'fl'
                        }, {
                            name: 'subjectName',
                            component: 'Radio.Group',
                            onChange: `{{function(v){$fieldChange('data.form.subject',v.target.value)}}}`,
                            value: '{{data.form.subject}}',
                            children: [{
                                name: 'subject1',
                                component: 'Radio',
                                children: '按末级科目取值',
                                key: 'subject1',
                                value: 'subject1',
                                className: 'radio'
                            }],
                            className: 'ib'
                        },]
                    },{
                        component: '::div',
                        children:[{
                            name: 'subjectNote',
                            component: '::span',
                            children: '应付科目取值规则：',
                            style: {marginLeft: '24px'},
                            className: 'fl'
                        }, {
                            name: 'specification',
                            component: 'Checkbox.Group',
                            value: '{{data.form.specification}}',
                            onChange: '{{$subjectChange}}',
                            children: [{
                                name: '1123',
                                component: 'Checkbox',
                                children: '预付账款科目',
                                key: '1123',
                                value: '1123',
                                className: 'radio'
                            }, {
                                name: '2202',
                                component: 'Checkbox',
                                children: '应付账款科目',
                                key: '2202',
                                value: '2202',
                                className: 'radio'
                            }, {
                                name: '2241',
                                component: 'Checkbox',
                                children: '其他应付款科目',
                                key: '2241',
                                value: '2241',
                                className: 'radio'
                            }],
                            className: 'ib'
                        }]
                    },
                        ],
                }]
            }, {
                name: 'content',
                component: 'Layout',
                className: 'ttk-ba-app-subjects-create-supplier-content',
                children: [{
                    name: 'details',
                    component: 'DataGrid',
                    ellipsis: true,
                    headerHeight: 37,
                    rowHeight: 37,
                    isColumnResizing: false,
                    loading: '{{data.other.loading}}',
                    startSequence: 1,
                    rowsCount: '{{data.list.length}}',
                    columns: [{
                        name: 'select',
                        component: 'DataGrid.Column',
                        columnKey: 'operation',
                        width: 34,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            // style: {borderLeft: '1px solid #d9d9d9'},
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
                            // style: {borderLeft: '1px solid #d9d9d9'},
                            _power: '({rowIndex})=>rowIndex',
                            children: [{
                                name: 'select',
                                component: 'Checkbox',
                                checked: '{{data.list[_rowIndex].selected}}',
                                onChange: '{{$selectRow(_rowIndex)}}'
                            }]
                        }
                    }, {
                        name: 'code',
                        component: 'DataGrid.Column',
                        columnKey: 'code',
                        width: 100,
                        flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '科目编码'
                        },
                        cell: {
                            name: 'cell',
                            className: '{{"mk-datagrid-cellContent-left"}}',
                            _power: '({rowIndex})=>rowIndex',
                            component: 'DataGrid.Cell',
                            value: '{{data.list[_rowIndex] && data.list[_rowIndex].code}}',
                        }
                    }, {
                        name: 'name',
                        component: 'DataGrid.Column',
                        columnKey: 'name',
                        width: 100,
                        flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'topBorder',
                            children: '科目名称  '
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.Cell',
                            className: '{{"mk-datagrid-cellContent-left"}}',
                            style: '{{$indentCalculate(data.list[_rowIndex] && data.list[_rowIndex].code)}}',
                            tip: true,
                            value: '{{data.list[_rowIndex] && data.list[_rowIndex].name}}',
                            _power: '({rowIndex})=>rowIndex'
                        }
                    }]
                }]
            }]
        }]
    };
}

export function getInitState() {
    return {
        data: {
            list: [],
            listMap: {},
            form: {
                subject: 'subject1',
                specification: ['1123','2202','2241']
            },
            other: {
                unitList: [],
                dataList: [],
                gradeSetting: {},
            }
        }
    };
}

