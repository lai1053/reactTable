import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-app-unit-card',
        id: 'ttk-app-unit-card',
        onMouseDown: '{{$mousedown}}',
        children: [{ 
            name: 'content',
            component: '::div',
            className: 'ttk-app-unit-card-content',
            children: [{
                name: 'top',
                component: '::div',
                className: 'ttk-app-unit-card-content-top',
                children:[{
                    name: 'unitwrap',
                    component: '::div',
                    children:[{
                        name: 'span1',
                        component: '::span',
                        children: '主计量单位'
                    },{
                        name: 'span2',
                        component: 'Input',
                        placeholder: '请输入主计量单位',
                        maxLength: 100,
                        onChange: "{{function (e) {$sf('data.other.name', e.target.value)}}}",
                        value: '{{data.other.name}}',
                        title: '{{data.other.name}}',
                    }]
                }]
            },{
                name: 'bottom',
                component: '::div',
                className: 'ttk-app-unit-card-content-bottom',
                children:[{
                    name: 'details',
                    component: 'DataGrid',
                    className: 'ttk-app-unit-card-form-details',
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
                    onAddrow: "{{$addRow('details')}}",
                    onDelrow: "{{$delRow('details')}}",
                    onKeyDown: '{{$gridKeydown}}',
                    scrollToColumn: '{{data.other.detailsScrollToColumn}}',
                    scrollToRow: '{{data.other.detailsScrollToRow}}',
                    columns: [{
                        name: 'name',
                        component: 'DataGrid.Column',
                        columnKey: 'name',
                        width: 150,
                        flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: [{
                                    name: 'span1',
                                    component: '::span',
                                    children: '辅计量单位'
                                },{
                                    name: 'helpPopover',
                                    component: 'Popover',
                                    content: [{
                                        name: 'p',
                                        component: '::div',
                                        children: [{
                                            name: 'help1',
                                            component: '::span',
                                            className: 'wxtishi',
                                            children: '温馨提示：'
                                        },{
                                            name: 'help2',
                                            component: '::span',
                                            children: '辅计量单位 = 主计量单位 x 换算系数'
                                        }]
                                    }, {
                                        name: 'p',
                                        component: '::div',
                                        style: {marginLeft: 60},
                                        children: '如：1盒=双 x 50；1箱=双 x 50'
                                    }],
                                    placement: 'bottom',
                                    overlayClassName: 'ttk-app-unit-card-helpPopover',
                                    children: {
                                        name: 'helpIcon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        type: 'bangzhutishi',
                                        className: 'helpIcon'
                                    }
                                }]
                        },
                        cell: {
                            name: 'cell',
                            component: 'Input',
                            placeholder: '请输入辅计量单位',
                            maxLength: 100,
                            onChange: '{{function(e){$onFieldChanges(_rowIndex,e.target.value,"name")}}}',
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
                            title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    },{
                        name: 'factor',
                        component: 'DataGrid.Column',
                        columnKey: 'factor',
                        width: 150,
                        flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '换算系数'
                        },
                        cell: {
                            name: 'cell',
                            component: 'Input.Number',
                            placeholder: '请输入换算系数',
                            onChange: '{{function(e){$onFieldChanges(_rowIndex,e,"factor")}}}',
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].factor}}',
                            title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].factor}}',
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
            form:{
                details:blankDetail
            },
            other:{
                detailHeight: 2,
            }
		}
	}
}

export const blankDetail = [{
    name: '',
    factor: ''
}]