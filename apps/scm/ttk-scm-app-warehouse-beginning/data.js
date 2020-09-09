import { consts, common } from 'edf-constant'
import moment from 'moment'
import { fromJS } from 'immutable'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-scm-app-warehouse-beginning',
        id: 'ttk-scm-app-warehouse-beginning',
        onMouseDown: '{{$mousedown}}',
        children: [{
            name: 'radioGroup',
            component: 'Radio.Group',
            buttonStyle: 'solid',
            onChange: '{{$handleAccountRadioValueChange}}',
            //  value: '{{data.other.accountRadioValue}}',
            children: [
                {
                    name: 'radioButton1',
                    component: 'Radio.Button',
                    className: '{{data.start ? "classChoiceName" : ""}}',
                    children: ' 存货期初',
                    value: '1'
                },
                {
                    name: 'radioButton2',
                    component: 'Radio.Button',
                    className: '{{data.start ? "" : "classChoiceName"}}',
                    children: ' 暂估期初',
                    value: '2'
                },
            ]
        }, {
            name: 'header',
            component: 'Layout',
            className: 'ttk-scm-app-warehouse-beginning-header',
            _visible: '{{data.start}}',
            children: [{
                name: 'right',
                component: 'Form',
                className: 'ttk-scm-app-warehouse-beginning-header-left',
                children: [{
                    name: 'date',
                    component: '::span',
                    className: 'leftDate',
                    children: '启用月份'
                }, {
                    name: 'date',
                    component: 'DatePicker.MonthPicker',
                    disabled: true,
                    value: '{{$stringToMoment(data.other.beginDate)}}',
                }, {
                    name: 'inventoryProperty',
                    component: 'Select',
                    showSearch: false,
                    placeholder: '存货分类',
                    allowClear: true,
                    className: 'ttk-scm-app-warehouse-beginning-selectL',
                    value: '{{data.form.inventoryProperty}}',
                    onChange: `{{function(v){$getBeginList(data.other.inventoryProperty.filter(function(o){return o.id == v})[0])}}}`,
                    children: {
                        name: 'option',
                        component: 'Select.Option',
                        value: "{{data.other.inventoryProperty && data.other.inventoryProperty[_rowIndex].id}}",
                        title: "{{data.other.inventoryProperty && data.other.inventoryProperty[_rowIndex].name}}",
                        children: '{{data.other.inventoryProperty && data.other.inventoryProperty[_rowIndex].name}}',
                        _power: 'for in data.other.inventoryProperty'
                    }
                }, {
                    name: 'inventoryName',
                    component: 'Input.Search',
                    showSearch: true,
                    placeholder: '名称/规格型号/编码',
                    value: '{{data.other.searchInput}}',
                    className: 'ttk-scm-app-warehouse-beginning-selectR',
                    onChange: `{{function(v){$searchList(v.target.value)}}}`,
                }, {
                    name: 'refreshBtn',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    type: 'shuaxin',
                    title: '刷新',
                    className: 'reload',
                    onClick: '{{$refresh}}'
                }]
            }, {
                name: 'right',
                component: 'Layout',
                className: 'ttk-scm-app-warehouse-beginning-header-right',
                children: [{
                    name: 'stop',
                    component: 'Button',
                    className: 'ttk-scm-app-warehouse-beginning-header-right-but',
                    _visible: false,
                    children: '停用'
                }, {
                    name: 'add',
                    component: 'Button',
                    onClick: '{{$btnInvAccount}}',
                    className: 'ttk-scm-app-warehouse-beginning-header-right-but',
                    children: '存货台账'
                },{
                    name: 'addInventory',
                    component: 'Button',   
                    onClick: '{{$addInventory}}',
                    children: '新增存货档案'
                }, {
                    name: 'synchronous',
                    component: 'Button',   
                    onClick: '{{$handSynchronous}}',
                    children: '同步'
                },{
                    name: 'save',
                    component: 'Button',   
                    onClick: '{{$save}}',
                    children: '保存'
                }, {
                    name: 'import',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    className: 'btn import daoru',
                    type: 'daoru',
                    title: '导入',
                    onClick: '{{$imports}}',
                    style: {
                        fontSize: 28,
                        lineHeight: '28px'
                    },
                }, {
                    name: 'print',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    className: 'btn print dayin',
                    type: 'dayin',
                    onClick: '{{$print}}',
                    title: '打印',
                    style: {
                        fontSize: 28,
                        lineHeight: '30px'
                    },
                }, {
                    name: 'export',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    className: 'btn export daoru',
                    type: 'daochu',
                    title: '导出',
                    onClick: '{{$export}}',
                    style: {
                        fontSize: 28,
                        lineHeight: '28px'
                    },
                }]
            }]
        }, {
            name: 'content',
            component: 'Layout',
            className: 'ttk-scm-app-warehouse-beginning-content',
            _visible: '{{data.start}}',
            children: {
                name: 'details',
                component: 'DataGrid',
                loading: '{{data.loading}}',
                className: 'ttk-scm-app-warehouse-beginning-form-details',
                headerHeight: 35,
                rowHeight: 35,
                rowsCount: '{{data.form.details.length}}',
                columns: [{
                    name: 'seq',
                    component: 'DataGrid.Column',
                    columnKey: 'seq',
                    width: 41,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '序号'
                    },
                    cell: {
                        name: 'cell',
                        component: "DataGrid.Cell",
                        value: "{{Number(_rowIndex) + 1}}",
                        _power: '({rowIndex})=>rowIndex',
                    }
                }, {
                    name: 'code',
                    component: 'DataGrid.Column',
                    columnKey: 'code',
                    flexGrow: 1,
                    width: 100,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '存货编码'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        className: 'cellLeft',
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].code}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].code}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'name',
                    component: 'DataGrid.Column',
                    columnKey: 'name',
                    flexGrow: 1,
                    width: 100,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '存货名称'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        className: 'cellLeft',
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'propertyName',
                    component: 'DataGrid.Column',
                    columnKey: 'propertyName',
                    flexGrow: 1,
                    width: 100,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '存货分类'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        className: 'cellLeft',
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].propertyName}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].propertyName}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'specification',
                    component: 'DataGrid.Column',
                    columnKey: 'specification',
                    flexGrow: 1,
                    width: 100,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '规格型号'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        className: 'cellLeft',
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'unitName',
                    component: 'DataGrid.Column',
                    columnKey: 'unitName',
                    width: 90,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '计量单位'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'quantity',
                    component: 'DataGrid.Column',
                    columnKey: 'quantity',
                    width: 140,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '期初数量'
                    },
                    cell: {
                        name: 'cell',
                        precision: 6,
                        component: "Input.Number",
                        disabled: '{{data.other.isMonthlyClosed}}',
                        className: '{{data.form.style[_rowIndex] && data.form.style[_rowIndex].quantityStyle ? "redBorder" : ""}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,$isFocus(_ctrlPath))}}',
                        onChange: '{{$calc("quantity", _rowIndex, data.form.details[_rowIndex])}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'price',
                    component: 'DataGrid.Column',
                    columnKey: 'price',
                    width: 140,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '单价'
                    },
                    cell: {
                        name: 'cell',
                        precision: 6,
                        component: "Input.Number",
                        disabled: '{{data.other.isMonthlyClosed}}',
                        className: '{{data.form.style[_rowIndex] && data.form.style[_rowIndex].priceStyle ? "redBorder" : ""}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].price,6,$isFocus(_ctrlPath))}}',
                        onChange: '{{$calc("price", _rowIndex,data.form.details[_rowIndex])}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'amount',
                    component: 'DataGrid.Column',
                    columnKey: 'amount',
                    width: 140,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '期初金额'
                    },
                    cell: {
                        name: 'cell',
                        component: 'Input.Number',
                        precision: 2,
                        disabled: '{{data.other.isMonthlyClosed}}',
                        className: '{{data.form.style[_rowIndex] && data.form.style[_rowIndex].amountStyle ? "redBorder" : ""}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].amount,2,$isFocus(_ctrlPath))}}',
                        onChange: '{{$calc("amount", _rowIndex,data.form.details[_rowIndex])}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }
                ]
            }
        }, {
            name: 'header1',
            component: 'Layout',
            className: 'ttk-scm-app-estimate-beginning-header',
            _visible: '{{!data.start}}',
            children: [{
                name: 'right',
                component: 'Form',
                className: 'ttk-scm-app-estimate-beginning-header-left',
                children: [{
                    name: 'date',
                    component: '::span',
                    className: 'leftDate',
                    children: '启用月份'
                }, {
                    name: 'date',
                    component: 'DatePicker.MonthPicker',
                    disabled: true,
                    value: '{{$stringToMoment(data.other.beginDate)}}',
                }, {
                    name: 'inventoryProperty',
                    component: 'Select',
                    showSearch: false,
                    placeholder: '存货分类',
                    allowClear: true,
                    className: 'ttk-scm-app-estimate-beginning-selectL',
                    value: '{{data.form.estimateInventoryProperty}}',
                    onChange: `{{function(v){$getBeginListEstimate(data.other.inventoryProperty.filter(function(o){return o.id == v})[0])}}}`,
                    children: {
                        name: 'option',
                        component: 'Select.Option',
                        value: "{{data.other.inventoryProperty && data.other.inventoryProperty[_rowIndex].id}}",
                        title: "{{data.other.inventoryProperty && data.other.inventoryProperty[_rowIndex].name}}",
                        children: '{{data.other.inventoryProperty && data.other.inventoryProperty[_rowIndex].name}}',
                        _power: 'for in data.other.inventoryProperty'
                    }
                }, {
                    name: 'inventoryName',
                    component: 'Input.Search',
                    showSearch: true,
                    placeholder: '名称/规格型号/编码',
                    value: '{{data.form.searchInputEstimate}}',
                    className: 'ttk-scm-app-estimate-beginning-selectR',
                    onChange: `{{function(v){$searchListEstimate(v.target.value)}}}`,
                }, {
                    name: 'refreshBtn',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    type: 'shuaxin',
                    title: '刷新',
                    className: 'reload',
                    onClick: '{{$refreshEstimate}}'
                }]
            }, {
                name: 'right',
                component: 'Layout',
                className: 'ttk-scm-app-estimate-beginning-header-right',
                children: [{
                    name: 'add',
                    component: 'Button',
                    onClick: '{{ function(){ $addClick() } }}',
                    className: 'ttk-scm-app-estimate-beginning-header-right-but',
                    children: '新增'
                },{
                    name: 'saveEstimate',
                    component: 'Button',   
                    onClick: '{{$saveEstimate}}',
                    children: '保存'
                }, {
                    name: 'import',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    className: 'btn import daoru',
                    type: 'daoru',
                    title: '导入',
                    onClick: '{{$importsEstimate}}',
                    style: {
                        fontSize: 28,
                        lineHeight: '28px'
                    },
                }, {
                    name: 'printEstimate',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    className: 'btn print dayin',
                    type: 'dayin',
                    onClick: '{{$printEstimate}}',
                    title: '打印',
                    style: {
                        fontSize: 28,
                        lineHeight: '30px'
                    },
                }, {
                    name: 'exportEstimate',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    className: 'btn export daoru',
                    type: 'daochu',
                    title: '导出',
                    onClick: '{{$exportEstimate}}',
                    style: {
                        fontSize: 28,
                        lineHeight: '28px'
                    },
                }]
            }]
        }, {
            name: 'content1',
            component: 'Layout',
            className: 'ttk-scm-app-estimate-beginning-content',
            _visible: '{{!data.start}}',
            children: {
                name: 'details',
                component: 'DataGrid',
                loading: '{{data.loading}}',
                className: 'ttk-scm-app-estimate-beginning-form-details',
                headerHeight: 35,
                rowHeight: 35,
                rowsCount: '{{data.form.estimateList.length}}',
                columns: [{
                    name: 'seq1',
                    component: 'DataGrid.Column',
                    columnKey: 'seq1',
                    width: 41,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '序号'
                    },
                    cell: {
                        name: 'cell',
                        component: "DataGrid.Cell",
                        value: "{{Number(_rowIndex) + 1}}",
                        _power: '({rowIndex})=>rowIndex',
                    }
                }, {
                    name: 'propertyName',
                    component: 'DataGrid.Column',
                    columnKey: 'propertyName',
                    flexGrow: 1,
                    width: 138,
                    header: {
                        name: 'header',
                        className: 'ant-form-item-center ant-form-item-required',
                        component: 'DataGrid.Cell',
                        children: '存货分类'
                    },
                    cell: {
                        name: 'cell',
                        component: 'Select',
                        className: "{{$redCellBorder('propertyNameStyle',_rowIndex)}}",
                        showSearch: true,
                        allowClear: true,
                        value: '{{data.form.estimateList[_rowIndex] && data.form.estimateList[_rowIndex].propertyId}}',
                        onChange: '{{function(value){$onFieldChangeEstimate("propertyId",_rowIndex,value)}}}',  
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.inventoryProperty && data.other.inventoryProperty[_lastIndex].id}}',
                            title: '{{data.other.inventoryProperty && data.other.inventoryProperty[_lastIndex].name}}',
                            children: '{{data.other.inventoryProperty && data.other.inventoryProperty[_lastIndex].name}}',
                            _power: 'for in data.other.inventoryProperty'
                        },
                        _power: '({rowIndex})=>rowIndex',
                    }
                },{
                    name: 'code',
                    component: 'DataGrid.Column',
                    columnKey: 'code',
                    flexGrow: 1,
                    width: 100,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '存货编码'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        className: 'cellLeft',
                        value: '{{data.form.estimateList[_rowIndex] && data.form.estimateList[_rowIndex].inventoryCode}}',
                        title: '{{data.form.estimateList[_rowIndex] && data.form.estimateList[_rowIndex].inventoryCode}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'name1',
                    component: 'DataGrid.Column',
                    columnKey: 'name1',
                    flexGrow: 1,
                    width: 138,
                    header: {
                        name: 'header',
                        className: 'ant-form-item-center ant-form-item-required',
                        component: 'DataGrid.Cell',
                        children: '存货名称'
                    },
                    cell: {
                        name: 'cell',
                        component: 'Select',
                        showSearch: true,
                        allowClear: true,
                        className: "{{$redCellBorder('name1Style',_rowIndex)}}",
                        // value: '{{data.form.estimateList[_rowIndex] && data.form.estimateList[_rowIndex].inventoryId}}',
                        value: '{{$isFocus(_ctrlPath) ? data.form.estimateList[_rowIndex].inventoryId : data.form.estimateList[_rowIndex].inventoryName}}',
                        onChange: '{{function(value){$onFieldChangeEstimate("inventoryId",_rowIndex,value)}}}',
                        onFocus: '{{function(){$getFocusInventory(_rowIndex, data.form.estimateList[_rowIndex])}}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                            title: '{{data.other.inventory && data.other.inventory[_lastIndex].code +" "+ data.other.inventory[_lastIndex].name}}',
                            children: '{{data.other.inventory && data.other.inventory[_lastIndex].code +" "+ data.other.inventory[_lastIndex].name}}',
                            _power: 'for in data.other.inventory'
                        },
                        dropdownFooter: {
                            name: 'add1',
                            component: 'Button',
                            type: 'primary',
                            style: { width: '100%', borderRadius: '0' },
                            children: '新增',
                            onClick: '{{function(value){$addArchive("inventory",_rowIndex,"inventory")}}}',
                        },
                        _power: '({rowIndex}) => rowIndex',
                    }
                },{
                    name: 'specification',
                    component: 'DataGrid.Column',
                    columnKey: 'specification',
                    flexGrow: 1,
                    width: 90,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '规格型号'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        className: 'cellLeft',
                        value: '{{data.form.estimateList[_rowIndex] && data.form.estimateList[_rowIndex].specification}}',
                        title: '{{data.form.estimateList[_rowIndex] && data.form.estimateList[_rowIndex].specification}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'unitName',
                    component: 'DataGrid.Column',
                    columnKey: 'unitName',
                    width: 90,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '计量单位'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        value: '{{data.form.estimateList[_rowIndex] && data.form.estimateList[_rowIndex].unitName}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'supplier',
                    component: 'DataGrid.Column',
                    columnKey: 'supplierName',
                    flexGrow: 1,
                    width: 138,
                    header: {
                        name: 'header',
                        className: 'ant-form-item-center ant-form-item-required',
                        component: 'DataGrid.Cell',
                        children: '供应商'
                    },
                    cell: {
                        name: 'cell',
                        component: 'Select',
                        showSearch: true,
                        allowClear: true,
                        className: "{{$redCellBorder('supplierStyle',_rowIndex)}}",
                        value: '{{data.form.estimateList[_rowIndex] && data.form.estimateList[_rowIndex].supplierId}}',
                        onChange: '{{function(value){$onFieldChangeEstimate("supplierId",_rowIndex,value)}}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            key: '{{data.other.supplier && data.other.supplier[_lastIndex].id }}',
                            value: '{{data.other.supplier && data.other.supplier[_lastIndex].id }}',
                            title: '{{data.other.supplier && data.other.supplier[_lastIndex].code +" "+ data.other.supplier[_lastIndex].name}}',
                            children: '{{data.other.supplier && data.other.supplier[_lastIndex].code +" "+ data.other.supplier[_lastIndex].name}}',
                            _power: 'for in data.other.supplier'
                        },
                        dropdownFooter: {
                            name: 'add1',
                            component: 'Button',
                            type: 'primary',
                            style: { width: '100%', borderRadius: '0' },
                            children: '新增',
                            onClick: '{{function(value){$addArchive("supplier",_rowIndex)}}}',
                        },
                        _power: '({rowIndex}) => rowIndex',
                    }
                },{
                    name: 'quantity',
                    component: 'DataGrid.Column',
                    columnKey: 'quantity',
                    width: 140,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '期初数量'
                    },
                    cell: {
                        name: 'cell',
                        precision: 6,
                        component: "Input.Number",
                        className: '{{data.form.style[_rowIndex] && data.form.style[_rowIndex].quantityStyle ? "redBorder" : ""}}',
                        value: '{{$quantityFormat(data.form.estimateList[_rowIndex].quantity,6,$isFocus(_ctrlPath),true)}}',
                        onChange: '{{$calcEstimate("quantity", _rowIndex, data.form.estimateList[_rowIndex])}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'price',
                    component: 'DataGrid.Column',
                    columnKey: 'price',
                    width: 140,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '单价'
                    },
                    cell: {
                        name: 'cell',
                        precision: 6,
                        component: "Input.Number",
                        disabled: '{{data.other.isMonthlyClosed}}',
                        className: '{{data.form.style[_rowIndex] && data.form.style[_rowIndex].priceStyle ? "redBorder" : ""}}',
                        value: '{{$quantityFormat(data.form.estimateList[_rowIndex].price,6,$isFocus(_ctrlPath))}}',
                        onChange: '{{$calcEstimate("price", _rowIndex,data.form.estimateList[_rowIndex])}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'amount',
                    component: 'DataGrid.Column',
                    columnKey: 'amount',
                    width: 140,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '期初金额'
                    },
                    cell: {
                        name: 'cell',
                        component: 'Input.Number',
                        precision: 2,
                        disabled: '{{data.other.isMonthlyClosed}}',
                        className: '{{data.form.style[_rowIndex] && data.form.style[_rowIndex].amountStyle ? "redBorder" : ""}}',
                        value: '{{$quantityFormat(data.form.estimateList[_rowIndex].amount,2,$isFocus(_ctrlPath))}}',
                        onChange: '{{$calcEstimate("amount", _rowIndex,data.form.estimateList[_rowIndex])}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }
                ]
            }
        }]
    }
}

export function getInitState(option) {
    return {
        data: {
            addSave: false,
            start: true,
            loading: false,
            otherFormA: {
                details: [blankDetail],  // 原材料
                style: [blankStyle]
            },
            otherFormB: {
                details: [blankDetail],  // 商品 
                style: [blankStyle]
            },
            otherFormC: {
                details: [blankDetail],   // 周转材料
                style: [blankStyle]
            },
            otherFormD: {
                details: [blankDetail],   // 半成品
                style: [blankStyle]
            },
            otherFormAll: {
                details: [blankDetail],   // 全部
                style: [blankStyle]
            },
            form: {
                details: [
                    blankDetail
                ],
                style: [
                    blankStyle
                ],
                supplier: [],
                inventory: [],
                estimateList: []
            },
            total: {

            },
            other: {
                beginDate: moment().format('YYYY-MM'),
                detailHeight: '245px',
                inventoryProperty: [{
                    id: 1,
                    name: '商品'
                }],
                change: false,
                searchInput: '',
                otherFormBChange: false,
                otherFormAChange: false,
                otherFormDChange: false,
                otherFormCChange: false,
                otherFormAllChange: false,
                flag: '' , //是否启用存货明细 生成凭证设置
            },
        }
    }
}

export const blankDetail = {
    code: null,
    id: null,
    name: null,
    classification: null,
    propertyName: null,
    specification: null,
    unitName: null,
    quantity: null,
    price: null,
    amount: null,
}
export const blankStyle = {
    quantityStyle: null,
    priceStyle: null,
    amountStyle: null
}
