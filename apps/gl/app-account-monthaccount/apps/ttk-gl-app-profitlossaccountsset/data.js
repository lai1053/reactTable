import { fromJS } from "immutable";

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-profitlossaccountsset',
        children: [{
            name: 'tabs',
            component: 'Tabs',
            className: 'tabs',
            activeKey: '{{data.other.accountType}}',
            defaultActiveKey: '0',
            onChange: `{{function(v){$tabChange('data.other.accountType',v)}}}`,
            children: [{
                key: '0',
                component: 'Tabs.TabPane',
                tab: "损益类科目"
            }, {
                key: '1',
                component: 'Tabs.TabPane',
                tab: "结转科目"
            }]
        }, {
            name: 'gridcontent',
            component: '::div',
            className: "ttk-gl-app-profitlossaccountsset-gridcontent",
            onMouseDown: '{{$mousedown}}',
            children: rowGridColumns
        }, {
            name: 'footer',
            component: 'Layout',
            className: 'ttk-gl-app-profitlossaccountsset-footer',
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
                    name: 'reset',
                    component: 'Button',
                    children: '重置',
                    //disabled: '{{$isDisabled()}}',
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

export function getInitState() {
    return {
        data: {
            profitLossList: fromJS([{
                accountId: null,
                profitLossType: 1,
                propertyName: "汇兑收益科目",
            }, {
                accountId: null,
                profitLossType: 2,
                propertyName: "汇兑损失科目"
            }]),
            assetLiabilityList: fromJS([{
                accountId: null,
                assetLiabilityType: 1,
                orderNum: 1,
                propertyName: "货币性资产"
            }, {
                accountId: null,
                assetLiabilityType: 2,
                orderNum: 1,
                propertyName: "货币性负债"
            }]),
            tableOption: {
                y: null
            },
            other: {
                loading: false,
                accountType: '0',
                profitLossAccountList: [],
                btnDisabled: false
            }
        }
    }
}
export const rowGridColumns = [
    {
        name: 'profitlossDetails',
        component: 'DataGrid',
        headerHeight: 35,
        rowsCount: '{{data.profitLossList.length}}',
        rowHeight: 35,
        readonly: false,
        loading: '{{data.other.loading}}',
        _visible: '{{data.other.accountType=="0"?true:false}}',
        onKeyDown: '{{$gridKeydown}}',
        scrollToColumn: '{{data.other.tableScrollToColumn}}',
        scrollToRow: '{{data.other.tableScrollToRow}}',
        columns: [{
            name: 'propertyName',
            component: 'DataGrid.Column',
            columnKey: 'propertyName',
            width: 192,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: "属性",
            },
            cell: {
                name: 'cell',
                component: 'DataGrid.TextCell',
                className: '{{$getCellClassName(_ctrlPath)}}',
                value: '{{data.profitLossList[_rowIndex] && data.profitLossList[_rowIndex].propertyName}}',
                enableTooltip: true,
                _power: '({rowIndex}) => rowIndex',
            }
        }, {
            name: 'profitlossAccount',
            component: 'DataGrid.Column',
            columnKey: 'profitlossAccount',
            flexGrow: 1,
            width: 230,
            header: {
                name: 'header',
                component: 'DataGrid.Cell',
                children: "科目",
            },
            cell: {
                name: 'cell',
                component: 'Select',
                className: 'ttk-gl-app-profitlossaccountsset-cell',
                showSearch: true,
                filterOption: "{{$filterOption}}",
                value: `{{data.profitLossList[_rowIndex].accountId}}`,
                enableTooltip: true,
                onSelect: "{{function(v){$onSubjectSelect('profitlossAccount', _rowIndex, v)}}}",
                _power: '({rowIndex})=>rowIndex',
                children: [{
                    name: 'option',
                    component: 'Select.Option',
                    value: '{{data.other.profitLossAccountList && data.other.profitLossAccountList[_lastIndex].accountId}}',
                    children: '{{data.other.profitLossAccountList && data.other.profitLossAccountList[_lastIndex].codeAndName}}',
                    _power: 'for in data.other.profitLossAccountList'
                }]
            }
        }]
    }, {
        name: 'assetliabilityDetails',
        component: 'Table',
        pagination: false,
        className: 'tablebody',
        loading: '{{data.other.loading}}',
        _visible: '{{data.other.accountType=="1"?true:false}}',
        allowColResize: false,
        dataSource: '{{data.assetLiabilityList}}',
        onRow: '{{function(){return $mouseEnter()}}}',
        bordered: true,
        noDelCheckbox: true,
        scroll: '{{data.assetLiabilityList.length >  0 ? data.tableOption : {}}}',
        columns: [{
            title: '属性',
            dataIndex: 'propertyName',
            key: 'propertyName',
            width: '20%',
            render: "{{function(text, record, index){return $renderCell('propertyName', index, text, record)} }}"
        }, {
            title: '序号',
            dataIndex: 'orderNum',
            width: '6%',
            key: 'orderNum',
            render: "{{function(text, record, index){return $renderCell('orderNum', index, text, record)} }}"
        }, {
            title: '科目',
            dataIndex: 'accountId',
            width: '74%',
            key: 'accountId',
            render: "{{function(text, record, index){return $renderCell('accountId', index, text, record)} }}"
        }]
    }
]
