import moment from "moment";

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-pu-toll-invoice-card',
        id: 'inv-app-pu-toll-invoice-card',
        onMouseDown: '{{$mousedown}}',
        children: [{
            name: 'spin',
            component: 'Spin',
            tip: '加载中',
            delay: 0.01,
            spinning: '{{data.loading}}',
            children: [{
                    name: 'head',
                    component: '::div',
                    className: 'inv-app-pu-toll-invoice-card-header',
                    children: [{
                            name: 'title',
                            component: '::div',
                            className: 'inv-app-pu-toll-invoice-card-header-title',
                            children: '通行费增值税电子普通发票'
                        },
                        {
                            name: 'form1',
                            component: '::div',
                            className: 'inv-app-pu-toll-invoice-card-header-form',
                            children: [{
                                    name: 'item1',
                                    component: '::div',
                                    className: 'inv-app-pu-toll-invoice-card-header-form-item',
                                    children: [{
                                            name: 'label',
                                            component: '::div',
                                            className: '{{$isReadOnly()?"inv-app-pu-toll-invoice-card-header-form-item-label ":"inv-app-pu-toll-invoice-card-header-form-item-label ant-form-item-required"}}',
                                            children: {
                                                name: 'tooltip',
                                                component: 'Tooltip',
                                                placement: 'left',
                                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                                overlayClassName: 'has-error-tooltip',
                                                title: '{{data.error.fpdm}}',
                                                visible: '{{data.error.fpdm&&data.error.fpdm.indexOf("不能为空")===-1}}',
                                                children: '发票代码：'
                                            },
                                            // children: '发票代码：'
                                        },
                                        {
                                            name: 'value',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            align: '{{$isReadOnly()?"left":""}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            maxLength: 12,
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.fpdm",e,true)}}}',
                                            className: '{{data.error.fpdm?"inv-app-pu-toll-invoice-card-header-form-item-value has-error":"inv-app-pu-toll-invoice-card-header-form-item-value"}}',
                                            value: '{{data.form.fpdm}}'
                                        }
                                    ]
                                },
                                {
                                    name: 'item2',
                                    component: '::div',
                                    className: 'inv-app-pu-toll-invoice-card-header-form-item',
                                    children: [{
                                            name: 'label',
                                            component: '::div',
                                            className: '{{$isReadOnly()?"inv-app-pu-toll-invoice-card-header-form-item-label ":"inv-app-pu-toll-invoice-card-header-form-item-label ant-form-item-required"}}',
                                            children: {
                                                name: 'tooltip',
                                                component: 'Tooltip',
                                                placement: 'left',
                                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                                overlayClassName: 'has-error-tooltip',
                                                title: '{{data.error.fphm}}',
                                                visible: '{{data.error.fphm&&data.error.fphm.indexOf("不能为空")===-1}}',
                                                children: '发票号码：',
                                                value: '{{data.form.fphm}}'
                                            },
                                            // children: '发票号码：',
                                        },
                                        {
                                            name: 'value',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            align: '{{$isReadOnly()?"left":""}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            maxLength: 8,
                                            className: '{{data.error.fphm?"inv-app-pu-toll-invoice-card-header-form-item-value has-error":"inv-app-pu-toll-invoice-card-header-form-item-value"}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.fphm",e,true)}}}',
                                            value: '{{data.form.fphm}}'
                                        }
                                    ]
                                },
                                {
                                    name: 'item3',
                                    component: '::div',
                                    className: 'inv-app-pu-toll-invoice-card-header-form-item',
                                    children: [{
                                            name: 'label',
                                            component: '::div',
                                            className: '{{$isReadOnly()?"inv-app-pu-toll-invoice-card-header-form-item-label ":"inv-app-pu-toll-invoice-card-header-form-item-label ant-form-item-required"}}',
                                            // children: {
                                            //     name: 'tooltip',
                                            //     component: 'Tooltip',
                                            //     placement: 'left',
                                            //     getPopupContainer: '{{$handleGetPopupContainer}}',
                                            //     overlayClassName: 'has-error-tooltip',
                                            //     title: '{{data.error.kprq}}',
                                            //     visible: '{{data.error.kprq}}',
                                            //     children: '开票日期：'
                                            // },
                                            children: '开票日期：'
                                        },
                                        {
                                            name: 'value',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                            align: 'left',
                                            defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                            disabledDate: '{{$disabledDateQ}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            placeholder: '',
                                            className: '{{data.error.kprq?"inv-app-pu-toll-invoice-card-header-form-item-value has-error":"inv-app-pu-toll-invoice-card-header-form-item-value"}}',
                                            onChange: '{{function(date,dateString){$handleFieldChangeV("data.form.kprq",date,true)}}}',
                                            value: '{{$isReadOnly()?(data.form.kprq?data.form.kprq.format("YYYY-MM-DD"):""):data.form.kprq}}',
                                        },
                                    ]
                                },
                            ]
                        },
                        {
                            name: 'form2',
                            component: '::div',
                            className: 'inv-app-pu-toll-invoice-card-header-form form2',
                            children: [{
                                name: 'item1',
                                component: '::div',
                                className: 'inv-app-pu-toll-invoice-card-header-form-item',
                                children: [{
                                        name: 'label',
                                        component: '::div',
                                        className: 'inv-app-pu-toll-invoice-card-header-form-item-label',
                                        children: '机器编号：'
                                    },
                                    {
                                        name: 'value',
                                        component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                        align: '{{$isReadOnly()?"left":""}}',
                                        disabled: '{{$notAllowEdit()}}',
                                        onChange: '{{function(e){$handleFieldChangeE("data.form.jqbh",e)}}}',
                                        className: 'inv-app-pu-toll-invoice-card-header-form-item-value',
                                        value: '{{data.form.jqbh}}'
                                    }
                                ]
                            }, ]
                        },
                    ]
                },
                {
                    name: 'inv-app-pu-toll-invoice-card-grid1',
                    className: 'inv-app-pu-toll-invoice-card-grid1',
                    component: '::div',
                    children: [{
                        name: 'row',
                        component: 'Row',
                        className: 'grid-row',
                        gutter: 0,
                        children: [{
                                name: 'row-col1',
                                component: 'Col',
                                span: 1,
                                children: {
                                    name: 'row-col1-col',
                                    component: '::div',
                                    className: 'row-col1-col',
                                    children: '购 买 方'
                                }
                            },
                            {
                                name: 'row-col2',
                                component: 'Col',
                                className: 'row-col2',
                                span: 23,
                                children: [{
                                        name: 'row-col2-row1',
                                        component: 'Row',
                                        gutter: 0,
                                        className: 'row-col2-row',
                                        children: [{
                                                name: 'col2-row1-col1',
                                                component: 'Col',
                                                span: 6,
                                                children: {
                                                    name: 'name',
                                                    component: '::div',
                                                    className: '{{$isReadOnly()?"head-grid-item-label ":"head-grid-item-label ant-form-item-required"}}',
                                                    children: '名称'
                                                }
                                            },
                                            {
                                                name: 'col2-row1-col2',
                                                component: 'Col',
                                                className: 'not-edit-row',
                                                span: 18,
                                                children: {
                                                    name: 'value',
                                                    component: '::div',
                                                    className: 'head-grid-item-value',
                                                    children: '{{data.form.gfmc}}'
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name: 'row-col2-row2',
                                        component: 'Row',
                                        gutter: 0,
                                        className: 'row-col2-row',
                                        children: [{
                                                name: 'col2-row2-col1',
                                                component: 'Col',
                                                span: 6,
                                                children: {
                                                    name: 'name',
                                                    component: '::div',
                                                    className: '{{$isReadOnly()?"head-grid-item-label ":"head-grid-item-label ant-form-item-required"}}',
                                                    children: '纳税人识别号'
                                                }
                                            },
                                            {
                                                name: 'col2-row2-col2',
                                                component: 'Col',
                                                className: 'not-edit-row',
                                                span: 18,
                                                children: {
                                                    name: 'tooltip',
                                                    component: '::div',
                                                    children: '{{data.form.gfsbh}}'
                                                },
                                            }
                                        ]
                                    },
                                    {
                                        name: 'row-col2-row3',
                                        component: 'Row',
                                        gutter: 0,
                                        className: 'row-col2-row',
                                        children: [{
                                                name: 'col2-row3-col1',
                                                component: 'Col',
                                                span: 6,
                                                children: {
                                                    name: 'name',
                                                    component: '::div',
                                                    className: 'head-grid-item-label',
                                                    children: '地址、电话'
                                                }
                                            },
                                            {
                                                name: 'col2-row3-col2',
                                                component: 'Col',
                                                className: 'not-edit-row',
                                                span: 18,
                                                children: {
                                                    name: 'value',
                                                    component: '::div',
                                                    className: 'head-grid-item-value',
                                                    children: '{{data.form.gfdzdh}}'
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name: 'row-col2-row4',
                                        component: 'Row',
                                        gutter: 0,
                                        className: 'row-col2-row',
                                        children: [{
                                                name: 'row-col2-row4-col1',
                                                component: 'Col',
                                                className: 'no-bottom-border',
                                                span: 6,
                                                children: {
                                                    name: 'name',
                                                    component: '::div',
                                                    className: 'head-grid-item-label',
                                                    children: '开户行及账号'
                                                }
                                            },
                                            {
                                                name: 'row-col2-row4-col2',
                                                component: 'Col',
                                                className: 'not-edit-row no-bottom-border',
                                                span: 18,
                                                children: {
                                                    name: 'value',
                                                    component: '::div',
                                                    className: 'head-grid-item-value',
                                                    children: '{{data.form.gfyhzh}}'
                                                }
                                            }
                                        ]
                                    },
                                ]
                            },
                        /*    {
                                name: 'row-col3',
                                component: 'Col',
                                span: 1,
                                children: {
                                    name: 'row-col3-col',
                                    component: '::div',
                                    className: 'row-col3-col',
                                    children: '密 码 区'
                                }
                            },
                            // {
                            //     name: 'row-col4',
                            //     component: 'Col',
                            //     span: 10,
                            //     children: {
                            //         name: 'row-col4-col',
                            //         component: '::div',
                            //         className: '{{data.error.sf12?"has-error":""}}',
                            //         children: {
                            //             name: 'textarea',
                            //             style: {
                            //                 height: 94,
                            //                 width: '99.9%'
                            //             },
                            //             component: 'Input.TextArea',
                            //             disabled: '{{$notAllowEdit()}}',
                            //             onChange: '{{function(e){$handleFieldChangeE("data.form.sf12",e)}}}',
                            //             value: '{{data.form.sf12}}'
                            //         }
                            //     }
                            // },
                            {
                                name: 'row-col4',
                                component: 'Col',
                                className: 'row-col2',
                                span: 10,
                                children: [{
                                        name: 'row-col4-row1',
                                        component: 'Row',
                                        className: 'row-col2-row',
                                        children: {
                                            name: 'row-col4-row1-col',
                                            component: 'Col',
                                            span: 24,
                                            className: '{{data.error.sf12?"has-error":""}}',
                                            children: {
                                                name: 'tooltip',
                                                component: 'Tooltip',
                                                placement: 'left',
                                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                                overlayClassName: 'has-error-tooltip',
                                                title: '{{data.error.sf12}}',
                                                visible: '{{data.error.sf12}}',
                                                children: {
                                                    name: 'input',
                                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                    align: '{{$isReadOnly()?"left":""}}',
                                                    disabled: '{{$notAllowEdit()}}',
                                                    onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                    onChange: '{{function(e){$handleFieldChangeE("data.form.sf12",e,true)}}}',
                                                    value: '{{data.form.sf12}}'
                                                }
                                            },
                                            // children: {
                                            //     name: 'input',
                                            //     component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            // align:'{{$isReadOnly()?"left":""}}',
                                            //     disabled: '{{$notAllowEdit()}}',
                                            //     onChange: '{{function(e){$handleFieldChangeE("data.form.sf12",e,true)}}}',
                                            //     value: '{{data.form.sf12}}'
                                            // }
                                        }
                                    },
                                    {
                                        name: 'row-col4-row2',
                                        component: 'Row',
                                        className: 'row-col2-row',
                                        children: {
                                            name: 'row-col4-row2-col',
                                            component: 'Col',
                                            span: 24,
                                            className: '{{data.error.sf13?"has-error":""}}',
                                            children: {
                                                name: 'tooltip',
                                                component: 'Tooltip',
                                                placement: 'left',
                                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                                overlayClassName: 'has-error-tooltip',
                                                title: '{{data.error.sf13}}',
                                                visible: '{{data.error.sf13}}',
                                                children: {
                                                    name: 'input',
                                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                    align: '{{$isReadOnly()?"left":""}}',
                                                    disabled: '{{$notAllowEdit()}}',
                                                    onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                    onChange: '{{function(e){$handleFieldChangeE("data.form.sf13",e,true)}}}',
                                                    value: '{{data.form.sf13}}'
                                                }
                                            },
                                            // children: {
                                            //     name: 'input',
                                            //     component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            // align:'{{$isReadOnly()?"left":""}}',
                                            //     disabled: '{{$notAllowEdit()}}',
                                            //     onChange: '{{function(e){$handleFieldChangeE("data.form.sf13",e,true)}}}',
                                            //     value: '{{data.form.sf13}}'
                                            // }
                                        }
                                    },
                                    {
                                        name: 'row-col4-row3',
                                        component: 'Row',
                                        className: 'row-col2-row',
                                        children: {
                                            name: 'row-col4-row3-col',
                                            component: 'Col',
                                            span: 24,
                                            className: '{{data.error.sf14?"has-error":""}}',
                                            children: {
                                                name: 'tooltip',
                                                component: 'Tooltip',
                                                placement: 'left',
                                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                                overlayClassName: 'has-error-tooltip',
                                                title: '{{data.error.sf14}}',
                                                visible: '{{data.error.sf14}}',
                                                children: {
                                                    name: 'input',
                                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                    align: '{{$isReadOnly()?"left":""}}',
                                                    disabled: '{{$notAllowEdit()}}',
                                                    onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                    onChange: '{{function(e){$handleFieldChangeE("data.form.sf14",e,true)}}}',
                                                    value: '{{data.form.sf14}}'
                                                }
                                            },
                                            // children: {
                                            //     name: 'input',
                                            //     component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            // align:'{{$isReadOnly()?"left":""}}',
                                            //     disabled: '{{$notAllowEdit()}}',
                                            //     onChange: '{{function(e){$handleFieldChangeE("data.form.sf14",e,true)}}}',
                                            //     value: '{{data.form.sf14}}'
                                            // }
                                        }
                                    },
                                    {
                                        name: 'row-col4-row4',
                                        component: 'Row',
                                        className: 'row-col2-row',
                                        children: {
                                            name: 'row-col4-row4-col',
                                            component: 'Col',
                                            span: 24,
                                            className: '{{data.error.sf15?"no-bottom-border has-error":"no-bottom-border"}}',
                                            children: {
                                                name: 'tooltip',
                                                component: 'Tooltip',
                                                placement: 'left',
                                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                                overlayClassName: 'has-error-tooltip',
                                                title: '{{data.error.sf15}}',
                                                visible: '{{data.error.sf15}}',
                                                children: {
                                                    name: 'input',
                                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                    align: '{{$isReadOnly()?"left":""}}',
                                                    disabled: '{{$notAllowEdit()}}',
                                                    onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                    onChange: '{{function(e){$handleFieldChangeE("data.form.sf15",e,true)}}}',
                                                    value: '{{data.form.sf15}}'
                                                }
                                            },
                                            // children: {
                                            //     name: 'input',
                                            //     component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            // align:'{{$isReadOnly()?"left":""}}',
                                            //     disabled: '{{$notAllowEdit()}}',
                                            //     onChange: '{{function(e){$handleFieldChangeE("data.form.sf15",e,true)}}}',
                                            //     value: '{{data.form.sf15}}'
                                            // }
                                        }
                                    },
                                ]
                            },*/
                        ]
                    }]
                },
                {
                    name: 'mxDetailList',
                    component: 'DataGrid',
                    className: 'inv-app-pu-toll-invoice-card-form-details',
                    headerHeight: 24,
                    rowHeight: 24,
                    rowsCount: '{{data.form.mxDetailList.length}}',
                    key: '{{data.other.randomKey}}',
                    readonly: '{{$isReadOnly() || $notAllowEdit()}}', //不允许增减行
                    enableAddDelrow: true,
                    onAddrow: "{{$addBottomRow('mxDetailList')}}",
                    onDelrow: "{{$delRow('mxDetailList')}}",
                    onKeyDown: '{{$gridKeydown}}',
                    ellipsis: true,
                    heightFromRowsCount: true,
                    footerHeight: -4,
                    //scrollToColumn: '{{data.other.mxDetailListScrollToColumn}}',
                    //scrollToRow: '{{data.other.mxDetailListScrollToRow}}',
                    columns: [{
                            name: 'hwmc',
                            component: 'DataGrid.Column',
                            columnKey: 'hwmc',
                            width: 204,
                            //flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                children: '项目名称'
                            },
                           /* cell: {

                                name: 'cell',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].hwmc?{border:"1px solid #e94033",backgroundColor: "#FFF2F1",height:"22px",lineHeight:"22px",overflow: "hidden",borderRadius: "2px"}:{}}}',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                disabled: '{{$notAllowEdit()}}',
                                align: 'left',
                                value: '{{data.form.mxDetailList[_rowIndex].hwmc}}',
                                title: '{{data.form.mxDetailList[_rowIndex].hwmc}}',
                                addonAfter: {
                                    name: 'btn',
                                    component: '::span',
                                    className: 'btn',
                                    children: '···',
                                    onClick: '{{$handleHwClick(_rowIndex,data.form.mxDetailList[_rowIndex])}}'
                                },
                                onChange: '{{function(e){$handleCellFieldChangeE("hwmc",_rowIndex,e,true)}}}',

                                // name: 'cell',
                                // component: 'Row',
                                // style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].hwmc?{border:"1px solid #e94033",backgroundColor: "#FFF2F1",height:"22px",lineHeight:"22px",overflow: "hidden",borderRadius: "2px"}:{}}}',
                                // children: {
                                //     name: '{{"inv-app-product-select"+_rowIndex}}',
                                //     component: 'AppLoader',
                                //     appName: '{{"inv-app-product-select?sales-zzsfp="+_rowIndex}}',
                                //     init: false,
                                //     callback: '{{function(value){$handleChangeHwmc(_rowIndex,value)}}}',
                                //     inputValue: '{{data.form.mxDetailList[_rowIndex].hwmc}}',
                                // },

                                _power: '({rowIndex}) => rowIndex',
                            }*/
                            cell: {

                            name: 'cell',
                            className: "{{$getCellClassName(_ctrlPath)}}",
                            style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].hwmc?{border:"1px solid #e94033",backgroundColor: "#FFF2F1",height:"22px",lineHeight:"22px",overflow: "hidden",borderRadius: "2px"}:{}}}',
                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                            disabled: '{{$notAllowEdit()}}',
                            align: 'left',
                            allowClear: true,
                            dropdownMatchSelectWidth: false,
                            showSearch: true,
                            value: '{{data.form.mxDetailList[_rowIndex].hwmc}}',
                            title: '{{data.form.mxDetailList[_rowIndex].hwmc}}',
                            onChange: '{{function(v){$hwmcChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                            children: '{{$renderHwmcSelectOption()}}',
                            _power: '({rowIndex}) => rowIndex',
                            }
                        },
                        {
                            name: 'cph',
                            component: 'DataGrid.Column',
                            columnKey: 'cph',
                            width: 124,
                            //flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '车牌号'
                            },
                            cell: {
                                name: 'cell',
                                // component: '{{$isFocus(_ctrlPath) ? "Input" : "DataGrid.TextCell"}}',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                align: '{{$isReadOnly()?"left":""}}',
                                disabled: '{{$notAllowEdit()}}',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                value: '{{data.form.mxDetailList[_rowIndex].cph}}',
                                title: '{{data.form.mxDetailList[_rowIndex].cph}}',
                                onChange: '{{function(e){$handleCellFieldChangeE("cph",_rowIndex,e)}}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        },
                        {
                            name: 'mxlx',
                            component: 'DataGrid.Column',
                            columnKey: 'mxlx',
                            width: 80,
                            //flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '类型'
                            },
                            cell: {
                                name: 'cell',
                                // component: '{{$isFocus(_ctrlPath) ? "Input" : "DataGrid.TextCell"}}',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                align: '{{$isReadOnly()?"left":""}}',
                                disabled: '{{$notAllowEdit()}}',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                value: '{{data.form.mxDetailList[_rowIndex].mxlx}}',
                                title: '{{data.form.mxDetailList[_rowIndex].mxlx}}',
                                onChange: '{{function(e){$handleCellFieldChangeE("mxlx",_rowIndex,e)}}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        },
                        {
                            name: 'txrqq',
                            component: 'DataGrid.Column',
                            columnKey: 'txrqq',
                            width: 66,
                            flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '通行日期起'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                allowClear: true,
                                defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                disabledDate: '{{$disabledDateQ}}',
                                className: 'inv-app-pu-toll-invoice-card-cell',
                                disabled: '{{$notAllowEdit()}}',
                                placeholder: '',
                                format: 'YYYYMMDD',
                                value: '{{$isReadOnly()?(data.form.mxDetailList[_rowIndex].txrqq?data.form.mxDetailList[_rowIndex].txrqq.format("YYYY-MM-DD"):""):data.form.mxDetailList[_rowIndex].txrqq}}',
                                title: '{{data.form.mxDetailList[_rowIndex].txrqq}}',
                                onChange: '{{function(date,dateString){$handleCellFieldChangeV("txrqq",_rowIndex,date,true)}}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        },
                        {
                            name: 'txrqz',
                            component: 'DataGrid.Column',
                            columnKey: 'txrqz',
                            width: 66,
                            flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '通行日期止'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                allowClear: true,
                                defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                disabledDate: '{{function(currentDate){return $disabledDateZ(currentDate,data.form.mxDetailList[_rowIndex].txrqq)}}}',
                                className: 'inv-app-pu-toll-invoice-card-cell',
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].txrqz?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                disabled: '{{$notAllowEdit()}}',
                                placeholder: '',
                                format: 'YYYYMMDD',
                                value: '{{$isReadOnly()?(data.form.mxDetailList[_rowIndex].txrqz?data.form.mxDetailList[_rowIndex].txrqz.format("YYYY-MM-DD"):""):data.form.mxDetailList[_rowIndex].txrqz}}',
                                title: '{{data.form.mxDetailList[_rowIndex].txrqz}}',
                                onChange: '{{function(date,dateString){$handleCellFieldChangeV("txrqz",_rowIndex,date,true)}}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        },
                        {
                            name: 'je',
                            component: 'DataGrid.Column',
                            columnKey: 'je',
                            width: 112,
                            // flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                children: '金额'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                executeBlur: true,
                                onBlur: '{{$handleCellNumberBlur("je",_rowIndex)}}',
                                precision: 2,
                                disabled: '{{$notAllowEdit()}}',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                align: 'right',
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].je?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].je,2,$isFocus(_ctrlPath),false)}}',
                                title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].je,2,false,false)}}',
                                onChange: '{{function(v){$amountChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        },
                        {
                            name: 'slv',
                            component: 'DataGrid.Column',
                            columnKey: 'slv',
                            width: 80,
                            //flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                children: '税率'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].slv?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                enableTooltip: true,
                                align: 'right',
                                disabled: '{{$notAllowEdit()}}',
                                children: '{{$renderSelectOption()}}',
                                showSearch: true,
                                allowClear: true,
                                dropdownMatchSelectWidth: false,
                                dropdownStyle: { width: '125px' },
                                filterOption: '{{function(input, option){return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}}',
                                value: '{{!$isReadOnly()?data.form.mxDetailList[_rowIndex].slv:(data.form.mxDetailList[_rowIndex].slv!==undefined&&(data.form.mxDetailList[_rowIndex].slv * 100 +"%")||"")}}',
                                onChange: '{{function(v){$taxRateChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                // _excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
                                _power: '({rowIndex})=>rowIndex',
                            }
                        },
                        {
                            name: 'se',
                            component: 'DataGrid.Column',
                            columnKey: 'se',
                            width: 112,
                            //flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                children: '税额'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                executeBlur: true,
                                onBlur: '{{$handleCellNumberBlur("se",_rowIndex)}}',
                                precision: 2,
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                align: 'right',
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].se?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].se,2,$isFocus(_ctrlPath),false)}}',
                                title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].se,2,false,false)}}',
                                disabled: '{{!data.form.mxDetailList[_rowIndex].je||data.form.mxDetailList[_rowIndex].slv===undefined||$notAllowEdit()}}',
                                onChange: '{{function(v){$taxChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                _power: '({rowIndex}) => rowIndex',
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
                                    '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center "}}',
                                children: "即征即退"
                            },
                            cell: {
                                name: 'cell',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                                optionFilterProp: 'children',
                                filterOption: '{{function(input, option){return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}}',
                                //className: "inv-app-pu-vats-invoice-card-cell",
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].jzjtDm?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                enableTooltip: true,
                                align: 'right',
                                disabled: '{{$notAllowEdit()}}',
                                children: '{{$renderSelectOption("jzjtDm")}}',
                                showSearch: true,
                                allowClear: true,
                                dropdownMatchSelectWidth: false,
                                dropdownStyle: { width: '125px' },
                                value: '{{$isReadOnly()?data.form.mxDetailList[_rowIndex].jzjtDm ==="Y"?"是":"否" :data.form.mxDetailList[_rowIndex].jzjtDm}}',
                                onChange: '{{function(v){$handleFieldChangeV(_rowIndex,v,false,true)}}}',
                                // _excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
                                _power: '({rowIndex})=>rowIndex',
                            }
                        }
                    ]
                },
                {
                    name: 'inv-app-pu-toll-invoice-card-heji1',
                    className: 'inv-app-pu-toll-invoice-card-heji1',
                    component: '::div',
                    children: [{
                            name: 'col1',
                            component: '::div',
                            className: 'heiji-col col1',
                            children: '合计'
                        },
                        {
                            name: 'col2',
                            component: '::div',
                            className: 'heiji-col col2',
                        },
                        {
                            name: 'col3',
                            component: '::div',
                            className: 'heiji-col col3',
                            title: '{{$sumColumn("je")}}',
                            children: '{{$sumColumn("je")}}',
                        },
                        {
                            name: 'col4',
                            component: '::div',
                            className: 'heiji-col col4',
                            children: ''
                        },
                        {
                            name: 'col5',
                            component: '::div',
                            className: 'heiji-col col5',
                            title: '{{$sumColumn("se")}}',
                            children: '{{$sumColumn("se")}}',
                        },
                        {
                            name: 'col4-1',
                            component: '::div',
                            className: 'heiji-col col4-1',
                            children: ''
                        },
                    ]
                },
                {
                    name: 'inv-app-pu-toll-invoice-card-heji2',
                    className: 'inv-app-pu-toll-invoice-card-heji2',
                    component: '::div',
                    children: [{
                            name: 'col1',
                            component: '::div',
                            className: 'heiji-col cold1',
                            children: '价税合计(大写)'
                        },
                        {
                            name: 'col2',
                            component: '::div',
                            className: 'heiji-col cold2',
                            children: '{{$jshjDx()}}'
                        },
                        {
                            name: 'col3',
                            component: '::div',
                            className: 'heiji-col cold3',
                            children: '价税合计(小写)',

                        },
                        {
                            name: 'col4',
                            component: '::div',
                            className: 'heiji-col cold4',
                            children: '{{$jshj()}}'
                        },
                    ]
                },
                {
                    name: 'inv-app-pu-toll-invoice-card-grid2',
                    component: '::div',
                    className: 'inv-app-pu-toll-invoice-card-grid2',
                    children: [{
                            name: 'row',
                            component: 'Row',
                            className: 'grid-row',
                            gutter: 0,
                            children: [{
                                    name: 'row-col1',
                                    component: 'Col',
                                    span: 1,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        className: 'row-col1-col',
                                        children: '销 售 方'
                                    }
                                },
                                {
                                    name: 'row-col2',
                                    component: 'Col',
                                    className: 'row-col2',
                                    span: 12,
                                    children: [{
                                            name: 'row-col2-row1',
                                            component: 'Row',
                                            gutter: 0,
                                            className: 'row-col2-row',
                                            children: [{
                                                    name: 'col2-row1-col1',
                                                    component: 'Col',
                                                    span: 6,
                                                    children: {
                                                        name: 'name',
                                                        component: '::div',
                                                        className: '{{$isReadOnly()?"head-grid-item-label  ":"head-grid-item-label  ant-form-item-required"}}',
                                                        children: '名称'
                                                    }
                                                },
                                                {
                                                    name: 'col2-row1-col2',
                                                    component: 'Col',
                                                    span: 18,
                                                    // children: {
                                                    //     name: 'tooltip',
                                                    //     component: 'Tooltip',
                                                    //     getPopupContainer: '{{$handleGetPopupContainer}}',
                                                    //     placement: 'right',
                                                    //     overlayClassName: 'has-error-tooltip',
                                                    //     title: '{{data.error.xfmc}}',
                                                    //     visible: '{{data.error.xfmc}}',
                                                    //     children: {
                                                    //         name: 'value',
                                                    //         component: '::div',
                                                    //         className: '{{data.error.xfmc?"head-grid-item-value has-error":"head-grid-item-value"}}',
                                                    //         children: {
                                                    //             name: 'input',
                                                    //             component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                    // align:'{{$isReadOnly()?"left":""}}',
                                                    //             disabled: '{{$notAllowEdit()}}',
                                                    //             onChange: '{{function(e){$handleFieldChangeE("data.form.xfmc",e,true)}}}',
                                                    //             value: '{{data.form.xfmc}}'
                                                    //         }
                                                    //     }
                                                    // },
                                                    children: {
                                                        name: 'value',
                                                        component: '::div',
                                                        className: '{{data.error.xfmc?"head-grid-item-value has-error":"head-grid-item-value"}}',
                                                        children: {
                                                            name: 'input',
                                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                            align: '{{$isReadOnly()?"left":""}}',
                                                            disabled: '{{$notAllowEdit()}}',
                                                            onChange: '{{function(e){$handleFieldChangeE("data.form.xfmc",e,true)}}}',
                                                            className: '{{$isReadOnly()?"-mx-cell":""}}',
                                                            title: '{{data.form.xfmc}}',
                                                            value: '{{data.form.xfmc}}'
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            name: 'row-col2-row2',
                                            component: 'Row',
                                            gutter: 0,
                                            className: 'row-col2-row',
                                            children: [{
                                                    name: 'col2-row2-col1',
                                                    component: 'Col',
                                                    span: 6,
                                                    children: {
                                                        name: 'name',
                                                        component: '::div',
                                                        className: '{{$isReadOnly()?"head-grid-item-label ":"head-grid-item-label ant-form-item-required"}}',
                                                        children: '纳税人识别号'
                                                    }
                                                },
                                                {
                                                    name: 'col2-row2-col2',
                                                    component: 'Col',
                                                    span: 18,
                                                    children: {
                                                        name: 'tooltip',
                                                        component: 'Tooltip',
                                                        getPopupContainer: '{{$handleGetPopupContainer}}',
                                                        placement: 'right',
                                                        overlayClassName: 'has-error-tooltip',
                                                        title: '{{data.error.xfsbh}}',
                                                        visible: '{{data.error.xfsbh&&data.error.xfsbh.indexOf("不能为空")===-1}}',
                                                        children: {
                                                            name: 'value',
                                                            component: '::div',
                                                            className: '{{data.error.xfsbh?"head-grid-item-value has-error":"head-grid-item-value"}}',
                                                            children: {
                                                                name: 'input',
                                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                                align: '{{$isReadOnly()?"left":""}}',
                                                                disabled: '{{$notAllowEdit()}}',
                                                                onChange: '{{function(e){$handleFieldChangeE("data.form.xfsbh",e,true)}}}',
                                                                className: '{{$isReadOnly()?"-mx-cell":""}}',
                                                                title: '{{data.form.xfsbh}}',
                                                                value: '{{data.form.xfsbh}}'
                                                            }
                                                        }
                                                    },
                                                    // children: {
                                                    //     name: 'value',
                                                    //     component: '::div',
                                                    //     className: '{{data.error.xfsbh?"head-grid-item-value has-error":"head-grid-item-value"}}',
                                                    //     children: {
                                                    //         name: 'input',
                                                    //         component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                    // align:'{{$isReadOnly()?"left":""}}',
                                                    //         disabled: '{{$notAllowEdit()}}',
                                                    //         onChange: '{{function(e){$handleFieldChangeE("data.form.xfsbh",e,true)}}}',
                                                    //         value: '{{data.form.xfsbh}}'
                                                    //     }
                                                    // }
                                                }
                                            ]
                                        },
                                        {
                                            name: 'row-col2-row3',
                                            component: 'Row',
                                            gutter: 0,
                                            className: 'row-col2-row',
                                            children: [{
                                                    name: 'col2-row3-col1',
                                                    component: 'Col',
                                                    span: 6,
                                                    children: {
                                                        name: 'name',
                                                        component: '::div',
                                                        className: 'head-grid-item-label',
                                                        children: '地址、电话'
                                                    }
                                                },
                                                {
                                                    name: 'col2-row3-col2',
                                                    component: 'Col',
                                                    span: 18,
                                                    children: {
                                                        name: 'value',
                                                        component: '::div',
                                                        className: 'head-grid-item-value',
                                                        children: {
                                                            name: 'input',
                                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                            align: '{{$isReadOnly()?"left":""}}',
                                                            disabled: '{{$notAllowEdit()}}',
                                                            onChange: '{{function(e){$handleFieldChangeE("data.form.xfdzdh",e)}}}',
                                                            className: '{{$isReadOnly()?"-mx-cell":""}}',
                                                            title: '{{data.form.xfdzdh}}',
                                                            value: '{{data.form.xfdzdh}}'
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            name: 'row-col2-row4',
                                            component: 'Row',
                                            gutter: 0,
                                            className: 'row-col2-row',
                                            children: [{
                                                    name: 'row-col2-row4-col1',
                                                    component: 'Col',
                                                    className: 'no-bottom-border',
                                                    span: 6,
                                                    children: {
                                                        name: 'name',
                                                        component: '::div',
                                                        className: 'head-grid-item-label',
                                                        children: '开户行及账号'
                                                    }
                                                },
                                                {
                                                    name: 'row-col2-row4-col2',
                                                    component: 'Col',
                                                    className: 'no-bottom-border',
                                                    span: 18,
                                                    children: {
                                                        name: 'value',
                                                        component: '::div',
                                                        className: 'head-grid-item-value',
                                                        children: {
                                                            name: 'input',
                                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                            align: '{{$isReadOnly()?"left":""}}',
                                                            disabled: '{{$notAllowEdit()}}',
                                                            onChange: '{{function(e){$handleFieldChangeE("data.form.xfyhzh",e)}}}',
                                                            className: '{{$isReadOnly()?"-mx-cell":""}}',
                                                            title: '{{data.form.xfyhzh}}',
                                                            value: '{{data.form.xfyhzh}}'
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                    ]
                                },
                                {
                                    name: 'row-col3',
                                    component: 'Col',
                                    span: 1,
                                    children: {
                                        name: 'row-col3-col',
                                        component: '::div',
                                        className: 'row-col3-col',
                                        style: {
                                            lineHeight: '48px'
                                        },
                                        children: '备 注'
                                    }
                                },
                                {
                                    name: 'row-col4',
                                    component: 'Col',
                                    span: 10,
                                    children: {
                                        name: 'row-col4-col',
                                        component: '::div',
                                        children: {
                                            name: 'textarea',
                                            style: {
                                                height: 94,
                                                width: '97.5%',
                                                overflow: 'auto',
                                            },
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.TextArea"}}',
                                            align: 'left',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.bz",e)}}}',
                                            value: '{{data.form.bz}}'
                                        }
                                    }
                                },
                            ]
                        },
                        {
                            name: 'row2',
                            component: 'Row',
                            _visible: '{{$notXaoGuiMo()}}',
                            className: 'grid-last-row',
                            children: [{
                                    name: 'row2-col1',
                                    component: 'Col',
                                    className: 'invoice-card-grid-thead',
                                    style: {
                                        borderLeft: 'solid 1px #777777'
                                    },
                                    span: '{{$isV2Component()?3:6}}',
                                    children: {
                                        name: 'row2-col1-div',
                                        component: '::div',
                                        children: '认证状态'
                                    }
                                },
                                {
                                    name: 'row2-col2',
                                    component: 'Col',
                                    span: '{{$isV2Component()?3:6}}',
                                    style: {
                                        textAlign: 'center'
                                    },
                                    children: {
                                        name: 'row2-col1-div',
                                        component: '::div',
                                        disabled: '{{$notAllowEditBdzt()}}',
                                        children: {
                                            name: 'status',
                                            component: '{{$isReadOnly()?"::span":"Checkbox"}}',
                                            //disabled: '{{$notAllowEditBdzt()}}',
                                            checked: '{{data.form.bdzt}}',
                                            onChange: '{{function(e){$handleBdztChangeC("data.form.bdzt",e)}}}',
                                            children: '{{$isReadOnly()&&!data.form.bdzt?"未认证":"已认证"}}'
                                        }
                                    }
                                }, {
                                    name: 'row2-col3',
                                    component: 'Col',
                                    className: 'invoice-card-grid-thead',
                                    span: 3,
                                    _visible: '{{$isV2Component()}}',
                                    children: {
                                        name: 'row2-col2-div',
                                        component: '::div',
                                        className: "{{data.form.fplyLx==2 && data.form.bdzt?'ant-form-item-required':''}}",
                                        children: '申报用途',
                                    }
                                },
                                {
                                    name: 'row2-col4',
                                    component: 'Col',
                                    span: 3,
                                    _visible: '{{$isV2Component()}}',
                                    children: {
                                        name: 'tooltip',
                                        component: 'Tooltip',
                                        getPopupContainer: '{{$handleGetPopupContainer}}',
                                        placement: 'left',
                                        overlayClassName: 'has-error-tooltip',
                                        title: '{{data.error.bdlyLx}}',
                                        visible: '{{data.error.bdlyLx && data.error.bdlyLx.indexOf("不能为空")===-1}}',
                                        children: {
                                            className: '{{data.error.bdlyLx?"has-error":""}}',
                                            name: 'row2-col3-div',
                                            component: '::div',
                                            children: {
                                                name: 'status',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                                                align: 'left',
                                                placeholder: '',
                                                value: '{{data.form.bdlyLx}}',
                                                disabled: '{{!data.form.bdzt}}', // 认证状态
                                                onChange: '{{function(val){$handleBdlylxChangeV(val)}}}',
                                                children: '{{$renderBdlyLX()}}'
                                            },
                                        }
                                    }
                                }, {
                                    name: 'row2-col5',
                                    component: 'Col',
                                    className: 'invoice-card-grid-thead',
                                    span: '{{$isV2Component()?3:6}}',
                                    children: {
                                        name: 'row2-col3-div',
                                        component: '::div',
                                        className: "{{data.form.fplyLx==2 && data.form.bdlyLx==1 && data.form.bdzt?'ant-form-item-required':''}}",
                                        children: '抵扣月份',
                                    }
                                },
                                {
                                    name: 'row2-col6',
                                    component: 'Col',
                                    span: '{{$isV2Component()?3:6}}',
                                    children: {
                                        name: 'tooltip',
                                        component: 'Tooltip',
                                        getPopupContainer: '{{$handleGetPopupContainer}}',
                                        placement: 'left',
                                        overlayClassName: 'has-error-tooltip',
                                        title: '{{data.error.dkyf}}',
                                        visible: '{{data.error.dkyf && data.error.dkyf.indexOf("不能为空")===-1}}',
                                        children: {
                                            name: 'row2-col4-div',
                                            component: '::div',
                                            className: '{{data.error.dkyf?"has-error":""}}',
                                            children: {
                                                name: 'status',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                                                align: 'left',
                                                placeholder: '',
                                                value: '{{data.form.dkyf}}',
                                                disabled: '{{$notAllowEditDkyf()}}',
                                                onChange: '{{function(date,dateString){$handleFieldChangeV("data.form.dkyf",date)}}}',
                                                children: '{{$renderDkyf()}}'
                                            },
                                        }
                                    }
                                }, {
                                    name: 'row2-col7',
                                    component: 'Col',
                                    className: 'invoice-card-grid-thead',
                                    _visible: '{{$isV2Component()}}',
                                    span: 3,
                                    children: {
                                        name: 'row2-col4-div',
                                        component: '::div',
                                        className: "{{data.form.fplyLx==2 && data.form.bdzt?'ant-form-item-required':''}}",
                                        children: '有效税额',
                                    }
                                },
                                {
                                    name: 'row2-col8',
                                    component: 'Col',
                                    span: 3,
                                    _visible: '{{$isV2Component()}}',
                                    children: {
                                        name: 'tooltip',
                                        component: 'Tooltip',
                                        getPopupContainer: '{{$handleGetPopupContainer}}',
                                        placement: 'left',
                                        overlayClassName: 'has-error-tooltip',
                                        title: '{{data.error.nf06}}',
                                        visible: '{{data.form.fplyLx == 2 && data.form.bdzt == 1 && data.error.nf06 && data.error.nf06.indexOf("不能为空")===-1}}',
                                        children: {
                                            name: 'row2-col4-div',
                                            component: '::div',
                                            className: '{{data.form.fplyLx == 2 && data.form.bdzt == 1 && data.error.nf06?"has-error":""}}',
                                            children: {
                                                name: 'nf06',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                                executeBlur: true,
                                                onBlur: '{{$handleFormNumberBlur("nf06")}}',
                                                precision: 2,
                                                //disabled: '{{$notAllowEditNf06()}}',
                                                disabled: '{{$notAllowEditDkyf()}}',
                                                align: 'right',
                                                className: "{{$getCellClassName(_ctrlPath)}}",
                                                value: '{{$quantityFormat(data.form.nf06,2,$isFocus(_ctrlPath),true)}}',
                                                title: '{{$quantityFormat(data.form.nf06,2,false,true)}}',
                                                onChange: '{{function(val){$handleFieldChangeV("data.form.nf06",val)}}}',
                                            },
                                        }
                                    }
                                }

                            ]
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
                }
            ]
        }]
    }
}

export function getInitState() {
    return {
        data: {
            justShow:false,
            loading: true,
            form: {

                mxDetailList: [
                    {},
                    {},
                    {},
                ]
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
                randomKey: 1,
                defaultLength: 3, //默认行数
                taxRates: [],
                defaultPickerValue: null,
            },
            error: {
                mxDetailList: [{}, {}, {}]
            }

        }
    }
}