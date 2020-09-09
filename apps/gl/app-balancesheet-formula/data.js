// import Menu from "antd/lib/menu";
// import { consts } from 'edf-consts'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'app-balancesheet-formula',
        spinning: '{{data.other.loading}}',
        children: [
            {
                name: 'header',
                component: 'Form',
                className: 'app-balancesheet-formula-headerContent',
                children: [
                    {
                        name: 'app-balancesheet-formula-subject-title',
                        component: 'Form.Item',
                        required: true,
                        label: '科目',
                        className: 'app-balancesheet-formula-subject-title',
                        validateStatus: "{{data.other.error.subject?'error':'success'}}",
                        // help: '{{data.other.error.subject}}',
                        children: {
                            name: 'app-balancesheet-formula-subject-input',
                            // component:'Input',
                            className: 'app-balancesheet-formula-subject-input',
                            width: 250,
                            dropdownClassName: 'app-balancesheet-formula-subject-input-down',
                            component: 'Select',
                            onChange: '{{$accountlistChange}}',
                            value: '{{data.codeAndName}}',
                            optionFilterProp: "children",
                            filterOption: '{{$filterOptionSummary}}',
                            optionFilterProp: "children",
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                className: 'app-detailaccount-rpt-account-select-item',
                                title: '{{data.accountList && data.accountList[_rowIndex].label }}',
                                value: "{{ data.accountList &&JSON.stringify( data.accountList[_rowIndex] ) }}",
                                children: '{{data.accountList && data.accountList[_rowIndex].label }}',
                                _power: 'for in data.accountList'
                            }
                        }
                    }, {
                        name: 'app-balancesheet-formula-symbol-title',
                        component: 'Form.Item',
                        required: true,
                        label: '运算符号',
                        _visible: '{{data.type==1}}',
                        className: 'app-balancesheet-formula-symbol-title',
                        validateStatus: "{{data.other.error.symbol?'error':'success'}}",
                        // help: '{{data.other.error.symbol}}',
                        children: {
                            name: 'app-balancesheet-formula-symbol-select',
                            className: 'app-balancesheet-formula-symbol-select',
                            component: 'Select',
                            value: '{{data.flag&&data.flag.name}}',
                            onSelect: '{{$selectFlagData}}',
                            _visible: '{{data.type==1}}',
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                key: '{{ data.flagOption ? JSON.stringify(data.flagOption[_rowIndex]): undefined}}',
                                children: '{{data.flagOption ? data.flagOption[_rowIndex]["name"] : undefined}}',
                                _power: 'for in data.flagOption'
                            }
                        }
                    }, {
                        name: 'app-balancesheet-formula-rule-title',
                        component: 'Form.Item',
                        required: true,
                        label: '取数规则',
                        className: 'app-balancesheet-formula-rule-title',
                        validateStatus: "{{data.other.error.rule?'error':'success'}}",
                        // help: '{{data.other.error.rule}}',
                        children: {
                            name: 'app-balancesheet-formula-rule-select',
                            className: "app-balancesheet-formula-rule-select",
                            component: 'Select',
                            value: '{{data.formulaIdForPage&&data.formulaIdForPage.name}}',
                            onSelect: '{{$selectFormulaIdForPageData}}',
                            width: 'data.type==1?150:250',
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                key: '{{ data.formulaIdForPageOption ? JSON.stringify(data.formulaIdForPageOption[_rowIndex]): undefined}}',
                                children: '{{data.formulaIdForPageOption ? data.formulaIdForPageOption[_rowIndex]["name"] : undefined}}',
                                _power: 'for in data.formulaIdForPageOption'
                            }
                        }
                    },
                    {
                        name: 'rightBtn',
                        component: '::div',
                        className: 'rightBtn',
                        children: [
                            {
                                name: 'refreshBtn',
                                component: 'Button',
                                className: 'add',
                                children: '添加',
                                type: 'primary',
                                onClick: '{{$addRowClick}}'
                            }, {
                                name: 'resetBtn',
                                component: 'Button',
                                className: 'reset',
                                children: '重置',
                                disabled: '{{!data.isReset}}',
                                onClick: '{{$resetClick}}'
                            }
                        ]
                    }

                ]
            }
            , {
                name: 'content',
                className: 'app-balancesheet-formula-content',
                component: '::div',
                children:
                    [{
                        name: 'dataGrid',
                        component: 'DataGrid',
                        headerHeight: 37,
                        loading: '{{data.other.loading}}',
                        isColumnResizing: true,
                        rowHeight: 37,
                        // enableSequence: true,
                        ellipsis: true,
                        _visible: '{{ !$isDisplay() }}',
                        rowsCount: "{{$getListRowsCount()}}",
                        scroll: '{{ {x: 0, y: 430} }}',
                        sequenceFooter: {
                            name: 'footer',
                            component: 'DataGrid.Cell',
                            children: '合计'
                        },
                        columns: "{{$getColumns()}}"
                    }, 
                    {
                        name: 'businessActiveTable',
                        className: 'app-balancesheet-formula-businessActiveTable',
                        component: 'Table',
                        pagination: false,
                        allowColResize: false,
                        _visible: '{{ $isDisplay() }}',
                        enableSequenceColumn: false,
                        scroll: '{{ {y: data.other.scrollY,x:900} }}',
                        bordered: true,
                        pureText: '暂无数据',
                        dataSource: '{{data.list}}',
                        columns: '{{$getActiveTBColumns()}}',
                    }
                ]
            }
        ]
    }
}

export function getInitState(option) {
    return {
        data: {
            list: [],//列表
            period: {},//从父级传来的调用接口参数
            codeAndName: undefined,//选择的科目
            editState: false,//是否已经编辑
            isReset: false,
            flagOption: [{//符号下拉项
                name: '+',
                id: '+'
            }, {
                name: '-',
                id: '-'
            }],
            formulaIdForPageOption: 
            [{//取数规则下拉项
                name: '余额',
                id: 1
            }, {
                name: '本级科目借方余额',
                id: 2
            }, {
                name: '本级科目贷方余额',
                id: 3
            }, {
                name: '末级科目借方余额',
                id: 4
            }, {
                name: '末级科目贷方余额',
                id: 5
            }],
            flag: undefined,//被选符号
            formulaIdForPage: undefined,//被选取数规则
            other: {
                loading: false,
                error: {}
            }
        }
    }
}
