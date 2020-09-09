export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-sales-jdcxsfp',
        id: 'inv-app-sales-jdcxsfp',
        // onMouseDown: '{{$mousedown}}',
        children: {
            name: 'spin',
            component: 'Spin',
            tip: '加载中...',
            delay: 0.01,
            spinning: '{{data.loading}}',
            children: [
                {
                name: 'header',
                component: '::div',
                className: 'inv-app-sales-jdcxsfp-header',
                children: [
                //     {
                //     name: 'type-action1',
                //     component: 'Radio.Group',
                //     className: 'radio-group',
                //     children: '{{data.form.sf01==="Y"?"专用发票":"普通发票"}}',
                //     _visible: '{{$isReadOnly()}}',
                // },
                //     {
                //     name: 'type-action2',
                //     component: 'Radio.Group',
                //     className: 'radio-group',
                //     value: '{{data.form.sf01}}',
                //     disabled: '{{$notAllowEdit()}}',
                //     onChange: '{{function(e){$typeActionChange(e.target.value)}}}',
                //     _visible: '{{!$isReadOnly()}}',
                //     children: [{
                //         name: 'item1-ta',
                //         component: 'Radio',
                //         value: 'Y',
                //         children: '专用发票',
                //         className: 'radio'
                //     }, {
                //         name: 'item2-ta',
                //         component: 'Radio',
                //         value: 'N',
                //         children: '普通发票',
                //         className: 'radio'
                //     }]
                // },
                    {
                    name: 'title',
                    component: '::div',
                    className: 'inv-app-sales-jdcxsfp-header-title',
                    children: '机动车销售发票'
                }, {
                    name: 'right',
                    component: '::div',
                    className: 'inv-app-sales-jdcxsfp-header-right',
                    children: [{
                        name: 'item1',
                        component: '::div',
                        className: 'inv-app-sales-jdcxsfp-header-right-item',
                        children: [{
                            name: 'lable',
                            component: '::span',
                            className: '{{$isReadOnly()?"inv-app-sales-jdcxsfp-header-right-item-lable":"inv-app-sales-jdcxsfp-header-right-item-lable ant-form-item-required"}}',
                            children: '发票代码：',
                        }, {
                            name: 'fpdm-container',
                            className: 'inv-app-sales-jdcxsfp-header-right-item-input no-bottom-border',
                            component: '::div',
                            _visible: '{{$isReadOnly()}}',
                            children: '{{data.form.fpdm}}',
                        }, {
                            name: 'fpdm-container',
                            className: 'inv-app-sales-jdcxsfp-header-right-item-input',
                            component: '::div',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'tooltips',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.fpdm}}',
                                visible: '{{data.error.fpdm && data.error.fpdm.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'left',
                                children: {
                                    name: 'input',
                                    component: 'NumericInput',
                                    match: 'int',
                                    hideTip: true,
                                    max: 12,
                                    className: '{{data.error.fpdm?"-sales-error":""}}',
                                    // onBlur:'{{function(){$fpdmBlur(data.form.fpdm)}}}',
                                    disabled: '{{$notAllowEdit()}}',
                                    onChange: '{{function(value){$handleFieldChangeV("data.form.fpdm",value,true);$sf("data.form.sf03",value)}}}',
                                    value: '{{data.form.fpdm}}',
                                }
                            }
                        }]
                    }, {
                        name: 'item2',
                        component: '::div',
                        className: 'inv-app-sales-jdcxsfp-header-right-item',
                        children: [{
                            name: 'lable',
                            component: '::span',
                            className: '{{$isReadOnly()?"inv-app-sales-jdcxsfp-header-right-item-lable":"inv-app-sales-jdcxsfp-header-right-item-lable ant-form-item-required"}}',
                            children: '发票号码：'
                        }, {
                            name: 'fphm-container1',
                            className: 'inv-app-sales-jdcxsfp-header-right-item-input no-bottom-border',
                            component: '::div',
                            _visible: '{{$isReadOnly()}}',
                            children: '{{data.form.fphm}}',
                        }, {
                            name: 'fphm-container2',
                            className: 'inv-app-sales-jdcxsfp-header-right-item-input',
                            component: '::div',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'tooltips',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.fphm}}',
                                visible: '{{data.error.fphm && data.error.fphm.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'left',
                                children: {
                                    name: 'input-fphm',
                                    component: 'Input',
                                    maxLength: 8,
                                    className: '{{data.error.fphm?"-sales-error":""}}',
                                    disabled: '{{$notAllowEdit()}}',
                                    onChange: '{{function(e){$handleFieldChangeV("data.form.fphm",e.target.value,true);$sf("data.form.sf04",e.target.value)}}}',
                                    value: '{{data.form.fphm}}'
                                }
                            }
                        }]
                    }, {
                        name: 'item3',
                        component: '::div',
                        className: 'inv-app-sales-jdcxsfp-header-right-item',
                        children: [{
                            name: 'lable',
                            component: '::span',
                            className: '{{$isReadOnly()?"inv-app-sales-jdcxsfp-header-right-item-lable":"inv-app-sales-jdcxsfp-header-right-item-lable ant-form-item-required"}}',
                            children: '开票日期：'
                        }, {
                            name: 'kprq-container1',
                            className: 'inv-app-sales-jdcxsfp-header-right-item-input no-bottom-border',
                            component: '::div',
                            _visible: '{{$isReadOnly()}}',
                            children: '{{data.form.kprq}}',
                        }, {
                            name: 'kprq-container2',
                            className: 'inv-app-sales-jdcxsfp-header-right-item-input',
                            component: '::div',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'tooltips-kprq',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.kprq}}',
                                visible: '{{data.error.kprq && data.error.kprq.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'left',
                                children: {
                                    name: 'input',
                                    component: 'DatePicker',
                                    className: '{{data.error.kprq?"-sales-error":""}}',
                                    disabledDate: '{{$disabledDate}}',
                                    defaultPickerValue: "{{$getDefaultPickerValue()}}",
                                    defaultValue: "{{$stringToMoment((data.form.kprq),'YYYY-MM-DD')}}",
                                    disabled: '{{$notAllowEdit()}}',
                                    onChange: '{{function(v){$handleFieldChangeV("data.form.kprq",$momentToString(v,"YYYY-MM-DD"),true)}}}',
                                    allowClear: true,
                                    format: "YYYY-MM-DD",
                                    placeholder: '选择开票日期',
                                    getCalendarContainer: '{{$handleGetPopupContainer}}',
                                    value: "{{$stringToMoment((data.form.kprq),'YYYY-MM-DD')}}"
                                }
                            }
                        }]
                    }]
                }]
            },
                {
                name: 'table',
                component: '::div',
                className: 'inv-app-sales-jdcxsfp-table',
                children: [{
                        name: 'row1',
                        className: 'row',
                        component: 'Row',
                        children: [{
                            name: 'col1',
                            className: '',
                            component: 'Col',
                            span: 24,
                            children: [{
                                name: 'row1',
                                component: 'Row',
                                children: [{
                                    name: 'col1',
                                    component: 'Col',
                                    className: 'col ant-form-item-center bg',
                                    span: 6,
                                    children: '机打代码',
                                }, {
                                    name: 'col2',
                                    component: 'Col',
                                    className: 'col p-l-8',
                                    span: 18,
                                    children: '{{data.form.sf03}}',
                                }]
                            }, {
                                name: 'row2',
                                component: 'Row',
                                children: [{
                                    name: 'col1',
                                    className: 'col ant-form-item-center bg',
                                    component: 'Col',
                                    span: 6,
                                    children: '机打号码',
                                }, {
                                    name: 'col2',
                                    component: 'Col',
                                    className: 'col p-l-8',
                                    span: 18,
                                    children: '{{data.form.sf04}}',
                                }]
                            }, {
                                name: 'row3',
                                component: 'Row',
                                children: [{
                                    name: 'col1',
                                    component: 'Col',
                                    className: 'col ant-form-item-center bg',
                                    span: 6,
                                    children: '机器编号',
                                }, {
                                    name: 'col2',
                                    component: 'Col',
                                    className: 'col -mx-cell',
                                    span: 18,
                                    _visible: '{{$isReadOnly()}}',
                                    title: '{{data.form.jqbh}}',
                                    children: '{{data.form.jqbh}}',
                                }, {
                                    name: 'col2',
                                    component: 'Col',
                                    className: 'col',
                                    span: 18,
                                    _visible: '{{!$isReadOnly()}}',
                                    children: {
                                        name: 'input-jqbh',
                                        component: 'Input',
                                        disabled: '{{$notAllowEdit()}}',
                                        title: '{{data.form.jqbh}}',
                                        value: '{{data.form.jqbh}}',
                                        onChange: '{{function(e){$sf("data.form.jqbh",e.target.value)}}}',
                                    },
                                }]
                            }, {
                                name: 'row4',
                                component: 'Row',
                                children: [{
                                    name: 'col1',
                                    component: 'Col',
                                    className: '{{$isReadOnly()?"col ant-form-item-center bg":"col ant-form-item-center bg ant-form-item-required"}}',
                                    span: 6,
                                    children: '购方名称',
                                }, {
                                    name: 'col2',
                                    component: 'Col',
                                    className: 'col -mx-cell',
                                    span: 18,
                                    _visible: '{{$isReadOnly()}}',
                                    title: '{{data.error.gfmc}}',
                                    children: '{{data.error.gfmc}}',
                                }, {
                                    name: 'col2',
                                    component: 'Col',
                                    className: 'col',
                                    span: 18,
                                    _visible: '{{!$isReadOnly()}}',
                                    children: {
                                        name: 'tooltips-gfmc',
                                        component: 'Tooltip',
                                        getPopupContainer: '{{$handleGetPopupContainer}}',
                                        title: '{{data.error.gfmc}}',
                                        visible: '{{data.error.gfmc && data.error.gfmc.indexOf("不能为空")==-1}}',
                                        overlayClassName: '-sales-error-toolTip',
                                        placement: 'topLeft',
                                        children: {
                                            className: '{{data.error.gfmc?"-sales-error":""}}',
                                            name: 'input-gfmc',
                                            component: 'Input',
                                            title: '{{data.form.gfmc}}',
                                            value: '{{data.form.gfmc}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeV("data.form.gfmc",e.target.value,true)}}}',
                                        }
                                    },
                                }]
                            }]

                        },
                          /*  {
                            name: 'col2',
                            className: 'col ant-form-item-center bg h4 wm-rl',
                            component: 'Col',
                            span: 1,
                            children: '税控码',
                        }, {
                            name: 'col3',
                            className: 'col h4',
                            component: 'Col',
                            span: 11,
                            _visible: '{{$isReadOnly()}}',
                            children: [{
                                name: 'row1',
                                component: '::div',
                                className: '-row -mx-cell',
                                title: '{{data.form.sf12}}',
                                children: '{{data.form.sf12}}',
                            }, {
                                name: 'row2',
                                component: '::div',
                                className: '-row -mx-cell',
                                title: '{{data.form.sf13}}',
                                children: '{{data.form.sf13}}',
                            }, {
                                name: 'row3',
                                component: '::div',
                                className: '-row -mx-cell',
                                title: '{{data.form.sf14}}',
                                children: '{{data.form.sf14}}',
                            }, {
                                name: 'row4',
                                component: '::div',
                                className: '-row -mx-cell',
                                title: '{{data.form.sf15}}',
                                children: '{{data.form.sf15}}',
                            }],
                        }, {
                            name: 'col4',
                            className: 'col h4',
                            component: 'Col',
                            span: 11,
                            _visible: '{{!$isReadOnly()}}',
                            children: [{
                                name: 'row1',
                                component: '::div',
                                className: '-row',
                                children: {
                                    name: 'tooltips',
                                    component: 'Tooltip',
                                    overlayClassName: '-sales-error-toolTip',
                                    placement: 'topLeft',
                                    getPopupContainer: '{{$handleGetPopupContainer}}',
                                    title: '{{data.error.sf12}}',
                                    visible: '{{data.error.sf12 && data.error.sf12.indexOf("不能为空")==-1}}',
                                    children: {
                                        className: '{{data.error.sf12?"-sales-error":""}}',
                                        name: 'row1',
                                        component: 'Input',
                                        maxLength: 36,
                                        value: '{{data.form.sf12}}',
                                        disabled: '{{$notAllowEdit()}}',
                                        onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                        onChange: '{{function(e){$handleFieldChangeV("data.form.sf12",e.target.value,true)}}}',
                                    },
                                }
                            }, {
                                name: 'row2',
                                component: '::div',
                                className: '-row',
                                children: {
                                    name: 'tooltips',
                                    component: 'Tooltip',
                                    overlayClassName: '-sales-error-toolTip',
                                    placement: 'topLeft',
                                    getPopupContainer: '{{$handleGetPopupContainer}}',
                                    title: '{{data.error.sf13}}',
                                    visible: '{{data.error.sf13 && data.error.sf13.indexOf("不能为空")==-1}}',
                                    children: {
                                        className: '{{data.error.sf13?"-sales-error":""}}',
                                        name: 'row1',
                                        component: 'Input',
                                        maxLength: 36,
                                        value: '{{data.form.sf13}}',
                                        disabled: '{{$notAllowEdit()}}',
                                        onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                        onChange: '{{function(e){$handleFieldChangeV("data.form.sf13",e.target.value,true)}}}',
                                    },
                                }
                            }, {
                                name: 'row3',
                                component: '::div',
                                className: '-row',
                                children: {
                                    name: 'tooltips',
                                    component: 'Tooltip',
                                    overlayClassName: '-sales-error-toolTip',
                                    placement: 'topLeft',
                                    getPopupContainer: '{{$handleGetPopupContainer}}',
                                    title: '{{data.error.sf14}}',
                                    visible: '{{data.error.sf14 && data.error.sf14.indexOf("不能为空")==-1}}',
                                    children: {
                                        className: '{{data.error.sf14?"-sales-error":""}}',
                                        name: 'row1',
                                        component: 'Input',
                                        maxLength: 36,
                                        value: '{{data.form.sf14}}',
                                        disabled: '{{$notAllowEdit()}}',
                                        onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                        onChange: '{{function(e){$handleFieldChangeV("data.form.sf14",e.target.value,true)}}}',
                                    },
                                }
                            }, {
                                name: 'row4',
                                component: '::div',
                                className: '-row no-bottom-border',
                                children: {
                                    name: 'tooltips',
                                    component: 'Tooltip',
                                    overlayClassName: '-sales-error-toolTip',
                                    placement: 'topLeft',
                                    getPopupContainer: '{{$handleGetPopupContainer}}',
                                    title: '{{data.error.sf15}}',
                                    visible: '{{data.error.sf15 && data.error.sf15.indexOf("不能为空")==-1}}',
                                    children: {
                                        className: '{{data.error.sf15?"-sales-error":""}}',
                                        name: 'row1',
                                        component: 'Input',
                                        maxLength: 36,
                                        value: '{{data.form.sf15}}',
                                        disabled: '{{$notAllowEdit()}}',
                                        onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                        onChange: '{{function(e){$handleFieldChangeV("data.form.sf15",e.target.value,true)}}}',
                                    },
                                }
                            }],
                        }*/]
                    }, {
                        name: 'row2',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                            children: '身份证/机构码',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 9,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.sf02}}',
                            children: '{{data.form.sf02}}',
                        }, {
                            name: 'col2-2',
                            component: 'Col',
                            span: 9,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'tooltips-sf02',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.sf02}}',
                                visible: '{{data.error.sf02 && data.error.sf02.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'topLeft',
                                children: {
                                    className: '{{data.error.sf02?"-sales-error":""}}',
                                    name: 'input-sf02',
                                    component: 'Input',
                                    maxLength: 30,
                                    disabled: '{{$notAllowEdit()}}',
                                    onChange: '{{function(e){$handleFieldChangeV("data.form.sf02",e.target.value,true);$sf("data.form.gfsbh",e.target.value)}}}',
                                    title: '{{data.form.sf02}}',
                                    value: '{{data.form.sf02}}',
                                }
                            },
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '购买识别号',
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 9,
                            className: 'col p-l-8',
                            title: '{{data.form.gfsbh}}',
                            children: '{{data.form.gfsbh}}',
                        }]
                    }, {
                        name: 'row3',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center ant-form-item-required',
                            children: '车辆类型',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 6,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.cllx}}',
                            children: '{{data.form.cllx}}',
                        }, {
                            name: 'col2-2',
                            component: 'Col',
                            span: 6,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'tooltips-cllx',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.cllx}}',
                                visible: '{{data.error.cllx && data.error.cllx.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'topLeft',
                                children: {
                                    className: '{{data.error.cllx?"-sales-error":""}}',
                                    name: 'input-cllx',
                                    component: 'Input',
                                    disabled: '{{$notAllowEdit()}}',
                                    title: '{{data.form.cllx}}',
                                    value: '{{data.form.cllx}}',
                                    onChange: '{{function(e){$sf("data.form.cllx",e.target.value)}}}',
                                },
                            },
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '厂牌型号',
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 4,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.cpxh}}',
                            children: '{{data.form.cpxh}}',
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 4,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-cpxh',
                                component: 'Input',
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.cpxh}}',
                                value: '{{data.form.cpxh}}',
                                onChange: '{{function(e){$sf("data.form.cpxh",e.target.value)}}}',
                            },
                        }, {
                            name: 'col5',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '产地',
                        }, {
                            name: 'col6',
                            component: 'Col',
                            span: 5,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.cd}}',
                            children: '{{data.form.cd}}',
                        }, {
                            name: 'col7',
                            component: 'Col',
                            span: 5,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-cd',
                                component: 'Input',
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.cd}}',
                                value: '{{data.form.cd}}',
                                onChange: '{{function(e){$sf("data.form.cd",e.target.value)}}}',
                            },
                        }]
                    },
                    {
                        name: 'row4',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '合格证号',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 6,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.hgzs}}',
                            children: '{{data.form.hgzs}}',
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 6,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-hgzs',
                                component: 'Input',
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.hgzs}}',
                                value: '{{data.form.hgzs}}',
                                onChange: '{{function(e){$sf("data.form.hgzs",e.target.value)}}}',
                            },
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '进口证明书号',
                        }, {
                            name: 'col5',
                            component: 'Col',
                            span: 4,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.jkzmsh}}',
                            children: '{{data.form.jkzmsh}}',
                        }, {
                            name: 'col6',
                            component: 'Col',
                            span: 4,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-jkzmsh',
                                component: 'Input',
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.jkzmsh}}',
                                value: '{{data.form.jkzmsh}}',
                                onChange: '{{function(e){$sf("data.form.jkzmsh",e.target.value)}}}',
                            },
                        }, {
                            name: 'col7',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '商检单号',
                        }, {
                            name: 'col8',
                            component: 'Col',
                            span: 5,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.sjdh}}',
                            children: '{{data.form.sjdh}}',
                        }, {
                            name: 'col9',
                            component: 'Col',
                            span: 5,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-sjdh',
                                component: 'Input',
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.sjdh}}',
                                value: '{{data.form.sjdh}}',
                                onChange: '{{function(e){$sf("data.form.sjdh",e.target.value)}}}',
                            },
                        }]
                    },
                    {
                        name: 'row5',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center h2',
                            children: '发动机号码',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 9,
                            className: 'col h2 p-l-8',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.fdjhm}}',
                            children: '{{data.form.fdjhm}}',
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 9,
                            className: 'col h2',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-fdjhm',
                                component: 'Input',
                                className: 'h2',
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.fdjhm}}',
                                value: '{{data.form.fdjhm}}',
                                onChange: '{{function(e){$sf("data.form.fdjhm",e.target.value)}}}',
                            },
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 4,
                            className: 'col ant-form-item-center h2',
                            children: '车辆识别代码/车架号码',
                        }, {
                            name: 'col5',
                            component: 'Col',
                            span: 8,
                            className: 'col h2 p-l-8',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.cjhm}}',
                            children: '{{data.form.cjhm}}',
                        }, {
                            name: 'col6',
                            component: 'Col',
                            span: 8,
                            className: 'col h2',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-cjhm',
                                component: 'Input',
                                className: 'h2',
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.cjhm}}',
                                value: '{{data.form.cjhm}}',
                                onChange: '{{function(e){$sf("data.form.cjhm",e.target.value)}}}',
                            },
                        }]
                    },
                    {
                        name: 'row6',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '价税合计(大写)',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 9,
                            className: 'col p-l-8',
                            title: '{{data.form.jshjDx}}',
                            children: '{{data.form.jshjDx}}',
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 4,
                            className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                            children: '价税合计(小写)',
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 8,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{$numberFormat(data.form.jshj,2,false,false)}}',
                            children: '{{$numberFormat(data.form.jshj,2,false,false)}}',
                        }, {
                            name: 'col5',
                            component: 'Col',
                            span: 8,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'tooltips-jshjxx',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.jshj}}',
                                visible: '{{data.error.jshj && data.error.jshj.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'topLeft',
                                children: {
                                    name: 'input',
                                    component: 'NumericInput',
                                    // match:'int',
                                    disabled: '{{$notAllowEdit()}}',
                                    onBlur: '{{function(v){$jshjxxBlur()}}}',
                                    hideTip: true,
                                    className: '{{data.error.jshj?"-sales-error":""}}',
                                    onChange: "{{function(v) {$jshjxxChange(v)}}}",
                                    title: '{{data.form.jshj}}',
                                    value: '{{data.form.jshj}}',
                                }
                            },
                        }]
                    },
                    {
                        name: 'row7',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                            children: '销方名称',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 9,
                            className: 'col p-l-8',
                            children: {
                                name: 'tooltips-xfmc',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.xfmc}}',
                                visible: '{{data.error.xfmc && data.error.xfmc.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'topLeft',
                                children: {
                                    name: 'input',
                                    component: '::div',
                                    className: '{{data.error.xfmc?"-sales-error":""}}',
                                    title: '{{data.form.xfmc}}',
                                    children: '{{data.form.xfmc}}',
                                }
                            },
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 4,
                            className: 'col ant-form-item-center',
                            children: '销方电话',
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 8,
                            className: 'col p-l-8',
                            title: '{{data.form.sf05}}',
                            children: '{{data.form.sf05}}',
                        }]
                    },
                    {
                        name: 'row8',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                            children: '销方识别号',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 9,
                            className: 'col p-l-8',
                            children: {
                                name: 'tooltips-xfsbh',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.xfsbh}}',
                                visible: '{{data.error.xfsbh && data.error.xfsbh.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'topLeft',
                                children: {
                                    name: 'input',
                                    component: '::div',
                                    className: '{{data.error.xfsbh?"-sales-error":""}}',
                                    title: '{{data.form.xfsbh}}',
                                    children: '{{data.form.xfsbh}}',
                                }
                            },
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 4,
                            className: 'col ant-form-item-center',
                            children: '销方账号',
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 8,
                            className: 'col p-l-8',
                            title: '{{data.form.sf06}}',
                            children: '{{data.form.sf06}}',
                        }]
                    },
                    {
                        name: 'row9',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '销方地址',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 9,
                            className: 'col p-l-8',
                            title: '{{data.form.xfdzdh}}',
                            children: '{{data.form.xfdzdh}}',
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 4,
                            className: 'col ant-form-item-center',
                            children: '销方开户银行',
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 8,
                            className: 'col  p-l-8',
                            title: '{{data.form.xfyhzh}}',
                            children: '{{data.form.xfyhzh}}',
                        }]
                    },
                    {
                        name: 'row10',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                            children: '税率',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 3,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{(data.form.zbslv || 0)*100+"%"}}',
                            children: '{{(data.form.zbslv || 0)*100+"%"}}',
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 3,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'tooltips-sl',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.zbslv}}',
                                visible: '{{data.error.zbslv && data.error.zbslv.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'topLeft',
                                children: {
                                    name: 'select-sl',
                                    component: 'Select',
                                    disabled: '{{$notAllowEdit()}}',
                                    allowClear: true,
                                    value: '{{data.form.zbslv}}',
                                    className: '{{data.error.zbslv?"-sales-error":""}}',
                                    onChange: '{{function(value){$zbslvChange(value)}}}',
                                    children: {
                                        name: '{{"item-sl"+_rowIndex}}',
                                        component: 'Select.Option',
                                        value: '{{data.slList[_rowIndex].slv}}',
                                        children: '{{data.slList[_rowIndex].slvMc}}',
                                        className: '-ttk-option',
                                        _power: 'for in data.slList',
                                    }
                                }
                            },
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 3,
                            className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                            children: '税额',
                        }, {
                            name: 'col5',
                            component: 'Col',
                            span: 3,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{$numberFormat(data.form.hjse,2,false,false)}}',
                            children: '{{$numberFormat(data.form.hjse,2,false,false)}}',
                        }, {
                            name: 'col6',
                            component: 'Col',
                            span: 3,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'tooltips-se',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.hjse}}',
                                visible: '{{data.error.hjse && data.error.hjse.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'topLeft',
                                children: {
                                    name: 'input',
                                    // align: 'right',
                                    component: '::div',
                                    className: '{{data.other.seError?"-sales-error p-l-8":"p-l-8"}}',
                                    title: '{{data.form.hjse}}',
                                    children: '{{data.form.hjse}}',
                                }
                            },
                        }, {
                            name: 'col7',
                            component: 'Col',
                            span: 4,
                            className: 'col ant-form-item-center',
                            children: '税务机关代码',
                        }, {
                            name: 'col8',
                            component: 'Col',
                            span: 8,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.swjgDm}}',
                            children: '{{data.form.swjgDm}}',
                        }, {
                            name: 'col9',
                            component: 'Col',
                            span: 8,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-swjgdm',
                                component: 'Input',
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.swjgDm}}',
                                value: '{{data.form.swjgDm}}',
                                maxLength: 12,
                                onChange: '{{function(e){$sf("data.form.swjgDm",e.target.value)}}}',
                            },
                        }]
                    },
                    {
                        name: 'row11',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '不含税价',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 6,
                            className: 'col p-l-8',
                            title: '{{$numberFormat(data.form.hjje,2,false,false)}}',
                            children: '{{$numberFormat(data.form.hjje,2,false,false)}}',
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '完税凭证号码',
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 4,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.wspzhm}}',
                            children: '{{data.form.wspzhm}}',
                        }, {
                            name: 'col5',
                            component: 'Col',
                            span: 4,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-wspzhm',
                                component: 'Input',
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.wspzhm}}',
                                value: '{{data.form.wspzhm}}',
                                onChange: '{{function(e){$sf("data.form.wspzhm",e.target.value)}}}',
                            },
                        }, {
                            name: 'col6',
                            component: 'Col',
                            span: 2,
                            className: 'col ant-form-item-center',
                            children: '吨位',
                        }, {
                            name: 'col7',
                            component: 'Col',
                            span: 2,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.sf07}}',
                            children: '{{data.form.sf07}}',
                        }, {
                            name: 'col8',
                            component: 'Col',
                            span: 2,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-dw',
                                component: 'NumericInput',
                                // match: 'int',
                                max: 8,
                                hideTip: true,
                                title: '{{data.form.sf07}}',
                                value: '{{data.form.sf07}}',
                                onChange: '{{function(value){$sf("data.form.sf07",value)}}}',
                            },
                        }, {
                            name: 'col9',
                            component: 'Col',
                            span: 2,
                            className: 'col ant-form-item-center',
                            children: '限乘人数',
                        }, {
                            name: 'co20',
                            component: 'Col',
                            span: 2,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.xcrs}}',
                            children: '{{data.form.xcrs}}',
                        }, {
                            name: 'co21',
                            component: 'Col',
                            span: 2,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-xcrs',
                                component: 'NumericInput',
                                match: 'int',
                                hideTip: true,
                                max: 4,
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.xcrs}}',
                                value: '{{data.form.xcrs}}',
                                onChange: '{{function(value){$sf("data.form.xcrs",value)}}}',
                            },
                        }]
                    },
                    {
                        name: 'row12',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                            children: '计税方式',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 3,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{((data.jsfsList || []).find(function(f){return f.jsfsDm===data.form.jsfsDm}) || {}).jsfsMc}}',
                            children: '{{((data.jsfsList || []).find(function(f){return f.jsfsDm===data.form.jsfsDm}) || {}).jsfsMc}}',
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 3,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'tooltips-jsfs',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                title: '{{data.error.jsfsDm}}',
                                visible: '{{data.error.jsfsDm && data.error.jsfsDm.indexOf("不能为空")==-1}}',
                                overlayClassName: '-sales-error-toolTip',
                                placement: 'topLeft',
                                children: {
                                    name: 'select-jsfsDm',
                                    component: 'Select',
                                    value: '{{data.form.jsfsDm}}',
                                    allowClear: true,
                                    // disabled: '{{$notAllowEdit()}}',
                                    className: '{{data.error.jsfsDm?"-sales-error":""}}',
                                    onChange: '{{function(value){$jsfsChange(value)}}}',
                                    children: {
                                        name: '{{"item-jsfs"+_rowIndex}}',
                                        component: 'Select.Option',
                                        value: '{{data.jsfsList[_rowIndex].jsfsDm}}',
                                        children: '{{data.jsfsList[_rowIndex].jsfsMc}}',
                                        className: '-ttk-option',
                                        _power: 'for in data.jsfsList',
                                    }
                                }
                            },
                        }, {
                            name: 'col4',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '作废标识',
                        }, {
                            name: 'col5',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            _visible: '{{$isReadOnly()}}',
                            children: '{{data.form.fpztDm==="1"?"否":"是"}}',
                        }, {
                            name: 'col6',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            _visible: '{{!$isReadOnly()}}',
                            children: [{
                                name: 'aadio-group-zfbz',
                                component: 'Radio.Group',
                                className: 'radio-group',
                                value: '{{data.form.fpztDm}}',
                                // disabled: '{{$notAllowEdit()}}',
                                onChange: '{{function(e){$sf("data.form.fpztDm",e.target.value)}}}',
                                children: [{
                                    name: 'item1-zfbz',
                                    component: 'Radio',
                                    value: '1',
                                    children: '否',
                                    className: 'radio'
                                }, {
                                    name: 'item2-zfbz',
                                    component: 'Radio',
                                    value: '2',
                                    children: '是',
                                    className: 'radio'
                                }]
                            }],
                        }, {
                            name: 'col7',
                            component: 'Col',
                            span: 4,
                            className: 'col ant-form-item-center',
                            children: '即征即退标识',
                        }, {
                            name: 'col8',
                            component: 'Col',
                            span: 8,
                            className: 'col ant-form-item-center',
                            _visible: '{{$isReadOnly()}}',
                            children: '{{data.form.jzjtbz==="N"?"否":"是"}}',
                        }, {
                            name: 'col9',
                            component: 'Col',
                            span: 8,
                            className: 'col ant-form-item-center',
                            _visible: '{{!$isReadOnly()}}',
                            children: [{
                                name: 'aadio-group-jzjtbz',
                                component: 'Radio.Group',
                                className: 'radio-group',
                                value: '{{data.form.jzjtbz}}',
                                disabled: true,
                                onChange: '{{function(e){$sf("data.form.jzjtbz",e.target.value)}}}',
                                children: [{
                                    name: 'item1-jzjtbz',
                                    component: 'Radio',
                                    value: 'N',
                                    children: '否',
                                    className: 'radio'
                                }, {
                                    name: 'item2-jzjtbz',
                                    component: 'Radio',
                                    value: 'Y',
                                    children: '是',
                                    className: 'radio'
                                }]
                            }],
                        }]
                    },
                    {
                        name: 'row13',
                        component: 'Row',
                        className: 'row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            span: 3,
                            className: 'col ant-form-item-center',
                            children: '备注',
                        }, {
                            name: 'col2',
                            component: 'Col',
                            span: 21,
                            className: 'col -mx-cell',
                            _visible: '{{$isReadOnly()}}',
                            title: '{{data.form.bz}}',
                            children: '{{data.form.bz}}',
                        }, {
                            name: 'col3',
                            component: 'Col',
                            span: 21,
                            className: 'col',
                            _visible: '{{!$isReadOnly()}}',
                            children: {
                                name: 'input-bz',
                                component: 'Input',
                                disabled: '{{$notAllowEdit()}}',
                                title: '{{data.form.bz}}',
                                value: '{{data.form.bz}}',
                                onChange: '{{function(e){$sf("data.form.bz",e.target.value)}}}',
                            },
                        }]
                    }
                ]
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
                    disabled:'{{data.justShow}}',
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
            justShow:false,
            hwlxList: [],
            slList: [],
            jsfsList: [],
            slListCache: [],
            jsfsListCache: [],
            form: {
                jzjtbz: 'N', //jzjtbz, 即征即退标志：Y:是，N：否
                fpztDm: '1', //zfbz, 作废标志 
                sf01: 'Y', //预留字段(Y：专票，N：普票）
            },
            error: {

            },
            other: {
                jzjtbzDisabled: true,
            }
        }
    }
}