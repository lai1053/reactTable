import moment from "moment";
// import 

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-pu-tourist-transport-invoice-card',
        id: 'inv-app-pu-tourist-transport-invoice-card',
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
                    className: 'inv-app-pu-tourist-transport-invoice-card-header',
                    children: [{
                            name: 'title',
                            component: '::div',
                            className: 'inv-app-pu-tourist-transport-invoice-card-header-title',
                            children: '旅客运输服务抵扣凭证'
                        },
                        {
                            name: 'form',
                            component: '::div',
                            className: 'inv-app-pu-tourist-transport-invoice-card-header-form',
                            children: [
                                {
                                    name: 'item1',
                                    component: '::div',
                                    className: 'inv-app-pu-tourist-transport-invoice-card-header-form-item',
                                    _visible: '{{data.form.kjxh&&data.form.fplyLx==="1"?true:false}}',
                                    children: [{
                                            name: 'label',
                                            component: '::div',
                                            className: 'inv-app-pu-tourist-transport-invoice-card-header-form-item-label',
                                            children: '客票号码'
                                        },
                                        {
                                            name: 'value',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{true}}',
                                            maxLength: 8,
                                            className: 'inv-app-pu-tourist-transport-invoice-card-header-form-item-value',
                                            value: '{{data.form.fphm}}'
                                        }
                                    ]
                                },
                                {
                                    name: 'item2',
                                    component: '::div',
                                    className: 'inv-app-pu-tourist-transport-invoice-card-header-form-item',
                                    _visible:'{{data.form.fphmVisible}}',
                                    children: [{
                                        name: 'label',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"inv-app-pu-tourist-transport-invoice-card-header-form-item-label ":"inv-app-pu-tourist-transport-invoice-card-header-form-item-label ant-form-item-required"}}',
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
                                    },
                                        {
                                            name: 'value',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: true,
                                            maxLength: 8,
                                            className: '{{data.error.fphm?"inv-app-pu-vats-invoice-card-header-form-item-value has-error":"inv-app-pu-vats-invoice-card-header-form-item-value"}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.fphm",e,true)}}}',
                                            value: '{{data.form.fphm}}'
                                        }
                                    ]
                                },
                                {
                                    name: 'item3',
                                    component: '::div',
                                    className: 'inv-app-pu-tourist-transport-invoice-card-header-form-item',
                                    children: [{
                                            name: 'label',
                                            component: '::div',
                                            className: '{{$isReadOnly()?"inv-app-pu-tourist-transport-invoice-card-header-form-item-label ":"inv-app-pu-tourist-transport-invoice-card-header-form-item-label ant-form-item-required"}}',
                                            children: {
                                                name: 'tooltip',
                                                component: 'Tooltip',
                                                placement: 'left',
                                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                                overlayClassName: 'has-error-tooltip',
                                                title: '{{data.error.kprq}}',
                                                visible: '{{data.error.kprq && data.error.kprq.indexOf("不能为空")>=-1}}',
                                                children: '开票日期：',
                                                value: '{{data.form.kprq}}'
                                            }
                                        },
                                        {
                                            name: 'value',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                            disabledDate: '{{$disabledDateQ}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            placeholder: '',
                                            className: '{{data.error.kprq?"inv-app-pu-tourist-transport-invoice-card-header-form-item-value has-error":"inv-app-pu-tourist-transport-invoice-card-header-form-item-value"}}',
                                            onChange: '{{function(date,dateString){$handleFieldChangeV("data.form.kprq",date,true)}}}',
                                            value: '{{$isReadOnly()?(data.form.kprq?data.form.kprq.format("YYYY-MM-DD"):""):data.form.kprq}}',
                                            defaultPickerValue: '{{data.other.defaultPickerValue}}'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'inv-app-pu-tourist-transport-invoice-card-grid1',
                    className: 'inv-app-pu-tourist-transport-invoice-card-grid1',
                    component: '::div',
                    children: [{
                        name: 'row',
                        className: 'grid-row grid-row-container',
                        component: '::div',
                        gutter: 0,
                        children: [{
                                name: 'row-col1',
                                className: 'row-col1',
                                component: '::div',
                                children: {
                                    name: 'row-col1-col',
                                    component: '::div',
                                    className: 'row-col1-col',
                                    children: '纳税人名称'
                                }
                            },
                            {
                                name: 'row-col2',
                                className: 'row-col2',
                                component: '::div',
                                children: {
                                    name: '',
                                    component: '::span',
                                    className: 'row-col2-col',
                                    title: '{{data.form.nsrmc}}',
                                    children: '{{data.form.nsrmc}}'
                                }
                            },
                            {
                                name: 'row-col3',
                                className: 'row-col3',
                                component: '::div',
                                children: {
                                    name: 'row-col3-col',
                                    component: '::div',
                                    className: 'row-col3-col',
                                    children: '纳税人识别号'
                                }
                            },
                            {
                                name: 'row-col4',
                                className: 'row-col4',
                                component: '::div',
                                span: 9,
                                children: {
                                    name: '',
                                    component: '::span',
                                    className: 'row-col4-col',
                                    title: '{{data.form.nsrmc}}',
                                    children: '{{data.form.nsrsbh}}'
                                }
                            }
                        ]
                    }]
                },
                {
                    name: 'mxDetailList',
                    component: 'DataGrid',
                    className: 'inv-app-pu-tourist-transport-invoice-card-form-details',
                    headerHeight: 24,
                    rowHeight: 24,
                    rowsCount: '{{data.form.mxDetailList.length}}',
                    key: '{{data.other.randomKey}}',
                    readonly: '{{ $isReadOnly() || $notAllowEdit()}}', //不允许增减行
                    enableAddDelrow: true,
                    onAddrow: "{{$addBottomRow('mxDetailList')}}",
                    onDelrow: "{{$delRow('mxDetailList')}}",
                    onKeyDown: '{{$gridKeydown}}',
                    style: { minheight: "96px" },
                    ellipsis: true,
                    heightFromRowsCount: true,
                    footerHeight: 24,
                    sequenceFooter: {
                        name: 'footer',
                        component: 'DataGrid.Cell',
                    },
                    columns: [{
                            name: 'mxlx',
                            component: 'DataGrid.Column',
                            columnKey: 'mxlx',
                            width: 168,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                children: '客票类型'
                            },
                            cell: {
                                name: 'cell',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                                optionFilterProp: 'children',
                                filterOption: '{{function(input, option){return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}}',
                                children: '{{$renderTicketTypeSelectOption()}}',
                                value: '{{!$isReadOnly()?data.form.mxDetailList[_rowIndex].mxlx:(((data.other.ticketTypes || []).find(function(f){return f.mxlx===data.form.mxDetailList[_rowIndex].mxlx}) || {}).mxlxMc)}}',
                                title: '{{data.form.mxDetailList[_rowIndex].mxlxMc}}',
                                onChange: '{{function(v){$kplxChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                disabled: '{{$isReadOnly() || $notAllowEdit()}}',
                                _power: '({rowIndex}) => rowIndex',
                                showSearch: true,
                                allowClear: true,
                                enableTooltip: true,
                                dropdownMatchSelectWidth: false,
                                dropdownStyle: { width: '125px' },
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].mxlx?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}'
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'txt-right bg',
                                children: '合计'
                            }
                        },
                        {
                            name: 'mxsf02',
                            component: 'DataGrid.Column',
                            columnKey: 'mxsf02',
                            width: 20,
                            flexGrow: 1,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '旅客姓名'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                value: '{{data.form.mxDetailList[_rowIndex].mxsf02}}',
                                title: '{{data.form.mxDetailList[_rowIndex].mxsf02}}',
                                onChange: '{{function(e){$handleCellFieldChangeV("mxsf02",_rowIndex,e.target.value)}}}',
                                disabled: '{{$isReadOnly() || $notAllowEdit()}}',
                                _power: '({rowIndex}) => rowIndex'
                            }
                        },
                        {
                            name: 'mxsf01',
                            component: 'DataGrid.Column',
                            columnKey: 'mxsf01',
                            width: 95,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '运输服务时间'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                allowClear: true,
                                defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                disabledDate: '{{$disabledDateQ}}',
                                className: 'inv-app-pu-tourist-transport-invoice-card-cell',
                                placeholder: '',
                                format: 'YYYYMMDD',
                                value: '{{$isReadOnly()?(data.form.mxDetailList[_rowIndex].mxsf01?data.form.mxDetailList[_rowIndex].mxsf01.format("YYYYMMDD"):""):data.form.mxDetailList[_rowIndex].mxsf01}}',
                                title: '{{data.form.mxDetailList[_rowIndex].mxsf01}}',
                                onChange: '{{function(date,dateString){$handleCellFieldChangeV("mxsf01",_rowIndex,date,false)}}}',
                                disabled: '{{$isReadOnly() || $notAllowEdit()}}',
                                _power: '({rowIndex}) => rowIndex'
                            }
                        },
                        {
                            name: 'mxnf01',
                            component: 'DataGrid.Column',
                            columnKey: 'mxnf01',
                            width: 115,
                            header: {
                                name: 'header',
                                className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                component: 'DataGrid.Cell',
                                children: '总金额'
                            },
                            cell: {
                                name: 'tooltip',
                                component: 'Tooltip',
                                placement: 'top',
                                _power: '({rowIndex}) => rowIndex',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                overlayClassName: 'has-error-tooltip',
                                title: '总金额应 大于或等于 票价+燃油附加费！',
                                value: '总金额应 大于或等于 票价+燃油附加费！',
                                visible: '{{data.form.mxDetailList[_rowIndex].zjeFlag? true : false }}',
                                children: {
                                    name: 'cell',
                                    component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                    align: 'right',
                                    className: "{{$getCellClassName(_ctrlPath)}}",
                                    style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].mxnf01?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                    precision: 2,
                                    executeBlur: true,
                                    onBlur: '{{$handleCellNumberBlur("mxnf01",_rowIndex)}}',
                                    value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].mxnf01,2,$isFocus(_ctrlPath),false)}}',
                                    title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].mxnf01,2,false,false)}}',
                                    onChange: '{{function(v){$totalCashChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                    disabled: '{{$isReadOnly() || $notAllowEdit()}}',
                                }
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'txt-right',
                                // title: '{{$sumColumnVal("mxnf01")}}',
                                children: '{{$sumColumnVal("mxnf01")}}',
                            },
                        },
                        {
                            name: 'mxnf02',
                            component: 'DataGrid.Column',
                            columnKey: 'mxnf02',
                            width: 85,
                            header: {
                                name: 'header',
                                className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                component: 'DataGrid.Cell',
                                children: '票价'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                align: 'right',
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].mxnf02?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                precision: 2,
                                executeBlur: true,
                                onBlur: '{{$handleCellNumberBlur("mxnf02",_rowIndex)}}',
                                value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].mxnf02,2,$isFocus(_ctrlPath),false)}}',
                                title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].mxnf02,2,false,false)}}',
                                onChange: '{{function(v){$feeChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                disabled: '{{$isReadOnly() || $notAllowEdit()}}',
                                _power: '({rowIndex}) => rowIndex'
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'txt-right',
                                // title: '{{$sumColumnVal("mxnf02")}}',
                                children: '{{$sumColumnVal("mxnf02")}}',
                            },
                        },
                        {
                            name: 'mxnf03',
                            component: 'DataGrid.Column',
                            columnKey: 'mxnf03',
                            width: 95,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                children: '燃油附加费'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                executeBlur: true,
                                onBlur: '{{$handleCellNumberBlur("mxnf03", _rowIndex, true)}}',
                                precision: 2,
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                align: 'right',
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].mxnf03?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].mxnf03,2,$isFocus(_ctrlPath),false)}}',
                                title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].mxnf03,2,false,false)}}',
                                disabled: '{{$isReadOnly() || $isAirPlaneTicket(data.form.mxDetailList[_rowIndex]) || $notAllowEdit()}}',
                                onChange: '{{function(v){$ryfjfChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                _power: '({rowIndex}) => rowIndex'
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'txt-right',
                                // title: '{{$sumColumnVal("mxnf03")}}',
                                // children: '{{data.form.kjxh && $sumColumnVal("mxnf03") === undefined ? "0.00" : $sumColumnVal("mxnf03")}}',
                                children: '{{$sumColumnVal("mxnf03")}}',
                            },
                        },
                        {
                            name: 'je',
                            component: 'DataGrid.Column',
                            columnKey: 'je',
                            width: 115,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '计税金额'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                executeBlur: true,
                                onBlur: '{{$handleCellNumberBlur("je",_rowIndex)}}',
                                precision: 2,
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                align: 'right',
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].je?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].je,2,$isFocus(_ctrlPath),false)}}',
                                title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].je,2,false,false)}}',
                                disabled: '{{true}}',
                                _power: '({rowIndex}) => rowIndex'
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'txt-right',
                                // title: '{{$sumColumnVal("je")}}',
                                children: '{{$sumColumnVal("je")}}',
                            }
                        },
                        {
                            name: 'slv',
                            component: 'DataGrid.Column',
                            columnKey: 'slv',
                            width: 80,
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
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].slv?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                enableTooltip: true,
                                align: 'right',
                                children: '{{$renderTaxRateSelectOption()}}',
                                disabled: '{{$isReadOnly() || (data.form.mxDetailList[_rowIndex].mxlx ? true : false) || $notAllowEdit()}}',
                                dropdownMatchSelectWidth: false,
                                dropdownStyle: { width: '125px' },
                                value: '{{!$isReadOnly()?data.form.mxDetailList[_rowIndex].slv:(data.form.mxDetailList[_rowIndex].slv!==undefined?(data.form.mxDetailList[_rowIndex].slv * 100 +"%"):"")}}',
                                onChange: '{{function(v){$taxRateChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                _power: '({rowIndex}) => rowIndex'
                            }
                        },
                        {
                            name: 'se',
                            component: 'DataGrid.Column',
                            columnKey: 'se',
                            width: 105,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '税额'
                            },
                            cell: {
                                name: 'cell',
                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                executeBlur: true,
                                className: "{{$getCellClassName(_ctrlPath)}}",
                                onBlur: '{{$handleCellNumberBlur("se",_rowIndex)}}',
                                precision: 2,
                                align: 'right',
                                style: '{{data.error.mxDetailList[_rowIndex]&&data.error.mxDetailList[_rowIndex].se?{border:"1px solid #e94033",backgroundColor: "#FFF2F1"}:{}}}',
                                value: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].se,2,$isFocus(_ctrlPath),false)}}',
                                title: '{{$quantityFormat(data.form.mxDetailList[_rowIndex].se,2,false,false)}}',
                                disabled: '{{$isReadOnly() || (data.form.mxDetailList[_rowIndex].se===undefined) || $notAllowEdit()}}',
                                onChange: '{{function(v){$taxChange(_rowIndex,data.form.mxDetailList[_rowIndex],v)}}}',
                                _power: '({rowIndex}) => rowIndex'
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'txt-right',
                                // title: '{{$sumColumnVal("se")}}',
                                children: '{{$sumColumnVal("se")}}',
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
                    name: 'inv-app-pu-tourist-transport-invoice-card-heji2',
                    className: 'inv-app-pu-tourist-transport-invoice-card-heji2',
                    component: '::div',
                    children: [{
                            name: 'col1',
                            component: '::div',
                            className: 'heiji-col cold1',
                            children: {
                                name: 'row2-col2-div',
                                component: '::div',
                                className: "{{data.form.fplyLx==2 && data.form.bdzt?'ant-form-item-required':''}}",
                                children: '申报用途',
                            }
                        },
                        {
                            name: 'col2',
                            component: '::div',
                            className: 'heiji-col cold2',
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
                            name: 'col3',
                            component: '::div',
                            className: "{{data.form.fplyLx==2 && data.form.bdzt && data.form.bdlyLx==1?'heiji-col cold3 ant-form-item-required':'heiji-col cold3'}}",
                            children: '抵扣月份'
                        },
                        {
                            name: 'col4',
                            component: '::div',
                            className: 'heiji-col cold4',
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
                        {
                            name: 'col5',
                            component: '::div',
                            className: "{{data.form.fplyLx==2 && data.form.bdzt?'heiji-col cold5 ant-form-item-required':'heiji-col cold5'}}",
                            children: '有效税额',
                        }, {
                            name: 'col6',
                            component: '::div',
                            className: 'heiji-col cold6',
                            children: {
                                name: 'tooltip',
                                component: 'Tooltip',
                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                placement: 'left',
                                overlayClassName: 'has-error-tooltip',
                                title: '{{data.error.nf06}}',
                                visible: '{{data.form.fplyLx == 2 && data.form.bdzt && data.error.nf06 && data.error.nf06.indexOf("不能为空")===-1}}',
                                children: {
                                    name: 'row2-col4-div',
                                    component: '::div',
                                    className: '{{data.form.fplyLx == 2 && data.form.bdzt && data.error.nf06?"has-error":""}}',
                                    children: {
                                        name: 'nf06',
                                        component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                        executeBlur: true,
                                        onBlur: '{{$handleFormNumberBlur("nf06")}}',
                                        precision: 2,
                                        disabled: '{{$notAllowEditNf06()}}',
                                        align: 'right',
                                        className: "{{$getCellClassName(_ctrlPath)}}",
                                        value: '{{$quantityFormat(data.form.nf06,2,$isFocus(_ctrlPath),false)}}',
                                        title: '{{$quantityFormat(data.form.nf06,2,false,false)}}',
                                        onChange: '{{function(val){$handleFieldChangeV("data.form.nf06",val)}}}',
                                    },
                                }
                            }
                        }
                    ]
                }, {
                    name: 'kpr',
                    className: 'kpr',
                    component: '::div',
                    children: [{
                        name: 'kpr-txt',
                        disabled:'{{data.justShow}}',
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
            sbytcsList: [],
            form: {
                mxDetailList: [
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