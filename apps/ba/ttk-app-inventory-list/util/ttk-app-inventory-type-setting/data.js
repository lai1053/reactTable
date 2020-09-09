import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-app-inventory-type-setting',
        onMouseDown: '{{$mousedown}}',
        children: [{ 
            name: 'content',
            component: '::div',
            className: 'ttk-app-inventory-type-setting-content',
            children: [{
                name: 'bottom',
                component: '::div',
                className: 'ttk-app-inventory-type-setting-content-bottom',
                children:[{
                    name: 'details',
                    component: 'DataGrid',
                    className: 'ttk-app-inventory-type-setting-form-details',
                    headerHeight: 35,
                    rowHeight: 35,
                    groupHeaderHeight: 35,
                    rowsCount: '{{data.form.details.length}}',
                    enableSequence: true,
                    startSequence: 1,
                    enableSequenceAddDelrow: true,
                    key: '{{data.form.details}}',
                    readonly: false,
                    style: '{{{return{height:"300px"}}}}',
                    onAddrow: "{{$addBottomRow('details')}}",
                    onDelrow: "{{$delRow('details')}}",
                    onKeyDown: '{{$gridKeydown}}',
                    scrollToColumn: '{{data.other.detailsScrollToColumn}}',
                    scrollToRow: '{{data.other.detailsScrollToRow}}',
                    loading: '{{data.other.loading}}',
                    columns: [{
                        name: 'name',
                        component: 'DataGrid.Column',
                        columnKey: 'name',
                        width: 150,
                        flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-required',
                            children: '存货类型'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{_rowIndex > 3 ? "Input" : "DataGrid.Cell"}}',
                            placeholder: '请输入存货类型',
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
                            title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
                            onBlur: '{{function(e){$changeType(_rowIndex, e.target.value, "name")}}}',
                            _power: '({rowIndex}) => rowIndex'
                        },
                    },{
                        name: 'code',
                        component: 'DataGrid.Column',
                        columnKey: 'code',
                        width: 120,
                        flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '类型编码'
                        },
                        cell: {
                            name: 'cell',
                            // component: '{{_rowIndex > 3 ? "Input" : "DataGrid.Cell"}}',
                            component: 'Input',
                            placeholder: '请输入类型编码',
                            onBlur: '{{function(e){$changeType(_rowIndex, e.target.value, "code")}}}',
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].code}}',
                            title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].code}}',
                            _power: '({rowIndex}) => rowIndex'
                        }
                    },{
                        name: 'accountId',
                        component: 'DataGrid.Column',
                        columnKey: 'accountId',
                        width: 180,
                        flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-required',
                            children: '存货科目'
                        },
                        cell: {
                            name: 'cell',
                            // component: '{{_rowIndex > 3 ? "Select" : "DataGrid.TextCell"}}',
                            component: 'Select',
                            placeholder: '请选择存货科目',
                            filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
                            // value: '{{_rowIndex > 3 ? data.form.details[_rowIndex].accountId : data.form.details[_rowIndex].accountName}}',
                            value: '{{data.form.details[_rowIndex].accountId}}',
                            // title: '{{_rowIndex > 3 ? data.form.details[_rowIndex].accountId : data.form.details[_rowIndex].accountName}}',
                            title: '{{data.form.details[_rowIndex].accountId}}',
                            onChange: '{{function(e){$changeType(_rowIndex, e, "accountId")}}}',
                            children: {
                                name: 'selectItem',
                                component: 'Select.Option',
                                value: '{{data.glAccounts[_lastIndex].id}}',
                                children: '{{data.glAccounts[_lastIndex].codeAndName}}',
                                title: '{{data.glAccounts[_lastIndex].codeAndName}}',
                                _power: 'for in data.glAccounts'
                            },
                            _power: '({rowIndex}) => rowIndex'
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
            form:{
                details:[],
                delArr: []
            },
            other:{
                detailHeight: 2,
                loading: false
            }
		}
	}
}

export const blankDetail = [{
                    name: undefined,
                    code: '',
                    accountId: undefined,
                    inventoryPropertyId: 0 // 默认0
                }]