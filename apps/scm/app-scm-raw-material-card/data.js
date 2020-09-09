import moment from 'moment'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'app-scm-raw-material-card',
        id: 'app-scm-raw-material-card',
        onMouseDown: '{{$mousedown}}',
        children: [
            {
                name: 'header',
                component: '::div',
                className: 'app-scm-raw-material-card-title',
                children: [
                    {
                        name: 'span',
                        component: '::span',
                        className: 'app-scm-raw-material-card-code',
                        children: '配置原料(BOM)编码：'
                    },
                    {
                        name: 'refreshBtn',
                        className: '{{data.BOMCode!==""?"app-scm-raw-material-card-codeValue input":"app-scm-raw-material-card-codeValue input has-error"}}',
                        component: 'Input',
                        value: '{{data.BOMCode}}',
                        onChange:'{{$changeBOM}}'
                    },
                    {
                        name: 'code',
                        component: '::span',
                        className: 'app-scm-raw-material-card-code',
                        children: '产成品编码：'
                    },
                    {
                        name: 'codeValue',
                        component: '::span',
                        className: 'app-scm-raw-material-card-codeValue code',
                        children: '{{data.code}}',
                        title:'{{data.code}}',
                    },
                    {
                        name: 'title',
                        component: '::span',
                        className: 'app-scm-raw-material-card-code',
                        children: '产成品名称：'
                    },
                    {
                        name: 'titleValue',
                        component: '::span',
                        className: 'app-scm-raw-material-card-codeValue name',
                        title: '{{data.name}}',
                        children: '{{data.name}}'
                    }
                ]
            },
            {
                name: 'content',
                component: '::div',
                className: 'app-scm-raw-material-card-content',
                children: [
                    {
                        name: 'thead',
                        component: '::div',
                        className: 'app-scm-raw-material-card-thead',
                        children: '原材料'
                    },
                    {
                        name: 'details',
                        component: 'DataGrid',
                        className: 'app-scm-raw-material-card-form-details',
                        headerHeight: 35,
                        rowHeight: 35,
                        rowsCount: '{{data.form.details.length}}',
                        enableSequence: true,
                        startSequence: 1,
                        enableSequenceAddDelrow: true,
                        key: '{{data.other.detailHeight}}',
                        readonly: false,
                        style: '{{{return{height: data.other.detailHeight}}}}',
                        onAddrow: "{{$addRow('details')}}",
                        onDelrow: "{{$delRow('details')}}",
                        onKeyDown: '{{$gridKeydown}}',
                        scrollToColumn: '{{data.other.detailsScrollToColumn}}',
                        scrollToRow: '{{data.other.detailsScrollToRow}}',
                        columns: [
                            {
                                name: 'propertyName',
                                component: 'DataGrid.Column',
                                columnKey: 'propertyName',
                                width: 66,
                                flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '存货分类'
                                },
                                cell: {
                                    name: 'cell',
                                    component: 'DataGrid.TextCell',
                                    className: "{{$getCellClassName(_ctrlPath) + ' app-scm-raw-material-card-cell-disabled'}}",
                                    value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].propertyName}}',
                                    title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].propertyName}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'inventoryCode',
                                component: 'DataGrid.Column',
                                columnKey: 'inventoryCode',
                                flexGrow: 1,
                                width: 66,
                                header: {
                                    name: 'header',
                                    className: 'ant-form-item-required',
                                    component: 'DataGrid.Cell',
                                    children: '存货编码'
                                },
                                cell: {
                                    name: 'cell',
                                    component: 'Select',
                                    className: '{{$getCellClassName(_ctrlPath)}}',
                                    showSearch: true,
                                    allowClear: true,
                                    title: '{{ $isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryCode : data.form.details[_rowIndex].inventoryCode}}',
                                    value: '{{ $isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryCode : data.form.details[_rowIndex].inventoryCode}}',
                                    onChange: '{{$onFieldChange({ code: "data.form.details."+_rowIndex+".inventoryCode",' +
                                        'id: "data.form.details."+_rowIndex+".inventoryId",' +
                                        'name: "data.form.details."+_rowIndex+".inventoryName",' +
                                        'unitId: "data.form.details."+_rowIndex+".unitId",' +
                                        'unitName: "data.form.details."+_rowIndex+".unitName",' +
                                        'propertyName: "data.form.details."+_rowIndex+".propertyName",' +
                                        'propertyDetailName: "data.form.details."+_rowIndex+".propertyDetailName",' +
                                        'taxRateName: "data.form.details."+_rowIndex+".taxRateName",' +
                                        'specification: "data.form.details."+_rowIndex+".specification",' +
                                        '}, "data.other.inventory",_rowIndex, data.form.details[_rowIndex])}}',
                                    filterOption: '{{$filterOptionCode}}',
                                    //onFocus: '{{function(){$getInventorys()}}}',
                                    dropdownClassName: 'materialClass',
                                    dropdownFooter: "{{$handleAddRecord('Inventory', 'inventory', _rowIndex, data.form.details[_rowIndex])}}",
                                    children: {
                                        name: 'option',
                                        component: 'Select.Option',
                                        value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                                        children: '{{data.other.inventory && data.other.inventory[_lastIndex].code}}',
                                        _power: 'for in data.other.inventory'
                                    },
                                    _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'inventoryName',
                                component: 'DataGrid.Column',
                                columnKey: 'inventoryName',
                                flexGrow: 1,
                                width: 158,
                                header: {
                                    name: 'header',
                                    className: 'ant-form-item-required',
                                    component: 'DataGrid.Cell',
                                    children: '存货名称'
                                },
                                cell: {
                                    name: 'cell',
                                    component: 'Select',
                                    className: '{{$getCellClassName(_ctrlPath)}}',
                                    showSearch: true,
                                    allowClear: true,
                                    title: '{{$isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryName : data.form.details[_rowIndex].inventoryName}}',
                                    value: '{{$isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryName}}',
                                    onChange: '{{$onFieldChange({ id: "data.form.details."+_rowIndex+".inventoryId",' +
                                        'name: "data.form.details."+_rowIndex+".inventoryName",' +
                                        'code: "data.form.details."+_rowIndex+".inventoryCode",' +
                                        'unitId: "data.form.details."+_rowIndex+".unitId",' +
                                        'unitName: "data.form.details."+_rowIndex+".unitName",' +
                                        'propertyName: "data.form.details."+_rowIndex+".propertyName",' +
                                        'propertyDetailName: "data.form.details."+_rowIndex+".propertyDetailName",' +
                                        'taxRateName: "data.form.details."+_rowIndex+".taxRateName",' +
                                        'specification: "data.form.details."+_rowIndex+".specification",' +
                                        '}, "data.other.inventory", _rowIndex, data.form.details[_rowIndex])}}',
                                    filterOption: '{{$filterOption}}',
                                    //onFocus: '{{function(){$getInventorys(_rowIndex)}}}',
                                    dropdownClassName: 'materialClass',
                                    dropdownFooter: "{{$handleAddRecord('Inventory', 'inventory', _rowIndex, data.form.details[_rowIndex])}}",
                                    children: {
                                        name: 'option',
                                        component: 'Select.Option',
                                        value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                                        children: '{{data.other.inventory && $getFullNameChildren(data.other.inventory[_lastIndex])}}',
                                        _power: 'for in data.other.inventory'
                                    },
                                    _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'specification',
                                component: 'DataGrid.Column',
                                columnKey: 'specification',
                                width: 66,
                                flexGrow: 1,

                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '规格型号'
                                },
                                cell: {
                                    name: 'cell',
                                    component: 'DataGrid.TextCell',
                                    className: "{{$getCellClassName(_ctrlPath) + ' app-scm-raw-material-card-cell-disabled'}}",
                                    value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                                    title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'unit',
                                component: 'DataGrid.Column',
                                columnKey: 'unit',
                                width: 46,
                                flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '计量单位'
                                },
                                cell: {
                                    name: 'cell',
                                    component: 'DataGrid.TextCell',
                                    className: "{{$getCellClassName(_ctrlPath) + ' app-scm-raw-material-card-cell-disabled' + ' app-scm-raw-material-card-cell-center'}}",
                                    value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                                    title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            }, {
                                name: 'quantity',
                                component: 'DataGrid.Column',
                                columnKey: 'quantity',
                                width: 92,
                                flexGrow: 1,

                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: 'ant-form-item-required',
                                    children: '数量'
                                },
                                cell: {
                                    name: 'cell',
                                    precision: 6,
                                    component: 'Input.Number',
                                    className: '{{$getCellClassName(_ctrlPath) + " app-scm-raw-material-card-cell-right"}}',
                                    value: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,$isFocus(_ctrlPath),true)}}',
                                    title: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,$isFocus(_ctrlPath),true)}}',
                                    onChange: '{{$calc("quantity", _rowIndex, data.form.details[_rowIndex])}}',
                                    _power: '({rowIndex}) => rowIndex',
                                },
                                footer: {
                                    name: 'footer',
                                    component: 'DataGrid.Cell',
                                    className: 'app-scm-raw-material-card-list-cell-right',
                                    children: '{{$sumColumn("quantity")}}'
                                }
                            }, {
                                name: 'price',
                                component: 'DataGrid.Column',
                                columnKey: 'price',
                                width: 92,
                                flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '单价'
                                },
                                cell: {
                                    name: 'cell',
                                    precision: 6,
                                    component: 'Input.Number',
                                    className: '{{$getCellClassName(_ctrlPath) + " app-scm-raw-material-card-cell-right"}}',
                                    value: '{{$quantityFormat(data.form.details[_rowIndex].price,6, $isFocus(_ctrlPath))}}',
                                    title: '{{$quantityFormat(data.form.details[_rowIndex].price,6, $isFocus(_ctrlPath))}}',
                                    onChange: '{{$calc("price", _rowIndex,data.form.details[_rowIndex])}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },

                        ]
                    },
                ]
            }
        ]
    }
}

export function getInitState() {
    return {
        data: {
            form: {
                details: [
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail
                ],
              
            },
            other: {
                defaultLength: 12, //默认初始行数
                MOVEROW_UP: 0,
                MOVEROW_DOWN: 1,
                detailHeight: 8,
                isDisableBank: false,
                bussinessType: [],
                typeName: '库存单据',
                docList: [],
                isOk: true,
            },
        }
    }
}

export const blankDetail = {
    inventoryId: null,
    quantity: null,
    price: null
}