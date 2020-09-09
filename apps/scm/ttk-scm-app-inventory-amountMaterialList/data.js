import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-scm-app-inventory-amountMaterialList',
        id: 'ttk-scm-app-inventory-amountMaterialList',
        onMouseDown: '{{$mousedown}}',
        children: [{ 
            name: 'content',
            component: '::div',
            className: 'ttk-scm-app-inventory-amountMaterialList-content',
            children: [{
                name: 'top',
                component: '::div',
                className: 'ttk-scm-app-inventory-amountMaterialList-content-top',
                children:[{
                    name: 'date',
                    component: 'DatePicker.MonthPicker',
                    value: '{{$stringToMoment(data.date)}}',
                    disabled: true
                },{
                    name: 'amount',
                    component: '::span',
                    children:[{
                        name: 'span1',
                        component: '::span',
                        children: "{{'产成品入库直接材料合计余额： '}}"
                    },{
                        name: 'span2',
                        component: '::span',
                        children: "{{data.amount || '0.00'}}"
                    }]
                },{
                    name: 'syamount',
                    component: '::span',
                    style:{marginLeft: "20px"},
                    children:[{
                        name: 'span1',
                        component: '::span',
                        children: "{{'剩余余额： '}}"
                    },{
                        name: 'span2',
                        component: '::span',
                        children: "{{$renderSyAmount()}}"
                    }]
                },{
                    name: 'btn',
                    component: '::div',
                    className: 'btn',
                    children:[/*{
                        name: 'per',
                        component: 'Button',
                        type: 'primary',
                        children: '自动领料',
                        onClick:'{{$handleProRata}}',
                    },*/{
                        name: 'detailsAdd',
                        component: 'Dropdown',
                        // className: 'btn',
                        placement:"bottomRight",
                        overlay: {
                            name: 'menu',
                            component: 'Menu',
                            onClick: '{{$handleClickMenu}}',
                            children: [{
                                name: 'materialPro',
                                component: 'Menu.Item',
                                key: 'materialPro',
                                children: '选择原材料'
                            }, {
                                name: 'rawmMaterials',
                                component: 'Menu.Item',
                                key: 'rawmMaterials',
                                children: '按配置原料(BOM)领料'
                            }]
                        },
                        children: {
                            name: 'productDetails',
                            component: 'Button',
                            type: 'primary',
                            children: [{
                                name: 'word',
                                component: '::span',
                                children: '选择原料'
                            }, {
                                name: 'more',
                                component: 'Icon',
                                type: 'down'
                            }]
                        }
                    }]
                }]
            },{
                name: 'bottom',
                component: '::div',
                className: 'ttk-scm-app-inventory-amountMaterialList-content-bottom',
                children:[{
                    name: 'details',
                    component: 'DataGrid',
                    className: 'ttk-scm-app-inventory-amountMaterialList-form-details',
                    headerHeight: 35,
                    rowHeight: 35,
                    footerHeight: 35,
                    groupHeaderHeight: 35,
                    rowsCount: '{{data.form.details.length}}',
                    enableSequence: true,
                    startSequence: 1,
                    enableSequenceAddDelrow: true,
                    sequenceFooter: {
                        name: 'footer',
                        component: 'DataGrid.Cell',
                        children: '合计'
                    },
                    key: '{{data.other.detailHeight}}',
                    readonly: false,
                    style: '{{{return{height:"300px"}}}}',
                    onAddrow: "{{$addRow('details')}}",
                    onDelrow: "{{$delRow('details')}}",
                    onKeyDown: '{{$gridKeydown}}',
                    scrollToColumn: '{{data.other.detailsScrollToColumn}}',
                    scrollToRow: '{{data.other.detailsScrollToRow}}',
                    columns: [{
                        name: 'tg1',
                        component: 'DataGrid.ColumnGroup',
                        header: '原材料',
                        isColumnGroup: true,
                        children:[{
                            name: 'inventoryCode',
                            component: 'DataGrid.Column',
                            columnKey: 'inventoryCode',
                            width: 90,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '存货编码'
                            },
                            cell: {
                                name: 'cell',
                                component: 'Select',
                                className: '{{$getCellClassName(_ctrlPath)}}',
                                showSearch: true,
                                allowClear: true,
                                dropdownFooter: {
                                    name: 'add',
                                    component: 'Button',
                                    type: 'primary',
                                    style: { width: '100%', borderRadius: '0' },
                                    children: '新增',
                                    onClick: "{{function(){$addArchive('inventory', _rowIndex, data.form.details[_rowIndex])}}}"
                                },
                                onChange: '{{$onFieldChange({ id: "data.form.details."+_rowIndex+".inventoryId",' +
                                'name: "data.form.details."+_rowIndex+".inventoryName",' +
                                'code: "data.form.details."+_rowIndex+".inventoryCode",' +
                                'unitId: "data.form.details."+_rowIndex+".unitId",' +
                                'unitName: "data.form.details."+_rowIndex+".unitName",' +
                                'periodEndQuantity: "data.form.details."+_rowIndex+".periodEndQuantity",' +
                                'periodEndAmount: "data.form.details."+_rowIndex+".periodEndAmount",' +
                                'quantity: "data.form.details."+_rowIndex+".quantity",' +
                                'price: "data.form.details."+_rowIndex+".price",' +
                                'amount: "data.form.details."+_rowIndex+".amount",' +
                                'gapQuantity: "data.form.details."+_rowIndex+".gapQuantity",' +
                                'gapAmount: "data.form.details."+_rowIndex+".gapAmount",' +
                                'specification: "data.form.details."+_rowIndex+".specification"}, "data.other.inventorys", _rowIndex, data.form.details[_rowIndex])}}',
                                // value: '{{data.form.details[_rowIndex].inventoryCode}}',
                                filterOption: '{{$filterOption}}',
                                value: '{{(!$isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryCode)}}',
                                children: '{{$renderSelectOption(_rowIndex, data.form.details[_rowIndex], "inventoryCode")}}',
                                _excludeProps: '{{!$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }, {
                            name: 'inventoryName',
                            component: 'DataGrid.Column',
                            columnKey: 'inventoryName',
                            width: 150,
                            flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '存货名称'
                            },
                            cell: {
                                name: 'cell',
                                component: 'Select',
                                className: '{{$getCellClassName(_ctrlPath)}}',
                                showSearch: true,
                                allowClear: true,
                                dropdownMatchSelectWidth: false,   
                                dropdownClassName: 'ttk-scm-app-inventory-amountMaterialList-dropdownname',  
                                dropdownStyle:{width:'300px'}, 
                                onChange: '{{$onFieldChange({ id: "data.form.details."+_rowIndex+".inventoryId",' +
                                'name: "data.form.details."+_rowIndex+".inventoryName",' +
                                'code: "data.form.details."+_rowIndex+".inventoryCode",' +
                                'unitId: "data.form.details."+_rowIndex+".unitId",' +
                                'unitName: "data.form.details."+_rowIndex+".unitName",' +
                                'periodEndQuantity: "data.form.details."+_rowIndex+".periodEndQuantity",' +
                                'periodEndAmount: "data.form.details."+_rowIndex+".periodEndAmount",' +
                                'quantity: "data.form.details."+_rowIndex+".quantity",' +
                                'price: "data.form.details."+_rowIndex+".price",' +
                                'amount: "data.form.details."+_rowIndex+".amount",' +
                                'gapQuantity: "data.form.details."+_rowIndex+".gapQuantity",' +
                                'gapAmount: "data.form.details."+_rowIndex+".gapAmount",' +
                                'specification: "data.form.details."+_rowIndex+".specification"}, "data.other.inventorys", _rowIndex, data.form.details[_rowIndex])}}',
                                // value: '{{data.form.details[_rowIndex].inventoryName}}',
                                // onFocus: '{{function(){$getInventorys(_rowIndex)}}}',
                                value: '{{(!$isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryName)}}',
                                children: '{{$renderSelectOption(_rowIndex, data.form.details[_rowIndex],"inventoryName")}}',
                                filterOption: '{{$filterOption}}',
                                dropdownFooter: {
                                    name: 'add',
                                    component: 'Button',
                                    type: 'primary',
                                    style: { width: '100%', borderRadius: '0' },
                                    children: '新增',
                                    onClick: "{{function(){$addArchive('inventory', _rowIndex, data.form.details[_rowIndex])}}}"
                                },
                                _excludeProps: '{{!$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }, {
                            name: 'specification',
                            component: 'DataGrid.Column',
                            columnKey: 'specification',
                            width: 110,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '规格型号'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.TextCell',
                                className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-inventory-amountMaterialList-cell-center'}}",
                                value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                                title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }, {
                            name: 'unit',
                            component: 'DataGrid.Column',
                            columnKey: 'unit',
                            width: 70,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '计量单位'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.TextCell',
                                className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-inventory-amountMaterialList-cell-center'}}",
                                value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                                title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }]
                    },{
                        name: 'tg2',
                        component: 'DataGrid.ColumnGroup',
                        header: '期末库存',
                        isColumnGroup: true,
                        children:[{
                            name: 'periodEndQuantity',
                            component: 'DataGrid.Column',
                            columnKey: 'periodEndQuantity',
                            width: 115,
                            // flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                // className: 'ant-form-item-required',
                                children: '数量'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.TextCell',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-amountMaterialList-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].periodEndQuantity,6, $isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].periodEndQuantity,6, $isFocus(_ctrlPath))}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }, {
                            name: 'periodEndAmount',
                            component: 'DataGrid.Column',
                            columnKey: 'periodEndAmount',
                            width: 115,
                            // flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '金额'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.TextCell',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-amountMaterialList-cell ttk-scm-app-inventory-amountMaterialList-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].periodEndAmount,2,$isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].periodEndAmount,2,$isFocus(_ctrlPath))}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }]
                    },{
                        name: 'tg3',
                        component: 'DataGrid.ColumnGroup',
                        header: '领料出库',
                        isColumnGroup: true,
                        children:[{
                            name: 'quantity',
                            component: 'DataGrid.Column',
                            columnKey: 'quantity',
                            width: 115,
                            // flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                // className: 'ant-form-item-required',
                                children: '数量'
                            },
                            cell: {
                                name: 'cell',
                                precision: 6,
                                component: 'Input.Number',
                                timeout: true,
                                interceptTab: true,
                                style:"{{data.form.details[_rowIndex] && data.form.details[_rowIndex].errorQuantity ? {border: '1px solid red'} : {}}}",
                                // style:"{{data.other.error[_rowIndex] && data.other.error[_rowIndex].quantity ? {border: '1px solid red'} : {}}}",
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-amountMaterialList-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,$isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,$isFocus(_ctrlPath))}}',
                                // onChange: '{{$calc("quantity", _rowIndex, data.form.details[_rowIndex])}}',
                                onBlur: '{{$calc("quantity", _rowIndex, data.form.details[_rowIndex])}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }, {
                            name: 'price',
                            component: 'DataGrid.Column',
                            columnKey: 'price',
                            width: 115,
                            // flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '单价'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.TextCell',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-amountMaterialList-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].price,6, $isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].price,6, $isFocus(_ctrlPath))}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }, {
                            name: 'amount',
                            component: 'DataGrid.Column',
                            columnKey: 'amount',
                            width: 115,
                            // flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '金额'
                            },
                            cell: {
                                name: 'cell',
                                precision: 2,
                                component: 'Input.Number',
                                timeout: true,
                                interceptTab: true,
                                // disabled: '{{!data.form.details[_rowIndex].price}}',
                                disabled:'{{$renderDisableAmount(data.form.details[_rowIndex], _rowIndex)}}',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-amountMaterialList-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].amount,2,$isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].amount,2,$isFocus(_ctrlPath))}}',
                                // onChange: '{{$calc("amount", _rowIndex,data.form.details[_rowIndex])}}',
                                onBlur: '{{$calc("amount", _rowIndex,data.form.details[_rowIndex])}}',
                                _power: '({rowIndex}) => rowIndex',
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'ttk-scm-app-inventory-amountMaterialList-cell-right',
                                children: '{{$sumColumn("amount")}}'
                            }
                        }]
                    },{
                        name: 'tg4',
                        component: 'DataGrid.ColumnGroup',
                        header: '库存缺口',
                        isColumnGroup: true,
                        children:[{
                            name: 'gapQuantity',
                            component: 'DataGrid.Column',
                            columnKey: 'gapQuantity',
                            width: 115,
                            // flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                // className: 'ant-form-item-required',
                                children: '数量'
                            },
                            cell: {
                                name: 'cell',
                                // precision: 6,
                                component: 'DataGrid.TextCell',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-amountMaterialList-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].gapQuantity,6,$isFocus(_ctrlPath), "gap")}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].gapQuantity,6,$isFocus(_ctrlPath), "gap")}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        },{
                            name: 'gapAmount',
                            component: 'DataGrid.Column',
                            columnKey: 'gapAmount',
                            width: 115,
                            // flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                // className: '{{$renderClass()}}',
                                children: '金额'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.TextCell',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-amountMaterialList-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].gapAmount,2,$isFocus(_ctrlPath), "gap")}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].gapAmount,2,$isFocus(_ctrlPath), "gap")}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }]
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
            form:{
                details:[
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail
                ]
            },
            other:{
                detailHeight: 8,
                inventorys: [],
                inventoryItem: {},
                error:{}
            }
		}
	}
}

export const blankDetail = {
    inventoryId: undefined,
    inventoryCode: undefined,
    inventoryName: undefined,
    specification: null,
    unit: null,
    periodEndQuantity: null, // 期末数量
    periodEndAmount: null, //期末金额
    quantity: null,
    price: null,
    amount: null,
    gapQuantity: null,
    gapAmount: null, //缺口 金额
}