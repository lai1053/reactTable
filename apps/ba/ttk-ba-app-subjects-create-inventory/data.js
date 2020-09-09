export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-ba-app-subjects-create-inventory',
        children: [{
            name: 'root-content',
            component: 'Layout',
            children: [{
                name: 'note',
                component: '::div',
                className: 'ttk-ba-app-subjects-create-inventory-title',
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
                    className: 'ttk-ba-app-subjects-create-inventory-title-content',
                    children: [{
                        name: 'subjectNote',
                        component: '::span',
                        children: '存货名称自动取值规则：',
                        className: 'fl'
                    }, {
                        name: 'subjectName',
                        component: 'Checkbox.Group',
                        onChange: `{{function(v){$toastNull(v);$fieldChange('data.form.subject',v)}}}`,
                        value: '{{data.form.subject}}',
                        children: [{
                            name: 'subject1',
                            component: 'Checkbox',
                            children: '按末级科目取值',
                            key: 'subject1',
                            value: 'subject1',
                            className: 'radio'
                        }, {
                            name: 'subject2',
                            component: 'Checkbox',
                            children: '按末级的上一级科目取值',
                            key: 'subject2',
                            value: 'subject2',
                            className: 'radio'
                        }, {
                            name: 'subject3',
                            component: 'Checkbox',
                            children: '按末级的上两级科目取值',
                            key: 'subject3',
                            value: 'subject3',
                            className: 'radio'
                        }],
                        className: 'ib'
                    }, {
                        name: 'noteList',
                        component: '::div',
                        children: [{
                            name: 'subjectNote',
                            component: '::span',
                            children: '自动生成的档案示例：',
                            style: {marginLeft: '12px'},
                            className: 'fl'
                        }, {
                            name: 'subjectName',
                            component: 'Radio.Group',
                            children: [
                                {
                                    name: 'subject1',
                                    component: '::span',
                                    children: '{{$example()}}',
                                    className: 'radio'
                                }
                                // , {
                                //     name: 'subject2',
                                //     component: '::div',
                                //     children: `{{function(){
                                //     var subject = data.form.subject;
                                //     if(subject == 'subject1'){
                                //         return  '生成的档案名称------荣耀8（红）'
                                //     }else if(subject == 'subject2'){
                                //         return  '生成的档案名称------华为荣耀8（红）'
                                //     }else if(subject == 'subject3'){
                                //         return  '生成的档案名称------手机华为荣耀8（红）'
                                //     }
                                //     }()}}`,
                                //     className: 'radio'
                                // }
                            ],
                            className: 'ib'
                        }],
                    },
                    //     {
                    //     name: 'specification',
                    //     component: 'Checkbox',
                    //     checked: '{{data.form.specification}}',
                    //     // onChange: '{{function(e){$specificationCheck(e.target.checked)}}}',
                    //     onChange: "{{function(e){$fieldChange('data.form.specification',e.target.checked)}}}",
                    //     children: '规格型号自动取科目的末级科目',
                    //     className: 'radio'
                    // },
                        {
                        component: '::div',
                        children:[{
                            name: 'subjectNote',
                            component: '::span',
                            children: '规格型号自动取值规则：',
                            className: 'fl'
                        }, {
                            name: 'subjectName',
                            component: 'Checkbox.Group',
                            onChange: `{{function(v){console.log('打印',v);$fieldChange('data.form.specification',v)}}}`,
                            value: '{{data.form.specification}}',
                            children: [{
                                name: 'subject1',
                                component: 'Checkbox',
                                children: '按末级科目名称取值',
                                key: 'subject1',
                                value: 'subject1',
                                className: 'radio'
                            }],
                            className: 'ib'
                        },]
                    }],
                }]
            }, {
                name: 'content',
                component: 'Layout',
                className: 'ttk-ba-app-subjects-create-inventory-content',
                children: [{
                    name: 'dataGrid',
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
                    },
                        {
                            name: 'operation',
                            component: 'DataGrid.Column',
                            columnKey: 'operation',
                            flexGrow: 1,
                            width: 100,
                            // validateStatus: "error",
                            // help: '{{"的速度是的是的"}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: 'topBorder',
                                children: '生成档案的计量单位'
                            },
                            cell: {
                                name: 'cell',
                                component: 'Select',
                                className: '{{$getCellClassName(_ctrlPath) + "selectStyle"}}',
                                _power: '({rowIndex})=>rowIndex',
                                showSearch: false,
                                optionFilterProp: 'children',
                                onChange: '{{function(id){$unitChange(id,_rowIndex)}}}',
                                value: '{{data.list[_rowIndex] && data.list[_rowIndex].unitId}}',
                                dropdownStyle: {height: '192px', overflow: 'hidden'},
                                children: {
                                    name: 'selectItem',
                                    component: 'Select.Option',
                                    value: '{{data.other.unitList[_lastIndex].id}}',
                                    children: '{{data.other.unitList[_lastIndex].name}}',
                                    _power: 'for in data.other.unitList'
                                }
                            }
                        }
                    ]
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
                subject: ['subject1'],
                specification: ['subject1'],
            },
            other: {
                unitList: [],
                dataList: [],
                gradeSetting: {},
            }
        }
    };
}

