import { fromJS } from "immutable";
/**
 * 原数据
 */
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-calculationcost',
        children: [{
            name: 'content',
            component: 'Layout',
            className: 'ttk-gl-app-calculationcost-content',
            children: [{
                name: 'calcCostQuery',
                title: 'calcCostQuery',
                component: 'SearchCard',
                refName: 'calcCostQuery',
                didMount: '{{function(childrenRef){$getSearchCard(childrenRef)}}}',
                searchClick: '{{function(value){$searchValueChange(value)}}}',
                clearClick: '{{function(value){$clearValueChange(value)}}}',
                onChange: '{{function(value){$searchValueChange(value)}}}',
                refreshBtn: {
                    name: 'refreshBtn',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    type: 'shuaxin',
                    title: '刷新',
                    onClick: '{{$refresh}}'
                },
                confirmBtn: {
                    hidden: false,
                    text: '查询'
                },
                cancelBtn: {
                    hidden: false,
                    text: '取消'
                },
                clearBtn: {
                    hidden: false,
                    text: '重置'
                },
                menuBtn: [{
                    name: 'radiogroup',
                    component: 'Radio.Group',
                    _visible: '{{$isShow()}}',
                    onChange: '{{function(e){$handleFieldChange("data.other.radioValue",e.target.value)}}}',
                    value: '{{data.other.radioValue}}',
                    children: [{
                        name: 'radio1',
                        component: 'Radio',
                        value: '0',
                        children: '当前余额结转'
                    }, {
                        name: 'radio2',
                        component: 'Radio',
                        value: '1',
                        children: '本期入库结转'
                    }]
                }, {
                    name: 'pickingType',
                    component: 'Select',
                    className: 'pickingtype',
                    showSearch: true,
                    value: '{{data.other.pickingType}}',
                    _visible: '{{$isShowPickingType()}}',
                    onChange: `{{function(v){$sf('data.other.pickingType',v)}}}`,
                    children: {
                        name: 'option',
                        component: 'Select.Option',
                        className: 'selectitem',
                        value: '{{data.other.pickingTypes && data.other.pickingTypes[_rowIndex].id}}',
                        children: '{{data.other.pickingTypes && data.other.pickingTypes[_rowIndex].name}}',
                        _power: 'for in data.other.pickingTypes'
                    }
                }, {
                    name: 'showPreAdd',
                    component: 'Button',
                    children: '{{data.other.showPreAdd ? "取消暂估入库" : "暂估入库"}}',
                    _visible: '{{data.other.businessType==5000040024 ? false : true}}',
                    className: 'btn',
                    onClick: '{{$preAddClick}}'
                }, {
                    name: 'print',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    className: 'dayin',
                    type: 'dayin',
                    _visible: '{{data.other.businessType==5000040024 ? false : true}}',
                    onClick: '{{$print}}',
                    title: '打印'
                }, {
                    name: 'export',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    className: 'daochu',
                    type: 'daochu',
                    title: '导出',
                    onClick: '{{$export}}'
                }],
                normalSearcChildren: {
                    name: 'nsfilter',
                    component: '::div',
                    className: 'nsfilter',
                    children: [{
                        name: 'searchtype',
                        component: 'Select',
                        className: 'searchtype',
                        showSearch: true,
                        value: '{{data.searchValue.simpleType}}',
                        onChange: `{{function(v){$sf('data.searchValue.simpleType',v)}}}`,
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            className: 'selectitem',
                            value: '{{data.searchTypes && data.searchTypes[_rowIndex].key}}',
                            children: '{{data.searchTypes &&data.searchTypes[_rowIndex].value}}',
                            _power: 'for in data.searchTypes'
                        }
                    }, {
                        name: 'simpleValue',
                        component: 'Input.Search',
                        showSearch: true,
                        value: '{{data.searchValue.simpleValue}}',
                        onChange: `{{function(e){$setField('data.searchValue.simpleValue',e.target.value)}}}`,
                        placeholder: '编码/名称/金额/数量',
                        onSearch: `{{$onSearch}}`
                    }]
                },
                normalSearch: [],
                moreSearch: '{{data.searchValue}}',
                moreSearchItem: [{
                    name: 'inventorys',
                    label: `{{data.other.businessType==5000040026?"存货材料":"存货科目"}}`,
                    type: 'Select',
                    childType: 'Option',
                    mode: "multiple",
                    filterOption: true,
                    option: '{{data.other.inventoryList}}',
                    allowClear: false
                }, {
                    name: 'hideAmountZero',
                    type: 'Checkbox.Group',
                    render: '{{$renderCheckBox}}'
                }]
            },
            {
                component: '::span',
                name: 'spshow',
                _visible: '{{$isShow("spshow")}}',
                className: 'spshow',
                children: '{{data.other.spshow}}'
            },
            {
                name: 'gridcontent0',
                component: '::div',
                className: "ttk-gl-app-calculationcost-gridcontent",
                onMouseDown: '{{$mousedown}}',
                _visible: `{{data.other.businessType==5000040005||data.other.businessType==5000040026}}`,
                children: rowGridColumnsCost
            }, {
                name: 'gridcontent1',
                component: '::div',
                className: "ttk-gl-app-calculationcost-gridcontent",
                onMouseDown: '{{$mousedown}}',
                _visible: `{{data.other.businessType==5000040024}}`,
                children: rowGridColumnsProduce
            }
            ]
        }, {
            name: 'footer',
            component: 'Layout',
            className: 'ttk-gl-app-calculationcost-footer',
            children: {
                name: 'footer',
                component: '::div',
                className: 'footbtn',
                children: [{
                    name: 'save',
                    component: 'Button',
                    children: '保存',
                    disabled: '{{data.other.isEdit?true:data.other.btnDisabled}}',
                    type: "primary",
                    className: 'btn',
                    onClick: '{{$handleSave}}'
                }, {
                    name: 'reset',
                    component: 'Button',
                    children: '重新测算',
                    disabled: '{{data.other.isEdit?true:data.other.btnDisabled}}',
                    className: 'btn',
                    onClick: '{{$handleReset}}'
                }, {
                    name: 'cancel',
                    component: 'Button',
                    children: '取消',
                    className: 'btn',
                    onClick: '{{$handleCancel}}'
                }]
            }
        }]
    }
}
/**
 * 初始化
 */
export function getInitState() {
    return {
        data: {
            form: {
                details: []
            },
            //保存、查询、筛选list
            saveFilterList: [],
            sortOrder: {
            },
            searchTypes: [
                { key: 'code', value: '编码' },
                { key: 'name', value: '名称' },
                { key: 'amount', value: '金额' },
                { key: 'quantity', value: '数量' }
            ],
            searchValue: {
                simpleType: 'code',
                simpleValue: '',
                inventorys: [],
                hideAmountZero: []
            },
            costTotalData: fromJS({
                proportion: 0,//结转比例               
                incomeAmountDouble: 0,//本期销售收入
                finishAmountDouble: 0,//预计本期销售成本
                costAmountDouble: 0,//生产成本余额
                productProportion: 0//成本分配系数(预计本期销售成本/生产成本余额)
            }),
            other: {
                spshow: '',
                showPreAdd: false,
                accountList: [],
                inventoryList: [],
                headList: fromJS([]),
                radioValue: '0',
                customAttribute: 0,
                btnDisabled: true,
                pickingType: 0,
                carryForwardMode: 5000090001,
                isEdit:false,
                pickingTypes: [{
                    id: 0,
                    name: '自制领料'
                }, {
                    id: 1,
                    name: '委外加工'
                }]
            }
        }
    }
}
/**
 * 销售成本、领料结转测算
 */
export const rowGridColumnsCost = {
    name: 'details',
    component: 'DataGrid',
    headerHeight: 35,
    rowHeight: 35,
    footerHeight: 35,
    groupHeaderHeight: 35,
    rowsCount: '{{data.form.details.length}}',
    readonly: false,
    enableSequence: true,
    startSequence: 1,
    sequenceFooter: {
        name: 'footer',
        component: 'DataGrid.Cell',
        children: '合计'
    },
    onKeyDown: '{{$gridKeydown}}',
    scrollToColumn: '{{data.other.tableScrollToColumn}}',
    scrollToRow: '{{data.other.tableScrollToRow}}',
    columns: [{
        name: 'tg0',
        component: 'DataGrid.ColumnGroup',
        header: '{{data.other.businessType==5000040005 ? "产品名称":"存货材料"}}',
        fixed: true,
        isColumnGroup: true,
        children: [{
            name: 'code',
            component: 'DataGrid.Column',
            columnKey: 'code',
            flexGrow: 1,
            width: 90,
            fixed: true,
            header: {
                name: 'header',
                component: 'TableSort',
                title: '编码',
                sortOrder: '{{data.sortOrder.code}}',
                handleClick: '{{function(value){$onSortChange("code",value)}}}',
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: "{{$getCellClassName(_ctrlPath)}}",
                value: '{{data.form.details[_rowIndex] &&data.form.details[_rowIndex].code}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'name',
            component: 'DataGrid.Column',
            columnKey: 'name',
            flexGrow: 1,
            width: 130,
            fixed: true,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '名称'
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: "{{$getCellClassName(_ctrlPath)}}",
                value: '{{data.form.details[_rowIndex] &&data.form.details[_rowIndex].name}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'unitName',
            component: 'DataGrid.Column',
            columnKey: 'unitName',
            flexGrow: 1,
            width: 60,
            fixed: true,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '单位'
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$getCellClassName(_ctrlPath)}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":data.form.details[_rowIndex].unitName}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }]
    }, {
        name: 'tg1',
        component: 'DataGrid.ColumnGroup',
        header: '期初数据',
        isColumnGroup: true,
        children: [{
            name: 'beginQuantity',
            component: 'DataGrid.Column',
            columnKey: 'beginQuantity',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '数量'
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$quantityFormat(data.form.details[_rowIndex].beginQuantity,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("beginQuantity")}}'
            }
        }, {
            name: 'beginAmount',
            component: 'DataGrid.Column',
            columnKey: 'beginAmount',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '金额'
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$amountFormat(data.form.details[_rowIndex].beginAmount,2,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("beginAmount")}}'
            }
        }]
    }, {
        name: 'tg2',
        component: 'DataGrid.ColumnGroup',
        header: '本期入库发生额',
        isColumnGroup: true,
        children: [{
            name: 'addQuantity',
            component: 'DataGrid.Column',
            columnKey: 'addQuantity',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '数量'
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$quantityFormat(data.form.details[_rowIndex].addQuantity,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("addQuantity")}}'
            }
        }, {
            name: 'addAmount',
            component: 'DataGrid.Column',
            columnKey: 'addAmount',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '金额'
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$amountFormat(data.form.details[_rowIndex].addAmount,2,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("addAmount")}}'
            }
        }]
    }, {
        name: 'tg3',
        component: 'DataGrid.ColumnGroup',
        header: '暂估入库',
        _visible: '{{data.other.showPreAdd}}',
        isColumnGroup: true,
        children: [{
            name: 'preAddQuantity',
            component: 'DataGrid.Column',
            columnKey: 'preAddQuantity',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '数量'
            },
            cell: {
                name: 'cell',
                precision: 6,
                component: '{{!data.form.details[_rowIndex].isCalcQuantity?"DataGrid.TextCell":$isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                _visible: '{{data.other.showPreAdd}}',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$quantityFormat(data.form.details[_rowIndex].preAddQuantity,6,!data.form.details[_rowIndex].isCalcQuantity?false:$isFocus(_ctrlPath))}}',
                title: '{{$quantityFormat(data.form.details[_rowIndex].preAddQuantity,6,false)}}',
                onChange: '{{$calcQuantityAmount("preAddQuantity", _rowIndex, data.form.details[_rowIndex])}}',
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("preAddQuantity")}}'
            }
        }, {
            name: 'preAddAmount',
            component: 'DataGrid.Column',
            columnKey: 'preAddAmount',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '金额'
            },
            cell: {
                name: 'cell',
                precision: 2,
                component: '{{$isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                _visible: '{{data.other.showPreAdd}}',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$amountFormat(data.form.details[_rowIndex].preAddAmount,2,$isFocus(_ctrlPath))}}',
                title: '{{$amountFormat(data.form.details[_rowIndex].preAddAmount,2,false)}}',
                onChange: '{{$calcQuantityAmount("preAddAmount", _rowIndex, data.form.details[_rowIndex])}}',
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("preAddAmount")}}'
            }
        }]
    }, {
        name: 'tg4',
        component: 'DataGrid.ColumnGroup',
        header: '{{data.other.businessType==5000040005 ? "本期结转成本":"本期领料成本"}}',
        isColumnGroup: true,
        children: [{
            name: 'subPrice',
            component: 'DataGrid.Column',
            columnKey: 'subPrice',
            width: 108,
            flexGrow: 1,
            _visible: '{{data.other.carryForwardMode==5000090002?true:false}}',
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '单价'
            },
            cell: {
                name: 'cell',
                precision: 6,
                component: 'DataGrid.TextCell',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$quantityFormat(data.form.details[_rowIndex].subPrice,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("subPrice")}}'
            }
        }, {
            name: 'subQuantity',
            component: 'DataGrid.Column',
            columnKey: 'subQuantity',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'TableSort',
                title: '数量',
                sortOrder: '{{data.sortOrder.subQuantity}}',
                handleClick: '{{function(value){$onSortChange("subQuantity",value)}}}',
            },
            cell: {
                name: 'cell',
                precision: 6,
                component: '{{!data.form.details[_rowIndex].isCalcQuantity?"DataGrid.TextCell":$isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$quantityFormat(data.form.details[_rowIndex].subQuantity,6,!data.form.details[_rowIndex].isCalcQuantity?false:$isFocus(_ctrlPath))}}',
                title: '{{$quantityFormat(data.form.details[_rowIndex].subQuantity,6,false)}}',
                onChange: '{{$calcQuantityAmount("subQuantity", _rowIndex, data.form.details[_rowIndex])}}',
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("subQuantity")}}'
            }
        }, {
            name: 'subAmount',
            component: 'DataGrid.Column',
            columnKey: 'subAmount',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'TableSort',
                title: '金额',
                sortOrder: '{{data.sortOrder.subAmount}}',
                handleClick: '{{function(value){$onSortChange("subAmount",value)}}}',
            },
            cell: {
                name: 'cell',
                precision: 2,
                component: '{{$isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$amountFormat(data.form.details[_rowIndex].subAmount,2,$isFocus(_ctrlPath))}}',
                title: '{{$amountFormat(data.form.details[_rowIndex].subAmount,2,false)}}',
                onChange: '{{$calcQuantityAmount("subAmount", _rowIndex, data.form.details[_rowIndex])}}',
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("subAmount")}}'
            }
        }]
    }, {
        name: 'tg5',
        component: 'DataGrid.ColumnGroup',
        header: '结转后余额',
        isColumnGroup: true,
        children: [{
            name: 'endQuantity',
            component: 'DataGrid.Column',
            columnKey: 'endQuantity',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'TableSort',
                title: '数量',
                sortOrder: '{{data.sortOrder.endQuantity}}',
                handleClick: '{{function(value){$onSortChange("endQuantity",value)}}}',
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$quantityFormat(data.form.details[_rowIndex].endQuantity,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("endQuantity")}}'
            }
        }, {
            name: 'endPrice',
            component: 'DataGrid.Column',
            columnKey: 'endPrice',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '单价'
            },
            cell: {
                name: 'cell',
                precision: 6,
                component: 'DataGrid.TextCell',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$quantityFormat(data.form.details[_rowIndex].endPrice,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'endAmount',
            component: 'DataGrid.Column',
            columnKey: 'endAmount',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'TableSort',
                title: '金额',
                sortOrder: '{{data.sortOrder.endAmount}}',
                handleClick: '{{function(value){$onSortChange("endAmount",value)}}}',
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$amountFormat(data.form.details[_rowIndex].endAmount,2,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("endAmount")}}'
            }
        }]
    }]
}
/**
 * 生产入库结转
 */
export const rowGridColumnsProduce = {
    name: 'details',
    component: 'DataGrid',
    headerHeight: 50,
    rowHeight: 35,
    footerHeight: 35,
    groupHeaderHeight: 35,
    rowsCount: '{{data.form.details.length}}',
    readonly: false,
    onKeyDown: '{{$gridKeydown}}',
    scrollToColumn: '{{data.other.tableScrollToColumn}}',
    scrollToRow: '{{data.other.tableScrollToRow}}',
    columns: [{
        name: 'tg10',
        component: 'DataGrid.ColumnGroup',
        header: '产品名称',
        fixed: true,
        isColumnGroup: true,
        children: [{
            name: 'code',
            component: 'DataGrid.Column',
            columnKey: 'code',
            flexGrow: 1,
            width: 90,
            fixed: true,
            header: {
                name: 'header',
                component: 'TableSort',
                title: '编码',
                sortOrder: '{{data.sortOrder.code}}',
                handleClick: '{{function(value){$onSortChange("code",value,"produce")}}}',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath)}}',
                value: '{{data.form.details[_rowIndex] &&data.form.details[_rowIndex].code}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'name',
            component: 'DataGrid.Column',
            columnKey: 'name',
            flexGrow: 1,
            width: 130,
            fixed: true,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '名称',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath)}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":data.form.details[_rowIndex].name}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                children: '合计'
            }
        }, {
            name: 'unitName',
            component: 'DataGrid.Column',
            columnKey: 'unitName',
            flexGrow: 1,
            width: 60,
            fixed: true,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '单位',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath)}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":data.form.details[_rowIndex].unitName}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }]
    }, {
        name: 'tg11',
        component: 'DataGrid.ColumnGroup',
        header: '产成品期初',
        isColumnGroup: true,
        children: [{
            name: 'beginQuantity',
            component: 'DataGrid.Column',
            columnKey: 'beginQuantity',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '数量',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$quantityFormat(data.form.details[_rowIndex].beginQuantity,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'beginPrice',
            component: 'DataGrid.Column',
            columnKey: 'beginPrice',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '单价',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$quantityFormat(data.form.details[_rowIndex].beginPrice,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'beginAmount',
            component: 'DataGrid.Column',
            columnKey: 'beginAmount',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '金额',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$amountFormat(data.form.details[_rowIndex].beginAmount,2,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }]
    }, {
        name: 'tg12',
        component: 'DataGrid.ColumnGroup',
        header: '本月销售',
        isColumnGroup: true,
        children: [{
            name: 'saleQuantity',
            component: 'DataGrid.Column',
            columnKey: 'saleQuantity',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '销售数量',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: '::div',
                children: '{{$renderCellContent(_rowIndex, _ctrlPath, "saleQuantity",data.form.details[_rowIndex],data.form.details[_rowIndex].saleQuantity)}}',
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'salePrice',
            component: 'DataGrid.Column',
            columnKey: 'salePrice',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '销售单价',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$quantityFormat(data.form.details[_rowIndex].salePrice,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'saleAmount',
            component: 'DataGrid.Column',
            columnKey: 'saleAmount',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '销售收入',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: '::div',
                children: '{{$renderCellContent(_rowIndex, _ctrlPath, "saleAmount",data.form.details[_rowIndex],data.form.details[_rowIndex].saleAmount)}}',
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("saleAmount")}}'
            }
        }]
    }, {
        name: 'tg13',
        component: 'DataGrid.ColumnGroup',
        header: '本月完工',
        isColumnGroup: true,
        children: [{
            name: 'finishQuantity',
            component: 'DataGrid.Column',
            columnKey: 'finishQuantity',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '完工数量',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: '::div',
                children: '{{$renderCellContent(_rowIndex, _ctrlPath, "finishQuantity",data.form.details[_rowIndex],data.form.details[_rowIndex].finishQuantity)}}',
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'finishAmount',
            component: 'DataGrid.Column',
            columnKey: 'finishAmount',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '完工产值',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$amountFormat(data.form.details[_rowIndex].finishAmount,2,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("finishAmount")}}'
            }
        }, {
            name: 'finishProportion',
            component: 'DataGrid.Column',
            columnKey: 'finishProportion',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '产值百分比',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$quantityFormat(data.form.details[_rowIndex].finishProportion,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }]
    }, {
        name: 'tg14',
        component: 'DataGrid.ColumnGroup',
        header: '生产成本',
        isColumnGroup: true,
        children: '{{$renderDynamicCols(_ctrlPath)}}'
    }, {
        name: 'tg15',
        component: 'DataGrid.ColumnGroup',
        header: '单位成本',
        isColumnGroup: true,
        children: [{
            name: 'price',
            component: 'DataGrid.Column',
            columnKey: 'price',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '单价',
                className: "sw"
            },
            cell: {
                name: 'cell',
                precision: 6,
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$quantityFormat(data.form.details[_rowIndex].price,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }]
    }, {
        name: 'tg16',
        component: 'DataGrid.ColumnGroup',
        header: '期末结存',
        isColumnGroup: true,
        children: [{
            name: 'endQuantity',
            component: 'DataGrid.Column',
            columnKey: 'endQuantity',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'TableSort',
                title: '数量',
                sortOrder: '{{data.sortOrder.endQuantity}}',
                handleClick: '{{function(value){$onSortChange("endQuantity",value,"produce")}}}',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$quantityFormat(data.form.details[_rowIndex].endQuantity,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'endPrice',
            component: 'DataGrid.Column',
            columnKey: 'endPrice',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '单价',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$quantityFormat(data.form.details[_rowIndex].endPrice,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'endAmount',
            component: 'DataGrid.Column',
            columnKey: 'endAmount',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'TableSort',
                title: '金额',
                sortOrder: '{{data.sortOrder.endAmount}}',
                handleClick: '{{function(value){$onSortChange("endAmount",value,"produce")}}}',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$amountFormat(data.form.details[_rowIndex].endAmount,2,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            },
            footer: {
                name: 'footer',
                component: 'DataGrid.Cell',
                className: 'ttk-gl-app-calculationcost-cell-right',
                children: '{{$sumColumn("endAmount")}}'
            }
        }, {
            name: 'grossRate',
            component: 'DataGrid.Column',
            columnKey: 'grossRate',
            width: 108,
            flexGrow: 1,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: '毛利率',
                className: "sw"
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$isShowLine(data.form.details[_rowIndex])?"ttk-gl-app-calculationcost-cell-topTwo":$getCellClassName(_ctrlPath) + " ttk-gl-app-calculationcost-cell-right"}}',
                value: '{{$isShowLine(data.form.details[_rowIndex])?"—":$quantityFormat(data.form.details[_rowIndex].grossRate,6,false)}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }]
    }]
}