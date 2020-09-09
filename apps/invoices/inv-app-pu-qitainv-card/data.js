import moment from "moment";

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-pu-qitainv-card',
        id: 'inv-app-pu-qitainv-card',
        onMouseDown: '{{$mousedown}}',
        children: [{
                name: 'spin',
                component: 'Spin',
                tip: '加载中',
                delay: 0.01,
                spinning: '{{data.loading}}',
                children: [
                    {
                        name: 'head',
                        component: '::div',
                        className: 'inv-app-pu-qitainv-card-header',
                        children: [{
                                name: 'title',
                                component: '::div',
                                className: 'inv-app-pu-qitainv-card-header-title',
                                children: '其它票据'
                            },
                           
                        ]
                    },
                    {
                        name: 'form1',
                        component: '::div',
                        className: 'inv-app-pu-qitainv-card-header-form',
                        children: [
                            {
                                name: 'item2',
                                component: '::div',
                                className: 'inv-app-pu-qitainv-card-header-form-item',
                                children: [
                                    {
                                        name: 'label',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"inv-app-pu-qitainv-card-header-form-item-label ":"inv-app-pu-qitainv-card-header-form-item-label ant-form-item-required"}}',
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
                                        // children:'发票号码：'
                                    },
                                    {
                                        name: 'value',
                                        component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                        disabled: '{{$notAllowEdit()}}',
                                        maxLength: 8,
                                        placeholder:"请输入发票号码",
                                        className: '{{data.error.fphm?"inv-app-pu-qitainv-card-header-form-item-value has-error":"inv-app-pu-qitainv-card-header-form-item-value"}}',
                                        onChange: '{{function(e){$handleFieldChangeE("data.form.fphm",e,true)}}}',
                                        value: '{{data.form.fphm}}'
                                    }
                                ]
                            },
                            {
                                name: 'item3',
                                component: '::div',
                                className: 'inv-app-pu-qitainv-card-header-form-item3',
                                children: [{
                                        name: 'label',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"inv-app-pu-qitainv-card-header-form-item-label ":"inv-app-pu-qitainv-card-header-form-item-label ant-form-item-required"}}',
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
                                        disabledDate: '{{$disabledDateQ}}',
                                        disabled: '{{$notAllowEdit()}}',
                                        placeholder: '请输入开票日期',
                                        defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                        className: '{{data.error.kprq?"inv-app-pu-qitainv-card-header-form-item-value has-error":"inv-app-pu-qitainv-card-header-form-item-value"}}',
                                        onChange: '{{function(date,dateString){$handleFieldChangeV("data.form.kprq",date,true)}}}',
                                        value: '{{$isReadOnly()?(data.form.kprq?data.form.kprq.format("YYYY-MM-DD"):""):data.form.kprq}}',
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        name: 'inv-app-pu-qitainv-card-grid1',
                        className: 'inv-app-pu-qitainv-card-grid1',
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
                                        children: '购买方'
                                    }
                                },
                                {
                                    name: 'row-col2',
                                    component: 'Col',
                                    className: 'row-col2',
                                    span: 11,
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
                                                        className: 'head-grid-item-label',
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
                                                        className: 'head-grid-item-value',
                                                        children: '{{data.form.gfsbh}}'
                                                    },
                                                }
                                            ]
                                        },
                                    ]
                                },
                                {
                                    name: 'row-col1',
                                    component: 'Col',
                                    span: 1,
                                    children: {
                                        name: 'row-col1-col',
                                        component: '::div',
                                        className: 'row-col1-col',
                                        children: '销售方'
                                    }
                                },
                                {
                                    name: 'row-col2',
                                    component: 'Col',
                                    className: 'row-col2',
                                    span: 11,
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
                                                children: {
                                                    name: 'value',
                                                    component: '::div',
                                                    className: '{{data.error.xfmc?"head-grid-item-value-1 has-error":"head-grid-item-value-1"}}',
                                                    children: {
                                                        name: 'input',
                                                        component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                        align: '{{$isReadOnly()?"left":""}}',
                                                        className: '{{$isReadOnly()?"-mx-cell":""}}',
                                                        disabled: '{{$notAllowEdit()}}',
                                                        onChange: '{{function(e){$handleFieldChangeE("data.form.xfmc",e,true)}}}',
                                                        title: '{{data.form.xfmc}}',
                                                        value: '{{data.form.xfmc}}',
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
                                                    className: '{{$isReadOnly()?"head-grid-item-label ":"head-grid-item-label"}}',
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
                                                            className: '{{data.error.xfsbh?"head-grid-item-value-1 has-error":"head-grid-item-value-1"}}',
                                                            children: {
                                                                name: 'input',
                                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                                align: '{{$isReadOnly()?"left":""}}',
                                                                className: '{{$isReadOnly()?"-mx-cell":""}}',
                                                                disabled: '{{$notAllowEdit()}}',
                                                                onChange: '{{function(e){$handleFieldChangeE("data.form.xfsbh",e,true)}}}',
                                                                title: '{{data.form.xfsbh}}',
                                                                value: '{{data.form.xfsbh}}'
                                                            }
                                                        }
                                                    },
                                                }
                                            ]
                                        },
                                    ]
                                },
                            ]
                        }]
                    },
                    {
                        name: 'inv-app-pu-qitainv-card-heji2',
                        className: 'inv-app-pu-qitainv-card-heji2 ',
                        component: '::div',
                        children: [
                            {
                                name: 'col1',
                                component: '::div',
                                className: 'heiji-col cold1-beizhu',
                                children: '备注'
                            },
                            {
                                name: 'col2',
                                component: '::div',
                                className: 'heiji-col cold2-beizhu',
                                children: {
                                    name: 'bz',
                                    disabled:'{{data.justShow}}',
                                    //className: 'kpr-input',
                                    className: '{{$isReadOnly()?"-mx-cell":""}}',
                                    component: 'Input',
                                    value: '{{data.form.bz}}',
                                    onChange: '{{function(e){$sf("data.form.bz",e.target.value)}}}'
                                }
                            },
                            {
                                name: 'col3',
                                component: '::div',
                                className: 'heiji-col cold3',
                                children: '开票人',
                
                            },
                            {
                                name: 'col4',
                                component: '::div',
                                className: 'heiji-col cold3-beizhu',
                                align: 'right',
                                children:{
                                    name: 'kpr-input',
                                    disabled:'{{data.justShow}}',
                                    className: '{{$isReadOnly()?"-mx-cell":""}}',
                                    //className: 'kpr-input',
                                    component: 'Input',
                                    value: '{{data.form.kpr}}',
                                    onChange: '{{function(e){$sf("data.form.kpr",e.target.value)}}}'
                                }
                            },
                        ]
                    },
                    {
                        name: 'mxDetailList',
                        component: 'DataGrid',
                        className: 'inv-app-pu-qitainv-card-form-details',
                        headerHeight: 34,
                        rowHeight: 34,
                        rowsCount: '{{data.form.mxDetailList.length}}',
                        key: '{{data.other.randomKey}}',
                        readonly: '{{$isReadOnly()||$notAllowEdit()}}', //不允许增减行
                        enableAddDelrow: true,
                        onAddrow: "{{$addBottomRow('mxDetailList')}}",
                        onDelrow: "{{$delRow('mxDetailList')}}",
                        onKeyDown: '{{$gridKeydown}}',
                        ellipsis: true,
                        heightFromRowsCount: true,
                        footerHeight: -4,
                        //scrollToColumn: '{{data.other.mxDetailListScrollToColumn}}',
                        //scrollToRow: '{{data.other.mxDetailListScrollToRow}}',
                        columns: [
                            {
                            name: 'xuhao',
                            component: 'DataGrid.Column',
                            columnKey: 'xuhao',
                            width: 38,
                            /* flexGrow: 1,*/
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '序号'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.TextCell',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                value: '{{_rowIndex*1 +1}}',
                                //title: '{{data.form.mxDetailList[_rowIndex]}}',
                                // disabled: '{{$isReadOnly() || $notAllowEdit()}}',
                                _power: '({rowIndex}) => rowIndex'
                            }
                        },{
                                name: 'hwmc',
                                component: 'DataGrid.Column',
                                columnKey: 'hwmc',
                                width: 204,
                                flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                    children: '货物或应税劳务、服务名称'
                                },
                                cell: {

                                    name: 'cell',
                                    className: "{{$getCellClassName(_ctrlPath)}}",
                                    style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].hwmc?{border:"1px solid #e94033",backgroundColor: "#FFF2F1",height:"32px",lineHeight:"32px",overflow: "hidden",borderRadius: "2px"}:{}}}',
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
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'ggxh',
                                component: 'DataGrid.Column',
                                columnKey: 'ggxh',
                                width: 124,
                                //flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '规格型号'
                                },
                                cell: {
                                    name: 'cell',
                                    // component: '{{$isFocus(_ctrlPath) ? "Input" : "DataGrid.TextCell"}}',
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                    align: '{{$isReadOnly()?"left":""}}',
                                    disabled: '{{$notAllowEdit()}}',
                                    className: "{{$getCellClassName(_ctrlPath)}}",
                                    value: '{{data.form.mxDetailList[_rowIndex].ggxh}}',
                                    title: '{{data.form.mxDetailList[_rowIndex].ggxh}}',
                                    onChange: '{{function(e){$handleCellFieldChangeE("ggxh",_rowIndex,e)}}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'dw',
                                component: 'DataGrid.Column',
                                columnKey: 'dw',
                                width: 80,
                                //flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '单位'
                                },
                                cell: {
                                    name: 'cell',
                                    // component: '{{$isFocus(_ctrlPath) ? "Input" : "DataGrid.TextCell"}}',
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                    align: '{{$isReadOnly()?"left":""}}',
                                    disabled: '{{$notAllowEdit()}}',
                                    className: "{{$getCellClassName(_ctrlPath)}}",
                                    value: '{{data.form.mxDetailList[_rowIndex].dw}}',
                                    title: '{{data.form.mxDetailList[_rowIndex].dw}}',
                                    onChange: '{{function(e){$handleCellFieldChangeE("dw",_rowIndex,e)}}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'sl',
                                component: 'DataGrid.Column',
                                columnKey: 'sl',
                                width: 66,
                                //flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '数量'
                                },
                                cell: {
                                    name: 'cell',
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                    executeBlur: true,
                                    onBlur: '{{$handleCellNumberBlur("sl",_rowIndex)}}',
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
                                name: 'dj',
                                component: 'DataGrid.Column',
                                columnKey: 'dj',
                                width: 66,
                                //flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '单价'
                                },
                                cell: {
                                    name: 'cell',
                                    component: 'DataGrid.TextCell',
                                    className: "inv-app-pu-qitainv-card-cell inv-app-pu-qitainv-card-cell-disabled",
                                    align: 'right',
                                    value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].dj,4,false,false,true)}}',
                                    title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].dj,4,false,false)}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'hsje',
                                component: 'DataGrid.Column',
                                columnKey: 'hsje',
                                width: 80,
                                // flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                    children: '含税金额'
                                },
                                cell: {
                                    name: 'cell',
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                    executeBlur: true,
                                    onBlur: '{{$handleCellNumberBlur("hsje",_rowIndex)}}',
                                    precision: 2,
                                    disabled: '{{$notAllowEdit()}}',
                                    className: "{{$getCellClassName(_ctrlPath)}}",
                                    align: 'right',
                                    style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].je?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                    value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].hsje,2,$isFocus(_ctrlPath),false)}}',
                                    title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].hsje,2,false,false)}}',
                                    onChange: '{{function(v){$hsAmountChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            },
                            {
                                name: 'je',
                                component: 'DataGrid.Column',
                                columnKey: 'je',
                                width: 80,
                                // flexGrow: 1,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    //className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                    children: '不含税金额'
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
                                    className: "{{$getCellClassName(_ctrlPath)}}",
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                                    optionFilterProp: 'children',
                                    filterOption: '{{function(input, option){return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}}',
                                    //className: "inv-app-pu-qitainv-card-cell",
                                    style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].slv?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                    enableTooltip: true,
                                    align: 'right',
                                    disabled: '{{$notAllowEdit()}}',
                                    children: '{{$renderSelectOption()}}',
                                    showSearch: true,
                                    allowClear: true,
                                    dropdownMatchSelectWidth: false,
                                    dropdownStyle: { width: '125px' },
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
                                width: 80,
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
                                    disabled: '{{(data.form.mxDetailList[_rowIndex].se===undefined)||$notAllowEdit()}}',
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
                            }
                        ]
                    },
                    {
                        name: 'inv-app-pu-qitainv-card-heji1',
                        className: 'inv-app-pu-qitainv-card-heji1',
                        component: '::div',
                        children: [{
                                name: 'col1',
                                component: '::div',
                                className: 'heiji-col col1 ',
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
                                className: 'heiji-col col4',
                                align: 'right',
                                title: '{{$sumColumn("hsje")}}',
                                children: '{{$sumColumn("hsje")}}',
                            },
                            {
                                name: 'col3',
                                component: '::div',
                                className: 'heiji-col col4',
                                align: 'right',
                                title: '{{$amountTotal()}}',
                                children: '{{$amountTotal()}}',
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
                                className: 'heiji-col col4',
                                align: 'right',
                                title: '{{$taxAmountTotal()}}',
                                children: '{{$taxAmountTotal()}}',
                            },   {
                                name: 'col4',
                                component: '::div',
                                className: 'heiji-col col4-1',
                                children: ''
                            },
                        ]
                    },
                    {
                        name: 'inv-app-pu-qitainv-card-heji2',
                        className: 'inv-app-pu-qitainv-card-heji2 ',
                        component: '::div',
                        children: [
                            {
                                name: 'col1',
                                component: '::div',
                                className: 'heiji-col cold1',
                                children: '价税合计(大写)'
                            },
                            {
                                name: 'col2',
                                component: '::div',
                                className: 'heiji-col cold2',
                                children: '{{$moneyToBig(true)}}'
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
                                align: 'right',
                                children: '{{$moneyToBig(false)}}'
                            },
                            {
                                name: 'col4',
                                component: '::div',
                                className: 'heiji-col col4-1',
                                children: ''
                            },
                        ]
                    },
                ]
            },
            
        ]
    }
}

export function getInitState() {
    return {
        data: {
            loading: true,
            justShow:false,
            helpTooltip:'带入原正数发票的明细清单',
            form: {
                mxDetailList: [
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {}
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
                defaultLength: 8, //默认行数
                taxRates: [],
                defaultPickerValue: null,
            },
            error: {
                mxDetailList: [{}, {}, {}]
            }
        }
    }
}