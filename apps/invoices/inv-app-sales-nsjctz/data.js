export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-sales-nsjctz',
        children: {
            name: 'spin',
            component: 'Spin',
            tip: '加载中...',
            delay: 0.01,
            spinning: '{{data.loading}}',
            children: [{
                name: 'title',
                component: '::div',
                className: 'inv-app-sales-nsjctz-title',
                children: '纳税检查调整'
            }, {
                name: 'table',
                component: '::div',
                className: 'inv-app-sales-nsjctz-table',
                children: [{
                    name: 'row1',
                    component: 'Row',
                    className: 'row',
                    children: [{
                        name: 'col1',
                        component: 'Col',
                        className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                        span: 3,
                        children: '不含税金额',
                    }, {
                        name: 'col2',
                        component: 'Col',
                        className: 'col p-r-8',
                        span: 5,
                        _visible: '{{$isReadOnly()}}',
                        align: 'right',
                        children: '{{$numberFormat(data.form.hjje,2,false,false)}}',
                    }, {
                        name: 'col3',
                        component: 'Col',
                        className: 'col',
                        span: 5,
                        _visible: '{{!$isReadOnly()}}',
                        children: {
                            name: 'tooltips-hjje',
                            component: 'Tooltip',
                            getPopupContainer: '{{$handleGetPopupContainer}}',
                            title: '{{data.error.hjje}}',
                            visible: '{{data.error.hjje && data.error.hjje.indexOf("不能为空")==-1}}',
                            overlayClassName: '-sales-error-toolTip',
                            placement: 'right',
                            children: {
                                name: 'input-hjje',
                                component: 'NumericInput',
                                // match: 'int',
                                hideTip: true,
                                disabled: '{{$notAllowEdit()}}',
                                align: 'right',
                                value: '{{data.form.hjje}}',
                                className: '{{data.error.hjje?"-sales-error":""}}',
                                onBlur: '{{function(){$hjjeChange(data.form,data.form.hjje)}}}',
                                onChange: '{{function(v){$handleFieldChangeV("data.form.hjje",v,true)}}}',
                            }
                        },
                    }, {
                        name: 'col4',
                        component: 'Col',
                        className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                        span: 3,
                        children: '税率(%)',
                    }, {
                        name: 'col5',
                        component: 'Col',
                        className: 'col p-r-8',
                        span: 5,
                        _visible: '{{$isReadOnly()}}',
                        align: 'right',
                        children: '{{(data.form.zbslv || 0)*100 +"%"}}',
                    }, {
                        name: 'col6',
                        component: 'Col',
                        className: 'col',
                        span: 5,
                        _visible: '{{!$isReadOnly()}}',
                        children: {
                            name: 'tooltips-zbslv',
                            component: 'Tooltip',
                            getPopupContainer: '{{$handleGetPopupContainer}}',
                            overlayClassName: '-sales-error-toolTip',
                            placement: 'right',
                            title: '{{data.error.zbslv}}',
                            visible: '{{data.error.zbslv && data.error.zbslv.indexOf("不能为空")==-1}}',
                            children: {
                                name: 'select-zbslv',
                                component: 'Select',
                                allowClear: true,
                                value: '{{data.form.zbslv}}',
                                disabled: '{{$notAllowEdit()}}',
                                className: '{{data.error.zbslv?"-sales-error":""}}',
                                onChange: '{{function(value){$zbslvChange(data.form,value)}}}',
                                children: {
                                    name: '{{"item-zbslv"+_rowIndex}}',
                                    component: 'Select.Option',
                                    value: '{{data.slList[_rowIndex].slv}}',
                                    children: '{{data.slList[_rowIndex].slvMc}}',
                                    className: '-ttk-option',
                                    _power: 'for in data.slList',
                                }
                            }
                        },
                    }, {
                        name: 'col7',
                        component: 'Col',
                        className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                        span: 3,
                        children: '税额',
                    }, {
                        name: 'col8',
                        component: 'Col',
                        className: 'col p-r-8',
                        span: 5,
                        _visible: '{{$isReadOnly()}}',
                        align: 'right',
                        children: '{{$numberFormat(data.form.hjse,2,true,false)}}',
                    }, {
                        name: 'col9',
                        component: 'Col',
                        className: 'col',
                        span: 5,
                        _visible: '{{!$isReadOnly()}}',
                        children: {
                            name: 'tooltips-hjse',
                            component: 'Tooltip',
                            getPopupContainer: '{{$handleGetPopupContainer}}',
                            title: '{{data.error.hjse}}',
                            visible: '{{data.error.hjse && data.error.hjse.indexOf("不能为空")==-1}}',
                            overlayClassName: '-sales-error-toolTip',
                            placement: 'right',
                            children: {
                                name: 'input-hjse',
                                component: '::div',
                                align: 'right',
                                // disabled: true,
                                className: '{{data.error.hjse?"-sales-error p-r-8":"p-r-8"}}',
                                children: '{{$quantityFormat(data.form.hjse,2,true,false)}}'
                            }
                        }
                    }]
                }, {
                    name: 'row2',
                    component: 'Row',
                    className: 'row',
                    children: [{
                        name: 'col1',
                        component: 'Col',
                        className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                        span: 3,
                        children: '类型',
                    }, {
                        name: 'col2',
                        component: 'Col',
                        className: 'col p-l-8',
                        span: 21,
                        _visible: '{{$isReadOnly()}}',
                        children: '{{((data.hwlxList || []).find(function(f){return f.hwlxDm===data.form.hwlxDm}) || {}).hwlxMc}}',
                    }, {
                        name: 'col3',
                        component: 'Col',
                        className: 'col',
                        span: 21,
                        _visible: '{{!$isReadOnly()}}',
                        children: {
                            name: 'tooltips',
                            component: 'Tooltip',
                            getPopupContainer: '{{$handleGetPopupContainer}}',
                            title: '{{data.error.hwlxDm}}',
                            visible: '{{data.error.hwlxDm && data.error.hwlxDm.indexOf("不能为空")==-1}}',
                            overlayClassName: '-sales-error-toolTip',
                            placement: 'topLeft',
                            children: {
                                name: 'radio-hwlx',
                                component: 'Radio.Group',
                                className: 'radio-group',
                                value: '{{data.form.hwlxDm}}',
                                // disabled: '{{$notAllowEdit()}}',
                                onChange: '{{function(e){$handleFieldChangeV("data.form.hwlxDm",e.target.value,true)}}}',
                                children: {
                                    name: '{{"item-hwlx"+_rowIndex}}',
                                    component: 'Radio',
                                    value: '{{data.hwlxList[_rowIndex].hwlxDm}}',
                                    children: '{{data.hwlxList[_rowIndex].hwlxMc}}',
                                    className: 'radio',
                                    _power: 'for in data.hwlxList',
                                }
                            }
                        },
                    }]
                }, {
                    name: 'row3',
                    component: 'Row',
                    className: 'row',
                    children: [{
                        name: 'col1',
                        component: 'Col',
                        className: 'col ant-form-item-center',
                        span: 4,
                        children: '即征即退标识',
                    }, {
                        name: 'col2',
                        component: 'Col',
                        className: 'col ant-form-item-center',
                        span: 4,
                        _visible: '{{$isReadOnly()}}',
                        children: '{{data.form.jzjtbz==="N"?"否":"是"}}',
                    }, {
                        name: 'col3',
                        component: 'Col',
                        className: 'col ant-form-item-center',
                        span: 4,
                        _visible: '{{!$isReadOnly()}}',
                        children: [{
                            name: 'radio',
                            component: 'Radio.Group',
                            className: 'radio-group',
                            value: '{{data.form.jzjtbz}}',
                            disabled: true,
                            // onChange:'{{function(value){$sf("data.form.jzjtbz",value)}}}',
                            children: [{
                                name: 'item1',
                                component: 'Radio',
                                value: 'N',
                                children: '否',
                                className: 'radio'
                            }, {
                                name: 'item2',
                                component: 'Radio',
                                value: 'Y',
                                children: '是',
                                className: 'radio'
                            }]
                        }],
                    }, {
                        name: 'col4',
                        component: 'Col',
                        className: 'col ant-form-item-center',
                        span: 3,
                        children: '计税方式',
                    }, {
                        name: 'col5',
                        component: 'Col',
                        className: 'col p-l-8',
                        span: 13,
                        _visible: '{{$isReadOnly()}}',
                        children: '{{((data.jsfsList || []).find(function(f){return f.jsfsDm===data.form.jsfsDm}) || {}).jsfsMc}}',
                    }, {
                        name: 'col6',
                        component: 'Col',
                        className: 'col',
                        span: 13,
                        _visible: '{{!$isReadOnly()}}',
                        children: [{
                            name: 'radio',
                            component: 'Radio.Group',
                            className: 'radio-group',
                            value: '{{data.form.jsfsDm}}',
                            disabled: true,
                            // onChange: '{{function(e){$jsfsChange(data.form,e.target.value)}}}',
                            children: {
                                name: '{{"item1"+_rowIndex}}',
                                component: 'Radio',
                                value: '{{data.jsfsList[_rowIndex].jsfsDm}}',
                                children: '{{data.jsfsList[_rowIndex].jsfsMc}}',
                                className: 'radio',
                                _power: 'for in data.jsfsList',
                            }
                        }],
                    }]
                }]
            }, {
                name: 'kpr',
                className: 'kpr',
                component: '::div',
                children: [{
                    name: 'kpr-txt',
                    className: 'kpr-txt',
                    component: '::span',
                    children: '开票人：'
                }, {
                    name: 'kpr-input',
                    className: 'kpr-input',
                    component: 'Input',
                    value: '{{data.form.kpr}}',
                    onChange: '{{function(e){$sf("data.form.kpr",e.target.value)}}}'
                }]
            }],
        },
    }
}

export function getInitState() {
    return {
        data: {
            loading: true,
            hwlxList: [],
            slList: [],
            jsfsList: [],
            slListCache: [],
            form: {
                hwlxDm: '0004',
                jzjtbz: 'N',
                jsfsDm: '0',
            },
            error: {

            }
        }
    }
}