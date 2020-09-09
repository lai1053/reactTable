import moment from "moment";

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-pu-withhold-invoice-card',
        onMouseDown: '{{$mousedown}}',
        children: [{
                name: 'spin',
                component: 'Spin',
                tip: '加载中',
                spinning: '{{data.loading}}',
                delay: 0.01,
                children: [{
                        name: 'head',
                        component: '::div',
                        className: 'inv-app-pu-withhold-invoice-card-header',
                        children: [{
                                name: 'title',
                                component: '::div',
                                className: 'inv-app-pu-withhold-invoice-card-header-title',
                                children: '代扣代缴专用缴款书'
                            },
                            {
                                name: 'form1',
                                component: '::div',
                                className: 'inv-app-pu-withhold-invoice-card-header-form',
                                children: {
                                    name: 'item3',
                                    component: '::div',
                                    className: 'inv-app-pu-withhold-invoice-card-header-form-item',
                                    children: [{
                                            name: 'label',
                                            component: '::div',
                                            className: '{{$isReadOnly()?"inv-app-pu-withhold-invoice-card-header-form-item-label ":"inv-app-pu-withhold-invoice-card-header-form-item-label ant-form-item-required"}}',
                                            children: '开票日期：',
                                            // children: {
                                            //  name: 'tooltip',
                                            //  component: 'Tooltip',
                                            //  placement: 'left',
                                            //  getPopupContainer: '{{$handleGetPopupContainer}}',
                                            //  overlayClassName: 'has-error-tooltip',
                                            //  title: '{{data.error.kprq}}',
                                            //  visible: '{{data.error.kprq}}',
                                            //  children: '开票日期：'
                                            // }
                                        },
                                        {
                                            name: 'value',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                            defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                            disabledDate: '{{$disabledDateQ}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            placeholder: '',
                                            className: '{{data.error.kprq?"inv-app-pu-withhold-invoice-card-header-form-item-value has-error":"inv-app-pu-withhold-invoice-card-header-form-item-value"}}',
                                            onChange: '{{function(date,dateString){$handleFieldChangeV("data.form.kprq",date,true)}}}',
                                            value: '{{$isReadOnly()?(data.form.kprq?data.form.kprq.format("YYYY-MM-DD"):""):data.form.kprq}}',
                                        },
                                    ]
                                },
                            },
                            {
                                name: 'form2',
                                component: '::div',
                                className: 'inv-app-pu-withhold-invoice-card-header-form form2',
                                children: [{
                                    name: 'item1',
                                    component: '::div',
                                    className: 'inv-app-pu-withhold-invoice-card-header-form-item',
                                    children: [{
                                            name: 'label',
                                            component: '::div',
                                            className: '{{$isReadOnly()?"inv-app-pu-withhold-invoice-card-header-form-item-label ":"inv-app-pu-withhold-invoice-card-header-form-item-label ant-form-item-required"}}',
                                            children: '缴款书号码：'
                                        },
                                        {
                                            name: 'tooltip',
                                            component: 'Tooltip',
                                            placement: 'right',
                                            getPopupContainer: '{{$handleGetPopupContainer}}',
                                            overlayClassName: 'has-error-tooltip',
                                            title: '{{data.error.fphm}}',
                                            visible: '{{data.error.fphm&&data.error.fphm.indexOf("不能为空")===-1}}',
                                            children: {
                                                name: 'value',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                disabled: '{{$notAllowEdit()}}',
                                                placeholder: '',
                                                maxLength: 18,
                                                className: '{{data.error.fphm?"inv-app-pu-withhold-invoice-card-header-form-item-value has-error":"inv-app-pu-withhold-invoice-card-header-form-item-value"}}',
                                                onChange: '{{function(e){$handleFieldChangeE("data.form.fphm",e,true)}}}',
                                                value: '{{data.form.fphm}}'
                                            },
                                            // name: 'value',
                                            // component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            align: 'left',
                                            // disabled: '{{$notAllowEdit()}}',
                                            // placeholder: '',
                                            // maxLength: 18,
                                            // className: '{{data.error.fphm?"inv-app-pu-withhold-invoice-card-header-form-item-value has-error":"inv-app-pu-withhold-invoice-card-header-form-item-value"}}',
                                            // onChange: '{{function(e){$handleFieldChangeE("data.form.fphm",e,true)}}}',
                                            // value: '{{data.form.fphm}}'
                                        },
                                    ]
                                }, ]
                            },
                        ]
                    },
                    {
                        name: 'inv-app-pu-withhold-invoice-card-grid1',
                        className: 'inv-app-pu-withhold-invoice-card-grid1',
                        component: '::div',
                        children: [{
                                name: 'row1',
                                component: 'Row',
                                className: 'grid-row row1',
                                gutter: 0,
                                children: [{
                                        name: 'row1-col1',
                                        component: 'Col',
                                        span: 4,
                                        children: {
                                            name: 'row-col1-col',
                                            component: '::div',
                                            className: 'row-col1-col',
                                            children: '扣缴义务人识别号'
                                        }
                                    },
                                    {
                                        name: 'row1-col2',
                                        component: 'Col',
                                        className: 'not-edit-row',
                                        span: 8,
                                        children: {
                                            name: 'row-col1-col',
                                            component: '::div',
                                            className: 'row-col1-col',
                                            children: '{{data.form.gfsbh}}'
                                        }
                                    },
                                    {
                                        name: 'row1-col3',
                                        component: 'Col',
                                        span: 3,
                                        children: {
                                            name: 'row-col1-col',
                                            component: '::div',
                                            className: 'row-col1-col',
                                            children: '扣缴义务人名称'
                                        }
                                    },
                                    {
                                        name: 'row1-col4',
                                        component: 'Col',
                                        className: 'not-edit-row',
                                        span: 9,
                                        children: {
                                            name: 'row-col1-col',
                                            component: '::div',
                                            className: 'row-col1-col',
                                            children: '{{data.form.gfmc}}'
                                        }
                                    }
                                ]
                            },
                            {
                                name: 'row2',
                                component: 'Row',
                                className: 'grid-row',
                                gutter: 0,
                                children: [{
                                        name: 'row1-col1',
                                        component: 'Col',
                                        span: 4,
                                        children: {
                                            name: 'row-col1-col',
                                            component: '::div',
                                            className: 'row-col1-col',
                                            children: '纳税人识别号'
                                        }
                                    },
                                    {
                                        name: 'row1-col2',
                                        component: 'Col',
                                        span: 8,
                                        children: {
                                            name: 'row-col1-col',
                                            component: '::div',
                                            className: 'row-col1-col',
                                            children: {
                                                name: 'input',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                align: 'right',
                                                disabled: '{{$notAllowEdit()}}',
                                                onChange: '{{function(e){$handleFieldChangeE("data.form.sf02",e)}}}',
                                                value: '{{data.form.sf02}}',
                                            }
                                        }
                                    },
                                    {
                                        name: 'row1-col3',
                                        component: 'Col',
                                        span: 3,
                                        children: {
                                            name: 'row-col1-col',
                                            component: '::div',
                                            className: 'row-col1-col',
                                            children: '纳税人名称'
                                        }
                                    },
                                    {
                                        name: 'row1-col4',
                                        component: 'Col',
                                        span: 9,
                                        children: {
                                            name: 'row-col1-col',
                                            component: '::div',
                                            className: 'row-col1-col',
                                            children: {
                                                name: 'input',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                align: 'right',
                                                disabled: '{{$notAllowEdit()}}',
                                                onChange: '{{function(e){$handleFieldChangeE("data.form.sf01",e)}}}',
                                                value: '{{data.form.sf01}}',
                                            }
                                        }
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        name: 'mxDetailList',
                        component: 'DataGrid',
                        className: 'inv-app-pu-withhold-invoice-card-form-details',
                        headerHeight: 24,
                        rowHeight: 24,
                        rowsCount: '{{data.form.mxDetailList.length}}',
                        key: '{{data.other.randomKey}}',
                        readonly: '{{$isReadOnly()||$notAllowEdit()}}', //不允许增减行
                        enableAddDelrow: true,
                        onAddrow: "{{$addBottomRow('mxDetailList')}}",
                        onDelrow: "{{$delRow('mxDetailList')}}",
                        ellipsis: true,
                        onKeyDown: '{{$gridKeydown}}',
                        heightFromRowsCount: true,
                        footerHeight: -4,
                        //scrollToColumn: '{{data.other.mxDetailListScrollToColumn}}',
                        //scrollToRow: '{{data.other.mxDetailListScrollToRow}}',
                        columns: [{
                                name: 'cph',
                                component: 'DataGrid.Column',
                                columnKey: 'cph',
                                width: 204,
                                //flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '原凭证号'
                                },
                                cell: {
                                    name: 'cell',
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                    align: 'left',
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
                                width: 66,
                                flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '税种'
                                },
                                cell: {
                                    name: 'cell',
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                    align: 'left',
                                    disabled: '{{$notAllowEdit()}}',
                                    className: "{{$getCellClassName(_ctrlPath)}}",
                                    value: '{{data.form.mxDetailList[_rowIndex].mxlx}}',
                                    title: '{{data.form.mxDetailList[_rowIndex].mxlx}}',
                                    onChange: '{{function(e){$handleCellFieldChangeE("mxlx",_rowIndex,e)}}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'mxsf02',
                                component: 'DataGrid.Column',
                                columnKey: 'mxsf02',
                                width: 80,
                                flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '品目名称'
                                },
                                cell: {
                                    name: 'cell',
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                    align: 'left',
                                    disabled: '{{$notAllowEdit()}}',
                                    className: "{{$getCellClassName(_ctrlPath)}}",
                                    value: '{{data.form.mxDetailList[_rowIndex].mxsf02}}',
                                    title: '{{data.form.mxDetailList[_rowIndex].mxsf02}}',
                                    onChange: '{{function(e){$handleCellFieldChangeE("mxsf02",_rowIndex,e,true)}}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'txrq',
                                component: 'DataGrid.Column',
                                columnKey: 'txrq',
                                width: 220,
                                //flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '税款所属时期'
                                },
                                cell: {
                                    name: 'cell',
                                    component: 'Row',
                                    className: "inv-app-pu-vats-invoice-card-cell suoshuqi",
                                    style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].txrqz?{border:"1px solid #e94033",backgroundColor: "#FFF2F1",height:"23px"}:{}}}',
                                    children: [{
                                            name: 'col1',
                                            component: 'Col',
                                            span: 11,
                                            children: {
                                                name: 'date',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                                allowClear: true,
                                                defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                                disabledDate: '{{$disabledDateQ}}',
                                                disabled: '{{$notAllowEdit()}}',
                                                placeholder: '',
                                                format: 'YYYYMMDD',
                                                value: '{{$isReadOnly()?(data.form.mxDetailList[_rowIndex].txrqq?data.form.mxDetailList[_rowIndex].txrqq.format("YYYY-MM-DD"):""):data.form.mxDetailList[_rowIndex].txrqq}}',
                                                title: '{{data.form.mxDetailList[_rowIndex].txrqq}}',
                                                onChange: '{{function(date,dateString){$handleCellFieldChangeV("txrqq",_rowIndex,date,true)}}}',
                                            }
                                        },
                                        {
                                            name: 'col2',
                                            component: 'Col',
                                            span: 2,
                                            children: '至'
                                        },
                                        {
                                            name: 'col3',
                                            component: 'Col',
                                            span: 11,
                                            children: {
                                                name: 'date',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                                allowClear: true,
                                                defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                                disabledDate: '{{function(currentDate){return $disabledDateZ(currentDate,data.form.mxDetailList[_rowIndex].txrqq)}}}',
                                                disabled: '{{$notAllowEdit()}}',
                                                placeholder: '',
                                                format: 'YYYYMMDD',
                                                value: '{{$isReadOnly()?(data.form.mxDetailList[_rowIndex].txrqz?data.form.mxDetailList[_rowIndex].txrqz.format("YYYY-MM-DD"):""):data.form.mxDetailList[_rowIndex].txrqz}}',
                                                title: '{{data.form.mxDetailList[_rowIndex].txrqz}}',
                                                onChange: '{{function(date,dateString){$handleCellFieldChangeV("txrqz",_rowIndex,date,true)}}}',
                                            }
                                        }
                                    ],
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'mxsf01',
                                component: 'DataGrid.Column',
                                columnKey: 'mxsf01',
                                width: 96,
                                //flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '入(退)库日期'
                                },
                                cell: {
                                    name: 'cell',
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                    allowClear: true,
                                    defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                    disabledDate: '{{function(currentDate){return $disabledDateZ(currentDate,data.form.mxDetailList[_rowIndex].txrqq)}}}',
                                    disabled: '{{$notAllowEdit()}}',
                                    placeholder: '',
                                    format: 'YYYYMMDD',
                                    className: "{{$getCellClassName(_ctrlPath)}}",
                                    style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].mxsf01?{border:"1px solid #e94033",backgroundColor: "#FFF2F1",height:"23px"}:{}}}',
                                    value: '{{$isReadOnly()?(data.form.mxDetailList[_rowIndex].mxsf01?data.form.mxDetailList[_rowIndex].mxsf01.format("YYYY-MM-DD"):""):data.form.mxDetailList[_rowIndex].mxsf01}}',
                                    title: '{{data.form.mxDetailList[_rowIndex].mxsf01}}',
                                    onChange: '{{function(date,dateString){$handleCellFieldChangeV("mxsf01",_rowIndex,date,true)}}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'se',
                                component: 'DataGrid.Column',
                                columnKey: 'se',
                                width: 150,
                                //flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                    children: '实缴(退)金额'
                                },
                                cell: {
                                    name: 'cell',
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                    onBlur: '{{$handleCellNumberBlur("se",_rowIndex)}}',
                                    executeBlur: true,
                                    precision: 2,
                                    disabled: '{{$notAllowEdit()}}',
                                    className: "{{$getCellClassName(_ctrlPath)}}",
                                    style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].se?{border:"1px solid #e94033",backgroundColor: "#FFF2F1",height:"23px"}:{}}}',
                                    value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].se,2,$isFocus(_ctrlPath),false)}}',
                                    title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].se,2,false,false)}}',
                                    onChange: '{{function(v){$amountChange(_rowIndex,v)}}}',
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
                                        '{{$isReadOnly()?"ant-form-item-center":"ant-form-item-center"}}',
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
                            },
                        ]
                    },
                    {
                        name: 'inv-app-pu-withhold-invoice-card-heji1',
                        className: 'inv-app-pu-withhold-invoice-card-heji1',
                        component: '::div',
                        children: [{
                                name: 'col1',
                                component: '::div',
                                className: 'heiji-col col1',
                                children: '金额合计(大写)'
                            },
                            {
                                name: 'col2',
                                component: '::div',
                                className: 'heiji-col col2',
                                style: {
                                    paddingLeft: 10
                                },
                                children: '{{$jshjDx()}}'
                            },
                            {
                                name: 'col3',
                                component: '::div',
                                className: 'heiji-col col3',
                                children: '金额合计(小写)'
                            },
                            {
                                name: 'col4',
                                component: '::div',
                                className: 'heiji-col col4',
                                children: '{{$hjse()}}'
                            },
                        ]
                    },
                    {
                        name: 'inv-app-pu-withhold-invoice-card-grid2',
                        className: 'inv-app-pu-withhold-invoice-card-grid1',
                        component: '::div',
                        children: [{
                                name: 'row1',
                                component: 'Row',
                                className: 'grid-row no-top-border',
                                gutter: 0,
                                children: [{
                                        name: 'row1-col1',
                                        component: 'Col',
                                        className: 'no-top-border no-right-border',
                                        span: 12,
                                        children: [{
                                                name: 'row1',
                                                component: 'Row',
                                                style: {
                                                    padding: 0
                                                },
                                                gutter: 0,
                                                children: [{
                                                        name: 'col1',
                                                        component: 'Col',
                                                        span: 8,
                                                        className: 'no-top-border',
                                                        children: {
                                                            name: 'row-col1-col',
                                                            component: '::div',
                                                            className: 'row-col1-col',
                                                            children: '税务机关代码'
                                                        }
                                                    },
                                                    {
                                                        name: 'col2',
                                                        component: 'Col',
                                                        //className: 'no-right-border',
                                                        span: 16,
                                                        children: {
                                                            name: 'row-col1-col',
                                                            component: '::div',
                                                            className: 'row-col1-col',
                                                            children: {
                                                                name: 'input',
                                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                                align: 'left',
                                                                disabled: '{{$notAllowEdit()}}',
                                                                onChange: '{{function(e){$handleFieldChangeE("data.form.swjgDm",e)}}}',
                                                                value: '{{data.form.swjgDm}}',
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                name: 'row2',
                                                component: 'Row',
                                                style: {
                                                    padding: 0
                                                },
                                                gutter: 0,
                                                children: [{
                                                        name: 'col1',
                                                        component: 'Col',
                                                        className: 'no-top-border',
                                                        span: 8,
                                                        children: {
                                                            name: 'row-col1-col',
                                                            component: '::div',
                                                            className: 'row-col1-col',
                                                            children: '税务机关名称'
                                                        }
                                                    },
                                                    {
                                                        name: 'col2',
                                                        component: 'Col',
                                                        //className: 'no-right-border',
                                                        span: 16,
                                                        children: {
                                                            name: 'row-col1-col',
                                                            component: '::div',
                                                            className: 'row-col1-col',
                                                            children: {
                                                                name: 'input',
                                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                                align: 'left',
                                                                className: '{{$isReadOnly()?"-mx-cell":""}}',
                                                                disabled: '{{$notAllowEdit()}}',
                                                                onChange: '{{function(e){$handleFieldChangeE("data.form.swjgMc",e)}}}',
                                                                value: '{{data.form.swjgMc}}',
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                        ]
                                    },
                                    {
                                        name: 'row1-col3',
                                        component: 'Col',
                                        span: 1,
                                        style: {
                                            height: 48
                                        },
                                        children: {
                                            name: 'row-col1-col',
                                            component: '::div',
                                            className: 'row-col3-col',
                                            children: '备注'
                                        }
                                    },
                                    {
                                        name: 'row1-col4',
                                        component: 'Col',
                                        style: {
                                            height: 48
                                        },
                                        span: 11,
                                        children: {
                                            name: 'textarea',
                                            style: {
                                                height: 46,
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
                                ]
                            },
                            {
                                name: 'row2',
                                component: 'Row',
                                className: 'grid-row',
                                _visible: '{{$notXaoGuiMo()}}',
                                gutter: 0,
                                children: [{
                                        name: 'row2-col1',
                                        component: 'Col',
                                        className: 'invoice-card-grid-thead',
                                        // style: {
                                        //     borderLeft: 'solid 1px #777777'
                                        // },
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
                                        span: '{{$isV2Component()?5:6}}',
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
                                        span: 5,
                                        className: "{{$isReadOnly()?'':'no-padding'}}",
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
                                            className: "{{data.form.fplyLx==2 && data.form.bdzt && data.form.bdlyLx==1?'ant-form-item-required':''}}",
                                            children: '抵扣月份',
                                        }
                                    },
                                    {
                                        name: 'row2-col6',
                                        component: 'Col',
                                        span: '{{$isV2Component()?5:6}}',
                                        className: "{{$isReadOnly()?'':'no-padding'}}",
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
                                    },
                                ]
                            },
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

            },
            // {
            //  name: 'footer',
            //  component: '::div',
            //  className: 'inv-app-pu-withhold-invoice-card-footer',
            //  children: {
            //      name: 'btn',
            //      component: 'Button',
            //      type: 'primary',
            //      onClick: '{{$onOk}}',
            //      children: '保存'
            //  }
            // }
        ],

    }
}

export function getInitState() {
    return {
        data: {
            loading: true,
            justShow:false,
            form: {

                mxDetailList: [{

                    },
                    {

                    },
                    {

                    },
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
            error: {
                mxDetailList: [{}, {}, {}]
            },
            other: {
                randomKey: 1,
                defaultLength: 3, //默认行数
                taxRates: [],
                defaultPickerValue: null,
            }
        }
    }
}