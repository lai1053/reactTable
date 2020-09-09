import { fromJS } from "immutable";

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-accountrelationsset',
        children: [{
            name: 'header',
            component: 'Layout',
            className: 'ttk-gl-app-accountrelationsset-header',
            children: [{
                name: 'batDels',
                component: 'Button',
                children: '批量删除',
                disabled: '{{$isbtnDisabled()}}',
                className: 'btn leftbtn',
                onClick: '{{$batDelsClick}}'
            }, {
                name: 'batEdits',
                component: 'Button',
                children: '批量修改',
                disabled: '{{$isbtnDisabled("batEdits")}}',
                className: 'btn',
                onClick: '{{$batEditsClick}}'
            }]
        }, {
            name: 'tabs',
            component: 'Tabs',
            className: 'tabs',
            activeKey: '{{data.other.accountType}}',
            defaultActiveKey: '0',
            _visible: `{{data.other.businessType==5000040024}}`,
            onChange: `{{function(v){$tabChange('data.other.accountType',v)}}}`,
            children: [{
                key: '0',
                component: 'Tabs.TabPane',
                tab: "存货及收入科目"
            }, {
                key: '1',
                component: 'Tabs.TabPane',
                tab: "对应生产成本科目"
            }]
        }, {
            name: 'gridcontent0',
            component: '::div',
            className: "ttk-gl-app-accountrelationsset-gridcontent",
            onMouseDown: '{{$mousedown}}',
            _visible: `{{data.other.businessType==5000040005||data.other.businessType==5000040026}}`,
            children: rowGridColumnsOne
        }, {
            name: 'gridcontent1',
            component: '::div',
            className: "ttk-gl-app-accountrelationsset-gridcontent",
            onMouseDown: '{{$mousedown}}',
            _visible: `{{data.other.businessType==5000040024}}`,
            children: rowGridColumnsTwo
        }, {
            name: 'footer',
            component: 'Layout',
            className: 'ttk-gl-app-accountrelationsset-footer',
            children: {
                name: 'footer',
                component: '::div',
                className: 'footbtn',
                children: [{
                    name: 'save',
                    component: 'Button',
                    children: '保存',
                    disabled: '{{$isDisabled()}}',
                    type: "primary",
                    className: 'btn',
                    onClick: '{{$handleSave}}'
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

export function getInitState() {
    return {
        data: {
            list: fromJS([]),
            listDel: fromJS([]),
            listSecond: fromJS([]),
            listSecondDel: fromJS([]),
            inventoryList: fromJS([]),
            inventoryListDel: fromJS([]),
            batchTitles: {
                5000040024: [
                    { key: 'incomeAccount', value: '收入科目' }
                ],
                5000040026: [
                    { key: 'incomeAccount', value: '对应生产成本科目' },
                    { key: 'costAccount', value: '对应委外加工科目' }
                ],
                5000040005: [
                    { key: 'incomeAccount', value: '对应收入科目' },
                    { key: 'costAccount', value: '对应成本科目' }
                ],
            },
            other: {
                defaultLength: 1,
                defaultSize: 1,
                accountType: '0',
                defaultList: fromJS([
                    {
                        costAccountCode: '',
                        costAccountId: '',
                        costAccountShowName: "",
                        incomeAccountCode: "",
                        incomeAccountId: "",
                        incomeAccountShowName: "",
                        inventoryAccountCode: "",
                        inventoryAccountId: "",
                        inventoryAccountShowName: "",
                        inventoryAuxDataId: null,
                        incomeAuxDataId: null,
                        costAuxDataId: null
                    }
                ]),
                accountList: [],
                allArchiveDS: [],
                btnDisabled: false,
                curRowIndex: 0
            }
        }
    }
}
export const rowGridColumnsOne = {
    name: 'details',
    component: 'DataGrid',
    headerHeight: 35,
    rowsCount: '{{data.list.length}}',
    rowHeight: 45,
    readonly: false,
    enableSequence: true,
    enableSequenceAddDelrow: true,
    sequencePostion: 1,
    sequenceFixed: false,
    loading: '{{data.other.loading}}',
    startSequence: 1,
    onAddrow: "{{$addBottomRow('details')}}",
    onDelrow: "{{$delRow('details')}}",
    onKeyDown: '{{$gridKeydown}}',
    scrollToColumn: '{{data.other.tableScrollToColumn}}',
    scrollToRow: '{{data.other.tableScrollToRow}}',
    columns: [{
        name: 'select',
        component: 'DataGrid.Column',
        columnKey: 'operation',
        width: 34,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: [{
                name: 'chexkbox',
                component: 'Checkbox',
                checked: '{{$isSelectAll("details")}}',
                onChange: '{{$selectAll("details")}}'
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
                onChange: "{{$selectRow(_rowIndex,'data.list')}}"
            }]
        }
    }, {
        name: 'inventoryAccount',
        component: 'DataGrid.Column',
        columnKey: 'inventoryAccount',
        flexGrow: 1,
        width: 130,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: "{{data.other.businessType==5000040026 ? '原材料科目' : '存货科目'}}",
        },
        cell: {
            name: 'cell',
            component: "{{$isFocus(_ctrlPath) ? 'Select' : 'DataGrid.TextCell'}}",
            className: '{{$getCellClassName(_ctrlPath) + " cellcontent"}}',
            showSearch: true,
            filterOption: "{{$filterOption}}",
            value: `{{data.list[_rowIndex].inventoryAccountShowName}}`,
            enableTooltip: true,
            onSelect: "{{$onSubjectSelect('inventoryAccount', _rowIndex, data.other.accountList)}}",
            _excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
            _power: '({rowIndex})=>rowIndex',
            children: [{
                name: 'option',
                component: 'Select.Option',
                value: '{{data.other.accountList && data.other.accountList[_lastIndex].id}}',
                children: '{{data.other.accountList && data.other.accountList[_lastIndex].codeAndName}}',
                _power: 'for in data.other.accountList'
            }]
        }
    }, {
        name: 'inventoryAux',
        component: 'DataGrid.Column',
        columnKey: 'inventoryAux',
        width: 20,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: "",
        },
        cell: {
            name: 'cell',
            component: '::a',
            className: "auxtxt",
            children: '{{data.list[_rowIndex]&&data.list[_rowIndex].inventoryAuxDataId?"辅助项":""}}',
            onClick: "{{$handlerCurRowAux('inventoryAccount', data.list[_rowIndex],_rowIndex,data.other.accountList)}}",
            _power: '({rowIndex}) => rowIndex',
        }
    }, {
        name: 'incomeAccount',
        component: 'DataGrid.Column',
        columnKey: 'incomeAccount',
        flexGrow: 1,
        width: 130,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: "{{data.other.businessType==5000040026 ? '对应生产成本科目' : '对应收入科目'}}",
        },
        cell: {
            name: 'cell',
            component: "{{$isFocus(_ctrlPath) ? 'Select' : 'DataGrid.TextCell'}}",
            className: '{{$getCellClassName(_ctrlPath) + " cellcontent"}}',
            showSearch: true,
            enableTooltip: true,
            filterOption: "{{$filterOption}}",
            // onFocus: "{{function(){$onFieldFocus(_ctrlPath)} }}",
            value: `{{data.list[_rowIndex].incomeAccountShowName}}`,
            onSelect: "{{$onSubjectSelect('incomeAccount', _rowIndex, data.other.accountList)}}",
            _excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
            _power: '({rowIndex})=>rowIndex',
            children: {
                name: 'option',
                component: 'Select.Option',
                value: '{{data.other.accountList && data.other.accountList[_lastIndex].id}}',
                children: '{{data.other.accountList && data.other.accountList[_lastIndex].codeAndName}}',
                _power: 'for in data.other.accountList'
            }
        }
    }, {
        name: 'incomeAux',
        component: 'DataGrid.Column',
        columnKey: 'incomeAux',
        width: 20,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: "",
        },
        cell: {
            name: 'cell',
            component: '::a',
            className: "auxtxt",
            children: '{{data.list[_rowIndex]&&data.list[_rowIndex].incomeAuxDataId?"辅助项":""}}',
            onClick: "{{$handlerCurRowAux('incomeAccount', data.list[_rowIndex],_rowIndex,data.other.accountList)}}",
            _power: '({rowIndex}) => rowIndex',
        }
    }, {
        name: 'costAccount',
        component: 'DataGrid.Column',
        columnKey: 'costAccount',
        flexGrow: 1,
        width: 130,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: "{{data.other.businessType==5000040026 ? '对应委外加工科目' : '对应成本科目'}}",
        },
        cell: {
            name: 'cell',
            component: "{{$isFocus(_ctrlPath) ? 'Select' : 'DataGrid.TextCell'}}",
            // component: "{{$isFocus(_ctrlPath) ?$renderSelectComponent(_ctrlPath):'SubjectAuxDisplay'}}",
            className: '{{$getCellClassName(_ctrlPath) + " cellcontent"}}',
            showSearch: true,
            enableTooltip: true,
            filterOption: "{{$filterOption}}",
            // onFocus: "{{function(){$onFieldFocus(_ctrlPath)} }}",
            value: `{{data.list[_rowIndex].costAccountShowName}}`,
            colName: 'costAccount',
            onSelect: "{{$onSubjectSelect('costAccount', _rowIndex, data.other.accountList)}}",
            _excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
            _power: '({rowIndex})=>rowIndex',
            children: {
                name: 'option',
                component: 'Select.Option',
                value: '{{data.other.accountList && data.other.accountList[_lastIndex].id}}',
                children: '{{data.other.accountList && data.other.accountList[_lastIndex].codeAndName}}',
                _power: 'for in data.other.accountList'
            }
        }
    }, {
        name: 'costAux',
        component: 'DataGrid.Column',
        columnKey: 'costAux',
        width: 20,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: "",
        },
        cell: {
            name: 'cell',
            component: '::a',
            className: "auxtxt",
            children: '{{data.list[_rowIndex]&&data.list[_rowIndex].costAuxDataId?"辅助项":""}}',
            onClick: "{{$handlerCurRowAux('costAccount', data.list[_rowIndex],_rowIndex,data.other.accountList)}}",
            _power: '({rowIndex}) => rowIndex',
        }
    }]
}
export const rowGridColumnsTwo = [
    {
        name: 'inventoryDetails',
        component: 'DataGrid',
        headerHeight: 35,
        rowsCount: '{{data.inventoryList.length}}',
        rowHeight: 45,
        readonly: false,
        enableSequence: true,
        enableSequenceAddDelrow: true,
        sequencePostion: 1,
        sequenceFixed: false,
        loading: '{{data.other.loading}}',
        startSequence: 1,
        _visible: '{{data.other.accountType=="0"?true:false}}',
        onAddrow: "{{$addBottomRow('inventoryDetails')}}",
        onDelrow: "{{$delRow('inventoryDetails')}}",
        onKeyDown: '{{$gridKeydown}}',
        scrollToColumn: '{{data.other.tableScrollToColumn}}',
        scrollToRow: '{{data.other.tableScrollToRow}}',
        columns: [{
            name: 'select',
            component: 'DataGrid.Column',
            columnKey: 'operation',
            width: 34,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: [{
                    name: 'chexkbox',
                    component: 'Checkbox',
                    checked: '{{$isSelectAll("inventoryDetails")}}',
                    onChange: '{{$selectAll("inventoryDetails")}}'
                }]
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.Cell',
                _power: '({rowIndex})=>rowIndex',
                children: [{
                    name: 'select',
                    component: 'Checkbox',
                    checked: '{{data.inventoryList[_rowIndex].selected}}',
                    onChange: '{{$selectRow(_rowIndex,"data.inventoryList")}}'
                }]
            }
        }, {
            name: 'inventoryAccount',
            component: 'DataGrid.Column',
            columnKey: 'inventoryAccount',
            flexGrow: 1,
            width: 130,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: "存货科目",
            },
            cell: {
                name: 'cell',
                component: "{{$isFocus(_ctrlPath) ? 'Select' : 'DataGrid.TextCell'}}",
                className: '{{$getCellClassName(_ctrlPath) + " cellcontent"}}',
                showSearch: true,
                filterOption: "{{$filterOption}}",
                value: `{{$isFocus(_ctrlPath)?data.inventoryList[_rowIndex].inventoryAccountId:data.inventoryList[_rowIndex].inventoryAccountShowName}}`,
                enableTooltip: true,
                onSelect: "{{$onSubjectSelect('inventoryAccount', _rowIndex, data.other.accountList)}}",
                _excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
                _power: '({rowIndex})=>rowIndex',
                children: [{
                    name: 'option',
                    component: 'Select.Option',
                    value: '{{data.other.accountList && data.other.accountList[_lastIndex].id}}',
                    children: '{{data.other.accountList && data.other.accountList[_lastIndex].codeAndName}}',
                    _power: 'for in data.other.accountList'
                }]
            }
        }, {
            name: 'inventoryAux',
            component: 'DataGrid.Column',
            columnKey: 'inventoryAux',
            className: 'rightborder',
            width: 20,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: "",
            },
            cell: {
                name: 'cell',
                component: '::a',
                className: "auxtxt nohdborder",
                children: '{{data.inventoryList[_rowIndex]&&data.inventoryList[_rowIndex].inventoryAuxDataId?"辅助项":""}}',
                onClick: "{{$handlerCurRowAux('inventoryAccount', data.inventoryList[_rowIndex],_rowIndex,data.other.accountList)}}",
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'incomeAccount',
            component: 'DataGrid.Column',
            columnKey: 'incomeAccount',
            flexGrow: 1,
            width: 130,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: "收入科目",
            },
            cell: {
                name: 'cell',
                component: "{{$isFocus(_ctrlPath) ? 'Select' : 'DataGrid.TextCell'}}",
                className: '{{$getCellClassName(_ctrlPath) + " cellcontent"}}',
                showSearch: true,
                enableTooltip: true,
                filterOption: "{{$filterOption}}",
                // onFocus: "{{function(){$onFieldFocus(_ctrlPath)} }}",
                value: `{{$isFocus(_ctrlPath)?data.inventoryList[_rowIndex].incomeAccountId:data.inventoryList[_rowIndex].incomeAccountShowName}}`,
                onSelect: "{{$onSubjectSelect('incomeAccount', _rowIndex, data.other.accountList)}}",
                _excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
                _power: '({rowIndex})=>rowIndex',
                children: {
                    name: 'option',
                    component: 'Select.Option',
                    value: '{{data.other.accountList && data.other.accountList[_lastIndex].id}}',
                    children: '{{data.other.accountList && data.other.accountList[_lastIndex].codeAndName}}',
                    _power: 'for in data.other.accountList'
                }
            }
        }, {
            name: 'incomeAux',
            component: 'DataGrid.Column',
            columnKey: 'incomeAux',
            width: 20,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: "",
            },
            cell: {
                name: 'cell',
                component: '::a',
                className: "auxtxt",
                children: '{{data.inventoryList[_rowIndex]&&data.inventoryList[_rowIndex].incomeAuxDataId?"辅助项":""}}',
                onClick: "{{$handlerCurRowAux('incomeAccount', data.inventoryList[_rowIndex],_rowIndex,data.other.accountList)}}",
                _power: '({rowIndex}) => rowIndex',
            }
        }]
    }, {
        name: 'costDetails',
        component: 'DataGrid',
        headerHeight: 35,
        rowsCount: '{{data.listSecond.length}}',
        rowHeight: 45,
        readonly: false,
        enableSequence: true,
        enableSequenceAddDelrow: true,
        sequencePostion: 1,
        sequenceFixed: false,
        loading: '{{data.other.loading}}',
        startSequence: 1,
        _visible: '{{data.other.accountType=="1"?true:false}}',
        onAddrow: "{{$addBottomRow('costDetails')}}",
        onDelrow: "{{$delRow('costDetails')}}",
        onKeyDown: '{{$gridKeydown}}',
        scrollToColumn: '{{data.other.tableScrollToColumn}}',
        scrollToRow: '{{data.other.tableScrollToRow}}',
        columns: [{
            name: 'select',
            component: 'DataGrid.Column',
            columnKey: 'operation',
            width: 34,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: [{
                    name: 'chexkbox',
                    component: 'Checkbox',
                    checked: '{{$isSelectAll("costDetails")}}',
                    onChange: '{{$selectAll("costDetails")}}'
                }]
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.Cell',
                _power: '({rowIndex})=>rowIndex',
                children: [{
                    name: 'select',
                    component: 'Checkbox',
                    checked: '{{data.listSecond[_rowIndex].selected}}',
                    onChange: '{{$selectRow(_rowIndex,"data.listSecond")}}'
                }]
            }
        }, {
            name: 'costAccount',
            component: 'DataGrid.Column',
            columnKey: 'costAccount',
            flexGrow: 1,
            width: 130,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: "生产成本科目",
            },
            cell: {
                name: 'cell',
                component: "{{$isFocus(_ctrlPath) ? 'Select' : 'DataGrid.TextCell'}}",
                className: '{{$getCellClassName(_ctrlPath) + " cellcontent"}}',
                showSearch: true,
                enableTooltip: true,
                filterOption: "{{$filterOption}}",
                value: `{{$isFocus(_ctrlPath)?data.listSecond[_rowIndex].costAccountId:data.listSecond[_rowIndex].costAccountShowName}}`,
                onSelect: "{{$onSubjectSelect('costAccount', _rowIndex, data.other.accountList)}}",
                _excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
                _power: '({rowIndex})=>rowIndex',
                children: {
                    name: 'option',
                    component: 'Select.Option',
                    value: '{{data.other.accountList && data.other.accountList[_lastIndex].id}}',
                    children: '{{data.other.accountList && data.other.accountList[_lastIndex].codeAndName}}',
                    _power: 'for in data.other.accountList'
                }
            }
        }, {
            name: 'costAux',
            component: 'DataGrid.Column',
            columnKey: 'costAux',
            width: 20,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: "",
            },
            cell: {
                name: 'cell',
                component: '::a',
                className: "auxtxt",
                children: '{{data.listSecond[_rowIndex]&&data.listSecond[_rowIndex].costAuxDataId?"辅助项":""}}',
                onClick: "{{$handlerCurRowAux('costAccount', data.listSecond[_rowIndex],_rowIndex,data.other.accountList)}}",
                _power: '({rowIndex}) => rowIndex',
            }
        }]
    }
]
