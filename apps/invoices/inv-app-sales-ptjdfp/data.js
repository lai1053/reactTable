export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-sales-ptjdfp',
        children: {
            name: 'spin',
            component: 'Spin',
            tip: '加载中...',
            delay: 0.01,
            spinning: '{{data.loading}}',
            children: [{
                name: 'title',
                component: '::div',
                className: 'inv-app-sales-ptjdfp-title',
                children: '普通机打发票'
            }, {
                name: 'table',
                component: '::div',
                className: 'inv-app-sales-ptjdfp-table',
                children: [{
                    name: 'row1',
                    component: 'Row',
                    className: 'row',
                    children: [{
                        name: 'col1',
                        component: 'Col',
                        className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                        span: 5,
                        children: '货物类型',
                    }, {
                        name: 'col2',
                        component: 'Col',
                        className: 'col -mx-cell',
                        span: 19,
                        _visible: '{{$isReadOnly()}}',
                        children: '{{((data.hwlxList || []).find(function(f){return f.hwlxDm===data.form.hwlxDm}) || {}).hwlxMc}}',
                    }, {
                        name: 'col3',
                        component: 'Col',
                        className: 'col',
                        span: 19,
                        _visible: '{{!$isReadOnly()}}',
                        children: {
                            name: 'tooltips',
                            component: 'Tooltip',
                            getPopupContainer: '{{$handleGetPopupContainer}}',
                            title: '{{data.error.hwlxDm}}',
                            visible: '{{data.error.hwlxDm && data.error.hwlxDm.indexOf("不能为空")==-1}}',
                            overlayClassName: '-sales-error-toolTip',
                            placement: 'right',
                            children: {
                                name: 'select-hwlx',
                                component: 'Select',
                                allowClear: true,
                                className: '{{data.error.hwlxDm?"-sales-error":""}}',
                                value: '{{data.form.hwlxDm}}',
                                // disabled: '{{$notAllowEdit()}}',
                                onChange: '{{function(value){$handleFieldChangeV("data.form.hwlxDm",value,true)}}}',
                                children: {
                                    name: '{{"item-hwlx"+_rowIndex}}',
                                    component: 'Select.Option',
                                    value: '{{data.hwlxList[_rowIndex].hwlxDm}}',
                                    children: '{{data.hwlxList[_rowIndex].hwlxMc}}',
                                    className: '-ttk-option',
                                    _power: 'for in data.hwlxList',
                                }
                            }
                        },
                    }]
                }, {
                    name: 'row2',
                    component: 'Row',
                    className: 'row',
                    children: [{
                        name: 'col1',
                        component: 'Col',
                        className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                        span: 5,
                        children: '价税合计金额',
                    }, {
                        name: 'col2',
                        component: 'Col',
                        className: 'col -mx-cell',
                        span: 9,
                        _visible: '{{$isReadOnly()}}',
                        children: '{{$numberFormat(data.form.jshj,2,false,false)}}',
                    }, {
                        name: 'col3',
                        component: 'Col',
                        className: 'col',
                        span: 9,
                        _visible: '{{!$isReadOnly()}}',
                        children: {
                            name: 'tooltips-jshj',
                            component: 'Tooltip',
                            getPopupContainer: '{{$handleGetPopupContainer}}',
                            title: '{{data.error.jshj}}',
                            visible: '{{data.error.jshj && data.error.jshj.indexOf("不能为空")==-1}}',
                            overlayClassName: '-sales-error-toolTip',
                            placement: 'right',
                            children: {
                                name: 'input-jshj',
                                component: 'NumericInput',
                                // match: 'int',
                                hideTip: true,
                                disabled: '{{$notAllowEdit()}}',
                                align: 'right',
                                value: '{{data.form.jshj}}',
                                className: '{{data.error.jshj?"-sales-error":""}}',
                                onBlur: '{{function(){$jshjChange(data.form,data.form.jshj)}}}',
                                onChange: '{{function(v){$handleFieldChangeV("data.form.jshj",v,true)}}}',
                            }
                        },
                    }, {
                        name: 'col4',
                        component: 'Col',
                        className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                        span: 2,
                        children: '税率',
                    }, {
                        name: 'col5',
                        component: 'Col',
                        className: 'col p-r-8',
                        span: 2,
                        _visible: '{{$isReadOnly()}}',
                        align: 'right',
                        children: '{{(data.form.zbslv|| 0)*100 +"%"}}',
                    }, {
                        name: 'col6',
                        component: 'Col',
                        className: 'col',
                        span: 2,
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
                        className: 'col ant-form-item-center',
                        span: 3,
                        children: '税额',
                    }, {
                        name: 'col8',
                        component: 'Col',
                        className: 'col -mx-cell txt-right',
                        span: 3,
                        _visible: '{{$isReadOnly()}}',
                        children: '{{$numberFormat(data.form.hjse,2,false,false)}}',
                    }, {
                        name: 'col9',
                        component: 'Col',
                        className: 'col',
                        span: 3,
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
                                // disabled: '{{$notAllowEdit()}}',
                                className: '{{data.error.hjse?"-sales-error p-r-8":"p-r-8"}}',
                                children: '{{$quantityFormat(data.form.hjse,2,true,false)}}'
                            }
                        }
                    }]
                }, {
                    name: 'row3',
                    component: 'Row',
                    className: 'row',
                    children: [{
                        name: 'col1',
                        component: 'Col',
                        className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                        span: 5,
                        children: '开票张数',
                    }, {
                        name: 'col2',
                        component: 'Col',
                        className: 'col -mx-cell txt-right',
                        span: 11,
                        _visible: '{{$isReadOnly()}}',
                        children: '{{data.form.fpfs}}',
                    }, {
                        name: 'col3',
                        component: 'Col',
                        className: 'col',
                        span: 11,
                        _visible: '{{!$isReadOnly()}}',
                        children: {
                            name: 'tooltips-fpfs',
                            component: 'Tooltip',
                            getPopupContainer: '{{$handleGetPopupContainer}}',
                            title: '{{data.error.fpfs}}',
                            visible: '{{data.error.fpfs && data.error.fpfs.indexOf("不能为空")==-1}}',
                            overlayClassName: '-sales-error-toolTip',
                            placement: 'right',
                            children: {
                                name: 'input-fpfs',
                                component: 'NumericInput',
                                match: 'int',
                                hideTip: true,
                                disabled: '{{$notAllowEdit()}}',
                                align: 'right',
                                value: '{{data.form.fpfs}}',
                                className: '{{data.error.fpfs?"-sales-error":""}}',
                                onChange: '{{function(v){$handleFieldChangeV("data.form.fpfs",v,true)}}}',
                            }
                        },
                    }, {
                        name: 'col4',
                        component: 'Col',
                        className: 'col ant-form-item-center',
                        span: 2,
                        children: '不含税金额',
                    }, {
                        name: 'col5',
                        component: 'Col',
                        className: 'col -mx-cell p-r-8',
                        span: 6,
                        _visible: '{{$isReadOnly()}}',
                        children: '{{$numberFormat(data.form.hjje,2,false,false)}}',
                    }, {
                        name: 'col6',
                        component: 'Col',
                        className: 'col',
                        span: 6,
                        _visible: '{{!$isReadOnly()}}',
                        children: {
                            name: 'input-hjje',
                            component: '::div',
                            className: 'p-r-8',
                            // disabled: true,
                            align: 'right',
                            children: '{{$quantityFormat(data.form.hjje,2,false,false)}}'
                        }
                    }]
                }, {
                    name: 'row4',
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
                        children: '{{data.form.jzjtbz=="N"?"否":"是"}}',
                    }, {
                        name: 'col3',
                        component: 'Col',
                        className: 'col ant-form-item-center',
                        span: 4,
                        _visible: '{{!$isReadOnly()}}',
                        children: [{
                            name: 'radio-group-jzjtbz',
                            component: 'Radio.Group',
                            className: 'radio-group',
                            disabled: '{{data.other.jzjtbzDisable}}',
                            value: '{{data.form.jzjtbz}}',
                            onChange: '{{function(e){$jzjtbzChange(e.target.value)}}}',
                            children: [{
                                name: 'item-jzjtbz1',
                                component: 'Radio',
                                value: 'N',
                                children: '否',
                                className: 'radio'
                            }, {
                                name: 'item-jzjtbz2',
                                component: 'Radio',
                                value: 'Y',
                                children: '是',
                                className: 'radio'
                            }]
                        }],
                    }, {
                        name: 'col4',
                        component: 'Col',
                        className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-center ant-form-item-required"}}',
                        span: 3,
                        children: '计税方式',
                    }, {
                        name: 'col5',
                        component: 'Col',
                        className: 'col ant-form-item-center',
                        span: 13,
                        _visible: '{{$isReadOnly()}}',
                        children: '{{((data.jsfsList || []).find(function(f){return f.jsfsDm===data.form.jsfsDm}) || {}).jsfsMc}}',
                    }, {
                        name: 'col6',
                        component: 'Col',
                        className: '{{data.error.jsfsDm?"col ant-form-item-center -sales-error":"col ant-form-item-center"}}',
                        span: 13,
                        _visible: '{{!$isReadOnly()}}',
                        children: {
                            name: 'radio-group-jsfsDm',
                            component: 'Radio.Group',
                            className: 'radio-group',
                            value: '{{((data.jsfsList||[]).find(function(f){return f.jsfsDm===data.form.jsfsDm})||{}).jsfsDm}}',
                            // disabled: '{{$notAllowEdit()}}',
                            onChange: '{{function(e){$jsfsChange(data.form,e.target.value)}}}',
                            children: {
                                name: '{{"item-jsfsDm-1"+_rowIndex}}',
                                component: 'Radio',
                                value: '{{data.jsfsList[_rowIndex].jsfsDm}}',
                                children: '{{data.jsfsList[_rowIndex].jsfsMc}}',
                                className: 'radio',
                                _power: 'for in data.jsfsList',
                            }
                        },
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
            hwlxList: [],
            slList: [],
            jsfsList: [],
            jsfsListCache: [],
            slListCache: [],
            form: {
                jzjtbz: 'N',
                jsfsDm: '0',
            },
            other: {
                jzjtbzDisable: false,
            },
            error: {},

        }
    }
}