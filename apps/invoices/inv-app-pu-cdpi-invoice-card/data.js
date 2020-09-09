import moment from "moment";

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-pu-cdpi-invoice-card',
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
                    className: 'inv-app-pu-cdpi-invoice-card-header',
                    children: [{
                            name: 'title',
                            component: '::div',
                            className: 'inv-app-pu-cdpi-invoice-card-header-title',
                            children: '海关完税凭证'
                        },
                        {
                            name: 'form',
                            component: '::div',
                            className: 'inv-app-pu-cdpi-invoice-card-header-form',
                            children: {
                                name: 'item3',
                                component: '::div',
                                className: 'inv-app-pu-cdpi-invoice-card-header-form-item',
                                children: [{
                                        name: 'label',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"inv-app-pu-cdpi-invoice-card-header-form-item-label ":"inv-app-pu-cdpi-invoice-card-header-form-item-label ant-form-item-required"}}',
                                        // children: {
                                        //  name: 'tooltip',
                                        //  component: 'Tooltip',
                                        //  getPopupContainer: '{{$handleGetPopupContainer}}',
                                        //  placement: 'left',
                                        //  overlayClassName: 'has-error-tooltip',
                                        //  title: '{{data.error.kprq}}',
                                        //  visible: '{{data.error.kprq}}',
                                        //  children: '开票日期：'
                                        // },
                                        children: '开票日期：'
                                    },
                                    {
                                        name: 'value',
                                        component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                        defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                        disabledDate: '{{$disabledDateQ}}',
                                        value: '{{$isReadOnly()?(data.form.kprq?data.form.kprq.format("YYYY-MM-DD"):""):data.form.kprq}}',
                                        disabled: '{{$notAllowEdit()}}',
                                        placeholder: '',
                                        onChange: '{{function(date,dateString){$handleFieldChangeV("data.form.kprq",date,true)}}}',
                                        className: '{{data.error.kprq?"inv-app-pu-cdpi-invoice-card-header-form-item-value has-error":"inv-app-pu-cdpi-invoice-card-header-form-item-value"}}',
                                    },
                                ]
                            },
                        },
                        {
                            name: 'form2',
                            component: '::div',
                            className: 'inv-app-pu-cdpi-invoice-card-header-form inv-app-pu-cdpi-invoice-card-header-form2',
                            children: {
                                name: 'item3',
                                component: '::div',
                                className: 'inv-app-pu-cdpi-invoice-card-header-form-item',
                                children: [{
                                        name: 'label',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"inv-app-pu-cdpi-invoice-card-header-form-item-label ":"inv-app-pu-cdpi-invoice-card-header-form-item-label ant-form-item-required"}}',
                                        children: '专用缴款书号码：'
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
                                            value: '{{data.form.fphm}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            maxLength: 22,
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.fphm",e,true)}}}',
                                            placeholder: '',
                                            className: '{{data.error.fphm?"inv-app-pu-cdpi-invoice-card-header-form-item-value has-error":"inv-app-pu-cdpi-invoice-card-header-form-item-value"}}',
                                        },
                                        // name: 'value',
                                        //  component: 'Input',
                                        //  disabled: '{{$notAllowEdit()}}',
                                        //  maxLength: 22,
                                        //  onChange: '{{function(e){$handleFieldChangeE("data.form.fphm",e,true)}}}',
                                        //  placeholder: '',
                                        //  className: '{{data.error.fphm?"inv-app-pu-cdpi-invoice-card-header-form-item-value has-error":"inv-app-pu-cdpi-invoice-card-header-form-item-value"}}',
                                    },
                                ]
                            },
                        }
                    ]
                },
                {
                    name: 'inv-app-pu-cdpi-invoice-card-grid1',
                    className: 'inv-app-pu-cdpi-invoice-card-grid1',
                    component: '::div',
                    children: [{
                            name: 'row1',
                            component: 'Row',
                            className: 'grid-row row1',
                            gutter: 0,
                            children: [{
                                    name: 'row1-col1',
                                    component: 'Col',
                                    span: 3,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        className: 'row-col1-col',
                                        children: '购买方名称'
                                    }
                                },

                                {
                                    name: 'row1-col2',
                                    component: 'Col',
                                    className: 'not-edit-row',
                                    span: 9,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        className: 'row-col1-col',
                                        children: '{{data.form.gfmc}}'
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
                                        children: '纳税人识别号'
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
                                        children: '{{data.form.gfsbh}}'
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
                                    name: 'row2-col1',
                                    component: 'Col',
                                    span: 3,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"row-col1-col ":"row-col1-col"}}',
                                        children: '进口口岸代码'
                                    }
                                },
                                {
                                    name: 'row2-col2',
                                    component: 'Col',
                                    span: 9,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        style: {
                                            padding: 0
                                        },
                                        className: '{{data.error.sf01?"row-col1-col has-error":"row-col1-col"}}',
                                        children: {
                                            name: 'tooltip',
                                            component: 'Tooltip',
                                            placement: 'right',
                                            getPopupContainer: '{{$handleGetPopupContainer}}',
                                            overlayClassName: 'has-error-tooltip',
                                            title: '{{data.error.sf01}}',
                                            visible: '{{data.error.sf01&&data.error.sf01.indexOf("不能为空")===-1}}',
                                            children: {
                                                name: 'input',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                align: '{{$isReadOnly()?"right":""}}',
                                                disabled: '{{$notAllowEdit()}}',
                                                maxLength: 4,
                                                onChange: '{{function(e){$handleFieldChangeE("data.form.sf01",e,true)}}}',
                                                value: '{{data.form.sf01}}'
                                            }
                                        },
                                        // children: {
                                        //  name: 'input',
                                        //  component: 'Input',
                                        //  disabled: '{{$notAllowEdit()}}',
                                        //  maxLength: 4,
                                        //  onChange: '{{function(e){$handleFieldChangeE("data.form.sf01",e,true)}}}',
                                        //  value: '{{data.form.sf01}}'
                                        // }
                                    }
                                },
                                {
                                    name: 'row2-col3',
                                    component: 'Col',
                                    span: 3,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        className: 'row-col1-col',
                                        children: '进口口岸名称'
                                    }
                                },
                                {
                                    name: 'row2-col4',
                                    component: 'Col',
                                    span: 9,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        style: {
                                            padding: 0
                                        },
                                        className: 'row-col1-col',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            align: '{{$isReadOnly()?"right":""}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.sf02",e)}}}',
                                            value: '{{data.form.sf02}}'
                                        }
                                    }
                                }
                            ]
                        },

                        {
                            name: 'row3',
                            component: 'Row',
                            className: 'grid-row',
                            gutter: 0,
                            children: [{
                                    name: 'row3-col1',
                                    component: 'Col',
                                    span: 3,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"row-col1-col ":"row-col1-col"}}',
                                        children: '金额'
                                    }
                                },
                                {
                                    name: 'row3-col2',
                                    component: 'Col',
                                    className: 'not-edit-row',
                                    span: 9,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        className: 'row-col1-col',
                                        children: '{{$sumColumn("je")}}'
                                    }
                                },
                                {
                                    name: 'row3-col3',
                                    component: 'Col',
                                    span: 3,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"row-col1-col ":"row-col1-col ant-form-item-required"}}',
                                        children: '税额'
                                    }
                                },
                                {
                                    name: 'row3-col4',
                                    component: 'Col',
                                    className: 'not-edit-row',
                                    span: 9,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        className: 'row-col1-col',
                                        children: '{{$sumColumn("se")}}'
                                    }
                                }
                            ]
                        },

                        // {
                        //  name: 'row4',
                        //  component: 'Row',
                        //  className: 'grid-row',
                        //  gutter: 0,
                        //  children: [
                        //      {
                        //          name: 'row4-col1',
                        //          component: 'Col',
                        //          span: 3,
                        //          children: {
                        //              name: 'row-col1-col',
                        //              component: '::div',
                        //              className: 'row-col1-col',
                        //              children: '即征即退类型'
                        //          }
                        //      },
                        //      {
                        //          name: 'row4-col2',
                        //          component: 'Col',
                        //          span: 21,
                        //          children: {
                        //              name: 'row-col1-col',
                        //              component: '::div',
                        //              className: 'row-col1-col',
                        //              style: {
                        //                  textAlign: 'left',
                        //                  paddingLeft: 10
                        //              },
                        //              children: {
                        //                  name: 'radiogroup',
                        //                  component: 'Radio.Group',
                        //                  value: '{{data.form.jzjtbz}}',
                        //                  onChange: '{{function(e){$handleFieldChangeE("data.form.jzjtbz",e)}}}',
                        //                  children: [
                        //                      {
                        //                          name: 'radio1',
                        //                          component: 'Radio',
                        //                          disabled: '{{$notAllowEdit()}}',
                        //                          value: 'N',
                        //                          children: '否'
                        //                      },
                        //                      {
                        //                          name: 'radio2',
                        //                          component: 'Radio',
                        //                          disabled: '{{$notAllowEdit()}}',
                        //                          value: 'Y',
                        //                          children: '是'
                        //                      }
                        //                  ]
                        //              }
                        //          }
                        //      }
                        //  ]
                        // }
                    ]
                },
                {
                    name: 'mxDetailList',
                    component: 'DataGrid',
                    className: 'inv-app-pu-cdpi-invoice-card-form-details',
                    headerHeight: 24,
                    rowHeight: 24,
                    rowsCount: '{{data.form.mxDetailList.length}}',
                    key: '{{data.other.randomKey}}',
                    readonly: '{{$isReadOnly() || $notAllowEdit()}}', //不允许增减行
                    enableAddDelrow: true,
                    onAddrow: "{{$addBottomRow('mxDetailList')}}",
                    onDelrow: "{{$delRow('mxDetailList')}}",
                    onKeyDown: '{{$gridKeydown}}',
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
                                className: '{{$isReadOnly()?"":""}}',
                                children: '品名'
                            },
                            cell: {

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
                            }
                        },
                        {
                            name: 'sl',
                            component: 'DataGrid.Column',
                            columnKey: 'sl',
                            width: 120,
                            flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '数量'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                onBlur: '{{$handleCellNumberBlur("sl",_rowIndex)}}',
                                executeBlur: true,
                                onFocus: '{{$handleFocus}}',
                                precision: 6,
                                disabled: '{{$notAllowEdit()}}',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                align: 'right',
                                value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].sl,6,$isFocus(_ctrlPath),false,true)}}',
                                title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].sl,6,false,true)}}',
                                onChange: '{{function(v){$quantityChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        },
                        {
                            name: 'dw',
                            component: 'DataGrid.Column',
                            columnKey: 'dw',
                            width: 60,
                            flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '单位'
                            },
                            cell: {
                                name: 'cell',
                                //component: '{{$isFocus(_ctrlPath) ? "Input" : "DataGrid.TextCell"}}',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                disabled: '{{$notAllowEdit()}}',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                value: '{{data.form.mxDetailList[_rowIndex].dw}}',
                                title: '{{data.form.mxDetailList[_rowIndex].dw}}',
                                onChange: '{{function(e){$handleCellFieldChangeE("dw",_rowIndex,e)}}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        },
                        {
                            name: 'slv',
                            component: 'DataGrid.Column',
                            columnKey: 'slv',
                            width: 60,
                            flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: '{{$isReadOnly()?"":""}}',
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
                                filterOption: '{{function(input, option){return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}}',
                                dropdownMatchSelectWidth: false,
                                dropdownStyle: { width: '125px' },
                                value: '{{!$isReadOnly()?data.form.mxDetailList[_rowIndex].slv:(data.form.mxDetailList[_rowIndex].slv!==undefined&&(data.form.mxDetailList[_rowIndex].slv * 100 +"%")||"")}}',
                                onChange: '{{function(v){$taxRateChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                // _excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
                                _power: '({rowIndex})=>rowIndex',
                            }
                        },
                        {
                            name: 'je',
                            component: 'DataGrid.Column',
                            columnKey: 'je',
                            width: 116,
                            //flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: '{{$isReadOnly()?"":""}}',
                                children: '完税金额'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                executeBlur: true,
                                onBlur: '{{$handleCellNumberBlur("je",_rowIndex)}}',
                                precision: 2,
                                //disabled: '{{$notAllowEdit()}}',
                                disabled: '{{data.form.mxDetailList[_rowIndex].slv === 0.00 ? false : true}}',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                align: 'right',
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].je?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].je,2,$isFocus(_ctrlPath),false,true)}}',
                                title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].je,2,false,false)}}',
                                onChange: '{{function(v){$amountChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        },
                        {
                            name: 'se',
                            component: 'DataGrid.Column',
                            columnKey: 'se',
                            width: 116,
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
                                disabled: '{{$notAllowEdit()}}',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                align: 'right',
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].se?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].se,2,$isFocus(_ctrlPath),false)}}',
                                title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].se,2,false,false)}}',
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
                        },
                    ]
                },
                {
                    name: 'inv-app-pu-cdpi-invoice-card-heji1',
                    className: 'inv-app-pu-cdpi-invoice-card-heji1',
                    component: '::div',
                    _visible: '{{$notXaoGuiMo()}}',
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
                        },
                        {
                            name: 'row2-col3',
                            component: 'Col',
                            className: 'invoice-card-grid-thead',
                            span: 3,
                            _visible: '{{$isV2Component()}}',
                            children: {
                                name: 'row2-col2-div',
                                component: '::div',
                                className: "{{data.form.fplyLx==2 && data.form.bdzt==1?'ant-form-item-required':''}}",
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
                        },
                        {
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
                        disabled:'{{data.justShow}}',
                        component: 'Input',
                        value: '{{data.form.kpr}}',
                        onChange: '{{function(e){$sf("data.form.kpr",e.target.value)}}}'
                    }]
                }
            ]
        }],

    }
}

export function getInitState() {
    return {
        data: {
            justShow:false,
            loading: true,
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