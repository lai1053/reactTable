// import { consts, common } from "edf-constant"
// import moment from "moment"
// import { fromJS } from "immutable"

export function getMeta() {
    return {
        name: "root",
        component: "Layout",
        className: "purchase-ru-ku-add-alert-new",
        id: "ttk-scm-app-proceeds-card",
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
                name: "header",
                component: "Layout",
                className: "-header",
                children: [
                    {
                        name: "title",
                        component: "::div",
                        className: "title",
                        children: "{{data.formList.titleName}}",
                    },
                    {
                        name: "form",
                        component: "Form",
                        className: "-modal-form",
                        children: [
                            {
                                name: "codeItem",
                                component: "Form.Item",
                                className: "{{data.other.error.code?'-sales-error':''}}",
                                label: "单据编号",
                                children: [
                                    {
                                        name: "code",
                                        component: "::div",
                                        children: "{{data.form.code}}",
                                    },
                                ],
                            },
                            {
                                name: "enableDate",
                                component: "Form.Item",
                                label: "{{data.formList.rkriqi}}",
                                required: "{{$dateEditable()?true:false}}",
                                className:
                                    "{{'enableDate'+(data.other.error.cdate?'-sales-error':'')}}",
                                children: [
                                    {
                                        name: "input",
                                        component: "DatePicker",
                                        _visible: "{{$dateEditable()}}",
                                        value:
                                            "{{$stringToMoment((data.form.cdate),'YYYY-MM-DD')}}",
                                        disabledDate: "{{$getDisabledDate}}",
                                        onChange:
                                            "{{function(v){$sf('data.form.cdate', $momentToString(v,'YYYY-MM-DD'))}}}",
                                    },
                                    {
                                        name: "input",
                                        _visible: "{{!$dateEditable()}}",
                                        component: "::div",
                                        readonly: "readonly",
                                        children: "{{data.form.cdate}}",
                                    },
                                ],
                            },
                            {
                                name: "invNo",
                                component: "Form.Item",
                                label: "发票号码",
                                className: "",
                                children: [
                                    {
                                        _visible: "{{!$invNoEditRule()}}",
                                        name: "span",
                                        component: "::div",
                                        children: "{{data.form.invNo}}",
                                    },
                                    {
                                        _visible: "{{$invNoEditRule()}}",
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
                                                "{{function(e){$checkinvNo(e.target.value,true)}}}",
                                        },
                                    },
                                ],
                            },
                            {
                                name: "customerName",
                                component: "Form.Item",
                                className: "lg",
                                label: "往来单位",
                                children: [
                                    {
                                        name: "input",
                                        component: "Select",
                                        _visible: "{{$customerNameEditRule()}}",
                                        style: { border: "none", width: "100%" },
                                        showSearch: true,
                                        filterOption: "{{$filterCustomer}}",
                                        value: "{{data.form.customerId}}",
                                        onSelect: "{{$handleCustomerSelect}}",
                                        children: "{{$renderCustomerOption()}}",
                                    },
                                    {
                                        name: "span",
                                        _visible: "{{!$customerNameEditRule()}}",
                                        component: "::div",
                                        readonly: "readonly",
                                        children: "{{data.form.customerName}}",
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
                className: "purchase-ru-ku-add-alert-new-content",
                children: [
                    {
                        name: "details",
                        component: "DataGrid",
                        ellipsis: true,
                        className: "purchase-ru-ku-add-alert-new-Body",
                        headerHeight: 35,
                        rowHeight: 35,
                        footerHeight: 35,
                        rowsCount: "{{data.form.details.length}}",
                        enableSequence: false,
                        startSequence: 1,
                        enableSequenceAddDelrow: "true",
                        sequenceFooter: {
                            name: "footer",
                            component: "DataGrid.Cell",
                            children: "合计",
                        },
                        key: "{{data.other.detailHeight}}",
                        // readonly: "{{($forSpecialGenerate() || !$commonEditable()) ? true : false}}",
                        // readonly: "{{$readonly(data.form.details)}}",
                        onAddrow: "{{$addRow}}",
                        onDelrow: '{{$delRow("details")}}',
                        onUprow: '{{$upRow("details")}}',
                        onDownrow: '{{$downRow("details")}}',
                        onKeyDown: "{{$gridKeydown}}",
                        scrollToColumn: "{{data.other.detailsScrollToColumn}}",
                        scrollToRow: "{{data.other.detailsScrollToRow}}",
                        allowResizeColumn: true,
                        columns: [
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
                                            name: "text",
                                            component: "DataGrid.TextCell",
                                            _visible: "{{$readonly()}}",
                                            value: "{{$sort(_rowIndex)}}",
                                        },
                                        {
                                            name: "icon",
                                            component: "::div",
                                            _visible: "{{!$readonly()}}",
                                            className: "add-delect-icons",
                                            children: [
                                                {
                                                    name: "add",
                                                    component: "::div",
                                                    className: "add-delete-Icon icon-addRow",
                                                    _visible: "{{$addRowRule()}}",
                                                    onClick: "{{$addRow(_rowIndex)}}",
                                                },
                                                {
                                                    name: "delete",
                                                    component: "::div",
                                                    className: "add-delete-Icon icon-deleteRow",
                                                    _visible: "{{$deleteRowRule()}}",
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
                                    // component: "DataGrid.TextCell",
                                    component: "::div",
                                    style: {
                                        height: "100%",
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
                                component: "DataGrid.Column", // 新增
                                columnKey: "name",
                                flexGrow: 1,
                                width: 180,
                                align: "left",
                                header: {
                                    name: "header",
                                    component: "DataGrid.Cell",
                                    className:
                                        "{{data.isReadonly || !$inventoryNameRender()?'':'ant-form-item-required'}}",
                                    children: "存货名称",
                                },
                                cell: {
                                    name: "cell",
                                    align: "left",
                                    component: "::div",
                                    className:
                                        "{{$getRowError('name',_rowIndex,$isFocus(_ctrlPath),data.isReadonly)}}",
                                    children: [
                                        {
                                            name: "input",
                                            component:
                                                "{{$inventoryNameRender() && $isFocus(_ctrlPath) ? 'SuperSelect' : 'DataGrid.TextCell'}}",
                                            showSearch: true,
                                            className: "selectName",
                                            dropdownClassName: "selectNameDivDropdown",
                                            dropdownMatchSelectWidth: false,
                                            dropdownStyle: {
                                                width: "auto",
                                                fontSize: "12px!important",
                                            },
                                            dropdownMenuStyle: { height: "200px" },
                                            _excludeProps:
                                                "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
                                            title: "{{data.form.details[_rowIndex].name}}",
                                            filterOption: "{{$filterIndustryInventory}}",
                                            value: "{{data.form.details[_rowIndex].name}}",
                                            onSearch: "{{$handleSearch}}",
                                            onChange: "{{$handleChange}}",
                                            lazyload: true,
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
                                            _visible:
                                                "{{$inventoryNameRender(data.form.details[_rowIndex])}}",
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
                                    className:
                                        "{{data.isReadonly||!$numRender()?'':'ant-form-item-required'}}",
                                    children: "数量",
                                },
                                cell: {
                                    name: "cell",
                                    align: "left",
                                    timeout: true,
                                    tip: true,
                                    style: {
                                        textAlign: "left",
                                        height: "100%",
                                    },
                                    precision: 6,
                                    interceptTab: true,
                                    component:
                                        "{{$numRender() ? 'Input.Number' : 'DataGrid.TextCell'}}",
                                    className:
                                        "{{$getRowError('quantity',_rowIndex,$isFocus(_ctrlPath),data.isReadonly)}}",
                                    placeholder:
                                        "{{data.form.details[_rowIndex].name !== '' ? data.form.details[_rowIndex].placeholder : ''}}",
                                    title:
                                        "{{$quantityFormat(data.form.details[_rowIndex].quantity)}}",
                                    value:
                                        "{{$quantityFormat(data.form.details[_rowIndex].quantity)}}",
                                    // onChange:
                                    //     "{{$numInput(_rowIndex, data.form.details[_rowIndex])}}",
                                    onBlur:
                                        '{{$isFifo() ? $numChange(_rowIndex, data.form.details[_rowIndex]) : $calc("quantity", _rowIndex, data.form.details[_rowIndex])}}',
                                    _power: "({rowIndex})=>rowIndex",
                                },
                                footer: {
                                    name: "footer",
                                    component: "DataGrid.Cell",
                                    className: "mk-datagrid-cellContent-left",
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
                                    className: "{{$priceRender()?'ant-form-item-required':''}}",
                                    children: "单价",
                                },
                                cell: {
                                    name: "cell",
                                    align: "right",
                                    style: {
                                        textAlign: "right",
                                        height: "100%",
                                    },
                                    precision: 6,
                                    component:
                                        "{{$priceRender() ? 'Input.Number' : 'DataGrid.TextCell'}}",
                                    className:
                                        "{{$getRowError('price',_rowIndex,$isFocus(_ctrlPath),data.isReadonly)}}",
                                    timeout: true,
                                    tip: true,
                                    title:
                                        "{{$quantityFormat(data.form.details[_rowIndex].price)}}",
                                    regex: "^([0-9]+)(?:.[0-9]{1,6})?$",
                                    value:
                                        "{{$quantityFormat(data.form.details[_rowIndex].price)}}",
                                    onBlur:
                                        '{{$calc("price", _rowIndex, data.form.details[_rowIndex])}}',
                                    // onBlur: '{{$priceChangeNew(_rowIndex, data.form.details[_rowIndex].price, data.copy[_rowIndex])}}',
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
                                    className: "{{$amountRender()?'ant-form-item-required':''}}",
                                    children: "金额",
                                },
                                cell: {
                                    name: "cell",
                                    component: "::div",
                                    style: {
                                        height: "100%",
                                    },
                                    children: [
                                        {
                                            // 手
                                            name: "handIcon",
                                            className: "cell-hand",
                                            component: "::span",
                                            _visible:
                                                "{{data.form.details[_rowIndex].type === 2 && $MonthlyOrMove()}}",
                                        },
                                        {
                                            name: "Input",
                                            align: "right",
                                            component:
                                                "{{$amountRender() ? 'Input.Number' : 'DataGrid.TextCell'}}",
                                            min: 0,
                                            timeout: true,
                                            style: {
                                                textAlign: "right",
                                                height: "100%",
                                            },
                                            tip: true,
                                            precision: 2,
                                            interceptTab: true,
                                            className:
                                                "{{$getRowError('amount',_rowIndex,$isFocus(_ctrlPath),data.isReadonly)}}",
                                            title:
                                                "{{$quantityFormat(data.form.details[_rowIndex].amount, 2)}}",
                                            value:
                                                "{{$quantityFormat(data.form.details[_rowIndex].amount, 2)}}",
                                            onBlur:
                                                '{{$calc("amount", _rowIndex, data.form.details[_rowIndex])}}',
                                        },
                                    ],
                                    _power: "({rowIndex})=>rowIndex",
                                },
                                footer: {
                                    name: "footer",
                                    component: "DataGrid.Cell",
                                    align: "right",
                                    className: "p-r",
                                    children: '{{$sumColumn("amount")}}',
                                    title: '{{$sumColumn("amount")}}',
                                },
                            },
                        ],
                    },
                ],
            },
            {
                name: "footer-btn",
                component: "::div",
                className: "purchase-ru-ku-add-alert-new-footer-btn",
                children: [
                    {
                        name: "footer-operator",
                        component: "::div",
                        className: "purchase-ru-ku-add-alert-new-footer",
                        children: [
                            {
                                name: "nameItem",
                                component: "Form.Item",
                                style: {
                                    margin: "0px",
                                    overflow: "hidden",
                                    float: "right",
                                },
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
                        className: "purchase-ru-ku-add-alert-new-footer-btn-btnGroup",
                        children: [
                            {
                                name: "cancel",
                                component: "Button",
                                className: "purchase-ru-ku-add-alert-new-footer-btn-btnGroup-item",
                                children: "取消",
                                onClick: "{{$onCancel}}",
                            },
                            {
                                name: "confirm",
                                component: "Button",
                                _visible:
                                    "{{data.voucherIds === null && data.isReadonly !== true}}",
                                className: "purchase-ru-ku-add-alert-new-footer-btn-btnGroup-item",
                                type: "primary",
                                children: "保存",
                                onClick: "{{function(e){$save('save')}}}",
                            },
                            {
                                name: "saveAndNew",
                                component: "Button",
                                _visible: "{{$isNewAdd()}}",
                                className: "purchase-ru-ku-add-alert-new-footer-btn-btnGroup-item",
                                type: "primary",
                                children: "保存并新增",
                                onClick: "{{function(e){$save('saveAndNew')}}}",
                            },
                            {
                                name: "ok",
                                component: "Button",
                                _visible: false,
                                // _visible: "{{(data.voucherIds !== null || data.isReadonly === true) && !data.hideButton}}",
                                className: "purchase-ru-ku-add-alert-new-footer-btn-btnGroup-item",
                                children: "确定",
                                type: "primary",
                                onClick: "{{$onCancel}}",
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
            id: undefined, // 有没id判断是否是有原始数据的状态
            isReadonly: null, // 用来限制当月及以后有没生成凭证
            voucherIds: null, // 有没凭证
            hideButton: false,
            disabledDate: "",
            loading: false,
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
                operater: "",
                titleName: "",
                cacheData: [],
                details: [
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                ],
                tableAccountList: [],
            },
            type: "",
            other: {
                detailHeight: 8,
                error: {},
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
            oldList: [],
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
