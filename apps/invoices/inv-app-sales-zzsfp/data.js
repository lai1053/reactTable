export function getMeta() {
    return {
        name: "root",
        component: "Layout",
        className: "inv-app-sales-zzsfp",
        onMouseDown: "{{$mousedown}}",
        children: {
            name: "spin",
            component: "Spin",
            tip: "加载中...",
            delay: 0.01,
            spinning: "{{data.loading}}",
            // _visable: false,
            children: [
                {
                    name: "top",
                    component: "::div",
                    className: "inv-app-sales-zzsfp-header",
                    children: [
                        {
                            name: "title",
                            component: "::div",
                            className: "title",
                            children: "{{data.fpzlDm === '10'? '增值税专用发票（代开）':'增值税专用发票'}}"
                        },
                        {
                            name: "right",
                            component: "::div",
                            className: "right",
                            children: [
                                {
                                    name: "row1",
                                    component: "Row",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 10,
                                            className:
                                                '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                                            children: "发票代码："
                                        },
                                        {
                                            name: "col2",
                                            style:
                                                '{{{return{"margin-top":"0px"}}}}',
                                            component: "Col",
                                            span: 14,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.fpdm}}"
                                        },
                                        {
                                            name: "col3",
                                            className: "",
                                            component: "Col",
                                            span: 14,
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "tooltips",
                                                component: "Tooltip",
                                                getPopupContainer:
                                                    "{{$handleGetPopupContainer}}",
                                                title: "{{data.error.fpdm}}",
                                                visible:
                                                    '{{data.error.fpdm && data.error.fpdm.indexOf("不能为空")==-1}}',
                                                overlayClassName:
                                                    "-sales-error-toolTip",
                                                placement: "left",
                                                children: {
                                                    name: "input",
                                                    component: "NumericInput",
                                                    match: "int",
                                                    hideTip: true,
                                                    max: 10,
                                                    disabled:
                                                        "{{$notAllowEdit()}}",
                                                    className:
                                                        '{{data.error.fpdm?"-sales-error":""}}',
                                                    // onBlur: '{{function(){$fpdmBlur(data.form.fpdm)}}}',
                                                    onChange:
                                                        '{{function(value){$handleFieldChangeV("data.form.fpdm",value,true)}}}',
                                                    value: "{{data.form.fpdm}}"
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    name: "row2",
                                    component: "Row",
                                    className: "",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 10,
                                            className:
                                                '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                                            children: "发票号码："
                                        },
                                        {
                                            name: "col2",
                                            style:
                                                '{{{return{"margin-top":"0px"}}}}',
                                            component: "Col",
                                            span: 14,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.fphm}}"
                                        },
                                        {
                                            name: "col3",
                                            className: "",
                                            component: "Col",
                                            span: 14,
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "tooltips",
                                                component: "Tooltip",
                                                overlayClassName:
                                                    "-sales-error-toolTip",
                                                placement: "left",
                                                getPopupContainer:
                                                    "{{$handleGetPopupContainer}}",
                                                title: "{{data.error.fphm}}",
                                                visible:
                                                    '{{data.error.fphm && data.error.fphm.indexOf("不能为空")==-1}}',
                                                children: {
                                                    className:
                                                        '{{data.error.fphm?"-sales-error":""}}',
                                                    name: "input",
                                                    component: "Input",
                                                    maxLength: 8,
                                                    disabled:
                                                        "{{$notAllowEdit()}}",
                                                    onChange:
                                                        '{{function(e){$handleFieldChangeV("data.form.fphm",e.target.value,true)}}}',
                                                    value: "{{data.form.fphm}}"
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    name: "row3",
                                    component: "Row",
                                    className: "",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 10,
                                            className:
                                                '{{$isReadOnly()?"col ant-form-item-center":"col ant-form-item-required ant-form-item-center"}}',
                                            children: "开票日期："
                                        },
                                        {
                                            name: "col2",
                                            style:
                                                '{{{return{"margin-top":"0px"}}}}',
                                            component: "Col",
                                            span: 14,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.kprq}}"
                                        },
                                        {
                                            name: "col3",
                                            className: "",
                                            component: "Col",
                                            span: 14,
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "tooltips-kprq",
                                                component: "Tooltip",
                                                overlayClassName:
                                                    "-sales-error-toolTip",
                                                getPopupContainer:
                                                    "{{$handleGetPopupContainer}}",
                                                title: "{{data.error.kprq}}",
                                                visible:
                                                    '{{data.error.kprq && data.error.kprq.indexOf("不能为空")==-1}}',
                                                placement: "left",
                                                children: {
                                                    name: "input",
                                                    component: "DatePicker",
                                                    className:
                                                        '{{data.error.kprq?"-sales-error":""}}',
                                                    disabledDate:
                                                        "{{$disabledDate}}",
                                                    defaultPickerValue:
                                                        "{{$getDefaultPickerValue()}}",
                                                    defaultValue:
                                                        "{{$stringToMoment((data.form.kprq),'YYYY-MM-DD')}}",
                                                    disabled:
                                                        "{{$notAllowEdit()}}",
                                                    onChange:
                                                        '{{function(v){$handleFieldChangeV("data.form.kprq",$momentToString(v,"YYYY-MM-DD"),true)}}}',
                                                    allowClear: true,
                                                    format: "YYYY-MM-DD",
                                                    placeholder: "选择开票日期",
                                                    getCalendarContainer:
                                                        "{{$handleGetPopupContainer}}",
                                                    value:
                                                        "{{$stringToMoment((data.form.kprq),'YYYY-MM-DD')}}"
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "buyer",
                    component: "Row",
                    className: "buyer",
                    children: [
                        {
                            name: "col1",
                            component: "Col",
                            span: 1,
                            className: "v-rl",
                            children: "购买方"
                        },
                        {
                            name: "col2",
                            component: "Col",
                            span: 23,
                            className: "grid",
                            children: [
                                {
                                    name: "row1",
                                    component: "Row",
                                    className: "",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 7,
                                            className:
                                                '{{$isReadOnly()?"col txt-right":"col ant-form-item-required txt-right"}}',
                                            children: "名称"
                                        },
                                        {
                                            name: "col2",
                                            component: "Col",
                                            span: 17,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.gfmc}}"
                                        },
                                        {
                                            name: "col2",
                                            component: "Col",
                                            span: 17,
                                            className: "no-padding",
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "tooltips-gfmc",
                                                component: "Tooltip",
                                                overlayClassName:
                                                    "-sales-error-toolTip",
                                                getPopupContainer:
                                                    "{{$handleGetPopupContainer}}",
                                                title: "{{data.error.gfmc}}",
                                                visible:
                                                    '{{data.error.gfmc && data.error.gfmc.indexOf("不能为空")==-1}}',
                                                placement: "topLeft",
                                                children: {
                                                    className:
                                                        '{{data.error.gfmc?"-sales-error":""}}',
                                                    name: "input-gfmc",
                                                    component: "Input",
                                                    title: "{{data.form.gfmc}}",
                                                    disabled:
                                                        "{{$notAllowEdit()}}",
                                                    onChange:
                                                        '{{function(e){$handleFieldChangeV("data.form.gfmc",e.target.value,true)}}}',
                                                    value: "{{data.form.gfmc}}"
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    name: "row2",
                                    component: "Row",
                                    className: "",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 7,
                                            className:
                                                '{{$isReadOnly()?"col txt-right":"col ant-form-item-required txt-right"}}',
                                            children: "纳税人识别号"
                                        },
                                        {
                                            name: "col2",
                                            component: "Col",
                                            span: 17,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.gfsbh}}"
                                        },
                                        {
                                            name: "col2",
                                            component: "Col",
                                            span: 17,
                                            className: "no-padding",
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "tooltips-gfsbh",
                                                component: "Tooltip",
                                                overlayClassName:
                                                    "-sales-error-toolTip",
                                                getPopupContainer:
                                                    "{{$handleGetPopupContainer}}",
                                                title: "{{data.error.gfsbh}}",
                                                visible:
                                                    '{{data.error.gfsbh && data.error.gfsbh.indexOf("不能为空")==-1}}',
                                                placement: "topLeft",
                                                children: {
                                                    name: "input-gfsbh",
                                                    component: "Input",
                                                    maxLength: 30,
                                                    className:
                                                        '{{data.error.gfsbh?"-sales-error":""}}',
                                                    disabled:
                                                        "{{$notAllowEdit()}}",
                                                    onChange:
                                                        '{{function(e){$handleFieldChangeV("data.form.gfsbh",e.target.value,true)}}}',
                                                    title:
                                                        "{{data.form.gfsbh}}",
                                                    value: "{{data.form.gfsbh}}"
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    name: "row3",
                                    component: "Row",
                                    className: "",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 7,
                                            className: "txt-right",
                                            children: "地址、电话"
                                        },
                                        {
                                            name: "col2",
                                            component: "Col",
                                            span: 17,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.gfdzdh}}"
                                        },
                                        {
                                            name: "col2",
                                            component: "Col",
                                            span: 17,
                                            className: "no-padding",
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "input-gfdzdh",
                                                component: "Input",
                                                title: "{{data.form.gfdzdh}}",
                                                disabled: "{{$notAllowEdit()}}",
                                                onChange:
                                                    '{{function(e){$handleFieldChangeV("data.form.gfdzdh",e.target.value,false)}}}',
                                                value: "{{data.form.gfdzdh}}"
                                            }
                                        }
                                    ]
                                },
                                {
                                    name: "row4",
                                    component: "Row",
                                    className: "",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 7,
                                            className: "txt-right",
                                            children: "开户行及账号"
                                        },
                                        {
                                            name: "col2",
                                            component: "Col",
                                            span: 17,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.gfyhzh}}"
                                        },
                                        {
                                            name: "col2",
                                            component: "Col",
                                            span: 17,
                                            className: "no-padding",
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "input-gfyhzh",
                                                component: "Input",
                                                disabled: "{{$notAllowEdit()}}",
                                                onChange:
                                                    '{{function(e){$handleFieldChangeV("data.form.gfyhzh",e.target.value,false)}}}',
                                                title: "{{data.form.gfyhzh}}",
                                                value: "{{data.form.gfyhzh}}"
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                      /*  {
                            name: "col3",
                            component: "Col",
                            span: 1,
                            className: "v-rl",
                            children: "密码区"
                        },
                        {
                            name: "col4",
                            component: "Col",
                            span: 10,
                            className: "grid",
                            children: [
                                {
                                    name: "row1",
                                    component: "Row",
                                    className: "no-padding",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 24,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.sf12}}"
                                        },
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 24,
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "tooltips",
                                                component: "Tooltip",
                                                overlayClassName:
                                                    "-sales-error-toolTip",
                                                placement: "topLeft",
                                                getPopupContainer:
                                                    "{{$handleGetPopupContainer}}",
                                                title: "{{data.error.sf12}}",
                                                visible:
                                                    '{{data.error.sf12 && data.error.sf12.indexOf("不能为空")==-1}}',
                                                children: {
                                                    className:
                                                        '{{data.error.sf12?"-sales-error":""}}',
                                                    name: "row1",
                                                    component: "Input",
                                                    maxLength: 36,
                                                    value: "{{data.form.sf12}}",
                                                    disabled:
                                                        "{{$notAllowEdit()}}",
                                                    onKeyUp:
                                                        "{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                    onChange:
                                                        '{{function(e){$handleFieldChangeV("data.form.sf12",e.target.value,true)}}}'
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    name: "row2",
                                    component: "Row",
                                    className: "no-padding",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 24,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.sf13}}"
                                        },
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 24,
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "tooltips",
                                                component: "Tooltip",
                                                overlayClassName:
                                                    "-sales-error-toolTip",
                                                placement: "topLeft",
                                                getPopupContainer:
                                                    "{{$handleGetPopupContainer}}",
                                                title: "{{data.error.sf13}}",
                                                visible:
                                                    '{{data.error.sf13 && data.error.sf13.indexOf("不能为空")==-1}}',
                                                children: {
                                                    className:
                                                        '{{data.error.sf13?"-sales-error":""}}',
                                                    name: "row1",
                                                    component: "Input",
                                                    maxLength: 36,
                                                    value: "{{data.form.sf13}}",
                                                    disabled:
                                                        "{{$notAllowEdit()}}",
                                                    onKeyUp:
                                                        "{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                    onChange:
                                                        '{{function(e){$handleFieldChangeV("data.form.sf13",e.target.value,true)}}}'
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    name: "row3",
                                    component: "Row",
                                    className: "no-padding",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 24,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.sf14}}"
                                        },
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 24,
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "tooltips",
                                                component: "Tooltip",
                                                overlayClassName:
                                                    "-sales-error-toolTip",
                                                placement: "topLeft",
                                                getPopupContainer:
                                                    "{{$handleGetPopupContainer}}",
                                                title: "{{data.error.sf14}}",
                                                visible:
                                                    '{{data.error.sf14 && data.error.sf14.indexOf("不能为空")==-1}}',
                                                children: {
                                                    className:
                                                        '{{data.error.sf14?"-sales-error":""}}',
                                                    name: "row1",
                                                    component: "Input",
                                                    maxLength: 36,
                                                    value: "{{data.form.sf14}}",
                                                    disabled:
                                                        "{{$notAllowEdit()}}",
                                                    onKeyUp:
                                                        "{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                    onChange:
                                                        '{{function(e){$handleFieldChangeV("data.form.sf14",e.target.value,true)}}}'
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    name: "row4",
                                    component: "Row",
                                    className: "no-padding",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 24,
                                            _visible: "{{$isReadOnly()}}",
                                            children: "{{data.form.sf15}}"
                                        },
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 24,
                                            _visible: "{{!$isReadOnly()}}",
                                            children: {
                                                name: "tooltips",
                                                component: "Tooltip",
                                                overlayClassName:
                                                    "-sales-error-toolTip",
                                                placement: "topLeft",
                                                getPopupContainer:
                                                    "{{$handleGetPopupContainer}}",
                                                title: "{{data.error.sf15}}",
                                                visible:
                                                    '{{data.error.sf15 && data.error.sf15.indexOf("不能为空")==-1}}',
                                                children: {
                                                    className:
                                                        '{{data.error.sf15?"-sales-error":""}}',
                                                    name: "row1",
                                                    component: "Input",
                                                    maxLength: 36,
                                                    value: "{{data.form.sf15}}",
                                                    disabled:
                                                        "{{$notAllowEdit()}}",
                                                    onKeyUp:
                                                        "{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                    onChange:
                                                        '{{function(e){$handleFieldChangeV("data.form.sf15",e.target.value,true)}}}'
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        }*/
                    ]
                },
                {
                    name: "details",
                    component: "DataGrid",
                    className: "inv-app-sales-zzsfp-details",
                    headerHeight: 35,
                    rowHeight: 24,
                    rowsCount: "{{data.form.details.length}}",
                    key: "{{data.other.randomKey}}",
                    readonly: "{{$isReadOnly()}}", //不允许增减行
                    enableAddDelrow: true,
                    // style: '{{{return{height: data.other.detailHeight}}}}',
                    onAddrow: "{{$addRow}}",
                    onDelrow: "{{$delRow}}",
                    onKeyDown: "{{$gridKeydown}}",
                    ellipsis: true,
                    footerHeight: 24,
                    heightFromRowsCount: true,
                    sequenceFooter: {
                        name: "footer",
                        component: "DataGrid.Cell"
                    },
                    columns: [
                        {
                            name: "hwmc",
                            component: "DataGrid.Column",
                            columnKey: "hwmc",
                            width: 200 * 0.9,
                            // flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                className:
                                    '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
                                children: "货物或应税劳务、服务名称"
                            },
                            cell: {
                                name: "cell",
                                disabled: "{{$notAllowEdit()}}",
                                component: "Row",
                                className:
                                    '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].hwmc?"inv-app-product-select -sales-div-error":"inv-app-product-select"}}',
                                children: [
                                    {
                                        _visible: "{{$isReadOnly()}}",
                                        name: "col",
                                        component: "::div",
                                        className: "-mx-cell",
                                        title:
                                            "{{data.form.details[_rowIndex].hwmc}}",
                                        children:
                                            "{{data.form.details[_rowIndex].hwmc}}"
                                    },
                                    {
                                        _visible: "{{!$isReadOnly()}}",
                                        name:
                                            '{{"inv-app-product-select"+_rowIndex}}',
                                        component: "Input",
                                        className: "inv-app-product-select",
                                        disabled: "{{$notAllowEdit()}}",
                                        onChange:
                                            '{{function(e){$onCellChange(_rowIndex,"hwmc",e.target.value)}}}',
                                        title:
                                            "{{data.form.details[_rowIndex].hwmc}}",
                                        value:
                                            "{{data.form.details[_rowIndex].hwmc}}",
                                        addonAfter: {
                                            name: "btn",
                                            component: "::span",
                                            className: "btn",
                                            children: "...",
                                            disabled: "{{$notAllowEdit()}}",
                                            onClick:
                                                "{{function(){if(!$notAllowEdit()){$hwmcClick(_rowIndex)}}}}"
                                        }
                                    }
                                ],
                                _power: "({rowIndex}) => rowIndex"
                            },
                            footer: {
                                name: "footer",
                                component: "DataGrid.Cell",
                                className: "txt-right bg",
                                children: "合计"
                            }
                        },
                        {
                            name: "ggxh",
                            component: "DataGrid.Column",
                            columnKey: "ggxh",
                            width: 100 * 0.9,
                            flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                children: "规格型号"
                            },
                            cell: {
                                name: "cell",
                                component: "::div",
                                disabled: "{{$notAllowEdit()}}",
                                children: [
                                    {
                                        _visible: "{{$isReadOnly()}}",
                                        name: "col",
                                        component: "::div",
                                        className: "-mx-cell",
                                        title:
                                            "{{data.form.details[_rowIndex].ggxh}}",
                                        children:
                                            "{{data.form.details[_rowIndex].ggxh}}"
                                    },
                                    {
                                        _visible: "{{!$isReadOnly()}}",
                                        name:
                                            '{{"sales-zzsfp-cell-ggxh-"+_rowIndex}}',
                                        component: "Input",
                                        disabled: "{{$notAllowEdit()}}",
                                        key:
                                            '{{"sales-zzsfp-cell-ggxh-"+_rowIndex}}',
                                        onChange:
                                            '{{function(e){$onCellChange(_rowIndex,"ggxh",e.target.value)}}}',
                                        title:
                                            "{{data.form.details[_rowIndex].ggxh}}",
                                        value:
                                            "{{data.form.details[_rowIndex].ggxh}}"
                                    }
                                ],
                                _power: "({rowIndex}) => rowIndex"
                            }
                        },
                        {
                            name: "dw",
                            component: "DataGrid.Column",
                            columnKey: "dw",
                            width: 60 * 0.9,
                            // flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                children: "单位"
                            },
                            cell: {
                                name: "cell",
                                component: "::div",
                                disabled: "{{$notAllowEdit()}}",
                                children: [
                                    {
                                        _visible: "{{$isReadOnly()}}",
                                        name: "col",
                                        component: "::div",
                                        className: "-mx-cell",
                                        title:
                                            "{{data.form.details[_rowIndex].dw}}",
                                        children:
                                            "{{data.form.details[_rowIndex].dw}}"
                                    },
                                    {
                                        _visible: "{{!$isReadOnly()}}",
                                        name:
                                            '{{"sales-zzsfp-cell-dw-"+_rowIndex}}',
                                        component: "Input",
                                        disabled: "{{$notAllowEdit()}}",
                                        key:
                                            '{{"sales-zzsfp-cell-dw-"+_rowIndex}}',
                                        onChange:
                                            '{{function(e){$onCellChange(_rowIndex,"dw",e.target.value)}}}',
                                        title:
                                            "{{data.form.details[_rowIndex].dw}}",
                                        value:
                                            "{{data.form.details[_rowIndex].dw}}"
                                    }
                                ],
                                _power: "({rowIndex}) => rowIndex"
                            }
                        },
                        {
                            name: "sl",
                            component: "DataGrid.Column",
                            columnKey: "sl",
                            width: 60 * 0.9,
                            // flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                children: "数量"
                            },
                            cell: {
                                name: "cell",
                                component:
                                    '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                executeBlur: true,
                                onBlur:
                                    '{{function(){$inputBlur(_rowIndex,"sl")}}}',
                                precision: 2,
                                disabled: "{{$notAllowEdit()}}",
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                align: "right",
                                style:
                                    '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].sl?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                value:
                                    "{{$quantityFormat(data.form.details[_rowIndex].sl,2,$isFocus(_ctrlPath),false,true)}}",
                                title:
                                    "{{$quantityFormat(data.form.details[_rowIndex].sl,2,false,false)}}",
                                onChange:
                                    '{{function(v){$onCellChange(_rowIndex,"sl",v)}}}',
                                _power: "({rowIndex}) => rowIndex"
                            }
                        },
                        {
                            name: "dj",
                            component: "DataGrid.Column",
                            columnKey: "dj",
                            width: 80 * 0.9,
                            // flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                children: "单价"
                            },
                            cell: {
                                name: '{{"sales-zzsfp-cell-dj-"+_rowIndex}}',
                                component: "DataGrid.TextCell",
                                className: "txt-right disabled",
                                // disabled: '{{$notAllowEdit()}}',
                                title: "{{data.form.details[_rowIndex].dj}}",
                                value:
                                    "{{$quantityFormat(data.form.details[_rowIndex].dj,4,false,false)}}",
                                _power: "({rowIndex}) => rowIndex"
                            }
                        },
                        {
                            name: "je",
                            component: "DataGrid.Column",
                            columnKey: "je",
                            width: 120 * 0.9,
                            // flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                className:
                                    '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
                                children: "金额"
                            },
                            cell: {
                                name: "cell",
                                component:
                                    '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                executeBlur: true,
                                onBlur:
                                    '{{function(){$inputBlur(_rowIndex,"je")}}}',
                                precision: 2,
                                disabled: "{{$notAllowEdit()}}",
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                align: "right",
                                style:
                                    '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].je?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                value:
                                    "{{$quantityFormat(data.form.details[_rowIndex].je,2,$isFocus(_ctrlPath),false,true)}}",
                                title:
                                    "{{$quantityFormat(data.form.details[_rowIndex].je,2,false,false)}}",
                                onChange:
                                    '{{function(v){$onCellChange(_rowIndex,"je",v)}}}',
                                _power: "({rowIndex}) => rowIndex"
                            },
                            footer: {
                                name: "footer",
                                component: "DataGrid.Cell",
                                className: "txt-right",
                                title: "{{$amountTotal(false)}}",
                                children:
                                    "{{$quantityFormat($amountTotal(false),2,false,false)}}"
                            }
                        },
                        {
                            name: "slv",
                            component: "DataGrid.Column",
                            columnKey: "slv",
                            width: 80 * 0.9,
                            // flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                className:
                                    '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
                                children: "税率"
                            },
                            cell: {
                                name: "cell",
                                component: "Row",
                                disabled: "{{$notAllowEdit()}}",
                                children: [
                                    {
                                        _visible: "{{$isReadOnly()}}",
                                        name: "col",
                                        component: "::div",
                                        className: "-mx-cell",
                                        align: "right",
                                        title:
                                            '{{data.form.details[_rowIndex].slv!==undefined&&((data.form.details[_rowIndex].slv || 0)*100 +"%")}}',
                                        children:
                                            '{{data.form.details[_rowIndex].slv!==undefined&&((data.form.details[_rowIndex].slv || 0)*100 +"%")}}'
                                    },
                                    {
                                        _visible: "{{!$isReadOnly()}}",
                                        name:
                                            '{{"sales-zzsfp-cell-slv-"+_rowIndex}}',
                                        component: "Select",
                                        value:
                                            "{{data.form.details[_rowIndex].slv}}",
                                        disabled: "{{$notAllowEdit()}}",
                                        allowClear: true,
                                        dropdownStyle: { width: "100px" },
                                        dropdownMatchSelectWidth: false,
                                        className:
                                            '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].slv?"-sales-error":""}}',
                                        onChange:
                                            '{{function(v){$onCellChange(_rowIndex,"slv",v)}}}',
                                        children: {
                                            name: '{{"item-slv"+_rowIndex}}',
                                            component: "Select.Option",
                                            value:
                                                "{{data.form.details[_rowIndex].slList[_lastIndex].slv}}",
                                            children:
                                                "{{data.form.details[_rowIndex].slList[_lastIndex].slvMc}}",
                                            className: "-ttk-option",
                                            _power:
                                                "for in data.form.details._rowIndex.slList"
                                        }
                                    }
                                ],
                                _power: "({rowIndex}) => rowIndex"
                            }
                        },
                        {
                            name: "se",
                            component: "DataGrid.Column",
                            columnKey: "se",
                            width: 100 * 0.9,
                            // flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                className:
                                    '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
                                children: "税额"
                            },
                            cell: {
                                name: "cell",
                                component:
                                    '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                executeBlur: true,
                                onBlur:
                                    '{{function(){$inputBlur(_rowIndex,"se")}}}',
                                precision: 2,
                                disabled: "{{$notAllowEdit()}}",
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                align: "right",
                                style:
                                    '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].se?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                value:
                                    "{{$quantityFormat(data.form.details[_rowIndex].se,2,$isFocus(_ctrlPath),false)}}",
                                title:
                                    "{{$quantityFormat(data.form.details[_rowIndex].se,2,false,false)}}",
                                onChange:
                                    '{{function(v){$onCellChange(_rowIndex,"se",v)}}}',
                                _power: "({rowIndex}) => rowIndex"
                            },
                            footer: {
                                name: "footer",
                                component: "DataGrid.Cell",
                                className: "txt-right",
                                title: "{{$taxAmountTotal(false)}}",
                                children:
                                    "{{$quantityFormat($taxAmountTotal(false),2,false,false)}}"
                            }
                        },
                        {
                            name: "hwlxDm",
                            component: "DataGrid.Column",
                            columnKey: "hwlxDm",
                            width: 100 * 0.9,
                            // flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                className:
                                    '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
                                children: "货物类型"
                            },
                            cell: {
                                name: "cell",
                                component:
                                    '{{!$isReadOnly()?"Select":"DataGrid.TextCell"}}',
                                // disabled: '{{$notAllowEdit()}}',
                                dropdownStyle: { width: "125px" },
                                allowClear: true,
                                dropdownMatchSelectWidth: false,
                                className:
                                    '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].hwlxDm?"-sales-error":""}}',
                                value:
                                    "{{!$isReadOnly()?data.form.details[_rowIndex].hwlxDm:((data.hwlxList || []).find(function(f){return f.hwlxDm===data.form.details[_rowIndex].hwlxDm})||{}).hwlxMc}}",
                                onChange:
                                    '{{function(v){$onCellChange(_rowIndex,"hwlxDm",v)}}}',
                                children: {
                                    _visible: "{{!$isReadOnly()}}",
                                    name: '{{"item-hwlx"+_rowIndex}}',
                                    component: "Select.Option",
                                    value:
                                        "{{data.form.details[_rowIndex].hwlxList[_lastIndex].hwlxDm}}",
                                    children:
                                        "{{data.form.details[_rowIndex].hwlxList[_lastIndex].hwlxMc}}",
                                    className: "-ttk-option",
                                    _power:
                                        "for in data.form.details._rowIndex.hwlxList"
                                },
                                _power: "({rowIndex}) => rowIndex"
                            }
                        },
                        {
                            name: "jsfsDm",
                            component: "DataGrid.Column",
                            columnKey: "jsfsDm",
                            width: 100 * 0.9,
                            // flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                className:
                                    '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}}',
                                children: "计税方式"
                            },
                            cell: {
                                name: "cell",
                                component:
                                    '{{!$isReadOnly()?"Select":"DataGrid.TextCell"}}',
                                // disabled: '{{$notAllowEdit()}}',
                                dropdownStyle: { width: "125px" },
                                dropdownMatchSelectWidth: false,
                                allowClear: true,
                                className:
                                    '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].jsfsDm?"-sales-error":""}}',
                                value:
                                    '{{((data.form.details && data.form.details[_rowIndex].jsfsList || []).find(function(f){return f.jsfsDm===data.form.details[_rowIndex].jsfsDm})||{})[!$isReadOnly()?"jsfsDm":"jsfsMc"]}}',  // 20200221修改显示 原因不明确待问weiyangQiu
                                onChange:
                                    '{{function(v){$onCellChange(_rowIndex,"jsfsDm",v)}}}',
                                children: {
                                    _visible: "{{!$isReadOnly()}}",
                                    name: '{{"item-jsfs"+_rowIndex}}',
                                    component: "Select.Option",
                                    value:
                                        "{{data.form.details[_rowIndex].jsfsList[_lastIndex].jsfsDm}}",
                                    children:
                                        "{{data.form.details[_rowIndex].jsfsList[_lastIndex].jsfsMc}}",
                                    className: "-ttk-option",
                                    _power:
                                        "for in data.form.details._rowIndex.jsfsList"
                                },
                                _power: "({rowIndex}) => rowIndex"
                            }
                        },
                        {
                            name: "jzjtDm",
                            component: "DataGrid.Column",
                            columnKey: "jzjtDm",
                            width: 100 * 0.9,
                            // flexGrow: 1,
                            header: {
                                name: "header",
                                component: "DataGrid.Cell",
                                className:
                                    '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center"}}',
                                children: "即征即退"
                            },
                            cell: {
                                name: "cell",
                                component:
                                    '{{!$isReadOnly()?"Select":"DataGrid.TextCell"}}',
                                // disabled: '{{$notAllowEdit()}}',
                                dropdownStyle: { width: "125px" },
                                dropdownMatchSelectWidth: false,
                                allowClear: true,
                                className:
                                    '{{data.error.details[_rowIndex]&&data.error.details[_rowIndex].jzjtDm?"-sales-error":""}}',
                                //value: '{{data.form.details[_rowIndex].jzjtDm }}',
                                value: '{{$isReadOnly()?data.form.details[_rowIndex].jzjtDm ==="Y"?"是":"否" :data.form.details[_rowIndex].jzjtDm}}',
    
                                onChange:
                                    '{{function(v){$onCellChange(_rowIndex,"jzjtDm",v)}}}',
                                children: {
                                    _visible: "{{!$isReadOnly()}}",
                                    name: '{{"item-jsfs"+_rowIndex}}',
                                    component: "Select.Option",
                                    value:
                                        "{{data.form.details[_rowIndex].jzjtDmList[_lastIndex].jzjtDm}}",
                                    children:
                                        "{{data.form.details[_rowIndex].jzjtDmList[_lastIndex].value}}",
                                    className: "-ttk-option",
                                    _power:
                                        "for in data.form.details._rowIndex.jzjtDmList"
                                },
                                _power: "({rowIndex}) => rowIndex"
                            }
                        },
                    ]
                },
                {
                    name: "total1",
                    component: "::div",
                    className: "total",
                    children: [
                        {
                            name: "col1",
                            component: "::div",
                            className: "col1 bg txt-right",
                            children: "价税合计(大写)"
                        },
                        {
                            name: "col2",
                            component: "::div",
                            className: "col2",
                            title: "{{$moneyToBig(true)}}",
                            children: "{{$moneyToBig(true)}}"
                        },
                        {
                            name: "col3",
                            component: "::div",
                            className: "col3 txt-right bg",
                            children: "价税合计(小写)"
                        },
                        {
                            name: "col4",
                            component: "::div",
                            className: "col4 txt-right",
                            title:
                                "{{$numberFormat($moneyToBig(false),2,false,false)}}",
                            children:
                                "{{$numberFormat($moneyToBig(false),2,false,false)}}"
                        }
                    ]
                },
                {
                    name: "buyer",
                    component: "Row",
                    className: "buyer",
                    children: [
                        {
                            name: "col1",
                            component: "Col",
                            className: "v-rl",
                            span: 1,
                            children: "销售方"
                        },
                        {
                            name: "col2",
                            component: "Col",
                            className: "grid",
                            span: 12,
                            children: [
                                {
                                    name: "row1",
                                    component: "Row",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            className:
                                                '{{$isReadOnly()?"col txt-right":"col ant-form-item-required txt-right"}}',
                                            span: 7,
                                            children: "名称"
                                        },
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 17,
                                            className:
                                                '{{$isReadOnly()?"":"disabled"}}',
                                            title: "{{data.form.xfmc}}",
                                            children: "{{data.form.xfmc}}"
                                        }
                                    ]
                                },
                                {
                                    name: "row2",
                                    component: "Row",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            className:
                                                '{{$isReadOnly()?"col txt-right":"col ant-form-item-required txt-right"}}',
                                            span: 7,
                                            children: "纳税人识别号"
                                        },
                                        {
                                            name: "col1",
                                            component: "Col",
                                            className:
                                                '{{$isReadOnly()?"":"disabled"}}',
                                            span: 17,
                                            title: "{{data.form.xfsbh}}",
                                            children: "{{data.form.xfsbh}}"
                                        }
                                    ]
                                },
                                {
                                    name: "row3",
                                    component: "Row",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            className: "txt-right",
                                            span: 7,
                                            children: "地址、电话"
                                        },
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 17,
                                            className:
                                                '{{$isReadOnly()?"":"disabled"}}',
                                            title: "{{data.form.xfdzdh}}",
                                            children: "{{data.form.xfdzdh}}"
                                        }
                                    ]
                                },
                                {
                                    name: "row4",
                                    component: "Row",
                                    children: [
                                        {
                                            name: "col1",
                                            component: "Col",
                                            className: "txt-right",
                                            span: 7,
                                            children: "开户行及账号"
                                        },
                                        {
                                            name: "col1",
                                            component: "Col",
                                            span: 17,
                                            className:
                                                '{{$isReadOnly()?"":"disabled"}}',
                                            title: "{{data.form.xfyhzh}}",
                                            children: "{{data.form.xfyhzh}}"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name: "col3",
                            component: "Col",
                            className: "v-rl",
                            span: 1,
                            children: "备注"
                        },
                        {
                            name: "col4",
                            component: "Col",
                            className: "h4 p-l-8 p-r-8 no-ellipsis",
                            span: 10,
                            _visible: "{{$isReadOnly()}}",
                            title: "{{data.form.bz}}",
                            children: "{{data.form.bz}}"
                        },
                        {
                            name: "col5",
                            component: "Col",
                            className: "h4",
                            span: 10,
                            _visible: "{{!$isReadOnly()}}",
                            children: {
                                name: "textarea",
                                component: "Input.TextArea",
                                className: "textarea",
                                disabled: "{{$notAllowEdit()}}",
                                title: "{{data.form.bz}}",
                                value: "{{data.form.bz}}",
                                onChange:
                                    '{{function(e){$sf("data.form.bz",e.target.value)}}}'
                            }
                        }
                    ]
                },
                {
                    name: "action",
                    component: "Row",
                    className: "action",
                    children: [
                        {
                            name: "col4",
                            component: "Col",
                            span: 7,
                            className: "ant-form-item-center bg",
                            children: "作废标识"
                        },
                        {
                            name: "col5",
                            component: "Col",
                            span: 7,
                            className: "ant-form-item-center",
                            _visible: "{{$isReadOnly()}}",
                            children: '{{data.form.fpztDm==="1"?"否":"是"}}'
                        },
                        {
                            name: "col6",
                            component: "Col",
                            span:7,
                            className: "ant-form-item-center",
                            _visible: "{{!$isReadOnly()}}",
                            children: {
                                name: "radio",
                                component: "Radio.Group",
                                className: "radio-group",
                                // disabled: '{{$notAllowEdit()}}',
                                value: "{{data.form.fpztDm}}",
                                onChange:
                                    '{{function(e){$sf("data.form.fpztDm",e.target.value)}}}',
                                children: [
                                    {
                                        name: "item1",
                                        component: "Radio",
                                        value: "1",
                                        children: "否",
                                        className: "radio"
                                    },
                                    {
                                        name: "item2",
                                        component: "Radio",
                                        value: "2",
                                        children: "是",
                                        className: "radio"
                                    }
                                ]
                            }
                        },
                        {
                            name: "col1",
                            component: "Col",
                            span: 10,
                            className: "ant-form-item-center bg",
                            children: ""
                        },
                        // {
                        //     name: "col2",
                        //     component: "Col",
                        //     span: 7,
                        //     className: "ant-form-item-center",
                        //     _visible: "{{$isReadOnly()}}",
                        //     children: ''
                        // },
                        // {
                        //     name: "col3",
                        //     component: "Col",
                        //     span: 7,
                        //     className: "ant-form-item-center",
                        //     _visible: "{{!$isReadOnly()}}",
                        //     children: {
                        //         name: "radio",
                        //         component: "Radio.Group",
                        //         className: "radio-group",
                        //         disabled: "{{data.other.jzjtbzDisable}}",
                        //         value: "{{data.form.jzjtbz}}",
                        //         onChange:
                        //             '{{function(e){$sf("data.form.jzjtbz",e.target.value)}}}',
                        //         children: [
                        //             {
                        //                 name: "item1",
                        //                 component: "Radio",
                        //                 value: "N",
                        //                 children: "否",
                        //                 className: "radio"
                        //             },
                        //             {
                        //                 name: "item2",
                        //                 component: "Radio",
                        //                 value: "Y",
                        //                 children: "是",
                        //                 className: "radio"
                        //             }
                        //         ]
                        //     }
                        // },
                    ]
                },
                {
                    name: "kpr",
                    className: "kpr",
                    component: "::div",
                    children: [
                        {
                            name: "kpr-txt",
                            className: "kpr-txt",
                            component: "::span",
                            children: "开票人："
                        },
                        {
                            name: "kpr-input",
                            disabled: "{{data.justShow}}",
                            className: "kpr-input",
                            component: "Input",
                            value: "{{data.form.kpr}}",
                            onChange:
                                '{{function(e){$sf("data.form.kpr",e.target.value)}}}'
                        },
                        {
                            name:'inv-batch-custom-header-right-help-tooltip',
                            className:'',
                            component:'Tooltip',
                            _visible:"{{data.form.showDetailListButton === '1'}}",
                            title:"{{data.justShow && !data.form.gfHcfpdm ? '' :data.helpTooltip}} ",
                            //overlayClassName:'inv-batch-custom-header-right-help-tooltip',
                            // placement:"bottomLeft",
                            /* style: {
                                 display:"inline-block"
                             },*/
                            children: {
                                name:'23',
                                component:'::div',
                                style:{
                                    /*   width:'200px',
                                       height: '100px',*/
                                    display:"inline-block",
                                    marginLeft:'20px'
                                },
                                children:{
                                    name:'redDetail',
                                    component:'Button',
                                    disabled: '{{data.justShow && !data.form.gfHcfpdm}}',
                                    /*   style:{
                                           marginLeft:'20px'
                                       },*/
                                    type:'primary',
                                    onClick:'{{$redDetail}}',
                                    children:'明细清单'
                                }
                            }
                        }
                    ]
                }
            ]
        }
    };
}

export function getInitState() {
    return {
        data: {
            justShow: false,
            loading: true,
            hwlxList: [],
            slList: [],
            jsfsList: [],
            spbmList: [],
            helpTooltip:'带入原正数发票的明细清单',
            // editRow: -1, //当前编辑行
            form: {
                fplyLx: "2", //  发票来源类型，1：读取，2：录入，3：导入
                sf01: "N", //Y：专票，N：普票
                //jzjtbz: "N",
                fpztDm: "1",
                details: [{}, {}, {}, {}]
            },
            jzjtDmList:[
                {
                    jzjtDm:'Y',
                    value:'是'
                },{
                    jzjtDm:'N',
                    value: '否'
                }
    
            ],
            other: {
                detailHeight: 24 * 3 + 35,
                tableWidth: 940 - 18,
                minCount: 4,
                randomKey: 100,
                jzjtbzDisable: false
            },
            error: {
                details: []
            }
        }
    };
}
