export function getMeta() {
    return {
        name: "root",
        component: "Layout",
        className: "purchase-ru-ku-add-alert",
        onMouseDown: "{{$mousedown}}",
        children: [
            {
                name: "ttk-stock-app-spin",
                className: "ttk-stock-app-spin",
                component: "::div",
                _visible: "{{data.loading}}",
                children: "{{$stockLoading()}}",
            },
            {
                name: "title",
                component: "::div",
                className: "purchase-ru-ku-add-alert-title",
                children: "{{data.formList.titleName}}",
            },
            {
                name: "form1",
                component: "::div",
                className: "purchase-ru-ku-add-alert-form",
                children: [
                    {
                        name: "form-item",
                        component: "::div",
                        className: "purchase-ru-ku-add-alert-form-item",
                        children: [
                            {
                                name: "label",
                                component: "::span",
                                className: "purchase-ru-ku-add-alert-form-item-label",
                                children: "单据编号：",
                            },
                            {
                                name: "wrapper",
                                component: "::div",
                                className: "purchase-ru-ku-add-alert-form-item-control-wrapper",
                                children: [
                                    {
                                        name: "value",
                                        component: "::span",
                                        children: "{{data.form.code}}",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        name: "form-item",
                        component: "::div",
                        className: "purchase-ru-ku-add-alert-form-item",
                        children: [
                            {
                                name: "label",
                                component: "::span",
                                className: "purchase-ru-ku-add-alert-form-item-label",
                                children: "往来单位：",
                            },
                            {
                                name: "wrapper",
                                component: "::div",
                                className: "purchase-ru-ku-add-alert-form-item-control-wrapper lg",
                                title: "{{data.form.supplierName}}",
                                children: [
                                    {
                                        name: "input",
                                        component: "Select",
                                        className:
                                            "{{data.other.error.supplierName?'-sales-error':''}}",
                                        style: { border: "none", width: "100%" },
                                        showSearch: true,
                                        filterOption: "{{$filterIndustry}}",
                                        value: "{{data.form.supplierName}}",
                                        onSelect:
                                            "{{function(e){$selectOption('data.form.supplierName',e)}}}",
                                        children: "{{$getSelectOption()}}",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                name: "form2",
                component: "::div",
                className: "purchase-ru-ku-add-alert-form",
                children: [
                    {
                        name: "form-item",
                        component: "::span",
                        className: "purchase-ru-ku-add-alert-form-item",
                        children: [
                            {
                                name: "label",
                                component: "::div",
                                className:
                                    "purchase-ru-ku-add-alert-form-item-label ant-form-item-required",
                                children: "{{data.formList.rkriqi+'：'}}",
                            },
                            {
                                name: "wrapper",
                                component: "::div",
                                className: "purchase-ru-ku-add-alert-form-item-control-wrapper",
                                children: [
                                    {
                                        name: "cdate",
                                        component: "DatePicker",
                                        value:
                                            "{{$stringToMoment((data.form.cdate),'YYYY-MM-DD')}}",
                                        disabledDate: "{{$disabledDate}}",
                                        className: "{{data.other.error.cdate?'-sales-error':''}}",
                                        onChange:
                                            "{{function(v){$sf('data.form.cdate', $momentToString(v,'YYYY-MM-DD'))}}}",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        name: "form-item",
                        component: "::div",
                        className: "purchase-ru-ku-add-alert-form-item",
                        children: [
                            {
                                name: "label",
                                component: "::span",
                                className: "purchase-ru-ku-add-alert-form-item-label",
                                children: "发票号码：",
                            },
                            {
                                name: "wrapper",
                                component: "::div",
                                className: "purchase-ru-ku-add-alert-form-item-control-wrapper",
                                children: [
                                    {
                                        _visible:
                                            "{{!(data.type==undefined ||data.type==1 ||data.type==3||data.type==6)}}",
                                        name: "value",
                                        component: "::span",
                                        children: "{{data.form.invNo}}",
                                    },
                                    {
                                        _visible:
                                            "{{data.type==undefined ||data.type==1 ||data.type==3 ||data.type==6}}",
                                        name: "tooltip",
                                        component: "Tooltip",
                                        overlayClassName: "-sales-error-toolTip",
                                        title: "发票号码为8位数字",
                                        visible: "{{data.other.error.invNo}}",
                                        placement: "left",
                                        children: {
                                            name: "invNo",
                                            component: "Input",
                                            maxLength: 8,
                                            value: "{{data.form.invNo}}",
                                            className:
                                                "{{data.other.error.invNo?'-sales-error':''}}",
                                            onChange:
                                                "{{function(e){$invNoChange({value:e.target.value})}}}",
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        name: "form-item",
                        component: "::div",
                        className: "purchase-ru-ku-add-alert-form-item",
                        children: [
                            {
                                name: "label",
                                component: "::span",
                                className:
                                    "purchase-ru-ku-add-alert-form-item-label ant-form-item-required",
                                children:
                                    "{{(data.formList.titleName == '采购入库单' ? '贷方科目' : '借方科目')+'：'}}",
                            },
                            {
                                name: "wrapper",
                                component: "::div",
                                className: "purchase-ru-ku-add-alert-form-item-control-wrapper lg",
                                children: [
                                    {
                                        name: "accountName",
                                        component: "Select",
                                        style: { border: "none", width: "100%" },
                                        showSearch: true,
                                        filterOption: "{{$filterIndustry}}",
                                        onSelect: "{{function(v){$selectAccount(v)}}}",
                                        value: "{{data.form.accountName}}",
                                        className:
                                            "{{data.other.error.accountName?'-sales-error':''}}",
                                        children: {
                                            name: "selectItem",
                                            component: "Select.Option",
                                            value:
                                                "{{data.form.accountList && data.form.accountList[_rowIndex].id}}",
                                            children:
                                                "{{data.form.accountList && data.form.accountList[_rowIndex].codeAndName}}",
                                            title:
                                                "{{data.form.accountList && data.form.accountList[_rowIndex].codeAndName}}",
                                            _power: "for in data.form.accountList",
                                        },
                                        dropdownFooter: {
                                            name: "add",
                                            type: "default",
                                            component: "::div",
                                            className: "stock-app-select-add-btn",
                                            children: [
                                                {
                                                    name: "addIcon",
                                                    component: "::i",
                                                    className: "add-img",
                                                    fontFamily: "edficon",
                                                    type: "xinzengkemu",
                                                },
                                                "新增科目",
                                            ],
                                            onClick: "{{$addSubject()}}",
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                name: "content",
                component: "Layout",
                children: [
                    {
                        name: "details",
                        component: "DataGrid",
                        ellipsis: true,
                        className: "purchase-ru-ku-add-alert-Body",
                        headerHeight: 35,
                        rowHeight: 35,
                        footerHeight: 35,
                        rowsCount: "{{data.form.details.length}}",
                        style: { minHeight: 312 },
                        enableSequence: false,
                        key: "stock-app-purchase-and-sales-detail",
                        onKeyDown: "{{$gridKeydown}}",
                        scrollToColumn: "{{data.other.detailsScrollToColumn}}",
                        scrollToRow: "{{data.other.detailsScrollToRow}}",
                        readonly: false,
                        allowResizeColumn: true,
                        columns: [
                            {
                                name: "selectAction",
                                _visible: "{{data.formList.titleName == '销售收入单'}}",
                                component: "DataGrid.Column",
                                columnKey: "select-action",
                                width: 40,
                                align: "center",
                                header: "{{$selectActionHeader()}}",
                                cell: "{{$selectActionCell}}",
                            },
                            {
                                name: "addOrdelete",
                                component: "DataGrid.Column",
                                columnKey: "addOrdelete",
                                width: 42,
                                align: "left",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    className: "dataGrid-tableHeaderNoBoder",
                                    children: "序号",
                                },
                                cell: {
                                    name: "cell",
                                    component: "::div",
                                    children: [
                                        {
                                            name: "icon",
                                            component: "::div",
                                            className: "add-delect-icons",
                                            children: [
                                                {
                                                    name: "add",
                                                    component: "::div",
                                                    className: "add-delete-Icon icon-addRow",
                                                    onClick: "{{$addRow(_rowIndex)}}",
                                                },
                                                {
                                                    name: "delete",
                                                    component: "::div",
                                                    className: "add-delete-Icon icon-deleteRow",
                                                    _visible: "{{$deleteControl()}}",
                                                    onClick: "{{$delRow(_rowIndex)}}",
                                                },
                                                {
                                                    component: "::div",
                                                    className: "text",
                                                    children: "{{$sort(_rowIndex)}}",
                                                },
                                            ],
                                        },
                                    ],
                                    _power: "({rowIndex})=>rowIndex",
                                },
                                footer: {
                                    name: "footer",
                                    component: "DataGrid.Cell",
                                    children: "合计",
                                    title: "合计",
                                },
                            },
                            {
                                name: "code",
                                component: "DataGrid.Column",
                                columnKey: "code",
                                flexGrow: 1,
                                width: 75,
                                align: "left",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    className: "dataGrid-tableHeaderNoBoder",
                                    children: "存货编号",
                                },
                                cell: {
                                    name: "cell",
                                    component: "::div",
                                    style: {
                                        height: "100%",
                                        paddingLeft: "10px",
                                    },
                                    title: "{{data.form.details[_rowIndex].code}}",
                                    value: "{{data.form.details[_rowIndex].code}}",
                                    onChange:
                                        "{{function(e){$sf('data.form.details.' + _rowIndex + '.code', e.target.value)}}}",
                                    children: [
                                        {
                                            component: "::div",
                                            title: "{{data.form.details[_rowIndex].code}}",
                                            children: "{{data.form.details[_rowIndex].code}}",
                                            style: {
                                                height: "100%",
                                                lineHeight: "34px",
                                                textAlign: "left",
                                            },
                                        },
                                        {
                                            component: "::span",
                                            className: "ck-fifo-icon-complete",
                                            _visible:
                                                "{{$showFifoIcon(data.form.details[_rowIndex])}}",
                                        },
                                    ],
                                    _power: "({rowIndex})=>rowIndex",
                                },
                            },
                            {
                                name: "name",
                                component: "DataGrid.Column",
                                columnKey: "name",
                                flexGrow: 1,
                                width: 180,
                                align: "left",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    className: "ant-form-item-required",
                                    children: "存货名称",
                                },
                                cell: {
                                    name: "cell",
                                    align: "left",
                                    component: "::div",
                                    className:
                                        "{{$isFocus(_ctrlPath) ? 'inputSelectonClick tdChme' : 'inputSelectClass tdChme'}}",
                                    children: [
                                        {
                                            name: "input",
                                            component:
                                                "{{$isFocus(_ctrlPath) ? 'SuperSelect' : 'DataGrid.TextCell'}}",
                                            showSearch: true,
                                            className: "selectName",
                                            dropdownMatchSelectWidth: false,
                                            dropdownStyle: {
                                                width: "auto",
                                                fontSize: "12px!important",
                                            },
                                            dropdownMenuStyle: { height: "200px" },
                                            dropdownClassName: "selectNameDivDropdown",
                                            _excludeProps:
                                                "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
                                            title: "{{data.form.details[_rowIndex].name}}",
                                            filterOption: "{{$filterIndustryInventory}}",
                                            value: "{{data.form.details[_rowIndex].name}}",
                                            // lazyload: true,
                                            onSelect:
                                                "{{function(e){$selectOptionInventory(_rowIndex,e,data.form.details[_rowIndex].name)}}}",
                                            children: "{{$getSelectOptionInventory()}}",
                                            isNeedAdd: true,
                                            footerClick: "{{$addStockName}}",
                                        },
                                        {
                                            name: "btn",
                                            component: "::div",
                                            className: "selectMoreName",
                                            children: {
                                                name: "step00",
                                                component: "Icon",
                                                type: "ellipsis",
                                            },
                                            disabled: "{{data.disabled}}",
                                            onClick: "{{$btnClick(_rowIndex)}}",
                                        },
                                    ],
                                    _power: "({rowIndex})=>rowIndex",
                                },
                            },
                            {
                                name: "guige",
                                component: "DataGrid.Column",
                                columnKey: "guige",
                                flexGrow: 1,
                                width: 65,
                                align: "left",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    className: "dataGrid-tableHeader",
                                    children: "规格型号",
                                },
                                cell: {
                                    name: "cell",
                                    align: "left",
                                    component: "DataGrid.TextCell",
                                    title: "{{data.form.details[_rowIndex].guige}}",
                                    value: "{{data.form.details[_rowIndex].guige}}",
                                    onChange:
                                        "{{function(e){$sf('data.form.details.' + _rowIndex + '.guige', e.target.value)}}}",
                                    _power: "({rowIndex})=>rowIndex",
                                },
                            },
                            {
                                name: "unit",
                                component: "DataGrid.Column",
                                columnKey: "unit",
                                flexGrow: 1,
                                width: 65,
                                align: "left",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    className: "dataGrid-tableHeaderNoBoder",
                                    children: "单位",
                                },
                                cell: {
                                    name: "cell",
                                    align: "left",
                                    component: "DataGrid.TextCell",
                                    title: "{{data.form.details[_rowIndex].unit}}",
                                    value: "{{data.form.details[_rowIndex].unit}}",
                                    onChange:
                                        "{{function(e){$sf('data.form.details.' + _rowIndex + '.unit', e.target.value)}}}",
                                    _power: "({rowIndex})=>rowIndex",
                                },
                            },
                            {
                                name: "num",
                                component: "DataGrid.Column",
                                columnKey: "num",
                                flexGrow: 1,
                                width: 65,
                                align: "center",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    className: "ant-form-item-required",
                                    children: "数量",
                                },
                                cell: {
                                    name: "cell",
                                    align: "right",
                                    tip: true,
                                    style: {
                                        textAlign: "right",
                                        height: "100%",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    },
                                    precision: 6,
                                    interceptTab: true,
                                    component:
                                        '{{$isFocus(_ctrlPath) ? "Input.Number" : "DataGrid.TextCell" }} ',
                                    className:
                                        "{{ $isFocus(_ctrlPath)  ? 'inputSelectonClick ybbalance' : $getRowError(data.form.details[_rowIndex],'quantity') + ' ybbalance'}}",
                                    title:
                                        "{{$quantityFormat(data.form.details[_rowIndex].quantity)}}",
                                    value:
                                        "{{$quantityFormat(data.form.details[_rowIndex].quantity)}}",
                                    onBlur:
                                        '{{$calc("quantity", _rowIndex,data.form.details[_rowIndex])}}',
                                    _power: "({rowIndex})=>rowIndex",
                                },
                                footer: {
                                    name: "footer",
                                    component: "DataGrid.Cell",
                                    style: {
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    },
                                    align: "left",
                                    children: '{{$sumColumn("quantity")}}',
                                    title: '{{$sumColumn("quantity")}}',
                                },
                            },
                            {
                                name: "pices",
                                component: "DataGrid.Column",
                                columnKey: "pices",
                                flexGrow: 1,
                                width: 65,
                                align: "center",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    className: "ant-form-item-required",
                                    children: "单价",
                                },
                                cell: {
                                    name: "cell",
                                    align: "right",
                                    style: {
                                        textAlign: "right",
                                        height: "100%",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    },
                                    // placeholder:"请输入单价",
                                    precision: 6,
                                    component:
                                        '{{$isFocus(_ctrlPath) ? "Input.Number" : "DataGrid.TextCell" }} ',
                                    className:
                                        "{{$isFocus(_ctrlPath)  ? 'inputSelectonClick ybbalance' : $getRowError(data.form.details[_rowIndex],'price')+ ' ybbalance'}}",
                                    // timeout: true,
                                    tip: true,
                                    title:
                                        "{{$quantityFormat(data.form.details[_rowIndex].price)}}",
                                    regex: "^([0-9]+)(?:.[0-9]{1,6})?$",
                                    value:
                                        "{{$quantityFormat(data.form.details[_rowIndex].price)}}",
                                    onBlur:
                                        '{{$calc("price", _rowIndex, data.form.details[_rowIndex])}}',
                                    _power: "({rowIndex})=>rowIndex",
                                },
                            },
                            {
                                name: "ybbalance",
                                component: "DataGrid.Column",
                                columnKey: "ybbalance",
                                flexGrow: 1,
                                width: 65,
                                align: "center",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    className: "ant-form-item-required",
                                    children: "金额",
                                },
                                cell: {
                                    name: "cell",
                                    align: "right",
                                    min: 0,
                                    // timeout: true,
                                    style: {
                                        textAlign: "right",
                                        height: "100%",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    },
                                    tip: true,
                                    precision: 2,
                                    interceptTab: true,
                                    component:
                                        '{{$isFocus(_ctrlPath) ? "Input.Number" : "DataGrid.TextCell" }} ',
                                    className:
                                        "{{$isFocus(_ctrlPath)  ? 'inputSelectonClick ybbalance' : $getRowError(data.form.details[_rowIndex],'amount')+' ybbalance'}}",
                                    title:
                                        "{{$quantityFormat(data.form.details[_rowIndex].amount,2)}}",
                                    value:
                                        "{{$quantityFormat(data.form.details[_rowIndex].amount,2)}}",
                                    onBlur:
                                        '{{$calc("amount", _rowIndex,data.form.details[_rowIndex])}}',
                                    _power: "({rowIndex})=>rowIndex",
                                },
                                footer: {
                                    name: "footer",
                                    component: "DataGrid.Cell",
                                    style: {
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    },
                                    className: "mk-datagrid-cellContent-right",
                                    children: '{{$sumColumn("amount")}}',
                                    title: '{{$sumColumn("amount")}}',
                                },
                            },
                            {
                                name: "taxRate",
                                component: "DataGrid.Column",
                                columnKey: "taxRate",
                                flexGrow: 1,
                                width: 65,
                                align: "center",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    children: "税率",
                                },
                                cell: {
                                    name: "cell",
                                    enableTooltip: true,
                                    allowClear: true,
                                    className:
                                        "{{ $isFocus(_ctrlPath)  ? 'inputSelectonClick' : 'inputSelectClass'}}",
                                    component:
                                        "{{$isFocus(_ctrlPath) ? 'Select' : 'DataGrid.TextCell'}}",
                                    style: {
                                        textAlign: "right",
                                        height: "100%",
                                    },
                                    _excludeProps:
                                        "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
                                    title: "{{data.form.details[_rowIndex].taxRateName}}",
                                    value: "{{data.form.details[_rowIndex].taxRateName}}",
                                    defaultValue: "{{data.form.details[_rowIndex].taxRateName}}",
                                    onChange:
                                        '{{$calc("taxRateName", _rowIndex, data.form.details[_rowIndex])}}',
                                    // onInputKeyDown: '{{$inputDown}}',
                                    // onSelect: '{{$inputSelect}}',
                                    _power: "({rowIndex})=>rowIndex",
                                    children: [
                                        {
                                            name: "17",
                                            component: "Select.Option",
                                            value: 17,
                                            children: "17%",
                                        },
                                        {
                                            name: "16",
                                            component: "Select.Option",
                                            value: 16,
                                            children: "16%",
                                        },
                                        {
                                            name: "13",
                                            component: "Select.Option",
                                            value: 13,
                                            children: "13%",
                                        },
                                        {
                                            name: "11",
                                            component: "Select.Option",
                                            value: 11,
                                            children: "11%",
                                        },
                                        {
                                            name: "10",
                                            component: "Select.Option",
                                            value: 10,
                                            children: "10%",
                                        },
                                        {
                                            name: "9",
                                            component: "Select.Option",
                                            value: 9,
                                            children: "9%",
                                        },
                                        {
                                            name: "6",
                                            component: "Select.Option",
                                            value: 6,
                                            children: "6%",
                                        },
                                        {
                                            name: "5",
                                            component: "Select.Option",
                                            value: 5,
                                            children: "5%",
                                        },
                                        {
                                            name: "4",
                                            component: "Select.Option",
                                            value: 4,
                                            children: "4%",
                                        },
                                        {
                                            name: "3",
                                            component: "Select.Option",
                                            value: 3,
                                            children: "3%",
                                        },
                                        {
                                            name: "2",
                                            component: "Select.Option",
                                            value: 2,
                                            children: "2%",
                                        },
                                        {
                                            name: "1.5",
                                            component: "Select.Option",
                                            value: 1.5,
                                            children: "1.5%",
                                        },
                                        {
                                            name: "1",
                                            component: "Select.Option",
                                            value: 1,
                                            children: "1%",
                                        },
                                        {
                                            name: "zero",
                                            component: "Select.Option",
                                            value: "0",
                                            children: "0",
                                        },
                                    ],
                                },
                            },
                            {
                                name: "taxAmount",
                                component: "DataGrid.Column",
                                columnKey: "taxAmount",
                                flexGrow: 1,
                                width: 65,
                                align: "center",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    children: "税额",
                                },
                                cell: {
                                    name: "cell",
                                    align: "right",
                                    style: {
                                        textAlign: "right",
                                        height: "100%",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    },
                                    precision: 2,
                                    component:
                                        "{{$isFocus(_ctrlPath) ? 'Input.Number' : 'DataGrid.TextCell'}}",
                                    className:
                                        "{{$isFocus(_ctrlPath) ? 'inputSelectonClick' : 'inputSelectClass'}}",
                                    title: "{{data.form.details[_rowIndex].tax}}",
                                    value: "{{data.form.details[_rowIndex].tax}}",
                                    onChange:
                                        '{{$calc("tax", _rowIndex,data.form.details[_rowIndex])}}',
                                    _power: "({rowIndex})=>rowIndex",
                                },
                                footer: {
                                    name: "footer",
                                    component: "DataGrid.Cell",
                                    style: {
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    },
                                    className: "mk-datagrid-cellContent-right",
                                    title: '{{$sumColumn("tax")}}',
                                    children: '{{$sumColumn("tax")}}',
                                },
                            },
                            {
                                name: "taxTotal",
                                component: "DataGrid.Column",
                                columnKey: "taxTotal",
                                flexGrow: 1,
                                width: 65,
                                align: "center",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    children: "价税合计",
                                },
                                cell: {
                                    name: "cell",
                                    align: "right",
                                    style: {
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    },
                                    component: "DataGrid.TextCell",
                                    title: "{{data.form.details[_rowIndex].taxInclusiveAmount}}",
                                    value: "{{data.form.details[_rowIndex].taxInclusiveAmount}}",
                                    _power: "({rowIndex})=>rowIndex",
                                },
                                footer: {
                                    name: "footer",
                                    component: "DataGrid.Cell",
                                    style: {
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    },
                                    className: "mk-datagrid-cellContent-right",
                                    children: '{{$sumColumn("taxInclusiveAmount")}}',
                                    title: '{{$sumColumn("taxInclusiveAmount")}}',
                                },
                            },
                            {
                                name: "account",
                                _visible: "{{data.formList.titleName == '销售收入单'}}",
                                component: "DataGrid.Column",
                                columnKey: "account",
                                flexGrow: 1,
                                width: 125,
                                align: "center",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    className: "flex-center ant-form-item-required",
                                    children: [
                                        {
                                            name: "title",
                                            component: "::span",
                                            children: "贷方科目",
                                        },
                                        {
                                            name: "btn",
                                            component: "::span",
                                            className: "batch-setting",
                                            onClick: "{{$batchSetting}}",
                                            children: "",
                                        },
                                    ],
                                },
                                cell: {
                                    name: "cell",
                                    showSearch: true,
                                    enableTooltip: true,
                                    allowClear: true,
                                    filterOption: "{{$filterIndustry}}",
                                    component:
                                        "{{$isFocus(_ctrlPath) ? 'Select' : 'DataGrid.TextCell'}}",
                                    className:
                                        "{{$isFocus(_ctrlPath) ? 'inputSelectonClick' : $getRowError(data.form.details[_rowIndex],'accountId')}}",
                                    style: {
                                        textAlign: "center",
                                        height: "100%",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    },
                                    _excludeProps:
                                        "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
                                    title: "{{data.form.details[_rowIndex].accountName}}",
                                    value: "{{data.form.details[_rowIndex].accountName}}",
                                    onChange: "{{function(v){$selectTableAccount(v, _rowIndex)}}}",
                                    _power: "({rowIndex})=>rowIndex",
                                    children: {
                                        name: "selectItem",
                                        component: "Select.Option",
                                        value: "{{data.form.tableAccountList[_lastIndex].id}}",
                                        children:
                                            "{{data.form.tableAccountList[_lastIndex].codeAndName}}",
                                        title:
                                            "{{data.form.tableAccountList[_lastIndex].codeAndName}}",
                                        _power: "for in data.form.tableAccountList",
                                    },
                                    dropdownFooter: {
                                        name: "add",
                                        type: "default",
                                        component: "::div",
                                        className: "stock-app-select-add-btn",
                                        children: [
                                            {
                                                name: "addIcon",
                                                component: "::i",
                                                className: "add-img",
                                                fontFamily: "edficon",
                                                type: "xinzengkemu",
                                            },
                                            "新增科目",
                                        ],
                                        onClick: "{{$addSubject(_rowIndex)}}",
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            {
                name: "footer-btn",
                component: "::div",
                className: "purchase-ru-ku-add-alert-footer-btn",
                children: [
                    {
                        name: "footer-operator",
                        component: "::div",
                        className: "purchase-ru-ku-add-alert-footer",
                        children: [
                            {
                                name: "nameItem",
                                component: "Form.Item",
                                className: "purchase-ru-ku-add-alert-footer-author",
                                label: "制单人",
                                children: [
                                    {
                                        name: "name",
                                        component: "::span",
                                        className: "",
                                        children: "{{data.form.operater}}",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        name: "btnGroup",
                        component: "::div",
                        className: "purchase-ru-ku-add-alert-footer-btn-btnGroup",
                        children: [
                            {
                                name: "cancel",
                                component: "Button",
                                className: "purchase-ru-ku-add-alert-footer-btn-btnGroup-item",
                                children: "取消",
                                onClick: "{{$onCancel}}",
                            },
                            {
                                _visible: "{{$commonEditable()}}",
                                name: "confirm",
                                component: "Button",
                                className: "purchase-ru-ku-add-alert-footer-btn-btnGroup-item",
                                type: "primary",
                                children: "保存",
                                onClick: "{{function(e){$save('save')}}}",
                            },
                            {
                                _visible: "{{$commonEditable()}}",
                                name: "saveAndNew",
                                component: "Button",
                                className: "purchase-ru-ku-add-alert-footer-btn-btnGroup-item",
                                type: "primary",
                                children: "保存并新增",
                                onClick: "{{function(e){$save('saveAndNew')}}}",
                            },
                        ],
                    },
                ],
            },
        ],
    }
}
export function getInitState() {
    return {
        data: {
            loading: false,
            isEdit: false,
            selectedRowKeys: [],
            selectOptionList: [],
            formList: {
                rkriqi: "",
                titleName: "",
            },
            form: {
                code: "",
                name: "",
                cdate: "",
                rkriqi: "",
                supplierName: "",
                accountName: "",
                accountList: [],
                accountId: "",
                operater: "liucp",
                titleName: "",
                cacheData: [],
                details: [
                    { ...blankDetail, key: 0 },
                    { ...blankDetail, key: 1 },
                    { ...blankDetail, key: 2 },
                    { ...blankDetail, key: 3 },
                    { ...blankDetail, key: 4 },
                    { ...blankDetail, key: 5 },
                    { ...blankDetail, key: 6 },
                ],
                tableAccountList: [],
            },
            type: "",
            other: {
                detailHeight: 8,
                error: {
                    detailsCheck: [],
                },
                taxRate: [
                    {
                        id: "17",
                        taxRate: "0.17",
                        name: "17%",
                    },
                    {
                        id: "16",
                        taxRate: "0.16",
                        name: "16%",
                    },
                    {
                        id: "13",
                        taxRate: "0.13",
                        name: "13%",
                    },
                    {
                        id: "11",
                        taxRate: "0.11",
                        name: "11%",
                    },
                    {
                        id: "10",
                        taxRate: "0.1",
                        name: "10%",
                    },
                    {
                        id: "9",
                        taxRate: "0.09",
                        name: "9%",
                    },
                    {
                        id: "6",
                        taxRate: "0.06",
                        name: "6%",
                    },
                    {
                        id: "5",
                        taxRate: "0.05",
                        name: "5%",
                    },
                    {
                        id: "4",
                        taxRate: "0.04",
                        name: "4%",
                    },
                    {
                        id: "3",
                        taxRate: "0.03",
                        name: "3%",
                    },
                    {
                        id: "2",
                        taxRate: "0.02",
                        name: "2%",
                    },
                    {
                        id: "1.5",
                        taxRate: "0.015",
                        name: "1.5%",
                    },
                    {
                        id: "1",
                        taxRate: "0.01",
                        name: "1%",
                    },
                    {
                        id: "0",
                        taxRate: "0",
                        name: "0",
                    },
                ],
            },
            basic: {
                enableDate: "",
            },
        },
    }
}
export const blankDetail = {
    name: "",
    code: "",
    guige: "",
    unit: "",
    quantity: "",
    price: "",
    amount: "",
}
