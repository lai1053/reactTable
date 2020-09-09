import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-app-inventoryAdd-card',
        id: 'ttk-app-inventoryAdd-card',
        onMouseDown: '{{$mousedown}}',
        children: [{
            name: 'content',
            component: '::div',
            className: 'ttk-app-inventoryAdd-card-content',
            children: [{
                name: 'button',
                component: '::div',
                className: 'ttk-app-inventoryAdd-card-content-div',
                children: [{
                    name: 'Delete',
                    component: 'Button',
                    children: '删除',
                    className: 'ttk-app-inventoryAdd-card-content-div-Delete',
                    onClick: '{{function(){$delete({})}}}'
                }, {
                    name: 'set',
                    component: 'Button',
                    children: '批量设置',
                    className: 'ttk-app-inventoryAdd-card-content-div-Button',
                    onClick: '{{function(){$set({})}}}'
                }]
            }, {
                name: 'bottom',
                component: '::div',
                className: 'ttk-app-inventoryAdd-card-content-bottom',
                children: [{
                    name: 'details',
                    component: 'DataGrid',
                    className: 'ttk-app-inventoryAdd-card-form-details',
                    headerHeight: 35,
                    rowHeight: 35,
                    groupHeaderHeight: 35,
                    rowsCount: '{{data.form.details.length}}',
                    // enableSequence: true,
                    // startSequence: 1,
                    enableSequenceAddDelrow: false,
                    key: '{{data.form.details}}',
                    readonly: false,
                    style: '{{{return{height:"300px"}}}}',
                    // onAddrow: "{{$addBottomRow('details')}}",
                    // onDelrow: "{{$delRow('details')}}",
                    onKeyDown: '{{$gridKeydown}}',
                    scrollToColumn: '{{data.other.detailsScrollToColumn}}',
                    scrollToRow: '{{data.other.detailsScrollToRow}}',
                    columns: [{
                        name: 'tg0',
                        component: 'DataGrid.Column',
                        columnKey: 'tg0',
                        width: 45,
                        header: {
                            name: 'header1',
                            component: 'DataGrid.Cell',
                            // className: 'column-group-header-wrapper',
                            children: {
                                name: 'selectall',
                                checked: '{{$isSelectAll()}}',
                                onChange: '{{$selectAll}}',
                                component: 'Checkbox'
                            }
                        },
                        cell: {
                            name: 'cell1',
                            component: 'DataGrid.Cell',
                            enableTooltip: true,
                            align: 'center',
                            _power: '({rowIndex})=>rowIndex',
                            children: {
                                name: 'select',
                                component: 'Checkbox',
                                checked: '{{data.form.details[_rowIndex].selected}}',
                                onChange: '{{$selectRow(_rowIndex)}}'
                            }
                        }
                    }, {
                        name: 'number',
                        component: 'DataGrid.Column',
                        columnKey: 'number',
                        width: 50,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-center',
                            children: '序号'
                        },
                        cell: {
                            name: 'cell',
                            component: '::span',
                            className: 'ttk-app-inventoryAdd-card-form-details-span',
                            children: '{{$renderRowSpanCode(data.form.details[_rowIndex],_rowIndex)}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    }, {
                        name: 'name',
                        component: 'DataGrid.Column',
                        columnKey: 'name',
                        width: 180,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-required ant-form-item-center',
                            children: '存货名称'
                        },
                        cell: {
                            name: 'cell',
                            component: 'Input',
                            required: true,
                            className: 'remark',
                            onChange: '{{function(e){$onFieldChanges(_rowIndex,e.target.value,"name",data.form.details[_rowIndex])}}}',
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
                            title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    }, {
                        name: 'specification',
                        component: 'DataGrid.Column',
                        columnKey: 'specification',
                        width: 150,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            // className: 'ant-form-item-required',
                            children: '规格型号'
                        },
                        cell: {
                            name: 'cell',
                            component: 'Input',
                            className: 'remark',
                            onChange: '{{function(e){$onFieldChanges(_rowIndex,e.target.value,"specification",data.form.details[_rowIndex])}}}',
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                            title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    }, {
                        name: 'invoiceUnit',
                        component: 'DataGrid.Column',
                        columnKey: 'invoiceUnit',
                        width: 80,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-center',
                            children: '单位(发票)',
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.TextCell',
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].invoiceUnit}}',
                            title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].invoiceUnit}}',
                            _power: '({rowIndex})=>rowIndex',
                        }
                    }, {
                        name: 'property',
                        component: 'DataGrid.Column',
                        columnKey: 'property',
                        width: 110,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '存货类型',
                            className: 'ant-form-item-required ant-form-item-center',
                        },
                        cell: {
                            name: 'cell',
                            component: 'Select',
                            showSearch: false,
                            allowClear: false,
                            required: true,
                            value: '{{data.form.details[_rowIndex].propertyId}}',
                            onChange: '{{function(value){$onFieldChanges(_rowIndex,value,"propertyId",data.form.details[_rowIndex])}}}',
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                value: '{{data.other.property && data.other.property[_lastIndex].id}}',
                                children: '{{data.other.property && data.other.property[_lastIndex].name}}',
                                _power: 'for in data.other.property'
                            },
                            _power: '({rowIndex})=>rowIndex'
                        }
                    }, {
                        name: 'inventoryRelatedAccountId',
                        component: 'DataGrid.Column',
                        columnKey: 'inventoryRelatedAccountId',
                        flexGrow: 1,
                        width: 114,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '存货科目',
                            className: 'ant-form-item-required ant-form-item-center',
                        },
                        cell: {
                            name: 'cell',
                            component: 'Select',
                            showSearch: false,
                            allowClear: false,
                            required: true,
                            dropdownMatchSelectWidth: false,
                            dropdownStyle: { width: '200px' },
                            disabled: '{{data.form.details[_rowIndex].propertyId ? false : true}}',
                            value: '{{$isFocus(_ctrlPath) ? data.form.details[_rowIndex].inventoryRelatedAccountId : data.form.details[_rowIndex].inventoryRelatedAccountName}}',
                            onFocus: '{{function(){$getFocusName(_rowIndex, data.form.details[_rowIndex])}}}',
                            onChange: '{{function(value){$onFieldChanges(_rowIndex,value,"inventoryRelatedAccountId",data.form.details[_rowIndex])}}}',
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                value: '{{data.other.subject && data.other.subject[_lastIndex].id}}',
                                children: '{{data.other.subject && data.other.subject[_lastIndex].codeAndName}}',
                                title: '{{data.other.subject && data.other.subject[_lastIndex].codeAndName}}',
                                _power: 'for in data.other.subject'
                            },
                            dropdownFooter: {
                                name: 'add',
                                component: 'Button',
                                type: 'primary',
                                style: { width: '100%', borderRadius: '0' },
                                children: '新增',
                                onClick: "{{function(){$addAccount(_rowIndex)}}}"
                            },
                            _power: '({rowIndex})=>rowIndex'
                        }
                    }, {
                        name: 'unitId',
                        component: 'DataGrid.Column',
                        columnKey: 'unitId',
                        flexGrow: 1,
                        width: 100,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-required ant-form-item-center',
                            children: '计量单位组',
                        },
                        cell: {
                            name: 'cell',
                            component: 'Select',
                            showSearch: false,
                            allowClear: false,
                            dropdownMatchSelectWidth: false,
                            dropdownStyle: { width: '160px' },
                            value: '{{data.form.details[_rowIndex].unitId}}',
                            onChange: '{{function(value){$onFieldChanges(_rowIndex,value,"unitId",data.form.details[_rowIndex])}}}',
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                value: '{{data.other.unit && data.other.unit[_lastIndex].id}}',
                                children: '{{data.other.unit && data.other.unit[_lastIndex].groupName}}',
                                title: '{{data.other.unit && data.other.unit[_lastIndex].groupName}}',
                                _power: 'for in data.other.unit'
                            },
                            dropdownFooter: {
                                name: 'add',
                                component: 'Button',
                                type: 'primary',
                                style: { width: '100%', borderRadius: '0' },
                                children: '新增',
                                onClick: "{{function(){$addUnit(_rowIndex)}}}"
                            },
                            _power: '({rowIndex})=>rowIndex'
                        }
                    }, {
                        name: 'alias',
                        component: 'DataGrid.Column',
                        columnKey: 'alias',
                        width: 100,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            // className: 'ant-form-item-required',
                            children: '别名'
                        },
                        cell: {
                            name: 'cell',
                            component: 'Input',
                            className: 'remark',
                            onChange: '{{function(e){$onFieldChanges(_rowIndex,e.target.value,"alias")}}}',
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].alias}}',
                            title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].alias}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    }]
                }]
            }]
        }]
    }
}

export function getInitState(option) {
    return {
        data: {
            amount: '',
            date: '',
            productAmount: '', // 生产入库成本
            productionAccounting: '',
            form: {
                details: [
                    // {name:'1',specification:'商品'},
                    // {name:'2',specification:'商品2', supplement:false},
                    // {name:'3456',specification:'商品3555',key:'66'},
                    // {name:'4',specification:'商品4'},
                ]
            },
            other: {
                detailHeight: 2,
                inventorys: [],
                options: [],
                inventoryItem: {},
                error: {}
            }
        }
    }
}

export const blankDetail = {
    businessTypeId: undefined,
    amount: '',
    remark: '',
    personId: null,
    personName: null,
    customerId: null,
    customerName: null,
    supplierId: null,
    supplierName: null,
    totalId: null,
    totalName: null,
}